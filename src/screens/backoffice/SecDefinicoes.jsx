import { useState } from 'react'
import { C } from '../../constants/colors'
import { DEFAULTS } from '../../constants/settings'
import { saveDefinicao } from '../../lib/queries'
import Icon from '../../components/Icon'

export default function SecDefinicoes({settings,reload}) {
  const [form,setForm]=useState({...DEFAULTS,...settings})
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(false)
  const set=(k,v)=>setForm(p=>({...p,[k]:v}))
  const save=async()=>{setSaving(true);await Promise.all(Object.entries(form).map(([k,v])=>saveDefinicao(k,String(v))));await reload();setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500)}
  const iS={padding:'9px 12px',borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,background:C.surface3,color:C.text}
  const lS={fontSize:12,fontWeight:700,color:C.textMuted,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}
  const Card=({title,children})=>(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'18px 20px',marginBottom:16}}>
      <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>{title}</div>
      {children}
    </div>
  )
  return(
    <div style={{maxWidth:560}}>
      <Card title="⏰ Horário da cantina">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div><label style={lS}>Almoço — início</label><input type="time" value={form.almoco_inicio} onChange={e=>set('almoco_inicio',e.target.value)} style={{...iS,width:'100%'}}/></div>
          <div><label style={lS}>Almoço — fim</label><input type="time" value={form.almoco_fim} onChange={e=>set('almoco_fim',e.target.value)} style={{...iS,width:'100%'}}/></div>
          <div><label style={lS}>Jantar — início</label><input type="time" value={form.jantar_inicio} onChange={e=>set('jantar_inicio',e.target.value)} style={{...iS,width:'100%'}}/></div>
          <div><label style={lS}>Jantar — fim</label><input type="time" value={form.jantar_fim} onChange={e=>set('jantar_fim',e.target.value)} style={{...iS,width:'100%'}}/></div>
        </div>
        <div style={{fontSize:12,color:C.textMuted,background:C.surface2,borderRadius:8,padding:'8px 12px'}}>Usado pelo terminal de validações para bloquear consumos fora de horas.</div>
      </Card>
      <Card title="📅 Regras de marcação">
        <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',marginBottom:10}}>
          <input type="checkbox" checked={form.bloquear_dia_proprio==='true'} onChange={e=>set('bloquear_dia_proprio',e.target.checked?'true':'false')} style={{width:18,height:18,marginTop:2,flexShrink:0}}/>
          <div>
            <div style={{fontSize:14,color:C.text,fontWeight:500}}>Bloquear marcações para o próprio dia</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:3,lineHeight:1.5}}>{form.bloquear_dia_proprio==='true'?'Ativo — os funcionários têm de marcar com pelo menos 1 dia de antecedência.':'Inativo — os funcionários podem marcar para o próprio dia.'}</div>
          </div>
        </label>
        <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer'}}>
          <input type="checkbox" checked={form.servir_fds==='true'} onChange={e=>set('servir_fds',e.target.checked?'true':'false')} style={{width:18,height:18,marginTop:2,flexShrink:0}}/>
          <div>
            <div style={{fontSize:14,color:C.text,fontWeight:500}}>Servir refeições ao fim de semana</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>Se desativado, sábado e domingo não aparecem no terminal de marcações.</div>
          </div>
        </label>
      </Card>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={save} disabled={saving} style={{padding:'10px 28px',background:C.yellow,border:'none',borderRadius:10,fontSize:15,fontWeight:700,color:C.bg}}>{saving?'A guardar…':'Guardar definições'}</button>
        {saved&&<span style={{fontSize:13,color:C.success,display:'flex',alignItems:'center',gap:5}}><Icon name="check" size={14} color={C.success}/>Guardado</span>}
      </div>
    </div>
  )
}
