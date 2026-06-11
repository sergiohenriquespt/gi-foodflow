import { useState } from 'react'
import { C } from '../../constants/colors'
import Icon from '../../components/Icon'
import Avatar from '../../components/Avatar'

const EYE = {fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:4}
const iS  = {flex:1,padding:'9px 12px',borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,background:C.surface3,color:C.text,boxSizing:'border-box',outline:'none',width:'100%'}
const lS  = {fontSize:11,fontWeight:700,color:C.textMuted,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.08em'}

export default function FuncionarioEditor({form:init, onSave, onCancel}) {
  const [f,         setF]         = useState({...init})
  const [rfidState, setRfidState] = useState('idle')
  const [saving,    setSaving]    = useState(false)
  const set = (k, v) => setF(p => ({...p, [k]: v}))

  const handleFoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = ev => set('foto', ev.target.result)
    r.readAsDataURL(file)
  }

  const readRfid = async () => {
    if (!navigator.serial) { alert('Requer Chrome ou Edge.'); return }
    setRfidState('waiting'); let port = null, reader = null, found = false
    try {
      const ports = await navigator.serial.getPorts()
      port = ports.length > 0 ? ports[0] : await navigator.serial.requestPort()
      try { await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'}) }
      catch(_) { try{await port.close()}catch(_){}; await new Promise(r=>setTimeout(r,200)); await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'}) }
      reader = port.readable.getReader(); let buf = ''
      const tid = setTimeout(() => reader.cancel().catch(()=>{}), 10000)
      try {
        while (true) {
          const {value, done} = await reader.read()
          if (done) break
          buf += new TextDecoder().decode(value)
          const pts = buf.split(/\r?\n/); buf = pts.pop() || ''
          for (const pt of pts) {
            const uid = pt.replace(/[^\x21-\x7E]/g,'').trim()
            if (uid.length >= 2) { clearTimeout(tid); found = true; set('rfid', uid); setRfidState('done'); setTimeout(()=>setRfidState('idle'),2500); return }
          }
          const bc = buf.replace(/[^\x21-\x7E]/g,'').trim()
          if (bc.length >= 4) { clearTimeout(tid); found = true; set('rfid', bc); setRfidState('done'); setTimeout(()=>setRfidState('idle'),2500); return }
        }
      } finally { clearTimeout(0) }
    } catch(_) {}
    finally {
      if (reader) try{reader.releaseLock()}catch(_){}
      if (port)   try{await port.close()}catch(_){}
      if (!found) { setRfidState('error'); setTimeout(()=>setRfidState('idle'),3000) }
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div>
          <div style={EYE}>{f.id ? 'Editar funcionário' : 'Novo funcionário'}</div>
          <div style={{fontStyle:'italic',fontSize:22,color:C.text,lineHeight:1}}>
            {f.nome || <span style={{color:C.textMuted}}>Nome do funcionário</span>}
          </div>
        </div>
        <button onClick={onCancel} style={{background:'transparent',border:'none',color:C.textMuted,cursor:'pointer',padding:8}}>
          <Icon name="x" size={20} color={C.textMuted}/>
        </button>
      </div>

      {/* Avatar + base fields */}
      <div style={{display:'flex',gap:20,marginBottom:16,alignItems:'center'}}>
        <div style={{textAlign:'center',flexShrink:0}}>
          <Avatar nome={f.nome || '?'} foto={f.foto} size={60}/>
          <label style={{display:'block',marginTop:7,fontSize:11,color:C.yellow,fontWeight:700,cursor:'pointer',letterSpacing:'0.06em',textTransform:'uppercase'}}>
            Foto
            <input type="file" accept="image/*" onChange={handleFoto} style={{display:'none'}}/>
          </label>
        </div>
        <div style={{flex:1}}>
          <div style={{marginBottom:10}}>
            <label style={lS}>Nº funcionário</label>
            <input value={f.numero} onChange={e => set('numero', e.target.value)} style={iS}/>
          </div>
          <div>
            <label style={lS}>Nome completo</label>
            <input value={f.nome} onChange={e => set('nome', e.target.value)} style={iS}/>
          </div>
        </div>
      </div>

      {/* PIN */}
      <div style={{marginBottom:12}}>
        <label style={lS}>PIN (vazio = sem PIN)</label>
        <input type="password" value={f.pin} onChange={e => set('pin', e.target.value)} style={iS}/>
      </div>

      {/* RFID */}
      <div style={{marginBottom:6}}>
        <label style={lS}>RFID UID</label>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input type="text" value={f.rfid} onChange={e => set('rfid', e.target.value)}
            placeholder="ex: 0400150674" style={iS}/>
          <button onClick={readRfid} disabled={rfidState === 'waiting'}
            style={{flexShrink:0,height:38,padding:'0 14px',borderRadius:99,fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',transition:'all 0.15s',
              background: rfidState==='done'   ? C.successBg
                        : rfidState==='error'  ? C.dangerBg
                        : rfidState==='waiting'? C.surface2
                        : `${C.yellow}18`,
              border: `1.5px solid ${rfidState==='done'?C.success+'55':rfidState==='error'?C.danger+'55':rfidState==='waiting'?C.border:C.yellow+'55'}`,
              color:  rfidState==='done'   ? C.success
                    : rfidState==='error'  ? C.danger
                    : rfidState==='waiting'? C.textMuted
                    : C.yellow}}>
            {rfidState==='waiting' ? 'Aguardar cartão…' : rfidState==='done' ? '✓ Lido!' : rfidState==='error' ? 'Erro — repetir' : 'Ler cartão RFID'}
          </button>
        </div>
        {rfidState === 'waiting' && (
          <div style={{marginTop:5,fontSize:12,color:C.warn}}>Aproxime o cartão nos próximos 10 segundos…</div>
        )}
      </div>

      {/* Info hint */}
      <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px',marginBottom:16,marginTop:10,fontSize:12,color:C.textMuted}}>
        PIN em branco → o funcionário entra diretamente com o código.
      </div>

      {/* Active toggle */}
      <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,cursor:'pointer',marginBottom:22,color:C.textSub}}>
        <input type="checkbox" checked={f.ativo} onChange={e => set('ativo', e.target.checked)}/>
        Funcionário ativo
      </label>

      {/* Buttons */}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
        <button onClick={onCancel} disabled={saving}
          style={{height:40,padding:'0 18px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,fontSize:14,color:C.textSub,cursor:'pointer'}}>
          Cancelar
        </button>
        <button onClick={async () => { setSaving(true); await onSave(f); setSaving(false) }} disabled={saving}
          style={{height:40,padding:'0 22px',background:C.yellow,border:'none',borderRadius:99,fontSize:14,fontWeight:700,color:C.bg,cursor:'pointer'}}>
          {saving ? 'A guardar…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
