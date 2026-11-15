import { E, registerShot, mood, layer, blurLayer, veil, ease, text, FONTS, alpha, S } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { lab } from '../sets/lab.js';
import { CANDIDATES, LEO } from '../cast.js';

const poses = ['wave', 'stand', 'explain', 'cheer'];
registerShot('c01', { draw(g, t, info) {
  const cam = { z: 1 + 0.04 * ease.inOut(t / info.dur), x: 0 };
  const { GY, M } = lab(g, t, cam);
  layer(g, cam, 1, (g) => CANDIDATES.forEach(([name, of], i) => {
    const x = E.W / 2 + (i - 1.5) * 330;
    drawFigure(g, { x, y: GY, s: 1.45, facing: i < 2 ? 1 : -1, outfit: of, pose: breathe(POSES[poses[i]], t, 1, i), expr: 'smile', rim: { color: M.rim, dir: [0, -1], w: 4 } });
    text(g, name, x, GY + 70, { size: 44, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(S().ui.gold, 0.6), spacing: 2 });
  }));
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
}});
CANDIDATES.forEach(([name, of], i) => registerShot('c0' + (i + 2), { draw(g, t) {
  blurLayer(g, 14, (g) => lab(g, t, { z: 1.5, x: -150, y: -120 })); veil(g, '#0a0810', 0.35);
  const M = mood('interiorWarm');
  bigFace(g, E.W / 2, E.H * 0.62, 320, { outfit: of, expr: 'smile', look: [0.15, -0.1], rimColor: M.rim, rimSide: -1 });
  text(g, name, E.W - 200, 120, { size: 56, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(S().ui.gold, 0.6), spacing: 2 });
}}));
registerShot('c06', { draw(g, t, info) {
  const cam = { z: 1.05, x: 0 };
  const { GY, M } = lab(g, t, cam, { mood: 'night' });
  const guard = { top: 'suit', color: '#1c1b24', color2: '#e8833a', face: 'sunglasses', head: 'none' };
  const pres = { top: 'suit', color: '#2a3550', color2: '#c0392b', head: 'none' };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 + 160, y: GY, s: 1.5, facing: -1, outfit: pres, pose: breathe(POSES.talk, t, 1, 3), expr: 'worried', rim: { color: M.rim, dir: [0, -1], w: 4 } });
    drawFigure(g, { x: E.W / 2 - 160, y: GY, s: 1.5, facing: 1, outfit: guard, pose: breathe(POSES.crossArms, t), expr: 'determined', rim: { color: M.rim, dir: [0, -1], w: 4 } });
  });
  text(g, 'TÚ  ·  GUARDAESPALDAS', E.W / 2, 110, { size: 54, color: S().ui.gold, font: FONTS.title, weight: 700, glow: 20, glowColor: alpha(S().ui.gold, 0.6), spacing: 3 });
}});
