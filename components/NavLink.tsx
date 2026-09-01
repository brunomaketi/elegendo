'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const active = href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname === href || pathname.startsWith(href + '/')
  return (
    <Link href={href} style={{
      display: 'block', padding: '7px 12px 7px 14px', borderRadius: 7,
      color: active ? '#0EA472' : '#3A5F4E',
      background: active ? 'rgba(14,164,114,0.09)' : 'transparent',
      fontWeight: active ? 600 : 400, fontSize: 13.5, textDecoration: 'none',
      borderLeft: `2px solid ${active ? '#0EA472' : 'transparent'}`,
      marginBottom: 1, letterSpacing: '-0.01em', transition: 'background .12s, color .12s',
    }}>
      {children}
    </Link>
  )
}
