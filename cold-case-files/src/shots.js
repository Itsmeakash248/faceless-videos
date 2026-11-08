// ROOM 1046: The Man Who Vanished in Plain Sight
// 1935 Kansas City cold case reconstruction.
// All shots & cameras strictly keyed to narration sentence & word timings.
import * as THREE from 'three';
import { stand, local, ldir, V } from './core/figure.js';
import { caption, hook, stamp, sfxWord, toScreen, CAP_Y, CREAM, YEL } from './core/text.js';
import { T, s as S0, e as E0, w as W0 } from './core/timing.js';
import { W, H, LAND, UI } from './core/engine.js';
import { HALL } from './sets/hall.js';
import { sit, handsHidden } from './poses.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const span = (t, a, b) => sm((t - a) / (b - a));
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const lerpV = (a, b, k) => a.clone().lerp(b, k);
const dolly = (a, b, k, fov = [50, 50], o = {}) => ({
  pos: lerp(a[0], b[0], k),
  look: lerp(a[1], b[1], k),
  fov: fov[0] + (fov[1] - fov[0]) * k,
  ...o,
});

// Scene actor coordinates inside the hotel room / hall set
const OWEN_DOOR = [0.35, -2.5];        // near the hotel room entrance
const OWEN_MID = [0.15, -0.6];         // center of the dim room
const OWEN_CHAIR = [0.1, 0.6];         // sitting in the gloomy corner

// Bound victim pose on the floor in the dark
function boundPose(pos, yaw, t) {
  const P = stand(pos, yaw, t * 1.2, { hunch: 8, nod: 12 });
  P.root.pos = [0, -0.55, 0];
  P.root.rot = [12, 8, -15];
  // arms pulled tightly behind back
  P.ik.handL = { target: local(pos, yaw, -0.1, 0.45, -0.2), pole: ldir(yaw, -1, -0.4, -1), rot: [30, 20, 0] };
  P.ik.handR = { target: local(pos, yaw, 0.1, 0.46, -0.22), pole: ldir(yaw, 1, -0.4, -1), rot: [30, -20, 0] };
  P.ik.footL = { target: local(pos, yaw, 0.14, 0.1, 0.2), rot: [10, 0, 15] };
  P.ik.footR = { target: local(pos, yaw, -0.12, 0.08, 0.28), rot: [12, 0, -20] };
  return P;
}

export function buildShots() {
  const s = (i) => S0(i), e = (i) => E0(i), wd = (i, x) => W0(i, x);
  const SH = [], cues = [];
  const add = (id, start, note, setup, over) => SH.push({ id, start, note, setup, over });
  const cue = (t, type, o = {}) => cues.push({ t: +t.toFixed(3), type, ...o });

  const tEnd = T.dur + 0.9;

  // Key timeline sync points
  const tStrang = wd(0, 'stranger') - 0.06;
  const tRoom1046 = wd(0, 'room') - 0.08;
  const tNobody = wd(9, 'nobody');

  // ==================== SHOTS ====================

  // S01: (0 -> s(1)) Establishing wide shot: Kansas City Hotel President, Room 1046
  add('S01', 0, 'establishing · room 1046', (w, lt, t) => {
    w.man.visible = true;
    w.man.pose(handsHidden(stand(OWEN_DOOR, 180, t, { hunch: 3, nod: 4 })));
    w.hall.frontDoor.position.x = HALL.door.x;
    w.hall.lamp.intensity = 1.1;
    w.hall.lampShade.emissiveIntensity = 0.28;
    const dur = s(1);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.35, 1.45, 1.8], [0.35, 1.25, -2.5]],
        [[0.35, 1.38, 0.9], [0.35, 1.22, -2.5]],
        k,
        [56, 52],
        { shake: 0.08 }
      ),
      exposure: 0.95,
      bloom: 0.52,
      black: 1 - sm(lt / 0.5),
    };
  }, (ctx, w, lt, t) => {
    hook(ctx, ['JANUARY 1935', 'HOTEL PRESIDENT', 'ROOM 1046'], 2, {
      alpha: clamp(t / 0.45) * clamp((tRoom1046 - t) / 0.4),
      size: LAND ? 54 : 74,
    });
    stamp(ctx, '1935', {
      x: W / 2,
      y: LAND ? 260 : 420,
      size: LAND ? 150 : 210,
      alpha: span(t, s(0) + 0.05, s(0) + 0.5) * (1 - span(t, tStrang - 0.2, tStrang + 0.2)),
    });
    if (t >= tRoom1046) {
      stamp(ctx, 'ROOM 1046', {
        x: W / 2,
        y: LAND ? 280 : 450,
        size: LAND ? 100 : 140,
        alpha: span(t, tRoom1046, tRoom1046 + 0.4) * (1 - span(t, s(1) - 0.4, s(1))),
      });
    }
  });

  // S02: (s(1) -> s(2)) Low angle tracking: No bags, demanded interior room with no windows
  add('S02', s(1), 'no luggage · interior room', (w, lt, t) => {
    w.man.visible = true;
    w.man.pose(handsHidden(stand(OWEN_MID, 195, t, { hunch: 5, lean: 4 })));
    const dur = s(2) - s(1);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.0, 0.55, -2.6], [0.15, 1.15, -0.6]],
        [[0.1, 0.62, -2.1], [0.15, 1.18, -0.6]],
        k,
        [54, 50],
        { shake: 0.09 }
      ),
      exposure: 1.05,
      bloom: 0.5,
    };
  });

  // S03: (s(2) -> s(3)) Shades drawn shut, room pitch black
  add('S03', s(2), 'shades drawn · pitch black', (w, lt, t) => {
    w.man.visible = true;
    w.man.gain = 0.85;
    w.man.pose(stand(OWEN_MID, 170, t, { hunch: 6, nod: 8 }));
    w.hall.lamp.intensity = 0.7;
    w.hall.lampShade.emissiveIntensity = 0.18;
    const dur = s(3) - s(2);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.6, 1.35, -2.5], [0.15, 1.1, -0.6]],
        [[0.45, 1.28, -2.0], [0.15, 1.12, -0.6]],
        k,
        [50, 46],
        { shake: 0.08 }
      ),
      exposure: 0.88,
      bloom: 0.65,
    };
  });

  // S04: (s(3) -> s(4)) Whenever the maid arrived, he sat motionless in the dark (Maid POV)
  add('S04', s(3), 'motionless in dark · maid POV', (w, lt, t) => {
    w.man.visible = true; // Owen sitting completely motionless
    w.man.pose(sit(OWEN_CHAIR, 180, t * 0.15, { hunch: 7, nod: 10, lean: 5 }));
    const dur = s(4) - s(3);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.35, 1.5, -3.2], [0.1, 0.85, 0.6]],
        [[0.35, 1.45, -2.6], [0.1, 0.85, 0.6]],
        k,
        [48, 44],
        { shake: 0.07 }
      ),
      exposure: 0.95,
      bloom: 0.55,
    };
  });

  // S05: (s(4) -> s(5)) He whispered to leave the door unlocked
  add('S05', s(4), 'whisper · leave door unlocked', (w, lt, t) => {
    w.man.visible = true;
    const P = sit(OWEN_CHAIR, 165, t * 0.2, { hunch: 6, nod: 4 });
    P.b.head = [12, -18, 0];
    w.man.pose(P);
    const dur = s(5) - s(4);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[-0.3, 1.15, -0.4], [0.1, 0.9, 0.6]],
        [[-0.2, 1.16, -0.1], [0.1, 0.9, 0.6]],
        k,
        [44, 40],
        { shake: 0.09 }
      ),
      exposure: 1.1,
      bloom: 0.58,
    };
  });

  // S06: (s(5) -> s(6)) Next morning: the telephone was left off the hook
  add('S06', s(5), 'telephone off hook', (w, lt, t) => {
    w.handset = { mode: 'offhook' };
    const dur = s(6) - s(5);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[1.1, 1.32, -0.1], [HALL.phone.x, 1.15, HALL.phone.z]],
        [[1.35, 1.34, -0.3], [HALL.phone.x, 1.15, HALL.phone.z]],
        k,
        [40, 36],
        { shake: 0.08 }
      ),
      exposure: 1.05,
      bloom: 0.55,
    };
  }, (ctx, w, lt, t) => {
    const p = toScreen(w.camera, V(HALL.phone.x - 0.08, HALL.phone.y - 0.15, HALL.phone.z));
    sfxWord(ctx, 'Hiss...', p.x + 80 * UI, p.y - 120 * UI, t - s(5), { size: 68, rot: -0.05, alpha: 0.85 });
  });

  // S07: (s(6) -> s(7)) Hotel staff unlocked the room to complete silence
  add('S07', s(6), 'unlocked door · silence', (w, lt, t) => {
    w.hall.frontDoor.rotation.y = 0.55 * ease(lt / (s(7) - s(6)));
    w.hall.lamp.intensity = 1.3;
    const dur = s(7) - s(6);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.35, 1.32, -4.8], [0.35, 1.25, -1.0]],
        [[0.35, 1.34, -4.0], [0.35, 1.25, -1.0]],
        k,
        [48, 44],
        { shake: 0.08 }
      ),
      exposure: 1.0,
      bloom: 0.52,
    };
  });

  // S08: (s(7) -> s(8)) Inside, he had been tied up and brutally attacked
  add('S08', s(7), 'tied up · brutally attacked', (w, lt, t) => {
    w.man.visible = true;
    w.man.pose(boundPose(OWEN_MID, 140, t));
    const dur = s(8) - s(7);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.8, 0.85, -2.1], [0.15, 0.35, -0.6]],
        [[0.65, 0.78, -1.7], [0.15, 0.35, -0.6]],
        k,
        [50, 46],
        { shake: 0.11 }
      ),
      exposure: 1.2,
      bloom: 0.65,
    };
  });

  // S09: (s(8) -> s(9)) Detectives begged him to name his attacker
  add('S09', s(8), 'detectives questioning', (w, lt, t) => {
    w.man.visible = true;
    w.man.pose(boundPose(OWEN_MID, 140, t));
    const dur = s(9) - s(8);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.75, 1.15, -0.3], [0.15, 0.38, -0.6]],
        [[0.62, 1.05, -0.45], [0.15, 0.38, -0.6]],
        k,
        [46, 42],
        { shake: 0.09 }
      ),
      exposure: 1.15,
      bloom: 0.55,
    };
  });

  // S10: (s(9) -> s(10)) He only whispered, nobody. Sting hits!
  add('S10', s(9), 'he whispered nobody · sting', (w, lt, t) => {
    w.man.visible = true;
    const P = boundPose(OWEN_MID, 140, t);
    P.b.head = [-4, 18, 6];
    w.man.pose(P);
    w.man.gain = 1.0 + 0.3 * span(t, tNobody - 0.2, tNobody + 0.4);
    const dur = s(10) - s(9);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.48, 0.72, -1.4], [0.15, 0.42, -0.6]],
        [[0.40, 0.68, -1.2], [0.15, 0.42, -0.6]],
        k,
        [42, 38],
        { shake: 0.08 + (t > tNobody ? 0.15 * Math.exp(-(t - tNobody) * 8) : 0) }
      ),
      exposure: 1.25,
      bloom: 0.7,
    };
  }, (ctx, w, lt, t) => {
    if (t >= tNobody) {
      stamp(ctx, '“NOBODY”', {
        x: W / 2,
        y: LAND ? 260 : 420,
        size: LAND ? 110 : 160,
        alpha: span(t, tNobody, tNobody + 0.2) * (1 - span(t, s(10) - 0.25, s(10))),
      });
    }
  });

  // S11: (s(10) -> tEnd) Ninety years later, mystery of Room 1046 remains unsolved
  add('S11', s(10), 'ninety years · unsolved mystery', (w, lt, t) => {
    w.hall.frontDoor.rotation.y = Math.max(0, 0.55 * (1 - sm(lt / 2.5)));
    w.hall.lamp.intensity = 1.1 * (1 - sm(lt / 4.0));
    w.hall.lampShade.emissiveIntensity = 0.25 * (1 - sm(lt / 4.0));
    const dur = tEnd - s(10);
    const k = ease(lt / dur);
    return {
      cam: dolly(
        [[0.35, 1.35, -2.5], [0.35, 1.15, 1.5]],
        [[0.35, 1.38, -5.2], [0.35, 1.15, 1.5]],
        k,
        [46, 52],
        { shake: 0.07 }
      ),
      exposure: 1.0 * (1 - 0.4 * sm(lt / dur)),
      bloom: 0.5,
      black: span(t, tEnd - 0.55, tEnd - 0.05),
    };
  }, (ctx, w, lt, t) => {
    stamp(ctx, 'UNSOLVED', {
      x: W / 2,
      y: LAND ? 280 : 460,
      size: LAND ? 130 : 180,
      alpha: span(t, s(10) + 0.8, s(10) + 1.4) * (1 - span(t, tEnd - 0.8, tEnd - 0.2)),
    });
  });

  SH[SH.length - 1].end = tEnd;
  SH.cues = cues;

  // ==================== PROCEDURAL SOUND CUES ====================
  cue(s(2) + 0.2, 'swell', { dur: 2.8 });
  cue(s(4) + 0.3, 'creak', { dur: 1.5 });
  cue(s(5), 'pickup');
  cue(s(5) + 0.1, 'line', { dur: s(6) - s(5) - 0.2 });
  cue(s(6), 'knock', { gain: 1.0 });
  cue(s(6) + 0.4, 'creak', { dur: 2.0 });
  cue(s(7) + 0.2, 'knock', { gain: 0.9 });
  cue(s(7) + 0.6, 'swell', { dur: 3.2 });
  cue(s(8) + 0.3, 'swell', { dur: 2.4 });
  cue(tNobody, 'sting', { gain: 1.25 });
  cue(tEnd - 0.7, 'lastknock', { gain: 0.8 });

  SH.anchors = { s0: s(0), s1: s(1), s2: s(2), s3: s(3), s4: s(4), s5: s(5), s6: s(6), s7: s(7), s8: s(8), s9: s(9), s10: s(10), tNobody, tEnd };
  CAPS = buildCaptions();
  return SH;
}

// ==================== SUBTITLES / CAPTIONS ====================
let CAPS = [];
function buildCaptions() {
  const s = (i) => S0(i), e = (i) => E0(i), wd = (i, x) => W0(i, x);
  const C = [];
  const yel = (text, a, b, o = {}) => C.push({ text, a, b, ...o });

  // Sentence 0: In nineteen thirty-five, a stranger checked into Room ten forty-six.
  yel('In nineteen thirty-five,', s(0), wd(0, 'stranger') - 0.02);
  yel('a stranger checked into Room ten forty-six.', wd(0, 'stranger') - 0.02, e(0) + 0.3);

  // Sentence 1: He carried no bags and demanded an interior room with no windows.
  yel('He carried no bags', s(1), wd(1, 'and') - 0.02);
  yel('and demanded an interior room with no windows.', wd(1, 'and') - 0.02, e(1) + 0.35);

  // Sentence 2: The shades were drawn shut, leaving the room pitch black.
  yel('The shades were drawn shut,', s(2), wd(2, 'leaving') - 0.02);
  yel('leaving the room pitch black.', wd(2, 'leaving') - 0.02, e(2) + 0.35);

  // Sentence 3: Whenever the maid arrived, he sat motionless in the dark.
  yel('Whenever the maid arrived,', s(3), wd(3, 'he') - 0.02);
  yel('he sat motionless in the dark.', wd(3, 'he') - 0.02, e(3) + 0.35);

  // Sentence 4: He whispered for her to leave the door unlocked.
  yel('He whispered for her', s(4), wd(4, 'to') - 0.02);
  yel('to leave the door unlocked.', wd(4, 'to') - 0.02, e(4) + 0.35, { italic: true });

  // Sentence 5: The next morning, the telephone was left off the hook.
  yel('The next morning,', s(5), wd(5, 'the') - 0.02);
  yel('the telephone was left off the hook.', wd(5, 'the') - 0.02, e(5) + 0.35);

  // Sentence 6: Hotel staff unlocked the room to complete silence.
  yel('Hotel staff unlocked the room', s(6), wd(6, 'to') - 0.02);
  yel('to complete silence.', wd(6, 'to') - 0.02, e(6) + 0.35);

  // Sentence 7: Inside, he had been tied up and brutally attacked.
  yel('Inside, he had been tied up', s(7), wd(7, 'and') - 0.02);
  yel('and brutally attacked.', wd(7, 'and') - 0.02, e(7) + 0.4);

  // Sentence 8: Detectives begged him to name his attacker.
  yel('Detectives begged him', s(8), wd(8, 'to') - 0.02);
  yel('to name his attacker.', wd(8, 'to') - 0.02, e(8) + 0.35);

  // Sentence 9: He only whispered, nobody.
  yel('He only whispered,', s(9), wd(9, 'nobody') - 0.02);
  yel('“Nobody.”', wd(9, 'nobody') - 0.02, e(9) + 0.45, { italic: true });

  // Sentence 10: Ninety years later, the mystery of Room ten forty-six remains unsolved.
  yel('Ninety years later,', s(10), wd(10, 'the') - 0.02);
  yel('the mystery of Room ten forty-six remains unsolved.', wd(10, 'the') - 0.02, e(10) + 0.7);

  return C;
}

export function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t >= c.b) continue;
    const a = Math.min(1, (t - c.a) / 0.08) * Math.min(1, (c.b - t) / 0.08);
    if (c.hook) hook(ctx, c.hook, c.boxed, { alpha: a });
    else caption(ctx, c.text, { alpha: a, italic: c.italic });
  }
}
