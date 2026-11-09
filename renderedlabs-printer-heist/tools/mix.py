"""Procedural sound design + music bed ducking + narration mix for RenderedLabs Printer Heist."""
import json, os, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(42)

def lp(x, f, o=2):
    b, a = signal.butter(o, min(f, SR * 0.48) / (SR / 2), 'low')
    return signal.lfilter(b, a, x, axis=0)

def hp(x, f, o=2):
    b, a = signal.butter(o, max(f, 20) / (SR / 2), 'high')
    return signal.lfilter(b, a, x, axis=0)

def bp(x, f0, f1, o=2):
    b, a = signal.butter(o, [max(20, f0) / (SR / 2), min(SR * 0.48, f1) / (SR / 2)], 'band')
    return signal.lfilter(b, a, x, axis=0)

def tt(n):
    return np.arange(n) / SR

def env(n, a=0.01, r=0.1):
    e = np.ones(n)
    ka = max(1, int(a * SR))
    kr = max(1, int(r * SR))
    e[:ka] = np.linspace(0, 1, ka)
    e[-kr:] *= np.linspace(1, 0, kr) ** 1.5
    return e

def norm(x, p=0.88):
    m = np.abs(x).max()
    return (x / max(1e-9, m)) * p if m > 0 else x

def place(buf, x, at, g=1.0, pan=0.0):
    if x.ndim == 1:
        # Stereo panner
        left = x * np.cos((pan + 1.0) * np.pi / 4.0)
        right = x * np.sin((pan + 1.0) * np.pi / 4.0)
        x = np.stack([left, right], axis=1)
    i = int(round(at * SR))
    if i >= len(buf):
        return
    if i < 0:
        x = x[-i:]
        i = 0
    end = min(len(buf), i + len(x))
    buf[i:end] += x[:end - i] * g

# ---------- Procedural SFX Generators ----------
def make_whoosh(dur=0.45, f0=300, f1=1200):
    n = int(dur * SR)
    white = rng.standard_normal(n)
    freqs = np.geomspace(max(40, f0), min(f1, 8000), n)
    phase = 2 * np.pi * np.cumsum(freqs) / SR
    s = np.sin(phase) * 0.5 + white * 0.5
    e = np.sin(np.pi * np.clip(tt(n) / dur, 0, 1)) ** 2
    return norm(bp(s * e, min(f0, f1) * 0.5, max(f0, f1) * 1.5)) * 0.7

def make_thunk(f=100, decay=10):
    n = int(0.5 * SR)
    s = tt(n)
    body = np.sin(2 * np.pi * f * s * (1.0 + 0.5 * np.exp(-s * 25))) * np.exp(-s * decay)
    click = lp(rng.standard_normal(n), 1500) * np.exp(-s * 80) * 0.3
    return norm(body + click) * 0.8

def make_keystrokes(count=12, speed=0.08):
    tot = int((count * speed + 0.2) * SR)
    out = np.zeros(tot)
    for k in range(count):
        pos = int(k * speed * SR + rng.uniform(-0.015, 0.015) * SR)
        m = int(0.04 * SR)
        s = tt(m)
        click = lp(rng.standard_normal(m), 4000) * np.exp(-s * 150)
        ping = np.sin(2 * np.pi * rng.uniform(1800, 3200) * s) * np.exp(-s * 90) * 0.3
        k_sound = (click + ping) * rng.uniform(0.6, 1.0)
        if pos + m < tot and pos >= 0:
            out[pos:pos + m] += k_sound
    return norm(hp(out, 600)) * 0.65

def make_printer_gear(dur=1.2, mode="active"):
    n = int(dur * SR)
    s = tt(n)
    # Stepper motor tone with rapid harmonic modulation
    motor_f = 240 if mode == "active" else 120
    motor = np.sin(2 * np.pi * motor_f * s) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * s))
    # Gear grinding tooth clicks
    clicks = rng.standard_normal(n) * (np.sin(2 * np.pi * 36 * s) > 0.8).astype(float)
    grind = bp(clicks, 1200, 4500) * 0.4
    sound = norm(lp(motor + grind, 3500)) * env(n, 0.05, 0.1)
    return sound * 0.6

def make_paper_feed(dur=1.0, mode="spit"):
    n = int(dur * SR)
    s = tt(n)
    # Friction noise
    fric = bp(rng.standard_normal(n), 800, 3200) * (1.0 + 0.5 * np.sin(2 * np.pi * 8 * s))
    feed_e = env(n, 0.08, 0.15)
    return norm(fric * feed_e) * 0.55

def make_server_buzz(dur=3.0, f0=120):
    n = int(dur * SR)
    s = tt(n)
    # 60Hz harmonics + cooling fan noise
    hum = (np.sin(2 * np.pi * 60 * s) +
           0.5 * np.sin(2 * np.pi * 120 * s) +
           0.25 * np.sin(2 * np.pi * 180 * s) +
           0.15 * np.sin(2 * np.pi * f0 * s))
    fan = bp(rng.standard_normal(n), 200, 1800) * 0.35
    sound = norm(hum * 0.6 + fan) * env(n, 0.2, 0.3)
    return sound * 0.4

def make_casino_chips(count=12, dur=1.5):
    tot = int(dur * SR)
    out = np.zeros(tot)
    for k in range(count):
        pos = int(rng.uniform(0.05, dur - 0.1) * SR)
        m = int(0.06 * SR)
        s = tt(m)
        f_chip = rng.uniform(2600, 4800)
        chip = np.sin(2 * np.pi * f_chip * s) * np.exp(-s * 110)
        clack = lp(rng.standard_normal(m), 5000) * np.exp(-s * 180) * 0.4
        c_sound = (chip + clack) * rng.uniform(0.5, 1.0)
        if pos + m < tot and pos >= 0:
            out[pos:pos + m] += c_sound
    return norm(hp(out, 1200)) * 0.7

def make_error_alert(dur=1.0, f0=880, f1=587):
    n = int(dur * SR)
    s = tt(n)
    half = n // 2
    b1 = np.sin(2 * np.pi * f0 * s[:half]) * (1.0 + 0.2 * np.sin(2 * np.pi * 30 * s[:half]))
    b2 = np.sin(2 * np.pi * f1 * s[half:]) * (1.0 + 0.2 * np.sin(2 * np.pi * 30 * s[half:]))
    sound = np.concatenate([b1, b2])
    return norm(sound) * env(n, 0.02, 0.08) * 0.75

def make_digital_beep(freq=1760, decay=8):
    n = int(0.3 * SR)
    s = tt(n)
    sound = np.sin(2 * np.pi * freq * s) * np.exp(-s * decay)
    return norm(sound) * env(n, 0.005, 0.05) * 0.6

def make_bell(freq=1200, decay=4):
    n = int(1.2 * SR)
    s = tt(n)
    sound = (np.sin(2 * np.pi * freq * s) +
             0.4 * np.sin(2 * np.pi * freq * 2.76 * s) * np.exp(-s * decay * 1.5) +
             0.2 * np.sin(2 * np.pi * freq * 5.4 * s) * np.exp(-s * decay * 2.5)) * np.exp(-s * decay)
    return norm(sound) * env(n, 0.005, 0.2) * 0.65

def make_vault_slam():
    n = int(1.2 * SR)
    s = tt(n)
    boom = np.sin(2 * np.pi * 55 * s * (1.0 + 0.8 * np.exp(-s * 20))) * np.exp(-s * 6)
    metal = bp(rng.standard_normal(n), 300, 1600) * np.exp(-s * 15) * 0.7
    clang = np.sin(2 * np.pi * 440 * s) * np.exp(-s * 12) * 0.3
    return norm(lp(boom + metal + clang, 2200)) * env(n, 0.005, 0.2) * 0.85

def main():
    narration_wav = ROOT / 'data/narration.wav'
    cues_file = ROOT / 'data/cues.json'
    music_file = ROOT / 'audio/music.mp3'

    if not narration_wav.exists():
        sys.exit(f"Missing {narration_wav}")
    if not cues_file.exists():
        sys.exit(f"Missing {cues_file}")

    print("Loading narration...")
    narr, sr_n = sf.read(str(narration_wav))
    if narr.ndim == 1:
        narr = np.stack([narr, narr], axis=1)
    if sr_n != SR:
        # Resample if needed
        pass
    tot_samples = len(narr)
    dur = tot_samples / SR
    print(f"Narration duration: {dur:.2f}s ({tot_samples} samples)")

    # SFX buffer
    sfx_buf = np.zeros((tot_samples, 2), dtype=np.float64)

    # Read cues
    cues = json.loads(cues_file.read_text())
    print(f"Synthesizing {len(cues)} sound cues...")
    for c in cues:
        t = c.get('t', 0)
        ctype = c.get('type', '')
        gain = c.get('g', c.get('gain', 1.0))
        pan = c.get('pan', 0.0)

        if ctype == 'whoosh':
            w = make_whoosh(c.get('dur', 0.45), c.get('f0', 300), c.get('f1', 1200))
            place(sfx_buf, w, t, gain, pan)
        elif ctype == 'thunk':
            tk = make_thunk(c.get('f', 100), c.get('decay', 10))
            place(sfx_buf, tk, t, gain, pan)
        elif ctype == 'keystrokes':
            ks = make_keystrokes(c.get('count', 12), c.get('speed', 0.08))
            place(sfx_buf, ks, t, gain, pan)
        elif ctype == 'printer_gear':
            pg = make_printer_gear(c.get('dur', 1.2), c.get('mode', 'active'))
            place(sfx_buf, pg, t, gain, pan)
        elif ctype == 'paper_feed':
            pf = make_paper_feed(c.get('dur', 1.0), c.get('mode', 'spit'))
            place(sfx_buf, pf, t, gain, pan)
        elif ctype == 'server_buzz':
            sb = make_server_buzz(c.get('dur', 3.0), c.get('f0', 120))
            place(sfx_buf, sb, t, gain, pan)
        elif ctype == 'casino_chips':
            cc = make_casino_chips(c.get('count', 12), c.get('dur', 1.5))
            place(sfx_buf, cc, t, gain, pan)
        elif ctype == 'error_alert':
            ea = make_error_alert(c.get('dur', 1.0), c.get('f0', 880), c.get('f1', 587))
            place(sfx_buf, ea, t, gain, pan)
        elif ctype in ('digital_beep', 'scanner_beep', 'countup_tick'):
            db = make_digital_beep(c.get('freq', 1760), c.get('decay', 8))
            place(sfx_buf, db, t, gain, pan)
        elif ctype == 'bell':
            bl = make_bell(c.get('freq', 1200), c.get('decay', 4))
            place(sfx_buf, bl, t, gain, pan)
        elif ctype in ('vault_slam', 'stamp_thud'):
            vs = make_vault_slam()
            place(sfx_buf, vs, t, gain, pan)
        elif ctype == 'ambient':
            ab = lp(rng.standard_normal(int(c.get('dur', 3.0) * SR)), 800) * 0.15
            place(sfx_buf, ab, t, gain, pan)

    # Load and duck music
    music_buf = np.zeros((tot_samples, 2), dtype=np.float64)
    if music_file.exists():
        print("Loading background score and ducking under voice...")
        raw_m = subprocess.run([
            'ffmpeg', '-v', 'error', '-i', str(music_file),
            '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'
        ], capture_output=True, check=True).stdout
        m_samples = np.frombuffer(raw_m, np.float32).reshape(-1, 2).astype(np.float64)
        m_len = min(tot_samples, len(m_samples))
        music_buf[:m_len] = m_samples[:m_len]

        # Calculate narration volume envelope for smart ducking
        narr_env = lp(np.abs(narr.mean(axis=1)), 4.0)
        duck = np.clip(1.0 - narr_env * 2.2, 0.22, 0.75)
        # Smooth duck curve
        duck = lp(duck, 3.0)
        music_buf = music_buf * duck[:, None] * 0.42

        # Fade out music in last 1.5 seconds
        fade_n = int(1.5 * SR)
        music_buf[-fade_n:] *= np.linspace(1, 0, fade_n)[:, None]

    # Combine stems
    # Narration level = 0.95
    # SFX level = 0.55
    # Music level = already scaled
    master = narr * 0.92 + sfx_buf * 0.52 + music_buf

    # Gentle master peak limiting / normalization
    peak = np.abs(master).max()
    if peak > 0.95:
        master = master * (0.95 / peak)

    mix_wav = ROOT / 'data/mix.wav'
    print(f"Writing master audio to {mix_wav}...")
    sf.write(str(mix_wav), master.astype(np.float32), SR, subtype='PCM_16')

    # Compress to FLAC
    mix_flac = ROOT / 'data/mix.flac'
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y',
        '-i', str(mix_wav),
        '-c:a', 'flac',
        str(mix_flac)
    ], check=True)
    print(f"Compressed {mix_flac} ({mix_flac.stat().st_size / 1024 / 1024:.2f} MB)")

if __name__ == '__main__':
    main()
