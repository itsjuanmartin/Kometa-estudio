#!/bin/bash
# Cierre «serie» (Parte N de 5 + CONTINUARÁ… + SEGUIR) para todos los Shorts pendientes de subir.
cd "$(dirname "$0")/.."; A=assets/cierres_shorts/audio/cierre_siguiente_parte.mp3
r() { python3 tools/reend_short.py --audio $A "$@" || exit 1; }
E3=projects/ep03-v2/out; E2=projects/ep02-bastardos/out; A1=projects/ao-001-binance/out; A2=projects/ao-002-nvidia/out
r --in $E3/shorts/short_1_tanques_goma.mp4 --out $E3/shorts_serie/short_1_tanques_goma.mp4 --brand ytt --part 1 --next "LA VIUDA QUE|NO EXISTÍA" --vertical
r --in $E3/shorts/short_2_viuda.mp4     --out $E3/shorts_serie/short_2_viuda.mp4     --brand ytt --part 2 --next "LO RECHAZARON|DOS VECES"
r --in $E3/shorts/short_3_rechazado.mp4 --out $E3/shorts_serie/short_3_rechazado.mp4 --brand ytt --part 3 --next "¿POR QUÉ NO|ATACARON CALAIS?"
r --in $E3/shorts/short_4_calais.mp4    --out $E3/shorts_serie/short_4_calais.mp4    --brand ytt --part 4 --next "CONDECORADO POR|LOS DOS BANDOS"
r --in $E3/shorts/short_5_medallas.mp4  --out $E3/shorts_serie/short_5_medallas.mp4  --brand ytt --part 5
r --in $E2/shorts/short_gestapo.mp4  --out $E2/shorts_serie/short_gestapo.mp4  --brand ytt --part 3 --next "HITLER NO MURIÓ|EN UN CINE"
r --in $E2/shorts/short_pelicula.mp4 --out $E2/shorts_serie/short_pelicula.mp4 --brand ytt --part 4 --next "BUSCÓ A|SUS PADRES"
r --in $E2/shorts/short_padres.mp4   --out $E2/shorts_serie/short_padres.mp4   --brand ytt --part 5
r --in $A1/shorts/short_reclutador_falso.mp4 --out $A1/shorts_serie/short_reclutador_falso.mp4 --brand ao --part 5
r --in $A2/shorts/short_1_caida.mp4     --out $A2/shorts_serie/short_1_caida.mp4     --brand ao --part 1 --next "LA MUJER|DEL COCHE"
r --in $A2/shorts/short_2_coche.mp4     --out $A2/shorts_serie/short_2_coche.mp4     --brand ao --part 2 --next "EL TRUCO|DE SINGAPUR"
r --in $A2/shorts/short_3_singapur.mp4  --out $A2/shorts_serie/short_3_singapur.mp4  --brand ao --part 3 --next "¿POR QUÉ TE AFECTA|A TI?"
r --in $A2/shorts/short_4_te_afecta.mp4 --out $A2/shorts_serie/short_4_te_afecta.mp4 --brand ao --part 4 --next "NADIE LO HA|DEMOSTRADO"
r --in $A2/shorts/short_5_giro.mp4      --out $A2/shorts_serie/short_5_giro.mp4      --brand ao --part 5
find projects -path "*shorts_serie/*_tmp" -type d -prune -exec rm -r {} +; echo ALL DONE
