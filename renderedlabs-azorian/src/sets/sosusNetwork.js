// Scene 2: SOSUS Acoustic Network & K-129 Implosion
// Deep ocean hydrophone arrays detecting Soviet submarine implosion at 16,500 ft.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawSosusNetwork(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background: Abyssal oceanic depths
  V.layer(1.5, 0, (c) => {
    const bg = vgrad(c, 0, 0, h, [
      [0, '#040914'],
      [0.5, '#071224'],
      [1, '#02050a']
    ]);
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    // Deep ocean bathymetry contour lines
    c.strokeStyle = 'rgba(38, 92, 130, 0.2)';
    c.lineWidth = 1.5;
    for (let r = 200; r < 900; r += 120) {
      c.beginPath();
      c.ellipse(1350, 680, r * 1.4, r * 0.7, 0, 0, TAU);
      c.stroke();
    }
  });

  // Sea floor and acoustic hydrophone array
  V.layer(1.2, 0, (c) => {
    // Ocean bottom terrain
    c.fillStyle = '#060d19';
    c.beginPath();
    c.moveTo(0, 780);
    c.bezierCurveTo(450, 760, 950, 820, 1920, 790);
    c.lineTo(1920, h);
    c.lineTo(0, h);
    c.closePath();
    c.fill();

    // Hydrophone listening station anchored on the sea floor
    const hx = 480, hy = 760;
    c.fillStyle = '#1e293b';
    c.fillRect(hx - 40, hy, 80, 50); // Anchor base

    // Hydrophone mast & acoustic sensor balls
    c.strokeStyle = '#64748b';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(hx, hy);
    c.lineTo(hx, hy - 180);
    c.stroke();

    // Sensor transducers
    c.fillStyle = '#38bdf8';
    circ(c, hx, hy - 180, 14);
    c.fill();
    circ(c, hx - 50, hy - 120, 10);
    c.fill();
    circ(c, hx + 50, hy - 120, 10);
    c.fill();

    // Cables linking transducers
    c.strokeStyle = '#0284c7';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(hx, hy - 180);
    c.lineTo(hx - 50, hy - 120);
    c.moveTo(hx, hy - 180);
    c.lineTo(hx + 50, hy - 120);
    c.stroke();

    // Blinking signal LED on hydrophone
    const ledOn = Math.floor(t * 3) % 2 === 0;
    c.fillStyle = ledOn ? '#22c55e' : '#14532d';
    circ(c, hx, hy - 200, 6);
    c.fill();
  });

  // Acoustic shockwave rings radiating from K-129 implosion location
  V.layer(1.0, 0, (c) => {
    const kx = 1380, ky = 660; // Site of K-129 implosion

    // Implosion shockwave pulse
    const pulsePh = (lt * 0.9) % 2.5;
    for (let i = 0; i < 4; i++) {
      const r = ((pulsePh * 280) + i * 140) % 900;
      const alpha = clamp(1 - r / 850);
      c.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.75})`;
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(kx, ky, r * 1.3, r * 0.8, 0, 0, TAU);
      c.stroke();
    }

    // Soviet Submarine K-129 (Golf II) resting on the ocean floor
    c.save();
    c.translate(kx, ky + 110);
    c.rotate(0.06); // slight list on the seabed

    // Submarine hull (black steel with red lower hull)
    c.fillStyle = '#0f172a';
    c.beginPath();
    c.ellipse(0, 0, 220, 42, 0, 0, TAU);
    c.fill();

    // Conning tower / sail (housing 3 ballistic missiles)
    c.fillRect(-40, -65, 80, 50);

    // Broken hull section & damage from implosion
    c.strokeStyle = '#ef4444';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(35, -45);
    c.lineTo(45, 15);
    c.lineTo(30, 40);
    c.stroke();

    // Seabed silt stirred up
    c.fillStyle = 'rgba(71, 85, 105, 0.4)';
    c.beginPath();
    c.ellipse(0, 45, 260, 25, 0, 0, TAU);
    c.fill();

    c.restore();
  });

  // Foreground: US Navy SOSUS Acoustic Station Operator (Listening with headphones)
  V.layer(0.8, 0, (c) => {
    // Acoustic console CRT monitor & waterfall display
    c.fillStyle = '#0f172a';
    rr(c, 80, 520, 380, 360, 16);
    c.fill();
    c.strokeStyle = '#334155';
    c.lineWidth = 4;
    c.stroke();

    // Green phosphor screen
    c.fillStyle = '#022c22';
    rr(c, 95, 535, 350, 240, 8);
    c.fill();

    // Spectrogram acoustic waterfall lines
    c.strokeStyle = '#34d399';
    c.lineWidth = 2;
    for (let y = 560; y < 760; y += 20) {
      c.beginPath();
      c.moveTo(110, y);
      for (let x = 110; x < 430; x += 30) {
        const spike = (x > 240 && x < 320) ? Math.sin((x + t * 40) * 0.1) * 22 : Math.sin((x + t * 10) * 0.05) * 4;
        c.lineTo(x, y + spike);
      }
      c.stroke();
    }

    // Stickman acoustic analyst at console
    figure(c, {
      x: 360,
      y: 920,
      h: 210,
      dir: -1,
      view: 'side',
      face: { expr: 'shocked', t, look: -0.4 }
    });

    // Headphones on stickman
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(360, 770, 36, Math.PI, 0); // Headband
    c.stroke();
    c.fillStyle = '#0f172a';
    circ(c, 325, 775, 12); // Ear cup
    c.fill();
  });

  // HUD Metrics
  pill(ctx, 'SOSUS ARRAY · ACOUSTIC SIGNATURE DETECTED', 80, 110, { col: '#34d399', bg: 'rgba(2, 44, 34, 0.85)' });
  pill(ctx, 'COORDINATES: 1,560 MILES NW OF HAWAII', 80, 160, { col: '#e2e8f0', bg: 'rgba(15, 23, 42, 0.85)' });
  pill(ctx, 'DEPTH: 16,500 FT (3.1 MILES)', 80, 210, { col: '#f59e0b', bg: 'rgba(15, 23, 42, 0.85)' });
}
