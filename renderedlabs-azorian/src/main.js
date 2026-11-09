// Boot: fonts → timing → shots → window.OP + HyperFrames window.__timelines["main"].
import { W, H, FPS, BAR, PORTRAIT } from './core/lib.js';
import { initGrain, finish } from './core/look.js';
import { makeView } from './core/view.js';
import { loadTiming, T } from './core/timing.js';
import { buildShots } from './shots.js';
import { counter, pop } from './core/gfx.js';

const q = new URLSearchParams(location.search);
const CAPTURE = q.has('capture');
if (CAPTURE) document.body.classList.add('capture');

const out = document.getElementById('out');
out.width = W;
out.height = H;
const ctx = out.getContext('2d');

let SHOTS = [], DURATION = 44.62;
const errors = [];

function shotAt(t) {
  for (let i = SHOTS.length - 1; i >= 0; i--) {
    if (t >= SHOTS[i].start - 1e-6) return i;
  }
  return 0;
}

export function render(t) {
  const i = shotAt(t);
  const sh = SHOTS[i];
  if (!sh) return;
  const lt = t - sh.start;
  const frame = Math.round(t * FPS);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  try {
    const V = makeView(ctx, sh.cam || { x: 960, y: 540, w: 1920 }, lt);
    ctx.save();
    sh.draw(ctx, V, lt, t);
    ctx.restore();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;

    const lk = typeof sh.look === 'function' ? sh.look(t) : (sh.look || {});
    finish(ctx, frame, { ...lk, bars: false, grain: sh.card ? 0.04 : (lk.grain || 0.08) });

    if (sh.over) {
      ctx.save();
      sh.over(ctx, lt, t);
      ctx.restore();
    }

    if (sh.hud != null) {
      counter(ctx, sh.hud, sh.hudIn ? pop(lt, 0.1) : 1);
    }

    if (BAR) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, BAR);
      ctx.fillRect(0, H - BAR, W, BAR);
    }
  } catch (err) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#400';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f88';
    ctx.font = '28px monospace';
    ctx.fillText(`${sh.id}: ${err.message}`.slice(0, 90), 30, H / 2);
    if (!errors.find((x) => x.id === sh.id)) {
      errors.push({ id: sh.id, msg: err.message, stack: err.stack });
      console.error(sh.id, err);
    }
  }
}

async function boot() {
  await Promise.all([
    ['Fredoka', 'fonts/Fredoka.woff2', { weight: '300 700' }],
    ['Nunito', 'fonts/Nunito.woff2', { weight: '200 1000' }]
  ].map(async ([fam, file, d]) => {
    try {
      const f = new FontFace(fam, `url(${file})`, d);
      await f.load();
      document.fonts.add(f);
    } catch (e) {
      console.warn('Font load warning', fam, e);
    }
  }));

  await loadTiming();
  initGrain();

  SHOTS = buildShots().map((s) => ({ ...s, start: s.at })).sort((a, b) => a.start - b.start);
  SHOTS[0].start = 0;
  for (let k = 0; k < SHOTS.length; k++) {
    SHOTS[k].end = SHOTS[k + 1] ? SHOTS[k + 1].start : (SHOTS[k].end ?? SHOTS[k].start + 3);
  }
  const last = SHOTS[SHOTS.length - 1];
  last.end = last.end ?? last.start + 3;
  DURATION = T.dur || (SHOTS.find((s) => s.id === 'S21_END')?.end ?? last.end);
  last.end = DURATION;

  let had = false;
  for (const s of SHOTS) {
    if (s.hud != null && !had) {
      s.hudIn = true;
      had = true;
    }
  }

  // Register HyperFrames GSAP timeline
  window.__timelines = window.__timelines || {};
  if (window.gsap) {
    const tl = window.gsap.timeline({ paused: true });
    const dummy = { t: 0 };
    tl.to(dummy, {
      t: DURATION,
      duration: DURATION,
      ease: 'none',
      onUpdate() {
        render(dummy.t);
      }
    }, 0);
    window.__timelines['main'] = tl;
    tl.seek(0);
  }

  window.OP.ready = true;
  render(0);
}

window.OP = {
  ready: false,
  duration: () => DURATION,
  errors: () => errors,
  scenes: () => SHOTS.map((s, i) => ({ i, id: s.id, start: s.start, end: s.end, tech: s.note || '' })),
  cues: () => {
    const cs = [];
    for (const s of SHOTS) {
      if (!s.card && s !== SHOTS[0]) cs.push({ t: s.start, type: 'cut', gain: 1 });
      for (const [t, type, x] of (s.cues || [])) cs.push({ t, type, gain: 1, ...(x || {}) });
      if (s.steps) for (let t = s.steps.from; t < s.steps.to; t += s.steps.every) cs.push({ t, type: 'step', gain: 0.8 });
    }
    return cs.sort((a, b) => a.t - b.t);
  },
  frame(i, qq = 0.92) {
    render(i / FPS);
    return out.toDataURL('image/jpeg', qq);
  },
  sheet(times, cols = 4, scale = 0.25, qq = 0.85) {
    const w = Math.round(W * scale), h = Math.round(H * scale), rows = Math.ceil(times.length / cols);
    const c = document.createElement('canvas');
    c.width = w * cols;
    c.height = (h + 22) * rows;
    const x = c.getContext('2d');
    x.fillStyle = '#111';
    x.fillRect(0, 0, c.width, c.height);
    times.forEach((t, k) => {
      render(t);
      const cx = (k % cols) * w, cy = Math.floor(k / cols) * (h + 22);
      x.drawImage(out, cx, cy, w, h);
      const s = SHOTS[shotAt(t)] || SHOTS[0];
      x.fillStyle = '#fff';
      x.font = '14px monospace';
      x.fillText(`${t.toFixed(2)}s ${s.id} ${s.note || ''}`.slice(0, Math.floor(w / 8.5)), cx + 4, cy + h + 16);
    });
    return c.toDataURL('image/jpeg', qq);
  },
};

boot().catch((e) => {
  console.error(e);
  window.OP.bootError = e.message;
});
