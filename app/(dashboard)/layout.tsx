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

const S = (d: string, extra?: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>{extra && <path d={extra}/>}
  </svg>
)

const icons = {
  home:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  video:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  target:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  edit:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clock:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  vote:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  chart:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  star:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('nome, plano').eq('id', user.id).single()
  const plano = profile?.plano ?? 'gratuito'
  const ps = PLANO_STYLE[plano] ?? PLANO_STYLE.gratuito
  const avatar = profile?.nome?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? 'U'

  // Dias para o 1º turno
  const diasEleicao = Math.ceil((new Date('2026-10-02').getTime() - new Date().setHours(0,0,0,0)) / 86400000)

  return (
    <div style={{ fontFamily: "var(--font-inter),'Inter',sans-serif", display: 'flex' }}>
      <style>{`
        .e-sidebar { width: 236px; min-width: 236px; height: 100vh; position: fixed; left: 0; top: 0; background: #fff; border-right: 1px solid #D4E8DC; display: flex; flex-direction: column; z-index: 100; }
        .e-main { margin-left: 236px; background: #F1F6F3; min-height: 100vh; width: calc(100% - 236px); }
        .e-nav-section { margin-bottom: 20px; }
        .e-nav-label { font-size: 10.5px; font-weight: 600; color: #A8C4B8; padding: 0 12px 6px; display: block; text-transform: uppercase; letter-spacing: 0.06em; }
        .e-bottom-nav { display: none; }
        .e-mob-header { display: none; }
        @media (max-width: 768px) {
          .e-sidebar { display: none; }
          .e-main { margin-left: 0 !important; width: 100%; padding-bottom: 74px; }
          .e-mob-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; background: #fff; border-bottom: 1px solid #D4E8DC; position: sticky; top: 0; z-index: 50; }
          .e-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: #fff; border-top: 1px solid #D4E8DC; padding: 8px 0 12px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .e-bottom-nav::-webkit-scrollbar { display: none; }
          .e-bottom-nav a { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 12px; color: #A8C4B8; text-decoration: none; font-size: 10px; font-weight: 500; flex-shrink: 0; white-space: nowrap; }
        }
      `}</style>

      {/* ── Sidebar desktop ── */}
      <aside className="e-sidebar">
        {/* Logo */}
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid #E6F3EB' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10 }}>
            {/* Logo: rising bars */}
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #0EA472 0%, #054E39 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, padding: '6px 6px 5px', flexShrink: 0 }}>
              <div style={{ width: 4, height: 8,  background: 'rgba(255,255,255,0.6)', borderRadius: 1 }}/>
              <div style={{ width: 4, height: 13, background: 'rgba(255,255,255,0.8)', borderRadius: 1 }}/>
              <div style={{ width: 4, height: 18, background: '#fff', borderRadius: 1 }}/>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#091710', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Elegendo</div>
              <div style={{ fontSize: 9.5, color: '#7BA090', fontWeight: 500, letterSpacing: '0.01em' }}>Plataforma Política IA</div>
            </div>
          </Link>
          <span style={{ fontSize: 11, fontWeight: 600, color: ps.color, background: ps.bg, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{plano}</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 8px', overflowY: 'auto' }}>
          <div className="e-nav-section">
            <NavLink href="/dashboard" icon={icons.home}>Painel</NavLink>
          </div>

          <div className="e-nav-section">
            <span className="e-nav-label">Agentes IA</span>
            <NavLink href="/agentes/roteirista"   icon={icons.video}>Roteirista de Reels</NavLink>
            <NavLink href="/agentes/estrategista" icon={icons.target}>Estrategista</NavLink>
            <NavLink href="/agentes/copy"         icon={icons.edit}>Copy Político</NavLink>
            <NavLink href="/agentes/consciencia"  icon={icons.eye}>Consciência</NavLink>
          </div>

          <div className="e-nav-section">
            <span className="e-nav-label">Ferramentas</span>
            <NavLink href="/calendario" icon={icons.calendar}>Calendário Editorial</NavLink>
            <NavLink href="/historico"  icon={icons.clock}>Histórico</NavLink>
          </div>

          <div className="e-nav-section">
            <span className="e-nav-label">Eleições 2026</span>
            <NavLink href="/calendario" icon={icons.vote} badge={`${diasEleicao}d`}>1º Turno</NavLink>
            <NavLink href="/planos" icon={icons.chart}>Pesquisas TSE</NavLink>
          </div>

          <div className="e-nav-section">
            <span className="e-nav-label">Conta</span>
            <NavLink href="/planos"  icon={icons.star}>Planos</NavLink>
            <NavLink href="/perfil"  icon={icons.settings}>Configurações</NavLink>
          </div>
        </nav>

        {/* User bottom */}
        <div style={{ padding: '10px 12px 14px', borderTop: '1px solid #E6F3EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(14,164,114,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0EA472', flexShrink: 0, border: '2px solid rgba(14,164,114,0.2)' }}>{avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#091710', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nome ?? 'Candidato'}</div>
              <div style={{ fontSize: 10.5, color: '#7BA090', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="e-mob-header">
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0EA472 0%, #054E39 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, padding: '5px 5px 4px' }}>
            <div style={{ width: 3, height: 7, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }}/>
            <div style={{ width: 3, height: 11, background: 'rgba(255,255,255,0.8)', borderRadius: 1 }}/>
            <div style={{ width: 3, height: 15, background: '#fff', borderRadius: 1 }}/>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#091710', letterSpacing: '-0.02em' }}>Elegendo</span>
        </Link>
        <span style={{ fontSize: 11, fontWeight: 600, color: ps.color, background: ps.bg, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{plano}</span>
      </div>

      <main className="e-main">{children}</main>

      {/* Bottom nav mobile */}
      <nav className="e-bottom-nav">
        {([
          { href:'/dashboard',            label:'Painel',     svg: icons.home },
          { href:'/agentes/roteirista',   label:'Roteirista', svg: icons.video },
          { href:'/agentes/estrategista', label:'Estratégia', svg: icons.target },
          { href:'/agentes/copy',         label:'Copy',       svg: icons.edit },
          { href:'/calendario',           label:'Calendário', svg: icons.calendar },
          { href:'/historico',            label:'Histórico',  svg: icons.clock },
          { href:'/planos',               label:'Planos',     svg: icons.star },
        ] as {href:string;label:string;svg:React.ReactNode}[]).map(({href,label,svg})=>(
          <Link key={href} href={href}>{svg}{label}</Link>
        ))}
      </nav>
    </div>
  )
}
