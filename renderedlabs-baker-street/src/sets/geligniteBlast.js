// Gelignite blast timed to street traffic:
// Drilled charge holes in the 3-foot concrete ceiling, detonation flash,
// and the 12-by-14 inch breakthrough hole blown into Lloyds Bank vault
import { PAL, rr, circ, poly, vgrad, rgrad, clamp, TAU } from '../core/lib.js';

export function geligniteChargesScene(V, o = {}) {
  const t = o.t || 0;
  const exploded = o.exploded ?? false;
  const blastK = o.blastK ?? 0; // 0..1 blast animation

  V.layer(1.4, o.dof || 0, (c) => {
    // Underground tunnel chamber
    c.fillStyle = vgrad(c, 0, 0, 960, [
      [0, '#10141e'],
      [0.6, '#090c12'],
      [1, '#05070a']
    ]);
    c.fillRect(-1200, -800, 4400, 2000);

    const CY = 320; // Concrete ceiling level

    if (!exploded) {
      // ── CHARGE PREPARATION STAGE ──
      // 3-Foot concrete ceiling slab
      c.fillStyle = '#485060';
      c.fillRect(-1200, 0, 4400, CY);
      // Drilled charge holes in concrete
      for (const hx of [840, 930, 1020]) {
        c.fillStyle = '#11141c';
        c.fillRect(hx, CY - 90, 42, 90);
        // Red gelignite sticks packed inside
        c.fillStyle = '#c53030';
        c.fillRect(hx + 6, CY - 80, 30, 80);
        c.fillStyle = '#9b2c2c';
        c.fillRect(hx + 10, CY - 70, 22, 14);
        // Yellow electric detonator blast wires trailing down
        c.strokeStyle = '#ecc94b';
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(hx + 21, CY);
        c.quadraticCurveTo(hx + 30, CY + 140, 720, CY + 360);
        c.stroke();
      }
      // Detonator blast box at bottom left
      c.fillStyle = '#2d3748';
      rr(c, 660, CY + 340, 120, 90, 8);
      c.fill();
      // Brass plunger handle
      c.fillStyle = '#d69e2e';
      c.fillRect(710, CY + 280, 20, 60);
      c.fillRect(685, CY + 270, 70, 16);
    } else {
      // ── THE BLAST & BREAKTHROUGH HOLE ──
      // 3-Foot concrete ceiling with ragged 12x14 inch hole
      c.fillStyle = '#485060';
      c.fillRect(-1200, 0, 4400, CY);

      // Ragged 12x14 inch breakthrough breach (x: 880 to 1040, y: CY - 180 to CY)
      c.fillStyle = '#06080e';
      c.fillRect(880, CY - 180, 160, 180);

      // Shaft of security light pouring down from the vault above through the hole
      c.fillStyle = vgrad(c, 0, CY - 180, 800, [
        [0, 'rgba(255, 230, 160, 0.85)'],
        [0.4, 'rgba(255, 210, 120, 0.35)'],
        [1, 'rgba(255, 190, 90, 0)']
      ]);
      poly(c, [900, CY, 1020, CY, 1250, 850, 670, 850]);
      c.fill();

      // Shattered concrete chunks and rubble pile beneath the hole
      c.fillStyle = '#323844';
      for (let i = 0; i < 16; i++) {
        const rx = 820 + (i % 6) * 55;
        const ry = 720 + Math.floor(i / 6) * 35;
        rr(c, rx, ry, 38 + (i % 4) * 8, 26 + (i % 3) * 6, 6);
        c.fill();
      }

      // If blast just detonated, flash overlay and shockwave
      if (blastK > 0 && blastK < 1) {
        c.fillStyle = `rgba(255, 240, 200, ${clamp((1 - blastK) * 0.85)})`;
        c.fillRect(-1200, -800, 4400, 2000);

        // Flying concrete debris particles
        c.fillStyle = '#ffb347';
        for (let i = 0; i < 28; i++) {
          const fx = 960 + Math.cos(i * 0.4) * blastK * 400;
          const fy = CY + Math.sin(i * 0.4) * blastK * 320;
          circ(c, fx, fy, 5 + (i % 4));
          c.fill();
        }
      }
    }
  });
}
