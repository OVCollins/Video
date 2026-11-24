#!/usr/bin/env bash
# Music + SFX + mix for the current public/audio/voiceover.wav and src/data/timing.json
set -euo pipefail
cd "$(dirname "$0")/.."
A=public/audio; S=$A/stems; mkdir -p $S
python3 -I tools/music.py
fluidsynth -ni -q -F $S/music_raw.wav -r 48000 -g 0.32 \
  -o synth.reverb.room-size=0.85 -o synth.reverb.damp=0.3 -o synth.reverb.width=0.9 -o synth.reverb.level=0.7 \
  -o synth.chorus.active=0 /usr/share/sounds/sf2/FluidR3_GM.sf2 $S/music.mid
# narration polish: HPF, gentle presence lift, warmth, compression, 48 kHz
ffmpeg -y -loglevel error -i $A/voiceover.wav -af "aresample=48000:resampler=soxr,highpass=f=75,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-22dB:ratio=3:attack=6:release=140:makeup=3,alimiter=limit=0.89" -ar 48000 $S/voice_proc.wav
python3 -I tools/mix.py
# two-pass loudness normalisation to -14 LUFS / -1.5 dBTP (streaming/social standard)
J=$(ffmpeg -hide_banner -i $S/mix_pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i $S/mix_pre.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le $A/soundtrack.wav
echo "soundtrack ready: $A/soundtrack.wav"
