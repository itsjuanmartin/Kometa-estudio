// nv.js — scenes for ARCHIVO OSCURO 002 (Nvidia / Jensen Huang). Added to S from director.js.
import { ease, clamp, lerp, rng, alpha, shade } from '/engine/core.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from './lib.js';
import { S, AT, EL, BB, stamp, confirmed, unconfirmed, laptop, phoneUI, bubble, coin, server, calendar, clockFace, xMark, check,
  bgArchive, bgCyber, bgOffice, bgDesk, bgMap, javiFace, lanyard, neon, fmt, S_, INK, PAPER, MANILA, RED, AMBER, NEON, STAFF, USER, talkNow } from './director.js';
const { W, H, R, P, C, O, L, OL, guy } = K;

// ---------- cast ----------
const JENSEN = { top: 'jacket', color: '#1d1d20', legs: '#26262a', shoes: '#111', hair: 'side', hairColor: '#4a4a4e' };
const JENSEN_KID = { top: 'shirt', color: '#5a8ab0', legs: '#3a3f4a', shoes: '#222', hair: 'side', hairColor: '#1e1a18', kid: true };
const JENSEN_TEEN = { top: 'shirt', color: '#f2efe6', legs: '#3a3f4a', shoes: '#222', hair: 'side', hairColor: '#1e1a18' };
const ENG1 = { top: 'shirt', color: '#8a6a4a', legs: '#3a3f4a', shoes: '#222', hair: 'messy', hairColor: '#6a4a2a', face: 'glasses' };
const ENG2 = { top: 'sweater', color: '#4a6a8a', legs: '#3a3f4a', shoes: '#222', hair: 'side', hairColor: '#2a2a2a' };
const BOARD = (c, h, hc) => ({ top: 'suit', color: c, color2: '#2a2a3a', legs: c, shoes: '#111', hair: h, hairColor: hc });
const KRESS = { top: 'suit', color: '#3a3a4a', color2: '#c8261e', legs: '#3a3a4a', shoes: '#111', hair: 'bun', hairColor: '#d8c08a' };

// ---------- props ----------
function flag(g, x, y, w, kind) {
  const h = w * 0.66; g.save(); g.translate(x, y);
  if (kind === 'us') { for (let i = 0; i < 7; i++) R(g, -w / 2, -h / 2 + i * h / 7, w, h / 7, i % 2 ? '#fff' : '#b22234', 0); R(g, -w / 2, -h / 2, w * 0.42, h * 0.54, '#3c3b6e', 0); for (let i = 0; i < 12; i++) C(g, -w / 2 + 12 + (i % 4) * w * 0.1, -h / 2 + 12 + Math.floor(i / 4) * h * 0.16, 4, '#fff', 0); }
  if (kind === 'cn') { R(g, -w / 2, -h / 2, w, h, '#de2910', 0); star(g, -w * 0.3, -h * 0.22, w * 0.11, '#ffde00'); for (let i = 0; i < 4; i++) star(g, -w * 0.12 + (i % 2) * w * 0.04, -h * 0.38 + i * h * 0.1, w * 0.035, '#ffde00'); }
  if (kind === 'sg') { R(g, -w / 2, -h / 2, w, h / 2, '#ef3340', 0); R(g, -w / 2, 0, w, h / 2, '#fff', 0); C(g, -w * 0.3, -h * 0.25, h * 0.17, '#fff', 0); C(g, -w * 0.26, -h * 0.25, h * 0.15, '#ef3340', 0); for (let i = 0; i < 5; i++) star(g, -w * 0.16 + Math.cos(i * 1.256) * h * 0.09, -h * 0.25 + Math.sin(i * 1.256) * h * 0.09, h * 0.03, '#fff'); }
  if (kind === 'tw') { R(g, -w / 2, -h / 2, w, h, '#2f6a3a', 0); }
  g.strokeStyle = OL; g.lineWidth = 5; g.strokeRect(-w / 2, -h / 2, w, h); g.restore();
}
function star(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
function chip(g, x, y, s, t, glow = true) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (glow) neon(g, () => R(g, -120, -120, 240, 240, '#1b2a22', 6, 18), NEON, 30 + 10 * Math.sin(t * 3)); else R(g, -120, -120, 240, 240, '#1b2a22', 6, 18);
  for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { R(g, -100 + i * 38, sd * 120 - (sd > 0 ? 0 : 22), 14, 22, '#c9a23a', 2); R(g, sd * 120 - (sd > 0 ? 0 : 22), -100 + i * 38, 22, 14, '#c9a23a', 2); }
  R(g, -70, -70, 140, 140, '#2c3e34', 3, 8); BB(g, 'GPU', 0, 4, 70, NEON, { stroke: 0 }); g.restore();
}
function silhouetteWoman(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0a0a0c'; g.beginPath(); g.arc(0, -150, 52, 0, Math.PI * 2); g.fill(); P(g, [[-70, -95], [70, -95], [100, 120], [-100, 120]], '#0a0a0c', 0); g.beginPath(); g.ellipse(0, -170, 70, 60, 0, Math.PI, 0); g.fill(); P(g, [[-60, -170], [-80, -60], [-40, -100]], '#0a0a0c', 0); P(g, [[60, -170], [80, -60], [40, -100]], '#0a0a0c', 0); g.restore(); }
function newspaper(g, x, y, s, rot, mast, head, sub) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); R(g, -400, -270, 800, 540, '#f3efe4', 6, 4); EL(g, mast, 0, -215, 52, INK); R(g, -370, -180, 740, 4, INK, 0);
  const words = head.split('|'); words.forEach((w, i) => AT(g, w, 0, -120 + i * 72, 62, INK, { stroke: 0 })); if (sub) EL(g, sub, 0, 40 + (words.length - 2) * 30, 30, '#555');
  for (let i = 0; i < 5; i++) { R(g, -370, 100 + i * 30, 340, 10, '#c9c2b2', 0, 5); R(g, 30, 100 + i * 30, 340, 10, '#c9c2b2', 0, 5); } g.restore();
}
const label = (g, t, str, x, y, at, size = 56, col = AMBER) => { const s = S_(t, at); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); AT(g, str, 0, 0, size, col); g.restore(); };
const pin = (g, t, x, y, at, col = '#ff4a3a') => { const s = S_(t, at); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); C(g, 0, -60, 30, col, 5); P(g, [[-22, -45], [22, -45], [0, 0]], col, 0); C(g, 0, -60, 11, '#fff', 0); g.restore(); };

Object.assign(S, {
  // 0-3: "you were told… right?"
  nvHook(g, t, d, p) {
    bgDesk(g); newspaper(g, W / 2 - 330, 470, 0.95, -0.05, 'TITULARES', 'EL JEFE DE NVIDIA|CAE POR UNA|ESPÍA CHINA');
    phoneUI(g, 1420, 560, 1.15, (s) => { s.fillStyle = '#1d1d24'; s.fillRect(-140, -290, 280, 580); for (let i = 0; i < 4; i++) { R(s, -125, -240 + i * 120, 250, 100, '#2c2c36', 0, 12); AT(s, ['¡ESPÍA!', 'ESCÁNDALO', 'NVIDIA', '¿CHINA?'][i], 0, -190 + i * 120, 40, '#fff', { stroke: 0 }); } }, { bg: '#1d1d24' });
    if (p.q != null) stamp(g, t, '¿VERDAD?', W / 2, 860, p.q, { size: 90, col: AMBER, fill: '#140f0d' });
    if (p.no != null) stamp(g, t, 'SIN DEMOSTRAR', W / 2 + 40, 220, p.no, { size: 80, rot: 0.06, fill: '#140f0d' });
  },
  // 4-7: market opens, NVDA crashes
  stockOpen(g, t, d, p) {
    g.fillStyle = '#05080c'; g.fillRect(-W, -H, W * 3, H * 3);
    R(g, 120, 120, W - 240, 280, '#0b1016', 6, 10); const tick = 'NVDA ▼ 13,2 %    AAPL ▲ 0,4 %    MSFT ▼ 0,9 %    NVDA ▼ 13,2 %    TSLA ▲ 1,1 %    NVDA ▼ 13,2 %    ';
    g.save(); g.beginPath(); g.rect(140, 140, W - 280, 240); g.clip(); const off = (t * 260) % 1400; BB(g, tick + tick, 140 - off + 1500, 270, 120, '#ff4a3a', { stroke: 0, align: 'left' }); g.restore();
    const k = clamp((t - 0.6) / 3); g.strokeStyle = '#ff4a3a'; g.lineWidth = 10; g.lineJoin = 'round'; g.beginPath(); const r = rng(3); let y = 520; for (let i = 0; i <= 40 * k; i++) { y += i < 6 ? (r() - 0.6) * 10 : 12 + r() * 14; i ? g.lineTo(200 + i * 38, y) : g.moveTo(200, y); } g.stroke();
    clockFace(g, 1640, 680, 130, 9, 30, 'NUEVA YORK', '9:30');
    if (p.lbl != null) neon(g, () => BB(g, '−13 %', 760, 900, 200, '#ff6a5a', { stroke: 0, alpha: clamp((t - p.lbl) / 0.3) }), '#ff4a3a', 30);
  },
  // 8-10: one-line statement
  pressRelease(g, t, d, p) {
    bgDesk(g); g.save(); g.translate(W / 2, 540); g.rotate(-0.015); R(g, -520, -400, 1040, 800, '#f6f3ea', 6, 6); AT(g, 'NVIDIA · COMUNICADO', 0, -320, 56, INK, { stroke: 0 });
    const lines = ['Jensen Huang ha renunciado como', 'director ejecutivo, presidente', 'y miembro del consejo.']; lines.forEach((l, i) => { const k = clamp((t - 0.6 - i * 0.6) / 0.6); EL(g, l.slice(0, Math.ceil(l.length * k)), -440, -190 + i * 80, 50, INK, { align: 'left' }); }); g.restore();
    if (p.years != null) stamp(g, t, '33 AÑOS', 640, 860, p.years, { size: 80 });
    if (p.now != null) stamp(g, t, 'CON EFECTO INMEDIATO', W / 2 + 200, 980, p.now, { size: 54, rot: 0.03, fill: '#140f0d' });
  },
  // 11-13: no defect, no crisis... a question
  noCrisis(g, t, d, p) {
    bgArchive(g); [['PRODUCTO DEFECTUOSO', p.a ?? 0.2], ['CRISIS ECONÓMICA', p.b ?? 99]].forEach(([s, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(560 + i * 800, 360); g.scale(k, k); R(g, -330, -80, 660, 160, PAPER, 6, 16); AT(g, s, 0, 4, 56, INK, { stroke: 0 }); g.restore(); xMark(g, 560 + i * 800, 360, 70, clamp((t - at - 0.3) / 0.3)); });
    if (p.q != null) { const k = S_(t, p.q, 0.5); if (k > 0) { g.save(); g.translate(W / 2, 760); g.scale(k, k); AT(g, '¿QUIÉN ERA LA MUJER', 0, -40, 84, AMBER); AT(g, 'QUE VIAJABA EN SU COCHE?', 0, 60, 84, AMBER); g.restore(); } }
  },
  // chapter card
  chapter(g, t, d, p) {
    bgDesk(g); g.save(); g.translate(W / 2, 560); g.rotate(-0.02); P(g, [[-620, -300], [-300, -300], [-260, -360], [-60, -360], [-20, -300], [620, -300], [620, 320], [-620, 320]], MANILA, 7);
    EL(g, 'CAPÍTULO ' + p.n, 0, -170, 70, '#5a4632'); const k = S_(t, 0.3, 0.5); g.scale(k, k); g.font = '110px "Anton"'; const tw = g.measureText(p.title).width; const fs = Math.min(110, 110 * 1080 / Math.max(1, tw)); AT(g, p.title, 0, 30, fs, INK, { stroke: 0 }); g.restore(); stamp(g, t, 'EXPEDIENTE 002', W / 2 + 380, 820, 0.8, { size: 46 });
  },
  // 25-28: Taiwan -> Kentucky
  journey(g, t, d, p) {
    bgMap(g, t); const TW = [1545, 445], KY = [470, 345]; label(g, t, 'TAIWÁN · 1963', TW[0] - 40, TW[1] + 70, 0.3, 50, PAPER); pin(g, t, ...TW, 0.2, AMBER);
    const k = clamp((t - (p.fly ?? 1.5)) / 2.2); if (k > 0) { g.save(); g.strokeStyle = AMBER; g.lineWidth = 7; g.setLineDash([18, 14]); g.beginPath(); for (let i = 0; i <= 40 * k; i++) { const q = i / 40; const x = lerp(TW[0], KY[0], q), y = lerp(TW[1], KY[1], q) - Math.sin(q * Math.PI) * 260; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); }
    if (k >= 1) { pin(g, t, ...KY, (p.fly ?? 1.5) + 2.2, AMBER); label(g, t, 'KENTUCKY, EE. UU.', KY[0] + 40, KY[1] + 70, (p.fly ?? 1.5) + 2.4, 50, PAPER); }
    if (p.kid != null && t > p.kid) { guy(g, t, JENSEN_KID, 1380, 1000, { s: 1.6, pose: 'sad', expr: 'sad' }); label(g, t, '9 AÑOS', 1380, 620, p.kid + 0.3, 50); }
  },
  // 29-33: diner (dishes) -> booth with 2 friends
  diner(g, t, d, p) {
    g.fillStyle = '#c94a3a'; g.fillRect(-W, -H, W * 3, H * 3); for (let i = 0; i < 24; i++) R(g, i * 90 - 40, 0, 44, 520, '#d85a48', 0); R(g, -100, 520, W + 200, 600, '#2a2a2a', 0); for (let i = 0; i < 30; i++) for (let j = 0; j < 8; j++) R(g, i * 70 - 40 + (j % 2) * 35, 520 + j * 70, 35, 35, (i + j) % 2 ? '#e8e2d0' : '#1a1a1a', 0);
    R(g, 220, 160, 520, 220, '#9fd8ff', 6, 10); AT(g, 'DINER', 480, 110, 70, '#ffe14a', { stroke: 8 });
    if (!p.booth) { R(g, 900, 640, 700, 60, '#c0c4c8', 6, 6); for (let i = 0; i < 5; i++) O(g, 1050 + i * 50, 620 - i * 14, 70, 16, '#fff', 4); guy(g, t, JENSEN_TEEN, 1250, 1060, { s: 1.6, pose: 'holdFront', expr: 'neutral' }); label(g, t, 'LAVANDO PLATOS', 1250, 260, 0.5, 60, '#fff'); }
    else { R(g, 520, 700, 880, 50, '#f2ecdc', 6, 10); R(g, 460, 560, 80, 380, '#8a1f1f', 6, 20); R(g, 1380, 560, 80, 380, '#8a1f1f', 6, 20);
      guy(g, t, ENG1, 700, 1040, { s: 1.4, pose: 'sit', expr: 'smile' }); guy(g, t, { ...JENSEN, color: '#4a5a6a', hairColor: '#1e1a18' }, 960, 1040, { s: 1.5, pose: 'sit', expr: 'happy' }); guy(g, t, ENG2, 1220, 1040, { s: 1.4, pose: 'sit', expr: 'smile', f: -1 });
      const k = S_(t, p.napkin ?? 99); if (k > 0) { g.save(); g.translate(960, 660); g.rotate(-0.05); g.scale(k, k); R(g, -170, -70, 340, 140, '#fff', 4, 4); EL(g, 'NVIDIA · 1993', 0, 4, 46, INK); g.restore(); } }
  },
  // 36-38: the man in the leather jacket
  jensenStage(g, t, d, p) {
    g.fillStyle = '#07080c'; g.fillRect(-W, -H, W * 3, H * 3); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(W / 2, 200, 20, W / 2, 700, 700); gr.addColorStop(0, 'rgba(120,200,255,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(-W, -H, W * 3, H * 3); g.restore();
    R(g, 260, 60, W - 520, 300, '#0d1a14', 6, 10); chip(g, W / 2 - 520, 210, 0.75, t); BB(g, 'IA · GPU · FUTURO', W / 2 + 120, 215, 110, NEON, { stroke: 0 });
    R(g, -100, 960, W + 200, 300, '#1a1a1e', 0); guy(g, t, JENSEN, W / 2, 1075, { s: 1.95, pose: p.pose || 'explain', expr: 'happy' });
    for (let i = 0; i < 22; i++) { const x = 60 + i * 88; C(g, x, 1070 + (i % 3) * 12, 46, '#0b0b0e', 0); if (Math.sin(t * 9 + i * 7) > 0.97) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(x - 10, 990, 20, 14); } }
    if (p.lbl) label(g, t, p.lbl, W / 2, 420, p.lblAt || 0.4, 60, AMBER);
  },
  // 42-47: one reader vs an army of readers
  readers(g, t, d, p) {
    bgOffice(g, t); const split = p.army != null && t > p.army;
    R(g, W / 2 - 4, 140, 8, 800, OL, 0); AT(g, 'PROCESADOR NORMAL', 480, 140, 52, INK, { stroke: 0 }); guy(g, t, STAFF('#8a8a9a', 'side', '#333'), 480, 980, { s: 1.4, pose: 'holdFront', expr: 'sleepy' }); for (let i = 0; i < 6; i++) R(g, 160 + i * 18, 760 - i * 40, 120, 34, ['#c0392b', '#3f8fb0', '#e8a33a'][i % 3], 4, 3);
    if (split) { AT(g, 'CHIP DE NVIDIA', 1440, 140, 52, '#1f7a3a', { stroke: 0 }); const n = Math.min(40, Math.floor((t - p.army) * 30)); for (let i = 0; i < n; i++) { const x = 1040 + (i % 10) * 85, y = 520 + Math.floor(i / 10) * 140; guy(g, t, USER(['#c0392b', '#3f8fb0', '#e8a33a', '#5a8a5a'][i % 4], ['side', 'bun', 'messy', 'curly'][i % 4]), x, y + 120, { s: 0.55, pose: 'holdFront', expr: 'happy', seed: i }); } }
  },
  // 48-51: worth more than countries
  valuation(g, t, d, p) {
    bgArchive(g); const k = ease.out(clamp((t - 0.4) / 1.4)); const bars = [['NVIDIA', 1, '#39ff9c'], ['ESPAÑA', 0.29, '#c8a03a'], ['ARGENTINA', 0.11, '#7ab0d8'], ['CHILE', 0.06, '#d84a3a']];
    bars.forEach(([n, v, c], i) => { const x = 360 + i * 380, h = 640 * v * k; R(g, x - 110, 900 - h, 220, h, c, 6, 8); AT(g, n, x, 960, 48, PAPER); });
    neon(g, () => BB(g, '≈ 5,8 BILLONES $', 360, 900 - 640 * k - 60, 70, NEON, { stroke: 0, alpha: k }), NEON, 25);
    EL(g, '(valor en bolsa vs. lo que produce cada país en un año, aprox.)', W / 2, 1040, 30, '#bbb');
  },
  // 54-57: the S&P 500 basket & your pension
  basket(g, t, d, p) {
    bgArchive(g); g.save(); g.translate(720, 640); P(g, [[-380, -120], [380, -120], [320, 240], [-320, 240]], '#8a5a34', 7); for (let i = 0; i < 6; i++) L(g, [[-360 + i * 140, -120], [-300 + i * 120, 240]], 5, '#5a3a24'); g.restore();
    const r = rng(2); for (let i = 0; i < 70; i++) C(g, 400 + r() * 640, 420 + r() * 120 - (i % 3) * 20, 22, ['#7ab0d8', '#d8a04a', '#c0392b', '#8ab060', '#b07ad8'][i % 5], 3);
    const k = S_(t, p.nv ?? 0.6); if (k > 0) { g.save(); g.translate(720, 430); g.scale(k, k); chip(g, 0, 0, 0.55, t); g.restore(); label(g, t, '≈ 8 %', 720, 270, (p.nv ?? 0.6) + 0.2, 90, NEON); }
    AT(g, 'S&P 500', 720, 140, 80, PAPER);
    if (p.pig != null) { const s2 = S_(t, p.pig); if (s2 > 0) { g.save(); g.translate(1500, 640); g.scale(s2, s2); O(g, 0, 0, 230, 170, '#f29ab0', 7); C(g, 190, -20, 60, '#f29ab0', 7); C(g, 210, -30, 10, OL, 0); R(g, -40, -180, 90, 16, OL, 0, 6); chip(g, -20, -10, 0.38, t, false); AT(g, 'TU PLAN DE PENSIONES', 0, 260, 50, AMBER); g.restore(); } }
  },
  // 59-61: chip war
  chipWar(g, t, d, p) {
    bgMap(g, t); flag(g, 420, 300, 220, 'us'); flag(g, 1420, 300, 220, 'cn'); chip(g, W / 2 + Math.sin(t * 2) * 60, 560, 0.8, t);
    g.strokeStyle = '#c9a874'; g.lineWidth = 14; g.beginPath(); g.moveTo(520, 560); g.lineTo(W / 2 - 100 + Math.sin(t * 2) * 60, 560); g.moveTo(W / 2 + 100 + Math.sin(t * 2) * 60, 560); g.lineTo(1320, 560); g.stroke();
    AT(g, 'LA CARRERA DE LA IA', W / 2, 150, 76, PAPER);
    if (p.limit != null) stamp(g, t, 'OCT 2022 · RESTRICCIONES', W / 2, 860, p.limit, { size: 64 });
  },
  // 66-70: company renames itself
  rename(g, t, d, p) {
    bgOffice(g, t); g.save(); g.translate(W / 2, 720); R(g, -420, -380, 840, 380, '#d8d2c4', 6); for (let i = 0; i < 4; i++) R(g, -360 + i * 190, -300, 120, 160, '#9fc6d8', 4); R(g, -460, -470, 920, 110, '#2a2f3a', 6, 8);
    const sw = p.swap != null && t > p.swap; const k = sw ? clamp((t - p.swap) / 0.5) : 0;
    AT(g, 'SEVEN ROAD INTERNATIONAL', 0, -415, 54, '#fff', { stroke: 0, alpha: 1 - k }); if (sw) neon(g, () => AT(g, 'MEGASPEED', 0, -415, 76, NEON, { stroke: 0, alpha: k }), NEON, 20); g.restore();
    flag(g, 1640, 220, 180, 'sg'); label(g, t, 'SINGAPUR', 1640, 360, 0.3, 46, PAPER);
    if (p.year) label(g, t, p.year, 330, 220, 0.4, 70, AMBER);
    if (p.grow != null) { const k2 = clamp((t - p.grow) / 1.5); g.strokeStyle = NEON; g.lineWidth = 10; g.beginPath(); g.moveTo(140, 960); g.quadraticCurveTo(300, 960, 140 + 360 * k2, 960 - 380 * k2 * k2); g.stroke(); }
  },
  // 71-72: compute cloud rented out
  cloud(g, t, d, p) {
    bgCyber(g, t); for (let i = 0; i < 4; i++) server(g, 300 + i * 220, 1000, 0.9, t, { seed: i });
    g.save(); g.translate(1450, 380); O(g, 0, 0, 260, 120, '#e8eef2', 6); O(g, -150, 30, 120, 90, '#e8eef2', 6); O(g, 160, 30, 130, 90, '#e8eef2', 6); AT(g, 'NUBE', 0, 10, 70, INK, { stroke: 0 }); g.restore();
    for (let i = 0; i < 3; i++) { const k = S_(t, (p.clients ?? 1) + i * 0.5); if (k <= 0) continue; g.save(); g.translate(1250 + i * 230, 840); g.scale(k, k); R(g, -80, -150, 160, 220, '#3a4356', 5); flag(g, 0, -190, 90, 'cn'); g.restore(); }
    for (let j = 0; j < 4; j++) { const q = (t * 0.6 + j / 4) % 1; coin(g, lerp(800, 1450, q), lerp(700, 420, q) , 26, '$', '#3fae7a'); }
    AT(g, 'SE ALQUILA POTENCIA', W / 2, 120, 70, AMBER);
  },
  // 73-74: changed owner -> partner 4 days later
  fourDays(g, t, d, p) {
    bgDesk(g); calendar(g, 520, 540, 1.1, 'OTOÑO', 'D', { rot: -0.04, year: '2023' }); AT(g, '+ 4 DÍAS', W / 2, 540, 100, AMBER);
    const k = S_(t, p.badge ?? 1.6, 0.5); if (k > 0) { g.save(); g.translate(1420, 540); g.scale(k, k); neon(g, () => R(g, -320, -150, 640, 300, '#0d1a14', 6, 20), NEON, 30); AT(g, 'SOCIO OFICIAL', 0, -50, 66, NEON, { stroke: 0 }); AT(g, 'NUBE DE NVIDIA', 0, 40, 66, '#fff', { stroke: 0 }); g.restore(); }
  },
  // 76-79: "Singapore washing"
  washing(g, t, d, p) {
    bgOffice(g, t); g.save(); g.translate(W / 2, 640); R(g, -260, -300, 520, 600, '#e8e8ec', 7, 30); C(g, 0, 20, 190, '#9fc6d8', 8); C(g, 0, 20, 150, '#bfe6ff', 0);
    const rot = t * 4; for (let i = 0; i < 6; i++) O(g, Math.cos(rot + i) * 80, 20 + Math.sin(rot + i) * 80, 30, 18, 'rgba(255,255,255,.8)', 0); AT(g, 'LAVADO', 0, -250, 50, INK, { stroke: 0 }); g.restore();
    const k = clamp((t - 0.5) / 1.4); g.save(); g.translate(lerp(240, W / 2, Math.min(1, k * 1.4)), 720); if (k < 0.7) { R(g, -110, -90, 220, 180, '#c9a874', 6, 8); flag(g, 0, -10, 110, 'cn'); } g.restore();
    if (t > 0.5 + 1.4) { g.save(); g.translate(lerp(W / 2, 1640, clamp((t - 1.9) / 1.2)), 720); R(g, -110, -90, 220, 180, '#c9a874', 6, 8); flag(g, 0, -10, 110, 'sg'); g.restore(); }
    AT(g, 'EL «LAVADO DE SINGAPUR»', W / 2, 120, 76, AMBER);
    if (p.q != null) label(g, t, '¿Y SI SE ALQUILA DESDE FUERA?', W / 2, 1000, p.q, 64, PAPER);
  },
  // investigation file on Megaspeed + A.H.
  probe(g, t, d, p) {
    bgDesk(g); g.save(); g.translate(760, 560); g.rotate(-0.02); R(g, -520, -400, 1040, 800, MANILA, 6, 10); R(g, -480, -360, 960, 720, PAPER, 4, 4);
    AT(g, p.head || 'DEPARTAMENTO DE COMERCIO', -430, -300, 46, INK, { stroke: 0, align: 'left' }); (p.lines || []).forEach(([str, at, col], i) => { const k = clamp((t - at) / 0.5); EL(g, str.slice(0, Math.ceil(str.length * k)), -430, -190 + i * 90, 48, col || INK, { align: 'left' }); }); g.restore();
    if (p.ah != null) { const k = S_(t, p.ah); if (k > 0) { g.save(); g.translate(1520, 560); g.scale(k, k); R(g, -230, -300, 460, 560, '#f6f3ea', 6, 6); silhouetteWoman(g, 0, 60, 1.1); AT(g, '?', 0, -120, 120, AMBER); EL(g, 'ALICE HUANG', 0, 210, 40, INK); g.restore(); } }
    if (p.notf != null) stamp(g, t, 'NO SON FAMILIA', 1520, 900, p.notf, { size: 50 });
  },
  // 88-91: the car
  car(g, t, d, p) {
    const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#0d1424'); sk.addColorStop(1, '#2a2f3a'); g.fillStyle = sk; g.fillRect(-W, -H, W * 3, H * 3);
    for (let i = 0; i < 12; i++) { const x = ((i * 260 - t * 220) % (W + 300)) + W; const xx = x > W + 150 ? x - W - 300 : x; R(g, xx, 260 + (i % 3) * 40, 120, 400, '#1a2234', 0); for (let j = 0; j < 8; j++) if ((i * 3 + j) % 4) R(g, xx + 20 + (j % 2) * 50, 300 + Math.floor(j / 2) * 70, 24, 30, '#ffd98a', 0); }
    R(g, -100, 800, W + 200, 400, '#1a1a1e', 0); K.car(g, W / 2, 900, 1.8, 1, { color: '#121216' });
    g.save(); g.beginPath(); g.rect(W / 2 - 180, 900 - 1.8 * 186, 330, 1.8 * 58); g.clip(); C(g, W / 2 - 80, 900 - 1.8 * 150, 40, '#050507', 0); C(g, W / 2 + 60, 900 - 1.8 * 150, 38, '#050507', 0); g.restore();
    (p.dates || []).forEach(([str, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(340 + i * 1240, 220); g.rotate(i ? 0.05 : -0.05); g.scale(k, k); R(g, -170, -120, 340, 240, '#f6f3ea', 5, 4); R(g, -150, -100, 300, 150, '#2a3040', 0); EL(g, str, 0, 85, 40, INK); g.restore(); });
  },
  // 93-95: the lawyer's call, refused, case goes criminal
  lawyer(g, t, d, p) {
    bgOffice(g, t); phoneUI(g, 520, 560, 1.3, (s) => { s.fillStyle = '#1d1d24'; s.fillRect(-140, -290, 280, 580); AT(s, 'LLAMADA', 0, -170, 34, '#aaa', { stroke: 0 }); AT(s, 'Abogado', 0, -100, 40, '#fff', { stroke: 0 }); AT(s, 'de Nvidia', 0, -50, 40, '#fff', { stroke: 0 }); C(s, 0, 150, 50, '#2ecc71', 0); }, { bg: '#1d1d24' });
    bubble(g, t, 800, 360, '¿Podemos reunirnos?', 0.5, { size: 46, max: 700 });
    if (p.no != null) stamp(g, t, 'NO', 1150, 560, p.no, { size: 130, rot: -0.1 });
    if (p.move != null) { const k = ease.inOut(clamp((t - p.move) / 1.2)); g.save(); g.translate(lerp(1150, 1560, k), 820); g.rotate(-0.05); R(g, -220, -140, 440, 280, MANILA, 6, 8); EL(g, k < 0.5 ? 'COMERCIO' : 'JUSTICIA', 0, -40, 52, INK); EL(g, 'Megaspeed', 0, 30, 40, '#555'); g.restore(); if (k >= 1) stamp(g, t, 'INVESTIGACIÓN PENAL', 1560, 1010, p.move + 1.3, { size: 46 }); }
  },
  // 97-99: classified memo + trip to China
  memo(g, t, d, p) {
    bgDesk(g); g.save(); g.translate(700, 540); g.rotate(-0.03); R(g, -420, -420, 840, 840, '#f6f3ea', 6, 4); AT(g, 'MEMORÁNDUM', 0, -330, 64, INK, { stroke: 0 }); for (let i = 0; i < 9; i++) R(g, -340, -220 + i * 60, 600 + (i * 37) % 80, 26, i % 3 === 1 ? '#111' : '#c9c2b2', 0, 6); g.restore();
    stamp(g, t, 'CLASIFICADO', 700, 540, 0.5, { size: 90, rot: -0.2 });
    if (p.trip != null) { const k = S_(t, p.trip); if (k > 0) { g.save(); g.translate(1500, 540); g.scale(k, k); flag(g, -110, -120, 160, 'us'); flag(g, 110, -120, 160, 'cn'); AT(g, 'VIAJE A CHINA', 0, 60, 60, AMBER); AT(g, 'MAYO 2026', 0, 140, 56, PAPER); g.restore(); } }
  },
  // 107-116: newspapers
  papers(g, t, d, p) {
    bgDesk(g); const items = p.items || []; items.forEach(([mast, head, at], i) => { const k = S_(t, at, 0.5); if (k <= 0) return; newspaper(g, items.length === 1 ? W / 2 : 600 + i * 720, 540 + (i % 2) * 40, (items.length === 1 ? 1.25 : 1.0) * k, (i ? 0.04 : -0.04), mast, head); });
    if (p.unc != null) unconfirmed(g, t, p.unc, 'FUENTES ANÓNIMAS');
  },
  // 116-117: the MSS
  mss(g, t, d, p) {
    bgMap(g, t); flag(g, 1400, 280, 200, 'cn'); g.save(); g.translate(W / 2 - 200, 640); R(g, -360, -260, 720, 360, '#3a3f4a', 6); for (let i = 0; i < 6; i++) R(g, -320 + i * 120, -200, 60, 240, '#2a2e36', 3); P(g, [[-400, -260], [0, -400], [400, -260]], '#4a4f5a', 6); g.restore();
    AT(g, 'MINISTERIO DE SEGURIDAD', W / 2 - 200, 900, 60, PAPER); AT(g, 'DEL ESTADO (CHINA)', W / 2 - 200, 970, 48, AMBER);
  },
  // 118-127: why spy on a CEO / honey trap
  whySpy(g, t, d, p) {
    bgArchive(g); toonBigFace(g, 480, 620, 230, { outfit: JENSEN, expr: 'thinking', blink: K.blinkAt(t, 3.4), t });
    (p.thoughts || []).forEach(([str, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(1300, 300 + i * 220); g.scale(k, k); O(g, 0, 0, 420, 90, '#fff', 5); AT(g, str, 0, 2, 54, INK, { stroke: 0 }); g.restore(); });
    if (p.honey != null) { const k = S_(t, p.honey, 0.5); if (k > 0) { g.save(); g.translate(1300, 620); g.scale(k, k); P(g, [[-150, -160], [150, -160], [190, 200], [-190, 200]], '#e8a33a', 7); R(g, -170, -220, 340, 70, '#8a5a34', 6, 12); AT(g, 'MIEL', 0, 40, 90, '#7a4a10', { stroke: 0 }); g.restore(); label(g, t, 'LA TRAMPA DE MIEL', 1300, 950, p.honey + 0.4, 70, AMBER); } }
  },
  // 133-137: comment vote
  vote(g, t, d, p) {
    bgArchive(g); javiFace(g, t, p, 420, 620, 220); lanyard(g, 420, 620, 210);
    AT(g, 'ESCRIBE EN LOS COMENTARIOS', 1260, 160, 64, PAPER);
    [['ESPÍA', '🕵️', '#c8261e', p.a ?? 0.6], ['ESCÁNDALO', '💔', '#3f6fa8', p.b ?? 1.4]].forEach(([w, e, c, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(1260, 400 + i * 260); g.scale(k * (1 + 0.03 * Math.sin(t * 4 + i)), k); R(g, -340, -100, 680, 200, c, 7, 40); g.font = '110px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, -220, 4); AT(g, w, 80, 4, 96, '#fff'); g.restore(); });
    if (p.one != null) label(g, t, 'SOLO UNA PALABRA 👇', 1260, 960, p.one, 56, AMBER);
  },
  // day card for the 7 days
  day(g, t, d, p) {
    bgDesk(g); calendar(g, 360, 520, 1.1, p.month || 'NOVIEMBRE', p.dayN, { rot: -0.04 }); AT(g, p.dayName, 360, 870, 60, PAPER);
    const k = S_(t, 0.3); if (k <= 0) return; g.save(); g.translate(1200, 540);
    if (p.kind === 'email') { laptop(g, 0, 300, 1.6, (s) => { s.fillStyle = '#f4f1e8'; s.fillRect(-240, -150, 480, 300); R(s, -230, -140, 460, 40, '#2a5bd7', 0); AT(s, 'Para: todos los empleados', -210, -120, 20, '#fff', { stroke: 0, align: 'left' }); for (let i = 0; i < 6; i++) R(s, -210, -70 + i * 32, 380 - (i * 41) % 120, 12, '#bbb', 0, 6); }); if (p.adm != null) stamp(g, t, '«FUI INFIEL»', 0, -320, p.adm, { size: 70 }); }
    if (p.kind === 'board') { R(g, -560, 100, 1120, 50, '#5a3a24', 5); for (let i = 0; i < 5; i++) guy(g, t, BOARD(['#2a2f3a', '#3a2f2a', '#2f3a2a', '#3a3a44', '#2a2a2f'][i], i % 2 ? 'bun' : 'side', ['#888', '#d8c08a', '#333', '#aaa', '#5a3a24'][i]), -440 + i * 220, 300, { s: 1.0, pose: 'sit', expr: 'worried', seed: i }); stamp(g, t, 'INVESTIGACIÓN INDEPENDIENTE', 0, -280, 0.8, { size: 54 }); }
    if (p.kind === 'call') { phoneUI(g, -220, 0, 1.1, (s) => { s.fillStyle = '#1d1d24'; s.fillRect(-140, -290, 280, 580); AT(s, 'LLAMADA', 0, -150, 34, '#aaa', { stroke: 0 }); AT(s, 'Casa Blanca', 0, -80, 40, '#fff', { stroke: 0 }); }, { bg: '#1d1d24' }); bubble(g, t, -20, -250, '«Pelea por tu puesto»', 0.8, { size: 44, max: 640 }); }
    if (p.kind === 'paper') newspaper(g, 0, 0, 0.85, 0.03, p.mast || 'PRENSA', p.head || 'OTRA RELACIÓN|DENTRO DE|NVIDIA');
    g.restore();
  },
  // interim CEO + lawsuit
  aftermath(g, t, d, p) {
    bgOffice(g, t); guy(g, t, KRESS, 560, 1040, { s: 1.6, pose: 'explain', expr: 'neutral' }); label(g, t, 'CEO INTERINA', 560, 320, 0.4, 60, AMBER); EL(g, 'Colette Kress', 560, 400, 40, PAPER);
    if (p.suit != null) { const k = S_(t, p.suit); if (k > 0) { g.save(); g.translate(1400, 560); g.scale(k, k); R(g, -320, -260, 640, 520, '#f6f3ea', 6, 6); AT(g, 'DEMANDA COLECTIVA', 0, -180, 56, INK, { stroke: 0 }); EL(g, 'Inversores vs. Nvidia', 0, -100, 40, '#555'); g.save(); g.translate(120, 120); g.rotate(-0.6); R(g, -30, -150, 60, 220, '#8a5a34', 5, 6); R(g, -110, -190, 220, 80, '#6a4a2a', 5, 10); g.restore(); g.restore(); } }
  },
  // market close
  closeBell(g, t, d, p) {
    g.fillStyle = '#0d1117'; g.fillRect(-W, -H, W * 3, H * 3); const r = rng(11); g.strokeStyle = '#ff4a3a'; g.lineWidth = 9; g.beginPath(); let y = 260; const k = clamp(t / (d * 0.6));
    for (let i = 0; i <= 60 * k; i++) { y += i < 8 ? 40 : (r() - 0.62) * 22; const x = 120 + i * 28; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    BB(g, 'APERTURA −13 %', 1500, 260, 80, '#ff6a5a', { stroke: 0 }); if (t > (p.close ?? 2)) BB(g, 'CIERRE ≈ −4 %', 1500, 380, 80, '#ffb36a', { stroke: 0 });
    if (p.total != null) { const s = S_(t, p.total); if (s > 0) { g.save(); g.translate(W / 2, 820); g.scale(s, s); neon(g, () => BB(g, '−1,5 a −1,7 BILLONES $', 0, 0, 120, '#ff6a5a', { stroke: 0 }), '#ff4a3a', 30); EL(g, 'desde el récord de octubre', 0, 90, 40, PAPER); g.restore(); } }
  },
  // reactions as social cards (no logos, no faces)
  reactions(g, t, d, p) {
    bgArchive(g); AT(g, 'LAS REACCIONES', W / 2, 140, 76, PAPER);
    [['Casa Blanca', '«El sustituto: Tim Cook»', p.a ?? 0.4], ['Elon Musk', '«Yo lo contrato»', p.b ?? 99], ['Silicon Valley', '«Apartarlo es un error»', p.c ?? 99]].forEach(([who, txt, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(W / 2 + (i - 1) * 590, 560); g.rotate((i - 1) * 0.03); g.scale(k, k); R(g, -270, -200, 540, 400, '#fff', 6, 24); C(g, -190, -120, 44, '#c9d2dc', 4); AT(g, who, 30, -120, 40, INK, { stroke: 0 }); EL(g, txt, 0, 40, 38, INK); g.restore(); });
  },
  // Beijing denies + Singapore bans
  twoCapitals(g, t, d, p) {
    bgMap(g, t); flag(g, 1380, 260, 200, 'cn'); stamp(g, t, '«PURA INVENCIÓN»', 1380, 450, 0.5, { size: 54 });
    if (p.sg != null && t > p.sg) { flag(g, 520, 260, 200, 'sg'); stamp(g, t, 'PROHIBIDA LA ENTRADA', 520, 450, p.sg + 0.3, { size: 54 }); }
    if (p.passport != null) { const k = S_(t, p.passport); if (k > 0) { g.save(); g.translate(520, 780); g.scale(k, k); R(g, -130, -170, 260, 340, '#7a1a2a', 6, 14); AT(g, 'PASAPORTE', 0, -40, 40, '#e8c86a', { stroke: 0 }); g.restore(); if (p.free != null) stamp(g, t, 'FALTA DE PRUEBAS', 900, 820, p.free, { size: 56, col: AMBER, fill: '#140f0d' }); } }
  },
  // the twist: statements + scale
  twist(g, t, d, p) {
    bgDesk(g); [['FISCAL GENERAL', '«Ninguna conclusión»', p.a ?? 0.4], ['CNN', '«Sin pruebas de que sea espía»', p.b ?? 99]].forEach(([who, txt, at], i) => { const k = S_(t, at); if (k <= 0) return; g.save(); g.translate(560 + i * 800, 520); g.rotate(i ? 0.03 : -0.03); g.scale(k, k); R(g, -340, -230, 680, 460, '#f6f3ea', 6, 6); AT(g, who, 0, -140, 56, INK, { stroke: 0 }); EL(g, txt, 0, 10, 44, RED); g.restore(); });
    if (p.unc != null) unconfirmed(g, t, p.unc, 'NADA DEMOSTRADO');
  },
  scale2(g, t, d, p) {
    bgArchive(g); const tilt = Math.sin(t * 1.1) * 0.08; g.save(); g.translate(W / 2, 330); R(g, -14, 0, 28, 600, '#8a6a3a', 4); g.rotate(tilt); R(g, -620, -16, 1240, 32, '#c9a23a', 5, 10);
    for (const [sx, str, col] of [[-580, '¿ESPIONAJE?', '#ff6a5a'], [580, '¿DECISIONES PERSONALES?', '#9fd8ff']]) { L(g, [[sx, 0], [sx - 120, 250]], 4); L(g, [[sx, 0], [sx + 120, 250]], 4); O(g, sx, 260, 170, 30, '#c9a23a', 5); g.save(); g.translate(sx, 340); g.rotate(-tilt); AT(g, str, 0, 0, 52, col); g.restore(); }
    g.restore(); AT(g, '¿QUÉ LO HIZO CAER?', W / 2, 980, 76, AMBER);
  },
});
