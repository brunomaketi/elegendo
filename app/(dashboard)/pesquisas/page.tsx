'use client'
import { useState } from 'react'
import Link from 'next/link'

// ── Dados REAIS de pesquisas registradas no TSE ─────────────────────────
// Fontes: PoderData, Quaest, Datafolha, AtlasIntel — agosto 2026

const PRES_PODERDATA = [
  { nome:'Lula',             partido:'PT',          numero:'13',  pct:38, cor:'#DC3545', situacao:'Titular' },
  { nome:'Flávio Bolsonaro', partido:'PL',           numero:'22',  pct:35, cor:'#003399', situacao:'Titular' },
  { nome:'Outros/NS/NR',     partido:'—',            numero:'—',   pct:27, cor:'#D4E8DC', situacao:'' },
]

const PRES_QUAEST = [
  { nome:'Lula',             partido:'PT',           pct:36, cor:'#DC3545' },
  { nome:'Flávio Bolsonaro', partido:'PL',           pct:28, cor:'#003399' },
  { nome:'Ronaldo Caiado',   partido:'PSD',          pct:8,  cor:'#0EA472' },
  { nome:'Outros/NS/NR',     partido:'—',            pct:28, cor:'#D4E8DC' },
]

const PESQUISAS_REAIS = [
  {
    id:'BR-04974/2026', instituto:'PoderData', data:'26 ago 2026', cargo:'Presidente',
    cobertura:'Nacional', amostra:'2.400', margem:'±2pp', cor:'#D97706',
    contratante:'Poder360 (próprio)', confianca:'95%',
    link:'https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais',
    resultado:'Lula 38% · Flávio Bolsonaro 35%'
  },
  {
    id:'BR-04891/2026', instituto:'Genial/Quaest', data:'ago 2026', cargo:'Presidente',
    cobertura:'Nacional', amostra:'2.000', margem:'±2pp', cor:'#2D7DD2',
    contratante:'Genial Investimentos', confianca:'95%',
    link:'https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais',
    resultado:'Lula ~36% · Flávio Bolsonaro ~28% · Ronaldo Caiado ~8%'
  },
  {
    id:'Ver TSE', instituto:'Datafolha', data:'ago 2026', cargo:'Presidente',
    cobertura:'Nacional', amostra:'—', margem:'—', cor:'#0EA472',
    contratante:'—', confianca:'—',
    link:'https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais',
    resultado:'Consulte o portal oficial do TSE'
  },
]

interface Candidato { nome:string; nomeCompleto?:string; partido:string; numero:string; cor:string; link:string; vice?:string }
const CANDIDATOS_PRES: Candidato[] = [
  { nome:'Lula', nomeCompleto:'Luiz Inácio Lula da Silva', partido:'PT', numero:'13', cor:'#DC3545', link:'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BR/BR/' },
  { nome:'Flávio Bolsonaro', nomeCompleto:'Flávio Nantes Bolsonaro', partido:'PL', numero:'22', cor:'#003399', link:'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BR/BR/20322002026' },
  { nome:'Ronaldo Caiado', nomeCompleto:'Ronaldo Ramos Caiado', partido:'PSD', numero:'55', cor:'#0EA472', link:'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BR/BR/', vice:'Gilberto Kassab (PSD)' },
]

function getDias(){ const h=new Date();h.setHours(0,0,0,0);return Math.ceil((new Date('2026-10-02').getTime()-h.getTime())/86400000) }

function BarChart({ data }: { data:{nome:string;partido?:string;pct:number;cor:string}[] }) {
  const max = Math.max(...data.map(d=>d.pct), 1)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {data.map((d,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:150,textAlign:'right',flexShrink:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'#091710'}}>{d.nome}</div>
            {d.partido&&d.partido!=='—'&&<div style={{fontSize:10.5,color:'#A8C4B8',fontWeight:500}}>{d.partido}</div>}
          </div>
          <div style={{flex:1,height:34,background:'#F1F6F3',borderRadius:9,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${(d.pct/max)*100}%`,background:d.cor==='#D4E8DC'?'#D4E8DC':`linear-gradient(90deg,${d.cor}CC,${d.cor})`,borderRadius:9,display:'flex',alignItems:'center',paddingRight:10,justifyContent:'flex-end',minWidth:36}}>
              <span style={{fontSize:13,fontWeight:800,color:d.cor==='#D4E8DC'?'#A8C4B8':'#fff'}}>{d.pct}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: { data:{nome:string;partido?:string;pct:number;cor:string}[] }) {
  const r=52,cx=68,cy=68,sw=20
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
    <div style={{display:'flex',alignItems:'center',gap:20}}>
      <svg viewBox="0 0 136 136" style={{width:120,height:120,flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F6F3" strokeWidth={sw}/>
        {segs.filter(s=>s.pct>0).map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.cor} strokeWidth={sw}
            strokeDasharray={`${s.dash.toFixed(2)} ${s.gap.toFixed(2)}`}
            strokeDashoffset={s.offset.toFixed(2)}/>
        ))}
        <text x={cx} y={cy-8} textAnchor="middle" fontSize="20" fontWeight="800" fill="#091710" fontFamily="Inter,sans-serif">{leader.pct}%</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize="9" fill="#7BA090" fontFamily="Inter,sans-serif">{leader.nome.split(' ')[0]}</text>
      </svg>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {data.filter(d=>d.cor!=='#D4E8DC').map((d,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:10,height:10,borderRadius:3,background:d.cor,flexShrink:0}}/>
            <div>
              <div style={{fontSize:12.5,color:'#091710',fontWeight:600}}>{d.nome}</div>
              <div style={{fontSize:10.5,color:'#7BA090'}}>{d.partido}</div>
            </div>
            <span style={{fontSize:14,fontWeight:800,color:'#091710',marginLeft:'auto',paddingLeft:16}}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PesquisasPage() {
  const [fonte, setFonte] = useState<'poderdata'|'quaest'>('poderdata')
  const dias = getDias()
  const dadosAtivos = fonte==='poderdata' ? PRES_PODERDATA : PRES_QUAEST

  return (
    <div style={{maxWidth:960,margin:'0 auto',padding:'26px 20px',fontFamily:"var(--font-inter),'Inter',sans-serif"}}>
      <style>{`
        .tab{padding:8px 16px;border-radius:50px;border:none;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .12s}
        .surf{background:#fff;border:1px solid #D4E8DC;border-radius:14px;padding:18px}
        .two-col{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:780px){.two-col{grid-template-columns:1.5fr 1fr}}
        .cand-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
      `}</style>

      {/* Header */}
      <div style={{marginBottom:18}}>
        <p style={{fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}}>Eleições 2026</p>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
          <h1 style={{fontSize:24,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.02em'}}>Pesquisas Eleitorais 2026</h1>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 18px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:12.5,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 14px rgba(14,164,114,0.3)'}}>
            Portal oficial TSE ↗
          </a>
        </div>
      </div>

      {/* Banner countdown + info */}
      <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:12,marginBottom:20,alignItems:'stretch'}}>
        <div style={{background:'#091710',borderRadius:14,padding:'16px 22px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <div style={{fontSize:40,fontWeight:800,color:'#5DFFC0',letterSpacing:'-0.04em',lineHeight:1}}>{dias}</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:600,marginTop:4,textAlign:'center'}}>dias · 1º turno</div>
        </div>
        <div style={{background:'rgba(14,164,114,0.05)',border:'1px solid rgba(14,164,114,0.15)',borderRadius:14,padding:'14px 18px'}}>
          <div style={{fontSize:13,fontWeight:700,color:'#091710',marginBottom:5}}>Dados reais de pesquisas registradas — ago 2026</div>
          <p style={{fontSize:12.5,color:'#3A5F4E',margin:0,lineHeight:1.65}}>
            Pesquisas de intenção de voto registradas no TSE por institutos credenciados (PoderData, Genial/Quaest). Os números refletem levantamentos publicados em agosto de 2026.
            Para dados em tempo real e pesquisas estaduais, acesse o{' '}
            <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer" style={{color:'#0EA472',fontWeight:700}}>portal do TSE</a>.
          </p>
        </div>
      </div>

      {/* Candidatos registrados */}
      <div className="surf" style={{marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Candidatos registrados — Presidente 2026</p>
            <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Fonte: DivulgaCandContas / TSE</p>
          </div>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/candidatos/BR/BR/1/candidatos" target="_blank" rel="noopener noreferrer"
            style={{fontSize:12,color:'#0EA472',fontWeight:700,textDecoration:'none'}}>Ver todos no TSE ↗</a>
        </div>
        <div className="cand-grid">
          {CANDIDATOS_PRES.map((c,i)=>(
            <a key={i} href={c.link} target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:12,border:`1.5px solid ${c.cor}25`,background:`${c.cor}06`,textDecoration:'none'}}>
              <div style={{width:34,height:34,borderRadius:10,background:c.cor,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14,fontWeight:800,flexShrink:0}}>{c.numero}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,fontWeight:700,color:'#091710'}}>{c.nome}</div>
                <div style={{fontSize:11.5,color:'#7BA090'}}>{c.partido}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A8C4B8" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          ))}
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 14px',borderRadius:12,border:'1.5px dashed #D4E8DC',background:'#FAFCFB',textDecoration:'none',color:'#7BA090',fontSize:12,fontWeight:600}}>
            + outros candidatos registrados no TSE →
          </a>
        </div>
      </div>

      {/* Intenção de voto */}
      <div className="two-col" style={{marginBottom:16}}>
        <div className="surf">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
            <div>
              <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Intenção de voto — Presidente</p>
              <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Espontâneo · dados de ago/2026</p>
            </div>
            <div style={{display:'flex',gap:6}}>
              {[{id:'poderdata',label:'PoderData'},{id:'quaest',label:'Quaest'}].map(f=>(
                <button key={f.id} className="tab" onClick={()=>setFonte(f.id as 'poderdata'|'quaest')}
                  style={{background:fonte===f.id?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',border:`1px solid ${fonte===f.id?'transparent':'#D4E8DC'}`,color:fonte===f.id?'#fff':'#7BA090'}}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={dadosAtivos}/>
          <div style={{marginTop:14,padding:'10px 12px',background:'rgba(14,164,114,0.05)',borderRadius:10,border:'1px solid rgba(14,164,114,0.1)'}}>
            <p style={{fontSize:11.5,color:'#3A5F4E',margin:0,lineHeight:1.5}}>
              {fonte==='poderdata' ? (
                <><strong>PoderData · TSE nº BR-04974/2026</strong><br/>23-26 ago 2026 · 2.400 entrevistados · Margem ±2pp · 95% de confiança<br/>Contratante: Poder360 (próprio)</>
              ) : (
                <><strong>Genial/Quaest · ago 2026</strong><br/>Contratante: Genial Investimentos · Margem ±2pp · 95% de confiança</>
              )}
            </p>
          </div>
        </div>
        <div className="surf">
          <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Distribuição</p>
          <p style={{fontSize:11.5,color:'#7BA090',margin:'0 0 16px'}}>Sem indecisos/NS/NR</p>
          <DonutChart data={dadosAtivos.filter(d=>d.cor!=='#D4E8DC'&&d.pct>0)}/>
          {fonte==='poderdata'&&(
            <div style={{marginTop:16,padding:'10px 12px',background:'rgba(220,53,69,0.04)',borderRadius:10,border:'1px solid rgba(220,53,69,0.1)'}}>
              <p style={{fontSize:12,color:'#3A5F4E',margin:0,lineHeight:1.6}}>
                <strong>Corrida acirrada.</strong> Lula (38%) e Flávio Bolsonaro (35%) estão empatados tecnicamente dentro da margem de erro de ±2pp. Menor diferença registrada desde maio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pesquisas registradas */}
      <div className="surf" style={{marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 2px'}}>Pesquisas registradas no TSE</p>
            <p style={{fontSize:11.5,color:'#7BA090',margin:0}}>Dados verificados · Clique para ver no TSE</p>
          </div>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer"
            style={{fontSize:12,color:'#0EA472',fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>Ver todas ↗</a>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'2px solid #E6F3EB'}}>
                {['Registro TSE','Instituto','Data','Resultado','Amostra','Margem'].map(h=>(
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#7BA090',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PESQUISAS_REAIS.map((p,i)=>(
                <tr key={i} style={{borderBottom:'1px solid #E6F3EB',background:i%2===0?'transparent':'#FAFCFB'}}>
                  <td style={{padding:'10px 12px'}}>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" style={{fontWeight:700,color:'#0EA472',textDecoration:'none'}}>{p.id} ↗</a>
                  </td>
                  <td style={{padding:'10px 12px'}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                      <span style={{width:8,height:8,borderRadius:'50%',background:p.cor,flexShrink:0}}/>
                      <span style={{fontWeight:600,color:'#091710'}}>{p.instituto}</span>
                    </span>
                  </td>
                  <td style={{padding:'10px 12px',color:'#7BA090',whiteSpace:'nowrap'}}>{p.data}</td>
                  <td style={{padding:'10px 12px',color:'#3A5F4E',fontWeight:500,maxWidth:240}}>{p.resultado}</td>
                  <td style={{padding:'10px 12px',color:'#091710',fontWeight:600}}>{p.amostra}</td>
                  <td style={{padding:'10px 12px',color:'#7BA090'}}>{p.margem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governadores + Senado → link TSE */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[
          {titulo:'Governadores 2026', desc:'195 candidaturas registradas nos 26 estados e DF. Pesquisas estaduais com variação por região.', cor:'#2D7DD2', link:'https://divulgacandcontas.tse.jus.br/divulga/#/candidatos/BR' },
          {titulo:'Senado Federal 2026', desc:'314 candidatos para 54 vagas (2/3 do Senado). Cada estado elege 2 senadores neste pleito.', cor:'#D97706', link:'https://divulgacandcontas.tse.jus.br/divulga/#/candidatos/BR' },
        ].map(s=>(
          <div key={s.titulo} style={{background:'#fff',border:'1px solid #D4E8DC',borderRadius:14,padding:'16px',display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <p style={{fontSize:13.5,fontWeight:700,color:'#091710',margin:'0 0 4px'}}>{s.titulo}</p>
              <p style={{fontSize:12.5,color:'#7BA090',margin:0,lineHeight:1.6}}>{s.desc}</p>
            </div>
            <a href={s.link} target="_blank" rel="noopener noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 18px',background:`${s.cor}10`,color:s.cor,borderRadius:50,fontSize:12.5,fontWeight:700,textDecoration:'none',border:`1.5px solid ${s.cor}30`,width:'fit-content'}}>
              Consultar no TSE ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
