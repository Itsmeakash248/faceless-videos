// Project Azorian (K-129) — Shot Choreography & Cut Timings
// Keyed to word alignments (wd / cut), never to hardcoded seconds.
import { cut, wd, ln } from './core/timing.js';
import { drawOceanSurface } from './sets/oceanSurface.js';
import { drawSosusNetwork } from './sets/sosusNetwork.js';
import { drawDepthDescent } from './sets/depthDescent.js';
import { drawGiantClaw } from './sets/giantClaw.js';
import { drawClawGrasp } from './sets/clawGrasp.js';
import { drawTineBreakage } from './sets/tineBreakage.js';
import { drawBowRecovery } from './sets/bowRecovery.js';
import { drawBurialAtSea } from './sets/burialAtSea.js';
import { drawGlomarResponse } from './sets/glomarResponse.js';
import { pill, stamp, goldText } from './core/gfx.js';

export function buildShots() {
  return [
    // 1. Cold Open / Title
    {
      id: 'S01_TITLE',
      at: 0.0,
      cam: { x: 960, y: 540, w: 1920, px: 960, py: 540, pw: 1080 },
      note: 'Pacific Ocean / Cold Open',
      draw(c, V, lt, t) {
        drawOceanSurface(c, V, lt, t);
      },
      over(c, lt, t) {
        if (lt < 0.35) {
          goldText(c, 'PROJECT AZORIAN', 960, 480, { size: 68 });
          c.fillStyle = '#cbd5e1';
          c.font = 'bold 24px monospace';
          c.textAlign = 'center';
          c.fillText("THE CIA'S $500 MILLION CLAW AT 16,500 FEET", 960, 540);
        }
      }
    },

    // 2. K-129 Submarine Vanished
    {
      id: 'S02_K129_SURFACE',
      at: cut(0, 0), // "In March 1968"
      cam: { x: 960, y: 510, w: 1850, px: 960, py: 510, pw: 1080, push: 0.03 },
      note: 'K-129 Vanished in Pacific',
      draw(c, V, lt, t) {
        drawOceanSurface(c, V, lt, t);
      },
      hud: 'MARCH 1968'
    },

    // 3. Soviet Search Fleets
    {
      id: 'S03_SOVIET_SEARCH',
      at: cut(1, 0), // "Soviet search fleets"
      cam: { x: 800, y: 520, w: 1750, px: 800, py: 520, pw: 1080 },
      note: 'Soviet fleets search 2 months',
      draw(c, V, lt, t) {
        drawOceanSurface(c, V, lt, t);
      },
      over(c, lt, t) {
        stamp(c, 'SEARCH: FRUITLESS', 1560, 200, { col: '#ef4444', border: '#ef4444' });
      }
    },

    // 4. US Hydrophones & SOSUS Network
    {
      id: 'S04_SOSUS_ARRAY',
      at: cut(2, 0), // "US hydrophones heard it"
      cam: { x: 960, y: 540, w: 1920, px: 960, py: 540, pw: 1080 },
      note: 'SOSUS Acoustic Array',
      draw(c, V, lt, t) {
        drawSosusNetwork(c, V, lt, t);
      },
      hud: '16,500 FT'
    },

    // 5. Implosion Shockwave
    {
      id: 'S05_IMPLOSION',
      at: cut(2, 4), // "implode, sixteen thousand feet"
      cam: { x: 1250, y: 640, w: 1500, px: 1250, py: 640, pw: 1080, push: 0.04 },
      note: 'K-129 Implosion at 16,500 ft',
      draw(c, V, lt, t) {
        drawSosusNetwork(c, V, lt, t);
      }
    },

    // 6. Over Three Miles Deep (Descent Cross Section)
    {
      id: 'S06_DEPTH_DROP',
      at: cut(4, 0), // "Over three miles deep"
      cam: { x: 960, y: 540, w: 1920, px: 960, py: 540, pw: 1080 },
      note: '3 Miles Vertical Depth Drop',
      draw(c, V, lt, t) {
        drawDepthDescent(c, V, lt, t);
      },
      hud: '3.1 MILES'
    },

    // 7. Glomar Explorer Ship & Moon Pool
    {
      id: 'S07_GLOMAR_EXPLORER',
      at: cut(5, 0), // "The CIA spent five hundred million"
      cam: { x: 960, y: 460, w: 1800, px: 960, py: 460, pw: 1080, push: 0.02 },
      note: 'Hughes Glomar Explorer 600ft',
      draw(c, V, lt, t) {
        drawOceanSurface(c, V, lt, t);
      },
      hud: '$500,000,000'
    },

    // 8. Secret Moon Pool Under Hull
    {
      id: 'S08_MOON_POOL',
      at: cut(5, 7), // "secret recovery ship"
      cam: { x: 960, y: 550, w: 1400, px: 960, py: 550, pw: 1080 },
      note: 'Moon pool doors underwater',
      draw(c, V, lt, t) {
        drawOceanSurface(c, V, lt, t);
      }
    },

    // 9. Lowering Three Miles of Pipe
    {
      id: 'S09_PIPE_STRING',
      at: cut(6, 0), // "Lowering three miles of pipe"
      cam: { x: 960, y: 540, w: 1920, px: 960, py: 540, pw: 1080 },
      note: '3-mile pipe lowering',
      draw(c, V, lt, t) {
        drawDepthDescent(c, V, lt, t);
      }
    },

    // 10. Giant Claw "Clementine" Reveal
    {
      id: 'S10_GIANT_CLAW',
      at: cut(6, 5), // "steal the wreck"
      cam: { x: 960, y: 440, w: 1750, px: 960, py: 440, pw: 1080, push: 0.03 },
      note: 'Clementine 100ft capture claw',
      draw(c, V, lt, t) {
        drawGiantClaw(c, V, lt, t);
      },
      hud: '100 FT CLAW'
    },

    // 11. Seabed Approach
    {
      id: 'S11_SEABED_APPROACH',
      at: cut(7, 0), // "On the seabed"
      cam: { x: 960, y: 680, w: 1850, px: 960, py: 680, pw: 1080 },
      note: 'Seabed approach onto K-129',
      draw(c, V, lt, t) {
        drawClawGrasp(c, V, lt, t);
      }
    },

    // 12. Claw Seizes Hull
    {
      id: 'S12_CLAW_SEIZE',
      at: cut(7, 4), // "claw seized the hull"
      cam: { x: 960, y: 660, w: 1550, px: 960, py: 660, pw: 1080 },
      note: 'Hydraulic tines clamp around hull',
      draw(c, V, lt, t) {
        drawClawGrasp(c, V, lt, t);
      },
      hud: '1,750 TONS'
    },

    // 13. Halfway Up Lift
    {
      id: 'S13_LIFT_HALFWAY',
      at: cut(8, 0), // "Halfway up, disaster struck"
      cam: { x: 960, y: 450, w: 1750, px: 960, py: 450, pw: 1080 },
      note: 'Halfway to surface at 9,000 ft',
      draw(c, V, lt, t) {
        drawTineBreakage(c, V, lt, t);
      }
    },

    // 14. Tines Snapping Catastrophe
    {
      id: 'S14_TINE_SNAP',
      at: cut(10, 0), // "The tines snapped"
      cam: { x: 960, y: 420, w: 1600, px: 960, py: 420, pw: 1080 },
      note: 'Catastrophic structural failure',
      draw(c, V, lt, t) {
        drawTineBreakage(c, V, lt, t);
      },
      hud: 'FRACTURE'
    },

    // 15. Broken Hull Plunges to Abyss
    {
      id: 'S15_HULL_PLUNGE',
      at: cut(11, 0), // "The broken hull plunged back"
      cam: { x: 1020, y: 480, w: 1700, px: 1020, py: 480, pw: 1080 },
      note: 'Main hull falls to abyss',
      draw(c, V, lt, t) {
        drawTineBreakage(c, V, lt, t);
      }
    },

    // 16. 38-Foot Bow Recovered
    {
      id: 'S16_BOW_RECOVERED',
      at: cut(12, 0), // "Only a thirty-eight foot bow"
      cam: { x: 960, y: 520, w: 1750, px: 960, py: 520, pw: 1080, push: 0.02 },
      note: '38-ft bow inside moon pool',
      draw(c, V, lt, t) {
        drawBowRecovery(c, V, lt, t);
      },
      hud: '38 FT BOW'
    },

    // 17. Two Nuclear Torpedoes
    {
      id: 'S17_NUCLEAR_TORPEDOES',
      at: cut(12, 8), // "two nuclear torpedoes"
      cam: { x: 820, y: 540, w: 1350, px: 820, py: 540, pw: 1080 },
      note: 'Nuclear torpedo inspection',
      draw(c, V, lt, t) {
        drawBowRecovery(c, V, lt, t);
      },
      hud: '2 WARHEADS'
    },

    // 18. Burial at Sea
    {
      id: 'S18_BURIAL_AT_SEA',
      at: cut(12, 12), // "and six sailors"
      cam: { x: 960, y: 640, w: 1850, px: 960, py: 640, pw: 1080 },
      note: 'Burial at sea with military honours',
      draw(c, V, lt, t) {
        drawBurialAtSea(c, V, lt, t);
      },
      hud: '6 SAILORS'
    },

    // 19. Press Conference Leak
    {
      id: 'S19_PRESS_LEAK',
      at: cut(13, 0), // "When leaked, the CIA gave"
      cam: { x: 960, y: 600, w: 1850, px: 960, py: 600, pw: 1080 },
      note: 'Press conference & media leak 1975',
      draw(c, V, lt, t) {
        drawGlomarResponse(c, V, lt, t);
      }
    },

    // 20. Glomar Response
    {
      id: 'S20_GLOMAR_RESPONSE',
      at: cut(14, 0), // "[Spokesperson] We can neither confirm nor deny"
      cam: { x: 960, y: 540, w: 1700, px: 960, py: 540, pw: 1080 },
      note: 'Iconic Glomar Response Doctrine',
      draw(c, V, lt, t) {
        drawGlomarResponse(c, V, lt, t);
      },
      hud: 'GLOMAR'
    },

    // 21. End Outro
    {
      id: 'S21_END',
      at: 43.6,
      cam: { x: 960, y: 540, w: 1920, px: 960, py: 540, pw: 1080 },
      note: 'Outro / Channel Card',
      draw(c, V, lt, t) {
        drawGlomarResponse(c, V, lt, t);
      },
      over(c, lt, t) {
        c.fillStyle = 'rgba(15, 23, 42, 0.95)';
        c.fillRect(0, 0, 1920, 1080);
        goldText(c, 'RENDEREDLABS', 960, 480, { size: 64 });
        c.fillStyle = '#94a3b8';
        c.font = '22px monospace';
        c.textAlign = 'center';
        c.fillText('SUBSCRIBE FOR UNTOLD COLD WAR HEISTS', 960, 545);
      }
    }
  ];
}
