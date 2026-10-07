// Cor do prato depende da posição (slot 1–4), nunca do texto da label.
const SLOTS = ['carne', 'peixe', 'dieta', 'veg']
export const pratoSlotKey = n => SLOTS[(n - 1) % SLOTS.length]   // n = 1..4
export const pratoColors = n => {
  const k = pratoSlotKey(n)
  return { fg: `var(--prato-${k}-fg)`, bg: `var(--prato-${k}-bg)`, bd: `var(--prato-${k}-bd)` }
}
