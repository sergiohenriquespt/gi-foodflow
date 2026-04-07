import { useState, useEffect, useRef } from 'react'

// ─── Supabase (descomenta quando tiveres o projeto criado) ────────────────────
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient('https://SEU_URL.supabase.co', 'SUA_ANON_KEY')

// ═════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — DARK MODE
// ═════════════════════════════════════════════════════════════════════════════
const C = {
  bg:        '#151920',
  surface:   '#1e242d',
  surface2:  '#252d38',
  surface3:  '#2a3241',
  border:    '#2d3748',
  border2:   '#384455',
  yellow:    '#e0cb4b',
  yellowDim: '#b8a63d',
  gray:      '#8d9190',
  text:      '#e2e8f0',
  textSub:   '#94a3b8',
  textMuted: '#64748b',
  success:   '#34d399',
  successBg: '#0d2e22',
  danger:    '#f87171',
  dangerBg:  '#2d1515',
  warn:      '#fbbf24',
  warnBg:    '#2d2208',
}

const PRATO_PALETTE = {
  'Carne':       { bg: '#2d1a1a', color: '#f4a49a', border: '#5c2020' },
  'Peixe':       { bg: '#0f1e2d', color: '#7ec8f0', border: '#1a3d5c' },
  'Dieta':       { bg: '#0d2218', color: '#6ee7b7', border: '#1a5c3a' },
  'Vegetariano': { bg: '#1e1b08', color: '#fcd34d', border: '#4a420a' },
}
const pratoStyle = (l) => PRATO_PALETTE[l] || { bg: C.surface2, color: C.textSub, border: C.border }

// ═════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS DE DATA
// ═════════════════════════════════════════════════════════════════════════════
const d2s = (d) => { const x = d instanceof Date ? d : new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}` }
const addD = (s, n) => { const d = new Date(s+'T12:00:00'); d.setDate(d.getDate()+n); return d2s(d) }
const TODAY    = d2s(new Date())
const WD       = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const WD_FULL  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']
const MN       = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const fmtS     = (s) => { const d = new Date(s+'T12:00:00'); return `${WD[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}` }
const fmtF     = (s) => { const d = new Date(s+'T12:00:00'); return `${WD_FULL[d.getDay()]}, ${d.getDate()} de ${MN[d.getMonth()]}` }
const fmtHM    = (iso) => iso ? new Date(iso).toLocaleTimeString('pt-PT', { hour:'2-digit', minute:'2-digit' }) : ''
const mealNow  = () => new Date().getHours() < 15 ? 'A' : 'J'

const getInitialMode = () => {
  try { const p = new URLSearchParams(window.location.search); const m = p.get('mode'); if (['marcacoes','validacoes','backoffice'].includes(m)) return m } catch (_) {}
  return 'selector'
}

let _id = 300
const uid = () => ++_id

// ═════════════════════════════════════════════════════════════════════════════
// DADOS DE EXEMPLO
// ═════════════════════════════════════════════════════════════════════════════
const SEED_FUNC = [
  { id:1, numero:'001', nome:'Ana Silva',      pin:'1234', rfid:'CARD001', foto:null, ativo:true },
  { id:2, numero:'002', nome:'Bruno Costa',    pin:'5678', rfid:'CARD002', foto:null, ativo:true },
  { id:3, numero:'003', nome:'Carla Mendes',   pin:'',     rfid:'CARD003', foto:null, ativo:true }, // sem PIN
  { id:4, numero:'004', nome:'David Santos',   pin:'3456', rfid:'CARD004', foto:null, ativo:true },
  { id:5, numero:'005', nome:'Eva Rodrigues',  pin:'7890', rfid:'CARD005', foto:null, ativo:true },
]
const mkE = (id,day,tipo,p1l='',p1d='',p2l='',p2d='',p3l='',p3d='',p4l='',p4d='') => ({ id, data:addD(TODAY,day), tipo, prato1_label:p1l,prato1_desc:p1d, prato2_label:p2l,prato2_desc:p2d, prato3_label:p3l,prato3_desc:p3d, prato4_label:p4l,prato4_desc:p4d })
const SEED_EMENTAS = [
  mkE(1, 0,'A','Carne','Frango assado c/ batatas', 'Peixe','Bacalhau à Brás',    'Dieta','Frango grelhado',   'Vegetariano','Risoto de cogumelos'),
  mkE(2, 0,'J','Carne','Vitela estufada',          'Peixe','Filetes de pescada', 'Dieta','Sopa + fruta',      'Vegetariano','Lasanha de legumes'),
  mkE(3, 1,'A','Carne','Bitoque de vaca',          'Peixe','Salmão grelhado',    'Dieta','Peito c/ vapor',    'Vegetariano','Wrap de legumes'),
  mkE(4, 1,'J','Carne','Costeletas grelhadas',     'Peixe','Carapau assado',     '',    '',                   'Vegetariano','Omeleta de legumes'),
  mkE(5, 2,'A','Carne','Lombinho de porco',        'Peixe','Linguado no forno',  'Dieta','Legumes + ovo',     '',           ''),
  mkE(6, 2,'J','Carne','Almôndegas',               'Peixe','Bacalhau cozido',    'Dieta','Salada + frango',   'Vegetariano','Strogonoff de cogumelos'),
  mkE(7, 3,'A','Carne','Frango no forno',          'Peixe','Dourada grelhada',   'Dieta','Sopa + frango',     'Vegetariano','Quiche de legumes'),
  mkE(8, 4,'A','Carne','Secretos de porco',        'Peixe','Tamboril guisado',   'Dieta','Frango c/ legumes', 'Vegetariano','Curry de grão'),
  mkE(9, 5,'A','Carne','Rojões à moda do Minho',  'Peixe','Polvo à lagareiro',  'Dieta','Ovo + legumes',     'Vegetariano','Buddha bowl'),
  mkE(10,5,'J','Carne','Entrecosto no forno',      'Peixe','Sardinhas grelhadas','Dieta','Frango + brócolos', 'Vegetariano','Tofu salteado'),
]

// ═════════════════════════════════════════════════════════════════════════════
// ÍCONES SVG MONOCOR
// ═════════════════════════════════════════════════════════════════════════════
const Icon = ({ name, size=18, color='currentColor' }) => {
  const p = {
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    users:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    chart:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    logout:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    fork:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 .55.45 1 1 1h3m0 0v7"/></svg>,
    check:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    warn:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    card:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  }
  return p[name] || null
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═════════════════════════════════════════════════════════════════════════════

function Logo({ size='md', showSub=true }) {
  const sz = size==='lg' ? {i:36,main:28,sub:11} : size==='sm' ? {i:26,main:18,sub:9} : {i:30,main:22,sub:10}
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:sz.i, height:sz.i, borderRadius:8, background:C.yellow, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon name="fork" size={sz.i*0.6} color={C.bg} />
      </div>
      <div>
        <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
          <span style={{ fontSize:sz.main*0.7, fontWeight:800, color:C.yellow, letterSpacing:1 }}>GI</span>
          <span style={{ fontSize:sz.main*0.58, fontWeight:700, color:C.text, letterSpacing:2 }}>FOODFLOW</span>
        </div>
        {showSub && <div style={{ fontSize:sz.sub, color:C.textMuted, marginTop:1, letterSpacing:0.5 }}>Gestão de Cantina</div>}
      </div>
    </div>
  )
}

function Avatar({ nome, foto, size=40 }) {
  const initials = nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  if (foto) return <img src={foto} alt={nome} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
  return <div style={{ width:size, height:size, borderRadius:'50%', background:C.yellow+'22', border:`1.5px solid ${C.yellow}55`, color:C.yellow, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:size*.36, flexShrink:0 }}>{initials}</div>
}

function PratoTag({ label, large=false }) {
  const { bg, color, border } = pratoStyle(label)
  return <span style={{ padding: large ? '5px 14px' : '3px 9px', borderRadius:5, fontSize: large ? 13 : 10, fontWeight:700, background:bg, color, border:`1px solid ${border}` }}>{label}</span>
}

// Botão de prato — touch-friendly, altura generosa
function PratoBtn({ label, desc, selected, onClick, disabled }) {
  const ps = pratoStyle(label)
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display:'flex', alignItems:'center', gap:14, padding:'0 18px', height:68, background: selected ? C.yellow+'18' : C.surface2, border:`2px solid ${selected ? C.yellow : C.border}`, borderRadius:12, textAlign:'left', transition:'all .15s', cursor: disabled ? 'default' : 'pointer', width:'100%' }}>
      <span style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:700, background:ps.bg, color:ps.color, border:`1px solid ${ps.border}`, minWidth:98, textAlign:'center', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:15, flex:1, color: selected ? C.text : C.textSub, fontWeight: selected ? 500 : 400 }}>{desc}</span>
      {selected && <span style={{ flexShrink:0 }}><Icon name="check" size={20} color={C.yellow} /></span>}
    </button>
  )
}

// Teclado numérico grande — otimizado para touch em POS
function BigKeypad({ value, onChange, onConfirm, maxLen=10, confirmLabel='→', confirmDisabled=false }) {
  const s = { height:76, fontSize:22, fontWeight:500, background:C.surface2, border:`1.5px solid ${C.border}`, borderRadius:12, color:C.text, transition:'background .1s' }
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:9 }}>
      {[1,2,3,4,5,6,7,8,9].map(d => (
        <button key={d} onClick={()=> value.length < maxLen && onChange(value+d)} style={s}>{d}</button>
      ))}
      <button onClick={()=>onChange(value.slice(0,-1))} style={{ ...s, fontSize:18, color:C.textSub }}>←</button>
      <button onClick={()=> value.length < maxLen && onChange(value+'0')} style={s}>0</button>
      <button onClick={onConfirm} disabled={confirmDisabled}
        style={{ ...s, background: confirmDisabled ? C.surface3 : C.yellow, border:'none', color: confirmDisabled ? C.textMuted : C.bg, fontWeight:700 }}>
        {confirmLabel}
      </button>
    </div>
  )
}

// Ecrã de entrada numérica (usado nas duas etapas de identificação)
function InputScreen({ title, subtitle, value, onChange, onConfirm, onBack, confirmLabel, hint, error, children }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      {onBack && (
        <button onClick={onBack} style={{ position:'absolute', top:24, left:24, background:'none', border:'none', color:C.textMuted, fontSize:14, display:'flex', alignItems:'center', gap:6 }}>← Voltar</button>
      )}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:24, padding:'36px 40px', width:440 }}>
        <div style={{ marginBottom:28 }}>
          <Logo size="md" showSub={true} />
        </div>

        {children}

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:13, color:C.textMuted, marginBottom:8 }}>{title}</div>
          {/* Display do valor */}
          <div style={{ background:C.surface3, border:`1.5px solid ${error ? C.danger+'66' : C.border2}`, borderRadius:12, padding:'14px 18px', textAlign:'center', minHeight:60, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {value
              ? <span style={{ fontSize:32, letterSpacing:10, color:C.yellow, fontWeight:600 }}>{'•'.repeat(value.length)}</span>
              : <span style={{ color:C.textMuted, fontSize:15 }}>{subtitle}</span>}
          </div>
          {error && <div style={{ marginTop:8, background:C.dangerBg, border:`1px solid ${C.danger}44`, borderRadius:8, padding:'8px 14px', fontSize:13, color:C.danger, textAlign:'center' }}>{error}</div>}
        </div>

        <BigKeypad value={value} onChange={onChange} onConfirm={onConfirm} confirmLabel={confirmLabel} confirmDisabled={!value} />

        {hint && (
          <div style={{ textAlign:'center', fontSize:11, color:C.textMuted, marginTop:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Icon name="card" size={12} color={C.textMuted} />
            {hint}
          </div>
        )}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SELETOR DE MODO
// ═════════════════════════════════════════════════════════════════════════════
function ModeSelector({ onSelect }) {
  const modes = [
    { key:'marcacoes',  iconName:'calendar', label:'Terminal de Marcações',  desc:'Funcionários marcam as suas refeições' },
    { key:'validacoes', iconName:'card',     label:'Terminal de Validações', desc:'Leitura de cartão RFID / código na cozinha' },
    { key:'backoffice', iconName:'chart',    label:'Backoffice',             desc:'Ementas, funcionários e relatórios' },
  ]
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:24 }}>
      <div style={{ marginBottom:32 }}><Logo size="lg" showSub={true} /></div>
      {modes.map(m => (
        <button key={m.key} onClick={()=>onSelect(m.key)}
          style={{ width:320, padding:'20px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, textAlign:'left' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.yellow+'80';e.currentTarget.style.background=C.surface2}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface}}>
          <div style={{ marginBottom:10 }}><Icon name={m.iconName} size={20} color={C.yellow} /></div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{m.label}</div>
          <div style={{ fontSize:12, color:C.textSub, marginTop:3 }}>{m.desc}</div>
        </button>
      ))}
      <div style={{ marginTop:20, fontSize:11, color:C.textMuted, textAlign:'center', maxWidth:280, lineHeight:1.7 }}>
        URL por computador:&nbsp;
        <code style={{ color:C.yellow+'aa', background:C.surface2, padding:'1px 5px', borderRadius:3 }}>?mode=marcacoes</code>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TERMINAL DE MARCAÇÕES  — POS 15" 4:3 TOUCH
// Fluxo: código de funcionário → PIN (se tiver) → dashboard
// ═════════════════════════════════════════════════════════════════════════════
function TerminalMarcacoes({ funcionarios, ementas, marcacoes, setMarcacoes, onBack }) {
  const [step,     setStep]     = useState('numero')   // 'numero' | 'pin' | 'dashboard'
  const [numInput, setNumInput] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [func,     setFunc]     = useState(null)
  const [err,      setErr]      = useState('')
  const [selDay,   setSelDay]   = useState(TODAY)

  const rfidRef   = useRef('')
  const rfidTimer = useRef(null)

  // Captura RFID (teclado HID rápido + Enter)
  useEffect(() => {
    if (step === 'dashboard') return
    const handler = (e) => {
      if (e.key === 'Enter') {
        if (rfidRef.current) { handleRfid(rfidRef.current); rfidRef.current = '' }
        return
      }
      if (e.key.length !== 1) return
      rfidRef.current += e.key
      clearTimeout(rfidTimer.current)
      rfidTimer.current = setTimeout(() => { rfidRef.current = '' }, 200)
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(rfidTimer.current) }
  }, [step, funcionarios])

  const handleRfid = (val) => {
    const f = funcionarios.find(f => f.rfid === val.trim())
    if (!f || !f.ativo) return
    loginFunc(f)
  }

  const loginFunc = (f) => {
    if (f.pin) { setFunc(f); setStep('pin'); setNumInput(''); setErr('') }
    else       { setFunc(f); setStep('dashboard'); setNumInput(''); setErr('') }
  }

  const submitNumero = () => {
    const v = numInput.trim()
    const f = funcionarios.find(f => f.numero === v || f.numero === v.padStart(3,'0'))
    if (!f || !f.ativo) { setErr('Código não encontrado'); setNumInput(''); setTimeout(()=>setErr(''), 3000); return }
    loginFunc(f)
  }

  const submitPin = () => {
    if (pinInput === func.pin) { setStep('dashboard'); setPinInput(''); setErr('') }
    else { setErr('PIN incorreto'); setPinInput(''); setTimeout(()=>setErr(''), 3000) }
  }

  const logout = () => { setStep('numero'); setFunc(null); setNumInput(''); setPinInput(''); setErr(''); setSelDay(TODAY) }

  // ── Ecrã: introduz código ──────────────────────────────────────────────────
  if (step === 'numero') return (
    <InputScreen
      title="Introduza o seu código de funcionário"
      subtitle="Código"
      value={numInput} onChange={setNumInput}
      onConfirm={submitNumero}
      onBack={onBack}
      confirmLabel="→"
      hint="Ou passe o cartão RFID no leitor"
      error={err}>
      {/* caixinha de demo */}
      <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', marginBottom:18 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Códigos de teste</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {SEED_FUNC.map(f => (
            <div key={f.id} style={{ fontSize:12, color:C.textSub }}>
              <span style={{ fontFamily:'monospace', color:C.yellow, fontWeight:700 }}>{f.numero}</span>
              &nbsp;{f.nome.split(' ')[0]}
              {!f.pin && <span style={{ fontSize:10, color:C.textMuted }}> (sem PIN)</span>}
            </div>
          ))}
        </div>
      </div>
    </InputScreen>
  )

  // ── Ecrã: introduz PIN ────────────────────────────────────────────────────
  if (step === 'pin') return (
    <InputScreen
      title={`Introduza o seu PIN`}
      subtitle="PIN"
      value={pinInput} onChange={setPinInput}
      onConfirm={submitPin}
      onBack={()=>{ setStep('numero'); setFunc(null); setPinInput(''); setErr('') }}
      confirmLabel="→"
      error={err}>
      {/* mostra quem está a entrar */}
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:18 }}>
        <Avatar nome={func.nome} foto={func.foto} size={48} />
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{func.nome}</div>
          <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Nº {func.numero}</div>
        </div>
      </div>
    </InputScreen>
  )

  // ── Dashboard de marcações ─────────────────────────────────────────────────
  const days   = [...new Set(ementas.map(e=>e.data))].sort().filter(d=>d>=TODAY).slice(0,14)
  const dayEm  = ementas.filter(e=>e.data===selDay)
  const getM   = (eid) => marcacoes.find(m=>m.funcionario_id===func.id&&m.ementa_id===eid)
  const marcar = (ementa, n) => { const ex=getM(ementa.id); if(ex) setMarcacoes(p=>p.map(m=>m.id===ex.id?{...m,prato_num:n}:m)); else setMarcacoes(p=>[...p,{id:uid(),funcionario_id:func.id,ementa_id:ementa.id,prato_num:n,created_at:new Date().toISOString()}]) }
  const cancelar = (eid) => setMarcacoes(p=>p.filter(m=>!(m.funcionario_id===func.id&&m.ementa_id===eid)))

  return (
    <div style={{ height:'100vh', background:C.bg, display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header — 58px */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'0 20px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <Logo size="sm" showSub={false} />
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Avatar nome={func.nome} foto={func.foto} size={36} />
          <div>
            <div style={{ fontSize:16, fontWeight:600, color:C.text, lineHeight:1.2 }}>{func.nome}</div>
            <div style={{ fontSize:11, color:C.textMuted }}>Nº {func.numero}</div>
          </div>
          <button onClick={logout}
            style={{ marginLeft:8, padding:'8px 18px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, color:C.textSub, fontSize:14, height:40 }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Lista de dias — touch buttons 80px */}
        <div style={{ width:200, background:C.surface, borderRight:`1px solid ${C.border}`, overflowY:'auto', flexShrink:0 }}>
          <div style={{ padding:'12px 16px 8px', fontSize:10, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:1 }}>Dias disponíveis</div>
          {days.map(d => {
            const dd  = new Date(d+'T12:00:00')
            const isT = d === TODAY
            const mc  = ementas.filter(e=>e.data===d&&getM(e.id)).length
            const sel = selDay === d
            return (
              <button key={d} onClick={()=>setSelDay(d)}
                style={{ width:'100%', height:80, padding:'0 16px', textAlign:'left', background: sel ? C.yellow+'14' : 'transparent', border:'none', borderLeft: sel ? `4px solid ${C.yellow}` : '4px solid transparent', display:'flex', flexDirection:'column', justifyContent:'center', gap:2 }}>
                <div style={{ fontSize:14, fontWeight:700, color: isT ? C.yellow : C.text }}>{isT ? 'HOJE' : WD[dd.getDay()]}</div>
                <div style={{ fontSize:12, color:C.textSub }}>{dd.getDate()} {MN[dd.getMonth()]}</div>
                {mc > 0
                  ? <div style={{ fontSize:11, color:C.success, fontWeight:600 }}>✓ {mc} marcado{mc>1?'s':''}</div>
                  : <div style={{ fontSize:11, color:C.textMuted }}>— sem marcação</div>}
              </button>
            )
          })}
        </div>

        {/* Conteúdo das refeições */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>

          {/* Cabeçalho do dia */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{fmtF(selDay)}</div>
            {selDay===TODAY && <span style={{ background:C.yellow+'22', color:C.yellow, border:`1px solid ${C.yellow}44`, fontSize:11, padding:'3px 10px', borderRadius:5, fontWeight:700 }}>HOJE</span>}
          </div>

          {['A','J'].map(tipo => {
            const em   = dayEm.find(e=>e.tipo===tipo)
            if (!em) return null
            const marc = getM(em.id)
            const pratos = [1,2,3,4].map(n=>({n,label:em[`prato${n}_label`],desc:em[`prato${n}_desc`]})).filter(p=>p.label)

            return (
              <div key={tipo} style={{ background:C.surface, border:`2px solid ${marc ? C.yellow+'55' : C.border}`, borderRadius:14, padding:'16px 18px', marginBottom:16 }}>
                {/* Header da refeição */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:20 }}>{tipo==='A'?'🌞':'🌙'}</span>
                    <span style={{ fontSize:17, fontWeight:700, color:C.text }}>{tipo==='A'?'Almoço':'Jantar'}</span>
                  </div>
                  {marc ? (
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:13, color:C.success, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
                        <Icon name="check" size={14} color={C.success} /> Marcado
                      </span>
                      <button onClick={()=>cancelar(em.id)}
                        style={{ padding:'6px 14px', background:C.dangerBg, border:`1px solid ${C.danger}33`, borderRadius:8, color:C.danger, fontSize:13, height:36 }}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize:12, color:C.textMuted }}>Seleciona um prato</span>
                  )}
                </div>

                {/* Pratos */}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {pratos.map(({n,label,desc}) => (
                    <PratoBtn key={n} label={label} desc={desc} selected={marc?.prato_num===n} onClick={()=>marcar(em,n)} />
                  ))}
                </div>
              </div>
            )
          })}

          {dayEm.length===0 && (
            <div style={{ textAlign:'center', color:C.textMuted, fontSize:15, marginTop:60 }}>Sem ementa disponível para este dia</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TERMINAL DE VALIDAÇÕES — POS 15" 4:3 TOUCH, VISÍVEL PARA COZINHA
// Fluxo: código de funcionário → resultado imediato
// ═════════════════════════════════════════════════════════════════════════════
function TerminalValidacoes({ funcionarios, ementas, marcacoes, consumos, setConsumos, onBack }) {
  const [numInput, setNumInput] = useState('')
  const [status,   setStatus]   = useState(null)
  const [recentes, setRecentes] = useState([])
  const meal = mealNow()

  const rfidRef   = useRef('')
  const rfidTimer = useRef(null)

  useEffect(() => {
    if (status?.type === 'no-marc') return
    const handler = (e) => {
      if (e.key === 'Enter') { if (rfidRef.current) { process(rfidRef.current, true); rfidRef.current = '' } return }
      if (e.key.length !== 1) return
      rfidRef.current += e.key
      clearTimeout(rfidTimer.current)
      rfidTimer.current = setTimeout(() => { rfidRef.current = '' }, 200)
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(rfidTimer.current) }
  }, [status, funcionarios, ementas, marcacoes, consumos])

  const reset = () => { setNumInput(''); setStatus(null) }

  const confirmarConsumo = (func, ementa, pratoNum) => {
    const pk = `prato${pratoNum}`
    const pratoLabel = ementa[pk+'_label'], pratoDesc = ementa[pk+'_desc']
    const c = { id:uid(), funcionario_id:func.id, ementa_id:ementa.id, prato_num:pratoNum, validado_em:new Date().toISOString() }
    setConsumos(p=>[...p,c])
    setRecentes(p=>[{...c, nome:func.nome, foto:func.foto, pratoLabel, pratoDesc},...p].slice(0,5))
    setStatus({ type:'ok', func, pratoLabel, pratoDesc })
    setTimeout(reset, 5000)
  }

  const process = (val, isRfid=false) => {
    const v = val.trim()
    if (!v) return
    setNumInput('')
    // RFID faz lookup por rfid_uid; código manual faz lookup por numero
    const func = isRfid
      ? funcionarios.find(f => f.rfid === v)
      : funcionarios.find(f => f.numero === v || f.numero === v.padStart(3,'0'))
    if (!func) { setStatus({ type:'error', msg:'Funcionário não encontrado' }); setTimeout(reset, 3000); return }
    const ementa = ementas.find(e => e.data === TODAY && e.tipo === meal)
    if (!ementa) { setStatus({ type:'error', msg:'Sem ementa para este momento' }); setTimeout(reset, 3000); return }
    const ex = consumos.find(c => c.funcionario_id===func.id && c.ementa_id===ementa.id)
    if (ex) {
      const pk = `prato${ex.prato_num}`
      setStatus({ type:'dup', func, pratoLabel:ementa[pk+'_label'], pratoDesc:ementa[pk+'_desc'] })
      setTimeout(reset, 6000); return
    }
    const marc = marcacoes.find(m => m.funcionario_id===func.id && m.ementa_id===ementa.id)
    if (!marc) { setStatus({ type:'no-marc', func, ementa }); return }
    confirmarConsumo(func, ementa, marc.prato_num)
  }

  // Bloco do resultado (centro) — grande e visível para a cozinheira
  const renderResult = () => {
    if (status?.type === 'error') return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'48px 32px', background:C.surface, border:`2px solid ${C.danger}44`, borderRadius:24, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:C.dangerBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name="warn" size={36} color={C.danger} />
        </div>
        <div style={{ fontSize:22, fontWeight:700, color:C.danger }}>{status.msg}</div>
      </div>
    )

    if (status?.type === 'ok') {
      const ps = pratoStyle(status.pratoLabel)
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:18, padding:'40px 32px', background:C.surface, border:`2px solid ${C.success}44`, borderRadius:24, textAlign:'center' }}>
          <Avatar nome={status.func.nome} foto={status.func.foto} size={100} />
          <div style={{ fontSize:28, fontWeight:800, color:C.text }}>{status.func.nome}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:C.successBg, border:`1px solid ${C.success}44`, borderRadius:12, padding:'12px 24px' }}>
            <Icon name="check" size={20} color={C.success} />
            <span style={{ fontSize:18, fontWeight:700, color:C.success }}>CONSUMO REGISTADO</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, background:ps.bg, border:`1px solid ${ps.border}`, borderRadius:14, padding:'14px 28px' }}>
            <PratoTag label={status.pratoLabel} large={true} />
            <span style={{ fontSize:18, color:C.text, fontWeight:500 }}>{status.pratoDesc}</span>
          </div>
        </div>
      )
    }

    if (status?.type === 'dup') {
      const ps = pratoStyle(status.pratoLabel)
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:18, padding:'40px 32px', background:C.surface, border:`2px solid ${C.warn}44`, borderRadius:24, textAlign:'center' }}>
          <Avatar nome={status.func.nome} foto={status.func.foto} size={100} />
          <div style={{ fontSize:28, fontWeight:800, color:C.text }}>{status.func.nome}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:C.warnBg, border:`1px solid ${C.warn}44`, borderRadius:12, padding:'12px 24px' }}>
            <Icon name="warn" size={20} color={C.warn} />
            <span style={{ fontSize:16, fontWeight:700, color:C.warn }}>JÁ CONSUMIU ESTA REFEIÇÃO</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, background:ps.bg, border:`1px solid ${ps.border}`, borderRadius:14, padding:'14px 28px' }}>
            <PratoTag label={status.pratoLabel} large={true} />
            <span style={{ fontSize:18, color:C.text, fontWeight:500 }}>{status.pratoDesc}</span>
          </div>
        </div>
      )
    }

    if (status?.type === 'no-marc') return (
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:24, padding:'28px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <Avatar nome={status.func.nome} foto={status.func.foto} size={70} />
          <div>
            <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{status.func.nome}</div>
            <div style={{ fontSize:13, color:C.textSub, marginTop:2 }}>Sem marcação prévia</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.warnBg, border:`1px solid ${C.warn}33`, borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:14, color:C.warn, fontWeight:600 }}>
          <Icon name="warn" size={16} color={C.warn} /> Selecione o prato a servir:
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3,4].map(n => {
            const l = status.ementa[`prato${n}_label`], d = status.ementa[`prato${n}_desc`]
            if (!l) return null
            return <PratoBtn key={n} label={l} desc={d} selected={false} onClick={()=>confirmarConsumo(status.func, status.ementa, n)} />
          })}
        </div>
        <button onClick={reset} style={{ marginTop:12, width:'100%', height:48, background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, fontSize:14, color:C.textSub }}>Cancelar</button>
      </div>
    )

    // Standby — teclado numérico central
    return (
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:24 }}>
        {/* Zona de display */}
        <div style={{ padding:'28px 32px 22px', textAlign:'center', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:60, height:60, borderRadius:'50%', background:C.surface2, marginBottom:14 }}>
            <Icon name="card" size={26} color={C.yellow} />
          </div>
          <div style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:4 }}>
            {meal==='A' ? '🌞 Almoço' : '🌙 Jantar'}
          </div>
          <div style={{ fontSize:13, color:C.textSub, marginBottom:16 }}>Introduza o código de funcionário</div>
          {/* Display do código digitado */}
          <div style={{ background:C.surface3, border:`1.5px solid ${C.border2}`, borderRadius:12, padding:'14px 18px', minHeight:56, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {numInput
              ? <span style={{ fontSize:32, letterSpacing:14, color:C.yellow, fontWeight:600 }}>{'•'.repeat(numInput.length)}</span>
              : <span style={{ color:C.textMuted, fontSize:14 }}>Código</span>}
          </div>
        </div>
        {/* Teclado */}
        <div style={{ padding:'20px 32px 28px' }}>
          <BigKeypad value={numInput} onChange={setNumInput} onConfirm={()=>process(numInput)} confirmLabel="✓" />
        </div>
      </div>
    )
  }

  return (
    <div style={{ height:'100vh', background:C.bg, display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'0 20px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <Logo size="sm" showSub={false} />
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:13, color:C.textMuted }}>{meal==='A'?'🌞 Almoço':'🌙 Jantar'} · {new Date().toLocaleDateString('pt-PT')}</span>
          <button onClick={onBack} style={{ background:'none', border:'none', color:C.textMuted, fontSize:13 }}>← Sair</button>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Área central */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 28px' }}>
          <div style={{ width:'100%', maxWidth:460 }}>
            {renderResult()}
          </div>
        </div>

        {/* Sidebar — últimas validações, legível pela cozinheira */}
        <div style={{ width:280, background:C.surface, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0 }}>
          <div style={{ padding:'16px 18px 12px', fontSize:11, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:1, borderBottom:`1px solid ${C.border}` }}>
            Últimas validações
          </div>
          {recentes.length===0 ? (
            <div style={{ padding:32, textAlign:'center', color:C.textMuted, fontSize:13 }}>Sem validações</div>
          ) : recentes.map((r, i) => {
            const ps = pratoStyle(r.pratoLabel)
            const isFirst = i===0
            return (
              <div key={r.id} style={{ padding: isFirst ? '18px' : '14px 18px', borderBottom:`1px solid ${C.border}`, background: isFirst ? C.surface2 : 'transparent' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                  <Avatar nome={r.nome} foto={r.foto} size={isFirst ? 46 : 36} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize: isFirst ? 16 : 14, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.nome}</div>
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:1 }}>{fmtHM(r.validado_em)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, background:ps.bg, border:`1px solid ${ps.border}`, borderRadius:8, padding: isFirst ? '8px 12px' : '6px 10px' }}>
                  <PratoTag label={r.pratoLabel} large={isFirst} />
                  <span style={{ fontSize: isFirst ? 14 : 12, color:C.textSub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.pratoDesc}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// BACKOFFICE
// ═════════════════════════════════════════════════════════════════════════════
function Backoffice({ funcionarios, setFuncionarios, ementas, setEmentas, marcacoes, consumos, onBack }) {
  const [sec, setSec] = useState('ementas')
  const nav = [
    { key:'ementas',  iconName:'calendar', label:'Ementas' },
    { key:'funcs',    iconName:'users',    label:'Funcionários' },
    { key:'consumos', iconName:'chart',    label:'Consumos' },
  ]
  return (
    <div style={{ minHeight:'100vh', display:'flex' }}>
      <div style={{ width:60, background:C.surface, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:14, flexShrink:0 }}>
        <div style={{ width:34, height:34, borderRadius:8, background:C.yellow, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, flexShrink:0 }}>
          <Icon name="fork" size={18} color={C.bg} />
        </div>
        {nav.map(n => (
          <button key={n.key} title={n.label} onClick={()=>setSec(n.key)}
            style={{ width:40, height:40, borderRadius:8, margin:'3px 0', display:'flex', alignItems:'center', justifyContent:'center', background: sec===n.key ? C.yellow+'18' : 'transparent', border:`1px solid ${sec===n.key ? C.yellow+'55' : 'transparent'}`, transition:'all .15s' }}>
            <Icon name={n.iconName} size={18} color={sec===n.key ? C.yellow : C.textMuted} />
          </button>
        ))}
        <div style={{ flex:1 }} />
        <button title="Sair" onClick={onBack} style={{ width:40, height:40, borderRadius:8, margin:'0 0 14px', display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none' }}>
          <Icon name="logout" size={18} color={C.textMuted} />
        </button>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg, overflow:'hidden' }}>
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'0 22px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Icon name={nav.find(n=>n.key===sec)?.iconName} size={16} color={C.yellow} />
            <span style={{ fontSize:15, fontWeight:600, color:C.text }}>{nav.find(n=>n.key===sec)?.label}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:10, color:C.yellow+'aa', fontWeight:700, letterSpacing:1 }}>GI</span>
            <span style={{ fontSize:10, color:C.textMuted }}>FOODFLOW</span>
          </div>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:20 }}>
          {sec==='ementas'  && <SecEmentas ementas={ementas} setEmentas={setEmentas} />}
          {sec==='funcs'    && <SecFuncionarios funcionarios={funcionarios} setFuncionarios={setFuncionarios} />}
          {sec==='consumos' && <SecConsumos consumos={consumos} funcionarios={funcionarios} ementas={ementas} />}
        </div>
      </div>
    </div>
  )
}

// ── Sec: Ementas ──────────────────────────────────────────────────────────────
function SecEmentas({ ementas, setEmentas }) {
  const [selD, setSelD]       = useState(TODAY)
  const [editing, setEditing] = useState(null)
  const dates  = Array.from({length:14},(_,i)=>addD(TODAY,i))
  const dayEm  = ementas.filter(e=>e.data===selD)
  const add    = (tipo) => { const e={id:uid(),data:selD,tipo,prato1_label:'Carne',prato1_desc:'',prato2_label:'Peixe',prato2_desc:'',prato3_label:'Dieta',prato3_desc:'',prato4_label:'Vegetariano',prato4_desc:''}; setEmentas(p=>[...p,e]); setEditing({...e}) }
  const save   = (e) => { setEmentas(p=>p.map(x=>x.id===e.id?e:x)); setEditing(null) }
  const del    = (id) => { if(window.confirm('Eliminar ementa?')) setEmentas(p=>p.filter(e=>e.id!==id)) }
  if (editing) return <EmentaEditor ementa={editing} onSave={save} onCancel={()=>setEditing(null)} />
  return (
    <div style={{ display:'flex', gap:18 }}>
      <div style={{ width:148, flexShrink:0 }}>
        <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:1, marginBottom:8, paddingLeft:12 }}>14 dias</div>
        {dates.map(d => {
          const dd=new Date(d+'T12:00:00'), isT=d===TODAY, hasEm=ementas.some(e=>e.data===d)
          return (
            <button key={d} onClick={()=>setSelD(d)} style={{ width:'100%', padding:'8px 12px', textAlign:'left', background:selD===d?C.yellow+'12':C.surface, border:'none', borderLeft:selD===d?`3px solid ${C.yellow}`:'3px solid transparent', marginBottom:1, borderRadius:'0 6px 6px 0' }}>
              <div style={{ fontSize:9, fontWeight:700, color:isT?C.yellow:C.text }}>{isT?'HOJE':WD[dd.getDay()].toUpperCase()}</div>
              <div style={{ fontSize:9, color:C.textSub }}>{dd.getDate()} {MN[dd.getMonth()]}</div>
              {hasEm && <div style={{ fontSize:8, color:C.success, marginTop:1 }}>● ementa</div>}
            </button>
          )
        })}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          {fmtF(selD)} {selD===TODAY&&<span style={{ background:C.yellow+'22', color:C.yellow, border:`1px solid ${C.yellow}44`, fontSize:9, padding:'2px 7px', borderRadius:4, fontWeight:700 }}>HOJE</span>}
        </div>
        {['A','J'].map(tipo => {
          const em = dayEm.find(e=>e.tipo===tipo)
          return (
            <div key={tipo} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:em?10:0 }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</span>
                <div style={{ display:'flex', gap:6 }}>
                  {em ? (<>
                    <button onClick={()=>setEditing({...em})} style={{ fontSize:11, padding:'4px 10px', background:C.yellow+'22', border:`1px solid ${C.yellow}55`, borderRadius:6, fontWeight:600, color:C.yellow }}>Editar</button>
                    <button onClick={()=>del(em.id)} style={{ fontSize:11, padding:'4px 10px', background:C.dangerBg, border:`1px solid ${C.danger}33`, borderRadius:6, color:C.danger }}>Remover</button>
                  </>) : (
                    <button onClick={()=>add(tipo)} style={{ fontSize:11, padding:'4px 12px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:6, color:C.textSub }}>+ Adicionar ementa</button>
                  )}
                </div>
              </div>
              {em && <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                {[1,2,3,4].map(n => {
                  const l=em[`prato${n}_label`], d=em[`prato${n}_desc`]
                  if (!l) return <div key={n} style={{ background:C.surface2, borderRadius:6, padding:'7px 10px', border:`1px dashed ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:10, color:C.textMuted }}>Slot {n} vazio</span></div>
                  const ps=pratoStyle(l)
                  return <div key={n} style={{ background:ps.bg, border:`1px solid ${ps.border}`, borderRadius:6, padding:'7px 10px' }}><div style={{ fontSize:10, fontWeight:700, color:ps.color }}>{l}</div><div style={{ fontSize:11, color:C.textSub, marginTop:1 }}>{d||<span style={{ color:C.textMuted, fontStyle:'italic' }}>sem descrição</span>}</div></div>
                })}
              </div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmentaEditor({ ementa, onSave, onCancel }) {
  const [f, setF] = useState({...ementa})
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const iS = { padding:'7px 10px', borderRadius:6, border:`1px solid ${C.border}`, fontSize:12, background:C.surface3, color:C.text }
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:22, maxWidth:560 }}>
      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:18 }}>{f.tipo==='A'?'🌞 Almoço':'🌙 Jantar'} · {fmtF(f.data)}</div>
      {[1,2,3,4].map(n => (
        <div key={n} style={{ marginBottom:12, padding:12, background:C.surface2, borderRadius:8, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, marginBottom:7, textTransform:'uppercase', letterSpacing:.5 }}>Prato {n} — tipo em branco oculta o slot</div>
          <div style={{ display:'flex', gap:8 }}>
            <input value={f[`prato${n}_label`]} onChange={e=>set(`prato${n}_label`,e.target.value)} placeholder="Tipo (ex: Carne)" style={{...iS, width:130, flexShrink:0}} />
            <input value={f[`prato${n}_desc`]}  onChange={e=>set(`prato${n}_desc`, e.target.value)} placeholder="Descrição do prato"  style={{...iS, flex:1}} />
          </div>
        </div>
      ))}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
        <button onClick={onCancel} style={{ padding:'7px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.textSub }}>Cancelar</button>
        <button onClick={()=>onSave(f)} style={{ padding:'7px 18px', background:C.yellow, border:'none', borderRadius:8, fontSize:13, fontWeight:700, color:C.bg }}>Guardar</button>
      </div>
    </div>
  )
}

// ── Sec: Funcionários ─────────────────────────────────────────────────────────
function SecFuncionarios({ funcionarios, setFuncionarios }) {
  const [editing, setEditing] = useState(null)
  const blank = { id:null, numero:'', nome:'', pin:'', rfid:'', foto:null, ativo:true }
  const save  = (form) => { form.id ? setFuncionarios(p=>p.map(f=>f.id===form.id?form:f)) : setFuncionarios(p=>[...p,{...form,id:uid()}]); setEditing(null) }
  const del   = (id) => { if(window.confirm('Eliminar funcionário?')) setFuncionarios(p=>p.filter(f=>f.id!==id)) }
  if (editing !== null) return <FuncionarioEditor form={editing} onSave={save} onCancel={()=>setEditing(null)} />
  const thS = { padding:'8px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:C.textMuted, textTransform:'uppercase' }
  const tdS = { padding:'9px 12px', borderTop:`1px solid ${C.border}` }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:12, color:C.textSub }}>{funcionarios.length} funcionário(s)</div>
        <button onClick={()=>setEditing(blank)} style={{ padding:'6px 14px', background:C.yellow+'22', border:`1px solid ${C.yellow}55`, borderRadius:8, color:C.yellow, fontSize:12, fontWeight:600 }}>+ Novo</button>
      </div>
      <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:C.surface2 }}>{['Nº','Funcionário','PIN','RFID','Estado',''].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{funcionarios.map(f => (
            <tr key={f.id}>
              <td style={{...tdS, fontSize:11, color:C.textSub}}>{f.numero}</td>
              <td style={tdS}><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar nome={f.nome} foto={f.foto} size={26}/><span style={{ fontSize:13, fontWeight:500, color:C.text }}>{f.nome}</span></div></td>
              <td style={{...tdS, fontFamily:'monospace', fontSize:12, color:C.textMuted}}>{f.pin ? '•'.repeat(f.pin.length) : <span style={{ color:C.textMuted, fontStyle:'italic', fontSize:11 }}>sem PIN</span>}</td>
              <td style={{...tdS, fontFamily:'monospace', fontSize:11, color:C.textSub}}>{f.rfid}</td>
              <td style={tdS}><span style={{ fontSize:9, padding:'2px 7px', borderRadius:4, background:f.ativo?C.successBg:C.surface2, color:f.ativo?C.success:C.textMuted, border:`1px solid ${f.ativo?C.success+'33':C.border}`, fontWeight:700 }}>{f.ativo?'Ativo':'Inativo'}</span></td>
              <td style={tdS}><div style={{ display:'flex', gap:5 }}>
                <button onClick={()=>setEditing({...f})} style={{ fontSize:11, padding:'3px 9px', background:C.yellow+'22', border:`1px solid ${C.yellow}44`, borderRadius:6, fontWeight:600, color:C.yellow }}>Editar</button>
                <button onClick={()=>del(f.id)} style={{ fontSize:11, padding:'3px 9px', background:C.dangerBg, border:`1px solid ${C.danger}33`, borderRadius:6, color:C.danger }}>✕</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

function FuncionarioEditor({ form:init, onSave, onCancel }) {
  const [f, setF] = useState({...init})
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const handleFoto = (e) => { const file=e.target.files?.[0]; if(!file)return; const r=new FileReader(); r.onload=ev=>set('foto',ev.target.result); r.readAsDataURL(file) }
  const iS = { width:'100%', padding:'7px 10px', borderRadius:6, border:`1px solid ${C.border}`, fontSize:13, background:C.surface3, color:C.text, boxSizing:'border-box' }
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:22, maxWidth:440 }}>
      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:18 }}>{f.id?'Editar Funcionário':'Novo Funcionário'}</div>
      <div style={{ display:'flex', gap:18, marginBottom:14, alignItems:'center' }}>
        <div style={{ textAlign:'center' }}>
          <Avatar nome={f.nome||'?'} foto={f.foto} size={54}/>
          <label style={{ display:'block', marginTop:5, fontSize:11, color:C.yellow, fontWeight:600, cursor:'pointer' }}>Foto<input type="file" accept="image/*" onChange={handleFoto} style={{ display:'none' }}/></label>
        </div>
        <div style={{ flex:1 }}>
          {[{k:'numero',l:'Nº funcionário'},{k:'nome',l:'Nome completo'}].map(({k,l})=>(
            <div key={k} style={{ marginBottom:9 }}>
              <label style={{ fontSize:9, fontWeight:700, color:C.textMuted, display:'block', marginBottom:3, textTransform:'uppercase' }}>{l}</label>
              <input value={f[k]} onChange={e=>set(k,e.target.value)} style={iS}/>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:6 }}>
        {[{k:'pin',l:'PIN (deixa vazio = sem PIN)',t:'password'},{k:'rfid',l:'RFID UID',t:'text'}].map(({k,l,t})=>(
          <div key={k}>
            <label style={{ fontSize:9, fontWeight:700, color:C.textMuted, display:'block', marginBottom:3, textTransform:'uppercase' }}>{l}</label>
            <input type={t} value={f[k]} onChange={e=>set(k,e.target.value)} style={iS}/>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', marginBottom:14, fontSize:11, color:C.textMuted }}>
        Se o PIN ficar em branco, o funcionário entra diretamente com o código de utilizador.
      </div>
      <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer', marginBottom:18, color:C.textSub }}>
        <input type="checkbox" checked={f.ativo} onChange={e=>set('ativo',e.target.checked)}/> Funcionário ativo
      </label>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button onClick={onCancel} style={{ padding:'6px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.textSub }}>Cancelar</button>
        <button onClick={()=>onSave(f)} style={{ padding:'6px 16px', background:C.yellow, border:'none', borderRadius:8, fontSize:13, fontWeight:700, color:C.bg }}>Guardar</button>
      </div>
    </div>
  )
}

// ── Sec: Consumos ─────────────────────────────────────────────────────────────
function SecConsumos({ consumos, funcionarios, ementas }) {
  const [fDate, setFDate] = useState(TODAY)
  const [fMeal, setFMeal] = useState('')
  const enriched = consumos.map(c => {
    const fn=funcionarios.find(f=>f.id===c.funcionario_id), em=ementas.find(e=>e.id===c.ementa_id)
    if(!fn||!em) return null
    const pk=`prato${c.prato_num}`
    return {...c, nome:fn.nome, foto:fn.foto, numero:fn.numero, data:em.data, tipo:em.tipo, pratoLabel:em[pk+'_label'], pratoDesc:em[pk+'_desc']}
  }).filter(Boolean)
  const filtered = enriched.filter(c=>(!fDate||c.data===fDate)&&(!fMeal||c.tipo===fMeal))
  const stats = { total:filtered.length, a:filtered.filter(c=>c.tipo==='A').length, j:filtered.filter(c=>c.tipo==='J').length }
  const iS = { padding:'7px 10px', borderRadius:6, border:`1px solid ${C.border}`, fontSize:12, background:C.surface3, color:C.text }
  const thS = { padding:'8px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:C.textMuted, textTransform:'uppercase' }
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[{l:'Total',v:stats.total},{l:'Almoços',v:stats.a},{l:'Jantares',v:stats.j}].map(s=>(
          <div key={s.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:14, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:700, color:C.yellow }}>{s.v}</div>
            <div style={{ fontSize:11, color:C.textSub, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={iS}/>
        <select value={fMeal} onChange={e=>setFMeal(e.target.value)} style={iS}>
          <option value="">Todas as refeições</option><option value="A">Almoço</option><option value="J">Jantar</option>
        </select>
        <button onClick={()=>{setFDate('');setFMeal('')}} style={{ padding:'7px 10px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.textSub }}>Limpar</button>
      </div>
      <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, overflow:'hidden' }}>
        {filtered.length===0 ? (
          <div style={{ padding:36, textAlign:'center', color:C.textMuted, fontSize:13 }}>
            {consumos.length===0?'Sem consumos registados. Experimenta o Terminal de Validações.':'Sem registos para o filtro aplicado.'}
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:C.surface2 }}>{['Funcionário','Data','Refeição','Prato','Hora'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
            <tbody>{[...filtered].sort((a,b)=>new Date(b.validado_em)-new Date(a.validado_em)).map(c => {
              const ps=pratoStyle(c.pratoLabel)
              return (
                <tr key={c.id} style={{ borderTop:`1px solid ${C.border}` }}>
                  <td style={{ padding:'8px 12px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar nome={c.nome} foto={c.foto} size={24}/><div><div style={{ fontSize:12, fontWeight:500, color:C.text }}>{c.nome}</div><div style={{ fontSize:9, color:C.textMuted }}>{c.numero}</div></div></div></td>
                  <td style={{ padding:'8px 12px', fontSize:11, color:C.textSub }}>{fmtS(c.data)}</td>
                  <td style={{ padding:'8px 12px', fontSize:12, color:C.textSub }}>{c.tipo==='A'?'🌞 Almoço':'🌙 Jantar'}</td>
                  <td style={{ padding:'8px 12px' }}><PratoTag label={c.pratoLabel}/></td>
                  <td style={{ padding:'8px 12px', fontSize:11, color:C.textMuted }}>{fmtHM(c.validado_em)}</td>
                </tr>
              )
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [mode,         setMode]         = useState(getInitialMode)
  const [funcionarios, setFuncionarios] = useState(SEED_FUNC)
  const [ementas,      setEmentas]      = useState(SEED_EMENTAS)
  const [marcacoes,    setMarcacoes]    = useState([])
  const [consumos,     setConsumos]     = useState([])
  const shared = { funcionarios, ementas, marcacoes, consumos }
  if (mode==='selector')   return <ModeSelector onSelect={setMode} />
  if (mode==='marcacoes')  return <TerminalMarcacoes  {...shared} setMarcacoes={setMarcacoes}      onBack={()=>setMode('selector')} />
  if (mode==='validacoes') return <TerminalValidacoes {...shared} setConsumos={setConsumos}         onBack={()=>setMode('selector')} />
  if (mode==='backoffice') return <Backoffice         {...shared} setFuncionarios={setFuncionarios} setEmentas={setEmentas} onBack={()=>setMode('selector')} />
}
