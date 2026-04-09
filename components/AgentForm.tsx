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
}

export function AgentForm({ agente, fields }: AgentFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [upgrade, setUpgrade] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOutput('')
    setError('')
    setUpgrade(false)
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
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setOutput((prev) => {
          const next = prev + chunk
          setTimeout(() => {
            outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
          }, 10)
          return next
        })
      }
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>
          {AGENTE_LABELS[agente]}
        </h2>
        {fields.map((field) => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#4A4A5A' }}>
              {field.label}{field.required && <span style={{ color: '#C9A84C' }}> *</span>}
            </label>
            {field.type === 'select' ? (
              <select value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} style={inputStyle}>
                <option value="">Selecione...</option>
                {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} required={field.required} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
            ) : (
              <input type="text" value={values[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} required={field.required} style={inputStyle} />
            )}
          </div>
        ))}
        <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: loading ? '#8A8A9A' : '#1A1A2E', color: '#E8D5A3', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
          {loading ? 'Gerando...' : 'Gerar conteúdo'}
        </button>
        {error && (
          <div style={{ padding: '12px', background: upgrade ? '#FFF8E1' : '#FEECEC', borderRadius: '8px', fontSize: '13px', color: upgrade ? '#633806' : '#C62828' }}>
            {error}
            {upgrade && <a href="/planos" style={{ display: 'block', marginTop: '6px', fontWeight: 600, color: '#C9A84C' }}>Ver planos →</a>}
          </div>
        )}
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#4A4A5A' }}>Resultado</span>
          {output && (
            <button onClick={handleCopy} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E8E0D0', background: 'transparent', fontSize: '12px', color: '#4A4A5A', cursor: 'pointer' }}>
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          )}
        </div>
        <div ref={outputRef} style={{ minHeight: '420px', maxHeight: '600px', overflowY: 'auto', background: '#F5F0E8', borderRadius: '12px', padding: '20px', fontSize: '14px', lineHeight: '1.8', color: '#1A1A2E', whiteSpace: 'pre-wrap', border: '1px solid #E8E0D0' }}>
          {loading && !output && <span style={{ color: '#8A8A9A', fontStyle: 'italic' }}>Gerando conteúdo...</span>}
          {!loading && !output && <span style={{ color: '#8A8A9A', fontStyle: 'italic' }}>Preencha o formulário e clique em "Gerar conteúdo".</span>}
          {output}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #E8E0D0', fontSize: '14px', color: '#1A1A2E', background: '#fff', width: '100%', boxSizing: 'border-box', outline: 'none' }
