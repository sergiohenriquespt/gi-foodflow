import { useState } from 'react'
import { C } from '../../constants/colors'
import { FIRST_MONTH, TODAY, fmtS } from '../../utils/date'
import Avatar from '../../components/Avatar'
import PratoTag from '../../components/PratoTag'

export default function SecMarcacoes({marcacoes,funcionarios,ementas}) {
  const [fStart,setFStart]=useState(FIRST_MONTH())
  const [fEnd,  setFEnd]  =useState(TODAY)
  const [fMeal, setFMeal] =useState('')
  const [view,  setView]  =useState('funcionario') // 'funcionario'|'refeicao'
  const enriched=marcacoes.map(m=>{
    const fn=funcionarios.find(f=>f.id===m.funcionario_id),em=ementas.find(e=>e.id===m.ementa_id)
    if(!fn||!em)return null
    const pk=`prato${m.prato_num}`
    return{...m,nome:fn.nome,foto:fn.foto,numero:fn.numero,data:em.data,tipo:em.tipo,pratoLabel:em[pk+'_label'],pratoDesc:em[pk+'_desc']}
  }).filter(Boolean)
  const filtered=enriched.filter(m=>(!fStart||m.data>=fStart)&&(!fEnd||m.data<=fEnd)&&(!fMeal||m.tipo===fMeal))
  const stats={total:filtered.length,a:filtered.filter(m=>m.tipo==='A').length,j:filtered.filter(m=>m.tipo==='J').length}
  const iS={padding:'7px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,background:C.surface3,color:C.text}
  const thS={padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase'}
  const byFunc=[...filtered].sort((a,b)=>a.nome.localeCompare(b.nome,'pt')||(a.data<b.data?-1:1))
  const sortDate=(arr)=>[...arr].sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:a.nome.localeCompare(b.nome,'pt'))
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
        <div style={{marginLeft:'auto',display:'flex',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
          {[{k:'funcionario',l:'Por funcionário'},{k:'refeicao',l:'Por refeição'}].map(o=>(
            <button key={o.k} onClick={()=>setView(o.k)} style={{padding:'7px 14px',fontSize:12,fontWeight:view===o.k?600:400,background:view===o.k?C.yellow+'22':'transparent',color:view===o.k?C.yellow:C.textSub,border:'none',borderRight:o.k==='funcionario'?`1px solid ${C.border}`:'none'}}>{o.l}</button>
          ))}
        </div>
      </div>
      {view==='funcionario'&&(
        <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
          {byFunc.length===0?<div style={{padding:36,textAlign:'center',color:C.textMuted,fontSize:13}}>Sem marcações.</div>
          :<table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:C.surface2}}>{['Funcionário','Data','Refeição','Prato','Descrição'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
            <tbody>{byFunc.map((m,i)=>(
              <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:'8px 14px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={m.nome} foto={m.foto} size={22}/><span style={{fontSize:13,fontWeight:500,color:C.text}}>{m.nome}</span></div></td>
                <td style={{padding:'8px 14px',fontSize:13,color:C.textSub}}>{fmtS(m.data)}</td>
                <td style={{padding:'8px 14px',fontSize:13,color:C.textSub}}>{m.tipo==='A'?'🌞':'🌙'}</td>
                <td style={{padding:'8px 14px'}}><PratoTag label={m.pratoLabel}/></td>
                <td style={{padding:'8px 14px',fontSize:13,color:C.textSub}}>{m.pratoDesc}</td>
              </tr>
            ))}</tbody>
          </table>}
        </div>
      )}
      {view==='refeicao'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[{tipo:'A',label:'🌞 Almoço'},{tipo:'J',label:'🌙 Jantar'}].map(({tipo,label})=>{
            if(fMeal&&fMeal!==tipo) return null
            const rows=sortDate(filtered.filter(m=>m.tipo===tipo))
            return(
              <div key={tipo} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
                <div style={{padding:'12px 16px',background:C.surface2,borderBottom:`1px solid ${C.border}`,fontSize:15,fontWeight:600,color:C.text,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span>{label}</span><span style={{fontSize:12,color:C.textMuted,fontWeight:400}}>{rows.length} marcaç{rows.length!==1?'ões':'ão'}</span>
                </div>
                {rows.length===0?<div style={{padding:24,textAlign:'center',color:C.textMuted,fontSize:13}}>Sem marcações</div>
                :<table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:C.surface2}}>{['Funcionário','Data','Prato'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>{rows.map((m,i)=>(
                    <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                      <td style={{padding:'8px 14px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={m.nome} foto={m.foto} size={22}/><span style={{fontSize:13,fontWeight:500,color:C.text}}>{m.nome}</span></div></td>
                      <td style={{padding:'8px 14px',fontSize:12,color:C.textSub}}>{fmtS(m.data)}</td>
                      <td style={{padding:'8px 14px'}}><PratoTag label={m.pratoLabel}/></td>
                    </tr>
                  ))}</tbody>
                </table>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
