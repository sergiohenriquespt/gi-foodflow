import { ps } from '../constants/pratos'

export default function PratoTag({label,large=false}) {
  const {bg,color,border} = ps(label)
  return <span style={{padding:large?'5px 14px':'3px 9px',borderRadius:5,fontSize:large?13:10,fontWeight:700,background:bg,color,border:`1px solid ${border}`}}>{label}</span>
}
