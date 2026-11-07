// A cutaway Earth teaching model: half a sphere, a flat cross-section face with the crust, mantle, outer core
// and inner core, a glass tunnel through the centre, brass rim, engraved latitude rings and printed plates.
// Used small on the lab bench and four metres across in the section hall.
import * as THREE from 'three';
import { decal, printText, mesh } from './kit.js';

const PAL = {
  crust: 0xb99a70, mantle: 0x8a6248, outer: 0xa87c46, inner: 0xc9a45c,
  rim: 0xa48a5a, boundary: 0x4b4845,
};
const IRON = {
  crust: 0x6e6258, mantle: 0x7c6a58, outer: 0xb08a5a, inner: 0xd8b06a,
  rim: 0x8a7a62, boundary: 0x3a3532,
};

export function makeGlobe(R = 1, opts = {}) {
  const g = new THREE.Group();
  const pal = opts.iron ? { ...PAL, ...IRON } : PAL;
  const brass = new THREE.MeshStandardMaterial({ color: pal.rim, metalness: 0.82, roughness: 0.34 });
  const ink = new THREE.MeshStandardMaterial({ color: pal.boundary, metalness: 0.2, roughness: 0.72 });

  // curved half (back), opening toward +Z
  const shell = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: pal.crust, metalness: opts.iron ? 0.55 : 0.35, roughness: 0.52 }));
  shell.castShadow = true; shell.receiveShadow = true; g.add(shell);
  // engraved latitude rings on the shell
  for (const f of [-0.72, -0.38, 0, 0.38, 0.72]) {
    const y = f * R, rr = Math.sqrt(Math.max(0.0001, 1 - f * f)) * R;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.006 * R, 6, 96), ink);
    ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring);
  }
  // brass rim at the cut
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.016 * R, 12, 128), brass);
  rim.position.z = 0; g.add(rim);

  // flat cross-section face
  const face = new THREE.Group(); g.add(face);
  const disk = (r0, r1, col, z) => {
    const geo = r0 > 0 ? new THREE.RingGeometry(r0, r1, 96) : new THREE.CircleGeometry(r1, 96);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, metalness: opts.iron ? 0.5 : 0.25, roughness: 0.6 }));
    m.position.z = z; m.receiveShadow = true; face.add(m); return m;
  };
  disk(0, R, pal.crust, 0.0015);
  disk(0.872 * R, 0.995 * R, pal.crust, 0.002); // crust band on top
  disk(0.55 * R, 0.871 * R, pal.mantle, 0.0026);
  disk(0.19 * R, 0.549 * R, pal.outer, 0.0032);
  disk(0, 0.189 * R, pal.inner, 0.0038);
  for (const r of [0.19 * R, 0.55 * R, 0.872 * R]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.004 * R, r + 0.004 * R, 96), ink);
    ring.position.z = 0.0042; face.add(ring);
  }

  // glass tunnel through the centre
  const tunnel = new THREE.Group(); face.add(tunnel);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.016 * R, 0.016 * R, 2 * R, 20, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xd8c8a8, metalness: 0.1, roughness: 0.06, transparent: true, opacity: 0.35, side: THREE.DoubleSide, clearcoat: 1 }));
  tube.position.z = 0.02 * R; tunnel.add(tube);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.005 * R, 0.005 * R, 2 * R, 8), new THREE.MeshBasicMaterial({ color: 0x4b4845 }));
  line.position.z = 0.02 * R; tunnel.add(line);
  // depth ticks on a brass strip beside the tunnel
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.035 * R, 2 * R, 0.008 * R), brass);
  strip.position.set(0.075 * R, 0, 0.025 * R); face.add(strip);
  for (const [f, s] of [[-1, '6,371'], [-0.5, '3,185'], [0, '0'], [0.5, '3,185'], [1, '6,371']]) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.045 * R, 0.004 * R, 0.01 * R), ink);
    tick.position.set(0.075 * R, f * R, 0.031 * R); face.add(tick);
    const pl = decal(0.16 * R, 0.045 * R, (c) => printText(c, [s], { size: 150, style: 'stencil', color: '#4b4845', seed: 300 + f * 7, track: 2 }), { res: 512, rough: 0.8 });
    pl.position.set(0.2 * R, f * R, 0.04 * R); face.add(pl);
  }

  // printed plates for the layers
  const labels = [];
  const addPlate = (lines, x, y, rot = 0, w = 0.42 * R, h = 0.095 * R) => {
    const plate = new THREE.Group();
    const back = mesh(new THREE.BoxGeometry(w, h, 0.006 * R), new THREE.MeshStandardMaterial({ color: 0xe5dfd0, roughness: 0.75 }), { parent: plate });
    back.castShadow = false;
    const text = decal(w, h, (c) => {
      printText(c, [lines[0]], { size: 110, y: 0.32, style: 'slab', color: '#4b4845', seed: 320 + labels.length, track: 1 });
      if (lines[1]) printText(c, [lines[1]], { size: 58, y: 0.73, style: 'slab', color: '#4b4845', seed: 321 + labels.length, font: 'Rockwell', weight: 'normal' });
    }, { res: 768, rough: 0.8 });
    text.position.z = 0.0035 * R; plate.add(text);
    plate.position.set(x, y, 0.05 * R); plate.rotation.z = rot; face.add(plate); labels.push(plate); return plate;
  };
  if (opts.labels !== false) {
    addPlate(['INNER CORE', '5,150–6,371 KM'], -0.38 * R, 0.16 * R, 0.04);
    addPlate(['OUTER CORE', '2,890–5,150 KM'], -0.62 * R, 0.5 * R, 0.08);
    addPlate(['MANTLE', '35–2,890 KM'], 0.42 * R, -0.5 * R, -0.05, 0.34 * R, 0.085 * R);
    addPlate(['CRUST', '0–35 KM'], 0.62 * R, 0.66 * R, 0.1, 0.26 * R, 0.075 * R);
  }

  g.rotation.y = opts.yaw ?? -0.24;
  g.rotation.x = opts.pitch ?? 0.03;
  return { group: g, shell, rim, face, tunnel, labels, R, palette: pal };
}

/** brass gravity arrow along +Y, origin at the tail */
export function makeArrow(len = 1, col = 0xa48a5a, inkCol = 0x4b4845) {
  const g = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: col, metalness: 0.8, roughness: 0.36 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.030 * len, 0.030 * len, len * 0.72, 12), brass);
  shaft.position.y = len * 0.36; shaft.castShadow = true; g.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.082 * len, len * 0.26, 16), brass);
  head.position.y = len * 0.85; head.castShadow = true; g.add(head);
  const tag = decal(0.14 * len, 0.07 * len, (c) => {
    c.getContext('2d').fillStyle = '#e5dfd0'; c.getContext('2d').fillRect(0, 0, c.width, c.height);
    printText(c, ['g'], { size: 150, style: 'slab', color: '#4b4845', seed: 340 });
  }, { res: 256, rough: 0.8 });
  tag.position.set(0.075 * len, len * 0.38, 0.001); g.add(tag);
  return g;
}
