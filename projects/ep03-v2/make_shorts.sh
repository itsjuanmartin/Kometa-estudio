#!/bin/bash
# EP03 v2 (estilo 3D) — Shorts 2-5 cortados del largo v2; el Short 1 es el vertical 3D nativo (projects/ep03-3d).
cd "$(dirname "$0")/../.."; P=projects/ep03-v2; A=assets/cierres_shorts/audio
V=$P/out/MASTER_EP03_3D.mp4
mk() { python3 tools/make_short.py --brand ytt --project $P --video "$V" --endvoice 0:1 "$@" || exit 1; }
mkdir -p $P/out/shorts; cp projects/ep03-3d/out/shorts/short_1_tanques_goma_3D.mp4 $P/out/shorts/short_1_tanques_goma.mp4
mk --name 2_viuda      --endaudio $A/cierre_comenta.mp3      --ranges 467.2:506.4 --title "LA VIUDA QUE|NO EXISTÍA" --end "¿QUIÉN ENGAÑÓ|MEJOR?"
mk --name 3_rechazado  --endaudio $A/cierre_youtube_ystt.mp3 --ranges 345.3:386.5 --title "LO RECHAZARON|DOS VECES" --end "¿TÚ LO HABRÍAS|INTENTADO?"
mk --name 4_calais     --endaudio $A/cierre_guarda.mp3       --ranges 77.6:117.4  --title "¿POR QUÉ NO|ATACARON CALAIS?" --end "¿CALAIS O|NORMANDÍA?"
mk --name 5_medallas   --endaudio $A/cierre_comenta.mp3      --ranges 630.2:672.9 --title "CONDECORADO POR|LOS DOS BANDOS" --end "¿HÉROE O|TRAIDOR?"
ls -la $P/out/shorts
