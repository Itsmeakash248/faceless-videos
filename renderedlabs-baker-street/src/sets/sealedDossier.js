// Sealed Police Dossiers at The National Archives:
// - Metropolitan Police Criminal Record Office files MEPO 26/418/4 and MEPO 26/417/5
// - Red official rubber stamp: "CLOSED UNTIL 1 JANUARY 2071"
// - Exemption reason: Personal information where the applicant is a 3rd party
import { PAL, rr, circ, poly, vgrad, rgrad, clamp, TAU } from '../core/lib.js';

export function sealedDossierScene(V, o = {}) {
  const t = o.t || 0;
  const stampK = o.stampK ?? 1.0;

  V.layer(1.4, o.dof || 0, (c) => {
    // Deep archival mahogany desk surface
    c.fillStyle = vgrad(c, 0, 0, 960, [
      [0, '#121622'],
      [0.6, '#182030'],
      [1, '#0e121a']
    ]);
    c.fillRect(-1200, -800, 4400, 2000);

    // ── THE AGED MANILA EVIDENCE DOSSIER (x: 480 to 1440, y: 160 to 800) ──
    const FX = 520, FY = 160, FW = 880, FH = 620;

    // Folder drop shadow
    c.fillStyle = 'rgba(0, 0, 0, 0.45)';
    rr(c, FX + 14, FY + 18, FW, FH, 14); c.fill();

    // Heavy manila card stock (aged amber-parchment)
    c.fillStyle = '#d8c29d';
    rr(c, FX, FY, FW, FH, 12); c.fill();

    // File folder spine & tab on top
    c.fillStyle = '#bfa57c';
    poly(c, [FX + 40, FY, FX + 80, FY - 32, FX + 340, FY - 32, FX + 370, FY]);
    c.fill();
    c.fillStyle = '#2c2214';
    c.font = '700 16px Nunito';
    c.textAlign = 'left';
    c.fillText('MEPO 26/418/4 (PART 2)', FX + 90, FY - 10);

    // Red archival ribbon / cotton tape tied across folder
    c.fillStyle = '#8b2626';
    c.fillRect(FX, FY + 310, FW, 28);
    c.fillRect(FX + 420, FY, 30, FH);
    // Wax seal knot in center
    c.fillStyle = '#6b1818';
    circ(c, FX + 435, FY + 324, 26); c.fill();

    // ── OFFICIAL BRITISH CROWN & METROPOLITAN POLICE CREST ──
    c.fillStyle = '#2d2417';
    c.font = '700 24px Fredoka';
    c.textAlign = 'center';
    c.letterSpacing = '2px';
    c.fillText('METROPOLITAN POLICE', FX + FW / 2, FY + 75);
    c.font = '700 15px Nunito';
    c.fillText('CRIMINAL INVESTIGATION DEPARTMENT · SCOTLAND YARD', FX + FW / 2, FY + 102);

    // Thin separator line
    c.strokeStyle = '#6e5a40';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(FX + 80, FY + 120); c.lineTo(FX + FW - 80, FY + 120);
    c.stroke();

    // Case Details Table
    c.font = '600 16px Nunito';
    c.textAlign = 'left';
    c.fillStyle = '#3a2e1d';
    c.fillText('SUBJECT: BAKER STREET BANK BURGLARY (LLOYDS BANK 185 BAKER ST)', FX + 80, FY + 160);
    c.fillText('DATE OF OFFENCE: 10–13 SEPTEMBER 1971 · TRIAL: OLD BAILEY 1973', FX + 80, FY + 195);
    c.fillText('HAUL VALUE: £1,500,000 (RECOVERED: £231,000) · 268 SAFE BOXES EMPTIED', FX + 80, FY + 230);
    c.fillText('CLOSED EXTRACT: APPROXIMATELY 700 PAGES SEALED EVIDENCE', FX + 80, FY + 265);

    // ── FREEDOM OF INFORMATION EXEMPTION BADGE ──
    c.fillStyle = '#f7fafc';
    rr(c, FX + 80, FY + 380, FW - 160, 90, 8); c.fill();
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 2; c.stroke();

    c.fillStyle = '#1e293b';
    c.font = '700 15px Nunito';
    c.textAlign = 'left';
    c.fillText('THE NATIONAL ARCHIVES · ACCESS REGULATION:', FX + 105, FY + 412);
    c.fillStyle = '#0f172a';
    c.font = '800 18px Nunito';
    c.fillText('“Personal information where the applicant is a 3rd party”', FX + 105, FY + 442);

    // ── RED RUBBER STAMP: "CLOSED UNTIL 1 JANUARY 2071" ──
    if (stampK > 0) {
      c.save();
      c.translate(FX + FW / 2 + 60, FY + FH - 110);
      c.rotate(-0.14);
      const scale = clamp(stampK * 1.5, 0.8, 1.2);
      c.scale(scale, scale);

      // Red stamp border
      c.strokeStyle = '#c53030';
      c.lineWidth = 6;
      rr(c, -270, -45, 540, 90, 10);
      c.stroke();
      c.strokeStyle = 'rgba(197, 48, 48, 0.4)';
      c.lineWidth = 2;
      rr(c, -262, -37, 524, 74, 6);
      c.stroke();

      // Bold red stamp text
      c.fillStyle = '#c53030';
      c.font = '900 32px Fredoka';
      c.textAlign = 'center';
      c.letterSpacing = '3px';
      c.fillText('CLOSED UNTIL 1 JAN 2071', 0, 5);
      c.font = '800 13px Nunito';
      c.fillText('700 PAGES RETAINED · FOI EXEMPTION CODE 92', 0, 26);
      c.restore();
    }
  });
}
