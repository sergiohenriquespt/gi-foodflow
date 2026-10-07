import { C } from '../constants/colors'
import { ps } from '../constants/pratos'
import Icon from './Icon'

const GLYPH = { Carne:'flame', Peixe:'fish', Dieta:'salad', Vegetariano:'leaf' }

export default function PratoCard({label,desc,selected,dim,locked,onClick}) {
  const p = ps(label)
  return (
    <button onClick={onClick} disabled={locked}
      style={{position:'relative',textAlign:'left',padding:0,overflow:'hidden',cursor:locked?'default':'pointer',fontFamily:'inherit',
        borderRadius:18,display:'flex',flexDirection:'column',minHeight:0,
        background:selected?C.yellow+'1A':C.surface,
        border:`3px solid ${selected?C.yellow:C.border}`,
        opacity:dim?(locked?0.35:0.55):1,
        transition:'opacity .15s, border-color .15s, background .15s'}}>
      <div style={{height:54,flexShrink:0,background:p.bg,borderBottom:`1px solid ${p.border}`,color:p.color,display:'flex',alignItems:'center',gap:10,padding:'0 18px'}}>
        <Icon name={GLYPH[label]||'utensils'} size={22}/>
        <span style={{fontSize:16,fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase'}}>{label}</span>
      </div>
      <div style={{flex:1,padding:'16px 18px',fontSize:19,fontWeight:500,lineHeight:1.3,color:C.text,textWrap:'pretty',overflow:'hidden'}}>{desc}</div>
      {selected && (
        <span style={{position:'absolute',right:14,bottom:14,height:44,padding:'0 16px 0 10px',borderRadius:99,background:C.yellow,color:C.bg,display:'inline-flex',alignItems:'center',gap:6,fontSize:15,fontWeight:800}}>
          <Icon name={locked?'lock':'check'} size={20}/>Escolhido
        </span>
      )}
    </button>
  )
}
