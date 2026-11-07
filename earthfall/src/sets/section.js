// The observatory terrace: a four-metre cutaway Earth on a stone plinth at sunrise, brass rings, engraved labels,
// gravity arrows, and a colonnade fading into warm haze.
import * as THREE from 'three';
import { makeSky } from '../core/sky.js';
import { concrete, dirt, noise2, rng, timber } from '../core/tex.js';
import { pbr, mesh, boxM, decal, printText, scatter } from '../props/kit.js';
import { makeGlobe, makeArrow } from '../props/globe.js';
import { makeMotes } from './trench.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const RC = 2.3, CY = 3.15; // globe radius, centre height

export function buildSection(renderer) {
  const scene = new THREE.Scene();
  const sky = makeSky(renderer, { az: -64, el: 10, top: 0x4a8fd2, mid: 0x92c2ea, haze: 0xf6dcb8, ground: 0xa88866, sunI: 5.2, cloud: 0.4, glow: 1.25, groundBounce: 0.8 });
  scene.add(sky.dome, sky.sun, sky.sun.target); scene.environment = sky.env; scene.environmentIntensity = 0.55;
  scene.fog = new THREE.Fog(0xead4b4, 45, 260);
  const R = rng(701);

  // terrace
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(14, 14.4, 0.5, 96), pbr(concrete(702, { base: 0xc4b8a4 }), { repeat: [8, 8], ns: 1.3, rough: 0.9 }));
  floor.position.y = -0.25; floor.receiveShadow = true; scene.add(floor);
  mesh(new THREE.TorusGeometry(12.6, 0.09, 8, 96), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.34 }), { pos: [0, 0.01, 0], rot: [Math.PI / 2, 0, 0], parent: scene, cast: false });
  // inlaid brass lines radiating
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    mesh(boxM(0.035, 0.01, 12.2), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.8, roughness: 0.4 }), { pos: [Math.sin(a) * 6.2, 0.012, Math.cos(a) * 6.2], rot: [0, a, 0], parent: scene, cast: false });
  }
  // plinth
  const plinth = new THREE.Group(); scene.add(plinth);
  mesh(new THREE.CylinderGeometry(2.35, 2.55, 0.25, 64), pbr(timber(703, { boards: 2, base: 0x6a4e36 }), { repeat: [2, 2], rough: 0.7 }), { pos: [0, 0.125, 0], parent: plinth });
  mesh(new THREE.CylinderGeometry(1.15, 1.35, 0.72, 48), pbr(concrete(704, { base: 0xb8ab96 }), { repeat: [2, 1], rough: 0.85 }), { pos: [0, 0.61, 0], parent: plinth });
  mesh(new THREE.TorusGeometry(2.42, 0.055, 8, 64), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.32 }), { pos: [0, 0.26, 0], rot: [Math.PI / 2, 0, 0], parent: plinth });
  const plaque = decal(2.1, 0.5, (c) => {
    c.getContext('2d').fillStyle = '#e5dfd0'; c.getContext('2d').fillRect(0, 0, c.width, c.height);
    printText(c, ['SECTION THROUGH THE EARTH'], { size: 84, y: 0.24, style: 'slab', color: '#4b4845', seed: 711, track: 2 });
    printText(c, ['MEAN RADIUS 6,371 KM · MODEL 1:2,770,000'], { size: 42, y: 0.53, style: 'slab', color: '#4b4845', seed: 712, font: 'Rockwell', weight: 'normal' });
    printText(c, ['CRUST · MANTLE · OUTER CORE · INNER CORE'], { size: 34, y: 0.78, style: 'slab', color: '#4b4845', seed: 713, font: 'Rockwell', weight: 'normal' });
  }, { res: 1600, rough: 0.8 });
  plaque.position.set(0, 0.31, 2.56); plaque.rotation.x = -0.16; scene.add(plaque);

  // small printed gravity tags on brass stands (C4–C8)
  const tagBaseM = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.82, roughness: 0.36 });
  const tagPlateM = new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.8 });
  const mkTag = (text, x, z, rot = 0) => {
    const g = new THREE.Group(); g.position.set(x, 0.25, z); g.rotation.y = rot; scene.add(g);
    mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.03, 20), tagBaseM, { pos: [0, 0.015, 0], parent: g });
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.88, 8), tagBaseM, { pos: [0, 0.44, 0], parent: g });
    mesh(boxM(0.5, 0.22, 0.014), tagPlateM, { pos: [0, 0.88, 0], parent: g });
    const d = decal(0.46, 0.2, (c) => printText(c, [text], { size: 112, style: 'stencil', color: '#4b4845', seed: 720 + text.length * 3, track: 2 }), { res: 512, rough: 0.8 });
    d.position.set(0, 0.88, 0.009); g.add(d);
    g.visible = false; return g;
  };
  const tags = { one: mkTag('1.0 g', -0.95, 2.12, 0.16), half: mkTag('0.5 g', 0.15, 2.25, -0.05), zero: mkTag('0.0 g', 1.05, 2.08, -0.18) };

  // globe
  const globe = makeGlobe(RC, { labels: true, yaw: -0.32, pitch: 0.02 });
  globe.group.position.set(0, CY, 0); scene.add(globe.group);
  // brass cradle arms
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.045, 8, 32, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.32 }));
    arm.position.set(sx * 0.0, 0.8, 0); arm.rotation.set(0, Math.PI / 2, sx > 0 ? -0.4 : Math.PI + 0.4); scene.add(arm);
  }
  // gravity arrows (above and below the capsule)
  const arrowUp = makeArrow(1.55, 0x4b4845); arrowUp.position.set(0, CY, 0.18); arrowUp.rotation.z = Math.PI; scene.add(arrowUp);
  const arrowDown = makeArrow(1.55, 0x4b4845); arrowDown.position.set(0, CY, 0.18); scene.add(arrowDown);
  arrowUp.visible = false; arrowDown.visible = false;

  // colonnade
  const colM = pbr(concrete(705, { base: 0xc8bca6 }), { repeat: [1, 2], rough: 0.9 });
  for (let i = 0; i < 7; i++) {
    const a = -1.5 + i * 0.5;
    const x = Math.sin(a) * 12.2, z = -Math.cos(a) * 12.2;
    const col = new THREE.Group(); col.position.set(x, 0, z); col.rotation.y = -a; scene.add(col);
    mesh(new THREE.CylinderGeometry(0.42, 0.5, 6.4, 20), colM, { pos: [0, 3.2, 0], parent: col });
    mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.22, 20), colM, { pos: [0, 6.45, 0], parent: col });
    mesh(boxM(1.2, 0.18, 1.2), colM, { pos: [0, 6.58, 0], parent: col });
    mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.16, 20), colM, { pos: [0, 0.08, 0], parent: col });
  }
  mesh(boxM(24, 0.5, 0.5), colM, { pos: [0, 6.7, -10.6], parent: scene, cast: false });
  // balustrade between columns on the far side
  for (let i = 0; i < 18; i++) { const a = -1.5 + i * 0.19; mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 10), colM, { pos: [Math.sin(a) * 12.2, 0.4, -Math.cos(a) * 12.2], parent: scene, cast: false }); }
  mesh(new THREE.TorusGeometry(12.2, 0.08, 6, 96, Math.PI * 0.8), colM, { pos: [0, 0.78, 0], rot: [Math.PI / 2, 0, -0.2], parent: scene, cast: false });

  // hazy hills beyond
  scene.add(scatter(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x8a7a5c, roughness: 1 }), 36, (o, i, Rr) => {
    const a = -1.4 + Rr() * 2.8, r = 70 + Rr() * 70; o.position.set(Math.sin(a) * r, -2 + Rr() * 2, -Math.cos(a) * r); o.scale.set(8 + Rr() * 14, 2 + Rr() * 4, 8 + Rr() * 14);
  }, { cast: false }));

  // light + dust
  const motes = makeMotes(600, [-8, 1, -8], [8, 8, 6]); motes.material.uniforms.uSize.value = 0.0018; motes.material.uniforms.uCol.value.set(0xe8c8a0); scene.add(motes);
  scene.add(new THREE.HemisphereLight(0xe8eef4, 0x9a7a5a, 0.5));

  return {
    name: 'section', scene, sky, globe, plinth, plaque, arrowUp, arrowDown, motes, RC, CY, tags,
    reset() {
      arrowUp.visible = false; arrowDown.visible = false; tags.one.visible = false; tags.half.visible = false; tags.zero.visible = false;
      plaque.visible = true;
      globe.group.rotation.set(0.02, -0.2, 0); globe.group.position.set(0, CY, 0);
    },
    update(t) { motes.material.uniforms.uTime.value = t; },
  };
}
