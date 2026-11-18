"""Mezcla del reel: voz + música (Ouroboros, Kevin MacLeod, CC BY 4.0) con ducking + efectos sintetizados."""
import json, subprocess, numpy as np, os

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000; DUR = 57.16; N = int(DUR * SR)
rng = np.random.default_rng(7)


def load(path, start=0.0):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(start), '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).reshape(-1, 2).copy()


def db(x): return 10 ** (x / 20)


def lp(x, a):  # filtro paso bajo de un polo
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y


def whoosh(d=.34):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = rng.normal(0, 1, n).astype(np.float32)
    # barrido: mezcla de paso bajo de frecuencia creciente
    y = lp(x, .02) * (1 - t) + lp(x, .25) * t
    env = np.sin(np.pi * t) ** 1.6
    return (y * env / (np.abs(y).max() + 1e-9)).astype(np.float32)


def boom(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR
    f = 38 + 50 * np.exp(-t * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    click = rng.normal(0, 1, n) * np.exp(-t * 60) * .5
    return (s + lp(click, .3)).astype(np.float32) * .9


def tick():
    n = int(.06 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120) * .6).astype(np.float32)


def riser(d=1.2):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = rng.normal(0, 1, n).astype(np.float32)
    y = lp(x, .01) * (1 - t) + lp(x, .35) * t
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * t ** 2) / SR) * .25
    return ((y / (np.abs(y).max() + 1e-9)) * t ** 2 + tone * t ** 2).astype(np.float32)


def place(buf, clip, t, gain_db, pan=0.0):
    i = int(t * SR); j = min(len(buf), i + len(clip))
    if i >= len(buf) or j <= i: return
    c = clip[:j - i] * db(gain_db)
    buf[i:j, 0] += c * (1 - max(0, pan)); buf[i:j, 1] += c * (1 + min(0, pan))


def main():
    voice = load(f'{HERE}/input/voiceover.mp3')[:N]
    voice = np.pad(voice, ((0, N - len(voice)), (0, 0)))
    music = load(f'{HERE}/assets/music/Ouroboros.mp3', 16.0)
    music = np.tile(music, (2, 1))[:N]
    # envolvente de la voz para el ducking (ventana 50 ms)
    v = np.abs(voice).mean(axis=1); win = int(.05 * SR)
    env = np.convolve(v, np.ones(win) / win, 'same'); env = env / (env.max() + 1e-9)
    duck = 1 - .45 * np.clip(env * 4, 0, 1)
    duck = np.convolve(duck, np.ones(int(.15 * SR)) / int(.15 * SR), 'same')
    g = np.full(N, db(-15.0), np.float32) * duck
    t = np.arange(N) / SR
    g *= np.clip(t / .25, 0, 1)                              # entrada
    g *= np.where((t > 13.30) & (t < 14.62), db(-22), 1)       # silencio dramático en "Trece años."
    g *= np.where((t > 44.9) & (t < 45.62), db(-10), 1)        # hueco antes de "esta noche"
    g *= np.clip((DUR - t) / 1.2, 0, 1)                         # salida
    g = np.convolve(g, np.ones(600) / 600, 'same')
    mix = voice * db(0) + music * g[:, None]
    sfx = np.zeros((N, 2), np.float32)
    # whoosh en cada corte
    import importlib.util
    spec = importlib.util.spec_from_file_location('reel', f'{HERE}/reel.py'); reel = importlib.util.module_from_spec(spec); spec.loader.exec_module(reel)
    cuts = [s[0] for s in reel.build_shots()][1:]
    w = whoosh()
    for k, c in enumerate(cuts): place(sfx, w, c - .17, -22, pan=(.3 if k % 2 else -.3))
    for tb in (0.02, 13.36, 47.98, 53.36): place(sfx, boom(), tb, -9)
    for tb in (22.2, 28.2, 32.6, 37.1): place(sfx, boom(.7), tb, -16)
    for tt in (45.66, 46.4, 47.0): place(sfx, tick(), tt, -14)
    place(sfx, riser(1.3), 44.65, -19)
    mix += sfx
    out = f'{HERE}/build/mix.wav'
    pcm = np.clip(mix, -1, 1).astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), out], input=pcm, check=True)
    print('ok', out)


if __name__ == '__main__':
    main()
