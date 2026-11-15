#!/bin/bash
# Final delivery encode for long videos: ~4.5 MB per minute at 1080p (EP01: 12:48 -> 57 MB).
# Visually identical for this flat toon style; small enough to download on iPhone.
# usage: tools/deliver.sh projects/<slug> "<NombreArchivo>"
P=$1; NAME=${2:-entrega}
SRC=$(ls -t $P/out/*.mp4 | grep -v -e _ligero -e "$NAME" | head -1)
ffmpeg -v error -y -i "$SRC" -c:v libx264 -preset slow -crf 29 -tune animation -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart "$P/out/${NAME}.mp4" && ls -la "$P/out/${NAME}.mp4"
