'use client'
import { useEffect, useState } from 'react'

const AGENTE_LABEL: Record<string, string> = {
  roteirista: 'Roteirista',
  estrategista: 'Estrategista',
  copy: 'Copy Político',
  consciencia: 'Consciência',
}

const PLANO_COR: Record<string, { bg: string; color: string; label: string }> = {
  gratuito:  { bg: 'rgba(138,138,154,0.1)',  color: '#8A8A9A', label: 'Gratuito' },
  essencial: { bg: 'rgba(123,79,216,0.1)',   color: '#7B4FD8', label: 'Essencial' },
  pro:       { bg: 'rgba(29,158,117,0.1)',   color: '#1D9E75', label: 'Pro' },
  agencia:   { bg: 'rgba(55,138,221,0.1)',   color: '#378ADD', label: 'Agência' },
}

type Stats = {
  totais: { usuarios: number; geracoes: number; tokens: number }
  statsPorPlano: Record<string, number>
  statsPorAgente: Record<string, number>
  geracoesPorDia: Record<string, number>
  usuarios: Array<{ id: string; nome: string; email: string; plano: string; cargo: string; cidade: string; estado: string; criado_em: string; totalGeracoes: number }>
  ultimasGeracoes: Array<{ id: string; agente: string; email: string; nome: string; tokens_usados: number; criado_em: string }>
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [aba, setAba] = useState<'visao' | 'usuarios' | 'geracoes'>('visao')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.error) setErro(d.error)
        else setStats(d)
      })
      .catch(() => setErro('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'var(--font-inter), sans-serif', color: 'rgba(45,27,110,0.4)' }}>
      Carregando painel...
    </div>
  )

  if (erro) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'var(--font-inter), sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#C62828' }}>{erro}</p>
      </div>
    </div>
  )

  if (!stats) return null

  const usuariosFiltrados = stats.usuarios.filter(u =>
    busca === '' ||
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase()) ||
    u.plano?.toLowerCase().includes(busca.toLowerCase())
  )

  const diasLabels = Object.keys(stats.geracoesPorDia).slice(-14)
  const diasValues = diasLabels.map(d => stats.geracoesPorDia[d])
  const maxVal = Math.max(...diasValues, 1)

  const abaStyle = (id: string) => ({
    padding: '10px 20px', borderRadius: 10, border: 'none',
    background: aba === id ? 'linear-gradient(135deg, #7B4FD8, #5B3BAA)' : 'transparent',
    color: aba === id ? '#fff' : 'rgba(45,27,110,0.5)',
    fontSize: 13, fontWeight: 700 as const, cursor: 'pointer',
    fontFamily: 'var(--font-inter), sans-serif', transition: 'all 0.15s',
  })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Acesso restrito</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2D1B6E', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Painel Administrativo</h1>
        <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.45)', margin: 0 }}>Visão completa da plataforma Elegendo.</p>
      </div>

      {/* KPIs principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Usuários cadastrados', value: stats.totais.usuarios, cor: '#7B4FD8', icon: '👥' },
          { label: 'Gerações totais', value: stats.totais.geracoes, cor: '#1D9E75', icon: '✨' },
          { label: 'Tokens consumidos', value: stats.totais.tokens.toLocaleString('pt-BR'), cor: '#378ADD', icon: '⚡' },
          { label: 'Planos pagos', value: (stats.statsPorPlano.pro ?? 0) + (stats.statsPorPlano.essencial ?? 0) + (stats.statsPorPlano.agencia ?? 0), cor: '#C9A84C', icon: '💰' },
        ].map(({ label, value, cor, icon }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.12)', borderRadius: 16, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.5)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 16 }}>{icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: cor, lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Distribuição por plano + por agente */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>

        {/* Por plano */}
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 16, padding: '20px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Usuários por plano</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(PLANO_COR).map(([plano, cfg]) => {
              const qtd = stats.statsPorPlano[plano] ?? 0
              const pct = stats.totais.usuarios > 0 ? Math.round((qtd / stats.totais.usuarios) * 100) : 0
              return (
                <div key={plano}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2D1B6E' }}>{cfg.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{qtd} usuários <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(45,27,110,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Por agente */}
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 16, padding: '20px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Gerações por agente</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(stats.statsPorAgente).sort((a, b) => b[1] - a[1]).map(([agente, qtd]) => {
              const total = stats.totais.geracoes
              const pct = total > 0 ? Math.round((qtd / total) * 100) : 0
              return (
                <div key={agente}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2D1B6E' }}>{AGENTE_LABEL[agente] ?? agente}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#7B4FD8' }}>{qtd} <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(45,27,110,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #7B4FD8, #5B3BAA)', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(stats.statsPorAgente).length === 0 && (
              <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.4)', margin: 0 }}>Nenhuma geração ainda.</p>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico gerações últimos 14 dias */}
      <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 16, padding: '20px', marginBottom: 28 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 20px' }}>Gerações — últimos 14 dias</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {diasLabels.map((dia, i) => {
            const val = diasValues[i]
            const altura = maxVal > 0 ? Math.max((val / maxVal) * 80, val > 0 ? 4 : 2) : 2
            const dataFmt = new Date(dia + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            return (
              <div key={dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${dataFmt}: ${val} gerações`}>
                <span style={{ fontSize: 9, color: 'rgba(45,27,110,0.4)', fontWeight: 600 }}>{val > 0 ? val : ''}</span>
                <div style={{ width: '100%', height: altura, background: val > 0 ? 'linear-gradient(180deg, #7B4FD8, #5B3BAA)' : 'rgba(45,27,110,0.06)', borderRadius: 4, transition: 'height 0.3s' }} />
                <span style={{ fontSize: 8, color: 'rgba(45,27,110,0.3)', whiteSpace: 'nowrap' }}>{dataFmt}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 6, border: '1px solid rgba(123,79,216,0.1)' }}>
        <button onClick={() => setAba('visao')} style={abaStyle('visao')}>📊 Visão geral</button>
        <button onClick={() => setAba('usuarios')} style={abaStyle('usuarios')}>👥 Usuários ({stats.totais.usuarios})</button>
        <button onClick={() => setAba('geracoes')} style={abaStyle('geracoes')}>✨ Gerações ({stats.totais.geracoes})</button>
      </div>

      {/* Visão geral */}
      {aba === 'visao' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {stats.usuarios.slice(0, 6).map(u => {
            const cfg = PLANO_COR[u.plano] ?? PLANO_COR.gratuito
            return (
              <div key={u.id} style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                    {u.nome?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1B6E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.nome || '—'}</div>
                    <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)' }}>{u.totalGeracoes} gerações</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Usuários */}
      {aba === 'usuarios' && (
        <div>
          <input
            type="text"
            placeholder="Buscar por nome, email ou plano..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ width: '100%', padding: '11px 16px', borderRadius: 12, border: '1px solid rgba(123,79,216,0.15)', fontSize: 14, color: '#2D1B6E', background: 'rgba(255,255,255,0.8)', outline: 'none', fontFamily: 'var(--font-inter), sans-serif', boxSizing: 'border-box', marginBottom: 16 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usuariosFiltrados.map(u => {
              const cfg = PLANO_COR[u.plano] ?? PLANO_COR.gratuito
              const dataCadastro = new Date(u.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
              return (
                <div key={u.id} style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                    {u.nome?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2D1B6E' }}>{u.nome || '(sem nome)'}</div>
                    <div style={{ fontSize: 12, color: 'rgba(45,27,110,0.45)' }}>{u.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {u.cargo && <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.5)', background: 'rgba(45,27,110,0.05)', padding: '2px 8px', borderRadius: 20 }}>{u.cargo}</span>}
                    {u.cidade && <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.45)' }}>{u.cidade}{u.estado ? `/${u.estado}` : ''}</span>}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', whiteSpace: 'nowrap' }}>{u.totalGeracoes} gerações</span>
                    <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.35)', whiteSpace: 'nowrap' }}>Cadastro: {dataCadastro}</span>
                  </div>
                </div>
              )
            })}
            {usuariosFiltrados.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(45,27,110,0.4)', fontSize: 14 }}>Nenhum usuário encontrado.</div>
            )}
          </div>
        </div>
      )}

      {/* Gerações */}
      {aba === 'geracoes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stats.ultimasGeracoes.map(g => {
            const dataFmt = new Date(g.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            return (
              <div key={g.id} style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(123,79,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {g.agente === 'roteirista' ? '🎬' : g.agente === 'estrategista' ? '🧠' : g.agente === 'copy' ? '✍️' : '📊'}
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1B6E' }}>{AGENTE_LABEL[g.agente] ?? g.agente}</div>
                  <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.45)' }}>{g.nome} · {g.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {g.tokens_usados && (
                    <span style={{ fontSize: 11, color: '#7B4FD8', background: 'rgba(123,79,216,0.08)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{g.tokens_usados} tokens</span>
                  )}
                  <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', whiteSpace: 'nowrap' }}>{dataFmt}</span>
                </div>
              </div>
            )
          })}
          {stats.ultimasGeracoes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(45,27,110,0.4)', fontSize: 14 }}>Nenhuma geração ainda.</div>
          )}
        </div>
      )}
    </div>
  )
}
