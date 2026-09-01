import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const AG = {
  roteirista:   { label:'Roteirista de Reels',      cor:'#0EA472', bg:'rgba(14,164,114,0.1)',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
  estrategista: { label:'Estrategista de Campanha', cor:'#2D7DD2', bg:'rgba(45,125,210,0.1)',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  copy:         { label:'Copy Político',            cor:'#7B4FD8', bg:'rgba(123,79,216,0.1)',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  consciencia:  { label:'Consciência',              cor:'#D97706', bg:'rgba(217,119,6,0.1)',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
} as Record<string,{label:string;cor:string;bg:string;icon:React.ReactNode}>

function strip(t:string){ return t.replace(/#{1,6}\s+/g,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1').replace(/`(.+?)`/g,'$1').replace(/^[-*+]\s+/gm,'').replace(/\n+/g,' ').trim() }
function ago(d:string){ const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return'agora'; if(s<3600)return`${Math.floor(s/60)}min`; if(s<86400)return`${Math.floor(s/3600)}h`; if(s<604800)return`${Math.floor(s/86400)}d`; return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}) }

export default async function HistoricoPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => cookieStore.get(n)?.value } }
  )
  const { data:{user} } = await supabase.auth.getUser()
  if(!user) redirect('/login')

  const { data:gens } = await supabase.from('geracoes').select('id,agente,input,output,criado_em').eq('user_id',user.id).order('criado_em',{ascending:false}).limit(50)

  // Stats
  const counts = gens?.reduce((acc,g)=>{ acc[g.agente]=(acc[g.agente]||0)+1; return acc },{} as Record<string,number>) ?? {}
  const topAgent = Object.entries(counts).sort(([,a],[,b])=>b-a)[0]
  const last7 = gens?.filter(g=>Date.now()-new Date(g.criado_em).getTime()<604800000).length ?? 0

  return (
    <div style={{maxWidth:1000,margin:'0 auto',padding:'28px 20px',fontFamily:"var(--font-inter),'Inter',sans-serif"}}>
      <style>{`
        .his-grid{display:grid;grid-template-columns:1fr;gap:10px}
        @media(min-width:700px){.his-grid{grid-template-columns:repeat(2,1fr)}}
        @media(min-width:1000px){.his-grid{grid-template-columns:repeat(2,1fr)}}
        .his-card{background:#fff;border:1px solid #D4E8DC;border-radius:14px;padding:16px;text-decoration:none;display:flex;flex-direction:column;gap:10px;transition:box-shadow .14s,transform .14s}
        .his-card:hover{box-shadow:0 6px 20px rgba(14,164,114,0.12);transform:translateY(-2px)}
        .stat-card{background:#fff;border:1px solid #D4E8DC;border-radius:12px;padding:14px 18px}
      `}</style>

      <div style={{marginBottom:24}}>
        <p style={{fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}}>Histórico</p>
        <h1 style={{fontSize:24,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.02em'}}>Suas gerações</h1>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:20}}>
        {[
          {label:'Total gerado', val:String(gens?.length??0), cor:'#0EA472'},
          {label:'Últimos 7 dias', val:String(last7), cor:'#2D7DD2'},
          {label:'Agente favorito', val:topAgent?AG[topAgent[0]]?.label??topAgent[0]:'—', cor:'#D97706'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <p style={{fontSize:11,color:'#7BA090',fontWeight:600,margin:'0 0 6px'}}>{s.label}</p>
            <div style={{fontSize:s.val.length>8?16:22,fontWeight:800,color:s.cor,letterSpacing:'-0.02em',lineHeight:1}}>{s.val}</div>
          </div>
        ))}
      </div>

      {!gens||gens.length===0?(
        <div style={{textAlign:'center',padding:'56px 20px',background:'#fff',borderRadius:16,border:'1px solid #D4E8DC'}}>
          <div style={{width:52,height:52,borderRadius:14,background:'rgba(14,164,114,0.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA472" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p style={{fontSize:16,fontWeight:700,color:'#091710',margin:'0 0 6px'}}>Nenhuma geração ainda</p>
          <p style={{fontSize:13.5,color:'#7BA090',margin:'0 0 22px'}}>Use um dos agentes para criar seu primeiro conteúdo político.</p>
          <Link href="/dashboard" style={{display:'inline-block',padding:'11px 24px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:13,fontWeight:700}}>
            Ir para os agentes →
          </Link>
        </div>
      ):(
        <div className="his-grid">
          {gens.map(g=>{
            const info = AG[g.agente] ?? {label:g.agente,cor:'#0EA472',bg:'rgba(14,164,114,0.1)',icon:null}
            const preview = strip(g.output??'').slice(0,160)
            const inputResumo = Object.values(g.input as Record<string,string>).filter(Boolean).slice(0,2).join(' · ')
            return(
              <Link key={g.id} href={`/historico/${g.id}`} className="his-card" style={{borderLeft:`4px solid ${info.cor}`}}>
                {/* Header */}
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:info.bg,border:`1px solid ${info.cor}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:info.cor}}>
                    {info.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,fontWeight:700,color:'#091710',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{info.label}</div>
                    {inputResumo&&<div style={{fontSize:11.5,color:'#A8C4B8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inputResumo}</div>}
                  </div>
                  <span style={{fontSize:11,color:'#A8C4B8',fontWeight:500,flexShrink:0,whiteSpace:'nowrap'}}>{ago(g.criado_em)}</span>
                </div>
                {/* Preview */}
                <p style={{fontSize:13,color:'#3A5F4E',margin:0,lineHeight:1.7,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical' as const,overflow:'hidden'}}>
                  {preview}
                </p>
                {/* Footer */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:8,borderTop:'1px solid #E6F3EB'}}>
                  <span style={{fontSize:11,color:'#A8C4B8'}}>{new Date(g.criado_em).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}</span>
                  <span style={{fontSize:12,fontWeight:600,color:info.cor}}>Ver completo →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
