/* Pythagorean Theorem — problem generators.
 *
 * Types
 *   whole     Whole-number answers (Pythagorean triples)
 *   radAns    Answers in simplest radical form
 *   radGiven  Radicals in the given information
 *   algLin    Sides written as expressions; equation becomes linear
 *   algQuad   Sides written as expressions; equation is quadratic
 *   word      Real-world word problems
 */
window.WU = window.WU || {};
(function (WU) {
  'use strict';
  const { ri, pick, chance, word, v, sq, poly, simplifyRoot, isSquare, radHTML, sqrtHTML, approx, MINUS } = WU;

  const BASE = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53],
    [11, 60, 61], [33, 56, 65], [16, 63, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89], [65, 72, 97]];
  function triplesUpTo(maxC) {
    const out = [];
    for (const [a, b, c] of BASE) for (let m = 1; c * m <= maxC; m++) out.push([a * m, b * m, c * m]);
    return out;
  }
  const T65 = triplesUpTo(65);
  const T100 = triplesUpTo(100);
  const T300 = triplesUpTo(300);

  const X = v('x');
  const sup2 = (s) => `${s}<sup>2</sup>`;

  // ---------- linear side expressions {k, d} meaning k·x + d ----------
  const lin = (k, d) => poly([[k, X], [d, '']]);
  function sqSide(s) {
    if (s.k === 0) return sup2(String(s.d));
    if (s.k === 1 && s.d === 0) return sup2(X);
    return sup2(`(${lin(s.k, s.d)})`);
  }
  const val = (s, x) => s.k * x + s.d;
  // Coefficients of leg1² + leg2² − hyp² = 0
  function quadOf(l1, l2, h) {
    const A = l1.k ** 2 + l2.k ** 2 - h.k ** 2;
    const B = 2 * (l1.k * l1.d + l2.k * l2.d - h.k * h.d);
    const C = l1.d ** 2 + l2.d ** 2 - h.d ** 2;
    return [A, B, C];
  }
  function validRoots(l1, l2, h) {
    const [A, B, C] = quadOf(l1, l2, h);
    let roots;
    if (A === 0) roots = B === 0 ? [] : [-C / B];
    else {
      const D = B * B - 4 * A * C;
      if (D < 0) return [];
      roots = [(-B + Math.sqrt(D)) / (2 * A), (-B - Math.sqrt(D)) / (2 * A)];
    }
    return roots.filter((x) => x > 1e-9 && [l1, l2, h].every((s) => val(s, x) > 1e-9));
  }
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  function workFor(l1, l2, h, x) {
    // expanded sides: left = l1² + l2², right = h²
    const ex = (s) => [s.k * s.k, 2 * s.k * s.d, s.d * s.d];
    const e1 = ex(l1), e2 = ex(l2), e3 = ex(h);
    const L = [e1[0] + e2[0], e1[1] + e2[1], e1[2] + e2[2]];
    const steps = [`${sqSide(l1)} + ${sqSide(l2)} = ${sqSide(h)}`,
      `${poly([[L[0], sup2(X)], [L[1], X], [L[2], '']])} = ${poly([[e3[0], sup2(X)], [e3[1], X], [e3[2], '']])}`];
    let [A, B, C] = quadOf(l1, l2, h);
    if (A === 0) {
      // x² cancels: (L1 − R1)x + (L2 − R2) = 0  →  constant = coefficient·x
      steps.push(`${e3[2] - L[2] === 0 ? 0 : L[2] - e3[2]} = ${poly([[e3[1] - L[1], X]])}`);
    } else {
      if (A < 0) { A = -A; B = -B; C = -C; }
      const g = [A, B, C].filter((n) => n !== 0).reduce((p, n) => gcd(p, n));
      A /= g; B /= g; C /= g;
      steps.push(`${poly([[A, sup2(X)], [B, X], [C, '']])} = 0`);
      if (A === 1) {
        const r2 = -B - x; // other root (sum of roots = −B)
        if (r2 === 0) steps.push(`${X}(${poly([[1, X], [-x, '']])}) = 0`);
        else if (Number.isInteger(r2)) steps.push(`(${poly([[1, X], [-x, '']])})(${poly([[1, X], [-r2, '']])}) = 0`);
      }
    }
    steps.push(`${X} = ${x}`);
    return steps.join(' &nbsp;→&nbsp; ');
  }

  // ---------- build algebraic candidate lists once ----------
  const LIN = [];
  const QUAD = [];
  (function build() {
    const seen = new Set();
    const add = (list, c) => {
      const roots = validRoots(c.l1, c.l2, c.h);
      if (roots.length !== 1 || Math.abs(roots[0] - c.x) > 1e-9) return;
      const key = JSON.stringify([c.l1, c.l2, c.h]);
      if (seen.has(key)) return;
      seen.add(key);
      list.push(c);
    };
    for (const [p, q, c] of triplesUpTo(100)) {
      // one leg known, hypotenuse = other leg + d  (x² cancels → linear)
      for (const [known, unk] of [[p, q], [q, p]]) {
        const d = c - unk;
        if (d >= 1 && d <= 9) add(LIN, { kind: 'hypPlus', l1: { k: 0, d: known }, l2: { k: 1, d: 0 }, h: { k: 1, d }, x: unk, sides: [known, unk, c] });
      }
    }
    for (const [p, q, c] of triplesUpTo(65)) {
      const d = q - p;
      if (d >= 1 && d <= 12 && c <= 53) add(QUAD, { kind: 'legsDiff', l1: { k: 1, d: 0 }, l2: { k: 1, d }, h: { k: 0, d: c }, x: p, sides: [p, q, c] });
      for (const k of [2, 3]) {
        const dd = q - k * p;
        if (dd !== 0 && Math.abs(dd) <= 8) add(QUAD, { kind: 'legMult', l1: { k: 1, d: 0 }, l2: { k, d: dd }, h: { k: 0, d: c }, x: p, sides: [p, q, c] });
      }
      const hd = c - 2 * p;
      if (hd !== 0 && Math.abs(hd) <= 8) add(QUAD, { kind: 'hypMult', l1: { k: 0, d: q }, l2: { k: 1, d: 0 }, h: { k: 2, d: hd }, x: p, sides: [q, p, c] });
      const e = c - p;
      if (d >= 1 && e <= 12 && c <= 45) add(QUAD, { kind: 'three', l1: { k: 1, d: 0 }, l2: { k: 1, d }, h: { k: 1, d: e }, x: p, sides: [p, q, c] });
    }
  })();

  // ---------- helpers ----------
  const orient = () => ri(0, 3);
  const tri = (a, b, la, lb, lc) => ({ kind: 'tri', a, b, la, lb, lc, orient: orient() });
  const units = () => pick([['', ''], ['', ''], [' cm', ' cm'], [' in.', ' inches'], [' ft', ' feet'], [' m', ' meters']]);

  function finish(p, type, label) {
    p.topic = 'pyth';
    p.level = type;
    p.label = 'Pythagorean Theorem · ' + label;
    p.alts = p.alts || [];
    return p;
  }

  // ---------------------------------------------------------------------------
  // Whole-number answers
  // ---------------------------------------------------------------------------
  function whole(opts) {
    const [p, q, c] = chance(0.8) ? pick(T65) : pick(T100);
    const [a, b] = chance(0.5) ? [p, q] : [q, p];
    const findHyp = chance(0.5);
    const [us, ul] = units();
    let text, diagram = null;
    if (opts.diagrams) {
      diagram = findHyp ? tri(a, b, a + us, b + us, X) : tri(a, b, a + us, X, c + us);
      text = `Find the value of ${X}.`;
    } else if (findHyp) {
      text = `A right triangle has legs of length ${a}${ul} and ${b}${ul}. Find the length of the hypotenuse.`;
    } else {
      text = `A right triangle has a hypotenuse of length ${c}${ul} and one leg of length ${a}${ul}. Find the length of the other leg.`;
    }
    const work = findHyp ? `${sup2(a)} + ${sup2(b)} = ${sup2(X)} → ${X}<sup>2</sup> = ${a * a + b * b}` : `${sup2(a)} + ${sup2(X)} = ${sup2(c)} → ${X}<sup>2</sup> = ${c * c - a * a}`;
    return finish({
      text, prompt: '', diagram,
      answer: `${findHyp ? c : b}${ul}`, work,
      key: `P|whole|${a},${b},${c}|${findHyp}`, tkey: `P|whole|${findHyp}`,
    }, 'whole', 'Whole-Number Answers');
  }

  // ---------------------------------------------------------------------------
  // Radical answers
  // ---------------------------------------------------------------------------
  function radAns(opts) {
    const findHyp = chance(0.5);
    const wantSimplify = chance(0.7);
    let a, b, c, n;
    for (let tries = 0; tries < 200; tries++) {
      if (findHyp) { a = ri(1, 12); b = ri(1, 12); n = a * a + b * b; }
      else { c = ri(3, 15); a = ri(1, c - 1); n = c * c - a * a; }
      if (isSquare(n)) continue;
      if (wantSimplify === (simplifyRoot(n).k > 1)) break;
    }
    let text, diagram = null;
    if (findHyp) {
      if (opts.diagrams) { diagram = tri(a, b, a, b, X); text = `Find the value of ${X}.`; }
      else text = `A right triangle has legs of length ${a} and ${b}. Find the length of the hypotenuse.`;
    } else {
      b = Math.sqrt(n);
      if (opts.diagrams) { diagram = tri(a, b, a, X, c); text = `Find the value of ${X}.`; }
      else text = `A right triangle has a hypotenuse of length ${c} and a leg of length ${a}. Find the length of the other leg.`;
    }
    const work = findHyp ? `${sup2(a)} + ${sup2(b)} = ${sup2(X)} → ${X} = ${WU.rad(n)}` : `${sup2(a)} + ${sup2(X)} = ${sup2(c)} → ${X} = ${WU.rad(n)}`;
    return finish({
      text, prompt: 'Give your answer in simplest radical form.', diagram,
      answer: sqrtHTML(n), alts: [`≈ ${approx(Math.sqrt(n))}`], work,
      key: `P|radAns|${findHyp ? a + ',' + b : c + ',' + a}|${findHyp}`, tkey: `P|radAns|${findHyp}`,
    }, 'radAns', 'Radical Answers');
  }

  // ---------------------------------------------------------------------------
  // Radicals in the given information
  // ---------------------------------------------------------------------------
  const SQF = [2, 3, 5, 6, 7, 10, 11];
  const SQF_WIDE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
  function radGiven(opts) {
    const mode = pick(['twoRoots', 'kRootInt', 'hypKRoot', 'iso', 'hypRoots', 'twoKRoots']);
    let s1, s2, s3, n, findHyp = true, g1, g2; // sq-values; display strings g1, g2
    for (let tries = 0; tries < 200; tries++) {
      if (mode === 'twoRoots') {
        const p = pick(SQF_WIDE), q = pick(SQF_WIDE);
        if (p === q) continue;
        s1 = p; s2 = q; n = p + q; g1 = radHTML(1, p); g2 = radHTML(1, q);
      } else if (mode === 'kRootInt') {
        const k = ri(1, 5), m = pick(SQF), j = ri(1, 9);
        s1 = k * k * m; s2 = j * j; n = s1 + s2; g1 = radHTML(k, m); g2 = String(j);
      } else if (mode === 'hypKRoot') {
        const k = ri(2, 6), m = pick(SQF), j = ri(1, 12);
        s3 = k * k * m; s1 = j * j; n = s3 - s1; findHyp = false;
        if (n <= 0) continue;
        g1 = radHTML(k, m); g2 = String(j);
      } else if (mode === 'iso') {
        const k = ri(1, 9), m = pick([2, 2, 2, 3, 5]);
        s1 = s2 = k * k * m; n = 2 * s1; g1 = g2 = radHTML(k, m);
      } else if (mode === 'hypRoots') {
        const p = pick(SQF_WIDE.concat([26, 29, 30, 31, 33, 34, 35])), q = pick(SQF_WIDE);
        if (q >= p) continue;
        s3 = p; s1 = q; n = p - q; findHyp = false; g1 = radHTML(1, p); g2 = radHTML(1, q);
      } else {
        const k1 = ri(2, 4), m1 = pick(SQF), k2 = ri(1, 4), m2 = pick(SQF);
        if (m1 === m2 && k1 === k2) continue;
        s1 = k1 * k1 * m1; s2 = k2 * k2 * m2; n = s1 + s2; g1 = radHTML(k1, m1); g2 = radHTML(k2, m2);
      }
      break;
    }
    let text, diagram = null;
    const shapeA = Math.sqrt(findHyp ? s1 : s1);
    if (findHyp) {
      const shapeB = Math.sqrt(s2);
      if (opts.diagrams) { diagram = tri(shapeA, shapeB, g1, g2, X); text = `Find the value of ${X}.`; }
      else if (mode === 'iso') text = `An isosceles right triangle has legs that are each ${g1} units long. Find the length of the hypotenuse.`;
      else text = `A right triangle has legs of length ${g1} and ${g2}. Find the length of the hypotenuse.`;
    } else {
      const shapeB = Math.sqrt(n);
      if (opts.diagrams) { diagram = tri(shapeA, shapeB, g2, X, g1); text = `Find the value of ${X}.`; }
      else text = `A right triangle has a hypotenuse of length ${g1} and one leg of length ${g2}. Find the length of the other leg.`;
    }
    const work = findHyp ? `(${g1})<sup>2</sup> + (${g2})<sup>2</sup> = ${sup2(X)} → ${s1} + ${s2} = ${sup2(X)}`
      : `(${g2})<sup>2</sup> + ${sup2(X)} = (${g1})<sup>2</sup> → ${s1} + ${sup2(X)} = ${s3}`;
    return finish({
      text, prompt: 'Give your answer in simplest form.', diagram,
      answer: sqrtHTML(n), alts: isSquare(n) ? [] : [`≈ ${approx(Math.sqrt(n))}`], work,
      key: `P|radGiven|${mode}|${s1},${s2},${s3}`, tkey: `P|radGiven|${mode}`,
    }, 'radGiven', 'Radicals in the Given');
  }

  // ---------------------------------------------------------------------------
  // Algebraic (sides as expressions)
  // ---------------------------------------------------------------------------
  function rel(s, ref) {
    // verbal relation of k·x + d to "ref"
    const mult = s.k === 1 ? ref : s.k === 2 ? 'twice ' + ref : word(s.k) + ' times ' + ref;
    if (s.d === 0) return mult;
    return `${s.d > 0 ? s.d : -s.d} ${s.d > 0 ? 'more' : 'less'} than ${mult}`;
  }
  function solutionText(c) {
    const [l1, l2, h] = c.sides;
    return `${X} = ${c.x}; legs ${Math.min(l1, l2)} and ${Math.max(l1, l2)}, hypotenuse ${h}`;
  }
  function algLin(opts) {
    const c = pick(LIN);
    const [known, , hyp] = c.sides;
    const d = c.h.d;
    const style = pick(['plain', 'plain', 'ladder', 'kite', 'gate']);
    let text, diagram = null;
    if (style === 'ladder') {
      text = `The bottom of a ladder is ${known} ft from a wall. The ladder is ${d} ft longer than the height it reaches up the wall. How high up the wall does the ladder reach, and how long is the ladder?`;
    } else if (style === 'kite') {
      text = `A kite is flying directly above a point ${known} m from where Jo is standing. The kite string is ${d} m longer than the kite’s height. How high is the kite, and how long is the string?`;
    } else if (style === 'gate') {
      text = `A rectangular gate is ${known} in. wide. A diagonal brace across the gate is ${d} in. longer than the height of the gate. Find the height of the gate and the length of the brace.`;
    } else {
      text = `One leg of a right triangle is ${known} units long. The hypotenuse is ${d} unit${d > 1 ? 's' : ''} longer than the other leg. Find the length of the other leg and the hypotenuse.`;
    }
    if (opts.diagrams) {
      diagram = style === 'gate'
        ? { kind: 'rect', w: known, h: c.x, lw: String(known), lh: X, ld: lin(1, d) }
        : tri(known, c.x, String(known), X, lin(1, d));
    }
    return finish({
      text, prompt: opts.diagrams ? 'Write an equation and solve.' : `Let ${X} be the unknown leg. Write an equation and solve.`, diagram,
      answer: style === 'plain' ? solutionText(c) : `${X} = ${c.x}; ${style === 'gate' ? 'height' : style === 'kite' ? 'height' : 'height'} ${c.x}, ${style === 'ladder' ? 'ladder' : style === 'kite' ? 'string' : 'brace'} ${hyp}`,
      work: workFor(c.l1, c.l2, c.h, c.x),
      key: `P|algLin|${c.sides.join(',')}|${style}`, tkey: `P|algLin|${style}`,
    }, 'algLin', 'Expressions (Linear)');
  }

  function algQuad(opts) {
    const c = pick(QUAD);
    let text, diagram = null;
    const [s1, s2, s3] = c.sides;
    if (c.kind === 'legsDiff') {
      const style = pick(['plain', 'rect', 'tv', 'garden']);
      const d = c.l2.d;
      if (style === 'rect') text = `The length of a rectangle is ${d} more than its width. The diagonal of the rectangle is ${s3}. Find the length and width.`;
      else if (style === 'tv') text = `A TV screen is ${d} inches wider than it is tall. The diagonal of the screen is ${s3} inches. Find the width and height of the screen.`;
      else if (style === 'garden') text = `A rectangular garden is ${d} feet longer than it is wide. A straight path cuts diagonally across the garden and is ${s3} feet long. Find the dimensions of the garden.`;
      else text = `One leg of a right triangle is ${d} more than the other leg. The hypotenuse is ${s3}. Find the lengths of the legs.`;
      if (opts.diagrams) {
        diagram = style === 'plain' ? tri(s2, s1, lin(1, d), X, String(s3)) : { kind: 'rect', w: s2, h: s1, lw: lin(1, d), lh: X, ld: String(s3) };
      }
      return finish({
        text, prompt: 'Write an equation and solve.', diagram,
        answer: style === 'plain' ? solutionText(c) : `${X} = ${s1}; ${style === 'tv' ? 'height' : 'width'} ${s1}, ${style === 'tv' ? 'width' : 'length'} ${s2}`,
        work: workFor(c.l1, c.l2, c.h, c.x),
        key: `P|algQuad|${c.kind}|${c.sides.join(',')}|${style}`, tkey: `P|algQuad|${c.kind}`,
      }, 'algQuad', 'Expressions (Quadratic)');
    }
    if (c.kind === 'legMult') {
      text = `The longer leg of a right triangle is ${rel(c.l2, 'the shorter leg')}. The hypotenuse is ${s3}. Find the lengths of the legs.`;
      if (opts.diagrams) diagram = tri(s2, s1, lin(c.l2.k, c.l2.d), X, String(s3));
    } else if (c.kind === 'hypMult') {
      text = `One leg of a right triangle is ${s1}. The hypotenuse is ${rel(c.h, 'the other leg')}. Find the length of the other leg and the hypotenuse.`;
      if (opts.diagrams) diagram = tri(s1, s2, String(s1), X, lin(c.h.k, c.h.d));
    } else {
      text = `The longer leg of a right triangle is ${rel(c.l2, 'the shorter leg')}, and the hypotenuse is ${rel(c.h, 'the shorter leg')}. Find all three side lengths.`;
      if (opts.diagrams) diagram = tri(s2, s1, lin(1, c.l2.d), X, lin(1, c.h.d));
    }
    return finish({
      text, prompt: opts.diagrams ? 'Write an equation and solve.' : `Let ${X} be the shorter leg. Write an equation and solve.`, diagram,
      answer: solutionText(c), work: workFor(c.l1, c.l2, c.h, c.x),
      key: `P|algQuad|${c.kind}|${c.sides.join(',')}`, tkey: `P|algQuad|${c.kind}`,
    }, 'algQuad', 'Expressions (Quadratic)');
  }

  // ---------------------------------------------------------------------------
  // Word problems. find: 'c' (hypotenuse) or 'b' (leg). a, b legs; c hypotenuse.
  // ---------------------------------------------------------------------------
  const WORD = [
    { id: 'ladderH', find: 'b', r: [10, 30], u: 'feet', t: (a, b, c) => `A ${c}-foot ladder leans against a wall. The bottom of the ladder is ${a} feet from the base of the wall. How high up the wall does the ladder reach?` },
    { id: 'ladderL', find: 'c', r: [10, 30], u: 'feet', t: (a, b, c) => `A ladder reaches ${b} feet up a wall. The bottom of the ladder is ${a} feet from the wall. How long is the ladder?` },
    { id: 'tv', find: 'c', r: [20, 80], u: 'inches', t: (a, b, c) => `A TV screen is ${Math.max(a, b)} inches wide and ${Math.min(a, b)} inches tall. TVs are measured by their diagonal. What size is this TV?` },
    { id: 'tvH', find: 'b', r: [20, 80], u: 'inches', t: (a, b, c) => `A ${c}-inch TV (measured on the diagonal) is ${a} inches wide. How tall is the screen?` },
    { id: 'park', find: 'c', r: [50, 300], u: 'meters', t: (a, b, c, n) => `${n} usually walks ${a} meters east and then ${b} meters north along the sidewalks of a rectangular park. How long is the shortcut straight across the park?` },
    { id: 'kite', find: 'b', r: [30, 150], u: 'feet', t: (a, b, c, n) => `${n} is flying a kite on a ${c}-foot string. The kite is directly above a spot ${a} feet away from ${n}. How high is the kite? (Ignore ${n}’s height.)` },
    { id: 'ramp', find: 'c', r: [5, 30], u: 'feet', t: (a, b, c) => `A wheelchair ramp rises ${Math.min(a, b)} feet over a horizontal distance of ${Math.max(a, b)} feet. How long is the ramp’s surface?` },
    { id: 'wire', find: 'c', r: [10, 65], u: 'feet', t: (a, b, c) => `A support wire runs from the top of a ${b}-foot pole to a stake in the ground ${a} feet from the base of the pole. How long is the wire?` },
    { id: 'plane', find: 'c', r: [20, 300], u: 'miles', t: (a, b, c) => `A plane flies ${a} miles north and then ${b} miles east. How far is the plane from where it started?` },
    { id: 'boat', find: 'b', r: [10, 100], u: 'miles', t: (a, b, c) => `A boat is ${c} miles from the harbor. It is ${a} miles due east of a buoy that is directly north of the harbor. How far is the buoy from the harbor?` },
    { id: 'hike', find: 'c', r: [5, 40], u: 'miles', t: (a, b, c, n) => `${n} hikes ${a} miles south and then ${b} miles west. What is the straight-line distance back to the starting point?` },
    { id: 'shadow', find: 'c', r: [10, 65], u: 'feet', t: (a, b, c) => `A tree is ${b} feet tall and casts a shadow ${a} feet long. What is the distance from the top of the tree to the tip of its shadow?` },
    { id: 'zip', find: 'c', r: [20, 120], u: 'feet', t: (a, b, c) => `A zip line starts on a platform ${Math.min(a, b)} feet high and ends on the ground ${Math.max(a, b)} feet away (measured horizontally). How long is the zip line cable?` },
    { id: 'field', find: 'c', r: [50, 150], u: 'yards', t: (a, b, c, n) => `A rectangular field is ${Math.max(a, b)} yards long and ${Math.min(a, b)} yards wide. ${n} runs diagonally from one corner to the opposite corner. How far does ${n} run?` },
    { id: 'phone', find: 'b', r: [5, 17], u: 'inches', t: (a, b, c) => `A tablet screen has a ${c}-inch diagonal and is ${a} inches wide. How tall is the screen?` },
    { id: 'pool', find: 'c', r: [20, 65], u: 'meters', t: (a, b, c, n) => `${n} swims diagonally across a rectangular pool that is ${Math.max(a, b)} meters long and ${Math.min(a, b)} meters wide. How far does ${n} swim?` },
    { id: 'brace', find: 'c', r: [5, 20], u: 'feet', t: (a, b, c) => `A bookshelf is ${b} feet tall and ${a} feet wide. A diagonal brace is attached across the back from corner to corner. How long is the brace?` },
  ];
  const NAMES = ['Maya', 'Ben', 'Ava', 'Jayden', 'Sofia', 'Mateo', 'Zoe', 'Eli', 'Priya', 'Marcus', 'Chloe', 'Andre', 'Nora', 'Caleb', 'Aisha', 'Kai', 'Ruby', 'Diego'];

  function wordProb() {
    const tpl = pick(WORD.concat([{ id: 'diamond' }]));
    const n = pick(NAMES);
    if (tpl.id === 'diamond') {
      const s = pick([[90, 'baseball'], [60, 'softball']]);
      return finish({
        text: `A ${s[1]} diamond is a square with ${s[0]}-foot sides. How far does the catcher throw the ball from home plate to second base?`,
        prompt: 'Round to the nearest tenth.', diagram: null,
        answer: `≈ ${approx(s[0] * Math.SQRT2)} feet`, alts: [`${s[0]}${WU.rad(2)} ft`],
        work: `${sup2(s[0])} + ${sup2(s[0])} = ${sup2(X)}`,
        key: `P|word|diamond|${s[0]}`, tkey: 'P|word|diamond',
      }, 'word', 'Word Problem');
    }
    const cands = T300.filter((t) => t[2] >= tpl.r[0] && t[2] <= tpl.r[1]);
    let a, b, c, exact = true;
    if (cands.length && chance(0.7)) {
      const t = pick(cands);
      [a, b] = chance(0.5) ? [t[0], t[1]] : [t[1], t[0]];
      c = t[2];
    } else {
      exact = false;
      // non-triple: round to nearest tenth
      for (let tries = 0; tries < 100; tries++) {
        c = ri(tpl.r[0], tpl.r[1]);
        a = ri(Math.max(2, Math.round(c * 0.25)), Math.round(c * 0.8));
        if (tpl.find === 'c') {
          b = ri(Math.max(2, Math.round(c * 0.25)), Math.round(c * 0.8));
          if (!isSquare(a * a + b * b)) { c = Math.sqrt(a * a + b * b); break; }
        } else {
          if (!isSquare(c * c - a * a)) { b = Math.sqrt(c * c - a * a); break; }
        }
      }
    }
    const ansVal = tpl.find === 'c' ? c : b;
    const text = tpl.t(a, b, c, n);
    const work = tpl.find === 'c' ? `${sup2(a)} + ${sup2(b)} = ${sup2(X)}` : `${sup2(a)} + ${sup2(X)} = ${sup2(c)}`;
    return finish({
      text, prompt: exact ? 'Draw and label a diagram, then solve.' : 'Draw and label a diagram. Round to the nearest tenth.', diagram: null,
      answer: exact ? `${ansVal} ${tpl.u}` : `≈ ${approx(ansVal)} ${tpl.u}`, work,
      key: `P|word|${tpl.id}|${a},${Math.round(b * 10)},${Math.round(c * 10)}`, tkey: `P|word|${tpl.id}`,
    }, 'word', 'Word Problem');
  }

  const GEN = { whole, radAns, radGiven, algLin, algQuad, word: wordProb };
  function generate(type, opts) { return GEN[type](opts || {}); }

  WU.Pythagorean = {
    generate,
    TYPES: [
      { id: 'whole', name: 'Whole-number answers', desc: 'Pythagorean triples — find a missing leg or the hypotenuse' },
      { id: 'radAns', name: 'Answers in simplest radical form', desc: 'e.g. legs 4 and 6 → hypotenuse 2√13' },
      { id: 'radGiven', name: 'Radicals in the given information', desc: 'e.g. legs √5 and 2√3, isosceles right triangle with legs 3√2' },
      { id: 'algLin', name: 'Sides as expressions — linear', desc: 'one leg is 5; hypotenuse is 1 more than the other leg (x² cancels)' },
      { id: 'algQuad', name: 'Sides as expressions — quadratic', desc: 'legs x and x + 7, hypotenuse 13; “2 more than twice the shorter leg”' },
      { id: 'word', name: 'Real-world word problems', desc: 'ladders, TVs, ramps, kites — some rounded to the nearest tenth' },
    ],
    _LIN: LIN, _QUAD: QUAD,
  };
})(window.WU);
