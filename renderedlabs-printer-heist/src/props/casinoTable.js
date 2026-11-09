// Procedural 3D Manila VIP Casino Roulette Table & Chip Stacks (Built from scratch)
import * as THREE from 'three';

export function createCasinoTable() {
  const root = new THREE.Group();
  root.name = 'ManilaCasinoSet';

  // Materials
  const matMahogany = new THREE.MeshStandardMaterial({
    color: 0x3d1b0c,
    roughness: 0.25,
    metalness: 0.1,
  });
  const matFeltGreen = new THREE.MeshStandardMaterial({
    color: 0x0d4722,
    roughness: 0.85,
    metalness: 0.02,
  });
  const matBrass = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.85,
  });
  const matWheelCenter = new THREE.MeshStandardMaterial({
    color: 0x1f2428,
    roughness: 0.3,
    metalness: 0.7,
  });

  // 1. Table Top (Mahogany Beveled Oval Rim + Green Felt)
  const rimGeom = new THREE.CylinderGeometry(1.4, 1.45, 0.08, 48);
  const rimMesh = new THREE.Mesh(rimGeom, matMahogany);
  rimMesh.position.y = 0.76;
  rimMesh.castShadow = true;
  root.add(rimMesh);

  const feltGeom = new THREE.CylinderGeometry(1.36, 1.36, 0.082, 48);
  const feltMesh = new THREE.Mesh(feltGeom, matFeltGreen);
  feltMesh.position.y = 0.762;
  feltMesh.receiveShadow = true;
  root.add(feltMesh);

  // 2. Roulette Wheel Basin (Radius = 0.55m)
  const wheelBasin = new THREE.Group();
  wheelBasin.position.set(-0.55, 0.81, 0);
  root.add(wheelBasin);

  // Outer Brass Track
  const brassTrack = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.03, 16, 48), matBrass);
  brassTrack.rotation.x = Math.PI / 2;
  wheelBasin.add(brassTrack);

  // Inner Rotating Wheel Turret
  const wheelRotor = new THREE.Group();
  wheelBasin.add(wheelRotor);

  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.10, 36), matMahogany);
  cone.position.y = -0.04;
  cone.rotation.x = Math.PI;
  wheelRotor.add(cone);

  // Numbered Frets Rim (alternating Red / Black pockets)
  const pocketCount = 37;
  for (let i = 0; i < pocketCount; i++) {
    const ang = (i / pocketCount) * Math.PI * 2;
    const isZero = i === 0;
    const isRed = !isZero && (i % 2 === 1);
    const col = isZero ? 0x008822 : (isRed ? 0xaa1111 : 0x111111);
    const fretMat = new THREE.MeshBasicMaterial({ color: col });
    const fret = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.008, 0.05), fretMat);
    fret.position.set(Math.cos(ang) * 0.40, -0.01, Math.sin(ang) * 0.40);
    fret.rotation.y = -ang;
    wheelRotor.add(fret);
  }

  // Brass Spindle / Center Turret
  const centerSpindle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.12, 16), matBrass);
  centerSpindle.position.y = 0.04;
  wheelRotor.add(centerSpindle);

  // Ivory Roulette Ball
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 16), ballMat);
  ballMesh.position.set(0.48, 0.02, 0);
  wheelBasin.add(ballMesh);

  // 3. High-Roller Casino Chip Stacks
  const chipGroup = new THREE.Group();
  chipGroup.position.set(0.45, 0.81, 0);
  root.add(chipGroup);

  const chipGeom = new THREE.CylinderGeometry(0.032, 0.032, 0.007, 24);
  const matChipBurgundy = new THREE.MeshStandardMaterial({ color: 0x880e4f, roughness: 0.4, metalness: 0.1 }); // $25,000
  const matChipGold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.6 });     // $10,000
  const matChipCobalt = new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.4, metalness: 0.2 });   // $5,000

  const stacks = [];
  function createChipStack(x, z, height, mat) {
    const stack = new THREE.Group();
    stack.position.set(x, 0, z);
    for (let c = 0; c < height; c++) {
      const chip = new THREE.Mesh(chipGeom, mat);
      chip.position.y = c * 0.0072 + 0.0036;
      chip.rotation.y = (c * 1.37) % (Math.PI * 2);
      chip.castShadow = true;
      stack.add(chip);
    }
    chipGroup.add(stack);
    stacks.push(stack);
    return stack;
  }

  // Create pyramid array of chip stacks totaling $81 Million
  const chipColors = [matChipBurgundy, matChipGold, matChipCobalt];
  for (let row = -2; row <= 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const dist = Math.hypot(row, col);
      if (dist < 2.5) {
        const h = Math.floor(12 + Math.sin(row * 3 + col * 2) * 6);
        const mat = chipColors[Math.abs(row + col) % 3];
        createChipStack(row * 0.08, col * 0.08, h, mat);
      }
    }
  }

  // 4. Croupier Chip Rake
  const rake = new THREE.Group();
  rake.position.set(0.9, 0.83, 0.2);
  root.add(rake);

  const rakePole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.9, 12), matMahogany);
  rakePole.rotation.z = Math.PI / 2.8;
  rakePole.position.set(0.3, 0.12, 0);
  rake.add(rakePole);

  const rakeHead = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.28), matBrass);
  rakeHead.position.set(-0.05, 0.02, 0);
  rake.add(rakeHead);

  // 5. Digital Floating Amount Display ($81,001,662.12 -> Cashed)
  const cashCanvas = document.createElement('canvas');
  cashCanvas.width = 512;
  cashCanvas.height = 160;
  const cctx = cashCanvas.getContext('2d');
  cctx.fillStyle = '#081018';
  cctx.fillRect(0, 0, 512, 160);
  cctx.strokeStyle = '#d4af37';
  cctx.lineWidth = 4;
  cctx.strokeRect(6, 6, 500, 148);

  cctx.fillStyle = '#d4af37';
  cctx.font = 'bold 22px monospace';
  cctx.textAlign = 'center';
  cctx.fillText('MANILA VIP CASINO JUNKETS', 256, 42);

  cctx.fillStyle = '#ffffff';
  cctx.font = 'bold 36px monospace';
  cctx.fillText('$81,001,662.12', 256, 92);

  cctx.fillStyle = '#ef4444';
  cctx.font = 'bold 18px monospace';
  cctx.fillText('CONVERTED TO UNREGULATED CASH', 256, 130);

  const cashTex = new THREE.CanvasTexture(cashCanvas);
  const cashSign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.25), new THREE.MeshBasicMaterial({ map: cashTex, transparent: true }));
  cashSign.position.set(0.45, 1.25, 0);
  cashSign.rotation.y = -0.3;
  root.add(cashSign);

  return {
    group: root,
    animate(t, rakeProgress = 0) {
      // Spin roulette wheel and ball
      wheelRotor.rotation.y = t * 1.8;
      const ballAng = -t * 4.2;
      ballMesh.position.set(Math.cos(ballAng) * 0.48, 0.02, Math.sin(ballAng) * 0.48);

      // Animate rake sweeping chips
      const r = Math.min(1, Math.max(0, rakeProgress));
      rake.position.x = THREE.MathUtils.lerp(0.9, 0.35, r);

      // Scatter / sweep chips as rake advances
      if (r > 0.3) {
        stacks.forEach((s, idx) => {
          if (s.position.x > rake.position.x - 0.45) {
            s.position.x += (Math.sin(idx * 4) * 0.005) * r;
            s.position.z += (Math.cos(idx * 3) * 0.005) * r;
          }
        });
      }
    }
  };
}
