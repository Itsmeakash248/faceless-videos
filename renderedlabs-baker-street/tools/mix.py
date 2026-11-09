"""The 1971 Baker Street Bank Heist — Procedural Sound Design & Mix (100% code, numpy/scipy).
Bespoke sound design for the Baker Street Heist:
- Subterranean tension bed in D-minor
- 20-ton vault door steel clank
- Shovel digging & spoil rubble
- Diamond core drill grinding against reinforced concrete rebar
- 100-ton hydraulic jack metal stress groaning & well water sinking
- 3,000°C thermal lance oxygen hiss & crackle
- Muffled gelignite blast timed to traffic (heavy subterranean sub-bass boom)
- Safe-deposit box crowbar pry & spilling gold coins
- 1970s radio static, tuning whistle & walkie-talkie squelch chirp
- Scotland Yard archival rubber stamp thud
"""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from scipy import signal

P = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SR = 48000
rng = np.random.default_rng(1971)

cues_file = P / 'data/cues.json'
cues = json.loads(cues_file.read_text()) if cues_file.exists() else []
lines_file = P / 'data/lines.json'
lines = json.loads(lines_file.read_text()) if lines_file.exists() else {'duration': 44.2, 'lines': []}

DUR = float(sys.argv[2]) if len(sys.argv) > 2 else max(lines.get('duration', 44.2), 44.2)
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

def reverb_ir(rt=0.8, pre=0.015, damp=3000):
    n = int(rt * 1.3 * SR); t = tt(n); e = np.exp(-6.9 * t / rt)
    ir = np.zeros((n + int(pre * SR), 2))
    ir[int(pre * SR):, 0] = lp(noise(n), damp) * e
    ir[int(pre * SR):, 1] = lp(noise(n), damp) * e
    return ir / max(1e-6, np.sqrt((ir ** 2).sum() / 2))

ROOM = reverb_ir(0.5, 0.008, 2800)
VAULT_REV = reverb_ir(1.6, 0.03, 2200)
TUNNEL_REV = reverb_ir(1.1, 0.02, 1800)

def verb(x, ir, wet=0.28):
    if x.ndim == 1: x = np.stack([x, x], 1)
    y = np.stack([signal.fftconvolve(x[:, k], ir[:, k])[: len(x)] for k in range(2)], 1)
    return x * (1 - wet) + y * wet

# ── BESPOKE HEIST PROCEDURAL SOUND GENERATORS ──

def whoosh(dur=0.45, lo=250, hi=1500):
    n = int(dur * SR); t = tt(n)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return lp(bp(noise(n), lo, hi, 2), 2200) * e

def blip(f=780, g=1.0):
    n = int(0.18 * SR); t = tt(n)
    x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 30)) * np.exp(-t * 24) * np.minimum(1, t / 0.005)
    return lp(x, 2600) * g

def clank():
    """Heavy 20-ton vault door locking bolt clank"""
    n = int(0.7 * SR); t = tt(n)
    tone = (np.sin(2 * np.pi * 140 * t) * 0.7 + np.sin(2 * np.pi * 320 * t) * 0.4 + np.sin(2 * np.pi * 780 * t) * 0.2) * np.exp(-t * 14)
    th = lp(noise(n), 350) * np.exp(-t * 28) * 0.8
    return lp(tone + th, 1800)

def dig():
    """Shovel blade slicing into damp gravel and clay"""
    n = int(0.55 * SR); t = tt(n)
    scrap = bp(noise(n), 300, 1800, 2) * np.exp(-t * 12) * (1 + 0.5 * np.sin(2 * np.pi * 18 * t))
    th = lp(noise(n), 200) * np.exp(-t * 22) * 0.6
    return lp(scrap * 0.8 + th, 2000)

def scrape(dur=0.7):
    n = int(dur * SR); t = tt(n)
    x = bp(noise(n), 220, 1200, 2) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 8 * t)))
    return lp(x * env(n, 0.04, 0.1), 1400)

def rubble():
    """Tumbling rock, brick fragments and dirt chunks"""
    n = int(0.9 * SR); out = np.zeros(n)
    for _ in range(8):
        i = rng.integers(0, max(1, n - 4000))
        m = int(0.08 * SR); tm = tt(m)
        f0 = rng.uniform(80, 260)
        out[i:i + m] += np.sin(2 * np.pi * f0 * tm) * np.exp(-tm * 40) * rng.uniform(0.4, 0.9)
    return lp(out + lp(noise(n), 400) * 0.3 * np.exp(-tt(n) * 6), 1600)

def drill(dur=1.8):
    """Heavy diamond core drill grinding through reinforced concrete and rebar"""
    n = int(dur * SR); t = tt(n)
    motor = (np.sin(2 * np.pi * 165 * t) + 0.4 * np.sin(2 * np.pi * 330 * t) + 0.25 * np.sin(2 * np.pi * 660 * t))
    grit = bp(noise(n), 800, 3200, 2) * (0.7 + 0.3 * np.sin(2 * np.pi * 24 * t))
    return lp((motor * 0.5 + grit * 0.6) * env(n, 0.08, 0.15), 2800)

def jack_groan(dur=2.0):
    """100-ton hydraulic jack groaning under extreme mechanical stress"""
    n = int(dur * SR); t = tt(n)
    pitch = 95 - 25 * (t / dur) + 8 * np.sin(2 * np.pi * 2.5 * t)
    ph = np.cumsum(pitch) / SR
    stress = (np.sin(2 * np.pi * ph) + 0.5 * np.sin(4 * np.pi * ph) + 0.25 * np.sin(6 * np.pi * ph))
    metal = bp(noise(n), 200, 800, 2) * 0.3
    return lp((stress + metal) * env(n, 0.1, 0.2), 1200)

def splash():
    """Sinking into murky mud and well water"""
    n = int(0.8 * SR); t = tt(n)
    th = lp(noise(n), 180) * np.exp(-t * 12) * 0.9
    slosh = bp(noise(n), 400, 1800, 2) * np.exp(-t * 9) * 0.5
    return lp(th + slosh, 1500)

def lance_hiss(dur=1.8):
    """Thermal lance burning at 3,000°C with oxygen roar and sputtering sparks"""
    n = int(dur * SR); t = tt(n)
    jet = bp(noise(n), 500, 4200, 2) * (0.8 + 0.2 * np.sin(2 * np.pi * 14 * t))
    roar = lp(noise(n), 350) * 0.6
    return lp((jet * 0.7 + roar * 0.5) * env(n, 0.05, 0.12), 3500)

def click():
    n = int(0.12 * SR); t = tt(n)
    return lp(np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 100) + lp(noise(n), 1400) * np.exp(-t * 120) * 0.5, 2200)

def blast():
    """Subterranean gelignite explosion muffled by 3 feet of concrete floor"""
    n = int(1.8 * SR); t = tt(n)
    # Massive subterranean sub-bass boom (45 Hz dropping to 18 Hz)
    f = 48 * np.exp(-t * 2.8) + 16
    ph = np.cumsum(f) / SR
    sub = np.sin(2 * np.pi * ph) * np.exp(-t * 3.5) * 1.5
    # Muffled concussive thump
    th = lp(noise(n), 220) * np.exp(-t * 6.0) * 1.2
    # Reverberant concrete dust roar
    dust = bp(noise(n), 80, 500, 2) * np.exp(-t * 2.2) * 0.6
    return lp(sub + th + dust, 750)

def box_pry(dur=1.5):
    """Crowbar prying open brass safe deposit box door"""
    n = int(dur * SR); t = tt(n)
    screech = bp(noise(n), 1200, 3600, 2) * np.exp(-t * 4) * 0.4
    snap = (np.sin(2 * np.pi * 480 * t) + np.sin(2 * np.pi * 920 * t)) * np.exp(-t * 35) * 0.8
    return lp(screech + snap, 3200)

def coins():
    """Chime of gold coins, jewellery, and cash boxes spilling"""
    n = int(1.1 * SR); out = np.zeros(n)
    freqs = [1860, 2240, 2750, 3120, 3500, 3920]
    for _ in range(12):
        i = rng.integers(0, max(1, n - 4000))
        m = int(0.08 * SR); tm = tt(m)
        f = rng.choice(freqs)
        out[i:i + m] += np.sin(2 * np.pi * f * tm) * np.exp(-tm * 65) * rng.uniform(0.2, 0.6)
    return lp(out, 4200)

def radio_static(dur=1.8):
    """1970s AM communications receiver static and heterodyne whistle"""
    n = int(dur * SR); t = tt(n)
    stat = bp(noise(n), 400, 2800, 2) * 0.35
    whistle = np.sin(2 * np.pi * (1150 + 80 * np.sin(2 * np.pi * 3 * t)) * t) * 0.18
    return lp(stat + whistle, 2800) * env(n, 0.05, 0.1)

def squelch():
    """Two-way radio push-to-talk squelch burst"""
    n = int(0.18 * SR); t = tt(n)
    chirp = np.sin(2 * np.pi * np.linspace(2200, 1400, n) * t) * np.exp(-t * 30) * 0.4
    pop = bp(noise(n), 800, 3200, 2) * np.exp(-t * 40) * 0.5
    return lp(chirp + pop, 3000)

def stamp_thud():
    """Official heavy wooden rubber stamp slamming down on dossier"""
    n = int(0.4 * SR); t = tt(n)
    th = lp(noise(n), 320) * np.exp(-t * 30) * 0.9
    snap = np.sin(2 * np.pi * 850 * t) * np.exp(-t * 60) * 0.4
    return lp(th + snap, 1600)

def sub_drone(dur=3.0):
    """Subterranean heist drone in D minor"""
    n = int(dur * SR); t = tt(n)
    d = (np.sin(2 * np.pi * 73.42 * t) * 0.6 + np.sin(2 * np.pi * 110 * t) * 0.3 + np.sin(2 * np.pi * 146.83 * t) * 0.2)
    return lp(d + lp(noise(n), 120) * 0.25, 400) * env(n, 0.3, 0.5)

# ── HEIST SCORE: DARK D-MINOR ANALOG SYNTH BED ──
t_arr = tt(N)
def dark_pad(notes, dur, g=1.0):
    n = int(dur * SR); tm = tt(n); y = np.zeros(n)
    for m in notes:
        f = 440 * 2 ** ((m - 69) / 12)
        for detune in (-0.004, 0.004):
            ph = (f * (1 + detune) * tm) % 1.0
            y += (2 * ph - 1)
    return lp(y / (2 * len(notes)), 650) * env(n, 0.6, 0.6) * g

# D minor · Bb · F · A7 progression (classic British true-crime doc cadence)
prog = [
    [38, 50, 53, 57], # Dm
    [34, 46, 50, 53], # Bb
    [41, 53, 57, 60], # F
    [33, 45, 52, 57]  # A7
]
music = np.zeros((N, 2))
bar = 3.8; k = 0; tb = 0.0
while tb < DUR:
    ch = prog[k % len(prog)]
    place(music, dark_pad(ch, bar + 0.8, 0.45), tb, pan=0.0)
    tb += bar; k += 1

music = verb(music, VAULT_REV, 0.35)
music *= np.minimum(1, t_arr / 0.2)[:, None]

# ── PLACE ALL SOUND DESIGN CUES ──
fx = np.zeros((N, 2))
for c in C.get('cut', []): place(fx, whoosh(0.28, 300, 1400) * 0.08, c['t'] - 0.1)
for c in C.get('whoosh', []): place(fx, verb(whoosh(0.55), ROOM, 0.25) * 0.3 * c.get('gain', 1), c['t'] - 0.25)
for i, c in enumerate(C.get('blip', [])): place(fx, verb(blip([780, 880, 680, 920][i % 4], c.get('gain', 1)), ROOM, 0.2) * 0.35, c['t'])
for c in C.get('sub_drone', []): place(fx, sub_drone(c.get('dur', 3.0)) * 0.45 * c.get('gain', 1), c['t'])
for c in C.get('clank', []): place(fx, verb(clank(), VAULT_REV, 0.4) * 0.65 * c.get('gain', 1), c['t'])
for c in C.get('dig', []): place(fx, verb(dig(), TUNNEL_REV, 0.3) * 0.55 * c.get('gain', 1), c['t'])
for c in C.get('scrape', []): place(fx, verb(scrape(), TUNNEL_REV, 0.25) * 0.5 * c.get('gain', 1), c['t'])
for c in C.get('rubble', []): place(fx, verb(rubble(), TUNNEL_REV, 0.35) * 0.6 * c.get('gain', 1), c['t'])
for c in C.get('drill', []): place(fx, verb(drill(c.get('dur', 1.8)), TUNNEL_REV, 0.35) * 0.55 * c.get('gain', 1), c['t'])
for c in C.get('jack_groan', []): place(fx, verb(jack_groan(c.get('dur', 2.0)), TUNNEL_REV, 0.4) * 0.65 * c.get('gain', 1), c['t'])
for c in C.get('splash', []): place(fx, verb(splash(), TUNNEL_REV, 0.35) * 0.55 * c.get('gain', 1), c['t'])
for c in C.get('lance_hiss', []): place(fx, verb(lance_hiss(c.get('dur', 1.8)), TUNNEL_REV, 0.3) * 0.6 * c.get('gain', 1), c['t'])
for c in C.get('click', []): place(fx, verb(click(), ROOM, 0.2) * 0.6 * c.get('gain', 1), c['t'])
for c in C.get('blast', []): place(fx, verb(blast(), VAULT_REV, 0.5) * 1.1 * c.get('gain', 1), c['t'])
for c in C.get('box_pry', []): place(fx, verb(box_pry(c.get('dur', 1.5)), VAULT_REV, 0.35) * 0.65 * c.get('gain', 1), c['t'])
for c in C.get('coins', []): place(fx, verb(coins(), VAULT_REV, 0.3) * 0.6 * c.get('gain', 1), c['t'])
for c in C.get('radio_static', []): place(fx, verb(radio_static(c.get('dur', 1.8)), ROOM, 0.2) * 0.5 * c.get('gain', 1), c['t'])
for c in C.get('squelch', []): place(fx, verb(squelch(), ROOM, 0.2) * 0.65 * c.get('gain', 1), c['t'])
for c in C.get('stamp_thud', []): place(fx, verb(stamp_thud(), ROOM, 0.25) * 0.75 * c.get('gain', 1), c['t'])

# ── LOAD VOICEOVER STEM ──
narration_file = P / 'data/narration.wav'
if narration_file.exists():
    vox, vox_sr = sf.read(str(narration_file))
    if vox.ndim == 1: vox = np.stack([vox, vox], 1)
    if len(vox) < N:
        pad = np.zeros((N - len(vox), 2))
        vox = np.concatenate([vox, pad], 0)
    else:
        vox = vox[:N]
else:
    vox = np.zeros((N, 2))

# Duck music under voiceover
vox_env = lp(np.abs(vox).mean(1), 8)
duck = np.clip(1.0 - vox_env * 2.2, 0.32, 1.0)[:, None]
music *= duck

# ── MASTER MIX ──
mix = vox * 0.95 + music * 0.75 + fx * 0.85
peak = np.abs(mix).max()
if peak > 0.95:
    mix = mix * (0.95 / peak)

(P / 'data').mkdir(parents=True, exist_ok=True)
mix_wav = P / 'data/mix.wav'
sf.write(str(mix_wav), mix, SR)
print(f'Rendered mix: {mix_wav} ({DUR:.2f}s)')
