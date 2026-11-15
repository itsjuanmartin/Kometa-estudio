"""tools/reend_short.py — swap the closing card of a finished Short for the "serie" ending.

  python tools/reend_short.py --in short.mp4 --out new.mp4 --brand ytt --part 2 --of 5 \
      --next "LO RECHAZARON|DOS VECES" --audio cierre_siguiente_parte.mp3 [--vertical]

Keeps the body untouched, adds a "PARTE N DE 5" sticker on the title, and appends a new closing card:
CONTINUARÁ… + the next part's title + progress dots + the profile with a SEGUIR button (last part: FIN + YouTube).
"""
import argparse, math, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_short as MS

ROOT = MS.ROOT; FB = MS.FB; OL, CREAM = MS.OL, MS.CREAM
RED, BLUE, WHITE = (224, 48, 42), (0, 149, 246), (255, 255, 255)


def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())


def card_start(f):
    """The old closing card starts at the last hard cut in the final 9 s (it fades in from a static image)."""
    total = dur(f); st = max(0, total - 9)
    log = subprocess.run(['ffmpeg', '-v', 'info', '-ss', str(st), '-i', f, '-an', '-vf', "select='gt(scene,0.25)',showinfo", '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    ts = [st + float(x) for x in re.findall(r'pts_time:([\d.]+)', log)]
    ts = [t for t in ts if total - t > 1.6]
    if not ts: raise SystemExit(f'no closing card found in {f}')
    return ts[-1] - 0.05


def text_w(d, s, f): return d.textbbox((0, 0), s, font=f)[2]


def sticker(path, part, of, vertical):
    im = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FB, 40); s = f'PARTE {part} DE {of}' if part < of else f'PARTE {of} · FINAL'
    w = text_w(d, s, f); y = 182 if vertical else 242
    pill = Image.new('RGBA', (w + 60, 74), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle((0, 0, w + 59, 73), radius=37, fill=RED, outline=OL, width=6); pd.text((30, 10), s, font=f, fill=WHITE)
    pill = pill.rotate(-4, expand=True, resample=Image.BICUBIC)
    im.alpha_composite(pill, (int(540 - pill.width / 2), y)); im.save(path)


def endcard(path, brand, part, of, nxt):
    BR = MS.BRANDS[brand]; dark = brand == 'ao'
    im = Image.new('RGB', (1080, 1920), BR['end_bg']); d = ImageDraw.Draw(im)
    for i in range(18):
        a0 = i * math.pi / 9; a1 = a0 + math.pi / 18
        d.polygon([(540, 980), (540 + 2200 * math.cos(a0), 980 + 2200 * math.sin(a0)), (540 + 2200 * math.cos(a1), 980 + 2200 * math.sin(a1))], fill=BR['end_rays'])
    last = part >= of
    # 1) stamp: CONTINUARÁ… / FIN
    st = Image.new('RGBA', (1000, 200), (0, 0, 0, 0)); sd = ImageDraw.Draw(st); f = ImageFont.truetype(FB, 110)
    s = 'FIN DE LA SERIE' if last else 'CONTINUARÁ…'
    if last: f = ImageFont.truetype(FB, 92)
    w = text_w(sd, s, f); sd.rounded_rectangle((500 - w / 2 - 40, 20, 500 + w / 2 + 40, 180), radius=26, fill=RED, outline=OL, width=8)
    sd.text((500 - w / 2, 34), s, font=f, fill=WHITE); st = st.rotate(3, expand=True, resample=Image.BICUBIC)
    im.paste(st, (int(540 - st.width / 2), 250), st)
    # 2) what comes next
    if last:
        y = MS.box_text(d, ['HISTORIA COMPLETA', 'EN YOUTUBE'], 540, 520, 76, OL, box=CREAM, pad=30)
    else:
        f2 = ImageFont.truetype(FB, 46); lab = f'PARTE {part + 1} DE {of}:'; w = text_w(d, lab, f2)
        d.text((540 - w / 2, 488), lab, font=f2, fill=CREAM if dark else OL)
        y = MS.box_text(d, nxt.split('|'), 540, 580, 70, OL, box=CREAM, pad=28)
    # 3) progress dots
    r, gap = 26, 34; x0 = 540 - (of * 2 * r + (of - 1) * gap) / 2; yd = y + 50
    for i in range(of):
        cx = x0 + r + i * (2 * r + gap); filled = i < part
        d.ellipse((cx - r, yd - r, cx + r, yd + r), fill=RED if filled else (CREAM if not dark else (60, 50, 42)), outline=OL, width=6)
        if i == part and not last: d.ellipse((cx - r - 10, yd - r - 10, cx + r + 10, yd + r + 10), outline=RED, width=6)
    # 4) the profile + SEGUIR
    lg = Image.open(os.path.join(ROOT, BR['logo'])).convert('RGBA').resize((330, 330)); m = Image.new('L', (330, 330), 0); ImageDraw.Draw(m).ellipse((0, 0, 329, 329), fill=255)
    ly = yd + 80; d.ellipse((540 - 185, ly - 20, 540 + 185, ly + 350), fill=None, outline=RED, width=14)
    im.paste(lg, (375, ly), m); d.ellipse((375, ly, 705, ly + 330), outline=OL, width=8)
    d.ellipse((640, ly + 250, 720, ly + 330), fill=BLUE, outline=WHITE, width=6)
    d.line((680, ly + 270, 680, ly + 310), fill=WHITE, width=9); d.line((660, ly + 290, 700, ly + 290), fill=WHITE, width=9)
    by = ly + 380; f3 = ImageFont.truetype(FB, 64); s = 'SEGUIR'; w = text_w(d, s, f3)
    d.rounded_rectangle((540 - w / 2 - 90, by, 540 + w / 2 + 90, by + 120), radius=30, fill=BLUE, outline=OL, width=8)
    d.text((540 - w / 2, by + 18), s, font=f3, fill=WHITE)
    f4 = ImageFont.truetype(FB, 46)
    lines = ['El link está en mi perfil'] if last else ['La siguiente parte', 'está en mi perfil']
    yy = by + 150
    for l in lines:
        w = text_w(d, l, f4); d.text((540 - w / 2, yy), l, font=f4, fill=CREAM if dark else OL, stroke_width=0); yy += 58
    im.save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True); ap.add_argument('--brand', default='ytt', choices=list(MS.BRANDS))
    ap.add_argument('--part', type=int, required=True); ap.add_argument('--of', type=int, default=5); ap.add_argument('--next', default='')
    ap.add_argument('--audio', required=True); ap.add_argument('--vertical', action='store_true')
    a = ap.parse_args()
    tmp = os.path.splitext(a.out)[0] + '_tmp'; os.makedirs(tmp, exist_ok=True); os.makedirs(os.path.dirname(a.out), exist_ok=True)
    cut = card_start(a.inp)
    sticker(f'{tmp}/sticker.png', a.part, a.of, a.vertical); endcard(f'{tmp}/end.png', a.brand, a.part, a.of, a.next)
    MS.run(['ffmpeg', '-v', 'error', '-y', '-i', a.inp, '-i', f'{tmp}/sticker.png', '-t', f'{cut:.3f}',
            '-filter_complex', '[0:v][1:v]overlay=0:0[v];[0:a]afade=t=out:st=%f:d=0.12[a]' % max(0, cut - 0.12), '-map', '[v]', '-map', '[a]',
            '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', f'{tmp}/body.mp4'])
    ed = dur(a.audio) + 0.9
    MS.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', str(ed), '-i', f'{tmp}/end.png', '-t', str(ed), '-i', a.audio,
            '-filter_complex', f"[0:v]scale=1080:1920,zoompan=z='min(zoom+0.0010,1.06)':d=1:s=1080x1920:fps=30,fade=t=in:d=0.2[v];[1:a]apad,afade=t=out:st={ed - 0.3}:d=0.3[a]",
            '-map', '[v]', '-map', '[a]', '-t', str(ed), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', f'{tmp}/end.mp4'])
    open(f'{tmp}/list.txt', 'w').write("file 'body.mp4'\nfile 'end.mp4'\n")
    MS.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', a.out])
    print('OK', a.out, f'cut at {cut:.2f}s, total {dur(a.out):.1f}s')


if __name__ == '__main__':
    main()
