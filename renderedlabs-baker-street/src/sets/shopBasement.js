// Le Sac shop basement (189 Baker Street):
// Leather goods storage, shoe boxes, bare hanging bulb, and the excavated floor breach
import { PAL, rr, poly, circ, vgrad, rgrad, TAU } from '../core/lib.js';

export const BASEMENT_FLOOR = 720;

export function shopBasementScene(V, o = {}) {
  const t = o.t || 0;

  V.layer(1.4, o.dof || 0, (c) => {
    // Damp London Victorian cellar brickwork
    c.fillStyle = vgrad(c, 0, 0, BASEMENT_FLOOR, [
      [0, '#1c1713'],
      [0.6, '#2a221b'],
      [1, '#1b1612']
    ]);
    c.fillRect(-1200, -800, 4400, BASEMENT_FLOOR + 800);

    // Brick mortar lines
    c.strokeStyle = '#14100c';
    c.lineWidth = 2;
    for (let y = 100; y < BASEMENT_FLOOR; y += 35) {
      c.beginPath();
      c.moveTo(-1200, y); c.lineTo(3200, y);
      c.stroke();
    }

    // Concrete basement floor
    c.fillStyle = '#2d2e33';
    c.fillRect(-1200, BASEMENT_FLOOR, 4400, 1200);
    c.fillStyle = '#1e1f24';
    c.fillRect(-1200, BASEMENT_FLOOR, 4400, 12);

    // ── WOODEN STORAGE SHELVES WITH LEATHER GOODS & SHOE BOXES (x: 150 to 750) ──
    const SX = 180, SY = 200, SW = 520, SH = 510;
    // Shelf uprights
    c.fillStyle = '#4a3522';
    c.fillRect(SX, SY, 22, SH);
    c.fillRect(SX + SW / 2, SY, 22, SH);
    c.fillRect(SX + SW, SY, 22, SH);
    // Horizontal planks
    for (let i = 0; i < 4; i++) {
      c.fillRect(SX - 15, SY + i * 130 + 100, SW + 30, 20);
    }
    // Stacked vintage shoe boxes and ornament boxes
    const boxCols = ['#8c5e3d', '#3f526d', '#6e453b', '#2e4a3c', '#75583b'];
    for (let r = 0; r < 3; r++) {
      for (let b = 0; b < 6; b++) {
        c.fillStyle = boxCols[(r * 3 + b) % boxCols.length];
        rr(c, SX + 28 + b * 76, SY + r * 130 + 38, 70, 58, 4);
        c.fill();
        c.fillStyle = '#eedaa2';
        c.fillRect(SX + 42 + b * 76, SY + r * 130 + 60, 42, 16);
      }
    }

    // Rolled leather hides on top shelf
    c.fillStyle = '#54331e';
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.ellipse(SX + 80 + i * 110, SY + 75, 45, 18, 0, 0, TAU);
      c.fill();
    }

    // ── 8 TONS OF EARTH / SPOIL PILED AT REAR (x: 1350 to 1850) ──
    c.fillStyle = '#302419';
    c.beginPath();
    c.moveTo(1320, BASEMENT_FLOOR);
    c.quadraticCurveTo(1580, BASEMENT_FLOOR - 280, 1860, BASEMENT_FLOOR);
    c.fill();
    // Shovel sticking into dirt pile
    c.fillStyle = '#64748b';
    poly(c, [1580, BASEMENT_FLOOR - 180, 1620, BASEMENT_FLOOR - 200, 1600, BASEMENT_FLOOR - 140]);
    c.fill();
    c.strokeStyle = '#8f6843';
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(1600, BASEMENT_FLOOR - 190);
    c.lineTo(1680, BASEMENT_FLOOR - 320);
    c.stroke();

    // ── THE FLOOR BREACH (Hole in basement concrete down to tunnel) ──
    const HX = 1050, HY = BASEMENT_FLOOR;
    c.fillStyle = '#06070a'; // Dark void leading down
    c.beginPath();
    c.ellipse(HX, HY + 15, 110, 48, 0, 0, TAU);
    c.fill();
    // Cracked concrete rubble rim
    c.strokeStyle = '#4b5563';
    c.lineWidth = 6;
    c.stroke();

    // Wooden ladder disappearing down into the shaft
    c.strokeStyle = '#8c653d';
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(HX - 35, HY - 40); c.lineTo(HX - 45, HY + 60);
    c.moveTo(HX + 35, HY - 40); c.lineTo(HX + 25, HY + 60);
    c.stroke();
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(HX - 38 + i * 2, HY - 20 + i * 22);
      c.lineTo(HX + 32 - i * 2, HY - 20 + i * 22);
      c.stroke();
    }

    // ── BARE EDISON BULB HANGING FROM WIRE ──
    const BX = 1050, BY = 260;
    c.strokeStyle = '#1a1a1a';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(BX, -200); c.lineTo(BX, BY);
    c.stroke();
    // Brass bulb socket
    c.fillStyle = '#b45309';
    c.fillRect(BX - 10, BY - 14, 20, 14);
    // Glowing warm bulb
    c.fillStyle = '#ffedd5';
    circ(c, BX, BY + 12, 16); c.fill();
    // Ambient lamp cone
    c.fillStyle = rgrad(c, BX, BY + 12, 20, 520, [
      [0, 'rgba(255, 215, 130, 0.55)'],
      [0.5, 'rgba(255, 185, 80, 0.18)'],
      [1, 'rgba(255, 160, 50, 0)']
    ]);
    c.fillRect(BX - 600, BY - 200, 1200, 1000);
  });
}
