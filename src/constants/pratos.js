import { C } from './colors'

export const PRATO_PALETTE = {
  'Carne':       {bg:'#2d1a1a',color:'#f4a49a',border:'#5c2020'},
  'Peixe':       {bg:'#0f1e2d',color:'#7ec8f0',border:'#1a3d5c'},
  'Dieta':       {bg:'#0d2218',color:'#6ee7b7',border:'#1a5c3a'},
  'Vegetariano': {bg:'#1e1b08',color:'#fcd34d',border:'#4a420a'},
}

export const ps = l => PRATO_PALETTE[l] || {bg:C.surface2,color:C.textSub,border:C.border}
