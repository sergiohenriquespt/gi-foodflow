import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { C } from '../../constants/colors'
import { DEFAULTS } from '../../constants/settings'
import { WD, MN, fmtF, TODAY } from '../../utils/date'
import Avatar from '../../components/Avatar'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
import InputScreen from '../../components/InputScreen'
import PratoBtn from '../../components/PratoBtn'
import useSerial from '../../hooks/useSerial'

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

  const {serialStatus,serialErrMsg,connect:connectSerial} = useSerial(onUidRef)

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

  if (step==='numero') return (
    <InputScreen title="Introduza o seu código de funcionário" subtitle="Código"
      value={numInput} onChange={setNumInput} onConfirm={submitNumero}
      onBack={onBack} confirmLabel="→" error={err} secret={false}
      serialStatus={serialStatus} serialErrMsg={serialErrMsg} onConnectSerial={connectSerial}>
      {rfidMsg && <div style={{background:C.warnBg,border:`1px solid ${C.warn}44`,borderRadius:8,padding:'8px 12px',marginBottom:12,fontSize:11,color:C.warn}}>{rfidMsg}</div>}
    </InputScreen>
  )

  if (step==='pin') return (
    <InputScreen title="Introduza o seu PIN" subtitle="PIN"
      value={pinInput} onChange={setPinInput} onConfirm={submitPin}
      onBack={()=>{setStep('numero');setFunc(null);setPinInput('');setErr('')}}
      confirmLabel="→" error={err} secret={true}
      serialStatus={serialStatus} serialErrMsg={serialErrMsg} onConnectSerial={connectSerial}>
      <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:12,marginBottom:18}}>
        <Avatar nome={func.nome} foto={func.foto} size={48}/>
        <div><div style={{fontSize:17,fontWeight:700,color:C.text}}>{func.nome}</div><div style={{fontSize:12,color:C.textMuted,marginTop:2}}>Nº {func.numero}</div></div>
      </div>
    </InputScreen>
  )

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
