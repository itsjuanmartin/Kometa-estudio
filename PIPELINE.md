# Y Si Te Tocara — reglas de entrega
- Vídeo largo: entregar SIEMPRE la versión de `tools/deliver.sh` (1080p, CRF 29, -tune animation, AAC 128k, faststart). Objetivo ≈ 4–5 MB por minuto (EP01: 57 MB). Así se puede descargar en iPhone.
- Shorts: `tools/make_short.py` (ya pesan 10–25 MB).
- Guion: un solo bloque de ~14.000 caracteres (ElevenLabs de pago, administrar créditos).
- Nombre del canal en todo lo visible (rótulos, Shorts, portadas, descripciones): «Y Si Te Tocará» (con tilde). En guiones para ElevenLabs escribir «tocará».
- Copys de Shorts y TikTok: máximo 100 caracteres. Etiquetar IG/TikTok: @YSiTeTocaraATi (confirmado).

## Calidad extra (nov 2026)
- **Sincronización palabra a palabra con Whisper** (sustituye a align_silence cuando hay red):
  `HF_HUB_DISABLE_XET=1 python3 tools/align_whisper.py --project P --model medium`
  (~8 min por 10 min de audio en CPU). Mantiene el texto exacto del guion y toma los tiempos del audio.
  Sin `initial_prompt`: con él Whisper se salta el arranque.
- **Fotos reales** (solo dominio público / CC):
  `python3 tools/fetch_photo.py search "tema"` → `python3 tools/fetch_photo.py get "File:..." --out P/assets/photos --name x`
  Escribe `CREDITOS.txt` para la descripción. Rechaza solo licencias no libres y autores de agencia (Capa, Getty, AP…).
  En la escena: `const PH = await loadPhotos({x:'/project/assets/photos/x.jpg'})` y
  `photoMoment(g, t, PH.x, {caption, credit, theme:'warm'|'dark'})` (engine/photo.js).
  Nunca escenas del crimen, autopsias ni víctimas fallecidas.
- **Música con licencia** (Kevin MacLeod, CC BY 4.0): `python3 tools/music_lib.py fetch` → assets/music/<mood>/.
  mix.py la usa por defecto (`config.music.source = "library"`; `"procedural"` para la generada).
  Deja `out/CREDITOS_MUSICA.txt` → pegar en la descripción del vídeo.

## Cierre de los Shorts (regla fija, nov 2026)
- `tools/make_short.py` ya monta el final: pregunta gancho + «Encuentra la historia completa en YouTube ▶» (discreto) + SUSCRIBIRSE.
- En cada COPY de episodio, la sección de Shorts lleva el bloque «CIERRE DE CADA SHORT».
- En los guiones (los dos canales), cada Short planificado termina con la frase hablada «Encuentra la historia completa en YouTube.»: se genera como línea suelta en ElevenLabs (~45 caracteres) y se usa como --endvoice.

## Lip-sync real (obligatorio, nov 2026)
- Después de alinear: `python3 tools/mouth_env.py --project P` → `timeline/mouth.json` (apertura de boca cada 10 ms según la voz real; cerrada en pausas).
- En las escenas, la boca de cualquier personaje que "habla" usa `mouthAt(tiempoGlobal)` (ver `projects/ao-001-binance/scenes/director.js`: `GT`, `mouthAt`, `talkNow`). Prohibido usar `Math.sin(t * 11)` para hablar: mueve la boca en los silencios y baja la retención.
- Personajes que no son el narrador: boca cerrada (talk 0) salvo que tengan su propia línea.
- Cambios de escena: disolvencia corta (`in: {type: 'fade', dur: 0.25}`).

## Portadas de TikTok/IG (nov 2026)
- Solo Archivo Oscuro lleva portada diseñada (kit2.mjs, 1080x1920).
- Y Si Te Tocará: sin portada diseñada; se elige un fotograma del propio Short (título visible + cara expresiva).

## Estructura obligatoria (desde 14 nov 2026)
**Shorts / Reels (30–60 s):** GANCHO (0–3 s: la frase más impactante) → PROBLEMA (~35 %: el conflicto) → SOLUCIÓN (~35 %: el giro/revelación) → PEDIDO (últimos 4–5 s: voz + pantalla «SÍGUENOS · GUÁRDALO»).
- El pedido hablado es una línea suelta de ElevenLabs por episodio (ver `lineas_pedido_shorts.txt`) que se usa como `--endaudio`.
- Fin de pantalla: pregunta + «Encuentra la historia completa en YouTube» + botones SÍGUENOS / GUÁRDALO.
**Vídeos largos:** petición de comentario en un momento concreto (≈ 40 % del vídeo, tipo «escribe ESPÍA o ESCÁNDALO»), retomada al final; cierre con «guarda este vídeo y suscríbete».
**Ritmo de publicación:** 2 Shorts/Reels al día por canal (mañana ~13:00 y noche ~21:00, hora de España).

**Frase de pedido (fija):** vídeos largos → «Suscríbete y guarda este vídeo para que te salgan más historias como esta.» · Shorts/Reels → «Síguenos y guarda este vídeo para que te salgan más historias como esta.»

## Copy de Shorts/Reels (desde 14 nov 2026)
- Toda descripción (YouTube, TikTok, IG) empieza con: «VIDEO COMPLETO EN EL LINK | …»
- Comentario fijado = debate con 2 opciones votables con emoji + adelanto de algo que solo está en el vídeo completo. Nunca un simple «¿qué opinas?».

## Ganchos favoritos

**Gancho favorito nº 1 (desde 17 nov 2026, los dos canales):** «Les voy a contar un caso que todavía nadie se explica cómo pasó…» → y arrancar la historia sin pausa. Funciona porque promete un misterio sin resolver y deja un bucle abierto desde el segundo 1. Variantes para rotar y que no suene repetido:
- «Les voy a contar un caso que, a día de hoy, sigue sin tener explicación.»
- «Les voy a contar algo que pasó de verdad… y que todavía nadie entiende cómo.»
- «Esta historia es real, y todavía hoy nadie sabe cómo pudo pasar.»
- Archivo Oscuro: «Les voy a contar un caso que la policía todavía no se explica.» · Y Si Te Tocará: «Les voy a contar lo que le pasó a alguien como tú… y todavía nadie se explica cómo.»
Regla: el caso tiene que estar de verdad abierto o tener un giro difícil de creer; si se resuelve fácil, el gancho promete de más y se pierde la confianza. Si el tema no lo permite, usar el nº 2.

**Gancho favorito nº 2 (desde 14 nov 2026):** «Te dijeron que X, ¿verdad? Pues la verdad es que no…» → y seguir con la historia. Para temas donde hay una creencia popular que desmentir.

## Cierres hablados de Shorts (reutilizables)
- `assets/cierres_shorts/*_cierres.txt`: 5 frases por canal, grabadas una sola vez. Audios en `assets/cierres_shorts/<canal>/cierre_N.mp3`.
- Cada episodio rota los 5 cierres entre sus 5 Shorts (Short 1 → cierre 1 … Short 5 → cierre 5) usando `--endaudio`.
- (15 nov) Se usan 3 cierres compartidos por los dos canales en `assets/cierres_shorts/audio/`: `cierre_guarda.mp3`, `cierre_comenta.mp3` y `cierre_youtube.mp3` (pendiente). Rotación en 5 Shorts: guarda → comenta → youtube → guarda → comenta.
- (15 nov) `cierre_youtube.mp3` («…el expediente completo está en YouTube») = SOLO Archivo Oscuro. Y Si Te Tocará tendrá su propia versión `cierre_youtube_ystt.mp3` («…la historia completa está en YouTube», pendiente de grabar). `cierre_guarda` y `cierre_comenta` sirven para los dos canales.

- (15 nov) **Cierre «Parte 2» (prioridad, para convertir vistas en seguidores):** los Shorts 1–4 de cada episodio cierran con «Sígueme para no perderte la parte 2» + tarjeta en pantalla «PARTE 2: <título del siguiente Short>». El Short 5 (último) cierra con «la historia completa está en YouTube, link en mi perfil». Audios: `assets/cierres_shorts/audio/cierre_parte2.mp3`, `cierre_parte2_b.mp3` (variante para rotar) y `cierre_youtube_ystt.mp3`.
- Guiones de Shorts: el último segundo antes del cierre deja una pregunta abierta que la Parte 2 responde (cliffhanger), y el Short siguiente arranca con «Parte 2:» en el título superior.

## Guiones: retención ante todo (regla fija desde 15 nov 2026)
Público: 18–45 años. La retención es el mantra: cada vídeo publicado tiene que ser mejor que el anterior.
1. **Tres cosas claras desde el inicio:** qué va a ver, por qué le importa y por qué quedarse.
2. **Gancho → desarrollo → cierre, varias veces** dentro del vídeo largo (cada bloque de 2–3 min es un mini-vídeo con su propio gancho y su remate).
3. **Bucles abiertos:** plantar preguntas que solo se resuelven al final («al final te cuento cómo…»). Mínimo 2 por vídeo largo; cerrarlas todas antes del pedido final.
4. **Cero relleno:** ni al inicio ni en medio. Prueba obligatoria antes de dar un guion por bueno: leerlo como alguien que se aburre muy rápido; cada frase que aburra se corta o se reescribe.
5. **En pantalla pasa algo nuevo cada pocos segundos** (2–4 s): cambio de plano, movimiento de cámara, dato que aparece, foto real, mapa, gesto.
6. **Procesos complejos se explican con animación** (3D o diagrama animado) cuando ayuda a entender, para que se note el nivel profesional.
7. **Título ganador**, inspirado en los títulos que funcionan a otros creadores grandes del nicho; lo que promete el título se reafirma en los primeros segundos del vídeo.
8. **El inicio impacta:** primer segundo con acción, imagen fuerte o dato absurdo; nunca una presentación.

## Shorts 3D (desde 15 nov 2026)
Proyecto de referencia: `projects/ep03-3d` (mundo 3D low-poly de `engine/three-kit.js` + personajes 2D anclados a un punto 3D).
- `config.json` con `"aspect": "9:16"`, 30 fps. Render ~11 min por Short de 30 s.
- Montaje: `tools/make_short.py --vertical` (no recorta 16:9; título arriba, subtítulos a y=1390, cierre igual que siempre).
- Vehículos y uniformes con insignias de su bando (estrella blanca de EE. UU., escarapela británica…).

## Home (Centro de Canales) — producción en directo (desde 15 nov 2026)
Home: https://claude.ai/artifact/GGoMm6EWXYMFBZvhTfRnWx (colecciones: channels, posts, stats, notes, tips, ideas, voices, drafts, goals).
- Un proyecto creado en el Home vive en `drafts/<id>` (guion, review, audio[], posts[] = ids de las piezas ya creadas en el calendario con copys).
- Al producir un proyecto con «montaje pedido», actualiza `drafts/<id>.prod` en cada hito (cada 15–20 min, no más): `{pct, eta:"HH:MM", updated: ISO, frameLabel, frame: url de un fotograma subido como asset, log:[{t:"HH:MM", m:"…"}]}`. Al terminar: pct 100, stage 4, y en cada pieza de `posts[]` poner `dl`, `img`, `file`, `madeAt` y `st` = listo.
- Usa la voz subida en `drafts/<id>.audio[]` (asset; mp3 aunque se sirva como mp4).
- Abrir una sesión nueva por vídeo para gastar menos contexto.

## Código del Home
`home/centro-de-canales.html` es la fuente del Home publicado en https://claude.ai/artifact/GGoMm6EWXYMFBZvhTfRnWx. Para cambiarlo: editar este archivo y publicarlo con la herramienta Artifact pasando ese `url` (leer antes el artefacto). Las imágenes `img/…` ya están publicadas en el artefacto.

## Decisiones del creador (15 nov 2026)
- **Horario de subida fijo: 13:00 y 20:00 (hora de España)**, 2 piezas al día por canal y red; el vídeo largo a las 20:00. El Home (UPLOAD_H) ya planifica así los proyectos nuevos. Recordatorio automático a las 12:55 y 19:55 (tarea programada con aviso al móvil).
- **Logos y banners de canales nuevos:** alternar entre el motor propio (gratis) e Higgsfield. A los clientes del kit se les pide instalar Higgsfield. El asistente «Añadir canal» del Home guarda la preferencia en channels/<id>.brief.art.
- **Montaje:** el creador quiere trabajar solo desde el Home. Cuando un proyecto tenga montaje == "pedido", producirlo siguiendo la sección «Home — producción en directo».
