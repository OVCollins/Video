"""Import an externally recorded / generated narration (e.g. ElevenLabs or a
human voice artist) and build public/audio/voiceover.wav + src/data/timing.json.

The recording is cut only at its own natural pauses ("groups"); inside a group
the reading is kept exactly as delivered. Cue starts that fall inside
continuous speech ("soft" cues) are marked at measured energy dips.
Between groups, the designed scene pauses are inserted.

To use a new recording: listen/measure where each group starts and ends
(seconds in the source file), update GROUPS below, then run
    python3 -I tools/import_voice.py public/audio/source/<file>
    tools/build_mix.sh
"""
import json, os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "public/audio/source/elevenlabs-lauren.mp3")
SR = 48000
LEAD_IN, TAIL = 3.2, 7.0

# Source: ElevenLabs "Lauren – Friendly, Comforting and Soft" (2026-11-24 take).
# (group start, group end, pause after, [(cue id, cue start in source), ...], extras)
GROUPS = [
    (0.00, 4.20, 1.70, [("intro", 0.10)]),
    (5.51, 17.18, 1.90, [("church", 5.51), ("festival", 10.45), ("theme", 14.71)]),
    (18.17, 27.68, 1.50, [("date", 18.17), ("time", 21.78), ("venue", 23.10)]),
    (28.64, 35.35, 1.30, [("leader", 28.64)]),
    (36.17, 38.62, 0.50, [("oguibe", 36.17)]),
    (39.18, 41.12, 1.40, [("ehiliz", 39.18)]),
    (41.95, 51.70, 1.20, [("choirs", 41.95), ("choirs_a", 45.21), ("choirs_b", 48.79)]),
    (52.27, 54.20, 1.30, [("overo", 52.27)]),
    (54.83, 58.58, 1.30, [("chairman", 54.83)]),
    (59.19, 61.80, 1.70, [("announcer", 59.19)]),
    (62.52, 64.28, 0.75, [("finale1", 62.52)]),
    (64.73, 67.35, 0.55, [("finale2", 64.73)]),
    (67.71, 68.43, 0.00, [("finale3", 67.71)]),
]
EXTRA = {
    # "The Messiah Has Come!" inside the theme cue (theme impact lands here)
    "theme": {"hit": 15.53},
    # each choir name onset, measured at its preceding pause
    "choirs_a": {"items": [45.21, 46.20, 47.02, 47.97]},
    "choirs_b": {"items": [48.79, 49.66, 50.38, 51.06]},
}
PRE, POST = 0.04, 0.10  # margins around speech at hard cuts

old = json.load(open(os.path.join(ROOT, "src/data/timing.json")))
TEXT = {c["id"]: c["text"] for c in old["cues"]}
PHON = {c["id"]: c.get("phonemes", "") for c in old["cues"]}

with tempfile.TemporaryDirectory() as td:
    wav = os.path.join(td, "src.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-ar", str(SR), wav], check=True)
    src, _ = sf.read(wav, dtype="float32")

out = [np.zeros(int(LEAD_IN * SR), np.float32)]
t = LEAD_IN
cues = []
for gi, (g0, g1, pause, gcues) in enumerate(GROUPS):
    a = max(0.0, g0 - PRE) if gi else 0.0
    b = min(len(src) / SR, g1 + POST)
    clip = src[int(a * SR):int(b * SR)].copy()
    fd = int(0.012 * SR)
    clip[:fd] *= np.linspace(0, 1, fd); clip[-fd:] *= np.linspace(1, 0, fd)
    shift = t - a  # source time -> timeline time
    ends = [s for _, s in gcues[1:]] + [g1]
    for (cid, s), e in zip(gcues, ends):
        c = {"id": cid, "text": TEXT[cid], "phonemes": PHON.get(cid, ""), "start": round(s + shift, 3), "end": round(e + shift, 3), "onsets": []}
        for k, v in EXTRA.get(cid, {}).items():
            c[k] = [round(x + shift, 3) for x in v] if isinstance(v, list) else round(v + shift, 3)
        cues.append(c)
    out.append(clip); t += len(clip) / SR
    if pause:
        out.append(np.zeros(int(pause * SR), np.float32)); t += pause
out.append(np.zeros(int(TAIL * SR), np.float32)); t += TAIL
full = np.concatenate(out)
full = full / (np.abs(full).max() + 1e-9) * 0.89

assert [c["id"] for c in cues] == [c["id"] for c in old["cues"]], "cue list changed"
sf.write(os.path.join(ROOT, "public/audio/voiceover.wav"), full, SR, subtype="PCM_16")
json.dump({"voice": "ElevenLabs – Lauren (Friendly, Comforting and Soft)", "source": os.path.relpath(SRC, ROOT), "leadIn": LEAD_IN,
           "total": round(t, 3), "cues": cues}, open(os.path.join(ROOT, "src/data/timing.json"), "w"), indent=2, ensure_ascii=False)
for c in cues:
    print(f'{c["id"]:10s} {c["start"]:7.2f} -> {c["end"]:7.2f}')
print("TOTAL", round(t, 2))
