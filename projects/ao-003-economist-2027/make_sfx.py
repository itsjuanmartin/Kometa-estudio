"""Sonido gancho del final: subida de tensión (1,6 s) → silencio corto → CANDADO + golpe grave + campanilla de «desbloqueo»."""
import numpy as np, wave, os, subprocess
SR = 44100; rng = np.random.default_rng(3)
def t(d): return np.arange(int(SR * d)) / SR
def env(n, a, r): e = np.ones(n); a = int(SR * a); e[:a] = np.linspace(0, 1, a); return e * np.exp(-np.arange(n) / (SR * r))
# 1) riser: rising sine sweep + filtered noise, crescendo
x = t(1.6); f = 120 + 900 * (x / 1.6) ** 2
riser = 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
nz = rng.standard_normal(len(x)); nz = np.convolve(nz, np.ones(8) / 8, 'same')
riser = (riser + 0.4 * nz) * (x / 1.6) ** 2.2
# 2) gap (the "breath" that makes the hit land)
gap = np.zeros(int(SR * 0.09))
# 3) hit: padlock clank (inharmonic metal) + sub boom + click
h = t(2.2)
metal = sum(a * np.sin(2 * np.pi * fr * h) * np.exp(-h / dcy) for fr, a, dcy in [(1230, .5, .09), (2710, .35, .06), (4130, .25, .04), (610, .4, .15)])
boom = 1.0 * np.sin(2 * np.pi * (38 + 60 * np.exp(-h / .05)) * h) * np.exp(-h / .55)
click = np.zeros_like(h); click[:300] = rng.standard_normal(300) * np.linspace(1, 0, 300)
bell = 0.22 * (np.sin(2 * np.pi * 1568 * h) + .5 * np.sin(2 * np.pi * 2349 * h)) * np.exp(-(h - .25).clip(0) / .5) * (h > .25)
hit = metal + boom + .8 * click + bell
y = np.concatenate([riser, gap, hit])
# short room reverb
ir = rng.standard_normal(int(SR * .5)) * np.exp(-np.arange(int(SR * .5)) / (SR * .12)) * .03
y = y + np.convolve(y, ir)[:len(y)]
y = y / np.abs(y).max() * 0.89
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
w = wave.open(os.path.join(out, 'sfx_final_candado.wav'), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((y * 32767).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(out, 'sfx_final_candado.wav'), '-b:a', '192k', os.path.join(out, 'sfx_final_candado.mp3')], check=True)
print('riser 0-1.6 s · hit at %.2f s · total %.2f s' % (1.6 + .09, len(y) / SR))
