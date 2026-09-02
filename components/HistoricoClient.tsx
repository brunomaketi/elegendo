'use client'
import { useState } from 'react'
import Link from 'next/link'

const AG: Record<string,{label:string;cor:string;bg:string;icon:React.ReactNode}> = {
  roteirista:   { label:'Roteirista de Reels',      cor:'#0EA472', bg:'rgba(14,164,114,0.1)',
    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
  estrategista: { label:'Estrategista de Campanha', cor:'#2D7DD2', bg:'rgba(45,125,210,0.1)',
    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  copy:         { label:'Copy Político',            cor:'#7B4FD8', bg:'rgba(123,79,216,0.1)',
    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  consciencia:  { label:'Consciência',              cor:'#D97706', bg:'rgba(217,119,6,0.1)',
    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
}

function strip(t:string){ return t.replace(/#{1,6}\s+/g,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1').replace(/`(.+?)`/g,'$1').replace(/^[-*+]\s+/gm,'').replace(/\n+/g,' ').trim() }
function ago(d:string){ const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return'agora'; if(s<3600)return`${Math.floor(s/60)}min atrás`; if(s<86400)return`${Math.floor(s/3600)}h atrás`; if(s<604800)return`${Math.floor(s/86400)}d atrás`; return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'}) }

function dateGroup(d:string){ const today=new Date().toISOString().slice(0,10); const day=d.slice(0,10); const diff=Math.floor((new Date(today).getTime()-new Date(day).getTime())/86400000); if(diff===0)return'Hoje'; if(diff<=7)return'Esta semana'; if(diff<=30)return'Este mês'; return new Date(d).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}) }

type Gen = {id:string;agente:string;input:Record<string,string>;output:string;criado_em:string}
type Stats = {total:number;last7:number;topAgent:string}

export default function HistoricoClient({ gens, stats }: { gens: Gen[]; stats: Stats }) {
  const [filtro, setFiltro] = useState<string|null>(null)
  const [busca, setBusca] = useState('')
  const [copiedId, setCopiedId] = useState<string|null>(null)

  const filtered = gens.filter(g => {
    if (filtro && g.agente !== filtro) return false
    if (busca) {
      const b = busca.toLowerCase()
      const preview = strip(g.output ?? '')
      const inputStr = Object.values(g.input||{}).join(' ').toLowerCase()
      if (!preview.toLowerCase().includes(b) && !inputStr.includes(b)) return false
    }
    return true
  })

  // Group by date
  const groups: Record<string,Gen[]> = {}
  filtered.forEach(g => {
    const gr = dateGroup(g.criado_em)
    if (!groups[gr]) groups[gr] = []
    groups[gr].push(g)
  })

  const handleCopy = (id:string, txt:string) => {
    navigator.clipboard.writeText(txt)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <style>{`
        .hcard{background:#fff;border:1px solid #D4E8DC;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px;position:relative;transition:box-shadow .14s}
        .hcard:hover{box-shadow:0 4px 18px rgba(14,164,114,0.1)}
        .hgrid{display:grid;grid-template-columns:1fr;gap:10px}
        @media(min-width:720px){.hgrid{grid-template-columns:repeat(2,1fr)}}
        .tab-f{padding:8px 16px;border-radius:50px;border:none;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .12s;display:flex;align-items:center;gap:6px}
      `}</style>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginBottom:22}}>
        {[
          {label:'Total gerado', val:String(stats.total), cor:'#0EA472'},
          {label:'Últimos 7 dias', val:String(stats.last7), cor:'#2D7DD2'},
          {label:'Agente favorito', val:stats.topAgent&&AG[stats.topAgent]?AG[stats.topAgent].label:stats.topAgent||'—', cor:stats.topAgent&&AG[stats.topAgent]?AG[stats.topAgent].cor:'#D97706'},
        ].map(s=>(
          <div key={s.label} style={{background:'#fff',border:'1px solid #D4E8DC',borderRadius:12,padding:'14px 18px'}}>
            <p style={{fontSize:11,color:'#7BA090',fontWeight:600,margin:'0 0 6px'}}>{s.label}</p>
            <div style={{fontSize:s.val.length>12?13:20,fontWeight:800,color:s.cor,lineHeight:1.2}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{marginBottom:18,display:'flex',flexDirection:'column',gap:12}}>
        <div style={{position:'relative'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8C4B8" strokeWidth="2" strokeLinecap="round" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)'}}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar nas gerações..."
            style={{width:'100%',padding:'11px 14px 11px 40px',borderRadius:11,border:'1.5px solid #D4E8DC',fontSize:13.5,color:'#091710',background:'#fff',outline:'none',boxSizing:'border-box' as const,fontFamily:'inherit'}}
            onFocus={e=>(e.target.style.borderColor='#0EA472')} onBlur={e=>(e.target.style.borderColor='#D4E8DC')}/>
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap' as const}}>
          <button className="tab-f" onClick={()=>setFiltro(null)} style={{background:!filtro?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',border:`1px solid ${!filtro?'transparent':'#D4E8DC'}`,color:!filtro?'#fff':'#7BA090'}}>
            Todos <span style={{fontSize:11,background:'rgba(255,255,255,0.2)',padding:'1px 7px',borderRadius:20}}>{gens.length}</span>
          </button>
          {Object.entries(AG).map(([id,info])=>{
            const count = gens.filter(g=>g.agente===id).length
            if (!count) return null
            return(
              <button key={id} className="tab-f" onClick={()=>setFiltro(filtro===id?null:id)}
                style={{background:filtro===id?`${info.cor}`:'transparent',border:`1px solid ${filtro===id?'transparent':info.cor+'30'}`,color:filtro===id?'#fff':info.cor}}>
                <span style={{color:'inherit',display:'flex',alignItems:'center'}}>{info.icon}</span>
                {info.label.split(' ')[0]}
                <span style={{fontSize:11,background:'rgba(255,255,255,0.25)',padding:'1px 7px',borderRadius:20}}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'48px',background:'#fff',borderRadius:16,border:'1px solid #D4E8DC',color:'#7BA090'}}>
          <div style={{fontSize:32,marginBottom:12}}>🔍</div>
          <p style={{fontSize:14,fontWeight:600,margin:0}}>Nenhum resultado encontrado</p>
          <p style={{fontSize:13,margin:'6px 0 0'}}>Tente outros termos ou remova os filtros</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {Object.entries(groups).map(([grupo,items])=>(
            <div key={grupo}>
              <p style={{fontSize:11,fontWeight:700,color:'#A8C4B8',textTransform:'uppercase' as const,letterSpacing:'0.07em',margin:'0 0 10px'}}>{grupo} — {items.length} {items.length===1?'geração':'gerações'}</p>
              <div className="hgrid">
                {items.map(g=>{
                  const info=AG[g.agente]??{label:g.agente,cor:'#0EA472',bg:'rgba(14,164,114,0.1)',icon:null}
                  const preview=strip(g.output??'').slice(0,160)
                  const inputResumo=Object.values(g.input||{}).filter(Boolean).slice(0,2).join(' · ')
                  return(
                    <div key={g.id} className="hcard" style={{borderLeft:`4px solid ${info.cor}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:36,height:36,borderRadius:10,background:info.bg,border:`1px solid ${info.cor}22`,display:'flex',alignItems:'center',justifyContent:'center',color:info.cor,flexShrink:0}}>
                          {info.icon}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#091710'}}>{info.label}</div>
                          {inputResumo&&<div style={{fontSize:11,color:'#A8C4B8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{inputResumo}</div>}
                        </div>
                        <span style={{fontSize:11,color:'#A8C4B8',flexShrink:0}}>{ago(g.criado_em)}</span>
                      </div>
                      <p style={{fontSize:13,color:'#3A5F4E',margin:0,lineHeight:1.7,display:'-webkit-box' as any,WebkitLineClamp:3,WebkitBoxOrient:'vertical' as any,overflow:'hidden'}}>
                        {preview}…
                      </p>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:8,borderTop:'1px solid #E6F3EB'}}>
                        <button onClick={()=>handleCopy(g.id,g.output)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',background:copiedId===g.id?`${info.cor}15`:'#F7FBF8',border:`1px solid ${info.cor}25`,borderRadius:8,fontSize:12,fontWeight:600,color:copiedId===g.id?info.cor:'#7BA090',cursor:'pointer',fontFamily:'inherit'}}>
                          {copiedId===g.id?'Copiado ✓':'Copiar'}
                        </button>
                        <Link href={`/historico/${g.id}`} style={{fontSize:12,fontWeight:700,color:info.cor,textDecoration:'none'}}>
                          Ver completo →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
