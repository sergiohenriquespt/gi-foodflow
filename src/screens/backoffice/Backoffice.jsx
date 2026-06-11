import { useState } from 'react'
import { C } from '../../constants/colors'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
import { MN_FULL } from '../../utils/date'
import SecEmentas from './SecEmentas'
import SecFuncionarios from './SecFuncionarios'
import SecConsumos from './SecConsumos'
import SecMarcacoes from './SecMarcacoes'
import SecDefinicoes from './SecDefinicoes'

export default function Backoffice({funcionarios,ementas,marcacoesAll,consumos,settings,reload,onBack}) {
  const [sec,setSec] = useState('ementas')
  const nav = [
    {key:'ementas',   icon:'calendar', label:'Ementas'},
    {key:'funcs',     icon:'users',    label:'Funcionários'},
    {key:'consumos',  icon:'chart',    label:'Consumos'},
    {key:'marcacoes', icon:'list',     label:'Marcações'},
    {key:'definicoes',icon:'gear',     label:'Definições'},
  ]
  const now = new Date()
  const currentMonthLabel = `${MN_FULL[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div style={{minHeight:'100vh',display:'flex'}}>
      {/* Rail */}
      <div style={{width:60,background:C.surface,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:14,flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:9,background:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:22}}>
          <Icon name="fork" size={20} color={C.bg}/>
        </div>
        {nav.map(n => (
          <button key={n.key} title={n.label} onClick={()=>setSec(n.key)}
            style={{width:42,height:42,borderRadius:10,margin:'3px 0',display:'flex',alignItems:'center',justifyContent:'center',
              background:sec===n.key?`${C.yellow}18`:'transparent',
              border:`1.5px solid ${sec===n.key?C.yellow:'transparent'}`,
              transition:'all .15s',cursor:'pointer'}}>
            <Icon name={n.icon} size={19} color={sec===n.key?C.yellow:C.textMuted}/>
          </button>
        ))}
        <div style={{flex:1}}/>
        <button title="Sair" onClick={onBack}
          style={{width:42,height:42,borderRadius:10,margin:'0 0 14px',display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer'}}>
          <Icon name="logout" size={18} color={C.textMuted}/>
        </button>
      </div>

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',background:C.bg,overflow:'hidden'}}>
        {/* Topbar */}
        <div style={{padding:'18px 32px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:22}}>
            <Logo size="sm" showSub={false}/>
            <div style={{width:1,height:28,background:C.border}}/>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:'0.14em',textTransform:'uppercase'}}>
                Backoffice · {nav.find(n=>n.key===sec)?.label}
              </div>
              <div style={{fontSize:28,lineHeight:1,color:C.text,marginTop:2}}>
                {sec==='ementas' ? currentMonthLabel : nav.find(n=>n.key===sec)?.label}
              </div>
            </div>
          </div>
          {sec==='ementas' && (
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button style={{height:36,padding:'0 14px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,color:C.textSub,fontSize:13,fontWeight:600,display:'inline-flex',alignItems:'center',gap:7,cursor:'pointer'}}>
                <Icon name="copy" size={14}/> Templates
              </button>
              <button style={{height:36,padding:'0 14px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,color:C.textSub,fontSize:13,fontWeight:600,display:'inline-flex',alignItems:'center',gap:7,cursor:'pointer'}}>
                <Icon name="history" size={14}/> Histórico
              </button>
              <div style={{width:1,height:24,background:C.border,margin:'0 4px'}}/>
              <button onClick={reload} style={{height:36,padding:'0 16px',background:C.yellow,border:'none',borderRadius:99,color:C.bg,fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <Icon name="check" size={14} color={C.bg}/> Publicar semana
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {sec==='ementas'
          ? <SecEmentas ementas={ementas} reload={reload} marcacoesAll={marcacoesAll}/>
          : <div style={{flex:1,overflow:'auto',padding:20}}>
              {sec==='funcs'     && <SecFuncionarios funcionarios={funcionarios} reload={reload}/>}
              {sec==='consumos'  && <SecConsumos consumos={consumos} funcionarios={funcionarios} ementas={ementas}/>}
              {sec==='marcacoes' && <SecMarcacoes marcacoes={marcacoesAll} funcionarios={funcionarios} ementas={ementas}/>}
              {sec==='definicoes'&& <SecDefinicoes settings={settings} reload={reload}/>}
            </div>
        }
      </div>
    </div>
  )
}
