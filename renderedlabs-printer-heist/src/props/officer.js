// Procedural 3D Character: Officer Zubair (Built from scratch in Three.js)
import * as THREE from 'three';

export function createOfficer() {
  const root = new THREE.Group();
  root.name = 'OfficerZubair';

  // Materials
  const matSkin = new THREE.MeshStandardMaterial({
    color: 0xb5825d,
    roughness: 0.65,
    metalness: 0.05,
  });
  const matHair = new THREE.MeshStandardMaterial({
    color: 0x181512,
    roughness: 0.9,
    metalness: 0.0,
  });
  const matShirt = new THREE.MeshStandardMaterial({
    color: 0xedf0f5,
    roughness: 0.6,
    metalness: 0.05,
  });
  const matTie = new THREE.MeshStandardMaterial({
    color: 0x1b2838,
    roughness: 0.45,
    metalness: 0.1,
  });
  const matClip = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.85,
  });
  const matPants = new THREE.MeshStandardMaterial({
    color: 0x22262c,
    roughness: 0.7,
    metalness: 0.05,
  });
  const matShoes = new THREE.MeshStandardMaterial({
    color: 0x111215,
    roughness: 0.35,
    metalness: 0.2,
  });
  const matGlasses = new THREE.MeshStandardMaterial({
    color: 0x2a3038,
    roughness: 0.3,
    metalness: 0.8,
  });

  // Hips / Pelvis Pivot
  const hips = new THREE.Group();
  hips.position.y = 0.95;
  root.add(hips);

  const pelvisGeom = new THREE.BoxGeometry(0.26, 0.16, 0.18);
  const pelvisMesh = new THREE.Mesh(pelvisGeom, matPants);
  pelvisMesh.position.y = 0.02;
  pelvisMesh.castShadow = true;
  hips.add(pelvisMesh);

  // Belt
  const beltGeom = new THREE.BoxGeometry(0.27, 0.035, 0.19);
  const matBelt = new THREE.MeshStandardMaterial({ color: 0x12100e, roughness: 0.4 });
  const beltMesh = new THREE.Mesh(beltGeom, matBelt);
  beltMesh.position.y = 0.09;
  hips.add(beltMesh);

  // Belt Buckle
  const buckleGeom = new THREE.BoxGeometry(0.045, 0.03, 0.01);
  const buckleMesh = new THREE.Mesh(buckleGeom, matClip);
  buckleMesh.position.set(0, 0.09, 0.096);
  hips.add(buckleMesh);

  // Spine / Torso
  const spine = new THREE.Group();
  spine.position.y = 0.10;
  hips.add(spine);

  const torsoGeom = new THREE.BoxGeometry(0.30, 0.42, 0.20);
  const torsoMesh = new THREE.Mesh(torsoGeom, matShirt);
  torsoMesh.position.y = 0.21;
  torsoMesh.castShadow = true;
  spine.add(torsoMesh);

  // Necktie
  const tieGeom = new THREE.BoxGeometry(0.055, 0.32, 0.015);
  const tieMesh = new THREE.Mesh(tieGeom, matTie);
  tieMesh.position.set(0, 0.22, 0.105);
  spine.add(tieMesh);

  // Tie Clip
  const clipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.008), matClip);
  clipMesh.position.set(0.005, 0.26, 0.115);
  spine.add(clipMesh);

  // Neck & Head
  const neck = new THREE.Group();
  neck.position.y = 0.42;
  spine.add(neck);

  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.08, 12), matSkin);
  neckMesh.position.y = 0.04;
  neck.add(neckMesh);

  // Collar
  const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.04, 12), matShirt);
  collarMesh.position.y = 0.02;
  neck.add(collarMesh);

  const head = new THREE.Group();
  head.position.y = 0.08;
  neck.add(head);

  // Cranium / Face
  const headGeom = new THREE.BoxGeometry(0.16, 0.20, 0.17);
  const headMesh = new THREE.Mesh(headGeom, matSkin);
  headMesh.position.y = 0.10;
  headMesh.castShadow = true;
  head.add(headMesh);

  // Hair
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.06, 0.18), matHair);
  hairTop.position.set(0, 0.20, -0.005);
  head.add(hairTop);

  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.14, 0.04), matHair);
  hairBack.position.set(0, 0.12, -0.085);
  head.add(hairBack);

  // Glasses Frames
  const glasses = new THREE.Group();
  glasses.position.set(0, 0.11, 0.09);
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.008), matGlasses);
  frameL.position.x = -0.035;
  const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.008), matGlasses);
  frameR.position.x = 0.035;
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.006, 0.008), matGlasses);
  glasses.add(frameL, frameR, bridge);
  head.add(glasses);

  // Arms
  function createArm(isLeft) {
    const sign = isLeft ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.position.set(sign * 0.18, 0.38, 0);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.26, 10), matShirt);
    upperArm.position.y = -0.13;
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.y = -0.26;
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.24, 10), matShirt);
    forearm.position.y = -0.12;
    forearm.castShadow = true;
    elbow.add(forearm);

    // Hand
    const handMesh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.075, 0.06), matSkin);
    handMesh.position.y = -0.26;
    elbow.add(handMesh);

    return { shoulder, elbow };
  }

  const armL = createArm(true);
  const armR = createArm(false);
  spine.add(armL.shoulder, armR.shoulder);

  // Legs
  function createLeg(isLeft) {
    const sign = isLeft ? -1 : 1;
    const hipJoint = new THREE.Group();
    hipJoint.position.set(sign * 0.08, 0, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.44, 10), matPants);
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    hipJoint.add(thigh);

    const knee = new THREE.Group();
    knee.position.y = -0.44;
    hipJoint.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.42, 10), matPants);
    calf.position.y = -0.21;
    calf.castShadow = true;
    knee.add(calf);

    // Foot / Shoe
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.22), matShoes);
    foot.position.set(0, -0.42, 0.04);
    foot.castShadow = true;
    knee.add(foot);

    return { hipJoint, knee };
  }

  const legL = createLeg(true);
  const legR = createLeg(false);
  hips.add(legL.hipJoint, legR.hipJoint);

  // Controller API
  return {
    group: root,
    resetPose() {
      spine.rotation.set(0, 0, 0);
      neck.rotation.set(0, 0, 0);
      head.rotation.set(0, 0, 0);
      armL.shoulder.rotation.set(0, 0, 0);
      armL.elbow.rotation.set(0, 0, 0);
      armR.shoulder.rotation.set(0, 0, 0);
      armR.elbow.rotation.set(0, 0, 0);
      legL.hipJoint.rotation.set(0, 0, 0);
      legL.knee.rotation.set(0, 0, 0);
      legR.hipJoint.rotation.set(0, 0, 0);
      legR.knee.rotation.set(0, 0, 0);
      hips.position.y = 0.95;
    },
    poseWalk(t, speed = 4.0) {
      const ph = t * speed;
      const swing = Math.sin(ph);

      // Leg swing
      legL.hipJoint.rotation.x = swing * 0.45;
      legR.hipJoint.rotation.x = -swing * 0.45;

      // Knee bend on back swing
      legL.knee.rotation.x = Math.max(0, -swing * 0.5);
      legR.knee.rotation.x = Math.max(0, swing * 0.5);

      // Arm swing opposing legs
      armL.shoulder.rotation.x = -swing * 0.4;
      armR.shoulder.rotation.x = swing * 0.4;
      armL.elbow.rotation.x = -0.2 - Math.abs(swing) * 0.2;
      armR.elbow.rotation.x = -0.2 - Math.abs(swing) * 0.2;

      // Subtle hip bobbing
      hips.position.y = 0.95 + Math.abs(Math.cos(ph)) * 0.03;
      spine.rotation.y = -swing * 0.08;
    },
    poseInspect(t, reachProgress = 0) {
      // Officer leans forward and inspects tray
      spine.rotation.x = 0.25;
      head.rotation.x = 0.35;
      head.rotation.y = -0.15;

      // Left arm at side, right arm reaching toward printer
      armL.shoulder.rotation.x = 0.1;
      armL.elbow.rotation.x = -0.3;

      const rProg = Math.min(1, Math.max(0, reachProgress));
      armR.shoulder.rotation.x = -0.6 * rProg;
      armR.shoulder.rotation.z = -0.2 * rProg;
      armR.elbow.rotation.x = -0.8 * rProg;

      legL.hipJoint.rotation.set(0, 0, 0);
      legR.hipJoint.rotation.set(0.1, 0, 0);
      hips.position.y = 0.92;
    }
  };
}
