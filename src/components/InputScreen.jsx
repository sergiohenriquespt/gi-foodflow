import { C } from '../constants/colors'
import Icon from './Icon'
import Keypad from './Keypad'
import Logo from './Logo'

export default function InputScreen({title,subtitle,value,onChange,onConfirm,onBack,confirmLabel,error,secret=false,children,serialStatus,serialErrMsg,onConnectSerial}) {
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      {onBack && <button onClick={onBack} style={{position:'absolute',top:24,left:24,background:'none',border:'none',color:C.textMuted,fontSize:14}}>← Voltar</button>}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24,padding:'36px 40px',width:440}}>
        <div style={{marginBottom:28}}><Logo size="md" showSub={true}/></div>
        {children}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:13,color:C.textMuted,marginBottom:8}}>{title}</div>
          <div style={{background:C.surface3,border:`1.5px solid ${error?C.danger+'66':C.border2}`,borderRadius:12,height:60,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
            {value
              ? secret
                ? <span style={{fontSize:30,letterSpacing:8,color:C.yellow,fontWeight:600}}>{'•'.repeat(value.length)}</span>
                : <span style={{fontSize:28,letterSpacing:5,color:C.yellow,fontWeight:700}}>{value}</span>
              : <span style={{color:C.textMuted,fontSize:15}}>{subtitle}</span>}
          </div>
          {error && <div style={{marginTop:8,background:C.dangerBg,border:`1px solid ${C.danger}44`,borderRadius:8,padding:'8px 14px',fontSize:13,color:C.danger,textAlign:'center'}}>{error}</div>}
        </div>
        <Keypad value={value} onChange={onChange} onConfirm={onConfirm} confirmLabel={confirmLabel} confirmDisabled={!value}/>
        {serialStatus !== undefined && (
          <div style={{marginTop:16}}>
            {!navigator.serial
              ? <div style={{textAlign:'center',fontSize:11,color:C.warn}}>Leitor RFID: requer Chrome ou Edge</div>
              : serialStatus==='connected'
              ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12,color:C.success}}><span style={{width:7,height:7,borderRadius:'50%',background:C.success,display:'inline-block'}}/>Leitor RFID ativo — passe o cartão para entrar</div>
              : serialStatus==='connecting'
              ? <div style={{textAlign:'center',fontSize:12,color:C.warn}}>A ligar ao leitor…</div>
              : <div>
                  <button onClick={onConnectSerial} style={{width:'100%',height:46,background:C.yellow+'18',border:`1.5px solid ${C.yellow}55`,borderRadius:10,fontSize:13,fontWeight:600,color:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    <Icon name="card" size={16} color={C.yellow}/>{serialStatus==='error'?'⚠ Religar leitor RFID':'Conectar leitor RFID'}
                  </button>
                  {serialStatus==='error' && serialErrMsg && <div style={{marginTop:8,fontSize:11,color:C.danger,textAlign:'center'}}>{serialErrMsg}</div>}
                </div>}
          </div>
        )}
      </div>
    </div>
  )
}
