// Narration timing: assets/lines.json or data/lines.json + assets/words.json. Shots are keyed to words, never to seconds.
export const T = { lines: [], words: [], dur: 0 };
export async function loadTiming() {
  const fetchJson = async (p1, p2) => {
    try {
      const r = await fetch(p1);
      if (r.ok) return await r.json();
    } catch (e) {}
    const r2 = await fetch(p2);
    return await r2.json();
  };
  const [l, w] = await Promise.all([
    fetchJson('assets/lines.json', 'data/lines.json'),
    fetchJson('assets/words.json', 'data/words.json')
  ]);
  T.lines = l.lines;
  T.words = w;
  T.dur = l.duration;
}
/** k-th word of line li → {s, e} (negative k counts from the end) */
export function wd(li, k = 0) {
  const ws = T.words.filter((x) => x.line === li);
  if (!ws.length) {
    const L = T.lines[li];
    return { s: L ? L.start : 0, e: L ? L.end : 1, w: '' };
  }
  const x = ws[(k + ws.length) % ws.length];
  return { s: x.s, e: x.e, w: x.w };
}
export const ln = (li) => T.lines[li];
/** a cut lands 3 frames before the words */
export const cut = (li, k = 0) => Math.max(0, wd(li, k).s - 3 / 24);
