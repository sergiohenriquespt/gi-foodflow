import { useState } from 'react'
import { C } from '../../constants/colors'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
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
  return (
    <div style={{minHeight:'100vh',display:'flex'}}>
      <div style={{width:60,background:C.surface,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:14,flexShrink:0}}>
        <div style={{width:34,height:34,borderRadius:8,background:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}><Icon name="fork" size={18} color={C.bg}/></div>
        {nav.map(n => (
          <button key={n.key} title={n.label} onClick={()=>setSec(n.key)}
            style={{width:40,height:40,borderRadius:8,margin:'3px 0',display:'flex',alignItems:'center',justifyContent:'center',background:sec===n.key?C.yellow+'18':'transparent',border:`1px solid ${sec===n.key?C.yellow+'55':'transparent'}`,transition:'all .15s'}}>
            <Icon name={n.icon} size={18} color={sec===n.key?C.yellow:C.textMuted}/>
          </button>
        ))}
        <div style={{flex:1}}/>
        <button title="Sair" onClick={onBack} style={{width:40,height:40,borderRadius:8,margin:'0 0 14px',display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none'}}>
          <Icon name="logout" size={18} color={C.textMuted}/>
        </button>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',background:C.bg,overflow:'hidden'}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 22px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Icon name={nav.find(n=>n.key===sec)?.icon} size={16} color={C.yellow}/>
            <span style={{fontSize:17,fontWeight:600,color:C.text}}>{nav.find(n=>n.key===sec)?.label}</span>
          </div>
          <div style={{display:'flex',gap:6}}>
            <span style={{fontSize:10,color:C.yellow+'aa',fontWeight:700,letterSpacing:1}}>GI</span>
            <span style={{fontSize:10,color:C.textMuted}}>FOODFLOW</span>
          </div>
        </div>
        <div style={{flex:1,overflow:'auto',padding:20}}>
          {sec==='ementas'   && <SecEmentas    ementas={ementas} reload={reload}/>}
          {sec==='funcs'     && <SecFuncionarios funcionarios={funcionarios} reload={reload}/>}
          {sec==='consumos'  && <SecConsumos   consumos={consumos} funcionarios={funcionarios} ementas={ementas}/>}
          {sec==='marcacoes' && <SecMarcacoes  marcacoes={marcacoesAll} funcionarios={funcionarios} ementas={ementas}/>}
          {sec==='definicoes'&& <SecDefinicoes settings={settings} reload={reload}/>}
        </div>
      </div>
    </div>
  )
}
