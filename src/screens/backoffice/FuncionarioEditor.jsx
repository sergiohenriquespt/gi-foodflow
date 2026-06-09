import { useState } from 'react'
import { C } from '../../constants/colors'
import Avatar from '../../components/Avatar'

export default function FuncionarioEditor({form:init,onSave,onCancel}) {
  const [f,setF]=useState({...init})
  const [rfidState,setRfidState]=useState('idle')
  const [saving,setSaving]=useState(false)
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const handleFoto=e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=ev=>set('foto',ev.target.result);r.readAsDataURL(file)}
  const readRfid=async()=>{
    if(!navigator.serial){alert('Requer Chrome ou Edge.');return}
    setRfidState('waiting');let port=null,reader=null,found=false
    try{
      const ports=await navigator.serial.getPorts();port=ports.length>0?ports[0]:await navigator.serial.requestPort()
      try{await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'})}catch(_){try{await port.close()}catch(_){};await new Promise(r=>setTimeout(r,200));await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'})}
      reader=port.readable.getReader();let buf=''
      const tid=setTimeout(()=>reader.cancel().catch(()=>{}),10000)
      try{
        while(true){const{value,done}=await reader.read();if(done)break
          buf+=new TextDecoder().decode(value)
          const pts=buf.split(/\r?\n/);buf=pts.pop()||''
          for(const pt of pts){const uid=pt.replace(/[^\x21-\x7E]/g,'').trim();if(uid.length>=2){clearTimeout(tid);found=true;set('rfid',uid);setRfidState('done');setTimeout(()=>setRfidState('idle'),2500);return}}
          const bc=buf.replace(/[^\x21-\x7E]/g,'').trim();if(bc.length>=4){clearTimeout(tid);found=true;set('rfid',bc);setRfidState('done');setTimeout(()=>setRfidState('idle'),2500);return}
        }
      }finally{clearTimeout(0)}
    }catch(_){}
    finally{if(reader)try{reader.releaseLock()}catch(_){};if(port)try{await port.close()}catch(_){};if(!found){setRfidState('error');setTimeout(()=>setRfidState('idle'),3000)}}
  }
  const iS={flex:1,padding:'8px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:14,background:C.surface3,color:C.text,boxSizing:'border-box'}
  const lS={fontSize:11,fontWeight:700,color:C.textMuted,display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.4}
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:24,maxWidth:500}}>
      <div style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:20}}>{f.id?'Editar Funcionário':'Novo Funcionário'}</div>
      <div style={{display:'flex',gap:20,marginBottom:18,alignItems:'center'}}>
        <div style={{textAlign:'center'}}><Avatar nome={f.nome||'?'} foto={f.foto} size={64}/><label style={{display:'block',marginTop:7,fontSize:12,color:C.yellow,fontWeight:600,cursor:'pointer'}}>Foto<input type="file" accept="image/*" onChange={handleFoto} style={{display:'none'}}/></label></div>
        <div style={{flex:1}}>
          {[{k:'numero',l:'Nº funcionário'},{k:'nome',l:'Nome completo'}].map(({k,l})=>(
            <div key={k} style={{marginBottom:12}}><label style={lS}>{l}</label><input value={f[k]} onChange={e=>set(k,e.target.value)} style={{...iS,flex:'none',width:'100%'}}/></div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:14}}><label style={lS}>PIN (vazio = sem PIN)</label><input type="password" value={f.pin} onChange={e=>set('pin',e.target.value)} style={{...iS,flex:'none',width:'100%'}}/></div>
      <div style={{marginBottom:6}}>
        <label style={lS}>RFID UID</label>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input type="text" value={f.rfid} onChange={e=>set('rfid',e.target.value)} placeholder="ex: 0400150674" style={iS}/>
          <button onClick={readRfid} disabled={rfidState==='waiting'}
            style={{flexShrink:0,height:40,padding:'0 14px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',
              background:rfidState==='done'?C.successBg:rfidState==='error'?C.dangerBg:rfidState==='waiting'?C.surface2:C.yellow+'22',
              border:`1.5px solid ${rfidState==='done'?C.success+'55':rfidState==='error'?C.danger+'55':rfidState==='waiting'?C.border:C.yellow+'55'}`,
              color:rfidState==='done'?C.success:rfidState==='error'?C.danger:rfidState==='waiting'?C.textMuted:C.yellow}}>
            {rfidState==='waiting'?'⏳ Passe o cartão…':rfidState==='done'?'✓ Lido!':rfidState==='error'?'⚠ Erro':'📡 Ler cartão'}
          </button>
        </div>
        {rfidState==='waiting'&&<div style={{marginTop:6,fontSize:12,color:C.warn}}>Aproxime o cartão nos próximos 10 segundos…</div>}
      </div>
      <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:'9px 14px',marginBottom:16,fontSize:12,color:C.textMuted}}>PIN em branco → entra diretamente com o código.</div>
      <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer',marginBottom:20,color:C.textSub}}><input type="checkbox" checked={f.ativo} onChange={e=>set('ativo',e.target.checked)}/> Funcionário ativo</label>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
        <button onClick={onCancel} disabled={saving} style={{padding:'8px 18px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,color:C.textSub}}>Cancelar</button>
        <button onClick={async()=>{setSaving(true);await onSave(f);setSaving(false)}} disabled={saving} style={{padding:'8px 22px',background:C.yellow,border:'none',borderRadius:8,fontSize:14,fontWeight:700,color:C.bg}}>{saving?'A guardar…':'Guardar'}</button>
      </div>
    </div>
  )
}
