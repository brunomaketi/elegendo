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

const MESES_CONFIG: Record<number, {
  label: string
  cor: string
  corTexto: string
  corBg: string
  campanha: string
  causa: string
  emoji: string
  pautaExtra: string
}> = {
  1:  { label: 'Janeiro',   cor: '#E53935', corTexto: '#fff', corBg: 'rgba(229,57,53,0.08)',   campanha: 'Janeiro Branco',     causa: 'Saúde mental e emocional',                emoji: '🤍', pautaExtra: 'Saúde mental, acolhimento, bem-estar da população.' },
  2:  { label: 'Fevereiro', cor: '#8B4513', corTexto: '#fff', corBg: 'rgba(139,69,19,0.08)',   campanha: 'Fevereiro Laranja',  causa: 'Leucemia e linfoma',                      emoji: '🟠', pautaExtra: 'Saúde pública, acesso a tratamento oncológico.' },
  3:  { label: 'Março',     cor: '#FFEB3B', corTexto: '#333', corBg: 'rgba(255,235,59,0.12)',  campanha: 'Março Amarelo',      causa: 'Endometriose',                            emoji: '💛', pautaExtra: 'Saúde da mulher, diagnóstico precoce, políticas públicas.' },
  4:  { label: 'Abril',     cor: '#42A5F5', corTexto: '#fff', corBg: 'rgba(66,165,245,0.1)',   campanha: 'Abril Azul',         causa: 'Autismo — conscientização e inclusão',    emoji: '💙', pautaExtra: 'Inclusão, acessibilidade, educação especial, dignidade.' },
  5:  { label: 'Maio',      cor: '#FFA726', corTexto: '#fff', corBg: 'rgba(255,167,38,0.1)',   campanha: 'Maio Amarelo',       causa: 'Segurança no trânsito',                   emoji: '🟡', pautaExtra: 'Segurança viária, infraestrutura, educação no trânsito.' },
  6:  { label: 'Junho',     cor: '#AB47BC', corTexto: '#fff', corBg: 'rgba(171,71,188,0.1)',   campanha: 'Junho Vermelho',     causa: 'Doação de sangue',                        emoji: '🩸', pautaExtra: 'Saúde pública, hemocentros, solidariedade.' },
  7:  { label: 'Julho',     cor: '#26A69A', corTexto: '#fff', corBg: 'rgba(38,166,154,0.1)',   campanha: 'Julho Verde',        causa: 'Doação de órgãos',                        emoji: '💚', pautaExtra: 'Saúde pública, solidariedade, políticas de transplante.' },
  8:  { label: 'Agosto',    cor: '#FFD700', corTexto: '#333', corBg: 'rgba(255,215,0,0.12)',   campanha: 'Agosto Dourado',     causa: 'Aleitamento materno',                     emoji: '🌻', pautaExtra: 'Saúde da criança, saúde materna, primeira infância.' },
  9:  { label: 'Setembro',  cor: '#4CAF50', corTexto: '#fff', corBg: 'rgba(76,175,80,0.1)',    campanha: 'Setembro Verde',     causa: 'Doação de órgãos e prevenção ao suicídio',emoji: '💚', pautaExtra: 'Saúde mental, prevenção ao suicídio, acolhimento social.' },
  10: { label: 'Outubro',   cor: '#E91E8C', corTexto: '#fff', corBg: 'rgba(233,30,140,0.1)',   campanha: 'Outubro Rosa',       causa: 'Câncer de mama',                          emoji: '🎀', pautaExtra: 'Saúde da mulher, prevenção, acesso ao diagnóstico precoce.' },
  11: { label: 'Novembro',  cor: '#1565C0', corTexto: '#fff', corBg: 'rgba(21,101,192,0.1)',   campanha: 'Novembro Azul',      causa: 'Câncer de próstata',                      emoji: '💙', pautaExtra: 'Saúde do homem, prevenção, acesso a exames gratuitos.' },
  12: { label: 'Dezembro',  cor: '#F44336', corTexto: '#fff', corBg: 'rgba(244,67,54,0.1)',    campanha: 'Dezembro Vermelho',  causa: 'HIV/AIDS e hepatites virais',             emoji: '🎗️', pautaExtra: 'Saúde pública, prevenção, combate ao preconceito.' },
}

const MESES = [4,5,6,7,8,9,10,11,12].map(n => ({ num: n, label: MESES_CONFIG[n].label }))

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
  const [abaAtiva, setAbaAtiva] = useState<'datas' | 'campanhas'>('datas')

  const proximas = DATAS_2026.filter(d => getDiasRestantes(d.data) >= 0).slice(0, 3)
  const mesAtual = new Date().getMonth() + 1

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
    fontWeight: 600 as const, whiteSpace: 'nowrap' as const,
  })

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: 'rgba(45,27,110,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Planejamento</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2D1B6E', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Calendário Estratégico 2026</h1>
        <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.45)', margin: 0 }}>Datas comemorativas, campanhas de saúde e marcos eleitorais — tudo em um lugar.</p>
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

      {/* Abas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 6, border: '1px solid rgba(123,79,216,0.1)' }}>
        {[
          { id: 'datas', label: '📅 Datas comemorativas' },
          { id: 'campanhas', label: '🎨 Campanhas de saúde' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setAbaAtiva(id as 'datas' | 'campanhas')} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: abaAtiva === id ? 'linear-gradient(135deg, #7B4FD8, #5B3BAA)' : 'transparent', color: abaAtiva === id ? '#fff' : 'rgba(45,27,110,0.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ABA: CAMPANHAS DE SAÚDE */}
      {abaAtiva === 'campanhas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.5)', margin: '0 0 8px', lineHeight: 1.6 }}>
            Cada mês tem uma campanha de conscientização em saúde. Use essas datas para mostrar seu lado humano e conectar pautas sociais com sua campanha.
          </p>
          {Object.entries(MESES_CONFIG).map(([mesNum, cfg]) => {
            const num = parseInt(mesNum)
            const isAtual = num === mesAtual
            const jaPossou = num < mesAtual
            return (
              <div key={num} style={{ background: jaPossou ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)', border: `2px solid ${isAtual ? cfg.cor : 'rgba(123,79,216,0.08)'}`, borderRadius: 16, overflow: 'hidden', opacity: jaPossou ? 0.6 : 1, transition: 'box-shadow 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {/* Faixa colorida */}
                  <div style={{ width: 8, background: cfg.cor, alignSelf: 'stretch', flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 18 }}>{cfg.emoji}</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: cfg.cor }}>{cfg.campanha}</span>
                          {isAtual && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.cor, color: cfg.corTexto }}>Mês atual</span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(45,27,110,0.6)', marginBottom: 8 }}>
                          <strong style={{ color: '#2D1B6E' }}>{cfg.label}</strong> · {cfg.causa}
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(45,27,110,0.55)', margin: '0 0 12px', lineHeight: 1.6 }}>
                          💡 <strong>Pauta sugerida:</strong> {cfg.pautaExtra}
                        </p>
                        <Link href="/agentes/copy" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: cfg.cor, color: cfg.corTexto, borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: 'none', opacity: jaPossou ? 0.5 : 1 }}>
                          ✨ Gerar copy para {cfg.campanha}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ABA: DATAS COMEMORATIVAS */}
      {abaAtiva === 'datas' && (
        <>
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

          {/* Lista datas */}
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
              const mesCfg = MESES_CONFIG[d.mes]
              const dataFmt = new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
              const aberto = expandido === d.data

              return (
                <div key={d.data} onClick={() => setExpandido(aberto ? null : d.data)} style={{ background: passou ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)', border: `1px solid ${passou ? 'rgba(123,79,216,0.06)' : 'rgba(123,79,216,0.1)'}`, borderRadius: 14, overflow: 'hidden', opacity: passou ? 0.55 : 1, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                    {/* Faixa da cor do mês */}
                    <div style={{ width: 5, background: mesCfg.cor, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: passou ? 'rgba(45,27,110,0.05)' : rel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {d.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: passou ? 'rgba(45,27,110,0.4)' : '#2D1B6E' }}>{d.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: rel.bg, color: rel.color, border: `1px solid ${rel.border}` }}>{rel.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: mesCfg.corBg, color: mesCfg.cor, border: `1px solid ${mesCfg.cor}33` }}>{mesCfg.emoji} {mesCfg.campanha}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(45,27,110,0.4)', marginTop: 2 }}>{dataFmt}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
                  </div>

                  {aberto && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(123,79,216,0.08)', marginLeft: 5 }}>
                      <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>💡 Sugestão de pauta</div>
                          <p style={{ fontSize: 13, color: 'rgba(45,27,110,0.7)', lineHeight: 1.7, margin: 0 }}>{d.pauta}</p>
                        </div>
                        <div style={{ padding: '10px 14px', background: mesCfg.corBg, borderRadius: 10, border: `1px solid ${mesCfg.cor}33` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: mesCfg.cor, marginBottom: 4 }}>{mesCfg.emoji} {mesCfg.campanha} — {mesCfg.causa}</div>
                          <p style={{ fontSize: 12, color: 'rgba(45,27,110,0.6)', margin: 0, lineHeight: 1.6 }}>{mesCfg.pautaExtra}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Link href="/agentes/roteirista" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(123,79,216,0.25)' }}>
                            🎬 Gerar roteiro
                          </Link>
                          <Link href="/agentes/copy" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: mesCfg.cor, color: mesCfg.corTexto, borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                            ✍️ Gerar copy
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
