"""tools/music_lib.py — build a local library of licensed film music (Kevin MacLeod / incompetech.com, CC BY 4.0).

  python3 tools/music_lib.py fetch [--per 4]        # download a few tracks for each of our moods into assets/music/<mood>/
  python3 tools/music_lib.py list                   # show what is in the library

Moods match the ones used in story/build_shots.py music plans. Every downloaded track is logged in
assets/music/CREDITOS_MUSICA.txt with the exact attribution line YouTube descriptions need:
  "<Title>" Kevin MacLeod (incompetech.com) · Licensed under Creative Commons: By Attribution 4.0
"""
import argparse, json, os, random, re, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, 'assets', 'music')
UA = {'User-Agent': 'Mozilla/5.0 (video production; music library)'}
CAT = 'https://incompetech.com/music/royalty-free/pieces.json'
MP3 = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/'
# our mood -> required feels (all) + optional preferred feels; avoid = feels that break the mood
MOODS = {
    'mystery': (['Mysterious'], ['Eerie', 'Calming'], ['Humorous', 'Bouncy', 'Aggressive']),
    'tension': (['Suspenseful'], ['Intense', 'Dark'], ['Humorous', 'Bouncy', 'Relaxed']),
    'action': (['Action'], ['Driving', 'Intense'], ['Humorous', 'Relaxed', 'Calming']),
    'wonder': (['Mystical'], ['Bright', 'Uplifting'], ['Dark', 'Aggressive']),
    'hopeful': (['Uplifting'], ['Bright', 'Calming'], ['Dark', 'Eerie', 'Aggressive']),
    'sad': (['Somber'], ['Calming', 'Relaxed'], ['Humorous', 'Bouncy', 'Aggressive']),
    'triumph': (['Epic'], ['Uplifting', 'Bright'], ['Dark', 'Eerie', 'Humorous']),
    'playful': (['Humorous'], ['Bouncy', 'Bright'], ['Dark', 'Eerie']),
    'calm': (['Calming'], ['Relaxed'], ['Dark', 'Aggressive', 'Intense']),
    'dark': (['Dark'], ['Unnerving', 'Eerie'], ['Humorous', 'Bouncy', 'Bright']),
    'epic': (['Epic'], ['Intense', 'Action'], ['Humorous', 'Relaxed']),
}


def get(url, t=60):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t) as r: return r.read()
        except Exception:
            if i == 3: raise
            time.sleep(2 * 2 ** i)


def secs(s):
    try: h, m, x = (int(v) for v in s.split(':')); return h * 3600 + m * 60 + x
    except Exception: return 0


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('cmd', choices=['fetch', 'list']); ap.add_argument('--per', type=int, default=4); ap.add_argument('--seed', type=int, default=7)
    a = ap.parse_args()
    if a.cmd == 'list':
        for m in sorted(os.listdir(LIB)) if os.path.isdir(LIB) else []:
            p = os.path.join(LIB, m)
            if os.path.isdir(p): print(m, '->', ', '.join(sorted(os.listdir(p))))
        return
    cat = json.loads(get(CAT)); rnd = random.Random(a.seed); credits = os.path.join(LIB, 'CREDITOS_MUSICA.txt'); os.makedirs(LIB, exist_ok=True)
    done = set(open(credits, encoding='utf-8').read().splitlines()) if os.path.exists(credits) else set()
    for mood, (need, pref, avoid) in MOODS.items():
        feels = lambda x: {f.strip() for f in (x.get('feel') or '').split(',')}
        pool = [x for x in cat if set(need) <= feels(x) and not (feels(x) & set(avoid)) and 90 <= secs(x.get('length') or '') <= 600]
        pool.sort(key=lambda x: (-len(feels(x) & set(pref)), rnd.random()))
        os.makedirs(os.path.join(LIB, mood), exist_ok=True)
        for x in pool[:a.per]:
            fn = x['filename']; dst = os.path.join(LIB, mood, re.sub(r'[^\w.-]+', '_', fn))
            if not os.path.exists(dst):
                open(dst, 'wb').write(get(MP3 + urllib.parse.quote(fn))); time.sleep(1)
            line = f'"{x["title"]}" Kevin MacLeod (incompetech.com) · Licensed under Creative Commons: By Attribution 4.0 · {mood}'
            if line not in done:
                with open(credits, 'a', encoding='utf-8') as f: f.write(line + '\n')
                done.add(line)
            print(mood, '<-', x['title'], x['length'], x.get('feel'))


if __name__ == '__main__':
    main()
