'use client'
import { useState, useRef, useEffect } from 'react'
import type { Agente } from '@/types'

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'select' | 'textarea'
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
}

interface AgentFormProps {
  agente: Agente
  fields: FieldConfig[]
  descricao?: string
}

export function AgentForm({ agente, fields }: AgentFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [upgrade, setUpgrade] = useState(false)
  const [copied, setCopied] = useState(false)
  const [done, setDone] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const handleCloseModal = () => {
    setShowUpgradeModal(false)
    setShowUpgradeBanner(true)
  }

  useEffect(() => {
    if (showUpgradeModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showUpgradeModal])

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOutput('')
    setError('')
    setUpgrade(false)
    setDone(false)
    setLoading(true)

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agente, input: values }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.upgrade) setUpgrade(true)
        setError(data.error ?? 'Erro ao gerar conteúdo.')
        setLoading(false)
        return
      }

      const alerteUpgrade = res.headers.get('X-Alerte-Upgrade') === '1'

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        const chunk = decoder.decode(value)
        setOutput((prev) => {
          const next = prev + chunk
          setTimeout(() => {
            outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
          }, 10)
          return next
        })
      }
      setDone(true)

      if (alerteUpgrade) {
        setTimeout(() => setShowUpgradeModal(true), 600)
      }

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)

    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setOutput('')
    setDone(false)
    setError('')
  }

  const filledFields = Object.values(values).filter(v => v).length
  const totalRequired = fields.filter(f => f.required).length
  const progress = totalRequired > 0 ? Math.round((Math.min(filledFields, totalRequired) / totalRequired) * 100) : 0

  const arrowRight = '\u2192'

  return (
    <>
      <style>{`
        .agent-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 900px) {
          .agent-grid { grid-template-columns: 400px 1fr; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {showUpgradeBanner && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          background: 'linear-gradient(90deg, #2D1B6E 0%, #7B4FD8 50%, #2D1B6E 100%)',
          backgroundSize: '200% auto',
          animation: 'bannerIn 0.4s ease, shimmer 4s linear infinite',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          boxShadow: '0 2px 20px rgba(123,79,216,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 18 }}>&#9889;</span>
            <div>
              <p style={{ margin: 0, color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                Última geração gratuita usada!
              </p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.3 }}>
                Faça upgrade e continue gerando conteúdo ilimitado para sua campanha
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            
              href="/planos?highlight=essencial"
              style={{
                padding: '7px 16px', borderRadius: 50,
                background: '#C9A84C', color: '#2D1B6E',
                fontSize: 12, fontWeight: 800, textDecoration: 'none',
                whiteSpace: 'nowrap', animation: 'pulse 2s ease infinite',
                display: 'inline-block',
              }}
            >
              {`Ver planos ${arrowRight}`}
            </a>
            <button
              onClick={() => setShowUpgradeBanner(false)}
              style={{
                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)',
                fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
              }}
            >
              &#215;
            </button>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(20,10,50,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
            animation: 'overlayIn 0.25s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 24, maxWidth: 460, width: '100%',
              overflow: 'hidden', boxShadow: '0 24px 80px rgba(45,27,110,0.35)',
              animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #2D1B6E 0%, #7B4FD8 100%)',
              padding: '28px 28px 24px',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>&#9889;</div>
              <h2 style={{
                margin: '0 0 6px', color: '#fff', fontSize: 22, fontWeight: 800,
                fontFamily: 'var(--font-inter), sans-serif', lineHeight: 1.2,
              }}>
                Você usou sua última<br />geração gratuita!
              </h2>
              <p style={{
                margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 14,
                fontFamily: 'var(--font-inter), sans-serif', lineHeight: 1.5,
              }}>
                O conteúdo já foi gerado e está disponível abaixo.
              </p>
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  color: '#fff', width: 30, height: 30, borderRadius: '50%',
                  fontSize: 16, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                &#215;
              </button>
            </div>

            <div style={{ padding: '24px 28px 28px' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: 6, fontSize: 12, fontWeight: 600,
                  color: 'rgba(45,27,110,0.5)', fontFamily: 'var(--font-inter), sans-serif',
                }}>
                  <span>Gerações utilizadas</span>
                  <span style={{ color: '#7B4FD8' }}>5 de 5</span>
                </div>
                <div style={{ height: 8, background: 'rgba(123,79,216,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: '100%', borderRadius: 4,
                    background: 'linear-gradient(90deg, #7B4FD8, #C9A84C)',
                  }} />
                </div>
              </div>

              <div style={{
                background: 'rgba(123,79,216,0.05)', borderRadius: 14,
                padding: '16px 18px', marginBottom: 20,
                border: '1px solid rgba(123,79,216,0.12)',
              }}>
                <p style={{
                  margin: '0 0 10px', fontSize: 13, fontWeight: 700,
                  color: '#2D1B6E', fontFamily: 'var(--font-inter), sans-serif',
                }}>
                  Com o plano Essencial você tem:
                </p>
                {[
                  '50 gerações por mês',
                  'Modelo de IA superior (Sonnet)',
                  'Conteúdo de maior qualidade',
                  'Suporte prioritário',
                ].map((b) => (
                  <div key={b} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 6, fontSize: 13, color: '#2D1B6E',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}>
                    <span style={{ color: '#1D9E75', fontWeight: 700 }}>&#10003;</span>
                    {b}
                  </div>
                ))}
              </div>

              
                href="/planos?highlight=essencial"
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '14px', borderRadius: 50,
                  background: 'linear-gradient(135deg, #7B4FD8 0%, #5B3BAA 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 800,
                  textDecoration: 'none', marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(123,79,216,0.4)',
                  fontFamily: 'var(--font-inter), sans-serif',
                  animation: 'pulse 2s ease infinite',
                }}
              >
                {`\u2728 Fazer upgrade agora`}
              </a>
              <button
                onClick={handleCloseModal}
                style={{
                  display: 'block', width: '100%', textAlign: 'center',
                  padding: '11px', borderRadius: 50, cursor: 'pointer',
                  background: 'transparent', border: '1px solid rgba(123,79,216,0.2)',
                  color: 'rgba(45,27,110,0.5)', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
              >
                Ver meu conteúdo gerado
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="agent-grid" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>

        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.12)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(123,79,216,0.08)', background: 'rgba(123,79,216,0.03)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(45,27,110,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Preencha os dados
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, background: 'rgba(123,79,216,0.1)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: progress === 100 ? '#1D9E75' : 'linear-gradient(90deg, #7B4FD8, #5B3BAA)', width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 11, color: progress === 100 ? '#1D9E75' : '#7B4FD8', fontWeight: 700, minWidth: 32 }}>{progress}%</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {fields.map((field) => (
              <div key={field.name}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(45,27,110,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {field.label}
                  {field.required && <span style={{ color: '#7B4FD8', marginLeft: 3 }}>*</span>}
                </label>
                {field.type === 'select' ? (
                  <select value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} style={selStyle}>
                    <option value="">Selecione...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} required={field.required} rows={3} style={{ ...inpStyle, resize: 'vertical', minHeight: 80 }} />
                ) : (
                  <input type="text" value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} required={field.required} style={inpStyle} />
                )}
              </div>
            ))}

            {error && (
              <div style={{ padding: '12px 14px', background: upgrade ? 'rgba(123,79,216,0.06)' : 'rgba(224,75,74,0.06)', borderRadius: 10, fontSize: 13, color: upgrade ? '#7B4FD8' : '#C62828', border: `1px solid ${upgrade ? 'rgba(123,79,216,0.2)' : 'rgba(224,75,74,0.2)'}` }}>
                {error}
                {upgrade && <a href="/planos" style={{ display: 'block', marginTop: 6, fontWeight: 700, color: '#7B4FD8' }}>Ver planos</a>}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 50, border: 'none', background: loading ? 'rgba(123,79,216,0.4)' : 'linear-gradient(135deg, #7B4FD8 0%, #5B3BAA 100%)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 16px rgba(123,79,216,0.35)', fontFamily: 'var(--font-inter), sans-serif' }}>
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Gerando...
                </>
              ) : '✨ Gerar conteúdo'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2D1B6E' }}>Resultado</span>
              {done && <span style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(29,158,117,0.1)', color: '#1D9E75', borderRadius: 20, fontWeight: 700 }}>Concluído ✓</span>}
              {loading && <span style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(123,79,216,0.08)', color: '#7B4FD8', borderRadius: 20, fontWeight: 700 }}>Gerando...</span>}
            </div>
            {output && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCopy} style={ghostBtn}>{copied ? '✓ Copiado' : 'Copiar'}</button>
                <button onClick={handleClear} style={ghostBtn}>Limpar</button>
              </div>
            )}
          </div>

          <div ref={outputRef} style={{ minHeight: 320, maxHeight: '65vh', overflowY: 'auto', background: output ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', borderRadius: 18, padding: '20px', fontSize: 14, lineHeight: 1.9, color: '#2D1B6E', whiteSpace: 'pre-wrap', border: `1px solid ${done ? 'rgba(29,158,117,0.25)' : 'rgba(123,79,216,0.1)'}`, transition: 'border-color 0.3s' }}>
            {!loading && !output && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 260, gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(123,79,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✨</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#2D1B6E', margin: 0 }}>O conteúdo gerado aparecerá aqui</p>
                <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.4)', margin: 0, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
                  Preencha os campos e clique em "Gerar conteúdo"
                </p>
              </div>
            )}
            {loading && !output && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 260, gap: 16 }}>
                <div style={{ width: 44, height: 44, border: '3px solid rgba(123,79,216,0.15)', borderTop: '3px solid #7B4FD8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontSize: 14, color: '#2D1B6E', margin: 0, fontWeight: 600 }}>Gerando seu conteúdo...</p>
                <p style={{ fontSize: 12, color: 'rgba(45,27,110,0.4)', margin: 0 }}>Isso pode levar alguns segundos</p>
              </div>
            )}
            {output}
          </div>

          {done && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={handleCopy} style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', borderRadius: 50, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(123,79,216,0.3)', fontFamily: 'var(--font-inter), sans-serif' }}>
                {copied ? '✓ Copiado!' : 'Copiar conteúdo'}
              </button>
              <button onClick={handleClear} style={{ padding: '11px 22px', background: 'transparent', color: 'rgba(45,27,110,0.5)', borderRadius: 50, border: '1px solid rgba(123,79,216,0.2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif' }}>
                Gerar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const inpStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(123,79,216,0.15)',
  fontSize: 14, color: '#2D1B6E', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
  fontFamily: 'var(--font-inter), sans-serif',
}
const selStyle: React.CSSProperties = { ...inpStyle, appearance: 'auto' }
const ghostBtn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(123,79,216,0.15)',
  background: 'transparent', fontSize: 12, color: 'rgba(45,27,110,0.5)',
  cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500,
}
