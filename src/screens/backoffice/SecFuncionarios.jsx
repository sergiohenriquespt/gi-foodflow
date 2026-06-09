import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { C } from '../../constants/colors'
import Avatar from '../../components/Avatar'
import FuncionarioEditor from './FuncionarioEditor'

export default function SecFuncionarios({funcionarios,reload}) {
  const [editing,setEditing]=useState(null)
  const blank={id:null,numero:'',nome:'',pin:'',rfid:'',foto:null,ativo:true}
  const save=async form=>{const row={numero:form.numero,nome:form.nome,pin:form.pin,rfid:form.rfid,foto_url:form.foto,ativo:form.ativo};if(form.id)await supabase.from('cantina_funcionarios').update(row).eq('id',form.id);else await supabase.from('cantina_funcionarios').insert(row);await reload();setEditing(null)}
  const del=async id=>{if(!window.confirm('Eliminar funcionário?'))return;await supabase.from('cantina_funcionarios').delete().eq('id',id);await reload()}
  if(editing!==null)return<FuncionarioEditor form={editing} onSave={save} onCancel={()=>setEditing(null)}/>
  const thS={padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase'}
  const tdS={padding:'11px 14px',borderTop:`1px solid ${C.border}`}
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:14,color:C.textSub}}>{funcionarios.length} funcionário(s)</div>
        <button onClick={()=>setEditing(blank)} style={{padding:'8px 18px',background:C.yellow+'22',border:`1px solid ${C.yellow}55`,borderRadius:8,color:C.yellow,fontSize:14,fontWeight:600}}>+ Novo</button>
      </div>
      <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:C.surface2}}>{['Nº','Funcionário','PIN','RFID','Estado',''].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{funcionarios.map(f=>(
            <tr key={f.id}>
              <td style={{...tdS,fontSize:13,color:C.textSub}}>{f.numero}</td>
              <td style={tdS}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={f.nome} foto={f.foto} size={26}/><span style={{fontSize:15,fontWeight:500,color:C.text}}>{f.nome}</span></div></td>
              <td style={{...tdS,fontFamily:'monospace',fontSize:13,color:C.textMuted}}>{f.pin?'•'.repeat(f.pin.length):<span style={{fontStyle:'italic',fontSize:11}}>sem PIN</span>}</td>
              <td style={{...tdS,fontFamily:'monospace',fontSize:13,color:C.textSub}}>{f.rfid}</td>
              <td style={tdS}><span style={{fontSize:11,padding:'3px 9px',borderRadius:4,background:f.ativo?C.successBg:C.surface2,color:f.ativo?C.success:C.textMuted,border:`1px solid ${f.ativo?C.success+'33':C.border}`,fontWeight:700}}>{f.ativo?'Ativo':'Inativo'}</span></td>
              <td style={tdS}><div style={{display:'flex',gap:5}}>
                <button onClick={()=>setEditing({...f})} style={{fontSize:11,padding:'4px 10px',background:C.yellow+'22',border:`1px solid ${C.yellow}44`,borderRadius:6,fontWeight:600,color:C.yellow}}>Editar</button>
                <button onClick={()=>del(f.id)} style={{fontSize:11,padding:'4px 10px',background:C.dangerBg,border:`1px solid ${C.danger}33`,borderRadius:6,color:C.danger}}>✕</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
