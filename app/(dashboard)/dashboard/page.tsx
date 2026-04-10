import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const AGENTES = [
  { id: 'roteirista',   label: 'Roteirista de Reels',     icon: '🎬', cor: '#7B4FD8', bg: 'rgba(123,79,216,0.08)', desc: 'Gera 3 roteiros com gancho e CTA.' },
  { id: 'estrategista', label: 'Estrategista',            icon: '🧠', cor: '#1D9E75', bg: 'rgba(29,158,117,0.08)', desc: 'Plano de 90 dias para sua campanha.' },
  { id: 'copy',         label: 'Copy Político',           icon: '✍️', cor: '#378ADD', bg: 'rgba(55,138,221,0.08)', desc: 'Headlines e copies para anúncios.' },
  { id: 'consciencia',  label: 'Consciência',             icon: '📊', cor: '#2D1B6E', bg: 'rgba(45,27,110,0.08)', desc: 'Conteúdo para o @sejaelegendo.' },
]

const LIMITES: Record<string, number | null> = { gratuito: 5, essencial: 50, pro: null }

const DATAS_2026 = [
  { data: '2026-04-21', label: 'Tiradentes',                emoji: '⚔️',  relevancia: 'alta' },
  { data: '2026-04-22', label: 'Dia da Terra',              emoji: '🌍', relevancia: 'media' },
  { data: '2026-05-01', label: 'Dia do Trabalho',           emoji: '✊', relevancia: 'alta' },
  { data: '2026-05-10', label: 'Dia das Mães',              emoji: '💐', relevancia: 'alta' },
  { data: '2026-05-15', label: 'Dia do Municipal',          emoji: '🏛️',  relevancia: 'alta' },
  { data: '2026-06-05', label: 'Dia do Meio Ambiente',      emoji: '🌿', relevancia: 'media' },
  { data: '2026-06-12', label: 'Dia dos Namorados',         emoji: '❤️',  relevancia: 'media' },
  { data: '2026-06-13', label: 'Corpus Christi',            emoji: '⛪', relevancia: 'media' },
  { data: '2026-06-24', label: 'São João',                  emoji: '🎆', relevancia: 'alta' },
  { data: '2026-07-09', label: 'Revolução Constitucional',  emoji: '📜', relevancia: 'alta' },
  { data: '2026-08-11', label: 'Dia do Estudante',          emoji: '🎓', relevancia: 'media' },
  { data: '2026-09-07', label: 'Independência do Brasil',   emoji: '🇧🇷', relevancia: 'alta' },
  { data: '2026-10-02', label: '1º Turno Eleições',         emoji: '🗳️',  relevancia: 'critica' },
  { data: '2026-10-12', label: 'Nossa Sra. Aparecida',      emoji: '🙏', relevancia: 'alta' },
  { data: '2026-10-25', label: '2º Turno Eleições',         emoji: '🗳️',  relevancia: 'critica' },
  { data: '2026-11-02', label: 'Finados',                   emoji: '🕯️',  relevancia: 'media' },
  { data: '2026-11-15', label: 'Proclamação da República',  emoji: '🏛️',  relevancia: 'alta' },
  { data: '2026-11-20', label: 'Consciência Negra',         emoji: '✊🏿', relevancia: 'alta' },
  { data: '2026-12-25', label: 'Natal',                     emoji: '🎄', relevancia: 'alta' },
]

function getDiasRestantes(dataStr: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(dataStr + 'T00:00:00')
  return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function getTagData(dias: number, relevancia: string) {
  if (dias === 0) return { label: 'Hoje',     bg: 'rgba(29,158,117,0.12)',  color: '#0F6E56' }
  if (dias < 0)  return { label: 'Passou',   bg: 'rgba(138,138,154,0.12)', color: '#8A8A9A' }
  if (dias <= 7) return { label: `${dias}d`, bg: 'rgba(123,79,216,0.12)',  color: '#5B3BAA' }
  if (relevancia === 'critica') return { label: 'Eleitoral', bg: 'rgba(224,75,74,0.1)',   color: '#C62828' }
  if (relevancia === 'alta')   return { label: 'Em alta',   bg: 'rgba(123,79,216,0.08)', color: '#7B4FD8' }
  return { label: 'No radar', bg: 'rgba(45,27,110,0.06)', color: 'rgba(45,27,110,0.5)' }
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
    <div style={{ padding: '24px 16px', fontFamily: 'var(--font-inter), sans-serif', minHeight: '100vh' }}>
      <style>{`
        .dash-padding { padding: 24px 16px; }
        .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .agents-cal-grid { grid-template-columns: 1fr !important; }
        .agents-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .ultimas-grid { grid-template-columns: 1fr !important; }
        @media (min-width: 768px) {
          .dash-padding { padding: 32px; }
          .kpi-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .agents-cal-grid { grid-template-columns: 1fr 320px !important; }
          .ultimas-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(45,27,110,0.45)', margin: '0 0 3px', textTransform: 'capitalize' }}>{dataHoje}</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2D1B6E', margin: 0, letterSpacing: '-0.01em' }}>
            Olá, {profile?.nome?.split(' ')[0] ?? 'candidato'} 👋
          </h1>
          {(profile?.cargo || profile?.cidade) && (
            <p style={{ color: 'rgba(45,27,110,0.45)', fontSize: 13, margin: '2px 0 0' }}>
              {[profile?.cargo, profile?.cidade && profile?.estado ? `${profile.cidade}/${profile.estado}` : profile?.cidade].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <Link href="/agentes/roteirista" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #7B4FD8 0%, #5B3BAA 100%)', color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(123,79,216,0.3)' }}>
          <span>✨</span> Nova geração
        </Link>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Gerações este mês', value: total.toString(), sub: limite ? `de ${limite} disponíveis` : 'ilimitadas', cor: '#7B4FD8', icon: '⚡' },
          { label: 'Total de gerações', value: (totalGeral ?? 0).toString(), sub: 'desde o início', cor: '#378ADD', icon: '📈' },
          { label: 'Agentes ativos', value: '4', sub: 'todos disponíveis', cor: '#1D9E75', icon: '🤖' },
          { label: 'Próxima data', value: proximasDatas[0]?.dias === 0 ? 'Hoje!' : `${proximasDatas[0]?.dias}d`, sub: proximasDatas[0]?.label ?? '—', cor: '#2D1B6E', icon: '📅' },
        ].map(({ label, value, sub, cor, icon }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.12)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.5)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 16 }}>{icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: cor, lineHeight: 1, marginBottom: 3 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Alerta perfil */}
      {!profile?.bio_politica && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(123,79,216,0.07)', borderRadius: 12, border: '1px solid rgba(123,79,216,0.18)', marginBottom: 20 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚡</span>
          <div style={{ flex: 1, fontSize: 13, color: '#2D1B6E' }}>
            <strong>Complete seu perfil</strong> para conteúdo mais preciso.
          </div>
          <Link href="/perfil" style={{ fontSize: 13, fontWeight: 600, color: '#7B4FD8', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Completar →
          </Link>
        </div>
      )}

      {/* Agentes + Calendário */}
      <div className="agents-cal-grid" style={{ display: 'grid', gap: 16, marginBottom: 20, alignItems: 'start' }}>

        {/* Agentes */}
        <div>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Agentes de IA</h2>
          <div className="agents-grid" style={{ display: 'grid', gap: 10 }}>
            {AGENTES.map(({ id, label, icon, cor, bg, desc }) => (
              <Link key={id} href={`/agentes/${id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 14, padding: 16, boxSizing: 'border-box', cursor: 'pointer' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1B6E', marginBottom: 3 }}>{label}</div>
                  <p style={{ fontSize: 12, color: 'rgba(45,27,110,0.5)', lineHeight: 1.4, margin: '0 0 10px' }}>{desc}</p>
                  <div style={{ fontSize: 12, fontWeight: 600, color: cor }}>Usar agente →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Calendário */}
        <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Calendário estratégico</h2>
            <span style={{ fontSize: 11, color: '#7B4FD8', fontWeight: 700 }}>2026</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proximasDatas.map(({ data, label, emoji, dias, relevancia }) => {
              const tag = getTagData(dias, relevancia)
              const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
              return (
                <div key={data} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: dias <= 7 ? 'rgba(123,79,216,0.06)' : 'rgba(255,255,255,0.5)', borderRadius: 10, border: `1px solid ${dias <= 7 ? 'rgba(123,79,216,0.2)' : 'rgba(123,79,216,0.08)'}` }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2D1B6E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', marginTop: 1 }}>{dataFormatada}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: tag.bg, color: tag.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {tag.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(123,79,216,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(224,75,74,0.07)', borderRadius: 10, border: '1px solid rgba(224,75,74,0.18)' }}>
              <span style={{ fontSize: 16 }}>🗳️</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#C62828' }}>1º Turno — 2 out 2026</div>
                <div style={{ fontSize: 11, color: 'rgba(198,40,40,0.7)' }}>{getDiasRestantes('2026-10-02')} dias restantes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas gerações */}
      {ultimas && ultimas.length > 0 && (
        <div>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Últimas gerações
          </h2>
          <div className="ultimas-grid" style={{ display: 'grid', gap: 10 }}>
            {ultimas.map((g, i) => {
              const ag = AGENTES.find(a => a.id === g.agente)
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: ag?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{ag?.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#2D1B6E' }}>{ag?.label}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)' }}>
                      {new Date(g.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.5)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
