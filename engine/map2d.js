// engine/map2d.js — mapas "con amor": fronteras reales (Natural Earth), cada país separado y con su color,
// costa con trazo grueso de tinta, país protagonista que se levanta, cámara que vuela de un sitio a otro,
// ciudades con chincheta, rutas en arco animadas y etiquetas automáticas. Estilo toon del canal.
//
//   import { worldMap, CITIES } from '/engine/map2d.js';
//   worldMap(g, t, {
//     cam: [{ at: 0, lon: 5, lat: 48, span: 60 }, { at: 1.2, d: 1.6, to: 'ESP' }],  // vuelo: de Europa a España
//     focus: [{ id: 'ESP', at: 1.4 }],                     // España se levanta y se pinta de su color
//     dim: 0.55,                                           // el resto se apaga (0 = nada, 1 = gris total)
//     labels: 'auto',                                      // nombres de los países visibles ('auto' | false | ['ESP','FRA'])
//     cities: [{ p: 'barcelona', at: 2.0, big: true }],    // chinchetas (nombre de CITIES o {lon,lat,label})
//     routes: [{ pts: ['barcelona', 'lisboa', 'londres'], at: 2.5, d: 2 }],
//     tint: { DEU: '#8a8f80' },                            // colores a mano por país
//   });
// cam también acepta un objeto fijo { lon, lat, span } o { to: 'ESP' } (encuadra el país). span = grados de longitud visibles.
import { E, clamp, lerp, ease, prog, text, shade, mix, alpha, FONTS } from './core.js';
import { COUNTRIES, PALETTE_N } from './geo/world.js';

const OL = '#2b211c';
// paleta pastel de papel (PALETTE_N colores; los vecinos nunca comparten color)
export const LAND = ['#f1dca3', '#e7c79a', '#cfe0a6', '#f3c9a4', '#e6d3b8', '#d9cf9a'];
export const SEA = { top: '#8fc6dc', bot: '#6faecb', line: 'rgba(255,255,255,.28)', grid: 'rgba(255,255,255,.16)' };
// colores "de bandera" para resaltar (si no se da col)
export const HILITE = { ESP: '#e8b130', FRA: '#8a6ad0', GBR: '#c8433a', DEU: '#7d8578', PRT: '#3f9a5a', ITA: '#4fa35e', USA: '#34488f', RUS: '#c8433a', AGO: '#d0473a', VEN: '#f0c22c', NOR: '#c8433a', MAR: '#c8433a', MEX: '#3f9a5a', ARG: '#34488f', BRA: '#3f9a5a', CHN: '#d0473a', JPN: '#e06a6a', SWE: '#e8b130', CHE: '#d0473a', POL: '#d0576a', NLD: '#e0782a', BEL: '#e8b130', IRL: '#3f9a5a', GRC: '#34488f', TUR: '#d0473a', EGY: '#c9a050', CUB: '#34488f', COL: '#f0c22c', PER: '#d0473a', CHL: '#c8433a', CAN: '#d0473a', AUS: '#34488f', IND: '#e0882a', default: '#e8b130' };

export const CITIES = {
  barcelona: [2.17, 41.39, 'BARCELONA'], madrid: [-3.70, 40.42, 'MADRID'], lisboa: [-9.14, 38.72, 'LISBOA'], londres: [-0.13, 51.51, 'LONDRES'],
  paris: [2.35, 48.86, 'PARÍS'], berlin: [13.40, 52.52, 'BERLÍN'], roma: [12.50, 41.90, 'ROMA'], moscu: [37.62, 55.75, 'MOSCÚ'], viena: [16.37, 48.21, 'VIENA'],
  calais: [1.86, 50.95, 'CALAIS'], dover: [1.31, 51.13, 'DOVER'], normandia: [-0.6, 49.35, 'NORMANDÍA'], portsmouth: [-1.09, 50.80, 'PORTSMOUTH'],
  oslo: [10.75, 59.91, 'OSLO'], estocolmo: [18.07, 59.33, 'ESTOCOLMO'], amsterdam: [4.90, 52.37, 'ÁMSTERDAM'], bruselas: [4.35, 50.85, 'BRUSELAS'],
  sevilla: [-5.98, 37.39, 'SEVILLA'], valencia: [-0.38, 39.47, 'VALENCIA'], bilbao: [-2.93, 43.26, 'BILBAO'], gibraltar: [-5.35, 36.14, 'GIBRALTAR'],
  luanda: [13.23, -8.84, 'LUANDA'], caracas: [-66.90, 10.48, 'CARACAS'], washington: [-77.04, 38.91, 'WASHINGTON'], nuevayork: [-74.0, 40.71, 'NUEVA YORK'],
  ciudadmexico: [-99.13, 19.43, 'CDMX'], buenosaires: [-58.38, -34.60, 'BUENOS AIRES'], bogota: [-74.07, 4.71, 'BOGOTÁ'], lima: [-77.04, -12.05, 'LIMA'],
  santiago: [-70.65, -33.45, 'SANTIAGO'], lahabana: [-82.37, 23.11, 'LA HABANA'], tokio: [139.69, 35.69, 'TOKIO'], pekin: [116.40, 39.90, 'PEKÍN'],
  elcairo: [31.24, 30.04, 'EL CAIRO'], casablanca: [-7.59, 33.57, 'CASABLANCA'], estambul: [28.98, 41.01, 'ESTAMBUL'], jerusalen: [35.21, 31.77, 'JERUSALÉN'],
  teheran: [51.39, 35.69, 'TEHERÁN'], yalta: [34.16, 44.50, 'YALTA'], sidney: [151.21, -33.87, 'SÍDNEY'], hawai: [-157.86, 21.31, 'HAWÁI'],
};

// ---------- datos: decodificar una vez ----------
let DB = null;
function db() {
  if (DB) return DB; DB = new Map();
  for (const c of COUNTRIES) {
    let x0 = 999, y0 = 999, x1 = -999, y1 = -999;
    const rings = c.r.map(flat => {
      const pts = new Float32Array(flat.length); let x = 0, y = 0, mn = 999, mx = -999;
      for (let i = 0; i < flat.length; i += 2) { x = i ? x + flat[i] : flat[i]; y = i ? y + flat[i + 1] : flat[i + 1]; pts[i] = x / 100; pts[i + 1] = y / 100; mn = Math.min(mn, pts[i]); mx = Math.max(mx, pts[i]); }
      // anillos partidos por el antimeridiano (Fiyi, Chukotka): se desenrollan para no cruzar el mapa con una raya
      if (mx - mn > 180 && c.id !== 'ATA') for (let i = 0; i < pts.length; i += 2) if (pts[i] < 0) pts[i] += 360;
      for (let i = 0; i < pts.length; i += 2) { const lon = pts[i], lat = pts[i + 1]; if (lon < x0) x0 = lon; if (lon > x1) x1 = lon; if (lat < y0) y0 = lat; if (lat > y1) y1 = lat; }
      return pts;
    });
    DB.set(c.id, { ...c, rings, bb: [x0, y0, x1, y1] });
  }
  return DB;
}
export const country = id => db().get(id);
export const countryIds = () => [...db().keys()];
// busca por código o por nombre en español ('España', 'españa')
export function findCountry(q) { const d = db(); if (d.has(q)) return d.get(q); const s = String(q).toLowerCase(); for (const c of d.values()) if (c.n.toLowerCase() === s) return c; return null; }

// ---------- proyección (Mercator) ----------
const D2R = Math.PI / 180, mercY = lat => Math.log(Math.tan(Math.PI / 4 + clamp(lat, -85, 85) * D2R / 2)) / D2R;
export function projector(cam, w = E.W, h = E.H) {
  const s = w / cam.span, cy = mercY(cam.lat);
  const P = (lon, lat) => [w / 2 + (lon - cam.lon) * s, h / 2 - (mercY(lat) - cy) * s];
  P.s = s; P.inv = (x, y) => { const lon = cam.lon + (x - w / 2) / s, my = cy - (y - h / 2) / s; return [lon, (2 * Math.atan(Math.exp(my * D2R)) - Math.PI / 2) / D2R]; };
  P.w = w; P.h = h; return P;
}
// encuadre que contiene a uno o varios países (ignora territorios lejanos: usa el anillo grande / punto de etiqueta)
export function frameOf(ids, pad = 1.35, w = E.W, h = E.H) {
  ids = [].concat(ids); let x0 = 999, y0 = 999, x1 = -999, y1 = -999;
  for (const id of ids) {
    const c = findCountry(id); if (!c) continue;
    const big = c.rings.reduce((a, r) => (r.length > a.length ? r : a), c.rings[0]);
    const near = c.rings.filter(r => r.length > 40 && Math.abs(r[0] - big[0]) < 25 && Math.abs(r[1] - big[1]) < 20).concat([big]);
    for (const r of near) for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]); }
  }
  const lon = (x0 + x1) / 2, my = (mercY(y0) + mercY(y1)) / 2, lat = (2 * Math.atan(Math.exp(my * D2R)) - Math.PI / 2) / D2R;
  const span = Math.max((x1 - x0) * pad, (mercY(y1) - mercY(y0)) * pad * (w / h), 3);
  return { lon, lat, span };
}
const resolveCam = k => (k.to ? { ...frameOf(k.to, k.pad), ...(k.span ? { span: k.span } : {}) } : k);
// cámara en el instante t: interpola posición lineal y zoom en log (vuelo suave, "zoom out–zoom in" si hop)
export function camAt(t, cam) {
  if (!Array.isArray(cam)) return resolveCam(cam || { lon: 10, lat: 45, span: 70 });
  let cur = resolveCam(cam[0]);
  for (let i = 1; i < cam.length; i++) {
    const k = cam[i], nxt = resolveCam(k), a = k.at ?? 0, d = k.d ?? 1.4; if (t <= a) break;
    const p = (k.ease || ease.inOut)(prog(t, a, a + d));
    const ls = lerp(Math.log(cur.span), Math.log(nxt.span), p) + (k.hop ? Math.sin(Math.PI * p) * k.hop : 0);
    cur = { lon: lerp(cur.lon, nxt.lon, p), lat: lerp(cur.lat, nxt.lat, p), span: Math.exp(ls) };
  }
  return cur;
}

// ---------- dibujo ----------
function ringPath(g, P, pts) { const n = pts.length; let [x, y] = P(pts[0], pts[1]); g.moveTo(x, y); let lx = x, ly = y; for (let i = 2; i < n; i += 2) { [x, y] = P(pts[i], pts[i + 1]); if (Math.abs(x - lx) + Math.abs(y - ly) < 0.6 && i < n - 2) continue; g.lineTo(x, y); lx = x; ly = y; } g.closePath(); }
function countryPath(c, P) { const p = new Path2D(); for (const r of c.rings) ringPath(p, P, r); return p; }
const visible = (c, P, m = 60) => { const [a, b] = P(c.bb[0], c.bb[3]), [d, e] = P(c.bb[2], c.bb[1]); return d > -m && a < P.w + m && e > -m && b < P.h + m; };
const pinPop = (t, at, d = 0.35) => (t < at ? 0 : ease.outBack(prog(t, at, at + d)));

function sea(g, P, t, o) {
  const { w, h } = P; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.seaTop || SEA.top); gr.addColorStop(1, o.seaBot || SEA.bot); g.fillStyle = gr; g.fillRect(-w, -h, w * 3, h * 3);
  // retícula de meridianos/paralelos que se mueve con la cámara (da sensación de mapa de verdad)
  const step = [1, 2, 5, 10, 15, 30].find(s => s * P.s > 140) || 30; const [l0, a1] = P.inv(0, 0), [l1, a0] = P.inv(w, h);
  g.save(); g.strokeStyle = SEA.grid; g.lineWidth = 2; g.setLineDash([10, 10]); g.beginPath();
  for (let lon = Math.ceil(l0 / step) * step; lon <= l1; lon += step) { const [x] = P(lon, 0); g.moveTo(x, 0); g.lineTo(x, h); }
  for (let lat = Math.ceil(a0 / step) * step; lat <= a1; lat += step) { const [, y] = P(0, lat); g.moveTo(0, y); g.lineTo(w, y); }
  g.stroke(); g.restore();
  // olitas que se desplazan despacio
  g.save(); g.strokeStyle = SEA.line; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const x = ((i * 397 + t * 14) % (w + 200)) - 100, y = ((i * 211) % h) + Math.sin(t * 1.3 + i) * 4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 8, x + 28, y); g.quadraticCurveTo(x + 42, y + 8, x + 56, y); g.stroke(); }
  g.restore();
}

export function worldMap(g, t, o = {}) {
  const w = o.w || E.W, h = o.h || E.H, cam = camAt(t, o.cam), P = projector(cam, w, h);
  const ink = Math.max(2.5, Math.min(7, 3.2 + P.s * 0.05)) * (o.ink ?? 1); // trazo crece con el zoom
  const focus = new Map((o.focus || []).map(f => (typeof f === 'string' ? [f, { id: f }] : [f.id, f])).map(([id, f]) => [findCountry(id)?.id || id, f]));
  const dimK = o.dim ?? (focus.size ? 0.5 : 0), dimA = focus.size ? Math.min(1, ...[...focus.values()].map(f => clamp((t - (f.at ?? 0)) / 0.6))) : 0;
  const hide = new Set(o.hide || (o.antarctica ? [] : ['ATA']));
  sea(g, P, t, o);
  const list = []; for (const c of db().values()) if (!hide.has(c.id) && visible(c, P)) list.push({ c, path: countryPath(c, P) });
  // 1) sombra de recorte de papel  2) costa gruesa  3) rellenos  4) fronteras finas
  g.save(); g.translate(ink * 1.2, ink * 1.6); g.fillStyle = 'rgba(30,50,70,.22)'; for (const { c, path } of list) if (!focus.has(c.id)) g.fill(path); g.restore();
  g.save(); g.lineJoin = 'round'; g.strokeStyle = OL; g.lineWidth = ink * 2; for (const { c, path } of list) if (!focus.has(c.id)) g.stroke(path); g.restore();
  for (const { c, path } of list) {
    if (focus.has(c.id)) continue; let col = o.tint?.[c.id] || LAND[c.k % LAND.length];
    if (dimK) col = mix(col, '#b9bcb6', dimK * dimA); g.fillStyle = col; g.fill(path);
  }
  g.save(); g.lineJoin = 'round'; g.strokeStyle = alpha(OL, 0.55); g.lineWidth = ink * 0.55; g.setLineDash([ink * 2.2, ink * 1.4]); for (const { c, path } of list) if (!focus.has(c.id)) g.stroke(path); g.restore();
  // 5) países protagonistas: se levantan con sombra larga, color de bandera, borde que late
  for (const { c, path } of list) {
    const f = focus.get(c.id); if (!f) continue; const k = clamp((t - (f.at ?? 0)) / 0.5), lift = ease.outBack(k) * (f.lift ?? 14) * Math.min(1.5, ink / 4);
    const col = mix(o.tint?.[c.id] || LAND[c.k % LAND.length], f.col || HILITE[c.id] || HILITE.default, ease.out(k));
    g.save(); g.fillStyle = 'rgba(20,30,40,.35)'; g.translate(lift * 0.5, lift * 0.8); g.fill(path); g.restore();
    g.save(); g.translate(-lift * 0.3, -lift * 0.6);
    g.lineJoin = 'round'; g.strokeStyle = OL; g.lineWidth = ink * 2.4; g.stroke(path); g.fillStyle = col; g.fill(path);
    // brillo interior suave arriba-izquierda
    g.save(); g.clip(path); const [bx, by] = P(c.bb[0], c.bb[3]), [ex, ey] = P(c.bb[2], c.bb[1]); const gr = g.createLinearGradient(bx, by, ex, ey); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(0.6, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; g.fillRect(bx, by, ex - bx, ey - by); g.restore();
    const pulse = f.pulse === false ? 0 : (Math.sin(t * 4) * 0.5 + 0.5) * k; if (pulse) { g.strokeStyle = alpha('#fff8e8', 0.55 * pulse); g.lineWidth = ink * 0.9; g.stroke(path); }
    g.restore();
  }
  const pins = (o.cities || []).map(m => { const q = typeof m.p === 'string' ? CITIES[m.p] : [m.lon, m.lat]; return P(q[0], q[1]); });
  // 6) etiquetas de país
  const want = o.labels === false ? null : Array.isArray(o.labels) ? new Set(o.labels.map(x => findCountry(x)?.id || x)) : 'auto';
  if (want) for (const { c } of list) {
    const isF = focus.has(c.id); if (want !== 'auto' && !want.has(c.id) && !isF) continue;
    let [x, y] = P(c.c[0], c.c[1]); if (x < 40 || x > w - 40 || y < 40 || y > h - 40) continue;
    for (const [px2, py2] of pins) if (Math.abs(px2 - x) < 170 && py2 - y > -150 && py2 - y < 60) y = py2 + 70; // no tapar chinchetas
    const px = Math.sqrt(c.a) * P.s; if (!isF && (want === 'auto' && px < 150)) continue;
    let size = clamp(px * 0.16, 20, isF ? 88 : 54) * (o.labelScale ?? 1); const str = (o.names?.[c.id] || c.n).toUpperCase();
    g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const tw = g.measureText(str).width; g.restore(); if (tw > px * (isF ? 1.6 : 1.1)) size *= (px * (isF ? 1.6 : 1.1)) / tw; if (size < 16) continue;
    const f = focus.get(c.id), k = isF ? pinPop(t, (f.at ?? 0) + 0.25) : 1, lift = isF ? (f.lift ?? 14) * Math.min(1.5, ink / 4) : 0;
    if (k <= 0) continue; g.save(); g.translate(x - lift * 0.3 + (f?.ldx || 0), y - lift * 0.6 + (f?.ldy || 0)); g.scale(k, k);
    if (isF) text(g, str, 0, 0, { size, color: '#fff8e8', font: FONTS.title, weight: 700, stroke: Math.max(5, size * 0.2), strokeColor: OL, spacing: 2 });
    else text(g, str, 0, 0, { size, color: alpha('#5a4a34', dimK * dimA > 0.3 ? 0.45 : 0.8), font: FONTS.title, weight: 700, spacing: 3 });
    g.restore();
  }
  // 7) rutas en arco (punteadas al avanzar, con flecha/avión en la punta)
  for (const r of o.routes || []) drawRoute(g, t, P, r, ink);
  // 8) ciudades
  for (const m of o.cities || []) {
    const [lon, lat, def] = typeof m.p === 'string' ? CITIES[m.p] : [m.lon, m.lat, m.label]; const s = pinPop(t, m.at ?? 0); if (s <= 0) continue;
    const [x, y] = P(lon, lat), r = (m.big ? 19 : 13) * (o.pinScale ?? 1), col = m.col || '#c0392b';
    g.save(); g.translate(x, y);
    if (m.big) { const ring = (t - (m.at ?? 0)) % 1.6 / 1.6; g.strokeStyle = alpha(col, 1 - ring); g.lineWidth = 4; g.beginPath(); g.arc(0, 0, r + ring * 46, 0, 7); g.stroke(); }
    g.scale(s, s);
    // chincheta
    g.fillStyle = 'rgba(20,30,40,.3)'; g.beginPath(); g.ellipse(4, 3, r * 0.9, r * 0.45, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-r * 1.25, -r * 1.6, -r * 1.1, -r * 3.1, 0, -r * 3.1); g.bezierCurveTo(r * 1.1, -r * 3.1, r * 1.25, -r * 1.6, 0, 0); g.fillStyle = col; g.fill(); g.lineWidth = 4; g.strokeStyle = OL; g.stroke();
    g.beginPath(); g.arc(0, -r * 2.05, r * 0.45, 0, 7); g.fillStyle = '#fff8e8'; g.fill();
    const lbl = m.label ?? def; if (lbl) { const sz = (m.size || (m.big ? 54 : 40)) * (o.pinScale ?? 1); const dx = m.dx ?? 0, dy = m.dy ?? -r * 3.1 - sz * 0.6; text(g, lbl, dx, dy, { size: sz, color: m.big ? '#f2e94a' : '#fff8e8', font: FONTS.title, weight: 700, stroke: Math.max(5, sz * 0.18), strokeColor: OL, spacing: 1, align: m.align || 'center' }); }
    g.restore();
  }
  return P; // para que la escena pueda dibujar encima en coordenadas geográficas: const P = worldMap(...); P(lon, lat)
}

const ptOf = p => (typeof p === 'string' ? CITIES[p] : p);
export function drawRoute(g, t, P, r, ink = 4) {
  const pts = r.pts.map(ptOf).map(([lon, lat]) => P(lon, lat)); const p = clamp((t - (r.at ?? 0)) / (r.d ?? 2)); if (p <= 0) return;
  const segs = []; for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), bend = (r.bend ?? 0.22) * L; segs.push({ x1, y1, x2, y2, cx: (x1 + x2) / 2 + (dy / L) * bend * (r.side ?? -1) * -1, cy: (y1 + y2) / 2 - Math.abs(dx / L) * bend, L }); }
  const tot = segs.reduce((a, s) => a + s.L, 0); let left = p * tot; const col = r.col || '#c0392b', lw = (r.w || 7) * Math.max(0.8, ink / 4);
  const q = (s, u) => [(1 - u) ** 2 * s.x1 + 2 * (1 - u) * u * s.cx + u * u * s.x2, (1 - u) ** 2 * s.y1 + 2 * (1 - u) * u * s.cy + u * u * s.y2];
  let tip = null, dir = null;
  for (const s of segs) {
    if (left <= 0) break; const u = Math.min(1, left / s.L); left -= s.L; const N = 40, path = [];
    for (let i = 0; i <= N * u; i++) path.push(q(s, i / N)); path.push(q(s, u));
    for (const [c, wd, dash] of [[OL, lw + 6, null], [col, lw, r.dash === false ? null : [lw * 2.2, lw * 1.3]]]) { g.save(); g.strokeStyle = c; g.lineWidth = wd; g.lineCap = 'round'; if (dash) g.setLineDash(dash); g.beginPath(); path.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); }
    tip = path[path.length - 1]; const pr = path[Math.max(0, path.length - 3)]; dir = Math.atan2(tip[1] - pr[1], tip[0] - pr[0]);
  }
  if (tip && r.head !== false) {
    g.save(); g.translate(...tip); g.rotate(dir); const a = lw * 2.6;
    if (r.icon === 'plane') { g.scale(a / 20, a / 20); g.beginPath(); g.moveTo(22, 0); g.lineTo(-14, -5); g.lineTo(-20, -20); g.lineTo(-24, -20); g.lineTo(-18, 0); g.lineTo(-24, 20); g.lineTo(-20, 20); g.lineTo(-14, 5); g.closePath(); g.fillStyle = '#fff8e8'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke(); }
    else { g.beginPath(); g.moveTo(a, 0); g.lineTo(-a * 0.7, -a * 0.8); g.lineTo(-a * 0.7, a * 0.8); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 4; g.strokeStyle = OL; g.stroke(); }
    g.restore();
  }
}
