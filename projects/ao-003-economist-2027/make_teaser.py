"""Miniatura del vídeo largo (1920x1080) + tarjeta final del reel (1080x1920) que la muestra como si ya estuviera en YouTube."""
import math, os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
F = lambda n, s: ImageFont.truetype(os.path.join(ROOT, 'assets/fonts', n), s)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
BG, RED, CREAM, BLACK = (14, 12, 11), (214, 40, 36), (238, 230, 214), (8, 8, 8)
LOGO = os.path.join(ROOT, 'projects/canal2-misterio/kit_v2/logo_800x800.png')
random.seed(7)

def thumb():
    im = Image.new('RGB', (1920, 1080), BG); d = ImageDraw.Draw(im)
    # red glow behind the circle
    glow = Image.new('RGB', im.size, BG); ImageDraw.Draw(glow).ellipse((1000, 80, 1880, 960), fill=(120, 20, 18))
    im = Image.blend(im, glow.filter(ImageFilter.GaussianBlur(120)), 0.9); d = ImageDraw.Draw(im)
    # stylised "cover" circle: red/black wedges + cream ring
    cx, cy, r = 1440, 540, 400
    for i in range(20):
        a0, a1 = i * math.pi / 10, (i + 1) * math.pi / 10
        d.pieslice((cx - r, cy - r, cx + r, cy + r), math.degrees(a0), math.degrees(a1), fill=RED if i % 2 else BLACK)
    d.ellipse((cx - 150, cy - 150, cx + 150, cy + 150), fill=CREAM, outline=BLACK, width=10)   # crystal ball
    d.ellipse((cx - 95, cy - 110, cx - 35, cy - 50), fill=(255, 255, 255))
    d.text((cx, cy + 10), '?', font=F('Anton-Regular.ttf', 190), fill=RED, anchor='mm')
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=CREAM, width=14)
    # five "CLASIFICADO" tapes across the circle
    tape = F('BebasNeue-Regular.ttf', 54)
    for k, (ang, dx, dy) in enumerate([(-24, -60, -260), (18, 120, -175), (-10, -170, 205), (22, 90, 290), (70, 250, 40)]):
        t = Image.new('RGBA', (560, 80), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
        td.rectangle((0, 0, 560, 80), fill=(28, 26, 24, 240)); td.rectangle((0, 0, 560, 80), outline=(240, 200, 60), width=5)
        td.text((280, 42), 'CLASIFICADO · CLASIFICADO', font=tape, fill=(240, 200, 60), anchor='mm')
        t = t.rotate(ang, expand=True, resample=Image.BICUBIC)
        im.paste(t, (cx + dx - t.width // 2, cy + dy - t.height // 2), t)
    d = ImageDraw.Draw(im)
    # headline
    d.text((70, 60), 'LAS 5', font=F('Anton-Regular.ttf', 230), fill=CREAM)
    d.text((70, 330), 'QUE NADIE', font=F('Anton-Regular.ttf', 150), fill=CREAM)
    d.text((70, 510), 'EXPLICA', font=F('Anton-Regular.ttf', 150), fill=RED)
    # stamp
    st = Image.new('RGBA', (560, 130), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    sd.rectangle((6, 6, 554, 124), outline=RED, width=10); sd.text((280, 68), 'PORTADA 2027', font=F('Anton-Regular.ttf', 84), fill=RED, anchor='mm')
    st = st.rotate(-6, expand=True, resample=Image.BICUBIC); im.paste(st, (70, 720), st)
    # Javi (channel logo) bottom-left of the circle
    lg = Image.open(LOGO).convert('RGBA').resize((300, 300)); m = Image.new('L', (300, 300), 0); ImageDraw.Draw(m).ellipse((0, 0, 299, 299), fill=255)
    im.paste(lg, (880, 740), m); ImageDraw.Draw(im).ellipse((880, 740, 1179, 1039), outline=CREAM, width=8)
    im.save(os.path.join(OUT, 'miniatura_AO003_largo.jpg'), quality=92); return im

def end_card(th):
    W, H = 1080, 1920; im = Image.new('RGB', (W, H), (15, 15, 15)); d = ImageDraw.Draw(im)
    top = 300   # TikTok/Reels: top ~230 px covered by UI
    # fake YouTube watch page
    t = th.resize((1080, 608)); im.paste(t, (0, top))
    d.rectangle((0, top + 600, 1080, top + 608), fill=(80, 80, 80)); d.rectangle((0, top + 600, 90, top + 608), fill=(255, 0, 0))
    d.rounded_rectangle((900, top + 548, 1062, top + 592), radius=8, fill=(0, 0, 0)); d.text((981, top + 570), '18:47', font=F('Nunito-Black.ttf', 30), fill='white', anchor='mm')
    y = top + 640
    d.text((40, y), 'Las 5 PROFECÍAS de The Economist 2027', font=F('Nunito-Black.ttf', 46), fill='white')
    d.text((40, y + 60), 'que NADIE te está explicando', font=F('Nunito-Black.ttf', 46), fill='white')
    d.text((40, y + 130), 'Próximamente · Expediente 003', font=F('Nunito-Black.ttf', 32), fill=(170, 170, 170))
    lg = Image.open(LOGO).convert('RGBA').resize((90, 90)); m = Image.new('L', (90, 90), 0); ImageDraw.Draw(m).ellipse((0, 0, 89, 89), fill=255)
    im.paste(lg, (40, y + 195), m)
    d.text((150, y + 205), 'Archivo Oscuro', font=F('Nunito-Black.ttf', 38), fill='white')
    d.text((150, y + 250), 'Expedientes reales', font=F('Nunito-Black.ttf', 28), fill=(170, 170, 170))
    d.rounded_rectangle((760, y + 205, 1040, y + 275), radius=35, fill='white'); d.text((900, y + 240), 'Suscribirse', font=F('Nunito-Black.ttf', 32), fill='black', anchor='mm')
    # lock + goal
    y2 = y + 330
    d.rounded_rectangle((40, y2, 1040, y2 + 230), radius=30, fill=(30, 22, 20), outline=RED, width=5)
    d.text((570, y2 + 55), 'SE DESBLOQUEA CON', font=F('Anton-Regular.ttf', 54), fill=CREAM, anchor='mm')
    lx, ly = 300, y2 + 30   # padlock
    d.arc((lx + 6, ly - 22, lx + 42, ly + 18), 180, 360, fill=CREAM, width=7); d.rounded_rectangle((lx, ly, lx + 48, ly + 42), radius=6, fill=CREAM)
    d.text((540, y2 + 130), '1.000 SEGUIDORES', font=F('Anton-Regular.ttf', 86), fill=RED, anchor='mm')
    d.rounded_rectangle((90, y2 + 190, 990, y2 + 212), radius=11, fill=(70, 60, 55))
    im.save(os.path.join(OUT, 'tarjeta_final_reel_base.png'))   # the progress bar fill is animated in the edit
    return im

end_card(thumb())
