// Scene 5: The Seabed Grasp & Latching onto K-129
// Clementine's steel tines lock around the 1,750-ton forward section of K-129 on the seabed.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawClawGrasp(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Abyssal ocean floor (16,500 ft)
  V.layer(1.4, 0, (c) => {
    c.fillStyle = '#01050a';
    c.fillRect(0, 0, w, h);

    // Deep seabed silt terrain with manganese nodules scattered
    const seabedGrad = vgrad(c, 0, 720, h, [
      [0, '#0a1420'],
      [1, '#040810']
    ]);
    c.fillStyle = seabedGrad;
    c.beginPath();
    c.moveTo(0, 740);
    c.bezierCurveTo(480, 720, 1100, 760, 1920, 730);
    c.lineTo(1920, h);
    c.lineTo(0, h);
    c.closePath();
    c.fill();

    // Manganese nodules (Howard Hughes' cover story objects!)
    c.fillStyle = '#1e293b';
    for (let i = 0; i < 40; i++) {
      const nx = (i * 47) % w;
      const ny = 760 + (i * 29) % 280;
      circ(c, nx, ny, 6 + (i % 5));
      c.fill();
    }
  });

  // Spotlight cones illuminating the target wreck
  V.layer(1.2, 0, (c) => {
    const spotX = 960, spotY = 220;
    const cone = vgrad(c, spotX, spotY, 850, [
      [0, 'rgba(56, 189, 248, 0.6)'],
      [0.6, 'rgba(14, 116, 144, 0.2)'],
      [1, 'transparent']
    ]);
    c.fillStyle = cone;
    c.beginPath();
    c.moveTo(spotX - 80, spotY);
    c.lineTo(spotX + 80, spotY);
    c.lineTo(spotX + 550, 850);
    c.lineTo(spotX - 550, 850);
    c.closePath();
    c.fill();
  });

  // Target Soviet Submarine K-129 & The Closing Claw Tines
  V.chars(1.0, 0, 0, (c) => {
    const subX = 960, subY = 740;

    c.save();
    c.translate(subX, subY);

    // 1. Soviet Submarine K-129 Forward Hull Section (1,750 tons)
    // Main black cylindrical hull
    c.fillStyle = '#0b1320';
    poly(c, [
      -420, -50,   // Bow nose
      -360, -75,   // Forward deck
      380, -75,    // Midships
      380, 45,     // Keel break
      -360, 45,    // Forward keel
      -420, 0      // Nose lower
    ]);
    c.fill();
    c.strokeStyle = '#1e293b';
    c.lineWidth = 4;
    c.stroke();

    // Red lead anti-fouling paint below waterline
    c.fillStyle = '#5c1d1d';
    c.fillRect(-360, 10, 740, 35);

    // Conning tower sail visible aft
    c.fillStyle = '#0f172a';
    c.fillRect(180, -145, 140, 70);
    // Three ballistic missile launch tube hatches (R-21 / SS-N-5)
    c.fillStyle = '#334155';
    for (let m = 0; m < 3; m++) {
      c.fillRect(205 + m * 38, -150, 26, 8);
    }

    // Soviet Submarine Identification marking
    c.fillStyle = '#e2e8f0';
    c.font = 'bold 18px monospace';
    c.fillText('K-129 (722)', -280, -20);

    // Torpedo tube shutter doors on the bow
    c.fillStyle = '#1e293b';
    for (let t = 0; t < 4; t++) {
      circ(c, -380, -35 + t * 20, 7);
      c.fill();
    }

    // 2. Giant Mechanical Claw "Clementine" Clamped Shut Around Hull
    const clampProgress = clamp(lt * 1.2); // Tines clamping shut
    const tineAngle = lerp(0.35, 0.0, clampProgress); // closes tight around hull

    // Main Overhead Truss descending
    c.fillStyle = '#1e293b';
    rr(c, -380, -280, 760, 70, 10);
    c.fill();
    c.strokeStyle = '#475569';
    c.lineWidth = 3;
    c.stroke();

    // Heavy Tines wrapping around the submarine hull
    [-240, -110, 20, 150].forEach(tx => {
      // Left tine
      c.save();
      c.translate(tx - 40, -210);
      c.rotate(-tineAngle);
      c.fillStyle = '#334155';
      c.fillRect(-15, 0, 30, 180);
      // Curved claw cradle biting under keel
      c.fillStyle = '#f59e0b';
      c.beginPath();
      c.moveTo(-15, 180);
      c.bezierCurveTo(-15, 270, 70, 290, 110, 265);
      c.lineTo(95, 240);
      c.bezierCurveTo(60, 260, 5, 240, 5, 180);
      c.closePath();
      c.fill();
      c.restore();

      // Right tine
      c.save();
      c.translate(tx + 40, -210);
      c.rotate(tineAngle);
      c.fillStyle = '#334155';
      c.fillRect(-15, 0, 30, 180);
      c.fillStyle = '#f59e0b';
      c.beginPath();
      c.moveTo(15, 180);
      c.bezierCurveTo(15, 270, -70, 290, -110, 265);
      c.lineTo(-95, 240);
      c.bezierCurveTo(-60, 260, -5, 240, -5, 180);
      c.closePath();
      c.fill();
      c.restore();
    });

    // Seabed silt plume billowing as tines bite into the floor
    if (clampProgress > 0.6) {
      c.fillStyle = 'rgba(148, 163, 184, 0.45)';
      for (let s = 0; s < 6; s++) {
        c.beginPath();
        c.ellipse(-300 + s * 130, 65, 80 + s * 10, 35, 0, 0, TAU);
        c.fill();
      }
    }

    c.restore();
  });

  // Top/Corner HUD Status Badges
  pill(ctx, 'SEABED CONTACT · 16,500 FT DEPTH', 80, 110, { col: '#22c55e', bg: 'rgba(2, 44, 34, 0.85)' });
  pill(ctx, 'MECHANICAL TINES CLAMPED AROUND FORWARD HULL', 80, 160, { col: '#f59e0b', bg: 'rgba(15, 23, 42, 0.85)' });
  stamp(ctx, 'TARGET SECURED', 1600, 120, { col: '#22c55e', border: '#22c55e' });
}
