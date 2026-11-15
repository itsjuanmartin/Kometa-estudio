// engine/toon2d.js — "toon" character rig: white round head with a dark outline, flat-coloured outlined clothes,
// round mitten hands, boots, hats. Uses the same skeleton/poses as rig2d.js (POSES, posesAt, breathe, walkPose).
// Local space: feet on y=0, up is -y, figure faces +x. Base height ≈ 270 units at s = 1.
//
// outfit = {
//   skin, top: 'hoodie'|'tshirt'|'shirt'|'suit'|'uniform'|'jacket'|'sweater', color, color2 (tie / accent),
//   legs (trousers colour), shoes, belt (colour|null),
//   hair: 'messy'|'side'|'curly'|'bun'|'none', hairColor,
//   hat: 'bush'|'cap'|'helmet'|'fedora'|'beanie'|'beret'|'none', hatColor, hatBand,
//   face: 'sunglasses'|'glasses'|null, earpiece: bool, kid: bool }
import { clamp, lerp, mix, shade, alpha } from './core.js';
import { POSES } from './rig2d.js';

export const OL = '#2b211c';          // outline colour
const LW = 4.2;                        // outline width at s = 1
const HEAD_R = 44;

// ---------- primitives ----------
function tube(g, pts, w, fill, lw = LW) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = OL; g.lineWidth = w + lw * 2; path(g, pts); g.stroke();
  g.strokeStyle = fill; g.lineWidth = w; path(g, pts); g.stroke();
}
function path(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); }
function shape(g, pts, fill, lw = LW, close = true) {
  path(g, pts); if (close) g.closePath();
  g.fillStyle = fill; g.fill(); g.lineJoin = 'round'; g.strokeStyle = OL; g.lineWidth = lw; g.stroke();
}
function disc(g, x, y, r, fill, lw = LW) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); } }
function oval(g, x, y, rx, ry, rot, fill, lw = LW) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); } }
function line(g, pts, w, c = OL) { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = c; g.lineWidth = w; path(g, pts); g.stroke(); }
const P = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const norm = (v) => { const d = Math.hypot(v[0], v[1]) || 1; return [v[0] / d, v[1] / d]; };

// ---------- faces ----------
// eyes: dot|wide|happy|closed ; brows: soft|raised|worried|angry|confused|cocky ; mouth: smile|grin|smirk|flat|o|oBig|frown|wavy|smallSmile
export const TOON_EXPR = {
  neutral: { eyes: 'dot', brows: 'soft', mouth: 'smallSmile' }, smile: { eyes: 'dot', brows: 'soft', mouth: 'smile' },
  happy: { eyes: 'happy', brows: 'raised', mouth: 'grin' }, joy: { eyes: 'happy', brows: 'raised', mouth: 'grin' },
  surprised: { eyes: 'wide', brows: 'raised', mouth: 'o' }, shocked: { eyes: 'wide', brows: 'raised', mouth: 'oBig' },
  awe: { eyes: 'wide', brows: 'raised', mouth: 'o' }, scared: { eyes: 'wide', brows: 'worried', mouth: 'wavy' },
  worried: { eyes: 'dot', brows: 'worried', mouth: 'wavy' }, nervous: { eyes: 'dot', brows: 'worried', mouth: 'flat', sweat: true },
  angry: { eyes: 'dot', brows: 'angry', mouth: 'frown' }, determined: { eyes: 'dot', brows: 'angry', mouth: 'smirk' },
  sad: { eyes: 'dot', brows: 'worried', mouth: 'frown' }, cry: { eyes: 'closed', brows: 'worried', mouth: 'frown', tears: true },
  smirk: { eyes: 'dot', brows: 'cocky', mouth: 'smirk' }, sleepy: { eyes: 'closed', brows: 'soft', mouth: 'flat' },
  thinking: { eyes: 'dot', brows: 'confused', mouth: 'flat', look: [0.6, -0.6] }, confused: { eyes: 'dot', brows: 'confused', mouth: 'wavy' },
};
// toonFace(g, hx, hy, r, {expr, talk, blink, look, front, override})
export function toonFace(g, hx, hy, r, o = {}) {
  const ex = { ...(TOON_EXPR[o.expr] || TOON_EXPR.neutral), ...(o.override || {}) };
  const look = o.look || ex.look || [0, 0];
  const front = !!o.front;
  const eyes = front ? [[hx - r * 0.3, 0.95], [hx + r * 0.3, 0.95]] : [[hx + r * 0.08, 0.85], [hx + r * 0.5, 1]];
  const ey = hy - r * 0.06;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [x, k] of eyes) {
    const er = r * 0.095 * k;
    if (o.blink || ex.eyes === 'closed') { line(g, [[x - er * 1.4, ey], [x + er * 1.4, ey]], r * 0.06); continue; }
    if (ex.eyes === 'happy') { g.strokeStyle = OL; g.lineWidth = r * 0.065; g.beginPath(); g.arc(x, ey + er, er * 1.4, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); continue; }
    if (ex.eyes === 'wide') { disc(g, x, ey, er * 2.1, '#ffffff', r * 0.045); disc(g, x + look[0] * er * 0.8, ey + look[1] * er * 0.8, er * 0.95, OL, 0); continue; }
    oval(g, x + look[0] * er * 0.7, ey + look[1] * er * 0.7, er * 0.9, er * 1.15, 0, OL, 0);
  }
  // brows: thick, slightly curved
  const by = ey - r * 0.27, bw = r * 0.14, bt = r * 0.075;
  const brow = (x, tilt, lift = 0) => line(g, [[x - bw, by - lift + tilt], [x, by - lift - r * 0.03], [x + bw, by - lift - tilt]], bt);
  const [b0, b1] = [eyes[0][0], eyes[1][0]];
  switch (ex.brows) {
    case 'raised': brow(b0, 0, r * 0.1); brow(b1, 0, r * 0.1); break;
    case 'worried': brow(b0, r * 0.06); brow(b1, -r * 0.06); break;
    case 'angry': brow(b0, -r * 0.07); brow(b1, r * 0.07); break;
    case 'confused': brow(b0, r * 0.05); brow(b1, 0, r * 0.1); break;
    case 'cocky': brow(b0, r * 0.04); brow(b1, 0, r * 0.07); break;
    default: brow(b0, 0); brow(b1, 0);
  }
  const mx = front ? hx : hx + r * 0.32, my = hy + r * 0.36;
  const talk = o.talk || 0;
  if (talk > 0.05) {
    oval(g, mx, my, r * 0.15, r * (0.05 + 0.17 * talk), 0, '#5a1f1f', r * 0.05);
    if (talk > 0.4) { g.save(); g.beginPath(); g.ellipse(mx, my, r * 0.15, r * (0.05 + 0.17 * talk), 0, 0, 7); g.clip(); disc(g, mx, my + r * 0.16 * talk, r * 0.1, '#e0707a', 0); g.restore(); }
  } else switch (ex.mouth) {
    case 'smile': g.strokeStyle = OL; g.lineWidth = r * 0.06; g.beginPath(); g.arc(mx, my - r * 0.16, r * 0.22, 0.45, Math.PI - 0.45); g.stroke(); break;
    case 'smallSmile': g.strokeStyle = OL; g.lineWidth = r * 0.055; g.beginPath(); g.arc(mx, my - r * 0.1, r * 0.14, 0.5, Math.PI - 0.5); g.stroke(); break;
    case 'grin': {
      g.beginPath(); g.moveTo(mx - r * 0.24, my - r * 0.06); g.quadraticCurveTo(mx, my + r * 0.36, mx + r * 0.24, my - r * 0.06); g.closePath();
      g.fillStyle = '#5a1f1f'; g.fill(); g.save(); g.clip(); disc(g, mx, my + r * 0.2, r * 0.13, '#e0707a', 0); g.fillStyle = '#fff'; g.fillRect(mx - r * 0.24, my - r * 0.08, r * 0.48, r * 0.07); g.restore();
      g.strokeStyle = OL; g.lineWidth = r * 0.05; g.stroke(); break; }
    case 'smirk': line(g, [[mx - r * 0.16, my + r * 0.02], [mx + r * 0.04, my + r * 0.04], [mx + r * 0.2, my - r * 0.07]], r * 0.055); break;
    case 'flat': line(g, [[mx - r * 0.15, my], [mx + r * 0.15, my]], r * 0.055); break;
    case 'o': oval(g, mx, my, r * 0.08, r * 0.11, 0, '#5a1f1f', r * 0.045); break;
    case 'oBig': oval(g, mx, my + r * 0.03, r * 0.13, r * 0.17, 0, '#5a1f1f', r * 0.05); break;
    case 'frown': g.strokeStyle = OL; g.lineWidth = r * 0.055; g.beginPath(); g.arc(mx, my + r * 0.18, r * 0.17, Math.PI + 0.55, Math.PI * 2 - 0.55); g.stroke(); break;
    case 'wavy': { g.strokeStyle = OL; g.lineWidth = r * 0.05; g.beginPath(); for (let i = 0; i <= 14; i++) { const u = i / 14, x = mx - r * 0.18 + u * r * 0.36, y = my + Math.sin(u * Math.PI * 2) * r * 0.045; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); break; }
  }
  if (ex.tears) for (const [x] of eyes) oval(g, x, ey + r * 0.24, r * 0.045, r * 0.09, 0, '#8fd0ff', 0);
  if (ex.sweat) oval(g, hx - r * 0.55, hy - r * 0.4, r * 0.07, r * 0.11, 0, '#9fd8ff', r * 0.03);
  g.restore();
}

// ---------- hair & hats ----------
function hair(g, of, hx, hy, r, front) {
  const c = of.hairColor || '#5a3a24';
  if (!of.hair || of.hair === 'none') return;
  if (of.hair === 'bun') { disc(g, hx - r * (front ? 0 : 0.55), hy - r * 0.95, r * 0.36, c); }
  const a0 = front ? Math.PI * 1.02 : Math.PI * 0.95, a1 = front ? Math.PI * 1.98 : Math.PI * 1.88;
  const tufts = of.hair === 'curly' ? 9 : 7, out = [];
  for (let i = 0; i <= 24; i++) { const a = lerp(a0, a1, i / 24); out.push([hx + Math.cos(a) * r * 1.08, hy + Math.sin(a) * r * 1.08]); }
  if (of.hair === 'messy') out.splice(8, 0, [hx - r * 0.1, hy - r * 1.32], [hx + r * 0.05, hy - r * 1.12], [hx + r * 0.22, hy - r * 1.28]);
  // jagged inner edge going back
  for (let i = tufts; i >= 0; i--) {
    const a = lerp(a0, a1, i / tufts), k = of.hair === 'side' ? lerp(0.55, 0.78, i / tufts) : i % 2 ? 0.62 : 0.8;
    const kk = of.hair === 'curly' ? (i % 2 ? 0.7 : 0.86) : k;
    out.push([hx + Math.cos(a) * r * kk, hy + Math.sin(a) * r * kk + (front ? 0 : r * 0.05)]);
  }
  shape(g, out, c, LW * 0.9);
  if (!front && of.hair !== 'curly') shape(g, [[hx - r * 0.98, hy - r * 0.25], [hx - r * 1.06, hy + r * 0.2], [hx - r * 0.78, hy - r * 0.05]], c, LW * 0.9);
}
function hat(g, of, hx, hy, r, front) {
  const c = of.hatColor || '#6e6a4a', d = shade(c, -0.25), band = of.hatBand || d;
  const fw = front ? 0 : 1;   // brim/bill direction offsets only in side view
  switch (of.hat) {
    case 'bush': {   // wide-brim slouch hat (field / soldier / explorer)
      shape(g, [[hx - r * 0.72, hy - r * 0.62], [hx - r * 0.66, hy - r * 1.28], [hx - r * 0.2, hy - r * 1.42], [hx + r * 0.05, hy - r * 1.3], [hx + r * 0.32, hy - r * 1.42], [hx + r * 0.74, hy - r * 1.24], [hx + r * 0.78, hy - r * 0.62]], c);
      shape(g, [[hx - r * 0.74, hy - r * 0.62], [hx - r * 0.72, hy - r * 0.82], [hx + r * 0.78, hy - r * 0.82], [hx + r * 0.8, hy - r * 0.62]], band, LW * 0.8);
      oval(g, hx + fw * r * 0.1, hy - r * 0.6, r * 1.62, r * 0.22, fw * -0.06, c);
      break; }
    case 'fedora': {
      shape(g, [[hx - r * 0.7, hy - r * 0.62], [hx - r * 0.6, hy - r * 1.3], [hx, hy - r * 1.18], [hx + r * 0.62, hy - r * 1.32], [hx + r * 0.72, hy - r * 0.62]], c);
      shape(g, [[hx - r * 0.7, hy - r * 0.62], [hx - r * 0.68, hy - r * 0.82], [hx + r * 0.71, hy - r * 0.82], [hx + r * 0.72, hy - r * 0.62]], band, LW * 0.8);
      oval(g, hx + fw * r * 0.08, hy - r * 0.6, r * 1.3, r * 0.18, fw * -0.05, c);
      break; }
    case 'cap': {
      g.beginPath(); g.ellipse(hx, hy - r * 0.38, r * 1.05, r * 0.86, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = c; g.fill(); g.strokeStyle = OL; g.lineWidth = LW; g.stroke();
      if (front) oval(g, hx, hy - r * 0.38, r * 0.95, r * 0.16, 0, d); else shape(g, [[hx + r * 0.4, hy - r * 0.42], [hx + r * 1.55, hy - r * 0.34], [hx + r * 1.5, hy - r * 0.22], [hx + r * 0.4, hy - r * 0.28]], d);
      disc(g, hx, hy - r * 1.24, r * 0.08, d, LW * 0.6);
      break; }
    case 'helmet': {
      g.beginPath(); g.ellipse(hx, hy - r * 0.32, r * 1.18, r * 1.0, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = c; g.fill(); g.strokeStyle = OL; g.lineWidth = LW; g.stroke();
      oval(g, hx, hy - r * 0.32, r * 1.32, r * 0.14, 0, d);
      g.strokeStyle = alpha('#ffffff', 0.35); g.lineWidth = r * 0.08; g.beginPath(); g.ellipse(hx - r * 0.2, hy - r * 0.6, r * 0.6, r * 0.5, 0, Math.PI * 1.15, Math.PI * 1.5); g.stroke();
      break; }
    case 'beanie': {
      g.beginPath(); g.ellipse(hx, hy - r * 0.3, r * 1.06, r * 1.02, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = c; g.fill(); g.strokeStyle = OL; g.lineWidth = LW; g.stroke();
      shape(g, [[hx - r * 1.08, hy - r * 0.1], [hx - r * 1.08, hy - r * 0.42], [hx + r * 1.08, hy - r * 0.42], [hx + r * 1.08, hy - r * 0.1]], d);
      disc(g, hx, hy - r * 1.36, r * 0.22, shade(c, 0.25)); break; }
    case 'bowler': {
      g.beginPath(); g.ellipse(hx, hy - r * 0.62, r * 0.82, r * 0.78, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = c; g.fill(); g.strokeStyle = OL; g.lineWidth = LW; g.stroke();
      oval(g, hx + fw * r * 0.05, hy - r * 0.6, r * 1.12, r * 0.15, 0, c); break; }
    case 'beret': oval(g, hx - fw * r * 0.15, hy - r * 0.78, r * 1.05, r * 0.42, fw * -0.15, c); disc(g, hx - fw * r * 0.1, hy - r * 1.2, r * 0.08, d, LW * 0.6); break;
  }
}

// ---------- torso & clothes ----------
function torso(g, of, p, front) {
  const sp = norm([p.hip[0] - p.sh[0], p.hip[1] - p.sh[1]]), n = [-sp[1], sp[0]];
  const wk = of.wide || 1, wS = 26 * wk, wH = (of.top === 'suit' || of.top === 'uniform' || of.top === 'jacket' ? 25 : 23) * wk * (of.wide ? 1.12 : 1);
  const bot = [p.hip[0] + sp[0] * 10, p.hip[1] + sp[1] * 10];
  const top = [p.sh[0] - sp[0] * 4, p.sh[1] - sp[1] * 4];
  const pts = [[top[0] + n[0] * wS, top[1] + n[1] * wS], [bot[0] + n[0] * wH, bot[1] + n[1] * wH], [bot[0] - n[0] * wH, bot[1] - n[1] * wH], [top[0] - n[0] * wS, top[1] - n[1] * wS]];
  const c = of.color || '#e8833a';
  shape(g, pts, c);
  const at = (k, off = 0) => [lerp(top[0], bot[0], k) + n[0] * off, lerp(top[1], bot[1], k) + n[1] * off];
  const fx = front ? 0 : 7;   // front detail offset toward facing side in 3/4
  switch (of.top) {
    case 'hoodie': {
      shape(g, [at(0.62, -14 + fx), at(0.62, 12 + fx), at(0.9, 15 + fx), at(0.9, -17 + fx)], shade(c, -0.12), LW * 0.8);
      line(g, [at(0.04, 2 + fx), at(0.3, 3 + fx)], 2.6); line(g, [at(0.04, 9 + fx), at(0.28, 11 + fx)], 2.6);
      break; }
    case 'shirt': {
      shape(g, [at(0, -9 + fx), at(0.16, fx), at(0, 9 + fx), at(-0.04, fx)], shade(c, 0.18), LW * 0.8);
      for (const k of [0.3, 0.5, 0.7]) disc(g, ...at(k, fx), 2.2, OL, 0);
      break; }
    case 'suit': {
      shape(g, [at(0, -8 + fx), at(0.55, fx), at(0, 8 + fx)], '#f4f1ea', LW * 0.7);
      shape(g, [at(0.05, fx - 2.5), at(0.08, fx + 2.5), at(0.45, fx + 3), at(0.52, fx), at(0.45, fx - 3)], of.color2 || '#c0392b', LW * 0.6);
      line(g, [at(0, -9 + fx), at(0.55, fx)], 3); line(g, [at(0, 9 + fx), at(0.55, fx)], 3);
      disc(g, ...at(0.68, fx + 1), 2.4, OL, 0);
      break; }
    case 'uniform': case 'jacket': {
      shape(g, [at(0, -9 + fx), at(0.13, fx), at(0, 9 + fx)], shade(c, -0.15), LW * 0.7);
      shape(g, [at(0.2, -15 + fx), at(0.2, -3 + fx), at(0.36, -3 + fx), at(0.36, -15 + fx)], shade(c, -0.1), LW * 0.6);
      shape(g, [at(0.2, 3 + fx), at(0.2, 15 + fx), at(0.36, 15 + fx), at(0.36, 3 + fx)], shade(c, -0.1), LW * 0.6);
      line(g, [at(0.14, fx), at(0.95, fx)], 2.2, shade(c, -0.4));
      break; }
    case 'sweater': line(g, [at(0.02, -10 + fx), at(0.1, fx), at(0.02, 10 + fx)], 3, shade(c, -0.3)); break;
  }
  if (of.belt) shape(g, [at(0.86, -wH - 1), at(0.86, wH + 1), at(0.98, wH + 1), at(0.98, -wH - 1)], of.belt, LW * 0.7);
}
const sleeveType = (of) => (of.top === 'tshirt' ? 'short' : of.top ? 'long' : 'none');
function arm(g, of, sh, el, ha, far) {
  const skin = of.skin || '#fbf7ef', c = far ? shade(of.color || '#e8833a', -0.18) : of.color || '#e8833a';
  const st = sleeveType(of);
  if (st === 'long') tube(g, [sh, el, P(el, ha, 0.8)], 18, c);
  else if (st === 'short') { tube(g, [el, ha], 12, far ? shade(skin, -0.08) : skin); tube(g, [sh, P(sh, el, 0.85)], 19, c); }
  else tube(g, [sh, el, ha], 10, skin);
  disc(g, ha[0], ha[1], 11.5, far ? shade(skin, -0.08) : skin);
}
function leg(g, of, hip, kn, ft, far) {
  const c = of.legs || '#3d4f6e', sh = of.shoes || '#3a2a22';
  tube(g, [hip, kn, ft], 20, far ? shade(c, -0.18) : c);
  oval(g, ft[0] + 8, ft[1] - 6, 18, 9.5, 0, far ? shade(sh, -0.15) : sh);
}

// ---------- the figure ----------
// drawToon(g, { x, y, s, facing, pose, rot, outfit, expr, talk, blink, look, alpha, shadow, prop })
export function drawToon(g, o) {
  const of = o.outfit || {}, p0 = o.pose || POSES.stand, f = o.facing ?? 1;
  const s = (o.s ?? 1) * (of.kid ? 0.75 : 1);
  // stretch the skeleton slightly: longer body, and the head sits on a short neck above the shoulders
  const p = {}; for (const k in p0) p[k] = [p0[k][0], p0[k][1] * 1.0];
  const nd = norm([p.head[0] - p.sh[0], p.head[1] - p.sh[1]]);
  const neck = [p.sh[0] + nd[0] * 6, p.sh[1] + nd[1] * 6];
  const hc = [p.sh[0] + nd[0] * (HEAD_R + 8), p.sh[1] + nd[1] * (HEAD_R + 8)];
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.shadow !== false && !o.rot) { g.fillStyle = 'rgba(40,25,10,.22)'; g.beginPath(); g.ellipse(o.x, o.y + 3, 40 * s, 7 * s, 0, 0, Math.PI * 2); g.fill(); }
  g.translate(o.x, o.y); g.scale(f * s, s);
  if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
  // far limbs
  leg(g, of, p.hip, p.kB, p.fB, true);
  arm(g, of, p.sh, p.eB, p.hB, true);
  if (o.propBack) o.propBack(g, p);
  // hood behind the neck
  if (of.top === 'hoodie') oval(g, p.sh[0] - 14, p.sh[1] - 2, 18, 13, -0.4, shade(of.color || '#e8833a', -0.15));
  leg(g, of, p.hip, p.kF, p.fF, false);
  torso(g, of, p, false);
  // neck + head
  tube(g, [p.sh, neck], 12, of.skin || '#fbf7ef', LW * 0.9);
  if (of.top === 'suit' || of.top === 'shirt') shape(g, [[p.sh[0] - 9, p.sh[1] - 2], [p.sh[0] + 2, p.sh[1] + 9], [p.sh[0] + 12, p.sh[1] - 3]], '#f4f1ea', LW * 0.7);
  const [hx, hy] = hc;
  if (of.hair === 'bun' && !of.hat) hair(g, { ...of, hair: 'bun' }, hx, hy, HEAD_R, false);
  disc(g, hx, hy, HEAD_R, of.skin || '#fbf7ef', LW * 1.05);
  if (!of.hat || of.hat === 'none') hair(g, of, hx, hy, HEAD_R, false);
  else if (of.hair && of.hair !== 'none') { // a tuft of hair peeking out under the hat: keeps the hero recognisable in costume
    shape(g, [[hx - HEAD_R * 0.95, hy - HEAD_R * 0.5], [hx - HEAD_R * 1.08, hy - HEAD_R * 0.05], [hx - HEAD_R * 0.8, hy - HEAD_R * 0.28], [hx - HEAD_R * 0.7, hy - HEAD_R * 0.55]], of.hairColor || '#5a3a24', LW * 0.8);
  }
  toonFace(g, hx, hy, HEAD_R, { expr: o.expr, talk: o.talk, blink: o.blink, look: o.look, override: o.face && typeof o.face === 'object' ? o.face : null });
  accessories(g, of, hx, hy, HEAD_R, false);
  mouthStuff(g, of, hx, hy, HEAD_R, false, o.t || 0);
  if (of.hat && of.hat !== 'none') hat(g, of, hx, hy, HEAD_R, false);
  // near arm on top
  arm(g, of, p.sh, p.eF, p.hF, false);
  if (o.prop) o.prop(g, p);
  g.restore();
  return { head: [o.x + hx * f * s, o.y + hy * s, HEAD_R * s] };
}
function accessories(g, of, hx, hy, r, front) {
  const ox = front ? 0 : r * 0.29;
  if (of.face === 'sunglasses') {
    const ey = hy - r * 0.08;
    const lens = (x, w) => { g.beginPath(); g.ellipse(x, ey, w, r * 0.15, 0, 0, Math.PI * 2); g.fillStyle = '#16141a'; g.fill(); g.strokeStyle = OL; g.lineWidth = LW * 0.8; g.stroke(); g.fillStyle = 'rgba(160,220,255,.55)'; g.fillRect(x - w * 0.5, ey - r * 0.08, w * 0.35, r * 0.04); };
    if (front) { lens(hx - r * 0.3, r * 0.22); lens(hx + r * 0.3, r * 0.22); line(g, [[hx - r * 0.1, ey], [hx + r * 0.1, ey]], LW); }
    else { lens(hx + r * 0.08, r * 0.17); lens(hx + r * 0.52, r * 0.2); line(g, [[hx + r * 0.25, ey], [hx + r * 0.32, ey]], LW); line(g, [[hx - r * 0.1, ey], [hx - r * 0.75, ey - r * 0.05]], LW * 0.9); }
  }
  if (of.face === 'glasses') {
    const ey = hy - r * 0.06; g.strokeStyle = OL; g.lineWidth = LW * 0.8;
    const xs = front ? [hx - r * 0.3, hx + r * 0.3] : [hx + r * 0.08, hx + r * 0.5];
    for (const x of xs) { g.beginPath(); g.arc(x, ey, r * 0.17, 0, Math.PI * 2); g.stroke(); }
    line(g, [[xs[0] + r * 0.17, ey], [xs[1] - r * 0.17, ey]], LW * 0.8);
  }
  if (of.earpiece && !front) { disc(g, hx - r * 0.12, hy + r * 0.05, r * 0.08, '#1a1a1e', LW * 0.6); g.strokeStyle = '#d8d8e0'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx - r * 0.12, hy + r * 0.12); g.bezierCurveTo(hx - r * 0.3, hy + r * 0.5, hx - r * 0.05, hy + r * 0.7, hx - r * 0.25, hy + r * 1.1); g.stroke(); }
}

function mouthStuff(g, of, hx, hy, r, front, t) {
  const mx = front ? hx : hx + r * 0.32, my = hy + r * 0.24;
  if (of.mustache) { const c = of.mustacheColor || of.hairColor || '#4a3020', big = of.mustache === 'big' ? 1.35 : 1;
    shape(g, [[mx - r * 0.24 * big, my + r * 0.06], [mx - r * 0.1, my - r * 0.05], [mx, my - r * 0.02], [mx + r * 0.1, my - r * 0.05], [mx + r * 0.24 * big, my + r * 0.06], [mx, my + r * 0.04]], c, LW * 0.7); }
  const p = of.mouthProp; if (!p) return;
  const sx = mx + r * 0.12, sy = hy + r * 0.38;
  if (p === 'cigar') { g.save(); g.translate(sx, sy); g.rotate(0.15); shape(g, [[0, -r * 0.07], [r * 0.5, -r * 0.08], [r * 0.5, r * 0.08], [0, r * 0.07]], '#7a4a28', LW * 0.7); disc(g, r * 0.52, 0, r * 0.06, '#ff9a4a', 0); g.restore();
    for (let i = 0; i < 3; i++) { const k = ((t * 0.5 + i / 3) % 1); g.fillStyle = `rgba(230,230,230,${0.5 * (1 - k)})`; g.beginPath(); g.arc(sx + r * 0.6 + Math.sin(k * 6 + i) * r * 0.1, sy - k * r * 0.9, r * (0.06 + k * 0.1), 0, 7); g.fill(); } }
  if (p === 'holder') { g.save(); g.translate(sx, sy); g.rotate(-0.45); line(g, [[0, 0], [r * 0.85, 0]], r * 0.07); line(g, [[r * 0.85, 0], [r * 1.0, 0]], r * 0.09, '#f4f1ea'); g.restore(); }
  if (p === 'pipe') { line(g, [[sx - r * 0.05, sy], [sx + r * 0.35, sy + r * 0.05]], r * 0.07); shape(g, [[sx + r * 0.3, sy + r * 0.12], [sx + r * 0.3, sy - r * 0.12], [sx + r * 0.5, sy - r * 0.12], [sx + r * 0.48, sy + r * 0.12]], '#5a3420', LW * 0.7); }
}

// toonBigFace(g, cx, cy, r, {outfit, expr, talk, blink, look, tilt}) — giant close-up (head + shoulders)
export function toonBigFace(g, cx, cy, r, o = {}) {
  const of = o.outfit || {}, k = r / HEAD_R;
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt); g.scale(k, k);
  // shoulders / torso cropped by frame bottom
  const c = of.color || '#e8833a';
  if (of.top === 'hoodie') oval(g, 0, HEAD_R * 1.15, HEAD_R * 1.0, HEAD_R * 0.45, 0, shade(c, -0.15));
  shape(g, [[-HEAD_R * 2.1, HEAD_R * 4], [-HEAD_R * 1.75, HEAD_R * 1.55], [-HEAD_R * 0.5, HEAD_R * 1.15], [HEAD_R * 0.5, HEAD_R * 1.15], [HEAD_R * 1.75, HEAD_R * 1.55], [HEAD_R * 2.1, HEAD_R * 4]], c);
  if (of.top === 'suit') { shape(g, [[-HEAD_R * 0.45, HEAD_R * 1.2], [0, HEAD_R * 2.4], [HEAD_R * 0.45, HEAD_R * 1.2]], '#f4f1ea'); shape(g, [[-HEAD_R * 0.12, HEAD_R * 1.3], [HEAD_R * 0.12, HEAD_R * 1.3], [HEAD_R * 0.16, HEAD_R * 2.2], [0, HEAD_R * 2.4], [-HEAD_R * 0.16, HEAD_R * 2.2]], of.color2 || '#c0392b'); }
  if (of.top === 'uniform' || of.top === 'jacket' || of.top === 'shirt') shape(g, [[-HEAD_R * 0.5, HEAD_R * 1.15], [0, HEAD_R * 1.6], [HEAD_R * 0.5, HEAD_R * 1.15]], shade(c, -0.15));
  tube(g, [[0, HEAD_R * 0.8], [0, HEAD_R * 1.2]], HEAD_R * 0.5, of.skin || '#fbf7ef', LW * 0.9);
  if (of.hair === 'bun' && !of.hat) hair(g, of, 0, 0, HEAD_R, true);
  disc(g, 0, 0, HEAD_R, of.skin || '#fbf7ef', LW * 0.9);
  if (!of.hat || of.hat === 'none') hair(g, of, 0, 0, HEAD_R, true);
  toonFace(g, 0, 0, HEAD_R, { expr: o.expr, talk: o.talk, blink: o.blink, look: o.look, front: true });
  accessories(g, of, 0, 0, HEAD_R, true);
  mouthStuff(g, of, 0, 0, HEAD_R, true, o.t || 0);
  if (of.hat && of.hat !== 'none') hat(g, of, 0, 0, HEAD_R, true);
  g.restore();
}
