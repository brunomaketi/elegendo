import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',            label: 'Início',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/agentes/roteirista',   label: 'Roteirista',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
  { href: '/agentes/estrategista', label: 'Estrategista',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { href: '/agentes/copy',         label: 'Copy Político', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { href: '/agentes/consciencia',  label: 'Consciência',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { href: '/historico',            label: 'Histórico',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { href: '/planos',               label: 'Planos',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { href: '/perfil',               label: 'Configurações', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

const PLANO_COR: Record<string, string> = { gratuito: '#8A8A9A', essencial: '#7B4FD8', pro: '#1D9E75' }
const PLANO_BG: Record<string, string>  = { gratuito: 'rgba(138,138,154,0.12)', essencial: 'rgba(123,79,216,0.12)', pro: 'rgba(29,158,117,0.12)' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('nome, plano').eq('id', user.id).single()
  const plano = profile?.plano ?? 'gratuito'

  return (
    <div style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
      <style>{`
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 11px 14px; color: rgba(45,27,110,0.45); font-size: 14px; text-decoration: none; border-radius: 10px; margin-bottom: 6px; font-weight: 500; transition: background 0.15s, color 0.15s; }
        .nav-link:hover { background: rgba(123,79,216,0.08); color: #2D1B6E; }
        .nav-link svg { flex-shrink: 0; }
        .logout-btn { width: 100%; padding: 9px; border-radius: 10px; border: 1px solid rgba(123,79,216,0.15); background: transparent; color: rgba(45,27,110,0.4); font-size: 13px; cursor: pointer; font-family: var(--font-inter), sans-serif; transition: background 0.15s; }
        .logout-btn:hover { background: rgba(123,79,216,0.06); color: #2D1B6E; }

        /* Desktop */
        .sidebar { width: 230px; min-width: 230px; background: #fff; display: flex; flex-direction: column; height: 100vh; position: fixed; left: 0; top: 0; z-index: 100; border-right: 1px solid rgba(123,79,216,0.1); box-shadow: 2px 0 12px rgba(45,27,110,0.04); transform: translateX(0); transition: transform 0.25s; }
        .main-content { margin-left: 230px; background: #EEEAF6; min-height: 100vh; }

        /* Bottom nav mobile */
        .bottom-nav { display: none; }
        .mobile-header { display: none; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { margin-left: 0 !important; padding-bottom: 80px; }
          .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: #fff; border-top: 1px solid rgba(123,79,216,0.1); padding: 8px 4px; justify-content: space-around; box-shadow: 0 -4px 20px rgba(45,27,110,0.08); }
          .bottom-nav a { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 10px; color: rgba(45,27,110,0.4); text-decoration: none; font-size: 10px; font-weight: 600; border-radius: 10px; transition: color 0.15s; }
          .bottom-nav a:hover { color: #7B4FD8; }
          .bottom-nav svg { width: 20px; height: 20px; }
          .mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #fff; border-bottom: 1px solid rgba(123,79,216,0.08); position: sticky; top: 0; z-index: 50; }
        }
      `}</style>

      {/* Sidebar desktop */}
      <aside className="sidebar">
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(123,79,216,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #7B4FD8 0%, #2D1B6E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="3" height="8" rx="1" fill="white"/><rect x="5.5" y="1" width="3" height="12" rx="1" fill="white"/><rect x="10" y="4" width="3" height="6" rx="1" fill="white"/></svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#2D1B6E', letterSpacing: '0.05em' }}>ELEGENDO</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: PLANO_COR[plano], background: PLANO_BG[plano], padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Plano {plano}
            </span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', color: 'rgba(45,27,110,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 14px 12px' }}>Menu</div>
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="nav-link">
              {icon}{label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(123,79,216,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(123,79,216,0.1)', border: '2px solid rgba(123,79,216,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#7B4FD8', flexShrink: 0 }}>
              {profile?.nome?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2D1B6E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nome ?? user.email}</div>
              <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <form action="/api/logout" method="POST">
            <button type="submit" className="logout-btn">Sair da conta</button>
          </form>
        </div>
      </aside>

      {/* Header mobile */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7B4FD8 0%, #2D1B6E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="3" height="8" rx="1" fill="white"/><rect x="5.5" y="1" width="3" height="12" rx="1" fill="white"/><rect x="10" y="4" width="3" height="6" rx="1" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#2D1B6E', letterSpacing: '0.05em' }}>ELEGENDO</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: PLANO_COR[plano], background: PLANO_BG[plano], padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
          {plano}
        </span>
      </div>

      {/* Conteúdo */}
      <main className="main-content">
        {children}
      </main>

      {/* Bottom nav mobile — itens principais */}
      <nav className="bottom-nav">
        {[
          { href: '/dashboard',           label: 'Início',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { href: '/agentes/roteirista',  label: 'Agentes',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
          { href: '/historico',           label: 'Histórico',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { href: '/planos',              label: 'Planos',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
          { href: '/perfil',              label: 'Perfil',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href}>
            {icon}
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
