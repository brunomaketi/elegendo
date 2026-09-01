import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LIMITES_PLANO } from '@/types'

const AGENTES = [
  { id: 'roteirista',   label: 'Roteirista de Reels',  desc: '3 roteiros com gancho e CTA prontos para gravar.',        cor: '#7B4FD8', bgAccent: 'rgba(123,79,216,0.08)' },
  { id: 'estrategista', label: 'Estrategista',          desc: 'Plano de 90 dias, metas e posicionamento de campanha.',   cor: '#1D9E75', bgAccent: 'rgba(29,158,117,0.07)' },
  { id: 'copy',         label: 'Copy Político',         desc: 'Headlines e copies de alto impacto para anúncios.',       cor: '#2D7DD2', bgAccent: 'rgba(45,125,210,0.07)' },
  { id: 'consciencia',  label: 'Consciência',           desc: 'Conteúdo educativo para crescer seu alcance orgânico.',   cor: '#9B4DCA', bgAccent: 'rgba(155,77,202,0.07)' },
]

const DATAS_2026 = [
  { data: '2026-05-01', label: 'Dia do Trabalho',          rel: 'alta' },
  { data: '2026-06-24', label: 'São João',                 rel: 'alta' },
  { data: '2026-09-07', label: 'Independência do Brasil',  rel: 'alta' },
  { data: '2026-10-02', label: '1º Turno',                 rel: 'critica' },
  { data: '2026-10-25', label: '2º Turno',                 rel: 'critica' },
]

function getDias(dataStr: string) {
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  return Math.ceil((new Date(dataStr + 'T00:00:00').getTime() - hoje.getTime()) / 86400000)
}

function RadarSVG() {
  const cx = 150, cy = 140, r = 100
  const dims = ['Digital','Mobilização','Proposta','Território','Engajamento','Alianças']
  const bench = [88, 75, 92, 68, 82, 62]
  const avg   = [40, 46, 58, 34, 42, 28]
  const ang = (i: number) => (i * 2 * Math.PI) / 6 - Math.PI / 2
  const pt = (v: number, i: number) => ({ x: cx + r*(v/100)*Math.cos(ang(i)), y: cy + r*(v/100)*Math.sin(ang(i)) })
  const gp = (s: number, i: number) => ({ x: cx + r*s*Math.cos(ang(i)), y: cy + r*s*Math.sin(ang(i)) })
  const poly = (pts: {x:number;y:number}[]) => pts.map((p,i) => `${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('') + 'Z'
  const labelR = r + 24
  return (
    <svg viewBox="0 0 300 280" style={{ width: '100%', maxHeight: 220 }}>
      {[0.25,0.5,0.75,1].map(s => (
        <polygon key={s} points={dims.map((_,i)=>{const p=gp(s,i);return`${p.x.toFixed(1)},${p.y.toFixed(1)}`}).join(' ')}
          fill="none" stroke={s===1?'rgba(123,79,216,0.2)':'rgba(123,79,216,0.07)'} strokeWidth={s===1?1:0.75}/>
      ))}
      {dims.map((_,i)=>{const p=gp(1,i);return<line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(123,79,216,0.1)" strokeWidth="0.75"/>})}
      <path d={poly(avg.map((v,i)=>pt(v,i)))} fill="rgba(180,170,210,0.12)" stroke="rgba(150,140,190,0.4)" strokeWidth="1" strokeDasharray="3,2"/>
      <path d={poly(bench.map((v,i)=>pt(v,i)))} fill="rgba(123,79,216,0.15)" stroke="#7B4FD8" strokeWidth="1.5"/>
      {bench.map((v,i)=>{const p=pt(v,i);return<circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill="#7B4FD8"/>})}
      {dims.map((d,i)=>{const lx=cx+labelR*Math.cos(ang(i)), ly=cy+labelR*Math.sin(ang(i)); const a=lx<cx-4?'end':lx>cx+4?'start':'middle'; return(
        <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={a} dominantBaseline="central" fontSize="9.5" fill="#4A3880" fontWeight="600" fontFamily="Inter,sans-serif">{d}</text>
      )})}
    </svg>
  )
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.nome) redirect('/perfil?primeiro_acesso=true')

  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0)
  const { count: totalMes }   = await supabase.from('geracoes').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('criado_em',inicioMes.toISOString())
  const { count: totalGeral } = await supabase.from('geracoes').select('*',{count:'exact',head:true}).eq('user_id',user.id)
  const { data: ultimas }     = await supabase.from('geracoes').select('agente,output,criado_em').eq('user_id',user.id).order('criado_em',{ascending:false}).limit(4)

  // 7-day activity
  const sete = new Date(); sete.setDate(sete.getDate()-6); sete.setHours(0,0,0,0)
  const { data: activity } = await supabase.from('geracoes').select('criado_em').eq('user_id',user.id).gte('criado_em',sete.toISOString())
  const actMap: Record<string,number> = {}
  for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); actMap[d.toISOString().slice(0,10)]=0 }
  activity?.forEach(g => { const k=g.criado_em.slice(0,10); if(actMap[k]!==undefined) actMap[k]++ })
  const actDays = Object.entries(actMap)
  const actMax = Math.max(...actDays.map(([,v])=>v), 1)

  const plano   = (profile?.plano ?? 'gratuito') as keyof typeof LIMITES_PLANO
  const limite  = LIMITES_PLANO[plano]
  const total   = totalMes ?? 0
  const isGratis = plano === 'gratuito'
  const pct = limite ? Math.min((total/limite)*100,100) : 0

  const diasTurno = getDias('2026-10-02')
  const proximasDatas = DATAS_2026.map(d=>({...d,dias:getDias(d.data)})).filter(d=>d.dias>=0)
  const dataHoje = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})
  const primeiroNome = profile?.nome?.split(' ')[0] ?? 'Candidato'
  const subInfo = [profile?.cargo, profile?.cidade&&profile?.estado?`${profile.cidade}/${profile.estado}`:profile?.cidade].filter(Boolean).join(' · ')

  return (
    <div style={{ padding:'24px 20px', minHeight:'100vh', background:'#ECEAF6', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <style>{`
        .d-agents { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .d-mid    { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top:14px; }
        .d-bot    { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top:14px; }
        .d-gens   { display: grid; grid-template-columns: 1fr; gap: 8px; }
        @media(min-width:860px) {
          .d-agents { grid-template-columns: repeat(4,1fr); }
          .d-mid    { grid-template-columns: 1fr 320px; }
          .d-bot    { grid-template-columns: 1fr 1fr; }
          .d-gens   { grid-template-columns: repeat(2,1fr); }
        }
        .agent-card { background:#fff; border-radius:12px; padding:18px 16px; border:1px solid #DDD8EE; cursor:pointer; text-decoration:none; display:block; transition:box-shadow .14s,transform .14s; }
        .agent-card:hover { box-shadow:0 6px 24px rgba(30,10,80,0.12); transform:translateY(-2px); }
        .surf { background:#fff; border-radius:14px; border:1px solid #DDD8EE; padding:18px 16px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:11.5, color:'#6B5FA0', margin:'0 0 3px', textTransform:'capitalize', fontWeight:500 }}>{dataHoje}</p>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#180D3C', margin:'0 0 2px', letterSpacing:'-0.03em' }}>Olá, {primeiroNome}</h1>
          {subInfo && <p style={{ fontSize:12.5, color:'#6B5FA0', margin:0 }}>{subInfo}</p>}
        </div>
        <Link href="/agentes/roteirista" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 24px', background:'#7B4FD8', color:'#fff', borderRadius:50, fontSize:14, fontWeight:600, textDecoration:'none', boxShadow:'0 4px 16px rgba(123,79,216,0.35)', letterSpacing:'-0.01em' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Criar conteúdo
        </Link>
      </div>

      {/* ── Painel de métricas (dark) ── */}
      <div style={{ borderRadius:16, background:'linear-gradient(135deg,#1E0F52 0%,#3A2080 100%)', padding:'22px 24px', marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-40, width:220, height:220, borderRadius:'50%', background:'rgba(123,79,216,0.2)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-50, left:80, width:160, height:160, borderRadius:'50%', background:'rgba(80,200,160,0.06)', pointerEvents:'none' }}/>

        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'center', position:'relative', zIndex:1, flexWrap:'wrap' }}>
          {/* Gerações */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap' }}>
              <div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', margin:'0 0 2px', fontWeight:500 }}>Gerações este mês</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                  <span style={{ fontSize:36, fontWeight:700, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>{total}</span>
                  <span style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>{limite ? `/ ${limite}` : '/ ∞'}</span>
                </div>
              </div>
              <div style={{ width:1, height:40, background:'rgba(255,255,255,0.1)', margin:'0 6px' }}/>
              <div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', margin:'0 0 2px', fontWeight:500 }}>Total histórico</p>
                <span style={{ fontSize:28, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:'-0.03em', lineHeight:1 }}>{totalGeral ?? 0}</span>
              </div>
              <div style={{ width:1, height:40, background:'rgba(255,255,255,0.1)', margin:'0 6px' }}/>
              <div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', margin:'0 0 2px', fontWeight:500 }}>Plano</p>
                <span style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.85)', textTransform:'capitalize' }}>{plano}</span>
              </div>
            </div>
            {isGratis && (
              <>
                <div style={{ height:5, background:'rgba(255,255,255,0.1)', borderRadius:4, overflow:'hidden', maxWidth:320, marginBottom:8 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background: pct>=80?'#FFD166':'rgba(255,255,255,0.6)', borderRadius:4, transition:'width .5s' }}/>
                </div>
                <Link href="/planos" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)', borderRadius:50, fontSize:12, fontWeight:600, textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)' }}>
                  Fazer upgrade para ilimitado
                </Link>
              </>
            )}
          </div>

          {/* Contagem regressiva */}
          <div style={{ textAlign:'center', padding:'14px 20px', background:'rgba(255,255,255,0.07)', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
            <div style={{ fontSize:42, fontWeight:800, color:'#FFD166', lineHeight:1, letterSpacing:'-0.04em' }}>{diasTurno}</div>
            <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.5)', marginTop:4, fontWeight:500 }}>dias para o 1º turno</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600, marginTop:2 }}>2 out 2026</div>
          </div>
        </div>

        {/* Atividade 7 dias */}
        <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.08)', position:'relative', zIndex:1 }}>
          <p style={{ fontSize:10.5, color:'rgba(255,255,255,0.35)', margin:'0 0 10px', fontWeight:500 }}>Atividade — últimos 7 dias</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:36 }}>
            {actDays.map(([dia, qtd]) => {
              const d = new Date(dia+'T12:00:00')
              const label = d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')
              const h = actMax > 0 ? Math.max((qtd/actMax)*36, qtd>0?4:2) : 2
              const isToday = dia === new Date().toISOString().slice(0,10)
              return (
                <div key={dia} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  {qtd > 0 && <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{qtd}</span>}
                  <div style={{ width:'100%', height:h, background: isToday ? '#FFD166' : qtd>0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)', borderRadius:3 }}/>
                  <span style={{ fontSize:9, color: isToday ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', fontWeight: isToday ? 700 : 400 }}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Aviso perfil incompleto ── */}
      {!profile?.bio_politica && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', background:'#fff', borderRadius:10, border:'1px solid #DDD8EE', marginBottom:14, borderLeft:'3px solid #7B4FD8' }}>
          <div style={{ flex:1, fontSize:13, color:'#180D3C', fontWeight:500 }}>
            Perfil incompleto — adicione sua bio política para os agentes gerarem conteúdo preciso.
          </div>
          <Link href="/perfil" style={{ fontSize:13, fontWeight:700, color:'#7B4FD8', textDecoration:'none', whiteSpace:'nowrap' }}>Completar →</Link>
        </div>
      )}

      {/* ── Agentes ── */}
      <p style={{ fontSize:11.5, fontWeight:600, color:'#6B5FA0', margin:'0 0 10px', letterSpacing:'0.01em' }}>Agentes de IA</p>
      <div className="d-agents">
        {AGENTES.map(({id,label,desc,cor,bgAccent}) => (
          <Link key={id} href={`/agentes/${id}`} className="agent-card">
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:cor, flexShrink:0 }}/>
              <span style={{ fontSize:13.5, fontWeight:700, color:'#180D3C', letterSpacing:'-0.01em' }}>{label}</span>
            </div>
            <p style={{ fontSize:12, color:'#584D80', lineHeight:1.55, margin:'0 0 14px' }}>{desc}</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:cor, background:bgAccent, padding:'5px 12px', borderRadius:50 }}>
              Usar agente →
            </div>
          </Link>
        ))}
      </div>

      {/* ── Radar + Calendário ── */}
      <div className="d-mid">
        {/* Radar */}
        <div className="surf">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <p style={{ fontSize:13.5, fontWeight:700, color:'#180D3C', margin:'0 0 2px', letterSpacing:'-0.01em' }}>Radar de Campanha</p>
              <p style={{ fontSize:11.5, color:'#857CAA', margin:0 }}>Benchmarks de campanhas vencedoras vs. média</p>
            </div>
          </div>
          <RadarSVG />
          <div style={{ display:'flex', gap:18, paddingTop:12, borderTop:'1px solid #EEE9F8' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:20, height:2, background:'#7B4FD8', borderRadius:2 }}/>
              <span style={{ fontSize:11, color:'#584D80', fontWeight:500 }}>Campanha vencedora</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:20, height:0, borderTop:'2px dashed #B0A8CC', borderRadius:2 }}/>
              <span style={{ fontSize:11, color:'#857CAA', fontWeight:500 }}>Média</span>
            </div>
          </div>
        </div>

        {/* Calendário eleitoral */}
        <div className="surf">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:13.5, fontWeight:700, color:'#180D3C', margin:0, letterSpacing:'-0.01em' }}>Calendário eleitoral</p>
            <Link href="/calendario" style={{ fontSize:12, color:'#7B4FD8', fontWeight:600 }}>Ver tudo →</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {proximasDatas.map(({data,label,dias,rel}) => {
              const d = new Date(data+'T00:00:00')
              const isCrit = rel === 'critica'
              return (
                <div key={data} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background: isCrit ? 'rgba(220,53,69,0.05)' : '#FAFAFE', border:`1px solid ${isCrit?'rgba(220,53,69,0.15)':'#EEE9F8'}` }}>
                  <div style={{ width:36, textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontSize:17, fontWeight:800, color: isCrit ? '#C62828' : '#2D1B6E', lineHeight:1 }}>{d.getDate()}</div>
                    <div style={{ fontSize:9, color:'#857CAA', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>{d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')} </div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color: isCrit ? '#C62828' : '#180D3C', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</p>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background: isCrit ? 'rgba(198,40,40,0.1)' : dias<=14 ? 'rgba(123,79,216,0.1)' : 'rgba(90,80,160,0.07)', color: isCrit ? '#C62828' : dias<=14 ? '#7B4FD8' : '#584D80', flexShrink:0 }}>
                    {dias===0 ? 'Hoje' : `${dias}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── TSE + Histórico recente ── */}
      <div className="d-bot">
        {/* TSE */}
        <div className="surf">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div>
              <p style={{ fontSize:13.5, fontWeight:700, color:'#180D3C', margin:'0 0 2px', letterSpacing:'-0.01em' }}>Pesquisas Eleitorais 2026</p>
              <p style={{ fontSize:11.5, color:'#857CAA', margin:0 }}>Institutos registrados no TSE</p>
            </div>
            <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'#7B4FD8', fontWeight:600, textDecoration:'none' }}>TSE ↗</a>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
            {[
              {nome:'Datafolha', freq:'Mensal'},
              {nome:'Quaest',    freq:'Quinzenal'},
              {nome:'AtlasIntel',freq:'Semanal'},
              {nome:'PoderData', freq:'Mensal'},
              {nome:'IPEC/Ipsos',freq:'Mensal'},
            ].map(({nome,freq}) => (
              <div key={nome} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:9, background:'#FAFAFE', border:'1px solid #EEE9F8' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#7B4FD8', flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#180D3C' }}>{nome}</span>
                <span style={{ fontSize:11, color:'#857CAA' }}>{freq}</span>
              </div>
            ))}
          </div>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', background:'#F7F4FF', border:'1px solid #DDD8EE', borderRadius:10, fontSize:13, fontWeight:600, color:'#584D80', textDecoration:'none' }}>
            Ver todas as pesquisas no TSE
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>

        {/* Gerado recentemente */}
        <div className="surf">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:13.5, fontWeight:700, color:'#180D3C', margin:0, letterSpacing:'-0.01em' }}>Gerado recentemente</p>
            <Link href="/historico" style={{ fontSize:12, color:'#7B4FD8', fontWeight:600 }}>Ver tudo →</Link>
          </div>
          {!ultimas || ultimas.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 16px', color:'#857CAA' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>✦</div>
              <p style={{ fontSize:13, margin:0, color:'#857CAA' }}>Nenhuma geração ainda.<br/>Use um agente para começar.</p>
            </div>
          ) : (
            <div className="d-gens">
              {ultimas.map((g,i) => {
                const ag = AGENTES.find(a=>a.id===g.agente)
                return (
                  <Link key={i} href="/historico" style={{ display:'block', background:'#FAFAFE', border:'1px solid #EEE9F8', borderRadius:10, padding:'12px 14px', textDecoration:'none', borderLeft:`3px solid ${ag?.cor??'#7B4FD8'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontSize:12.5, fontWeight:700, color:'#180D3C' }}>{ag?.label ?? g.agente}</span>
                      <span style={{ fontSize:11, color:'#857CAA' }}>{new Date(g.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p style={{ fontSize:12, color:'#584D80', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.5 }}>
                      {g.output.slice(0,100)}…
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
