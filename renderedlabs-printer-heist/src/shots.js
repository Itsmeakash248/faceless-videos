// 19 Cinematic Shots for "The $81 Million Heist Hidden by a Printer"
import * as THREE from 'three';
import { E, seg, kf, clamp, lerp, V } from './core/util.js';
import { S, Se } from './core/timing.js';

export function buildShots(T, world) {
  const shots = [
    // ---------------- ACT 1: DHAKA DEALING ROOM & THE SILENT PRINTER ----------------
    {
      id: 'S01',
      start: 0.00,
      set: 'dhaka',
      note: 'Dhaka dealing room wide dawn',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.88, E.io);
        W.sets.dhaka.officer.poseWalk(lt, 3.2);
        W.sets.dhaka.officer.group.position.set(
          lerp(-0.4, 0.1, u),
          0,
          lerp(2.4, 1.3, u)
        );
        W.sets.dhaka.officer.group.rotation.y = Math.PI - 0.2;
        return {
          cam: {
            pos: [lerp(-1.6, -1.2, u), lerp(2.1, 1.9, u), lerp(3.2, 2.6, u)],
            look: [0.2, 1.1, 0.4],
            fov: 38,
            shake: 0.12,
          },
          look: { exp: 1.05, warm: 0.2, sat: 0.95, vig: 0.35, aper: 0.012, focus: 2.2 },
          mb: 2,
        };
      }
    },
    {
      id: 'S02',
      start: 1.88,
      set: 'dhaka',
      note: 'Officer tracking shot toward desk',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.78, E.out);
        W.sets.dhaka.officer.poseWalk(lt, 3.5);
        W.sets.dhaka.officer.group.position.set(0.1, 0, lerp(1.3, 0.5, u));
        W.sets.dhaka.officer.group.rotation.y = Math.PI;
        return {
          cam: {
            pos: [0.35, 1.65, lerp(2.2, 1.5, u)],
            look: [0.1, 1.3, -0.6],
            fov: 42,
            shake: 0.15,
          },
          look: { exp: 1.08, warm: 0.15, sat: 0.92, vig: 0.32, aper: 0.018, focus: 1.2 },
          mb: 2,
        };
      }
    },
    {
      id: 'S03',
      start: 3.66,
      set: 'dhaka',
      note: 'Dealing room interior & printer stand push-in',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.84, E.io);
        W.sets.dhaka.officer.poseInspect(lt, u);
        W.sets.dhaka.officer.group.position.set(0.7, 0, -0.7);
        W.sets.dhaka.officer.group.rotation.y = Math.PI * 0.75;
        return {
          cam: {
            pos: [lerp(-0.2, 0.6, u), lerp(1.5, 1.2, u), lerp(0.8, -0.3, u)],
            look: [1.4, 0.85, -1.35],
            fov: 36,
            shake: 0.10,
          },
          look: { exp: 1.1, warm: 0.05, sat: 0.9, vig: 0.38, aper: 0.022, focus: 1.4 },
          mb: 2,
        };
      }
    },
    {
      id: 'S04',
      start: 5.50,
      set: 'dhaka',
      note: 'HP LaserJet 400 close-up dead silent',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.14, E.lin);
        W.sets.dhaka.printer.setLed(true, false);
        W.sets.dhaka.printer.setTrayEmpty(true);
        return {
          cam: {
            pos: [lerp(1.68, 1.58, u), lerp(1.02, 0.96, u), lerp(-1.05, -1.02, u)],
            look: [1.4, 0.88, -1.35],
            fov: 30,
            shake: 0.08,
          },
          look: { exp: 1.12, warm: 0.0, sat: 0.88, vig: 0.42, aper: 0.028, focus: 0.45 },
          mb: 1,
        };
      }
    },
    {
      id: 'S05',
      start: 7.64,
      set: 'dhaka',
      note: 'Empty output tray top-down macro',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.56, E.io);
        W.sets.dhaka.printer.setTrayEmpty(true);
        const rot = lerp(-0.1, 0.15, u);
        return {
          cam: {
            pos: [1.4 + Math.sin(rot) * 0.1, 1.35, -1.35 + Math.cos(rot) * 0.1],
            look: [1.4, 0.88, -1.35],
            fov: 32,
            shake: 0.06,
          },
          look: { exp: 1.15, warm: 0.0, sat: 0.85, vig: 0.45, aper: 0.035, focus: 0.46 },
          mb: 2,
        };
      }
    },
    {
      id: 'S06',
      start: 9.20,
      set: 'dhaka',
      note: 'Officer inspecting roller assuming paper jam',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.6, E.io);
        W.sets.dhaka.officer.poseInspect(lt, lerp(0.3, 1.0, u));
        W.sets.dhaka.officer.group.position.set(0.95, 0, -0.9);
        W.sets.dhaka.officer.group.rotation.y = Math.PI * 0.85;
        return {
          cam: {
            pos: [lerp(0.85, 0.95, u), lerp(1.7, 1.55, u), lerp(-0.3, -0.5, u)],
            look: [1.38, 0.88, -1.35],
            fov: 34,
            shake: 0.12,
          },
          look: { exp: 1.08, warm: 0.1, sat: 0.9, vig: 0.36, aper: 0.02, focus: 0.95 },
          mb: 2,
        };
      }
    },

    // ---------------- ACT 2: THE TERMINAL BREACH & 35 WIRE TRANSFERS ----------------
    {
      id: 'S07',
      start: 11.80,
      set: 'dhaka',
      note: 'Terminal night session breach & keystrokes',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.0, E.out);
        return {
          cam: {
            pos: [lerp(0.2, 0.0, u), lerp(1.15, 1.02, u), lerp(-0.8, -1.15, u)],
            look: [0.0, 0.98, -1.5],
            fov: 32,
            shake: 0.14,
          },
          look: { exp: 1.25, warm: -0.15, sat: 1.1, vig: 0.48, aper: 0.024, focus: 0.4 },
          mb: 2,
        };
      }
    },
    {
      id: 'S08',
      start: 13.80,
      set: 'network',
      note: '35 glowing financial packet orders fan out',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.8, E.io);
        return {
          cam: {
            pos: [lerp(-2.8, -1.8, u), lerp(2.2, 1.6, u), lerp(3.4, 2.8, u)],
            look: [0, 0.4, 0],
            fov: 42,
            shake: 0.10,
          },
          look: { exp: 1.2, warm: -0.2, sat: 1.2, vig: 0.4, aper: 0.015, focus: 3.5 },
          mb: 2,
        };
      }
    },
    {
      id: 'S09',
      start: 15.60,
      set: 'network',
      note: 'Global wire transfer routes soaring to $1 Billion',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.19, E.lin);
        return {
          cam: {
            pos: [lerp(1.5, 2.8, u), lerp(2.4, 1.8, u), lerp(3.2, 3.5, u)],
            look: [0, 0.2, 0],
            fov: 44,
            shake: 0.08,
          },
          look: { exp: 1.18, warm: -0.1, sat: 1.25, vig: 0.42, aper: 0.01, focus: 4.2 },
          mb: 2,
        };
      }
    },

    // ---------------- ACT 3: MALWARE SILENCING THE PRINTER ----------------
    {
      id: 'S10',
      start: 17.79,
      set: 'dhaka',
      note: 'Malware patches two bytes inside memory',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.01, E.io);
        W.sets.dhaka.printer.updateLcd('NROFF INTERCEPT', '2 BYTES PATCHED', true);
        W.sets.dhaka.printer.setLed(true, true, true, t);
        return {
          cam: {
            pos: [lerp(1.48, 1.53, u), lerp(1.05, 0.98, u), lerp(-1.18, -1.14, u)],
            look: [1.52, 0.94, -1.24],
            fov: 24,
            shake: 0.15,
          },
          look: { exp: 1.3, warm: -0.25, sat: 1.3, vig: 0.5, aper: 0.03, focus: 0.32 },
          mb: 2,
        };
      }
    },
    {
      id: 'S11',
      start: 19.80,
      set: 'dhaka',
      note: 'Print queue purged physical confirmations erased',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.09, E.io);
        W.sets.dhaka.printer.updateLcd('QUEUE PURGED', 'EMPTY SPOOLER', true);
        return {
          cam: {
            pos: [lerp(1.15, 1.25, u), lerp(1.18, 1.05, u), lerp(-0.95, -1.05, u)],
            look: [1.4, 0.88, -1.35],
            fov: 28,
            shake: 0.10,
          },
          look: { exp: 1.15, warm: -0.1, sat: 0.95, vig: 0.44, aper: 0.025, focus: 0.55 },
          mb: 2,
        };
      }
    },

    // ---------------- ACT 4: MANILA CASINO LAUNDERING & $81M ----------------
    {
      id: 'S12',
      start: 21.89,
      set: 'casino',
      note: 'Manila VIP casino floor and roulette wheel',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.91, E.io);
        W.sets.casino.casino.animate(t, 0);
        return {
          cam: {
            pos: [lerp(-1.4, -0.9, u), lerp(1.8, 1.4, u), lerp(1.8, 1.3, u)],
            look: [-0.3, 0.8, 0],
            fov: 38,
            shake: 0.12,
          },
          look: { exp: 1.15, warm: 0.35, sat: 1.15, vig: 0.38, aper: 0.018, focus: 1.5 },
          mb: 2,
        };
      }
    },
    {
      id: 'S13',
      start: 23.80,
      set: 'casino',
      note: 'High-roller chips swept away into untraceable cash',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.17, E.io);
        W.sets.casino.casino.animate(t, u);
        return {
          cam: {
            pos: [lerp(0.85, 0.55, u), lerp(1.35, 1.15, u), lerp(0.9, 0.65, u)],
            look: [0.45, 0.85, 0],
            fov: 32,
            shake: 0.10,
          },
          look: { exp: 1.2, warm: 0.4, sat: 1.2, vig: 0.42, aper: 0.028, focus: 0.75 },
          mb: 2,
        };
      }
    },

    // ---------------- ACT 5: THE $20M TYPO & THE $850M FED GATE ----------------
    {
      id: 'S14',
      start: 25.97,
      set: 'typo',
      note: 'SWIFT wire transfer document inspection',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.83, E.out);
        W.sets.typo.wireDoc.setScanProgress(u * 0.75, false);
        return {
          cam: {
            pos: [0, lerp(0.5, 0.1, u), lerp(2.2, 1.6, u)],
            look: [0, 0.0, 0],
            fov: 34,
            shake: 0.06,
          },
          look: { exp: 1.15, warm: 0.0, sat: 1.0, vig: 0.35, aper: 0.015, focus: 1.6 },
          mb: 2,
        };
      }
    },
    {
      id: 'S15',
      start: 27.80,
      set: 'typo',
      note: 'Typo FUNDATION detected and payment halted',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.31, E.io);
        W.sets.typo.wireDoc.setScanProgress(0.72 + u * 0.1, true);
        if (u > 0.4) {
          W.sets.typo.wireDoc.triggerStamp();
        }
        return {
          cam: {
            pos: [lerp(-0.05, 0.05, u), lerp(0.12, 0.02, u), lerp(1.2, 0.95, u)],
            look: [0, -0.05, 0],
            fov: 28,
            shake: 0.12,
          },
          look: { exp: 1.22, warm: 0.15, sat: 1.25, vig: 0.45, aper: 0.032, focus: 0.98 },
          mb: 2,
        };
      }
    },
    {
      id: 'S16',
      start: 30.11,
      set: 'network',
      note: 'NY Fed vault portal shuts down $850M',
      setup(W, lt, t) {
        const u = seg(lt, 0, 3.32, E.io);
        return {
          cam: {
            pos: [lerp(1.2, 1.8, u), lerp(0.8, 0.4, u), lerp(2.6, 2.1, u)],
            look: [3.5, 0.0, 0],
            fov: 36,
            shake: 0.12,
          },
          look: { exp: 1.2, warm: -0.15, sat: 1.15, vig: 0.42, aper: 0.02, focus: 2.3 },
          mb: 2,
        };
      }
    },

    // ---------------- ACT 6: SATURDAY PRINTER REBOOT & THE 10-YEAR AUDIT ----------------
    {
      id: 'S17',
      start: 33.43,
      set: 'dhaka',
      note: 'Printer restarts on Saturday spitting 46 queries',
      setup(W, lt, t) {
        const u = seg(lt, 0, 3.37, E.io);
        W.sets.dhaka.printer.updateLcd('PRINTING...', '46 FED QUERIES', true);
        W.sets.dhaka.printer.setLed(true, true, true, t);
        W.sets.dhaka.printer.setSheetsVisibleCount(Math.min(5, Math.floor(u * 6)));
        W.sets.dhaka.printer.animatePaperFeed(u);
        return {
          cam: {
            pos: [lerp(1.85, 1.62, u), lerp(1.15, 0.98, u), lerp(-1.12, -1.05, u)],
            look: [1.4, 0.88, -1.35],
            fov: 28,
            shake: 0.14,
          },
          look: { exp: 1.18, warm: 0.05, sat: 0.92, vig: 0.4, aper: 0.026, focus: 0.48 },
          mb: 2,
        };
      }
    },
    {
      id: 'S18',
      start: 36.80,
      set: 'ledger',
      note: '10,000-page case docket and CID indictment',
      setup(W, lt, t) {
        const u = seg(lt, 0, 1.80, E.out);
        return {
          cam: {
            pos: [lerp(-1.2, -0.85, u), lerp(1.2, 0.85, u), lerp(1.5, 1.15, u)],
            look: [-0.4, 0.4, 0],
            fov: 34,
            shake: 0.08,
          },
          look: { exp: 1.12, warm: 0.1, sat: 1.05, vig: 0.38, aper: 0.02, focus: 1.2 },
          mb: 2,
        };
      }
    },
    {
      id: 'S19',
      start: 38.60,
      set: 'ledger',
      note: 'Final hero balance sheet $66.4M still missing',
      setup(W, lt, t) {
        const u = seg(lt, 0, 2.23, E.io);
        return {
          cam: {
            pos: [lerp(0.9, 0.65, u), lerp(1.1, 0.85, u), lerp(2.2, 1.75, u)],
            look: [0.65, 0.75, 0],
            fov: 32,
            shake: 0.06,
          },
          look: { exp: 1.15, warm: 0.12, sat: 1.1, vig: 0.45, aper: 0.015, focus: 1.75 },
          mb: 2,
        };
      }
    }
  ];

  return shots;
}
