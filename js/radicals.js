/* Simplifying Radical Expressions — problem generators.
 *
 * Types
 *   numeric   Square roots of numbers            √72 → 6√2
 *   coef      With a coefficient                 3√48 → 12√3
 *   vars      Monomials with variables           √(50x³y⁴) → 5xy²√(2x)
 *   cube      Cube roots                         ∛54 → 3∛2
 *   ratMono   Rationalize (monomial denominator) 6/√3 → 2√3
 *   ratConj   Rationalize with a conjugate       4/(3 − √5) → 3 + √5
 *   imag      Imaginary numbers                  √−48 → 4i√3
 *   ops       Add, subtract & multiply radicals  √50 + √18 → 8√2
 */
window.WU = window.WU || {};
(function (WU) {
  'use strict';
  const { ri, pick, chance, frac, MINUS } = WU;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const I = '<i class="mv">i</i>';

  // n = out^idx · inn, with inn free of idx-th powers
  function extract(n, idx) {
    let out = 1, inn = Math.abs(n);
    for (let f = 2; f ** idx <= inn; f++) while (inn % f ** idx === 0) { inn /= f ** idx; out *= f; }
    return { out, inn };
  }
  const root = (inner, idx) =>
    `<span class="rad">${idx && idx !== 2 ? `<span class="rx">${idx}</span>` : ''}<span class="rs">√</span><span class="ri">${inner}</span></span>`;
  const varsHTML = (v) => Object.keys(v).filter((k) => v[k]).sort().map((k) => WU.v(k) + (v[k] > 1 ? `<sup>${v[k]}</sup>` : '')).join('');
  const hasVars = (v) => Object.keys(v).some((k) => v[k]);

  // coefficient c, coefficient variables cv, imaginary flag, then root(radicand r · rv)
  function radTerm({ c = 1, cv = {}, i = false, r = 1, rv = {}, idx = 2 }) {
    const rStr = r < 0 ? MINUS + -r : String(r);
    const rootPart = r !== 1 || hasVars(rv) ? root((r !== 1 || !hasVars(rv) ? rStr : '') + varsHTML(rv), idx) : '';
    const vars = varsHTML(cv) + (i ? I : '');
    const a = Math.abs(c);
    let num = a === 1 && (vars || rootPart) ? '' : String(a);
    const gap = idx && idx !== 2 && rootPart && (num || vars) ? '\u2009' : ''; // keep the root's index clear of exponents
    return (c < 0 ? MINUS : '') + num + vars + gap + rootPart;
  }
  // (num/den)·√r with r already simplified
  function ratRad(num, den, r, opts = {}) {
    const g = gcd(num, den) || 1;
    num /= g; den /= g;
    if (den < 0) { num = -num; den = -den; }
    const top = radTerm({ c: num, r, i: opts.i, idx: opts.idx });
    if (den === 1) return top;
    const neg = top.startsWith(MINUS);
    return (neg ? MINUS : '') + frac(neg ? top.slice(1) : top, den);
  }
  // p + q√r   (radFirst: write the radical term first)
  function linRad(p, q, r, radFirst) {
    const rt = (c, lead) => {
      const body = radTerm({ c: Math.abs(c), r });
      return lead ? (c < 0 ? MINUS : '') + body : (c < 0 ? ` ${MINUS} ` : ' + ') + body;
    };
    const ct = (c, lead) => (lead ? (c < 0 ? MINUS : '') + Math.abs(c) : (c < 0 ? ` ${MINUS} ` : ' + ') + Math.abs(c));
    if (p === 0) return rt(q, true);
    if (q === 0) return (p < 0 ? MINUS : '') + Math.abs(p);
    if (p < 0 && q > 0) radFirst = true;        // lead with the positive term
    else if (q < 0 && p > 0) radFirst = false;
    return radFirst ? rt(q, true) + ct(p, false) : ct(p, true) + rt(q, false);
  }

  const SF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30];
  const SF_SMALL = [2, 3, 5, 6, 7, 10, 11];
  const SIMPLIFY = 'Simplify.';
  const POS = 'Simplify. Assume all variables are positive.';
  const line = (h) => `<div class="mx-line">${h}</div>`;
  const LABELS = {
    numeric: 'Square Roots', coef: 'With a Coefficient', vars: 'Variables', cube: 'Cube Roots',
    ratMono: 'Rationalize', ratConj: 'Conjugates', imag: 'Imaginary Numbers', ops: 'Operations',
  };
  function make(type, expr, answer, { prompt, key, tkey, work, alts } = {}) {
    return {
      topic: 'rad', level: type, label: 'Radicals · ' + LABELS[type],
      text: (prompt || SIMPLIFY) + line(expr), prompt: '',
      answer, alts: alts || [], work: work || '',
      key: 'R|' + type + '|' + key, tkey: 'R|' + type + '|' + (tkey || ''),
    };
  }

  // ---------------------------------------------------------------------------
  function numeric() {
    let s, m, n;
    const cap = chance(0.7) ? 600 : 1500;
    do { s = ri(2, 15); m = pick(SF); n = s * s * m; } while (n > cap);
    return make('numeric', root(n), radTerm({ c: s, r: m }), {
      key: n, work: `${root(n)} = ${root(s * s)} · ${root(m)} = ${radTerm({ c: s, r: m })}`,
    });
  }

  function coef() {
    let s, m, n;
    do { s = ri(2, 8); m = pick(SF); n = s * s * m; } while (n > 400);
    const k = pick([2, 3, 4, 5, 6, -2, -3, -4, 7]);
    if (chance(0.3)) {
      // (k√n)/d where d divides k·s
      const kk = Math.abs(k) * s;
      const ds = [2, 3, 4, 5, 6, 8, 9, 10, 12].filter((d) => kk % d === 0 && d !== kk);
      if (ds.length) {
        const d = pick(ds);
        return make('coef', frac(radTerm({ c: Math.abs(k), r: n }), d), radTerm({ c: kk / d, r: m }), {
          key: `f${Math.abs(k)},${n},${d}`, tkey: 'frac',
          work: `${frac(radTerm({ c: kk, r: m }), d)} = ${radTerm({ c: kk / d, r: m })}`,
        });
      }
    }
    return make('coef', radTerm({ c: k, r: n }), radTerm({ c: k * s, r: m }), {
      key: `${k},${n}`, work: `${radTerm({ c: k, r: n })} = ${k < 0 ? MINUS : ''}${Math.abs(k)} · ${s}${root(m)}`,
    });
  }

  function vars(o) {
    for (;;) {
      const s = ri(1, 6), m = pick([1, 1].concat(SF_SMALL));
      const r = s * s * m;
      const [X, Y] = pick([['x', 'y'], ['x', 'y'], ['a', 'b'], ['m', 'n']]);
      const ex = ri(1, 9), ey = chance(0.45) ? ri(0, 8) : 0;
      if (s === 1 && ex < 2 && ey < 2) continue;
      if (r === 1 && ex < 2 && ey < 2) continue;
      const k = chance(0.35) ? pick([2, 3, 4, 5, -2]) : 1;
      const rv = { [X]: ex, [Y]: ey };
      const expr = radTerm({ c: k, r, rv });
      const ans = radTerm({ c: k * s, cv: { [X]: Math.floor(ex / 2), [Y]: Math.floor(ey / 2) }, r: m, rv: { [X]: ex % 2, [Y]: ey % 2 } });
      return make('vars', expr, ans, { prompt: POS, key: `${k},${r},${ex},${ey}`, tkey: k !== 1 ? 'k' : '' });
    }
  }

  function cube() {
    const CF = [2, 3, 4, 5, 6, 7, 9, 10, 12];
    const s = ri(2, 5), m = pick(CF), sign = chance(0.2) ? -1 : 1;
    const n = sign * s ** 3 * m;
    const withVar = chance(0.45);
    const ex = withVar ? ri(2, 11) : 0;
    const k = chance(0.25) ? pick([2, 3, -2]) : 1;
    const expr = radTerm({ c: k, r: n, rv: { x: ex }, idx: 3 });
    const ans = radTerm({ c: k * sign * s, cv: { x: Math.floor(ex / 3) }, r: m, rv: { x: ex % 3 }, idx: 3 });
    return make('cube', expr, ans, { prompt: withVar ? POS : SIMPLIFY, key: `${k},${n},${ex}`, tkey: withVar ? 'v' : '' });
  }

  function ratMono() {
    const form = pick(['a/rb', 'a/rb', 'r(a/b)', 'a/(crb)', 'ra/rb', 'cube']);
    if (form === 'cube') {
      // a / ∛b  →  a∛(b²)/b
      const b = pick([2, 3, 4, 5, 9]), a = ri(1, 12);
      const { out, inn } = extract(b * b, 3);
      const g = gcd(a * out, b);
      const num = (a * out) / g, den = b / g;
      const top = radTerm({ c: num, r: inn, idx: 3 });
      return make('ratMono', frac(a, root(b, 3)), den === 1 ? top : frac(top, den), {
        prompt: 'Simplify. Rationalize the denominator.', key: `c${a},${b}`, tkey: 'cube',
      });
    }
    let a, b, c = 1, expr;
    for (;;) {
      a = ri(1, 15); b = pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 15, 18, 20]); c = form === 'a/(crb)' ? ri(2, 5) : 1;
      if (form === 'r(a/b)' || form === 'ra/rb') { a = pick([1, 2, 3, 5, 6, 7, 10]); if (gcd(a, b) !== 1 || a === b) continue; }
      break;
    }
    // value = coefficient·√b / (c·b), where coefficient is a (or √a folded into radicand)
    let num, rr, den;
    if (form === 'r(a/b)' || form === 'ra/rb') {
      const { out, inn } = extract(a * b, 2);
      num = out; rr = inn; den = b;
      expr = form === 'r(a/b)' ? root(frac(a, b)) : frac(root(a), root(b));
    } else {
      const { out, inn } = extract(b, 2);
      num = a * out; rr = inn; den = c * b;
      expr = frac(a, radTerm({ c, r: b }));
    }
    return make('ratMono', expr, ratRad(num, den, rr), {
      prompt: 'Simplify. Rationalize the denominator.', key: `${form}|${a},${b},${c}`, tkey: form,
    });
  }

  function ratConj() {
    const form = pick(['a/(b±rc)', 'a/(b±rc)', 'a/(rc±b)', '(b+rc)/(b-rc)', 'a/(rc±rd)']);
    for (;;) {
      const c = pick(SF_SMALL), b = ri(1, 6), a = ri(1, 12), s = pick([1, -1]);
      if (form === 'a/(rc±rd)') {
        const d = pick(SF_SMALL);
        if (d === c) continue;
        const D = c - s * s * d; // (√c + s√d)(√c − s√d) = c − d
        const g = gcd(a, D);
        let A = a / g, DD = D / g;
        if (DD < 0) { A = -A; DD = -DD; }
        // numerator A√c − sA√d, written with a positive term first (or a minus in front of everything)
        let t = [[A, c], [-s * A, d]];
        const allNeg = t.every((x) => x[0] < 0);
        if (allNeg) t = t.map(([k, r]) => [-k, r]);
        else if (t[0][0] < 0) t.reverse();
        const numHTML = `${radTerm({ c: t[0][0], r: t[0][1] })} ${t[1][0] < 0 ? MINUS : '+'} ${radTerm({ c: Math.abs(t[1][0]), r: t[1][1] })}`;
        const expr = frac(a, `${root(c)} ${s > 0 ? '+' : MINUS} ${root(d)}`);
        const body = DD === 1 ? (allNeg ? `${MINUS}(${numHTML})` : numHTML) : (allNeg ? MINUS : '') + frac(numHTML, DD);
        return make('ratConj', expr, body, {
          prompt: 'Simplify. Rationalize the denominator.', key: `rr${a},${c},${d},${s}`, tkey: 'rr',
        });
      }
      const D = b * b - c;
      if (D === 0) continue;
      if (form === '(b+rc)/(b-rc)') {
        // (b + √c)² / (b² − c) = (b² + c + 2b√c) / (b² − c)
        let p = b * b + c, q = 2 * b, DD = D;
        const g = gcd(gcd(p, q), DD);
        p /= g; q /= g; DD /= g;
        if (DD < 0) { p = -p; q = -q; DD = -DD; }
        const expr = frac(linRad(b, 1, c), linRad(b, -1, c));
        const numHTML = linRad(p, q, c);
        return make('ratConj', expr, DD === 1 ? numHTML : frac(numHTML, DD), {
          prompt: 'Simplify. Rationalize the denominator.', key: `q${b},${c}`, tkey: 'quot',
        });
      }
      const radFirst = form === 'a/(rc±b)';
      // a/(b + s√c) = a(b − s√c)/(b² − c);   a/(√c + s·b) = a(√c − s·b)/(c − b²)
      let A, DD, p, q;
      if (!radFirst) { const g = gcd(a, D); A = a / g; DD = D / g; } else { const g = gcd(a, -D); A = a / g; DD = -D / g; }
      if (DD < 0) { A = -A; DD = -DD; }
      if (!radFirst) { p = A * b; q = -s * A; } else { p = -s * A * b; q = A; }
      const expr = frac(a, radFirst ? `${root(c)} ${s > 0 ? '+' : MINUS} ${b}` : linRad(b, s, c));
      // both terms negative → put the minus sign in front of the whole answer
      const allNeg = p <= 0 && q <= 0;
      const numHTML = allNeg ? linRad(-p, -q, c, radFirst) : linRad(p, q, c, radFirst);
      const An = (A < 0 ? MINUS : '') + Math.abs(A);
      const factored = radFirst ? `${An}(${root(c)} ${s > 0 ? MINUS : '+'} ${b})` : `${An}(${linRad(b, -s, c)})`;
      const body = DD === 1 ? (allNeg ? `${MINUS}(${numHTML})` : numHTML) : (allNeg ? MINUS : '') + frac(numHTML, DD);
      return make('ratConj', expr, body, {
        prompt: 'Simplify. Rationalize the denominator.', key: `${radFirst ? 'r' : 'b'}${a},${b},${c},${s}`, tkey: radFirst ? 'rf' : 'bf',
        alts: DD === 1 || Math.abs(A) === 1 || A < 0 ? [] : [frac(factored, DD)],
      });
    }
  }

  function imag() {
    const form = pick(['root', 'root', 'coef', 'neg', 'prod', 'quot', 'pow', 'sum']);
    const IN = 'Simplify. Write your answer in terms of ' + I + '.';
    if (form === 'pow') {
      const n = ri(5, 99);
      const ans = ['1', I, MINUS + '1', MINUS + I][n % 4];
      return make('imag', `${I}<sup>${n}</sup>`, ans, { prompt: SIMPLIFY, key: `pow${n}`, tkey: 'pow', work: `${n} ÷ 4 has remainder ${n % 4}` });
    }
    if (form === 'prod') {
      // √−a · √−b = i√a · i√b = −√(ab)
      const a = pick([2, 3, 5, 6, 8, 10, 12, 15]), b = pick([2, 3, 5, 6, 10, 12, 15, 18, 20]);
      const { out, inn } = extract(a * b, 2);
      return make('imag', `${root(MINUS + a)} · ${root(MINUS + b)}`, radTerm({ c: -out, r: inn }), {
        prompt: SIMPLIFY, key: `prod${a},${b}`, tkey: 'prod',
        work: `${radTerm({ i: true, r: a })} · ${radTerm({ i: true, r: b })} = ${I}<sup>2</sup>${root(a * b)}`,
      });
    }
    if (form === 'quot') {
      // a / √−b = a / (i√b) = −a·i√b / b
      const a = ri(2, 12), b = pick([2, 3, 5, 6, 7, 10]);
      const g = gcd(a, b);
      const num = -a / g, den = b / g;
      return make('imag', frac(a, root(MINUS + b)), ratRad(num, den, b, { i: true }), {
        prompt: IN, key: `quot${a},${b}`, tkey: 'quot',
      });
    }
    if (form === 'sum') {
      const m = pick([2, 3, 5]);
      const s1 = ri(2, 6), s2 = ri(1, 5), sg = pick([1, -1]);
      if (s1 === s2 && sg < 0) return imag();
      const tot = s1 + sg * s2;
      return make('imag', `${root(MINUS + s1 * s1 * m)} ${sg > 0 ? '+' : MINUS} ${root(MINUS + s2 * s2 * m)}`, radTerm({ c: tot, i: true, r: m }), {
        prompt: IN, key: `sum${m},${s1},${s2},${sg}`, tkey: 'sum',
      });
    }
    const square = chance(0.25);
    const s = ri(2, 10), m = square ? 1 : pick(SF_SMALL);
    const n = s * s * m;
    const k = form === 'coef' ? pick([2, 3, 4, 5, -2]) : form === 'neg' ? -1 : 1;
    const expr = (k === -1 ? MINUS : k !== 1 ? (k < 0 ? MINUS : '') + Math.abs(k) : '') + root(MINUS + n);
    return make('imag', expr, radTerm({ c: k * s, i: true, r: m }), {
      prompt: IN, key: `${form}${k},${n}`, tkey: form,
    });
  }

  function ops() {
    const form = pick(['add', 'add', 'mul', 'dist', 'binom']);
    if (form === 'add') {
      for (;;) {
        const m = pick([2, 3, 5, 6, 7]);
        const n = pick([2, 3, 3]);
        const terms = [];
        let tot = 0, h = '';
        for (let j = 0; j < n; j++) {
          const s = ri(1, 5), c = j === 0 ? pick([1, 1, 2, 3]) : pick([1, 1, 2, 3, -1, -2]);
          terms.push([c, s * s * m]);
          tot += c * s;
          h += (j === 0 ? (c < 0 ? MINUS : '') : c < 0 ? ` ${MINUS} ` : ' + ') + radTerm({ c: Math.abs(c), r: s * s * m });
        }
        if (tot === 0 || terms.every((t) => t[1] === m)) continue;
        return make('ops', h, radTerm({ c: tot, r: m }), { key: 'add' + terms.join(';'), tkey: 'add' });
      }
    }
    if (form === 'mul') {
      const k1 = pick([1, 2, 3, 4]), k2 = pick([1, 2, 3, 5]);
      const a = pick([2, 3, 5, 6, 10, 12]), b = pick([2, 3, 6, 8, 10, 15, 18]);
      const { out, inn } = extract(a * b, 2);
      return make('ops', `${radTerm({ c: k1, r: a })} · ${radTerm({ c: k2, r: b })}`, radTerm({ c: k1 * k2 * out, r: inn }), {
        key: `mul${k1},${a},${k2},${b}`, tkey: 'mul',
        work: `${k1 * k2}${root(a * b)}`,
      });
    }
    if (form === 'dist') {
      // √a(√b + c) = √(ab) + c√a
      const a = pick([2, 3, 5, 6]), b = pick([2, 3, 6, 8, 10, 12, 15]), c = pick([1, 2, 3, 4, -2, -5]);
      const { out, inn } = extract(a * b, 2);
      const ans = inn === a
        ? (out + c === 0 ? '0' : radTerm({ c: out + c, r: a }))
        : `${radTerm({ c: out, r: inn })} ${c < 0 ? MINUS : '+'} ${radTerm({ c: Math.abs(c), r: a })}`;
      return make('ops', `${root(a)}(${root(b)} ${c < 0 ? MINUS : '+'} ${Math.abs(c)})`, ans, { key: `dist${a},${b},${c}`, tkey: 'dist' });
    }
    // (p + q√m)(p − q√m) = p² − q²m   or   (p + q√m)² = p² + q²m + 2pq√m
    const p = ri(1, 6), q = pick([1, 1, 2, 3]), m = pick([2, 3, 5, 6, 7]);
    if (chance(0.5)) {
      return make('ops', `(${linRad(p, q, m)})(${linRad(p, -q, m)})`, (p * p - q * q * m < 0 ? MINUS : '') + Math.abs(p * p - q * q * m), { key: `conj${p},${q},${m}`, tkey: 'conj' });
    }
    const s = pick([1, -1]);
    return make('ops', `(${linRad(p, s * q, m)})<sup>2</sup>`, linRad(p * p + q * q * m, 2 * p * s * q, m), { key: `sq${p},${s * q},${m}`, tkey: 'sq' });
  }

  const GEN = { numeric, coef, vars, cube, ratMono, ratConj, imag, ops };
  WU.Radicals = {
    generate: (type, opts) => GEN[type](opts || {}),
    TYPES: [
      { id: 'numeric', name: 'Square roots of numbers', desc: '√72 → 6√2' },
      { id: 'coef', name: 'With a coefficient', desc: '3√48 → 12√3, and fractions like 4√18 ÷ 6 → 2√2' },
      { id: 'vars', name: 'Monomials with variables', desc: '√(50x³y⁴) → 5xy²√(2x)' },
      { id: 'cube', name: 'Cube roots', desc: '∛54 → 3∛2,  ∛(16x⁵) → 2x∛(2x²)' },
      { id: 'ratMono', name: 'Rationalize the denominator', desc: '6/√3 → 2√3,  √(5/8) → √10/4' },
      { id: 'ratConj', name: 'Rationalize with a conjugate', desc: '4/(3 − √5) → 3 + √5' },
      { id: 'imag', name: 'Imaginary numbers', desc: '√−48 → 4i√3,  √−6 · √−10 → −2√15,  i²³ → −i' },
      { id: 'ops', name: 'Add, subtract & multiply radicals', desc: '√50 + √18 → 8√2,  2√3 · 5√6 → 30√2' },
    ],
    _extract: extract,
  };
})(window.WU);
