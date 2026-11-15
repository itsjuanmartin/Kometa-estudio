// ep02.js — scenes, cast and backgrounds for "Los Bastardos sin gloria reales".
import { ease, clamp, lerp, rng, shade, alpha } from '/engine/core.js';
import { POSES, posesAt, walkPose } from '/engine/rig2d.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from './lib.js';
import { S, CAST, BG } from './director.js';
const { W, H, GY, R, P, C, O, L, T, OL, guy } = K;

// ---------- cast ----------
export const TOMI_TEEN = { top: 'sweater', color: '#3f8fb0', legs: '#6a4a32', shoes: '#3a2a22', hair: 'side', hairColor: '#2e2420' };
export const TOMI_CMD = { top: 'uniform', color: '#6b6f4a', legs: '#5d6142', shoes: '#2a1f18', belt: '#4a3a24', hair: 'side', hairColor: '#2e2420', hat: 'beret', hatColor: '#2f6a3a' };
export const TOMI_ADULT = { top: 'shirt', color: '#3f8fb0', legs: '#5a5a62', shoes: '#2a1f18', hair: 'side', hairColor: '#6a6a6a', mustache: true, mustacheColor: '#6a6a6a' };
const MOM = { top: 'sweater', color: '#8a4a5a', legs: '#4a3a3a', hair: 'bun', hairColor: '#5a3a24' };
const DAD = { top: 'suit', color: '#3a3f4a', color2: '#7a2a2a', legs: '#3a3f4a', hair: 'side', hairColor: '#3a2a20', hat: 'fedora', hatColor: '#3a3a40', mustache: true };
const MOM_OLD = { ...MOM, color: '#8a8a8a', hairColor: '#cfcac0', skin: '#ece6dc' };
const DAD_OLD = { ...DAD, color: '#6a6a6a', hat: 'none', hairColor: '#cfcac0', mustacheColor: '#cfcac0', skin: '#ece6dc' };
const OFFICER = { top: 'uniform', color: '#8a7a50', legs: '#7a6a44', belt: '#5a3a24', hair: 'side', hairColor: '#8a5a2a', hat: 'cap', hatColor: '#7a6a44', mustache: true };
const BOBBY = { top: 'suit', color: '#1f2a44', color2: '#1f2a44', legs: '#1f2a44', hair: 'none', hat: 'helmet', hatColor: '#1f2a44' };
const LANDLADY = { top: 'sweater', color: '#7a5a8a', legs: '#5a4a6a', hair: 'bun', hairColor: '#bdb5aa', face: 'glasses' };
const GERMAN = { top: 'uniform', color: '#6a6e62', legs: '#4a4e44', belt: '#2a2a22', hair: 'none', hat: 'helmet', hatColor: '#5a5e52' };
const GESTAPO = { top: 'suit', color: '#1c1c22', color2: '#1c1c22', legs: '#1c1c22', hair: 'side', hairColor: '#2a2a2a', hat: 'fedora', hatColor: '#141418' };
const CHIEF = { top: 'uniform', color: '#8a7a5a', legs: '#5a4a3a', belt: '#2a1f18', hair: 'side', hairColor: '#3a2a20', hat: 'cap', hatColor: '#6a5a3a', wide: 1.25, mustache: true };
const US = { top: 'uniform', color: '#6b6f4a', legs: '#5d6142', belt: '#4a3a24', hair: 'none', hat: 'helmet', hatColor: '#5a6040' };
const MAYER = { top: 'uniform', color: '#6a6e62', legs: '#4a4e44', belt: '#2a2a22', hair: 'side', hairColor: '#5a3a24', hat: 'cap', hatColor: '#5a5e52' };
const WYNBERG = { top: 'jacket', color: '#5a6a7a', legs: '#3a3f4a', hair: 'curly', hairColor: '#3a2a20', face: 'glasses' };
const WEBER = { top: 'jacket', color: '#7a5a3a', legs: '#4a3a2a', hair: 'messy', hairColor: '#c9a060' };
const KID = (c, s) => ({ top: 'sweater', color: c, legs: '#4a3a3a', hair: s, hairColor: '#5a3a24', kid: true });
Object.assign(CAST, { tomiTeen: TOMI_TEEN, tomiCmd: TOMI_CMD, tomiAdult: TOMI_ADULT, mom: MOM, dad: DAD, officer: OFFICER, mayer: MAYER, gestapo: GESTAPO, chief: CHIEF, landlady: LANDLADY });

// ---------- helpers ----------
const night = (g, t) => K.sky(g, 'night', t);
function houses(g, t, y, o = {}) {   // european street facades
  const r = rng(o.seed || 3), cols = o.cols || ['#c9b28a', '#b8a07a', '#d9c4a0', '#a89070'];
  for (let i = 0; i < 9; i++) { const x = -200 + i * 270, h = 380 + r() * 220, c = cols[i % cols.length];
    R(g, x, y - h, 260, h, c, 4); P(g, [[x - 10, y - h], [x + 130, y - h - 90], [x + 270, y - h]], shade(c, -0.35), 4);
    for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) { const wx = x + 40 + j * 120, wy = y - h + 60 + k * 140; R(g, wx, wy, 70, 90, o.lit ? '#ffd27a' : '#9fc6d8', 3, 4); if (o.broken && (i + k + j) % 3 === 0) { P(g, [[wx, wy], [wx + 70, wy], [wx + 35, wy + 50]], '#1c1a24', 2); } if (o.curtain && (i + j) % 2 === 0) R(g, wx, wy, 70, 90, '#7a3a3a', 3, 4); }
    R(g, x + 100, y - 110, 60, 110, '#5a3a24', 3, 4); }
}
function fireGlow(g, t, x, y, s = 1) { for (let i = 0; i < 6; i++) { const k = (t * 0.9 + i / 6) % 1; C(g, x + Math.sin(i * 3 + t) * 30 * s, y - k * 260 * s, (50 + k * 60) * s, `rgba(60,50,50,${0.5 * (1 - k)})`, 0); } for (let i = 0; i < 5; i++) { const h = (90 + 40 * Math.sin(t * 7 + i)) * s; P(g, [[x - 60 * s + i * 30 * s, y], [x - 45 * s + i * 30 * s, y - h], [x - 30 * s + i * 30 * s, y]], i % 2 ? '#ffb030' : '#ff6a30', 0); } }
function shards(g, t, x, y) { const r = rng(5); for (let i = 0; i < 14; i++) P(g, [[x + r() * 300, y + r() * 30], [x + r() * 300 + 18, y + r() * 30 + 6], [x + r() * 300 + 6, y + r() * 30 + 16]], 'rgba(200,230,255,.85)', 2); }
function wire(g, y0, y1) { for (let x = -40; x < W + 80; x += 220) { R(g, x, y0, 14, y1 - y0, '#6a5a4a', 3); } for (let k = 0; k < 4; k++) { g.strokeStyle = '#4a4a4a'; g.lineWidth = 3; g.beginPath(); for (let x = -40; x < W + 80; x += 30) g.lineTo(x, y0 + 30 + k * (y1 - y0 - 40) / 3 + Math.sin(x / 15) * 4); g.stroke(); for (let x = 0; x < W; x += 60) { const yy = y0 + 30 + k * (y1 - y0 - 40) / 3; L(g, [[x - 8, yy - 8], [x + 8, yy + 8]], 3, '#4a4a4a'); L(g, [[x + 8, yy - 8], [x - 8, yy + 8]], 3, '#4a4a4a'); } } }
function hut(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); R(g, -260, -200, 520, 200, '#8a7a62', 4); P(g, [[-290, -200], [0, -300], [290, -200]], '#5a4a3a', 4); R(g, -40, -130, 80, 130, '#4a3a2a', 3); R(g, -200, -150, 80, 60, '#9fc6d8', 3); R(g, 120, -150, 80, 60, '#9fc6d8', 3); g.restore(); }
function cliffs(g, t) { K.sky(g, 'storm', t); K.ocean(g, t, 760); P(g, [[-100, 1100], [-100, 200], [300, 160], [520, 260], [700, 240], [760, 1100]], '#7a7a6a', 5); for (let i = 0; i < 6; i++) L(g, [[60 + i * 110, 260 + (i % 2) * 40], [80 + i * 110, 1100]], 3, 'rgba(43,33,28,.3)'); P(g, [[-100, 210], [300, 170], [520, 270], [700, 250], [700, 290], [-100, 260]], '#5a8a4a', 4); }
function townWales(g, t) { K.sky(g, 'storm', t); K.ground(g, '#5a8a4a', 860); houses(g, t, 880, { cols: ['#e6e0d4', '#d9d2c4', '#c9c2b2', '#bfb8a8'], seed: 9 }); }
function beach(g, t) { K.sky(g, 'storm', t); K.ocean(g, t, 560); g.fillStyle = '#d9c08a'; g.beginPath(); g.moveTo(-W, 760); for (let x = -W; x < W * 2; x += 40) g.lineTo(x, 760 + Math.sin(x / 200) * 12); g.lineTo(W * 2, H * 2); g.lineTo(-W, H * 2); g.fill(); L(g, [[-W, 760], [W * 2, 760]], 4); P(g, [[1300, 760], [1500, 420], [1800, 380], [2100, 760]], '#7a8a5a', 5);
  for (const [x, y] of [[300, 860], [700, 900], [1100, 840], [1500, 930]]) { L(g, [[x - 40, y], [x + 40, y - 70]], 12, '#4a4a4a'); L(g, [[x + 40, y], [x - 40, y - 70]], 12, '#4a4a4a'); L(g, [[x, y + 10], [x, y - 80]], 12, '#4a4a4a'); } }
function landingCraft(g, x, y, s = 1, ramp = 0) { g.save(); g.translate(x, y); g.scale(s, s); P(g, [[-260, -90], [240, -90], [260, 20], [-260, 20]], '#6a7a6a', 5); P(g, [[240, -90], [240 + 180 * ramp, -90 + 110 * ramp], [260, 20]], '#5a6a5a', 4); g.restore(); }
function smoke(g, t, x, y, s = 1) { for (let i = 0; i < 5; i++) { const k = (t * 0.5 + i / 5) % 1; C(g, x + k * 80 * s, y - k * 300 * s, (40 + k * 70) * s, `rgba(90,90,90,${0.55 * (1 - k)})`, 0); } }
function village(g, t, dusk = true) { K.sky(g, dusk ? 'dusk' : 'storm', t); K.ground(g, '#a89a7a', 900); houses(g, t, 900, { cols: ['#d9c9a8', '#c9b28a', '#e6d6b8', '#b8a48a'], seed: 21 });
  g.save(); g.translate(1500, 900); R(g, -70, -620, 140, 620, '#c9b28a', 4); P(g, [[-90, -620], [0, -780], [90, -620]], '#5a4a3a', 4); g.restore(); g.fillStyle = '#8a7a5a'; g.fillRect(-W, 900, W * 3, H); L(g, [[-W, 900], [W * 2, 900]], 4); }
function muzzle(g, t, x, y, at) { if (t < at || t > at + 0.12) return; P(g, [[x, y], [x + 40, y - 14], [x + 70, y], [x + 40, y + 14]], '#ffd27a', 3); }
function doc(g, t, lines, at = 0, x = W / 2, y = H / 2, col = '#e9d9a8', stamp = null) { const s = K.pop(t, at, 0.4); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.03); R(g, -440, -300, 880, 600, col, 6, 8); lines.forEach((l, i) => T(g, l, 0, -200 + i * 90, i === 0 ? 56 : 42, i === 0 ? '#c0392b' : OL, { stroke: 0 })); if (stamp && t > at + 0.9) { g.save(); g.translate(200, 200); g.rotate(-0.25); g.strokeStyle = '#c0392b'; g.lineWidth = 10; g.strokeRect(-180, -50, 360, 100); T(g, stamp, 0, 4, 54, '#c0392b', { stroke: 0 }); g.restore(); } g.restore(); }
function bubble(g, t, str, x, y, at = 0, size = 64) { const s = K.pop(t, at, 0.3); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); g.font = `700 ${size}px "Fredoka"`; const w = g.measureText(str).width + 80; R(g, -w / 2, -70, w, 140, '#ffffff', 7, 50); P(g, [[-60, 66], [-110, 140], [-10, 70]], '#ffffff', 0); L(g, [[-60, 68], [-110, 140], [-10, 72]], 7); T(g, str, 0, 4, size, '#c0392b', { stroke: 0 }); g.restore(); }
function jeep(g, x, y, s = 1, t = 0) { g.save(); g.translate(x, y); g.scale(s, s); R(g, -220, -150, 440, 110, '#5d6142', 5, 10); R(g, -120, -230, 20, 90, '#4a4e34', 3); L(g, [[-120, -230], [60, -230]], 6); for (const wx of [-140, 140]) { C(g, wx, -30, 50, '#2a2a2e', 5); C(g, wx, -30, 18, '#8a8a7a', 3); } T(g, '★', 0, -95, 60, '#f2efe6', { stroke: 0 }); g.restore(); }

// ---------- backgrounds for giant faces ----------
Object.assign(BG, {
  vienna: (g, t) => { night(g, t); houses(g, t, 980, { lit: true }); },
  camp: (g, t) => { K.sky(g, 'storm', t); K.ground(g, '#7a7a5a', 820); hut(g, 600, 820, 0.8); hut(g, 1400, 820, 0.8); wire(g, 560, 900); },
  wales: (g, t) => townWales(g, t),
  normandy: (g, t) => village(g, t),
  beach: (g, t) => beach(g, t),
  alps: (g, t) => { night(g, t); P(g, [[-200, 1100], [400, 300], [800, 800], [1200, 250], [1700, 900], [2100, 1100]], '#cfd8e8', 5); },
  dark: (g, t) => { g.fillStyle = '#1c1a24'; g.fillRect(-W, -H, W * 3, H * 3); },
  ruins: (g, t) => { K.sky(g, 'dusk', t); K.ground(g, '#8a7a6a', 860); for (let i = 0; i < 6; i++) P(g, [[i * 340, 860], [i * 340 + 40, 600 + (i % 3) * 60], [i * 340 + 160, 660], [i * 340 + 220, 860]], '#9a8a7a', 4); },
});

// ---------- scenes ----------
Object.assign(S, {
  beachLanding(g, t, d, p) {
    beach(g, t); landingCraft(g, 360, 640, 1.1, clamp(t / 1.2)); smoke(g, t, 1500, 700, 1.2); smoke(g, t + 1, 900, 760);
    for (let i = 0; i < 3; i++) { const x = lerp(520 + i * 120, 1500 + i * 120, ((t * 0.18 + i * 0.2) % 1)); guy(g, t, i === 1 ? TOMI_CMD : US, x, 900 + i * 40, { s: 1, pose: walkPose(t * 2 * Math.PI * 1.6 + i, { run: true }), still: true, expr: i === 1 ? 'determined' : 'scared', seed: i }); }
    for (const [at, x] of [[0.6, 1200], [1.8, 700], [2.9, 1600]]) { const k = clamp((t - at) / 0.6); if (k > 0 && k < 1) C(g, x, 760, 40 + 160 * k, `rgba(255,200,120,${1 - k})`, 0); }
  },
  villageStreet(g, t, d, p) {
    village(g, t);
    const walk = p.walk != null && t > p.walk; const x = walk ? lerp(260, 900, clamp((t - p.walk) / (p.walkDur || 4))) : 260;
    if (p.officer) guy(g, t, OFFICER, 120, 1000, { s: 1.4, pose: 'point', expr: 'determined' });
    guy(g, t, TOMI_CMD, x, 1010, { s: 1.5, pose: walk && t < (p.shout ?? 99) ? walkPose(t * 2 * Math.PI * 0.6, { stride: 20 }) : (t > (p.shout ?? 99) ? 'cheer' : 'stand'), still: walk, expr: K.exprAt(t, p.ex, 'nervous') });
    for (const [wx, wy] of [[1090, 520], [1360, 520], [610, 600]]) { const k = 0.5 + 0.5 * Math.sin(t * 2 + wx); R(g, wx - 30, wy - 40, 80, 80, '#1c1a24', 3, 4); C(g, wx, wy, 10, `rgba(255,240,180,${0.4 + 0.6 * k})`, 0); C(g, wx + 22, wy, 10, `rgba(255,240,180,${0.4 + 0.6 * k})`, 0); }
    if (p.shout != null) bubble(g, t, '¡ERGEBT EUCH!', x + 260, 470, p.shout, 70);
    if (p.fire != null) for (let i = 0; i < 8; i++) { muzzle(g, t, 1060 + (i % 3) * 270, 520 + (i % 2) * 80, p.fire + i * 0.18); }
  },
  viennaNight(g, t, d, p) {
    night(g, t); houses(g, t, 1000, { lit: true, broken: p.broken, curtain: p.curtain, seed: 4 });
    if (p.fire) { fireGlow(g, t, 1500, 640, 1.3); g.fillStyle = 'rgba(255,120,40,.12)'; g.fillRect(-W, -H, W * 3, H * 3); }
    if (p.broken) shards(g, t, 300, 1010);
    if (p.teen) guy(g, t, TOMI_TEEN, 900, 1060, { s: 1.4, pose: 'stand', expr: K.exprAt(t, p.ex, 'scared') });
  },
  station(g, t, d, p) {
    K.sky(g, 'storm', t); K.ground(g, '#8a8a7a', 760); R(g, -W, 760, W * 3, 60, '#6a6a62', 4);
    const tx = p.leave != null && t > p.leave ? -((t - p.leave) ** 2) * 160 : 0; K.train(g, 1250 + tx, 760, 0.9, t, { cars: 3 });
    for (let i = 0; i < 4; i++) guy(g, t, KID(['#c0392b', '#3f6a4a', '#8a5a2a', '#5a4a8a'][i], ['bun', 'messy', 'side', 'curly'][i]), 1150 + i * 150, 1000, { s: 1.2, pose: 'sad', expr: 'sad', seed: i });
    const act = p.act || 'hug';
    if (act === 'hug') { guy(g, t, MOM, 640, 1010, { s: 1.4, f: 1, pose: { ...POSES.reach, hF: [40, -150], eF: [30, -140] }, expr: 'cry' }); guy(g, t, TOMI_TEEN, 780, 1010, { s: 1.3, f: -1, pose: 'sad', expr: 'cry' }); guy(g, t, DAD, 440, 1010, { s: 1.4, f: 1, pose: 'sad', expr: 'sad' }); }
    if (act === 'hand') { guy(g, t, DAD, 560, 1010, { s: 1.45, f: 1, pose: { ...POSES.reach, hF: [60, -120], eF: [36, -130] }, expr: 'determined' }); guy(g, t, TOMI_TEEN, 760, 1010, { s: 1.35, f: -1, pose: { ...POSES.reach, hF: [60, -120], eF: [36, -130] }, expr: 'sad' }); }
    if (act === 'leave') { guy(g, t, MOM, 500, 1010, { s: 1.4, f: 1, pose: 'wave', expr: 'cry' }); guy(g, t, DAD, 320, 1010, { s: 1.4, f: 1, pose: 'sad', expr: 'sad' }); }
    for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i / 4) % 1; C(g, 1270 + tx - k * 200, 460 - k * 200, 40 + k * 60, `rgba(235,235,235,${0.7 * (1 - k)})`, 0); }
  },
  trainWindow(g, t, d, p) {
    g.fillStyle = '#5a3a2a'; g.fillRect(-W, -H, W * 3, H * 3); g.save(); g.beginPath(); g.roundRect(360, 160, 1200, 700, 40); g.clip(); K.sky(g, 'storm', t); const dx = t * 260; houses(g, t, 860, { seed: 7 }); g.translate(-dx, 0); g.restore();
    g.save(); g.beginPath(); g.roundRect(360, 160, 1200, 700, 40); g.clip(); g.translate(-(t * 300) % 400, 0); for (let i = 0; i < 8; i++) K.tree(g, i * 400, 900, 1.2, '#4f6a4a'); g.restore();
    R(g, 360, 160, 1200, 700, null, 10, 40); toonBigFace(g, 1300, 980, 200, { outfit: TOMI_TEEN, expr: 'sad', look: [-0.8, -0.3], t });
  },
  london(g, t, d, p) {
    K.sky(g, 'storm', t); K.ground(g, '#6a6a62', 900); houses(g, t, 900, { cols: ['#a89a8a', '#9a8a7a', '#b8a898', '#8a7a6a'], seed: 13 });
    g.save(); g.translate(1650, 900); R(g, -70, -700, 140, 700, '#c9b28a', 4); C(g, 0, -560, 50, '#f2efe6', 4); L(g, [[0, -560], [0, -595]], 5); L(g, [[0, -560], [25, -560]], 5); P(g, [[-80, -700], [0, -830], [80, -700]], '#5a6a5a', 4); g.restore();
    R(g, lerp(-500, 400, clamp(t / 4)), 760, 380, 160, '#c0392b', 5, 20); for (let i = 0; i < 4; i++) R(g, lerp(-500, 400, clamp(t / 4)) + 30 + i * 85, 785, 60, 50, '#9fc6d8', 3);
    g.strokeStyle = 'rgba(200,210,230,.5)'; g.lineWidth = 2; for (let i = 0; i < 70; i++) { const x = (i * 97 + t * 400) % (W + 200) - 100, y = (i * 53 + t * 900) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 26); g.stroke(); }
    if (p.study) { R(g, 900, 860, 520, 40, '#8a5a34', 4); for (let i = 0; i < 4; i++) R(g, 960 + i * 50, 800 - i * 6, 40, 60, ['#c0392b', '#3f6a4a', '#2f5fa8', '#c9a060'][i], 3, 4); }
    guy(g, t, TOMI_TEEN, p.study ? 820 : 900, 1010, { s: 1.4, pose: p.study ? 'think' : 'holdFront', expr: p.study ? 'thinking' : 'worried' }); if (!p.study) R(g, 970, 860, 100, 80, '#8a5a34', 4, 6);
  },
  knock(g, t, d, p) {
    K.room(g, 'hall', { wall: '#d9cbb0' }); R(g, 760, GY - 640, 420, 640, '#7a4a2a', 6, 8); C(g, 1120, GY - 320, 16, '#f2c21a', 4);
    const open = clamp((t - (p.open ?? 2)) / 0.6); if (open > 0) { R(g, 760, GY - 640, 420 * (1 - open * 0.8), 640, '#7a4a2a', 6, 8); guy(g, t, BOBBY, 1000, GY + 20, { s: 1.5, f: -1, pose: 'point', expr: 'determined' }); guy(g, t, BOBBY, 1150, GY + 30, { s: 1.45, f: -1, pose: 'stand', expr: 'neutral', seed: 3 }); }
    else for (const at of [0.3, 0.6, 0.9]) if (t > at && t < at + 0.15) K.label(g, t, 'TOC', 1000, GY - 700, at, 80, '#c0392b');
    guy(g, t, TOMI_TEEN, 520, GY + 30, { s: 1.45, pose: open > 0 ? 'shrug' : 'stand', expr: open > 0 ? 'shocked' : 'surprised' });
  },
  internment(g, t, d, p) {
    K.sky(g, 'storm', t); K.ground(g, '#7a7a5a', 820); hut(g, 400, 820, 0.9); hut(g, 1500, 820, 0.9);
    for (let i = 0; i < 4; i++) guy(g, t, { top: 'jacket', color: ['#5a5a62', '#6a5a4a', '#4a5a6a', '#5a4a4a'][i], legs: '#3a3a3a', hair: ['side', 'messy', 'none', 'curly'][i], hairColor: '#4a3a2a', hat: i === 2 ? 'fedora' : 'none', hatColor: '#3a3a3a' }, 300 + i * 380, 990, { s: 1.2, pose: 'sad', expr: 'sad', seed: i });
    guy(g, t, TOMI_TEEN, 960, 1040, { s: 1.45, pose: p.sit ? 'sit' : 'sad', expr: K.exprAt(t, p.ex, 'sad') }); wire(g, 600, 1080);
  },
  interview(g, t, d, p) {
    K.room(g, 'hall', { wall: '#a89a7a', floor: '#6a5a4a' }); R(g, 700, GY - 160, 520, 160, '#6a4a2a', 5); R(g, 800, GY - 190, 160, 30, '#e9d9a8', 3);
    guy(g, t, OFFICER, 1250, GY + 20, { s: 1.5, f: -1, pose: posesAt(t, [[0, 'talk'], [d * 0.5, 'point']]), expr: 'smirk', talk: Math.abs(Math.sin(t * 9)) * 0.6 });
    guy(g, t, TOMI_TEEN, 560, GY + 30, { s: 1.45, f: 1, pose: 'stand', expr: K.exprAt(t, p.ex, 'confused') });
    const qs = (p.qs || []).filter(([, at]) => t >= at); if (qs.length) { const [str, at] = qs[qs.length - 1]; K.label(g, t, str, 1250, 260, at, 64, '#f2e94a'); }
  },
  xtroop(g, t, d, p) {
    K.sky(g, 'dusk', t); K.ground(g, '#6a7a4a', 900);
    for (let i = 0; i < 7; i++) { const tt = t - i * 0.12; if (tt > 0) guy(g, t, i === 3 ? TOMI_CMD : { ...TOMI_CMD, hair: ['messy', 'curly', 'side', 'none', 'side', 'messy', 'curly'][i], hairColor: ['#5a3a24', '#2a2020', '#8a5a2a', '#3a2a20', '#c9a060', '#4a3020', '#2a2020'][i] }, 230 + i * 245, 1010 - (i === 3 ? 0 : 20), { s: i === 3 ? 1.35 : 1.2, pose: 'crossArms', expr: 'determined', seed: i }); }
    if (p.badge != null) { const s = K.pop(t, p.badge, 0.45); if (s > 0) { g.save(); g.translate(W / 2, 300); g.scale(s, s); C(g, 0, 0, 170, '#2f6a3a', 10); C(g, 0, 0, 140, '#f2e94a', 6); T(g, 'X', 0, 10, 220, '#2f6a3a', { stroke: 0 }); g.restore(); K.label(g, t, 'X TROOP', W / 2, 520, p.badge + 0.3, 70, '#f2e94a'); } }
  },
  newName(g, t, d, p) {
    g.fillStyle = '#5a4a3a'; g.fillRect(-W, -H, W * 3, H * 3); g.save(); g.translate(W / 2 - 220, H / 2); g.rotate(-0.03);
    R(g, -460, -330, 920, 660, '#e9d9a8', 6, 10); T(g, 'TARJETA DE IDENTIDAD', 0, -260, 50, '#c0392b', { stroke: 0 });
    T(g, 'NOMBRE:', -260, -140, 44, OL, { stroke: 0 }); T(g, 'ÁLVARO KLEIN', 120, -140, 46, OL, { stroke: 0 });
    const k = clamp((t - (p.cross ?? 0.8)) / 0.5); if (k > 0) L(g, [[-60, -140], [-60 + 360 * k, -140]], 10, '#c0392b');
    if (t > (p.cross ?? 0.8) + 0.6) T(g, 'ALAN KING', 120, -60, 58, '#2f5fa8', { stroke: 0 });
    T(g, 'PADRES: ??? · PUEBLO: ???', 0, 60, 40, OL, { stroke: 0 }); g.restore();
    if (p.tag != null) { const s = K.pop(t, p.tag, 0.4); if (s > 0) { g.save(); g.translate(1520, 640); g.scale(s, s); g.rotate(0.15); L(g, [[0, -300], [0, -150]], 5, '#8a8a8a'); R(g, -140, -150, 280, 180, '#c9ccd2', 6, 30); T(g, 'C. OF E.', 0, -80, 44, OL, { stroke: 0 }); T(g, 'IGLESIA DE', 0, -20, 26, OL, { stroke: 0 }); T(g, 'INGLATERRA', 0, 10, 26, OL, { stroke: 0 }); g.restore(); } }
  },
  order(g, t, d, p) { g.fillStyle = '#2a2420'; g.fillRect(-W, -H, W * 3, H * 3); K.lamp(g, 1600, 900, 1.3); doc(g, t, ['ORDEN DE COMANDOS', 'OCTUBRE 1942', 'COMANDOS CAPTURADOS:', 'EJECUCIÓN SIN JUICIO'], 0.3, W / 2 - 100, H / 2, '#d9d0b8', 'ALTO SECRETO'); g.fillStyle = 'rgba(20,10,10,.25)'; g.fillRect(-W, -H, W * 3, H * 3); },
  noGerman(g, t, d, p) { BG.dark(g, t); toonBigFace(g, W / 2, H * 0.55, 260, { outfit: TOMI_CMD, expr: 'worried', t }); const s = K.pop(t, 0.6, 0.3); if (s > 0) { g.save(); g.translate(W / 2 + 300, 260); g.scale(s, s); C(g, 0, 0, 120, '#ffffff', 10); L(g, [[-85, -85], [85, 85]], 22, '#c0392b'); T(g, 'DEUTSCH', 0, 0, 44, OL, { stroke: 0 }); C(g, 0, 0, 120, null, 18); g.strokeStyle = '#c0392b'; g.lineWidth = 18; g.beginPath(); g.arc(0, 0, 120, 0, 7); g.stroke(); g.restore(); } },
  training(g, t, d, p) {
    const a = p.act;
    if (a === 'cliff') { cliffs(g, t); L(g, [[520, 260], [520, 1100]], 6, '#c9a060'); guy(g, t, TOMI_CMD, 520, lerp(1150, 700, clamp(t / d)), { s: 1.1, pose: 'pointUp', expr: 'determined', still: true, shadow: false }); }
    if (a === 'swim') { K.sky(g, 'storm', t); K.ocean(g, t, 400); for (let i = 0; i < 3; i++) { const x = 500 + i * 450 + Math.sin(t * 2 + i) * 30; toonBigFace(g, x, 760, 70, { outfit: i === 1 ? TOMI_CMD : { ...TOMI_CMD, hairColor: '#8a5a2a' }, expr: 'scared', t }); g.fillStyle = '#2e6a9a'; g.fillRect(x - 120, 790, 240, 200); } K.label(g, t, '❄ 8 °C', 1600, 200, 0.3, 70, '#9fd8ff'); }
    if (a === 'truck') { K.sky(g, 'storm', t); K.ground(g, '#6a7a4a', 900); const tx = lerp(-200, 2200, t / d); R(g, tx - 300, 600, 460, 260, '#5d6142', 5, 10); R(g, tx + 160, 680, 160, 180, '#4a4e34', 5, 10); for (const wx of [tx - 200, tx + 220]) C(g, wx, 880, 50, '#2a2a2e', 5); const jx = tx - 360, k = clamp((t - 1) / 0.8); guy(g, t, TOMI_CMD, jx - k * 100, lerp(780, 1000, k), { s: 1.2, pose: k < 1 ? 'jump' : 'crouch', expr: 'determined', still: true, rot: k < 1 ? -0.4 : 0 }); }
    if (a === 'shoot') { K.sky(g, 'storm', t); K.ground(g, '#6a7a4a', 880); guy(g, t, TOMI_CMD, 900, 1000, { s: 1.4, pose: 'crouch', expr: 'scared' }); for (let i = 0; i < 10; i++) { const x = ((t * 1800 + i * 260) % (W + 400)) - 200; L(g, [[x, 380 + (i % 3) * 40], [x + 120, 380 + (i % 3) * 40]], 6, '#ffd27a'); } R(g, 1500, 640, 80, 240, '#c9a874', 4); C(g, 1540, 600, 60, '#f2efe6', 4); C(g, 1540, 600, 30, '#c0392b', 3); }
  },
  landlady(g, t, d, p) {
    K.room(g, 'kitchen', { wall: '#f0dcb4' }); R(g, 1500, GY - 300, 260, 300, '#8a5a34', 5); P(g, [[1520, GY - 60], [1580, GY - 160], [1640, GY - 90], [1700, GY - 170], [1740, GY - 60]], '#ff9a3a', 3);
    R(g, 760, GY - 170, 440, 26, '#8a5a34', 4); for (const x of [860, 1100]) { R(g, x - 26, GY - 220, 52, 50, '#f2efe6', 4, 8); for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; C(g, x, GY - 230 - k * 60, 8 + k * 10, `rgba(255,255,255,${0.6 * (1 - k)})`, 0); } }
    guy(g, t, LANDLADY, 1250, GY + 20, { s: 1.4, f: -1, pose: 'holdFront', expr: 'smile', talk: 0 });   // the narrator speaks here, not her
    guy(g, t, TOMI_CMD, 620, GY + 30, { s: 1.45, f: 1, pose: 'sit', expr: K.exprAt(t, p.ex, 'smile') });
    if (p.thought != null) { const s = K.pop(t, p.thought, 0.4); if (s > 0) { g.save(); g.translate(560, 260); g.scale(s, s); for (const [x, y, r] of [[60, 220, 16], [30, 180, 24]]) C(g, x, y, r, '#ffffff', 5); O(g, 0, 0, 240, 150, '#ffffff', 6); g.save(); g.beginPath(); g.ellipse(0, 0, 230, 140, 0, 0, 7); g.clip(); guy(g, t, MOM, -60, 260, { s: 0.9, big: 1, pose: 'wave', expr: 'smile' }); guy(g, t, DAD, 70, 260, { s: 0.9, big: 1, pose: 'stand', expr: 'smile' }); g.restore(); g.restore(); } }
  },
  ritchie(g, t, d, p) {
    K.room(g, 'briefing', { wall: '#d9c9a8' }); R(g, 560, 180, 800, 420, '#2f4a3a', 7, 8); for (const [w, y] of [['WO SIND DIE KANONEN?', 300], ['WIE VIELE MÄNNER?', 400]]) T(g, w, 960, y, 46, '#f2efe6', { stroke: 0, font: 'Nunito' });
    for (let i = 0; i < 4; i++) guy(g, t, US, 380 + i * 360, GY + 40, { s: 1.35, f: i < 2 ? 1 : -1, pose: 'holdFront', expr: 'thinking', seed: i, big: 1.15 });
  },
  interrogate(g, t, d, p) {
    beach(g, t); guy(g, t, GERMAN, 1200, 1000, { s: 1.5, f: -1, pose: 'cheer', expr: 'scared' }); guy(g, t, TOMI_CMD, 760, 1010, { s: 1.5, f: 1, pose: 'holdFront', expr: 'determined', talk: Math.abs(Math.sin(t * 8)) * 0.6 }); R(g, 860, 760, 70, 90, '#f2efe6', 4, 4);
    if (p.notes != null) [['CAÑONES: 3', 0], ['HOMBRES: 40', 0.5], ['CONTRAATAQUE: NORTE', 1.0]].forEach(([s, dt], i) => K.label(g, t, s, 1500, 200 + i * 80, p.notes + dt, 48, '#f2e94a'));
  },
  fallen(g, t, d, p) {
    K.sky(g, 'golden', t); K.ground(g, '#7a8a5a', 860);
    for (let i = 0; i < 5; i++) { const x = 330 + i * 315; L(g, [[x, 900], [x, 620]], 14, '#5a3a24'); g.beginPath(); g.ellipse(x, 640, 84, 66, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = '#4a5a3a'; g.fill(); g.strokeStyle = OL; g.lineWidth = 5; g.stroke(); O(g, x, 640, 104, 16, '#3e4c30', 5); for (let k = 0; k < 3; k++) C(g, x - 40 + k * 40, 905, 12, ['#c0392b', '#f2c21a', '#e8e2d0'][k], 3); }
    if (p.medal != null) { const s = K.pop(t, p.medal, 0.4); if (s > 0) { g.save(); g.translate(W / 2, 360); g.scale(s, s); R(g, -40, -170, 80, 120, '#c0392b', 4); P(g, [[0, -60], [70, 0], [40, 90], [-40, 90], [-70, 0]], '#f2c21a', 6); T(g, '★', 0, 20, 70, OL, { stroke: 0 }); g.restore(); K.label(g, t, '¿NOMBRE REAL? ???', W / 2, 620, p.medal + 0.6, 50, '#fff8e8'); } }
  },
  alps(g, t, d, p) {
    night(g, t); P(g, [[-200, 1100], [300, 420], [600, 800], [1000, 300], [1450, 820], [1800, 380], [2200, 1100]], '#cfd8e8', 5); P(g, [[180, 560], [300, 420], [420, 560]], '#ffffff', 3); P(g, [[880, 430], [1000, 300], [1120, 430]], '#ffffff', 3);
    for (let i = 0; i < 3; i++) { const k = clamp((t - i * 0.5) / (d * 0.9)); const x = 700 + i * 250 + Math.sin(t + i) * 30, y = lerp(-200, 760, k); g.save(); g.translate(x, y); g.scale(1.6, 1.6); P(g, [[-120, -140], [0, -200], [120, -140]], ['#e6e0d4', '#d9d2c4', '#c9c2b2'][i], 4); L(g, [[-120, -140], [0, 0]], 2); L(g, [[120, -140], [0, 0]], 2); C(g, 0, 20, 22, '#fbf7ef', 4); g.restore(); }
  },
  trio(g, t, d, p) {
    K.sky(g, 'night', t); g.fillStyle = 'rgba(20,24,60,.4)'; g.fillRect(-W, -H, W * 3, H * 3);
    const card = (i, of, name, sub, at) => { const s = K.pop(t, at, 0.4); if (s <= 0) return; g.save(); g.translate(360 + i * 600, 560); g.scale(s, s); R(g, -260, -420, 520, 760, '#fff8e8', 7, 26); g.save(); g.beginPath(); g.roundRect(-250, -410, 500, 470, 22); g.clip(); g.fillStyle = '#cfe0ea'; g.fillRect(-250, -410, 500, 470); toonBigFace(g, 0, -120, 150, { outfit: of, expr: 'determined', t }); g.restore(); T(g, name, 0, 130, 44, OL, { stroke: 0 }); T(g, sub, 0, 210, 32, '#c0392b', { stroke: 0 }); g.restore(); };
    card(0, { ...MAYER, hat: 'none' }, 'FREDERICK MAYER', 'judío alemán · EE. UU.', p.a ?? 0); card(1, WYNBERG, 'HANS WYNBERG', 'refugiado de Holanda', p.b ?? 1); card(2, WEBER, 'FRANZ WEBER', 'desertor austriaco', p.c ?? 2);
  },
  messHall(g, t, d, p) {
    K.room(g, 'hall', { wall: '#b8a888', floor: '#7a5a3a' }); R(g, 300, GY - 140, 1320, 30, '#8a5a34', 4);
    for (let i = 0; i < 3; i++) guy(g, t, GERMAN.hat ? { ...GERMAN, hat: 'cap', hatColor: '#5a5e52', hair: 'side', hairColor: '#4a3a2a' } : GERMAN, 460 + i * 300, GY, { s: 1.3, f: 1, pose: 'sit', expr: i === 1 ? 'happy' : 'smirk', talk: Math.abs(Math.sin(t * 7 + i)) * 0.6, seed: i });
    guy(g, t, MAYER, 1420, GY, { s: 1.35, f: -1, pose: 'sit', expr: 'smirk', look: [-0.9, 0] });
    if (p.ear) { for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(242,233,74,${0.8 - i * 0.2})`; g.lineWidth = 6; g.beginPath(); g.arc(1380, 560, 50 + i * 40 + (t * 60) % 40, Math.PI * 0.7, Math.PI * 1.3); g.stroke(); } }
  },
  radio(g, t, d, p) {
    K.room(g, 'hall', { wall: '#6a6a72', floor: '#4a4a52' }); g.fillStyle = 'rgba(10,10,30,.35)'; g.fillRect(-W, -H, W * 3, H * 3);
    R(g, 760, GY - 300, 420, 260, '#5d6142', 6, 10); for (let i = 0; i < 3; i++) C(g, 840 + i * 120, GY - 200, 30, '#2a2a2e', 4); L(g, [[1100, GY - 300], [1200, GY - 600]], 5);
    for (let i = 0; i < 4; i++) { g.strokeStyle = `rgba(159,216,255,${0.8 - i * 0.18})`; g.lineWidth = 6; g.beginPath(); g.arc(1200, GY - 600, 60 + i * 60 + (t * 120) % 60, -1.2, -0.2); g.stroke(); }
    guy(g, t, MAYER, 620, GY + 20, { s: 1.4, f: 1, pose: 'sit', expr: 'determined' });
    ['TRENES', 'ARMAS', 'TROPAS'].forEach((s, i) => K.label(g, t, s, 1500, 220 + i * 90, 0.6 + i * 0.6, 54, '#9fd8ff'));
  },
  gestapo(g, t, d, p) {
    g.fillStyle = '#1c1a24'; g.fillRect(-W, -H, W * 3, H * 3); const sw = Math.sin(t * 1.4) * 0.15;
    g.save(); g.translate(W / 2, -40); g.rotate(sw); L(g, [[0, 0], [0, 360]], 4, '#5a5a5a'); P(g, [[-70, 360], [70, 360], [40, 300], [-40, 300]], '#4a4a4a', 4); g.fillStyle = 'rgba(255,240,180,.18)'; g.beginPath(); g.moveTo(-60, 360); g.lineTo(-500, 1200); g.lineTo(500, 1200); g.lineTo(60, 360); g.fill(); g.restore();
    R(g, 860, 880, 200, 30, '#4a3a2a', 4); guy(g, t, { ...MAYER, hat: 'none' }, 960, 1000, { s: 1.4, f: 1, pose: 'sad', expr: K.exprAt(t, p.ex, 'determined') });
    guy(g, t, GESTAPO, 560, 1000, { s: 1.45, f: 1, pose: 'point', expr: 'angry', talk: Math.abs(Math.sin(t * 9)) * 0.7 }); guy(g, t, GESTAPO, 1360, 1000, { s: 1.45, f: -1, pose: 'crossArms', expr: 'angry', seed: 3 });
    if (p.q != null) K.label(g, t, '¿NOMBRES?', 560, 300, p.q, 70, '#ff6a5a');
    if (p.silent != null) K.label(g, t, '…', 1040, 520, p.silent, 120, '#fff8e8');
  },
  negotiate(g, t, d, p) {
    K.room(g, 'office', { wall: '#b8a888' }); R(g, 620, GY - 170, 680, 30, '#6a4a2a', 4); R(g, 660, GY - 140, 600, 140, '#7a4a2a', 4);
    guy(g, t, CHIEF, 1350, GY + 20, { s: 1.45, f: -1, pose: 'sit', expr: K.exprAt(t, p.cex, 'angry') }); guy(g, t, { ...MAYER, hat: 'none' }, 560, GY + 20, { s: 1.45, f: 1, pose: 'explain', expr: 'determined', talk: Math.abs(Math.sin(t * 8)) * 0.6 });
    R(g, 820, GY - 260, 280, 90, '#e9d9a8', 3); T(g, 'INNSBRUCK', 960, GY - 215, 34, OL, { stroke: 0 });
  },
  innsbruck(g, t, d, p) {
    K.sky(g, 'day', t); P(g, [[-200, 700], [300, 260], [700, 600], [1100, 220], [1500, 560], [1900, 260], [2200, 700]], '#cfd8e8', 5); K.ground(g, '#8ab060', 780); houses(g, t, 880, { seed: 31 });
    g.save(); g.translate(980, 360); L(g, [[0, 0], [0, -260]], 8, '#6a4a2a'); const wv = Math.sin(t * 3) * 14; P(g, [[4, -260], [220, -250 + wv], [220, -130 + wv], [4, -140]], '#ffffff', 5); g.restore();
    jeep(g, lerp(-300, 900, ease.out(clamp(t / 3))), 1000, 1.1, t); guy(g, t, US, lerp(-500, 700, ease.out(clamp(t / 3))), 1040, { s: 1.2, pose: 'wave', expr: 'happy' });
    if (p.lbl != null) K.label(g, t, 'SIN COMBATIR', W / 2, 140, p.lbl, 70, '#f2e94a');
  },
  cinema(g, t, d, p) {
    g.fillStyle = '#2a1a1a'; g.fillRect(-W, -H, W * 3, H * 3); R(g, 360, 140, 1200, 600, '#f2efe6', 8, 6); for (const x of [260, 1660]) P(g, [[x - 100, 100], [x + 100, 100], [x + 60, 800], [x - 60, 800]], '#8a2a2a', 4);
    if ((p.year == null || t < p.year) && (p.fiction == null || t < p.fiction - 0.9)) { g.save(); g.beginPath(); g.rect(366, 146, 1188, 588); g.clip(); g.fillStyle = '#d9c9a8'; g.fillRect(366, 146, 1188, 588); for (let i = 0; i < 5; i++) { const x = 560 + i * 200; C(g, x, 560, 46, '#2a2a2a', 0); O(g, x, 512, 52, 20, '#2a2a2a', 0); R(g, x - 40, 600, 80, 140, '#2a2a2a', 0, 20); } T(g, 'BASTARDOS SIN GLORIA', 960, 280, 70, '#2a2a2a', { stroke: 0 }); g.restore(); }
    for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) { const x = 200 + i * 140 + r * 70, y = 900 + r * 90; C(g, x, y, 40, '#3a2a2a', 3); }
    if (p.year != null) { K.label(g, t, '2009', 960, 330, p.year, 160, '#2a2a2a'); K.label(g, t, '← película italiana de 1978', 960, 520, p.year + 1.5, 50, '#c0392b'); }
    if (p.fiction != null) { K.label(g, t, '¿HITLER EN UN CINE?', 960, 380, p.fiction - 0.9, 70, '#2a2a2a'); const s = K.pop(t, p.fiction, 0.3); if (s > 0) { g.save(); g.translate(960, 560); g.scale(s, s); g.rotate(-0.12); g.strokeStyle = '#c0392b'; g.lineWidth = 14; g.strokeRect(-300, -80, 600, 160); T(g, 'FICCIÓN', 0, 6, 110, '#c0392b', { stroke: 0 }); g.restore(); } }
  },
  victory(g, t, d, p) {
    K.sky(g, 'day', t); K.ground(g, '#a89a7a', 900); houses(g, t, 900, { seed: 41 }); K.crowd(g, t, 960, 20, { rows: 2, seed: 2 });
    const r = rng(3); for (let i = 0; i < 80; i++) { const x = (r() * W + Math.sin(t + i) * 40), y = (r() * H + t * 160) % H; R(g, x, y, 12, 18, ['#c0392b', '#f2c21a', '#2f5fa8', '#3fa060'][i % 4], 0); }
    if (p.tomi) guy(g, t, TOMI_CMD, 1650, 1080, { s: 1.6, f: -1, pose: 'sad', expr: 'sad' });
  },
  jeepDrive(g, t, d, p) {
    K.sky(g, 'dusk', t); K.ground(g, '#8a7a6a', 860); const dx = t * 300;
    g.save(); g.translate(-(dx % 680), 0); for (let i = 0; i < 6; i++) { const x = i * 680; P(g, [[x, 860], [x + 40, 560], [x + 160, 620], [x + 210, 520], [x + 300, 860]], '#9a8a7a', 4); R(g, x + 70, 680, 60, 70, '#3a2a2a', 3); } g.restore();
    if (p.bridge) { R(g, 1100, 780, 300, 30, '#7a6a5a', 4); P(g, [[1400, 780], [1520, 900], [1500, 920], [1390, 810]], '#7a6a5a', 4); }
    if (p.people) for (let i = 0; i < 6; i++) guy(g, t, { top: 'jacket', color: ['#6a5a4a', '#5a5a62', '#7a6a5a'][i % 3], legs: '#3a3a3a', hair: 'side', hairColor: '#5a4a3a', hat: i % 2 ? 'fedora' : 'none', hatColor: '#4a4a4a' }, ((i * 300 - t * 60) % 1900 + 1900) % 1900, 1000, { s: 0.9, pose: walkPose(t * 2 * Math.PI * 0.5 + i, { stride: 14 }), still: true, expr: 'sad', seed: i });
    jeep(g, 700, 1010 + Math.sin(t * 14) * 3, 1.1, t); toonBigFace(g, 660, 770, 44, { outfit: TOMI_CMD, expr: 'determined', look: [1, 0], t });
  },
  campGate(g, t, d, p) {
    K.sky(g, 'storm', t); K.ground(g, '#7a7a6a', 860); wire(g, 600, 900);
    g.save(); g.translate(W / 2, 900); R(g, -360, -420, 720, 420, '#9a6a4a', 6); R(g, -150, -300, 300, 300, '#3a2a2a', 5, 140); g.restore();
    if (p.tomi) guy(g, t, TOMI_CMD, 760, 1040, { s: 1.4, pose: p.photo ? 'holdFront' : 'stand', expr: K.exprAt(t, p.ex, 'worried') });
    if (p.photo) { R(g, 830, 790, 90, 70, '#e9d9a8', 3, 4); }
    if (p.point != null) { guy(g, t, { top: 'jacket', color: '#7a7a7a', legs: '#5a5a5a', hair: 'side', hairColor: '#aaaaaa', skin: '#ece6dc' }, 1250, 1040, { s: 1.3, f: -1, pose: t > p.point ? 'point' : 'sad', expr: 'sad' }); if (t > p.point) K.arrow(g, 1150, 700, 1600, 600, clamp((t - p.point) / 0.5), '#f2e94a', 8); }
  },
  reunion(g, t, d, p) {
    K.room(g, 'hall', { wall: '#a89a7a', floor: '#6a5a4a' }); g.fillStyle = 'rgba(255,230,180,.15)'; g.fillRect(-W, -H, W * 3, H * 3);
    R(g, 980, GY - 120, 640, 40, '#6a4a2a', 4); guy(g, t, MOM_OLD, 1150, GY, { s: 1.35, f: -1, pose: t > (p.hug ?? 99) ? { ...POSES.reach, hF: [50, -160] } : 'sit', expr: t > (p.hug ?? 99) ? 'cry' : 'surprised' }); guy(g, t, DAD_OLD, 1400, GY, { s: 1.35, f: -1, pose: 'sit', expr: t > (p.hug ?? 99) ? 'cry' : 'surprised' });
    const x = t > (p.hug ?? 99) ? lerp(600, 960, clamp((t - p.hug) / 0.6)) : 600; guy(g, t, TOMI_CMD, x, GY + 30, { s: 1.45, f: 1, pose: t > (p.hug ?? 99) ? 'reach' : 'stand', expr: t > (p.hug ?? 99) ? 'cry' : 'shocked' });
    if (p.hug != null && t > p.hug + 0.6) for (let i = 0; i < 6; i++) { const k = (t * 0.4 + i / 6) % 1; K.T(g, '♥', 1050 + Math.sin(i * 2) * 120, 520 - k * 200, 50, `rgba(224,80,80,${1 - k})`, { stroke: 0 }); }
  },
  family(g, t, d, p) { K.sky(g, 'golden', t); K.ground(g, '#8ab060', 860); K.tree(g, 300, 880, 1.4); guy(g, t, TOMI_ADULT, 800, 1030, { s: 1.4, pose: 'relaxed', expr: 'smile' }); guy(g, t, { top: 'sweater', color: '#c0605a', legs: '#5a4a6a', hair: 'bun', hairColor: '#6a4a2a' }, 1050, 1030, { s: 1.35, f: -1, pose: 'relaxed', expr: 'happy' }); guy(g, t, KID('#f2c21a', 'messy'), 930, 1030, { s: 1.3, pose: 'cheer', expr: 'joy' }); R(g, 1450, 900, 220, 150, '#8a5a34', 5, 8); T(g, '1945', 1560, 975, 40, '#f2efe6', { stroke: 0 }); },
  title2(g, t, d, p) {
    K.sky(g, 'dusk', t); K.ground(g, '#6a7a4a', 900); for (let i = 0; i < 4; i++) guy(g, t, { ...TOMI_CMD, hairColor: ['#5a3a24', '#2a2020', '#8a5a2a', '#3a2a20'][i] }, 1100 + i * 210, 1020, { s: 1.15, pose: 'crossArms', expr: 'determined', seed: i });
    guy(g, t, TOMI_CMD, 330, H + 60, { s: 2.3, f: 1, pose: 'crossArms', expr: 'smirk' });
    const s = K.pop(t, 0.3, 0.5); g.save(); g.translate(W / 2 + 200, 260); g.scale(s, s); g.rotate(-0.03); R(g, -560, -70, 1120, 140, '#f2e94a', 7, 70); T(g, '¿Y SI TE TOCARÁ…', 0, 4, 84, OL, { stroke: 0 }); T(g, 'SER UN BASTARDO', 0, 170, 96, '#fff8e8'); T(g, 'SIN GLORIA?', 0, 290, 104, '#ff5040'); g.restore();
  },
  question2(g, t, d, p) {
    g.fillStyle = '#efe0bf'; g.fillRect(-W, -H, W * 3, H * 3); toonBigFace(g, 400, 640, 220, { outfit: TOMI_CMD, expr: 'thinking', t });
    const s = K.pop(t, 0.2, 0.4); g.save(); g.translate(1200, 440); g.scale(s, s); R(g, -580, -220, 1160, 440, '#ffffff', 7, 40); P(g, [[-480, 120], [-640, 240], [-420, 180]], '#ffffff', 7); T(g, 'SI BORRARAS TU IDENTIDAD…', 0, -90, 58, OL, { stroke: 0 }); T(g, '¿QUÉ NOMBRE TE PONDRÍAS?', 0, 10, 62, '#c0392b', { stroke: 0 }); T(g, '💬 COMENTA', 0, 130, 50, '#3f8fb0', { stroke: 0 }); g.restore();
  },
  end2(g, t, d, p) {
    K.sky(g, 'golden', t); K.ground(g, '#8ab060', 860); toonBigFace(g, 400, 560, 210, { outfit: TOMI_CMD, expr: K.exprAt(t, p.ex, 'smile'), blink: K.blinkAt(t, 3.2), t });
    if (p.q != null) { K.T(g, '¿QUÉ HABRÍAS HECHO TÚ?', 1250, 190, 62, '#fff8e8'); ['1. VOLVER A LUCHAR', '2. QUEDARME A SALVO'].forEach((o, i) => { const s = K.pop(t, p.q + 0.3 + i * 0.4, 0.35); if (s <= 0) return; g.save(); g.translate(1250, 360 + i * 150); g.scale(s, s); R(g, -360, -58, 720, 116, '#fff8e8', 6, 30); K.T(g, o, 0, 3, 54, OL, { stroke: 0 }); g.restore(); }); }
    if (p.sub != null) K.subscribeBtn(g, t, 1250, 720, p.sub, p.press ?? 99, 1.2);
    if (p.next != null) { const s = K.pop(t, p.next, 0.4); if (s > 0) { g.save(); g.translate(1250, 930); g.scale(s, s); R(g, -420, -60, 840, 120, '#2a2a30', 6, 30); K.T(g, 'PRÓXIMO: EL ESPÍA QUE ENGAÑÓ A HITLER', 0, 3, 40, '#f2e94a', { stroke: 0 }); g.restore(); } }
  },
  wales(g, t, d, p) { townWales(g, t); guy(g, t, TOMI_CMD, lerp(200, 800, clamp(t / d)), 1020, { s: 1.4, pose: walkPose(t * 2 * Math.PI * 0.8), still: true, expr: 'neutral' }); R(g, lerp(120, 720, clamp(t / d)), 900, 90, 70, '#6a4a2a', 4, 6); },
  subscribe2(g, t, d, p) {
    g.save(); g.filter = 'grayscale(1) brightness(.8)'; S.villageStreet(g, 0, d, { officer: true }); g.restore();
    g.fillStyle = 'rgba(20,16,14,.45)'; g.fillRect(-W, -H, W * 3, H * 3);
    K.T(g, 'LA MAYORÍA NO ESTÁ SUSCRITA', W / 2, 250, 72, '#fff8e8');
    K.subscribeBtn(g, t, W / 2, 560, 0.5, p.press ?? 4.2, 1.5);
    const hp = clamp((t - (p.press ?? 4.2) + 1.1) / 1.0); if (hp > 0) K.hand(g, lerp(W / 2 + 500, W / 2 + 60, ease.out(hp)), lerp(1250, 640, ease.out(hp)), 1.6);
  },
  subMid2(g, t, d, p) {
    townWales(g, t); guy(g, t, TOMI_CMD, 600, GY + 120, { s: 2, f: 1, pose: posesAt(t, [[0, 'stand'], [0.6, 'holdFront']]), expr: 'happy' });
    const s = K.pop(t, 0.8, 0.4); if (s > 0) { g.save(); g.translate(930, 640); g.scale(s, s); C(g, 0, 0, 90, '#2f6a3a', 8); T(g, 'X', 0, 6, 110, '#f2e94a', { stroke: 0 }); g.restore(); }
    K.T(g, 'YA ERES PARTE DEL EQUIPO', 1300, 250, 60); K.subscribeBtn(g, t, 1350, 560, 1.4, p.press ?? 3.2, 1.3);
  },
  mapUK(g, t, d, p) { K.map(g, t, p); P(g, [[1560, 700], [1760, 680], [1840, 800], [1760, 900], [1600, 880]], '#e9d9a8', 5); if (p.top) K.pill(g, t, p.top, 92, 0.2); },
});
