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
  { name: 'pauta_central', label: 'Pauta central deste conteúdo', type: 'text', placeholder: 'Ex: Proposta de iluminação LED nos bairros periféricos', required: true },
  { name: 'publico_alvo', label: 'Público-alvo', type: 'text', placeholder: 'Ex: Moradores da periferia, 30-55 anos', required: true },
  { name: 'plataforma', label: 'Plataforma', type: 'select', required: true, options: [
    { value: 'Meta', label: 'Meta (Instagram + Facebook)' },
    { value: 'Google', label: 'Google Ads' },
    { value: 'TikTok', label: 'TikTok' },
    { value: 'WhatsApp', label: 'WhatsApp' },
  ]},
  { name: 'objetivo', label: 'Objetivo', type: 'select', required: true, options: [
    { value: 'consciencia', label: 'Consciência — apresentar o candidato' },
    { value: 'engajamento', label: 'Engajamento — comentários e compartilhamentos' },
    { value: 'conversao', label: 'Conversão — captar contato ou pedido de voto' },
  ]},
  { name: 'tom', label: 'Tom', type: 'select', required: true, options: [
    { value: 'serio', label: 'Sério e técnico' },
    { value: 'proximo', label: 'Próximo e humano' },
    { value: 'combativo', label: 'Combativo e direto' },
    { value: 'esperancoso', label: 'Esperançoso e propositivo' },
  ]},
  { name: 'diferencial', label: 'Diferencial do candidato (opcional)', type: 'textarea', placeholder: 'O que torna este candidato único?' },
]

export default function CopyPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>✍️</span>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Copy Político</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#8A8A9A', margin: 0 }}>Headlines, legendas, roteiro de stories e CTA prontos para subir.</p>
      </div>
      <AgentForm agente="copy" fields={FIELDS} />
    </div>
  )
}
