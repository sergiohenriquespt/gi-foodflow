import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { C } from '../../constants/colors'
import { ps } from '../../constants/pratos'
import { WD, MN, fmtF, TODAY, addD } from '../../utils/date'
import EmentaEditor from './EmentaEditor'

export default function SecEmentas({ementas,reload}) {
  const [selD,setSelD]=[useState(TODAY)[0],useState(TODAY)[1]]
  const [editing,setEditing]=useState(null)
  const [saving,setSaving]=useState(false)
  const [selDay,setSelDay]=useState(TODAY)
  const dates=Array.from({length:14},(_,i)=>addD(TODAY,i))
  const dayEm=ementas.filter(e=>e.data===selDay)
  const add=tipo=>setEditing({id:null,data:selDay,tipo,prato1_label:'Carne',prato1_desc:'',prato2_label:'Peixe',prato2_desc:'',prato3_label:'Dieta',prato3_desc:'',prato4_label:'Vegetariano',prato4_desc:''})
  const save=async e=>{setSaving(true);const{id,foto,...row}=e;if(e.id)await supabase.from('cantina_ementas').update(row).eq('id',e.id);else await supabase.from('cantina_ementas').insert(row);await reload();setSaving(false);setEditing(null)}
  const del=async id=>{if(!window.confirm('Eliminar ementa?'))return;await supabase.from('cantina_ementas').delete().eq('id',id);await reload()}
  if(editing)return <EmentaEditor ementa={editing} onSave={save} onCancel={()=>setEditing(null)} saving={saving}/>
  return (
    <div style={{display:'flex',gap:18}}>
      <div style={{width:175,flexShrink:0}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:1,marginBottom:8,paddingLeft:12}}>14 dias</div>
        {dates.map(d=>{const dd=new Date(d+'T12:00:00'),isT=d===TODAY,hasEm=ementas.some(e=>e.data===d);return(
          <button key={d} onClick={()=>setSelDay(d)} style={{width:'100%',padding:'10px 12px',textAlign:'left',background:selDay===d?C.yellow+'12':C.surface,border:'none',borderLeft:selDay===d?`3px solid ${C.yellow}`:'3px solid transparent',marginBottom:1,borderRadius:'0 6px 6px 0'}}>
            <div style={{fontSize:13,fontWeight:700,color:isT?C.yellow:C.text}}>{isT?'HOJE':WD[dd.getDay()].toUpperCase()}</div>
            <div style={{fontSize:12,color:C.textSub}}>{dd.getDate()} {MN[dd.getMonth()]}</div>
            {hasEm&&<div style={{fontSize:11,color:C.success,marginTop:1}}>● ementa</div>}
          </button>
        )})}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:17,fontWeight:600,color:C.text,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          {fmtF(selDay)}{selDay===TODAY&&<span style={{background:C.yellow+'22',color:C.yellow,border:`1px solid ${C.yellow}44`,fontSize:11,padding:'2px 7px',borderRadius:4,fontWeight:700}}>HOJE</span>}
        </div>
        {['A','J'].map(tipo=>{const em=dayEm.find(e=>e.tipo===tipo);return(
          <div key={tipo} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:em?10:0}}>
              <span style={{fontSize:16,fontWeight:600,color:C.text}}>{tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</span>
              <div style={{display:'flex',gap:6}}>
                {em?(<>
                  <button onClick={()=>setEditing({...em})} style={{fontSize:13,padding:'5px 12px',background:C.yellow+'22',border:`1px solid ${C.yellow}55`,borderRadius:6,fontWeight:600,color:C.yellow}}>Editar</button>
                  <button onClick={()=>del(em.id)} style={{fontSize:13,padding:'5px 12px',background:C.dangerBg,border:`1px solid ${C.danger}33`,borderRadius:6,color:C.danger}}>Remover</button>
                </>):<button onClick={()=>add(tipo)} style={{fontSize:13,padding:'5px 14px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:6,color:C.textSub}}>+ Adicionar ementa</button>}
              </div>
            </div>
            {em&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
              {[1,2,3,4].map(n=>{const l=em[`prato${n}_label`],d=em[`prato${n}_desc`];
                if(!l)return<div key={n} style={{background:C.surface2,borderRadius:6,padding:'8px 10px',border:`1px dashed ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:13,color:C.textMuted}}>Slot {n} vazio</span></div>
                const p=ps(l);return<div key={n} style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:6,padding:'8px 10px'}}><div style={{fontSize:13,fontWeight:700,color:p.color}}>{l}</div><div style={{fontSize:14,color:C.textSub,marginTop:2}}>{d||<span style={{color:C.textMuted,fontStyle:'italic'}}>sem descrição</span>}</div></div>
              })}
            </div>}
          </div>
        )})}
      </div>
    </div>
  )
}
