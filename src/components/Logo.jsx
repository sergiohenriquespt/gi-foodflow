import { C } from '../constants/colors'
import Icon from './Icon'

export default function Logo({size='md',showSub=true}) {
  const z = size==='lg'?{i:36,m:28,s:11}:size==='sm'?{i:26,m:18,s:9}:{i:30,m:22,s:10}
  return (
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:z.i,height:z.i,borderRadius:8,background:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Icon name="fork" size={z.i*.6} color={C.bg}/>
      </div>
      <div>
        <div style={{display:'flex',alignItems:'baseline',gap:5}}>
          <span style={{fontSize:z.m*.7,fontWeight:800,color:C.yellow,letterSpacing:1}}>GI</span>
          <span style={{fontSize:z.m*.58,fontWeight:700,color:C.text,letterSpacing:2}}>FOODFLOW</span>
        </div>
        {showSub && <div style={{fontSize:z.s,color:C.textMuted,marginTop:1}}>Gestão de Cantina</div>}
      </div>
    </div>
  )
}
