// x3d.js — EP03 v2: replaces the exterior / map / close-up shots of the 2D edit with 3D sets (2D characters anchored
// in a 3D world). Interior + document shots keep their 2D scenes. Loaded after director.js, so registerShot overrides.
import { E, registerShot, ease, clamp, lerp, prog, text, FONTS, rng, key } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import { drawToon, toonBigFace, OL } from '/engine/toon2d.js';
import { loadPhotos, photoMoment } from '/engine/photo.js';
import * as K from '/engine/kit3d.js';
import * as L from '/project/scenes/lib.js';
import { CAST } from '/project/scenes/director.js';
import { flag, ENG, FRA, WALL, PLC } from '/project/scenes/ep03.js';
import * as X from '/project/scenes/_set3d.js';
const { T3, sprite, smoke, embers, starField, sea, blast, cardboardBoat, heroLCVP, normandy, nightField, upd, anchored, proj, glow, talkAt, pop, smooth, softTex } = X;
const THREE = T3.THREE;
const W = E.W, H = E.H;
const TOMI = CAST.tomiBr || X.TOMI;

// ---------- 2D overlay helpers (16:9) ----------
function bigT(g, t, str, at, x, y, o = {}) { const k = pop(t, at, 0.3); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(o.rot || 0); text(g, str, 0, 0, { size: o.size || 110, color: o.color || '#ffd84a', font: FONTS.title, weight: 700, stroke: (o.size || 110) * 0.16, strokeColor: OL }); g.restore(); }
function chip(g, t, str, at, x, y, o = {}) { const k = pop(t, at, 0.35); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(o.rot ?? -0.02); g.font = `700 ${o.size || 46}px "${FONTS.title}"`; const w = g.measureText(str).width + 60, h = (o.size || 46) * 1.8; g.fillStyle = o.bg || '#f6efe1'; g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 18); g.fill(); g.stroke(); text(g, str, 0, 3, { size: o.size || 46, color: o.color || OL, font: FONTS.title, weight: 700 }); g.restore(); }
function vignette(g, a = 0.45) { const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
const PH = await loadPhotos(Object.fromEntries([...new Set(E.shots.map(s => s.params?.rphoto?.key).filter(Boolean))].map(k => [k, `/project/assets/photos/${k}.jpg`])));
function common(g, t, info) { const p = info; if (p.date) L.dateStamp(g, t, p.date, p.dateDur || 3.4); if (p.real != null) L.realStamp(g, t, p.real); if (p.top) L.pill(g, t, p.top, 92, p.topAt || 0.2); if (p.rphoto && PH[p.rphoto.key]) photoMoment(g, t, PH[p.rphoto.key], { at: p.rphoto.at, dur: p.rphoto.dur, caption: p.rphoto.cap, credit: p.rphoto.credit, theme: 'warm' }); }
const exAt = (t, p, d) => L.exprAt(t, p.ex, p.expr || d);
const cam = (c, pos, look, fov) => { c.position.set(...pos); c.lookAt(...look); if (fov) { c.fov = fov; c.updateProjectionMatrix(); } };
const K2 = (t, keys) => key(t, keys, ease.sine);
// sequence of sub-sets inside one shot: [[t0, buildFn, drawFn, overlayFn], ...]
function seq(T, info, parts) { const S0 = { parts: parts.map(p => ({ t0: p[0], build: p[1], draw: p[2], over: p[3], st: null })), cur: null };
  S0.at = (t) => { let c = S0.parts[0]; for (const q of S0.parts) if (t >= q.t0) c = q; if (!c.st) c.st = c.build(T, info); S0.cur = c; return c; };
  S0.render = () => (S0.cur.st.stage || S0.cur.st).render(); S0.dispose = () => S0.parts.forEach(q => q.st?.dispose?.()); return S0; }
const seqShot = (parts) => ({ kind: '3d', init: (T, info) => seq(T, info, parts(info)), draw(S0, t, info) { const c = S0.at(t); c.draw(c.st, t - c.t0, info, t); }, overlay(g, t, info, S0) { const c = S0.cur; c.over?.(g, t - c.t0, info, c.st, t); common(g, t, info); } });

// ---------- sets ----------
function dayStage(T, o = {}) { const st = T.stage({ mood: 'day', fov: o.fov || 38, sky: '#9cc4ee', fog: o.fog || [90, 520], fogColor: o.fogColor || '#a8c8ea', keyColor: '#fff1d8', keyPos: o.keyPos || [-30, 34, -30], keyIntensity: 3.0, ambient: 1.25, ambientSky: '#b8d0ee', bloom: 0.35, bloomThreshold: 0.97, shadowSize: o.shadow || 40 });
  st.camera.far = 1500; st.camera.updateProjectionMatrix(); st.add(K.skyDome({ top: '#2f6cc8', mid: '#5c98e0', horizon: '#9cc6ec', seed: o.seed || 6, radius: 900 })); return st; }
function hedgerows(st, T, n = 10, z = -70, seed = 3) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = -110 + i * 24 + r() * 6; st.add(T.box(18, 1.8 + r(), 2, T.mat('#4a7a3c', { flat: true }), x, 0.9, z + r() * 6)); } for (let i = 0; i < 26; i++) st.add(T.tree3D(-140 + r() * 280, z - 10 - r() * 60, 1.6 + r() * 1.2, '#3f6a34')); }
function tankRows(st, n, o = {}) { const tanks = []; const r = rng(o.seed || 2); for (let i = 0; i < n; i++) { const tk = K.sherman({ inflatable: true }); tk.position.set((i % (o.cols || 6)) * (o.dx || 9) - (o.x0 ?? 22), 0, Math.floor(i / (o.cols || 6)) * -(o.dz || 13) + r() * 2 + (o.z0 || 0)); tk.rotation.y = (o.rot ?? 0.5) + r() * 0.2; st.add(tk); tanks.push(tk); } return tanks; }
function kentDay(T, o = {}) { const st = dayStage(T, o); st.add(T.ground(1200, 1200, '#ffffff', K.grassTex('#5a8c44', [120, 120]))); hedgerows(st, T); const tanks = tankRows(st, o.n ?? 12, o); return { stage: st, tanks, render: () => st.render(), dispose: () => st.dispose() }; }
function officeRoom(T) { const st = T.stage({ mood: 'interiorWarm', fov: 40, sky: '#3a2a22', fog: false, keyColor: '#ffd9a0', keyPos: [6, 8, 6], keyIntensity: 1.6, ambient: 0.9, bloom: 0.6, bloomThreshold: 0.85, shadowSize: 10 });
  const wood = new THREE.MeshStandardMaterial({ map: K.woodTex('#6a4a30', [3, 2]), roughness: 0.8 }); const wall = new THREE.MeshStandardMaterial({ color: '#8a7a64', roughness: 0.95 });
  const floor = T.ground(30, 30, '#ffffff', K.woodTex('#5a3a24', [6, 6])); st.add(floor); const back = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), wall); back.position.set(0, 6, -6); back.receiveShadow = true; st.add(back);
  const win = T.windowPane(3.2, 4, { glowColor: '#ffe3b0', power: 1.3 }); win.position.set(4, 4.2, -5.95); st.add(win); st.add(T.shaft(3.4, 14, '#ffd9a0', 0.06)).position.set(2.5, 4, -2);
  st.add(T.box(4, 0.15, 2, wood, -1, 1.5, -2.5)); for (const [x, z] of [[-2.8, -3.3], [0.8, -3.3], [-2.8, -1.7], [0.8, -1.7]]) st.add(T.box(0.15, 1.5, 0.15, wood, x, 0.75, z));
  const lamp = new THREE.PointLight('#ffcf8a', 30, 10, 2); lamp.position.set(-2, 2.4, -2.4); st.add(lamp); st.add(T.sphere(0.18, T.basic('#ffe2b0'), -2, 2.2, -2.4));
  for (let i = 0; i < 5; i++) st.add(T.box(0.5, 0.7, 0.05, T.mat(['#d8cdb4', '#c8b89a'][i % 2]), -4.5 + i * 0.7, 3.6 + (i % 2) * 0.3, -5.9));
  return { stage: st, render: () => st.render(), dispose: () => st.dispose() }; }
function spotSet(T) { const st = T.stage({ mood: 'night', fov: 36, sky: ['#05060c', '#0b0d18', '#141628'], fog: [10, 60], fogColor: '#0a0c18', keyIntensity: 0.15, ambient: 0.3, bloom: 1.0, bloomThreshold: 0.6 });
  st.add(T.ground(80, 80, '#0f0e13')); const spot = new THREE.SpotLight('#fff1cf', 380, 40, 0.42, 0.5, 2); spot.position.set(0, 14, 2); spot.target.position.set(0, 0, 0); spot.castShadow = true; st.add(spot, spot.target);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(5.6, 14, 40, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(0, 7, 0.5); st.add(cone);
  const dust = embers(160, [-4, 0, -3, 4, 13, 3], { color: '#fff0c8', size: 0.08, rise: 0.12, seed: 4, op: 0.8 }); st.add(dust); return { stage: st, emb: dust, render: () => st.render(), dispose: () => st.dispose() }; }
function harbor(T, o = {}) { const st = dayStage(T, { fov: 40, keyPos: [40, 40, 60] }); const s = sea(600, 600, '#3f7f9a', { glow: 0.25 }); st.add(s); const land = T.ground(600, 200, '#ffffff', K.grassTex()); land.position.set(0, 0.6, -170); st.add(land);
  st.add(T.box(60, 1.2, 6, T.mat('#7a7262'), -10, 0.6, -60)); for (let i = 0; i < 8; i++) st.add(T.building(6 + (i % 3) * 2, 6 + (i % 4) * 2, 6, { color: ['#b9a88a', '#c9b89a', '#a89878'][i % 3], lit: 0 })).position.set(-50 + i * 10, 0.6, -80);
  const boats = []; for (let i = 0; i < (o.n || 8); i++) { const b = K.lcvp({ num: 'PA ' + (31 + i) }); b.position.set(-30 + (i % 4) * 14, 0, -20 - Math.floor(i / 4) * 16); b.rotation.y = 0.2 + (i % 2) * 0.15; st.add(b); boats.push(b); }
  return { stage: st, sea: s, boats, render: () => st.render(), dispose: () => st.dispose() }; }

// 3D relief map of the English Channel (map px -> world: x=(px-960)/10, z=(py-540)/10)
const MX = (p) => (p[0] - 960) / 10, MZ = (p) => (p[1] - 540) / 10;
const farmTex = (seed) => K.paintTex('#9fb06a', seed, [1, 1]);
function landMesh(poly, colTop, colSide) { const sh = new THREE.Shape(); poly.forEach((p, i) => (i ? sh.lineTo(MX(p), -MZ(p)) : sh.moveTo(MX(p), -MZ(p)))); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.8, bevelSegments: 3 }); geo.rotateX(-Math.PI / 2);
  const top = new THREE.MeshStandardMaterial({ map: canvasFields(colTop), roughness: 0.95 }); const side = new THREE.MeshStandardMaterial({ color: colSide, roughness: 0.9 });
  const m = new THREE.Mesh(geo, [top, side]); m.castShadow = m.receiveShadow = true; return m; }
let _fields = {}; function canvasFields(base) { if (_fields[base]) return _fields[base]; const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, 1024, 1024); const r = rng(7);
  for (let i = 0; i < 900; i++) { g.fillStyle = ['#a9bb72', '#93a85e', '#b8c27e', '#c9c48a', '#86a058'][Math.floor(r() * 5)]; g.globalAlpha = 0.75; g.save(); g.translate(r() * 1024, r() * 1024); g.rotate(r() * 0.6 - 0.3); g.fillRect(0, 0, 14 + r() * 40, 10 + r() * 30); g.restore(); }
  g.globalAlpha = 0.35; g.strokeStyle = '#6a7a40'; g.lineWidth = 1.2; for (let i = 0; i < 120; i++) { g.beginPath(); g.moveTo(r() * 1024, r() * 1024); g.lineTo(r() * 1024, r() * 1024); g.stroke(); } g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.04, 0.04); return (_fields[base] = t); }
function town(st, p, n = 7, seed = 1) { const r = rng(seed); for (let i = 0; i < n; i++) { const h = 0.6 + r() * 1.2; const b = T3.box(0.9, h, 0.9, T3.mat(['#d8cdb8', '#c9b89a', '#b8a888'][i % 3]), MX(p) + (r() - 0.5) * 4, 3 + h / 2, MZ(p) + (r() - 0.5) * 4); st.add(b); const roof = T3.cone(0.75, 0.6, '#9a4a3a', b.position.x, 3 + h + 0.3, b.position.z, 4); roof.rotation.y = Math.PI / 4; st.add(roof); } }
function channelSet(T, p) { const st = T.stage({ mood: 'day', fov: 34, sky: '#9cc4ee', fog: [200, 600], fogColor: '#b8d4ee', keyColor: '#fff3dc', keyPos: [-60, 90, 40], keyIntensity: 3.1, ambient: 1.3, ambientSky: '#c4dcf2', bloom: 0.3, bloomThreshold: 0.97, shadowSize: 120 });
  st.camera.far = 2000; st.camera.updateProjectionMatrix(); st.add(K.skyDome({ top: '#2f6cc8', mid: '#5c98e0', horizon: '#9cc6ec', seed: 9, radius: 1200 }));
  const s = sea(420, 260, '#3d86b0', { glow: 0.3 }); s.position.set(0, 0.6, 0); st.add(s);
  st.add(landMesh(ENG, '#a8b874', '#efe8d6'), landMesh(FRA, '#b4b878', '#c9b48a'));
  for (const [k, n, sd] of [['london', 14, 1], ['dover', 6, 2], ['calais', 7, 3], ['portsmouth', 6, 4]]) town(st, PLC[k], n, sd);
  const r = rng(5); for (let i = 0; i < 140; i++) { const x = (r() - 0.5) * 190, z = (r() - 0.5) * 108; const px = x * 10 + 960, py = z * 10 + 540; const inEng = py < 480 - px * 0.05, inFra = py > 560 + (1920 - px) * 0.05 * 0; if (!(inEng || inFra)) continue; st.add(T.tree3D(x, z, 0.5, '#4a7a3c')).position.y = 3; }
  const bunkers = []; for (let i = 0; i < WALL.length - 1; i++) for (let k = 0; k < 3; k++) { const a = WALL[i], b = WALL[i + 1], u = k / 3; const x = MX(a) + (MX(b) - MX(a)) * u, z = MZ(a) + (MZ(b) - MZ(a)) * u; const bk = T3.box(1.6, 0.9, 1.2, new THREE.MeshStandardMaterial({ map: K.concreteTex(), roughness: 1 }), x, 3.3, z + 0.5); bk.scale.y = 0.001; st.add(bk); bunkers.push({ m: bk, i: i * 3 + k }); }
  const cl = []; for (let i = 0; i < 9; i++) { const c = new THREE.Group(); for (let k = 0; k < 5; k++) { const sp = T3.sphere(2 + r() * 2, T3.mat('#ffffff', { roughness: 1 }), (k - 2) * 2.6, r() * 1.2, r() * 2); c.add(sp); } c.position.set(-90 + r() * 180, 26 + r() * 8, -50 + r() * 100); c.scale.set(1.3, 0.6, 1); st.add(c); cl.push(c); }
  // arrows: 3D arcs
  const arrows = (p.arrows || []).map(a => { const A = PLC[a.from] || a.from, B = PLC[a.to] || a.to; const p0 = new THREE.Vector3(MX(A), 3.6, MZ(A)), p2 = new THREE.Vector3(MX(B), 3.6, MZ(B)); const mid = p0.clone().lerp(p2, 0.5); mid.y += p0.distanceTo(p2) * 0.35;
    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2); const geo = new THREE.TubeGeometry(curve, 80, (a.w || 12) / 28, 10, false); const col = new THREE.Color(a.col || '#d63a2a'); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.5 })); m.castShadow = true; st.add(m);
    const head = new THREE.Mesh(new THREE.ConeGeometry((a.w || 12) / 12, 2.2, 16), m.material); st.add(head); return { a, m, head, curve, n: geo.index.count }; });
  return { stage: st, sea: s, bunkers, clouds: cl, arrows, render: () => st.render(), dispose: () => st.dispose() }; }
function channelCam(p) { const pts = [...(p.marks || []).map(m => PLC[m.p]), ...(p.arrows || []).flatMap(a => [PLC[a.from] || a.from, PLC[a.to] || a.to])].filter(Boolean); if (p.wall != null) pts.push([900, 760], [1300, 520]); if (!pts.length) pts.push([960, 540]);
  const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length, cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; const spread = Math.max(...pts.map(q => Math.hypot(q[0] - cx, q[1] - cy)), 220); return { x: MX([cx, cy]), z: MZ([cx, cy]), d: 40 + spread / 7 }; }

// ---------- shots ----------
const SH = {};
// --- cold open: beach (LCVP POV, explosions), crafts, Tomi "no", then the four lies
SH.hookTrue = (info) => {
  if (info.date) return { kind: '3d', init: (T) => { const N = normandy(T, { hero: true, fov: 46 }); N.stage.scene.fog.near = 70; N.stage.scene.fog.far = 300; return N; },
    draw(S0, t) { upd(S0, t); S0.blasts.forEach(b => b.update(t)); const h = S0.hero; h.position.set(0, Math.sin(t * 1.3) * 0.2, -66 + t * 3.2); h.openRamp(ease.outBack(clamp((t - 0.15) / 0.35)));
      const hp = h.position; const v = key(t, [[0, { pos: [0, 2.6, -4.2], look: [0, 1.6, 12] }], [0.9, { pos: [0, 3.4, -2.2], look: [0, 1.8, 30] }], [4.0, { pos: [-4, 8, 9], look: [0, 3, 70] }]]);
      const c = S0.stage.camera; c.position.set(hp.x + v.pos[0], hp.y + v.pos[1], hp.z + v.pos[2]); c.lookAt(hp.x + v.look[0], v.look[1], hp.z + v.look[2]);
      let sh = 0; for (const [at, a] of [[0.35, 0.35], [1.05, 0.25], [1.8, 0.3], [2.7, 0.22], [3.4, 0.25]]) if (t > at) sh += a * Math.exp(-(t - at) * 6); c.position.x += Math.sin(t * 63) * sh; c.position.y += Math.cos(t * 51) * sh; c.rotation.z += Math.sin(t * 37) * sh * 0.05; },
    overlay(g, t, info) { if (t < 0.45) { g.fillStyle = `rgba(255,240,210,${clamp(1 - t / 0.45) * 0.9})`; g.fillRect(0, 0, W, H); } common(g, t, { ...info, date: null }); L.dateStamp(g, Math.max(0, t - 0.5), info.date, 3); if (info.q != null) bigT(g, t, '¿VERDAD?', info.q, W / 2, H * 0.42, { size: 120, color: '#f6efe1' }); } };
  if (info.rphoto) return { kind: '3d', init: (T) => normandy(T, { fov: 34 }), draw(S0, t, info) { upd(S0, t + 4); const k = smooth(t / info.dur); const c = S0.stage.camera; c.position.set(lerp(-26, 8, k), lerp(4, 15, k), lerp(-74, -92, k)); const tg = S0.crafts[3].position; c.lookAt(tg.x, 0.8, tg.z); }, overlay(g, t, info) { vignette(g, 0.3); common(g, t, info); } };
  if (info.no != null) return { kind: '3d', init: (T) => normandy(T, { fov: 30 }),
    draw(S0, t, info) { upd(S0, t + 7); const k = smooth(t / info.dur); const c = S0.stage.camera; c.position.set(lerp(-4, -1.8, k), lerp(2.0, 1.8, k), lerp(-11, -7, k)); c.lookAt(1.2, 1.5, 0); if (t > info.no) { const s = (1 - clamp((t - info.no) / 0.35)) * 0.08; c.position.x += Math.sin(t * 70) * s; c.position.y += Math.cos(t * 55) * s; } },
    overlay(g, t, info, S0) { anchored(g, S0.stage, [0, 0, 0], 1.75, { facing: 1, outfit: TOMI, pose: t < info.no ? breathe(POSES.shrug, t, 1) : POSES.crossArms, expr: t < info.no ? 'smirk' : 'determined', talk: talkAt(info.globalT), blink: (t % 2.6) > 2.5, t }); if (t > info.no) bigT(g, t, 'NO.', info.no, W * 0.68, H * 0.42, { size: 240, color: '#ff5a4a' }); vignette(g, 0.3); common(g, t, info); } };
  // s004: rise into the night, then tanks / cardboard boats / the spy
  return seqShot((info) => [
    [0, (T) => normandy(T, { fov: 50 }), (S0, t) => { upd(S0, t + 9); const k = ease.inOut(clamp(t / 3.4)); const c = S0.stage.camera; c.position.set(lerp(4, -2, k), lerp(5, 34, k), lerp(-45, 25, k)); c.lookAt(0, lerp(4, 12, k), lerp(40, 130, k)); },
      (g, t) => { bigT(g, t, 'SEMANAS ANTES…', 1.4, W / 2, H * 0.45, { size: 110, color: '#f6efe1' }); const n = clamp((t - 2.0) / 1.4); g.fillStyle = `rgba(6,10,30,${n * 0.6})`; g.fillRect(0, 0, W, H); }],
    [3.42, (T) => { const N = nightField(T, { fov: 42 }); N.tanks = tankRows(N.stage, 12, {}); const lamp = new THREE.PointLight('#ffb860', 80, 30, 2); lamp.position.set(-4, 3, 6); N.stage.add(lamp); return N; }, (N, t) => { N.emb.update(t); const k = smooth(t / 1.2); cam(N.stage.camera, [lerp(-30, -8, k), lerp(4, 2.6, k), lerp(16, 13, k)], [lerp(-10, 8, k), 1.4, -4]); },
      (g, t) => { bigT(g, t, 'TANQUES DE GOMA', 0.1, W / 2, H * 0.2, { size: 100, color: '#9fe07a' }); X.letterbox(g, 0.6); }],
    [4.56, (T) => { const st = T.stage({ mood: 'night', fov: 40, sky: ['#070b20', '#1a2450', '#3b3a6c'], fog: [20, 120], fogColor: '#1f2a52', keyColor: '#c4d0ff', keyPos: [20, 30, 20], keyIntensity: 2.4, ambient: 1.3, ambientSky: '#5a6aa8', bloom: 0.8, bloomThreshold: 0.78 }); const s = sea(300, 300, '#2a4f78', { glow: 0.2 }); st.add(s); st.add(starField()); const dl = new THREE.PointLight('#ffb860', 120, 40, 2); dl.position.set(0, 6, 4); st.add(dl); const boats = []; for (let i = 0; i < 5; i++) { const b = cardboardBoat(-24 + i * 12, -10 - (i % 2) * 8, 1, i); boats.push(b); st.add(b); } return { stage: st, sea: s, boats, render: () => st.render(), dispose: () => st.dispose() }; },
      (S0, t) => { S0.sea.update(t); S0.boats.forEach((b, i) => { b.position.y = Math.sin(t * 1.4 + i) * 0.25; b.rotation.z = Math.sin(t * 1.2 + i) * 0.05; }); const k = smooth(t / 1.2); cam(S0.stage.camera, [lerp(20, 4, k), lerp(3, 5, k), lerp(14, 20, k)], [lerp(-4, -10, k), 1.5, -10]); },
      (g, t) => { bigT(g, t, 'BARCOS DE CARTÓN', 0.1, W / 2, H * 0.2, { size: 96, color: '#e8c48a' }); X.letterbox(g, 0.6); }],
    [5.76, (T) => spotSet(T), (S0, t) => { S0.emb.update(t); const k = smooth(t / 2.3); cam(S0.stage.camera, [lerp(-6, -2, k), lerp(4.5, 2.2, k), lerp(11, 7, k)], [0, 1.4, 0]); },
      (g, t, info, S0) => { anchored(g, S0.stage, [0, 0, 0], 1.8, { facing: 1, outfit: CAST.garbo || X.GARBO, pose: t < 1 ? POSES.crossArms : POSES.explain, expr: 'smirk', blink: (t % 3) > 2.9, t }); bigT(g, t, 'UN ESPÍA', 0.1, W * 0.28, H * 0.4, { size: 110, color: '#f6efe1' }); bigT(g, t, 'QUE MENTÍA MEJOR QUE NADIE', 0.6, W * 0.28, H * 0.55, { size: 52 }); }],
  ]);
};
// --- Kent at night: Tomi inflating a rubber Sherman (s005 long beat / s036 short)
function inflateSet(T) { const N = nightField(T, { fov: 38 }); const tk = K.sherman({ inflatable: true }); tk.position.set(3.4, 0, -1.4); tk.rotation.y = -0.45; N.stage.add(tk); N.tank = tk;
  const lamp = new THREE.PointLight('#ffb860', 55, 18, 2); lamp.position.set(-0.6, 1.2, 0.6); lamp.castShadow = true; N.stage.add(lamp); N.stage.add(T.sphere(0.12, T.basic('#ffe0b0'), -0.6, 1.2, 0.6));
  const pump = new THREE.Group(); pump.add(T.cyl(0.12, 0.12, 0.9, '#8a8a84', 0, 0.45, 0, 12), T.box(0.6, 0.06, 0.06, '#5a5a56', 0, 0.95, 0)); pump.position.set(0.9, 0, 0.4); N.stage.add(pump); N.pump = pump;
  N.rows = tankRows(N.stage, 10, { x0: 26, z0: -16, seed: 5 }); return N; }
SH.inflate = (info) => ({ kind: '3d', init: (T) => inflateSet(T),
  draw(N, t, info) { N.emb.update(t); const p = info; const inf = p.dur ? clamp((t - (p.from || 0)) / p.dur) : 1; const wob = p.rub != null && t > p.rub ? Math.exp(-(t - p.rub) * 2) : 0; N.tank.set(0.05 + 0.95 * ease.out(inf), wob, t);
    N.rows.forEach((r, i) => r.set(info.dur > 12 ? 1 : clamp((t - 4 - i * 0.3) / 2) * 0.95 + 0.05, 0, t + i));
    N.pump.children[1].position.y = 0.95 - Math.abs(Math.sin(t * 7)) * (inf > 0 && inf < 1 ? 0.35 : 0);
    const c = N.stage.camera;
    if (info.dur > 12) { const v = K2(t, [[0, { pos: [24, 60, -10], look: [30, 50, -300] }], [4.6, { pos: [-5, 2.6, 9], look: [1, 1.2, 0] }], [8.4, { pos: [-2.4, 1.6, 6.4], look: [1.4, 1.1, -0.5] }], [8.7, { pos: [8, 1.0, 9], look: [3.4, 1.8, -1.4] }], [12.4, { pos: [-2, 2.6, 8.5], look: [3.4, 1.7, -1.4] }], [15.8, { pos: [-1.5, 2.2, 9.5], look: [2, 1.4, -1] }]]); cam(c, v.pos, v.look); }
    else { const v = K2(t, [[0, { pos: [-3, 1.8, 7.5], look: [1.6, 1.2, -1] }], [4, { pos: [-2, 3.5, 11], look: [2, 1.5, -3] }], [info.dur, { pos: [-14, 9, 20], look: [10, 1, -10] }]]); cam(c, v.pos, v.look); } },
  overlay(g, t, info, N) { const p = info; const inf = p.dur ? clamp((t - (p.from || 0)) / p.dur) : 1; const pumping = inf > 0 && inf < 1;
    anchored(g, N.stage, [0, 0, 0], 1.75, { facing: 1, outfit: TOMI, pose: pumping ? (Math.sin(t * 14) > 0 ? POSES.crouch : POSES.ready) : (p.dur > 12 && t < 4.9 ? POSES.holdFront : breathe(POSES.shrug, t, 1)), expr: exAt(t, p, 'smirk'), talk: 0, blink: (t % 2.8) > 2.7, t });
    const l = proj(N.stage, [-0.6, 1.2, 0.6]); if (l.vis) glow(g, l.x, l.y, 220, 'rgba(255,190,110,.5)');
    if (p.tons != null) { bigT(g, t, '30 TONELADAS', p.tons, W * 0.3, H * 0.22, { size: 100, color: '#f6efe1' }); if (t > p.tons + 2.6 && t < (p.rub || 99)) { bigT(g, t, '…MENOS QUE TU MOCHILA', p.tons + 2.7, W * 0.3, H * 0.36, { size: 64 }); } }
    if (p.rub != null) bigT(g, t, '¡DE GOMA!', p.rub, W * 0.3, H * 0.22, { size: 130, color: '#9fe07a', rot: -0.04 });
    common(g, t, info); } });
// --- close-ups: big 2D face over a blurred, slowly drifting 3D set
SH.face = (info) => ({ kind: '3d', init: (T) => { const p = info; if (p.bg === 'office') return officeRoom(T); if (p.bg === 'dark') return spotSet(T); const N = nightField(T, { fov: 40 }); N.tanks = tankRows(N.stage, 6, { x0: 18, z0: -8 }); return N; },
  draw(S0, t, info) { S0.emb?.update?.(t); const c = S0.stage.camera; const k = t / Math.max(1, info.dur); if (info.bg === 'office') cam(c, [lerp(-1, 1, k), 2.2, 6], [0, 2.2, -4]); else if (info.bg === 'dark') cam(c, [lerp(-2, 2, k), 3, 9], [0, 2, 0]); else cam(c, [lerp(-6, -2, k), 2.2, 12], [0, 1.6, -6]); },
  overlay(g, t, info) { const p = info; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'blur(9px)'; g.drawImage(g.canvas, 0, 0); g.restore(); g.fillStyle = 'rgba(255,240,220,.08)'; g.fillRect(0, 0, W, H); vignette(g, 0.4);
    const of = CAST[p.who] || TOMI; const k = pop(t, 0, 0.3); const dx = (p.dx || 0) + Math.sin(t * 0.6) * 8;
    g.save(); g.translate(W / 2 + dx, H * 0.54); g.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); toonBigFace(g, 0, 0, p.r || 250, { outfit: of, expr: exAt(t, p, 'neutral'), blink: L.blinkAt(t, 3.4), look: p.look, talk: p.talk ? talkAt(info.globalT) : 0, t, tilt: p.tilt || 0 }); g.restore();
    common(g, t, info); } });
// --- 3D relief map of the Channel
SH.channelMap = (info) => ({ kind: '3d', init: (T) => channelSet(T, info),
  draw(S0, t, info) { const p = info; S0.sea.update(t); S0.clouds.forEach((c, i) => { c.position.x += 0.02 * (i % 2 ? 1 : -1); });
    if (p.wall != null) { const k = clamp((t - p.wall) / 1.5); S0.bunkers.forEach(b => { b.m.scale.y = clamp(k * S0.bunkers.length - b.i) || 0.001; }); } else S0.bunkers.forEach(b => (b.m.scale.y = p.wall === 0 ? 1 : 0.001));
    S0.arrows.forEach(A => { const k = clamp((t - (A.a.at || 0)) / (A.a.d || 1)); A.m.geometry.setDrawRange(0, Math.floor(A.n * ease.out(k)) || 1); A.m.visible = k > 0; const pt = A.curve.getPoint(Math.max(0.01, ease.out(k))), tg = A.curve.getTangent(Math.max(0.01, ease.out(k))); A.head.visible = k > 0.05; A.head.position.copy(pt); A.head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg); });
    const f = channelCam(p); const k = t / Math.max(1, info.dur); const c = S0.stage.camera; const ang = lerp(-0.25, 0.15, k) + (info.shot.id.charCodeAt(3) % 3) * 0.2; const d = f.d * lerp(1.12, 0.94, ease.inOut(k));
    cam(c, [f.x + Math.sin(ang) * d * 0.5, d * 0.95, f.z + Math.cos(ang) * d * 0.8], [f.x, 2, f.z]); },
  overlay(g, t, info, S0) { const p = info, st = S0.stage; const lab = (p3, str, o = {}) => { const a = proj(st, p3); if (!a.vis) return; text(g, str, a.x, a.y, { size: o.size || 44, color: o.color || '#5a4a2a', font: FONTS.title, weight: 700, alpha: o.alpha ?? 0.85 }); };
    lab([MX([520, 300]), 3, MZ([520, 300])], 'INGLATERRA', { size: 54 }); lab([MX([1250, 930]), 3, MZ([1250, 930])], 'FRANCIA', { size: 58 }); lab([MX([700, 640]), 1, MZ([700, 640])], 'CANAL DE LA MANCHA', { size: 30, color: '#ffffff', alpha: 0.8 });
    if (p.flags) { const a = proj(st, [MX([360, 200]), 9, MZ([360, 200])]), b = proj(st, [MX([1700, 700]), 9, MZ([1700, 700])]); if (a.vis) flag(g, a.x, a.y, 120, 'uk', t); if (b.vis) flag(g, b.x, b.y, 120, 'de', t); }
    for (const m of p.marks || []) { const q = PLC[m.p]; const s = pop(t, m.at || 0, 0.3); if (s <= 0) continue; const a = proj(st, [MX(q), 3.3, MZ(q)]); if (!a.vis) continue; g.save(); g.translate(a.x, a.y); g.scale(s, s);
      const col = m.col || '#d63a2a'; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 6, 26, 9, 0, 0, 7); g.fill(); g.fillStyle = col; g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-22, -26, -22, -58, 0, -58); g.bezierCurveTo(22, -58, 22, -26, 0, 0); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -40, 8, 0, 7); g.fill();
      if (m.label) { const ty = (m.dy ?? -50) - 50; g.font = `700 ${m.size || 46}px "${FONTS.title}"`; const w = g.measureText(m.label).width + 40; g.fillStyle = '#f6efe1'; g.beginPath(); g.roundRect(-w / 2 + (m.dx || 0), ty - 34, w, 68, 16); g.fill(); g.stroke(); text(g, m.label, m.dx || 0, ty + 2, { size: m.size || 46, color: m.col && m.col !== '#c0392b' ? m.col : OL, font: FONTS.title, weight: 700 }); }
      g.restore(); }
    if (p.km != null) { const k = pop(t, p.km); if (k > 0) { const a = proj(st, [MX(PLC.dover), 3.3, MZ(PLC.dover)]), b = proj(st, [MX(PLC.calais), 3.3, MZ(PLC.calais)]); g.save(); g.setLineDash([18, 12]); g.strokeStyle = '#d63a2a'; g.lineWidth = 7; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(lerp(a.x, b.x, k), lerp(a.y, b.y, k)); g.stroke(); g.restore(); chip(g, t, '30 KM', p.km + 0.2, (a.x + b.x) / 2 + 90, (a.y + b.y) / 2 - 40, { color: '#c0392b', size: 52 }); } }
    vignette(g, 0.25); common(g, t, info); } });
// --- the fake army in Kent (day), the boats, the aerial recon view
SH.fakeArmy = (info) => {
  if (info.boats) return { kind: '3d', init: (T) => harbor(T), draw(S0, t, info) { S0.sea.update(t); S0.boats.forEach((b, i) => { b.position.y = Math.sin(t * 1.3 + i) * 0.2; }); const k = smooth(t / info.dur); cam(S0.stage.camera, [lerp(30, 8, k), lerp(9, 5, k), lerp(20, 16, k)], [-6, 1, -30]); }, overlay(g, t, info) { chip(g, t, info.lbl, 0.3, W / 2, H * 0.12); common(g, t, info); } };
  if (info.aerial) return { kind: '3d', init: (T) => kentDay(T, { n: 24, cols: 8, dx: 10, dz: 14, x0: 35, fov: 30 }), draw(S0, t, info) { const k = t / info.dur; cam(S0.stage.camera, [lerp(-30, 10, k), 120, lerp(60, 30, k)], [lerp(-20, 15, k), 0, lerp(-10, -25, k)]); },
    overlay(g, t) { g.strokeStyle = 'rgba(20,20,20,.75)'; g.lineWidth = 3; g.beginPath(); g.arc(W / 2, H / 2, 300, 0, 7); g.moveTo(W / 2 - 360, H / 2); g.lineTo(W / 2 + 360, H / 2); g.moveTo(W / 2, H / 2 - 360); g.lineTo(W / 2, H / 2 + 360); g.stroke(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, 70); g.fillRect(0, H - 70, W, 70);
      text(g, 'RECONOCIMIENTO AÉREO · LUFTWAFFE', 40, 36, { size: 34, color: '#f6efe1', font: FONTS.ui, weight: 900, align: 'left' }); text(g, '● REC', W - 60, 36, { size: 34, color: (t % 1) < 0.5 ? '#ff5a4a' : 'rgba(0,0,0,0)', font: FONTS.ui, weight: 900, align: 'right' }); bigT(g, t, 'PARECE UN EJÉRCITO DE VERDAD', 0.4, W / 2, H - 150, { size: 56, color: '#f6efe1' }); } };
  return { kind: '3d', init: (T) => kentDay(T, { n: 18, cols: 6 }), draw(S0, t, info) { S0.tanks.forEach((tk, i) => tk.set(clamp((t - i * 0.25) / 1.4) * 0.95 + 0.05, 0, t)); const k = smooth(t / info.dur); cam(S0.stage.camera, [lerp(-34, -10, k), lerp(5, 14, k), lerp(22, 30, k)], [lerp(-6, 4, k), 1, -12]); },
    overlay(g, t, info, S0) { anchored(g, S0.stage, [-14, 0, 6], 1.75, { facing: 1, outfit: TOMI, pose: Math.sin(t * 14) > 0 ? POSES.crouch : POSES.ready, expr: 'determined', t }); chip(g, t, info.lbl, 0.3, W / 2, H * 0.12); X.usFlag(g, t, 1.0, H * 0.24); common(g, t, info); } };
};
// --- Dover fuel depot made of plywood
SH.oilDock = (info) => ({ kind: '3d', init: (T) => { const st = dayStage(T, { fov: 34 }); const s = sea(600, 400, '#3f7f9a'); s.position.z = 60; st.add(s); const land = T.ground(600, 200, '#ffffff', K.grassTex()); land.position.set(0, 2, -60); st.add(land); st.add(T.box(600, 2, 8, T.mat('#efe8d6', { flat: true }), 0, 1, 40));
    const metal = new THREE.MeshStandardMaterial({ color: '#e4e2da', roughness: 0.6, metalness: 0.05 }), ply = new THREE.MeshStandardMaterial({ map: K.woodTex('#a08a64'), roughness: 0.9 });
    const tanks = []; for (let i = 0; i < 6; i++) { const g = new THREE.Group(); const half = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 6, 32, 1, true, -Math.PI / 2, Math.PI), metal); half.position.y = 3; half.castShadow = true; g.add(half); const back = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), ply); back.position.y = 3; back.rotation.y = Math.PI; g.add(back); for (const x of [-3, 0, 3]) g.add(T.box(0.2, 6.5, 0.2, ply, x, 3.2, -0.3)); g.position.set(-30 + i * 11, 2, -6 - (i % 2) * 10); st.add(g); tanks.push(g); }
    for (let i = 0; i < 5; i++) st.add(T.cyl(0.4, 0.4, 60, '#7a7a74', 0, 2.6, 4 + i * 1.2, 10)).rotation.z = Math.PI / 2; st.add(T.box(4, 1, 30, T.mat('#7a6a54'), 10, 1.5, 22));
    return { stage: st, sea: s, render: () => st.render(), dispose: () => st.dispose() }; },
  draw(S0, t, info) { S0.sea.update(t); const e = info.empty ?? 99; const c = S0.stage.camera; if (t < e) { const k = smooth(t / e); cam(c, [lerp(-10, 10, k), lerp(14, 10, k), lerp(55, 45, k)], [0, 4, -6]); } else { const k = smooth((t - e) / (info.dur - e)); cam(c, [lerp(10, 14, k), lerp(10, 7, k), lerp(-40, -34, k)], [0, 4, -8]); } },
  overlay(g, t, info) { chip(g, t, 'DEPÓSITO DE COMBUSTIBLE · DOVER', 0.3, W / 2, H * 0.12); if (info.empty != null && t > info.empty) bigT(g, t, '…DE MADERA Y CARTÓN', info.empty + 0.2, W / 2, H * 0.8, { size: 84, color: '#f6efe1' }); common(g, t, info); } });
// --- tricks: fake tracks, cooking fires, laundry
SH.tricks = (info) => ({ kind: '3d', init: (T) => { const dusk = info.mode === 'fires'; const st = dusk ? T.stage({ mood: 'dusk', fov: 38, sky: ['#2a2450', '#8a5a86', '#f2a070'], fog: [40, 220], fogColor: '#8a6a7a', keyColor: '#ffb070', keyPos: [-40, 10, -60], keyIntensity: 2.2, ambient: 1.0, bloom: 0.9, bloomThreshold: 0.75, shadowSize: 30 }) : dayStage(T, { fov: 36 });
    st.add(T.ground(800, 800, '#ffffff', K.grassTex(dusk ? '#6a7a50' : '#5a8c44'))); hedgerows(st, T, 10, -60, 7); const S0 = { stage: st, render: () => st.render(), dispose: () => st.dispose() };
    const canvas = new THREE.MeshStandardMaterial({ color: '#b8ac86', roughness: 1 }); for (let i = 0; i < 8; i++) { const tent = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.6, 4), canvas); tent.position.set(-20 + (i % 4) * 9, 1.3, -14 - Math.floor(i / 4) * 9); tent.rotation.y = Math.PI / 4; tent.castShadow = true; st.add(tent); }
    if (info.mode === 'tracks') { S0.tank = K.sherman({ inflatable: true }); S0.tank.position.set(0, 0, 0); st.add(S0.tank); S0.marks = []; for (let i = 0; i < 70; i++) for (const z of [1.3, -1.3]) { const m = T.box(0.25, 0.02, 0.7, T.mat('#4a3a24'), -30 + i * 0.6, 0.02, z); m.visible = false; st.add(m); S0.marks.push(m); } }
    if (info.mode === 'fires') { S0.fires = []; for (let i = 0; i < 5; i++) { const x = -18 + i * 9, z = -6 - (i % 2) * 8; const l = new THREE.PointLight('#ff9a4a', 60, 14, 2); l.position.set(x, 1.2, z); st.add(l); const f = sprite('#ffb04a', 1.6, 1, true); f.position.set(x, 0.9, z); st.add(f); const sm = smoke(x, 1, z, { seed: i, size: 0.8, h: 10, op: 0.35, color: '#8a8080', wind: 2 }); st.add(sm.group); S0.fires.push({ f, sm, l }); for (let k = 0; k < 6; k++) st.add(T.box(0.8, 0.12, 0.12, '#4a3020', x + Math.cos(k) * 0.4, 0.08, z + Math.sin(k) * 0.4)).rotation.y = k; } }
    if (info.mode === 'laundry') { S0.cloth = []; for (let r = 0; r < 2; r++) { st.add(T.box(24, 0.04, 0.04, '#5a4a3a', -2, 2.3, -4 - r * 6)); for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4, 6, 6), new THREE.MeshStandardMaterial({ color: ['#e8e2d0', '#7a6e4a', '#c9c2b2', '#6a7a8a'][(i + r) % 4], side: THREE.DoubleSide, roughness: 1 })); c.position.set(-12 + i * 2.6, 1.6, -4 - r * 6); c.castShadow = true; st.add(c); S0.cloth.push(c); } } }
    return S0; },
  draw(S0, t, info) { const c = S0.stage.camera, d = info.dur, k = smooth(t / d);
    if (S0.tank) { const x = lerp(-28, 10, clamp(t / d)); S0.tank.position.x = x; S0.tank.set(1, 0, t); S0.marks.forEach((m, i) => { m.visible = m.position.x < x - 2.5; }); cam(c, [x - 10, 5, 12], [x - 2, 1, 0]); }
    if (S0.fires) { S0.fires.forEach((F, i) => { F.sm.update(t); const fl = 1 + Math.sin(t * 13 + i) * 0.15; F.f.scale.set(1.6 * fl, 2.2 * fl, 1); F.l.intensity = 60 * fl; }); cam(c, [lerp(-30, -12, k), 4, 16], [-2, 1, -8]); }
    if (S0.cloth) { S0.cloth.forEach((cl, i) => { const pa = cl.geometry.attributes.position; for (let j = 0; j < pa.count; j++) { const y = pa.getY(j); pa.setZ(j, Math.sin(t * 4 + pa.getX(j) * 3 + i) * 0.12 * (0.7 - y)); } pa.needsUpdate = true; }); cam(c, [lerp(-12, -4, k), 2.4, 10], [0, 1.6, -6]); } },
  overlay(g, t, info, S0) { const m = info.mode; if (m === 'tracks') { anchored(g, S0.stage, [S0.tank.position.x - 6, 0, 3], 1.75, { facing: 1, outfit: TOMI, pose: walkPose(t * 6), expr: 'smirk', t }); chip(g, t, 'HUELLAS NUEVAS EN EL BARRO', 0.3, W / 2, H * 0.12); }
    if (m === 'fires') chip(g, t, 'HOGUERAS… EN CAMPAMENTOS VACÍOS', 0.3, W / 2, H * 0.12);
    if (m === 'laundry') { anchored(g, S0.stage, [3, 0, 0], 1.75, { facing: -1, outfit: TOMI, pose: breathe(POSES.shrug, t, 1), expr: 'smirk', t }); chip(g, t, 'TENDER ROPA', 0.3, W / 2, H * 0.12); } common(g, t, info); } });
// --- the invasion fleet
SH.invasion = (info) => info.where == null ? SH.beachLanding(info) : ({ kind: '3d', init: (T) => { const N = harbor(T, { n: 12 }); const r = rng(3); N.ships = []; for (let i = 0; i < 10; i++) { const s = new THREE.Group(); const grey = new THREE.MeshStandardMaterial({ map: K.paintTex('#7a8088', i), roughness: 0.7, metalness: 0.3 }); s.add(T.box(4, 2.4, 22, grey, 0, 1.2, 0)); s.add(T.box(3.2, 3, 6, grey, 0, 3.8, -2)); s.add(T.cyl(0.6, 0.6, 3, '#4a4e52', 0, 6, -1, 12)); s.add(T.box(0.2, 7, 0.2, '#3a3e42', 0, 6, 4)); s.position.set(-90 + r() * 180, 0, -120 - r() * 160); s.rotation.y = 0.3; N.stage.add(s); N.ships.push(s); }
    N.planes = []; for (let i = 0; i < 9; i++) { const p = new THREE.Group(); const m = T.mat('#5a6650'); p.add(T.box(0.8, 0.8, 7, m), T.box(10, 0.15, 1.4, m, 0, 0, 0.6), T.box(3.4, 0.12, 0.9, m, 0, 0, -3)); p.position.set(-60 + (i % 3) * 8, 50 + Math.floor(i / 3) * 4, 40 - Math.floor(i / 3) * 10); N.stage.add(p); N.planes.push(p); } return N; },
  draw(S0, t, info) { S0.sea.update(t); S0.planes.forEach((p, i) => { p.position.z = 60 - t * 16 - Math.floor(i / 3) * 10; }); S0.ships.forEach((s, i) => { s.position.y = Math.sin(t + i) * 0.3; }); const k = smooth(t / info.dur); cam(S0.stage.camera, [lerp(40, -20, k), lerp(14, 40, k), lerp(40, 60, k)], [0, lerp(4, 10, k), -120]); },
  overlay(g, t, info) { chip(g, t, info.lbl, 0.3, W / 2, H * 0.12); if (info.where != null) bigT(g, t, '¿DÓNDE?', info.where, W / 2, H * 0.5, { size: 220, color: '#ffd84a' }); common(g, t, info); } });
// --- Patton in front of "his" army
SH.patton = (info) => ({ kind: '3d', init: (T) => { const N = kentDay(T, { n: 12, fov: 34, z0: -16 }); N.flags = []; for (let i = 0; i < 4; i++) { const pole = T.cyl(0.06, 0.06, 7, '#d8d0b8', -8 + i * 5, 3.5, -3, 8); N.stage.add(pole); const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4, 10, 4), new THREE.MeshStandardMaterial({ map: usTex(), side: THREE.DoubleSide, roughness: 0.9 })); fl.position.set(-8 + i * 5 + 1.25, 6.2, -3); N.stage.add(fl); N.flags.push(fl); } return N; },
  draw(N, t, info) { N.flags.forEach((f, i) => { const pa = f.geometry.attributes.position; for (let j = 0; j < pa.count; j++) pa.setZ(j, Math.sin(t * 5 + pa.getX(j) * 2 + i) * 0.15 * (pa.getX(j) + 1.2)); pa.needsUpdate = true; }); const k = smooth(t / info.dur); cam(N.stage.camera, [lerp(-6, -3, k), 2.2, lerp(10, 7.5, k)], [0, 1.8, 0]); if (info.slap != null && t > info.slap) { const s = (1 - clamp((t - info.slap) / 0.4)) * 0.12; N.stage.camera.position.x += Math.sin(t * 70) * s; } },
  overlay(g, t, info, N) { anchored(g, N.stage, [0, 0, 0], 1.85, { facing: 1, outfit: CAST.patton || TOMI, pose: info.pose ? POSES[info.pose] : breathe(POSES.crossArms, t, 1), expr: exAt(t, info, 'angry'), blink: (t % 3) > 2.9, t });
    if (info.lbl) chip(g, t, info.lbl, 0.3, W / 2, H * 0.12); if (info.slap != null) bigT(g, t, '¡ZAS!', info.slap, W * 0.72, H * 0.35, { size: 150, color: '#ff5a4a', rot: 0.1 }); common(g, t, info); } });
let _us; function usTex() { if (_us) return _us; const c = document.createElement('canvas'); c.width = 380; c.height = 200; const g = c.getContext('2d'); for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#fff' : '#b22234'; g.fillRect(0, (i * 200) / 13, 380, 200 / 13 + 1); } g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, 160, 108); g.fillStyle = '#fff'; for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { g.beginPath(); g.arc(14 + x * 26, 12 + y * 21, 4, 0, 7); g.fill(); } _us = new THREE.CanvasTexture(c); _us.colorSpace = THREE.SRGBColorSpace; return _us; }
// --- Scotland -> Norway
SH.norway = (info) => ({ kind: '3d', init: (T) => { const st = T.stage({ mood: 'day', fov: 38, sky: '#c8d8ea', fog: [40, 260], fogColor: '#dfe8f2', keyColor: '#fff8ee', keyPos: [-30, 30, -20], keyIntensity: 2.6, ambient: 1.5, ambientSky: '#e8f0fa', bloom: 0.3, bloomThreshold: 0.95, shadowSize: 40 }); st.add(K.skyDome({ top: '#7aa0cc', mid: '#a8c4e0', horizon: '#e4edf6', seed: 12 }));
    st.add(T.ground(800, 800, '#f4f6fa')); const r = rng(8); for (let i = 0; i < 60; i++) { const x = -120 + r() * 240, z = -30 - r() * 150; st.add(T.pine3D(x, z, 1.5 + r(), '#2e4a3a')); st.add(T.cone(0.9 * (1.5 + r()), 1.2, '#ffffff', x, (1.5 + r()) * 3.2, z, 7)); }
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(30 + r() * 20, 40 + r() * 30, 6), T.mat('#e8eef6', { flat: true })); m.position.set(-150 + i * 60, 15, -220); st.add(m); }
    const canvas = new THREE.MeshStandardMaterial({ color: '#c8c0a8', roughness: 1 }); for (let i = 0; i < 10; i++) { const tent = new THREE.Mesh(new THREE.ConeGeometry(2, 2.4, 4), canvas); tent.position.set(-20 + (i % 5) * 8, 1.2, -8 - Math.floor(i / 5) * 9); tent.rotation.y = Math.PI / 4; tent.castShadow = true; st.add(tent); }
    st.add(T.cyl(0.08, 0.1, 14, '#5a5a56', 8, 7, -4, 8)); const snow = embers(400, [-30, 0, -30, 30, 20, 20], { color: '#ffffff', size: 0.18, rise: -0.6, seed: 2, op: 0.9 }); st.add(snow); return { stage: st, emb: snow, render: () => st.render(), dispose: () => st.dispose() }; },
  draw(S0, t, info) { S0.emb.update(t); const w = info.wait ?? 99; if (t < w) { const k = smooth(t / w); cam(S0.stage.camera, [lerp(-30, 6, k), lerp(10, 6, k), lerp(26, 18, k)], [0, 2, -10]); } else cam(S0.stage.camera, [-3 + (t - w), 2, 8], [0, 1.6, -2]); },
  overlay(g, t, info, S0) { chip(g, t, info.lbl, 0.3, W / 2, H * 0.12); const w = info.wait ?? 99; if (t > w) { for (const [x, z] of [[-1.5, 0], [0.5, -1], [2.2, 0.4]]) anchored(g, S0.stage, [x, 0, z], 1.8, { facing: 1, outfit: CAST.german, pose: POSES.crossArms, expr: 'thinking', t }); chip(g, t, 'NORUEGA: 13 DIVISIONES ESPERANDO', w + 0.3, W / 2, H * 0.85, { bg: '#ffd84a' }); } common(g, t, info); } });
// --- D-Day landing
SH.beachLanding = (info) => ({ kind: '3d', init: (T) => normandy(T, { fov: 36 }),
  draw(S0, t, info) { upd(S0, t + 20); S0.crafts.forEach((c, i) => { c.position.z = -60 + Math.min(t * 6, 26) + (i % 3) * 3; c.openRamp(clamp((t - 2 - i * 0.2) / 0.4)); }); const k = smooth(t / info.dur); cam(S0.stage.camera, [lerp(34, 22, k), lerp(16, 10, k), lerp(-14, -24, k)], [-4, 1, -40]); },
  overlay(g, t, info) { vignette(g, 0.3); common(g, t, info); } });
// --- the Germans waiting at Calais
SH.calaisWait = (info) => ({ kind: '3d', init: (T) => { const st = T.stage({ mood: 'dusk', fov: 34, sky: ['#3a3060', '#8a5a86', '#f2a070'], fog: [60, 300], fogColor: '#c08a8a', keyColor: '#ffc68a', keyPos: [-60, 12, -80], keyIntensity: 2.4, ambient: 1.0, bloom: 0.7, bloomThreshold: 0.85, shadowSize: 30 });
    const s = sea(600, 600, '#5a6a90'); s.position.set(0, -8, -310); st.add(s); const cliff = T.ground(200, 80, '#ffffff', K.grassTex('#6a8a50')); cliff.position.set(0, 0, 30); st.add(cliff); st.add(T.box(200, 30, 4, T.mat('#efe8d6', { flat: true }), 0, -15, -10));
    const b = K.bunker(); b.position.set(-16, 0, -4); b.rotation.y = Math.PI; st.add(b); const b2 = K.bunker(); b2.position.set(14, 0, 8); b2.rotation.y = Math.PI; st.add(b2); const sb = K.sandbags(10); sb.position.set(2, 0, -4); st.add(sb);
    return { stage: st, sea: s, render: () => st.render(), dispose: () => st.dispose() }; },
  draw(S0, t, info) { S0.sea.update(t); const k = smooth(t / info.dur); cam(S0.stage.camera, [lerp(3, 1, k), lerp(2.2, 2.6, k), lerp(14, 11, k)], [1, 1.4, -30]); },
  overlay(g, t, info, S0) { for (const [x, z] of [[-1.2, 1.6], [1.4, 0.8], [3.6, 2.2]]) anchored(g, S0.stage, [x, 0, z], 1.8, { facing: -1, outfit: CAST.german, pose: POSES.crossArms, expr: t > (info.weeks ?? 99) ? 'sleepy' : 'thinking', blink: (t % 3) > 2.9, t });
    if (info.halt != null) chip(g, t, 'ORDEN: ¡QUEDAOS EN CALAIS!', info.halt, W / 2, H * 0.14, { bg: '#ffd84a' }); if (info.weeks != null) bigT(g, t, 'SEMANAS…', info.weeks, W / 2, H * 0.4, { size: 150, color: '#f6efe1' }); common(g, t, info); } });

// ---------- registration ----------
let n = 0; for (const shot of E.shots) { const sc = shot.params?.scene; if (!SH[sc]) continue; const def = SH[sc]({ ...shot.params, shot, dur: shot.end - shot.start }); if (!def) continue; registerShot(shot.id, def); n++; }
console.log('x3d: 3D shots registered', n);
