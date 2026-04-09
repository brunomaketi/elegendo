import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard', label: 'Início', icon: '⚡' },
  { href: '/agentes/roteirista', label: 'Roteirista', icon: '🎬' },
  { href: '/agentes/estrategista', label: 'Estrategista', icon: '🧠' },
  { href: '/agentes/copy', label: 'Copy Político', icon: '✍️' },
  { href: '/agentes/consciencia', label: 'Consciência', icon: '📊' },
  { href: '/perfil', label: 'Meu perfil', icon: '👤' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('nome, plano').eq('id', user.id).single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
      <aside style={{ width: '220px', background: '#1A1A2E', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#E8D5A3', letterSpacing: '0.05em' }}>ELEGENDO</div>
          <div style={{ fontSize: '11px', color: '#8A8A9A', marginTop: '4px', textTransform: 'capitalize' }}>Plano {profile?.plano ?? 'gratuito'}</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#D5D5E0', fontSize: '14px', textDecoration: 'none' }}>
              <span style={{ fontSize: '16px', width: '20px' }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '13px', color: '#8A8A9A', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.nome ?? user.email}
          </div>
          <form action="/api/logout" method="POST">
            <button type="submit" style={{ fontSize: '12px', color: '#8A8A9A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Sair
            </button>
          </form>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}
