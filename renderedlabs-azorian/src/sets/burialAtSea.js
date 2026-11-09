// Scene 8: The Solemn Burial at Sea
// On the deck of the Glomar Explorer: 6 Soviet submariners buried at sea with formal military honours.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawBurialAtSea(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Solemn Pacific dusk/twilight sky
  V.layer(1.5, 0, (c) => {
    const dusk = vgrad(c, 0, 0, 680, [
      [0, '#090d16'],
      [0.4, '#1a1829'],
      [0.75, '#3b2434'],
      [1.0, '#4a2c2c']
    ]);
    c.fillStyle = dusk;
    c.fillRect(0, 0, w, 700);

    // Distant horizon ocean
    const sea = vgrad(c, 0, 650, h, [
      [0, '#111827'],
      [1, '#030712']
    ]);
    c.fillStyle = sea;
    c.fillRect(0, 650, w, h - 650);
  });

  // Aft Deck of the Hughes Glomar Explorer & Burial Slide
  V.layer(1.1, 0, (c) => {
    // Ship's steel deck plates
    c.fillStyle = '#1f2937';
    c.fillRect(0, 680, w, h - 680);
    c.strokeStyle = '#374151';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 680);
    c.lineTo(w, 680);
    c.stroke();

    // Ship's stern railing & ceremonial burial chute (right side sloping into ocean)
    c.strokeStyle = '#9ca3af';
    c.lineWidth = 4;
    for (let rx = 100; rx < 1180; rx += 90) {
      c.beginPath();
      c.moveTo(rx, 680);
      c.lineTo(rx, 600);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(80, 600);
    c.lineTo(1180, 600);
    c.stroke();

    // Ceremonial wooden burial slide tilted into the water
    const slideX = 1380, slideY = 660;
    c.save();
    c.translate(slideX, slideY);
    c.rotate(0.24); // tilted toward ocean

    c.fillStyle = '#78350f';
    rr(c, -160, -15, 340, 24, 6);
    c.fill();
    c.strokeStyle = '#b45309';
    c.lineWidth = 2;
    c.stroke();

    // Flag-Draped Casket (Soviet Naval Flag: White with Red Star, Sickle, Blue Lower Stripe)
    const casketT = clamp((lt - 0.8) * 0.4); // slowly slides into ocean
    const casketX = -80 + casketT * 180;
    const casketY = -45 + casketT * 40;

    // Casket Box
    c.fillStyle = '#1c1917';
    rr(c, casketX, casketY, 160, 40, 4);
    c.fill();

    // Soviet Naval Ensign Draped over casket
    c.fillStyle = '#ffffff';
    rr(c, casketX, casketY - 2, 160, 26, 2);
    c.fill();

    // Blue stripe along bottom of flag
    c.fillStyle = '#1d4ed8';
    c.fillRect(casketX, casketY + 20, 160, 6);

    // Red Star & Hammer/Sickle on white field
    c.fillStyle = '#dc2626';
    circ(c, casketX + 45, casketY + 11, 7);
    c.fill();

    c.restore();
  });

  // Honor Guard: Stickman US Navy / CIA Crewmen Standing at Rigid Salute
  V.chars(1.0, 0, 0, (c) => {
    // 5 Stickman crew in formation saluting the fallen Soviet submariners
    const crewX = [340, 480, 620, 760, 900];

    crewX.forEach((cx, idx) => {
      // Figure in formal posture
      figure(c, {
        x: cx,
        y: 680,
        h: 175,
        dir: 1, // facing the ceremonial slide
        view: 'side',
        face: { expr: 'calm', t, look: 0.3 },
        hands: [
          [cx - 15, 595], // left hand pinned straight down at side
          [cx + 25, 535]  // right hand snapped to forehead in military salute
        ]
      });

      // Naval peaked officer cap overlay on each stickman
      c.fillStyle = '#0f172a';
      rr(c, cx - 18, 508, 48, 12, 3);
      c.fill();
      // Gold cap badge
      c.fillStyle = '#f59e0b';
      circ(c, cx + 8, 514, 4);
      c.fill();
    });
  });

  // Naval ship's bell tolling on mast (Left)
  V.layer(0.9, 0, (c) => {
    const bellX = 180, bellY = 540;
    c.fillStyle = '#f59e0b';
    c.beginPath();
    c.moveTo(bellX - 20, bellY);
    c.lineTo(bellX + 20, bellY);
    c.lineTo(bellX + 32, bellY + 45);
    c.lineTo(bellX - 32, bellY + 45);
    c.closePath();
    c.fill();
    c.strokeStyle = '#d97706';
    c.lineWidth = 3;
    c.stroke();

    // Bell clapper swinging
    c.fillStyle = '#78350f';
    circ(c, bellX + Math.sin(t * 4) * 8, bellY + 50, 6);
    c.fill();
  });

  // Solemn HUD Overlays
  pill(ctx, 'BURIAL AT SEA · SIX SOVIET SUBMARINERS', 80, 110, { col: '#e2e8f0', bg: 'rgba(15, 23, 42, 0.85)' });
  pill(ctx, 'BURIED WITH FORMAL MILITARY HONOURS', 80, 160, { col: '#93c5fd', bg: 'rgba(15, 23, 42, 0.85)' });
  stamp(ctx, 'HONOUR AT SEA', 1600, 120, { col: '#cbd5e1', border: '#cbd5e1' });
}
