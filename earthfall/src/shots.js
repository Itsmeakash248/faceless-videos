// The film, shot by shot, keyed to the narration's word times. Each shot: set, start, setup(W, lt, t) → { cam, look, mb }.
// THE 42-MINUTE HOLE — 46 shots, six sets, one capsule.
import * as THREE from 'three';
import { wt } from './core/timing.js';
import { E, seg, kf, clamp, lerp, V, sstep } from './core/util.js';
import { Human, GRIPS } from './chars/human.js';

const D = Math.PI / 180;

function put(o, p) { if (o.parent !== p) p.add(o); }

function stand(h, x, z, yaw, { y = 0.09, drop = 0.0, lean = 0, twist = 0, side = 0 } = {}) {
  h.group.position.set(x, y, z); h.group.rotation.set(0, yaw, 0);
  h.root.position.y = 0.955 - drop; h.root.position.x = side;
  h.rot('spine', lean * 0.55, twist * 0.5, 0); h.rot('chest', lean * 0.45, twist * 0.5, 0);
  if (drop > 0.005) for (const sd of ['L', 'R']) { const g = sd === 'L' ? 1 : -1; h.legIK(sd, h.group.localToWorld(V(0.1 * g, 0.09, -0.012)), h.group.localToWorld(V(0.1 * g, 0.5, 1))); }
}

function hand(h, side, target, fingers, palm, pole) {
  h.armIK(side, target, pole || h.group.localToWorld(V(side === 'L' ? 0.85 : -0.85, 0.8, -0.6)), Human.handQ(side, fingers, palm));
}

function wearHat(h, hat) {
  const head = h.bone('head'); if (hat.group.parent !== head) head.add(hat.group);
  hat.group.position.set(0, 0.152, -0.004); hat.group.rotation.set(-0.06, 0, 0); hat.group.scale.setScalar(1);
}
function wearCap(h, hat) {
  const head = h.bone('head'); if (hat.group.parent !== head) head.add(hat.group);
  hat.group.position.set(0, 0.163, 0.004); hat.group.rotation.set(-0.12, 0, 0); hat.group.scale.setScalar(1);
}

/** put the hero capsule in a set; origin is its centre, so a capsule standing on the floor has y = 1.06 */
function cap(W, S, pos, { rotY = 0, scale = 1, tilt = [0, 0, 0], squash = null } = {}) {
  const c = W.capsule; put(c.group, S.scene);
  c.group.position.set(...pos);
  c.group.rotation.set(tilt[0], rotY + tilt[1], tilt[2]);
  c.group.scale.setScalar(scale);
  if (squash) c.group.scale.set(scale * squash[0], scale * squash[1], scale * squash[2]);
  c.group.visible = true;
  c.hatch.position.set(0, 0.06, -0.46); c.hatchRing.position.set(0, 0.06, -0.452);
  return c;
}

function sectionTags(S, which = null) { for (const k of ['one', 'half', 'zero']) S.tags[k].visible = k === which; }

export function buildShots(T, W) {
  const shots = [];
  const add = (s) => shots.push(s);
  const cues = (shots.cues = []);
  const C = (t, type, o = {}) => cues.push({ t: +t.toFixed(3), type, ...o });

  // =====================================================================
  // A · KOLA — the deepest hole (0:00–0:14.3)
  // =====================================================================
  add({ id: 'A1', set: 'kola', start: 0, note: 'Kola at sunrise — the deepest hole we have ever dug',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker, m = S.miner;
      stand(w, -2.15, 1.35, -0.95, { y: S.padY, lean: 26 }); wearHat(w, S.hats.worker);
      const cs = S.coreSample.position;
      hand(w, 'R', cs.clone().add(V(0.02, 0.09, 0.03)), V(-0.4, -0.6, 0.2), V(0, 0.2, 1));
      hand(w, 'L', V(-3.08, 1.02, 1.98), V(0.4, -0.5, 0.3), V(0, 0.2, 1));
      w.fingers('R', GRIPS.rim); w.fingers('L', GRIPS.open); w.look(cs, 0.65);
      stand(m, -3.85, 0.35, -2.1, { y: S.padY, lean: 30 }); wearCap(m, S.hats.miner);
      hand(m, 'L', V(-3.6, 0.62, 0.1), V(0.2, -0.8, 0.2), V(0, 0, 1));
      m.fingers('L', GRIPS.hold); m.look(V(-4.2, 0.6, -0.2), 0.7);
      const u = seg(lt, 0, 3.4, E.io);
      const pos = [lerp(5.1, 4.2, u), lerp(2.0, 1.85, u), lerp(7.6, 6.4, u)];
      return { cam: { pos, look: [lerp(0.15, 0.05, u), 2.9, 0], fov: 42, shake: 0.1 },
        look: { focus: Math.hypot(pos[0], pos[1] - 2, pos[2]), aper: 0.018, warm: 0.6 },
        shadowAt: [0, 1.2, 0], shadowSize: 4.5 };
    } });

  add({ id: 'A2', set: 'kola', start: 3.62, note: 'Twelve kilometres — a core sample laid in the tray; printed 12,262 M',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker;
      stand(w, -3.38, 1.28, 0.98, { y: S.padY, lean: 38 }); wearHat(w, S.hats.worker);
      S.coreSample.position.set(-2.72, 0.995, 1.73); S.coreSample.rotation.set(0, 0.2, 0);
      hand(w, 'R', V(-2.68, 1.04, 1.72), V(-0.5, -0.4, 0.4), V(0, 0.2, 1));
      hand(w, 'L', V(-2.95, 1.0, 2.02), V(0.2, -0.7, 0.3), V(0, 0, 1));
      w.fingers('R', GRIPS.rim); w.fingers('L', GRIPS.open); w.look(S.coreSample.position, 0.9);
      const u = seg(lt, 0, 1.9, E.io);
      const pos = [lerp(-1.25, -1.35, u), lerp(1.55, 1.5, u), lerp(4.2, 4.0, u)];
      const look = [-2.75, 0.98, 1.78];
      return { cam: { pos, look, fov: 42, shake: 0.08 },
        look: { focus: Math.hypot(pos[0] + 2.75, pos[1] - 0.98, pos[2] - 1.78), aper: 0.026, warm: 0.65 },
        shadowAt: [-2.7, 1.0, 1.7], shadowSize: 1.6 };
    } });

  add({ id: 'A3', set: 'kola', start: 5.64, note: 'The 23 cm borehole — steel ruler across it, tilt up the derrick',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker;
      S.wrench.visible = false;
      stand(w, 1.75, 1.5, 2.5, { y: S.padY, lean: 8 }); wearHat(w, S.hats.worker);
      hand(w, 'R', V(1.3, 1.15, 1.2), V(-0.4, -0.5, 0.4), V(0, 0.2, 1)); w.fingers('R', GRIPS.relax);
      w.look(V(0, 0.2, 0), 0.6);
      const up = seg(lt, 1.5, 2.75, E.io);
      const pos = [lerp(0.62, 0.5, up), lerp(0.95, 1.25, up), lerp(1.12, 1.0, up)];
      const look = [0.06, lerp(0.2, 3.4, up), 0.04];
      return { cam: { pos, look, fov: lerp(46, 48, up), shake: 0.07 },
        look: { focus: lerp(0.95, 2.6, up), aper: lerp(0.03, 0.014, up), warm: 0.65 },
        shadowAt: [0, lerp(0.2, 2.0, up), 0], shadowSize: 1.6 };
    } });

  add({ id: 'A4', set: 'kola', start: 8.43, note: 'Two tenths of one percent — crane up the derrick into the sky',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker, m = S.miner;
      stand(w, 2.25, 2.35, 2.15, { y: S.padY, lean: 12 }); wearHat(w, S.hats.worker);
      hand(w, 'R', V(1.72, 1.0, 2.05), V(-0.3, -0.7, 0.4), V(0, 0, 1)); w.fingers('R', GRIPS.hold);
      w.look(V(0, 3.0, 0), 0.6);
      stand(m, -2.55, 1.62, -1.4, { y: S.padY, lean: 24 }); wearCap(m, S.hats.miner);
      hand(m, 'R', V(-3.05, 1.05, 1.8), V(-0.4, -0.5, 0.3), V(0, 0.2, 1)); m.fingers('R', GRIPS.rim);
      m.look(S.coreSample.position, 0.8);
      const u = seg(lt, 0, 5.2, E.io);
      const pos = [lerp(2.5, 1.55, u), lerp(1.5, 2.5, u), lerp(6.3, 5.1, u)];
      const look = [0, lerp(2.7, 4.6, u), lerp(0.0, 0.2, u)];
      return { cam: { pos, look, fov: lerp(44, 48, u), shake: 0.09 },
        look: { focus: Math.hypot(pos[0], pos[1] - look[1], pos[2]), aper: lerp(0.018, 0.012, u), warm: 0.7 },
        shadowAt: [0, 2.5, 0], shadowSize: lerp(3.5, 6, u) };
    } });

  // =====================================================================
  // B · LAB — the thought experiment (0:14.3–0:24.3)
  // =====================================================================
  add({ id: 'B1', set: 'lab', start: 14.30, note: "So here's a thought experiment — the engineer sets a pin in the globe",
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      S.globe.tunnel.visible = false; S.experimentPlate.visible = true;
      stand(b, -2.05, -1.38, 1.86, { y: 0, lean: 30 });
      const u = seg(lt, 0.05, 1.35, E.io);
      const pinBase = V(-1.86, 0.99, -1.56).lerp(V(-1.50, 1.52, -1.573), u);
      S.pin.visible = true; S.pin.scale.setScalar(1.5); S.pin.position.copy(pinBase); S.pin.rotation.set(0.90, 0, 0.90);
      hand(b, 'R', pinBase.clone().add(V(-0.03, 0.02, 0.03)), V(-0.3, -0.7, -0.4), V(0, 0, -1));
      b.fingers('R', GRIPS.pinch);
      hand(b, 'L', V(-1.98, 0.99, -1.42), V(0.2, -0.6, -0.3), V(0, 0, -1)); b.fingers('L', GRIPS.open);
      b.look(pinBase, 0.9);
      const pos = [lerp(-2.30, -2.19, u), lerp(1.50, 1.46, u), lerp(0.62, 0.50, u)];
      const look = [-1.56, 1.44, -1.78];
      return { cam: { pos, look, fov: lerp(39, 37, u), shake: 0.08 },
        look: { focus: Math.hypot(pos[0] + 1.56, pos[1] - 1.44, pos[2] + 1.78), aper: 0.022, warm: 0.75, exposure: 1.4 },
        shadowAt: [-1.6, 1.3, -1.55], shadowSize: 1.4 };
    } });

  add({ id: 'B2', set: 'lab', start: 16.20, note: 'The pin is a hairline — 12 km on a 12,742 km globe',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      S.globe.tunnel.visible = false; S.experimentPlate.visible = false;
      stand(b, -4.60, -1.30, 1.60, { y: 0, lean: 12 });
      S.pin.visible = true; S.pin.scale.setScalar(1.5); S.pin.position.set(-1.50, 1.52, -1.573); S.pin.rotation.set(0.90, 0, 0.90);
      b.look(V(-1.55, 1.5, -1.57), 0.8);
      const u = seg(lt, 0, 0.84, E.out);
      const pos = [lerp(-0.54, -0.49, u), lerp(1.71, 1.70, u), lerp(-0.30, -0.24, u)];
      const look = [-1.45, 1.44, -1.54];
      return { cam: { pos, look, fov: 38, shake: 0.05 },
        look: { focus: Math.hypot(pos[0] + 1.45, pos[1] - 1.44, pos[2] + 1.54), aper: 0.03, warm: 0.75, exposure: 1.4 },
        shadowAt: [-1.5, 1.45, -1.5], shadowSize: 0.9 };
    } });

  add({ id: 'B3', set: 'lab', start: 17.08, note: 'Turn the crank — a glass tunnel appears through the model',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      S.experimentPlate.visible = true;
      stand(b, -1.95, -1.40, -1.50, { y: 0, lean: 18 });
      const u = seg(lt, 0.05, 1.9, E.io2);
      S.crankArm.rotation.z = lerp(-0.8, 1.9, u); S.crankArm.updateMatrixWorld(true);
      const hpos = S.crankArm.localToWorld(V(0.34, 0, 0.08));
      hand(b, 'R', hpos.clone().add(V(0.01, 0.02, -0.02)), V(-0.4, -0.6, -0.5), V(0, 0, -1));
      b.fingers('R', GRIPS.hold);
      hand(b, 'L', V(-2.02, 0.99, -1.42), V(0.2, -0.6, -0.3), V(0, 0, -1)); b.fingers('L', GRIPS.open);
      b.look(V(-1.6, 1.38, -1.56), 0.75);
      S.globe.tunnel.visible = true;
      const grow = seg(lt, 0.28, 1.45, E.out);
      S.globe.tunnel.scale.set(1, Math.max(0.001, grow), 1);
      S.experimentPlate.visible = true;
      const pos = [lerp(-2.62, -2.50, u), lerp(1.54, 1.49, u), lerp(0.46, 0.30, u)];
      const look = [-1.66, 1.33, -1.60];
      return { cam: { pos, look, fov: 40, shake: 0.08 },
        look: { focus: Math.hypot(pos[0] + 1.66, pos[1] - 1.33, pos[2] + 1.60), aper: 0.02, warm: 0.75, exposure: 1.4 },
        shadowAt: [-1.8, 1.2, -1.5], shadowSize: 1.4 };
    } });

  add({ id: 'B4', set: 'lab', start: 19.42, note: "Line it with something that can't melt — the capsule hull",
    setup(W, lt, t) {
      const S = W.sets.lab, b = S.bullard, c = cap(W, S, [2.05, 1.06, -0.92], { rotY: 0, scale: 1 });
      S.globe.tunnel.visible = true;
      stand(b, 1.22, -1.36, 1.08, { y: 0, lean: 14 });
      hand(b, 'R', V(1.62, 1.24, -1.18), V(-0.3, -0.5, 0.3), V(0, 0, 1)); b.fingers('R', GRIPS.open);
      hand(b, 'L', V(1.57, 1.06, -0.99), V(-0.2, -0.7, 0.2), V(0, 0, 1)); b.fingers('L', GRIPS.relax);
      b.look(V(1.72, 1.22, -1.08), 0.9);
      const u = seg(lt, 0, 1.7, E.io);
      const pos = [lerp(0.55, 0.44, u), lerp(1.58, 1.52, u), lerp(1.62, 1.50, u)];
      return { cam: { pos, look: [1.88, 1.05, -0.88], fov: 44, shake: 0.08 },
        look: { focus: Math.hypot(pos[0] - 1.88, pos[1] - 1.05, pos[2] + 0.88), aper: 0.024, warm: 0.75, exposure: 1.3 },
        shadowAt: [1.7, 1.0, -1.0], shadowSize: 1.8 };
    } });

  add({ id: 'B5', set: 'lab', start: 21.32, note: 'Pump out the air — the vacuum needle drops',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      S.globe.tunnel.visible = true;
      stand(b, 0.62, -1.08, Math.PI, { y: 0, lean: 24 });
      const u = seg(lt, 0, 1.35, E.in);
      S.vacNeedle.rotation.z = lerp(-0.25, 1.1, u);
      hand(b, 'R', V(0.32, 1.24, -1.53), V(-0.3, -0.4, -0.7), V(0, 0, -1)); b.fingers('R', GRIPS.fist);
      hand(b, 'L', V(0.68, 1.0, -1.5), V(-0.2, -0.7, 0.2), V(0, 0, 1)); b.fingers('L', GRIPS.open);
      b.look(V(0.08, 1.53, -1.68), 0.9);
      const pos = [lerp(0.48, 0.42, u), lerp(1.62, 1.58, u), lerp(-1.02, -1.12, u)];
      return { cam: { pos, look: [0.08, 1.52, -1.68], fov: 31, shake: 0.06 },
        look: { focus: Math.hypot(pos[0] - 0.08, pos[1] - 1.52, pos[2] + 1.68), aper: 0.032, warm: 0.7, exposure: 1.5 },
        shadowAt: [0.1, 1.4, -1.6], shadowSize: 0.7 };
    } });

  add({ id: 'B6', set: 'lab', start: 22.88, note: 'Then step in — the engineer swings the hatch shut',
    setup(W, lt, t) {
      const S = W.sets.lab, b = S.bullard;
      const c = cap(W, S, [2.05, 1.06, -0.92], { rotY: Math.PI, scale: 1 });
      const close = seg(lt, 0.12, 0.95, E.io);
      c.hatch.position.z = lerp(-0.64, -0.46, close);
      stand(b, 1.30, -0.30, 1.78, { y: 0, lean: 10 });
      hand(b, 'R', V(1.64, 1.16, -0.44), V(-0.2, -0.5, -0.9), V(0, 0, -1)); b.fingers('R', GRIPS.fist);
      hand(b, 'L', V(1.48, 1.02, -0.16), V(-0.2, -0.7, 0.3), V(0, 0, 1)); b.fingers('L', GRIPS.open);
      b.look(V(1.90, 1.12, -0.58), 0.9);
      const u = seg(lt, 0, 1.35, E.io);
      const pos = [lerp(0.74, 0.66, u), lerp(1.70, 1.64, u), lerp(1.66, 1.58, u)];
      return { cam: { pos, look: [1.86, 1.26, -0.82], fov: 48, shake: 0.09 },
        look: { focus: Math.hypot(pos[0] - 2.05, pos[1] - 1.08, pos[2] + 0.60), aper: 0.022, warm: 0.75, exposure: 1.3 },
        shadowAt: [2.0, 0.9, -0.7], shadowSize: 1.5 };
    } });

  // =====================================================================
  // C · THE FALL (0:24.3–1:00.3)
  // =====================================================================
  add({ id: 'C1', set: 'tunnel', start: 24.26, note: 'You fall — the hatch dwindles above, the capsule drops past',
    setup(W, lt, t) {
      const S = W.sets.tunnel, u = seg(lt, 0, 0.95, E.in);
      S.cable.visible = false;
      const y = 43.0 - 8.6 * u;
      cap(W, S, [0, y, 0], { rotY: 0.2, scale: 1, tilt: [0.03, 0, 0.02] });
      const pos = [0.34, 30.6, 0.62];
      const look = [0, 41.5 - 6.4 * u, 0];
      return { cam: { pos, look, fov: 62, shake: 0.14 },
        look: { focus: Math.hypot(pos[0], pos[1] - y, pos[2]), aper: 0.016, warm: 0.55, exposure: 1.2 },
        shadowAt: [0, y, 0], shadowSize: 2.2, mb: 5, shutter: 0.7 };
    } });

  add({ id: 'C2', set: 'tunnel', start: 25.24, note: 'After ten seconds — 100 metres per second at the speed gate',
    setup(W, lt, t) {
      const S = W.sets.tunnel, u = seg(lt, 0, 1.28, E.in);
      S.cable.visible = false;
      const y = 20.6 - 2.4 * u;
      cap(W, S, [0, y, 0], { rotY: 0.4, scale: 1 });
      const pos = [1.02, y + 0.28, 0.58];
      return { cam: { pos, look: [0, y - 0.12, 0], fov: 52, shake: 0.22 },
        look: { focus: Math.hypot(pos[0], pos[1] - y, pos[2]), aper: 0.02, warm: 0.55, exposure: 1.2 },
        shadowAt: [0, y, 0], shadowSize: 2.0, mb: 6, shutter: 0.8, roll: -4 };
    } });

  add({ id: 'C3', set: 'tunnel', start: 26.54, note: "A hundred metres per second — the cabin gauge climbs, tape reads T+10",
    setup(W, lt, t) {
      const S = W.sets.tunnel;
      S.cabin.visible = true; S.cable.visible = false; S.view.visible = true; S.rockView.visible = false;
      S.tape.visible = true; S.tape2.visible = false; S.tape3.visible = false; S.crack.visible = false;
      S.speedG.userData.needle.rotation.z = lerp(-1.05, 0.05, seg(lt, 0.05, 1.25, E.out));
      const pos = [0.06, 10.68, 0.95];
      return { cam: { pos, look: [0, 9.92, -1.0], fov: 44, shake: 0.12 },
        look: { focus: Math.hypot(pos[0], pos[1] - 9.9, pos[2] + 1.0), aper: 0.026, warm: 0.7, exposure: 1.2 },
        shadowAt: [0, 10.2, -0.5], shadowSize: 1.4, mb: 3 };
    } });

  add({ id: 'C4', set: 'section', start: 27.96, note: 'Gravity is strongest at the surface — full arrow, 1.0 g',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, 'one');
      S.globe.group.rotation.set(0.02, 0.52, 0); S.globe.group.updateMatrixWorld(true);
      S.arrowDown.visible = true; S.arrowDown.position.copy(S.globe.group.localToWorld(V(-0.78, 2.2, 0.36)));
      S.arrowDown.rotation.set(0, 0, Math.PI); S.arrowDown.scale.setScalar(0.86);
      cap(W, S, S.globe.group.localToWorld(V(-0.62, 1.72, 0.3)).toArray(), { scale: 0.16, rotY: 0.55 });
      const u = seg(lt, 0, 2.3, E.io);
      const pos = [lerp(4.9, 5.0, u), lerp(3.3, 3.35, u), lerp(7.1, 7.3, u)];
      return { cam: { pos, look: [0, 2.45, 0.35], fov: 44, shake: 0.09 },
        look: { focus: Math.hypot(pos[0], pos[1] - 2.45, pos[2]), aper: 0.012, warm: 0.7 },
        shadowAt: [0, 2.5, 0], shadowSize: 5.5 };
    } });

  add({ id: 'C5', set: 'section', start: 30.40, note: 'In a uniform planet it weakens in a straight line — arrows above and below',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, null);
      S.globe.group.rotation.set(0.02, 0.52, 0); S.globe.group.updateMatrixWorld(true);
      S.arrowUp.visible = true; S.arrowUp.position.copy(S.globe.group.localToWorld(V(-0.85, 2.0, 0.34)));
      S.arrowUp.rotation.set(0, 0, Math.PI); S.arrowUp.scale.setScalar(0.7);
      S.arrowDown.visible = true; S.arrowDown.position.copy(S.globe.group.localToWorld(V(-0.85, -2.0, 0.34)));
      S.arrowDown.rotation.set(0, 0, 0); S.arrowDown.scale.setScalar(0.7);
      cap(W, S, S.globe.group.localToWorld(V(0.62, 1.15, 0.3)).toArray(), { scale: 0.16, rotY: 0.3 });
      const u = seg(lt, 0, 1.9, E.io);
      const pos = [lerp(4.6, 4.2, u), 3.02, lerp(6.7, 6.2, u)];
      return { cam: { pos, look: [0, 3.0, 0.35], fov: 44, shake: 0.08 },
        look: { focus: Math.hypot(pos[0], pos[1] - 3.0, pos[2]), aper: 0.012, warm: 0.7 },
        shadowAt: [0, 2.6, 0], shadowSize: 5.0 };
    } });

  add({ id: 'C6', set: 'section', start: 32.58, note: 'Half as strong at the halfway point — arrow halved, capsule halfway',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, 'half');
      S.globe.group.rotation.set(0.02, 0.52, 0); S.globe.group.updateMatrixWorld(true);
      S.arrowDown.visible = true; S.arrowDown.position.copy(S.globe.group.localToWorld(V(-0.7, 1.62, 0.34)));
      S.arrowDown.rotation.set(0, 0, Math.PI); S.arrowDown.scale.set(1, 0.55, 1);
      cap(W, S, S.globe.group.localToWorld(V(-0.68, 0.62, 0.3)).toArray(), { scale: 0.16, rotY: 0.2 });
      const u = seg(lt, 0, 1.7, E.io);
      const pos = [lerp(4.35, 4.0, u), 2.95, lerp(6.4, 6.0, u)];
      return { cam: { pos, look: [0, 3.05, 0.4], fov: 46, shake: 0.07 },
        look: { focus: Math.hypot(pos[0], pos[1] - 3.05, pos[2]), aper: 0.014, warm: 0.7 },
        shadowAt: [0, 2.8, 0], shadowSize: 4.0 };
    } });

  add({ id: 'C7', set: 'section', start: 34.48, note: 'At the center it cancels out — 0.0 g, the capsule hangs',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, 'zero'); S.plaque.visible = false;
      S.globe.group.rotation.set(0.02, 0.52, 0); S.globe.group.updateMatrixWorld(true);
      cap(W, S, S.globe.group.localToWorld(V(-0.12, 0.0, 0.36)).toArray(), { scale: 0.18, rotY: 0.55 });
      const u = seg(lt, 0, 2.2, E.io);
      const pos = [lerp(4.15, 4.45, u), 2.8, lerp(6.2, 6.4, u)];
      return { cam: { pos, look: [0, 3.12, 0.55], fov: 46, shake: 0.07 },
        look: { focus: Math.hypot(pos[0], pos[1] - 3.12, pos[2] - 0.55), aper: 0.014, warm: 0.75 },
        shadowAt: [0, 2.2, 0], shadowSize: 4.0 };
    } });

  add({ id: 'C8', set: 'tunnel', start: 36.92, note: 'For one perfect moment you float — a pencil drifts past the porthole',
    setup(W, lt, t) {
      const S = W.sets.tunnel;
      S.cabin.visible = true; S.cable.visible = false; S.view.visible = true; S.rockView.visible = false;
      S.tape.visible = true; S.tape2.visible = false; S.tape3.visible = false;
      const u = seg(lt, 0, 2.6, E.io);
      S.pencil.position.set(lerp(0.26, -0.12, u), lerp(0.20, 0.14, u), lerp(-0.78, -1.04, u));
      S.pencil.rotation.set(lerp(0.4, 1.2, u), lerp(0.9, 2.2, u), lerp(0.7, 1.5, u));
      S.rush.forEach((r, i) => { r.material.opacity = 0.18; });
      const pos = [0.12, 10.68, 0.92];
      return { cam: { pos, look: [0, 10.5, -1.15], fov: 42, shake: 0.06 },
        look: { focus: Math.hypot(pos[0], pos[1] - 10.6, pos[2] + 1.0), aper: 0.024, warm: 0.75, exposure: 1.3 },
        shadowAt: [0, 10.5, -0.8], shadowSize: 1.2 };
    } });

  add({ id: 'C9', set: 'section', start: 39.90, note: 'Then you are past it — the arrow flips, gravity pulls you back',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, null);
      S.globe.group.rotation.set(0.02, 0.52, 0); S.globe.group.updateMatrixWorld(true);
      S.arrowUp.visible = true; S.arrowUp.position.copy(S.globe.group.localToWorld(V(-0.55, -1.82, 0.34)));
      S.arrowUp.rotation.set(0, 0, 0); S.arrowUp.scale.setScalar(0.8);
      cap(W, S, S.globe.group.localToWorld(V(0.62, -0.72, 0.28)).toArray(), { scale: 0.16, rotY: 0.15 });
      const u = seg(lt, 0, 2.2, E.io);
      const pos = [lerp(4.35, 4.7, u), 3.05, lerp(6.4, 6.8, u)];
      return { cam: { pos, look: [0, 3.2, 0.4], fov: 44, shake: 0.08 },
        look: { focus: Math.hypot(pos[0], pos[1] - 3.2, pos[2] - 0.4), aper: 0.014, warm: 0.7 },
        shadowAt: [0, 2.2, 0], shadowSize: 4.2 };
    } });

  add({ id: 'C10', set: 'tunnel', start: 42.38, note: 'Then you are past it — the capsule falls on toward the far end',
    setup(W, lt, t) {
      const S = W.sets.tunnel, u = seg(lt, 0, 1.6, E.in);
      S.cable.visible = false;
      const y = 16.8 - 2.2 * u;
      cap(W, S, [0, y, 0], { rotY: 0.2, scale: 1 });
      const pos = [0.72, y + 0.4, 0.82];
      return { cam: { pos, look: [0, y - 0.2, 0], fov: 54, shake: 0.16 },
        look: { focus: Math.hypot(pos[0], pos[1] - y, pos[2]), aper: 0.018, warm: 0.55, exposure: 1.2 },
        shadowAt: [0, y, 0], shadowSize: 2.2, mb: 4, shutter: 0.7 };
    } });

  add({ id: 'C11', set: 'tunnel', start: 45.30, note: 'You slow down and stop at the far end — the catch net, 42:12',
    setup(W, lt, t) {
      const S = W.sets.tunnel, u = seg(lt, 0, 0.85, E.out);
      S.cable.visible = false; S.impossible.visible = false;
      S.clockPlate.position.set(0.70, 2.05, -1.05); S.clockPlate.rotation.set(0, -0.55, 0);
      const settle = 1.88 + 0.12 * Math.exp(-lt * 5) * Math.sin(lt * 22);
      const y = lerp(3.4, settle, u);
      cap(W, S, [0, y, 0], { rotY: 0.1, scale: 1 });
      const pos = [0.78, 1.32, 0.98];
      return { cam: { pos, look: [0, 1.34, 0], fov: 68, shake: 0.14 },
        look: { focus: Math.hypot(pos[0], pos[1] - 1.34, pos[2]), aper: 0.018, warm: 0.55, exposure: 1.2 },
        shadowAt: [0, 1.2, 0], shadowSize: 2.0, mb: lt < 0.8 ? 4 : 1 };
    } });

  add({ id: 'C12', set: 'lab', start: 48.04, note: 'The trip takes forty-two minutes — the fall-time clock',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      S.globe.tunnel.visible = true;
      stand(b, 0.35, -1.1, Math.PI, { y: 0, lean: 6 });
      hand(b, 'L', V(0.6, 1.0, -1.5), V(-0.2, -0.7, 0.2), V(0, 0, 1)); b.fingers('L', GRIPS.open);
      hand(b, 'R', V(0.2, 1.02, -1.5), V(-0.2, -0.7, 0.2), V(0, 0, 1)); b.fingers('R', GRIPS.relax);
      b.look(V(-0.75, 2.66, -2.43), 0.5);
      const pos = [-0.75, 2.70, lerp(-1.16, -1.08, seg(lt, 0, 1.9, E.io))];
      return { cam: { pos, look: [-0.75, 2.66, -2.43], fov: 28, shake: 0.05 },
        look: { focus: pos[2] + 2.43, aper: 0.026, warm: 0.75, exposure: 1.45 },
        shadowAt: [-0.6, 2.5, -2.2], shadowSize: 0.9 };
    } });

  add({ id: 'C13', set: 'lab', start: 50.16, note: "That's the clean version — two clocks, and the brass lever marked REAL EARTH",
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      const u = seg(lt, 0.1, 1.7, E.io);
      S.lever.rotation.z = -0.18; S.lever.updateMatrixWorld(true);
      stand(b, -1.90, -1.40, -1.50, { y: 0, lean: 16 });
      hand(b, 'R', V(-2.20, 1.02, -1.47), V(-0.2, -0.6, -0.5), V(0, 0, -1)); b.fingers('R', GRIPS.hold);
      hand(b, 'L', V(-2.32, 1.02, -1.43), V(0.2, -0.7, 0.3), V(0, 0, -1)); b.fingers('L', GRIPS.open);
      b.look(V(-1.6, 1.40, -1.56), 0.6);
      const pos = [0.30, lerp(2.00, 1.92, u), 0.84];
      const look = [lerp(0.10, 0.55, u), lerp(2.18, 1.32, u), lerp(-2.30, -1.78, u)];
      return { cam: { pos, look, fov: 42, shake: 0.06 },
        look: { focus: 2.80, aper: 0.026, warm: 0.72, exposure: 1.35 },
        shadowAt: [0.2, 2.2, -2.2], shadowSize: 1.8 };
    } });

  add({ id: 'C14', set: 'lab', start: 53.80, note: 'The real Earth is denser — the fall-time clock reads 38:11',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      stand(b, 0.35, -1.1, Math.PI, { y: 0, lean: 6 });
      hand(b, 'L', V(0.6, 1.0, -1.5), V(-0.2, -0.7, 0.2), V(0, 0, 1)); b.fingers('L', GRIPS.open);
      b.look(V(0.75, 2.66, -2.43), 0.5);
      const pos = [0.75, 2.70, lerp(-1.14, -1.06, seg(lt, 0, 1.9, E.io))];
      return { cam: { pos, look: [0.75, 2.66, -2.43], fov: 28, shake: 0.05 },
        look: { focus: pos[2] + 2.43, aper: 0.028, warm: 0.75, exposure: 1.45 },
        shadowAt: [0.7, 2.5, -2.2], shadowSize: 0.9 };
    } });

  add({ id: 'C15', set: 'lab', start: 56.90, note: 'At the center, eight kilometres per second — the wall speedometer',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.lab, b = S.bullard;
      S.speedo.userData.needle.rotation.z = lerp(-1.15, -0.18, seg(lt, 0.05, 1.6, E.out));
      stand(b, 2.0, -1.1, Math.PI, { y: 0, lean: 8 });
      hand(b, 'L', V(2.22, 1.0, -1.5), V(-0.2, -0.7, 0.2), V(0, 0, 1)); b.fingers('L', GRIPS.open);
      b.look(V(2.55, 2.38, -2.43), 0.6);
      const u = seg(lt, 0, 2.2, E.io);
      const pos = [2.55, 2.02, lerp(-0.80, -0.70, u)];
      return { cam: { pos, look: [2.55, 2.38, -2.43], fov: 31, shake: 0.05 },
        look: { focus: pos[2] + 2.43, aper: 0.028, warm: 0.75, exposure: 1.45 },
        shadowAt: [2.2, 2.1, -2.2], shadowSize: 0.9 };
    } });

  // =====================================================================
  // D · WHY IT FAILS (1:00.3–1:46.6)
  // =====================================================================
  add({ id: 'D1', set: 'core', start: 60.26, note: 'But the center is not a cave — the iron sphere and the bore',
    setup(W, lt, t) {
      const S = W.sets.core;
      cap(W, S, [0, lerp(8.9, 8.3, seg(lt, 0, 2.1, E.in)), 0], { scale: 0.45, rotY: 0.2 });
      const u = seg(lt, 0, 2.2, E.io);
      const pos = [lerp(10.6, 9.8, u), lerp(7.8, 7.4, u), lerp(13.6, 12.8, u)];
      return { cam: { pos, look: [0, 5.6, 0], fov: 38, shake: 0.1 },
        look: { focus: Math.hypot(pos[0], pos[1] - 5.6, pos[2]), aper: 0.012, warm: 0.8 },
        shadowAt: [0, 4.4, 0], shadowSize: 7, mb: 3 };
    } });

  add({ id: 'D2', set: 'core', start: 62.56, note: "It's iron, almost as hot as the Sun's surface — the cracked shell",
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.core;
      const u = seg(lt, 0, 3.2, E.io);
      const pos = [lerp(3.9, 3.4, u), lerp(6.7, 6.3, u), lerp(-9.6, -9.0, u)];
      return { cam: { pos, look: [0, 4.7, 0], fov: 40, shake: 0.08 },
        look: { focus: Math.hypot(pos[0], pos[1] - 4.7, pos[2]), aper: 0.02, warm: 0.85 },
        shadowAt: [0.8, 4.4, -2.2], shadowSize: 5.0 };
    } });

  add({ id: 'D3', set: 'core', start: 66.00, note: 'Five thousand four hundred degrees — the temperature probe',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.core;
      const u = seg(lt, 0, 2.1, E.io);
      const pos = [-1.28, lerp(1.28, 1.24, u), lerp(3.82, 3.66, u)];
      return { cam: { pos, look: [-1.28, 1.15, 2.55], fov: 30, shake: 0.06 },
        look: { focus: Math.hypot(pos[1] - 1.15, pos[2] - 2.55), aper: 0.028, warm: 0.85, exposure: 1.2 },
        shadowAt: [-1.6, 1.05, 2.5], shadowSize: 1.1 };
    } });

  add({ id: 'D4', set: 'core', start: 68.40, note: 'The pressure — three point six million atmospheres',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.core;
      const u = seg(lt, 0, 1.9, E.io);
      const pos = [1.35, lerp(1.57, 1.53, u), lerp(3.72, 3.58, u)];
      return { cam: { pos, look: [1.35, 1.42, 2.68], fov: 32, shake: 0.06 },
        look: { focus: Math.hypot(pos[0] - 1.35, pos[1] - 1.42, pos[2] - 2.68), aper: 0.03, warm: 0.85, exposure: 1.15 },
        shadowAt: [1.3, 1.3, 2.5], shadowSize: 0.8 };
    } });

  add({ id: 'D5', set: 'tunnel', start: 71.72, note: 'Rock flows like putty — the shaft begins to sag inward',
    setup(W, lt, t) {
      const S = W.sets.tunnel, u = seg(lt, 0, 3.0, E.io);
      S.cable.visible = false; S.sag.visible = true;
      S.sag.scale.set(1 - 0.2 * u, 1, 1 - 0.2 * u);
      cap(W, S, [0, 12.2 - 0.4 * u, 0], { rotY: 0.3, scale: 1 });
      const pos = [0.7, 13.25, 0.92];
      return { cam: { pos, look: [0, 12.0, 0], fov: 56, shake: 0.16 },
        look: { focus: Math.hypot(pos[0], pos[1] - 12.0, pos[2]), aper: 0.018, warm: 0.55, exposure: 1.15 },
        shadowAt: [0, 12.0, 0], shadowSize: 2.4, mb: 3 };
    } });

  add({ id: 'D6', set: 'tunnel', start: 73.40, note: 'Metal is squeezed solid — the capsule takes the load',
    setup(W, lt, t) {
      const S = W.sets.tunnel, u = seg(lt, 0, 1.5, E.io);
      S.cable.visible = false; S.sag.visible = true;
      S.sag.scale.set(0.8 - 0.08 * u, 1, 0.8 - 0.08 * u);
      cap(W, S, [0, 11.6, 0], { rotY: 0, scale: 1, squash: [1 - 0.1 * u, 1 + 0.02 * u, 1 - 0.1 * u] });
      const pos = [0.58, 11.9, 0.74];
      return { cam: { pos, look: [0, 11.6, 0], fov: 42, shake: 0.3 },
        look: { focus: Math.hypot(pos[0], pos[1] - 11.6, pos[2]), aper: 0.022, warm: 0.55, exposure: 1.15 },
        shadowAt: [0, 11.5, 0], shadowSize: 1.6, mb: 4, shutter: 0.7 };
    } });

  add({ id: 'D7', set: 'tunnel', start: 75.34, note: 'Your tunnel sags shut behind you — the plug closes overhead',
    setup(W, lt, t) {
      const S = W.sets.tunnel, u = seg(lt, 0, 1.7, E.io);
      S.cable.visible = false; S.plug.visible = true;
      S.plug.position.y = 10.85; S.plug.scale.setScalar(0.88 + 0.18 * u);
      cap(W, S, [0, 8.7 - 0.25 * u, 0], { rotY: 0.1, scale: 1 });
      const pos = [0.58, 12.1, 0.9];
      return { cam: { pos, look: [0, 9.5, 0], fov: 58, shake: 0.22 },
        look: { focus: Math.hypot(pos[0], pos[1] - 9.5, pos[2]), aper: 0.016, warm: 0.5, exposure: 1.1 },
        shadowAt: [0, 10.0, 0], shadowSize: 2.6 };
    } });

  add({ id: 'D8', set: 'kola', start: 77.78, note: 'The deepest hole we have made is twelve kilometres deep — back to Kola',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker, m = S.miner;
      stand(w, -2.35, 1.4, -1.05, { y: S.padY, lean: 28 }); wearHat(w, S.hats.worker);
      S.coreSample.position.set(-2.72, 0.995, 1.73); S.coreSample.rotation.set(0, 0.2, 0);
      hand(w, 'R', V(-2.6, 1.08, 1.74), V(-0.4, -0.6, 0.2), V(0, 0.2, 1));
      hand(w, 'L', V(-2.42, 1.0, 1.9), V(0.2, -0.7, 0.3), V(0, 0, 1));
      w.fingers('R', GRIPS.rim); w.fingers('L', GRIPS.open); w.look(S.coreSample.position, 0.8);
      stand(m, -3.7, -2.0, 1.2, { y: S.padY, lean: 6 }); wearCap(m, S.hats.miner);
      hand(m, 'R', V(-3.9, 1.0, -1.6), V(-0.3, -0.7, 0.3), V(0, 0, 1)); m.fingers('R', GRIPS.relax);
      m.look(V(-4.6, 1.2, -2.5), 0.6);
      const u = seg(lt, 0, 3.4, E.io);
      const pos = [lerp(4.8, 4.1, u), lerp(2.2, 2.05, u), lerp(7.2, 6.3, u)];
      return { cam: { pos, look: [0, 2.55, 0], fov: 44, shake: 0.1 },
        look: { focus: Math.hypot(pos[0], pos[1] - 2.55, pos[2]), aper: 0.016, warm: 0.6 },
        shadowAt: [0, 1.2, 0], shadowSize: 4.5 };
    } });

  add({ id: 'D9', set: 'kola', start: 81.50, note: 'At the bottom the rock is 180 °C — the drill bit on its stand',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker;
      stand(w, 1.55, 1.75, -2.2, { y: S.padY, lean: 20 }); wearHat(w, S.hats.worker);
      hand(w, 'R', V(2.05, 0.85, 1.45), V(-0.3, -0.6, 0.4), V(0, 0, 1)); w.fingers('R', GRIPS.relax);
      w.look(V(2.45, 0.5, 1.0), 0.8);
      S.bitFill.visible = true;
      const u = seg(lt, 0, 2.2, E.io);
      const pos = [lerp(3.6, 3.45, u), lerp(1.5, 1.42, u), lerp(2.75, 2.6, u)];
      return { cam: { pos, look: [2.5, 0.55, 1.05], fov: 36, shake: 0.07 },
        look: { focus: Math.hypot(pos[0] - 2.5, pos[1] - 0.55, pos[2] - 1.05), aper: 0.028, warm: 0.7, exposure: 1.2 },
        shadowAt: [2.4, 0.35, 1.0], shadowSize: 1.4 };
    } });

  add({ id: 'D10', set: 'kola', start: 85.06, note: 'It creeps back into the hole — the wall closes over the bore',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker;
      stand(w, -0.46, 0.38, 2.28, { y: S.padY, lean: 52, drop: 0.3 }); wearHat(w, S.hats.worker);
      S.holePlate.visible = false;
      S.wrench.visible = false;
      S.creep.visible = true;
      const k = seg(lt, 0.15, 2.2, E.io);
      S.creep.scale.setScalar(lerp(1.55, 0.18, k));
      S.creep.position.y = S.hole.y - 0.035 * k;
      S.coreSample.position.set(0.32, 0.24, 0.34); S.coreSample.rotation.set(0, -0.8, 0);
      hand(w, 'R', V(0.36, 0.56, 0.4), V(-0.4, -0.6, -0.4), V(0, 0, -1)); w.fingers('R', GRIPS.rim);
      hand(w, 'L', V(0.02, 0.34, 0.18), V(-0.4, -0.6, -0.5), V(0, 0, -1)); w.fingers('L', GRIPS.open);
      w.look(V(0.1, 0.2, 0.05), 0.9);
      const pos = [0.82, 0.96, 1.52];
      return { cam: { pos, look: [0.02, 0.24, 0.06], fov: 42, shake: 0.1 },
        look: { focus: Math.hypot(pos[0] - 0.02, pos[1] - 0.24, pos[2] - 0.06), aper: 0.022, warm: 0.65, exposure: 1.2 },
        shadowAt: [0.1, 0.3, 0.05], shadowSize: 1.2 };
    } });

  add({ id: 'D11', set: 'kola', start: 87.04, note: 'The drill bit gets stuck, the hole heals — the crew strains on the string',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker, m = S.miner;
      const pull = Math.sin(lt * 3.4) * 0.05;
      stand(w, 1.68, 0.9, -1.85, { y: S.padY, lean: 26 }); wearHat(w, S.hats.worker);
      hand(w, 'R', V(1.14, 1.06 + pull, 0.62), V(-0.4, -0.6, -0.4), V(0, 0, -1)); w.fingers('R', GRIPS.fist);
      hand(w, 'L', V(1.12, 0.88 + pull, 0.7), V(-0.4, -0.6, -0.4), V(0, 0, -1)); w.fingers('L', GRIPS.fist);
      w.look(V(1.0, 1.05, 0.68), 0.8);
      stand(m, 0.32, 1.02, 2.0, { y: S.padY, lean: 24 }); wearCap(m, S.hats.miner);
      hand(m, 'L', V(0.86, 1.06 + pull, 0.62), V(-0.4, -0.6, -0.4), V(0, 0, -1)); m.fingers('L', GRIPS.fist);
      hand(m, 'R', V(0.84, 0.88 + pull, 0.7), V(-0.4, -0.6, -0.4), V(0, 0, -1)); m.fingers('R', GRIPS.fist);
      m.look(V(1.0, 1.05, 0.68), 0.8);
      S.wrench.rotation.z = 0.15 + 0.12 * pull * 20;
      const pos = [1.0, 1.42, 2.8];
      return { cam: { pos, look: [1.0, 0.9, 0.7], fov: 46, shake: 0.14 },
        look: { focus: Math.hypot(pos[0] - 1.0, pos[1] - 0.9, pos[2] - 0.7), aper: 0.02, warm: 0.65 },
        shadowAt: [1.0, 0.8, 0.6], shadowSize: 2.0 };
    } });

  add({ id: 'D12', set: 'section', start: 89.94, note: 'Unless your tunnel runs pole to pole, the Earth turns under you',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, null);
      const u = seg(lt, 0, 2.6, E.io);
      S.globe.group.rotation.set(0.02, 0.12 + 0.9 * u, 0);
      cap(W, S, [0.02, S.CY + 1.02, 0.24], { scale: 0.13, rotY: 0.5 });
      const pos = [2.05, 4.0, 3.0];
      return { cam: { pos, look: [0, 3.9, 0.2], fov: 40, shake: 0.1 },
        look: { focus: Math.hypot(pos[0], pos[1] - 3.9, pos[2] - 0.2), aper: 0.018, warm: 0.7, exposure: 1.05 },
        shadowAt: [0, 3.2, 0], shadowSize: 2.0 };
    } });

  add({ id: 'D13', set: 'section', start: 92.44, note: 'The Earth turns under you — the tunnel slides away from the capsule',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, null);
      S.globe.group.rotation.set(0.02, 0.5 + 0.12 * seg(lt, 0, 1.7, E.io), 0);
      cap(W, S, [0.476, S.CY + 0.32, -0.104], { scale: 0.11, rotY: 0.4 });
      const pos = [2.0, 3.55, 2.4];
      return { cam: { pos, look: [0.1, 3.15, 0.0], fov: 32, shake: 0.11 },
        look: { focus: Math.hypot(pos[0] - 0.476, pos[1] - 3.47, pos[2] + 0.104), aper: 0.022, warm: 0.7, exposure: 1.1 },
        shadowAt: [0.35, 3.3, 0], shadowSize: 1.2 };
    } });

  add({ id: 'D14', set: 'section', start: 94.22, note: 'You drift sideways and scrape the wall — close on the capsule',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, null);
      S.globe.group.rotation.set(0.02, 0.56, 0);
      const shake = Math.sin(lt * 40) * 0.02;
      cap(W, S, [0.235 + shake, S.CY - 0.38, -0.03], { scale: 0.11, rotY: 0.5 });
      const pos = [1.0, 2.95, 1.2];
      return { cam: { pos, look: [0.26, 2.85, -0.02], fov: 34, shake: 0.32 },
        look: { focus: Math.hypot(pos[0] - 0.31, pos[1] - 2.77, pos[2] + 0.03), aper: 0.024, warm: 0.7, exposure: 1.05 },
        shadowAt: [0.35, 2.7, 0], shadowSize: 1.0 };
    } });

  add({ id: 'D15', set: 'tunnel', start: 97.50, note: 'With air you hit terminal velocity — 200 km/h, and the fall never finishes',
    setup(W, lt, t) {
      const S = W.sets.tunnel;
      S.cabin.visible = true; S.cable.visible = false; S.view.visible = true; S.rockView.visible = false;
      S.tape.visible = false; S.tape2.visible = false; S.tape3.visible = true; S.crack.visible = false;
      S.speedG.userData.needle.rotation.z = lerp(-0.9, 0.55, seg(lt, 0.05, 1.4, E.out));
      const pos = [0.1, 10.02, 0.78];
      return { cam: { pos, look: [0, 9.86, -1.0], fov: 36, shake: 0.1 },
        look: { focus: Math.hypot(pos[0], pos[1] - 9.86, pos[2] + 1.0), aper: 0.028, warm: 0.7, exposure: 1.2 },
        shadowAt: [0, 9.9, -0.6], shadowSize: 1.0 };
    } });

  add({ id: 'D16', set: 'tunnel', start: 101.42, note: "You'd never reach the other side — the capsule stops, the plate ahead",
    setup(W, lt, t) {
      const S = W.sets.tunnel;
      S.cable.visible = false; S.plug.visible = false;
      S.impossible.visible = true;
      S.markers[1].visible = false;
      cap(W, S, [0, 15.1, 0], { rotY: 0.1, scale: 1 });
      const pos = [0.15, 16.1, -0.85];
      return { cam: { pos, look: [0.15, 17.0, 1.18], fov: 50, shake: 0.1 },
        look: { focus: Math.hypot(pos[1] - 17.0, pos[2] - 1.18), aper: 0.018, warm: 0.5, exposure: 1.1 },
        shadowAt: [0.1, 16.9, 1.0], shadowSize: 1.4 };
    } });

  add({ id: 'D17', set: 'tunnel', start: 103.88, note: 'So a tunnel through the Earth is impossible — the plate, dead centre',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.tunnel;
      S.cable.visible = false; S.plug.visible = false; S.impossible.visible = true;
      const u = seg(lt, 0, 2.1, E.io);
      const pos = [0.15, 17.0, lerp(0.04, 0.0, u)];
      return { cam: { pos, look: [0.15, 17.0, 1.18], fov: 46, shake: 0.04 },
        look: { focus: 1.16 - pos[2], aper: 0.028, warm: 0.5, exposure: 1.1 },
        shadowAt: [0.1, 16.9, 1.0], shadowSize: 1.2 };
    } });

  // =====================================================================
  // E · THE OTHER SIDE (1:46.6–2:00)
  // =====================================================================
  add({ id: 'E1', set: 'section', start: 106.60, note: 'But the maths is beautiful — the cutaway Earth in the sunrise',
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.section;
      sectionTags(S, null);
      const u = seg(lt, 0, 2.1, E.io2);
      S.globe.group.rotation.set(0.02, 0.55 + 0.1 * u, 0);
      const ang = lerp(0.86, 0.74, u);
      const pos = [Math.sin(ang) * 8.8, lerp(3.8, 4.15, u), Math.cos(ang) * 8.8];
      return { cam: { pos, look: [0, 3.15, 0], fov: 38, shake: 0.07 },
        look: { focus: Math.hypot(pos[0], pos[1] - 3.15, pos[2]), aper: 0.01, warm: 0.85 },
        shadowAt: [0, 2.6, 0], shadowSize: 6.5 };
    } });

  add({ id: 'E2', set: 'far', start: 108.64, note: 'A shortcut to the other side — the capsule rises out of the riser and into the net',
    setup(W, lt, t) {
      const S = W.sets.far, w = S.worker, u = seg(lt, 0, 2.1, E.io);
      const y = kf(u, [[0, 3.05], [0.46, 5.16], [0.68, 4.58], [0.85, 4.28], [1, 4.2]]);
      const x = kf(u, [[0, 1.15], [0.46, 1.15], [0.7, 0.35], [0.86, 0.02], [1, 0]]);
      const z = kf(u, [[0, 0.15], [0.46, 0.15], [0.7, -0.55], [0.86, -0.82], [1, -0.85]]);
      const tilt = kf(u, [[0, 0], [0.7, 0], [0.9, 0.03], [1, 0.055]]);
      cap(W, S, [x, y, z], { rotY: 0.35 - 0.25 * u, scale: 1, tilt: [0, 0, tilt] });
      S.hat.group.visible = false;
      stand(w, -1.55, -0.9, -2.0, { y: S.DECK + 0.12, lean: 16 }); wearHat(w, S.hat);
      hand(w, 'R', V(-1.82, S.DECK + 0.55, -1.2), V(-0.4, -0.6, -0.5), V(0, 0, -1)); w.fingers('R', GRIPS.hold);
      hand(w, 'L', V(-1.95, S.DECK + 0.32, -1.08), V(-0.4, -0.6, -0.5), V(0, 0, -1)); w.fingers('L', GRIPS.hold);
      w.look(V(0.3, S.DECK + 1.4, -0.6), 0.7);
      const pos = [1.6, 4.4, 6.0];
      return { cam: { pos, look: [0.0, 3.7, -0.55], fov: 46, shake: 0.12 },
        look: { focus: Math.hypot(pos[0], pos[1] - 3.7, pos[2] + 0.55), aper: 0.018, warm: 0.8 },
        shadowAt: [0.4, 3.8, -0.4], shadowSize: 3.4, mb: u > 0.15 && u < 0.8 ? 3 : 1 };
    } });

  add({ id: 'E3', set: 'far', start: 112.38, note: 'And most of the time, that other side is ocean — the platform in the Southern Ocean',
    setup(W, lt, t) {
      const S = W.sets.far, w = S.worker;
      S.hat.group.visible = false;
      stand(w, 2.55, 2.85, 0.28, { y: S.DECK + 0.12, lean: 6 }); wearHat(w, S.hat);
      hand(w, 'L', V(2.35, S.DECK + 0.82, 3.42), V(-0.2, -0.7, -0.3), V(0, 0, -1)); w.fingers('L', GRIPS.hold);
      hand(w, 'R', V(2.78, S.DECK + 0.82, 3.42), V(-0.2, -0.7, -0.3), V(0, 0, -1)); w.fingers('R', GRIPS.hold);
      w.look(V(9, 3.2, 24), 0.5);
      cap(W, S, [0, 4.6, -0.85], { rotY: 0.2, scale: 1 });
      const u = seg(lt, 0, 3.2, E.io);
      const pos = [lerp(8.8, 10.6, u), lerp(3.7, 4.5, u), lerp(13.2, 15.8, u)];
      return { cam: { pos, look: [0.3, 2.9, -1.3], fov: 46, shake: 0.09 },
        look: { focus: Math.hypot(pos[0] - 0.3, pos[1] - 2.9, pos[2] + 1.3), aper: 0.006, warm: 0.9 },
        shadowAt: [0, 2.0, 0], shadowSize: 9 };
    } });

  add({ id: 'E4', set: 'kola', start: 115.68, note: "The deepest we've managed is a pinprick — the worker caps SG-3, pull back, fade",
    setup(W, lt, t) {
      W.capsule.group.visible = false;
      const S = W.sets.kola, w = S.worker, m = S.miner;
      const u = seg(lt, 0, 2.0, E.io);
      const place = seg(lt, 0, 1.2, E.io);
      S.cap.position.set(lerp(2.2, 0, place), S.padY + 0.02 * place, lerp(1.9, 0, place));
      stand(w, 0.48, 0.5, 2.34, { y: S.padY, lean: 46, drop: 0.22 }); wearHat(w, S.hats.worker);
      hand(w, 'R', V(0.12 + 0.05, 0.34 + 0.04, 0.12), V(-0.3, -0.7, -0.5), V(0, 0, -1)); w.fingers('R', GRIPS.rim);
      hand(w, 'L', V(0.35, 0.55, 0.55), V(-0.3, -0.7, -0.5), V(0, 0, -1)); w.fingers('L', GRIPS.open);
      w.look(V(0.05, 0.2, 0.05), 0.9);
      stand(m, -3.6, -1.4, 0.8, { y: S.padY, lean: 10 }); wearCap(m, S.hats.miner);
      hand(m, 'R', V(-4.0, 1.1, -1.0), V(-0.3, -0.7, 0.3), V(0, 0, 1)); m.fingers('R', GRIPS.relax);
      m.look(V(-4.6, 1.2, -2.2), 0.6);
      const pos = [lerp(1.15, 4.9, u), lerp(0.8, 3.05, u), lerp(1.95, 7.2, u)];
      const look = [lerp(0.0, 0.1, u), lerp(0.35, 2.6, u), lerp(0.0, 0.2, u)];
      const fade = seg(t, T.dur - 0.75, T.dur, E.in);
      return { cam: { pos, look, fov: lerp(40, 48, u), shake: 0.08 },
        look: { focus: Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]), aper: lerp(0.026, 0.012, u), warm: 0.8, fade: 1 - fade },
        shadowAt: [0, 1.0, 0], shadowSize: lerp(1.6, 6, u) };
    } });

  // =====================================================================
  // sound cues (tools/mix.py reads these through capture.mjs cues)
  // =====================================================================
  C(0, 'amb', { set: 'site', dur: 14.4, g: 0.55 });
  C(3.62, 'tink', { g: 0.45 }); C(5.66, 'whoosh', { dur: 1.0, f0: 420, f1: 180, g: 0.35 });
  C(8.45, 'amb', { set: 'wind', dur: 5.9, g: 0.5 });
  C(14.3, 'amb', { set: 'room', dur: 10.1, g: 0.8 }); C(14.75, 'tink', { g: 0.5 });
  for (let k = 0; k < 5; k++) C(17.2 + k * 0.32, 'knock', { g: 0.12, pan: 0.2 });
  C(19.5, 'clunk', { g: 0.5 }); C(21.35, 'steam', { dur: 1.5, g: 0.45 }); C(22.9, 'clunk', { g: 0.6 });
  C(24.28, 'amb', { set: 'deep', dur: 36.0, g: 0.55 }); C(24.3, 'whoosh', { dur: 1.1, f0: 900, f1: 180, g: 0.7 });
  C(25.3, 'whoosh', { dur: 1.2, f0: 600, f1: 1300, g: 0.4 }); C(26.6, 'shimmer', { dur: 1.3, g: 0.5 });
  C(28.0, 'whoosh', { dur: 1.4, f0: 300, f1: 160, g: 0.4 }); C(32.6, 'whoosh', { dur: 1.0, f0: 500, f1: 260, g: 0.35 });
  C(36.95, 'shimmer', { dur: 2.6, g: 0.55 }); C(42.4, 'whoosh', { dur: 1.2, f0: 700, f1: 160, g: 0.45 });
  C(45.35, 'catch', { g: 0.7 }); C(45.75, 'clunk', { g: 0.35 });
  C(48.1, 'tok', { g: 0.25 }); C(50.2, 'tink', { g: 0.45 }); C(53.85, 'tok', { g: 0.25 }); C(56.95, 'shimmer', { dur: 1.4, g: 0.4 });
  C(60.28, 'amb', { set: 'deep', dur: 18.0, g: 0.5 }); C(60.3, 'whoosh', { dur: 1.6, f0: 220, f1: 90, g: 0.55 });
  C(62.6, 'shimmer', { dur: 2.4, g: 0.55 }); C(66.05, 'shimmer', { dur: 1.8, g: 0.5 });
  C(68.45, 'tink', { g: 0.3 }); C(71.8, 'grit', { dur: 2.2, g: 0.9 });
  C(73.45, 'knock', { g: 0.35 }); C(73.6, 'scrape', { g: 0.5 }); C(75.4, 'clunk', { g: 0.65 });
  C(77.82, 'amb', { set: 'site', dur: 3.7, g: 0.5 }); C(81.55, 'grit', { dur: 1.6, g: 0.7 });
  C(85.1, 'grit', { dur: 1.8, g: 0.8 }); C(85.5, 'knock', { g: 0.3 });
  C(87.1, 'scrape', { g: 0.55 }); C(87.5, 'knock', { g: 0.35 }); C(88.4, 'knock', { g: 0.35 });
  C(90.0, 'amb', { set: 'deep', dur: 6.0, g: 0.4 }); C(90.05, 'whoosh', { dur: 0.8, f0: 380, f1: 700, g: 0.35 });
  C(92.5, 'whoosh', { dur: 1.4, f0: 500, f1: 200, g: 0.35 }); C(94.3, 'scrape', { g: 0.7 });
  C(97.55, 'whoosh', { dur: 1.6, f0: 800, f1: 160, g: 0.55 }); C(101.5, 'clunk', { g: 0.5 });
  C(103.9, 'tok', { g: 0.2 });
  C(106.62, 'shimmer', { dur: 2.0, g: 0.5 }); C(106.62, 'amb', { set: 'wind', dur: 12.6, g: 0.55 });
  C(108.7, 'whoosh', { dur: 1.0, f0: 300, f1: 900, g: 0.4 }); C(110.25, 'catch', { g: 0.6 });
  C(112.4, 'amb', { set: 'sea', dur: 6.8, g: 0.7 }); C(115.75, 'clunk', { g: 0.4 });

  return shots;
}
export { wt, clamp, sstep, D };
