/* global React, DCArtboard, FF_PRATOS, Icon, PratoGlyph, FFLogo, Avatar, PratoTag, FF_DARK */
// ─────────────────────────────────────────────────────────────────────────────
// VALIDAÇÕES — POS touch 15", 1366×768. Three states shown side-by-side per variant.
// User pain: information needs to be MUCH BIGGER. We have space — use it.
// ─────────────────────────────────────────────────────────────────────────────

const T = FF_DARK;

// Header used by Refinada
function ValTopbar({ mealEmoji = '🌞', mealLabel = 'Almoço', date = 'Qui 05 Jun · 13:42', servedFor }) {
  return (
    <div style={{
      height: 64, background: T.surface, borderBottom: `1px solid ${T.border}`,
      padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <FFLogo size="sm" showSub={false} />
        <div style={{ width: 1, height: 28, background: T.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{mealEmoji}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{mealLabel}</span>
          <span style={{ fontSize: 13, color: T.muted, marginLeft: 4 }}>{date}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: T.successBg, border: `1px solid rgba(52,211,153,0.33)`,
          color: T.success, fontSize: 12, fontWeight: 700,
          padding: '5px 12px', borderRadius: 8, letterSpacing: '0.04em'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.success, boxShadow: '0 0 6px ' + T.success }} />
          LEITOR LIGADO
        </span>
        {servedFor && <span style={{ fontSize: 13, color: T.sub }}>Faltam servir: <strong style={{ color: T.text }}>{servedFor}</strong></span>}
      </div>
    </div>);

}

// ─── Right-side counters / recent panel (Refinada) ──────────────────────────
function CountersPanel() {
  const counters = [
  { kind: 'Carne', total: 48, served: 31 },
  { kind: 'Peixe', total: 22, served: 14 },
  { kind: 'Dieta', total: 9, served: 6 },
  { kind: 'Vegetariano', total: 14, served: 9 }];

  const recent = [
  { name: 'Ana Pinto', when: '13:41', kind: 'Carne', desc: 'Bife de vaca grelhado' },
  { name: 'Rui Lopes', when: '13:40', kind: 'Peixe', desc: 'Polvo à lagareiro' },
  { name: 'Marta Sá', when: '13:38', kind: 'Vegetariano', desc: 'Bowl de grão com courgette' }];

  return (
    <div style={{
      width: 332, background: T.surface, borderLeft: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: 0, overflow: 'hidden'
    }}>
      <div style={{ padding: '18px 20px 12px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Faltam servir
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {counters.map((c) => {
            const left = c.total - c.served;
            const pct = c.served / c.total;
            const cls = FF_PRATOS[c.kind].cls;
            return (
              <div key={c.kind} className={`prato-tag--${cls}`} style={{
                background: `var(--prato-${cls}-bg)`,
                border: `1px solid var(--prato-${cls}-bd)`,
                borderRadius: 10, padding: '10px 12px',
                display: 'flex', flexDirection: 'column', gap: 6
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <PratoTag label={c.kind} withGlyph />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 30, fontWeight: 900, color: `var(--prato-${cls}-fg)`, lineHeight: 1 }}>{left}</span>
                    <span style={{ fontSize: 12, color: T.muted }}>/ {c.total}</span>
                  </div>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 99, background: `var(--prato-${cls}-fg)`, opacity: 0.6 }} />
                </div>
              </div>);

          })}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 8px', fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Últimas validações
        </div>
        {recent.map((r, i) =>
        <div key={i} style={{ padding: '12px 20px', borderTop: i ? `1px solid ${T.borderSub}` : 'none', display: 'flex', gap: 12, alignItems: 'center' }}>
            <Avatar name={r.name} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{r.name}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{r.when} · {r.desc}</div>
            </div>
            <PratoTag label={r.kind} />
          </div>
        )}
      </div>
    </div>);

}

// ─── REFINADA: standby (big visual), success (huge name+plate), duplicate ───
function ValRefinadaStandby() {
  return (
    <div style={{ width: 1366, height: 768, background: T.bg, color: T.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      <ValTopbar servedFor="44 refeições" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{
            width: '100%', maxWidth: 680,
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 28, overflow: 'hidden'
          }}>
            <div style={{ padding: '64px 32px 56px', textAlign: 'center', position: 'relative' }}>
              {/* Pulsing rings */}
              <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 28px' }}>
                {[0, 0.6, 1.2].map((d) =>
                <div key={d} style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: `2px solid ${T.accent}`,
                  animation: `ff-pulse-ring 2s ease-out ${d}s infinite`
                }} />
                )}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(224,203,75,0.10)', border: `2px solid rgba(224,203,75,0.50)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name="card-tap" size={92} color={T.accent} stroke={1.6} />
                </div>
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, color: T.text, letterSpacing: '-0.005em', marginBottom: 8 }}>Encosta o cartão</div>
              <div style={{ fontSize: 18, color: T.sub }}>… ou introduz o teu código de funcionário</div>
            </div>
            <div style={{ borderTop: `1px solid ${T.border}`, padding: '18px 28px' }}>
              <button style={{
                width: '100%', height: 64, background: T.surface2,
                border: `1.5px solid ${T.border2}`, borderRadius: 14,
                fontSize: 17, fontWeight: 600, color: T.sub,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer'
              }}>
                <Icon name="users" size={20} /> Introduzir código manualmente
              </button>
            </div>
          </div>
        </div>
        <CountersPanel />
      </div>
    </div>);

}

function ValRefinadaSuccess() {
  const cls = FF_PRATOS.Carne.cls;
  return (
    <div style={{ width: 1366, height: 768, background: T.bg, color: T.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      <ValTopbar servedFor="43 refeições" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{
            width: '100%', maxWidth: 720,
            background: T.surface, border: `2px solid rgba(52,211,153,0.45)`,
            borderRadius: 28, padding: '36px 36px 38px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            boxShadow: '0 0 80px rgba(52,211,153,0.15)'
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', background: T.success,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 12px rgba(52,211,153,0.16)'
            }}>
              <Icon name="check" size={56} color={T.bg} stroke={3.4} />
            </div>
            <Avatar name="João Almeida" size={110} />
            <div style={{ fontSize: 38, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>João Almeida</div>
            <div style={{ fontSize: 14, color: T.muted, marginTop: -8 }}>Nº 028 · Produção · Turno 1</div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 18,
              background: `var(--prato-${cls}-bg)`, border: `1px solid var(--prato-${cls}-bd)`,
              borderRadius: 16, padding: '18px 24px', marginTop: 8, width: '100%', boxSizing: 'border-box'
            }}>
              <PratoTag label="Carne" size="xl" withGlyph />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.3, textWrap: 'pretty' }}>
                  Bife de vaca grelhado
                </div>
                <div style={{ fontSize: 15, color: T.sub, marginTop: 2 }}>batata frita e salada</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.muted, letterSpacing: '0.05em', marginTop: 2 }}>
              CONSUMO REGISTADO ÀS 13:42
            </div>
          </div>
        </div>
        <CountersPanel />
      </div>
    </div>);

}

function ValRefinadaDup() {
  const cls = FF_PRATOS.Peixe.cls;
  return (
    <div style={{ width: 1366, height: 768, background: T.bg, color: T.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      <ValTopbar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{
            width: '100%', maxWidth: 720,
            background: T.surface, border: `2px solid rgba(251,191,36,0.50)`,
            borderRadius: 28, padding: '32px 36px 36px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center'
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', background: 'rgba(251,191,36,0.18)',
              border: `2px solid ${T.warn}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name="warn" size={48} color={T.warn} stroke={2.4} />
            </div>
            <div style={{
              background: T.warnBg, border: `1px solid rgba(251,191,36,0.5)`,
              color: T.warn, fontSize: 17, fontWeight: 800, letterSpacing: '0.1em',
              padding: '8px 22px', borderRadius: 99, textTransform: 'uppercase'
            }}>Já consumiu esta refeição</div>
            <Avatar name="Marta Costa" size={92} />
            <div style={{ fontSize: 32, fontWeight: 800, color: T.text }}>Marta Costa</div>
            <div style={{ fontSize: 14, color: T.muted, marginTop: -10 }}>
              Validada às <strong style={{ color: T.sub }}>12:58</strong> · há 44 minutos
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: `var(--prato-${cls}-bg)`, border: `1px solid var(--prato-${cls}-bd)`,
              borderRadius: 14, padding: '14px 20px', marginTop: 4
            }}>
              <PratoTag label="Peixe" size="lg" withGlyph />
              <span style={{ fontSize: 17, color: T.text }}>Polvo à lagareiro com batata a murro</span>
            </div>
          </div>
        </div>
        <CountersPanel />
      </div>
    </div>);

}

// ─── ARROJADA: full-bleed takeover. Massive name + plate. ───────────────────
function ValArrojadaStandby() {
  const counts = [
  { kind: 'Carne', left: 17, total: 48 },
  { kind: 'Peixe', left: 8, total: 22 },
  { kind: 'Dieta', left: 3, total: 9 },
  { kind: 'Vegetariano', left: 5, total: 14 }];

  const recentes = [
  { name: 'Ana Pinto',     when: '13:41', kind: 'Carne',       desc: 'Bife de vaca grelhado' },
  { name: 'Rui Lopes',     when: '13:40', kind: 'Peixe',       desc: 'Polvo à lagareiro' },
  { name: 'Marta Sá',      when: '13:38', kind: 'Vegetariano', desc: 'Bowl de grão' },
  { name: 'João Almeida',  when: '13:35', kind: 'Dieta',       desc: 'Filete de pescada' },
  { name: 'Sofia Marques', when: '13:32', kind: 'Carne',       desc: 'Bife de vaca grelhado' }];

  return (
    <div style={{
      width: 1366, height: 768, background: '#0f1217', color: T.text,
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Slim top bar */}
      <div style={{
        height: 50, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, color: T.sub, fontSize: 12
      }}>
        <FFLogo size="sm" showSub={false} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13 }}>🌞 Almoço · Qui 05 Jun · <strong style={{ color: T.text }}>13:42</strong></span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: T.success, fontWeight: 700, fontSize: 11, letterSpacing: '0.06em'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.success, boxShadow: '0 0 6px ' + T.success }} />
            LEITOR LIGADO
          </span>
        </div>
      </div>

      {/* Main body: hero + últimas validações */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto 28px' }}>
              {[0, 0.7, 1.4].map((d) =>
              <div key={d} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${T.accent}`,
                animation: `ff-pulse-ring 2.4s ease-out ${d}s infinite`
              }} />
              )}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle at center, rgba(224,203,75,0.18) 0%, rgba(224,203,75,0.02) 70%)',
                border: `2px solid rgba(224,203,75,0.50)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name="card-tap" size={140} color={T.accent} stroke={1.4} />
              </div>
            </div>
            <div style={{
              fontSize: 72, lineHeight: 0.95,
              color: T.text, marginBottom: 8, letterSpacing: '-0.01em', fontFamily: "Outfit"
            }}>Encosta o cartão</div>
            <div style={{ fontSize: 18, color: T.sub, fontStyle: 'italic' }}>
              … ou pressiona qualquer tecla para introduzir o código
            </div>
          </div>
        </div>

        {/* Últimas validações */}
        <div style={{
          width: 300, background: '#16191f', borderLeft: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0
        }}>
          <div style={{
            padding: '16px 20px 12px', fontSize: 11, fontWeight: 700, color: T.muted,
            letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`
          }}>Últimas validações</div>
          {recentes.map((r, i) => {
            const cls = FF_PRATOS[r.kind]?.cls;
            return (
              <div key={i} style={{
                padding: '12px 20px', borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
                background: i === 0 ? '#1a1f27' : 'transparent'
              }}>
                <Avatar name={r.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: T.text,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{r.when} · {r.desc}</div>
                </div>
                <span className={`prato-tag prato-tag--${cls}`} style={{ fontSize: 10, padding: '2px 7px', flexShrink: 0 }}>
                  {r.kind === 'Vegetariano' ? 'Veg' : r.kind.slice(0, 3)}
                </span>
              </div>);

          })}
        </div>
      </div>

      {/* Bottom counter strip */}
      <div style={{
        borderTop: `1px solid ${T.border}`, background: '#16191f',
        padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0
      }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Faltam servir
        </div>
        {counts.map((c) => {
          const cls = FF_PRATOS[c.kind].cls;
          return (
            <div key={c.kind} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px',
              background: `var(--prato-${cls}-bg)`, border: `1px solid var(--prato-${cls}-bd)`,
              borderRadius: 99, flex: 1, justifyContent: 'space-between'
            }}>
              <PratoTag label={c.kind} withGlyph />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: `var(--prato-${cls}-fg)`, lineHeight: 1 }}>{c.left}</span>
                <span style={{ fontSize: 12, color: T.muted }}>/ {c.total}</span>
              </div>
            </div>);

        })}
      </div>
    </div>);

}

function ValArrojadaSuccess() {
  // Green takeover. Massive name. Huge plate. Photo (avatar) huge.
  const G = '#0d2e22';
  const G2 = '#0a3a2a';
  return (
    <div style={{
      width: 1366, height: 768, background: G, color: '#e8f9ec',
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
    }}>
      {/* Radial gloss */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 70% 30%, rgba(52,211,153,0.32) 0%, transparent 60%)'
      }} />

      {/* Tiny top */}
      <div style={{
        height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1, color: 'rgba(232,249,236,0.6)', fontSize: 12
      }}>
        <FFLogo size="sm" showSub={false} />
        <span>🌞 Almoço · 13:42</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '20px 56px 36px', gap: 48, position: 'relative', zIndex: 1 }}>
        {/* LEFT — Person */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flexShrink: 0, width: 360 }}>
          <Avatar name="João Almeida" size={220} ring="rgba(52,211,153,0.6)" />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 60, lineHeight: 1, color: '#fff', letterSpacing: '-0.01em', fontFamily: "Outfit"
            }}>João</div>
            <div style={{
              fontSize: 60, lineHeight: 1, color: '#fff', letterSpacing: '-0.01em', fontFamily: "Outfit"
            }}>Almeida</div>
            <div style={{ fontSize: 15, color: 'rgba(232,249,236,0.6)', marginTop: 10, letterSpacing: '0.04em' }}>
              Nº 028 · Produção
            </div>
          </div>
        </div>

        {/* RIGHT — Status */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{
              width: 132, height: 132, borderRadius: '50%', background: '#34d399',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 16px rgba(52,211,153,0.18), 0 24px 64px rgba(0,0,0,0.4)',
              flexShrink: 0
            }}>
              <Icon name="check" size={76} color={G} stroke={3.6} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(232,249,236,0.65)', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 6 }}>
                CONSUMO REGISTADO
              </div>
              <div style={{ fontSize: 96, lineHeight: 0.9, color: '#fff', fontFamily: "Outfit" }}>
                Bom apetite.
              </div>
            </div>
          </div>

          <div style={{
            background: G2, border: `1px solid rgba(52,211,153,0.3)`,
            borderRadius: 22, padding: '24px 28px', marginTop: 6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 6 }}>
              <PratoTag label="Carne" size="xl" withGlyph />
              <div style={{ fontSize: 13, color: 'rgba(232,249,236,0.5)', letterSpacing: '0.14em', fontWeight: 700 }}>
                · O TEU PRATO
              </div>
            </div>
            <div style={{
              fontSize: 42, lineHeight: 1.1, color: '#fff', marginTop: 8, fontFamily: "Outfit"
            }}>
              Bife de vaca grelhado
            </div>
            <div style={{ fontSize: 19, color: 'rgba(232,249,236,0.72)', marginTop: 4 }}>
              batata frita e salada
            </div>
          </div>
        </div>
      </div>
    </div>);

}

function ValArrojadaDup() {
  // Amber takeover
  const Y = '#2d2208';
  const Y2 = '#3a2c0a';
  return (
    <div style={{
      width: 1366, height: 768, background: Y, color: '#fef3c7',
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 30% 30%, rgba(251,191,36,0.28) 0%, transparent 60%)'
      }} />
      <div style={{
        height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1, color: 'rgba(254,243,199,0.65)', fontSize: 12
      }}>
        <FFLogo size="sm" showSub={false} />
        <span>🌞 Almoço · 13:42</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '20px 56px 36px', gap: 48, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flexShrink: 0, width: 360 }}>
          <Avatar name="Marta Costa" size={220} ring="rgba(251,191,36,0.55)" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, lineHeight: 1, color: '#fff', fontFamily: "Outfit" }}>Marta</div>
            <div style={{ fontSize: 60, lineHeight: 1, color: '#fff', fontFamily: "Outfit" }}>Costa</div>
            <div style={{ fontSize: 15, color: 'rgba(254,243,199,0.6)', marginTop: 10, letterSpacing: '0.04em' }}>
              Nº 015 · Comercial
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{
              width: 132, height: 132, borderRadius: '50%', background: '#fbbf24',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 16px rgba(251,191,36,0.18), 0 24px 64px rgba(0,0,0,0.4)',
              flexShrink: 0
            }}>
              <Icon name="warn" size={70} color={Y} stroke={3} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(254,243,199,0.65)', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 6 }}>
                JÁ FOI VALIDADA
              </div>
              <div style={{ fontSize: 84, lineHeight: 0.9, color: '#fff', fontFamily: "Outfit" }}>
                Calma aí.
              </div>
            </div>
          </div>
          <div style={{ background: Y2, border: `1px solid rgba(251,191,36,0.28)`, borderRadius: 22, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(254,243,199,0.55)', letterSpacing: '0.14em', fontWeight: 700 }}>
                REGISTADA ÀS 12:58 · HÁ 44 MINUTOS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10 }}>
              <PratoTag label="Peixe" size="xl" withGlyph />
              <div>
                <div style={{ fontSize: 32, color: '#fff', lineHeight: 1.1, fontFamily: "Outfit" }}>Polvo à lagareiro</div>
                <div style={{ fontSize: 16, color: 'rgba(254,243,199,0.7)', marginTop: 2 }}>com batata a murro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}

// ─── ARROJADA: SEM MARCAÇÃO — red takeover, prato selection ─────────────────
function ValArrojadaSemMarcacao() {
  const R = '#2a1315';
  const R2 = '#371619';
  const R3 = '#3f1c1f';

  const pratos = [
  { kind: 'Carne',       desc: 'Frango assado com arroz de pato' },
  { kind: 'Peixe',       desc: 'Polvo à lagareiro com batata a murro' },
  { kind: 'Dieta',       desc: 'Filete de pescada cozido com legumes' },
  { kind: 'Vegetariano', desc: 'Bowl de grão com courgette grelhada' }];

  return (
    <div style={{
      width: 1366, height: 768, background: R, color: '#fee2e2',
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 70% 30%, rgba(248,113,113,0.26) 0%, transparent 60%)'
      }} />
      <div style={{
        height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1, color: 'rgba(254,226,226,0.6)', fontSize: 12
      }}>
        <FFLogo size="sm" showSub={false} />
        <span>🌞 Almoço · 13:42</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '16px 48px 28px', gap: 40, position: 'relative', zIndex: 1 }}>
        {/* LEFT — Person */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0, width: 300 }}>
          <Avatar name="Pedro Nunes" size={180} ring="rgba(248,113,113,0.55)" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, lineHeight: 1, color: '#fff', letterSpacing: '-0.01em', fontFamily: "Outfit" }}>Pedro</div>
            <div style={{ fontSize: 52, lineHeight: 1, color: '#fff', letterSpacing: '-0.01em', fontFamily: "Outfit" }}>Nunes</div>
            <div style={{ fontSize: 14, color: 'rgba(254,226,226,0.6)', marginTop: 8, letterSpacing: '0.04em' }}>
              Nº 061 · Logística
            </div>
          </div>
        </div>

        {/* RIGHT — Status + prato selection */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', background: '#f87171',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 12px rgba(248,113,113,0.16), 0 16px 48px rgba(0,0,0,0.4)',
              flexShrink: 0
            }}>
              <Icon name="x" size={54} color={R} stroke={3.4} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(254,226,226,0.6)', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 4 }}>
                SEM MARCAÇÃO PRÉVIA
              </div>
              <div style={{ fontSize: 56, lineHeight: 0.95, color: '#fff', fontFamily: "Outfit" }}>
                Sem marcação.
              </div>
            </div>
          </div>

          <div style={{ background: R2, border: `1px solid rgba(248,113,113,0.22)`, borderRadius: 20, padding: '18px 20px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(254,226,226,0.65)',
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12
            }}>Escolhe o prato a servir</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {pratos.map(({ kind, desc }) => {
                const cls = FF_PRATOS[kind].cls;
                return (
                  <button key={kind} style={{
                    textAlign: 'left', cursor: 'pointer',
                    background: R3, border: `1px solid rgba(248,113,113,0.18)`,
                    borderRadius: 14, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 8
                  }}>
                    <span className={`prato-tag prato-tag--${cls}`}>
                      <PratoGlyph kind={kind} size={13} />{kind}
                    </span>
                    <div style={{ fontSize: 14, lineHeight: 1.3, color: '#fff', fontWeight: 500, textWrap: 'pretty' }}>
                      {desc}
                    </div>
                  </button>);

              })}
            </div>
          </div>
        </div>
      </div>
    </div>);

}

// ─── ARROJADA: SERVIÇO ENCERRADO — calm neutral standby, out of hours ───────
function ValArrojadaEncerrada() {
  return (
    <div style={{
      width: 1366, height: 768, background: '#0f1217', color: T.text,
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Slim top bar */}
      <div style={{
        height: 50, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, color: T.sub, fontSize: 12
      }}>
        <FFLogo size="sm" showSub={false} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13 }}>Qui 05 Jun · <strong style={{ color: T.text }}>15:08</strong></span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: T.muted, fontWeight: 700, fontSize: 11, letterSpacing: '0.06em'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.muted }} />
            LEITOR EM PAUSA
          </span>
        </div>
      </div>

      {/* Hero block */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            width: 200, height: 200, margin: '0 auto 36px', borderRadius: '50%',
            background: 'rgba(108,118,128,0.10)', border: `2px solid rgba(108,118,128,0.40)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon name="clock" size={104} color={T.muted} stroke={1.4} />
          </div>
          <div style={{
            fontSize: 84, lineHeight: 0.95,
            color: T.text, marginBottom: 14, letterSpacing: '-0.01em', fontFamily: "Outfit"
          }}>Serviço encerrado</div>
          <div style={{ fontSize: 21, color: T.sub, lineHeight: 1.5, maxWidth: 620, margin: '0 auto' }}>
            O almoço terminou às <strong style={{ color: T.text }}>14:30</strong>.
          </div>

          {/* Next service pill */}
          <div style={{
            marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 16,
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 99, padding: '14px 26px'
          }}>
            <span style={{ fontSize: 24 }}>🌙</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: T.muted, letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>
                Próximo serviço
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 2, whiteSpace: 'nowrap' }}>
                Jantar · abre às 19:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}

window.ValidacoesScreens = () => [
<DCArtboard key="a-sb" id="val-a-sb" label="Validações — Standby (tela cheia)" width={1366} height={768}><ValArrojadaStandby /></DCArtboard>,
<DCArtboard key="a-ok" id="val-a-ok" label="Validações — Sucesso (takeover verde)" width={1366} height={768}><ValArrojadaSuccess /></DCArtboard>,
<DCArtboard key="a-dup" id="val-a-dup" label="Validações — Já consumiu (takeover âmbar)" width={1366} height={768}><ValArrojadaDup /></DCArtboard>,
<DCArtboard key="a-no" id="val-a-no" label="Validações — Sem marcação (takeover vermelho)" width={1366} height={768}><ValArrojadaSemMarcacao /></DCArtboard>,
<DCArtboard key="a-off" id="val-a-off" label="Validações — Serviço encerrado (standby neutro)" width={1366} height={768}><ValArrojadaEncerrada /></DCArtboard>];