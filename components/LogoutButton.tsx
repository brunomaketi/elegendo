'use client'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={handleLogout} style={{
      width: '100%', padding: '9px', borderRadius: 9,
      border: '1px solid rgba(14,164,114,0.18)',
      background: 'transparent', color: '#7BA090', fontSize: '13px',
      cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif',
      transition: 'background .15s, color .15s',
    }}
      onMouseOver={e => { e.currentTarget.style.background = 'rgba(14,164,114,0.07)'; e.currentTarget.style.color = '#0EA472' }}
      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7BA090' }}
    >
      Sair da conta
    </button>
  )
}
