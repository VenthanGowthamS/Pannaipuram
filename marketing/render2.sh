set -e
F=frames; FPS=30; T=0.5
# scene 3 (சங்கமம்) is a live screen recording, the rest are stills
D=(3.0 5.0 4.5 7.5 5.0 4.5 5.5)
IMG=(01-title 02-bus 03-auto 04-bulletin 05-hospital 06-emergency 07-cta)
read RX RY < <(python3 -c "
import json;r=json.load(open('$F/04-bulletin.rect.json'));print(r['x'],r['y'])")

IN=""; FILT=""
for i in 0 1 2 3 4 5 6; do
  IN="$IN -i $F/${IMG[$i]}.png"
  N=$(python3 -c "print(int(${D[$i]}*$FPS))")
  if [ $i -eq 3 ]; then
    # plate: hold still, no Ken Burns — the overlay supplies the motion
    FILT="$FILT[$i:v]scale=2160:3840,zoompan=z=1:d=$N:s=1080x1920:fps=$FPS,setsar=1[p$i];"
  else
    FILT="$FILT[$i:v]scale=2160:3840,zoompan=z='min(1+0.00045*on,1.09)':d=$N:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=$FPS,setsar=1[v$i];"
  fi
done
IN="$IN -framerate $FPS -i cast/f%04d.jpg -i mask.png -i music.wav"

FILT="$FILT[7:v]scale=612:1325,setsar=1[anim];[8:v]alphaextract[mk];[anim][mk]alphamerge[animr];"
FILT="$FILT[p3][animr]overlay=$RX:$RY:format=auto[v3];"

PREV="[v0]"
for i in 1 2 3 4 5 6; do
  OFF=$(python3 -c "
d=[${D[0]},${D[1]},${D[2]},${D[3]},${D[4]},${D[5]},${D[6]}]
print(round(sum(d[:$i]) - $i*$T, 3))")
  FILT="$FILT${PREV}[v$i]xfade=transition=fade:duration=$T:offset=$OFF[x$i];"
  PREV="[x$i]"
done
FILT="${FILT}${PREV}fade=t=in:st=0:d=0.6,fade=t=out:st=31.2:d=0.8,format=yuv420p[vout];"
FILT="${FILT}[9:a]loudnorm=I=-15:TP=-1.5:LRA=11,afade=t=out:st=31.0:d=1.0[aout]"

ffmpeg -y $IN -filter_complex "$FILT" -map "[vout]" -map "[aout]" \
  -c:v libx264 -profile:v high -level 4.0 -crf 22 -preset slow -r $FPS \
  -c:a aac -b:a 128k -t 32 -movflags +faststart pannaipuram-promo-v2.mp4
