import { useState } from 'react'
import { C } from '../../constants/colors'
import { DEFAULTS } from '../../constants/settings'
import { saveDefinicao } from '../../lib/queries'
import Icon from '../../components/Icon'

function Toggle({checked, onChange}) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width:44, height:24, borderRadius:12, position:'relative', cursor:'pointer', flexShrink:0,
      transition:'background 0.2s, border-color 0.2s',
      background:    checked ? C.yellow  : C.surface3,
      border:       `1px solid ${checked ? C.yellow : C.border}`
    }}>
      <div style={{
        width:18, height:18, borderRadius:'50%', position:'absolute', top:2,
        background: checked ? C.bg : C.textMuted,
        left:       checked ? 22  : 2,
        transition: 'left 0.18s ease, background 0.2s'
      }}/>
    </div>
  )
}

function SettingsCard({eyebrow, children}) {
  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', marginBottom:16}}>
      <div style={{padding:'12px 20px', borderBottom:`1px solid ${C.border}`, background:C.surface2}}>
        <div style={{fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:'0.14em', textTransform:'uppercase'}}>
          {eyebrow}
        </div>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  )
}

const iS = {height:40, padding:'0 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, background:C.surface3, color:C.text, width:'100%', boxSizing:'border-box', outline:'none'}
const lS = {fontSize:11, fontWeight:700, color:C.textMuted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.1em'}

export default function SecDefinicoes({settings, reload}) {
  const [form,   setForm]   = useState({...DEFAULTS, ...settings})
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const save = async () => {
    setSaving(true)
    await Promise.all(Object.entries(form).map(([k, v]) => saveDefinicao(k, String(v))))
    await reload()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const toggles = [
    {
      k: 'bloquear_dia_proprio',
      label: 'Bloquear marcações para o próprio dia',
      desc: {
        true:  'Ativo — os funcionários têm de marcar com pelo menos 1 dia de antecedência.',
        false: 'Inativo — os funcionários podem marcar para o próprio dia.'
      }
    },
    {
      k: 'servir_fds',
      label: 'Servir refeições ao fim de semana',
      desc: {
        true:  'Ativo — sábado e domingo aparecem no terminal de marcações e na grelha de ementas.',
        false: 'Inativo — sábado e domingo não aparecem no terminal nem nas ementas.'
      }
    }
  ]

  return (
    <div style={{flex:1, overflow:'auto', padding:'24px 32px'}}>
      <div style={{maxWidth:620}}>

        <SettingsCard eyebrow="Horário da cantina">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
            <div>
              <label style={lS}>Almoço — início</label>
              <input type="time" value={form.almoco_inicio} onChange={e => set('almoco_inicio', e.target.value)} style={iS}/>
            </div>
            <div>
              <label style={lS}>Almoço — fim</label>
              <input type="time" value={form.almoco_fim} onChange={e => set('almoco_fim', e.target.value)} style={iS}/>
            </div>
            <div>
              <label style={lS}>Jantar — início</label>
              <input type="time" value={form.jantar_inicio} onChange={e => set('jantar_inicio', e.target.value)} style={iS}/>
            </div>
            <div>
              <label style={lS}>Jantar — fim</label>
              <input type="time" value={form.jantar_fim} onChange={e => set('jantar_fim', e.target.value)} style={iS}/>
            </div>
          </div>
          <div style={{fontSize:12, color:C.textMuted, background:C.surface2, borderRadius:8, padding:'9px 14px'}}>
            Usado pelo terminal de validações para bloquear consumos fora de horas.
          </div>
        </SettingsCard>

        <SettingsCard eyebrow="⏱ Tempos de ecrã — Validações">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
            <div>
              <label style={lS}>Consumo registado</label>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="number" min="2" max="30" value={form.validacao_tempo_ok} onChange={e => set('validacao_tempo_ok', e.target.value)} style={{...iS,width:80}}/>
                <span style={{fontSize:12,color:C.textMuted}}>segundos</span>
              </div>
            </div>
            <div>
              <label style={lS}>Refeição duplicada</label>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="number" min="2" max="30" value={form.validacao_tempo_dup} onChange={e => set('validacao_tempo_dup', e.target.value)} style={{...iS,width:80}}/>
                <span style={{fontSize:12,color:C.textMuted}}>segundos</span>
              </div>
            </div>
          </div>
          <div style={{fontSize:12, color:C.textMuted, background:C.surface2, borderRadius:8, padding:'9px 14px'}}>
            Segundos que o terminal de validações mostra cada resultado antes de voltar ao ecrã inicial.
          </div>
        </SettingsCard>

        <SettingsCard eyebrow="Regras de marcação">
          {toggles.map(({k, label, desc}, i) => (
            <div key={k} style={{
              display:'flex', alignItems:'flex-start', gap:16,
              paddingBottom: i < toggles.length - 1 ? 18 : 0,
              marginBottom:  i < toggles.length - 1 ? 18 : 0,
              borderBottom:  i < toggles.length - 1 ? `1px solid ${C.border}` : 'none'
            }}>
              <div style={{flex:1}}>
                <div style={{fontSize:14, fontWeight:600, color:C.text, marginBottom:5}}>{label}</div>
                <div style={{fontSize:12, color:C.textMuted, lineHeight:1.55}}>
                  {desc[String(form[k] === 'true')]}
                </div>
              </div>
              <Toggle checked={form[k] === 'true'} onChange={v => set(k, v ? 'true' : 'false')}/>
            </div>
          ))}
        </SettingsCard>

        <div style={{display:'flex', alignItems:'center', gap:14, marginTop:4}}>
          <button onClick={save} disabled={saving}
            style={{height:44, padding:'0 28px', background:C.yellow, border:'none', borderRadius:99, fontSize:14, fontWeight:700, color:C.bg, cursor:'pointer'}}>
            {saving ? 'A guardar…' : 'Guardar definições'}
          </button>
          {saved && (
            <span style={{fontSize:13, color:C.success, display:'inline-flex', alignItems:'center', gap:6}}>
              <Icon name="check" size={14} color={C.success}/> Guardado
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
