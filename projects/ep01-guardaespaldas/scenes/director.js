// director.js — every shot in story/shots.json with params.scene is drawn here.
import { E, registerShot, ease, clamp, lerp, prog, alpha, shade, FONTS, rng } from '/engine/core.js';
import { POSES, posesAt, walkPose } from '/engine/rig2d.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from './lib.js';
const { W, H, GY, R, P, C, O, L, T, OL, guy, fdr, fala } = K;

const CAST = { tomi: K.TOMI, fdr: K.FDR, fdrTired: K.FDR_TIRED, reilly: K.REILLY, churchill: K.CHURCHILL_BARE, stalin: K.STALIN, truman: K.TRUMAN, waiter: K.WAITER, agent: K.AGENT };
const ex = (t, p, d) => K.exprAt(t, p.ex, p.expr || d);

// ---------- backgrounds for close-ups ----------
function bgFor(g, t, kind) {
  switch (kind) {
    case 'deck': K.deck(g, t, { turret: false }); break;
    case 'night': K.sky(g, 'night', t); K.city(g, t, GY + 100, 0, true); break;
    case 'sepia': K.sky(g, 'sepia', t); K.crowd(g, t, 820, 20); break;
    case 'office': K.room(g, 'office'); break;
    case 'plane': K.room(g, 'plane', { t }); break;
    case 'embassy': K.room(g, 'embassy'); break;
    case 'bunk': K.room(g, 'bunk'); break;
    case 'garden': K.sky(g, 'night', t); K.ground(g, '#2e4a3a', 800); break;
    case 'sunny': K.sky(g, 'day', t); K.ground(g, '#8ab060', 820); K.pine(g, 300, 820, 1.4); K.pine(g, 1600, 820, 1.2); break;
    default: K.room(g, 'hall');
  }
}

const S = {
  // ===== COLD OPEN / DECK =====
  deckOpen(g, t, d, p) {
    K.deck(g, t, { escort: p.escort, escortX: 1650 });
    if (p.wake) K.wake(g, t, 2100, 560, 1300, 600, clamp((t - (p.wake.at || 0)) / (p.wake.d || 3)) * 0.9);
    K.guy(g, t, K.SAILOR, 1150, GY + 20, { f: -1, pose: p.alarm ? 'pointUp' : 'relaxed', expr: p.alarm ? 'shocked' : 'neutral', seed: 3, s: 1.25 });
    fdr(g, t, 780, GY + 40, { f: 1, expr: ex(t, p, 'smile'), s: 1.35 });
    guy(g, t, K.TOMI, 500, GY + 40, { f: 1, pose: p.alarm ? 'ready' : 'crossArms', expr: ex(t, p, p.alarm ? 'scared' : 'neutral'), s: 1.4 });
    if (p.run) for (let i = 0; i < 2; i++) { const x = ((t * 520 + i * 1100) % (W + 600)) - 300; guy(g, t, K.SAILOR, W + 300 - x, GY + 10 - i * 30, { f: -1, s: 1.1, pose: walkPose(t * 2 * Math.PI * 1.6 + i, { run: true }), still: true, expr: 'scared', seed: i }); }
    if (p.alarm) { const bx = 1500, by = 380; R(g, bx - 30, by, 60, 40, '#5a6270', 4, 6); O(g, bx, by - 10, 34, 40, '#e0302a', 5); g.save(); g.globalAlpha = 0.35; g.translate(bx, by - 10); g.rotate(t * 7); P(g, [[0, 0], [900, -140], [900, 140]], '#ff5040', 0); P(g, [[0, 0], [-900, -140], [-900, 140]], '#ff5040', 0); g.restore();
      g.fillStyle = `rgba(220,40,30,${0.18 * (0.5 + 0.5 * Math.sin(t * 9))})`; g.fillRect(-W, -H, W * 3, H * 3); }
  },
  // big close-up of the torpedo running just under the surface (camera tracks it)
  torpedoClose(g, t, d, p) {
    const SY = 330; K.sky(g, 'day', t);
    const ug = g.createLinearGradient(0, SY, 0, H); ug.addColorStop(0, '#4f9ac0'); ug.addColorStop(1, '#173e62'); g.fillStyle = ug; g.fillRect(-W, SY, W * 3, H * 2);
    g.save(); g.globalAlpha = 0.18; for (let i = 0; i < 6; i++) { const x = ((i * 380 + t * 900) % (W + 600)) - 300; P(g, [[x, SY], [x + 120, SY], [x + 320, H], [x + 160, H]], '#ffffff', 0); } g.restore();
    const r = rng(11); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.lineCap = 'round';
    for (let i = 0; i < 40; i++) { const y = SY + 40 + r() * (H - SY), x = ((r() * W * 1.5 + t * 2200 * (0.6 + r())) % (W * 1.5)) - 200; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 90 + r() * 120, y); g.stroke(); }
    g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); for (let x = -50; x <= W + 50; x += 20) g.lineTo(x, SY + Math.sin(x / 60 + t * 8) * 6); g.stroke();
    const tx = W / 2 - 120 + Math.sin(t * 2) * 20, ty = 620 + Math.sin(t * 3) * 10;
    for (let i = 0; i < 26; i++) { const x = tx + 380 + i * 60 - ((t * 900) % 60); C(g, x, SY - 4 + Math.sin(i + t * 9) * 6, Math.max(2, 26 - i * 0.6), '#ffffff', 0); }
    for (let i = 0; i < 70; i++) { const k = ((t * 1.8 + i / 70) % 1); const bx = tx + 470 + k * 1300 + Math.sin(i * 7) * 30, by = ty + Math.sin(i * 3.1) * 50 - k * 220; if (by > SY + 10) C(g, bx, by, 6 + (i % 4) * 4, 'rgba(255,255,255,.8)', 2); }
    g.save(); g.translate(tx, ty);
    P(g, [[380, -55], [470, -110], [480, -90], [430, 0], [480, 90], [470, 110], [380, 55]], '#4e5a52', 5);
    R(g, -420, -78, 840, 156, '#6f7d70', 6, 78);
    O(g, -420, 0, 90, 78, '#5e6a60', 6); R(g, -200, -78, 26, 156, '#56625a', 3); R(g, 120, -78, 26, 156, '#56625a', 3);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.roundRect(-380, -60, 720, 22, 11); g.fill();
    for (let k = 0; k < 3; k++) { const ang = t * 60 + k * 2.09; O(g, 470, 0, 18, 70 * Math.abs(Math.cos(ang)) + 6, '#c9a874', 3); }
    g.restore();
    if (p.flash != null && t > p.flash && t < p.flash + 0.25) { g.fillStyle = `rgba(255,250,235,${1 - (t - p.flash) / 0.25})`; g.fillRect(-W, -H, W * 3, H * 3); }
    if (p.alarm) { g.fillStyle = `rgba(220,40,30,${0.16 * (0.5 + 0.5 * Math.sin(t * 9))})`; g.fillRect(-W, -H, W * 3, H * 3); }
  },
  // the wake heading straight for the Iowa (ship on the horizon)
  wakeWide(g, t, d, p) {
    K.sky(g, 'day', t); K.ocean(g, t, 380);
    K.ship(g, 520, 420, 0.55, 1, { flag: true });
    const k = 0.12 + clamp(t / (p.d || d)) * 0.65;
    const x0 = W + 40, y0 = H + 20, x1 = 720, y1 = 440, ex = lerp(x0, x1, k), ey = lerp(y0, y1, k);
    for (const [w, a] of [[110, 0.35], [60, 0.6], [26, 0.95]]) { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w * (0.4 + 0.6 * (1 - k)); g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(ex, ey); g.stroke(); }
    O(g, ex, ey, 60 * (1 - k * 0.7), 20 * (1 - k * 0.7), '#3a3f4a', 4, Math.atan2(y1 - y0, x1 - x0));
    for (let i = 0; i < 10; i++) { const q = (t * 2 + i / 10) % 1; C(g, lerp(ex, x0, q * 0.3) + Math.sin(i * 5) * 30, lerp(ey, y0, q * 0.3) - 10, Math.max(1, 10 * (1 - q)), 'rgba(255,255,255,.9)', 0); }
    if (p.lbl != null) { K.label(g, t, 'IOWA', 520, 230, p.lbl, 70, '#f2c21a'); K.arrow(g, 520, 280, 520, 330, clamp((t - p.lbl) / 0.3)); }
    if (p.alarm) { g.fillStyle = `rgba(220,40,30,${0.12 * (0.5 + 0.5 * Math.sin(t * 9))})`; g.fillRect(-W, -H, W * 3, H * 3); }
  },
  water(g, t, d, p) {
    K.sky(g, 'day', t); K.ocean(g, t, 300);
    K.wake(g, t, W + 200, 380, W * 0.35, H + 120, clamp(t / (p.d || d)) * 0.92);
    if (p.ship) K.destroyer(g, W - 260, 300, 0.5, -1);
    if (p.q) K.label(g, t, '?', W - 260, 170, p.q, 140, '#f2c21a');
  },
  face(g, t, d, p) {
    bgFor(g, t, p.bg);
    g.fillStyle = 'rgba(255,248,232,.35)'; g.fillRect(-W, -H, W * 3, H * 3);
    const of = CAST[p.who] || K.TOMI; const sh = p.shake ? Math.sin(t * 50) * p.shake : 0;
    if (p.who === 'fala') { fala(g, t, W / 2 - 60, H * 0.82, 3.2, 1); return; }
    toonBigFace(g, W / 2 + (p.dx || 0) + sh, H * 0.52, p.r || 250, { outfit: of, expr: ex(t, p, 'neutral'), blink: K.blinkAt(t, 3.4), look: p.look, talk: p.talk ? Math.abs(Math.sin(t * 11)) * 0.8 : 0, t, tilt: p.tilt || 0 });
    if (p.sweat) O(g, W / 2 - 240, H * 0.32 + (t * 40) % 60, 14, 22, '#9fd8ff', 3);
    if (p.zzz) for (let i = 0; i < 3; i++) K.label(g, t, 'Z', W / 2 + 280 + i * 60, 260 - i * 70 - (t * 20) % 30, i * 0.4, 60 + i * 14);
  },
  subscribe(g, t, d, p) {
    g.save(); g.filter = 'grayscale(1) brightness(.8)'; S.deckOpen(g, 0, d, { wake: { at: -10, d: 1 } }); g.restore();
    g.fillStyle = 'rgba(20,16,14,.45)'; g.fillRect(-W, -H, W * 3, H * 3);
    K.T(g, 'LA MAYORÍA NO ESTÁ SUSCRITA', W / 2, 250, 72, '#fff8e8');
    K.subscribeBtn(g, t, W / 2, 560, 0.5, p.press ?? 4.2, 1.5);
    const hp = clamp((t - (p.press ?? 4.2) + 1.1) / 1.0); if (hp > 0) K.hand(g, lerp(W / 2 + 500, W / 2 + 60, ease.out(hp)), lerp(1250, 640, ease.out(hp)), 1.6);
  },
  title(g, t, d, p) {
    K.sky(g, 'golden', t); K.whiteHouse(g, W / 2, 860, 1.1); K.ground(g, '#8ab060', 860);
    guy(g, t, K.TOMI, 330, H + 40, { s: 2.2, f: 1, pose: 'crossArms', expr: 'determined' });
    const s = K.pop(t, 0.3, 0.5); g.save(); g.translate(W / 2 + 160, 300); g.scale(s, s); g.rotate(-0.03);
    R(g, -620, -70, 1240, 140, '#f2e94a', 7, 70); T(g, '¿Y SI TE TOCARA…', 0, 4, 84, OL, { stroke: 0 });
    T(g, 'SER EL GUARDAESPALDAS', 0, 170, 90, '#fff8e8'); T(g, 'DEL PRESIDENTE?', 0, 280, 90, '#fff8e8'); g.restore();
  },
  // ===== WASHINGTON =====
  whExt(g, t, d, p) {
    const night = !!p.night; K.sky(g, night ? 'night' : 'day', t); K.ground(g, night ? '#2e4a3a' : '#8ab060', 820);
    if (p.aa) { R(g, -100, 380, 420, 440, night ? '#5a5a6a' : '#c9b28a', 5); R(g, 60, 330, 120, 50, '#5a6270', 4, 6); L(g, [[120, 340], [260, 200]], 18); L(g, [[120, 340], [260, 200]], 10, '#5a6270'); R(g, 1600, 420, 420, 400, night ? '#5a5a6a' : '#c9b28a', 5); R(g, 1700, 370, 120, 50, '#5a6270', 4, 6); L(g, [[1760, 380], [1640, 230]], 18); L(g, [[1760, 380], [1640, 230]], 10, '#5a6270'); }
    K.whiteHouse(g, W / 2, 820, p.s || 1, night, { blackout: p.blackout && t > (p.blackoutAt || 0) });
    K.tree(g, 260, 860, 1.2, night ? '#2e4a3a' : '#4f8a4a'); K.tree(g, 1680, 860, 1.1, night ? '#2e4a3a' : '#4f8a4a');
    if (p.tomi) guy(g, t, K.TOMI, p.tomiX ?? 1300, 1000, { f: -1, s: 1.2, expr: ex(t, p, 'neutral'), pose: 'crossArms' });
    if (p.arrive) { const ax = lerp(-500, 700, ease.out(clamp(t / 2.5))); K.car(g, ax, 1010, 0.8, 1); if (t > 2.6) { guy(g, t, K.CHURCHILL, 880, 1030, { f: 1, s: 1.15, expr: 'happy', pose: 'wave' }); fdr(g, t, 1120, 1030, { f: -1, s: 1.15, expr: 'happy' }); } }
  },
  hall(g, t, d, p) {
    K.room(g, 'hall', { night: p.night, blackout: p.night });
    if (p.act === 'yawn') { guy(g, t, K.TOMI, 960, GY, { pose: posesAt(t, [[0, 'stand'], [1.2, 'pointUp'], [2.4, 'stand']]), expr: t > 1.2 && t < 2.4 ? 'sleepy' : 'neutral', s: 1.5 }); if (t > 1.2 && t < 2.4) O(g, 1010, 610, 14, 22, '#5a1f1f', 3); }
    if (p.act === 'boxes') { for (let i = 0; i < 3; i++) R(g, 1150 + i * 30, GY - 90 - i * 85, 160, 85, '#c9a874', 4, 4); guy(g, t, K.TOMI, 900, GY, { pose: 'holdFront', expr: 'confused', s: 1.5 }); }
    if (p.act === 'check') { guy(g, t, K.PRESS('#7a5a3a'), 1180, GY, { f: -1, pose: 'relaxed', expr: 'nervous', s: 1.45, seed: 4 }); guy(g, t, K.TOMI, 760, GY, { pose: 'holdFront', expr: 'determined', s: 1.5 }); R(g, 840, GY - 260, 70, 90, '#f2efe6', 4, 4); if (t > d * 0.5) K.label(g, t, '✓ ✓', 875, GY - 320, d * 0.5, 50, '#3fa060'); }
    if (p.act === 'churchill') { const x = lerp(300, 1500, clamp(t / d)); guy(g, t, K.CHURCHILL_BARE, x, GY, { pose: walkPose(t * 2 * Math.PI * 0.9), still: true, expr: 'thinking', s: 1.4 }); R(g, x + 30, GY - 240, 120, 80, '#e9d9a8', 3, 4); guy(g, t, K.TOMI, 200, GY, { pose: 'crossArms', expr: 'sleepy', s: 1.4, f: 1 }); }
    if (p.act === 'drill') { const x = lerp(1700, 200, ease.inOut(clamp(t / d))); fdr(g, t, x, GY, { f: -1, expr: 'surprised' }); guy(g, t, K.TOMI, x + 200, GY, { f: -1, pose: walkPose(t * 2 * Math.PI * 1.6, { run: true }), still: true, expr: 'determined' }); g.fillStyle = `rgba(220,40,30,${0.15 * (0.5 + 0.5 * Math.sin(t * 8))})`; g.fillRect(-W, -H, W * 3, H * 3); }
  },
  phone(g, t, d, p) { K.room(g, 'office'); K.desk(g, W / 2, GY + 120, 1.6); K.phone(g, W / 2, GY - 140, 1.6, 1, t); },
  map(g, t, d, p) {
    K.map(g, t, p);
    if (p.smoke) for (let i = 0; i < 6; i++) { const k = (t * 0.4 + i / 6) % 1; C(g, 80 + Math.sin(i) * 20, 440 - k * 200, 20 + k * 40, `rgba(60,55,50,${0.7 * (1 - k)})`, 0); }
    if (p.subs) for (let i = 0; i < 4; i++) K.sub(g, 680 + i * 70, 380 + (i % 2) * 90, 0.5 + 0.05 * Math.sin(t + i), t);
    if (p.top) K.pill(g, t, p.top, 92, 0.2);
  },
  briefing(g, t, d, p) {
    K.room(g, 'briefing');
    guy(g, t, K.REILLY, 1300, GY, { f: -1, pose: posesAt(t, [[0, 'talk'], [d * 0.5, 'point']]), expr: ex(t, p, 'angry'), talk: p.talk ? Math.abs(Math.sin(t * 10)) * 0.7 : 0, s: 1.5 });
    guy(g, t, K.AGENT, 450, GY + 30, { f: 1, pose: 'crossArms', expr: 'worried', s: 1.4, seed: 2 }); guy(g, t, K.AGENT2, 650, GY + 30, { f: 1, pose: 'stand', expr: 'worried', s: 1.4, seed: 5 });
    guy(g, t, K.TOMI, 860, GY + 40, { f: 1, pose: 'stand', expr: ex(t, p, 'scared'), s: 1.45 });
  },
  miami(g, t, d, p) {
    K.sky(g, 'sepia', t); K.ground(g, '#b89a6a', 860); for (let i = 0; i < 5; i++) K.tree(g, 100 + i * 420, 860, 1.1, '#9a8a5a');
    K.car(g, W / 2, 980, 1.1, 1, { color: '#4a3a2a', heads: (g) => { C(g, -40, -230, 44, '#fbf7ef', 4); O(g, -40, -265, 46, 18, '#cfcac0', 3); } });
    K.crowd(g, t, 1000, 22, { rows: 1, seed: 6 });
    if (p.flash) for (const at of [1.0, 1.4, 1.8, 2.2, 2.6]) if (t > at && t < at + 0.12) { g.fillStyle = 'rgba(255,250,220,.6)'; g.fillRect(-W, -H, W * 3, H * 3); }
    g.fillStyle = 'rgba(120,90,50,.18)'; g.fillRect(-W, -H, W * 3, H * 3);
    if (p.card) K.infoCard(g, t, p.card, p.cardAt || 1.0, 220);
  },
  bedroom(g, t, d, p) { K.room(g, 'bedroom', { night: true, wall: '#7a7aa0', floor: '#5a4a6a' }); K.bed(g, W / 2, GY + 40, 1.3); C(g, W / 2 - 360, GY - 260, 50, '#fbf7ef', 4); K.toonFaceSmall?.(); T(g, '3:00', 300, 300, 80, '#ff6a5a'); toonBigFace(g, W / 2 - 360, GY - 300, 60, { outfit: { ...K.TOMI_CASUAL }, expr: 'worried', blink: false, t }); R(g, W / 2 - 300, GY - 280, 640, 100, '#e8e2d0', 4, 30); },
  garage(g, t, d, p) {
    K.room(g, 'hall', { wall: '#9a9a8a', floor: '#6a6a62' });
    K.car(g, W / 2, GY + 30, 1.5);
    const rv = ease.inOut(clamp((t - (p.reveal ?? 0.8)) / 1.2)); if (rv < 1) { g.save(); g.translate(lerp(0, 1800, rv), lerp(0, -200, rv)); P(g, [[W / 2 - 480, GY + 40], [W / 2 - 300, GY - 300], [W / 2 + 320, GY - 310], [W / 2 + 500, GY + 40]], '#8a7a5a', 5); g.restore(); }
    if (p.tag) { K.label(g, t, 'CONFISCADO', W / 2 + 330, GY - 380, p.tag, 50, '#c0392b'); }
    if (p.glass) K.label(g, t, 'BLINDADO · ANTIBALAS', W / 2, 200, p.glass, 56, '#fff8e8');
    if (p.agents) { guy(g, t, K.REILLY, 260, GY + 60, { f: 1, pose: 'point', expr: 'smirk', s: 1.4 }); guy(g, t, K.TOMI, 1700, GY + 60, { f: -1, pose: 'stand', expr: 'surprised', s: 1.4 }); }
  },
  capone(g, t, d, p) {
    g.fillStyle = '#d8d2c4'; g.fillRect(-W, -H, W * 3, H * 3); for (let y = 150; y < H; y += 90) { L(g, [[300, y], [1620, y]], 3, 'rgba(43,33,28,.4)'); T(g, String(7 - Math.round((y - 150) / 90)) + "'", 260, y, 30, OL, { stroke: 0 }); }
    toonBigFace(g, W / 2, H * 0.55, 230, { outfit: { top: 'suit', color: '#3a3a44', color2: '#c0392b', hat: 'fedora', hatColor: '#6a6a72', hatBand: '#2a2a2e' }, expr: 'smirk', t });
    R(g, W / 2 - 300, H - 230, 600, 120, '#2a2a30', 5, 8); T(g, 'AL CAPONE', W / 2, H - 170, 70, '#fff8e8', { stroke: 0 });
    if (p.sub) K.label(g, t, 'EL GÁNSTER MÁS FAMOSO', W / 2, 110, p.sub, 54);
  },
  carRide(g, t, d, p) {
    K.sky(g, 'day', t); K.city(g, t, GY - 40, t * 300); K.ground(g, '#6a6a62', GY - 40); for (let x = -200; x < W + 200; x += 260) R(g, ((x - t * 600) % (W + 400) + W + 400) % (W + 400) - 200, GY + 80, 120, 14, '#f2efe6', 0);
    K.car(g, W / 2, GY + 70 + Math.sin(t * 20) * 2, 1.4, 1, { heads: (g) => { C(g, 60, -230, 44, '#fbf7ef', 4); O(g, 60, -262, 46, 16, '#2e2420', 3); C(g, 82, -236, 5, OL, 0); C(g, -60, -230, 44, '#fbf7ef', 4); O(g, -60, -265, 46, 18, '#cfcac0', 3); } });
  },
  capitol(g, t, d, p) {
    K.sky(g, 'day', t); K.ground(g, '#c9b28a', 900);
    g.save(); g.translate(W / 2, 900); R(g, -700, -360, 1400, 360, '#f6f2e8', 5); for (let i = 0; i < 12; i++) R(g, -660 + i * 116, -340, 30, 340, '#efe9dc', 3); R(g, -200, -560, 400, 200, '#f6f2e8', 5); O(g, 0, -560, 220, 160, '#f6f2e8', 5); C(g, 0, -730, 30, '#f6f2e8', 4); g.restore();
    if (p.inside) { K.room(g, 'office', { wall: '#d9c08a' }); K.flagPole(g, 520, GY, 1, t); K.flagPole(g, 1400, GY, 1, t); R(g, W / 2 - 140, GY - 300, 280, 300, '#7a4a2a'); fdr(g, t, W / 2 - 20, GY - 180, { chair: false, f: 1, expr: 'determined', talk: Math.abs(Math.sin(t * 9)) * 0.6, s: 1.3 }); R(g, W / 2 - 160, GY - 330, 320, 60, '#8e5a34', 4, 6); }
    if (p.quote) K.infoCard(g, t, ['«UNA FECHA QUE', 'VIVIRÁ EN LA INFAMIA»'], p.quote, 200);
  },
  tunnel(g, t, d, p) {
    K.sky(g, 'day', t); g.fillStyle = '#8a6a4a'; g.fillRect(-W, 560, W * 3, H); L(g, [[-W, 560], [W * 2, 560]], 5); g.fillStyle = '#8ab060'; g.fillRect(-W, 540, W * 3, 22);
    K.whiteHouse(g, 480, 560, 0.55); g.save(); g.translate(1450, 560); R(g, -300, -260, 600, 260, '#d9d2c2', 5); for (let i = 0; i < 9; i++) R(g, -270 + i * 66, -240, 22, 240, '#c9c2b2', 3); g.restore();
    T(g, 'CASA BLANCA', 480, 300, 46); T(g, 'TESORO', 1450, 250, 46);
    const pr = clamp((t - 0.6) / 2.2); R(g, 480, 780, lerp(0, 970, pr), 70, '#3a2a20', 4, 30); K.arrow(g, 520, 815, 1400, 815, pr, '#f2c21a', 7);
    L(g, [[480, 560], [480, 790]], 30, '#3a2a20'); if (pr > 0.98) { L(g, [[1450, 560], [1450, 790]], 30, '#3a2a20'); R(g, 1330, 860, 240, 160, '#5a6270', 5, 10); C(g, 1450, 940, 40, '#9aa2ac', 4); K.label(g, t, 'REFUGIO', 1450, 1050, 3.0, 40); }
  },
  bunker(g, t, d, p) {
    K.sky(g, 'day', t); g.fillStyle = '#8a6a4a'; g.fillRect(-W, 600, W * 3, H); L(g, [[-W, 600], [W * 2, 600]], 5);
    const b = ease.out(clamp(t / 1.5)); g.save(); g.translate(W / 2, 600); R(g, -420, -260 * b, 840, 260 * b, '#f6f2e8', 5); g.restore(); K.label(g, t, 'ALA ESTE', W / 2, 260, 0.5, 60);
    const k = clamp((t - (p.down ?? 2)) / 1.2); if (k > 0) { g.globalAlpha = k; R(g, W / 2 - 260, 720, 520, 260, '#5a6270', 6, 14); R(g, W / 2 - 200, 760, 140, 180, '#3a4250', 4, 6); C(g, W / 2 + 120, 850, 60, '#9aa2ac', 5); g.globalAlpha = 1; K.label(g, t, 'BÚNKER SECRETO', W / 2, 1040, p.down ?? 2, 50, '#f2c21a'); }
  },
  kitchen(g, t, d, p) { K.room(g, 'kitchen'); guy(g, t, { top: 'jacket', color: '#f2efe6', legs: '#e6e0d4', hair: 'none', hat: 'beanie', hatColor: '#f2efe6' }, 1300, GY, { f: -1, pose: 'holdFront', expr: 'nervous', s: 1.4 }); guy(g, t, K.TOMI, 700, GY, { pose: 'crossArms', expr: 'determined', s: 1.5 }); },
  office(g, t, d, p) {
    K.room(g, 'office', { night: p.night }); K.desk(g, 1260, GY);
    const act = p.act || 'secret';
    fdr(g, t, 900, GY + 30, { f: 1, of: p.tired ? K.FDR_TIRED : K.FDR, expr: ex(t, p, act === 'joke' ? 'happy' : 'smile'), talk: p.talk ? Math.abs(Math.sin(t * 10)) * 0.7 : 0 });
    guy(g, t, K.TOMI, 520, GY + 30, { f: 1, pose: act === 'joke' ? 'relaxed' : 'stand', expr: ex(t, { ex: p.tex }, act === 'joke' ? 'happy' : 'neutral'), s: 1.45 });
    if (p.fala) fala(g, t, 1250, GY + 40, 1.1, -1, { sleep: p.fala === 'sleep' });
  },
  press(g, t, d, p) {
    K.room(g, 'office', { wall: '#d9c08a' }); fdr(g, t, 1350, GY + 20, { f: -1, expr: 'smile' });
    for (let i = 0; i < 3; i++) { guy(g, t, K.PRESS(['#7a5a3a', '#4a5a6a', '#5a4a6a'][i]), 260 + i * 180, GY + 20 + i * 10, { f: 1, pose: 'holdFront', expr: 'smirk', s: 1.3, seed: i }); K.pressCam(g, 330 + i * 180, GY - 170 + i * 10, 1, (t > (p.flash ?? 99) + i * 0.1 && t < (p.flash ?? 99) + 0.3 + i * 0.1) ? 1 - (t - (p.flash ?? 99) - i * 0.1) / 0.3 : 0); }
    const bx = lerp(1700, 1000, ease.out(clamp((t - (p.block ?? 1)) / 0.5))); guy(g, t, K.TOMI, bx, GY + 30, { f: -1, pose: t > (p.block ?? 1) ? 'cheer' : 'stand', expr: 'determined', s: 1.5 });
  },
  carExit(g, t, d, p) { K.sky(g, 'day', t); K.whiteHouse(g, W / 2, 820, 0.8); K.ground(g, '#c9b28a', 820); K.car(g, 700, 1000, 1.2, 1); guy(g, t, K.TOMI, 1220, 1010, { f: -1, pose: posesAt(t, [[0, 'stand'], [0.8, 'reach']]), expr: 'determined', s: 1.4 }); fdr(g, t, 1000, 1010, { f: 1, expr: 'smile', s: 1.3 }); },
  braces(g, t, d, p) {
    K.room(g, 'hall'); const x = 860 + t * 40;
    guy(g, t, K.FDR, x, GY + 20, { f: 1, pose: walkPose(t * 2 * Math.PI * 0.35, { stride: 10 }), still: true, expr: 'determined', s: 1.5 });
    g.strokeStyle = '#c9ccd2'; g.lineWidth = 5; for (const dx of [-14, 14]) { g.beginPath(); g.moveTo(x + dx, GY - 100); g.lineTo(x + dx, GY + 10); g.stroke(); }
    guy(g, t, K.TOMI, x - 120, GY + 30, { f: 1, pose: { ...POSES.reach, hF: [60, -150], eF: [40, -140] }, expr: 'determined', s: 1.45 });
    if (p.lbl) K.label(g, t, 'APARATOS DE ACERO', x + 260, GY - 120, p.lbl, 44, '#f2c21a');
  },
  stage(g, t, d, p) { K.sky(g, 'day', t); K.flagPole(g, 300, 760, 1, t); R(g, 500, 640, 900, 140, '#8a5a34', 5); for (let i = 0; i < 6; i++) R(g, 420 + i * 30, 640 + i * 23, 80, 23, '#7a4a2a', 3); fdr(g, t, 900, 640, { chair: false, expr: 'smile', s: 1.2 }); guy(g, t, K.TOMI, 720, 640, { pose: 'reach', expr: 'determined', s: 1.2 }); K.crowd(g, t, 920, 20, { rows: 2 }); },
  doorShadow(g, t, d, p) { K.room(g, 'hall'); R(g, 720, GY - 640, 480, 640, '#8a5a34', 6, 8); C(g, 1130, GY - 320, 18, '#f2c21a', 4); g.fillStyle = 'rgba(255,240,200,.9)'; g.fillRect(720, GY - 14, 480, 14); const sx = lerp(760, 1050, (Math.sin(t * 1.5) + 1) / 2); g.fillStyle = '#1c1a20'; g.beginPath(); g.ellipse(sx, GY - 6, 50, 8, 0, 0, 7); g.fill(); P(g, [[sx - 20, GY - 14], [sx - 10, GY - 40], [sx, GY - 14]], '#1c1a20', 0); P(g, [[sx + 6, GY - 14], [sx + 16, GY - 40], [sx + 24, GY - 14]], '#1c1a20', 0); },
  falaIntro(g, t, d, p) {
    K.room(g, 'office'); fala(g, t, W / 2 - 300, GY + 30, 2.6, 1);
    if (p.file) { const s = K.pop(t, p.file, 0.4); if (s > 0) { g.save(); g.translate(1350, 470); g.scale(s, s); g.rotate(0.04); R(g, -360, -300, 720, 600, '#e9d9a8', 6, 10); T(g, 'EXPEDIENTE', 0, -230, 54, '#c0392b', { stroke: 0 }); T(g, 'NOMBRE: FALA', 0, -100, 46, OL, { stroke: 0 }); T(g, 'NOMBRE EN CLAVE:', 0, 20, 40, OL, { stroke: 0 }); T(g, '«EL INFORMANTE»', 0, 110, 58, '#c0392b', { stroke: 0 }); g.restore(); } }
  },
  falaMontage(g, t, d, p) {
    const panel = (x, kind) => { g.save(); g.beginPath(); g.roundRect(x - 280, 240, 560, 600, 20); g.clip(); K.sky(g, 'day', t);
      if (kind === 'car') { K.car(g, x, 760, 0.9, 1); fala(g, t, x + 40, 620, 0.9, 1); }
      if (kind === 'train') { K.train(g, x - 200, 800, 0.8, t, { cars: 1 }); fala(g, t, x + 120, 700, 0.9, 1); }
      if (kind === 'plane') { K.plane(g, x, 600, 0.7, t); fala(g, t, x - 40, 600, 0.6, 1); }
      g.restore(); R(g, x - 280, 240, 560, 600, null, 7, 20); };
    g.fillStyle = '#efe0bf'; g.fillRect(-W, -H, W * 3, H * 3);
    const n = p.n ?? 3; ['car', 'train', 'plane'].slice(0, n).forEach((k, i) => { if (t > i * (p.step ?? 0.8)) panel(360 + i * 600, k); });
  },
  station(g, t, d, p) {
    K.sky(g, 'day', t); K.ground(g, '#c9b28a', 760); R(g, -W, 760, W * 3, 60, '#8a7a6a', 4);
    K.train(g, 100, 760, 1, t, { cars: 3 }); K.crowd(g, t, 950, 16, { rows: 1, seed: 8 });
    const fx = lerp(700, 1100, ease.out(clamp((t - 0.5) / 1.2))); fala(g, t, fx, 860 - Math.max(0, Math.sin(clamp((t - 0.5) / 1.2) * Math.PI)) * 80, 1.4, 1, { run: t > 0.5 && t < 1.7 });
    if (t > 1.8) K.label(g, t, '¡EL PRESIDENTE ESTÁ AQUÍ!', W / 2, 200, 1.8, 60, '#f2c21a');
  },
  newspaper(g, t, d, p) {
    g.fillStyle = '#5a4a3a'; g.fillRect(-W, -H, W * 3, H * 3); g.save(); g.translate(W / 2, H / 2); g.rotate(-0.06 + 0.04 * Math.sin(t)); g.scale(1 + 0.02 * t, 1 + 0.02 * t);
    R(g, -520, -420, 1040, 840, '#f2ecdc', 6, 6); T(g, 'THE DAILY NEWS', 0, -350, 70, OL, { stroke: 0 }); L(g, [[-480, -300], [480, -300]], 4);
    T(g, '¡FALA, EL PERRO MÁS FAMOSO!', 0, -240, 52, OL, { stroke: 0 }); R(g, -460, -190, 520, 420, '#d8d0bc', 4); g.save(); g.beginPath(); g.rect(-460, -190, 520, 420); g.clip(); fala(g, t, -200, 200, 2.2, 1); g.restore();
    for (let i = 0; i < 9; i++) L(g, [[100, -170 + i * 45], [460, -170 + i * 45]], 6, '#a89a80'); g.restore();
  },
  falaChase(g, t, d, p) {
    K.room(g, 'hall'); const run = t > (p.run ?? 99);
    for (let i = 0; i < 2; i++) { guy(g, t, K.PRESS(['#7a5a3a', '#4a5a6a'][i]), 1500 + i * 180, GY + 20, { f: -1, pose: 'holdFront', expr: run ? 'happy' : 'neutral', s: 1.3, seed: i }); K.pressCam(g, 1430 + i * 180, GY - 170, 1, run && t > (p.run + 1.2) && t < p.run + 1.5 ? 1 : 0); }
    if (!run) { guy(g, t, K.TOMI, 760, GY, { pose: p.hide ? 'holdFront' : 'crossArms', expr: 'nervous', s: 1.5 }); if (p.hide) { const pk = Math.sin(t * 4) > 0.6; fala(g, t, 800, GY - 140, 0.8, 1, {}); if (!pk) R(g, 720, GY - 240, 150, 120, '#3c3f4a', 4, 20); } else fala(g, t, 900, GY + 20, 1.2, 1); }
    else { guy(g, t, K.TOMI, 760, GY, { pose: 'reach', expr: 'shocked', s: 1.5 }); fala(g, t, lerp(900, 1380, clamp((t - p.run) / 1.2)), GY + 20, 1.2, 1, { run: true }); }
  },
  comment(g, t, d, p) {
    g.fillStyle = '#efe0bf'; g.fillRect(-W, -H, W * 3, H * 3); fala(g, t, 380, 900, 2.2, 1);
    const s = K.pop(t, 0.2, 0.4); g.save(); g.translate(1150, 420); g.scale(s, s); R(g, -560, -220, 1120, 440, '#ffffff', 7, 40); P(g, [[-300, 200], [-420, 330], [-200, 210]], '#ffffff', 7);
    T(g, '¿CÓMO HABRÍAS', 0, -90, 76, OL, { stroke: 0 }); T(g, 'ESCONDIDO A FALA?', 0, 10, 76, '#c0392b', { stroke: 0 }); T(g, '💬 COMENTA', 0, 130, 50, '#3f8fb0', { stroke: 0 }); g.restore();
  },
  churchillShip(g, t, d, p) { K.sky(g, 'storm', t); K.ocean(g, t, 620); K.ship(g, lerp(-300, W / 2, ease.out(clamp(t / 3))), 680, 0.7, 1); g.save(); g.fillStyle = '#1c1a20'; g.translate(lerp(-300, W / 2, ease.out(clamp(t / 3))) + 120, 520); g.scale(0.7, 0.7); R(g, -40, -20, 80, 120, '#1c1a20', 0); C(g, 0, -50, 40, '#1c1a20', 0); O(g, 0, -86, 50, 10, '#1c1a20', 0); O(g, 0, -100, 30, 22, '#1c1a20', 0); L(g, [[30, -40], [80, -50]], 8, '#1c1a20'); C(g, 82, -50, 5, '#ff9a4a', 0); g.restore(); },
  balcony(g, t, d, p) {
    K.sky(g, 'night', t); K.whiteHouse(g, W / 2 + 200, 760, 0.9, true); K.ground(g, '#2e4a3a', 760); K.xmasTree(g, 380, 860, 1.4, t);
    g.save(); g.translate(W / 2 + 200, 760); g.scale(0.9, 0.9); R(g, -200, -330, 400, 26, '#c8ccd8', 4); g.restore();
    guy(g, t, K.CHURCHILL_BARE, W / 2 + 140, 470, { f: 1, s: 0.45, big: 1, pose: 'wave', expr: 'happy' }); guy(g, t, K.FDR, W / 2 + 260, 470, { f: -1, s: 0.45, big: 1, pose: 'talk', expr: 'smile' });
    K.crowd(g, t, 900, 24, { rows: 2, seed: 4 });
    if (p.tomi) guy(g, t, K.TOMI, 1500, H + 160, { s: 2.2, f: -1, pose: t > (p.glint ?? 99) + 0.6 ? 'ready' : 'stand', expr: ex(t, p, 'nervous') });
    if (p.glint != null && t > p.glint && t < p.glint + 0.8) { const k = (t - p.glint) / 0.8; g.save(); g.translate(900, 880); g.rotate(k * 2); g.fillStyle = `rgba(255,255,220,${1 - k})`; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(10, 80); g.lineTo(-10, 80); g.fill(); } g.restore(); }
    if (p.trumpet != null && t > p.trumpet) { const s = K.pop(t, p.trumpet, 0.3); g.save(); g.translate(900, 860); g.scale(s, s); L(g, [[-120, 0], [60, 0]], 14, '#f2c21a'); P(g, [[60, -10], [140, -50], [140, 50], [60, 10]], '#f2c21a', 4); g.restore(); K.label(g, t, '¡UNA TROMPETA!', 900, 700, p.trumpet + 0.2, 56, '#f2c21a'); }
  },
  subscribeMid(g, t, d, p) {
    K.room(g, 'hall'); guy(g, t, K.TOMI, 600, GY + 60, { s: 2, f: 1, pose: posesAt(t, [[0, 'stand'], [0.6, 'holdFront']]), expr: 'happy' });
    const s = K.pop(t, 0.8, 0.4); if (s > 0) { g.save(); g.translate(930, 620); g.scale(s, s); P(g, [[0, -90], [70, -40], [60, 60], [0, 100], [-60, 60], [-70, -40]], '#f2c21a', 6); T(g, '★', 0, 0, 70, OL, { stroke: 0 }); g.restore(); }
    K.T(g, 'YA ERES PARTE DEL EQUIPO', 1300, 250, 60); K.subscribeBtn(g, t, 1350, 560, 1.4, p.press ?? 3.2, 1.3);
  },
  yacht(g, t, d, p) {
    K.sky(g, 'day', t); K.ocean(g, t, 560); g.save(); g.translate(W / 2, 640); P(g, [[-300, -40], [320, -40], [260, 40], [-260, 40]], '#f2efe6', 5); R(g, -160, -130, 300, 90, '#e6e0d4', 5, 10); for (let i = 0; i < 5; i++) C(g, -120 + i * 60, -86, 14, '#9fc6d8', 3); T(g, 'POTOMAC', 0, 4, 40, OL, { stroke: 0 }); g.restore();
    const pk = lerp(W + 100, 1500, clamp(t / 2)); L(g, [[pk, 700], [pk, 560]], 10); L(g, [[pk, 560], [pk + 40, 560]], 10);
    if (p.x != null && t > p.x) { const k = ease.out(clamp((t - p.x) / 0.3)); L(g, [[W / 2 - 360 * k, 420], [W / 2 + 360 * k, 800]], 30, '#c0392b'); L(g, [[W / 2 + 360 * k, 420], [W / 2 - 360 * k, 800]], 30, '#c0392b'); }
  },
  cabin(g, t, d, p) {
    K.sky(g, 'day', t); K.ground(g, '#5a8a4a', 820); for (let i = 0; i < 9; i++) K.pine(g, i * 240 - 40, 830, 1 + (i % 3) * 0.2);
    g.save(); g.translate(W / 2, 880); R(g, -360, -300, 720, 300, '#8a5a34', 5); P(g, [[-410, -300], [0, -470], [410, -300]], '#5a3a24', 5); R(g, -60, -170, 120, 170, '#5a3a24', 4); R(g, -280, -220, 140, 100, '#ffd27a', 4); R(g, 140, -220, 140, 100, '#ffd27a', 4); g.restore();
    if (p.sign) { const s = K.pop(t, p.sign, 0.4); g.save(); g.translate(W / 2, 180); g.scale(s, s); R(g, -380, -70, 760, 140, '#e9d9a8', 6, 10); T(g, 'SHANGRI-LA', 0, 4, 80, '#5a3a24', { stroke: 0 }); g.restore(); }
    if (p.cd) K.label(g, t, 'HOY: CAMP DAVID', W / 2, 330, p.cd, 60, '#f2c21a');
    if (p.hammock) { L(g, [[220, 640], [460, 760], [700, 640]], 6); guy(g, t, K.TOMI, 520, 770, { s: 0.9, big: 1, rot: -Math.PI / 2, pose: 'lie', expr: 'sleepy', still: true, shadow: false }); for (let i = 0; i < 3; i++) K.label(g, t, 'z', 600 + i * 40, 560 - i * 50 - (t * 15) % 20, i * 0.3, 44 + i * 10); }
  },
  coffee(g, t, d, p) {
    K.room(g, 'office'); guy(g, t, K.REILLY, 900, GY + 40, { f: 1, pose: t < (p.drop ?? 1) ? 'phone' : 'handsOnHead', expr: t < (p.drop ?? 1) ? 'neutral' : 'shocked', s: 1.6 });
    const dt = t - (p.drop ?? 1); const cy = dt < 0 ? GY - 300 : GY - 300 + Math.min(300, 300 * (dt / 1.6) ** 2); const cx = 970 + (dt > 0 ? dt * 60 : 0);
    g.save(); g.translate(cx, cy); g.rotate(dt > 0 ? dt * 2 : 0); R(g, -26, -36, 52, 66, '#f2efe6', 4, 8); g.restore(); if (dt > 0) for (let i = 0; i < 5; i++) C(g, cx + 30 + i * 12, cy - 30 - i * 10 * dt, 8, '#6a4a2a', 2);
  },
  planeSky(g, t, d, p) { K.sky(g, 'day', t); K.ocean(g, t, 820); K.plane(g, lerp(500, 1300, t / d), 460 + Math.sin(t) * 10, 1.1, t); if (p.lbl) K.label(g, t, 'DIXIE CLIPPER', W / 2, 760, p.lbl, 60); },
  planeIn(g, t, d, p) {
    K.room(g, 'plane', { t }); fdr(g, t, 1300, GY + 40, { f: -1, chair: false, expr: p.sleep ? 'sleepy' : 'smile', s: 1.4 }); if (p.sleep) for (let i = 0; i < 3; i++) K.label(g, t, 'z', 1300 + i * 40, 520 - i * 50 - (t * 15) % 20, i * 0.3, 44 + i * 10);
    guy(g, t, K.TOMI, 680, GY + 40, { f: -1, pose: 'stand', expr: ex(t, p, 'nervous'), s: 1.45 }); if (p.sweat) O(g, 640, 520 + (t * 40) % 50, 10, 16, '#9fd8ff', 3);
    if (p.cake) { const s = K.pop(t, p.cake, 0.4); g.save(); g.translate(1000, GY - 120); g.scale(s, s); R(g, -110, -80, 220, 100, '#f2d0d8', 5, 14); R(g, -110, -80, 220, 26, '#fff8e8', 4, 10); T(g, '61', 0, -130, 70, '#c0392b'); g.restore(); }
  },
  casablanca(g, t, d, p) {
    K.sky(g, 'golden', t); K.ground(g, '#e0c08a', 820); for (const x of [200, 1700]) { R(g, x - 14, 420, 28, 400, '#8a6a3a'); for (let i = 0; i < 6; i++) { g.save(); g.translate(x, 420); g.rotate(i); O(g, 70, 0, 80, 18, '#4f8a4a', 4); g.restore(); } }
    fdr(g, t, 800, 900, { f: 1, chair: false, expr: 'happy', s: 1.3 }); R(g, 720, 760, 160, 140, '#c9a874', 4); guy(g, t, K.CHURCHILL_BARE, 1120, 900, { f: -1, pose: 'sit', expr: 'happy', s: 1.3 });
    if (p.card) K.infoCard(g, t, ['RENDICIÓN', 'INCONDICIONAL'], p.card, 230);
  },
  fleet(g, t, d, p) { K.sky(g, 'day', t); K.ocean(g, t, 560); K.ship(g, W / 2 - 100 + t * 10, 680, 0.8, 1, { flag: true }); K.destroyer(g, 1650 + t * 10, 620, 0.5, -1); K.destroyer(g, 200 + t * 10, 610, 0.45, 1); if (p.lbl) { K.label(g, t, 'IOWA', W / 2 - 100, 860, p.lbl, 56); } if (p.porter) { K.label(g, t, 'WILLIAM D. PORTER', 1500, 460, p.porter, 52, '#f2c21a'); K.arrow(g, 1580, 500, 1650, 560, clamp((t - p.porter) / 0.4)); } },
  deckDrill(g, t, d, p) { K.deck(g, t, { turret: true }); for (let i = 0; i < 6; i++) { const at = 0.4 + i * 0.6, k = clamp((t - at) / 0.5); if (k > 0) { C(g, 300 + i * 260, 200 + (i % 2) * 100, 30 + 50 * k, `rgba(80,80,80,${0.8 * (1 - k * 0.6)})`, 0); } C(g, 300 + i * 260, 200 + (i % 2) * 100 - 60, t < at ? 28 : 0, ['#ff6a5a', '#f2c21a', '#9fd8ff'][i % 3], 3); } fdr(g, t, 800, GY + 40, { f: 1, expr: 'happy', s: 1.35 }); guy(g, t, K.TOMI, 500, GY + 40, { pose: 'crossArms', expr: 'neutral', s: 1.4 }); },
  topDown(g, t, d, p) {
    g.fillStyle = '#3f7fa8'; g.fillRect(-W, -H, W * 3, H * 3); const turn = ease.inOut(clamp((t - (p.turn ?? 1.5)) / 1.5)) * 0.6;
    g.save(); g.translate(W / 2 + 200, H / 2); g.rotate(-turn); P(g, [[-380, -60], [300, -60], [420, 0], [300, 60], [-380, 60]], '#8a929e', 5); C(g, -200, 0, 34, '#7a828e', 4); C(g, 160, 0, 34, '#7a828e', 4); R(g, -60, -36, 120, 72, '#9aa2ac', 4); g.restore(); T(g, 'IOWA', W / 2 + 200, H / 2 + 140, 50);
    g.save(); g.translate(260, 180); g.scale(0.5, 0.5); P(g, [[-200, -40], [180, -40], [240, 0], [180, 40], [-200, 40]], '#7a828e', 5); g.restore(); T(g, 'PORTER', 260, 110, 40, '#f2c21a');
    const k = clamp((t - 0.3) / (p.tdur || 3.5)); K.arrow(g, 360, 220, lerp(360, 980, k), lerp(220, 840, k), 1, '#ffffff', 10);
  },
  boom(g, t, d, p) { K.sky(g, 'day', t); K.ocean(g, t, 600); K.ship(g, W / 2 + 200, 720, 0.9, 1, { flag: true }); K.splashFx(g, t - (p.at ?? 0.3), 420, 720, 1.2); },
  bunk(g, t, d, p) { K.room(g, 'bunk'); R(g, 300, 560, 1300, 60, '#5a626e', 5); R(g, 300, 520, 1300, 50, '#e8e2d0', 4, 20); toonBigFace(g, 760, 470, 70, { outfit: K.TOMI_CASUAL, expr: ex(t, p, 'thinking'), blink: K.blinkAt(t, 3), t }); R(g, 820, 500, 700, 70, '#6a7a5a', 4, 20); g.fillStyle = 'rgba(20,24,60,.35)'; g.fillRect(-W, -H, W * 3, H * 3); },
  tehranExt(g, t, d, p) { K.sky(g, 'golden', t); K.ground(g, '#d9b87a', 840); g.save(); g.translate(W / 2, 840); R(g, -500, -300, 1000, 300, '#e6d2a8', 5); for (const x of [-300, 0, 300]) { O(g, x, -300, 110, 120, '#3f8fb0', 5); C(g, x, -430, 10, '#f2c21a', 3); } for (let i = 0; i < 7; i++) R(g, -440 + i * 130, -200, 70, 140, '#8a5a34', 4, 35); g.restore(); K.tree(g, 200, 880, 1, '#6a8a4a'); K.tree(g, 1720, 880, 1, '#6a8a4a'); },
  table(g, t, d, p) {
    K.room(g, 'embassy'); fdr(g, t, 620, GY + 20, { f: 1, chair: false, expr: ex(t, p, 'neutral'), s: 1.3 }); guy(g, t, K.CHURCHILL_BARE, 960, GY - 20, { f: 1, pose: 'sit', expr: 'smirk', s: 1.2 }); guy(g, t, K.STALIN, 1300, GY + 20, { f: -1, pose: 'sit', expr: 'smirk', s: 1.3 });
    O(g, W / 2 + 10, GY - 60, 520, 70, '#f2efe6', 5); R(g, W / 2 - 480, GY - 60, 980, 120, '#f2efe6', 0); L(g, [[W / 2 - 510, GY - 60], [W / 2 - 480, GY + 60]], 4); L(g, [[W / 2 + 530, GY - 60], [W / 2 + 500, GY + 60]], 4);
    if (p.warn) K.infoCard(g, t, ['⚠ AGENTES NAZIS', 'EN LA CIUDAD'], p.warn, 200, '#fff0d8');
  },
  waiters(g, t, d, p) {
    K.room(g, 'embassy'); for (let i = 0; i < 3; i++) guy(g, t, K.WAITER, 560 + i * 400, GY + 30, { f: i === 2 ? -1 : 1, pose: 'crossArms', expr: 'angry', look: [Math.sin(t * 1.5 + i) * 0.8, 0], s: 1.5, seed: i * 2 });
    if (p.mic) K.lamp(g, 1700, GY - 40, 1.3, true);
    if (p.lbl) K.label(g, t, p.lbl, W / 2, 160, p.lblAt || 0, 56, '#f2c21a');
  },
  garden(g, t, d, p) { K.sky(g, 'night', t); K.ground(g, '#2e4a3a', 820); K.tree(g, 300, 840, 1.3, '#2e4a3a'); K.tree(g, 1650, 840, 1.2, '#2e4a3a'); fdr(g, t, 1050, 940, { f: -1, expr: 'neutral', s: 1.3 }); guy(g, t, K.TOMI, 820, 950, { f: 1, pose: { ...POSES.think, hF: [36, -186] }, expr: 'smirk', s: 1.4 }); K.label(g, t, 'shhh…', 820, 520, 0.6, 56); },
  tired(g, t, d, p) {
    K.room(g, 'office', { night: true }); K.desk(g, 1100, GY, 1.1); for (let i = 0; i < 4; i++) R(g, 980 + i * 16, GY - 210 - i * 10, 180, 30, '#f2efe6', 3, 3);
    fdr(g, t, 900, GY + 30, { f: 1, of: K.FDR_TIRED, expr: p.sleep && t > 1.5 ? 'sleepy' : ex(t, p, 'sad'), s: 1.35, poseOverride: { head: [16, -170] } });
    if (p.shake) g.translate(Math.sin(t * 40) * 1.5, 0);
    guy(g, t, K.TOMI, 420, GY + 30, { f: 1, pose: 'stand', expr: 'worried', s: 1.45 }); g.fillStyle = 'rgba(30,40,80,.18)'; g.fillRect(-W, -H, W * 3, H * 3);
    if (p.ballot) { const s = K.pop(t, p.ballot, 0.4); g.save(); g.translate(W / 2 + 300, 330); g.scale(s, s); R(g, -230, -180, 460, 360, '#f2efe6', 6, 10); T(g, '4', 0, -30, 200, '#c0392b', { stroke: 0 }); T(g, 'ELECCIONES', 0, 120, 50, OL, { stroke: 0 }); g.restore(); }
  },
  yaltaPhoto(g, t, d, p) {
    g.fillStyle = '#4a3a2a'; g.fillRect(-W, -H, W * 3, H * 3); g.save(); g.translate(W / 2, H / 2); g.rotate(-0.02); g.scale(1 + t * 0.01, 1 + t * 0.01);
    R(g, -760, -420, 1520, 840, '#f2ecdc', 6, 6); g.save(); g.beginPath(); g.rect(-720, -380, 1440, 760); g.clip(); g.translate(-W / 2, -H / 2 + 60);
    K.sky(g, 'sepia', t); K.ground(g, '#b89a6a', 860); guy(g, t, K.CHURCHILL, 560, 920, { f: 1, pose: 'sit', expr: 'neutral', s: 1.3 }); fdr(g, t, 960, 920, { f: 1, chair: false, of: K.FDR_TIRED, expr: 'sad', s: 1.3 }); guy(g, t, K.STALIN, 1360, 920, { f: -1, pose: 'sit', expr: 'neutral', s: 1.3 });
    g.fillStyle = 'rgba(140,110,70,.35)'; g.fillRect(0, 0, W, H); g.restore(); g.restore(); K.label(g, t, 'YALTA · 1945', W / 2, 1010, 0.4, 48);
  },
  warmHouse(g, t, d, p) { K.sky(g, 'day', t); K.ground(g, '#8ab060', 820); for (let i = 0; i < 8; i++) K.pine(g, i * 270 - 60, 830, 1.1); g.save(); g.translate(W / 2 + 120, 880); R(g, -340, -260, 680, 260, '#f6f2e8', 5); P(g, [[-380, -260], [0, -400], [380, -260]], '#7a8a9a', 5); for (let i = 0; i < 4; i++) R(g, -300 + i * 160, -180, 80, 100, '#9fc6d8', 4); g.restore(); if (p.tomi) guy(g, t, K.TOMI, 420, 1000, { f: 1, pose: 'crossArms', expr: ex(t, p, 'neutral'), s: 1.4 }); if (p.lbl) K.infoCard(g, t, ['«PEQUEÑA CASA BLANCA»'], p.lbl, 170); },
  painter(g, t, d, p) {
    K.room(g, 'hall', { wall: '#f2e6c8' }); R(g, 700, GY - 300, 230, 300, '#8a6a4a', 5, 10);
    fdr(g, t, 820, GY, { f: 1, chair: false, expr: ex(t, p, 'smile'), s: 1.35 });
    g.save(); g.translate(1350, GY); L(g, [[-80, 0], [0, -460]], 8, '#8a6a3a'); L(g, [[80, 0], [0, -460]], 8, '#8a6a3a'); R(g, -130, -420, 260, 220, '#fff8e8', 5); C(g, 0, -330, 40, '#fbf7ef', 3); g.restore();
    guy(g, t, K.PAINTER, 1600, GY, { f: -1, pose: 'point', expr: 'smile', s: 1.35 }); fala(g, t, 500, GY + 30, 1.1, 1, { sleep: true });
  },
  silence(g, t, d, p) { g.fillStyle = '#f6f0e2'; g.fillRect(-W, -H, W * 3, H * 3); if (p.steps) { for (let i = 0; i < 6; i++) { const at = 0.3 + i * 0.25; if (t > at) { const x = 400 + i * 220; O(g, x, 700 + (i % 2) * 60, 40, 20, alpha(OL, 0.8 * clamp(1 - (t - at) / 1.5)), 0); } } } },
  truman(g, t, d, p) { K.room(g, 'office', { night: true }); K.flagPole(g, 300, GY, 1, t); guy(g, t, K.TRUMAN, 960, GY + 30, { f: 1, pose: 'wave', expr: 'sad', s: 1.5 }); guy(g, t, K.AGENT, 1280, GY + 30, { f: -1, pose: 'holdFront', expr: 'sad', s: 1.45 }); R(g, 1170, GY - 200, 90, 110, '#3a2a20', 4, 6); guy(g, t, K.TOMI, 620, GY + 30, { f: 1, pose: 'stand', expr: 'sad', s: 1.45 }); },
  funeralTrain(g, t, d, p) { K.sky(g, 'night', t); K.ground(g, '#2e3a3a', 760); R(g, -W, 760, W * 3, 30, '#4a4a50', 4); K.train(g, lerp(1800, -1500, t / d), 760, 1, t, { night: true, cars: 5, flag: true }); K.crowd(g, t, 960, 18, { rows: 2, seed: 12 }); g.fillStyle = 'rgba(20,24,60,.25)'; g.fillRect(-W, -H, W * 3, H * 3); },
  casket(g, t, d, p) { K.room(g, 'office', { wall: '#d8cfc0' }); R(g, 600, GY - 260, 720, 160, '#6a4a2a', 5, 10); R(g, 600, GY - 280, 720, 60, '#f2efe6', 4, 8); for (let i = 0; i < 3; i++) R(g, 600, GY - 280 + i * 20, 720, 10, '#c0392b', 0); R(g, 600, GY - 280, 260, 40, '#2a3a8a', 0); R(g, 640, GY - 100, 40, 100, '#5a3a24'); R(g, 1240, GY - 100, 40, 100, '#5a3a24'); fala(g, t, 1450, GY + 20, 1.5, -1); if (p.tomi) guy(g, t, K.TOMI, 380, GY + 20, { f: 1, pose: 'sad', expr: 'sad', s: 1.45 }); },
  grave(g, t, d, p) { K.sky(g, 'golden', t); K.ground(g, '#7a9a5a', 800); for (const x of [200, 1700]) K.tree(g, x, 820, 1.4, '#c9883a'); R(g, 760, 520, 400, 300, '#e6e0d4', 6, 20); T(g, 'F.D.R.', 960, 640, 70, OL, { stroke: 0 }); R(g, 1260, 740, 110, 70, '#d8d2c4', 4, 10); T(g, 'FALA', 1315, 778, 30, OL, { stroke: 0 }); if (p.lbl) K.label(g, t, 'HYDE PARK', W / 2, 200, p.lbl, 60); },
  end(g, t, d, p) {
    K.sky(g, 'golden', t); K.ground(g, '#8ab060', 860);
    toonBigFace(g, 420, 560, 210, { outfit: K.TOMI, expr: ex(t, p, 'smile'), blink: K.blinkAt(t, 3.2), t });
    const opts = ['EL TORPEDO', 'LOS ESPÍAS', 'LA MULTITUD']; if (p.q != null) { K.T(g, '¿QUÉ TE DARÍA MÁS MIEDO?', 1250, 190, 62, '#fff8e8'); opts.forEach((o, i) => { const s = K.pop(t, p.q + 0.3 + i * 0.4, 0.35); if (s <= 0) return; g.save(); g.translate(1250, 340 + i * 140); g.scale(s, s); R(g, -330, -55, 660, 110, '#fff8e8', 6, 30); K.T(g, `${i + 1}. ${o}`, 0, 3, 50, OL, { stroke: 0 }); g.restore(); }); }
    if (p.sub != null) K.subscribeBtn(g, t, 1250, 830, p.sub, p.press ?? 99, 1.2);
    if (p.cast != null && t > p.cast) { fala(g, t, 960, 1060, 0.9, 1); }
  },
};

// ---------- registration ----------
for (const shot of E.shots) {
  const p0 = shot.params || {}; if (!p0.scene) continue;
  registerShot(shot.id, { draw(g, t, info) {
    const p = info, d = info.dur, fn = S[p.scene];
    K.withCam(g, t, d, p.cam || {}, (g) => fn ? fn(g, t, d, p) : K.T(g, 'missing scene ' + p.scene, W / 2, H / 2, 60));
    if (p.date) K.dateStamp(g, t, p.date, p.dateDur || 3.4);
    if (p.real != null) K.realStamp(g, t, p.real);
    if (p.pill) K.pill(g, t, p.pill, 92, p.pillAt || 0);
    if (p.card && p.scene !== 'miami' && p.scene !== 'casablanca') K.infoCard(g, t, p.card, p.cardAt || 0.3, p.cardY || H / 2);
    if (p.fadeWhite) { g.fillStyle = `rgba(246,240,226,${clamp((t - p.fadeWhite) / 1.2)})`; g.fillRect(0, 0, W, H); }
  } });
}
