import os, sys, json
from pathlib import Path
import numpy as np

KDIR = Path(os.environ.get('FACELESS_HOME', Path.home() / '.faceless-videos')) / 'kokoro'
sys.path.insert(0, '/home/akash/.faceless-videos/venv/lib/python3.11/site-packages')
from kokoro_onnx import Kokoro

k = Kokoro(str(KDIR / 'kokoro-v1.0.onnx'), str(KDIR / 'voices-v1.0.bin'))

lines = [
    {"text": "February twenty sixteen. A quiet morning in Dhaka.", "gap": 0.20},
    {"text": "Inside the dealing room, the official SWIFT printer sat dead silent.", "gap": 0.20},
    {"text": "Its tray sat empty, mistaken by staff for a routine paper jam.", "gap": 0.20},
    {"text": "Overnight, hackers breached the terminal, sending thirty-five orders for nearly one billion dollars.", "gap": 0.20},
    {"text": "Custom malware wiped the queue, silencing physical confirmations.", "gap": 0.20},
    {"text": "Eighty-one million escaped to Manila casinos through fake accounts.", "gap": 0.20},
    {"text": "Twenty million was stopped by pure luck: a single typo, 'Fundation'.", "gap": 0.20},
    {"text": "The New York Fed blocked eight hundred and fifty million more.", "gap": 0.20},
    {"text": "By Saturday, when the printer restarted, the cash was gone.", "gap": 0.20},
    {"text": "A decade later, sixty-six million dollars is still missing.", "gap": 0.60}
]

sr = 24000
chunks = []
meta = []
pos = int(0.2 * sr)
chunks.append(np.zeros(pos, dtype=np.float32))

speed = 1.15
voice = 'am_michael'

for idx, item in enumerate(lines):
    t_start = round(pos / sr, 3)
    audio, _ = k.create(item['text'], voice=voice, speed=speed, lang='en-us')
    audio = np.asarray(audio, np.float32)
    nz = np.where(np.abs(audio) > 0.01)[0]
    if len(nz):
        audio = audio[max(0, nz[0] - int(0.02 * sr)): nz[-1] + int(0.06 * sr)]
    chunks.append(audio)
    pos += len(audio)
    t_end = round(pos / sr, 3)
    meta.append({"index": idx, "text": item['text'], "start": t_start, "end": t_end})
    gap_samples = int(item['gap'] * sr)
    chunks.append(np.zeros(gap_samples, dtype=np.float32))
    pos += gap_samples

y = np.concatenate(chunks)
total_sec = len(y) / sr
print(f"Total duration: {total_sec:.2f} seconds ({len(lines)} sentences)", flush=True)
for m in meta:
    print(f"  [{m['start']:.2f}s - {m['end']:.2f}s] {m['text']}", flush=True)
