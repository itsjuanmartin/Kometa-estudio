"""Finales tipo «captura de pantalla» (sustituyen a la tarjeta amarilla).

  reel_end(bg_frame_path, question, out_mp4, voice_mp3, music_mp3=None, music_ss=0, ref_lufs=None)
      9:16, ~4,5 s: el perfil del canal sube como una grabación de pantalla del móvil; un dedo pulsa
      «Seguir» -> «Siguiendo ✓» y después toca el enlace a YouTube mientras la voz dice
      «La historia completa está en YouTube. Link en mi perfil».
  yt_outro_frame(t, bg)  -> fotograma 16:9 para los últimos segundos del vídeo largo:
      tarjeta del canal, el dedo pulsa «Suscribirse» -> «Suscrito» y la campana; luego deja sitio
      para la pantalla final de YouTube (vídeo recomendado + botón de suscripción).

Diseño neutro de app (no copia la interfaz de ninguna red): avatar, nombre, @usuario, bio, botón y miniaturas reales del canal.
"""
import math, os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
UI = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; UIB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FB = f'{ROOT}/assets/fonts/Fredoka-Bold.ttf'
LOGO = f'{ROOT}/home/logo_ytt.jpg'
HANDLE = '@YSiTeTocaraATi'; NAME = 'Y Si Te Tocará'
BIO = ['Historias reales contadas como si', 'te pasaran a ti. Cada día, una nueva.']
GRID = ['35', '52', '06', '39', '58', '18']           # miniaturas del perfil: escenas del episodio
BLUE, GREY, INK, MUTED, LINK = (0, 122, 255), (236, 237, 240), (18, 18, 20), (110, 112, 120), (0, 98, 210)


def F(p, s): return ImageFont.truetype(p, s)


def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)


def spring(x):
    """sube con un pequeño rebote (0..1)."""
    x = min(1, max(0, x)); return 1 - math.cos(x * math.pi * 1.5) * math.exp(-5 * x)


def circle_img(path, size):
    im = Image.open(path).convert('RGB').resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size, size), 0); ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new('RGBA', (size, size)); out.paste(im, (0, 0), m); return out


def thumb(name, w, h):
    im = Image.open(f'{HERE}/assets/img/{name}.jpg').convert('RGB'); s = max(w / im.width, h / im.height)
    im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    x = (im.width - w) // 2; return im.crop((x, 0, x + w, h))


# ------------------------------------------------------------------ pantalla del perfil (móvil)
PW, PH = 900, 1560                                   # tamaño de la «pantalla» dentro del reel


def profile_screen(followed, link_hi, bell=False):
    """pantalla de perfil (RGBA, PWxPH) en un estado concreto."""
    S = Image.new('RGBA', (PW, PH), (255, 255, 255, 255)); d = ImageDraw.Draw(S)
    # barra de estado
    d.text((48, 26), '20:00', font=F(UIB, 34), fill=INK)
    for k in range(4): d.rectangle((PW - 210 + k * 16, 50 - k * 7, PW - 200 + k * 16, 56), fill=INK)
    d.rounded_rectangle((PW - 120, 30, PW - 56, 58), 8, outline=INK, width=3); d.rectangle((PW - 116, 34, PW - 72, 54), fill=INK)
    # cabecera
    d.text((48, 100), '‹', font=F(UIB, 64), fill=INK)
    tw = d.textbbox((0, 0), HANDLE, font=F(UIB, 38))[2]; d.text((PW / 2 - tw / 2, 116), HANDLE, font=F(UIB, 38), fill=INK)
    d.text((PW - 100, 104), '···', font=F(UIB, 48), fill=INK)
    # avatar + nombre
    av = circle_img(LOGO, 230); ring = Image.new('RGBA', (250, 250)); ImageDraw.Draw(ring).ellipse((0, 0, 249, 249), outline=(240, 160, 40, 255), width=7)
    S.alpha_composite(ring, (48, 200)); S.alpha_composite(av, (58, 210))
    d.text((320, 250), NAME, font=F(UIB, 52), fill=INK)
    d.text((322, 322), 'Canal de historia', font=F(UI, 34), fill=MUTED)
    y = 470
    for l in BIO: d.text((48, y), l, font=F(UI, 36), fill=INK); y += 48
    # enlace a YouTube
    lk = '▶  Historia completa en YouTube'; lb = d.textbbox((0, 0), lk, font=F(UIB, 36))
    if link_hi: d.rounded_rectangle((36, y + 6, 60 + lb[2], y + 62), 14, fill=(214, 232, 255))
    d.text((48, y + 12), lk, font=F(UIB, 36), fill=LINK); y += 100
    # botones
    bw = (PW - 48 * 2 - 20) * 0.62; x0 = 48
    if followed:
        d.rounded_rectangle((x0, y, x0 + bw, y + 96), 22, fill=GREY)
        t = 'Siguiendo ✓'; tb = d.textbbox((0, 0), t, font=F(UIB, 40)); d.text((x0 + bw / 2 - tb[2] / 2, y + 22), t, font=F(UIB, 40), fill=INK)
    else:
        d.rounded_rectangle((x0, y, x0 + bw, y + 96), 22, fill=BLUE)
        t = 'Seguir'; tb = d.textbbox((0, 0), t, font=F(UIB, 44)); d.text((x0 + bw / 2 - tb[2] / 2, y + 18), t, font=F(UIB, 44), fill=(255, 255, 255))
    x1 = x0 + bw + 20; d.rounded_rectangle((x1, y, PW - 48, y + 96), 22, fill=GREY)
    t = 'Mensaje'; tb = d.textbbox((0, 0), t, font=F(UIB, 40)); d.text((x1 + (PW - 48 - x1) / 2 - tb[2] / 2, y + 22), t, font=F(UIB, 40), fill=INK)
    BTN = (x0 + bw / 2, y + 48); y += 140
    # rejilla de vídeos del canal
    gw = (PW - 6) // 3; gh = int(gw * 16 / 9)
    for i, n in enumerate(GRID):
        S.paste(thumb(n, gw, gh), (i % 3 * (gw + 3), y + i // 3 * (gh + 3)))
    return S, BTN, (48 + lb[2] / 2, y - 140 - 100 + 34)


def finger(img, x, y, press):
    """indicador de toque (como en las grabaciones de pantalla del móvil)."""
    d = ImageDraw.Draw(img, 'RGBA'); r = 46 - 12 * press
    d.ellipse((x - r - 8, y - r - 8, x + r + 8, y + r + 8), fill=(255, 255, 255, 70))
    d.ellipse((x - r, y - r, x + r, y + r), fill=(120, 120, 125, 150), outline=(255, 255, 255, 220), width=4)


def ripple(img, x, y, k):
    if not 0 <= k <= 1: return
    d = ImageDraw.Draw(img, 'RGBA'); r = 40 + 150 * k; a = int(170 * (1 - k))
    d.ellipse((x - r, y - r, x + r, y + r), outline=(255, 255, 255, a), width=8)


def reel_frame(t, bg, question, T_FOLLOW=1.25, T_LINK=2.55):
    """fotograma 1080x1920 del final del reel en el instante t (s)."""
    W, H = 1080, 1920; fr = bg.copy()
    # pregunta para comentar (arriba, zona segura)
    d = ImageDraw.Draw(fr); f = F(FB, 58); qb = d.textbbox((0, 0), question, font=f)
    qa = ease(t / .3); qy = 250
    if qa > 0:
        L = Image.new('RGBA', (W, H)); ld = ImageDraw.Draw(L)
        ld.rounded_rectangle((W / 2 - qb[2] / 2 - 36, qy - 18, W / 2 + qb[2] / 2 + 36, qy + qb[3] + 28), 40, fill=(255, 255, 255, int(235 * qa)))
        ld.text((W / 2 - qb[2] / 2, qy), question, font=f, fill=(25, 20, 18, int(255 * qa)))
        f2 = F(FB, 40); s2 = 'Respóndelo en los comentarios'; b2 = ld.textbbox((0, 0), s2, font=f2)
        ld.text((W / 2 - b2[2] / 2, qy + qb[3] + 46), s2, font=f2, fill=(255, 255, 255, int(255 * qa)), stroke_width=4, stroke_fill=(0, 0, 0, int(160 * qa)))
        fr.alpha_composite(L)
    # la «pantalla» sube
    followed = t >= T_FOLLOW + .05; link_hi = t >= T_LINK + .05
    S, BTN, LNK = profile_screen(followed, link_hi)
    sc = 0.86; Sw, Sh = int(PW * sc), int(PH * sc); S = S.resize((Sw, Sh), Image.LANCZOS)
    m = Image.new('L', (Sw, Sh), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, Sw - 1, Sh - 1), 48, fill=255)
    up = min(1.02, spring(t / .55)); x = (W - Sw) // 2; y = int(470 + (1 - up) * 1500)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).rounded_rectangle((x - 10, y - 4, x + Sw + 10, y + Sh + 20), 58, fill=(0, 0, 0, 110))
    fr.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)))
    fr.paste(S, (x, y), m); ImageDraw.Draw(fr).rounded_rectangle((x - 3, y - 3, x + Sw + 3, y + Sh + 3), 50, outline=(20, 20, 20, 255), width=6)
    bx, by = x + BTN[0] * sc, y + BTN[1] * sc; lx, ly = x + LNK[0] * sc, y + LNK[1] * sc
    # el dedo: entra, pulsa «Seguir», va al enlace y lo pulsa
    if .45 < t:
        if t < T_FOLLOW: k = ease((t - .45) / (T_FOLLOW - .45)); fx, fy = W * .72 + (bx - W * .72) * k, H * .95 + (by - H * .95) * k
        elif t < T_LINK - .55: fx, fy = bx, by
        elif t < T_LINK: k = ease((t - (T_LINK - .55)) / .55); fx, fy = bx + (lx - bx) * k, by + (ly - by) * k
        else: fx, fy = lx, ly
        press = max(0, 1 - abs(t - T_FOLLOW) / .12) + max(0, 1 - abs(t - T_LINK) / .12)
        ripple(fr, bx, by, (t - T_FOLLOW) / .45); ripple(fr, lx, ly, (t - T_LINK) / .45)
        finger(fr, fx, fy, min(1, press))
    # al pulsar «Seguir»: corazoncitos/estrellas que suben
    if T_FOLLOW < t < T_FOLLOW + 1.1:
        d = ImageDraw.Draw(fr, 'RGBA'); k = (t - T_FOLLOW) / 1.1
        for i in range(7):
            a = i * 0.9; px = bx + math.cos(a) * 120 * k + (i - 3) * 18; py = by - 260 * k - (i % 3) * 30
            r = 14 * (1 - k) + 6; col = [(255, 80, 90), (255, 200, 40), (90, 170, 255)][i % 3]
            d.ellipse((px - r, py - r, px + r, py + r), fill=col + (int(255 * (1 - k)),))
    return fr


def lufs(path):
    import re
    e = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-vn', '-af', 'loudnorm=print_format=summary', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = re.search(r'Input Integrated:\s+(-?[\d.]+)', e); return float(m.group(1)) if m else None


def reel_end(bg_png, question, out, voice, music=None, music_ss=0.0, ref_lufs=-14.0, lead=0.35, tail=0.9):
    """vídeo del final del reel (1080x1920, 30 fps) con la voz igualada al volumen del cuerpo."""
    vd = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voice]))
    dur = lead + vd + tail; W, H = 1080, 1920
    bg = Image.open(bg_png).convert('RGB').resize((W, H)); bg = bg.filter(ImageFilter.GaussianBlur(22))
    bg = Image.eval(bg, lambda v: int(v * .55)).convert('RGBA')
    tmpv = out.replace('.mov', '_v.mp4')
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', tmpv], stdin=subprocess.PIPE)
    for n in range(int(dur * 30)): p.stdin.write(np.asarray(reel_frame(n / 30, bg, question).convert('RGB')).tobytes())
    p.stdin.close(); p.wait()
    # sonido: voz (al volumen del cuerpo), dos «toques», música de fondo continuando
    import sys; sys.path.insert(0, f'{ROOT}/audio'); import sfx as SFX; from dsp import write_wav, SR
    taps = np.zeros((int(dur * SR), 2), np.float32)
    for tt, nm, g in [(0.0, 'whoosh', .35), (1.25, 'pop', .55), (2.55, 'pop', .45), (1.3, 'shimmer', .12)]:
        s = SFX.make(nm); s = s if s.ndim == 2 else np.stack([s, s], 1); i0 = int(tt * SR); n = min(len(s), len(taps) - i0); taps[i0:i0 + n] += s[:n] * g
    write_wav(out.replace('.mov', '_fx.wav'), taps)
    gv = (ref_lufs - (lufs(voice) or ref_lufs) - 0.3) if ref_lufs is not None else 0   # -3 dB: los toques y la música se suman a la voz
    ins = ['-i', tmpv, '-i', voice, '-i', out.replace('.mov', '_fx.wav')]
    if music and os.path.exists(music): ins += ['-ss', f'{music_ss:.3f}', '-t', f'{dur:.3f}', '-i', music]
    else: ins += ['-f', 'lavfi', '-t', f'{dur:.3f}', '-i', 'anullsrc=r=48000:cl=stereo']
    fc = (f"[1:a]aresample=48000,aformat=channel_layouts=stereo,volume={gv:.2f}dB,adelay={int(lead * 1000)}|{int(lead * 1000)},apad[v];[2:a]aresample=48000,aformat=channel_layouts=stereo[x];"
          f"[3:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.30,afade=t=out:st={dur - .8:.2f}:d=0.8[m];[v][x][m]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.89:level=disabled[a]")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-t', f'{dur:.3f}',
                    '-c:v', 'copy', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', out], check=True)
    return dur


# ------------------------------------------------------------------ final del vídeo largo (16:9)
def yt_outro_frame(t, bg, T_SUB=1.6, T_BELL=2.5):
    """t: segundos desde el inicio del final. bg: imagen RGBA 1920x1080 ya desenfocada."""
    W, H = 1920, 1080; fr = bg.copy(); d = ImageDraw.Draw(fr, 'RGBA')
    # tarjeta del canal (como captura de la app): entra desde abajo y se queda arriba a la izquierda
    a = spring(t / .6); cw, ch = 1100, 250; cx = W / 2 - cw / 2; cy = 120 + (1 - a) * 900
    sub = t >= T_SUB + .05; bell = t >= T_BELL + .05
    L = Image.new('RGBA', (W, H)); ld = ImageDraw.Draw(L)
    ld.rounded_rectangle((cx + 8, cy + 14, cx + cw + 8, cy + ch + 14), 40, fill=(0, 0, 0, 110))
    fr.alpha_composite(L.filter(ImageFilter.GaussianBlur(14))); d = ImageDraw.Draw(fr, 'RGBA')
    d.rounded_rectangle((cx, cy, cx + cw, cy + ch), 40, fill=(255, 255, 255, 250))
    fr.alpha_composite(circle_img(LOGO, 170), (int(cx + 40), int(cy + 40)))
    d.text((cx + 240, cy + 52), NAME, font=F(UIB, 56), fill=INK)
    d.text((cx + 242, cy + 130), HANDLE, font=F(UI, 34), fill=MUTED)
    bx0, by0 = cx + cw - 420, cy + 75
    if sub:
        d.rounded_rectangle((bx0, by0, bx0 + 270, by0 + 100), 50, fill=GREY); tt = 'Suscrito'
        tb = d.textbbox((0, 0), tt, font=F(UIB, 40)); d.text((bx0 + 135 - tb[2] / 2, by0 + 26), tt, font=F(UIB, 40), fill=INK)
    else:
        d.rounded_rectangle((bx0, by0, bx0 + 330, by0 + 100), 50, fill=(18, 18, 20)); tt = 'Suscribirse'
        tb = d.textbbox((0, 0), tt, font=F(UIB, 40)); d.text((bx0 + 165 - tb[2] / 2, by0 + 26), tt, font=F(UIB, 40), fill=(255, 255, 255))
    # campana (aparece al suscribirse)
    if sub:
        gx, gy = bx0 + 300, by0 + 50; ang = math.sin((t - T_BELL) * 30) * 18 * max(0, 1 - (t - T_BELL) / .8) if bell else 0
        B = Image.new('RGBA', (120, 120)); bd = ImageDraw.Draw(B)
        bd.ellipse((0, 0, 119, 119), fill=GREY); col = INK
        bd.pieslice((30, 22, 90, 86), 180, 360, fill=col); bd.rectangle((30, 54, 90, 80), fill=col); bd.rectangle((24, 78, 96, 86), fill=col); bd.ellipse((50, 86, 70, 102), fill=col)
        if bell: bd.line((16, 30, 6, 20), fill=col, width=6); bd.line((104, 30, 114, 20), fill=col, width=6)
        B = B.rotate(ang, resample=Image.BICUBIC); fr.alpha_composite(B, (int(gx), int(gy - 60)))
    BTN = (bx0 + 165, by0 + 50); BELL = (bx0 + 360, by0 + 50)
    if .5 < t < T_BELL + 1.2:
        if t < T_SUB: k = ease((t - .5) / (T_SUB - .5)); fx, fy = 1500 + (BTN[0] - 1500) * k, 1000 + (BTN[1] - 1000) * k
        elif t < T_BELL - .4: fx, fy = BTN
        elif t < T_BELL: k = ease((t - (T_BELL - .4)) / .4); fx, fy = BTN[0] + (BELL[0] - BTN[0]) * k, BTN[1] + (BELL[1] - BTN[1]) * k
        else: fx, fy = BELL
        press = max(0, 1 - abs(t - T_SUB) / .12) + max(0, 1 - abs(t - T_BELL) / .12)
        ripple(fr, *BTN, (t - T_SUB) / .45); ripple(fr, *BELL, (t - T_BELL) / .45); finger(fr, fx, fy, min(1, press))
    # zona para la pantalla final de YouTube (vídeo recomendado a la izquierda, suscripción a la derecha)
    k = ease((t - 3.2) / .5)
    if k > 0:
        d = ImageDraw.Draw(fr, 'RGBA'); al = int(255 * k)
        f = F(FB, 60); s = '¿Te quedas a vivir otra historia?'; sb = d.textbbox((0, 0), s, font=f)
        d.text((W / 2 - sb[2] / 2, 470), s, font=f, fill=(255, 255, 255, al), stroke_width=6, stroke_fill=(0, 0, 0, int(al * .7)))
        d.rounded_rectangle((300, 590, 1100, 1040), 26, outline=(255, 255, 255, int(al * .55)), width=5)     # aquí va el «vídeo recomendado»
        d.ellipse((1330, 640, 1680, 990), outline=(255, 255, 255, int(al * .55)), width=5)                      # aquí va el botón de suscripción
    return fr
