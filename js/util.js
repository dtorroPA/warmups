/* Shared helpers: randomness, number words, and math rendering (HTML). */
window.WU = window.WU || {};
(function (WU) {
  'use strict';

  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  // random integer in [a, b] that is a multiple of step
  const ris = (a, b, step) => a + step * Math.floor(Math.random() * (Math.floor((b - a) / step) + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const chance = (p) => Math.random() < p;
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // weighted pick: items = [[weight, value], ...]
  const wpick = (items) => {
    const total = items.reduce((s, it) => s + it[0], 0);
    let r = Math.random() * total;
    for (const [w, v] of items) { if ((r -= w) < 0) return v; }
    return items[items.length - 1][1];
  };

  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const word = (n) => (Number.isInteger(n) && n >= 0 && n <= 20 ? WORDS[n] : String(n));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const MINUS = '−';
  const fmtNum = (n) => {
    if (Number.isInteger(n)) return String(n);
    return String(Math.round(n * 100) / 100);
  };
  const money = (n) => '$' + (Number.isInteger(n) ? String(n) : n.toFixed(2));

  // ---------- math HTML ----------
  const v = (name) => `<i class="mv">${name}</i>`;
  const sq = (inner) => `${inner}<sup>2</sup>`;
  const frac = (num, den) =>
    `<span class="frac"><span class="fn">${num}</span><span class="fd">${den}</span></span>`;
  const paren = (s) => `(${s})`;

  // Build a polynomial-like string from [[coef, varHTML], ...]; varHTML '' = constant
  function poly(terms) {
    let out = '';
    let first = true;
    for (const [c, vv] of terms) {
      if (c === 0) continue;
      const neg = c < 0;
      const a = Math.abs(c);
      const body = vv ? (a === 1 ? vv : fmtNum(a) + vv) : fmtNum(a);
      if (first) out += (neg ? MINUS : '') + body;
      else out += (neg ? ` ${MINUS} ` : ' + ') + body;
      first = false;
    }
    return out || '0';
  }

  // ---------- radicals ----------
  // n = k^2 * m with m square-free
  function simplifyRoot(n) {
    let k = 1, m = n;
    for (let f = 2; f * f <= m; f++) {
      while (m % (f * f) === 0) { m /= f * f; k *= f; }
    }
    return { k, m };
  }
  const isSquare = (n) => n >= 0 && Number.isInteger(Math.sqrt(n));
  const rad = (m) => `<span class="rad"><span class="rs">√</span><span class="ri">${m}</span></span>`;
  // HTML for k√m
  function radHTML(k, m) {
    if (m === 1) return String(k);
    return (k === 1 ? '' : String(k)) + rad(m);
  }
  // HTML for √n simplified
  function sqrtHTML(n) {
    const { k, m } = simplifyRoot(n);
    return radHTML(k, m);
  }
  const approx = (x) => (Math.round(x * 10) / 10).toFixed(1);

  // Expose
  Object.assign(WU, {
    ri, ris, pick, chance, shuffle, wpick, word, cap, MINUS, fmtNum, money,
    v, sq, frac, paren, poly, simplifyRoot, isSquare, rad, radHTML, sqrtHTML, approx,
  });
})(window.WU);
