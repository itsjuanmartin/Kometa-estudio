// d3.js — EP03 Short 1 in "2D characters in a 3D world": low-poly 3D sets (three-kit) + Tomi drawn in 2D,
// anchored to a 3D point so he moves with the camera. Vertical 1080x1920, 30 fps.
import { E, registerShot, ease, clamp, lerp, prog, text, FONTS, rng, key } from '/engine/core.js';
import { POSES, breathe } from '/engine/rig2d.js';
import { drawToon, OL } from '/engine/toon2d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as K from '/engine/kit3d.js';

const W = 1080, H = 1920;
const MOUTH = await (await fetch('/project/timeline/mouth.json')).json().catch(() => ({ fps: 100, v: [] }));
const talkAt = (gt) => { const i = gt * MOUTH.fps, a = Math.floor(i), k = i - a; const v0 = MOUTH.v[a] || 0, v1 = MOUTH.v[a + 1] || 0; return Math.min(0.9, (v0 + (v1 - v0) * k) * 0.95); };
const TOMI = { top: 'uniform', color: '#7a6e4a', legs: '#6a5f40', shoes: '#2a1f18', belt: '#4a3a24', hair: 'side', hairColor: '#2e2420', hat: 'beret', hatColor: '#3a3a5a' };
const GARBO = { top: 'suit', color: '#3a3a44', color2: '#7a2a2a', legs: '#3a3a44', shoes: '#1a1a1e', hair: 'side', hairColor: '#1e1a18', mustache: true, mustacheColor: '#1e1a18' };
const pop = (t, at, d = 0.35) => ease.outBack(prog(t, at, at + d));
const smooth = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };

// ---------- 3D builders ----------
let T3; // three-kit module
const tex = (w, h, draw) => T3.canvasTex(w, h, draw);
let _soft; const softTex = () => (_soft ||= tex(128, 128, (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));
function sprite(color, size, opacity = 1, additive = false) { const { THREE } = T3; const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: new THREE.Color(color), transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: !additive })); m.scale.set(size, size, 1); return m; }
// rising smoke column: returns {group, update(t)}
function smoke(x, y, z, o = {}) { const { THREE } = T3; const n = o.n || 14, g = new THREE.Group(), r = rng(o.seed || 1), puffs = [];
  for (let i = 0; i < n; i++) { const s = sprite(o.color || '#3a3434', 1, 0.6); g.add(s); puffs.push({ s, ph: i / n, dx: (r() - 0.5) * 2, sz: 0.8 + r() }); }
  g.position.set(x, y, z);
  return { group: g, update(t) { for (const p of puffs) { const k = (p.ph + t * (o.speed || 0.12)) % 1; p.s.position.set(p.dx * k * 3 + k * k * (o.wind || 6), k * (o.h || 18), 0); const sz = (o.size || 3) * (0.5 + k * 2.2) * p.sz; p.s.scale.set(sz, sz, 1); p.s.material.opacity = (o.op || 0.55) * Math.sin(Math.PI * k); } } };
}
// floating embers / fireflies / dust (additive points)
function embers(n, box, o = {}) { const { THREE } = T3; const r = rng(o.seed || 7), base = []; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) base.push([box[0] + r() * (box[3] - box[0]), box[1] + r() * (box[4] - box[1]), box[2] + r() * (box[5] - box[2]), 0.4 + r(), r() * 6]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color(o.color || '#ffb04a'), size: o.size || 0.25, map: softTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: o.op ?? 1 }));
  const hgt = box[4] - box[1];
  m.update = (t) => { for (let i = 0; i < n; i++) { const [x, y, z, sp, ph] = base[i]; pos[i * 3] = x + Math.sin(t * 0.8 + ph) * 0.6; pos[i * 3 + 1] = box[1] + ((y - box[1] + t * sp * (o.rise ?? 1.2)) % hgt); pos[i * 3 + 2] = z + Math.cos(t * 0.6 + ph) * 0.6; } geo.attributes.position.needsUpdate = true; };
  return m;
}
function starField(n = 600) { const { THREE } = T3; const r = rng(3), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, e = 0.08 + r() * 1.2, R = 300; pos.set([Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: true, map: softTex(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); }
// animated sea (vertex waves)
function sea(w, d, color, o = {}) { const { THREE } = T3; const geo = new THREE.PlaneGeometry(w, d, 110, 110); geo.rotateX(-Math.PI / 2); const base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.38, metalness: 0, flatShading: true, emissive: new THREE.Color(color), emissiveIntensity: o.glow ?? 0.25 })); m.receiveShadow = true;
  m.update = (t) => { const p = geo.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = base[i], z = base[i + 2]; p[i + 1] = Math.sin(x * 0.18 + t * 1.6) * 0.35 + Math.sin(z * 0.27 - t * 1.1) * 0.28 + Math.sin((x + z) * 0.5 + t * 2.4) * 0.08; } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); };
  return m; }
function blast(x, z, o = {}) { const { THREE } = T3; const g = new THREE.Group(); g.position.set(x, 0, z); const fire = [0, 1, 2].map(i => { const s = o.water ? sprite(['#ffffff', '#e8f6ff', '#cfeaf5'][i], 1, 1, false) : sprite(['#ffe08a', '#ff8a3a', '#d8401c'][i], 1, 1, i === 0); g.add(s); return s; }); const sm = sprite('#3a302c', 1, 0.9); const sm2 = sprite('#4a3a32', 1, 0.8); g.add(sm2); g.add(sm);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.2, 40), new THREE.MeshBasicMaterial({ color: '#ffe0a0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.2; g.add(ring);
  const light = new THREE.PointLight('#ff9a4a', 0, 60, 2); light.position.y = 3; g.add(light);
  const deb = embers(70, [-1, 0, -1, 1, 1, 1], { color: '#ffb04a', size: 0.5, seed: o.seed || 1 }); g.add(deb); const dp = deb.geometry.attributes.position.array; const r = rng(o.seed || 1), v = Array.from({ length: 70 }, () => [(r() - 0.5) * 22, 8 + r() * 14, (r() - 0.5) * 22]);
  g.update = (t) => { const k = t - (o.at || 0); const on = k >= 0; const S = o.s || 1; fire.forEach((f, i) => { const e = clamp(k / (0.35 + i * 0.12)); f.visible = on && k < 1.4; if (o.water) { f.scale.set(S * (2 + 4 * ease.out(e)) * (1 - i * 0.2), S * (3 + 16 * ease.out(e)) * (1 - i * 0.15), 1); f.position.y = S * (2 + 8 * ease.out(e) - Math.max(0, k - 0.8) * 10); } else { f.scale.setScalar(S * (2 + 10 * ease.out(e)) * (1 - i * 0.2)); f.position.y = S * (2 + k * 4 + i); } f.material.opacity = clamp(1 - k / (1.0 + i * 0.2)); });
    sm.visible = on && !o.water; const se = clamp(k / 3); sm.scale.setScalar(S * (4 + 16 * ease.out(se))); sm.position.y = S * (4 + k * 3); sm.material.opacity = on ? 0.85 * (1 - se) : 0; sm2.visible = sm.visible; sm2.scale.setScalar(S * (3 + 11 * ease.out(se))); sm2.position.set(S * 2, S * (2 + k * 2), 0); sm2.material.opacity = on ? 0.7 * (1 - se) : 0;
    ring.visible = on && k < 0.8; ring.scale.setScalar(1 + k * 22 * S); ring.material.opacity = clamp(1 - k / 0.8) * 0.35; light.intensity = on && !o.water ? 500 * S * Math.max(0, 1 - k / 0.6) : 0;
    deb.visible = on && k < 2.2; for (let i = 0; i < 70; i++) { dp[i * 3] = v[i][0] * k * 0.6; dp[i * 3 + 1] = Math.max(0, v[i][1] * k - 9.8 * k * k); dp[i * 3 + 2] = v[i][2] * k * 0.6; } deb.geometry.attributes.position.needsUpdate = true; };
  return g; }
function hedgehogOld(x, z, s = 1, rot = 0) { const { THREE } = T3; const g = new THREE.Group(), m = T3.mat('#4a4440', { roughness: 0.6, metalness: 0.4 });
  for (const [rx, rz] of [[0.6, 0], [-0.6, 0], [0, 1.57]]) { const b = T3.box(2.4, 0.18, 0.18, m); b.rotation.set(rx, rot + rz, 0.9); g.add(b); } g.position.set(x, 0.75 * s, z); g.scale.setScalar(s); return g; }
function craft(x, z, o = {}) { const { THREE } = T3; const g = new THREE.Group(), hull = T3.mat(o.color || '#5f6b62', { flat: true, roughness: 0.7 });
  g.add(T3.box(3.2, 1.2, 6, hull, 0, 0.3, 0)); const piv = new THREE.Group(); piv.position.set(0, -0.1, 3.05); const ramp = T3.box(3.0, 2.2, 0.2, T3.mat('#4f5a52'), 0, 1.1, 0); piv.add(ramp); g.add(piv); g.ramp = piv; g.add(T3.box(0.25, 0.6, 6, hull, -1.5, 1.1, 0), T3.box(0.25, 0.6, 6, hull, 1.5, 1.1, 0));
  const helm = T3.mat('#4a5a3a'); const body = T3.mat('#6b6a45'); const r = rng(o.seed || 2);
  for (let i = 0; i < 12; i++) { if (o.noCenter && i % 3 === 1) continue; const px = -1 + (i % 3) * 1, pz = -2.2 + Math.floor(i / 3) * 1.2 + (r() - 0.5) * 0.3; g.add(T3.cyl(0.18, 0.2, 0.7, body, px, 1.15, pz, 8)); g.add(T3.sphere(0.2, helm, px, 1.6, pz)); }
  const wake = new THREE.Mesh(new THREE.PlaneGeometry(4, 12), new THREE.MeshBasicMaterial({ map: softTex(), color: '#ffffff', transparent: true, opacity: 0.45, depthWrite: false })); wake.rotation.x = -Math.PI / 2; wake.position.set(0, 0.25, -8); g.add(wake);
  g.position.set(x, 0, z); g.rotation.y = o.rot || 0; return g; }
function bunkerOld(x, z, s = 1) { const { THREE } = T3; const g = new THREE.Group(), c = T3.mat('#8d8a80', { flat: true });
  g.add(T3.box(6, 2.6, 5, c, 0, 1.3, 0)); g.add(T3.box(4, 0.45, 0.3, T3.basic('#141210'), 0, 1.8, 2.52)); const gun = T3.cyl(0.16, 0.16, 3, T3.mat('#3a3a38'), 0, 1.8, 3.5, 10); gun.rotation.x = Math.PI / 2; g.add(gun);
  g.position.set(x, 0, z); g.scale.setScalar(s); return g; }
function cliffs(z, color = '#9a8a62', grass = '#5f7a3c') { const { THREE } = T3; const g = new THREE.Group(), r = rng(9), m = T3.mat(color, { flat: true }), gm = T3.mat(grass, { flat: true });
  for (let i = 0; i < 14; i++) { const x = -70 + i * 10 + r() * 4, h = 10 + r() * 7, w = 12 + r() * 6; const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(w / 2, 0), m); rock.scale.set(1, h / w * 1.6, 0.9); rock.position.set(x, h * 0.35, z + r() * 4); rock.castShadow = rock.receiveShadow = true; g.add(rock);
    const top = T3.box(w * 0.9, 0.8, w * 0.7, gm, x, h * 0.35 + h * 0.75, z + r() * 3); g.add(top); }
  return g; }
function clouds(n, y, spread, o = {}) { const { THREE } = T3; const g = new THREE.Group(), r = rng(o.seed || 5), m = T3.mat(o.color || '#f6efe4', { flat: true, roughness: 1 });
  for (let i = 0; i < n; i++) { const c = new THREE.Group(); for (let k = 0; k < 5; k++) { const s = T3.sphere(2 + r() * 2.5, m, (k - 2) * 2.4 + r(), r() * 1.2, r() * 2); s.castShadow = false; c.add(s); } c.position.set((r() - 0.5) * spread, y + r() * 6, (r() - 0.5) * spread); c.scale.set(1.4, 0.7, 1); g.add(c); } return g; }
function starGeo(r = 0.5) { const { THREE } = T3; const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? sh.lineTo(x, y) : sh.moveTo(x, y); } sh.closePath(); return new THREE.ShapeGeometry(sh); }
function decal(w, h, draw) { const { THREE } = T3; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex(256, Math.round(256 * h / w), draw), transparent: true, roughness: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); return m; }
// inflatable Sherman: rubbery shine; inflate 0..1, wobble = jiggle amount
function rubberTankOld(o = {}) { const { THREE } = T3; const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const rub = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(o.color || '#6f8146'), roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: new THREE.Color('#33382a'), roughness: 0.8 });
  const RB = (w, h, d, r, m) => { const x = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m); x.castShadow = x.receiveShadow = true; return x; };
  const tl = RB(5.6, 1.1, 0.9, 0.42, dark); tl.position.set(0, 0.6, 1.25); const tr = tl.clone(); tr.position.z = -1.25; body.add(tl, tr);
  for (const z of [1.72, -1.72]) for (let i = 0; i < 5; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 18), T3.mat('#55594a')); w.rotation.x = Math.PI / 2; w.position.set(-2 + i, 0.55, z); body.add(w); }
  const hull = RB(5.2, 1.3, 2.6, 0.55, rub); hull.position.y = 1.55; body.add(hull);
  const front = RB(1.6, 1.0, 2.5, 0.45, rub); front.position.set(2.3, 1.25, 0); front.rotation.z = -0.5; body.add(front);
  const turret = RB(2.2, 1.0, 1.9, 0.48, rub); turret.position.set(-0.3, 2.65, 0); body.add(turret);
  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 20), rub); hatch.position.set(-0.6, 3.2, 0.3); body.add(hatch);
  const barrel = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 2.7, 6, 14), rub); barrel.rotation.z = Math.PI / 2; barrel.position.set(2.1, 2.7, 0); barrel.castShadow = true; body.add(barrel);
  const white = new THREE.MeshStandardMaterial({ color: '#f1ecdc', roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const z of [1, -1]) { const st = new THREE.Mesh(starGeo(0.5), white); st.position.set(0.4, 1.6, z * 1.31); if (z < 0) st.rotation.y = Math.PI; body.add(st);
    const ts = new THREE.Mesh(starGeo(0.34), white); ts.position.set(-0.3, 2.68, z * 0.96); if (z < 0) ts.rotation.y = Math.PI; body.add(ts);
    const usa = decal(1.5, 0.38, (g, w, h) => { g.fillStyle = '#f1ecdc'; g.font = `bold ${h * 0.8}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('U.S.A. 3081', w / 2, h / 2); }); usa.position.set(-1.5, 1.85, z * 1.31); if (z < 0) usa.rotation.y = Math.PI; body.add(usa); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.52, 0.6, 32), white); ring.rotation.x = -Math.PI / 2; ring.position.set(-0.3, 3.16, 0); const top = new THREE.Mesh(starGeo(0.48), white); top.rotation.x = -Math.PI / 2; top.position.set(-0.3, 3.16, 0); body.add(ring, top);
  const valve = T3.cyl(0.08, 0.08, 0.35, '#c9b26a', -2.4, 2.25, 0.8, 8); body.add(valve);
  g.set = (inflate = 1, wobble = 0, t = 0) => { const k = Math.max(0.05, inflate); const w = wobble * Math.sin(t * 22); body.scale.set(1 + w * 0.06 + (1 - k) * 0.22, k * (1 - w * 0.08), 1 + w * 0.05 + (1 - k) * 0.18); body.rotation.z = wobble * Math.sin(t * 15) * 0.035; barrel.rotation.y = (1 - k) * 0.6; };
  g.set(1); return g; }
function cardboardBoat(x, z, s = 1, seed = 1) { const { THREE } = T3; const g = new THREE.Group(), card = T3.mat('#b8915c', { flat: true }), dark = T3.mat('#7a5c38');
  g.add(T3.box(3, 1.2, 10, card, 0, 0.6, 0)); g.add(T3.box(2.4, 2.2, 2.6, card, 0, 2.2, -1)); g.add(T3.cyl(0.35, 0.35, 2.2, dark, 0, 4.2, -1, 10)); g.add(T3.box(0.06, 1.2, 10, dark, 1.52, 0.6, 0));
  const stays = T3.box(0.1, 2.8, 0.1, T3.mat('#5a4a32'), 1.8, 1.0, 2); stays.rotation.z = -0.5; g.add(stays);
  g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = (seed % 2 ? 0.15 : -0.1); return g; }

function hedgehog(x, z, s = 1, rot = 0) { const h = K.hedgehog(); h.position.set(x, 0.72 * s, z); h.scale.setScalar(s); h.rotation.y = rot; return h; }
function bunker(x, z, s = 1) { const b = K.bunker(); b.position.set(x, 0, z); b.scale.setScalar(s); return b; }
function rubberTank() { return K.sherman({ inflatable: true }); }
function heroLCVP() { const { THREE } = T3; const l = K.lcvp({ num: 'PA 26-14' }); const helm = new THREE.MeshStandardMaterial({ color: '#4c5a38', roughness: 0.6 }), coat = new THREE.MeshStandardMaterial({ color: '#7a7350', roughness: 0.9 }), pack = new THREE.MeshStandardMaterial({ color: '#5e5a3c', roughness: 0.9 });
  for (let i = 0; i < 6; i++) for (const x of [-0.95, 0.95]) { const z = -3.6 + i * 1.05, y = 0.25; const b = T3.cyl(0.24, 0.27, 1.0, coat, x, y + 0.75, z, 10); const hd = T3.sphere(0.17, '#f0dcc4', x, y + 1.42, z); const hm = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), helm); hm.position.set(x, y + 1.47, z); hm.scale.y = 0.75; hm.castShadow = true; const pk = T3.box(0.4, 0.45, 0.22, pack, x, y + 1.0, z - 0.25); l.add(b, hd, hm, pk); }
  l.openRamp = (k) => { l.ramp.rotation.z = -1.42 * k; }; return l; }
// ---------- 2D helpers ----------
const proj = (st, p) => { const { THREE } = T3; const v = new THREE.Vector3(...p); const dist = v.distanceTo(st.camera.position); v.project(st.camera); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, dist, vis: v.z < 1 }; };
// a 2D character standing on 3D point p (feet), height h metres
function anchored(g, st, p, h, opts) { const a = proj(st, p); if (!a.vis) return; const top = proj(st, [p[0], p[1] + h, p[2]]); const px = Math.abs(a.y - top.y); const s = px / 330; drawToon(g, { x: a.x, y: a.y, s, ...opts }); return { ...a, s, top }; }
function stamp(g, t, str, at = 0.2, y = 330) { const k = pop(t, at, 0.4); if (k <= 0) return; g.save(); g.translate(W / 2, y); g.scale(k, k); g.rotate(-0.03); const w = 40 + str.length * 27; g.fillStyle = '#f6efe1'; g.strokeStyle = OL; g.lineWidth = 7; g.beginPath(); g.roundRect(-w / 2, -48, w, 96, 20); g.fill(); g.stroke(); text(g, str, 0, 3, { size: 50, color: OL, font: FONTS.title, weight: 700 }); g.restore(); }
function big(g, t, str, at, y, o = {}) { const k = pop(t, at, 0.3); if (k <= 0) return; g.save(); g.translate(W / 2 + (o.x || 0), y); g.scale(k, k); g.rotate(o.rot || 0); text(g, str, 0, 0, { size: o.size || 150, color: o.color || '#ffd84a', font: FONTS.title, weight: 700, stroke: (o.size || 150) * 0.16, strokeColor: OL }); g.restore(); }
function glow(g, x, y, r, col, a = 1) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
function usFlag(g, t, at, y) { const k = pop(t, at, 0.35); if (k <= 0) return; g.save(); g.translate(W / 2, y); g.scale(k, k); const w = 150, h = 90; g.fillStyle = '#f6efe1'; g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.roundRect(-w / 2 - 230, -h / 2 - 14, w + 460, h + 28, 20); g.fill(); g.stroke();
  const x0 = -w / 2 - 210, y0 = -h / 2; for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#c8202f'; g.fillRect(x0, y0 + i * h / 13, w, h / 13 + 0.5); } g.fillStyle = '#2a3a7a'; g.fillRect(x0, y0, w * 0.42, h * 0.54); g.strokeRect(x0, y0, w, h);
  text(g, 'EJÉRCITO DE EE. UU.', 95, -12, { size: 36, color: OL, font: FONTS.title, weight: 700 }); text(g, '(FALSO)', 95, 26, { size: 32, color: '#c8202f', font: FONTS.title, weight: 700 }); g.restore(); }
function letterbox(g, k = 1) { const v = g.createLinearGradient(0, 0, 0, H); v.addColorStop(0, `rgba(0,0,0,${0.45 * k})`); v.addColorStop(0.18, 'rgba(0,0,0,0)'); v.addColorStop(0.82, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.55 * k})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }

// ---------- sets ----------
function normandy(T, o = {}) {
  const st = T.stage({ mood: 'day', fov: o.fov || 42, sky: '#9cc4ee', fog: [120, 520], fogColor: '#a8c8ea', keyColor: '#fff1d8', keyPos: [-30, 34, -30], keyIntensity: 3.0, ambient: 1.25, ambientSky: '#b8d0ee', bloom: 0.35, bloomThreshold: 0.97, shadowSize: 60 }); st.add(K.skyDome({ top: '#2f6cc8', mid: '#5c98e0', horizon: '#9cc6ec', seed: 6 }));
  st.camera.far = 900; st.camera.updateProjectionMatrix();
  const sand = T.ground(400, 140, '#ffffff', K.sandTex([40, 14])); sand.position.z = 45; st.add(sand);
  const s = sea(420, 260, '#4f8fa8', { glow: 0.3 }); s.position.set(0, -0.2, -150); st.add(s);
  st.add(cliffs(78));
  st.add(bunker(-14, 60, 1.4), bunker(22, 64, 1.2));
  const r = rng(4); for (let i = 0; i < 26; i++) st.add(hedgehog(-60 + r() * 120, -12 + r() * 40, 0.9 + r() * 0.4, r() * 3));
  const crafts = []; for (let i = 0; i < 7; i++) { const c = heroLCVP(); c.position.set(-30 + i * 10 + r() * 4, 0, -32 - r() * 38); c.rotation.y = (r() - 0.5) * 0.2; c.openRamp(0); crafts.push(c); st.add(c); }
  const smokes = [smoke(-20, 0, 40, { seed: 1 }), smoke(10, 0, 30, { seed: 2, size: 4 }), smoke(30, 0, 55, { seed: 3, h: 24 }), smoke(-40, 0, 20, { seed: 4 })]; smokes.forEach(x => st.add(x.group));
  const emb = embers(260, [-40, 0, -20, 40, 22, 40], { seed: 3, size: 0.35 }); st.add(emb);
  
  
  let hero = null, blasts = []; if (o.hero) { hero = heroLCVP(); st.add(hero); blasts = [[-7, -44, 0.45, 1.0, 1], [8, -36, 1.0, 1.1, 1], [-4, -10, 1.6, 1.5, 0], [12, 0, 2.3, 1.6, 0], [-14, 8, 3.0, 1.7, 0], [5, -28, 3.5, 1.0, 1]].map(([x, z, at, sc, w], i) => { const b = blast(x, z, { at, s: sc, seed: i + 3, water: !!w }); st.add(b); return b; }); }
  return { stage: st, sea: s, crafts, smokes, emb, hero, blasts, render: () => st.render(), dispose: () => st.dispose() };
}
function upd(S0, t) { S0.sea?.update(t); S0.smokes?.forEach(x => x.update(t)); S0.emb?.update?.(t); S0.crafts?.forEach((c, i) => { c.position.z += 0; c.position.y = Math.sin(t * 1.3 + i) * 0.18; c.rotation.z = Math.sin(t * 1.1 + i) * 0.03; }); }
function nightField(T, o = {}) {
  const st = T.stage({ mood: 'night', fov: o.fov || 40, sky: ['#060a1e', '#16204a', '#34386c'], fog: [30, 170], fogColor: '#26305e', keyColor: '#b3c4ff', keyPos: [30, 40, -50], keyIntensity: 2.6, ambient: 1.8, ambientSky: '#6a7cc0', bloom: 0.8, bloomThreshold: 0.78, shadowSize: 40 });
  st.camera.far = 900; st.camera.updateProjectionMatrix();
  st.add(T.ground(400, 400, '#8fa6c8', K.grassTex()));
  const r = rng(12); for (let i = 0; i < 40; i++) { const x = -90 + r() * 180, z = -110 - r() * 60; st.add(T.tree3D(x, z, 1.4 + r(), '#122019')); }
  for (let i = 0; i < 14; i++) st.add(T.box(12, 1.4, 1.2, T.mat('#1a3324', { flat: true }), -70 + i * 11, 0.7, -60));
  const moon = new T.THREE.Mesh(new T.THREE.SphereGeometry(10, 32, 16), new T.THREE.MeshBasicMaterial({ color: new T.THREE.Color(2.4, 2.4, 2.1), fog: false })); moon.position.set(70, 120, -420); st.add(moon);
  st.add(starField());
  const fog = []; for (let i = 0; i < 18; i++) { const sp = sprite('#8a96c8', 30 + r() * 20, 0.12); sp.position.set(-80 + r() * 160, 2 + r() * 3, -40 - r() * 90); st.add(sp); fog.push(sp); }
  const flies = embers(140, [-30, 0.5, -40, 30, 6, 20], { color: '#ffd77a', size: 0.22, rise: 0.15, seed: 9 }); st.add(flies);
  return { stage: st, emb: flies, fog, render: () => st.render(), dispose: () => st.dispose() };
}

// ---------- shots ----------
const SC = {
  beach: { kind: '3d', init: (T) => { const N = normandy(T, { hero: true, fov: 50 }); N.stage.scene.fog.near = 70; N.stage.scene.fog.far = 300; return N; },
    draw(S0, t) { upd(S0, t); S0.blasts.forEach(b => b.update(t)); const h = S0.hero; h.position.set(0, Math.sin(t * 1.3) * 0.2, -66 + t * 3.2); h.openRamp(ease.outBack(clamp((t - 0.15) / 0.35)));
      const hp = h.position; const v = key(t, [[0, { pos: [0, 2.6, -4.2], look: [0, 1.6, 12] }], [0.9, { pos: [0, 3.4, -2.2], look: [0, 1.8, 30] }], [4.13, { pos: [-3, 7.5, 9], look: [0, 3, 70] }]]);
      const c = S0.stage.camera; c.position.set(hp.x + v.pos[0], hp.y + v.pos[1], hp.z + v.pos[2]); c.lookAt(hp.x + v.look[0], v.look[1], hp.z + v.look[2]);
      let sh = 0; for (const [at, a] of [[0.35, 0.35], [1.05, 0.25], [1.8, 0.3], [2.7, 0.22], [3.4, 0.25]]) if (t > at) sh += a * Math.exp(-(t - at) * 6); c.position.x += Math.sin(t * 63) * sh; c.position.y += Math.cos(t * 51) * sh; c.rotation.z += Math.sin(t * 37) * sh * 0.05; },
    overlay(g, t) { if (t < 0.5) { g.fillStyle = `rgba(255,240,210,${clamp(1 - t / 0.5) * 0.9})`; g.fillRect(0, 0, W, H); } letterbox(g); stamp(g, t, '6 JUN 1944 · NORMANDÍA', 0.6, 560); } },
  crafts: { kind: '3d', init: (T) => normandy(T, { fov: 38 }),
    draw(S0, t) { upd(S0, t + 4); const k = smooth(t / 2.66); const c = S0.stage.camera; c.position.set(lerp(-22, 8, k), lerp(4, 17, k), lerp(-72, -92, k)); const tg = S0.crafts[3].position; c.lookAt(tg.x, 0.8, tg.z); },
    overlay(g, t) { letterbox(g); big(g, t, 'BARCOS', 0.95, 860, { size: 120, color: '#f6efe1', rot: -0.04 }); big(g, t, 'Y VALENTÍA', 1.45, 1000, { size: 110, rot: 0.03 }); } },
  tomiNo: { kind: '3d', init: (T) => normandy(T, { fov: 35 }),
    draw(S0, t) { upd(S0, t + 7); const k = smooth(t / 1.41); const c = S0.stage.camera; c.position.set(lerp(-3, -1.2, k), lerp(2.2, 1.9, k), lerp(-10, -6.5, k)); c.lookAt(0, 1.6, 0); if (t > 0.98) { const s = (1 - clamp((t - 0.98) / 0.35)) * 0.08; c.position.x += Math.sin(t * 70) * s; c.position.y += Math.cos(t * 55) * s; } },
    overlay(g, t, info, S0) { anchored(g, S0.stage, [0, 0, 0], 1.75, { facing: 1, outfit: TOMI, pose: t < 0.9 ? breathe(POSES.shrug, t, 1) : POSES.crossArms, expr: t < 0.9 ? 'smirk' : 'determined', talk: talkAt(info.globalT), blink: (t % 2.6) > 2.5, t });
      big(g, t, '¿VERDAD?', 0.0, 590, { size: 120, color: '#f6efe1', rot: -0.05 }); if (t > 0.95) big(g, t, 'NO.', 0.98, 790, { size: 260, color: '#ff5a4a' }); letterbox(g, 0.7); } },
  rise: { kind: '3d', init: (T) => normandy(T, { fov: 48 }),
    draw(S0, t) { upd(S0, t + 9); const k = ease.inOut(clamp(t / 3.18)); const c = S0.stage.camera; c.position.set(lerp(4, -2, k), lerp(5, 30, k), lerp(-45, 25, k)); c.lookAt(0, lerp(4, 12, k), lerp(40, 130, k));
      const night = clamp((t - 1.8) / 1.38); S0.stage.sun.intensity = 2.6 * (1 - night) + 0.3; S0.stage.hemi.intensity = 1.0 * (1 - night * 0.75); S0.stage.scene.fog.color.setRGB(lerp(0.85, 0.11, night), lerp(0.7, 0.14, night), lerp(0.6, 0.3, night)); },
    overlay(g, t) { big(g, t, 'SEMANAS ANTES…', 1.85, 860, { size: 112, color: '#f6efe1' }); const n = clamp((t - 1.8) / 1.38); g.fillStyle = `rgba(6,10,30,${n * 0.55})`; g.fillRect(0, 0, W, H); } },
  tanks: { kind: '3d', init: (T) => { const N = nightField(T, { fov: 44 }); const r = rng(2); N.tanks = []; for (let i = 0; i < 12; i++) { const tk = rubberTank(); tk.position.set((i % 6) * 9 - 22, 0, Math.floor(i / 6) * -12 + r()); tk.rotation.y = 0.5 + r() * 0.2; N.stage.add(tk); N.tanks.push(tk); }
      const lamp = new T.THREE.PointLight('#ffb860', 60, 30, 2); lamp.position.set(-4, 3, 6); N.stage.add(lamp); N.stage.add(T.sphere(0.25, T.basic('#ffd9a0'), -4, 3, 6)); return N; },
    draw(N, t) { N.emb.update(t); const c = N.stage.camera; const k = smooth(t / 1.3); c.position.set(lerp(-30, -6, k), lerp(4, 2.4, k), lerp(14, 12, k)); c.lookAt(lerp(-10, 8, k), 1.2, -4); N.tanks.forEach((tk, i) => tk.set(1, 0.15, t + i)); },
    overlay(g, t) { letterbox(g); usFlag(g, t, 0.45, 760); big(g, t, 'TANQUES DE GOMA', 0.15, 620, { size: 108, color: '#9fe07a', rot: -0.03 }); } },
  boats: { kind: '3d', init: (T) => { const st = T.stage({ mood: 'night', fov: 42, sky: ['#070b20', '#1a2450', '#3b3a6c'], fog: [20, 120], fogColor: '#1f2a52', keyColor: '#c4d0ff', keyPos: [20, 30, 20], keyIntensity: 2.4, ambient: 1.3, ambientSky: '#5a6aa8', bloom: 0.8, bloomThreshold: 0.78 });
      const s = sea(300, 300, '#2a4f78', { glow: 0.2 }); const dl = new T.THREE.PointLight('#ffb860', 120, 40, 2); dl.position.set(0, 6, 4); st.add(dl); st.add(s); st.add(starField()); const boats = []; for (let i = 0; i < 5; i++) { const b = cardboardBoat(-24 + i * 12, -10 - (i % 2) * 8, 1, i); boats.push(b); st.add(b); }
      const moon = new T.THREE.Mesh(new T.THREE.SphereGeometry(8, 24, 12), new T.THREE.MeshBasicMaterial({ color: new T.THREE.Color(2.4, 2.4, 2.1), fog: false })); moon.position.set(-60, 90, -300); st.add(moon);
      return { stage: st, sea: s, boats, render: () => st.render(), dispose: () => st.dispose() }; },
    draw(S0, t) { S0.sea.update(t); S0.boats.forEach((b, i) => { b.position.y = Math.sin(t * 1.4 + i) * 0.25; b.rotation.z = Math.sin(t * 1.2 + i) * 0.05; }); const k = smooth(t / 1.18); const c = S0.stage.camera; c.position.set(lerp(18, 4, k), lerp(3, 5, k), lerp(16, 20, k)); c.lookAt(lerp(-4, -10, k), 1.5, -10); },
    overlay(g, t) { letterbox(g); big(g, t, 'BARCOS DE CARTÓN', 0.15, 620, { size: 104, color: '#e8c48a', rot: 0.03 }); } },
  spy: { kind: '3d', init: (T) => { const st = T.stage({ mood: 'night', fov: 36, sky: ['#05060c', '#0b0d18', '#141628'], fog: [10, 60], fogColor: '#0a0c18', keyIntensity: 0.15, ambient: 0.25, bloom: 1.0, bloomThreshold: 0.6 });
      st.add(T.ground(80, 80, '#1a1820')); const spot = new T.THREE.SpotLight('#fff1cf', 900, 40, 0.42, 0.5, 2); spot.position.set(0, 14, 2); spot.target.position.set(0, 0, 0); spot.castShadow = true; st.add(spot, spot.target);
      const cone = new T.THREE.Mesh(new T.THREE.ConeGeometry(5.6, 14, 40, 1, true), new T.THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.13, blending: T.THREE.AdditiveBlending, depthWrite: false, side: T.THREE.DoubleSide })); cone.position.set(0, 7, 0.5); st.add(cone);
      st.add(T.cyl(0.6, 0.6, 1.2, T.mat('#3a2a20'), 2.4, 0.6, -0.5, 16)); const dust = embers(160, [-4, 0, -3, 4, 13, 3], { color: '#fff0c8', size: 0.08, rise: 0.12, seed: 4, op: 0.8 }); st.add(dust);
      return { stage: st, dust, render: () => st.render(), dispose: () => st.dispose() }; },
    draw(S0, t) { S0.dust.update(t); const k = smooth(t / 2.34); const c = S0.stage.camera; c.position.set(lerp(-5, -1.5, k), lerp(4.5, 2.2, k), lerp(11, 6.8, k)); c.lookAt(0, 1.4, 0); },
    overlay(g, t, info, S0) { anchored(g, S0.stage, [0, 0, 0], 1.8, { facing: 1, outfit: GARBO, pose: t < 1 ? POSES.crossArms : POSES.explain, expr: t < 0.8 ? 'neutral' : 'smirk', blink: (t % 3) > 2.9, t });
      big(g, t, 'UN ESPÍA', 0.2, 580, { size: 120, color: '#f6efe1' }); big(g, t, 'QUE MENTÍA MEJOR QUE NADIE', 0.85, 690, { size: 62, color: '#ffd84a' }); } },
  kent: { kind: '3d', init: (T) => nightField(T, { fov: 46 }),
    draw(N, t) { N.emb.update(t); const k = ease.inOut(clamp(t / 3.85)); const c = N.stage.camera; c.position.set(lerp(20, 4, k), lerp(70, 4, k), lerp(-10, 18, k)); c.lookAt(lerp(40, 0, k), lerp(60, 2, k), lerp(-300, -20, k)); N.fog.forEach((f, i) => { f.position.x += Math.sin(t * 0.3 + i) * 0.02; }); },
    overlay(g, t) { stamp(g, t, 'MAYO 1944 · SUR DE INGLATERRA', 0.15, 580); letterbox(g); } },
  lantern: { kind: '3d', init: (T) => { const N = nightField(T, { fov: 38 }); const tk = rubberTank(); tk.position.set(3.2, 0, -1.2); tk.rotation.y = -0.4; tk.set(0.05); N.stage.add(tk); N.tank = tk;
      const lamp = new T.THREE.PointLight('#ffb860', 45, 18, 2); lamp.position.set(-0.6, 1.2, 0.6); lamp.castShadow = true; N.stage.add(lamp); N.stage.add(T.sphere(0.12, T.basic('#ffe0b0'), -0.6, 1.2, 0.6)); return N; },
    draw(N, t) { N.emb.update(t + 3); const k = smooth(t / 3.25); const c = N.stage.camera; c.position.set(lerp(-6, -2.2, k), lerp(2.6, 1.6, k), lerp(9, 6.2, k)); c.lookAt(lerp(0, 1, k), 1.0, 0); N.tank.set(0.05 + Math.sin(t * 2) * 0.01, 0, t); },
    overlay(g, t, info, S0) { const a = anchored(g, S0.stage, [0, 0, 0], 1.75, { facing: 1, outfit: TOMI, pose: breathe(POSES.holdFront, t, 1), expr: t > 2.2 ? 'confused' : 'neutral', talk: 0, blink: (t % 2.8) > 2.7, t }); const l = proj(S0.stage, [-0.6, 1.2, 0.6]); glow(g, l.x, l.y, 260, 'rgba(255,190,110,.55)'); if (t > 2.6) big(g, t, '¿?', 2.6, 640, { size: 170, color: '#f6efe1' }); } },
  hero: { kind: '3d', init: (T) => { const N = nightField(T, { fov: 34 }); const tk = rubberTank(); N.stage.add(tk); N.tank = tk; const rim = new T.THREE.SpotLight('#9fd0ff', 500, 40, 0.6, 0.6, 2); rim.position.set(-6, 8, -10); rim.target = tk; N.stage.add(rim); const fill = new T.THREE.PointLight('#ffb860', 60, 25, 2); fill.position.set(6, 3, 6); N.stage.add(fill); return N; },
    draw(N, t) { N.emb.update(t); T3.orbit(N.stage.camera, t, { target: [0, 1.6, 0], radius: [12, 8.5], height: [0.8, 2.4], from: 0.9, to: 2.4, dur: 5.2, e: ease.sine }); N.tank.set(1, 0, t); },
    overlay(g, t) { big(g, t, '30 TONELADAS', 1.6, 590, { size: 120, color: '#f6efe1' }); if (t > 3.7) { big(g, t, '…MENOS QUE', 3.7, 860, { size: 90, color: '#f6efe1' }); big(g, t, 'TU MOCHILA', 4.0, 980, { size: 120, color: '#ffd84a', rot: -0.04 }); } letterbox(g, 0.8); } },
  rubber: { kind: '3d', init: (T) => { const N = nightField(T, { fov: 38 }); const tk = rubberTank(); tk.position.set(2.6, 0, -1.5); tk.rotation.y = -0.5; N.stage.add(tk); N.tank = tk; const fill = new T.THREE.PointLight('#ffb860', 50, 20, 2); fill.position.set(-1, 2, 3); N.stage.add(fill); return N; },
    draw(N, t) { N.emb.update(t); const k = smooth(t / 3.2); const c = N.stage.camera; c.position.set(lerp(-3.5, -1.5, k), lerp(1.8, 2.3, k), lerp(8, 9.5, k)); c.lookAt(1, 1.3, -0.5);
      const poke = 0.62; const wob = t > poke ? Math.exp(-(t - poke) * 2.2) : 0; const deflate = t > 1.2 ? clamp((t - 1.2) / 0.5) : 0, reinfl = t > 2.4 ? clamp((t - 2.4) / 0.8) : 0; N.tank.set(1 - deflate * 0.9 + reinfl * 0.9, wob, t); },
    overlay(g, t, info, S0) { anchored(g, S0.stage, [-0.6, 0, 0.6], 1.75, { facing: 1, outfit: TOMI, pose: t < 2.3 ? (t > 0.5 && t < 0.9 ? POSES.reach : breathe(POSES.shrug, t, 1)) : (Math.sin(t * 14) > 0 ? POSES.crouch : POSES.ready), expr: t < 1.2 ? 'smirk' : t < 2.3 ? 'shocked' : 'determined', talk: 0, blink: (t % 2.5) > 2.4, t });
      big(g, t, '¡DE GOMA!', 0.55, 600, { size: 150, color: '#9fe07a', rot: -0.05 }); if (t > 1.15) big(g, t, 'INFLARLO', 1.15, 760, { size: 120, color: '#ffd84a', rot: 0.03 }); } },
};

// ---------- registration ----------
T3 = await import('/engine/three-kit.js');
for (const shot of E.shots) { const def = SC[shot.params?.scene]; if (!def) continue; registerShot(shot.id, def); }
