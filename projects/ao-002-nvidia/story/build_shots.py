"""Builds story/shots.json for ARCHIVO OSCURO 002 (Nvidia). Run from the studio root."""
import json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(P, 'timeline', 'sentences.json')))
cfg = json.load(open(os.path.join(P, 'config.json'))); DUR = cfg['duration']
s = lambda k, dt=0.0: ('s', k, dt)
HAVE = {f[:-4] for f in os.listdir(os.path.join(P, 'assets', 'photos')) if f.endswith('.jpg')} if os.path.isdir(os.path.join(P, 'assets', 'photos')) else set()
CRED = {'jensen': 'Foto: Oficina de la Presidencia de Taiwán, CC BY 2.0 · Wikimedia Commons', 'nyse': 'Foto: dominio público · Wikimedia Commons', 'capitol': 'Foto: dominio público · Wikimedia Commons','bitcoin_coin': 'Foto: Bits86, CC0 · Wikimedia Commons', 'datacenter': 'Foto: Carl Lender, CC BY 2.0 · Wikimedia Commons',
        'fbi_hq': 'Foto: Tony Webster, CC BY 2.0 · Wikimedia Commons', 'pyongyang': 'Foto: Jan Engelhardt, CC BY-SA 4.0 · Wikimedia Commons',
        'kim_yojong': 'Foto: Departamento de Estado de EE. UU., dominio público', 'un_hq': 'Foto: Jakub Hałun, CC BY 4.0 · Wikimedia Commons'}
def ph(key, at, dur, cap):
    return dict(key=key, at=at, dur=dur, cap=cap, credit=CRED[key]) if key in HAVE else None

PLAN = [
  # ---------- HOOK ----------
  (0,  dict(scene='nvHook', q=s(0, 3.2), no=s(1, 0.1), sfx=[(0.1, 'whoosh', -10), (s(0, 3.2), 'stamp', -6), (s(1, 0.1), 'stamp', -4)], amb=('hum', -30))),
  (3,  dict(scene='who', sfx=[(0.3, 'stinger', -10)])),
  (4,  dict(scene='stockOpen', date='12 NOV 2026', lbl=s(6, 1.0), rphoto=('nyse', s(5, 0.3), 2.4, 'Bolsa de Nueva York'), sfx=[(s(6, 0.4), 'riser', -12), (s(6, 1.0), 'impact', -8)])),
  (8,  dict(scene='pressRelease', years=s(9, 2.0), now=s(10, 0.1), sfx=[(0.3, 'typewriter', -14), (s(9, 2.0), 'stamp', -6), (s(10, 0.1), 'stamp', -6)])),
  (11, dict(scene='noCrisis', a=0.1, b=s(12, 0.1), q=s(13, 0.4), sfx=[(0.4, 'hit', -12), (s(12, 0.4), 'hit', -12), (s(13, 0.4), 'stinger', -8)])),
  # ---------- INTRO ----------
  (14, dict(scene='intro', dark=0.4, title=s(15, 0.1), sfx=[(0.4, 'buzz', -16), (s(15, 0.1), 'impact', -10), (s(15, 0.6), 'stamp', -6)], amb=('roomtone', -24))),
  (16, dict(scene='rules', conf=s(18, 0.1), rum=s(19, 0.1), ex=[(0, 'smile')], sfx=[(s(18, 0.1), 'stamp', -6), (s(19, 0.1), 'stamp', -6)])),
  (20, dict(scene='javi', ex=[(0, 'smirk')], say=[['AL FINAL…', s(20, 2.5)], ['CAMBIA TODO', s(20, 3.2)]], sfx=[(s(20, 3.2), 'stinger', -10)])),
  (21, dict(scene='subscribe', press=s(21, 1.8), rare=s(21, 2.6), sfx=[(0.3, 'pop', -8), (s(21, 1.8), 'ding', -8)])),
  (22, dict(scene='folder', num='EXPEDIENTE Nº 002', lines=['CASO: La caída de Jensen Huang', 'EMPRESA: Nvidia', 'FECHA: 12 · 11 · 2026', 'ESTADO: ABIERTO'], sfx=[(0.3, 'whoosh', -12), (0.6, 'typewriter', -14), (2.6, 'stamp', -6)])),
  # ---------- CH1 ----------
  (23, dict(scene='chapter', n=1, title='EL CHICO QUE LAVABA PLATOS', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (25, dict(scene='journey', fly=s(27, 0.5), kid=s(28, 0.2), sfx=[(s(27, 0.5), 'whoosh', -12)], amb=('wind', -30))),
  (29, dict(scene='diner', sfx=[(0.3, 'roomtone', -20)], amb=('murmur', -30))),
  (30, dict(scene='jensenStage', pose='explain', lbl='INGENIERO ELÉCTRICO', lblAt=0.3, cam=dict(z0=1.1, z1=1.0))),
  (32, dict(scene='diner', booth=True, napkin=s(33, 0.1), sfx=[(s(33, 0.1), 'pop', -10)], amb=('murmur', -30))),
  (34, dict(scene='calendarFlip', months=[['1995', 'X'], ['1997', 'X'], ['2000', '✓']], lbl='CASI QUIEBRA… Y AGUANTA', year='', sfx=[(0.3, 'tick', -10)])),
  (36, dict(scene='jensenStage', pose='wave', lbl='EL HOMBRE DE LA CHAQUETA DE CUERO', lblAt=s(37, 0.1), rphoto=('jensen', s(37, 0.6), 3.2, 'Jensen Huang en un evento público (2023)'), sfx=[(0.2, 'applause', -18)])),
  (39, dict(scene='javi', ex=[(0, 'determined')], say=[['¿QUÉ TIENE', s(39, 4.0)], ['NVIDIA?', s(39, 4.5)]])),
  # ---------- CH2 ----------
  (40, dict(scene='chapter', n=2, title='LA EMPRESA QUE VALE MÁS QUE PAÍSES', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (42, dict(scene='jensenStage', pose='point', lbl='PRIMERO: VIDEOJUEGOS', lblAt=0.2)),
  (44, dict(scene='readers', army=s(47, 0.1), sfx=[(s(47, 0.1), 'whoosh', -10)])),
  (48, dict(scene='valuation', date='6 OCT 2026', sfx=[(0.4, 'riser', -12), (1.8, 'impact', -10)])),
  (52, dict(scene='javi', ex=[(0, 'neutral')], say=[['¿Y A TI', 0.2], ['QUÉ?', 0.6]])),
  (54, dict(scene='basket', nv=s(56, 0.3), pig=s(57, 0.3), sfx=[(s(56, 0.3), 'pop', -8), (s(57, 0.3), 'ding', -12)])),
  (58, dict(scene='chipWar', limit=s(61, 0.5), sfx=[(s(61, 0.5), 'stamp', -6)])),
  (62, dict(scene='javi', ex=[(0, 'smirk')], say=[['QUÉDATE', 0.2], ['CON ESA FECHA', 0.6]], sfx=[(s(63, 0.5), 'stinger', -10)])),
  # ---------- CH3 ----------
  (64, dict(scene='chapter', n=3, title='LA EMPRESA QUE CAMBIÓ DE NOMBRE', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (66, dict(scene='rename', year='2015', grow=s(68, 0.3), swap=s(70, 0.3), sfx=[(s(70, 0.3), 'glitch', -10)])),
  (71, dict(scene='cloud', clients=s(72, 0.5), rphoto=('datacenter', 0.5, 2.6, 'Un centro de datos (imagen de referencia)'), sfx=[(s(72, 0.5), 'pop', -12)])),
  (73, dict(scene='fourDays', badge=s(74, 2.2), sfx=[(s(74, 2.2), 'stinger', -10)])),
  (75, dict(scene='washing', q=s(78, 0.2), sfx=[(0.5, 'whoosh', -12)])),
  (80, dict(scene='javi', ex=[(0, 'determined')], say=[['WASHINGTON', 0.3], ['EMPIEZA A MIRAR', 0.8]])),
  # ---------- CH4 ----------
  (81, dict(scene='chapter', n=4, title='LA MUJER DEL COCHE', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (83, dict(scene='probe', date='SEP 2024', lines=[['Investigación: Megaspeed', 0.6], ['…y una de sus ejecutivas', s(84, 0.2), '#c0392b']], ah=s(85, 0.2), notf=s(86, 0.5), sfx=[(0.6, 'typewriter', -14), (s(85, 0.2), 'camflash', -10)])),
  (87, dict(scene='car', dates=[['JUNIO 2024', s(89, 0.2)], ['MAYO 2025', s(90, 0.2)]], sfx=[(0.2, 'carpass', -16), (s(89, 0.2), 'camflash', -10), (s(90, 0.2), 'camflash', -10)], amb=('city', -30))),
  (92, dict(scene='lawyer', date='AGO 2025', no=s(94, 0.1), move=s(95, 1.0), sfx=[(0.3, 'phonering', -14), (s(94, 0.1), 'stamp', -4), (s(95, 1.0), 'whoosh', -12)])),
  (96, dict(scene='memo', trip=s(98, 2.0), sfx=[(0.5, 'stamp', -6), (s(98, 2.0), 'whoosh', -12)])),
  (100, dict(scene='javi', ex=[(0, 'worried')], say=[['NADIE', s(101)], ['HIZO NADA', s(101, 0.4)]])),
  (104, dict(scene='jensenStage', pose='cheer', lbl='TODO SEGUÍA EN SILENCIO', lblAt=0.3, cam=dict(z0=1.0, z1=1.08))),
  (107, dict(scene='who', sfx=[(0.3, 'stinger', -8)])),
  # ---------- CH5 ----------
  (109, dict(scene='chapter', n=5, title='LA NOTICIA', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (111, dict(scene='papers', date='29 OCT 2026', items=[['NEW YORK TIMES', 'JENSEN HUANG|Y UNA EJECUTIVA|DE MEGASPEED', 0.3]], unc=s(112, 1.0), sfx=[(0.3, 'whoosh', -12), (s(112, 1.0), 'stamp', -6)])),
  (113, dict(scene='papers', items=[['NEW YORK TIMES', 'UN INFORME|LA SEÑALA|COMO ESPÍA', 0.2], ['FINANCIAL TIMES', '«RECLUTADA»|SEGÚN LA|INTELIGENCIA', s(115, 0.2)]], unc=s(115, 1.5), sfx=[(0.2, 'whoosh', -12), (s(115, 0.2), 'whoosh', -12), (s(115, 1.5), 'stamp', -6)])),
  (116, dict(scene='mss', sfx=[(0.3, 'stinger', -12)])),
  (118, dict(scene='whySpy', thoughts=[['¿QUÉ PIENSA?', s(121)], ['¿QUÉ DECIDE?', s(122)], ['¿A QUIÉN ESCUCHA?', s(123)]], honey=s(125, 0.3), sfx=[(s(121), 'pop', -12), (s(122), 'pop', -12), (s(123), 'pop', -12), (s(125, 0.3), 'stinger', -10)])),
  (128, dict(scene='javi', ex=[(0, 'determined')], say=[['FUENTES', s(129, 1.0)], ['ANÓNIMAS', s(129, 1.4)]], unc_=1)),
  (131, dict(scene='twoCapitals', sfx=[(0.5, 'stamp', -6)])),
  (132, dict(scene='rules', conf=-9, rum=0.3, ex=[(0, 'determined')], sfx=[(0.3, 'stamp', -4)])),
  # ---------- COMMENT ASK ----------
  (133, dict(scene='vote', a=s(134, 0.8), b=s(135, 0.4), one=s(136), ex=[(0, 'smile')], sfx=[(s(134, 0.8), 'pop', -8), (s(135, 0.4), 'pop', -8), (s(136), 'ding', -10)])),
  # ---------- CH6 ----------
  (138, dict(scene='chapter', n=6, title='SIETE DÍAS', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (140, dict(scene='day', dayN=8, dayName='DOMINGO', kind='email', adm=s(142, 1.2), sfx=[(0.3, 'blip', -10), (s(142, 1.2), 'stamp', -6)])),
  (143, dict(scene='day', dayN=8, dayName='DOMINGO', kind='board', sfx=[(0.8, 'stamp', -6)])),
  (145, dict(scene='day', dayN=9, dayName='LUNES', kind='call', rphoto=('fbi_hq', s(147, 0.3), 2.6, 'Sede del FBI · Washington D. C.'), sfx=[(0.3, 'phonering', -14)])),
  (149, dict(scene='day', dayN=11, dayName='MIÉRCOLES', kind='paper', mast='NEW YORK TIMES', head='OTRA RELACIÓN|DENTRO DE|NVIDIA', sfx=[(0.3, 'whoosh', -12), (s(152), 'hit', -10)])),
  (154, dict(scene='pressRelease', date='12 NOV 2026', years=s(157, 0.1), now=s(156, 2.0), sfx=[(0.3, 'typewriter', -14), (s(157, 0.1), 'stamp', -6), (s(156, 2.0), 'stamp', -6)])),
  (159, dict(scene='aftermath', suit=s(160, 0.5), sfx=[(s(160, 0.5), 'impact', -10)])),
  (161, dict(scene='closeBell', close=s(163, 0.2), total=s(164, 0.5), sfx=[(0.3, 'riser', -12), (s(164, 0.5), 'impact', -8)])),
  # ---------- CH7 ----------
  (166, dict(scene='chapter', n=7, title='WASHINGTON', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (168, dict(scene='memo', trip=-9, rphoto=('capitol', s(170, 0.2), 3.2, 'Capitolio de los Estados Unidos'), sfx=[(s(170, 0.2), 'camflash', -10)])),
  (173, dict(scene='reactions', a=s(174, 0.5), b=s(175, 0.2), c=s(176, 0.3), sfx=[(s(174, 0.5), 'blip', -10), (s(175, 0.2), 'blip', -10), (s(176, 0.3), 'blip', -10)])),
  (177, dict(scene='scale2', sfx=[(0.3, 'whoosh', -12)])),
  (178, dict(scene='twoCapitals', sg=s(179, 0.5), sfx=[(0.5, 'stamp', -6), (s(179, 0.8), 'stamp', -6)])),
  (180, dict(scene='twoCapitals', sg=-9, passport=0.3, free=s(181, 0.3), sfx=[(s(181, 0.3), 'stamp', -6)])),
  (182, dict(scene='javi', ex=[(0, 'smirk')], say=[['FALTA', s(182, 1.2)], ['DE PRUEBAS', s(182, 1.6)]], sfx=[(s(182, 1.6), 'stinger', -8)])),
  # ---------- CH8 ----------
  (183, dict(scene='chapter', n=8, title='EL GIRO', sfx=[(0.1, 'whoosh', -10), (0.8, 'stamp', -8)])),
  (185, dict(scene='twist', a=0.4, b=s(188, 0.3), unc=s(191, 0.3), sfx=[(0.4, 'stamp', -8), (s(188, 0.3), 'stamp', -8), (s(191, 0.3), 'stamp', -6)])),
  (192, dict(scene='who', sfx=[(0.3, 'heartbeat', -12)])),
  (198, dict(scene='scale2', sfx=[(0.3, 'stinger', -10)])),
  # ---------- WHAT WE KNOW ----------
  (201, dict(scene='board', title='LO QUE SABEMOS HOY', cards=[['CONFIRMADO', s(203), 520, 330, '#c9f0c0'], ['ABIERTO', s(214), 1400, 330, '#ffd0a8']], sfx=[(s(203), 'stamp', -8)])),
  (204, dict(scene='checklist', javi=False, title='CONFIRMADO', gap=120, size=44, items=[['Reconoció que fue infiel', 0.1], ['Renunció tras 33 años', s(205, 0.1)], ['Megaspeed, investigada en EE. UU.', s(206, 0.2)], ['Nvidia: investigación y −30 %', s(207, 0.2)], ['Singapur le prohíbe la entrada', s(208, 0.1)]], sfx=[(0.3, 'pop', -14), (s(205, 0.3), 'pop', -14), (s(206, 0.4), 'pop', -14), (s(207, 0.4), 'pop', -14), (s(208, 0.3), 'pop', -14)])),
  (209, dict(scene='checklist', title='¿POR QUÉ TE IMPORTA?', gap=150, size=48, items=[['Tus ahorros (pensiones y fondos)', s(211, 0.2)], ['La IA que usas cada día', s(212, 0.2)], ['La guerra de chips EE. UU.–China', s(213, 0.2)]], ex=[(0, 'determined')], sfx=[(s(211, 0.2), 'pop', -12), (s(212, 0.2), 'pop', -12), (s(213, 0.2), 'pop', -12)])),
  (214, dict(scene='checklist', javi=False, title='SIGUE ABIERTO', gap=125, size=46, items=[['¿Trabajaba para China?', s(215, 0.1), '!'], ['¿Obtuvo información?', s(216, 0.1), '!'], ['¿Megaspeed se saltó las normas?', s(217, 0.1), '!'], ['¿Qué dirá ante el Congreso?', s(218, 0.1), '!'], ['¿Quién dirigirá Nvidia?', s(219, 0.1), '!']], sfx=[(s(215, 0.1), 'hit', -14), (s(216, 0.1), 'hit', -14), (s(217, 0.1), 'hit', -14), (s(218, 0.1), 'hit', -14), (s(219, 0.1), 'hit', -14)])),
  # ---------- OUTRO ----------
  (220, dict(scene='outro', q=s(221), qText='¿ESPÍA O ESCÁNDALO?', opts=['ESPÍA', 'ESCÁNDALO'], ex=[(0, 'smile'), (s(222), 'smirk')], sfx=[(s(221), 'pop', -10), (s(221, 0.4), 'pop', -12), (s(221, 0.8), 'pop', -12)])),
  (224, dict(scene='outro', open=0.2, ex=[(0, 'determined')], sfx=[(0.2, 'stamp', -6)])),
  (226, dict(scene='outro', sub=0.3, press=s(226, 1.6), ex=[(0, 'smile')], sfx=[(0.3, 'pop', -8), (s(226, 1.6), 'ding', -8)])),
  (228, dict(scene='outro', logo=0.1, ex=[(0, 'happy')], sfx=[(0.1, 'impact', -10)])),
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
    rp = prm.pop('rphoto', None)
    p = resolve(prm, start)
    if rp:
        r = ph(rp[0], resolve(rp[1], start), rp[2], rp[3])
        if r: p['rphoto'] = r; sfx += [(r['at'], 'camflash', -10), (round(r['at'] + 0.5, 3), 'stamp', -12)]
    sh = {"id": f"s{i + 1:03d}", "start": start, "end": end, "line": ' '.join(x['text'] for x in S[k:nk]), "scene": p['scene'], "params": p,
          "bars": "none", "in": {"type": "cut"}, "captions": False, "sfx": [{"at": resolve(a, start), "name": n, "gain": g} for a, n, g in sfx]}
    if amb: sh['amb'] = {"name": amb[0], "gain": amb[1]}
    shots.append(sh)

# ambience carry-over + soft transitions
prev = None
for sh in shots:
    if 'amb' not in sh and prev: sh['amb'] = {"name": prev['name'], "gain": prev['gain'] - 2}
    if sh.get('amb'): prev = sh['amb']
    if sh['params'].get('date'): sh['sfx'].append({"at": 0.15, "name": "typewriter", "gain": -16}); sh['in'] = {"type": "whip", "dur": 0.35, "dir": 1}
k = 0
for a, b in zip(shots, shots[1:]):
    if a['scene'] != b['scene'] and b['in']['type'] == 'cut': b['in'] = {"type": "fade", "dur": 0.25}   # soft dissolve between scenes
    if a['scene'] != b['scene'] and not any(x['at'] < 0.3 and x['name'] in ('whoosh', 'swish', 'hit', 'impact') for x in b['sfx']):
        k += 1
        if k % 2: b['sfx'].append({"at": 0.0, "name": "swish", "gain": -22})
T = lambda k: S[k]['start']
music = [
  {"start": 0, "end": T(14), "mood": "tension", "intensity": 0.8}, {"start": T(14), "end": T(23), "mood": "mystery", "intensity": 0.45},
  {"start": T(23), "end": T(40), "mood": "hopeful", "intensity": 0.35}, {"start": T(40), "end": T(64), "mood": "wonder", "intensity": 0.4},
  {"start": T(64), "end": T(81), "mood": "mystery", "intensity": 0.5}, {"start": T(81), "end": T(109), "mood": "dark", "intensity": 0.55},
  {"start": T(109), "end": T(133), "mood": "tension", "intensity": 0.6}, {"start": T(133), "end": T(138), "mood": "calm", "intensity": 0.3},
  {"start": T(138), "end": T(166), "mood": "tension", "intensity": 0.8}, {"start": T(166), "end": T(183), "mood": "dark", "intensity": 0.55},
  {"start": T(183), "end": T(201), "mood": "mystery", "intensity": 0.6}, {"start": T(201), "end": T(220), "mood": "calm", "intensity": 0.35},
  {"start": T(220), "end": DUR, "mood": "mystery", "intensity": 0.5}]
json.dump({"title": cfg['title'], "duration": DUR, "shots": shots, "music": music, "sfx": []}, open(os.path.join(P, 'story', 'shots.json'), 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots, avg', round(DUR / len(shots), 2), 's · photos:', sorted(HAVE))
