#!/bin/bash
cd "$(dirname "$0")"
D=$(python3 -c "import json;print(json.load(open('config.json'))['duration'])"); N=4
mkdir -p build/parts
for i in 0 1 2 3; do
  a=$(python3 -c "print(round($D*$i/$N*30)/30)"); b=$(python3 -c "print(round($D*($i+1)/$N*30)/30)")
  python3 reel2.py --from $a --to $b --out build/parts/p$i.mp4 --part p$i > build/parts/log$i.txt 2>&1 &
done
wait
printf "file 'p0.mp4'\nfile 'p1.mp4'\nfile 'p2.mp4'\nfile 'p3.mp4'\n" > build/parts/list.txt
ffmpeg -y -v error -f concat -safe 0 -i build/parts/list.txt -c copy build/reel_silent.mp4 && echo DONE
