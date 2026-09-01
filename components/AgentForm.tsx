'use client'
import { useState, useRef, useEffect } from 'react'
import type { Agente } from '@/types'

export interface FieldConfig {
  name: string; label: string; type: 'text'|'select'|'textarea'
  placeholder?: string; options?: {value:string;label:string}[]; required?: boolean
}

interface AgentFormProps {
  agente: Agente; fields: FieldConfig[]
  agentColor?: string; agentBg?: string
}

export function AgentForm({ agente, fields, agentColor='#0EA472', agentBg='rgba(14,164,114,0.08)' }: AgentFormProps) {
  const [values, setValues] = useState<Record<string,string>>({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [upgrade, setUpgrade] = useState(false)
  const [copied, setCopied] = useState(false)
  const [done, setDone] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showModal])

  const filled = fields.filter(f => f.required && values[f.name]).length
  const total  = fields.filter(f => f.required).length
  const pct    = total > 0 ? Math.round((Math.min(filled,total)/total)*100) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setOutput(''); setError(''); setUpgrade(false); setDone(false); setLoading(true)
    try {
      const res = await fetch('/api/agents', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({agente,input:values}) })
      if (!res.ok) {
        const d = await res.json(); if(d.upgrade) setUpgrade(true); setError(d.error??'Erro ao gerar.'); setLoading(false); return
      }
      const alertUpgrade = res.headers.get('X-Alerte-Upgrade')==='1'
      const reader = res.body!.getReader(); const dec = new TextDecoder()
      while(true) {
        const {done:sd,value} = await reader.read(); if(sd) break
        setOutput(p => { const n=p+dec.decode(value); setTimeout(()=>outputRef.current?.scrollTo({top:outputRef.current.scrollHeight,behavior:'smooth'}),10); return n })
      }
      setDone(true)
      if(alertUpgrade) setTimeout(()=>setShowModal(true),600)
    } catch { setError('Erro de conexão. Tente novamente.') }
    finally { setLoading(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes modalIn{from{opacity:0;transform:scale(.94) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeOverlay{from{opacity:0}to{opacity:1}}
        @keyframes bannerIn{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
        .agent-grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:900px){.agent-grid{grid-template-columns:380px 1fr}}
        .field-inp{padding:11px 14px;border-radius:10px;border:1.5px solid #D4E8DC;font-size:14px;color:#091710;background:#fff;width:100%;box-sizing:border-box;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
        .field-inp:focus{border-color:#0EA472;box-shadow:0 0 0 3px rgba(14,164,114,0.12)}
        .output-area{min-height:320px;max-height:66vh;overflow-y:auto;background:#0A1A14;border-radius:14px;border:1px solid rgba(14,164,114,0.2);padding:22px;font-size:14px;line-height:1.9;color:#D4F0E4;white-space:pre-wrap;font-family:inherit;scrollbar-width:thin;scrollbar-color:rgba(14,164,114,0.3) transparent}
        .output-area::-webkit-scrollbar{width:4px}.output-area::-webkit-scrollbar-thumb{background:rgba(14,164,114,0.3);border-radius:4px}
      `}</style>

      {/* Banner upgrade */}
      {showBanner && (
        <div style={{ position:'fixed',top:0,left:0,right:0,zIndex:999,background:'linear-gradient(90deg,#054E39,#0EA472)',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,boxShadow:'0 4px 20px rgba(14,164,114,0.4)',animation:'bannerIn .4s ease' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,flex:1 }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:'#5DFFC0',boxShadow:'0 0 8px rgba(93,255,192,0.8)' }}/>
            <p style={{ margin:0,color:'#fff',fontSize:13,fontWeight:600 }}>Última geração gratuita usada — faça upgrade para continuar.</p>
          </div>
          <div style={{ display:'flex',gap:8,flexShrink:0 }}>
            <a href="/planos?highlight=essencial" style={{ padding:'7px 16px',borderRadius:50,background:'#5DFFC0',color:'#054E39',fontSize:12,fontWeight:800,textDecoration:'none' }}>Ver planos</a>
            <button onClick={()=>setShowBanner(false)} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',width:28,height:28,borderRadius:'50%',fontSize:14,cursor:'pointer' }}>×</button>
          </div>
        </div>
      )}

      {/* Modal upgrade */}
      {showModal && (
        <div onClick={()=>{setShowModal(false);setShowBanner(true)}} style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(5,25,15,0.8)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeOverlay .25s ease' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:20,maxWidth:440,width:'100%',overflow:'hidden',boxShadow:'0 24px 80px rgba(5,78,57,0.3)',animation:'modalIn .35s cubic-bezier(.34,1.56,.64,1)' }}>
            <div style={{ background:'linear-gradient(135deg,#054E39,#0EA472)',padding:'28px 28px 24px',textAlign:'center' }}>
              <div style={{ fontSize:44,marginBottom:12 }}>⚡</div>
              <h2 style={{ margin:'0 0 6px',color:'#fff',fontSize:20,fontWeight:800 }}>Última geração usada!</h2>
              <p style={{ margin:0,color:'rgba(255,255,255,0.7)',fontSize:13 }}>O conteúdo foi gerado e está disponível abaixo.</p>
            </div>
            <div style={{ padding:'24px 28px 28px' }}>
              <div style={{ background:'rgba(14,164,114,0.06)',borderRadius:12,padding:'14px 16px',marginBottom:20,border:'1px solid rgba(14,164,114,0.15)' }}>
                <p style={{ margin:'0 0 10px',fontSize:13,fontWeight:700,color:'#091710' }}>Com o Pro você tem:</p>
                {['Gerações ilimitadas','Modelo Claude Sonnet (superior)','Suporte prioritário','Novos agentes em primeira mão'].map(b=>(
                  <div key={b} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6,fontSize:13,color:'#091710' }}>
                    <div style={{ width:18,height:18,borderRadius:'50%',background:'rgba(14,164,114,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#0EA472" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    {b}
                  </div>
                ))}
              </div>
              <a href="/planos?highlight=essencial" style={{ display:'block',textAlign:'center',padding:'13px',borderRadius:50,background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',fontSize:14,fontWeight:700,textDecoration:'none',marginBottom:10,boxShadow:'0 6px 20px rgba(14,164,114,0.35)' }}>Fazer upgrade agora</a>
              <button onClick={()=>{setShowModal(false);setShowBanner(true)}} style={{ display:'block',width:'100%',padding:'11px',borderRadius:50,cursor:'pointer',background:'transparent',border:'1px solid #D4E8DC',color:'#7BA090',fontSize:13,fontWeight:500 }}>Ver o conteúdo gerado</button>
            </div>
          </div>
        </div>
      )}

      <div className="agent-grid">
        {/* ── PAINEL DE INPUT ── */}
        <div style={{ background:'#fff',border:'1px solid #D4E8DC',borderRadius:16,overflow:'hidden' }}>
          {/* Progress header */}
          <div style={{ padding:'14px 18px',borderBottom:'1px solid #E6F3EB',background:'#FAFCFB' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
              <span style={{ fontSize:11.5,color:'#3A5F4E',fontWeight:600 }}>Preencha os dados</span>
              <span style={{ fontSize:11.5,fontWeight:700,color: pct===100?'#0EA472':'#7BA090' }}>{pct}%</span>
            </div>
            <div style={{ height:3,background:'#E6F3EB',borderRadius:4,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct}%`,background:pct===100?'#0EA472':'linear-gradient(90deg,#0EA472,#12C080)',borderRadius:4,transition:'width .3s' }}/>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding:'18px',display:'flex',flexDirection:'column',gap:14 }}>
            {fields.map(field => (
              <div key={field.name}>
                <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em' }}>
                  {field.label}{field.required && <span style={{ color:'#0EA472',marginLeft:3 }}>*</span>}
                </label>
                {field.type==='select' ? (
                  <select value={values[field.name]??''} onChange={e=>setValues(p=>({...p,[field.name]:e.target.value}))} required={field.required} className="field-inp" style={{ appearance:'auto' as const }}>
                    <option value="">Selecione...</option>
                    {field.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : field.type==='textarea' ? (
                  <textarea value={values[field.name]??''} onChange={e=>setValues(p=>({...p,[field.name]:e.target.value}))} placeholder={field.placeholder} required={field.required} rows={3} className="field-inp" style={{ resize:'vertical',minHeight:80 }}/>
                ) : (
                  <input type="text" value={values[field.name]??''} onChange={e=>setValues(p=>({...p,[field.name]:e.target.value}))} placeholder={field.placeholder} required={field.required} className="field-inp"/>
                )}
              </div>
            ))}

            {error && (
              <div style={{ padding:'11px 14px',background:upgrade?'rgba(14,164,114,0.06)':'rgba(220,53,69,0.06)',borderRadius:10,fontSize:13,color:upgrade?'#0EA472':'#DC3545',border:`1px solid ${upgrade?'rgba(14,164,114,0.2)':'rgba(220,53,69,0.2)'}`}}>
                {error}{upgrade&&<a href="/planos" style={{ display:'block',marginTop:6,fontWeight:700,color:'#0EA472' }}>Ver planos →</a>}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding:'13px',borderRadius:50,border:'none',background:loading?'rgba(14,164,114,0.45)':'linear-gradient(135deg,#0EA472 0%,#054E39 100%)',color:'#fff',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:loading?'none':'0 4px 16px rgba(14,164,114,0.35)' }}>
              {loading ? (
                <><span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite' }}/> Gerando...</>
              ) : 'Gerar conteúdo'}
            </button>
          </form>
        </div>

        {/* ── PAINEL DE OUTPUT ── */}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {/* Header do output */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:loading?'#F59E0B':done?'#0EA472':'rgba(14,164,114,0.3)',boxShadow:loading?'0 0 6px rgba(245,158,11,0.6)':done?'0 0 6px rgba(14,164,114,0.6)':'none' }}/>
              <span style={{ fontSize:13,fontWeight:600,color:'#091710' }}>
                {loading?'Gerando...':done?'Concluído':'Aguardando'}
              </span>
            </div>
            {output && (
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={handleCopy} style={{ padding:'6px 14px',borderRadius:8,border:'1px solid #D4E8DC',background:'transparent',fontSize:12,color:'#3A5F4E',cursor:'pointer',fontWeight:500 }}>{copied?'Copiado ✓':'Copiar'}</button>
                <button onClick={()=>{setOutput('');setDone(false);setError('')}} style={{ padding:'6px 14px',borderRadius:8,border:'1px solid #D4E8DC',background:'transparent',fontSize:12,color:'#7BA090',cursor:'pointer' }}>Limpar</button>
              </div>
            )}
          </div>

          {/* Terminal output */}
          <div ref={outputRef} className="output-area">
            {!loading && !output && (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',minHeight:260,gap:12,opacity:0.5 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0EA472" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p style={{ fontSize:13.5,fontWeight:600,color:'rgba(212,240,228,0.7)',margin:0 }}>O conteúdo gerado aparecerá aqui</p>
                <p style={{ fontSize:12,color:'rgba(212,240,228,0.35)',margin:0,textAlign:'center',maxWidth:260,lineHeight:1.6 }}>Preencha os campos e clique em Gerar conteúdo</p>
              </div>
            )}
            {loading && !output && (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',minHeight:260,gap:14 }}>
                <div style={{ width:40,height:40,border:'2px solid rgba(14,164,114,0.2)',borderTop:'2px solid #0EA472',borderRadius:'50%',animation:'spin .8s linear infinite' }}/>
                <p style={{ fontSize:14,color:'rgba(212,240,228,0.7)',margin:0,fontWeight:600 }}>Claude está processando...</p>
                <p style={{ fontSize:12,color:'rgba(212,240,228,0.35)',margin:0 }}>Gerando conteúdo estratégico</p>
              </div>
            )}
            {output}
            {loading && output && <span style={{ display:'inline-block',width:8,height:14,background:'#0EA472',marginLeft:2,animation:'blink 1s step-end infinite',borderRadius:1 }}/>}
          </div>

          {done && (
            <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
              <button onClick={handleCopy} style={{ padding:'11px 22px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,border:'none',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(14,164,114,0.3)' }}>
                {copied?'Copiado!':'Copiar conteúdo'}
              </button>
              <button onClick={()=>{setOutput('');setDone(false);setError('')}} style={{ padding:'11px 22px',background:'transparent',color:'#3A5F4E',borderRadius:50,border:'1px solid #D4E8DC',fontSize:13,fontWeight:600,cursor:'pointer' }}>
                Gerar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
