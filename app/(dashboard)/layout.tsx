import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',            label: 'Início',        icon: '⚡' },
  { href: '/agentes/roteirista',   label: 'Roteirista',    icon: '🎬' },
  { href: '/agentes/estrategista', label: 'Estrategista',  icon: '🧠' },
  { href: '/agentes/copy',         label: 'Copy Político', icon: '✍️' },
  { href: '/agentes/consciencia',  label: 'Consciência',   icon: '📊' },
  { href: '/historico',            label: 'Histórico',     icon: '🕐' },
  { href: '/perfil',               label: 'Configurações', icon: '⚙️' },
]

const PLANO_COR: Record<string, string> = { gratuito: '#8A8A9A', essencial: '#C9A84C', pro: '#1D9E75' }

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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font-inter), sans-serif' }}>

      <style>{`
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 10px; color: rgba(255,255,255,0.6); font-size: 14px; text-decoration: none; border-radius: 8px; margin-bottom: 2px; font-weight: 500; transition: background 0.15s, color 0.15s; }
        .nav-link:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .nav-icon { font-size: 16px; width: 22px; text-align: center; }
        .logout-btn { width: 100%; padding: 7px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); font-size: 12px; cursor: pointer; font-family: var(--font-inter), sans-serif; transition: background 0.15s; }
        .logout-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: '240px', minWidth: '240px', background: '#0F1117', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100, borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em' }}>ELEGENDO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PLANO_COR[plano] }} />
            <span style={{ fontSize: '11px', color: PLANO_COR[plano], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Plano {plano}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 10px 8px' }}>
            Menu
          </div>
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="nav-link">
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1A1A2E', border: '2px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#C9A84C', flexShrink: 0 }}>
              {profile?.nome?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.nome ?? user.email}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
          <form action="/api/logout" method="POST">
            <button type="submit" className="logout-btn">Sair da conta</button>
          </form>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ marginLeft: '240px', flex: 1, overflowY: 'auto', background: '#F7F5F0', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
