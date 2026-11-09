// The film, shot by shot, keyed to the narration's word times. Each shot: set, start, setup(W, lt, t) → { cam, look, mb }.
import * as THREE from 'three';
import { wt, T } from './core/timing.js';
import { E, seg, kf, clamp, lerp, V, sstep } from './core/util.js';
import { Human, GRIPS } from './chars/human.js';

const D = Math.PI / 180;
const BLUE = new THREE.Color(0x6aa6db), OLIVE = new THREE.Color(0x5c5a3e);

/** wrist target so that the palm/fingers land on a grip point */
function wristFor(grip, fingers, palm, reach = 0.078, off = 0.018) {
  return grip.clone().addScaledVector(fingers.clone().normalize(), -reach).addScaledVector(palm.clone().normalize(), -off);
}
function put(obj, parent) { if (obj.parent !== parent) parent.add(obj); }
function blendGrip(a, b, t) {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[k] ?? a.all ?? (k === 'opp' || k === 'spread' ? 0 : [0, 0, 0]), vb = b[k] ?? b.all ?? (k === 'opp' || k === 'spread' ? 0 : [0, 0, 0]);
    o[k] = Array.isArray(va) ? va.map((x, i) => lerp(x, vb[i], t)) : lerp(va, vb, t);
  }
  return o;
}

// ---------- A: 1959, the exhibition hall ----------
const HAT_REST = V(0, 1.212, 0.0);
function heroHatA(W, t, tA2, tB1) {
  const hat = W.hats.hero, g = hat.group;
  const lift = seg(t, 0.6, tA2 - 0.2, E.io);
  let p = HAT_REST.clone().add(V(0, 0.34 * lift, -0.3 * lift)), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25 * lift, -0.55 + 0.2 * lift, 0.06 * lift));
  if (t > tA2 - 0.2) {
    const u = t - (tA2 - 0.2);
    p = HAT_REST.clone().add(V(0, 0.34, -0.3)).add(V(0.05 * u, 4.0 * u - 4.9 * u * u, 0.25 * u));
    q.multiply(new THREE.Quaternion().setFromAxisAngle(V(0.35, 0.25, 1).normalize(), 6.0 * u));
  }
  g.position.copy(p); g.quaternion.copy(q); g.scale.setScalar(1);
  const m = seg(t, tA2 + 0.1, tB1 - 0.2, E.io);
  hat.setShape('hardhat', 'brodie', m);
  const mat = hat.material();
  mat.color.copy(BLUE).lerp(OLIVE, m); mat.roughness = lerp(0.38, 0.78, m); mat.clearcoat = lerp(0.7, 0.0, m); mat.metalness = lerp(0, 0.15, m);
  return { p, q };
}
function workerA(W, t, hatP, hatQ, tA2) {
  const w = W.sets.modern.worker;
  const lean = kf(t, [[0, 8], [0.6, 20], [1.2, 14], [tA2 - 0.25, 2], [tA2 + 0.35, -6]]);
  w.rot('spine', lean * 0.6, 0, 0); w.rot('chest', lean * 0.4, 0, 0);
  w.root.position.y = 0.955 - 0.03 * seg(t, 0.2, 0.7) + 0.02 * seg(t, 1.2, 1.8);
  const gp = (x) => V(x, -0.004, 0.0).applyQuaternion(hatQ).add(hatP);
  const fingersL = V(-0.25, -0.7, 0.55).applyQuaternion(hatQ), palmL = V(-1, 0, 0).applyQuaternion(hatQ);
  const fingersR = V(0.25, -0.7, 0.55).applyQuaternion(hatQ), palmR = V(1, 0, 0).applyQuaternion(hatQ);
  const reach = seg(t, 0.05, 0.6, E.out);
  const restL = w.group.localToWorld(V(0.26, 0.9, 0.25)), restR = w.group.localToWorld(V(-0.26, 0.9, 0.25));
  const release = seg(t, tA2 - 0.26, tA2 - 0.14);
  const up = V(0, 0.32 * release, 0.1 * release);
  const tL = restL.clone().lerp(wristFor(gp(0.104), fingersL, palmL), reach).add(up);
  const tR = restR.clone().lerp(wristFor(gp(-0.104), fingersR, palmR), reach).add(up);
  const hqL = Human.handQ('L', fingersL, palmL), hqR = Human.handQ('R', fingersR, palmR);
  w.armIK('L', tL, w.group.localToWorld(V(0.7, 0.8, -0.6)), hqL);
  w.armIK('R', tR, w.group.localToWorld(V(-0.7, 0.8, -0.6)), hqR);
  const grip = blendGrip(GRIPS.relax, GRIPS.rim, seg(t, 0.45, 0.75));
  const fin = blendGrip(grip, GRIPS.open, release);
  w.fingers('L', fin); w.fingers('R', fin);
  w.look(hatP.clone().add(V(0, 0.02, 0)), 0.9);
}

// ---------- B: The perimeter guards ----------
const HELMET_ON = { pos: V(0, 0.158, -0.006), rot: new THREE.Euler(-0.07, 0, 0) };
function onHeadMatrix(h) { h.update(); const m = new THREE.Matrix4().compose(HELMET_ON.pos, new THREE.Quaternion().setFromEuler(HELMET_ON.rot), V(1, 1, 1)); return h.bone('head').matrixWorld.clone().multiply(m); }
function wear(h, hat) { const head = h.bone('head'); if (hat.group.parent !== head) head.add(hat.group); hat.group.position.copy(HELMET_ON.pos); hat.group.rotation.copy(HELMET_ON.rot); hat.group.scale.setScalar(1); }
function stand(h, x, z, yaw, { y = 0.09, drop = 0.0, lean = 0, twist = 0, side = 0 } = {}) {
  h.group.position.set(x, y, z); h.group.rotation.set(0, yaw, 0);
  h.root.position.y = 0.955 - drop; h.root.position.x = side;
  h.rot('spine', lean * 0.55, twist * 0.5, 0); h.rot('chest', lean * 0.45, twist * 0.5, 0);
  if (drop > 0.005) for (const sd of ['L', 'R']) { const g = sd === 'L' ? 1 : -1; h.legIK(sd, h.group.localToWorld(V(0.1 * g, 0.09, -0.012)), h.group.localToWorld(V(0.1 * g, 0.5, 1))); }
}
function shovelWork(h, shovel, t, rate = 0.62, ph = 0) {
  const u = ((t * rate + ph) % 1 + 1) % 1;
  const B = kf(u, [[0, [0.05, 0.13, 0.62]], [0.32, [0.05, 0.12, 0.72]], [0.62, [0.08, 1.05, 0.5]], [0.78, [0.12, 1.75, 0.62], E.out], [1, [0.05, 0.13, 0.62]]]);
  const ang = kf(u, [[0, 55], [0.32, 62], [0.62, 28], [0.78, -20, E.out], [1, 55]]);
  const lean = kf(u, [[0, 34], [0.32, 38], [0.62, 18], [0.78, 6], [1, 34]]);
  h.rot('spine', lean * 0.55, -8, 0); h.rot('chest', lean * 0.45, -6, 0);
  h.root.position.y = 0.955 - 0.06 * kf(u, [[0, 1], [0.32, 1], [0.62, 0.3], [0.78, 0], [1, 1]]);
  const Bw = h.group.localToWorld(V(...B));
  const dir = V(0, Math.cos(ang * D), -Math.sin(ang * D)).applyQuaternion(h.group.quaternion).normalize();
  shovel.position.copy(Bw); shovel.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
  const top = Bw.clone().addScaledVector(dir, 0.9), mid = Bw.clone().addScaledVector(dir, 0.42);
  const side = V(1, 0, 0).applyQuaternion(h.group.quaternion);
  h.armIK('R', top.clone().addScaledVector(dir, -0.05), h.group.localToWorld(V(-0.8, 0.9, -0.5)), Human.handQ('R', side.clone().negate().add(dir.clone().multiplyScalar(-0.2)), dir.clone().negate()));
  h.armIK('L', mid.clone().addScaledVector(dir, -0.04).addScaledVector(side, 0.02), h.group.localToWorld(V(0.8, 0.6, -0.4)), Human.handQ('L', side.clone().negate(), V(0, -1, 0).applyQuaternion(h.group.quaternion)));
  h.fingers('L', GRIPS.hold); h.fingers('R', GRIPS.holdThin);
  return u;
}
function malletWork(h, mallet, stakeObj, t, rate = 1.25) {
  const u = ((t * rate) % 1 + 1) % 1;
  const stakeTop = h.group.localToWorld(V(-0.02, 0.86, 0.42));
  stakeObj.position.copy(stakeTop).add(V(0, -0.4, 0)); stakeObj.quaternion.copy(h.group.quaternion);
  h.rot('spine', 26, 0, 0); h.rot('chest', 14, 0, 0); h.root.position.y = 0.955 - 0.07;
  h.armIK('L', stakeTop.clone().add(V(0, -0.2, 0)).add(V(0.06, 0, -0.03).applyQuaternion(h.group.quaternion)), h.group.localToWorld(V(0.8, 0.7, -0.3)), Human.handQ('L', V(-1, -0.2, 0).applyQuaternion(h.group.quaternion), V(0, 0, 1).applyQuaternion(h.group.quaternion)));
  h.fingers('L', GRIPS.hold);
  const handPos = h.group.localToWorld(V(...kf(u, [[0, [-0.12, 0.98, 0.33]], [0.55, [-0.16, 1.5, 0.12], E.io], [0.7, [-0.1, 0.98, 0.3], E.in], [1, [-0.12, 0.98, 0.33], E.out]])));
  const headTarget = kf(u, [[0, 0], [0.55, 1], [0.7, 0], [1, 0]]);
  const strikeDir = stakeTop.clone().sub(handPos).normalize();
  const upDir = V(0, 0.4, -1).applyQuaternion(h.group.quaternion).normalize();
  const md = strikeDir.clone().lerp(upDir, headTarget).normalize();
  mallet.position.copy(handPos).addScaledVector(md, -0.05); mallet.quaternion.setFromUnitVectors(V(0, 1, 0), md);
  h.armIK('R', handPos, h.group.localToWorld(V(-0.8, 0.5, -0.6)), Human.handQ('R', V(1, 0, 0).applyQuaternion(h.group.quaternion), md.clone().negate()));
  h.fingers('R', GRIPS.holdThin);
  return u;
}

function background(S, t) {
  stand(S.s2, -0.12, -2.6, Math.PI / 2, { lean: 10 }); wear(S.s2, S.helmets.s2); shovelWork(S.s2, S.workShovel, t);
  S.s2.look(S.s2.group.localToWorld(V(0, 0.4, 0.8)), 0.6);
  stand(S.s3, -0.05, -5.1, Math.PI / 2 - 0.15, { lean: 10 }); wear(S.s3, S.helmets.s3); malletWork(S.s3, S.mallet, S.stake, t);
  S.s3.look(S.s3.group.localToWorld(V(0, 0.8, 0.45)), 0.8);
}

export function buildShots(T, W) {
  const shots = [];
  const add = (s) => shots.push(s);
  const cues = (shots.cues = []);

  const tA2 = wt('soviets', 1.5) - 0.1;
  const tB1 = wt('cia', 4.8) - 0.1;
  const tB2 = wt('guards', 7.0) - 0.1;
  const tC1 = wt('targeted', 9.8) - 0.1;
  const tC2 = wt('truck', 11.2) - 0.1;
  const tD1 = wt('diverted', 14.0) - 0.1;
  const tD2 = wt('salvage', 16.5) - 0.1;
  const tE1 = wt('socks', 18.0) - 0.1;
  const tE2 = wt('pried', 19.8) - 0.1;
  const tF1 = wt('flashlights', 22.0) - 0.1;
  const tF2 = wt('hundred', 24.0) - 0.1;
  const tF3 = wt('engine', 26.0) - 0.1;
  const tG1 = wt('photographed', 27.0) - 0.1;
  const tG2 = wt('measuring', 28.8) - 0.1;
  const tG3 = wt('america', 31.0) - 0.1;
  const tH1 = wt('forged', 33.0) - 0.1;
  const tH2 = wt('seal', 34.5) - 0.1;
  const tI1 = wt('seven', 36.8) - 0.1;
  const tI2 = wt('noticed', 39.8) - 0.1;

  // ---------- S01: In 1959 ----------
  add({ id: 'A1', set: 'modern', start: 0, note: 'In 1959 — hands lift the rocket cradle cover',
    setup(W, lt, t) {
      const S = W.sets.modern; put(W.hats.hero.group, S.scene);
      const { p, q } = heroHatA(W, t, tA2, tB1); workerA(W, t, p, q, tA2);
      const u = seg(lt, 0, tA2, E.lin);
      const pos = [lerp(0.56, 0.4, u), lerp(1.31, 1.36, u), lerp(1.12, 0.92, u)];
      const look = [lerp(-0.02, 0.0, u), 1.27 + 0.12 * seg(t, 0.85, tA2 - 0.3), -0.05];
      return { cam: { pos, look, fov: 34, shake: 0.08 }, look: { focus: Math.hypot(pos[0] - p.x, pos[1] - p.y, pos[2] - p.z), aper: 0.034, warm: 0.6 }, shadowAt: [0, 1.2, -0.3], shadowSize: 1.6 };
    } });

  // ---------- S02: The Soviets toured a moon rocket ----------
  add({ id: 'A2', set: 'modern', start: tA2, note: 'Soviets toured a moon rocket — whip reveal across the exhibition cradle',
    setup(W, lt, t) {
      const S = W.sets.modern; put(W.hats.hero.group, S.scene);
      const { p, q } = heroHatA(W, t, tA2, tB1); workerA(W, t, p, q, tA2);
      const whip = seg(t, tB1 - 0.23, tB1, E.in);
      const pos = [kf(t, [[tA2, 0.62], [tA2 + 0.6, 0.75]]), kf(t, [[tA2, 1.25], [tA2 + 0.6, 1.55]]), kf(t, [[tA2, 1.35], [tA2 + 0.6, 1.05]])];
      const follow = p.clone().add(V(0, -0.05, 0));
      const look = [follow.x, follow.y - whip * 4.0, follow.z - whip * 1.0];
      return { cam: { pos, look, fov: kf(t, [[tA2, 36], [tA2 + 0.6, 30], [tB1, 34]]), shake: 0.1, roll: -4 * whip }, look: { focus: Math.hypot(pos[0] - p.x, pos[1] - p.y, pos[2] - p.z), aper: 0.02, warm: 0.6 },
        shadowAt: [p.x, Math.min(p.y, 1.6), p.z], shadowSize: 2, mb: t > tB1 - 0.25 ? 2 : 1, shutter: 0.6 };
    } });

  // ---------- S03: The CIA wanted to inspect it ----------
  add({ id: 'B1', set: 'trench', start: tB1, note: 'The CIA wanted to inspect it — military guards at perimeter',
    setup(W, lt, t) {
      const S = W.sets.trench, s1 = S.s1, hat = W.hats.hero;
      hat.setShape('hardhat', 'brodie', 1); const mat = hat.material(); mat.color.copy(OLIVE); mat.roughness = 0.78; mat.clearcoat = 0; mat.metalness = 0.15;
      stand(S.s1, 0.0, 0.0, 0.25, { lean: -4 });
      background(S, t);
      const catchT = tB1 + 0.26, onT = tB1 + 0.85;
      const C = s1.group.localToWorld(V(0.0, 1.95, 0.26));
      if (t < onT) {
        put(hat.group, S.scene);
        let p, q;
        if (t < catchT) { const u = (t - tB1) / (catchT - tB1); p = C.clone().add(V(0.05 * (1 - u), 1.4 * (1 - u) * (1 - u) + 0.0, 0.05 * (1 - u))); q = new THREE.Quaternion().setFromAxisAngle(V(0.35, 0.25, 1).normalize(), 3.2 * (1 - u) * (1 - u)); }
        else {
          const u = seg(t, catchT + 0.06, onT, E.io);
          const M0 = new THREE.Matrix4().compose(C, new THREE.Quaternion(), V(1, 1, 1)), M1 = onHeadMatrix(s1);
          const p0 = new THREE.Vector3(), q0 = new THREE.Quaternion(), p1 = new THREE.Vector3(), q1 = new THREE.Quaternion(), sc = new THREE.Vector3();
          M0.decompose(p0, q0, sc); M1.decompose(p1, q1, sc);
          p = p0.lerp(p1, u).add(V(0, 0.08 * Math.sin(u * Math.PI), 0)); q = q0.slerp(q1, u);
        }
        hat.group.position.copy(p); hat.group.quaternion.copy(q);
        const hq = hat.group.quaternion;
        const gL = V(0.104, -0.006, 0).applyQuaternion(hq).add(hat.group.position), gR = V(-0.104, -0.006, 0).applyQuaternion(hq).add(hat.group.position);
        const fL = V(-0.2, 0.75, 0.3).applyQuaternion(hq), fR = V(0.2, 0.75, 0.3).applyQuaternion(hq);
        const k = seg(t, tB1, catchT, E.out);
        const upL = s1.group.localToWorld(V(0.2, 1.9, 0.3)), upR = s1.group.localToWorld(V(-0.2, 1.9, 0.3));
        s1.armIK('L', upL.lerp(wristFor(gL, fL, V(-1, 0, 0).applyQuaternion(hq)), k), s1.group.localToWorld(V(0.8, 1.2, -0.4)), Human.handQ('L', fL, V(-1, 0, 0).applyQuaternion(hq)));
        s1.armIK('R', upR.lerp(wristFor(gR, fR, V(1, 0, 0).applyQuaternion(hq)), k), s1.group.localToWorld(V(-0.8, 1.2, -0.4)), Human.handQ('R', fR, V(1, 0, 0).applyQuaternion(hq)));
        const gp = blendGrip(GRIPS.open, GRIPS.rim, seg(t, catchT - 0.06, catchT + 0.05));
        s1.fingers('L', gp); s1.fingers('R', gp);
        s1.look(hat.group.position, 0.8);
      } else {
        wear(s1, hat);
        const u = seg(t, onT, onT + 0.7, E.io);
        const jawL = s1.at('head', [0.07, 0.03, 0.04]), jawR = s1.at('head', [-0.07, 0.03, 0.04]);
        const beltL = s1.group.localToWorld(V(0.17, 1.02, 0.17)), beltR = s1.group.localToWorld(V(-0.17, 1.02, 0.17));
        s1.armIK('L', jawL.clone().add(V(0.0, -0.09, 0.0)).lerp(beltL, u), s1.group.localToWorld(V(0.8, 0.9, -0.5)), Human.handQ('L', V(-0.3, 1 - 2 * u, 0.3).applyQuaternion(s1.group.quaternion), V(-1, 0, 0.3).applyQuaternion(s1.group.quaternion)));
        s1.armIK('R', jawR.clone().add(V(0.0, -0.09, 0.0)).lerp(beltR, u), s1.group.localToWorld(V(-0.8, 0.9, -0.5)), Human.handQ('R', V(0.3, 1 - 2 * u, 0.3).applyQuaternion(s1.group.quaternion), V(1, 0, 0.3).applyQuaternion(s1.group.quaternion)));
        s1.fingers('L', GRIPS.relax); s1.fingers('R', GRIPS.relax);
        s1.look(s1.group.localToWorld(V(0.6, 1.4, 2.0)), 0.6);
      }
      const land = seg(t, tB1, tB1 + 0.22, E.out);
      const crane = seg(t, tB1 + 0.55, tB2, E.io);
      const pos = [lerp(0.2, 0.0, crane), lerp(1.3, 2.95, crane), lerp(1.45, 3.6, crane)];
      const lookY = lerp(3.4, 1.85, land) - 0.25 * crane;
      const look = [lerp(0.0, -0.1, crane), lookY, lerp(0.2, -1.2, crane)];
      return { cam: { pos, look, fov: lerp(38, 42, crane), shake: 0.12 }, look: { focus: lerp(1.4, 3.6, crane), aper: lerp(0.026, 0.02, crane), warm: 0.7 },
        shadowAt: [0, 1.0, -1.0], shadowSize: lerp(1.8, 4.5, crane), mb: 1, shutter: 0.7 };
    } });

  // ---------- S04: But armed guards watched day and night ----------
  add({ id: 'B2', set: 'trench', start: tB2, note: 'armed guards watched night and day — sweep over barrier perimeter',
    setup(W, lt, t) {
      const S = W.sets.trench; put(W.hats.hero.group, S.scene);
      stand(S.s1, 0.0, 0.0, 0.25, { lean: 4 }); wear(S.s1, W.hats.hero);
      S.s1.armIK('L', S.s1.group.localToWorld(V(0.17, 1.02, 0.17)), S.s1.group.localToWorld(V(0.8, 0.9, -0.5)), null);
      S.s1.armIK('R', S.s1.group.localToWorld(V(-0.17, 1.02, 0.17)), S.s1.group.localToWorld(V(-0.8, 0.9, -0.5)), null);
      background(S, t);
      const u = seg(t, tB2, tC1, E.io2);
      const pos = [-1.15, lerp(3.75, 3.6, u), lerp(0.9, -3.9, u)];
      const look = [0.12, 1.0, lerp(-0.9, -5.7, u)];
      const fz = lerp(-0.3, -5.0, sstep(0.15, 0.9, u));
      return { cam: { pos, look, fov: 40, shake: 0.08, roll: -3 }, look: { focus: Math.hypot(1.2, 2.6, pos[2] - fz - 0.8), aper: 0.016, warm: 0.7 },
        shadowAt: [0, 1.0, pos[2] - 1.5], shadowSize: 3.5, mb: 1, shutter: 0.5 };
    } });

  // ---------- S05: So they targeted ----------
  add({ id: 'C1', set: 'trench', start: tC1, note: 'So they targeted — crate inspection and strategy',
    setup(W, lt, t) {
      const S = W.sets.trench, s2 = S.s2;
      put(W.hats.hero.group, S.scene); stand(S.s1, 0.0, 0.0, 0.25); wear(S.s1, W.hats.hero);
      const cr = S.crate.position;
      s2.group.position.set(cr.x + 0.02, 0.09, cr.z + 0.04); s2.group.rotation.set(0, 0.2 + Math.PI / 2 - 0.5, 0);
      s2.root.position.set(0, 0.6 - 0.09 + 0.02, -0.05);
      s2.rot('pelvis', -6, 0, 0); s2.rot('spine', 22, 0, 0); s2.rot('chest', 14, 0, 0);
      for (const sd of ['L', 'R']) { const g = sd === 'L' ? 1 : -1; s2.legIK(sd, s2.group.localToWorld(V(0.14 * g, 0.09, 0.42)), s2.group.localToWorld(V(0.14 * g, 0.6, 1.2))); }
      const hp = s2.group.localToWorld(V(0.02, 0.86, 0.36));
      s2.look(hp, 1, 0.5);
      const u = seg(t, tC1, tC2, E.lin);
      const pos = [lerp(0.85, 0.55, u), lerp(1.6, 1.5, u), lerp(1.2, 0.8, u)];
      return { cam: { pos, look: [hp.x, hp.y + 0.1, hp.z], fov: 36, shake: 0.08 }, look: { focus: 1.2, aper: 0.024, warm: 0.7 },
        shadowAt: [hp.x, hp.y - 0.2, hp.z], shadowSize: 1.4 };
    } });

  // ---------- S06: The transport truck heading to the rail yard ----------
  add({ id: 'C2', set: 'mine', start: tC2, note: 'transport truck heading to the rail yard — truck departs depot',
    setup(W, lt, t) {
      const S = W.sets.mine;
      const cz = lerp(-1.6, -0.3, seg(t, tC2, tD1, E.lin));
      const m = S.miner, cart = S.cart;
      cart.position.set(0, 0, cz);
      stand(m, 0.0, cz - 0.95, 0, { y: 0.09, lean: 26 });
      const stride = Math.sin(cz / 0.32 * Math.PI);
      m.root.position.y = 0.955 - 0.07 + 0.012 * Math.abs(stride);
      m.look(m.group.localToWorld(V(0, 0.9, 2.2)), 0.7);
      const u = seg(t, tC2, tD1, E.io);
      const pos = [lerp(1.2, 0.9, u), lerp(0.7, 0.85, u), lerp(2.6, 1.8, u)];
      return { cam: { pos, look: [lerp(0.1, 0.0, u), 1.25, -0.6], fov: 40, shake: 0.1 }, look: { focus: 2.2, aper: 0.016, warm: 0.7 }, shadowAt: [0, 1.0, -0.8], shadowSize: 3.0 };
    } });

  // ---------- S07: Agents secretly diverted the flatbed ----------
  const SH = () => W.sets.shop;
  const atBench = (b, z, { lean = 18, twist = 0, x = -1.47 } = {}) => { stand(b, x, z, -Math.PI / 2, { y: 0, lean, twist }); };
  const hand = (b, side, target, fingers, palm, pole) => b.armIK(side, target, pole || b.group.localToWorld(V(side === 'L' ? 0.8 : -0.8, 0.8, -0.6)), Human.handQ(side, fingers, palm));

  add({ id: 'D1', set: 'shop', start: tD1, note: 'Agents secretly diverted the flatbed — gate shuts behind truck',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      stand(b, -1.8, -2.4, Math.PI - 0.2, { y: 0, lean: 4 });
      b.look(V(-1.5, 1.2, -1.5), 0.9);
      const u = seg(t, tD1, tD2, E.io);
      const pos = [lerp(-2.6, -2.4, u), lerp(1.7, 1.6, u), lerp(-1.8, -1.2, u)];
      const look = [-1.5, 1.25, -1.5];
      return { cam: { pos, look, fov: 36, shake: 0.08 }, look: { focus: 1.6, aper: 0.024, warm: 0.75 }, shadowAt: [-1.8, 1.2, -1.8], shadowSize: 2.0 };
    } });

  // ---------- S08: Into a rented salvage yard ----------
  add({ id: 'D2', set: 'shop', start: tD2, note: 'Into a rented salvage yard — overhead crane across the quiet yard',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      atBench(b, -0.25, { lean: 22 });
      b.look(V(-2.1, 0.95, -0.3), 0.9);
      const u = seg(t, tD2, tE1, E.io);
      const pos = [lerp(2.1, 0.85, u), lerp(2.85, 1.95, u), lerp(2.55, 1.45, u)];
      const look = [lerp(-1.8, -2.0, u), lerp(1.2, 1.15, u), lerp(-0.9, -0.5, u)];
      return { cam: { pos, look, fov: 42, shake: 0.06 }, look: { focus: 2.4, aper: 0.014, warm: 0.75 }, shadowAt: [-1.6, 1.0, -0.6], shadowSize: 3.0 };
    } });

  // ---------- S09: In socks to leave no marks ----------
  add({ id: 'E1', set: 'shop', start: tE1, note: 'In socks to leave no marks — boots removed, stepping softly',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      stand(b, -1.5, -0.5, Math.PI * 0.8, { y: 0, lean: 14 });
      b.look(V(-1.5, 0.2, -0.5), 0.95);
      const u = seg(t, tE1, tE2, E.lin);
      const pos = [lerp(-1.1, -1.0, u), lerp(0.85, 0.75, u), lerp(0.3, 0.1, u)];
      const look = [-1.5, 0.2, -0.5];
      return { cam: { pos, look, fov: 32, shake: 0.06 }, look: { focus: 1.1, aper: 0.035, warm: 0.75 }, shadowAt: [-1.5, 0.3, -0.5], shadowSize: 1.2 };
    } });

  // ---------- S10: They pried open the twenty-foot crate ----------
  add({ id: 'E2', set: 'trench', start: tE2, note: 'They pried open the 20-foot crate — lifting tongue-and-groove planks',
    setup(W, lt, t) {
      const S = W.sets.trench, s1 = S.s1;
      stand(s1, -0.2, -0.4, 0.3, { lean: 20 });
      s1.look(V(0, 0.8, -0.4), 0.9);
      const u = seg(t, tE2, tF1, E.io);
      const pos = [lerp(0.6, 0.45, u), lerp(1.8, 1.7, u), lerp(0.8, 0.4, u)];
      const look = [0.0, 0.9, -0.3];
      return { cam: { pos, look, fov: 36, shake: 0.09 }, look: { focus: 1.3, aper: 0.026, warm: 0.7 }, shadowAt: [0, 0.9, -0.3], shadowSize: 1.8 };
    } });

  // ---------- S11: Under flashlights ----------
  add({ id: 'F1', set: 'shop', start: tF1, note: 'Under flashlights — flashlight beams sweep the rocket hull',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      atBench(b, 0.0, { lean: 24 });
      b.look(V(-2.1, 1.0, 0.0), 0.9);
      const u = seg(t, tF1, tF2, E.lin);
      const pos = [lerp(-1.2, -1.3, u), lerp(1.35, 1.3, u), lerp(1.3, 0.9, u)];
      const look = [-2.1, 1.0, 0.0];
      return { cam: { pos, look, fov: 34, shake: 0.08 }, look: { focus: 1.2, aper: 0.03, warm: 0.75 }, shadowAt: [-2.0, 1.0, 0.0], shadowSize: 1.5 };
    } });

  // ---------- S12: They unscrewed 130 bolts ----------
  add({ id: 'F2', set: 'shop', start: tF2, note: 'unscrewed 130 bolts — metric wrench spinning fast',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      atBench(b, -0.1, { lean: 20 });
      const k = Math.sin((t - tF2) * 14.0);
      hand(b, 'R', V(-2.0, 1.0, -0.1 + 0.04 * k), V(-1, 0, 0), V(0, -1, 0));
      b.fingers('R', GRIPS.hold);
      b.look(V(-2.0, 0.95, -0.1), 0.95);
      const u = seg(t, tF2, tF3, E.io);
      const pos = [lerp(-1.5, -1.45, u), lerp(1.25, 1.22, u), lerp(0.5, 0.25, u)];
      const look = [-2.0, 0.98, -0.1];
      return { cam: { pos, look, fov: 32, shake: 0.1 }, look: { focus: 0.9, aper: 0.032, warm: 0.75 }, shadowAt: [-2.0, 1.0, -0.1], shadowSize: 1.2 };
    } });

  // ---------- S13: To reach the engine ----------
  add({ id: 'F3', set: 'shop', start: tF3, note: 'To reach the engine — base cap lifted, engine chamber revealed',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      atBench(b, 0.0, { lean: 18 });
      b.look(V(-2.1, 1.1, 0.0), 0.9);
      const u = seg(t, tF3, tG1, E.inOut);
      const pos = [lerp(-1.3, -1.4, u), lerp(1.5, 1.45, u), lerp(0.8, 0.5, u)];
      const look = [-2.1, 1.05, 0.0];
      return { cam: { pos, look, fov: 38, shake: 0.08 }, look: { focus: 1.1, aper: 0.024, warm: 0.75 }, shadowAt: [-2.0, 1.0, 0.0], shadowSize: 1.8 };
    } });

  // ---------- S14: They photographed every stamp ----------
  add({ id: 'G1', set: 'shop', start: tG1, note: 'They photographed every stamp — camera flash pops, stamps documented',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      atBench(b, 0.1, { lean: 16 });
      hand(b, 'R', V(-1.9, 1.15, 0.1), V(-0.8, 0.5, 0), V(0, 0, -1));
      hand(b, 'L', V(-1.9, 1.15, -0.1), V(-0.8, 0.5, 0), V(0, 0, 1));
      b.fingers('R', GRIPS.pinch); b.fingers('L', GRIPS.pinch);
      b.look(V(-2.2, 1.0, 0.0), 0.95);
      const u = seg(t, tG1, tG2, E.lin);
      const pos = [lerp(-1.6, -1.5, u), lerp(1.3, 1.25, u), lerp(0.6, 0.3, u)];
      const look = [-2.2, 1.05, 0.0];
      return { cam: { pos, look, fov: 32, shake: 0.06 }, look: { focus: 0.95, aper: 0.034, warm: 0.8 }, shadowAt: [-2.1, 1.0, 0.0], shadowSize: 1.4 };
    } });

  // ---------- S15: Measuring rockets ----------
  add({ id: 'G2', set: 'shop', start: tG2, note: 'Measuring rockets — calipers measuring engine nozzle',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      atBench(b, 0.0, { lean: 22 });
      hand(b, 'R', V(-2.05, 0.98, 0.05), V(-1, 0, 0), V(0, -1, 0));
      b.fingers('R', GRIPS.holdThin);
      b.look(V(-2.1, 0.95, 0.0), 0.9);
      const u = seg(t, tG2, tG3, E.io);
      const pos = [lerp(-1.4, -1.35, u), lerp(1.2, 1.18, u), lerp(0.55, 0.35, u)];
      const look = [-2.1, 0.95, 0.0];
      return { cam: { pos, look, fov: 30, shake: 0.07 }, look: { focus: 0.85, aper: 0.03, warm: 0.78 }, shadowAt: [-2.0, 0.95, 0.0], shadowSize: 1.3 };
    } });

  // ---------- S16: Twice as powerful as America's (THE BEAT DROP) ----------
  const BRS = () => W.sets.bridge;
  const wearBoiled = (h, hat) => { const head = h.bone('head'); if (hat.group.parent !== head) head.add(hat.group); hat.group.position.set(0, 0.165, 0.005); hat.group.rotation.set(-0.06, 0, 0); };

  add({ id: 'G3', set: 'bridge', start: tG3, note: 'twice as powerful as Americas — massive scale revealed on the beat drop',
    setup(W, lt, t) {
      const S = BRS();
      const c1 = S.i1, c2 = S.i2;
      stand(c1, 0.92, -0.92, -1.57, { y: 0.05, lean: 10 }); wearBoiled(c1, S.hats.i1);
      stand(c2, 0.85, 0.42, 0.52, { y: 0.05, lean: 6 }); wearBoiled(c2, S.hats.i2);
      c1.look(V(0.85, 1.2, 0.42), 0.7); c2.look(V(0.92, 1.2, -0.92), 0.7);
      const u = seg(t, tG3, tH1, E.io);
      const pos = [lerp(-1.8, -1.5, u), lerp(2.2, 2.4, u), lerp(2.2, 1.6, u)];
      const look = [0.85, 1.6, -0.3];
      return { cam: { pos, look, fov: 44, shake: 0.1 }, look: { focus: 2.8, aper: 0.018, warm: 0.85 }, shadowAt: [0.8, 1.2, -0.3], shadowSize: 3.2 };
    } });

  // ---------- S17: Before dawn they forged the Soviet wire seal ----------
  add({ id: 'H1', set: 'shop', start: tH1, note: 'Before dawn they forged the Soviet wire seal — precision pliers crimping seal',
    setup(W, lt, t) {
      const S = SH(), b = S.bullard;
      atBench(b, -0.15, { lean: 20 });
      hand(b, 'R', V(-1.95, 1.05, -0.15), V(-1, 0, 0), V(0, -1, 0));
      b.fingers('R', GRIPS.pinch);
      b.look(V(-2.0, 1.0, -0.15), 0.95);
      const u = seg(t, tH1, tH2, E.lin);
      const pos = [lerp(-1.45, -1.4, u), lerp(1.25, 1.22, u), lerp(0.35, 0.2, u)];
      const look = [-2.0, 1.0, -0.15];
      return { cam: { pos, look, fov: 28, shake: 0.06 }, look: { focus: 0.8, aper: 0.038, warm: 0.75 }, shadowAt: [-1.95, 1.0, -0.15], shadowSize: 1.1 };
    } });

  // ---------- S18: And screwed the crate shut ----------
  add({ id: 'H2', set: 'trench', start: tH2, note: 'And screwed the crate shut — re-nailing roof planks, tarp secured',
    setup(W, lt, t) {
      const S = W.sets.trench, s1 = S.s1;
      stand(s1, -0.1, -0.3, 0.4, { lean: 18 });
      s1.look(V(0, 0.8, -0.3), 0.9);
      const u = seg(t, tH2, tI1, E.io);
      const pos = [lerp(0.55, 0.35, u), lerp(1.65, 1.55, u), lerp(0.7, 0.35, u)];
      const look = [0.0, 0.85, -0.2];
      return { cam: { pos, look, fov: 36, shake: 0.08 }, look: { focus: 1.2, aper: 0.024, warm: 0.7 }, shadowAt: [0, 0.85, -0.2], shadowSize: 1.7 };
    } });

  // ---------- S19: At seven a.m., the Soviet guard arrived ----------
  add({ id: 'I1', set: 'bridge', start: tI1, note: 'At 7 AM Soviet guard arrived — sunrise at rail station, inspector arrives',
    setup(W, lt, t) {
      const S = BRS();
      const c = S.i3; c.reset();
      stand(c, -0.98, 0.42, -2.09, { y: 0.05, lean: 8 }); wearBoiled(c, S.hats.i3);
      c.look(V(-1.55, 1.25, 0.03), 0.9);
      const u = seg(t, tI1, tI2, E.io);
      const pos = [lerp(-2.2, -1.9, u), lerp(1.6, 1.7, u), lerp(1.2, 0.8, u)];
      const look = [-1.3, 1.2, 0.1];
      return { cam: { pos, look, fov: 38, shake: 0.08 }, look: { focus: 1.8, aper: 0.022, warm: 0.82 }, shadowAt: [-1.2, 1.0, 0.0], shadowSize: 2.2 };
    } });

  // ---------- S20: And never noticed a thing (OUTRO PULL-BACK) ----------
  add({ id: 'I2', set: 'bridge', start: tI2, note: 'And never noticed a thing — guard nods, truck cleared, grand sunlit pull-back',
    setup(W, lt, t) {
      const S = BRS();
      const c = S.i3; c.reset();
      stand(c, -0.98, 0.42, -2.09, { y: 0.05, lean: 6 }); wearBoiled(c, S.hats.i3);
      c.look(V(0.0, 1.0, -2.0), 0.7);
      const u = seg(t, tI2, T.dur, E.io);
      const p0 = V(-2.0, 1.45, 1.1), p1 = V(-3.6, 3.8, 6.5);
      const pos = p0.clone().lerp(p1, u);
      const look = V(-1.3, 1.2, 0.1).lerp(V(1.5, 0.8, -5.0), u);
      const fade = seg(t, T.dur - 0.35, T.dur, E.in);
      return { cam: { pos: pos.toArray(), look: look.toArray(), fov: lerp(36, 46, u), shake: 0.08 },
        look: { focus: pos.distanceTo(look), aper: lerp(0.028, 0.01, u), warm: 0.85, fade: 1 - fade },
        shadowAt: [-0.6, 0.8, -0.8], shadowSize: lerp(1.5, 4.2, u) };
    } });

  // ---------- sound cues (read by tools/mix.py via capture.mjs cues) ----------
  const C = (t, type, o = {}) => cues.push({ t: +t.toFixed(3), type, ...o });

  // S01 & S02: Exhibition
  C(0, 'amb', { set: 'site', dur: tB1 + 0.1 });
  C(0.6, 'lift');
  C(tA2 - 0.25, 'whoosh', { dur: 0.5, f0: 350, f1: 1200, g: 0.6 });
  C(tA2 + 0.2, 'shimmer', { dur: 0.6 });

  // S03 & S04: The Guards
  C(tB1 - 0.2, 'whoosh', { dur: 0.4, f0: 1400, f1: 300, g: 0.8 });
  C(tB1, 'amb', { set: 'wind', dur: tC1 - tB1 + 0.2 });
  C(tB1 + 0.26, 'catch');
  C(tB1 + 0.85, 'clunk');
  for (let k = 0; k < 4; k++) C(tB1 + 0.5 + k * 0.45, 'knock', { g: 0.35, pan: -0.3 });

  // S05 & S06: The Truck
  C(tC1, 'amb', { set: 'room', dur: tC2 - tC1 });
  C(tC1 + 0.3, 'tink');
  C(tC2, 'amb', { set: 'wind', dur: tD1 - tC2, g: 0.7 });
  C(tC2, 'cart', { dur: tD1 - tC2 });

  // S07 & S08: The Yard
  C(tD1, 'amb', { set: 'room', dur: tE1 - tD1 });
  C(tD1 + 0.3, 'clunk');
  C(tD2 - 0.1, 'whoosh', { dur: 0.8, f0: 400, f1: 800, g: 0.4 });

  // S09 & S10: Socks & Prying
  C(tE1 + 0.2, 'cloth', { g: 0.8 });
  C(tE2 - 0.1, 'whoosh', { dur: 0.4, f0: 700, f1: 350, g: 0.5 });
  C(tE2 + 0.3, 'scrape', { dur: 0.6 });
  C(tE2 + 0.9, 'thunk', { f: 120, decay: 15, click: 0.4 });

  // S11, S12, S13: Flashlights, Bolts, Engine
  C(tF1, 'amb', { set: 'room', dur: tG1 - tF1 });
  C(tF1 + 0.2, 'tok');
  for (let k = 0; k < 6; k++) C(tF2 + k * 0.28, 'tink', { g: 0.4, pan: (k % 2 === 0 ? -0.2 : 0.2) });
  C(tF3 + 0.1, 'clunk', { g: 0.8 });

  // S14, S15, S16: Photos, Calipers, The Power (BEAT DROP)
  C(tG1 + 0.15, 'snap', { g: 0.9 });
  C(tG1 + 0.85, 'snap', { g: 0.8 });
  C(tG2 + 0.2, 'scrape', { dur: 0.4 });
  C(tG2 + 0.7, 'tink', { g: 0.5 });
  C(tG3 - 0.15, 'whoosh', { dur: 0.6, f0: 300, f1: 1600, g: 1.0 });
  C(tG3, 'amb', { set: 'high', dur: T.dur - tG3 });
  C(tG3 + 0.1, 'thunk', { f: 80, decay: 8, click: 0.6 });

  // S17 & S18: Counterfeit Seal & Screwing Shut
  C(tH1 + 0.25, 'stamp', { g: 0.9 });
  C(tH2 + 0.2, 'scrape', { dur: 0.5 });
  C(tH2 + 0.7, 'clunk', { g: 0.7 });

  // S19 & S20: 7 AM Dawn & Clear Out
  C(tI1, 'amb', { set: 'high', dur: T.dur - tI1 });
  C(tI1 + 0.4, 'cloth', { g: 0.6 });
  C(tI2 - 0.1, 'whoosh', { dur: 0.5, f0: 800, f1: 300, g: 0.5 });
  C(tI2 + 0.4, 'clunk', { g: 0.5 });

  return shots;
}
export { wt, clamp, sstep, D };
