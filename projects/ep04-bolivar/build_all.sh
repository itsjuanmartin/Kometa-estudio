#!/bin/bash
# EP04 completo: vídeo largo (imagen + sonido + entrega) y los 5 reels.
set -e
cd "$(dirname "$0")/../.."
P=projects/ep04-bolivar
python3 $P/render.py --jobs 4
python3 audio/mix.py --project $P
SRC=$(ls -t $P/out/*.mp4 | head -1)
ffmpeg -v error -y -i "$SRC" -c:v libx264 -preset slow -crf 27 -tune animation -pix_fmt yuv420p \
  -af alimiter=limit=0.84:level=disabled -c:a aac -b:a 160k -movflags +faststart $P/build/YSiTeTocara_EP04_Guardaespaldas_Bolivar.mp4
python3 $P/reels.py
echo BUILD_OK
