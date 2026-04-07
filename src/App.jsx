import { useState, useEffect, useRef } from 'react'

// ─── Supabase (descomenta quando tiveres o projeto criado) ────────────────────
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient('https://SEU_URL.supabase.co', 'SUA_ANON_KEY')

// ─── Cores GI ─────────────────────────────────────────────────────────────────
const C = {
  dark:    '#333F48',
  yellow:  '#e0cb4b',
  gray:    '#8d9190',
  light:   '#f5f4ef',
  white:   '#ffffff',
  success: '#1e8449',
  danger:  '#c0392b',
}

// ─── Palheta de pratos ────────────────────────────────────────────────────────
const PRATO_PALETTE = {
  'Carne':       { bg: '#FADBD8', color: '#7B241C' },
  'Peixe':       { bg: '#D6EAF8', color: '#1A5276' },
  'Dieta':       { bg: '#D5F5E3', color: '#1D6A39' },
  'Vegetariano': { bg: '#FEF9E7', color: '#7D6608' },
}
const pratoStyle = (label) => PRATO_PALETTE[label] || { bg: '#eee', color: '#333' }

// ─── Utilitários de data ──────────────────────────────────────────────────────
const d2s = (d) => {
  const x = d instanceof Date ? d : new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
const addD = (s, n) => {
  const d = new Date(s + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d2s(d)
}
const TODAY = d2s(new Date())

const WD      = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WD_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const MN      = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const fmtS  = (s) => { const d = new Date(s + 'T12:00:00'); return `${WD[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}` }
const fmtF  = (s) => { const d = new Date(s + 'T12:00:00'); return `${WD_FULL[d.getDay()]}, ${d.getDate()} de ${MN[d.getMonth()]}` }
const fmtHM = (iso) => iso ? new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''
const mealNow = () => new Date().getHours() < 15 ? 'A' : 'J'

// Lê o modo a partir do URL param ?mode=marcacoes / validacoes / backoffice
const getInitialMode = () => {
  try {
    const p = new URLSearchParams(window.location.search)
    const m = p.get('mode')
    if (['marcacoes', 'validacoes', 'backoffice'].includes(m)) return m
  } catch (_) {}
  return 'selector'
}

// ─── IDs únicos em memória ────────────────────────────────────────────────────
let _id = 300
const uid = () => ++_id

// ─── Dados de exemplo (substitui por Supabase em produção) ───────────────────
const SEED_FUNC = [
  { id: 1, numero: '001', nome: 'Ana Silva',       pin: '1234', rfid: 'CARD001', foto: null, ativo: true },
  { id: 2, numero: '002', nome: 'Bruno Costa',     pin: '5678', rfid: 'CARD002', foto: null, ativo: true },
  { id: 3, numero: '003', nome: 'Carla Mendes',    pin: '9012', rfid: 'CARD003', foto: null, ativo: true },
  { id: 4, numero: '004', nome: 'David Santos',    pin: '3456', rfid: 'CARD004', foto: null, ativo: true },
  { id: 5, numero: '005', nome: 'Eva Rodrigues',   pin: '7890', rfid: 'CARD005', foto: null, ativo: true },
]

const mkE = (id, day, tipo, p1l='', p1d='', p2l='', p2d='', p3l='', p3d='', p4l='', p4d='') => ({
  id, data: addD(TODAY, day), tipo,
  prato1_label: p1l, prato1_desc: p1d,
  prato2_label: p2l, prato2_desc: p2d,
  prato3_label: p3l, prato3_desc: p3d,
  prato4_label: p4l, prato4_desc: p4d,
})

const SEED_EMENTAS = [
  mkE(1,  0, 'A', 'Carne', 'Frango assado c/ batatas',  'Peixe', 'Bacalhau à Brás',     'Dieta', 'Frango grelhado',    'Vegetariano', 'Risoto de cogumelos'),
  mkE(2,  0, 'J', 'Carne', 'Vitela estufada',           'Peixe', 'Filetes de pescada',  'Dieta', 'Sopa + fruta',       'Vegetariano', 'Lasanha de legumes'),
  mkE(3,  1, 'A', 'Carne', 'Bitoque de vaca',           'Peixe', 'Salmão grelhado',     'Dieta', 'Peito c/ vapor',     'Vegetariano', 'Wrap de legumes'),
  mkE(4,  1, 'J', 'Carne', 'Costeletas grelhadas',      'Peixe', 'Carapau assado',      '',      '',                   'Vegetariano', 'Omeleta de legumes'),
  mkE(5,  2, 'A', 'Carne', 'Lombinho de porco',         'Peixe', 'Linguado no forno',   'Dieta', 'Legumes + ovo',      '',            ''),
  mkE(6,  2, 'J', 'Carne', 'Almôndegas',                'Peixe', 'Bacalhau cozido',     'Dieta', 'Salada + frango',    'Vegetariano', 'Strogonoff de cogumelos'),
  mkE(7,  3, 'A', 'Carne', 'Frango no forno',           'Peixe', 'Dourada grelhada',    'Dieta', 'Sopa + frango',      'Vegetariano', 'Quiche de legumes'),
  mkE(8,  4, 'A', 'Carne', 'Secretos de porco',         'Peixe', 'Tamboril guisado',    'Dieta', 'Frango c/ legumes',  'Vegetariano', 'Curry de grão'),
  mkE(9,  5, 'A', 'Carne', 'Rojões à moda do Minho',   'Peixe', 'Polvo à lagareiro',   'Dieta', 'Ovo + legumes',      'Vegetariano', 'Buddha bowl'),
  mkE(10, 5, 'J', 'Carne', 'Entrecosto no forno',      'Peixe', 'Sardinhas grelhadas', 'Dieta', 'Frango + brócolos',  'Vegetariano', 'Tofu salteado'),
]

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTES PARTILHADOS
// ═════════════════════════════════════════════════════════════════════════════

function Avatar({ nome, foto, size = 40 }) {
  const initials = nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  if (foto) return (
    <img src={foto} alt={nome}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: C.yellow, color: C.dark,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function PratoTag({ label }) {
  const { bg, color } = pratoStyle(label)
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: bg, color }}>
      {label}
    </span>
  )
}

function PratoList({ ementa, selected, onSelect, disabled }) {
  const pratos = [1, 2, 3, 4]
    .map(n => ({ n, label: ementa[`prato${n}_label`], desc: ementa[`prato${n}_desc`] }))
    .filter(p => p.label)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {pratos.map(({ n, label, desc }) => {
        const sel = selected === n
        return (
          <button key={n}
            onClick={() => !disabled && onSelect && onSelect(n)}
            disabled={disabled}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: sel ? C.yellow : C.white,
              border: `1.5px solid ${sel ? C.yellow : '#e0e0e0'}`,
              borderRadius: 8,
              cursor: disabled ? 'default' : 'pointer',
              textAlign: 'left', transition: 'all .15s',
            }}>
            <PratoTag label={label} />
            <span style={{ fontSize: 13, flex: 1, color: sel ? C.dark : '#444' }}>{desc}</span>
            {sel && <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>✓</span>}
          </button>
        )
      })}
    </div>
  )
}

function PinPad({ value, onChange, onConfirm, maxLen = 8 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
        <button key={d}
          onClick={() => value.length < maxLen && onChange(value + d)}
          style={{ padding: '14px 0', fontSize: 17, fontWeight: 500, background: C.white, border: '1px solid #e8e8e8', borderRadius: 10 }}>
          {d}
        </button>
      ))}
      <button onClick={() => onChange(value.slice(0, -1))}
        style={{ padding: '14px 0', fontSize: 14, background: C.white, border: '1px solid #e8e8e8', borderRadius: 10, color: C.gray }}>
        ←
      </button>
      <button onClick={() => value.length < maxLen && onChange(value + '0')}
        style={{ padding: '14px 0', fontSize: 17, fontWeight: 500, background: C.white, border: '1px solid #e8e8e8', borderRadius: 10 }}>
        0
      </button>
      <button onClick={onConfirm}
        style={{ padding: '14px 0', fontSize: 14, fontWeight: 700, background: C.yellow, border: 'none', borderRadius: 10, color: C.dark }}>
        OK
      </button>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SELETOR DE MODO
// ═════════════════════════════════════════════════════════════════════════════

function ModeSelector({ onSelect }) {
  const modes = [
    { key: 'marcacoes',  icon: '🗓️', label: 'Terminal de Marcações',  desc: 'Funcionários marcam as suas refeições' },
    { key: 'validacoes', icon: '✔️', label: 'Terminal de Validações', desc: 'Leitura de cartão RFID / PIN na cozinha' },
    { key: 'backoffice', icon: '⚙️', label: 'Backoffice',             desc: 'Ementas, funcionários e relatórios' },
  ]
  return (
    <div style={{
      minHeight: '100vh', background: C.dark,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.yellow, letterSpacing: 3 }}>GI</div>
        <div style={{ color: '#8899aa', fontSize: 13, marginTop: 4, letterSpacing: 1 }}>Gestão de Cantina</div>
      </div>
      {modes.map(m => (
        <button key={m.key} onClick={() => onSelect(m.key)}
          style={{
            width: 300, padding: '18px 22px',
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.yellow}40`,
            borderRadius: 14, color: C.white, textAlign: 'left',
          }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.yellow }}>{m.label}</div>
          <div style={{ fontSize: 12, color: '#778899', marginTop: 2 }}>{m.desc}</div>
        </button>
      ))}
      <div style={{ marginTop: 16, fontSize: 11, color: '#445566', textAlign: 'center', maxWidth: 270, lineHeight: 1.6 }}>
        Cada computador pode abrir diretamente num modo via URL:<br />
        <code style={{ color: '#667788' }}>?mode=marcacoes</code> &nbsp;
        <code style={{ color: '#667788' }}>?mode=validacoes</code> &nbsp;
        <code style={{ color: '#667788' }}>?mode=backoffice</code>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TERMINAL DE MARCAÇÕES
// ═════════════════════════════════════════════════════════════════════════════

function TerminalMarcacoes({ funcionarios, ementas, marcacoes, setMarcacoes, onBack }) {
  const [step, setStep]     = useState('identify')
  const [func, setFunc]     = useState(null)
  const [pin, setPin]       = useState('')
  const [err, setErr]       = useState('')
  const [selDay, setSelDay] = useState(TODAY)

  // Captura de RFID: leitores HID enviam o UID como teclado (rápido) + Enter
  // Este ref acumula o buffer de teclas rápidas para distinguir RFID de PIN manual
  const rfidRef   = useRef('')
  const rfidTimer = useRef(null)

  useEffect(() => {
    if (step !== 'identify') return
    const handler = (e) => {
      if (e.key === 'Enter') {
        if (rfidRef.current) { identify(rfidRef.current); rfidRef.current = '' }
        return
      }
      if (e.key.length !== 1) return
      rfidRef.current += e.key
      clearTimeout(rfidTimer.current)
      // Se não chegar mais nenhuma tecla em 200ms, limpa (evita lixo de teclado manual)
      rfidTimer.current = setTimeout(() => { rfidRef.current = '' }, 200)
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(rfidTimer.current) }
  }, [step, funcionarios])

  const identify = (val) => {
    const v = val.trim()
    const f = funcionarios.find(f => f.pin === v || f.rfid === v)
    if (f && f.ativo) { setFunc(f); setStep('dashboard'); setPin(''); setErr('') }
    else { setErr('PIN ou cartão não reconhecido'); setPin(''); setTimeout(() => setErr(''), 3000) }
  }

  const logout = () => { setStep('identify'); setFunc(null); setPin(''); setErr(''); setSelDay(TODAY) }

  const days = [...new Set(ementas.map(e => e.data))].sort().filter(d => d >= TODAY).slice(0, 14)

  const getMarcacao = (eid) => marcacoes.find(m => m.funcionario_id === func?.id && m.ementa_id === eid)

  const marcar = (ementa, n) => {
    const ex = getMarcacao(ementa.id)
    if (ex) setMarcacoes(p => p.map(m => m.id === ex.id ? { ...m, prato_num: n } : m))
    else setMarcacoes(p => [...p, { id: uid(), funcionario_id: func.id, ementa_id: ementa.id, prato_num: n, created_at: new Date().toISOString() }])
  }

  const cancelar = (eid) => setMarcacoes(p => p.filter(m => !(m.funcionario_id === func.id && m.ementa_id === eid)))

  // ── Ecrã de identificação ──────────────────────────────────────────────────
  if (step === 'identify') return (
    <div style={{ minHeight: '100vh', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <button onClick={onBack}
        style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', color: C.gray, fontSize: 13 }}>
        ← Voltar
      </button>
      <div style={{ background: C.white, borderRadius: 20, padding: '30px 34px', width: 310, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.dark }}>GI</div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>Terminal de Marcações</div>
        </div>
        <div style={{ background: C.light, borderRadius: 10, padding: 12, textAlign: 'center', marginBottom: 10, minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pin
            ? <span style={{ fontSize: 26, letterSpacing: 10 }}>{'•'.repeat(pin.length)}</span>
            : <span style={{ color: '#bbb', fontSize: 13 }}>PIN ou RFID</span>}
        </div>
        {err && (
          <div style={{ background: '#FADBD8', color: '#7B241C', borderRadius: 8, padding: '7px 12px', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
            {err}
          </div>
        )}
        <PinPad value={pin} onChange={setPin} onConfirm={() => identify(pin)} />
        <div style={{ textAlign: 'center', fontSize: 10, color: '#ccc', marginTop: 8 }}>
          Ou passe o cartão RFID no leitor
        </div>
      </div>
    </div>
  )

  // ── Dashboard de marcações ─────────────────────────────────────────────────
  const dayEm = ementas.filter(e => e.data === selDay)

  return (
    <div style={{ minHeight: '100vh', background: C.light, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.yellow }}>GI</span>
          <span style={{ color: '#778899', fontSize: 12 }}>Marcações</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar nome={func.nome} foto={func.foto} size={28} />
          <span style={{ color: C.white, fontSize: 13 }}>{func.nome}</span>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#889', fontSize: 12, marginLeft: 4 }}>Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Lista de dias */}
        <div style={{ width: 155, background: C.white, borderRight: '1px solid #ebebeb', overflowY: 'auto' }}>
          {days.map(d => {
            const dd = new Date(d + 'T12:00:00'), isT = d === TODAY
            const mc = ementas.filter(e => e.data === d && getMarcacao(e.id)).length
            return (
              <button key={d} onClick={() => setSelDay(d)}
                style={{
                  width: '100%', padding: '11px 14px', textAlign: 'left',
                  background: selDay === d ? C.yellow + '18' : 'transparent',
                  border: 'none',
                  borderLeft: selDay === d ? `3px solid ${C.yellow}` : '3px solid transparent',
                  marginBottom: 1,
                }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isT ? C.yellow : C.dark }}>{isT ? 'HOJE' : WD[dd.getDay()].toUpperCase()}</div>
                <div style={{ fontSize: 9, color: C.gray }}>{dd.getDate()} {MN[dd.getMonth()]}</div>
                {mc > 0 && <div style={{ fontSize: 9, color: C.success, marginTop: 1 }}>✓ {mc} marcado{mc > 1 ? 's' : ''}</div>}
              </button>
            )
          })}
        </div>

        {/* Detalhe do dia */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.dark }}>{fmtF(selDay)}</div>
            {selDay === TODAY && <span style={{ background: C.yellow, color: C.dark, fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>HOJE</span>}
          </div>

          {['A', 'J'].map(tipo => {
            const em = dayEm.find(e => e.tipo === tipo)
            if (!em) return null
            const marc = getMarcacao(em.id)
            return (
              <div key={tipo} style={{
                background: C.white, borderRadius: 12, padding: 16, marginBottom: 12,
                border: `1.5px solid ${marc ? C.yellow + '80' : '#ebebeb'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>
                    {tipo === 'A' ? '🌞 Almoço' : '🌙 Jantar'}
                  </span>
                  {marc && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>✓ Marcado</span>
                      <button onClick={() => cancelar(em.id)}
                        style={{ background: 'none', border: 'none', color: '#bbb', fontSize: 11 }}>
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                <PratoList ementa={em} selected={marc?.prato_num} onSelect={n => marcar(em, n)} />
              </div>
            )
          })}

          {dayEm.length === 0 && (
            <div style={{ textAlign: 'center', color: '#bbb', fontSize: 13, marginTop: 40 }}>
              Sem ementa disponível para este dia
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TERMINAL DE VALIDAÇÕES
// ═════════════════════════════════════════════════════════════════════════════

function TerminalValidacoes({ funcionarios, ementas, marcacoes, consumos, setConsumos, onBack }) {
  const [pinInput, setPinInput] = useState('')
  const [status,   setStatus]   = useState(null)
  const [recentes, setRecentes] = useState([])
  const meal    = mealNow()
  const rfidRef   = useRef('')
  const rfidTimer = useRef(null)

  // Captura RFID por teclado HID (mesma lógica do terminal de marcações)
  useEffect(() => {
    if (status?.type === 'no-marc') return
    const handler = (e) => {
      if (e.key === 'Enter') {
        if (rfidRef.current) { process(rfidRef.current); rfidRef.current = '' }
        return
      }
      if (e.key.length !== 1) return
      rfidRef.current += e.key
      clearTimeout(rfidTimer.current)
      rfidTimer.current = setTimeout(() => { rfidRef.current = '' }, 200)
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(rfidTimer.current) }
  }, [status, funcionarios, ementas, marcacoes, consumos])

  const reset = () => { setPinInput(''); setStatus(null) }

  const confirmarConsumo = (func, ementa, pratoNum) => {
    const pk = `prato${pratoNum}`
    const pratoLabel = ementa[pk + '_label']
    const pratoDesc  = ementa[pk + '_desc']
    const c = { id: uid(), funcionario_id: func.id, ementa_id: ementa.id, prato_num: pratoNum, validado_em: new Date().toISOString() }
    setConsumos(p => [...p, c])
    setRecentes(p => [{ ...c, nome: func.nome, foto: func.foto, pratoLabel, pratoDesc }, ...p].slice(0, 5))
    setStatus({ type: 'ok', func, pratoLabel, pratoDesc })
    setTimeout(reset, 5000)
  }

  const process = (val) => {
    const v = val.trim()
    if (!v) return
    setPinInput('')

    const func = funcionarios.find(f => f.pin === v || f.rfid === v)
    if (!func) { setStatus({ type: 'error', msg: 'Funcionário não encontrado' }); setTimeout(reset, 3000); return }

    const ementa = ementas.find(e => e.data === TODAY && e.tipo === meal)
    if (!ementa) { setStatus({ type: 'error', msg: 'Sem ementa para este momento' }); setTimeout(reset, 3000); return }

    const ex = consumos.find(c => c.funcionario_id === func.id && c.ementa_id === ementa.id)
    if (ex) {
      const pk = `prato${ex.prato_num}`
      setStatus({ type: 'dup', func, pratoLabel: ementa[pk + '_label'], pratoDesc: ementa[pk + '_desc'] })
      setTimeout(reset, 6000)
      return
    }

    const marc = marcacoes.find(m => m.funcionario_id === func.id && m.ementa_id === ementa.id)
    if (!marc) { setStatus({ type: 'no-marc', func, ementa }); return }

    confirmarConsumo(func, ementa, marc.prato_num)
  }

  const renderMain = () => {
    if (!status) return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, opacity: .2, marginBottom: 18 }}>📲</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 6 }}>
          {meal === 'A' ? '🌞 Almoço' : '🌙 Jantar'}
        </div>
        <div style={{ fontSize: 13, color: C.gray }}>Aproxime o cartão ou introduza o PIN</div>
        {pinInput && <div style={{ marginTop: 16, fontSize: 24, letterSpacing: 10, color: C.dark }}>{'•'.repeat(pinInput.length)}</div>}
      </div>
    )

    if (status.type === 'error') return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.danger }}>{status.msg}</div>
      </div>
    )

    if (status.type === 'ok') return (
      <div style={{ textAlign: 'center' }}>
        <Avatar nome={status.func.nome} foto={status.func.foto} size={72} />
        <div style={{ fontSize: 20, fontWeight: 700, color: C.dark, marginTop: 12 }}>{status.func.nome}</div>
        <div style={{ background: '#D5F5E3', border: '1px solid #1E8449', borderRadius: 10, padding: '10px 20px', marginTop: 14, display: 'inline-block' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.success }}>✓ CONSUMO REGISTADO</div>
        </div>
        <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 10, background: pratoStyle(status.pratoLabel).bg, borderRadius: 10, padding: '10px 18px' }}>
          <PratoTag label={status.pratoLabel} />
          <span style={{ fontSize: 14, color: '#444' }}>{status.pratoDesc}</span>
        </div>
      </div>
    )

    if (status.type === 'dup') return (
      <div style={{ textAlign: 'center' }}>
        <Avatar nome={status.func.nome} foto={status.func.foto} size={72} />
        <div style={{ fontSize: 20, fontWeight: 700, color: C.dark, marginTop: 12 }}>{status.func.nome}</div>
        <div style={{ background: '#FEF9C3', border: '1px solid #D4AC0D', borderRadius: 10, padding: '10px 20px', marginTop: 14, display: 'inline-block' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7D6608' }}>⚠️ JÁ CONSUMIU ESTA REFEIÇÃO</div>
        </div>
        <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 10, background: pratoStyle(status.pratoLabel).bg, borderRadius: 10, padding: '10px 18px' }}>
          <PratoTag label={status.pratoLabel} />
          <span style={{ fontSize: 14, color: '#444' }}>{status.pratoDesc}</span>
        </div>
      </div>
    )

    if (status.type === 'no-marc') return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Avatar nome={status.func.nome} foto={status.func.foto} size={50} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.dark }}>{status.func.nome}</div>
            <div style={{ fontSize: 11, color: C.gray }}>Sem marcação prévia</div>
          </div>
        </div>
        <div style={{ background: '#FEF9C3', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: '#7D6608', fontWeight: 600 }}>
          ⚠️ Selecione o prato a servir:
        </div>
        <PratoList ementa={status.ementa} onSelect={n => confirmarConsumo(status.func, status.ementa, n)} />
        <button onClick={reset}
          style={{ marginTop: 8, width: '100%', padding: 7, background: '#eee', border: 'none', borderRadius: 8, fontSize: 12, color: C.gray }}>
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.light, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.yellow }}>GI</span>
          <span style={{ color: '#778899', fontSize: 12 }}>Validações · {meal === 'A' ? 'Almoço' : 'Jantar'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#778899' }}>{new Date().toLocaleDateString('pt-PT')}</span>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#778899', fontSize: 12 }}>← Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Área principal */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{
            background: C.white, borderRadius: 20, width: '100%', maxWidth: 420, minHeight: 280,
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28,
          }}>
            {renderMain()}
          </div>
        </div>

        {/* Sidebar — últimas validações */}
        <div style={{ width: 220, background: C.white, borderLeft: '1px solid #ebebeb', padding: 14, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Últimas 5 validações
          </div>
          {recentes.length === 0
            ? <div style={{ fontSize: 12, color: '#ccc', textAlign: 'center', marginTop: 24 }}>Sem validações</div>
            : recentes.map(r => (
              <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #f5f5f5' }}>
                <Avatar nome={r.nome} foto={r.foto} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nome}</div>
                  <div style={{ marginTop: 3 }}><PratoTag label={r.pratoLabel} /></div>
                  <div style={{ fontSize: 10, color: '#ccc', marginTop: 2 }}>{fmtHM(r.validado_em)}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* PIN pad — rodapé */}
      {!status && (
        <div style={{ background: C.white, borderTop: '1px solid #ebebeb', padding: '10px 20px', display: 'flex', justifyContent: 'center', gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, '✓'].map((k, i) => (
            <button key={i}
              onClick={() => {
                if (k === '←') setPinInput(p => p.slice(0, -1))
                else if (k === '✓') process(pinInput)
                else if (pinInput.length < 8) setPinInput(p => p + k)
              }}
              style={{
                width: 42, height: 42, borderRadius: 8,
                border: '1px solid #e0e0e0',
                background: k === '✓' ? C.yellow : '#fafafa',
                fontSize: k === '✓' ? 16 : 13,
                fontWeight: k === '✓' ? 700 : 400,
                color: k === '✓' ? C.dark : '#333',
              }}>
              {k}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// BACKOFFICE
// ═════════════════════════════════════════════════════════════════════════════

function Backoffice({ funcionarios, setFuncionarios, ementas, setEmentas, marcacoes, consumos, onBack }) {
  const [sec, setSec] = useState('ementas')
  const nav = [
    { key: 'ementas',  icon: '📅', label: 'Ementas' },
    { key: 'funcs',    icon: '👥', label: 'Funcionários' },
    { key: 'consumos', icon: '📊', label: 'Consumos' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar GI */}
      <div style={{ width: 60, background: C.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, flexShrink: 0 }}>
        <div style={{ color: C.yellow, fontWeight: 800, fontSize: 15, marginBottom: 18, letterSpacing: 1 }}>GI</div>
        {nav.map(n => (
          <button key={n.key} title={n.label} onClick={() => setSec(n.key)}
            style={{
              width: 38, height: 38, borderRadius: 8, margin: '3px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: sec === n.key ? `${C.yellow}22` : 'transparent',
              border: `1px solid ${sec === n.key ? C.yellow + '55' : 'transparent'}`,
              fontSize: 17, transition: 'all .15s',
            }}>
            {n.icon}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button title="Sair" onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 8, margin: '0 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', fontSize: 15, color: C.gray }}>
          ↩
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.light, overflow: 'hidden' }}>
        <div style={{ background: C.white, borderBottom: '1px solid #ebebeb', padding: '0 22px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.dark }}>{nav.find(n => n.key === sec)?.label}</div>
          <div style={{ fontSize: 11, color: C.gray }}>Gestão de Cantina · GI</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {sec === 'ementas'  && <SecEmentas ementas={ementas} setEmentas={setEmentas} />}
          {sec === 'funcs'    && <SecFuncionarios funcionarios={funcionarios} setFuncionarios={setFuncionarios} />}
          {sec === 'consumos' && <SecConsumos consumos={consumos} funcionarios={funcionarios} ementas={ementas} />}
        </div>
      </div>
    </div>
  )
}

// ── Sec: Ementas ──────────────────────────────────────────────────────────────

function SecEmentas({ ementas, setEmentas }) {
  const [selD,    setSelD]    = useState(TODAY)
  const [editing, setEditing] = useState(null)

  const dates = Array.from({ length: 14 }, (_, i) => addD(TODAY, i))
  const dayEm = ementas.filter(e => e.data === selD)

  const add = (tipo) => {
    const e = { id: uid(), data: selD, tipo, prato1_label: 'Carne', prato1_desc: '', prato2_label: 'Peixe', prato2_desc: '', prato3_label: 'Dieta', prato3_desc: '', prato4_label: 'Vegetariano', prato4_desc: '' }
    setEmentas(p => [...p, e])
    setEditing({ ...e })
  }

  const save = (e) => { setEmentas(p => p.map(x => x.id === e.id ? e : x)); setEditing(null) }
  const del  = (id) => { if (window.confirm('Eliminar ementa?')) setEmentas(p => p.filter(e => e.id !== id)) }

  if (editing) return <EmentaEditor ementa={editing} onSave={save} onCancel={() => setEditing(null)} />

  return (
    <div style={{ display: 'flex', gap: 18 }}>
      {/* Calendário lateral */}
      <div style={{ width: 148, flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 12 }}>
          Próximos 14 dias
        </div>
        {dates.map(d => {
          const dd = new Date(d + 'T12:00:00'), isT = d === TODAY
          const hasEm = ementas.some(e => e.data === d)
          return (
            <button key={d} onClick={() => setSelD(d)}
              style={{
                width: '100%', padding: '8px 12px', textAlign: 'left',
                background: selD === d ? C.yellow + '15' : C.white,
                border: 'none',
                borderLeft: selD === d ? `3px solid ${C.yellow}` : '3px solid transparent',
                marginBottom: 1, borderRadius: '0 6px 6px 0',
              }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: isT ? C.yellow : C.dark }}>{isT ? 'HOJE' : WD[dd.getDay()].toUpperCase()}</div>
              <div style={{ fontSize: 9, color: C.gray }}>{dd.getDate()} {MN[dd.getMonth()]}</div>
              {hasEm && <div style={{ fontSize: 8, color: C.success, marginTop: 1 }}>● ementa</div>}
            </button>
          )
        })}
      </div>

      {/* Detalhe do dia */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          {fmtF(selD)}
          {selD === TODAY && <span style={{ background: C.yellow, color: C.dark, fontSize: 9, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>HOJE</span>}
        </div>

        {['A', 'J'].map(tipo => {
          const em = dayEm.find(e => e.tipo === tipo)
          return (
            <div key={tipo} style={{ background: C.white, borderRadius: 10, padding: 14, marginBottom: 10, border: '1px solid #ebebeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: em ? 10 : 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{tipo === 'A' ? '🌞 Almoço' : '🌙 Jantar'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {em ? (
                    <>
                      <button onClick={() => setEditing({ ...em })}
                        style={{ fontSize: 11, padding: '4px 10px', background: C.yellow, border: 'none', borderRadius: 6, fontWeight: 600, color: C.dark }}>
                        Editar
                      </button>
                      <button onClick={() => del(em.id)}
                        style={{ fontSize: 11, padding: '4px 10px', background: '#FADBD8', border: 'none', borderRadius: 6, color: '#7B241C' }}>
                        Remover
                      </button>
                    </>
                  ) : (
                    <button onClick={() => add(tipo)}
                      style={{ fontSize: 11, padding: '4px 12px', background: C.dark, border: 'none', borderRadius: 6, color: C.white }}>
                      + Adicionar ementa
                    </button>
                  )}
                </div>
              </div>
              {em && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  {[1, 2, 3, 4].map(n => {
                    const l = em[`prato${n}_label`], d = em[`prato${n}_desc`]
                    if (!l) return (
                      <div key={n} style={{ background: '#f8f8f8', borderRadius: 6, padding: '7px 10px', border: '1px dashed #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 10, color: '#ccc' }}>Slot {n} vazio</span>
                      </div>
                    )
                    const { bg, color } = pratoStyle(l)
                    return (
                      <div key={n} style={{ background: bg, borderRadius: 6, padding: '7px 10px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color }}>{l}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{d || <span style={{ color: '#aaa', fontStyle: 'italic' }}>sem descrição</span>}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmentaEditor({ ementa, onSave, onCancel }) {
  const [f, setF] = useState({ ...ementa })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  return (
    <div style={{ background: C.white, borderRadius: 12, padding: 22, maxWidth: 560, border: '1px solid #ebebeb' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 18 }}>
        {f.tipo === 'A' ? '🌞 Almoço' : '🌙 Jantar'} · {fmtF(f.data)}
      </div>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{ marginBottom: 12, padding: 12, background: C.light, borderRadius: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.gray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
            Prato {n} — deixa o tipo em branco para ocultar este slot
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={f[`prato${n}_label`]} onChange={e => set(`prato${n}_label`, e.target.value)}
              placeholder="Tipo (ex: Carne)"
              style={{ width: 130, flexShrink: 0, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
            <input value={f[`prato${n}_desc`]} onChange={e => set(`prato${n}_desc`, e.target.value)}
              placeholder="Descrição do prato"
              style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
        <button onClick={onCancel} style={{ padding: '7px 14px', background: '#eee', border: 'none', borderRadius: 8, fontSize: 13 }}>Cancelar</button>
        <button onClick={() => onSave(f)} style={{ padding: '7px 18px', background: C.yellow, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: C.dark }}>Guardar</button>
      </div>
    </div>
  )
}

// ── Sec: Funcionários ─────────────────────────────────────────────────────────

function SecFuncionarios({ funcionarios, setFuncionarios }) {
  const [editing, setEditing] = useState(null)
  const blank = { id: null, numero: '', nome: '', pin: '', rfid: '', foto: null, ativo: true }

  const save = (form) => {
    form.id
      ? setFuncionarios(p => p.map(f => f.id === form.id ? form : f))
      : setFuncionarios(p => [...p, { ...form, id: uid() }])
    setEditing(null)
  }
  const del = (id) => { if (window.confirm('Eliminar funcionário?')) setFuncionarios(p => p.filter(f => f.id !== id)) }

  if (editing !== null) return <FuncionarioEditor form={editing} onSave={save} onCancel={() => setEditing(null)} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.gray }}>{funcionarios.length} funcionário(s)</div>
        <button onClick={() => setEditing(blank)}
          style={{ padding: '6px 14px', background: C.dark, border: 'none', borderRadius: 8, color: C.white, fontSize: 12 }}>
          + Novo
        </button>
      </div>
      <div style={{ background: C.white, borderRadius: 10, border: '1px solid #ebebeb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f8f8' }}>
              {['Nº', 'Funcionário', 'PIN', 'RFID', 'Estado', ''].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(f => (
              <tr key={f.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                <td style={{ padding: '9px 12px', fontSize: 11, color: C.gray }}>{f.numero}</td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar nome={f.nome} foto={f.foto} size={26} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.dark }}>{f.nome}</span>
                  </div>
                </td>
                <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, color: C.gray }}>{'•'.repeat(f.pin.length)}</td>
                <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 11, color: C.gray }}>{f.rfid}</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: f.ativo ? '#D5F5E3' : '#eee', color: f.ativo ? C.success : C.gray, fontWeight: 700 }}>
                    {f.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => setEditing({ ...f })}
                      style={{ fontSize: 11, padding: '3px 9px', background: C.yellow, border: 'none', borderRadius: 6, fontWeight: 600, color: C.dark }}>
                      Editar
                    </button>
                    <button onClick={() => del(f.id)}
                      style={{ fontSize: 11, padding: '3px 9px', background: '#FADBD8', border: 'none', borderRadius: 6, color: '#7B241C' }}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FuncionarioEditor({ form: init, onSave, onCancel }) {
  const [f, setF] = useState({ ...init })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const handleFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = ev => set('foto', ev.target.result)
    r.readAsDataURL(file)
  }

  return (
    <div style={{ background: C.white, borderRadius: 12, padding: 22, maxWidth: 440, border: '1px solid #ebebeb' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 18 }}>
        {f.id ? 'Editar Funcionário' : 'Novo Funcionário'}
      </div>

      <div style={{ display: 'flex', gap: 18, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Avatar nome={f.nome || '?'} foto={f.foto} size={54} />
          <label style={{ display: 'block', marginTop: 5, fontSize: 11, color: C.yellow, fontWeight: 600, cursor: 'pointer' }}>
            Foto
            <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ flex: 1 }}>
          {[{ k: 'numero', l: 'Nº funcionário' }, { k: 'nome', l: 'Nome completo' }].map(({ k, l }) => (
            <div key={k} style={{ marginBottom: 9 }}>
              <label style={{ fontSize: 9, fontWeight: 700, color: C.gray, display: 'block', marginBottom: 3, textTransform: 'uppercase' }}>{l}</label>
              <input value={f[k]} onChange={e => set(k, e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[{ k: 'pin', l: 'PIN', t: 'password' }, { k: 'rfid', l: 'RFID UID', t: 'text' }].map(({ k, l, t }) => (
          <div key={k}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.gray, display: 'block', marginBottom: 3, textTransform: 'uppercase' }}>{l}</label>
            <input type={t} value={f[k]} onChange={e => set(k, e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 18 }}>
        <input type="checkbox" checked={f.ativo} onChange={e => set('ativo', e.target.checked)} />
        Funcionário ativo
      </label>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '6px 14px', background: '#eee', border: 'none', borderRadius: 8, fontSize: 13 }}>Cancelar</button>
        <button onClick={() => onSave(f)} style={{ padding: '6px 16px', background: C.yellow, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: C.dark }}>Guardar</button>
      </div>
    </div>
  )
}

// ── Sec: Consumos ─────────────────────────────────────────────────────────────

function SecConsumos({ consumos, funcionarios, ementas }) {
  const [fDate, setFDate] = useState(TODAY)
  const [fMeal, setFMeal] = useState('')

  const enriched = consumos.map(c => {
    const fn = funcionarios.find(f => f.id === c.funcionario_id)
    const em = ementas.find(e => e.id === c.ementa_id)
    if (!fn || !em) return null
    const pk = `prato${c.prato_num}`
    return { ...c, nome: fn.nome, foto: fn.foto, numero: fn.numero, data: em.data, tipo: em.tipo, pratoLabel: em[pk + '_label'], pratoDesc: em[pk + '_desc'] }
  }).filter(Boolean)

  const filtered = enriched.filter(c => (!fDate || c.data === fDate) && (!fMeal || c.tipo === fMeal))
  const stats = { total: filtered.length, a: filtered.filter(c => c.tipo === 'A').length, j: filtered.filter(c => c.tipo === 'J').length }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[{ l: 'Total', v: stats.total }, { l: 'Almoços', v: stats.a }, { l: 'Jantares', v: stats.j }].map(s => (
          <div key={s.l} style={{ background: C.white, borderRadius: 10, padding: 14, border: '1px solid #ebebeb', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.dark }}>{s.v}</div>
            <div style={{ fontSize: 11, color: C.gray }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="date" value={fDate} onChange={e => setFDate(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
        <select value={fMeal} onChange={e => setFMeal(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }}>
          <option value="">Todas as refeições</option>
          <option value="A">Almoço</option>
          <option value="J">Jantar</option>
        </select>
        <button onClick={() => { setFDate(''); setFMeal('') }}
          style={{ padding: '6px 10px', background: '#eee', border: 'none', borderRadius: 6, fontSize: 11, color: C.gray }}>
          Limpar
        </button>
      </div>

      {/* Tabela */}
      <div style={{ background: C.white, borderRadius: 10, border: '1px solid #ebebeb', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: '#bbb', fontSize: 13 }}>
            {consumos.length === 0
              ? 'Sem consumos registados. Experimenta o Terminal de Validações.'
              : 'Sem registos para o filtro aplicado.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f8f8' }}>
                {['Funcionário', 'Data', 'Refeição', 'Prato', 'Hora'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered].sort((a, b) => new Date(b.validado_em) - new Date(a.validado_em)).map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={c.nome} foto={c.foto} size={24} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.dark }}>{c.nome}</div>
                        <div style={{ fontSize: 9, color: C.gray }}>{c.numero}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: C.gray }}>{fmtS(c.data)}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{c.tipo === 'A' ? '🌞 Almoço' : '🌙 Jantar'}</td>
                  <td style={{ padding: '8px 12px' }}><PratoTag label={c.pratoLabel} /></td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: C.gray }}>{fmtHM(c.validado_em)}</td>
                </tr>
              ))}
            </tbody>
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

  if (mode === 'selector')   return <ModeSelector onSelect={setMode} />
  if (mode === 'marcacoes')  return <TerminalMarcacoes  {...shared} setMarcacoes={setMarcacoes}  onBack={() => setMode('selector')} />
  if (mode === 'validacoes') return <TerminalValidacoes {...shared} setConsumos={setConsumos}    onBack={() => setMode('selector')} />
  if (mode === 'backoffice') return <Backoffice         {...shared} setFuncionarios={setFuncionarios} setEmentas={setEmentas} onBack={() => setMode('selector')} />
}
