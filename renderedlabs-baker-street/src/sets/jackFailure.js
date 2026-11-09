// 100-ton hydraulic jack failure:
// Pushing against the 3-foot concrete slab, the tunnel floor sinks into an unmapped ancient well
import { PAL, rr, poly, circ, vgrad, rgrad, mixc, TAU } from '../core/lib.js';

export function jackFailureScene(V, o = {}) {
  const t = o.t || 0;
  const sinkY = Math.min(65, (o.sink ?? 1.0) * 65); // sinking down into the well

  V.layer(1.4, o.dof || 0, (c) => {
    // Underground chamber background
    c.fillStyle = vgrad(c, 0, 0, 960, [
      [0, '#10141e'],
      [0.6, '#0a0d14'],
      [1, '#05070a']
    ]);
    c.fillRect(-1200, -800, 4400, 2000);

    // ── CEILING: 3-FOOT CONCRETE SLAB UNDERSIDE (y = 280) ──
    const CY = 280;
    c.fillStyle = '#454c5c';
    c.fillRect(-1200, 0, 4400, CY);
    // Exposed steel reinforcing rebar rods
    c.fillStyle = '#7a8599';
    for (let i = 0; i < 18; i++) {
      c.fillRect(-800 + i * 220, CY - 18, 160, 14);
    }
    c.fillStyle = '#222733';
    c.fillRect(-1200, CY - 4, 4400, 4);

    // ── THE ANCIENT WELL (Subterranean Victorian brick shaft & mud pool) ──
    const WX = 960, WY = 700;
    // Ancient curved brick well lip
    c.fillStyle = '#261e18';
    c.beginPath();
    c.ellipse(WX, WY + 80, 420, 140, 0, 0, TAU);
    c.fill();
    // Dark murky well water / mud void
    c.fillStyle = '#080c10';
    c.beginPath();
    c.ellipse(WX, WY + 80, 380, 115, 0, 0, TAU);
    c.fill();
    // Muddy water ripples
    c.strokeStyle = 'rgba(80,110,130,0.4)';
    c.lineWidth = 3;
    for (let r = 0; r < 4; r++) {
      c.beginPath();
      c.ellipse(WX, WY + 80, 120 + r * 65, 35 + r * 20, 0, 0, TAU);
      c.stroke();
    }

    // ── CRACKED TIMBER RAILWAY SLEEPERS (Tilting down into the well) ──
    c.save();
    c.translate(WX, WY + sinkY);
    c.rotate(0.08 * (sinkY / 65));
    // Heavy wooden sleeper beams
    c.fillStyle = '#4a3321';
    rr(c, -320, -30, 640, 45, 6);
    c.fill();
    c.fillStyle = '#362416';
    rr(c, -280, 15, 560, 40, 6);
    c.fill();

    // ── 100-TON YELLOW HYDRAULIC JACK ──
    const JX = 0, JY = -30;
    // Jack base
    c.fillStyle = '#d69e2e'; // Industrial warning yellow
    rr(c, JX - 110, JY - 240, 220, 240, 12);
    c.fill();
    c.strokeStyle = '#975a16';
    c.lineWidth = 4;
    c.stroke();

    // Heavy steel piston extending up toward the concrete ceiling
    const pistonTop = CY - (WY + sinkY + JY - 240);
    c.fillStyle = '#cbd5e0'; // Polished chrome/steel ram
    c.fillRect(JX - 48, JY - 240 + pistonTop, 96, -pistonTop);
    // Ram top contact plate pressing against the concrete
    c.fillStyle = '#2d3748';
    rr(c, JX - 70, JY - 240 + pistonTop - 18, 140, 20, 4);
    c.fill();

    // Hydraulic pump lever / handle
    c.strokeStyle = '#1a202c';
    c.lineWidth = 14;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(JX + 85, JY - 120);
    c.lineTo(JX + 220, JY - 80 + Math.sin(t * 8) * 20);
    c.stroke();

    // Industrial pressure gauge
    c.fillStyle = '#ffffff';
    circ(c, JX - 55, JY - 140, 36);
    c.fill();
    c.strokeStyle = '#2d3748';
    c.lineWidth = 4;
    c.stroke();
    // Gauge needle (dropped to ZERO pressure!)
    c.strokeStyle = '#e53e3e';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(JX - 55, JY - 140);
    c.lineTo(JX - 78, JY - 140); // needle pointed left at zero
    c.stroke();
    circ(c, JX - 55, JY - 140, 4);
    c.fillStyle = '#000';
    c.fill();

    c.fillStyle = '#2d3748';
    c.font = '700 13px Nunito';
    c.textAlign = 'center';
    c.fillText('0 PSI', JX - 55, JY - 115);

    // Stencilled label on jack body
    c.fillStyle = '#1a202c';
    c.font = '900 24px Fredoka';
    c.fillText('100 TON', JX, JY - 60);
    c.font = '700 13px Nunito';
    c.fillText('HYDRAULIC JACK', JX, JY - 38);

    c.restore();

    // Mud splashes around the sinking base
    c.fillStyle = '#2b2016';
    for (let i = 0; i < 8; i++) {
      circ(c, WX - 220 + i * 60, WY + 80 + Math.sin(i * 3 + t * 4) * 12, 10 + (i % 3) * 4);
      c.fill();
    }
  });
}
