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
  { name: 'instagram_atual', label: 'Instagram atual (se tiver)', type: 'text', placeholder: '@seucandidato' },
  { name: 'concorrentes', label: 'Principais concorrentes', type: 'textarea', placeholder: 'Nomes e como eles se comunicam' },
  { name: 'verba', label: 'Verba mensal para digital', type: 'select', required: true, options: [
    { value: 'Sem verba — apenas orgânico', label: 'Sem verba — apenas orgânico' },
    { value: 'Até R$ 500/mês', label: 'Até R$ 500/mês' },
    { value: 'R$ 500 a R$ 2.000/mês', label: 'R$ 500 a R$ 2.000/mês' },
    { value: 'R$ 2.000 a R$ 10.000/mês', label: 'R$ 2.000 a R$ 10.000/mês' },
    { value: 'Acima de R$ 10.000/mês', label: 'Acima de R$ 10.000/mês' },
  ]},
  { name: 'historico', label: 'Histórico eleitoral', type: 'select', required: true, options: [
    { value: 'Primeira candidatura', label: 'Primeira candidatura' },
    { value: 'Já candidatei e não fui eleito', label: 'Já candidatei e não fui eleito' },
    { value: 'Mandato atual — busco reeleição', label: 'Mandato atual — busco reeleição' },
    { value: 'Mandato atual — busco cargo maior', label: 'Mandato atual — busco cargo maior' },
  ]},
  { name: 'prazo', label: 'Prazo até a eleição', type: 'text', placeholder: 'Ex: 6 meses — outubro 2026', required: true },
  { name: 'pautas', label: 'Pautas centrais', type: 'textarea', placeholder: 'Liste as 3 principais bandeiras', required: true },
]

export default function EstrategistaPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>🧠</span>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Estrategista de Campanha</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#8A8A9A', margin: 0 }}>Diagnóstico completo + plano de comunicação de 90 dias com KPIs e prioridades.</p>
      </div>
      <AgentForm agente="estrategista" fields={FIELDS} />
    </div>
  )
}
