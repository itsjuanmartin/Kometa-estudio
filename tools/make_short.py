"""tools/make_short.py — cut a 9:16 Short from a finished 16:9 episode.

  python tools/make_short.py --project projects/ep01-guardaespaldas --name torpedo \
      --ranges 0:26.8,498.8:531.3 --title "LÍNEA 1|LÍNEA 2" --end "LÍNEA 1|LÍNEA 2" --endvoice 765.8:768.4

Layout: blurred background, title box on top, the episode cropped to 4:3 in the middle, word-by-word captions
(from timeline/words.json, re-timed to the cut), a brand tag, and a closing card that sends viewers to the channel.
"""
import argparse, json, os, subprocess, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FB = os.path.join(ROOT, 'assets/fonts/Fredoka-Bold.ttf'); FN = os.path.join(ROOT, 'assets/fonts/Nunito-Black.ttf')
OL, YEL, CREAM, RED = (43, 33, 28), (242, 233, 74), (255, 248, 232), (192, 57, 43)
# channel looks: Y Si Te Tocará (default) and Archivo Oscuro
BRANDS = {'ytt': dict(name='Y SI TE TOCARÁ', title_box=YEL, end_bg=(246, 231, 192), end_rays=(246, 214, 120), hi='&H1AE9F2&', logo='projects/branding/out/logo_800x800.png'),
          'ao': dict(name='ARCHIVO OSCURO', title_box=(242, 236, 220), end_bg=(22, 18, 15), end_rays=(40, 32, 24), hi='&H6ACFFF&', logo='projects/canal2-misterio/kit_v2/logo_800x800.png')}
BR = BRANDS['ytt']


def run(cmd): subprocess.run(cmd, check=True)


def lufs(path, ss=None, to=None):
    """Integrated loudness (LUFS) of a file or of a time range of it."""
    import re
    cmd = ['ffmpeg', '-hide_banner', *(['-ss', str(ss)] if ss is not None else []), *(['-to', str(to)] if to is not None else []), '-i', path, '-vn', '-af', 'loudnorm=print_format=summary', '-f', 'null', '-']
    m = re.search(r'Input Integrated:\s+(-?[\d.]+)', subprocess.run(cmd, capture_output=True, text=True).stderr)
    return float(m.group(1)) if m else None


def match_gain(ref_lufs, path):
    """ffmpeg filter that brings `path` to the loudness of the Short's body (nov 2026: closings sounded ~11 dB quieter)."""
    l = lufs(path)
    if ref_lufs is None or l is None or l < -60: return 'anull'
    return f'volume={ref_lufs - l:.2f}dB,alimiter=limit=0.95:level=disabled'


def box_text(d, lines, cx, y, size, fill, box=None, pad=34, gap=12, font=FB):
    f = ImageFont.truetype(font, size); hs = []
    ws = [d.textbbox((0, 0), l, font=f)[2] for l in lines]
    h = sum(d.textbbox((0, 0), l, font=f)[3] for l in lines) + gap * (len(lines) - 1)
    if box: d.rounded_rectangle((cx - max(ws) / 2 - pad, y - pad, cx + max(ws) / 2 + pad, y + h + pad), radius=40, fill=box, outline=OL, width=8)
    yy = y
    for l, w in zip(lines, ws):
        d.text((cx - w / 2, yy), l, font=f, fill=fill); yy += d.textbbox((0, 0), l, font=f)[3] + gap
    return y + h + pad


def overlay_png(path, title, logo, vertical=False):
    im = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    sz = 56   # compact title: informative without covering the frame
    while sz > 40 and max(d.textbbox((0, 0), l, font=ImageFont.truetype(FB, sz))[2] for l in title.split('|')) > 760: sz -= 2
    tb = box_text(d, title.split('|'), 540, 270 if vertical else 330, sz, OL, box=BR['title_box'], pad=22, gap=8)   # TikTok/Reels safe zone: top ~230 px is covered by the search bar
    if not vertical: d.rounded_rectangle((34, 544, 1046, 1306), radius=18, outline=OL, width=10)
    # channel name: small and see-through. Cropped layout: just under the video frame (the creator's preferred look, nov 2026),
    # well below the captions. Full-frame vertical: under the title, so it never sits on the subtitles.
    tag = Image.new('RGBA', im.size, (0, 0, 0, 0)); td = ImageDraw.Draw(tag); f = ImageFont.truetype(FB, 28)
    tw = td.textbbox((0, 0), BR['name'], font=f)[2]; ls = 40 if logo else 0; x0 = 540 - (tw + ls + (10 if logo else 0)) / 2; ty = tb + 14 if vertical else 1324
    if logo:
        lg = Image.open(logo).convert('RGBA').resize((ls, ls)); m = Image.new('L', (ls, ls), 0); ImageDraw.Draw(m).ellipse((0, 0, ls - 1, ls - 1), fill=160)
        tag.paste(lg, (int(x0), ty), m)
    td.text((x0 + ls + (10 if logo else 0), ty + 4), BR['name'], font=f, fill=(255, 248, 232, 165), stroke_width=3, stroke_fill=(43, 33, 28, 110)); im = Image.alpha_composite(im, tag)
    im.save(path)


def endcard_png(path, lines, logo):
    im = Image.new('RGB', (1080, 1920), BR['end_bg']); d = ImageDraw.Draw(im)
    for i in range(18):  # sunburst
        import math; a0 = i * math.pi / 9; a1 = a0 + math.pi / 18
        d.polygon([(540, 760), (540 + 2000 * math.cos(a0), 760 + 2000 * math.sin(a0)), (540 + 2000 * math.cos(a1), 760 + 2000 * math.sin(a1))], fill=BR['end_rays'])
    if logo:
        lg = Image.open(logo).convert('RGBA').resize((520, 520)); m = Image.new('L', (520, 520), 0); ImageDraw.Draw(m).ellipse((0, 0, 519, 519), fill=255)
        lg = lg.resize((420, 420)); m = m.resize((420, 420)); im.paste(lg, (330, 590), m); d.ellipse((330, 590, 750, 1010), outline=OL, width=12)
    box_text(d, lines.split('|'), 540, 290, 72, OL, box=CREAM)
    # subtle pointer to the long video: small text + a little YouTube-style play badge
    f = ImageFont.truetype(FB, 54); l1, l2 = 'Encuentra la historia completa', 'en YouTube'
    w1 = d.textbbox((0, 0), l1, font=f)[2]; w2 = d.textbbox((0, 0), l2, font=f)[2]; bw, gap = 92, 18
    d.rounded_rectangle((540 - w1 / 2 - 40, 1060, 540 + w1 / 2 + 40, 1230), radius=36, fill=CREAM, outline=OL, width=6)
    d.text((540 - w1 / 2, 1077), l1, font=f, fill=OL)
    x0 = 540 - (w2 + gap + bw) / 2; d.text((x0, 1150), l2, font=f, fill=OL)
    bx = x0 + w2 + gap; d.rounded_rectangle((bx, 1155, bx + bw, 1219), radius=18, fill=(224, 48, 42))
    d.polygon([(bx + 36, 1169), (bx + 36, 1205), (bx + 64, 1187)], fill=(255, 255, 255)); y = 1200
    # the ask ("pedido"): follow + save — works the same on YouTube, TikTok and Instagram
    d.rounded_rectangle((130, y + 50, 510, y + 180), radius=40, fill=(224, 48, 42), outline=OL, width=8)
    f = ImageFont.truetype(FB, 56); w = d.textbbox((0, 0), 'SÍGUENOS', font=f)[2]; d.text((320 - w / 2, y + 82), 'SÍGUENOS', font=f, fill=(255, 255, 255))
    d.rounded_rectangle((540, y + 50, 920, y + 180), radius=40, fill=CREAM, outline=OL, width=8)
    w = d.textbbox((0, 0), 'GUÁRDALO', font=f)[2]; d.text((730 - w / 2, y + 82), 'GUÁRDALO', font=f, fill=OL)
    im.save(path)


def ass_captions(path, words, ranges, y=1200):
    def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f"{h}:{m:02d}:{s:05.2f}"
    head = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\n"
            "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
            "Style: C,Fredoka Light,64,&H00E8F8FF,&H00FFFFFF,&H001C212B,&H00000000,0,0,0,0,100,100,1,0,1,4.5,0,5,80,170,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
    ev, off = [], 0.0
    for a, b in ranges:
        ws = [w for w in words if w['start'] >= a - 0.02 and w['start'] < b - 0.05]
        chunks, cur = [], []
        for w in ws:
            cur.append(w)
            if len(cur) >= 3 or w['word'].rstrip()[-1:] in '.?!…,:': chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for ci, ch in enumerate(chunks):
            nxt = chunks[ci + 1][0]['start'] if ci + 1 < len(chunks) else b
            for i, w in enumerate(ch):
                st = w['start'] - a + off; en = (ch[i + 1]['start'] if i + 1 < len(ch) else min(ch[-1]['end'] + 0.25, nxt)) - a + off
                txt = ' '.join(('{\\c' + BR['hi'] + '}' + x['word'].upper() + '{\\c&H00E8F8FF&}') if j == i else x['word'].upper() for j, x in enumerate(ch))
                ev.append(f"Dialogue: 0,{ts(st)},{ts(max(st + 0.05, en))},C,,0,0,0,,{{\\pos(540,{y})}}{txt}")
        off += b - a
    open(path, 'w', encoding='utf-8').write(head + '\n'.join(ev) + '\n')
    return off


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--name', required=True)
    ap.add_argument('--ranges', required=True); ap.add_argument('--title', required=True); ap.add_argument('--end', required=True)
    ap.add_argument('--endvoice', required=True); ap.add_argument('--video'); ap.add_argument('--endaudio', help='audio file for the closing card (instead of cutting --endvoice from --video)'); ap.add_argument('--logo'); ap.add_argument('--brand', default='ytt', choices=list(BRANDS)); ap.add_argument('--vertical', action='store_true', help='input video is already 9:16 full frame (3D shorts)')
    a = ap.parse_args(); P = a.project
    global BR; BR = BRANDS[a.brand]; a.logo = a.logo or os.path.join(ROOT, BR['logo'])
    video = a.video or sorted(glob.glob(os.path.join(P, 'out', '*.mp4')), key=os.path.getmtime)[-1]
    tmp = os.path.join(P, 'build', 'short_' + a.name); os.makedirs(tmp, exist_ok=True); os.makedirs(os.path.join(P, 'out', 'shorts'), exist_ok=True)
    ranges = [tuple(map(float, r.split(':'))) for r in a.ranges.split(',')]
    words = json.load(open(os.path.join(P, 'timeline', 'words.json')))['words']
    overlay_png(f'{tmp}/overlay.png', a.title, a.logo, a.vertical); endcard_png(f'{tmp}/end.png', a.end, a.logo)
    body = ass_captions(f'{tmp}/cap.ass', words, ranges, 1390 if a.vertical else 1200)
    # 1) cut + join the ranges (16:9)
    parts = []
    for i, (s, e) in enumerate(ranges):
        f = f'{tmp}/p{i}.mov'; run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s), '-to', str(e), '-i', video, '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-c:a', 'pcm_s16le', '-ar', '48000', '-af', 'afade=t=in:d=0.04,afade=t=out:st=%f:d=0.08' % max(0, e - s - 0.08), f]); parts.append(f)
    open(f'{tmp}/list.txt', 'w').write(''.join(f"file '{os.path.basename(x)}'\n" for x in parts))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c', 'copy', f'{tmp}/body169.mov'])
    # 2) vertical body with blurred bg, crop, overlay, captions
    fc = (f"[0:v]scale=1080:1920,setsar=1[b0];[b0][1:v]overlay=0:0[v2];[v2]subtitles={tmp}/cap.ass:fontsdir={ROOT}/assets/fonts[v]") if a.vertical else ("[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:3,eq=brightness=-0.12[bg];"
          "[b]crop=1440:1080:240:0,scale=1000:750[fg];[bg][fg]overlay=40:550[v1];[v1][1:v]overlay=0:0[v2];"
          f"[v2]subtitles={tmp}/cap.ass:fontsdir={ROOT}/assets/fonts[v]")
    run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/body169.mov', '-i', f'{tmp}/overlay.png', '-filter_complex', fc, '-map', '[v]', '-map', '0:a',
         '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'pcm_s16le', '-ar', '48000', f'{tmp}/body916.mov'])
    # 3) closing card: logo + call to action, with the narrator's sign-off line
    es, ee = map(float, a.endvoice.split(':')); ed = ee - es + 0.8
    if a.endaudio: ed = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',a.endaudio]).decode()) + 0.7
    eg = match_gain(lufs(f'{tmp}/body916.mov'), a.endaudio) if a.endaudio else 'anull'
    run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', str(ed), '-i', f'{tmp}/end.png', *(['-t', str(ed), '-i', a.endaudio] if a.endaudio else ['-ss', str(es), '-t', str(ed), '-i', video]),
         '-filter_complex', f"[0:v]scale=1080:1920,zoompan=z='min(zoom+0.0012,1.08)':d=1:s=1080x1920:fps=30,fade=t=in:d=0.25[v];[1:a]{eg},afade=t=out:st={ed - 0.4}:d=0.4[a]",
         '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'pcm_s16le', '-ar', '48000', '-shortest', f'{tmp}/end.mov'])
    open(f'{tmp}/list2.txt', 'w').write("file 'body916.mov'\nfile 'end.mov'\n")
    out = os.path.join(P, 'out', 'shorts', f'short_{a.name}.mp4')
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list2.txt', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out])
    print('SHORT:', out, f'({body + ed:.1f}s)')


if __name__ == '__main__':
    main()
