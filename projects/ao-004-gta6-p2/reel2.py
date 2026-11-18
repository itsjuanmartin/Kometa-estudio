"""GTA VI parte 2 (Archivo Oscuro): reutiliza el motor de ../ao-003-gta6/reel.py y añade
pantalla de carga, VS Lucía/Jason, burbujas de comentarios y mockup de suscripción.

  python3 reel2.py --stills 1,5,11.5   ·   python3 reel2.py --from 0 --to 10 --out build/p.mp4
"""
import argparse, importlib.util, json, os, subprocess, sys
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
P1 = os.path.join(os.path.dirname(HERE), 'ao-003-gta6')
ROOT = os.path.dirname(os.path.dirname(HERE))
spec = importlib.util.spec_from_file_location('base', f'{P1}/reel.py'); B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
W, H, FPS = B.W, B.H, B.FPS
DUR = json.load(open(f'{HERE}/config.json'))['duration']
B.DUR = DUR
ease, eout, back, comp, pill, text_layer, font = B.ease, B.eout, B.back, B.comp, B.pill, B.text_layer, B.font
PINK, ORANGE, YELLOW, CYAN = B.PINK, B.ORANGE, B.YELLOW, B.CYAN
RED = (235, 40, 40)
WHITE = (255, 255, 255)

# ------------------------------------------------------------------ imágenes de los dos proyectos
_base_src = B.src
_c = {}


def src(name):
    if name in _c: return _c[name]
    if name == 'black':
        a = np.zeros((H, W, 3), np.uint8)
    elif os.path.exists(f'{HERE}/assets/photos/{name}.jpg'):
        im = Image.open(f'{HERE}/assets/photos/{name}.jpg').convert('RGB')
        s = max(1.0, 1500 / im.width)
        if s > 1: im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 70, 2))
        a = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)
    else:
        a = _base_src(name)
    _c[name] = a
    return a


B.src = src
_base_grade = B.grade


def grade(img, mode):
    f = img.astype(np.float32)
    if mode == 'night':  # suspense: frío, desaturado, oscuro
        g = f.mean(axis=2, keepdims=True); f = (f * .45 + g * .55) * np.array([1.12, .95, .82]) * .62
        return np.clip(f, 0, 255).astype(np.uint8)
    if mode == 'red':
        g = f.mean(axis=2, keepdims=True); f = (f * .35 + g * .65) * np.array([.55, .6, 1.35]) * .8
        return np.clip(f, 0, 255).astype(np.uint8)
    if mode == 'vivid':
        g = f.mean(axis=2, keepdims=True); f = g + (f - g) * 1.25
        return np.clip(f * 1.04, 0, 255).astype(np.uint8)
    return _base_grade(img, mode)


B.grade = grade

# ------------------------------------------------------------------ plano de montaje
LUCIA = (.43, .30)
JASON = (.575, .31)


def build_shots():
    S = []
    def add(t0, t1, img, **o): S.append((t0, t1, img, o))
    # --- suspense (música de misterio)
    add(0.00, 1.96, 'windows', z=(1.25, 1.08), f=(.5, .42), grade='night', flash=False)
    add(1.96, 3.12, 'ps5', z=(1.15, 1.35), f=(.5, .42), grade='night', punch=True)
    add(3.12, 4.16, 'adult2026', z=(1.35, 1.55), f=(.33, .28), grade='night', punch=True)
    add(4.16, 6.92, 'black', z=(1, 1), f=(.5, .5), flash=False)
    add(6.92, 8.70, 'oceandrive', z=(1.1, 1.3), f=(.5, .5), grade='night')
    add(8.70, 11.24, 'cell2', z=(1.0, 1.22), f=(.5, .45), grade='night')
    add(11.24, 12.26, 'cell', z=(1.35, 1.15), f=(.5, .45), grade='red', punch=True)
    # --- GTA (aquí entra la música de GTA que pone el usuario)
    add(12.26, 13.48, 'couple', z=(1.0, 1.18), f=(.5, .42), grade='vivid', punch=True)
    add(13.48, 15.10, 'sevenmile', z=(1.05, 1.3), f=(.5, .5), grade='vivid', punch=True)
    add(15.10, 18.28, 'oceandrive', z=(1.0, 1.25), f=(.45, .5), f2=(.55, .5), grade='vivid')
    add(18.28, 19.12, 'ad_toronto', z=(1.5, 1.7), f=(.30, .62), punch=True)
    add(19.12, 20.44, 'couple', z=(2.6, 2.9), f=LUCIA, punch=True)
    add(20.44, 21.92, 'girl', z=(1.0, 1.1), f=(.5, .4), card=True, cardh=1150, cardw=860, bg='couple', punch=True, rot=(-3, 0))
    add(21.92, 23.40, 'couple', z=(1.9, 2.2), f=(.45, .38), f2=(.42, .30))
    add(23.40, 25.88, 'cell', z=(1.05, 1.25), f=(.5, .5), grade='night', punch=True)
    add(25.88, 27.46, 'couple', z=(1.15, 1.0), f=(.5, .5), grade='vivid', punch=True)
    add(27.46, 28.38, 'couple', z=(2.6, 2.9), f=JASON, punch=True)
    add(28.38, 30.24, 'couple', z=(1.7, 1.95), f=(.58, .45), f2=(.6, .55))
    add(30.24, 31.34, 'heli', z=(1.0, 1.12), f=(.5, .45), card=True, cardh=1150, cardw=860, bg='heli', punch=True, rot=(4, 0))
    add(31.34, 32.78, 'sevenmile', z=(1.3, 1.1), f=(.5, .45), grade='vivid', punch=True)
    add(32.78, 34.88, 'keysboat', z=(1.05, 1.3), f=(.5, .5), grade='vivid', punch=True)
    add(34.88, 36.38, 'couple', z=(1.2, 1.35), f=(.5, .4), punch=True)
    add(36.38, 37.54, 'bonnieclyde', z=(1.0, 1.12), f=(.5, .35), grade='sepia', punch=True)
    add(37.54, 39.28, 'car', z=(1.0, 1.15), f=(.5, .45), card=True, cardh=1150, cardw=860, bg='car', punch=True, rot=(-4, 0))
    add(39.28, 40.28, 'bike', z=(1.1, 1.3), f=(.5, .45), card=True, cardh=1150, cardw=860, bg='bike', grade='red', punch=True, rot=(5, 0))
    seq = ['gunman', 'rapper', 'gator', 'boat', 'wanted']; t = 40.28; st = (44.30 - 40.28) / len(seq)
    for i, n in enumerate(seq):
        add(t, t + st, n, z=(1.0, 1.12), f=(.5, .45), card=True, cardh=1150, cardw=860, bg=n, punch=True, rot=((-4, 4)[i % 2], 0), grade='sepia' if n == 'wanted' else None)
        t += st
    add(44.30, 46.10, 'couple', z=(1.0, 1.12), f=(.5, .45))
    add(46.10, 48.46, 'couple', z=(1.3, 1.55), f=(.5, .35), grade='red', punch=True)
    add(48.46, 53.54, 'couple', z=(1.0, 1.0), f=(.5, .5), vs=True, flash=True)
    add(53.54, DUR, 'couple', z=(1.0, 1.1), f=(.5, .45), dim=.55, punch=True)
    return S


# ------------------------------------------------------------------ elementos nuevos
def badge(frame, t):
    """etiqueta PARTE 2 fija arriba a la izquierda."""
    a = min(1, t / .25) if t < 53.5 else max(0, 1 - (t - 53.5) / .3)
    if a <= 0: return frame
    return pill_at(frame, 'PARTE 2', 46, 150, PINK, WHITE, 40, a)


def pill_at(frame, text, x, y, bg, fg, size, alpha=1.0, fpath=B.FONT):
    f = font(fpath, size); L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    bb = d.textbbox((0, 0), text, font=f); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.rounded_rectangle((x, y, x + tw + 44, y + th + 26), radius=(th + 26) // 2, fill=bg + (240,))
    d.text((x + 22 - bb[0], y + 13 - bb[1]), text, font=f, fill=fg)
    return comp(frame, ([np.asarray(L).astype(np.float32)], alpha))


def loading(frame, t):
    """pantalla en negro de consola: logo que respira + barra de carga."""
    p = (t - 4.16) / (6.92 - 4.16)
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    breath = .35 + .35 * (0.5 + 0.5 * np.sin(t * 4))
    f = font(B.FONT, 64); s = 'CARGANDO'
    bb = d.textbbox((0, 0), s, font=f); d.text(((W - bb[2]) / 2, 900), s, font=f, fill=(255, 255, 255, int(255 * breath)))
    x0, x1, y = 290, 790, 1010
    d.rounded_rectangle((x0, y, x1, y + 14), 7, fill=(255, 255, 255, 50))
    d.rounded_rectangle((x0, y, x0 + int((x1 - x0) * min(1, ease(p) * .97)), y + 14), 7, fill=PINK + (255,))
    # giro tipo spinner
    cx, cy, r = W // 2, 780, 46
    for k in range(10):
        ang = t * 7 + k * .628; al = int(255 * (k + 1) / 10)
        d.ellipse((cx + r * np.cos(ang) - 7, cy + r * np.sin(ang) - 7, cx + r * np.cos(ang) + 7, cy + r * np.sin(ang) + 7), fill=(255, 255, 255, al))
    return comp(frame, ([np.asarray(L).astype(np.float32)], min(1, (t - 4.16) / .3)))


def tile(img, zoom, fx, fy, w, h):
    return B.cover(img, zoom, fx, fy, (w, h))


def vs(frame, t):
    """pantalla dividida LUCÍA vs JASON con barra de votos."""
    dt = t - 48.46; img = src('couple')
    frame = (B.blurred_bg('couple') * 1.0).astype(np.uint8)
    w, h = 500, 760; y = 380
    sl = eout(dt / .35)
    zz = 4.6 + .25 * dt / 5
    left = tile(img, zz, .405, .30, w, h); right = tile(img, zz, .595, .31, w, h)
    xl = int(-w + (25 + w) * sl); xr = int(W - (W - 555) * sl)
    for im, x, col in ((left, xl, PINK), (right, xr, CYAN)):
        x0, x1 = max(0, x), min(W, x + w)
        if x1 > x0:
            frame[y:y + h, x0:x1] = im[:, x0 - x:x1 - x]
            cv2.rectangle(frame, (x0, y), (x1 - 1, y + h - 1), col[::-1], 6)
    frame = comp(frame, text_layer(['¿QUIÉN TRAICIONA', 'A QUIÉN?'], 92, 120, [WHITE, YELLOW], scale=.7 + .3 * back(dt / .35)))
    if dt > .3:
        frame = comp(frame, text_layer(['VS'], 170, y + h // 2 - 110, [YELLOW], scale=.4 + .6 * back((dt - .3) / .3), glow=RED))
        frame = pill_at(frame, 'LUCÍA', 60, y + h - 90, PINK, WHITE, 52, min(1, (dt - .3) / .2))
        frame = pill_at(frame, 'JASON', 590, y + h - 90, CYAN, (0, 0, 0), 52, min(1, (dt - .3) / .2))
    # comentarios que llegan (a partir de «Escribe LUCÍA o JASON»)
    msgs = [(51.10, 'LUCÍA', PINK), (51.55, 'JASON', CYAN), (51.95, 'LUCÍA', PINK), (52.35, 'JASON', CYAN), (52.75, 'LUCÍA', PINK)]
    for i, (tm, word, col) in enumerate(msgs):
        if t < tm: continue
        a = eout((t - tm) / .2)
        frame = bubble(frame, word, col, [60, 600, 60, 600, 60][i], [1180, 1250, 1320, 1390, 1460][i] - int(30 * (1 - a)), a, i)
    return frame


def bubble(frame, word, col, x, y, a, seed):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    f1 = font(B.FONT2, 30); f2 = font(B.FONT, 44)
    user = ['@vice.fan', '@leonida_22', '@el.jason', '@lu.team', '@gta.noche'][seed % 5]
    w = 360; h = 108
    d.rounded_rectangle((x, y, x + w, y + h), 26, fill=(255, 255, 255, 240))
    d.ellipse((x + 16, y + 22, x + 76, y + 82), fill=col + (255,))
    d.text((x + 92, y + 12), user, font=f1, fill=(110, 110, 120, 255))
    d.text((x + 92, y + 44), word, font=f2, fill=(20, 20, 24, 255))
    return comp(frame, ([np.asarray(L).astype(np.float32)], a))


_logo = None


def subscribe(frame, t):
    """mockup de canal: logo + Archivo Oscuro + botón SUSCRIBIRSE que se pulsa."""
    global _logo
    if _logo is None:
        lg = Image.open(f'{ROOT}/home/logo_ao.jpg').convert('RGB').resize((170, 170), Image.LANCZOS)
        m = Image.new('L', (170, 170), 0); ImageDraw.Draw(m).ellipse((0, 0, 169, 169), fill=255)
        _logo = (lg, m)
    dt = t - 53.54; a = eout(dt / .3); tap = 54.75
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    y0 = int(600 + 60 * (1 - a)); x0, x1 = 70, W - 70
    d.rounded_rectangle((x0, y0, x1, y0 + 470), 40, fill=(24, 24, 28, 245), outline=(255, 255, 255, 40), width=2)
    L.paste(_logo[0], (x0 + 40, y0 + 46), _logo[1])
    d.ellipse((x0 + 34, y0 + 40, x0 + 216, y0 + 222), outline=PINK + (255,), width=5)
    d.text((x0 + 245, y0 + 62), 'Archivo Oscuro', font=font(B.FONT, 66), fill=WHITE)
    d.text((x0 + 248, y0 + 150), 'Casos reales que parecen de película', font=font(B.FONT2, 36), fill=(185, 185, 195))
    # botón
    pressed = t >= tap; k = 1 - .08 * max(0, 1 - abs(t - tap) / .12)
    bw, bh = int(560 * k), int(110 * k); bx = W // 2 - bw // 2; by = y0 + 290 + (110 - bh) // 2
    if not pressed:
        d.rounded_rectangle((bx, by, bx + bw, by + bh), bh // 2, fill=(230, 33, 23, 255))
        s = 'SUSCRIBIRSE'; col = WHITE
    else:
        d.rounded_rectangle((bx, by, bx + bw, by + bh), bh // 2, fill=(62, 62, 70, 255))
        s = 'SUSCRITO'; col = (235, 235, 240)
    f = font(B.FONT, 56); bb = d.textbbox((0, 0), s, font=f)
    d.text((W // 2 - (bb[2] - bb[0]) // 2 - bb[0], by + bh // 2 - (bb[3] - bb[1]) // 2 - bb[1]), s, font=f, fill=col)
    out = comp(frame, ([np.asarray(L).astype(np.float32)], a))
    out = comp(out, text_layer(['SÍGUEME'], 170, 300, [WHITE], scale=.6 + .4 * back(dt / .35), glow=PINK))
    # toque: círculo de pulsación
    if tap - .25 < t < tap + .45:
        q = (t - (tap - .25)) / .7
        cx, cy = W // 2 + 150, y0 + 345
        rad = int(30 + 80 * eout(q)); al = max(0, 1 - q)
        ov = out.copy(); cv2.circle(ov, (cx, cy), rad, (255, 255, 255), 6, cv2.LINE_AA)
        if t < tap + .05: cv2.circle(ov, (cx, cy), 34, (255, 255, 255), -1, cv2.LINE_AA)
        out = cv2.addWeighted(ov, al * .9, out, 1 - al * .9, 0)
    # tarjeta parte 3
    if t > 55.3:
        out = pill(out, 'PARTE 3: LOS CRÍMENES REALES DE GTA VI', y0 + 520, PINK, size=46, alpha=eout((t - 55.3) / .2))
    if t > 58.1:
        out = comp(out, text_layer(['PEORES QUE EL JUEGO'], 104, y0 + 640, [RED], scale=.6 + .4 * back((t - 58.1) / .3), glow=(120, 0, 0)))
    return out


def overlays(frame, t):
    def win(a, b): return a <= t < b
    def k(a, d=.18): return eout((t - a) / d)
    if win(0, 4.16):
        frame = comp(frame, text_layer(['00:00'], 230, 400, [WHITE], scale=.8 + .2 * back(t / .3), glow=PINK))
        if t > 1.96: frame = pill(frame, 'MILLONES DE CONSOLAS', 690, (20, 20, 20), WHITE, 52, k(1.96))
    if win(4.16, 6.92): frame = loading(frame, t)
    if win(8.70, 11.24) and t > 9.9: frame = pill(frame, 'MUY DIFÍCIL SALIR', 420, (20, 20, 20), WHITE, 54, k(9.9))
    if win(11.24, 12.26):
        frame = comp(frame, text_layer(['UNA CÁRCEL'], 170, 520, [RED], scale=.55 + .45 * back((t - 11.4) / .25), glow=(0, 0, 0)))
    if win(12.26, 13.48):
        frame = comp(frame, text_layer(['BIENVENIDO A', 'LEONIDA'], 150, 300, [WHITE, PINK], scale=.6 + .4 * back((t - 12.3) / .3), glow=ORANGE))
    if win(13.48, 15.10) and t > 13.8: frame = pill(frame, 'LA FLORIDA DE GTA VI', 330, ORANGE, (0, 0, 0), 56, k(13.8))
    if win(15.10, 18.28) and t > 16.2:
        p = ease((t - 16.3) / 1.2); y = 2002 + int(round(24 * p))
        frame = comp(frame, text_layer([str(y)], 200, 330, [YELLOW if y == 2026 else WHITE], glow=PINK if y == 2026 else None))
        frame = pill(frame, 'VUELVE +20 AÑOS DESPUÉS', 590, (20, 20, 20), WHITE, 50, k(16.2))
    if win(18.28, 19.12):
        frame = comp(frame, text_layer(['VICE CITY'], 200, 300, [PINK], scale=.6 + .4 * back((t - 18.28) / .25), glow=CYAN))
    if win(19.12, 20.44): frame = comp(frame, text_layer(['LUCÍA'], 220, 250, [PINK], scale=.6 + .4 * back((t - 19.2) / .25), glow=(0, 0, 0)))
    if win(20.44, 23.40) and t > 21.0: frame = pill(frame, 'PELEA DESDE NIÑA', 230, PINK, WHITE, 56, k(21.0))
    if win(23.40, 25.88) and t > 24.5: frame = pill(frame, 'PENITENCIARÍA DE LEONIDA', 380, RED, WHITE, 52, k(24.5))
    if win(25.88, 27.46) and t > 26.4: frame = comp(frame, text_layer(['PURA SUERTE'], 140, 300, [YELLOW], scale=.6 + .4 * back((t - 26.4) / .25)))
    if win(27.46, 28.38): frame = comp(frame, text_layer(['JASON'], 220, 250, [CYAN], scale=.6 + .4 * back((t - 27.5) / .25), glow=(0, 0, 0)))
    if win(28.38, 30.24) and t > 29.2: frame = pill(frame, 'CRECIÓ ENTRE ESTAFADORES', 300, CYAN, (0, 0, 0), 50, k(29.2))
    if win(30.24, 31.34): frame = pill(frame, 'EXMILITAR', 200, (40, 60, 40), WHITE, 58, k(30.3))
    if win(31.34, 32.78): frame = comp(frame, text_layer(['LOS CAYOS'], 170, 300, [WHITE], scale=.6 + .4 * back((t - 31.6) / .25), glow=CYAN))
    if win(32.78, 34.88) and t > 33.4: frame = pill(frame, 'TRABAJA PARA TRAFICANTES', 330, RED, WHITE, 50, k(33.4))
    if win(36.38, 37.54):
        frame = pill(frame, 'BONNIE Y CLYDE · 1933 (REALES)', 250, (20, 20, 20), YELLOW, 50, k(36.4))
    if win(37.54, 40.28) and t > 39.28:
        frame = comp(frame, text_layer(['SALE MAL'], 190, 260, [RED], scale=.5 + .5 * back((t - 39.28) / .22), glow=(0, 0, 0)))
    if win(40.28, 44.30) and t > 41.4:
        frame = comp(frame, text_layer(['CONSPIRACIÓN', 'CRIMINAL'], 120, 180, [WHITE, RED], scale=.7 + .3 * back((t - 41.4) / .3)))
    if win(44.30, 46.10) and t > 44.6: frame = pill(frame, 'SOLO SE TIENEN EL UNO AL OTRO', 300, (20, 20, 20), WHITE, 48, k(44.6))
    if win(46.10, 48.46) and t > 47.1:
        frame = comp(frame, text_layer(['NADIE ES', 'DE FIAR'], 170, 260, [WHITE, RED], scale=.5 + .5 * back((t - 47.1) / .25), glow=(0, 0, 0)))
    if win(48.46, 53.54): frame = vs(frame, t)
    if t >= 53.54: frame = subscribe(frame, t)
    return frame


B.overlays = overlays


def render_frame(t, fi, shots, chunks):
    cur = next((s for s in shots if s[0] <= t < s[1]), shots[-1])
    fr = B.render_frame(t, fi, shots, chunks)
    if t < 48.46: fr = badge(fr, t)
    return fr


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--from', dest='a', type=float, default=0); ap.add_argument('--to', dest='b', type=float, default=DUR)
    ap.add_argument('--stills'); ap.add_argument('--out', default=f'{HERE}/build/reel_silent.mp4'); ap.add_argument('--part', default='')
    a = ap.parse_args(); os.makedirs(f'{HERE}/build', exist_ok=True)
    shots = build_shots(); words = json.load(open(f'{HERE}/timeline/words.json'))['words']
    chunks = B.caption_chunks(words)
    chunks = [c for c in chunks if c[0] < 48.46]  # sin subtítulos en el VS ni en el mockup final
    if a.stills:
        os.makedirs(f'{HERE}/build/stills', exist_ok=True)
        for s in a.stills.split(','):
            t = float(s); cv2.imwrite(f'{HERE}/build/stills/t{t:05.2f}.jpg', render_frame(t, int(t * FPS), shots, chunks), [cv2.IMWRITE_JPEG_QUALITY, 90])
        return
    f0, f1 = int(round(a.a * FPS)), int(round(a.b * FPS))
    ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', a.out], stdin=subprocess.PIPE)
    for fi in range(f0, f1):
        ff.stdin.write(render_frame(fi / FPS, fi, shots, chunks).tobytes())
        if fi % 150 == 0: print(f'{a.part} {fi}/{f1}', flush=True)
    ff.stdin.close(); ff.wait()


if __name__ == '__main__':
    main()
