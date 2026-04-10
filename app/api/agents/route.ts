import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { streamAgent } from '@/lib/anthropic'
import { LIMITES_PLANO } from '@/types'
import type { Agente } from '@/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

  const body = await request.json()
  const { agente, input }: { agente: Agente; input: Record<string, string> } = body

  if (!agente || !input) {
    return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  let fullOutput = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await streamAgent({
          agente,
          input,
          profile,
          plano, // ← passa o plano para escolher o modelo certo
          onChunk: (text) => {
            fullOutput += text
            controller.enqueue(encoder.encode(text))
          },
        })
        await supabase.from('geracoes').insert({
          user_id: user.id,
          agente,
          input,
          output: fullOutput,
          tokens_usados: result.tokens,
          modelo: result.modelo, // ← salva qual modelo foi usado
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
