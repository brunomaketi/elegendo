import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const AGENTES = [
  { id: 'roteirista',   label: 'Roteirista de Reels',      icon: '🎬', cor: '#C9A84C', bg: '#FBF5E6', desc: 'Gera 3 roteiros com gancho e CTA.' },
  { id: 'estrategista', label: 'Estrategista',             icon: '🧠', cor: '#1D9E75', bg: '#E8F8F2', desc: 'Plano de 90 dias para sua campanha.' },
  { id: 'copy',         label: 'Copy Político',            icon: '✍️', cor: '#378ADD', bg: '#E8F1FB', desc: 'Headlines e copies para anúncios.' },
  { id: 'consciencia',  label: 'Consciência',              icon: '📊', cor: '#7C5CBF', bg: '#F0EBF8', desc: 'Conteúdo para o @sejaelegendo.' },
]

const LIMITES: Record<string, number | null> = { gratuito: 5, essencial: 50, pro: null }

const DATAS_2026 = [
  { data: '2026-04-10', label: 'Semana Santa',              emoji: '✝️',  relevancia: 'alta' },
  { data: '2026-04-12', label: 'Páscoa',                   emoji: '🐰', relevancia: 'alta' },
  { data: '2026-04-19', label: 'Dia do Índio',             emoji: '🪶', relevancia: 'media' },
  { data: '2026-04-21', label: 'Tiradentes',               emoji: '⚔️',  relevancia: 'alta' },
  { data: '2026-04-22', label: 'Dia da Terra',             emoji: '🌍', relevancia: 'media' },
  { data: '2026-05-01', label: 'Dia do Trabalho',          emoji: '✊', relevancia: 'alta' },
  { data: '2026-05-10', label: 'Dia das Mães',             emoji: '💐', relevancia: 'alta' },
  { data: '2026-05-15', label: 'Dia do Municipal',         emoji: '🏛️',  relevancia: 'alta' },
  { data: '2026-06-05', label: 'Dia do Meio Ambiente',     emoji: '🌿', relevancia: 'media' },
  { data: '2026-06-12', label: 'Dia dos Namorados',        emoji: '❤️',  relevancia: 'media' },
  { data: '2026-06-13', label: 'Corpus Christi',           emoji: '⛪', relevancia: 'media' },
  { data: '2026-06-24', label: 'São João',                 emoji: '🎆', relevancia: 'alta' },
  { data: '2026-07-09', label: 'Revolução Constitucional', emoji: '📜', relevancia: 'alta' },
  { data: '2026-08-11', label: 'Dia do Estudante',         emoji: '🎓', relevancia: 'media' },
  { data: '2026-09-07', label: 'Independência do Brasil',  emoji: '🇧🇷', relevancia: 'alta' },
  { data: '2026-10-02', label: '1º Turno Eleições',        emoji: '🗳️',  relevancia: 'critica' },
  { data: '2026-10-04', label: 'Dia de São Francisco',     emoji: '🕊️',  relevancia: 'media' },
  { data: '2026-10-12', label: 'Nossa Sra. Aparecida',     emoji: '🙏', relevancia: 'alta' },
  { data: '2026-10-25', label: '2º Turno Eleições',        emoji: '🗳️',  relevancia: 'critica' },
  { data: '2026-11-02', label: 'Finados',                  emoji: '🕯️',  relevancia: 'media' },
  { data: '2026-11-15', label: 'Proclamação da República', emoji: '🏛️',  relevancia: 'alta' },
  { data: '2026-11-20', label: 'Consciência Negra',        emoji: '✊🏿', relevancia: 'alta' },
  { data: '2026-12-25', label: 'Natal',                    emoji: '🎄', relevancia: 'alta' },
]

function getDiasRestantes(dataStr: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(dataStr + 'T00:00:00')
  return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function getTagData(dias: number, relevancia: string) {
  if (dias === 0) return { label: 'Hoje', bg: '#1D9E75', color: '#fff' }
  if (dias < 0)  return { label: 'Passou', bg: '#E8E0D0', color: '#8A8A9A' }
  if (dias <= 7) return { label: `${dias}d`, bg: '#FFF0C8', color: '#8A5A00' }
  if (relevancia === 'critica') return { label: 'Eleitoral', bg: '#FDEAEA', color: '#C62828' }
  if (relevancia === 'alta')   return { label: 'Em alta', bg: '#E8F1FB', color: '#1A5FA8' }
  return { label: 'No radar', bg: '#F0EBF8', color: '#5A3A8A' }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { count: totalMes } = await supabase
    .from('geracoes').select('*', { count: 'exact', head: true })
    .eq('user_id', user.id).gte('criado_em', inicioMes.toISOString())

  const { count: totalGeral } = await supabase
    .from('geracoes').select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: ultimas } = await supabase
    .from('geracoes').select('agente, output, criado_em')
    .eq('user_id', user.id).order('criado_em', { ascending: false }).limit(3)

  const plano = profile?.plano ?? 'gratuito'
  const limite = LIMITES[plano]
  const total = totalMes ?? 0

  const hoje = new Date()
  const proximasDatas = DATAS_2026
    .map(d => ({ ...d, dias: getDiasRestantes(d.data) }))
    .filter(d => d.dias >= 0)
    .slice(0, 5)

  const dataHoje = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '32px 32px', fontFamily: 'var(--font-inter), sans-serif', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '13px', color: '#8A8A9A', margin: '0 0 4px', textTransform: 'capitalize' }}>{dataHoje}</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
            Olá, {profile?.nome?.split(' ')[0] ?? 'candidato'} 👋
          </h1>
          {(profile?.cargo || profile?.cidade) && (
            <p style={{ color: '#8A8A9A', fontSize: '14px', margin: '3px 0 0' }}>
              {[profile?.cargo, profile?.cidade && profile?.estado ? `${profile.cidade}/${profile.estado}` : profile?.cidade].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <Link href="/agentes/roteirista" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1A1A2E', color: '#E8D5A3', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          <span>✨</span> Nova geração
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Gerações este mês', value: total.toString(), sub: limite ? `de ${limite} disponíveis` : 'ilimitadas', cor: '#1A1A2E', icon: '⚡' },
          { label: 'Total de gerações', value: (totalGeral ?? 0).toString(), sub: 'desde o início', cor: '#378ADD', icon: '📈' },
          { label: 'Agentes ativos', value: '4', sub: 'todos disponíveis', cor: '#1D9E75', icon: '🤖' },
          { label: 'Próxima data', value: proximasDatas[0]?.dias === 0 ? 'Hoje!' : `${proximasDatas[0]?.dias}d`, sub: proximasDatas[0]?.label ?? '—', cor: '#C9A84C', icon: '📅' },
        ].map(({ label, value, sub, cor, icon }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: '#8A8A9A', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: '18px' }}>{icon}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: cor, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#8A8A9A' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Alerta perfil */}
      {!profile?.bio_politica && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: '#FFF8E6', borderRadius: '10px', border: '1px solid #F0D080', marginBottom: '28px' }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <div style={{ flex: 1, fontSize: '13px', color: '#633806' }}>
            <strong>Complete seu perfil</strong> para que os agentes gerem conteúdo mais preciso para sua campanha.
          </div>
          <Link href="/perfil" style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Completar agora →
          </Link>
        </div>
      )}

      {/* Calendário + Agentes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>

        {/* Agentes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#8A8A9A', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>Agentes de IA</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {AGENTES.map(({ id, label, icon, cor, bg, desc }) => (
              <Link key={id} href={`/agentes/${id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '18px', boxSizing: 'border-box' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
                    {icon}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>{label}</div>
                  <p style={{ fontSize: '12px', color: '#8A8A9A', lineHeight: '1.5', margin: '0 0 12px' }}>{desc}</p>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: cor }}>Usar agente →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Calendário */}
        <div style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#8A8A9A', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>Calendário estratégico</h2>
            <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 600 }}>2026</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {proximasDatas.map(({ data, label, emoji, dias, relevancia }) => {
              const tag = getTagData(dias, relevancia)
              const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
              return (
                <div key={data} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: dias <= 7 ? '#FFFBF0' : '#FAFAF8', borderRadius: '8px', border: `1px solid ${dias <= 7 ? '#F0D080' : '#F0EBE0'}` }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                    <div style={{ fontSize: '11px', color: '#8A8A9A', marginTop: '1px' }}>{dataFormatada}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: tag.bg, color: tag.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {tag.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F0EBE0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FDEAEA', borderRadius: '8px', border: '1px solid #F9C0C0' }}>
              <span style={{ fontSize: '16px' }}>🗳️</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#C62828' }}>1º Turno — 2 out 2026</div>
                <div style={{ fontSize: '11px', color: '#E24B4A' }}>{getDiasRestantes('2026-10-02')} dias restantes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas gerações */}
      {ultimas && ultimas.length > 0 && (
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#8A8A9A', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 14px' }}>
            Últimas gerações
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {ultimas.map((g, i) => {
              const ag = AGENTES.find(a => a.id === g.agente)
              return (
                <div key={i} style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: ag?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                        {ag?.icon}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>{ag?.label}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#8A8A9A' }}>
                      {new Date(g.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#8A8A9A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.output.slice(0, 100)}...
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
