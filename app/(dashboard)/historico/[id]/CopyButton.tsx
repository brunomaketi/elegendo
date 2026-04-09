'use client'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} style={{ padding: '7px 16px', borderRadius: 50, border: `1px solid ${copied ? 'rgba(29,158,117,0.3)' : 'rgba(123,79,216,0.2)'}`, background: copied ? 'rgba(29,158,117,0.08)' : 'transparent', fontSize: 12, color: copied ? '#1D9E75' : 'rgba(45,27,110,0.5)', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600, transition: 'all 0.15s' }}>
      {copied ? '✓ Copiado!' : 'Copiar tudo'}
    </button>
  )
}
