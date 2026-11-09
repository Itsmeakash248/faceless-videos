// Procedural 3D Environment: Bangladesh Bank Dealing Room (Motijheel, Dhaka)
import * as THREE from 'three';

export function createDealingRoom() {
  const room = new THREE.Group();
  room.name = 'DealingRoom';

  // Materials
  const matFloor = new THREE.MeshStandardMaterial({
    color: 0x2a2e34,
    roughness: 0.35,
    metalness: 0.1,
  });
  const matWall = new THREE.MeshStandardMaterial({
    color: 0xd8d4cb,
    roughness: 0.75,
    metalness: 0.05,
  });
  const matWood = new THREE.MeshStandardMaterial({
    color: 0x4a2e1d,
    roughness: 0.45,
    metalness: 0.05,
  });
  const matDeskTop = new THREE.MeshStandardMaterial({
    color: 0x828a94,
    roughness: 0.5,
    metalness: 0.15,
  });
  const matMetalLegs = new THREE.MeshStandardMaterial({
    color: 0x1a1d22,
    roughness: 0.3,
    metalness: 0.8,
  });

  // 1. Floor (8m x 8m)
  const floorGeom = new THREE.PlaneGeometry(10, 10);
  const floorMesh = new THREE.Mesh(floorGeom, matFloor);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  room.add(floorMesh);

  // 2. Walls
  // Back Wall
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.5), matWall);
  backWall.position.set(0, 1.75, -4);
  backWall.receiveShadow = true;
  room.add(backWall);

  // Wood wainscoting on back wall
  const wainscot = new THREE.Mesh(new THREE.BoxGeometry(10, 0.9, 0.04), matWood);
  wainscot.position.set(0, 0.45, -3.98);
  room.add(wainscot);

  // Left Wall with large window
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.5), matWall);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-4, 1.75, 0);
  room.add(leftWall);

  // Window frame & Dhaka morning sky view
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 3.2), matMetalLegs);
  winFrame.position.set(-3.95, 2.0, -1.0);
  room.add(winFrame);

  // Window glass with warm morning glow
  const winGlassMat = new THREE.MeshBasicMaterial({
    color: 0xffdfaa,
    transparent: true,
    opacity: 0.75,
  });
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.9), winGlassMat);
  winGlass.rotation.y = Math.PI / 2;
  winGlass.position.set(-3.94, 2.0, -1.0);
  room.add(winGlass);

  // 3. Ceiling with Troffer Lights
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 3.5;
  room.add(ceiling);

  // Recessed Troffer Light fixtures
  const matTroffer = new THREE.MeshBasicMaterial({ color: 0xf4faff });
  for (let x = -2; x <= 2; x += 2) {
    for (let z = -2; z <= 2; z += 2) {
      const troffer = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), matTroffer);
      troffer.rotation.x = Math.PI / 2;
      troffer.position.set(x, 3.49, z);
      room.add(troffer);
    }
  }

  // 4. Main Dealing Desk Setup
  const desk = new THREE.Group();
  desk.position.set(0, 0, -1.5);
  room.add(desk);

  // Desktop (W=2.2m, D=0.9m, H=0.04m, Y=0.74m)
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.9), matDeskTop);
  deskTop.position.y = 0.74;
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  desk.add(deskTop);

  // Desk Metal Frame & Legs
  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.05), matMetalLegs);
  leg1.position.set(-1.05, 0.36, -0.4);
  const leg2 = leg1.clone(); leg2.position.set(1.05, 0.36, -0.4);
  const leg3 = leg1.clone(); leg3.position.set(-1.05, 0.36, 0.4);
  const leg4 = leg1.clone(); leg4.position.set(1.05, 0.36, 0.4);
  desk.add(leg1, leg2, leg3, leg4);

  // 5. Dual Monitors Setup on Desk
  function createMonitor(text1, text2, alert = false) {
    const mon = new THREE.Group();
    // Stand
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, 0.015, 16), matMetalLegs);
    standBase.position.y = 0.76;
    const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 12), matMetalLegs);
    standPole.position.y = 0.87;
    mon.add(standBase, standPole);

    // Bezel
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 0.02), matMetalLegs);
    bezel.position.set(0, 0.98, 0);
    bezel.castShadow = true;
    mon.add(bezel);

    // Screen Texture
    const scCanvas = document.createElement('canvas');
    scCanvas.width = 512;
    scCanvas.height = 320;
    const ctx = scCanvas.getContext('2d');
    ctx.fillStyle = alert ? '#1a0606' : '#0a1018';
    ctx.fillRect(0, 0, 512, 320);

    // UI Header
    ctx.fillStyle = alert ? '#8b1c1c' : '#1e385c';
    ctx.fillRect(0, 0, 512, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('SWIFT ALLIANCE ACCESS - BBANKBDDHA', 14, 25);

    // Terminal Text Lines
    ctx.fillStyle = alert ? '#ff6666' : '#45d482';
    ctx.font = '15px monospace';
    ctx.fillText(text1, 20, 75);
    ctx.fillText(text2, 20, 105);

    // Draw Mock Data grid
    ctx.strokeStyle = '#22384a';
    ctx.lineWidth = 1;
    for (let r = 0; r < 5; r++) {
      ctx.strokeRect(20, 130 + r * 32, 472, 28);
      ctx.fillStyle = '#8ca8c4';
      ctx.font = '13px monospace';
      ctx.fillText(`MT103  REQ_${1040 + r}  NY-FED  $${(Math.random() * 50 + 10).toFixed(1)}M`, 30, 150 + r * 32);
    }

    const tex = new THREE.CanvasTexture(scCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: tex });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.31), screenMat);
    screenMesh.position.set(0, 0.98, 0.011);
    mon.add(screenMesh);

    return mon;
  }

  const monLeft = createMonitor('SESSION ACTIVE: 2016-02-05 03:59:12 UTC', 'TERMINAL 01 // OPERATOR: OVERNIGHT', false);
  monLeft.position.set(-0.35, 0, 0);
  monLeft.rotation.y = 0.12;
  desk.add(monLeft);

  const monRight = createMonitor('PRINT SPOOLER: SILENT (NROFF INTERCEPT)', 'QUEUE STATUS: 0 PHYSICAL CONFIRMATIONS', true);
  monRight.position.set(0.35, 0, 0);
  monRight.rotation.y = -0.12;
  desk.add(monRight);

  // Keyboard & Mouse
  const kbMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.012, 0.14), new THREE.MeshStandardMaterial({ color: 0x252830, roughness: 0.6 }));
  kbMesh.position.set(-0.15, 0.766, 0.22);
  desk.add(kbMesh);

  const mouseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.10), new THREE.MeshStandardMaterial({ color: 0x1f2228, roughness: 0.4 }));
  mouseMesh.position.set(0.24, 0.77, 0.22);
  desk.add(mouseMesh);

  // 6. Dedicated Printer Pedestal Table (to the right of desk)
  const printerStand = new THREE.Group();
  printerStand.position.set(1.4, 0, -1.35);
  room.add(printerStand);

  const standTop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.035, 0.60), matWood);
  standTop.position.y = 0.68;
  standTop.castShadow = true;
  standTop.receiveShadow = true;
  printerStand.add(standTop);

  const pLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.66, 0.04), matMetalLegs);
  pLeg1.position.set(-0.28, 0.33, -0.25);
  const pLeg2 = pLeg1.clone(); pLeg2.position.set(0.28, 0.33, -0.25);
  const pLeg3 = pLeg1.clone(); pLeg3.position.set(-0.28, 0.33, 0.25);
  const pLeg4 = pLeg1.clone(); pLeg4.position.set(0.28, 0.33, 0.25);
  printerStand.add(pLeg1, pLeg2, pLeg3, pLeg4);

  // 7. Wall Calendar (February 2016, Friday 5)
  const calCanvas = document.createElement('canvas');
  calCanvas.width = 256;
  calCanvas.height = 320;
  const cctx = calCanvas.getContext('2d');
  cctx.fillStyle = '#ffffff';
  cctx.fillRect(0, 0, 256, 320);
  cctx.fillStyle = '#c02424';
  cctx.fillRect(0, 0, 256, 60);
  cctx.fillStyle = '#ffffff';
  cctx.font = 'bold 24px sans-serif';
  cctx.textAlign = 'center';
  cctx.fillText('FEBRUARY 2016', 128, 40);

  cctx.fillStyle = '#222222';
  cctx.font = 'bold 110px sans-serif';
  cctx.fillText('5', 128, 175);
  cctx.font = 'bold 32px sans-serif';
  cctx.fillText('FRIDAY', 128, 230);
  cctx.font = '16px monospace';
  cctx.fillStyle = '#666666';
  cctx.fillText('BANGLADESH BANK', 128, 280);

  // Red marker circle around Friday 5
  cctx.strokeStyle = '#d61b1b';
  cctx.lineWidth = 6;
  cctx.beginPath();
  cctx.ellipse(128, 150, 75, 65, 0, 0, Math.PI * 2);
  cctx.stroke();

  const calTex = new THREE.CanvasTexture(calCanvas);
  const calMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.50), new THREE.MeshBasicMaterial({ map: calTex }));
  calMesh.position.set(-1.8, 1.8, -3.97);
  room.add(calMesh);

  // 8. Wall Clock (08:45 AM)
  const clockGroup = new THREE.Group();
  clockGroup.position.set(1.6, 2.3, -3.97);
  room.add(clockGroup);

  const clockRim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 32), matMetalLegs);
  clockRim.rotation.x = Math.PI / 2;
  clockGroup.add(clockRim);

  const clockFaceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.20, 32), clockFaceMat);
  clockFace.position.z = 0.016;
  clockGroup.add(clockFace);

  // Clock Hands: 08:45 AM
  // Hour hand pointing to 8: angle = 8 * 30 + 45 * 0.5 = 262.5 deg
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.10, 0.005), matMetalLegs);
  hourHand.position.set(-0.045, -0.015, 0.02);
  hourHand.rotation.z = THREE.MathUtils.degToRad(262.5 - 90);
  clockGroup.add(hourHand);

  // Minute hand pointing to 9 (45 mins): angle = 45 * 6 = 270 deg
  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.15, 0.005), matMetalLegs);
  minHand.position.set(-0.065, 0, 0.022);
  minHand.rotation.z = THREE.MathUtils.degToRad(270 - 90);
  clockGroup.add(minHand);

  // Second hand pivot (for animated ticking)
  const secPivot = new THREE.Group();
  secPivot.position.z = 0.024;
  clockGroup.add(secPivot);
  const secHand = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.16, 0.002), new THREE.MeshBasicMaterial({ color: 0xcc2222 }));
  secHand.position.y = 0.05;
  secPivot.add(secHand);

  return {
    group: room,
    printerStandPos: printerStand.position,
    updateClock(t) {
      // Step ticking second hand every second
      const sec = (t % 60);
      secPivot.rotation.z = -Math.floor(sec * 10) / 10 * (Math.PI * 2 / 60);
    }
  };
}
