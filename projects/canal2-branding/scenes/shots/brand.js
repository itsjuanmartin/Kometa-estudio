// Second channel branding: protagonist options (Javi), logo options, banner and a sample thumbnail.
// Look = warm "case file" world for Javi + neon world for the villains/hackers.
import { registerShot, rng } from '/engine/core.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from '../_lib.js';
const { W, H, R, P, C, L, T, OL, guy } = K;

export const JAVI_A = { top: 'jacket', color: '#c9a46a', legs: '#4a4a55', shoes: '#3a2418', hair: 'messy', hairColor: '#5a3a24', hat: 'fedora', hatColor: '#6a4a30', hatBand: '#2b211c', belt: '#5a3a24' };
export const JAVI_B = { top: 'hoodie', color: '#2f5a8a', legs: '#3a3a44', shoes: '#f2efe6', hair: 'messy', hairColor: '#3a2a20', hat: 'cap', hatColor: '#c0392b' };
export const JAVI_C = { top: 'sweater', color: '#6f8a4a', legs: '#b8a074', shoes: '#4a3226', hair: 'curly', hairColor: '#6a3a1e', face: 'glasses' };
const CYAN = '#19e3ff', PINK = '#ff2d55', NAVY = '#0a1030';

// ---------- worlds ----------
function cork(g, x = 0, y = 0, w = W, h = H) {
  g.fillStyle = '#b7865a'; g.fillRect(x, y, w, h);
  const r = rng(11); for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,55,30,.18)' : 'rgba(255,230,190,.12)'; g.fillRect(x + r() * w, y + r() * h, 3 + r() * 4, 3 + r() * 4); }
  const v = g.createRadialGradient(x + w * 0.45, y + h * 0.4, 50, x + w * 0.45, y + h * 0.4, Math.max(w, h)); v.addColorStop(0, 'rgba(255,240,200,.25)'); v.addColorStop(1, 'rgba(40,20,10,.45)'); g.fillStyle = v; g.fillRect(x, y, w, h);
}
function neon(g, x = 0, y = 0, w = W, h = H) {
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#060a18'); gr.addColorStop(1, '#141c46'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(25,227,255,.08)'; g.lineWidth = 2; for (let i = x; i < x + w; i += 60) { g.beginPath(); g.moveTo(i, y); g.lineTo(i, y + h); g.stroke(); } for (let j = y; j < y + h; j += 60) { g.beginPath(); g.moveTo(x, j); g.lineTo(x + w, j); g.stroke(); }
  const r = rng(5); for (let i = 0; i < 70; i++) { const c = [CYAN, '#2bff88', PINK][i % 3]; glow(g, c, 12, () => C(g, x + r() * w, y + r() * h, 3, c, 0)); }
}
function glow(g, col, blur, fn) { g.save(); g.shadowColor = col; g.shadowBlur = blur; fn(); g.restore(); }
function card(g, x, y, w, h, rot, lines, pin = '#d62d2d') {
  g.save(); g.translate(x, y); g.rotate(rot);
  R(g, -w / 2 + 8, -h / 2 + 10, w, h, 'rgba(0,0,0,.25)', 0); R(g, -w / 2, -h / 2, w, h, '#f6efdc', 3);
  lines.forEach(([s, sz, c], i) => T(g, s, 0, -h / 2 + 62 + i * (sz + 14), sz, c || OL, { stroke: 0 }));
  C(g, 0, -h / 2 + 14, 13, pin, 3); C(g, -4, -h / 2 + 10, 4, 'rgba(255,255,255,.7)', 0); g.restore();
}
function hacker(g, x, y, s = 1, eyes = true) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const body = new Path2D('M-190,0 Q-200,-320 -70,-390 Q10,-430 90,-390 Q200,-320 190,0Z');
  const hood = new Path2D('M-135,-330 Q-170,-540 -20,-600 Q20,-630 40,-596 Q175,-540 145,-330 Q100,-400 5,-410 Q-90,-400 -135,-330Z');
  glow(g, CYAN, 26, () => { g.fillStyle = '#070b1c'; g.fill(body); g.fill(hood); g.strokeStyle = CYAN; g.lineWidth = 7; g.stroke(body); g.stroke(hood); });
  g.fillStyle = '#020309'; g.beginPath(); g.ellipse(5, -470, 92, 105, 0, 0, 7); g.fill();
  if (eyes) glow(g, CYAN, 22, () => { g.fillStyle = '#d8fbff'; g.beginPath(); g.ellipse(-30, -480, 18, 8, 0.15, 0, 7); g.ellipse(40, -480, 18, 8, -0.15, 0, 7); g.fill(); });
  g.restore();
}
function laptop(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  glow(g, CYAN, 30, () => { P(g, [[-120, 0], [-90, -160], [130, -160], [110, 0]], '#0d1636', 0); g.strokeStyle = CYAN; g.lineWidth = 5; g.stroke(); });
  g.fillStyle = 'rgba(25,227,255,.3)'; g.fillRect(-80, -145, 190, 130); g.fillStyle = PINK; for (let i = 0; i < 4; i++) g.fillRect(-65, -128 + i * 26, 140 - i * 22, 10);
  g.restore();
}
function magnifier(g, x, y, s = 1, rot = -0.6) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  R(g, -14, 80, 28, 170, '#5b3a22', 6, 12); C(g, 0, 0, 92, 'rgba(207,232,255,.45)', 14);
  L(g, [[-50, -40], [-30, -66], [0, -70]], 10, 'rgba(255,255,255,.9)'); g.restore();
}
function lensFace(g, cx, cy, r, of, o = {}) {   // Javi's face seen through a magnifying glass (the logo idea)
  g.save(); g.translate(cx, cy); g.rotate(-0.6); R(g, -r * 0.16, r * 0.92, r * 0.32, r * 1.05, '#5b3a22', r * 0.06, r * 0.12); g.restore();
  C(g, cx, cy, r, o.bg || '#fff2c8', 0);
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); toonBigFace(g, cx, cy + r * 0.32, r * 0.62, { outfit: of, expr: o.expr || 'smirk', look: [0.15, 0], t: 0 });
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(cx - r * 0.45, cy - r * 0.5, r * 0.32, r * 0.14, -0.6, 0, 7); g.fill(); g.restore();
  g.strokeStyle = OL; g.lineWidth = r * 0.13; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
  g.strokeStyle = o.ring || '#8a6a3a'; g.lineWidth = r * 0.07; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
}

// ---------- 1) protagonist options ----------
registerShot('personajes', { draw(g) {
  cork(g);
  T(g, '¿CUÁL ES JAVI?', W / 2, 92, 78, '#fff8e8');
  const opts = [[JAVI_A, 'A · DETECTIVE CLÁSICO', 'gabardina + sombrero', 'think', 'smirk'], [JAVI_B, 'B · DETECTIVE MODERNO', 'sudadera + gorra', 'crossArms', 'smile'], [JAVI_C, 'C · EL CEREBRO', 'gafas + jersey', 'point', 'smallSmile']];
  opts.forEach(([of, name, sub, pose, expr], i) => {
    const x = 340 + i * 620;
    R(g, x - 270, 170, 540, 760, 'rgba(255,248,232,.16)', 0, 30);
    guy(g, 1.2, of, x, 830, { s: 1.75, big: 1.25, expr, pose, still: true });
    R(g, x - 255, 860, 510, 150, '#f6efdc', 5, 18);
    T(g, name, x, 912, 40, i === 0 ? '#c0392b' : OL, { stroke: 0 }); T(g, sub, x, 968, 32, '#6b5a4a', { stroke: 0 });
  });
  magnifier(g, 455, 520, 0.55, -0.5);
}});

// ---------- 2) logo options ----------
registerShot('logos', { draw(g) {
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, W, H);
  T(g, 'OPCIONES DE LOGO', W / 2, 92, 64, OL, { stroke: 0 });
  const r = 250, ys = 500;
  // A: Javi through the magnifying glass on a sunburst (warm, family of the first channel)
  { const cx = 360; C(g, cx, ys, r, '#e8a23a', 0); g.save(); g.beginPath(); g.arc(cx, ys, r, 0, 7); g.clip();
    for (let i = 0; i < 16; i++) { g.save(); g.translate(cx, ys); g.rotate(i * Math.PI / 8); P(g, [[0, 0], [400, -40], [400, 40]], i % 2 ? '#f2bf5a' : '#e8a23a', 0); g.restore(); }
    lensFace(g, cx - 10, ys - 20, 165, JAVI_A); g.restore(); g.strokeStyle = OL; g.lineWidth = 12; g.beginPath(); g.arc(cx, ys, r, 0, 7); g.stroke(); }
  // B: neon — Javi lit by a screen, cyan ring
  { const cx = 960; C(g, cx, ys, r, NAVY, 0); g.save(); g.beginPath(); g.arc(cx, ys, r, 0, 7); g.clip(); neon(g, cx - r, ys - r, 2 * r, 2 * r);
    toonBigFace(g, cx, ys + 95, 150, { outfit: JAVI_B, expr: 'smirk', look: [0.2, 0], t: 0 }); g.restore();
    glow(g, CYAN, 30, () => { g.strokeStyle = CYAN; g.lineWidth = 14; g.beginPath(); g.arc(cx, ys, r, 0, 7); g.stroke(); });
    glow(g, PINK, 20, () => { g.save(); g.translate(cx + 160, ys - 170); C(g, 0, 0, 58, PINK, 0); T(g, '!', 0, 6, 86, '#fff', { stroke: 0 }); g.restore(); }); }
  // C: case file — Javi + "CASO" stamp over a folder colour
  { const cx = 1560; C(g, cx, ys, r, '#c0392b', 0); g.save(); g.beginPath(); g.arc(cx, ys, r, 0, 7); g.clip(); cork(g, cx - r, ys - r, 2 * r, 2 * r);
    toonBigFace(g, cx - 20, ys + 40, 150, { outfit: JAVI_A, expr: 'smirk', look: [0.2, 0], t: 0 }); magnifier(g, cx + 150, ys + 120, 0.75, -0.4); g.restore();
    g.strokeStyle = OL; g.lineWidth = 14; g.beginPath(); g.arc(cx, ys, r, 0, 7); g.stroke();
    g.save(); g.translate(cx - 20, ys + 180); g.rotate(-0.12); R(g, -150, -46, 300, 92, '#fff8e8', 8, 12); g.strokeStyle = '#c0392b'; g.lineWidth = 8; g.strokeRect(-140, -36, 280, 72); T(g, 'CASO', 0, 4, 60, '#c0392b', { stroke: 0, spacing: 6 }); g.restore(); }
  [['A · LA LUPA', 360], ['B · NEÓN', 960], ['C · EXPEDIENTE', 1560]].forEach(([s, x]) => T(g, s, x, 830, 46, OL, { stroke: 0 }));
  
}});

// ---------- 3) banner (two worlds split diagonally) ----------
registerShot('banner', { draw(g) {
  cork(g);
  g.save(); g.beginPath(); g.moveTo(1180, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(820, H); g.closePath(); g.clip(); neon(g); hacker(g, 1720, 1090, 1.15); laptop(g, 1480, 960, 1.1); g.restore();
  glow(g, CYAN, 30, () => L(g, [[1180, 0], [820, H]], 10, CYAN));
  card(g, 760, 215, 260, 150, -0.06, [['$6.300 M', 48, '#c0392b'], ['¿quién fue?', 30, '#6b5a4a']]);
  card(g, 560, 900, 240, 150, 0.05, [['20 MIN', 52], ['y desapareció', 28, '#6b5a4a']], '#2d9c4a');
  guy(g, 1.2, JAVI_A, 170, 840, { s: 1.45, big: 1.25, expr: 'smirk', pose: 'think', still: true });
  // safe-area box
  R(g, 360, 370, 1200, 340, '#fff8e8', 8, 40);
  g.save(); g.beginPath(); g.roundRect(364, 374, 1192, 332, 36); g.clip(); lensFace(g, 545, 540, 120, JAVI_A); g.restore();
  g.save(); g.translate(1080, 470); g.rotate(-0.025); R(g, -330, -62, 660, 124, '#f2e94a', 8, 62); T(g, 'JAVI INVESTIGA', 0, 4, 76, OL, { stroke: 0, spacing: 2 }); g.restore();
  T(g, 'Robos, hackeos y estafas reales', 1080, 590, 52, OL, { stroke: 0 });
  T(g, 'Un caso nuevo cada semana', 1080, 650, 38, '#c0392b', { stroke: 0 });
}});

// ---------- 4) sample thumbnail (the "2 horas con…" hook) ----------
registerShot('miniatura', { draw(g) {
  cork(g);
  g.save(); g.beginPath(); g.moveTo(1050, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(760, H); g.closePath(); g.clip(); neon(g); hacker(g, 1500, 1120, 1.45); laptop(g, 1150, 1000, 1.2); g.restore();
  glow(g, CYAN, 30, () => L(g, [[1050, 0], [760, H]], 12, CYAN));
  g.save(); g.beginPath(); g.rect(0, 0, 1000, H); g.clip(); toonBigFace(g, 420, 760, 230, { outfit: JAVI_A, expr: 'scared', look: [0.5, 0], t: 0 }); g.restore();
  T(g, '2 HORAS', 470, 170, 190, '#fff8e8', { stroke: 22, spacing: 2 });
  glow(g, CYAN, 26, () => T(g, 'CON EL HACKER', 1380, 150, 104, CYAN, { stroke: 16, strokeColor: '#020309' }));
  glow(g, PINK, 30, () => T(g, '-$6.300 M', 1450, 330, 120, PINK, { stroke: 16, strokeColor: '#020309' }));
}});

// ================= EXPEDIENTE JAVI — neon identity =================
function neonText(g, s, x, y, size, col, o = {}) {
  glow(g, col, size * 0.5, () => T(g, s, x, y, size, col, { stroke: 0, spacing: o.spacing ?? 3 }));
  glow(g, col, size * 0.2, () => T(g, s, x, y, size, o.core || '#f4feff', { stroke: Math.max(3, size * 0.06), strokeColor: col, spacing: o.spacing ?? 3 }));
}
function city(g, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05071a'); gr.addColorStop(0.6, '#1a1250'); gr.addColorStop(1, '#2a0f3e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(21);
  for (let layer = 0; layer < 2; layer++) {
    let x = -40; const base = layer ? 1080 : 1000, col = layer ? '#070a1e' : '#0e1336';
    while (x < W + 40) { const w = 90 + r() * 140, h = (layer ? 260 : 420) + r() * (layer ? 320 : 380);
      g.fillStyle = col; g.fillRect(x, base - h, w, h + 20);
      for (let wy = base - h + 24; wy < base - 20; wy += 34) for (let wx = x + 14; wx < x + w - 14; wx += 26) if (r() < 0.32) { g.fillStyle = [`rgba(25,227,255,${layer ? 0.55 : 0.3})`, `rgba(255,45,140,${layer ? 0.5 : 0.28})`, 'rgba(255,214,90,.35)'][Math.floor(r() * 3)]; g.fillRect(wx, wy, 10, 14); }
      x += w + 6; }
  }
  g.strokeStyle = 'rgba(160,200,255,.18)'; g.lineWidth = 2; for (let i = 0; i < 160; i++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 34); g.stroke(); }
  const fl = g.createLinearGradient(0, 960, 0, H); fl.addColorStop(0, 'rgba(255,45,140,.0)'); fl.addColorStop(1, 'rgba(255,45,140,.25)'); g.fillStyle = fl; g.fillRect(0, 960, W, 120);
}
function neonSign(g, s, x, y, size, col, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `700 ${size}px "Fredoka"`; const w = size * s.length * 0.62 + 50;
  glow(g, col, 18, () => { g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, 16); g.stroke(); }); neonText(g, s, 0, 2, size, col, { spacing: 2 }); g.restore(); }
function rimJavi(g, x, y, s, expr = 'smirk', pose = 'think') {   // Javi lit by neon: pink rim glow, solid on top
  const o = { s, big: 1.25, expr, pose, still: true };
  for (const [c, b] of [[PINK, 60], [CYAN, 22]]) { g.save(); g.shadowColor = c; g.shadowBlur = b; guy(g, 1.2, JAVI_A, x, y, o); g.restore(); }
  guy(g, 1.2, JAVI_A, x, y, o);
}
function lupaLogo(g, cx, cy, r, neonMode) {
  if (neonMode) { C(g, cx, cy, r, '#0a0d26', 0); g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
      for (let i = 0; i < 16; i++) { g.save(); g.translate(cx, cy); g.rotate(i * Math.PI / 8); P(g, [[0, 0], [r * 1.6, -r * 0.16], [r * 1.6, r * 0.16]], i % 2 ? 'rgba(255,45,140,.16)' : 'rgba(25,227,255,.12)', 0); g.restore(); }
      lensFace(g, cx - r * 0.04, cy - r * 0.08, r * 0.66, JAVI_A, { bg: '#dff8ff', ring: CYAN }); g.restore();
      glow(g, CYAN, r * 0.15, () => { g.strokeStyle = CYAN; g.lineWidth = r * 0.06; g.beginPath(); g.arc(cx, cy, r * 0.97, 0, 7); g.stroke(); });
      glow(g, PINK, r * 0.1, () => { g.strokeStyle = PINK; g.lineWidth = r * 0.025; g.beginPath(); g.arc(cx, cy, r * 0.88, 0, 7); g.stroke(); });
  } else { C(g, cx, cy, r, '#e8a23a', 0); g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
      for (let i = 0; i < 16; i++) { g.save(); g.translate(cx, cy); g.rotate(i * Math.PI / 8); P(g, [[0, 0], [r * 1.6, -r * 0.16], [r * 1.6, r * 0.16]], i % 2 ? '#f2bf5a' : '#e8a23a', 0); g.restore(); }
      lensFace(g, cx - r * 0.04, cy - r * 0.08, r * 0.66, JAVI_A); g.restore(); g.strokeStyle = OL; g.lineWidth = r * 0.05; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
}

registerShot('banner_neon', { draw(g) {
  city(g);
  neonSign(g, 'CASO', 260, 200, 64, PINK, -0.05); neonSign(g, '$', 1710, 230, 80, '#2bff88', 0.06);
  hacker(g, 1690, 1110, 1.05); laptop(g, 1450, 1000, 1.0);
  rimJavi(g, 190, 1060, 1.4);
  // safe-area glass panel
  g.save(); g.fillStyle = 'rgba(8,10,30,.78)'; g.beginPath(); g.roundRect(360, 370, 1200, 340, 40); g.fill(); g.restore();
  glow(g, CYAN, 26, () => { g.strokeStyle = CYAN; g.lineWidth = 6; g.beginPath(); g.roundRect(360, 370, 1200, 340, 40); g.stroke(); });
  lupaLogo(g, 545, 540, 125, true);
  neonText(g, 'EXPEDIENTE JAVI', 1085, 478, 84, PINK, { spacing: 4 });
  T(g, 'Robos, hackeos y estafas reales', 1085, 590, 50, '#eaf6ff', { stroke: 0 });
  neonText(g, 'NUEVOS CASOS CADA SEMANA', 1085, 652, 32, CYAN, { spacing: 4 });
}});
registerShot('logo_final', { draw(g) {
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, W, H);
  lupaLogo(g, 520, 540, 400, false); lupaLogo(g, 1400, 540, 400, true);
  T(g, 'CÁLIDO', 520, 1010, 40, OL, { stroke: 0 }); T(g, 'NEÓN', 1400, 1010, 40, OL, { stroke: 0 });
}});
