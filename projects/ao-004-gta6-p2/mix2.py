"""Mezcla parte 2: voz + música de misterio (Penumbra) SOLO hasta «Una cárcel» + efectos.
Desde «Bienvenido a Leonida» queda sin música para que el usuario ponga la de GTA."""
import importlib.util, json, os, subprocess, numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
P1 = os.path.join(os.path.dirname(HERE), 'ao-003-gta6')
spec = importlib.util.spec_from_file_location('mix1', f'{P1}/mix.py'); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
SR = M.SR; DUR = json.load(open(f'{HERE}/config.json'))['duration']; N = int(DUR * SR)
db, place, whoosh, boom, tick, riser, lp = M.db, M.place, M.whoosh, M.boom, M.tick, M.riser, M.lp
rng = np.random.default_rng(11)


def clank():  # puerta de celda: golpe metálico con resonancias
    n = int(1.6 * SR); t = np.arange(n) / SR
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * g for f, d, g in ((310, 3.2, .5), (466, 4.0, .35), (787, 5.5, .25), (1210, 7, .15)))
    hit = lp(rng.normal(0, 1, n), .4) * np.exp(-t * 35) * .9
    return ((ring + hit) * .8 + boom(1.6)[:n] * .6).astype(np.float32)


def pop():
    n = int(.09 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (900 - 4000 * t) * t) * np.exp(-t * 45) * .7).astype(np.float32)


def ding():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return ((np.sin(2 * np.pi * 1318 * t) + .5 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 4) * .35).astype(np.float32)


def click():
    n = int(.03 * SR); t = np.arange(n) / SR
    return (rng.normal(0, 1, n) * np.exp(-t * 300) * .8).astype(np.float32)


def heartbeat():
    n = int(.6 * SR); t = np.arange(n) / SR
    b = lambda t0: np.where(t > t0, np.sin(2 * np.pi * 55 * (t - t0)) * np.exp(-(t - t0) * 18), 0)
    return ((b(0) + .7 * b(.24)) * .9).astype(np.float32)


def main():
    voice = M.load(f'{HERE}/input/voiceover.mp3')[:N]; voice = np.pad(voice, ((0, N - len(voice)), (0, 0)))
    mus = M.load(f'{HERE}/musica/intro_misterio_B_Penumbra.mp3')
    music = np.zeros((N, 2), np.float32); L = min(len(mus), int(12.6 * SR)); music[:L] = mus[:L]
    t = np.arange(N) / SR
    v = np.abs(voice).mean(axis=1); win = int(.05 * SR); env = np.convolve(v, np.ones(win) / win, 'same'); env /= env.max() + 1e-9
    duck = 1 - .35 * np.clip(env * 4, 0, 1); duck = np.convolve(duck, np.ones(int(.15 * SR)) / int(.15 * SR), 'same')
    g = db(-6) * duck * np.clip(t / .2, 0, 1)
    g *= np.clip((12.35 - t) / .25, 0, 1)            # corte seco tras el golpe de la celda
    g *= np.where((t > 11.0) & (t < 11.24), np.clip((11.24 - t) / .24, 0, 1), 1)  # vacío justo antes del golpe
    mix = voice + music * g[:, None]
    sfx = np.zeros((N, 2), np.float32)
    # suspense preciso: latido + tic-tac hasta la cárcel
    for k in np.arange(0.0, 10.9, 1.0): place(sfx, tick(), k + .02, -20)
    for k in (4.3, 5.5, 8.8, 9.7, 10.4): place(sfx, heartbeat(), k, -8)
    place(sfx, riser(1.3), 9.95, -15)
    place(sfx, clank(), 11.24, -4)
    place(sfx, boom(), 12.26, -8); place(sfx, whoosh(), 12.1, -16)
    # cortes
    import importlib.util as iu
    sp = iu.spec_from_file_location('r2', f'{HERE}/reel2.py'); r2 = iu.module_from_spec(sp); sp.loader.exec_module(r2)
    cuts = [s[0] for s in r2.build_shots()][1:]
    w = whoosh()
    for i, c in enumerate(cuts):
        if c in (4.16, 11.24, 12.26): continue
        place(sfx, w, c - .17, -21 if c > 12.3 else -26, pan=(.3 if i % 2 else -.3))
    for tb in (18.28, 19.2, 27.5, 39.28, 41.4, 47.1, 48.46): place(sfx, boom(.8), tb, -13)
    for tm in (51.10, 51.55, 51.95, 52.35, 52.75): place(sfx, pop(), tm, -12)
    place(sfx, click(), 54.75, -6); place(sfx, ding(), 54.9, -12)
    place(sfx, boom(.8), 58.1, -12)
    mix += sfx
    out = f'{HERE}/build/mix.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), out],
                   input=np.clip(mix, -1, 1).astype(np.float32).tobytes(), check=True)
    print('ok', out)


if __name__ == '__main__':
    main()
