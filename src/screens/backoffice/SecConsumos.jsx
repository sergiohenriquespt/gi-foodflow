import { useState } from 'react'
import { C } from '../../constants/colors'
import { FIRST_MONTH, TODAY, fmtS, fmtHM } from '../../utils/date'
import Avatar from '../../components/Avatar'
import PratoTag from '../../components/PratoTag'
import Icon from '../../components/Icon'

const EYE  = {fontSize:11,fontWeight:700,color:'#64748b',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}
const BIG  = {fontStyle:'italic',fontSize:26,color:'#e2e8f0',lineHeight:1}
const COLS = '1fr 120px 95px 105px 60px 72px'
const TH   = {fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.1em'}

function StatCard({label, value}) {
  return (
    <div style={{flex:1,minWidth:100,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:12,padding:'10px 16px'}}>
      <div style={EYE}>{label}</div>
      <div style={BIG}>{value}</div>
    </div>
  )
}

export default function SecConsumos({consumos, visitantes=[], funcionarios, ementas}) {
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

  const enrichedVisitantes = visitantes.map(v => {
    const em = ementas.find(e => e.id === v.ementa_id)
    if (!em) return null
    const pk = `prato${v.prato_num}`
    return {...v, data:em.data, tipo:em.tipo, pratoLabel:em[pk+'_label']}
  }).filter(Boolean)

  const filteredVisitantes = enrichedVisitantes.filter(v =>
    (!fStart || v.data >= fStart) &&
    (!fEnd   || v.data <= fEnd)   &&
    (!fMeal  || v.tipo === fMeal)
  )

  const sorted = [
    ...filtered.map(c => ({key:`c-${c.id}`, ts:c.validado_em, data:c.data, tipo:c.tipo, pratoLabel:c.pratoLabel, quantidade:1, nome:c.nome, foto:c.foto, numero:c.numero})),
    ...filteredVisitantes.map(v => ({key:`v-${v.id}`, ts:v.registado_em, data:v.data, tipo:v.tipo, pratoLabel:v.pratoLabel, quantidade:v.quantidade})),
  ].sort((a, b) => new Date(b.ts) - new Date(a.ts))

  const visQtd  = tipo => filteredVisitantes.filter(v => !tipo || v.tipo === tipo).reduce((s,v)=>s+v.quantidade,0)
  const funcQtd = tipo => filtered.filter(c => !tipo || c.tipo === tipo).length

  const stats = {
    total: funcQtd() + visQtd(),
    a: funcQtd('A') + visQtd('A'),
    j: funcQtd('J') + visQtd('J'),
    funcionarios: funcQtd(),
    visitantes: visQtd(),
  }

  const pill = {height:34,padding:'0 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>

      {/* ── Toolbar ── */}
      <div style={{padding:'14px 32px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:24,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>

        {/* Stats */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{display:'flex',gap:8}}>
            <StatCard label="Total" value={stats.total}/>
            <StatCard label="🌞 Almoços" value={stats.a}/>
            <StatCard label="🌙 Jantares" value={stats.j}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <StatCard label="Funcionários" value={stats.funcionarios}/>
            <StatCard label="Visitantes" value={stats.visitantes}/>
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
            {['Funcionário','Data','Refeição','Prato','Qtd','Hora'].map(h => (
              <div key={h} style={TH}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {sorted.length === 0
            ? <div style={{padding:'44px 0',textAlign:'center',color:C.textMuted,fontSize:13,fontStyle:'italic'}}>
                {consumos.length === 0 && visitantes.length === 0 ? 'Sem consumos registados.' : 'Sem registos para os filtros aplicados.'}
              </div>
            : sorted.map(c => (
              <div key={c.key}
                onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{display:'grid',gridTemplateColumns:COLS,padding:'10px 18px',gap:14,borderTop:`1px solid ${C.border}`,alignItems:'center',transition:'background 0.1s'}}>
                {c.nome
                  ? <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <Avatar nome={c.nome} foto={c.foto} size={30}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.nome}</div>
                        <div style={{fontSize:11,color:C.textMuted}}>Nº {c.numero}</div>
                      </div>
                    </div>
                  : <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:30,height:30,borderRadius:'50%',background:C.surface2,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Icon name="users" size={15} color={C.textMuted}/>
                      </div>
                      <div style={{fontSize:13,fontStyle:'italic',color:C.textSub}}>Visitante(s)</div>
                    </div>
                }
                <div style={{fontSize:12,color:C.textSub}}>{fmtS(c.data)}</div>
                <div style={{fontSize:13,color:C.textSub}}>{c.tipo === 'A' ? '🌞 Almoço' : '🌙 Jantar'}</div>
                <PratoTag label={c.pratoLabel}/>
                <div style={{fontSize:c.nome?12:15,fontWeight:c.nome?400:800,color:c.nome?C.textMuted:C.yellow,fontFamily:c.nome?'monospace':'inherit'}}>{c.quantidade}</div>
                <div style={{fontSize:12,color:C.textMuted,fontFamily:'monospace'}}>{fmtHM(c.ts)}</div>
              </div>
            ))
          }
        </div>
      </div>

    </div>
  )
}
