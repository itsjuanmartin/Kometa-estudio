import { registerShot } from '/engine/core.js';
import * as K from '/engine/kit3d.js';
const day = (T) => { const st = T.stage({ mood: 'day', fov: 36, sky: '#9cc4ee', fog: [60, 400], fogColor: '#cfe0f0', keyColor: '#fff2dc', keyPos: [25, 30, 18], keyIntensity: 3.2, ambient: 1.3, ambientSky: '#b8d4f0', bloom: 0.35, bloomThreshold: 0.92, shadowSize: 12 });
  st.camera.far = 1500; st.camera.updateProjectionMatrix(); st.add(K.skyDome());
  const gr = T.ground(600, 600, '#ffffff', K.grassTex()); st.add(gr); return st; };
registerShot('a', { kind: '3d', init: (T) => { const st = day(T); const t = K.sherman(); st.add(t); return { stage: st }; }, draw(S, t) { const c = S.stage.camera; c.position.set(9, 3.2, 12); c.lookAt(0, 1.5, 0); } });
registerShot('b', { kind: '3d', init: (T) => { const st = day(T); const sand = T.ground(600, 600, '#ffffff', K.sandTex()); sand.position.y = 0.01; st.add(sand); const l = K.lcvp(); l.position.set(-4, 0, 0); l.ramp.rotation.x = 1.4; st.add(l); const b = K.bunker(); b.position.set(8, 0, -12); st.add(b); for (let i = 0; i < 3; i++) { const h = K.hedgehog(); h.position.set(4 + i * 3, 0.72, 2 - i * 2); st.add(h); } const sb = K.sandbags(); sb.position.set(2, 0, -5); st.add(sb); return { stage: st }; }, draw(S, t) { const c = S.stage.camera; c.position.set(14, 6, 18); c.lookAt(0, 1.5, -2); } });
