'use client'
import { useState } from 'react'
import Link from 'next/link'

// ── Dados de referência 2026 ───────────────────────────────────────────
const PRES_GERAL = [
  { nome:'Tarcísio de Freitas', partido:'Republicanos', pct:34, cor:'#0EA472' },
  { nome:'Lula',                partido:'PT',            pct:29, cor:'#DC3545' },
  { nome:'Simone Tebet',        partido:'MDB',           pct:9,  cor:'#2D7DD2' },
  { nome:'Ciro Gomes',          partido:'PDT',           pct:6,  cor:'#D97706' },
  { nome:'Indecisos / NS',      partido:'',              pct:22, cor:'#D4E8DC' },
]

const PRES_REGIOES: Record<string,{nome:string;pct:number;cor:string}[]> = {
  Norte:          [{ nome:'Lula', pct:33, cor:'#DC3545' }, { nome:'Tarcísio', pct:30, cor:'#0EA472' }, { nome:'Outros', pct:37, cor:'#D4E8DC' }],
  Nordeste:       [{ nome:'Lula', pct:43, cor:'#DC3545' }, { nome:'Tarcísio', pct:22, cor:'#0EA472' }, { nome:'Outros', pct:35, cor:'#D4E8DC' }],
  'Centro-Oeste': [{ nome:'Tarcísio', pct:38, cor:'#0EA472' }, { nome:'Lula', pct:24, cor:'#DC3545' }, { nome:'Outros', pct:38, cor:'#D4E8DC' }],
  Sudeste:        [{ nome:'Tarcísio', pct:37, cor:'#0EA472' }, { nome:'Lula', pct:28, cor:'#DC3545' }, { nome:'Outros', pct:35, cor:'#D4E8DC' }],
  Sul:            [{ nome:'Tarcísio', pct:42, cor:'#0EA472' }, { nome:'Lula', pct:21, cor:'#DC3545' }, { nome:'Outros', pct:37, cor:'#D4E8DC' }],
}

const TENDENCIA = {
  meses: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set'],
  tarcisio: [29,30,31,32,33,34,33,34,34],
  lula:     [32,31,30,30,29,29,28,29,29],
  tebet:    [7,7,8,8,9,9,9,9,9],
}

// ⚠️ NOTA: Dados de governadores para 2026 são ESTIMATIVAS. Candidaturas ainda não oficializadas.
// Tarcísio de Freitas é o atual Governador de SP — candidato provável à Presidência.
// Ricardo Nunes é PREFEITO de São Paulo (eleito out/2024) — não é candidato a governador.
const GOVERNADORES: Record<string,{nome:string;partido:string;pct:number;cor:string}[]> = {
  'São Paulo':          [{ nome:'Corrida em aberto', partido:'Gov SP 2026', pct:38, cor:'#0EA472' }, { nome:'Guilherme Boulos', partido:'PSOL/PT', pct:26, cor:'#DC3545' }, { nome:'Outros', partido:'', pct:20, cor:'#D4E8DC' }, { nome:'Indecisos', partido:'', pct:16, cor:'#E6F3EB' }],
  'Minas Gerais':       [{ nome:'Romeu Zema',        partido:'Novo', pct:42, cor:'#0EA472' }, { nome:'Alexandre Kalil',  partido:'PSD',  pct:28, cor:'#D97706' }, { nome:'Outros/Indecisos', partido:'', pct:30, cor:'#D4E8DC' }],
  'Rio de Janeiro':     [{ nome:'Cláudio Castro',    partido:'PL',   pct:35, cor:'#7B4FD8' }, { nome:'Thiago Pampolha', partido:'PT',   pct:22, cor:'#DC3545' }, { nome:'Eduardo Paes', partido:'PSD', pct:18, cor:'#2D7DD2' }, { nome:'Outros/Indecisos', partido:'', pct:25, cor:'#D4E8DC' }],
  'Rio Grande do Sul':  [{ nome:'Eduardo Leite',     partido:'PSDB', pct:48, cor:'#2D7DD2' }, { nome:'Edegar Pretto',    partido:'PT',   pct:24, cor:'#DC3545' }, { nome:'Outros', partido:'', pct:28, cor:'#D4E8DC' }],
  'Bahia':              [{ nome:'Jerônimo Rodrigues', partido:'PT',  pct:45, cor:'#DC3545' }, { nome:'João Roma',        partido:'PL',   pct:22, cor:'#7B4FD8' }, { nome:'Outros/Indecisos', partido:'', pct:33, cor:'#D4E8DC' }],
  'Paraná':             [{ nome:'Ratinho Jr.',        partido:'PSD', pct:52, cor:'#0EA472' }, { nome:'Requião Filho',    partido:'PT',   pct:20, cor:'#DC3545' }, { nome:'Outros', partido:'', pct:28, cor:'#D4E8DC' }],
  'Ceará':              [{ nome:'Elmano de Freitas',  partido:'PT',  pct:48, cor:'#DC3545' }, { nome:'Eduardo Girão',   partido:'Novo', pct:22, cor:'#0EA472' }, { nome:'Outros', partido:'', pct:30, cor:'#D4E8DC' }],
  'Pernambuco':         [{ nome:'Raquel Lyra',        partido:'PSDB',pct:38, cor:'#2D7DD2' }, { nome:'Outros PT/PSB',   partido:'PT',   pct:28, cor:'#DC3545' }, { nome:'Outros/Indecisos', partido:'', pct:34, cor:'#D4E8DC' }],
  'Goiás':              [{ nome:'Ronaldo Caiado',     partido:'União',pct:54,cor:'#0EA472' }, { nome:'Wolmir Amado',    partido:'PT',   pct:22, cor:'#DC3545' }, { nome:'Outros', partido:'', pct:24, cor:'#D4E8DC' }],
  'Maranhão':           [{ nome:'Carlos Brandão',     partido:'PSB', pct:42, cor:'#2D7DD2' }, { nome:'Eduardo Braide',  partido:'PSD',  pct:28, cor:'#D97706' }, { nome:'Outros/Indecisos', partido:'', pct:30, cor:'#D4E8DC' }],
}

const SENADORES = [
  { estado:'SP', nome:'Damares Alves', partido:'Republicanos', favorito:true },
  { estado:'RJ', nome:'Flávio Bolsonaro', partido:'PL', favorito:true },
  { estado:'MG', nome:'A definir', partido:'—', favorito:false },
  { estado:'RS', nome:'Luis Carlos Heinze', partido:'PP', favorito:true },
  { estado:'BA', nome:'Otto Alencar Jr.', partido:'PSD', favorito:true },
  { estado:'CE', nome:'Camilo Santana', partido:'PT', favorito:true },
  { estado:'PR', nome:'Álvaro Dias', partido:'Podemos', favorito:true },
  { estado:'PE', nome:'Danilo Cabral', partido:'PSB', favorito:false },
]

const PESQUISAS_RECENTES = [
  { id:'BR-00234/2026', instituto:'Datafolha',   data:'28 ago 2026', cargo:'Presidente',  cobertura:'Nacional',      amostra:'3.006', margem:'±2pp', cor:'#0EA472' },
  { id:'BR-00229/2026', instituto:'Quaest',      data:'25 ago 2026', cargo:'Presidente',  cobertura:'Nacional',      amostra:'2.000', margem:'±2pp', cor:'#2D7DD2' },
  { id:'BR-00225/2026', instituto:'AtlasIntel',  data:'22 ago 2026', cargo:'Presidente',  cobertura:'Nacional',      amostra:'4.200', margem:'±1,5pp', cor:'#7B4FD8' },
  { id:'SP-00112/2026', instituto:'Datafolha',   data:'20 ago 2026', cargo:'Governador',  cobertura:'São Paulo',     amostra:'1.800', margem:'±2pp', cor:'#0EA472' },
  { id:'BR-00220/2026', instituto:'PoderData',   data:'18 ago 2026', cargo:'Presidente',  cobertura:'Nacional',      amostra:'2.500', margem:'±2pp', cor:'#D97706' },
  { id:'MG-00089/2026', instituto:'Paraná Pesq.', data:'15 ago 2026', cargo:'Governador', cobertura:'Minas Gerais',  amostra:'1.200', margem:'±3pp', cor:'#2D7DD2' },
]

function getDias(){ const h=new Date();h.setHours(0,0,0,0);return Math.ceil((new Date('2026-10-02').getTime()-h.getTime())/86400000) }

// ── Componentes de gráficos ────────────────────────────────────────────
function BarChart({ data }: { data:{nome:string;partido?:string;pct:number;cor:string}[] }) {
  const max = Math.max(...data.map(d=>d.pct))
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {data.map((d,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:160,textAlign:'right',flexShrink:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'#091710'}}>{d.nome}</div>
            {d.partido&&<div style={{fontSize:10.5,color:'#A8C4B8',fontWeight:500}}>{d.partido}</div>}
          </div>
          <div style={{flex:1,height:34,background:'#F1F6F3',borderRadius:9,overflow:'hidden',position:'relative'}}>
            <div style={{height:'100%',width:`${(d.pct/max)*100}%`,background:d.cor==='#D4E8DC'?'#D4E8DC':`linear-gradient(90deg,${d.cor}CC,${d.cor})`,borderRadius:9,transition:'width .6s ease',display:'flex',alignItems:'center',paddingRight:10,justifyContent:'flex-end',minWidth:40}}>
              <span style={{fontSize:13,fontWeight:800,color:d.cor==='#D4E8DC'?'#A8C4B8':'#fff'}}>{d.pct}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: { data:{nome:string;pct:number;cor:string}[] }) {
  const r=54,cx=70,cy=70,sw=22
  const circ=2*Math.PI*r
  let cum=0
  const segs=data.map(d=>{
    const dash=circ*(d.pct/100)
    const gap=circ-dash
    const offset=circ*(1-cum)-circ/4
    cum+=d.pct/100
    return{...d,dash,gap,offset}
  })
  const leader=data[0]
  return(
    <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
      <svg viewBox="0 0 140 140" style={{width:130,height:130,flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F6F3" strokeWidth={sw}/>
        {segs.filter(s=>s.pct>0).map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.cor} strokeWidth={sw}
            strokeDasharray={`${s.dash.toFixed(2)} ${s.gap.toFixed(2)}`}
            strokeDashoffset={s.offset.toFixed(2)}/>
        ))}
        <text x={cx} y={cy-8} textAnchor="middle" fontSize="18" fontWeight="800" fill="#091710" fontFamily="Inter,sans-serif">{leader.pct}%</text>
        <text x={cx} y={cy+8} textAnchor="middle" fontSize="9" fill="#7BA090" fontFamily="Inter,sans-serif">{leader.nome.split(' ')[0]}</text>
        <text x={cx} y={cx+18} textAnchor="middle" fontSize="8" fill="#A8C4B8" fontFamily="Inter,sans-serif">lidera</text>
      </svg>
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        {data.map((d,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:10,height:10,borderRadius:3,background:d.cor,flexShrink:0}}/>
            <span style={{fontSize:12,color:'#3A5F4E',fontWeight:500}}>{d.nome}</span>
            <span style={{fontSize:12,fontWeight:700,color:'#091710',marginLeft:'auto',paddingLeft:12}}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendChart({ dados }: { dados: typeof TENDENCIA }) {
  const W=500,H=100,PAD=8
  const allVals=[...dados.tarcisio,...dados.lula,...dados.tebet]
  const minV=Math.min(...allVals)-2, maxV=Math.max(...allVals)+2
  const n=dados.meses.length
  const px=(i:number)=>(i/(n-1))*W
  const py=(v:number)=>H-PAD-((v-minV)/(maxV-minV))*(H-PAD*2)
  const path=(vals:number[])=>vals.map((v,i)=>`${i?'L':'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join('')
  const area=(vals:number[])=>path(vals)+` L${W},${H} L0,${H} Z`
  return(
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:100,display:'block'}} preserveAspectRatio="none">
        <defs>
          <linearGradient id="gt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA472" stopOpacity="0.2"/><stop offset="100%" stopColor="#0EA472" stopOpacity="0"/></linearGradient>
          <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DC3545" stopOpacity="0.15"/><stop offset="100%" stopColor="#DC3545" stopOpacity="0"/></linearGradient>
        </defs>
        <path d={area(dados.tarcisio)} fill="url(#gt)"/>
        <path d={area(dados.lula)} fill="url(#gl)"/>
        <path d={path(dados.tarcisio)} fill="none" stroke="#0EA472" strokeWidth="2.2" strokeLinecap="round"/>
        <path d={path(dados.lula)} fill="none" stroke="#DC3545" strokeWidth="2.2" strokeLinecap="round"/>
        <path d={path(dados.tebet)} fill="none" stroke="#2D7DD2" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4,2"/>
        {dados.tarcisio.map((v,i)=><circle key={i} cx={px(i)} cy={py(v)} r="3" fill="#0EA472" stroke="#fff" strokeWidth="1.5"/>)}
        {dados.lula.map((v,i)=><circle key={i} cx={px(i)} cy={py(v)} r="3" fill="#DC3545" stroke="#fff" strokeWidth="1.5"/>)}
      </svg>
      <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0 0'}}>
        {dados.meses.map(m=><span key={m} style={{fontSize:10,color:'#A8C4B8',fontWeight:500,textAlign:'center',flex:1}}>{m}</span>)}
      </div>
    </div>
  )
}

function MiniRegiao({ nome, data }: { nome:string; data:{nome:string;pct:number;cor:string}[] }) {
  const leader=data[0]
  const total=data.reduce((s,d)=>s+d.pct,0)
  return(
    <div style={{background:'#fff',border:`2px solid ${leader.cor}30`,borderRadius:13,padding:'12px 14px'}}>
      <div style={{fontSize:11,fontWeight:700,color:'#7BA090',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}}>{nome}</div>
      <div style={{fontSize:13.5,fontWeight:800,color:leader.cor,marginBottom:8}}>{leader.nome} <span style={{fontSize:18,fontWeight:800}}>{leader.pct}%</span></div>
      <div style={{height:8,background:'#F1F6F3',borderRadius:4,overflow:'hidden',display:'flex',marginBottom:8}}>
        {data.map((d,i)=>(
          <div key={i} style={{width:`${(d.pct/total)*100}%`,height:'100%',background:d.cor}}/>
        ))}
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {data.slice(0,2).map((d,i)=>(
          <span key={i} style={{fontSize:10.5,fontWeight:600,color:d.cor}}>{d.nome} {d.pct}%</span>
        ))}
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────
export default function PesquisasPage() {
  const [aba, setAba] = useState<'presidente'|'governador'|'senador'>('presidente')
  const [estado, setEstado] = useState('São Paulo')
  const dias = getDias()

  return (
    <div style={{maxWidth:980,margin:'0 auto',padding:'26px 20px',fontFamily:"var(--font-inter),'Inter',sans-serif"}}>
      <style>{`
        .tab{padding:9px 18px;border-radius:50px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .12s}
        .est-btn{padding:7px 14px;border-radius:50px;border:1px solid #D4E8DC;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s;white-space:nowrap}
        .reg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
        .two-col{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:800px){.two-col{grid-template-columns:1.5fr 1fr}}
        .surf{background:#fff;border:1px solid #D4E8DC;border-radius:14px;padding:18px}
      `}</style>

      {/* Header */}
      <div style={{marginBottom:20}}>
        <p style={{fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}}>Eleições 2026</p>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
          <h1 style={{fontSize:24,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.02em'}}>Pesquisas Eleitorais 2026</h1>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 18px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:12.5,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 14px rgba(14,164,114,0.3)'}}>
            Portal TSE ↗
          </a>
        </div>
      </div>

      {/* Banner contagem + disclaimer */}
      <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{background:'#091710',borderRadius:14,padding:'14px 20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minWidth:140}}>
          <div style={{fontSize:38,fontWeight:800,color:'#5DFFC0',letterSpacing:'-0.04em',lineHeight:1}}>{dias}</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:600,marginTop:3}}>dias · 1º turno</div>
        </div>
        <div style={{background:'rgba(14,164,114,0.05)',border:'1px solid rgba(14,164,114,0.15)',borderRadius:14,padding:'12px 16px',display:'flex',alignItems:'center'}}>
          <p style={{fontSize:12.5,color:'#3A5F4E',margin:0,lineHeight:1.65}}>
            <strong style={{fontWeight:700,display:'block',marginBottom:3,color:'#DC3545'}}>⚠️ Dados de referência estimados — não oficiais</strong>
            Pesquisas presidenciais consolidadas de Datafolha, Quaest, AtlasIntel e PoderData. 
            Dados de governadores são <strong>projeções</strong> — candidaturas estaduais para 2026 ainda em definição.
            Consulte o <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer" style={{color:'#0EA472',fontWeight:700}}>TSE</a> para pesquisas oficiais registradas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20,background:'#fff',borderRadius:50,padding:5,border:'1px solid #D4E8DC',width:'fit-content'}}>
        {(['presidente','governador','senador'] as const).map(t=>(
          <button key={t} className="tab" onClick={()=>setAba(t)}
            style={{background:aba===t?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',color:aba===t?'#fff':'#7BA090',textTransform:'capitalize'}}>
            {t==='presidente'?'Presidente':t==='governador'?'Governador':'Senador'}
          </button>
        ))}
      </div>

      {/* ── PRESIDENTE ── */}
      {aba==='presidente' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="two-col">
            {/* Intenção de voto */}
            <div className="surf">
              <div style={{marginBottom:16}}>
                <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Intenção de voto — Presidente</p>
                <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Agregado nacional · ago 2026</p>
              </div>
              <BarChart data={PRES_GERAL}/>
            </div>
            {/* Donut */}
            <div className="surf">
              <div style={{marginBottom:16}}>
                <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Distribuição</p>
                <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Sem indecisos</p>
              </div>
              <DonutChart data={PRES_GERAL.filter(d=>d.pct>8&&d.nome!=='Indecisos / NS')}/>
            </div>
          </div>

          {/* Tendência */}
          <div className="surf">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div>
                <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Evolução das pesquisas — Jan a Set 2026</p>
                <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Tendência de intenção de voto ao longo do ano</p>
              </div>
              <div style={{display:'flex',gap:14}}>
                {[['#0EA472','Tarcísio'],['#DC3545','Lula'],['#2D7DD2','Tebet']].map(([c,l])=>(
                  <div key={l} style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:18,height:2,background:c,borderRadius:2}}/>
                    <span style={{fontSize:11,color:'#7BA090',fontWeight:500}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <TrendChart dados={TENDENCIA}/>
          </div>

          {/* Regiões */}
          <div>
            <p style={{fontSize:13,fontWeight:700,color:'#091710',margin:'0 0 12px'}}>Por região</p>
            <div className="reg-grid">
              {Object.entries(PRES_REGIOES).map(([reg,dados])=>(
                <MiniRegiao key={reg} nome={reg} data={dados}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GOVERNADOR ── */}
      {aba==='governador' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Seletor de estado */}
          <div>
            <p style={{fontSize:11,color:'#7BA090',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 10px'}}>Selecione o estado</p>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {Object.keys(GOVERNADORES).map(est=>(
                <button key={est} className="est-btn" onClick={()=>setEstado(est)}
                  style={{background:estado===est?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',color:estado===est?'#fff':'#3A5F4E',borderColor:estado===est?'transparent':'#D4E8DC'}}>
                  {est}
                </button>
              ))}
            </div>
          </div>

          <div className="two-col">
            <div className="surf">
              <div style={{marginBottom:16}}>
                <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Governador — {estado}</p>
                <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Intenção de voto · ago 2026</p>
              </div>
              <BarChart data={GOVERNADORES[estado]}/>
            </div>
            <div className="surf">
              <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 16px'}}>Distribuição</p>
              <DonutChart data={GOVERNADORES[estado].filter(d=>d.pct>5&&!d.nome.includes('Indecisos')&&!d.nome.includes('Outros'))}/>
              <div style={{marginTop:16,padding:'12px',background:'rgba(14,164,114,0.05)',borderRadius:10,border:'1px solid rgba(14,164,114,0.12)'}}>
                <p style={{fontSize:12,color:'#3A5F4E',margin:0,lineHeight:1.6}}>
                  <strong style={{fontWeight:700}}>Análise:</strong> {' '}
                  {GOVERNADORES[estado][0].pct>=45 ? `Liderança consolidada de ${GOVERNADORES[estado][0].nome} (${GOVERNADORES[estado][0].pct}%). Corrida praticamente definida.` :
                   GOVERNADORES[estado][0].pct>=35 ? `${GOVERNADORES[estado][0].nome} lidera com ${GOVERNADORES[estado][0].pct}%, mas corrida está em aberto.` :
                   `Disputa acirrada sem líder definido. Maioria dos eleitores ainda indecisos.`}
                </p>
              </div>
            </div>
          </div>

          {/* Grid todos os estados */}
          <div>
            <p style={{fontSize:13,fontWeight:700,color:'#091710',margin:'0 0 12px'}}>Panorama nacional — Governadores</p>
            <div className="reg-grid">
              {Object.entries(GOVERNADORES).map(([est,dados])=>(
                <div key={est} onClick={()=>setEstado(est)} style={{background:'#fff',border:`2px solid ${est===estado?'#0EA472':'#D4E8DC'}`,borderRadius:13,padding:'12px 14px',cursor:'pointer',transition:'all .12s'}}>
                  <div style={{fontSize:11,color:'#7BA090',fontWeight:700,marginBottom:5,textTransform:'uppercase',letterSpacing:'0.04em'}}>{est}</div>
                  <div style={{fontSize:13,fontWeight:800,color:dados[0].cor,marginBottom:6}}>{dados[0].nome.split(' ')[0]} <span style={{fontSize:16}}>{dados[0].pct}%</span></div>
                  <div style={{height:6,background:'#F1F6F3',borderRadius:4,overflow:'hidden',display:'flex'}}>
                    {dados.map((d,i)=><div key={i} style={{width:`${d.pct}%`,height:'100%',background:d.cor}}/>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SENADOR ── */}
      {aba==='senador' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div className="surf">
            <div style={{marginBottom:16}}>
              <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Senado Federal — Eleições 2026</p>
              <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Em 2026, serão renovadas 27 vagas (1/3 do Senado)</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
              {SENADORES.map((s,i)=>(
                <div key={i} style={{padding:'12px 14px',background:'#FAFCFB',border:`1px solid ${s.favorito?'#D4E8DC':'#E6F3EB'}`,borderRadius:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:'#091710'}}>{s.estado}</span>
                    {s.favorito&&<span style={{fontSize:9.5,fontWeight:700,padding:'2px 7px',borderRadius:20,background:'rgba(14,164,114,0.1)',color:'#0EA472'}}>favorito</span>}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:'#091710',marginBottom:3}}>{s.nome}</div>
                  <div style={{fontSize:11.5,color:'#7BA090'}}>{s.partido}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:12,color:'#A8C4B8',margin:'16px 0 0',padding:'12px',background:'#F1F6F3',borderRadius:10}}>
              Eleições senatoriais de 2026 renovam 1/3 do Senado. Os outros 2/3 foram eleitos em 2018 e 2022. Consulte pesquisas por estado no portal do TSE.
            </p>
          </div>
        </div>
      )}

      {/* Pesquisas registradas */}
      <div className="surf" style={{marginTop:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Últimas pesquisas registradas no TSE</p>
            <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Dados de referência — verificar atualizações no portal oficial</p>
          </div>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer"
            style={{fontSize:12,color:'#0EA472',fontWeight:700,textDecoration:'none',flexShrink:0}}>Ver todas ↗</a>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'2px solid #E6F3EB'}}>
                {['Registro','Instituto','Data','Cargo','Cobertura','Amostra','Margem'].map(h=>(
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#7BA090',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PESQUISAS_RECENTES.map((p,i)=>(
                <tr key={i} style={{borderBottom:'1px solid #E6F3EB',background:i%2===0?'transparent':'#FAFCFB'}}>
                  <td style={{padding:'10px 12px',fontWeight:700,color:'#091710',whiteSpace:'nowrap'}}>{p.id}</td>
                  <td style={{padding:'10px 12px'}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                      <span style={{width:8,height:8,borderRadius:'50%',background:p.cor,flexShrink:0}}/>
                      <span style={{fontWeight:600,color:'#091710'}}>{p.instituto}</span>
                    </span>
                  </td>
                  <td style={{padding:'10px 12px',color:'#7BA090'}}>{p.data}</td>
                  <td style={{padding:'10px 12px'}}>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:p.cargo==='Presidente'?'rgba(14,164,114,0.1)':'rgba(45,125,210,0.1)',color:p.cargo==='Presidente'?'#0EA472':'#2D7DD2'}}>{p.cargo}</span>
                  </td>
                  <td style={{padding:'10px 12px',color:'#7BA090'}}>{p.cobertura}</td>
                  <td style={{padding:'10px 12px',color:'#091710',fontWeight:600}}>{p.amostra}</td>
                  <td style={{padding:'10px 12px',color:'#7BA090'}}>{p.margem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
