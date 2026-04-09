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
    <div style={{ minHeight: '100vh', background: '#EEEAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-inter), sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 900, background: 'rgba(255,255,255,0.55)', borderRadius: 24, overflow: 'hidden', display: 'grid', gridTemplateColumns: '55% 45%', boxShadow: '0 8px 40px rgba(80,40,160,0.10)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}>

        {/* LADO ESQUERDO */}
        <div style={{ position: 'relative', padding: '56px 48px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 520 }}>

          {/* Blobs */}
          <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,80,220,0.55) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,200,120,0.5) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '40%', left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.3) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

          {/* Conteúdo */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontSize: 38, fontWeight: 800, color: '#2D1B6E', lineHeight: 1.15, margin: '0 0 36px', letterSpacing: '-0.02em' }}>
              Comece a<br />ganhar votos.
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { icon: '🎬', title: 'Roteiros que viralizam', desc: 'Reels políticos com gancho, desenvolvimento e CTA gerados por IA.' },
                { icon: '🧠', title: 'Estratégia de campanha', desc: 'Diagnóstico completo + plano de 90 dias para dominar as redes.' },
                { icon: '✍️', title: 'Copy que converte', desc: 'Legendas e anúncios para Meta, Google e TikTok prontos para publicar.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2D1B6E', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(45,27,110,0.6)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2D1B6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="3" height="8" rx="1" fill="white"/><rect x="5.5" y="1" width="3" height="12" rx="1" fill="white"/><rect x="10" y="4" width="3" height="6" rx="1" fill="white"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#2D1B6E', letterSpacing: '0.04em' }}>ELEGENDO</span>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div style={{ background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 48px' }}>
          <div style={{ width: '100%', maxWidth: 320 }}>

            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: '0 0 6px', textAlign: 'center' }}>Criar conta grátis</h2>
              <p style={{ fontSize: 13, color: '#8A8A9A', margin: 0, textAlign: 'center' }}>
                Já tem conta?{' '}
                <Link href="/login" style={{ color: '#7B4FD8', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
              </p>
            </div>

            <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lbl}>Nome completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required placeholder="João Silva" style={inp} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com.br" style={inp} />
              </div>
              <div>
                <label style={lbl}>Senha</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="mínimo 8 caracteres" minLength={8} style={inp} />
              </div>

              {erro && (
                <div style={{ padding: '10px 14px', background: 'rgba(224,75,74,0.06)', borderRadius: 8, fontSize: 13, color: '#C62828', border: '1px solid rgba(224,75,74,0.2)' }}>
                  {erro}
                </div>
              )}

              <p style={{ fontSize: 11, color: '#AAA', textAlign: 'center', margin: '2px 0' }}>
                Ao criar sua conta você concorda com nossos{' '}
                <a href="#" style={{ color: '#7B4FD8', textDecoration: 'none' }}>Termos de Uso</a>.
              </p>

              <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 50, border: 'none', background: loading ? 'rgba(123,79,216,0.4)' : 'linear-gradient(135deg, #7B4FD8 0%, #5B3BAA 100%)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.01em', fontFamily: 'var(--font-inter), sans-serif', boxShadow: loading ? 'none' : '0 4px 16px rgba(123,79,216,0.35)' }}>
                {loading ? 'Criando conta...' : 'Criar conta grátis →'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20 }}>
              {['SSL seguro', 'Grátis pra começar', 'Dados no Brasil'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8A8A9A' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7B4FD8', opacity: 0.6 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#4A4A5A', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }
const inp: React.CSSProperties = { padding: '12px 16px', borderRadius: 10, border: '1px solid #E8E8E8', fontSize: 14, color: '#1A1A2E', background: '#FAFAFA', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'var(--font-inter), sans-serif' }
