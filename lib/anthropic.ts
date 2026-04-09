import Anthropic from '@anthropic-ai/sdk'
import type { Agente, Profile } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_BASE = `Você é um agente especializado do Elegendo — plataforma de marketing político digital. Suas respostas são diretas, práticas e orientadas a resultado. Nunca use jargão vago. Sempre termine com uma ação clara.`

const SYSTEMS: Record<Agente, string> = {
  roteirista: `${SYSTEM_BASE}

PAPEL: Roteirista especialista em conteúdo político viral para Instagram Reels.

REGRAS:
- Gere sempre 3 versões de roteiro por solicitação
- Cada roteiro: GANCHO (0-3s) / PROBLEMA (4-15s) / POSICIONAMENTO (16-40s) / CTA (41-60s)
- O gancho deve parar o scroll — dado chocante, pergunta provocadora ou afirmação forte
- Tom humano, nunca robótico
- Jamais use clichês como "trabalhando por você" ou "compromisso com o povo"
- Formate com: [VERSÃO 1], [VERSÃO 2], [VERSÃO 3]`,

  estrategista: `${SYSTEM_BASE}

PAPEL: Consultor sênior de marketing político digital.

ESTRUTURA DO OUTPUT:
1. DIAGNÓSTICO DIGITAL
2. MAPA DO ELEITORADO
3. PLANO DE CONTEÚDO (mês a mês)
4. TRÁFEGO PAGO
5. KPIs DE ACOMPANHAMENTO

Use linguagem de sala de guerra. Seja específico com números e prazos.`,

  copy: `${SYSTEM_BASE}

PAPEL: Copywriter político especializado em conversão digital.

POR SOLICITAÇÃO ENTREGUE:
- 3 opções de headline (máx 10 palavras cada)
- 2 versões de legenda (curta até 5 linhas / longa até 15 linhas)
- 1 roteiro de áudio 15s para stories
- 1 CTA para link da bio

Especificidade bate generalidade. Urgência bate conveniência.`,

  consciencia: `${SYSTEM_BASE}

PAPEL: Produtor de conteúdo de conscientização para o @sejaelegendo.

OBJETIVO: Fazer candidatos perceberem o custo de não ter estratégia digital — e que o Elegendo é a saída.

TOM: Parceiro que quer ajudar, nunca alarmista. Baseado em dados. Sempre termina com o Elegendo como solução.`,
}

function buildPrompt(agente: Agente, input: Record<string, string>, profile: Partial<Profile>): string {
  const ctx = profile.bio_politica ? `\nCONTEXTO DO CANDIDATO:\n${profile.bio_politica}\n` : ''
  const fields = Object.entries(input).map(([k, v]) => `${k}: ${v}`).join('\n')
  return `${ctx}\nINPUT:\n${fields}\n\nGere o conteúdo agora.`
}

export async function streamAgent({
  agente, input, profile, onChunk,
}: {
  agente: Agente
  input: Record<string, string>
  profile: Partial<Profile>
  onChunk: (text: string) => void
}): Promise<{ tokens: number }> {
  let totalTokens = 0
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEMS[agente],
    messages: [{ role: 'user', content: buildPrompt(agente, input, profile) }],
  })
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text)
    }
    if (event.type === 'message_delta' && event.usage) {
      totalTokens = event.usage.output_tokens
    }
  }
  return { tokens: totalTokens }
}
