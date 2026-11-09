// Scene 4: The Giant Mechanical Claw "Clementine"
// 100-foot wide capture vehicle with hydraulic tines and underwater spotlights.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawGiantClaw(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Abyssal pitch-black ocean water (16,500 ft)
  V.layer(1.5, 0, (c) => {
    c.fillStyle = '#010408';
    c.fillRect(0, 0, w, h);

    // Subtle oceanic silt particles drifting in the blackness
    c.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 35; i++) {
      const px = (i * 63 + Math.sin(t + i) * 20) % w;
      const py = (i * 47 + t * 15) % h;
      circ(c, px, py, (i % 2) + 1.0);
      c.fill();
    }
  });

  // Volumetric Underwater Spotlights shining down into the abyss
  V.layer(1.2, 0, (c) => {
    const lights = [
      { x: 520, y: 320, angle: 0.15 },
      { x: 960, y: 300, angle: 0.0 },
      { x: 1400, y: 320, angle: -0.15 }
    ];

    lights.forEach(l => {
      c.save();
      c.translate(l.x, l.y);
      c.rotate(l.angle);

      const coneGrad = vgrad(c, 0, 0, 800, [
        [0, 'rgba(56, 189, 248, 0.75)'],
        [0.4, 'rgba(38, 140, 200, 0.25)'],
        [1.0, 'transparent']
      ]);

      c.fillStyle = coneGrad;
      c.beginPath();
      c.moveTo(-35, 0);
      c.lineTo(35, 0);
      c.lineTo(260, 800);
      c.lineTo(-260, 800);
      c.closePath();
      c.fill();
      c.restore();
    });
  });

  // The Giant Capture Vehicle "Clementine" Rig
  V.chars(1.0, 0, 0, (c) => {
    const clawX = 960;
    const clawY = 380 + Math.sin(t * 0.9) * 8; // gentle suspended drift
    const openAngle = lerp(0.1, 0.45, clamp(lt / 2.2)); // hydraulic tines opening wide

    c.save();
    c.translate(clawX, clawY);

    // 1. Steel pipe string attachment coupling & gimbal head
    c.fillStyle = '#64748b';
    c.fillRect(-45, -280, 90, 80);
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 14;
    c.beginPath();
    c.moveTo(0, -280);
    c.lineTo(0, -400); // extends up towards the 3-mile pipe string
    c.stroke();

    // 2. Heavy Main Bridge Truss (100-foot structural frame)
    c.fillStyle = '#1e293b';
    rr(c, -420, -200, 840, 90, 12);
    c.fill();
    c.strokeStyle = '#475569';
    c.lineWidth = 4;
    c.stroke();

    // Truss structural cross-beams
    c.strokeStyle = '#f59e0b';
    c.lineWidth = 3;
    for (let x = -380; x < 380; x += 90) {
      c.strokeRect(x, -190, 80, 70);
      c.beginPath();
      c.moveTo(x, -190);
      c.lineTo(x + 80, -120);
      c.stroke();
    }

    // 3. Central Equipment Pod & Hydraulic Reservoirs
    c.fillStyle = '#334155';
    c.fillRect(-120, -110, 240, 80);
    c.fillStyle = '#e2e8f0';
    c.font = 'bold 16px monospace';
    c.textAlign = 'center';
    c.fillText('PROJECT AZORIAN · CV-1', 0, -65);

    // 4. Underwater High-Output Spotlights
    [-340, 0, 340].forEach(lx => {
      c.fillStyle = '#f8fafc';
      c.beginPath();
      c.arc(lx, -100, 28, 0, Math.PI);
      c.fill();
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 4;
      c.stroke();
    });

    // 5. Massive Hydraulic Tines (Left and Right Jaws)
    // Left Tines (Pivoting outwards)
    c.save();
    c.translate(-320, -110);
    c.rotate(-openAngle);

    // Upper tine arm
    c.fillStyle = '#334155';
    poly(c, [
      -40, 0,
      40, 0,
      25, 240,
      -35, 240
    ]);
    c.fill();
    c.stroke();

    // Lower curved claw tooth (designed to cradle submarine hull)
    c.fillStyle = '#475569';
    c.beginPath();
    c.moveTo(-35, 240);
    c.bezierCurveTo(-15, 380, 180, 480, 290, 440);
    c.bezierCurveTo(240, 420, 40, 360, 25, 240);
    c.closePath();
    c.fill();
    c.strokeStyle = '#f59e0b';
    c.lineWidth = 4;
    c.stroke();

    // Hydraulic piston rod extending
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 12;
    c.beginPath();
    c.moveTo(60, 40);
    c.lineTo(120, 160);
    c.stroke();
    c.restore();

    // Right Tines (Pivoting outwards opposite)
    c.save();
    c.translate(320, -110);
    c.rotate(openAngle);

    // Upper tine arm
    c.fillStyle = '#334155';
    poly(c, [
      -40, 0,
      40, 0,
      35, 240,
      -25, 240
    ]);
    c.fill();
    c.stroke();

    // Lower curved claw tooth
    c.fillStyle = '#475569';
    c.beginPath();
    c.moveTo(35, 240);
    c.bezierCurveTo(15, 380, -180, 480, -290, 440);
    c.bezierCurveTo(-240, 420, -40, 360, -25, 240);
    c.closePath();
    c.fill();
    c.strokeStyle = '#f59e0b';
    c.lineWidth = 4;
    c.stroke();

    // Hydraulic piston rod
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 12;
    c.beginPath();
    c.moveTo(-60, 40);
    c.lineTo(-120, 160);
    c.stroke();
    c.restore();

    c.restore();
  });

  // Stickman Engineer inside control observation sub-screen or HUD
  pill(ctx, 'CAPTURE CLAW "CLEMENTINE" · 100 FT SPAN', 80, 110, { col: '#f59e0b', bg: 'rgba(15, 23, 42, 0.85)' });
  pill(ctx, 'HYDRAULIC TINES EXTENDING OVER TARGET', 80, 160, { col: '#38bdf8', bg: 'rgba(15, 23, 42, 0.85)' });
  stamp(ctx, 'TARGET: K-129', 1620, 120, { col: '#ef4444', border: '#ef4444' });
}
