"""Portada TikTok/IG (1080x1920) del reel AO · Economist 2027, estilo kit_v2."""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
H_ = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(H_))
F = lambda n, s: ImageFont.truetype(os.path.join(ROOT, 'assets/fonts', n), s)
W, H = 1080, 1920; RED, CREAM, GOLD, INK = (214, 40, 36), (238, 230, 214), (255, 206, 40), (12, 10, 9)
im = Image.new('RGB', (W, H), INK)
g = Image.new('RGB', (W, H), INK); ImageDraw.Draw(g).ellipse((40, 820, 1040, 1820), fill=(150, 24, 20)); im = Image.blend(im, g.filter(ImageFilter.GaussianBlur(150)), .85)
d = ImageDraw.Draw(im)
for y in range(0, H, 120): d.line((0, y, W, y), fill=(26, 20, 18), width=1)
def txt(s, x, y, size, fill, font='Anton-Regular.ttf'): d.text((x, y), s, font=F(font, size), fill=fill, stroke_width=8, stroke_fill=INK)
txt('¿ESTA PORTADA', 70, 190, 150, CREAM); txt('PREDICE EL', 70, 360, 150, CREAM); txt('FUTURO?', 70, 530, 190, RED)
# real cover circle
cov = Image.open(os.path.join(H_, 'assets/portada_completa.jpg')).convert('RGB'); sx, sy, sr = 247, 380, 209; r = 400; cx, cy = 560, 1200
c = cov.crop((sx - sr, sy - sr, sx + sr, sy + sr)).resize((sr * 4, sr * 4), Image.LANCZOS).resize((2 * r, 2 * r), Image.LANCZOS).filter(ImageFilter.UnsharpMask(3, 110, 2))
m = Image.new('L', (2 * r, 2 * r), 0); ImageDraw.Draw(m).ellipse((0, 0, 2 * r - 1, 2 * r - 1), fill=255); im.paste(c, (cx - r, cy - r), m)
d = ImageDraw.Draw(im); d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=RED, width=16)
k = 2 * r / (2 * sr)
for (px, py), col, rr in [((283, 512), RED, 70), ((306, 232), GOLD, 62)]:
    X, Y = cx + (px - sx) * k, cy + (py - sy) * k
    for w in range(3): d.ellipse((X - rr * 1.5 - w * 4, Y - rr - w * 3, X + rr * 1.5 + w * 4, Y + rr + w * 3), outline=col, width=7)
# 2027 badge
b = Image.new('RGBA', (430, 190), (0, 0, 0, 0)); bd = ImageDraw.Draw(b); bd.rounded_rectangle((0, 0, 429, 189), radius=26, fill=RED, outline=INK, width=8)
bd.text((215, 98), '2027', font=F('Anton-Regular.ttf', 160), fill=CREAM, anchor='mm'); b = b.rotate(-9, expand=True, resample=Image.BICUBIC); im.paste(b, (640, 700), b)
# stamp
s = Image.new('RGBA', (760, 130), (0, 0, 0, 0)); sd = ImageDraw.Draw(s); sd.rectangle((6, 6, 754, 124), fill=(20, 16, 14, 230), outline=GOLD, width=10)
sd.text((380, 68), 'BINGO DEL APOCALIPSIS', font=F('Anton-Regular.ttf', 74), fill=GOLD, anchor='mm'); s = s.rotate(5, expand=True, resample=Image.BICUBIC)
im.paste(s, (W // 2 - s.width // 2, 1540), s)
d = ImageDraw.Draw(im); d.rounded_rectangle((240, 1720, 840, 1792), radius=36, outline=CREAM, width=4, fill=(14, 12, 11))
d.text((540, 1757), 'ARCHIVO OSCURO · THE ECONOMIST', font=F('SpecialElite-Regular.ttf', 34), fill=CREAM, anchor='mm')
im.save(os.path.join(H_, 'out/portada_reel_economist.jpg'), quality=92)
