import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { C } from '../../constants/colors'
import { DEFAULTS } from '../../constants/settings'
import { WD, MN, TODAY } from '../../utils/date'
import Avatar from '../../components/Avatar'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
import LoginShell, { ARR } from '../../components/LoginShell'
import PratoCard from '../../components/PratoCard'
import useSerial from '../../hooks/useSerial'

function DayChip({d, sel, marcCount, isToday, onClick}) {
  const dd = new Date(d+'T12:00:00')
  return (
    <button onClick={onClick}
      style={{cursor:'pointer',textAlign:'left',background:sel?C.yellow:C.surface,color:sel?C.bg:C.text,border:`1.5px solid ${sel?C.yellow:C.border}`,borderRadius:14,padding:'14px 18px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:6,minWidth:132,flexShrink:0,position:'relative',transition:'border-color 0.15s, background 0.15s'}}>
      <div style={{display:'flex',alignItems:'baseline',gap:6}}>
        <span style={{fontSize:40,lineHeight:0.85,fontWeight:400}}>{dd.getDate()}</span>
        <span style={{fontSize:12,fontWeight:700,letterSpacing:'0.12em',color:sel?'rgba(26,32,40,0.6)':C.textMuted}}>{WD[dd.getDay()].toUpperCase()}</span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:sel?'rgba(26,32,40,0.7)':C.textSub}}>
        {marcCount>0
          ? <><span style={{width:7,height:7,borderRadius:'50%',background:sel?C.bg:C.success}}/>{marcCount} marcado{marcCount>1?'s':''}</>
          : <span style={{fontStyle:'italic'}}>—</span>}
      </div>
      {isToday && (
        <span style={{position:'absolute',top:-8,right:10,fontSize:9,fontWeight:800,letterSpacing:'0.16em',background:sel?C.bg:C.yellow,color:sel?C.yellow:C.bg,padding:'3px 8px',borderRadius:4}}>HOJE</span>
      )}
    </button>
  )
}

function MealBlock({tipo, hour, marc, pratos, readonly, onMarcar, onCancelar}) {
  const emoji = tipo==='A' ? '🌞' : '🌙'
  const label = tipo==='A' ? 'Almoço' : 'Jantar'
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:22,padding:'22px 24px',flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'baseline',gap:12}}>
          <span style={{fontSize:30}}>{emoji}</span>
          <span style={{fontStyle:'italic',fontSize:36,color:C.text,lineHeight:1}}>{label}</span>
          <span style={{fontSize:13,color:C.textMuted,marginLeft:4}}>· {hour}</span>
        </div>
        {readonly
          ? marc
            ? <span style={{fontSize:13,color:C.success,fontWeight:700,display:'flex',alignItems:'center',gap:6}}><Icon name="check" size={14} color={C.success}/> Marcado</span>
            : <span style={{fontSize:13,color:C.textMuted,fontStyle:'italic'}}>Marcações encerradas</span>
          : marc
            ? <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:7,background:C.successBg,border:`1px solid ${C.success}33`,borderRadius:99,padding:'6px 14px',fontSize:13,fontWeight:700,color:C.success}}>
                  <Icon name="check" size={14} color={C.success}/> Marcado
                </span>
                <button onClick={onCancelar} style={{fontSize:13,fontWeight:600,color:C.textSub,background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,padding:'6px 14px',cursor:'pointer'}}>Trocar prato</button>
              </div>
            : <span style={{fontSize:13,color:C.textMuted,fontStyle:'italic'}}>Escolhe um prato</span>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,flex:1,alignContent:'stretch',opacity:readonly&&!marc?0.5:1}}>
        {pratos.map(({n,label:pratoLabel,desc}) => (
          <PratoCard key={n} label={pratoLabel} desc={desc} selected={marc?.prato_num===n} disabled={readonly} onClick={readonly?undefined:()=>onMarcar(n)}/>
        ))}
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
  const [weekOffset,setWeekOffset]= useState(0)
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

  const logout = () => {setStep('numero');setFunc(null);setNumInput('');setPinInput('');setErr('');setSelDay(TODAY);setWeekOffset(0);setMarcacoes([])}

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

  const weekDays = days.slice(weekOffset*5, weekOffset*5+5)
  const hasPrev  = weekOffset > 0
  const hasNext  = days.length > (weekOffset+1)*5
  const goWeek = off => {
    const wd = days.slice(off*5, off*5+5)
    setWeekOffset(off)
    if (wd.length && !wd.includes(selDay)) setSelDay(wd[0])
  }
  const weekEm     = ementas.filter(e=>weekDays.includes(e.data))
  const nMarcadas  = weekEm.filter(e=>getM(e.id)).length
  const nPorMarcar = weekEm.length - nMarcadas
  const weekLabel = (() => {
    if(!weekDays.length) return 'Sem dias disponíveis'
    const a=new Date(weekDays[0]+'T12:00:00'), b=new Date(weekDays[weekDays.length-1]+'T12:00:00')
    return a.getMonth()===b.getMonth()
      ? `Semana de ${a.getDate()} a ${b.getDate()} de ${MN[b.getMonth()]}`
      : `Semana de ${a.getDate()} ${MN[a.getMonth()]} a ${b.getDate()} ${MN[b.getMonth()]}`
  })()
  const weekBtn = {height:32,padding:'0 14px',cursor:'pointer',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,fontSize:12,fontWeight:600,color:C.textSub,display:'inline-flex',alignItems:'center',gap:6}

  return (
    <div style={{height:'100vh',background:C.bg,color:C.text,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Topbar */}
      <div style={{padding:'18px 28px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:22}}>
          <Logo size="sm" showSub={false}/>
          <div style={{width:1,height:28,background:C.border}}/>
          <div>
            <div style={{fontStyle:'italic',fontSize:26,lineHeight:1,color:C.text}}>Olá, {func.nome.split(' ')[0]}</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>O que vais comer hoje?</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{func.nome}</div>
            <div style={{fontSize:11,color:C.textMuted}}>Nº {func.numero}</div>
          </div>
          <Avatar nome={func.nome} foto={func.foto} size={42}/>
          <button onClick={logout} style={{height:42,padding:'0 16px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,color:C.textSub,fontSize:13,fontWeight:600,display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer'}}>
            <Icon name="logout" size={15}/> Sair
          </button>
        </div>
      </div>

      {/* Day strip */}
      <div style={{padding:'20px 28px 10px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:'0.14em',textTransform:'uppercase'}}>{weekLabel}</div>
          <div style={{display:'flex',alignItems:'center',gap:14,fontSize:12,color:C.textSub}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:C.success}}/> {nMarcadas} marcada{nMarcadas===1?'':'s'}
            </span>
            <span style={{color:C.textMuted}}>·</span>
            <span>{nPorMarcar} por marcar</span>
            {hasPrev && <button onClick={()=>goWeek(weekOffset-1)} style={{...weekBtn,marginLeft:6}}>← Semana anterior</button>}
            {hasNext && <button onClick={()=>goWeek(weekOffset+1)} style={{...weekBtn,marginLeft:hasPrev?0:6}}>Próxima semana →</button>}
          </div>
        </div>
        <div style={{display:'flex',gap:12}}>
          {weekDays.map(d => (
            <DayChip key={d} d={d} sel={selDay===d} isToday={d===TODAY}
              marcCount={ementas.filter(e=>e.data===d&&getM(e.id)).length}
              onClick={()=>setSelDay(d)}/>
          ))}
        </div>
      </div>

      {/* Meal blocks lado a lado */}
      <div style={{flex:1,display:'flex',gap:16,padding:'14px 28px 24px',minHeight:0}}>
        {['A','J'].map(tipo => {
          const em=dayEm.find(e=>e.tipo===tipo); if(!em) return null
          const marc=getM(em.id)
          const readonly=selDay===TODAY&&bloqueado
          const pratos=[1,2,3,4].map(n=>({n,label:em[`prato${n}_label`],desc:em[`prato${n}_desc`]})).filter(p=>p.label)
          const hour = tipo==='A' ? `${s.almoco_inicio} — ${s.almoco_fim}` : `${s.jantar_inicio} — ${s.jantar_fim}`
          return (
            <MealBlock key={tipo} tipo={tipo} hour={hour} marc={marc} pratos={pratos} readonly={readonly}
              onMarcar={n=>marcar(em,n)} onCancelar={()=>cancelar(em.id)}/>
          )
        })}
        {dayEm.length===0 && (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:C.textMuted,fontSize:15}}>
            Sem ementa disponível para este dia
          </div>
        )}
      </div>
    </div>
  )
}
