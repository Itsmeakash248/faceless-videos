// Baker Street 1971 exterior: Lloyds Bank (185), Chicken Inn (187), and Le Sac (189)
import { PAL, rr, poly, circ, vgrad, rgrad, mixc, TAU } from '../core/lib.js';

export const STREET_Y = 740;

export function bakerStreetExterior(V, o = {}) {
  const t = o.t || 0;
  V.layer(1.6, o.dof || 0, (c) => {
    // Night sky over London
    c.fillStyle = vgrad(c, 0, -400, STREET_Y, [
      [0, '#0a0d18'],
      [0.6, '#131a2d'],
      [1, '#1b243c']
    ]);
    c.fillRect(-1200, -800, 4400, STREET_Y + 800);

    // Wet London street asphalt
    c.fillStyle = '#141822';
    c.fillRect(-1200, STREET_Y, 4400, 1200);
    // Pavement curb and flagstones
    c.fillStyle = '#2c3345';
    c.fillRect(-1200, STREET_Y - 26, 4400, 26);
    c.fillStyle = '#1e2330';
    c.fillRect(-1200, STREET_Y, 4400, 6);

    // ── 185 BAKER STREET: LLOYDS BANK (Right side: x: 1050 to 2200) ──
    const bx = 1080;
    // Classical Portland stone facade
    c.fillStyle = '#51596b';
    c.fillRect(bx, 100, 950, STREET_Y - 100);
    // Classical stone cornices & pediment
    c.fillStyle = '#3f4655';
    c.fillRect(bx - 20, 160, 990, 24);
    c.fillRect(bx - 10, 310, 970, 18);
    // Stone Pilasters / Columns
    for (const cx of [bx + 40, bx + 260, bx + 540, bx + 780]) {
      c.fillStyle = '#656e82';
      c.fillRect(cx, 184, 48, STREET_Y - 210);
      c.fillStyle = '#393f4e';
      c.fillRect(cx - 6, 184, 60, 14);
      c.fillRect(cx - 8, STREET_Y - 36, 64, 12);
    }
    // High arched bank windows with wrought iron security grilles
    for (const wx of [bx + 115, bx + 340, bx + 615]) {
      c.fillStyle = '#161c28';
      c.beginPath();
      c.arc(wx + 55, 390, 55, Math.PI, 0);
      c.rect(wx, 390, 110, 220);
      c.fill();
      // Amber interior bank security light
      c.fillStyle = 'rgba(240,210,130,0.18)';
      c.fillRect(wx + 8, 390, 94, 212);
      // Heavy iron security bars
      c.strokeStyle = '#0e121a';
      c.lineWidth = 4;
      for (let i = 1; i < 5; i++) {
        c.beginPath();
        c.moveTo(wx + i * 22, 360);
        c.lineTo(wx + i * 22, 610);
        c.stroke();
      }
    }
    // Lloyds Bank Main Branch Door
    const dx = bx + 840;
    c.fillStyle = '#222834';
    c.fillRect(dx, 410, 130, STREET_Y - 436);
    c.fillStyle = '#11151c';
    c.fillRect(dx + 12, 424, 106, STREET_Y - 450);

    // Bank bronze nameplate sign
    c.fillStyle = '#1f2638';
    rr(c, bx + 180, 230, 620, 68, 8);
    c.fill();
    c.strokeStyle = '#d6af5a';
    c.lineWidth = 3;
    c.stroke();
    c.fillStyle = '#eed284';
    c.font = '700 32px Fredoka';
    c.textAlign = 'center';
    c.letterSpacing = '3px';
    c.fillText('LLOYDS BANK LIMITED', bx + 490, 266);
    c.font = '600 16px Nunito';
    c.fillStyle = '#bfa56a';
    c.fillText('185 BAKER STREET · EST. 1765', bx + 490, 288);

    // ── 187 BAKER STREET: THE CHICKEN INN (Center: x: 420 to 1050) ──
    const rx = 440;
    c.fillStyle = '#3a322b'; // Dark brick
    c.fillRect(rx, 140, 610, STREET_Y - 140);
    // Restaurant windows with warm incandescent light
    c.fillStyle = '#e8a846';
    c.fillRect(rx + 40, 430, 240, 180);
    c.fillStyle = 'rgba(255,200,100,0.25)';
    c.fillRect(rx + 20, 390, 280, 240);
    // Chicken Inn fascia board
    c.fillStyle = '#7a241b'; // 1970s burgundy red
    rr(c, rx + 30, 330, 550, 62, 6);
    c.fill();
    c.fillStyle = '#fce4a6';
    c.font = '700 34px Fredoka';
    c.textAlign = 'center';
    c.fillText('THE CHICKEN INN', rx + 305, 368);
    c.font = '600 15px Nunito';
    c.fillStyle = '#e8c282';
    c.fillText('RESTAURANT & ROTISSERIE · 187', rx + 305, 386);

    // ── 189 BAKER STREET: LE SAC LEATHER GOODS (Left: x: -200 to 420) ──
    const sx = -100;
    c.fillStyle = '#45403a'; // Brown brick shop
    c.fillRect(sx, 120, 520, STREET_Y - 120);
    // Green striped shop awning
    c.fillStyle = '#1c4a34'; // British racing green
    poly(c, [sx + 20, 420, sx + 480, 420, sx + 500, 470, sx, 470]);
    c.fill();
    c.fillStyle = '#f2ebd9';
    for (let i = 0; i < 8; i++) {
      poly(c, [sx + 40 + i * 55, 420, sx + 65 + i * 55, 420, sx + 50 + i * 55, 470, sx + 25 + i * 55, 470]);
      c.fill();
    }
    // Shop display window with leather bags
    c.fillStyle = '#1e241c';
    c.fillRect(sx + 40, 480, 400, 160);
    c.fillStyle = 'rgba(240,225,180,0.15)';
    c.fillRect(sx + 50, 490, 380, 140);
    // Bags on display
    c.fillStyle = '#7c4323';
    rr(c, sx + 80, 570, 60, 45, 6); c.fill();
    c.fillStyle = '#4a2916';
    rr(c, sx + 180, 555, 75, 60, 8); c.fill();
    c.fillStyle = '#9e6236';
    rr(c, sx + 300, 580, 55, 35, 6); c.fill();

    // Fascia board
    c.fillStyle = '#173627';
    rr(c, sx + 30, 340, 430, 58, 6);
    c.fill();
    c.fillStyle = '#f0db9e';
    c.font = '700 30px Fredoka';
    c.textAlign = 'center';
    c.fillText('LE SAC', sx + 245, 374);
    c.font = '600 14px Nunito';
    c.fillText('LEATHER GOODS & ORNAMENTS · 189', sx + 245, 392);

    // ── STREET DETAILS ──
    // Cast iron ornate streetlamp at x: 380
    const lx = 370, ly = 320;
    c.fillStyle = '#181b22';
    c.fillRect(lx - 6, ly, 12, STREET_Y - ly - 26);
    c.fillRect(lx - 20, STREET_Y - 36, 40, 10);
    // Lamp head
    poly(c, [lx - 32, ly - 30, lx + 32, ly - 30, lx + 18, ly + 25, lx - 18, ly + 25]);
    c.fill();
    // Glowing warm amber lamp light
    c.fillStyle = 'rgba(255, 210, 110, 0.85)';
    poly(c, [lx - 22, ly - 24, lx + 22, ly - 24, lx + 14, ly + 18, lx - 14, ly + 18]);
    c.fill();
    c.fillStyle = rgrad(c, lx, ly, 20, 380, [
      [0, 'rgba(255, 220, 120, 0.42)'],
      [0.6, 'rgba(255, 200, 90, 0.12)'],
      [1, 'rgba(255, 180, 70, 0)']
    ]);
    c.fillRect(lx - 350, ly - 150, 700, 600);
  });
}
