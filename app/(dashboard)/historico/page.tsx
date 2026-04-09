import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const AGENTES: Record<string, { label: string; icon: string; bg: string; cor: string }> = {
  roteirista:   { label: 'Roteirista de Reels',      icon: '🎬', bg: 'rgba(123,79,216,0.08)',  cor: '#7B4FD8' },
  estrategista: { label: 'Estrategista de Campanha', icon: '🧠', bg: 'rgba(29,158,117,0.08)',  cor: '#1D9E75' },
  copy:         { label: 'Copy Político',            icon: '✍️', bg: 'rgba(55,138,221,0.08)',  cor: '#378ADD' },
  consciencia:  { label: 'Consciência do Problema',  icon: '📊', bg: 'rgba(45,27,110,0.08)',   cor: '#2D1B6E' },
}

export default async function HistoricoPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: geracoes } = await supabase
    .from('geracoes')
    .select('id, agente, input, output, tokens_usados, criado_em')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(50)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', color: 'rgba(45,27,110,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Histórico</p>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#2D1B6E', margin: 0, letterSpacing: '-0.01em' }}>Suas gerações</h1>
        <p style={{ fontSize: '14px', color: 'rgba(45,27,110,0.45)', margin: '5px 0 0' }}>Clique em qualquer item para ver o conteúdo completo.</p>
      </div>

      {!geracoes || geracoes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(123,79,216,0.1)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(123,79,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>📭</div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#2D1B6E', margin: '0 0 6px' }}>Nenhuma geração ainda</p>
          <p style={{ fontSize: '14px', color: 'rgba(45,27,110,0.45)', margin: '0 0 24px' }}>Use um dos agentes para gerar seu primeiro conteúdo.</p>
          <Link href="/dashboard" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', borderRadius: 50, textDecoration: 'none', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 16px rgba(123,79,216,0.3)' }}>
            Ir para os agentes →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {geracoes.map((g) => {
            const ag = AGENTES[g.agente] ?? { label: g.agente, icon: '🤖', bg: 'rgba(123,79,216,0.06)', cor: '#7B4FD8' }
            const inputResumo = Object.values(g.input as Record<string, string>).slice(0, 2).join(' · ')
            return (
              <Link key={g.id} href={`/historico/${g.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}>

                  {/* Ícone */}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: ag.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {ag.icon}
                  </div>

                  {/* Conteúdo */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#2D1B6E' }}>{ag.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {g.tokens_usados && (
                          <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.35)', background: 'rgba(123,79,216,0.06)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                            {g.tokens_usados} tokens
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: 'rgba(45,27,110,0.4)' }}>
                          {new Date(g.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.4)', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inputResumo}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.6)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.output.slice(0, 120)}...
                    </p>
                  </div>

                  {/* Seta */}
                  <div style={{ flexShrink: 0, color: '#7B4FD8', fontSize: 18, opacity: 0.5 }}>→</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
