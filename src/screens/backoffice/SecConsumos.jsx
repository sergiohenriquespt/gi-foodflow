import { useState } from 'react'
import { C } from '../../constants/colors'
import { FIRST_MONTH, TODAY, fmtS, fmtHM } from '../../utils/date'
import Avatar from '../../components/Avatar'
import PratoTag from '../../components/PratoTag'

const EYE  = {fontSize:11,fontWeight:700,color:'#64748b',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}
const BIG  = {fontStyle:'italic',fontSize:26,color:'#e2e8f0',lineHeight:1}
const COLS = '1fr 120px 95px 105px 72px'
const TH   = {fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.1em'}

export default function SecConsumos({consumos, funcionarios, ementas}) {
  const [fStart, setFStart] = useState(FIRST_MONTH())
  const [fEnd,   setFEnd]   = useState(TODAY)
  const [fMeal,  setFMeal]  = useState('')

  const enriched = consumos.map(c => {
    const fn = funcionarios.find(f => f.id === c.funcionario_id)
    const em = ementas.find(e => e.id === c.ementa_id)
    if (!fn || !em) return null
    const pk = `prato${c.prato_num}`
    return {...c, nome:fn.nome, foto:fn.foto||fn.foto_url, numero:fn.numero, data:em.data, tipo:em.tipo, pratoLabel:em[pk+'_label'], pratoDesc:em[pk+'_desc']}
  }).filter(Boolean)

  const filtered = enriched.filter(c =>
    (!fStart || c.data >= fStart) &&
    (!fEnd   || c.data <= fEnd)   &&
    (!fMeal  || c.tipo === fMeal)
  )
  const sorted = [...filtered].sort((a, b) => new Date(b.validado_em) - new Date(a.validado_em))
  const stats  = {total:filtered.length, a:filtered.filter(c=>c.tipo==='A').length, j:filtered.filter(c=>c.tipo==='J').length}

  const pill = {height:34,padding:'0 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>

      {/* ── Toolbar ── */}
      <div style={{padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>

        {/* Stats */}
        <div style={{display:'flex',alignItems:'center',gap:24}}>
          <div>
            <div style={EYE}>Consumos</div>
            <div style={BIG}>{stats.total}</div>
          </div>
          <div style={{width:1,height:28,background:C.border}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,fontSize:12,color:C.textSub}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
              🌞 <strong style={{color:C.text}}>{stats.a}</strong> almoços
            </span>
            <div style={{width:1,height:14,background:C.border}}/>
            <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
              🌙 <strong style={{color:C.text}}>{stats.j}</strong> jantares
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <input type="date" value={fStart} onChange={e => setFStart(e.target.value)} style={{...pill,width:134}}/>
          <span style={{fontSize:11,color:C.textMuted}}>→</span>
          <input type="date" value={fEnd}   onChange={e => setFEnd(e.target.value)}   style={{...pill,width:134}}/>
          <select value={fMeal} onChange={e => setFMeal(e.target.value)} style={{...pill,width:128}}>
            <option value="">Todas</option>
            <option value="A">Almoço</option>
            <option value="J">Jantar</option>
          </select>
          <button onClick={() => {setFStart(TODAY);setFEnd(TODAY)}}
            style={{...pill,color:C.yellow,border:`1px solid ${C.yellow}44`,background:'transparent',fontWeight:700}}>
            Hoje
          </button>
          <button onClick={() => {setFStart(FIRST_MONTH());setFEnd(TODAY);setFMeal('')}}
            style={{...pill,padding:'0 12px',color:C.textMuted,background:'transparent',border:`1px solid ${C.border}`}}>
            Limpar
          </button>
        </div>

      </div>

      {/* ── Content ── */}
      <div style={{flex:1,overflow:'auto',padding:'20px 24px 24px'}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:'hidden'}}>

          {/* Header */}
          <div style={{display:'grid',gridTemplateColumns:COLS,padding:'10px 18px',gap:14,background:C.surface2,borderBottom:`1px solid ${C.border}`,alignItems:'center'}}>
            {['Funcionário','Data','Refeição','Prato','Hora'].map(h => (
              <div key={h} style={TH}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {sorted.length === 0
            ? <div style={{padding:'44px 0',textAlign:'center',color:C.textMuted,fontSize:13,fontStyle:'italic'}}>
                {consumos.length === 0 ? 'Sem consumos registados.' : 'Sem registos para os filtros aplicados.'}
              </div>
            : sorted.map(c => (
              <div key={c.id}
                onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{display:'grid',gridTemplateColumns:COLS,padding:'10px 18px',gap:14,borderTop:`1px solid ${C.border}`,alignItems:'center',transition:'background 0.1s'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <Avatar nome={c.nome} foto={c.foto} size={30}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.nome}</div>
                    <div style={{fontSize:11,color:C.textMuted}}>Nº {c.numero}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:C.textSub}}>{fmtS(c.data)}</div>
                <div style={{fontSize:13,color:C.textSub}}>{c.tipo === 'A' ? '🌞 Almoço' : '🌙 Jantar'}</div>
                <PratoTag label={c.pratoLabel}/>
                <div style={{fontSize:12,color:C.textMuted,fontFamily:'monospace'}}>{fmtHM(c.validado_em)}</div>
              </div>
            ))
          }
        </div>
      </div>

    </div>
  )
}
