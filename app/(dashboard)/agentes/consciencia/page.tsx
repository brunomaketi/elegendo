'use client'
import { AgentForm } from '@/components/AgentForm'
import type { FieldConfig } from '@/components/AgentForm'

const FIELDS: FieldConfig[] = [
  { name: 'tema_semana', label: 'Tema da semana', type: 'text', placeholder: 'Ex: Candidatos que ignoram o Instagram perdem votos jovens', required: true },
  { name: 'formato', label: 'Formato', type: 'select', required: true, options: [
    { value: 'reel', label: 'Reel — vídeo curto com roteiro' },
    { value: 'carrossel', label: 'Carrossel — slides com dados' },
    { value: 'post', label: 'Post estático — imagem + legenda' },
    { value: 'stories', label: 'Stories — sequência com enquete' },
  ]},
  { name: 'dado_eleitoral', label: 'Dado ou notícia eleitoral (opcional)', type: 'textarea', placeholder: 'Ex: Pesquisa mostra que 67% dos eleitores 18-35 decidem o voto pelas redes...' },
  { name: 'publico_do_post', label: 'Para quem é este conteúdo', type: 'select', required: true, options: [
    { value: 'candidato iniciante', label: 'Candidato iniciante' },
    { value: 'candidato experiente', label: 'Candidato experiente' },
    { value: 'assessor politico', label: 'Assessor político' },
    { value: 'geral', label: 'Geral' },
  ]},
  { name: 'angulo', label: 'Ângulo da mensagem', type: 'select', required: true, options: [
    { value: 'custo da ausencia', label: 'Custo da ausência — o que perde sem digital' },
    { value: 'erro comum', label: 'Erro comum — o que a maioria faz errado' },
    { value: 'comparacao', label: 'Comparação — quem usa vs quem não usa' },
    { value: 'oportunidade', label: 'Oportunidade — o que ainda dá tempo de fazer' },
  ]},
  { name: 'cta_desejado', label: 'CTA desejado', type: 'select', required: true, options: [
    { value: 'entrar na comunidade', label: 'Entrar na comunidade Elegendo' },
    { value: 'salvar post', label: 'Salvar o post' },
    { value: 'marcar candidato', label: 'Marcar aquele candidato que precisa ver' },
    { value: 'agendar conversa', label: 'Agendar conversa com o Elegendo' },
  ]},
]

export default function ConscienciaPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Consciência do Problema</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#8A8A9A', margin: 0 }}>Conteúdo para o @sejaelegendo que cria urgência em candidatos.</p>
      </div>
      <AgentForm agente="consciencia" fields={FIELDS} />
    </div>
  )
}
