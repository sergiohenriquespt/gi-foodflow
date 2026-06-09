import { C } from '../constants/colors'

export default function Avatar({nome,foto,size=40,ring}) {
  const i = nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  const ringStyle = ring ? {boxShadow:`0 0 0 ${Math.max(3,Math.round(size*0.03))}px ${ring}`} : null
  if (foto) return <img src={foto} alt={nome} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,...ringStyle}}/>
  return <div style={{width:size,height:size,borderRadius:'50%',background:C.yellow+'22',border:`1.5px solid ${C.yellow}55`,color:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*.36,flexShrink:0,...ringStyle}}>{i}</div>
}
