"""tools/fetch_photo.py — find real, freely-licensed photos on Wikimedia Commons and save them with their credit.

  python3 tools/fetch_photo.py search "Mary Celeste"            # list candidates with licence + author
  python3 tools/fetch_photo.py get "File:Mary-celeste briggs01.jpg" --out projects/P/assets/photos --name briggs

Only files whose licence is public domain or Creative Commons (CC0 / CC BY / CC BY-SA) are accepted.
Each download writes <name>.jpg plus <name>.json with title, author, licence and source URL, and appends a line
to CREDITOS.txt in the same folder (paste it into the video description).
"""
import argparse, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'ArchivoOscuroResearch/1.0 (educational video research)'}
FREE = re.compile(r'(public domain|^pd|cc0|cc[ -]by)', re.I)
# authors whose work is often mis-tagged as public domain on Commons (agency-owned copyright): never auto-download
CAUTION = re.compile(r'(robert capa|magnum|getty|associated press|\bAP\b|reuters|corbis)', re.I)


def fetch(url, timeout=60):
    for i in range(6):   # Wikimedia rate-limits bursts: back off on 429/503
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or i == 5: raise
            time.sleep(int(e.headers.get('Retry-After') or 0) or 3 * 2 ** i)


def call(**p):
    p.update(format='json', maxlag=5)
    return json.loads(fetch(API + '?' + urllib.parse.urlencode(p), 30))


def strip(html):
    t = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html or '')).strip()
    h = len(t) // 2
    return t[:h] if len(t) % 2 == 0 and t[:h] == t[h:] else t   # Commons often repeats 'Unknown author'


def info(titles, width=1280):   # 1280 is a standard Wikimedia thumbnail step (non-standard sizes get rate-limited)
    d = call(action='query', titles='|'.join(titles), prop='imageinfo', iiprop='url|extmetadata|size|mime', iiurlwidth=width)
    out = []
    for pg in d['query']['pages'].values():
        if 'imageinfo' not in pg: continue
        ii = pg['imageinfo'][0]; m = ii.get('extmetadata', {})
        lic = strip(m.get('LicenseShortName', {}).get('value', ''))
        out.append({'title': pg['title'], 'license': lic, 'free': bool(FREE.search(lic)),
                    'author': strip(m.get('Artist', {}).get('value', '')) or 'Desconocido',
                    'desc': strip(m.get('ImageDescription', {}).get('value', ''))[:160],
                    'date': strip(m.get('DateTimeOriginal', {}).get('value', '')),
                    'mime': ii.get('mime'), 'size': f"{ii.get('width')}x{ii.get('height')}",
                    'url': ii.get('thumburl') or ii['url'], 'page': ii.get('descriptionurl')})
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('cmd', choices=['search', 'get']); ap.add_argument('q')
    ap.add_argument('--out'); ap.add_argument('--name'); ap.add_argument('--n', type=int, default=12)
    a = ap.parse_args()
    if a.cmd == 'search':
        hits = call(action='query', list='search', srsearch=a.q, srnamespace=6, srlimit=a.n)['query']['search']
        titles = [h['title'] for h in hits if re.search(r'\.(jpe?g|png|tiff?|gif|webp)$', h['title'], re.I)]
        for x in info(titles) if titles else []:
            print(('⚠️' if x['free'] and CAUTION.search(x['author']) else '✅' if x['free'] else '⛔'), x['title'], '|', x['license'], '|', x['author'][:40], '|', x['size'], '|', x['date'][:20])
        return
    if not (a.out and a.name): sys.exit('get needs --out and --name')
    x = info([a.q])
    if not x: sys.exit('not found')
    x = x[0]
    if not x['free']: sys.exit(f"licence not free: {x['license']} — not downloaded")
    if CAUTION.search(x['author']): sys.exit(f"author '{x['author']}' is usually agency-owned despite the tag — not downloaded")
    os.makedirs(a.out, exist_ok=True)
    ext = '.png' if 'png' in (x['mime'] or '') else '.jpg'
    data = fetch(x['url'].replace('://thumb.wikimedia.org/', '://upload.wikimedia.org/').split('?')[0])   # thumb host may be blocked; same path works on upload
    open(os.path.join(a.out, a.name + ext), 'wb').write(data)
    json.dump(x, open(os.path.join(a.out, a.name + '.json'), 'w'), ensure_ascii=False, indent=1)
    with open(os.path.join(a.out, 'CREDITOS.txt'), 'a') as f: f.write(f"{x['title'][5:]} — {x['author']} — {x['license']} — {x['page']}\n")
    print('saved', a.name + ext, '|', x['license'], '|', x['author'])


if __name__ == '__main__':
    main()
