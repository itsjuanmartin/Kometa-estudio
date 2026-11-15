#!/bin/bash
# Resumable render: renders the project in fixed segments, skipping finished ones, then concatenates.
P=${1:-projects/ep01-guardaespaldas}; SEG=${2:-110}
export CHROME_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
DUR=$(python3 -c "import json;print(json.load(open('$P/config.json'))['duration'])")
mkdir -p $P/build/segs; : > $P/build/segs/list.txt
i=0; t=0
while python3 -c "import sys; sys.exit(0 if $t < $DUR else 1)"; do
  e=$(python3 -c "print(min($t+$SEG, $DUR))"); f=$P/build/segs/seg_$(printf %02d $i).mp4
  if [ ! -s "$f.done" ]; then echo "== segment $i: $t -> $e"; node render.mjs --project $P --from $t --to $e --workers ${WORKERS:-4} --format jpeg --out "$f" && echo ok > "$f.done" || exit 1; fi
  echo "file '$(basename $f)'" >> $P/build/segs/list.txt
  i=$((i+1)); t=$e
done
ffmpeg -v error -y -f concat -safe 0 -i $P/build/segs/list.txt -c copy $P/build/video_silent.mp4 && echo "CONCAT OK"
