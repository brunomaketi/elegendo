import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'
import { NavLink } from '@/components/NavLink'

const PLANO_STYLE: Record<string, { color: string; bg: string }> = {
  gratuito:  { color: '#7BA090', bg: 'rgba(123,160,144,0.12)' },
  essencial: { color: '#0EA472', bg: 'rgba(14,164,114,0.1)' },
  pro:       { color: '#0EA472', bg: 'rgba(14,164,114,0.1)' },
  agencia:   { color: '#2D7DD2', bg: 'rgba(45,125,210,0.1)' },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('nome, plano').eq('id', user.id).single()
  const plano = profile?.plano ?? 'gratuito'
  const ps = PLANO_STYLE[plano] ?? PLANO_STYLE.gratuito
  const avatar = profile?.nome?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div style={{ fontFamily: "var(--font-inter),'Inter',sans-serif", display: 'flex' }}>
      <style>{`
        .e-sidebar {
          width: 232px; min-width: 232px; height: 100vh;
          position: fixed; left: 0; top: 0;
          background: #fff; border-right: 1px solid #D4E8DC;
          display: flex; flex-direction: column; z-index: 100;
        }
        .e-main { margin-left: 232px; background: #F1F6F3; min-height: 100vh; width: calc(100% - 232px); }
        .e-nav-section { margin-bottom: 18px; }
        .e-nav-label { font-size: 11px; font-weight: 500; color: #A8C4B8; padding: 0 14px 5px; display: block; }
        .e-bottom-nav { display: none; }
        .e-mob-header { display: none; }
        @media (max-width: 768px) {
          .e-sidebar { display: none; }
          .e-main { margin-left: 0 !important; width: 100%; padding-bottom: 74px; }
          .e-mob-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; background: #fff; border-bottom: 1px solid #D4E8DC; position: sticky; top: 0; z-index: 50; }
          .e-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: #fff; border-top: 1px solid #D4E8DC; padding: 8px 0 12px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .e-bottom-nav::-webkit-scrollbar { display: none; }
          .e-bottom-nav a { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 14px; color: #A8C4B8; text-decoration: none; font-size: 10px; font-weight: 500; flex-shrink: 0; white-space: nowrap; }
        }
      `}</style>

      <aside className="e-sidebar">
        <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid #E6F3EB' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0EA472 0%, #054E39 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="3" height="8" rx="1" fill="white"/>
                <rect x="5.5" y="1" width="3" height="12" rx="1" fill="white"/>
                <rect x="10" y="4" width="3" height="6" rx="1" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#091710', letterSpacing: '-0.02em' }}>Elegendo</span>
          </Link>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: ps.color, background: ps.bg, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{plano}</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 8px', overflowY: 'auto' }}>
          <div className="e-nav-section"><NavLink href="/dashboard">Painel</NavLink></div>
          <div className="e-nav-section">
            <span className="e-nav-label">Agentes IA</span>
            <NavLink href="/agentes/roteirista">Roteirista de Reels</NavLink>
            <NavLink href="/agentes/estrategista">Estrategista</NavLink>
            <NavLink href="/agentes/copy">Copy Político</NavLink>
            <NavLink href="/agentes/consciencia">Consciência</NavLink>
          </div>
          <div className="e-nav-section">
            <span className="e-nav-label">Ferramentas</span>
            <NavLink href="/calendario">Calendário Eleitoral</NavLink>
            <NavLink href="/historico">Histórico</NavLink>
          </div>
          <div className="e-nav-section">
            <span className="e-nav-label">Conta</span>
            <NavLink href="/planos">Planos</NavLink>
            <NavLink href="/perfil">Configurações</NavLink>
          </div>
        </nav>

        <div style={{ padding: '12px 14px 16px', borderTop: '1px solid #E6F3EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(14,164,114,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0EA472', flexShrink: 0 }}>{avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#091710', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nome ?? 'Candidato'}</div>
              <div style={{ fontSize: 11, color: '#7BA090', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="e-mob-header">
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #0EA472 0%, #054E39 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="3" height="8" rx="1" fill="white"/><rect x="5.5" y="1" width="3" height="12" rx="1" fill="white"/><rect x="10" y="4" width="3" height="6" rx="1" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#091710' }}>Elegendo</span>
        </Link>
        <span style={{ fontSize: 11, fontWeight: 500, color: ps.color, background: ps.bg, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{plano}</span>
      </div>

      <main className="e-main">{children}</main>

      <nav className="e-bottom-nav">
        {([
          { href:'/dashboard', label:'Painel', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { href:'/agentes/roteirista', label:'Roteirista', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
          { href:'/agentes/estrategista', label:'Estratégia', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
          { href:'/agentes/copy', label:'Copy', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
          { href:'/calendario', label:'Agenda', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
          { href:'/historico', label:'Histórico', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { href:'/planos', label:'Planos', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
        ] as {href:string;label:string;svg:React.ReactNode}[]).map(({href,label,svg})=>(<Link key={href} href={href}>{svg}{label}</Link>))}
      </nav>
    </div>
  )
}
