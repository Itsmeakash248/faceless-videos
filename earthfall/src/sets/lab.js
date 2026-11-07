// The geophysics lab: low sun through a tall window, a long bench, a brass cutaway Earth, a vacuum pump,
// the capsule cradle, two clocks and a speedometer. The engineer in shirtsleeves.
import * as THREE from 'three';
import { makeSky } from '../core/sky.js';
import { timber, paper, canvasCloth, noise2, rng, canvas, printText } from '../core/tex.js';
import { pbr, mesh, boxM, decal } from '../props/kit.js';
import { makeGlobe } from '../props/globe.js';
import { makeMotes } from './trench.js';

export const LAB = { win: -3.0, bench: { x: 0, z: -1.9, top: 0.95, len: 4.8, depth: 0.86 }, back: -2.45 };

function plaster(seed = 61) {
  const n = noise2(seed);
  const c = canvas(512, 512), x = c.getContext('2d'), img = x.createImageData(512, 512);
  for (let j = 0; j < 512; j++) for (let i = 0; i < 512; i++) {
    const f = n.tfbm(i / 64, j / 64, 8, 8, 5), o = (j * 512 + i) * 4, t = 0.9 + 0.12 * f - 0.05 * n(i * 0.3, j * 0.3);
    img.data[o] = 214 * t; img.data[o + 1] = 202 * t; img.data[o + 2] = 182 * t; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; return tex;
}

function makeGauge(r, title, sub, opts = {}) {
  const g = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.32 });
  const caseM = new THREE.MeshStandardMaterial({ color: 0x7a6a58, metalness: 0.6, roughness: 0.45 });
  mesh(new THREE.CylinderGeometry(r * 1.08, r * 1.08, r * 0.28, 48), caseM, { pos: [0, 0, -r * 0.12], rot: [Math.PI / 2, 0, 0], parent: g });
  mesh(new THREE.TorusGeometry(r * 1.02, r * 0.05, 12, 48), brass, { pos: [0, 0, r * 0.02], parent: g });
  const face = decal(r * 2, r * 2, (c) => {
    const x = c.getContext('2d'), W = c.width;
    x.fillStyle = '#e8e2d3'; x.beginPath(); x.arc(W / 2, W / 2, W * 0.49, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(75,72,69,0.8)'; x.lineWidth = 4;
    for (let i = 0; i <= (opts.ticks ?? 10); i++) {
      const a = Math.PI * 0.75 + i / (opts.ticks ?? 10) * Math.PI * 1.5;
      const r0 = W * 0.38, r1 = W * 0.45;
      x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * r0, W / 2 + Math.sin(a) * r0); x.lineTo(W / 2 + Math.cos(a) * r1, W / 2 + Math.sin(a) * r1); x.stroke();
    }
    printText(c, [title], { size: W * 0.1, y: 0.32, style: 'slab', color: '#4b4845', seed: 501 });
    if (sub) printText(c, [sub], { size: W * 0.055, y: 0.68, style: 'slab', color: '#4b4845', seed: 502, font: 'Rockwell', weight: 'normal' });
  }, { res: 512, rough: 0.7 });
  face.position.z = r * 0.045; g.add(face);
  // needle
  const needle = new THREE.Group();
  const nm = new THREE.MeshStandardMaterial({ color: 0x4b4845, metalness: 0.4, roughness: 0.5 });
  mesh(new THREE.BoxGeometry(r * 0.035, r * 0.8, r * 0.02).translate(0, r * 0.3, 0), nm, { pos: [0, 0, r * 0.06], parent: needle });
  mesh(new THREE.CylinderGeometry(r * 0.06, r * 0.06, r * 0.03, 16), nm, { pos: [0, 0, r * 0.065], rot: [Math.PI / 2, 0, 0], parent: needle });
  needle.position.z = r * 0.02; g.add(needle);
  g.userData.needle = needle;
  return g;
}

function makeClock(r, time, sub, opts = {}) {
  const g = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.8, roughness: 0.35 });
  mesh(new THREE.CylinderGeometry(r, r, r * 0.16, 48), new THREE.MeshStandardMaterial({ color: 0x7a6a58, metalness: 0.5, roughness: 0.5 }), { pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], parent: g });
  mesh(new THREE.TorusGeometry(r * 0.98, r * 0.04, 10, 48), brass, { pos: [0, 0, r * 0.09], parent: g });
  const face = decal(r * 2, r * 2, (c) => {
    const x = c.getContext('2d'), W = c.width;
    x.fillStyle = '#e8e2d3'; x.beginPath(); x.arc(W / 2, W / 2, W * 0.49, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(75,72,69,0.85)'; x.lineWidth = 5;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 - Math.PI / 2, r0 = W * (i % 3 === 0 ? 0.37 : 0.41), r1 = W * 0.45;
      x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * r0, W / 2 + Math.sin(a) * r0); x.lineTo(W / 2 + Math.cos(a) * r1, W / 2 + Math.sin(a) * r1); x.stroke();
    }
    printText(c, [time], { size: W * 0.25, y: 0.48, style: 'slab', color: '#4b4845', seed: 511 });
    if (sub) printText(c, [sub], { size: W * 0.072, y: 0.71, style: 'slab', color: '#4b4845', seed: 512, font: 'Rockwell', weight: 'normal' });
    if (opts.top) printText(c, [opts.top], { size: W * 0.065, y: 0.25, style: 'slab', color: '#4b4845', seed: 513, font: 'Rockwell', weight: 'normal' });
  }, { res: 640, rough: 0.75 });
  face.position.z = r * 0.095; g.add(face);
  return g;
}

export function buildLab(renderer, cast) {
  const scene = new THREE.Scene();
  const sky = makeSky(renderer, { az: -90, el: 15, top: 0x4b8fd0, mid: 0x9ac6ea, haze: 0xf6e0c0, ground: 0xa08060, sunI: 6.0, cloud: 0.3 });
  scene.add(sky.dome, sky.sun, sky.sun.target); scene.environment = sky.env; scene.environmentIntensity = 0.3;
  const R = rng(512), B = LAB.bench;
  const brassM = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.32 });
  const floorT = timber(62, { boards: 8, base: 0x7a5236, grey: 0.1 });
  const woodM = pbr(timber(63, { boards: 4, base: 0x8b5b3b, grey: 0.12 }), { repeat: [0.5, 0.5], ns: 0.8 });
  const darkWoodM = pbr(timber(64, { boards: 2, base: 0x7a5034, grey: 0.05 }), { repeat: [0.4, 0.4], ns: 0.6, rough: 0.7 });
  const wallM = new THREE.MeshStandardMaterial({ map: plaster(), roughness: 0.95 }); wallM.map.repeat.set(3, 2);
  const W = 6.2, Dp = 5.4, Hh = 3.25;
  // floor, ceiling, walls
  mesh(boxM(W, 0.1, Dp, 1), pbr(floorT, { repeat: [3, 1.5], ns: 1.5, rough: 0.8 }), { pos: [0, -0.05, 0], parent: scene });
  mesh(boxM(W, 0.1, Dp, 1), wallM, { pos: [0, Hh + 0.05, 0], parent: scene });
  for (let x = -2.6; x <= 2.6; x += 1.3) mesh(boxM(0.16, 0.22, Dp, 0.5), darkWoodM, { pos: [x, Hh - 0.11, 0], parent: scene });
  mesh(boxM(W, Hh, 0.12, 1), wallM, { pos: [0, Hh / 2, LAB.back - 0.06], parent: scene });
  mesh(boxM(W, Hh, 0.12, 1), wallM, { pos: [0, Hh / 2, 2.76], parent: scene });
  mesh(boxM(0.12, Hh, Dp, 1), wallM, { pos: [3.16, Hh / 2, 0], parent: scene });
  // window wall at x = -3.1, opening 2.2 wide × 1.8 high
  const wx = LAB.win - 0.06, o = { z0: -1.9, z1: 0.4, y0: 1.0, y1: 2.85 };
  mesh(boxM(0.12, Hh, o.z0 + 2.7), wallM, { pos: [wx, Hh / 2, (-2.7 + o.z0) / 2], parent: scene });
  mesh(boxM(0.12, Hh, 2.7 - o.z1), wallM, { pos: [wx, Hh / 2, (o.z1 + 2.7) / 2], parent: scene });
  mesh(boxM(0.12, o.y0, o.z1 - o.z0), wallM, { pos: [wx, o.y0 / 2, (o.z0 + o.z1) / 2], parent: scene });
  mesh(boxM(0.12, Hh - o.y1, o.z1 - o.z0), wallM, { pos: [wx, (Hh + o.y1) / 2, (o.z0 + o.z1) / 2], parent: scene });
  // wainscot
  for (const [p, s] of [[[0, 0.5, LAB.back + 0.01], [W, 1.0, 0.03]], [[3.08, 0.5, 0], [0.03, 1.0, Dp]]]) mesh(boxM(...s, 0.6), woodM, { pos: p, parent: scene });
  // window frame + muntins + glass
  const frameM = new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 0.6 });
  const win = new THREE.Group();
  const zs = [o.z0, (o.z0 * 2 + o.z1) / 3, (o.z0 + o.z1 * 2) / 3, o.z1], ys = [o.y0, (o.y0 + o.y1) / 2, o.y1];
  for (const z of zs) mesh(boxM(0.08, o.y1 - o.y0, 0.05), frameM, { pos: [wx, (o.y0 + o.y1) / 2, z], parent: win });
  for (const y of ys) mesh(boxM(0.08, 0.05, o.z1 - o.z0), frameM, { pos: [wx, y, (o.z0 + o.z1) / 2], parent: win });
  mesh(boxM(0.22, 0.05, o.z1 - o.z0 + 0.2), darkWoodM, { pos: [wx + 0.06, o.y0 - 0.02, (o.z0 + o.z1) / 2], parent: win });
  scene.add(win);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(o.z1 - o.z0, o.y1 - o.y0), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.06, envMapIntensity: 2 }));
  glass.rotation.y = Math.PI / 2; glass.position.set(wx, (o.y0 + o.y1) / 2, (o.z0 + o.z1) / 2); glass.castShadow = false; scene.add(glass);
  const lett = decal(1.9, 0.62, (c) => {
    const x = c.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1);
    printText(c, ['GEOPHYSICS LABORATORY'], { size: 118, y: 0.34, color: '#4b4845', seed: 521, wear: 0.12, track: 2 });
    printText(c, ['SECTION THROUGH THE EARTH · 1992'], { size: 58, y: 0.67, color: '#4b4845', seed: 522, wear: 0.12, font: 'Rockwell', weight: 'normal' });
  }, { res: 1400, rough: 0.4 });
  lett.material.side = THREE.DoubleSide; lett.castShadow = true;
  lett.rotation.y = Math.PI / 2; lett.position.set(wx + 0.005, 2.2, (o.z0 + o.z1) / 2); scene.add(lett);
  // outside: a warm wall across the street
  mesh(boxM(0.3, 3.4, 40, 1), new THREE.MeshStandardMaterial({ color: 0xb48e6c, roughness: 0.9 }), { pos: [-22, 1.7, 0], parent: scene, cast: false });

  // bench
  const bench = new THREE.Group();
  mesh(boxM(B.len, 0.08, B.depth, 0.8), pbr(timber(65, { boards: 3, base: 0xa07050, grey: 0.08 }), { repeat: [1, 0.5], rough: 0.7, ns: 0.6 }), { pos: [0, B.top - 0.04, 0], parent: bench });
  for (const dx of [-2.1, -0.7, 0.7, 2.1]) for (const dz of [-0.3, 0.3]) mesh(boxM(0.09, B.top - 0.08, 0.09), darkWoodM, { pos: [dx, (B.top - 0.08) / 2, dz], parent: bench });
  mesh(boxM(B.len - 0.2, 0.04, B.depth - 0.12), darkWoodM, { pos: [0, 0.2, 0], parent: bench });
  bench.position.set(B.x, 0, B.z); scene.add(bench);
  const T = (x, z) => [B.x + x, B.top, B.z + z];

  // the brass cutaway globe on its stand
  const globe = makeGlobe(0.33, { labels: false, yaw: -0.26 });
  globe.group.position.set(...T(-1.45, 0.34)); globe.group.position.y = B.top + 0.5; globe.group.rotation.x = 0.02; scene.add(globe.group);
  const stand = new THREE.Group(); stand.position.set(...T(-1.45, 0.34)); stand.position.y = B.top; scene.add(stand);
  mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.04, 32), darkWoodM, { pos: [0, 0.02, 0], parent: stand });
  mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.38, 20), darkWoodM, { pos: [0, 0.23, 0], parent: stand });
  mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.03, 24), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.3 }), { pos: [0, 0.44, 0], parent: stand });
  const axle = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.7, 12), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.3 }), { pos: [0, 0.5, 0], rot: [0, 0, Math.PI / 2], parent: stand });
  void axle;
  // base plaque
  const plaque = decal(0.62, 0.14, (c) => {
    printText(c, ['SECTION THROUGH THE EARTH'], { size: 70, y: 0.3, style: 'slab', color: '#4b4845', seed: 531, track: 1 });
    printText(c, ['MEAN RADIUS 6,371 KM · SCALE 1:19,300,000'], { size: 34, y: 0.72, style: 'slab', color: '#4b4845', seed: 532, font: 'Rockwell', weight: 'normal' });
  }, { res: 1024, rough: 0.8 });
  plaque.rotation.x = -Math.PI / 2; plaque.position.set(...T(-1.45, 0.41)); plaque.position.y = B.top + 0.045; scene.add(plaque);

  // pin + tray on the bench (B1/B2)
  const pinTray = new THREE.Group(); pinTray.position.set(...T(-1.86, 0.34)); pinTray.position.y = B.top + 0.014; scene.add(pinTray);
  mesh(boxM(0.24, 0.018, 0.14), darkWoodM, { parent: pinTray });
  mesh(boxM(0.2, 0.006, 0.1), new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.9 }), { pos: [0, 0.012, 0], parent: pinTray });
  const pin = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.09, 8), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.9, roughness: 0.25 }), { pos: [0, 0.045, 0], parent: pin });
  mesh(new THREE.SphereGeometry(0.009, 12, 8), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.5 }), { pos: [0, 0.095, 0], parent: pin });
  pin.position.set(-1.86, B.top + 0.03, B.z + 0.34); pin.rotation.z = 0.2; pin.rotation.x = 0.1; scene.add(pin);

  // scale tag tied to the globe axle, hanging over the cut face (B2)
  const scaleTag = new THREE.Group(); scaleTag.position.set(-1.73, 1.45, -1.55); scaleTag.rotation.y = 0.55; scaleTag.scale.setScalar(1.15); scene.add(scaleTag);
  mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.05, 6), new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 0.7 }), { pos: [0, -0.025, 0], parent: scaleTag });
  mesh(boxM(0.17, 0.13, 0.004), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.85 }), { pos: [0, -0.075, 0], parent: scaleTag });
  const tagDecal = decal(0.165, 0.125, (c) => {
    printText(c, ['12 KM'], { size: 150, y: 0.34, style: 'slab', color: '#4b4845', seed: 561, track: 1 });
    printText(c, ['0.6 MM'], { size: 92, y: 0.72, style: 'slab', color: '#4b4845', seed: 562, font: 'Rockwell', weight: 'normal' });
  }, { res: 768, rough: 0.85 });
  tagDecal.position.set(0, -0.075, 0.003); scaleTag.add(tagDecal);

  // vacuum pump with gauge
  const pump = new THREE.Group(); pump.position.set(...T(0.08, 0.22)); pump.position.y = B.top; scene.add(pump);
  mesh(boxM(0.5, 0.08, 0.34), darkWoodM, { pos: [0, 0.04, 0], parent: pump });
  mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.38, 28), new THREE.MeshStandardMaterial({ color: 0x6a6258, metalness: 0.7, roughness: 0.4 }), { pos: [0, 0.26, 0], parent: pump });
  mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 28), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.3 }), { pos: [0, 0.47, 0], parent: pump });
  const flywheel = mesh(new THREE.TorusGeometry(0.14, 0.018, 10, 32), new THREE.MeshStandardMaterial({ color: 0x7a5a42, metalness: 0.6, roughness: 0.5 }), { pos: [0.16, 0.3, 0.12], rot: [0, Math.PI / 2, 0], parent: pump });
  void flywheel;
  const vacGauge = makeGauge(0.115, 'VACUUM', 'ATM', { ticks: 10 });
  vacGauge.position.set(0, 0.58, 0.1); pump.add(vacGauge);
  const vacNeedle = vacGauge.userData.needle;
  // pipe from pump to the globe
  const pipeM = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.32 });
  const pipe = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.75, 12), pipeM, { pos: [-0.42, 0.35, 0.02], rot: [0, 0, Math.PI / 2], parent: pump });
  void pipe;
  mesh(new THREE.TorusGeometry(0.06, 0.014, 8, 20, Math.PI), pipeM, { pos: [-0.8, 0.38, 0.02], rot: [0, 0, 0], parent: pump });

  // crank that "drills" the model tunnel (B3)
  const crank = new THREE.Group(); crank.position.set(-2.42, B.top, -1.56); scene.add(crank);
  mesh(boxM(0.26, 0.1, 0.2), darkWoodM, { pos: [0, 0.05, 0], parent: crank });
  const crankArm = new THREE.Group(); crankArm.position.set(0, 0.24, 0.03); crank.add(crankArm);
  mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 10), brassM, { pos: [0.17, 0, 0], rot: [0, 0, Math.PI / 2], parent: crankArm });
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.09, 10), darkWoodM, { pos: [0.34, 0, 0], rot: [0, 0, Math.PI / 2], parent: crankArm });
  mesh(new THREE.SphereGeometry(0.038, 12, 8), new THREE.MeshStandardMaterial({ color: 0x8b5b3b, roughness: 0.6 }), { pos: [0.34, 0, 0.08], parent: crankArm });
  crankArm.rotation.z = -0.7;

  // printed plate: thought experiment (B1/B3)
  const experimentPlate = new THREE.Group(); experimentPlate.position.set(-0.72, B.top + 0.01, -1.48); experimentPlate.rotation.set(-0.16, 0.16, 0); scene.add(experimentPlate);
  mesh(boxM(0.66, 0.26, 0.016), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.8 }), { pos: [0, 0.13, 0], parent: experimentPlate });
  const expDecal = decal(0.63, 0.24, (c) => {
    printText(c, ['THOUGHT EXPERIMENT'], { size: 74, y: 0.32, style: 'slab', color: '#4b4845', seed: 545, track: 1 });
    printText(c, ['12,742 KM · 1 ATM'], { size: 58, y: 0.72, style: 'slab', color: '#4b4845', seed: 546, font: 'Rockwell', weight: 'normal' });
  }, { res: 1024, rough: 0.8 });
  expDecal.position.set(0, 0.13, 0.01); experimentPlate.add(expDecal);

  // capsule cradle (standing, on the floor right of the bench)
  const cradle = new THREE.Group(); cradle.position.set(2.05, 0, -0.92); scene.add(cradle);
  mesh(boxM(1.24, 0.1, 1.0), darkWoodM, { pos: [0, 0.05, 0], parent: cradle });
  for (const x of [-0.46, 0.46]) for (const z of [-0.36, 0.36]) mesh(boxM(0.1, 0.12, 0.1), darkWoodM, { pos: [x, 0.11, z], parent: cradle });
  for (const y of [0.72, 1.52]) {
    mesh(new THREE.TorusGeometry(0.53, 0.045, 8, 30, Math.PI * 1.15), darkWoodM, { pos: [0, y, 0], rot: [Math.PI / 2, 0, Math.PI * 1.42], parent: cradle });
    mesh(new THREE.TorusGeometry(0.53, 0.045, 8, 30, Math.PI * 1.15), darkWoodM, { pos: [0, y, 0], rot: [Math.PI / 2, 0, Math.PI * 1.92], parent: cradle });
  }
  for (const z of [-0.38, 0.38]) mesh(boxM(1.0, 0.07, 0.08), darkWoodM, { pos: [0, 1.92, z], parent: cradle });
  const cradleLabel = decal(0.5, 0.09, (c) => printText(c, ['CAPSULE BAY'], { size: 90, style: 'stencil', color: '#4b4845', seed: 541, track: 3 }), { res: 768, rough: 0.8 });
  cradleLabel.position.set(0, 0.06, 0.503); cradle.add(cradleLabel);

  // two clocks on the back wall
  const clock1 = makeClock(0.27, '42:12', 'UNIFORM EARTH', { top: 'FALL TIME' });
  clock1.position.set(-0.75, 2.66, LAB.back + 0.02); scene.add(clock1);
  const clock2 = makeClock(0.27, '38:11', 'REAL EARTH', { top: 'PREM DENSITY' });
  clock2.position.set(0.75, 2.66, LAB.back + 0.02); scene.add(clock2);
  // speedometer on the wall
  const speedo = makeGauge(0.32, '8 KM/S', '28,800 KM/H', { ticks: 12 });
  speedo.position.set(2.55, 2.38, LAB.back + 0.02); speedo.rotation.y = 0; scene.add(speedo);
  speedo.userData.needle.rotation.z = -1.1;
  // lever on the bench
  const lever = new THREE.Group(); lever.position.set(...T(0.95, 0.3)); lever.position.y = B.top; scene.add(lever);
  mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.05, 24), darkWoodM, { pos: [0, 0.025, 0], parent: lever });
  mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 10), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.3 }), { pos: [0, 0.19, 0], rot: [0, 0, 0.5], parent: lever });
  mesh(new THREE.SphereGeometry(0.035, 14, 10), new THREE.MeshStandardMaterial({ color: 0x8b5b3b, roughness: 0.6 }), { pos: [-0.08, 0.34, 0], parent: lever });
  mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.24, 8), brassM, { pos: [1.08, 1.09, -1.55], parent: scene });
  const leverTag = new THREE.Group(); leverTag.position.set(1.08, 1.22, -1.55); leverTag.rotation.x = -0.5; scene.add(leverTag);
  mesh(boxM(0.30, 0.10, 0.004), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.85 }), { parent: leverTag });
  const leverDecal = decal(0.295, 0.095, (c) => printText(c, ['REAL EARTH'], { size: 120, style: 'stencil', color: '#4b4845', seed: 551, track: 1 }), { res: 768, rough: 0.85 });
  leverDecal.position.z = 0.003; leverTag.add(leverDecal);

  // shelves on the back wall with books and instrument boxes
  const shelfX = [-2.55, 2.65];
  for (let k = 0; k < 3; k++) {
    const y = 1.05 + k * 0.5;
    mesh(boxM(2.0, 0.04, 0.3), darkWoodM, { pos: [-1.5, y, LAB.back + 0.16], parent: scene });
    for (let x = -2.35; x < -0.55; x += 0.12 + R() * 0.1) {
      const r = R();
      if (r < 0.6) mesh(boxM(0.055, 0.2 + R() * 0.1, 0.18 + R() * 0.05), new THREE.MeshStandardMaterial({ color: [0x8b5b3b, 0x8d6a2f, 0x5a4a3e, 0x6a5e50][Math.floor(R() * 4)], roughness: 0.9 }), { pos: [x, y + 0.12, LAB.back + 0.16], parent: scene });
      else mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 16), brassM, { pos: [x, y + 0.09, LAB.back + 0.16], parent: scene });
    }
    void shelfX;
  }
  // a couple of instrument boxes on the right shelf
  for (let k = 0; k < 3; k++) mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 16), brassM, { pos: [1.2 + k * 0.18, 1.24, LAB.back + 0.16], parent: scene });

  // light shafts + dust
  const motes = makeMotes(420, [-2.9, 0.6, -2.0], [-0.6, 2.8, 0.8]); motes.material.uniforms.uSize.value = 0.0012; scene.add(motes);
  const bounce = new THREE.PointLight(0xffc89a, 3.4, 8, 1.4); bounce.position.set(-1.7, 0.6, -0.4); scene.add(bounce);
  const skyFill = new THREE.PointLight(0xa8c8ec, 1.8, 8, 1.5); skyFill.position.set(-2.6, 2.2, -0.4); scene.add(skyFill);
  scene.add(new THREE.HemisphereLight(0xe8eef4, 0x9a7a5a, 0.45));

  const bullard = cast.bullard; scene.add(bullard.group);
  bullard.group.position.set(0.4, 0, -0.6);
  // a lab coat on a hook
  const hook = mesh(boxM(0.6, 0.1, 0.03), darkWoodM, { pos: [2.0, 1.9, LAB.back + 0.02], parent: scene });
  void hook;
  const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.26, 0.95, 20, 6, true), new THREE.MeshPhysicalMaterial({ color: 0xc9c0b0, roughness: 0.98, sheen: 0.15, side: THREE.DoubleSide }));
  coat.position.set(2.0, 1.45, LAB.back + 0.08); scene.add(coat);

  return {
    name: 'lab', scene, sky, bullard, globe, stand, pin, pinTray, pump, vacGauge, vacNeedle, cradle, clock1, clock2, speedo, lever, motes, T, bench: B, win: o,
    crank, crankArm, experimentPlate,
    reset() { bullard.reset(); pin.visible = false; },
    update(t) { motes.material.uniforms.uTime.value = t; },
  };
}
