// Scene 3: Depth Descent & 3-Mile Vertical Cross Section
// From Pacific surface (0 ft) through Twilight, Midnight, to Abyssal floor at -16,500 ft.
import { PAL, W, H, circ, poly, rr, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';
import { figure } from '../core/fig.js';
import { pill, stamp, goldText } from '../core/gfx.js';

export function drawDepthDescent(ctx, V, lt, t, opts = {}) {
  const w = 1920, h = 1080;

  // Background gradient: Depth lighting zones
  // 0 ft (Surface sunlight) -> 3,000 ft (Twilight) -> 10,000 ft (Midnight) -> 16,500 ft (Pitch Abyss)
  V.layer(1.4, 0, (c) => {
    const depthGrad = vgrad(c, 0, 0, h, [
      [0.0, '#1a365d'],   // Sunlight Zone
      [0.25, '#0f2942'],  // Twilight Zone
      [0.55, '#081426'],  // Midnight Zone
      [0.85, '#02060d'],  // Abyssal Zone
      [1.0, '#000205']    // 16,500 ft ocean floor
    ]);
    c.fillStyle = depthGrad;
    c.fillRect(0, 0, w, h);

    // Oceanic plankton / marine snow drifting upward as camera plunges down
    c.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 51 + (t * 8)) % w;
      const sy = (i * 37 - (lt * 220)) % h;
      circ(c, sx, (sy + h) % h, (i % 3) + 1.2);
      c.fill();
    }
  });

  // Vertical Depth Ruler & Scale Markers (Left Side)
  V.layer(1.1, 0, (c) => {
    const rx = 240;
    c.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(rx, 80);
    c.lineTo(rx, 1000);
    c.stroke();

    const markers = [
      { depth: '0 FT', label: 'PACIFIC SURFACE', y: 120, col: '#38bdf8' },
      { depth: '-3,000 FT', label: 'TWILIGHT ZONE', y: 340, col: '#818cf8' },
      { depth: '-10,000 FT', label: 'MIDNIGHT ZONE (TOTAL BLACK)', y: 620, col: '#6366f1' },
      { depth: '-16,500 FT', label: 'ABYSSAL FLOOR (K-129 WRECK)', y: 920, col: '#ef4444' }
    ];

    markers.forEach(m => {
      c.beginPath();
      c.moveTo(rx - 25, m.y);
      c.lineTo(rx + 25, m.y);
      c.stroke();

      c.fillStyle = m.col;
      c.font = 'bold 22px monospace';
      c.textAlign = 'right';
      c.fillText(m.depth, rx - 35, m.y + 7);

      c.font = '16px monospace';
      c.textAlign = 'left';
      c.fillStyle = '#cbd5e1';
      c.fillText(m.label, rx + 40, m.y + 6);
    });
  });

  // Center: The 3-Mile Heavy Steel Pipe String & Lowering Capture Rig
  V.layer(1.0, 0, (c) => {
    const pipeX = 960;

    // Heavy steel pipe string (sections linked every 60 ft)
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 14;
    c.beginPath();
    c.moveTo(pipeX, 0);
    c.lineTo(pipeX, h);
    c.stroke();

    // Pipe joints & couplings passing down rapidly
    c.fillStyle = '#f59e0b';
    const jointSpacing = 160;
    const jointShift = (lt * 320) % jointSpacing;
    for (let y = jointShift; y < h; y += jointSpacing) {
      rr(c, pipeX - 16, y - 10, 32, 20, 4);
      c.fill();
    }

    // Tension vibration waves along the pipe
    c.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    c.lineWidth = 2;
    c.beginPath();
    for (let y = 0; y < h; y += 40) {
      const vx = pipeX + Math.sin((y * 0.05) + (t * 12)) * 6;
      if (y === 0) c.moveTo(vx, y);
      else c.lineTo(vx, y);
    }
    c.stroke();
  });

  // Animated Real-Time Depth Meter & Pressure Gauge (Right Side)
  V.layer(0.8, 0, (c) => {
    const gx = 1420, gy = 320;

    // HUD Panel Box
    c.fillStyle = 'rgba(15, 23, 42, 0.88)';
    rr(c, gx, gy, 420, 440, 16);
    c.fill();
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 3;
    c.stroke();

    // Title
    c.fillStyle = '#38bdf8';
    c.font = 'bold 20px monospace';
    c.textAlign = 'left';
    c.fillText('DESCENT TELEMETRY', gx + 30, gy + 45);

    // Current Depth Counter (counting from 0 to 16,500 ft)
    const curDepth = Math.round(lerp(0, 16500, clamp(lt / 3.0)));
    c.fillStyle = '#ffffff';
    c.font = 'bold 52px monospace';
    c.fillText(`${curDepth.toLocaleString()} FT`, gx + 30, gy + 120);

    c.fillStyle = '#94a3b8';
    c.font = '18px monospace';
    c.fillText('DEPTH BELOW PACIFIC SURFACE', gx + 30, gy + 155);

    // Pressure Calculation (0.445 psi per foot depth)
    const curPressure = Math.round(curDepth * 0.445);
    c.fillStyle = '#f59e0b';
    c.font = 'bold 38px monospace';
    c.fillText(`${curPressure.toLocaleString()} PSI`, gx + 30, gy + 240);

    c.fillStyle = '#94a3b8';
    c.font = '18px monospace';
    c.fillText('HYDROSTATIC WATER PRESSURE', gx + 30, gy + 275);

    // Warning Badge at 16,000+ ft
    if (curDepth > 14000) {
      c.fillStyle = '#ef4444';
      rr(c, gx + 30, gy + 320, 360, 50, 8);
      c.fill();
      c.fillStyle = '#ffffff';
      c.font = 'bold 20px monospace';
      c.textAlign = 'center';
      c.fillText('⚠ CRUSHING ABYSS PRESSURE', gx + 210, gy + 352);
    }
  });

  // Top HUD Cards
  pill(ctx, 'PROJECT AZORIAN · DEEP DESCENT', 80, 110, { col: '#38bdf8', bg: 'rgba(15, 23, 42, 0.85)' });
  stamp(ctx, '3.1 MILES DEEP', 1600, 120, { col: '#f59e0b', border: '#f59e0b' });
}
