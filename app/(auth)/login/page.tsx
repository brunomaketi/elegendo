'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { setErro('E-mail ou senha incorretos.'); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up{animation:fadeUp .5s ease forwards}
        .fade-up-2{animation:fadeUp .5s .1s ease both}
        .fade-up-3{animation:fadeUp .5s .2s ease both}
        .inp:focus{outline:none;border-color:#0EA472!important;box-shadow:0 0 0 3px rgba(14,164,114,0.12)!important}
        .inp{transition:border-color .15s,box-shadow .15s}
        .login-left{display:none}
        @media(min-width:768px){.login-left{display:flex}}
      `}</style>

      {/* ── LADO ESQUERDO ── */}
      <div className="login-left" style={{ width:'58%', background:'linear-gradient(160deg,#054E39 0%,#0A7A56 55%,#12A070 100%)', flexDirection:'column', justifyContent:'space-between', padding:'48px', position:'relative', overflow:'hidden' }}>
        {/* Decoração de fundo */}
        <div style={{ position:'absolute', top:-120, right:-80, width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-60, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'40%', left:'35%', width:250, height:250, borderRadius:'50%', background:'rgba(93,255,192,0.06)', pointerEvents:'none' }}/>

        {/* Logo topo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:2 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'flex-end', justifyContent:'center', gap:2.5, padding:'7px 7px 6px' }}>
            <div style={{ width:5, height:9, background:'rgba(255,255,255,0.55)', borderRadius:1.5 }}/>
            <div style={{ width:5, height:15, background:'rgba(255,255,255,0.8)', borderRadius:1.5 }}/>
            <div style={{ width:5, height:21, background:'#fff', borderRadius:1.5 }}/>
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', lineHeight:1.1 }}>Elegendo</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', fontWeight:500 }}>Plataforma Política IA</div>
          </div>
        </div>

        {/* Headline central */}
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:50, padding:'5px 14px', marginBottom:24 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#5DFFC0', boxShadow:'0 0 8px rgba(93,255,192,0.8)' }}/>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>Eleições 2026 — comece agora</span>
          </div>
          <h1 style={{ fontSize:40, fontWeight:800, color:'#fff', lineHeight:1.15, margin:'0 0 20px', letterSpacing:'-0.03em' }}>
            Marketing político<br />que faz diferença<br />
            <span style={{ color:'#5DFFC0' }}>nas urnas.</span>
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', lineHeight:1.7, margin:'0 0 40px', maxWidth:360 }}>
            4 agentes de IA treinados para campanhas políticas brasileiras. Conteúdo estratégico em segundos.
          </p>

          {/* Features */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { icon:'▶', title:'Roteiros que viralizam', desc:'Reels com gancho, desenvolvimento e CTA em segundos.' },
              { icon:'◎', title:'Estratégia de 90 dias', desc:'Diagnóstico + plano completo de comunicação digital.' },
              { icon:'✦', title:'Copy que converte votos', desc:'Headlines e anúncios para Meta, Google e TikTok.' },
            ].map(({icon,title,desc}) => (
              <div key={title} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#5DFFC0', flexShrink:0, fontWeight:700 }}>{icon}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:2 }}>{title}</div>
                  <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé esquerdo */}
        <div style={{ position:'relative', zIndex:2, display:'flex', gap:20 }}>
          {[{num:'4',label:'Agentes IA'},{num:'2026',label:'Eleições'},{num:'∞',label:'Gerações Pro'}].map(({num,label})=>(
            <div key={label}>
              <div style={{ fontSize:22, fontWeight:800, color:'#5DFFC0', letterSpacing:'-0.02em' }}>{num}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LADO DIREITO ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', background:'#F1F6F3' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, justifyContent:'center' }} className="login-logo-mobile">
            <style>{`.login-logo-mobile{display:flex}@media(min-width:768px){.login-logo-mobile{display:none!important}}`}</style>
            <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#0EA472,#054E39)', display:'flex', alignItems:'flex-end', justifyContent:'center', gap:2, padding:'6px 6px 5px' }}>
              <div style={{ width:4, height:8, background:'rgba(255,255,255,0.6)', borderRadius:1 }}/><div style={{ width:4, height:13, background:'rgba(255,255,255,0.8)', borderRadius:1 }}/><div style={{ width:4, height:18, background:'#fff', borderRadius:1 }}/>
            </div>
            <span style={{ fontSize:18, fontWeight:800, color:'#091710', letterSpacing:'-0.02em' }}>Elegendo</span>
          </div>

          <div className="fade-up">
            <h2 style={{ fontSize:26, fontWeight:800, color:'#091710', margin:'0 0 6px', letterSpacing:'-0.03em' }}>Bem-vindo de volta</h2>
            <p style={{ fontSize:13.5, color:'#7BA090', margin:'0 0 32px' }}>
              Não tem conta?{' '}
              <Link href="/cadastro" style={{ color:'#0EA472', fontWeight:600 }}>Criar conta grátis →</Link>
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="fade-up-2">
              <label style={{ fontSize:11.5, fontWeight:600, color:'#3A5F4E', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>E-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="seu@email.com.br"
                className="inp" style={{ padding:'13px 16px', borderRadius:11, border:'1.5px solid #D4E8DC', fontSize:14, color:'#091710', background:'#fff', width:'100%', boxSizing:'border-box' as const }}/>
            </div>
            <div className="fade-up-2">
              <label style={{ fontSize:11.5, fontWeight:600, color:'#3A5F4E', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Senha</label>
              <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} required placeholder="sua senha"
                className="inp" style={{ padding:'13px 16px', borderRadius:11, border:'1.5px solid #D4E8DC', fontSize:14, color:'#091710', background:'#fff', width:'100%', boxSizing:'border-box' as const }}/>
            </div>

            {erro && (
              <div style={{ padding:'11px 14px', background:'rgba(220,53,69,0.06)', borderRadius:10, fontSize:13, color:'#DC3545', border:'1px solid rgba(220,53,69,0.2)' }}>{erro}</div>
            )}

            <div className="fade-up-3">
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:50, border:'none', background: loading?'rgba(14,164,114,0.5)':'linear-gradient(135deg,#0EA472 0%,#054E39 100%)', color:'#fff', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', boxShadow:loading?'none':'0 4px 20px rgba(14,164,114,0.35)', letterSpacing:'-0.01em' }}>
                {loading ? 'Entrando...' : 'Entrar na plataforma'}
              </button>
            </div>
          </form>

          {/* Trust badges */}
          <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:28 }}>
            {['SSL seguro','Dados no Brasil','Acesso imediato'].map(t=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#7BA090' }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#0EA472' }}/>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
