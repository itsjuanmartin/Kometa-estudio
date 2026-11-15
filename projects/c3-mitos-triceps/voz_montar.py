"""Une las frases de voz/ con silencios -> audio/voz.wav + timeline/lineas.json."""
import json, subprocess
GAP, LEAD, TAIL = 0.28, 0.35, 1.6
lines = [l for l in open('guion.txt', encoding='utf-8').read().strip().splitlines() if l.strip()]
d = [float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'voz/l{i}.wav']).decode()) for i in range(1, len(lines) + 1)]
t = LEAD; tl = []
for i, (dur, txt) in enumerate(zip(d, lines), 1):
    tl.append({'i': i, 'start': round(t, 3), 'end': round(t + dur, 3), 'text': txt}); t += dur + GAP
json.dump({'lines': tl, 'total': round(t - GAP + TAIL, 2)}, open('timeline/lineas.json', 'w'), ensure_ascii=False, indent=1)
inputs = sum((['-i', f'voz/l{i}.wav'] for i in range(1, len(lines) + 1)), [])
flt = f"aevalsrc=0:d={LEAD}:s=22050[s0];"; seq = "[s0]"
for i in range(len(lines)):
    flt += f"[{i}:a]aresample=22050[a{i}];aevalsrc=0:d={GAP if i < len(lines) - 1 else TAIL}:s=22050[g{i}];"; seq += f"[a{i}][g{i}]"
flt += seq + f"concat=n={2 * len(lines) + 1}:v=0:a=1[out]"
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', flt, '-map', '[out]', 'audio/voz.wav'], check=True)
print([(x['start'], x['end']) for x in tl])
