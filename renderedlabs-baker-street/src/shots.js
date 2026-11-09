// The 1971 Baker Street Bank Heist — Shot Choreography & Direction
// Pacing: ~40 seconds, ~21 shots keyed to Whisper word timestamps (cut 3 frames early)
import { W, H, PIC, PORTRAIT, PAL, clamp, lerp, inv, eo, eio, eback, rr, circ, rgrad, vgrad, poly, hash, TAU } from './core/lib.js';
import { wd, ln, cut, T } from './core/timing.js';
import { makeView } from './core/view.js';
import { U, pop, pill, stamp, counter, goldText, navyBg, rubber } from './core/gfx.js';

import { robber, radioHam, policeOfficer, drawPickaxe, drawDrill } from './sets/characters.js';
import { bakerStreetExterior, STREET_Y } from './sets/bakerStreet.js';
import { shopBasementScene, BASEMENT_FLOOR } from './sets/shopBasement.js';
import { tunnelCutawayView } from './sets/tunnelCutaway.js';
import { jackFailureScene } from './sets/jackFailure.js';
import { thermalLanceScene } from './sets/thermalLance.js';
import { geligniteChargesScene } from './sets/geligniteBlast.js';
import { vaultInteriorScene, VAULT_FLOOR } from './sets/vaultInterior.js';
import { hamRadioScene } from './sets/radioRooftop.js';
import { policeCheckScene } from './sets/policeCheck.js';
import { sealedDossierScene } from './sets/sealedDossier.js';

const fit = (c, text, size, maxW) => {
  c.font = `700 ${size}px Fredoka`;
  const w = c.measureText(text).width * 1.06;
  return w > maxW ? (size * maxW) / w : size;
};

const AMBER_RIM = { col: '#f2b266', w: 4, dx: 1, dy: -0.3 };
const COLD_RIM = { col: '#8fb0e8', w: 4, dx: -1, dy: -0.4 };

export function buildShots() {
  const S = [];
  const add = (o) => { S.push(o); return o; };
  const L = (i) => ln(i);

  // ── ACT 1: THE UNBREACHABLE VAULT & THE BYPASS ──────────────────────────────
  // S01: 0.00s — Baker Street at Night: Lloyds Bank, misty rain, streetlamp
  add({
    id: 'S01',
    at: 0,
    note: 'Baker Street 1971 exterior establishing',
    cam: { x: 1080, y: 440, w: 1800, push: 0.03, pushDur: 2.0, px: 1100, py: 440, pw: 920 },
    draw(c, V, lt, t) {
      bakerStreetExterior(V, { t, dof: 0 });
    },
    over(c, lt) {
      stamp(c, '185 BAKER STREET · LONDON · 1971', pop(lt, 0.2, 4));
    },
    cues: [
      [0, 'sub_drone', { dur: 4.0, gain: 0.6 }],
      [0.2, 'blip', { gain: 0.5 }]
    ]
  });

  // S02: 1.80s (twenty-ton) — Inside Lloyds Bank: 20-ton steel vault door
  add({
    id: 'S02',
    at: cut(0, 4),
    note: '20-ton steel vault door, unbroken & locked',
    cam: { x: 420, y: 430, w: 1000, px: 340, py: 430, pw: 640 },
    draw(c, V, lt, t) {
      vaultInteriorScene(V, { t, dof: 0, boxesOpen: false, loot: false });
      // Bank security guard with peaked cap inspecting the door
      V.chars(1, 0, AMBER_RIM, (k) => {
        policeOfficer(k, {
          x: 580,
          y: VAULT_FLOOR,
          h: 410,
          dir: -1,
          face: { expr: 'determined', t, look: -0.6 }
        });
      });
    },
    over(c, lt) {
      pill(c, '20-TON STEEL VAULT DOOR · TIME-LOCKED', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1));
    },
    cues: [
      [cut(0, 4), 'whoosh', { gain: 0.7 }],
      [cut(0, 4) + 0.1, 'clank', { gain: 0.8 }]
    ]
  });

  // S03: 4.33s (So) — Architectural Cutaway: "THE FLOOR IS THE DOOR"
  add({
    id: 'S03',
    at: cut(1, 0),
    note: 'Schematic cross section: bypass path through floor',
    cam: { x: 960, y: 450, w: 1920, push: 0.02, pushDur: 1.8, px: 960, py: 450, pw: 1080 },
    draw(c, V, lt, t) {
      tunnelCutawayView(V, { t, dof: 0, dims: true, hole: true });
    },
    over(c, lt) {
      pill(c, 'THE FLOOR IS THE DOOR', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 220 : 70) * U, pop(lt, 0.1), { ring: '#ff7a1a' });
    },
    cues: [
      [cut(1, 0), 'whoosh', { gain: 0.75 }],
      [cut(1, 0) + 0.15, 'blip', { gain: 0.6 }]
    ]
  });

  // ── ACT 2: THE 40-FOOT TUNNEL & EXCAVATION ──────────────────────────────────
  // S04: 6.64s (From) — Le Sac Leather Shop Cellar: 5ft initial drop
  add({
    id: 'S04',
    at: cut(2, 0),
    note: 'Le Sac cellar, 5ft vertical drop shaft',
    cam: { x: 1050, y: 480, w: 1200, px: 1050, py: 480, pw: 720 },
    draw(c, V, lt, t) {
      shopBasementScene(V, { t, dof: 0 });
      // Robber preparing to climb down the hatch
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 940,
          y: BASEMENT_FLOOR,
          h: 390,
          dir: 1,
          cap: 'flat',
          face: { expr: 'determined', t, look: 0.8 }
        });
      });
    },
    over(c, lt) {
      stamp(c, '189 BAKER STREET · BASEMENT', pop(lt, 0.1));
      pill(c, '5-FOOT INITIAL DROP', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 250 : 80) * U, pop(lt, 0.2), { fg: '#f2c864' });
    },
    cues: [
      [cut(2, 0), 'whoosh', { gain: 0.65 }],
      [cut(2, 0) + 0.2, 'dig', { gain: 0.7 }]
    ]
  });

  // S05: 8.76s (tunneled) — 40ft horizontal run directly under Chicken Inn
  add({
    id: 'S05',
    at: cut(2, 7),
    note: '40ft run under Chicken Inn restaurant',
    cam: { x: 880, y: 550, w: 1400, push: 0.03, pushDur: 2.0, px: 880, py: 550, pw: 840 },
    draw(c, V, lt, t) {
      tunnelCutawayView(V, { t, dof: 0, dims: false });
      // Robber crawling through the tunnel with pickaxe
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 780 + Math.sin(t * 3) * 30,
          y: 720,
          h: 320,
          dir: 1,
          cap: 'flat',
          face: { expr: 'determined', t }
        });
        drawPickaxe(k, 830, 680, 0.4 + Math.sin(t * 6) * 0.4, 0.85);
      });
    },
    over(c, lt) {
      pill(c, '40-FOOT RUN UNDER THE CHICKEN INN', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 230 : 75) * U, pop(lt, 0.1));
    },
    cues: [
      [cut(2, 7), 'scrape', { gain: 0.8 }],
      [cut(2, 7) + 0.3, 'dig', { gain: 0.75 }]
    ]
  });

  // S06: 10.64s (hauled) — 8 tons of dirt removed by hand
  add({
    id: 'S06',
    at: cut(2, 14),
    note: '8 tons of dirt removed',
    cam: { x: 1560, y: 520, w: 1100, px: 1560, py: 520, pw: 680 },
    draw(c, V, lt, t) {
      shopBasementScene(V, { t, dof: 0 });
      // Robber hauling canvas dirt bucket onto the giant spoil heap
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 1480,
          y: BASEMENT_FLOOR,
          h: 400,
          dir: 1,
          cap: 'beanie',
          face: { expr: 'worried', t }
        });
      });
    },
    over(c, lt) {
      pill(c, '8 TONS OF DIRT HAULED BY HAND', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1), { fg: '#f2c864', ring: '#d69e2e' });
    },
    cues: [
      [cut(2, 14), 'rubble', { gain: 0.85 }],
      [cut(2, 14) + 0.15, 'blip', { gain: 0.5 }]
    ]
  });

  // ── ACT 3: THE 3-FOOT SLAB & ENGINEERING FAILURES ──────────────────────────
  // S07: 12.20s (Fifteen) — 15-foot vertical rise under Lloyds Bank
  add({
    id: 'S07',
    at: cut(3, 0),
    note: '15ft vertical rise up to bank vault floor',
    cam: { x: 1400, y: 500, w: 900, px: 1400, py: 500, pw: 600 },
    draw(c, V, lt, t) {
      tunnelCutawayView(V, { t, dof: 0, dims: false });
      // Robber climbing up the vertical shaft
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 1380,
          y: 560 - (lt * 25),
          h: 340,
          dir: 1,
          cap: 'flat',
          face: { expr: 'determined', t }
        });
      });
    },
    over(c, lt) {
      pill(c, '15-FOOT VERTICAL RISE', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1));
    },
    cues: [
      [cut(3, 0), 'whoosh', { gain: 0.6 }]
    ]
  });

  // S08: 13.30s (three) — 3-foot reinforced concrete vault slab
  add({
    id: 'S08',
    at: cut(3, 3),
    note: '3 feet of reinforced concrete ceiling',
    cam: { x: 960, y: 380, w: 1000, px: 960, py: 380, pw: 640 },
    draw(c, V, lt, t) {
      jackFailureScene(V, { t, dof: 0, sink: 0 });
      // Robber with heavy drill looking up at the solid rebar concrete
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 720,
          y: 680,
          h: 390,
          dir: 1,
          cap: 'flat',
          face: { expr: 'shocked', t, look: 0.8 }
        });
        drawDrill(k, 780, 560, -0.6, 1.0, 1);
      });
    },
    over(c, lt) {
      pill(c, '3 FEET OF REINFORCED CONCRETE', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 230 : 75) * U, pop(lt, 0.1), { fg: '#f87171', ring: '#e53e3e' });
    },
    cues: [
      [cut(3, 3), 'drill', { dur: 1.8, gain: 0.85 }]
    ]
  });

  // S09: 15.70s (Their) — 100-ton hydraulic jack sinks into ancient well
  add({
    id: 'S09',
    at: cut(4, 0),
    note: '100-ton jack sinks into unmapped well',
    cam: { x: 960, y: 520, w: 1200, push: 0.03, pushDur: 1.8, px: 960, py: 520, pw: 740 },
    draw(c, V, lt, t) {
      const sinkK = clamp(lt / 1.2, 0, 1);
      jackFailureScene(V, { t, dof: 0, sink: sinkK });
    },
    over(c, lt) {
      pill(c, '100-TON JACK SANK INTO ANCIENT WELL', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 230 : 75) * U, pop(lt, 0.1), { fg: '#ecc94b', ring: '#d69e2e' });
    },
    cues: [
      [cut(4, 0), 'jack_groan', { dur: 2.0, gain: 0.9 }],
      [cut(4, 0) + 0.4, 'splash', { gain: 0.75 }]
    ]
  });

  // S10: 17.64s (thermal) — Thermal lance fails due to toxic fumes
  add({
    id: 'S10',
    at: cut(4, 7),
    note: '3,000°C thermal lance choked with smoke',
    cam: { x: 920, y: 440, w: 1100, px: 920, py: 440, pw: 700 },
    draw(c, V, lt, t) {
      thermalLanceScene(V, { t, dof: 0 });
      // Robber coughing and staggering back from blinding smoke
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 640,
          y: 680,
          h: 390,
          dir: 1,
          cap: 'beanie',
          face: { expr: 'scared', t, look: -0.5 }
        });
      });
    },
    over(c, lt) {
      pill(c, 'THERMAL LANCE FAILED · 3,000°C TOXIC FUMES', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1), { fg: '#f97316', ring: '#ea580c' });
    },
    cues: [
      [cut(4, 7), 'lance_hiss', { dur: 1.8, gain: 0.9 }]
    ]
  });

  // ── ACT 4: GELIGNITE BLAST & THE BREACH ──────────────────────────────────────
  // S11: 19.58s (So) — Gelignite charges packed in drilled ceiling holes
  add({
    id: 'S11',
    at: cut(5, 0),
    note: 'Gelignite dynamite sticks packed in concrete',
    cam: { x: 940, y: 460, w: 900, px: 940, py: 460, pw: 620 },
    draw(c, V, lt, t) {
      geligniteChargesScene(V, { t, dof: 0, exploded: false });
      // Robber preparing blast wire
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 620,
          y: 720,
          h: 380,
          dir: 1,
          cap: 'flat',
          face: { expr: 'determined', t }
        });
      });
    },
    over(c, lt) {
      pill(c, 'GELIGNITE TIMED TO BAKER STREET TRAFFIC', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1), { fg: '#f87171', ring: '#dc2626' });
    },
    cues: [
      [cut(5, 0), 'whoosh', { gain: 0.6 }],
      [cut(5, 0) + 0.2, 'click', { gain: 0.7 }]
    ]
  });

  // S12: 20.34s (blasted) — Muffled subterranean explosion, 12x14 inch hole
  add({
    id: 'S12',
    at: cut(5, 2),
    note: 'Subterranean blast blows 12x14 inch hole',
    cam: { x: 960, y: 480, w: 1050, push: 0.04, pushDur: 1.5, px: 960, py: 480, pw: 680 },
    draw(c, V, lt, t) {
      const blastK = clamp(lt / 0.45, 0, 1);
      geligniteChargesScene(V, { t, dof: 0, exploded: true, blastK });
    },
    over(c, lt) {
      pill(c, '12 × 14 INCH HOLE BLOWN THROUGH FLOOR', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 230 : 75) * U, pop(lt, 0.08), { fg: '#facc15', ring: '#ca8a04' });
    },
    cues: [
      [cut(5, 2), 'blast', { gain: 1.0 }],
      [cut(5, 2) + 0.2, 'rubble', { gain: 0.8 }]
    ]
  });

  // ── ACT 5: THE HAUL & SAFE DEPOSIT BOXES ─────────────────────────────────────
  // S13: 22.68s (Two) — 268 safe deposit boxes emptied
  add({
    id: 'S13',
    at: cut(6, 0),
    note: 'Strongroom: 268 safe deposit boxes emptied',
    cam: { x: 1200, y: 440, w: 1300, push: 0.02, pushDur: 2.0, px: 1200, py: 440, pw: 820 },
    draw(c, V, lt, t) {
      vaultInteriorScene(V, { t, dof: 0, boxesOpen: true, loot: true });
      // Robber in vault filling sack
      V.chars(1, 0, AMBER_RIM, (k) => {
        robber(k, {
          x: 940,
          y: VAULT_FLOOR,
          h: 380,
          dir: 1,
          cap: 'flat',
          face: { expr: 'relieved', t }
        });
      });
    },
    over(c, lt) {
      pill(c, '268 SAFE-DEPOSIT BOXES EMPTIED', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 230 : 75) * U, pop(lt, 0.1), { fg: '#facc15', ring: '#eab308' });
    },
    cues: [
      [cut(6, 0), 'box_pry', { dur: 1.5, gain: 0.85 }],
      [cut(6, 0) + 0.3, 'coins', { gain: 0.75 }]
    ]
  });

  // S14: 25.40s (One) — £1.5 Million stolen (£231,000 recovered)
  add({
    id: 'S14',
    at: cut(6, 6),
    note: '£1.5 million stolen (£231,000 recovered)',
    cam: { x: 1140, y: 520, w: 900, px: 1140, py: 520, pw: 620 },
    draw(c, V, lt, t) {
      vaultInteriorScene(V, { t, dof: 0, boxesOpen: true, loot: true });
    },
    over(c, lt) {
      pill(c, '£1.5 MILLION STOLEN · (£231,000 RECOVERED)', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1), { fg: '#4ade80', ring: '#16a34a' });
    },
    cues: [
      [cut(6, 6), 'coins', { gain: 0.85 }],
      [cut(6, 6) + 0.2, 'blip', { gain: 0.6 }]
    ]
  });

  // ── ACT 6: THE ACCIDENTAL HAM RADIO INTERCEPT ────────────────────────────────
  // S15: 27.52s (A) — Robert Rowlands' radio room in Wimpole Street
  add({
    id: 'S15',
    at: cut(7, 0),
    note: 'Robert Rowlands intercepts radio chatter',
    cam: { x: 1100, y: 460, w: 1400, px: 1100, py: 460, pw: 850 },
    draw(c, V, lt, t) {
      hamRadioScene(V, { t, dof: 0, wave: true });
      // Robert Rowlands sitting with bulky headphones
      V.chars(1, 0, AMBER_RIM, (k) => {
        radioHam(k, {
          x: 720,
          y: 660,
          h: 390,
          dir: 1,
          face: { expr: 'shocked', t, look: 0.6 }
        });
      });
    },
    over(c, lt) {
      stamp(c, 'WIMPOLE STREET · 0.5 MILES AWAY · 23:00', pop(lt, 0.1));
      pill(c, 'AMATEUR HAM RADIO OPERATOR', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.15));
    },
    cues: [
      [cut(7, 0), 'radio_static', { dur: 1.8, gain: 0.8 }],
      [cut(7, 0) + 0.3, 'squelch', { gain: 0.75 }]
    ]
  });

  // S16: 30.36s (Money) — The Intercepted Transmission Quote Card
  add({
    id: 'S16',
    at: cut(8, 0),
    card: true,
    note: 'Walkie-talkie intercepted quote',
    draw(c, V, lt) {
      navyBg(c, lt, { hot: '#1e3a5f' });
      const k = eo(lt / 0.4);
      c.save();
      c.globalAlpha = k;
      const s1 = fit(c, '“MONEY MAY BE YOUR GOD,', 56 * U, W * 0.85);
      const s2 = fit(c, 'BUT IT’S NOT MINE.”', 72 * U, W * 0.88);
      goldText(c, '“MONEY MAY BE YOUR GOD,', W / 2, H / 2 - 50 * U, s1, { col: '#fef08a', ls: 0.05 });
      goldText(c, 'BUT IT’S NOT MINE.”', W / 2, H / 2 + 45 * U, s2, { col: '#facc15', ls: 0.06 });
      c.restore();
    },
    over(c, lt) {
      pill(c, 'INTERCEPTED WALKIE-TALKIE TRANSMISSION', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 220 : 65) * U, pop(lt, 0.05), { fg: '#fef08a' });
    },
    cues: [
      [cut(8, 0), 'squelch', { gain: 0.85 }],
      [cut(8, 0) + 0.1, 'radio_static', { dur: 2.2, gain: 0.5 }]
    ]
  });

  // ── ACT 7: POLICE SEARCH & INSTITUTIONAL BLIND SPOT ──────────────────────────
  // S17: 33.05s (Police) — Police search 750 banks, only check doors
  add({
    id: 'S17',
    at: cut(9, 0),
    note: '750 banks searched, checked doors only',
    cam: { x: 680, y: 460, w: 1500, push: 0.02, pushDur: 2.0, px: 680, py: 460, pw: 920 },
    draw(c, V, lt, t) {
      policeCheckScene(V, { t, dof: 0 });
      // Police constable shining flashlight at locked bank front door
      V.chars(1, 0, COLD_RIM, (k) => {
        policeOfficer(k, {
          x: 240,
          y: STREET_Y,
          h: 420,
          dir: 1,
          face: { expr: 'determined', t, look: 0.8 }
        });
      });
    },
    over(c, lt) {
      pill(c, '750 BANKS SEARCHED · DOORS LOCKED', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1));
    },
    cues: [
      [cut(9, 0), 'whoosh', { gain: 0.7 }],
      [cut(9, 0) + 0.3, 'blip', { gain: 0.6 }]
    ]
  });

  // ── ACT 8: THE SEALED ARCHIVES (MEPO 26/418/4) ──────────────────────────────
  // S18: 36.57s (Britain) — Britain sealed files until 2071
  add({
    id: 'S18',
    at: cut(10, 0),
    note: 'National Archives: Scotland Yard MEPO files sealed',
    cam: { x: 960, y: 460, w: 1300, push: 0.03, pushDur: 2.0, px: 960, py: 460, pw: 820 },
    draw(c, V, lt, t) {
      const stampK = clamp((lt - 0.2) / 0.3, 0, 1);
      sealedDossierScene(V, { t, dof: 0, stampK });
    },
    over(c, lt) {
      stamp(c, 'THE NATIONAL ARCHIVES · KEW', pop(lt, 0.1));
    },
    cues: [
      [cut(10, 0), 'stamp_thud', { gain: 1.0 }],
      [cut(10, 0) + 0.2, 'blip', { gain: 0.6 }]
    ]
  });

  // S19: 39.42s (beat / Seven) — 700 pages locked for another 45 years
  add({
    id: 'S19',
    at: L(11).start,
    note: '700 pages sealed until 2071 (FOI Exemption)',
    cam: { x: 960, y: 520, w: 1000, push: 0.02, pushDur: 2.0, px: 960, py: 520, pw: 680 },
    draw(c, V, lt, t) {
      sealedDossierScene(V, { t, dof: 0, stampK: 1.0 });
    },
    over(c, lt) {
      pill(c, '700 PAGES CLOSED UNTIL 1 JANUARY 2071', PIC.x + PIC.w / 2, PIC.y + (PORTRAIT ? 240 : 80) * U, pop(lt, 0.1), { fg: '#f87171', ring: '#dc2626' });
    },
    cues: [
      [L(11).start, 'whoosh', { gain: 0.7 }],
      [L(11).start + 0.3, 'blip', { gain: 0.6 }]
    ]
  });

  // S20: 41.48s (locked) — Title & Channel Climax Card
  add({
    id: 'S20',
    at: cut(12, 3),
    card: true,
    note: 'Baker Street Heist Climax & End Card',
    draw(c, V, lt) {
      navyBg(c, lt, { hot: '#281c3b' });
      const k = eo(lt / 0.5);
      c.save();
      c.globalAlpha = k;
      const s1 = fit(c, 'THE BAKER STREET HEIST', 62 * U, W * 0.85);
      const s2 = fit(c, 'SEALED UNTIL 2071', 94 * U, W * 0.88);
      goldText(c, 'THE BAKER STREET HEIST', W / 2, H / 2 - 65 * U, s1, { col: '#fed7aa', ls: 0.08 });
      goldText(c, 'SEALED UNTIL 2071', W / 2, H / 2 + 35 * U, s2, { col: '#f59e0b', ls: 0.06 });

      c.font = `800 ${22 * U}px Nunito`;
      c.fillStyle = '#94a3b8';
      c.textAlign = 'center';
      c.fillText('RENDEREDLABS · DOCUMENTARY ANIMATION', W / 2, H / 2 + 130 * U);
      c.restore();
    },
    cues: [
      [cut(12, 3), 'whoosh', { gain: 0.8 }],
      [cut(12, 3) + 0.1, 'sub_drone', { dur: 2.8, gain: 0.7 }]
    ]
  });

  return S;
}
