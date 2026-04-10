'use client'
import { useState } from 'react'
import Link from 'next/link'

const DATAS_2026 = [
  { data: '2026-04-21', label: 'Tiradentes',                emoji: '⚔️',  relevancia: 'alta',    mes: 4,  pauta: 'Herói local, coragem política, luta por ideais. Conecte com sua trajetória de resistência.' },
  { data: '2026-04-22', label: 'Dia da Terra',              emoji: '🌍', relevancia: 'media',   mes: 4,  pauta: 'Meio ambiente, saneamento, áreas verdes. Mostre sua posição sobre pauta ambiental.' },
  { data: '2026-05-01', label: 'Dia do Trabalho',           emoji: '✊', relevancia: 'alta',    mes: 5,  pauta: 'Emprego, renda, dignidade. Um dos melhores dias para falar com trabalhadores da base.' },
  { data: '2026-05-10', label: 'Dia das Mães',              emoji: '💐', relevancia: 'alta',    mes: 5,  pauta: 'Saúde da mulher, educação, segurança. Conteúdo emocional de alto engajamento.' },
  { data: '2026-05-15', label: 'Dia do Municipal',          emoji: '🏛️',  relevancia: 'alta',    mes: 5,  pauta: 'Gestão pública, serviços municipais, participação cidadã.' },
  { data: '2026-06-05', label: 'Dia do Meio Ambiente',      emoji: '🌿', relevancia: 'media',   mes: 6,  pauta: 'Sustentabilidade, resíduos, parques. Ótimo para candidatos com pauta verde.' },
  { data: '2026-06-12', label: 'Dia dos Namorados',         emoji: '❤️',  relevancia: 'media',   mes: 6,  pauta: 'Conteúdo mais leve e humano. Mostre seu lado pessoal e aproxime da audiência.' },
  { data: '2026-06-13', label: 'Corpus Christi',            emoji: '⛪', relevancia: 'media',   mes: 6,  pauta: 'Respeito à fé, valores da comunidade. Cuidado com o tom — seja respeitoso e inclusivo.' },
  { data: '2026-06-24', label: 'São João',                  emoji: '🎆', relevancia: 'alta',    mes: 6,  pauta: 'Cultura popular, nordeste, tradições. Alto engajamento, conteúdo festivo e próximo.' },
  { data: '2026-07-09', label: 'Revolução Constitucional',  emoji: '📜', relevancia: 'alta',    mes: 7,  pauta: 'Democracia, São Paulo, federalismo. Forte para candidatos paulistas.' },
  { data: '2026-08-11', label: 'Dia do Estudante',          emoji: '🎓', relevancia: 'media',   mes: 8,  pauta: 'Educação, juventude, oportunidades. Conecte com pauta de ensino e futuro.' },
  { data: '2026-09-07', label: 'Independência do Brasil',   emoji: '🇧🇷', relevancia: 'alta',    mes: 9,  pauta: 'Patriotismo, soberania, orgulho nacional. Muito engajamento — use com cuidado e autenticidade.' },
  { data: '2026-10-02', label: '1º Turno Eleições',         emoji: '🗳️',  relevancia: 'critica', mes: 10, pauta: 'DIA DA ELEIÇÃO. Mobilize eleitores, reforce o número, agradeça o apoio.' },
  { data: '2026-10-04', label: 'Dia de São Francisco',      emoji: '🕊️',  relevancia: 'media',   mes: 10, pauta: 'Paz, meio ambiente, cuidado com o próximo. Tom reflexivo entre os dois turnos.' },
  { data: '2026-10-12', label: 'Nossa Sra. Aparecida',      emoji: '🙏', relevancia: 'alta',    mes: 10, pauta: 'Fé, esperança, Brasil. Alta audiência religiosa — seja genuíno e respeitoso.' },
  { data: '2026-10-25', label: '2º Turno Eleições',         emoji: '🗳️',  relevancia: 'critica', mes: 10, pauta: 'DIA DA DECISÃO. Último esforço de mobilização. Convoque cada eleitor.' },
  { data: '2026-11-02', label: 'Finados',                   emoji: '🕯️',  relevancia: 'media',   mes: 11, pauta: 'Memória, homenagens, reflexão. Tom respeitoso — evite conteúdo político pesado.' },
  { data: '2026-11-15', label: 'Proclamação da República',  emoji: '🏛️',  relevancia: 'alta',    mes: 11, pauta: 'Democracia, república, instituições. Bom para falar sobre papel do candidato eleito.' },
  { data: '2026-11-20', label: 'Consciência Negra',         emoji: '✊🏿', relevancia: 'alta',    mes: 11, pauta: 'Igualdade, representatividade, cultura afro-brasileira. Essencial — seja autêntico.' },
  { data: '2026-12-25', label: 'Natal',                     emoji: '🎄', relevancia: 'alta',    mes: 12, pauta: 'Encerramento de ano, gratidão, esperança. Conteúdo emocional de alto alcance.' },
]

const MESES = [
  { num: 4, label: 'Abril' }, { num: 5, label: 'Maio' }, { num: 6, label: 'Junho' },
  { num: 7, label: 'Julho' }, { num: 8, label: 'Agosto' }, { num: 9, label: 'Setembro' },
  { num: 10, label: 'Outubro' }, { num: 11, label: 'Novembro' }, { num: 12, label: 'Dezembro' },
]

const REL_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  critica: { label: 'Eleitoral',  bg: 'rgba(224,75,74,0.08)',   color: '#C62828', border: 'rgba(224,75,74,0.25)' },
  alta:    { label: 'Alta',       bg: 'rgba(123,79,216,0.08)',  color: '#7B4FD8', border: 'rgba(123,79,216,0.2)' },
  media:   { label: 'Média',      bg: 'rgba(45,27,110,0.05)',   color: 'rgba(45,27,110,0.5)', border: 'rgba(45,27,110,0.1)' },
}

function getDiasRestantes(dataStr: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(dataStr + 'T00:00:00')
  return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export default function CalendarioPage() {
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null)
  const [relSelecionada, setRelSelecionada] = useState<string | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)

  const proximas = DATAS_2026.filter(d => getDiasRestantes(d.data) >= 0).slice(0, 3)

  const datasFiltradas = DATAS_2026.filter(d => {
    if (mesSelecionado && d.mes !== mesSelecionado) return false
    if (relSelecionada && d.relevancia !== relSelecionada) return false
    return true
  })

  const btnStyle = (ativo: boolean) => ({
    padding: '7px 14px', borderRadius: 20,
    border: `1px solid ${ativo ? 'transparent' : 'rgba(123,79,216,0.15)'}`,
    background: ativo ? 'linear-gradient(135deg, #7B4FD8, #5B3BAA)' : 'transparent',
    fontSize: 12, color: ativo ? '#fff' : 'rgba(45,27,110,0.5)',
    cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 600, whiteSpace: 'nowrap' as const,
  })

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Planejamento</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2D1B6E', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Calendário Estratégico</h1>
        <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.45)', margin: 0 }}>Todas as datas relevantes de 2026 com sugestão de pauta para cada momento.</p>
      </div>

      {/* Próximas datas */}
      <div style={{ background: 'linear-gradient(135deg, #2D1B6E, #4A2FA0)', borderRadius: 16, padding: '18px 20px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,79,216,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Próximas datas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {proximas.map(d => {
            const dias = getDiasRestantes(d.data)
            const dataFmt = new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            return (
              <div key={d.data} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{d.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{dataFmt}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: dias <= 7 ? '#FFD166' : 'rgba(255,255,255,0.6)', background: dias <= 7 ? 'rgba(255,209,102,0.15)' : 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  {dias === 0 ? 'Hoje' : `${dias}d`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filtro relevância */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Relevância</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ val: null, label: 'Todas' }, { val: 'critica', label: '🗳️ Eleitoral' }, { val: 'alta', label: '🔥 Alta' }, { val: 'media', label: '📌 Média' }].map(({ val, label }) => (
            <button key={label} onClick={() => setRelSelecionada(val)} style={btnStyle(relSelecionada === val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Filtro mês */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Mês</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setMesSelecionado(null)} style={btnStyle(mesSelecionado === null)}>Todos</button>
          {MESES.map(({ num, label }) => (
            <button key={num} onClick={() => setMesSelecionado(num === mesSelecionado ? null : num)} style={btnStyle(mesSelecionado === num)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {datasFiltradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(255,255,255,0.7)', borderRadius: 16, border: '1px solid rgba(123,79,216,0.1)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 14, color: 'rgba(45,27,110,0.5)', margin: 0 }}>Nenhuma data encontrada para este filtro.</p>
          </div>
        )}
        {datasFiltradas.map((d) => {
          const dias = getDiasRestantes(d.data)
          const passou = dias < 0
          const rel = REL_CONFIG[d.relevancia]
          const dataFmt = new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
          const aberto = expandido === d.data

          return (
            <div key={d.data} onClick={() => setExpandido(aberto ? null : d.data)} style={{ background: passou ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)', border: `1px solid ${passou ? 'rgba(123,79,216,0.06)' : 'rgba(123,79,216,0.1)'}`, borderRadius: 14, overflow: 'hidden', opacity: passou ? 0.55 : 1, cursor: 'pointer' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: passou ? 'rgba(45,27,110,0.05)' : rel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {d.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: passou ? 'rgba(45,27,110,0.4)' : '#2D1B6E' }}>{d.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: rel.bg, color: rel.color, border: `1px solid ${rel.border}` }}>{rel.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(45,27,110,0.4)', marginTop: 2 }}>{dataFmt}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {!passou && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: dias <= 7 ? '#C62828' : dias <= 30 ? '#7B4FD8' : 'rgba(45,27,110,0.4)', background: dias <= 7 ? 'rgba(224,75,74,0.08)' : dias <= 30 ? 'rgba(123,79,216,0.08)' : 'rgba(45,27,110,0.05)', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      {dias === 0 ? 'Hoje' : `${dias}d`}
                    </div>
                  )}
                  {passou && <span style={{ fontSize: 11, color: 'rgba(45,27,110,0.3)', fontWeight: 500 }}>Passou</span>}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(45,27,110,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {aberto && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(123,79,216,0.08)' }}>
                  <div style={{ paddingTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>💡 Sugestão de pauta</div>
                    <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.7)', lineHeight: 1.7, margin: '0 0 14px' }}>{d.pauta}</p>
                    <Link href="/agentes/roteirista" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(123,79,216,0.25)' }}>
                      ✨ Gerar roteiro para esta data
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
