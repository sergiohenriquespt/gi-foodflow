/* global React, DCArtboard, FF_PRATOS, Icon, PratoGlyph, FFLogo, Avatar, PratoTag, BoldBackdrop, WD_FULL, WD_SHORT, MN_SHORT */
// ─────────────────────────────────────────────────────────────────────────────
// MARCAÇÕES — POS touch 15", 1366×768
// Two variants: Refinada (refined GI LinkFlow look) + Arrojada (focused, bold)
// ─────────────────────────────────────────────────────────────────────────────

// Shared theme tokens (LinkFlow dark, adapted)
const FF_DARK = {
  bg: '#151920', base: '#1a2028', surface: '#222b34', surface2: '#29333d',
  border: '#3a4550', border2: '#475260', borderSub: '#2e3940',
  accent: '#e0cb4b', accentSoft: '#2e2a0e', accentDim: '#92831e',
  text: '#e8ecef', sub: '#a4adb6', muted: '#6c7680',
  success: '#34d399', successBg: '#0d2e22',
  warn: '#fbbf24', warnBg: '#2d2208',
  danger: '#f87171', dangerBg: '#2d1515'
};

// Demo data — week menu
const DEMO_FUNC = { nome: 'Sofia Marques', numero: '042', cargo: 'Produção · Turno 1' };
const DEMO_WEEK = [
{ d: 'Seg 02 Jun', date: '2026-06-02', label: 'SEG', day: 2, mon: 'Jun', wd: 1, ementa: 'A',
  almoco: ['Bife de vaca grelhado, batata frita e salada', 'Filetes de pescada com arroz de tomate', 'Peito de frango grelhado com legumes salteados', 'Caril de grão com arroz basmati'],
  jantar: ['Frango assado no forno com batata doce', 'Bacalhau à brás', 'Sopa de legumes + omelete com salada', 'Lasanha de courgette e ricotta'] },
{ d: 'Ter 03 Jun', date: '2026-06-03', label: 'TER', day: 3, mon: 'Jun', wd: 2,
  almoco: ['Lombo de porco assado com puré', 'Salmão grelhado com brócolos', 'Peru cozido com legumes a vapor', 'Strogonoff de cogumelos'],
  jantar: ['Hambúrguer caseiro + batata rústica', 'Atum grelhado com salada de feijão', 'Sopa juliana + queijada de cogumelos', 'Curry vermelho de tofu'] },
{ d: 'Qua 04 Jun', date: '2026-06-04', label: 'QUA', day: 4, mon: 'Jun', wd: 3,
  almoco: ['Costeleta de porco com arroz', 'Pescada cozida com batata e cenoura', 'Lombo de peru ao forno com legumes', 'Wrap de húmus, courgette e rúcula'],
  jantar: ['Almôndegas em tomate com esparguete', 'Robalo grelhado com legumes', 'Salada completa de quinoa', 'Empadão de lentilhas'] },
{ d: 'Qui 05 Jun', date: '2026-06-05', label: 'QUI', day: 5, mon: 'Jun', wd: 4, today: true,
  almoco: ['Frango assado com arroz de pato', 'Polvo à lagareiro com batata a murro', 'Filete de pescada cozido com legumes', 'Bowl de grão com courgette grelhada'],
  jantar: ['Bife de novilho com batata frita', 'Dourada no forno com legumes', 'Sopa rica + ovo escalfado', 'Tofu salteado com noodles'] },
{ d: 'Sex 06 Jun', date: '2026-06-06', label: 'SEX', day: 6, mon: 'Jun', wd: 5,
  almoco: ['Plumas de porco preto com arroz selvagem', 'Bacalhau espiritual', 'Peito de frango com puré de couve-flor', 'Risotto de cogumelos shiitake'],
  jantar: ['Carne assada à portuguesa', 'Sardinhas grelhadas com salada', 'Sopa + tosta mista de queijo', 'Falafel com tabule e iogurte de menta'] }];


// Find current month label for header
const MONTH_LABEL = 'Junho 2026';

// ─────────────────────────────────────────────────────────────────────────────
// REFINADA — same architecture as today, but cleaner, denser, more confident
// ─────────────────────────────────────────────────────────────────────────────
function MarcacoesRefinada() {
  const T = FF_DARK;
  // Selected: today (Qui 05), almoço prato 0 already marked, jantar pending
  const W = 1366,H = 768;
  const days = DEMO_WEEK;
  const selDay = days.find((d) => d.today);
  const marked = { [selDay.date]: { A: 0, J: null } };
  const otherMarks = { '2026-06-02': { A: 1, J: null }, '2026-06-03': { A: 2, J: null } };
  const allMarks = { ...otherMarks, ...marked };

  const ChipDay = ({ d, sel }) => {
    const m = allMarks[d.date];
    const count = (m?.A != null ? 1 : 0) + (m?.J != null ? 1 : 0);
    return (
      <button style={{
        textAlign: 'left', cursor: 'pointer',
        padding: '14px 18px',
        background: sel ? 'rgba(224,203,75,0.10)' : 'transparent',
        border: 'none',
        borderLeft: sel ? `4px solid ${T.accent}` : '4px solid transparent',
        display: 'flex', flexDirection: 'column', gap: 4,
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: d.today ? T.accent : T.text, letterSpacing: '0.04em' }}>
            {d.today ? 'HOJE' : d.label}
          </span>
          <span style={{ fontSize: 13, color: T.sub }}>{d.day} {d.mon}</span>
        </div>
        <div style={{ fontSize: 12.5, color: count > 0 ? T.success : T.muted, fontWeight: count > 0 ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
          {count > 0 ?
          <><Icon name="check" size={13} color={T.success} /> {count} marcado{count > 1 ? 's' : ''}</> :
          'sem marcação'}
        </div>
      </button>);

  };

  const PratoRow = ({ kind, desc, selected }) =>
  <button style={{
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '0 20px', height: 70,
    background: selected ? 'rgba(224,203,75,0.10)' : T.surface2,
    border: `1.5px solid ${selected ? T.accent : T.borderSub}`,
    borderRadius: 12, textAlign: 'left', cursor: 'pointer', width: '100%'
  }}>
      <PratoTag label={kind} size="lg" withGlyph />
      <span style={{ flex: 1, fontSize: 16, color: selected ? T.text : T.sub, fontWeight: selected ? 500 : 400, textWrap: 'pretty' }}>{desc}</span>
      {selected &&
    <span style={{
      width: 28, height: 28, borderRadius: '50%', background: T.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
          <Icon name="check" size={17} color="#1a2028" stroke={3} />
        </span>
    }
    </button>;


  const MealCard = ({ meal, emoji, label, pratos, markedNum }) =>
  <div style={{
    background: T.surface,
    border: `1.5px solid ${markedNum != null ? 'rgba(224,203,75,0.40)' : T.border}`,
    borderRadius: 16, padding: '18px 20px', marginBottom: 16
  }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>{emoji}</span>
          <span style={{ fontSize: 19, fontWeight: 700, color: T.text }}>{label}</span>
          <span style={{ fontSize: 12, color: T.muted, marginLeft: 4 }}>12:00 — 14:30</span>
        </div>
        {markedNum != null ?
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: T.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} color={T.success} /> Marcado
            </span>
            <button style={{
          padding: '7px 16px', background: T.dangerBg,
          border: `1px solid rgba(248,113,113,0.33)`, borderRadius: 8,
          color: T.danger, fontSize: 13, fontWeight: 600, height: 36, cursor: 'pointer'
        }}>Cancelar</button>
          </div> :

      <span style={{ fontSize: 13, color: T.muted, fontStyle: 'italic' }}>Escolhe um prato</span>
      }
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pratos.map((desc, i) =>
      <PratoRow key={i} kind={Object.keys(FF_PRATOS)[i]} desc={desc} selected={markedNum === i} />
      )}
      </div>
    </div>;


  return (
    <div style={{ width: W, height: H, background: T.bg, color: T.text, display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        height: 64, background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
      }}>
        <FFLogo size="sm" showSub={false} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={DEMO_FUNC.nome} size={40} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.15 }}>{DEMO_FUNC.nome}</div>
            <div style={{ fontSize: 12, color: T.muted }}>Nº {DEMO_FUNC.numero} · {DEMO_FUNC.cargo}</div>
          </div>
          <button style={{
            marginLeft: 10, padding: '0 18px', height: 40,
            background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10,
            color: T.sub, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            <Icon name="logout" size={15} />Sair
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Day sidebar */}
        <div style={{ width: 244, background: T.surface, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 22px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Esta semana</div>
            <div style={{ fontSize: 11, color: T.sub, fontWeight: 600 }}>{MONTH_LABEL}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {days.map((d) => <ChipDay key={d.date} d={d} sel={d.today} />)}
          </div>
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.borderSub}` }}>
            <div style={{
              background: T.surface2, border: `1px solid ${T.borderSub}`,
              borderRadius: 10, padding: '10px 12px',
              fontSize: 12, color: T.sub, lineHeight: 1.45
            }}>
              <div style={{ fontWeight: 700, color: T.text, marginBottom: 4, fontSize: 13 }}>Total da semana</div>
              <div>4 refeições marcadas · 6 por marcar</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.005em' }}>
              {WD_FULL[4]}, {selDay.day} de {MN_SHORT[5]}
            </div>
            <span style={{
              background: 'rgba(224,203,75,0.16)', color: T.accent,
              border: `1px solid rgba(224,203,75,0.42)`,
              fontSize: 11, padding: '4px 11px', borderRadius: 6, fontWeight: 700, letterSpacing: '0.05em'
            }}>HOJE</span>
          </div>

          <MealCard meal="A" emoji="🌞" label="Almoço" pratos={selDay.almoco} markedNum={marked[selDay.date].A} />
          <MealCard meal="J" emoji="🌙" label="Jantar" pratos={selDay.jantar} markedNum={marked[selDay.date].J} />
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────────────────────
// ARROJADA — editorial, focused, one moment at a time
// Day strip on top, BIG card per meal with category-led plate selection
// Uses cream/light surface for variety
// ─────────────────────────────────────────────────────────────────────────────
function MarcacoesArrojada() {
  const W = 1366,H = 768;
  const days = DEMO_WEEK;
  const selDay = days.find((d) => d.today);
  const C = {
    bg: '#151920', card: '#1a2028', surf: '#222b34', border: '#3a4550',
    ink: '#e8ecef', ink2: '#a4adb6', ink3: '#6c7680',
    accent: '#e0cb4b', accentText: '#1a2028',
    success: '#34d399', successBg: '#0d2e22', successBd: '#1a5c3a'
  };
  const marked = { A: 0, J: null };

  const dayCount = (i) => {
    if (i === 0) return 2;
    if (i === 1) return 2;
    if (i === 2) return 1;
    if (i === 3) return (marked.A != null ? 1 : 0) + (marked.J != null ? 1 : 0);
    return 0;
  };

  const DayChip = ({ d, i, sel }) => {
    const n = dayCount(i);
    return (
      <button style={{
        cursor: 'pointer', textAlign: 'left',
        background: sel ? C.accent : C.card,
        color: sel ? C.accentText : C.ink,
        border: `1.5px solid ${sel ? C.accent : C.border}`,
        borderRadius: 14, padding: '14px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
        minWidth: 132, flexShrink: 0,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 40, lineHeight: 0.85, fontWeight: 400, fontFamily: "Outfit" }}>{d.day}</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: sel ? 'rgba(26,32,40,0.6)' : C.ink3 }}>{d.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: sel ? 'rgba(26,32,40,0.7)' : C.ink2 }}>
          {n === 0 ? <span style={{ fontStyle: 'italic' }}>—</span> :
          <>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: sel ? C.accentText : C.success }} />
              {n} marcado{n > 1 ? 's' : ''}
            </>}
        </div>
        {d.today &&
        <span style={{
          position: 'absolute', top: -8, right: 10,
          fontSize: 9, fontWeight: 800, letterSpacing: '0.16em',
          background: sel ? C.accentText : C.accent, color: sel ? C.accent : C.accentText,
          padding: '3px 8px', borderRadius: 4
        }}>HOJE</span>
        }
      </button>);

  };

  const PratoCard = ({ kind, desc, selected, big }) => {
    const cls = FF_PRATOS[kind].cls;
    return (
      <button style={{
        cursor: 'pointer', textAlign: 'left',
        background: selected ? 'rgba(224,203,75,0.12)' : C.card,
        color: C.ink,
        border: `1.5px solid ${selected ? C.accent : C.border}`,
        borderRadius: 18, padding: big ? '22px 24px' : '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={`prato-tag prato-tag--lg prato-tag--${cls}`}>
            <PratoGlyph kind={kind} size={15} />{kind}
          </span>
          {selected &&
          <span style={{
            width: 32, height: 32, borderRadius: '50%', background: C.accent, color: C.accentText,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
              <Icon name="check" size={18} stroke={3} />
            </span>
          }
        </div>
        <div style={{
          fontSize: big ? 18 : 16, lineHeight: 1.35, fontWeight: 500,
          textWrap: 'pretty'
        }}>{desc}</div>
      </button>);

  };

  const MealBlock = ({ emoji, label, hour, pratos, markedNum, primary }) => {
    return (
      <div style={{
        background: primary ? C.surf : C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 22,
        padding: '22px 24px',
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 30 }}>{emoji}</span>
            <span style={{ fontStyle: 'italic', fontSize: 36, color: C.ink, lineHeight: 1, fontFamily: "Outfit" }}>{label}</span>
            <span style={{ fontSize: 13, color: C.ink3, marginLeft: 4 }}>· {hour}</span>
          </div>
          {markedNum != null ?
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: C.successBg, border: `1px solid ${C.successBd}`,
              borderRadius: 99, padding: '6px 14px',
              fontSize: 13, fontWeight: 700, color: C.success
            }}>
                <Icon name="check" size={14} color={C.success} stroke={2.4} />Marcado
              </span>
              <button style={{
              fontSize: 13, fontWeight: 600, color: C.ink2,
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 99, padding: '6px 14px', cursor: 'pointer'
            }}>Trocar prato</button>
            </div> :

          <span style={{ fontSize: 13, color: C.ink3, fontStyle: 'italic' }}>Escolhe um prato</span>
          }
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12, flex: 1, alignContent: 'stretch'
        }}>
          {pratos.map((d, i) =>
          <PratoCard key={i} kind={Object.keys(FF_PRATOS)[i]} desc={d} selected={markedNum === i} big={false} />
          )}
        </div>
      </div>);

  };

  return (
    <div style={{
      width: W, height: H, background: C.bg, color: C.ink,
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Topbar */}
      <div style={{
        padding: '18px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <FFLogo size="sm" theme="dark" showSub={false} />
          <div style={{ width: 1, height: 28, background: C.border }} />
          <div>
            <div style={{ fontStyle: 'italic', fontSize: 26, lineHeight: 1, color: C.ink, fontFamily: "Outfit" }}>
              Olá, Sofia
            </div>
            <div style={{ fontSize: 12, color: C.ink3, marginTop: 4 }}>O que vais comer hoje?</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Sofia Marques</div>
            <div style={{ fontSize: 11, color: C.ink3 }}>Nº 042</div>
          </div>
          <Avatar name={DEMO_FUNC.nome} size={42} theme="dark" />
          <button style={{
            height: 42, padding: '0 16px', background: C.card,
            border: `1px solid ${C.border}`, borderRadius: 99,
            color: C.ink2, fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer'
          }}>
            <Icon name="logout" size={15} />Sair
          </button>
        </div>
      </div>

      {/* Day strip */}
      <div style={{ padding: '20px 28px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Semana de 02 a 06 de Junho
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: C.ink2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success }} /> 4 marcadas
            </span>
            <span style={{ color: C.ink3 }}>·</span>
            <span>6 por marcar</span>
            <button style={{
              marginLeft: 6, height: 32, padding: '0 14px', cursor: 'pointer',
              background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 99,
              fontSize: 12, fontWeight: 600, color: C.ink2,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              <Icon name="chev-r" size={14} />Próxima semana
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
          {days.map((d, i) => <DayChip key={d.date} d={d} i={i} sel={d.today} />)}
        </div>
      </div>

      {/* Meal blocks side by side */}
      <div style={{ flex: 1, display: 'flex', gap: 16, padding: '14px 28px 24px', minHeight: 0 }}>
        <MealBlock emoji="🌞" label="Almoço" hour="12:00 — 14:30" pratos={selDay.almoco} markedNum={marked.A} />
        <MealBlock emoji="🌙" label="Jantar" hour="19:00 — 21:30" pratos={selDay.jantar} markedNum={marked.J} />
      </div>
    </div>);

}

window.MarcacoesScreens = () => [
<DCArtboard key="a" id="marc-a" label="Marcações — final (layout Arrojada · paleta GI escura)" width={1366} height={768}>
    <MarcacoesArrojada />
  </DCArtboard>];


window.FF_DARK = FF_DARK;
window.DEMO_FUNC = DEMO_FUNC;
window.DEMO_WEEK = DEMO_WEEK;