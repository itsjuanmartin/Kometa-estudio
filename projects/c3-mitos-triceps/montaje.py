"""Montaje del Short: fotogramas de Blender + títulos + subtítulos + tarjeta de YouTube + voz y música.

python3 montaje.py [--preview 300,1200]   (con --preview solo escribe esos fotogramas en fotos/)
"""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
TL = json.load(open(os.path.join(HERE, "timeline/lineas.json"), encoding="utf-8"))
NF = 1302
FD = "/usr/share/fonts/opentype/inter/"
F_TIT = FD + "InterDisplay-BlackItalic.otf"
F_UI = FD + "Inter-Bold.otf"
F_UIB = FD + "Inter-ExtraBold.otf"
NEGRO, ROJO, VERDE, AZUL = (20, 20, 22), (230, 30, 36), (34, 170, 76), (30, 120, 220)
font_cache = {}


def font(path, size):
    k = (path, size)
    if k not in font_cache: font_cache[k] = ImageFont.truetype(path, size)
    return font_cache[k]


def ease(t):
    t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3


# ---------------- títulos (líneas: (texto, color, tamaño)) ----------------
TITULOS = [
    (0.35, 2.45, [("¿BRAZOS", NEGRO, 150), ("GRANDES?", ROJO, 150)], None),
    (2.45, 5.25, [("SOLO", NEGRO, 120), ("BÍCEPS", NEGRO, 160)], "x"),
    (5.6, 8.05, [("TRÍCEPS", ROJO, 170), ("+ DE LA MITAD DEL BRAZO", NEGRO, 58)], None),
    (8.05, 10.0, [("3", ROJO, 230), ("MITOS", NEGRO, 150)], None),
    (10.0, 13.6, [("MITO 1", ROJO, 80), ("SOLO", NEGRO, 120), ("POLEA", NEGRO, 150)], "x"),
    (13.6, 17.6, [("POR ENCIMA", NEGRO, 118), ("DE LA CABEZA", VERDE, 112)], "ok"),
    (17.7, 24.1, [("+40%", VERDE, 230), ("DE CRECIMIENTO", NEGRO, 84)], None),
    (24.25, 27.6, [("MITO 2", ROJO, 80), ("POCO PESO", NEGRO, 125), ("= DEFINIR", NEGRO, 125)], "x"),
    (27.6, 29.3, [("DEFINIR", NEGRO, 135), ("= PERDER GRASA", ROJO, 92)], None),
    (29.3, 32.45, [("6–12 REPES", NEGRO, 140), ("CERCA DEL FALLO", ROJO, 92)], "ok"),
    (32.55, 35.2, [("MITO 3", ROJO, 80), ("+ DÍAS", NEGRO, 150), ("= MEJOR", NEGRO, 150)], "x"),
    (35.2, 37.85, [("2 DÍAS", VERDE, 170), ("POR SEMANA", NEGRO, 96)], "cal"),
]
NOTAS = [(17.9, 24.1, "Maeo et al., 2022 · extensiones por encima de la cabeza vs. polea")]


def icono(kind, size):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    col = ROJO if kind == "x" else VERDE
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=size // 6, fill=col)
    w = max(6, size // 9); m = size * 0.27
    if kind == "x":
        d.line((m, m, size - m, size - m), fill="white", width=w); d.line((m, size - m, size - m, m), fill="white", width=w)
    else:
        d.line((size * 0.24, size * 0.53, size * 0.43, size * 0.72, size * 0.77, size * 0.3), fill="white", width=w, joint="curve")
    return im


def bloque_titulo(lines, ic):
    imgs = []
    for txt, col, sz in lines:
        f = font(F_TIT, sz); bb = f.getbbox(txt)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        li = Image.new("RGBA", (tw + 40, th + 30), (0, 0, 0, 0)); d = ImageDraw.Draw(li)
        d.text((20 - bb[0], 12 - bb[1]), txt, font=f, fill=(*col, 255))
        imgs.append(li)
    gap = 6
    bw = max(i.width for i in imgs); bh = sum(i.height for i in imgs) + gap * (len(imgs) - 1)
    if ic in ("x", "ok"):
        bw += 150
    blk = Image.new("RGBA", (bw + 20, bh + 20), (0, 0, 0, 0)); y = 10
    tx = 10
    for li in imgs:
        blk.alpha_composite(li, (tx + (bw - (150 if ic in ("x", "ok") else 0) - li.width) // 2, y)); y += li.height + gap
    if ic in ("x", "ok"):
        ico = icono(ic, 120); blk.alpha_composite(ico, (bw - 120, (blk.height - 120) // 2))
    # sombra suave
    sh = Image.new("RGBA", blk.size, (0, 0, 0, 0)); sh.putalpha(blk.getchannel("A").point(lambda a: int(a * 0.28)))
    sh = sh.filter(ImageFilter.GaussianBlur(7))
    out = Image.new("RGBA", (blk.width + 20, blk.height + 20), (0, 0, 0, 0))
    out.alpha_composite(sh, (12, 14)); out.alpha_composite(blk, (6, 6))
    return out


def calendario(t_in):
    dias = "LMXJVSD"; s = 116; g = 16
    im = Image.new("RGBA", (7 * s + 6 * g, s), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i, ch in enumerate(dias):
        x = i * (s + g); on = ch in "LJ" and t_in > 0.25 + 0.25 * (ch == "J")
        d.rounded_rectangle((x, 0, x + s, s), radius=20, fill=VERDE if on else (255, 255, 255), outline=(40, 40, 44) if not on else VERDE, width=4)
        f = font(F_UIB, 54); bb = f.getbbox(ch)
        d.text((x + (s - (bb[2] - bb[0])) / 2 - bb[0], (s - (bb[3] - bb[1])) / 2 - bb[1]), ch, font=f, fill="white" if on else NEGRO)
    return im


TCACHE = {}


def dibuja_titulos(frame, t):
    for i, (a, b, lines, ic) in enumerate(TITULOS):
        if a <= t < b:
            if i not in TCACHE: TCACHE[i] = bloque_titulo(lines, ic)
            blk = TCACHE[i]
            k = ease((t - a) / 0.22); out = ease((t - (b - 0.15)) / 0.15) if t > b - 0.15 else 0
            sc = 0.82 + 0.18 * k
            im = blk.resize((max(1, int(blk.width * sc)), max(1, int(blk.height * sc))), Image.LANCZOS)
            alpha = k * (1 - out)
            if alpha < 1: im.putalpha(im.getchannel("A").point(lambda q: int(q * alpha)))
            if im.width > W - 40:
                r = (W - 40) / im.width; im = im.resize((W - 40, int(im.height * r)), Image.LANCZOS)
            frame.alpha_composite(im, ((W - im.width) // 2, 150 + int((1 - k) * 30)))
            if ic == "cal":
                cal = calendario(t - a); frame.alpha_composite(cal, ((W - cal.width) // 2, 150 + im.height + 30))
    for a, b, txt in NOTAS:
        if a <= t < b:
            f = font(F_UI, 30); bb = f.getbbox(txt); d = ImageDraw.Draw(frame)
            d.text(((W - (bb[2] - bb[0])) // 2, 470), txt, font=f, fill=(70, 72, 78))


# ---------------- subtítulos por trozos ----------------
def trozos():
    out = []
    for ln in TL["lines"]:
        words = ln["text"].split(); chunks = []; cur = []
        for w in words:
            cur.append(w)
            if len(" ".join(cur)) > 22 or w.endswith((".", ",", "?", ":")):
                chunks.append(" ".join(cur)); cur = []
        if cur: chunks.append(" ".join(cur))
        total = sum(len(c) for c in chunks); t = ln["start"]; dur = ln["end"] - ln["start"]
        for c in chunks:
            d = dur * len(c) / total; out.append((t, t + d, c.rstrip(".,:"))); t += d
    return out


SUBS = trozos()


def dibuja_sub(frame, t):
    for a, b, txt in SUBS:
        if a <= t < b:
            if t >= 37.9: return
            d = ImageDraw.Draw(frame); f = font(F_UI, 54); bb = f.getbbox(txt)
            x = (W - (bb[2] - bb[0])) // 2; y = 1530
            d.text((x, y), txt, font=f, fill="white", stroke_width=4, stroke_fill=(15, 15, 18))
            return


# ---------------- tarjeta de YouTube (cierre) ----------------
def tarjeta():
    cw, ch = 980, 760
    c = Image.new("RGBA", (cw, ch), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    d.rounded_rectangle((0, 0, cw - 1, ch - 1), radius=44, fill=(14, 14, 16))
    # cabecera: atrás · avatar · nombre · +
    d.line((48, 70, 30, 88, 48, 106), fill="white", width=7, joint="curve")
    logo = Image.open(os.path.join(HERE, "../canal3-fitness/conceptos/web/marmol_logo.jpg")).convert("RGB").resize((96, 96), Image.LANCZOS)
    m = Image.new("L", (96, 96), 0); ImageDraw.Draw(m).ellipse((0, 0, 95, 95), fill=255)
    c.paste(logo, (90, 40), m)
    d.text((206, 52), "Esculpe", font=font(F_UIB, 64), fill="white")
    d.line((cw - 80, 88, cw - 40, 88), fill="white", width=7); d.line((cw - 60, 68, cw - 60, 108), fill="white", width=7)
    # logotipo genérico de YouTube
    lx, ly = 250, 166
    d.rounded_rectangle((lx, ly, lx + 150, ly + 104), radius=30, fill=(255, 0, 0))
    d.polygon([(lx + 58, ly + 28), (lx + 58, ly + 76), (lx + 102, ly + 52)], fill="white")
    d.text((lx + 172, ly + 2), "YouTube", font=font(F_UIB, 92), fill="white")
    # miniatura del vídeo largo
    tx, ty, tw, th = 30, 300, cw - 60, ch - 330
    src = os.path.join(HERE, "frames", "f_0560.png")
    if os.path.exists(src) and os.path.getsize(src) > 0:
        th_img = Image.open(src).convert("RGB")
        r = max(tw / th_img.width, th / th_img.height)
        th_img = th_img.resize((int(th_img.width * r), int(th_img.height * r)), Image.LANCZOS)
        oy = int(th_img.height * 0.08)
        th_img = th_img.crop(((th_img.width - tw) // 2, oy, (th_img.width - tw) // 2 + tw, oy + th))
    else:
        th_img = Image.new("RGB", (tw, th), (200, 200, 205))
    mk = Image.new("L", (tw, th), 0); ImageDraw.Draw(mk).rounded_rectangle((0, 0, tw - 1, th - 1), radius=26, fill=255)
    c.paste(th_img, (tx, ty), mk)
    t1 = bloque_titulo([("TRÍCEPS", ROJO, 96), ("LA GUÍA", NEGRO, 70), ("COMPLETA", NEGRO, 70)], None)
    c.alpha_composite(t1, (tx + 16, ty + 20))
    d.rectangle((tx + 10, ty + th - 14, tx + tw - 10, ty + th - 8), fill=(90, 90, 95))
    d.rectangle((tx + 10, ty + th - 14, tx + int(tw * 0.32), ty + th - 8), fill=(255, 0, 0))
    return c


CARD = None


def dibuja_cta(frame, t):
    global CARD
    t0 = 37.9
    if t < t0: return
    if CARD is None: CARD = tarjeta()
    k = ease((t - t0) / 0.45)
    y = int(-CARD.height + (90 + CARD.height) * k)
    frame.alpha_composite(CARD, ((W - CARD.width) // 2, y))
    if t > t0 + 0.35:
        blk = TCACHE.setdefault("cta", bloque_titulo([("VÍDEO COMPLETO", NEGRO, 104), ("EN YOUTUBE", ROJO, 112)], None))
        k2 = ease((t - t0 - 0.35) / 0.3)
        im = blk.resize((int(blk.width * (0.85 + 0.15 * k2)), int(blk.height * (0.85 + 0.15 * k2))), Image.LANCZOS)
        im.putalpha(im.getchannel("A").point(lambda q: int(q * k2)))
        frame.alpha_composite(im, ((W - im.width) // 2, 880))


def compone(f):
    t = (f - 1) / FPS
    src = os.path.join(HERE, "frames", f"f_{f:04d}.png")
    base = Image.open(src).convert("RGBA").resize((W, H), Image.LANCZOS)
    dibuja_titulos(base, t); dibuja_sub(base, t); dibuja_cta(base, t)
    # fundido corto al empezar
    if t < 0.25:
        base = Image.blend(Image.new("RGBA", (W, H), (240, 240, 242, 255)), base, t / 0.25)
    return base.convert("RGB")


if __name__ == "__main__":
    if "--preview" in sys.argv:
        for f in [int(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")]:
            compone(f).save(os.path.join(HERE, "fotos", f"montaje_{f:04d}.jpg"), quality=88); print("ok", f)
        sys.exit()
    out = os.path.join(HERE, "out"); os.makedirs(out, exist_ok=True)
    voz = os.path.join(HERE, "audio/voz.wav"); mus = os.path.join(HERE, "audio/motivator.mp3")
    dur = NF / FPS
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", voz, "-ss", "4", "-i", mus,
           "-filter_complex", f"[2:a]volume=0.13,afade=t=in:d=0.6,afade=t=out:st={dur - 1.6}:d=1.6[m];[1:a]volume=1.6[v];[v][m]amix=inputs=2:duration=first:normalize=0[a]",
           "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-tune", "animation",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{dur:.2f}",
           os.path.join(out, "esculpe_short_triceps.mp4")]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(1, NF + 1):
        p.stdin.write(compone(f).tobytes())
        if f % 150 == 0: print("montaje", f, flush=True)
    p.stdin.close(); p.wait(); print("listo", p.returncode)
