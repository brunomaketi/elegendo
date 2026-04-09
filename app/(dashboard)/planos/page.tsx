'use client'
import { useState } from 'react'

const PLANOS = [
  {
    id: 'gratuito',
    nome: 'Gratuito',
    preco: 0,
    periodo: '',
    descricao: 'Para conhecer o Elegendo',
    cor: '#8A8A9A',
    bg: '#F7F5F0',
    border: '#E8E0D0',
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
    periodo: '/mês',
    descricao: 'Para o candidato sério',
    cor: '#C9A84C',
    bg: '#1A1A2E',
    border: '#C9A84C',
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
    periodo: '/mês',
    descricao: 'Para assessores e gestores',
    cor: '#1D9E75',
    bg: '#FFFFFF',
    border: '#1D9E75',
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: '#FFF8E6', border: '1px solid #F0D080', borderRadius: '20px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px' }}>🗳️</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#633806' }}>Eleições 2026 — Comece agora</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A2E', margin: '0 0 12px', lineHeight: 1.2 }}>
          Escolha o plano certo<br />para sua campanha
        </h1>
        <p style={{ fontSize: '16px', color: '#8A8A9A', margin: 0, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Você não está pagando por tokens.<br />
          Está pagando por <strong style={{ color: '#1A1A2E' }}>estratégia política pronta.</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px', alignItems: 'start' }}>
        {PLANOS.map((plano) => (
          <div key={plano.id} style={{ background: plano.bg, border: `2px solid ${plano.border}`, borderRadius: '16px', padding: '28px 24px', position: 'relative', transform: plano.destaque ? 'scale(1.04)' : 'none', boxShadow: plano.destaque ? '0 8px 40px rgba(26,26,46,0.15)' : 'none' }}>
            {plano.badge && (
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#1A1A2E', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                {plano.badge}
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: plano.destaque ? '#E8D5A3' : plano.cor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{plano.nome}</div>
              <div style={{ fontSize: '13px', color: plano.destaque ? 'rgba(232,213,163,0.6)' : '#8A8A9A' }}>{plano.descricao}</div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              {plano.preco === 0 ? (
                <div style={{ fontSize: '36px', fontWeight: 800, color: plano.destaque ? '#fff' : '#1A1A2E', lineHeight: 1 }}>Grátis</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: plano.destaque ? '#E8D5A3' : '#8A8A9A' }}>R$</span>
                  <span style={{ fontSize: '42px', fontWeight: 800, color: plano.destaque ? '#fff' : '#1A1A2E', lineHeight: 1 }}>{plano.preco}</span>
                  <span style={{ fontSize: '13px', color: plano.destaque ? 'rgba(255,255,255,0.5)' : '#8A8A9A' }}>{plano.periodo}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {plano.beneficios.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: b.ok ? 1 : 0.35 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: b.ok ? (plano.destaque ? '#C9A84C' : plano.cor) : 'transparent', border: b.ok ? 'none' : `1.5px solid ${plano.destaque ? 'rgba(255,255,255,0.2)' : '#D5D5E0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {b.ok && <span style={{ color: plano.destaque ? '#1A1A2E' : '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '13px', color: plano.destaque ? (b.ok ? '#fff' : 'rgba(255,255,255,0.35)') : (b.ok ? '#1A1A2E' : '#8A8A9A') }}>{b.texto}</span>
                </div>
              ))}
            </div>
            {planoAtual === plano.id ? (
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#8A8A9A' }}>
                Plano atual
              </div>
            ) : (
              <button
                onClick={() => handleAssinar(plano.id)}
                disabled={loading === plano.id}
                style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', cursor: loading === plano.id ? 'not-allowed' : 'pointer', background: plano.destaque ? '#C9A84C' : plano.id === 'agencia' ? '#1D9E75' : '#1A1A2E', color: plano.destaque ? '#1A1A2E' : '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {loading === plano.id ? 'Aguarde...' : `Assinar ${plano.nome} →`}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #E8E0D0', marginBottom: '48px', flexWrap: 'wrap' }}>
        {[
          { icon: '🔒', titulo: 'Pagamento seguro', sub: 'Processado pelo Stripe' },
          { icon: '↩️', titulo: 'Cancele quando quiser', sub: 'Sem fidelidade' },
          { icon: '⚡', titulo: 'Acesso imediato', sub: 'Ativo em segundos' },
          { icon: '🇧🇷', titulo: 'Pague em reais', sub: 'Sem IOF ou câmbio' },
        ].map(({ icon, titulo, sub }) => (
          <div key={titulo} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>{titulo}</div>
              <div style={{ fontSize: '11px', color: '#8A8A9A' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2E', marginBottom: '16px', textAlign: 'center' }}>Perguntas frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={() => setFaqAberto(faqAberto === i ? null : i)} style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-inter), sans-serif' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', textAlign: 'left' }}>{item.q}</span>
                <span style={{ fontSize: '18px', color: '#8A8A9A', flexShrink: 0, marginLeft: '12px', transform: faqAberto === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {faqAberto === i && (
                <div style={{ padding: '0 20px 16px', fontSize: '14px', color: '#4A4A5A', lineHeight: '1.6' }}>{item.r}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '40px 24px', background: '#1A1A2E', borderRadius: '16px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>A janela fecha em outubro de 2026.</div>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: '0 0 24px' }}>Cada semana sem estratégia digital é voto que o seu concorrente está conquistando.</p>
        <button onClick={() => handleAssinar('pro')} style={{ padding: '14px 32px', background: '#C9A84C', color: '#1A1A2E', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif' }}>
          Começar agora →
        </button>
      </div>
    </div>
  )
}
