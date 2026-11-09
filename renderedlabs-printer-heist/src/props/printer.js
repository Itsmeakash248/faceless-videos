// Procedural 3D Model: HP LaserJet 400 M401 (Built from scratch)
import * as THREE from 'three';

export function createPrinter() {
  const root = new THREE.Group();
  root.name = 'HPLaserJet400';

  // Materials
  const matChassis = new THREE.MeshStandardMaterial({
    color: 0x222428,
    roughness: 0.42,
    metalness: 0.15,
  });
  const matDarkBezel = new THREE.MeshStandardMaterial({
    color: 0x141618,
    roughness: 0.35,
    metalness: 0.25,
  });
  const matAccentSilver = new THREE.MeshStandardMaterial({
    color: 0x8a929a,
    roughness: 0.25,
    metalness: 0.75,
  });
  const matPaper = new THREE.MeshStandardMaterial({
    color: 0xf4f6f8,
    roughness: 0.7,
    metalness: 0.05,
  });
  const matRubber = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.0,
  });

  // 1. Main Base & Chassis (W=0.36m, D=0.38m, H=0.25m)
  const chassisGeom = new THREE.BoxGeometry(0.36, 0.20, 0.36);
  const chassis = new THREE.Mesh(chassisGeom, matChassis);
  chassis.position.y = 0.10;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  root.add(chassis);

  // Top sculpted cap with recessed output tray
  const topFront = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.12), matChassis);
  topFront.position.set(0, 0.225, 0.12);
  topFront.castShadow = true;
  root.add(topFront);

  const topBack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.10), matChassis);
  topBack.position.set(0, 0.23, -0.13);
  topBack.castShadow = true;
  root.add(topBack);

  // Recessed Output Bin Cavity Floor (angled slope)
  const binFloorGeom = new THREE.PlaneGeometry(0.28, 0.18);
  const binFloor = new THREE.Mesh(binFloorGeom, matDarkBezel);
  binFloor.rotation.x = -Math.PI / 2 + 0.15;
  binFloor.position.set(0, 0.205, -0.01);
  binFloor.receiveShadow = true;
  root.add(binFloor);

  // Paper Stop Flap (fold-out wire/plastic lip at the front of bin)
  const flapGeom = new THREE.BoxGeometry(0.12, 0.006, 0.04);
  const flap = new THREE.Mesh(flapGeom, matAccentSilver);
  flap.position.set(0, 0.21, 0.07);
  flap.rotation.x = 0.35;
  root.add(flap);

  // 2. Lower Paper Drawer (Tray 2 Cassette)
  const drawerGeom = new THREE.BoxGeometry(0.34, 0.06, 0.01);
  const drawer = new THREE.Mesh(drawerGeom, matDarkBezel);
  drawer.position.set(0, 0.04, 0.181);
  root.add(drawer);

  // Drawer Handle Recess
  const handleGeom = new THREE.BoxGeometry(0.09, 0.016, 0.008);
  const handle = new THREE.Mesh(handleGeom, matAccentSilver);
  handle.position.set(0, 0.04, 0.186);
  root.add(handle);

  // Paper Level Window
  const windowGeom = new THREE.BoxGeometry(0.012, 0.035, 0.005);
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    transmission: 0.9,
  });
  const levelWindow = new THREE.Mesh(windowGeom, matGlass);
  levelWindow.position.set(0.12, 0.04, 0.186);
  root.add(levelWindow);

  // 3. Multipurpose Fold-out Tray 1 Door
  const tray1Door = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.008), matChassis);
  tray1Door.position.set(0, 0.125, 0.181);
  root.add(tray1Door);

  // 4. Control Panel Assembly (Right Top angled console)
  const panelBaseGeom = new THREE.BoxGeometry(0.10, 0.045, 0.08);
  const panelBase = new THREE.Mesh(panelBaseGeom, matDarkBezel);
  panelBase.position.set(0.12, 0.245, 0.11);
  panelBase.rotation.x = -0.25;
  root.add(panelBase);

  // LCD Screen Texture Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const screenTex = new THREE.CanvasTexture(canvas);
  screenTex.minFilter = THREE.LinearFilter;

  function updateLcd(line1, line2, alert = false) {
    ctx.fillStyle = alert ? '#3a0808' : '#08281a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = alert ? '#881111' : '#145c38';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 60);

    ctx.fillStyle = alert ? '#ff4d4d' : '#4dff91';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(line1.slice(0, 18), 12, 26);
    ctx.font = '16px monospace';
    ctx.fillText(line2.slice(0, 20), 12, 50);
    screenTex.needsUpdate = true;
  }
  updateLcd('READY', 'SWIFT ONLINE');

  const matLcd = new THREE.MeshBasicMaterial({ map: screenTex });
  const lcdGeom = new THREE.PlaneGeometry(0.065, 0.022);
  const lcdMesh = new THREE.Mesh(lcdGeom, matLcd);
  lcdMesh.position.set(0.12, 0.255, 0.115);
  lcdMesh.rotation.x = -0.25;
  root.add(lcdMesh);

  // Status LEDs
  const ledPowerGeom = new THREE.SphereGeometry(0.003, 8, 8);
  const matLedPower = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
  const ledPower = new THREE.Mesh(ledPowerGeom, matLedPower);
  ledPower.position.set(0.075, 0.252, 0.12);
  root.add(ledPower);

  const ledErrorGeom = new THREE.SphereGeometry(0.003, 8, 8);
  const matLedError = new THREE.MeshBasicMaterial({ color: 0x331100 });
  const ledError = new THREE.Mesh(ledErrorGeom, matLedError);
  ledError.position.set(0.075, 0.244, 0.122);
  root.add(ledError);

  // Buttons on control panel
  const btnGeom = new THREE.CylinderGeometry(0.0035, 0.0035, 0.002, 12);
  const matBtn = new THREE.MeshStandardMaterial({ color: 0x444850, roughness: 0.5 });
  const btnOk = new THREE.Mesh(btnGeom, matBtn);
  btnOk.rotation.x = THREE.MathUtils.degToRad(75);
  btnOk.position.set(0.12, 0.238, 0.138);
  root.add(btnOk);

  // 5. Paper Output Stack Group
  const paperStackGroup = new THREE.Group();
  paperStackGroup.position.set(0, 0.207, -0.01);
  paperStackGroup.rotation.x = -Math.PI / 2 + 0.15;
  root.add(paperStackGroup);

  // Individual printed sheets in output tray
  const sheets = [];
  for (let i = 0; i < 6; i++) {
    const sGeom = new THREE.PlaneGeometry(0.21, 0.297);
    const sMesh = new THREE.Mesh(sGeom, matPaper);
    sMesh.position.set((Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.004, 0.0006 * i);
    sMesh.rotation.z = (Math.random() - 0.5) * 0.02;
    sMesh.visible = false; // Initially empty!
    paperStackGroup.add(sMesh);
    sheets.push(sMesh);
  }

  // Active feeding sheet (for spit animation)
  const feedingSheet = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.297), matPaper);
  feedingSheet.position.set(0, 0, 0.008);
  feedingSheet.visible = false;
  paperStackGroup.add(feedingSheet);

  // Rubber Rollers inside slot
  const rollerGeom = new THREE.CylinderGeometry(0.006, 0.006, 0.24, 16);
  const roller1 = new THREE.Mesh(rollerGeom, matRubber);
  roller1.rotation.z = Math.PI / 2;
  roller1.position.set(0, 0.215, -0.08);
  root.add(roller1);

  // Ventilation grilles on side
  const ventGroup = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.004, 0.18), matDarkBezel);
    vent.position.set(0.181, 0.08 + i * 0.01, 0);
    ventGroup.add(vent);
  }
  root.add(ventGroup);

  // Controller API
  return {
    group: root,
    updateLcd,
    setLed(greenOn, amberOn, amberBlink = false, t = 0) {
      matLedPower.color.setHex(greenOn ? 0x00ff66 : 0x003311);
      const amberActive = amberOn || (amberBlink && Math.sin(t * 12) > 0);
      matLedError.color.setHex(amberActive ? 0xffaa00 : 0x331100);
    },
    setTrayEmpty(isEmpty) {
      sheets.forEach(s => s.visible = !isEmpty);
      feedingSheet.visible = false;
    },
    setSheetsVisibleCount(count) {
      sheets.forEach((s, idx) => s.visible = idx < count);
    },
    animatePaperFeed(progress) {
      feedingSheet.visible = true;
      feedingSheet.position.y = THREE.MathUtils.lerp(-0.15, 0.05, Math.min(1, Math.max(0, progress)));
    }
  };
}
