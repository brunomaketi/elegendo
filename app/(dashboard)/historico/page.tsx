import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HistoricoClient from '@/components/HistoricoClient'

export default async function HistoricoPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: gens } = await supabase
    .from('geracoes').select('id,agente,input,output,criado_em')
    .eq('user_id', user.id).order('criado_em', { ascending: false }).limit(100)

  const counts = (gens ?? []).reduce((acc: Record<string,number>, g) => { acc[g.agente] = (acc[g.agente]||0)+1; return acc }, {})
  const topAgent = Object.entries(counts).sort(([,a],[,b]) => b-a)[0]?.[0] ?? ''
  const last7 = (gens ?? []).filter(g => Date.now()-new Date(g.criado_em).getTime() < 604800000).length

  if (!gens || gens.length === 0) {
    return (
      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 20px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
        <p style={{ fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase' as const,letterSpacing:'0.08em',fontWeight:700 }}>Histórico</p>
        <h1 style={{ fontSize:24,fontWeight:800,color:'#091710',margin:'0 0 28px',letterSpacing:'-0.02em' }}>Suas gerações</h1>
        <div style={{ textAlign:'center',padding:'56px',background:'#fff',borderRadius:16,border:'1px solid #D4E8DC' }}>
          <div style={{ width:52,height:52,borderRadius:14,background:'rgba(14,164,114,0.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA472" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p style={{ fontSize:16,fontWeight:700,color:'#091710',margin:'0 0 6px' }}>Nenhuma geração ainda</p>
          <p style={{ fontSize:13.5,color:'#7BA090',margin:'0 0 22px' }}>Use um dos agentes para criar seu primeiro conteúdo político.</p>
          <Link href="/dashboard" style={{ display:'inline-block',padding:'11px 24px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:13,fontWeight:700,textDecoration:'none' }}>
            Ir para os agentes →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', padding:'28px 20px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <p style={{ fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase' as const,letterSpacing:'0.08em',fontWeight:700 }}>Histórico</p>
      <h1 style={{ fontSize:24,fontWeight:800,color:'#091710',margin:'0 0 24px',letterSpacing:'-0.02em' }}>Suas gerações</h1>
      <HistoricoClient
        gens={gens.map(g => ({ ...g, input: (g.input as Record<string,string>) ?? {} }))}
        stats={{ total: gens.length, last7, topAgent }}
      />
    </div>
  )
}
