'use client'

export function CopyButton({ text }: { text: string }) {
  const handleCopy = () => navigator.clipboard.writeText(text)
  return (
    <button onClick={handleCopy} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E8E0D0', background: 'transparent', fontSize: '12px', color: '#4A4A5A', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif' }}>
      Copiar tudo
    </button>
  )
}
