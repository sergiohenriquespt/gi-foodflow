import { supabase } from './supabase'
import { DEFAULTS } from '../constants/settings'

const mapFunc = r => ({...r, foto:r.foto_url})

export const fetchFuncionarios  = async () => { const {data}=await supabase.from('cantina_funcionarios').select('*').order('numero'); return (data||[]).map(mapFunc) }
export const fetchEmentas       = async () => { const {data}=await supabase.from('cantina_ementas').select('*').order('data').order('tipo'); return data||[] }
export const fetchMarcacoesAll  = async () => { const {data}=await supabase.from('cantina_marcacoes').select('*').order('created_at'); return data||[] }
export const fetchConsumos      = async () => { const {data}=await supabase.from('cantina_consumos').select('*').order('validado_em',{ascending:false}); return data||[] }
export const fetchDefinicoes    = async () => {
  const {data}=await supabase.from('cantina_definicoes').select('*')
  const s={...DEFAULTS}; for(const r of data||[]) s[r.chave]=r.valor; return s
}
export const saveDefinicao = async (chave,valor) =>
  supabase.from('cantina_definicoes').upsert({chave,valor,updated_at:new Date().toISOString()})

export const fetchDiasFechados = async () => {
  const {data} = await supabase.from('cantina_dias_fechados').select('data')
  return (data||[]).map(r => r.data)
}
export const setDiaFechado   = async data => supabase.from('cantina_dias_fechados').insert({data})
export const unsetDiaFechado = async data => supabase.from('cantina_dias_fechados').delete().eq('data',data)

export const insertVisitantes = async (ementa_id, prato_num, quantidade) =>
  supabase.from('cantina_visitantes').insert({ ementa_id, prato_num, quantidade })

export const fetchVisitantes = async () => {
  const { data } = await supabase.from('cantina_visitantes').select('*').order('registado_em', { ascending: false })
  return data || []
}
