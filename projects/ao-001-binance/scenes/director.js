// director.js — ARCHIVO OSCURO · Expediente 001 (Binance). Dark "archive" look, neon hacker world, real photos.
import { loadPhotos, photoMoment } from '/engine/photo.js';
import { E, registerShot, ease, clamp, lerp, prog, alpha, shade, rng } from '/engine/core.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from './lib.js';
const { W, H, GY, R, P, C, O, L, OL, guy } = K;

// ---------- fonts (Anton titles, Special Elite documents) ----------
await Promise.all([['Anton', '/assets/fonts/Anton-Regular.ttf'], ['Elite', '/assets/fonts/SpecialElite-Regular.ttf'], ['Bebas', '/assets/fonts/BebasNeue-Regular.ttf']].map(async ([n, u]) => {
  try { const b = await (await fetch(u)).arrayBuffer(); const f = new FontFace(n, b); await f.load(); document.fonts.add(f); } catch (e) { console.log('font', n, e.message); }
}));

// ---------- real lip-sync (timeline/mouth.json from tools/mouth_env.py) ----------
const MOUTH = await (await fetch('/project/timeline/mouth.json')).json().catch(() => ({ fps: 100, v: [] }));
let GT = 0;   // global time of the frame being drawn
const mouthAt = (gt = GT) => { const i = gt * MOUTH.fps, a = Math.floor(i), k = i - a; const v0 = MOUTH.v[a] || 0, v1 = MOUTH.v[a + 1] || 0; return v0 + (v1 - v0) * k; };
const talkNow = () => Math.min(0.9, mouthAt() * 0.95);

// ---------- palette ----------
const INK = '#141210', PAPER = '#f2ecdc', MANILA = '#c9a86a', RED = '#c8261e', AMBER = '#ffcf6a', NEON = '#39ff9c', OLIVE = '#4f5d3a', STEEL = '#8f979b', BLUE = '#3f6fa8';
const JAVI = { top: 'jacket', color: OLIVE, legs: '#34343c', shoes: '#3a2418', hair: 'side', hairColor: '#5a3a24' };
const ENG_B = { top: 'hoodie', color: BLUE, legs: '#3a3f4a', shoes: '#222', hair: 'messy', hairColor: '#2e2420' };
const ENG_A = { top: 'hoodie', color: '#5a8a5a', legs: '#3a3f4a', shoes: '#222', hair: 'side', hairColor: '#4a3020', face: 'glasses' };
const ENG_C = { top: 'hoodie', color: '#c07a3a', legs: '#3a3f4a', shoes: '#222', hair: 'curly', hairColor: '#1e1a18' };
const STAFF = (c, h, s) => ({ top: 'shirt', color: c, legs: '#3a3f4a', shoes: '#222', hair: h, hairColor: s });
const USER = (c, h) => ({ top: 'tshirt', color: c, legs: '#3a3f4a', shoes: '#222', hair: h, hairColor: '#3a2a20' });

// ---------- text helpers ----------
function AT(g, s, x, y, size, col = PAPER, o = {}) {
  g.save(); g.font = `${size}px "${o.font || 'Anton'}"`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.ls) g.letterSpacing = o.ls + 'px';
  const sw = o.stroke ?? size * 0.12; if (sw) { g.lineJoin = 'round'; g.strokeStyle = o.sc || INK; g.lineWidth = sw; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
const EL = (g, s, x, y, size, col = INK, o = {}) => AT(g, s, x, y, size, col, { font: 'Elite', stroke: 0, ...o });
const BB = (g, s, x, y, size, col = PAPER, o = {}) => AT(g, s, x, y, size, col, { font: 'Bebas', ...o });
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const pop = K.pop, S_ = (t, a, d = 0.35) => (t < a ? 0 : pop(t, a, d));
const neon = (g, fn, col = NEON, b = 22) => { g.save(); g.shadowColor = col; g.shadowBlur = b; fn(); g.restore(); };

// stamp: punch-in rubber stamp
function stamp(g, t, str, x, y, at, o = {}) {
  const lt = t - at; if (lt < 0) return; const col = o.col || RED, size = o.size || 64;
  const k = lt < 0.16 ? 2 - (lt / 0.16) : 1; const a = o.dur ? clamp((o.dur - lt) / 0.3) : 1; if (a <= 0) return;
  g.save(); g.globalAlpha *= a * 0.95; g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k, k);
  g.font = `${size}px "Anton"`; g.letterSpacing = size * 0.06 + 'px'; const w = g.measureText(str).width + size * 0.9;
  g.strokeStyle = col; g.lineWidth = size * 0.1; g.strokeRect(-w / 2, -size * 0.75, w, size * 1.5);
  if (o.fill) { g.fillStyle = alpha(o.fill, 0.9); g.fillRect(-w / 2, -size * 0.75, w, size * 1.5); }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(str, 0, size * 0.04); g.restore();
}
// trust stamps (top-right)
const confirmed = (g, t, at, label = 'CONFIRMADO') => stamp(g, t, label, W - 300, 120, at, { col: '#e04a3a', size: 52, rot: 0.1, fill: '#140f0d', dur: 3.2 });
const unconfirmed = (g, t, at, label = 'SIN CONFIRMAR') => stamp(g, t, label, W - 320, 120, at, { col: AMBER, size: 52, rot: 0.1, fill: '#140f0d', dur: 3.2 });

// ---------- shared props ----------
function laptop(g, x, y, s, screen, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  R(g, -260, -330, 520, 330, '#23262c', 6, 18); g.save(); g.beginPath(); g.rect(-236, -308, 472, 286); g.clip(); g.fillStyle = o.bg || '#0d1117'; g.fillRect(-236, -308, 472, 286); g.translate(0, -165); screen && screen(g); g.restore();
  P(g, [[-300, 0], [300, 0], [330, 30], [-330, 30]], '#3a3f48', 6); R(g, -60, 4, 120, 10, '#2a2e36', 0, 4); g.restore();
}
function phoneUI(g, x, y, s, screen, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); R(g, -160, -320, 320, 640, '#16161c', 8, 46); g.save(); g.beginPath(); g.roundRect(-140, -290, 280, 580, 26); g.clip(); g.fillStyle = o.bg || '#f4f1e8'; g.fillRect(-140, -290, 280, 580); screen && screen(g); g.restore(); R(g, -40, -306, 80, 10, '#000', 0, 5); g.restore();
}
function bubble(g, t, x, y, str, at, o = {}) {
  const s = S_(t, at, 0.3); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s);
  g.font = `600 ${o.size || 34}px "Fredoka"`; const w = Math.min(o.max || 520, g.measureText(str).width + 50); const left = !o.me;
  R(g, left ? 0 : -w, -36, w, 72, o.me ? '#d9f7c8' : '#ffffff', 4, 24); g.fillStyle = INK; g.textAlign = left ? 'left' : 'right'; g.textBaseline = 'middle'; g.fillText(str, left ? 25 : -25, 2, w - 50); g.restore();
}
function coin(g, x, y, r, sym = '₿', col = '#f2a33a', rot = 0) {
  g.save(); g.translate(x, y); g.scale(Math.max(0.15, Math.abs(Math.cos(rot))), 1); C(g, 0, 0, r, col, r * 0.09); C(g, 0, 0, r * 0.78, null, r * 0.05); AT(g, sym, 0, r * 0.04, r * 1.05, shade(col, 0.5), { stroke: r * 0.08, font: 'Anton' }); g.restore();
}
const COINS = [['₿', '#f2a33a'], ['Ξ', '#7a86d8'], ['$', '#3fae7a'], ['◆', '#f0c43a']];
function server(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); R(g, -110, -420, 220, 420, '#22262e', 6, 8);
  for (let i = 0; i < 8; i++) { R(g, -94, -404 + i * 50, 188, 40, '#2e333d', 3, 4); for (let j = 0; j < 4; j++) { const on = Math.sin(t * 7 + i * 3 + j * 5 + (o.seed || 0)) > 0.2; C(g, 50 + j * 12, -384 + i * 50, 4, on ? (o.alarm ? '#ff4a3a' : NEON) : '#1a3a2a', 0); } }
  g.restore();
}
function hacker(g, x, y, s, t, o = {}) {   // hooded silhouette with neon eyes
  g.save(); g.translate(x, y); g.scale(s, s);
  neon(g, () => P(g, [[-190, 300], [-200, 60], [-110, -90], [0, -150], [110, -90], [200, 60], [190, 300]], '#07090a', 0), NEON, 30);
  O(g, 0, -10, 98, 118, '#000', 0);
  const blink = (t % 3.7) > 3.6 ? 0.15 : 1; const grin = o.grin ?? 1;
  neon(g, () => { P(g, [[-62, -24], [-18, -10 * blink], [-62, 4 * blink]], NEON, 0); P(g, [[62, -24], [18, -10 * blink], [62, 4 * blink]], NEON, 0); if (grin) { g.strokeStyle = NEON; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(0, 30, 46, 0.35, Math.PI - 0.35); g.stroke(); } }, NEON, 26);
  g.restore();
}
function vault(g, x, y, r, t, o = {}) {
  g.save(); g.translate(x, y); C(g, 0, 0, r, '#7d858a', r * 0.05); C(g, 0, 0, r * 0.8, '#a6aeb2', r * 0.035); g.rotate(o.spin || 0);
  for (let i = 0; i < 6; i++) L(g, [[0, 0], [Math.cos(i * Math.PI / 3) * r * 0.55, Math.sin(i * Math.PI / 3) * r * 0.55]], r * 0.06);
  C(g, 0, 0, r * 0.15, '#6d7578', r * 0.035); g.restore();
}
function register(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); P(g, [[-170, 0], [170, 0], [140, -170], [-140, -170]], '#c0392b', 6); R(g, -120, -240, 240, 80, '#1d2a24', 6, 8);
  BB(g, o.amount || '$ 0', 0, -198, 46, NEON, { stroke: 0 }); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) R(g, -110 + j * 58, -140 + i * 40, 44, 28, '#f2ecdc', 3, 4); R(g, -180, 0, 360, 50, '#8a2a20', 6, 6); g.restore();
}
function calendar(g, x, y, s, month, day, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot || 0); R(g, -170, -190, 340, 380, PAPER, 6, 14); R(g, -170, -190, 340, 100, RED, 6, 14); AT(g, month, 0, -140, 48, PAPER, { stroke: 0 }); AT(g, String(day), 0, 30, 170, INK, { stroke: 0 }); BB(g, o.year || '2026', 0, 150, 40, '#6a6058', { stroke: 0 }); g.restore();
}
function clockFace(g, x, y, r, hh, mm, lab, sub) {
  C(g, x, y, r, PAPER, 6); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; L(g, [[x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]], 4); }
  const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, ma = mm / 60 * Math.PI * 2 - Math.PI / 2;
  L(g, [[x, y], [x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5]], 10); L(g, [[x, y], [x + Math.cos(ma) * r * 0.75, y + Math.sin(ma) * r * 0.75]], 6, RED); C(g, x, y, 8, INK, 0);
  AT(g, lab, x, y + r + 50, 44, PAPER); BB(g, sub, x, y + r + 100, 46, AMBER, { stroke: 6 });
}
const xMark = (g, x, y, r, p) => { if (p <= 0) return; g.save(); g.strokeStyle = RED; g.lineWidth = r * 0.22; g.lineCap = 'round'; const a = clamp(p * 2), b = clamp(p * 2 - 1); g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); g.stroke(); if (b > 0) { g.beginPath(); g.moveTo(x + r, y - r); g.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); g.stroke(); } g.restore(); };
const check = (g, x, y, r, p, col = NEON) => { if (p <= 0) return; g.save(); g.strokeStyle = col; g.lineWidth = r * 0.25; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r * 0.3, y + r * 0.7 * clamp(p * 2)); if (p > 0.5) g.lineTo(x - r * 0.3 + r * 1.3 * clamp(p * 2 - 1), y + r * 0.7 - r * 1.5 * clamp(p * 2 - 1)); g.stroke(); g.restore(); };
const blipDots = (g, t, n, seed, x0, y0, w, h, col) => { const r = rng(seed); for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, ph = r() * 6; C(g, x, y, 4 + 3 * Math.sin(t * 3 + ph), alpha(col, 0.5 + 0.5 * Math.sin(t * 3 + ph)), 0); } };

// ---------- backgrounds ----------
function bgArchive(g, t, o = {}) {
  g.fillStyle = '#1b1612'; g.fillRect(-W, -H, W * 3, H * 3);
  for (let s = 0; s < 4; s++) { const y = 140 + s * 200; R(g, -100, y + 150, W + 200, 18, '#3a2a1e', 0); const r = rng(s + 3); for (let x = -80; x < W + 80;) { const w = 50 + r() * 60, h = 90 + r() * 50; R(g, x, y + 150 - h, w, h, ['#5a4632', '#6e5638', '#4a3a2a', MANILA][Math.floor(r() * 4)], 3, 3); if (r() > 0.6) R(g, x + 8, y + 150 - h + 14, w - 16, 18, PAPER, 0); x += w + 6 + r() * 10; } }
  g.fillStyle = 'rgba(10,8,6,.55)'; g.fillRect(-W, -H, W * 3, H * 3);
  R(g, -100, 840, W + 200, 300, '#3a2a1e', 6); R(g, -100, 840, W + 200, 22, '#4e3a28', 0);
  const lx = o.lampX ?? 1500; const gr = g.createRadialGradient(lx, 760, 20, lx, 760, 900); gr.addColorStop(0, 'rgba(255,214,140,.35)'); gr.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gr; g.fillRect(-W, -H, W * 3, H * 3);
}
const MATRIX = (() => { const r = rng(5); return Array.from({ length: 90 }, () => [r() * W, r() * H, r(), ['0', '1', '01', '1101', '0x6F', '₿', 'Ξ'][Math.floor(r() * 7)]]); })();
function bgCyber(g, t, o = {}) {
  g.fillStyle = o.red ? '#140708' : '#050d09'; g.fillRect(-W, -H, W * 3, H * 3); const col = o.red ? '#ff4a3a' : NEON;
  g.font = '30px "Bebas"'; g.textAlign = 'center'; for (const [x, y, k, s] of MATRIX) { const yy = (y + t * (40 + k * 90)) % (H + 60) - 30; g.fillStyle = alpha(col, 0.08 + k * 0.14); g.fillText(s, x, yy); }
}
function bgOffice(g, t, o = {}) {
  const night = o.night; g.fillStyle = night ? '#1d2433' : '#c9d2dc'; g.fillRect(-W, -H, W * 3, H * 3);
  for (let i = 0; i < 3; i++) { const x = 160 + i * 600; R(g, x, 120, 420, 420, night ? '#0e1424' : '#9fc0dc', 6, 6); const r = rng(i + 9); for (let b = 0; b < 7; b++) { const bx = x + 20 + b * 58, bh = 100 + r() * 240; R(g, bx, 540 - bh, 46, bh, night ? '#2a3350' : '#b8cde0', 0); if (night) for (let w = 0; w < 8; w++) if (r() > 0.5) R(g, bx + 8 + (w % 2) * 18, 540 - bh + 16 + Math.floor(w / 2) * 30, 10, 12, '#ffd98a', 0); } L(g, [[x + 210, 120], [x + 210, 540]], 5); }
  R(g, -100, 700, W + 200, 500, night ? '#2a2f3a' : '#8a929e', 0); if (night) { g.fillStyle = 'rgba(10,14,30,.35)'; g.fillRect(-W, -H, W * 3, H * 3); }
}
function bgDesk(g) { g.fillStyle = '#3a2a1e'; g.fillRect(-W, -H, W * 3, H * 3); for (let i = 0; i < 14; i++) R(g, -100, i * 80, W + 200, 3, 'rgba(0,0,0,.25)', 0); const gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100); gr.addColorStop(0, 'rgba(255,214,140,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = gr; g.fillRect(-W, -H, W * 3, H * 3); }
function bgMap(g, t, o = {}) {
  g.fillStyle = '#0d1a22'; g.fillRect(-W, -H, W * 3, H * 3); g.strokeStyle = 'rgba(57,255,156,.08)'; g.lineWidth = 2; for (let x = 0; x <= W; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.save(); g.translate(0, 40); const land = '#1d3a34';
  for (const poly of WORLD) P(g, poly, land, 3);
  g.restore();
}
// rough continents (stylised)
const WORLD = [
  [[180, 220], [420, 160], [600, 210], [560, 330], [470, 420], [420, 520], [330, 470], [250, 360]], // N. America
  [[430, 540], [560, 560], [620, 660], [560, 820], [500, 900], [460, 780], [420, 640]],              // S. America
  [[860, 200], [1010, 170], [1060, 260], [980, 330], [880, 320]],                                     // Europe
  [[880, 380], [1060, 360], [1140, 480], [1080, 680], [990, 760], [930, 600], [860, 480]],            // Africa
  [[1060, 170], [1500, 140], [1700, 230], [1660, 340], [1520, 420], [1400, 470], [1260, 420], [1120, 330]], // Asia
  [[1520, 640], [1680, 620], [1740, 720], [1620, 780], [1520, 740]],                                  // Australia
];
const PLACE = { nk: [1548, 300], es: [912, 290], ar: [540, 800], co: [470, 560], us: [420, 330], uae: [1150, 420] };

// ---------- grain + vignette (post) ----------
const GRAIN = Array.from({ length: 4 }, (_, i) => { const c = document.createElement('canvas'); c.width = 480; c.height = 270; const x = c.getContext('2d'); const d = x.createImageData(480, 270); const r = rng(i + 1); for (let p = 0; p < d.data.length; p += 4) { const v = r() * 255; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = 34; } x.putImageData(d, 0, 0); return c; });
let VIG = null;
function post(g, t, o = {}) {
  if (!VIG) { VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H; const x = VIG.getContext('2d'); const gr = x.createRadialGradient(W / 2, H * 0.48, H * 0.35, W / 2, H / 2, H * 1.05); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.62)'); x.fillStyle = gr; x.fillRect(0, 0, W, H); }
  g.drawImage(VIG, 0, 0); g.save(); g.globalCompositeOperation = 'overlay'; g.drawImage(GRAIN[Math.floor(t * 12) % 4], 0, 0, W, H); g.restore();
}

// ---------- scenes ----------
const ex = (t, p, d) => K.exprAt(t, p.ex, p.expr || d);
const gaze = (t) => { const s = Math.floor(t / 2.3); const r = rng(s * 7 + 3); return [(r() - 0.5) * 0.5, (r() - 0.5) * 0.25]; };
const javiFace = (g, t, p, x = W / 2, y = H * 0.55, r = 240) => { const m = p.talk === false ? 0 : talkNow(); const nod = m * r * 0.02 + Math.sin(t * 1.1) * r * 0.01;
  toonBigFace(g, x, y + nod, r, { outfit: JAVI, expr: ex(t, p, 'neutral'), blink: K.blinkAt(t, 3.3), look: p.look || gaze(t), talk: m, t, tilt: (p.tilt || 0) + Math.sin(t * 0.8) * 0.025 + m * 0.012 }); };
function lanyard(g, x, y, r) { const k = r / 44; L(g, [[x - 18 * k, y + 52 * k], [x - 5 * k, y + 100 * k]], 5 * k, RED); L(g, [[x + 18 * k, y + 52 * k], [x + 5 * k, y + 100 * k]], 5 * k, RED); R(g, x - 16 * k, y + 96 * k, 32 * k, 22 * k, PAPER, 2 * k, 3 * k); }

export const S = {
  // 0-3: twenty minutes
  timer(g, t, d, p) {
    bgCyber(g, t); const k = clamp(t / 1.2); neon(g, () => BB(g, '20:00', W / 2, 470, 360, NEON, { stroke: 0 }), NEON, 40);
    BB(g, 'MINUTOS', W / 2, 700, 90, PAPER, { stroke: 0, alpha: k });
    const icons = [['🚿', 'UNA DUCHA LARGA'], ['📺', 'UN CAPÍTULO'], ['🛵', 'PEDIR COMIDA']];
    (p.icons || []).forEach((at, i) => { const s = S_(t, at, 0.3); if (s <= 0) return; g.save(); g.translate(360 + i * 600, 900); g.scale(s, s); R(g, -230, -70, 460, 140, '#0d1a14', 5, 20); g.font = '70px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(icons[i][0], -150, 0); AT(g, icons[i][1], 50, 0, 40, PAPER, { stroke: 0 }); g.restore(); });
  },
  // 4: $ counter + coins leaving
  moneyOut(g, t, d, p) {
    bgCyber(g, t, { red: true }); const k = ease.inOut(clamp(t / (d * 0.9)));
    for (let i = 0; i < 40; i++) { const q = (t * 0.7 + i / 40) % 1; const [sym, col] = COINS[i % 4]; coin(g, lerp(W / 2, -200 + (i * 211) % (W + 400), q), lerp(620, -150 + (i % 5) * 60, q), 36, sym, col, t * 3 + i); }
    neon(g, () => BB(g, '$' + fmt(6.3e9 * k), W / 2, 560, 230, '#ff6a5a', { stroke: 0 }), '#ff4a3a', 40);
    BB(g, 'EN VEINTE MINUTOS', W / 2, 760, 70, PAPER, { stroke: 0 });
  },
  // 5-7: no guns, no tunnels, no doors
  noWeapons(g, t, d, p) {
    bgArchive(g, t); const L3 = [['🔫', 'PISTOLAS'], ['⛏️', 'TÚNELES'], ['🚪', 'PUERTAS ROTAS']];
    (p.at || [0, 1, 2]).forEach((at, i) => { const s = S_(t, at, 0.3); if (s <= 0) return; const x = 380 + i * 580; g.save(); g.translate(x, 500); g.scale(s, s); R(g, -220, -220, 440, 440, PAPER, 6, 20); g.font = '200px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L3[i][0], 0, -30); AT(g, L3[i][1], 0, 160, 50, INK, { stroke: 0 }); g.restore(); xMark(g, x, 470, 170, clamp((t - at - 0.35) / 0.4)); });
  },
  // 8-10: friendly interview turns into the hacker
  teaser(g, t, d, p) {
    bgOffice(g, t, { night: true }); const gl = p.glitch ?? 99, on = t >= gl;
    laptop(g, W / 2, 940, 2.2, (s) => {
      if (!on) { s.fillStyle = '#e9eef3'; s.fillRect(-240, -150, 480, 300); toonBigFace(s, 0, 30, 70, { outfit: { top: 'suit', color: '#3a4a6a', color2: '#c0392b', hair: 'side', hairColor: '#4a3020' }, expr: 'smile', blink: K.blinkAt(t, 3), talk: 0, t }); }
      else { bgCyber(s, t); hacker(s, 0, 40, 0.55, t); }
      if (t > gl - 0.15 && t < gl + 0.25) { s.fillStyle = `rgba(57,255,156,${0.5 * Math.random()})`; for (let i = 0; i < 6; i++) s.fillRect(-240, -150 + Math.random() * 300, 480, 10 + Math.random() * 20); }
      R(s, -236, -144, 472, 30, '#1d2733', 0); AT(s, on ? '⚠ CONEXIÓN DESCONOCIDA' : 'ENTREVISTA DE TRABAJO · RR. HH.', 0, -128, 18, on ? '#ff6a5a' : PAPER, { stroke: 0 });
    });
    if (p.lbl != null) AT(g, 'UNA ENTREVISTA DE TRABAJO', W / 2, 120, 84, AMBER, { alpha: clamp((t - p.lbl) / 0.3) });
  },
  // 11-12: Javi, flashlight, title
  intro(g, t, d, p) {
    bgArchive(g, t, { lampX: 1500 }); const dark = clamp((t - (p.dark ?? 0.5)) / 0.8);
    guy(g, t, JAVI, 640, 1000, { s: 1.6, pose: t < 2 ? 'wave' : 'holdFront', expr: 'smile', talk: talkNow() });
    g.fillStyle = `rgba(0,0,0,${0.6 * dark})`; g.fillRect(-W, -H, W * 3, H * 3);
    if (dark > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(760, 560, 20, 1300, 560, 900); gr.addColorStop(0, `rgba(255,240,190,${0.35 * dark})`); gr.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gr; P(g, [[760, 560], [1900, 200], [1900, 920]], gr, 0); g.restore(); }
    if (p.title != null) { const s = S_(t, p.title, 0.45); if (s > 0) { g.save(); g.translate(1300, 470); g.scale(s, s); g.rotate(-0.03); R(g, -430, -90, 860, 180, '#0b0a09', 6); EL(g, 'ARCHIVO OSCURO', 0, 4, 96, PAPER, { ls: 6 }); g.restore(); stamp(g, t, 'EXPEDIENTE 001', 1340, 680, p.title + 0.5, { size: 54, rot: -0.08 }); } }
  },
  // 13-16: rules (confirmed / rumour)
  rules(g, t, d, p) {
    bgArchive(g, t); javiFace(g, t, p, 560, 600, 230); lanyard(g, 560, 600, 230 * 0.95);
    g.save(); g.translate(1350, 560); g.rotate(0.03); R(g, -330, -400, 660, 800, PAPER, 6, 10); EL(g, 'NORMAS DEL ARCHIVO', 0, -320, 46);
    if (p.conf != null) { stamp(g, t, 'CONFIRMADO', 0, -120, p.conf, { size: 60, rot: -0.06 }); EL(g, '= está probado', 0, -20, 36, '#4a4038', { alpha: clamp((t - p.conf - 0.3) / 0.3) }); }
    if (p.rum != null) { stamp(g, t, 'SIN CONFIRMAR', 0, 160, p.rum, { size: 60, rot: 0.05, col: '#c98a1a' }); EL(g, '= rumor o teoría', 0, 260, 36, '#4a4038', { alpha: clamp((t - p.rum - 0.3) / 0.3) }); }
    g.restore();
  },
  subscribe(g, t, d, p) {
    bgArchive(g, t); guy(g, t, JAVI, 560, 1000, { s: 1.6, pose: 'point', f: 1, expr: 'smile', talk: talkNow() });
    K.subscribeBtn(g, t, 1250, 520, 0.3, p.press ?? 99, 1.5);
    const s = S_(t, (p.press ?? 99) + 0.3, 0.3); if (s > 0) { g.save(); g.translate(1640, 520); g.scale(s, s); g.rotate(Math.sin(t * 20) * 0.2 * clamp(1 - (t - p.press - 0.3))); g.font = '110px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔔', 0, 0); g.restore(); }
    AT(g, 'ESTA SE PONE MUY RARA…', 1250, 760, 60, AMBER, { alpha: clamp((t - (p.rare ?? 2)) / 0.3) });
  },
  folder(g, t, d, p) {
    bgDesk(g); const o = ease.out(clamp((t - 0.3) / 0.7));
    g.save(); g.translate(W / 2, 560); R(g, -620, -380, 1240, 760, shade(MANILA, -0.15), 6, 10); R(g, -600, -360, 1200, 720, PAPER, 4, 4);
    EL(g, 'EXPEDIENTE Nº 001', -540, -280, 60, INK, { align: 'left' }); const lines = ['CASO: Robo a Binance', 'FECHA: 29 · 10 · 2026', 'BOTÍN: ≈ 6.300 millones de dólares', 'ESTADO: ABIERTO'];
    lines.forEach((l, i) => { const k = clamp((t - 0.6 - i * 0.45) / 0.4); const n = Math.floor(l.length * k); EL(g, l.slice(0, n), -540, -150 + i * 95, 50, INK, { align: 'left' }); });
    g.restore(); P(g, [[W / 2 - 620, 180], [W / 2 - 620 + 1240 * (1 - o), 180 - 60 * (1 - o)], [W / 2 - 620 + 1240 * (1 - o), 940 + 20 * (1 - o)], [W / 2 - 620, 940]], MANILA, 6);
    stamp(g, t, 'SIN RESOLVER', W / 2 + 330, 820, 2.6, { size: 60 });
  },
  // 19-24: what Binance is
  exchange(g, t, d, p) {
    bgMap(g, t); blipDots(g, t, 60, 4, 150, 150, 1650, 750, '#ffcf6a');
    g.save(); g.translate(W / 2, 980); R(g, -330, -560, 660, 560, '#2a3140', 6); P(g, [[-380, -560], [0, -720], [380, -560]], '#3a4356', 6); for (let i = 0; i < 4; i++) R(g, -280 + i * 150, -460, 90, 400, '#3a4356', 4);
    AT(g, 'BINANCE', 0, -600, 64, AMBER, { stroke: 8 }); g.restore();
    COINS.forEach(([s, c], i) => { const a = t * 0.8 + i * Math.PI / 2; coin(g, W / 2 + Math.cos(a) * 520, 560 + Math.sin(a) * 220, 54, s, c, t * 2 + i); });
    if (p.users != null) AT(g, 'MILLONES DE PERSONAS', W / 2, 140, 80, PAPER, { alpha: clamp((t - p.users) / 0.3) });
    if (p.small != null) { const s = S_(t, p.small); if (s > 0) { g.save(); g.translate(330, 860); g.scale(s, s); coin(g, 0, 0, 40, '$', '#3fae7a'); AT(g, 'UNOS POCOS DÓLARES', 0, 90, 40, PAPER); g.restore(); } }
    if (p.big != null) { const s = S_(t, p.big); if (s > 0) { g.save(); g.translate(1590, 860); g.scale(s, s); for (let i = 0; i < 9; i++) coin(g, (i % 3 - 1) * 60, -Math.floor(i / 3) * 40, 46, '₿', '#f2a33a'); AT(g, 'FORTUNAS ENTERAS', 0, 110, 40, PAPER); g.restore(); } }
  },
  // 25-29: cold vs hot wallet
  wallets(g, t, d, p) {
    bgArchive(g, t); R(g, W / 2 - 4, 120, 8, 760, '#5a4632', 0);
    const a1 = S_(t, p.cold ?? 0.3), a2 = S_(t, p.hot ?? 99);
    if (a1 > 0) { g.save(); g.translate(500, 560); g.scale(a1, a1); R(g, -230, -230, 460, 460, '#6f7880', 7, 18); vault(g, 0, 0, 150, t); L(g, [[230, 120], [300, 150], [290, 260]], 10, '#222'); xMark(g, 300, 260, 26, 1); for (let i = 0; i < 6; i++) { const y = ((t * 60 + i * 80) % 500) - 250; AT(g, '❄', -260 + (i * 97) % 520, y, 40, '#cfe9ff', { stroke: 0 }); } g.restore(); AT(g, 'BILLETERA FRÍA', 500, 880, 66, '#9fd8ff'); EL(g, 'desconectada · casi intocable', 500, 950, 34, PAPER); }
    if (a2 > 0) { g.save(); g.translate(1420, 700); g.scale(a2, a2); register(g, 0, 0, 1.3, t, { amount: '$ ' + fmt(1e6 + t * 377777) }); L(g, [[-230, -60], [-330, -60], [-330, 120]], 10, '#222'); if (p.out != null) for (let i = 0; i < 8; i++) { const q = ((t - p.out) * 0.8 + i / 8) % 1; if (t > p.out) coin(g, lerp(0, 380 * (i % 2 ? 1 : -1), q), lerp(-280, -560, q), 28, '$', '#3fae7a', t * 4 + i); } g.restore(); AT(g, 'BILLETERA CALIENTE', 1420, 880, 66, '#ff8a5a'); EL(g, 'conectada · lista para retirar', 1420, 950, 34, PAPER); }
  },
  // 30-35: key split in pieces, 5 must sign
  splitKey(g, t, d, p) {
    bgCyber(g, t); const sp = clamp((t - (p.split ?? 1)) / 0.9), sg = clamp((t - (p.sign ?? 99)) / 0.8);
    for (let i = 0; i < 5; i++) { const x = 260 + i * 350; server(g, x, 1010, 0.9, t, { seed: i }); const q = ease.out(sp); const kx = lerp(W / 2 - 160 + i * 80, x, q), ky = lerp(420, 560, q); g.save(); g.translate(kx, ky); g.rotate((1 - q) * 0.1 * i); R(g, -38, -22, 76, 44, AMBER, 4, 6); if (i === 0) C(g, -50, 0, 34, AMBER, 4); g.restore(); if (sg > 0) { g.save(); g.strokeStyle = alpha(NEON, sg); g.lineWidth = 6; g.setLineDash([16, 12]); g.lineDashOffset = -t * 60; g.beginPath(); g.moveTo(x, 520); g.lineTo(W / 2, 200); g.stroke(); g.restore(); } }
    if (sp < 1) { AT(g, 'LA LLAVE', W / 2, 260, 80, PAPER, { alpha: 1 - sp }); }
    else if (sg <= 0) AT(g, 'NADIE TIENE LA LLAVE COMPLETA', W / 2, 220, 70, AMBER);
    if (sg > 0) { const s = S_(t, p.sign + 0.6); if (s > 0) { g.save(); g.translate(W / 2, 180); g.scale(s, s); R(g, -230, -70, 460, 140, '#0d1a14', 6, 20); neon(g, () => AT(g, 'FIRMA ✓', 0, 4, 80, NEON, { stroke: 0 })); g.restore(); } }
  },
  fiveKeys(g, t, d, p) {
    bgArchive(g, t); vault(g, W / 2, 520, 300, t, { spin: ease.inOut(clamp((t - 1.2) / 1.5)) * 0.6 });
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; const x = W / 2 + Math.cos(a) * 420, y = 520 + Math.sin(a) * 420 + 260; g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2 + Math.sin(t * 2 + i) * 0.1); R(g, -16, -100, 32, 140, AMBER, 4, 6); C(g, 0, 70, 40, AMBER, 4); g.restore(); }
    AT(g, '5 LLAVES A LA VEZ', W / 2, 120, 80, PAPER);
  },
  javi(g, t, d, p) { bgArchive(g, t, { lampX: p.lampX ?? 1500 }); javiFace(g, t, p, p.x ?? W / 2, H * 0.56, p.r ?? 260); lanyard(g, p.x ?? W / 2, H * 0.56, (p.r ?? 260) * 0.95); if (p.say) (p.say || []).forEach(([str, at, col], i) => { const s = S_(t, at); if (s > 0) { g.save(); g.translate(p.sx ?? 1460, 260 + i * 130); g.scale(s, s); AT(g, str, 0, 0, p.ss || 72, col || AMBER); g.restore(); } }); },
  calendarFlip(g, t, d, p) {
    bgDesk(g); const months = p.months || [['SEPTIEMBRE', 1]]; const n = months.length; const per = (d - 0.6) / n; const i = Math.min(n - 1, Math.floor(Math.max(0, t - 0.3) / per));
    const [m, day] = months[i]; const k = clamp(((t - 0.3) % per) / 0.35); calendar(g, W / 2, 560, 1.4, m, day, { rot: -0.03 });
    if (i > 0 && k < 1) { g.save(); g.translate(W / 2, 560 - 190 * 1.4); g.scale(1, 1 - k); g.translate(-W / 2, -(560 - 190 * 1.4)); calendar(g, W / 2, 560, 1.4, months[i - 1][0], months[i - 1][1], { rot: -0.03 }); g.restore(); }
    if (p.lbl) AT(g, p.lbl, W / 2, 140, 70, AMBER);
  },
  // 40-43: engineer B
  engineer(g, t, d, p) {
    bgOffice(g, t); R(g, 300, 760, 1320, 40, '#6a4a32', 5); R(g, 340, 800, 30, 300, '#5a3a24', 4); R(g, 1550, 800, 30, 300, '#5a3a24', 4);
    guy(g, t, ENG_B, 760, 1060, { s: 1.5, pose: 'sit', expr: ex(t, p, 'neutral') });
    g.save(); g.translate(1100, 760); g.scale(0.7, 0.7); laptop(g, 0, 0, 1, (s) => { s.fillStyle = '#0d1117'; s.fillRect(-240, -150, 480, 300); for (let i = 0; i < 9; i++) R(s, -210 + (i % 3) * 20, -120 + i * 28, 120 + (i * 37) % 200, 10, ['#7ad', '#e8a', '#9e7'][i % 3], 0); }); g.restore();
    if (p.tag != null) { const s = S_(t, p.tag); if (s > 0) { g.save(); g.translate(760, 330); g.scale(s, s); R(g, -230, -60, 460, 120, PAPER, 6, 14); AT(g, 'INGENIERO B', 0, 4, 64, INK, { stroke: 0 }); g.restore(); } }
    if (p.redact != null) { const s = S_(t, p.redact); if (s > 0) { g.save(); g.translate(1350, 330); g.scale(s, s); R(g, -260, -50, 520, 100, PAPER, 5, 10); EL(g, 'NOMBRE:', -170, 2, 38); R(g, -60, -22, 290, 44, '#111', 0); g.restore(); } }
    if (p.ping != null && t > p.ping) { const s = S_(t, p.ping); g.save(); g.translate(1350, 520); g.scale(s, s); R(g, -300, -70, 600, 140, '#ffffff', 5, 22); g.font = '60px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('💼', -220, 0); AT(g, 'NUEVA OFERTA DE EMPLEO', 50, -16, 36, INK, { stroke: 0 }); EL(g, 'Director de proyectos', 50, 28, 28, '#666'); g.restore(); }
  },
  // 44-47 / 52-57: recruiter chat
  chat(g, t, d, p) {
    bgOffice(g, t, { night: p.night }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-W, -H, W * 3, H * 3);
    phoneUI(g, 460, 560, 1.45, (s) => { s.fillStyle = p.app === 'chat' ? '#0f2a24' : '#2a5bd7'; s.fillRect(-140, -290, 280, 70); C(s, -100, -255, 22, '#c9d2dc', 3); AT(s, p.app === 'chat' ? '«CEO»' : 'Director de proyectos', 10, -255, 22, '#fff', { stroke: 0 }); s.fillStyle = p.app === 'chat' ? '#122a26' : '#f4f1e8'; s.fillRect(-140, -220, 280, 510); (p.msgs || []).forEach(([str, at, me], i) => { if (t < at) return; R(s, me ? -20 : -120, -190 + i * 70, 140, 46, me ? '#d9f7c8' : (p.app === 'chat' ? '#1f4a40' : '#fff'), 2, 14); R(s, (me ? -5 : -105), -175 + i * 70, 100, 8, '#9aa', 0, 4); R(s, (me ? -5 : -105), -160 + i * 70, 70, 8, '#9aa', 0, 4); }); for (let i = 0; i < 3; i++) C(s, -20 + i * 20, 250, 6 + 2 * Math.sin(t * 8 + i), '#9aa', 0); });
    (p.msgs || []).forEach(([str, at, me], i) => bubble(g, t, me ? 1720 : 800, 250 + i * 130, str, at, { me, size: 40, max: 900 }));
    if (p.file != null) { const s = S_(t, p.file); if (s > 0) { g.save(); g.translate(1150, 820); g.scale(s, s); R(g, -300, -90, 600, 180, PAPER, 6, 16); g.font = '90px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('📁', -200, 0); EL(g, 'prueba_tecnica.zip', 60, -20, 40); EL(g, '2,4 MB · Descargar', 60, 30, 30, '#777'); g.restore(); } }
    if (p.stage) (p.stage || []).forEach(([str, at], i) => { const s = S_(t, at); if (s > 0) { g.save(); g.translate(1680, 860 + i * 0); g.scale(s, s); R(g, -200, -50, 400, 100, AMBER, 5, 50); AT(g, str, 0, 2, 44, INK, { stroke: 0 }); g.restore(); } });
  },
  thought(g, t, d, p) {
    bgOffice(g, t); guy(g, t, ENG_B, 700, 1060, { s: 1.6, pose: 'think', expr: ex(t, p, 'thinking') });
    (p.bubbles || []).forEach(([str, at], i) => { const s = S_(t, at); if (s <= 0) return; g.save(); g.translate(1250, 280 + i * 220); g.scale(s, s); O(g, 0, 0, 470, 95, '#fff', 5); AT(g, str, 0, 2, 46, INK, { stroke: 0 }); g.restore(); });
  },
  download(g, t, d, p) {
    bgOffice(g, t, { night: true }); const k = clamp((t - 0.4) / 1.6), run = t > (p.run ?? 2.2);
    laptop(g, W / 2, 960, 2.3, (s) => { s.fillStyle = '#0d1117'; s.fillRect(-240, -150, 480, 300); EL(s, run ? '> npm start' : 'Descargando…', -200, -100, 26, NEON, { align: 'left' }); R(s, -200, -40, 400, 30, '#1d2733', 2, 8); R(s, -200, -40, 400 * k, 30, NEON, 0, 8); BB(s, Math.round(k * 100) + '%', 0, 30, 40, PAPER, { stroke: 0 }); if (run) { EL(s, '✓ prueba técnica en marcha', -200, 90, 22, NEON, { align: 'left' }); } });
    if (p.lbl) AT(g, p.lbl, W / 2, 110, 76, AMBER);
  },
  checklist(g, t, d, p) {
    bgArchive(g, t); if (p.javi !== false) { javiFace(g, t, p, 380, 640, 200); lanyard(g, 380, 640, 190); }
    g.save(); g.translate(1180, 560); g.rotate(-0.015); R(g, -560, -420, 1120, 840, PAPER, 6, 10); if (p.title) EL(g, p.title, 0, -350, 50, RED);
    (p.items || []).forEach(([str, at, mark], i) => { if (t < at) return; const y = -230 + i * (p.gap || 120); const k = clamp((t - at) / 0.4); EL(g, str.slice(0, Math.ceil(str.length * k)), -440, y, p.size || 50, INK, { align: 'left' }); if (mark === 'x') xMark(g, -490, y, 24, clamp((t - at - 0.3) / 0.3)); else if (mark === '!') AT(g, '!', -490, y, 60, RED, { stroke: 0 }); else check(g, -490, y, 26, clamp((t - at - 0.3) / 0.3), '#2a8a4a'); });
    g.restore();
  },
  chef(g, t, d, p) { bgArchive(g, t); g.font = '300px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('👨‍🍳', 560, 520); g.fillText('💻', 1360, 520); AT(g, '=', W / 2, 520, 200, AMBER); AT(g, 'LA PRUEBA ES NORMAL', W / 2, 880, 80, PAPER); },
  // 67: work computer punch
  workPC(g, t, d, p) {
    bgOffice(g, t, { night: true }); laptop(g, W / 2, 900, 2.0, (s) => { s.fillStyle = '#0d1117'; s.fillRect(-240, -150, 480, 300); EL(s, '✓ prueba técnica en marcha', 0, 0, 26, NEON); });
    stamp(g, t, 'ORDENADOR DEL TRABAJO', W / 2, 160, 0.3, { size: 70, rot: -0.04 });
  },
  // 68-74: malware slips in, nobody notices
  malware(g, t, d, p) {
    bgOffice(g, t, { night: true }); const inside = clamp((t - 0.6) / 2.2);
    laptop(g, W / 2, 960, 2.3, (s) => { s.fillStyle = '#0d1117'; s.fillRect(-240, -150, 480, 300); EL(s, '✓ Todo correcto', 0, -60, 34, NEON); EL(s, 'prueba técnica: OK', 0, 0, 26, PAPER); });
    const bx = lerp(260, W / 2 - 60, inside), by = lerp(1000, 620, inside) + Math.sin(t * 9) * 8; if (inside < 1) { g.save(); g.translate(bx, by); g.rotate(Math.sin(t * 12) * 0.2); O(g, 0, 0, 34, 24, '#ff3a2a', 4); for (let i = -1; i <= 1; i++) { L(g, [[i * 14, 18], [i * 20, 40 + Math.sin(t * 20 + i) * 6]], 4); L(g, [[i * 14, -18], [i * 20, -40 - Math.sin(t * 20 + i) * 6]], 4); } C(g, 22, -6, 5, '#fff', 0); g.restore(); }
    if (p.lbl != null) stamp(g, t, 'MALWARE NUEVO', 1500, 300, p.lbl, { size: 58 });
    if (p.nd != null) stamp(g, t, 'NO DETECTADO', 1500, 450, p.nd, { size: 58, col: AMBER });
    (p.none || []).forEach(([str, at], i) => { const s = S_(t, at); if (s <= 0) return; g.save(); g.translate(360, 260 + i * 170); g.scale(s, s); R(g, -230, -60, 460, 120, PAPER, 5, 16); AT(g, str, 30, 2, 48, INK, { stroke: 0 }); g.restore(); xMark(g, 180, 260 + i * 170, 34, clamp((t - at - 0.3) / 0.3)); });
  },
  // 75: someone, somewhere
  somewhere(g, t, d, p) {
    bgMap(g, t); const k = clamp((t - 0.5) / 1.2); const [x, y] = PLACE.nk; const px = lerp(W / 2, x, 0), py = lerp(H / 2, y, 0);
    for (let i = 0; i < 3; i++) { const q = ((t * 0.8 + i / 3) % 1); g.strokeStyle = alpha('#ff4a3a', 1 - q); g.lineWidth = 6; g.beginPath(); g.arc(W / 2 + 40, 420, 30 + q * 200, 0, Math.PI * 2); g.stroke(); }
    AT(g, '?', W / 2 + 40, 420, 140, '#ff4a3a'); hacker(g, 1500, 820, 0.6 * k + 0.001, t); AT(g, 'ALGUIEN, EN ALGÚN LUGAR…', W / 2, 980, 70, PAPER);
  },
  // 76-82: patience – watching the office for weeks
  watching(g, t, d, p) {
    bgCyber(g, t); for (let i = 0; i < 6; i++) { const x = 330 + (i % 3) * 420, y = 230 + Math.floor(i / 3) * 290; R(g, x - 190, y - 120, 380, 240, '#0f1a22', 5, 8); g.save(); g.beginPath(); g.rect(x - 180, y - 110, 360, 220); g.clip(); g.translate(x, y); g.scale(0.25, 0.25); g.translate(-W / 2, -H / 2); bgOffice(g, t + i); g.restore(); AT(g, 'CAM ' + (i + 1), x - 140, y - 92, 22, NEON, { stroke: 0 }); C(g, x + 160, y - 95, 7, Math.sin(t * 6) > 0 ? '#ff3a2a' : '#3a1a1a', 0); }
    hacker(g, 1660, 900, 0.75, t, { grin: p.grin ?? 1 }); if (p.lbl) AT(g, p.lbl, W / 2 - 200, 960, 76, AMBER);
  },
  attic(g, t, d, p) {
    bgOffice(g, t, { night: true }); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-W, -H, W * 3, H * 3);
    g.save(); g.translate(W / 2, 980); R(g, -520, -460, 1040, 460, '#e8dcc4', 6); P(g, [[-600, -460], [0, -800], [600, -460]], '#7a4a3a', 6); R(g, -520, -230, 1040, 10, '#8a6a4a', 0);
    for (let i = 0; i < 3; i++) guy(g, t, USER(['#c0392b', '#3f8fb0', '#e8a33a'][i], 'side'), -360 + i * 300, -20, { s: 0.75, pose: 'stand', expr: 'neutral', seed: i });
    g.save(); g.beginPath(); g.moveTo(-600, -460); g.lineTo(0, -800); g.lineTo(600, -460); g.clip(); hacker(g, 0, -520, 0.45, t); g.restore(); g.restore();
    AT(g, 'ESCONDIDO EN EL ÁTICO', W / 2, 110, 76, AMBER);
  },
  // 85-90: lateral movement B -> A, C
  network(g, t, d, p) {
    bgCyber(g, t); const pts = { B: [W / 2, 820], A: [420, 380], C: [1500, 380] };
    for (const [k, [x, y]] of Object.entries(pts)) { g.save(); g.translate(x, y); g.scale(0.55, 0.55); laptop(g, 0, 160, 1, (s) => { s.fillStyle = k === 'B' || t > (p.spread ?? 99) + 1 ? '#2a0d0d' : '#0d1117'; s.fillRect(-240, -150, 480, 300); }); g.restore(); AT(g, 'INGENIERO ' + k, x, y + 170, 46, PAPER); }
    const sp = clamp((t - (p.spread ?? 99)) / 1.2); for (const k of ['A', 'C']) { if (sp <= 0) break; const [x0, y0] = pts.B, [x1, y1] = pts[k]; g.save(); g.strokeStyle = '#ff4a3a'; g.lineWidth = 8; g.setLineDash([22, 14]); g.lineDashOffset = -t * 80; g.beginPath(); g.moveTo(x0, y0 - 120); g.lineTo(lerp(x0, x1, sp), lerp(y0 - 120, y1 + 20, sp)); g.stroke(); g.restore(); }
    if (p.ai != null) { const s = S_(t, p.ai); if (s > 0) { g.save(); g.translate(W / 2, 470); g.scale(s, s); R(g, -150, -70, 300, 140, '#1d2733', 6, 20); neon(g, () => AT(g, 'IA INTERNA', 0, 4, 52, NEON, { stroke: 0 })); g.restore(); } }
    if (p.q != null) { const s = S_(t, p.q, 0.4); if (s > 0) { g.save(); g.translate(W / 2, 470); g.scale(s, s); AT(g, '?', 0, -150, 200, AMBER); g.restore(); } unconfirmed(g, t, p.q + 0.4, 'PIEZA QUE FALTA'); }
  },
  // 91-96: the token / maintenance keycard
  token(g, t, d, p) {
    bgOffice(g, t, { night: true }); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-W, -H, W * 3, H * 3);
    const s = S_(t, p.card ?? 0.4, 0.5); if (s > 0) { g.save(); g.translate(W / 2, 520); g.scale(s, s); g.rotate(Math.sin(t) * 0.04); neon(g, () => R(g, -360, -220, 720, 440, '#e8eef2', 6, 30), AMBER, 40); R(g, -360, -220, 720, 110, p.maint && t > p.maint ? '#c0392b' : '#2a5bd7', 0, 30); R(g, -360, -130, 720, 20, p.maint && t > p.maint ? '#c0392b' : '#2a5bd7', 0);
      AT(g, p.maint && t > p.maint ? 'PERSONAL DE MANTENIMIENTO' : 'TOKEN DE ACCESO', 0, -165, 52, '#fff', { stroke: 0 }); R(g, -300, -60, 180, 220, '#c9d2dc', 4, 10); C(g, -210, 10, 50, '#9aa', 0); EL(g, 'Permiso:', 20, -30, 40, INK, { align: 'left' }); EL(g, 'desplegar contenedores', 20, 30, 36, RED, { align: 'left' }); R(g, 200, 110, 120, 80, AMBER, 4, 8); g.restore(); }
    if (p.box != null) { const k = S_(t, p.box); if (k > 0) { g.save(); g.translate(1620, 860); g.scale(k, k); R(g, -150, -100, 300, 200, '#2a7a8a', 6, 8); for (let i = 0; i < 5; i++) L(g, [[-120 + i * 60, -90], [-120 + i * 60, 90]], 4); AT(g, 'CONTENEDOR', 0, 140, 40, PAPER); g.restore(); } }
    if (p.doors != null) { const k = S_(t, p.doors); if (k > 0) { g.save(); g.translate(330, 820); g.scale(k, k); R(g, -150, -250, 300, 500, '#5a6270', 6, 6); C(g, 100, 0, 14, AMBER, 3); R(g, -130, -230, 260, 80, '#c0392b', 3, 4); AT(g, 'SOLO PERSONAL', 0, -190, 30, '#fff', { stroke: 0 }); g.restore(); } }
  },
  // 99-103: date + world clocks
  clocks(g, t, d, p) {
    bgArchive(g, t); const C4 = [['UTC', 'HORA UNIVERSAL', 20, 5], ['ESPAÑA', '21:05', 21, 5], ['BUENOS AIRES', '17:05', 17, 5], ['BOGOTÁ', '15:05', 15, 5]];
    (p.at || []).forEach((at, i) => { const s = S_(t, at); if (s <= 0) return; g.save(); g.translate(300 + i * 440, 520); g.scale(s, s); clockFace(g, 0, 0, 150, C4[i][2], C4[i][3], C4[i][0], i === 0 ? '20:05' : C4[i][1]); g.restore(); });
  },
  // 104-105: container deployed into the signing service
  deploy(g, t, d, p) {
    bgCyber(g, t); for (let i = 0; i < 4; i++) server(g, 300 + i * 240, 1000, 0.95, t, { seed: i, alarm: t > 2.5 });
    const k = ease.inOut(clamp((t - 0.5) / 1.6)); g.save(); g.translate(lerp(-200, 660, k), 300); R(g, -110, -70, 220, 140, '#2a7a8a', 6, 8); for (let i = 0; i < 4; i++) L(g, [[-80 + i * 55, -60], [-80 + i * 55, 60]], 4); g.restore(); AT(g, 'CONTENEDOR', lerp(-200, 660, k), 410, 34, PAPER, { alpha: k });
    if (p.core != null) { const s = S_(t, p.core); if (s > 0) { g.save(); g.translate(1520, 520); g.scale(s, s); neon(g, () => C(g, 0, 0, 200, '#0d1a14', 6), '#ff4a3a', 50 + 20 * Math.sin(t * 6)); AT(g, 'SERVICIO', 0, -40, 60, PAPER, { stroke: 0 }); AT(g, 'DE FIRMAS', 0, 40, 60, '#ff6a5a', { stroke: 0 }); g.restore(); g.save(); g.strokeStyle = '#ff4a3a'; g.lineWidth = 8; g.setLineDash([20, 12]); g.lineDashOffset = -t * 90; g.beginPath(); g.moveTo(780, 300); g.lineTo(1320, 480); g.stroke(); g.restore(); } }
  },
  // 106-112: the lock opens by itself
  lock(g, t, d, p) {
    bgArchive(g, t); const open = clamp((t - (p.open ?? 99)) / 0.5);
    g.save(); g.translate(W / 2, 600); g.lineWidth = 46; g.strokeStyle = OL; g.beginPath(); g.arc(0, -170 - open * 120, 170, Math.PI, 0); g.stroke(); g.lineWidth = 30; g.strokeStyle = STEEL; g.beginPath(); g.arc(0, -170 - open * 120, 170, Math.PI, 0); g.stroke();
    R(g, -260, -200, 520, 420, '#c9a23a', 8, 40); C(g, 0, -10, 40, OL, 0); P(g, [[-18, 0], [18, 0], [26, 110], [-26, 110]], OL, 0); g.restore();
    if (p.key != null) { const s = S_(t, p.key); if (s > 0) { g.save(); g.translate(360, 380); g.scale(s, s); R(g, -20, -110, 40, 160, AMBER, 4, 6); C(g, 0, 80, 50, AMBER, 4); g.restore(); xMark(g, 360, 420, 110, clamp((t - p.key - 0.3) / 0.4)); } }
    if (p.inside != null) { const s = S_(t, p.inside); if (s > 0) { g.save(); g.translate(1520, 820); g.scale(s, s); hacker(g, 0, 0, 0.5, t); g.restore(); } }
    if (p.lbl) (p.lbl || []).forEach(([str, at], i) => AT(g, str, W / 2, 1000 - 0 * i, 64, AMBER, { alpha: clamp((t - at) / 0.3) * (i === p.lbl.length - 1 || t < p.lbl[i + 1][1] ? 1 : 0) }));
  },
  // 113-124: the drain
  drain(g, t, d, p) {
    bgCyber(g, t, { red: true }); const mode = p.mode || 'btc';
    if (mode === 'btc') { const k = clamp((t - 0.6) / 2); coin(g, W / 2, 470, 230, '₿', '#f2a33a', t * 1.5); neon(g, () => BB(g, fmt(18270 * k) + ' BTC', W / 2, 820, 170, '#ffcf6a', { stroke: 0 }), '#ff9a3a', 30); if (p.lbl) AT(g, p.lbl, W / 2, 120, 64, PAPER, { alpha: clamp((t - (p.lblAt || 0)) / 0.3) }); }
    if (mode === 'multi') { const L4 = [['₿', '#f2a33a', 'BITCOIN'], ['Ξ', '#7a86d8', 'ETHEREUM'], ['$', '#3fae7a', 'MONEDAS ESTABLES'], ['◆', '#f0c43a', 'TOKENS']]; (p.at || []).forEach((at, i) => { const s = S_(t, at); if (s <= 0) return; const x = 300 + i * 440; g.save(); g.translate(x, 480); g.scale(s, s); coin(g, 0, 0, 120, L4[i][0], L4[i][1], t * 2 + i); AT(g, L4[i][2], 0, 200, 44, PAPER); g.restore(); for (let j = 0; j < 4; j++) { const q = ((t - at) * 0.9 + j / 4) % 1; coin(g, x + q * 300, 480 - q * 600, 30, L4[i][0], L4[i][1], t * 4 + j); } }); }
    if (mode === 'chains') { const n = 10; for (let i = 0; i < n; i++) { const x = 140 + i * 182; R(g, x - 40, 200, 80, 700, '#1d2733', 5, 10); const k = (t * 1.4 + i * 0.13) % 1; for (let j = 0; j < 3; j++) { const q = (k + j / 3) % 1; coin(g, x, 220 + q * 660, 30, COINS[i % 4][0], COINS[i % 4][1], t * 5 + i); } } AT(g, '10 CADENAS DE BLOQUES', W / 2, 120, 80, AMBER); BB(g, 'A LA VEZ', W / 2, 980, 80, PAPER); }
    if (mode === 'registers') { for (let i = 0; i < 10; i++) { const x = 230 + (i % 5) * 365, y = 470 + Math.floor(i / 5) * 400; register(g, x, y, 0.7, t, { amount: '$ ' + fmt(Math.max(0, 9e8 - (t * 3.1e8 + i * 4e7))) }); for (let j = 0; j < 2; j++) { const q = ((t * 1.2 + j / 2 + i * 0.1) % 1); coin(g, x + q * 120, y - 200 - q * 200, 20, '$', '#3fae7a', t * 5); } } AT(g, '10 CAJAS · 10 TIENDAS · 1 MINUTO', W / 2, 110, 70, AMBER); }
    if (mode === 'clock') { const k = clamp(t / (d * 0.9)); g.save(); g.translate(W / 2, 520); C(g, 0, 0, 330, '#0d1a14', 8); g.strokeStyle = '#ff4a3a'; g.lineWidth = 40; g.beginPath(); g.arc(0, 0, 290, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke(); neon(g, () => BB(g, '20 MIN', 0, 10, 170, '#ff6a5a', { stroke: 0 }), '#ff4a3a', 30); g.restore(); confirmed(g, t, p.conf ?? 99, 'TRM LABS'); }
    if (p.conf != null && mode !== 'clock') confirmed(g, t, p.conf);
  },
  // 125-131: 5 million per second
  perSecond(g, t, d, p) {
    bgCyber(g, t, { red: true }); neon(g, () => BB(g, '+ $' + fmt(5.25e6 * t), W / 2, 380, 200, '#ff6a5a', { stroke: 0 }), '#ff4a3a', 30); BB(g, 'POR CADA SEGUNDO', W / 2, 560, 80, PAPER, { stroke: 0 });
    const I3 = [['🚚', 'CAMIÓN BLINDADO'], ['🚘', 'MATRÍCULA'], ['📹', 'CÁMARAS']]; (p.icons || []).forEach((at, i) => { const s = S_(t, at); if (s <= 0) return; const x = 420 + i * 540; g.save(); g.translate(x, 820); g.scale(s, s); R(g, -220, -100, 440, 200, PAPER, 5, 18); g.font = '110px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(I3[i][0], -110, -5); AT(g, I3[i][1], 70, 0, 34, INK, { stroke: 0 }); g.restore(); xMark(g, x, 820, 80, clamp((t - at - 0.3) / 0.3)); });
  },
  addresses(g, t, d, p) { bgCyber(g, t); const r = rng(3); for (let i = 0; i < 16; i++) { const y = ((i * 70 + t * 160) % (H + 100)) - 50; const a = '0x' + Array.from({ length: 24 }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join(''); BB(g, a + '  →  ' + fmt(1e5 + r() * 9e7) + ' $', W / 2, y, 52, alpha(NEON, 0.5 + 0.5 * Math.sin(i + t)), { stroke: 0 }); } AT(g, 'A LA VELOCIDAD DE INTERNET', W / 2, H / 2, 90, PAPER); },
  // 132-138: security room
  secRoom(g, t, d, p) {
    g.fillStyle = '#121620'; g.fillRect(-W, -H, W * 3, H * 3); for (let i = 0; i < 5; i++) { const x = 220 + i * 370; R(g, x - 160, 160, 320, 220, '#0d1117', 6, 8); g.save(); g.beginPath(); g.rect(x - 150, 170, 300, 200); g.clip(); g.strokeStyle = '#ff4a3a'; g.lineWidth = 5; g.beginPath(); for (let j = 0; j <= 20; j++) { const xx = x - 150 + j * 15, yy = 200 + j * 8 + Math.sin(j * 1.3 + i) * 10 + clamp(t / d) * 40; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); BB(g, '−' + fmt(1e7 * (t + i)), x, 345, 34, '#ff6a5a', { stroke: 0 }); g.restore(); }
    for (let i = 0; i < 3; i++) guy(g, t, STAFF(['#d8d2c4', '#9fc6d8', '#e8c88a'][i], ['side', 'bun', 'messy'][i], '#3a2a20'), 520 + i * 440, 1060, { s: 1.35, pose: i === 1 ? 'handsOnHead' : i === 2 ? 'point' : 'facepalm', expr: i === 1 ? 'scared' : 'worried', seed: i });
    g.fillStyle = `rgba(220,40,30,${0.2 * (0.5 + 0.5 * Math.sin(t * 8))})`; g.fillRect(-W, -H, W * 3, H * 3);
    if (p.lbl) AT(g, p.lbl, W / 2, 500, 70, AMBER);
  },
  noSingleKey(g, t, d, p) { bgCyber(g, t, { red: true }); for (let i = 0; i < 5; i++) { const x = 300 + i * 330; R(g, x - 50, 480, 100, 60, AMBER, 4, 6); } xMark(g, W / 2, 510, 140, clamp((t - 0.6) / 0.5)); AT(g, 'NO HABÍA UNA ÚNICA LLAVE', W / 2, 220, 80, PAPER); AT(g, 'QUE CANCELAR', W / 2, 330, 80, AMBER); if (p.lbl != null) BB(g, 'CADA MINUTO, MILLONES', W / 2, 860, 90, '#ff6a5a', { alpha: clamp((t - p.lbl) / 0.3) }); },
  // 139-145: the number
  bigNumber(g, t, d, p) {
    bgArchive(g, t); const s = S_(t, p.num ?? 0.3, 0.5);
    if (s > 0) { g.save(); g.translate(W / 2, 400); g.scale(s, s); neon(g, () => BB(g, '$6.300.000.000', 0, 0, 230, AMBER, { stroke: 10 }), '#ff9a3a', 30); g.restore(); }
    if (p.range != null) { const k = clamp((t - p.range) / 0.6); R(g, 360, 640, 1200, 30, '#3a2a1e', 4, 15); R(g, 360 + 1200 * 0.15, 640, 1200 * 0.7 * k, 30, AMBER, 0, 15); BB(g, '6.150 M', 360 + 1200 * 0.15, 720, 50, PAPER, { alpha: k }); BB(g, '6.360 M', 360 + 1200 * 0.85, 720, 50, PAPER, { alpha: k }); EL(g, 'según los rastreadores', W / 2, 790, 36, PAPER, { alpha: k }); }
    if (p.record != null) stamp(g, t, 'RÉCORD HISTÓRICO', W / 2, 900, p.record, { size: 70 });
    if (p.conf != null) confirmed(g, t, p.conf);
  },
  bars(g, t, d, p) {
    bgArchive(g, t); const k1 = ease.out(clamp((t - 0.4) / 0.8)), k2 = ease.out(clamp((t - (p.b2 ?? 1.4)) / 1.2));
    R(g, 560, 900 - 140 * k1, 300, 140 * k1, '#7a86d8', 6, 8); AT(g, 'BYBIT · 2025', 710, 960, 46, PAPER); BB(g, '1.500 M', 710, 860 - 140 * k1, 60, PAPER, { alpha: k1 });
    R(g, 1060, 900 - 590 * k2, 300, 590 * k2, '#ff6a5a', 6, 8); AT(g, 'BINANCE · 2026', 1210, 960, 46, PAPER); BB(g, '6.300 M', 1210, 860 - 590 * k2, 60, PAPER, { alpha: k2 });
    if (p.x4 != null) { const s = S_(t, p.x4); if (s > 0) { g.save(); g.translate(1600, 380); g.scale(s, s); neon(g, () => AT(g, '×4', 0, 0, 220, AMBER), '#ff9a3a', 30); g.restore(); } }
  },
  // 146-151: users panic
  usersPanic(g, t, d, p) {
    bgOffice(g, t, { night: true }); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(-W, -H, W * 3, H * 3);
    phoneUI(g, 480, 560, 1.45, (s) => { s.fillStyle = '#1d1d24'; s.fillRect(-140, -290, 280, 580); AT(s, '⚠', 0, -130, 120, AMBER, { stroke: 0 }); AT(s, 'RETIROS', 0, 10, 46, '#fff', { stroke: 0 }); AT(s, 'SUSPENDIDOS', 0, 70, 46, '#ff6a5a', { stroke: 0 }); R(s, -110, 160, 220, 60, '#3a3a44', 0, 30); AT(s, 'Reintentar', 0, 190, 28, '#888', { stroke: 0 }); }, { bg: '#1d1d24' });
    if (p.suspend != null) confirmed(g, t, p.suspend);
    (p.posts || []).forEach(([str, at], i) => bubble(g, t, 900, 230 + i * 150, str, at, { size: 40, max: 900 }));
  },
  chartDrop(g, t, d, p) {
    g.fillStyle = '#0d1117'; g.fillRect(-W, -H, W * 3, H * 3); g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; for (let y = 200; y < 950; y += 100) { g.beginPath(); g.moveTo(150, y); g.lineTo(1770, y); g.stroke(); }
    const k = clamp((t - 0.3) / 2.2); const r = rng(7); g.strokeStyle = '#ff4a3a'; g.lineWidth = 8; g.lineJoin = 'round'; g.beginPath(); let y = 380; for (let i = 0; i <= 60 * k; i++) { y += (r() - 0.35) * 18 + (i > 30 ? 6 : 0); const x = 150 + i * 27; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    BB(g, 'BTC', 260, 150, 70, '#f2a33a', { stroke: 0 }); BB(g, 'BNB', 440, 150, 70, '#f0c43a', { stroke: 0 }); neon(g, () => BB(g, '−5 %', 1500, 260, 200, '#ff6a5a', { stroke: 0 }), '#ff4a3a', 30); EL(g, 'aprox.', 1500, 380, 40, PAPER);
  },
  // 155-160: freeze
  freeze(g, t, d, p) {
    bgCyber(g, t); const k = clamp((t - 0.8) / 2); for (let i = 0; i < 12; i++) { const x = 260 + (i % 6) * 280, y = 360 + Math.floor(i / 6) * 300; coin(g, x, y, 80, COINS[i % 4][0], COINS[i % 4][1], i < 6 * k * 2 ? 0 : t * 2 + i); if (i < 12 * k) { g.save(); g.globalAlpha = 0.7; R(g, x - 110, y - 110, 220, 220, '#bfe6ff', 4, 18); g.restore(); } }
    AT(g, 'CONGELADO', W / 2, 140, 100, '#bfe6ff'); if (p.num != null) { const s = S_(t, p.num); if (s > 0) { g.save(); g.translate(W / 2, 930); g.scale(s, s); BB(g, p.numTxt || '≈ 3.000 M', 0, 0, 120, PAPER); g.restore(); } }
    if (p.conf != null) confirmed(g, t, p.conf, p.confTxt || 'CONFIRMADO');
  },
  half(g, t, d, p) { bgArchive(g, t); const k = ease.out(clamp((t - 0.3) / 1.2)); g.save(); g.translate(W / 2, 520); C(g, 0, 0, 300, '#ff6a5a', 7); g.fillStyle = '#bfe6ff'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 300, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.45 * k); g.closePath(); g.fill(); g.strokeStyle = OL; g.lineWidth = 7; g.stroke(); g.restore(); AT(g, 'CASI LA MITAD', W / 2, 920, 90, '#bfe6ff'); AT(g, 'NO LA PUDIERON TOCAR', W / 2, 1010, 60, PAPER); },
  // 161-166: refill + reopen
  refill(g, t, d, p) {
    bgArchive(g, t); register(g, W / 2, 900, 1.3, t, { amount: Math.round(clamp((t - 1) / (d - 1.5)) * 98) + ' %' });
    const SRC = ['FONDO DE SEGURIDAD', 'FONDO DE SEGURO', 'RESERVAS DE BITCOIN', 'TESORERÍA']; (p.src || []).forEach((at, i) => { const s = S_(t, at); if (s <= 0) return; const x = 260 + i * 470; g.save(); g.translate(x, 230); g.scale(s, s); R(g, -210, -60, 420, 120, MANILA, 5, 12); AT(g, SRC[i], 0, 2, 36, INK, { stroke: 0 }); g.restore(); for (let j = 0; j < 3; j++) { const q = ((t - at) * 0.8 + j / 3) % 1; coin(g, lerp(x, W / 2, q), lerp(300, 640, q), 26, '$', '#3fae7a', t * 5 + j); } });
    if (p.own != null) AT(g, 'CON SU PROPIO DINERO', W / 2, 420, 76, AMBER, { alpha: clamp((t - p.own) / 0.3) });
    if (p.pct != null) { stamp(g, t, '98 % REPUESTO · 31 OCT', W / 2, 520, p.pct, { size: 60, col: NEON, fill: '#0b130e' }); confirmed(g, t, p.pct + 0.6); }
  },
  reopen(g, t, d, p) {
    bgOffice(g, t); const o = ease.inOut(clamp((t - 0.6) / 1.2)); R(g, 360, 300, 1200, 600, '#2a2f3a', 6); R(g, 360, 300, 600 * (1 - o), 600, '#6a7280', 6); R(g, 960 + 600 * o, 300, 600 * (1 - o), 600, '#6a7280', 6);
    AT(g, 'RETIROS ABIERTOS', W / 2, 600, 90, NEON, { alpha: o }); calendar(g, 1680, 300, 0.6, 'NOVIEMBRE', 1);
    if (p.queue != null) for (let i = 0; i < 7; i++) { const x = 150 + i * 120 - ((t - p.queue) * 60 % 120); if (t > p.queue) guy(g, t, USER(['#c0392b', '#3f8fb0', '#e8a33a', '#5a8a5a', '#8a5a8a', '#3fae7a', '#d8a04a'][i], ['side', 'bun', 'messy', 'curly', 'side', 'bun', 'messy'][i]), x, 1060, { s: 0.9, pose: 'holdFront', expr: 'worried', seed: i }); }
    if (p.num != null) { const s = S_(t, p.num); if (s > 0) { g.save(); g.translate(W / 2, 200); g.scale(s, s); BB(g, '+3.600 M EN RETIRADAS', 0, 0, 90, AMBER); g.restore(); } }
    if (p.conf != null) confirmed(g, t, p.conf);
  },
  stands(g, t, d, p) { bgArchive(g, t); g.save(); g.translate(W / 2, 980); R(g, -330, -560, 660, 560, '#2a3140', 6); P(g, [[-380, -560], [0, -720], [380, -560]], '#3a4356', 6); AT(g, 'BINANCE', 0, -600, 64, AMBER, { stroke: 8 }); g.restore(); const s = S_(t, p.shield ?? 1); if (s > 0) { g.save(); g.translate(1520, 520); g.scale(s, s); P(g, [[0, -200], [170, -140], [150, 80], [0, 200], [-150, 80], [-170, -140]], '#3fae7a', 8); check(g, 0, 0, 80, 1, '#fff'); g.restore(); } AT(g, p.lbl || 'AGUANTÓ', W / 2, 130, 90, NEON); },
  who(g, t, d, p) { g.fillStyle = '#050505'; g.fillRect(-W, -H, W * 3, H * 3); const x = W / 2 + Math.sin(t * 1.3) * 400, y = H / 2 + Math.cos(t * 1.7) * 160; g.save(); const gr = g.createRadialGradient(x, y, 10, x, y, 380); gr.addColorStop(0, 'rgba(255,240,190,.55)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gr; g.fillRect(-W, -H, W * 3, H * 3); g.restore(); AT(g, '¿QUIÉN?', W / 2, H / 2, 300, PAPER, { alpha: 0.85 }); },
  // 177-188: FBI dossier
  dossier(g, t, d, p) {
    bgDesk(g); g.save(); g.translate(W / 2 - 120, 560); g.rotate(-0.02); R(g, -560, -400, 1120, 800, MANILA, 6, 10); R(g, -520, -360, 1040, 720, PAPER, 4, 4);
    AT(g, p.head || 'INFORME · FBI', -480, -300, 50, INK, { stroke: 0, align: 'left' }); const ls = p.lines || []; ls.forEach(([str, at, col], i) => { const k = clamp((t - at) / 0.5); EL(g, str.slice(0, Math.ceil(str.length * k)), -480, -180 + i * 95, 52, col || INK, { align: 'left' }); }); g.restore();
    if (p.aka != null) stamp(g, t, 'ALIAS: LAZARUS', 1520, 280, p.aka, { size: 56 });
    if (p.conf != null) confirmed(g, t, p.conf, 'SEGÚN EL FBI');
  },
  mapNK(g, t, d, p) { bgMap(g, t); const [x, y] = PLACE.nk; const s = S_(t, 0.4); g.save(); g.translate(x, y + 40); g.scale(s, s); C(g, 0, -60, 40, '#ff4a3a', 5); P(g, [[-30, -40], [30, -40], [0, 10]], '#ff4a3a', 0); g.restore(); for (let i = 0; i < 3; i++) { const q = ((t * 0.8 + i / 3) % 1); g.strokeStyle = alpha('#ff4a3a', 1 - q); g.lineWidth = 5; g.beginPath(); g.arc(x, y + 40, 20 + q * 160, 0, Math.PI * 2); g.stroke(); } AT(g, 'COREA DEL NORTE', x - 380, y + 220, 70, PAPER); if (p.lbl) AT(g, p.lbl, W / 2, 1000, 60, AMBER); },
  board(g, t, d, p) {
    g.fillStyle = '#5a3e28'; g.fillRect(-W, -H, W * 3, H * 3); R(g, 80, 80, W - 160, H - 160, '#a8794e', 8, 8);
    const cards = p.cards || []; cards.forEach(([str, at, x, y, col], i) => { const s = S_(t, at); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); g.rotate(((i * 37) % 7 - 3) * 0.012); R(g, -260, -90, 520, 180, col || PAPER, 5, 4); EL(g, str, 0, 4, 40, INK); C(g, 0, -80, 14, RED, 3); g.restore(); });
    for (let i = 1; i < cards.length; i++) { const [, at, x, y] = cards[i], [, , x0, y0] = cards[i - 1]; const k = clamp((t - at - 0.2) / 0.4); if (k > 0 && p.strings) { g.strokeStyle = RED; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0 - 80); g.lineTo(lerp(x0, x, k), lerp(y0 - 80, y - 80, k)); g.stroke(); } }
    if (p.title) AT(g, p.title, W / 2, 150, 76, PAPER);
  },
  flashback(g, t, d, p) {
    g.fillStyle = '#3a2e22'; g.fillRect(-W, -H, W * 3, H * 3); g.save(); g.translate(W / 2, 540); g.rotate(-0.015); R(g, -760, -420, 1520, 840, '#efe2c4', 6, 6); g.restore();
    calendar(g, 330, 400, 0.9, 'FEBRERO', 21, { year: '2025', rot: -0.06 }); AT(g, 'BYBIT', 1200, 280, 120, '#3a2e22', { stroke: 0 }); BB(g, '≈ 1.500 M $', 1200, 420, 110, '#c0392b', { stroke: 0 });
    if (p.dev != null) { const s = S_(t, p.dev); if (s > 0) { g.save(); g.translate(1200, 820); g.scale(s * 0.55, s * 0.55); laptop(g, 0, 0, 1, (q) => { q.fillStyle = '#2a0d0d'; q.fillRect(-240, -150, 480, 300); EL(q, 'empresa externa', 0, 0, 30, '#ff8a7a'); }); g.restore(); } }
    if (p.fbi != null) stamp(g, t, 'FBI: TRADERTRAITOR', 600, 860, p.fbi, { size: 56 });
    g.fillStyle = 'rgba(120,90,50,.18)'; g.fillRect(-W, -H, W * 3, H * 3);
  },
  launder(g, t, d, p) {
    bgMap(g, t); const st = p.step || 1;
    if (st === 1) { const k = clamp((t - 0.5) / 1.5); coin(g, lerp(560, 1360, k), 520, 140, k < 0.5 ? '$' : 'Ξ', k < 0.5 ? '#3fae7a' : '#7a86d8', t * 3); AT(g, '1 · CAMBIAR LO CONGELABLE', W / 2, 140, 70, AMBER); R(g, 900, 440, 120, 160, '#1d2733', 5, 10); AT(g, '⇄', 960, 520, 80, NEON, { stroke: 0 }); }
    if (st === 2) { const k = ease.out(clamp((t - 0.4) / 2)); const r = rng(9); for (let i = 0; i < 400; i++) { const a = r() * Math.PI * 2, dd = r() * 800 * k; C(g, W / 2 + Math.cos(a) * dd * 1.4, 540 + Math.sin(a) * dd * 0.6, 6, alpha(AMBER, 0.85), 0); } AT(g, '2 · MILES DE BILLETERAS', W / 2, 140, 70, AMBER); }
    if (st === 3) { g.save(); g.strokeStyle = NEON; g.lineWidth = 6; g.globalAlpha = 0.7; const r = rng(4); let x = 200, y = 540; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 40 * clamp(t / 3); i++) { x += 40 + r() * 20; y = 300 + r() * 500; g.lineTo(x, y); } g.stroke(); g.restore(); AT(g, '3 · SALTAR DE CADENA EN CADENA', W / 2, 140, 70, AMBER); }
    if (st === 4) { const k = clamp(t / d); for (let i = 0; i < 6; i++) coin(g, 300 + i * 260, 520 + Math.sin(t * 2 + i) * 30, 70, '$', '#3fae7a', t + i); BB(g, 'MESES… AÑOS', W / 2, 880, 110, PAPER, { alpha: k }); AT(g, '4 · CONVERTIRLO POCO A POCO', W / 2, 140, 70, AMBER); }
    if (st === 5) { const k = ease.out(clamp((t - 0.5) / 2)); const r = rng(13); for (let i = 0; i < 70; i++) { const tx = 150 + r() * 1600, ty = 250 + r() * 650; g.save(); g.translate(lerp(W / 2, tx, k), lerp(540, ty, k)); g.rotate(r() * 6 * k); R(g, -22, -12, 44, 24, '#7cc46f', 2, 3); g.restore(); } if (k < 0.2) { R(g, W / 2 - 300, 400, 600, 280, '#7cc46f', 6, 10); } AT(g, 'UN MILLÓN DE PEDACITOS', W / 2, 140, 76, AMBER); }
    if (st === 6) { const k = clamp(t / d); g.save(); g.globalAlpha = 1 - k * 0.8; g.strokeStyle = '#ff4a3a'; g.lineWidth = 8; g.setLineDash([18, 14]); g.beginPath(); g.moveTo(200, 800); g.bezierCurveTo(700, 200, 1200, 900, 1700, 300); g.stroke(); g.restore(); AT(g, 'EL RASTRO SE ENFRÍA', W / 2, 140, 80, '#bfe6ff'); for (let i = 0; i < 10; i++) AT(g, '❄', 200 + i * 170, ((t * 70 + i * 90) % 900) + 100, 50, '#cfe9ff', { stroke: 0, alpha: k }); }
    if (p.unc != null) unconfirmed(g, t, p.unc, 'PATRÓN DE CASOS ANTERIORES');
  },
  statement(g, t, d, p) {
    bgDesk(g); g.save(); g.translate(W / 2 + 200, 560); g.rotate(0.02); R(g, -420, -420, 840, 840, PAPER, 6, 6); AT(g, 'COMUNICADO', 0, -330, 70, INK, { stroke: 0 }); BB(g, '3 DE NOVIEMBRE', 0, -250, 50, '#6a6058', { stroke: 0 });
    for (let i = 0; i < 8; i++) R(g, -330, -170 + i * 60, 560 + ((i * 53) % 100), 18, '#bdb3a2', 0, 9); g.restore();
    (p.no || []).forEach(([str, at], i) => stamp(g, t, str, W / 2 + 200, 480 + i * 140, at, { size: 70, rot: -0.1 + i * 0.05 }));
  },
  scale(g, t, d, p) {
    bgArchive(g, t); const tilt = Math.sin(t * 1.2) * 0.06; g.save(); g.translate(W / 2, 360); R(g, -14, 0, 28, 560, '#8a6a3a', 4); g.rotate(tilt); R(g, -600, -16, 1200, 32, '#c9a23a', 5, 10);
    for (const [sx, str, col] of [[-560, 'FBI: COREA DEL NORTE', '#ff6a5a'], [560, 'PYONGYANG: «FALSO»', '#9fd8ff']]) { L(g, [[sx, 0], [sx - 120, 240]], 4); L(g, [[sx, 0], [sx + 120, 240]], 4); O(g, sx, 250, 170, 30, '#c9a23a', 5); g.save(); g.translate(sx, 330); g.rotate(-tilt); AT(g, str, 0, 0, 48, col); g.restore(); }
    g.restore(); if (p.st != null) unconfirmed(g, t, p.st, 'ATRIBUCIÓN DEL FBI · NEGADA');
  },
  ending(g, t, d, p) {
    bgArchive(g, t); const L3 = [['NADIE PUSO UNA PISTOLA', 'x'], ['NADIE ROBÓ UNA LLAVE', 'x'], ['ALGUIEN OFRECIÓ UN TRABAJO', 'v']];
    (p.at || []).forEach((at, i) => { const s = S_(t, at); if (s <= 0) return; g.save(); g.translate(W / 2 + 80, 300 + i * 220); g.scale(s, s); R(g, -620, -80, 1240, 160, i === 2 ? AMBER : PAPER, 6, 18); AT(g, L3[i][0], 40, 4, 70, INK, { stroke: 0 }); g.restore(); if (L3[i][1] === 'x') xMark(g, W / 2 - 470, 300 + i * 220, 40, clamp((t - at - 0.3) / 0.3)); else check(g, W / 2 - 470, 300 + i * 220, 44, clamp((t - at - 0.3) / 0.3), '#1f7a3a'); });
  },
  outro(g, t, d, p) {
    bgArchive(g, t); javiFace(g, t, p, 440, 600, 230); lanyard(g, 440, 600, 220);
    if (p.q != null) { AT(g, '¿TÚ LA HABRÍAS DESCARGADO?', 1250, 200, 70, PAPER, { alpha: clamp((t - p.q) / 0.3) }); ['SÍ', 'NO'].forEach((o, i) => { const s = S_(t, p.q + 0.4 + i * 0.4); if (s <= 0) return; g.save(); g.translate(1050 + i * 400, 400); g.scale(s, s); R(g, -150, -70, 300, 140, i ? '#3fae7a' : '#c0392b', 6, 30); AT(g, o, 0, 4, 80, '#fff'); g.restore(); }); AT(g, '👇 COMENTA', 1250, 560, 60, AMBER, { alpha: clamp((t - p.q - 1.2) / 0.3) }); }
    if (p.open != null) stamp(g, t, 'EXPEDIENTE ABIERTO', 1250, 640, p.open, { size: 70 });
    if (p.sub != null) { K.subscribeBtn(g, t, 1250, 860, p.sub, p.press ?? 99, 1.2); const s = S_(t, (p.press ?? 99) + 0.2); if (s > 0) { g.save(); g.translate(1640, 860); g.scale(s, s); g.font = '100px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔔', 0, 0); g.restore(); } }
    if (p.logo != null) { const s = S_(t, p.logo, 0.5); if (s > 0) { g.save(); g.translate(1250, 470); g.scale(s, s); R(g, -440, -90, 880, 180, '#0b0a09', 6); EL(g, 'ARCHIVO OSCURO', 0, 4, 96, PAPER, { ls: 6 }); g.restore(); } }
  },
};

// ---------- real photos ----------
const PHOTO_KEYS = [...new Set(E.shots.map(s => s.params?.rphoto?.key).filter(Boolean))];
const PH = await loadPhotos(Object.fromEntries(PHOTO_KEYS.map(k => [k, `/project/assets/photos/${k}.jpg`])));

// ---------- registration ----------
for (const shot of E.shots) {
  const p0 = shot.params || {}; if (!p0.scene) continue;
  registerShot(shot.id, { draw(g, t, info) {
    GT = shot.start + t;
    const p = info, d = info.dur, fn = S[p.scene];
    K.withCam(g, t, d, p.cam || {}, (g) => fn ? fn(g, t, d, p) : AT(g, 'missing ' + p.scene, W / 2, H / 2, 60));
    if (p.date) K.dateStamp(g, t, p.date, p.dateDur || 3.4);
    if (p.conf != null && !['drain', 'bigNumber', 'freeze', 'refill', 'reopen', 'dossier', 'usersPanic'].includes(p.scene)) confirmed(g, t, p.conf, p.confTxt);
    if (p.rphoto && PH[p.rphoto.key]) photoMoment(g, t, PH[p.rphoto.key], { at: p.rphoto.at, dur: p.rphoto.dur, caption: p.rphoto.cap, credit: p.rphoto.credit, theme: 'dark', capFont: 'Elite' });
    post(g, t);
  } });
}
