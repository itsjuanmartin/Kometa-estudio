import { E, registerShot, layer, ease, text, FONTS, alpha, S } from '/engine/core.js';
import { POSES, breathe } from '/engine/rig2d.js';
import { drawToon, toonBigFace, OL } from '/engine/toon2d.js';
import { field, fieldFront } from '../sets/field.js';
import { office, desk } from '../sets/office.js';
import { CANDIDATES, LEO, LEO_GUARD, LEO_SOLDIER, PRESIDENT } from '../cast.js';

const label = (g, str, x, y, size = 46) => text(g, str, x, y, { size, color: '#fff8e8', font: FONTS.title, weight: 700, stroke: 9, strokeColor: OL, spacing: 2 });
const pill = (g, str, x, y) => { g.font = `700 40px "${FONTS.title}"`; const w = g.measureText(str).width + 60; g.fillStyle = '#f2e94a'; g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); g.roundRect(x - w / 2, y - 34, w, 68, 34); g.fill(); g.stroke(); text(g, str, x, y, { size: 40, color: OL, font: FONTS.title, weight: 700 }); };
const poses = ['wave', 'relaxed', 'explain', 'cheer'];

registerShot('t01', { draw(g, t, info) {
  const cam = { z: 1 + 0.03 * ease.inOut(t / info.dur), x: 0 };
  const { GY } = field(g, t, cam);
  layer(g, cam, 1, (g) => CANDIDATES.forEach(([name, of], i) => {
    const x = E.W / 2 + (i - 1.5) * 380;
    drawToon(g, { x, y: GY, s: 1.25, facing: i < 2 ? 1 : -1, outfit: of, pose: breathe(POSES[poses[i]], t, 1, i), expr: i === 3 ? 'happy' : 'smile', blink: (t % 3.1) > 3.0 });
    label(g, name, x, GY + 60);
  }));
  pill(g, 'ELIGE AL PROTAGONISTA', E.W / 2, 90);
}});
CANDIDATES.forEach(([name, of], i) => registerShot('t0' + (i + 2), { draw(g, t) {
  field(g, t, { z: 1.4, x: -200, y: -100 });
  toonBigFace(g, E.W / 2, E.H * 0.5, 230, { outfit: of, expr: i % 2 ? 'smile' : 'happy', look: [0.1, 0] });
  label(g, name, 230, 110, 64);
}}));
registerShot('t06', { draw(g, t) {
  const cam = { z: 1.02, x: 0 }; const { GY } = office(g, t, cam);
  layer(g, cam, 1, (g) => {
    desk(g, E.W / 2 + 330, GY);
    drawToon(g, { x: E.W / 2 + 120, y: GY, s: 1.35, facing: -1, outfit: PRESIDENT, pose: breathe(POSES.talk, t, 1, 3), expr: 'worried', talk: 0.5 });
    drawToon(g, { x: E.W / 2 - 220, y: GY, s: 1.35, facing: 1, outfit: LEO_GUARD, pose: breathe(POSES.crossArms, t), expr: 'determined' });
  });
  pill(g, 'Y SI TE TOCARA... SER SU GUARDAESPALDAS', E.W / 2, 90);
}});
registerShot('t07', { draw(g, t) {
  const cam = { z: 1.05, x: 0 }; const { GY } = field(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => drawToon(g, { x: E.W * 0.36, y: GY + 40, s: 1.9, facing: 1, outfit: LEO_SOLDIER, pose: breathe(POSES.relaxed, t), expr: 'smirk' }));
  fieldFront(g, t, cam);
  pill(g, 'Y SI TE TOCARA... IR A LA GUERRA', E.W / 2, 90);
}});
const EX = [['smile', 'AMABLE'], ['happy', 'FELIZ'], ['surprised', 'SORPRENDIDO'], ['scared', 'ASUSTADO'], ['determined', 'DECIDIDO'], ['smirk', 'PÍCARO']];
registerShot('t08', { draw(g, t) {
  field(g, t, { z: 1.4, x: -200, y: -100 });
  EX.forEach(([e, n], i) => { const x = 330 + (i % 3) * 630, y = 300 + Math.floor(i / 3) * 460;
    g.save(); g.beginPath(); g.rect(x - 290, y - 230, 580, 400); g.clip(); toonBigFace(g, x, y - 10, 130, { outfit: LEO, expr: e }); g.restore();
    label(g, n, x, y + 205, 40); });
}});
