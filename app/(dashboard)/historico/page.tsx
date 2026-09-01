import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const AGENTES: Record<string, { label: string; cor: string; bg: string; svg: string }> = {
  roteirista:   { label: 'Roteirista de Reels',      cor: '#0EA472', bg: 'rgba(14,164,114,0.1)',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' },
  estrategista: { label: 'Estrategista de Campanha', cor: '#2D7DD2', bg: 'rgba(45,125,210,0.1)',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
  copy:         { label: 'Copy Político',            cor: '#7B4FD8', bg: 'rgba(123,79,216,0.1)',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' },
  consciencia:  { label: 'Consciência',              cor: '#D97706', bg: 'rgba(217,119,6,0.1)',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' },
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_{1,2}(.+?)_{1,2}/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  const h   = Math.floor(diff / 3600000)
  const d   = Math.floor(diff / 86400000)
  if (min < 1)  return 'agora'
  if (min < 60) return `${min}min atrás`
  if (h < 24)   return `${h}h atrás`
  if (d < 7)    return `${d}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const AgentIcon = ({ id, cor, bg }: { id: string; cor: string; bg: string }) => {
  const icons: Record<string, React.ReactNode> = {
    roteirista:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    estrategista: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    copy:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    consciencia:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  }
  return (
    <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, border: `1px solid ${cor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icons[id] ?? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.6"><circle cx="12" cy="12" r="10"/></svg>}
    </div>
  )
}

export default async function HistoricoPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: geracoes } = await supabase
    .from('geracoes').select('id,agente,input,output,criado_em')
    .eq('user_id', user.id).order('criado_em', { ascending: false }).limit(50)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 22px', fontFamily: "var(--font-inter),'Inter',sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: '#7BA090', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Histórico</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091710', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Suas gerações</h1>
        <p style={{ fontSize: 13.5, color: '#7BA090', margin: 0 }}>Clique em qualquer item para ver o conteúdo completo.</p>
      </div>

      {!geracoes || geracoes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: '#fff', borderRadius: 16, border: '1px solid #D4E8DC' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(14,164,114,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA472" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#091710', margin: '0 0 6px' }}>Nenhuma geração ainda</p>
          <p style={{ fontSize: 13.5, color: '#7BA090', margin: '0 0 22px' }}>Use um dos agentes para gerar seu primeiro conteúdo.</p>
          <Link href="/dashboard" style={{ display: 'inline-block', padding: '11px 24px', background: 'linear-gradient(135deg,#0EA472,#054E39)', color: '#fff', borderRadius: 50, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(14,164,114,0.3)' }}>
            Ir para os agentes →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {geracoes.map((g) => {
            const ag = AGENTES[g.agente] ?? { label: g.agente, cor: '#0EA472', bg: 'rgba(14,164,114,0.1)' }
            const preview = stripMarkdown(g.output ?? '').slice(0, 120)
            const inputResumo = Object.values(g.input as Record<string, string>).slice(0, 2).filter(Boolean).join(' · ')
            return (
              <Link key={g.id} href={`/historico/${g.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #D4E8DC', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'box-shadow .14s, border-color .14s', borderLeft: `3px solid ${ag.cor}` }}
                  onMouseOver={undefined} onMouseOut={undefined}>
                  <AgentIcon id={g.agente} cor={ag.cor} bg={ag.bg}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#091710' }}>{ag.label}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: ag.bg, color: ag.cor, fontWeight: 600 }}>{(g.agente?.charAt(0).toUpperCase() ?? 'A')}</span>
                      </div>
                      <span style={{ fontSize: 11.5, color: '#A8C4B8', flexShrink: 0, fontWeight: 500 }}>{timeAgo(g.criado_em)}</span>
                    </div>
                    {inputResumo && (
                      <p style={{ fontSize: 12, color: '#7BA090', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inputResumo}</p>
                    )}
                    <p style={{ fontSize: 13, color: '#3A5F4E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                      {preview}…
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8C4B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
