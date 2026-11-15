import { registerShot, rng, lerp } from '/engine/core.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from '../_lib.js';
const { W, H, R, P, C, O, L, T, OL } = K;
const BIG = (g, str, x, y, size, col = '#f2e94a', rot = -0.04) => { g.save(); g.translate(x, y); g.rotate(rot); T(g, str, 0, 0, size, col, { stroke: size * 0.22, spacing: 2 }); g.restore(); };
function sea(g) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#8fd0f0'); gr.addColorStop(0.42, '#cfeaf6'); gr.addColorStop(0.42, '#3f8fc0'); gr.addColorStop(1, '#174a78'); g.fillStyle = gr; g.fillRect(0, 0, W, H); L(g, [[0, H * 0.42], [W, H * 0.42]], 5); }
function torpedo(g, x, y, s, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  for (const [w, a] of [[220, 0.35], [130, 0.6], [60, 0.95]]) { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(420, 0); g.lineTo(1500, 0); g.stroke(); }
  P(g, [[380, -55], [470, -110], [480, -90], [430, 0], [480, 90], [470, 110], [380, 55]], '#4e5a52', 6);
  R(g, -380, -78, 800, 156, '#5d6b60', 7, 20); P(g, [[-380, -78], [-520, -30], [-560, 0], [-520, 30], [-380, 78]], '#4a5650', 7); R(g, -330, -78, 60, 156, '#c0392b', 5);
  R(g, -200, -78, 26, 156, '#56625a', 4); R(g, 120, -78, 26, 156, '#56625a', 4);
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.roundRect(-260, -60, 620, 22, 11); g.fill();
  g.restore();
}
function alarmGlow(g) { const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 1.1); gr.addColorStop(0, 'rgba(220,40,30,0)'); gr.addColorStop(1, 'rgba(220,40,30,.45)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function sweat(g, x, y, s) { O(g, x, y, 22 * s, 34 * s, '#9fd8ff', 5); }

// A — Tomi en pánico + torpedo gigante + "TU PROPIO BANDO"
registerShot('A', { draw(g) {
  sea(g); K.ship(g, 1500, 455, 0.42, -1, { flag: true });
  torpedo(g, 1270, 760, 0.9, -0.12);
  alarmGlow(g);
  toonBigFace(g, 470, 640, 300, { outfit: K.TOMI, expr: 'shocked', look: [0.8, 0.1], t: 0 });
  sweat(g, 250, 420, 1.3);
  BIG(g, 'TU PROPIO', 1310, 170, 150); BIG(g, 'BANDO', 1350, 330, 190, '#ff5040');
  K.arrow(g, 1720, 470, 1600, 640, 1, '#ff5040', 16);
}});
// B — "¿QUIÉN DISPARÓ?" con el presidente en su silla en cubierta
registerShot('B', { draw(g) {
  sea(g); g.fillStyle = '#9aa2ac'; g.fillRect(0, 820, W, H); L(g, [[0, 820], [W, 820]], 5);
  torpedo(g, 1250, 640, 0.62, -0.06); alarmGlow(g);
  K.fdr(g, 0, 1650, 1110, { f: -1, expr: 'surprised', s: 1.35, big: 1 });
  toonBigFace(g, 420, 610, 270, { outfit: K.TOMI, expr: 'scared', look: [0.9, 0], t: 0 });
  BIG(g, '¿QUIÉN', 1380, 160, 160); BIG(g, 'DISPARÓ?', 1380, 330, 170, '#ff5040');
}});
// C — Tomi protegiendo al presidente, alerta roja, "PROTÉGELO"
registerShot('C', { draw(g) {
  sea(g); K.ship(g, 1600, 455, 0.38, -1, { flag: true }); torpedo(g, 1450, 820, 0.6, -0.08); alarmGlow(g);
  K.fdr(g, 0, 1180, 1150, { f: 1, expr: 'worried', s: 2.2, big: 1 });
  K.guy(g, 0, K.TOMI, 640, 1330, { f: 1, s: 3.0, big: 1, pose: 'ready', expr: 'determined' });
  BIG(g, 'PROTÉGELO', 1360, 190, 170); BIG(g, '…DE LOS TUYOS', 1360, 350, 110, '#ff5040');
}});
