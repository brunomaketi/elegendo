import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LIMITES_PLANO } from '@/types'

// ── Agentes ──────────────────────────────────────────────────────
const AGENTES = [
  {
    id: 'roteirista',
    label: 'Roteirista de Reels',
    desc: 'Gera 3 roteiros com gancho e CTA prontos para gravar.',
    cor: '#7B4FD8',
    bg: 'rgba(123,79,216,0.08)',
    dot: '#7B4FD8',
  },
  {
    id: 'estrategista',
    label: 'Estrategista',
    desc: 'Plano de 90 dias, metas e posicionamento de campanha.',
    cor: '#1D9E75',
    bg: 'rgba(29,158,117,0.07)',
    dot: '#1D9E75',
  },
  {
    id: 'copy',
    label: 'Copy Político',
    desc: 'Headlines e copies de alto impacto para anúncios.',
    cor: '#378ADD',
    bg: 'rgba(55,138,221,0.07)',
    dot: '#378ADD',
  },
  {
    id: 'consciencia',
    label: 'Consciência',
    desc: 'Conteúdo educativo para crescer seu alcance orgânico.',
    cor: '#4A3098',
    bg: 'rgba(74,48,152,0.07)',
    dot: '#4A3098',
  },
]

// ── Datas eleitorais 2026 ─────────────────────────────────────────
const DATAS_2026 = [
  { data: '2026-04-21', label: 'Tiradentes',               relevancia: 'alta' },
  { data: '2026-05-01', label: 'Dia do Trabalho',          relevancia: 'alta' },
  { data: '2026-05-10', label: 'Dia das Mães',             relevancia: 'alta' },
  { data: '2026-06-12', label: 'Dia dos Namorados',        relevancia: 'media' },
  { data: '2026-06-24', label: 'São João',                 relevancia: 'alta' },
  { data: '2026-07-09', label: 'Revolução Constitucional', relevancia: 'alta' },
  { data: '2026-09-07', label: 'Independência do Brasil',  relevancia: 'alta' },
  { data: '2026-10-02', label: '1º Turno Eleições',        relevancia: 'critica' },
  { data: '2026-10-25', label: '2º Turno Eleições',        relevancia: 'critica' },
  { data: '2026-11-15', label: 'Proclamação da República', relevancia: 'alta' },
]

// ── Pesquisas TSE (institutos registrados) ─────────────────────────
const INSTITUTOS_TSE = [
  { nome: 'Datafolha',   tipo: 'Nacional',    freq: 'Mensal' },
  { nome: 'Quaest',      tipo: 'Nacional',    freq: 'Quinzenal' },
  { nome: 'AtlasIntel',  tipo: 'Nacional',    freq: 'Semanal' },
  { nome: 'PoderData',   tipo: 'Nacional',    freq: 'Mensal' },
  { nome: 'IPEC/Ipsos',  tipo: 'Nacional',    freq: 'Mensal' },
]

function getDiasRestantes(dataStr: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(dataStr + 'T00:00:00')
  return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function getRelevanciaStyle(relevancia: string, dias: number) {
  if (relevancia === 'critica') return { color: '#C62828', bg: 'rgba(198,40,40,0.08)', label: 'Eleitoral' }
  if (relevancia === 'alta' && dias <= 14) return { color: '#7B4FD8', bg: 'rgba(123,79,216,0.08)', label: `${dias}d` }
  if (relevancia === 'alta') return { color: '#4A3098', bg: 'rgba(74,48,152,0.07)', label: 'Alta' }
  return { color: '#A09CBD', bg: 'rgba(160,156,189,0.1)', label: 'Radar' }
}

// ── Radar de Campanha (SVG puro) ───────────────────────────────────
function RadarCampanha() {
  const cx = 130, cy = 120, r = 85
  const dims = [
    'Presença Digital',
    'Mobilização',
    'Proposta',
    'Território',
    'Engajamento',
    'Alianças',
  ]
  // Benchmark: campanha vencedora
  const bench = [88, 75, 92, 68, 82, 62]
  // Média: campanha comum
  const media = [42, 48, 60, 36, 44, 30]

  const angle = (i: number) => (i * 2 * Math.PI) / dims.length - Math.PI / 2

  const pt = (val: number, i: number) => ({
    x: cx + (r * val / 100) * Math.cos(angle(i)),
    y: cy + (r * val / 100) * Math.sin(angle(i)),
  })

  const gp = (scale: number, i: number) => ({
    x: cx + r * scale * Math.cos(angle(i)),
    y: cy + r * scale * Math.sin(angle(i)),
  })

  const poly = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z'

  const labelDist = r + 22
  const labelPts = dims.map((_, i) => ({
    x: cx + labelDist * Math.cos(angle(i)),
    y: cy + labelDist * Math.sin(angle(i)),
  }))

  return (
    <svg viewBox="0 0 260 240" style={{ width: '100%', maxHeight: 200 }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={dims.map((_, i) => { const p = gp(s, i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')}
          fill="none"
          stroke={s === 1 ? 'rgba(123,79,216,0.18)' : 'rgba(123,79,216,0.08)'}
          strokeWidth={s === 1 ? 1 : 0.7}
        />
      ))}
      {/* Axis lines */}
      {dims.map((_, i) => {
        const p = gp(1, i)
        return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(123,79,216,0.1)" strokeWidth="0.7" />
      })}
      {/* Média polygon */}
      <path d={poly(media.map((v, i) => pt(v, i)))} fill="rgba(160,156,189,0.12)" stroke="rgba(160,156,189,0.4)" strokeWidth="1" strokeDasharray="3,2" />
      {/* Benchmark polygon */}
      <path d={poly(bench.map((v, i) => pt(v, i)))} fill="rgba(123,79,216,0.14)" stroke="#7B4FD8" strokeWidth="1.5" />
      {/* Benchmark dots */}
      {bench.map((v, i) => {
        const p = pt(v, i)
        return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" fill="#7B4FD8" />
      })}
      {/* Labels */}
      {dims.map((d, i) => {
        const p = labelPts[i]
        const anchor = p.x < cx - 4 ? 'end' : p.x > cx + 4 ? 'start' : 'middle'
        return (
          <text key={i} x={p.x.toFixed(1)} y={p.y.toFixed(1)} textAnchor={anchor} dominantBaseline="central" fontSize="9" fill="#6B648C" fontWeight="500" fontFamily="Inter, sans-serif">
            {d}
          </text>
        )
      })}
    </svg>
  )
}

// ── Página principal ───────────────────────────────────────────────
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
  if (!profile?.nome) redirect('/perfil?primeiro_acesso=true')

  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)
  const { count: totalMes }   = await supabase.from('geracoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('criado_em', inicioMes.toISOString())
  const { count: totalGeral } = await supabase.from('geracoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { data: ultimas }     = await supabase.from('geracoes').select('agente, output, criado_em').eq('user_id', user.id).order('criado_em', { ascending: false }).limit(3)

  const plano   = (profile?.plano ?? 'gratuito') as keyof typeof LIMITES_PLANO
  const limite  = LIMITES_PLANO[plano]
  const total   = totalMes ?? 0
  const isGratis = plano === 'gratuito'

  const proximasDatas = DATAS_2026
    .map(d => ({ ...d, dias: getDiasRestantes(d.data) }))
    .filter(d => d.dias >= 0)
    .slice(0, 6)

  const diasPrimTurno = getDiasRestantes('2026-10-02')

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const primeiroNome = profile?.nome?.split(' ')[0] ?? 'Candidato'
  const subInfo = [profile?.cargo, profile?.cidade && profile?.estado ? `${profile.cidade}/${profile.estado}` : profile?.cidade].filter(Boolean).join(' · ')

  return (
    <div style={{ padding: '28px 24px', fontFamily: "var(--font-inter), 'Inter', sans-serif", minHeight: '100vh' }}>
      <style>{`
        .d-kpi { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .d-main { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .d-agents { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .d-lower { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .d-gens { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 900px) {
          .d-kpi { grid-template-columns: repeat(4, 1fr); }
          .d-main { grid-template-columns: 1fr 300px; }
          .d-lower { grid-template-columns: 1fr 1fr; }
          .d-gens { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
        }
        .agent-card {
          display: block;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #EDEAF5;
          padding: 16px;
          text-decoration: none;
          transition: box-shadow 0.15s, transform 0.15s;
        }
        .agent-card:hover {
          box-shadow: 0 4px 18px rgba(123,79,216,0.12);
          transform: translateY(-1px);
        }
        .kpi-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #EDEAF5;
          padding: 16px 18px;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: '#A09CBD', margin: '0 0 4px', textTransform: 'capitalize' }}>{dataHoje}</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1333', margin: 0, letterSpacing: '-0.03em' }}>
            Olá, {primeiroNome}
          </h1>
          {subInfo && (
            <p style={{ color: '#A09CBD', fontSize: 13, margin: '3px 0 0' }}>{subInfo}</p>
          )}
        </div>
        <Link
          href="/agentes/roteirista"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#7B4FD8', color: '#fff', borderRadius: 50, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(123,79,216,0.28)', letterSpacing: '-0.01em' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Criar conteúdo
        </Link>
      </div>

      {/* ── Banner upgrade (gratuito) ── */}
      {isGratis && (
        <div style={{ borderRadius: 14, marginBottom: 24, background: 'linear-gradient(135deg, #2D1B6E 0%, #4A3098 100%)', padding: '18px 22px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Plano gratuito</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#FFD166', background: 'rgba(255,209,102,0.15)', padding: '2px 8px', borderRadius: 20 }}>{total}/5 gerações</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Desbloqueie gerações ilimitadas — a partir de R$ 47/mês
              </p>
            </div>
            <Link href="/planos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#fff', color: '#2D1B6E', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0, letterSpacing: '-0.01em' }}>
              Ver planos
            </Link>
          </div>
          <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((total / 5) * 100, 100)}%`, background: total >= 4 ? '#FFD166' : 'rgba(255,255,255,0.55)', borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="d-kpi" style={{ marginBottom: 24 }}>
        {[
          { label: 'Gerações este mês', value: total.toString(), sub: limite ? `de ${limite} disponíveis` : 'ilimitadas', accent: '#7B4FD8' },
          { label: 'Total gerado',      value: (totalGeral ?? 0).toString(), sub: 'desde o início',       accent: '#378ADD' },
          { label: 'Agentes ativos',    value: '4',                sub: 'todos disponíveis',              accent: '#1D9E75' },
          { label: 'Dias para 1º turno',value: diasPrimTurno.toString(), sub: '2 out 2026',              accent: '#C62828' },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className="kpi-card">
            <p style={{ fontSize: 11, color: '#A09CBD', fontWeight: 500, marginBottom: 8 }}>{label}</p>
            <div style={{ fontSize: 28, fontWeight: 700, color: accent, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
            <p style={{ fontSize: 11, color: '#B4B0CC', marginTop: 4 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Aviso perfil incompleto ── */}
      {!profile?.bio_politica && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 10, border: '1px solid #EDEAF5', marginBottom: 24, borderLeft: '3px solid #7B4FD8' }}>
          <div style={{ flex: 1, fontSize: 13, color: '#1A1333' }}>
            <strong style={{ fontWeight: 600 }}>Perfil incompleto.</strong> Complete sua bio política para que os agentes gerem conteúdo mais preciso.
          </div>
          <Link href="/perfil" style={{ fontSize: 13, fontWeight: 600, color: '#7B4FD8', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Completar perfil
          </Link>
        </div>
      )}

      {/* ── Grid principal: Agentes + Radar ── */}
      <div className="d-main" style={{ marginBottom: 20, alignItems: 'start' }}>
        {/* Agentes */}
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1333', margin: '0 0 12px', letterSpacing: '-0.01em' }}>Agentes de IA</h2>
          <div className="d-agents">
            {AGENTES.map(({ id, label, desc, cor, bg, dot }) => (
              <Link key={id} href={`/agentes/${id}`} className="agent-card">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, marginBottom: 12 }} />
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1333', marginBottom: 4, letterSpacing: '-0.01em' }}>{label}</div>
                <p style={{ fontSize: 12, color: '#A09CBD', lineHeight: 1.5, margin: '0 0 12px' }}>{desc}</p>
                <div style={{ fontSize: 12, fontWeight: 600, color: cor }}>Usar agente →</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Calendário estratégico */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EDEAF5', padding: '18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1333', margin: 0, letterSpacing: '-0.01em' }}>Calendário eleitoral</h2>
            <Link href="/calendario" style={{ fontSize: 12, color: '#7B4FD8', fontWeight: 500 }}>Ver tudo</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {proximasDatas.map(({ data, label, dias, relevancia }) => {
              const estilo = getRelevanciaStyle(relevancia, dias)
              const d = new Date(data + 'T00:00:00')
              const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
              return (
                <div key={data} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9, background: relevancia === 'critica' ? 'rgba(198,40,40,0.04)' : '#FAFAFA', border: `1px solid ${relevancia === 'critica' ? 'rgba(198,40,40,0.12)' : '#F0EDF8'}` }}>
                  <div style={{ textAlign: 'center', minWidth: 34 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: relevancia === 'critica' ? '#C62828' : '#2D1B6E', lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: 9, color: '#A09CBD', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: '#1A1333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: estilo.bg, color: estilo.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {estilo.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Grid inferior: Radar + TSE ── */}
      <div className="d-lower" style={{ marginBottom: 24 }}>
        {/* Radar de campanha */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EDEAF5', padding: '18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1333', margin: 0, letterSpacing: '-0.01em' }}>Radar de Campanha</h2>
              <p style={{ fontSize: 11.5, color: '#A09CBD', margin: '3px 0 0' }}>Parâmetros de campanhas vencedoras vs. média</p>
            </div>
          </div>
          <RadarCampanha />
          <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingTop: 12, borderTop: '1px solid #F0EDF8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 2, background: '#7B4FD8', borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: '#6B648C' }}>Campanha vencedora</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 2, background: '#C4BFD8', borderRadius: 2, borderTop: '1px dashed #C4BFD8', background: 'transparent', borderBottom: '1px dashed #C4BFD8' }} />
              <span style={{ fontSize: 11, color: '#6B648C' }}>Média</span>
            </div>
          </div>
        </div>

        {/* Pesquisas TSE */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EDEAF5', padding: '18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1333', margin: 0, letterSpacing: '-0.01em' }}>Pesquisas Eleitorais</h2>
              <p style={{ fontSize: 11.5, color: '#A09CBD', margin: '3px 0 0' }}>Institutos registrados no TSE — eleições 2026</p>
            </div>
            <a
              href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, fontWeight: 500, color: '#7B4FD8', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              TSE ↗
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {INSTITUTOS_TSE.map(({ nome, tipo, freq }) => (
              <div key={nome} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: '#FAFAFA', border: '1px solid #F0EDF8' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7B4FD8', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1333' }}>{nome}</span>
                  <span style={{ fontSize: 11, color: '#A09CBD', marginLeft: 8 }}>{tipo}</span>
                </div>
                <span style={{ fontSize: 11, color: '#B4B0CC', fontWeight: 400 }}>{freq}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px', background: 'rgba(198,40,40,0.04)', borderRadius: 10, border: '1px solid rgba(198,40,40,0.1)' }}>
            <div style={{ fontSize: 11, color: '#A09CBD', marginBottom: 4, fontWeight: 500 }}>Contagem regressiva</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#C62828', letterSpacing: '-0.04em', lineHeight: 1 }}>{diasPrimTurno}</span>
              <span style={{ fontSize: 13, color: '#A09CBD' }}>dias para o 1º turno</span>
            </div>
            <div style={{ fontSize: 12, color: '#C62828', fontWeight: 500, marginTop: 4 }}>2 de outubro de 2026</div>
          </div>

          <a
            href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, padding: '10px', background: '#FAFAFA', border: '1px solid #EDEAF5', borderRadius: 9, fontSize: 13, fontWeight: 500, color: '#6B648C', textDecoration: 'none' }}
          >
            Ver todas as pesquisas no TSE
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── Últimas gerações ── */}
      {ultimas && ultimas.length > 0 && (
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1333', margin: '0 0 12px', letterSpacing: '-0.01em' }}>Gerado recentemente</h2>
          <div className="d-gens">
            {ultimas.map((g, i) => {
              const ag = AGENTES.find(a => a.id === g.agente)
              return (
                <Link key={i} href={`/historico`} style={{ display: 'block', background: '#fff', border: '1px solid #EDEAF5', borderRadius: 12, padding: 14, textDecoration: 'none', borderLeft: `3px solid ${ag?.dot ?? '#7B4FD8'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1333' }}>{ag?.label ?? g.agente}</span>
                    <span style={{ fontSize: 11, color: '#B4B0CC' }}>{new Date(g.criado_em).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#A09CBD', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                    {g.output.slice(0, 110)}…
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
