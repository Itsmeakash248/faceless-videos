// The antipode station: a small steel platform in the Southern Ocean at sunrise, a riser pipe, a gantry and
// catch net, the worker, icebergs and a warm sea.
import * as THREE from 'three';
import { makeSky } from '../core/sky.js';
import { steel, timber, noise2, rng, canvas, printText } from '../core/tex.js';
import { pbr, mesh, boxM, decal } from '../props/kit.js';
import { makeHat } from '../props/hats.js';
import { makeMotes } from './trench.js';

const DECK = 2.5;

export function buildFar(renderer, cast) {
  const scene = new THREE.Scene();
  const sky = makeSky(renderer, { az: -96, el: 7, top: 0x4a86c8, mid: 0x98c0e4, haze: 0xf7d2a6, ground: 0x7a7a72, sunI: 4.8, sunCol: 0xffb87a, cloud: 0.55, glow: 1.4, groundBounce: 0.5 });
  scene.add(sky.dome, sky.sun, sky.sun.target); scene.environment = sky.env; scene.environmentIntensity = 0.5;
  scene.fog = new THREE.Fog(0xf0d0ac, 80, 620);
  const R = rng(901);

  // sea: a big low-poly plane with a warm reflective shader
  const seaUni = {
    uTime: { value: 0 }, uSun: { value: sky.sunDir.clone() }, uSunCol: { value: new THREE.Color(0xffc48a) },
    uDeep: { value: new THREE.Color(0x4a5450) }, uShallow: { value: new THREE.Color(0x7a8278) }, uSky: { value: new THREE.Color(0xd8c0a0) },
  };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(700, 700, 180, 180), new THREE.ShaderMaterial({
    uniforms: seaUni,
    vertexShader: /* glsl */`uniform float uTime; varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 p = position;
        float w = 0.22 * sin(p.x * 0.09 + uTime * 0.55) + 0.16 * sin(p.y * 0.13 - uTime * 0.7) + 0.09 * sin((p.x + p.y) * 0.22 + uTime * 1.1);
        p.z += w;
        float dx = 0.22 * 0.09 * cos(p.x * 0.09 + uTime * 0.55) + 0.09 * 0.22 * cos((p.x + p.y) * 0.22 + uTime * 1.1);
        float dy = 0.16 * 0.13 * cos(p.y * 0.13 - uTime * 0.7) + 0.09 * 0.22 * cos((p.x + p.y) * 0.22 + uTime * 1.1);
        vN = normalize(vec3(-dx, 1.0, -dy));
        vec4 w4 = modelMatrix * vec4(p, 1.0); vW = w4.xyz;
        gl_Position = projectionMatrix * viewMatrix * w4;
      }`,
    fragmentShader: /* glsl */`uniform float uTime; uniform vec3 uSun, uSunCol, uDeep, uShallow, uSky; varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vW);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 col = mix(uDeep, uShallow, smoothstep(0.0, 0.6, n.y));
        col = mix(col, uSky, fres * 0.55);
        vec3 r = reflect(-uSun, n);
        float spec = pow(max(dot(r, v), 0.0), 90.0);
        float glit = pow(max(dot(r, v), 0.0), 8.0) * 0.18;
        col += uSunCol * (spec * 1.4 + glit);
        col *= 0.95;
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.DoubleSide,
  }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = 0; scene.add(sea);

  // icebergs
  const iceM = new THREE.MeshStandardMaterial({ color: 0xe8e0d2, roughness: 0.72, metalness: 0.02 });
  for (let i = 0; i < 9; i++) {
    const a = -0.9 + R() * 2.4, r = 45 + R() * 160;
    const g = new THREE.IcosahedronGeometry(4 + R() * 8, 1); const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k); p.setXYZ(k, x * (0.7 + 0.5 * R()), y * (0.5 + 0.6 * R()), z * (0.7 + 0.5 * R())); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, iceM); m.position.set(Math.sin(a) * r, 0.4 + R() * 1.6, -Math.cos(a) * r); m.rotation.set(0, R() * 6, (R() - 0.5) * 0.2); m.scale.set(1, 0.7 + R() * 0.6, 1); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  }
  // a low ice shelf at the horizon
  for (let i = 0; i < 7; i++) { const a = -1.5 + i * 0.4; const r = 260 + R() * 40; const m = new THREE.Mesh(new THREE.BoxGeometry(40 + R() * 30, 3 + R() * 3, 10), iceM); m.position.set(Math.sin(a) * r, 0.3, -Math.cos(a) * r); m.rotation.y = -a; scene.add(m); }

  // platform
  const steelM = pbr(steel(902, { base: 0x7a6a58, rivets: 5 }), { repeat: [3, 3], rough: 0.6, metal: 0.5 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x4b4845, metalness: 0.45, roughness: 0.62 });
  const woodM = pbr(timber(903, { boards: 3, base: 0x8b5b3b, grey: 0.2 }), { repeat: [1, 1], ns: 0.8 });
  const plat = new THREE.Group(); plat.position.set(0, 0, 0); scene.add(plat);
  mesh(boxM(7.2, 0.22, 7.2), steelM, { pos: [0, DECK, 0], parent: plat });
  // deck plating seams
  for (let i = -3; i <= 3; i++) mesh(boxM(0.02, 0.01, 7.0), darkM, { pos: [i * 1.0, DECK + 0.116, 0], parent: plat, cast: false });
  for (const [x, z] of [[-3, -3], [3, -3], [3, 3], [-3, 3]]) {
    mesh(new THREE.CylinderGeometry(0.28, 0.32, 9, 16), steelM, { pos: [x, DECK - 4.6, z], parent: plat });
    for (const y of [-1.4, -4.2]) mesh(boxM(6.0, 0.16, 0.16), steelM, { pos: [0, y, z], parent: plat });
  }
  mesh(boxM(7.2, 0.5, 0.18), steelM, { pos: [0, DECK - 0.2, 3.6], parent: plat });
  // railing
  for (let x = -3.4; x <= 3.4; x += 0.85) mesh(boxM(0.05, 1.0, 0.05), darkM, { pos: [x, DECK + 0.62, 3.4], parent: plat });
  mesh(boxM(7.0, 0.05, 0.05), darkM, { pos: [0, DECK + 1.12, 3.4], parent: plat });
  mesh(boxM(7.0, 0.04, 0.04), darkM, { pos: [0, DECK + 0.62, 3.4], parent: plat });
  for (const z of [-3.4, 3.4]) { mesh(boxM(0.05, 1.0, 0.05), darkM, { pos: [-3.4, DECK + 0.62, z], parent: plat }); }
  mesh(boxM(0.05, 1.12, 6.8), darkM, { pos: [-3.4, DECK + 0.62, 0], parent: plat, cast: false });
  // winch + gantry
  const winch = new THREE.Group(); winch.position.set(-2.3, DECK, -1.2); scene.add(winch);
  mesh(boxM(1.0, 0.5, 0.8), darkM, { pos: [0, 0.25, 0], parent: winch });
  mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.8, 20), steelM, { pos: [0, 0.55, 0], rot: [0, 0, Math.PI / 2], parent: winch });
  mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.35 }), { pos: [0.48, 0.55, 0], rot: [0, 0, Math.PI / 2], parent: winch });
  const gantry = new THREE.Group(); gantry.position.set(0, DECK, 0); scene.add(gantry);
  for (const x of [-2.2, 2.2]) { mesh(boxM(0.16, 3.6, 0.16), steelM, { pos: [x, 1.8, -1.6], parent: gantry }); mesh(boxM(0.1, 0.1, 2.0), steelM, { pos: [x, 3.55, -0.6], rot: [0.5, 0, 0], parent: gantry }); }
  mesh(boxM(4.6, 0.14, 0.14), steelM, { pos: [0, 3.6, -1.6], parent: gantry });
  mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 20), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.35 }), { pos: [0, 3.45, -1.6], parent: gantry });
  // riser pipe with hatch
  const riser = new THREE.Group(); riser.position.set(1.15, DECK, 0.15); scene.add(riser);
  mesh(new THREE.CylinderGeometry(0.66, 0.7, 1.5, 32), steelM, { pos: [0, 0.75, 0], parent: riser });
  mesh(new THREE.TorusGeometry(0.68, 0.06, 10, 32), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.35 }), { pos: [0, 1.5, 0], rot: [Math.PI / 2, 0, 0], parent: riser });
  const lid = mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x7a6a58, metalness: 0.6, roughness: 0.5 }), { pos: [-1.4, 0.14, 0.55], rot: [0, 0, 0.35], parent: riser });
  void lid;
  const riserTag = decal(1.1, 0.24, (c) => {
    c.getContext('2d').fillStyle = '#e5dfd0'; c.getContext('2d').fillRect(0, 0, c.width, c.height);
    printText(c, ['ANTIPODE STATION'], { size: 84, style: 'stencil', color: '#4b4845', seed: 911, track: 2 });
    printText(c, ['65° SOUTH · 6,371 KM'], { size: 46, y: 0.72, style: 'stencil', color: '#4b4845', seed: 912 });
  }, { res: 1024, rough: 0.8 });
  riserTag.position.set(0, 0.7, 0.71); riser.add(riserTag);

  // catch net under the gantry
  const net = new THREE.Group(); net.position.set(0, DECK + 1.05, -0.85); scene.add(net);
  const ropeM = new THREE.LineBasicMaterial({ color: 0xc8b490, transparent: true, opacity: 0.9 });
  const NP = 9, NS = 8;
  const surf = (u, v) => { const a = u * Math.PI * 2, r = v * 0.84; return new THREE.Vector3(Math.cos(a) * r, -0.42 * v * v, Math.sin(a) * r); };
  for (let i = 0; i < NP; i++) { const pts = []; for (let j = 0; j <= NS; j++) pts.push(surf(i / NP, j / NS)); net.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ropeM)); }
  for (let j = 1; j <= NS; j++) { const pts = []; for (let i = 0; i <= NP; i++) pts.push(surf(i / NP, j / NS)); net.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ropeM)); }
  mesh(new THREE.TorusGeometry(0.84, 0.025, 8, 48), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.82, roughness: 0.36 }), { pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], parent: net });
  // net suspension ropes
  const ropeMat = new THREE.LineBasicMaterial({ color: 0x3a3430 });
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + Math.PI / 4;
    const p0 = new THREE.Vector3(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8).add(net.position);
    const p1 = new THREE.Vector3(0, DECK + 3.45, -1.6);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p0, p1]), ropeMat));
  }
  const pulley = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 20), new THREE.MeshStandardMaterial({ color: 0xa48a5a, metalness: 0.85, roughness: 0.35 }));
  pulley.position.set(0, DECK + 3.45, -1.6); scene.add(pulley);
  // cable from pulley to winch
  const cableM = new THREE.LineBasicMaterial({ color: 0x3a3430 });
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, DECK + 3.6, -1.6), new THREE.Vector3(-2.3, DECK + 0.6, -1.2)]), cableM));

  // worker
  const worker = cast.worker; scene.add(worker.group);
  const hat = makeHat('hardhat'); scene.add(hat.group); hat.group.visible = false;
  worker.group.position.set(1.4, DECK + 0.12, 2.2);

  // spray + motes
  const motes = makeMotes(500, [-6, 2, -6], [6, 9, 6]); motes.material.uniforms.uSize.value = 0.0018; motes.material.uniforms.uCol.value.set(0xffe0b8); scene.add(motes);
  scene.add(new THREE.HemisphereLight(0xe8eef4, 0x7a7a72, 0.5));

  return {
    name: 'far', scene, sky, plat, sea, seaUni, winch, gantry, riser, net, worker, hat, motes, DECK,
    reset() { worker.reset(); },
    update(t) { seaUni.uTime.value = t; motes.material.uniforms.uTime.value = t; },
  };
}
