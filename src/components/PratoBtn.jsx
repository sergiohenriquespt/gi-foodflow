import { C } from '../constants/colors'
import { ps } from '../constants/pratos'
import Icon from './Icon'

export default function PratoBtn({label,desc,selected,onClick,disabled}) {
  const p = ps(label)
  return (
    <button onClick={onClick} disabled={disabled}
      style={{display:'flex',alignItems:'center',gap:14,padding:'0 18px',height:68,background:selected?C.yellow+'18':C.surface2,border:`2px solid ${selected?C.yellow:C.border}`,borderRadius:12,textAlign:'left',cursor:disabled?'default':'pointer',width:'100%'}}>
      <span style={{padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:700,background:p.bg,color:p.color,border:`1px solid ${p.border}`,minWidth:98,textAlign:'center',flexShrink:0}}>{label}</span>
      <span style={{fontSize:15,flex:1,color:selected?C.text:C.textSub,fontWeight:selected?500:400}}>{desc}</span>
      {selected && <Icon name="check" size={20} color={C.yellow}/>}
    </button>
  )
}
