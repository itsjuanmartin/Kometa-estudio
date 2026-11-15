// thumbs-v2 — high-CTR thumbnails. Y* = Y Si Te Tocará EP01 (presidente) · A* = Archivo Oscuro 001 (Binance)
import { registerShot, rng, lerp } from '/engine/core.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from '../_lib.js';
const { W, H, R, P, C, O, L, OL } = K;

await Promise.all([['Anton', '/assets/fonts/Anton-Regular.ttf'], ['Bebas', '/assets/fonts/BebasNeue-Regular.ttf'], ['Elite', '/assets/fonts/SpecialElite-Regular.ttf']].map(async ([n, u]) => {
  try { const b = await (await fetch(u)).arrayBuffer(); const f = new FontFace(n, b); await f.load(); document.fonts.add(f); } catch (e) { console.log('font', n); }
}));

// ---------- text ----------
function TX(g, s, x, y, size, col, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.03); g.font = `${o.weight || 700} ${size}px "${o.font || 'Fredoka'}"`; g.textAlign = o.align || 'left'; g.textBaseline = 'middle';
  if (o.ls) g.letterSpacing = o.ls + 'px';
  const sw = o.stroke ?? size * 0.2; g.lineJoin = 'round';
  if (o.shadow !== false) { g.save(); g.fillStyle = 'rgba(0,0,0,.55)'; g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = sw; g.translate(size * 0.05, size * 0.07); g.strokeText(s, 0, 0); g.fillText(s, 0, 0); g.restore(); }
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = size * 0.35; }
  g.strokeStyle = o.sc || '#1b120e'; g.lineWidth = sw; g.strokeText(s, 0, 0); g.shadowBlur = 0; g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
const rim = (g, col, blur, fn) => { g.save(); g.shadowColor = col; g.shadowBlur = blur; fn(); g.restore(); fn(); };
function glowCircle(g, x, y, r, col, a = 0.8) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
function vignette(g, a = 0.55) { const gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function speedLines(g, cx, cy, col, n = 40, seed = 3) { const r = rng(seed); g.save(); g.strokeStyle = col; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, r0 = 380 + r() * 200, r1 = r0 + 300 + r() * 600; g.lineWidth = 3 + r() * 7; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke(); } g.restore(); }

// =================== Y SI TE TOCARÁ · EP01 ===================
function sunsetSea(g, hz = 0.5) {
  const y = H * hz, sk = g.createLinearGradient(0, 0, 0, y); sk.addColorStop(0, '#2a1b5a'); sk.addColorStop(0.55, '#d8456a'); sk.addColorStop(1, '#ffb347'); g.fillStyle = sk; g.fillRect(0, 0, W, y);
  glowCircle(g, W * 0.62, y, 520, 'rgba(255,214,120,A)', 0.9); C(g, W * 0.62, y, 120, '#ffe7a0', 0);
  const sea = g.createLinearGradient(0, y, 0, H); sea.addColorStop(0, '#1d4f86'); sea.addColorStop(1, '#0b1c3a'); g.fillStyle = sea; g.fillRect(0, y, W, H - y);
  g.save(); g.globalAlpha = 0.35; for (let i = 0; i < 18; i++) { const yy = y + 10 + i * i * 2.2, w = 60 + i * 30; R(g, W * 0.62 - w / 2 + Math.sin(i) * 20, yy, w, 6 + i * 0.4, '#ffd88a', 0, 3); } g.restore();
}
function bigShip(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); P(g, [[-520, 0], [520, 0], [460, 90], [-470, 90]], '#4b5563', 7); R(g, -260, -90, 300, 90, '#5b6574', 6, 6); R(g, -150, -170, 120, 80, '#6b7584', 6, 6); R(g, 120, -60, 160, 60, '#5b6574', 6, 6); L(g, [[200, -60], [420, -110]], 18, OL); L(g, [[200, -60], [420, -110]], 10, '#5b6574'); L(g, [[-90, -170], [-90, -300]], 8); P(g, [[-90, -300], [10, -280], [-90, -260]], '#c0392b', 4); g.restore(); }
function torpedo(g, x, y, s, ang, o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  for (const [w, a] of [[300, 0.25], [190, 0.45], [100, 0.8], [40, 1]]) { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(430, 0); g.lineTo(2400, 0); g.stroke(); }
  const r = rng(4); for (let i = 0; i < 26; i++) C(g, 500 + r() * 1400, (r() - 0.5) * 260, 10 + r() * 22, 'rgba(255,255,255,.85)', 0);
  rim(g, 'rgba(255,90,60,.9)', 60, () => { R(g, -400, -95, 830, 190, '#5d6b60', 9, 24); P(g, [[-400, -95], [-560, -36], [-600, 0], [-560, 36], [-400, 95]], '#4a5650', 9); });
  P(g, [[400, -70], [500, -135], [512, -110], [455, 0], [512, 110], [500, 135], [400, 70]], '#4e5a52', 8);
  R(g, -340, -95, 70, 190, '#c0392b', 6); R(g, -180, -95, 30, 190, '#56625a', 5); R(g, 140, -95, 30, 190, '#56625a', 5);
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.roundRect(-260, -72, 640, 26, 13); g.fill();
  if (o.star) { C(g, 0, 0, 62, '#1f3a8a', 6); C(g, 0, 0, 52, null, 0); g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 20 : 48; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); }
  g.restore();
}
function target(g, x, y, r) { g.save(); g.strokeStyle = '#ff2a2a'; g.shadowColor = '#ff2a2a'; g.shadowBlur = 30; g.lineWidth = 12; C(g, x, y, r, null, 0); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(x, y, r * 0.55, 0, Math.PI * 2); g.stroke(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.beginPath(); g.moveTo(x + dx * r * 0.7, y + dy * r * 0.7); g.lineTo(x + dx * r * 1.25, y + dy * r * 1.25); g.stroke(); } g.restore(); }
const TOMI_S = { ...K.TOMI, face: 'sunglasses' };

// Y1 — "TU ÚNICO TRABAJO: QUE NO MUERA"
registerShot('Y1', { draw(g) {
  sunsetSea(g, 0.46); bigShip(g, 1380, H * 0.46 + 10, 0.55);
  torpedo(g, 1450, 900, 0.55, -0.42);
  glowCircle(g, 1180, 640, 380, 'rgba(255,60,40,A)', 0.35);
  rim(g, 'rgba(255,240,200,.95)', 40, () => K.fdr(g, 0, 1180, 1040, { f: -1, expr: 'shocked', s: 2.25, big: 1, still: true }));
  target(g, 1180, 560, 190);
  rim(g, 'rgba(255,230,160,.9)', 50, () => toonBigFace(g, 420, 700, 300, { outfit: K.TOMI, expr: 'shocked', look: [0.9, -0.1], t: 0 }));
  O(g, 220, 470, 26, 40, '#9fd8ff', 6);
  vignette(g, 0.5);
  TX(g, 'TU ÚNICO TRABAJO:', 70, 110, 92, '#ffffff', { rot: -0.03 });
  TX(g, 'QUE NO MUERA', 60, 255, 175, '#ffe14a', { rot: -0.03, glow: 'rgba(255,200,0,.6)' });
}});
// Y2 — "¡ES DE LOS NUESTROS!" (the torpedo has a US star)
registerShot('Y2', { draw(g) {
  sunsetSea(g, 0.42); bigShip(g, 1500, H * 0.42 + 8, 0.42);
  g.save(); g.fillStyle = 'rgba(255,40,30,.18)'; g.fillRect(0, 0, W, H); g.restore();
  torpedo(g, 1080, 690, 0.95, -0.08, { star: true });
  g.save(); g.strokeStyle = '#ffe14a'; g.lineWidth = 14; g.shadowColor = '#000'; g.shadowBlur = 12; g.beginPath(); g.arc(1080, 690, 120, 0, Math.PI * 2); g.stroke(); g.restore();
  K.arrow(g, 1430, 330, 1190, 600, 1, '#ffe14a', 22);
  rim(g, 'rgba(255,230,160,.9)', 50, () => toonBigFace(g, 360, 690, 290, { outfit: K.TOMI, expr: 'shocked', look: [1, 0], t: 0 }));
  vignette(g, 0.5);
  TX(g, '¡ES DE LOS', 1010, 120, 120, '#ffffff', { rot: 0.02 });
  TX(g, 'NUESTROS!', 980, 270, 170, '#ff4a3a', { rot: 0.02, glow: 'rgba(255,60,40,.6)' });
}});
// Y3 — "PROTEGER AL PRESIDENTE · NIVEL: IMPOSIBLE"
registerShot('Y3', { draw(g) {
  const bg = g.createRadialGradient(W * 0.62, H * 0.5, 50, W * 0.62, H * 0.5, 1200); bg.addColorStop(0, '#ffcf4a'); bg.addColorStop(0.5, '#f0613a'); bg.addColorStop(1, '#5a1230'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  speedLines(g, W * 0.62, H * 0.55, 'rgba(255,255,255,.35)', 50, 7);
  // threats around
  torpedo(g, 1820, 950, 0.32, -0.6);
  K.car(g, 1650, 430, 0.55, -1, { color: '#141418' }); TX(g, 'AL CAPONE', 1520, 330, 34, '#fff', { stroke: 7, shadow: false, rot: 0 });
  rim(g, 'rgba(255,255,255,.9)', 30, () => K.fdr(g, 0, 1300, 1120, { f: -1, expr: 'scared', s: 2.3, big: 1, still: true }));
  rim(g, 'rgba(255,255,255,.95)', 40, () => K.guy(g, 0, TOMI_S, 820, 1330, { f: 1, s: 3.4, big: 1, pose: 'ready', expr: 'determined', still: true }));
  vignette(g, 0.45);
  TX(g, 'PROTEGER AL', 60, 105, 96, '#ffffff', { rot: -0.02 });
  TX(g, 'PRESIDENTE', 50, 235, 150, '#ffe14a', { rot: -0.02 });
  g.save(); g.translate(70, 950); g.rotate(-0.02); R(g, 0, -55, 760, 110, '#1b120e', 0, 22); TX(g, 'NIVEL:', 30, 0, 64, '#ffffff', { stroke: 0, shadow: false, rot: 0 }); TX(g, 'IMPOSIBLE', 260, 2, 72, '#ff4a3a', { stroke: 0, shadow: false, rot: 0 }); for (let i = 0; i < 5; i++) C(g, 700 - i * 0, 0, 0, null, 0); g.restore();
}});

// =================== ARCHIVO OSCURO · 001 ===================
const NEON = '#39ff9c', AMBER = '#ffcf6a', PAPER = '#f2ecdc', OLIVE = '#4f5d3a';
const JAVI = { top: 'jacket', color: OLIVE, legs: '#34343c', shoes: '#3a2418', hair: 'side', hairColor: '#5a3a24' };
const HR = { top: 'suit', color: '#3a4a6a', color2: '#c0392b', hair: 'side', hairColor: '#4a3020' };
function cyberBg(g, tint = '#04110b', col = NEON) {
  g.fillStyle = tint; g.fillRect(0, 0, W, H); const r = rng(9); g.font = '34px "Bebas"'; g.textAlign = 'center';
  for (let i = 0; i < 140; i++) { g.fillStyle = col.length === 7 ? col + Math.floor(20 + r() * 60).toString(16).padStart(2, '0') : col; g.fillText(['0', '1', '01', '1101', '₿', 'Ξ', '$'][Math.floor(r() * 7)], r() * W, r() * H); }
}
function hood(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.shadowColor = NEON; g.shadowBlur = 50; P(g, [[-230, 360], [-240, 70], [-130, -110], [0, -180], [130, -110], [240, 70], [230, 360]], '#06090a', 0); g.shadowBlur = 0;
  O(g, 0, -10, 118, 140, '#000', 0); g.shadowColor = NEON; g.shadowBlur = 35; g.fillStyle = NEON;
  P(g, [[-76, -30], [-22, -12], [-76, 6]], NEON, 0); P(g, [[76, -30], [22, -12], [76, 6]], NEON, 0);
  g.strokeStyle = NEON; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.arc(0, 38, 58, 0.3, Math.PI - 0.3); g.stroke(); g.restore();
}
function coin(g, x, y, r, sym, col, sq = 1) { g.save(); g.translate(x, y); g.scale(sq, 1); C(g, 0, 0, r, col, r * 0.09); C(g, 0, 0, r * 0.78, null, r * 0.05); g.font = `${r * 1.1}px "Anton"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(sym, 0, r * 0.05); g.restore(); }
function bill(g, x, y, rot, s = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); R(g, -110, -50, 220, 100, '#7cc46f', 6, 8); R(g, -88, -34, 176, 68, null, 4, 6); C(g, 0, 0, 24, '#4f9a4a', 0); g.font = '40px "Anton"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#7cc46f'; g.fillText('$', 0, 2); g.restore(); }

// A1 — split face: friendly recruiter / hacker
registerShot('A1', { draw(g) {
  g.fillStyle = '#e9e2d4'; g.fillRect(0, 0, W / 2 + 120, H); cyberBg(g); g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(W * 0.56, 0); for (let y = 0; y <= H; y += 90) g.lineTo(W * 0.56 + (y / 90 % 2 ? -40 : 40), y); g.lineTo(0, H); g.closePath(); g.clip();
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#dfe9f2'); bg.addColorStop(1, '#9fb8cc'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  rim(g, 'rgba(255,255,255,.9)', 30, () => toonBigFace(g, W * 0.56, 560, 300, { outfit: HR, expr: 'happy', t: 0 }));
  g.restore();
  g.save(); g.beginPath(); g.moveTo(W, 0); g.lineTo(W * 0.56, 0); for (let y = 0; y <= H; y += 90) g.lineTo(W * 0.56 + (y / 90 % 2 ? -40 : 40), y); g.lineTo(W, H); g.closePath(); g.clip(); hood(g, W * 0.56, 575, 1.5); g.restore();
  g.save(); g.strokeStyle = '#fff'; g.lineWidth = 10; g.shadowColor = NEON; g.shadowBlur = 30; g.beginPath(); g.moveTo(W * 0.56, 0); for (let y = 0; y <= H; y += 90) g.lineTo(W * 0.56 + (y / 90 % 2 ? -40 : 40), y); g.stroke(); g.restore();
  vignette(g, 0.45);
  TX(g, 'ENTREVISTA', 50, 120, 150, '#ffffff', { font: 'Anton', weight: 400, rot: -0.02, stroke: 22 });
  TX(g, 'FALSA', 50, 285, 190, '#ff3a2a', { font: 'Anton', weight: 400, rot: -0.02, stroke: 24 });
  TX(g, '$6.300M', 1240, 960, 190, NEON, { font: 'Anton', weight: 400, rot: -0.03, stroke: 26, glow: 'rgba(57,255,156,.8)' });
}});
// A2 — Javi in shock + laptop: "¡Estás contratado!"
registerShot('A2', { draw(g) {
  cyberBg(g, '#040d09');
  g.save(); g.translate(1330, 640); g.rotate(0.04); g.shadowColor = NEON; g.shadowBlur = 60; R(g, -470, -330, 940, 600, '#1a1e24', 10, 30); g.shadowBlur = 0; g.save(); g.beginPath(); g.rect(-440, -300, 880, 540); g.clip(); cyberBg(g, '#061a10'); g.translate(-1330 + 0, -640); g.restore();
  g.save(); g.beginPath(); g.rect(-440, -300, 880, 540); g.clip(); hood(g, 0, 60, 1.05); g.restore();
  R(g, -440, -300, 880, 56, '#202833', 0); C(g, -400, -272, 12, '#ff5f56', 0); C(g, -365, -272, 12, '#ffbd2e', 0); C(g, -330, -272, 12, '#27c93f', 0);
  g.font = '600 30px "Fredoka"'; g.fillStyle = '#cfd8d4'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Entrevista de trabajo · RR. HH.', -290, -262); P(g, [[-520, 270], [520, 270], [560, 320], [-560, 320]], '#2a2f37', 8); g.restore();
  g.save(); g.translate(1260, 230); g.rotate(-0.05); R(g, -330, -62, 660, 124, '#ffffff', 7, 40); g.font = '700 58px "Fredoka"'; g.fillStyle = '#1b120e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¡Estás contratado! 😊', 0, 4); g.restore();
  for (const [x, y, r] of [[860, 960, -0.3], [1100, 1010, 0.2], [1560, 990, -0.1], [1800, 900, 0.4]]) bill(g, x, y, r, 1.1);
  rim(g, 'rgba(255,214,140,.95)', 55, () => toonBigFace(g, 380, 700, 300, { outfit: JAVI, expr: 'shocked', look: [0.9, -0.1], t: 0 }));
  vignette(g, 0.4);
  TX(g, '$6.300.000.000', 40, 120, 132, NEON, { font: 'Anton', weight: 400, rot: -0.02, stroke: 22, glow: 'rgba(57,255,156,.8)' });
}});
// A3 — 20 MINUTES: stopwatch + money explosion
registerShot('A3', { draw(g) {
  const bg = g.createRadialGradient(W * 0.62, H * 0.55, 50, W * 0.62, H * 0.55, 1200); bg.addColorStop(0, '#5a0d0d'); bg.addColorStop(1, '#0a0303'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  speedLines(g, W * 0.62, H * 0.56, 'rgba(255,120,90,.25)', 60, 5);
  const r = rng(12); for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = 360 + r() * 520; if (i % 2) bill(g, W * 0.62 + Math.cos(a) * d * 1.3, H * 0.56 + Math.sin(a) * d * 0.8, r() * 6, 0.8 + r() * 0.6); else coin(g, W * 0.62 + Math.cos(a) * d * 1.3, H * 0.56 + Math.sin(a) * d * 0.8, 40 + r() * 30, ['₿', 'Ξ', '$'][i % 3], ['#f2a33a', '#7a86d8', '#3fae7a'][i % 3], 0.4 + r() * 0.6); }
  g.save(); g.translate(W * 0.62, H * 0.58); g.shadowColor = '#ff3a2a'; g.shadowBlur = 70; C(g, 0, 0, 330, '#f2ecdc', 12); g.shadowBlur = 0; R(g, -50, -420, 100, 70, '#c0c4c8', 8, 10); C(g, 0, 0, 290, '#fff', 0);
  g.fillStyle = 'rgba(255,58,42,.85)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 290, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 / 3); g.closePath(); g.fill();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; L(g, [[Math.cos(a) * 250, Math.sin(a) * 250], [Math.cos(a) * 280, Math.sin(a) * 280]], 10); }
  L(g, [[0, 0], [Math.cos(-Math.PI / 2 + Math.PI * 2 / 3) * 240, Math.sin(-Math.PI / 2 + Math.PI * 2 / 3) * 240]], 16); C(g, 0, 0, 22, '#1b120e', 0); g.restore();
  rim(g, 'rgba(57,255,156,.9)', 50, () => hood(g, 330, 760, 0.9));
  vignette(g, 0.4);
  TX(g, '20 MINUTOS', 50, 120, 150, '#ffffff', { font: 'Anton', weight: 400, rot: -0.02, stroke: 24 });
  TX(g, '6.300 MILLONES', 50, 280, 112, '#ffcf3a', { font: 'Anton', weight: 400, rot: -0.02, stroke: 20, glow: 'rgba(255,200,40,.6)' });
}});

// =================== Y SI TE TOCARÁ · EP02 (Bastardos sin gloria) ===================
const TOMI_CMD = { top: 'uniform', color: '#6b6f4a', legs: '#5d6142', shoes: '#2a1f18', belt: '#4a3a24', hair: 'side', hairColor: '#2e2420', hat: 'beret', hatColor: '#2f6a3a' };
function dday(g) {
  const sk = g.createLinearGradient(0, 0, 0, H * 0.5); sk.addColorStop(0, '#4a3a5a'); sk.addColorStop(1, '#e8925a'); g.fillStyle = sk; g.fillRect(0, 0, W, H * 0.5);
  const sea = g.createLinearGradient(0, H * 0.5, 0, H * 0.68); sea.addColorStop(0, '#3a5a72'); sea.addColorStop(1, '#2a4256'); g.fillStyle = sea; g.fillRect(0, H * 0.5, W, H * 0.18);
  g.fillStyle = '#c9a874'; g.fillRect(0, H * 0.68, W, H); for (const [x, y] of [[300, 790], [900, 830], [1500, 770]]) { L(g, [[x - 50, y - 50], [x + 50, y + 50]], 14, OL); L(g, [[x + 50, y - 50], [x - 50, y + 50]], 14, OL); }
  for (let i = 0; i < 5; i++) { const x = 1100 + i * 170, y = H * 0.52 + (i % 2) * 18; P(g, [[x - 70, y], [x + 70, y], [x + 55, y + 38], [x - 55, y + 38]], '#5a6a5a', 4); }
  for (let i = 0; i < 6; i++) { const r = rng(i + 4); C(g, 200 + r() * 1500, 120 + r() * 300, 60 + r() * 60, 'rgba(60,60,60,.35)', 0); }
}
function village(g) {
  const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#2b2238'); sk.addColorStop(0.6, '#a8584a'); sk.addColorStop(1, '#3a2a24'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  P(g, [[760, 520], [1160, 520], [1700, H], [220, H]], '#6a5a4a', 0);
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const x = side < 0 ? 40 + i * 230 : W - 270 - i * 230, w = 230, h = 520 - i * 90, y = 760 - i * 60; R(g, x, y - h, w, h, ['#8a7a68', '#9a8a72', '#7a6a5a'][i], 5); P(g, [[x - 10, y - h], [x + w / 2, y - h - 90], [x + w + 10, y - h]], '#5a3a2a', 5);
    for (let j = 0; j < 2; j++) { const wx = x + 40 + j * 100, wy = y - h + 70; R(g, wx, wy, 60, 80, '#140f0c', 4); C(g, wx + 20, wy + 40, 6, '#ffe14a', 0); C(g, wx + 40, wy + 40, 6, '#ffe14a', 0); } }
}
// B1 — "EXISTIERON DE VERDAD"
registerShot('B1', { draw(g) {
  dday(g); vignette(g, 0.35);
  rim(g, 'rgba(255,230,160,.95)', 50, () => toonBigFace(g, 1380, 600, 250, { outfit: TOMI_CMD, expr: 'determined', look: [-0.6, 0], t: 0 }));
  g.save(); g.translate(330, 880); g.rotate(-0.06); R(g, -250, -110, 500, 220, '#f2ecdc', 8, 10); TX(g, 'NO ERA UNA', 0, -40, 54, '#2b211c', { align: 'center', stroke: 0, shadow: false, rot: 0 }); TX(g, 'PELÍCULA', 0, 35, 84, '#c0392b', { align: 'center', stroke: 0, shadow: false, rot: 0 }); g.restore();
  TX(g, 'LOS BASTARDOS', 60, 120, 110, '#ffffff', { rot: -0.03 });
  TX(g, 'EXISTIERON', 50, 270, 170, '#ffe14a', { rot: -0.03, glow: 'rgba(255,200,0,.55)' });
}});
// B2 — "TE MANDAN SOLO"
registerShot('B2', { draw(g) {
  village(g); vignette(g, 0.45);
  target(g, W / 2, 560, 230);
  rim(g, 'rgba(255,240,200,.95)', 40, () => K.guy(g, 0, TOMI_CMD, W / 2, 1120, { f: 1, s: 3.0, big: 1, pose: 'stand', expr: 'scared', still: true }));
  TX(g, 'TE MANDAN', 60, 120, 120, '#ffffff', { rot: -0.03 });
  TX(g, 'SOLO', 50, 285, 210, '#ff4a3a', { rot: -0.03, glow: 'rgba(255,60,40,.55)' });
  TX(g, '…PARA QUE TE DISPAREN', 1060, 1000, 64, '#ffe14a', { rot: -0.02, stroke: 14 });
}});
// B3 — "BORRÓ SU NOMBRE"
registerShot('B3', { draw(g) {
  const bg = g.createRadialGradient(W * 0.65, H / 2, 50, W * 0.65, H / 2, 1100); bg.addColorStop(0, '#d8b06a'); bg.addColorStop(1, '#3a2418'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(1350, 560); g.rotate(0.05); R(g, -420, -270, 840, 540, '#efe6cf', 8, 12); R(g, -380, -220, 250, 320, '#cfc6b0', 5, 4); toonBigFace(g, -255, -50, 95, { outfit: TOMI_CMD, expr: 'neutral', t: 0 });
  TX(g, 'NOMBRE:', -90, -160, 44, '#2b211c', { stroke: 0, shadow: false, rot: 0, font: 'Elite' }); R(g, -90, -120, 420, 60, '#111', 0); TX(g, 'FREDDIE GRAY', -90, -30, 54, '#c0392b', { stroke: 0, shadow: false, rot: 0, font: 'Elite' });
  TX(g, 'NACIDO EN: ████', -90, 50, 40, '#2b211c', { stroke: 0, shadow: false, rot: 0, font: 'Elite' }); g.restore();
  g.save(); g.translate(1420, 820); g.rotate(-0.12); g.strokeStyle = '#c0392b'; g.lineWidth = 12; g.strokeRect(-260, -60, 520, 120); TX(g, 'IDENTIDAD FALSA', 0, 4, 64, '#c0392b', { align: 'center', stroke: 0, shadow: false, rot: 0 }); g.restore();
  rim(g, 'rgba(255,230,160,.95)', 50, () => toonBigFace(g, 400, 720, 300, { outfit: TOMI_CMD, expr: 'worried', look: [0.7, 0], t: 0 }));
  vignette(g, 0.4);
  TX(g, 'TUVO QUE', 60, 115, 110, '#ffffff', { rot: -0.03 });
  TX(g, 'DEJAR DE EXISTIR', 50, 260, 140, '#ffe14a', { rot: -0.03, glow: 'rgba(255,200,0,.55)' });
}});

// =================== shared: real photos ===================
const PHOTO = {};
await Promise.all([['jensen', '/projects/ao-002-nvidia/assets/photos/jensen.jpg'], ['nyse', '/projects/ao-002-nvidia/assets/photos/nyse.jpg'], ['tank', '/projects/ep03-engano/assets/photos/dummy_tank.jpg'], ['garbo', '/projects/ep03-engano/assets/photos/garbo.jpg']].map(async ([k, u]) => {
  try { PHOTO[k] = await createImageBitmap(await (await fetch(u)).blob()); } catch (e) { console.log('photo', k); }
}));
// draw image region (sx,sy,sw,sh as fractions) into a framed, tilted print
function print(g, k, x, y, w, h, rot, crop = [0, 0, 1, 1], o = {}) {
  const im = PHOTO[k]; g.save(); g.translate(x, y); g.rotate(rot);
  g.shadowColor = o.glow || 'rgba(0,0,0,.6)'; g.shadowBlur = o.glow ? 60 : 30; R(g, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32 + (o.cap ? 50 : 0), '#f4f0e6', 0); g.shadowBlur = 0;
  if (im) { const [a, b, c, d] = crop; if (o.bw) g.filter = 'grayscale(1) contrast(1.15)'; g.drawImage(im, a * im.width, b * im.height, c * im.width, d * im.height, -w / 2, -h / 2, w, h); g.filter = 'none'; }
  if (o.cap) { g.font = '700 34px "Fredoka"'; g.fillStyle = '#2b211c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.cap, 0, h / 2 + 26); }
  g.restore();
}
function stampBox(g, s, x, y, size, col, rot = -0.12, fill = null) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `400 ${size}px "Anton"`; const w = g.measureText(s).width + size * 0.8; if (fill) { g.fillStyle = fill; g.fillRect(-w / 2, -size * 0.75, w, size * 1.5); } g.strokeStyle = col; g.lineWidth = size * 0.12; g.strokeRect(-w / 2, -size * 0.75, w, size * 1.5); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, 4); g.restore(); }

// =================== ARCHIVO OSCURO · 002 Nvidia ===================
const NV = '#76b900';
function chipBg(g, tint = '#050a03') {
  g.fillStyle = tint; g.fillRect(0, 0, W, H); g.save(); g.strokeStyle = 'rgba(118,185,0,.18)'; g.lineWidth = 4; const r = rng(4);
  for (let i = 0; i < 40; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) x += (r() - 0.5) * 500; else y += (r() - 0.5) * 400; g.lineTo(x, y); } g.stroke(); C(g, x, y, 8, 'rgba(118,185,0,.35)', 0); }
  g.restore();
}
function woman(g, x, y, s, rimCol = '#ff3a2a') { g.save(); g.translate(x, y); g.scale(s, s); g.shadowColor = rimCol; g.shadowBlur = 55; const K0 = '#08070a';
  O(g, 0, -40, 175, 230, K0, 0); P(g, [[-175, -40], [-200, 260], [-120, 300], [-90, 60]], K0, 0); P(g, [[175, -40], [200, 260], [120, 300], [90, 60]], K0, 0);
  R(g, -45, 60, 90, 120, K0, 0); P(g, [[-300, 460], [-270, 230], [-120, 160], [120, 160], [270, 230], [300, 460]], K0, 0); g.restore(); }
// N1 — Jensen (real photo) vs the woman's silhouette: ¿ESPÍA?
registerShot('N1', { draw(g) {
  chipBg(g); glowCircle(g, W * 0.72, H * 0.55, 700, 'rgba(255,40,40,A)', 0.35);
  print(g, 'jensen', 520, 600, 600, 650, -0.04, [0.08, 0.02, 0.62, 0.58], { glow: 'rgba(118,185,0,.85)' });
  woman(g, 1460, 560, 1.15);
  TX(g, '?', 1050, 560, 330, '#ff3a2a', { font: 'Anton', weight: 400, rot: 0.08, stroke: 26, glow: 'rgba(255,40,40,.8)' });
  vignette(g, 0.35);
  TX(g, '¿UNA ESPÍA?', 980, 120, 150, '#ffffff', { font: 'Anton', weight: 400, rot: -0.02, stroke: 24 });
  stampBox(g, 'SIN CONFIRMAR', 1480, 980, 70, '#ff3a2a', -0.08, 'rgba(10,6,6,.75)');
  TX(g, 'NVIDIA', 60, 990, 130, NV, { font: 'Anton', weight: 400, rot: -0.02, stroke: 22, glow: 'rgba(118,185,0,.7)' });
}});
// N2 — the crash: -13% + Javi in shock
registerShot('N2', { draw(g) {
  const bg = g.createRadialGradient(W * 0.6, H * 0.5, 60, W * 0.6, H * 0.5, 1200); bg.addColorStop(0, '#3a0808'); bg.addColorStop(1, '#070202'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 3; for (let x = 0; x < W; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 120) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.restore();
  const pts = [[700, 380], [860, 330], [980, 360], [1100, 300], [1220, 340], [1330, 280], [1420, 330], [1560, 820], [1660, 760], [1900, 980]];
  g.save(); g.lineJoin = 'round'; g.shadowColor = '#ff2a2a'; g.shadowBlur = 40; g.strokeStyle = '#ff3a2a'; g.lineWidth = 26; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  print(g, 'jensen', 1180, 640, 330, 360, 0.06, [0.08, 0.02, 0.62, 0.58], { bw: true });
  rim(g, 'rgba(255,214,140,.95)', 55, () => toonBigFace(g, 360, 690, 300, { outfit: JAVI, expr: 'shocked', look: [0.9, -0.2], t: 0 }));
  vignette(g, 0.35);
  TX(g, '-13%', 1080, 150, 230, '#ff3a2a', { font: 'Anton', weight: 400, rot: -0.04, stroke: 28, glow: 'rgba(255,40,40,.7)' });
  TX(g, 'EN MINUTOS', 60, 120, 120, '#ffffff', { font: 'Anton', weight: 400, rot: -0.03, stroke: 22 });
  TX(g, 'SE FUE EN 1 DÍA', 1000, 1000, 92, '#ffcf3a', { font: 'Anton', weight: 400, rot: -0.02, stroke: 18 });
}});
// N3 — "LA MUJER DEL COCHE": night car, two silhouettes
registerShot('N3', { draw(g) {
  const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#0a0d18'); sk.addColorStop(1, '#1a1020'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  glowCircle(g, 1500, 120, 500, 'rgba(255,200,120,A)', 0.35); L(g, [[1500, 140], [1500, H]], 16, '#1a1a22');
  g.save(); g.translate(1080, 760); g.shadowColor = 'rgba(255,200,120,.6)'; g.shadowBlur = 40; P(g, [[-640, 140], [-640, 20], [-480, -20], [-330, -190], [260, -190], [430, -20], [640, 10], [660, 140]], '#0c0c12', 0); g.shadowBlur = 0;
  P(g, [[-300, -160], [-30, -160], [-30, -30], [-430, -30]], 'rgba(255,190,110,.55)', 0); P(g, [[10, -160], [240, -160], [380, -30], [10, -30]], 'rgba(255,190,110,.55)', 0);
  O(g, -200, -90, 55, 66, '#08070a', 0); R(g, -260, -60, 120, 40, '#08070a', 0); O(g, 160, -95, 50, 62, '#08070a', 0); P(g, [[110, -100], [100, -30], [215, -30], [205, -100], [160, -160]], '#08070a', 0);
  C(g, -420, 150, 90, '#050508', 0); C(g, 420, 150, 90, '#050508', 0); g.restore();
  print(g, 'jensen', 330, 560, 380, 420, -0.06, [0.08, 0.02, 0.62, 0.58], { glow: 'rgba(118,185,0,.85)' });
  vignette(g, 0.4);
  TX(g, 'LA MUJER', 900, 120, 150, '#ffffff', { font: 'Anton', weight: 400, rot: -0.02, stroke: 24 });
  TX(g, 'DEL COCHE', 900, 290, 150, '#ff3a2a', { font: 'Anton', weight: 400, rot: -0.02, stroke: 24, glow: 'rgba(255,40,40,.6)' });
  TX(g, 'NVIDIA', 60, 990, 110, NV, { font: 'Anton', weight: 400, rot: -0.02, stroke: 20 });
}});

// =================== Y SI TE TOCARÁ · EP03 (El gran engaño del Día D) ===================
const TOMI_BR = { top: 'uniform', color: '#7a6e4a', legs: '#6a5f40', shoes: '#2a1f18', belt: '#4a3a24', hair: 'side', hairColor: '#2e2420', hat: 'beret', hatColor: '#3a3a5a' };
function nightKent(g) { const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#141a33'); sk.addColorStop(0.7, '#3a3a5a'); sk.addColorStop(1, '#1e2a22'); g.fillStyle = sk; g.fillRect(0, 0, W, H); g.fillStyle = '#1e2a22'; g.fillRect(0, H * 0.78, W, H); const r = rng(6); for (let i = 0; i < 80; i++) C(g, r() * W, r() * H * 0.6, 2.5, 'rgba(255,248,224,.8)', 0); }
function flagT(g, x, y, w, kind, rot = 0) { const h = w * 0.62; g.save(); g.translate(x, y); g.rotate(rot);
  if (kind === 'es') { R(g, -w / 2, -h / 2, w, h / 4, '#aa151b', 0); R(g, -w / 2, -h / 4, w, h / 2, '#f1bf00', 0); R(g, -w / 2, h / 4, w, h / 4, '#aa151b', 0); }
  if (kind === 'uk') { R(g, -w / 2, -h / 2, w, h, '#1f3a8a', 0); g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); g.strokeStyle = '#fff'; g.lineWidth = h * 0.2; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, h / 2); g.moveTo(w / 2, -h / 2); g.lineTo(-w / 2, h / 2); g.stroke(); g.strokeStyle = '#c8102e'; g.lineWidth = h * 0.07; g.stroke(); g.restore(); R(g, -w * 0.09, -h / 2, w * 0.18, h, '#fff', 0); R(g, -w / 2, -h * 0.15, w, h * 0.3, '#fff', 0); R(g, -w * 0.05, -h / 2, w * 0.1, h, '#c8102e', 0); R(g, -w / 2, -h * 0.09, w, h * 0.18, '#c8102e', 0); }
  g.strokeStyle = OL; g.lineWidth = 6; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); }
// D1 — TANQUES DE GOMA (real dummy Sherman photo)
registerShot('D1', { draw(g) {
  nightKent(g); glowCircle(g, W * 0.66, H * 0.5, 700, 'rgba(255,220,120,A)', 0.3);
  print(g, 'tank', 1270, 610, 900, 582, 0.04, [0, 0, 1, 1], { glow: 'rgba(255,225,120,.9)', bw: true });
  stampBox(g, 'FOTO REAL', 1560, 330, 62, '#ff3a2a', 0.1, 'rgba(255,248,232,.92)');
  rim(g, 'rgba(255,230,160,.95)', 50, () => toonBigFace(g, 360, 720, 290, { outfit: TOMI_BR, expr: 'shocked', look: [0.9, -0.1], t: 0 }));
  vignette(g, 0.35);
  TX(g, 'TANQUES', 50, 115, 150, '#ffe14a', { rot: -0.03, glow: 'rgba(255,200,0,.5)' });
  TX(g, 'DE GOMA', 50, 270, 150, '#ffffff', { rot: -0.03 });
  TX(g, 'ENGAÑARON A HITLER', 880, 1010, 84, '#ffffff', { rot: -0.02, stroke: 16 });
}});
// D2 — EL ESPÍA ESPAÑOL (real photo of Juan Pujol)
registerShot('D2', { draw(g) {
  const bg = g.createRadialGradient(W * 0.62, H / 2, 50, W * 0.62, H / 2, 1100); bg.addColorStop(0, '#d8b06a'); bg.addColorStop(1, '#2a1a12'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  flagT(g, 1180, 230, 260, 'uk', -0.08); flagT(g, 1720, 260, 240, 'es', 0.08);
  print(g, 'garbo', 1450, 640, 470, 620, 0.05, [0, 0, 1, 1], { cap: '«GARBO»', bw: true });
  stampBox(g, 'AGENTE DOBLE', 1440, 960, 64, '#c0392b', -0.08, 'rgba(255,248,232,.92)');
  rim(g, 'rgba(255,230,160,.95)', 50, () => toonBigFace(g, 400, 740, 280, { outfit: TOMI_BR, expr: 'smirk', look: [0.8, 0], t: 0 }));
  vignette(g, 0.4);
  TX(g, 'EL ESPAÑOL', 50, 115, 130, '#ffffff', { rot: -0.03 });
  TX(g, 'QUE ENGAÑÓ', 50, 255, 130, '#ffe14a', { rot: -0.03, glow: 'rgba(255,200,0,.5)' });
  TX(g, 'A HITLER', 50, 395, 130, '#ff4a3a', { rot: -0.03 });
}});
// D3 — CALAIS ✗ vs NORMANDÍA ✓ map
registerShot('D3', { draw(g) {
  g.fillStyle = '#5f9cbc'; g.fillRect(0, 0, W, H);
  P(g, [[0, 0], [1200, 0], [1260, 180], [1225, 330], [1160, 425], [1050, 470], [900, 500], [720, 520], [520, 545], [300, 575], [100, 625], [0, 650]], '#e9d9a8', 7);
  P(g, [[1920, 330], [1600, 400], [1400, 460], [1270, 515], [1200, 600], [1150, 700], [1000, 760], [860, 800], [760, 790], [720, 700], [650, 690], [630, 800], [600, 880], [400, 900], [150, 920], [0, 960], [0, 1080], [1920, 1080]], '#e6d2a0', 7);
  g.save(); g.setLineDash([30, 18]); g.lineCap = 'round'; g.shadowColor = '#000'; g.shadowBlur = 10;
  g.strokeStyle = '#ff3a2a'; g.lineWidth = 20; g.beginPath(); g.moveTo(1120, 380); g.lineTo(1260, 510); g.stroke();
  g.strokeStyle = '#3fd36a'; g.beginPath(); g.moveTo(720, 470); g.quadraticCurveTo(700, 650, 860, 790); g.stroke(); g.restore();
  g.save(); g.translate(1300, 560); g.strokeStyle = '#ff3a2a'; g.lineWidth = 34; g.lineCap = 'round'; g.shadowColor = '#000'; g.shadowBlur = 20; g.beginPath(); g.moveTo(-90, -90); g.lineTo(90, 90); g.moveTo(90, -90); g.lineTo(-90, 90); g.stroke(); g.restore();
  g.save(); g.translate(880, 820); g.strokeStyle = '#3fd36a'; g.lineWidth = 34; g.lineCap = 'round'; g.shadowColor = '#000'; g.shadowBlur = 20; g.beginPath(); g.moveTo(-80, 0); g.lineTo(-20, 70); g.lineTo(110, -90); g.stroke(); g.restore();
  TX(g, 'CALAIS', 1410, 720, 96, '#ffffff', { rot: -0.03, stroke: 18 }); TX(g, 'NORMANDÍA', 300, 960, 96, '#ffffff', { rot: -0.03, stroke: 18 });
  print(g, 'tank', 1580, 230, 520, 336, 0.06, [0, 0, 1, 1], { bw: true, glow: 'rgba(0,0,0,.6)' });
  vignette(g, 0.35);
  TX(g, 'EL GRAN', 50, 110, 120, '#ffffff', { rot: -0.03 });
  TX(g, 'ENGAÑO', 50, 250, 150, '#ffe14a', { rot: -0.03, glow: 'rgba(255,200,0,.5)' });
}});
