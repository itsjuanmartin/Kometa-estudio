import { registerShot, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from '../_lib.js';
const { W, H, R, P, C, O, L, T, OL, guy, fala } = K;
const TOMI = K.TOMI_CASUAL;

function title(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.025);
  R(g, -360, -62, 720, 124, '#f2e94a', 8, 62);
  T(g, '¿Y SI TE TOCARA…?', 0, 4, 76, OL, { stroke: 0, spacing: 2 });
  g.restore();
}
// ---------- BANNER (2560x1440; mobile-safe area = centre 1160x317 logical) ----------
registerShot('banner', { draw(g) {
  const t = 1.2;
  K.sky(g, 'golden', t);
  // left: wheat field + soldier Tomi
  g.fillStyle = '#d9b25a'; g.fillRect(-100, 760, 760, 400); L(g, [[-100, 760], [660, 760]], 4);
  const r = rng(3); g.strokeStyle = '#a8803a'; g.lineWidth = 3; for (let i = 0; i < 90; i++) { const x = r() * 640, y = 780 + r() * 300; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y - 40); g.stroke(); }
  guy(g, t, { ...TOMI, top: 'uniform', color: '#7d7650', legs: '#6c6545', belt: '#5a3a24', hat: 'bush', hatColor: '#7a7048', hatBand: '#4e4630' }, 200, 1060, { s: 1.15, big: 1, expr: 'smirk', pose: 'crossArms' });
  // right: ocean + ship + plane
  g.fillStyle = '#4f9ac0'; g.fillRect(1300, 760, 700, 400); L(g, [[1300, 760], [2000, 760]], 4);
  K.ship(g, 1700, 840, 0.45, -1, { flag: true }); K.plane(g, 1640, 230, 0.45, t, -1);
  guy(g, t, K.TOMI, 1760, 1060, { s: 1.15, big: 1, f: -1, expr: 'determined', pose: 'crossArms' });
  K.whiteHouse(g, 980, 800, 0.62); g.fillStyle = '#8ab060'; g.fillRect(640, 800, 680, 400); L(g, [[640, 800], [1300, 800]], 4);
  R(g, 360, 370, 1200, 340, '#fff8e8', 8, 40);
  g.save(); g.beginPath(); g.roundRect(364, 374, 1192, 332, 36); g.clip(); toonBigFace(g, 540, 560, 112, { outfit: TOMI, expr: 'smile', t }); g.restore(); R(g, 360, 370, 1200, 340, null, 8, 40);
  title(g, 1060, 470, 1.0);
  T(g, 'Vive la historia desde dentro', 1060, 590, 56, OL, { stroke: 0 });
  T(g, 'Un vídeo nuevo cada semana', 1060, 650, 38, '#c0392b', { stroke: 0 });
  fala(g, t, 1440, 700, 0.55, -1);
}});
// ---------- LOGO (drawn in the centre 1080x1080 square; exported 800x800) ----------
registerShot('logo', { draw(g) {
  g.fillStyle = '#f6e7c0'; g.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  C(g, cx, cy, 540, '#f2c21a', 0);
  g.save(); g.beginPath(); g.arc(cx, cy, 520, 0, 7); g.clip();
  for (let i = 0; i < 16; i++) { g.save(); g.translate(cx, cy); g.rotate(i * Math.PI / 8); P(g, [[0, 0], [700, -70], [700, 70]], i % 2 ? '#f6d24a' : '#f2c21a', 0); g.restore(); }
  toonBigFace(g, cx, cy + 90, 300, { outfit: K.TOMI_CASUAL, expr: 'smile', look: [0.15, 0], t: 0 });
  g.restore();
  g.strokeStyle = OL; g.lineWidth = 22; g.beginPath(); g.arc(cx, cy, 520, 0, 7); g.stroke();
  // question bubble
  g.save(); g.translate(cx + 300, cy - 300); g.rotate(0.12); C(g, 0, 0, 120, '#fff8e8', 14); P(g, [[-70, 80], [-120, 160], [-20, 105]], '#fff8e8', 0); L(g, [[-70, 82], [-120, 160], [-20, 105]], 14); C(g, 0, 0, 104, '#fff8e8', 0); T(g, '?', 0, 8, 170, '#c0392b', { stroke: 0 }); g.restore();
}});
