#!/bin/bash
# EP03 v2 (3D): resumable render -> audio from the original master (same timeline) -> light delivery -> Shorts 2-5.
set -o pipefail; cd /home/user/growkaz-stickman-studio; P=projects/ep03-v2
export CHROME_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
[ -s $P/build/video_silent.mp4 ] || { tools/render_segments.sh $P 60 2>&1 | grep -E "segment|CONCAT|rror"; [ -s $P/build/video_silent.mp4 ] || exit 1; }
[ -s $P/out/MASTER_EP03_3D.mp4 ] || ffmpeg -v error -y -i $P/build/video_silent.mp4 -i projects/ep03-engano/out/MASTER_EP03.mp4 -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest -movflags +faststart $P/out/MASTER_EP03_3D.mp4 || exit 1
[ -s $P/out/YSiTeTocara_EP03_Engano_3D.mp4 ] || tools/deliver.sh $P YSiTeTocara_EP03_Engano_3D || exit 1
[ $(ls $P/out/shorts/*.mp4 2>/dev/null | wc -l) -ge 5 ] || bash $P/make_shorts.sh 2>&1 | tail -8 || exit 1
echo "ALL DONE"
