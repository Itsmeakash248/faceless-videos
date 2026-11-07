// The inner core: a vast iron sphere in warm haze, cracked and glowing, with a bore through it, a giant pressure
// gauge and a temperature probe.
import * as THREE from 'three';
import { makeSky } from '../core/sky.js';
import { rock, steel, noise2, rng, canvas, printText } from '../core/tex.js';
import { pbr, mesh, boxM, decal } from '../props/kit.js';
import { makeGlobe } from '../props/globe.js';
import { makeMotes } from './trench.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const RCore = 4.2, CY = 4.2;

function bigGauge(r, title, sub, ticks = 12) {
  const g = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0x9a7c4a, metalness: 0.85, roughness: 0.38 });
  const caseM = new THREE.MeshStandardMaterial({ color: 0x5a4e42, metalness: 0.6, roughness: 0.55 });
  mesh(new THREE.CylinderGeometry(r * 1.06, r * 1.06, r * 0.34, 64), caseM, { pos: [0, 0, -r * 0.15], rot: [Math.PI / 2, 0, 0], parent: g });
  mesh(new THREE.TorusGeometry(r * 1.01, r * 0.05, 12, 64), brass, { pos: [0, 0, r * 0.025], parent: g });
  const face = decal(r * 2, r * 2, (c) => {
    const x = c.getContext('2d'), W = c.width;
    x.fillStyle = '#e8e0cc'; x.beginPath(); x.arc(W / 2, W / 2, W * 0.49, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(75,72,69,0.85)'; x.lineWidth = 6;
    for (let i = 0; i <= ticks; i++) {
      const a = Math.PI * 0.75 + i / ticks * Math.PI * 1.5, r0 = W * (i % 3 === 0 ? 0.33 : 0.38), r1 = W * 0.45;
      x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * r0, W / 2 + Math.sin(a) * r0); x.lineTo(W / 2 + Math.cos(a) * r1, W / 2 + Math.sin(a) * r1); x.stroke();
    }
    printText(c, [title], { size: W * 0.12, y: 0.4, style: 'slab', color: '#4b4845', seed: 801, track: 1 });
    printText(c, [sub], { size: W * 0.06, y: 0.63, style: 'slab', color: '#4b4845', seed: 802, font: 'Rockwell', weight: 'normal' });
    printText(c, ['PRESSURE'], { size: W * 0.045, y: 0.19, style: 'slab', color: '#4b4845', seed: 803, font: 'Rockwell', weight: 'normal', track: 4 });
  }, { res: 768, rough: 0.8 });
  face.position.z = r * 0.05; g.add(face);
  const needle = new THREE.Group();
  mesh(new THREE.BoxGeometry(r * 0.028, r * 0.86, r * 0.02).translate(0, r * 0.3, 0), new THREE.MeshStandardMaterial({ color: 0x4b4845, roughness: 0.5 }), { pos: [0, 0, r * 0.07], parent: needle });
  mesh(new THREE.CylinderGeometry(r * 0.055, r * 0.055, r * 0.035, 16), new THREE.MeshStandardMaterial({ color: 0x4b4845 }), { pos: [0, 0, r * 0.075], rot: [Math.PI / 2, 0, 0], parent: needle });
  needle.rotation.z = -1.05; g.add(needle);
  g.userData.needle = needle;
  return g;
}

export function buildCore(renderer) {
  const scene = new THREE.Scene();
  const sky = makeSky(renderer, { az: -68, el: 8, top: 0x7a5a44, mid: 0xb07a52, haze: 0xf0bc80, ground: 0x4a3428, sunI: 4.2, sunCol: 0xffb070, cloud: 0, glow: 1.3, groundBounce: 0.7 });
  scene.add(sky.dome, sky.sun, sky.sun.target); scene.environment = sky.env; scene.environmentIntensity = 0.45;
  scene.fog = new THREE.Fog(0x5a4030, 8, 40);
  const R = rng(801);

  // the iron sphere
  const globe = makeGlobe(RCore, { labels: false, iron: true, yaw: -0.2, pitch: 0.02 });
  globe.group.position.set(0, CY, 0); scene.add(globe.group);
  globe.tunnel.scale.set(3.2, 1, 3.2);
  // enlarge the bore line a little and add a hot rim
  const bore = globe.tunnel.children[1]; if (bore) bore.scale.set(2.2, 1, 2.2);
  const mouthGlow = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 10, 48), new THREE.MeshStandardMaterial({ color: 0xffd8a0, emissive: 0xffb060, emissiveIntensity: 2.2 }), {});
  mouthGlow.position.set(0, CY + RCore + 0.01, 0.03); mouthGlow.rotation.x = Math.PI / 2; scene.add(mouthGlow);
  const mouthGlow2 = mouthGlow.clone(); mouthGlow2.position.y = CY - RCore - 0.01; scene.add(mouthGlow2);
  // surface texture on the shell
  globe.shell.material.map = pbr(rock(802, { base: 0x6a5a4c }), { repeat: [6, 4] }).map;
  globe.shell.material.normalMap = pbr(rock(803, { base: 0x6a5a4c }), { repeat: [6, 4] }).normalMap;
  globe.shell.material.normalScale.set(1.6, 1.6); globe.shell.material.color.set(0x9a8a76); globe.shell.material.roughness = 0.72; globe.shell.material.metalness = 0.45;

  // glowing cracks on the shell
  const crackM = new THREE.MeshStandardMaterial({ color: 0xffd8a0, emissive: 0xffb060, emissiveIntensity: 2.4, roughness: 0.6 });
  const cracks = [];
  for (let i = 0; i < 16; i++) {
    const rad = (0.55 + R() * 0.42) * RCore, y = (R() - 0.5) * 1.7 * RCore * 0.5;
    const arc = 0.25 + R() * 0.8;
    const m = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.012 + R() * 0.012, 6, 48, arc), crackM);
    m.position.set(0, CY + y, 0); m.rotation.set(Math.PI / 2 + (R() - 0.5) * 0.5, R() * Math.PI * 2, R() * 0.6); scene.add(m); cracks.push(m);
  }

  // heat shimmer plane
  const shimmer = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`uniform float uTime; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){
        float f = n(vec2(vUv.x * 14.0, vUv.y * 9.0 - uTime * 0.9)) * 0.6 + n(vec2(vUv.x * 31.0 + 5.0, vUv.y * 21.0 - uTime * 1.5)) * 0.4;
        float a = smoothstep(0.52, 0.86, f) * 0.055 * smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
        gl_FragColor = vec4(vec3(1.0, 0.78, 0.5), a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
  shimmer.position.set(0, 5.0, 3.2); scene.add(shimmer);

  // pressure gauge on a steel frame
  const frame = new THREE.Group(); frame.position.set(1.7, 0, 2.6); scene.add(frame);
  const steelM = pbr(steel(804, { base: 0x6a5a4c }), { repeat: [2, 2], rough: 0.5, metal: 0.6 });
  mesh(boxM(0.12, 1.7, 0.12), steelM, { pos: [0, 0.85, 0], parent: frame });
  mesh(boxM(0.12, 1.7, 0.12), steelM, { pos: [-0.7, 0.85, 0], parent: frame });
  mesh(boxM(0.95, 0.1, 0.14), steelM, { pos: [-0.35, 1.7, 0], parent: frame });
  const gauge = bigGauge(0.48, '3.6', 'MILLION ATM'); gauge.position.set(-0.35, 1.42, 0.08); frame.add(gauge);
  // pipe from the gauge into the sphere
  mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.5, 16), steelM, { pos: [-0.35, 0.55, 0.9], rot: [Math.PI / 2 + 0.35, 0, 0], parent: frame });
  mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 20), new THREE.MeshStandardMaterial({ color: 0x9a7c4a, metalness: 0.85, roughness: 0.38 }), { pos: [-0.35, 0.12, 1.0], rot: [Math.PI / 2 + 0.35, 0, 0], parent: frame });

  // temperature probe
  const probe = new THREE.Group(); probe.position.set(-1.7, 0, 2.55); scene.add(probe);
  mesh(boxM(0.1, 1.9, 0.1), steelM, { pos: [0, 0.95, 0], parent: probe });
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 12), steelM, { pos: [0, 1.55, -0.45], rot: [-0.9, 0, 0], parent: probe });
  const probeTag = decal(0.58, 0.21, (c) => {
    c.getContext('2d').fillStyle = '#e5dfd0'; c.getContext('2d').fillRect(0, 0, c.width, c.height);
    printText(c, ['5,400 °C'], { size: 130, y: 0.34, style: 'slab', color: '#4b4845', seed: 811 });
    printText(c, ['PROBE · INNER CORE'], { size: 52, y: 0.74, style: 'slab', color: '#4b4845', seed: 812, font: 'Rockwell', weight: 'normal' });
  }, { res: 1024, rough: 0.8 });
  mesh(boxM(0.44, 0.03, 0.03), steelM, { pos: [0.2, 1.15, 0.04], parent: probe });
  probeTag.position.set(0.42, 1.15, 0.062); probe.add(probeTag);

  // warm lights + dust
  const l1 = new THREE.PointLight(0xffb070, 24, 20, 1.5); l1.position.set(-5, 3, 4); scene.add(l1);
  const l2 = new THREE.PointLight(0xffd8a0, 18, 18, 1.5); l2.position.set(4, 6, 2); scene.add(l2);
  const motes = makeMotes(800, [-4, 0, 0], [4, 9, 4]); motes.material.uniforms.uSize.value = 0.002; motes.material.uniforms.uCol.value.set(0xffc888); scene.add(motes);
  scene.add(new THREE.HemisphereLight(0xffc890, 0x4a3428, 0.55));

  return {
    name: 'core', scene, sky, globe, gauge, needle: gauge.userData.needle, probe, shimmer, mouthGlow, mouthGlow2, cracks, motes, RCore, CY,
    reset() { globe.group.rotation.y = -0.2; },
    update(t) {
      shimmer.material.uniforms.uTime.value = t;
      motes.material.uniforms.uTime.value = t;
      const f = 0.9 + 0.1 * Math.sin(t * 2.1) + 0.05 * Math.sin(t * 5.7);
      l1.intensity = 24 * f; mouthGlow.material.emissiveIntensity = 2.0 + 0.5 * f;
    },
  };
}
