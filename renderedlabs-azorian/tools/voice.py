"""Local narration with Kokoro-82M — narrator + character voices, real beats.
Voices: bm_george (narrator), am_michael (Spokesperson)
"""
import argparse, json, os, re, shutil, subprocess
from pathlib import Path
import numpy as np

KDIR = Path(os.environ.get('FACELESS_HOME', Path.home() / '.faceless-videos')) / 'kokoro'
VOICES = {
    'narrator': ('bm_george', 1.05),
    'Spokesperson': ('am_michael', 0.95),
}

ap = argparse.ArgumentParser()
ap.add_argument('project', default='.', nargs='?')
ap.add_argument('--speed', type=float, default=1.0)
ap.add_argument('--gap', type=float, default=0.25)
ap.add_argument('--para', type=float, default=0.55)
ap.add_argument('--short', type=float, default=0.35)
a = ap.parse_args()

from kokoro_onnx import Kokoro
k = Kokoro(str(KDIR / 'kokoro-v1.0.onnx'), str(KDIR / 'voices-v1.0.bin'))
proj = Path(a.project)
raw = [l.rstrip() for l in (proj / 'script.txt').read_text().splitlines() if not l.lstrip().startswith('#')]
sr = 24000
out = [np.zeros(int(0.35 * sr), np.float32)]
pos = len(out[0])
meta = []

def sil(sec):
    global pos
    z = np.zeros(int(sec * sr), np.float32)
    out.append(z)
    pos += len(z)

for li, line in enumerate(raw):
    if not line.strip():
        if out: sil(max(0, a.para - a.gap))
        continue
    m = re.match(r'\[beat\s+([\d.]+)\]', line.strip())
    if m:
        beat_dur = float(m.group(1))
        meta.append({'i': len(meta), 'who': 'beat', 'text': '', 'start': round(pos / sr, 3), 'end': round(pos / sr + beat_dur, 3)})
        sil(beat_dur)
        continue
    who = 'narrator'
    m = re.match(r'\[(\w+)\]\s*(.*)', line.strip())
    if m: who, line = m.group(1), m.group(2)
    if who not in VOICES:
        raise SystemExit(f'line {li + 1}: no voice for [{who}] — add it to VOICES in tools/voice.py')
    voice, vs = VOICES[who]
    lang = 'en-gb' if voice.startswith('b') else 'en-us'
    t0 = pos / sr
    sents = [s for s in re.split(r'(?<=[.!?])\s+', line.strip()) if s]
    for si, s in enumerate(sents):
        audio, _ = k.create(s, voice=voice, speed=a.speed * vs, lang=lang)
        audio = np.asarray(audio, np.float32)
        nz = np.where(np.abs(audio) > 0.01)[0]
        if len(nz):
            audio = audio[max(0, nz[0] - int(0.02 * sr)): nz[-1] + int(0.06 * sr)]
        if who != 'narrator':
            audio *= 0.95
        out.append(audio)
        pos += len(audio)
        if si < len(sents) - 1:
            sil(a.gap * 0.7)
    meta.append({'i': len(meta), 'who': who, 'text': line.strip(), 'start': round(t0, 3), 'end': round(pos / sr, 3)})
    sil(max(a.gap, a.short) if len(line.split()) <= 2 else a.gap)
    print(f"{t0:7.2f}  {who:12s} {line[:70]}", flush=True)

y = np.concatenate(out + [np.zeros(int(0.8 * sr), np.float32)])
y = y / max(1e-6, np.abs(y).max()) * 0.89

(proj / 'data').mkdir(parents=True, exist_ok=True)
(proj / 'assets/audio').mkdir(parents=True, exist_ok=True)
wav = proj / 'data/narration.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-', '-ar', '48000', '-ac', '2', str(wav)],
               input=(y * 32767).astype('<i2').tobytes(), check=True)
shutil.copy2(wav, proj / 'assets/audio/narration.wav')
lines_json = proj / 'data/lines.json'
lines_json.write_text(json.dumps({'duration': round(len(y) / sr, 3), 'lines': meta}, indent=2))
shutil.copy2(lines_json, proj / 'assets/lines.json')
print(f'Wrote {wav} ({len(y) / sr:.2f}s) and {lines_json}')
