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

  const camposObrigatorios = form.tipo_conta === 'candidato'
    ? ['nome', 'cargo', 'cidade', 'estado', 'partido', 'bio_politica']
    : ['nome', 'agencia', 'especialidade', 'bio_politica']
  const preenchidos = camposObrigatorios.filter(c => form[c as keyof typeof form]).length
  const completude = Math.round((preenchidos / camposObrigatorios.length) * 100)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(45,27,110,0.4)', fontFamily: 'var(--font-inter), sans-serif' }}>
      Carregando perfil...
    </div>
  )

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 28px', fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(123,79,216,0.12)', border: '3px solid rgba(123,79,216,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#7B4FD8', flexShrink: 0 }}>
          {form.nome?.charAt(0).toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2D1B6E', margin: '0 0 3px', letterSpacing: '-0.01em' }}>
            {form.nome || 'Seu nome'}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(45,27,110,0.4)', margin: '0 0 14px' }}>{email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 160, background: 'rgba(123,79,216,0.1)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, background: completude === 100 ? '#1D9E75' : completude > 50 ? '#7B4FD8' : '#E24B4A', width: `${completude}%`, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: completude === 100 ? '#1D9E75' : 'rgba(45,27,110,0.5)' }}>
              {completude}% completo
            </span>
            {completude === 100 && (
              <span style={{ fontSize: 11, padding: '2px 10px', background: 'rgba(29,158,117,0.1)', color: '#1D9E75', borderRadius: 20, fontWeight: 700 }}>✓ Perfil completo</span>
            )}
          </div>
        </div>
      </div>

      {/* Tipo de conta */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(45,27,110,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Tipo de conta
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { val: 'candidato', label: 'Candidato', icon: '🗳️', desc: 'Estou disputando uma eleição' },
            { val: 'assessor',  label: 'Assessor / Gestor', icon: '📋', desc: 'Gerencio campanhas de candidatos' },
          ].map(({ val, label, icon, desc }) => (
            <button key={val} type="button" onClick={() => set('tipo_conta', val)} style={{ flex: 1, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: `2px solid ${form.tipo_conta === val ? '#7B4FD8' : 'rgba(123,79,216,0.12)'}`, background: form.tipo_conta === val ? 'linear-gradient(135deg, #2D1B6E, #4A2FA0)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: form.tipo_conta === val ? '#fff' : '#2D1B6E', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: form.tipo_conta === val ? 'rgba(255,255,255,0.55)' : 'rgba(45,27,110,0.4)' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Coluna esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Informações pessoais
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(123,79,216,0.1)', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                {form.tipo_conta === 'candidato' ? 'Contexto da campanha' : 'Contexto de trabalho'}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(45,27,110,0.45)', margin: '0 0 14px', lineHeight: 1.6 }}>
                {form.tipo_conta === 'candidato'
                  ? 'Este texto alimenta todos os agentes. Quanto mais detalhado, mais preciso o conteúdo gerado.'
                  : 'Descreva sua experiência, os candidatos que gerencia e como trabalha.'}
              </p>
              <textarea
                value={form.bio_politica}
                onChange={e => set('bio_politica', e.target.value)}
                placeholder={form.tipo_conta === 'candidato'
                  ? 'Ex: Sou vereador em Americana/SP buscando reeleição. Minhas pautas são segurança pública, saúde e moradia. Fui eleito em 2020 com 3.800 votos...'
                  : 'Ex: Sou gestor de redes sociais com 3 anos de experiência em campanhas políticas. Atualmente gerencio 2 candidatos a vereador em Campinas/SP...'}
                rows={10}
                style={{ ...inp, resize: 'vertical', minHeight: '240px' }}
              />
              <div style={{ fontSize: 11, color: 'rgba(45,27,110,0.35)', marginTop: 8 }}>
                {form.bio_politica.length} caracteres · Recomendado: 200+
              </div>
            </div>

            {/* Dica */}
            <div style={{ padding: '14px 16px', background: 'rgba(123,79,216,0.06)', borderRadius: 12, border: '1px solid rgba(123,79,216,0.15)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7B4FD8', marginBottom: 4 }}>💡 Dica dos agentes</div>
              <p style={{ fontSize: 12, color: 'rgba(45,27,110,0.55)', margin: 0, lineHeight: 1.6 }}>
                {form.tipo_conta === 'candidato'
                  ? 'Inclua: cargo, cidade, pautas principais, histórico eleitoral, público-alvo e tom de comunicação.'
                  : 'Inclua: quantos candidatos gerencia, em quais cidades, quais cargos e qual é seu estilo de comunicação.'}
              </p>
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <button type="submit" disabled={saving} style={{ padding: '12px 28px', borderRadius: 50, border: 'none', background: saving ? 'rgba(123,79,216,0.4)' : 'linear-gradient(135deg, #7B4FD8, #5B3BAA)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter), sans-serif', boxShadow: saving ? 'none' : '0 4px 16px rgba(123,79,216,0.3)' }}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
          {ok && <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 700 }}>✓ Salvo com sucesso!</span>}
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(45,27,110,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: '#7B4FD8', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(123,79,216,0.15)',
  fontSize: 13, color: '#2D1B6E', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
  fontFamily: 'var(--font-inter), sans-serif',
}
