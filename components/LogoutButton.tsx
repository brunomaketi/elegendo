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
    <button
      onClick={handleLogout}
      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(123,79,216,0.15)', background: 'transparent', color: 'rgba(45,27,110,0.4)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', transition: 'background 0.15s' }}
      onMouseOver={e => (e.currentTarget.style.background = 'rgba(123,79,216,0.06)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      Sair da conta
    </button>
  )
}
