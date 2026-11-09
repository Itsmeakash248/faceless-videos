// Scene 6: Catastrophic Tine Breakage & Hull Loss
// Halfway to the surface, claw tines snap under 16,000 ft stress; main hull plunges into the abyss.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawTineBreakage(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Oceanic mid-depths (9,000 ft)
  V.layer(1.5, 0, (c) => {
    const bg = vgrad(c, 0, 0, h, [
      [0, '#020b18'],
      [1, '#010307']
    ]);
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    // Chaotic underwater cavitation turbulence bubbles
    c.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 45; i++) {
      const bx = (i * 49 + Math.sin(t * 3 + i) * 30) % w;
      const by = (i * 31 - (lt * 180)) % h;
      circ(c, bx, (by + h) % h, (i % 3) + 1.5);
      c.fill();
    }
  });

  // Spotlight beams flickering violently from the impact
  V.layer(1.2, 0, (c) => {
    const flicker = 0.5 + 0.5 * Math.sin(t * 35);
    c.fillStyle = `rgba(56, 189, 248, ${0.35 * flicker})`;
    c.beginPath();
    c.moveTo(850, 100);
    c.lineTo(1070, 100);
    c.lineTo(1500, 1000);
    c.lineTo(420, 1000);
    c.closePath();
    c.fill();
  });

  // Structural Fracture & Hull Breakup
  V.chars(1.0, 0, 0, (c) => {
    const rigX = 960, rigY = 320;
    const snapT = clamp(lt * 1.4); // Breakage moment
    const broken = snapT > 0.4;

    c.save();
    c.translate(rigX, rigY);

    // 1. Pipe String & Overhead Claw Bridge
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 14;
    c.beginPath();
    c.moveTo(0, -280);
    c.lineTo(0, -120);
    c.stroke();

    c.fillStyle = '#1e293b';
    rr(c, -380, -120, 760, 65, 10);
    c.fill();
    c.strokeStyle = '#475569';
    c.lineWidth = 3;
    c.stroke();

    // 2. Intact Forward Tines (Holding the 38-foot Bow Section)
    c.save();
    c.translate(-220, -55);
    c.fillStyle = '#334155';
    c.fillRect(-15, 0, 30, 160);
    c.fillStyle = '#f59e0b';
    c.beginPath();
    c.moveTo(-15, 160);
    c.bezierCurveTo(-15, 230, 50, 250, 90, 230);
    c.lineTo(75, 210);
    c.bezierCurveTo(45, 225, 5, 210, 5, 160);
    c.closePath();
    c.fill();
    c.restore();

    // The 38-Foot Bow Section (STILL SECURED IN FORWARD TINES)
    c.fillStyle = '#0f172a';
    poly(c, [
      -360, 80,   // Nose tip
      -310, 55,   // Upper deck
      -140, 55,   // Fracture line
      -130, 175,  // Fracture lower
      -310, 175,  // Keel
      -360, 130   // Nose bottom
    ]);
    c.fill();
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 3;
    c.stroke();

    // 3. SNAPPING TINES & MAIN HULL BREAKING AWAY
    if (!broken) {
      // Stress fracture lines glowing red right before snap
      c.strokeStyle = '#ef4444';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(110, -10);
      c.lineTo(130, 60);
      c.lineTo(100, 110);
      c.stroke();
    } else {
      // Tines Snapped and Bent Outward!
      c.save();
      c.translate(110, -55);
      c.rotate(0.5); // snapped jagged angle
      c.fillStyle = '#ef4444';
      c.fillRect(-15, 0, 30, 70); // sheared jagged stub

      // Spark / metal debris fragments bursting
      c.fillStyle = '#fef08a';
      for (let p = 0; p < 12; p++) {
        const sx = Math.sin(p * 2) * 50 * (lt - 0.3);
        const sy = 60 + Math.cos(p * 3) * 60 * (lt - 0.3);
        circ(c, sx, sy, 3 + (p % 3));
        c.fill();
      }
      c.restore();

      // Main Hull Section Falling Away into the Deep
      const fallDist = (lt - 0.3) * 220; // plunges downwards
      const fallRot = (lt - 0.3) * 0.12;  // rolls as it falls
      c.save();
      c.translate(80, 120 + fallDist);
      c.rotate(fallRot);

      // Main submarine hull (torn torn jagged edge on left)
      c.fillStyle = '#0b1320';
      poly(c, [
        -60, -60,  // Jagged tear edge
        360, -60,  // Sail / midships
        360, 60,   // Keel
        -40, 60,   // Jagged bottom tear
        -75, 10,   // Jagged metal projection
        -50, -25
      ]);
      c.fill();
      c.strokeStyle = '#ef4444';
      c.lineWidth = 3;
      c.stroke();

      // Conning tower & sail plunging into the abyss
      c.fillStyle = '#0f172a';
      c.fillRect(140, -130, 120, 70);
      // Ballistic missiles visible in sail
      c.fillStyle = '#ef4444';
      for (let m = 0; m < 3; m++) {
        c.fillRect(160 + m * 35, -135, 22, 10);
      }

      // Trail of churned ocean bubbles behind falling hull
      c.fillStyle = 'rgba(148, 163, 184, 0.4)';
      for (let b = 0; b < 14; b++) {
        circ(c, -30 + b * 25, -70 - b * 15, 8 + (b % 6));
        c.fill();
      }

      c.restore();
    }

    c.restore();
  });

  // CIA Control Room Screen Reaction (Bottom Corner PiP)
  V.layer(0.8, 0, (c) => {
    const px = 80, py = 680;
    c.fillStyle = 'rgba(15, 23, 42, 0.92)';
    rr(c, px, py, 380, 260, 14);
    c.fill();
    c.strokeStyle = '#ef4444';
    c.lineWidth = 4;
    c.stroke();

    // Stickman Engineer in control room reacting in shock
    figure(c, {
      x: px + 180,
      y: py + 220,
      h: 170,
      dir: 1,
      view: 'side',
      face: { expr: 'shocked', t, look: 0.2 },
      hands: [[px + 150, py + 120], [px + 210, py + 120]] // hands to face in shock
    });

    c.fillStyle = '#ef4444';
    c.font = 'bold 16px monospace';
    c.fillText('CONTROL TELEMETRY: TINE FAILURE', px + 25, py + 40);
  });

  // HUD Warnings
  pill(ctx, 'CATASTROPHIC TINE FRACTURE · 16,000 FT STRESS', 80, 110, { col: '#ef4444', bg: 'rgba(69, 10, 10, 0.9)' });
  pill(ctx, 'MAIN HULL & 3 MISSILES PLUNGED TO SEABED', 80, 160, { col: '#fca5a5', bg: 'rgba(69, 10, 10, 0.9)' });
  stamp(ctx, 'MISSION FAILURE / PARTIAL', 1560, 120, { col: '#ef4444', border: '#ef4444' });
}
