"""EP04 Bolívar — 5 reels 9:16 cortados del vídeo largo, con la frase de seguir en medio.

  python3 reels.py            # los 5  -> out/shorts/
  python3 reels.py R1 R4      # solo esos

Cada reel: tramo(s) del vídeo largo + la frase «Si te gustan este tipo de historias, síguenos…»
justo después de un momento de suspenso (la imagen sigue moviéndose, con «SÍGUENOS» en pantalla)
+ cierre «La historia completa está en YouTube» con la tarjeta del canal.
Usa el diseño de tools/make_short.py (título arriba, vídeo 4:3 al centro, subtítulos palabra a palabra).
"""
import glob, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, f'{ROOT}/tools'); sys.path.insert(0, HERE)
import make_short as MS
import endscreen as E
from render import find, norm, WORDS

VIDEO = sorted(glob.glob(f'{HERE}/out/*.mp4'), key=os.path.getmtime)[-1]
CTA = f'{HERE}/input/voz_cta_reels.mp3'
CTA_TEXT = 'Si te gustan este tipo de historias, síguenos, que tenemos muchas que seguro no conocías.'
ENDAUDIO = f'{ROOT}/assets/cierres_shorts/audio/cierre_youtube_ystt.mp3'
MUSIC = f'{HERE}/build/music.wav'

# nombre, [(frase de inicio, frase final)], frase tras la que entra la llamada, título, texto de la tarjeta final
REELS = [
    ('R1_hamaca', [('Primer intento. Diciembre de 1815', 'te sirve la cena')], 'en la hamaca de Bolívar',
     'LO APUÑALARON|EN SU HAMACA', '¿Suerte o destino?'),
    ('R2_contrasena', [('Segundo intento. Abril de 1818', 'nunca te fíes de una contraseña')], 'Los dejas pasar',
     'DEJÓ PASAR|A SUS ASESINOS', '¿Te lo habrías perdonado?'),
    ('R3_montana', [('Tercer intento. Y esta vez no es un asesino', 'son sus propias ideas')], 'Tú también',
     'EL PLAN MÁS LOCO|DE BOLÍVAR', '¿Lo habrías seguido?'),
    ('R4_triunfar', [('Cuarto intento. Y este casi lo consigue', 'todavía no han terminado')], 'qué piensa hacer usted ahora',
     'MORIBUNDO…|Y DIJO UNA PALABRA', '¿Qué habrías respondido tú?'),
    ('R5_ventana', [('Bogotá. 25 de septiembre', 'Muera el tirano'), ('Bolívar quiere salir a pelear', 'no eres tú')], 'Por la ventana',
     'LA NOCHE QUE|QUISIERON MATARLO', '¿Ventana o pelear?'),
]


def run(c): subprocess.run(c, check=True)


def end_of(phrase, after):
    """segundo en que termina la última palabra de la frase (primera aparición tras `after`)."""
    s = find(phrase, after); q = norm(phrase)
    i = next(k for k, w in enumerate(WORDS) if abs(w['start'] - s) < 1e-6)
    return WORDS[i + len(q) - 1]['end']


def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))


def follow_png(path):
    """«SÍGUENOS» con flecha, dentro de la zona 4:3 que se ve en el reel."""
    im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype(MS.FB, 92)
    t = 'SÍGUENOS'; bb = d.textbbox((0, 0), t, font=f); w = bb[2] + 220; x = 960 - w / 2; y = 70
    d.rounded_rectangle((x, y, x + w, y + 160), 80, fill=(224, 40, 36, 255), outline=(43, 33, 28, 255), width=9)
    d.text((x + 70, y + 22), t, font=f, fill=(255, 255, 255, 255))
    ax = x + w - 110; d.polygon([(ax, y + 120), (ax + 50, y + 120), (ax + 25, y + 40)], fill=(255, 255, 255, 255))
    d.rectangle((ax + 17, y + 110, ax + 33, y + 135), fill=(255, 255, 255, 255))
    im.save(path)


def build(name, spans, cta_after, title, endq):
    tmp = f'{HERE}/build/reel_{name}'; os.makedirs(tmp, exist_ok=True); os.makedirs(f'{HERE}/out/shorts', exist_ok=True)
    ranges = []; t = 0.0
    for a, b in spans:
        s = find(a, t) - 0.12; e = end_of(b, s) + 0.35; ranges.append((s, e)); t = e
    c = None                                            # punto de corte para la llamada: primera aparición dentro de un tramo
    for s, e in ranges:
        x = end_of(cta_after, s) + 0.25
        if x < e: c = x; break
    k = next(i for i, (s, e) in enumerate(ranges) if s <= c < e)
    pieces = ranges[:k] + [(ranges[k][0], c)], [(c, ranges[k][1])] + ranges[k + 1:]
    cd = dur(CTA) + 0.35
    # 1) trozos 16:9 con audio
    files, words, off = [], [], 0.0
    def cut(s, e, i):
        f = f'{tmp}/p{i}.mov'
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s:.3f}', '-to', f'{e:.3f}', '-i', VIDEO, '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-r', '24',
             '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', '-af', f'afade=t=in:d=0.04,afade=t=out:st={max(0, e - s - 0.08):.3f}:d=0.08', f])
        return f
    i = 0
    for s, e in pieces[0]:
        files.append(cut(s, e, i)); i += 1
        words += [dict(w, start=w['start'] - s + off, end=w['end'] - s + off) for w in WORDS if s - 0.02 <= w['start'] < e - 0.05]; off += e - s
    ref = E.lufs(files[0]) or -14.0; gv = ref - (E.lufs(CTA) or ref) + 0.9   # la llamada suena igual de fuerte que el cuerpo
    # 2) la llamada: el último fotograma sigue con un zoom lento + SÍGUENOS; voz de la llamada + la música de fondo de ese momento
    follow_png(f'{tmp}/follow.png')
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{c - 0.4:.3f}', '-i', VIDEO, '-frames:v', '1', f'{tmp}/still.png'])
    mus = ['-ss', f'{c:.3f}', '-t', f'{cd:.3f}', '-i', MUSIC] if os.path.exists(MUSIC) else ['-f', 'lavfi', '-t', f'{cd:.3f}', '-i', 'anullsrc=r=48000:cl=stereo']
    run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', f'{cd:.3f}', '-i', f'{tmp}/still.png', '-loop', '1', '-t', f'{cd:.3f}', '-i', f'{tmp}/follow.png',
         '-i', CTA, *mus, '-filter_complex',
         f"[0:v]scale=1920:1080,zoompan=z='1+0.0016*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=24[bg];"
         f"[1:v]format=rgba,fade=t=in:st=0:d=0.2:alpha=1[fo];[bg][fo]overlay=0:0[v];"
         f"[2:a]aresample=48000,aformat=channel_layouts=stereo,volume={gv:.2f}dB,apad[va];[3:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.30[ma];[va][ma]amix=inputs=2:duration=shortest:normalize=0,afade=t=in:d=0.05[a]",
         '-map', '[v]', '-map', '[a]', '-t', f'{cd:.3f}', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '24', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', f'{tmp}/cta.mov'])
    files.append(f'{tmp}/cta.mov')
    ct = CTA_TEXT.split(); step = (cd - 0.45) / len(ct)
    words += [dict(word=w, start=off + 0.1 + j * step, end=off + 0.1 + (j + 1) * step) for j, w in enumerate(ct)]; off += cd
    for s, e in pieces[1]:
        files.append(cut(s, e, i)); i += 1
        words += [dict(w, start=w['start'] - s + off, end=w['end'] - s + off) for w in WORDS if s - 0.02 <= w['start'] < e - 0.05]; off += e - s
    open(f'{tmp}/list.txt', 'w').write(''.join(f"file '{os.path.basename(f)}'\n" for f in files))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c', 'copy', f'{tmp}/src169.mov'])
    # 3) vertical + cierre con el diseño de make_short
    logo = os.path.join(ROOT, 'home/logo_ytt.jpg')
    MS.overlay_png(f'{tmp}/overlay.png', title, logo)
    MS.ass_captions(f'{tmp}/cap.ass', words, [(0, off)], 1200)
    fc = ("[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:3,eq=brightness=-0.12[bg];"
          "[b]crop=1440:1080:240:0,scale=1000:750[fg];[bg][fg]overlay=40:550[v1];[v1][1:v]overlay=0:0[v2];"
          f"[v2]subtitles={tmp}/cap.ass:fontsdir={ROOT}/assets/fonts[v]")
    run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/src169.mov', '-i', f'{tmp}/overlay.png', '-filter_complex', fc, '-map', '[v]', '-map', '0:a',
         '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', f'{tmp}/body916.mov'])
    # 4) final animado: el perfil del canal como grabación de pantalla (Seguir -> Siguiendo, toque al enlace de YouTube)
    run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.1', '-i', f'{tmp}/body916.mov', '-frames:v', '1', f'{tmp}/last.png'])
    ed = E.reel_end(f'{tmp}/last.png', endq, f'{tmp}/end.mov', ENDAUDIO, MUSIC, music_ss=ranges[-1][1], ref_lufs=E.lufs(f'{tmp}/body916.mov'))
    open(f'{tmp}/list2.txt', 'w').write("file 'body916.mov'\nfile 'end.mov'\n")
    out = f'{HERE}/out/shorts/YSTT_Bolivar_{name}.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list2.txt', '-c:v', 'libx264', '-crf', '21', '-preset', 'slow', '-tune', 'animation',
         '-pix_fmt', 'yuv420p', '-af', 'alimiter=limit=0.84:level=disabled', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out])
    va = [float(x) for x in subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=duration', '-of', 'csv=p=0', out]).split()]
    assert abs(va[0] - va[1]) < 0.15, f'audio y vídeo desfasados en {name}: {va}'
    print(f'REEL {name}: {off + ed:.1f}s, llamada en {sum(e - s for s, e in pieces[0]):.1f}s -> {out}')
    return out


if __name__ == '__main__':
    want = sys.argv[1:]
    for r in REELS:
        if not want or any(r[0].startswith(w) for w in want): build(*r)
