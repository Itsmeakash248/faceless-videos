"""Project Azorian (K-129) — Procedural Sound Design & Mix (100% code, numpy/scipy).
Bespoke sound design for the CIA's $500M Submarine Heist at 16,500 Feet:
- Abyssal deep-ocean tension bed in C-minor (oceanic sub-bass, 3 miles down)
- Deep ocean sonar pings (880 Hz & 1100 Hz with oceanic decay)
- Submarine hull implosion thump & acoustic shockwave
- US Navy SOSUS hydrophone array hum & alert blip
- Hughes Glomar Explorer moon pool hydraulic doors opening underwater
- 3-mile heavy steel pipe string winch & tension groan
- Mechanical capture claw ("Clementine") hydraulic clamp & lock onto K-129 hull
- Catastrophic claw tine fracture (high-stress steel shear crack & hull tearing)
- Broken hull plunging back into the oceanic abyss
- Solemn naval ship's bell toll & ocean swell for burial at sea
- 1975 press conference camera shutters, flashbulb pops & briefcase latch snap
"""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from scipy import signal

P = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SR = 48000
rng = np.random.default_rng(1968)

cues_file = P / 'data/cues.json'
cues = json.loads(cues_file.read_text()) if cues_file.exists() else []
lines_file = P / 'data/lines.json'
lines = json.loads(lines_file.read_text()) if lines_file.exists() else {'duration': 44.62, 'lines': []}

DUR = float(sys.argv[2]) if len(sys.argv) > 2 else max(lines.get('duration', 44.62), 44.62)
N = int(DUR * SR)
C = {}
for c in cues: C.setdefault(c['type'], []).append(c)

def lp(x, f, o=2):
    b, a = signal.butter(o, min(0.99, f / (SR / 2)), 'low')
    return signal.lfilter(b, a, x, axis=0)

def hp(x, f, o=2):
    b, a = signal.butter(o, min(0.99, f / (SR / 2)), 'high')
    return signal.lfilter(b, a, x, axis=0)

def bp(x, f0, f1, o=2):
    b, a = signal.butter(o, [min(0.98, f0 / (SR / 2)), min(0.99, f1 / (SR / 2))], 'band')
    return signal.lfilter(b, a, x, axis=0)

def tt(n): return np.arange(n) / SR
def noise(n): return rng.standard_normal(n)

def place(buf, x, t, g=1.0, pan=0.0):
    if x.ndim == 1:
        x = np.stack([x * np.cos((pan + 1) * np.pi / 4) * 1.414, x * np.sin((pan + 1) * np.pi / 4) * 1.414], 1)
    i = int(round(t * SR))
    if i >= len(buf): return
    if i < 0:
        x = x[-i:]; i = 0
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * g

def env(n, a=0.005, r=0.1):
    t = tt(n); d = n / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)

def reverb_ir(rt=1.4, pre=0.02, damp=2200):
    n = int(rt * 1.3 * SR); t = tt(n); e = np.exp(-6.9 * t / rt)
    ir = np.zeros((n + int(pre * SR), 2))
    ir[int(pre * SR):, 0] = lp(noise(n), damp) * e
    ir[int(pre * SR):, 1] = lp(noise(n), damp) * e
    return ir / max(1e-6, np.sqrt((ir ** 2).sum() / 2))

OCEAN_REV = reverb_ir(2.2, 0.04, 1600)
HULL_REV = reverb_ir(1.6, 0.02, 2400)
ROOM_REV = reverb_ir(0.6, 0.01, 2800)

def verb(x, ir, wet=0.35):
    if x.ndim == 1: x = np.stack([x, x], 1)
    y = np.stack([signal.fftconvolve(x[:, k], ir[:, k])[: len(x)] for k in range(2)], 1)
    return x * (1 - wet) + y * wet

# ── PROCEDURAL SOUND EFFECTS GENERATORS ──

def sonar_ping(f=880, dur=1.8):
    """Submarine active sonar ping with echoing acoustic decay"""
    n = int(dur * SR); t = tt(n)
    sig = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.5)
    harm = 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6.0)
    sig = sig + harm
    sig = sig * np.minimum(1, t / 0.005)
    return verb(lp(sig, 2400), OCEAN_REV, wet=0.55)

def implosion_boom():
    """Deep ocean hull implosion shockwave at 16,500 ft (sub-bass boom + cavity collapse)"""
    n = int(2.4 * SR); t = tt(n)
    # 42 Hz dropping to 14 Hz
    f = 46 * np.exp(-t * 2.2) + 12
    ph = np.cumsum(f) / SR
    sub = np.sin(2 * np.pi * ph) * np.exp(-t * 2.5) * 1.8
    # Cavity bubble collapse thump
    thump = lp(noise(n), 160) * np.exp(-t * 4.5) * 1.4
    # Deep water churning rumble
    rumble = bp(noise(n), 30, 220, 2) * np.exp(-t * 1.8) * 0.8
    return verb(lp(sub + thump + rumble, 450), OCEAN_REV, wet=0.45)

def hydrophone_ping():
    """SOSUS underwater acoustic array detection beep"""
    n = int(0.22 * SR); t = tt(n)
    f = 1250
    sig = np.sin(2 * np.pi * f * t) * np.exp(-t * 22) * np.minimum(1, t / 0.004)
    stat = bp(noise(n), 600, 2400, 2) * np.exp(-t * 30) * 0.2
    return lp(sig + stat, 2800)

def moon_pool_open(dur=2.0):
    """Glomar Explorer moon pool hydraulic gates sliding open underwater"""
    n = int(dur * SR); t = tt(n)
    motor = (np.sin(2 * np.pi * 92 * t) + 0.4 * np.sin(2 * np.pi * 184 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 3 * t))
    water = bp(noise(n), 80, 650, 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.5 * t))
    mech = bp(noise(n), 300, 1400, 2) * 0.35
    return lp((motor * 0.6 + water * 0.8 + mech * 0.4) * env(n, 0.1, 0.2), 1800)

def pipe_winch(dur=2.2):
    """3-mile steel pipe string winch lowering with metallic ratcheting"""
    n = int(dur * SR); t = tt(n)
    whine = np.sin(2 * np.pi * (240 + 40 * np.sin(2 * np.pi * 8 * t)) * t) * 0.4
    clank = bp(noise(n), 350, 2200, 2) * (0.5 + 0.5 * np.sin(2 * np.pi * 16 * t))
    groan = np.sin(2 * np.pi * 78 * t) * 0.3
    return lp((whine + clank * 0.6 + groan) * env(n, 0.08, 0.18), 2400)

def claw_clamp():
    """Mechanical capture claw 'Clementine' closing onto K-129 submarine hull"""
    n = int(1.4 * SR); t = tt(n)
    # Heavy hydraulic clamp impact
    impact = lp(noise(n), 280) * np.exp(-t * 18) * 1.5
    # Steel ring of claw jaws
    ring = (np.sin(2 * np.pi * 210 * t) * 0.8 + np.sin(2 * np.pi * 440 * t) * 0.5 + np.sin(2 * np.pi * 820 * t) * 0.3) * np.exp(-t * 9)
    # Hydraulic lock hiss
    hiss = bp(noise(n), 800, 3000, 2) * np.exp(-t * 12) * 0.4
    return verb(lp(impact + ring + hiss, 2200), HULL_REV, wet=0.4)

def tine_snap():
    """Catastrophic claw tine fracture under 16,000 ft pressure (extreme steel shear crack)"""
    n = int(2.2 * SR); t = tt(n)
    # High frequency explosive fracture crack
    snap = hp(noise(n), 1200) * np.exp(-t * 60) * 2.2
    # Heavy metal shockwave resonance
    res = (np.sin(2 * np.pi * 320 * t) + 0.6 * np.sin(2 * np.pi * 580 * t) + 0.4 * np.sin(2 * np.pi * 960 * t)) * np.exp(-t * 14) * 1.3
    # Sub-aquatic concussion thump
    thump = lp(noise(n), 140) * np.exp(-t * 8) * 1.6
    # Searing metallic scream
    screech = bp(noise(n), 1800, 4800, 2) * np.exp(-t * 24) * 0.7
    return verb(lp(snap + res + thump + screech, 3800), OCEAN_REV, wet=0.5)

def hull_plunge(dur=2.6):
    """Submarine section breaking free and plunging back into the black abyss"""
    n = int(dur * SR); t = tt(n)
    f = 35 * np.exp(-t * 0.8) + 10
    ph = np.cumsum(f) / SR
    sub = np.sin(2 * np.pi * ph) * np.exp(-t * 0.9) * 1.2
    water = bp(noise(n), 60, 400, 2) * np.exp(-t * 0.7) * 1.0
    bubble = bp(noise(n), 200, 1100, 2) * np.exp(-t * 1.2) * 0.5
    return lp(sub + water + bubble, 700) * env(n, 0.05, 0.3)

def naval_bell(f=520, dur=2.5):
    """Solemn naval ship's bell for burial at sea"""
    n = int(dur * SR); t = tt(n)
    strike = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.02 * t) + 0.25 * np.sin(2 * np.pi * f * 3.1 * t)) * np.exp(-t * 3.2)
    return verb(lp(strike, 3200), ROOM_REV, wet=0.45)

def camera_flash():
    """1975 press conference camera shutter & flashbulb pop"""
    n = int(0.25 * SR); t = tt(n)
    pop = hp(noise(n), 2500) * np.exp(-t * 140) * 1.2
    shutter = (np.sin(2 * np.pi * 1400 * t) + lp(noise(n), 1800)) * np.exp(-t * 45) * 0.6
    return lp(pop + shutter, 5000)

def whoosh(dur=0.4, lo=200, hi=1200):
    n = int(dur * SR); t = tt(n)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return lp(bp(noise(n), lo, hi, 2), 2200) * e

def blip(f=820, g=1.0):
    n = int(0.16 * SR); t = tt(n)
    x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 26) * np.minimum(1, t / 0.004)
    return lp(x, 2800) * g

# ── AMBIENT DEEP OCEAN SCORE (C MINOR TENSION BED) ──
def ocean_pad(notes, dur, g=1.0):
    n = int(dur * SR); tm = tt(n); y = np.zeros(n)
    for m in notes:
        f = 440 * 2 ** ((m - 69) / 12)
        for detune in (-0.003, 0.003):
            ph = (f * (1 + detune) * tm) % 1.0
            y += (2 * ph - 1)
    return lp(y / (2 * len(notes)), 550) * env(n, 0.8, 0.8) * g

# Synthesize multi-track bed:
print("Synthesizing ocean bed and atmospheric tension…")
score = np.zeros((N, 2))

# Atmospheric C-minor drone chords:
# Intro: Cm (C3, Eb3, G3) -> 48, 51, 55
# Ocean depth: Cm9 (C2, G2, Eb3, Bb3, D4)
# Climax: Abmaj7 -> Gsus4 -> Cm
prog = [
    (0.0, 11.5, [36, 48, 51, 55], 0.22),      # Vanished in Pacific
    (11.5, 23.5, [36, 43, 48, 51, 58], 0.25), # 3 miles deep / Claw ship
    (23.5, 32.0, [32, 44, 48, 55], 0.28),      # Claws clamp / Tines snap
    (32.0, 40.0, [36, 41, 46, 50], 0.24),      # Abyss plunge / 38ft recovery
    (40.0, DUR,  [36, 43, 48, 55], 0.26),      # Press conference / Glomar response
]

for t0, t1, notes, gain in prog:
    dur = t1 - t0
    seg = ocean_pad(notes, dur, gain)
    place(score, seg, t0, g=1.0, pan=0.0)

# Abyssal deep ocean sub-rumble layer (under 60 Hz)
t_all = tt(N)
sub_bed = (np.sin(2 * np.pi * 32.7 * t_all) * 0.4 + np.sin(2 * np.pi * 43.6 * t_all) * 0.25) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.2 * t_all))
sub_noise = lp(noise(N), 70) * 0.2
place(score, (sub_bed + sub_noise) * 0.18, 0, g=1.0)

# ── PLACE PROCEDURAL SOUND EFFECTS AT NARRATIVE CUES ──
print("Placing procedural sound design cues…")
fx = np.zeros((N, 2))

# 1. Opening: Sonar ping in cold deep ocean
place(fx, sonar_ping(840, 2.0), 0.8, g=0.75, pan=-0.2)
place(fx, whoosh(0.6, 120, 800), 1.8, g=0.45)

# 2. Soviet search fleets
place(fx, sonar_ping(980, 1.8), 5.6, g=0.65, pan=0.3)

# 3. US Hydrophone detection & Implosion
place(fx, hydrophone_ping(), 7.8, g=0.85, pan=-0.4)
place(fx, hydrophone_ping(), 8.3, g=0.75, pan=-0.3)
place(fx, implosion_boom(), 8.8, g=1.2, pan=0.0)

# 4. Over 3 miles deep - abyssal depth drop
place(fx, whoosh(0.8, 80, 500), 11.8, g=0.65)
place(fx, sonar_ping(720, 2.4), 12.2, g=0.85, pan=0.0)

# 5. Glomar Explorer moon pool opening
place(fx, moon_pool_open(2.2), 14.2, g=0.85, pan=-0.1)

# 6. Lowering 3 miles of pipe
place(fx, pipe_winch(2.4), 18.2, g=0.8, pan=0.2)

# 7. Claw seizing the hull
place(fx, claw_clamp(), 21.2, g=1.1, pan=0.0)

# 8. Halfway up tension
place(fx, whoosh(0.5, 180, 900), 23.8, g=0.55)

# 9. CATASTROPHIC TINE SNAP
place(fx, tine_snap(), 26.4, g=1.35, pan=0.0)

# 10. Broken hull plunging back into the abyss
place(fx, hull_plunge(3.0), 29.8, g=1.15, pan=0.0)
place(fx, sonar_ping(620, 2.5), 31.0, g=0.7, pan=0.0)

# 11. 38-foot bow section recovery + naval burial at sea
place(fx, claw_clamp(), 32.6, g=0.75, pan=-0.2)
place(fx, naval_bell(520, 2.6), 34.5, g=0.8, pan=0.1)
place(fx, naval_bell(520, 2.6), 36.2, g=0.7, pan=0.1)

# 12. Press conference & Glomar response
place(fx, camera_flash(), 38.2, g=0.7, pan=-0.3)
place(fx, camera_flash(), 38.6, g=0.8, pan=0.4)
place(fx, camera_flash(), 39.1, g=0.65, pan=-0.2)
place(fx, blip(940, 0.8), 41.0, g=0.6)
place(fx, camera_flash(), 43.8, g=0.75, pan=0.2)

# ── READ NARRATION & DUCK THE MUSIC BED ──
print("Loading narration and applying voice ducking…")
narr_file = P / 'data/narration.wav'
narr, nsr = sf.read(str(narr_file))
if narr.ndim == 1: narr = np.stack([narr, narr], 1)
if len(narr) < N:
    narr = np.pad(narr, ((0, N - len(narr)), (0, 0)))
else:
    narr = narr[:N]

# Calculate ducking envelope from narration amplitude
narr_mono = np.abs(narr).mean(axis=1)
# Smooth narration envelope
b_duck, a_duck = signal.butter(2, 3.0 / (SR / 2), 'low')
duck_env = signal.filtfilt(b_duck, a_duck, narr_mono)
duck_env = np.clip(duck_env * 5.0, 0, 1)

# Duck the score by -9 dB (gain 0.35) during speech
duck_gain = 1.0 - 0.65 * duck_env
score[:, 0] *= duck_gain
score[:, 1] *= duck_gain

# Master mix summing:
# Voice (-16 LUFS target) + Ducked Score (-18 dB) + Dynamic SFX
mix = narr * 0.95 + score * 0.65 + fx * 0.85

# Soft peak limiter to avoid clipping
peak = np.abs(mix).max()
if peak > 0.95:
    mix = mix * (0.95 / peak)

out_file = P / 'data/mix.wav'
sf.write(str(out_file), mix, SR)
# Also copy to assets/audio/mix.wav for HyperFrames
out_assets = P / 'assets/audio/mix.wav'
out_assets.parent.mkdir(parents=True, exist_ok=True)
sf.write(str(out_assets), mix, SR)

print(f"Bespoke Procedural Mix written to {out_file} and {out_assets} ({DUR:.2f}s)")
