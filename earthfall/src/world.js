// The whole film's world: load the cast once, build every set (each its own scene, sky and sun), and the hero capsule.
import { Human } from './chars/human.js';
import { LOOKS } from './chars/cast.js';
import { makeHat } from './props/hats.js';
import { makeCapsule } from './props/capsule.js';
import { buildKola } from './sets/kola.js';
import { buildLab } from './sets/lab.js';
import { buildTunnel } from './sets/tunnel.js';
import { buildSection } from './sets/section.js';
import { buildCore } from './sets/core.js';
import { buildFar } from './sets/far.js';

const q = new URLSearchParams(location.search);
export async function buildWorld(renderer) {
  const only = q.get('sets') ? q.get('sets').split(',') : null;
  const need = (s) => !only || only.includes(s);
  const ids = new Set();
  if (need('kola')) { ids.add('worker'); ids.add('miner'); }
  if (need('lab')) ids.add('bullard');
  if (need('far')) ids.add('worker');
  const cast = {};
  await Promise.all([...ids].map(async (id) => { cast[id] = await Human.load(id, LOOKS[id]); }));
  const hats = { hero: makeHat('hardhat') };
  const capsule = makeCapsule();
  const sets = {};
  if (need('kola')) sets.kola = buildKola(renderer, cast);
  if (need('lab')) sets.lab = buildLab(renderer, cast);
  if (need('tunnel')) sets.tunnel = buildTunnel(renderer);
  if (need('section')) sets.section = buildSection(renderer);
  if (need('core')) sets.core = buildCore(renderer);
  if (need('far')) sets.far = buildFar(renderer, cast);
  return { sets, cast, hats, capsule };
}
