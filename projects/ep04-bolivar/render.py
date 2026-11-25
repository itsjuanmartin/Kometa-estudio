"""EP04 Bolívar — montaje 16:9 a partir de imágenes fijas (Ken Burns + sellos del canal).

  python3 render.py                      # vídeo mudo completo -> build/video_silent.mp4 + story/shots.json
  python3 render.py --stills 12,95,300   # fotogramas sueltos para revisar -> build/stills/
  python3 render.py --from 0 --to 20     # trozo de prueba -> build/test.mp4

Después: python3 audio/mix.py --project projects/ep04-bolivar   (voz + música + efectos)
"""
import argparse, json, math, os, re, subprocess, sys, unicodedata
from multiprocessing import Pool
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import plan as PLAN

W, H, FPS = 1920, 1080, 24
XF = 0.25                                   # fundido entre planos (s)
FB = f'{ROOT}/assets/fonts/Fredoka-Bold.ttf'; FN = f'{ROOT}/assets/fonts/Nunito-Black.ttf'; FA = f'{ROOT}/assets/fonts/Anton-Regular.ttf'
OL, YEL, CREAM, RED, WHITE = (43, 33, 28), (242, 233, 74), (255, 248, 232), (200, 40, 32), (255, 255, 255)
CFG = json.load(open(f'{HERE}/config.json')); DUR = CFG['duration']


# ------------------------------------------------------------------ anclas: frase del guion -> segundo
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ ]+', ' ', s).split()


WORDS = json.load(open(f'{HERE}/timeline/words.json'))['words']
WN = [(norm(w['word']) or [''])[0] for w in WORDS]


def find(phrase, after=0.0):
    q = norm(phrase)
    for i in range(len(WN) - len(q) + 1):
        if WORDS[i]['start'] + 1e-3 < after: continue
        if WN[i:i + len(q)] == q: return WORDS[i]['start']
    raise SystemExit(f'ancla no encontrada: «{phrase}» (después de {after:.2f}s)')


def build():
    shots, t = [], 0.0
    for ph, img, o in PLAN.SHOTS:
        s = 0.0 if not shots else max(t, find(ph, t) - 0.08); shots.append(dict(start=round(s, 3), img=img, o=o, anchor=ph)); t = s + 0.05
    for i, s in enumerate(shots): s['end'] = shots[i + 1]['start'] if i + 1 < len(shots) else DUR
    ovs = []
    for ph, kind, text, d in PLAN.OVERLAYS:
        s = find(ph) - 0.05
        if d == 0: d = next(x['end'] for x in shots if x['start'] <= s + 0.2 < x['end']) - s
        ovs.append(dict(start=s, end=s + d, kind=kind, text=text))
    return shots, ovs


# ------------------------------------------------------------------ imágenes
_cache = {}


def grade(a, mode):
    f = a.astype(np.float32)
    if mode == 'night': g = f.mean(2, keepdims=True); f = (f * .55 + g * .45) * np.array([1.15, .97, .82]) * .7
    elif mode == 'sepia': g = f.mean(2, keepdims=True); f = g * np.array([.78, .95, 1.12]) * .95 + f * .15
    elif mode == 'gray': g = f.mean(2, keepdims=True); f = g * .85 + f * .15
    elif mode == 'red': g = f.mean(2, keepdims=True); f = (f * .4 + g * .6) * np.array([.6, .65, 1.35])
    elif mode == 'cold': g = f.mean(2, keepdims=True); f = (f * .7 + g * .3) * np.array([1.12, 1.0, .9])
    return np.clip(f, 0, 255).astype(np.uint8)


def src(name, mode=None):
    k = (name, mode)
    if k not in _cache:
        im = Image.open(f'{HERE}/assets/img/{name}.jpg').convert('RGB')
        im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
        a = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)
        _cache[k] = grade(a, mode) if mode else a
    return _cache[k]


def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)


def kb(shot, t):
    """encuadre Ken Burns del plano en el instante t (segundos globales)."""
    o = shot['o']; img = src(shot['img'], o.get('grade')); h, w = img.shape[:2]
    p = ease((t - shot['start']) / max(.01, shot['end'] - shot['start'] + XF))
    z0, z1 = o.get('z', (1.0, 1.12)); z = z0 + (z1 - z0) * p
    f0 = o.get('f', (.5, .5)); f1 = o.get('f2', f0); fx = f0[0] + (f1[0] - f0[0]) * p; fy = f0[1] + (f1[1] - f0[1]) * p
    if o.get('fit') == 'contain':
        bg = cv2.GaussianBlur(cv2.resize(img, (W, H)), (0, 0), 25); bg = (bg * .55).astype(np.uint8)
        sc = min(W / w, H / h) * .94 * z; M = np.float32([[sc, 0, W / 2 - w * sc / 2], [0, sc, H / 2 - h * sc / 2]])
        return cv2.warpAffine(img, M, (W, H), dst=bg, borderMode=cv2.BORDER_TRANSPARENT)
    sc = max(W / w, H / h) * z
    tx = min(0, max(W - w * sc, W / 2 - fx * w * sc)); ty = min(0, max(H - h * sc, H / 2 - fy * h * sc))
    dt = t - shot['start']
    if o.get('shake') and dt < .45:
        a = (1 - dt / .45) * 14; tx = min(0, max(W - w * sc, tx + a * math.sin(dt * 90))); ty = min(0, max(H - h * sc, ty + a * math.cos(dt * 70)))
    M = np.float32([[sc, 0, tx], [0, sc, ty]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR)


# ------------------------------------------------------------------ rótulos (capas RGBA pre-dibujadas)
def font(p, s): return ImageFont.truetype(p, s)


def layer(): return Image.new('RGBA', (W, H), (0, 0, 0, 0))


def rot(L, ang, cx, cy):
    return L.rotate(ang, resample=Image.BICUBIC, center=(cx, cy))


def draw_overlay(kind, text):
    """devuelve (capa RGBA, centro para la animación)."""
    L = layer(); d = ImageDraw.Draw(L)
    if kind == 'stamp':      # sello de fecha y lugar (dentro de la zona 4:3 para que salga en los reels)
        f = font(FB, 44); bb = d.textbbox((0, 0), text, font=f); x, y = 300, 70
        d.rounded_rectangle((x, y, x + bb[2] + 56, y + bb[3] + 34), 16, fill=CREAM + (245,), outline=OL + (255,), width=6)
        d.text((x + 28, y + 14), text, font=f, fill=RED + (255,))
        return rot(L, 2.5, x, y), (x + bb[2] / 2, y + 40)
    if kind == 'real':       # tampón rojo «REAL»
        cx, cy = 1380, 760; S = layer(); sd = ImageDraw.Draw(S)
        sd.rounded_rectangle((cx - 250, cy - 110, cx + 250, cy + 110), 18, outline=RED + (235,), width=12)
        sd.rounded_rectangle((cx - 232, cy - 92, cx + 232, cy + 92), 12, outline=RED + (235,), width=4)
        f = font(FA, 120); bb = sd.textbbox((0, 0), 'REAL', font=f); sd.text((cx - bb[2] / 2, cy - 95), 'REAL', font=f, fill=RED + (240,))
        f2 = font(FB, 28); t2 = 'ESTO PASÓ DE VERDAD'; bb = sd.textbbox((0, 0), t2, font=f2); sd.text((cx - bb[2] / 2, cy + 40), t2, font=f2, fill=RED + (240,))
        return rot(S, -10, cx, cy), (cx, cy)
    if kind == 'intento':    # tarjeta INTENTO n/5 con cinco marcas
        n = int(text); d.rectangle((0, 350, W, 770), fill=(20, 14, 12, 190))
        f = font(FB, 64); t1 = 'INTENTO'; bb = d.textbbox((0, 0), t1, font=f); d.text((W / 2 - bb[2] / 2, 372), t1, font=f, fill=YEL + (255,))
        f = font(FA, 190); t2 = f'{n}/5'; bb = d.textbbox((0, 0), t2, font=f); d.text((W / 2 - bb[2] / 2, 435), t2, font=f, fill=WHITE + (255,), stroke_width=4, stroke_fill=OL + (255,))
        for k in range(5):
            x = W / 2 - 160 + k * 80; on = k < n
            d.ellipse((x - 18, 712, x + 18, 748), fill=(RED if k == n - 1 else YEL if on else (90, 80, 70)) + (255,), outline=OL + (255,), width=4)
        return L, (W / 2, 540)
    if kind == 'title':      # título del vídeo en la caja amarilla del canal
        lines = text.split('|'); fs = [font(FB, 70), font(FB, 92), font(FB, 92)]
        ws = [d.textbbox((0, 0), l, font=fs[i])[2] for i, l in enumerate(lines)]; hh = [d.textbbox((0, 0), l, font=fs[i])[3] for i, l in enumerate(lines)]
        tot = sum(hh) + 20 * (len(lines) - 1); y = H / 2 - tot / 2; bw = max(ws)
        d.rounded_rectangle((W / 2 - bw / 2 - 50, y - 40, W / 2 + bw / 2 + 50, y + tot + 50), 40, fill=YEL + (250,), outline=OL + (255,), width=10)
        for i, l in enumerate(lines): d.text((W / 2 - ws[i] / 2, y), l, font=fs[i], fill=OL + (255,)); y += hh[i] + 20
        return L, (W / 2, H / 2)
    if kind == 'regla':      # rótulo inferior con la regla del guardaespaldas
        tag, body = text.split('|'); f1 = font(FB, 40); f2 = font(FN, 50)
        b1 = d.textbbox((0, 0), tag, font=f1); b2 = d.textbbox((0, 0), body, font=f2)
        wtot = b1[2] + b2[2] + 120; x = W / 2 - wtot / 2; y = 900
        d.rounded_rectangle((x, y, x + wtot, y + 96), 48, fill=(25, 18, 15, 225), outline=YEL + (255,), width=5)
        d.rounded_rectangle((x + 10, y + 10, x + b1[2] + 60, y + 86), 38, fill=YEL + (255,))
        d.text((x + 35, y + 22), tag, font=f1, fill=OL + (255,)); d.text((x + b1[2] + 85, y + 16), body, font=f2, fill=WHITE + (255,))
        return L, (W / 2, y + 48)
    if kind == 'subs':       # botón de suscripción + campana
        cx, y = W / 2, 860; f = font(FB, 64); t = 'SUSCRIBIRSE'; bb = d.textbbox((0, 0), t, font=f)
        bw = bb[2] + 110; x = cx - bw / 2 - 60
        d.rounded_rectangle((x, y, x + bw, y + 118), 59, fill=(224, 40, 36, 255), outline=OL + (255,), width=7)
        d.text((x + 55, y + 18), t, font=f, fill=WHITE + (255,))
        bx = x + bw + 30; d.ellipse((bx, y, bx + 118, y + 118), fill=CREAM + (255,), outline=OL + (255,), width=7)
        d.pieslice((bx + 30, y + 22, bx + 88, y + 90), 180, 360, fill=OL + (255,)); d.rectangle((bx + 30, y + 56, bx + 88, y + 82), fill=OL + (255,))
        d.rectangle((bx + 24, y + 80, bx + 94, y + 88), fill=OL + (255,)); d.ellipse((bx + 50, y + 88, bx + 68, y + 104), fill=OL + (255,))
        return L, (cx, y + 59)
    if kind == 'ask':        # pregunta para comentar: dos opciones
        a, b = text.split('|'); f = font(FB, 78); fh = font(FB, 44)
        h1 = 'ESCRÍBELO EN LOS COMENTARIOS'; bb = d.textbbox((0, 0), h1, font=fh)
        d.rounded_rectangle((W / 2 - bb[2] / 2 - 30, 690, W / 2 + bb[2] / 2 + 30, 760), 30, fill=(25, 18, 15, 215)); d.text((W / 2 - bb[2] / 2, 698), h1, font=fh, fill=YEL + (255,))
        for i, (txt, col) in enumerate([(a, (46, 110, 200)), (b, RED)]):
            bb = d.textbbox((0, 0), txt, font=f); bw = bb[2] + 90; cx = W / 2 + (-1 if i == 0 else 1) * 300
            d.rounded_rectangle((cx - bw / 2, 790, cx + bw / 2, 920), 60, fill=col + (250,), outline=OL + (255,), width=8)
            d.text((cx - bb[2] / 2, 808), txt, font=f, fill=WHITE + (255,))
        f = font(FA, 70); bb = d.textbbox((0, 0), 'o', font=f); d.text((W / 2 - bb[2] / 2, 810), 'o', font=f, fill=WHITE + (255,), stroke_width=5, stroke_fill=OL + (255,))
        return L, (W / 2, 850)
    raise ValueError(kind)


_ov = {}


def ov_layer(o):
    k = (o['kind'], o['text'])
    if k not in _ov:
        L, c = draw_overlay(o['kind'], o['text']); _ov[k] = (np.asarray(L).astype(np.float32), c)
    return _ov[k]


def comp(frame, o, t):
    a_, (cx, cy) = ov_layer(o); dt, rem = t - o['start'], o['end'] - t
    alpha = min(1, dt / .18, rem / .3)
    if alpha <= 0: return frame
    pop = {'real': (2.2, .16), 'stamp': (1.35, .2), 'intento': (1.25, .22), 'subs': (1.5, .25), 'ask': (1.3, .25), 'title': (1.2, .25)}.get(o['kind'])
    L = a_
    if o['kind'] == 'subs' and 1.1 < dt < 1.35: s = 0.92                       # «clic» en el botón
    elif pop and dt < pop[1]: s = pop[0] + (1 - pop[0]) * ease(dt / pop[1])
    else: s = 1.0
    if s != 1.0:
        M = np.float32([[s, 0, cx * (1 - s)], [0, s, cy * (1 - s)]]); L = cv2.warpAffine(a_, M, (W, H))
    al = L[..., 3:4] / 255.0 * alpha; rgb = L[..., 2::-1]
    return (frame * (1 - al) + rgb * al).astype(np.uint8)


# ------------------------------------------------------------------ fotograma
def frame_at(t, shots, ovs):
    i = max(k for k, s in enumerate(shots) if s['start'] <= t + 1e-6)
    s = shots[i]; fr = kb(s, t)
    if i > 0 and t - s['start'] < XF and not s['o'].get('flash'):
        prev = kb(shots[i - 1], t); a = ease((t - s['start']) / XF); fr = cv2.addWeighted(prev, 1 - a, fr, a, 0)
    if s['o'].get('flash') and t - s['start'] < .3:
        a = 1 - (t - s['start']) / .3; fr = cv2.addWeighted(fr, 1 - a * .85, np.full_like(fr, 255), a * .85, 0)
    if t < CFG['fadeIn']: fr = (fr * (t / CFG['fadeIn'])).astype(np.uint8)
    if DUR - t < CFG['fadeOut']: fr = (fr * max(0, (DUR - t) / CFG['fadeOut'])).astype(np.uint8)
    for o in ovs:
        if o['start'] <= t < o['end']: fr = comp(fr, o, t)
    return fr


def render_chunk(args):
    a, b, out = args; shots, ovs = build()
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    for n in range(a, b): p.stdin.write(frame_at(n / FPS, shots, ovs).tobytes())
    p.stdin.close(); p.wait(); return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--stills'); ap.add_argument('--from', dest='t0', type=float); ap.add_argument('--to', dest='t1', type=float)
    ap.add_argument('--jobs', type=int, default=os.cpu_count() or 4)
    a = ap.parse_args(); shots, ovs = build(); os.makedirs(f'{HERE}/build', exist_ok=True)
    if a.stills:
        os.makedirs(f'{HERE}/build/stills', exist_ok=True)
        for t in map(float, a.stills.split(',')): cv2.imwrite(f'{HERE}/build/stills/{t:07.2f}.jpg', frame_at(t, shots, ovs), [cv2.IMWRITE_JPEG_QUALITY, 85])
        return
    # plano de sonido para audio/mix.py
    os.makedirs(f'{HERE}/story', exist_ok=True)
    music = []
    for ph, mood, inten in PLAN.MUSIC:
        s = 0.0 if not music else find(ph)
        if music: music[-1]['end'] = s
        music.append(dict(start=s, end=DUR, mood=mood, intensity=inten))
    cues = [dict(t=round(find(ph), 3), name=n, gain=g) for ph, n, g in PLAN.SFX]
    json.dump(dict(duration=DUR, shots=[dict(start=s['start'], end=s['end'], img=s['img'], anchor=s['anchor']) for s in shots], music=music, sfx=cues,
                   overlays=ovs), open(f'{HERE}/story/shots.json', 'w'), ensure_ascii=False, indent=1)
    t0 = a.t0 or 0.0; t1 = a.t1 or DUR; n0, n1 = int(t0 * FPS), int(t1 * FPS)
    step = math.ceil((n1 - n0) / a.jobs); chunks = [(n0 + k * step, min(n1, n0 + (k + 1) * step), f'{HERE}/build/chunk{k}.mp4') for k in range(a.jobs) if n0 + k * step < n1]
    with Pool(len(chunks)) as pool: outs = pool.map(render_chunk, chunks)
    open(f'{HERE}/build/chunks.txt', 'w').write(''.join(f"file '{os.path.basename(o)}'\n" for o in outs))
    out = f'{HERE}/build/' + ('test.mp4' if a.t0 is not None or a.t1 is not None else 'video_silent.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/build/chunks.txt', '-c', 'copy', out], check=True)
    print('VIDEO:', out)


if __name__ == '__main__':
    main()
