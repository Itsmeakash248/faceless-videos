// Scene 9: The 1975 Leak & The Glomar Response
// Press conference: flashing cameras, CIA spokesperson, and the iconic "Neither Confirm Nor Deny" doctrine.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawGlomarResponse(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Washington Press Room wood paneling & CIA Seal backdrop
  V.layer(1.5, 0, (c) => {
    const wall = vgrad(c, 0, 0, h, [
      [0, '#1c1917'],
      [0.6, '#292524'],
      [1, '#18181b']
    ]);
    c.fillStyle = wall;
    c.fillRect(0, 0, w, h);

    // Dark wood panel moulding lines
    c.strokeStyle = '#44403c';
    c.lineWidth = 3;
    for (let x = 120; x < w; x += 240) {
      c.strokeRect(x, 80, 200, 520);
    }

    // Great Seal of the Central Intelligence Agency (Center Backdrop)
    const sealX = 960, sealY = 320;
    c.save();
    c.translate(sealX, sealY);

    // Outer gold ring
    c.strokeStyle = '#f59e0b';
    c.lineWidth = 8;
    circ(c, 0, 0, 160);
    c.stroke();

    c.fillStyle = '#0f172a';
    circ(c, 0, 0, 155);
    c.fill();

    // 16-point Compass Rose Star
    c.fillStyle = '#e2e8f0';
    for (let i = 0; i < 16; i++) {
      c.rotate(TAU / 16);
      c.beginPath();
      c.moveTo(0, (i % 2 === 0) ? -135 : -90);
      c.lineTo(12, 0);
      c.lineTo(0, 15);
      c.lineTo(-12, 0);
      c.closePath();
      c.fill();
    }

    // CIA Crest Eagle Head
    c.fillStyle = '#f59e0b';
    circ(c, 0, -35, 30);
    c.fill();

    c.restore();
  });

  // Podium, CIA Spokesperson & Press Table
  V.chars(1.0, 0, 0, (c) => {
    // Stage floor
    c.fillStyle = '#09090b';
    c.fillRect(0, 680, w, h - 680);

    // Wooden Press Briefing Podium (Center)
    const podX = 960, podY = 680;
    c.fillStyle = '#451a03';
    poly(c, [
      podX - 85, podY - 180,
      podX + 85, podY - 180,
      podX + 110, podY,
      podX - 110, podY
    ]);
    c.fill();
    c.strokeStyle = '#78350f';
    c.lineWidth = 4;
    c.stroke();

    // Press microphones clustered on top of the podium
    c.fillStyle = '#1e293b';
    [-35, 0, 35].forEach(mx => {
      // Gooseneck stand
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(podX + mx, podY - 180);
      c.lineTo(podX + mx * 0.7, podY - 225);
      c.stroke();
      // Mic head
      circ(c, podX + mx * 0.7, podY - 230, 8);
      c.fill();
    });

    // Top Secret CIA Leather Briefcase on side table
    c.fillStyle = '#271c19';
    rr(c, 680, 560, 110, 80, 6);
    c.fill();
    c.fillStyle = '#f59e0b';
    circ(c, 735, 590, 8); // brass combination lock
    c.fill();

    // CIA Spokesperson Standing at the Podium
    figure(c, {
      x: podX,
      y: podY,
      h: 210,
      dir: 1,
      view: 'front',
      kind: 'plain', // dark suit
      face: { expr: 'determined', t, noBlink: false }
    });

    // Dark suit collar & tie overlay
    c.fillStyle = '#ffffff';
    poly(c, [podX - 18, podY - 170, podX + 18, podY - 170, podX, podY - 145]);
    c.fill();
    c.fillStyle = '#dc2626'; // Red tie
    poly(c, [podX - 6, podY - 165, podX + 6, podY - 165, podX + 8, podY - 120, podX, podY - 105, podX - 8, podY - 120]);
    c.fill();
  });

  // Foreground: Press Reporters with Flash Cameras, Notebooks & Raised Mics
  V.layer(0.8, 0, (c) => {
    // 1. Reporter Left (Holding vintage flash camera with reflector bulb)
    figure(c, {
      x: 320,
      y: 920,
      h: 220,
      dir: 1,
      view: 'side',
      face: { expr: 'shocked', t, look: 0.5 },
      hands: [[380, 780], [350, 800]] // holding camera up to eye
    });

    // Vintage Press Camera with Flash Dish
    c.fillStyle = '#334155';
    c.fillRect(360, 760, 50, 40);
    // Silver flash reflector
    c.fillStyle = '#e2e8f0';
    circ(c, 375, 740, 24);
    c.fill();

    // Flashbulb pop illumination burst
    const flashBurst = Math.sin(t * 18);
    if (flashBurst > 0.7) {
      c.fillStyle = 'rgba(255, 255, 255, 0.85)';
      circ(c, 375, 740, 95);
      c.fill();
    }

    // 2. Reporter Right (Holding microphone towards podium)
    figure(c, {
      x: 1600,
      y: 920,
      h: 230,
      dir: -1,
      view: 'side',
      face: { expr: 'determined', t, look: -0.4 },
      hands: [[1480, 740], [1520, 780]] // extending mic boom
    });

    // Extended microphone rod
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(1540, 810);
    c.lineTo(1470, 730);
    c.stroke();
    c.fillStyle = '#0284c7'; // Press mic foam head
    circ(c, 1470, 730, 14);
    c.fill();
  });

  // Iconic Typographic Headline: "WE CAN NEITHER CONFIRM NOR DENY"
  // Pops onto screen during the final spokesperson line
  const popIn = clamp((lt - 0.2) * 2.5);
  if (popIn > 0.05) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Dark backdrop banner for maximum readability
    ctx.fillStyle = `rgba(15, 23, 42, ${0.92 * popIn})`;
    ctx.fillRect(0, 440, w, 200);

    // Glowing border lines
    ctx.strokeStyle = `rgba(245, 158, 11, ${popIn})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(w, 440);
    ctx.moveTo(0, 640);
    ctx.lineTo(w, 640);
    ctx.stroke();

    // Giant Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('"WE CAN NEITHER CONFIRM NOR DENY"', w / 2, 530);

    // Gold Subtitle
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 26px Nunito, monospace';
    ctx.fillText('THE GLOMAR RESPONSE · CIA COVERT PRECEDENT (1975)', w / 2, 595);

    ctx.restore();
  }

  // Corner HUD Pills
  pill(ctx, 'FEBRUARY 1975 · OPERATION LEAKED TO PRESS', 80, 110, { col: '#ef4444', bg: 'rgba(15, 23, 42, 0.85)' });
  stamp(ctx, 'GLOMAR DOCTRINE', 1600, 120, { col: '#f59e0b', border: '#f59e0b' });
}
