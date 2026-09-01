'use client'
import { AgentForm, type FieldConfig } from '@/components/AgentForm'

const FIELDS: FieldConfig[] = [
  { name:'cargo', label:'Cargo disputado', type:'select', required:true, options:[
    {value:'Vereador',label:'Vereador(a)'},{value:'Deputado Estadual',label:'Deputado(a) Estadual'},
    {value:'Deputado Federal',label:'Deputado(a) Federal'},{value:'Senador',label:'Senador(a)'},
    {value:'Governador',label:'Governador(a)'},{value:'Presidente',label:'Presidente'},
  ]},
  { name:'cidade', label:'Cidade / Estado', type:'text', placeholder:'Ex: Campinas, SP', required:true },
  { name:'pautas', label:'3 pautas principais', type:'textarea', placeholder:'Ex: Segurança pública, educação básica, geração de empregos', required:true },
  { name:'publico_alvo', label:'Público-alvo', type:'text', placeholder:'Ex: Trabalhadores da periferia, 25-45 anos', required:true },
  { name:'tom', label:'Tom de comunicação', type:'select', required:true, options:[
    {value:'serio',label:'Sério e técnico'},{value:'proximo',label:'Próximo e acolhedor'},{value:'combativo',label:'Combativo e direto'},
  ]},
  { name:'duracao', label:'Duração do Reel', type:'select', required:true, options:[
    {value:'30s',label:'30 segundos'},{value:'60s',label:'60 segundos'},
  ]},
  { name:'contexto_extra', label:'Contexto adicional (opcional)', type:'textarea', placeholder:'Acontecimento recente, votação, proposta específica...' },
]

export default function RoteiristPage() {
  return (
    <div style={{ maxWidth:1140, margin:'0 auto', padding:'28px 22px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ height:3, background:'linear-gradient(90deg,#0EA472,#5DFFC0)', borderRadius:4, marginBottom:24 }}/>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:13, background:'rgba(14,164,114,0.1)', border:'1px solid rgba(14,164,114,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0EA472" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#091710', margin:0, letterSpacing:'-0.02em' }}>Roteirista de Reels</h1>
              <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(14,164,114,0.1)', color:'#0EA472', border:'1px solid rgba(14,164,114,0.2)' }}>IA</span>
              <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'rgba(9,23,16,0.06)', color:'#3A5F4E' }}>Claude</span>
            </div>
            <p style={{ fontSize:13.5, color:'#7BA090', margin:0, lineHeight:1.5 }}>Gera 3 roteiros com gancho, desenvolvimento e CTA — prontos para gravar e publicar.</p>
          </div>
        </div>
      </div>
      <AgentForm agente="roteirista" fields={FIELDS} agentColor="#0EA472" agentBg="rgba(14,164,114,0.08)"/>
    </div>
  )
}
