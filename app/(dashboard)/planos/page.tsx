'use client'
import { useState } from 'react'

const PLANOS = [
  {
    id: 'gratuito',
    nome: 'Gratuito',
    preco: 0,
    descricao: 'Para conhecer o Elegendo',
    destaque: false,
    beneficios: [
      { texto: '5 gerações por mês', ok: true },
      { texto: '1 candidato', ok: true },
      { texto: 'Todos os 4 agentes', ok: true },
      { texto: 'Histórico de gerações', ok: true },
      { texto: 'Gerações ilimitadas', ok: false },
      { texto: 'Suporte prioritário', ok: false },
      { texto: 'Multi-candidatos', ok: false },
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 47,
    descricao: 'Para o candidato sério',
    destaque: true,
    badge: 'Mais popular',
    beneficios: [
      { texto: 'Gerações ilimitadas', ok: true },
      { texto: '1 candidato', ok: true },
      { texto: 'Todos os 4 agentes', ok: true },
      { texto: 'Histórico completo', ok: true },
      { texto: 'Suporte prioritário', ok: true },
      { texto: 'Novos agentes em primeira mão', ok: true },
      { texto: 'Multi-candidatos', ok: false },
    ],
  },
  {
    id: 'agencia',
    nome: 'Agência',
    preco: 97,
    descricao: 'Para assessores e gestores',
    destaque: false,
    beneficios: [
      { texto: 'Gerações ilimitadas', ok: true },
      { texto: 'Até 5 candidatos', ok: true },
      { texto: 'Todos os 4 agentes', ok: true },
      { texto: 'Histórico completo', ok: true },
      { texto: 'Suporte prioritário', ok: true },
      { texto: 'Novos agentes em primeira mão', ok: true },
      { texto: 'Painel multi-candidatos', ok: true },
    ],
  },
]

const FAQ = [
  { q: 'Posso cancelar a qualquer momento?', r: 'Sim. Sem multa, sem burocracia. Cancele quando quiser direto pelo painel.' },
  { q: 'O que acontece quando atinjo o limite gratuito?', r: 'Você recebe um aviso e pode fazer upgrade. Suas gerações anteriores ficam salvas.' },
  { q: 'O plano Agência já inclui o painel multi-candidatos?', r: 'Sim. Você gerencia até 5 candidatos com perfis separados e histórico independente.' },
  { q: 'Os valores incluem impostos?', r: 'Sim. R$ 47 e R$ 97 são os valores finais, sem surpresas na fatura.' },
]

export default function PlanosPage() {
  const [faqAberto, setFaqAberto] = useState<number | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const planoAtual = 'gratuito'

  const handleAssinar = async (planoId: string) => {
    setLoading(planoId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '44px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(123,79,216,0.08)', border: '1px solid rgba(123,79,216,0.2)', borderRadius: 20, marginBottom: 16 }}>
          <span style={{ fontSize: 12 }}>🗳️</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7B4FD8' }}>Eleições 2026 — Comece agora</span>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#2D1B6E', margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          Escolha o plano certo<br />para sua campanha
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(45,27,110,0.5)', margin: '0 auto', maxWidth: 460, lineHeight: 1.7 }}>
          Você não está pagando por tokens.<br />
          Está pagando por <strong style={{ color: '#2D1B6E' }}>estratégia política pronta.</strong>
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48, alignItems: 'start' }}>
        {PLANOS.map((plano) => {
          const isDestaque = plano.destaque
          const isAgencia = plano.id === 'agencia'
          return (
            <div key={plano.id} style={{
              background: isDestaque ? 'linear-gradient(145deg, #2D1B6E 0%, #4A2FA0 100%)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              border: isDestaque ? '2px solid rgba(123,79,216,0.6)' : '1px solid rgba(123,79,216,0.12)',
              borderRadius: 20,
              padding: '28px 24px',
              position: 'relative',
              transform: isDestaque ? 'scale(1.04)' : 'none',
              boxShadow: isDestaque ? '0 12px 48px rgba(123,79,216,0.25)' : '0 2px 12px rgba(45,27,110,0.05)',
            }}>
              {plano.badge && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(123,79,216,0.4)' }}>
                  {plano.badge}
                </div>
              )}

              {/* Nome + desc */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDestaque ? 'rgba(255,255,255,0.5)' : 'rgba(45,27,110,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{plano.nome}</div>
                <div style={{ fontSize: 13, color: isDestaque ? 'rgba(255,255,255,0.65)' : 'rgba(45,27,110,0.5)' }}>{plano.descricao}</div>
              </div>

              {/* Preço */}
              <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${isDestaque ? 'rgba(255,255,255,0.1)' : 'rgba(123,79,216,0.08)'}` }}>
                {plano.preco === 0 ? (
                  <div style={{ fontSize: 38, fontWeight: 800, color: isDestaque ? '#fff' : '#2D1B6E', lineHeight: 1 }}>Grátis</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isDestaque ? 'rgba(255,255,255,0.5)' : 'rgba(45,27,110,0.4)' }}>R$</span>
                    <span style={{ fontSize: 44, fontWeight: 800, color: isDestaque ? '#fff' : '#2D1B6E', lineHeight: 1 }}>{plano.preco}</span>
                    <span style={{ fontSize: 13, color: isDestaque ? 'rgba(255,255,255,0.4)' : 'rgba(45,27,110,0.4)' }}>/mês</span>
                  </div>
                )}
              </div>

              {/* Benefícios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
                {plano.beneficios.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: b.ok ? 1 : 0.3 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: b.ok ? (isDestaque ? 'rgba(255,255,255,0.2)' : 'rgba(123,79,216,0.12)') : 'transparent', border: b.ok ? 'none' : `1.5px solid ${isDestaque ? 'rgba(255,255,255,0.2)' : 'rgba(45,27,110,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {b.ok && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke={isDestaque ? '#fff' : '#7B4FD8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: isDestaque ? (b.ok ? '#fff' : 'rgba(255,255,255,0.3)') : (b.ok ? '#2D1B6E' : 'rgba(45,27,110,0.3)') }}>{b.texto}</span>
                  </div>
                ))}
              </div>

              {/* Botão */}
              {planoAtual === plano.id ? (
                <div style={{ padding: '12px', borderRadius: 12, background: isDestaque ? 'rgba(255,255,255,0.08)' : 'rgba(123,79,216,0.06)', textAlign: 'center', fontSize: 13, fontWeight: 600, color: isDestaque ? 'rgba(255,255,255,0.4)' : 'rgba(45,27,110,0.4)' }}>
                  Plano atual
                </div>
              ) : (
                <button
                  onClick={() => handleAssinar(plano.id)}
                  disabled={loading === plano.id}
                  style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', cursor: loading === plano.id ? 'not-allowed' : 'pointer', background: isDestaque ? 'linear-gradient(135deg, #7B4FD8, #5B3BAA)' : isAgencia ? 'rgba(29,158,117,0.1)' : 'rgba(123,79,216,0.08)', color: isDestaque ? '#fff' : isAgencia ? '#1D9E75' : '#7B4FD8', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-inter), sans-serif', boxShadow: isDestaque ? '0 4px 16px rgba(123,79,216,0.4)' : 'none' }}
                >
                  {loading === plano.id ? 'Aguarde...' : `Assinar ${plano.nome} →`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Trust bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '24px 28px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', borderRadius: 16, border: '1px solid rgba(123,79,216,0.1)', marginBottom: 48, flexWrap: 'wrap' }}>
        {[
          { icon: '🔒', titulo: 'Pagamento seguro', sub: 'Processado pelo Stripe' },
          { icon: '↩️', titulo: 'Cancele quando quiser', sub: 'Sem fidelidade' },
          { icon: '⚡', titulo: 'Acesso imediato', sub: 'Ativo em segundos' },
          { icon: '🇧🇷', titulo: 'Pague em reais', sub: 'Sem IOF ou câmbio' },
        ].map(({ icon, titulo, sub }) => (
          <div key={titulo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2D1B6E' }}>{titulo}</div>
              <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2D1B6E', marginBottom: 20, textAlign: 'center', letterSpacing: '-0.01em' }}>Perguntas frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setFaqAberto(faqAberto === i ? null : i)} style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-inter), sans-serif' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1B6E', textAlign: 'left' }}>{item.q}</span>
                <span style={{ fontSize: 18, color: '#7B4FD8', flexShrink: 0, marginLeft: 12, transform: faqAberto === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>+</span>
              </button>
              {faqAberto === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'rgba(45,27,110,0.6)', lineHeight: 1.7 }}>{item.r}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div style={{ textAlign: 'center', padding: '48px 28px', background: 'linear-gradient(145deg, #2D1B6E 0%, #4A2FA0 100%)', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,79,216,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,200,120,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.01em' }}>A janela fecha em outubro de 2026.</div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: '0 0 28px' }}>Cada semana sem estratégia digital é voto que o seu concorrente está conquistando.</p>
          <button onClick={() => handleAssinar('pro')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', borderRadius: 50, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', boxShadow: '0 4px 20px rgba(123,79,216,0.5)' }}>
            Começar agora →
          </button>
        </div>
      </div>
    </div>
  )
}
