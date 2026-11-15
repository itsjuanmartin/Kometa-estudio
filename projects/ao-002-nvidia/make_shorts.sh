#!/bin/bash
# AO-002 Nvidia — 5 Shorts (gancho → problema → solución → pedido), cierres rotados: guarda / comenta / youtube / guarda / comenta
cd "$(dirname "$0")/../.."; P=projects/ao-002-nvidia; A=assets/cierres_shorts/audio
V=$P/out/MASTER_AO002.mp4
mk() { python3 tools/make_short.py --brand ao --project $P --video "$V" --endvoice 0:1 "$@" || exit 1; }
mk --name 1_caida   --endaudio $A/cierre_guarda.mp3  --ranges 0:12.1,15.0:48.6 --title "¿UNA ESPÍA HUNDIÓ|A NVIDIA?" --end "¿ESPÍA O|ESCÁNDALO?"
mk --name 2_coche   --endaudio $A/cierre_comenta.mp3 --ranges 329.6:350.3,354.5:373.8 --title "LA MUJER|DEL COCHE" --end "¿COINCIDENCIA|O ALGO MÁS?"
mk --name 3_singapur --endaudio $A/cierre_youtube.mp3 --ranges 245.0:249.2,256.5:280.2,295.0:312.1 --title "EL TRUCO|DE SINGAPUR" --end "¿TRAMPA LEGAL|O CONTRABANDO?"
mk --name 4_te_afecta --endaudio $A/cierre_guarda.mp3 --ranges 198.8:227.1,229.4:243.6 --title "¿POR QUÉ TE AFECTA|A TI?" --end "¿TIENES UN PLAN|DE PENSIONES?"
mk --name 5_giro    --endaudio $A/cierre_comenta.mp3 --ranges 716.8:722.9,726.1:757.2,769.4:785.5 --title "NADIE LO HA|DEMOSTRADO" --end "¿ESPÍA O|ESCÁNDALO?"
ls -la $P/out/shorts
