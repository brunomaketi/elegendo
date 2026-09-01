'use client'
import { AgentForm, type FieldConfig } from '@/components/AgentForm'

const FIELDS: FieldConfig[] = [
  { name:'tema_semana', label:'Tema da semana', type:'text', placeholder:'Ex: Candidatos que ignoram o Instagram perdem votos jovens', required:true },
  { name:'formato', label:'Formato', type:'select', required:true, options:[
    {value:'reel',label:'Reel — vídeo curto com roteiro'},{value:'carrossel',label:'Carrossel — slides com dados'},
    {value:'post',label:'Post estático — imagem + legenda'},{value:'stories',label:'Stories — sequência com enquete'},
  ]},
  { name:'dado_eleitoral', label:'Dado ou notícia eleitoral (opcional)', type:'textarea', placeholder:'Ex: Pesquisa mostra que 67% dos eleitores 18-35 decidem o voto pelas redes...' },
  { name:'publico_do_post', label:'Para quem é este conteúdo', type:'select', required:true, options:[
    {value:'candidato iniciante',label:'Candidato iniciante'},{value:'candidato experiente',label:'Candidato experiente'},
    {value:'assessor politico',label:'Assessor político'},{value:'geral',label:'Geral'},
  ]},
  { name:'angulo', label:'Ângulo da mensagem', type:'select', required:true, options:[
    {value:'custo da ausencia',label:'Custo da ausência — o que perde sem digital'},
    {value:'erro comum',label:'Erro comum — o que a maioria faz errado'},
    {value:'comparacao',label:'Comparação — quem usa vs quem não usa'},
    {value:'oportunidade',label:'Oportunidade — o que ainda dá tempo de fazer'},
  ]},
  { name:'cta_desejado', label:'CTA desejado', type:'select', required:true, options:[
    {value:'entrar na comunidade',label:'Entrar na comunidade Elegendo'},
    {value:'salvar post',label:'Salvar o post'},{value:'marcar candidato',label:'Marcar aquele candidato que precisa ver'},
    {value:'agendar conversa',label:'Agendar conversa com o Elegendo'},
  ]},
]

export default function ConscienciaPage() {
  return (
    <div style={{ maxWidth:1140, margin:'0 auto', padding:'28px 22px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ height:3, background:'linear-gradient(90deg,#D97706,#FBB954)', borderRadius:4, marginBottom:24 }}/>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:13, background:'rgba(217,119,6,0.1)', border:'1px solid rgba(217,119,6,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#091710', margin:0, letterSpacing:'-0.02em' }}>Consciência</h1>
              <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(217,119,6,0.1)', color:'#D97706', border:'1px solid rgba(217,119,6,0.2)' }}>IA</span>
              <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'rgba(9,23,16,0.06)', color:'#3A5F4E' }}>Claude</span>
            </div>
            <p style={{ fontSize:13.5, color:'#7BA090', margin:0, lineHeight:1.5 }}>Conteúdo para o @sejaelegendo que cria urgência em candidatos sobre estratégia digital.</p>
          </div>
        </div>
      </div>
      <AgentForm agente="consciencia" fields={FIELDS} agentColor="#D97706" agentBg="rgba(217,119,6,0.08)"/>
    </div>
  )
}
