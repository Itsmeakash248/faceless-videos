// Scene 7: The 38-Foot Bow Recovery in the Moon Pool
// Inside the Glomar Explorer's moon pool: 38-foot bow section, 2 nuclear torpedoes, radiation inspection.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawBowRecovery(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Interior of the 600-foot Glomar Explorer Moon Pool (Industrial steel well)
  V.layer(1.4, 0, (c) => {
    const bg = vgrad(c, 0, 0, h, [
      [0, '#0a0f1d'],
      [0.6, '#111827'],
      [1, '#080d1a']
    ]);
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    // Industrial steel ribs & catwalks inside the moon pool well
    c.strokeStyle = '#374151';
    c.lineWidth = 4;
    for (let x = 160; x < w; x += 220) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    }

    // Overhead high-bay halogen work lights
    [400, 960, 1520].forEach(lx => {
      c.fillStyle = '#fef08a';
      c.fillRect(lx - 40, 60, 80, 25);
      // Bright cone
      const cone = vgrad(c, lx, 85, 750, [
        [0, 'rgba(254, 240, 138, 0.45)'],
        [1, 'transparent']
      ]);
      c.fillStyle = cone;
      c.beginPath();
      c.moveTo(lx - 40, 85);
      c.lineTo(lx + 40, 85);
      c.lineTo(lx + 320, 750);
      c.lineTo(lx - 320, 750);
      c.closePath();
      c.fill();
    });
  });

  // Center: The Recovered 38-Foot Soviet Bow Section & Torpedo Compartment
  V.chars(1.0, 0, 0, (c) => {
    const bowX = 960, bowY = 560;

    c.save();
    c.translate(bowX, bowY);

    // Waterline sloshing inside moon pool well
    c.fillStyle = 'rgba(6, 78, 59, 0.55)';
    c.fillRect(-650, 180, 1300, 240);

    // 1. Recovered 38-Foot Bow Section Hull (Heavy steel cradled in broken claw)
    c.fillStyle = '#0f172a';
    poly(c, [
      -420, 40,   // Bow nose point
      -360, -110,  // Upper casing
      120, -110,   // Jagged torn rear boundary (38-foot point)
      140, 190,    // Lower fracture line
      -360, 190,   // Keel
      -420, 110
    ]);
    c.fill();
    c.strokeStyle = '#475569';
    c.lineWidth = 5;
    c.stroke();

    // Jagged metal fracture edge where the remaining 94 feet broke off
    c.strokeStyle = '#ef4444';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(120, -110);
    c.lineTo(135, -40);
    c.lineTo(110, 20);
    c.lineTo(145, 90);
    c.lineTo(125, 150);
    c.lineTo(140, 190);
    c.stroke();

    // 2. Torpedo Room Cutaway Interior (Revealing Ordnance)
    c.fillStyle = '#1e293b';
    rr(c, -320, -70, 400, 210, 8);
    c.fill();
    c.strokeStyle = '#64748b';
    c.lineWidth = 3;
    c.stroke();

    // Two Soviet Nuclear Torpedoes (53-65 / Type 53 nuclear-armed torpedoes)
    [-20, 60].forEach((ty, idx) => {
      // Torpedo cylindrical body
      c.fillStyle = '#0284c7';
      rr(c, -280, ty, 320, 45, 10);
      c.fill();

      // Nuclear warhead nose (painted red/white hazard)
      c.fillStyle = '#ef4444';
      c.fillRect(-280, ty, 60, 45);

      // Radiation Trefoil symbol on warhead
      c.fillStyle = '#fef08a';
      circ(c, -250, ty + 22, 10);
      c.fill();

      // Torpedo propeller screws at tail
      c.fillStyle = '#cbd5e1';
      c.fillRect(35, ty + 10, 18, 25);

      c.fillStyle = '#ffffff';
      c.font = 'bold 14px monospace';
      c.fillText(`53-58 NUCLEAR TORPEDO #${idx + 1}`, -210, ty + 28);
    });

    // 3. Catwalk alongside the recovered bow with Hazmat Stickmen
    c.fillStyle = '#334155';
    c.fillRect(-550, -120, 1100, 18); // Catwalk deck

    // Yellow Caution / Radiation Stripes
    c.fillStyle = '#f59e0b';
    for (let x = -540; x < 540; x += 40) {
      poly(c, [x, -120, x + 20, -120, x + 10, -102, x - 10, -102]);
      c.fill();
    }

    c.restore();
  });

  // Stickman CIA Nuclear Inspector in Hazmat Suit (Right Catwalk)
  V.layer(0.9, 0, (c) => {
    // Stickman inspector
    figure(c, {
      x: 1380,
      y: 440,
      h: 180,
      dir: -1,
      view: 'side',
      face: { expr: 'determined', t },
      hands: [[1310, 360], [1330, 370]] // holding Geiger counter probe
    });

    // Yellow Hazmat helmet overlay
    c.strokeStyle = '#facc15';
    c.lineWidth = 6;
    circ(c, 1380, 285, 32);
    c.stroke();

    // Geiger Counter Box & Cable
    c.fillStyle = '#0f172a';
    c.fillRect(1350, 350, 40, 30);
    c.strokeStyle = '#22c55e';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(1350, 365);
    c.lineTo(1310, 365);
    c.stroke();

    // Blinking Geiger needle
    c.fillStyle = '#22c55e';
    circ(c, 1310, 365, 6);
    c.fill();
  });

  // Metric HUD Overlays
  pill(ctx, 'MOON POOL RECOVERY · 38 FT FORWARD SECTION', 80, 110, { col: '#38bdf8', bg: 'rgba(15, 23, 42, 0.85)' });
  pill(ctx, 'ORDNANCE: 2 NUCLEAR TORPEDOES SECURED', 80, 160, { col: '#facc15', bg: 'rgba(15, 23, 42, 0.85)' });
  stamp(ctx, 'TOP SECRET / AZORIAN', 1580, 120, { col: '#f59e0b', border: '#f59e0b' });
}
