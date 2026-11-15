// lib.js — shared toolkit for EP01 (toon style): drawing helpers, camera, overlays, cast, props and sets.
import { E, ease, clamp, lerp, rng, shade, alpha, text, FONTS, linGrad, prog } from '/engine/core.js';
import { POSES, breathe } from '/engine/rig2d.js';
import { drawToon, toonBigFace, OL } from '/engine/toon2d.js';
export { OL };
export const W = 1920, H = 1080, GY = 900;

// ---------- primitives ----------
export function R(g, x, y, w, h, fill, lw = 3.5, r = 0) { g.beginPath(); if (r) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OL; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
export function P(g, pts, fill, lw = 3.5) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OL; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
export function C(g, x, y, r, fill, lw = 3.5) { g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); } }
export function O(g, x, y, rx, ry, fill, lw = 3.5, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); } }
export function L(g, pts, w = 3.5, col = OL) { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
export function T(g, str, x, y, size = 48, col = '#fff8e8', o = {}) { text(g, str, x, y, { size, color: col, font: o.font || FONTS.title, weight: o.weight || 700, stroke: o.stroke ?? Math.max(4, size * 0.16), strokeColor: o.strokeColor || OL, spacing: o.spacing ?? 1, align: o.align, alpha: o.alpha }); }
export const pop = (t, at = 0, d = 0.35) => ease.outBack(prog(t, at, at + d));
export const fadeIO = (t, a, b, f = 0.25) => clamp(Math.min((t - a) / f, (b - t) / f));
export const blinkAt = (t, per = 3.3) => (t % per) > per - 0.12;
export const exprAt = (t, keys, d = 'neutral') => { let e = d; for (const [tt, x] of keys || []) if (t >= tt) e = x; return e; };

// ---------- camera ----------
// c = { z0, z1, x0, x1, y0, y1, fx, fy, punch: [{at, z, fx, fy, d}], shake: [{at, d, amp}] }
export function withCam(g, t, dur, c = {}, fn) {
  const k = ease.inOut(clamp(t / Math.max(0.1, dur)));
  let z = lerp(c.z0 ?? 1.0, c.z1 ?? 1.06, k), fx = c.fx ?? W / 2, fy = c.fy ?? H / 2;
  const x = lerp(c.x0 ?? 0, c.x1 ?? 0, k), y = lerp(c.y0 ?? 0, c.y1 ?? 0, k);
  for (const p of c.punch || []) { if (t < p.at) continue; const q = ease.out(clamp((t - p.at) / (p.d ?? 0.4))); const out = p.until != null ? ease.inOut(clamp((t - p.until) / 0.4)) : 0; const qq = q * (1 - out); z *= 1 + (p.z - 1) * qq; fx = lerp(fx, p.fx ?? fx, qq); fy = lerp(fy, p.fy ?? fy, qq); }
  let sx = 0, sy = 0;
  for (const s of c.shake || []) { if (t < s.at || t > s.at + (s.d ?? 0.6)) continue; const a = (s.amp ?? 14) * (1 - (t - s.at) / (s.d ?? 0.6)); sx += Math.sin(t * 61) * a; sy += Math.cos(t * 47) * a; }
  const cx = W / 2 + (fx - W / 2) * (1 - 1 / z), cy = H / 2 + (fy - H / 2) * (1 - 1 / z);
  g.save(); g.translate(W / 2 + sx, H / 2 + sy); g.scale(z, z); g.translate(-cx - x, -cy - y); fn(g); g.restore();
}

// ---------- overlays ----------
export function dateStamp(g, t, str, dur = 3.4) {
  const a = fadeIO(t, 0.05, dur, 0.3); if (a <= 0) return; const s = pop(t, 0.05, 0.4);
  g.save(); g.globalAlpha *= a; g.translate(110, 105); g.rotate(-0.04); g.scale(s, s);
  g.font = `700 46px "${FONTS.title}"`; const w = g.measureText(str).width + 60;
  R(g, -10, -42, w, 84, '#fff8e8', 6, 14); R(g, -2, -34, w - 16, 68, null, 3, 10);
  T(g, str, w / 2 - 10, 2, 46, '#c0392b', { stroke: 0 }); g.restore();
}
export function realStamp(g, t, at = 0, dur = 2.8) {
  const lt = t - at; if (lt < 0 || lt > dur) return; const a = fadeIO(lt, 0, dur, 0.2); const s = lt < 0.18 ? 1.8 - 0.8 * (lt / 0.18) : 1;
  g.save(); g.globalAlpha *= a; g.translate(W - 330, 140); g.rotate(0.08); g.scale(s, s);
  R(g, -250, -62, 500, 124, 'rgba(255,248,232,.92)', 9, 18); R(g, -238, -50, 476, 100, null, 4, 12);
  g.strokeStyle = '#c0392b'; g.lineWidth = 9; g.beginPath(); g.roundRect(-250, -62, 500, 124, 18); g.stroke();
  T(g, 'ESTO PASÓ', 0, -18, 40, '#c0392b', { stroke: 0, spacing: 4 }); T(g, 'DE VERDAD', 0, 26, 40, '#c0392b', { stroke: 0, spacing: 4 });
  g.restore();
}
export function pill(g, t, str, y = 92, at = 0, col = '#f2e94a') {
  const s = pop(t, at, 0.35); if (s <= 0) return; g.save(); g.translate(W / 2, y); g.scale(s, s);
  g.font = `700 44px "${FONTS.title}"`; const w = g.measureText(str).width + 70; R(g, -w / 2, -38, w, 76, col, 6, 38); T(g, str, 0, 2, 44, OL, { stroke: 0 }); g.restore();
}
export function infoCard(g, t, lines, at = 0, y = H / 2, col = '#fff8e8') {
  const s = pop(t, at, 0.4); if (s <= 0) return; g.save(); g.translate(W / 2, y); g.scale(s, s); g.rotate(-0.02);
  const w = 900, h = 110 + (lines.length - 1) * 90; R(g, -w / 2, -h / 2, w, h, col, 7, 26);
  lines.forEach((l, i) => T(g, l, 0, -h / 2 + 60 + i * 90, i === 0 ? 70 : 54, i === 0 ? '#c0392b' : OL, { stroke: 0 })); g.restore();
}
export function label(g, t, str, x, y, at = 0, size = 44, col = '#fff8e8') { const s = pop(t, at, 0.3); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); T(g, str, 0, 0, size, col); g.restore(); }
export function arrow(g, x1, y1, x2, y2, p = 1, col = '#c0392b', w = 9) {
  if (p <= 0) return; const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p);
  g.setLineDash([22, 16]); L(g, [[x1, y1], [ex, ey]], w, col); g.setLineDash([]);
  if (p > 0.95) { const a = Math.atan2(y2 - y1, x2 - x1); P(g, [[x2, y2], [x2 - 34 * Math.cos(a - 0.45), y2 - 34 * Math.sin(a - 0.45)], [x2 - 34 * Math.cos(a + 0.45), y2 - 34 * Math.sin(a + 0.45)]], col, 3); }
}
export function subscribeBtn(g, t, x, y, at = 0, pressed = 9e9, s0 = 1) {
  const s = pop(t, at, 0.4) * s0; if (s <= 0) return; const on = t >= pressed;
  g.save(); g.translate(x, y); g.scale(s * (on && t < pressed + 0.15 ? 0.92 : 1), s * (on && t < pressed + 0.15 ? 0.92 : 1));
  R(g, -230, -55, 460, 110, on ? '#7a7a7a' : '#e0302a', 7, 24); T(g, on ? 'SUSCRITO ✓' : 'SUSCRIBIRSE', 0, 3, 52, '#ffffff', { stroke: 0 }); g.restore();
}
export function hand(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); P(g, [[0, 0], [-30, 120], [30, 120]], '#3f8fb0', 5); C(g, 0, -6, 34, '#fbf7ef', 5); L(g, [[0, -34], [0, -80]], 26, OL); L(g, [[0, -34], [0, -80]], 18, '#fbf7ef'); g.restore(); }

// ---------- cast ----------
export const TOMI = { top: 'suit', color: '#3c3f4a', color2: '#3f8fb0', legs: '#3c3f4a', shoes: '#1c1a1e', hair: 'side', hairColor: '#2e2420', earpiece: true };
export const TOMI_CASUAL = { top: 'shirt', color: '#3f8fb0', legs: '#b8a074', shoes: '#4a3226', hair: 'side', hairColor: '#2e2420', belt: '#5a3a24' };
export const FDR = { top: 'suit', color: '#2e3a5c', color2: '#8a2a2a', legs: '#2e3a5c', shoes: '#141418', hair: 'side', hairColor: '#cfcac0', face: 'glasses', mouthProp: 'holder' };
export const FDR_TIRED = { ...FDR, skin: '#ece6dc', mouthProp: null };
export const REILLY = { top: 'suit', color: '#6a4a32', color2: '#2a2a2a', legs: '#5a3e2a', shoes: '#2a1a14', hair: 'side', hairColor: '#3a2a20', hat: 'fedora', hatColor: '#5a4030', mustache: true };
export const AGENT = { top: 'suit', color: '#2a2a32', color2: '#5a5a62', legs: '#2a2a32', shoes: '#141418', hair: 'side', hairColor: '#3a2a20', hat: 'fedora', hatColor: '#2a2a32' };
export const AGENT2 = { ...AGENT, hairColor: '#8a5a2a', hat: 'none', hair: 'messy' };
export const CHURCHILL = { top: 'suit', color: '#22222a', color2: '#2a3a6a', legs: '#22222a', shoes: '#141418', hair: 'none', wide: 1.3, mouthProp: 'cigar', hat: 'bowler', hatColor: '#1c1c22' };
export const CHURCHILL_BARE = { ...CHURCHILL, hat: 'none' };
export const STALIN = { top: 'uniform', color: '#d8cfae', legs: '#3a3a44', shoes: '#1c1a1e', hair: 'side', hairColor: '#4a3a30', mustache: 'big', mustacheColor: '#4a3a30', mouthProp: 'pipe' };
export const TRUMAN = { top: 'suit', color: '#55606e', color2: '#2a3a6a', legs: '#55606e', shoes: '#141418', hair: 'side', hairColor: '#9a9590', face: 'glasses' };
export const WAITER = { top: 'jacket', color: '#f2efe6', legs: '#22222a', shoes: '#141418', hair: 'messy', hairColor: '#3a2a20', wide: 1.4 };
export const PRESS = (c) => ({ top: 'suit', color: c, color2: '#8a2a2a', legs: shade(c, -0.2), shoes: '#2a1a14', hair: 'side', hairColor: '#4a3020', hat: 'fedora', hatColor: shade(c, -0.15) });
export const PAINTER = { top: 'sweater', color: '#8a5a8a', legs: '#5a4a6a', shoes: '#2a1a14', hair: 'bun', hairColor: '#6a4a2a' };
export const SAILOR = { top: 'shirt', color: '#f2efe6', legs: '#2e3a5c', shoes: '#141418', hair: 'none', hat: 'cap', hatColor: '#f2efe6' };

export function guy(g, t, of, x, y = GY, o = {}) {
  const pose = typeof o.pose === 'string' ? POSES[o.pose] : (o.pose || POSES.stand);
  return drawToon(g, { x, y, s: (o.s ?? 1.3) * (o.big ?? 1.25), facing: o.f ?? 1, outfit: of, pose: o.still ? pose : breathe(pose, t, 1, o.seed || 0), expr: o.expr || 'neutral', blink: blinkAt(t + (o.seed || 0), 3 + (o.seed || 0) % 1.5), talk: o.talk || 0, look: o.look, rot: o.rot, shadow: o.shadow, t });
}
// wheelchair (1940s: wooden seat on big wheels) + seated FDR
export function chair(g, x, y, s = 1.3, f = 1) {
  g.save(); g.translate(x, y); g.scale(s * f, s);
  R(g, -48, -175, 14, 120, '#8a5a34', 3.5, 4); R(g, -50, -82, 92, 16, '#9a6a3e', 3.5, 4);
  C(g, -14, -42, 44, null, 5); g.strokeStyle = OL; g.lineWidth = 2; for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(-14, -42); g.lineTo(-14 + Math.cos(a) * 44, -42 + Math.sin(a) * 44); g.stroke(); }
  C(g, -14, -42, 8, '#555', 3); C(g, 40, -12, 12, '#555', 3); g.restore();
}
export function fdr(g, t, x, y = GY, o = {}) {
  const s = (o.s ?? 1.3) * (o.big ?? 1.25), f = o.f ?? 1;
  if (o.chair !== false) chair(g, x, y, s, f);
  const pose = { ...POSES.sit, ...(o.poseOverride || {}) };
  return drawToon(g, { x: x - 4 * s * f, y: y - 14 * s, s, facing: f, outfit: o.of || FDR, pose: o.still ? pose : breathe(pose, t, 1, 7), expr: o.expr || 'smile', blink: blinkAt(t + 1.1, 3.6), talk: o.talk || 0, shadow: false, t });
}
// Fala the scottie
export function fala(g, t, x, y = GY, s = 1, f = 1, o = {}) {
  const run = o.run, wag = Math.sin(t * (run ? 22 : 14)) * 0.5;
  g.save(); g.translate(x, y); g.scale(s * f, s);
  const k = '#1c1a20', ph = t * 18;
  const legs = [[-34, 0], [-18, Math.PI], [22, Math.PI * 0.5], [36, Math.PI * 1.5]];
  if (o.sleep) { O(g, 0, -22, 62, 24, k, 4); O(g, 52, -26, 26, 20, k, 4); L(g, [[58, -30], [70, -30]], 3, '#fbf7ef'); g.restore(); return; }
  for (const [lx, p] of legs) { const sw = run ? Math.sin(ph + p) * 10 : 0; L(g, [[lx, -24], [lx + sw, -2]], 16, OL); L(g, [[lx, -24], [lx + sw, -2]], 9, k); }
  g.save(); g.translate(-56, -46); g.rotate(-0.9 + wag); L(g, [[0, 0], [0, -30]], 12, OL); L(g, [[0, 0], [0, -30]], 6, k); g.restore();
  O(g, 0, -42, 60, 26, k, 4);
  P(g, [[-44, -24], [-30, -6], [-16, -22], [0, -6], [16, -22], [30, -6], [44, -24]], k, 3);
  g.save(); g.translate(52, -62 + (run ? Math.sin(ph) * 3 : 0));
  P(g, [[-18, -16], [-8, -48], [2, -18]], k, 3.5); P(g, [[4, -18], [14, -46], [22, -14]], k, 3.5);
  O(g, 0, 0, 32, 26, k, 4); O(g, 30, 8, 22, 14, k, 4); C(g, 50, 4, 6, '#000', 2);
  P(g, [[16, 14], [26, 34], [36, 16]], '#2a282e', 2.5);
  C(g, 10, -6, 5.5, '#fbf7ef', 0); C(g, 11, -6, 3, '#000', 0);
  g.restore();
  R(g, 28, -66, 12, 30, '#c0392b', 2.5, 4);
  g.restore();
}
// ---------- props ----------
export function phone(g, x, y, s = 1, ring = 0, t = 0) {
  const sh = ring ? Math.sin(t * 70) * 6 : 0; g.save(); g.translate(x + sh, y); g.scale(s, s);
  O(g, 0, 0, 70, 18, '#1c1a20'); R(g, -14, -170, 28, 170, '#1c1a20', 4, 8); O(g, 0, -178, 40, 16, '#1c1a20'); C(g, 0, -190, 26, '#2a2830');
  L(g, [[40, -110], [90, -60], [80, 0]], 6); R(g, 70, -150, 26, 70, '#1c1a20', 4, 10);
  if (ring) for (let i = 0; i < 3; i++) { g.strokeStyle = alpha(OL, 0.7); g.lineWidth = 6; g.beginPath(); g.arc(0, -120, 120 + i * 40 + (t * 120) % 40, -0.9, -0.3); g.stroke(); g.beginPath(); g.arc(0, -120, 120 + i * 40 + (t * 120) % 40, Math.PI + 0.3, Math.PI + 0.9); g.stroke(); }
  g.restore();
}
export function car(g, x, y, s = 1, f = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * f, s); const c = o.color || '#1c1c22';
  P(g, [[-300, -40], [-290, -110], [-150, -120], [-110, -200], [90, -200], [140, -120], [290, -105], [305, -40]], c, 5);
  P(g, [[-95, -128], [-70, -186], [0, -186], [0, -128]], '#9fc6d8', 4); P(g, [[14, -128], [14, -186], [80, -186], [118, -128]], '#9fc6d8', 4);
  if (o.heads) o.heads(g);
  O(g, -180, -40, 95, 50, c, 5); O(g, 190, -40, 95, 50, c, 5);
  for (const wx of [-180, 190]) { C(g, wx, -18, 46, '#2a2a2e', 5); C(g, wx, -18, 20, '#c9c4b8', 4); }
  R(g, 270, -96, 40, 20, '#f2e6a0', 3, 6); R(g, -40, -112, 50, 8, '#c9c4b8', 2, 3);
  g.restore();
}
export function ship(g, x, y, s = 1, f = 1, o = {}) {   // battleship side view, waterline at y
  g.save(); g.translate(x, y); g.scale(s * f, s); const c = o.color || '#8a929e';
  P(g, [[-520, -60], [-500, 10], [480, 10], [560, -70], [-520, -70]], c, 5);
  R(g, -380, -130, 260, 62, shade(c, 0.08)); R(g, -40, -210, 160, 142, shade(c, 0.08)); R(g, 10, -280, 60, 72, shade(c, 0.12)); R(g, 180, -130, 200, 62, shade(c, 0.08));
  for (const [tx, d] of [[-450, -1], [-260, -1], [300, 1], [420, 1]]) { R(g, tx - 40, -100, 80, 32, shade(c, -0.1), 4, 8); L(g, [[tx, -88], [tx + d * 110, -100]], 10); }
  L(g, [[40, -280], [40, -360]], 5); L(g, [[0, -330], [80, -330]], 4);
  if (o.flag) { R(g, 44, -360, 50, 30, '#f2efe6', 3); for (let i = 0; i < 3; i++) R(g, 44, -360 + i * 10, 50, 5, '#c0392b', 0); R(g, 44, -360, 20, 16, '#2a3a8a', 0); }
  g.restore();
}
export function destroyer(g, x, y, s = 1, f = 1) {
  g.save(); g.translate(x, y); g.scale(s * f, s); const c = '#7a8290';
  P(g, [[-260, -40], [-250, 8], [240, 8], [290, -46], [-260, -46]], c, 5); R(g, -60, -110, 120, 64, shade(c, 0.1)); R(g, 80, -86, 40, 40, shade(c, 0.1)); L(g, [[0, -110], [0, -170]], 5);
  R(g, -200, -76, 70, 30, shade(c, -0.1), 4, 6); g.restore();
}
export function plane(g, x, y, s = 1, t = 0, f = 1) {   // flying boat
  g.save(); g.translate(x, y); g.scale(s * f, s);
  P(g, [[-300, -10], [-240, -60], [220, -60], [290, -30], [300, 0], [200, 30], [-200, 30]], '#c9ccd2', 5);
  for (let i = 0; i < 8; i++) C(g, -160 + i * 42, -24, 9, '#9fc6d8', 2.5);
  P(g, [[-280, -60], [-330, -150], [-280, -150], [-230, -60]], '#b8bcc4', 4);
  R(g, -320, -110, 760, 24, '#d8dbe0', 5, 10);
  for (const ex of [-200, -60, 120, 260]) { O(g, ex, -98, 26, 18, '#9a9ea8', 4); const a = t * 40; L(g, [[ex + 28, -98 - 40 * Math.cos(a)], [ex + 28, -98 + 40 * Math.cos(a)]], 5, alpha(OL, 0.6)); }
  O(g, -260, 18, 40, 10, '#b8bcc4', 3); O(g, 260, 18, 40, 10, '#b8bcc4', 3);
  g.restore();
}
export function train(g, x, y, s = 1, t = 0, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (let i = 0; i < (o.cars ?? 4); i++) { const cx = 260 + i * 330; R(g, cx, -170, 310, 150, o.night ? '#3a2a2a' : '#7a2a2a', 5, 10); for (let k = 0; k < 4; k++) R(g, cx + 22 + k * 72, -140, 50, 50, o.night ? '#ffd27a' : '#c9e0ea', 3, 4); if (o.flag && i === (o.cars ?? 4) - 1) { R(g, cx + 20, -150, 270, 110, '#f2efe6', 3); for (let k = 0; k < 5; k++) R(g, cx + 20, -150 + k * 22, 270, 11, '#c0392b', 0); R(g, cx + 20, -150, 110, 60, '#2a3a8a', 0); } for (const wx of [cx + 50, cx + 260]) C(g, wx, -14, 22, '#2a2a2e', 4); }
  R(g, -40, -200, 260, 180, '#2a2a30', 5, 10); R(g, 120, -270, 100, 90, '#2a2a30', 5, 6); R(g, -10, -260, 40, 60, '#2a2a30', 4, 4);
  for (const wx of [0, 80, 160]) C(g, wx, -16, 30, '#3a3a40', 4);
  for (let i = 0; i < 4; i++) { const k = (t * 0.8 + i / 4) % 1; C(g, 10 - k * 160, -280 - k * 150, 26 + k * 50, `rgba(230,230,230,${0.8 * (1 - k)})`, 0); }
  g.restore();
}
export function pressCam(g, x, y, s = 1, flash = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); R(g, -40, -30, 80, 60, '#2a2a30', 4, 6); C(g, 0, 0, 22, '#5a5a62', 4); C(g, 0, 0, 10, '#9fc6d8', 3);
  O(g, 48, -40, 26, 30, '#d8dbe0', 4); if (flash > 0) { g.fillStyle = `rgba(255,255,240,${flash})`; g.beginPath(); g.arc(48, -40, 80 + 200 * (1 - flash), 0, 7); g.fill(); }
  g.restore();
}
export function crowd(g, t, y, n = 40, o = {}) {
  const r = rng(o.seed || 3), cols = ['#3a3f4a', '#6a4a32', '#2e3a5c', '#5a5a62', '#7a2a2a', '#3f6a4a', '#8a7a5a'];
  for (let row = 0; row < (o.rows || 3); row++) for (let i = 0; i < n; i++) {
    const x = -100 + (i + (row % 2) * 0.5) * (W + 200) / n + (r() - 0.5) * 20, yy = y + row * 60, bob = Math.sin(t * 3 + i + row) * 3, hr = 34 - row * 2;
    R(g, x - hr * 1.1, yy - 10 + bob, hr * 2.2, 140, cols[(i * 7 + row) % cols.length], 3.5, hr * 0.8);
    C(g, x, yy - 30 + bob, hr, '#fbf7ef', 3.5); if ((i + row) % 3) { O(g, x, yy - 50 + bob, hr * 1.5, hr * 0.25, '#3a2a20', 3); R(g, x - hr * 0.8, yy - 82 + bob, hr * 1.6, 34, '#3a2a20', 3, 8); }
  }
}
export function xmasTree(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); R(g, -20, -40, 40, 40, '#6a4a2a');
  for (let i = 0; i < 4; i++) P(g, [[0, -380 + i * 70], [-160 + i * 10 - (3 - i) * 25, -60 - (3 - i) * 50 + 40], [160 - i * 10 + (3 - i) * 25, -60 - (3 - i) * 50 + 40]], '#2f6a3a', 4);
  const r = rng(9); for (let i = 0; i < 40; i++) { const yy = -340 + r() * 300, xx = (r() - 0.5) * (yy + 380) * 0.8; C(g, xx, yy, 6, ['#ffd27a', '#ff6a5a', '#9fd8ff'][i % 3] , 0); g.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 3 + i)); C(g, xx, yy, 12, alpha('#fff2b0', 0.4), 0); g.globalAlpha = 1; }
  P(g, [[0, -420], [12, -396], [38, -396], [16, -380], [24, -354], [0, -370], [-24, -354], [-16, -380], [-38, -396], [-12, -396]], '#f2c21a', 3);
  g.restore();
}
export function lamp(g, x, y, s = 1, mic = false) { g.save(); g.translate(x, y); g.scale(s, s); R(g, -8, -180, 16, 180, '#8a6a3a', 3); P(g, [[-70, -180], [70, -180], [40, -280], [-40, -280]], '#f2d9a0', 4); R(g, -50, 0, 100, 16, '#6a4a2a', 3, 6); if (mic) { C(g, 0, -196, 14, '#2a2a30', 3); L(g, [[0, -182], [20, -150], [10, -40]], 3, '#2a2a30'); } g.restore(); }

// ---------- environments ----------
export const SKY = { day: ['#bfe0f2', '#e6f2f8'], golden: ['#f0b878', '#f6d49a', '#fae8c0'], night: ['#1c2448', '#2e3a6a', '#46507e'], dusk: ['#5a4a7a', '#d08a7a', '#f2c48a'], sepia: ['#c9a874', '#e8d2a4'], storm: ['#5a6070', '#8a909a'] };
export function sky(g, kind = 'day', t = 0) {
  g.fillStyle = linGrad(g, 0, 0, 0, H, SKY[kind] || SKY.day); g.fillRect(-W, -H, W * 3, H * 3);
  if (kind === 'night') { const r = rng(5); for (let i = 0; i < 90; i++) { g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t + i)); C(g, r() * W, r() * H * 0.6, 2.2, '#fff8e0', 0); } g.globalAlpha = 1; C(g, W - 300, 170, 60, '#fff6d8', 4); }
  else if (kind !== 'sepia') { C(g, W - 320, 180, 70, '#fff6d8', 0); g.strokeStyle = 'rgba(255,240,200,.5)'; g.lineWidth = 26; g.beginPath(); g.arc(W - 320, 180, 106, 0, 7); g.stroke();
    for (const [cx, cy, k] of [[300, 180, 1], [900, 120, 0.8], [1450, 260, 0.7]]) { const dx = (t * 8 * k) % 400; for (const [ox, oy, r] of [[0, 0, 50], [50, -20, 60], [110, 0, 48]]) C(g, cx + ox + dx, cy + oy, r * k, 'rgba(255,255,255,.9)', 0); } }
}
export function ocean(g, t, hy = 560, night = false) {
  g.fillStyle = linGrad(g, 0, hy, 0, H, night ? ['#1c2a50', '#0e1630'] : ['#4f9ac0', '#2e6a9a']); g.fillRect(-W, hy, W * 3, H * 2);
  L(g, [[-W, hy], [W * 2, hy]], 4);
  g.strokeStyle = night ? 'rgba(200,220,255,.25)' : 'rgba(255,255,255,.5)'; g.lineWidth = 4; g.lineCap = 'round';
  const r = rng(2); for (let i = 0; i < 50; i++) { const y = hy + 20 + r() * (H - hy), x = ((r() * W * 1.4 + t * 30 * (1 + (y - hy) / 300)) % (W * 1.4)) - 200, w = 30 + (y - hy) * 0.15; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 8, x + w, y); g.stroke(); }
}
export function deck(g, t, o = {}) {   // battleship deck, sea behind
  sky(g, o.sky || 'day', t); ocean(g, t, 520, o.sky === 'night');
  if (o.escort) destroyer(g, o.escortX ?? 1500, 600, 0.45, -1);
  R(g, -W, 640, W * 3, 40, '#8a929e', 4); for (let x = -200; x < W + 200; x += 70) L(g, [[x, 560], [x, 640]], 5);
  L(g, [[-W, 560], [W * 2, 560]], 6); L(g, [[-W, 600], [W * 2, 600]], 4);
  g.fillStyle = '#9aa2ac'; g.fillRect(-W, 680, W * 3, H); L(g, [[-W, 680], [W * 2, 680]], 4);
  g.strokeStyle = 'rgba(43,33,28,.2)'; g.lineWidth = 3; for (let y = 720; y < H + 200; y += 46) { g.beginPath(); g.moveTo(-W, y); g.lineTo(W * 2, y); g.stroke(); }
  if (o.turret !== false) { R(g, 1300, 420, 420, 200, '#8a929e', 5, 30); L(g, [[1300, 470], [900, 430]], 26); L(g, [[1300, 470], [900, 430]], 18, '#8a929e'); L(g, [[1300, 540], [920, 520]], 26); L(g, [[1300, 540], [920, 520]], 18, '#8a929e'); }
}
export function wake(g, t, x0, y0, x1, y1, p) {   // torpedo track on water
  const ex = lerp(x0, x1, p), ey = lerp(y0, y1, p);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(ex, ey); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 30; g.beginPath(); g.moveTo(x0, y0); g.lineTo(ex, ey); g.stroke();
  O(g, ex, ey, 22, 10, '#3a3f4a', 3, Math.atan2(y1 - y0, x1 - x0));
}
export function splashFx(g, t, x, y, s = 1) {
  if (t < 0) return; const k = clamp(t / 1.2);
  g.save(); g.translate(x, y); g.scale(s, s);
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22, h = 380 * Math.sin(Math.PI * Math.min(1, k * 1.3)) * (1 - Math.abs(i - 4) * 0.12); P(g, [[Math.cos(a) * 20 - 30, 0], [Math.cos(a) * h * 0.5, -h], [Math.cos(a) * 20 + 30, 0]], 'rgba(255,255,255,.95)', 3.5); }
  for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 7) * 0.2; C(g, Math.cos(a) * 300 * k, -Math.sin(-a) * 300 * k * (1 - k) * 2.2 - 40, 16 * (1 - k * 0.6), 'rgba(255,255,255,.95)', 3); }
  g.restore();
}
export function whiteHouse(g, x, y, s = 1, night = false, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); const wc = night ? '#c8ccd8' : '#f6f2e8', win = night ? (o.blackout ? '#1a1a22' : '#ffd27a') : '#9fc6d8';
  R(g, -560, -300, 1120, 300, wc, 5); R(g, -580, -320, 1160, 26, shade(wc, -0.06), 5);
  for (let i = 0; i < 2; i++) for (let k = 0; k < 9; k++) { if (k >= 3 && k <= 5) continue; R(g, -500 + k * 118, -270 + i * 140, 50, 90, win, 4, 4); if (o.blackout && night) R(g, -500 + k * 118, -270 + i * 140, 50, 90, '#14141a', 4, 4); }
  P(g, [[-200, -320], [0, -430], [200, -320]], wc, 5); R(g, -200, -320, 400, 20, shade(wc, -0.06), 4);
  for (let k = 0; k < 6; k++) R(g, -180 + k * 68, -300, 22, 300, shade(wc, 0.03), 3.5);
  R(g, -40, -120, 80, 120, '#5a4a3a', 4, 4);
  L(g, [[0, -430], [0, -560]], 5); P(g, [[4, -560], [90, -545], [4, -530]], '#c0392b', 3);
  g.restore();
}
export function room(g, kind = 'hall', o = {}) {
  const night = o.night, wall = o.wall || (night ? '#a89878' : '#efe0bf'), floor = o.floor || '#b88a5a';
  g.fillStyle = wall; g.fillRect(-W, -H, W * 3, GY + H);
  for (let x = -W; x < W * 2; x += 130) { g.strokeStyle = shade(wall, -0.05); g.lineWidth = 8; g.beginPath(); g.moveTo(x, -H); g.lineTo(x, GY); g.stroke(); }
  R(g, -W, GY - 60, W * 3, 60, shade(wall, -0.12), 4); g.fillStyle = floor; g.fillRect(-W, GY, W * 3, H * 2); L(g, [[-W, GY], [W * 2, GY]], 4);
  g.strokeStyle = 'rgba(43,33,28,.18)'; g.lineWidth = 3; for (let x = -W; x < W * 2; x += 90) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x - 120, H + 100); g.stroke(); }
  const win = (wx, wy, ww, wh) => { R(g, wx, wy, ww, wh, night ? '#2e3a6a' : '#a9d4ec'); if (!night) { g.fillStyle = '#cfe8f5'; g.fillRect(wx + 4, wy + 4, ww - 8, wh * 0.35); } else for (let i = 0; i < 6; i++) C(g, wx + 30 + i * 37 % ww, wy + 30 + (i * 53) % (wh - 60), 2.5, '#fff8e0', 0); L(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 6); L(g, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 6); if (o.blackout) R(g, wx - 10, wy - 10, ww + 20, wh + 20, '#2a2a3a', 4); };
  const curtain = (cx, d) => P(g, [[cx, 110], [cx + 80, 110], [cx + 40 + d * 20, 400], [cx + 70, 690], [cx + 10, 690], [cx + 40 - d * 20, 400]], '#b8343a', 3.5);
  if (kind === 'hall') { for (const dx of [260, 1460]) { R(g, dx, GY - 420, 200, 360, '#8a5a34', 4, 6); C(g, dx + 170, GY - 240, 10, '#f2c21a', 3); } R(g, 800, 240, 300, 220, '#c9a874', 6); R(g, 830, 270, 240, 160, '#6a8aa0', 3); }
  if (kind === 'office') { for (const wx of [400, 1260]) { win(wx, 160, 260, 500); curtain(wx - 40, 1); curtain(wx + 260, -1); } g.fillStyle = '#2f5fa8'; g.beginPath(); g.ellipse(W / 2, GY + 80, 760, 70, 0, 0, 7); g.fill(); g.stroke(); }
  if (kind === 'briefing') { R(g, 560, 180, 800, 420, '#2f4a3a', 7, 8); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 4; g.beginPath(); g.moveTo(640, 300); g.lineTo(900, 300); g.moveTo(640, 380); g.lineTo(1020, 380); g.stroke(); C(g, 1180, 360, 80, null, 0); L(g, [[1110, 290], [1250, 430]], 6, '#ff6a5a'); L(g, [[1250, 290], [1110, 430]], 6, '#ff6a5a'); }
  if (kind === 'bedroom') { win(1280, 220, 300, 360); }
  if (kind === 'kitchen') { R(g, 200, GY - 220, 1500, 220, '#c9c4b8', 4); for (let i = 0; i < 6; i++) R(g, 230 + i * 245, GY - 190, 210, 160, '#e6e0d4', 3, 6); R(g, 300, 260, 400, 50, '#8a5a34', 4); for (let i = 0; i < 5; i++) C(g, 340 + i * 80, 330, 28, '#b8bcc4', 3); }
  if (kind === 'embassy') { for (const wx of [300, 1340]) { R(g, wx, 140, 280, 520, '#d9c08a', 5, 140); R(g, wx + 30, 170, 220, 460, '#2e3a6a', 4, 110); } R(g, 760, 200, 400, 300, '#8a2a2a', 6); for (let i = 0; i < 8; i++) for (let k = 0; k < 5; k++) C(g, 800 + i * 46, 240 + k * 52, 10, '#f2c21a', 0); }
  if (kind === 'cabin') { g.fillStyle = '#8a5a34'; g.fillRect(-W, -H, W * 3, GY + H); for (let y = -60; y < GY; y += 70) L(g, [[-W, y], [W * 2, y]], 4); win(780, 220, 360, 300); }
  if (kind === 'plane') { g.fillStyle = '#d8d2c4'; g.fillRect(-W, -H, W * 3, H * 3); for (const wx of [260, 860, 1460]) { R(g, wx, 280, 240, 240, '#7a7a82', 6, 110); g.save(); g.beginPath(); g.roundRect(wx + 20, 300, 200, 200, 90); g.clip(); g.fillStyle = linGrad(g, 0, 300, 0, 500, ['#6aa8d8', '#cfe8f5']); g.fillRect(wx, 290, 240, 220); const dx = ((o.t || 0) * 60) % 300; for (const [cx, cy] of [[wx + 40, 380], [wx + 160, 440]]) { C(g, cx - dx + 150, cy, 40, '#fff', 0); C(g, cx - dx + 190, cy - 15, 46, '#fff', 0); } g.restore(); } g.fillStyle = '#8a7a6a'; g.fillRect(-W, GY, W * 3, H); L(g, [[-W, GY], [W * 2, GY]], 4); }
  if (kind === 'bunk') { g.fillStyle = '#7a828e'; g.fillRect(-W, -H, W * 3, H * 3); C(g, 1500, 300, 70, '#2e3a6a', 8); for (let x = -W; x < W * 2; x += 160) C(g, x, 60, 8, '#5a626e', 3); }
}
export function bed(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); R(g, -380, -150, 760, 110, '#8a5a34', 4, 10); R(g, -380, -260, 40, 260, '#6a4a2a', 4, 6); R(g, 340, -200, 40, 200, '#6a4a2a', 4, 6); R(g, -340, -190, 680, 60, '#e8e2d0', 4, 18); g.restore(); }
export function desk(g, x, y = GY, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); R(g, -200, -160, 400, 160, '#7a4a2a'); R(g, -220, -178, 440, 24, '#8e5a34', 4, 4); R(g, -50, -130, 100, 70, '#6a3e22', 3); g.restore(); }
export function flagPole(g, x, y, s = 1, t = 0) { g.save(); g.translate(x, y); g.scale(s, s); L(g, [[0, 0], [0, -520]], 8, '#c9a874'); C(g, 0, -526, 10, '#f2c21a', 3); const wv = Math.sin(t * 3) * 10; P(g, [[6, -500], [190, -500 + wv], [190, -380 + wv], [6, -380]], '#f2efe6', 4); for (let i = 0; i < 4; i++) P(g, [[6, -500 + i * 30], [190, -500 + i * 30 + wv], [190, -485 + i * 30 + wv], [6, -485 + i * 30]], '#c0392b', 0); R(g, 6, -500, 80, 64, '#2a3a8a', 0); g.restore(); }
export function city(g, t, y = GY, dx = 0, night = false) { const r = rng(4); for (let i = 0; i < 26; i++) { const w = 160 + r() * 140, h = 220 + r() * 360, x = -400 + i * 230 - (dx % 230) - Math.floor(dx / 230) * 0; const c = night ? shade('#46507e', -0.2 + r() * 0.2) : ['#d9c9a8', '#c9b28a', '#e6d6b8', '#b8a48a'][i % 4]; R(g, x, y - h, w, h, c, 4); for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) R(g, x + 20 + j * (w - 40) / 3, y - h + 30 + k * 70, 30, 40, night ? '#ffd27a' : '#9fc6d8', 2.5); } }
export function ground(g, col = '#8ab060', y = GY) { g.fillStyle = col; g.fillRect(-W, y, W * 3, H * 2); L(g, [[-W, y], [W * 2, y]], 4); }
export function tree(g, x, y, s = 1, col = '#4f8a4a') { g.save(); g.translate(x, y); g.scale(s, s); R(g, -14, -120, 28, 120, '#6a4a2a'); C(g, 0, -170, 80, col); C(g, -50, -140, 56, col); C(g, 50, -140, 56, col); g.restore(); }
export function pine(g, x, y, s = 1, col = '#2f5a3a') { g.save(); g.translate(x, y); g.scale(s, s); R(g, -10, -40, 20, 40, '#6a4a2a'); for (let i = 0; i < 3; i++) P(g, [[0, -300 + i * 70], [-90 + i * 0 - (2 - i) * 0, -100 + i * 40 - (2 - i) * 30], [90, -100 + i * 40 - (2 - i) * 30]], col, 4); g.restore(); }

// ---------- stylised map ----------
export const MAP = { na: [[120, 160], [520, 120], [700, 220], [640, 380], [560, 470], [470, 600], [380, 560], [300, 420], [160, 330]], sa: [[520, 640], [640, 620], [700, 720], [640, 940], [560, 1000], [540, 820]],
  eu: [[960, 180], [1180, 140], [1260, 220], [1180, 300], [1080, 360], [990, 330], [940, 260]], af: [[960, 420], [1140, 400], [1260, 520], [1220, 720], [1120, 900], [1040, 760], [960, 600], [920, 480]],
  as: [[1260, 140], [1700, 120], [1880, 260], [1800, 420], [1600, 480], [1400, 440], [1280, 360], [1250, 240]] };
export const PLACES = { washington: [610, 330], miami: [560, 450], casablanca: [960, 420], tehran: [1330, 360], yalta: [1220, 270], hawaii: [80, 470], normandy: [1000, 250], warm: [575, 390], trinidad: [640, 560], belem: [700, 660], gambia: [920, 560], maryland: [615, 315] };
export function map(g, t, o = {}) {
  g.fillStyle = '#8ec3d8'; g.fillRect(-W, -H, W * 3, H * 3); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (let x = 0; x < W; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 120) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (const k in MAP) P(g, MAP[k], '#e9d9a8', 5);
  P(g, [[60, 450], [90, 440], [110, 470], [80, 490]], '#e9d9a8', 3); P(g, [[960, 120], [1010, 100], [1020, 160], [980, 170]], '#e9d9a8', 3);
  for (const m of o.marks || []) { const [x, y] = PLACES[m.p] || m.xy; const s = pop(t, m.at || 0, 0.3); if (s <= 0) continue; g.save(); g.translate(x, y); g.scale(s, s); C(g, 0, 0, 14, m.col || '#c0392b', 4); if (m.label) T(g, m.label, m.dx ?? 0, m.dy ?? -44, 40); g.restore(); }
  for (const r of o.routes || []) { const pts = r.pts.map(p => PLACES[p] || p); const p = clamp((t - (r.at || 0)) / (r.d || 2)); const tot = pts.length - 1, seg = p * tot; for (let i = 0; i < Math.floor(seg); i++) arrow(g, ...pts[i], ...pts[i + 1], 1, r.col || '#c0392b', 7); if (seg < tot && p > 0) arrow(g, ...pts[Math.floor(seg)], ...pts[Math.floor(seg) + 1], seg % 1, r.col || '#c0392b', 7); }
}
export function sub(g, x, y, s = 1, t = 0) { g.save(); g.translate(x, y); g.scale(s, s); O(g, 0, 0, 90, 22, '#5a6270', 4); R(g, -20, -44, 44, 30, '#5a6270', 4, 6); L(g, [[10, -44], [10, -80], [30, -80]], 5); g.restore(); }
