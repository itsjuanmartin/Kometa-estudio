#!/bin/bash
# Idempotent chain: Nvidia (render→mix→deliver→shorts) then EP03 (same). Re-run after any stop; finished steps are skipped.
set -o pipefail; cd /home/user/growkaz-stickman-studio
run() { # P master light shorts_script
  P=$1; M=$P/out/$2.mp4; Lt=$3; SH=$4
  [ -s $P/build/video_silent.mp4 ] && [ -s $M ] || { tools/render_segments.sh $P 60 2>&1 | grep -E "segment|CONCAT|rror"; grep -q . $P/build/video_silent.mp4 || exit 1; }
  [ -s $P/build/video_silent.mp4 ] || exit 1
  [ -s $M ] || { python3 audio/mix.py --project $P --out $M 2>&1 | tail -3 || exit 1; }
  [ -s $P/out/$Lt.mp4 ] || { tools/deliver.sh $P $Lt || exit 1; }
  [ $(ls $P/out/shorts/*.mp4 2>/dev/null | wc -l) -ge 5 ] || { bash $SH 2>&1 | tail -8 || exit 1; }
  echo "DONE $P"
}
run projects/ao-002-nvidia MASTER_AO002 ArchivoOscuro_002_Nvidia projects/ao-002-nvidia/make_shorts.sh
python3 projects/ep03-engano/story/build_shots.py
run projects/ep03-engano MASTER_EP03 YSiTeTocara_EP03_Engano projects/ep03-engano/make_shorts.sh
echo ALL DONE
