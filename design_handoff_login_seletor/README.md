# Handoff: Login & Seletor de Modo (Terminal FoodFlow)

> **Parte 1 de 4** do redesign do FoodFlow. Cobre apenas o **arranque do terminal**: o seletor de modo e o ecrã de login (código → PIN). Marcações, Validações e Backoffice virão em handoffs separados.

---

## Overview

Estamos a redesenhar os terminais POS da cantina (touch 15", 1366×768). Esta parte trata dos **dois primeiros ecrãs que um funcionário vê**:

1. **Seletor de Modo** — escolhe-se qual terminal este equipamento é (Marcações / Validações / Backoffice). Mostra-se uma vez por dispositivo.
2. **Login** — o funcionário identifica-se por **cartão RFID** (encosta o cartão) **ou** introduz o **código de funcionário** no teclado numérico. Se a conta tiver PIN, segue-se um segundo passo de PIN.

O objetivo do redesign é um look **editorial "Arrojada"** — tipografia muito grande, muito respiro, vestido na **paleta GI escura (charcoal + mustard)** que o resto da app já usa. A **lógica não muda** — só a apresentação.

## About the Design Files

Os ficheiros neste bundle (`screens-login.jsx`, `foodflow-shared.jsx`, `*.css`) são **referências de design feitas em HTML/React-no-browser** (protótipos de aspeto e comportamento), **não código de produção para copiar tal e qual**. A tarefa é **recriar estes ecrãs no codebase real** (`gi-foodflow/`, que já é React + Vite) usando os padrões e componentes que já existem lá.

Concretamente, isto **substitui a apresentação** de:
- `src/screens/ModeSelector.jsx`
- O passo de login dentro de `src/screens/marcacoes/TerminalMarcacoes.jsx` (`step === 'numero'` e `step === 'pin'`), que hoje renderiza via `src/components/InputScreen.jsx` + `src/components/Keypad.jsx`.

## Fidelity

**Alta fidelidade (hi-fi).** Cores, tipografia, espaçamento e estados estão definidos ao pixel. Recria fielmente, **reutilizando os tokens de cor existentes** (`src/constants/colors.js`) — não inventes uma nova paleta. As pequenas diferenças de hex entre o mock e o codebase (ex.: `surface #1a2028` vs `#1e242d`) são imateriais: **os tokens `C` do codebase são a fonte de verdade.**

---

## ⚠️ Pré-requisito que bloqueia tudo: a fonte Outfit

O look depende inteiramente de **Outfit** (a tipografia do design system GI). **O codebase atual NÃO carrega Outfit** — `index.html` e `global.css` usam `system-ui`. Antes de mais:

1. Adicionar ao `<head>` do `index.html`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
   ```
2. Mudar a `font-family` do `body` (em `global.css` e no `<style>` do `index.html`) para:
   ```css
   font-family: 'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif;
   ```

**Detalhe tipográfico central:** os títulos enormes ("Olá.", "Escolhe um terminal.") são **Outfit em peso 400 (regular), não bold** — é o tamanho que dá presença, não o peso. As frases editoriais ("Quem é que vai comer?", "Escolhe um terminal.") são **itálico**. Não usar `font-weight` pesado nestes; fica errado.

---

## Screens / Views

### A) Seletor de Modo  (substitui `ModeSelector.jsx`)

**Propósito:** escolher para que serve este terminal. 3 opções; a primeira (Marcações) é a mais comum e está destacada.

**Layout:** full-bleed `100vh`, fundo `C.bg` (`#151920`), `display:flex; flex-direction:column`.
- **Brilho decorativo:** uma camada `position:absolute; inset:0; pointer-events:none` com `background: radial-gradient(circle at 90% 90%, rgba(224,203,75,0.14) 0%, transparent 55%)`. (Único gradiente permitido — eco do login do LinkFlow.)
- **Topo:** `padding: 32px 40px 0`, logo `<Logo size="lg"/>`.
- **Corpo:** `flex:1; padding: 32px 80px; display:flex; flex-direction:column; justify-content:center`.
  - Eyebrow: `font-size:14px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:C.textMuted` — texto **"Qual destes és tu hoje?"**
  - Título: **"Escolhe um terminal."** — `font-style:italic; font-size:72px; line-height:1; color:C.text; margin: 8px 0 36px` (Outfit 400).
  - Grelha de cards: `display:grid; grid-template-columns: repeat(3,1fr); gap:18px`.

**Card de modo** (botão):
- `border-radius:24px; padding:32px 28px; min-height:280px; display:flex; flex-direction:column; gap:28px; position:relative; text-align:left; cursor:pointer`.
- **Card 0 (Marcações) = destacado:** `background:C.yellow`, texto `C.bg`, `border:1.5px solid C.yellow`.
- **Cards 1–2:** `background:C.surface`, texto `C.text`, `border:1.5px solid C.border`.
- **Tile do ícone** (topo): `56–64px` quadrado, `border-radius:16px`. No card destacado: `background: rgba(26,32,40,0.14)`, ícone cor `C.bg`. Nos outros: `background:C.surface3`, ícone cor `C.textSub`. Ícone `size 32, stroke 1.6`.
- **Bloco de texto** (`margin-top:auto`):
  - Mini-eyebrow `TERMINAL 01/02/03` — `font-size:12px; font-weight:700; letter-spacing:0.16em`; cor `rgba(26,32,40,0.55)` no destacado / `C.textMuted` nos outros.
  - Label grande — `font-size:44px; line-height:1` (Outfit 400). Textos: **"Marcações"**, **"Validações"**, **"Backoffice"**.
  - Desc — `font-size:14px; line-height:1.4`; cor `rgba(26,32,40,0.7)` / `C.textSub`. Textos: "Funcionários marcam refeições", "Cozinha valida consumos", "Ementas e relatórios".
- **Seta** canto sup. direito: `Icon name="arrow-r" size=24`, `position:absolute; top:32; right:28`, cor `C.bg` no destacado / `C.yellow` nos outros.

**Comportamento:** `onClick` → `onSelect(m.key)` (igual ao atual). Hover sugerido: cards não-destacados passam `border-color` para `C.yellow` (transição `0.15s` — coerente com o resto da app).

---

### B) Login — passo "Código"  (substitui `step==='numero'` em `TerminalMarcacoes.jsx`)

**Propósito:** identificar o funcionário por RFID ou código. **Toda a lógica existente mantém-se** (`numInput`, `submitNumero`, `useSerial`, fallback HID por `keydown`, `rfidMsg`). Só muda o invólucro visual: deixa de ser um cartão centrado de 440px e passa a um **layout de dois painéis full-bleed**.

**Layout:** full-bleed `100vh`, `C.bg`, `display:flex; position:relative`.
- **Brilho:** camada absoluta `radial-gradient(circle at 80% 10%, rgba(224,203,75,0.16) 0%, transparent 55%)`.
- **Barra de topo** (absoluta, `top:0; left:0; right:0; padding:24px 36px; z-index:1; display:flex; justify-content:space-between`):
  - Esquerda: `<Logo/>`.
  - Direita (`display:flex; gap:16; font-size:12; color:C.textMuted`): texto `Terminal · 05 Jun · 09:42` + **pílula de estado RFID**: `display:inline-flex; gap:6; color:C.success; font-weight:700; font-size:11; letter-spacing:0.08em`, com um ponto `7×7` redondo `background:C.success; box-shadow:0 0 6px C.success` seguido de **"RFID ATIVO"**. (Liga esta pílula ao `serialStatus`: ativo→verde "RFID ATIVO"; a ligar→âmbar "A ligar…"; desligado→cinza "RFID inativo" / botão de ligar.)

- **Conteúdo** (`flex:1; display:flex; align-items:center; padding:64px 80px 32px; gap:80; z-index:1`):

  **Painel esquerdo (hero, `flex:1`):**
  - Eyebrow **"Bom dia 👋"** — `font-size:14; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:C.textMuted; margin-bottom:16`. (Saudação dependente da hora: Bom dia / Boa tarde / Boa noite. O `👋` é o único emoji permitido no produto.)
  - **"Olá."** — `font-size:132px; line-height:0.9; color:C.text; letter-spacing:-0.01em` (Outfit 400).
  - **"Quem é que vai comer?"** — `font-style:italic; font-size:56px; line-height:1.05; color:C.textSub` (Outfit 400).
  - **Card RFID** (`margin-top:32; display:inline-flex; align-items:center; gap:18; background:C.surface; border:1px solid C.border; padding:16px 22px; border-radius:16`):
    - Anel a pulsar: contentor `56×56 position:relative`. Três anéis `position:absolute; inset:0; border-radius:50%; border:1.5px solid C.yellow; animation: ff-pulse-ring 2s ease-out Ns infinite` com delays `0s / 0.5s / 1s`. Centro: círculo `rgba(241,213,107,0.20)` com `Icon name="card"|"card-tap" size=28 color=C.yellow`.
    - Texto: **"Encosta o cartão"** (`font-size:14; font-weight:700; color:C.text`) + **"… ou usa o teclado ao lado"** (`font-size:12; color:C.textMuted; margin-top:2`).

  **Painel direito (teclado, `width:380`):**
  - Eyebrow **"Código"** — `font-size:12; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:C.textMuted; margin-bottom:10`.
  - **Display do valor:** `background:C.surface; border:1px solid C.border; border-radius:18; height:80; display:flex; align-items:center; justify-content:center; margin-bottom:16`. O valor: `font-size:56; letter-spacing:8; color:C.text; line-height:1` (Outfit). Quando vazio, mostrar placeholder subtil; em erro, `border-color:C.danger` + mensagem por baixo (`C.dangerBg`, ver `InputScreen` atual).
  - **Teclado** (recriação do `Keypad` com escala maior): `display:grid; grid-template-columns:repeat(3,1fr); gap:10`. Cada tecla: `height:90; font-size:30; font-weight:500; background:C.surface3; border:1px solid C.border; border-radius:18; color:C.text`. Teclas `1–9`, depois `⌫` (`font-size:24; color:C.textMuted`), `0`, e **`→`** (`background:C.yellow; border:none; color:C.bg; font-weight:800`). Mesmos handlers do `Keypad.jsx`: `onChange(value+d)`, `onChange(value.slice(0,-1))`, `onConfirm`.

### C) Login — passo "PIN"  (substitui `step==='pin'`)

Mesmo invólucro do passo Código, com duas diferenças:
- No painel esquerdo, em vez do hero genérico, mostrar **quem está a entrar**: `<Avatar nome={func.nome} foto={func.foto} size={220}/>` grande, e por baixo o **nome** em Outfit 400 ~`60px` (partido em duas linhas se necessário) + linha meta `Nº {func.numero} · {cargo}` (`font-size:15; color:C.textMuted; letter-spacing:0.04em`). Isto reaproveita o avatar+nome que o passo PIN atual já mostra.
- O eyebrow do painel direito passa a **"PIN"** e o display mostra **bolinhas** (`•`) em vez dos dígitos (`secret`), com `letter-spacing` maior — ver `InputScreen` (`secret` prop) e a cor `C.yellow` que ele usa para o valor.
- Botão "← Voltar" canto sup. esq. (`onBack` → volta a `numero`), como hoje.

> Sugestão de implementação: extrair um componente partilhado `LoginShell` (barra de topo + brilho + painel esquerdo configurável + painel direito com teclado), e ter `numero` e `pin` a passar conteúdos diferentes ao painel esquerdo. Evita duplicar o teclado.

---

## Interactions & Behavior

| Evento | Comportamento (inalterado vs. hoje) |
|---|---|
| Encostar cartão RFID | `useSerial` (Web Serial) **ou** fallback HID (`keydown`+`Enter`, buffer com timeout 200ms) resolve o UID → `funcionarios.find(f=>f.rfid===uid)`. Não encontrado → `rfidMsg` por 5s. Encontrado → `loginFunc(f)`. |
| `loginFunc(f)` | Se `f.pin` → passo **pin**; senão → entra (`dashboard`). |
| Submeter código (`→`) | `submitNumero`: procura por `numero` (com `padStart(3,'0')`). Não encontrado → erro "Código não encontrado" 3s. |
| Submeter PIN | `submitPin`: igual a `func.pin` → entra; senão erro "PIN incorreto" 3s, limpa input. |
| `⌫` / `←` (apagar) | `onChange(value.slice(0,-1))`. |
| Estado do leitor | Pílula no topo reflete `serialStatus` (`connected`/`connecting`/`error`/idle). Sem Web Serial (não-Chrome) → aviso "requer Chrome ou Edge". |

**Animação:** anéis RFID via `@keyframes ff-pulse-ring` (já incluída em `foodflow.css`; copiar para o `global.css` do codebase):
```css
@keyframes ff-pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.8);opacity:0} }
```
Transições gerais `0.15s` em `border-color`/`background` (coerente com a app). Sem bounce, sem parallax.

**Responsivo:** os terminais são fixos a 1366×768, por isso layout fixo é aceitável. Se quiseres robustez, o painel hero pode encolher abaixo de ~1100px (reduzir "Olá." para ~96px); o teclado mantém `380px`.

## State Management

Nenhum estado novo. Reutiliza o que já existe em `TerminalMarcacoes`: `step` (`'numero'|'pin'|'dashboard'`), `numInput`, `pinInput`, `func`, `err`, `rfidMsg`, e o hook `useSerial(onUidRef)`. O Seletor de Modo continua a usar `mode` em `App.jsx`.

## Design Tokens

Todos já existem em `src/constants/colors.js` — **usar estes, não hex soltos**:

| Token | Hex | Uso aqui |
|---|---|---|
| `C.bg` | `#151920` | fundo full-bleed; texto sobre mustard |
| `C.surface` | `#1e242d` | card RFID, display do valor, cards de modo |
| `C.surface2` | `#252d38` | tile de ícone (alt) |
| `C.surface3` | `#2a3241` | teclas do teclado |
| `C.border` | `#2d3748` | bordas de cards/teclas |
| `C.border2` | `#384455` | bordas mais visíveis (opcional) |
| `C.yellow` | `#e0cb4b` | acento, card destacado, tecla `→`, anel RFID |
| `C.text` | `#e2e8f0` | títulos e texto primário |
| `C.textSub` | `#94a3b8` | subtítulo italic, descrições |
| `C.textMuted` | `#64748b` | eyebrows, meta |
| `C.success` | `#34d399` | pílula "RFID ATIVO" |
| `C.danger` / `C.dangerBg` | `#f87171` / `#2d1515` | erros de código/PIN |

**Raios:** `16–18px` (cards RFID/teclas/display), `24px` (cards de modo). **Escala display (Outfit 400):** `132px` ("Olá."), `72px` (título seletor), `56px` ("Quem é…" / valor do código), `44px` (label de card). **Eyebrows:** `11–14px`, `700`, `letter-spacing 0.12–0.16em`, uppercase.

## Assets

- **Logo:** usar o `<Logo/>` existente (`src/components/Logo.jsx`). O mock usa um `FFLogo` equivalente (tile mustard com talheres + "GI · FOODFLOW"); não é preciso novo asset.
- **Ícones:** Lucide (já em uso via `src/components/Icon.jsx`). Glifos necessários: `calendar`, `card`/`card-tap`, `chart`, `arrow-r`. Se faltar algum no `Icon.jsx`, acrescentar a partir do Lucide (stroke 1.8).
- **Tipografia:** Outfit via Google Fonts (ver pré-requisito). Nenhuma imagem/foto/padrão de fundo.

## Files (referências de design neste bundle)

| Ficheiro | Conteúdo |
|---|---|
| `screens-login.jsx` | **Canónico.** `LoginArrojada` (passo código) e `ModeSelectorArrojada` são as versões finais a recriar. (Ignorar `LoginRefinada` / `ModeSelectorRefinada` — exploração antiga.) |
| `foodflow-shared.jsx` | Primitivos do mock: `Icon`, `FFLogo`, `Avatar`, `PratoTag`, paleta. Referência para mapear aos componentes reais. |
| `gi-tokens.css` | Tokens completos do design system GI (cores, tipo, raios, espaçamento, motion). |
| `foodflow.css` | Extensões FoodFlow (categorias de prato, `@keyframes ff-pulse-ring`). |

> O protótipo navegável completo está em `FoodFlow Redesign.html` (secção **01 · Login & Seletor de Modo**) na raiz do projeto de design — abre em focus mode para ver ao pixel.
