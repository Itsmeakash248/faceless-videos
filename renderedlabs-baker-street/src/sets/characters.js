// Bespoke character rigs for Baker Street Heist:
// 1. Robber in flat cap / beanie, dark trench/work jacket, gloves, carrying drill/pickaxe/flashlight/crowbar
// 2. Ham radio operator Robert Rowlands: bulky 1970s over-ear headphones, knit sweater
// 3. Metropolitan Police officer: peaked cap with diced band, dark navy tunic, epaulettes, flashlight
import { PAL, circ, rr, poly, clamp, TAU, lerp, hash } from '../core/lib.js';
import { figure, eyes, glove } from '../core/fig.js';

export const ROBBER_JACKET = { base: '#2d3345', shade: '#1c2130', hi: '#3e465e', cuff: '#1e2333' };
export const TWEED_CAP = { base: '#4d463d', shade: '#353028', hi: '#635b50', brim: '#28241e' };
export const COP_UNIFORM = { base: '#1b233a', shade: '#111726', badge: '#f2c864', cap: '#151d30' };

/** Draw a 1970s British flat cap or wool beanie on a stick figure head */
export function flatCap(c, hx, hy, R, dir = 1, type = 'flat') {
  c.save();
  if (type === 'flat') {
    // 1970s British working-class flat cap / newsboy cap
    c.fillStyle = TWEED_CAP.shade;
    c.beginPath();
    c.ellipse(hx - dir * R * 0.1, hy - R * 0.45, R * 1.15, R * 0.55, -dir * 0.15, 0, TAU);
    c.fill();
    // Cap crown top
    c.fillStyle = TWEED_CAP.base;
    c.beginPath();
    c.ellipse(hx + dir * R * 0.12, hy - R * 0.58, R * 0.98, R * 0.42, dir * 0.08, 0, TAU);
    c.fill();
    // Front brim / peak
    c.fillStyle = TWEED_CAP.brim;
    c.beginPath();
    c.ellipse(hx + dir * R * 0.88, hy - R * 0.28, R * 0.48, R * 0.16, dir * 0.22, 0, TAU);
    c.fill();
    // Little top button
    c.fillStyle = TWEED_CAP.hi;
    circ(c, hx, hy - R * 0.92, R * 0.12);
    c.fill();
  } else {
    // Knit beanie
    c.fillStyle = '#b85435'; // rust wool
    c.beginPath();
    c.arc(hx, hy - R * 0.1, R * 1.08, Math.PI * 0.85, Math.PI * 2.15);
    c.fill();
    c.fillStyle = '#943e24';
    rr(c, hx - R * 1.05, hy - R * 0.35, R * 2.1, R * 0.35, R * 0.1);
    c.fill();
  }
  c.restore();
}

/** Bulky 1970s over-ear radio headphones for Robert Rowlands */
export function radioHeadphones(c, hx, hy, R, dir = 1) {
  c.save();
  // Metallic curved headband
  c.strokeStyle = '#a6afba';
  c.lineWidth = R * 0.16;
  c.beginPath();
  c.arc(hx, hy - R * 0.1, R * 1.25, Math.PI * 1.1, Math.PI * 1.9);
  c.stroke();
  // Headband top padding
  c.strokeStyle = '#22262d';
  c.lineWidth = R * 0.28;
  c.beginPath();
  c.arc(hx, hy - R * 0.1, R * 1.25, Math.PI * 1.3, Math.PI * 1.7);
  c.stroke();
  // Left and right bulky earcups
  const earX1 = hx - R * 0.95, earX2 = hx + R * 0.95, earY = hy + R * 0.1;
  for (const ex of [earX1, earX2]) {
    c.fillStyle = '#1c1f26';
    c.beginPath();
    c.ellipse(ex, earY, R * 0.32, R * 0.52, 0, 0, TAU);
    c.fill();
    c.fillStyle = '#d2964a'; // chrome/amber trim ring
    c.lineWidth = R * 0.06;
    c.strokeStyle = '#8a94a2';
    c.stroke();
  }
  // Coiled cable hanging down
  c.strokeStyle = '#181a20';
  c.lineWidth = R * 0.08;
  c.beginPath();
  c.moveTo(earX1, earY + R * 0.45);
  for (let i = 0; i < 5; i++) {
    c.quadraticCurveTo(earX1 + (i % 2 ? 8 : -8), earY + R * 0.55 + i * 14, earX1, earY + R * 0.65 + i * 14);
  }
  c.stroke();
  c.restore();
}

/** British Metropolitan Police peaked cap with diced band */
export function policeCap(c, hx, hy, R, dir = 1) {
  c.save();
  // Cap crown
  c.fillStyle = COP_UNIFORM.cap;
  c.beginPath();
  c.ellipse(hx, hy - R * 0.62, R * 1.12, R * 0.52, 0, 0, TAU);
  c.fill();
  // Black and white sillitoe tartan (diced band)
  c.fillStyle = '#ffffff';
  c.fillRect(hx - R * 0.92, hy - R * 0.36, R * 1.84, R * 0.22);
  c.fillStyle = '#11141c';
  for (let i = 0; i < 7; i++) {
    if (i % 2 === 0) c.fillRect(hx - R * 0.92 + i * (R * 1.84 / 7), hy - R * 0.36, R * 1.84 / 7, R * 0.11);
    else c.fillRect(hx - R * 0.92 + i * (R * 1.84 / 7), hy - R * 0.25, R * 1.84 / 7, R * 0.11);
  }
  // Shiny black patent leather peak / visor
  c.fillStyle = '#0a0d14';
  c.beginPath();
  c.ellipse(hx + dir * R * 0.72, hy - R * 0.15, R * 0.55, R * 0.14, dir * 0.18, 0, TAU);
  c.fill();
  // Silver police badge in front
  c.fillStyle = '#e8ecf2';
  circ(c, hx + dir * R * 0.25, hy - R * 0.48, R * 0.16);
  c.fill();
  c.restore();
}

/** 1970s Robber figure with flat cap and dark jacket */
export function robber(c, o = {}) {
  const capType = o.cap || 'flat';
  const res = figure(c, {
    kind: 'hero',
    ...o,
  });
  // Draw flat cap over head
  if (res && res.head) {
    flatCap(c, res.head[0], res.head[1], res.head[2], o.dir ?? 1, capType);
  }
  return res;
}

/** Robert Rowlands figure with bulky radio headphones */
export function radioHam(c, o = {}) {
  const res = figure(c, {
    kind: 'hero',
    ...o,
  });
  if (res && res.head) {
    radioHeadphones(c, res.head[0], res.head[1], res.head[2], o.dir ?? 1);
  }
  return res;
}

/** Metropolitan Police Constable figure */
export function policeOfficer(c, o = {}) {
  const res = figure(c, {
    kind: 'hero',
    ...o,
  });
  if (res && res.head) {
    policeCap(c, res.head[0], res.head[1], res.head[2], o.dir ?? 1);
  }
  return res;
}

/** Handheld pickaxe tool */
export function drawPickaxe(c, x, y, angle = 0, scale = 1) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.scale(scale, scale);
  // Wood handle
  c.fillStyle = '#8f6843';
  c.fillRect(-6, -10, 12, 110);
  // Curved steel pick head
  c.fillStyle = '#687282';
  c.beginPath();
  c.moveTo(-60, -8);
  c.quadraticCurveTo(0, -22, 60, -8);
  c.lineTo(55, 6);
  c.quadraticCurveTo(0, -6, -55, 6);
  c.closePath();
  c.fill();
  c.restore();
}

/** Handheld heavy pneumatic / rotary drill */
export function drawDrill(c, x, y, angle = 0, scale = 1, vibrate = 0) {
  c.save();
  c.translate(x + (vibrate ? (Math.random() - 0.5) * 4 : 0), y + (vibrate ? (Math.random() - 0.5) * 4 : 0));
  c.rotate(angle);
  c.scale(scale, scale);
  // Motor body
  c.fillStyle = '#3a4456';
  rr(c, -35, -20, 70, 40, 8);
  c.fill();
  // Handle & trigger
  c.fillStyle = '#1c222e';
  c.fillRect(-28, 20, 20, 35);
  // Chuck
  c.fillStyle = '#8592a6';
  c.fillRect(35, -12, 18, 24);
  // Steel drill bit
  c.fillStyle = '#d2d9e3';
  c.fillRect(53, -5, 60, 10);
  c.restore();
}
