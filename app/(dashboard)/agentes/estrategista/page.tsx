'use client'
import { AgentForm, type FieldConfig } from '@/components/AgentForm'

const FIELDS: FieldConfig[] = [
  { name:'cargo', label:'Cargo disputado', type:'select', required:true, options:[
    {value:'Vereador',label:'Vereador(a)'},{value:'Deputado Estadual',label:'Deputado(a) Estadual'},
    {value:'Deputado Federal',label:'Deputado(a) Federal'},{value:'Senador',label:'Senador(a)'},
    {value:'Governador',label:'Governador(a)'},{value:'Presidente',label:'Presidente'},
  ]},
  { name:'cidade', label:'Cidade / Estado', type:'text', placeholder:'Ex: Campinas, SP', required:true },
  { name:'instagram_atual', label:'Instagram atual (se tiver)', type:'text', placeholder:'@seucandidato' },
  { name:'concorrentes', label:'Principais concorrentes', type:'textarea', placeholder:'Nomes e como eles se comunicam' },
  { name:'verba', label:'Verba mensal para digital', type:'select', required:true, options:[
    {value:'Sem verba — apenas orgânico',label:'Sem verba — apenas orgânico'},
    {value:'Até R$ 500/mês',label:'Até R$ 500/mês'},{value:'R$ 500 a R$ 2.000/mês',label:'R$ 500 a R$ 2.000/mês'},
    {value:'R$ 2.000 a R$ 10.000/mês',label:'R$ 2.000 a R$ 10.000/mês'},{value:'Acima de R$ 10.000/mês',label:'Acima de R$ 10.000/mês'},
  ]},
  { name:'historico', label:'Histórico eleitoral', type:'select', required:true, options:[
    {value:'Primeira candidatura',label:'Primeira candidatura'},{value:'Já candidatei e não fui eleito',label:'Já candidatei e não fui eleito'},
    {value:'Mandato atual — busco reeleição',label:'Mandato atual — busco reeleição'},{value:'Mandato atual — busco cargo maior',label:'Mandato atual — busco cargo maior'},
  ]},
  { name:'prazo', label:'Prazo até a eleição', type:'text', placeholder:'Ex: 6 meses — outubro 2026', required:true },
  { name:'pautas', label:'Pautas centrais', type:'textarea', placeholder:'Liste as 3 principais bandeiras', required:true },
]

export default function EstrategistaPage() {
  return (
    <div style={{ maxWidth:1140, margin:'0 auto', padding:'28px 22px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ height:3, background:'linear-gradient(90deg,#2D7DD2,#7BB8F0)', borderRadius:4, marginBottom:24 }}/>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:13, background:'rgba(45,125,210,0.1)', border:'1px solid rgba(45,125,210,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D7DD2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#091710', margin:0, letterSpacing:'-0.02em' }}>Estrategista de Campanha</h1>
              <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(45,125,210,0.1)', color:'#2D7DD2', border:'1px solid rgba(45,125,210,0.2)' }}>IA</span>
              <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'rgba(9,23,16,0.06)', color:'#3A5F4E' }}>Claude</span>
            </div>
            <p style={{ fontSize:13.5, color:'#7BA090', margin:0, lineHeight:1.5 }}>Diagnóstico completo + plano de comunicação de 90 dias com KPIs e prioridades.</p>
          </div>
        </div>
      </div>
      <AgentForm agente="estrategista" fields={FIELDS} agentColor="#2D7DD2"/>
    </div>
  )
}
