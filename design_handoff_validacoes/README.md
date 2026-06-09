# Handoff: Terminal de Validações

> **Parte 3 de 4** do redesign do FoodFlow. Cobre o **Terminal de Validações** — o ecrã de cozinha que valida consumos via cartão RFID ou código. Login & Seletor de Modo foram na Parte 1; Marcações na Parte 2.

---

## About the Design Files

Os ficheiros neste bundle são **referências de design em HTML/React-no-browser** (protótipos), **não código de produção**. A tarefa é recriar o design no codebase real.

Ficheiro canónico: `screens-validacoes.jsx` → funções `ValArrojada*`. (Ignorar `ValRefinada*` e `CountersPanel` da Refinada — descartados.)

O protótipo navegável está em `FoodFlow Redesign.html` na raiz do projeto de design (secção **03 · Validações**) — abre em focus mode para ver ao pixel.

---

## Ficheiro a alterar

**`src/screens/validacoes/TerminalValidacoes.jsx`** — o componente completo. Toda a **lógica** mantém-se (`process`, `confirmarConsumo`, `useSerial`, HID fallback, `getMeal`, etc.). Só muda a **apresentação**.

---

## Visão Geral da Mudança

| Aspeto | Hoje | Redesign |
|---|---|---|
| Layout geral | Card centrado (460px) + sidebar direita (280px) | **Full-bleed takeover** para cada estado |
| Standby | Ícone pequeno, card modesto | Anel pulsante **340px**, título **88px Outfit** |
| Sucesso | Card centrado, nome 28px | **Fundo verde total**, avatar 220px, "Bom apetite." 96px Outfit |
| Duplicado | Card âmbar modesto | **Fundo âmbar total**, "Calma aí." 84px Outfit |
| Sem marcação | Card com seleção de prato | **Fundo vermelho total**, seleção de prato 2×2 integrada |
| Encerrada | Emoji 🔒 + texto | Relógio grande, "Serviço encerrado" 84px Outfit + pílula próximo serviço |
| Sidebar "últimas validações" | Permanente à direita | **Painel direito 300px** no standby — últimas 5 |
| Contadores de categoria | Não existe | **Strip inferior** no standby — "Faltam servir" por categoria |

---

## Comportamento Confirmado: estado `no-marc`

Quando alguém sem marcação toca o cartão, aparece um **takeover vermelho** com a identidade da pessoa à esquerda e uma **grelha 2×2 de seleção de prato** à direita. O operador escolhe o prato e o consumo é registado de imediato (igual ao fluxo normal, via `confirmarConsumo`). **Sem mensagens de recusa** — a cozinheira decide na hora.

---

## Estados e Layouts

### Estado: Standby (sem `status`, sem `manualMode`, `meal` existe)

**Fundo:** `#0f1217` (mais escuro que `C.bg`).

**Layout do corpo** — `display: flex` horizontal com dois painéis + strip inferior:

```
┌──────────────────────────────┬─────────────────┐
│  HERO (flex:1, centrado)     │  ÚLTIMAS (300px)│
│  anel 280px + "Encosta o     │  5 linhas com   │
│  cartão" 72px Outfit         │  avatar+nome+desc│
└──────────────────────────────┴─────────────────┘
│  STRIP INFERIOR — Faltam servir (4 contadores)  │
└─────────────────────────────────────────────────┘
```

**Barra de topo** (height 50, padding `0 28px`):
- Esquerda: `<Logo size="sm" showSub={false}/>`
- Direita: data/hora + pílula de estado do leitor (verde "LEITOR LIGADO" / âmbar "A ligar…" / cinza "LEITOR EM PAUSA")

**Painel Hero** (`flex:1`, centrado):
```jsx
<div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto 28px' }}>
  {[0, 0.7, 1.4].map(d => (
    <div key={d} style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      border: `2px solid ${C.yellow}`,
      animation: `ff-pulse-ring 2.4s ease-out ${d}s infinite`
    }} />
  ))}
  <div style={{
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: 'radial-gradient(circle at center, rgba(224,203,75,0.18) 0%, rgba(224,203,75,0.02) 70%)',
    border: `2px solid rgba(224,203,75,0.50)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <Icon name="card-tap" size={140} color={C.yellow} stroke={1.4} />
  </div>
</div>
<div style={{ fontSize: 72, lineHeight: 0.95, color: C.text, letterSpacing: '-0.01em' }}>
  Encosta o cartão
</div>
<div style={{ fontSize: 18, color: C.textSub, fontStyle: 'italic', marginTop: 8 }}>
  … ou pressiona qualquer tecla para introduzir o código
</div>
```

**Painel Últimas Validações** (`width: 300`, `background: '#16191f'`, `borderLeft: 1px solid C.border`):
```jsx
// Cabeçalho
<div style={{ padding: '16px 20px 12px', fontSize: 11, fontWeight: 700,
  color: C.textMuted, letterSpacing: '0.14em', textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}` }}>Últimas validações</div>

// Cada linha (máx 5, a primeira tem background ligeiramente diferente)
{recentes.map((r, i) => (
  <div key={i} style={{
    padding: '12px 20px', borderBottom: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', gap: 12,
    background: i === 0 ? '#1a1f27' : 'transparent'
  }}>
    <Avatar nome={r.nome} foto={r.foto} size={36} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {r.nome}
      </div>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
        {fmtHM(r.validado_em)} · {r.pratoDesc}
      </div>
    </div>
    <PratoTag label={r.pratoLabel} />
  </div>
))}
```
**Dados:** usar o estado `recentes` já existente (últimas 5 entradas, populado por `confirmarConsumo` e carregado no mount).

**Strip inferior** (`borderTop: 1px solid C.border`, `background: '#16191f'`, `padding: '14px 28px'`):
- Eyebrow "FALTAM SERVIR" à esquerda
- 4 pílulas (Carne / Peixe / Dieta / Vegetariano) em `flex:1` cada, com `PratoTag` + número grande (`font-size:28, font-weight:900`) + `/ total`
- Cores de fundo/borda/texto por categoria (tokens CSS `--prato-*` já existentes)

**Dados para a strip:** nova query que calcula `marcações - consumos` por categoria para `TODAY` + `meal`:
```js
const loadContadores = async (ementaId) => {
  const [{ data: marcs }, { data: cons }] = await Promise.all([
    supabase.from('cantina_marcacoes').select('prato_num').eq('ementa_id', ementaId),
    supabase.from('cantina_consumos').select('prato_num').eq('ementa_id', ementaId)
  ])
  setContadores(calcContadores(marcs, cons, ementa))
}
```
Chamar no mount e depois de cada `confirmarConsumo`. Estado: `const [contadores, setContadores] = useState([])`.

---

### Estado: Modo Manual (`manualMode === true`)

Layout de **dois painéis full-bleed** — igual ao `LoginShell` da Parte 1 (já implementado em `TerminalMarcacoes`). Reutilizar exatamente:
- Fundo `C.bg` + brilho mustard topo direito
- Barra topo: Logo + data/hora + pílula leitor
- Painel esquerdo: hero "Código" + card RFID (anéis pulsantes) com "Encosta o cartão / ou usa o teclado ao lado"
- Painel direito: teclado numérico + display (mesmas medidas da Parte 1)
- Botão `← Voltar ao leitor` abaixo do teclado → `() => { setManualMode(false); setNumInput('') }`

**Sugestão:** extrair `LoginShell` de `TerminalMarcacoes.jsx` para `src/components/LoginShell.jsx` e reutilizar aqui — os dois terminais partilham exatamente o mesmo invólucro.

Disparadores para entrar em modo manual:
1. Botão "Introduzir código manualmente" (no standby, canto inferior — pode ser um link subtil em vez de botão em destaque)
2. O HID fallback atual (`keydown` + buffer) **não muda** — continua a processar via `process()` diretamente sem entrar em `manualMode`

---

### Estado: Sucesso (`status.type === 'ok'`) — Takeover Verde

```
bg: '#0d2e22'   brilho: radial-gradient(circle at 70% 30%, rgba(52,211,153,0.32), transparent 60%)
```

**Barra de topo** (height 46, padding `0 28px`):  Logo + `🌞 Almoço · HH:MM`

**Corpo** (`flex:1`, `padding: '20px 56px 36px'`, `gap:48`, `align-items:center`):

**Painel esquerdo** (`width:360`, `align-items:center`):
- `<Avatar nome={status.func.nome} foto={status.func.foto} size={220} />` com ring verde `rgba(52,211,153,0.6)`
- Nome partido em linhas: `{status.func.nome.split(' ').map(w => <div style={{fontSize:60, lineHeight:1}}>{w}</div>)}`
- Meta: `Nº {func.numero} · {func.cargo}` em 15px, `C.textMuted`, `letterSpacing:0.04em`

**Painel direito** (`flex:1`):
- Linha topo: círculo check 132px (`background:#34d399`, sombra `0 0 0 16px rgba(52,211,153,0.18)`) + bloco texto:
  - Eyebrow "CONSUMO REGISTADO" (13px, 700, letterSpacing 0.16em)
  - **"Bom apetite."** (96px, Outfit 400, `line-height:0.9`, `color:#fff`)
- Card do prato (background `'#0a3a2a'`, border `rgba(52,211,153,0.3)`, borderRadius 22, padding `24px 28px`):
  - `PratoTag` xl + eyebrow "· O TEU PRATO"
  - Prato em 42px Outfit
  - Descrição em 19px, `rgba(232,249,236,0.72)`

**Auto-reset:** `setTimeout(reset, 5000)` — igual a hoje.

---

### Estado: Duplicado (`status.type === 'dup'`) — Takeover Âmbar

```
bg: '#2d2208'   brilho: radial-gradient(circle at 30% 30%, rgba(251,191,36,0.28), transparent 60%)
```

Mesma estrutura que sucesso. Diferenças:
- Círculo de ícone: `background:'#fbbf24'`, `Icon name="warn"`, cor fundo âmbar
- Eyebrow: **"JÁ FOI VALIDADA"**
- Título: **"Calma aí."** (84px)
- Card do prato: `background:'#3a2c0a'`, `border: rgba(251,191,36,0.28)`
- Cabeçalho do card: `REGISTADA ÀS {hora} · HÁ {N} MINUTOS` (hora e delta calculados de `status` — manter lógica atual)

**Auto-reset:** `setTimeout(reset, 6000)` — igual a hoje.

---

### Estado: Sem marcação (`status.type === 'no-marc'`) — Takeover Vermelho + Seleção de Prato

```
bg: '#2a1315'   brilho: radial-gradient(circle at 70% 30%, rgba(248,113,113,0.26), transparent 60%)
```

**Layout:** `padding: '16px 48px 28px'`, `gap: 40`, corpo em dois painéis (pessoa à esquerda, ação à direita).

**Painel esquerdo** (`width: 300`, `align-items: center`):
- `<Avatar nome={func.nome} foto={func.foto} size={180} />` com ring `rgba(248,113,113,0.55)`
- Nome partido: `font-size: 52px`, Outfit 400, `color: #fff`
- Meta: `Nº {func.numero} · {func.cargo}`, 14px, `rgba(254,226,226,0.6)`

**Painel direito** (`flex:1`, `gap: 18`):
- Linha de topo: círculo 96px (`background:'#f87171'`, `Icon name="x"` size 54, stroke 3.4) + bloco:
  - Eyebrow **"SEM MARCAÇÃO PRÉVIA"** (12px, 700, letterSpacing 0.16em)
  - **"Sem marcação."** (56px, Outfit 400, `line-height: 0.95`)
- Card de seleção (`background:'#371619'`, `border: rgba(248,113,113,0.22)`, `borderRadius: 20`, `padding: '18px 20px'`):
  - Eyebrow **"ESCOLHE O PRATO A SERVIR"** (11px, 700, `rgba(254,226,226,0.65)`, uppercase)
  - Grelha 2×2 de botões de prato (`gridTemplateColumns: '1fr 1fr'`, `gap: 10`):
    ```jsx
    {[1,2,3,4].map(n => {
      const label = status.ementa[`prato${n}_label`]
      const desc  = status.ementa[`prato${n}_desc`]
      if (!label) return null
      return (
        <button key={n} onClick={() => confirmarConsumo(status.func, status.ementa, n)}
          style={{
            textAlign: 'left', cursor: 'pointer',
            background: '#3f1c1f', border: `1px solid rgba(248,113,113,0.18)`,
            borderRadius: 14, padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
          <PratoTag label={label} />
          <div style={{ fontSize: 14, lineHeight: 1.3, color: '#fff',
            fontWeight: 500, textWrap: 'pretty' }}>{desc}</div>
        </button>
      )
    })}
    ```
- **Sem auto-reset** — ao clicar num prato, chama `confirmarConsumo` → entra no fluxo normal de sucesso (auto-reset 5s).

---

### Estado: Encerrada (`!meal`) — Standby Neutro

```
bg: '#0f1217'
```

Barra de topo igual ao standby (com "LEITOR EM PAUSA" em cinza).

Hero centrado:
- Círculo 200px: `background: rgba(108,118,128,0.10)`, `border: 2px solid rgba(108,118,128,0.40)`
- `Icon name="clock" size={104} color={C.textMuted} stroke={1.4}`
- **"Serviço encerrado"** (84px, Outfit 400, `line-height:0.95`)
- Subtítulo: `O {almoço/jantar} terminou às {hora}.` (21px, `C.textSub`)
- Pílula próximo serviço (inline-flex, `C.surface`, `C.border`, borderRadius 99, padding `14px 26px`):
  - Emoji 🌙 + label "Próximo serviço" (12px, uppercase) + valor "Jantar · abre às {hora}" (18px, bold)
  - Usar `getNextMeal(s)` já existente para preencher

---

### Estado: Erro (`status.type === 'error'`)

Takeover simples sobre `C.bg`:
- Círculo 100px com `C.dangerBg` e `Icon name="warn"`
- Mensagem em 28–32px, `C.danger`
- Auto-reset 3s — igual a hoje

---

## Estrutura do Componente

```jsx
return (
  <div style={{ height:'100vh', background: computeBg(), /* varia por estado */
    display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

    {/* Brilho decorativo — só nos takeovers coloridos */}
    {status && <div style={{ position:'absolute', inset:0, pointerEvents:'none',
      background: computeGlow() }} />}

    {/* Barra de topo — slim (46–50px), sempre presente */}
    <TopBar meal={meal} serialStatus={serialStatus} connectSerial={connectSerial} status={status} />

    {/* Conteúdo principal — varia completamente por estado */}
    {renderMain()}

    {/* Strip de contadores — APENAS no standby */}
    {!status && !manualMode && meal && contadores.length > 0 && (
      <CounterStrip contadores={contadores} />
    )}
  </div>
)
```

`computeBg()`:
```js
if (!meal)            return '#0f1217'   // encerrada
if (!status)          return '#0f1217'   // standby
if (status.type==='ok')   return '#0d2e22'
if (status.type==='dup')  return '#2d2208'
if (status.type==='no-marc') return '#2a1315'
return C.bg                              // erro / manual
```

---

## Animação dos Anéis RFID

Keyframe `ff-pulse-ring` já em `foodflow.css` (copiar para `global.css` se não estiver):
```css
@keyframes ff-pulse-ring {
  0%   { transform: scale(1);   opacity: .6 }
  100% { transform: scale(1.8); opacity: 0  }
}
```
No standby Arrojada usar raio **340px** e delays `0s / 0.7s / 1.4s` (mais espaçados que no Login — efeito mais solene).

---

## Design Tokens

| Token | Hex | Uso |
|---|---|---|
| `C.bg` | `#151920` | fundo modo manual / erro |
| `C.surface` | `#1e242d` | cards no modo manual |
| `C.border` | `#2d3748` | bordas |
| `C.yellow` / `C.bg` | `#e0cb4b` / `#151920` | anel RFID, tekla `→` |
| `C.text` | `#e2e8f0` | texto primário |
| `C.textSub` | `#94a3b8` | sub |
| `C.textMuted` | `#64748b` | eyebrows, meta |
| `C.success` | `#34d399` | pílula leitor ativo |
| — | `#0d2e22` | bg takeover sucesso |
| — | `#0a3a2a` | card prato no sucesso |
| — | `#2d2208` | bg takeover duplicado |
| — | `#3a2c0a` | card prato no duplicado |
| — | `#2a1315` | bg takeover sem marcação |
| — | `#371619` | card info no sem marcação |
| — | `#0f1217` | bg standby / encerrada |
| — | `#16191f` | bg strip contadores |

Os hexes dos takeovers não estão em `C.*` — definir como constantes locais no componente (não meter nos tokens globais — são específicos deste ecrã).

**Tipografia:** Outfit 400 para os títulos grandes (`font-family: 'Outfit', sans-serif`). Tamanhos: 96px (Bom apetite.), 88px (Encosta o cartão / Sem marcação.), 84px (Calma aí.), 84px (Serviço encerrado), 60px (nome nos takeovers), 42px (prato no sucesso).

---

## Estado a adicionar ao componente

```js
const [contadores, setContadores] = useState([])   // para a strip do standby
```

Resto do state **não muda**.

---

## Notas de Implementação

1. **Sidebar "Últimas validações"** — o design remove-a. Confirmar com o cliente antes de apagar o código. Se mantiver, esconder visualmente em vez de apagar (comentar o JSX).

2. **`onBack`** — o botão "← Sair" continua na barra de topo do standby, mas mais discreto. Nos takeovers coloridos não aparece (o utilizador não deve sair acidentalmente durante uma validação).

3. **`navigator.serial`** — o botão "Conectar leitor" continua disponível na barra de topo do standby quando o leitor não está ligado. Nos takeovers não aparece.

4. **Transições entre estados** — o design não especifica animações de transição. Para a primeira iteração: sem transição (swap direto). Uma transição `opacity` de 150ms seria aceitável se quiseres suavizar.

---

## Ficheiros de Referência (neste bundle)

| Ficheiro | Conteúdo |
|---|---|
| `screens-validacoes.jsx` | Design canónico. `ValArrojada*` são os 5 estados finais. |
| `foodflow-shared.jsx` | Primitivos do mock. |
| `gi-tokens.css` | Tokens GI completos. |
| `foodflow.css` | `@keyframes ff-pulse-ring` + cores de categoria. |
