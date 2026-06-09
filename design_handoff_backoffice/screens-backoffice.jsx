/* global React, DCArtboard, FF_PRATOS, Icon, PratoGlyph, FFLogo, Avatar, PratoTag, FF_DARK, MN_SHORT, WD_FULL */
// ─────────────────────────────────────────────────────────────────────────────
// BACKOFFICE — desktop 1440×900
// Focus: Ementas editor (the user's other big pain point)
// ─────────────────────────────────────────────────────────────────────────────

const BO_T = FF_DARK;

// Common nav rail
function BORail({ active = 'ementas' }) {
  const nav = [
  { key: 'home', icon: 'home', label: 'Painel' },
  { key: 'ementas', icon: 'calendar', label: 'Ementas' },
  { key: 'funcs', icon: 'users', label: 'Funcionários' },
  { key: 'consumos', icon: 'chart', label: 'Consumos' },
  { key: 'marcacoes', icon: 'list', label: 'Marcações' },
  { key: 'defs', icon: 'gear', label: 'Definições' }];

  return (
    <div style={{
      width: 60, background: BO_T.surface, borderRight: `1px solid ${BO_T.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14, flexShrink: 0
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, background: BO_T.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
        color: BO_T.bg
      }}>
        <Icon name="utensils" size={20} stroke={2.2} color="#1a2028" />
      </div>
      {nav.map((n) =>
      <button key={n.key} title={n.label} style={{
        width: 42, height: 42, borderRadius: 10, margin: '3px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active === n.key ? BO_T.accentSoft : 'transparent',
        border: active === n.key ? `1.5px solid ${BO_T.accent}` : '1.5px solid transparent',
        cursor: 'pointer'
      }}>
          <Icon name={n.icon} size={19} stroke={active === n.key ? 2.4 : 1.8}
        color={active === n.key ? BO_T.accent : BO_T.muted} />
        </button>
      )}
      <div style={{ flex: 1 }} />
      <button style={{
        width: 42, height: 42, borderRadius: 10, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', cursor: 'pointer'
      }}>
        <Icon name="logout" size={18} color={BO_T.muted} />
      </button>
    </div>);

}

// Demo ementa for editor
const W = [
{ d: 1, dia: 'SEG', date: '02', mon: 'Jun',
  A: ['Bife de vaca grelhado, batata frita e salada', 'Filetes de pescada com arroz de tomate', 'Peito de frango grelhado com legumes', 'Caril de grão com arroz basmati'],
  J: ['Frango assado com batata doce', 'Bacalhau à brás', 'Sopa + omelete', 'Lasanha de courgette'] },
{ d: 2, dia: 'TER', date: '03', mon: 'Jun',
  A: ['Lombo de porco assado com puré', 'Salmão grelhado com brócolos', 'Peru cozido com legumes', 'Strogonoff de cogumelos'],
  J: ['Hambúrguer caseiro', 'Atum grelhado', 'Sopa juliana + queijada', 'Curry vermelho de tofu'] },
{ d: 3, dia: 'QUA', date: '04', mon: 'Jun',
  A: ['Costeleta de porco com arroz', 'Pescada cozida', 'Lombo de peru ao forno', 'Wrap de húmus'],
  J: ['Almôndegas em tomate', 'Robalo grelhado', 'Salada de quinoa', null] },
{ d: 4, dia: 'QUI', date: '05', mon: 'Jun', today: true,
  A: ['Frango assado', 'Polvo à lagareiro', 'Filete cozido', 'Bowl de grão'],
  J: ['Bife de novilho', 'Dourada no forno', 'Sopa rica + ovo', 'Tofu salteado'] },
{ d: 5, dia: 'SEX', date: '06', mon: 'Jun',
  A: [null, null, null, null],
  J: [null, null, null, null] }];


// ─── REFINADA — improved version of the original day-list + editor ──────────
function BackofficeRefinada() {
  // Calendar mini + day list + day detail with inline mini-editor
  // Selected: Qui 05 Jun
  const sel = W.find((w) => w.today);
  const days = [...W, { d: 6, dia: 'SÁB', date: '07', mon: 'Jun', A: [null], J: [null], weekend: true },
  { d: 7, dia: 'DOM', date: '08', mon: 'Jun', A: [null], J: [null], weekend: true }];

  const DayRow = ({ d }) => {
    const filledA = d.A?.filter(Boolean).length || 0;
    const filledJ = d.J?.filter(Boolean).length || 0;
    const isSel = d.today;
    return (
      <button style={{
        width: '100%', padding: '14px 18px', textAlign: 'left',
        background: isSel ? 'rgba(224,203,75,0.10)' : 'transparent',
        borderLeft: isSel ? `3px solid ${BO_T.accent}` : '3px solid transparent',
        border: 'none', borderTop: `1px solid ${BO_T.borderSub}`,
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        opacity: d.weekend ? 0.5 : 1
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: isSel ? BO_T.accent : BO_T.text, letterSpacing: '0.04em' }}>
              {isSel ? 'HOJE' : d.dia}
            </span>
            <span style={{ fontSize: 13, color: BO_T.sub }}>{d.date} {d.mon}</span>
          </div>
          <div style={{ fontSize: 11.5, color: BO_T.muted, display: 'flex', gap: 10 }}>
            <span>🌞 {filledA}/4</span>
            <span>🌙 {filledJ}/4</span>
          </div>
        </div>
        {filledA === 4 && filledJ === 4 && <Icon name="check-circle" size={17} color={BO_T.success} />}
        {filledA + filledJ > 0 && filledA + filledJ < 8 && <Icon name="edit" size={15} color={BO_T.warn} />}
        {filledA + filledJ === 0 && <span style={{ fontSize: 11, color: BO_T.muted, fontStyle: 'italic' }}>vazio</span>}
      </button>);

  };

  const MealEditor = ({ emoji, label, hour, pratos }) =>
  <div style={{
    background: BO_T.surface, border: `1px solid ${BO_T.border}`,
    borderRadius: 14, padding: '18px 20px', marginBottom: 16
  }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{emoji}</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: BO_T.text }}>{label}</span>
          <span style={{ fontSize: 12, color: BO_T.muted }}>· {hour}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{
          fontSize: 12, fontWeight: 600, color: BO_T.sub, height: 30, padding: '0 12px',
          background: BO_T.surface2, border: `1px solid ${BO_T.border}`, borderRadius: 8, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6
        }}><Icon name="copy" size={13} />Copiar de ontem</button>
          <button style={{
          fontSize: 12, fontWeight: 600, color: BO_T.sub, height: 30, padding: '0 12px',
          background: BO_T.surface2, border: `1px solid ${BO_T.border}`, borderRadius: 8, cursor: 'pointer'
        }}>Limpar</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Object.keys(FF_PRATOS).map((kind, i) => {
        const cls = FF_PRATOS[kind].cls;
        const v = pratos[i];
        return (
          <div key={kind} style={{
            background: BO_T.surface2, border: `1px solid ${BO_T.borderSub}`,
            borderRadius: 10, padding: '12px 14px',
            display: 'flex', alignItems: 'flex-start', gap: 12
          }}>
              <PratoTag label={kind} withGlyph />
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                defaultValue={v || ''}
                placeholder={`Descrição do prato de ${kind.toLowerCase()}…`}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'transparent', border: 'none', outline: 'none',
                  color: BO_T.text, fontSize: 14, padding: '4px 0',
                  fontFamily: 'inherit'
                }} />
              </div>
            </div>);

      })}
      </div>
    </div>;


  return (
    <div style={{
      width: 1440, height: 900, background: BO_T.bg, color: BO_T.text,
      fontFamily: 'var(--font-sans)', display: 'flex', overflow: 'hidden'
    }}>
      <BORail />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          height: 56, background: BO_T.surface, borderBottom: `1px solid ${BO_T.border}`,
          padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="calendar" size={16} color={BO_T.accent} />
            <span style={{ fontSize: 17, fontWeight: 700, color: BO_T.text }}>Ementas</span>
            <span style={{ fontSize: 12, color: BO_T.muted, marginLeft: 4 }}>· Junho 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{
              height: 34, padding: '0 14px', background: BO_T.surface2, border: `1px solid ${BO_T.border}`,
              borderRadius: 8, color: BO_T.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}><Icon name="copy" size={14} />Aplicar template</button>
            <button style={{
              height: 34, padding: '0 16px', background: BO_T.accent, border: 'none',
              borderRadius: 8, color: '#1a2028', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}><Icon name="check" size={14} stroke={3} color="#1a2028" />Guardar alterações</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Day picker — list + mini month */}
          <div style={{ width: 280, borderRight: `1px solid ${BO_T.border}`, background: BO_T.base, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BO_T.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Semana de 02–06
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ width: 26, height: 26, borderRadius: 6, background: BO_T.surface, border: `1px solid ${BO_T.border}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="chev-l" size={13} color={BO_T.sub} />
                </button>
                <button style={{ width: 26, height: 26, borderRadius: 6, background: BO_T.surface, border: `1px solid ${BO_T.border}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="chev-r" size={13} color={BO_T.sub} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {days.map((d) => <DayRow key={d.date} d={d} />)}
            </div>
            <div style={{ padding: 16, borderTop: `1px solid ${BO_T.border}` }}>
              <button style={{
                width: '100%', height: 38, background: 'transparent',
                border: `1.5px dashed ${BO_T.border2}`, borderRadius: 9,
                color: BO_T.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}><Icon name="cal-plus" size={14} />Adicionar semana</button>
            </div>
          </div>

          {/* Day editor */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: BO_T.text }}>{WD_FULL[4]}, 5 de Junho</div>
                <div style={{ fontSize: 13, color: BO_T.muted, marginTop: 2 }}>
                  <span style={{ color: BO_T.success }}>● 18 marcações</span>
                  <span style={{ margin: '0 8px' }}>·</span>
                  <span>14 funcionários ainda não marcaram</span>
                </div>
              </div>
              <span style={{
                background: 'rgba(224,203,75,0.16)', color: BO_T.accent,
                border: `1px solid rgba(224,203,75,0.42)`,
                fontSize: 11, padding: '5px 12px', borderRadius: 6, fontWeight: 700, letterSpacing: '0.05em'
              }}>HOJE</span>
            </div>
            <MealEditor emoji="🌞" label="Almoço" hour="12:00 — 14:30" pratos={sel.A} />
            <MealEditor emoji="🌙" label="Jantar" hour="19:00 — 21:30" pratos={sel.J} />
          </div>
        </div>
      </div>
    </div>);

}

// ─── ARROJADA — week as spreadsheet ─────────────────────────────────────────
function BackofficeArrojada() {
  // Big visible week grid: 5 day columns × 2 rows (Almoço/Jantar). Each cell = 4 prato inputs visible.
  // Header row: day chips. Side rail: meal labels.
  const C = { bg: '#151920', card: '#1a2028', surf: '#222b34', border: '#3a4550', ink: '#e8ecef', ink2: '#a4adb6', ink3: '#6c7680', accent: '#e0cb4b', accentText: '#1a2028', success: '#34d399' };

  const Cell = ({ pratos, hasMarks }) =>
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: 10, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0,
    position: 'relative'
  }}>
      {hasMarks != null &&
    <div style={{
      position: 'absolute', top: 8, right: 10, fontSize: 11, fontWeight: 700,
      color: hasMarks > 0 ? C.success : C.ink3
    }}>{hasMarks > 0 ? `${hasMarks}` : ''}</div>
    }
      {Object.keys(FF_PRATOS).map((kind, i) => {
      const cls = FF_PRATOS[kind].cls;
      const v = pratos?.[i];
      return (
        <div key={kind} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 9px', borderRadius: 8,
          background: v ? `var(--prato-${cls}-bg)` : 'transparent',
          border: `1px solid ${v ? `var(--prato-${cls}-bd)` : C.border}`,
          opacity: v ? 1 : 0.55
        }}>
            <span className={`prato-tag prato-tag--${cls}`} style={{
            fontSize: 9.5, padding: '2px 7px', minWidth: 44, justifyContent: 'center'
          }}>{kind === 'Vegetariano' ? 'Veg' : kind.slice(0, 3)}</span>
            <div style={{
            flex: 1, fontSize: 11.5, color: v ? C.ink : C.ink3,
            fontStyle: v ? 'normal' : 'italic',
            lineHeight: 1.3, textWrap: 'pretty',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>{v || '+'}</div>
          </div>);

    })}
    </div>;


  const days = W;

  return (
    <div style={{
      width: 1440, height: 900, background: C.bg, color: C.ink,
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Topbar */}
      <div style={{
        padding: '18px 32px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${C.border}`, background: C.card
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <FFLogo size="sm" theme="dark" showSub={false} />
          <div style={{ width: 1, height: 28, background: C.border }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Backoffice · Ementas</div>
            <div style={{ fontSize: 28, lineHeight: 1, color: C.ink, marginTop: 2, fontFamily: "Outfit" }}>Junho 2026</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            height: 36, padding: '0 14px', background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 99, color: C.ink2, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 7
          }}><Icon name="copy" size={14} />Templates</button>
          <button style={{
            height: 36, padding: '0 14px', background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 99, color: C.ink2, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 7
          }}><Icon name="history" size={14} />Histórico</button>
          <div style={{ width: 1, height: 24, background: C.border, margin: '0 4px' }} />
          <button style={{
            height: 36, padding: '0 16px', background: C.accent, border: 'none',
            borderRadius: 99, color: C.accentText, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}><Icon name="check" size={14} stroke={3} color={C.accentText} />Publicar semana</button>
        </div>
      </div>

      {/* Week toolbar */}
      <div style={{
        padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${C.border}`, background: C.bg
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chev-l" size={15} color={C.ink2} />
          </button>
          <div style={{ fontStyle: 'italic', fontSize: 26, color: C.ink, lineHeight: 1, fontFamily: "Outfit" }}>
            Semana 23 · 02 a 06 de Junho
          </div>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chev-r" size={15} color={C.ink2} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: C.ink2 }}>
          <span><strong style={{ color: C.ink }}>34</strong> de 40 pratos preenchidos</span>
          <div style={{ width: 1, height: 16, background: C.border }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.success }} />
            72 marcações registadas
          </span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: '20px 24px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Day header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(5, 1fr)', gap: 12, marginBottom: 12 }}>
          <div />
          {days.map((d) =>
          <div key={d.d} style={{
            padding: '8px 14px',
            display: 'flex', alignItems: 'baseline', gap: 8, position: 'relative'
          }}>
              <span style={{ fontSize: 46, lineHeight: 0.85, color: C.ink, fontFamily: "Outfit" }}>{d.date}</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: C.ink3 }}>{d.dia}</span>
              {d.today &&
            <span style={{
              position: 'absolute', top: 0, right: 14,
              fontSize: 9, fontWeight: 800, letterSpacing: '0.16em',
              background: C.accent, color: C.accentText,
              padding: '3px 8px', borderRadius: 4
            }}>HOJE</span>
            }
            </div>
          )}
        </div>

        {/* Almoço row */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(5, 1fr)', gap: 12, marginBottom: 12, flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>🌞</div>
              <div style={{ fontStyle: 'italic', fontSize: 28, color: C.ink, marginTop: 8, fontFamily: "Outfit" }}>Almoço</div>
              <div style={{ fontSize: 10, color: C.ink3, marginTop: 6, letterSpacing: '0.12em' }}>12:00 — 14:30</div>
            </div>
          </div>
          {days.map((d) => <Cell key={d.d} pratos={d.A} hasMarks={d.d === 4 ? 18 : d.d < 4 ? 22 : 0} />)}
        </div>

        {/* Jantar row */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(5, 1fr)', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>🌙</div>
              <div style={{ fontStyle: 'italic', fontSize: 28, color: C.ink, marginTop: 8, fontFamily: "Outfit" }}>Jantar</div>
              <div style={{ fontSize: 10, color: C.ink3, marginTop: 6, letterSpacing: '0.12em' }}>19:00 — 21:30</div>
            </div>
          </div>
          {days.map((d) => <Cell key={d.d} pratos={d.J} hasMarks={d.d === 4 ? 4 : d.d < 4 ? 6 : 0} />)}
        </div>
      </div>
    </div>);

}

window.BackofficeScreens = () => [
<DCArtboard key="a" id="bo-a" label="Backoffice — final (grelha semanal Arrojada · paleta GI escura)" width={1440} height={900}>
    <BackofficeArrojada />
  </DCArtboard>];