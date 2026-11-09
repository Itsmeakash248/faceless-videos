// Ham Radio Intercept Station (Robert Rowlands in Wimpole Street):
// - Glowing vacuum-tube communications receiver & tuning dial
// - Signal S-meter
// - Cassette recorder with spinning reels
// - Oscilloscope green audio waveform displaying intercepted walkie-talkie voice
import { PAL, rr, circ, poly, vgrad, rgrad, clamp, TAU } from '../core/lib.js';

export function hamRadioScene(V, o = {}) {
  const t = o.t || 0;
  const sig = o.wave ?? true;

  V.layer(1.4, o.dof || 0, (c) => {
    // Dark room background
    c.fillStyle = vgrad(c, 0, 0, 960, [
      [0, '#0c101a'],
      [0.6, '#131926'],
      [1, '#0a0e17']
    ]);
    c.fillRect(-1200, -800, 4400, 2000);

    // Rainy window looking out at foggy London rooftops at night (x: 200 to 700)
    const WX = 220, WY = 180, WW = 460, WH = 420;
    c.fillStyle = '#070a12';
    c.fillRect(WX, WY, WW, WH);
    // London rooftops & chimney pots
    c.fillStyle = '#101726';
    poly(c, [WX, WY + WH, WX + 80, WY + 280, WX + 160, WY + 310, WX + 260, WY + 250, WX + 380, WY + 290, WX + WW, WY + 240, WX + WW, WY + WH]);
    c.fill();
    // Chimneys
    c.fillRect(WX + 100, WY + 240, 26, 50);
    c.fillRect(WX + 280, WY + 210, 32, 50);
    // Window wooden frame
    c.strokeStyle = '#2d3748';
    c.lineWidth = 14;
    c.strokeRect(WX, WY, WW, WH);
    c.beginPath();
    c.moveTo(WX + WW / 2, WY); c.lineTo(WX + WW / 2, WY + WH);
    c.moveTo(WX, WY + WH * 0.45); c.lineTo(WX + WW, WY + WH * 0.45);
    c.stroke();

    // ── OPERATOR'S RADIO DESK (y = 660) ──
    const DY = 660;
    c.fillStyle = '#1e1a17';
    c.fillRect(-1200, DY, 4400, 1200);
    c.fillStyle = '#362a20';
    c.fillRect(-1200, DY - 14, 4400, 14);

    // ── 1970s VACUUM TUBE RADIO RECEIVER (x: 780 to 1420) ──
    const RX = 790, RY = 360, RW = 640, RH = 286;
    // Heavy metal radio chassis
    c.fillStyle = '#2d3748';
    rr(c, RX, RY, RW, RH, 10);
    c.fill();
    c.strokeStyle = '#1a202c';
    c.lineWidth = 4;
    c.stroke();

    // Illuminated large frequency tuning dial (illuminated in warm amber)
    const TX = RX + 60, TY = RY + 50, TW = 360, TH = 120;
    c.fillStyle = '#11141c';
    rr(c, TX, TY, TW, TH, 6);
    c.fill();
    c.fillStyle = 'rgba(255, 190, 80, 0.22)';
    rr(c, TX + 4, TY + 4, TW - 8, TH - 8, 4);
    c.fill();

    // Frequency scale markings (MHz)
    c.fillStyle = '#eedaa2';
    c.font = '700 14px Nunito';
    c.textAlign = 'center';
    c.fillText('26.965 · · · · · · 27.185 MHz (WALKIE-TALKIE BAND)', TX + TW / 2, TY + 30);

    // Frequency ruler ticks
    c.strokeStyle = '#d69e2e';
    c.lineWidth = 2;
    for (let x = TX + 30; x <= TX + TW - 30; x += 18) {
      c.beginPath();
      c.moveTo(x, TY + 45);
      c.lineTo(x, TY + (x % 36 === 0 ? 70 : 58));
      c.stroke();
    }
    // Glowing red tuning needle (locked on 27.1 MHz!)
    c.strokeStyle = '#e53e3e';
    c.lineWidth = 3.5;
    const needleX = TX + TW * 0.58;
    c.beginPath();
    c.moveTo(needleX, TY + 38);
    c.lineTo(needleX, TY + 85);
    c.stroke();

    // Illuminated S-Meter (Signal Strength)
    const MX = RX + 460, MY = RY + 50, MW = 120, MH = 80;
    c.fillStyle = '#11141c';
    rr(c, MX, MY, MW, MH, 6); c.fill();
    c.fillStyle = 'rgba(240, 200, 100, 0.18)';
    rr(c, MX + 3, MY + 3, MW - 6, MH - 6, 4); c.fill();
    c.fillStyle = '#fce4a6';
    c.font = '700 11px Nunito';
    c.fillText('S-METER', MX + MW / 2, MY + 20);
    // Bouncing needle
    c.strokeStyle = '#f56565';
    c.lineWidth = 2.5;
    const meterAngle = -0.4 + Math.sin(t * 16) * 0.35;
    c.beginPath();
    c.moveTo(MX + MW / 2, MY + MH - 12);
    c.lineTo(MX + MW / 2 + Math.cos(meterAngle) * 45, MY + MH - 12 - Math.sin(meterAngle) * 45);
    c.stroke();

    // Radio knobs & dials below
    const knobY = RY + 215;
    for (let i = 0; i < 5; i++) {
      const kx = RX + 100 + i * 110;
      c.fillStyle = '#1a202c';
      circ(c, kx, knobY, 26); c.fill();
      c.strokeStyle = '#718096';
      c.lineWidth = 3; c.stroke();
      // Pointer notch
      c.strokeStyle = '#ecc94b';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(kx, knobY);
      c.lineTo(kx + Math.cos(i * 1.3) * 22, knobY + Math.sin(i * 1.3) * 22);
      c.stroke();
    }

    // ── CASSETTE TAPE RECORDER (Wimpole Street police evidence recording) ──
    const CX = 1480, CY = 470, CW = 320, CH = 180;
    c.fillStyle = '#4a5568';
    rr(c, CX, CY, CW, CH, 8); c.fill();
    // Tape cassette compartment
    c.fillStyle = '#1a202c';
    rr(c, CX + 30, CY + 30, CW - 60, CH - 70, 4); c.fill();
    // Dual spinning tape reels
    const reelAng = t * 6;
    for (const rx of [CX + 100, CX + CW - 100]) {
      c.fillStyle = '#ffffff';
      circ(c, rx, CY + 75, 28); c.fill();
      c.strokeStyle = '#a0aec0'; c.lineWidth = 4;
      for (let a = 0; a < TAU; a += TAU / 3) {
        c.beginPath();
        c.moveTo(rx, CY + 75);
        c.lineTo(rx + Math.cos(reelAng + a) * 24, CY + 75 + Math.sin(reelAng + a) * 24);
        c.stroke();
      }
    }
    // Red REC LED glowing bright
    c.fillStyle = '#f56565';
    circ(c, CX + 45, CY + CH - 22, 6); c.fill();
    c.fillStyle = 'rgba(245, 101, 101, 0.45)';
    circ(c, CX + 45, CY + CH - 22, 14); c.fill();
    c.fillStyle = '#fed7d7';
    c.font = '700 12px Nunito';
    c.textAlign = 'left';
    c.fillText('REC · POLICE LOG', CX + 62, CY + CH - 18);

    // ── OSCILLOSCOPE AUDIO WAVEFORM (Pulsing green CRT line) ──
    if (sig) {
      const OX = 960, OY = 220, OW = 420, OH = 100;
      c.fillStyle = 'rgba(10, 25, 20, 0.88)';
      rr(c, OX - OW / 2, OY - OH / 2, OW, OH, 8); c.fill();
      c.strokeStyle = '#22543d';
      c.lineWidth = 3;
      c.stroke();

      // Glowing CRT green waveform line
      c.strokeStyle = '#48bb78';
      c.lineWidth = 3.5;
      c.shadowColor = 'rgba(72, 187, 120, 0.85)';
      c.shadowBlur = 12;
      c.beginPath();
      for (let x = 0; x < OW - 20; x += 4) {
        const wx = OX - OW / 2 + 10 + x;
        const phase = (x / OW) * 18 + t * 24;
        const wy = OY + Math.sin(phase) * Math.sin(phase * 0.4) * 32 * (0.6 + 0.4 * Math.sin(t * 8));
        if (x === 0) c.moveTo(wx, wy); else c.lineTo(wx, wy);
      }
      c.stroke();
      c.shadowBlur = 0;
    }
  });
}
