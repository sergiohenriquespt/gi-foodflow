import { useState } from 'react'
import { C } from '../../constants/colors'
import { FIRST_MONTH, TODAY, fmtS, fmtHM } from '../../utils/date'
import Avatar from '../../components/Avatar'
import PratoTag from '../../components/PratoTag'

export default function SecConsumos({consumos,funcionarios,ementas}) {
  const [fStart,setFStart]=useState(FIRST_MONTH())
  const [fEnd,  setFEnd]  =useState(TODAY)
  const [fMeal, setFMeal] =useState('')
  const enriched=consumos.map(c=>{
    const fn=funcionarios.find(f=>f.id===c.funcionario_id),em=ementas.find(e=>e.id===c.ementa_id)
    if(!fn||!em)return null
    const pk=`prato${c.prato_num}`
    return{...c,nome:fn.nome,foto:fn.foto,numero:fn.numero,data:em.data,tipo:em.tipo,pratoLabel:em[pk+'_label'],pratoDesc:em[pk+'_desc']}
  }).filter(Boolean)
  const filtered=enriched.filter(c=>(!fStart||c.data>=fStart)&&(!fEnd||c.data<=fEnd)&&(!fMeal||c.tipo===fMeal))
  const stats={total:filtered.length,a:filtered.filter(c=>c.tipo==='A').length,j:filtered.filter(c=>c.tipo==='J').length}
  const iS={padding:'7px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,background:C.surface3,color:C.text}
  const thS={padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase'}
  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
        {[{l:'Total',v:stats.total},{l:'Almoços',v:stats.a},{l:'Jantares',v:stats.j}].map(s=>(
          <div key={s.l} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14,textAlign:'center'}}>
            <div style={{fontSize:34,fontWeight:700,color:C.yellow}}>{s.v}</div>
            <div style={{fontSize:13,color:C.textSub,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:12,color:C.textMuted}}>De</label><input type="date" value={fStart} onChange={e=>setFStart(e.target.value)} style={iS}/></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:12,color:C.textMuted}}>Até</label><input type="date" value={fEnd} onChange={e=>setFEnd(e.target.value)} style={iS}/></div>
        <button onClick={()=>{setFStart(TODAY);setFEnd(TODAY)}} style={{padding:'7px 14px',background:C.yellow+'22',border:`1px solid ${C.yellow}55`,borderRadius:6,fontSize:12,color:C.yellow,fontWeight:600}}>Hoje</button>
        <select value={fMeal} onChange={e=>setFMeal(e.target.value)} style={iS}><option value="">Todas as refeições</option><option value="A">Almoço</option><option value="J">Jantar</option></select>
        <button onClick={()=>{setFStart(FIRST_MONTH());setFEnd(TODAY);setFMeal('')}} style={{padding:'7px 10px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:6,fontSize:11,color:C.textSub}}>Limpar</button>
      </div>
      <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
        {filtered.length===0?<div style={{padding:36,textAlign:'center',color:C.textMuted,fontSize:13}}>{consumos.length===0?'Sem consumos registados.':'Sem registos para o filtro.'}</div>
        :<table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:C.surface2}}>{['Funcionário','Data','Refeição','Prato','Hora'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{[...filtered].sort((a,b)=>new Date(b.validado_em)-new Date(a.validado_em)).map(c=>(
            <tr key={c.id} style={{borderTop:`1px solid ${C.border}`}}>
              <td style={{padding:'8px 14px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={c.nome} foto={c.foto} size={24}/><div><div style={{fontSize:14,fontWeight:500,color:C.text}}>{c.nome}</div><div style={{fontSize:11,color:C.textMuted}}>{c.numero}</div></div></div></td>
              <td style={{padding:'8px 14px',fontSize:13,color:C.textSub}}>{fmtS(c.data)}</td>
              <td style={{padding:'8px 14px',fontSize:14,color:C.textSub}}>{c.tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</td>
              <td style={{padding:'8px 14px'}}><PratoTag label={c.pratoLabel}/></td>
              <td style={{padding:'8px 14px',fontSize:13,color:C.textMuted}}>{fmtHM(c.validado_em)}</td>
            </tr>
          ))}</tbody>
        </table>}
      </div>
    </div>
  )
}
