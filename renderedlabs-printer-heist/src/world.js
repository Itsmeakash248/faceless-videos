// World Assembly & Lighting for RenderedLabs Printer Heist
import * as THREE from 'three';
import { makeSky } from './core/sky.js';
import { createPrinter } from './props/printer.js';
import { createOfficer } from './props/officer.js';
import { createDealingRoom } from './props/bankRoom.js';
import { createSwiftGrid } from './props/swiftGrid.js';
import { createWireDocument } from './props/wireDocument.js';
import { createCasinoTable } from './props/casinoTable.js';
import { createDocketCase } from './props/docketCase.js';

export async function buildWorld(renderer) {
  const sets = {};

  // Helper to make a standard scene with lighting and sky
  function makeBaseSet(skyOpts = {}) {
    const scene = new THREE.Scene();

    const sky = makeSky(renderer, {
      az: skyOpts.az ?? -65,
      el: skyOpts.el ?? 18,
      top: skyOpts.top ?? 0x3d70a2,
      mid: skyOpts.mid ?? 0x76a3cb,
      haze: skyOpts.haze ?? 0xedd6b4,
      ground: skyOpts.ground ?? 0x7c6a54,
      sunCol: skyOpts.sunCol ?? 0xffd8aa,
      sunI: skyOpts.sunI ?? 3.5,
      cloud: skyOpts.cloud ?? 0.4,
      groundBounce: 0.6,
      ...skyOpts,
    });

    scene.add(sky.dome, sky.sun, sky.sun.target);
    scene.environment = sky.env;
    scene.environmentIntensity = 0.7;

    // Interior / fill light
    const fill = new THREE.DirectionalLight(0x8cb6e8, 0.75);
    fill.position.set(-4, 3, -2);
    scene.add(fill);

    const amb = new THREE.AmbientLight(0xdce5f0, 0.35);
    scene.add(amb);

    return { scene, sky, sun: sky.sun, fill, amb };
  }

  // ---------------- SET 1: DHAKA DEALING ROOM ----------------
  const dhakaBase = makeBaseSet({ az: -50, el: 15, sunI: 3.2, haze: 0xf2dfc6 });
  const dealingRoom = createDealingRoom();
  const printer = createPrinter();
  const officer = createOfficer();

  // Position printer on the dedicated pedestal stand
  printer.group.position.set(1.4, 0.70, -1.35);
  dealingRoom.group.add(printer.group);

  // Position officer near the entrance / desk
  officer.group.position.set(0, 0, 1.2);
  officer.group.rotation.y = Math.PI;
  dealingRoom.group.add(officer.group);

  dhakaBase.scene.add(dealingRoom.group);

  sets.dhaka = {
    ...dhakaBase,
    dealingRoom,
    printer,
    officer,
    reset(t) {
      officer.resetPose();
      printer.setLed(true, false);
      printer.setTrayEmpty(true);
    },
    update(t, lt, r) {
      dealingRoom.updateClock(t);
    }
  };

  // ---------------- SET 2: SWIFT NETWORK GRID ----------------
  const netBase = makeBaseSet({
    top: 0x051226,
    mid: 0x0a2244,
    haze: 0x143b66,
    ground: 0x030810,
    sunCol: 0x55ccff,
    sunI: 2.2,
    cloud: 0.0,
  });
  const swiftGrid = createSwiftGrid();
  netBase.scene.add(swiftGrid.group);

  sets.network = {
    ...netBase,
    swiftGrid,
    reset(t) {},
    update(t, lt, r) {
      swiftGrid.animatePackets(t);
    }
  };

  // ---------------- SET 3: TYPO AUDIT SET ----------------
  const typoBase = makeBaseSet({
    top: 0x121c2b,
    mid: 0x22354c,
    haze: 0x475e7a,
    ground: 0x0d131a,
    sunCol: 0xffffff,
    sunI: 3.8,
  });
  const wireDoc = createWireDocument();
  typoBase.scene.add(wireDoc.group);

  sets.typo = {
    ...typoBase,
    wireDoc,
    reset(t) {
      wireDoc.reset();
    },
    update(t, lt, r) {}
  };

  // ---------------- SET 4: MANILA CASINO ----------------
  const casinoBase = makeBaseSet({
    top: 0x1f0e14,
    mid: 0x3d1422,
    haze: 0x732938,
    ground: 0x14070a,
    sunCol: 0xffd27d,
    sunI: 4.2,
  });
  const casino = createCasinoTable();
  casinoBase.scene.add(casino.group);

  sets.casino = {
    ...casinoBase,
    casino,
    reset(t) {},
    update(t, lt, r) {}
  };

  // ---------------- SET 5: DECADE DOCKET & BALANCE SHEET ----------------
  const ledgerBase = makeBaseSet({
    top: 0x0d141f,
    mid: 0x1b283d,
    haze: 0x34455c,
    ground: 0x080c14,
    sunCol: 0xffbe76,
    sunI: 3.5,
  });
  const docket = createDocketCase();
  const climaxPrinter = createPrinter();
  climaxPrinter.group.position.set(-0.95, 0.0, 0.4);
  climaxPrinter.group.rotation.y = 0.45;
  climaxPrinter.setLed(true, true, true);
  climaxPrinter.setTrayEmpty(true);
  docket.group.add(climaxPrinter.group);

  ledgerBase.scene.add(docket.group);

  sets.ledger = {
    ...ledgerBase,
    docket,
    climaxPrinter,
    reset(t) {},
    update(t, lt, r) {
      climaxPrinter.setLed(true, false, true, t);
    }
  };

  return { sets };
}
