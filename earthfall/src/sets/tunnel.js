// The shaft: a vertical borehole lined with steel ribs and strip lights, from the hatch at the top to the catch
// net at the bottom. A sagging rock variant, a collapse plug, and the capsule cabin with its porthole and panel.
import * as THREE from 'three';
import { makeSky } from '../core/sky.js';
import { steel, rock, noise2, rng, canvas, printText } from '../core/tex.js';
import { pbr, mesh, boxM, decal } from '../props/kit.js';
import { makeMotes } from './trench.js';

const R0 = 1.34, TOP = 44, BOT = -0.2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

function wallPlate(w, h, lines, opts = {}) {
  return decal(w, h, (c) => {
    const x = c.getContext('2d');
    if (opts.plate !== false) { x.fillStyle = '#e5dfd0'; x.fillRect(0, 0, c.width, c.height); x.strokeStyle = 'rgba(75,72,69,0.5)'; x.lineWidth = 8; x.strokeRect(8, 8, c.width - 16, c.height - 16); }
    lines.forEach((ln, i) => printText(c, [ln.text], { size: ln.size ?? 110, y: ln.y ?? (0.3 + i * 0.32), style: 'stencil', color: '#4b4845', seed: 600 + i + (opts.seed ?? 0), track: 2 }));
  }, { res: 1024, rough: 0.8 });
}

function panelGauge(r, title, sub, ticks = 10) {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(r * 1.08, r * 1.08, r * 0.2, 40), new THREE.MeshStandardMaterial({ color: 0x6a6258, metalness: 0.6, roughness: 0.5 }), { pos: [0, 0, -r * 0.1], rot: [Math.PI / 2, 0, 0], parent: g });
  mesh(new THREE.TorusGeometry(r * 1.02, r * 0.045, 10, 40), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.32 }), { pos: [0, 0, r * 0.02], parent: g });
  const f = decal(r * 2, r * 2, (c) => {
    const x = c.getContext('2d'), W = c.width;
    x.fillStyle = '#e8e2d3'; x.beginPath(); x.arc(W / 2, W / 2, W * 0.49, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(75,72,69,0.8)'; x.lineWidth = 5;
    for (let i = 0; i <= ticks; i++) {
      const a = Math.PI * 0.75 + i / ticks * Math.PI * 1.5, r0 = W * 0.37, r1 = W * 0.45;
      x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * r0, W / 2 + Math.sin(a) * r0); x.lineTo(W / 2 + Math.cos(a) * r1, W / 2 + Math.sin(a) * r1); x.stroke();
    }
    printText(c, [title], { size: W * 0.13, y: 0.38, style: 'slab', color: '#4b4845', seed: 620 });
    if (sub) printText(c, [sub], { size: W * 0.07, y: 0.66, style: 'slab', color: '#4b4845', seed: 621, font: 'Rockwell', weight: 'normal' });
  }, { res: 512, rough: 0.7 });
  f.position.z = r * 0.04; g.add(f);
  const needle = new THREE.Group();
  mesh(new THREE.BoxGeometry(r * 0.04, r * 0.82, r * 0.02).translate(0, r * 0.28, 0), new THREE.MeshStandardMaterial({ color: 0x4b4845, roughness: 0.5 }), { pos: [0, 0, r * 0.05], parent: needle });
  mesh(new THREE.CylinderGeometry(r * 0.06, r * 0.06, r * 0.03, 14), new THREE.MeshStandardMaterial({ color: 0x4b4845 }), { pos: [0, 0, r * 0.055], rot: [Math.PI / 2, 0, 0], parent: needle });
  g.add(needle); g.userData.needle = needle;
  return g;
}

export function buildTunnel(renderer) {
  const scene = new THREE.Scene();
  const sky = makeSky(renderer, { az: -60, el: 8, top: 0x3e6d9a, mid: 0x6a8ea8, haze: 0xc8a882, ground: 0x4a3a30, sunI: 0.6, cloud: 0, glow: 0.3 });
  scene.add(sky.dome, sky.sun, sky.sun.target); scene.environment = sky.env; scene.environmentIntensity = 0.2;
  scene.fog = new THREE.Fog(0x3a3028, 6, 46);
  const R = rng(601);
  const steelM = pbr(steel(602, { base: 0x7a6a58 }), { repeat: [8, 20], ns: 1.2, rough: 0.55, metal: 0.55 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x4b4845, metalness: 0.5, roughness: 0.55 });
  const brassM = new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.32 });
  const rockM = pbr(rock(603, { base: 0x7a6650 }), { repeat: [3, 3], ns: 1.6, rough: 0.95 });
  const glowM = new THREE.MeshStandardMaterial({ color: 0xffd8a0, emissive: 0xffb870, emissiveIntensity: 1.4, roughness: 0.5 });

  // shaft wall
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R0, R0, TOP - BOT, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x6a5c4c, map: steelM.map, roughnessMap: steelM.roughnessMap, normalMap: steelM.normalMap, metalness: 0.35, roughness: 0.8, side: THREE.BackSide }));
  wall.position.y = (TOP + BOT) / 2; wall.receiveShadow = true; scene.add(wall);
  // longitudinal ribs
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    const rib = mesh(boxM(0.07, TOP - BOT, 0.07), darkM, { pos: [Math.sin(a) * R0 * 0.99, (TOP + BOT) / 2, Math.cos(a) * R0 * 0.99], rot: [0, a, 0], parent: scene });
    rib.castShadow = false;
  }
  // rings
  const ringGeo = new THREE.TorusGeometry(R0 * 0.955, 0.042, 8, 64);
  for (let y = 0; y < TOP; y += 1.1) mesh(ringGeo, steelM, { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], parent: scene, cast: false });
  // strip lights
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + Math.PI / 4;
    const strip = mesh(boxM(0.06, TOP - 1, 0.025), glowM, { pos: [Math.sin(a) * R0 * 1.01, (TOP - 1) / 2, Math.cos(a) * R0 * 1.01], rot: [0, a, 0], parent: scene, cast: false });
    strip.material = glowM;
  }
  for (const y of [4, 12, 20, 28, 36]) {
    const l = new THREE.PointLight(0xffc890, 5.0, 9, 1.7); l.position.set(0, y, 0); scene.add(l);
  }
  scene.add(new THREE.HemisphereLight(0xffd8b0, 0x3a3028, 0.55));

  // ladder (instanced rungs)
  for (const x of [-0.26, 0.26]) mesh(boxM(0.04, TOP - 1, 0.04), darkM, { pos: [x, TOP / 2, -R0 * 0.94], parent: scene, cast: false });
  const rungGeo = new THREE.BoxGeometry(0.5, 0.035, 0.035);
  const rungs = new THREE.InstancedMesh(rungGeo, darkM, Math.floor((TOP - 1) / 0.4));
  const o = new THREE.Object3D();
  for (let i = 0; i < rungs.count; i++) { o.position.set(0, 0.4 + i * 0.4, -R0 * 0.94); o.updateMatrix(); rungs.setMatrixAt(i, o.matrix); }
  rungs.instanceMatrix.needsUpdate = true; scene.add(rungs);

  // top hatch + daylight
  const hatch = new THREE.Group(); hatch.position.y = TOP - 0.1; scene.add(hatch);
  mesh(new THREE.CylinderGeometry(R0 * 0.98, R0 * 0.98, 0.12, 48), darkM, { parent: hatch });
  mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 32), brassM, { pos: [0, -0.05, 0], rot: [Math.PI / 2, 0, 0], parent: hatch });
  const hatchDisc = mesh(new THREE.CircleGeometry(0.32, 32), new THREE.MeshStandardMaterial({ color: 0xffe1b0, emissive: 0xffd8a0, emissiveIntensity: 2.4 }), { pos: [0, -0.075, 0], rot: [Math.PI / 2, 0, 0], parent: hatch, cast: false });
  const topL = new THREE.PointLight(0xffd8a0, 14, 12, 1.7); topL.position.set(0, TOP - 0.6, 0); scene.add(topL);
  // cable down the shaft
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 6), new THREE.MeshStandardMaterial({ color: 0x3a3430, roughness: 0.6, metalness: 0.4 }));
  cable.castShadow = false; scene.add(cable);

  // bottom catch net + floor
  mesh(new THREE.CylinderGeometry(R0 * 0.98, R0 * 0.98, 0.16, 48), darkM, { pos: [0, 0, 0], parent: scene, cast: false });
  const net = new THREE.Group();
  const ropeM = new THREE.LineBasicMaterial({ color: 0xc8b490, transparent: true, opacity: 0.85 });
  for (let i = -5; i <= 5; i++) {
    const a = new THREE.Vector3(-1.2, 0, i * 0.22), b = new THREE.Vector3(1.2, 0, i * 0.22);
    net.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), ropeM));
    const c = new THREE.Vector3(i * 0.22, 0, -1.2), d = new THREE.Vector3(i * 0.22, 0, 1.2);
    net.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([c, d]), ropeM));
  }
  net.position.y = 0.85; net.scale.set(0.98, 1, 0.98); scene.add(net);
  mesh(new THREE.TorusGeometry(R0 * 0.96, 0.05, 8, 48), brassM, { pos: [0, 0.85, 0], rot: [Math.PI / 2, 0, 0], parent: scene });

  // wall markers
  const markers = [];
  const addMarker = (text, sub, y, a = 0.3, w = 0.9, h = 0.34) => {
    const p = wallPlate(w, h, [{ text, size: 110, y: 0.32 }, ...(sub ? [{ text: sub, size: 62, y: 0.7 }] : [])], { seed: markers.length * 3 });
    p.position.set(Math.sin(a) * (R0 - 0.06), y, Math.cos(a) * (R0 - 0.06)); p.rotation.y = a + Math.PI; p.rotation.z = 0.02 * (a > 1 ? -1 : 1); scene.add(p); markers.push(p); return p;
  };
  addMarker('MANTLE', '35–2,890 KM', 7.6, 0.4, 1.0, 0.36);
  addMarker('HALFWAY', '0.5 g', 16.4, 0.5, 0.95, 0.34);
  addMarker('CENTER', '0 g', 22.0, 0.3, 0.95, 0.34);
  addMarker('OUTER CORE', '2,890–5,150 KM', 30.0, 0.45, 1.0, 0.36);
  addMarker('TOP OF SHAFT', '6,371 KM', 38.4, 0.35, 0.95, 0.34);

  // speed gates
  for (const [y, label] of [[9.4, '10 M/S'], [19.2, '100 M/S'], [27.0, '8 KM/S'], [2.8, '42:12']]) {
    mesh(new THREE.TorusGeometry(1.22, 0.045, 8, 48), brassM, { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], parent: scene });
    const p = wallPlate(0.75, 0.24, [{ text: label, size: 110, y: 0.5 }], { seed: 30 + y });
    p.position.set(Math.sin(-0.7) * (R0 - 0.05), y + 0.42, Math.cos(-0.7) * (R0 - 0.05)); p.rotation.y = -0.7 + Math.PI; scene.add(p);
  }

  // the warm glow around the centre
  const coreGlow = new THREE.Group(); coreGlow.position.y = 22.0; scene.add(coreGlow);
  mesh(new THREE.TorusGeometry(R0 * 0.9, 0.09, 10, 64), new THREE.MeshStandardMaterial({ color: 0xffd8a0, emissive: 0xffc080, emissiveIntensity: 1.8 }), { pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], parent: coreGlow, cast: false });
  const glowL = new THREE.PointLight(0xffc080, 12, 7, 1.6); coreGlow.add(glowL);

  // dust motes in the shaft
  const motes = makeMotes(700, [-1.2, 0, -1.2], [1.2, 40, 1.2]); motes.material.uniforms.uSize.value = 0.0016; motes.material.uniforms.uCol.value.set(0xe8c8a0); scene.add(motes);

  // sagging rock variant
  const sag = new THREE.Group(); sag.visible = false; scene.add(sag);
  for (let k = 0; k < 28; k++) {
    const a = R() * Math.PI * 2, y = 1 + R() * 24;
    const b = mesh(new THREE.DodecahedronGeometry(0.18 + R() * 0.12, 0), rockM, { pos: [Math.sin(a) * (R0 - 0.12), y, Math.cos(a) * (R0 - 0.12)], rot: [R() * 3, R() * 3, R() * 3], parent: sag });
    b.scale.set(1 + R() * 1.8, 0.8 + R() * 1.6, 1 + R() * 1.4);
  }
  // a few narrowing ribs of rock
  for (let k = 0; k < 6; k++) {
    const y = 2 + k * 3.2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R0 * 0.9, 0.09 + R() * 0.07, 7, 40), rockM);
    ring.rotation.x = Math.PI / 2; ring.position.y = y; ring.scale.set(1 - R() * 0.08, 1, 1 - R() * 0.08); sag.add(ring);
  }
  // collapse plug
  const plug = new THREE.Group(); plug.visible = false; scene.add(plug);
  for (let k = 0; k < 26; k++) {
    const a = R() * Math.PI * 2, rr = R() * R0 * 0.9;
    const b = mesh(new THREE.DodecahedronGeometry(0.22 + R() * 0.2, 0), rockM, { pos: [Math.sin(a) * rr, 0, Math.cos(a) * rr], rot: [R() * 3, R() * 3, R() * 3], parent: plug });
    b.scale.set(1.2 + R(), 0.7 + R(), 1.2 + R());
  }
  mesh(new THREE.TorusGeometry(R0 * 0.92, 0.06, 8, 48), darkM, { pos: [0, 0.3, 0], rot: [Math.PI / 2, 0, 0], parent: plug });

  // cabin (interior mock-up)
  const cabin = new THREE.Group(); cabin.position.set(0, 10.4, 0); cabin.visible = false; scene.add(cabin);
  const cab = new THREE.MeshStandardMaterial({ color: 0xb8a98c, roughness: 0.7, metalness: 0.25 });
  const cabDark = new THREE.MeshStandardMaterial({ color: 0x5a5044, roughness: 0.8, metalness: 0.2 });
  mesh(new THREE.PlaneGeometry(2.7, 2.5), cabDark, { pos: [0, 0.1, 1.3], parent: cabin }); // behind camera
  mesh(new THREE.PlaneGeometry(2.7, 2.5), cab, { pos: [-1.35, 0.1, 0], rot: [0, Math.PI / 2, 0], parent: cabin });
  mesh(new THREE.PlaneGeometry(2.7, 2.5), cab, { pos: [1.35, 0.1, 0], rot: [0, -Math.PI / 2, 0], parent: cabin });
  mesh(new THREE.PlaneGeometry(2.7, 2.7), cabDark, { pos: [0, 1.35, 0], rot: [Math.PI / 2, 0, 0], parent: cabin });
  mesh(new THREE.PlaneGeometry(2.7, 2.7), cabDark, { pos: [0, -1.15, 0], rot: [-Math.PI / 2, 0, 0], parent: cabin });
  // front wall with a circular porthole (shape + hole)
  const frontShape = new THREE.Shape(); frontShape.moveTo(-1.35, -1.15); frontShape.lineTo(1.35, -1.15); frontShape.lineTo(1.35, 1.35); frontShape.lineTo(-1.35, 1.35); frontShape.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0.18, 0.31, 0, Math.PI * 2, true); frontShape.holes.push(hole);
  const front = new THREE.Mesh(new THREE.ShapeGeometry(frontShape, 24), cab); front.position.z = -1.2; cabin.add(front);
  mesh(new THREE.TorusGeometry(0.31, 0.035, 12, 40), brassM, { pos: [0, 0.18, -1.19], parent: cabin });
  mesh(new THREE.TorusGeometry(0.285, 0.012, 8, 40), brassM, { pos: [0, 0.18, -1.175], parent: cabin });
  // backdrop behind the porthole: warm core glow or closing rock
  const coreTex = (() => {
    const c = canvas(512, 512), x = c.getContext('2d');
    const grd = x.createRadialGradient(256, 256, 20, 256, 256, 300);
    grd.addColorStop(0, '#ffe6b8'); grd.addColorStop(0.35, '#e8b070'); grd.addColorStop(0.7, '#8a5a38'); grd.addColorStop(1, '#3a2a20');
    x.fillStyle = grd; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(255,220,170,${0.05 + Math.random() * 0.12})`; x.lineWidth = 1 + Math.random() * 4; x.beginPath(); x.arc(256, 256, 30 + i * 7, 0, Math.PI * 2); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const rockTex = (() => {
    const c = canvas(512, 512), x = c.getContext('2d');
    x.fillStyle = '#4a3a2c'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 220; i++) { const r = 8 + Math.random() * 34; x.fillStyle = `rgba(${90 + Math.random() * 50},${70 + Math.random() * 40},${50 + Math.random() * 30},0.9)`; x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const view = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: coreTex }));
  view.position.set(0, 0.18, -1.30); cabin.add(view);
  const rockView = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: rockTex }));
  rockView.position.set(0, 0.18, -1.29); rockView.visible = false; cabin.add(rockView);
  // rings rushing past the porthole
  const ringGlow = new THREE.Group(); ringGlow.position.set(0, 0.18, -1.27); cabin.add(ringGlow);
  const rush = [];
  for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.2 + i * 0.02, 0.006, 6, 32), new THREE.MeshBasicMaterial({ color: 0xffe0b0, transparent: true, opacity: 0.5 })); ringGlow.add(r); rush.push(r); }
  // instrument panel
  const panel = new THREE.Group(); panel.position.set(0, -0.55, -1.0); cabin.add(panel);
  mesh(boxM(1.5, 0.5, 0.12), cabDark, { parent: panel });
  const speedG = panelGauge(0.15, '100', 'M/S', 10); speedG.position.set(-0.36, 0.03, 0.09); panel.add(speedG);
  const gG = panelGauge(0.1, '1.0', 'g', 8); gG.position.set(0.24, 0.05, 0.09); panel.add(gG);
  const tape = decal(0.42, 0.17, (c) => {
    const x = c.getContext('2d'); x.fillStyle = '#e5dfd0'; x.fillRect(0, 0, c.width, c.height);
    printText(c, ['T+10', '100 M/S'], { size: 84, y: 0.35, style: 'slab', color: '#4b4845', seed: 631 });
  }, { res: 512, rough: 0.9 });
  tape.position.set(0.56, -0.13, 0.065); tape.rotation.z = -0.03; panel.add(tape);
  const tape2 = decal(0.42, 0.17, (c) => {
    const x = c.getContext('2d'); x.fillStyle = '#e5dfd0'; x.fillRect(0, 0, c.width, c.height);
    printText(c, ['T+19 MIN', '0.0 M/S'], { size: 84, y: 0.35, style: 'slab', color: '#4b4845', seed: 632 });
  }, { res: 512, rough: 0.9 });
  tape2.position.set(0.56, -0.13, 0.066); tape2.rotation.z = -0.03; tape2.visible = false; panel.add(tape2);
  const tape3 = decal(0.42, 0.17, (c) => {
    const x = c.getContext('2d'); x.fillStyle = '#e5dfd0'; x.fillRect(0, 0, c.width, c.height);
    printText(c, ['200 KM/H', 'TERMINAL'], { size: 84, y: 0.35, style: 'slab', color: '#4b4845', seed: 633 });
  }, { res: 512, rough: 0.9 });
  tape3.position.set(0.56, -0.13, 0.067); tape3.rotation.z = -0.03; tape3.visible = false; panel.add(tape3);
  // cracked glass overlay for D5
  const crack = decal(0.34, 0.34, (c) => {
    const x = c.getContext('2d'); x.strokeStyle = 'rgba(75,72,69,0.9)'; x.lineWidth = 3;
    for (let k = 0; k < 9; k++) { x.beginPath(); x.moveTo(256, 256); let px = 256, py = 256; for (let j = 0; j < 5; j++) { px += (Math.random() - 0.5) * 90; py += (Math.random() - 0.5) * 90; x.lineTo(px, py); } x.stroke(); }
    x.beginPath(); x.arc(256, 256, 70, 0, Math.PI * 2); x.stroke();
  }, { res: 512, rough: 0.3 });
  crack.position.set(-0.36, 0.03, 0.12); crack.visible = false; panel.add(crack);
  // seat back + pencil + a handrail
  mesh(boxM(0.7, 0.9, 0.18), new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.9 }), { pos: [0, -0.25, 0.95], parent: cabin });
  const pencil = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8), new THREE.MeshStandardMaterial({ color: 0xd8b06a, roughness: 0.7 }), { pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], parent: pencil });
  mesh(new THREE.ConeGeometry(0.008, 0.03, 8), new THREE.MeshStandardMaterial({ color: 0x4b4845, roughness: 0.9 }), { pos: [0.135, 0, 0], rot: [0, 0, -Math.PI / 2], parent: pencil });
  pencil.position.set(0.3, 0.02, -0.35); pencil.rotation.set(0.2, 0.4, 0.6); cabin.add(pencil);
  const cabLight = new THREE.PointLight(0xffd0a0, 2.2, 3.2, 1.5); cabLight.position.set(0, 0.6, 0.4); cabin.add(cabLight);

  // a wall clock near the bottom (42:12)
  const clockPlate = wallPlate(0.8, 0.34, [{ text: '42:12', size: 140, y: 0.32 }, { text: 'FALL TIME', size: 58, y: 0.72 }], { seed: 77 });
  clockPlate.position.set(Math.sin(0.2) * (R0 - 0.05), 3.6, Math.cos(0.2) * (R0 - 0.05)); clockPlate.rotation.y = 0.2 + Math.PI; scene.add(clockPlate);

  // the verdict, printed on a plate bolted to the shaft wall (D16/D17)
  const impossible = new THREE.Group(); impossible.position.set(0.15, 17.0, R0 - 0.16); impossible.rotation.y = Math.PI; scene.add(impossible);
  mesh(boxM(1.18, 0.46, 0.035), new THREE.MeshStandardMaterial({ color: 0x5a544c, metalness: 0.5, roughness: 0.6 }), { pos: [0, 0, -0.02], parent: impossible });
  const impDecal = wallPlate(1.12, 0.42, [{ text: 'IMPOSSIBLE', size: 100, y: 0.36 }, { text: 'A TUNNEL THROUGH THE EARTH', size: 46, y: 0.76 }], { seed: 88 });
  impDecal.position.z = 0.002; impossible.add(impDecal);

  return {
    name: 'tunnel', scene, sky, R0, TOP, BOT, cable, hatch, hatchDisc, topL, net, sag, plug, cabin, view, rockView, ringGlow, rush, panel, speedG, gG, tape, tape2, tape3, crack, pencil, coreGlow, markers, motes, clockPlate, impossible,
    reset() { clockPlate.position.set(Math.sin(0.2) * (R0 - 0.05), 3.6, Math.cos(0.2) * (R0 - 0.05)); clockPlate.rotation.set(0, 0.2 + Math.PI, 0); sag.visible = false; plug.visible = false; cabin.visible = false; view.visible = true; rockView.visible = false; crack.visible = false; impossible.visible = true; impossible.position.set(0.15, 17.0, R0 - 0.16); pencil.position.set(0.3, 0.02, -0.35); pencil.rotation.set(0.2, 0.4, 0.6); rush.forEach((r) => { r.material.opacity = 0.5; }); markers.forEach((m) => { m.visible = true; }); taperSet(tape, tape2, 0); tape3.visible = false; },
    setCable(y) { cable.position.set(0, (y + 1.06 + TOP - 0.15) / 2, 0); cable.scale.y = Math.max(0.02, TOP - 0.15 - (y + 1.06)); },
    update(t) { motes.material.uniforms.uTime.value = t; for (let i = 0; i < rush.length; i++) { const u = ((t * 1.5 + i * 0.25) % 1); rush[i].position.y = -0.3 + u * 0.6; rush[i].material.opacity = 0.5 * (1 - u); rush[i].scale.setScalar(0.6 + u * 1.4); } },
  };
}
function taperSet(a, b, which) { a.visible = which === 0; b.visible = which === 1; }
