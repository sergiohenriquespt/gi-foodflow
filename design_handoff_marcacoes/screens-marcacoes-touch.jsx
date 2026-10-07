/* global React, DCArtboard, FF_PRATOS, Icon, PratoGlyph, FFLogo, Avatar, FF_DARK, DEMO_WEEK, DEMO_FUNC */
// MARCAÇÕES v2 — touch-first, POS 15". Interativo. Mostra sempre a semana de trabalho (Seg–Sex).

const MT = FF_DARK;
const MT_KINDS = Object.keys(FF_PRATOS);
const MT_WD = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
const MT_MN = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MT_MONDAY = new Date(2026, 5, 1); // segunda da semana atual (demo)
const MT_TODAY_IDX = 3; // quinta
const MT_MAX_WEEKS = 2; // semana atual + seguinte

const MT_MEALS = [
{ key: 'A', emoji: '🌞', label: 'Almoço', hour: '12:00 – 14:30', src: 'almoco' },
{ key: 'J', emoji: '🌙', label: 'Jantar', hour: '19:00 – 21:30', src: 'jantar' }];

function mtWeek(offset) {
  return MT_WD.map((wd, i) => {
    const d = new Date(MT_MONDAY);d.setDate(d.getDate() + offset * 7 + i);
    const idx = offset * 5 + i;
    return {
      key: d.toISOString().slice(0, 10), label: wd, day: String(d.getDate()).padStart(2, '0'),
      month: MT_MN[d.getMonth()], today: idx === MT_TODAY_IDX, past: idx < MT_TODAY_IDX,
      almoco: DEMO_WEEK[i].almoco, jantar: DEMO_WEEK[i].jantar
    };
  });
}

function MarcacoesTouch({ w = 1366, h = 768 }) {
  const compact = w < 1200;
  const [week, setWeek] = React.useState(0);
  const days = mtWeek(week);
  const [sel, setSel] = React.useState(mtWeek(0)[MT_TODAY_IDX].key);
  const [marks, setMarks] = React.useState(() => {
    const m = {};
    [...mtWeek(0), ...mtWeek(1)].forEach((d) => m[d.key] = { A: null, J: null });
    const w0 = mtWeek(0);
    m[w0[0].key] = { A: 0, J: null };m[w0[1].key] = { A: 2, J: 1 };m[w0[2].key] = { A: 1, J: null };
    m[w0[3].key] = { A: 1, J: null };m[w0[4].key] = { A: 0, J: 3 };
    return m;
  });
  const [toast, setToast] = React.useState(null);
  const tRef = React.useRef();
  const day = days.find((d) => d.key === sel) || days[0];
  const isLocked = (d, m) => d.past || d.today && m === 'A';

  const goWeek = (n) => {
    setWeek(n);
    const wk = mtWeek(n);
    setSel((wk.find((d) => !d.past) || wk[0]).key);
  };
  const flash = (msg) => {
    setToast(msg);clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(null), 2200);
  };
  const pick = (m, n) => {
    if (isLocked(day, m.key)) return;
    const cur = marks[day.key][m.key];
    const next = cur === n ? null : n;
    setMarks({ ...marks, [day.key]: { ...marks[day.key], [m.key]: next } });
    flash(next == null ? `${m.label} desmarcado` : `${m.label} marcado · ${MT_KINDS[n]}`);
  };
  const total = Object.entries(marks).reduce((a, [k, v]) => {
    const d = [...mtWeek(0), ...mtWeek(1)].find((x) => x.key === k);
    return d && !d.past ? a + (v.A != null) + (v.J != null) : a;
  }, 0);

  return (
    <div style={{ width: w, height: h, background: MT.bg, color: MT.text, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Top bar */}
      <div style={{ height: 84, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 0 }}>
          {!compact && <FFLogo size="sm" showSub={false} />}
          {!compact && <div style={{ width: 1, height: 40, background: MT.border }}></div>}
          <Avatar name={DEMO_FUNC.nome} size={52} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>Olá, Sofia</div>
            <div style={{ fontSize: 14, color: MT.sub, marginTop: 3 }}>Nº {DEMO_FUNC.numero} · {total} refeições marcadas</div>
          </div>
        </div>
        <button style={{ height: 60, padding: '0 26px', background: MT.surface, border: `2px solid ${MT.border}`, borderRadius: 14, color: MT.text, fontSize: 18, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
          <Icon name="logout" size={22} />Terminar
        </button>
      </div>

      {/* Week strip */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 8, height: 108, flexShrink: 0 }}>
        <MtArrow dir="l" disabled={week === 0} onClick={() => goWeek(week - 1)} />
        {days.map((d) => <MtDayChip key={d.key} d={d} on={d.key === day.key} m={marks[d.key]} locked={(k) => isLocked(d, k)} onClick={() => setSel(d.key)} />)}
        <MtArrow dir="r" disabled={week === MT_MAX_WEEKS - 1} onClick={() => goWeek(week + 1)} />
      </div>

      {/* Meal rows */}
      <div style={{ flex: 1, minHeight: 0, padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MT_MEALS.map((ml) => {
          const chosen = marks[day.key][ml.key];
          const locked = isLocked(day, ml.key);
          return (
            <div key={ml.key} style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `${compact ? 170 : 210}px repeat(4, minmax(0,1fr))`, gap: compact ? 10 : 12 }}>
              <div style={{ background: MT.base, border: `1px solid ${MT.borderSub}`, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{ml.emoji}</div>
                  <div style={{ fontSize: compact ? 26 : 30, fontWeight: 700, marginTop: 8, lineHeight: 1 }}>{ml.label}</div>
                  <div style={{ fontSize: 14, color: MT.sub, marginTop: 6 }}>{ml.hour}</div>
                </div>
                {locked ?
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: MT.sub, lineHeight: 1.3 }}>
                    <Icon name="lock" size={18} />{day.past ? 'Dia já passou' : 'Já não é possível alterar'}
                  </div> :
                chosen != null ?
                <button onClick={() => pick(ml, chosen)} style={{ height: 56, borderRadius: 12, background: 'transparent', border: `2px solid ${MT.border}`, color: MT.text, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Icon name="x" size={18} />Desmarcar
                  </button> :
                <div style={{ fontSize: 15, fontWeight: 700, color: MT.warn, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${MT.warn}` }}></span>Por marcar
                  </div>
                }
              </div>
              {day[ml.src].map((desc, n) =>
              <MtPrato key={n} kind={MT_KINDS[n]} desc={desc} compact={compact}
              selected={chosen === n} dim={chosen != null && chosen !== n || locked && chosen == null}
              locked={locked} onClick={() => pick(ml, n)} />
              )}
            </div>);
        })}
      </div>

      {toast &&
      <div style={{ position: 'absolute', left: '50%', bottom: 32, transform: 'translateX(-50%)', background: MT.text, color: MT.base, borderRadius: 14, padding: '16px 26px', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
          <Icon name="check" size={22} stroke={3} />{toast}
        </div>
      }
    </div>);
}

function MtArrow({ dir, disabled, onClick }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{ width: 60, flexShrink: 0, background: MT.surface, border: `2px solid ${MT.border}`, borderRadius: 16, color: MT.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1 }}>
      <Icon name={dir === 'l' ? 'chev-l' : 'chev-r'} size={30} />
    </button>);
}

// Chip em coluna: data em cima, indicadores A/J numa linha própria em baixo — nunca colidem com a margem.
function MtDayChip({ d, on, m, locked, onClick }) {
  const ink = on ? MT.base : MT.text;
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      background: on ? MT.accent : MT.surface, color: ink,
      border: `2px solid ${on ? MT.accent : MT.border}`, borderRadius: 16,
      padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      opacity: d.past && !on ? 0.5 : 1, overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{d.day}</span>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', opacity: on ? 0.75 : 0.6 }}>{d.label}</span>
        </div>
        {d.today && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', padding: '3px 6px', borderRadius: 6, background: on ? MT.base : MT.accent, color: on ? MT.accent : MT.base, flexShrink: 0 }}>HOJE</span>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {MT_MEALS.map((ml) => <MtPill key={ml.key} letter={ml.key} done={m[ml.key] != null} locked={locked(ml.key)} on={on} />)}
      </div>
    </button>);
}

function MtPill({ letter, done, locked, on }) {
  const bg = done ? on ? MT.base : MT.success : 'transparent';
  const fg = done ? on ? MT.accent : MT.base : on ? MT.base : MT.muted;
  const bd = done ? bg : on ? 'rgba(26,32,40,0.4)' : MT.border;
  return (
    <span style={{ flex: 1, minWidth: 0, height: 30, borderRadius: 8, background: bg, border: `2px solid ${bd}`, color: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13, fontWeight: 800 }}>
      {letter}{done && <Icon name={locked ? 'lock' : 'check'} size={13} stroke={3} />}
    </span>);
}

function MtPrato({ kind, desc, selected, dim, locked, compact, onClick }) {
  const cls = FF_PRATOS[kind].cls;
  return (
    <button onClick={onClick} style={{
      position: 'relative', textAlign: 'left', fontFamily: 'inherit', padding: 0, overflow: 'hidden',
      cursor: locked ? 'default' : 'pointer', borderRadius: 18, minWidth: 0,
      background: selected ? 'rgba(224,203,75,0.10)' : MT.surface,
      border: `3px solid ${selected ? MT.accent : MT.borderSub}`,
      opacity: dim ? locked ? 0.35 : 0.55 : 1,
      display: 'flex', flexDirection: 'column', minHeight: 0,
      transition: 'opacity .15s, border-color .15s, background .15s'
    }}>
      <div style={{ height: 50, flexShrink: 0, background: `var(--prato-${cls}-bg)`, borderBottom: `1px solid var(--prato-${cls}-bd)`, color: `var(--prato-${cls}-fg)`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
        <PratoGlyph kind={kind} size={20} />
        <span style={{ fontSize: compact ? 13 : 15, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kind}</span>
      </div>
      <div style={{ flex: 1, padding: '14px 16px', fontSize: compact ? 17 : 19, fontWeight: 500, lineHeight: 1.3, color: MT.text, textWrap: 'pretty', overflow: 'hidden' }}>{desc}</div>
      {selected &&
      <span style={{ position: 'absolute', right: 12, bottom: 12, height: 44, padding: compact ? '0 12px' : '0 16px 0 10px', borderRadius: 99, background: MT.accent, color: MT.base, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 800 }}>
          <Icon name={locked ? 'lock' : 'check'} size={20} stroke={3} />{!compact && 'Escolhido'}
        </span>
      }
    </button>);
}

window.MarcacoesTouchScreens = () => [
<DCArtboard key="t" id="marc-touch" label="Marcações v2 — touch-first · 1366×768 (interativo)" width={1366} height={768}><MarcacoesTouch /></DCArtboard>,
<DCArtboard key="t2" id="marc-touch-1024" label="Marcações v2 — touch-first · 1024×768 (interativo)" width={1024} height={768}><MarcacoesTouch w={1024} h={768} /></DCArtboard>];
