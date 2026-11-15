// engine/kit3d.js — detailed procedural 3D props + painted textures for the "2D characters in a 3D world" look.
// Everything is built from code (no downloads): Sherman tank (real or inflatable), LCVP landing craft, bunker,
// Czech hedgehog, painted sky dome with clouds, sand / grass / paint / concrete textures. 1 unit = 1 metre.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng } from './core.js';

// ---------- procedural textures ----------
const texCache = new Map();
function canvasTex(key, w, h, draw, repeat) {
  if (texCache.has(key)) { const t = texCache.get(key).clone(); if (repeat) t.repeat.set(...repeat); t.needsUpdate = true; return t; }
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; texCache.set(key, t);
  const out = t.clone(); if (repeat) out.repeat.set(...repeat); out.needsUpdate = true; return out;
}
const hex = (c) => new THREE.Color(c);
function speckle(g, w, h, n, cols, rmin, rmax, seed, alpha = 0.5) { const r = rng(seed); for (let i = 0; i < n; i++) { g.globalAlpha = alpha * (0.3 + r() * 0.7); g.fillStyle = cols[Math.floor(r() * cols.length)]; const x = r() * w, y = r() * h, s = rmin + r() * (rmax - rmin); g.beginPath(); g.ellipse(x, y, s, s * (0.5 + r()), r() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; }
// worn military paint: base + blotches + vertical grime streaks + chipped edges
export const paintTex = (base = '#5b5d3a', seed = 1, rep = [1, 1]) => canvasTex(`paint${base}${seed}`, 512, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); const c = hex(base);
  const lighter = '#' + c.clone().offsetHSL(0, -0.03, 0.06).getHexString(), darker = '#' + c.clone().offsetHSL(0, 0, -0.08).getHexString();
  speckle(g, w, h, 90, [lighter, darker], 20, 70, seed, 0.12); speckle(g, w, h, 700, ['#2a2418', '#8a7a58'], 0.4, 1.6, seed + 3, 0.25);
  const r = rng(seed + 7); for (let i = 0; i < 40; i++) { const x = r() * w, len = 40 + r() * 160; const gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, 'rgba(40,32,20,.22)'); gr.addColorStop(1, 'rgba(40,32,20,0)'); g.fillStyle = gr; g.save(); g.translate(x, r() * h); g.fillRect(0, 0, 2 + r() * 4, len); g.restore(); }
}, rep);
export const sandTex = (rep = [30, 30]) => canvasTex('sand', 512, 512, (g, w, h) => { g.fillStyle = '#e3c68f'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1600, ['#c9a86e', '#f2dcab', '#b89460'], 0.6, 2.2, 4, 0.55); g.strokeStyle = 'rgba(160,120,70,.18)'; g.lineWidth = 3; for (let y = 0; y < h; y += 22) { g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 40 + y) * 5); g.stroke(); } }, rep);
export const grassTex = (base = '#5a8c44', rep = [60, 60]) => canvasTex('grass' + base, 512, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(11); for (let i = 0; i < 5000; i++) { const x = r() * w, y = r() * h, l = 4 + r() * 9; g.strokeStyle = ['#4a7f38', '#6fa452', '#3b6a30', '#88b862', '#a0a05a'][Math.floor(r() * 5)]; g.globalAlpha = 0.65; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - l); g.stroke(); } g.globalAlpha = 1; }, rep);
export const concreteTex = (rep = [2, 2]) => canvasTex('concrete', 512, 512, (g, w, h) => { g.fillStyle = '#9b978c'; g.fillRect(0, 0, w, h); speckle(g, w, h, 300, ['#8a867c', '#aeaa9e', '#7d796f'], 6, 28, 21, 0.35); speckle(g, w, h, 1500, ['#5a564e', '#c4c0b4'], 0.5, 1.8, 22, 0.5); g.strokeStyle = 'rgba(60,56,50,.35)'; g.lineWidth = 2; for (let y = 64; y < h; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } const r = rng(5); for (let i = 0; i < 40; i++) { const x = r() * w; const gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, 'rgba(50,46,40,.25)'); gr.addColorStop(1, 'rgba(50,46,40,0)'); g.fillStyle = gr; g.fillRect(x, r() * h * 0.5, 3 + r() * 6, 200); } }, rep);
export const woodTex = (base = '#8a6a44', rep = [1, 1]) => canvasTex('wood' + base, 512, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(9); for (let y = 0; y < h; y += 32) { g.fillStyle = `rgba(40,28,16,${0.15 + r() * 0.2})`; g.fillRect(0, y, w, 2); for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(60,40,22,.18)'; g.lineWidth = 1; g.beginPath(); const yy = y + 4 + k * 5; for (let x = 0; x <= w; x += 20) g.lineTo(x, yy + Math.sin(x / 50 + k + y) * 1.5); g.stroke(); } } }, rep);
const trackTex = () => canvasTex('track', 256, 64, (g, w, h) => { g.fillStyle = '#2e2b26'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = '#3d3a33'; g.fillRect(x + 2, 4, 11, h - 8); g.fillStyle = '#1c1a16'; g.fillRect(x, 0, 2, h); } }, [6, 1]);

// painted sky dome: vertical gradient + soft stylised clouds with shaded bellies
export function skyDome(o = {}) {
  const { top = '#3f7fd6', mid = '#7fb0ea', horizon = '#d6e6f4', clouds = 60, cloudTint = '#ffffff', shade = '#b8c8e0', seed = 3, radius = 700 } = o;
  const t = canvasTex(`sky${top}${horizon}${clouds}${seed}`, 2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h * 0.5); gr.addColorStop(0, top); gr.addColorStop(0.6, mid); gr.addColorStop(1, horizon); g.fillStyle = gr; g.fillRect(0, 0, w, h * 0.5); g.fillStyle = horizon; g.fillRect(0, h * 0.5, w, h * 0.5);
    const r = rng(seed); for (let i = 0; i < clouds; i++) { const cx = r() * w, cy = h * (0.3 + r() * 0.17), s = 12 + r() * 26, n = 4 + Math.floor(r() * 5);
      for (let pass = 0; pass < 2; pass++) for (let k = 0; k < n; k++) { const x = cx + (k - n / 2) * s * 0.55 + (r() - 0.5) * s * 0.3, y = cy - Math.sin((k / (n - 1)) * Math.PI) * s * 0.45 + (pass ? -s * 0.08 : s * 0.12), rr = s * (0.4 + r() * 0.35);
        g.fillStyle = pass ? cloudTint : shade; g.globalAlpha = pass ? 0.95 : 0.85; g.beginPath(); g.ellipse(x, y, rr * 1.3, rr, 0, 0, 7); g.fill(); }
      g.globalAlpha = 1; g.fillStyle = shade; g.globalAlpha = 0.5; g.fillRect(cx - n * s * 0.3, cy + s * 0.05, n * s * 0.6, s * 0.06); g.globalAlpha = 1; }
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(o.gain ?? 0.82, o.gain ?? 0.82, o.gain ?? 0.82), side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }));
  m.renderOrder = -1; return m;
}

// ---------- helpers ----------
const std = (map, o = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.75, metalness: 0.15, ...o });
const sh = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const BOX = (w, h, d, m, x, y, z) => { const b = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)); b.position.set(x, y, z); return b; };
const RBOX = (w, h, d, r, m, x, y, z) => { const b = sh(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m)); b.position.set(x, y, z); return b; };
const CYL = (r1, r2, h, m, seg = 20) => sh(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m));
function star5(r) { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.38 : r; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } return new THREE.ShapeGeometry(s); }
function textDecal(str, w, h, color = '#efe8d2') { const t = canvasTex('txt' + str + color, 512, Math.round((512 * h) / w), (g, W, H) => { g.fillStyle = color; g.font = `900 ${H * 0.78}px "Arial Black", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, W / 2, H / 2 + 2); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4 })); }

// ---------- M4 Sherman (detailed). o.inflatable -> glossy rubber paint and .set(inflate, wobble, t) ----------
export function sherman(o = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const paint = o.inflatable ? new THREE.MeshPhysicalMaterial({ map: paintTex(o.color || '#5f6a3c', 2), roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.35 }) : std(paintTex(o.color || '#5b5d3a', 1), { roughness: 0.78, metalness: 0.25 });
  const steel = std(null, { color: hex('#3a3a36'), roughness: 0.55, metalness: 0.6 }), rubber = std(null, { color: hex('#1e1d1b'), roughness: 0.9, metalness: 0 });
  const trackM = std(trackTex(), { roughness: 0.85, metalness: 0.3 }), white = new THREE.MeshStandardMaterial({ color: '#ece6d2', roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -4 });
  // lower hull + upper hull (side profile extruded: sloped glacis, flat deck, sloped rear)
  body.add(BOX(5.2, 0.9, 2.2, paint, 0, 1.05, 0));
  const prof = new THREE.Shape(); prof.moveTo(-2.95, 0); prof.lineTo(2.55, 0); prof.lineTo(3.0, 0.35); prof.lineTo(1.75, 1.15); prof.lineTo(-2.7, 1.15); prof.lineTo(-2.95, 0.7); prof.closePath();
  const upper = sh(new THREE.Mesh(new THREE.ExtrudeGeometry(prof, { depth: 2.62, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 }), paint)); upper.position.set(0, 1.45, -1.31); body.add(upper);
  // fenders / sponsons
  for (const z of [1.42, -1.42]) body.add(BOX(5.9, 0.07, 0.62, paint, 0, 1.52, z));
  // running gear per side: 3 bogies x 2 road wheels, sprocket (front), idler (rear), return rollers, track loop with links
  for (const side of [1, -1]) {
    const z = side * 1.26;
    for (let b = 0; b < 3; b++) { const bx = -1.7 + b * 1.6; body.add(BOX(0.75, 0.55, 0.25, paint, bx, 0.82, z + side * 0.05)); body.add(BOX(0.12, 0.35, 0.12, steel, bx, 1.15, z + side * 0.2));
      for (const dx of [-0.36, 0.36]) { const wh = CYL(0.32, 0.32, 0.28, rubber, 24); wh.rotation.x = Math.PI / 2; wh.position.set(bx + dx, 0.5, z); body.add(wh); const hub = CYL(0.16, 0.16, 0.31, steel, 14); hub.rotation.x = Math.PI / 2; hub.position.copy(wh.position); body.add(hub); }
      const rr = CYL(0.13, 0.13, 0.22, rubber, 14); rr.rotation.x = Math.PI / 2; rr.position.set(bx + 0.1, 1.28, z); body.add(rr); }
    const spr = CYL(0.42, 0.42, 0.3, steel, 14); spr.rotation.x = Math.PI / 2; spr.position.set(2.7, 0.95, z); body.add(spr);
    for (let k = 0; k < 13; k++) { const a = (k / 13) * Math.PI * 2; const tooth = BOX(0.1, 0.1, 0.3, steel, 2.7 + Math.cos(a) * 0.45, 0.95 + Math.sin(a) * 0.45, z); tooth.rotation.z = a; body.add(tooth); }
    const idl = CYL(0.32, 0.32, 0.3, steel, 20); idl.rotation.x = Math.PI / 2; idl.position.set(-2.75, 0.72, z); body.add(idl);
    // track: stadium loop of links (instanced)
    const pts = []; const top = 1.43, bot = 0.17, x0 = -2.75, x1 = 2.7;
    for (let x = x0; x <= x1; x += 0.165) pts.push([x, bot, 0]); for (let a = -Math.PI / 2; a < Math.PI / 2; a += 0.22) pts.push([x1 + Math.cos(a) * 0.55, 0.95 + Math.sin(a) * 0.62, a]);
    for (let x = x1; x >= x0; x -= 0.165) pts.push([x, top, Math.PI]); for (let a = Math.PI / 2; a < Math.PI * 1.5; a += 0.22) pts.push([x0 + Math.cos(a) * 0.42, 0.8 + Math.sin(a) * 0.63, a]);
    const link = new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 0.08, 0.44), trackM, pts.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    pts.forEach(([x, y, a], i) => { e.set(0, 0, a); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)); link.setMatrixAt(i, m4); }); link.castShadow = link.receiveShadow = true; body.add(link);
  }
  // hull details: driver hatches, bow MG, headlights + guards, tools, spare track links on glacis, tow hooks, rear exhausts
  for (const z of [0.55, -0.55]) { const h = CYL(0.32, 0.32, 0.08, paint, 20); h.position.set(1.55, 2.62, z); body.add(h); body.add(BOX(0.16, 0.12, 0.08, steel, 1.7, 2.72, z)); }
  const bow = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), paint); bow.position.set(2.62, 2.0, 0.55); body.add(bow); const bmg = CYL(0.04, 0.04, 0.5, steel, 8); bmg.rotation.z = Math.PI / 2; bmg.position.set(2.85, 2.02, 0.55); body.add(bmg);
  for (const z of [1.05, -1.05]) { const hl = CYL(0.13, 0.11, 0.18, steel, 14); hl.rotation.z = Math.PI / 2; hl.position.set(3.0, 1.85, z); body.add(hl); const lens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), new THREE.MeshStandardMaterial({ color: '#fff3d0', emissive: '#ffe6a8', emissiveIntensity: o.lights ? 3 : 0.15 })); lens.rotation.y = Math.PI / 2; lens.position.set(3.1, 1.85, z); body.add(lens); body.add(BOX(0.05, 0.3, 0.32, steel, 3.12, 1.85, z)); }
  for (let i = 0; i < 4; i++) { const l = BOX(0.2, 0.06, 0.55, trackM, 2.25 - i * 0.05, 2.0 + i * 0.2, 0); l.rotation.z = 0.58; body.add(l); }
  for (const z of [0.9, -0.9]) body.add(BOX(0.18, 0.18, 0.2, steel, 3.05, 1.05, z));
  body.add(BOX(1.4, 0.05, 0.12, std(woodTex()), -1.6, 2.64, 1.05), BOX(0.35, 0.05, 0.22, steel, -0.85, 2.64, 1.05), BOX(1.6, 0.06, 0.1, std(woodTex()), -1.5, 2.64, -1.05));
  for (const z of [0.6, -0.6]) { const ex = CYL(0.14, 0.14, 0.3, steel, 12); ex.rotation.z = Math.PI / 2; ex.position.set(-3.0, 1.55, z); body.add(ex); }
  // turret: cast, rounded; mantlet + 75 mm gun + muzzle; commander cupola; .50 cal; periscopes; antenna
  const turret = new THREE.Group(); turret.position.set(-0.2, 2.62, 0); body.add(turret);
  const tb = sh(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.12, 0.85, 32), paint)); tb.position.y = 0.42; tb.scale.set(1.15, 1, 1); turret.add(tb);
  const dome = sh(new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), paint)); dome.position.y = 0.84; dome.scale.set(1.15, 0.28, 1); turret.add(dome);
  const bustle = RBOX(0.9, 0.6, 1.4, 0.25, paint, -1.05, 0.48, 0); turret.add(bustle);
  const mant = RBOX(0.45, 0.6, 1.0, 0.2, paint, 1.2, 0.45, 0); turret.add(mant);
  const gun = CYL(0.09, 0.1, 2.8, steel, 16); gun.rotation.z = Math.PI / 2; gun.position.set(2.75, 0.47, 0); turret.add(gun); const muz = CYL(0.13, 0.13, 0.22, steel, 16); muz.rotation.z = Math.PI / 2; muz.position.set(4.12, 0.47, 0); turret.add(muz);
  const cup = CYL(0.36, 0.38, 0.25, paint, 20); cup.position.set(-0.35, 1.0, -0.4); turret.add(cup); const lid = CYL(0.34, 0.34, 0.05, paint, 20); lid.position.set(-0.35, 1.2, -0.75); lid.rotation.x = -1.1; turret.add(lid);
  const mg = CYL(0.03, 0.03, 1.2, steel, 8); mg.rotation.z = Math.PI / 2 - 0.12; mg.position.set(0.15, 1.35, -0.4); turret.add(mg); turret.add(BOX(0.25, 0.18, 0.12, steel, -0.35, 1.32, -0.4), BOX(0.05, 0.3, 0.05, steel, -0.35, 1.15, -0.4));
  for (const [x, z] of [[0.45, 0.4], [0.2, -0.65]]) turret.add(BOX(0.18, 0.14, 0.12, steel, x, 1.0, z));
  const ant = CYL(0.012, 0.012, 2.6, steel, 6); ant.position.set(-1.25, 2.0, 0.55); ant.rotation.z = -0.12; turret.add(ant);
  // markings: white stars on hull sides + turret sides, air-recognition star in circle on deck, U.S.A. serial
  for (const sd of [1, -1]) { const s = new THREE.Mesh(star5(0.42), white); s.position.set(-0.3, 2.05, sd * 1.335); if (sd < 0) s.rotation.y = Math.PI; body.add(s);
    const ts = new THREE.Mesh(star5(0.3), white); ts.position.set(0, 0.45, sd * 1.15); if (sd < 0) ts.rotation.y = Math.PI; turret.add(ts);
    const usa = textDecal('U.S.A. 3081567', 1.6, 0.22); usa.position.set(1.0, 1.7, sd * 1.335); if (sd < 0) usa.rotation.y = Math.PI; body.add(usa); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.63, 40), white); ring.rotation.x = -Math.PI / 2; ring.position.set(-1.9, 2.625, 0); const ds = new THREE.Mesh(star5(0.5), white); ds.rotation.x = -Math.PI / 2; ds.position.set(-1.9, 2.626, 0); body.add(ring, ds);
  g.turret = turret; g.gun = gun;
  if (o.inflatable) { const valve = CYL(0.06, 0.06, 0.3, std(null, { color: hex('#c9b26a'), metalness: 0.7, roughness: 0.3 }), 10); valve.position.set(-2.4, 2.75, 0.9); body.add(valve); }
  g.set = (inflate = 1, wobble = 0, t = 0) => { const k = Math.max(0.05, inflate), w = wobble * Math.sin(t * 22); body.scale.set(1 + w * 0.05 + (1 - k) * 0.2, k * (1 - w * 0.07), 1 + w * 0.04 + (1 - k) * 0.16); body.rotation.z = wobble * Math.sin(t * 15) * 0.03; turret.rotation.y = (1 - k) * 0.5; gun.rotation.y = (1 - k) * 0.3; };
  g.set(1); return g;
}

// ---------- LCVP "Higgins boat" ----------
export function lcvp(o = {}) {
  const g = new THREE.Group(); const ply = std(woodTex('#7c7a62'), { roughness: 0.85, metalness: 0.05 }), grey = std(paintTex('#6a7068', 4), { roughness: 0.7, metalness: 0.3 }), steel = std(null, { color: hex('#4a4e4a'), roughness: 0.6, metalness: 0.5 });
  const prof = new THREE.Shape(); prof.moveTo(-5.4, 0.2); prof.lineTo(4.2, 0); prof.lineTo(4.4, 1.9); prof.lineTo(-5.6, 1.9); prof.closePath();
  for (const z of [1.5, -1.5]) { const side = sh(new THREE.Mesh(new THREE.ExtrudeGeometry(prof, { depth: 0.12, bevelEnabled: false }), ply)); side.position.z = z - 0.06; g.add(side); }
  g.add(BOX(9.8, 0.2, 3.1, ply, -0.6, 0.15, 0), BOX(0.15, 1.9, 3.1, ply, -5.5, 1.0, 0));
  for (let i = 0; i < 6; i++) g.add(BOX(0.06, 1.8, 3.0, steel, -4.5 + i * 1.5, 1.0, 0));
  for (const z of [1.56, -1.56]) g.add(BOX(10, 0.12, 0.14, grey, -0.6, 1.95, z));
  g.add(BOX(1.1, 1.0, 1.0, grey, -4.7, 2.4, 1.0)); const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 20), steel); wheel.position.set(-4.4, 2.6, 0.4); wheel.rotation.y = Math.PI / 2; g.add(wheel);
  for (const z of [1.2, -1.2]) { const mg = CYL(0.04, 0.04, 1.1, steel, 8); mg.rotation.z = Math.PI / 2; mg.position.set(-4.8, 2.4, z); g.add(mg); }
  const piv = new THREE.Group(); piv.position.set(4.35, 0.15, 0); g.add(piv); const ramp = BOX(0.18, 2.0, 3.0, grey, 0, 1.0, 0); piv.add(ramp); for (let i = 0; i < 4; i++) piv.add(BOX(0.06, 1.9, 0.08, steel, -0.1, 1.0, -1.1 + i * 0.73));
  const num = textDecal(o.num || 'PA 26-21', 2.2, 0.38, '#f2eee2'); num.position.set(0, 1.4, 1.58); g.add(num); const num2 = num.clone(); num2.position.z = -1.58; num2.rotation.y = Math.PI; g.add(num2);
  g.ramp = piv; g.rotation.y = -Math.PI / 2; const outer = new THREE.Group(); outer.add(g); outer.ramp = piv; return outer; // outer faces +z
}

// ---------- coast defences ----------
export function bunker(o = {}) { const g = new THREE.Group(), c = std(concreteTex(), { roughness: 0.95, metalness: 0 });
  g.add(RBOX(7, 3, 6, 0.35, c, 0, 1.5, 0)); g.add(RBOX(7.6, 0.7, 6.6, 0.3, c, 0, 3.1, 0));
  const slit = BOX(4.2, 0.55, 0.4, new THREE.MeshBasicMaterial({ color: '#0d0c0b' }), 0, 2.0, 2.9); g.add(slit);
  const gun = CYL(0.14, 0.17, 2.6, std(null, { color: hex('#2e2e2c'), metalness: 0.6, roughness: 0.5 }), 12); gun.rotation.x = Math.PI / 2; gun.position.set(0.4, 2.0, 3.9); g.add(gun);
  for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + (i % 3) * 0.15, 0), std(null, { color: hex('#6f6a5e') })); s.position.set(-3.6 + i * 0.8, 0.2, 3.2 + (i % 2) * 0.4); sh(s); g.add(s); }
  return g; }
export function hedgehog(o = {}) { const g = new THREE.Group(), m = std(paintTex('#5a4632', 6), { roughness: 0.7, metalness: 0.5 });
  for (const [rx, ry] of [[0, 0], [Math.PI / 2, 0], [0, Math.PI / 2]]) { const beam = new THREE.Group(); const a = BOX(2.4, 0.16, 0.06, m, 0, 0, 0), b = BOX(2.4, 0.06, 0.16, m, 0, 0, 0); beam.add(a, b); beam.rotation.set(rx + 0.6, ry, 0.62); g.add(beam); }
  g.position.y = 0.72; return g; }
export function sandbags(n = 8) { const g = new THREE.Group(), m = std(paintTex('#b8a47a', 8), { roughness: 1, metalness: 0 });
  for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) { const b = RBOX(0.62, 0.26, 0.36, 0.11, m, i * 0.6 - n * 0.3 + (r ? 0.3 : 0), 0.13 + r * 0.25, 0); g.add(b); } return g; }
