'use client'
import { useState } from 'react'
import Link from 'next/link'

const DATAS_2026 = [
  { data:'2026-04-21', label:'Tiradentes',               relevancia:'alta',    mes:4,  pauta:'Herói local, coragem política, luta por ideais. Conecte com sua trajetória de resistência.' },
  { data:'2026-04-22', label:'Dia da Terra',             relevancia:'media',   mes:4,  pauta:'Meio ambiente, saneamento, áreas verdes. Mostre sua posição sobre pauta ambiental.' },
  { data:'2026-05-01', label:'Dia do Trabalho',          relevancia:'alta',    mes:5,  pauta:'Emprego, renda, dignidade. Melhor dia para falar com trabalhadores da base.' },
  { data:'2026-05-10', label:'Dia das Mães',             relevancia:'alta',    mes:5,  pauta:'Saúde da mulher, educação, segurança. Conteúdo emocional de alto engajamento.' },
  { data:'2026-05-15', label:'Dia do Municipal',         relevancia:'alta',    mes:5,  pauta:'Gestão pública, serviços municipais, participação cidadã.' },
  { data:'2026-06-05', label:'Dia do Meio Ambiente',     relevancia:'media',   mes:6,  pauta:'Sustentabilidade, resíduos, parques. Ótimo para candidatos com pauta verde.' },
  { data:'2026-06-12', label:'Dia dos Namorados',        relevancia:'media',   mes:6,  pauta:'Conteúdo mais leve e humano. Mostre seu lado pessoal e aproxime da audiência.' },
  { data:'2026-06-13', label:'Corpus Christi',           relevancia:'media',   mes:6,  pauta:'Respeito à fé, valores da comunidade. Tom respeitoso e inclusivo.' },
  { data:'2026-06-24', label:'São João',                 relevancia:'alta',    mes:6,  pauta:'Cultura popular, tradições nordestinas. Alto engajamento, conteúdo festivo.' },
  { data:'2026-07-09', label:'Revolução Constitucional', relevancia:'alta',    mes:7,  pauta:'Democracia, São Paulo, federalismo. Forte para candidatos paulistas.' },
  { data:'2026-08-11', label:'Dia do Estudante',         relevancia:'media',   mes:8,  pauta:'Educação, juventude, oportunidades. Conecte com pauta de ensino e futuro.' },
  { data:'2026-09-07', label:'Independência do Brasil',  relevancia:'alta',    mes:9,  pauta:'Patriotismo, soberania, orgulho nacional. Use com autenticidade.' },
  { data:'2026-10-02', label:'1º Turno Eleições',        relevancia:'critica', mes:10, pauta:'DIA DA ELEIÇÃO. Mobilize eleitores, reforce o número, agradeça o apoio.' },
  { data:'2026-10-04', label:'Dia de São Francisco',     relevancia:'media',   mes:10, pauta:'Paz, meio ambiente, cuidado com o próximo. Tom reflexivo entre os dois turnos.' },
  { data:'2026-10-12', label:'Nossa Sra. Aparecida',     relevancia:'alta',    mes:10, pauta:'Fé, esperança, Brasil. Alta audiência religiosa — seja genuíno e respeitoso.' },
  { data:'2026-10-25', label:'2º Turno Eleições',        relevancia:'critica', mes:10, pauta:'DIA DA DECISÃO. Último esforço de mobilização. Convoque cada eleitor.' },
  { data:'2026-11-02', label:'Finados',                  relevancia:'media',   mes:11, pauta:'Memória, homenagens, reflexão. Tom respeitoso — evite conteúdo político pesado.' },
  { data:'2026-11-15', label:'Proclamação da República', relevancia:'alta',    mes:11, pauta:'Democracia, república, instituições. Bom para falar sobre seu papel quando eleito.' },
  { data:'2026-11-20', label:'Consciência Negra',        relevancia:'alta',    mes:11, pauta:'Igualdade, representatividade, cultura afro-brasileira. Seja autêntico.' },
  { data:'2026-12-25', label:'Natal',                    relevancia:'alta',    mes:12, pauta:'Encerramento de ano, gratidão, esperança. Conteúdo emocional de alto alcance.' },
]

const MESES_CONFIG: Record<number, { label:string; cor:string; corTxt:string; campanha:string; causa:string; pautaExtra:string }> = {
  1:  { label:'Janeiro',   cor:'#E53935', corTxt:'#fff', campanha:'Janeiro Branco',     causa:'Saúde mental',               pautaExtra:'Saúde mental, acolhimento, bem-estar da população.' },
  2:  { label:'Fevereiro', cor:'#E07B39', corTxt:'#fff', campanha:'Fevereiro Laranja',  causa:'Leucemia e linfoma',          pautaExtra:'Saúde pública, acesso a tratamento oncológico.' },
  3:  { label:'Março',     cor:'#C8A000', corTxt:'#fff', campanha:'Março Amarelo',      causa:'Endometriose',               pautaExtra:'Saúde da mulher, diagnóstico precoce, políticas públicas.' },
  4:  { label:'Abril',     cor:'#2D7DD2', corTxt:'#fff', campanha:'Abril Azul',         causa:'Autismo e inclusão',          pautaExtra:'Inclusão, acessibilidade, educação especial.' },
  5:  { label:'Maio',      cor:'#D97706', corTxt:'#fff', campanha:'Maio Amarelo',       causa:'Segurança no trânsito',       pautaExtra:'Segurança viária, infraestrutura, educação no trânsito.' },
  6:  { label:'Junho',     cor:'#9B4DCA', corTxt:'#fff', campanha:'Junho Vermelho',     causa:'Doação de sangue',           pautaExtra:'Saúde pública, hemocentros, solidariedade.' },
  7:  { label:'Julho',     cor:'#0EA472', corTxt:'#fff', campanha:'Julho Verde',        causa:'Doação de órgãos',           pautaExtra:'Saúde pública, solidariedade, políticas de transplante.' },
  8:  { label:'Agosto',    cor:'#B8860B', corTxt:'#fff', campanha:'Agosto Dourado',     causa:'Aleitamento materno',        pautaExtra:'Saúde da criança, saúde materna, primeira infância.' },
  9:  { label:'Setembro',  cor:'#178F63', corTxt:'#fff', campanha:'Setembro Verde',     causa:'Prevenção ao suicídio',      pautaExtra:'Saúde mental, prevenção ao suicídio, acolhimento social.' },
  10: { label:'Outubro',   cor:'#C62B8A', corTxt:'#fff', campanha:'Outubro Rosa',       causa:'Câncer de mama',             pautaExtra:'Saúde da mulher, prevenção, acesso ao diagnóstico.' },
  11: { label:'Novembro',  cor:'#1565C0', corTxt:'#fff', campanha:'Novembro Azul',      causa:'Câncer de próstata',         pautaExtra:'Saúde do homem, prevenção, acesso a exames gratuitos.' },
  12: { label:'Dezembro',  cor:'#DC3545', corTxt:'#fff', campanha:'Dezembro Vermelho',  causa:'HIV/AIDS e hepatites virais',pautaExtra:'Saúde pública, prevenção, combate ao preconceito.' },
}

const MESES = [4,5,6,7,8,9,10,11,12].map(n=>({num:n, label:MESES_CONFIG[n].label}))

const REL: Record<string,{label:string;cor:string;bg:string}> = {
  critica:{ label:'Eleitoral', cor:'#DC3545', bg:'rgba(220,53,69,0.08)'  },
  alta:   { label:'Alta',      cor:'#0EA472', bg:'rgba(14,164,114,0.08)' },
  media:  { label:'Média',     cor:'#7BA090', bg:'rgba(123,160,144,0.08)'},
}

const MES_ICON: Record<number,string> = {
  4:'◈',5:'◉',6:'◆',7:'◇',8:'◎',9:'●',10:'⬟',11:'◐',12:'★'
}

function getDias(s:string) {
  const h=new Date(); h.setHours(0,0,0,0)
  return Math.ceil((new Date(s+'T00:00:00').getTime()-h.getTime())/86400000)
}

export default function CalendarioPage() {
  const [mes, setMes]   = useState<number|null>(null)
  const [rel, setRel]   = useState<string|null>(null)
  const [exp, setExp]   = useState<string|null>(null)
  const [aba, setAba]   = useState<'datas'|'campanhas'>('datas')
  const mesAtual = new Date().getMonth()+1

  const proximas = DATAS_2026.filter(d=>getDias(d.data)>=0).slice(0,3)
  const filtradas = DATAS_2026.filter(d=>{
    if(mes && d.mes!==mes) return false
    if(rel && d.relevancia!==rel) return false
    return true
  })

  const chip = (active:boolean) => ({
    padding:'7px 14px', borderRadius:50, border:`1px solid ${active?'transparent':'#D4E8DC'}`,
    background:active?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',
    fontSize:12, color:active?'#fff':'#3A5F4E', cursor:'pointer',
    fontFamily:"var(--font-inter),'Inter',sans-serif", fontWeight:600 as const,
    whiteSpace:'nowrap' as const, transition:'all .12s',
  })

  return (
    <div style={{maxWidth:860,margin:'0 auto',padding:'28px 20px',fontFamily:"var(--font-inter),'Inter',sans-serif"}}>

      {/* Header */}
      <div style={{marginBottom:22}}>
        <p style={{fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}}>Planejamento</p>
        <h1 style={{fontSize:24,fontWeight:800,color:'#091710',margin:'0 0 4px',letterSpacing:'-0.02em'}}>Calendário Estratégico 2026</h1>
        <p style={{fontSize:13,color:'#7BA090',margin:0}}>Datas, campanhas de saúde e marcos eleitorais — tudo em um lugar.</p>
      </div>

      {/* Próximas datas */}
      <div style={{background:'linear-gradient(135deg,#054E39 0%,#0A7A56 100%)',borderRadius:16,padding:'18px 22px',marginBottom:22,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-40,width:180,height:180,borderRadius:'50%',background:'rgba(14,164,114,0.25)',pointerEvents:'none'}}/>
        <p style={{fontSize:10.5,color:'rgba(255,255,255,0.45)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 14px'}}>Próximas datas</p>
        <div style={{display:'flex',flexDirection:'column',gap:10,position:'relative',zIndex:1}}>
          {proximas.map(d=>{
            const dias=getDias(d.data)
            const mc=MESES_CONFIG[d.mes]
            const df=new Date(d.data+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})
            return(
              <div key={d.data} style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:14,color:mc.cor,fontWeight:700}}>{MES_ICON[d.mes]}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:'#fff'}}>{d.label}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>{df}</div>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:dias<=7?'#5DFFC0':'rgba(255,255,255,0.6)',background:dias<=7?'rgba(93,255,192,0.12)':'rgba(255,255,255,0.08)',padding:'4px 12px',borderRadius:20,whiteSpace:'nowrap'}}>
                  {dias===0?'Hoje':`${dias}d`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Abas */}
      <div style={{display:'flex',gap:6,marginBottom:22,background:'#fff',borderRadius:12,padding:5,border:'1px solid #D4E8DC'}}>
        {[{id:'datas',label:'Datas comemorativas'},{id:'campanhas',label:'Campanhas de saúde'}].map(({id,label})=>(
          <button key={id} onClick={()=>setAba(id as 'datas'|'campanhas')} style={{flex:1,padding:'10px 16px',borderRadius:9,border:'none',background:aba===id?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',color:aba===id?'#fff':'#7BA090',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"var(--font-inter),'Inter',sans-serif",transition:'all .15s'}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── ABA CAMPANHAS ── */}
      {aba==='campanhas' && (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <p style={{fontSize:13,color:'#7BA090',margin:'0 0 10px',lineHeight:1.6}}>
            Cada mês tem uma campanha de conscientização em saúde. Use essas datas para mostrar seu lado humano e conectar pautas sociais à sua candidatura.
          </p>
          {Object.entries(MESES_CONFIG).map(([mesNum,cfg])=>{
            const num=parseInt(mesNum)
            const isAtual=num===mesAtual
            const passou=num<mesAtual
            return(
              <div key={num} style={{background:passou?'rgba(255,255,255,0.5)':'#fff',border:`1.5px solid ${isAtual?cfg.cor:'#D4E8DC'}`,borderRadius:14,overflow:'hidden',opacity:passou?.65:1}}>
                <div style={{display:'flex'}}>
                  <div style={{width:5,background:cfg.cor,flexShrink:0}}/>
                  <div style={{flex:1,padding:'14px 18px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                      <div style={{width:28,height:28,borderRadius:8,background:`${cfg.cor}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:cfg.cor}}>{num}</div>
                      <span style={{fontSize:14,fontWeight:800,color:cfg.cor}}>{cfg.campanha}</span>
                      {isAtual&&<span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:20,background:cfg.cor,color:'#fff'}}>Mês atual</span>}
                    </div>
                    <div style={{fontSize:13,color:'#3A5F4E',marginBottom:6,fontWeight:500}}>{cfg.causa}</div>
                    <p style={{fontSize:12,color:'#7BA090',margin:'0 0 12px',lineHeight:1.6}}>Pauta sugerida: {cfg.pautaExtra}</p>
                    <Link href="/agentes/copy" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:cfg.cor,color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none'}}>
                      Gerar copy para {cfg.campanha} →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── ABA DATAS ── */}
      {aba==='datas' && (
        <>
          {/* Filtros */}
          <div style={{marginBottom:14}}>
            <p style={{fontSize:10.5,color:'#7BA090',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 8px'}}>Relevância</p>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {[{val:null,label:'Todas'},{val:'critica',label:'Eleitoral'},{val:'alta',label:'Alta'},{val:'media',label:'Média'}].map(({val,label})=>(
                <button key={label} onClick={()=>setRel(val)} style={chip(rel===val)}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:22}}>
            <p style={{fontSize:10.5,color:'#7BA090',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 8px'}}>Mês</p>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              <button onClick={()=>setMes(null)} style={chip(mes===null)}>Todos</button>
              {MESES.map(({num,label})=><button key={num} onClick={()=>setMes(num===mes?null:num)} style={chip(mes===num)}>{label}</button>)}
            </div>
          </div>

          {/* Lista */}
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {filtradas.length===0&&(
              <div style={{textAlign:'center',padding:'44px',background:'#fff',borderRadius:14,border:'1px solid #D4E8DC',color:'#7BA090',fontSize:13}}>
                Nenhuma data para este filtro.
              </div>
            )}
            {filtradas.map(d=>{
              const dias=getDias(d.data)
              const passou=dias<0
              const rc=REL[d.relevancia]
              const mc=MESES_CONFIG[d.mes]
              const df=new Date(d.data+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})
              const aberto=exp===d.data
              const isCrit=d.relevancia==='critica'
              return(
                <div key={d.data} onClick={()=>setExp(aberto?null:d.data)}
                  style={{background:passou?'rgba(255,255,255,0.5)':'#fff',border:`1px solid ${isCrit?'rgba(220,53,69,0.25)':'#D4E8DC'}`,borderRadius:13,overflow:'hidden',opacity:passou?.6:1,cursor:'pointer'}}>
                  <div style={{display:'flex'}}>
                    <div style={{width:4,background:mc.cor,flexShrink:0}}/>
                    <div style={{flex:1,display:'flex',alignItems:'center',gap:12,padding:'12px 16px'}}>
                      {/* Data badge */}
                      <div style={{width:42,textAlign:'center',flexShrink:0}}>
                        <div style={{fontSize:18,fontWeight:800,color:isCrit?'#DC3545':mc.cor,lineHeight:1}}>{new Date(d.data+'T00:00:00').getDate()}</div>
                        <div style={{fontSize:9,color:'#A8C4B8',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600}}>{new Date(d.data+'T00:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap',marginBottom:3}}>
                          <span style={{fontSize:14,fontWeight:700,color:passou?'#A8C4B8':isCrit?'#DC3545':'#091710'}}>{d.label}</span>
                          <span style={{fontSize:10.5,fontWeight:600,padding:'2px 7px',borderRadius:20,background:rc.bg,color:rc.cor}}>{rc.label}</span>
                          <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,background:`${mc.cor}18`,color:mc.cor}}>{mc.campanha}</span>
                        </div>
                        <div style={{fontSize:11.5,color:'#A8C4B8'}}>{df}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        {!passou&&(
                          <span style={{fontSize:11.5,fontWeight:700,padding:'4px 11px',borderRadius:20,background:dias<=7?'rgba(220,53,69,0.08)':dias<=30?'rgba(14,164,114,0.08)':'rgba(123,160,144,0.08)',color:dias<=7?'#DC3545':dias<=30?'#0EA472':'#7BA090'}}>
                            {dias===0?'Hoje':`${dias}d`}
                          </span>
                        )}
                        {passou&&<span style={{fontSize:11,color:'#A8C4B8',fontWeight:500}}>Passou</span>}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8C4B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:aberto?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expandido */}
                  {aberto&&(
                    <div style={{padding:'14px 16px 16px',borderTop:'1px solid #E6F3EB',marginLeft:4,background:'#FAFCFB'}}>
                      <div style={{marginBottom:12}}>
                        <p style={{fontSize:11,fontWeight:700,color:'#7BA090',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 6px'}}>Sugestão de pauta</p>
                        <p style={{fontSize:13.5,color:'#3A5F4E',lineHeight:1.7,margin:0}}>{d.pauta}</p>
                      </div>
                      <div style={{padding:'10px 14px',background:`${mc.cor}10`,borderRadius:10,border:`1px solid ${mc.cor}25`,marginBottom:14}}>
                        <p style={{fontSize:11,fontWeight:700,color:mc.cor,margin:'0 0 3px'}}>{mc.campanha} — {mc.causa}</p>
                        <p style={{fontSize:12,color:'#7BA090',margin:0,lineHeight:1.6}}>{mc.pautaExtra}</p>
                      </div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        <Link href="/agentes/roteirista" onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 12px rgba(14,164,114,0.25)'}}>
                          Gerar roteiro →
                        </Link>
                        <Link href="/agentes/copy" onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',background:'transparent',color:'#0EA472',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',border:'1.5px solid #0EA472'}}>
                          Gerar copy
                        </Link>
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
