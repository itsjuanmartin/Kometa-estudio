import { registerShot, clamp, ease } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { toonBigFace } from '/engine/toon2d.js';
import * as K from '/engine/kit3d.js';
import * as X from '/project/scenes/_set3d.js';
const THREE = X.T3.THREE;
const TOMI = { top: 'uniform', color: '#7a6e4a', legs: '#6a5f40', shoes: '#2a1f18', belt: '#4a3a24', hair: 'side', hairColor: '#2e2420', hat: 'beret', hatColor: '#3a3a5a' };
registerShot('A', { kind: '3d', init: (T) => { const N = X.nightField(T, { fov: 34 }); const tk = K.sherman({ inflatable: true }); tk.position.set(2.5, 0, -1); tk.rotation.y = -0.55; N.stage.add(tk); const l = new THREE.PointLight('#ffb860', 90, 20, 2); l.position.set(-1, 2, 3); N.stage.add(l); const rim = new THREE.SpotLight('#9fd0ff', 700, 40, 0.6, 0.5, 2); rim.position.set(-6, 9, -12); rim.target = tk; N.stage.add(rim); return N; },
  draw(N) { N.emb.update(1); const c = N.stage.camera; c.position.set(-5.5, 1.1, 8); c.lookAt(1.2, 1.9, -1); },
  overlay(g, t, info, N) { toonBigFace(g, 420, 640, 230, { outfit: TOMI, expr: 'shocked', t: 0 }); } });
registerShot('B', { kind: '3d', init: (T) => { const N = X.normandy(T, { hero: true, fov: 46 }); N.stage.scene.fog.near = 70; N.stage.scene.fog.far = 300; return N; },
  draw(S0) { const t = 1.85; X.upd(S0, t); S0.blasts.forEach(b => b.update(t)); const h = S0.hero; h.position.set(0, 0, -66 + t * 3.2); h.openRamp(1); const hp = h.position; const c = S0.stage.camera; c.position.set(hp.x, hp.y + 3.0, hp.z - 2); c.lookAt(hp.x, 2.2, hp.z + 30); } });
registerShot('C', { kind: '3d', init: (T) => { const st = T.stage({ mood: 'night', fov: 36, sky: ['#05060c', '#0b0d18', '#141628'], fog: [10, 60], fogColor: '#0a0c18', keyIntensity: 0.15, ambient: 0.3, bloom: 1.0, bloomThreshold: 0.6 }); st.add(T.ground(80, 80, '#0f0e13')); const spot = new THREE.SpotLight('#fff1cf', 380, 40, 0.42, 0.5, 2); spot.position.set(0, 14, 2); spot.target.position.set(0, 0, 0); st.add(spot, spot.target); const cone = new THREE.Mesh(new THREE.ConeGeometry(5.6, 14, 40, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(0, 7, 0.5); st.add(cone); return { stage: st, render: () => st.render(), dispose: () => st.dispose() }; },
  draw(S0) { const c = S0.stage.camera; c.position.set(0, 3, 12); c.lookAt(0, 3.4, 0); },
  overlay(g) { toonBigFace(g, 960, 600, 260, { outfit: { top: 'suit', color: '#3a3a44', color2: '#7a2a2a', legs: '#3a3a44', hair: 'side', hairColor: '#1e1a18', mustache: true, mustacheColor: '#1e1a18' }, expr: 'smirk', t: 0 }); } });
