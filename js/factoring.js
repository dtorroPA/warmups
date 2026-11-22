/* Factoring — problem generators.
 *
 * Types
 *   gcf      Greatest common factor
 *   tri1     Trinomials with a = 1
 *   dots     Difference of two squares
 *   tri      Trinomials with a ≠ 1
 *   cubes    Sum & difference of cubes
 *   group    Factoring by grouping (degree 3 or higher)
 *   quartic  Quadratic form (x⁴ + bx² + c, and some x⁶ + bx³ + c)
 *
 * Every problem is built by multiplying factors together, so the answer is
 * correct by construction. `check` holds both sides for the automated tests.
 */
window.WU = window.WU || {};
(function (WU) {
  'use strict';
  const { ri, pick, chance, MINUS } = WU;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const gcdAll = (arr) => arr.reduce((g, n) => gcd(g, n), 0);
  const nz = (a, b) => { let n; do { n = ri(a, b); } while (n === 0); return n; };

  // ---------------------------------------------------------------------------
  // Tiny polynomial toolkit. A polynomial is a list of terms {c, v: {x: 2, y: 1}}.
  // ---------------------------------------------------------------------------
  const vkey = (v) => Object.keys(v).filter((k) => v[k]).sort().map((k) => k + '^' + v[k]).join('*');
  function T(c, v = {}) { const o = {}; for (const k in v) if (v[k]) o[k] = v[k]; return { c, v: o }; }
  function norm(P) {
    const m = new Map();
    for (const t of P) {
      const k = vkey(t.v);
      if (m.has(k)) m.get(k).c += t.c; else m.set(k, T(t.c, t.v));
    }
    return [...m.values()].filter((t) => t.c !== 0);
  }
  function mul(P, Q) {
    const out = [];
    for (const a of P) for (const b of Q) {
      const v = { ...a.v };
      for (const k in b.v) v[k] = (v[k] || 0) + b.v[k];
      out.push(T(a.c * b.c, v));
    }
    return norm(out);
  }
  function powP(P, e) { let R = [T(1)]; for (let i = 0; i < e; i++) R = mul(R, P); return R; }
  function same(P, Q) {
    const a = norm(P), b = norm(Q);
    if (a.length !== b.length) return false;
    const m = new Map(a.map((t) => [vkey(t.v), t.c]));
    return b.every((t) => m.get(vkey(t.v)) === t.c);
  }
  const tdeg = (t) => Object.values(t.v).reduce((s, e) => s + e, 0);
  function sortTerms(P, main) {
    return norm(P).slice().sort((a, b) => ((b.v[main] || 0) - (a.v[main] || 0)) || (tdeg(b) - tdeg(a)));
  }
  const varsHTML = (v) => Object.keys(v).sort().map((k) => WU.v(k) + (v[k] > 1 ? `<sup>${v[k]}</sup>` : '')).join('');
  function termBody(t) {
    const a = Math.abs(t.c), vs = varsHTML(t.v);
    return vs ? (a === 1 ? '' : a) + vs : String(a);
  }
  function polyHTML(P, main, asc) {
    const ts = sortTerms(P, main);
    if (asc) ts.reverse();
    return ts.map((t, i) => (i === 0 ? (t.c < 0 ? MINUS : '') : (t.c < 0 ? ` ${MINUS} ` : ' + ')) + termBody(t)).join('') || '0';
  }
  // factors: [{P, e?, asc?}] — monomial factors are combined and written first
  function factoredHTML(factors, main) {
    const merged = [];
    for (const f of factors) {
      const m = merged.find((g) => same(g.P, f.P));
      if (m) m.e += f.e || 1; else merged.push({ P: f.P, e: f.e || 1, asc: f.asc });
    }
    const mono = merged.filter((f) => f.P.length === 1);
    const multi = merged.filter((f) => f.P.length > 1);
    let lead = '';
    if (mono.length) {
      let M = [T(1)];
      mono.forEach((f) => { M = mul(M, powP(f.P, f.e)); });
      const t = M[0];
      const bare = !Object.keys(t.v).length;
      if (bare && t.c === -1) lead = MINUS;
      else if (!(bare && t.c === 1)) lead = polyHTML(M, main);
    }
    const body = multi.map((f) => {
      const inner = polyHTML(f.P, main, f.asc);
      if (multi.length === 1 && !lead && f.e === 1) return inner;
      return `(${inner})${f.e > 1 ? `<sup>${f.e}</sup>` : ''}`;
    }).join('');
    return lead + body;
  }
  const expand = (factors) => factors.reduce((R, f) => mul(R, powP(f.P, f.e || 1)), [T(1)]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const VARS = ['x', 'x', 'x', 'x', 'a', 'm', 'n', 't', 'p', 'k'];
  const PAIRS = [['x', 'y'], ['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']];
  const pickVar = () => pick(VARS);
  // c·X^e·Y^f as a one-term polynomial
  const mono = (c, X, e, Y, f) => [T(c, { [X]: e, ...(Y ? { [Y]: f || 0 } : {}) })];
  // m·X + p (·Y)
  const lin = (m, X, p, Y) => [T(m, { [X]: 1 }), T(p, Y ? { [Y]: 1 } : {})];
  const isSq = (n) => n > 0 && Number.isInteger(Math.sqrt(n));
  const isCube = (n) => n !== 0 && Number.isInteger(Math.round(Math.cbrt(Math.abs(n)))) && Math.round(Math.cbrt(Math.abs(n))) ** 3 === Math.abs(n);

  // Pick an optional GCF to put in front (number, or number·x)
  function maybeGCF(o, X, allowVar) {
    if (!o.gcf || !chance(0.3)) return null;
    const k = ri(2, 5);
    return allowVar && chance(0.35) ? mono(k, X, 1) : [T(k)];
  }

  const FACTOR = 'Factor completely.';
  function make(type, label, factors, main, { asc, key, tkey, work, prompt } = {}) {
    const P = expand(factors);
    const shown = `<div class="mx-line">${polyHTML(P, main, asc)}</div>`;
    return {
      topic: 'fact', level: type, label: 'Factoring · ' + label,
      text: (prompt || FACTOR) + shown, prompt: '',
      answer: factoredHTML(factors, main), alts: [], work: work || '',
      key: 'F|' + type + '|' + key, tkey: 'F|' + type + '|' + (tkey || ''),
      check: { P, factors },
    };
  }

  // Is a one-variable quadratic (or quadratic in X²) factorable over the integers?
  function factorableQuadLike(P, X) {
    if (P.some((t) => Object.keys(t.v).some((k) => k !== X))) return false;
    const degs = P.map((t) => t.v[X] || 0);
    const mx = Math.max(...degs);
    for (const s of [1, 2]) {
      if (mx !== 2 * s || degs.some((d) => d % s)) continue;
      const co = (d) => (P.find((t) => (t.v[X] || 0) === d) || { c: 0 }).c;
      const a = co(2 * s), b = co(s), c = co(0);
      const disc = b * b - 4 * a * c;
      if (c !== 0 && disc >= 0 && Number.isInteger(Math.sqrt(disc))) return true;
    }
    return false;
  }

  // Does a one-variable polynomial have a rational root? (then it isn't fully factored)
  function hasRationalRoot(P, X) {
    if (P.some((t) => Object.keys(t.v).some((k) => k !== X))) return false;
    const co = (d) => (P.find((t) => (t.v[X] || 0) === d) || { c: 0 }).c;
    const n = Math.max(...P.map((t) => t.v[X] || 0));
    const a = co(n), c = co(0);
    if (c === 0) return false;
    const divs = (k) => { const out = []; for (let i = 1; i <= Math.abs(k); i++) if (k % i === 0) out.push(i); return out; };
    for (const p of divs(c)) for (const q of divs(a)) for (const r of [p / q, -p / q]) {
      let v = 0;
      for (const t of P) v += t.c * r ** (t.v[X] || 0);
      if (Math.abs(v) < 1e-9) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Generators
  // ---------------------------------------------------------------------------
  function gcf() {
    for (let tries = 0; tries < 200; tries++) {
      const two = chance(0.45);
      const [X, Y] = two ? pick(PAIRS) : [pickVar(), null];
      const nT = pick([2, 2, 3, 3, 3]);
      const gc = ri(2, 12) * (chance(0.15) ? -1 : 1);
      const ge = ri(0, 3), gf = Y ? ri(0, 2) : 0;
      if (ge + gf === 0 && Math.abs(gc) < 2) continue;
      const degs = WU.shuffle([0, 1, 2, 3, 4]).slice(0, nT).sort((a, b) => b - a);
      const inner = degs.map((d, i) => T(ri(1, 9) * (i === 0 ? 1 : pick([1, -1])), { [X]: d, ...(Y ? { [Y]: ri(0, 3) } : {}) }));
      if (gcdAll(inner.map((t) => t.c)) !== 1) continue;
      if (Math.min(...inner.map((t) => t.v[X] || 0)) > 0) continue;
      if (Y && Math.min(...inner.map((t) => t.v[Y] || 0)) > 0) continue;
      if (factorableQuadLike(inner, X) || hasRationalRoot(inner, X)) continue;
      const g = mono(gc, X, ge, Y, gf);
      return make('gcf', 'GCF', [{ P: g }, { P: inner }], X, {
        prompt: 'Factor out the greatest common factor.',
        key: vkey(g[0].v) + gc + '|' + inner.map((t) => t.c + vkey(t.v)).join(','), tkey: two ? '2v' : '1v',
      });
    }
  }

  function tri1(o) {
    const two = chance(0.15);
    const [X, Y] = two ? pick(PAIRS) : [pickVar(), null];
    let p, q;
    do { p = nz(-12, 12); q = chance(0.12) ? p : nz(-12, 12); } while (p + q === 0);
    const g = maybeGCF(o, X, !two);
    const factors = (g ? [{ P: g }] : []).concat([{ P: lin(1, X, p, Y) }, { P: lin(1, X, q, Y) }]);
    const inner = mul(lin(1, X, p, Y), lin(1, X, q, Y));
    return make('tri1', 'Trinomials (a = 1)', factors, X, {
      key: [p, q].sort().join(',') + (g ? '|g' + vkey(g[0].v) + g[0].c : '') + (two ? '|2' : ''),
      tkey: (g ? 'g' : '') + (p === q ? 'sq' : ''),
      work: g ? `${factoredHTML([{ P: g }, { P: inner }], X)}` : '',
    });
  }

  function dots(o) {
    const X = pickVar();
    const r = Math.random();
    if (r < 0.18) {
      // a⁴x⁴ − b⁴ → (a²x² + b²)(ax + b)(ax − b)
      let a, b;
      do { a = pick([1, 1, 1, 2, 3]); b = ri(1, 3); } while (gcd(a, b) !== 1);
      const factors = [{ P: [T(a * a, { [X]: 2 }), T(b * b)] }, { P: lin(a, X, b) }, { P: lin(a, X, -b) }];
      return make('dots', 'Difference of Squares', factors, X, {
        key: `q${a},${b}`, tkey: 'quartic',
        work: `(${polyHTML([T(a * a, { [X]: 2 }), T(b * b)], X)})(${polyHTML([T(a * a, { [X]: 2 }), T(-b * b)], X)})`,
      });
    }
    let a, b;
    do { a = pick([1, 1, 1, 2, 3, 4, 5, 6, 7]); b = ri(1, 12); } while (gcd(a, b) !== 1);
    if (r < 0.3) {
      // b² − a²x² (constant first)
      const factors = [{ P: lin(a, X, b), asc: true }, { P: lin(-a, X, b), asc: true }];
      return make('dots', 'Difference of Squares', factors, X, { asc: true, key: `r${a},${b}`, tkey: 'rev' });
    }
    const two = r < 0.45;
    const Y = two ? (X === 'y' ? 'x' : 'y') : null;
    const g = maybeGCF(o, X, !two);
    const inner = [T(a * a, { [X]: 2 }), T(-b * b, Y ? { [Y]: 2 } : {})];
    const factors = (g ? [{ P: g }] : []).concat([{ P: lin(a, X, b, Y) }, { P: lin(a, X, -b, Y) }]);
    return make('dots', 'Difference of Squares', factors, X, {
      key: `${a},${b}${two ? 'y' : ''}${g ? '|g' + g[0].c + vkey(g[0].v) : ''}`, tkey: (g ? 'g' : '') + (two ? '2v' : ''),
      work: g ? factoredHTML([{ P: g }, { P: inner }], X) : '',
    });
  }

  function tri(o) {
    const two = chance(0.1);
    const [X, Y] = two ? pick(PAIRS) : [pickVar(), null];
    let m, n, p, q;
    do {
      m = ri(1, 6); n = ri(1, 6); p = nz(-9, 9); q = nz(-9, 9);
    } while (m * n < 2 || gcd(m, p) !== 1 || gcd(n, q) !== 1 || m * q + n * p === 0);
    const g = maybeGCF(o, X, !two);
    const f1 = lin(m, X, p, Y), f2 = lin(n, X, q, Y);
    const factors = (g ? [{ P: g }] : []).concat([{ P: f1 }, { P: f2 }]);
    return make('tri', 'Trinomials (a ≠ 1)', factors, X, {
      key: [`${m},${p}`, `${n},${q}`].sort().join('|') + (g ? '|g' + g[0].c + vkey(g[0].v) : '') + (two ? '|2' : ''),
      tkey: g ? 'g' : '',
      work: g ? factoredHTML([{ P: g }, { P: mul(f1, f2) }], X) : '',
    });
  }

  function cubes(o) {
    const two = chance(0.15);
    const [X, Y] = two ? pick(PAIRS) : [pickVar(), null];
    let a, b;
    do { a = pick([1, 1, 1, 2, 3, 4, 5]); b = ri(1, 6); } while (gcd(a, b) !== 1 || (a === 1 && b === 1 && !two));
    const s = pick([1, -1]);
    const g = maybeGCF(o, X, !two);
    const yv = (e) => (Y ? { [Y]: e } : {});
    const f1 = [T(a, { [X]: 1 }), T(s * b, yv(1))];
    const f2 = [T(a * a, { [X]: 2 }), T(-s * a * b, { [X]: 1, ...yv(1) }), T(b * b, yv(2))];
    const factors = (g ? [{ P: g }] : []).concat([{ P: f1 }, { P: f2 }]);
    const cubeOf = (c, v) => (c === 1 && v ? v : `${c}${v}`);
    const ax = cubeOf(a, WU.v(X)), by = cubeOf(b, Y ? WU.v(Y) : '');
    const inner = `(${ax})<sup>3</sup> ${s > 0 ? '+' : MINUS} (${by})<sup>3</sup>`;
    return make('cubes', s > 0 ? 'Sum of Cubes' : 'Difference of Cubes', factors, X, {
      key: `${a},${s * b}${two ? 'y' : ''}${g ? '|g' + g[0].c + vkey(g[0].v) : ''}`, tkey: (s > 0 ? 'sum' : 'diff') + (g ? 'g' : ''),
      work: (g ? factoredHTML([{ P: g }, { P: expand([{ P: f1 }, { P: f2 }]) }], X) + ' → ' : '') + inner,
    });
  }

  function group(o) {
    const X = pickVar();
    const shape = Math.random();
    const [ea, eb] = shape < 0.6 ? [1, 2] : shape < 0.85 ? [1, 3] : [2, 3];
    let p, q, r, s;
    for (;;) {
      p = pick([1, 1, 1, 2, 3, 4]); q = nz(-9, 9);
      if (gcd(p, q) !== 1) continue;
      if (eb === 2 && chance(0.45)) { // second factor will be a difference of squares
        const u = pick([1, 1, 2, 3]), w = ri(1, 5);
        if (gcd(u, w) !== 1) continue;
        r = u * u; s = -w * w;
      } else if (eb === 3 && chance(0.45)) { // second factor will be a sum/difference of cubes
        const u = pick([1, 1, 2]), w = ri(1, 3);
        if (gcd(u, w) !== 1 || (u === 1 && w === 1 && chance(0.5))) continue;
        r = u ** 3; s = pick([1, -1]) * w ** 3;
      } else {
        r = ri(1, 5); s = nz(-9, 9);
        if (gcd(r, s) !== 1) continue;
      }
      break;
    }
    const A = [T(p, { [X]: ea }), T(q)];
    const B = [T(r, { [X]: eb }), T(s)];
    // break B down further where possible
    let Bf = [{ P: B }];
    if (eb === 2 && isSq(r) && isSq(-s)) {
      const u = Math.sqrt(r), w = Math.sqrt(-s);
      Bf = [{ P: lin(u, X, w) }, { P: lin(u, X, -w) }];
    } else if (eb === 3 && isCube(r) && isCube(s)) {
      const u = Math.round(Math.cbrt(r)), w = Math.round(Math.cbrt(s));
      Bf = [{ P: lin(u, X, w) }, { P: [T(u * u, { [X]: 2 }), T(-u * w, { [X]: 1 }), T(w * w)] }];
    }
    let Af = [{ P: A }];
    if (ea === 2 && isSq(p) && isSq(-q)) Af = [{ P: lin(Math.sqrt(p), X, Math.sqrt(-q)) }, { P: lin(Math.sqrt(p), X, -Math.sqrt(-q)) }];
    const g = o.gcf && chance(0.2) ? [T(ri(2, 3))] : null;
    const factors = (g ? [{ P: g }] : []).concat(Af, Bf);
    const kx = polyHTML([T(r, { [X]: eb })], X);
    const a = polyHTML(A, X);
    const grp = `${kx}(${a}) ${s < 0 ? MINUS : '+'} ${Math.abs(s)}(${a})`;
    const work = g ? `${g[0].c}[${grp}] → ${g[0].c}(${a})(${polyHTML(B, X)})` : `${grp} → (${a})(${polyHTML(B, X)})`;
    return make('group', 'Grouping', factors, X, {
      key: `${ea}${eb}|${p},${q},${r},${s}${g ? '|g' + g[0].c : ''}`, tkey: `${ea}${eb}${Bf.length > 1 ? 'f' : ''}`, work,
    });
  }

  const QF_SQ = [-1, -4, -9, -16, -25];
  const QF_OTHER = [1, 2, 3, 4, 5, 6, 7, 9, -2, -3, -5, -6, -7];
  function quartic() {
    const X = pickVar();
    if (chance(0.2)) {
      // x⁶ + bx³ + c = (x³ + p)(x³ + q), then sums/differences of cubes
      let p, q;
      do { p = pick([1, -1, 8, -8, 27, -27, 2, -3, 5]); q = pick([1, -1, 8, -8, 27, -27, 2, -3, 5]); } while (p === q || p + q === 0 || (!isCube(p) && !isCube(q)));
      const parts = [];
      for (const k of [p, q]) {
        if (isCube(k)) {
          const w = Math.sign(k) * Math.round(Math.cbrt(Math.abs(k)));
          parts.push({ P: lin(1, X, w) }, { P: [T(1, { [X]: 2 }), T(-w, { [X]: 1 }), T(w * w)] });
        } else parts.push({ P: [T(1, { [X]: 3 }), T(k)] });
      }
      return make('quartic', 'Quadratic Form', parts, X, {
        key: `6|${[p, q].sort().join(',')}`, tkey: 'deg6',
        work: `(${polyHTML([T(1, { [X]: 3 }), T(p)], X)})(${polyHTML([T(1, { [X]: 3 }), T(q)], X)})`,
      });
    }
    let m, n, p, q;
    do {
      const lead = chance(0.75);
      m = lead ? 1 : pick([4, 9, 2, 3]); n = 1;
      p = chance(0.55) ? pick(QF_SQ) : pick(QF_OTHER);
      q = chance(0.55) ? pick(QF_SQ) : pick(QF_OTHER);
    } while ((m === n && p === q) || m * q + n * p === 0 || gcd(m, p) !== 1);
    const parts = [];
    for (const [c, k] of [[m, p], [n, q]]) {
      if (isSq(c) && isSq(-k)) {
        const u = Math.sqrt(c), w = Math.sqrt(-k);
        parts.push({ P: lin(u, X, w) }, { P: lin(u, X, -w) });
      } else parts.push({ P: [T(c, { [X]: 2 }), T(k)] });
    }
    return make('quartic', 'Quadratic Form', parts, X, {
      key: `4|${m},${p}|${n},${q}`, tkey: m > 1 ? 'a' : '',
      work: `(${polyHTML([T(m, { [X]: 2 }), T(p)], X)})(${polyHTML([T(n, { [X]: 2 }), T(q)], X)})`,
    });
  }

  const GEN = { gcf, tri1, dots, tri, cubes, group, quartic };
  WU.Factoring = {
    generate: (type, opts) => GEN[type](opts || {}),
    TYPES: [
      { id: 'gcf', name: 'Greatest common factor', desc: '6x³ − 9x² + 12x → 3x(2x² − 3x + 4)' },
      { id: 'tri1', name: 'Trinomials with a = 1', desc: 'x² + 7x + 12 → (x + 3)(x + 4)' },
      { id: 'dots', name: 'Difference of two squares', desc: '9x² − 25 → (3x + 5)(3x − 5), and x⁴ − 16' },
      { id: 'tri', name: 'Trinomials with a ≠ 1', desc: '6x² + 7x − 3 → (2x + 3)(3x − 1)' },
      { id: 'cubes', name: 'Sum & difference of cubes', desc: '8x³ − 27 → (2x − 3)(4x² + 6x + 9)' },
      { id: 'group', name: 'Grouping (degree 3 or higher)', desc: 'x³ + 3x² − 4x − 12 → (x + 3)(x + 2)(x − 2)' },
      { id: 'quartic', name: 'Quadratic form (quartics)', desc: 'x⁴ − 13x² + 36 → (x + 2)(x − 2)(x + 3)(x − 3)' },
    ],
    _same: same, _expand: expand,
  };
})(window.WU);
