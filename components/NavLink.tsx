'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function NavLink({ href, children, icon, badge }: { href: string; children: ReactNode; icon?: ReactNode; badge?: string }) {
  const pathname = usePathname()
  const active = href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname === href || pathname.startsWith(href + '/')
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '8px 12px 8px 12px', borderRadius: 8,
      color: active ? '#0EA472' : '#3A5F4E',
      background: active ? 'rgba(14,164,114,0.1)' : 'transparent',
      fontWeight: active ? 600 : 400, fontSize: 13.5, textDecoration: 'none',
      borderLeft: `2px solid ${active ? '#0EA472' : 'transparent'}`,
      marginBottom: 1, letterSpacing: '-0.01em', transition: 'background .12s, color .12s',
    }}>
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, flexShrink: 0, opacity: active ? 1 : 0.55 }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1 }}>{children}</span>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: 'rgba(14,164,114,0.15)', color: '#0EA472', letterSpacing: '0.02em' }}>
          {badge}
        </span>
      )}
    </Link>
  )
}
