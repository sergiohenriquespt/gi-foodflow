import { C } from '../constants/colors'
import { ps } from '../constants/pratos'
import Icon from './Icon'

export default function PratoCard({label,desc,selected,disabled,onClick}) {
  const p = ps(label)
  return (
    <button onClick={onClick} disabled={disabled}
      style={{cursor:disabled?'default':'pointer',textAlign:'left',background:selected?C.yellow+'1F':C.surface2,border:`1.5px solid ${selected?C.yellow:C.border}`,borderRadius:18,padding:'18px 20px',display:'flex',flexDirection:'column',gap:12,position:'relative',overflow:'hidden',transition:'border-color 0.15s, background 0.15s'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',padding:'4px 10px',borderRadius:6,background:p.bg,color:p.color,border:`1px solid ${p.border}`}}>{label}</span>
        {selected && (
          <span style={{width:28,height:28,borderRadius:'50%',background:C.yellow,color:C.bg,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Icon name="check" size={16} color={C.bg}/>
          </span>
        )}
      </div>
      <div style={{fontSize:15,lineHeight:1.35,fontWeight:500,color:C.text,textWrap:'pretty'}}>{desc}</div>
    </button>
  )
}
