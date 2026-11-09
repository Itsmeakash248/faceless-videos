// Lloyds Bank Vault Interior (185 Baker Street strongroom):
// - 20-ton round steel vault door (locked shut on left)
// - 9-inch floor tiles
// - Grids of brass safe-deposit boxes (268 pried open)
// - Stacks of Bank of England cash, jewel cases, gold watches
// - The 12x14 inch blast hole in the floor
import { PAL, rr, poly, circ, vgrad, rgrad, TAU } from '../core/lib.js';

export const VAULT_FLOOR = 720;

export function vaultInteriorScene(V, o = {}) {
  const t = o.t || 0;
  const boxesOpen = o.boxesOpen ?? true;
  const showLoot = o.loot ?? true;

  V.layer(1.4, o.dof || 0, (c) => {
    // Heavy reinforced steel/concrete strongroom walls
    c.fillStyle = vgrad(c, 0, 0, VAULT_FLOOR, [
      [0, '#1a1f2c'],
      [0.6, '#262d3e'],
      [1, '#1b202d']
    ]);
    c.fillRect(-1200, -800, 4400, VAULT_FLOOR + 800);

    // ── 9-INCH FLOOR TILES (The tiles Tucker used as a ruler!) ──
    c.fillStyle = '#222837';
    c.fillRect(-1200, VAULT_FLOOR, 4400, 1200);
    c.strokeStyle = '#141824';
    c.lineWidth = 3;
    // Tile grid
    for (let x = -1200; x < 3200; x += 65) {
      c.beginPath();
      c.moveTo(x, VAULT_FLOOR);
      c.lineTo(x, VAULT_FLOOR + 1200);
      c.stroke();
    }
    for (let y = VAULT_FLOOR; y < VAULT_FLOOR + 1200; y += 45) {
      c.beginPath();
      c.moveTo(-1200, y);
      c.lineTo(3200, y);
      c.stroke();
    }

    // ── 20-TON ROUND STEEL VAULT DOOR (Unbroken & Time-Locked on Left) ──
    const DX = 280, DY = 420, DR = 220;
    // Outer massive steel door frame
    c.fillStyle = '#3e4759';
    circ(c, DX, DY, DR + 28);
    c.fill();
    c.strokeStyle = '#1d222d';
    c.lineWidth = 6;
    c.stroke();
    // Round vault door plug
    c.fillStyle = vgrad(c, DX - DR, DY - DR, DY + DR, [
      [0, '#606b80'],
      [0.5, '#4a5366'],
      [1, '#2f3542']
    ]);
    circ(c, DX, DY, DR);
    c.fill();
    // Concentric machined steel rings
    c.strokeStyle = '#7c8ba3';
    c.lineWidth = 4;
    circ(c, DX, DY, DR * 0.75);
    c.stroke();
    circ(c, DX, DY, DR * 0.45);
    c.stroke();
    // Radial locking pressure bolts (16 heavy steel bolts)
    for (let a = 0; a < TAU; a += TAU / 12) {
      const bx = DX + Math.cos(a) * (DR - 18);
      const by = DY + Math.sin(a) * (DR - 18);
      c.fillStyle = '#cbd5e1';
      circ(c, bx, by, 14);
      c.fill();
      c.strokeStyle = '#1e293b';
      c.lineWidth = 2;
      c.stroke();
    }
    // Center giant wheel spoke handle
    c.strokeStyle = '#e2e8f0';
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(DX - 70, DY); c.lineTo(DX + 70, DY);
    c.moveTo(DX, DY - 70); c.lineTo(DX, DY + 70);
    c.stroke();
    circ(c, DX, DY, 45);
    c.stroke();
    c.fillStyle = '#0f172a';
    circ(c, DX, DY, 18);
    c.fill();

    // Time-lock display box on the door
    c.fillStyle = '#1e293b';
    rr(c, DX - 45, DY + 80, 90, 48, 6);
    c.fill();
    c.fillStyle = '#ef4444'; // Red locked indicator
    c.font = '700 14px Nunito';
    c.textAlign = 'center';
    c.fillText('TIME LOCK', DX, DY + 102);
    c.fillStyle = '#f87171';
    c.font = '700 12px Nunito';
    c.fillText('ENGAGED', DX, DY + 118);

    // ── ROWS OF BRASS SAFE-DEPOSIT BOXES (x: 650 to 1850) ──
    const BX = 680, BY = 140, BW = 1120, BH = 480;
    // Vault cabinet housing
    c.fillStyle = '#1c2230';
    rr(c, BX - 14, BY - 14, BW + 28, BH + 28, 8);
    c.fill();

    // Box grid (rows x cols)
    const cols = 12, rows = 6;
    const cw = BW / cols, rh = BH / rows;
    for (let r = 0; r < rows; r++) {
      for (let cl = 0; cl < cols; cl++) {
        const boxX = BX + cl * cw + 3;
        const boxY = BY + r * rh + 3;
        const w = cw - 6, h = rh - 6;

        const isOpened = boxesOpen && ((r * 12 + cl) % 3 !== 0); // ~268 boxes pried open

        if (!isOpened) {
          // Locked brass safe-deposit box faceplate
          c.fillStyle = '#c6993a';
          rr(c, boxX, boxY, w, h, 3);
          c.fill();
          // Dual keyholes (customer + bank master key)
          c.fillStyle = '#221908';
          circ(c, boxX + w * 0.35, boxY + h * 0.5, 3.5);
          c.fill();
          circ(c, boxX + w * 0.65, boxY + h * 0.5, 3.5);
          c.fill();
          // Number engraving
          c.fillStyle = '#45320c';
          c.font = '600 10px Nunito';
          c.textAlign = 'center';
          c.fillText(String(100 + r * 12 + cl), boxX + w / 2, boxY + h * 0.28);
        } else {
          // Pried open / bent open box!
          c.fillStyle = '#14171f'; // dark empty cavity inside
          rr(c, boxX, boxY, w, h, 3);
          c.fill();
          // Bent brass door swinging open
          c.save();
          c.translate(boxX + 3, boxY + 3);
          c.rotate(0.35 + ((r + cl) % 4) * 0.15);
          c.fillStyle = '#d4a84d';
          rr(c, 0, 0, w * 0.9, h * 0.9, 3);
          c.fill();
          c.restore();
        }
      }
    }

    // ── THE 12x14 INCH BLAST HOLE IN THE FLOOR (x: 1080 to 1240) ──
    const HX = 1140, HY = VAULT_FLOOR;
    // Ragged dark floor breach
    c.fillStyle = '#06070a';
    c.beginPath();
    c.ellipse(HX, HY + 20, 95, 45, 0, 0, TAU);
    c.fill();
    // Cracked concrete edges around hole
    c.strokeStyle = '#4a5568';
    c.lineWidth = 4;
    c.stroke();

    // ── SPILLED HAUL & LOOT SPREAD ON FLOOR ──
    if (showLoot) {
      // Stacks of 1970s Bank of England green £5 and brown £10 banknotes
      c.fillStyle = '#2b6cb0'; // Blue currency wrappers
      for (let i = 0; i < 7; i++) {
        rr(c, 840 + i * 45, VAULT_FLOOR + 15, 60, 28, 4);
        c.fill();
      }
      c.fillStyle = '#2f855a'; // Banknote green
      for (let i = 0; i < 6; i++) {
        rr(c, 842 + i * 45, VAULT_FLOOR + 18, 56, 22, 2);
        c.fill();
        c.fillStyle = '#f7fafc';
        c.font = '700 9px Nunito';
        c.textAlign = 'center';
        c.fillText('£10', 870 + i * 45, VAULT_FLOOR + 32);
      }

      // Glittering vintage gold pocket watches & velvet jewel boxes
      c.fillStyle = '#ecc94b'; // Gold watch cases
      circ(c, 1290, VAULT_FLOOR + 25, 14); c.fill();
      circ(c, 1330, VAULT_FLOOR + 40, 16); c.fill();
      circ(c, 1370, VAULT_FLOOR + 20, 12); c.fill();

      // Velvet jewellery boxes (deep red / navy)
      c.fillStyle = '#742a2a';
      rr(c, 1270, VAULT_FLOOR + 50, 48, 36, 6); c.fill();
      c.fillStyle = '#234e52';
      rr(c, 1340, VAULT_FLOOR + 55, 54, 40, 6); c.fill();

      // Diamond / jewel glints
      c.fillStyle = '#ffffff';
      for (let i = 0; i < 9; i++) {
        const jx = 1260 + (i * 22);
        const jy = VAULT_FLOOR + 15 + ((i * 7) % 35);
        circ(c, jx, jy, 3.5); c.fill();
      }

      // Stuffed canvas loot sacks around the hole
      c.fillStyle = '#8c7853';
      c.beginPath();
      c.ellipse(HX - 85, VAULT_FLOOR + 40, 55, 32, -0.2, 0, TAU);
      c.fill();
      c.beginPath();
      c.ellipse(HX + 95, VAULT_FLOOR + 45, 62, 36, 0.25, 0, TAU);
      c.fill();
    }
  });
}
