import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CopyButton } from './CopyButton'

const AGENTES: Record<string, { label: string; icon: string; bg: string; cor: string }> = {
  roteirista:   { label: 'Roteirista de Reels',      icon: '🎬', bg: 'rgba(123,79,216,0.08)', cor: '#7B4FD8' },
  estrategista: { label: 'Estrategista de Campanha', icon: '🧠', bg: 'rgba(29,158,117,0.08)', cor: '#1D9E75' },
  copy:         { label: 'Copy Político',            icon: '✍️', bg: 'rgba(55,138,221,0.08)', cor: '#378ADD' },
  consciencia:  { label: 'Consciência do Problema',  icon: '📊', bg: 'rgba(45,27,110,0.08)',  cor: '#2D1B6E' },
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
        <Link href="/historico" style={{ fontSize: '13px', color: 'rgba(45,27,110,0.4)', textDecoration: 'none' }}>← Voltar ao histórico</Link>
        <div style={{ marginTop: '40px', textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(123,79,216,0.1)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#2D1B6E', margin: '0 0 6px' }}>Geração não encontrada</p>
          <p style={{ fontSize: '13px', color: 'rgba(45,27,110,0.4)', margin: 0 }}>ID: {id}</p>
          {error?.message && <p style={{ fontSize: '13px', color: '#E24B4A', margin: '6px 0 0' }}>{error.message}</p>}
        </div>
      </div>
    )
  }

  const ag = AGENTES[geracao.agente] ?? { label: geracao.agente, icon: '🤖', bg: 'rgba(123,79,216,0.06)', cor: '#7B4FD8' }
  const input = geracao.input as Record<string, string>

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13 }}>
        <Link href="/dashboard" style={{ color: 'rgba(45,27,110,0.4)', textDecoration: 'none' }}>Início</Link>
        <span style={{ color: 'rgba(45,27,110,0.25)' }}>›</span>
        <Link href="/historico" style={{ color: 'rgba(45,27,110,0.4)', textDecoration: 'none' }}>Histórico</Link>
        <span style={{ color: 'rgba(45,27,110,0.25)' }}>›</span>
        <span style={{ color: '#2D1B6E', fontWeight: 600 }}>{ag.label}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: ag.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          {ag.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2D1B6E', margin: '0 0 5px', letterSpacing: '-0.01em' }}>{ag.label}</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'rgba(45,27,110,0.4)' }}>
              {new Date(geracao.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            {geracao.tokens_usados && (
              <span style={{ fontSize: 11, color: '#7B4FD8', background: 'rgba(123,79,216,0.08)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                {geracao.tokens_usados} tokens
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dados utilizados */}
      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Dados utilizados
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {Object.entries(input).filter(([, v]) => v).map(([key, value]) => (
            <div key={key}>
              <div style={{ fontSize: 10, color: 'rgba(45,27,110,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                {key.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 13, color: '#2D1B6E', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo gerado */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Conteúdo gerado
          </h2>
          <CopyButton text={geracao.output} />
        </div>
        <div style={{ fontSize: 14, lineHeight: '1.9', color: '#2D1B6E', whiteSpace: 'pre-wrap' }}>
          {geracao.output}
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Link href={`/agentes/${geracao.agente}`} style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', borderRadius: 50, textDecoration: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 14px rgba(123,79,216,0.3)' }}>
          Gerar novamente →
        </Link>
        <Link href="/historico" style={{ padding: '11px 22px', background: 'transparent', color: 'rgba(45,27,110,0.6)', borderRadius: 50, textDecoration: 'none', fontSize: 14, fontWeight: 600, border: '1px solid rgba(123,79,216,0.2)' }}>
          ← Voltar ao histórico
        </Link>
      </div>
    </div>
  )
}
