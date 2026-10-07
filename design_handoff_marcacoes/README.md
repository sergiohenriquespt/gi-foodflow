# Handoff: Terminal de Marcações v2 (touch-first)

> **Parte 2 de 4** do redesign do FoodFlow. Substitui a versão anterior deste handoff. Cobre o **dashboard do Terminal de Marcações**, o ecrã que o funcionário vê depois do login para marcar refeições. Alvo: **POS touch de 15", 1366×768, sem scroll**.

## Sobre os ficheiros de design

`screens-marcacoes-touch.jsx` → componente `MarcacoesTouch` é a **referência canónica** (protótipo React no browser, interativo). **Não é código de produção**: recria-o no codebase real usando os componentes e tokens que já existem. O protótipo navegável está em `FoodFlow Redesign.html`, secção 02, artboard "Marcações v2 — touch-first".

## Regra comum: dados dinâmicos e cor por posição

Aplica-se às 3 áreas (Marcações, Validações, Backoffice). **Implementar uma vez, partilhado.**

1. **Textos dos pratos vêm sempre da ementa** (editável no Backoffice): label = `em.prato{n}_label`, descrição = `em.prato{n}_desc`. "Carne/Peixe/Dieta/Vegetariano" nos protótipos são só dados de exemplo. Nunca comparar com estes textos no código.
2. **A cor depende da posição do prato (slot 1–4), não do texto da label.** Mudar o nome de um prato não altera a cor.
3. **Horários das refeições vêm das Definições** (as mesmas chaves usadas por `getMeal(s)` / `getNextMeal(s)`). Nada de horas fixas no código.

**Tokens** (copiar de `foodflow.css` para `src/styles/global.css` se ainda não existirem):
```css
:root{
  --prato-carne-fg:#f4a49a; --prato-carne-bg:#2d1a1a; --prato-carne-bd:#5c2020;  /* slot 1 */
  --prato-peixe-fg:#7ec8f0; --prato-peixe-bg:#0f1e2d; --prato-peixe-bd:#1a3d5c;  /* slot 2 */
  --prato-dieta-fg:#6ee7b7; --prato-dieta-bg:#0d2218; --prato-dieta-bd:#1a5c3a;  /* slot 3 */
  --prato-veg-fg:#fcd34d;   --prato-veg-bg:#1e1b08;   --prato-veg-bd:#4a420a;    /* slot 4 */
}
```
Slot 1 coral · slot 2 azul · slot 3 verde · slot 4 amarelo.

**Helper partilhado** — criar `src/constants/pratos.js`:
```js
const SLOTS = ['carne', 'peixe', 'dieta', 'veg']
export const pratoSlotKey = n => SLOTS[(n - 1) % SLOTS.length]   // n = 1..4
export const pratoColors = n => {
  const k = pratoSlotKey(n)
  return { fg: `var(--prato-${k}-fg)`, bg: `var(--prato-${k}-bg)`, bd: `var(--prato-${k}-bd)` }
}
```
**`PratoTag`** passa a receber `slot` (número 1–4) para a cor e `label` só para o texto: `<PratoTag slot={n} label={em[\`prato${n}_label\`]} />`. Se existir um `ps(label)` ou mapeamento por texto no codebase, substituir por `pratoColors(n)` em todo o lado.

**Contadores e históricos agrupam por `prato_num`**, nunca pela label.

---

## Ficheiros a alterar

| Ficheiro | Ação |
|---|---|
| `src/screens/marcacoes/TerminalMarcacoes.jsx` | Substituir **só** o bloco `step === 'dashboard'`. Login (`numero`/`pin`) e lógica Supabase não se tocam. |
| `src/components/PratoCard.jsx` | Criar (ou reescrever, se já existir da versão anterior). |
| `src/components/Icon.jsx` | Garantir glifos `lock`, `chev-l`, `chev-r`, `check`, `x`, `logout` (Lucide, stroke 1.8). |

## Resolução

Tem de funcionar em **1366×768 e 1024×768** (resoluções comuns em POS de 15"). Abaixo de 1200px de largura: esconder o logo na topbar, coluna de etiqueta da refeição a 170px, descrição do prato a 17px e etiqueta "Escolhido" só com ícone. O protótipo tem os dois artboards.

## Princípios touch (não negociáveis)

- **Alvo mínimo 56px** em qualquer elemento tocável. Pratos ~250×260px, dias 100px de altura, setas 64px de largura, "Terminar" 60px.
- **Um toque = uma ação.** Tocar num prato marca; tocar no mesmo prato desmarca. Sem confirmações modais.
- **Tudo visível num ecrã**, sem scroll.
- **Sem hover states como única pista** (não existe hover em touch). O estado selecionado tem de ser óbvio só por cor/borda/etiqueta.
- Texto mínimo 14px; descrições de prato a 19px.

## Layout (1366×768)

```
┌──────────────────────────────────────────────────────────┐
│ TOPBAR 84px: Logo | Avatar 52 · "Olá, Sofia" · meta      │  [Terminar]
├──────────────────────────────────────────────────────────┤
│ DAY STRIP 100px: [‹] [QUI 05 HOJE ●●] [SEX 06] … [›]     │
├────────────┬──────────┬──────────┬──────────┬────────────┤
│ 🌞 Almoço  │ CARNE    │ PEIXE    │ DIETA    │ VEGETARIANO│  flex:1
│ 12:00–14:30│ desc     │ desc     │ desc     │ desc       │
│ [Desmarcar]│          │[Escolhido]          │            │
├────────────┼──────────┼──────────┼──────────┼────────────┤
│ 🌙 Jantar  │   …      │   …      │   …      │   …        │  flex:1
└────────────┴──────────┴──────────┴──────────┴────────────┘
                    [ ✓ Almoço marcado · Peixe ]  ← toast
```

Contentor raiz: `height:100vh; background:C.bg; display:flex; flex-direction:column; overflow:hidden; position:relative`.

### 1. Topbar (`height:84; padding:0 24px; flex; justify-content:space-between`)
- Esquerda (`gap:20`): `<Logo size="sm" showSub={false}/>` · divisor `1×40 C.border` · `<Avatar nome foto size={52}/>` · bloco:
  - `Olá, {primeiro nome}`: 24px, 700
  - `Nº {func.numero} · {N} refeições marcadas`: 14px, `C.textSub` (N = marcações futuras do funcionário)
- Direita: botão **Terminar** (`height:60; padding:0 28px; background:C.surface; border:2px solid C.border2; radius:14; font 18px/700`, ícone `logout` 22px) → `logout()`.

### 2. Week strip (`height:108; padding:0 20px; flex; gap:8`)
- **Mostra sempre a semana de trabalho, segunda a sexta** (5 chips fixos). Não é uma janela deslizante a partir de hoje.
  ```js
  const monday = d => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x }
  const weekDays = Array.from({length:5}, (_, i) => addD(fmtISO(monday(TODAY)), weekOffset*7 + i))
  ```
- Seta ‹ e › (`width:60; C.surface; border 2px C.border2; radius:16`, ícone 30px): `weekOffset ± 1`. ‹ desativada (`opacity .3`) em `weekOffset === 0`; › desativada na última semana com ementas disponíveis.
- Ao mudar de semana, selecionar o primeiro dia não passado (ou segunda, se for semana futura).
- **Dias passados** da semana atual aparecem esbatidos (`opacity .5`), podem ser tocados para consulta, mas ficam só de leitura.
- **DayChip**: `flex:1; min-width:0; radius:16; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden`.
  - Selecionado: `background:C.yellow; color:C.bg; border:2px solid C.yellow`. Restantes: `C.surface`, `C.text`, `border 2px C.border2`.
  - **Linha 1:** `04` (34px/700) + `QUI` (14px/800, letter-spacing .08em, opacity .6–.75) à esquerda; badge **HOJE** à direita (10px/800, `padding:3px 6px; radius:6`; invertida no chip selecionado).
  - **Linha 2:** dois indicadores **A / J** lado a lado, cada um `flex:1; height:30; radius:8`, **dentro do chip** (nunca posicionados em cima da margem):
    - Marcado: fundo `C.success` (ou `C.bg` no chip selecionado) + letra + ícone `check` (ou `lock` se bloqueado).
    - Por marcar: só borda 2px (`C.border2`), letra em `C.textMuted`.
  - Este layout em coluna aguenta chips estreitos (~150px em ecrãs 1024×768).
- Tocar no chip → `setSelDay(d)`.

### 3. Linhas de refeição (`flex:1; padding:16px 24px 24px; flex column; gap:14`)
Uma linha por tipo (`A` Almoço 🌞, `J` Jantar 🌙). **O horário de cada refeição vem das Definições** (as mesmas chaves que `getMeal(s)`/`getNextMeal(s)` já usam no Terminal de Validações), formatado `HH:MM – HH:MM`. Nunca escrever horas fixas no código. Se a ementa do tipo não existir para o dia, não renderizar a linha. Se o dia não tem ementa: mensagem centrada `Sem ementa para este dia.` (20px, `C.textSub`).

Cada linha: `display:grid; grid-template-columns: 210px repeat(4, minmax(0,1fr)); gap:12; flex:1; min-height:0`.

**Etiqueta da refeição** (1ª coluna; `background:C.bg` ou um tom abaixo de `C.surface`; `border:1px solid C.border; radius:18; padding:18; flex column; space-between`):
- Topo: emoji 30px · label 30px/700 · horário (das Definições) 15px `C.textSub`.
- Fundo, um de três estados:
  - **Dia passado**: ícone `lock` 18px + `Dia já passou` (14px/600, `C.textSub`).
  - **Bloqueado** (`selDay===TODAY && bloqueado`): ícone `lock` 18px + `Já não é possível alterar` (14px/600, `C.textSub`).
  - **Marcado**: botão **Desmarcar** (`height:56; full width; transparent; border 2px C.border2; radius:12; 16px/700`, ícone `x`) → `cancelar(em.id)`.
  - **Por marcar**: anel âmbar 10px + `Por marcar` (15px/700, âmbar: usar o token de aviso existente ou `#fbbf24`).

**PratoCard** (colunas 2–5, uma por `prato{n}_label` preenchido):
```jsx
<button onClick={onClick} disabled={locked} style={{
  position:'relative', textAlign:'left', padding:0, overflow:'hidden',
  borderRadius:18, display:'flex', flexDirection:'column', minHeight:0,
  background: selected ? 'rgba(224,203,75,0.10)' : C.surface,
  border: `3px solid ${selected ? C.yellow : C.border}`,
  opacity: dim ? (locked ? 0.35 : 0.55) : 1,
  transition:'opacity .15s, border-color .15s, background .15s'
}}>
  {/* faixa de categoria */}
  <div style={{ height:54, background:catBg, borderBottom:`1px solid ${catBd}`, color:catFg,
    display:'flex', alignItems:'center', gap:10, padding:'0 18px' }}>
    <PratoGlyph size={22}/>  {/* ícone da categoria */}
    <span style={{ fontSize:16, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</span>
  </div>
  <div style={{ flex:1, padding:'16px 18px', fontSize:19, fontWeight:500, lineHeight:1.3, color:C.text }}>{desc}</div>
  {selected && <span style={{ position:'absolute', right:14, bottom:14, height:44, padding:'0 16px 0 10px',
    borderRadius:99, background:C.yellow, color:C.bg, display:'inline-flex', alignItems:'center', gap:6,
    fontSize:15, fontWeight:800 }}><Icon name={locked?'lock':'check'} size={20}/>Escolhido</span>}
</button>
```
- `selected` = `getM(em.id)?.prato_num === n`. `dim` = há outro prato escolhido nesta refeição.
- **Textos do prato vêm sempre da ementa** (editável no Backoffice): faixa = `em.prato{n}_label`, descrição = `em.prato{n}_desc`. Os nomes "Carne/Peixe/Dieta/Vegetariano" do protótipo são só dados de exemplo.
- **Cor da faixa por posição**: `pratoColors(n)` (ver "Regra comum"). O ícone da faixa segue a mesma regra (por slot).
- Se `prato{n}_label` estiver vazio, não renderizar o card (a grelha mantém 4 colunas; o espaço fica vazio).
- Toast: usar a label da ementa (`Almoço marcado · {em.prato{n}_label}`).
- `onClick`: se escolhido → `cancelar(em.id)`; senão → `marcar(em, n)` (troca diretamente se já havia outro prato).

### 4. Toast de confirmação
Após marcar/desmarcar: `position:absolute; left:50%; bottom:36; transform:translateX(-50%); background:C.text; color:C.bg; radius:14; padding:16px 26px; 18px/700; box-shadow:0 16px 40px rgba(0,0,0,.45)`, ícone `check`. Texto: `Almoço marcado · Peixe` / `Jantar desmarcado`. Desaparece aos 2,2s. Em erro do Supabase: mesmo toast com `Erro ao guardar` em `C.danger`.

## Estado

Reutiliza o existente (`selDay`, `ementas`, `getM`, `marcar`, `cancelar`, `bloqueado`, `TODAY`, `func`). Adicionar só:
```js
const [weekOffset, setWeekOffset] = useState(0)
const [toast, setToast] = useState(null)   // { msg, error? }
```
Ao mudar de janela, se `selDay` sair da janela, selecionar o primeiro dia da nova janela.

## Tokens (`src/constants/colors.js`, sem hex soltos exceto os indicados)

| Token | Uso |
|---|---|
| `C.bg` | fundo; texto sobre mustard |
| `C.surface` | cards de prato, chips, botões |
| `C.border` / `C.border2` | bordas de cards / bordas de botões e chips |
| `C.yellow` | dia selecionado, prato escolhido, etiqueta "Escolhido" |
| `C.text` / `C.textSub` / `C.textMuted` | primário / secundário / letras A-J |
| `C.success` | indicador de refeição marcada |
| âmbar (`#fbbf24` ou token de aviso) | "Por marcar" |

**Tipografia:** Outfit (carregada na Parte 1). Pesos 600–800 em tudo o que é estrutural; **sem itálicos finos** neste ecrã (legibilidade em POS). **Raios:** 12 (botões pequenos), 14–16 (chips/botões), 18 (cards).

## Copy (PT-PT, "tu")
`Olá, {nome}` · `{N} refeições marcadas` · `HOJE` · `Por marcar` · `Desmarcar` · `Escolhido` · `Já não é possível alterar` · `Terminar` · `Sem ementa para este dia.` · toasts acima.

## Ficheiros neste bundle
| Ficheiro | Conteúdo |
|---|---|
| `screens-marcacoes-touch.jsx` | **Canónico.** `MarcacoesTouch`. |
| `foodflow-shared.jsx` | Primitivos do mock (`Icon`, `PratoGlyph`, `FF_DARK`, dados demo). |
| `gi-tokens.css` / `foodflow.css` | Tokens GI e cores por slot `--prato-*`. |
