# Handoff: Backoffice — Secção Ementas

> **Parte 4 de 4** do redesign do FoodFlow. Cobre o **shell do Backoffice** (topbar + rail de navegação) e a **secção Ementas** (vista de grelha semanal). As outras secções — Funcionários, Consumos, Marcações, Definições — **não fazem parte deste redesign** e mantêm-se inalteradas.

---

## About the Design Files

Ficheiro canónico: `screens-backoffice.jsx` → `BackofficeArrojada`. (Ignorar `BackofficeRefinada` — descartada.)

O protótipo navegável está em `FoodFlow Redesign.html` na raiz do projeto de design (secção **04 · Backoffice**).

---

## Ficheiros a alterar

| Ficheiro | Ação |
|---|---|
| `src/screens/backoffice/Backoffice.jsx` | Redesign do shell: topbar + rail |
| `src/screens/backoffice/SecEmentas.jsx` | Redesign completo: lista de dias → **grelha semanal** |
| `src/screens/backoffice/EmentaEditor.jsx` | Restyle: o editor passa a popover/modal estilizado (ver secção 3) |

---

## 1. Shell — `Backoffice.jsx`

### Rail (sem mudança estrutural, só visual)

O rail já tem 60px, ícones e logout — estrutura correta. Ajustes visuais:

```jsx
// Logo tile
<div style={{ width: 36, height: 36, borderRadius: 9, background: C.yellow,
  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
  <Icon name="fork" size={20} stroke={2.2} color={C.bg} />
</div>

// Botão de secção ativa
background: sec === n.key ? `${C.yellow}18` : 'transparent',
border:     `1.5px solid ${sec === n.key ? C.yellow : 'transparent'}`,
borderRadius: 10,
// ícone: stroke 2.4 quando ativo, 1.8 quando inativo
```

### Topbar (substituir o atual de 52px)

```jsx
<div style={{
  padding: '18px 32px 12px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  borderBottom: `1px solid ${C.border}`, background: C.surface,
  flexShrink: 0
}}>
  {/* Esquerda */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
    <Logo size="sm" showSub={false} />
    <div style={{ width: 1, height: 28, background: C.border }} />
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
        letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Backoffice · {nav.find(n => n.key === sec)?.label}
      </div>
      {/* Título muda por secção; para Ementas mostra o mês */}
      <div style={{ fontSize: 28, lineHeight: 1, color: C.text, marginTop: 2 }}>
        {sec === 'ementas' ? currentMonthLabel : nav.find(n => n.key === sec)?.label}
      </div>
    </div>
  </div>

  {/* Direita — botões contextuais por secção */}
  {sec === 'ementas' && (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button style={{ height: 36, padding: '0 14px', background: 'transparent',
        border: `1px solid ${C.border}`, borderRadius: 99, color: C.textSub,
        fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <Icon name="copy" size={14} /> Templates
      </button>
      <button style={{ height: 36, padding: '0 14px', background: 'transparent',
        border: `1px solid ${C.border}`, borderRadius: 99, color: C.textSub,
        fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <Icon name="history" size={14} /> Histórico
      </button>
      <div style={{ width: 1, height: 24, background: C.border, margin: '0 4px' }} />
      <button onClick={handlePublicarSemana}
        style={{ height: 36, padding: '0 16px', background: C.yellow, border: 'none',
          borderRadius: 99, color: C.bg, fontSize: 13, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Icon name="check" size={14} stroke={3} color={C.bg} /> Publicar semana
      </button>
    </div>
  )}
</div>
```

> **"Templates" e "Histórico"** são novos botões sem implementação ainda — renderizar como placeholders não funcionais (sem onClick) para esta iteração. Confirmar prioridade com o cliente antes de implementar.

> **"Publicar semana"** substitui funcionalmente o "Guardar alterações" — o comportamento de guardar (`reload()`) mantém-se; o nome muda.

---

## 2. SecEmentas — Grelha Semanal

### Mudança principal

De: lista de dias (175px) + editor de um dia de cada vez (abre `EmentaEditor` a tela cheia)
Para: **grelha 5 colunas × 2 linhas** — toda a semana visível e editável de uma vez.

### Estado

```js
const [weekOffset, setWeekOffset] = useState(0)
// weekDates = Array.from({length:5}, (_, i) => addD(TODAY, weekOffset*5 + i))
// (só dias úteis — filtrar weekends se s.servir_fds === false, como hoje)
const [editingCell, setEditingCell] = useState(null)
// { data: '2026-06-05', tipo: 'A' } — célula a editar; null = nenhuma
```

### Layout do componente

```
┌─────────────────────────────────────────────────────┐
│ WEEK TOOLBAR (barra de semana)                      │
│ ← Semana 23 · 02 a 06 de Junho →   34/40 · 72 marc│
├──────┬──────┬──────┬──────┬──────┬──────────────────┤
│ 70px │  05  │  02  │  03  │  04  │  06              │ ← Day headers
│      │ QUI  │ SEG  │ TER  │ QUA  │ SEX              │
├──────┼──────┼──────┼──────┼──────┼──────────────────┤
│  🌞  │Cell  │Cell  │Cell  │Cell  │Cell              │ ← Almoço row
│Almoço│      │      │      │      │                  │
├──────┼──────┼──────┼──────┼──────┼──────────────────┤
│  🌙  │Cell  │Cell  │Cell  │Cell  │Cell              │ ← Jantar row
│Jantar│      │      │      │      │                  │
└──────┴──────┴──────┴──────┴──────┴──────────────────┘
```

### Week Toolbar

```jsx
<div style={{ padding: '14px 32px', display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <button onClick={() => setWeekOffset(o => Math.max(0, o-1))}
      style={{ width:32, height:32, borderRadius:'50%', background:C.surface,
        border:`1px solid ${C.border}`, cursor:'pointer',
        display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
      <Icon name="chev-l" size={15} color={C.textSub} />
    </button>
    <div style={{ fontStyle:'italic', fontSize:26, color:C.text, lineHeight:1 }}>
      Semana {weekNum} · {fmtRange(weekDates)}
    </div>
    <button onClick={() => setWeekOffset(o => o+1)} style={/* idem */}>
      <Icon name="chev-r" size={15} color={C.textSub} />
    </button>
  </div>
  <div style={{ display:'flex', alignItems:'center', gap:14, fontSize:12, color:C.textSub }}>
    <span>
      <strong style={{ color:C.text }}>{filledCount}</strong> de {totalSlots} pratos preenchidos
    </span>
    <div style={{ width:1, height:16, background:C.border }} />
    <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:C.success }} />
      {totalMarcs} marcações registadas
    </span>
  </div>
</div>
```

`fmtRange(dates)` → `"02 a 06 de Junho"`. `filledCount` = nº de `prato*_desc` não-nulos nas ementas da semana. `totalMarcs` = `marcacoesAll.filter(m => weekDates.includes(m.data)).length` — receber `marcacoesAll` como prop de `SecEmentas` (já chega a `Backoffice`).

### Grid

```jsx
<div style={{ flex:1, padding:'20px 24px 24px', overflow:'hidden',
  display:'flex', flexDirection:'column', gap:12 }}>

  {/* Linha de cabeçalho dos dias */}
  <div style={{ display:'grid', gridTemplateColumns:'70px repeat(5, 1fr)', gap:12 }}>
    <div /> {/* célula vazia (canto topo esq) */}
    {weekDates.map(d => <DayHeader key={d} date={d} />)}
  </div>

  {/* Linha Almoço */}
  <div style={{ display:'grid', gridTemplateColumns:'70px repeat(5, 1fr)', gap:12,
    flex:1, minHeight:0 }}>
    <MealLabel emoji="🌞" label="Almoço" hour="12:00 — 14:30" />
    {weekDates.map(d => {
      const em = ementas.find(e => e.data === d && e.tipo === 'A')
      const marcs = marcacoesAll.filter(m => m.ementa_id === em?.id).length
      return <EmentaCell key={d} ementa={em} marcCount={marcs}
               onClick={() => setEditingCell({ data: d, tipo: 'A' })} />
    })}
  </div>

  {/* Linha Jantar */}
  <div style={{ display:'grid', gridTemplateColumns:'70px repeat(5, 1fr)', gap:12,
    flex:1, minHeight:0 }}>
    <MealLabel emoji="🌙" label="Jantar" hour="19:00 — 21:30" />
    {weekDates.map(d => {
      const em = ementas.find(e => e.data === d && e.tipo === 'J')
      const marcs = marcacoesAll.filter(m => m.ementa_id === em?.id).length
      return <EmentaCell key={d} ementa={em} marcCount={marcs}
               onClick={() => setEditingCell({ data: d, tipo: 'J' })} />
    })}
  </div>

</div>
```

### DayHeader

```jsx
function DayHeader({ date }) {
  const dd = new Date(date + 'T12:00:00')
  const isToday = date === TODAY
  return (
    <div style={{ padding:'8px 14px', display:'flex', alignItems:'baseline',
      gap:8, position:'relative' }}>
      <span style={{ fontSize:46, lineHeight:0.85, color:C.text }}>
        {dd.getDate()}
      </span>
      <span style={{ fontSize:12, fontWeight:700, letterSpacing:'0.12em', color:C.textMuted }}>
        {WD[dd.getDay()].slice(0,3).toUpperCase()}
      </span>
      {isToday && (
        <span style={{ position:'absolute', top:0, right:14,
          fontSize:9, fontWeight:800, letterSpacing:'0.16em',
          background:C.yellow, color:C.bg, padding:'3px 8px', borderRadius:4 }}>
          HOJE
        </span>
      )}
    </div>
  )
}
```

### MealLabel (coluna esquerda, texto vertical)

```jsx
function MealLabel({ emoji, label, hour }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', textAlign:'center' }}>
        <div style={{ fontSize:24 }}>{emoji}</div>
        <div style={{ fontStyle:'italic', fontSize:24, color:C.text, marginTop:8 }}>{label}</div>
        <div style={{ fontSize:10, color:C.textMuted, marginTop:6, letterSpacing:'0.12em' }}>{hour}</div>
      </div>
    </div>
  )
}
```

### EmentaCell

```jsx
function EmentaCell({ ementa, marcCount, onClick }) {
  const pratos = ementa
    ? [1,2,3,4].map(n => ({ label: ementa[`prato${n}_label`], desc: ementa[`prato${n}_desc`] }))
    : []
  const isEmpty = !ementa || pratos.every(p => !p.desc)

  return (
    <button onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 10,
      display:'flex', flexDirection:'column', gap:6,
      minHeight:0, position:'relative', cursor:'pointer', textAlign:'left',
      transition: 'border-color 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${C.yellow}55`}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

      {/* Contador de marcações (topo direito) */}
      {marcCount > 0 && (
        <div style={{ position:'absolute', top:8, right:10,
          fontSize:11, fontWeight:700, color:C.success }}>
          {marcCount}
        </div>
      )}

      {isEmpty && (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          color:C.textMuted, fontSize:13, fontStyle:'italic' }}>
          + Adicionar ementa
        </div>
      )}

      {!isEmpty && pratos.map((p, i) => {
        if (!p.label) return null
        const { bg, border: bd, color: fg } = ps(p.label)
        return (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:8, padding:'7px 9px', borderRadius:8,
            background: p.desc ? bg : 'transparent',
            border: `1px solid ${p.desc ? bd : C.border}`,
            opacity: p.desc ? 1 : 0.55
          }}>
            <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.06em',
              padding:'2px 7px', borderRadius:4, background:bg, color:fg,
              border:`1px solid ${bd}`, minWidth:36, textAlign:'center', flexShrink:0 }}>
              {p.label === 'Vegetariano' ? 'Veg' : p.label.slice(0,3)}
            </span>
            <div style={{ flex:1, fontSize:11.5, color: p.desc ? C.text : C.textMuted,
              fontStyle: p.desc ? 'normal' : 'italic', lineHeight:1.3,
              overflow:'hidden', display:'-webkit-box',
              WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {p.desc || '+'}
            </div>
          </div>
        )
      })}
    </button>
  )
}
```

---

## 3. EmentaEditor — Restyle como Popover/Modal

Manter a lógica existente (`EmentaEditor.jsx`) mas apresentá-la como um **modal centrado** sobre a grelha, em vez de substituir o conteúdo da secção.

Em `SecEmentas`, quando `editingCell !== null`:

```jsx
{editingCell && (
  <>
    {/* Backdrop */}
    <div onClick={() => setEditingCell(null)}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:40 }} />
    {/* Modal */}
    <div style={{
      position:'fixed', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
      zIndex:50, width:560,
      background: C.surface, border:`1px solid ${C.border}`,
      borderRadius:20, padding:28, boxShadow:'0 32px 80px rgba(0,0,0,0.5)'
    }}>
      <EmentaEditor
        ementa={ementas.find(e=>e.data===editingCell.data&&e.tipo===editingCell.tipo)
          ?? newEmenta(editingCell.data, editingCell.tipo)}
        onSave={async (em) => { await save(em); setEditingCell(null) }}
        onCancel={() => setEditingCell(null)}
        saving={saving} />
    </div>
  </>
)}
```

`newEmenta(data, tipo)` → objecto vazio igual ao `add()` atual de `SecEmentas`.

### Restyle do EmentaEditor (dentro do modal)

O `EmentaEditor` atual tem um card com inputs — dentro do modal fica bem com pequenos ajustes:

```jsx
// Cabeçalho do modal (substituir a linha actual)
<div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
  <div>
    <div style={{ fontSize:11, fontWeight:700, color:C.textMuted,
      letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>
      {f.tipo==='A' ? '🌞 Almoço' : '🌙 Jantar'}
    </div>
    <div style={{ fontStyle:'italic', fontSize:28, color:C.text }}>{fmtF(f.data)}</div>
  </div>
  <button onClick={onCancel} style={{ background:'transparent', border:'none',
    color:C.textMuted, cursor:'pointer', padding:8 }}>
    <Icon name="x" size={20} />
  </button>
</div>

// Cada slot de prato (substituir o layout actual)
{[1,2,3,4].map(n => {
  const { bg, border: bd, color: fg } = ps(f[`prato${n}_label`] ?? '')
  return (
    <div key={n} style={{ marginBottom:10, padding:'12px 14px',
      background: C.surface2, borderRadius:12, border:`1px solid ${C.border}`,
      display:'flex', gap:10, alignItems:'center' }}>
      <PratoTag label={f[`prato${n}_label`] ?? ''} />
      <input value={f[`prato${n}_label`] ?? ''}
        onChange={e => set(`prato${n}_label`, e.target.value)}
        placeholder="Tipo (Carne, Peixe…)"
        style={{ width:130, flexShrink:0, padding:'8px 10px', borderRadius:8,
          border:`1px solid ${C.border}`, background:C.surface3,
          color:C.text, fontSize:13, fontFamily:'inherit' }} />
      <input value={f[`prato${n}_desc`] ?? ''}
        onChange={e => set(`prato${n}_desc`, e.target.value)}
        placeholder="Descrição do prato"
        style={{ flex:1, padding:'8px 10px', borderRadius:8,
          border:`1px solid ${C.border}`, background:C.surface3,
          color:C.text, fontSize:13, fontFamily:'inherit' }} />
    </div>
  )
})}

// Botões (substituir os actuais)
<div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:18 }}>
  <button onClick={onCancel} style={{ height:40, padding:'0 18px',
    background:'transparent', border:`1px solid ${C.border}`, borderRadius:99,
    fontSize:14, color:C.textSub, cursor:'pointer' }}>Cancelar</button>
  <button onClick={() => onSave(f)} disabled={saving}
    style={{ height:40, padding:'0 22px',
      background:C.yellow, border:'none', borderRadius:99,
      fontSize:14, fontWeight:700, color:C.bg, cursor:'pointer' }}>
    {saving ? 'A guardar…' : 'Guardar'}
  </button>
</div>
```

---

## Comportamento preservado

| Funcionalidade | Implementação |
|---|---|
| Criar ementa (dia sem ementa) | Click na célula vazia → `editingCell` → `newEmenta()` → `EmentaEditor` → `insert` |
| Editar ementa existente | Click na célula preenchida → `editingCell` → `EmentaEditor` com dados → `update` |
| Eliminar ementa | Dentro do `EmentaEditor` (modal), botão "Remover" — manter o `del()` actual |
| `reload()` após guardar | Inalterado — chamar depois de `onSave` |
| 14 dias disponíveis | O `weekOffset` navega em janelas de 5; `addD(TODAY, weekOffset*5 + i)` para i 0..4 |

---

## Props a adicionar a SecEmentas

```jsx
// Backoffice.jsx — passar marcacoesAll
<SecEmentas ementas={ementas} reload={reload} marcacoesAll={marcacoesAll} />
```

`marcacoesAll` já existe em `Backoffice` via props — só falta fazê-la descer.

---

## Design Tokens (todos em `C`)

| Token | Uso |
|---|---|
| `C.bg` | fundo da grelha |
| `C.surface` | topbar, células da grelha, modal |
| `C.surface2` | slots do editor, fundo de inputs |
| `C.surface3` | inputs do editor |
| `C.border` | bordas de células, separadores |
| `C.yellow` / `C.bg` | rail activo, header HOJE, botão Publicar, acento |
| `C.text` | texto primário, títulos |
| `C.textSub` | meta, botões secundários |
| `C.textMuted` | eyebrows, placeholders, hora |
| `C.success` | contador de marcações, ponto na toolbar |

**Tipografia:** `font-style:italic` nos labels de refeição ("Almoço", "Jantar") e no título de semana — Outfit 400. Data do dia: 46px Outfit 400. Título do mês no topbar: 28px Outfit 400.

---

## Ficheiros de Referência (neste bundle)

| Ficheiro | Conteúdo |
|---|---|
| `screens-backoffice.jsx` | Design canónico. `BackofficeArrojada` é a versão final. |
| `foodflow-shared.jsx` | Primitivos do mock. |
| `gi-tokens.css` | Tokens GI completos. |
| `foodflow.css` | Cores de categoria de prato (`--prato-*`). |
