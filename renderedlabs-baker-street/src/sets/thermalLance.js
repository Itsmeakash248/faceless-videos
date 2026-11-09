// Thermal lance failure:
// Burning at 3,000°C, the oxygen lance fills the unventilated tunnel with choking toxic fumes
import { PAL, rr, circ, vgrad, rgrad, TAU } from '../core/lib.js';

export function thermalLanceScene(V, o = {}) {
  const t = o.t || 0;
  const flare = 0.8 + 0.2 * Math.sin(t * 22);

  V.layer(1.4, o.dof || 0, (c) => {
    // Dim underground tunnel background
    c.fillStyle = vgrad(c, 0, 0, 960, [
      [0, '#12141a'],
      [0.6, '#0b0d13'],
      [1, '#05070a']
    ]);
    c.fillRect(-1200, -800, 4400, 2000);

    // ── CONCRETE CEILING & REBAR AT Y = 280 ──
    const CY = 280;
    c.fillStyle = '#3a404d';
    c.fillRect(-1200, 0, 4400, CY);
    // Steel rebar grid exposed in gouged concrete
    c.fillStyle = '#657085';
    c.fillRect(780, CY - 25, 260, 25);
    // Scorch marks on concrete
    c.fillStyle = '#141416';
    c.beginPath();
    c.ellipse(920, CY, 110, 45, 0, 0, TAU);
    c.fill();

    // ── THE THERMAL LANCE PIPE ──
    // Long iron pipe packed with magnesium/steel wire burning at 3,000°C
    const LX = 880, LY = CY - 5;
    c.save();
    c.translate(LX, LY);
    c.rotate(-0.55); // angled up from robber's hands to ceiling

    // Lance pipe (black steel turning orange-red near the burning tip)
    const pipeGrad = vgrad(c, 0, -500, 0, [
      [0, '#2d3340'],
      [0.6, '#552a1a'],
      [0.85, '#d94b18'],
      [1, '#ffc04d']
    ]);
    c.fillStyle = pipeGrad;
    c.fillRect(-12, -480, 24, 480);

    // Oxygen hose trailing back
    c.strokeStyle = '#187a5a'; // Green oxygen hose
    c.lineWidth = 14;
    c.beginPath();
    c.moveTo(0, -480);
    c.quadraticCurveTo(-60, -550, -180, -620);
    c.stroke();

    c.restore();

    // ── BLINDING THERMAL FLAME & MOLTEN SPARKS AT CONTACT POINT ──
    // Intense white/yellow/orange plasma glow
    c.fillStyle = rgrad(c, LX, LY, 10, 260 * flare, [
      [0, 'rgba(255, 255, 255, 0.95)'],
      [0.2, 'rgba(255, 210, 80, 0.85)'],
      [0.55, 'rgba(255, 90, 20, 0.45)'],
      [1, 'rgba(255, 60, 10, 0)']
    ]);
    c.fillRect(LX - 300, LY - 200, 600, 500);

    // Cascading molten metal sparks raining down
    c.fillStyle = '#ffdf78';
    for (let i = 0; i < 24; i++) {
      const spX = LX + Math.sin(i * 4.3 + t * 14) * (60 + i * 8);
      const spY = LY + ((t * 800 + i * 45) % 450);
      circ(c, spX, spY, 3.5 + (i % 3));
      c.fill();
    }

    // ── BILLOWING TOXIC FUMES & DENSE SMOKE CLOUDS ──
    // Thick grey/brown suffocating smoke filling the tunnel
    c.fillStyle = 'rgba(120, 128, 140, 0.45)';
    for (let i = 0; i < 14; i++) {
      const smX = 400 + i * 90 + Math.sin(t * 3 + i) * 35;
      const smY = 320 + ((i % 4) * 85) + Math.cos(t * 2 + i) * 20;
      const smR = 75 + (i % 5) * 25;
      c.beginPath();
      c.arc(smX, smY, smR, 0, TAU);
      c.fill();
    }
    // Heavy smoke haze overlay
    c.fillStyle = 'rgba(40, 45, 55, 0.55)';
    c.fillRect(-1200, 200, 4400, 600);
  });
}
