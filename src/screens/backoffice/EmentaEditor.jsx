import { useState } from 'react'
import { C } from '../../constants/colors'
import { ps } from '../../constants/pratos'
import { fmtF } from '../../utils/date'
import Icon from '../../components/Icon'

export default function EmentaEditor({ementa,onSave,onCancel,onDelete,onDeleteConfirm,onDeleteCancel,delStatus,saving}) {
  const [f,setF] = useState({...ementa})
  const set = (k,v) => setF(p=>({...p,[k]:v}))

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:4}}>
            {f.tipo==='A'?'🌞 Almoço':'🌙 Jantar'}
          </div>
          <div style={{fontStyle:'italic',fontSize:28,color:C.text}}>{fmtF(f.data)}</div>
        </div>
        <button onClick={onCancel} style={{background:'transparent',border:'none',color:C.textMuted,cursor:'pointer',padding:8}}>
          <Icon name="x" size={20} color={C.textMuted}/>
        </button>
      </div>

      {/* Prato slots */}
      {[1,2,3,4].map(n => {
        const label = f[`prato${n}_label`] ?? ''
        const {bg,border:bd,color:fg} = ps(label)
        return (
          <div key={n} style={{marginBottom:10,padding:'12px 14px',background:C.surface2,borderRadius:12,border:`1px solid ${C.border}`,display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontSize:9.5,fontWeight:700,letterSpacing:'0.06em',padding:'3px 8px',borderRadius:5,background:bg,color:fg,border:`1px solid ${bd}`,minWidth:44,textAlign:'center',flexShrink:0}}>
              {label==='Vegetariano'?'Veg':label?label.slice(0,3):`P${n}`}
            </span>
            <input value={f[`prato${n}_label`]??''} onChange={e=>set(`prato${n}_label`,e.target.value)}
              placeholder="Tipo (Carne, Peixe…)"
              style={{width:130,flexShrink:0,padding:'8px 10px',borderRadius:8,border:`1px solid ${C.border}`,background:C.surface3,color:C.text,fontSize:13,fontFamily:'inherit'}}/>
            <input value={f[`prato${n}_desc`]??''} onChange={e=>set(`prato${n}_desc`,e.target.value)}
              placeholder="Descrição do prato"
              style={{flex:1,padding:'8px 10px',borderRadius:8,border:`1px solid ${C.border}`,background:C.surface3,color:C.text,fontSize:13,fontFamily:'inherit'}}/>
          </div>
        )
      })}

      {/* Delete feedback */}
      {delStatus?.type === 'blocked' && (
        <div style={{marginTop:16,padding:'12px 14px',background:`${C.danger}0d`,border:`1px solid ${C.danger}44`,borderRadius:10}}>
          <div style={{fontSize:13,fontWeight:700,color:C.danger,marginBottom:3}}>Não é possível eliminar</div>
          <div style={{fontSize:12,color:C.textSub,lineHeight:1.5}}>
            Esta ementa tem <strong style={{color:C.text}}>{delStatus.nCons}</strong> consumo{delStatus.nCons!==1?'s':''} registado{delStatus.nCons!==1?'s':''}. Os registos históricos não podem ser apagados.
          </div>
        </div>
      )}
      {delStatus?.type === 'confirm' && (
        <div style={{marginTop:16,padding:'12px 14px',background:'rgba(251,146,60,0.08)',border:'1px solid rgba(251,146,60,0.3)',borderRadius:10}}>
          <div style={{fontSize:13,fontWeight:700,color:'#fb923c',marginBottom:3}}>Atenção</div>
          <div style={{fontSize:12,color:C.textSub,lineHeight:1.5}}>
            Esta ementa tem <strong style={{color:C.text}}>{delStatus.nMarcs}</strong> marcaç{delStatus.nMarcs!==1?'ões':'ão'}. Ao eliminar, as marcações serão removidas permanentemente.
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16,alignItems:'center'}}>
        {!delStatus && onDelete && (
          <button onClick={onDelete} style={{height:40,padding:'0 18px',background:'transparent',border:`1px solid ${C.danger}44`,borderRadius:99,fontSize:14,color:C.danger,cursor:'pointer',marginRight:'auto'}}>
            Remover
          </button>
        )}
        {delStatus?.type === 'blocked' && (
          <button onClick={onDeleteCancel} style={{height:40,padding:'0 18px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,fontSize:14,color:C.textSub,cursor:'pointer',marginLeft:'auto'}}>
            OK, entendi
          </button>
        )}
        {delStatus?.type === 'confirm' && (<>
          <button onClick={onDeleteCancel} style={{height:40,padding:'0 18px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,fontSize:14,color:C.textSub,cursor:'pointer',marginRight:'auto'}}>
            Cancelar
          </button>
          <button onClick={onDeleteConfirm} style={{height:40,padding:'0 18px',background:`${C.danger}18`,border:`1px solid ${C.danger}55`,borderRadius:99,fontSize:14,fontWeight:700,color:C.danger,cursor:'pointer'}}>
            Confirmar eliminação
          </button>
        </>)}
        {!delStatus && (<>
          <button onClick={onCancel} style={{height:40,padding:'0 18px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:99,fontSize:14,color:C.textSub,cursor:'pointer'}}>
            Cancelar
          </button>
          <button onClick={()=>onSave(f)} disabled={saving}
            style={{height:40,padding:'0 22px',background:C.yellow,border:'none',borderRadius:99,fontSize:14,fontWeight:700,color:C.bg,cursor:'pointer'}}>
            {saving?'A guardar…':'Guardar'}
          </button>
        </>)}
      </div>
    </div>
  )
}
