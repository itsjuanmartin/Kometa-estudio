"""Builds story/shots.json for ARCHIVO OSCURO 001 (Binance). Run from the studio root."""
import json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(P, 'timeline', 'sentences.json')))
cfg = json.load(open(os.path.join(P, 'config.json'))); DUR = cfg['duration']
s = lambda k, dt=0.0: ('s', k, dt)
HAVE = {f[:-4] for f in os.listdir(os.path.join(P, 'assets', 'photos')) if f.endswith('.jpg')} if os.path.isdir(os.path.join(P, 'assets', 'photos')) else set()
CRED = {'bitcoin_coin': 'Foto: Bits86, CC0 · Wikimedia Commons', 'datacenter': 'Foto: Carl Lender, CC BY 2.0 · Wikimedia Commons',
        'fbi_hq': 'Foto: Tony Webster, CC BY 2.0 · Wikimedia Commons', 'pyongyang': 'Foto: Jan Engelhardt, CC BY-SA 4.0 · Wikimedia Commons',
        'kim_yojong': 'Foto: Departamento de Estado de EE. UU., dominio público', 'un_hq': 'Foto: Jakub Hałun, CC BY 4.0 · Wikimedia Commons'}
def ph(key, at, dur, cap):
    return dict(key=key, at=at, dur=dur, cap=cap, credit=CRED[key]) if key in HAVE else None

PLAN = [
  # ---------- COLD OPEN ----------
  (0,  dict(scene='timer', icons=[s(1, 0.2), s(2, 0.2), s(3, 0.2)], cam=dict(z0=1.0, z1=1.08), sfx=[(0.05, 'hit', -8), (s(1, 0.2), 'pop', -12), (s(2, 0.2), 'pop', -12), (s(3, 0.2), 'pop', -12)], amb=('hum', -30))),
  (4,  dict(scene='moneyOut', date='29 OCT 2026', cam=dict(z0=1.0, z1=1.12), sfx=[(0.3, 'counter', -12), (1.5, 'riser', -14)])),
  (5,  dict(scene='noWeapons', at=[0.05, s(6, 0.05), s(7, 0.05)], sfx=[(0.4, 'hit', -12), (s(6, 0.4), 'hit', -12), (s(7, 0.4), 'hit', -12)])),
  (8,  dict(scene='teaser', glitch=s(10, 1.6), lbl=s(10, 1.6), cam=dict(z0=1.0, z1=1.15, punch=[dict(at=s(10, 1.6), z=1.15, fy=420, d=0.3)]), sfx=[(s(10, 1.5), 'glitch', -8), (s(10, 1.7), 'stinger', -8)])),
  # ---------- INTRO + SUBSCRIBE ----------
  (11, dict(scene='intro', dark=0.4, title=s(12, 0.1), sfx=[(0.4, 'buzz', -16), (s(12, 0.1), 'impact', -10), (s(12, 0.6), 'stamp', -6)], amb=('roomtone', -24))),
  (13, dict(scene='rules', conf=s(15, 0.1), rum=s(16, 0.1), ex=[(0, 'smile')], sfx=[(s(15, 0.1), 'stamp', -6), (s(16, 0.1), 'stamp', -6)])),
  (17, dict(scene='subscribe', press=s(17, 2.6), rare=s(17, 3.6), sfx=[(0.3, 'pop', -8), (s(17, 2.6), 'ding', -8)])),
  (18, dict(scene='folder', sfx=[(0.3, 'whoosh', -12), (0.6, 'typewriter', -14), (2.6, 'stamp', -6)])),
  # ---------- WHAT IS BINANCE ----------
  (19, dict(scene='exchange', users=s(22), small=s(23), big=s(24), cam=dict(z0=1.0, z1=1.1), sfx=[(s(22), 'shimmer', -16), (s(23), 'pop', -12), (s(24), 'pop', -12)], amb=('city', -32))),
  (25, dict(scene='wallets', cold=s(26, 0.1), hot=s(27, 0.1), out=s(29), sfx=[(s(26, 0.1), 'pop', -10), (s(27, 0.1), 'pop', -10), (s(29), 'counter', -16)])),
  (30, dict(scene='splitKey', split=s(32, 1.0), sign=s(34, 0.3), cam=dict(z0=1.0, z1=1.06), sfx=[(s(32, 1.0), 'glitch', -12), (s(34, 0.9), 'ding', -12)])),
  (35, dict(scene='fiveKeys', cam=dict(z0=1.0, z1=1.12))),
  (36, dict(scene='javi', ex=[(0, 'smirk'), (s(37), 'thinking'), (s(38), 'determined')], say=[['¿IMPOSIBLE?', 0.4], ['ALGO MÁS', s(38, 0.2)], ['INTELIGENTE', s(38, 0.6)]], sfx=[(s(38, 0.2), 'stinger', -10)])),
  # ---------- THE ENGINEER + FAKE OFFER ----------
  (39, dict(scene='calendarFlip', months=[['SEPTIEMBRE', 1]], lbl='RETROCEDAMOS…', sfx=[(0.2, 'whoosh', -10)])),
  (40, dict(scene='engineer', tag=s(42, 0.2), redact=s(41, 0.5), sfx=[(s(41, 0.5), 'stamp', -10), (s(42, 0.2), 'pop', -10)], amb=('roomtone', -26))),
  (44, dict(scene='engineer', ping=s(44, 1.2), tag=-9, cam=dict(z0=1.0, z1=1.18, fx=1300, fy=520), sfx=[(s(44, 1.2), 'phonebuzz', -10)])),
  (45, dict(scene='chat', msgs=[['¡Nos encanta tu perfil! 😍', s(45, 1.5)], ['Tenemos un puesto para ti', s(46, 0.1)], ['Mejor sueldo · gran proyecto 💰', s(47, 0.1)]], sfx=[(s(45, 1.5), 'blip', -10), (s(46, 0.1), 'blip', -10), (s(47, 0.1), 'blip', -10)])),
  (48, dict(scene='javi', ex=[(0, 'neutral'), (s(50), 'smirk')], say=[['TE ESCRIBEN', s(50, 0.0)], ['TE HALAGAN', s(50, 0.8)], ['TE OFRECEN MÁS', s(50, 1.6)]], sfx=[(s(50), 'pop', -12), (s(50, 0.8), 'pop', -12), (s(50, 1.6), 'pop', -12)])),
  (51, dict(scene='thought', bubbles=[['«Por escuchar no pierdo nada»', 0.4]], ex=[(0, 'thinking')], sfx=[(0.4, 'pop', -12)])),
  (52, dict(scene='chat', night=True, stage=[['1ª ENTREVISTA ✓', 0.3]], msgs=[['Todo normal 👍', s(53)]], sfx=[(0.3, 'ding', -14)])),
  (54, dict(scene='chat', app='chat', night=True, msgs=[['Hola, soy el CEO 👋', s(54, 2.5)], ['Última fase: una prueba técnica', s(55, 2.0)], ['Descárgate este código y ponlo en marcha', s(57, 0.1)]], file=s(57, 1.5), stage=[['2ª ENTREVISTA', 0.3]], sfx=[(s(54, 2.5), 'blip', -10), (s(55, 2.0), 'blip', -10), (s(57, 0.1), 'blip', -10), (s(57, 1.5), 'pop', -10)])),
  (58, dict(scene='download', run=s(59, 0.4), lbl='LO DESCARGA… Y LO EJECUTA', cam=dict(z0=1.0, z1=1.12), sfx=[(0.3, 'counter', -14), (s(59, 0.4), 'blip', -8)])),
  (60, dict(scene='checklist', title='NO FUE UN DESCUIDO TONTO', items=[['un correo mal escrito', s(61, 0.4), 'x'], ['perfiles creíbles', s(63, 0.3)], ['conversaciones normales', s(63, 1.3)], ['varias fases', s(63, 2.6)]], ex=[(0, 'determined')], sfx=[(s(61, 0.7), 'hit', -14), (s(63, 0.6), 'pop', -12), (s(63, 1.6), 'pop', -12), (s(63, 2.9), 'pop', -12)])),
  (65, dict(scene='chef', cam=dict(z0=1.0, z1=1.08))),
  (67, dict(scene='workPC', cam=dict(z0=1.0, z1=1.35, fy=650), sfx=[(0.2, 'impact', -8), (0.3, 'stamp', -6)])),
  # ---------- MALWARE + PATIENCE ----------
  (68, dict(scene='malware', lbl=s(68, 2.4), nd=s(70, 0.6), none=[['NINGUNA ALARMA', s(72)], ['NINGÚN AVISO', s(73)]], conf=s(68, 0.6), confTxt='SEGÚN BINANCE', sfx=[(0.6, 'glitch', -12), (s(68, 2.4), 'stamp', -6), (s(70, 0.6), 'stamp', -6), (s(72, 0.3), 'hit', -14), (s(73, 0.3), 'hit', -14)], amb=('hum', -30))),
  (75, dict(scene='somewhere', cam=dict(z0=1.0, z1=1.1), sfx=[(0.3, 'stinger', -8)])),
  (76, dict(scene='watching', grin=1, lbl='LA PACIENCIA', cam=dict(z0=1.1, z1=1.0), sfx=[(0.2, 'whoosh', -12)], amb=('hum', -28))),
  (79, dict(scene='watching', lbl='MIRANDO… APRENDIENDO', cam=dict(z0=1.0, z1=1.12, fx=1500, fy=760))),
  (82, dict(scene='attic', cam=dict(z0=1.0, z1=1.15, fy=420))),
  (83, dict(scene='calendarFlip', months=[['SEPTIEMBRE', 30], ['OCTUBRE', 1]], sfx=[(0.3, 'whoosh', -12)])),
  # ---------- LATERAL MOVEMENT + TOKEN ----------
  (85, dict(scene='network', spread=s(86, 2.0), ai=s(86, 3.0), date='20 OCT 2026', conf=s(85, 1.0), confTxt='CRONOLOGÍA DE BINANCE', sfx=[(s(86, 2.0), 'glitch', -10), (s(86, 3.0), 'powerup', -14)])),
  (89, dict(scene='network', spread=-5, q=s(89, 1.0), sfx=[(s(89, 1.0), 'stinger', -10), (s(89, 1.4), 'stamp', -6)])),
  (91, dict(scene='token', card=s(92, 0.3), cam=dict(z0=1.0, z1=1.1), sfx=[(s(92, 0.3), 'shimmer', -12)])),
  (94, dict(scene='token', card=-5, box=0.4, sfx=[(0.4, 'pop', -10)])),
  (95, dict(scene='token', card=-5, maint=s(95, 0.6), doors=s(96, 0.1), sfx=[(s(95, 0.6), 'stamp', -8), (s(96, 0.1), 'pop', -10)])),
  (97, dict(scene='calendarFlip', months=[['OCTUBRE', 20], ['OCTUBRE', 23], ['OCTUBRE', 26], ['OCTUBRE', 29]], lbl='NUEVE DÍAS', sfx=[(0.3, 'clock', -14)])),
  # ---------- THE NIGHT ----------
  (99, dict(scene='clocks', date='29 OCT 2026', at=[s(100), s(101), s(102), s(103)], sfx=[(s(100), 'tick', -8), (s(101), 'tick', -8), (s(102), 'tick', -8), (s(103), 'tick', -8)], amb=('hum', -30))),
  (104, dict(scene='deploy', core=s(105, 1.5), cam=dict(z0=1.0, z1=1.1), sfx=[(0.5, 'whoosh', -10), (s(105, 1.5), 'alarm', -14)])),
  (106, dict(scene='fiveKeys', cam=dict(z0=1.12, z1=1.0))),
  (107, dict(scene='lock', key=0.2, conf=s(108, 0.4), confTxt='NINGUNA CLAVE FILTRADA', inside=s(109, 0.3), open=s(112, 0.6), lbl=[['NO FORZARON LA CERRADURA', s(111)], ['LA CONVENCIERON', s(112, 0.2)]], cam=dict(z0=1.0, z1=1.0, punch=[dict(at=s(112, 0.6), z=1.25, fy=420, d=0.4)]), sfx=[(0.5, 'hit', -12), (s(108, 0.4), 'stamp', -6), (s(109, 0.3), 'glitch', -12), (s(112, 0.6), 'impact', -8)])),
  # ---------- THE DRAIN ----------
  (113, dict(scene='drain', mode='btc', lbl='EN UN SOLO MOVIMIENTO', lblAt=s(115), cam=dict(z0=1.0, z1=1.15), sfx=[(0.3, 'counter', -10), (s(116), 'hit', -8)], rphoto=('bitcoin_coin', s(114, 0.1), 2.6, 'Un bitcoin «físico» de colección'), amb=('hum', -28))),
  (118, dict(scene='drain', mode='multi', at=[0.2, s(119, 0.1), s(120, 0.1), s(121, 0.1)], sfx=[(0.2, 'pop', -10), (s(119, 0.1), 'pop', -10), (s(120, 0.1), 'pop', -10), (s(121, 0.1), 'pop', -10)])),
  (122, dict(scene='drain', mode='chains', conf=s(122, 0.8), confTxt='TRM LABS', sfx=[(0.3, 'riser', -12)])),
  (123, dict(scene='drain', mode='registers', sfx=[(0.2, 'counter', -12)])),
  (124, dict(scene='drain', mode='clock', sfx=[(0.1, 'clock', -12)])),
  (125, dict(scene='perSecond', icons=[s(128, 0.2), s(129, 0.1), s(130, 0.1)], sfx=[(0.2, 'counter', -12), (s(128, 0.4), 'hit', -12), (s(129, 0.3), 'hit', -12), (s(130, 0.3), 'hit', -12)])),
  (131, dict(scene='addresses', cam=dict(z0=1.0, z1=1.08))),
  (132, dict(scene='secRoom', cam=dict(z0=1.0, z1=1.1), sfx=[(0.2, 'alarm', -12), (1.8, 'alarm', -14)], amb=('hum', -26), rphoto=('datacenter', s(133, 0.6), 3.4, 'Un centro de datos (imagen de referencia)'))),
  (135, dict(scene='noSingleKey', lbl=s(138), sfx=[(0.6, 'hit', -10), (s(138), 'riser', -14)])),
  (139, dict(scene='bigNumber', num=s(141), range=s(142, 0.5), record=s(143, 0.8), cam=dict(z0=1.0, z1=1.06), sfx=[(s(141), 'impact', -6), (s(143, 0.8), 'stamp', -6)])),
  (144, dict(scene='bars', b2=s(145), x4=s(145, 1.0), sfx=[(0.4, 'whoosh', -14), (s(145), 'riser', -12), (s(145, 1.0), 'impact', -8)])),
  # ---------- PANIC ----------
  (146, dict(scene='usersPanic', suspend=s(147, 0.6), posts=[['¿Alguien puede retirar? 😰', s(149, 0.3)], ['Dicen que hackearon Binance…', s(150, 0.3)], ['¿Lo he perdido todo?', s(150, 2.4)]], sfx=[(0.2, 'phonebuzz', -12), (s(147, 0.6), 'stamp', -6), (s(149, 0.3), 'blip', -10), (s(150, 0.3), 'blip', -10), (s(150, 2.4), 'blip', -10)], amb=('murmur', -28))),
  (151, dict(scene='chartDrop', sfx=[(0.3, 'riser', -14)])),
  (152, dict(scene='javi', ex=[(0, 'worried')], say=[['¿QUÉ ESTÁ', s(154)], ['A SALVO?', s(154, 0.4)]], sfx=[(s(154), 'stinger', -10)])),
  # ---------- THE TURN ----------
  (155, dict(scene='freeze', num=s(158, 0.3), numTxt='≈ 3.000 M', sfx=[(0.2, 'whoosh', -12), (0.8, 'freeze', -10)])),
  (159, dict(scene='freeze', num=0.3, numTxt='≈ 2.850 M', conf=0.6, confTxt='INFORME DE BINANCE', sfx=[(0.6, 'stamp', -6)])),
  (160, dict(scene='half', sfx=[(0.3, 'whoosh', -12)])),
  (161, dict(scene='refill', own=s(162, 0.3), src=[s(164, 1.6), s(164, 3.0), s(164, 4.4), s(164, 5.6)], sfx=[(s(164, 1.6), 'pop', -10), (s(164, 3.0), 'pop', -10), (s(164, 4.4), 'pop', -10), (s(164, 5.6), 'pop', -10)])),
  (165, dict(scene='refill', src=[-9, -9, -9, -9], pct=s(165, 1.5), sfx=[(s(165, 1.5), 'stamp', -6)])),
  (166, dict(scene='reopen', queue=s(168), num=s(169, 0.4), conf=0.8, sfx=[(0.6, 'powerup', -12), (s(169, 0.4), 'counter', -12)])),
  (170, dict(scene='stands', shield=s(173), lbl='AGUANTÓ', sfx=[(s(173), 'ding', -10)])),
  (174, dict(scene='who', sfx=[(s(175), 'stinger', -8)], amb=('wind', -30))),
  # ---------- WHO ----------
  (177, dict(scene='dossier', lines=[['Grupo: «TraderTraitor»', s(178, 1.0)], ['También conocido como:', s(179, 1.0)], ['Vinculado a: Corea del Norte', s(180, 0.5), '#c0392b']], aka=s(179, 3.0), conf=s(178, 0.4), rphoto=('fbi_hq', 0.2, 2.6, 'Sede del FBI · Washington D. C.'), sfx=[(0.2, 'typewriter', -14), (s(179, 3.0), 'stamp', -6)])),
  (181, dict(scene='mapNK', lbl='NO ES LA PRIMERA VEZ', rphoto=('pyongyang', s(181, 1.0), 3.0, 'Pionyang, capital de Corea del Norte'), sfx=[(0.4, 'pop', -10)])),
  (182, dict(scene='board', title='LO QUE SE LE ATRIBUYE A LAZARUS', strings=True, cards=[['Grandes robos digitales', 0.3, 520, 420], ['Bybit · 2025', s(183, 0.2), 1100, 360], ['Ofertas de trabajo falsas', s(184, 2.5), 760, 680, '#ffe6a8']], sfx=[(0.3, 'pop', -12), (s(183, 0.2), 'pop', -12), (s(184, 2.5), 'pop', -12)])),
  (185, dict(scene='checklist', javi=False, title='EL PATRÓN', gap=150, size=56, items=[['Reclutadores que no existen', 0.1, '!'], ['Empresas que no existen', s(186, 0.1), '!'], ['Pruebas técnicas con trampa', s(187, 0.1), '!'], ['…lo que le pasó al Ingeniero B', s(188, 0.2), 'x']], sfx=[(0.1, 'hit', -14), (s(186, 0.1), 'hit', -14), (s(187, 0.1), 'hit', -14)])),
  (189, dict(scene='flashback', dev=s(193, 0.3), fbi=s(194, 0.3), sfx=[(0.2, 'whoosh', -10), (s(194, 0.3), 'stamp', -6)])),
  (195, dict(scene='checklist', javi=True, title='BYBIT 2025 → BINANCE 2026', items=[['Mismo método', 0.1], ['Mismos sospechosos', s(196, 0.1)], ['El golpe: 4 veces más grande', s(197, 0.6), '!']], ex=[(0, 'determined')], sfx=[(0.4, 'pop', -12), (s(196, 0.4), 'pop', -12), (s(197, 0.6), 'impact', -10)])),
  # ---------- LAUNDERING ----------
  (198, dict(scene='launder', step=1, unc=s(200, 0.5), sfx=[(s(200, 0.5), 'stamp', -8)])),
  (202, dict(scene='launder', step=2, sfx=[(0.4, 'whoosh', -10)])),
  (203, dict(scene='launder', step=3, sfx=[(0.2, 'glitch', -14)])),
  (204, dict(scene='launder', step=4)),
  (205, dict(scene='launder', step=5, sfx=[(0.5, 'whoosh', -10)])),
  (206, dict(scene='launder', step=6, sfx=[(0.4, 'wind', -18)])),
  (209, dict(scene='dossier', head='INFORMES · ONU', lines=[['Informes de Naciones Unidas:', 0.6], ['estos robos financian al régimen', s(209, 3.0)], ['y sus programas de armas', s(209, 5.0), '#c0392b']], rphoto=('un_hq', 0.4, 2.6, 'Sede de Naciones Unidas · Nueva York'), sfx=[(0.6, 'typewriter', -14)])),
  (210, dict(scene='javi', ex=[(0, 'worried')], say=[['NO ES SOLO', 0.3], ['UN ROBO', s(211, 0.1)]], sfx=[(s(211, 0.1), 'stinger', -10)])),
  # ---------- NORTH KOREA'S ANSWER ----------
  (212, dict(scene='statement', no=[['LO NIEGA TODO', s(214, 0.1)], ['NINGUNA PARTICIPACIÓN', s(215, 0.2)], ['«ES FALSO»', s(217, 0.4)]], rphoto=('kim_yojong', s(213, 1.5), 4.0, 'Kim Yo-jong (2018)'), sfx=[(s(214, 0.1), 'stamp', -6), (s(215, 0.2), 'stamp', -6), (s(217, 0.4), 'stamp', -6)])),
  (218, dict(scene='scale', st=s(219, 1.0), sfx=[(s(219, 1.0), 'stamp', -6)])),
  # ---------- WHAT WE KNOW ----------
  (220, dict(scene='board', title='LO QUE SABEMOS HOY', cards=[['CONFIRMADO', s(222), 520, 330, '#c9f0c0'], ['ABIERTO', s(230), 1400, 330, '#ffd0a8']], sfx=[(s(222), 'stamp', -8), (s(230), 'stamp', -8)])),
  (223, dict(scene='checklist', javi=False, title='CONFIRMADO', gap=100, size=42, items=[['29 de octubre de 2026', 0.1], ['≈ 6.300 M $ en unos 20 minutos', s(224, 0.2)], ['Entrevista falsa + prueba con malware', s(225, 0.2)], ['Semanas dentro antes de actuar', s(226, 0.1)], ['No robaron claves: usaron las firmas', s(227, 0.2)], ['Congelados ≈ 2.850 M · fondos repuestos', s(228, 0.2)], ['FBI: hackers vinculados a Corea del Norte', s(229, 0.2)]], sfx=[(0.3, 'pop', -14), (s(224, 0.4), 'pop', -14), (s(225, 0.4), 'pop', -14), (s(226, 0.3), 'pop', -14), (s(227, 0.4), 'pop', -14), (s(228, 0.4), 'pop', -14), (s(229, 0.4), 'pop', -14)])),
  (230, dict(scene='checklist', javi=False, title='SIGUE ABIERTO', gap=140, size=46, items=[['¿Cómo usaron la IA interna?', s(231, 0.2), '!'], ['¿Dónde está la otra mitad?', s(232, 0.2), '!'], ['¿Quiénes eran los reclutadores?', s(233, 0.1), '!'], ['¿Habrá juicio algún día?', s(234, 0.1), '!']], sfx=[(s(231, 0.2), 'hit', -14), (s(232, 0.2), 'hit', -14), (s(233, 0.1), 'hit', -14), (s(234, 0.1), 'hit', -14)])),
  # ---------- TIPS ----------
  (235, dict(scene='javi', ex=[(0, 'smile')], say=[['ESTO TE', s(235, 2.4)], ['PUEDE SERVIR', s(235, 2.8)]], sfx=[(s(235, 2.4), 'pop', -12)])),
  (236, dict(scene='engineer', ping=s(237, 0.3), tag=-9, cam=dict(z0=1.0, z1=1.15, fx=1300, fy=520), sfx=[(s(237, 0.3), 'phonebuzz', -10)])),
  (238, dict(scene='checklist', title='SEÑALES DE UN RECLUTADOR FALSO', gap=130, size=44, items=[['Casi no existe en internet', s(239, 0.1), '!'], ['Todo va con muchas prisas', s(240, 0.1), '!'], ['Te pasa a un chat privado', s(241, 0.1), '!'], ['Te pide ejecutar un programa', s(242, 0.3), '!'], ['NUNCA en el ordenador del trabajo', s(243, 0.1), 'x']], ex=[(0, 'determined')], sfx=[(s(239, 0.1), 'pop', -12), (s(240, 0.1), 'pop', -12), (s(241, 0.1), 'pop', -12), (s(242, 0.3), 'pop', -12), (s(243, 0.1), 'hit', -10)])),
  (244, dict(scene='ending', at=[0.1, s(245, 0.1), s(246, 0.1)], sfx=[(0.4, 'hit', -12), (s(245, 0.4), 'hit', -12), (s(246, 0.4), 'stinger', -10)])),
  # ---------- OUTRO ----------
  (247, dict(scene='outro', q=s(249), ex=[(0, 'smile'), (s(249), 'smirk')], sfx=[(s(249), 'pop', -10), (s(249, 0.4), 'pop', -12), (s(249, 0.8), 'pop', -12)])),
  (251, dict(scene='outro', open=0.2, ex=[(0, 'determined')], sfx=[(0.2, 'stamp', -6)])),
  (253, dict(scene='outro', sub=0.3, press=s(253, 1.6), ex=[(0, 'smile')], sfx=[(0.3, 'pop', -8), (s(253, 1.6), 'ding', -8)])),
  (255, dict(scene='outro', logo=0.1, ex=[(0, 'happy')], sfx=[(0.1, 'impact', -10)])),
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
  {"start": 0, "end": T(11), "mood": "tension", "intensity": 0.8}, {"start": T(11), "end": T(19), "mood": "mystery", "intensity": 0.45},
  {"start": T(19), "end": T(39), "mood": "mystery", "intensity": 0.4}, {"start": T(39), "end": T(68), "mood": "calm", "intensity": 0.35},
  {"start": T(68), "end": T(99), "mood": "dark", "intensity": 0.55}, {"start": T(99), "end": T(146), "mood": "tension", "intensity": 0.8},
  {"start": T(146), "end": T(155), "mood": "sad", "intensity": 0.45}, {"start": T(155), "end": T(174), "mood": "hopeful", "intensity": 0.45},
  {"start": T(174), "end": T(198), "mood": "dark", "intensity": 0.6}, {"start": T(198), "end": T(220), "mood": "mystery", "intensity": 0.5},
  {"start": T(220), "end": T(244), "mood": "calm", "intensity": 0.35}, {"start": T(244), "end": DUR, "mood": "mystery", "intensity": 0.5}]
json.dump({"title": cfg['title'], "duration": DUR, "shots": shots, "music": music, "sfx": []}, open(os.path.join(P, 'story', 'shots.json'), 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots, avg', round(DUR / len(shots), 2), 's · photos:', sorted(HAVE))
