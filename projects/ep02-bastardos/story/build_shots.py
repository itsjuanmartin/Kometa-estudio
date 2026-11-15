"""Builds story/shots.json for EP02 (Bastardos sin gloria). Run from the studio root."""
import json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(P, 'timeline', 'sentences.json')))
cfg = json.load(open(os.path.join(P, 'config.json'))); DUR = cfg['duration']
s = lambda k, dt=0.0: ('s', k, dt)
REAL = {34, 39, 51, 70, 83, 97, 106, 134, 144, 155, 169, 175, 201}
VIE, LON, AUS, NOR, INN, THE = (1090, 250), (990, 150), (1700, 790), (1000, 250), (1075, 258), (1095, 222)

PLAN = [
  # ---------- COLD OPEN: D-DAY ----------
  (0,  dict(scene='beachLanding', date='6 JUN 1944 · NORMANDÍA', cam=dict(z0=1.0, z1=1.1), amb=('waves', -22), sfx=[(0.1, 'impact', -10), (0.6, 'gunshot', -18), (1.8, 'impact', -14), (2.9, 'gunshot', -18)])),
  (3,  dict(scene='beachLanding', cam=dict(z0=1.15, z1=1.25, fx=900, fy=800, shake=[dict(at=0.6, d=0.5, amp=14), dict(at=1.8, d=0.5, amp=12)]), sfx=[(0.6, 'impact', -12), (1.8, 'impact', -14), (2.5, 'gunshot', -16)], amb=('waves', -24))),
  (4,  dict(scene='villageStreet', officer=True, ex=[(0, 'neutral'), (s(4, 2.0), 'worried')], cam=dict(z0=1.0, z1=1.08), amb=('wind', -28))),
  (5,  dict(scene='face', who='officer', bg='normandy', expr='determined', talk=True, cam=dict(z0=1.0, z1=1.1))),
  (8,  dict(scene='villageStreet', officer=True, ex=[(0, 'scared')], cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(9), z=1.9, fx=1220, fy=540, d=0.6)]), sfx=[(s(9), 'heartbeat', -12)])),
  (11, dict(scene='face', who='tomiCmd', bg='normandy', expr='worried', ex=[(0, 'worried'), (s(12), 'sad')], cam=dict(z0=1.0, z1=1.15))),
  (13, dict(scene='mapUK', marks=[dict(xy=VIE, label='VIENA', at=0.2)], cam=dict(z0=1.6, z1=1.9, fx=1090, fy=250), sfx=[(0.2, 'pop', -12)])),
  (14, dict(scene='order', cam=dict(z0=1.0, z1=1.15), sfx=[(0.3, 'stinger', -10)])),
  (16, dict(scene='cinema', pill='BASTARDOS SIN GLORIA', pillAt=s(17, 1.2), card=['EXISTIERON', 'DE VERDAD'], cardAt=s(18, 2.0), cardY=520, cam=dict(z0=1.0, z1=1.08), sfx=[(s(18, 2.0), 'stinger', -10)])),
  # ---------- SUBSCRIBE HOOK ----------
  (20, dict(scene='subscribe2', press=s(23, 0.8), sfx=[(0, 'freeze', -10), (0.5, 'pop', -8), (s(23, 0.8), 'ding', -8)])),
  (24, dict(scene='face', who='tomiCmd', bg='normandy', expr='smirk', cam=dict(z0=1.05, z1=1.0), sfx=[(0, 'whoosh', -12)])),
  (26, dict(scene='title2', cam=dict(z0=1.0, z1=1.06), sfx=[(0.2, 'stinger', -8)])),
  # ---------- VIENNA 1938 ----------
  (27, dict(scene='viennaNight', teen=True, date='NOV 1938 · VIENA', ex=[(0, 'neutral'), (s(29), 'worried')], cam=dict(z0=1.0, z1=1.08), amb=('wind', -30))),
  (30, dict(scene='viennaNight', broken=True, fire=True, teen=True, ex=[(0, 'scared')], cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(31), z=1.8, fx=450, fy=1000, d=0.5, until=s(32)), dict(at=s(32), z=1.6, fx=1500, fy=560, d=0.5, until=s(33)), dict(at=s(33), z=1.5, fx=900, fy=700, d=0.5)]), sfx=[(0.2, 'glass', -8), (s(31), 'glass', -10), (s(32), 'impact', -16)])),
  (34, dict(scene='viennaNight', broken=True, fire=True, card=['LA NOCHE DE LOS', 'CRISTALES ROTOS'], cardAt=s(35, 0.3), cardY=300, rphoto=dict(key='kristallnacht', at=s(36), dur=4.2, cap='El día después · noviembre de 1938', credit='Foto: dominio público · Wikimedia Commons'), cam=dict(z0=1.0, z1=1.06))),
  (37, dict(scene='face', who='mom', bg='vienna', expr='cry', cam=dict(z0=1.0, z1=1.12))),
  (38, dict(scene='face', who='tomiTeen', bg='vienna', expr='shocked', cam=dict(z0=1.1, z1=1.2))),
  (39, dict(scene='mapUK', marks=[dict(xy=VIE, label='VIENA', dx=90, dy=30, at=0.2), dict(xy=LON, label='LONDRES', dx=-150, dy=-20, at=1.6)], routes=[dict(pts=[VIE, LON], at=0.8, d=1.6)], card=['≈ 10.000 NIÑOS'], cardAt=s(40, 1.5), cardY=820, rphoto=dict(key='kindertransport', at=s(40, 4.8), dur=5.2, cap='Niños refugiados llegando a Inglaterra · 1938', credit='Foto: Bundesarchiv, CC BY-SA 3.0 · Wikimedia Commons'), cam=dict(z0=1.5, z1=1.7, fx=1040, fy=220), amb=('train', -26))),
  (42, dict(scene='station', act='hug', cam=dict(z0=1.0, z1=1.0, punch=[dict(at=0.4, z=1.5, fx=700, fy=780, d=1.0)]), amb=('train', -24))),
  (43, dict(scene='station', act='hand', cam=dict(z0=1.3, z1=1.4, fx=660, fy=800), amb=('train', -24))),
  (44, dict(scene='trainWindow', cam=dict(z0=1.0, z1=1.08), amb=('train', -20), sfx=[(0, 'whistle', -14)])),
  # ---------- ENGLAND ----------
  (45, dict(scene='london', cam=dict(z0=1.0, z1=1.06), amb=('rain', -26))),
  (46, dict(scene='london', study=True, cam=dict(z0=1.1, z1=1.15, fx=900, fy=800), amb=('rain', -28))),
  (48, dict(scene='mapUK', marks=[dict(xy=NOR, label='EUROPA OCUPADA', dy=-60, at=0.4)], top='1940', cam=dict(z0=1.2, z1=1.4, fx=1080, fy=250), sfx=[(0.4, 'stinger', -12)])),
  (50, dict(scene='knock', open=s(50, 1.6), cam=dict(z0=1.0, z1=1.06), sfx=[(0.2, 'knock', -6)])),
  (51, dict(scene='internment', ex=[(0, 'sad')], cam=dict(z0=1.0, z1=1.08), amb=('wind', -28))),
  (55, dict(scene='mapUK', marks=[dict(xy=LON, at=0.1), dict(xy=AUS, label='AUSTRALIA', at=1.4)], routes=[dict(pts=[LON, (1250, 700), AUS], at=0.3, d=1.6)], cam=dict(z0=1.0, z1=1.1))),
  (56, dict(scene='face', who='tomiTeen', bg='camp', expr='confused', ex=[(0, 'confused'), (s(57, 1.6), 'angry')], cam=dict(z0=1.0, z1=1.12))),
  (58, dict(scene='interview', qs=[['¿HABLAS ALEMÁN?', s(60)], ['¿SABES NADAR?', s(61)], ['¿ODIAS A LOS NAZIS?', s(62)]], ex=[(0, 'confused'), (s(62, 1.5), 'determined')], cam=dict(z0=1.0, z1=1.06), sfx=[(s(60), 'pop', -12), (s(61), 'pop', -12), (s(62), 'pop', -12)])),
  # ---------- X TROOP ----------
  (63, dict(scene='xtroop', date='1942', cam=dict(z0=1.0, z1=1.06), sfx=[(0, 'stamp', -8)], amb=('wind', -30))),
  (70, dict(scene='xtroop', badge=s(73, 1.6), rphoto=dict(key='commando_training', at=s(71), dur=4.0, cap='Comandos aliados entrenando · 1943', credit='Foto: Nationaal Archief, CC0 · Wikimedia Commons'), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(73, 1.6), z=1.3, fx=960, fy=380, d=0.6)]), sfx=[(s(73, 1.6), 'stinger', -8)])),
  (75, dict(scene='face', who='tomiCmd', bg='dark', expr='worried', cam=dict(z0=1.0, z1=1.15))),
  (76, dict(scene='newName', cross=s(76, 1.2), tag=s(79, 0.2), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(76, 1.2), z=1.5, fx=840, fy=420, d=0.6, until=s(79)), dict(at=s(79, 0.2), z=1.5, fx=1520, fy=560, d=0.6)]), sfx=[(s(76, 1.2), 'swish', -10), (s(79, 0.2), 'stamp', -8)])),
  (81, dict(scene='face', who='tomiCmd', bg='dark', expr='thinking')),
  (82, dict(scene='order', cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(84), z=1.4, fx=860, fy=600, d=1.0)]), sfx=[(0.3, 'typewriter', -14), (1.2, 'stamp', -6)])),
  (87, dict(scene='noGerman', cam=dict(z0=1.0, z1=1.1), sfx=[(0.6, 'hit', -10)])),
  # ---------- WALES ----------
  (88, dict(scene='wales', cam=dict(z0=1.0, z1=1.05), amb=('wind', -26))),
  (89, dict(scene='training', act='cliff', amb=('waves', -24))),
  (90, dict(scene='training', act='swim', amb=('waves', -22))),
  (91, dict(scene='training', act='truck', sfx=[(0.8, 'whoosh', -12)])),
  (92, dict(scene='training', act='shoot', cam=dict(z0=1.0, z1=1.06, shake=[dict(at=0.4, d=2.5, amp=4)]), sfx=[(0.3, 'gunshot', -14), (0.9, 'gunshot', -16), (1.5, 'gunshot', -14), (2.1, 'gunshot', -16)])),
  (93, dict(scene='landlady', talk=True, thought=s(96, 1.2), ex=[(0, 'smile'), (s(96, 1.2), 'sad')], cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(96, 1.2), z=1.4, fx=600, fy=420, d=1.2)]), amb=('roomtone', -24))),
  (97, dict(scene='landlady', ex=[(0, 'smile')], cam=dict(z0=1.0, z1=1.08), amb=('roomtone', -24))),
  (100, dict(scene='question2', sfx=[(0.2, 'pop', -8)])),
  # ---------- RITCHIE BOYS ----------
  (103, dict(scene='mapUK', marks=[dict(xy=LON, label='GALES', dy=-50, at=0.2), dict(p='maryland', label='MARYLAND', at=1.2)], routes=[dict(pts=[LON, 'maryland'], at=0.5, d=1.5)], cam=dict(z0=1.0, z1=1.1))),
  (106, dict(scene='ritchie', card=['LOS RITCHIE BOYS'], cardAt=s(109), cardY=820, cam=dict(z0=1.0, z1=1.06))),
  (111, dict(scene='face', who='tomiCmd', bg='wales', expr='smirk', cam=dict(z0=1.0, z1=1.1))),
  (112, dict(scene='subMid2', press=s(113, 0.6), sfx=[(1.4, 'pop', -8), (s(113, 0.6), 'ding', -8)])),
  # ---------- BACK TO D-DAY ----------
  (115, dict(scene='beachLanding', date='6 JUN 1944', rphoto=dict(key='sword_beach', at=s(116), dur=4.5, cap='Desembarco en Sword · 6 de junio de 1944', credit='Foto: dominio público · Wikimedia Commons'), cam=dict(z0=1.0, z1=1.1), amb=('waves', -22), sfx=[(0, 'whoosh', -10), (0.6, 'impact', -14)])),
  (118, dict(scene='face', who='tomiCmd', bg='beach', expr='determined', look=[0.8, -0.2], cam=dict(z0=1.0, z1=1.1))),
  (120, dict(scene='villageStreet', officer=True, ex=[(0, 'nervous')], cam=dict(z0=1.0, z1=1.08), amb=('wind', -28))),
  (123, dict(scene='villageStreet', walk=s(124), walkDur=6, ex=[(0, 'nervous'), (s(125), 'thinking')], cam=dict(z0=1.1, z1=1.2, fx=500, fy=800), sfx=[(s(123), 'heartbeat', -12), (s(124), 'footsteps', -18)])),
  (127, dict(scene='face', who='tomiCmd', bg='normandy', expr='determined', ex=[(0, 'determined'), (s(129), 'angry')], cam=dict(z0=1.0, z1=1.2))),
  (130, dict(scene='villageStreet', walk=-5, walkDur=1, shout=0.05, cam=dict(z0=1.2, z1=1.25, fx=700, fy=700), sfx=[(0, 'hit', -10)])),
  (132, dict(scene='villageStreet', walk=-5, walkDur=1, fire=s(133, 0.6), ex=[(0, 'nervous'), (s(133, 0.6), 'scared')], cam=dict(z0=1.1, z1=1.1, shake=[dict(at=s(133, 0.6), d=1.6, amp=16)]), sfx=[(s(133, 0.6), 'gunshot', -6), (s(133, 0.8), 'gunshot', -8), (s(133, 1.0), 'gunshot', -8), (s(133, 1.3), 'gunshot', -10)])),
  (134, dict(scene='villageStreet', walk=-5, walkDur=1, card=['PETER MASTERS', 'NACIDO EN VIENA'], cardAt=s(135, 2.5), cardY=260, ex=[(0, 'happy')], cam=dict(z0=1.0, z1=1.06))),
  (137, dict(scene='interrogate', notes=s(139), cam=dict(z0=1.0, z1=1.06), amb=('waves', -26))),
  (140, dict(scene='fallen', cam=dict(z0=1.0, z1=1.08), amb=('wind', -26))),
  (144, dict(scene='fallen', medal=s(146, 0.3), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(146, 0.3), z=1.4, fx=960, fy=420, d=0.8)]), sfx=[(s(146, 0.3), 'ding', -10)])),
  # ---------- OPERATION GREENUP ----------
  (147, dict(scene='alps', cam=dict(z0=1.0, z1=1.06), amb=('wind', -24))),
  (149, dict(scene='alps', date='FEB 1945 · ALPES', cam=dict(z0=1.0, z1=1.15, fx=960, fy=500), amb=('wind', -22), sfx=[(0.5, 'plane', -20)])),
  (151, dict(scene='trio', a=0.2, b=s(153), c=s(154), sfx=[(0.2, 'pop', -10), (s(153), 'pop', -10), (s(154), 'pop', -10)])),
  (155, dict(scene='alps', pill='OPERACIÓN GREENUP · OSS', pillAt=s(156, 0.8), cam=dict(z0=1.1, z1=1.2), amb=('wind', -24))),
  (157, dict(scene='messHall', ear=False, cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(159), z=1.6, fx=1400, fy=620, d=0.6)]), amb=('murmur', -24))),
  (159, dict(scene='messHall', ear=True, cam=dict(z0=1.5, z1=1.6, fx=1400, fy=620), amb=('murmur', -26))),
  (160, dict(scene='radio', cam=dict(z0=1.0, z1=1.06), sfx=[(0.2, 'morse', -12), (2.2, 'morse', -14)])),
  (161, dict(scene='gestapo', q=s(165), silent=s(166, 1.0), ex=[(0, 'determined')], cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(166, 0.6), z=1.6, fx=960, fy=640, d=0.8)]), sfx=[(0, 'hit', -8), (s(164), 'hit', -12)])),
  (167, dict(scene='negotiate', cex=[(0, 'angry'), (s(168, 3.0), 'worried')], cam=dict(z0=1.0, z1=1.08))),
  (169, dict(scene='innsbruck', lbl=s(171), cam=dict(z0=1.0, z1=1.06), sfx=[(s(171), 'cheer', -16)])),
  (172, dict(scene='cinema', pill='¿INSPIRÓ A TARANTINO?', pillAt=0.3, cam=dict(z0=1.0, z1=1.06))),
  (174, dict(scene='cinema', year=s(176, 1.0), cam=dict(z0=1.0, z1=1.06))),
  (177, dict(scene='cinema', fiction=s(179, 0.0), cam=dict(z0=1.0, z1=1.08), sfx=[(s(179), 'stamp', -6)])),
  (180, dict(scene='face', who='tomiCmd', bg='ruins', expr='determined', cam=dict(z0=1.0, z1=1.12))),
  # ---------- MAY 1945 ----------
  (182, dict(scene='victory', date='MAYO 1945', tomi=True, cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(185), z=1.6, fx=1600, fy=850, d=0.8)]), amb=('cheer', -22))),
  (186, dict(scene='face', who='tomiCmd', bg='ruins', expr='sad', cam=dict(z0=1.0, z1=1.12))),
  (187, dict(scene='jeepDrive', cam=dict(z0=1.0, z1=1.04), amb=('carpass', -24))),
  (190, dict(scene='jeepDrive', bridge=True, people=True, cam=dict(z0=1.0, z1=1.06), amb=('wind', -26))),
  (193, dict(scene='mapUK', marks=[dict(xy=THE, label='THERESIENSTADT', dy=-50, at=0.2)], cam=dict(z0=1.6, z1=1.9, fx=1095, fy=230))),
  (195, dict(scene='campGate', tomi=True, photo=True, point=s(199), ex=[(0, 'worried'), (s(198), 'sad'), (s(199, 0.4), 'surprised')], cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(197), z=1.6, fx=860, fy=800, d=0.6, until=s(199))]), amb=('wind', -26))),
  (200, dict(scene='reunion', hug=s(200, 3.4), cam=dict(z0=1.0, z1=1.1, fx=1100, fy=700))),
  (201, dict(scene='reunion', hug=-5, card=['MANFRED GANS', '«FREDDIE GRAY»'], cardAt=s(202, 1.5), cardY=240, cam=dict(z0=1.1, z1=1.15, fx=1100, fy=700))),
  (204, dict(scene='family', cam=dict(z0=1.0, z1=1.08), amb=('wind', -30))),
  (209, dict(scene='xtroop', cam=dict(z0=1.0, z1=1.12, fx=960, fy=780), amb=('wind', -30))),
  (214, dict(scene='end2', q=s(215), ex=[(0, 'smile'), (s(216), 'thinking')], sfx=[(s(216, 0.3), 'pop', -12), (s(216, 0.7), 'pop', -12)])),
  (218, dict(scene='end2', q=-99, sub=0.3, press=s(218, 3.0), next=s(219, 0.3), ex=[(0, 'happy')], sfx=[(0.3, 'pop', -8), (s(218, 3.0), 'ding', -8), (s(219, 0.3), 'whoosh', -12)])),
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
INTERIOR = {'knock', 'interview', 'newName', 'order', 'noGerman', 'landlady', 'ritchie', 'messHall', 'radio', 'gestapo', 'negotiate', 'cinema', 'reunion', 'question2'}
prev = None
for sh in shots:
    sc, p = sh['params']['scene'], sh['params']
    if 'amb' not in sh:
        if sc in INTERIOR: sh['amb'] = {"name": "roomtone", "gain": -26}
        elif sc in ('face', 'mapUK') and prev: sh['amb'] = {"name": prev['name'], "gain": prev['gain'] - 3}
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
  {"start": 0, "end": T(20), "mood": "tension", "intensity": 0.85}, {"start": T(20), "end": T(27), "mood": "mystery", "intensity": 0.4},
  {"start": T(27), "end": T(45), "mood": "sad", "intensity": 0.45}, {"start": T(45), "end": T(63), "mood": "mystery", "intensity": 0.45},
  {"start": T(63), "end": T(93), "mood": "action", "intensity": 0.55}, {"start": T(93), "end": T(115), "mood": "hopeful", "intensity": 0.35},
  {"start": T(115), "end": T(140), "mood": "tension", "intensity": 0.8}, {"start": T(140), "end": T(147), "mood": "sad", "intensity": 0.4},
  {"start": T(147), "end": T(169), "mood": "dark", "intensity": 0.6}, {"start": T(169), "end": T(182), "mood": "mystery", "intensity": 0.45},
  {"start": T(182), "end": T(200), "mood": "sad", "intensity": 0.4}, {"start": T(200), "end": DUR, "mood": "hopeful", "intensity": 0.45}]
json.dump({"title": cfg['title'], "duration": DUR, "shots": shots, "music": music, "sfx": []}, open(os.path.join(P, 'story', 'shots.json'), 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots, avg', round(DUR / len(shots), 2), 's')
