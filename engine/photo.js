// engine/photo.js — real photos inside the animation (both channels).
//   const PH = await loadPhotos({ garbo: '/project/assets/photos/garbo.jpg' });   // top-level await in a scene module
//   photoMoment(g, t, PH.garbo, { caption: 'Juan Pujol García', credit: 'Dominio público', theme: 'warm' | 'dark', at: 0 })
// The photo pops in as a polaroid (with tape and a slight tilt), slowly zooms (Ken Burns), gets a "FOTO REAL" stamp
// with a punch, and shows the credit line small at the bottom. Sepia/contrast grade keeps it inside our look.
import { E, ease, clamp, prog, text, FONTS } from './core.js';

const cache = new Map();
export async function loadPhotos(map) {
  const out = {};
  await Promise.all(Object.entries(map).map(async ([k, url]) => {
    if (!cache.has(url)) cache.set(url, new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('photo ' + url)); im.src = url; }));
    try { out[k] = await cache.get(url); } catch (e) { console.log('ERROR', e.message); }
  }));
  return out;
}

const OLc = '#2b211c';
function rr(g, x, y, w, h, r, fill, stroke, lw) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }

// draws the photo moment; t = local time (s) since the moment started
export function photoMoment(g, t, img, o = {}) {
  const W = 1920, H = 1080, dark = o.theme === 'dark';
  const at = o.at || 0, lt = t - at; if (lt < 0 || !img) return;
  const inn = ease.outBack(prog(lt, 0, 0.45)), out = o.dur ? 1 - ease.in(prog(lt, o.dur - 0.35, o.dur)) : 1, s = inn * out; if (s <= 0) return;
  // dim the scene behind
  g.save(); g.fillStyle = dark ? 'rgba(6,5,4,.78)' : 'rgba(30,22,16,.55)'; g.globalAlpha = clamp(lt / 0.3) * out; g.fillRect(0, 0, W, H); g.restore();
  const maxW = o.w || 1000, maxH = o.h || 640, ar = img.width / img.height;
  let pw = maxW, ph = pw / ar; if (ph > maxH) { ph = maxH; pw = ph * ar; }
  const pad = 34, cap = o.caption ? 92 : 40, fw = pw + pad * 2, fh = ph + pad + cap;
  g.save(); g.translate(o.x ?? W / 2, (o.y ?? H / 2) - 10); g.rotate((o.rot ?? -0.03) * (2 - inn)); g.scale(s, s);
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 40; g.shadowOffsetY = 18; rr(g, -fw / 2, -fh / 2, fw, fh, 6, '#f6f3ea'); g.shadowColor = 'transparent';
  // photo with Ken Burns zoom + vintage grade
  const z = 1 + 0.08 * clamp(lt / (o.dur || 6)); const px = -pw / 2, py = -fh / 2 + pad;
  g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
  g.filter = o.color ? 'contrast(1.05) saturate(.85)' : 'sepia(.55) contrast(1.12) brightness(.97)';
  g.drawImage(img, px - pw * (z - 1) / 2 + (o.panX || 0) * (z - 1) * pw, py - ph * (z - 1) / 2, pw * z, ph * z); g.filter = 'none';
  const v = g.createRadialGradient(0, py + ph / 2, Math.min(pw, ph) * 0.3, 0, py + ph / 2, Math.max(pw, ph) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = v; g.fillRect(px, py, pw, ph);
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(px, py, pw, ph);
  if (o.caption) {   // auto-fit the caption to the frame width
    let cs = 46; const cf = o.capFont || FONTS.title; g.font = `700 ${cs}px "${cf}"`; const cw = g.measureText(o.caption).width;
    if (cw > fw - 50) cs = Math.max(24, cs * (fw - 50) / cw);
    text(g, o.caption, 0, fh / 2 - cap / 2 + 4, { size: cs, color: '#2a2622', font: cf, weight: 700 });
  }
  g.save(); g.translate(0, -fh / 2 - 6); g.rotate(0.05); g.fillStyle = 'rgba(225,215,190,.85)'; g.fillRect(-70, -22, 140, 48); g.restore();   // tape
  g.restore();
  // FOTO REAL stamp (punch-in)
  const sl = lt - 0.5;
  if (sl > 0 && o.stamp !== false) {
    const k = sl < 0.16 ? 1.9 - 0.9 * (sl / 0.16) : 1; const sx = (o.x ?? W / 2) + fw / 2 * s - 60, sy = (o.y ?? H / 2) - fh / 2 * s + 40;
    g.save(); g.globalAlpha = out; g.translate(sx, sy); g.rotate(0.12); g.scale(k, k);
    if (dark) { g.strokeStyle = '#c8261e'; g.lineWidth = 9; g.strokeRect(-200, -50, 400, 100); text(g, 'FOTO REAL', 0, 4, { size: 60, color: '#c8261e', font: FONTS.title, weight: 700, spacing: 4 }); }
    else { rr(g, -175, -52, 350, 104, 18, '#fff8e8', OLc, 7); g.strokeStyle = '#c0392b'; g.lineWidth = 7; g.beginPath(); g.roundRect(-163, -40, 326, 80, 12); g.stroke(); text(g, 'FOTO REAL', 0, 4, { size: 52, color: '#c0392b', font: FONTS.title, weight: 700, spacing: 3 }); }
    g.restore();
  }
  if (o.credit) { g.save(); g.globalAlpha = clamp(lt / 0.5) * out * 0.85; text(g, o.credit, 30, H - 26, { size: 24, color: '#e8e0cc', font: FONTS.ui || FONTS.title, weight: 700, align: 'left' }); g.restore(); }
}
