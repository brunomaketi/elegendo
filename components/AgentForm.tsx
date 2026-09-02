'use client'
import { useState, useRef } from 'react'
import type { Agente } from '@/types'
import Link from 'next/link'

export interface FieldConfig {
  name: string; label: string; type: 'text'|'select'|'textarea'
  placeholder?: string; options?: {value:string;label:string}[]; required?: boolean
}

interface AgentFormProps {
  agente: Agente; fields: FieldConfig[]
  agentColor?: string
}

// ── Markdown renderer ─────────────────────────────────────────────────
function renderInline(str: string, color: string): React.ReactNode {
  const parts = str.split(/(\*\*(?:[^*]|\*(?!\*))+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4)
      return <strong key={i} style={{ fontWeight: 700, color: '#091710' }}>{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2)
      return <em key={i} style={{ fontStyle: 'italic' }}>{p.slice(1, -1)}</em>
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2)
      return <code key={i} style={{ background: `${color}14`, color, padding: '1px 6px', borderRadius: 4, fontSize: '0.88em', fontWeight: 600 }}>{p.slice(1, -1)}</code>
    return p
  })
}

function MarkdownOutput({ text, color }: { text: string; color: string }) {
  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0
  let listItems: { text: string; indent: number }[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (!listItems.length) return
    const Tag = listType === 'ol' ? 'ol' : 'ul'
    blocks.push(
      <Tag key={`list-${i}`} style={{ margin: '8px 0 10px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {listItems.map((item, k) => (
          <li key={k} style={{ fontSize: 14, color: '#3A5F4E', lineHeight: 1.75 }}>
            {renderInline(item.text, color)}
          </li>
        ))}
      </Tag>
    )
    listItems = []; listType = null
  }

  while (i < lines.length) {
    const raw = lines[i]
    const t = raw.trim()
    if (t.startsWith('# ')) {
      flushList()
      blocks.push(<h1 key={i} style={{ fontSize: 20, fontWeight: 800, color: '#091710', margin: '20px 0 10px', letterSpacing: '-0.02em', paddingBottom: 8, borderBottom: `2px solid ${color}30` }}>{renderInline(t.slice(2), color)}</h1>)
    } else if (t.startsWith('## ')) {
      flushList()
      blocks.push(
        <h2 key={i} style={{ fontSize: 16, fontWeight: 700, color: '#091710', margin: '16px 0 6px', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 16, background: color, borderRadius: 2, display: 'inline-block', flexShrink: 0 }}/>
          {renderInline(t.slice(3), color)}
        </h2>
      )
    } else if (t.startsWith('### ')) {
      flushList()
      blocks.push(<h3 key={i} style={{ fontSize: 14.5, fontWeight: 700, color: '#3A5F4E', margin: '12px 0 4px' }}>{renderInline(t.slice(4), color)}</h3>)
    } else if (t === '---' || t === '___') {
      flushList()
      blocks.push(<hr key={i} style={{ border: 'none', borderTop: `1px solid ${color}20`, margin: '16px 0' }}/>)
    } else if (/^[-*]\s/.test(t)) {
      if (listType !== 'ul') { flushList(); listType = 'ul' }
      listItems.push({ text: t.slice(2), indent: 0 })
    } else if (/^\d+\.\s/.test(t)) {
      if (listType !== 'ol') { flushList(); listType = 'ol' }
      listItems.push({ text: t.replace(/^\d+\.\s/, ''), indent: 0 })
    } else if (t === '') {
      flushList()
    } else {
      flushList()
      blocks.push(<p key={i} style={{ fontSize: 14, color: '#3A5F4E', lineHeight: 1.85, margin: '4px 0' }}>{renderInline(t, color)}</p>)
    }
    i++
  }
  flushList()
  return <div style={{ fontFamily: "var(--font-inter),'Inter',sans-serif" }}>{blocks}</div>
}

export function AgentForm({ agente, fields, agentColor = '#0EA472' }: AgentFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [upgrade, setUpgrade] = useState(false)
  const [copied, setCopied] = useState(false)
  const [done, setDone] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const filled = fields.filter(f => f.required && values[f.name]).length
  const total  = fields.filter(f => f.required).length
  const pct    = total > 0 ? Math.round((Math.min(filled, total) / total) * 100) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setOutput(''); setError(''); setUpgrade(false); setDone(false); setLoading(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agente, input: values }),
      })
      if (!res.ok) {
        const d = await res.json()
        if (d.upgrade) setUpgrade(true)
        setError(d.error ?? 'Erro ao gerar.'); setLoading(false); return
      }
      const alertUpgrade = res.headers.get('X-Alerte-Upgrade') === '1'
      const reader = res.body!.getReader(); const dec = new TextDecoder()
      while (true) {
        const { done: sd, value } = await reader.read(); if (sd) break
        setOutput(p => {
          const n = p + dec.decode(value)
          setTimeout(() => outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' }), 10)
          return n
        })
      }
      setDone(true)
      if (alertUpgrade) setTimeout(() => setShowModal(true), 600)
    } catch { setError('Erro de conexão. Tente novamente.') }
    finally { setLoading(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }


  const handlePDF = () => {
    const w = window.open('','_blank','width=900,height=700')
    if (!w) return
    const lines = output.split('\n')
    let html = ''
    for (const line of lines) {
      const t = line.trim()
      if (!t) { html += '<br/>'; continue }
      if (t.startsWith('### ')) { html += '<h3>'+t.slice(4)+'</h3>'; continue }
      if (t.startsWith('## '))  { html += '<h2>'+t.slice(3)+'</h2>'; continue }
      if (t.startsWith('# '))   { html += '<h1>'+t.slice(2)+'</h1>'; continue }
      if (t === '---')           { html += '<hr/>'; continue }
      const p = t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
      if (t.startsWith('- ') || t.startsWith('* ')) { html += '<li>'+p.slice(2)+'</li>'; continue }
      html += '<p>'+p+'</p>'
    }
    const date = new Date().toLocaleDateString('pt-BR')
    const time = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
    w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Elegendo</title><style>body{font-family:Inter,sans-serif;max-width:780px;margin:32px auto;padding:0 32px;color:#091710;line-height:1.8}.hdr{background:linear-gradient(135deg,#054E39,#0EA472);color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:28px}h1{font-size:20px;font-weight:800;color:#091710;margin:18px 0 8px;border-bottom:2px solid #D4E8DC;padding-bottom:8px}h2{font-size:16px;font-weight:700;color:#0EA472;margin:14px 0 5px;border-left:3px solid #0EA472;padding-left:10px}h3{font-size:14px;font-weight:700;margin:10px 0 4px}p,li{font-size:14px;color:#3A5F4E;margin:5px 0;line-height:1.8}li{margin-left:20px}hr{border:none;border-top:1px solid #D4E8DC;margin:16px 0}strong{font-weight:700;color:#091710}@media print{body{margin:16px}}</style></head><body><div class="hdr"><div style="font-size:17px;font-weight:800;color:#fff">Elegendo — Conteúdo Gerado</div><div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px">'+date+' às '+time+'</div></div>'+html+'</body></html>')
    w.document.close()
    setTimeout(() => w.print(), 600)
  }
  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .agent-grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:900px){.agent-grid{grid-template-columns:360px 1fr}}
        .finp{padding:11px 14px;border-radius:10px;border:1.5px solid #D4E8DC;font-size:14px;color:#091710;background:#fff;width:100%;box-sizing:border-box;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
        .finp:focus{border-color:${agentColor};box-shadow:0 0 0 3px ${agentColor}20}
        .output-scroll{max-height:68vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:${agentColor}30 transparent}
        .output-scroll::-webkit-scrollbar{width:4px}.output-scroll::-webkit-scrollbar-thumb{background:${agentColor}30;border-radius:4px}
      `}</style>

      {/* Modal upgrade */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(5,25,15,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff',borderRadius:20,maxWidth:420,width:'100%',overflow:'hidden',boxShadow:'0 24px 80px rgba(5,78,57,0.3)',animation:'modalIn .3s ease' }}>
            <div style={{ background:`linear-gradient(135deg,#054E39,${agentColor})`,padding:'28px 28px 22px',textAlign:'center' }}>
              <div style={{ width:48,height:48,borderRadius:14,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h2 style={{ margin:'0 0 4px',color:'#fff',fontSize:18,fontWeight:800 }}>Última geração gratuita!</h2>
              <p style={{ margin:0,color:'rgba(255,255,255,0.65)',fontSize:13 }}>Faça upgrade para continuar gerando.</p>
            </div>
            <div style={{ padding:'22px 26px 26px' }}>
              {['Gerações ilimitadas','Modelo Claude superior','Suporte prioritário','Novos agentes em primeira mão'].map(b => (
                <div key={b} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8,fontSize:13.5,color:'#091710' }}>
                  <div style={{ width:18,height:18,borderRadius:'50%',background:`${agentColor}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke={agentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>{b}
                </div>
              ))}
              <a href="/planos" style={{ display:'block',textAlign:'center',padding:'12px',borderRadius:50,background:`linear-gradient(135deg,${agentColor},#054E39)`,color:'#fff',fontSize:14,fontWeight:700,textDecoration:'none',marginTop:16,boxShadow:`0 6px 20px ${agentColor}35` }}>Fazer upgrade agora</a>
              <button onClick={() => setShowModal(false)} style={{ display:'block',width:'100%',padding:'10px',marginTop:8,background:'transparent',border:'1px solid #D4E8DC',borderRadius:50,color:'#7BA090',fontSize:13,cursor:'pointer' }}>Ver o conteúdo gerado</button>
            </div>
          </div>
        </div>
      )}

      <div className="agent-grid">
        {/* ── INPUT ── */}
        <div style={{ background:'#fff',border:'1px solid #D4E8DC',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column' }}>
          <div style={{ padding:'12px 16px',borderBottom:'1px solid #E6F3EB',background:'#FAFCFB' }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
              <span style={{ fontSize:11,color:'#3A5F4E',fontWeight:600 }}>Preencha os dados</span>
              <span style={{ fontSize:11,fontWeight:700,color:pct===100?agentColor:'#7BA090' }}>{pct}%</span>
            </div>
            <div style={{ height:3,background:'#E6F3EB',borderRadius:4,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct}%`,background:pct===100?agentColor:`linear-gradient(90deg,${agentColor},#5DFFC0)`,borderRadius:4,transition:'width .3s' }}/>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ padding:'16px',display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            {fields.map(field => (
              <div key={field.name}>
                <label style={{ fontSize:10.5,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.06em' }}>
                  {field.label}{field.required && <span style={{ color:agentColor,marginLeft:2 }}>*</span>}
                </label>
                {field.type==='select' ? (
                  <select value={values[field.name]??''} onChange={e => setValues(p => ({ ...p,[field.name]:e.target.value }))} required={field.required} className="finp" style={{ appearance:'auto' as const }}>
                    <option value="">Selecione...</option>
                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : field.type==='textarea' ? (
                  <textarea value={values[field.name]??''} onChange={e => setValues(p => ({ ...p,[field.name]:e.target.value }))} placeholder={field.placeholder} required={field.required} rows={3} className="finp" style={{ resize:'vertical',minHeight:72 }}/>
                ) : (
                  <input type="text" value={values[field.name]??''} onChange={e => setValues(p => ({ ...p,[field.name]:e.target.value }))} placeholder={field.placeholder} required={field.required} className="finp"/>
                )}
              </div>
            ))}
            {error && (
              <div style={{ padding:'10px 14px',background:upgrade?`${agentColor}08`:'rgba(220,53,69,0.06)',borderRadius:10,fontSize:13,color:upgrade?agentColor:'#DC3545',border:`1px solid ${upgrade?agentColor+'30':'rgba(220,53,69,0.2)'}` }}>
                {error}{upgrade && <a href="/planos" style={{ display:'block',marginTop:5,fontWeight:700,color:agentColor }}>Ver planos →</a>}
              </div>
            )}
            <button type="submit" disabled={loading} style={{ padding:'13px',borderRadius:50,border:'none',background:loading?`${agentColor}60`:`linear-gradient(135deg,${agentColor},#054E39)`,color:'#fff',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:loading?'none':`0 4px 16px ${agentColor}35` }}>
              {loading ? <><span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite' }}/> Gerando...</> : 'Gerar conteúdo'}
            </button>
          </form>
        </div>

        {/* ── OUTPUT ── */}
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {/* Status bar */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'#fff',border:'1px solid #D4E8DC',borderRadius:12 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:loading?'#F59E0B':done?agentColor:'#D4E8DC',boxShadow:loading?'0 0 8px rgba(245,158,11,0.6)':done?`0 0 8px ${agentColor}60`:'none',transition:'all .3s' }}/>
              <span style={{ fontSize:13,fontWeight:600,color:'#091710' }}>{loading?'Claude está gerando...':done?'Geração concluída':'Aguardando'}</span>
            </div>
            {output && (
              <div style={{ display:'flex',gap:6 }}>
                <button onClick={handleCopy} style={{ padding:'5px 12px',borderRadius:8,border:`1px solid ${agentColor}40`,background:copied?`${agentColor}10`:'transparent',fontSize:11.5,color:agentColor,cursor:'pointer',fontWeight:600 }}>{copied?'Copiado ✓':'Copiar'}</button>
                <button onClick={() => { setOutput(''); setDone(false); setError('') }} style={{ padding:'5px 12px',borderRadius:8,border:'1px solid #D4E8DC',background:'transparent',fontSize:11.5,color:'#7BA090',cursor:'pointer' }}>Limpar</button>
              </div>
            )}
          </div>

          {/* Content area */}
          <div ref={outputRef} className="output-scroll" style={{ background:'#fff',border:`1px solid ${output?agentColor+'30':'#D4E8DC'}`,borderRadius:14,padding:'20px 22px',minHeight:340,transition:'border-color .3s' }}>
            {!loading && !output && (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,gap:14,opacity:.5 }}>
                <div style={{ width:44,height:44,borderRadius:13,background:`${agentColor}10`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={agentColor} strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <p style={{ fontSize:14,fontWeight:600,color:'#7BA090',margin:0 }}>O conteúdo gerado aparecerá aqui</p>
                <p style={{ fontSize:12.5,color:'#A8C4B8',margin:0,textAlign:'center',lineHeight:1.6,maxWidth:260 }}>Preencha os campos ao lado e clique em Gerar conteúdo</p>
              </div>
            )}
            {loading && !output && (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,gap:14 }}>
                <div style={{ width:40,height:40,border:`2px solid ${agentColor}20`,borderTop:`2px solid ${agentColor}`,borderRadius:'50%',animation:'spin .8s linear infinite' }}/>
                <p style={{ fontSize:14,color:'#7BA090',margin:0,fontWeight:600 }}>Claude está processando...</p>
              </div>
            )}
            {output && <MarkdownOutput text={output} color={agentColor}/>}
            {loading && output && <span style={{ display:'inline-block',width:2,height:16,background:agentColor,marginLeft:2,verticalAlign:'middle',animation:'blink .9s step-end infinite',borderRadius:1 }}/>}
          </div>

          {done && (
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              <button onClick={handleCopy} style={{ padding:'11px 22px',background:`linear-gradient(135deg,${agentColor},#054E39)`,color:'#fff',borderRadius:50,border:'none',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${agentColor}30` }}>
                {copied?'Copiado!':'Copiar conteúdo'}
              </button>
              <button onClick={handlePDF} style={{ padding:'11px 22px',background:'transparent',color:'#3A5F4E',borderRadius:50,border:'1px solid #D4E8DC',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:'inherit' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Baixar PDF
              </button>
              <button onClick={() => { setOutput(''); setDone(false); setError('') }} style={{ padding:'11px 22px',background:'transparent',color:'#A8C4B8',borderRadius:50,border:'1px solid #E6F3EB',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
                Gerar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
