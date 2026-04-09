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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>🎬</span>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Roteirista de Reels</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#8A8A9A', margin: 0 }}>Gera 3 roteiros com gancho, desenvolvimento e CTA — prontos para gravar.</p>
      </div>
      <AgentForm agente="roteirista" fields={FIELDS} />
    </div>
  )
}
