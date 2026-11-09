// Procedural 3D Cyber-Financial SWIFT Grid & Global Network (Built from scratch)
import * as THREE from 'three';

export function createSwiftGrid() {
  const root = new THREE.Group();
  root.name = 'SwiftGrid';

  // 1. Digital Wireframe Globe (Radius = 2.0m)
  const globeGroup = new THREE.Group();
  root.add(globeGroup);

  const matGlobeBase = new THREE.MeshBasicMaterial({
    color: 0x050c18,
    wireframe: false,
  });
  const globeSphere = new THREE.Mesh(new THREE.SphereGeometry(1.98, 36, 36), matGlobeBase);
  globeGroup.add(globeSphere);

  // Outer Glowing Latitude/Longitude Grid
  const matGrid = new THREE.MeshBasicMaterial({
    color: 0x1b4270,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const globeGrid = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 24), matGrid);
  globeGroup.add(globeGrid);

  // Coordinate helper: lat/lon (deg) to Vector3 on sphere
  function latLonToVec3(lat, lon, r = 2.02) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // City Nodes
  const nodes = {
    dhaka: latLonToVec3(23.81, 90.41),
    newYork: latLonToVec3(40.71, -74.00),
    manila: latLonToVec3(14.55, 121.02),
    colombo: latLonToVec3(6.92, 79.86),
  };

  const matNodeDhaka = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
  const matNodeNY = new THREE.MeshBasicMaterial({ color: 0x3399ff });
  const matNodeManila = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const matNodeColombo = new THREE.MeshBasicMaterial({ color: 0xff3344 });

  function addNodeMarker(pos, mat, label) {
    const pGroup = new THREE.Group();
    pGroup.position.copy(pos);
    pGroup.lookAt(0, 0, 0);

    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.002, 0.12, 8), mat);
    pin.rotation.x = Math.PI / 2;
    pGroup.add(pin);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), mat);
    beacon.position.z = 0.08;
    pGroup.add(beacon);

    // Glowing Pulse Ring
    const ringMat = new THREE.MeshBasicMaterial({ color: mat.color, wireframe: true, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.07, 16), ringMat);
    ring.position.z = 0.08;
    pGroup.add(ring);

    globeGroup.add(pGroup);
    return { group: pGroup, ring };
  }

  const markerDhaka = addNodeMarker(nodes.dhaka, matNodeDhaka, 'DHAKA');
  const markerNY = addNodeMarker(nodes.newYork, matNodeNY, 'NEW YORK FED');
  const markerManila = addNodeMarker(nodes.manila, matNodeManila, 'MANILA (RCBC)');
  const markerColombo = addNodeMarker(nodes.colombo, matNodeColombo, 'COLOMBO');

  // Arched Spline Tracks connecting Nodes
  function createArcCurve(v1, v2, height = 0.6) {
    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    const midLen = mid.length();
    mid.normalize().multiplyScalar(midLen + height);
    return new THREE.QuadraticBezierCurve3(v1, mid, v2);
  }

  const arcDhakaToNY = createArcCurve(nodes.dhaka, nodes.newYork, 0.7);
  const arcNYToManila = createArcCurve(nodes.newYork, nodes.manila, 0.8);
  const arcNYToColombo = createArcCurve(nodes.newYork, nodes.colombo, 0.65);

  function makeTube(curve, colorHex) {
    const geom = new THREE.TubeGeometry(curve, 48, 0.008, 8, false);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.5 });
    return new THREE.Mesh(geom, mat);
  }

  globeGroup.add(makeTube(arcDhakaToNY, 0x00ccff));
  globeGroup.add(makeTube(arcNYToManila, 0xffaa00));
  globeGroup.add(makeTube(arcNYToColombo, 0xff3355));

  // 2. 35 Floating Wire Transfer Packets
  const packetsGroup = new THREE.Group();
  root.add(packetsGroup);

  const packets = [];
  const matPacket = new THREE.MeshStandardMaterial({
    color: 0x182436,
    emissive: 0x0a1a2e,
    roughness: 0.4,
    metalness: 0.6,
  });
  const matPacketGlow = new THREE.MeshBasicMaterial({ color: 0x44ddff });

  for (let i = 0; i < 35; i++) {
    const pMesh = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.005), matPacket);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.124, 0.084, 0.003), matPacketGlow);
    pMesh.add(body, edge);
    packetsGroup.add(pMesh);
    packets.push({
      mesh: pMesh,
      u: (i / 35.0),
      speed: 0.12 + (i % 5) * 0.015,
      path: i < 5 ? (i === 4 ? 'colombo' : 'manila') : 'blocked',
      id: i + 1,
    });
  }

  // 3. New York Federal Reserve Vault Gate (Monumental Portal)
  const vaultGate = new THREE.Group();
  vaultGate.position.set(3.5, 0, 0);
  vaultGate.rotation.y = -Math.PI / 2;
  root.add(vaultGate);

  // Vault Outer Frame
  const matVaultMetal = new THREE.MeshStandardMaterial({ color: 0x252a32, roughness: 0.35, metalness: 0.85 });
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.14, 16, 48), matVaultMetal);
  vaultGate.add(outerRing);

  // Radial Locking Bolts
  const boltGroup = new THREE.Group();
  for (let b = 0; b < 12; b++) {
    const ang = (b / 12) * Math.PI * 2;
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12), new THREE.MeshStandardMaterial({ color: 0x8a95a5, metalness: 0.9 }));
    bolt.position.set(Math.cos(ang) * 1.15, Math.sin(ang) * 1.15, 0);
    bolt.rotation.z = ang;
    boltGroup.add(bolt);
  }
  vaultGate.add(boltGroup);

  // Security Firewall Gate Screen (Canvas Texture)
  const gateCanvas = document.createElement('canvas');
  gateCanvas.width = 512;
  gateCanvas.height = 512;
  const gctx = gateCanvas.getContext('2d');
  const gateTex = new THREE.CanvasTexture(gateCanvas);

  function updateGateStatus(blockedCount, allowedCount, totalBlockedStr) {
    gctx.fillStyle = '#0a1018';
    gctx.fillRect(0, 0, 512, 512);

    gctx.strokeStyle = '#285078';
    gctx.lineWidth = 8;
    gctx.strokeRect(10, 10, 492, 492);

    // Fed Seal Header
    gctx.fillStyle = '#4488cc';
    gctx.font = 'bold 24px monospace';
    gctx.textAlign = 'center';
    gctx.fillText('FEDERAL RESERVE BANK OF NEW YORK', 256, 60);
    gctx.font = '16px monospace';
    gctx.fillText('AUTOMATED RISK & SANCTIONS FIREWALL', 256, 90);

    // Status Boxes
    gctx.fillStyle = '#1c0808';
    gctx.fillRect(40, 130, 432, 140);
    gctx.strokeStyle = '#d62828';
    gctx.lineWidth = 3;
    gctx.strokeRect(40, 130, 432, 140);

    gctx.fillStyle = '#ff4d4d';
    gctx.font = 'bold 36px monospace';
    gctx.fillText(`${blockedCount} ORDERS BLOCKED`, 256, 185);
    gctx.font = '22px monospace';
    gctx.fillText(totalBlockedStr, 256, 230);

    // Cleared payments
    gctx.fillStyle = '#061a12';
    gctx.fillRect(40, 310, 432, 140);
    gctx.strokeStyle = '#10b981';
    gctx.strokeRect(40, 310, 432, 140);

    gctx.fillStyle = '#34d399';
    gctx.font = 'bold 32px monospace';
    gctx.fillText(`${allowedCount} ORDERS CLEARED`, 256, 365);
    gctx.font = '20px monospace';
    gctx.fillText('$101,001,662.12 DISPATCHED', 256, 410);

    gateTex.needsUpdate = true;
  }
  updateGateStatus(30, 5, '$850,000,000 FILTERED');

  const gateMat = new THREE.MeshBasicMaterial({ map: gateTex, transparent: true, opacity: 0.95 });
  const gateMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), gateMat);
  gateMesh.position.z = 0.02;
  vaultGate.add(gateMesh);

  return {
    group: root,
    globeGroup,
    vaultGate,
    updateGateStatus,
    animatePackets(t) {
      // Rotate globe slowly
      globeGroup.rotation.y = t * 0.08;

      // Animate packet positions along curves
      packets.forEach((p, idx) => {
        const uProg = (p.u + t * p.speed) % 1.0;
        let pt;
        if (p.path === 'manila') {
          // Dhaka -> NY -> Manila
          if (uProg < 0.5) {
            pt = arcDhakaToNY.getPoint(uProg * 2.0);
          } else {
            pt = arcNYToManila.getPoint((uProg - 0.5) * 2.0);
          }
        } else if (p.path === 'colombo') {
          if (uProg < 0.5) {
            pt = arcDhakaToNY.getPoint(uProg * 2.0);
          } else {
            pt = arcNYToColombo.getPoint((uProg - 0.5) * 2.0);
          }
        } else {
          // Blocked at NY Fed
          const cur = Math.min(0.5, uProg);
          pt = arcDhakaToNY.getPoint(cur * 2.0);
          // Scatter slightly around NY node
          pt.x += Math.sin(idx * 1.5) * 0.15;
          pt.y += Math.cos(idx * 2.1) * 0.15;
        }
        // Transform point by globe rotation
        p.mesh.position.copy(pt).applyAxisAngle(new THREE.Vector3(0, 1, 0), globeGroup.rotation.y);
        p.mesh.lookAt(0, 0, 0);
      });
    }
  };
}
