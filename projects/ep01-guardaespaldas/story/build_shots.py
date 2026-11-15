"""Builds story/shots.json for EP01 from the aligned sentences. Run from the studio root:
   python projects/ep01-guardaespaldas/story/build_shots.py
Each PLAN row: (first sentence index, params). A shot lasts until the next row's sentence starts.
Inside params, any value written as ('s', k) or ('s', k, dt) is replaced by the time of sentence k (+dt) relative to the shot start.
"""
import json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(P, 'timeline', 'sentences.json')))
cfg = json.load(open(os.path.join(P, 'config.json')))
DUR = cfg['duration']
s = lambda k, dt=0.0: ('s', k, dt)
REAL = {32, 63, 81, 109, 129, 148, 162, 195, 216, 246, 267, 286}
W2, H2 = 960, 540

PLAN = [
  # ---------------- COLD OPEN ----------------
  (0,  dict(scene='deckOpen', escort=True, date='NOV 1943 · ATLÁNTICO', cam=dict(z0=1.0, z1=1.1, punch=[dict(at=s(2, 2.4), z=1.35, fx=1200, fy=700, d=0.8)]), amb=('waves', -22), sfx=[(0.2, 'shiphorn', -14), (s(2, 1.0), 'radio', -20), (s(2, 3.2), 'riser', -14)])),
  (3,  dict(scene='torpedoClose', flash=0.0, alarm=True, cam=dict(z0=1.25, z1=1.0, fx=900, fy=640, shake=[dict(at=0, d=0.8, amp=18)]), sfx=[(0, 'hit', -6), (0, 'alarm', -10), (0, 'underwater', -8)])),
  (4,  dict(scene='torpedoClose', alarm=True, cam=dict(z0=1.0, z1=1.12, fx=900, fy=620), sfx=[(0, 'underwater', -10), (0.3, 'alarm', -16)])),
  (5,  dict(scene='wakeWide', alarm=True, lbl=s(5, 1.2), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(5, 1.2), z=1.7, fx=560, fy=400, d=1.0)]), sfx=[(0, 'alarm', -14), (s(5, 1.2), 'stinger', -10)], amb=('waves', -22))),
  (6,  dict(scene='deckOpen', alarm=True, run=True, wake=dict(at=0, d=8), ex=[(0, 'surprised')], cam=dict(z0=1.0, z1=1.05, punch=[dict(at=4.0, z=1.6, fx=800, fy=740, d=0.8)]), sfx=[(0.2, 'alarm', -14), (0.4, 'footsteps', -14), (1.5, 'radio', -20), (4.0, 'alarm', -16)], amb=('waves', -24))),
  (7,  dict(scene='deckOpen', alarm=True, wake=dict(at=-8, d=10), cam=dict(z0=1.3, z1=1.4, fx=560, fy=700), sfx=[(0, 'heartbeat', -12)])),
  (9,  dict(scene='water', ship=True, q=s(10), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(10), z=2.2, fx=1660, fy=290, d=1.2)]), sfx=[(0, 'riser', -14)])),
  # ---------------- SUBSCRIBE HOOK ----------------
  (11, dict(scene='subscribe', press=s(14, 0.8), sfx=[(0, 'freeze', -10), (0.5, 'pop', -8), (s(14, 0.8), 'ding', -8)])),
  (15, dict(scene='face', who='tomi', bg='office', expr='smirk', cam=dict(z0=1.05, z1=1.0), sfx=[(0, 'whoosh', -12)])),
  (18, dict(scene='title', cam=dict(z0=1.0, z1=1.06), sfx=[(0.2, 'stinger', -8)])),
  # ---------------- 7 DEC 1941 ----------------
  (19, dict(scene='whExt', date='7 DIC 1941 · WASHINGTON', tomi=True, cam=dict(z0=1.0, z1=1.08), sfx=[(0, 'whoosh', -12), (0.1, 'stamp', -8)], amb=('city', -28))),
  (22, dict(scene='hall', act='yawn', cam=dict(z0=1.0, z1=1.05))),
  (23, dict(scene='phone', cam=dict(z0=1.0, z1=1.25, fx=W2, fy=640), sfx=[(0.3, 'oldphone', -6)])),
  (24, dict(scene='map', smoke=True, marks=[dict(p='hawaii', label='PEARL HARBOR', dx=170, at=0.2), dict(p='washington', label='WASHINGTON', at=0.6)], cam=dict(z0=1.0, z1=1.6, fx=150, fy=470), sfx=[(0.2, 'impact', -10)])),
  (25, dict(scene='face', who='tomi', bg='office', expr='scared', sfx=[(0, 'riser', -16)])),
  (26, dict(scene='briefing', talk=False, ex=[(0, 'neutral')], cam=dict(z0=1.0, z1=1.06))),
  (28, dict(scene='face', who='reilly', bg='office', expr='angry', talk=True, ex=[(0, 'neutral'), (s(29), 'angry')], cam=dict(z0=1.0, z1=1.12), sfx=[(s(29), 'hit', -12)])),
  (30, dict(scene='face', who='tomi', bg='office', expr='worried')),
  (32, dict(scene='miami', flash=True, card=['MIAMI · 1933', '5 DISPAROS'], cardAt=s(33, 1.0), cam=dict(z0=1.0, z1=1.1), sfx=[(s(33, 3.0), 'hit', -10)], amb=('murmur', -24))),
  (34, dict(scene='miami', cam=dict(z0=1.1, z1=1.2, fx=W2, fy=700))),
  (36, dict(scene='bedroom', cam=dict(z0=1.0, z1=1.12, fx=600, fy=600), sfx=[(0, 'clock', -18)])),
  # ---------------- 8 DEC: CAPONE CAR ----------------
  (38, dict(scene='capitol', date='8 DIC 1941', cam=dict(z0=1.0, z1=1.06), sfx=[(0, 'whoosh', -12), (0.1, 'stamp', -8)])),
  (40, dict(scene='garage', reveal=99, agents=True, cam=dict(z0=1.0, z1=1.05))),
  (41, dict(scene='face', who='reilly', bg='office', expr='worried')),
  (44, dict(scene='garage', reveal=s(45, 0.5), tag=s(45, 1.5), glass=s(46), agents=True, cam=dict(z0=1.0, z1=1.08), sfx=[(s(45, 0.5), 'whoosh', -10)])),
  (47, dict(scene='capone', sub=s(49), cam=dict(z0=1.0, z1=1.12, fx=W2, fy=560), sfx=[(s(48), 'stinger', -10), (s(48), 'camflash', -10)])),
  (50, dict(scene='garage', reveal=-5, agents=True, pill='ANÉCDOTA DISCUTIDA', pillAt=s(51), cam=dict(z0=1.0, z1=1.08))),
  (52, dict(scene='face', who='fdr', bg='office', expr='happy', talk=True)),
  (53, dict(scene='carRide', cam=dict(z0=1.0, z1=1.02, punch=[dict(at=s(54), z=1.6, fx=300, fy=500, d=0.3, until=s(55)), dict(at=s(55), z=1.6, fx=1500, fy=420, d=0.3, until=s(56)), dict(at=s(56), z=1.4, fx=W2, fy=700, d=0.3)]), amb=('carpass', -24), sfx=[(s(54), 'swish', -12), (s(55), 'swish', -12), (s(56), 'heartbeat', -14)])),
  (57, dict(scene='capitol', inside=True, quote=s(58, 0.4), cam=dict(z0=1.0, z1=1.08), sfx=[(s(58), 'applause', -20)])),
  (59, dict(scene='map', marks=[dict(p='washington', label='¡GUERRA!', at=0.2)], top='ESTADOS UNIDOS EN GUERRA', cam=dict(z0=1.2, z1=1.35, fx=610, fy=330), sfx=[(0.2, 'impact', -10)])),
  (60, dict(scene='face', who='tomi', bg='office', expr='smirk', cam=dict(z0=1.0, z1=1.08))),
  # ---------------- FORTRESS ----------------
  (61, dict(scene='whExt', night=True, blackout=True, blackoutAt=s(64, 0.6), cam=dict(z0=1.0, z1=1.06), sfx=[(s(62), 'stinger', -12)])),
  (65, dict(scene='whExt', aa=True, cam=dict(z0=1.0, z1=1.0, punch=[dict(at=0.4, z=1.7, fx=200, fy=300, d=0.5, until=2.0), dict(at=2.2, z=1.7, fx=1720, fy=320, d=0.5)]), sfx=[(0.4, 'siren', -18)])),
  (66, dict(scene='tunnel', cam=dict(z0=1.0, z1=1.08, fx=W2, fy=800), sfx=[(0.6, 'whoosh', -14)])),
  (67, dict(scene='bunker', down=s(68), cam=dict(z0=1.0, z1=1.15, fx=W2, fy=850), sfx=[(s(68), 'stinger', -12)])),
  (69, dict(scene='hall', act='drill', cam=dict(z0=1.0, z1=1.04), sfx=[(0, 'siren', -16)])),
  (71, dict(scene='kitchen', cam=dict(z0=1.0, z1=1.06))),
  (72, dict(scene='hall', act='check', cam=dict(z0=1.0, z1=1.1, fx=870, fy=600))),
  (73, dict(scene='face', who='tomi', bg='office', expr='thinking', look=[0.7, 0], cam=dict(z0=1.0, z1=1.12), sfx=[(0, 'riser', -18)])),
  # ---------------- THE SECRET ----------------
  (76, dict(scene='office', act='secret', cam=dict(z0=1.0, z1=1.0, punch=[dict(at=0.6, z=1.7, fx=860, fy=860, d=1.2)]), sfx=[(0.4, 'stinger', -12)])),
  (77, dict(scene='office', act='secret', card=['1921 · POLIO', '39 AÑOS'], cardAt=0.2, cam=dict(z0=1.05, z1=1.1))),
  (79, dict(scene='face', who='fdr', bg='office', expr='determined', cam=dict(z0=1.0, z1=1.08))),
  (81, dict(scene='press', flash=s(83, 1.0), block=s(84, 1.0), cam=dict(z0=1.0, z1=1.06), sfx=[(s(83, 1.0), 'camflash', -8), (s(84, 1.0), 'whoosh', -12)])),
  (85, dict(scene='face', who='tomi', bg='office', expr='smirk', cam=dict(z0=1.1, z1=1.0))),
  (86, dict(scene='carExit', cam=dict(z0=1.0, z1=1.06))),
  (87, dict(scene='braces', lbl=1.5, cam=dict(z0=1.0, z1=1.0, punch=[dict(at=1.2, z=1.7, fx=900, fy=840, d=0.8)]))),
  (88, dict(scene='stage', cam=dict(z0=1.0, z1=1.06), amb=('murmur', -26))),
  (89, dict(scene='office', act='joke', talk=True, ex=[(0, 'happy')], tex=[(0, 'neutral'), (s(91), 'happy')], cam=dict(z0=1.0, z1=1.08))),
  (94, dict(scene='face', who='tomi', bg='office', expr='smile', ex=[(0, 'smile'), (s(95), 'worried')], cam=dict(z0=1.0, z1=1.1))),
  (96, dict(scene='doorShadow', cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(98), z=1.8, fx=900, fy=880, d=1.0)]), sfx=[(s(98), 'pop', -12)])),
  # ---------------- FALA ----------------
  (99, dict(scene='falaIntro', cam=dict(z0=1.0, z1=1.06), sfx=[(0.2, 'ding', -12)])),
  (101, dict(scene='falaMontage', step=0.9, sfx=[(s(102), 'pop', -12), (s(103), 'pop', -12), (s(104), 'pop', -12)])),
  (105, dict(scene='newspaper', sfx=[(0, 'swish', -12)])),
  (108, dict(scene='station', cam=dict(z0=1.0, z1=1.06), amb=('train', -24))),
  (109, dict(scene='falaIntro', file=s(110), cam=dict(z0=1.0, z1=1.06), sfx=[(s(110), 'stamp', -6)])),
  (112, dict(scene='falaChase', hide=True, run=s(115, 1.4), cam=dict(z0=1.0, z1=1.05), sfx=[(s(115, 2.6), 'camflash', -8)])),
  (116, dict(scene='face', who='tomi', bg='office', expr='confused', cam=dict(z0=1.0, z1=1.1))),
  (117, dict(scene='comment', sfx=[(0.2, 'pop', -8)])),
  (119, dict(scene='churchillShip', cam=dict(z0=1.0, z1=1.08), amb=('waves', -24))),
  # ---------------- CHURCHILL ----------------
  (121, dict(scene='whExt', arrive=True, date='22 DIC 1941', cam=dict(z0=1.0, z1=1.06), sfx=[(0, 'whoosh', -12), (0.1, 'stamp', -8), (0.3, 'carpass', -16)])),
  (124, dict(scene='face', who='churchill', bg='office', expr='happy', cam=dict(z0=1.0, z1=1.08))),
  (125, dict(scene='hall', act='churchill', night=True)),
  (127, dict(scene='balcony', date='24 DIC 1941', cam=dict(z0=1.0, z1=1.06), amb=('murmur', -22), sfx=[(0, 'stamp', -8)])),
  (131, dict(scene='balcony', tomi=True, glint=s(135, 0.2), trumpet=s(135, 2.6), ex=[(0, 'nervous'), (s(135, 0.8), 'scared'), (s(135, 2.8), 'confused')], cam=dict(z0=1.1, z1=1.15, fx=1300, fy=800, punch=[dict(at=s(135, 0.2), z=1.6, fx=900, fy=870, d=0.3)]), amb=('murmur', -22), sfx=[(s(132), 'heartbeat', -14), (s(135, 0.2), 'shimmer', -10)])),
  (136, dict(scene='face', who='tomi', bg='night', expr='happy', ex=[(0, 'sleepy'), (s(137), 'smile')])),
  (139, dict(scene='face', who='tomi', bg='night', expr='thinking', cam=dict(z0=1.0, z1=1.1))),
  (140, dict(scene='subscribeMid', press=s(141, 0.6), sfx=[(1.4, 'pop', -8), (s(141, 0.6), 'ding', -8)])),
  # ---------------- 1942 ----------------
  (143, dict(scene='map', subs=True, date='1942', top='SUBMARINOS ALEMANES', cam=dict(z0=1.0, z1=1.25, fx=700, fy=420), sfx=[(0, 'stamp', -8)])),
  (146, dict(scene='yacht', x=s(147, 0.4), cam=dict(z0=1.0, z1=1.06), amb=('waves', -24), sfx=[(s(147, 0.4), 'hit', -10)])),
  (149, dict(scene='cabin', sign=s(150), cd=s(151), cam=dict(z0=1.0, z1=1.06), amb=('wind', -28))),
  (152, dict(scene='cabin', hammock=True, cam=dict(z0=1.2, z1=1.3, fx=500, fy=700))),
  (153, dict(scene='face', who='fdr', bg='office', expr='smirk', cam=dict(z0=1.0, z1=1.1))),
  (156, dict(scene='coffee', drop=s(156, 1.4), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(156, 1.2), z=1.5, fx=980, fy=700, d=0.6)]), sfx=[(s(156, 2.9), 'hit', -10)])),
  # ---------------- CASABLANCA FLIGHT ----------------
  (157, dict(scene='map', date='ENERO 1943', marks=[dict(p='washington', at=0.2), dict(p='casablanca', label='CASABLANCA', at=1.5)], routes=[dict(pts=['washington', 'casablanca'], at=0.6, d=2.5)], cam=dict(z0=1.0, z1=1.1), sfx=[(0, 'stamp', -8)])),
  (161, dict(scene='face', who='reilly', bg='office', expr='shocked')),
  (162, dict(scene='planeSky', lbl=s(164), pill='PRIMER PRESIDENTE EN VOLAR', pillAt=s(163, 0.3), amb=('plane', -20))),
  (165, dict(scene='map', marks=[dict(p='washington', at=0), dict(p='miami', at=0.3), dict(p='trinidad', at=0.8), dict(p='belem', at=1.3), dict(p='gambia', at=1.8), dict(p='casablanca', label='CASABLANCA', at=2.3)], routes=[dict(pts=['washington', 'miami', 'trinidad', 'belem', 'gambia', 'casablanca'], at=0.2, d=4.5)], top='VIAJE SECRETO')),
  (169, dict(scene='planeSky', amb=('plane', -20), cam=dict(z0=1.0, z1=1.1))),
  (171, dict(scene='planeIn', sweat=True, ex=[(0, 'scared')], amb=('plane', -22))),
  (172, dict(scene='planeIn', sleep=True, ex=[(0, 'nervous')], amb=('plane', -22), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=0.3, z=1.5, fx=1300, fy=700, d=0.8)]))),
  (173, dict(scene='planeIn', cake=0.6, ex=[(0, 'happy')], amb=('plane', -22), sfx=[(0.6, 'pop', -10)])),
  (174, dict(scene='casablanca', card=s(174, 1.5), cam=dict(z0=1.0, z1=1.06))),
  (175, dict(scene='face', who='tomi', bg='plane', expr='happy', ex=[(0, 'happy'), (s(176), 'worried')])),
  # ---------------- TORPEDO ----------------
  (178, dict(scene='fleet', date='NOV 1943', lbl=0.6, cam=dict(z0=1.0, z1=1.06), amb=('waves', -22), sfx=[(0, 'stamp', -8)])),
  (180, dict(scene='fleet', porter=s(181, 0.2), cam=dict(z0=1.1, z1=1.2, fx=1600, fy=600), amb=('waves', -22))),
  (183, dict(scene='deckDrill', cam=dict(z0=1.0, z1=1.06), sfx=[(0.4, 'impact', -18), (1.0, 'impact', -18), (1.6, 'impact', -18), (2.2, 'impact', -18)], amb=('waves', -24))),
  (186, dict(scene='topDown', turn=99, tdur=6, pill='¡DE TU PROPIO BANDO!', pillAt=s(187, 0.6), sfx=[(s(187, 1.5), 'riser', -12)])),
  (189, dict(scene='torpedoClose', flash=0.0, alarm=True, cam=dict(z0=1.25, z1=1.05, fx=900, fy=640, shake=[dict(at=0, d=0.8, amp=18)]), sfx=[(0, 'hit', -6), (0, 'alarm', -8), (0, 'underwater', -8)])),
  (190, dict(scene='topDown', turn=0.3, tdur=3.5, sfx=[(0, 'alarm', -12), (2.4, 'alarm', -14)])),
  (192, dict(scene='deckOpen', alarm=True, wake=dict(at=-2, d=8), ex=[(0, 'surprised'), (s(193), 'determined')], cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(193), z=1.5, fx=780, fy=760, d=0.6)]), amb=('waves', -22))),
  (195, dict(scene='deckOpen', alarm=True, wake=dict(at=-6, d=10), cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(196, 1.5), z=1.8, fx=560, fy=760, d=0.6)]), amb=('waves', -22), sfx=[(s(196, 1.5), 'heartbeat', -12)])),
  (197, dict(scene='face', who='tomi', bg='deck', expr='nervous', sweat=True, ex=[(0, 'determined'), (s(198), 'nervous'), (s(199), 'scared')])),
  (200, dict(scene='boom', at=0.3, cam=dict(z0=1.0, z1=1.05, shake=[dict(at=0.3, d=1.2, amp=22)]), sfx=[(0.3, 'splash', -4)])),
  (203, dict(scene='fleet', cam=dict(z0=1.0, z1=1.06), amb=('waves', -24))),
  (205, dict(scene='face', who='fdr', bg='deck', expr='smile', cam=dict(z0=1.0, z1=1.08))),
  (206, dict(scene='bunk', ex=[(0, 'thinking'), (s(208), 'worried')], cam=dict(z0=1.0, z1=1.15, fx=760, fy=470))),
  (210, dict(scene='face', who='tomi', bg='bunk', expr='worried', sfx=[(0, 'riser', -16)])),
  # ---------------- TEHRAN ----------------
  (212, dict(scene='tehranExt', date='TEHERÁN · NOV 1943', cam=dict(z0=1.0, z1=1.08), sfx=[(0, 'whoosh', -12), (0.1, 'stamp', -8)])),
  (214, dict(scene='table', cam=dict(z0=1.0, z1=1.06))),
  (215, dict(scene='table', warn=s(215, 1.8), ex=[(0, 'worried')], cam=dict(z0=1.05, z1=1.1), sfx=[(s(215, 1.8), 'stinger', -10)])),
  (217, dict(scene='tehranExt', pill='¿COMPLOT REAL O EXCUSA?', pillAt=s(218), cam=dict(z0=1.0, z1=1.08))),
  (219, dict(scene='waiters', cam=dict(z0=1.0, z1=1.05, punch=[dict(at=s(222, 1.0), z=1.8, fx=560, fy=470, d=0.5, until=s(222, 3.0)), dict(at=s(222, 3.0), z=1.8, fx=1360, fy=470, d=0.5)]), sfx=[(s(222, 1.0), 'swish', -12), (s(222, 3.0), 'swish', -12)])),
  (223, dict(scene='waiters', mic=True, lbl='SE CREE…', lblAt=0.2, cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(224, 0.5), z=2.2, fx=1700, fy=600, d=0.8)]), sfx=[(s(224, 0.5), 'glitch', -14)])),
  (225, dict(scene='face', who='tomi', bg='embassy', expr='determined', cam=dict(z0=1.0, z1=1.1))),
  (228, dict(scene='garden', cam=dict(z0=1.0, z1=1.08), amb=('wind', -30))),
  (230, dict(scene='map', marks=[dict(p='normandy', label='DÍA D', dx=0, dy=-50, at=1.2)], routes=[dict(pts=[(880, 120), 'normandy'], at=1.0, d=1.0)], top='INVADIR FRANCIA · 1944', cam=dict(z0=1.0, z1=1.5, fx=1000, fy=250), sfx=[(1.2, 'impact', -12)])),
  (233, dict(scene='face', who='fdrTired', bg='office', expr='sad', cam=dict(z0=1.0, z1=1.15))),
  # ---------------- 1944–45 ----------------
  (236, dict(scene='tired', date='1944', cam=dict(z0=1.0, z1=1.08), sfx=[(0, 'stamp', -8)])),
  (239, dict(scene='tired', sleep=True, cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(240), z=1.6, fx=960, fy=760, d=0.6)]))),
  (242, dict(scene='face', who='tomi', bg='office', expr='sad')),
  (244, dict(scene='tired', ballot=s(245, 0.2), sfx=[(s(245, 0.2), 'ding', -10)])),
  (248, dict(scene='map', date='FEB 1945', marks=[dict(p='washington', at=0.2), dict(p='yalta', label='YALTA', at=3.0)], routes=[dict(pts=['washington', (1000, 380), 'yalta'], at=0.6, d=3.5)], cam=dict(z0=1.0, z1=1.1), sfx=[(0, 'stamp', -8)])),
  (252, dict(scene='yaltaPhoto', sfx=[(0.1, 'camflash', -14)])),
  (253, dict(scene='face', who='tomi', bg='office', expr='sad', cam=dict(z0=1.0, z1=1.15))),
  # ---------------- WARM SPRINGS ----------------
  (255, dict(scene='warmHouse', date='12 ABRIL 1945', dateDur=4.5, tomi=True, lbl=s(257, 1.5), cam=dict(z0=1.0, z1=1.06), amb=('wind', -30), sfx=[(0, 'stamp', -8)])),
  (261, dict(scene='warmHouse', tomi=True, cam=dict(z0=1.2, z1=1.3, fx=420, fy=800), amb=('wind', -30))),
  (262, dict(scene='painter', cam=dict(z0=1.0, z1=1.08, punch=[dict(at=s(263), z=1.5, fx=500, fy=860, d=0.8)]))),
  (264, dict(scene='face', who='tomi', bg='sunny', expr='thinking', ex=[(0, 'neutral'), (s(265), 'worried'), (s(266), 'scared')], fadeWhite=None)),
  (266, dict(scene='silence', steps=True)),
  (267, dict(scene='silence', card=['12 · ABRIL · 1945'], cardAt=0.3)),
  (272, dict(scene='face', who='tomi', bg='sunny', expr='cry', cam=dict(z0=1.0, z1=1.12))),
  (278, dict(scene='truman', cam=dict(z0=1.0, z1=1.06))),
  (280, dict(scene='face', who='tomi', bg='night', expr='sad', cam=dict(z0=1.0, z1=1.1))),
  # ---------------- FINAL ----------------
  (282, dict(scene='funeralTrain', amb=('train', -22))),
  (284, dict(scene='casket', tomi=True, cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(285), z=1.6, fx=1450, fy=820, d=0.8)]))),
  (286, dict(scene='grave', lbl=s(287, 2.0), cam=dict(z0=1.0, z1=1.08), amb=('wind', -28))),
  (288, dict(scene='face', who='fala', bg='sunny', cam=dict(z0=1.0, z1=1.1))),
  (289, dict(scene='face', who='tomi', bg='night', expr='smile', ex=[(0, 'neutral'), (s(291), 'sad')], cam=dict(z0=1.0, z1=1.12))),
  (292, dict(scene='end', q=s(293), ex=[(0, 'smile'), (s(294), 'smirk')], sfx=[(s(293, 0.3), 'pop', -12), (s(293, 0.7), 'pop', -12), (s(293, 1.1), 'pop', -12)])),
  (296, dict(scene='end', sub=0.3, press=s(296, 3.0), q=-99, cast=s(297), ex=[(0, 'happy')], sfx=[(0.3, 'pop', -8), (s(296, 3.0), 'ding', -8)])),
]

def resolve(v, base):
    if isinstance(v, tuple) and v and v[0] == 's': return round(S[v[1]]['start'] + (v[2] if len(v) > 2 else 0) - base, 3)
    if isinstance(v, dict): return {k: resolve(x, base) for k, x in v.items()}
    if isinstance(v, list): return [resolve(x, base) for x in v]
    if isinstance(v, tuple): return [resolve(x, base) for x in v]
    return v

shots = []
for i, (k, prm) in enumerate(PLAN):
    start = 0.0 if i == 0 else round(S[k]['start'] - 0.12, 3)
    end = DUR if i == len(PLAN) - 1 else round(S[PLAN[i + 1][0]]['start'] - 0.12, 3)
    prm = dict(prm); sfx = prm.pop('sfx', []); amb = prm.pop('amb', None)
    line = ' '.join(x['text'] for x in S[k:(PLAN[i + 1][0] if i + 1 < len(PLAN) else len(S))])
    p = resolve(prm, start)
    # "Esto pasó de verdad" stamp + sound
    for r in REAL:
        nxt = PLAN[i + 1][0] if i + 1 < len(PLAN) else len(S)
        if k <= r < nxt: p['real'] = round(S[r]['start'] - start, 3); sfx = list(sfx) + [(s(r), 'stamp', -6)]
    sh = {"id": f"s{i + 1:03d}", "start": start, "end": end, "line": line, "scene": p['scene'], "params": p, "bars": "none",
          "in": {"type": "cut"}, "captions": False,
          "sfx": [{"at": resolve(a, start), "name": n, "gain": gdb} for a, n, gdb in sfx]}
    if amb: sh["amb"] = {"name": amb[0], "gain": amb[1]}
    shots.append(sh)
# ---------- humanising pass: ambience beds, foley, small UI sounds ----------
INTERIOR = {'hall', 'office', 'briefing', 'kitchen', 'press', 'braces', 'phone', 'coffee', 'falaIntro', 'falaChase', 'doorShadow', 'truman', 'casket', 'painter', 'garage', 'table', 'waiters', 'tired', 'bedroom', 'subscribeMid', 'capitol'}
DAYEXT = {'whExt', 'carExit', 'stage', 'cabin', 'warmHouse', 'tehranExt', 'casablanca', 'title', 'grave', 'end', 'station'}
SEA = {'deckOpen', 'deckDrill', 'fleet', 'boom', 'yacht', 'water', 'wakeWide', 'churchillShip'}
prev_amb = None
for sh in shots:
    sc = sh['params']['scene']; p = sh['params']
    if 'amb' not in sh:
        if sc in SEA: sh['amb'] = {"name": "waves", "gain": -24}
        elif sc in ('planeIn', 'planeSky'): sh['amb'] = {"name": "plane", "gain": -22}
        elif sc in INTERIOR: sh['amb'] = {"name": "roomtone", "gain": -26}
        elif sc in DAYEXT: sh['amb'] = {"name": "wind" if p.get('night') else "city", "gain": -30}
        elif sc in ('balcony', 'garden', 'funeralTrain'): sh['amb'] = {"name": "wind", "gain": -30}
        elif sc in ('face', 'bunk', 'torpedoClose') and prev_amb: sh['amb'] = {"name": prev_amb['name'], "gain": prev_amb['gain'] - 2}
    if sh.get('amb'): prev_amb = sh['amb']
    fx = sh['sfx']
    if p.get('date'): fx.append({"at": 0.15, "name": "typewriter", "gain": -16})
    if p.get('cardAt') is not None or (p.get('card') and sc not in ('miami',)): fx.append({"at": p.get('cardAt', 0.3) if isinstance(p.get('cardAt', 0.3), (int, float)) else 0.3, "name": "pop", "gain": -14})
    if p.get('pill'): fx.append({"at": p.get('pillAt', 0) or 0, "name": "blip", "gain": -14})
    if sc == 'hall' and p.get('act') in ('churchill',): fx.append({"at": 0.2, "name": "footsteps", "gain": -18})
    if sc == 'hall' and p.get('act') == 'drill': fx.append({"at": 0.0, "name": "footsteps", "gain": -14})
    if sc == 'braces': fx.append({"at": 0.3, "name": "footsteps", "gain": -20})
    if sc == 'falaChase' and p.get('run') is not None: fx.append({"at": p['run'], "name": "footsteps", "gain": -16})
    if sc == 'station': fx.append({"at": 1.8, "name": "gasp", "gain": -14})
    if sc == 'balcony' and p.get('glint') is not None: fx.append({"at": p['trumpet'], "name": "gasp", "gain": -16})
    if sc == 'press' and p.get('flash') is not None: fx.append({"at": p['flash'] + 0.2, "name": "gasp", "gain": -18})
    if sc == 'end' and p.get('sub') is not None: fx.append({"at": 0.0, "name": "cheer", "gain": -22})
# soft whoosh on changes between two different non-face scenes (every other one) so cuts feel edited, not abrupt
k = 0
for a, b in zip(shots, shots[1:]):
    if a['params']['scene'] != b['params']['scene'] and 'face' not in (a['params']['scene'], b['params']['scene']) and not any(x['at'] < 0.3 and x['name'] in ('whoosh', 'swish', 'hit') for x in b['sfx']):
        k += 1
        if k % 2: b['sfx'].append({"at": 0.0, "name": "swish", "gain": -22})
# transitions
for sh in shots:
    if sh['params'].get('date'): sh['in'] = {"type": "whip", "dur": 0.35, "dir": 1}
    if sh['params']['scene'] in ('silence',): sh['in'] = {"type": "fade", "dur": 0.8}
music = [
  {"start": 0, "end": 27, "mood": "tension", "intensity": 0.8}, {"start": 27, "end": 51, "mood": "mystery", "intensity": 0.4},
  {"start": 51, "end": 215, "mood": "mystery", "intensity": 0.55}, {"start": 215, "end": 276, "mood": "hopeful", "intensity": 0.35},
  {"start": 276, "end": 426, "mood": "playful", "intensity": 0.45}, {"start": 426, "end": 480, "mood": "action", "intensity": 0.6},
  {"start": 480, "end": 550, "mood": "tension", "intensity": 0.8}, {"start": 550, "end": 617, "mood": "mystery", "intensity": 0.6},
  {"start": 617, "end": 680, "mood": "sad", "intensity": 0.35},
  {"start": 684.2, "end": DUR, "mood": "hopeful", "intensity": 0.4}]
json.dump({"title": cfg['title'], "duration": DUR, "shots": shots, "music": music, "sfx": []}, open(os.path.join(P, 'story', 'shots.json'), 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots', 'avg', round(DUR / len(shots), 2), 's')
