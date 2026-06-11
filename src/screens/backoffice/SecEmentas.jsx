import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchDiasFechados, setDiaFechado, unsetDiaFechado } from '../../lib/queries'
import { C } from '../../constants/colors'
import { ps } from '../../constants/pratos'
import { WD, MN_FULL, TODAY, addD, d2s } from '../../utils/date'
import EmentaEditor from './EmentaEditor'
import Icon from '../../components/Icon'

function isoWeekNum(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const y = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d - y) / 86400000) + 1) / 7)
}

function getMondayOf(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay()
  d.setDate(d.getDate() + diff)
  return d2s(d)
}

function fmtRange(dates) {
  if (!dates.length) return ''
  const a = new Date(dates[0] + 'T12:00:00')
  const b = new Date(dates[dates.length - 1] + 'T12:00:00')
  if (a.getMonth() === b.getMonth())
    return `${a.getDate()} a ${b.getDate()} de ${MN_FULL[a.getMonth()]}`
  return `${a.getDate()} de ${MN_FULL[a.getMonth()]} a ${b.getDate()} de ${MN_FULL[b.getMonth()]}`
}

function DayHeader({ date, closed, onToggle }) {
  const dd = new Date(date + 'T12:00:00')
  const isToday = date === TODAY
  return (
    <div style={{padding:'8px 14px',display:'flex',alignItems:'baseline',gap:8,position:'relative'}}>
      <span style={{fontSize:46,lineHeight:0.85,color:closed?C.textMuted:C.text,transition:'color 0.15s'}}>{dd.getDate()}</span>
      <span style={{fontSize:12,fontWeight:700,letterSpacing:'0.12em',color:C.textMuted}}>
        {WD[dd.getDay()].slice(0,3).toUpperCase()}
      </span>
      <div style={{position:'absolute',top:0,right:14,display:'flex',alignItems:'center',gap:4}}>
        {isToday && (
          <span style={{fontSize:9,fontWeight:800,letterSpacing:'0.16em',background:C.yellow,color:C.bg,padding:'3px 8px',borderRadius:4}}>
            HOJE
          </span>
        )}
        {closed ? (
          <button onClick={onToggle}
            style={{fontSize:9,fontWeight:800,letterSpacing:'0.10em',background:'rgba(251,146,60,0.15)',color:'#fb923c',border:'1px solid rgba(251,146,60,0.28)',padding:'3px 8px',borderRadius:4,cursor:'pointer'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(251,146,60,0.28)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(251,146,60,0.15)'}>
            ENCERRADO ×
          </button>
        ) : (
          <button onClick={onToggle}
            style={{fontSize:9,fontWeight:700,letterSpacing:'0.08em',background:'transparent',color:C.border,border:'1px solid transparent',padding:'3px 8px',borderRadius:4,cursor:'pointer'}}
            onMouseEnter={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.borderColor=C.border}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.border;e.currentTarget.style.borderColor='transparent'}}>
            Encerrar
          </button>
        )}
      </div>
    </div>
  )
}

function MealLabel({ emoji, label, hour }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{writingMode:'vertical-rl',transform:'rotate(180deg)',textAlign:'center'}}>
        <div style={{fontSize:24}}>{emoji}</div>
        <div style={{fontStyle:'italic',fontSize:24,color:C.text,marginTop:8}}>{label}</div>
        <div style={{fontSize:10,color:C.textMuted,marginTop:6,letterSpacing:'0.12em'}}>{hour}</div>
      </div>
    </div>
  )
}

function ClosedCell() {
  return (
    <div style={{background:'rgba(251,146,60,0.04)',border:'1px dashed rgba(251,146,60,0.18)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',minHeight:0,color:'rgba(251,146,60,0.25)',fontSize:20,userSelect:'none'}}>
      —
    </div>
  )
}

function EmentaCell({ ementa, marcCount, onClick }) {
  const pratos = ementa
    ? [1,2,3,4].map(n => ({label:ementa[`prato${n}_label`],desc:ementa[`prato${n}_desc`]}))
    : []
  const isEmpty = !ementa || pratos.every(p => !p.desc)
  return (
    <button onClick={onClick} style={{
      background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:10,
      display:'flex',flexDirection:'column',gap:6,minHeight:0,position:'relative',
      cursor:'pointer',textAlign:'left',transition:'border-color 0.15s',
    }}
    onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.yellow}55`}
    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
      {marcCount > 0 && (
        <div style={{position:'absolute',top:8,right:10,fontSize:11,fontWeight:700,color:C.success}}>
          {marcCount}
        </div>
      )}
      {isEmpty && (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:C.textMuted,fontSize:13,fontStyle:'italic'}}>
          + Adicionar ementa
        </div>
      )}
      {!isEmpty && pratos.map((p,i) => {
        if (!p.label) return null
        const {bg,border:bd,color:fg} = ps(p.label)
        return (
          <div key={i} style={{
            display:'flex',alignItems:'center',gap:8,padding:'7px 9px',borderRadius:8,
            background:p.desc?bg:'transparent',
            border:`1px solid ${p.desc?bd:C.border}`,
            opacity:p.desc?1:0.55
          }}>
            <span style={{fontSize:9.5,fontWeight:700,letterSpacing:'0.06em',padding:'2px 7px',borderRadius:4,
              background:bg,color:fg,border:`1px solid ${bd}`,minWidth:36,textAlign:'center',flexShrink:0}}>
              {p.label==='Vegetariano'?'Veg':p.label.slice(0,3)}
            </span>
            <div style={{flex:1,fontSize:11.5,color:p.desc?C.text:C.textMuted,fontStyle:p.desc?'normal':'italic',
              lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
              {p.desc||'+'}
            </div>
          </div>
        )
      })}
    </button>
  )
}

export default function SecEmentas({ementas,reload,marcacoesAll=[],settings}) {
  const [weekOffset,setWeekOffset] = useState(0)
  const [editingCell,setEditingCell] = useState(null)
  const [saving,setSaving] = useState(false)
  const [diasFechados,setDiasFechados] = useState([])
  const [delStatus,setDelStatus] = useState(null)

  useEffect(() => { fetchDiasFechados().then(setDiasFechados) }, [])

  const toggleDia = async date => {
    const isClosed = diasFechados.includes(date)
    setDiasFechados(p => isClosed ? p.filter(d=>d!==date) : [...p,date])
    const {error} = isClosed ? await unsetDiaFechado(date) : await setDiaFechado(date)
    if (error) {
      setDiasFechados(p => isClosed ? [...p,date] : p.filter(d=>d!==date))
      console.error('toggleDia:', error)
    }
  }

  const servir_fds = settings?.servir_fds === 'true'
  const daysPerWeek = servir_fds ? 7 : 5
  const weekStart = getMondayOf(TODAY)
  const weekDates = Array.from({length:daysPerWeek}, (_,i) => addD(weekStart, weekOffset*7 + i))
  const weekNum = isoWeekNum(weekDates[0])

  const weekEmentas = ementas.filter(e => weekDates.includes(e.data))
  const filledCount = weekEmentas.reduce((acc,e) =>
    acc + [1,2,3,4].filter(n => e[`prato${n}_desc`]).length, 0)
  const closedThisWeek = weekDates.filter(d => diasFechados.includes(d))
  const totalSlots = (daysPerWeek - closedThisWeek.length) * 2 * 4
  const totalMarcs = marcacoesAll.filter(m => weekDates.includes(m.data)).length

  const newEmenta = (data,tipo) => ({
    id:null,data,tipo,
    prato1_label:'Carne',prato1_desc:'',
    prato2_label:'Peixe',prato2_desc:'',
    prato3_label:'Dieta',prato3_desc:'',
    prato4_label:'Vegetariano',prato4_desc:''
  })

  const save = async em => {
    setSaving(true)
    const {id,foto,...row} = em
    if (em.id) await supabase.from('cantina_ementas').update(row).eq('id',em.id)
    else await supabase.from('cantina_ementas').insert(row)
    await reload()
    setSaving(false)
    setEditingCell(null)
  }

  const checkDel = async id => {
    const [{count:nCons},{count:nMarcs}] = await Promise.all([
      supabase.from('cantina_consumos').select('*',{count:'exact',head:true}).eq('ementa_id',id),
      supabase.from('cantina_marcacoes').select('*',{count:'exact',head:true}).eq('ementa_id',id),
    ])
    if (nCons > 0) { setDelStatus({type:'blocked',nCons,id}); return }
    if (nMarcs > 0) { setDelStatus({type:'confirm',nMarcs,id}); return }
    await doDelete(id)
  }

  const doDelete = async id => {
    await supabase.from('cantina_ementas').delete().eq('id',id)
    await reload()
    setDelStatus(null)
    setEditingCell(null)
  }

  const navBtnStyle = {width:32,height:32,borderRadius:'50%',background:C.surface,border:`1px solid ${C.border}`,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center'}

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
      {/* Week toolbar */}
      <div style={{padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button onClick={()=>setWeekOffset(o=>Math.max(0,o-1))} style={navBtnStyle}>
            <Icon name="chev-l" size={15} color={C.textSub}/>
          </button>
          <div style={{fontStyle:'italic',fontSize:26,color:C.text,lineHeight:1}}>
            Semana {weekNum} · {fmtRange(weekDates)}
          </div>
          <button onClick={()=>setWeekOffset(o=>o+1)} style={navBtnStyle}>
            <Icon name="chev-r" size={15} color={C.textSub}/>
          </button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:14,fontSize:12,color:C.textSub}}>
          <span>
            <strong style={{color:C.text}}>{filledCount}</strong> de {totalSlots} pratos preenchidos
          </span>
          <div style={{width:1,height:16,background:C.border}}/>
          <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:C.success}}/>
            {totalMarcs} marcações registadas
          </span>
        </div>
      </div>

      {/* Grid */}
      <div style={{flex:1,padding:'20px 24px 24px',overflow:'hidden',display:'flex',flexDirection:'column',gap:12}}>
        {/* Day headers */}
        <div style={{display:'grid',gridTemplateColumns:`70px repeat(${daysPerWeek}, 1fr)`,gap:12}}>
          <div/>
          {weekDates.map(d => <DayHeader key={d} date={d} closed={diasFechados.includes(d)} onToggle={()=>toggleDia(d)}/>)}
        </div>

        {/* Almoço row */}
        <div style={{display:'grid',gridTemplateColumns:`70px repeat(${daysPerWeek}, 1fr)`,gap:12,flex:1,minHeight:0}}>
          <MealLabel emoji="🌞" label="Almoço" hour="12:00 — 14:30"/>
          {weekDates.map(d => {
            if (diasFechados.includes(d)) return <ClosedCell key={d}/>
            const em = ementas.find(e=>e.data===d&&e.tipo==='A')
            const marcs = marcacoesAll.filter(m=>m.ementa_id===em?.id).length
            return <EmentaCell key={d} ementa={em} marcCount={marcs} onClick={()=>setEditingCell({data:d,tipo:'A'})}/>
          })}
        </div>

        {/* Jantar row */}
        <div style={{display:'grid',gridTemplateColumns:`70px repeat(${daysPerWeek}, 1fr)`,gap:12,flex:1,minHeight:0}}>
          <MealLabel emoji="🌙" label="Jantar" hour="19:00 — 21:30"/>
          {weekDates.map(d => {
            if (diasFechados.includes(d)) return <ClosedCell key={d}/>
            const em = ementas.find(e=>e.data===d&&e.tipo==='J')
            const marcs = marcacoesAll.filter(m=>m.ementa_id===em?.id).length
            return <EmentaCell key={d} ementa={em} marcCount={marcs} onClick={()=>setEditingCell({data:d,tipo:'J'})}/>
          })}
        </div>
      </div>

      {/* Modal */}
      {editingCell && (() => {
        const editEm = ementas.find(e=>e.data===editingCell.data&&e.tipo===editingCell.tipo)
          ?? newEmenta(editingCell.data,editingCell.tipo)
        return (
          <>
            <div onClick={()=>setEditingCell(null)}
              style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:40}}/>
            <div style={{
              position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
              zIndex:50,width:560,background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:20,padding:28,boxShadow:'0 32px 80px rgba(0,0,0,0.5)'
            }}>
              <EmentaEditor
                ementa={editEm}
                onSave={save}
                onCancel={()=>{setEditingCell(null);setDelStatus(null)}}
                onDelete={editEm.id ? ()=>checkDel(editEm.id) : undefined}
                onDeleteConfirm={()=>doDelete(delStatus?.id)}
                onDeleteCancel={()=>setDelStatus(null)}
                delStatus={delStatus}
                saving={saving}/>
            </div>
          </>
        )
      })()}
    </div>
  )
}
