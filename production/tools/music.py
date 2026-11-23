"""Original orchestral score, tempo-mapped to the narration timing.

Arrangements of public-domain carol melodies ("Adeste Fideles", Mendelssohn's
"Hark! The Herald Angels Sing", "Antioch"/"Joy to the World") plus original
underscore. Each section is given a whole number of bars and its tempo is
solved so the downbeat of every section lands exactly on its scene cut.

Output: public/audio/stems/music.mid  (render with FluidSynth, see build_audio.sh)
Also writes src/data/sections.json (scene boundaries shared with Remotion).
"""
import json, os
import mido

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src/data/timing.json")))
C = {c["id"]: c for c in T["cues"]}
END = T["total"]

# ---- Scene / music boundaries (seconds) ---------------------------------
b = {
    "intro": 0.0,
    "announce": C["church"]["start"] - 0.45,
    "hit": C["theme"]["start"] + 0.42,
    "info": C["date"]["start"] - 0.55,
    "leader": C["leader"]["start"] - 0.55,
    "oguibe": C["oguibe"]["start"] - 0.35,
    "ehiliz": C["ehiliz"]["start"] - 0.30,
    "choirs": C["choirs"]["start"] - 0.55,
    "overo": C["overo"]["start"] - 0.45,
    "chairman": C["chairman"]["start"] - 0.45,
    "announcer": C["announcer"]["start"] - 0.45,
    "finale": C["finale1"]["start"] - 1.0,
    "end": END,
}
os.makedirs(os.path.join(ROOT, "public/audio/stems"), exist_ok=True)
json.dump(b, open(os.path.join(ROOT, "src/data/sections.json"), "w"), indent=2)

TPB = 480
CH = dict(strings=0, bass=1, choir=2, horn=3, tpt=4, timp=5, harp=6, celesta=7, glock=8,
          drums=9, tubular=10, oboe=11, flute=12, pizz=13, trombone=14, trem=15)
PROG = dict(strings=48, bass=43, choir=52, horn=60, tpt=56, timp=47, harp=46, celesta=8, glock=9,
            tubular=14, oboe=68, flute=73, pizz=45, trombone=57, trem=44)

events = []  # (abs_tick, order, msg)

def ev(tick, msg, order=1):
    events.append((int(round(tick)), order, msg))

def note(sec_tick, inst, n, beat, dur, vel=80):
    ch = CH[inst]
    t0 = sec_tick + beat * TPB
    t1 = t0 + max(dur * TPB - 10, 20)
    ev(t0, mido.Message("note_on", channel=ch, note=int(n), velocity=int(max(1, min(127, vel)))), 2)
    ev(t1, mido.Message("note_off", channel=ch, note=int(n), velocity=0), 0)

def cc(sec_tick, inst, ctrl, val, beat=0):
    ev(sec_tick + beat * TPB, mido.Message("control_change", channel=CH[inst], control=ctrl, value=int(max(0, min(127, val)))), 1)

def ramp(sec_tick, inst, b0, b1, v0, v1, ctrl=11, steps=24):
    for i in range(steps + 1):
        f = i / steps
        cc(sec_tick, inst, ctrl, v0 + (v1 - v0) * f, b0 + (b1 - b0) * f)

# Chords (D major). Triads as pitch classes on top of root midi in octave 3.
CHORD = {
    "D": [50, 54, 57], "G": [55, 59, 62], "A": [57, 61, 64], "A7": [57, 61, 64, 67],
    "Bm": [59, 62, 66], "Em": [52, 55, 59], "F#m": [54, 57, 61], "Asus": [57, 62, 64],
    "Dsus": [50, 55, 57], "Gmaj7": [55, 59, 62, 66], "Em7": [52, 55, 59, 62], "Dadd9": [50, 54, 57, 64],
    "G/D": [50, 55, 59, 62], "D/F#": [54, 57, 62],
}
ROOT_BASS = {"D": 38, "G": 43, "A": 45, "A7": 45, "Bm": 47, "Em": 40, "F#m": 42, "Asus": 45,
             "Dsus": 38, "Gmaj7": 43, "Em7": 40, "Dadd9": 38, "G/D": 38, "D/F#": 42}

def pad(st, ch_name, beat, dur, inst="strings", vel=70, up=12, bass=True, bass_vel=None):
    tones = CHORD[ch_name]
    for n in tones:
        note(st, inst, n + up, beat, dur, vel)
    note(st, inst, tones[0] + up + 12, beat, dur, vel - 8)
    if bass:
        note(st, "bass", ROOT_BASS[ch_name], beat, dur, bass_vel or vel)

def arp(st, ch_name, beat, dur, inst="harp", vel=60, step=0.5, base=12, pattern=(0, 1, 2, 3, 2, 1)):
    tones = CHORD[ch_name][:3]
    seq = [t + base for t in tones] + [tones[0] + base + 12]
    k = 0; t = 0.0
    while t < dur - 1e-6:
        note(st, inst, seq[pattern[k % len(pattern)]], beat + t, step * 1.8, vel)
        k += 1; t += step

def melody(st, inst, seq, start_beat=0, vel=85, transpose=0, dur_scale=1.0):
    t = start_beat
    for n, d in seq:
        if n is not None:
            note(st, inst, n + transpose, t, d * dur_scale, vel)
        t += d
    return t

def timp_roll(st, n, b0, b1, v0, v1):
    t = b0; steps = int((b1 - b0) / 0.125)
    for i in range(steps):
        f = i / max(1, steps - 1)
        note(st, "timp", n, b0 + i * 0.125, 0.12, v0 + (v1 - v0) * f)

def drum(st, n, beat, vel):
    note(st, "drums", n, beat, 0.5, vel)

# ---- tempo map ------------------------------------------------------------
SECTIONS = [  # name, start, end, bars
    ("intro", b["intro"], b["announce"], 2),
    ("announce", b["announce"], b["hit"], 4),
    ("hit", b["hit"], b["info"], 1),
    ("info", b["info"], b["leader"], 4),
    ("people", b["leader"], b["choirs"], 4),
    ("choirs", b["choirs"], b["overo"], 4),
    ("officials", b["overo"], b["finale"], 4),
    ("finale", b["finale"], b["end"], 5),
]
tick = 0
starts = {}
for name, s, e, bars in SECTIONS:
    bpm = bars * 4 * 60 / (e - s)
    ev(tick, mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(bpm)), 0)
    starts[name] = (tick, bars)
    print(f"{name:10s} {s:6.2f}-{e:6.2f}  bars={bars} bpm={bpm:5.1f}")
    tick += bars * 4 * TPB
TOTAL_TICKS = tick

# Program setup
for inst, p in PROG.items():
    ev(0, mido.Message("program_change", channel=CH[inst], program=p), 0)
    ev(0, mido.Message("control_change", channel=CH[inst], control=91, value=90), 0)  # reverb
    ev(0, mido.Message("control_change", channel=CH[inst], control=7, value=100), 0)
    ev(0, mido.Message("control_change", channel=CH[inst], control=11, value=100), 0)
ev(0, mido.Message("control_change", channel=9, control=91, value=70), 0)
# pan
for inst, pan in dict(strings=54, bass=70, choir=64, horn=44, tpt=78, timp=64, harp=30, celesta=90,
                      glock=96, tubular=58, oboe=72, flute=80, pizz=40, trombone=84, trem=74).items():
    ev(0, mido.Message("control_change", channel=CH[inst], control=10, value=pan), 0)

# ---- 1. INTRO: reflective, bells & celesta ----------------------------------
st, _ = starts["intro"]
for inst in ("strings", "trem", "bass"):
    ramp(st, inst, 0, 6, 30, 95)
pad(st, "Dadd9", 0, 4, vel=62)
note(st, "trem", 81, 0.5, 3.5, 50); note(st, "trem", 78, 0.5, 3.5, 46)
pad(st, "G/D", 4, 2, vel=66); pad(st, "Asus", 6, 1, vel=72); pad(st, "A", 7, 1, vel=76)
note(st, "tubular", 74, 0, 3, 92); note(st, "tubular", 69, 2, 3, 78); note(st, "tubular", 74, 4, 4, 88)
cel = [86, 81, 78, 74, 78, 81, 85, 88, 86, 83, 79, 76, 81, 85, 88, 93]
for i, n in enumerate(cel):
    note(st, "celesta", n, i * 0.5, 1.2, 55 + (i % 4) * 6)
# harp glissando into the announcement
for i, n in enumerate([62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 85, 86]):
    note(st, "harp", n, 6 + i * (2 / 15), 1.5, 50 + i * 3)
cc(st, "drums", 11, 100)
drum(st, 52, 7.0, 0)  # placeholder (no-op velocity 1)

# ---- 2. ANNOUNCEMENT: Adeste Fideles, building -------------------------------
st, _ = starts["announce"]
for inst in ("strings", "bass", "horn", "choir", "trem"):
    ramp(st, inst, 0, 16, 70, 122)
adeste = [(62, 1), (62, 1), (57, 1), (62, 1), (64, 1), (57, 2), (66, 1), (64, 1), (66, 1), (67, 1), (66, 1), (64, 2)]
melody(st, "horn", adeste, 0, vel=92)
melody(st, "flute", adeste, 0, vel=70, transpose=12)
melody(st, "oboe", adeste, 0, vel=66, transpose=12)
harm = [("D", 0, 2), ("A", 2, 1), ("D", 3, 1), ("A", 4, 1), ("D", 5, 2), ("D", 7, 1),
        ("A", 8, 1), ("D", 9, 1), ("Em", 10, 1), ("D", 11, 1), ("A", 12, 2), ("A7", 14, 2)]
for ch_name, bt, d in harm:
    pad(st, ch_name, bt, d, vel=72 + bt * 2)
for i in range(16):
    if i >= 8:
        for h in (0, 0.5):
            note(st, "pizz", ROOT_BASS[[c for c, bt, d in harm if bt <= i][-1]] + 12, i + h, 0.4, 60 + i * 2)
for bt in (0, 4, 8):
    note(st, "timp", 38, bt, 1, 70 + bt * 2)
note(st, "choir", 62, 8, 4, 60); note(st, "choir", 66, 8, 4, 56)
note(st, "choir", 61, 12, 4, 70); note(st, "choir", 64, 12, 4, 66); note(st, "choir", 69, 12, 4, 66)
timp_roll(st, 45, 12, 16, 50, 118)
for i, n in enumerate([69, 71, 73, 74, 76, 78, 79, 81]):
    note(st, "strings", n + 12, 14 + i * 0.25, 0.3, 80 + i * 4)
drum(st, 57, 15.75, 1)

# ---- 3. THEME HIT: "The Messiah Has Come!" -----------------------------------
st, _ = starts["hit"]
for inst in ("strings", "bass", "horn", "choir", "tpt", "trombone", "trem"):
    cc(st, inst, 11, 127)
    ramp(st, inst, 0.5, 4, 127, 70, steps=12)
pad(st, "D", 0, 4, vel=112)
for n in (74, 78, 81): note(st, "tpt", n, 0, 3.5, 118)
for n in (62, 66, 69): note(st, "horn", n, 0, 4, 110)
for n in (50, 57, 62): note(st, "trombone", n, 0, 4, 108)
for n in (62, 66, 69, 74, 78): note(st, "choir", n, 0, 4, 104)
note(st, "timp", 38, 0, 1, 127); note(st, "timp", 45, 0, 1, 110)
drum(st, 49, 0, 120); drum(st, 57, 0, 105); drum(st, 35, 0, 118)
note(st, "tubular", 74, 0, 4, 115); note(st, "glock", 86, 0, 2, 100); note(st, "glock", 93, 0.5, 2, 80)

# ---- 4. INFO: light, pizzicato & glockenspiel --------------------------------
st, _ = starts["info"]
for inst in ("strings", "bass"):
    ramp(st, inst, 0, 2, 95, 78)
prog = ["D", "Bm", "G", "A"]
for i, ch_name in enumerate(prog):
    pad(st, ch_name, i * 4, 4, vel=60)
    arp(st, ch_name, i * 4, 4, inst="pizz", vel=72, step=0.5, base=12)
    arp(st, ch_name, i * 4, 4, inst="harp", vel=50, step=0.25, base=24, pattern=(0, 1, 2, 3))
gl = [(86, 1), (85, 0.5), (83, 0.5), (81, 2), (None, 4), (79, 1), (78, 0.5), (76, 0.5), (74, 2), (None, 2), (76, 1), (81, 1)]
melody(st, "glock", gl, 0, vel=62)
melody(st, "flute", [(78, 2), (76, 1), (74, 1), (74, 4), (71, 2), (74, 1), (79, 1), (76, 4)], 0, vel=60)

# ---- 5. PEOPLE: dignified underscore -------------------------------------------
st, _ = starts["people"]
for inst in ("strings", "bass", "horn"):
    ramp(st, inst, 0, 4, 80, 96)
prog = [("D", 0, 4), ("G/D", 4, 2), ("D", 6, 2), ("Em7", 8, 2), ("A", 10, 2), ("Dsus", 12, 2), ("D", 14, 2)]
for ch_name, bt, d in prog:
    pad(st, ch_name, bt, d, vel=68)
    arp(st, ch_name, bt, d, inst="harp", vel=52, step=0.5, base=12)
hornmel = [(66, 2), (64, 1), (62, 1), (67, 2), (66, 1), (64, 1), (62, 1.5), (64, 0.5), (66, 1), (69, 1), (69, 2), (66, 2)]
melody(st, "horn", hornmel, 0, vel=84)
melody(st, "strings", [(n + 12 if n else None, d) for n, d in hornmel[6:]], 8, vel=60)
for bt in (0, 8):
    note(st, "tubular", 74, bt, 3, 62)
note(st, "timp", 38, 0, 1, 70); note(st, "timp", 38, 12, 1, 72)

# ---- 6. CHOIRS: Hark! The Herald Angels Sing -----------------------------------
st, _ = starts["choirs"]
for inst in ("strings", "bass", "choir", "horn", "tpt", "trombone"):
    ramp(st, inst, 0, 3, 100, 122)
hark = [(57, 1), (62, 1), (62, 1.5), (61, 0.5), (62, 1), (66, 1), (66, 1), (64, 1),
        (69, 1), (69, 1), (69, 1.5), (67, 0.5), (66, 1), (64, 1), (66, 2)]
melody(st, "choir", hark, 0, vel=104, transpose=12)
melody(st, "choir", hark, 0, vel=92)
melody(st, "tpt", hark, 0, vel=86, transpose=12)
melody(st, "strings", hark, 0, vel=88, transpose=24)
alto = [(54, 1), (57, 1), (57, 1.5), (57, 0.5), (57, 1), (62, 1), (62, 1), (61, 1),
        (66, 1), (66, 1), (66, 1.5), (64, 0.5), (62, 1), (61, 1), (62, 2)]
melody(st, "choir", alto, 0, vel=84, transpose=12)
hh = [("D", 0, 3), ("A", 3, 1), ("D", 4, 2), ("Bm", 6, 1), ("A", 7, 1),
      ("D", 8, 2), ("G", 10, 1.5), ("Em", 11.5, 0.5), ("D", 12, 1), ("A", 13, 1), ("D", 14, 2)]
for ch_name, bt, d in hh:
    pad(st, ch_name, bt, d, vel=88)
    for n in CHORD[ch_name][:3]:
        note(st, "horn", n + 12, bt, d, 82)
    note(st, "trombone", ROOT_BASS[ch_name] + 12, bt, d, 80)
for i in range(16):
    note(st, "timp", 38 if i % 4 != 3 else 45, i, 0.5, 90 if i % 2 == 0 else 70)
    drum(st, 54, i + 0.5, 46)  # tambourine on the offbeat
    drum(st, 81, i, 40)        # triangle
    cur = [c for c, bt, d in hh if bt <= i][-1]
    for h in (0, 0.5):
        note(st, "pizz", ROOT_BASS[cur] + 12, i + h, 0.4, 76)
drum(st, 49, 0, 100); drum(st, 49, 8, 90)
timp_roll(st, 45, 14, 16, 60, 90)

# ---- 7. OFFICIALS: dignified, warm --------------------------------------------
st, _ = starts["officials"]
for inst in ("strings", "bass", "horn", "choir"):
    ramp(st, inst, 0, 3, 110, 92)
prog = [("G", 0, 2), ("D/F#", 2, 2), ("Em7", 4, 2), ("Asus", 6, 1), ("A", 7, 1),
        ("Bm", 8, 2), ("G", 10, 2), ("Asus", 12, 2), ("A7", 14, 2)]
for ch_name, bt, d in prog:
    pad(st, ch_name, bt, d, vel=70)
    arp(st, ch_name, bt, d, inst="harp", vel=50, step=0.5, base=12)
note(st, "choir", 67, 0, 4, 66); note(st, "choir", 71, 0, 4, 62); note(st, "choir", 74, 0, 4, 60)  # Overo: choir motif
melody(st, "horn", [(71, 2), (69, 2), (67, 2), (64, 1), (66, 1), (66, 2), (67, 2), (69, 4)], 0, vel=78)
melody(st, "oboe", [(None, 8), (78, 2), (79, 2), (76, 2), (73, 2)], 0, vel=64)
note(st, "tubular", 67, 0, 3, 58); note(st, "tubular", 71, 4, 3, 50); note(st, "tubular", 74, 8, 3, 56)
timp_roll(st, 45, 12, 16, 40, 112)
for inst in ("strings", "bass", "horn"):
    ramp(st, inst, 12, 16, 92, 124)

# ---- 8. FINALE: Joy to the World -----------------------------------------------
st, _ = starts["finale"]
for inst in ("strings", "bass", "choir", "horn", "tpt", "trombone", "trem"):
    cc(st, inst, 11, 122)
joy = [(74, 1), (73, 0.75), (71, 0.25), (69, 1.5), (67, 0.5), (66, 1), (64, 1), (62, 1.5), (69, 0.5),
       (71, 1.5), (71, 0.5), (73, 1.5), (73, 0.5), (74, 4)]
melody(st, "tpt", joy, 0, vel=108)
melody(st, "choir", joy, 0, vel=104)
melody(st, "choir", joy, 0, vel=96, transpose=-12)
melody(st, "strings", joy, 0, vel=96, transpose=12)
melody(st, "flute", joy, 0, vel=74, transpose=12)
jh = [("D", 0, 3.5), ("G", 3.5, 0.5), ("D", 4, 1), ("A", 5, 1), ("D", 6, 2), ("G", 8, 2), ("A", 10, 2), ("D", 12, 4)]
for ch_name, bt, d in jh:
    pad(st, ch_name, bt, d, vel=100)
    for n in CHORD[ch_name][:3]:
        note(st, "horn", n + 12, bt, d, 94)
    note(st, "trombone", ROOT_BASS[ch_name] + 12, bt, d, 96)
for i in range(12):
    note(st, "timp", 38 if i % 2 == 0 else 45, i, 0.5, 96)
    drum(st, 81, i + 0.5, 36)
drum(st, 49, 0, 112); drum(st, 35, 0, 105)
# Grand final chord (bar 4) + bell peal, then a soft Christmas bell to close
for n in (74, 78, 81, 86): note(st, "tpt", n, 12, 6, 118)
for n in (62, 66, 69, 74, 78, 81): note(st, "choir", n, 12, 7, 108)
for n in (50, 57): note(st, "trombone", n, 12, 7, 110)
note(st, "timp", 38, 12, 1, 127); timp_roll(st, 38, 13, 15, 100, 50)
drum(st, 49, 12, 127); drum(st, 57, 12, 115); drum(st, 35, 12, 127)
for i, n in enumerate([86, 81, 78, 74, 69, 74]):
    note(st, "tubular", n - 12, 12 + i * 0.75, 3, 110 - i * 8)
for inst in ("strings", "bass", "choir", "horn", "tpt", "trombone"):
    ramp(st, inst, 14, 20, 122, 20, steps=30)
note(st, "glock", 86, 17, 3, 70); note(st, "celesta", 93, 17.5, 2.5, 60); note(st, "tubular", 74, 17, 3, 72)

# ---- write -------------------------------------------------------------------
events.sort(key=lambda e: (e[0], e[1]))
mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
last = 0
for t, _, m in events:
    if m.type == "note_on" and m.velocity <= 1:
        continue
    tr.append(m.copy(time=t - last)); last = t
tr.append(mido.MetaMessage("end_of_track", time=max(0, TOTAL_TICKS + 4 * TPB - last)))
out = os.path.join(ROOT, "public/audio/stems/music.mid")
mid.save(out)
print("saved", out, "length", round(mid.length, 2), "s (target", END, ")")
