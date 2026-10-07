import { C } from '../constants/colors'
import { pratoColors } from '../constants/pratos'
import Icon from './Icon'

const GLYPH = ['flame','fish','salad','leaf']   // por slot, tal como a cor

export default function PratoCard({slot,label,desc,selected,dim,locked,compact,onClick}) {
  const p = pratoColors(slot)
  return (
    <button onClick={onClick} disabled={locked}
      style={{position:'relative',textAlign:'left',padding:0,overflow:'hidden',cursor:locked?'default':'pointer',fontFamily:'inherit',
        borderRadius:18,display:'flex',flexDirection:'column',minHeight:0,minWidth:0,
        background:selected?C.yellow+'1A':C.surface,
        border:`3px solid ${selected?C.yellow:C.border}`,
        opacity:dim?(locked?0.35:0.55):1,
        transition:'opacity .15s, border-color .15s, background .15s'}}>
      <div style={{height:54,flexShrink:0,background:p.bg,borderBottom:`1px solid ${p.bd}`,color:p.fg,display:'flex',alignItems:'center',gap:10,padding:compact?'0 14px':'0 18px'}}>
        <Icon name={GLYPH[(slot-1)%GLYPH.length]||'utensils'} size={22}/>
        <span style={{fontSize:compact?13:16,fontWeight:800,letterSpacing:compact?'0.06em':'0.08em',textTransform:'uppercase',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{label}</span>
      </div>
      <div style={{flex:1,padding:compact?'14px 16px':'16px 18px',fontSize:compact?17:19,fontWeight:500,lineHeight:1.3,color:C.text,textWrap:'pretty',overflow:'hidden'}}>{desc}</div>
      {selected && (
        <span aria-label="Escolhido" style={{position:'absolute',right:14,bottom:14,height:44,padding:compact?'0 12px':'0 16px 0 10px',borderRadius:99,background:C.yellow,color:C.bg,display:'inline-flex',alignItems:'center',gap:6,fontSize:15,fontWeight:800}}>
          <Icon name={locked?'lock':'check'} size={20}/>{!compact && 'Escolhido'}
        </span>
      )}
    </button>
  )
}
