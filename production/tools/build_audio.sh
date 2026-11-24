#!/usr/bin/env bash
# Rebuild the complete soundtrack. Usage: tools/build_audio.sh <kokoro.onnx> <voices.bin> [voice] [speed]
set -euo pipefail
cd "$(dirname "$0")/.."
A=public/audio; S=$A/stems; mkdir -p $S
python3 -I tools/voiceover.py "$1" "$2" "${3:-af_heart}" "${4:-0.9}"
tools/build_mix.sh
