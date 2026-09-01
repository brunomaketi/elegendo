'use client'
import { useState } from 'react'
import Link from 'next/link'

// ── Tipos ──────────────────────────────────────────────────────────────
type Pilar = 'humanizacao'|'pauta'|'mobilizacao'|'educativo'|'eleitoral'
type Tipo  = 'reel'|'carrossel'|'post'|'stories'|'ao_vivo'

interface Sugestao {
  tipo: Tipo; pilar: Pilar; titulo: string
  descricao: string; gancho: string
  plataformas: string[]; agente: 'roteirista'|'copy'|'estrategista'
}
interface Semana {
  inicio: string; fim: string; tema: string
  fase: string; objetivo: string; urgencia: 'normal'|'alta'|'critica'
  sugestoes: Sugestao[]
}

// ── Dados estratégicos ──────────────────────────────────────────────────
const SEMANAS: Semana[] = [
  {
    inicio:'2026-08-31', fim:'2026-09-06',
    tema:'Construção de Imagem', fase:'Reconhecimento',
    objetivo:'Aumente o reconhecimento do seu nome. Mostre quem você é para eleitores que ainda não te conhecem — autenticidade vence nessa fase.',
    urgencia:'normal',
    sugestoes:[
      { tipo:'reel', pilar:'humanizacao', titulo:'"3 coisas que você não sabe sobre mim"',
        descricao:'Apresentação pessoal autêntica. Funciona bem com quem ainda não te conhece. Use gestos, olhe para a câmera, fale do coração.',
        gancho:'Você talvez já viu meu nome em algum lugar... mas ainda não sabe por que eu mereço o seu voto. Então deixa eu te contar.',
        plataformas:['Instagram','TikTok'], agente:'roteirista' },
      { tipo:'carrossel', pilar:'pauta', titulo:'Minha principal proposta para [cidade]',
        descricao:'Slides com dados reais do problema e suas soluções concretas. Use números locais. Gera salvamentos e compartilhamentos.',
        gancho:'Em [cidade], X famílias ainda sofrem com [problema]. Isso vai mudar quando eu for eleito. Veja o plano completo:',
        plataformas:['Instagram','Facebook'], agente:'copy' },
      { tipo:'post', pilar:'humanizacao', titulo:'Por que você decidiu ser candidato',
        descricao:'A história de origem da sua candidatura. Alta conexão emocional com eleitores indecisos. Poste com foto espontânea.',
        gancho:'Tinha uma escolha: ficar assistindo ou fazer algo. No dia que meu filho me perguntou "pai, por que a nossa rua não tem calçada?", eu decidi.',
        plataformas:['Instagram','Facebook','WhatsApp'], agente:'roteirista' },
    ]
  },
  {
    inicio:'2026-09-07', fim:'2026-09-13',
    tema:'Independência + Propostas', fase:'Reconhecimento',
    objetivo:'Use o 7 de Setembro para conectar sua candidatura com o sentimento de orgulho nacional. Depois, mergulhe nas suas propostas principais.',
    urgencia:'alta',
    sugestoes:[
      { tipo:'reel', pilar:'eleitoral', titulo:'Independência: o que você faz por [cidade]',
        descricao:'Conecte patriotismo com sua candidatura local. "Independência começa na sua rua." Alto engajamento garantido no feriado.',
        gancho:'Hoje comemorei 204 anos de independência. Mas em [bairro], as pessoas ainda esperam independência de pobreza, de violência, de falta de oportunidade.',
        plataformas:['Instagram','TikTok','Facebook'], agente:'roteirista' },
      { tipo:'carrossel', pilar:'pauta', titulo:'"Meus 5 compromissos para [cidade]"',
        descricao:'Listagem clara das 5 propostas principais. Use dados locais. Ideal para ser salvo e compartilhado. Fixe no perfil.',
        gancho:'Você tem o direito de saber exatamente o que eu vou fazer se for eleito. Sem promessa vaga. 5 compromissos concretos:',
        plataformas:['Instagram','Facebook'], agente:'copy' },
      { tipo:'stories', pilar:'humanizacao', titulo:'Bastidores da campanha',
        descricao:'Mostre o dia a dia real: reuniões de equipe, visita a bairro, estudo de proposta. Autenticidade gera identificação.',
        gancho:'Todo dia que passa sem ação é um dia perdido. Veja o que aconteceu hoje na campanha:',
        plataformas:['Instagram','WhatsApp'], agente:'copy' },
    ]
  },
  {
    inicio:'2026-09-14', fim:'2026-09-20',
    tema:'Proposta Central + Dados', fase:'Propostas',
    objetivo:'Aprofunde suas propostas principais com dados reais. Mostre que você conhece os problemas do município e tem soluções concretas.',
    urgencia:'normal',
    sugestoes:[
      { tipo:'reel', pilar:'educativo', titulo:'"Por que [problema de cidade] ainda não foi resolvido"',
        descricao:'Educativo explicando um problema real com contexto político. Posiciona você como especialista. Salva muito.',
        gancho:'Esse problema existe há X anos. Todo político promete resolver. Mas ninguém te explicou por que não consegue. Eu vou explicar.',
        plataformas:['Instagram','TikTok'], agente:'roteirista' },
      { tipo:'carrossel', pilar:'pauta', titulo:'Comparativo: antes x depois da minha proposta',
        descricao:'Mostre como será [bairro/serviço/problema] com e sem a sua proposta. Visual impactante, dados concretos.',
        gancho:'Imagina [cidade] daqui 2 anos se a gente fizer isso. Não é sonho — é projeto aprovado e com recurso.',
        plataformas:['Instagram','Facebook'], agente:'copy' },
      { tipo:'ao_vivo', pilar:'mobilizacao', titulo:'Live: tire suas dúvidas sobre minha proposta',
        descricao:'Live de 30-40 min respondendo perguntas ao vivo. Demonstra transparência e gera proximidade real.',
        gancho:'Você tem dúvidas sobre o que eu pretendo fazer? Quinta às 20h você me pergunta e eu respondo tudo, ao vivo.',
        plataformas:['Instagram','Facebook'], agente:'copy' },
    ]
  },
  {
    inicio:'2026-09-21', fim:'2026-09-27',
    tema:'Prova Social + Depoimentos', fase:'Prova Social',
    objetivo:'Quem apoia você? Mostre rostos reais, histórias reais. Eleitores decidem por pessoas, não por programas. Essa semana é sobre confiança.',
    urgencia:'alta',
    sugestoes:[
      { tipo:'reel', pilar:'mobilizacao', titulo:'Depoimento: morador fala sobre seu trabalho',
        descricao:'Gravar morador da base falando por que apoia. Autêntico, sem ensaio. Extremamente efetivo para indecisos.',
        gancho:'Não me deixa falar — deixa quem me conhece falar por mim.',
        plataformas:['Instagram','TikTok','WhatsApp'], agente:'roteirista' },
      { tipo:'carrossel', pilar:'humanizacao', titulo:'"Quem está junto nessa campanha"',
        descricao:'Mostre sua equipe, apoiadores, lideranças comunitárias. Humaniza a campanha e mostra força de base.',
        gancho:'Uma candidatura não é de uma pessoa — é de um time. Deixa eu te apresentar quem acredita nessa mudança:',
        plataformas:['Instagram','Facebook'], agente:'copy' },
      { tipo:'stories', pilar:'eleitoral', titulo:'Contagem regressiva: X dias para mudar [cidade]',
        descricao:'Stories diários de contagem regressiva. Crie urgência sem desespero. Use enquetes e caixas de perguntas.',
        gancho:'X dias. É tudo que falta para a sua chance de mudar isso. Você já sabe em quem vai votar?',
        plataformas:['Instagram'], agente:'copy' },
    ]
  },
  {
    inicio:'2026-09-28', fim:'2026-10-04',
    tema:'SPRINT FINAL — Mobilização Máxima', fase:'Mobilização',
    objetivo:'SEMANA DA ELEIÇÃO. Todo conteúdo agora é sobre mobilização. Lembre o número do candidato. Convoque. Agradeça. Energize a base.',
    urgencia:'critica',
    sugestoes:[
      { tipo:'reel', pilar:'eleitoral', titulo:'"Por que VOCÊ precisa votar em mim no dia 2"',
        descricao:'CTA direto, urgente, pessoal. Olhe para a câmera, diga o número, explique o que está em jogo. Seu melhor vídeo.',
        gancho:'Você tem 72 horas para decidir o futuro de [cidade]. Eu preciso do seu voto. Aqui está por quê:',
        plataformas:['Instagram','TikTok','WhatsApp'], agente:'roteirista' },
      { tipo:'post', pilar:'eleitoral', titulo:'Seu número: [NÚMERO] — grave na cabeça',
        descricao:'Post visual com o número bem grande, fácil de salvar e compartilhar. Compartilhe em todos os grupos de WhatsApp.',
        gancho:'No dia 2 de outubro, você entra na cabine e digita [NÚMERO]. Esse é o número que vai mudar [cidade].',
        plataformas:['WhatsApp','Instagram','Facebook'], agente:'copy' },
      { tipo:'ao_vivo', pilar:'mobilizacao', titulo:'Véspera: live de energia + agradecimento',
        descricao:'Live no dia 1/out à noite. Agradeça a campanha, relembre propostas, energize para o dia seguinte.',
        gancho:'Amanhã é o dia. Depois de meses de luta, chegou o momento. Entra ao vivo comigo essa noite.',
        plataformas:['Instagram','Facebook'], agente:'roteirista' },
    ]
  },
  {
    inicio:'2026-10-05', fim:'2026-10-11',
    tema:'Pós-Primeiro Turno', fase:'Segundo Turno',
    objetivo:'Se você foi para o segundo turno: celebre, agradeça e já inicie a campanha para o 2º turno. Peça apoio de quem não votou em você no 1º.',
    urgencia:'alta',
    sugestoes:[
      { tipo:'reel', pilar:'eleitoral', titulo:'Agradecimento + convocação para o 2º turno',
        descricao:'Agradeça os votos recebidos, apresente o resultado e já convoque para o 2º turno. Tom de gratidão e energia.',
        gancho:'Você fez acontecer. Agora preciso de você mais uma vez. No dia 25 a gente finaliza isso junto.',
        plataformas:['Instagram','TikTok','WhatsApp'], agente:'roteirista' },
      { tipo:'carrossel', pilar:'mobilizacao', titulo:'Por que quem votou em outro precisa me apoiar agora',
        descricao:'Argumento respeitoso e propositivo para conquistar eleitores do adversário que não foi ao 2º turno.',
        gancho:'Talvez você não tenha votado em mim no primeiro turno. Faz sentido. Mas agora a escolha mudou. Deixa eu explicar:',
        plataformas:['Instagram','Facebook'], agente:'copy' },
      { tipo:'post', pilar:'humanizacao', titulo:'Nos bastidores depois do resultado',
        descricao:'Foto/vídeo autêntico da reação da equipe ao resultado. Mostra humanidade e energia genuína.',
        gancho:'Esse foi o momento exato que soubemos que vamos para o segundo turno. Não consegui segurar a emoção.',
        plataformas:['Instagram','Facebook'], agente:'copy' },
    ]
  },
  {
    inicio:'2026-10-12', fim:'2026-10-18',
    tema:'Campanha do Segundo Turno', fase:'Segundo Turno',
    objetivo:'Amplie sua coalizão. Fale com eleitores que ainda estão em dúvida. Reforce suas propostas mais populares. Diferencie-se do adversário.',
    urgencia:'alta',
    sugestoes:[
      { tipo:'reel', pilar:'pauta', titulo:'A diferença entre mim e meu adversário',
        descricao:'Comparação clara e respeitosa. Foque em propostas e histórico, não em ataques pessoais. Seja o candidato maduro.',
        gancho:'Você tem dois caminhos no dia 25. Deixa eu te mostrar a diferença com transparência e sem ataque.',
        plataformas:['Instagram','TikTok'], agente:'roteirista' },
      { tipo:'ao_vivo', pilar:'mobilizacao', titulo:'Debate com apoiadores: tire dúvidas ao vivo',
        descricao:'Live mais longa e técnica. Responda perguntas sobre propostas específicas. Mostra preparo e seriedade.',
        gancho:'Tenho 7 dias para te convencer. Estou ao vivo. Me faz as perguntas mais difíceis.',
        plataformas:['Instagram','YouTube'], agente:'estrategista' },
      { tipo:'carrossel', pilar:'eleitoral', titulo:'"Por que Nossa Sra. Aparecida e o 2º turno"',
        descricao:'Use o feriado de 12/out com sensibilidade. Tom de fé, esperança e compromisso com a comunidade.',
        gancho:'No dia de Nossa Sra. Aparecida, faço uma promessa: se eleito, [compromisso específico].',
        plataformas:['Instagram','Facebook','WhatsApp'], agente:'copy' },
    ]
  },
  {
    inicio:'2026-10-19', fim:'2026-10-25',
    tema:'DECISÃO FINAL — Última Semana', fase:'Final',
    objetivo:'SEMANA DA DECISÃO. Toda energia para mobilização. Convoque eleitores, peça para compartilhar, organize transporte para as urnas.',
    urgencia:'critica',
    sugestoes:[
      { tipo:'reel', pilar:'eleitoral', titulo:'Último vídeo da campanha — seu legado',
        descricao:'O vídeo mais importante da campanha. Emotivo, propositivo, direto. Olhe para a câmera e fale de coração.',
        gancho:'Esse é o último vídeo antes da eleição. Quero te dizer uma coisa importante — e olhando nos seus olhos.',
        plataformas:['Instagram','TikTok','WhatsApp'], agente:'roteirista' },
      { tipo:'post', pilar:'eleitoral', titulo:'Número: [NÚMERO] — Dia 25, não esqueça',
        descricao:'Último lembrete do número. Visual impactante, simples, direto. Peça para ser compartilhado.',
        gancho:'Domingo, dia 25. Uma cabine, um teclado e [NÚMERO]. É só isso que preciso de você.',
        plataformas:['WhatsApp','Instagram','Facebook'], agente:'copy' },
      { tipo:'stories', pilar:'mobilizacao', titulo:'Organize o transporte da sua base',
        descricao:'Convoque voluntários para levar eleitores às urnas. Stories com link de formulário ou número de WhatsApp.',
        gancho:'Não tem transporte? Fala comigo. A gente garante que você chega na urna. É sério.',
        plataformas:['Instagram','WhatsApp'], agente:'copy' },
    ]
  },
]

// ── Eventos do calendário ───────────────────────────────────────────────
const EVENTOS: Record<string,{label:string;rel:'critica'|'alta'|'media';pauta:string;mesCor:string}> = {
  '2026-09-07':{ label:'Independência do Brasil', rel:'alta', pauta:'Conecte patriotismo com sua candidatura local. Feriado de alto engajamento.', mesCor:'#0EA472' },
  '2026-10-02':{ label:'1º Turno Eleições',       rel:'critica', pauta:'DIA DA ELEIÇÃO. Mobilize, convoque, agradeça. Reforce o número do candidato.', mesCor:'#DC3545' },
  '2026-10-04':{ label:'Dia de São Francisco',    rel:'media', pauta:'Tom reflexivo. Entre os dois turnos, conteúdo de paz e esperança.', mesCor:'#C62B8A' },
  '2026-10-12':{ label:'Nossa Sra. Aparecida',    rel:'alta', pauta:'Fé, esperança e compromisso. Muito engajamento em todo o Brasil.', mesCor:'#C62B8A' },
  '2026-10-25':{ label:'2º Turno Eleições',       rel:'critica', pauta:'DIA DA DECISÃO. Convoque cada eleitor. Último esforço total de mobilização.', mesCor:'#DC3545' },
  '2026-11-02':{ label:'Finados',                 rel:'media', pauta:'Tom de respeito e memória. Poste com cuidado — evite política pesada.', mesCor:'#1565C0' },
  '2026-11-15':{ label:'Proclamação da República',rel:'alta', pauta:'Democracia e instituições. Fale sobre o papel do mandato.', mesCor:'#1565C0' },
  '2026-11-20':{ label:'Consciência Negra',       rel:'alta', pauta:'Igualdade e representatividade. Conteúdo essencial — seja autêntico.', mesCor:'#1565C0' },
  '2026-12-25':{ label:'Natal',                   rel:'alta', pauta:'Encerramento de ano. Gratidão, esperança, balanço.', mesCor:'#DC3545' },
}

const TIPO_CONFIG: Record<Tipo,{label:string;cor:string;bg:string}> = {
  reel:      { label:'Reel',      cor:'#DC3545', bg:'rgba(220,53,69,0.08)'  },
  carrossel: { label:'Carrossel', cor:'#2D7DD2', bg:'rgba(45,125,210,0.08)' },
  post:      { label:'Post',      cor:'#0EA472', bg:'rgba(14,164,114,0.08)' },
  stories:   { label:'Stories',   cor:'#D97706', bg:'rgba(217,119,6,0.08)'  },
  ao_vivo:   { label:'Ao Vivo',   cor:'#7B4FD8', bg:'rgba(123,79,216,0.08)' },
}
const PILAR_CONFIG: Record<Pilar,{label:string;cor:string}> = {
  humanizacao: { label:'Humanização', cor:'#D97706' },
  pauta:       { label:'Pauta',       cor:'#2D7DD2' },
  mobilizacao: { label:'Mobilização', cor:'#DC3545' },
  educativo:   { label:'Educativo',   cor:'#7B4FD8' },
  eleitoral:   { label:'Eleitoral',   cor:'#0EA472' },
}
const AGENTE_LINK: Record<string,string> = { roteirista:'/agentes/roteirista', copy:'/agentes/copy', estrategista:'/agentes/estrategista' }
const AGENTE_LABEL: Record<string,string> = { roteirista:'Roteirista', copy:'Copy Político', estrategista:'Estrategista' }
const FASE_PROGRESS: Record<string,number> = { Reconhecimento:20, Propostas:40, 'Prova Social':60, Mobilização:80, 'Segundo Turno':85, Final:100 }
const URGENCIA_CONFIG = { normal:{cor:'#7BA090',bg:'rgba(123,160,144,0.1)',label:'Normal'}, alta:{cor:'#D97706',bg:'rgba(217,119,6,0.1)',label:'Alta'}, critica:{cor:'#DC3545',bg:'rgba(220,53,69,0.1)',label:'Crítica'} }

const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function getDays(y:number,m:number){ return new Date(y,m+1,0).getDate() }
function getFirst(y:number,m:number){ return new Date(y,m,1).getDay() }
function pad(n:number){ return String(n).padStart(2,'0') }
function getDias(s:string){ const h=new Date();h.setHours(0,0,0,0);return Math.ceil((new Date(s+'T00:00:00').getTime()-h.getTime())/86400000) }
function isCurrentWeek(s:Semana){ const t=new Date().toISOString().slice(0,10); return t>=s.inicio && t<=s.fim }
function isFutureWeek(s:Semana){ return new Date().toISOString().slice(0,10)<s.inicio }

export default function CalendarioPage() {
  const now = new Date()
  const [year,setYear] = useState(now.getFullYear())
  const [month,setMonth] = useState(now.getMonth())
  const [sel,setSel] = useState<string|null>(null)
  const [view,setView] = useState<'calendario'|'editorial'>('editorial')

  const todayStr = now.toISOString().slice(0,10)
  const diasTurno = getDias('2026-10-02')
  const semanaAtual = SEMANAS.find(isCurrentWeek)
  const fasesAtual = semanaAtual?.fase ?? 'Reconhecimento'
  const progressoPct = FASE_PROGRESS[fasesAtual] ?? 20

  const prevMes = () => { if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
  const nextMes = () => { if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }

  const daysCount = getDays(year,month)
  const startDay  = getFirst(year,month)
  const selEvento = sel ? EVENTOS[sel] : null

  const semanasVisiveis = SEMANAS.filter(s => !s.fim || s.fim >= todayStr || isCurrentWeek(s))

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'26px 20px',fontFamily:"var(--font-inter),'Inter',sans-serif"}}>
      <style>{`
        .cal-day{border-radius:10px;cursor:pointer;transition:background .12s;padding:6px;min-height:68px}
        .cal-day:hover{background:rgba(14,164,114,0.07)}
        .cal-day.today{background:rgba(14,164,114,0.1)}
        .cal-day.selected{background:rgba(14,164,114,0.15);box-shadow:inset 0 0 0 2px #0EA472}
        .cal-day.past{opacity:.4}
        .cal-grid-layout{display:grid;grid-template-columns:1fr;gap:18px}
        @media(min-width:800px){.cal-grid-layout{grid-template-columns:1fr 270px}}
        .sug-grid{display:grid;grid-template-columns:1fr;gap:10px}
        @media(min-width:700px){.sug-grid{grid-template-columns:repeat(3,1fr)}}
        .sug-card{background:#fff;border:1px solid #D4E8DC;border-radius:13px;padding:14px;display:flex;flex-direction:column;gap:8}
        .tab-btn{padding:9px 18px;border-radius:50;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .12s}
      `}</style>

      {/* Header */}
      <div style={{marginBottom:22}}>
        <p style={{fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}}>Planejamento</p>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
          <h1 style={{fontSize:24,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.02em'}}>Calendário Editorial Estratégico 2026</h1>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:12,fontWeight:700,color:'#DC3545',background:'rgba(220,53,69,0.08)',padding:'5px 12px',borderRadius:20}}>{diasTurno} dias para o 1º turno</span>
          </div>
        </div>
      </div>

      {/* Barra de fase */}
      <div style={{background:'#fff',border:'1px solid #D4E8DC',borderRadius:14,padding:'14px 18px',marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
          <div>
            <span style={{fontSize:11,color:'#7BA090',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>Fase atual da campanha · </span>
            <span style={{fontSize:13,fontWeight:800,color:'#091710'}}>{fasesAtual}</span>
          </div>
          <span style={{fontSize:11.5,fontWeight:600,color:'#0EA472'}}>{progressoPct}% do caminho até a eleição</span>
        </div>
        <div style={{height:6,background:'#E6F3EB',borderRadius:4,overflow:'hidden',marginBottom:10}}>
          <div style={{height:'100%',width:`${progressoPct}%`,background:'linear-gradient(90deg,#0EA472,#5DFFC0)',borderRadius:4,transition:'width .5s'}}/>
        </div>
        <div style={{display:'flex',gap:0}}>
          {['Reconhecimento','Propostas','Prova Social','Mobilização','Final'].map((fase,i,arr)=>{
            const isCurrent=fase===fasesAtual
            const isDone=FASE_PROGRESS[fase]<progressoPct
            return(
              <div key={fase} style={{flex:1,textAlign:'center'}}>
                <div style={{fontSize:10,fontWeight:isCurrent?700:500,color:isCurrent?'#0EA472':isDone?'#A8C4B8':'#C4D4CA'}}>{fase}</div>
                {i<arr.length-1&&<div style={{width:'100%',height:0}}/>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Abas */}
      <div style={{display:'flex',gap:6,marginBottom:20,background:'#fff',borderRadius:12,padding:5,border:'1px solid #D4E8DC',width:'fit-content'}}>
        <button className="tab-btn" onClick={()=>setView('editorial')} style={{background:view==='editorial'?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',color:view==='editorial'?'#fff':'#7BA090'}}>
          Plano Editorial
        </button>
        <button className="tab-btn" onClick={()=>setView('calendario')} style={{background:view==='calendario'?'linear-gradient(135deg,#0EA472,#054E39)':'transparent',color:view==='calendario'?'#fff':'#7BA090'}}>
          Calendário
        </button>
      </div>

      {/* ── PLANO EDITORIAL ── */}
      {view==='editorial' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {semanasVisiveis.map((sem,idx)=>{
            const ativo=isCurrentWeek(sem)
            const futuro=isFutureWeek(sem)
            const urg=URGENCIA_CONFIG[sem.urgencia]
            const d1=new Date(sem.inicio+'T12:00:00')
            const d2=new Date(sem.fim+'T12:00:00')
            const dateRange=`${d1.getDate()} ${MONTHS[d1.getMonth()].slice(0,3)} — ${d2.getDate()} ${MONTHS[d2.getMonth()].slice(0,3)}`
            return(
              <div key={idx} style={{background:'#fff',border:`2px solid ${ativo?'#0EA472':'#D4E8DC'}`,borderRadius:16,overflow:'hidden',boxShadow:ativo?'0 4px 24px rgba(14,164,114,0.15)':'none'}}>
                {/* Header da semana */}
                <div style={{padding:'14px 20px',borderBottom:'1px solid #E6F3EB',background:ativo?'rgba(14,164,114,0.04)':'#FAFCFB',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                      {ativo&&<span style={{fontSize:10.5,fontWeight:800,padding:'3px 10px',borderRadius:20,background:'#0EA472',color:'#fff'}}>Semana atual</span>}
                      <span style={{fontSize:10.5,fontWeight:600,padding:'3px 10px',borderRadius:20,background:urg.bg,color:urg.cor}}>Urgência {urg.label}</span>
                      <span style={{fontSize:10.5,color:'#A8C4B8',fontWeight:500}}>{dateRange}</span>
                    </div>
                    <h3 style={{fontSize:17,fontWeight:800,color:'#091710',margin:'0 0 4px',letterSpacing:'-0.01em'}}>{sem.tema}</h3>
                    <p style={{fontSize:13,color:'#7BA090',margin:0,lineHeight:1.6,maxWidth:600}}>{sem.objetivo}</p>
                  </div>
                  <div style={{textAlign:'center',padding:'10px 16px',background:urg.bg,borderRadius:12,flexShrink:0}}>
                    <div style={{fontSize:11,color:urg.cor,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{sem.fase}</div>
                  </div>
                </div>

                {/* Sugestões */}
                <div style={{padding:'16px 20px'}}>
                  <p style={{fontSize:11,color:'#A8C4B8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 12px'}}>Sugestões de conteúdo desta semana</p>
                  <div className="sug-grid">
                    {sem.sugestoes.map((sug,si)=>{
                      const tc=TIPO_CONFIG[sug.tipo]
                      const pc=PILAR_CONFIG[sug.pilar]
                      return(
                        <div key={si} className="sug-card">
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            <span style={{fontSize:10.5,fontWeight:700,padding:'3px 8px',borderRadius:20,background:tc.bg,color:tc.cor}}>{tc.label}</span>
                            <span style={{fontSize:10.5,fontWeight:600,padding:'3px 8px',borderRadius:20,background:`${pc.cor}12`,color:pc.cor}}>{pc.label}</span>
                          </div>
                          <div style={{fontSize:13.5,fontWeight:700,color:'#091710',lineHeight:1.4}}>{sug.titulo}</div>
                          <p style={{fontSize:12.5,color:'#7BA090',margin:0,lineHeight:1.55,flex:1}}>{sug.descricao}</p>
                          <div style={{padding:'8px 10px',background:'rgba(14,164,114,0.04)',borderRadius:9,border:'1px solid rgba(14,164,114,0.12)',fontSize:12,color:'#3A5F4E',lineHeight:1.55,fontStyle:'italic'}}>
                            "{sug.gancho}"
                          </div>
                          <div style={{display:'flex',gap:5,alignItems:'center',justifyContent:'space-between'}}>
                            <div style={{display:'flex',gap:4}}>
                              {sug.plataformas.slice(0,2).map(p=>(
                                <span key={p} style={{fontSize:10,color:'#A8C4B8',background:'#F1F6F3',padding:'2px 6px',borderRadius:20,fontWeight:500}}>{p}</span>
                              ))}
                            </div>
                            <Link href={AGENTE_LINK[sug.agente]} style={{fontSize:11.5,fontWeight:700,color:'#0EA472',textDecoration:'none',background:'rgba(14,164,114,0.1)',padding:'5px 11px',borderRadius:20,whiteSpace:'nowrap'}}>
                              {AGENTE_LABEL[sug.agente]} →
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CALENDÁRIO GRID ── */}
      {view==='calendario' && (
        <div className="cal-grid-layout">
          <div style={{background:'#fff',borderRadius:16,border:'1px solid #D4E8DC',overflow:'hidden'}}>
            {/* Nav */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #E6F3EB'}}>
              <button onClick={prevMes} style={{width:34,height:34,borderRadius:9,border:'1px solid #D4E8DC',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#3A5F4E'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:17,fontWeight:800,color:'#091710',letterSpacing:'-0.02em'}}>{MONTHS[month]}</div>
                <div style={{fontSize:12,color:'#7BA090',fontWeight:500}}>{year}</div>
              </div>
              <button onClick={nextMes} style={{width:34,height:34,borderRadius:9,border:'1px solid #D4E8DC',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#3A5F4E'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:'10px 12px 4px'}}>
              {WEEKDAYS.map(w=><div key={w} style={{textAlign:'center',fontSize:11,fontWeight:700,color:'#A8C4B8',padding:'4px 0'}}>{w}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:'2px 12px 14px'}}>
              {Array.from({length:startDay}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:daysCount}).map((_,i)=>{
                const d=i+1
                const dateStr=`${year}-${pad(month+1)}-${pad(d)}`
                const ev=EVENTOS[dateStr]
                const isToday=dateStr===todayStr
                const isSel=dateStr===sel
                const isPast=dateStr<todayStr
                const cls=`cal-day${isToday?' today':''}${isSel?' selected':''}${isPast?' past':''}`
                return(
                  <div key={d} className={cls} onClick={()=>setSel(isSel?null:dateStr)}>
                    <div style={{fontSize:13,fontWeight:isToday?800:500,color:isToday?'#0EA472':ev?.rel==='critica'?'#DC3545':'#091710',marginBottom:3}}>{d}</div>
                    {ev&&<div style={{width:7,height:7,borderRadius:'50%',background:ev.rel==='critica'?'#DC3545':ev.rel==='alta'?'#0EA472':'#D97706'}}/>}
                  </div>
                )
              })}
            </div>
            <div style={{display:'flex',gap:14,padding:'10px 18px 14px',borderTop:'1px solid #E6F3EB'}}>
              {[['#DC3545','Eleitoral'],['#0EA472','Alta'],['#D97706','Média']].map(([c,l])=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:c}}/>
                  <span style={{fontSize:11.5,color:'#7BA090',fontWeight:500}}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Painel lateral */}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {selEvento&&sel&&(
              <div style={{background:'#fff',border:`2px solid ${selEvento.rel==='critica'?'#DC3545':'#0EA472'}`,borderRadius:14,overflow:'hidden'}}>
                <div style={{height:3,background:selEvento.mesCor}}/>
                <div style={{padding:'14px 16px'}}>
                  <p style={{fontSize:11,color:'#7BA090',fontWeight:700,margin:'0 0 6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>
                    {new Date(sel+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}
                  </p>
                  <h3 style={{fontSize:15,fontWeight:800,color:'#091710',margin:'0 0 8px'}}>{selEvento.label}</h3>
                  <p style={{fontSize:13,color:'#3A5F4E',lineHeight:1.65,margin:'0 0 12px'}}>{selEvento.pauta}</p>
                  <div style={{display:'flex',gap:7}}>
                    <Link href="/agentes/roteirista" style={{flex:1,textAlign:'center',padding:'9px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none'}}>Gerar roteiro</Link>
                    <Link href="/agentes/copy" style={{flex:1,textAlign:'center',padding:'9px',color:'#0EA472',borderRadius:50,fontSize:12,fontWeight:700,textDecoration:'none',border:'1.5px solid #0EA472'}}>Copy</Link>
                  </div>
                </div>
              </div>
            )}
            <div style={{background:'#fff',border:'1px solid #D4E8DC',borderRadius:14,padding:'14px'}}>
              <p style={{fontSize:12,fontWeight:700,color:'#091710',margin:'0 0 10px'}}>Próximos marcos</p>
              {Object.entries(EVENTOS).filter(([d])=>d>=todayStr).slice(0,6).map(([d,ev])=>{
                const dias=getDias(d)
                const dt=new Date(d+'T12:00:00')
                return(
                  <div key={d} onClick={()=>{setSel(d);setYear(dt.getFullYear());setMonth(dt.getMonth())}}
                    style={{display:'flex',gap:10,alignItems:'center',padding:'8px 10px',borderRadius:9,background:'#FAFCFB',border:'1px solid #E6F3EB',marginBottom:6,cursor:'pointer'}}>
                    <div style={{width:34,textAlign:'center',flexShrink:0}}>
                      <div style={{fontSize:15,fontWeight:800,color:ev.rel==='critica'?'#DC3545':'#0EA472',lineHeight:1}}>{dt.getDate()}</div>
                      <div style={{fontSize:9,color:'#A8C4B8',textTransform:'uppercase',fontWeight:600}}>{MONTHS[dt.getMonth()].slice(0,3)}</div>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:ev.rel==='critica'?'#DC3545':'#091710',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.label}</div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:ev.rel==='critica'?'#DC3545':ev.rel==='alta'?'#0EA472':'#D97706',background:ev.rel==='critica'?'rgba(220,53,69,0.08)':ev.rel==='alta'?'rgba(14,164,114,0.08)':'rgba(217,119,6,0.08)',padding:'2px 8px',borderRadius:20,flexShrink:0}}>{dias}d</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
