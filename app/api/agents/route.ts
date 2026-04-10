import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { streamAgent } from '@/lib/anthropic'
import { LIMITES_PLANO } from '@/types'
import type { Agente } from '@/types'

export const runtime = 'nodejs'

// Agentes válidos — whitelist explícita
const AGENTES_VALIDOS: Agente[] = ['roteirista', 'estrategista', 'copy', 'consciencia']

// Limite de tamanho de input por campo (caracteres)
const MAX_CAMPO = 1000
const MAX_CAMPOS = 10

// Rate limit simples em memória (por IP)
const rateLimit = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT_MAX = 10      // máx 10 requests
const RATE_LIMIT_WINDOW = 60_000 // por minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) return false

  entry.count++
  return true
}

function sanitizeInput(input: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {}
  const entries = Object.entries(input).slice(0, MAX_CAMPOS)

  for (const [key, value] of entries) {
    if (typeof key !== 'string' || typeof value !== 'string') continue
    // Remove tags HTML e limita tamanho
    const clean = value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>{}]/g, '')
      .trim()
      .slice(0, MAX_CAMPO)
    sanitized[key.slice(0, 50)] = clean
  }

  return sanitized
}

export async function POST(request: NextRequest) {
  // Rate limiting por IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    return Response.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  const plano = profile.plano ?? 'gratuito'
  const limite = LIMITES_PLANO[plano as keyof typeof LIMITES_PLANO]

  if (limite !== null) {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('geracoes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('criado_em', inicioMes.toISOString())

    if ((count ?? 0) >= limite) {
      return Response.json(
        { error: `Limite de ${limite} gerações/mês atingido. Faça upgrade para continuar.`, upgrade: true },
        { status: 429 }
      )
    }
  }

  let body: { agente: Agente; input: Record<string, string> }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { agente, input } = body

  // Valida agente contra whitelist
  if (!agente || !AGENTES_VALIDOS.includes(agente)) {
    return Response.json({ error: 'Agente inválido' }, { status: 400 })
  }

  // Valida e sanitiza input
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return Response.json({ error: 'Input inválido' }, { status: 400 })
  }

  const inputSanitizado = sanitizeInput(input)

  const encoder = new TextEncoder()
  let fullOutput = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await streamAgent({
          agente,
          input: inputSanitizado,
          profile,
          plano,
          onChunk: (text) => {
            fullOutput += text
            controller.enqueue(encoder.encode(text))
          },
        })
        await supabase.from('geracoes').insert({
          user_id: user.id,
          agente,
          input: inputSanitizado,
          output: fullOutput,
          tokens_usados: result.tokens,
          modelo: result.modelo,
        })
        controller.close()
      } catch (err) {
        console.error('[agent error]', err)
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
