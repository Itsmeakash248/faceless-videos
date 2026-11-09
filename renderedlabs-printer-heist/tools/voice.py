import json, os, subprocess, sys
from pathlib import Path
import numpy as np

HOME = Path(os.environ.get('FACELESS_HOME', Path.home() / '.faceless-videos'))
KDIR = HOME / 'kokoro'

sys.path.insert(0, '/home/akash/.faceless-videos/venv/lib/python3.11/site-packages')
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
data_dir = ROOT / 'data'
data_dir.mkdir(parents=True, exist_ok=True)

script_file = ROOT / 'script.json'
with open(script_file) as f:
    cfg = json.load(f)

voice_cfg = cfg.get('narrator', {})
voice = voice_cfg.get('voice', 'am_michael')
speed = voice_cfg.get('speed', 1.15)
lines = cfg.get('lines', [])

print(f"Loading Kokoro TTS model (voice: {voice}, speed: {speed})...")
k = Kokoro(str(KDIR / 'kokoro-v1.0.onnx'), str(KDIR / 'voices-v1.0.bin'))

sr = 24000
chunks = []
meta = []
lead_in = int(0.25 * sr)
chunks.append(np.zeros(lead_in, dtype=np.float32))
pos = lead_in

for idx, item in enumerate(lines):
    text = item['text']
    gap = item.get('gap', 0.20)
    t_start = round(pos / sr, 3)

    audio, _ = k.create(text, voice=voice, speed=speed, lang='en-us')
    audio = np.asarray(audio, np.float32)
    nz = np.where(np.abs(audio) > 0.01)[0]
    if len(nz):
        audio = audio[max(0, nz[0] - int(0.02 * sr)): nz[-1] + int(0.06 * sr)]

    chunks.append(audio)
    pos += len(audio)
    t_end = round(pos / sr, 3)

    meta.append({
        "i": idx,
        "v": "n",
        "text": text,
        "start": t_start,
        "end": t_end
    })

    gap_samples = int(gap * sr)
    chunks.append(np.zeros(gap_samples, dtype=np.float32))
    pos += gap_samples
    print(f"[{t_start:5.2f}s - {t_end:5.2f}s] {text}")

y = np.concatenate(chunks)
y = y / max(1e-6, np.abs(y).max()) * 0.92
duration = round(len(y) / sr, 3)

wav_path = data_dir / 'narration.wav'
# Output 48 kHz stereo 16-bit PCM wav
subprocess.run([
    'ffmpeg', '-v', 'error', '-y',
    '-f', 's16le', '-ar', str(sr), '-ac', '1',
    '-i', '-',
    '-ar', '48000', '-ac', '2',
    str(wav_path)
], input=(y * 32767).astype('<i2').tobytes(), check=True)

sentences_path = data_dir / 'narration.sentences.json'
with open(sentences_path, 'w') as f:
    json.dump({"duration": duration, "sentences": meta}, f, indent=1)

print(f"Generated {wav_path} ({duration}s)")
print(f"Generated {sentences_path}")
