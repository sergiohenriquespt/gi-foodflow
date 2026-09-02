import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { insertVisitantes } from '../../lib/queries'
import { C } from '../../constants/colors'
import { DEFAULTS } from '../../constants/settings'
import { getMeal, getNextMeal, toMin } from '../../utils/meal'
import { fmtHM, TODAY, WD, MN } from '../../utils/date'
import { ps } from '../../constants/pratos'
import Avatar from '../../components/Avatar'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
import LoginShell, { ARR } from '../../components/LoginShell'
import PratoTag from '../../components/PratoTag'
import PratoBtn from '../../components/PratoBtn'
import useSerial from '../../hooks/useSerial'

// Cores específicas dos takeovers deste ecrã — não são tokens globais
const V = {
  standby:'#0f1217', panel:'#16191f', panelHi:'#1a1f27',
  ok:'#0d2e22', okCard:'#0a3a2a',
  dup:'#2d2208', dupCard:'#3a2c0a',
  no:'#2a1315', noCard:'#371619', noBtn:'#3f1c1f',
}

function Pessoa({func, ring, avatar=220, font=60, width=360, metaColor}) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:avatar>200?20:16,flexShrink:0,width}}>
      <Avatar nome={func.nome} foto={func.foto} size={avatar} ring={ring}/>
      <div style={{textAlign:'center'}}>
        {func.nome.split(' ').map((w,i) => (
          <div key={i} style={{fontSize:font,lineHeight:1,color:'#fff',letterSpacing:'-0.01em'}}>{w}</div>
        ))}
        <div style={{fontSize:avatar>200?15:14,color:metaColor,marginTop:avatar>200?10:8,letterSpacing:'0.04em'}}>Nº {func.numero}</div>
      </div>
    </div>
  )
}

export default function TerminalValidacoes({funcionarios,ementas,settings,onBack}) {
  const s = {...DEFAULTS,...settings}
  const [numInput,   setNumInput]   = useState('')
  const [status,     setStatus]     = useState(null)
  const [recentes,   setRecentes]   = useState([])
  const [contadores, setContadores] = useState([])
  const [manualMode, setManualMode] = useState(false)
  const [visitorMode, setVisitorMode] = useState(false)
  const [visitorPrato,setVisitorPrato] = useState(null)
  const [visitorQtd,  setVisitorQtd]   = useState(1)
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

  const ementaAtual = meal ? ementas.find(e=>e.data===TODAY&&e.tipo===meal) : null

  const loadContadores = async em => {
    if(!em){ setContadores([]); return }
    const [{data:marcs},{data:cons}] = await Promise.all([
      supabase.from('cantina_marcacoes').select('prato_num').eq('ementa_id',em.id),
      supabase.from('cantina_consumos').select('prato_num').eq('ementa_id',em.id),
    ])
    setContadores([1,2,3,4].map(n => {
      const label = em[`prato${n}_label`]
      if(!label) return null
      const total  = (marcs||[]).filter(m=>m.prato_num===n).length
      const served = (cons ||[]).filter(c=>c.prato_num===n).length
      return {n,label,total,left:Math.max(0,total-served)}
    }).filter(Boolean))
  }

  const loadRecentes = async em => {
    if(!em) return
    const {data} = await supabase.from('cantina_consumos').select('*').eq('ementa_id',em.id).order('validado_em',{ascending:false}).limit(5)
    if(!data) return
    setRecentes(data.map(c => {
      const f = funcionarios.find(f=>f.id===c.funcionario_id)
      const pk = `prato${c.prato_num}`
      return {id:c.id,validado_em:c.validado_em,nome:f?.nome||'—',foto:f?.foto,pratoLabel:em[pk+'_label'],pratoDesc:em[pk+'_desc']}
    }))
  }

  useEffect(() => { loadContadores(ementaAtual); loadRecentes(ementaAtual) }, [ementaAtual?.id])

  const confirmarConsumo = async (func,ementa,pratoNum) => {
    const {data,error} = await supabase.from('cantina_consumos').insert({funcionario_id:func.id,ementa_id:ementa.id,prato_num:pratoNum}).select().single()
    if(error) return
    const pk=`prato${pratoNum}`,pratoLabel=ementa[pk+'_label'],pratoDesc=ementa[pk+'_desc']
    setRecentes(p=>[{id:data.id,validado_em:data.validado_em,nome:func.nome,foto:func.foto,pratoLabel,pratoDesc},...p].slice(0,5))
    loadContadores(ementa)
    setStatus({type:'ok',func,pratoLabel,pratoDesc})
    setTimeout(reset,5000)
  }

  const cancelVisitorMode = () => { setVisitorMode(false); setVisitorPrato(null); setVisitorQtd(1) }

  const confirmarVisitantes = async () => {
    if(!visitorPrato || !ementaAtual) return
    const qtd = visitorQtd
    const {error} = await insertVisitantes(ementaAtual.id, visitorPrato, qtd)
    if(error) return
    const pk = `prato${visitorPrato}`
    cancelVisitorMode()
    setStatus({type:'visitor-ok',qtd,pratoLabel:ementaAtual[pk+'_label'],pratoDesc:ementaAtual[pk+'_desc']})
    setTimeout(reset,3000)
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
    const{data:exC}=await supabase.from('cantina_consumos').select('prato_num,validado_em').eq('funcionario_id',func.id).eq('ementa_id',ementa.id).maybeSingle()
    if(exC){const pk=`prato${exC.prato_num}`;setStatus({type:'dup',func,pratoLabel:ementa[pk+'_label'],pratoDesc:ementa[pk+'_desc'],validadoEm:exC.validado_em});setTimeout(reset,6000);return}
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

  // ── Modo manual: mesmo invólucro do login dos terminais (Parte 1) ──
  if (manualMode && !status) {
    const leftPanel = (
      <div>
        <div style={{fontSize:14,fontWeight:700,color:ARR.ink3,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:16}}>Validação manual</div>
        <div style={{fontSize:132,lineHeight:0.9,color:ARR.ink,letterSpacing:'-0.01em',marginBottom:4}}>Código.</div>
        <div style={{fontStyle:'italic',fontSize:56,lineHeight:1.05,color:ARR.ink2}}>Introduz o número do funcionário.</div>
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
      </div>
    )
    return <LoginShell leftPanel={leftPanel} value={numInput} onChange={setNumInput} onConfirm={()=>process(numInput)} serialStatus={serialStatus}
      belowKeypad={<button onClick={()=>{setManualMode(false);setNumInput('')}} style={{width:'100%',height:48,marginTop:12,background:'transparent',border:`1px solid ${ARR.border}`,borderRadius:10,fontSize:13,color:ARR.ink3,cursor:'pointer'}}>← Voltar ao leitor</button>} />
  }

  const now = new Date()
  const timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0')
  const dateStr = `${WD[now.getDay()]} ${String(now.getDate()).padStart(2,'0')} ${MN[now.getMonth()]}`
  const mealTag = meal ? (meal==='A'?'🌞 Almoço':'🌙 Jantar') : null

  const bg = !meal || !status ? V.standby
    : status.type==='ok' || status.type==='visitor-ok' ? V.ok
    : status.type==='dup'     ? V.dup
    : status.type==='no-marc' ? V.no
    : C.bg
  const glow = (status?.type==='ok' || status?.type==='visitor-ok') ? 'radial-gradient(circle at 70% 30%, rgba(52,211,153,0.32) 0%, transparent 60%)'
    : status?.type==='dup'          ? 'radial-gradient(circle at 30% 30%, rgba(251,191,36,0.28) 0%, transparent 60%)'
    : status?.type==='no-marc'      ? 'radial-gradient(circle at 70% 30%, rgba(248,113,113,0.26) 0%, transparent 60%)'
    : null
  const isStandby = !status && meal

  const renderTop = () => {
    if (status) {
      const tint = (status.type==='ok'||status.type==='visitor-ok') ? 'rgba(232,249,236,0.6)' : status.type==='dup' ? 'rgba(254,243,199,0.65)' : status.type==='no-marc' ? 'rgba(254,226,226,0.6)' : C.textMuted
      return (
        <div style={{height:46,padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,position:'relative',zIndex:1,color:tint,fontSize:12}}>
          <Logo size="sm" showSub={false}/>
          <span style={{fontSize:13}}>{mealTag ? `${mealTag} · ${timeStr}` : timeStr}</span>
        </div>
      )
    }
    return (
      <div style={{height:50,padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,position:'relative',zIndex:1}}>
        <Logo size="sm" showSub={false}/>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:13,color:C.textSub}}>{mealTag?`${mealTag} · `:''}{dateStr} · <strong style={{color:C.text}}>{timeStr}</strong></span>
          {!meal
            ? <span style={{display:'inline-flex',alignItems:'center',gap:6,color:C.textMuted,fontWeight:700,fontSize:11,letterSpacing:'0.06em'}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:C.textMuted}}/>LEITOR EM PAUSA
              </span>
            : serialStatus==='connected'
            ? <span style={{display:'inline-flex',alignItems:'center',gap:6,color:C.success,fontWeight:700,fontSize:11,letterSpacing:'0.06em'}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:C.success,boxShadow:`0 0 6px ${C.success}`}}/>LEITOR LIGADO
              </span>
            : serialStatus==='connecting'
            ? <span style={{fontSize:11,color:C.warn,fontWeight:700,letterSpacing:'0.06em'}}>A LIGAR…</span>
            : navigator.serial
            ? <button onClick={connectSerial} style={{fontSize:12,fontWeight:600,color:C.yellow,background:C.yellow+'18',border:`1px solid ${C.yellow}55`,borderRadius:99,padding:'5px 14px',height:30,cursor:'pointer'}}>{serialStatus==='error'?'⚠ Religar':'Conectar leitor'}</button>
            : null}
          <button onClick={onBack} style={{background:'none',border:'none',color:C.textMuted,fontSize:13,cursor:'pointer'}}>← Sair</button>
        </div>
      </div>
    )
  }

  const renderMain = () => {
    // Serviço encerrado — standby neutro
    if(!meal) {
      const cur = now.getHours()*60 + now.getMinutes()
      const ended = cur > toMin(s.jantar_fim) ? {label:'jantar',hora:s.jantar_fim}
        : cur > toMin(s.almoco_fim) ? {label:'almoço',hora:s.almoco_fim} : null
      return (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1}}>
          <div style={{textAlign:'center'}}>
            <div style={{width:200,height:200,margin:'0 auto 36px',borderRadius:'50%',background:'rgba(108,118,128,0.10)',border:'2px solid rgba(108,118,128,0.40)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="clock" size={104} color={C.textMuted}/>
            </div>
            <div style={{fontSize:84,lineHeight:0.95,color:C.text,marginBottom:14,letterSpacing:'-0.01em'}}>Serviço encerrado</div>
            {ended && (
              <div style={{fontSize:21,color:C.textSub,lineHeight:1.5,maxWidth:620,margin:'0 auto'}}>
                O {ended.label} terminou às <strong style={{color:C.text}}>{ended.hora}</strong>.
              </div>
            )}
            <div style={{marginTop:32,display:'inline-flex',alignItems:'center',gap:16,background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,padding:'14px 26px'}}>
              <span style={{fontSize:24}}>{next?.tipo==='A'?'🌞':'🌙'}</span>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize:12,color:C.textMuted,letterSpacing:'0.12em',fontWeight:700,textTransform:'uppercase'}}>Próximo serviço</div>
                <div style={{fontSize:18,fontWeight:700,color:C.text,marginTop:2,whiteSpace:'nowrap'}}>
                  {next ? `${next.tipo==='A'?'Almoço':'Jantar'} · abre às ${next.hora}` : 'Reabre amanhã'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Erro — takeover simples
    if(status?.type==='error') return (
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:100,height:100,borderRadius:'50%',background:C.dangerBg,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
            <Icon name="warn" size={48} color={C.danger}/>
          </div>
          <div style={{fontSize:30,fontWeight:700,color:C.danger}}>{status.msg}</div>
        </div>
      </div>
    )

    // Sucesso — takeover verde (consumo de funcionário ou visitante)
    if(status?.type==='ok' || status?.type==='visitor-ok') {
      const isVisitor = status.type==='visitor-ok'
      const titulo = isVisitor ? `${status.qtd} VISITANTE${status.qtd>1?'S':''} REGISTADO${status.qtd>1?'S':''}` : 'CONSUMO REGISTADO'
      return (
        <div style={{flex:1,display:'flex',alignItems:'center',padding:'20px 56px 36px',gap:48,position:'relative',zIndex:1}}>
          {isVisitor
            ? <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20,flexShrink:0,width:360}}>
                <div style={{width:220,height:220,borderRadius:'50%',background:'rgba(52,211,153,0.16)',border:'1.5px solid rgba(52,211,153,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon name="users" size={104} color="#34d399"/>
                </div>
                <div style={{fontSize:56,lineHeight:1,color:'#fff'}}>Visitantes</div>
              </div>
            : <Pessoa func={status.func} ring="rgba(52,211,153,0.6)" metaColor="rgba(232,249,236,0.6)"/>
          }
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:24}}>
            <div style={{display:'flex',alignItems:'center',gap:22}}>
              <div style={{width:132,height:132,borderRadius:'50%',background:'#34d399',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 16px rgba(52,211,153,0.18), 0 24px 64px rgba(0,0,0,0.4)',flexShrink:0}}>
                <Icon name="check" size={76} color={V.ok}/>
              </div>
              <div>
                <div style={{fontSize:13,color:'rgba(232,249,236,0.65)',letterSpacing:'0.16em',fontWeight:700,marginBottom:6}}>{titulo}</div>
                <div style={{fontSize:96,lineHeight:0.9,color:'#fff'}}>Bom apetite.</div>
              </div>
            </div>
            <div style={{background:V.okCard,border:'1px solid rgba(52,211,153,0.3)',borderRadius:22,padding:'24px 28px',marginTop:6}}>
              <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:6}}>
                <PratoTag label={status.pratoLabel} large/>
                <span style={{fontSize:13,color:'rgba(232,249,236,0.5)',letterSpacing:'0.14em',fontWeight:700}}>· {isVisitor?'PRATO':'O TEU PRATO'}</span>
              </div>
              <div style={{fontSize:42,lineHeight:1.1,color:'#fff',marginTop:8}}>{status.pratoDesc}</div>
            </div>
          </div>
        </div>
      )
    }

    // Duplicado — takeover âmbar
    if(status?.type==='dup') {
      const mins = status.validadoEm ? Math.max(0,Math.round((Date.now()-new Date(status.validadoEm).getTime())/60000)) : null
      return (
        <div style={{flex:1,display:'flex',alignItems:'center',padding:'20px 56px 36px',gap:48,position:'relative',zIndex:1}}>
          <Pessoa func={status.func} ring="rgba(251,191,36,0.55)" metaColor="rgba(254,243,199,0.6)"/>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:24}}>
            <div style={{display:'flex',alignItems:'center',gap:22}}>
              <div style={{width:132,height:132,borderRadius:'50%',background:'#fbbf24',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 16px rgba(251,191,36,0.18), 0 24px 64px rgba(0,0,0,0.4)',flexShrink:0}}>
                <Icon name="warn" size={70} color={V.dup}/>
              </div>
              <div>
                <div style={{fontSize:13,color:'rgba(254,243,199,0.65)',letterSpacing:'0.16em',fontWeight:700,marginBottom:6}}>JÁ FOI VALIDADA</div>
                <div style={{fontSize:84,lineHeight:0.9,color:'#fff'}}>Calma aí.</div>
              </div>
            </div>
            <div style={{background:V.dupCard,border:'1px solid rgba(251,191,36,0.28)',borderRadius:22,padding:'24px 28px'}}>
              {status.validadoEm && (
                <div style={{fontSize:13,color:'rgba(254,243,199,0.55)',letterSpacing:'0.14em',fontWeight:700,marginBottom:6}}>
                  REGISTADA ÀS {fmtHM(status.validadoEm)}{mins!=null ? ` · HÁ ${mins} ${mins===1?'MINUTO':'MINUTOS'}` : ''}
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',gap:18,marginTop:10}}>
                <PratoTag label={status.pratoLabel} large/>
                <div style={{fontSize:32,color:'#fff',lineHeight:1.1}}>{status.pratoDesc}</div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Sem marcação — takeover vermelho + seleção de prato
    if(status?.type==='no-marc') return (
      <div style={{flex:1,display:'flex',alignItems:'center',padding:'16px 48px 28px',gap:40,position:'relative',zIndex:1}}>
        <Pessoa func={status.func} ring="rgba(248,113,113,0.55)" avatar={180} font={52} width={300} metaColor="rgba(254,226,226,0.6)"/>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:18}}>
          <div style={{display:'flex',alignItems:'center',gap:18}}>
            <div style={{width:96,height:96,borderRadius:'50%',background:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 12px rgba(248,113,113,0.16), 0 16px 48px rgba(0,0,0,0.4)',flexShrink:0}}>
              <Icon name="x" size={54} color={V.no}/>
            </div>
            <div>
              <div style={{fontSize:12,color:'rgba(254,226,226,0.6)',letterSpacing:'0.16em',fontWeight:700,marginBottom:4}}>SEM MARCAÇÃO PRÉVIA</div>
              <div style={{fontSize:56,lineHeight:0.95,color:'#fff'}}>Sem marcação.</div>
            </div>
          </div>
          <div style={{background:V.noCard,border:'1px solid rgba(248,113,113,0.22)',borderRadius:20,padding:'18px 20px'}}>
            <div style={{fontSize:11,fontWeight:700,color:'rgba(254,226,226,0.65)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12}}>Escolhe o prato a servir</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[1,2,3,4].map(n => {
                const label = status.ementa[`prato${n}_label`]
                const desc  = status.ementa[`prato${n}_desc`]
                if(!label) return null
                return (
                  <button key={n} onClick={()=>confirmarConsumo(status.func,status.ementa,n)}
                    style={{textAlign:'left',cursor:'pointer',background:V.noBtn,border:'1px solid rgba(248,113,113,0.18)',borderRadius:14,padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}}>
                    <PratoTag label={label}/>
                    <div style={{fontSize:14,lineHeight:1.3,color:'#fff',fontWeight:500,textWrap:'pretty'}}>{desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
          <button onClick={reset} style={{alignSelf:'flex-start',background:'none',border:'none',color:'rgba(254,226,226,0.5)',fontSize:13,textDecoration:'underline',cursor:'pointer',padding:0}}>Cancelar</button>
        </div>
      </div>
    )

    // Visitantes — seleção de prato + quantidade
    if(visitorMode) return (
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1,padding:'20px 56px'}}>
        <div style={{width:'100%',maxWidth:640,background:V.panel,border:`1px solid ${C.border}`,borderRadius:24,padding:'32px 36px',display:'flex',flexDirection:'column',gap:22}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.textMuted,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:6}}>Visitantes{mealTag?` · ${mealTag}`:''}</div>
            <div style={{fontSize:40,lineHeight:1,color:C.text}}>Registar consumo</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[1,2,3,4].map(n => {
              const label = ementaAtual?.[`prato${n}_label`]
              const desc  = ementaAtual?.[`prato${n}_desc`]
              if(!label) return null
              return <PratoBtn key={n} label={label} desc={desc} selected={visitorPrato===n} onClick={()=>setVisitorPrato(n)}/>
            })}
          </div>
          {visitorPrato && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:28,padding:'18px 0'}}>
              <button onClick={()=>setVisitorQtd(q=>Math.max(1,q-1))}
                style={{width:64,height:64,borderRadius:16,background:C.surface2,border:`1px solid ${C.border}`,color:C.text,fontSize:32,fontWeight:700,cursor:'pointer'}}>−</button>
              <div style={{fontSize:56,fontWeight:900,color:C.yellow,minWidth:80,textAlign:'center'}}>{visitorQtd}</div>
              <button onClick={()=>setVisitorQtd(q=>Math.min(50,q+1))}
                style={{width:64,height:64,borderRadius:16,background:C.surface2,border:`1px solid ${C.border}`,color:C.text,fontSize:32,fontWeight:700,cursor:'pointer'}}>+</button>
            </div>
          )}
          <div style={{display:'flex',gap:12,marginTop:4}}>
            <button onClick={cancelVisitorMode}
              style={{flex:1,height:52,background:'transparent',border:`1px solid ${C.border}`,borderRadius:12,color:C.textSub,fontSize:15,fontWeight:600,cursor:'pointer'}}>
              Cancelar
            </button>
            <button disabled={!visitorPrato || !ementaAtual} onClick={confirmarVisitantes}
              style={{flex:2,height:52,background:visitorPrato?C.yellow:C.surface2,border:'none',borderRadius:12,color:visitorPrato?C.bg:C.textMuted,fontSize:15,fontWeight:700,cursor:visitorPrato?'pointer':'default'}}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )

    // Standby — hero + últimas validações
    return (
      <div style={{flex:1,display:'flex',minHeight:0,position:'relative',zIndex:1}}>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={{position:'relative',width:280,height:280,margin:'0 auto 28px'}}>
              {[0,0.7,1.4].map(d => (
                <div key={d} style={{position:'absolute',inset:0,borderRadius:'50%',border:`2px solid ${C.yellow}`,animation:`ff-pulse-ring 2.4s ease-out ${d}s infinite`}} />
              ))}
              <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'radial-gradient(circle at center, rgba(224,203,75,0.18) 0%, rgba(224,203,75,0.02) 70%)',border:'2px solid rgba(224,203,75,0.50)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name="card-tap" size={140} color={C.yellow}/>
              </div>
            </div>
            <div style={{fontSize:72,lineHeight:0.95,color:C.text,letterSpacing:'-0.01em'}}>Encosta o cartão</div>
            <button onClick={()=>setManualMode(true)}
              style={{marginTop:32,height:54,padding:'0 30px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,color:C.textSub,fontSize:15,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,transition:'border-color 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.yellow}55`;e.currentTarget.style.color=C.text}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSub}}>
              Introduzir código manualmente
            </button>
            <button onClick={()=>setVisitorMode(true)}
              style={{marginTop:12,height:54,padding:'0 30px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,color:C.textMuted,fontSize:15,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,transition:'border-color 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.yellow}55`;e.currentTarget.style.color=C.text}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted}}>
              Registar visitante(s)
            </button>
          </div>
        </div>
        <div style={{width:300,background:V.panel,borderLeft:`1px solid ${C.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'16px 20px 12px',fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:'0.14em',textTransform:'uppercase',borderBottom:`1px solid ${C.border}`}}>Últimas validações</div>
          {recentes.length===0
            ? <div style={{padding:32,textAlign:'center',color:C.textMuted,fontSize:13}}>Sem validações</div>
            : recentes.map((r,i) => {
              const p = ps(r.pratoLabel)
              return (
                <div key={r.id} style={{padding:'12px 20px',borderBottom:`1px solid ${p.border}`,display:'flex',alignItems:'center',gap:12,background:p.bg,outline:i===0?`1.5px solid ${p.border}`:'none',outlineOffset:'-1.5px'}}>
                  <Avatar nome={r.nome} foto={r.foto} size={36}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.nome}</div>
                    <div style={{fontSize:11,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      <span style={{color:p.color,fontWeight:600}}>{r.pratoLabel}</span>
                      <span style={{color:C.textMuted}}> · {fmtHM(r.validado_em)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  return (
    <div style={{height:'100vh',background:bg,color:C.text,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
      {glow && <div style={{position:'absolute',inset:0,pointerEvents:'none',background:glow}} />}
      {renderTop()}
      {renderMain()}
      {isStandby && contadores.length>0 && (
        <div style={{borderTop:`1px solid ${C.border}`,background:V.panel,padding:'14px 28px',display:'flex',alignItems:'center',gap:14,flexShrink:0,position:'relative',zIndex:1}}>
          <div style={{fontSize:11,color:C.textMuted,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase'}}>Faltam servir</div>
          {contadores.map(c => {
            const p = ps(c.label)
            return (
              <div key={c.n} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 14px',background:p.bg,border:`1px solid ${p.border}`,borderRadius:99,flex:1,justifyContent:'space-between'}}>
                <PratoTag label={c.label}/>
                <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                  <span style={{fontSize:28,fontWeight:900,color:p.color,lineHeight:1}}>{c.left}</span>
                  <span style={{fontSize:12,color:C.textMuted}}>/ {c.total}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
