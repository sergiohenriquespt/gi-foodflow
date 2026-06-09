import { C } from '../constants/colors'
import Icon from '../components/Icon'
import Logo from '../components/Logo'

export default function ModeSelector({onSelect}) {
  const modes = [
    {key:'marcacoes', icon:'calendar', label:'Terminal de Marcações',  desc:'Funcionários marcam as suas refeições'},
    {key:'validacoes',icon:'card',     label:'Terminal de Validações', desc:'Leitura de cartão RFID / código na cozinha'},
    {key:'backoffice',icon:'chart',    label:'Backoffice',             desc:'Ementas, funcionários e relatórios'},
  ]
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:24}}>
      <div style={{marginBottom:32}}><Logo size="lg" showSub={true}/></div>
      {modes.map(m => (
        <button key={m.key} onClick={()=>onSelect(m.key)}
          style={{width:320,padding:'20px 24px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,textAlign:'left'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.yellow+'80';e.currentTarget.style.background=C.surface2}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface}}>
          <div style={{marginBottom:10}}><Icon name={m.icon} size={20} color={C.yellow}/></div>
          <div style={{fontSize:15,fontWeight:600,color:C.text}}>{m.label}</div>
          <div style={{fontSize:12,color:C.textSub,marginTop:3}}>{m.desc}</div>
        </button>
      ))}
      <div style={{marginTop:20,fontSize:11,color:C.textMuted,textAlign:'center',lineHeight:1.7}}>
        URL por computador: <code style={{color:C.yellow+'aa',background:C.surface2,padding:'1px 5px',borderRadius:3}}>?mode=marcacoes</code>
      </div>
    </div>
  )
}
