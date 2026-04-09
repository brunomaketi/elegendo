export type Plano = 'gratuito' | 'essencial' | 'pro'
export type Agente = 'roteirista' | 'estrategista' | 'copy' | 'consciencia'

export interface Profile {
  id: string
  email: string
  nome?: string
  cargo?: string
  cidade?: string
  estado?: string
  partido?: string
  instagram?: string
  bio_politica?: string
  plano: Plano
  is_admin: boolean
}

export const LIMITES_PLANO: Record<Plano, number | null> = {
  gratuito: 5,
  essencial: 50,
  pro: null,
}

export const AGENTE_LABELS: Record<Agente, string> = {
  roteirista: 'Roteirista de Reels',
  estrategista: 'Estrategista de Campanha',
  copy: 'Copy Político',
  consciencia: 'Consciência do Problema',
}

export const AGENTE_DESCRICOES: Record<Agente, string> = {
  roteirista: 'Gera 3 roteiros de Reels com gancho, desenvolvimento e CTA prontos para gravar.',
  estrategista: 'Diagnóstico completo + plano de comunicação de 90 dias para sua campanha.',
  copy: 'Headlines, legendas e copies para anúncios em Meta, Google e TikTok.',
  consciencia: 'Conteúdo que cria urgência sobre o custo de não ter estratégia digital.',
}
