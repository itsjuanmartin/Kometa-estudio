// tools/build_geo.mjs — genera engine/geo/world.js (fronteras reales de países, Natural Earth 1:50m) para engine/map2d.js.
// Solo hace falta volver a correrlo si se quiere cambiar la resolución o los nombres. Uso:
//   mkdir -p /tmp/geo && cd /tmp/geo && npm i world-atlas@2.0.2 topojson-client@3.1.0 topojson-simplify@3.0.3 i18n-iso-countries@7.11.0
//   node <repo>/tools/build_geo.mjs /tmp/geo
// Formato de salida: cada país = { id: 'ESP', n: 'España', k: índice de color (vecinos nunca comparten color),
//   c: [lon, lat] punto para la etiqueta, a: área aprox. (grados²), r: [anillos] } con cada anillo = enteros planos
//   [lon*100, lat*100, Δlon, Δlat, ...] (delta-codificado para que el archivo pese poco).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(process.argv[2] || '.');
const req = createRequire(path.join(DIR, 'package.json'));
const topo = req('topojson-client'), simp = req('topojson-simplify'), iso = req('i18n-iso-countries');
iso.registerLocale(req('i18n-iso-countries/langs/es.json'));
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let T = req('world-atlas/countries-50m.json');
T = simp.simplify(simp.presimplify(T), 0.0008); // ~0.03° de tolerancia: se ve nítido incluso con zoom a un país pequeño
const geoms = T.objects.countries.geometries;
const neigh = topo.neighbors(geoms);

// nombres en español cortos y "de vídeo" (sobrescriben los oficiales largos)
const NAME = { USA: 'Estados Unidos', GBR: 'Reino Unido', RUS: 'Rusia', COD: 'R.D. del Congo', COG: 'Congo', CAF: 'Rep. Centroafricana', DOM: 'Rep. Dominicana', CZE: 'Chequia', BIH: 'Bosnia', MKD: 'Macedonia del Norte', IRN: 'Irán', SYR: 'Siria', KOR: 'Corea del Sur', PRK: 'Corea del Norte', LAO: 'Laos', VNM: 'Vietnam', BOL: 'Bolivia', VEN: 'Venezuela', TZA: 'Tanzania', MDA: 'Moldavia', PSE: 'Palestina', TWN: 'Taiwán', NLD: 'Países Bajos', CIV: 'Costa de Marfil', SSD: 'Sudán del Sur', ARE: 'Emiratos Árabes', GNQ: 'Guinea Ecuatorial', VAT: 'Vaticano', FSM: 'Micronesia', BRN: 'Brunéi', SWZ: 'Esuatini', CPV: 'Cabo Verde', TLS: 'Timor Oriental', MMR: 'Birmania', ESH: 'Sáhara Occidental' };
// territorios sin código ISO numérico en world-atlas
const BYNAME = { Kosovo: ['XKX', 'Kosovo'], 'N. Cyprus': ['XNC', 'Chipre del Norte'], Somaliland: ['XSL', 'Somalilandia'], 'Indian Ocean Ter.': ['XIO', 'Territorio del Índico'], 'Ashmore and Cartier Is.': ['XAC', 'Islas Ashmore'], 'Siachen Glacier': ['XSG', 'Siachen'] };

const PAL = 6; // nº de colores de relleno distintos (map2d.js define la paleta)
const out = [], colors = new Array(geoms.length).fill(-1);
// coloreado voraz de grafo: el país con más vecinos primero
const order = geoms.map((_, i) => i).sort((a, b) => neigh[b].length - neigh[a].length);
for (const i of order) { const used = new Set(neigh[i].map(j => colors[j])); let k = (i * 7) % PAL; for (let n = 0; n < PAL && used.has(k); n++) k = (k + 1) % PAL; colors[i] = k; }

const ringArea = r => { let s = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s / 2; };
const ringCentroid = r => { let a = 0, x = 0, y = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; a += f; x += (r[j][0] + r[i][0]) * f; y += (r[j][1] + r[i][1]) * f; } return a ? [x / (3 * a), y / (3 * a)] : r[0]; };
// punto de etiqueta: dentro del anillo mayor, lo más lejos posible del borde (polylabel simplificado por rejilla)
function labelPoint(ring) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]; for (const [x, y] of ring) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const inside = (x, y) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const dist = (x, y) => { let m = Infinity; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [ax, ay] = ring[j], [bx, by] = ring[i]; const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; const t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l)) : 0; m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy)); } return m; };
  let best = ringCentroid(ring), bd = inside(...best) ? dist(...best) : -1; const N = 28;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { const x = x0 + ((x1 - x0) * i) / N, y = y0 + ((y1 - y0) * j) / N; if (!inside(x, y)) continue; const d = dist(x, y); if (d > bd) { bd = d; best = [x, y]; } }
  return best;
}

geoms.forEach((gm, i) => {
  const f = topo.feature(T, gm); if (!f.geometry) return;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  let id = iso.numericToAlpha3(gm.id), n = id && (NAME[id] || iso.getName(id, 'es', { select: 'alias' }));
  if (!id && BYNAME[gm.properties.name]) [id, n] = BYNAME[gm.properties.name];
  if (!id) { id = 'X' + String(i).padStart(2, '0'); n = gm.properties.name; }
  const rings = [], all = []; let area = 0, big = null, bigA = 0;
  for (const poly of polys) poly.forEach((ring, ri) => { if (ring.length < 4) return; const a = Math.abs(ringArea(ring)); if (ri === 0) { area += a; if (a > bigA) { bigA = a; big = ring; } } all.push(ring); });
  for (const ring of all) { const flat = []; let px = 0, py = 0; ring.forEach(([x, y], k) => { const X = Math.round(x * 100), Y = Math.round(y * 100); flat.push(k ? X - px : X, k ? Y - py : Y); px = X; py = Y; }); rings.push(flat); }
  const c = big ? labelPoint(big) : [0, 0];
  out.push({ id, n, k: colors[i], c: [+c[0].toFixed(2), +c[1].toFixed(2)], a: Math.round(area), r: rings });
});
out.sort((a, b) => a.id.localeCompare(b.id));
fs.mkdirSync(path.join(ROOT, 'engine/geo'), { recursive: true });
const js = `// engine/geo/world.js — GENERADO por tools/build_geo.mjs (Natural Earth 1:50m vía world-atlas). No editar a mano.\nexport const PALETTE_N = ${PAL};\nexport const COUNTRIES = ${JSON.stringify(out)};\n`;
fs.writeFileSync(path.join(ROOT, 'engine/geo/world.js'), js);
console.log(`${out.length} países · ${(js.length / 1024).toFixed(0)} KB`);
