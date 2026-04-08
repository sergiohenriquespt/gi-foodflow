import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cqgpgryldmzogfygpybl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZ3BncnlsZG16b2dmeWdweWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDMwMjksImV4cCI6MjA4ODI3OTAyOX0.MjkBexUvuAAU7sYcRs3uPaJh52jdMG723aqeDVuoe9w'
)

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const C = {
  bg:'#151920', surface:'#1e242d', surface2:'#252d38', surface3:'#2a3241',
  border:'#2d3748', border2:'#384455',
  yellow:'#e0cb4b', gray:'#8d9190',
  text:'#e2e8f0', textSub:'#94a3b8', textMuted:'#64748b',
  success:'#34d399', successBg:'#0d2e22',
  danger:'#f87171', dangerBg:'#2d1515',
  warn:'#fbbf24', warnBg:'#2d2208',
}
const PP = {
  'Carne':       { bg:'#2d1a1a', color:'#f4a49a', border:'#5c2020' },
  'Peixe':       { bg:'#0f1e2d', color:'#7ec8f0', border:'#1a3d5c' },
  'Dieta':       { bg:'#0d2218', color:'#6ee7b7', border:'#1a5c3a' },
  'Vegetariano': { bg:'#1e1b08', color:'#fcd34d', border:'#4a420a' },
}
const ps = (l) => PP[l] || { bg:C.surface2, color:C.textSub, border:C.border }

// ═══════════════════════════════════════════════════════════════════════════
// DATAS
// ═══════════════════════════════════════════════════════════════════════════
const d2s = (d) => { const x=d instanceof Date?d:new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}` }
const addD = (s,n) => { const d=new Date(s+'T12:00:00'); d.setDate(d.getDate()+n); return d2s(d) }
const TODAY        = d2s(new Date())
const FIRST_MONTH  = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` }
const WD       = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const WD_FULL  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']
const MN       = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const fmtS  = (s) => { const d=new Date(s+'T12:00:00'); return `${WD[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}` }
const fmtF  = (s) => { const d=new Date(s+'T12:00:00'); return `${WD_FULL[d.getDay()]}, ${d.getDate()} de ${MN[d.getMonth()]}` }
const fmtHM = (iso) => iso?new Date(iso).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):''
const toMin = (t) => { const [h,m]=(t||'00:00').split(':').map(Number); return h*60+m }

// ═══════════════════════════════════════════════════════════════════════════
// DEFINIÇÕES
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_SETTINGS = {
  almoco_inicio: '12:00', almoco_fim: '14:30',
  jantar_inicio: '19:00', jantar_fim: '21:30',
  marcacao_antecedencia_dias: '0',
  servir_fds: 'true',
}

const mealNow = (settings=DEFAULT_SETTINGS) => {
  const s = { ...DEFAULT_SETTINGS, ...settings }
  const cur = new Date().getHours()*60 + new Date().getMinutes()
  if (cur >= toMin(s.almoco_inicio) && cur <= toMin(s.almoco_fim)) return 'A'
  if (cur >= toMin(s.jantar_inicio) && cur <= toMin(s.jantar_fim)) return 'J'
  return cur < toMin(s.jantar_inicio) ? 'A' : 'J'
}

const getInitialMode = () => {
  try { const p=new URLSearchParams(window.location.search),m=p.get('mode'); if(['marcacoes','validacoes','backoffice'].includes(m)) return m } catch(_){}
  return 'selector'
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const mapFunc = (r) => ({ ...r, foto: r.foto_url })
async function fetchFuncionarios() { const {data}=await supabase.from('cantina_funcionarios').select('*').order('numero'); return (data||[]).map(mapFunc) }
async function fetchEmentas()      { const {data}=await supabase.from('cantina_ementas').select('*').order('data').order('tipo'); return data||[] }
async function fetchMarcacoesAll() { const {data}=await supabase.from('cantina_marcacoes').select('*').order('created_at'); return data||[] }
async function fetchConsumos()     { const {data}=await supabase.from('cantina_consumos').select('*').order('validado_em',{ascending:false}); return data||[] }
async function fetchDefinicoes()   {
  const {data}=await supabase.from('cantina_definicoes').select('*')
  const s={...DEFAULT_SETTINGS}
  for(const r of (data||[])) s[r.chave]=r.valor
  return s
}
async function saveDefinicao(chave, valor) {
  await supabase.from('cantina_definicoes').upsert({chave,valor,updated_at:new Date().toISOString()})
}

// ═══════════════════════════════════════════════════════════════════════════
// ÍCONES SVG
// ═══════════════════════════════════════════════════════════════════════════
const Icon = ({name,size=18,color='currentColor'}) => ({
  calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  users:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  logout:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  fork:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 .55.45 1 1 1h3m0 0v7"/></svg>,
  check:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  warn:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  card:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  list:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  gear:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}[name] || null)

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════════════════════
function Logo({size='md',showSub=true}) {
  const z=size==='lg'?{i:36,m:28,s:11}:size==='sm'?{i:26,m:18,s:9}:{i:30,m:22,s:10}
  return <div style={{display:'flex',alignItems:'center',gap:10}}>
    <div style={{width:z.i,height:z.i,borderRadius:8,background:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name="fork" size={z.i*.6} color={C.bg}/></div>
    <div>
      <div style={{display:'flex',alignItems:'baseline',gap:5}}>
        <span style={{fontSize:z.m*.7,fontWeight:800,color:C.yellow,letterSpacing:1}}>GI</span>
        <span style={{fontSize:z.m*.58,fontWeight:700,color:C.text,letterSpacing:2}}>FOODFLOW</span>
      </div>
      {showSub&&<div style={{fontSize:z.s,color:C.textMuted,marginTop:1,letterSpacing:.5}}>Gestão de Cantina</div>}
    </div>
  </div>
}

function Avatar({nome,foto,size=40}) {
  const i=nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  if(foto) return <img src={foto} alt={nome} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
  return <div style={{width:size,height:size,borderRadius:'50%',background:C.yellow+'22',border:`1.5px solid ${C.yellow}55`,color:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*.36,flexShrink:0}}>{i}</div>
}

function PratoTag({label,large=false}) {
  const {bg,color,border}=ps(label)
  return <span style={{padding:large?'5px 14px':'3px 9px',borderRadius:5,fontSize:large?13:10,fontWeight:700,background:bg,color,border:`1px solid ${border}`}}>{label}</span>
}

function PratoBtn({label,desc,selected,onClick,disabled}) {
  const p=ps(label)
  return <button onClick={onClick} disabled={disabled}
    style={{display:'flex',alignItems:'center',gap:14,padding:'0 18px',height:68,background:selected?C.yellow+'18':C.surface2,border:`2px solid ${selected?C.yellow:C.border}`,borderRadius:12,textAlign:'left',transition:'all .15s',cursor:disabled?'default':'pointer',width:'100%'}}>
    <span style={{padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:700,background:p.bg,color:p.color,border:`1px solid ${p.border}`,minWidth:98,textAlign:'center',flexShrink:0}}>{label}</span>
    <span style={{fontSize:15,flex:1,color:selected?C.text:C.textSub,fontWeight:selected?500:400}}>{desc}</span>
    {selected&&<Icon name="check" size={20} color={C.yellow}/>}
  </button>
}

function BigKeypad({value,onChange,onConfirm,maxLen=10,confirmLabel='→',confirmDisabled=false}) {
  const s={height:76,fontSize:22,fontWeight:500,background:C.surface2,border:`1.5px solid ${C.border}`,borderRadius:12,color:C.text}
  return <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9}}>
    {[1,2,3,4,5,6,7,8,9].map(d=><button key={d} onClick={()=>value.length<maxLen&&onChange(value+d)} style={s}>{d}</button>)}
    <button onClick={()=>onChange(value.slice(0,-1))} style={{...s,fontSize:18,color:C.textSub}}>←</button>
    <button onClick={()=>value.length<maxLen&&onChange(value+'0')} style={s}>0</button>
    <button onClick={onConfirm} disabled={confirmDisabled} style={{...s,background:confirmDisabled?C.surface3:C.yellow,border:'none',color:confirmDisabled?C.textMuted:C.bg,fontWeight:700}}>{confirmLabel}</button>
  </div>
}

function LoadingScreen({msg='A carregar…'}) {
  return <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
    <div style={{width:48,height:48,borderRadius:'50%',border:`3px solid ${C.yellow}33`,borderTopColor:C.yellow,animation:'spin .8s linear infinite'}}/>
    <div style={{fontSize:14,color:C.textMuted}}>{msg}</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
}

function ErrorBanner({msg,onRetry}) {
  return <div style={{background:C.dangerBg,border:`1px solid ${C.danger}44`,borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
    <Icon name="warn" size={16} color={C.danger}/>
    <span style={{fontSize:13,color:C.danger,flex:1}}>{msg}</span>
    {onRetry&&<button onClick={onRetry} style={{fontSize:12,color:C.yellow,background:'none',border:`1px solid ${C.yellow}55`,borderRadius:6,padding:'4px 10px'}}>Tentar novamente</button>}
  </div>
}

function InputScreen({title,subtitle,value,onChange,onConfirm,onBack,confirmLabel,error,children,serialStatus,serialErrMsg,onConnectSerial}) {
  return <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
    {onBack&&<button onClick={onBack} style={{position:'absolute',top:24,left:24,background:'none',border:'none',color:C.textMuted,fontSize:14}}>← Voltar</button>}
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24,padding:'36px 40px',width:440}}>
      <div style={{marginBottom:28}}><Logo size="md" showSub={true}/></div>
      {children}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:13,color:C.textMuted,marginBottom:8}}>{title}</div>
        <div style={{background:C.surface3,border:`1.5px solid ${error?C.danger+'66':C.border2}`,borderRadius:12,padding:'14px 18px',textAlign:'center',minHeight:60,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {value?<span style={{fontSize:32,letterSpacing:10,color:C.yellow,fontWeight:600}}>{'•'.repeat(value.length)}</span>:<span style={{color:C.textMuted,fontSize:15}}>{subtitle}</span>}
        </div>
        {error&&<div style={{marginTop:8,background:C.dangerBg,border:`1px solid ${C.danger}44`,borderRadius:8,padding:'8px 14px',fontSize:13,color:C.danger,textAlign:'center'}}>{error}</div>}
      </div>
      <BigKeypad value={value} onChange={onChange} onConfirm={onConfirm} confirmLabel={confirmLabel} confirmDisabled={!value}/>
      {serialStatus!==undefined&&<div style={{marginTop:16}}>
        {!navigator.serial?<div style={{textAlign:'center',fontSize:11,color:C.warn}}>Leitor RFID: requer Chrome ou Edge</div>
        :serialStatus==='connected'?<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12,color:C.success}}><span style={{width:7,height:7,borderRadius:'50%',background:C.success,display:'inline-block'}}/>Leitor RFID ativo — passe o cartão para entrar</div>
        :serialStatus==='connecting'?<div style={{textAlign:'center',fontSize:12,color:C.warn}}>A ligar ao leitor…</div>
        :<>
          <button onClick={onConnectSerial} style={{width:'100%',height:46,background:C.yellow+'18',border:`1.5px solid ${C.yellow}55`,borderRadius:10,fontSize:13,fontWeight:600,color:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Icon name="card" size={16} color={C.yellow}/>{serialStatus==='error'?'⚠ Religar leitor RFID':'Conectar leitor RFID'}
          </button>
          {serialStatus==='error'&&serialErrMsg&&<div style={{marginTop:8,fontSize:11,color:C.danger,textAlign:'center'}}>{serialErrMsg.includes('already')||serialErrMsg.includes('open')?'⚠ Porta já em uso — outra tab pode estar a usá-la.':`⚠ ${serialErrMsg}`}</div>}
        </>}
      </div>}
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// SERIAL HELPERS (reutilizado em Marcações + Validações)
// ═══════════════════════════════════════════════════════════════════════════
function useSerial(onUid) {
  const [serialStatus, setSerialStatus] = useState('idle')
  const [serialErrMsg, setSerialErrMsg] = useState('')
  const portRef   = useRef(null)
  const readerRef = useRef(null)
  const mounted   = useRef(true)

  useEffect(() => {
    mounted.current = true
    if (!navigator.serial) return
    navigator.serial.getPorts().then(ports => { if(ports.length>0&&mounted.current) open(ports[0]) }).catch(()=>{})
    return () => { mounted.current=false; close() }
  }, [])

  const open = async (port) => {
    try {
      setSerialStatus('connecting')
      portRef.current = port
      try { await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'})
      } catch(_) { try{await port.close()}catch(_){}; await new Promise(r=>setTimeout(r,250)); await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'}) }
      if(!mounted.current){await port.close();return}
      setSerialStatus('connected')
      read(port)
    } catch(e) { if(mounted.current){setSerialStatus('error');setSerialErrMsg(e?.message||'Erro ao abrir porta')} }
  }

  const read = async (port) => {
    let buf=''
    try {
      const reader=port.readable.getReader(); readerRef.current=reader
      while(mounted.current){
        const {value,done}=await reader.read(); if(done) break
        buf+=new TextDecoder().decode(value)
        const lines=buf.split(/\r?\n/); buf=lines.pop()
        for(const l of lines){ const uid=l.replace(/[^\x21-\x7E]/g,'').trim(); if(uid.length>=2&&mounted.current) onUid(uid) }
        const bc=buf.replace(/[^\x21-\x7E]/g,'').trim(); if(bc.length>=4&&mounted.current){onUid(bc);buf=''}
      }
      reader.releaseLock()
    } catch(_){ if(mounted.current) setSerialStatus('error') }
  }

  const close = async () => {
    try{if(readerRef.current){await readerRef.current.cancel();readerRef.current=null}}catch(_){}
    try{if(portRef.current){await portRef.current.close();portRef.current=null}}catch(_){}
  }

  const connect = async () => {
    if(!navigator.serial) return
    try{ const p=await navigator.serial.requestPort(); await open(p)
    }catch(e){ if(e?.name!=='NotFoundError'&&mounted.current){setSerialStatus('error');setSerialErrMsg(e?.message||'Cancelado')} }
  }

  return {serialStatus, serialErrMsg, connect}
}

// ═══════════════════════════════════════════════════════════════════════════
// SELETOR DE MODO
// ═══════════════════════════════════════════════════════════════════════════
function ModeSelector({onSelect}) {
  const modes=[
    {key:'marcacoes', iconName:'calendar',label:'Terminal de Marcações', desc:'Funcionários marcam as suas refeições'},
    {key:'validacoes',iconName:'card',    label:'Terminal de Validações',desc:'Leitura de cartão RFID / código na cozinha'},
    {key:'backoffice',iconName:'chart',   label:'Backoffice',            desc:'Ementas, funcionários e relatórios'},
  ]
  return <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:24}}>
    <div style={{marginBottom:32}}><Logo size="lg" showSub={true}/></div>
    {modes.map(m=><button key={m.key} onClick={()=>onSelect(m.key)}
      style={{width:320,padding:'20px 24px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,textAlign:'left'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.yellow+'80';e.currentTarget.style.background=C.surface2}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface}}>
      <div style={{marginBottom:10}}><Icon name={m.iconName} size={20} color={C.yellow}/></div>
      <div style={{fontSize:15,fontWeight:600,color:C.text}}>{m.label}</div>
      <div style={{fontSize:12,color:C.textSub,marginTop:3}}>{m.desc}</div>
    </button>)}
    <div style={{marginTop:20,fontSize:11,color:C.textMuted,textAlign:'center',lineHeight:1.7}}>
      URL por computador: <code style={{color:C.yellow+'aa',background:C.surface2,padding:'1px 5px',borderRadius:3}}>?mode=marcacoes</code>
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// TERMINAL DE MARCAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function TerminalMarcacoes({funcionarios,ementas,settings,onBack}) {
  const s={...DEFAULT_SETTINGS,...settings}
  const [step,       setStep]       = useState('numero')
  const [numInput,   setNumInput]   = useState('')
  const [pinInput,   setPinInput]   = useState('')
  const [func,       setFunc]       = useState(null)
  const [err,        setErr]        = useState('')
  const [selDay,     setSelDay]     = useState(TODAY)
  const [marcacoes,  setMarcacoes]  = useState([])
  const [rfidMsg,    setRfidMsg]    = useState('')

  const rfidRef=useRef(''); const rfidTimer=useRef(null)

  const handleUid = useCallback((uid) => {
    const f=funcionarios.find(f=>f.rfid===uid)
    if(!f||!f.ativo){setRfidMsg(`Cartão lido: ${uid} — não encontrado. Configura o UID na ficha.`);setTimeout(()=>setRfidMsg(''),5000);return}
    setRfidMsg(''); loginFunc(f)
  },[funcionarios])

  const {serialStatus,serialErrMsg,connect:connectSerial}=useSerial(handleUid)

  useEffect(()=>{
    if(step==='dashboard') return
    const h=(e)=>{
      if(e.key==='Enter'){if(rfidRef.current){handleUid(rfidRef.current);rfidRef.current=''}return}
      if(e.key.length!==1) return
      rfidRef.current+=e.key; clearTimeout(rfidTimer.current)
      rfidTimer.current=setTimeout(()=>{rfidRef.current=''},200)
    }
    window.addEventListener('keydown',h)
    return()=>{window.removeEventListener('keydown',h);clearTimeout(rfidTimer.current)}
  },[step,funcionarios])

  const loadMarcacoes=async(fid)=>{const{data}=await supabase.from('cantina_marcacoes').select('*').eq('funcionario_id',fid);setMarcacoes(data||[])}

  const loginFunc=(f)=>{
    loadMarcacoes(f.id)
    if(f.pin){setFunc(f);setStep('pin');setNumInput('');setErr('')}
    else{setFunc(f);setStep('dashboard');setNumInput('');setErr('')}
  }

  const submitNumero=()=>{
    const v=numInput.trim()
    const f=funcionarios.find(f=>f.numero===v||f.numero===v.padStart(3,'0'))
    if(!f||!f.ativo){setErr('Código não encontrado');setNumInput('');setTimeout(()=>setErr(''),3000);return}
    loginFunc(f)
  }

  const submitPin=()=>{
    if(pinInput===func.pin){setStep('dashboard');setPinInput('');setErr('')}
    else{setErr('PIN incorreto');setPinInput('');setTimeout(()=>setErr(''),3000)}
  }

  const logout=()=>{setStep('numero');setFunc(null);setNumInput('');setPinInput('');setErr('');setSelDay(TODAY);setMarcacoes([])}

  if(step==='numero') return <InputScreen title="Introduza o seu código de funcionário" subtitle="Código"
    value={numInput} onChange={setNumInput} onConfirm={submitNumero} onBack={onBack} confirmLabel="→" error={err}
    serialStatus={serialStatus} serialErrMsg={serialErrMsg} onConnectSerial={connectSerial}>
    {rfidMsg&&<div style={{background:C.warnBg,border:`1px solid ${C.warn}44`,borderRadius:8,padding:'8px 12px',marginBottom:12,fontSize:11,color:C.warn}}>{rfidMsg}</div>}
  </InputScreen>

  if(step==='pin') return <InputScreen title="Introduza o seu PIN" subtitle="PIN"
    value={pinInput} onChange={setPinInput} onConfirm={submitPin}
    onBack={()=>{setStep('numero');setFunc(null);setPinInput('');setErr('')}}
    confirmLabel="→" error={err} serialStatus={serialStatus} serialErrMsg={serialErrMsg} onConnectSerial={connectSerial}>
    <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:12,marginBottom:18}}>
      <Avatar nome={func.nome} foto={func.foto} size={48}/>
      <div><div style={{fontSize:17,fontWeight:700,color:C.text}}>{func.nome}</div><div style={{fontSize:12,color:C.textMuted,marginTop:2}}>Nº {func.numero}</div></div>
    </div>
  </InputScreen>

  // ── Dashboard ────────────────────────────────────────────────────────────
  const antec    = parseInt(s.marcacao_antecedencia_dias)||0
  const minDay   = addD(TODAY,antec)
  const serveFds = s.servir_fds!=='false'
  const days = [...new Set(ementas.map(e=>e.data))].sort().filter(d=>{
    if(d<minDay) return false
    if(!serveFds){const wd=new Date(d+'T12:00:00').getDay();if(wd===0||wd===6) return false}
    return true
  }).slice(0,14)
  const dayEm=ementas.filter(e=>e.data===selDay)
  const getM=(eid)=>marcacoes.find(m=>m.funcionario_id===func.id&&m.ementa_id===eid)

  const marcar=async(ementa,n)=>{
    await supabase.from('cantina_marcacoes').upsert({funcionario_id:func.id,ementa_id:ementa.id,prato_num:n},{onConflict:'funcionario_id,ementa_id'})
    await loadMarcacoes(func.id)
  }
  const cancelar=async(eid)=>{
    await supabase.from('cantina_marcacoes').delete().eq('funcionario_id',func.id).eq('ementa_id',eid)
    await loadMarcacoes(func.id)
  }

  return <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 20px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
      <Logo size="sm" showSub={false}/>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <Avatar nome={func.nome} foto={func.foto} size={36}/>
        <div><div style={{fontSize:16,fontWeight:600,color:C.text,lineHeight:1.2}}>{func.nome}</div><div style={{fontSize:11,color:C.textMuted}}>Nº {func.numero}</div></div>
        <button onClick={logout} style={{marginLeft:8,padding:'8px 18px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,color:C.textSub,fontSize:14,height:40}}>Sair</button>
      </div>
    </div>
    <div style={{display:'flex',flex:1,overflow:'hidden'}}>
      <div style={{width:200,background:C.surface,borderRight:`1px solid ${C.border}`,overflowY:'auto',flexShrink:0}}>
        <div style={{padding:'12px 16px 8px',fontSize:10,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:1}}>Dias disponíveis</div>
        {days.map(d=>{
          const dd=new Date(d+'T12:00:00'),isT=d===TODAY,mc=ementas.filter(e=>e.data===d&&getM(e.id)).length,sel=selDay===d
          return <button key={d} onClick={()=>setSelDay(d)}
            style={{width:'100%',height:80,padding:'0 16px',textAlign:'left',background:sel?C.yellow+'14':'transparent',border:'none',borderLeft:sel?`4px solid ${C.yellow}`:'4px solid transparent',display:'flex',flexDirection:'column',justifyContent:'center',gap:2}}>
            <div style={{fontSize:14,fontWeight:700,color:isT?C.yellow:C.text}}>{isT?'HOJE':WD[dd.getDay()]}</div>
            <div style={{fontSize:12,color:C.textSub}}>{dd.getDate()} {MN[dd.getMonth()]}</div>
            {mc>0?<div style={{fontSize:11,color:C.success,fontWeight:600}}>✓ {mc} marcado{mc>1?'s':''}</div>:<div style={{fontSize:11,color:C.textMuted}}>— sem marcação</div>}
          </button>
        })}
        {days.length===0&&<div style={{padding:'20px 16px',fontSize:12,color:C.textMuted,textAlign:'center'}}>Sem dias disponíveis</div>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>{fmtF(selDay)}</div>
          {selDay===TODAY&&<span style={{background:C.yellow+'22',color:C.yellow,border:`1px solid ${C.yellow}44`,fontSize:11,padding:'3px 10px',borderRadius:5,fontWeight:700}}>HOJE</span>}
        </div>
        {['A','J'].map(tipo=>{
          const em=dayEm.find(e=>e.tipo===tipo); if(!em) return null
          const marc=getM(em.id)
          const pratos=[1,2,3,4].map(n=>({n,label:em[`prato${n}_label`],desc:em[`prato${n}_desc`]})).filter(p=>p.label)
          return <div key={tipo} style={{background:C.surface,border:`2px solid ${marc?C.yellow+'55':C.border}`,borderRadius:14,padding:'16px 18px',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>{tipo==='A'?'🌞':'🌙'}</span>
                <span style={{fontSize:17,fontWeight:700,color:C.text}}>{tipo==='A'?'Almoço':'Jantar'}</span>
              </div>
              {marc?<div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:13,color:C.success,fontWeight:700,display:'flex',alignItems:'center',gap:5}}><Icon name="check" size={14} color={C.success}/>Marcado</span>
                <button onClick={()=>cancelar(em.id)} style={{padding:'6px 14px',background:C.dangerBg,border:`1px solid ${C.danger}33`,borderRadius:8,color:C.danger,fontSize:13,height:36}}>Cancelar</button>
              </div>:<span style={{fontSize:12,color:C.textMuted}}>Seleciona um prato</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {pratos.map(({n,label,desc})=><PratoBtn key={n} label={label} desc={desc} selected={marc?.prato_num===n} onClick={()=>marcar(em,n)}/>)}
            </div>
          </div>
        })}
        {dayEm.length===0&&<div style={{textAlign:'center',color:C.textMuted,fontSize:15,marginTop:60}}>Sem ementa disponível para este dia</div>}
      </div>
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// TERMINAL DE VALIDAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function TerminalValidacoes({funcionarios,ementas,settings,onBack}) {
  const s={...DEFAULT_SETTINGS,...settings}
  const [numInput,   setNumInput]   = useState('')
  const [status,     setStatus]     = useState(null)
  const [recentes,   setRecentes]   = useState([])
  const [manualMode, setManualMode] = useState(false)
  const meal = mealNow(s)

  const rfidRef=useRef(''); const rfidTimer=useRef(null)

  const handleUid=useCallback((uid)=>{ process(uid,true) },[])
  const {serialStatus,connect:connectSerial}=useSerial(handleUid)

  useEffect(()=>{
    if(status?.type==='no-marc') return
    const h=(e)=>{
      if(e.key==='Enter'){if(rfidRef.current){process(rfidRef.current,true);rfidRef.current=''}return}
      if(e.key.length!==1) return
      rfidRef.current+=e.key; clearTimeout(rfidTimer.current)
      rfidTimer.current=setTimeout(()=>{rfidRef.current=''},200)
    }
    window.addEventListener('keydown',h)
    return()=>{window.removeEventListener('keydown',h);clearTimeout(rfidTimer.current)}
  },[status])

  const reset=()=>{setNumInput('');setStatus(null);setManualMode(false)}

  const confirmarConsumo=async(func,ementa,pratoNum)=>{
    const{data,error}=await supabase.from('cantina_consumos').insert({funcionario_id:func.id,ementa_id:ementa.id,prato_num:pratoNum}).select().single()
    if(error) return
    const pk=`prato${pratoNum}`,pratoLabel=ementa[pk+'_label'],pratoDesc=ementa[pk+'_desc']
    setRecentes(p=>[{id:data.id,validado_em:data.validado_em,nome:func.nome,foto:func.foto,pratoLabel,pratoDesc},...p].slice(0,5))
    setStatus({type:'ok',func,pratoLabel,pratoDesc})
    setTimeout(reset,5000)
  }

  const process=async(val,isRfid=false)=>{
    const v=val.replace(/[^\x21-\x7E]/g,'').trim(); if(!v) return
    setNumInput('')
    const func=isRfid?funcionarios.find(f=>f.rfid===v):funcionarios.find(f=>f.numero===v||f.numero===v.padStart(3,'0'))
    if(!func){setStatus({type:'error',msg:'Funcionário não encontrado'});setTimeout(reset,3000);return}
    const ementa=ementas.find(e=>e.data===TODAY&&e.tipo===meal)
    if(!ementa){setStatus({type:'error',msg:'Sem ementa para este momento'});setTimeout(reset,3000);return}
    const{data:exC}=await supabase.from('cantina_consumos').select('prato_num').eq('funcionario_id',func.id).eq('ementa_id',ementa.id).maybeSingle()
    if(exC){const pk=`prato${exC.prato_num}`;setStatus({type:'dup',func,pratoLabel:ementa[pk+'_label'],pratoDesc:ementa[pk+'_desc']});setTimeout(reset,6000);return}
    const{data:marc}=await supabase.from('cantina_marcacoes').select('prato_num').eq('funcionario_id',func.id).eq('ementa_id',ementa.id).maybeSingle()
    if(!marc){setStatus({type:'no-marc',func,ementa});return}
    confirmarConsumo(func,ementa,marc.prato_num)
  }

  const renderResult=()=>{
    if(status?.type==='error') return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'48px 32px',background:C.surface,border:`2px solid ${C.danger}44`,borderRadius:24,textAlign:'center'}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:C.dangerBg,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="warn" size={36} color={C.danger}/></div>
      <div style={{fontSize:22,fontWeight:700,color:C.danger}}>{status.msg}</div>
    </div>

    if(status?.type==='ok'){const p=ps(status.pratoLabel);return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,padding:'40px 32px',background:C.surface,border:`2px solid ${C.success}44`,borderRadius:24,textAlign:'center'}}>
      <Avatar nome={status.func.nome} foto={status.func.foto} size={100}/>
      <div style={{fontSize:28,fontWeight:800,color:C.text}}>{status.func.nome}</div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:C.successBg,border:`1px solid ${C.success}44`,borderRadius:12,padding:'12px 24px'}}><Icon name="check" size={20} color={C.success}/><span style={{fontSize:18,fontWeight:700,color:C.success}}>CONSUMO REGISTADO</span></div>
      <div style={{display:'flex',alignItems:'center',gap:14,background:p.bg,border:`1px solid ${p.border}`,borderRadius:14,padding:'14px 28px'}}><PratoTag label={status.pratoLabel} large={true}/><span style={{fontSize:18,color:C.text,fontWeight:500}}>{status.pratoDesc}</span></div>
    </div>}

    if(status?.type==='dup'){const p=ps(status.pratoLabel);return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,padding:'40px 32px',background:C.surface,border:`2px solid ${C.warn}44`,borderRadius:24,textAlign:'center'}}>
      <Avatar nome={status.func.nome} foto={status.func.foto} size={100}/>
      <div style={{fontSize:28,fontWeight:800,color:C.text}}>{status.func.nome}</div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:C.warnBg,border:`1px solid ${C.warn}44`,borderRadius:12,padding:'12px 24px'}}><Icon name="warn" size={20} color={C.warn}/><span style={{fontSize:16,fontWeight:700,color:C.warn}}>JÁ CONSUMIU ESTA REFEIÇÃO</span></div>
      <div style={{display:'flex',alignItems:'center',gap:14,background:p.bg,border:`1px solid ${p.border}`,borderRadius:14,padding:'14px 28px'}}><PratoTag label={status.pratoLabel} large={true}/><span style={{fontSize:18,color:C.text,fontWeight:500}}>{status.pratoDesc}</span></div>
    </div>}

    if(status?.type==='no-marc') return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24,padding:'28px 32px'}}>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
        <Avatar nome={status.func.nome} foto={status.func.foto} size={70}/>
        <div><div style={{fontSize:22,fontWeight:700,color:C.text}}>{status.func.nome}</div><div style={{fontSize:13,color:C.textSub,marginTop:2}}>Sem marcação prévia</div></div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:C.warnBg,border:`1px solid ${C.warn}33`,borderRadius:10,padding:'10px 16px',marginBottom:16,fontSize:14,color:C.warn,fontWeight:600}}>
        <Icon name="warn" size={16} color={C.warn}/> Selecione o prato a servir:
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {[1,2,3,4].map(n=>{const l=status.ementa[`prato${n}_label`],d=status.ementa[`prato${n}_desc`];if(!l) return null;return<PratoBtn key={n} label={l} desc={d} selected={false} onClick={()=>confirmarConsumo(status.func,status.ementa,n)}/>})}
      </div>
      <button onClick={reset} style={{marginTop:12,width:'100%',height:48,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,fontSize:14,color:C.textSub}}>Cancelar</button>
    </div>

    // Standby
    if(!manualMode) return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24,overflow:'hidden'}}>
      <div style={{padding:'44px 32px 40px',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:100,height:100,borderRadius:'50%',background:C.yellow+'18',border:`2px solid ${C.yellow}44`,marginBottom:22}}><Icon name="card" size={46} color={C.yellow}/></div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8}}>{meal==='A'?'🌞 Almoço':'🌙 Jantar'}</div>
        <div style={{fontSize:16,color:C.textSub,marginBottom:6}}>Aproxime o cartão</div>
        {serialStatus==='connected'?<div style={{fontSize:13,color:C.success,fontWeight:600}}>Leitor ativo · à espera de cartão</div>
        :serialStatus==='connecting'?<div style={{fontSize:13,color:C.warn}}>A ligar ao leitor…</div>
        :<div style={{fontSize:13,color:C.danger}}>Leitor não ligado — usa o botão no topo</div>}
      </div>
      <div style={{borderTop:`1px solid ${C.border}`,padding:'18px 32px'}}>
        <button onClick={()=>setManualMode(true)} style={{width:'100%',height:56,background:C.surface2,border:`1.5px solid ${C.border2}`,borderRadius:12,fontSize:15,fontWeight:600,color:C.textSub,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.yellow+'66';e.currentTarget.style.color=C.text}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.textSub}}>
          <Icon name="users" size={18} color={C.textSub}/> Introduzir código manualmente
        </button>
      </div>
    </div>

    return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:24}}>
      <div style={{padding:'24px 32px 20px',textAlign:'center',borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:4}}>Código de funcionário</div>
        <div style={{background:C.surface3,border:`1.5px solid ${C.border2}`,borderRadius:12,padding:'14px 18px',height:60,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
          {numInput?<span style={{fontSize:28,letterSpacing:6,color:C.yellow,fontWeight:700}}>{numInput}</span>:<span style={{color:C.textMuted,fontSize:14}}>Código</span>}
        </div>
      </div>
      <div style={{padding:'20px 32px 24px'}}>
        <BigKeypad value={numInput} onChange={setNumInput} onConfirm={()=>process(numInput)} confirmLabel="✓"/>
        <button onClick={()=>{setManualMode(false);setNumInput('')}} style={{width:'100%',height:48,marginTop:10,background:'transparent',border:`1px solid ${C.border}`,borderRadius:10,fontSize:13,color:C.textMuted}}>← Voltar ao leitor de cartões</button>
      </div>
    </div>
  }

  return <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 20px',height:56,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
      <Logo size="sm" showSub={false}/>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <span style={{fontSize:13,color:C.textMuted}}>{meal==='A'?'🌞 Almoço':'🌙 Jantar'} · {new Date().toLocaleDateString('pt-PT')}</span>
        {navigator.serial&&(serialStatus==='connected'
          ?<span style={{fontSize:11,color:C.success,background:C.successBg,border:`1px solid ${C.success}33`,borderRadius:6,padding:'3px 10px',fontWeight:600,display:'flex',alignItems:'center',gap:5}}><span style={{width:6,height:6,borderRadius:'50%',background:C.success,display:'inline-block'}}/>Leitor ligado</span>
          :serialStatus==='connecting'?<span style={{fontSize:11,color:C.warn,background:C.warnBg,border:`1px solid ${C.warn}33`,borderRadius:6,padding:'3px 10px'}}>A ligar…</span>
          :<button onClick={connectSerial} style={{fontSize:12,fontWeight:600,color:C.yellow,background:C.yellow+'18',border:`1px solid ${C.yellow}55`,borderRadius:8,padding:'5px 14px',height:34}}>{serialStatus==='error'?'⚠ Religar leitor':'Conectar leitor RFID'}</button>)}
        <button onClick={onBack} style={{background:'none',border:'none',color:C.textMuted,fontSize:13}}>← Sair</button>
      </div>
    </div>
    <div style={{display:'flex',flex:1,overflow:'hidden'}}>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 28px'}}>
        <div style={{width:'100%',maxWidth:460}}>{renderResult()}</div>
      </div>
      <div style={{width:280,background:C.surface,borderLeft:`1px solid ${C.border}`,display:'flex',flexDirection:'column',overflowY:'auto',flexShrink:0}}>
        <div style={{padding:'16px 18px 12px',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:1,borderBottom:`1px solid ${C.border}`}}>Últimas validações</div>
        {recentes.length===0?<div style={{padding:32,textAlign:'center',color:C.textMuted,fontSize:13}}>Sem validações</div>
        :recentes.map((r,i)=>{const p=ps(r.pratoLabel),isFirst=i===0;return(
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
        )})}
      </div>
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKOFFICE
// ═══════════════════════════════════════════════════════════════════════════
function Backoffice({funcionarios,ementas,marcacoesAll,consumos,settings,reload,onBack}) {
  const [sec,setSec]=useState('ementas')
  const nav=[
    {key:'ementas',   iconName:'calendar', label:'Ementas'},
    {key:'funcs',     iconName:'users',    label:'Funcionários'},
    {key:'consumos',  iconName:'chart',    label:'Consumos'},
    {key:'marcacoes', iconName:'list',     label:'Marcações'},
    {key:'definicoes',iconName:'gear',     label:'Definições'},
  ]
  return <div style={{minHeight:'100vh',display:'flex'}}>
    <div style={{width:60,background:C.surface,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:14,flexShrink:0}}>
      <div style={{width:34,height:34,borderRadius:8,background:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,flexShrink:0}}><Icon name="fork" size={18} color={C.bg}/></div>
      {nav.map(n=><button key={n.key} title={n.label} onClick={()=>setSec(n.key)}
        style={{width:40,height:40,borderRadius:8,margin:'3px 0',display:'flex',alignItems:'center',justifyContent:'center',background:sec===n.key?C.yellow+'18':'transparent',border:`1px solid ${sec===n.key?C.yellow+'55':'transparent'}`,transition:'all .15s'}}>
        <Icon name={n.iconName} size={18} color={sec===n.key?C.yellow:C.textMuted}/>
      </button>)}
      <div style={{flex:1}}/>
      <button title="Sair" onClick={onBack} style={{width:40,height:40,borderRadius:8,margin:'0 0 14px',display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none'}}>
        <Icon name="logout" size={18} color={C.textMuted}/>
      </button>
    </div>
    <div style={{flex:1,display:'flex',flexDirection:'column',background:C.bg,overflow:'hidden'}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 22px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Icon name={nav.find(n=>n.key===sec)?.iconName} size={16} color={C.yellow}/>
          <span style={{fontSize:17,fontWeight:600,color:C.text}}>{nav.find(n=>n.key===sec)?.label}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:10,color:C.yellow+'aa',fontWeight:700,letterSpacing:1}}>GI</span>
          <span style={{fontSize:10,color:C.textMuted}}>FOODFLOW</span>
        </div>
      </div>
      <div style={{flex:1,overflow:'auto',padding:20}}>
        {sec==='ementas'   &&<SecEmentas     ementas={ementas}                             reload={reload}/>}
        {sec==='funcs'     &&<SecFuncionarios funcionarios={funcionarios}                   reload={reload}/>}
        {sec==='consumos'  &&<SecConsumos    consumos={consumos} funcionarios={funcionarios} ementas={ementas}/>}
        {sec==='marcacoes' &&<SecMarcacoes   marcacoes={marcacoesAll} funcionarios={funcionarios} ementas={ementas}/>}
        {sec==='definicoes'&&<SecDefinicoes  settings={settings} reload={reload}/>}
      </div>
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKOFFICE — EMENTAS
// ═══════════════════════════════════════════════════════════════════════════
function SecEmentas({ementas,reload}) {
  const [selD,setSelD]=useState(TODAY)
  const [editing,setEditing]=useState(null)
  const [saving,setSaving]=useState(false)
  const dates=Array.from({length:14},(_,i)=>addD(TODAY,i))
  const dayEm=ementas.filter(e=>e.data===selD)
  const add=(tipo)=>setEditing({id:null,data:selD,tipo,prato1_label:'Carne',prato1_desc:'',prato2_label:'Peixe',prato2_desc:'',prato3_label:'Dieta',prato3_desc:'',prato4_label:'Vegetariano',prato4_desc:''})
  const save=async(e)=>{setSaving(true);const{id,foto,...row}=e;if(e.id) await supabase.from('cantina_ementas').update(row).eq('id',e.id);else await supabase.from('cantina_ementas').insert(row);await reload();setSaving(false);setEditing(null)}
  const del=async(id)=>{if(!window.confirm('Eliminar ementa?')) return;await supabase.from('cantina_ementas').delete().eq('id',id);await reload()}
  if(editing) return <EmentaEditor ementa={editing} onSave={save} onCancel={()=>setEditing(null)} saving={saving}/>
  return <div style={{display:'flex',gap:18}}>
    <div style={{width:175,flexShrink:0}}>
      <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:1,marginBottom:8,paddingLeft:12}}>14 dias</div>
      {dates.map(d=>{const dd=new Date(d+'T12:00:00'),isT=d===TODAY,hasEm=ementas.some(e=>e.data===d);return(
        <button key={d} onClick={()=>setSelD(d)} style={{width:'100%',padding:'10px 12px',textAlign:'left',background:selD===d?C.yellow+'12':C.surface,border:'none',borderLeft:selD===d?`3px solid ${C.yellow}`:'3px solid transparent',marginBottom:1,borderRadius:'0 6px 6px 0'}}>
          <div style={{fontSize:13,fontWeight:700,color:isT?C.yellow:C.text}}>{isT?'HOJE':WD[dd.getDay()].toUpperCase()}</div>
          <div style={{fontSize:12,color:C.textSub}}>{dd.getDate()} {MN[dd.getMonth()]}</div>
          {hasEm&&<div style={{fontSize:11,color:C.success,marginTop:1}}>● ementa</div>}
        </button>
      )})}
    </div>
    <div style={{flex:1}}>
      <div style={{fontSize:17,fontWeight:600,color:C.text,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
        {fmtF(selD)}{selD===TODAY&&<span style={{background:C.yellow+'22',color:C.yellow,border:`1px solid ${C.yellow}44`,fontSize:11,padding:'2px 7px',borderRadius:4,fontWeight:700}}>HOJE</span>}
      </div>
      {['A','J'].map(tipo=>{const em=dayEm.find(e=>e.tipo===tipo);return(
        <div key={tipo} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:em?10:0}}>
            <span style={{fontSize:16,fontWeight:600,color:C.text}}>{tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</span>
            <div style={{display:'flex',gap:6}}>
              {em?(<>
                <button onClick={()=>setEditing({...em})} style={{fontSize:13,padding:'5px 12px',background:C.yellow+'22',border:`1px solid ${C.yellow}55`,borderRadius:6,fontWeight:600,color:C.yellow}}>Editar</button>
                <button onClick={()=>del(em.id)} style={{fontSize:13,padding:'5px 12px',background:C.dangerBg,border:`1px solid ${C.danger}33`,borderRadius:6,color:C.danger}}>Remover</button>
              </>):<button onClick={()=>add(tipo)} style={{fontSize:13,padding:'5px 14px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:6,color:C.textSub}}>+ Adicionar ementa</button>}
            </div>
          </div>
          {em&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            {[1,2,3,4].map(n=>{const l=em[`prato${n}_label`],d=em[`prato${n}_desc`];
              if(!l) return <div key={n} style={{background:C.surface2,borderRadius:6,padding:'8px 10px',border:`1px dashed ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:13,color:C.textMuted}}>Slot {n} vazio</span></div>
              const p=ps(l);return <div key={n} style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:6,padding:'8px 10px'}}><div style={{fontSize:13,fontWeight:700,color:p.color}}>{l}</div><div style={{fontSize:14,color:C.textSub,marginTop:2}}>{d||<span style={{color:C.textMuted,fontStyle:'italic'}}>sem descrição</span>}</div></div>
            })}
          </div>}
        </div>
      )})}
    </div>
  </div>
}

function EmentaEditor({ementa,onSave,onCancel,saving}) {
  const [f,setF]=useState({...ementa})
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const iS={padding:'9px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:14,background:C.surface3,color:C.text}
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:22,maxWidth:580}}>
    <div style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:18}}>{f.tipo==='A'?'🌞 Almoço':'🌙 Jantar'} · {fmtF(f.data)}</div>
    {[1,2,3,4].map(n=><div key={n} style={{marginBottom:12,padding:12,background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
      <div style={{fontSize:12,fontWeight:700,color:C.textMuted,marginBottom:7,textTransform:'uppercase',letterSpacing:.5}}>Prato {n} — tipo em branco oculta o slot</div>
      <div style={{display:'flex',gap:8}}>
        <input value={f[`prato${n}_label`]} onChange={e=>set(`prato${n}_label`,e.target.value)} placeholder="Tipo (ex: Carne)" style={{...iS,width:140,flexShrink:0}}/>
        <input value={f[`prato${n}_desc`]}  onChange={e=>set(`prato${n}_desc`, e.target.value)} placeholder="Descrição do prato"  style={{...iS,flex:1}}/>
      </div>
    </div>)}
    <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:6}}>
      <button onClick={onCancel} disabled={saving} style={{padding:'9px 18px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,color:C.textSub}}>Cancelar</button>
      <button onClick={()=>onSave(f)} disabled={saving} style={{padding:'9px 22px',background:C.yellow,border:'none',borderRadius:8,fontSize:14,fontWeight:700,color:C.bg}}>{saving?'A guardar…':'Guardar'}</button>
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKOFFICE — FUNCIONÁRIOS
// ═══════════════════════════════════════════════════════════════════════════
function SecFuncionarios({funcionarios,reload}) {
  const [editing,setEditing]=useState(null)
  const blank={id:null,numero:'',nome:'',pin:'',rfid:'',foto:null,ativo:true}
  const save=async(form)=>{const row={numero:form.numero,nome:form.nome,pin:form.pin,rfid:form.rfid,foto_url:form.foto,ativo:form.ativo};if(form.id) await supabase.from('cantina_funcionarios').update(row).eq('id',form.id);else await supabase.from('cantina_funcionarios').insert(row);await reload();setEditing(null)}
  const del=async(id)=>{if(!window.confirm('Eliminar funcionário?')) return;await supabase.from('cantina_funcionarios').delete().eq('id',id);await reload()}
  if(editing!==null) return <FuncionarioEditor form={editing} onSave={save} onCancel={()=>setEditing(null)}/>
  const thS={padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase'}
  const tdS={padding:'11px 14px',borderTop:`1px solid ${C.border}`}
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <div style={{fontSize:14,color:C.textSub}}>{funcionarios.length} funcionário(s)</div>
      <button onClick={()=>setEditing(blank)} style={{padding:'8px 18px',background:C.yellow+'22',border:`1px solid ${C.yellow}55`,borderRadius:8,color:C.yellow,fontSize:14,fontWeight:600}}>+ Novo</button>
    </div>
    <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:C.surface2}}>{['Nº','Funcionário','PIN','RFID','Estado',''].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
        <tbody>{funcionarios.map(f=><tr key={f.id}>
          <td style={{...tdS,fontSize:13,color:C.textSub}}>{f.numero}</td>
          <td style={tdS}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={f.nome} foto={f.foto} size={26}/><span style={{fontSize:15,fontWeight:500,color:C.text}}>{f.nome}</span></div></td>
          <td style={{...tdS,fontFamily:'monospace',fontSize:13,color:C.textMuted}}>{f.pin?'•'.repeat(f.pin.length):<span style={{color:C.textMuted,fontStyle:'italic',fontSize:11}}>sem PIN</span>}</td>
          <td style={{...tdS,fontFamily:'monospace',fontSize:13,color:C.textSub}}>{f.rfid}</td>
          <td style={tdS}><span style={{fontSize:11,padding:'3px 9px',borderRadius:4,background:f.ativo?C.successBg:C.surface2,color:f.ativo?C.success:C.textMuted,border:`1px solid ${f.ativo?C.success+'33':C.border}`,fontWeight:700}}>{f.ativo?'Ativo':'Inativo'}</span></td>
          <td style={tdS}><div style={{display:'flex',gap:5}}>
            <button onClick={()=>setEditing({...f})} style={{fontSize:11,padding:'4px 10px',background:C.yellow+'22',border:`1px solid ${C.yellow}44`,borderRadius:6,fontWeight:600,color:C.yellow}}>Editar</button>
            <button onClick={()=>del(f.id)} style={{fontSize:11,padding:'4px 10px',background:C.dangerBg,border:`1px solid ${C.danger}33`,borderRadius:6,color:C.danger}}>✕</button>
          </div></td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>
}

function FuncionarioEditor({form:init,onSave,onCancel}) {
  const [f,setF]=useState({...init})
  const [rfidState,setRfidState]=useState('idle')
  const [saving,setSaving]=useState(false)
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const handleFoto=(e)=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=ev=>set('foto',ev.target.result);r.readAsDataURL(file)}
  const readRfidCard=async()=>{
    if(!navigator.serial){alert('Requer Chrome ou Edge.');return}
    setRfidState('waiting')
    let port=null,reader=null,found=false
    try{
      const ports=await navigator.serial.getPorts();port=ports.length>0?ports[0]:await navigator.serial.requestPort()
      try{await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'})}catch(_){try{await port.close()}catch(_){};await new Promise(r=>setTimeout(r,200));await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'})}
      reader=port.readable.getReader();let buf=''
      const tid=setTimeout(()=>reader.cancel().catch(()=>{}),10000)
      try{while(true){const{value,done}=await reader.read();if(done)break;buf+=new TextDecoder().decode(value);const pts=buf.split(/\r?\n/);buf=pts.pop()||'';for(const pt of pts){const uid=pt.replace(/[^\x21-\x7E]/g,'').trim();if(uid.length>=2){clearTimeout(tid);found=true;set('rfid',uid);setRfidState('done');setTimeout(()=>setRfidState('idle'),2500);return}}const bc=buf.replace(/[^\x21-\x7E]/g,'').trim();if(bc.length>=4){clearTimeout(tid);found=true;set('rfid',bc);setRfidState('done');setTimeout(()=>setRfidState('idle'),2500);return}}}finally{clearTimeout(0)}
    }catch(_){}finally{if(reader)try{reader.releaseLock()}catch(_){};if(port)try{await port.close()}catch(_){};if(!found){setRfidState('error');setTimeout(()=>setRfidState('idle'),3000)}}
  }
  const handleSave=async()=>{setSaving(true);await onSave(f);setSaving(false)}
  const iS={flex:1,padding:'8px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:14,background:C.surface3,color:C.text,boxSizing:'border-box'}
  const lS={fontSize:11,fontWeight:700,color:C.textMuted,display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.4}
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:24,maxWidth:500}}>
    <div style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:20}}>{f.id?'Editar Funcionário':'Novo Funcionário'}</div>
    <div style={{display:'flex',gap:20,marginBottom:18,alignItems:'center'}}>
      <div style={{textAlign:'center'}}><Avatar nome={f.nome||'?'} foto={f.foto} size={64}/><label style={{display:'block',marginTop:7,fontSize:12,color:C.yellow,fontWeight:600,cursor:'pointer'}}>Foto<input type="file" accept="image/*" onChange={handleFoto} style={{display:'none'}}/></label></div>
      <div style={{flex:1}}>
        {[{k:'numero',l:'Nº funcionário'},{k:'nome',l:'Nome completo'}].map(({k,l})=><div key={k} style={{marginBottom:12}}><label style={lS}>{l}</label><input value={f[k]} onChange={e=>set(k,e.target.value)} style={{...iS,flex:'none',width:'100%'}}/></div>)}
      </div>
    </div>
    <div style={{marginBottom:14}}><label style={lS}>PIN (deixa vazio = sem PIN)</label><input type="password" value={f.pin} onChange={e=>set('pin',e.target.value)} style={{...iS,flex:'none',width:'100%'}}/></div>
    <div style={{marginBottom:6}}>
      <label style={lS}>RFID UID</label>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input type="text" value={f.rfid} onChange={e=>set('rfid',e.target.value)} placeholder="ex: 0400150674" style={iS}/>
        <button onClick={readRfidCard} disabled={rfidState==='waiting'}
          style={{flexShrink:0,height:40,padding:'0 14px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',background:rfidState==='done'?C.successBg:rfidState==='error'?C.dangerBg:rfidState==='waiting'?C.surface2:C.yellow+'22',border:`1.5px solid ${rfidState==='done'?C.success+'55':rfidState==='error'?C.danger+'55':rfidState==='waiting'?C.border:C.yellow+'55'}`,color:rfidState==='done'?C.success:rfidState==='error'?C.danger:rfidState==='waiting'?C.textMuted:C.yellow,whiteSpace:'nowrap'}}>
          {rfidState==='waiting'?'⏳ Passe o cartão…':rfidState==='done'?'✓ Lido!':rfidState==='error'?'⚠ Erro':'📡 Ler cartão'}
        </button>
      </div>
      {rfidState==='waiting'&&<div style={{marginTop:6,fontSize:12,color:C.warn}}>Aproxime o cartão do leitor nos próximos 10 segundos…</div>}
    </div>
    <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:'9px 14px',marginBottom:16,fontSize:12,color:C.textMuted}}>PIN em branco → funcionário entra diretamente com o código.</div>
    <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer',marginBottom:20,color:C.textSub}}><input type="checkbox" checked={f.ativo} onChange={e=>set('ativo',e.target.checked)}/> Funcionário ativo</label>
    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
      <button onClick={onCancel} disabled={saving} style={{padding:'8px 18px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,color:C.textSub}}>Cancelar</button>
      <button onClick={handleSave} disabled={saving} style={{padding:'8px 22px',background:C.yellow,border:'none',borderRadius:8,fontSize:14,fontWeight:700,color:C.bg}}>{saving?'A guardar…':'Guardar'}</button>
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKOFFICE — CONSUMOS  (date range + Hoje)
// ═══════════════════════════════════════════════════════════════════════════
function SecConsumos({consumos,funcionarios,ementas}) {
  const [fStart,setFStart]=useState(FIRST_MONTH())
  const [fEnd,  setFEnd]  =useState(TODAY)
  const [fMeal, setFMeal] =useState('')

  const enriched=consumos.map(c=>{
    const fn=funcionarios.find(f=>f.id===c.funcionario_id),em=ementas.find(e=>e.id===c.ementa_id)
    if(!fn||!em) return null
    const pk=`prato${c.prato_num}`
    return{...c,nome:fn.nome,foto:fn.foto,numero:fn.numero,data:em.data,tipo:em.tipo,pratoLabel:em[pk+'_label'],pratoDesc:em[pk+'_desc']}
  }).filter(Boolean)

  const filtered=enriched.filter(c=>(!fStart||c.data>=fStart)&&(!fEnd||c.data<=fEnd)&&(!fMeal||c.tipo===fMeal))
  const stats={total:filtered.length,a:filtered.filter(c=>c.tipo==='A').length,j:filtered.filter(c=>c.tipo==='J').length}

  const iS={padding:'7px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,background:C.surface3,color:C.text}
  const thS={padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase'}

  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
      {[{l:'Total',v:stats.total},{l:'Almoços',v:stats.a},{l:'Jantares',v:stats.j}].map(s=><div key={s.l} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14,textAlign:'center'}}>
        <div style={{fontSize:34,fontWeight:700,color:C.yellow}}>{s.v}</div>
        <div style={{fontSize:13,color:C.textSub,marginTop:2}}>{s.l}</div>
      </div>)}
    </div>
    {/* Filtros */}
    <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <label style={{fontSize:12,color:C.textMuted}}>De</label>
        <input type="date" value={fStart} onChange={e=>setFStart(e.target.value)} style={iS}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <label style={{fontSize:12,color:C.textMuted}}>Até</label>
        <input type="date" value={fEnd} onChange={e=>setFEnd(e.target.value)} style={iS}/>
      </div>
      <button onClick={()=>{setFStart(TODAY);setFEnd(TODAY)}}
        style={{padding:'7px 14px',background:C.yellow+'22',border:`1px solid ${C.yellow}55`,borderRadius:6,fontSize:12,color:C.yellow,fontWeight:600}}>Hoje</button>
      <select value={fMeal} onChange={e=>setFMeal(e.target.value)} style={iS}>
        <option value="">Todas as refeições</option>
        <option value="A">Almoço</option>
        <option value="J">Jantar</option>
      </select>
      <button onClick={()=>{setFStart(FIRST_MONTH());setFEnd(TODAY);setFMeal('')}}
        style={{padding:'7px 10px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:6,fontSize:11,color:C.textSub}}>Limpar</button>
    </div>
    <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
      {filtered.length===0
        ?<div style={{padding:36,textAlign:'center',color:C.textMuted,fontSize:13}}>{consumos.length===0?'Sem consumos registados.':'Sem registos para o filtro aplicado.'}</div>
        :<table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:C.surface2}}>{['Funcionário','Data','Refeição','Prato','Hora'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{[...filtered].sort((a,b)=>new Date(b.validado_em)-new Date(a.validado_em)).map(c=><tr key={c.id} style={{borderTop:`1px solid ${C.border}`}}>
            <td style={{padding:'8px 14px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={c.nome} foto={c.foto} size={24}/><div><div style={{fontSize:14,fontWeight:500,color:C.text}}>{c.nome}</div><div style={{fontSize:11,color:C.textMuted}}>{c.numero}</div></div></div></td>
            <td style={{padding:'8px 14px',fontSize:13,color:C.textSub}}>{fmtS(c.data)}</td>
            <td style={{padding:'8px 14px',fontSize:14,color:C.textSub}}>{c.tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</td>
            <td style={{padding:'8px 14px'}}><PratoTag label={c.pratoLabel}/></td>
            <td style={{padding:'8px 14px',fontSize:13,color:C.textMuted}}>{fmtHM(c.validado_em)}</td>
          </tr>)}</tbody>
        </table>}
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKOFFICE — MARCAÇÕES (novo)
// ═══════════════════════════════════════════════════════════════════════════
function SecMarcacoes({marcacoes,funcionarios,ementas}) {
  const [fStart, setFStart] = useState(FIRST_MONTH())
  const [fEnd,   setFEnd]   = useState(TODAY)
  const [fMeal,  setFMeal]  = useState('')
  const [view,   setView]   = useState('funcionario') // 'funcionario' | 'refeicao'

  const enriched=marcacoes.map(m=>{
    const fn=funcionarios.find(f=>f.id===m.funcionario_id),em=ementas.find(e=>e.id===m.ementa_id)
    if(!fn||!em) return null
    const pk=`prato${m.prato_num}`
    return{...m,nome:fn.nome,foto:fn.foto,numero:fn.numero,data:em.data,tipo:em.tipo,pratoLabel:em[pk+'_label'],pratoDesc:em[pk+'_desc']}
  }).filter(Boolean)

  const filtered=enriched.filter(m=>(!fStart||m.data>=fStart)&&(!fEnd||m.data<=fEnd)&&(!fMeal||m.tipo===fMeal))
  const stats={total:filtered.length,a:filtered.filter(m=>m.tipo==='A').length,j:filtered.filter(m=>m.tipo==='J').length}

  const iS={padding:'7px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,background:C.surface3,color:C.text}
  const thS={padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase'}

  const MarcRow=({m})=><tr style={{borderTop:`1px solid ${C.border}`}}>
    <td style={{padding:'8px 14px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={m.nome} foto={m.foto} size={24}/><div><div style={{fontSize:14,fontWeight:500,color:C.text}}>{m.nome}</div><div style={{fontSize:11,color:C.textMuted}}>{m.numero}</div></div></div></td>
    <td style={{padding:'8px 14px',fontSize:13,color:C.textSub}}>{fmtS(m.data)}</td>
    {view==='funcionario'&&<td style={{padding:'8px 14px',fontSize:14,color:C.textSub}}>{m.tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</td>}
    <td style={{padding:'8px 14px'}}><PratoTag label={m.pratoLabel}/></td>
    <td style={{padding:'8px 14px',fontSize:13,color:C.textSub,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{m.pratoDesc}</td>
  </tr>

  const headers=['Funcionário','Data',...(view==='funcionario'?['Refeição']:[]),'Tipo de Prato','Prato']

  const sortedByFunc=[...filtered].sort((a,b)=>a.nome.localeCompare(b.nome,'pt')||(a.data<b.data?-1:1))
  const almoco=filtered.filter(m=>m.tipo==='A').sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:a.nome.localeCompare(b.nome,'pt'))
  const jantar=filtered.filter(m=>m.tipo==='J').sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:a.nome.localeCompare(b.nome,'pt'))

  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
      {[{l:'Total',v:stats.total},{l:'Almoços',v:stats.a},{l:'Jantares',v:stats.j}].map(s=><div key={s.l} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14,textAlign:'center'}}>
        <div style={{fontSize:34,fontWeight:700,color:C.yellow}}>{s.v}</div>
        <div style={{fontSize:13,color:C.textSub,marginTop:2}}>{s.l}</div>
      </div>)}
    </div>

    {/* Filtros */}
    <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <label style={{fontSize:12,color:C.textMuted}}>De</label>
        <input type="date" value={fStart} onChange={e=>setFStart(e.target.value)} style={iS}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <label style={{fontSize:12,color:C.textMuted}}>Até</label>
        <input type="date" value={fEnd} onChange={e=>setFEnd(e.target.value)} style={iS}/>
      </div>
      <button onClick={()=>{setFStart(TODAY);setFEnd(TODAY)}}
        style={{padding:'7px 14px',background:C.yellow+'22',border:`1px solid ${C.yellow}55`,borderRadius:6,fontSize:12,color:C.yellow,fontWeight:600}}>Hoje</button>
      <select value={fMeal} onChange={e=>setFMeal(e.target.value)} style={iS}>
        <option value="">Todas as refeições</option>
        <option value="A">Almoço</option>
        <option value="J">Jantar</option>
      </select>
      <button onClick={()=>{setFStart(FIRST_MONTH());setFEnd(TODAY);setFMeal('')}}
        style={{padding:'7px 10px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:6,fontSize:11,color:C.textSub}}>Limpar</button>

      {/* Toggle de vista */}
      <div style={{marginLeft:'auto',display:'flex',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
        {[{k:'funcionario',l:'Por funcionário'},{k:'refeicao',l:'Por refeição'}].map(o=><button key={o.k} onClick={()=>setView(o.k)}
          style={{padding:'7px 14px',fontSize:12,fontWeight:view===o.k?600:400,background:view===o.k?C.yellow+'22':'transparent',color:view===o.k?C.yellow:C.textSub,border:'none',borderRight:o.k==='funcionario'?`1px solid ${C.border}`:'none'}}>
          {o.l}
        </button>)}
      </div>
    </div>

    {/* Tabela por funcionário */}
    {view==='funcionario'&&<div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
      {sortedByFunc.length===0
        ?<div style={{padding:36,textAlign:'center',color:C.textMuted,fontSize:13}}>Sem marcações para o período selecionado.</div>
        :<table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:C.surface2}}>{headers.map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{sortedByFunc.map((m,i)=><MarcRow key={i} m={m}/>)}</tbody>
        </table>}
    </div>}

    {/* Vista por refeição — dois painéis */}
    {view==='refeicao'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {[{tipo:'A',label:'🌞 Almoço',rows:almoco},{tipo:'J',label:'🌙 Jantar',rows:jantar}].map(({tipo,label,rows})=>(
        (!fMeal||fMeal===tipo)&&<div key={tipo} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',background:C.surface2,borderBottom:`1px solid ${C.border}`,fontSize:15,fontWeight:600,color:C.text,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>{label}</span>
            <span style={{fontSize:12,color:C.textMuted,fontWeight:400}}>{rows.length} marcação{rows.length!==1?'ões':''}</span>
          </div>
          {rows.length===0?<div style={{padding:24,textAlign:'center',color:C.textMuted,fontSize:13}}>Sem marcações</div>
          :<table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:C.surface2}}>{['Funcionário','Data','Prato'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((m,i)=><tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
              <td style={{padding:'8px 14px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nome={m.nome} foto={m.foto} size={22}/><span style={{fontSize:13,fontWeight:500,color:C.text}}>{m.nome}</span></div></td>
              <td style={{padding:'8px 14px',fontSize:12,color:C.textSub}}>{fmtS(m.data)}</td>
              <td style={{padding:'8px 14px'}}><PratoTag label={m.pratoLabel}/></td>
            </tr>)}
            </tbody>
          </table>}
        </div>
      ))}
    </div>}
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKOFFICE — DEFINIÇÕES (novo)
// ═══════════════════════════════════════════════════════════════════════════
function SecDefinicoes({settings,reload}) {
  const s={...DEFAULT_SETTINGS,...settings}
  const [form,setForm]=useState({...s})
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(false)
  const set=(k,v)=>setForm(p=>({...p,[k]:v}))

  const save=async()=>{
    setSaving(true)
    await Promise.all(Object.entries(form).map(([k,v])=>saveDefinicao(k,String(v))))
    await reload()
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500)
  }

  const iS={padding:'9px 12px',borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,background:C.surface3,color:C.text}
  const lS={fontSize:12,fontWeight:700,color:C.textMuted,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}
  const Card=({title,children})=><div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'18px 20px',marginBottom:16}}>
    <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>{title}</div>
    {children}
  </div>

  return <div style={{maxWidth:560}}>
    <Card title="⏰ Horário da cantina">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <div><label style={lS}>Almoço — início</label><input type="time" value={form.almoco_inicio} onChange={e=>set('almoco_inicio',e.target.value)} style={{...iS,width:'100%'}}/></div>
        <div><label style={lS}>Almoço — fim</label><input type="time" value={form.almoco_fim} onChange={e=>set('almoco_fim',e.target.value)} style={{...iS,width:'100%'}}/></div>
        <div><label style={lS}>Jantar — início</label><input type="time" value={form.jantar_inicio} onChange={e=>set('jantar_inicio',e.target.value)} style={{...iS,width:'100%'}}/></div>
        <div><label style={lS}>Jantar — fim</label><input type="time" value={form.jantar_fim} onChange={e=>set('jantar_fim',e.target.value)} style={{...iS,width:'100%'}}/></div>
      </div>
      <div style={{fontSize:12,color:C.textMuted,background:C.surface2,borderRadius:8,padding:'8px 12px'}}>
        O terminal de validações usa estes horários para determinar automaticamente se é almoço ou jantar.
      </div>
    </Card>

    <Card title="📅 Regras de marcação">
      <div style={{marginBottom:14}}>
        <label style={lS}>Antecedência mínima (dias)</label>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <input type="number" min="0" max="30" value={form.marcacao_antecedencia_dias} onChange={e=>set('marcacao_antecedencia_dias',e.target.value)} style={{...iS,width:100}}/>
          <span style={{fontSize:13,color:C.textSub}}>
            {form.marcacao_antecedencia_dias==='0'?'Funcionários podem marcar para o próprio dia'
            :form.marcacao_antecedencia_dias==='1'?'Têm de marcar com pelo menos 1 dia de antecedência'
            :`Têm de marcar com pelo menos ${form.marcacao_antecedencia_dias} dias de antecedência`}
          </span>
        </div>
      </div>
      <div>
        <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
          <input type="checkbox" checked={form.servir_fds==='true'} onChange={e=>set('servir_fds',e.target.checked?'true':'false')}
            style={{width:18,height:18}}/>
          <div>
            <div style={{fontSize:14,color:C.text,fontWeight:500}}>Servir refeições ao fim de semana</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>Se desativado, sábado e domingo não aparecem no terminal de marcações</div>
          </div>
        </label>
      </div>
    </Card>

    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <button onClick={save} disabled={saving}
        style={{padding:'10px 28px',background:C.yellow,border:'none',borderRadius:10,fontSize:15,fontWeight:700,color:C.bg}}>
        {saving?'A guardar…':'Guardar definições'}
      </button>
      {saved&&<span style={{fontSize:13,color:C.success,display:'flex',alignItems:'center',gap:5}}><Icon name="check" size={14} color={C.success}/>Guardado com sucesso</span>}
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [mode,         setMode]         = useState(getInitialMode)
  const [loading,      setLoading]      = useState(true)
  const [loadErr,      setLoadErr]      = useState(null)
  const [funcionarios, setFuncionarios] = useState([])
  const [ementas,      setEmentas]      = useState([])
  const [marcacoesAll, setMarcacoesAll] = useState([])
  const [consumos,     setConsumos]     = useState([])
  const [settings,     setSettings]     = useState(DEFAULT_SETTINGS)

  const reload=useCallback(async()=>{
    try{
      setLoadErr(null)
      const [f,e,m,c,def]=await Promise.all([fetchFuncionarios(),fetchEmentas(),fetchMarcacoesAll(),fetchConsumos(),fetchDefinicoes()])
      setFuncionarios(f); setEmentas(e); setMarcacoesAll(m); setConsumos(c); setSettings(def)
    }catch(err){setLoadErr('Erro ao carregar dados. Verifica a ligação.')}
  },[])

  useEffect(()=>{ reload().finally(()=>setLoading(false)) },[reload])

  if(loading) return <LoadingScreen msg="A ligar ao servidor…"/>

  const ErrBar=()=>loadErr?<div style={{position:'fixed',top:0,left:0,right:0,zIndex:99,padding:'0 16px'}}><ErrorBanner msg={loadErr} onRetry={reload}/></div>:null
  const shared={funcionarios,ementas,settings}

  if(mode==='selector')   return <ModeSelector onSelect={setMode}/>
  if(mode==='marcacoes')  return <><ErrBar/><TerminalMarcacoes  {...shared}                          onBack={()=>setMode('selector')}/></>
  if(mode==='validacoes') return <><ErrBar/><TerminalValidacoes {...shared}                          onBack={()=>setMode('selector')}/></>
  if(mode==='backoffice') return <><ErrBar/><Backoffice {...shared} marcacoesAll={marcacoesAll} consumos={consumos} reload={reload} onBack={()=>setMode('selector')}/></>
}
