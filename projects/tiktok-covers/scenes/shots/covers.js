import { registerShot } from '/engine/core.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from '../_lib.js';
const { R, P, C, O, L, T, OL } = K;
const VW = 1080, VH = 1920;
function bg(g, top, bot, glow) { const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  g.save(); g.globalAlpha = 0.18; for (let i = 0; i < 16; i++) { g.save(); g.translate(VW / 2, 1150); g.rotate(i * Math.PI / 8); P(g, [[0, 0], [1600, -110], [1600, 110]], '#ffffff', 0); g.restore(); } g.restore();
  if (glow) { const r = g.createRadialGradient(VW / 2, VH / 2, 500, VW / 2, VH / 2, 1200); r.addColorStop(0, 'rgba(220,40,30,0)'); r.addColorStop(1, 'rgba(220,40,30,.5)'); g.fillStyle = r; g.fillRect(0, 0, VW, VH); } }
function frame(g, n, lines, col2 = '#ff5040') {
  // series tag (inside 3:4 safe zone: y 240..1680)
  g.save(); g.translate(VW / 2, 300); R(g, -300, -46, 600, 92, '#fff8e8', 7, 46); T(g, `Y SI TE TOCARÁ · ${n}/5`, 0, 3, 44, OL, { stroke: 0 }); g.restore();
  lines.forEach((l, i) => { g.save(); g.translate(VW / 2, 460 + i * 150); g.rotate(-0.03); T(g, l, 0, 0, l.length > 11 ? 112 : 136, i === lines.length - 1 ? col2 : '#f2e94a', { stroke: 30, spacing: 2 }); g.restore(); });
  // footer
  g.save(); g.translate(VW / 2, 1610); R(g, -330, -48, 660, 96, '#e0302a', 7, 48); T(g, 'HISTORIA COMPLETA ▶', 0, 3, 46, '#ffffff', { stroke: 0 }); g.restore();
}
function torpedo(g, x, y, s, ang) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  for (const [w, a] of [[220, 0.35], [130, 0.6], [60, 0.95]]) { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(420, 0); g.lineTo(1500, 0); g.stroke(); }
  P(g, [[380, -55], [470, -110], [480, -90], [430, 0], [480, 90], [470, 110], [380, 55]], '#4e5a52', 6); R(g, -380, -78, 800, 156, '#5d6b60', 7, 20);
  P(g, [[-380, -78], [-520, -30], [-560, 0], [-520, 30], [-380, 78]], '#4a5650', 7); R(g, -330, -78, 60, 156, '#c0392b', 5); g.restore(); }
const face = (g, expr, x = 330, y = 1300, r = 230, look = [0.8, 0]) => toonBigFace(g, x, y, r, { outfit: K.TOMI, expr, look, t: 0 });

registerShot('c1', { draw(g) { bg(g, '#8fd0f0', '#174a78', true); torpedo(g, 760, 1080, 0.6, -0.25); face(g, 'shocked'); O(g, 150, 1110, 24, 36, '#9fd8ff', 5); frame(g, 1, ['NO FUE', 'EL ENEMIGO…']); } });
registerShot('c2', { draw(g) { bg(g, '#f6e7c0', '#c9a874', false); K.fala(g, 0, 800, 1460, 2.7, -1); face(g, 'surprised', 300, 1300, 210, [0.9, 0.3]); frame(g, 2, ['EL ESPÍA', 'TENÍA 4 PATAS']); } });
registerShot('c3', { draw(g) { bg(g, '#bfe0f2', '#6a6a62', false); K.car(g, 860, 1450, 1.25, -1); face(g, 'suspicious' in {} ? 'smirk' : 'smirk', 300, 1220, 200, [0.9, 0.1]); frame(g, 3, ['EL COCHE', 'DE UN GÁNSTER']); } });
registerShot('c4', { draw(g) { bg(g, '#f0dcb4', '#b88a5a', false); K.fdr(g, 0, 830, 1560, { f: -1, expr: 'smile', s: 2.1, big: 1 }); face(g, 'worried', 300, 1230, 200, [0.9, 0]); frame(g, 4, ['NADIE', 'LO VIO']); } });
registerShot('c5', { draw(g) { bg(g, '#2e3a6a', '#141a33', true); K.guy(g, 0, K.WAITER, 820, 1640, { f: -1, s: 2.5, big: 1, pose: 'crossArms', expr: 'angry' }); face(g, 'thinking', 300, 1230, 200, [0.9, 0]); frame(g, 5, ['NO ERAN', 'CAMAREROS']); } });
