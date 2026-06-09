/* global React, DCArtboard, Icon, FFLogo, Avatar, FF_DARK */
// ─────────────────────────────────────────────────────────────────────────────
// LOGIN + MODE SELECTOR — POS touch 15", 1366×768
// ─────────────────────────────────────────────────────────────────────────────

const LT = FF_DARK;

// ─── Keypad ───────────────────────────────────────────────────────────────
function Keypad({ value, size = 'lg' }) {
  const cellH = size === 'xl' ? 96 : 80;
  const cellFs = size === 'xl' ? 30 : 26;
  const cell = {
    height: cellH, fontSize: cellFs, fontWeight: 500,
    background: LT.surface2, border: `1.5px solid ${LT.border}`,
    borderRadius: 14, color: LT.text, cursor: 'pointer',
    fontFamily: 'inherit'
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 11 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <button key={d} style={cell}>{d}</button>)}
      <button style={{ ...cell, fontSize: cellFs * 0.7, color: LT.sub }}>⌫</button>
      <button style={cell}>0</button>
      <button style={{ ...cell, background: LT.accent, border: 'none', color: '#1a2028', fontWeight: 800 }}>→</button>
    </div>);

}

// ─── REFINADA Login (code entry) ─────────────────────────────────────────
function LoginRefinada() {
  const value = '042';
  return (
    <div style={{
      width: 1366, height: 768, background: LT.bg, color: LT.text,
      fontFamily: 'var(--font-sans)', display: 'flex', overflow: 'hidden'
    }}>
      {/* LEFT — Branding panel */}
      <div style={{
        width: 526, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1a2028 0%, #222b34 50%, #29333d 100%)',
        display: 'flex', flexDirection: 'column', padding: '46px 48px', justifyContent: 'space-between'
      }}>
        {/* Deco SVG */}
        <svg style={{ position: 'absolute', right: -120, bottom: -120, opacity: 0.10, width: 600, height: 600 }} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="60" stroke="#e0cb4b" strokeWidth="2" fill="none" />
          <path d="M 60 100 A 40 40 0 0 1 140 100" stroke="#94a3b8" strokeWidth="2" fill="none" />
          <circle cx="100" cy="100" r="6" fill="#e0cb4b" />
        </svg>
        <FFLogo size="lg" />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: LT.text, lineHeight: 1.15, letterSpacing: '-0.005em', marginBottom: 12 }}>
            Bem-vindo
          </div>
          <div style={{ fontSize: 16, color: LT.sub, lineHeight: 1.5, maxWidth: 420 }}>
            Encosta o cartão ou introduz o teu código de funcionário para marcar refeições.
          </div>
          <div style={{
            marginTop: 36, padding: '14px 18px',
            background: 'rgba(224,203,75,0.10)', border: `1px solid rgba(224,203,75,0.32)`,
            borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, maxWidth: 380
          }}>
            <Icon name="card-tap" size={28} color={LT.accent} stroke={1.6} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: LT.accent, letterSpacing: '0.04em' }}>LEITOR RFID ATIVO</div>
              <div style={{ fontSize: 12, color: LT.sub, marginTop: 2 }}>Encosta o cartão à qualquer altura</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: LT.muted, letterSpacing: '0.05em' }}>
          Terminal de Marcações · 05 Jun 2026 · 09:42
        </div>
      </div>

      {/* RIGHT — Code entry */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 460 }}>
          <div style={{ fontSize: 14, color: LT.muted, marginBottom: 10, letterSpacing: '0.04em' }}>
            Código de funcionário
          </div>
          <div style={{
            background: LT.surface2, border: `2px solid ${LT.border2}`,
            borderRadius: 14, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 22, overflow: 'hidden'
          }}>
            <span style={{ fontSize: 42, letterSpacing: 10, color: LT.accent, fontWeight: 700 }}>{value}</span>
          </div>
          <Keypad value={value} />
          <div style={{ marginTop: 22, fontSize: 12, color: LT.muted, textAlign: 'center' }}>
            Podes usar o teclado físico para introduzir o código
          </div>
        </div>
      </div>
    </div>);

}

// ─── ARROJADA Login ─────────────────────────────────────────────────────
function LoginArrojada() {
  const C = { bg: '#151920', card: '#1a2028', surf: '#29333d', border: '#3a4550', ink: '#e8ecef', ink2: '#a4adb6', ink3: '#6c7680', accent: '#e0cb4b', accentText: '#1a2028', mustard: '#e0cb4b' };
  const value = '042';
  const cell = {
    height: 90, fontSize: 30, fontWeight: 500,
    background: C.surf, border: `1px solid ${C.border}`,
    borderRadius: 18, color: C.ink, cursor: 'pointer',
    fontFamily: 'inherit'
  };

  return (
    <div style={{
      width: 1366, height: 768, background: C.bg, color: C.ink,
      fontFamily: 'var(--font-sans)', display: 'flex', overflow: 'hidden', position: 'relative'
    }}>
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 80% 10%, rgba(224,203,75,0.16) 0%, transparent 55%)'
      }} />

      {/* Top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '24px 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1
      }}>
        <FFLogo size="sm" theme="dark" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: C.ink3 }}>
          <span>Terminal · 05 Jun · 09:42</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#34d399', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            RFID ATIVO
          </span>
        </div>
      </div>

      {/* Hero + Keypad */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '64px 80px 32px', gap: 80, position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            Bom dia 👋
          </div>
          <div style={{
            fontSize: 132, lineHeight: 0.9, color: C.ink,
            letterSpacing: '-0.01em', marginBottom: 4, fontFamily: "Outfit"
          }}>Olá.</div>
          <div style={{
            fontStyle: 'italic', fontSize: 56, lineHeight: 1.05, color: C.ink2, fontFamily: "Outfit"
          }}>Quem é que vai comer?</div>

          {/* RFID card */}
          <div style={{
            marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 18,
            background: C.card, border: `1px solid ${C.border}`,
            padding: '16px 22px', borderRadius: 16
          }}>
            <div style={{ position: 'relative', width: 56, height: 56 }}>
              {[0, 0.5, 1].map((d) =>
              <div key={d} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `1.5px solid ${C.mustard}`,
                animation: `ff-pulse-ring 2s ease-out ${d}s infinite`
              }} />
              )}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(241,213,107,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name="card-tap" size={28} color={C.accent} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Encosta o cartão</div>
              <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>… ou usa o teclado ao lado</div>
            </div>
          </div>
        </div>

        {/* Keypad — light */}
        <div style={{ width: 380 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
            Código
          </div>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 18, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16
          }}>
            <span style={{ fontSize: 56, letterSpacing: 8, color: C.ink, lineHeight: 1, fontFamily: "Outfit" }}>{value}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <button key={d} style={cell}>{d}</button>)}
            <button style={{ ...cell, fontSize: 24, color: C.ink3 }}>⌫</button>
            <button style={cell}>0</button>
            <button style={{ ...cell, background: C.accent, border: 'none', color: C.accentText, fontWeight: 800 }}>→</button>
          </div>
        </div>
      </div>
    </div>);

}

// ─── Mode selector ──────────────────────────────────────────────────────
function ModeSelectorRefinada() {
  const modes = [
  { key: 'marcacoes', icon: 'calendar', label: 'Terminal de Marcações', desc: 'Funcionários marcam refeições' },
  { key: 'validacoes', icon: 'card-tap', label: 'Terminal de Validações', desc: 'Cozinha valida consumos (RFID)' },
  { key: 'backoffice', icon: 'chart', label: 'Backoffice', desc: 'Ementas, funcionários, relatórios' }];

  return (
    <div style={{
      width: 1366, height: 768, background: LT.bg, color: LT.text,
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 28, overflow: 'hidden'
    }}>
      <FFLogo size="lg" />
      <div style={{ fontSize: 14, color: LT.muted, marginTop: -16, letterSpacing: '0.05em' }}>
        Escolhe um modo
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
        {modes.map((m) =>
        <button key={m.key} style={{
          width: 280, padding: '32px 26px', cursor: 'pointer',
          background: LT.surface, border: `1.5px solid ${LT.border}`,
          borderRadius: 18, textAlign: 'left',
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
            <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: LT.accentSoft, border: `1.5px solid rgba(224,203,75,0.36)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <Icon name={m.icon} size={28} color={LT.accent} stroke={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: LT.text, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 13, color: LT.sub, lineHeight: 1.45 }}>{m.desc}</div>
            </div>
          </button>
        )}
      </div>
    </div>);

}

function ModeSelectorArrojada() {
  const C = { bg: '#151920', card: '#1a2028', surf: '#29333d', border: '#3a4550', ink: '#e8ecef', ink2: '#a4adb6', ink3: '#6c7680', accent: '#e0cb4b', accentText: '#1a2028' };
  const modes = [
  { key: 'marcacoes', icon: 'calendar', label: 'Marcações', desc: 'Funcionários marcam refeições' },
  { key: 'validacoes', icon: 'card-tap', label: 'Validações', desc: 'Cozinha valida consumos' },
  { key: 'backoffice', icon: 'chart', label: 'Backoffice', desc: 'Ementas e relatórios' }];

  return (
    <div style={{
      width: 1366, height: 768, background: C.bg, color: C.ink,
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative'
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 90% 90%, rgba(224,203,75,0.14) 0%, transparent 55%)'
      }} />
      <div style={{ padding: '32px 40px 0', position: 'relative', zIndex: 1 }}>
        <FFLogo size="lg" theme="dark" />
      </div>
      <div style={{
        flex: 1, padding: '32px 80px', position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Qual destes és tu hoje?
        </div>
        <div style={{ fontStyle: 'italic', fontSize: 72, color: C.ink, marginTop: 8, lineHeight: 1, marginBottom: 36, fontFamily: "Outfit", textAlign: "left" }}>
          Escolhe um terminal.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {modes.map((m, i) =>
          <button key={m.key} style={{
            cursor: 'pointer', textAlign: 'left',
            background: i === 0 ? C.accent : C.card,
            color: i === 0 ? C.accentText : C.ink,
            border: `1.5px solid ${i === 0 ? C.accent : C.border}`,
            borderRadius: 24, padding: '32px 28px',
            display: 'flex', flexDirection: 'column', gap: 28, minHeight: 280,
            position: 'relative', overflow: 'hidden'
          }}>
              <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: i === 0 ? 'rgba(26,32,40,0.14)' : C.surf,
              color: i === 0 ? C.accentText : C.ink2,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon name={m.icon} size={32} stroke={1.6} />
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', color: i === 0 ? 'rgba(26,32,40,0.55)' : C.ink3, marginBottom: 8 }}>
                  TERMINAL {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 8, fontFamily: "Outfit" }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 14, color: i === 0 ? 'rgba(26,32,40,0.7)' : C.ink2, lineHeight: 1.4 }}>{m.desc}</div>
              </div>
              <Icon name="arrow-r" size={24} color={i === 0 ? C.accentText : C.accent}
            style={{ position: 'absolute', top: 32, right: 28 }} />
            </button>
          )}
        </div>
      </div>
    </div>);

}

window.LoginScreens = () => [
<DCArtboard key="login-a" id="login-a" label="Login — final (layout Arrojada · paleta GI escura)" width={1366} height={768}>
    <LoginArrojada />
  </DCArtboard>,
<DCArtboard key="ms-a" id="ms-a" label="Seletor de modo — final" width={1366} height={768}>
    <ModeSelectorArrojada />
  </DCArtboard>];