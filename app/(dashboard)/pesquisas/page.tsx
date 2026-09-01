import Link from 'next/link'

const INSTITUTOS = [
  { nome:'Datafolha',   site:'https://datafolha.folha.uol.com.br', desc:'Principal instituto do Brasil, publica mensalmente pesquisas presidenciais e estaduais. Metodologia presencial e telefônica.', cobertura:'Nacional', periodicidade:'Mensal', metodologia:'Presencial + Telefônica' },
  { nome:'Quaest',      site:'https://quaest.com.br',             desc:'Instituto independente com pesquisas rápidas e frequentes. Metodologia telefônica com alto nível de precisão.', cobertura:'Nacional', periodicidade:'Quinzenal', metodologia:'Telefônica' },
  { nome:'AtlasIntel',  site:'https://atlasintel.com.br',         desc:'Pesquisas online com amostras grandes. Referência em pesquisas 2022 — teve ótima precisão na reta final.', cobertura:'Nacional', periodicidade:'Semanal', metodologia:'Online' },
  { nome:'PoderData',   site:'https://poderdata.com.br',          desc:'Instituto do Poder360 com pesquisas presidenciais e estaduais frequentes.', cobertura:'Nacional', periodicidade:'Mensal', metodologia:'Telefônica' },
  { nome:'Paraná Pesquisas', site:'https://paranapesquisas.com.br', desc:'Forte cobertura de pesquisas estaduais e municipais em todo o Brasil.', cobertura:'Estadual/Municipal', periodicidade:'Variável', metodologia:'Presencial' },
  { nome:'MDA',         site:'https://mdapesquisas.com.br',       desc:'Pesquisas regionais com presença em estados do Norte e Nordeste. Importante para candidatos dessas regiões.', cobertura:'Regional', periodicidade:'Variável', metodologia:'Presencial' },
]

const REGRAS_TSE = [
  { titulo:'Registro obrigatório', desc:'Todo instituto deve registrar a pesquisa no TSE antes de divulgá-la publicamente, com metodologia, amostra e contratante.' },
  { titulo:'Prazo de divulgação', desc:'A pesquisa só pode ser divulgada após o registro. O TSE publica os dados abertos para consulta pública.' },
  { titulo:'Identificação do contratante', desc:'O nome de quem contratou a pesquisa é público. Isso permite avaliar possíveis vieses.' },
  { titulo:'Margem de erro', desc:'A margem de erro e o nível de confiança devem ser declarados. Em pesquisas nacionais, costuma ser ±2pp com 95% de confiança.' },
  { titulo:'Proibição pré-eleição', desc:'É proibido divulgar pesquisas nos últimos 5 dias antes da eleição.' },
]

function getDias() {
  const h=new Date(); h.setHours(0,0,0,0)
  return Math.ceil((new Date('2026-10-02').getTime()-h.getTime())/86400000)
}

export default function PesquisasPage() {
  const dias = getDias()
  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 20px', fontFamily:"var(--font-inter),'Inter',sans-serif" }}>

      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:11,color:'#7BA090',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700 }}>Eleições 2026</p>
        <h1 style={{ fontSize:24,fontWeight:800,color:'#091710',margin:'0 0 4px',letterSpacing:'-0.02em' }}>Pesquisas Eleitorais</h1>
        <p style={{ fontSize:13.5,color:'#7BA090',margin:0,lineHeight:1.6 }}>
          Todas as pesquisas eleitorais devem ser registradas no TSE antes de divulgação. Aqui você encontra os principais institutos e como acompanhar os dados oficiais.
        </p>
      </div>

      {/* Banner TSE */}
      <div style={{ background:'linear-gradient(135deg,#054E39,#0A7A56)',borderRadius:16,padding:'20px 24px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,flexWrap:'wrap' }}>
        <div style={{ position:'relative',zIndex:1 }}>
          <p style={{ fontSize:11,color:'rgba(255,255,255,0.5)',margin:'0 0 4px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em' }}>Portal oficial</p>
          <h2 style={{ fontSize:18,fontWeight:800,color:'#fff',margin:'0 0 4px',letterSpacing:'-0.01em' }}>TSE — DivulgaCandContas</h2>
          <p style={{ fontSize:13,color:'rgba(255,255,255,0.6)',margin:0 }}>Consulte todas as pesquisas registradas em tempo real</p>
        </div>
        <div style={{ display:'flex',gap:10,alignItems:'center',flexWrap:'wrap' }}>
          <div style={{ textAlign:'center',background:'rgba(255,255,255,0.08)',borderRadius:12,padding:'12px 18px',border:'1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize:32,fontWeight:800,color:'#5DFFC0',letterSpacing:'-0.04em',lineHeight:1 }}>{dias}</div>
            <div style={{ fontSize:10,color:'rgba(255,255,255,0.45)',marginTop:3,fontWeight:600 }}>dias p/ 1º turno</div>
          </div>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/pesquisas-eleitorais" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'12px 20px',background:'#5DFFC0',color:'#054E39',borderRadius:50,fontSize:13,fontWeight:800,textDecoration:'none' }}>
            Acessar TSE
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>

      {/* Grid: Institutos + Regras */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr',gap:16,marginBottom:20 }}>

        {/* Institutos */}
        <div>
          <h2 style={{ fontSize:14,fontWeight:700,color:'#091710',margin:'0 0 12px',letterSpacing:'-0.01em' }}>Principais institutos registrados</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10 }}>
            {INSTITUTOS.map(inst => (
              <a key={inst.nome} href={inst.site} target="_blank" rel="noopener noreferrer" style={{ display:'block',textDecoration:'none',background:'#fff',borderRadius:13,border:'1px solid #D4E8DC',padding:'14px 16px',transition:'box-shadow .14s,transform .14s' }}
                onMouseOver={e=>{(e.currentTarget as HTMLAnchorElement).style.boxShadow='0 6px 20px rgba(14,164,114,0.12)';(e.currentTarget as HTMLAnchorElement).style.transform='translateY(-2px)'}}
                onMouseOut={e=>{(e.currentTarget as HTMLAnchorElement).style.boxShadow='none';(e.currentTarget as HTMLAnchorElement).style.transform='none'}}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                  <span style={{ fontSize:14,fontWeight:800,color:'#091710' }}>{inst.nome}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A8C4B8" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
                <p style={{ fontSize:12.5,color:'#7BA090',margin:'0 0 10px',lineHeight:1.55 }}>{inst.desc}</p>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                  {[inst.cobertura,inst.periodicidade,inst.metodologia].map(tag=>(
                    <span key={tag} style={{ fontSize:10.5,fontWeight:600,padding:'2px 8px',borderRadius:20,background:'rgba(14,164,114,0.08)',color:'#0EA472' }}>{tag}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Regras TSE */}
        <div style={{ background:'#fff',border:'1px solid #D4E8DC',borderRadius:14,padding:'16px' }}>
          <h2 style={{ fontSize:14,fontWeight:700,color:'#091710',margin:'0 0 14px',letterSpacing:'-0.01em' }}>Como funcionam as pesquisas eleitorais</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {REGRAS_TSE.map((r,i) => (
              <div key={i} style={{ display:'flex',gap:12,padding:'10px 12px',background:'#FAFCFB',borderRadius:10,border:'1px solid #E6F3EB' }}>
                <div style={{ width:24,height:24,borderRadius:7,background:'rgba(14,164,114,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,fontWeight:800,color:'#0EA472' }}>{i+1}</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:'#091710',marginBottom:3 }}>{r.titulo}</div>
                  <div style={{ fontSize:12.5,color:'#7BA090',lineHeight:1.55 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'rgba(14,164,114,0.06)',border:'1px solid rgba(14,164,114,0.15)',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
        <div>
          <p style={{ fontSize:14,fontWeight:700,color:'#091710',margin:'0 0 3px' }}>Use as pesquisas a seu favor</p>
          <p style={{ fontSize:13,color:'#7BA090',margin:0 }}>Gere conteúdo estratégico baseado nos dados eleitorais com os agentes de IA.</p>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          <Link href="/agentes/estrategista" style={{ padding:'10px 20px',background:'linear-gradient(135deg,#0EA472,#054E39)',color:'#fff',borderRadius:50,fontSize:13,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 14px rgba(14,164,114,0.3)',whiteSpace:'nowrap' }}>
            Estrategista →
          </Link>
          <Link href="/agentes/copy" style={{ padding:'10px 20px',background:'transparent',color:'#0EA472',borderRadius:50,fontSize:13,fontWeight:700,textDecoration:'none',border:'1.5px solid #0EA472',whiteSpace:'nowrap' }}>
            Copy Político
          </Link>
        </div>
      </div>
    </div>
  )
}
