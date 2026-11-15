// sets/office.js — a generic presidential office: cream walls, tall windows, curtains, desk, flag stand. Flat outlined.
import { E, mood, layer, linGrad, shade, rr } from '/engine/core.js';
import { OL } from '/engine/toon2d.js';
const box = (g, x, y, w, h, c, lw = 3.5) => { g.fillStyle = c; g.fillRect(x, y, w, h); g.strokeStyle = OL; g.lineWidth = lw; g.strokeRect(x, y, w, h); };
export function office(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = E.H * 0.84, CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = M.wall; g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (let x = -E.W; x < E.W * 2; x += 120) { g.strokeStyle = shade(M.wall, -0.06); g.lineWidth = 6; g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, GY); g.stroke(); }
    for (const wx of [CX - 560, CX + 300]) {
      box(g, wx, 140, 260, 520, '#a9d4ec'); g.fillStyle = '#cfe8f5'; g.fillRect(wx + 4, 144, 252, 200);
      g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.moveTo(wx + 130, 140); g.lineTo(wx + 130, 660); g.moveTo(wx, 400); g.lineTo(wx + 260, 400); g.stroke();
      for (const [cx, d] of [[wx - 40, 1], [wx + 260, -1]]) { g.fillStyle = '#b8343a'; g.strokeStyle = OL; g.lineWidth = 3.5; g.beginPath(); g.moveTo(cx, 110); g.lineTo(cx + 80, 110); g.quadraticCurveTo(cx + 40 + d * 20, 400, cx + 70, 690); g.lineTo(cx + 10, 690); g.quadraticCurveTo(cx + 40 - d * 20, 400, cx, 110); g.fill(); g.stroke(); }
    }
    box(g, -E.W, GY - 70, E.W * 3, 70, shade(M.wall, -0.12));
  });
  layer(g, cam, 0.85, (g) => { g.fillStyle = M.floor; g.fillRect(-E.W, GY, E.W * 3, E.H); g.strokeStyle = OL; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-E.W, GY); g.lineTo(E.W * 2, GY); g.stroke();
    g.fillStyle = '#2f5fa8'; g.beginPath(); g.ellipse(CX, GY + 70, 700, 60, 0, 0, 7); g.fill(); g.stroke(); });
  return { GY, CX, M };
}
export function desk(g, x, GY) { box(g, x - 170, GY - 150, 340, 150, '#7a4a2a'); box(g, x - 190, GY - 165, 380, 22, '#8e5a34'); box(g, x - 40, GY - 120, 80, 70, '#6a3e22', 3); }
