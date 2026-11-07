// TEST CAPSULE / 01 — the hero prop: a steel fall capsule with a porthole, orange band, brass fittings and
// printed type. Origin at its centre; about 2.06 m tall, 0.94 m wide. Travels between every set.
import * as THREE from 'three';
import { decal, printText } from '../props/kit.js';

export function makeCapsule() {
  const g = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({ color: 0x91897c, metalness: 0.55, roughness: 0.42 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x4b4845, metalness: 0.45, roughness: 0.55 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.9, roughness: 0.3 });
  const bandM = new THREE.MeshStandardMaterial({ color: 0xe5784a, metalness: 0.15, roughness: 0.62 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x2b2723, metalness: 0.2, roughness: 0.08, clearcoat: 1, emissive: 0xffc98a, emissiveIntensity: 0.22 });

  const profile = [[0, -1.06], [0.17, -1.0], [0.34, -0.86], [0.44, -0.66], [0.47, -0.4], [0.47, 0.5], [0.44, 0.68], [0.35, 0.85], [0.19, 0.97], [0, 1.02]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), hull);
  body.castShadow = true; body.receiveShadow = true; g.add(body);

  // welded seams
  for (const y of [-0.62, -0.05, 0.46]) {
    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.468 + 0.002 * Math.cos(y * 3), 0.008, 6, 64), dark);
    seam.rotation.x = Math.PI / 2; seam.position.y = y; g.add(seam);
  }
  // orange band
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.478, 0.478, 0.17, 64, 1, true), bandM);
  band.position.y = 0.14; band.castShadow = true; g.add(band);

  // porthole (+Z) with a shallow lit interior
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.163, 0.026, 16, 48), brass);
  ring.position.set(0, -0.08, 0.455); g.add(ring);
  const well = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.09, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a332c, roughness: 0.8, side: THREE.DoubleSide }));
  well.rotation.x = Math.PI / 2; well.position.set(0, -0.08, 0.418); g.add(well);
  const pane = new THREE.Mesh(new THREE.CircleGeometry(0.15, 40), glass);
  pane.position.set(0, -0.08, 0.452); g.add(pane);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.05), new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.9 }));
  seat.position.set(0, -0.12, 0.37); g.add(seat);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), brass);
    bolt.position.set(Math.cos(a) * 0.2, -0.08 + Math.sin(a) * 0.2, 0.469); g.add(bolt);
  }

  // hatch (-Z)
  const hatchRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 14, 64), brass);
  hatchRing.position.set(0, 0.06, -0.452); g.add(hatchRing);
  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.045, 48), new THREE.MeshStandardMaterial({ color: 0x7a7266, metalness: 0.6, roughness: 0.5 }));
  hatch.rotation.x = Math.PI / 2; hatch.position.set(0, 0.06, -0.46); hatch.castShadow = true; g.add(hatch);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.013, 8, 24), brass);
  wheel.position.set(0, 0.06, -0.492); g.add(wheel);
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.012, 0.012), brass);
    sp.position.set(0, 0.06, -0.492); sp.rotation.z = i * Math.PI / 3; g.add(sp);
  }

  // lifting eye + cable lug
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 10, 24), brass);
  eye.position.set(0, 1.055, 0); eye.rotation.y = Math.PI / 2; g.add(eye);

  // printed type, wrapped to the hull
  const front = decal(0.5, 0.2, (c) => {
    printText(c, ['TEST CAPSULE', 'NO. 01'], { size: 118, y: 0.3, style: 'stencil', color: '#4b4845', seed: 201, track: 2 });
    printText(c, ['2,400 KG · 1 PERSON'], { size: 62, y: 0.72, style: 'stencil', color: '#4b4845', seed: 202, font: 'Rockwell', weight: 'normal' });
  }, { res: 1024, curved: 0.47, rough: 0.6 });
  front.position.set(0, 0.33, 0.47); g.add(front);
  const side = decal(0.42, 0.42, (c) => {
    printText(c, ['01'], { size: 300, y: 0.46, style: 'stencil', color: '#4b4845', seed: 203 });
    printText(c, ['THIS SIDE UP'], { size: 58, y: 0.82, style: 'stencil', color: '#4b4845', seed: 204 });
  }, { res: 768, curved: 0.47, rough: 0.6 });
  side.position.set(0, -0.34, 0.47); side.rotation.y = 0; g.add(side);

  // small grab rails
  for (const sx of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.38, 10), brass);
    rail.position.set(sx * 0.475, -0.36, 0.06); g.add(rail);
    for (const y of [-0.18, 0.18]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), brass);
      post.rotation.z = Math.PI / 2; post.position.set(sx * 0.445, y - 0.36, 0.06); g.add(post);
    }
  }

  const light = new THREE.PointLight(0xffc98a, 0.8, 2.4, 1.6);
  light.position.set(0, -0.06, 0.1); g.add(light);

  return { group: g, body, band, hatch, hatchRing, pane, eye, light, materials: { hull, dark, brass, bandM, glass } };
}
