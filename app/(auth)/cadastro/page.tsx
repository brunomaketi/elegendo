'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error: signUpError } = await supabase.auth.signUp({
      email, password: senha,
      options: { data: { nome } }
    })
    if (signUpError) { setErro(signUpError.message); setLoading(false); return }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (signInError) { setErro(signInError.message); setLoading(false); return }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', width: '100%', maxWidth: '420px', border: '1px solid #E8E0D0' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A2E', margin: '0 0 6px' }}>ELEGENDO</h1>
          <p style={{ color: '#8A8A9A', fontSize: '14px', margin: 0 }}>Crie sua conta e comece agora.</p>
        </div>
        <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#4A4A5A', display: 'block', marginBottom: '6px' }}>Nome completo</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required placeholder="João Silva" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#4A4A5A', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#4A4A5A', display: 'block', marginBottom: '6px' }}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="mínimo 8 caracteres" minLength={8} style={inp} />
          </div>
          {erro && <p style={{ color: '#C62828', fontSize: '13px', margin: 0 }}>{erro}</p>}
          <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: loading ? '#8A8A9A' : '#1A1A2E', color: '#E8D5A3', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#8A8A9A', marginTop: '24px' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#C9A84C', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #E8E0D0', fontSize: '14px', color: '#1A1A2E', background: '#fff', width: '100%', boxSizing: 'border-box', outline: 'none' }
