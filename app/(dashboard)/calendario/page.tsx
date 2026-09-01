'use client'
import { useState } from 'react'
import Link from 'next/link'

const EVENTS: Record<string, { label: string; relevancia: 'critica'|'alta'|'media'; pauta: string; mesLabel: string; mesCor: string }[]> = {
  '2026-04-21': [{ label:'Tiradentes', relevancia:'alta', pauta:'Herói local, coragem política. Conecte com sua trajetória de resistência.', mesLabel:'Abril Azul', mesCor:'#2D7DD2' }],
  '2026-04-22': [{ label:'Dia da Terra', relevancia:'media', pauta:'Meio ambiente, saneamento, áreas verdes. Mostre sua posição sobre a pauta ambiental.', mesLabel:'Abril Azul', mesCor:'#2D7DD2' }],
  '2026-05-01': [{ label:'Dia do Trabalho', relevancia:'alta', pauta:'Emprego, renda, dignidade. Melhor dia para falar com trabalhadores da sua base.', mesLabel:'Maio Amarelo', mesCor:'#D97706' }],
  '2026-05-10': [{ label:'Dia das Mães', relevancia:'alta', pauta:'Saúde da mulher, educação, segurança. Conteúdo emocional de alto engajamento.', mesLabel:'Maio Amarelo', mesCor:'#D97706' }],
  '2026-05-15': [{ label:'Dia do Municipal', relevancia:'alta', pauta:'Gestão pública, serviços municipais, participação cidadã.', mesLabel:'Maio Amarelo', mesCor:'#D97706' }],
  '2026-06-05': [{ label:'Dia do Meio Ambiente', relevancia:'media', pauta:'Sustentabilidade, resíduos, parques. Para candidatos com pauta verde.', mesLabel:'Junho Vermelho', mesCor:'#9B4DCA' }],
  '2026-06-12': [{ label:'Dia dos Namorados', relevancia:'media', pauta:'Conteúdo leve e humano. Mostre seu lado pessoal.', mesLabel:'Junho Vermelho', mesCor:'#9B4DCA' }],
  '2026-06-24': [{ label:'São João', relevancia:'alta', pauta:'Cultura popular, nordeste, tradições. Alto engajamento, conteúdo festivo.', mesLabel:'Junho Vermelho', mesCor:'#9B4DCA' }],
  '2026-07-09': [{ label:'Revolução Constitucional', relevancia:'alta', pauta:'Democracia, São Paulo, federalismo. Forte para candidatos paulistas.', mesLabel:'Julho Verde', mesCor:'#0EA472' }],
  '2026-08-11': [{ label:'Dia do Estudante', relevancia:'media', pauta:'Educação, juventude, oportunidades. Conecte com pauta de ensino e futuro.', mesLabel:'Agosto Dourado', mesCor:'#B8860B' }],
  '2026-09-07': [{ label:'Independência do Brasil', relevancia:'alta', pauta:'Patriotismo, soberania. Use com autenticidade — muito engajamento.', mesLabel:'Setembro Verde', mesCor:'#0EA472' }],
  '2026-10-02': [{ label:'1º Turno Eleições', relevancia:'critica', pauta:'DIA DA ELEIÇÃO. Mobilize eleitores, reforce o número do candidato, agradeça o apoio.', mesLabel:'Outubro Rosa', mesCor:'#C62B8A' }],
  '2026-10-04': [{ label:'Dia de São Francisco', relevancia:'media', pauta:'Paz e meio ambiente. Tom reflexivo entre os dois turnos.', mesLabel:'Outubro Rosa', mesCor:'#C62B8A' }],
  '2026-10-12': [{ label:'Nossa Sra. Aparecida', relevancia:'alta', pauta:'Fé, esperança. Alta audiência religiosa — seja genuíno e respeitoso.', mesLabel:'Outubro Rosa', mesCor:'#C62B8A' }],
  '2026-10-25': [{ label:'2º Turno Eleições', relevancia:'critica', pauta:'DIA DA DECISÃO. Último esforço de mobilização. Convoque cada eleitor da sua base.', mesLabel:'Outubro Rosa', mesCor:'#C62B8A' }],
  '2026-11-02': [{ label:'Finados', relevancia:'media', pauta:'Memória e homenagens. Tom respeitoso — evite conteúdo político pesado.', mesLabel:'Novembro Azul', mesCor:'#1565C0' }],
  '2026-11-15': [{ label:'Proclamação da República', relevancia:'alta', pauta:'Democracia e instituições. Fale sobre seu papel quando eleito.', mesLabel:'Novembro Azul', mesCor:'#1565C0' }],
  '2026-11-20': [{ label:'Consciência Negra', relevancia:'alta', pauta:'Igualdade, representatividade, cultura afro-brasileira. Seja autêntico.', mesLabel:'Novembro Azul', mesCor:'#1565C0' }],
  '2026-12-25': [{ label:'Natal', relevancia:'alta', pauta:'Gratidão e esperança. Conteúdo emocional de alto alcance para encerrar o ano.', mesLabel:'Dezembro Vermelho', mesCor:'#DC3545' }],
}

const REL_COR: Record<string, string> = { critica:'#DC3545', alta:'#0EA472', media:'#D97706' }
const REL_BG:  Record<string, string> = { critica:'rgba(220,53,69,0.1)', alta:'rgba(14,164,114,0.1)', media:'rgba(217,119,6,0.1)' }
const REL_LABEL: Record<string, string> = { critica:'Eleitoral', alta:'Alta', media:'Média' }

const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function getDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
function pad(n: number) { return String(n).padStart(2,'0') }
function today() { return new Date().toISOString().slice(0,10) }

export default function CalendarioPage() {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [sel,   setSel]   = useState<string|null>(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const daysCount  = getDays(year, month)
  const startDay   = getFirstWeekday(year, month)
  const todayStr   = today()
  const selEvents  = sel ? (EVENTS[sel] ?? []) : []

  // All upcoming events for sidebar
  const upcoming = Object.entries(EVENTS)
    .filter(([d]) => d >= todayStr)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 8)

  return (
    <div style={{ maxWidth:1060, margin:'0 auto', padding:'26px 20px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <style>{`
        .cal-day { border-radius:10px; cursor:pointer; transition:background .12s; min-height:72px; padding:6px; position:relative; }
        .cal-day:hover { background:rgba(14,164,114,0.06); }
        .cal-day.today { background:rgba(14,164,114,0.08); }
        .cal-day.selected { background:rgba(14,164,114,0.14); box-shadow:inset 0 0 0 2px #0EA472; }
        .cal-day.past { opacity:.45; }
        .cal-layout { display:grid; grid-template-columns:1fr; gap:20px; }
        @media(min-width:800px){ .cal-layout { grid-template-columns:1fr 280px; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:22 }}>
        <p style={{ fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700 }}>Planejamento</p>
        <h1 style={{ fontSize:24,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.02em' }}>Calendário Estratégico 2026</h1>
      </div>

      <div className="cal-layout">
        {/* ── CALENDÁRIO GRID ── */}
        <div style={{ background:'#fff',borderRadius:16,border:'1px solid #D4E8DC',overflow:'hidden' }}>
          {/* Nav header */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #E6F3EB' }}>
            <button onClick={prevMonth} style={{ width:34,height:34,borderRadius:9,border:'1px solid #D4E8DC',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#3A5F4E' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:17,fontWeight:800,color:'#091710',letterSpacing:'-0.02em' }}>{MONTHS[month]}</div>
              <div style={{ fontSize:12,color:'#7BA090',fontWeight:500 }}>{year}</div>
            </div>
            <button onClick={nextMonth} style={{ width:34,height:34,borderRadius:9,border:'1px solid #D4E8DC',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#3A5F4E' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:'10px 12px 4px' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ textAlign:'center',fontSize:11,fontWeight:700,color:'#A8C4B8',padding:'4px 0',letterSpacing:'0.02em' }}>{w}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:'2px 12px 14px' }}>
            {/* Empty cells */}
            {Array.from({length:startDay}).map((_,i) => <div key={`e${i}`}/>)}
            {/* Day cells */}
            {Array.from({length:daysCount}).map((_,i) => {
              const d = i + 1
              const dateStr = `${year}-${pad(month+1)}-${pad(d)}`
              const evs = EVENTS[dateStr] ?? []
              const isToday = dateStr === todayStr
              const isSel   = dateStr === sel
              const isPast  = dateStr < todayStr
              const hasCrit = evs.some(e => e.relevancia === 'critica')
              const hasAlta = evs.some(e => e.relevancia === 'alta')
              const hasMed  = evs.some(e => e.relevancia === 'media')
              const cls = `cal-day${isToday?' today':''}${isSel?' selected':''}${isPast?' past':''}`
              return (
                <div key={d} className={cls} onClick={() => setSel(isSel ? null : dateStr)}>
                  <div style={{ fontSize:13,fontWeight:isToday?800:500,color:isToday?'#0EA472':hasCrit?'#DC3545':'#091710',marginBottom:4 }}>{d}</div>
                  {evs.length > 0 && (
                    <div style={{ display:'flex',flexWrap:'wrap',gap:2 }}>
                      {hasCrit && <div style={{ width:7,height:7,borderRadius:'50%',background:'#DC3545' }}/>}
                      {hasAlta && <div style={{ width:7,height:7,borderRadius:'50%',background:'#0EA472' }}/>}
                      {hasMed  && <div style={{ width:7,height:7,borderRadius:'50%',background:'#D97706' }}/>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legenda */}
          <div style={{ display:'flex',gap:16,padding:'10px 20px 16px',borderTop:'1px solid #E6F3EB' }}>
            {[['#DC3545','Eleitoral'],['#0EA472','Alta'],['#D97706','Média']].map(([cor,label]) => (
              <div key={label} style={{ display:'flex',alignItems:'center',gap:6 }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:cor }}/>
                <span style={{ fontSize:11.5,color:'#7BA090',fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAINEL LATERAL ── */}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {/* Evento selecionado */}
          {sel && selEvents.length > 0 && (
            <div style={{ background:'#fff',border:'1px solid #D4E8DC',borderRadius:14,overflow:'hidden' }}>
              <div style={{ height:3,background:`linear-gradient(90deg,${REL_COR[selEvents[0].relevancia]},${selEvents[0].mesCor})` }}/>
              <div style={{ padding:'16px' }}>
                <div style={{ fontSize:11,color:'#7BA090',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>
                  {new Date(sel+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}
                </div>
                {selEvents.map((ev,i) => (
                  <div key={i} style={{ marginBottom:i<selEvents.length-1?14:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:8 }}>
                      <h3 style={{ fontSize:15,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.01em' }}>{ev.label}</h3>
                      <span style={{ fontSize:10.5,fontWeight:700,padding:'2px 7px',borderRadius:20,background:REL_BG[ev.relevancia],color:REL_COR[ev.relevancia] }}>{REL_LABEL[ev.relevancia]}</span>
                    </div>
                    <p style={{ fontSize:13,color:'#3A5F4E',lineHeight:1.7,margin:'0 0 12px' }}>{ev.pauta}</p>
                    <div style={{ padding:'8px 12px',background:`${ev.mesCor}10`,borderRadius:9,border:`1px solid ${ev.mesCor}20`,marginBottom:12,fontSize:11.5,color:ev.mesCor,fontWeight:600 }}>
                      {ev.mesLabel}
                    </div>
                    <div style={{ display:'flex',gap:7 }}>
                      <Link href="/agentes/roteirista" style={{ flex:1,textAlign:'center',padding:'9px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 10px rgba(14,164,114,0.25)' }}>
                        Roteiro
                      </Link>
                      <Link href="/agentes/copy" style={{ flex:1,textAlign:'center',padding:'9px',background:'transparent',color:'#0EA472',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',border:'1.5px solid #0EA472' }}>
                        Copy
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos eventos */}
          <div style={{ background:'#fff',border:'1px solid #D4E8DC',borderRadius:14,padding:'14px' }}>
            <p style={{ fontSize:12,fontWeight:700,color:'#091710',margin:'0 0 12px',letterSpacing:'-0.01em' }}>Próximos eventos</p>
            <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
              {upcoming.map(([dateStr, evs]) => {
                const ev = evs[0]
                const d = new Date(dateStr+'T12:00:00')
                const dias = Math.ceil((new Date(dateStr+'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
                const isCrit = ev.relevancia === 'critica'
                return (
                  <div key={dateStr} onClick={() => { setSel(dateStr); setYear(d.getFullYear()); setMonth(d.getMonth()) }}
                    style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:9,background:'#FAFCFB',border:'1px solid #E6F3EB',cursor:'pointer' }}>
                    <div style={{ width:34,textAlign:'center',flexShrink:0 }}>
                      <div style={{ fontSize:16,fontWeight:800,color:isCrit?'#DC3545':'#0EA472',lineHeight:1 }}>{d.getDate()}</div>
                      <div style={{ fontSize:9,color:'#A8C4B8',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600 }}>{d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</div>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12.5,fontWeight:600,color:isCrit?'#DC3545':'#091710',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ev.label}</div>
                    </div>
                    <span style={{ fontSize:11,fontWeight:700,color:REL_COR[ev.relevancia],background:REL_BG[ev.relevancia],padding:'2px 8px',borderRadius:20,flexShrink:0 }}>{dias}d</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
