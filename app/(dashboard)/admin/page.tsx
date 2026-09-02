'use client'
import { useEffect, useState } from 'react'

const AG: Record<string,{label:string;cor:string}> = {
  roteirista:  { label:'Roteirista',   cor:'#0EA472' },
  estrategista:{ label:'Estrategista', cor:'#2D7DD2' },
  copy:        { label:'Copy',         cor:'#7B4FD8' },
  consciencia: { label:'Consciência',  cor:'#D97706' },
}
const PLANO_CONFIG: Record<string,{label:string;cor:string;bg:string}> = {
  gratuito:  { label:'Gratuito',  cor:'#7BA090', bg:'rgba(123,160,144,0.1)' },
  essencial: { label:'Essencial', cor:'#0EA472', bg:'rgba(14,164,114,0.1)' },
  pro:       { label:'Pro',       cor:'#0EA472', bg:'rgba(14,164,114,0.12)' },
  agencia:   { label:'Agência',   cor:'#2D7DD2', bg:'rgba(45,125,210,0.1)' },
}

type Stats = {
  totais: { usuarios: number; geracoes: number; tokens: number; custoUSD: number; custoBRL: number }
  mes: { geracoes: number; tokens: number; custoUSD: number; custoBRL: number }
  statsPorPlano: Record<string,number>
  statsPorAgente: Record<string,number>
  geracoesPorDia: Record<string,number>
  usuarios: Array<{id:string;nome:string;email:string;plano:string;cargo:string;cidade:string;estado:string;criado_em:string;totalGeracoes:number}>
  ultimasGeracoes: Array<{id:string;agente:string;email:string;nome:string;tokens_usados:number;criado_em:string}>
}

function ago(d:string){ const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return'agora'; if(s<3600)return`${Math.floor(s/60)}min`; if(s<86400)return`${Math.floor(s/3600)}h`; if(s<604800)return`${Math.floor(s/86400)}d`; return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}) }

export default function AdminPage() {
  const [stats, setStats] = useState<Stats|null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [aba, setAba] = useState<'visao'|'usuarios'|'geracoes'>('visao')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats').then(r=>r.json()).then(d=>{ if(d.error)setErro(d.error); else setStats(d) }).catch(()=>setErro('Erro ao carregar.')).finally(()=>setLoading(false))
  }, [])

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',fontFamily:'var(--font-inter),sans-serif',color:'#7BA090',fontSize:13}}>Carregando...</div>
  if (erro) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',fontFamily:'var(--font-inter),sans-serif'}}><div style={{textAlign:'center'}}><div style={{width:48,height:48,borderRadius:14,background:'rgba(220,53,69,0.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC3545" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><p style={{fontSize:15,fontWeight:700,color:'#DC3545'}}>{erro}</p></div></div>
  if (!stats) return null

  const usuariosFiltrados = stats.usuarios.filter(u => busca===''||[u.nome,u.email,u.plano].some(v=>v?.toLowerCase().includes(busca.toLowerCase())))
  const diasLabels = Object.keys(stats.geracoesPorDia).slice(-14)
  const diasValues = diasLabels.map(d=>stats.geracoesPorDia[d])
  const maxVal = Math.max(...diasValues, 1)

  const F = {fontFamily:'var(--font-inter),sans-serif'}
  const tab = (id: string) => ({
    padding:'9px 20px', borderRadius:9, border:'none',
    background: aba===id?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',
    color: aba===id?'#fff':'#7BA090', fontSize:13, fontWeight:700 as const,
    cursor:'pointer' as const, ...F, transition:'all .12s',
  })

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'26px 20px',...F}}>
      <style>{`.atab-row{display:flex;gap:8px;background:#fff;border:1px solid #D4E8DC;border-radius:12px;padding:5px;width:fit-content;margin-bottom:22px} .user-row:hover{background:#FAFCFB} .surf{background:#fff;border:1px solid #D4E8DC;border-radius:14px;padding:18px}`}</style>

      <div style={{marginBottom:22}}>
        <p style={{fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase' as const,letterSpacing:'0.08em',fontWeight:700}}>Sistema</p>
        <h1 style={{fontSize:24,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.02em'}}>Painel Administrativo</h1>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:22}}>
        {[
          {label:'Usuários',         val:stats.totais.usuarios,  cor:'#0EA472', fmt:(v:number)=>String(v)},
          {label:'Gerações totais',  val:stats.totais.geracoes,  cor:'#2D7DD2', fmt:(v:number)=>String(v)},
          {label:'Gerações este mês',val:stats.mes.geracoes,     cor:'#D97706', fmt:(v:number)=>String(v)},
          {label:'Custo mês (BRL)',  val:stats.mes.custoBRL,     cor:'#DC3545', fmt:(v:number)=>`R$ ${v.toFixed(2)}`},
          {label:'Custo total (BRL)',val:stats.totais.custoBRL,  cor:'#091710', fmt:(v:number)=>`R$ ${v.toFixed(2)}`},
        ].map(s=>(
          <div key={s.label} className="surf">
            <p style={{fontSize:11,color:'#7BA090',fontWeight:600,margin:'0 0 6px'}}>{s.label}</p>
            <div style={{fontSize:20,fontWeight:800,color:s.cor,letterSpacing:'-0.02em',lineHeight:1}}>{s.fmt(s.val)}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="atab-row">
        {(['visao','usuarios','geracoes'] as const).map(t=>(
          <button key={t} style={tab(t)} onClick={()=>setAba(t)}>
            {t==='visao'?'Visão geral':t==='usuarios'?'Usuários':'Gerações'}
          </button>
        ))}
      </div>

      {/* VISÃO GERAL */}
      {aba==='visao' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>
          {/* Por plano */}
          <div className="surf">
            <p style={{fontSize:13,fontWeight:700,color:'#091710',margin:'0 0 14px'}}>Usuários por plano</p>
            {Object.entries(stats.statsPorPlano).map(([plano,count])=>{
              const cfg=PLANO_CONFIG[plano]??{label:plano,cor:'#7BA090',bg:'rgba(123,160,144,0.1)'}
              const pct=stats.totais.usuarios>0?Math.round((count/stats.totais.usuarios)*100):0
              return(
                <div key={plano} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:cfg.bg,color:cfg.cor}}>{cfg.label}</span>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:13,fontWeight:700,color:'#091710'}}>{count}</span>
                      <span style={{fontSize:11,color:'#A8C4B8'}}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{height:5,background:'#F1F6F3',borderRadius:4,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:cfg.cor,borderRadius:4}}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Por agente */}
          <div className="surf">
            <p style={{fontSize:13,fontWeight:700,color:'#091710',margin:'0 0 14px'}}>Gerações por agente</p>
            {Object.entries(stats.statsPorAgente).map(([agente,count])=>{
              const cfg=AG[agente]??{label:agente,cor:'#7BA090'}
              const total=Object.values(stats.statsPorAgente).reduce((s,v)=>s+v,0)
              const pct=total>0?Math.round((count/total)*100):0
              return(
                <div key={agente} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <div style={{width:8,height:8,borderRadius:2,background:cfg.cor}}/>
                      <span style={{fontSize:13,color:'#091710',fontWeight:500}}>{cfg.label}</span>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:13,fontWeight:700,color:'#091710'}}>{count}</span>
                      <span style={{fontSize:11,color:'#A8C4B8'}}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{height:5,background:'#F1F6F3',borderRadius:4,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:cfg.cor,borderRadius:4}}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Atividade 14 dias */}
          <div className="surf" style={{gridColumn:'1/-1'}}>
            <p style={{fontSize:13,fontWeight:700,color:'#091710',margin:'0 0 14px'}}>Atividade — últimos 14 dias</p>
            <div style={{display:'flex',alignItems:'flex-end',gap:6,height:60}}>
              {diasLabels.map((dia,i)=>{
                const v=diasValues[i]
                const h=v>0?Math.max((v/maxVal)*60,4):2
                const isToday=dia===new Date().toISOString().slice(0,10)
                return(
                  <div key={dia} style={{flex:1,display:'flex',flexDirection:'column' as const,alignItems:'center',gap:3}}>
                    {v>0&&<span style={{fontSize:9,color:'#7BA090',fontWeight:600}}>{v}</span>}
                    <div title={`${dia}: ${v}`} style={{width:'100%',height:h,background:isToday?'#0EA472':v>0?'rgba(14,164,114,0.5)':'#E6F3EB',borderRadius:3}}/>
                    <span style={{fontSize:8,color:isToday?'#0EA472':'#A8C4B8',fontWeight:isToday?700:400,whiteSpace:'nowrap' as const}}>
                      {new Date(dia+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* USUÁRIOS */}
      {aba==='usuarios' && (
        <div>
          <div style={{position:'relative',marginBottom:14}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8C4B8" strokeWidth="2" strokeLinecap="round" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)'}}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar usuário por nome, email ou plano..."
              style={{width:'100%',padding:'11px 14px 11px 40px',borderRadius:11,border:'1.5px solid #D4E8DC',fontSize:13.5,background:'#fff',outline:'none',boxSizing:'border-box' as const,fontFamily:'inherit',color:'#091710'}}/>
          </div>
          <div className="surf" style={{overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse' as const,fontSize:13}}>
              <thead>
                <tr style={{borderBottom:'2px solid #E6F3EB'}}>
                  {['Usuário','Plano','Cargo','Cidade/UF','Gerações','Cadastro'].map(h=>(
                    <th key={h} style={{padding:'10px 12px',textAlign:'left' as const,fontSize:11,fontWeight:700,color:'#7BA090',textTransform:'uppercase' as const,letterSpacing:'0.05em',whiteSpace:'nowrap' as const}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u,i)=>{
                  const pc=PLANO_CONFIG[u.plano]??{label:u.plano,cor:'#7BA090',bg:'rgba(123,160,144,0.1)'}
                  return(
                    <tr key={u.id} className="user-row" style={{borderBottom:'1px solid #E6F3EB'}}>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{fontWeight:600,color:'#091710'}}>{u.nome||'—'}</div>
                        <div style={{fontSize:11,color:'#A8C4B8'}}>{u.email}</div>
                      </td>
                      <td style={{padding:'10px 12px'}}><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:pc.bg,color:pc.cor}}>{pc.label}</span></td>
                      <td style={{padding:'10px 12px',color:'#3A5F4E'}}>{u.cargo||'—'}</td>
                      <td style={{padding:'10px 12px',color:'#3A5F4E'}}>{[u.cidade,u.estado].filter(Boolean).join('/')}</td>
                      <td style={{padding:'10px 12px',fontWeight:700,color:'#091710'}}>{u.totalGeracoes}</td>
                      <td style={{padding:'10px 12px',color:'#A8C4B8',fontSize:12}}>{ago(u.criado_em)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GERAÇÕES */}
      {aba==='geracoes' && (
        <div className="surf" style={{overflow:'auto'}}>
          <p style={{fontSize:13,fontWeight:700,color:'#091710',margin:'0 0 14px'}}>Últimas gerações — todos os usuários</p>
          <table style={{width:'100%',borderCollapse:'collapse' as const,fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'2px solid #E6F3EB'}}>
                {['Usuário','Agente','Tokens','Quando'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left' as const,fontSize:11,fontWeight:700,color:'#7BA090',textTransform:'uppercase' as const,letterSpacing:'0.05em',whiteSpace:'nowrap' as const}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.ultimasGeracoes.map((g,i)=>{
                const cfg=AG[g.agente]??{label:g.agente,cor:'#7BA090'}
                return(
                  <tr key={g.id} className="user-row" style={{borderBottom:'1px solid #E6F3EB'}}>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{fontWeight:600,color:'#091710'}}>{g.nome||'—'}</div>
                      <div style={{fontSize:11,color:'#A8C4B8'}}>{g.email}</div>
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:8,height:8,borderRadius:2,background:cfg.cor,flexShrink:0}}/>
                        <span style={{color:'#091710',fontWeight:500}}>{cfg.label}</span>
                      </div>
                    </td>
                    <td style={{padding:'10px 12px',color:'#3A5F4E',fontWeight:500}}>{(g.tokens_usados||0).toLocaleString()}</td>
                    <td style={{padding:'10px 12px',color:'#A8C4B8',fontSize:12}}>{ago(g.criado_em)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
