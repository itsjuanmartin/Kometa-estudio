"""AO-003 · mezcla: voz + música (Martian Cowboy, CC BY) con ducking + efectos sincronizados con render_reel.T, y mux final."""
import os, subprocess, wave
import numpy as np
from render_reel import T, LABELS, CASILLAS, SFX_HIT, END, HERE

SR = 44100; rng = np.random.default_rng(11); N = int(SR * (END + .5)); fx = np.zeros(N)
def tt(d): return np.arange(int(SR * d)) / SR
def add(sig, at, gain=1.):
    i = int(at * SR); j = min(N, i + len(sig)); fx[i:j] += gain * sig[:j - i]
def lp(x, k): return np.convolve(x, np.ones(k) / k, 'same')

def whoosh(d=.5):
    x = tt(d); n = lp(rng.standard_normal(len(x)), 6) - lp(rng.standard_normal(len(x)), 40)
    return n * np.sin(np.pi * x / d) ** 2 * .9
def pop():
    x = tt(.12); return np.sin(2 * np.pi * (500 + 900 * x / .12) * x) * np.exp(-x / .03)
def hit():
    x = tt(1.0); return np.sin(2 * np.pi * (40 + 70 * np.exp(-x / .04)) * x) * np.exp(-x / .35) + .5 * lp(rng.standard_normal(len(x)), 3) * np.exp(-x / .02)
def ding():
    x = tt(1.2); return sum(a * np.sin(2 * np.pi * f * x) for f, a in [(1318, .5), (1976, .3), (2637, .15)]) * np.exp(-x / .35)
def stamp():
    x = tt(.4); return np.sin(2 * np.pi * 90 * x) * np.exp(-x / .07) + .6 * lp(rng.standard_normal(len(x)), 4) * np.exp(-x / .04)
def marker():
    x = tt(.22); return lp(rng.standard_normal(len(x)), 2) * np.sin(np.pi * x / .22) * .5
def tick():
    x = tt(.05); return np.sin(2 * np.pi * 2200 * x) * np.exp(-x / .01)
def bubble():
    x = tt(.18); return np.sin(2 * np.pi * (700 + 600 * (x / .18)) * x) * np.exp(-x / .07)

for k in ['pues', 'esta', 'internet', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'otras5', 'pista', 'guarda', 'siguenos']: add(whoosh(), T[k] - .15, .35)
add(hit(), T['asi'], .9)
for t0, _, _ in LABELS: add(pop(), t0 + .05, .35)
for i in range(10): add(tick(), T['diez'] - .1 + i * .025, .25)
for i in range(10): add(pop(), T['ense'] + .05 * i, .18)
add(ding(), T['bingo'], .6); add(hit(), T['bingo'], .5)
for _, tp, _ in CASILLAS: add(marker(), tp, .5); add(stamp(), tp + .15, .6)
add(stamp(), T['dicen'], .45); add(bubble(), T['taiwan2'], .4); add(tick(), T['visto'], .4)
for j in range(5): add(stamp(), T['otras5'] + .25 + j * .14, .45)
for j in range(6): add(bubble(), T['inet2'] + j * .25, .18)
add(pop(), T['guarda'], .4); add(stamp(), T['cuantas'], .4)
cand = os.path.join(HERE, 'out/sfx_final_candado.mp3')
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', cand, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
add(np.frombuffer(pcm, np.int16) / 32768., SFX_HIT - 1.69, .8)
fx = fx / max(1., np.abs(fx).max() / .9)
fxp = os.path.join(HERE, 'out/sfx_track.wav'); w = wave.open(fxp, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((fx * 32767).astype(np.int16).tobytes()); w.close()

voice = os.path.join(HERE, 'audio/voz.mp3'); music = os.path.join(HERE, 'audio/Martian_Cowboy.mp3')
fade = SFX_HIT - 1.8
flt = (f"[0:a]aresample=44100,apad=whole_dur={END}[v];[v]asplit[v1][v2];"
       f"[1:a]atrim=0:{END},volume=0.32,afade=t=out:st={fade}:d=1.2[m];"
       f"[m][v2]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=300[md];"
       f"[2:a]volume=0.9[f];[v1][md][f]amix=inputs=3:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
out = os.path.join(HERE, 'out/AO003_reel_economist_2027.mp4')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', voice, '-i', music, '-i', fxp, '-i', os.path.join(HERE, 'out/video_mudo.mp4'),
                '-filter_complex', flt, '-map', '3:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', str(END), '-movflags', '+faststart', out], check=True)
print('ok', out)
