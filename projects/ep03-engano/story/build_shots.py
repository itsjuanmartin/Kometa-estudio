"""Builds story/shots.json for EP03 (El gran engaño del Día D). Run from the studio root."""
import json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(P, 'timeline', 'sentences.json')))
cfg = json.load(open(os.path.join(P, 'config.json'))); DUR = cfg['duration']
s = lambda k, dt=0.0: ('s', k, dt)
REAL = {14, 75}
PH = os.path.join(P, 'assets', 'photos')
def ph(key, at, dur, cap, credit):
    return dict(rphoto=dict(key=key, at=at, dur=dur, cap=cap, credit=credit)) if os.path.exists(os.path.join(PH, key + '.jpg')) else {}
PD = 'Foto: dominio público · Wikimedia Commons'
BCN, ANG, VEN = (1000, 300), (1080, 760), (590, 620)
FL = True

PLAN = [
  # ---------- HOOK ----------
  (0,  dict(scene='hookTrue', date='6 JUN 1944 · NORMANDÍA', q=s(0, 2.6), cam=dict(z0=1.0, z1=1.12), amb=('waves', -22), sfx=[(0.1, 'impact', -10), (0.7, 'gunshot', -18), (s(0, 2.6), 'stamp', -8)])),
  (1,  dict(scene='hookTrue', **ph('omaha_lcvp', 0.1, 2.6, 'Desembarco en Omaha · 6 de junio de 1944', 'Foto: Robert F. Sargent, USCG · dominio público'), cam=dict(z0=1.15, z1=1.25, fx=900, fy=800), amb=('waves', -22))),
  (2,  dict(scene='hookTrue', no=s(2, 0.3), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(2, 0.3), z=1.3, fx=960, fy=420, d=0.5)]), sfx=[(s(2, 0.3), 'hit', -8)])),
  (3,  dict(scene='hookTrue', rubber=0, cam=dict(z0=1.0, z1=1.12), sfx=[(0.1, 'whoosh', -10), (s(3, 2.5), 'pop', -10)], amb=('wind', -30))),
  # ---------- INFLATING ----------
  (4,  dict(scene='inflate', date='MAYO 1944 · SUR DE INGLATERRA', **{'from': s(6, 1.0)}, dur=7, tons=s(7, 0.5), rub=s(8, 0.2), ex=[(0, 'neutral'), (s(7), 'confused'), (s(9), 'smirk')], cam=dict(z0=1.0, z1=1.1), amb=('wind', -28), sfx=[(s(6, 1.0), 'whoosh', -16), (s(8, 0.2), 'stamp', -8)])),
  (10, dict(scene='title3', items=[['BALAS', s(11)], ['BOMBAS', s(12)], ['GLOBOS', s(13)]], cam=dict(z0=1.0, z1=1.06), sfx=[(0.2, 'stinger', -8), (s(11, 0.3), 'swish', -14), (s(12, 0.3), 'swish', -14)])),
  (14, dict(scene='face', who='tomiBr', bg='kent', expr='smirk', talk=True, cam=dict(z0=1.0, z1=1.1))),
  # ---------- THE PROBLEM ----------
  (16, dict(scene='invasion', lbl='MESES PREPARANDO LA INVASIÓN', where=s(21, 0.2), cam=dict(z0=1.0, z1=1.08), amb=('waves', -26), sfx=[(s(21, 0.2), 'stinger', -10)])),
  (22, dict(scene='face', who='tomiBr', bg='kent', expr='worried', talk=True)),
  (23, dict(scene='channelMap', wall=0.4, top='MURO ATLÁNTICO', flags=FL, **ph('atlantic_wall', s(24, 1.5), 4.2, 'Búnker del Muro Atlántico · Francia, 1944', 'Foto: Bundesarchiv, CC BY-SA 3.0 DE · Wikimedia Commons'), cam=dict(z0=1.0, z1=1.06))),
  (25, dict(scene='channelMap', flags=FL, marks=[dict(p='calais', label='CALAIS', at=s(26, 1.5), big=True), dict(p='dover', label='DOVER', dy=-46, at=s(26, 1.0))], km=s(27, 0.8), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(26, 1.5), z=1.7, fx=1200, fy=500, d=1.0)]), sfx=[(s(26, 1.5), 'pop', -10), (s(27, 0.8), 'pop', -10)])),
  (28, dict(scene='channelMap', flags=FL, marks=[dict(p='calais', label='CALAIS', at=0, big=True), dict(p='germany', label='ALEMANIA', at=0.6)], arrows=[dict(**{'from': 'calais'}, to='germany', at=0.4, d=1.2, col='#2a2a30')], cam=dict(z0=1.0, z1=1.06))),
  (30, dict(scene='channelMap', flags=FL, wall=0, marks=[dict(p='calais', label='MEJORES DEFENSAS', at=0.6, big=True, size=40)], cam=dict(z0=1.3, z1=1.5, fx=1250, fy=520))),
  (31, dict(scene='channelMap', flags=FL, wall=0, marks=[dict(p='calais', label='CALAIS', at=0), dict(p='normandy', label='NORMANDÍA', dy=60, at=s(31, 2.0), col='#2a8a4a', big=True)], arrows=[dict(**{'from': 'portsmouth'}, to='normandy', at=s(31, 2.2), d=1.4, col='#2a8a4a')], cam=dict(z0=1.0, z1=1.1, fx=900, fy=600), sfx=[(s(31, 2.0), 'pop', -10)])),
  (35, dict(scene='face', who='tomiBr', bg='kent', expr='worried', talk=True, cam=dict(z0=1.0, z1=1.15))),
  (36, dict(scene='channelMap', flags=FL, top='OBJETIVO: QUE HITLER CREA EN CALAIS', topAt=0.3, marks=[dict(p='calais', label='¿CALAIS?', at=0.6, big=True, col='#f2a01a')], arrows=[dict(**{'from': 'dover'}, to='calais', at=0.8, d=1.0, col='#f2a01a')], cam=dict(z0=1.0, z1=1.08))),
  (39, dict(scene='channelMap', flags=FL, marks=[dict(p='normandy', label='NORMANDÍA', at=0)], arrows=[dict(**{'from': 'germany'}, to='normandy', at=0.6, d=2.0, col='#2a2a30', w=16)], cam=dict(z0=1.0, z1=1.1), sfx=[(0.6, 'whoosh', -12)])),
  (40, dict(scene='ikeNote', lbl='GENERAL EISENHOWER', **ph('eisenhower', s(40, 2.5), 4.2, 'Eisenhower con paracaidistas · 5 de junio de 1944', 'Foto: U.S. Army · dominio público'), cam=dict(z0=1.0, z1=1.1), amb=('roomtone', -26))),
  (43, dict(scene='face', who='tomiBr', bg='kent', expr='determined', talk=True)),
  (44, dict(scene='channelMap', flags=FL, top='OPERACIÓN FORTITUDE', marks=[dict(p='kent', label='TÚ', at=0.6)], cam=dict(z0=1.1, z1=1.25, fx=1000, fy=420), sfx=[(0.2, 'stinger', -8)])),
  # ---------- FAKE ARMY ----------
  (45, dict(scene='crew', lbl='PINTORES · CINE · SONIDO', lblAt=s(47), cam=dict(z0=1.0, z1=1.06), amb=('roomtone', -26))),
  (50, dict(scene='channelMap', flags=FL, marks=[dict(p='kent', label='KENT · ESSEX', at=0.5, big=True), dict(p='calais', label='CALAIS', at=s(51))], arrows=[dict(**{'from': 'kent'}, to='calais', at=s(51, 0.3), d=1.0)], cam=dict(z0=1.2, z1=1.4, fx=1100, fy=450))),
  (52, dict(scene='fakeArmy', lbl='UN EJÉRCITO… FALSO', km=True, **ph('dummy_tank', s(53, 1.0), 4.5, 'Tanque Sherman hinchable · Segunda Guerra Mundial', 'Foto: U.S. Army · dominio público'), cam=dict(z0=1.0, z1=1.08), amb=('wind', -28))),
  (55, dict(scene='fakeArmy', boats=True, lbl='LANCHAS DE TELA Y TUBOS', cam=dict(z0=1.05, z1=1.15), amb=('waves', -28))),
  (56, dict(scene='oilDock', empty=s(56, 4.0), cam=dict(z0=1.0, z1=1.1), amb=('waves', -28), sfx=[(s(56, 4.0), 'stamp', -8)])),
  (57, dict(scene='tricks', mode='tracks', cam=dict(z0=1.0, z1=1.05), amb=('wind', -28))),
  (59, dict(scene='tricks', mode='fires', amb=('wind', -28))),
  (60, dict(scene='tricks', mode='laundry', amb=('wind', -28))),
  (61, dict(scene='fakeArmy', aerial=True, cam=dict(z0=1.0, z1=1.15), sfx=[(0.2, 'plane', -18)])),
  (63, dict(scene='face', who='tomiBr', bg='kent', expr='thinking', talk=True)),
  (65, dict(scene='radioRoom', at=s(68, 0.3), listen=s(69, 0.5), cam=dict(z0=1.0, z1=1.06), amb=('radio', -26), sfx=[(s(69, 0.5), 'stinger', -12)])),
  (70, dict(scene='fusag', ghost=s(72, 0.3), cam=dict(z0=1.0, z1=1.08), sfx=[(s(72, 0.3), 'stamp', -8)])),
  (74, dict(scene='patton', lbl='GENERAL GEORGE PATTON', ex=[(0, 'angry')], **ph('patton', s(74, 2.2), 3.5, 'George S. Patton · 1944', 'Foto: U.S. Army · dominio público'), cam=dict(z0=1.0, z1=1.1), sfx=[(0.2, 'stinger', -8)])),
  (75, dict(scene='patton', slap=s(76, 1.0), pose='point', ex=[(0, 'angry')], cam=dict(z0=1.0, z1=1.06), sfx=[(s(76, 3.5), 'hit', -8)])),
  (77, dict(scene='channelMap', flags=FL, marks=[dict(p='kent', label='PATTON', at=0.4, big=True), dict(p='calais', label='CALAIS', at=1.0)], arrows=[dict(**{'from': 'kent'}, to='calais', at=1.5, d=1.2, col='#f2a01a')], cam=dict(z0=1.2, z1=1.4, fx=1100, fy=460))),
  (78, dict(scene='inflate', **{'from': 0}, dur=4, ex=[(0, 'smirk')], cam=dict(z0=1.1, z1=1.2, fx=900, fy=700), amb=('wind', -28))),
  (79, dict(scene='norway', lbl='OTRO EJÉRCITO FALSO: ESCOCIA → NORUEGA', wait=s(82), cam=dict(z0=1.0, z1=1.08), sfx=[(0.6, 'whoosh', -14)])),
  (83, dict(scene='face', who='tomiBr', bg='kent', expr='smirk', talk=True)),
  # ---------- DOUBLE CROSS ----------
  (84, dict(scene='face', who='german', bg='office', expr='thinking', cam=dict(z0=1.0, z1=1.12))),
  (87, dict(scene='doubleCross', turn=s(90, 1.0), lbl=s(92), cam=dict(z0=1.0, z1=1.06), amb=('roomtone', -26), sfx=[(s(92), 'stamp', -8)])),
  (94, dict(scene='face', who='tomiBr', bg='kent', expr='surprised', talk=True)),
  (95, dict(scene='face', who='garbo', bg='dark', expr='smirk', cam=dict(z0=1.1, z1=1.0), sfx=[(0.1, 'stinger', -10)])),
  # ---------- GARBO ----------
  (97, dict(scene='garboIntro', lbl='JUAN PUJOL GARCÍA', hates=s(99, 1.0), **ph('garbo', s(98, 0.4), 4.0, 'Juan Pujol García, «Garbo»', PD), cam=dict(z0=1.0, z1=1.06))),
  (100, dict(scene='rejected', nos=[s(102, 0.3), s(104, 0.3)], ex=[(0, 'smile'), (s(102, 0.4), 'sad'), (s(104, 0.4), 'angry')], cam=dict(z0=1.0, z1=1.06), sfx=[(s(102, 0.3), 'stamp', -6), (s(104, 0.3), 'stamp', -6)])),
  (105, dict(scene='face', who='garbo', bg='office', expr='smirk', cam=dict(z0=1.0, z1=1.15), sfx=[(0.2, 'ding', -12)])),
  (108, dict(scene='abwehr', at=s(110), lbl='EL ESPÍA QUE IBA A ENGAÑAR A LOS ALEMANES', lblAt=0.4, cam=dict(z0=1.0, z1=1.06), amb=('roomtone', -26))),
  (111, dict(scene='lisbon', at=s(113, 1.5), lbl='DESDE LISBOA… «DESDE INGLATERRA»', lblAt=s(113), ex=[(0, 'smirk')], cam=dict(z0=1.0, z1=1.08))),
  (114, dict(scene='wineError', err=s(115, 3.0), believe=s(116, 0.2), cam=dict(z0=1.0, z1=1.06), sfx=[(s(116, 0.7), 'stamp', -8)])),
  (117, dict(scene='london', code=s(120, 2.5), cam=dict(z0=1.0, z1=1.06), sfx=[(s(120, 2.5), 'stamp', -6)])),
  (121, dict(scene='london', code=0, harris=s(121, 3.0), cam=dict(z0=1.05, z1=1.15, fx=1100, fy=600))),
  (124, dict(scene='network', agents=[['Soldado charlatán', s(127)], ['Funcionario descontento', s(128)], ['Marinero', s(129)], ['Secretaria', s(130)]], many=s(131, 1.0), cam=dict(z0=1.0, z1=1.06), sfx=[(s(127), 'pop', -12), (s(128), 'pop', -12), (s(129), 'pop', -12), (s(130), 'pop', -12)])),
  (133, dict(scene='widow', cond=s(138, 0.2), pension=s(138, 1.8), ghost=s(139, 0.5), cam=dict(z0=1.0, z1=1.06), sfx=[(s(139, 0.5), 'stamp', -6)])),
  (140, dict(scene='berlinHappy', stamp=s(143, 0.5), cam=dict(z0=1.0, z1=1.06), sfx=[(s(143, 0.5), 'stamp', -6)])),
  (144, dict(scene='araceli', threat=s(146, 0.3), play=s(147, 0.8), ex=[(0, 'sad'), (s(146), 'angry'), (s(147, 1.5), 'scared')], cam=dict(z0=1.0, z1=1.06))),
  (149, dict(scene='face', who='tomiBr', bg='kent', expr='smile', talk=True)),
  # ---------- COMMENT ASK ----------
  (150, dict(scene='vote3', a=s(151), b=s(152), one=s(153), ex=[(0, 'smile')], cam=dict(z0=1.0, z1=1.04), sfx=[(s(151), 'pop', -8), (s(152), 'pop', -8), (s(153), 'ding', -10)])),
  (154, dict(scene='face', who='tomiBr', bg='kent', expr='determined', talk=True, cam=dict(z0=1.0, z1=1.15), sfx=[(0.2, 'heartbeat', -14)])),
  # ---------- D-DAY ----------
  (155, dict(scene='beachLanding', date='6 JUN 1944 · EL DÍA D', cam=dict(z0=1.0, z1=1.1), amb=('waves', -22), sfx=[(0.5, 'impact', -12), (1.5, 'gunshot', -18)])),
  (157, dict(scene='dawnRadio', noAnswer=s(161, 1.0), ex=[(0, 'smirk'), (s(161), 'worried')], cam=dict(z0=1.0, z1=1.08), amb=('radio', -28))),
  (162, dict(scene='beachLanding', cam=dict(z0=1.15, z1=1.25), amb=('waves', -22))),
  (163, dict(scene='face', who='garbo', bg='office', expr='smirk', cam=dict(z0=1.0, z1=1.12))),
  (166, dict(scene='telegram', ats=[s(168, 0.3), s(169, 0.3), s(170, 0.5)], top=s(171), cam=dict(z0=1.0, z1=1.1), sfx=[(s(168, 0.3), 'typewriter', -12), (s(169, 0.3), 'typewriter', -12), (s(170, 0.5), 'typewriter', -12), (s(171), 'stamp', -6)])),
  (172, dict(scene='calaisWait', halt=s(172, 2.0), weeks=s(173, 0.5), cam=dict(z0=1.0, z1=1.06), amb=('waves', -26), sfx=[(s(172, 2.0), 'stamp', -6)])),
  (174, dict(scene='channelMap', flags=FL, wall=0, marks=[dict(p='calais', label='ESPERANDO…', at=0.3, big=True), dict(p='kent', label='GOMA Y CARTÓN', at=s(175, 1.0), col='#f2a01a')], arrows=[dict(**{'from': 'kent'}, to='calais', at=s(175, 1.2), d=1.0, col='#f2a01a')], cam=dict(z0=1.2, z1=1.35, fx=1150, fy=480))),
  (176, dict(scene='invasion', lbl='NORMANDÍA: TIEMPO PARA DESEMBARCAR', cam=dict(z0=1.0, z1=1.1), amb=('waves', -24))),
  (178, dict(scene='face', who='german', bg='office', expr='shocked', cam=dict(z0=1.0, z1=1.15), sfx=[(0.3, 'hit', -10)])),
  # ---------- MEDALS ----------
  (179, dict(scene='medals', a=s(180, 0.5), b=s(181, 0.5), both=s(182, 0.5), cam=dict(z0=1.0, z1=1.08), sfx=[(s(180, 0.5), 'ding', -8), (s(181, 0.5), 'ding', -8), (s(182, 0.5), 'stinger', -8)])),
  (183, dict(scene='face', who='garbo', bg='dark', expr='worried', cam=dict(z0=1.0, z1=1.1))),
  (185, dict(scene='vanish', dead=s(186, 2.0), ve=s(190, 1.0), **ph('garbo_pasaporte', s(191, 0.3), 3.8, 'Pasaporte venezolano de Juan Pujol', 'Foto: Gobierno de Venezuela · dominio público'), cam=dict(z0=1.0, z1=1.06), sfx=[(s(186, 2.0), 'stamp', -8), (s(190, 1.5), 'stamp', -6)])),
  (192, dict(scene='reunion84', cam=dict(z0=1.0, z1=1.08), amb=('waves', -26))),
  # ---------- OUTRO ----------
  (193, dict(scene='closing3', lbl='UNA GUERRA GANADA CON UNA MENTIRA', lblAt=s(194, 0.5), cam=dict(z0=1.0, z1=1.1), amb=('wind', -30))),
  (195, dict(scene='end3', q=0.2, sub=s(198), press=s(198, 1.6), save=s(198, 2.4), ex=[(0, 'smile')], cam=dict(z0=1.0, z1=1.04), sfx=[(s(198, 1.6), 'ding', -8)])),
]

def resolve(v, base):
    if isinstance(v, tuple) and v and v[0] == 's': return round(S[v[1]]['start'] + (v[2] if len(v) > 2 else 0) - base, 3)
    if isinstance(v, dict): return {k: resolve(x, base) for k, x in v.items()}
    if isinstance(v, (list, tuple)): return [resolve(x, base) for x in v]
    return v

shots = []
for i, (k, prm) in enumerate(PLAN):
    start = 0.0 if i == 0 else round(S[k]['start'] - 0.12, 3)
    nk = PLAN[i + 1][0] if i + 1 < len(PLAN) else len(S)
    end = DUR if i == len(PLAN) - 1 else round(S[nk]['start'] - 0.12, 3)
    prm = dict(prm); sfx = list(prm.pop('sfx', [])); amb = prm.pop('amb', None)
    p = resolve(prm, start)
    for r in REAL:
        if k <= r < nk: p['real'] = round(S[r]['start'] - start, 3); sfx.append((s(r), 'stamp', -6))
    sh = {"id": f"s{i + 1:03d}", "start": start, "end": end, "line": ' '.join(x['text'] for x in S[k:nk]), "scene": p['scene'], "params": p,
          "bars": "none", "in": {"type": "cut"}, "captions": False, "sfx": [{"at": resolve(a, start), "name": n, "gain": g} for a, n, g in sfx]}
    if amb: sh['amb'] = {"name": amb[0], "gain": amb[1]}
    shots.append(sh)

# humanising pass (same rules as EP01)
INTERIOR = {'ikeNote', 'crew', 'radioRoom', 'patton', 'doubleCross', 'rejected', 'abwehr', 'lisbon', 'london', 'network', 'berlinHappy', 'araceli', 'dawnRadio', 'vote3'}
prev = None
for sh in shots:
    sc, p = sh['params']['scene'], sh['params']
    if 'amb' not in sh:
        if sc in INTERIOR: sh['amb'] = {"name": "roomtone", "gain": -26}
        elif sc in ('face', 'channelMap', 'telegram', 'wineError', 'widow', 'medals', 'garboIntro', 'vanish') and prev: sh['amb'] = {"name": prev['name'], "gain": prev['gain'] - 3}
    if sh.get('amb'): prev = sh['amb']
    fx = sh['sfx']
    if p.get('date'): fx.append({"at": 0.15, "name": "typewriter", "gain": -16})
    if p.get('card'): fx.append({"at": p.get('cardAt', 0.3), "name": "pop", "gain": -14})
    if p.get('pill'): fx.append({"at": p.get('pillAt', 0) or 0, "name": "blip", "gain": -14})
    if p.get('rphoto'): fx += [{"at": p['rphoto']['at'], "name": "camflash", "gain": -10}, {"at": round(p['rphoto']['at'] + 0.5, 3), "name": "stamp", "gain": -12}]
k = 0
for a, b in zip(shots, shots[1:]):
    if a['scene'] != b['scene'] and 'face' not in (a['scene'], b['scene']) and not any(x['at'] < 0.3 and x['name'] in ('whoosh', 'swish', 'hit', 'impact') for x in b['sfx']):
        k += 1
        if k % 2: b['sfx'].append({"at": 0.0, "name": "swish", "gain": -22})
for sh in shots:
    if sh['params'].get('date'): sh['in'] = {"type": "whip", "dur": 0.35, "dir": 1}
T = lambda k: S[k]['start']
music = [
  {"start": 0, "end": T(10), "mood": "tension", "intensity": 0.8}, {"start": T(10), "end": T(16), "mood": "mystery", "intensity": 0.5},
  {"start": T(16), "end": T(45), "mood": "tension", "intensity": 0.6}, {"start": T(45), "end": T(84), "mood": "mystery", "intensity": 0.45},
  {"start": T(84), "end": T(97), "mood": "dark", "intensity": 0.5}, {"start": T(97), "end": T(144), "mood": "mystery", "intensity": 0.45},
  {"start": T(144), "end": T(155), "mood": "sad", "intensity": 0.4}, {"start": T(155), "end": T(179), "mood": "tension", "intensity": 0.8},
  {"start": T(179), "end": T(193), "mood": "hopeful", "intensity": 0.45}, {"start": T(193), "end": DUR, "mood": "hopeful", "intensity": 0.5}]
json.dump({"title": cfg['title'], "duration": DUR, "shots": shots, "music": music, "sfx": []}, open(os.path.join(P, 'story', 'shots.json'), 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots, avg', round(DUR / len(shots), 2), 's')
