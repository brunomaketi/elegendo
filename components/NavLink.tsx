'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const active =
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '7px 12px 7px 14px',
        borderRadius: 7,
        color: active ? '#7B4FD8' : '#6B648C',
        background: active ? 'rgba(123,79,216,0.08)' : 'transparent',
        fontWeight: active ? 600 : 400,
        fontSize: 13.5,
        textDecoration: 'none',
        borderLeft: `2px solid ${active ? '#7B4FD8' : 'transparent'}`,
        marginBottom: 1,
        letterSpacing: '-0.01em',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      {children}
    </Link>
  )
}
