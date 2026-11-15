// ep03.js — "¿Y si te tocará engañar a Hitler?" Operation Fortitude + Garbo. Scenes added to S.
import { ease, clamp, lerp, rng, alpha, shade } from '/engine/core.js';
import { POSES, posesAt, walkPose } from '/engine/rig2d.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from './lib.js';
import { S, CAST, BG } from './director.js';
const { W, H, GY, R, P, C, O, L, T, OL, guy } = K;

// ---------- cast ----------
const TOMI_BR = { top: 'uniform', color: '#7a6e4a', legs: '#6a5f40', shoes: '#2a1f18', belt: '#4a3a24', hair: 'side', hairColor: '#2e2420', hat: 'beret', hatColor: '#3a3a5a' };
const ARTIST = (c, h, hc) => ({ top: 'shirt', color: c, legs: '#4a4a52', shoes: '#2a1f18', hair: h, hairColor: hc });
const RADIO = { top: 'uniform', color: '#6a6e52', legs: '#5a5e44', shoes: '#2a1f18', hair: 'side', hairColor: '#4a3020' };
const PATTON = { top: 'uniform', color: '#6b6f4a', legs: '#7a6a50', shoes: '#3a2418', belt: '#4a3a24', hair: 'none', hat: 'helmet', hatColor: '#3f4a3a' };
const IKE = { top: 'uniform', color: '#6b6f4a', legs: '#6b6f4a', shoes: '#3a2418', hair: 'side', hairColor: '#d8cfbf' };
const GARBO = { top: 'suit', color: '#3a3a44', color2: '#7a2a2a', legs: '#3a3a44', shoes: '#1a1a1e', hair: 'side', hairColor: '#1e1a18', mustache: true, mustacheColor: '#1e1a18' };
const GARBO_OLD = { ...GARBO, hairColor: '#d8d2c4', mustacheColor: '#d8d2c4', color: '#5a5a62' };
const HARRIS = { top: 'suit', color: '#5a4a3a', color2: '#2a3a5a', legs: '#5a4a3a', shoes: '#1a1a1e', hair: 'side', hairColor: '#3a2a20', face: 'glasses' };
const GERMAN_OFF = { top: 'uniform', color: '#6a6e6a', legs: '#4a4e4a', shoes: '#111', belt: '#2a2a22', hair: 'side', hairColor: '#c9a060', hat: 'cap', hatColor: '#5a5e5a' };
const GERMAN_SOL = { top: 'uniform', color: '#6a6e62', legs: '#4a4e44', belt: '#2a2a22', hair: 'none', hat: 'helmet', hatColor: '#5a5e52' };
const ARACELI = { top: 'sweater', color: '#8a3a4a', legs: '#4a3a3a', shoes: '#2a1f18', hair: 'bun', hairColor: '#2a1a14' };
const BOBBY = { top: 'suit', color: '#1f2a44', color2: '#1f2a44', legs: '#1f2a44', hair: 'none', hat: 'helmet', hatColor: '#1f2a44' };
const MI5 = { top: 'suit', color: '#2f3a4a', color2: '#5a2a2a', legs: '#2f3a4a', shoes: '#111', hair: 'side', hairColor: '#5a4a3a' };
Object.assign(CAST, { tomiBr: TOMI_BR, garbo: GARBO, garboOld: GARBO_OLD, ike: IKE, patton: PATTON, araceli: ARACELI, harris: HARRIS, german: GERMAN_OFF });
const pop = K.pop, S_ = (t, a, d = 0.35) => (t < a ? 0 : pop(t, a, d));
const label = (g, t, s, x, y, at, size = 56, col = '#f2e94a') => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); T(g, s, 0, 0, size, col); g.restore(); };
function stamp(g, t, str, x, y, at, o = {}) {
  const lt = t - at; if (lt < 0) return; const col = o.col || '#c0392b', size = o.size || 64, k = lt < 0.16 ? 2 - lt / 0.16 : 1;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.1); g.scale(k, k); g.font = `700 ${size}px "Fredoka"`; const w = g.measureText(str).width + size * 0.9;
  if (o.fill) { g.fillStyle = o.fill; g.fillRect(-w / 2, -size * 0.75, w, size * 1.5); } g.strokeStyle = col; g.lineWidth = size * 0.1; g.strokeRect(-w / 2, -size * 0.75, w, size * 1.5);
  T(g, str, 0, 2, size, col, { stroke: 0 }); g.restore();
}
const xMark = (g, x, y, r, p) => { if (p <= 0) return; g.save(); g.strokeStyle = '#c0392b'; g.lineWidth = r * 0.22; g.lineCap = 'round'; const a = clamp(p * 2), b = clamp(p * 2 - 1); g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); g.stroke(); if (b > 0) { g.beginPath(); g.moveTo(x + r, y - r); g.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); g.stroke(); } g.restore(); };
const check = (g, x, y, r, p) => { if (p <= 0) return; g.save(); g.strokeStyle = '#2a8a4a'; g.lineWidth = r * 0.25; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r * 0.3, y + r * 0.7 * clamp(p * 2)); if (p > 0.5) g.lineTo(x - r * 0.3 + r * 1.3 * clamp(p * 2 - 1), y + r * 0.7 - r * 1.5 * clamp(p * 2 - 1)); g.stroke(); g.restore(); };

// ---------- flags (no nazi symbols: Germany shown with the military cross) ----------
function flag(g, x, y, w, kind, t = 0) {
  const h = w * 0.62; g.save(); g.translate(x, y); g.transform(1, Math.sin(t * 3) * 0.03, 0, 1, 0, 0);
  if (kind === 'uk') { R(g, -w / 2, -h / 2, w, h, '#1f3a8a', 0); g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); g.strokeStyle = '#fff'; g.lineWidth = h * 0.2; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, h / 2); g.moveTo(w / 2, -h / 2); g.lineTo(-w / 2, h / 2); g.stroke(); g.strokeStyle = '#c8102e'; g.lineWidth = h * 0.07; g.stroke(); g.restore(); R(g, -w * 0.09, -h / 2, w * 0.18, h, '#fff', 0); R(g, -w / 2, -h * 0.15, w, h * 0.3, '#fff', 0); R(g, -w * 0.05, -h / 2, w * 0.1, h, '#c8102e', 0); R(g, -w / 2, -h * 0.09, w, h * 0.18, '#c8102e', 0); }
  if (kind === 'us') { for (let i = 0; i < 7; i++) R(g, -w / 2, -h / 2 + i * h / 7, w, h / 7, i % 2 ? '#fff' : '#b22234', 0); R(g, -w / 2, -h / 2, w * 0.42, h * 0.54, '#3c3b6e', 0); }
  if (kind === 'de') { R(g, -w / 2, -h / 2, w, h, '#6a6e62', 0); const c = h * 0.32; R(g, -c * 0.25, -c, c * 0.5, c * 2, '#111', 0); R(g, -c, -c * 0.25, c * 2, c * 0.5, '#111', 0); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(-c * 0.25, -c, c * 0.5, c * 2); g.strokeRect(-c, -c * 0.25, c * 2, c * 0.5); }
  if (kind === 'es') { R(g, -w / 2, -h / 2, w, h / 4, '#aa151b', 0); R(g, -w / 2, -h / 4, w, h / 2, '#f1bf00', 0); R(g, -w / 2, h / 4, w, h / 4, '#aa151b', 0); }
  if (kind === 'pt') { R(g, -w / 2, -h / 2, w * 0.4, h, '#046a38', 0); R(g, -w * 0.1, -h / 2, w * 0.6, h, '#da291c', 0); C(g, -w * 0.1, 0, h * 0.18, '#ffe14a', 3); }
  if (kind === 'fr') { R(g, -w / 2, -h / 2, w / 3, h, '#002654', 0); R(g, -w / 6, -h / 2, w / 3, h, '#fff', 0); R(g, w / 6, -h / 2, w / 3, h, '#ce1126', 0); }
  if (kind === 'no') { R(g, -w / 2, -h / 2, w, h, '#ba0c2f', 0); R(g, -w * 0.22, -h / 2, w * 0.16, h, '#fff', 0); R(g, -w / 2, -h * 0.1, w, h * 0.2, '#fff', 0); R(g, -w * 0.18, -h / 2, w * 0.08, h, '#00205b', 0); R(g, -w / 2, -h * 0.05, w, h * 0.1, '#00205b', 0); }
  if (kind === 've') { R(g, -w / 2, -h / 2, w, h / 3, '#ffcc00', 0); R(g, -w / 2, -h / 6, w, h / 3, '#00247d', 0); R(g, -w / 2, h / 6, w, h / 3, '#cf142b', 0); }
  if (kind === 'ao') { R(g, -w / 2, -h / 2, w, h / 2, '#cc092f', 0); R(g, -w / 2, 0, w, h / 2, '#111', 0); }
  g.strokeStyle = OL; g.lineWidth = 5; g.strokeRect(-w / 2, -h / 2, w, h); g.restore();
}

// ---------- the English Channel map ----------
const ENG = [[0, 0], [1200, 0], [1260, 180], [1225, 330], [1160, 425], [1050, 470], [900, 500], [720, 520], [520, 545], [300, 575], [100, 625], [0, 650]];
const FRA = [[1920, 330], [1600, 400], [1400, 460], [1270, 515], [1200, 600], [1150, 700], [1000, 760], [860, 800], [760, 790], [720, 700], [650, 690], [630, 800], [600, 880], [400, 900], [150, 920], [0, 960], [0, 1080], [1920, 1080]];
const WALL = [[150, 920], [400, 900], [600, 880], [630, 800], [650, 690], [720, 700], [760, 790], [860, 800], [1000, 760], [1150, 700], [1200, 600], [1270, 515], [1400, 460], [1600, 400], [1900, 335]];
const PLC = { calais: [1270, 518], normandy: [870, 800], dover: [1160, 428], kent: [1050, 340], london: [900, 250], portsmouth: [720, 520], germany: [1700, 620] };
function channel(g, t, o = {}) {
  g.fillStyle = '#7fb6d0'; g.fillRect(-W, -H, W * 3, H * 3); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; for (let x = 0; x < W; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  P(g, ENG, '#e9d9a8', 6); P(g, FRA, '#e6d2a0', 6); T(g, 'INGLATERRA', 520, 300, 64, '#7a6a4a', { stroke: 0 }); T(g, 'FRANCIA', 1250, 930, 70, '#7a6a4a', { stroke: 0 }); T(g, 'CANAL DE LA MANCHA', 700, 640, 34, 'rgba(255,255,255,.75)', { stroke: 0 });
  if (o.wall) { const k = clamp((t - o.wall) / 1.5); g.save(); g.strokeStyle = '#3a3a3a'; g.lineWidth = 16; g.setLineDash([22, 10]); g.beginPath(); const pts = WALL; const n = Math.max(2, Math.ceil(pts.length * k)); pts.slice(0, n).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); }
  for (const m of o.marks || []) { const [x, y] = PLC[m.p]; const s = S_(t, m.at || 0, 0.3); if (s <= 0) continue; g.save(); g.translate(x, y); g.scale(s, s); C(g, 0, 0, m.big ? 24 : 16, m.col || '#c0392b', 5); if (m.label) T(g, m.label, m.dx ?? 0, m.dy ?? -50, m.size || 48); g.restore(); }
  for (const a of o.arrows || []) { const [x1, y1] = PLC[a.from] || a.from, [x2, y2] = PLC[a.to] || a.to; K.arrow(g, x1, y1, x2, y2, clamp((t - (a.at || 0)) / (a.d || 1)), a.col || '#c0392b', a.w || 12); }
  if (o.km != null) { const k = S_(t, o.km); if (k > 0) { g.save(); g.translate(1430, 330); g.scale(k, k); L(g, [[-120, 20], [-215, 140]], 5, '#c0392b'); R(g, -110, -40, 220, 80, '#fff8e8', 5, 20); T(g, '30 KM', 0, 3, 50, '#c0392b', { stroke: 0 }); g.restore(); } }
}
function tank(g, x, y, s, inflate = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s * (0.15 + 0.85 * inflate)); const c = o.color || '#6b7a4a';
  R(g, -230, -40, 460, 80, shade(c, -0.25), 6, 40); for (let i = 0; i < 6; i++) C(g, -180 + i * 72, 0, 26, '#3a3a34', 4); P(g, [[-200, -40], [200, -40], [170, -120], [-170, -120]], c, 6); R(g, -90, -190, 180, 80, c, 6, 20); R(g, 80, -165, 220, 26, shade(c, -0.1), 5, 10);
  C(g, -40, -80, 22, '#fff', 4); T(g, '★', -40, -78, 36, '#fff', { stroke: 0 }); if (o.patch) { C(g, 120, -60, 14, '#c0392b', 3); } g.restore();
}
function boat(g, x, y, s, t) { g.save(); g.translate(x, y + Math.sin(t * 2 + x) * 4); g.scale(s, s); P(g, [[-160, -40], [160, -40], [130, 30], [-130, 30]], '#8a8a7a', 5); R(g, -140, -90, 280, 50, '#9a9a8a', 5, 6); g.restore(); }
function pump(g, x, y, t, on) { g.save(); g.translate(x, y); R(g, -20, -120 + (on ? Math.abs(Math.sin(t * 8)) * 40 : 0), 40, 120, '#8a8a8a', 4, 6); R(g, -60, -140 + (on ? Math.abs(Math.sin(t * 8)) * 40 : 0), 120, 24, '#5a5a5a', 4, 6); R(g, -40, 0, 80, 20, '#5a5a5a', 4, 6); g.restore(); }
function radioSet(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); R(g, -150, -100, 300, 200, '#5a5e4a', 6, 10); for (let i = 0; i < 3; i++) C(g, -80 + i * 80, -30, 26, '#2a2a22', 4); R(g, -120, 40, 240, 30, '#2a2a22', 3, 6); L(g, [[120, -100], [180, -260]], 5); g.restore(); }
function letter(g, x, y, s, rot, lines, o = {}) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); R(g, -300, -380, 600, 760, o.paper || '#f6f0de', 6, 4); lines.forEach((l, i) => T(g, l, -260, -300 + i * 70, o.size || 40, o.col || '#3a2a20', { stroke: 0, align: 'left', font: 'Playfair Display', weight: 700 })); g.restore(); }
function medal(g, x, y, s, kind) { g.save(); g.translate(x, y); g.scale(s, s); if (kind === 'iron') { R(g, -36, -260, 72, 120, '#c0392b', 3); R(g, -22, -260, 44, 120, '#f2f2f2', 0); R(g, -10, -260, 20, 120, '#1a1a1a', 0);
    for (const [fill, k] of [['#d8d8d8', 1], ['#1a1a1a', 0.78]]) for (let a = 0; a < 4; a++) { g.save(); g.rotate(a * Math.PI / 2); P(g, [[-26 * k, 0], [26 * k, 0], [70 * k, -140 * k], [-70 * k, -140 * k]], fill, k === 1 ? 6 : 0); g.restore(); } }
  else { R(g, -30, -260, 60, 120, '#e8b4c8', 4); R(g, -10, -260, 20, 120, '#8a8aa8', 0); C(g, 0, 0, 120, '#c9a23a', 6); C(g, 0, 0, 90, '#e0be5a', 3); T(g, 'MBE', 0, 4, 60, '#7a5a1a', { stroke: 0 }); } g.restore(); }
const nightField = (g, t) => { K.sky(g, 'night', t); K.ground(g, '#2e3a2a', 760); for (let i = 0; i < 6; i++) K.pine(g, i * 360 - 80, 770, 1.1, '#1e2a22'); };

Object.assign(BG, { kent: (g, t) => nightField(g, t), dark: BG.dark || ((g) => { g.fillStyle = '#1c1a24'; g.fillRect(-W, -H, W * 3, H * 3); }), office: (g, t) => K.room(g, 'office', { night: true }), beach: BG.beach });

Object.assign(S, {
  hookTrue(g, t, d, p) {
    if (p.rubber != null && t > p.rubber) { nightField(g, t); tank(g, 520, 820, 1.2, 1); boat(g, 1250, 860, 1.4, t); T(g, 'GOMA', 520, 520, 90, '#f2e94a'); T(g, 'CARTÓN', 1250, 620, 90, '#f2e94a'); return; }
    S.beachLanding(g, t, d, p); if (p.q != null) stamp(g, t, '¿VERDAD?', W / 2, 220, p.q, { size: 96, col: '#f2e94a', fill: 'rgba(30,20,10,.85)' });
    if (p.no != null) stamp(g, t, 'LA VERDAD: NO', W / 2, 420, p.no, { size: 90, rot: 0.06, fill: 'rgba(30,20,10,.85)' });
  },
  inflate(g, t, d, p) {
    nightField(g, t); const k = clamp((t - (p.from ?? 0.5)) / (p.dur ?? 6)); tank(g, 1150, 900, 1.5, ease.inOut(k));
    pump(g, 640, 980, t, k < 1); L(g, [[640, 960], [800, 1000], [900, 900]], 6, '#222');
    guy(g, t, TOMI_BR, 520, 1000, { s: 1.5, pose: k < 1 ? 'holdFront' : 'shrug', expr: K.exprAt(t, p.ex, 'confused') });
    if (p.tons != null) label(g, t, '¿30 TONELADAS?', 1150, 330, p.tons, 70); if (p.rub != null) stamp(g, t, 'DE GOMA', 1150, 470, p.rub, { size: 80, fill: 'rgba(30,20,10,.85)' });
  },
  title3(g, t, d, p) {
    nightField(g, t); tank(g, 1500, 900, 1.1, 1); guy(g, t, TOMI_BR, 330, H + 60, { s: 2.3, f: 1, pose: 'crossArms', expr: 'smirk' });
    const s = pop(t, 0.3, 0.5); g.save(); g.translate(W / 2 + 200, 230); g.scale(s, s); g.rotate(-0.03); R(g, -560, -70, 1120, 140, '#f2e94a', 7, 70); T(g, '¿Y SI TE TOCARÁ…', 0, 4, 84, OL, { stroke: 0 }); T(g, 'ENGAÑAR', 0, 170, 110, '#fff8e8'); T(g, 'A HITLER?', 0, 300, 120, '#ff5040'); g.restore();
    (p.items || []).forEach(([str, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(1060 + i * 300, 700); g.scale(k, k); R(g, -130, -45, 260, 90, '#fff8e8', 5, 20); T(g, str, 0, 2, 38, OL, { stroke: 0 }); g.restore(); xMark(g, 1060 + i * 300, 700, 30, i < 2 ? clamp((t - at - 0.3) / 0.3) : 0); });
  },
  channelMap(g, t, d, p) { channel(g, t, p); if (p.top) K.pill(g, t, p.top, 92, p.topAt || 0.2); if (p.flags) { flag(g, 300, 160, 150, 'uk', t); flag(g, 1700, 320, 150, 'de', t); } },
  invasion(g, t, d, p) {
    K.sky(g, 'day', t); K.ocean(g, t, 500); for (let i = 0; i < 9; i++) K.ship(g, ((i * 240 + t * 30) % (W + 300)) - 150, 520 + (i % 3) * 30, 0.35 + (i % 2) * 0.1, 1, {}); for (let i = 0; i < 8; i++) { const x = ((i * 280 + t * 120) % (W + 400)) - 200; K.plane(g, x, 120 + (i % 3) * 60, 0.35, t, 1); }
    if (p.lbl) T(g, p.lbl, W / 2, 960, 64, '#fff8e8'); if (p.where != null) { const k = S_(t, p.where); if (k > 0) { g.save(); g.translate(W / 2, 760); g.scale(k, k); T(g, '¿DÓNDE?', 0, 0, 160, '#f2e94a'); g.restore(); } }
  },
  ikeNote(g, t, d, p) {
    K.room(g, 'office', { night: true }); K.desk(g, 1200, GY, 1.1); guy(g, t, IKE, 700, GY + 30, { s: 1.5, pose: 'think', expr: 'worried' });
    letter(g, 1350, 430, 0.55, 0.06, ['En caso de fracaso…', '', 'la culpa es', 'solo mía.'], { size: 44 });
    if (p.lbl) label(g, t, p.lbl, 700, 200, p.lblAt || 0.3, 56);
  },
  crew(g, t, d, p) {
    K.room(g, 'hall', { wall: '#d8cfb8' }); R(g, 1250, 300, 520, 360, '#fff8e8', 6, 6); tank(g, 1510, 560, 0.7, 1); // canvas painting of a tank
    const crew = [ARTIST('#c0392b', 'messy', '#8a5a2a'), ARTIST('#3f8fb0', 'bun', '#3a2a20'), ARTIST('#e8a33a', 'curly', '#1e1a18')]; crew.forEach((c, i) => guy(g, t, c, 360 + i * 260, 1020, { s: 1.3, pose: ['point', 'holdFront', 'explain'][i], expr: 'happy', seed: i }));
    g.save(); g.translate(1100, 880); g.rotate(-0.2 + (Math.sin(t * 3) > 0.8 ? 0.25 : 0)); R(g, -110, -70, 220, 30, '#111', 4); g.restore(); R(g, 990, 880, 220, 130, '#111', 4); for (let i = 0; i < 5; i++) R(g, 1000 + i * 44, 900, 22, 20, '#fff', 0);
    if (p.lbl) label(g, t, p.lbl, W / 2, 140, p.lblAt || 0.3, 64);
  },
  fakeArmy(g, t, d, p) {
    if (p.aerial) { g.fillStyle = '#6a8a4a'; g.fillRect(-W, -H, W * 3, H * 3); const r = rng(5); for (let i = 0; i < 28; i++) { const x = 120 + (i % 7) * 260, y = 160 + Math.floor(i / 7) * 220; g.save(); g.translate(x, y); g.rotate(0.3); R(g, -60, -30, 120, 60, '#4a5a3a', 4, 10); R(g, -20, -16, 50, 32, '#3a4a2a', 3, 8); g.restore(); }
      for (let i = 0; i < 6; i++) R(g, 60 + i * 300, 1000, 200, 40, '#c9b38a', 0); g.save(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 8; g.strokeRect(160, 100, W - 320, H - 200); g.restore(); T(g, 'VISTA DESDE UN AVIÓN ESPÍA', W / 2, 80, 50, '#fff8e8'); return; }
    K.sky(g, 'day', t); K.ground(g, '#7a9a4a', 760); for (let i = 0; i < 4; i++) tank(g, 260 + i * 330, 860 + (i % 2) * 40, 0.75, 1);
    for (let i = 0; i < 2; i++) { g.save(); g.translate(1550 + i * 200, 820); R(g, -90, -90, 180, 90, '#8a7a5a', 5, 6); R(g, 30, -150, 60, 60, '#8a7a5a', 5, 6); C(g, -50, 10, 24, '#333', 4); C(g, 50, 10, 24, '#333', 4); g.restore(); }
    if (p.boats) { g.fillStyle = '#7fb6d0'; g.fillRect(-W, 960, W * 3, 400); for (let i = 0; i < 5; i++) boat(g, 220 + i * 360, 1000, 0.8, t); }
    if (p.lbl) label(g, t, p.lbl, W / 2, 150, p.lblAt || 0.3, 62); if (p.km) label(g, t, 'KENT · ESSEX', 300, 250, 0.2, 50, '#fff8e8');
  },
  oilDock(g, t, d, p) {
    K.sky(g, 'day', t); K.ocean(g, t, 760); R(g, 200, 520, 1500, 260, '#c9c2b2', 6); for (let i = 0; i < 5; i++) { R(g, 260 + i * 280, 380, 200, 160, '#b8b0a0', 6, 10); } for (let i = 0; i < 3; i++) R(g, 420 + i * 520, 180, 40, 220, '#8a8270', 5); L(g, [[220, 700], [1700, 700]], 14, '#6a6258');
    g.save(); g.globalAlpha = 0.5; R(g, 1500, 440, 200, 340, '#3a3a3a', 0); g.restore(); T(g, 'DOVER', 300, 160, 70, '#fff8e8'); stamp(g, t, '0 LITROS DE GASOLINA', 1300, 900, p.empty ?? 2, { size: 56, fill: 'rgba(30,20,10,.85)' });
  },
  tricks(g, t, d, p) {
    K.sky(g, 'dusk', t); K.ground(g, '#6a7a4a', 760); const m = p.mode || 'tracks';
    if (m === 'tracks') { tank(g, lerp(500, 1300, clamp(t / d)), 860, 0.9, 1); for (let i = 0; i < 18; i++) R(g, 300 + i * 50, 940, 30, 12, '#4a3a24', 0); guy(g, t, TOMI_BR, lerp(300, 1100, clamp(t / d)), 1000, { s: 1.3, pose: walkPose(t * 6), still: true, expr: 'smirk' }); label(g, t, 'HUELLAS NUEVAS EN EL BARRO', W / 2, 160, 0.3, 58); }
    if (m === 'fires') { for (let i = 0; i < 5; i++) { const x = 260 + i * 360; P(g, [[x - 120, 880], [x, 700], [x + 120, 880]], '#c9b38a', 5); C(g, x, 940, 26, '#e8a33a', 3); for (let j = 0; j < 4; j++) { const q = (t * 0.4 + j / 4 + i * 0.1) % 1; C(g, x + Math.sin(q * 8) * 20, 920 - q * 400, 20 + q * 40, `rgba(120,120,120,${0.6 * (1 - q)})`, 0); } } label(g, t, 'HOGUERAS… EN CAMPAMENTOS VACÍOS', W / 2, 160, 0.3, 58); }
    if (m === 'laundry') { L(g, [[200, 600], [1700, 560]], 5, '#5a4a3a'); for (let i = 0; i < 9; i++) { const x = 300 + i * 160, y = 600 - i * 4.5; R(g, x - 50, y, 100, 120 + Math.sin(t * 3 + i) * 8, ['#e8e2d0', '#7a6e4a', '#c9c2b2'][i % 3], 4, 6); } guy(g, t, TOMI_BR, 1600, 1000, { s: 1.4, pose: 'shrug', expr: 'smirk' }); label(g, t, 'TENDER ROPA', W / 2, 160, 0.3, 64); }
  },
  radioRoom(g, t, d, p) {
    K.room(g, 'bunk'); for (let i = 0; i < 3; i++) { const x = 330 + i * 560; R(g, x + 60, GY - 150, 300, 150, '#6a4a2a', 5, 6); radioSet(g, x + 210, GY - 230, 0.45); guy(g, t, RADIO, x, GY + 20, { s: 1.2, pose: 'sit', expr: 'smirk', seed: i }); }
    const msgs = p.msgs || ['Faltan 300 raciones', 'Pedido: 40 camiones', 'La comida es horrible'];
    msgs.forEach((m, i) => { const k = S_(t, (p.at || 0.4) + i * 0.8); if (k <= 0) return; g.save(); g.translate(500 + i * 560, 300); g.scale(k, k); R(g, -230, -60, 460, 120, '#fff8e8', 5, 30); T(g, m, 0, 3, 36, OL, { stroke: 0 }); g.restore(); });
    if (p.listen != null && t > p.listen) { g.fillStyle = 'rgba(20,20,30,.55)'; g.fillRect(-W, -H, W * 3, H * 3); toonBigFace(g, W / 2, 620, 200, { outfit: GERMAN_OFF, expr: 'thinking', t }); R(g, W / 2 - 230, 520, 40, 120, '#222', 4, 10); R(g, W / 2 + 190, 520, 40, 120, '#222', 4, 10); T(g, 'LOS ALEMANES ESCUCHAN TODO', W / 2, 950, 60, '#f2e94a'); }
  },
  fusag(g, t, d, p) {
    K.sky(g, 'day', t); K.ground(g, '#7a9a4a', 800); for (let i = 0; i < 3; i++) tank(g, 1200 + i * 260, 880, 0.6, 1);
    g.save(); g.translate(600, 600); R(g, -360, -130, 720, 260, '#fff8e8', 7, 14); T(g, 'PRIMER GRUPO DE EJÉRCITOS', 0, -45, 46, OL, { stroke: 0 }); T(g, 'DE ESTADOS UNIDOS', 0, 25, 46, OL, { stroke: 0 }); T(g, '(FUSAG)', 0, 85, 36, '#c0392b', { stroke: 0 }); g.restore(); L(g, [[480, 730], [480, 1000]], 12, '#6a4a2a'); L(g, [[720, 730], [720, 1000]], 12, '#6a4a2a');
    flag(g, 1700, 300, 180, 'us', t); if (p.ghost) stamp(g, t, 'NO EXISTE', 600, 600, p.ghost, { size: 90, fill: 'rgba(255,248,232,.6)' });
  },
  patton(g, t, d, p) {
    K.room(g, 'office'); guy(g, t, PATTON, 760, GY + 40, { s: 1.6, pose: p.pose || 'crossArms', expr: K.exprAt(t, p.ex, 'angry') }); for (let i = 0; i < 3; i++) T(g, '★', 690 + i * 45, GY - 330, 40, '#f2e94a', { stroke: 4 });
    if (p.lbl) label(g, t, p.lbl, 760, 160, p.lblAt || 0.3, 64); if (p.slap != null) { const k = S_(t, p.slap); if (k > 0) { g.save(); g.translate(1450, 520); g.scale(k, k); R(g, -300, -200, 600, 400, '#fff8e8', 6, 10); T(g, 'SICILIA · 1943', 0, -120, 50, '#c0392b', { stroke: 0 }); T(g, 'Abofetea a dos', 0, -30, 46, OL, { stroke: 0 }); T(g, 'soldados en un', 0, 30, 46, OL, { stroke: 0 }); T(g, 'hospital', 0, 90, 46, OL, { stroke: 0 }); g.restore(); stamp(g, t, 'CASTIGADO', 1450, 820, p.slap + 0.6, { size: 70 }); } }
  },
  norway(g, t, d, p) {
    g.fillStyle = '#7fb6d0'; g.fillRect(-W, -H, W * 3, H * 3); P(g, [[300, 300], [520, 240], [600, 420], [560, 700], [460, 900], [320, 860], [260, 600]], '#e9d9a8', 6); T(g, 'ESCOCIA', 420, 560, 50, '#7a6a4a', { stroke: 0 });
    P(g, [[1100, 100], [1500, 60], [1700, 200], [1600, 500], [1400, 700], [1200, 640], [1150, 400]], '#e6d2a0', 6); T(g, 'NORUEGA', 1400, 400, 56, '#7a6a4a', { stroke: 0 }); flag(g, 1600, 760, 150, 'no', t);
    K.arrow(g, 560, 500, 1150, 450, clamp((t - 0.6) / 1.2), '#c0392b', 12); radioSet(g, 420, 860, 0.5);
    if (p.wait != null && t > p.wait) for (let i = 0; i < 5; i++) guy(g, t, GERMAN_SOL, 1200 + i * 90, 760, { s: 0.7, pose: 'crossArms', expr: 'neutral', seed: i });
    if (p.lbl) label(g, t, p.lbl, W / 2, 1000, p.lblAt || 0.3, 58);
  },
  doubleCross(g, t, d, p) {
    g.fillStyle = '#5a3e28'; g.fillRect(-W, -H, W * 3, H * 3); R(g, 120, 120, W - 240, H - 240, '#a8794e', 8, 8);
    for (let i = 0; i < 8; i++) { const x = 330 + (i % 4) * 420, y = 360 + Math.floor(i / 4) * 330; const at = 0.4 + i * 0.35; const k = S_(t, at); if (k <= 0) continue; g.save(); g.translate(x, y); g.rotate(((i * 37) % 7 - 3) * 0.02); g.scale(k, k); R(g, -110, -140, 220, 260, '#f6f0de', 5, 4); C(g, 0, -50, 50, '#c9c2b2', 4); T(g, 'ESPÍA ' + (i + 1), 0, 60, 34, OL, { stroke: 0 }); g.restore(); const turned = (p.turn ?? 99) + i * 0.25; if (t > turned) { check(g, x + 80, y - 110, 40, clamp((t - turned) / 0.4)); } }
    T(g, 'SISTEMA DE LA DOBLE CRUZ', W / 2, 90, 64, '#fff8e8'); if (p.lbl != null) stamp(g, t, 'TRABAJAN PARA LONDRES', W / 2, 980, p.lbl, { size: 60, fill: 'rgba(255,248,232,.85)' });
  },
  garboIntro(g, t, d, p) {
    K.map(g, t, { marks: [{ xy: [1000, 300], label: 'BARCELONA', at: 0.3 }] }); flag(g, 1000, 420, 150, 'es', t);
    const k = S_(t, p.face ?? 0.8, 0.5); if (k > 0) { g.save(); g.translate(560, 620); g.scale(k, k); toonBigFace(g, 0, 0, 220, { outfit: GARBO, expr: K.exprAt(t, p.ex, 'smile'), blink: K.blinkAt(t, 3), t }); g.restore(); }
    if (p.lbl) label(g, t, p.lbl, 560, 140, p.lblAt || 0.4, 72);
    if (p.hates != null) { const k2 = S_(t, p.hates); if (k2 > 0) { g.save(); g.translate(1400, 760); g.scale(k2, k2); R(g, -320, -110, 640, 220, '#fff8e8', 6, 20); T(g, 'ODIABA A LOS NAZIS', 0, -30, 48, '#c0392b', { stroke: 0 }); T(g, 'Y A LOS COMUNISTAS', 0, 40, 48, OL, { stroke: 0 }); g.restore(); } }
  },
  rejected(g, t, d, p) {
    K.room(g, 'hall', { wall: '#d8d2c4' }); flag(g, 1500, 260, 220, 'uk', t); R(g, 1200, 380, 520, 600, '#5a3a24', 7, 8); T(g, 'EMBAJADA', 1460, 440, 44, '#fff8e8');
    guy(g, t, GARBO, 760, GY + 40, { s: 1.5, pose: 'explain', expr: K.exprAt(t, p.ex, 'smile') });
    (p.nos || []).forEach((at, i) => stamp(g, t, 'NO', 1460 + (i ? 120 : -80), 640 + i * 140, at, { size: 120, rot: i ? 0.15 : -0.12 }));
  },
  abwehr(g, t, d, p) {
    K.room(g, 'office', { night: true }); flag(g, 1600, 240, 180, 'de', t); guy(g, t, GERMAN_OFF, 1250, GY + 30, { s: 1.5, pose: 'holdFront', expr: 'smirk', f: -1 }); guy(g, t, GARBO, 620, GY + 30, { s: 1.5, pose: 'crossArms', expr: 'smirk' });
    const items = [['DINERO', '#3fae7a'], ['TINTA INVISIBLE', '#9fd8ff'], ['NOMBRE: «ARABEL»', '#f2e94a']]; items.forEach(([s, c], i) => { const k = S_(t, (p.at ?? 0.6) + i * 0.7); if (k <= 0) return; g.save(); g.translate(940, 260 + i * 140); g.scale(k, k); R(g, -230, -50, 460, 100, c, 5, 30); T(g, s, 0, 3, 40, OL, { stroke: 0 }); g.restore(); });
    if (p.lbl) label(g, t, p.lbl, W / 2, 1000, p.lblAt || 0.3, 54);
  },
  lisbon(g, t, d, p) {
    K.room(g, 'office'); K.desk(g, 1000, GY, 1.2); guy(g, t, GARBO, 760, GY + 30, { s: 1.4, pose: 'sit', expr: K.exprAt(t, p.ex, 'smirk') }); flag(g, 1650, 220, 170, 'pt', t); T(g, 'LISBOA', 1650, 340, 50, '#fff8e8');
    const props = [['GUÍA TURÍSTICA', '#c0392b'], ['MAPAS', '#3f8fb0'], ['REVISTAS', '#e8a33a'], ['NOTICIARIOS', '#5a5a62']]; props.forEach(([s, c], i) => { const k = S_(t, (p.at ?? 0.6) + i * 0.5); if (k <= 0) return; g.save(); g.translate(1180 + (i % 2) * 300, 560 + Math.floor(i / 2) * 140); g.rotate((i - 1.5) * 0.05); g.scale(k, k); R(g, -130, -50, 260, 100, c, 5, 8); T(g, s, 0, 3, 32, '#fff', { stroke: 0 }); g.restore(); });
    if (p.lbl) label(g, t, p.lbl, W / 2, 130, p.lblAt || 0.3, 58);
  },
  wineError(g, t, d, p) {
    g.fillStyle = '#efe0bf'; g.fillRect(-W, -H, W * 3, H * 3); letter(g, 760, 560, 1, -0.03, ['Informe:', '', 'Los escoceses harían', 'cualquier cosa', 'por un litro de vino…'], { size: 44 });
    const k = clamp((t - (p.err ?? 1.5)) / 0.5); if (k > 0) { g.save(); g.strokeStyle = '#c0392b'; g.lineWidth = 8; g.beginPath(); g.ellipse(700, 548, 240 * k, 48 * k, -0.03, 0, Math.PI * 2); g.stroke(); g.restore(); stamp(g, t, '¡ALLÍ SE BEBE WHISKY!', 1450, 400, p.err + 0.4, { size: 54, rot: 0.05, fill: 'rgba(255,248,232,.95)' }); }
    if (p.believe != null) { const k2 = S_(t, p.believe); if (k2 > 0) { g.save(); g.translate(1480, 720); g.scale(k2, k2); toonBigFace(g, 0, 0, 150, { outfit: GERMAN_OFF, expr: 'happy', t }); g.restore(); stamp(g, t, 'SE LO CREEN', 1480, 960, p.believe + 0.5, { size: 60 }); } }
  },
  london(g, t, d, p) {
    K.room(g, 'office'); K.desk(g, 960, GY, 1.3); guy(g, t, GARBO, 680, GY + 30, { s: 1.45, pose: 'sit', expr: 'happy' }); guy(g, t, HARRIS, 1240, GY + 30, { s: 1.45, pose: 'sit', expr: 'smile', f: -1 }); flag(g, 1700, 220, 170, 'uk', t);
    for (let i = 0; i < 6; i++) { const q = (t * 0.5 + i / 6) % 1; R(g, 900 + Math.sin(i * 3) * 80, 700 - q * 300, 100, 70, `rgba(246,240,222,${1 - q})`, 3, 4); }
    if (p.code != null) stamp(g, t, 'NOMBRE EN CLAVE: GARBO', W / 2, 960, p.code, { size: 66, fill: 'rgba(255,248,232,.92)' }); if (p.harris != null) label(g, t, 'TOMÁS HARRIS', 1240, 380, p.harris, 54);
  },
  network(g, t, d, p) {
    g.fillStyle = '#5a3e28'; g.fillRect(-W, -H, W * 3, H * 3); R(g, 120, 120, W - 240, H - 240, '#a8794e', 8, 8); T(g, 'LA RED DE GARBO', W / 2, 90, 64, '#fff8e8');
    const ag = p.agents || [['Soldado charlatán', 0.4], ['Funcionario descontento', 1.0], ['Marinero', 1.6], ['Secretaria', 2.2]];
    const pts = [[W / 2, 540]]; const k0 = S_(t, 0.2); if (k0 > 0) { g.save(); g.translate(W / 2, 540); g.scale(k0, k0); toonBigFace(g, 0, 0, 100, { outfit: GARBO, expr: 'smirk', t }); g.restore(); }
    ag.forEach(([s, at], i) => { const a = -Math.PI / 2 + i * (Math.PI * 2 / ag.length), x = W / 2 + Math.cos(a) * 560, y = 540 + Math.sin(a) * 300; const k = S_(t, at); if (k <= 0) return; g.strokeStyle = '#c0392b'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2, 540); g.lineTo(lerp(W / 2, x, k), lerp(540, y, k)); g.stroke(); g.save(); g.translate(x, y); g.scale(k, k); R(g, -170, -70, 340, 140, '#f6f0de', 5, 4); T(g, s, 0, 3, 34, OL, { stroke: 0 }); g.restore(); });
    if (p.many != null) { const k = clamp((t - p.many) / 1.2); for (let i = 0; i < 22 * k; i++) { const r = rng(i + 3); R(g, 180 + r() * 1500, 180 + r() * 700, 70, 50, '#f6f0de', 2, 3); } stamp(g, t, 'CASI 30 · NINGUNO EXISTE', W / 2, 980, p.many + 0.8, { size: 56, fill: 'rgba(255,248,232,.85)' }); }
  },
  widow(g, t, d, p) {
    g.fillStyle = '#efe0bf'; g.fillRect(-W, -H, W * 3, H * 3);
    g.save(); g.translate(560, 540); g.rotate(-0.04); R(g, -360, -380, 720, 760, '#f3efe4', 6, 4); T(g, 'LIVERPOOL', 0, -310, 54, OL, { stroke: 0 }); R(g, -300, -260, 600, 4, OL, 0); T(g, 'ESQUELA', 0, -180, 70, OL, { stroke: 0 }); C(g, 0, -40, 70, '#c9c2b2', 4); T(g, 'Agente fallecido', 0, 80, 40, OL, { stroke: 0 }); T(g, '(que nunca existió)', 0, 140, 36, '#c0392b', { stroke: 0 }); g.restore();
    if (p.cond != null) { const k = S_(t, p.cond); if (k > 0) { g.save(); g.translate(1350, 360); g.scale(k, k); R(g, -260, -140, 520, 280, '#fff8e8', 6, 6); T(g, 'CONDOLENCIAS', 0, -40, 50, OL, { stroke: 0 }); T(g, 'desde Berlín', 0, 30, 40, '#5a5a62', { stroke: 0 }); g.restore(); } }
    if (p.pension != null) { const k = S_(t, p.pension); if (k > 0) { g.save(); g.translate(1350, 760); g.scale(k, k); R(g, -280, -140, 560, 280, '#3fae7a', 6, 20); T(g, 'PENSIÓN PARA', 0, -40, 50, '#fff', { stroke: 0 }); T(g, 'LA VIUDA', 0, 30, 60, '#fff', { stroke: 0 }); g.restore(); if (p.ghost != null) stamp(g, t, 'TAMPOCO EXISTÍA', 1350, 960, p.ghost, { size: 56 }); } }
  },
  berlinHappy(g, t, d, p) {
    K.room(g, 'office', { night: true }); flag(g, 1650, 220, 170, 'de', t); for (let i = 0; i < 3; i++) guy(g, t, GERMAN_OFF, 500 + i * 380, GY + 30, { s: 1.4, pose: i === 1 ? 'cheer' : 'holdFront', expr: 'happy', seed: i });
    for (let i = 0; i < 8; i++) { const q = (t * 0.6 + i / 8) % 1; R(g, 300 + i * 180, 300 + q * 500, 90, 44, '#7cc46f', 3, 4); }
    if (p.stamp != null) stamp(g, t, 'ESCRITO Y APROBADO POR LONDRES', W / 2, 160, p.stamp, { size: 58, fill: 'rgba(255,248,232,.9)' });
  },
  araceli(g, t, d, p) {
    K.room(g, 'hall', { wall: '#c9bfae' }); R(g, 1200, 220, 420, 440, '#9fb8cc', 6, 6); L(g, [[1410, 220], [1410, 660]], 5); guy(g, t, ARACELI, 1000, GY + 30, { s: 1.5, pose: 'sad', expr: K.exprAt(t, p.ex, 'sad') });
    if (p.threat != null) { const k = S_(t, p.threat); if (k > 0) { g.save(); g.translate(560, 360); g.scale(k, k); O(g, 0, 0, 300, 110, '#fff', 5); T(g, '«¡LO CONTARÉ TODO!»', 0, 2, 48, '#c0392b', { stroke: 0 }); g.restore(); } }
    if (p.play != null && t > p.play) { g.fillStyle = '#7a1a2a'; const k = clamp((t - p.play) / 0.8); g.fillRect(-W, -H, W + W * (1 - k) * 0.5 - 300, H * 3); g.fillRect(W + 300 - W * (1 - k) * 0.5, -H, W * 3, H * 3); guy(g, t, BOBBY, 420, GY + 30, { s: 1.4, pose: 'crossArms', expr: 'angry' }); label(g, t, 'UNA DETENCIÓN… DE TEATRO', W / 2, 140, p.play + 0.4, 58); }
  },
  vote3(g, t, d, p) {
    g.fillStyle = '#efe0bf'; g.fillRect(-W, -H, W * 3, H * 3); toonBigFace(g, 400, 640, 220, { outfit: TOMI_BR, expr: K.exprAt(t, p.ex, 'smile'), blink: K.blinkAt(t, 3), talk: 0, t });
    T(g, 'ESCRIBE EN LOS COMENTARIOS', 1250, 150, 60, OL, { stroke: 0 });
    [['TANQUE', '🎈', '#6b7a4a', p.a ?? 0.6], ['ESPÍA', '🕵️', '#c0392b', p.b ?? 1.4]].forEach(([w, e, c, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(1250, 400 + i * 260); g.scale(k * (1 + 0.03 * Math.sin(t * 4 + i)), k); R(g, -330, -100, 660, 200, c, 7, 40); g.font = '110px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, -210, 4); T(g, w, 80, 4, 96, '#fff'); g.restore(); });
    if (p.one != null) label(g, t, 'SOLO UNA PALABRA 👇', 1250, 960, p.one, 56, '#c0392b');
  },
  dawnRadio(g, t, d, p) {
    K.room(g, 'office', { night: true }); K.desk(g, 1000, GY, 1.2); radioSet(g, 1150, GY - 260, 0.9); guy(g, t, GARBO, 760, GY + 30, { s: 1.45, pose: 'sit', expr: K.exprAt(t, p.ex, 'worried') });
    g.save(); g.translate(1600, 260); C(g, 0, 0, 110, '#fff8e8', 6); L(g, [[0, 0], [0, -70]], 8); L(g, [[0, 0], [52, 30]], 6, '#c0392b'); g.restore(); T(g, '3:00', 1600, 420, 50, '#fff8e8');
    if (p.noAnswer != null) label(g, t, '…NADIE CONTESTA', 760, 180, p.noAnswer, 60);
  },
  telegram(g, t, d, p) {
    g.fillStyle = '#efe0bf'; g.fillRect(-W, -H, W * 3, H * 3); g.save(); g.translate(W / 2, 540); g.rotate(-0.02); R(g, -620, -330, 1240, 660, '#f6efc8', 6, 6); T(g, 'TELEGRAMA · 9 DE JUNIO DE 1944', 0, -250, 48, OL, { stroke: 0 });
    const lines = ['NORMANDÍA = DISTRACCIÓN STOP', 'EJÉRCITO DE PATTON INTACTO STOP', 'GOLPE REAL: CALAIS STOP']; lines.forEach((l, i) => { const k = clamp((t - (p.ats ? p.ats[i] : (p.at ?? 0.5) + i * 1.4)) / 0.8); T(g, l.slice(0, Math.ceil(l.length * k)), -560, -120 + i * 110, 56, '#2a2a30', { stroke: 0, align: 'left', font: 'Nunito' }); }); g.restore();
    if (p.top != null) stamp(g, t, 'LLEGA A LO MÁS ALTO', W / 2 + 300, 900, p.top, { size: 60 });
  },
  calaisWait(g, t, d, p) {
    K.sky(g, 'dusk', t); K.ocean(g, t, 600); K.ground(g, '#b8a57a', 840); R(g, 300, 700, 400, 160, '#7a7a72', 6, 10); R(g, 1200, 690, 420, 170, '#7a7a72', 6, 10);
    for (let i = 0; i < 7; i++) guy(g, t, GERMAN_SOL, 260 + i * 220, 1000, { s: 1.0, pose: i % 3 ? 'crossArms' : 'holdFront', expr: i % 2 ? 'neutral' : 'sleepy', look: [-0.8, -0.3], seed: i });
    T(g, 'CALAIS', 300, 160, 70, '#fff8e8'); if (p.weeks != null) { const k = S_(t, p.weeks); if (k > 0) { g.save(); g.translate(W / 2 + 300, 280); g.scale(k, k); R(g, -280, -60, 560, 120, '#fff8e8', 6, 30); T(g, 'SEMANAS ESPERANDO…', 0, 3, 50, OL, { stroke: 0 }); g.restore(); } }
    if (p.halt != null) stamp(g, t, '¡ALTO! NO VAYÁIS A NORMANDÍA', W / 2, 520, p.halt, { size: 60, fill: 'rgba(255,248,232,.9)' });
  },
  medals(g, t, d, p) {
    g.fillStyle = '#2a2a30'; g.fillRect(-W, -H, W * 3, H * 3); const k1 = S_(t, p.a ?? 0.5, 0.5), k2 = S_(t, p.b ?? 99, 0.5);
    if (k1 > 0) { g.save(); g.translate(600, 560); g.scale(k1, k1); medal(g, 0, 0, 1.4, 'iron'); g.restore(); flag(g, 600, 900, 160, 'de', t); T(g, 'CRUZ DE HIERRO', 600, 1010, 50, '#fff8e8'); }
    if (k2 > 0) { g.save(); g.translate(1320, 560); g.scale(k2, k2); medal(g, 0, 0, 1.4, 'mbe'); g.restore(); flag(g, 1320, 900, 160, 'uk', t); T(g, 'IMPERIO BRITÁNICO', 1320, 1010, 50, '#fff8e8'); }
    if (p.both != null) label(g, t, 'CONDECORADO POR LOS DOS BANDOS', W / 2, 120, p.both, 66);
  },
  vanish(g, t, d, p) {
    K.map(g, t, { marks: [{ xy: [1060, 760], label: 'ANGOLA', at: 0.3 }].concat(p.ve != null ? [{ xy: [590, 620], label: 'VENEZUELA', at: p.ve, col: '#2a8a4a' }] : []) });
    flag(g, 1060, 880, 120, 'ao', t); if (p.dead != null) { const k = S_(t, p.dead); if (k > 0) { g.save(); g.translate(1450, 380); g.scale(k, k); R(g, -280, -140, 560, 280, '#f3efe4', 6, 4); T(g, 'MUERE DE MALARIA', 0, -30, 50, OL, { stroke: 0 }); T(g, '(o eso dijeron)', 0, 40, 38, '#c0392b', { stroke: 0 }); g.restore(); } }
    if (p.ve != null && t > p.ve) { flag(g, 590, 740, 120, 've', t); stamp(g, t, '¡VIVO!', 590, 480, p.ve + 0.5, { size: 90, col: '#2a8a4a' }); }
  },
  reunion84(g, t, d, p) {
    K.sky(g, 'golden', t); K.ocean(g, t, 640); K.ground(g, '#c9b38a', 860); R(g, 860, 520, 200, 340, '#d8d2c4', 6, 10); flag(g, 1500, 360, 160, 'fr', t); flag(g, 360, 360, 160, 'uk', t);
    guy(g, t, GARBO_OLD, 760, 1030, { s: 1.45, pose: 'wave', expr: 'happy' }); for (let i = 0; i < 3; i++) guy(g, t, { top: 'suit', color: ['#3a4a6a', '#5a4a3a', '#3a3a44'][i], color2: '#c0392b', legs: '#333', hair: 'side', hairColor: '#d8d2c4', shoes: '#111' }, 1180 + i * 200, 1030, { s: 1.3, pose: 'stand', expr: 'smile', seed: i });
    label(g, t, 'NORMANDÍA · 1984', W / 2, 140, 0.3, 66);
  },
  closing3(g, t, d, p) {
    K.sky(g, 'golden', t); K.ground(g, '#7a8a4a', 820); tank(g, 1350, 900, 1.2, 1 - clamp(t / d) * 0.85); guy(g, t, TOMI_BR, 600, 1040, { s: 1.6, pose: 'crossArms', expr: 'smirk' });
    if (p.lbl) label(g, t, p.lbl, W / 2, 160, p.lblAt || 0.3, 64);
  },
  end3(g, t, d, p) {
    K.sky(g, 'golden', t); K.ground(g, '#8ab060', 860); toonBigFace(g, 400, 560, 210, { outfit: TOMI_BR, expr: K.exprAt(t, p.ex, 'smile'), blink: K.blinkAt(t, 3.2), t });
    if (p.q != null) { K.T(g, '¿QUÉ ESCRIBISTE?', 1250, 190, 62, '#fff8e8'); [['TANQUE 🎈', '#6b7a4a'], ['ESPÍA 🕵️', '#c0392b']].forEach(([o, c], i) => { const s = pop(t, p.q + 0.3 + i * 0.4, 0.35); if (s <= 0) return; g.save(); g.translate(1250, 360 + i * 150); g.scale(s, s); R(g, -300, -58, 600, 116, c, 6, 30); K.T(g, o, 0, 3, 54, '#fff', { stroke: 0 }); g.restore(); }); }
    if (p.sub != null) K.subscribeBtn(g, t, 1250, 720, p.sub, p.press ?? 99, 1.2);
    if (p.save != null) label(g, t, '🔖 GUÁRDALO', 1250, 880, p.save, 56, '#fff8e8');
  },
});
