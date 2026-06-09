import { DEFAULTS } from '../constants/settings'

export const toMin = t => { const [h,m]=(t||'00:00').split(':').map(Number); return h*60+m }

export const getMeal = s => {
  const cur = new Date().getHours()*60 + new Date().getMinutes()
  if (cur >= toMin(s.almoco_inicio) && cur <= toMin(s.almoco_fim)) return 'A'
  if (cur >= toMin(s.jantar_inicio) && cur <= toMin(s.jantar_fim)) return 'J'
  return null
}

export const getNextMeal = s => {
  const cur = new Date().getHours()*60 + new Date().getMinutes()
  if (cur < toMin(s.almoco_inicio)) return {tipo:'A', hora:s.almoco_inicio}
  if (cur < toMin(s.jantar_inicio)) return {tipo:'J', hora:s.jantar_inicio}
  return null
}
