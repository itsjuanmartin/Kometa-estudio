# Reels sueltos · Y Si Te Tocará (preparados el 18 nov 2026)

Tres reels de unos 50 s, listos para ElevenLabs (voz del narrador de Y Si Te Tocará).
Cada `.txt` se pega tal cual: números en letra y cierre incluido («¿Tú…? Te leo en los comentarios.»).

## Por qué estos temas
Mejores reels del canal (datos del Home, 18 nov): «El secreto del presidente» (2.620 IG / 1.300 YT),
«El torpedo de tu propio bando» (2.532 IG / 1.200 YT), «Los camareros eran espías» (2.252 IG).
Patrón ganador: **tú dentro de la historia + presión + giro inesperado (secreto / traición / el enemigo está dentro)**.
Flojos: datos curiosos sin tensión (el perro, el coche de Al Capone).

Modelo: GANCHO (0–3 s) → PRESIÓN (~35 %) → GIRO (~35 %) → PREGUNTA para comentarios (últimos 4–5 s).


## ⭐ SERIE «SERVICIO SECRETO» (prioridad: el vídeo que más suscriptores trajo fue «El secreto que el presidente de EE. UU. escondía»)
Tres partes seguidas. Las partes 1 y 2 cierran con «Sígueme para no perderte la parte dos/tres» + tarjeta en pantalla «PARTE 2: …».
Publicar en orden (mañana 13:00 · noche 20:00 · día siguiente 13:00).

### S01 · El agente que salvó a Reagan — `S01_el_agente_que_salvo_a_reagan.txt`
- Título: **El agente que salvó a Reagan se hizo agente… por Reagan 😳 #serviciosecreto #reagan**
- Comentario fijado: **¿Casa Blanca u hospital? 🏛️ Casa Blanca · 🏥 Hospital. Tenías 3 segundos.** Tarjeta final: «PARTE 2: EL DÍA QUE NACIÓ EL SERVICIO SECRETO».
- Verificar: 30 mar 1981, seis disparos en menos de 2 s, sangre en la boca → hospital, la película de 1939 «Code of the Secret Service» con Reagan.

### S02 · El día que nació el Servicio Secreto — `S02_el_dia_que_nacio_el_servicio_secreto.txt`
- Título: **El presidente que creó el Servicio Secreto murió ese mismo día 😳 #lincoln #historia**
- Comentario fijado: **¿Casualidad o señal? 🎲 Casualidad · 👁️ Algo más.** Tarjeta final: «PARTE 3: LA TARJETA NUCLEAR PERDIDA».
- Verificar: 14 abr 1865, creado para perseguir billetes falsos, el policía del palco (John Parker) dejó su puesto, protección presidencial desde 1901 (McKinley).

### S03 · La tarjeta nuclear perdida — `S03_la_tarjeta_nuclear_perdida.txt`
- Título: **El presidente perdió los códigos nucleares… durante meses 😳 #clinton #nuclear**
- Comentario fijado: **¿Lo cuentas o lo tapas? 📢 Lo cuento · 🤐 Lo tapo.**
- Verificar: la «galleta» (biscuit), el relato del general Hugh Shelton (memorias, 2010), año 2000. Se cuenta como «según su versión».

## R01 · Fin del mundo 1983 (Stanislav Petrov) — `R01_fin_del_mundo_1983.txt`
- Título: **Tienes minutos para decidir si se acaba el mundo 😳 #historia #yositetocara**
- Comentario fijado: **¿Avisar o arriesgarte? 🚨 Avisar · 🤫 Callar. ¿Qué habrías hecho tú?**
- Portada: «¿AVISAS O NO?» sobre pantalla de radar roja.
- Verificar antes de publicar: fecha (26 sept 1983), «cinco misiles», reflejo del sol en las nubes, se supo en 1998.

## R02 · La bala en el pecho (Theodore Roosevelt, 1912) — `R02_bala_en_el_pecho.txt`
- Título: **Le dispararon en el pecho… y siguió hablando 😳 #roosevelt #historia**
- Comentario fijado: **¿Le dejas subir al escenario? 🎤 Sí, es su decisión · 🏥 No, al hospital.**
- Portada: «LE DISPARAN… Y SIGUE HABLANDO».
- Verificar: Milwaukee 14 oct 1912, discurso de 50 páginas + funda de gafas, ~84–90 min hablando, la bala nunca se la sacaron.

## R03 · La operación secreta (Grover Cleveland, 1893) — `R03_operacion_secreta.txt`
- Título: **Operaron al presidente en secreto… en un yate 😳 #presidente #historia**
- Comentario fijado: **¿Guardarías el secreto? 🤐 Sí, por el país · 📰 No, la gente tiene derecho a saberlo.**
- Portada: «EL SECRETO DEL PRESIDENTE» (mismo gancho que el reel que mejor funcionó).
- Verificar: yate Oneida, 1 jul 1893, prótesis de goma vulcanizada, periodista E. J. Edwards, el Dr. W. W. Keen lo contó en 1917.

## Cómo producirlos (para la próxima sesión)
1. Generar cada guion en ElevenLabs → mp3.
2. Copiar el esquema de `projects/ao-003-gta6/` (reel GTA VI de Archivo Oscuro), que ya funciona:
   - `input/voiceover.mp3` + `input/script.txt` + `config.json` → `python3 tools/align_whisper.py --project <P> --model medium`
     (necesita `pip install opencv-python-headless faster-whisper`).
   - `reel.py`: montaje 1080x1920 con zooms, golpes de zoom, destellos, textos grandes animados y subtítulos palabra a palabra.
     Cambiar `build_shots()` (tomas) y `overlays()` (textos) para cada guion.
   - `mix.py --no-music`: voz + efectos (whoosh, golpes, tic-tac), normalizado a -14 LUFS. Al usuario NO le gustó la música de fondo.
3. Fotos: `tools/fetch_photo.py` (Wikimedia, licencias libres). La miniatura de 1920 px funciona; los originales y 2560/3840 dan error 429.
   Hay buenas fotos de dominio público de Roosevelt, Cleveland y la Guerra Fría.
4. Subir al Home (Centro de Canales, colección `posts`, ver `aogta6-r1` como ejemplo): vídeo partido en trozos < 15 MB.
   Para que la portada se pueda descargar, la URL de `thumbs` lleva `?f=/nombre.jpg` (el Home guarda la imagen sin extensión).
