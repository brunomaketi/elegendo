'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const CARGOS = ['Vereador(a)', 'Deputado(a) Estadual', 'Deputado(a) Federal', 'Senador(a)', 'Governador(a)', 'Presidente']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const ESPECIALIDADES = ['Marketing Digital', 'Assessoria de Imprensa', 'Gestão de Campanha', 'Social Media', 'Produção de Conteúdo', 'Consultoria Política', 'Outro']

type TipoConta = 'candidato' | 'assessor'

function PerfilContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const primeiroAcesso = searchParams.get('primeiro_acesso') === 'true'

  const [form, setForm] = useState({
    nome:'', tipo_conta:'candidato' as TipoConta,
    cargo:'', cidade:'', estado:'', partido:'',
    instagram:'', bio_politica:'',
    agencia:'', especialidade:'',
    instagram_profissional:'', contexto_trabalho:'',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setForm({
          nome: data.nome ?? '',
          tipo_conta: (data.tipo_conta as TipoConta) ?? 'candidato',
          cargo: data.cargo ?? '', cidade: data.cidade ?? '',
          estado: data.estado ?? '', partido: data.partido ?? '',
          instagram: data.instagram ?? '', bio_politica: data.bio_politica ?? '',
          agencia: data.agencia ?? '', especialidade: data.especialidade ?? '',
          instagram_profissional: data.instagram_profissional ?? '',
          contexto_trabalho: data.contexto_trabalho ?? '',
        })
        setLoading(false)
      })
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setOk(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const fields: Record<string,string> = form.tipo_conta === 'candidato'
      ? { nome:form.nome, tipo_conta:form.tipo_conta, cargo:form.cargo, cidade:form.cidade, estado:form.estado, partido:form.partido, instagram:form.instagram, bio_politica:form.bio_politica }
      : { nome:form.nome, tipo_conta:form.tipo_conta, agencia:form.agencia, especialidade:form.especialidade, instagram_profissional:form.instagram_profissional, contexto_trabalho:form.contexto_trabalho }
    await supabase.from('profiles').update(fields).eq('id', user.id)
    setSaving(false); setOk(true)
    if (primeiroAcesso) window.location.href = '/dashboard'
    else setTimeout(() => setOk(false), 3000)
  }

  const f = (name: string, val: string) => setForm(p => ({ ...p, [name]: val }))

  const isCand = form.tipo_conta === 'candidato'
  const bioLen = (isCand ? form.bio_politica : form.contexto_trabalho).length
  const bioTgt = 200

  const inp = { padding:'11px 14px', borderRadius:10, border:'1.5px solid #D4E8DC', fontSize:14, color:'#091710', background:'#fff', width:'100%', boxSizing:'border-box' as const, outline:'none', fontFamily:'inherit', transition:'border-color .15s' }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#7BA090', fontSize:13 }}>
      Carregando perfil...
    </div>
  )

  const avatar = form.nome?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'U'

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'28px 20px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>
      <style>{`
        .finp:focus{border-color:#0EA472!important;box-shadow:0 0 0 3px rgba(14,164,114,0.1)!important}
        .type-card{border-radius:14px;border:2px solid #D4E8DC;padding:16px 18px;cursor:pointer;transition:all .15s;display:flex;align-items:flex-start;gap:12}
        .type-card.active{border-color:#0EA472;background:rgba(14,164,114,0.04)}
        .surf{background:#fff;border:1px solid #D4E8DC;border-radius:14px;padding:20px}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase' as const,letterSpacing:'0.08em',fontWeight:700 }}>Conta</p>
        <h1 style={{ fontSize:24,fontWeight:800,color:'#091710',margin:0,letterSpacing:'-0.02em' }}>Configurações</h1>
      </div>

      {/* Profile card */}
      <div className="surf" style={{ marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#0EA472,#054E39)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'#fff',flexShrink:0 }}>
          {avatar}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:17,fontWeight:700,color:'#091710',marginBottom:2 }}>{form.nome || 'Sem nome'}</div>
          <div style={{ fontSize:13,color:'#7BA090' }}>{email}</div>
        </div>
        {ok && (
          <div style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',background:'rgba(14,164,114,0.1)',borderRadius:50,fontSize:13,fontWeight:600,color:'#0EA472' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            Salvo com sucesso
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Tipo de conta */}
        <div className="surf" style={{ marginBottom:16 }}>
          <p style={{ fontSize:12,fontWeight:700,color:'#3A5F4E',textTransform:'uppercase' as const,letterSpacing:'0.06em',margin:'0 0 12px' }}>Tipo de conta</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            {([
              { id:'candidato', label:'Candidato', desc:'Estou disputando uma eleição', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
              { id:'assessor', label:'Assessor / Gestor', desc:'Gerencio campanhas de candidatos', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            ] as const).map(t => (
              <div key={t.id} className={`type-card${form.tipo_conta===t.id?' active':''}`} onClick={() => f('tipo_conta', t.id)}>
                <div style={{ width:36,height:36,borderRadius:10,background:form.tipo_conta===t.id?'rgba(14,164,114,0.1)':'#F1F6F3',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:form.tipo_conta===t.id?'#0EA472':'#7BA090' }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:form.tipo_conta===t.id?'#091710':'#3A5F4E' }}>{t.label}</div>
                  <div style={{ fontSize:12,color:'#A8C4B8',marginTop:2 }}>{t.desc}</div>
                </div>
                {form.tipo_conta===t.id&&(
                  <div style={{ marginLeft:'auto',width:18,height:18,borderRadius:'50%',background:'#0EA472',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informações */}
        {isCand ? (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
            <div className="surf" style={{ gridColumn:'1/-1' }}>
              <p style={{ fontSize:12,fontWeight:700,color:'#3A5F4E',textTransform:'uppercase' as const,letterSpacing:'0.06em',margin:'0 0 14px' }}>Informações pessoais</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Nome completo *</label>
                  <input value={form.nome} onChange={e=>f('nome',e.target.value)} required placeholder="Seu nome completo" className="finp" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Cargo disputado *</label>
                  <select value={form.cargo} onChange={e=>f('cargo',e.target.value)} required className="finp" style={{...inp,appearance:'auto' as const}}>
                    <option value="">Selecione...</option>
                    {CARGOS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Cidade *</label>
                  <input value={form.cidade} onChange={e=>f('cidade',e.target.value)} required placeholder="Sua cidade" className="finp" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Estado *</label>
                  <select value={form.estado} onChange={e=>f('estado',e.target.value)} required className="finp" style={{...inp,appearance:'auto' as const}}>
                    <option value="">UF...</option>
                    {ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Partido</label>
                  <input value={form.partido} onChange={e=>f('partido',e.target.value)} placeholder="PT, PSD, Republicanos..." className="finp" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Instagram</label>
                  <input value={form.instagram} onChange={e=>f('instagram',e.target.value)} placeholder="@seuperfil" className="finp" style={inp}/>
                </div>
              </div>
            </div>
            <div className="surf" style={{ gridColumn:'1/-1' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Bio política para os agentes *</label>
                <span style={{ fontSize:11,color:bioLen>=bioTgt?'#0EA472':'#A8C4B8',fontWeight:600 }}>{bioLen}/{bioTgt}+</span>
              </div>
              <textarea value={form.bio_politica} onChange={e=>f('bio_politica',e.target.value)} rows={4} placeholder="Conte sua história política, principais pautas, base eleitoral e diferencial. Quanto mais detalhes, melhor o conteúdo gerado." className="finp" style={{...inp,resize:'vertical' as const,minHeight:100}}/>
              <div style={{ marginTop:10,padding:'10px 12px',background:'rgba(14,164,114,0.05)',borderRadius:10,border:'1px solid rgba(14,164,114,0.12)',fontSize:12,color:'#3A5F4E',lineHeight:1.6 }}>
                <strong style={{ fontWeight:700 }}>Dica dos agentes:</strong> Inclua quantos mandatos tem, quais bairros atende, estilo de comunicação e casos de sucesso que os agentes possam referenciar.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom:16 }}>
            <div className="surf" style={{ marginBottom:16 }}>
              <p style={{ fontSize:12,fontWeight:700,color:'#3A5F4E',textTransform:'uppercase' as const,letterSpacing:'0.06em',margin:'0 0 14px' }}>Informações profissionais</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Nome completo *</label>
                  <input value={form.nome} onChange={e=>f('nome',e.target.value)} required placeholder="Seu nome" className="finp" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Agência / Empresa *</label>
                  <input value={form.agencia} onChange={e=>f('agencia',e.target.value)} required placeholder="Nome da agência" className="finp" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Especialidade *</label>
                  <select value={form.especialidade} onChange={e=>f('especialidade',e.target.value)} required className="finp" style={{...inp,appearance:'auto' as const}}>
                    <option value="">Selecione...</option>
                    {ESPECIALIDADES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Instagram profissional</label>
                  <input value={form.instagram_profissional} onChange={e=>f('instagram_profissional',e.target.value)} placeholder="@agencia" className="finp" style={inp}/>
                </div>
              </div>
            </div>
            <div className="surf">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                <label style={{ fontSize:11,fontWeight:700,color:'#3A5F4E',textTransform:'uppercase' as const,letterSpacing:'0.05em' }}>Contexto de trabalho</label>
                <span style={{ fontSize:11,color:bioLen>=bioTgt?'#0EA472':'#A8C4B8',fontWeight:600 }}>{bioLen}/{bioTgt}+</span>
              </div>
              <textarea value={form.contexto_trabalho} onChange={e=>f('contexto_trabalho',e.target.value)} rows={4} placeholder="Descreva sua experiência, os candidatos que gerencia e como trabalha." className="finp" style={{...inp,resize:'vertical' as const,minHeight:100}}/>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} style={{ padding:'13px 32px',borderRadius:50,border:'none',background:saving?'rgba(14,164,114,0.5)':'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',fontSize:14,fontWeight:700,cursor:saving?'not-allowed':'pointer',boxShadow:saving?'none':'0 4px 16px rgba(14,164,114,0.35)',fontFamily:'inherit' }}>
          {saving ? 'Salvando...' : ok ? 'Salvo!' : 'Salvar perfil'}
        </button>
      </form>
    </div>
  )
}

export default function PerfilPage() {
  return <Suspense fallback={null}><PerfilContent/></Suspense>
}
