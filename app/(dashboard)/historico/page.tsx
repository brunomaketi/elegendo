import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const AGENTES: Record<string, { label: string; icon: string; bg: string; cor: string }> = {
  roteirista:   { label: 'Roteirista de Reels',      icon: '🎬', bg: '#FBF5E6', cor: '#C9A84C' },
  estrategista: { label: 'Estrategista de Campanha', icon: '🧠', bg: '#E8F8F2', cor: '#1D9E75' },
  copy:         { label: 'Copy Político',            icon: '✍️', bg: '#E8F1FB', cor: '#378ADD' },
  consciencia:  { label: 'Consciência do Problema',  icon: '📊', bg: '#F0EBF8', cor: '#7C5CBF' },
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
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: '#8A8A9A', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Histórico</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Suas gerações</h1>
        <p style={{ fontSize: '14px', color: '#8A8A9A', margin: '4px 0 0' }}>Clique em qualquer item para ver o conteúdo completo.</p>
      </div>

      {!geracoes || geracoes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #E8E0D0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A2E', margin: '0 0 6px' }}>Nenhuma geração ainda</p>
          <p style={{ fontSize: '14px', color: '#8A8A9A', margin: '0 0 20px' }}>Use um dos agentes para gerar seu primeiro conteúdo.</p>
          <Link href="/dashboard" style={{ padding: '10px 20px', background: '#1A1A2E', color: '#E8D5A3', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Ir para os agentes →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {geracoes.map((g) => {
            const ag = AGENTES[g.agente] ?? { label: g.agente, icon: '🤖', bg: '#F0F0F0', cor: '#8A8A9A' }
            const inputResumo = Object.entries(g.input as Record<string, string>)
              .slice(0, 2)
              .map(([k, v]) => v)
              .join(' · ')
            return (
              <Link key={g.id} href={`/historico/${g.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: ag.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {ag.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>{ag.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {g.tokens_usados && (
                          <span style={{ fontSize: '11px', color: '#8A8A9A' }}>{g.tokens_usados} tokens</span>
                        )}
                        <span style={{ fontSize: '12px', color: '#8A8A9A' }}>
                          {new Date(g.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#8A8A9A', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inputResumo}
                    </p>
                    <p style={{ fontSize: '13px', color: '#4A4A5A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.output.slice(0, 120)}...
                    </p>
                  </div>
                  <div style={{ fontSize: '16px', color: '#C9A84C', flexShrink: 0 }}>→</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
