import { pratoColors } from '../constants/pratos'

export default function PratoTag({slot,label,large=false}) {
  const {bg,fg,bd} = pratoColors(slot)
  return <span style={{padding:large?'5px 14px':'3px 9px',borderRadius:5,fontSize:large?13:10,fontWeight:700,background:bg,color:fg,border:`1px solid ${bd}`}}>{label}</span>
}
