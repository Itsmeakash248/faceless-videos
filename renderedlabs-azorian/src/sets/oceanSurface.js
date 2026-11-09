// Scene 1: Ocean Surface & Hughes Glomar Explorer
// 600-foot mining ship with 236-foot derrick and secret moon pool.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp } from '../core/gfx.js';

export function drawOceanSurface(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Moody Cold War Pacific sky & storm clouds
  V.layer(1.6, 0, (c) => {
    const sky = vgrad(c, 0, 0, 580, [
      [0, '#0c1322'],
      [0.6, '#18243b'],
      [1, '#2c3e55']
    ]);
    c.fillStyle = sky;
    c.fillRect(0, 0, w, 600);

    // Distant storm squall clouds
    c.fillStyle = 'rgba(18, 28, 45, 0.7)';
    for (let i = 0; i < 5; i++) {
      const cx = 200 + i * 380 - (lt * 12) % 400;
      c.beginPath();
      c.arc(cx, 280, 180, Math.PI, 0);
      c.fill();
    }
  });

  // Deep Pacific Water (Surface to below hull)
  V.layer(1.2, 0, (c) => {
    const water = vgrad(c, 0, 480, h, [
      [0, '#153243'],
      [0.2, '#0c2233'],
      [0.6, '#061320'],
      [1, '#020810']
    ]);
    c.fillStyle = water;
    c.fillRect(0, 480, w, h - 480);

    // Underwater light beams through surface
    c.save();
    c.globalAlpha = 0.12;
    for (let i = 0; i < 6; i++) {
      const bx = 300 + i * 260 + Math.sin(t * 0.8 + i) * 30;
      c.fillStyle = vgrad(c, bx, 480, 850, [
        [0, '#599dbb'],
        [1, 'transparent']
      ]);
      c.beginPath();
      c.moveTo(bx - 30, 480);
      c.lineTo(bx + 30, 480);
      c.lineTo(bx + 120, 850);
      c.lineTo(bx - 80, 850);
      c.closePath();
      c.fill();
    }
    c.restore();
  });

  // The 600-Foot Hughes Glomar Explorer Hull & Derrick
  V.chars(1.0, 0, 0, (c) => {
    const shipX = 960 + Math.sin(t * 1.1) * 8;
    const shipY = 485 + Math.sin(t * 1.4) * 6; // slow ocean swell heave

    c.save();
    c.translate(shipX, shipY);
    c.rotate(Math.sin(t * 1.2) * 0.015); // gentle ship roll

    // 1. Above waterline hull (grey/black steel)
    c.fillStyle = '#2d3748';
    poly(c, [
      -580, -35,   // Bow tip
      -460, 25,    // Fore waterline
      420, 25,     // Aft waterline
      540, -15,    // Stern
      520, -45,    // Stern deck
      -480, -45,   // Forecastle
    ]);
    c.fill();

    // Hull sheer line & plating
    c.strokeStyle = '#4a5568';
    c.lineWidth = 3;
    c.stroke();

    // 2. Below waterline red/anti-fouling hull (cutaway revealing moon pool)
    c.fillStyle = '#742a2a';
    poly(c, [
      -460, 25,
      -380, 110,
      360, 110,
      420, 25,
    ]);
    c.fill();

    // Moon Pool Opening in the belly of the ship (center well)
    const doorOpen = clamp((lt - 1.2) * 0.8); // doors open
    c.fillStyle = '#050b14';
    c.fillRect(-130, 40, 260, 75);

    // Hydraulic moon pool gates sliding open
    c.fillStyle = '#1a202c';
    c.fillRect(-130, 40, 130 * (1 - doorOpen * 0.7), 75);
    c.fillRect(130 - 130 * (1 - doorOpen * 0.7), 40, 130 * (1 - doorOpen * 0.7), 75);

    // Glowing floodlights inside moon pool
    c.fillStyle = 'rgba(78, 205, 196, 0.45)';
    c.beginPath();
    c.ellipse(0, 75, 90, 30, 0, 0, TAU);
    c.fill();

    // 3. Superstructure & 236-Foot Derrick
    // Bridge / Accommodations forward
    c.fillStyle = '#e2e8f0';
    c.fillRect(-380, -115, 120, 70);
    c.fillStyle = '#1a202c';
    for (let w = 0; w < 6; w++) {
      c.fillRect(-370 + w * 18, -100, 12, 10);
    }

    // Aft Helicopter Deck & Hangar
    c.fillStyle = '#cbd5e0';
    c.fillRect(310, -75, 160, 30);
    c.strokeStyle = '#e2e8f0';
    c.lineWidth = 3;
    circ(c, 390, -85, 20); // Helipad H mark
    c.stroke();

    // 236-foot Heavy Lift Derrick (Center amidships)
    c.strokeStyle = '#e2e8f0';
    c.lineWidth = 4;
    c.beginPath();
    // Triangular lattice tower
    c.moveTo(-90, -45);
    c.lineTo(-30, -320);
    c.lineTo(30, -320);
    c.lineTo(90, -45);
    c.stroke();

    // Cross-bracing lattice
    c.lineWidth = 2;
    for (let y = -75; y > -310; y -= 45) {
      c.beginPath();
      c.moveTo(-70 * (-y / 320), y);
      c.lineTo(70 * (-y / 320), y);
      c.stroke();
      c.beginPath();
      c.moveTo(-70 * (-y / 320), y);
      c.lineTo(70 * ((-y + 45) / 320), y - 45);
      c.stroke();
    }

    // Derrick crown block & heave compensation gimbals
    c.fillStyle = '#f6ad55';
    c.fillRect(-35, -340, 70, 20);

    // Central Heavy Pipe String descending through the moon pool
    c.strokeStyle = '#a0aec0';
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(0, -320);
    c.lineTo(0, 180 + lt * 35);
    c.stroke();

    // Waterline ocean foam & waves lapping the hull
    c.restore();

    // Surface waves
    c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    c.lineWidth = 3;
    c.beginPath();
    for (let x = 0; x < w; x += 30) {
      const wy = 485 + Math.sin((x * 0.015) + (t * 3.5)) * 6;
      if (x === 0) c.moveTo(x, wy);
      else c.lineTo(x, wy);
    }
    c.stroke();
  });

  // Stickman lookout / crew on ship deck
  V.layer(1.0, 0, (c) => {
    figure(c, {
      x: 650,
      y: 440,
      h: 55,
      dir: 1,
      view: 'side',
      face: { expr: 'determined', t }
    });
  });

  // Cinematic Overlays: HUD Cards & Stamp
  pill(ctx, 'HUGHES GLOMAR EXPLORER · 600 FT HULL', 80, 110, { col: '#e2e8f0', bg: 'rgba(15, 23, 42, 0.85)' });
  pill(ctx, 'SECRET 236 FT DERRICK & MOON POOL', 80, 160, { col: '#f6ad55', bg: 'rgba(15, 23, 42, 0.85)' });
  stamp(ctx, 'MISSION: AZORIAN', 1620, 120, { col: '#ef4444', border: '#ef4444' });
}
