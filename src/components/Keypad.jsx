import { C } from '../constants/colors'

export default function Keypad({value,onChange,onConfirm,maxLen=10,confirmLabel='→',confirmDisabled=false}) {
  const s = {height:76,fontSize:22,fontWeight:500,background:C.surface2,border:`1.5px solid ${C.border}`,borderRadius:12,color:C.text}
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9}}>
      {[1,2,3,4,5,6,7,8,9].map(d => <button key={d} onClick={()=>value.length<maxLen&&onChange(value+d)} style={s}>{d}</button>)}
      <button onClick={()=>onChange(value.slice(0,-1))} style={{...s,fontSize:18,color:C.textSub}}>←</button>
      <button onClick={()=>value.length<maxLen&&onChange(value+'0')} style={s}>0</button>
      <button onClick={onConfirm} disabled={confirmDisabled} style={{...s,background:confirmDisabled?C.surface3:C.yellow,border:'none',color:confirmDisabled?C.textMuted:C.bg,fontWeight:700}}>{confirmLabel}</button>
    </div>
  )
}
