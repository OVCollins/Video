"""Generate the approved narration with Kokoro neural TTS (local, offline).

The approved script is reproduced VERBATIM below (see SCRIPT). It is split into
cues purely for timing/sync; nothing is added or removed. Spoken realisations of
abbreviations ((Dr) -> "Doctor", Coun. -> "Councillor", 10 AM -> "ten A.M.")
are pronunciation only. Personal and place names use hand-tuned phonemes
(PRON) so the engine does not anglicise them.

Usage: python3 -I tools/voiceover.py <kokoro.onnx> <voices.bin> [voice] [speed]
Writes public/audio/voiceover.wav and src/data/timing.json
"""
import json, os, re, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL, VOICES = sys.argv[1], sys.argv[2]
VOICE = sys.argv[3] if len(sys.argv) > 3 else "af_heart"
SPEED = float(sys.argv[4]) if len(sys.argv) > 4 else 0.9
LANG = "en-us"
SR = 24000

# Pronunciation dictionary (IPA as used by Kokoro). {Key} markers in cue text.
PRON = {
    "Unuefe": "unuˈɛfeɪ",
    "Ikhuiwu": "iˈkuːiwuː",
    "Ehigiamusoe": "ˌeɪhiɡjˌɑːmuˈsɔːeɪ",
    "Ogbeide": "ɔɡˈbeɪideɪ",
    "Oguibe": "oʊˈɡwiːbeɪ",
    "Ehiliz": "ˈɛhilɪz",
    "Fadunsi": "fɑˈduːnsi",
    "Fako": "ˈfɑːkoʊ",
    "Oke-Ira": "ˈoʊkeɪ ˈiːɹɑ",
    "Ogba": "ˈɔɡbɑ",
    "Ajegunle": "ˌɑdʒeɪˈɡuːnleɪ",
    "Bariga": "bɑˈɹiːɡɑ",
    "Mafoluku": "ˌmɑfoʊˈluːkuː",
    "Festac": "ˈfɛstæk",
    "Ojota": "oʊˈdʒoʊtɑ",
    "Ketu": "ˈkeɪtuː",
    "Okoko": "oʊˈkoʊkoʊ",
    "Lekki": "ˈlɛki",
    "Overo": "oʊˈvɛɹoʊ",
    "DEO": "dˈiː ˈiː ˈoʊ",
    "Coun": "kˈaʊnsələ",
    "Dr": "dˈɑːktɚ",
    "artiste": "ɑːɹtˈiːst",
}

# (id, verbatim script text, spoken text with {pron} markers, pause_after_seconds)
CUES = [
    ("intro",      "The season of joy, hope and celebration is here!",
                   "The season of joy, hope and celebration is here!", 1.7),
    ("church",     "Christ's Chosen Church of God International, Lagos Area, proudly presents",
                   "Christ's Chosen Church of God International, Lagos Area, proudly presents", 0.35),
    ("festival",   "the 2026 Festival of Nine Lessons and Carol,",
                   "the twenty twenty-six Festival of Nine Lessons and Carol,", 0.5),
    ("theme",      "themed 'The Messiah Has Come!'",
                   "themed, The Messiah Has Come!", 1.9),
    ("date",       "Join us on Sunday, 20th December 2026,",
                   "Join us on Sunday, twentieth December, twenty twenty-six,", 0.3),
    ("time",       "at 10 AM,",
                   "at ten A.M.,", 0.35),
    ("venue",      "at 30 Fadunsi Street, Fako Estate, Oke-Ira, Ogba, Lagos.",
                   "at thirty {Fadunsi} Street, {Fako} Estate, {Oke-Ira}, {Ogba}, Lagos.", 1.5),
    ("leader",     "Under the spiritual leadership of Senior Apostle (Dr) D.E.O. Unuefe Ikhuiwu, The Elect of God.",
                   "Under the spiritual leadership of Senior Apostle {Dr} {DEO} {Unuefe} {Ikhuiwu}, The Elect of God.", 1.3),
    ("oguibe",     "Featuring Apostle Samuel Oguibe",
                   "Featuring Apostle Samuel {Oguibe}", 0.45),
    ("ehiliz",     "and guest artiste, Ehiliz!",
                   "and guest {artiste}, {Ehiliz}!", 1.4),
    ("choirs",     "Also ministering, the anointed Divisional Mass Choirs of",
                   "Also ministering, the anointed Divisional Mass Choirs of", 0.25),
    ("choirs_a",   "Ajegunle, Bariga, Mafoluku, Festac,",
                   "{Ajegunle}, {Bariga}, {Mafoluku}, {Festac},", 0.15),
    ("choirs_b",   "Ojota, Ketu, Okoko and Lekki.",
                   "{Ojota}, {Ketu}, {Okoko} and {Lekki}.", 1.2),
    ("overo",      "Led by Elder Frank Overo.",
                   "Led by Elder Frank {Overo}.", 1.3),
    ("chairman",   "Under the chairmanship of Deacon Coun. Godwin Ehigiamusoe.",
                   "Under the chairmanship of Deacon {Coun} Godwin {Ehigiamusoe}.", 1.3),
    ("announcer",  "Announcer: Elder Kennedy Ogbeide.",
                   "Announcer: Elder Kennedy {Ogbeide}.", 1.7),
    ("finale1",    "The Messiah has come!",
                   "The Messiah has come!", 0.75),
    ("finale2",    "Come, celebrate the King of Kings.",
                   "Come, celebrate the King of Kings.", 0.55),
    ("finale3",    "Don't miss it!",
                   "Don't miss it!", 0.0),
]

APPROVED = (
    "The season of joy, hope and celebration is here! "
    "Christ's Chosen Church of God International, Lagos Area, proudly presents the 2026 Festival of Nine Lessons and Carol, themed 'The Messiah Has Come!' "
    "Join us on Sunday, 20th December 2026, at 10 AM, at 30 Fadunsi Street, Fako Estate, Oke-Ira, Ogba, Lagos. "
    "Under the spiritual leadership of Senior Apostle (Dr) D.E.O. Unuefe Ikhuiwu, The Elect of God. "
    "Featuring Apostle Samuel Oguibe and guest artiste, Ehiliz! "
    "Also ministering, the anointed Divisional Mass Choirs of Ajegunle, Bariga, Mafoluku, Festac, Ojota, Ketu, Okoko and Lekki. "
    "Led by Elder Frank Overo. "
    "Under the chairmanship of Deacon Coun. Godwin Ehigiamusoe. "
    "Announcer: Elder Kennedy Ogbeide. "
    "The Messiah has come! Come, celebrate the King of Kings. Don't miss it!"
)
# Guard: the cue texts joined must equal the approved script exactly.
joined = " ".join(c[1] for c in CUES)
assert joined == APPROVED, "Cue split does not reproduce the approved script verbatim!"

LEAD_IN = 3.2   # seconds of music/visual before the first word

k = Kokoro(MODEL, VOICES)

def to_phonemes(spoken):
    parts = re.split(r"(\{[^}]+\})", spoken)
    out = []
    for p in parts:
        if not p:
            continue
        if p.startswith("{"):
            out.append(PRON[p[1:-1]])
        else:
            ph = k.tokenizer.phonemize(p, LANG)
            # keep leading/trailing spaces & punctuation context
            if p.startswith(" ") and not ph.startswith(" "):
                ph = " " + ph
            if p.endswith(" ") and not ph.endswith(" "):
                ph = ph + " "
            out.append(ph)
    return re.sub(r"\s+", " ", "".join(out)).strip()

def trim(a, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - int(0.02 * SR)); e = min(len(a), idx[-1] + int(0.06 * SR))
    return a[s:e]

timeline = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
t = LEAD_IN
cues_out = []
for cid, verbatim, spoken, pause in CUES:
    ph = to_phonemes(spoken)
    audio, sr = k.create(ph, voice=VOICE, speed=SPEED, lang=LANG, is_phonemes=True)
    assert sr == SR
    audio = trim(audio.astype(np.float32))
    # gentle 8 ms fades
    f = int(0.008 * SR); audio[:f] *= np.linspace(0, 1, f); audio[-f:] *= np.linspace(1, 0, f)
    dur = len(audio) / SR
    # sub-word onsets (for the choir roll-call): detect pauses inside the clip
    env = np.convolve(np.abs(audio), np.ones(int(0.02 * SR)) / int(0.02 * SR), mode="same")
    silent = env < 0.01
    gaps = []
    run = 0
    for i, s in enumerate(silent):
        if s: run += 1
        else:
            if run > int(0.07 * SR):
                gaps.append(round(t + i / SR, 3))  # onset after a gap
            run = 0
    cues_out.append({"id": cid, "text": verbatim, "phonemes": ph, "start": round(t, 3),
                     "end": round(t + dur, 3), "onsets": gaps})
    print(f"{cid:10s} {t:7.2f} -> {t+dur:7.2f}  onsets={gaps}  | {ph}")
    timeline.append(audio)
    t += dur
    if pause:
        timeline.append(np.zeros(int(pause * SR), dtype=np.float32)); t += pause

TAIL = 7.0
timeline.append(np.zeros(int(TAIL * SR), dtype=np.float32)); t += TAIL
full = np.concatenate(timeline)
full = full / (np.max(np.abs(full)) + 1e-9) * 0.89
os.makedirs(os.path.join(ROOT, "public/audio"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "src/data"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/audio/voiceover.wav"), full, SR, subtype="PCM_16")
json.dump({"voice": VOICE, "speed": SPEED, "leadIn": LEAD_IN, "total": round(t, 3), "cues": cues_out},
          open(os.path.join(ROOT, "src/data/timing.json"), "w"), indent=2, ensure_ascii=False)
print("TOTAL", round(t, 2))
