import { C } from '../constants/colors'

export default function LoadingScreen({msg='A carregar…'}) {
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <div style={{width:48,height:48,borderRadius:'50%',border:`3px solid ${C.yellow}33`,borderTopColor:C.yellow,animation:'spin .8s linear infinite'}}/>
      <div style={{fontSize:14,color:C.textMuted}}>{msg}</div>
    </div>
  )
}
