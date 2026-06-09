/* global React */
// FoodFlow shared primitives: icons (Lucide-shaped), logo, plate chips, avatars.
// All exported to window for use in screen files.

const FF_PRATOS = {
  Carne:       { cls: 'carne', label: 'Carne' },
  Peixe:       { cls: 'peixe', label: 'Peixe' },
  Dieta:       { cls: 'dieta', label: 'Dieta' },
  Vegetariano: { cls: 'veg',   label: 'Vegetariano' },
};

// ── Lucide-style icons, written by hand to match stroke 1.8 ──────────────
function Icon({ name, size = 18, stroke = 1.8, color = 'currentColor', style }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
    style,
  };
  switch (name) {
    case 'calendar': return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'users':    return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'chart':    return <svg {...common}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
    case 'logout':   return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    case 'check':    return <svg {...common} strokeWidth={stroke + 0.7}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'check-circle': return <svg {...common}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case 'warn':     return <svg {...common}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'card':     return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    case 'card-tap': return <svg {...common}><rect x="2" y="6" width="14" height="12" rx="2"/><line x1="2" y1="10" x2="16" y2="10"/><path d="M19 8c1 1.3 1 5.7 0 7"/><path d="M22 5c2 2.5 2 11.5 0 14"/></svg>;
    case 'list':     return <svg {...common}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case 'gear':     return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'plus':     return <svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'edit':     return <svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>;
    case 'trash':    return <svg {...common}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
    case 'copy':     return <svg {...common}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
    case 'chev-l':   return <svg {...common}><polyline points="15 18 9 12 15 6"/></svg>;
    case 'chev-r':   return <svg {...common}><polyline points="9 18 15 12 9 6"/></svg>;
    case 'chev-d':   return <svg {...common}><polyline points="6 9 12 15 18 9"/></svg>;
    case 'lock':     return <svg {...common}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case 'clock':    return <svg {...common}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'search':   return <svg {...common}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'eye':      return <svg {...common}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'arrow-r':  return <svg {...common}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'fork':     return <svg {...common}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 .55.45 1 1 1h3m0 0v7"/></svg>;
    case 'sun':      return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
    case 'moon':     return <svg {...common}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
    case 'utensils': return <svg {...common}><path d="M3 2v7c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V2"/><path d="M5 2v20"/><path d="M21 9c0 1.66-1.34 3-3 3l-1-3V2c2.21 0 4 1.79 4 4z"/><path d="M18 12v10"/></svg>;
    case 'x':        return <svg {...common}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'flame':    return <svg {...common}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
    case 'fish':     return <svg {...common}><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/></svg>;
    case 'leaf':     return <svg {...common}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1 1.51 2 5.5 0 9.8-2 4-7.3 6.2-12.2 6.2"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>;
    case 'salad':    return <svg {...common}><path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/></svg>;
    case 'history':  return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>;
    case 'percent':  return <svg {...common}><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
    case 'home':     return <svg {...common}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'menu':     return <svg {...common}><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    case 'wifi':     return <svg {...common}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
    case 'cal-plus': return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>;
    default: return null;
  }
}

// Pratos: small SVG glyph variations (used as decorative chip leading)
function PratoGlyph({ kind, size = 16 }) {
  const map = { Carne: 'flame', Peixe: 'fish', Dieta: 'salad', Vegetariano: 'leaf' };
  return <Icon name={map[kind] || 'utensils'} size={size} stroke={1.8}/>;
}

// ── Logo ──────────────────────────────────────────────────────────────────
function FFLogo({ size = 'md', showSub = true, theme = 'dark' }) {
  const ink = theme === 'light' ? '#1c1916' : '#e8ecef';
  const sub = theme === 'light' ? '#8f8675' : '#8d9190';
  const accent = theme === 'light' ? '#b8a800' : '#e0cb4b';
  const tileInk = theme === 'light' ? '#1a2028' : '#1a2028';
  const z = size === 'lg' ? { i: 40, gi: 18, ff: 14, s: 11 }
          : size === 'sm' ? { i: 30, gi: 14, ff: 11, s: 10 }
          : { i: 36, gi: 16, ff: 12, s: 10 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: z.i, height: z.i, borderRadius: 9, background: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: tileInk,
      }}>
        <Icon name="utensils" size={z.i * 0.55} stroke={2.2}/>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: z.gi, fontWeight: 900, color: accent, letterSpacing: '0.06em' }}>GI</span>
          <span style={{ fontSize: z.gi * 0.55, color: sub, fontWeight: 500 }}>·</span>
          <span style={{ fontSize: z.ff, fontWeight: 800, color: ink, letterSpacing: '0.15em' }}>FOODFLOW</span>
        </div>
        {showSub && <div style={{ fontSize: z.s, color: sub, marginTop: 2, letterSpacing: '0.02em' }}>Gestão de cantina</div>}
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────
const FF_AVATAR_COLORS = [
  ['#4a3a86', '#cdbef0'], ['#1f5e8a', '#bee0f5'], ['#1e6b48', '#c0eed7'],
  ['#7a3d20', '#f4cdb6'], ['#5d2e58', '#f0c9e9'], ['#7a5a05', '#fde9a8'],
];
function ffHash(s) { let h = 0; for (const c of s || '') h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }

function Avatar({ name = 'A B', size = 40, theme = 'dark', ring }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const [bg, fg] = theme === 'light'
    ? FF_AVATAR_COLORS[ffHash(name) % FF_AVATAR_COLORS.length].slice().reverse()
    : FF_AVATAR_COLORS[ffHash(name) % FF_AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      boxShadow: ring ? `0 0 0 ${Math.max(2, size * 0.05)}px ${ring}` : 'none',
      letterSpacing: '0.02em',
    }}>{initials}</div>
  );
}

// ── PratoTag ──────────────────────────────────────────────────────────────
function PratoTag({ label, size = 'sm', light = false, withGlyph = false }) {
  const p = FF_PRATOS[label] || { cls: 'carne', label };
  const cls = `prato-tag${size === 'lg' ? ' prato-tag--lg' : size === 'xl' ? ' prato-tag--xl' : ''}${light ? ' prato-tag--light' : ''} prato-tag--${p.cls}`;
  return (
    <span className={cls}>
      {withGlyph && <PratoGlyph kind={label} size={size === 'xl' ? 20 : size === 'lg' ? 15 : 12}/>}
      {p.label}
    </span>
  );
}

// ── DiagonalBackdrop — used in bold variant for hero areas ────────────────
function BoldBackdrop({ tone = 'dark' }) {
  if (tone === 'cream') {
    return (
      <svg viewBox="0 0 800 600" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55, pointerEvents: 'none' }}>
        <defs>
          <radialGradient id="bd-cream-1" cx="0.85" cy="0.15" r="0.7">
            <stop offset="0%" stopColor="#f1d56b" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#f1d56b" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill="url(#bd-cream-1)"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5, pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="bd-dark-1" cx="0.85" cy="0.1" r="0.6">
          <stop offset="0%" stopColor="#e0cb4b" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#e0cb4b" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bd-dark-1)"/>
    </svg>
  );
}

// ── DateHeader + helpers ──────────────────────────────────────────────────
const WD_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const WD_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MN_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// ── ARR — "Arrojada" layout dressed in the dark GI (Refinada) palette ──────
// Mirrors the cream-palette keys used by the bold screens, but charcoal+mustard.
const ARR = {
  bg: '#151920', card: '#1a2028', surf: '#222b34', surf2: '#29333d',
  border: '#3a4550', border2: '#475260', borderSub: '#2e3940',
  ink: '#e8ecef', ink2: '#a4adb6', ink3: '#6c7680',
  accent: '#e0cb4b', accentText: '#1a2028',
  accentSoft: 'rgba(224,203,75,0.12)', accentBd: 'rgba(224,203,75,0.42)',
  success: '#34d399', successBg: '#0d2e22', successBd: '#1a5c3a',
};

Object.assign(window, {
  Icon, PratoGlyph, FFLogo, Avatar, PratoTag, BoldBackdrop,
  FF_PRATOS, WD_FULL, WD_SHORT, MN_SHORT, ffHash, ARR,
});
