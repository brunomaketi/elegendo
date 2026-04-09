'use client'
import { AgentForm } from '@/components/AgentForm'
import type { FieldConfig } from '@/components/AgentForm'

const FIELDS: FieldConfig[] = [
  { name: 'cargo', label: 'Cargo disputado', type: 'select', required: true, options: [
    { value: 'Vereador', label: 'Vereador(a)' },
    { value: 'Deputado Estadual', label: 'Deputado(a) Estadual' },
    { value: 'Deputado Federal', label: 'Deputado(a) Federal' },
    { value: 'Senador', label: 'Senador(a)' },
    { value: 'Governador', label: 'Governador(a)' },
    { value: 'Presidente', label: 'Presidente' },
  ]},
  { name: 'cidade', label: 'Cidade / Estado', type: 'text', placeholder: 'Ex: Campinas, SP', required: true },
  { name: 'pautas', label: '3 pautas principais', type: 'textarea', placeholder: 'Ex: Segurança pública, educação básica, geração de empregos', required: true },
  { name: 'publico_alvo', label: 'Público-alvo', type: 'text', placeholder: 'Ex: Trabalhadores da periferia, 25-45 anos', required: true },
  { name: 'tom', label: 'Tom', type: 'select', required: true, options: [
    { value: 'serio', label: 'Sério e técnico' },
    { value: 'proximo', label: 'Próximo e acolhedor' },
    { value: 'combativo', label: 'Combativo e direto' },
  ]},
  { name: 'duracao', label: 'Duração do Reel', type: 'select', required: true, options: [
    { value: '30s', label: '30 segundos' },
    { value: '60s', label: '60 segundos' },
  ]},
  { name: 'contexto_extra', label: 'Contexto adicional (opcional)', type: 'textarea', placeholder: 'Acontecimento recente, votação, proposta específica...' },
]

export default function RoteiristPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-inter), sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(123,79,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎬</div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#2D1B6E', margin: 0, letterSpacing: '-0.01em' }}>Roteirista de Reels</h1>
            <p style={{ fontSize: '13px', color: 'rgba(45,27,110,0.45)', margin: 0 }}>Gera 3 roteiros com gancho, desenvolvimento e CTA — prontos para gravar.</p>
          </div>
        </div>
      </div>
      <AgentForm agente="roteirista" fields={FIELDS} />
    </div>
  )
}
