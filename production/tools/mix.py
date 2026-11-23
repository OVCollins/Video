"""Sound design + final mix.

Inputs : public/audio/stems/music_raw.wav (FluidSynth render of music.mid)
         public/audio/stems/voice_proc.wav (EQ'd/compressed narration, 48 kHz)
Outputs: public/audio/stems/sfx.wav, public/audio/stems/mix_pre.wav
Synthesised SFX (all original): whooshes, risers, cinematic impacts,
light-sweep shimmers, clock ticks and sleigh-bell jingles.
Music is side-chain ducked under the narration so the voice always leads.
"""
import json, os
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(2026)
T = json.load(open(os.path.join(ROOT, "src/data/timing.json")))
C = {c["id"]: c for c in T["cues"]}
B = json.load(open(os.path.join(ROOT, "src/data/sections.json")))

music, sr = sf.read(os.path.join(ROOT, "public/audio/stems/music_raw.wav"), dtype="float32"); assert sr == SR
voice, sr = sf.read(os.path.join(ROOT, "public/audio/stems/voice_proc.wav"), dtype="float32"); assert sr == SR
if voice.ndim > 1: voice = voice.mean(axis=1)
N = int((T["total"] + 0.5) * SR)
def fit(a, n):
    if len(a) >= n: return a[:n]
    pad = np.zeros((n - len(a),) + a.shape[1:], dtype=a.dtype); return np.concatenate([a, pad])
music = fit(music, N); voice = fit(voice, N)

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y

def sweep_filter(noise, f0, f1):
    """time-varying one-pole LP (vectorised in blocks)"""
    out = np.empty_like(noise); s = 0.0; blk = 256
    for k in range(0, len(noise), blk):
        f = f0 + (f1 - f0) * (k / len(noise))
        a = np.exp(-2 * np.pi * f / SR)
        seg = noise[k:k + blk]
        for i in range(len(seg)): s = (1 - a) * seg[i] + a * s; out[k + i] = s
    return out

sfx = np.zeros((N, 2), dtype=np.float32)
def place(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0: return
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        sfx[i:i + n, 0] += sig[:n] * gain * l * 1.414; sfx[i:i + n, 1] += sig[:n] * gain * r * 1.414
    else:
        sfx[i:i + n] += sig[:n] * gain

def whoosh(dur=1.1, peak=0.55, f0=300, f1=4500):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    env = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.6)
    l = sweep_filter(rng.standard_normal(n).astype(np.float32), f0, f1)
    r = sweep_filter(rng.standard_normal(n).astype(np.float32), f0 * 1.1, f1 * 0.95)
    hp_l = l - onepole_lp(l, 180); hp_r = r - onepole_lp(r, 180)
    st = np.stack([hp_l * env * np.linspace(1.2, 0.6, n), hp_r * env * np.linspace(0.6, 1.2, n)], 1)
    return st / (np.abs(st).max() + 1e-9)

def riser(dur=2.2):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = rng.standard_normal(n).astype(np.float32)
    x = x - onepole_lp(x, 1500)
    env = t ** 2.6
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * t ** 2) / SR) * 0.25
    y = (x * 0.8 + tone) * env
    return y / (np.abs(y).max() + 1e-9)

def impact(dur=3.5):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 30 + 45 * np.exp(-t * 7)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    nz = rng.standard_normal(n); nz = onepole_lp(nz.astype(np.float32), 2500) * np.exp(-t * 9) * 0.9
    sub = np.sin(2 * np.pi * 42 * t) * np.exp(-t * 2.4) * 0.5
    y = boom + nz + sub
    y = np.tanh(y * 1.4)
    return y / (np.abs(y).max() + 1e-9)

def shimmer(dur=2.4, base=2200):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for k in range(14):
        f = base * (1 + k * 0.37) * (1 + 0.15 * rng.random())
        on = rng.random() * dur * 0.5
        e = np.clip((t - on) * 30, 0, 1) * np.exp(-np.maximum(t - on, 0) * (2.5 + rng.random() * 2))
        y += np.sin(2 * np.pi * f * t + rng.random() * 6) * e / (1 + k * 0.2)
    sw = np.sin(2 * np.pi * np.cumsum(1800 + 5000 * (t / dur)) / SR) * np.sin(np.pi * t / dur) ** 2 * 0.15
    y = y + sw
    return y / (np.abs(y).max() + 1e-9)

def jingle(dur=1.6, density=26):
    n = int(dur * SR); y = np.zeros(n)
    tt = np.arange(int(0.18 * SR)) / SR
    for _ in range(int(density * dur)):
        s = int(rng.random() * (n - len(tt)))
        g = 0.35 + 0.65 * np.sin(np.pi * s / n)
        h = sum(np.sin(2 * np.pi * f * (1 + 0.02 * rng.standard_normal()) * tt) * a
                for f, a in ((2630, 1), (4150, .7), (5480, .5), (7190, .3)))
        y[s:s + len(tt)] += h * np.exp(-tt * 38) * g * (0.5 + rng.random() * 0.5)
    return y / (np.abs(y).max() + 1e-9)

def tick():
    n = int(0.06 * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * 3200 * t) * 0.6 + rng.standard_normal(n) * 0.4) * np.exp(-t * 160)
    return y / np.abs(y).max()

# ---- placement ----------------------------------------------------------------
place(jingle(2.4), 0.3, 0.10, -0.3)                      # opening sleigh-bell shimmer
place(shimmer(3.0, 1800), 1.0, 0.08, 0.3)
place(riser(1.4), B["announce"] - 1.4, 0.10)
place(whoosh(1.2), B["announce"] - 0.6, 0.22)
place(shimmer(2.6, 2400), C["festival"]["start"] - 0.1, 0.11, -0.2)  # festival title light sweep
place(riser(2.4), B["hit"] - 2.4, 0.16)
place(impact(), B["hit"], 0.40)
place(shimmer(3.0, 2000), B["hit"] + 0.05, 0.12, 0.2)
place(jingle(1.8), B["hit"] + 0.1, 0.08, 0.4)
for k in ("info", "leader", "oguibe", "ehiliz", "choirs", "overo", "chairman", "announcer"):
    place(whoosh(1.0 if k != "choirs" else 1.4), B[k] - 0.5, 0.13 if k != "choirs" else 0.2)
for k in ("leader", "oguibe", "ehiliz", "overo", "chairman", "announcer"):
    place(shimmer(2.0, 2600), B[k] + 0.35, 0.06, 0.0)
for i in range(4):                                       # soft clock ticks at the time reveal
    place(tick(), C["time"]["start"] - 0.2 + i * 0.5, 0.05, 0.1)
place(whoosh(1.0, f0=200, f1=2500), C["venue"]["start"] - 0.25, 0.08)   # location-pin drop
place(riser(2.0), B["finale"] - 2.0, 0.12)
place(whoosh(1.4), B["finale"] - 0.6, 0.2)
place(impact(4.0), B["finale"], 0.32)
place(jingle(2.5), B["finale"] + 0.1, 0.08, -0.4)
fin_chord = B["finale"] + 3 * (B["end"] - B["finale"]) / 5
place(impact(4.0), fin_chord, 0.30)
place(shimmer(4.0, 1600), fin_chord, 0.10)
place(jingle(3.0, 18), fin_chord + 1.0, 0.07, 0.3)

# ---- side-chain ducking ---------------------------------------------------------
hop = 480
rms = np.sqrt(np.convolve(voice ** 2, np.ones(hop * 4) / (hop * 4), mode="same")[::hop] + 1e-12)
active = (rms > 0.012).astype(np.float32)
env = np.zeros_like(active); s = 0.0
for i, a in enumerate(active):  # attack ~60ms, release ~450ms (per 10ms hop)
    s = s + (a - s) * (0.17 if a > s else 0.022); env[i] = s
env = np.interp(np.arange(N) / hop, np.arange(len(env)), env)
duck_db = -9.5

# musical levelling: bring soft passages up (partial, keeps the dynamic shape)
win = SR  # 1 s
mm = music.mean(axis=1)
r = np.sqrt(np.convolve(mm[::hop] ** 2, np.ones(win // hop) / (win // hop), mode="same") + 1e-12)
r_db = 20 * np.log10(r)
lev_db = np.clip((-23.0 - r_db) * 0.75, -6, 15)
lev_db = np.convolve(lev_db, np.ones(150) / 150, mode="same")  # smooth ~1.5 s
lev = 10 ** (np.interp(np.arange(N) / hop, np.arange(len(lev_db)), lev_db) / 20)
music = music * lev[:, None]
music_gain = 10 ** ((duck_db * env) / 20)

m_level = 0.8
# lift the instrumental-only moments (opening and the grand finale after the last word)
lift_db = np.zeros(N)
tt = np.arange(N) / SR
lift_db += 3.0 * np.clip((C["intro"]["start"] - tt) / 0.8, 0, 1)
lift_db += 6.0 * np.clip((tt - C["finale3"]["end"]) / 0.6, 0, 1)
music_gain = music_gain * 10 ** (lift_db / 20)
mix = music * (m_level * music_gain)[:, None] + sfx + np.stack([voice, voice], 1) * 1.0
# final gentle fade out
fo = int(1.2 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write(os.path.join(ROOT, "public/audio/stems/sfx.wav"), sfx, SR, subtype="PCM_24")
sf.write(os.path.join(ROOT, "public/audio/stems/mix_pre.wav"), mix.astype(np.float32), SR, subtype="FLOAT")
print("peak", float(np.abs(mix).max()))
