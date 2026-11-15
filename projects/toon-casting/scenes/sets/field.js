// sets/field.js — sunny wheat field, flat outlined cartoon look.
import { E, mood, layer, linGrad, shade, rng } from '/engine/core.js';
import { OL } from '/engine/toon2d.js';
export function field(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = E.H * 0.82, CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2);
    g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(CX + 520, 200, 70, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = 30; g.beginPath(); g.arc(CX + 520, 200, 110, 0, 7); g.stroke(); });
  layer(g, cam, 0.3, (g) => { g.fillStyle = shade(M.grass, 0.15); g.strokeStyle = OL; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-E.W, GY - 200); for (let x = -E.W; x <= E.W * 2; x += 40) g.lineTo(x, GY - 230 + Math.sin(x / 260) * 40); g.lineTo(E.W * 2, E.H * 2); g.lineTo(-E.W, E.H * 2); g.closePath(); g.fill(); g.stroke(); });
  layer(g, cam, 0.6, (g) => { g.fillStyle = M.grass; g.strokeStyle = OL; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(-E.W, GY - 120); for (let x = -E.W; x <= E.W * 2; x += 40) g.lineTo(x, GY - 130 + Math.sin(x / 180 + 1) * 22); g.lineTo(E.W * 2, E.H * 2); g.lineTo(-E.W, E.H * 2); g.closePath(); g.fill(); g.stroke();
    const r = rng(7); g.strokeStyle = shade(M.grass, -0.3); g.lineWidth = 2.5; g.lineCap = 'round';
    for (let i = 0; i < 260; i++) { const x = -E.W + r() * E.W * 3, y = GY - 110 + r() * 120, h = 26 + r() * 30, sw = Math.sin(t * 1.4 + x * 0.01) * 4;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw, y - h * 0.6, x + sw * 1.5, y - h); g.stroke(); g.beginPath(); g.ellipse(x + sw * 1.5, y - h - 6, 3.5, 8, sw * 0.05, 0, 7); g.fillStyle = shade(M.grass, 0.1); g.fill(); g.stroke(); } });
  layer(g, cam, 0.9, (g) => { g.fillStyle = shade(M.grass, -0.05); g.fillRect(-E.W, GY - 10, E.W * 3, E.H); g.strokeStyle = OL; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-E.W, GY - 10); g.lineTo(E.W * 2, GY - 10); g.stroke(); });
  return { GY, CX, M };
}
export function fieldFront(g, t, cam) {   // blurred-free foreground wheat (drawn after characters)
  const M = mood('day'); layer(g, cam, 1.3, (g) => { const r = rng(11); g.strokeStyle = OL; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 70; i++) { const x = -200 + r() * (E.W + 400), y = E.H + 20, h = 90 + r() * 120, sw = Math.sin(t * 1.2 + x * 0.02) * 6;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw, y - h * 0.6, x + sw * 1.5, y - h); g.stroke(); g.beginPath(); g.ellipse(x + sw * 1.5, y - h - 10, 6, 15, 0, 0, 7); g.fillStyle = shade(M.grass, 0.2); g.fill(); g.stroke(); } });
}
