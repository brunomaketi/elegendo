'use client'
import { useState, useRef } from 'react'
import type { Agente } from '@/types'
import { AGENTE_LABELS } from '@/types'

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

export function AgentForm({ agente, fields, descricao }: AgentFormProps) {
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
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'start', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Formulário */}
      <div style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header do form */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EBE0', background: '#FAFAF8' }}>
          <div style={{ fontSize: '12px', color: '#8A8A9A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Preencha os dados
          </div>
          {/* Barra de progresso */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <div style={{ flex: 1, background: '#F0EBE0', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: progress === 100 ? '#1D9E75' : '#C9A84C', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '11px', color: progress === 100 ? '#1D9E75' : '#8A8A9A', fontWeight: 600, minWidth: '32px' }}>{progress}%</span>
          </div>
        </div>

        {/* Campos */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fields.map((field) => (
            <div key={field.name}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4A4A5A', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {field.label}
                {field.required && <span style={{ color: '#C9A84C', marginLeft: '3px' }}>*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={values[field.name] ?? ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  style={selStyle}
                >
                  <option value="">Selecione...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={values[field.name] ?? ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  style={{ ...inpStyle, resize: 'vertical', minHeight: '80px' }}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.name] ?? ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={inpStyle}
                />
              )}
            </div>
          ))}

          {error && (
            <div style={{ padding: '12px 14px', background: upgrade ? '#FFF8E6' : '#FEECEC', borderRadius: '8px', fontSize: '13px', color: upgrade ? '#633806' : '#C62828', border: `1px solid ${upgrade ? '#F0D080' : '#F9C0C0'}` }}>
              {error}
              {upgrade && (
                <a href="/planos" style={{ display: 'block', marginTop: '6px', fontWeight: 600, color: '#C9A84C' }}>
                  Ver planos →
                </a>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              background: loading ? '#8A8A9A' : '#1A1A2E',
              color: loading ? '#fff' : '#E8D5A3',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
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
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>Resultado</span>
            {done && (
              <span style={{ fontSize: '11px', padding: '2px 8px', background: '#E8F8F2', color: '#1D9E75', borderRadius: '20px', fontWeight: 600 }}>
                Concluído
              </span>
            )}
            {loading && (
              <span style={{ fontSize: '11px', padding: '2px 8px', background: '#FFF8E6', color: '#C9A84C', borderRadius: '20px', fontWeight: 600 }}>
                Gerando...
              </span>
            )}
          </div>
          {output && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCopy} style={ghostBtn}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
              <button onClick={handleClear} style={ghostBtn}>
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Área de output */}
        <div
          ref={outputRef}
          style={{
            minHeight: '520px',
            maxHeight: '70vh',
            overflowY: 'auto',
            background: output ? '#fff' : '#FAFAF8',
            borderRadius: '16px',
            padding: '24px',
            fontSize: '14px',
            lineHeight: '1.85',
            color: '#1A1A2E',
            whiteSpace: 'pre-wrap',
            border: `1px solid ${done ? '#C8E6C9' : '#E8E0D0'}`,
            transition: 'border-color 0.3s',
            position: 'relative',
          }}
        >
          {!loading && !output && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', gap: '12px', color: '#8A8A9A' }}>
              <div style={{ fontSize: '40px' }}>✨</div>
              <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>O conteúdo gerado aparecerá aqui</p>
              <p style={{ fontSize: '13px', margin: 0, textAlign: 'center', maxWidth: '280px', lineHeight: '1.6' }}>
                Preencha os campos ao lado e clique em "Gerar conteúdo"
              </p>
            </div>
          )}
          {loading && !output && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #F0EBE0', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '14px', color: '#8A8A9A', margin: 0, fontWeight: 500 }}>Gerando seu conteúdo...</p>
              <p style={{ fontSize: '12px', color: '#8A8A9A', margin: 0 }}>Isso pode levar alguns segundos</p>
            </div>
          )}
          {output}
        </div>

        {done && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleCopy} style={{ padding: '10px 20px', background: '#1A1A2E', color: '#E8D5A3', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {copied ? '✓ Copiado!' : 'Copiar conteúdo'}
            </button>
            <button onClick={handleClear} style={{ padding: '10px 20px', background: 'transparent', color: '#4A4A5A', borderRadius: '8px', border: '1px solid #E8E0D0', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              Gerar novamente
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const inpStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #E8E0D0',
  fontSize: '14px',
  color: '#1A1A2E',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'var(--font-inter), sans-serif',
}

const selStyle: React.CSSProperties = {
  ...inpStyle,
  appearance: 'auto',
}

const ghostBtn: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: '6px',
  border: '1px solid #E8E0D0',
  background: 'transparent',
  fontSize: '12px',
  color: '#4A4A5A',
  cursor: 'pointer',
  fontFamily: 'var(--font-inter), sans-serif',
}
