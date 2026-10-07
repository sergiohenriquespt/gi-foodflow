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

const MEALS = [{tipo:'A',emoji:'🌞',label:'Almoço'},{tipo:'J',emoji:'🌙',label:'Jantar'}]

function MealDot({letter, done, locked, on}) {
  const bg = done ? (on ? C.bg : C.success) : 'transparent'
  const bd = done ? bg : on ? C.bg+'73' : C.border2
  return (
    <span style={{width:30,height:30,borderRadius:'50%',background:bg,border:`2px solid ${bd}`,color:done?(on?C.yellow:C.bg):(on?C.bg:C.textMuted),display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800}}>
      {done ? <Icon name={locked?'lock':'check'} size={15}/> : letter}
    </span>
  )
}

function DayChip({d, sel, isToday, marks, locked, onClick}) {
  const dd = new Date(d+'T12:00:00')
  return (
    <button onClick={onClick}
      style={{flex:1,minWidth:0,cursor:'pointer',fontFamily:'inherit',textAlign:'left',background:sel?C.yellow:C.surface,color:sel?C.bg:C.text,border:`2px solid ${sel?C.yellow:C.border2}`,borderRadius:16,padding:'0 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
      <div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:15,fontWeight:800,letterSpacing:'0.1em',opacity:sel?0.75:0.6}}>{WD[dd.getDay()].toUpperCase()}</span>
          {isToday && <span style={{fontSize:11,fontWeight:800,letterSpacing:'0.12em',padding:'3px 8px',borderRadius:6,background:sel?C.bg:C.yellow,color:sel?C.yellow:C.bg}}>HOJE</span>}
        </div>
        <div style={{fontSize:40,fontWeight:700,lineHeight:1,marginTop:4}}>
          {String(dd.getDate()).padStart(2,'0')}<span style={{fontSize:16,fontWeight:600,marginLeft:6,opacity:0.65}}>{MN[dd.getMonth()]}</span>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {MEALS.map(m => <MealDot key={m.tipo} letter={m.tipo} done={marks[m.tipo]} locked={locked} on={sel}/>)}
      </div>
    </button>
  )
}

export default function TerminalMarcacoes({funcionarios,ementas,settings,onBack}) {
  const s = {...DEFAULTS,...settings}
  const isKiosk = new URLSearchParams(window.location.search).get('kiosk') === '1'
  const [step,      setStep]      = useState('numero')
  const [numInput,  setNumInput]  = useState('')
  const [pinInput,  setPinInput]  = useState('')
  const [func,      setFunc]      = useState(null)
  const [err,       setErr]       = useState('')
  const [selDay,    setSelDay]    = useState(TODAY)
  const [weekOffset,setWeekOffset]= useState(0)
  const [marcacoes, setMarcacoes] = useState([])
  const [rfidMsg,   setRfidMsg]   = useState('')
  const [toast,     setToast]     = useState(null)   // { msg, error }
  const toastTimer = useRef(null)

  // RFID via ref — usado pelo useSerial para evitar stale closure
  const onUidRef = useRef(uid => {
    const f = funcionarios.find(f => f.rfid === uid)
    if (!f || !f.ativo) { setRfidMsg(`Cartão lido: ${uid} — não encontrado.`); setTimeout(()=>setRfidMsg(''),5000); return }
    setRfidMsg(''); loginFunc(f, true)
  })
  // Atualiza o ref quando funcionarios muda
  useEffect(() => {
    onUidRef.current = uid => {
      const f = funcionarios.find(f => f.rfid === uid)
      if (!f || !f.ativo) { setRfidMsg(`Cartão lido: ${uid} — não encontrado.`); setTimeout(()=>setRfidMsg(''),5000); return }
      setRfidMsg(''); loginFunc(f, true)
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

  const loginFunc = (f, viaRfid = false) => {
    loadMarcacoes(f.id)
    if(f.pin && !viaRfid){setFunc(f);setStep('pin');setNumInput('');setErr('')}
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
    return <LoginShell leftPanel={leftPanel} value={numInput} onChange={setNumInput} onConfirm={submitNumero} onBack={isKiosk?undefined:onBack} serialStatus={serialStatus} error={err} />
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
  })


  const dayEm  = ementas.filter(e=>e.data===selDay)
  const getM   = eid => marcacoes.find(m=>m.funcionario_id===func.id&&m.ementa_id===eid)
  const marcar = async (em,n) => { const{error}=await supabase.from('cantina_marcacoes').upsert({funcionario_id:func.id,ementa_id:em.id,prato_num:n},{onConflict:'funcionario_id,ementa_id'}); await loadMarcacoes(func.id); return error }
  const cancelar = async eid => { const{error}=await supabase.from('cantina_marcacoes').delete().eq('funcionario_id',func.id).eq('ementa_id',eid); await loadMarcacoes(func.id); return error }

  const flash = (msg, error=false) => {
    setToast({msg,error}); clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(()=>setToast(null), 2200)
  }
  const doMarcar   = async (em,n,label,pratoLabel) => { if (await marcar(em,n)) flash('Erro ao guardar',true); else flash(`${label} marcado · ${pratoLabel}`) }
  const doCancelar = async (em,label) => { if (await cancelar(em.id)) flash('Erro ao guardar',true); else flash(`${label} desmarcado`) }

  const weekDays = days.slice(weekOffset*5, weekOffset*5+5)
  const hasPrev  = weekOffset > 0
  const hasNext  = days.length > (weekOffset+1)*5
  const goWeek = off => {
    const wd = days.slice(off*5, off*5+5)
    setWeekOffset(off)
    if (wd.length && !wd.includes(selDay)) setSelDay(wd[0])
  }
  const futureIds = new Set(ementas.filter(e=>e.data>=TODAY).map(e=>e.id))
  const nFuturas  = marcacoes.filter(m=>futureIds.has(m.ementa_id)).length
  const locked    = selDay===TODAY && bloqueado
  const arrow = off => ({width:64,flexShrink:0,background:C.surface,border:`2px solid ${C.border2}`,borderRadius:16,color:C.textSub,display:'flex',alignItems:'center',justifyContent:'center',cursor:off?'default':'pointer',opacity:off?0.35:1})

  return (
    <div style={{height:'100vh',background:C.bg,color:C.text,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
      {/* Topbar */}
      <div style={{height:84,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <Logo size="sm" showSub={false}/>
          <div style={{width:1,height:40,background:C.border}}/>
          <Avatar nome={func.nome} foto={func.foto} size={52}/>
          <div>
            <div style={{fontSize:24,fontWeight:700,lineHeight:1.1}}>Olá, {func.nome.split(' ')[0]}</div>
            <div style={{fontSize:14,color:C.textSub,marginTop:3}}>Nº {func.numero} · {nFuturas} {nFuturas===1?'refeição marcada':'refeições marcadas'}</div>
          </div>
        </div>
        <button onClick={logout} style={{height:60,padding:'0 28px',background:C.surface,border:`2px solid ${C.border2}`,borderRadius:14,color:C.text,fontSize:18,fontWeight:700,display:'inline-flex',alignItems:'center',gap:12,cursor:'pointer',fontFamily:'inherit'}}>
          <Icon name="logout" size={22}/>Terminar
        </button>
      </div>

      {/* Day strip */}
      <div style={{height:100,padding:'0 24px',display:'flex',gap:10,flexShrink:0}}>
        <button disabled={!hasPrev} onClick={()=>goWeek(weekOffset-1)} aria-label="Dias anteriores" style={arrow(!hasPrev)}><Icon name="chev-l" size={30}/></button>
        {weekDays.map(d => {
          const marks = Object.fromEntries(MEALS.map(m => { const em=ementas.find(e=>e.data===d&&e.tipo===m.tipo); return [m.tipo, !!(em&&getM(em.id))] }))
          return <DayChip key={d} d={d} sel={selDay===d} isToday={d===TODAY} marks={marks} locked={d===TODAY&&bloqueado} onClick={()=>setSelDay(d)}/>
        })}
        <button disabled={!hasNext} onClick={()=>goWeek(weekOffset+1)} aria-label="Dias seguintes" style={arrow(!hasNext)}><Icon name="chev-r" size={30}/></button>
      </div>

      {/* Linhas de refeição */}
      <div style={{flex:1,minHeight:0,padding:'16px 24px 24px',display:'flex',flexDirection:'column',gap:14}}>
        {MEALS.map(({tipo,emoji,label}) => {
          const em=dayEm.find(e=>e.tipo===tipo); if(!em) return null
          const marc=getM(em.id)
          const pratos=[1,2,3,4].map(n=>({n,label:em[`prato${n}_label`],desc:em[`prato${n}_desc`]})).filter(p=>p.label)
          const hour = tipo==='A' ? `${s.almoco_inicio} – ${s.almoco_fim}` : `${s.jantar_inicio} – ${s.jantar_fim}`
          return (
            <div key={tipo} style={{flex:1,minHeight:0,display:'grid',gridTemplateColumns:'210px repeat(4, minmax(0,1fr))',gap:12}}>
              <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:18,padding:18,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:30,lineHeight:1}}>{emoji}</div>
                  <div style={{fontSize:30,fontWeight:700,marginTop:10,lineHeight:1}}>{label}</div>
                  <div style={{fontSize:15,color:C.textSub,marginTop:6}}>{hour}</div>
                </div>
                {locked
                  ? <div style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:600,color:C.textSub,lineHeight:1.3}}><Icon name="lock" size={18}/>Já não é possível alterar</div>
                  : marc
                    ? <button onClick={()=>doCancelar(em,label)} style={{height:56,borderRadius:12,background:'transparent',border:`2px solid ${C.border2}`,color:C.text,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8}}><Icon name="x" size={18}/>Desmarcar</button>
                    : <div style={{fontSize:15,fontWeight:700,color:C.warn,display:'flex',alignItems:'center',gap:8}}><span style={{width:10,height:10,borderRadius:'50%',border:`2px solid ${C.warn}`}}/>Por marcar</div>}
              </div>
              {pratos.map(p => (
                <PratoCard key={p.n} label={p.label} desc={p.desc} locked={locked}
                  selected={marc?.prato_num===p.n} dim={!!marc&&marc.prato_num!==p.n}
                  onClick={()=>marc?.prato_num===p.n ? doCancelar(em,label) : doMarcar(em,p.n,label,p.label)}/>
              ))}
            </div>
          )
        })}
        {dayEm.length===0 && (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:C.textSub,fontSize:20}}>Sem ementa para este dia.</div>
        )}
      </div>

      {toast && (
        <div role="status" style={{position:'absolute',left:'50%',bottom:36,transform:'translateX(-50%)',background:C.text,color:toast.error?C.danger:C.bg,borderRadius:14,padding:'16px 26px',fontSize:18,fontWeight:700,display:'flex',alignItems:'center',gap:12,boxShadow:'0 16px 40px rgba(0,0,0,0.45)',whiteSpace:'nowrap'}}>
          <Icon name={toast.error?'warn':'check'} size={22}/>{toast.msg}
        </div>
      )}
    </div>
  )
}
