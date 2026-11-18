"""Reel GTA VI (Archivo Oscuro) — montaje vertical 1080x1920 con zooms, cortes rápidos, textos y subtítulos.

  python3 reel.py                 # vídeo completo -> build/reel_silent.mp4
  python3 reel.py --stills 1,9,30 # fotogramas sueltos -> build/stills/
  python3 reel.py --from 0 --to 8 # previsualizar un tramo
"""
import argparse, json, math, os, subprocess, sys
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
W, H, FPS = 1080, 1920, 30
DUR = 57.16
FONT = os.path.join(ROOT, 'assets/fonts/Anton-Regular.ttf')
FONT2 = os.path.join(ROOT, 'assets/fonts/BebasNeue-Regular.ttf')
FONT3 = os.path.join(ROOT, 'assets/fonts/SpecialElite-Regular.ttf')
PINK, ORANGE, CYAN, YELLOW = (255, 62, 165), (255, 159, 28), (64, 224, 255), (255, 214, 10)
Image.MAX_IMAGE_PIXELS = None

# ---------------------------------------------------------------- imágenes
REF = {  # recortes de la imagen 1 (collage oficial, 1600x900)
    'heli': (25, 25, 312, 388), 'boat': (806, 25, 1252, 357), 'gunman': (1265, 25, 1577, 468),
    'girl': (25, 400, 312, 875), 'car': (323, 540, 615, 875), 'gator': (680, 690, 950, 875),
    'rapper': (1012, 365, 1252, 875), 'bike': (1265, 480, 1577, 875), 'logo': (500, 270, 1040, 710),
}
_cache = {}


def src(name):
    if name in _cache: return _cache[name]
    if name in REF:
        im = Image.open(f'{HERE}/assets/ref/1.webp').convert('RGB').crop(REF[name])
    else:
        paths = {'couple': 'assets/ref/3.webp', 'gta5': 'assets/ref/5.webp', 'collage': 'assets/ref/1.webp',
                 'kid2013': 'assets/ai/kid2013.png', 'adult2026': 'assets/ai/adult2026.png', 'crib': 'assets/ai/crib.png',
                 'windows': 'assets/ai/windows.png'}
        p = paths.get(name) or f'assets/photos/{name}.jpg'
        im = Image.open(os.path.join(HERE, p)).convert('RGB')
        if name == 'kid2013':  # quitar el marco blanco de la foto
            w, h = im.size; im = im.crop((int(w * .035), int(h * .025), int(w * .965), int(h * .975)))
    # mejora: si es pequeña, escalar con Lanczos + enfoque para que aguante el zoom
    s = max(1.0, 1500 / im.width)
    if s > 1.0:
        im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
    a = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)
    _cache[name] = a
    return a


def has(name):
    return name in REF or name in ('couple', 'gta5', 'collage', 'kid2013', 'adult2026', 'crib', 'windows') or os.path.exists(f'{HERE}/assets/photos/{name}.jpg')


def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def eout(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def back(x): x = min(1, max(0, x)); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def cover(img, zoom, fx, fy, out=(W, H)):
    """encuadre que cubre `out` con zoom y centro normalizado (fx,fy)."""
    ow, oh = out; h, w = img.shape[:2]
    s = max(ow / w, oh / h) * zoom
    cx = np.clip(fx * w, ow / s / 2, w - ow / s / 2); cy = np.clip(fy * h, oh / s / 2, h - oh / s / 2)
    M = np.float32([[s, 0, ow / 2 - s * cx], [0, s, oh / 2 - s * cy]])
    return cv2.warpAffine(img, M, (ow, oh), flags=cv2.INTER_CUBIC if s > 1 else cv2.INTER_AREA, borderMode=cv2.BORDER_REFLECT)


_blur = {}


def blurred_bg(name):
    if name not in _blur:
        b = cover(src(name), 1.0, .5, .5, (W // 4, H // 4))
        b = cv2.GaussianBlur(b, (0, 0), 9)
        _blur[name] = cv2.resize((b * .42).astype(np.uint8), (W, H), interpolation=cv2.INTER_CUBIC)
    return _blur[name]


def card(frame, img, zoom, fx, fy, cw, ch, cy, rot=0.0, alpha=1.0):
    """tarjeta con esquinas redondeadas y sombra sobre `frame`."""
    tile = cover(img, zoom, fx, fy, (cw, ch))
    mask = np.zeros((ch, cw), np.uint8); r = 26
    cv2.rectangle(mask, (r, 0), (cw - r, ch), 255, -1); cv2.rectangle(mask, (0, r), (cw, ch - r), 255, -1)
    for x, y in ((r, r), (cw - r, r), (r, ch - r), (cw - r, ch - r)): cv2.circle(mask, (x, y), r, 255, -1, cv2.LINE_AA)
    cv2.rectangle(tile, (0, 0), (cw - 1, ch - 1), (255, 255, 255), 4)
    tile = np.where(mask[..., None] > 0, tile, 0)
    # colocar con rotación
    M = cv2.getRotationMatrix2D((cw / 2, ch / 2), rot, 1.0); M[0, 2] += W / 2 - cw / 2; M[1, 2] += cy - ch / 2
    t = cv2.warpAffine(tile, M, (W, H), flags=cv2.INTER_LINEAR)
    m = cv2.warpAffine(mask, M, (W, H), flags=cv2.INTER_LINEAR).astype(np.float32) / 255 * alpha
    sh = cv2.GaussianBlur(cv2.warpAffine(mask, M, (W, H)), (0, 0), 22).astype(np.float32) / 255 * .7 * alpha
    sh = np.roll(sh, 18, axis=0)
    f = frame.astype(np.float32) * (1 - sh[..., None])
    f = f * (1 - m[..., None]) + t.astype(np.float32) * m[..., None]
    return f.astype(np.uint8)


# ---------------------------------------------------------------- texto
_fonts = {}


def font(path, size):
    k = (path, size)
    if k not in _fonts: _fonts[k] = ImageFont.truetype(path, size)
    return _fonts[k]


def text_layer(lines, size, y, colors=None, fpath=FONT, stroke=10, scale=1.0, alpha=1.0, glow=None, track=0):
    """lines: lista de str; colors: lista de colores por línea. devuelve RGBA (W,H) como np.float32."""
    size = max(8, int(size * scale))
    f = font(fpath, size)
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    yy = y
    for i, ln in enumerate(lines):
        col = (colors[i] if colors else (255, 255, 255))
        bb = d.textbbox((0, 0), ln, font=f, stroke_width=stroke)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        x = (W - tw) / 2 - bb[0]
        d.text((x + 6, yy - bb[1] + 8), ln, font=f, fill=(0, 0, 0, 150), stroke_width=stroke, stroke_fill=(0, 0, 0, 150))
        d.text((x, yy - bb[1]), ln, font=f, fill=col, stroke_width=stroke, stroke_fill=(0, 0, 0))
        yy += th + int(size * .12)
    a = np.asarray(L).astype(np.float32)
    if glow:
        g = cv2.GaussianBlur(a[..., 3], (0, 0), 28) / 255 * .55
        a_g = np.zeros_like(a); a_g[..., 0], a_g[..., 1], a_g[..., 2] = glow; a_g[..., 3] = g * 255
        return [a_g, a], alpha
    return [a], alpha


def comp(frame, layers):
    lays, alpha = layers
    f = frame.astype(np.float32)
    for a in lays:
        m = a[..., 3:4] / 255 * alpha
        f = f * (1 - m) + a[..., 2::-1][..., :3] * m  # RGBA -> BGR
    return f.astype(np.uint8)


def pill(frame, text, y, bg=PINK, fg=(255, 255, 255), size=54, alpha=1.0, fpath=FONT):
    f = font(fpath, size); L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    bb = d.textbbox((0, 0), text, font=f); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    px, py = 34, 20; x0 = (W - tw) / 2 - px
    d.rounded_rectangle((x0, y, x0 + tw + 2 * px, y + th + 2 * py), radius=(th + 2 * py) // 2, fill=bg + (235,))
    d.text((x0 + px - bb[0], y + py - bb[1]), text, font=f, fill=fg)
    return comp(frame, ([np.asarray(L).astype(np.float32)], alpha))


# ---------------------------------------------------------------- plano de montaje
# cada toma: (inicio, fin, imagen, dict de opciones)
#   z: (zoom_ini, zoom_fin)  f: (fx,fy) ini  f2: (fx,fy) fin  punch: golpe de zoom al entrar  card: tarjeta
def build_shots():
    S = []
    def add(t0, t1, img, **o):
        if not has(img): img = o.pop('alt', 'couple')
        if not has(img): img = 'windows'
        S.append((t0, t1, img, o))
    add(0.00, 1.30, 'couple', z=(1.35, 1.12), f=(.52, .40), f2=(.52, .36), flash=False)
    add(1.30, 2.24, 'windows', z=(1.05, 1.22), f=(.5, .45), punch=True)
    add(2.24, 3.34, 'adult2026', z=(1.08, 1.30), f=(.35, .30), f2=(.30, .26), punch=True)
    add(3.34, 4.40, 'crowd', z=(1.25, 1.12), f=(.5, .5), f2=(.55, .5), grade='dark', alt='miami_night')
    add(4.40, 5.62, 'timessq', z=(1.05, 1.25), f=(.5, .45), grade='dark', alt='windows')
    add(5.62, 7.94, 'logo', z=(1.6, 1.0), f=(.5, .5), card=True, punch=True, bg='couple')
    add(7.94, 9.20, 'kid2013', z=(1.10, 1.25), f=(.65, .55), grade='sepia')
    add(9.20, 10.86, 'gta5', z=(1.05, 1.30), f=(.5, .45), f2=(.55, .40), punch=True)
    add(10.86, 12.12, 'ps3', z=(1.0, 1.1), f=(.5, .5), card=True, cardh=900, bg='gta5', alt='gta5')
    add(12.12, 13.36, 'gta5', z=(2.0, 2.3), f=(.50, .25), f2=(.52, .22), grade='sepia')
    add(13.36, 14.70, 'gta5', z=(1.0, 1.0), f=(.5, .5), grade='black')
    add(14.70, 17.16, 'kid2013', z=(1.0, 1.18), f=(.62, .55), f2=(.66, .50), grade='sepia', punch=True)
    add(17.16, 18.68, 'adult2026', z=(1.0, 1.15), f=(.40, .45), f2=(.35, .35), punch=True)
    add(18.68, 21.34, 'crib', z=(1.18, 1.0), f=(.35, .70), f2=(.45, .60))
    add(21.34, 22.36, 'gta5', z=(1.3, 1.5), f=(.85, .45), punch=True)
    add(22.36, 24.70, 'ebgames', z=(1.0, 1.2), f=(.5, .5), grade='dark', alt='crowd')
    add(24.70, 27.42, 'gta5', z=(1.0, 1.06), f=(.5, .5), card=True, cardh=1000, cy=1000, bg='gta5', rot=(-3, 0))
    add(27.42, 29.08, 'couple', z=(1.0, 1.2), f=(.5, .45), punch=True)
    add(29.08, 31.74, 'ad_toronto', z=(1.05, 1.25), f=(.5, .5), f2=(.6, .5), punch=True, alt='collage')
    add(31.74, 33.48, 'collage', z=(1.0, 1.08), f=(.5, .5), card=True, cardh=700, cy=1020, bg='couple', punch=True)
    add(33.48, 34.88, 'couple', z=(1.5, 1.8), f=(.48, .55), f2=(.55, .65))
    add(34.88, 38.30, 'trailer_date', z=(1.0, 1.12), f=(.5, .5), card=True, cardh=900, bg='couple', punch=True)
    add(38.30, 40.90, 'couple', z=(1.2, 1.35), f=(.5, .45), grade='dark')
    add(40.90, 42.50, 'crowd', z=(1.05, 1.25), f=(.5, .5), punch=True, alt='windows')
    # montaje rápido: "cuanto más esperaban, más lo querían"
    seq = ['boat', 'gunman', 'car', 'rapper', 'bike', 'girl', 'gator', 'heli']
    t = 42.50; step = (45.66 - 42.50) / len(seq)
    for i, n in enumerate(seq):
        add(t, t + step, n, z=(1.0, 1.12), f=(.5, .45), card=True, cardh=1180, cardw=860, bg=n, punch=True, rot=((-4, 4)[i % 2], 0))
        t += step
    add(45.66, 48.54, 'miami_night', z=(1.25, 1.05), f=(.5, .5), grade='dark', alt='windows')
    add(48.54, 49.78, 'windows', z=(1.0, 1.2), f=(.5, .5), punch=True)
    add(49.78, 51.60, 'ps5', z=(1.05, 1.3), f=(.5, .45), grade='dark', alt='adult2026', punch=True)
    add(51.60, 53.36, 'adult2026', z=(1.3, 1.5), f=(.32, .30), punch=True)
    add(53.36, DUR, 'couple', z=(1.0, 1.15), f=(.5, .45), punch=True)
    return S


# textos grandes: (t0, t1, función de dibujo)
def num(v, sep='.'):
    return f'{int(v):,}'.replace(',', sep)


def overlays(frame, t):
    def win(a, b): return a <= t < b
    def k(a, d=.25): return eout((t - a) / d)
    if win(0.0, 3.34):  # contador 16.000.000
        p = eout((t - 0.0) / 1.6); v = 16_000_000 * p
        s = back((t + 0.05) / .35)
        frame = comp(frame, text_layer([num(v)], 150, 470, [YELLOW], scale=.6 + .4 * s, glow=PINK))
        if t > 2.2: frame = pill(frame, 'NO VAN A DORMIR', 700, PINK, size=58, alpha=k(2.2, .15))
    if win(5.62, 7.94) and t > 6.1:
        frame = pill(frame, 'ES POR UN VIDEOJUEGO', 1520 - 340, ORANGE, (0, 0, 0), 56, alpha=k(6.1, .15))
    if win(7.94, 9.20):
        frame = comp(frame, text_layer(['SEPT', '2013'], 210, 420, [(255, 255, 255), ORANGE], scale=.7 + .3 * back((t - 7.94) / .3), glow=ORANGE))
    if win(9.20, 10.86) and t > 9.8:
        frame = pill(frame, 'SALE GTA V', 230, (20, 20, 20), YELLOW, 64, alpha=k(9.8, .12))
    if win(10.86, 13.36):  # años pasando 2013 -> 2026
        p = ease((t - 11.0) / 2.1); y = 2013 + int(round(13 * p))
        frame = comp(frame, text_layer([str(y)], 230, 860, [YELLOW if y == 2026 else (255, 255, 255)], glow=PINK if y == 2026 else None))
        if t > 12.3: frame = pill(frame, 'NI UN GTA NUEVO', 1150, PINK, size=56, alpha=k(12.3, .12))
    if win(13.36, 14.70):
        s = back((t - 13.36) / .3)
        frame = comp(frame, text_layer(['13', 'AÑOS'], 330, 560, [YELLOW, (255, 255, 255)], scale=.5 + .5 * s, glow=PINK))
    if win(14.70, 17.16): frame = pill(frame, '2013', 300, (20, 20, 20), ORANGE, 70, alpha=k(14.8, .15))
    if win(17.16, 18.68): frame = pill(frame, 'HOY · 2026', 300, PINK, size=70, alpha=k(17.2, .15))
    if win(22.2, 24.70):
        p = eout((t - 22.2) / 1.0); v = 11_200_000 * p
        frame = comp(frame, text_layer([num(v)], 140, 420, [(255, 255, 255)], scale=.8 + .2 * back((t - 22.2) / .3)))
        if t > 23.7: frame = pill(frame, 'EN UN SOLO DÍA', 620, ORANGE, (0, 0, 0), 56, alpha=k(23.7, .12))
    if win(24.70, 27.42):
        frame = comp(frame, text_layer(['RÉCORD'], 190, 250, [YELLOW], scale=.7 + .3 * back((t - 24.85) / .3), glow=ORANGE))
    if win(27.42, 29.08):
        frame = comp(frame, text_layer(['16 M', '>', '11,2 M'], 170, 300, [YELLOW, (255, 255, 255), (200, 200, 200)], scale=.7 + .3 * back((t - 28.2) / .3), glow=PINK) if t > 28.2 else ([np.zeros((H, W, 4), np.float32)], 0))
    if win(29.08, 31.74) and t > 30.1:
        frame = pill(frame, 'Y TODAVÍA NO HA SALIDO', 330, PINK, size=60, alpha=k(30.1, .12))
    if win(31.74, 34.88):
        p = eout((t - 32.6) / 1.6); v = 1_500_000_000 * p
        frame = comp(frame, text_layer(['$' + num(v)], 118, 330, [(120, 255, 140)], scale=.8 + .2 * back((t - 32.6) / .3), glow=(0, 160, 60)))
        frame = pill(frame, 'SOLO EN RESERVAS', 560, (20, 20, 20), (255, 255, 255), 52, alpha=k(32.0, .15))
    if win(34.88, 38.30):
        frame = play_badge(frame, t)
        if t > 37.1: frame = comp(frame, text_layer(['24 HORAS'], 150, 1270 - 170, [YELLOW], scale=.7 + .3 * back((t - 37.1) / .3), glow=PINK))
    if win(38.30, 40.90): frame = delays(frame, t)
    if win(40.90, 42.50) and t > 41.4:
        frame = comp(frame, text_layer(['NADIE SE HA IDO'], 120, 420, [(255, 255, 255)], scale=.7 + .3 * back((t - 41.4) / .3), glow=PINK))
    if win(45.66, 48.54): frame = clock(frame, t)
    if win(48.54, 51.60) and t > 49.2:
        frame = comp(frame, text_layer(['MILLONES', 'DE CONSOLAS'], 130, 330, [YELLOW, (255, 255, 255)], scale=.7 + .3 * back((t - 49.2) / .3), glow=PINK))
    if win(51.60, 53.36) and t > 52.4:
        frame = pill(frame, 'NADIE VA A APAGARLAS', 330, PINK, size=60, alpha=k(52.4, .12))
    if t >= 53.36: frame = cta(frame, t)
    return frame


def play_badge(frame, t):
    s = back((t - 35.3) / .35)
    if t < 35.3: return frame
    w, h = int(300 * s), int(210 * s)
    if w < 4: return frame
    L = np.zeros((H, W, 4), np.float32); cx, cy = W // 2, 300
    o = np.zeros((H, W, 3), np.uint8); m = np.zeros((H, W), np.uint8)
    cv2.rectangle(m, (cx - w // 2 + 40, cy - h // 2), (cx + w // 2 - 40, cy + h // 2), 255, -1)
    cv2.rectangle(m, (cx - w // 2, cy - h // 2 + 40), (cx + w // 2, cy + h // 2 - 40), 255, -1)
    for x, y in ((cx - w // 2 + 40, cy - h // 2 + 40), (cx + w // 2 - 40, cy - h // 2 + 40), (cx - w // 2 + 40, cy + h // 2 - 40), (cx + w // 2 - 40, cy + h // 2 - 40)):
        cv2.circle(m, (x, y), 40, 255, -1, cv2.LINE_AA)
    o[:] = (40, 30, 235)
    tri = np.array([[cx - int(40 * s), cy - int(52 * s)], [cx - int(40 * s), cy + int(52 * s)], [cx + int(62 * s), cy]], np.int32)
    cv2.fillPoly(o, [tri], (255, 255, 255), cv2.LINE_AA)
    a = cv2.GaussianBlur(m, (3, 3), 0).astype(np.float32)[..., None] / 255
    return (frame * (1 - a) + o * a).astype(np.uint8)


def delays(frame, t):
    items = [('2025', 38.5), ('MAYO 2026', 39.3), ('19 NOV 2026', 40.1)]
    y = 360
    for i, (s, t0) in enumerate(items):
        if t < t0: break
        last = i == len(items) - 1
        frame = comp(frame, text_layer([s], 130, y, [YELLOW if last else (255, 255, 255)], scale=.7 + .3 * back((t - t0) / .25), glow=PINK if last else None))
        if not last and t > t0 + .45:  # tachado
            p = eout((t - t0 - .45) / .2); f = font(FONT, 130)
            tw = ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), s, font=f)[2]
            x0 = (W - tw) // 2 - 20; x1 = int(x0 + (tw + 40) * p)
            cv2.line(frame, (x0, y + 90), (x1, y + 70), (40, 30, 235), 16, cv2.LINE_AA)
        y += 210
    return frame


def clock(frame, t):
    # 23:59:57 -> 00:00:00 al decir "espera"
    secs = 3 if t < 46.4 else 2 if t < 47.0 else 1 if t < 47.98 else 0
    s = f'00:00:00' if secs == 0 else f'23:59:5{10 - secs - 3 + 0}' if False else ('00:00:00' if secs == 0 else f'23:59:{60 - secs:02d}')
    col = YELLOW if secs == 0 else (255, 255, 255)
    sc = 1.0 + (.12 * back((t - 47.98) / .25) if secs == 0 else 0)
    frame = comp(frame, text_layer([s], 170, 420, [col], fpath=FONT, scale=sc, glow=PINK if secs == 0 else None))
    if secs == 0: frame = pill(frame, 'SE ACABA LA ESPERA', 680, PINK, size=58, alpha=eout((t - 47.98) / .15))
    return frame


def cta(frame, t):
    a = eout((t - 53.36) / .3)
    frame = (frame.astype(np.float32) * (1 - .35 * a)).astype(np.uint8)
    frame = comp(frame, text_layer(['SÍGUEME'], 190, 300, [(255, 255, 255)], scale=.6 + .4 * back((t - 53.36) / .35), glow=PINK))
    if t > 54.1: frame = pill(frame, 'PARTE 2: LA HISTORIA DE GTA VI', 560, PINK, size=54, alpha=eout((t - 54.1) / .2))
    return frame


# ---------------------------------------------------------------- subtítulos palabra a palabra
def caption_chunks(words):
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 3 or w['word'][-1] in '.,…:;?!':
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    out = []
    for i, c in enumerate(chunks):
        t0 = c[0]['start']; t1 = chunks[i + 1][0]['start'] if i + 1 < len(chunks) else DUR
        t1 = min(t1, c[-1]['end'] + .6)
        out.append((t0, t1, c))
    return out


def clean(w): return w.strip('.,…:;').upper()


def draw_caption(frame, t, chunks):
    for t0, t1, c in chunks:
        if not (t0 <= t < t1): continue
        size = 92; f = font(FONT, size); stroke = 9
        L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
        toks = [clean(w['word']) for w in c]
        widths = [d.textbbox((0, 0), s, font=f, stroke_width=stroke)[2] for s in toks]
        gap = 24; total = sum(widths) + gap * (len(toks) - 1)
        sc = .86 + .14 * back((t - t0) / .12)
        if total * sc > W - 80: sc = (W - 80) / total
        f = font(FONT, int(size * sc)); widths = [d.textbbox((0, 0), s, font=f, stroke_width=stroke)[2] for s in toks]
        total = sum(widths) + gap * (len(toks) - 1); x = (W - total) / 2; y = 1330
        for w, s, ww in zip(c, toks, widths):
            active = w['start'] <= t
            col = YELLOW if (w['start'] <= t < w['end'] + .05) else (255, 255, 255) if active else (255, 255, 255, 140)
            d.text((x + 5, y + 7), s, font=f, fill=(0, 0, 0, 160), stroke_width=stroke, stroke_fill=(0, 0, 0, 160))
            d.text((x, y), s, font=f, fill=col, stroke_width=stroke, stroke_fill=(0, 0, 0))
            x += ww + gap
        return comp(frame, ([np.asarray(L).astype(np.float32)], 1.0))
    return frame


# ---------------------------------------------------------------- color y acabado
def grade(img, mode):
    f = img.astype(np.float32)
    if mode == 'sepia':  # recuerdo: cálido y algo desaturado
        g = f.mean(axis=2, keepdims=True); f = f * .55 + g * .45; f = f * np.array([.86, .98, 1.12])
    elif mode == 'dark':
        f = f * .78
    elif mode == 'black':
        f = f * .12
    return np.clip(f, 0, 255).astype(np.uint8)


def vibe(img):
    """grade global tipo Vice City: sombras moradas, altas cálidas, contraste."""
    f = img.astype(np.float32) / 255
    f = np.clip((f - .5) * 1.08 + .5, 0, 1)
    lum = f.mean(axis=2, keepdims=True)
    f = f + (1 - lum) * np.array([.035, -.01, .03]) * .9 + lum * np.array([-.02, .005, .03])
    return np.clip(f * 255, 0, 255)


_vig = None
_grain = None


def finish(frame, fi):
    global _vig, _grain
    if _vig is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W * .75)) ** 2 + ((yy - H / 2) / (H * .72)) ** 2)
        _vig = (1 - .42 * np.clip(r - .45, 0, 1) ** 1.4)[..., None]
        rng = np.random.default_rng(3); _grain = [rng.normal(0, 5.5, (H, W, 1)).astype(np.float32) for _ in range(6)]
    f = vibe(frame) * _vig + _grain[fi % 6]
    return np.clip(f, 0, 255).astype(np.uint8)


def chroma(frame, amt):
    if amt < 1: return frame
    b, g, r = cv2.split(frame); a = int(amt)
    return cv2.merge([np.roll(b, -a, axis=1), g, np.roll(r, a, axis=1)])


# ---------------------------------------------------------------- render
def render_frame(t, fi, shots, chunks):
    cur = None
    for s in shots:
        if s[0] <= t < s[1]: cur = s; break
    if cur is None: cur = shots[-1]
    t0, t1, name, o = cur
    p = (t - t0) / max(.001, t1 - t0)
    z0, z1 = o.get('z', (1.0, 1.1)); zoom = z0 + (z1 - z0) * ease(p)
    fx0, fy0 = o.get('f', (.5, .5)); fx1, fy1 = o.get('f2', (fx0, fy0))
    fx, fy = fx0 + (fx1 - fx0) * ease(p), fy0 + (fy1 - fy0) * ease(p)
    dt = t - t0
    if o.get('punch'): zoom *= 1 + .14 * (1 - eout(dt / .28))
    img = src(name)
    if o.get('card'):
        frame = blurred_bg(o.get('bg', name)).copy()
        ih, iw = img.shape[:2]
        cw = o.get('cardw', 980); ch = o.get('cardh', int(cw * ih / iw))
        r0, r1 = o.get('rot', (0, 0)); rot = r0 + (r1 - r0) * eout(dt / .35)
        sc = 1 + .1 * (1 - eout(dt / .3)) if o.get('punch') else 1
        frame = card(frame, img, zoom, fx, fy, int(cw * sc), int(ch * sc), o.get('cy', 960 if ch > 900 else 900), rot)
    else:
        frame = cover(img, zoom, fx, fy)
    if o.get('grade'): frame = grade(frame, o['grade'])
    # transiciones: destello + aberración cromática al entrar
    if t0 > 0 and dt < .16 and o.get('flash', True):
        frame = chroma(frame, 14 * (1 - dt / .16))
        fl = .45 * (1 - dt / .12) if dt < .12 else 0
        if fl > 0: frame = np.clip(frame.astype(np.float32) * (1 - fl) + 255 * fl, 0, 255).astype(np.uint8)
    frame = finish(frame, fi)
    frame = overlays(frame, t)
    frame = draw_caption(frame, t, chunks)
    # marca discreta del canal
    frame = comp(frame, text_layer(['ARCHIVO OSCURO'], 34, 90, [(255, 255, 255)], fpath=FONT3, stroke=0, alpha=.55))
    # fundido final
    if t > DUR - .35: frame = (frame * max(0, (DUR - t) / .35)).astype(np.uint8)
    return frame


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--from', dest='a', type=float, default=0); ap.add_argument('--to', dest='b', type=float, default=DUR)
    ap.add_argument('--stills'); ap.add_argument('--out', default=f'{HERE}/build/reel_silent.mp4'); ap.add_argument('--part', default='')
    a = ap.parse_args()
    os.makedirs(f'{HERE}/build', exist_ok=True)
    shots = build_shots(); words = json.load(open(f'{HERE}/timeline/words.json'))['words']; chunks = caption_chunks(words)
    if a.stills:
        os.makedirs(f'{HERE}/build/stills', exist_ok=True)
        for s in a.stills.split(','):
            t = float(s); fr = render_frame(t, int(t * FPS), shots, chunks)
            cv2.imwrite(f'{HERE}/build/stills/t{t:05.2f}.jpg', fr, [cv2.IMWRITE_JPEG_QUALITY, 90])
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
