import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { C } from '../../constants/colors'
import { DEFAULTS } from '../../constants/settings'
import { WD, MN, fmtF, TODAY } from '../../utils/date'
import Avatar from '../../components/Avatar'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
import PratoBtn from '../../components/PratoBtn'
import useSerial from '../../hooks/useSerial'

const ARR = { bg:'#151920', card:'#1a2028', surf:'#29333d', border:'#3a4550', ink:'#e8ecef', ink2:'#a4adb6', ink3:'#6c7680', accent:'#e0cb4b', accentText:'#1a2028' }

function LoginShell({leftPanel, value, secret=false, onChange, onConfirm, onBack, serialStatus, error}) {
  const now = new Date()
  const timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0')
  const dateStr = WD[now.getDay()] + ' ' + now.getDate() + ' ' + MN[now.getMonth()]
  const rfidActive = serialStatus === 'connected'
  const A = ARR
  const cell = {height:90,fontSize:30,fontWeight:500,background:A.surf,border:`1px solid ${A.border}`,borderRadius:18,color:A.ink,cursor:'pointer',fontFamily:'inherit'}

  useEffect(() => {
    const h = e => {
      if (e.key >= '0' && e.key <= '9') onChange(p => p.length < 10 ? p + e.key : p)
      else if (e.key === 'Backspace') onChange(p => p.slice(0, -1))
      else if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onChange, onConfirm])

  return (
    <div style={{height:'100vh',background:A.bg,color:A.ink,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(circle at 80% 10%, rgba(224,203,75,0.16) 0%, transparent 55%)'}} />
      <div style={{position:'absolute',top:0,left:0,right:0,padding:'24px 36px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <Logo size="sm" />
          {onBack && <button onClick={onBack} style={{background:'none',border:`1px solid ${A.border}`,borderRadius:8,padding:'6px 14px',color:A.ink3,fontSize:12,cursor:'pointer',marginLeft:8}}>← Voltar</button>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16,fontSize:12,color:A.ink3}}>
          <span>Terminal · {dateStr} · {timeStr}</span>
          {rfidActive && (
            <span style={{display:'inline-flex',alignItems:'center',gap:6,color:'#34d399',fontWeight:700,fontSize:11,letterSpacing:'0.08em'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#34d399',boxShadow:'0 0 6px #34d399'}} />
              RFID ATIVO
            </span>
          )}
        </div>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',padding:'64px 80px 32px',gap:80,position:'relative',zIndex:1}}>
        <div style={{flex:1}}>{leftPanel}</div>
        <div style={{width:380}}>
          <div style={{fontSize:12,fontWeight:700,color:A.ink3,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:10}}>
            {secret ? 'PIN' : 'Código'}
          </div>
          <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:18,height:80,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            <span style={{fontSize:56,letterSpacing:8,color:value ? A.ink : A.ink3,lineHeight:1}}>
              {value ? (secret ? '●'.repeat(value.length) : value) : '—'}
            </span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:10}}>
            {[1,2,3,4,5,6,7,8,9].map(d => (
              <button key={d} onClick={()=>onChange(p=>p.length<10?p+String(d):p)} style={cell}>{d}</button>
            ))}
            <button onClick={()=>onChange(p=>p.slice(0,-1))} style={{...cell,fontSize:24,color:A.ink3}}>⌫</button>
            <button onClick={()=>onChange(p=>p.length<10?p+'0':p)} style={cell}>0</button>
            <button onClick={onConfirm} style={{...cell,background:A.accent,border:'none',color:A.accentText,fontWeight:800}}>→</button>
          </div>
          {error && <div style={{marginTop:12,padding:'8px 12px',background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:8,fontSize:13,color:'#f87171',textAlign:'center'}}>{error}</div>}
        </div>
      </div>
    </div>
  )
}

export default function TerminalMarcacoes({funcionarios,ementas,settings,onBack}) {
  const s = {...DEFAULTS,...settings}
  const [step,      setStep]      = useState('numero')
  const [numInput,  setNumInput]  = useState('')
  const [pinInput,  setPinInput]  = useState('')
  const [func,      setFunc]      = useState(null)
  const [err,       setErr]       = useState('')
  const [selDay,    setSelDay]    = useState(TODAY)
  const [marcacoes, setMarcacoes] = useState([])
  const [rfidMsg,   setRfidMsg]   = useState('')

  // RFID via ref — usado pelo useSerial para evitar stale closure
  const onUidRef = useRef(uid => {
    const f = funcionarios.find(f => f.rfid === uid)
    if (!f || !f.ativo) { setRfidMsg(`Cartão lido: ${uid} — não encontrado.`); setTimeout(()=>setRfidMsg(''),5000); return }
    setRfidMsg(''); loginFunc(f)
  })
  // Atualiza o ref quando funcionarios muda
  useEffect(() => {
    onUidRef.current = uid => {
      const f = funcionarios.find(f => f.rfid === uid)
      if (!f || !f.ativo) { setRfidMsg(`Cartão lido: ${uid} — não encontrado.`); setTimeout(()=>setRfidMsg(''),5000); return }
      setRfidMsg(''); loginFunc(f)
    }
  }, [funcionarios])

  const {serialStatus} = useSerial(onUidRef)

  // HID fallback
  const rfidRef = useRef(''); const rfidTimer = useRef(null)
  useEffect(() => {
    if (step==='dashboard') return
    const h = e => {
      if(e.key==='Enter'){if(rfidRef.current){onUidRef.current(rfidRef.current.replace(/[^\x21-\x7E]/g,'').trim());rfidRef.current=''}return}
      if(e.key.length!==1) return
      rfidRef.current+=e.key; clearTimeout(rfidTimer.current)
      rfidTimer.current=setTimeout(()=>{rfidRef.current=''},200)
    }
    window.addEventListener('keydown',h)
    return()=>{window.removeEventListener('keydown',h);clearTimeout(rfidTimer.current)}
  },[step])

  const loadMarcacoes = async fid => { const{data}=await supabase.from('cantina_marcacoes').select('*').eq('funcionario_id',fid); setMarcacoes(data||[]) }

  const loginFunc = f => {
    loadMarcacoes(f.id)
    if(f.pin){setFunc(f);setStep('pin');setNumInput('');setErr('')}
    else{setFunc(f);setStep('dashboard');setNumInput('');setErr('')}
  }

  const submitNumero = () => {
    const v=numInput.trim()
    const f=funcionarios.find(f=>f.numero===v||f.numero===v.padStart(3,'0'))
    if(!f||!f.ativo){setErr('Código não encontrado');setNumInput('');setTimeout(()=>setErr(''),3000);return}
    loginFunc(f)
  }

  const submitPin = () => {
    if(pinInput===func.pin){setStep('dashboard');setPinInput('');setErr('')}
    else{setErr('PIN incorreto');setPinInput('');setTimeout(()=>setErr(''),3000)}
  }

  const logout = () => {setStep('numero');setFunc(null);setNumInput('');setPinInput('');setErr('');setSelDay(TODAY);setMarcacoes([])}

  if (step==='numero') {
    const leftPanel = (
      <div>
        <div style={{fontSize:14,fontWeight:700,color:ARR.ink3,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:16}}>Bom dia 👋</div>
        <div style={{fontSize:132,lineHeight:0.9,color:ARR.ink,letterSpacing:'-0.01em',marginBottom:4}}>Olá.</div>
        <div style={{fontStyle:'italic',fontSize:56,lineHeight:1.05,color:ARR.ink2}}>Quem é que vai comer?</div>
        <div style={{marginTop:32,display:'inline-flex',alignItems:'center',gap:18,background:ARR.card,border:`1px solid ${ARR.border}`,padding:'16px 22px',borderRadius:16}}>
          <div style={{position:'relative',width:56,height:56}}>
            {[0,0.5,1].map(d=>(
              <div key={d} style={{position:'absolute',inset:0,borderRadius:'50%',border:`1.5px solid ${ARR.accent}`,animation:`ff-pulse-ring 2s ease-out ${d}s infinite`}} />
            ))}
            <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'rgba(224,203,75,0.20)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="card-tap" size={28} color={ARR.accent} />
            </div>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:ARR.ink}}>Encosta o cartão</div>
            <div style={{fontSize:12,color:ARR.ink3,marginTop:2}}>… ou usa o teclado ao lado</div>
          </div>
        </div>
        {rfidMsg && <div style={{marginTop:12,padding:'8px 12px',background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:8,fontSize:12,color:'#fbbf24'}}>{rfidMsg}</div>}
      </div>
    )
    return <LoginShell leftPanel={leftPanel} value={numInput} onChange={setNumInput} onConfirm={submitNumero} onBack={onBack} serialStatus={serialStatus} error={err} />
  }

  if (step==='pin') {
    const leftPanel = (
      <div>
        <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:28}}>
          <Avatar nome={func.nome} foto={func.foto} size={72}/>
          <div>
            <div style={{fontSize:42,lineHeight:1,fontWeight:800,color:ARR.ink}}>{func.nome}</div>
            <div style={{fontSize:14,color:ARR.ink3,marginTop:4}}>Nº {func.numero}</div>
          </div>
        </div>
        <div style={{fontStyle:'italic',fontSize:56,lineHeight:1.05,color:ARR.ink2}}>Introduz o teu PIN.</div>
      </div>
    )
    const backPin = () => { setStep('numero'); setFunc(null); setPinInput(''); setErr('') }
    return <LoginShell leftPanel={leftPanel} value={pinInput} secret onChange={setPinInput} onConfirm={submitPin} onBack={backPin} serialStatus={serialStatus} error={err} />
  }

  const bloqueado = s.bloquear_dia_proprio==='true'
  const serveFds  = s.servir_fds!=='false'
  const days = [...new Set(ementas.map(e=>e.data))].sort().filter(d => {
    if(d===TODAY) return true
    if(d<TODAY) return false
    if(!serveFds){const wd=new Date(d+'T12:00:00').getDay();if(wd===0||wd===6) return false}
    return true
  }).slice(0,14)

  const dayEm  = ementas.filter(e=>e.data===selDay)
  const getM   = eid => marcacoes.find(m=>m.funcionario_id===func.id&&m.ementa_id===eid)
  const marcar = async (em,n) => { await supabase.from('cantina_marcacoes').upsert({funcionario_id:func.id,ementa_id:em.id,prato_num:n},{onConflict:'funcionario_id,ementa_id'}); await loadMarcacoes(func.id) }
  const cancelar = async eid => { await supabase.from('cantina_marcacoes').delete().eq('funcionario_id',func.id).eq('ementa_id',eid); await loadMarcacoes(func.id) }

  return (
    <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 20px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <Logo size="sm" showSub={false}/>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <Avatar nome={func.nome} foto={func.foto} size={36}/>
          <div><div style={{fontSize:16,fontWeight:600,color:C.text}}>{func.nome}</div><div style={{fontSize:11,color:C.textMuted}}>Nº {func.numero}</div></div>
          <button onClick={logout} style={{marginLeft:8,padding:'8px 18px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,color:C.textSub,fontSize:14,height:40}}>Sair</button>
        </div>
      </div>
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        <div style={{width:200,background:C.surface,borderRight:`1px solid ${C.border}`,overflowY:'auto',flexShrink:0}}>
          <div style={{padding:'12px 16px 8px',fontSize:10,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:1}}>Dias disponíveis</div>
          {days.map(d => {
            const dd=new Date(d+'T12:00:00'),isT=d===TODAY,sel=selDay===d
            const mc=ementas.filter(e=>e.data===d&&getM(e.id)).length
            const soLeitura=isT&&bloqueado
            return (
              <button key={d} onClick={()=>setSelDay(d)}
                style={{width:'100%',height:80,padding:'0 16px',textAlign:'left',background:sel?C.yellow+'14':'transparent',border:'none',borderLeft:sel?`4px solid ${C.yellow}`:'4px solid transparent',display:'flex',flexDirection:'column',justifyContent:'center',gap:2}}>
                <div style={{fontSize:14,fontWeight:700,color:isT?C.yellow:C.text,display:'flex',alignItems:'center',gap:5}}>
                  {isT?'HOJE':WD[dd.getDay()]}
                  {soLeitura&&<span style={{fontSize:9,color:C.textMuted,fontWeight:400,background:C.surface2,padding:'1px 5px',borderRadius:3}}>só leitura</span>}
                </div>
                <div style={{fontSize:12,color:C.textSub}}>{dd.getDate()} {MN[dd.getMonth()]}</div>
                {mc>0?<div style={{fontSize:11,color:C.success,fontWeight:600}}>✓ {mc} marcado{mc>1?'s':''}</div>:<div style={{fontSize:11,color:C.textMuted}}>— sem marcação</div>}
              </button>
            )
          })}
          {days.length===0&&<div style={{padding:'20px 16px',fontSize:12,color:C.textMuted,textAlign:'center'}}>Sem dias disponíveis</div>}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{fontSize:17,fontWeight:700,color:C.text}}>{fmtF(selDay)}</div>
            {selDay===TODAY&&<span style={{background:C.yellow+'22',color:C.yellow,border:`1px solid ${C.yellow}44`,fontSize:11,padding:'3px 10px',borderRadius:5,fontWeight:700}}>HOJE</span>}
          </div>
          {['A','J'].map(tipo => {
            const em=dayEm.find(e=>e.tipo===tipo); if(!em) return null
            const marc=getM(em.id)
            const readonly=selDay===TODAY&&bloqueado
            const pratos=[1,2,3,4].map(n=>({n,label:em[`prato${n}_label`],desc:em[`prato${n}_desc`]})).filter(p=>p.label)
            return (
              <div key={tipo} style={{background:C.surface,border:`2px solid ${marc?C.yellow+'55':C.border}`,borderRadius:14,padding:'16px 18px',marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:20}}>{tipo==='A'?'🌞':'🌙'}</span>
                    <span style={{fontSize:17,fontWeight:700,color:C.text}}>{tipo==='A'?'Almoço':'Jantar'}</span>
                  </div>
                  {readonly
                    ? marc
                      ? <span style={{fontSize:13,color:C.success,fontWeight:700,display:'flex',alignItems:'center',gap:5}}><Icon name="check" size={14} color={C.success}/>Marcado</span>
                      : <span style={{fontSize:12,color:C.textMuted,fontStyle:'italic'}}>Marcações encerradas</span>
                    : marc
                      ? <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{fontSize:13,color:C.success,fontWeight:700,display:'flex',alignItems:'center',gap:5}}><Icon name="check" size={14} color={C.success}/>Marcado</span>
                          <button onClick={()=>cancelar(em.id)} style={{padding:'6px 14px',background:C.dangerBg,border:`1px solid ${C.danger}33`,borderRadius:8,color:C.danger,fontSize:13,height:36}}>Cancelar</button>
                        </div>
                      : <span style={{fontSize:12,color:C.textMuted}}>Seleciona um prato</span>}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8,opacity:readonly&&!marc?0.5:1}}>
                  {pratos.map(({n,label,desc}) => <PratoBtn key={n} label={label} desc={desc} selected={marc?.prato_num===n} onClick={readonly?undefined:()=>marcar(em,n)} disabled={readonly}/>)}
                </div>
              </div>
            )
          })}
          {dayEm.length===0&&<div style={{textAlign:'center',color:C.textMuted,fontSize:15,marginTop:60}}>Sem ementa disponível para este dia</div>}
        </div>
      </div>
    </div>
  )
}
