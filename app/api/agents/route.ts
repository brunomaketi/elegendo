import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { streamAgent } from '@/lib/anthropic'
import { LIMITES_PLANO } from '@/types'
import type { Agente } from '@/types'

export const runtime = 'nodejs'

const AGENTES_VALIDOS: Agente[] = ['roteirista', 'estrategista', 'copy', 'consciencia']

const MAX_CAMPO = 1000
const MAX_CAMPOS = 10

const rateLimit = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60_000

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
    const clean = value.replace(/<[^>]*>/g, '').replace(/[<>{}]/g, '').trim().slice(0, MAX_CAMPO)
    sanitized[key.slice(0, 50)] = clean
  }
  return sanitized
}

export async function POST(request: NextRequest) {
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

  let geracoesUsadas = 0
  let alerteUpgrade = false

  if (limite !== null) {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('geracoes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('criado_em', inicioMes.toISOString())

    geracoesUsadas = count ?? 0

    if (geracoesUsadas >= limite) {
      return Response.json(
        { error: `Limite de ${limite} gerações/mês atingido. Faça upgrade para continuar.`, upgrade: true },
        { status: 429 }
      )
    }

    const restantes = limite - geracoesUsadas
    if (restantes === 1) {
      alerteUpgrade = true
    }
  }

  let body: { agente: Agente; input: Record<string, string> }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { agente, input } = body

  if (!agente || !AGENTES_VALIDOS.includes(agente)) {
    return Response.json({ error: 'Agente inválido' }, { status: 400 })
  }

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
      'X-Alerte-Upgrade': alerteUpgrade ? '1' : '0',
      'X-Limite-Plano': String(limite ?? 0),
      'Access-Control-Expose-Headers': 'X-Alerte-Upgrade, X-Limite-Plano',
    },
  })
}
