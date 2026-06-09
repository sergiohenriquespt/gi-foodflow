import { useState } from 'react'
import { C } from '../../constants/colors'
import { fmtF } from '../../utils/date'

export default function EmentaEditor({ementa,onSave,onCancel,saving}) {
  const [f,setF]=useState({...ementa})
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const iS={padding:'9px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:14,background:C.surface3,color:C.text}
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:22,maxWidth:580}}>
      <div style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:18}}>{f.tipo==='A'?'🌞 Almoço':'🌙 Jantar'} · {fmtF(f.data)}</div>
      {[1,2,3,4].map(n=>(
        <div key={n} style={{marginBottom:12,padding:12,background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,marginBottom:7,textTransform:'uppercase',letterSpacing:.5}}>Prato {n} — tipo em branco oculta o slot</div>
          <div style={{display:'flex',gap:8}}>
            <input value={f[`prato${n}_label`]} onChange={e=>set(`prato${n}_label`,e.target.value)} placeholder="Tipo (ex: Carne)" style={{...iS,width:140,flexShrink:0}}/>
            <input value={f[`prato${n}_desc`]}  onChange={e=>set(`prato${n}_desc`, e.target.value)} placeholder="Descrição do prato"  style={{...iS,flex:1}}/>
          </div>
        </div>
      ))}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:6}}>
        <button onClick={onCancel} disabled={saving} style={{padding:'9px 18px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,color:C.textSub}}>Cancelar</button>
        <button onClick={()=>onSave(f)} disabled={saving} style={{padding:'9px 22px',background:C.yellow,border:'none',borderRadius:8,fontSize:14,fontWeight:700,color:C.bg}}>{saving?'A guardar…':'Guardar'}</button>
      </div>
    </div>
  )
}
