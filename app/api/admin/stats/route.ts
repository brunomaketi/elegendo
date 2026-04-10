import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

// Haiku 4.5: $1 input / $5 output por milhão de tokens
const CUSTO_POR_TOKEN_OUTPUT = 5 / 1_000_000
const CUSTO_POR_TOKEN_INPUT  = 1 / 1_000_000
// Estimativa: ~60% output, ~40% input dos tokens registrados
const CUSTO_MEDIO_POR_TOKEN  = (CUSTO_POR_TOKEN_OUTPUT * 0.6) + (CUSTO_POR_TOKEN_INPUT * 0.4)
const DOLAR_BRL = 5.80 // atualiza conforme necessário

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return Response.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, nome, plano, cargo, cidade, estado, criado_em, atualizado_em')
    .order('criado_em', { ascending: false })

  const { data: geracoes } = await adminClient
    .from('geracoes')
    .select('id, user_id, agente, tokens_usados, criado_em')
    .order('criado_em', { ascending: false })

  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()

  const emailMap: Record<string, string> = {}
  authUsers?.forEach(u => { emailMap[u.id] = u.email ?? '' })

  const statsPorPlano = {
    gratuito:  profiles?.filter(p => p.plano === 'gratuito').length  ?? 0,
    essencial: profiles?.filter(p => p.plano === 'essencial').length ?? 0,
    pro:       profiles?.filter(p => p.plano === 'pro').length       ?? 0,
    agencia:   profiles?.filter(p => p.plano === 'agencia').length   ?? 0,
  }

  const statsPorAgente: Record<string, number> = {}
  geracoes?.forEach(g => {
    statsPorAgente[g.agente] = (statsPorAgente[g.agente] ?? 0) + 1
  })

  const hoje = new Date()
  const geracoesPorDia: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    geracoesPorDia[d.toISOString().slice(0, 10)] = 0
  }
  geracoes?.forEach(g => {
    const key = g.criado_em.slice(0, 10)
    if (geracoesPorDia[key] !== undefined) geracoesPorDia[key]++
  })

  const totalTokens = geracoes?.reduce((acc, g) => acc + (g.tokens_usados ?? 0), 0) ?? 0
  const custoUSD = totalTokens * CUSTO_MEDIO_POR_TOKEN
  const custoBRL = custoUSD * DOLAR_BRL

  // Custo do mês atual
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const geracoesMes = geracoes?.filter(g => g.criado_em >= inicioMes) ?? []
  const tokensMes = geracoesMes.reduce((acc, g) => acc + (g.tokens_usados ?? 0), 0)
  const custoMesUSD = tokensMes * CUSTO_MEDIO_POR_TOKEN
  const custoMesBRL = custoMesUSD * DOLAR_BRL

  return Response.json({
    totais: {
      usuarios: profiles?.length ?? 0,
      geracoes: geracoes?.length ?? 0,
      tokens: totalTokens,
      custoUSD: Math.round(custoUSD * 100) / 100,
      custoBRL: Math.round(custoBRL * 100) / 100,
    },
    mes: {
      geracoes: geracoesMes.length,
      tokens: tokensMes,
      custoUSD: Math.round(custoMesUSD * 100) / 100,
      custoBRL: Math.round(custoMesBRL * 100) / 100,
    },
    statsPorPlano,
    statsPorAgente,
    geracoesPorDia,
    usuarios: profiles?.map(p => ({
      ...p,
      email: emailMap[p.id] ?? '—',
      totalGeracoes: geracoes?.filter(g => g.user_id === p.id).length ?? 0,
    })) ?? [],
    ultimasGeracoes: geracoes?.slice(0, 50).map(g => ({
      ...g,
      email: emailMap[g.user_id] ?? '—',
      nome: profiles?.find(p => p.id === g.user_id)?.nome ?? '—',
    })) ?? [],
  })
}
