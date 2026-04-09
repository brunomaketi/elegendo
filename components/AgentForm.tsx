'use client'
import { useState, useRef } from 'react'
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
  const outputRef = useRef<HTMLDivElement>(null)

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Formulário */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.12)', borderRadius: '18px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(123,79,216,0.08)', background: 'rgba(123,79,216,0.03)' }}>
          <div style={{ fontSize: '11px', color: 'rgba(45,27,110,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Preencha os dados
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, background: 'rgba(123,79,216,0.1)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: progress === 100 ? '#1D9E75' : 'linear-gradient(90deg, #7B4FD8, #5B3BAA)', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '11px', color: progress === 100 ? '#1D9E75' : '#7B4FD8', fontWeight: 700, minWidth: '32px' }}>{progress}%</span>
          </div>
        </div>

        {/* Campos */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fields.map((field) => (
            <div key={field.name}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(45,27,110,0.5)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {field.label}
                {field.required && <span style={{ color: '#7B4FD8', marginLeft: '3px' }}>*</span>}
              </label>
              {field.type === 'select' ? (
                <select value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} style={selStyle}>
                  <option value="">Selecione...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} required={field.required} rows={3} style={{ ...inpStyle, resize: 'vertical', minHeight: '80px' }} />
              ) : (
                <input type="text" value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} required={field.required} style={inpStyle} />
              )}
            </div>
          ))}

          {error && (
            <div style={{ padding: '12px 14px', background: upgrade ? 'rgba(123,79,216,0.06)' : 'rgba(224,75,74,0.06)', borderRadius: '10px', fontSize: '13px', color: upgrade ? '#7B4FD8' : '#C62828', border: `1px solid ${upgrade ? 'rgba(123,79,216,0.2)' : 'rgba(224,75,74,0.2)'}` }}>
              {error}
              {upgrade && (
                <a href="/planos" style={{ display: 'block', marginTop: '6px', fontWeight: 700, color: '#7B4FD8' }}>Ver planos →</a>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 50, border: 'none', background: loading ? 'rgba(123,79,216,0.4)' : 'linear-gradient(135deg, #7B4FD8 0%, #5B3BAA 100%)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.01em', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 16px rgba(123,79,216,0.35)', fontFamily: 'var(--font-inter), sans-serif' }}>
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Gerando...
              </>
            ) : '✨ Gerar conteúdo'}
          </button>
        </form>
      </div>

      {/* Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Header output */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#2D1B6E' }}>Resultado</span>
            {done && <span style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(29,158,117,0.1)', color: '#1D9E75', borderRadius: '20px', fontWeight: 700 }}>Concluído ✓</span>}
            {loading && <span style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(123,79,216,0.08)', color: '#7B4FD8', borderRadius: '20px', fontWeight: 700 }}>Gerando...</span>}
          </div>
          {output && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCopy} style={ghostBtn}>{copied ? '✓ Copiado' : 'Copiar'}</button>
              <button onClick={handleClear} style={ghostBtn}>Limpar</button>
            </div>
          )}
        </div>

        {/* Área de output */}
        <div ref={outputRef} style={{ minHeight: '520px', maxHeight: '70vh', overflowY: 'auto', background: output ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', borderRadius: '18px', padding: '28px', fontSize: '14px', lineHeight: '1.9', color: '#2D1B6E', whiteSpace: 'pre-wrap', border: `1px solid ${done ? 'rgba(29,158,117,0.25)' : 'rgba(123,79,216,0.1)'}`, transition: 'border-color 0.3s' }}>
          {!loading && !output && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '420px', gap: '12px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(123,79,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✨</div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#2D1B6E', margin: 0 }}>O conteúdo gerado aparecerá aqui</p>
              <p style={{ fontSize: '13px', color: 'rgba(45,27,110,0.4)', margin: 0, textAlign: 'center', maxWidth: '280px', lineHeight: '1.6' }}>
                Preencha os campos ao lado e clique em "Gerar conteúdo"
              </p>
            </div>
          )}
          {loading && !output && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '420px', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', border: '3px solid rgba(123,79,216,0.15)', borderTop: '3px solid #7B4FD8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '14px', color: '#2D1B6E', margin: 0, fontWeight: 600 }}>Gerando seu conteúdo...</p>
              <p style={{ fontSize: '12px', color: 'rgba(45,27,110,0.4)', margin: 0 }}>Isso pode levar alguns segundos</p>
            </div>
          )}
          {output}
        </div>

        {done && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleCopy} style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', borderRadius: 50, border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(123,79,216,0.3)', fontFamily: 'var(--font-inter), sans-serif' }}>
              {copied ? '✓ Copiado!' : 'Copiar conteúdo'}
            </button>
            <button onClick={handleClear} style={{ padding: '11px 22px', background: 'transparent', color: 'rgba(45,27,110,0.6)', borderRadius: 50, border: '1px solid rgba(123,79,216,0.2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif' }}>
              Gerar novamente
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const inpStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(123,79,216,0.15)',
  fontSize: '14px', color: '#2D1B6E', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
  fontFamily: 'var(--font-inter), sans-serif',
}

const selStyle: React.CSSProperties = { ...inpStyle, appearance: 'auto' }

const ghostBtn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(123,79,216,0.15)',
  background: 'transparent', fontSize: '12px', color: 'rgba(45,27,110,0.5)',
  cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500,
}
