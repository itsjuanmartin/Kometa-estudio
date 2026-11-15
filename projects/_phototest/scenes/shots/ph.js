import { registerShot } from '/engine/core.js';
import { toonBigFace } from '/engine/toon2d.js';
import { loadPhotos, photoMoment } from '/engine/photo.js';
const PH = await loadPhotos({ garbo: '/project/assets/photos/garbo.jpg' });
const TOMI = { top: 'suit', color: '#3c3f4a', color2: '#3f8fb0', legs: '#3c3f4a', hair: 'side', hairColor: '#2e2420' };
function bg(g, a, b) { const gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); }
registerShot('ph', { draw(g, t) { bg(g, '#f0b878', '#fae8c0'); toonBigFace(g, 1500, 760, 260, { outfit: TOMI, expr: 'smile', t });
  photoMoment(g, t + 1.4, PH.garbo, { caption: 'Juan Pujol García, «Garbo»', credit: 'Foto: dominio público · Wikimedia Commons', theme: 'warm', x: 760, w: 700, h: 620 }); } });
registerShot('phd', { draw(g, t) { bg(g, '#241f1b', '#120f0d');
  photoMoment(g, t + 1.4, PH.garbo, { caption: 'Juan Pujol García', credit: 'Foto: dominio público · Wikimedia Commons', theme: 'dark', w: 700, h: 620 }); } });
