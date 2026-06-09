# Handoff: Terminal de Marcações (dashboard)

> **Parte 2 de 4** do redesign do FoodFlow. Cobre o **ecrã de dashboard do Terminal de Marcações** — o que o funcionário vê depois de fazer login para marcar refeições da semana. O Login & Seletor de Modo foram tratados na Parte 1.

---

## About the Design Files

Os ficheiros neste bundle são **referências de design em HTML/React-no-browser** (protótipos), **não código de produção para copiar tal e qual**. A tarefa é recriar o design no codebase real (`gi-foodflow/`).

O ficheiro de referência canónico é `screens-marcacoes.jsx` → componente `MarcacoesArrojada`. (Ignorar `MarcacoesRefinada` — exploração descartada.)

O protótipo navegável completo está em `FoodFlow Redesign.html` na raiz do projeto de design (secção **02 · Marcações**) — abre em focus mode para ver ao pixel.

---

## Ficheiro a alterar

**`src/screens/marcacoes/TerminalMarcacoes.jsx`** — apenas o bloco `step === 'dashboard'` (a parte abaixo do `if (step==='pin') {…}`). O `LoginShell`, os passos `numero`/`pin`, e toda a lógica Supabase **não se tocam**.

Opcionalmente: criar **`src/components/PratoCard.jsx`** (novo componente) para substituir `PratoBtn` dentro do dashboard.

---

## Visão Geral da Mudança

| Aspeto | Hoje | Redesign |
|---|---|---|
| Navegação por dias | Sidebar esquerda 200px, lista vertical | **Strip horizontal** em cima, chips com dia grande |
| Refeições | Cards empilhados, scroll vertical | **Dois blocos lado a lado** (almoço + jantar), sem scroll |
| Seleção de prato | Lista de botões (`PratoBtn`) | **Grelha 2×2** de cards (`PratoCard`) |
| Topbar | Logo + avatar + nome + Sair | Logo + **saudação editorial** + avatar + nome + Sair |
| Alinhamento geral | Denso, scroll | Tudo visível num ecrã, sem scroll |

---

## Layout (1366×768, sem scroll)

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR  (padding 18px 28px)                            │
│  Logo │ sep │ "Olá, Sofia" italic 26px + meta 12px     │
│                              Avatar + nome + Sair →     │
├─────────────────────────────────────────────────────────┤
│  DAY STRIP  (padding 20px 28px 10px)                   │
│  eyebrow "Semana de …" · totais · btn próx semana      │
│  [ Chip Seg ] [ Chip Ter ] [ Chip Qua ] [●Chip Qui] … │
├──────────────────────┬──────────────────────────────────┤
│  MEAL BLOCK — Almoço │  MEAL BLOCK — Jantar             │
│  🌞 Almoço italic 36│  🌙 Jantar italic 36px           │
│  ┌──────┬──────┐    │  ┌──────┬──────┐                 │
│  │Prato │Prato │    │  │Prato │Prato │                 │
│  │  A   │  B   │    │  │  A   │  B   │                 │
│  ├──────┼──────┤    │  ├──────┼──────┤                 │
│  │Prato │Prato │    │  │Prato │Prato │                 │
│  │  C   │  D   │    │  │  C   │  D   │                 │
│  └──────┴──────┘    │  └──────┴──────┘                 │
└──────────────────────┴──────────────────────────────────┘
```

---

## Implementação detalhada

### 1. Topbar

```jsx
<div style={{
  padding: '18px 28px 0',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexShrink: 0
}}>
  {/* Esquerda */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
    <Logo size="sm" showSub={false} />
    <div style={{ width: 1, height: 28, background: C.border }} />
    <div>
      <div style={{ fontStyle: 'italic', fontSize: 26, lineHeight: 1, color: C.text }}>
        Olá, {func.nome.split(' ')[0]}   {/* só o primeiro nome */}
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
        O que vais comer hoje?
      </div>
    </div>
  </div>

  {/* Direita */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{func.nome}</div>
      <div style={{ fontSize: 11, color: C.textMuted }}>Nº {func.numero}</div>
    </div>
    <Avatar nome={func.nome} foto={func.foto} size={42} />
    <button onClick={logout} style={{
      height: 42, padding: '0 16px', background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: 99,
      color: C.textSub, fontSize: 13, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer'
    }}>
      <Icon name="logout" size={15} /> Sair
    </button>
  </div>
</div>
```

---

### 2. Day Strip

Substitui a sidebar. Os **dias disponíveis** vêm da mesma lógica de `days` já existente (slice de 14 dias úteis a partir de hoje, respeitando `serveFds` e `bloqueado`). Mostra-se até **5 dias** (semana corrente); o botão "Próxima semana" avança o offset.

**Gestão de estado — semana offset:**
```jsx
const [weekOffset, setWeekOffset] = useState(0)
// weekDays = days.slice(weekOffset * 5, weekOffset * 5 + 5)
// Botão "Próxima semana": setWeekOffset(o => o + 1) se houver dias além
// Botão "← Semana anterior": setWeekOffset(o => Math.max(0, o - 1))
```

**Eyebrow da strip:**
```jsx
<div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
  letterSpacing: '0.14em', textTransform: 'uppercase' }}>
  Semana de {fmtF(weekDays[0])} a {fmtF(weekDays[weekDays.length-1])}
</div>
```
À direita do eyebrow, totais `N marcadas · N por marcar` + botão "→ Próxima semana".

**DayChip:**
```jsx
function DayChip({ d, sel, marcCount, isToday, bloqueado, onClick }) {
  return (
    <button onClick={onClick} style={{
      cursor: 'pointer', textAlign: 'left',
      background: sel ? C.yellow : C.surface,
      color: sel ? C.bg : C.text,
      border: `1.5px solid ${sel ? C.yellow : C.border}`,
      borderRadius: 14, padding: '14px 18px',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
      minWidth: 132, flexShrink: 0, position: 'relative'
    }}>
      {/* Número grande + label do dia */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 40, lineHeight: 0.85, fontWeight: 400 }}>
          {new Date(d + 'T12:00:00').getDate()}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
          color: sel ? 'rgba(26,32,40,0.6)' : C.textMuted }}>
          {WD[new Date(d + 'T12:00:00').getDay()].slice(0,3).toUpperCase()}
        </span>
      </div>
      {/* Contador de marcações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, color: sel ? 'rgba(26,32,40,0.7)' : C.textSub }}>
        {marcCount > 0
          ? <><span style={{ width: 7, height: 7, borderRadius: '50%',
              background: sel ? C.bg : C.success }} />
              {marcCount} marcado{marcCount > 1 ? 's' : ''}</>
          : <span style={{ fontStyle: 'italic' }}>—</span>}
      </div>
      {/* Badge HOJE */}
      {isToday && (
        <span style={{
          position: 'absolute', top: -8, right: 10,
          fontSize: 9, fontWeight: 800, letterSpacing: '0.16em',
          background: sel ? C.bg : C.yellow,
          color: sel ? C.yellow : C.bg,
          padding: '3px 8px', borderRadius: 4
        }}>HOJE</span>
      )}
    </button>
  )
}
```

**Container da strip:**
```jsx
<div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
  {weekDays.map(d => (
    <DayChip key={d}
      d={d} sel={selDay === d} isToday={d === TODAY}
      bloqueado={bloqueado && d === TODAY}
      marcCount={ementas.filter(e => e.data === d && getM(e.id)).length}
      onClick={() => setSelDay(d)}
    />
  ))}
</div>
```

---

### 3. Meal Blocks (lado a lado)

O container dos dois blocos:
```jsx
<div style={{ flex: 1, display: 'flex', gap: 16, padding: '14px 28px 24px', minHeight: 0 }}>
  {['A', 'J'].map(tipo => {
    const em = dayEm.find(e => e.tipo === tipo)
    if (!em) return null
    const marc = getM(em.id)
    const readonly = selDay === TODAY && bloqueado
    const pratos = [1,2,3,4].map(n => ({
      n, label: em[`prato${n}_label`], desc: em[`prato${n}_desc`]
    })).filter(p => p.label)
    return (
      <MealBlock key={tipo} tipo={tipo} em={em} marc={marc}
        pratos={pratos} readonly={readonly}
        onMarcar={n => marcar(em, n)}
        onCancelar={() => cancelar(em.id)} />
    )
  })}
  {dayEm.length === 0 && (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.textMuted, fontSize: 15 }}>
      Sem ementa disponível para este dia
    </div>
  )}
</div>
```

**MealBlock:**
```jsx
function MealBlock({ tipo, marc, pratos, readonly, onMarcar, onCancelar }) {
  const emoji = tipo === 'A' ? '🌞' : '🌙'
  const label = tipo === 'A' ? 'Almoço' : 'Jantar'
  const hour  = tipo === 'A' ? '12:00 — 14:30' : '19:00 — 21:30'

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 22, padding: '22px 24px',
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 30 }}>{emoji}</span>
          <span style={{ fontStyle: 'italic', fontSize: 36, color: C.text, lineHeight: 1 }}>
            {label}
          </span>
          <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 4 }}>· {hour}</span>
        </div>

        {/* Status / ações */}
        {readonly ? (
          marc
            ? <span style={{ fontSize: 13, color: C.success, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={14} color={C.success} /> Marcado
              </span>
            : <span style={{ fontSize: 13, color: C.textMuted, fontStyle: 'italic' }}>
                Marcações encerradas
              </span>
        ) : marc ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: C.successBg, border: `1px solid ${C.success}33`,
              borderRadius: 99, padding: '6px 14px',
              fontSize: 13, fontWeight: 700, color: C.success
            }}>
              <Icon name="check" size={14} color={C.success} stroke={2.4} /> Marcado
            </span>
            {/* "Trocar prato" = cancela a marcação atual para o user escolher outro */}
            <button onClick={onCancelar} style={{
              fontSize: 13, fontWeight: 600, color: C.textSub,
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 99, padding: '6px 14px', cursor: 'pointer'
            }}>Trocar prato</button>
          </div>
        ) : (
          <span style={{ fontSize: 13, color: C.textMuted, fontStyle: 'italic' }}>
            Escolhe um prato
          </span>
        )}
      </div>

      {/* Grelha 2×2 de pratos */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, flex: 1, alignContent: 'stretch',
        opacity: readonly && !marc ? 0.5 : 1
      }}>
        {pratos.map(({ n, label: pratoLabel, desc }) => (
          <PratoCard key={n}
            label={pratoLabel} desc={desc}
            selected={marc?.prato_num === n}
            disabled={readonly}
            onClick={readonly ? undefined : () => onMarcar(n)} />
        ))}
      </div>
    </div>
  )
}
```

---

### 4. PratoCard (novo componente)

Criar em `src/components/PratoCard.jsx`. Substitui `PratoBtn` **dentro do dashboard das Marcações** (o `PratoBtn` mantém-se para outros usos).

```jsx
// src/components/PratoCard.jsx
import { C } from '../constants/colors'
import PratoBtn from './PratoBtn'   // reutiliza a tag de categoria se existir

export default function PratoCard({ label, desc, selected, disabled, onClick }) {
  // label = 'Carne' | 'Peixe' | 'Dieta' | 'Veg' (mesmo sistema de hoje)
  // Mapeamento de cores da tag igual ao PratoBtn existente
  return (
    <button onClick={onClick} disabled={disabled} style={{
      cursor: disabled ? 'default' : 'pointer',
      textAlign: 'left',
      background: selected ? `${C.yellow}1F` : C.surface2,
      border: `1.5px solid ${selected ? C.yellow : C.border}`,
      borderRadius: 18,
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.15s'
    }}>
      {/* Linha topo: tag de categoria + check */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Reutilizar o mesmo chip de categoria do PratoBtn */}
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 6,
          /* cores por categoria — igual ao PratoBtn atual */
          background: pratoTagBg(label), color: pratoTagFg(label)
        }}>{label}</span>
        {selected && (
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: C.yellow, color: C.bg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>✓</span>
        )}
      </div>
      {/* Descrição */}
      <div style={{ fontSize: 15, lineHeight: 1.35, fontWeight: 500,
        color: C.text, textWrap: 'pretty' }}>
        {desc}
      </div>
    </button>
  )
}

// Helpers (iguais ao sistema de cores de PratoBtn/PratoTag já existente no codebase)
function pratoTagBg(label) {
  const m = { Carne:'#3d1f0d', Peixe:'#0d2535', Dieta:'#2d1515', Veg:'#0d2e1a' }
  return m[label] ?? '#1e242d'
}
function pratoTagFg(label) {
  const m = { Carne:'#fb923c', Peixe:'#38bdf8', Dieta:'#f87171', Veg:'#34d399' }
  return m[label] ?? '#94a3b8'
}
```

> **Nota:** se o codebase já tem um mapeamento de cores por categoria (em `PratoBtn.jsx` ou `constants/`), usa-o diretamente em vez de duplicar. O que importa é que `PratoCard` fique com o **layout de card** (coluna flex, tag em cima, descrição em baixo) em vez do layout de linha do `PratoBtn`.

---

## Estados & Comportamento

### readonly (bloquear_dia_próprio)
Quando `s.bloquear_dia_proprio === 'true'` e `selDay === TODAY`:
- Cards de prato ficam `opacity: 0.5` e `pointer-events: none` (implementado via `disabled` e `opacity` no container da grelha).
- Se já marcou: mostra pílula "Marcado" mas sem botão "Trocar prato".
- Se não marcou: mostra "Marcações encerradas" no header.
- ⚠️ Esta lógica já existe hoje; não muda — só precisa de ser aplicada nos novos componentes.

### Navegação por semanas
- `weekOffset` (state) controla qual fatia de 5 dias mostrar: `days.slice(weekOffset*5, weekOffset*5+5)`.
- Botão "Próxima semana" aparece sempre que `days.length > (weekOffset+1)*5`.
- Botão "← Semana anterior" aparece quando `weekOffset > 0`.
- Ao mudar de semana, se o `selDay` atual não estiver na nova semana, muda para o primeiro dia da nova janela.

### Sem ementa / dia sem dados
- Se `dayEm.length === 0`: mostrar mensagem centrada "Sem ementa disponível para este dia" — igual a hoje.
- Se só existe almoço (sem jantar) ou vice-versa: o bloco do tipo ausente simplesmente não renderiza (o `if (!em) return null` já trata isto).

---

## Design Tokens

Todos em `src/constants/colors.js` — não inventar hex:

| Token | Uso neste ecrã |
|---|---|
| `C.bg` | fundo full-bleed |
| `C.surface` | topbar (fundo), meal blocks |
| `C.surface2` | PratoCard não selecionado, DayChip |
| `C.border` | bordas de chips/cards/botões |
| `C.yellow` | DayChip selecionado, PratoCard selecionado, pílula "Marcado" |
| `C.bg` (sobre yellow) | texto sobre fundo mustard |
| `C.text` | títulos e texto primário |
| `C.textSub` | meta, botão Sair |
| `C.textMuted` | eyebrows, hora, placeholder |
| `C.success` / `C.successBg` | pílula "Marcado" |
| `C.danger` / `C.dangerBg` | não usado neste ecrã |

**Tipografia:** os rótulos de refeição "Almoço" / "Jantar" são `font-style: italic`, `font-size: 36px`, `font-weight: 400` (Outfit). O número do dia nos chips é `font-size: 40px`, `font-weight: 400` (Outfit). Todos os outros textos: Outfit regular (body weight).

**Raios:** `14px` (DayChip), `18px` (PratoCard), `22px` (MealBlock), `99px` (pílulas de estado).

**Transições:** `border-color 0.15s`, `background 0.15s` nos cards interativos. Sem bounce.

---

## Ficheiros a criar/alterar

| Ficheiro | Ação |
|---|---|
| `src/screens/marcacoes/TerminalMarcacoes.jsx` | **Substituir** o bloco `step === 'dashboard'` (tudo a partir de `return (` dentro desse bloco). LoginShell e passos numero/pin não se tocam. Adicionar `weekOffset` ao state. |
| `src/components/PratoCard.jsx` | **Criar** novo componente (ver secção 4). |

---

## Ficheiros de Referência (neste bundle)

| Ficheiro | Conteúdo |
|---|---|
| `screens-marcacoes.jsx` | Design canónico. `MarcacoesArrojada` é a versão final. |
| `foodflow-shared.jsx` | Primitivos do mock (mapeamento para componentes reais). |
| `gi-tokens.css` | Tokens completos do design system GI. |
| `foodflow.css` | Extensões FoodFlow (cores de categoria de prato, keyframes). |
