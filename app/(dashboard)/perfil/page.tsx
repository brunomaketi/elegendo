'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const CARGOS = ['Vereador(a)', 'Deputado(a) Estadual', 'Deputado(a) Federal', 'Senador(a)', 'Governador(a)', 'Presidente']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

type TipoConta = 'candidato' | 'assessor'

export default function PerfilPage() {
  const supabase = createClient()
  const [form, setForm] = useState({
    nome: '', tipo_conta: 'candidato' as TipoConta,
    cargo: '', cidade: '', estado: '', partido: '',
    instagram: '', bio_politica: '',
    agencia: '', especialidade: '',
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
          cargo: data.cargo ?? '',
          cidade: data.cidade ?? '',
          estado: data.estado ?? '',
          partido: data.partido ?? '',
          instagram: data.instagram ?? '',
          bio_politica: data.bio_politica ?? '',
          agencia: data.agencia ?? '',
          especialidade: data.especialidade ?? '',
        })
        setLoading(false)
      })
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setOk(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ ...form, atualizado_em: new Date().toISOString() }).eq('id', user.id)
    setSaving(false)
    setOk(true)
    setTimeout(() => setOk(false), 3000)
  }

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

  // Calcula completude
  const camposObrigatorios = form.tipo_conta === 'candidato'
    ? ['nome', 'cargo', 'cidade', 'estado', 'partido', 'bio_politica']
    : ['nome', 'agencia', 'especialidade', 'bio_politica']
  const preenchidos = camposObrigatorios.filter(c => form[c as keyof typeof form]).length
  const completude = Math.round((preenchidos / camposObrigatorios.length) * 100)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#8A8A9A', fontFamily: 'var(--font-inter), sans-serif' }}>
      Carregando perfil...
    </div>
  )

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#1A1A2E', border: '3px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#C9A84C', flexShrink: 0 }}>
          {form.nome?.charAt(0).toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>
            {form.nome || 'Seu nome'}
          </h1>
          <p style={{ fontSize: '13px', color: '#8A8A9A', margin: '0 0 12px' }}>{email}</p>
          {/* Completude */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '160px', background: '#E8E0D0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: completude === 100 ? '#1D9E75' : completude > 50 ? '#C9A84C' : '#E24B4A', width: `${completude}%`, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: completude === 100 ? '#1D9E75' : '#8A8A9A' }}>
              {completude}% completo
            </span>
            {completude === 100 && <span style={{ fontSize: '11px', padding: '2px 8px', background: '#E8F8F2', color: '#1D9E75', borderRadius: '20px', fontWeight: 600 }}>✓ Perfil completo</span>}
          </div>
        </div>
      </div>

      {/* Tipo de conta */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Tipo de conta
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { val: 'candidato', label: 'Candidato', icon: '🗳️', desc: 'Estou disputando uma eleição' },
            { val: 'assessor', label: 'Assessor / Gestor', icon: '📋', desc: 'Gerencio campanhas de candidatos' },
          ].map(({ val, label, icon, desc }) => (
            <button
              key={val}
              type="button"
              onClick={() => set('tipo_conta', val)}
              style={{
                flex: 1, padding: '14px 16px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${form.tipo_conta === val ? '#1A1A2E' : '#E8E0D0'}`,
                background: form.tipo_conta === val ? '#1A1A2E' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: form.tipo_conta === val ? '#E8D5A3' : '#1A1A2E', marginBottom: '2px' }}>{label}</div>
              <div style={{ fontSize: '12px', color: form.tipo_conta === val ? 'rgba(232,213,163,0.7)' : '#8A8A9A' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Coluna esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#8A8A9A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Informações pessoais
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Nome completo" required>
                  <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="João Silva" required style={inp} />
                </Field>

                {form.tipo_conta === 'candidato' ? (
                  <>
                    <Field label="Cargo disputado">
                      <select value={form.cargo} onChange={e => set('cargo', e.target.value)} style={inp}>
                        <option value="">Selecione...</option>
                        {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
                      <Field label="Cidade">
                        <input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Americana" style={inp} />
                      </Field>
                      <Field label="Estado">
                        <select value={form.estado} onChange={e => set('estado', e.target.value)} style={inp}>
                          <option value="">UF</option>
                          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Partido">
                      <input value={form.partido} onChange={e => set('partido', e.target.value)} placeholder="PT, PL, MDB..." style={inp} />
                    </Field>
                    <Field label="Instagram">
                      <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@seucandidato" style={inp} />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Agência / Empresa" required>
                      <input value={form.agencia} onChange={e => set('agencia', e.target.value)} placeholder="Maketi Agency" required style={inp} />
                    </Field>
                    <Field label="Especialidade" required>
                      <select value={form.especialidade} onChange={e => set('especialidade', e.target.value)} style={inp}>
                        <option value="">Selecione...</option>
                        <option value="Marketing Digital">Marketing Digital</option>
                        <option value="Tráfego Pago">Tráfego Pago</option>
                        <option value="Conteúdo e Redes Sociais">Conteúdo e Redes Sociais</option>
                        <option value="Estratégia Política">Estratégia Política</option>
                        <option value="Comunicação Institucional">Comunicação Institucional</option>
                        <option value="Assessoria Completa">Assessoria Completa</option>
                      </select>
                    </Field>
                    <Field label="Instagram profissional">
                      <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@suaagencia" style={inp} />
                    </Field>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #E8E0D0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#8A8A9A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {form.tipo_conta === 'candidato' ? 'Contexto da campanha' : 'Contexto de trabalho'}
              </div>
              <p style={{ fontSize: '12px', color: '#8A8A9A', margin: '0 0 14px', lineHeight: '1.5' }}>
                {form.tipo_conta === 'candidato'
                  ? 'Este texto alimenta todos os agentes. Quanto mais detalhado, mais preciso o conteúdo gerado.'
                  : 'Descreva sua experiência, os candidatos que gerencia e como trabalha. Os agentes usarão isso como contexto.'}
              </p>
              <textarea
                value={form.bio_politica}
                onChange={e => set('bio_politica', e.target.value)}
                placeholder={form.tipo_conta === 'candidato'
                  ? 'Ex: Sou vereador em Americana/SP buscando reeleição. Minhas pautas são segurança pública, saúde e moradia. Fui eleito em 2020 com 3.800 votos. Meu público principal são trabalhadores da periferia...'
                  : 'Ex: Sou gestor de redes sociais com 3 anos de experiência em campanhas políticas. Atualmente gerencio 2 candidatos a vereador em Campinas/SP. Foco em conteúdo orgânico e tráfego pago no Meta...'}
                rows={10}
                style={{ ...inp, resize: 'vertical', minHeight: '240px' }}
              />
              <div style={{ fontSize: '11px', color: '#8A8A9A', marginTop: '8px' }}>
                {form.bio_politica.length} caracteres · Recomendado: 200+
              </div>
            </div>

            {/* Dica */}
            <div style={{ padding: '14px 16px', background: '#FFF8E6', borderRadius: '10px', border: '1px solid #F0D080' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#633806', marginBottom: '4px' }}>💡 Dica dos agentes</div>
              <p style={{ fontSize: '12px', color: '#8A6020', margin: 0, lineHeight: '1.6' }}>
                {form.tipo_conta === 'candidato'
                  ? 'Inclua: cargo, cidade, pautas principais, histórico eleitoral, público-alvo e tom de comunicação. Isso melhora muito a qualidade dos roteiros e copies gerados.'
                  : 'Inclua: quantos candidatos gerencia, em quais cidades, quais cargos, quais plataformas usa e qual é seu estilo de comunicação. Os agentes vão gerar conteúdo mais alinhado com sua forma de trabalhar.'}
              </p>
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: saving ? '#8A8A9A' : '#1A1A2E', color: '#E8D5A3', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter), sans-serif' }}
          >
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
          {ok && <span style={{ fontSize: '13px', color: '#1D9E75', fontWeight: 600 }}>✓ Salvo com sucesso!</span>}
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}{required && <span style={{ color: '#C9A84C', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '8px', border: '1px solid #E8E0D0',
  fontSize: '13px', color: '#1A1A2E', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
  fontFamily: 'var(--font-inter), sans-serif',
}
