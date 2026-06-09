import Icon from '../components/Icon'
import Logo from '../components/Logo'

const A = { bg:'#151920', card:'#1a2028', surf:'#29333d', border:'#3a4550', ink:'#e8ecef', ink2:'#a4adb6', ink3:'#6c7680', accent:'#e0cb4b', accentText:'#1a2028' }

const MODES = [
  { key:'marcacoes',  icon:'calendar', label:'Marcações',  desc:'Funcionários marcam refeições' },
  { key:'validacoes', icon:'card-tap', label:'Validações',  desc:'Cozinha valida consumos' },
  { key:'backoffice', icon:'chart',    label:'Backoffice', desc:'Ementas e relatórios' },
]

export default function ModeSelector({onSelect}) {
  return (
    <div style={{height:'100vh',background:A.bg,color:A.ink,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(circle at 90% 90%, rgba(224,203,75,0.14) 0%, transparent 55%)'}} />
      <div style={{padding:'32px 40px 0',position:'relative',zIndex:1}}>
        <Logo size="lg" />
      </div>
      <div style={{flex:1,padding:'32px 80px',position:'relative',zIndex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{fontSize:14,fontWeight:700,color:A.ink3,letterSpacing:'0.14em',textTransform:'uppercase'}}>
          Qual destes és tu hoje?
        </div>
        <div style={{fontStyle:'italic',fontSize:72,color:A.ink,marginTop:8,lineHeight:1,marginBottom:36}}>
          Escolhe um terminal.
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:18}}>
          {MODES.map((m,i) => (
            <button key={m.key} onClick={()=>onSelect(m.key)} style={{
              cursor:'pointer',textAlign:'left',
              background:i===0 ? A.accent : A.card,
              color:i===0 ? A.accentText : A.ink,
              border:`1.5px solid ${i===0 ? A.accent : A.border}`,
              borderRadius:24,padding:'32px 28px',
              display:'flex',flexDirection:'column',gap:28,minHeight:280,
              position:'relative',overflow:'hidden',
            }}>
              <div style={{
                width:64,height:64,borderRadius:16,
                background:i===0 ? 'rgba(26,32,40,0.14)' : A.surf,
                color:i===0 ? A.accentText : A.ink2,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                <Icon name={m.icon} size={32} color={i===0 ? A.accentText : A.ink2} />
              </div>
              <div style={{marginTop:'auto'}}>
                <div style={{fontSize:12,fontWeight:700,letterSpacing:'0.16em',color:i===0 ? 'rgba(26,32,40,0.55)' : A.ink3,marginBottom:8}}>
                  TERMINAL {String(i+1).padStart(2,'0')}
                </div>
                <div style={{fontSize:44,lineHeight:1,marginBottom:8}}>
                  {m.label}
                </div>
                <div style={{fontSize:14,color:i===0 ? 'rgba(26,32,40,0.7)' : A.ink2,lineHeight:1.4}}>
                  {m.desc}
                </div>
              </div>
              <div style={{position:'absolute',top:32,right:28}}>
                <Icon name="arrow-r" size={24} color={i===0 ? A.accentText : A.accent} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
