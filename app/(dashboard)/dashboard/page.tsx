import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LIMITES_PLANO } from '@/types'

const AGENTES = [
  { id:'roteirista',   label:'Roteirista de Reels', desc:'Roteiros com gancho e CTA prontos para gravar.',   cor:'#0EA472', bg:'rgba(14,164,114,0.09)'  },
  { id:'estrategista', label:'Estrategista',         desc:'Plano de 90 dias e posicionamento de campanha.',  cor:'#2D7DD2', bg:'rgba(45,125,210,0.09)'  },
  { id:'copy',         label:'Copy Político',        desc:'Headlines e copies de alto impacto.',             cor:'#7B4FD8', bg:'rgba(123,79,216,0.09)'  },
  { id:'consciencia',  label:'Consciência',          desc:'Conteúdo educativo para crescer organicamente.',  cor:'#D97706', bg:'rgba(217,119,6,0.09)'   },
]

const AG_COLORS: Record<string,string> = { roteirista:'#0EA472', estrategista:'#2D7DD2', copy:'#7B4FD8', consciencia:'#D97706' }

function getDias(s:string) {
  const h=new Date(); h.setHours(0,0,0,0)
  return Math.ceil((new Date(s+'T00:00:00').getTime()-h.getTime())/86400000)
}

// ── Gráfico de linha (30 dias) ─────────────────────────────────────────
function TrendLine({ data }: { data:[string,number][] }) {
  const W=500, H=72, PAD=6
  const vals = data.map(([,v])=>v)
  const maxV = Math.max(...vals,1)
  const pts: [number,number][] = data.map(([,v],i)=>[
    (i/(data.length-1))*W,
    H-PAD-((v/maxV)*(H-PAD*2))
  ])
  const d = pts.reduce((acc,[x,y],i)=>{
    if(i===0) return `M${x.toFixed(1)},${y.toFixed(1)}`
    const [px,py]=pts[i-1]
    const cpx=(px+x)/2
    return acc+` C${cpx.toFixed(1)},${py.toFixed(1)} ${cpx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`
  },'')
  const area = d+` L${W},${H} L0,${H} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:72,display:'block'}} preserveAspectRatio="none">
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0EA472" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#0EA472" stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tg)"/>
      <path d={d} fill="none" stroke="#0EA472" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pontos nos picos */}
      {pts.filter(([,y])=>y<PAD+16).map(([x,y],i)=>(
        <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" fill="#0EA472" stroke="#fff" strokeWidth="1.5"/>
      ))}
    </svg>
  )
}

// ── Donut de uso por agente ────────────────────────────────────────────
function AgentDonut({ counts, total }: { counts:Record<string,number>; total:number }) {
  const r=44, cx=60, cy=60, sw=18
  const circ = 2*Math.PI*r
  const AG = ['roteirista','estrategista','copy','consciencia']
  let cum=0
  const segs = AG.map(id=>{
    const v = counts[id]||0
    const pct = total>0 ? v/total : 0
    const dash = circ*pct
    const gap = circ-dash
    const offset = circ*(1-cum) - circ/4
    cum+=pct
    return {dash,gap,offset,color:AG_COLORS[id],v,pct}
  }).filter(s=>s.v>0)
  return (
    <svg viewBox="0 0 120 120" style={{width:110,height:110,flexShrink:0}}>
      {total===0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E6F3EB" strokeWidth={sw}/>
      ) : segs.map((s,i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw}
          strokeDasharray={`${s.dash.toFixed(2)} ${s.gap.toFixed(2)}`}
          strokeDashoffset={s.offset.toFixed(2)}
        />
      ))}
      <text x={cx} y={cy-6} textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="700" fill="#091710" fontFamily="Inter,sans-serif">{total}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="8.5" fill="#7BA090" fontFamily="Inter,sans-serif">gerações</text>
    </svg>
  )
}

// ── Radar SVG ─────────────────────────────────────────────────────────
function RadarSVG() {
  const cx=130,cy=120,r=90
  const dims=['Digital','Mobilização','Proposta','Território','Engajamento','Alianças']
  const bench=[88,75,92,68,82,62], avg=[40,46,58,34,42,28]
  const ang=(i:number)=>i*2*Math.PI/6-Math.PI/2
  const pt=(v:number,i:number)=>({x:cx+r*(v/100)*Math.cos(ang(i)),y:cy+r*(v/100)*Math.sin(ang(i))})
  const gp=(s:number,i:number)=>({x:cx+r*s*Math.cos(ang(i)),y:cy+r*s*Math.sin(ang(i))})
  const poly=(pts:{x:number;y:number}[])=>pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('')+'Z'
  return (
    <svg viewBox="0 0 260 240" style={{width:'100%',maxHeight:200}}>
      {[.25,.5,.75,1].map(s=>(
        <polygon key={s} points={dims.map((_,i)=>{const p=gp(s,i);return`${p.x.toFixed(1)},${p.y.toFixed(1)}`}).join(' ')}
          fill="none" stroke={s===1?'rgba(14,164,114,0.2)':'rgba(14,164,114,0.07)'} strokeWidth={s===1?1:.7}/>
      ))}
      {dims.map((_,i)=>{const p=gp(1,i);return<line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(14,164,114,0.1)" strokeWidth=".7"/>})}
      <path d={poly(avg.map((v,i)=>pt(v,i)))} fill="rgba(14,164,114,0.06)" stroke="rgba(14,164,114,0.25)" strokeWidth="1" strokeDasharray="3,2"/>
      <path d={poly(bench.map((v,i)=>pt(v,i)))} fill="rgba(14,164,114,0.15)" stroke="#0EA472" strokeWidth="1.5"/>
      {bench.map((v,i)=>{const p=pt(v,i);return<circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" fill="#0EA472"/>})}
      {dims.map((d,i)=>{const lx=cx+(r+22)*Math.cos(ang(i)),ly=cy+(r+22)*Math.sin(ang(i));const a=lx<cx-4?'end':lx>cx+4?'start':'middle';return(
        <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={a} dominantBaseline="central" fontSize="9.5" fill="#3A5F4E" fontWeight="600" fontFamily="Inter,sans-serif">{d}</text>
      )})}
    </svg>
  )
}

// ── Página ────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id',user.id).single()
  if (!profile?.nome) redirect('/perfil?primeiro_acesso=true')

  const inicioMes=new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0)
  const { count: totalMes }   = await supabase.from('geracoes').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('criado_em',inicioMes.toISOString())
  const { count: totalGeral } = await supabase.from('geracoes').select('*',{count:'exact',head:true}).eq('user_id',user.id)
  const { data: ultimas }     = await supabase.from('geracoes').select('agente,output,criado_em').eq('user_id',user.id).order('criado_em',{ascending:false}).limit(4)
  const { data: porAgente }   = await supabase.from('geracoes').select('agente').eq('user_id',user.id)

  // 30-day trend
  const trinta=new Date(); trinta.setDate(trinta.getDate()-29); trinta.setHours(0,0,0,0)
  const { data: act30 } = await supabase.from('geracoes').select('criado_em').eq('user_id',user.id).gte('criado_em',trinta.toISOString())
  const actMap: Record<string,number> = {}
  for(let i=29;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); actMap[d.toISOString().slice(0,10)]=0 }
  act30?.forEach(g=>{ const k=g.criado_em.slice(0,10); if(actMap[k]!==undefined) actMap[k]++ })
  const trendData = Object.entries(actMap) as [string,number][]

  // 7-day
  const seteData = trendData.slice(-7)
  const actMax7 = Math.max(...seteData.map(([,v])=>v),1)

  // Donut counts
  const agCounts: Record<string,number> = {roteirista:0,estrategista:0,copy:0,consciencia:0}
  porAgente?.forEach(g=>{ if(g.agente in agCounts) agCounts[g.agente as keyof typeof agCounts]++ })
  const totalDonut = Object.values(agCounts).reduce((s,v)=>s+v,0)

  const plano  = (profile?.plano ?? 'gratuito') as keyof typeof LIMITES_PLANO
  const limite = LIMITES_PLANO[plano]
  const total  = totalMes ?? 0
  const isGratis = plano==='gratuito'
  const pct = limite ? Math.min((total/limite)*100,100) : 0
  const diasTurno = getDias('2026-10-02')

  const dataHoje = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})
  const primeiroNome = profile?.nome?.split(' ')[0] ?? 'Candidato'
  const subInfo = [profile?.cargo, profile?.cidade&&profile?.estado?`${profile.cidade}/${profile.estado}`:profile?.cidade].filter(Boolean).join(' · ')

  const DATAS = [
    {data:'2026-05-01',label:'Dia do Trabalho'},
    {data:'2026-06-24',label:'São João'},
    {data:'2026-09-07',label:'Independência'},
    {data:'2026-10-02',label:'1º Turno',crit:true},
    {data:'2026-10-25',label:'2º Turno',crit:true},
  ]

  return (
    <div style={{padding:'22px 20px',minHeight:'100vh',background:'#F1F6F3',fontFamily:"var(--font-inter),'Inter',sans-serif"}}>
      <style>{`
        .g2{display:grid;grid-template-columns:1fr;gap:14px}
        .g3{display:grid;grid-template-columns:1fr;gap:14px}
        .g4{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .gbot{display:grid;grid-template-columns:1fr;gap:14px}
        .grecs{display:grid;grid-template-columns:1fr;gap:8px}
        @media(min-width:860px){
          .g2{grid-template-columns:1fr 340px}
          .g3{grid-template-columns:1fr 1fr 340px}
          .g4{grid-template-columns:repeat(4,1fr)}
          .gbot{grid-template-columns:1fr 1fr}
          .grecs{grid-template-columns:repeat(2,1fr)}
        }
        .card{background:#fff;border-radius:14px;border:1px solid #D4E8DC;padding:18px 16px}
        .agent-btn{display:block;background:#fff;border-radius:12px;border:1px solid #D4E8DC;padding:16px;text-decoration:none;transition:box-shadow .14s,transform .14s}
        .agent-btn:hover{box-shadow:0 6px 20px rgba(14,164,114,0.14);transform:translateY(-2px)}
      `}</style>

      {/* ── Header ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <p style={{fontSize:11.5,color:'#7BA090',margin:'0 0 3px',textTransform:'capitalize',fontWeight:500}}>{dataHoje}</p>
          <h1 style={{fontSize:26,fontWeight:700,color:'#091710',margin:'0 0 2px',letterSpacing:'-0.03em'}}>Olá, {primeiroNome}</h1>
          {subInfo && <p style={{fontSize:12.5,color:'#7BA090',margin:0}}>{subInfo}</p>}
        </div>
        <Link href="/agentes/roteirista" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',background:'#0EA472',color:'#fff',borderRadius:50,fontSize:14,fontWeight:600,textDecoration:'none',boxShadow:'0 4px 16px rgba(14,164,114,0.35)',letterSpacing:'-0.01em'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Criar conteúdo
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="g4" style={{marginBottom:14}}>
        {[
          {label:'Gerações este mês', val:String(total),       sub: limite?`de ${limite} disponíveis`:'ilimitadas', color:'#0EA472'},
          {label:'Total histórico',   val:String(totalGeral??0),sub:'desde o início',                               color:'#2D7DD2'},
          {label:'Agentes ativos',    val:'4',                  sub:'todos disponíveis',                             color:'#0EA472'},
          {label:'Dias p/ 1º turno',  val:String(diasTurno),    sub:'2 out 2026',                                   color:'#DC3545'},
        ].map(({label,val,sub,color})=>(
          <div key={label} className="card">
            <p style={{fontSize:11,color:'#7BA090',fontWeight:500,marginBottom:8}}>{label}</p>
            <div style={{fontSize:30,fontWeight:800,color,letterSpacing:'-0.04em',lineHeight:1}}>{val}</div>
            <p style={{fontSize:11,color:'#A8C4B8',marginTop:5}}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Aviso perfil incompleto ── */}
      {!profile?.bio_politica && (
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',background:'#fff',borderRadius:10,border:'1px solid #D4E8DC',marginBottom:14,borderLeft:'3px solid #0EA472'}}>
          <div style={{flex:1,fontSize:13,color:'#091710',fontWeight:500}}>Perfil incompleto — adicione sua bio política para os agentes gerarem conteúdo personalizado.</div>
          <Link href="/perfil" style={{fontSize:13,fontWeight:700,color:'#0EA472',textDecoration:'none',whiteSpace:'nowrap'}}>Completar →</Link>
        </div>
      )}

      {/* ── Trend Chart + Upgrade/Countdown ── */}
      <div className="g2" style={{marginBottom:14}}>
        {/* Chart card */}
        <div style={{background:'linear-gradient(135deg,#054E39 0%,#0A7A56 100%)',borderRadius:16,padding:'20px 22px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-50,right:-30,width:180,height:180,borderRadius:'50%',background:'rgba(14,164,114,0.25)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <p style={{fontSize:11,color:'rgba(255,255,255,0.5)',margin:'0 0 4px',fontWeight:500}}>Atividade — 30 dias</p>
                <div style={{display:'flex',alignItems:'baseline',gap:8}}>
                  <span style={{fontSize:32,fontWeight:800,color:'#fff',letterSpacing:'-0.04em',lineHeight:1}}>{totalGeral??0}</span>
                  <span style={{fontSize:13,color:'rgba(255,255,255,0.45)'}}>gerações totais</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:11,color:'rgba(255,255,255,0.4)',margin:'0 0 2px'}}>este mês</p>
                <span style={{fontSize:22,fontWeight:700,color:'#5DFFC0',letterSpacing:'-0.03em'}}>{total}{limite?`/${limite}`:''}</span>
              </div>
            </div>
            {/* Line chart */}
            <div style={{marginBottom:10,borderRadius:8,overflow:'hidden'}}>
              <TrendLine data={trendData}/>
            </div>
            {/* 7-day bars */}
            <div style={{display:'flex',alignItems:'flex-end',gap:4,height:28}}>
              {seteData.map(([dia,qtd])=>{
                const d=new Date(dia+'T12:00:00')
                const isToday=dia===new Date().toISOString().slice(0,10)
                const h=actMax7>0?Math.max((qtd/actMax7)*28,qtd>0?4:2):2
                return(
                  <div key={dia} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:'100%',height:h,background:isToday?'#5DFFC0':qtd>0?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.12)',borderRadius:3}}/>
                    <span style={{fontSize:8.5,color:isToday?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.25)',fontWeight:isToday?700:400}}>{d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Countdown + upgrade */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Contagem */}
          <div className="card" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',background:'#091710',border:'none'}}>
            <p style={{fontSize:11,color:'rgba(255,255,255,0.4)',margin:'0 0 8px',fontWeight:500}}>dias para o 1º turno</p>
            <div style={{fontSize:52,fontWeight:800,color:'#5DFFC0',letterSpacing:'-0.05em',lineHeight:1,marginBottom:6}}>{diasTurno}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',fontWeight:500}}>2 de outubro de 2026</div>
          </div>
          {/* Upgrade ou status */}
          {isGratis ? (
            <div className="card" style={{background:'#0EA472',border:'none',padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:500}}>Plano gratuito</span>
                <span style={{fontSize:12,fontWeight:700,color:'#fff',background:'rgba(255,255,255,0.2)',padding:'2px 8px',borderRadius:20}}>{total}/5</span>
              </div>
              <div style={{height:5,background:'rgba(255,255,255,0.2)',borderRadius:4,overflow:'hidden',marginBottom:12}}>
                <div style={{height:'100%',width:`${pct}%`,background:pct>=80?'#FFD166':'#fff',borderRadius:4,transition:'width .5s'}}/>
              </div>
              <Link href="/planos" style={{display:'block',textAlign:'center',padding:'9px',background:'#fff',color:'#054E39',borderRadius:50,fontSize:13,fontWeight:700,textDecoration:'none'}}>
                Upgrade para ilimitado →
              </Link>
            </div>
          ) : (
            <div className="card" style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:'#0EA472',marginBottom:4}}>∞</div>
              <div style={{fontSize:13,fontWeight:600,color:'#091710'}}>Gerações ilimitadas</div>
              <div style={{fontSize:11,color:'#7BA090',marginTop:2}}>Plano {plano}</div>
            </div>
          )}
        </div>
      </div>


      {/* ── Widget: Cenário Presidencial 2026 ── */}
      <div style={{marginBottom:14,background:'#fff',border:'1px solid #D4E8DC',borderRadius:16,padding:'16px 20px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',top:-30,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(14,164,114,0.04)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <p style={{fontSize:12,fontWeight:700,color:'#091710',margin:'0 0 2px',letterSpacing:'-0.01em'}}>Cenário Presidencial 2026</p>
            <p style={{fontSize:11,color:'#7BA090',margin:0}}>Agregado Datafolha · Quaest · AtlasIntel · ago 2026</p>
          </div>
          <a href="/pesquisas" style={{fontSize:12,fontWeight:700,color:'#0EA472',textDecoration:'none',whiteSpace:'nowrap'}}>Ver análise completa →</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:14}}>
          {/* Candidato 1 */}
          <div style={{padding:'12px 14px',background:'rgba(14,164,114,0.05)',borderRadius:12,border:'1px solid rgba(14,164,114,0.15)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#091710'}}>Tarcísio de Freitas</div>
                <div style={{fontSize:11,color:'#7BA090'}}>Republicanos</div>
              </div>
              <div style={{fontSize:26,fontWeight:800,color:'#0EA472',letterSpacing:'-0.03em',lineHeight:1}}>34%</div>
            </div>
            <div style={{height:5,background:'#E6F3EB',borderRadius:4,overflow:'hidden'}}>
              <div style={{width:'68%',height:'100%',background:'#0EA472',borderRadius:4}}/>
            </div>
          </div>
          {/* Candidato 2 */}
          <div style={{padding:'12px 14px',background:'rgba(220,53,69,0.04)',borderRadius:12,border:'1px solid rgba(220,53,69,0.12)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#091710'}}>Lula</div>
                <div style={{fontSize:11,color:'#7BA090'}}>PT</div>
              </div>
              <div style={{fontSize:26,fontWeight:800,color:'#DC3545',letterSpacing:'-0.03em',lineHeight:1}}>29%</div>
            </div>
            <div style={{height:5,background:'rgba(220,53,69,0.1)',borderRadius:4,overflow:'hidden'}}>
              <div style={{width:'58%',height:'100%',background:'#DC3545',borderRadius:4}}/>
            </div>
          </div>
        </div>
        {/* Mini barras */}
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {[{n:'Tarcísio',p:34,c:'#0EA472'},{n:'Lula',p:29,c:'#DC3545'},{n:'Tebet',p:9,c:'#2D7DD2'},{n:'Ciro',p:6,c:'#D97706'},{n:'Indecisos',p:22,c:'#D4E8DC'}].map(d=>(
            <div key={d.n} style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{width:70,fontSize:11.5,fontWeight:500,color:'#7BA090',textAlign:'right',flexShrink:0}}>{d.n}</span>
              <div style={{flex:1,height:16,background:'#F1F6F3',borderRadius:5,overflow:'hidden'}}>
                <div style={{width:`${d.p/34*100}%`,height:'100%',background:d.c,borderRadius:5,display:'flex',alignItems:'center',paddingRight:6,justifyContent:'flex-end',minWidth:30}}>
                  <span style={{fontSize:10,fontWeight:700,color:d.c==='#D4E8DC'?'#A8C4B8':'#fff'}}>{d.p}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Agentes ── */}
      <p style={{fontSize:12,fontWeight:600,color:'#7BA090',margin:'0 0 10px',letterSpacing:'0.01em'}}>Agentes de IA</p>
      <div className="g4" style={{marginBottom:14}}>
        {AGENTES.map(({id,label,desc,cor,bg})=>(
          <Link key={id} href={`/agentes/${id}`} className="agent-btn">
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{width:10,height:10,borderRadius:3,background:cor,flexShrink:0}}/>
              <span style={{fontSize:13.5,fontWeight:700,color:'#091710',letterSpacing:'-0.01em'}}>{label}</span>
            </div>
            <p style={{fontSize:12,color:'#3A5F4E',lineHeight:1.55,margin:'0 0 14px'}}>{desc}</p>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,fontWeight:700,color:cor,background:bg,padding:'5px 12px',borderRadius:50}}>
              Usar agente →
            </div>
          </Link>
        ))}
      </div>

      {/* ── Donut + Radar + Calendário ── */}
      <div className="g3" style={{marginBottom:14}}>
        {/* Donut */}
        <div className="card">
          <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 4px',letterSpacing:'-0.01em'}}>Uso por agente</p>
          <p style={{fontSize:11.5,color:'#7BA090',margin:'0 0 16px'}}>Distribuição de gerações</p>
          <div style={{display:'flex',alignItems:'center',gap:20}}>
            <AgentDonut counts={agCounts} total={totalDonut}/>
            <div style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
              {AGENTES.map(({id,label,cor})=>{
                const v=agCounts[id]||0
                const pct=totalDonut>0?Math.round((v/totalDonut)*100):0
                return(
                  <div key={id}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:8,height:8,borderRadius:2,background:cor,flexShrink:0}}/>
                        <span style={{fontSize:12,color:'#3A5F4E',fontWeight:500}}>{label}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:'#091710'}}>{pct}%</span>
                    </div>
                    <div style={{height:4,background:'#E6F3EB',borderRadius:4,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:cor,borderRadius:4}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Radar */}
        <div className="card">
          <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px',letterSpacing:'-0.01em'}}>Radar de Campanha</p>
          <p style={{fontSize:11.5,color:'#7BA090',margin:'0 0 6px'}}>Benchmarks de campanhas vencedoras</p>
          <RadarSVG/>
          <div style={{display:'flex',gap:16,paddingTop:10,borderTop:'1px solid #E6F3EB'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:18,height:2,background:'#0EA472',borderRadius:2}}/>
              <span style={{fontSize:11,color:'#3A5F4E'}}>Vencedora</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:18,height:0,borderTop:'2px dashed #A8C4B8',borderRadius:2}}/>
              <span style={{fontSize:11,color:'#7BA090'}}>Média</span>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:0,letterSpacing:'-0.01em'}}>Calendário eleitoral</p>
            <Link href="/calendario" style={{fontSize:12,color:'#0EA472',fontWeight:600}}>Ver tudo →</Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {DATAS.map(({data,label,crit})=>{
              const dias=getDias(data)
              if(dias<0) return null
              const d=new Date(data+'T00:00:00')
              return(
                <div key={data} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 11px',borderRadius:10,background:crit?'rgba(220,53,69,0.05)':'#F7FBF8',border:`1px solid ${crit?'rgba(220,53,69,0.15)':'#D4E8DC'}`}}>
                  <div style={{width:36,textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:17,fontWeight:800,color:crit?'#DC3545':'#054E39',lineHeight:1}}>{d.getDate()}</div>
                    <div style={{fontSize:9,color:'#7BA090',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600}}>{d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:crit?'#DC3545':'#091710',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</p>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,background:crit?'rgba(220,53,69,0.1)':dias<=30?'rgba(14,164,114,0.1)':'rgba(58,95,78,0.07)',color:crit?'#DC3545':dias<=30?'#0EA472':'#3A5F4E',flexShrink:0}}>
                    {dias===0?'Hoje':`${dias}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── TSE + Recentes ── */}
      <div className="gbot">
        {/* TSE */}
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div>
              <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px',letterSpacing:'-0.01em'}}>Pesquisas Eleitorais 2026</p>
              <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Institutos registrados no TSE</p>
            </div>
            <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#0EA472',fontWeight:600,textDecoration:'none'}}>TSE ↗</a>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:14}}>
            {[{nome:'Datafolha',freq:'Mensal'},{nome:'Quaest',freq:'Quinzenal'},{nome:'AtlasIntel',freq:'Semanal'},{nome:'PoderData',freq:'Mensal'},{nome:'IPEC/Ipsos',freq:'Mensal'}].map(({nome,freq})=>(
              <div key={nome} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:9,background:'#F7FBF8',border:'1px solid #D4E8DC'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#0EA472',flexShrink:0}}/>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:'#091710'}}>{nome}</span>
                <span style={{fontSize:11,color:'#7BA090'}}>{freq}</span>
              </div>
            ))}
          </div>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px',background:'#F0FAF5',border:'1px solid #D4E8DC',borderRadius:10,fontSize:13,fontWeight:600,color:'#0EA472',textDecoration:'none'}}>
            Ver todas as pesquisas no TSE
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>

        {/* Recentes */}
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:0,letterSpacing:'-0.01em'}}>Gerado recentemente</p>
            <Link href="/historico" style={{fontSize:12,color:'#0EA472',fontWeight:600}}>Ver tudo →</Link>
          </div>
          {!ultimas||ultimas.length===0 ? (
            <div style={{textAlign:'center',padding:'28px 16px',color:'#7BA090'}}>
              <div style={{fontSize:28,marginBottom:8}}>✦</div>
              <p style={{fontSize:13,margin:0}}>Nenhuma geração ainda.<br/>Use um agente para começar.</p>
            </div>
          ) : (
            <div className="grecs">
              {ultimas.map((g,i)=>{
                const ag=AGENTES.find(a=>a.id===g.agente)
                return(
                  <Link key={i} href="/historico" style={{display:'block',background:'#F7FBF8',border:'1px solid #D4E8DC',borderRadius:10,padding:'12px 14px',textDecoration:'none',borderLeft:`3px solid ${ag?.cor??'#0EA472'}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontSize:12.5,fontWeight:700,color:'#091710'}}>{ag?.label??g.agente}</span>
                      <span style={{fontSize:11,color:'#7BA090'}}>{new Date(g.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p style={{fontSize:12,color:'#3A5F4E',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:1.5}}>{g.output.slice(0,100)}…</p>
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
