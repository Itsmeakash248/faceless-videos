// Architectural Cross-Section Cutaway of the Baker Street Tunnel:
// - Le Sac shop cellar (189 Baker St)
// - 5-ft initial vertical drop
// - 40-ft horizontal tunnel run directly under the Chicken Inn restaurant
// - 8 long tons of excavated earth & spoil hauled out
// - 15-ft vertical climb directly under Lloyds Bank (185 Baker St)
// - 3-ft thick reinforced concrete vault floor slab
import { PAL, rr, poly, circ, vgrad, rgrad, lerp, clamp, TAU } from '../core/lib.js';

export function tunnelCutawayView(V, o = {}) {
  const t = o.t || 0;
  const showDims = o.dims !== false;
  const pathProg = o.pathProg ?? 1.0;

  V.layer(1.5, o.dof || 0, (c) => {
    // Street level at y = 260
    const GY = 260;

    // ── DARK STRATIFIED SUB-SURFACE SOIL ──
    c.fillStyle = vgrad(c, 0, GY, 960, [
      [0, '#1c202c'],
      [0.3, '#141822'],
      [1, '#0a0d14']
    ]);
    c.fillRect(-1200, GY, 4400, 1200);

    // Soil texture / strata layers
    c.fillStyle = 'rgba(40,46,62,0.35)';
    for (let i = 0; i < 9; i++) {
      c.fillRect(-1200, GY + 60 + i * 70, 4400, 6);
    }
    // London clay pebbles / gravel particles
    c.fillStyle = 'rgba(70,80,105,0.4)';
    const seeds = [12, 45, 78, 120, 230, 310, 420, 560, 680, 790, 890, 990];
    seeds.forEach((sx, idx) => {
      circ(c, sx, GY + 140 + (idx % 5) * 80, 5 + (idx % 4));
      c.fill();
    });

    // ── SURFACE BUILDINGS SCHEMATIC (y: 60 to 260) ──
    // 189 Le Sac (x: 100 to 450)
    c.fillStyle = '#2b231d';
    c.fillRect(100, 70, 360, GY - 70);
    c.fillStyle = '#1c3d2b';
    c.fillRect(100, 210, 360, 40);
    c.fillStyle = '#eedaa2';
    c.font = '700 20px Fredoka';
    c.textAlign = 'center';
    c.fillText('189 LE SAC (LEATHER SHOP)', 280, 236);

    // 187 Chicken Inn Restaurant (x: 460 to 1200)
    c.fillStyle = '#261b17';
    c.fillRect(470, 70, 740, GY - 70);
    c.fillStyle = '#611f18';
    c.fillRect(470, 210, 740, 40);
    c.fillStyle = '#fce4a6';
    c.fillText('187 THE CHICKEN INN RESTAURANT (40 FT RUN)', 840, 236);

    // 185 Lloyds Bank (x: 1220 to 1820)
    c.fillStyle = '#222838';
    c.fillRect(1220, 70, 600, GY - 70);
    c.fillStyle = '#181f30';
    c.fillRect(1220, 210, 600, 40);
    c.fillStyle = '#eed284';
    c.fillText('185 LLOYDS BANK (VAULT)', 1520, 236);

    // ── CELLAR OF LE SAC (x: 180 to 440, y: GY to 460) ──
    const CellarBot = 450;
    c.fillStyle = '#10141e';
    c.fillRect(180, GY, 270, CellarBot - GY);
    c.strokeStyle = '#3d4860';
    c.lineWidth = 3;
    c.strokeRect(180, GY, 270, CellarBot - GY);
    // 8 Tons of earth / dirt spoil piled in shop basement
    c.fillStyle = '#3a2e22';
    c.beginPath();
    c.moveTo(190, CellarBot);
    c.quadraticCurveTo(280, CellarBot - 120, 430, CellarBot);
    c.fill();
    c.fillStyle = '#e8b872';
    c.font = '700 16px Nunito';
    c.textAlign = 'center';
    c.fillText('8 TONS SPOIL', 300, CellarBot - 40);

    // ── THE TUNNEL VOID (Rough hand-dug passage) ──
    // Path:
    // Drop: from Cellar floor (x: 400, y: 450) down 5 ft to y: 640
    // Run: horizontal from x: 400 to x: 1380 at y: 640 (40 ft under Chicken Inn)
    // Rise: from x: 1380, y: 640 up 15 ft to y: 410 (under Lloyds Bank vault floor)
    const T_Y = 660; // Tunnel horizontal floor
    const T_H = 75;  // Tunnel height (~4-5 ft crawlway)

    // Dig cavity dark fill
    c.fillStyle = '#06080e';
    // Vertical drop shaft
    c.fillRect(360, CellarBot, 85, T_Y - CellarBot + T_H);
    // Horizontal run
    c.fillRect(360, T_Y, 1050, T_H);
    // Vertical rise shaft
    c.fillRect(1340, 410, 85, T_Y - 410 + T_H);

    // Timber shoring beams along the tunnel
    c.fillStyle = '#5c432d';
    for (let x = 460; x <= 1320; x += 90) {
      // Upright timber prop
      c.fillRect(x, T_Y, 10, T_H);
      // Top crossbeam
      c.fillRect(x - 12, T_Y, 34, 10);
    }

    // ── LLOYDS BANK VAULT & REINFORCED CONCRETE SLAB ──
    // Strongroom cavity
    const VY = 410; // Vault floor level
    c.fillStyle = '#0f1420';
    c.fillRect(1280, 240, 540, VY - 240);
    // 3-Foot thick reinforced concrete slab (between y: 360 and 410)
    c.fillStyle = '#4c5569';
    c.fillRect(1280, VY - 45, 540, 45);
    // Steel rebar grid inside slab
    c.strokeStyle = '#8a94a6';
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(1280, VY - 36 + i * 9);
      c.lineTo(1820, VY - 36 + i * 9);
      c.stroke();
    }
    // Safe deposit box grid inside the vault
    c.fillStyle = '#caa452';
    for (let r = 0; r < 4; r++) {
      for (let cidx = 0; cidx < 9; cidx++) {
        c.fillRect(1440 + cidx * 38, 260 + r * 22, 32, 16);
      }
    }
    // 20-ton time locked vault door (locked on left of strongroom)
    c.fillStyle = '#1c2230';
    c.fillRect(1300, 250, 40, 115);
    c.fillStyle = '#f26854';
    c.font = '700 13px Nunito';
    c.textAlign = 'center';
    c.fillText('LOCKED', 1320, 310);

    // ── THE BYPASS HOLE (12x14 inch blast hole through concrete floor) ──
    if (o.hole !== false) {
      c.fillStyle = '#06080e';
      c.fillRect(1365, VY - 50, 35, 55); // ragged gap
      // Blast debris
      c.fillStyle = '#ff9838';
      circ(c, 1382, VY - 22, 6);
      c.fill();
    }

    // ── GLOWING EMBER BYPASS PATH ──
    c.save();
    c.strokeStyle = '#ff7a1a';
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.setLineDash([16, 10]);
    c.beginPath();
    c.moveTo(400, CellarBot);
    c.lineTo(400, T_Y + T_H / 2);
    c.lineTo(1380, T_Y + T_H / 2);
    c.lineTo(1380, VY - 25);
    c.stroke();
    c.restore();

    // ── SCHEMATIC DIMENSION CALLOUTS ──
    if (showDims) {
      // 5 FT DROP
      drawDimension(c, 340, CellarBot, 340, T_Y + T_H / 2, '5 FT DROP', 'left');
      // 40 FT RUN
      drawDimension(c, 400, T_Y + T_H + 35, 1380, T_Y + T_H + 35, '40 FT HORIZONTAL RUN UNDER RESTAURANT', 'bottom');
      // 15 FT RISE
      drawDimension(c, 1445, T_Y + T_H / 2, 1445, VY - 25, '15 FT RISE', 'right');
      // 3 FT REINFORCED CONCRETE SLAB
      drawDimension(c, 1835, VY - 45, 1835, VY, '3 FT CONCRETE', 'right');
    }
  });
}

function drawDimension(c, x1, y1, x2, y2, text, pos = 'bottom') {
  c.save();
  c.strokeStyle = '#f2c864';
  c.lineWidth = 2.5;
  c.fillStyle = '#f2c864';
  c.font = '700 16px Fredoka';
  c.textAlign = 'center';

  // Dimension line
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();

  // Tick marks
  const tick = 8;
  if (x1 === x2) {
    // Vertical line
    c.beginPath();
    c.moveTo(x1 - tick, y1); c.lineTo(x1 + tick, y1);
    c.moveTo(x2 - tick, y2); c.lineTo(x2 + tick, y2);
    c.stroke();
    const my = (y1 + y2) / 2;
    c.textAlign = pos === 'left' ? 'right' : 'left';
    c.fillText(text, pos === 'left' ? x1 - 12 : x1 + 14, my + 5);
  } else {
    // Horizontal line
    c.beginPath();
    c.moveTo(x1, y1 - tick); c.lineTo(x1, y1 + tick);
    c.moveTo(x2, y2 - tick); c.lineTo(x2, y2 + tick);
    c.stroke();
    const mx = (x1 + x2) / 2;
    c.fillText(text, mx, y1 + 22);
  }
  c.restore();
}
