/* Right-triangle and rectangle diagrams: an SVG for the lines plus HTML labels
 * (so radicals, exponents and variables render exactly like the problem text). */
window.WU = window.WU || {};
(function (WU) {
  'use strict';
  const W = 320, H = 230, M = 62;

  const pct = (x, y) => `left:${(x / W * 100).toFixed(2)}%;top:${(y / H * 100).toFixed(2)}%;`;
  function anchor(nx, ny) {
    const tx = nx > 0.35 ? '0%' : nx < -0.35 ? '-100%' : '-50%';
    const ty = ny > 0.35 ? '0%' : ny < -0.35 ? '-100%' : '-50%';
    return `transform:translate(${tx},${ty});`;
  }
  function label(html, x, y, nx, ny, off) {
    const lx = x + nx * off, ly = y + ny * off;
    return `<div class="dg-label" style="${pct(lx, ly)}${anchor(nx, ny)}">${html}</div>`;
  }
  const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

  function triangle(s) {
    let r = s.b / s.a;
    r = Math.max(0.42, Math.min(1.7, r));
    const availW = W - 2 * M, availH = H - 2 * M + 10;
    let w = availW, h = w * r;
    if (h > availH) { h = availH; w = h / r; }
    const left = (W - w) / 2, right = left + w, top = (H - h) / 2, bottom = top + h;
    const o = s.orient || 0;
    const rx = o === 0 || o === 2 ? left : right;
    const ry = o === 0 || o === 1 ? bottom : top;
    const hx = rx === left ? right : left, hy = ry;
    const vx = rx, vy = ry === bottom ? top : bottom;
    const [ux, uy] = norm(hx - rx, hy - ry);
    const [wx, wy] = norm(vx - rx, vy - ry);
    const q = 14;
    const mark = `M${rx + ux * q},${ry + uy * q} L${rx + ux * q + wx * q},${ry + uy * q + wy * q} L${rx + wx * q},${ry + wy * q}`;
    let out = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <polygon points="${rx},${ry} ${hx},${hy} ${vx},${vy}" class="dg-shape"/>
      <path d="${mark}" class="dg-mark"/></svg>`;
    // horizontal leg label: away from V
    out += label(s.la, (rx + hx) / 2, ry, -wx, -wy, 8);
    // vertical leg label: away from H
    out += label(s.lb, rx, (ry + vy) / 2, -ux, -uy, 10);
    // hypotenuse label: away from right-angle corner
    const mx = (hx + vx) / 2, my = (hy + vy) / 2;
    const [nx, ny] = norm(mx - rx, my - ry);
    out += label(s.lc, mx, my, nx, ny, 8);
    return `<div class="diagram">${out}</div>`;
  }

  function rect(s) {
    let r = s.h / s.w;
    r = Math.max(0.4, Math.min(0.85, r));
    const w = W - 2 * M, h = Math.min(H - 2 * M + 10, w * r);
    const left = (W - w) / 2, right = left + w, top = (H - h) / 2, bottom = top + h;
    const q = 12;
    let out = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <rect x="${left}" y="${top}" width="${w}" height="${h}" class="dg-shape"/>
      <line x1="${left}" y1="${bottom}" x2="${right}" y2="${top}" class="dg-diag"/>
      <path d="M${right - q},${bottom} L${right - q},${bottom - q} L${right},${bottom - q}" class="dg-mark"/></svg>`;
    out += label(s.lw, (left + right) / 2, bottom, 0, 1, 8);
    out += label(s.lh, right, (top + bottom) / 2, 1, 0, 10);
    const [nx, ny] = norm(-h, -w); // normal to diagonal, toward upper-left
    out += label(s.ld, (left + right) / 2, (top + bottom) / 2, nx, ny, 6);
    return `<div class="diagram">${out}</div>`;
  }

  WU.renderDiagram = function (spec) {
    if (!spec) return '';
    return spec.kind === 'rect' ? rect(spec) : triangle(spec);
  };
})(window.WU);
