// Procedural 3D Case Docket & Final Ledger Payoff (Built from scratch)
import * as THREE from 'three';

export function createDocketCase() {
  const root = new THREE.Group();
  root.name = 'DocketCaseSet';

  // Materials
  const matPaperStack = new THREE.MeshStandardMaterial({
    color: 0xeadcc9,
    roughness: 0.8,
    metalness: 0.05,
  });
  const matFolderCover = new THREE.MeshStandardMaterial({
    color: 0x6e261d, // Manila legal red/maroon docket folder
    roughness: 0.6,
    metalness: 0.1,
  });
  const matRibbon = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.4,
    metalness: 0.2,
  });

  // 1. Massive 10,000-Page Legal Case Docket Stack (W=0.45m, D=0.32m, H=0.55m)
  const docketGroup = new THREE.Group();
  docketGroup.position.set(-0.4, 0.28, 0);
  root.add(docketGroup);

  // Stack of 6 large bundled volumes
  for (let v = 0; v < 6; v++) {
    const volHeight = 0.08;
    const volMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, volHeight, 0.30), matPaperStack);
    volMesh.position.set((Math.random() - 0.5) * 0.01, v * 0.085, (Math.random() - 0.5) * 0.01);
    volMesh.rotation.y = (Math.random() - 0.5) * 0.04;
    volMesh.castShadow = true;
    volMesh.receiveShadow = true;
    docketGroup.add(volMesh);

    // Maroon Cover on each volume
    const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.006, 0.31), matFolderCover);
    coverMesh.position.set(volMesh.position.x, v * 0.085 + volHeight * 0.5 + 0.003, volMesh.position.z);
    docketGroup.add(coverMesh);
  }

  // Red Legal Ribbon wrapped around stack
  const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.025, 0.32), matRibbon);
  ribbonH.position.y = 0.25;
  docketGroup.add(ribbonH);

  const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.52, 0.32), matRibbon);
  ribbonV.position.y = 0.25;
  docketGroup.add(ribbonV);

  // Label Tag on Docket
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 256;
  const lctx = labelCanvas.getContext('2d');
  lctx.fillStyle = '#f8fafc';
  lctx.fillRect(0, 0, 512, 256);
  lctx.strokeStyle = '#1e293b';
  lctx.lineWidth = 4;
  lctx.strokeRect(8, 8, 496, 240);

  lctx.fillStyle = '#0f172a';
  lctx.font = 'bold 26px serif';
  lctx.textAlign = 'center';
  lctx.fillText('BANGLADESH POLICE — CID', 256, 48);
  lctx.font = 'bold 22px monospace';
  lctx.fillStyle = '#b91c1c';
  lctx.fillText('CASE DOCKET: 10,000 PAGES', 256, 88);
  lctx.font = '18px monospace';
  lctx.fillStyle = '#334155';
  lctx.fillText('64 SUSPECTS NAMED', 256, 128);
  lctx.fillText('99 ADJOURNMENTS', 256, 160);
  lctx.font = 'bold 20px monospace';
  lctx.fillStyle = '#0f172a';
  lctx.fillText('TRIAL VERDICT: ZERO CONVICTIONS', 256, 204);

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), new THREE.MeshBasicMaterial({ map: labelTex }));
  labelMesh.position.set(-0.4, 0.53, 0.16);
  root.add(labelMesh);

  // 2. Final Payoff Glowing Ledger Board
  const ledgerCanvas = document.createElement('canvas');
  ledgerCanvas.width = 800;
  ledgerCanvas.height = 600;
  const actx = ledgerCanvas.getContext('2d');
  const ledgerTex = new THREE.CanvasTexture(ledgerCanvas);

  function renderLedger(t = 0) {
    actx.fillStyle = '#0a0d14';
    actx.fillRect(0, 0, 800, 600);

    actx.strokeStyle = '#e09436';
    actx.lineWidth = 6;
    actx.strokeRect(12, 12, 776, 576);

    // Header
    actx.fillStyle = '#e09436';
    actx.font = 'bold 30px monospace';
    actx.textAlign = 'center';
    actx.fillText('THE $81 MILLION HEIST BALANCE SHEET', 400, 65);

    actx.strokeStyle = '#2d3748';
    actx.lineWidth = 2;
    actx.beginPath();
    actx.moveTo(40, 85);
    actx.lineTo(760, 85);
    actx.stroke();

    // Table Lines
    const lines = [
      { label: 'ATTEMPTED WIRE ORDERS', val: '$951,000,000.00', col: '#94a3b8' },
      { label: 'FED AUTOMATED FILTERS BLOCKED', val: '-$850,000,000.00', col: '#38bdf8' },
      { label: 'SRI LANKA TYPO (FUNDATION) STOPPED', val: '-$20,000,000.00', col: '#34d399' },
      { label: 'MANILA CASINO LAUNDERED', val: '+$81,001,662.12', col: '#f87171' },
      { label: 'JUNKET OPERATOR SURRENDERED', val: '-$15,000,000.00', col: '#34d399' },
    ];

    let y = 140;
    lines.forEach(l => {
      actx.fillStyle = '#cbd5e1';
      actx.font = 'bold 19px monospace';
      actx.textAlign = 'left';
      actx.fillText(l.label, 50, y);

      actx.fillStyle = l.col;
      actx.font = 'bold 22px monospace';
      actx.textAlign = 'right';
      actx.fillText(l.val, 750, y);
      y += 50;
    });

    // Glowing Final Total Box
    actx.fillStyle = '#1c0c08';
    actx.fillRect(40, 390, 720, 150);
    actx.strokeStyle = '#ef4444';
    actx.lineWidth = 4;
    actx.strokeRect(40, 390, 720, 150);

    actx.fillStyle = '#f87171';
    actx.font = 'bold 22px monospace';
    actx.textAlign = 'center';
    actx.fillText('A DECADE LATER // UNRECOVERED LOSS', 400, 435);

    // Glowing Missing Amount
    actx.fillStyle = '#ffffff';
    actx.font = 'bold 48px monospace';
    actx.fillText('$66,400,000.00 MISSING', 400, 495);

    ledgerTex.needsUpdate = true;
  }
  renderLedger(0);

  const ledgerMat = new THREE.MeshBasicMaterial({ map: ledgerTex, transparent: true });
  const ledgerMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), ledgerMat);
  ledgerMesh.position.set(0.65, 0.75, 0);
  ledgerMesh.rotation.y = -0.25;
  root.add(ledgerMesh);

  return {
    group: root,
    renderLedger
  };
}
