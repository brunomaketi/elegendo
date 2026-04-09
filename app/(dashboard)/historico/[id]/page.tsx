import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CopyButton } from './CopyButton'

const AGENTES: Record<string, { label: string; icon: string; bg: string; cor: string }> = {
  roteirista:   { label: 'Roteirista de Reels',      icon: '🎬', bg: '#FBF5E6', cor: '#C9A84C' },
  estrategista: { label: 'Estrategista de Campanha', icon: '🧠', bg: '#E8F8F2', cor: '#1D9E75' },
  copy:         { label: 'Copy Político',            icon: '✍️', bg: '#E8F1FB', cor: '#378ADD' },
  consciencia:  { label: 'Consciência do Problema',  icon: '📊', bg: '#F0EBF8', cor: '#7C5CBF' },
}

export default async function GeracaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: geracao, error } = await supabase
    .from('geracoes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !geracao) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>
        <Link href="/historico" style={{ fontSize: '13px', color: '#8A8A9A', textDecoration: 'none' }}>← Voltar ao histórico</Link>
        <div style={{ marginTop: '40px', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #E8E0D0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A2E', margin: '0 0 6px' }}>Geração não encontrada</p>
          <p style={{ fontSize: '13px', color: '#8A8A9A', margin: 0 }}>ID: {id}</p>
          <p style={{ fontSize: '13px', color: '#E24B4A', margin: '6px 0 0' }}>{error?.message}</p>
        </div>
      </div>
    )
  }

  const ag = AGENTES[geracao.agente] ?? { label: geracao.agente, icon: '🤖', bg: '#F0F0F0', cor: '#8A8A9A' }
  const input = geracao.input as Record<string, string>

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#8A8A9A' }}>
        <Link href="/dashboard" style={{ color: '#8A8A9A', textDecoration: 'none' }}>Início</Link>
        <span>›</span>
        <Link href="/historico" style={{ color: '#8A8A9A', textDecoration: 'none' }}>Histórico</Link>
        <span>›</span>
        <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{ag.label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '28px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: ag.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
          {ag.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>{ag.label}</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#8A8A9A' }}>
              {new Date(geracao.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            {geracao.tokens_usados && (
              <span style={{ fontSize: '12px', color: '#8A8A9A' }}>{geracao.tokens_usados} tokens usados</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: '#F7F5F0', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#8A8A9A', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Dados utilizados
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(input).filter(([, v]) => v).map(([key, value]) => (
            <div key={key}>
              <div style={{ fontSize: '11px', color: '#8A8A9A', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                {key.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '13px', color: '#1A1A2E', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#8A8A9A', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            Conteúdo gerado
          </h2>
          <CopyButton text={geracao.output} />
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#1A1A2E', whiteSpace: 'pre-wrap' }}>
          {geracao.output}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Link href={`/agentes/${geracao.agente}`} style={{ padding: '10px 20px', background: '#1A1A2E', color: '#E8D5A3', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Gerar novamente →
        </Link>
        <Link href="/historico" style={{ padding: '10px 20px', background: 'transparent', color: '#4A4A5A', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 500, border: '1px solid #E8E0D0' }}>
          ← Voltar ao histórico
        </Link>
      </div>
    </div>
  )
}
