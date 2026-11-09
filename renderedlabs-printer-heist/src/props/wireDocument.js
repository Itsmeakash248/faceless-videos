// Procedural 3D Wire Transfer Document & Typo Audit Set (Built from scratch)
import * as THREE from 'three';

export function createWireDocument() {
  const root = new THREE.Group();
  root.name = 'WireDocumentSet';

  // High-res Document Canvas Texture
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1448; // A4 aspect
  const ctx = canvas.getContext('2d');
  const docTex = new THREE.CanvasTexture(canvas);
  docTex.minFilter = THREE.LinearFilter;

  let stampActive = false;
  let scanYPos = 0;

  function renderDocument(highlightTypo = false, showStamp = false) {
    // 1. Paper Background & Subtle Guilloche
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 1448);

    // Security Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, 960, 1384);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, 944, 1368);

    // Header Bank Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(44, 44, 936, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('SWIFT FINANCIAL TELECOMMUNICATION', 70, 95);
    ctx.font = '20px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('MT103 SINGLE CUSTOMER CREDIT TRANSFER', 70, 130);

    // Metadata Strip
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(44, 160, 936, 60);
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('DATE: 04 FEB 2016  |  TIME: 22:45 UTC  |  MSG ID: BB-NY-20160204-36', 70, 198);

    // Wire Transfer Fields
    const fields = [
      { tag: ':20:', name: 'SENDER REFERENCE', val: 'BBANK-20160204-099432' },
      { tag: ':23B:', name: 'BANK OPERATION CODE', val: 'CRED (CREDIT TRANSFER)' },
      { tag: ':32A:', name: 'VAL DATE / CURR / AMOUNT', val: 'USD 20,000,000.00', big: true },
      { tag: ':50K:', name: 'ORDERING CUSTOMER', val: '/100234891\nBANGLADESH BANK (DHAKA TERMINAL)' },
      { tag: ':52A:', name: 'ORDERING INSTITUTION', val: 'BBANKBDDHAXXX (BANGLADESH BANK)' },
      { tag: ':53A:', name: 'SENDER CORRESPONDENT', val: 'FRNYUS33XXX (FEDERAL RESERVE BANK OF NY)' },
      { tag: ':57A:', name: 'ACCOUNT WITH INSTITUTION', val: 'PABCUS33XXX (PAN ASIA BANK CORP)' },
      { tag: ':59:', name: 'BENEFICIARY CUSTOMER', val: '/8004921002\nSHALIKA FUNDATION', typo: true },
      { tag: ':70:', name: 'REMITTANCE INFORMATION', val: 'JAPAN-SRI LANKA JICA INFRASTRUCTURE PROJECT' },
    ];

    let y = 260;
    fields.forEach(f => {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${f.tag}  ${f.name}`, 70, y);

      if (f.big) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 38px monospace';
        ctx.fillText(f.val, 70, y + 44);
        y += 85;
      } else if (f.typo) {
        // Beneficiary line
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 30px monospace';
        ctx.fillText('/8004921002', 70, y + 36);

        // Highlight Box for FUNDATION
        if (highlightTypo) {
          ctx.fillStyle = '#fef2f2';
          ctx.fillRect(66, y + 50, 480, 56);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(66, y + 50, 480, 56);

          // Typo highlight marker
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 34px monospace';
          ctx.fillText('SHALIKA ', 76, y + 90);
          ctx.fillStyle = '#b91c1c';
          ctx.fillText('FUNDATION', 246, y + 90);

          // Red underline under FUNDATION
          ctx.strokeStyle = '#b91c1c';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(246, y + 98);
          ctx.lineTo(460, y + 98);
          ctx.stroke();

          // Callout Tag
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(490, y + 58, 220, 36);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px monospace';
          ctx.fillText('! SPELLING ALARM', 505, y + 82);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 30px monospace';
          ctx.fillText('SHALIKA FUNDATION', 70, y + 80);
        }
        y += 135;
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.font = '22px monospace';
        const lines = f.val.split('\n');
        lines.forEach((l, li) => {
          ctx.fillText(l, 70, y + 32 + li * 28);
        });
        y += 35 + lines.length * 28;
      }
    });

    // 2. Heavy Red Intercept Stamp
    if (showStamp) {
      ctx.save();
      ctx.translate(512, 724);
      ctx.rotate(-0.18);

      // Stamp Outer Box
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 14;
      ctx.strokeRect(-360, -110, 720, 220);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 64px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAYMENT HALTED', 0, -25);

      ctx.font = 'bold 32px monospace';
      ctx.fillText('REASON: INVALID BENEFICIARY', 0, 30);
      ctx.font = '26px monospace';
      ctx.fillText('$20,000,000 RETURNED TO SENDER', 0, 75);

      ctx.restore();
    }

    docTex.needsUpdate = true;
  }
  renderDocument(true, false);

  // Document 3D Mesh (W=1.2m, H=1.7m)
  const docGeom = new THREE.PlaneGeometry(1.2, 1.7);
  const docMat = new THREE.MeshStandardMaterial({
    map: docTex,
    roughness: 0.65,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const docMesh = new THREE.Mesh(docGeom, docMat);
  docMesh.castShadow = true;
  docMesh.receiveShadow = true;
  root.add(docMesh);

  // Laser Scanner Audit Reticle (Cyan / Red beam)
  const scanBarGeom = new THREE.BoxGeometry(1.3, 0.015, 0.02);
  const scanMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const scanBar = new THREE.Mesh(scanBarGeom, scanMat);
  scanBar.position.z = 0.02;
  root.add(scanBar);

  return {
    group: root,
    renderDocument,
    setScanProgress(p, isAlarm = false) {
      scanBar.visible = p >= 0 && p <= 1;
      scanBar.position.y = THREE.MathUtils.lerp(0.8, -0.8, p);
      scanMat.color.setHex(isAlarm ? 0xff2222 : 0x00ffff);
    },
    triggerStamp() {
      if (!stampActive) {
        stampActive = true;
        renderDocument(true, true);
      }
    },
    reset() {
      stampActive = false;
      renderDocument(true, false);
      scanBar.position.y = 0.8;
    }
  };
}
