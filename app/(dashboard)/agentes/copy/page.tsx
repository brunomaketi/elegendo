'use client'
import { AgentForm, type FieldConfig } from '@/components/AgentForm'

const FIELDS: FieldConfig[] = [
  { name:'cargo', label:'Cargo disputado', type:'select', required:true, options:[
    {value:'Vereador',label:'Vereador(a)'},{value:'Deputado Estadual',label:'Deputado(a) Estadual'},
    {value:'Deputado Federal',label:'Deputado(a) Federal'},{value:'Senador',label:'Senador(a)'},
    {value:'Governador',label:'Governador(a)'},{value:'Presidente',label:'Presidente'},
  ]},
  { name:'pauta_central', label:'Pauta central deste conteúdo', type:'text', placeholder:'Ex: Proposta de iluminação LED nos bairros periféricos', required:true },
  { name:'publico_alvo', label:'Público-alvo', type:'text', placeholder:'Ex: Moradores da periferia, 30-55 anos', required:true },
  { name:'plataforma', label:'Plataforma', type:'select', required:true, options:[
    {value:'Meta',label:'Meta (Instagram + Facebook)'},{value:'Google',label:'Google Ads'},
    {value:'TikTok',label:'TikTok'},{value:'WhatsApp',label:'WhatsApp'},
  ]},
  { name:'objetivo', label:'Objetivo', type:'select', required:true, options:[
    {value:'consciencia',label:'Consciência — apresentar o candidato'},
    {value:'engajamento',label:'Engajamento — comentários e compartilhamentos'},
    {value:'conversao',label:'Conversão — captar contato ou pedido de voto'},
  ]},
  { name:'tom', label:'Tom', type:'select', required:true, options:[
    {value:'serio',label:'Sério e técnico'},{value:'proximo',label:'Próximo e humano'},
    {value:'combativo',label:'Combativo e direto'},{value:'esperancoso',label:'Esperançoso e propositivo'},
  ]},
  { name:'diferencial', label:'Diferencial do candidato (opcional)', type:'textarea', placeholder:'O que torna este candidato único?' },
]

export default function CopyPage() {
  return (
    <div style={{ maxWidth:1140, margin:'0 auto', padding:'28px 22px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ height:3, background:'linear-gradient(90deg,#7B4FD8,#B084F0)', borderRadius:4, marginBottom:24 }}/>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:13, background:'rgba(123,79,216,0.1)', border:'1px solid rgba(123,79,216,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4FD8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#091710', margin:0, letterSpacing:'-0.02em' }}>Copy Político</h1>
              <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(123,79,216,0.1)', color:'#7B4FD8', border:'1px solid rgba(123,79,216,0.2)' }}>IA</span>
              <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'rgba(9,23,16,0.06)', color:'#3A5F4E' }}>Claude</span>
            </div>
            <p style={{ fontSize:13.5, color:'#7BA090', margin:0, lineHeight:1.5 }}>Headlines, legendas e copies para anúncios em Meta, Google e TikTok — prontos para publicar.</p>
          </div>
        </div>
      </div>
      <AgentForm agente="copy" fields={FIELDS} agentColor="#7B4FD8" agentBg="rgba(123,79,216,0.08)"/>
    </div>
  )
}
