'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const CARGOS = ['Vereador(a)', 'Deputado(a) Estadual', 'Deputado(a) Federal', 'Senador(a)', 'Governador(a)', 'Presidente']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function PerfilPage() {
  const supabase = createClient()
  const [form, setForm] = useState({ nome: '', cargo: '', cidade: '', estado: '', partido: '', instagram: '', bio_politica: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setForm({
          nome: data.nome ?? '',
          cargo: data.cargo ?? '',
          cidade: data.cidade ?? '',
          estado: data.estado ?? '',
          partido: data.partido ?? '',
          instagram: data.instagram ?? '',
          bio_politica: data.bio_politica ?? '',
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

  if (loading) return <div style={{ padding: '48px', color: '#8A8A9A' }}>Carregando...</div>

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', marginBottom: '6px' }}>Meu perfil</h1>
      <p style={{ fontSize: '14px', color: '#8A8A9A', marginBottom: '32px' }}>
        Quanto mais completo, mais preciso será o conteúdo gerado pelos agentes.
      </p>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={lbl}>Nome completo <span style={{ color: '#C9A84C' }}>*</span></label>
          <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="João Silva" required style={inp} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={lbl}>Cargo disputado</label>
          <select value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} style={inp}>
            <option value="">Selecione...</option>
            {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Cidade</label>
            <input value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} placeholder="Campinas" style={inp} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Estado</label>
            <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} style={inp}>
              <option value="">UF</option>
              {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={lbl}>Partido</label>
          <input value={form.partido} onChange={e => setForm(p => ({ ...p, partido: e.target.value }))} placeholder="PT, PL, MDB..." style={inp} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={lbl}>Instagram</label>
          <input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@seucandidato" style={inp} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={lbl}>Contexto da campanha</label>
          <span style={{ fontSize: '12px', color: '#8A8A9A' }}>Este texto alimenta todos os agentes. Seja específico.</span>
          <textarea
            value={form.bio_politica}
            onChange={e => setForm(p => ({ ...p, bio_politica: e.target.value }))}
            placeholder="Ex: Sou vereador em Campinas buscando reeleição. Minhas pautas são segurança pública, educação e geração de empregos. Fui eleito em 2020 com 4.200 votos..."
            rows={5}
            style={{ ...inp, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="submit" disabled={saving} style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: saving ? '#8A8A9A' : '#1A1A2E', color: '#E8D5A3', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
          {ok && <span style={{ fontSize: '13px', color: '#1D9E75', fontWeight: 500 }}>Salvo com sucesso!</span>}
        </div>
      </form>
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#4A4A5A' }
const inp: React.CSSProperties = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #E8E0D0', fontSize: '14px', color: '#1A1A2E', background: '#fff', width: '100%', boxSizing: 'border-box', outline: 'none' }
