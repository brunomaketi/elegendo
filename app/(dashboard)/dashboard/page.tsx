import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const AGENTES = [
  { id: 'roteirista', label: 'Roteirista de Reels', icon: '🎬', cor: '#C9A84C', desc: 'Gera 3 roteiros com gancho, desenvolvimento e CTA prontos para gravar.' },
  { id: 'estrategista', label: 'Estrategista de Campanha', icon: '🧠', cor: '#1D9E75', desc: 'Diagnóstico completo + plano de comunicação de 90 dias.' },
  { id: 'copy', label: 'Copy Político', icon: '✍️', cor: '#378ADD', desc: 'Headlines, legendas e copies para Meta, Google e TikTok.' },
  { id: 'consciencia', label: 'Consciência do Problema', icon: '📊', cor: '#1A1A2E', desc: 'Conteúdo que cria urgência sobre o custo de não ter estratégia digital.' },
]

const LIMITES: Record<string, number | null> = { gratuito: 5, essencial: 50, pro: null }

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { count: totalMes } = await supabase
    .from('geracoes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('criado_em', inicioMes.toISOString())

  const { data: ultimas } = await supabase
    .from('geracoes')
    .select('agente, output, criado_em')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(3)

  const plano = profile?.plano ?? 'gratuito'
  const limite = LIMITES[plano]
  const total = totalMes ?? 0

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>
            Olá, {profile?.nome?.split(' ')[0] ?? 'candidato'} 👋
          </h1>
          <p style={{ color: '#8A8A9A', fontSize: '14px', margin: 0 }}>
            {profile?.cargo && `${profile.cargo} · `}{profile?.cidade}{profile?.estado && `/${profile.estado}`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#8A8A9A', marginBottom: '2px', textTransform: 'capitalize' }}>Plano {plano}</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E' }}>
            {total}{limite && <span style={{ fontSize: '14px', color: '#8A8A9A', fontWeight: 400 }}>/{limite}</span>}
          </div>
          <div style={{ fontSize: '11px', color: '#8A8A9A' }}>gerações este mês</div>
        </div>
      </div>

      {limite && (
        <div style={{ background: '#E8E0D0', borderRadius: '4px', height: '4px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '4px', background: total / limite > 0.8 ? '#C62828' : '#C9A84C', width: `${Math.min((total / limite) * 100, 100)}%` }} />
        </div>
      )}

      {!profile?.bio_politica && (
        <div style={{ padding: '14px 18px', background: '#FFF8E1', borderRadius: '8px', borderLeft: '3px solid #C9A84C', fontSize: '13px', color: '#633806', marginBottom: '28px' }}>
          Complete seu perfil para que os agentes gerem conteúdo mais preciso.{' '}
          <Link href="/perfil" style={{ fontWeight: 600, color: '#C9A84C' }}>Completar agora →</Link>
        </div>
      )}

      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>Agentes disponíveis</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {AGENTES.map(({ id, label, icon, cor, desc }) => (
          <Link key={id} href={`/agentes/${id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: `1px solid #E8E0D0`, borderTop: `3px solid ${cor}`, borderRadius: '12px', padding: '20px', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', marginBottom: '6px' }}>{label}</div>
              <p style={{ fontSize: '13px', color: '#8A8A9A', lineHeight: '1.5', margin: '0 0 14px' }}>{desc}</p>
              <div style={{ fontSize: '13px', fontWeight: 600, color: cor }}>Usar agente →</div>
            </div>
          </Link>
        ))}
      </div>

      {ultimas && ultimas.length > 0 && (
        <>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>Últimas gerações</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ultimas.map((g, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '10px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '20px', flexShrink: 0 }}>
                  {AGENTES.find(a => a.id === g.agente)?.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                      {AGENTES.find(a => a.id === g.agente)?.label}
                    </span>
                    <span style={{ fontSize: '12px', color: '#8A8A9A' }}>
                      {new Date(g.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#8A8A9A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.output.slice(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
