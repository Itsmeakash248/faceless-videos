// Metropolitan Police Search Scene:
// Police officers checking the exterior of Lloyds Bank, testing doors and peering inside,
// finding the vault door secure from the front while the gang sits underneath
import { PAL, rr, poly, circ, vgrad, rgrad, TAU } from '../core/lib.js';

export const STREET_Y = 740;

export function policeCheckScene(V, o = {}) {
  const t = o.t || 0;
  const beacon = (Math.sin(t * 12) + 1) / 2; // blue flashing beacon

  V.layer(1.4, o.dof || 0, (c) => {
    // Night sky over Baker Street
    c.fillStyle = vgrad(c, 0, -400, STREET_Y, [
      [0, '#090c14'],
      [0.6, '#111726'],
      [1, '#182136']
    ]);
    c.fillRect(-1200, -800, 4400, STREET_Y + 800);

    // Wet London street
    c.fillStyle = '#11141c';
    c.fillRect(-1200, STREET_Y, 4400, 1200);
    // Pavement
    c.fillStyle = '#262d3d';
    c.fillRect(-1200, STREET_Y - 26, 4400, 26);

    // ── LLOYDS BANK BRANCH FRONT GLASS & PILLARS ──
    const bx = 450;
    c.fillStyle = '#394152';
    c.fillRect(bx, 120, 1050, STREET_Y - 120);

    // Stone columns
    for (const cx of [bx + 50, bx + 450, bx + 950]) {
      c.fillStyle = '#556075';
      c.fillRect(cx, 160, 60, STREET_Y - 186);
    }

    // Heavy plate glass front doors (where police shone flashlights)
    const dx = bx + 540, dy = 340, dw = 380, dh = STREET_Y - 366;
    c.fillStyle = '#0f1420';
    c.fillRect(dx, dy, dw, dh);
    c.strokeStyle = '#64748b';
    c.lineWidth = 10;
    c.strokeRect(dx, dy, dw, dh);
    // Glass reflection
    c.fillStyle = 'rgba(148, 163, 184, 0.12)';
    c.fillRect(dx + 10, dy + 10, dw - 20, dh - 20);

    // Inside through the glass: The locked 20-ton steel vault door in dim security light
    c.fillStyle = '#2a3242';
    circ(c, dx + dw / 2, dy + 150, 95);
    c.fill();
    c.strokeStyle = '#475569';
    c.lineWidth = 4;
    circ(c, dx + dw / 2, dy + 150, 75);
    c.stroke();
    c.fillStyle = '#ef4444';
    c.font = '700 12px Nunito';
    c.textAlign = 'center';
    c.fillText('TIME-LOCKED', dx + dw / 2, dy + 155);

    // ── FLASHING POLICE FLASHLIGHT CONE OF LIGHT ──
    // Flashlight beam shining from officer onto the glass door
    c.save();
    c.fillStyle = vgrad(c, 240, 480, dx + 120, [
      [0, 'rgba(255, 250, 210, 0.75)'],
      [0.6, 'rgba(255, 245, 180, 0.28)'],
      [1, 'rgba(255, 240, 150, 0)']
    ]);
    poly(c, [220, 500, 220, 520, dx + 140, 620, dx + 140, 410]);
    c.fill();
    c.restore();

    // ── 1970s METROPOLITAN POLICE CAR (Wolseley 6/110) ──
    const px = -220, py = STREET_Y - 180;
    // Car body (classic black police cruiser)
    c.fillStyle = '#0d1117';
    rr(c, px, py + 40, 480, 110, 18); c.fill();
    // White police door panels
    c.fillStyle = '#e2e8f0';
    rr(c, px + 120, py + 48, 220, 80, 6); c.fill();
    c.fillStyle = '#0f172a';
    c.font = '900 24px Fredoka';
    c.textAlign = 'center';
    c.fillText('POLICE', px + 230, py + 95);

    // Roof & windows
    c.fillStyle = '#1e293b';
    poly(c, [px + 90, py + 40, px + 150, py - 30, px + 330, py - 30, px + 390, py + 40]);
    c.fill();
    // Car wheels
    c.fillStyle = '#020617';
    circ(c, px + 90, STREET_Y - 10, 42); c.fill();
    circ(c, px + 370, STREET_Y - 10, 42); c.fill();
    c.fillStyle = '#94a3b8'; // Hubcaps
    circ(c, px + 90, STREET_Y - 10, 18); c.fill();
    circ(c, px + 370, STREET_Y - 10, 18); c.fill();

    // ── BLUE FLASHING ROOF BEACON ──
    const bxR = px + 240, byR = py - 46;
    // Blue beacon housing
    c.fillStyle = '#3b82f6';
    rr(c, bxR - 16, byR - 12, 32, 24, 6); c.fill();
    // Flashing blue volumetric glow
    c.fillStyle = rgrad(c, bxR, byR, 10, 320, [
      [0, `rgba(59, 130, 246, ${0.75 * beacon})`],
      [0.5, `rgba(59, 130, 246, ${0.25 * beacon})`],
      [1, 'rgba(59, 130, 246, 0)']
    ]);
    c.fillRect(bxR - 350, byR - 250, 700, 500);
  });
}
