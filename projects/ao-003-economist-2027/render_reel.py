"""AO-003 · Reel «Bingo del apocalipsis 2027» — montaje completo 1080x1920 a 30 fps.

  python3 render_reel.py [--from 0 --to 67.4] [--still 12.5]   (--still guarda un fotograma PNG para revisar)

Cámara virtual sobre la portada (zoom suave a cada elemento que se nombra), rótulos animados, subtítulos palabra a
palabra (timeline/words.json), efectos de sonido sintetizados y final animado «vídeo en YouTube / 1.000 seguidores».
"""
import argparse, json, math, os, subprocess, sys, wave
from multiprocessing import Pool
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
FONT = lambda n, s: ImageFont.truetype(os.path.join(ROOT, 'assets/fonts', n), s)
W, H, FPS, END = 1080, 1920, 30, 67.4
AX, AY = 540, 820                      # frame point the camera centre maps to
RED, CREAM, GOLD, INK = (214, 40, 36), (242, 234, 218), (255, 206, 40), (14, 12, 11)
S = 4                                   # source upscale factor

# ---------- easing ----------
def clamp(x, a=0., b=1.): return max(a, min(b, x))
def e_out(p): p = clamp(p); return 1 - (1 - p) ** 3
def e_io(p): p = clamp(p); return 4 * p ** 3 if p < .5 else 1 - (-2 * p + 2) ** 3 / 2
def e_back(p, k=1.7): p = clamp(p); return 1 + (k + 1) * (p - 1) ** 3 + k * (p - 1) ** 2
def appear(t, t0, d=.35): return e_back((t - t0) / d) if t >= t0 else 0.

# ---------- timeline ----------
WORDS = json.load(open(os.path.join(HERE, 'timeline/words.json')))['words']
def wt(word, after=0.):
    for x in WORDS:
        if x['start'] >= after and x['word'].lower().strip('¿?¡!.,:…') == word: return x['start']
    raise KeyError(word)

T = dict(hook=0., mir=wt('mirarías'), pues=wt('pues'), v27=wt('veintisiete'), salio=wt('salió'), asi=wt('así.') if False else wt('así', 5),
         esta=wt('esta'), arriba=wt('arriba'), abajo=wt('abajo'), tanques=wt('tanques'), cohete=wt('cohete'), cerebro=wt('cerebro'),
         bola=wt('una', 15), disim=wt('ni'), internet=wt('internet'), diez=wt('diez'), ense=wt('te', 19), otras=wt('otras', 20),
         bingo=wt('bingo'), uno=wt('uno'), vent=wt('ventilador'), dos=wt('dos', 28), vive=wt('vive'), tres=wt('tres'), dicen=wt('dicen'),
         taiwan2=wt('taiwán', 38), visto=wt('visto'), cuatro=wt('cuatro'), mundo=wt('el', 42), cinco=wt('y', 44), star=wt('star'),
         palom=wt('si', 48), otras5=wt('y', 50), pista=wt('te', 51), avion=wt('avión'), inet2=wt('internet', 53), guarda=wt('guarda'),
         dic=wt('diciembre'), cuantas=wt('cuántas'), siguenos=wt('y', 61), mil=wt('mil', 62), youtube=wt('youtube'))
SFX_HIT = T['youtube']                  # padlock hit lands on «YouTube»

# focus points on the ORIGINAL cover (498x615): (cx, cy, zoom = output px per cover px)
WIDE = (249, 318, 2.02); HEAD = (249, 92, 3.3)
P = dict(ball=(283, 512, 6.2), elites=(246, 168, 5.2), fire=(62, 378, 4.6), tanks=(240, 482, 4.8), rocket=(146, 292, 5.2),
         brain=(250, 378, 5.8), heat=(352, 516, 5.4), debt=(272, 300, 4.8), china=(72, 312, 4.8), pills=(196, 382, 5.4),
         film=(140, 514, 5.6), plane=(306, 232, 5.6))
KEYS = [  # (start, target, move duration)
    (0.0, (283, 512, 7.4), .01), (T['pues'], (249, 330, 2.6), 1.3), (T['asi'], WIDE, .25), (T['esta'], HEAD, .7),
    (T['arriba'], P['elites'], .6), (T['abajo'], P['fire'], .55), (T['tanques'], P['tanks'], .45), (T['cohete'], P['rocket'], .4),
    (T['cerebro'], P['brain'], .4), (T['bola'], P['ball'], .5), (T['disim'], (283, 512, 8.2), .5), (T['internet'], WIDE, .7),
    (T['uno'], P['heat'], .6), (T['dos'], P['debt'], .6), (T['tres'], P['china'], .6), (T['cuatro'], P['pills'], .6),
    (T['cinco'], P['film'], .6), (T['otras5'], WIDE, .6), (T['pista'], P['plane'], .8), (T['guarda'], WIDE, .7)]
LABELS = [(T['arriba'], T['abajo'], 'SEÑORES DE TRAJE'), (T['abajo'], T['tanques'], 'TODO ARDIENDO'), (T['tanques'], T['cohete'], 'TANQUES'),
          (T['cohete'], T['cerebro'], 'UN COHETE'), (T['cerebro'], T['bola'], 'CEREBRO GIGANTE'), (T['bola'], T['disim'], 'BOLA DE CRISTAL')]
CASILLAS = [  # (start, punchline, label)
    (T['uno'], T['vent'], 'EL AÑO MÁS CALUROSO'), (T['dos'], T['vive'], 'LA IA, ENDEUDADA'), (T['tres'], T['visto'], 'TAIWÁN'),
    (T['cuatro'], T['mundo'], 'OZEMPIC'), (T['cinco'], T['palom'], 'NUEVA PELÍCULA DE STAR WARS')]
SHAKES = [(T['asi'], 22), (T['bingo'], 14), (SFX_HIT, 26)] + [(c[1], 10) for c in CASILLAS]

def cam_at(t):
    cur = KEYS[0][1]; t_arr = KEYS[0][0]
    for i, (ts, tgt, d) in enumerate(KEYS):
        if t < ts: break
        prev = drifted(cur, t_arr, ts)
        p = e_io((t - ts) / d)
        z = math.exp(math.log(prev[2]) + (math.log(tgt[2]) - math.log(prev[2])) * p)
        state = (prev[0] + (tgt[0] - prev[0]) * p, prev[1] + (tgt[1] - prev[1]) * p, z)
        cur, t_arr = tgt, ts + d
        out = state
    return drifted(out, t_arr, t) if t >= t_arr else out

def drifted(c, t_arr, t):   # slow push-in while holding a shot
    return (c[0], c[1], c[2] * (1 + min(.06, .018 * max(0., t - t_arr))))

def shake_at(t):
    x = y = 0.
    for t0, a in SHAKES:
        if 0 <= t - t0 < .35:
            k = a * (1 - (t - t0) / .35); x += k * math.sin(t * 91); y += k * math.cos(t * 77)
    return x, y

# ---------- assets (built once per process) ----------
A = {}
def assets():
    if A: return A
    cov = Image.open(os.path.join(HERE, 'assets/portada_completa.jpg')).convert('RGB')
    big = cov.resize((cov.width * S, cov.height * S), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 90, 2))
    A['src'] = big.convert('RGBA')
    bg = cov.resize((W, int(W * cov.height / cov.width))).resize((int(W * 2.2), int(H * 1.25)))
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H)).filter(ImageFilter.GaussianBlur(38))
    A['bg'] = Image.blend(bg, Image.new('RGB', (W, H), INK), .72).convert('RGBA')
    yy, xx = np.mgrid[0:H, 0:W]; r = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2)
    g = np.zeros((H, W, 4), np.uint8); ys = np.arange(H)[:, None]
    a_top = np.clip(1 - ys / 720, 0, 1) ** 1.4 * 190; a_bot = np.clip((ys - 1180) / 260, 0, 1) * 200
    g[..., 3] = np.broadcast_to(np.maximum(a_top, a_bot), (H, W)).astype(np.uint8); A['grad'] = Image.fromarray(g, 'RGBA')
    A['vig'] = Image.fromarray(np.dstack([np.zeros((H, W, 3), np.uint8), (np.clip(r - .55, 0, 1) * 330).clip(0, 200).astype(np.uint8)]), 'RGBA')
    rng = np.random.default_rng(1)
    A['grain'] = [Image.fromarray(np.dstack([np.full((H, W, 3), 128, np.uint8), (rng.random((H, W)) * 16).astype(np.uint8)]), 'RGBA') for _ in range(4)]
    A['thumb'] = Image.open(os.path.join(HERE, 'out/miniatura_AO003_largo.jpg')).convert('RGB')
    lg = Image.open(os.path.join(ROOT, 'projects/canal2-misterio/kit_v2/logo_800x800.png')).convert('RGBA').resize((92, 92))
    m = Image.new('L', (92, 92), 0); ImageDraw.Draw(m).ellipse((0, 0, 91, 91), fill=255); lg.putalpha(m); A['logo'] = lg
    A['card'] = yt_card(); A['chunks'] = chunks()
    return A

TXT = {}
def text_img(s, font, size, fill, stroke=0, sfill=INK, pad=14):
    k = (s, font, size, fill, stroke)
    if k not in TXT:
        f = FONT(font, size); b = ImageDraw.Draw(Image.new('RGBA', (1, 1))).textbbox((0, 0), s, font=f, stroke_width=stroke)
        im = Image.new('RGBA', (b[2] - b[0] + 2 * pad, b[3] - b[1] + 2 * pad), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((pad - b[0], pad - b[1]), s, font=f, fill=fill, stroke_width=stroke, stroke_fill=sfill); TXT[k] = im
    return TXT[k]

def put(fr, im, cx, cy, scale=1., alpha=1., rot=0.):
    if scale <= .01 or alpha <= .01: return
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    if abs(scale - 1) > .005: im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BICUBIC)
    if alpha < 1: im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
    fr.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))

def pill(s, size=54, fg=INK, bg=CREAM, font='Anton-Regular.ttf', pad=(34, 14), outline=None):
    k = ('pill', s, size, fg, bg, outline)
    if k not in TXT:
        t = text_img(s, font, size, fg, pad=0); im = Image.new('RGBA', (t.width + 2 * pad[0], t.height + 2 * pad[1]), (0, 0, 0, 0))
        ImageDraw.Draw(im).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=im.height // 2, fill=bg, outline=outline, width=6 if outline else 0)
        im.alpha_composite(t, (pad[0], pad[1])); TXT[k] = im
    return TXT[k]

def stamp(s, color=RED, size=78):
    k = ('stamp', s, color, size)
    if k not in TXT:
        t = text_img(s, 'Anton-Regular.ttf', size, color, pad=0); im = Image.new('RGBA', (t.width + 60, t.height + 44), (0, 0, 0, 0))
        d = ImageDraw.Draw(im); d.rectangle((4, 4, im.width - 5, im.height - 5), outline=color, width=9); im.alpha_composite(t, (30, 22)); TXT[k] = im
    return TXT[k]

# ---------- captions ----------
def chunks():
    out, cur = [], []
    for i, w in enumerate(WORDS):
        cur.append(i)
        if len(cur) == 3 or w['word'][-1] in '.,:?…' or (i + 1 < len(WORDS) and WORDS[i + 1]['start'] - w['end'] > .25):
            out.append(cur); cur = []
    if cur: out.append(cur)
    res = []
    for j, c in enumerate(out):
        end = WORDS[out[j + 1][0]]['start'] if j + 1 < len(out) else WORDS[c[-1]]['end'] + .4
        res.append((WORDS[c[0]]['start'], min(end, WORDS[c[-1]]['end'] + .5), c))
    return res

def draw_captions(fr, t, y):
    for t0, t1, c in A['chunks']:
        if not (t0 <= t < t1): continue
        f = FONT('Nunito-Black.ttf', 76); d = ImageDraw.Draw(fr)
        words = [WORDS[i]['word'].upper() for i in c]; sp = 22
        ws = [d.textbbox((0, 0), w, font=f, stroke_width=9)[2] for w in words]; x = W / 2 - (sum(ws) + sp * (len(ws) - 1)) / 2
        pop = 1 + .08 * (1 - e_out((t - t0) / .15))
        for i, w, wd in zip(c, words, ws):
            on = WORDS[i]['start'] <= t
            col = GOLD if on and (t < WORDS[i]['end'] + .05 or i == c[-1]) and WORDS[i]['start'] == max(WORDS[j]['start'] for j in c if WORDS[j]['start'] <= t) else (255, 255, 255)
            im = text_img(w, 'Nunito-Black.ttf', 76, col, stroke=9, pad=4)
            put(fr, im, x + wd / 2, y, pop if col == GOLD else 1.)
            x += wd + sp
        return

# ---------- YouTube card ----------
def yt_card():
    cw = 980; th = A_thumb = Image.open(os.path.join(HERE, 'out/miniatura_AO003_largo.jpg')).convert('RGB').resize((cw - 40, int((cw - 40) * 9 / 16)))
    im = Image.new('RGBA', (cw, th.height + 330), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, cw - 1, im.height - 1), radius=36, fill=(24, 22, 21, 250), outline=(60, 56, 52), width=3)
    m = Image.new('L', th.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, th.width - 1, th.height - 1), radius=24, fill=255)
    im.paste(th, (20, 20), m)
    d.rectangle((20, 20 + th.height - 8, 20 + th.width, 20 + th.height - 2), fill=(90, 90, 90)); d.rectangle((20, 20 + th.height - 8, 120, 20 + th.height - 2), fill=(255, 0, 0))
    y = th.height + 44; f = FONT('Nunito-Black.ttf', 42)
    d.text((36, y), 'Las 5 PROFECÍAS de The Economist 2027', font=f, fill='white'); d.text((36, y + 52), 'que NADIE te está explicando', font=f, fill='white')
    lg = Image.open(os.path.join(ROOT, 'projects/canal2-misterio/kit_v2/logo_800x800.png')).convert('RGBA').resize((84, 84))
    mm = Image.new('L', (84, 84), 0); ImageDraw.Draw(mm).ellipse((0, 0, 83, 83), fill=255); im.paste(lg, (36, y + 130), mm)
    d.text((136, y + 134), 'Archivo Oscuro', font=FONT('Nunito-Black.ttf', 36), fill='white')
    d.text((136, y + 178), 'Próximamente · Expediente 003', font=FONT('Nunito-Black.ttf', 27), fill=(170, 170, 170))
    return im

def padlock(open_=0.):
    im = Image.new('RGBA', (120, 140), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    lift = int(26 * open_)
    d.arc((26, 8 - lift, 94, 80 - lift), 180, 360, fill=CREAM, width=14); d.line((27, 44 - lift, 27, 62 - lift * (1 - open_)), fill=CREAM, width=14)
    d.line((93, 44 - lift, 93, 62), fill=CREAM, width=14)
    d.rounded_rectangle((10, 58, 110, 136), radius=14, fill=CREAM); d.ellipse((50, 80, 70, 100), fill=INK); d.rectangle((56, 96, 64, 118), fill=INK)
    return im

# ---------- frame ----------
def frame(t):
    a = assets(); fr = a['bg'].copy()
    cx, cy, z = cam_at(t); sx, sy = shake_at(t)
    if t < T['siguenos'] + .2:
        k = S / z
        cov = a['src'].transform((W, H), Image.AFFINE, (k, 0, S * cx - (AX + sx) * k, 0, k, S * cy - (AY + sy) * k), Image.BICUBIC)
        fr.alpha_composite(cov)
    fr.alpha_composite(a['grad'])
    d = ImageDraw.Draw(fr)

    # 0 · hook: red glow on the crystal ball + question
    if t < T['pues'] + .6:
        g = .55 + .25 * math.sin(t * 5); al = 1 - e_out((t - T['pues']) / .6) if t > T['pues'] else 1
        glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse((AX - 330, AY - 330, AX + 330, AY + 330), outline=(255, 40, 30, int(160 * g * al)), width=60)
        fr.alpha_composite(glow.filter(ImageFilter.GaussianBlur(40)))
        put(fr, text_img('¿VERÍAS', 'Anton-Regular.ttf', 150, CREAM, stroke=10), W / 2, 330, appear(t, .05), al)
        put(fr, text_img('EL FUTURO?', 'Anton-Regular.ttf', 150, RED, stroke=10), W / 2, 490, appear(t, .5), al)
    # 1 · reveal 2027
    if T['v27'] <= t < T['esta']:
        al = 1 - e_out((t - T['esta'] + .3) / .3) if t > T['esta'] - .3 else 1
        put(fr, text_img('2027', 'Anton-Regular.ttf', 300, RED, stroke=14), W / 2, 380, appear(t, T['v27'], .4), al)
        put(fr, pill('YA SALIÓ', 70), W / 2, 590, appear(t, T['salio']), al)
    if 0 <= t - T['asi'] < .14: fr.alpha_composite(Image.new('RGBA', (W, H), (255, 255, 255, int(200 * (1 - (t - T['asi']) / .14)))))
    # 2 · source + element labels with focus ring
    if T['esta'] <= t < T['arriba']:
        put(fr, pill('FUENTE: THE ECONOMIST · THE WORLD AHEAD 2027', 34, CREAM, (20, 18, 17, 230)), W / 2, 1180, appear(t, T['esta'] + .3))
    for t0, t1, s in LABELS:
        if t0 <= t < t1 + .15:
            ring(fr, t - t0 - .3)
            put(fr, pill(s, 64), W / 2, 330, appear(t, t0 + .05), 1 - clamp((t - t1) / .15))
    if T['disim'] <= t < T['internet']:
        ring(fr, t - T['bola'] - .3)
        put(fr, stamp('NI LO DISIMULAN', GOLD, 70), W / 2, 330, appear(t, T['disim']), 1., -6)
    # 3 · ten prophecies -> five + five locked
    if T['internet'] <= t < T['uno']:
        dim = e_out((t - T['internet']) / .5) * .62; fr.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, int(255 * dim))))
        n = int(clamp((t - T['diez'] + .1) / .25) * 10)
        if t < T['ense']: put(fr, text_img(f'{n}', 'Anton-Regular.ttf', 330, RED, stroke=12), W / 2, 700, appear(t, T['diez'] - .15)); put(fr, pill('PROFECÍAS', 70), W / 2, 920, appear(t, T['diez']))
        else: bingo_card(fr, t)
    # 4 · casillas
    if T['bingo'] <= t < T['otras5'] + .2:
        hd = text_img('BINGO DEL APOCALIPSIS 2027', 'Anton-Regular.ttf', 66, CREAM, stroke=8)
        put(fr, hd, W / 2, 285, appear(t, T['bingo'], .3) if t < T['uno'] else 1., 1 - clamp((t - T['otras5']) / .2))
        strip(fr, t)
    for i, (t0, tp, s) in enumerate(CASILLAS):
        t1 = CASILLAS[i + 1][0] if i + 1 < len(CASILLAS) else T['otras5']
        if t0 <= t < t1:
            ring(fr, t - t0 - .4)
            card = lower_third(i + 1, s); put(fr, card, W / 2 + (1 - e_out((t - t0) / .35)) * -700, 1170, 1., 1 - clamp((t - t1 + .2) / .2))
            if i == 2:
                if T['dicen'] <= t: put(fr, stamp('LO DICE INTERNET', GOLD, 60), 760, 560, appear(t, T['dicen']), 1., 8)
                if T['taiwan2'] <= t: chat(fr, t)
            if t >= tp: cross(fr, t - tp)
    # 5 · the other five + the plane
    if T['otras5'] <= t < T['guarda']:
        if t < T['pista'] + .5:
            dim = e_out((t - T['otras5']) / .3) * .45 * (1 - e_out((t - T['pista']) / .5)); fr.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, int(255 * dim))))
            for j, (ang, dx, dy) in enumerate([(-14, -60, -300), (12, 80, -120), (-8, -40, 80), (16, 60, 260), (-20, 0, 430)]):
                t0 = T['otras5'] + .25 + j * .14
                if t >= t0: put(fr, tape(), AX + dx, AY + dy, 1 + .5 * (1 - e_out((t - t0) / .18)), 1 - e_out((t - T['pista']) / .4), ang)
        if t >= T['pista'] + .5:
            pr = clamp((t - T['pista'] - .5) / .6); bx = (AX - 250, AY - 160, AX + 250, AY + 160)
            for w in range(3): d.arc((bx[0] - w * 5, bx[1] - w * 4, bx[2] + w * 5, bx[3] + w * 4), -90, -90 + 360 * e_out(pr), fill=GOLD, width=9)
            put(fr, pill('LA PISTA', 64, INK, GOLD), W / 2, 330, appear(t, T['pista'] + .5))
        if t >= T['inet2']:
            for j in range(6):
                u = (t - T['inet2'] - j * .25)
                if u > 0: put(fr, text_img('?', 'Anton-Regular.ttf', 120, (255, 255, 255), stroke=8), 180 + j * 150, 1050 - u * 160, appear(t, T['inet2'] + j * .25), clamp(1.6 - u * .6))
    # 6 · save it
    if T['guarda'] <= t < T['siguenos'] + .3:
        al = 1 - clamp((t - T['siguenos']) / .3)
        fr.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, int(255 * .66 * e_out((t - T['guarda']) / .4) * al))))
        bookmark(fr, t, al)
        if t >= T['dic']: put(fr, cal_card(), W / 2, 980, appear(t, T['dic']), al)
        if t >= T['cuantas']: put(fr, stamp('¿CUÁNTAS SE CUMPLEN? _/10', RED, 62), W / 2, 1210, appear(t, T['cuantas']), al, -4)
    # 7 · YouTube end card
    if t >= T['siguenos']: youtube(fr, t)
    # captions + finishing
    if t < END - .5: draw_captions(fr, t, 1395)
    fr.alpha_composite(a['vig']); fr.alpha_composite(a['grain'][int(t * FPS) % 4])
    return fr.convert('RGB')

def ring(fr, u):
    if u < 0: return
    d = ImageDraw.Draw(fr); r = 250; p = e_out(u / .45)
    d.arc((AX - r, AY - r, AX + r, AY + r), -90, -90 + 360 * p, fill=RED, width=10)

def lower_third(n, s):
    k = ('lt', n, s)
    if k not in TXT:
        t = text_img(s, 'Anton-Regular.ttf', 58, INK, pad=0); w = t.width + 190
        im = Image.new('RGBA', (w, 120), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle((0, 0, w - 1, 119), radius=60, fill=CREAM); d.ellipse((10, 10, 110, 110), fill=RED)
        d.text((60, 60), str(n), font=FONT('Anton-Regular.ttf', 66), fill=CREAM, anchor='mm'); im.alpha_composite(t, (140, (120 - t.height) // 2)); TXT[k] = im
    return TXT[k]

def cross(fr, u):
    d = ImageDraw.Draw(fr); r = 210
    for (x0, y0, x1, y1), uu in [((AX - r, AY - r, AX + r, AY + r), u), ((AX + r, AY - r, AX - r, AY + r), u - .12)]:
        p = e_out(uu / .16)
        if p > 0: d.line((x0, y0, x0 + (x1 - x0) * p, y0 + (y1 - y0) * p), fill=RED, width=34)
    put(fr, stamp('¡TACHADA!', RED, 70), W / 2, 1030, appear(u + 10, 10.15), 1., -8)

def strip(fr, t):
    d = ImageDraw.Draw(fr); x0 = W / 2 - 5 * 66 + 6
    for i in range(10):
        x = x0 + i * 66; y = 380; locked = i >= 5
        lit = not locked and t >= CASILLAS[i][0]; done = not locked and t >= CASILLAS[i][1] + .1
        d.rounded_rectangle((x - 28, y - 28, x + 28, y + 28), radius=8, fill=(40, 36, 33) if locked else (CREAM if lit else (90, 84, 78)), outline=RED if lit and not done else None, width=4)
        if locked: d.text((x, y), '?', font=FONT('Anton-Regular.ttf', 36), fill=(120, 110, 100), anchor='mm')
        else: d.text((x, y), str(i + 1), font=FONT('Anton-Regular.ttf', 36), fill=INK, anchor='mm')
        if done: d.line((x - 22, y - 22, x + 22, y + 22), fill=RED, width=8); d.line((x + 22, y - 22, x - 22, y + 22), fill=RED, width=8)

def bingo_card(fr, t):
    for i in range(10):
        r, c = divmod(i, 5); x = W / 2 + (c - 2) * 180; y = 640 + r * 220; t0 = T['ense'] + .05 * i
        locked = i >= 5; sh = 8 * math.sin(t * 40) if locked and T['otras'] <= t < T['otras'] + .5 else 0
        k = ('bc', i)
        if k not in TXT:
            im = Image.new('RGBA', (160, 200), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
            d.rounded_rectangle((0, 0, 159, 199), radius=18, fill=(34, 30, 28) if locked else CREAM, outline=RED if locked else INK, width=5)
            if locked: im.alpha_composite(padlock().resize((70, 82)), (45, 58))
            else: d.text((80, 100), str(i + 1), font=FONT('Anton-Regular.ttf', 110), fill=INK, anchor='mm')
            TXT[k] = im
        put(fr, TXT[k], x + sh, y, appear(t, t0))
    if t >= T['bingo']: put(fr, text_img('¡BINGO!', 'Anton-Regular.ttf', 210, GOLD, stroke=14), W / 2, 1110, 1 + .6 * (1 - e_out((t - T['bingo']) / .25)), 1., -5)

def tape():
    k = 'tape'
    if k not in TXT:
        im = Image.new('RGBA', (900, 96), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 899, 95), fill=(240, 200, 40)); d.text((450, 50), 'CLASIFICADO · CLASIFICADO · CLASIFICADO', font=FONT('BebasNeue-Regular.ttf', 66), fill=INK, anchor='mm'); TXT[k] = im
    return TXT[k]

def chat(fr, t):
    u = t - T['taiwan2']; bub = pill('2027 📅'.replace(' 📅', ''), 60, 'white', (52, 120, 246))
    put(fr, bub, 700, 960, appear(t, T['taiwan2']))
    if t >= T['visto'] - .1:
        put(fr, text_img('Visto ✓✓'.replace('✓✓', ''), 'Nunito-Black.ttf', 36, (150, 190, 255), stroke=5), 790, 1045, appear(t, T['visto'] - .1))
        d = ImageDraw.Draw(fr)
        for dx in (0, 16): d.line((858 + dx, 1046, 866 + dx, 1056), fill=(120, 170, 255), width=5); d.line((866 + dx, 1056, 884 + dx, 1034), fill=(120, 170, 255), width=5)

def bookmark(fr, t, al):
    u = t - T['guarda']; s = appear(t, T['guarda'], .4)
    im = Image.new('RGBA', (240, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(im); fill = clamp((u - .3) / .4)
    poly = [(20, 10), (220, 10), (220, 290), (120, 210), (20, 290)]
    d.polygon(poly, fill=(int(60 + 194 * fill), int(56 + 150 * fill), int(52 - 12 * fill)), outline=CREAM); d.line(poly + [poly[0]], fill=CREAM, width=10)
    put(fr, im, W / 2, 560, s, al)
    put(fr, pill('GUÁRDALO', 70, INK, GOLD), W / 2, 780, appear(t, T['guarda'] + .35), al)

def cal_card():
    k = 'cal'
    if k not in TXT:
        im = Image.new('RGBA', (420, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle((0, 0, 419, 259), radius=24, fill=CREAM); d.rounded_rectangle((0, 0, 419, 80), radius=24, fill=RED); d.rectangle((0, 50, 419, 80), fill=RED)
        d.text((210, 42), 'DICIEMBRE', font=FONT('Anton-Regular.ttf', 52), fill=CREAM, anchor='mm'); d.text((210, 170), '2027', font=FONT('Anton-Regular.ttf', 130), fill=INK, anchor='mm'); TXT[k] = im
    return TXT[k]

def youtube(fr, t):
    a = A; u = t - T['siguenos']
    # background: darkened cover with slow zoom
    k = 1.0 + .03 * u; bg = a['bg']
    fr.alpha_composite(Image.new('RGBA', (W, H), (8, 7, 6, int(255 * clamp(u / .3) * .55))))
    put(fr, pill('NUEVO EXPEDIENTE EN YOUTUBE', 48, 'white', (220, 30, 30)), W / 2, 300, appear(t, T['siguenos'] + .1))
    CS = .9; ch = a['card'].height * CS; yc = 375 + ch / 2 + (1 - e_back(u / .7, 1.2)) * 1400
    put(fr, a['card'], W / 2, yc, CS)
    # play button pulse on the thumbnail
    pb = Image.new('RGBA', (150, 106), (0, 0, 0, 0)); dp = ImageDraw.Draw(pb); dp.rounded_rectangle((0, 0, 149, 105), radius=28, fill=(255, 0, 0)); dp.polygon([(58, 28), (58, 78), (100, 53)], fill='white')
    put(fr, pb, W / 2, yc - ch / 2 + CS * (20 + 264), (1 + .06 * math.sin(u * 6)) * appear(t, T['siguenos'] + .6), .92)
    # lock panel
    if t >= T['mil'] - .2:
        v = t - (T['mil'] - .2); py = 1255
        pan = Image.new('RGBA', (980, 150), (0, 0, 0, 0)); dd = ImageDraw.Draw(pan)
        dd.rounded_rectangle((0, 0, 979, 149), radius=30, fill=(30, 22, 20, 245), outline=RED, width=5)
        n = int(1000 * e_out(v / .9)); hit = t - SFX_HIT
        dd.text((610, 40), 'SE DESBLOQUEA CON', font=FONT('Anton-Regular.ttf', 40), fill=CREAM, anchor='mm')
        dd.text((610, 100), f'{n:,}'.replace(',', '.') + ' SEGUIDORES', font=FONT('Anton-Regular.ttf', 66), fill=RED, anchor='mm')
        put(fr, pan, W / 2, py, appear(t, T['mil'] - .2, .4))
        sh = 10 * math.sin(hit * 60) * (1 - clamp(hit / .45)) if 0 <= hit else 0
        put(fr, padlock(0), 170 + sh, py, appear(t, T['mil'] - .1, .4) * .95)
        if 0 <= hit < .14: fr.alpha_composite(Image.new('RGBA', (W, H), (255, 240, 200, int(170 * (1 - hit / .14)))))
        if hit > 0:
            rng = np.random.default_rng(5); d = ImageDraw.Draw(fr)
            for _ in range(46):
                ang = rng.uniform(0, 2 * math.pi); sp = rng.uniform(300, 900); rr = sp * e_out(hit / .9) * .9
                x = 170 + math.cos(ang) * rr; y = py + math.sin(ang) * rr + 300 * hit ** 2; al = 1 - clamp(hit / 1.0)
                if al > 0: c = GOLD if rng.random() > .4 else RED; s = rng.uniform(5, 12); d.ellipse((x - s, y - s, x + s, y + s), fill=c)
        # subscribe button (pulses after the hit)
        if hit > .75:
            b = pill('SÍGUENOS', 62, 'white', RED, outline=CREAM); put(fr, b, W / 2, 1420, appear(t, SFX_HIT + .75) * (1 + .05 * math.sin(hit * 7)))

# ---------- render ----------
def seg(args):
    i, f0, f1, path = args
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)
    for f in range(f0, f1): p.stdin.write(frame(f / FPS).tobytes())
    p.stdin.close(); p.wait(); return path

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--still', type=float); ap.add_argument('--jobs', type=int, default=4); ap.add_argument('--to', type=float, default=END)
    a = ap.parse_args(); out = os.path.join(HERE, 'out'); os.makedirs(out, exist_ok=True)
    if a.still is not None: frame(a.still).save(os.path.join(out, f'still_{a.still:05.2f}.png')); return
    n = int(a.to * FPS); step = math.ceil(n / a.jobs); tmp = os.path.join(out, 'seg'); os.makedirs(tmp, exist_ok=True)
    jobs = [(i, i * step, min(n, (i + 1) * step), os.path.join(tmp, f's{i}.mp4')) for i in range(a.jobs)]
    with Pool(a.jobs) as pool: parts = pool.map(seg, jobs)
    lst = os.path.join(tmp, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(out, 'video_mudo.mp4')], check=True)
    print('video ok')

if __name__ == '__main__': main()
