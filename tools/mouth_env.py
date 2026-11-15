"""tools/mouth_env.py — lip-sync curve from the real voiceover.

  python3 tools/mouth_env.py --project projects/<slug>

Measures the voice loudness every 10 ms (speech band 250–3500 Hz), turns it into a mouth-opening value 0..1
(closed in silences and pauses, follows each syllable) and writes timeline/mouth.json = {"fps": 100, "v": [...]}.
Scenes read it with mouthAt(globalTime) so characters only move their lips while the narrator is speaking.
"""
import argparse, json, os, subprocess
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--fps', type=int, default=100)
a = ap.parse_args(); P = a.project
cfg = json.load(open(os.path.join(P, 'config.json'))); voice = os.path.join(P, cfg['voiceover'])
SR = 16000
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice, '-af', 'highpass=f=250,lowpass=f=3500', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
hop = SR // a.fps; win = hop * 2; n = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[i * hop:i * hop + win] ** 2) + 1e-12) for i in range(n)])
db = 20 * np.log10(rms + 1e-9)
floor, peak = np.percentile(db, 5), np.percentile(db, 99)           # room noise vs loudest speech
gate = floor + 0.38 * (peak - floor)                                 # below this = silence / pause between words
lvl = np.clip((db - gate) / (peak - gate), 0, 1)
# syllable emphasis: compare with the local maximum over ~300 ms so the jaw opens on vowels and closes between them
k = max(1, int(0.15 * a.fps)); pad = np.pad(db, k, mode='edge')
lmax = np.array([pad[i:i + 2 * k + 1].max() for i in range(len(db))])
syl = np.clip(1 - (lmax - db) / 12.0, 0, 1)
v = lvl * (0.25 + 0.75 * syl ** 2)
out = np.zeros_like(v); cur = 0.0
for i, t in enumerate(v):                                           # fast attack, softer release (natural jaw)
    cur = cur + (t - cur) * (0.65 if t > cur else 0.35); out[i] = cur
out[out < 0.18] = 0.0                                           # closed between syllables and in pauses
json.dump({'fps': a.fps, 'v': [round(float(q), 2) for q in out]}, open(os.path.join(P, 'timeline', 'mouth.json'), 'w'))
talking = (out > 0).mean()
print(f'mouth.json: {n} frames @ {a.fps} fps · mouth open {talking * 100:.0f}% of the time')
