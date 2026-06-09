import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { C } from '../../constants/colors'
import { DEFAULTS } from '../../constants/settings'
import { getMeal, getNextMeal } from '../../utils/meal'
import { fmtHM, TODAY } from '../../utils/date'
import { ps } from '../../constants/pratos'
import Avatar from '../../components/Avatar'
import Icon from '../../components/Icon'
import Keypad from '../../components/Keypad'
import Logo from '../../components/Logo'
import PratoBtn from '../../components/PratoBtn'
import PratoTag from '../../components/PratoTag'
import useSerial from '../../hooks/useSerial'

export default function TerminalValidacoes({funcionarios,ementas,settings,onBack}) {
  const s = {...DEFAULTS,...settings}
  const [numInput,   setNumInput]   = useState('')
  const [status,     setStatus]     = useState(null)
  const [recentes,   setRecentes]   = useState([])
  const [manualMode, setManualMode] = useState(false)
  const [tick,       setTick]       = useState(0)   // força re-render a cada 30s

  // Relógio: reavalia getMeal() periodicamente
  useEffect(() => {
    const id = setInterval(() => setTick(t=>t+1), 30000)
    return () => clearInterval(id)
  }, [])

  const meal = getMeal(s)   // null quando fora do horário

  // Ref para process() — evita stale closure no useSerial
  const processRef = useRef(null)
  const onUidRef   = useRef(uid => { if(processRef.current) processRef.current(uid,true) })

  const {serialStatus,connect:connectSerial} = useSerial(onUidRef)

  const reset = () => { setNumInput(''); setStatus(null); setManualMode(false) }

  const confirmarConsumo = async (func,ementa,pratoNum) => {
    const {data,error} = await supabase.from('cantina_consumos').insert({funcionario_id:func.id,ementa_id:ementa.id,prato_num:pratoNum}).select().single()
    if(error) return
    const pk=`prato${pratoNum}`,pratoLabel=ementa[pk+'_label'],pratoDesc=ementa[pk+'_desc']
    setRecentes(p=>[{id:data.id,validado_em:data.validado_em,nome:func.nome,foto:func.foto,pratoLabel,pratoDesc},...p].slice(0,5))
    setStatus({type:'ok',func,pratoLabel,pratoDesc})
    setTimeout(reset,5000)
  }

  const process = useCallback(async (val,isRfid=false) => {
    const v = val.replace(/[^\x21-\x7E]/g,'').trim(); if(!v) return
    // Verifica horário em tempo real via s (sempre a prop atualizada)
    const currentMeal = getMeal({...DEFAULTS,...settings})
    if(!currentMeal) return   // cantina encerrada
    setNumInput('')
    const func = isRfid
      ? funcionarios.find(f=>f.rfid===v)
      : funcionarios.find(f=>f.numero===v||f.numero===v.padStart(3,'0'))
    if(!func){setStatus({type:'error',msg:'Funcionário não encontrado'});setTimeout(reset,3000);return}
    const ementa = ementas.find(e=>e.data===TODAY&&e.tipo===currentMeal)
    if(!ementa){setStatus({type:'error',msg:'Sem ementa para este momento'});setTimeout(reset,3000);return}
    const{data:exC}=await supabase.from('cantina_consumos').select('prato_num').eq('funcionario_id',func.id).eq('ementa_id',ementa.id).maybeSingle()
    if(exC){const pk=`prato${exC.prato_num}`;setStatus({type:'dup',func,pratoLabel:ementa[pk+'_label'],pratoDesc:ementa[pk+'_desc']});setTimeout(reset,6000);return}
    const{data:marc}=await supabase.from('cantina_marcacoes').select('prato_num').eq('funcionario_id',func.id).eq('ementa_id',ementa.id).maybeSingle()
    if(!marc){setStatus({type:'no-marc',func,ementa});return}
    confirmarConsumo(func,ementa,marc.prato_num)
  },[funcionarios,ementas,settings])

  // Mantém processRef sempre atualizado
  useEffect(() => { processRef.current = process }, [process])

  // HID fallback
  const rfidRef=useRef(''); const rfidTimer=useRef(null)
  useEffect(() => {
    if(status?.type==='no-marc') return
    const h = e => {
      if(e.key==='Enter'){if(rfidRef.current){process(rfidRef.current,true);rfidRef.current=''}return}
      if(e.key.length!==1) return
      rfidRef.current+=e.key; clearTimeout(rfidTimer.current)
      rfidTimer.current=setTimeout(()=>{rfidRef.current=''},200)
    }
    window.addEventListener('keydown',h)
    return()=>{window.removeEventListener('keydown',h);clearTimeout(rfidTimer.current)}
  },[status,process])

  const next = getNextMeal(s)

  const renderMain = () => {
    // Cantina encerrada
    if(!meal) return (
      <div style={{background:C.surface,border:`2px solid ${C.danger}33`,borderRadius:24,padding:'52px 32px 48px',textAlign:'center'}}>
        <div style={{fontSize:64,marginBottom:16}}>🔒</div>
        <div style={{fontSize:32,fontWeight:900,color:C.danger,letterSpacing:2,marginBottom:16}}>CANTINA ENCERRADA</div>
        {next
          ? <div style={{fontSize:15,color:C.textSub}}>
              Próxima refeição: <strong style={{color:C.text}}>{next.tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</strong> às <strong style={{color:C.yellow}}>{next.hora}</strong>
            </div>
          : <div style={{fontSize:15,color:C.textMuted}}>Reabre amanhã</div>}
      </div>
    )

    if(status?.type==='error') return (
      <div style={{background:C.surface,border:`2px solid ${C.danger}44`,borderRadius:24,padding:'48px 32px',textAlign:'center'}}>
        <div style={{width:72,height:72,borderRadius:'50%',background:C.dangerBg,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><Icon name="warn" size={36} color={C.danger}/></div>
        <div style={{fontSize:22,fontWeight:700,color:C.danger}}>{status.msg}</div>
      </div>
    )

    if(status?.type==='ok') {
      const p=ps(status.pratoLabel)
      return (
        <div style={{background:C.surface,border:`2px solid ${C.success}44`,borderRadius:24,padding:'40px 32px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>
          <Avatar nome={status.func.nome} foto={status.func.foto} size={100}/>
          <div style={{fontSize:28,fontWeight:800,color:C.text}}>{status.func.nome}</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:C.successBg,border:`1px solid ${C.success}44`,borderRadius:12,padding:'12px 24px'}}>
            <Icon name="check" size={20} color={C.success}/><span style={{fontSize:18,fontWeight:700,color:C.success}}>CONSUMO REGISTADO</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,background:p.bg,border:`1px solid ${p.border}`,borderRadius:14,padding:'14px 28px'}}>
            <PratoTag label={status.pratoLabel} large={true}/><span style={{fontSize:18,color:C.text,fontWeight:500}}>{status.pratoDesc}</span>
          </div>
        </div>
      )
    }

    if(status?.type==='dup') {
      const p=ps(status.pratoLabel)
      return (
        <div style={{background:C.surface,border:`2px solid ${C.warn}44`,borderRadius:24,padding:'40px 32px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>
          <Avatar nome={status.func.nome} foto={status.func.foto} size={100}/>
          <div style={{fontSize:28,fontWeight:800,color:C.text}}>{status.func.nome}</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:C.warnBg,border:`1px solid ${C.warn}44`,borderRadius:12,padding:'12px 24px'}}>
            <Icon name="warn" size={20} color={C.warn}/><span style={{fontSize:16,fontWeight:700,color:C.warn}}>JÁ CONSUMIU ESTA REFEIÇÃO</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,background:p.bg,border:`1px solid ${p.border}`,borderRadius:14,padding:'14px 28px'}}>
            <PratoTag label={status.pratoLabel} large={true}/><span style={{fontSize:18,color:C.text,fontWeight:500}}>{status.pratoDesc}</span>
          </div>
        </div>
      )
    }

    if(status?.type==='no-marc') return (
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24,padding:'28px 32px'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
          <Avatar nome={status.func.nome} foto={status.func.foto} size={70}/>
          <div><div style={{fontSize:22,fontWeight:700,color:C.text}}>{status.func.nome}</div><div style={{fontSize:13,color:C.textSub,marginTop:2}}>Sem marcação prévia</div></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,background:C.warnBg,border:`1px solid ${C.warn}33`,borderRadius:10,padding:'10px 16px',marginBottom:16,fontSize:14,color:C.warn,fontWeight:600}}>
          <Icon name="warn" size={16} color={C.warn}/> Selecione o prato a servir:
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[1,2,3,4].map(n=>{const l=status.ementa[`prato${n}_label`],d=status.ementa[`prato${n}_desc`];if(!l)return null;return<PratoBtn key={n} label={l} desc={d} selected={false} onClick={()=>confirmarConsumo(status.func,status.ementa,n)}/>})}
        </div>
        <button onClick={reset} style={{marginTop:12,width:'100%',height:48,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,fontSize:14,color:C.textSub}}>Cancelar</button>
      </div>
    )

    // Standby — aguarda cartão ou código
    if(!manualMode) return (
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24,overflow:'hidden'}}>
        <div style={{padding:'44px 32px 40px',textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:100,height:100,borderRadius:'50%',background:C.yellow+'18',border:`2px solid ${C.yellow}44`,marginBottom:22}}>
            <Icon name="card" size={46} color={C.yellow}/>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8}}>{meal==='A'?'🌞 Almoço':'🌙 Jantar'}</div>
          <div style={{fontSize:16,color:C.textSub,marginBottom:6}}>Aproxime o cartão</div>
          {serialStatus==='connected'
            ? <div style={{fontSize:13,color:C.success,fontWeight:600}}>Leitor ativo · à espera de cartão</div>
            : serialStatus==='connecting'
            ? <div style={{fontSize:13,color:C.warn}}>A ligar ao leitor…</div>
            : <div style={{fontSize:13,color:C.danger}}>Leitor não ligado — usa o botão no topo</div>}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,padding:'18px 32px'}}>
          <button onClick={()=>setManualMode(true)}
            style={{width:'100%',height:56,background:C.surface2,border:`1.5px solid ${C.border2}`,borderRadius:12,fontSize:15,fontWeight:600,color:C.textSub,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.yellow+'66';e.currentTarget.style.color=C.text}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.textSub}}>
            <Icon name="users" size={18} color={C.textSub}/> Introduzir código manualmente
          </button>
        </div>
      </div>
    )

    return (
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24}}>
        <div style={{padding:'24px 32px 20px',textAlign:'center',borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:4}}>Código de funcionário</div>
          <div style={{background:C.surface3,border:`1.5px solid ${C.border2}`,borderRadius:12,height:60,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',margin:'0 0 0'}}>
            {numInput?<span style={{fontSize:28,letterSpacing:6,color:C.yellow,fontWeight:700}}>{numInput}</span>:<span style={{color:C.textMuted,fontSize:14}}>Código</span>}
          </div>
        </div>
        <div style={{padding:'20px 32px 24px'}}>
          <Keypad value={numInput} onChange={setNumInput} onConfirm={()=>process(numInput)} confirmLabel="✓"/>
          <button onClick={()=>{setManualMode(false);setNumInput('')}} style={{width:'100%',height:48,marginTop:10,background:'transparent',border:`1px solid ${C.border}`,borderRadius:10,fontSize:13,color:C.textMuted}}>← Voltar ao leitor de cartões</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 20px',height:56,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <Logo size="sm" showSub={false}/>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:13,color:meal?C.textMuted:C.danger}}>
            {meal==='A'?'🌞 Almoço':meal==='J'?'🌙 Jantar':'⛔ Encerrada'} · {new Date().toLocaleDateString('pt-PT')}
          </span>
          {navigator.serial && (
            serialStatus==='connected'
              ? <span style={{fontSize:11,color:C.success,background:C.successBg,border:`1px solid ${C.success}33`,borderRadius:6,padding:'3px 10px',fontWeight:600,display:'flex',alignItems:'center',gap:5}}><span style={{width:6,height:6,borderRadius:'50%',background:C.success,display:'inline-block'}}/>Leitor ligado</span>
              : serialStatus==='connecting'
              ? <span style={{fontSize:11,color:C.warn,background:C.warnBg,border:`1px solid ${C.warn}33`,borderRadius:6,padding:'3px 10px'}}>A ligar…</span>
              : <button onClick={connectSerial} style={{fontSize:12,fontWeight:600,color:C.yellow,background:C.yellow+'18',border:`1px solid ${C.yellow}55`,borderRadius:8,padding:'5px 14px',height:34}}>{serialStatus==='error'?'⚠ Religar':'Conectar leitor'}</button>
          )}
          <button onClick={onBack} style={{background:'none',border:'none',color:C.textMuted,fontSize:13}}>← Sair</button>
        </div>
      </div>
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 28px'}}>
          <div style={{width:'100%',maxWidth:460}}>{renderMain()}</div>
        </div>
        <div style={{width:280,background:C.surface,borderLeft:`1px solid ${C.border}`,display:'flex',flexDirection:'column',overflowY:'auto',flexShrink:0}}>
          <div style={{padding:'16px 18px 12px',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:1,borderBottom:`1px solid ${C.border}`}}>Últimas validações</div>
          {recentes.length===0
            ? <div style={{padding:32,textAlign:'center',color:C.textMuted,fontSize:13}}>Sem validações</div>
            : recentes.map((r,i) => {
              const p=ps(r.pratoLabel),isFirst=i===0
              return (
                <div key={r.id} style={{padding:isFirst?'18px':'14px 18px',borderBottom:`1px solid ${C.border}`,background:isFirst?C.surface2:'transparent'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                    <Avatar nome={r.nome} foto={r.foto} size={isFirst?46:36}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:isFirst?16:14,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.nome}</div>
                      <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{fmtHM(r.validado_em)}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10,background:p.bg,border:`1px solid ${p.border}`,borderRadius:8,padding:isFirst?'8px 12px':'6px 10px'}}>
                    <PratoTag label={r.pratoLabel} large={isFirst}/><span style={{fontSize:isFirst?14:12,color:C.textSub,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.pratoDesc}</span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
