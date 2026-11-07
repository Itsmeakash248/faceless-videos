// Kola Superdeep Borehole, 1992. A sunlit arctic rig at sunrise: lattice derrick, rotary table with the 23 cm
// hole, core trays, pipe rack, mud pumps, a doghouse, snow patches, and the crew on the floor.
import * as THREE from 'three';
import { makeSky } from '../core/sky.js';
import { dirt, rock, steel, timber, concrete, noise2, rng } from '../core/tex.js';
import { pbr, mesh, boxM, ringLathe, decal, printText, scatter } from '../props/kit.js';
import { makeHat } from '../props/hats.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function bar(a, b, r, mat, parent) {
  const len = a.distanceTo(b);
  const m = mesh(new THREE.CylinderGeometry(r, r, len, 10), mat, { parent });
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

export function buildKola(renderer, cast) {
  const scene = new THREE.Scene();
  const sky = makeSky(renderer, { az: -72, el: 9.5, top: 0x4a8fd2, mid: 0x8fc0ea, haze: 0xf4dcb8, ground: 0xa88a66, sunI: 4.6, cloud: 0.45, glow: 1.15, groundBounce: 0.8 });
  scene.add(sky.dome, sky.sun, sky.sun.target); scene.environment = sky.env; scene.environmentIntensity = 0.55;
  scene.fog = new THREE.Fog(0xe8d2b4, 38, 260);
  const R = rng(402);

  // ground
  const gg = new THREE.PlaneGeometry(260, 260, 120, 120); gg.rotateX(-Math.PI / 2);
  const n = noise2(21), gp = gg.attributes.position;
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i), r = Math.hypot(x, z);
    gp.setY(i, (n.fbm(x * 0.055, z * 0.055, 4) - 0.5) * 1.1 * Math.min(1, r / 14) + (n(x * 0.7, z * 0.7) - 0.5) * 0.05);
  }
  gg.computeVertexNormals();
  mesh(gg, pbr(dirt(22, { base: 0x9a7c5c, pebbles: 0.75 }), { repeat: [80, 80], ns: 1.6 }), { parent: scene, cast: false });

  // snow patches
  const snowM = new THREE.MeshStandardMaterial({ color: 0xefe6d6, roughness: 0.95, metalness: 0 });
  for (let k = 0; k < 16; k++) {
    const a = R() * Math.PI * 2, r = 6 + R() * 26;
    const geo = new THREE.CircleGeometry(1, 26); const p = geo.attributes.position;
    for (let i = 1; i < p.count; i++) { const ang = Math.atan2(p.getY(i), p.getX(i)); const rad = 0.7 + 0.3 * Math.sin(ang * 3 + k) + 0.12 * Math.sin(ang * 7 + k * 2); p.setXY(i, Math.cos(ang) * rad, Math.sin(ang) * rad); }
    geo.rotateX(-Math.PI / 2);
    const s = mesh(geo, snowM, { pos: [Math.sin(a) * r, 0.015 + R() * 0.01, Math.cos(a) * r], parent: scene, cast: false });
    s.scale.set(1.2 + R() * 3.4, 1, 0.7 + R() * 2.2); s.rotation.y = R() * 6;
  }
  // tundra mounds
  scene.add(scatter(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x8a7552, roughness: 1 }), 70, (o, i, Rr) => {
    const a = Rr() * Math.PI * 2, r = 40 + Rr() * 90; o.position.set(Math.sin(a) * r, Rr() * 1.2, Math.cos(a) * r); o.scale.set(3 + Rr() * 6, 0.8 + Rr() * 2.6, 3 + Rr() * 6);
  }, { cast: false }));

  const padY = 0.12;
  const cTex = concrete(23, { base: 0xcfcac0 }), cMat = pbr(cTex, { repeat: [2, 2], ns: 1.1, rough: 0.9 });
  const sTex = steel(24, { base: 0x8a5a42, rivets: 6 }), steelM = pbr(sTex, { repeat: [1, 2], ns: 1.3, rough: 0.7, metal: 0.35 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x4b4845, metalness: 0.45, roughness: 0.6 });
  const brassM = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.34 });
  const woodM = pbr(timber(25, { boards: 3, base: 0x8b5b3b, grey: 0.18 }), { repeat: [0.5, 0.5], ns: 0.9 });

  // concrete pad with the rotary table
  mesh(boxM(7.4, 0.12, 7.4), cMat, { pos: [0, padY - 0.06, 0], parent: scene, cast: false });
  mesh(boxM(7.0, 0.06, 7.0), pbr(cTex, { repeat: [3, 3], color: 0xb9b3a6 }), { pos: [0, padY + 0.001, 0], parent: scene, cast: false });
  const holeY = padY + 0.02;
  // rotary table ring plate (hole 23 cm)
  const tableRing = new THREE.Mesh(new THREE.RingGeometry(0.115, 0.72, 64), pbr(steel(26, { base: 0x7a6a58 }), { repeat: [3, 3], rough: 0.55, metal: 0.5 }));
  tableRing.rotation.x = -Math.PI / 2; tableRing.position.set(0, holeY + 0.012, 0); tableRing.receiveShadow = true; scene.add(tableRing);
  mesh(new THREE.TorusGeometry(0.115, 0.018, 8, 40), brassM, { pos: [0, holeY + 0.02, 0], rot: [Math.PI / 2, 0, 0], parent: scene });
  mesh(new THREE.TorusGeometry(0.7, 0.03, 8, 64), darkM, { pos: [0, holeY + 0.01, 0], rot: [Math.PI / 2, 0, 0], parent: scene });
  const hole = mesh(new THREE.CylinderGeometry(0.115, 0.115, 1.2, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x2e2824, roughness: 1, side: THREE.DoubleSide }), { pos: [0, holeY - 0.6, 0], parent: scene, cast: false });
  void hole;
  mesh(new THREE.CircleGeometry(0.112, 32), new THREE.MeshBasicMaterial({ color: 0x171412 }), { pos: [0, holeY - 0.4, 0], rot: [-Math.PI / 2, 0, 0], parent: scene, cast: false });

  // steel ruler across the hole
  const ruler = mesh(boxM(0.4, 0.007, 0.032), new THREE.MeshStandardMaterial({ color: 0xc9c2b4, metalness: 0.6, roughness: 0.4 }), { pos: [0.02, holeY + 0.032, 0.005], rot: [0, 0.06, 0], parent: scene });
  for (let i = 0; i < 20; i++) mesh(boxM(0.003, 0.002, i % 5 === 0 ? 0.028 : 0.018), darkM, { pos: [-0.19 + i * 0.02, holeY + 0.036, 0.005], parent: scene, cast: false });
  // printed plate lying beside the hole: 23 CM
  const holePlate = new THREE.Group(); holePlate.position.set(0.46, holeY + 0.095, 0.24); holePlate.rotation.set(0.95, -0.42, 0); scene.add(holePlate);
  mesh(boxM(0.56, 0.008, 0.2), darkM, { parent: holePlate, cast: false });
  const holeDecal = decal(0.52, 0.17, (c) => {
    c.getContext('2d').fillStyle = '#e5dfd0'; c.getContext('2d').fillRect(0, 0, c.width, c.height);
    printText(c, ['23 CM'], { size: 130, y: 0.32, style: 'stencil', color: '#4b4845', seed: 425 });
    printText(c, ['BOREHOLE · SG-3'], { size: 52, y: 0.72, style: 'stencil', color: '#4b4845', seed: 426, font: 'Rockwell', weight: 'normal' });
  }, { res: 768, rough: 0.8 });
  holeDecal.rotation.x = -Math.PI / 2; holeDecal.position.y = 0.006; holePlate.add(holeDecal);

  // rock that creeps back into the hole (D9/D10) — hidden until a shot calls for it
  const creep = new THREE.Group(); creep.position.set(0, holeY, 0); creep.visible = false; scene.add(creep);
  for (let k = 0; k < 14; k++) {
    const a = k / 14 * Math.PI * 2 + R() * 0.2, r = 0.14 + R() * 0.14;
    const b = mesh(new THREE.DodecahedronGeometry(0.035 + R() * 0.03, 0), pbr(rock(29, { base: 0x8a7458 }), { repeat: [1, 1], rough: 0.95 }), {
      pos: [Math.cos(a) * r, 0.005 + R() * 0.02, Math.sin(a) * r], rot: [R() * 3, R() * 3, R() * 3], parent: creep,
    });
    b.scale.set(1 + R() * 0.8, 0.7 + R() * 0.5, 1 + R() * 0.8);
  }

  // derrick
  const der = new THREE.Group(); der.position.set(0, padY, 0); scene.add(der);
  const base = 1.75, top = 0.52, H = 9.4;
  const corners = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  for (const [sx, sz] of corners) {
    bar(V(sx * base, 0, sz * base), V(sx * top, H, sz * top), 0.07, steelM, der);
    mesh(boxM(0.5, 0.16, 0.5), cMat, { pos: [sx * base, 0.08, sz * base], parent: der });
  }
  for (let k = 1; k <= 7; k++) {
    const t = k / 8, y = H * t, s = base + (top - base) * t;
    for (let i = 0; i < 4; i++) {
      const a = corners[i], b = corners[(i + 1) % 4];
      bar(V(a[0] * s, y, a[1] * s), V(b[0] * s, y, b[1] * s), 0.028, steelM, der);
      if (k < 7) {
        const y2 = H * ((k + 1) / 8), s2 = base + (top - base) * ((k + 1) / 8);
        bar(V(a[0] * s, y, a[1] * s), V(b[0] * s2, y2, b[1] * s2), 0.02, steelM, der);
      }
    }
  }
  // crown block + sheaves
  mesh(boxM(1.3, 0.36, 0.7), darkM, { pos: [0, H + 0.18, 0], parent: der });
  for (const z of [-0.22, 0.22]) mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24), brassM, { pos: [0, H + 0.12, z], rot: [0, 0, Math.PI / 2], parent: der });
  mesh(boxM(0.7, 0.1, 0.7), steelM, { pos: [0, H + 0.4, 0], parent: der });
  // traveling block and cable
  const block = new THREE.Group(); block.position.set(0, 2.7, 0); der.add(block);
  mesh(boxM(0.42, 0.55, 0.26), darkM, { parent: block });
  mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 20), brassM, { pos: [0, -0.36, 0], parent: block });
  mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 20), brassM, { pos: [0, -0.58, 0], parent: block });
  const cableM = new THREE.MeshStandardMaterial({ color: 0x3a3430, roughness: 0.65, metalness: 0.5 });
  mesh(new THREE.CylinderGeometry(0.012, 0.012, H - 2.9, 6), cableM, { pos: [0, (H + 2.7) / 2 - 0.1, 0], parent: der, cast: false });
  mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.7, 6), cableM, { pos: [0, 1.35 + padY, 0], parent: scene, cast: false });
  // sign on the derrick
  const sign = new THREE.Group();
  mesh(boxM(1.75, 0.62, 0.05), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.8 }), { parent: sign });
  const signT = decal(1.7, 0.58, (c) => {
    printText(c, ['KOLA SUPERDEEP'], { size: 130, y: 0.24, style: 'stencil', color: '#4b4845', seed: 411, track: 3 });
    printText(c, ['SG-3 · 12,262 M'], { size: 96, y: 0.58, style: 'stencil', color: '#4b4845', seed: 412 });
    printText(c, ['DEEPEST BOREHOLE ON EARTH'], { size: 44, y: 0.83, style: 'stencil', color: '#4b4845', seed: 413, font: 'Rockwell', weight: 'normal' });
  }, { res: 1400, rough: 0.85 });
  signT.position.z = 0.027; sign.add(signT);
  sign.position.set(0, 4.7, base - 0.02); sign.rotation.y = 0; der.add(sign);
  for (const x of [-0.8, 0.8]) mesh(boxM(0.05, 0.05, 0.1), steelM, { pos: [x, 0, -0.04], parent: sign });
  // small platform + ladder
  mesh(boxM(1.6, 0.05, 0.9), darkM, { pos: [ -0.9, 1.9, 1.1], parent: der });
  for (let y = 0.2; y < 1.8; y += 0.28) mesh(boxM(0.04, 0.04, 0.5), steelM, { pos: [1.55, y, 0.5], parent: der });
  mesh(boxM(0.04, 1.9, 0.04), steelM, { pos: [1.32, 1.0, 0.72], parent: der }); mesh(boxM(0.04, 1.9, 0.04), steelM, { pos: [1.78, 1.0, 0.72], parent: der });

  // mud pumps and pipes
  for (const [x, z] of [[-4.6, -2.6], [-4.6, -0.9]]) {
    const p = new THREE.Group(); p.position.set(x, padY, z); scene.add(p);
    mesh(boxM(1.5, 0.9, 1.1), steelM, { pos: [0, 0.45, 0], parent: p });
    mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 24), darkM, { pos: [0.3, 1.0, 0], rot: [Math.PI / 2, 0, 0], parent: p });
    mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 16), steelM, { pos: [0.9, 1.4, 0], rot: [Math.PI / 2, 0, 0], parent: p });
  }
  // pipe rack
  for (let k = 0; k < 9; k++) {
    mesh(new THREE.CylinderGeometry(0.075, 0.075, 5.4, 14), k % 2 ? steelM : darkM, { pos: [-4.1, 0.42 + Math.floor(k / 3) * 0.16, 3.0 - (k % 3) * 0.18], rot: [Math.PI / 2, 0, 0], parent: scene });
  }
  for (const z of [1.2, 4.2]) mesh(boxM(1.3, 0.5, 0.14), woodM, { pos: [-4.1, 0.25, z], parent: scene });

  // doghouse shed with a warm window
  const dog = new THREE.Group(); dog.position.set(3.9, padY, -3.0); dog.rotation.y = -0.32; scene.add(dog);
  mesh(boxM(2.4, 2.1, 2.0), pbr(timber(27, { boards: 6, base: 0x8b5b3b, grey: 0.2 }), { repeat: [1, 1], ns: 1.1 }), { pos: [0, 1.05, 0], parent: dog });
  mesh(boxM(2.6, 0.12, 2.2), darkM, { pos: [0, 2.16, 0], parent: dog });
  const win = mesh(new THREE.PlaneGeometry(0.62, 0.5), new THREE.MeshStandardMaterial({ color: 0xffd8a0, emissive: 0xffb870, emissiveIntensity: 0.55, roughness: 0.4 }), { pos: [-0.79, 1.45, 1.006], rot: [0, 0, 0], parent: dog, cast: false });
  void win;
  for (const x of [-0.79, -0.48]) mesh(boxM(0.03, 0.55, 0.03), darkM, { pos: [x, 1.45, 1.02], parent: dog });
  mesh(boxM(0.7, 0.03, 0.03), darkM, { pos: [-0.635, 1.7, 1.02], parent: dog });
  mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 12), darkM, { pos: [0.85, 2.3, -0.4], parent: dog, cast: false });

  // core tray table + trays
  const table = new THREE.Group(); table.position.set(-3.0, padY, 1.9); table.rotation.y = 0.12; scene.add(table);
  mesh(boxM(2.1, 0.07, 0.85), woodM, { pos: [0, 0.82, 0], parent: table });
  for (const x of [-0.9, 0.9]) for (const z of [-0.33, 0.33]) mesh(boxM(0.07, 0.8, 0.07), woodM, { pos: [x, 0.4, z], parent: table });
  const coreTex = rock(28, { base: 0x9a8a72 });
  const coreM = pbr(coreTex, { repeat: [2, 1], ns: 1.4 });
  const trays = new THREE.Group(); table.add(trays);
  for (let t = 0; t < 2; t++) {
    const tr = new THREE.Group(); tr.position.set(-0.55 + t * 1.1, 0.855, t ? 0.08 : -0.08); tr.rotation.y = (t ? -1 : 1) * 0.04; trays.add(tr);
    mesh(boxM(0.98, 0.07, 0.3), woodM, { pos: [0, 0, 0], parent: tr });
    for (const z of [-0.13, 0.13]) mesh(boxM(0.98, 0.09, 0.035), woodM, { pos: [0, 0.05, z], parent: tr });
    for (let k = 0; k < 7; k++) {
      const c = mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.26 + R() * 0.08, 12), coreM, { pos: [-0.39 + k * 0.13, 0.055, (R() - 0.5) * 0.05], rot: [0, 0, Math.PI / 2], parent: tr });
      c.rotation.z = Math.PI / 2 + (R() - 0.5) * 0.05;
    }
  }
  // large printed plate leaning by the core trays (A2)
  const corePlate = new THREE.Group(); corePlate.position.set(-2.86, padY, 2.62); corePlate.rotation.set(-0.18, 0.72, 0); scene.add(corePlate);
  mesh(boxM(0.78, 0.5, 0.025), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.8 }), { pos: [0, 0.64, 0], parent: corePlate });
  for (const x of [-0.3, 0.3]) mesh(boxM(0.05, 0.72, 0.05), woodM, { pos: [x, 0.36, -0.035], parent: corePlate });
  const coreDecal = decal(0.74, 0.46, (c) => {
    c.getContext('2d').fillStyle = '#e5dfd0'; c.getContext('2d').fillRect(0, 0, c.width, c.height);
    printText(c, ['12,262 M'], { size: 170, y: 0.3, style: 'stencil', color: '#4b4845', seed: 427, track: 1 });
    printText(c, ['KOLA SG-3'], { size: 82, y: 0.7, style: 'stencil', color: '#4b4845', seed: 428, font: 'Rockwell', weight: 'normal' });
  }, { res: 1024, rough: 0.8 });
  coreDecal.position.set(0, 0.64, 0.014); corePlate.add(coreDecal);

  // a single core sample, movable by the shots (A2, D8)
  const coreSample = new THREE.Group();
  const cs = mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.4, 20), coreM, { parent: coreSample });
  cs.rotation.z = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.7 }), { pos: [0.12, 0, 0], rot: [0, 0, Math.PI / 2], parent: coreSample });
  const ctag = decal(0.12, 0.05, (c) => printText(c, ['12,262 M'], { size: 100, style: 'stencil', color: '#4b4845', seed: 421 }), { res: 384, rough: 0.8 });
  ctag.rotation.x = -Math.PI / 2; ctag.position.set(0.12, 0.034, 0); coreSample.add(ctag);
  coreSample.position.set(-2.7, padY + 0.9, 1.6); coreSample.rotation.y = 0.2; scene.add(coreSample);

  // drill bit on a stand (D7)
  const bit = new THREE.Group(); bit.position.set(2.4, padY, 1.0); scene.add(bit);
  mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 24), steelM, { pos: [0, 0.09, 0], parent: bit });
  const bitBody = mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.42, 24), steelM, { pos: [0, 0.4, 0], parent: bit });
  void bitBody;
  for (let k = 0; k < 3; k++) {
    const a = k / 3 * Math.PI * 2;
    const cone = mesh(new THREE.ConeGeometry(0.16, 0.26, 14), new THREE.MeshStandardMaterial({ color: 0x6a6258, metalness: 0.7, roughness: 0.35, emissive: 0x000000 }), { pos: [Math.cos(a) * 0.14, 0.22, Math.sin(a) * 0.14], rot: [Math.PI, 0, 0], parent: bit });
    cone.name = 'cone' + k;
    for (let j = 0; j < 8; j++) {
      const th = j / 8 * Math.PI * 2;
      mesh(new THREE.ConeGeometry(0.022, 0.05, 6), new THREE.MeshStandardMaterial({ color: 0x4b4845, metalness: 0.8, roughness: 0.4 }), { pos: [Math.cos(a) * 0.14 + Math.cos(th) * 0.1, 0.14, Math.sin(a) * 0.14 + Math.sin(th) * 0.1], rot: [Math.PI, 0, 0], parent: bit });
    }
  }
  // printed plate by the bit: 180 °C
  const bitTag = new THREE.Group(); bitTag.position.set(2.95, padY + 0.02, 1.28); bitTag.rotation.set(-0.35, 0.45, 0); scene.add(bitTag);
  mesh(boxM(0.5, 0.22, 0.015), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.8 }), { pos: [0, 0.11, 0], parent: bitTag });
  const bitDecal = decal(0.47, 0.2, (c) => {
    printText(c, ['DRILL BIT'], { size: 78, y: 0.3, style: 'stencil', color: '#4b4845', seed: 435, track: 2 });
    printText(c, ['180 °C'], { size: 118, y: 0.7, style: 'stencil', color: '#4b4845', seed: 436 });
  }, { res: 768, rough: 0.8 });
  bitDecal.position.set(0, 0.11, 0.009); bitTag.add(bitDecal);

  // warm fill for the bit close-up (D9), off elsewhere
  const bitFill = new THREE.PointLight(0xffd8b0, 3.2, 3.4, 1.7); bitFill.position.set(3.35, 1.4, 2.0); scene.add(bitFill); bitFill.visible = false;

  // drill string stub + wrench for D6
  const string = new THREE.Group(); string.position.set(1.0, padY, 0.7); scene.add(string);
  mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.4, 24), steelM, { pos: [0, 0.7, 0], parent: string });
  mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 24), brassM, { pos: [0, 0.42, 0], parent: string });
  mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 24), brassM, { pos: [0, 1.02, 0], parent: string });
  const wrench = new THREE.Group();
  mesh(boxM(0.9, 0.06, 0.12), new THREE.MeshStandardMaterial({ color: 0x6a5a48, metalness: 0.7, roughness: 0.45 }), { pos: [0, 0, 0], parent: wrench });
  mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 24, Math.PI * 1.4), darkM, { pos: [-0.42, 0, 0], rot: [Math.PI / 2, 0, 0], parent: wrench });
  wrench.position.set(1.0, padY + 0.62, 0.5); wrench.rotation.set(0, 0.3, 0.15); scene.add(wrench);

  // printed plate by the stuck string (D11)
  const stuckPlate = new THREE.Group(); stuckPlate.position.set(0.62, padY + 0.12, 1.28); stuckPlate.rotation.set(-0.24, 0.22, 0); scene.add(stuckPlate);
  mesh(boxM(0.62, 0.26, 0.016), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.8 }), { pos: [0, 0.13, 0], parent: stuckPlate });
  const stuckDecal = decal(0.59, 0.24, (c) => {
    printText(c, ['STUCK'], { size: 132, y: 0.32, style: 'stencil', color: '#4b4845', seed: 437, track: 3 });
    printText(c, ['12,262 M · 180 °C'], { size: 54, y: 0.73, style: 'stencil', color: '#4b4845', seed: 438 });
  }, { res: 1024, rough: 0.8 });
  stuckDecal.position.set(0, 0.13, 0.01); stuckPlate.add(stuckDecal);

  // steel cap for the last shot
  const cap = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 32), steelM, { pos: [0, 0.025, 0], parent: cap });
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.016, 8, 6), brassM, { pos: [Math.cos(a) * 0.2, 0.055, Math.sin(a) * 0.2], parent: cap }); }
  mesh(new THREE.TorusGeometry(0.08, 0.014, 8, 20), brassM, { pos: [0, 0.055, 0], rot: [Math.PI / 2, 0, 0], parent: cap });
  const capTag = decal(0.24, 0.1, (c) => printText(c, ['SG-3 · SEALED'], { size: 90, style: 'stencil', color: '#4b4845', seed: 431 }), { res: 512, rough: 0.8 });
  capTag.rotation.x = -Math.PI / 2; capTag.position.set(0, 0.077, 0); cap.add(capTag);
  cap.position.set(2.2, padY, 1.9); scene.add(cap);

  // characters
  const worker = cast.worker, miner = cast.miner || cast.worker;
  scene.add(worker.group); scene.add(miner.group);
  const hats = { worker: makeHat('hardhat'), miner: makeHat('cap') };
  scene.add(hats.worker.group, hats.miner.group);
  worker.group.position.set(2.3, padY, 1.5);
  miner.group.position.set(-2.2, padY, -1.0);
  hats.worker.group.visible = false; hats.miner.group.visible = false;

  return {
    name: 'kola', scene, sky, worker, miner, hats, der, sign, table, trays, coreSample, corePlate, bit, bitFill, string, wrench, cap, ruler,
    holePlate, bitTag, stuckPlate, creep, hole: { x: 0, y: holeY, z: 0, r: 0.115 }, padY, coreM,
    reset() { worker.reset(); miner.reset(); creep.visible = false; bitFill.visible = false; holePlate.visible = true; wrench.visible = true; coreSample.position.set(-2.7, padY + 0.9, 1.6); coreSample.rotation.set(0, 0.2, 0); },
  };
}
