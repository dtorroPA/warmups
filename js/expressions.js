/* Writing Algebraic Expressions — problem generators.
 *
 * Levels
 *   1  One step:            "five more than a number", "twice its width", unit rates
 *   2  Two steps:           "three more than twice its width", fee + rate
 *   3  Grouping / tricky:   "twice the sum of ...", "subtracted from", percents
 *   4  Multi-step contexts: perimeter, consecutive integers, coin values, ...
 *
 * Every generator returns { text, prompt, answer, alts, key, tkey }:
 *   key  – exact problem fingerprint (used to avoid repeats across days)
 *   tkey – template fingerprint (used to keep a single warm-up varied)
 */
window.WU = window.WU || {};
(function (WU) {
  'use strict';
  const { ri, ris, pick, chance, word, cap, money, v, sq, frac, poly, fmtNum, MINUS } = WU;

  // Names chosen so that no two share an initial with a confusing letter (no I, L, O)
  const NAMES = ['Maya', 'Ben', 'Ava', 'Jayden', 'Sofia', 'Mateo', 'Zoe', 'Eli', 'Priya', 'Marcus', 'Chloe',
    'Andre', 'Nora', 'Caleb', 'Aisha', 'Ethan', 'Ruby', 'Kai', 'Hannah', 'Diego', 'Grace', 'Tyler', 'Wes',
    'Fatima', 'Ravi', 'Jasmine', 'Sam', 'Tessa', 'Noah', 'Bianca', 'Carlos', 'Dante', 'Gabe', 'Harper',
    'Jada', 'Kenji', 'Mia', 'Nico', 'Paige', 'Quinn', 'Rosa', 'Theo', 'Valeria', 'Yusuf', 'Zara', 'Felix'];
  const BAD_VARS = ['i', 'l', 'o', 'e'];
  function twoNames() {
    let a, b;
    do {
      a = pick(NAMES); b = pick(NAMES);
    } while (a[0] === b[0] || BAD_VARS.includes(b[0].toLowerCase()));
    return [a, b];
  }
  const poss = (n) => n + "'s";
  const oneName = () => pick(NAMES);

  // ---------------------------------------------------------------------------
  // Comparison contexts: "<subj> <RELATION PHRASE> <base>."
  // ---------------------------------------------------------------------------
  const CONTEXTS = [
    () => ({ subj: 'The length of a rectangle is', base: 'its width', def: 'the width of the rectangle', ask: 'the length of the rectangle', v: 'w', range: [2, 12, 1] }),
    () => ({ subj: 'The length of a garden is', base: 'its width', def: 'the width of the garden (in feet)', ask: 'the length of the garden', v: 'w', unit: 'feet', range: [2, 15, 1] }),
    () => ({ subj: 'The base of a triangle is', base: 'its height', def: 'the height of the triangle', ask: 'the base of the triangle', v: 'h', unit: 'centimeters', range: [2, 12, 1] }),
    () => ({ subj: 'The length of a swimming pool is', base: 'its width', def: 'the width of the pool (in meters)', ask: 'the length of the pool', v: 'w', unit: 'meters', range: [2, 20, 1] }),
    () => { const [a, b] = twoNames(); return { subj: poss(a) + ' age is', base: poss(b) + ' age', def: poss(b) + ' age', ask: poss(a) + ' age', v: b[0].toLowerCase(), unit: 'years', range: [2, 10, 1] }; },
    () => ({ subj: 'The cost of a large pizza is', base: 'the cost of a small pizza', def: 'the cost of a small pizza (in dollars)', ask: 'the cost of a large pizza', v: 's', unit: 'money', range: [2, 8, 1], bigger: true }),
    () => ({ subj: 'The time spent on homework is', base: 'the time spent reading', def: 'the time spent reading (in minutes)', ask: 'the time spent on homework', v: 'r', unit: 'minutes', range: [5, 30, 5] }),
    () => ({ subj: 'The number of boys in the chess club is', base: 'the number of girls', def: 'the number of girls in the club', ask: 'the number of boys in the club', v: 'g', count: true, range: [2, 9, 1] }),
    () => { const [a, b] = twoNames(); return { subj: a + ' scored', base: 'the number of points ' + b + ' scored', def: 'the number of points ' + b + ' scored', ask: 'the number of points ' + a + ' scored', v: b[0].toLowerCase(), count: true, range: [2, 12, 1] }; },
    () => { const [a, b] = twoNames(); return { subj: a + ' has', base: 'the number of baseball cards ' + b + ' has', def: 'the number of cards ' + b + ' has', ask: 'the number of cards ' + a + ' has', v: b[0].toLowerCase(), count: true, range: [3, 20, 1] }; },
    () => ({ subj: 'The height of the oak tree is', base: 'the height of the maple tree', def: 'the height of the maple tree (in feet)', ask: 'the height of the oak tree', v: 'm', unit: 'feet', range: [2, 15, 1] }),
    () => { const a = oneName(); return { subj: 'The distance ' + a + ' biked on Sunday is', base: 'the distance ' + a + ' biked on Saturday', def: 'the distance biked on Saturday (in miles)', ask: 'the distance biked on Sunday', v: 'd', unit: 'miles', range: [2, 10, 1] }; },
    () => ({ subj: 'The weight of the dog is', base: 'the weight of the cat', def: 'the weight of the cat (in pounds)', ask: 'the weight of the dog', v: 'c', unit: 'pounds', range: [2, 15, 1] }),
    () => { const [a, b] = twoNames(); return { subj: a + ' read', base: 'the number of pages ' + b + ' read', def: 'the number of pages ' + b + ' read', ask: 'the number of pages ' + a + ' read', v: b[0].toLowerCase(), count: true, range: [5, 30, 5] }; },
    () => { const [a, b] = twoNames(); return { subj: a + ' saved', base: 'the amount ' + b + ' saved', def: 'the amount ' + b + ' saved (in dollars)', ask: 'the amount ' + a + ' saved', v: b[0].toLowerCase(), unit: 'money', range: [5, 40, 5] }; },
    () => ({ subj: 'The number of students in 2nd period is', base: 'the number of students in 1st period', def: 'the number of students in 1st period', ask: 'the number of students in 2nd period', v: 's', count: true, range: [2, 8, 1] }),
    () => ({ subj: 'The measure of angle A is', base: 'the measure of angle B', def: 'the measure of angle B (in degrees)', ask: 'the measure of angle A', v: 'b', unit: 'degrees', range: [5, 40, 5] }),
    () => ({ subj: 'The length of the sequel is', base: 'the length of the original movie', def: 'the length of the original movie (in minutes)', ask: 'the length of the sequel', v: 'm', unit: 'minutes', range: [5, 30, 5] }),
    () => ({ subj: 'The number of apples in the basket is', base: 'the number of oranges', def: 'the number of oranges in the basket', ask: 'the number of apples in the basket', v: 'r', count: true, range: [2, 12, 1] }),
    () => ({ subj: 'The number of adult tickets sold is', base: 'the number of student tickets sold', def: 'the number of student tickets sold', ask: 'the number of adult tickets sold', v: 's', count: true, range: [5, 50, 5] }),
    () => { const [a, b] = twoNames(); return { subj: a + ' worked', base: 'the number of hours ' + b + ' worked', def: 'the number of hours ' + b + ' worked', ask: 'the number of hours ' + a + ' worked', v: b[0].toLowerCase(), count: true, range: [2, 8, 1] }; },
    () => ({ subj: 'The price of the jeans is', base: 'the price of the shirt', def: 'the price of the shirt (in dollars)', ask: 'the price of the jeans', v: 's', unit: 'money', range: [3, 15, 1] }),
    () => { const [a, b] = twoNames(); return { subj: a + ' has', base: 'the number of followers ' + b + ' has', def: 'the number of followers ' + b + ' has', ask: 'the number of followers ' + a + ' has', v: b[0].toLowerCase(), count: true, range: [10, 90, 10] }; },
    () => ({ subj: 'The rainfall in April was', base: 'the rainfall in March', def: 'the rainfall in March (in inches)', ask: 'the rainfall in April', v: 'm', unit: 'inches', range: [2, 6, 1] }),
    () => { const [a, b] = twoNames(); return { subj: a + ' completed', base: 'the number of game levels ' + b + ' completed', def: 'the number of levels ' + b + ' completed', ask: 'the number of levels ' + a + ' completed', v: b[0].toLowerCase(), count: true, range: [2, 12, 1] }; },
    () => ({ subj: 'The bus ride to school takes', base: 'the time it takes to walk', def: 'the time it takes to walk to school (in minutes)', ask: 'the length of the bus ride', v: 'w', unit: 'minutes', range: [2, 10, 1] }),
    () => ({ subj: 'Tank A holds', base: 'the amount of water Tank B holds', def: 'the amount of water Tank B holds (in gallons)', ask: 'the amount of water Tank A holds', v: 'b', unit: 'gallons', range: [5, 50, 5] }),
    () => ({ subj: 'The second song on the playlist is', base: 'the length of the first song', def: 'the length of the first song (in seconds)', ask: 'the length of the second song', v: 'f', unit: 'seconds', range: [10, 60, 10] }),
    () => { const [a, b] = twoNames(); return { subj: a + ' walked', base: 'the number of steps ' + b + ' walked', def: 'the number of steps ' + b + ' walked', ask: 'the number of steps ' + a + ' walked', v: b[0].toLowerCase(), count: true, range: [100, 900, 100] }; },
    () => ({ subj: 'At the bake sale, the number of cookies sold was', base: 'the number of brownies sold', def: 'the number of brownies sold', ask: 'the number of cookies sold', v: 'b', count: true, range: [3, 20, 1] }),
    () => ({ subj: 'The cost of the phone case is', base: 'the cost of the screen protector', def: 'the cost of the screen protector (in dollars)', ask: 'the cost of the phone case', v: 'p', unit: 'money', range: [2, 12, 1] }),
    () => ({ subj: 'The number of songs on the new album is', base: 'the number of songs on the first album', def: 'the number of songs on the first album', ask: 'the number of songs on the new album', v: 'n', count: true, range: [2, 6, 1] }),
    () => ({ subj: 'The height of the giraffe is', base: 'the height of the zookeeper', def: 'the height of the zookeeper (in feet)', ask: 'the height of the giraffe', v: 'z', unit: 'feet', range: [2, 6, 1], bigger: true }),
    () => { const a = oneName(); return { subj: 'On Saturday, ' + a + ' sold', base: 'the number of bracelets sold on Friday', def: 'the number of bracelets sold on Friday', ask: 'the number of bracelets sold on Saturday', v: 'f', count: true, range: [2, 15, 1] }; },
    () => ({ subj: 'The temperature at noon was', base: 'the temperature at 6 a.m.', def: 'the temperature at 6 a.m. (in degrees)', ask: 'the temperature at noon', v: 't', unit: 'degrees', range: [3, 20, 1] }),
  ];

  // constant phrase for a context, e.g. "$3", "15 minutes", "four"
  function cst(ctx, a) {
    if (!ctx) return a <= 12 && chance(0.6) ? word(a) : String(a);
    if (ctx.unit === 'money') return money(a);
    if (ctx.unit) return `${a} ${ctx.unit}`;
    return a <= 12 && chance(0.7) ? word(a) : String(a);
  }
  const num = (a) => (a <= 12 && chance(0.6) ? word(a) : String(a));
  function K(k) {
    if (k === 2) return pick(['twice', 'two times', 'double']);
    if (k === 3) return pick(['three times', 'triple']);
    return word(k) + ' times';
  }
  const less = (ctx) => (ctx && ctx.count ? 'fewer' : 'less');
  function constFor(ctx) {
    if (!ctx) return ri(2, 15);
    const [a, b, s] = ctx.range;
    return ris(a, b, s);
  }

  // ---------------------------------------------------------------------------
  // Relation forms. B = base phrase, V = variable html, ctx = context or null
  // ---------------------------------------------------------------------------
  const FORMS = [
    // ---- Level 1
    { id: 'add', L: 1, make(c, B, V) { const a = constFor(c); return { p: `${cst(c, a)} more than ${B}`, ans: poly([[1, V], [a, '']]), alts: [poly([[a, ''], [1, V]])], n: [a] }; } },
    { id: 'sub', shrink: true, L: 1, make(c, B, V) { const a = constFor(c); return { p: `${cst(c, a)} ${less(c)} than ${B}`, ans: poly([[1, V], [-a, '']]), alts: [], n: [a] }; } },
    { id: 'mul', L: 1, make(c, B, V) { const k = ri(2, 6); return { p: `${K(k)} ${B}`, ans: poly([[k, V]]), alts: [], n: [k] }; } },
    { id: 'part', shrink: true, L: 1, make(c, B, V) { const d = c ? pick([2, 2, 3]) : pick([2, 3, 4]); const ph = { 2: 'half of', 3: 'one-third of', 4: 'one-fourth of' }[d]; return { p: `${ph} ${B}`, ans: frac(V, d), alts: [frac(1, d) + V].concat(d === 2 ? ['0.5' + V] : []), n: [d] }; } },
    { id: 'inc', L: 1, abs: true, make(c, B, V) { const a = ri(2, 20); return { p: `${B} increased by ${num(a)}`, ans: poly([[1, V], [a, '']]), alts: [poly([[a, ''], [1, V]])], n: [a] }; } },
    { id: 'dec', L: 1, abs: true, make(c, B, V) { const a = ri(2, 20); return { p: `${B} decreased by ${num(a)}`, ans: poly([[1, V], [-a, '']]), alts: [], n: [a] }; } },
    { id: 'sum', L: 1, abs: true, make(c, B, V) { const a = ri(2, 20); return { p: `the sum of ${B} and ${num(a)}`, ans: poly([[1, V], [a, '']]), alts: [poly([[a, ''], [1, V]])], n: [a] }; } },
    { id: 'diff', L: 1, abs: true, make(c, B, V) { const a = ri(2, 20); return { p: `the difference of ${B} and ${num(a)}`, ans: poly([[1, V], [-a, '']]), alts: [], n: [a] }; } },
    { id: 'prod', L: 1, abs: true, make(c, B, V) { const a = ri(2, 12); return { p: `the product of ${num(a)} and ${B}`, ans: poly([[a, V]]), alts: [], n: [a] }; } },
    { id: 'quot', L: 1, abs: true, make(c, B, V) { const a = ri(2, 12); return { p: `the quotient of ${B} and ${num(a)}`, ans: frac(V, a), alts: [`${V} ÷ ${a}`], n: [a] }; } },
    { id: 'plus', L: 1, abs: true, make(c, B, V) { const a = ri(2, 20); return { p: `${num(a)} plus ${B}`, ans: poly([[a, ''], [1, V]]), alts: [poly([[1, V], [a, '']])], n: [a] }; } },

    // ---- Level 2
    { id: 'addMul', L: 2, make(c, B, V) { const a = constFor(c), k = ri(2, 5); return { p: `${cst(c, a)} more than ${K(k)} ${B}`, ans: poly([[k, V], [a, '']]), alts: [poly([[a, ''], [k, V]])], n: [a, k] }; } },
    { id: 'subMul', L: 2, make(c, B, V) { const a = constFor(c), k = ri(2, 5); return { p: `${cst(c, a)} ${less(c)} than ${K(k)} ${B}`, ans: poly([[k, V], [-a, '']]), alts: [], n: [a, k] }; } },
    { id: 'addHalf', shrink: true, L: 2, make(c, B, V) { const a = constFor(c); return { p: `${cst(c, a)} more than half of ${B}`, ans: frac(V, 2) + ' + ' + fmtNum(a), alts: [frac(1, 2) + V + ' + ' + a, '0.5' + V + ' + ' + a], n: [a] }; } },
    { id: 'subHalf', shrink: true, L: 2, make(c, B, V) { const a = constFor(c); return { p: `${cst(c, a)} ${less(c)} than half of ${B}`, ans: frac(V, 2) + ` ${MINUS} ` + fmtNum(a), alts: [frac(1, 2) + V + ` ${MINUS} ` + a, '0.5' + V + ` ${MINUS} ` + a], n: [a] }; } },
    { id: 'prodInc', L: 2, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `the product of ${num(k)} and ${B}, increased by ${num(a)}`, ans: poly([[k, V], [a, '']]), alts: [], n: [a, k] }; } },
    { id: 'mulDec', L: 2, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `${K(k)} ${B}, decreased by ${num(a)}`, ans: poly([[k, V], [-a, '']]), alts: [], n: [a, k] }; } },
    { id: 'quotMore', L: 2, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `${num(a)} more than the quotient of ${B} and ${num(k)}`, ans: frac(V, k) + ' + ' + a, alts: [], n: [a, k] }; } },
    { id: 'sumMul', L: 2, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `the sum of ${K(k)} ${B} and ${num(a)}`, ans: poly([[k, V], [a, '']]), alts: [], n: [a, k] }; } },
    { id: 'sevenLess', L: 2, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `${num(a)} less than the product of ${num(k)} and ${B}`, ans: poly([[k, V], [-a, '']]), alts: [], n: [a, k] }; } },

    // ---- Level 3
    { id: 'kSum', L: 3, make(c, B, V) { const a = constFor(c), k = ri(2, 5); return { p: `${K(k)} the sum of ${B} and ${cst(c, a)}`, ans: `${k}(${poly([[1, V], [a, '']])})`, alts: [poly([[k, V], [k * a, '']])], n: [a, k] }; } },
    { id: 'kDiff', L: 3, make(c, B, V) { const a = constFor(c), k = ri(2, 5); return { p: `${K(k)} the difference of ${B} and ${cst(c, a)}`, ans: `${k}(${poly([[1, V], [-a, '']])})`, alts: [poly([[k, V], [-k * a, '']])], n: [a, k] }; } },
    { id: 'halfSum', shrink: true, L: 3, make(c, B, V) { const a = constFor(c); return { p: `half of the sum of ${B} and ${cst(c, a)}`, ans: frac(poly([[1, V], [a, '']]), 2), alts: [`${frac(1, 2)}(${poly([[1, V], [a, '']])})`], n: [a] }; } },
    { id: 'subFrom', L: 3, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `${num(a)} subtracted from ${K(k)} ${B}`, ans: poly([[k, V], [-a, '']]), alts: [], n: [a, k] }; } },
    { id: 'fromSub', L: 3, abs: true, make(c, B, V) { const a = ri(5, 30); return { p: `${B} subtracted from ${num(a)}`, ans: poly([[a, ''], [-1, V]]), alts: [], n: [a] }; } },
    { id: 'decK', L: 3, abs: true, make(c, B, V) { const a = ri(5, 30), k = ri(2, 9); return { p: `${num(a)} decreased by ${K(k)} ${B}`, ans: poly([[a, ''], [-k, V]]), alts: [], n: [a, k] }; } },
    { id: 'sqInc', L: 3, abs: true, make(c, B, V) { const a = ri(2, 15); return { p: `the square of ${B}, increased by ${num(a)}`, ans: poly([[1, sq(V)], [a, '']]), alts: [], n: [a] }; } },
    { id: 'kSq', L: 3, abs: true, make(c, B, V) { const k = ri(2, 9); return { p: `${K(k)} the square of ${B}`, ans: poly([[k, sq(V)]]), alts: [], n: [k] }; } },
    { id: 'sumDiv', L: 3, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `the sum of ${B} and ${num(a)}, divided by ${num(k)}`, ans: frac(poly([[1, V], [a, '']]), k), alts: [`(${poly([[1, V], [a, '']])}) ÷ ${k}`], n: [a, k] }; } },
    { id: 'quotLess', L: 3, abs: true, make(c, B, V) { const a = ri(2, 15), k = ri(2, 9); return { p: `${num(a)} less than the quotient of ${B} and ${num(k)}`, ans: frac(V, k) + ` ${MINUS} ` + a, alts: [], n: [a, k] }; } },
    { id: 'quotRev', L: 3, abs: true, make(c, B, V) { const a = ri(2, 30); return { p: `the quotient of ${num(a)} and ${B}`, ans: frac(a, V), alts: [`${a} ÷ ${V}`], n: [a] }; } },
    { id: 'kDiffRev', L: 3, abs: true, make(c, B, V) { const a = ri(2, 20), k = ri(2, 6); return { p: `${K(k)} the difference of ${num(a)} and ${B}`, ans: `${k}(${poly([[a, ''], [-1, V]])})`, alts: [poly([[k * a, ''], [-k, V]])], n: [a, k] }; } },
  ];

  const ABS_VARS = ['n', 'x', 'y', 'm', 'k', 'a', 'b', 'p', 't', 'z', 'c', 'd'];

  function fromForm(form, ctxIdx) {
    if (ctxIdx === null) {
      const vn = pick(ABS_VARS);
      const V = v(vn);
      const r = form.make(null, 'a number', V);
      return {
        text: `Write an expression for: <span class="phrase">“${r.p}”</span>`,
        prompt: `Let ${V} represent the number.`,
        answer: r.ans, alts: r.alts,
        key: `E|${form.id}|abs|${r.n.join(',')}`,
        tkey: `E|${form.id}|abs`,
      };
    }
    const ctx = CONTEXTS[ctxIdx]();
    const V = v(ctx.v);
    const r = form.make(ctx, ctx.base, V);
    return {
      text: `${ctx.subj} ${r.p}.`,
      prompt: `Let ${V} represent ${ctx.def}. Write an expression for ${ctx.ask}.`,
      answer: r.ans, alts: r.alts,
      key: `E|${form.id}|c${ctxIdx}|${r.n.join(',')}`,
      tkey: `E|${form.id}|c${ctxIdx}`,
    };
  }

  // ---------------------------------------------------------------------------
  // Stand-alone context generators
  // ---------------------------------------------------------------------------
  const mk = (text, prompt, answer, alts, key, tkey) => ({ text, prompt, answer, alts: alts || [], key, tkey: tkey || key.split('|').slice(0, 2).join('|') });

  const STANDALONE = {
    1: [
      function packs() {
        const it = pick([
          ['box', 'crayons', 'b', [8, 24, 8]], ['pack', 'pencils', 'p', [6, 24, 6]], ['carton', 'eggs', 'c', [12, 12, 1]],
          ['bag', 'apples', 'b', [5, 10, 1]], ['case', 'water bottles', 'c', [12, 36, 12]], ['sleeve', 'tennis balls', 's', [3, 4, 1]],
          ['bundle', 'markers', 'b', [4, 12, 2]], ['roll', 'stickers', 'r', [20, 100, 20]], ['bus', 'students', 'b', [30, 50, 2]],
        ]);
        const a = ris(...it[3]);
        const V = v(it[2]);
        return mk(`Each ${it[0]} holds ${a} ${it[1]}.`, `Let ${V} represent the number of ${it[0] === 'box' ? 'boxes' : it[0] === 'bus' ? 'buses' : it[0] + 's'}. Write an expression for the total number of ${it[1]}.`,
          poly([[a, V]]), [], `E|packs|${it[1]}|${a}`);
      },
      function price() {
        const it = pick([['Movie tickets', 't', [8, 15, 1]], ['Notebooks', 'n', [2, 5, 1]], ['Concert tickets', 't', [25, 60, 5]],
          ['Video game rentals', 'r', [3, 7, 1]], ['Smoothies', 's', [4, 8, 1]], ['Packs of gum', 'g', [1, 3, 1]], ['Car washes', 'c', [8, 15, 1]],
          ['Bus passes', 'p', [2, 5, 1]], ['T-shirts', 's', [10, 20, 1]]]);
        const a = ris(...it[2]);
        const V = v(it[1]);
        return mk(`${it[0]} cost ${money(a)} each.`, `Let ${V} represent the number bought. Write an expression for the total cost in dollars.`,
          poly([[a, V]]), [], `E|price|${it[0]}|${a}`);
      },
      function speed() {
        const it = pick([['A train', 'miles per hour', [40, 80, 5]], ['A cyclist', 'miles per hour', [10, 18, 1]], ['A jet', 'miles per hour', [450, 600, 50]],
          ['A runner', 'meters per second', [3, 7, 1]], ['A snail', 'inches per minute', [2, 4, 1]], ['A car', 'kilometers per hour', [60, 110, 10]]]);
        const a = ris(...it[2]);
        const unitT = it[1].split(' per ')[1];
        const V = v('t');
        return mk(`${it[0]} travels at a constant speed of ${a} ${it[1]}.`, `Let ${V} represent the number of ${unitT}s. Write an expression for the distance traveled.`,
          poly([[a, V]]), [], `E|speed|${it[0]}|${a}`);
      },
      function convert() {
        // [big singular, big plural, small plural, factor, big var, small var]
        const it = pick([
          ['foot', 'feet', 'inches', 12, 'f', 'n'], ['hour', 'hours', 'minutes', 60, 'h', 'm'], ['week', 'weeks', 'days', 7, 'w', 'd'],
          ['dollar', 'dollars', 'cents', 100, 'd', 'c'], ['yard', 'yards', 'feet', 3, 'y', 'f'], ['minute', 'minutes', 'seconds', 60, 'm', 's'],
          ['year', 'years', 'months', 12, 'y', 'm'], ['day', 'days', 'hours', 24, 'd', 'h'], ['pound', 'pounds', 'ounces', 16, 'p', 'z'],
          ['gallon', 'gallons', 'quarts', 4, 'g', 'q'], ['meter', 'meters', 'centimeters', 100, 'm', 'c'],
        ]);
        const toSmall = chance(0.6);
        const V = v(toSmall ? it[4] : it[5]);
        const fact = `There are ${it[3]} ${it[2]} in 1 ${it[0]}.`;
        if (toSmall) {
          return mk(fact, `Let ${V} represent a number of ${it[1]}. Write an expression for the number of ${it[2]}.`,
            poly([[it[3], V]]), [], `E|convert|${it[1]}>${it[2]}`);
        }
        return mk(fact, `Let ${V} represent a number of ${it[2]}. Write an expression for the number of ${it[1]}.`,
          frac(V, it[3]), [`${V} ÷ ${it[3]}`], `E|convert|${it[2]}>${it[1]}`);
      },
      function share() {
        const it = pick([
          ['A ribbon that is r inches long is cut into {k} equal pieces.', 'r', 'the length of each piece', [2, 8]],
          ['A restaurant bill of b dollars is split equally among {k} friends.', 'b', 'the amount each friend pays', [2, 6]],
          ['A bag of c candies is shared equally among {k} students.', 'c', 'the number of candies each student gets', [3, 8]],
          ['A road trip of d miles is split equally over {k} days.', 'd', 'the number of miles driven each day', [2, 5]],
          ['A rope p feet long is cut into {k} equal pieces.', 'p', 'the length of each piece', [2, 6]],
        ]);
        const k = ri(...it[3]);
        const V = v(it[1]);
        const t = it[0].replace('{k}', word(k)).replace(new RegExp('\\b' + it[1] + '\\b'), V);
        return mk(t, `Write an expression for ${it[2]}.`, frac(V, k), [`${V} ÷ ${k}`], `E|share|${it[1]}|${k}`);
      },
      function olderYounger() {
        const [a, b] = twoNames();
        const n = ri(2, 12);
        const V = v(b[0].toLowerCase());
        const older = chance(0.5);
        return mk(`${a} is ${num(n)} years ${older ? 'older' : 'younger'} than ${b}.`, `Let ${V} represent ${poss(b)} age. Write an expression for ${poss(a)} age.`,
          poly([[1, V], [older ? n : -n, '']]), [], `E|age1|${older}|${n}`);
      },
    ],
    2: [
      function feeRate() {
        const it = pick([
          ['A gym charges a {a} sign-up fee plus {b} per month.', 'm', 'months', 'the total cost', [20, 50, 5], [15, 40, 5]],
          ['A plumber charges {a} for a house call plus {b} per hour of work.', 'h', 'hours worked', 'the total charge', [40, 90, 10], [35, 75, 5]],
          ['A bowling alley charges {a} for shoe rental plus {b} per game.', 'g', 'games bowled', 'the total cost', [3, 6, 1], [4, 8, 1]],
          ['A phone plan costs {a} per month plus {b} for each gigabyte of extra data.', 'g', 'extra gigabytes used in a month', 'the monthly bill', [25, 45, 5], [5, 15, 5]],
          ['A dog walker charges a {a} booking fee plus {b} per walk.', 'w', 'walks', 'the total cost', [5, 15, 5], [10, 20, 1]],
          ['A bike rental costs {a} plus {b} per hour.', 'h', 'hours', 'the total rental cost', [5, 20, 5], [3, 9, 1]],
          ['A tutor charges {a} for an assessment plus {b} per session.', 's', 'sessions', 'the total cost', [25, 60, 5], [30, 50, 5]],
        ]);
        const a = ris(...it[4]), b = ris(...it[5]);
        const V = v(it[1]);
        return mk(it[0].replace('{a}', money(a)).replace('{b}', money(b)), `Let ${V} represent the number of ${it[2]}. Write an expression for ${it[3]} in dollars.`,
          poly([[b, V], [a, '']]), [poly([[a, ''], [b, V]])], `E|feeRate|${it[1]}${it[2]}|${a},${b}`);
      },
      function taxi() {
        const a = pick([2.5, 3, 3.5, 4]), b = pick([1.25, 1.5, 1.75, 2, 2.25, 2.5]);
        const V = v('m');
        return mk(`A taxi charges ${money(a)} to start the ride plus ${money(b)} per mile.`, `Let ${V} represent the number of miles. Write an expression for the cost of the ride.`,
          poly([[b, V], [a, '']]), [poly([[a, ''], [b, V]])], `E|taxi|x|${a},${b}`);
      },
      function startRate() {
        const it = pick([
          ['{n} has {a} in a savings account and deposits {b} each week.', 'w', 'weeks', 'the amount in the account', 'money', 1, [20, 200, 10], [5, 25, 5]],
          ['A plant is {a} inches tall and grows {b} inches each week.', 'w', 'weeks', 'the height of the plant', null, 1, [2, 10, 1], [1, 3, 1]],
          ['A candle is {a} centimeters tall and burns down {b} centimeters each hour.', 'h', 'hours', 'the height of the candle', null, -1, [15, 30, 1], [1, 3, 1]],
          ['A tank holds {a} gallons of water and drains at {b} gallons per minute.', 'm', 'minutes', 'the amount of water left in the tank', null, -1, [100, 500, 50], [5, 20, 5]],
          ['A gift card has {a} on it. Each song download costs {b}.', 's', 'songs downloaded', 'the amount left on the card', 'money', -1, [15, 50, 5], [1, 2, 1]],
          ['A phone battery is at {a}% and drops {b}% each hour.', 'h', 'hours', 'the battery percentage', 'pct', -1, [80, 100, 5], [5, 15, 1]],
          ['A pool already has {a} gallons of water. A hose adds {b} gallons per minute.', 'm', 'minutes', 'the number of gallons in the pool', null, 1, [50, 300, 50], [5, 15, 1]],
          ['{n} has read {a} pages of a book and reads {b} pages each night.', 'd', 'nights', 'the total number of pages read', null, 1, [20, 80, 5], [10, 30, 5]],
          ['An airplane is at {a} feet and descends {b} feet each minute.', 'm', 'minutes', 'the altitude of the plane', null, -1, [20000, 35000, 1000], [500, 2000, 500]],
          ['{n} has {a} trading cards and buys {b} more each month.', 'm', 'months', 'the number of cards', null, 1, [10, 60, 5], [3, 12, 1]],
        ]);
        const a = ris(...it[6]), b = ris(...it[7]);
        const fmt = (x) => (it[4] === 'money' ? money(x) : String(x));
        const V = v(it[1]);
        const t = it[0].replace('{n}', oneName()).replace('{a}', fmt(a)).replace('{b}', fmt(b));
        return mk(t, `Let ${V} represent the number of ${it[2]}. Write an expression for ${it[3]}.`,
          poly([[a, ''], [it[5] * b, V]]), it[5] > 0 ? [poly([[b, V], [a, '']])] : [], `E|startRate|${it[3]}|${a},${b}`);
      },
    ],
    3: [
      function discount() {
        const pct = pick([10, 15, 20, 25, 30, 40, 50]);
        const item = pick(['a jacket', 'a pair of sneakers', 'a video game', 'a backpack', 'headphones', 'a skateboard']);
        const V = v('p');
        const rest = (100 - pct) / 100;
        return mk(`${cap(item)} costs ${V} dollars. It goes on sale for ${pct}% off.`, `Write an expression for the sale price.`,
          `${V} ${MINUS} ${pct / 100}${V}`, [`${rest}${V}`], `E|discount|${pct}`);
      },
      function tax() {
        const pct = pick([4, 5, 6, 7, 8]);
        const V = v('p');
        return mk(`A meal costs ${V} dollars before tax. The sales tax is ${pct}%.`, `Write an expression for the total cost including tax.`,
          `${V} + 0.0${pct}${V}`, [`1.0${pct}${V}`], `E|tax|${pct}`);
      },
      function splitPlus() {
        const it = pick([
          ['{k} friends share the cost of a pizza that costs p dollars plus a {a} delivery fee equally.', 'p', 'the amount each friend pays', 'money', [3, 6, 1]],
          ['{k} roommates split the monthly rent of r dollars and a {a} internet bill equally.', 'r', 'the amount each roommate pays', 'money', [40, 80, 10]],
          ['A group of {k} hikers splits the cost of a campsite that costs c dollars plus a {a} parking fee equally.', 'c', 'the amount each hiker pays', 'money', [5, 15, 5]],
          ['A board that is b inches long has {a} inches cut off. The rest is cut into {k} equal pieces.', 'b', 'the length of each piece', 'in', [4, 12, 2]],
        ]);
        const k = ri(2, 5), a = ris(...it[4]);
        const V = v(it[1]);
        const t = it[0].replace('{k}', cap(word(k))).replace('{a}', it[3] === 'money' ? money(a) : a).replace(new RegExp('\\b' + it[1] + '\\b'), V);
        const inner = it[3] === 'in' ? poly([[1, V], [-a, '']]) : poly([[1, V], [a, '']]);
        return mk(t.charAt(0).toUpperCase() + t.slice(1), `Write an expression for ${it[2]}.`, frac(inner, k), [`(${inner}) ÷ ${k}`], `E|split|${it[1]}|${k},${a}`);
      },
      function average() {
        const n = oneName();
        const a = ri(70, 98);
        const V = v('s');
        return mk(`${n} scored ${a} on the first test and ${V} on the second test.`, `Write an expression for ${poss(n)} average (mean) score on the two tests.`,
          frac(`${V} + ${a}`, 2), [`(${a} + ${V}) ÷ 2`], `E|avg|${a}`);
      },
      function timesAsMany() {
        const [a, b] = twoNames();
        const k = ri(2, 4), c = ri(2, 9);
        const V = v(b[0].toLowerCase());
        const thing = pick(['marbles', 'stamps', 'shells', 'comic books', 'stickers']);
        return mk(`${a} has ${c} more than ${K(k)} as many ${thing} as ${b}. Then ${a} gives away half of them.`, `Let ${V} represent the number of ${thing} ${b} has. Write an expression for the number of ${thing} ${a} has left.`,
          frac(poly([[k, V], [c, '']]), 2), [`${frac(1, 2)}(${poly([[k, V], [c, '']])})`], `E|tam|${k},${c}`);
      },
    ],
    4: [
      function rectPerim() {
        const k = ri(1, 4), a = ri(1, 9), sub = k > 1 && chance(0.4);
        const W = v('w');
        const lenHTML = poly([[k, W], [sub ? -a : a, '']]);
        const phrase = k === 1 ? `${num(a)} more than its width` : `${num(a)} ${sub ? 'less' : 'more'} than ${K(k)} its width`;
        const simp = poly([[2 + 2 * k, W], [2 * (sub ? -a : a), '']]);
        return mk(`The length of a rectangle is ${phrase}.`, `Let ${W} represent the width. Write and simplify an expression for the <b>perimeter</b> of the rectangle.`,
          simp, [`2${W} + 2(${lenHTML})`], `E|rectPerim|${k},${a},${sub}`);
      },
      function rectArea() {
        const W = v('w');
        if (chance(0.5)) {
          const a = ri(2, 9);
          return mk(`The length of a rectangle is ${num(a)} more than its width.`, `Let ${W} represent the width. Write an expression for the <b>area</b> of the rectangle.`,
            poly([[1, sq(W)], [a, W]]), [`${W}(${W} + ${a})`], `E|rectArea|a${a}`);
        }
        const k = ri(2, 4), a = ri(1, 6);
        return mk(`The length of a rectangle is ${num(a)} more than ${K(k)} its width.`, `Let ${W} represent the width. Write an expression for the <b>area</b> of the rectangle.`,
          poly([[k, sq(W)], [a, W]]), [`${W}(${k}${W} + ${a})`], `E|rectArea|k${k},${a}`);
      },
      function triPerim() {
        const a = ri(2, 9), k = ri(2, 3);
        const X = v('x');
        return mk(`The second side of a triangle is ${num(a)} inches longer than the first side. The third side is ${K(k)} as long as the first side.`,
          `Let ${X} represent the length of the first side. Write and simplify an expression for the perimeter.`,
          poly([[2 + k, X], [a, '']]), [`${X} + (${X} + ${a}) + ${k}${X}`], `E|triPerim|${a},${k}`);
      },
      function consec() {
        const kind = pick(['', 'even ', 'odd ']);
        const n = pick([2, 3, 3, 4]);
        const step = kind ? 2 : 1;
        const N = v('n');
        const terms = [];
        for (let i = 0; i < n; i++) terms.push(i === 0 ? N : `(${N} + ${i * step})`);
        const sumC = step * (n * (n - 1)) / 2;
        return mk(`Consider ${word(n)} consecutive ${kind}integers. The smallest is ${N}.`, `Write and simplify an expression for the sum of the ${word(n)} integers.`,
          poly([[n, N], [sumC, '']]), [terms.join(' + ')], `E|consec|${kind}${n}`);
      },
      function ages() {
        const [a, b] = twoNames();
        const B = v(b[0].toLowerCase());
        const mode = pick(['future', 'past', 'sum', 'olderSum']);
        if (mode === 'olderSum') {
          const d = ri(2, 9), y = ri(2, 10);
          return mk(`${a} is ${num(d)} years older than ${b}.`, `Let ${B} represent ${poss(b)} age now. Write and simplify an expression for the sum of their ages ${y} years from now.`,
            poly([[2, B], [d + 2 * y, '']]), [`(${B} + ${d} + ${y}) + (${B} + ${y})`], `E|ages|os${d},${y}`);
        }
        const k = ri(2, 4);
        const kas = k === 2 ? 'twice' : word(k) + ' times';
        if (mode === 'sum') {
          return mk(`${a} is ${kas} as old as ${b}.`, `Let ${B} represent ${poss(b)} age. Write and simplify an expression for the sum of their ages.`,
            poly([[k + 1, B]]), [`${k}${B} + ${B}`], `E|ages|s${k}`);
        }
        const y = ri(2, 10);
        const fut = mode === 'future';
        return mk(`${a} is ${kas} as old as ${b}.`, `Let ${B} represent ${poss(b)} age now. Write an expression for ${poss(a)} age ${y} years ${fut ? 'from now' : 'ago'}.`,
          poly([[k, B], [fut ? y : -y, '']]), [], `E|ages|${mode}${k},${y}`);
      },
      function coins() {
        const pair = pick([['quarters', 25, 'dimes', 10, 'q'], ['dimes', 10, 'nickels', 5, 'd'], ['quarters', 25, 'nickels', 5, 'q'], ['nickels', 5, 'pennies', 1, 'n']]);
        const Q = v(pair[4]);
        const n = oneName();
        if (chance(0.5)) {
          const a = ri(2, 9);
          return mk(`${n} has some ${pair[0]} and ${num(a)} more ${pair[2]} than ${pair[0]}.`, `Let ${Q} represent the number of ${pair[0]}. Write and simplify an expression for the total value of the coins in cents.`,
            poly([[pair[1] + pair[3], Q], [pair[3] * a, '']]), [`${pair[1]}${Q} + ${pair[3]}(${Q} + ${a})`], `E|coins|${pair[0]}${a}`);
        }
        const k = ri(2, 4);
        return mk(`${n} has some ${pair[0]} and ${K(k)} as many ${pair[2]} as ${pair[0]}.`, `Let ${Q} represent the number of ${pair[0]}. Write and simplify an expression for the total value of the coins in cents.`,
          poly([[pair[1] + pair[3] * k, Q]]), [`${pair[1]}${Q} + ${pair[3]}(${k}${Q})`], `E|coins|${pair[0]}k${k}`);
      },
      function purchase() {
        const it = pick([['notebooks', 'folders', [2, 5], [1, 2]], ['tacos', 'drinks', [2, 4], [1, 3]], ['shirts', 'hats', [10, 20], [8, 15]],
          ['packs of cards', 'card sleeves', [3, 6], [1, 4]], ['adult meals', 'kids meals', [8, 14], [4, 7]]]);
        const a = ri(...it[2]), b = ri(...it[3]), c = ri(1, 5);
        const N = v('n');
        const who = oneName();
        return mk(`${cap(it[0])} cost ${money(a)} each and ${it[1]} cost ${money(b)} each. ${who} buys ${N} ${it[0]} and ${num(c)} more ${it[1]} than ${it[0]}.`,
          `Write and simplify an expression for the total cost.`,
          poly([[a + b, N], [b * c, '']]), [`${a}${N} + ${b}(${N} + ${c})`], `E|purchase|${it[0]}|${a},${b},${c}`);
      },
      function trip() {
        const h1 = ri(2, 4), h2 = ri(1, 3), a = ris(5, 20, 5);
        const R = v('r');
        return mk(`A car travels at ${R} miles per hour for ${h1} hours. Then it speeds up by ${a} miles per hour and drives for ${h2} more hour${h2 > 1 ? 's' : ''}.`,
          `Write and simplify an expression for the total distance traveled.`,
          poly([[h1 + h2, R], [h2 * a, '']]), [`${h1}${R} + ${h2}(${R} + ${a})`], `E|trip|${h1},${h2},${a}`);
      },
      function tickets() {
        const a = ri(8, 15), b = ri(3, 7), k = ri(2, 4);
        const S = v('s');
        return mk(`Adult tickets to the school play cost ${money(a)} and student tickets cost ${money(b)}. The club sold ${S} student tickets and ${K(k)} as many adult tickets.`,
          `Write and simplify an expression for the total amount of money collected.`,
          poly([[b + a * k, S]]), [`${b}${S} + ${a}(${k}${S})`], `E|tickets|${a},${b},${k}`);
      },
      function practice() {
        const n = oneName();
        const a = ris(5, 30, 5), k = ri(2, 3);
        const M = v('m');
        const act = pick(['practiced piano', 'studied', 'ran', 'read', 'practiced soccer']);
        return mk(`On Monday ${n} ${act} for ${M} minutes. On Tuesday ${n} ${act} ${a} minutes longer than on Monday, and on Wednesday ${K(k)} as long as on Monday.`,
          `Write and simplify an expression for the total time over the three days.`,
          poly([[2 + k, M], [a, '']]), [`${M} + (${M} + ${a}) + ${k}${M}`], `E|practice|${a},${k}`);
      },
      function angles() {
        const X = v('x');
        const m = pick(['supp', 'comp', 'tri']);
        if (m === 'tri') {
          const k = ri(2, 3), a = ris(5, 30, 5);
          return mk(`In a triangle, the second angle is ${K(k)} the first angle, and the third angle is ${a}° more than the first angle.`,
            `Let ${X} represent the measure of the first angle. Write and simplify an expression for the sum of the three angles.`,
            poly([[2 + k, X], [a, '']]), [`${X} + ${k}${X} + (${X} + ${a})`], `E|angles|tri${k},${a}`);
        }
        if (chance(0.5)) {
          const tot = m === 'supp' ? 180 : 90;
          return mk(`Two angles are ${m === 'supp' ? 'supplementary' : 'complementary'}. One angle measures ${X}°.`, `Write an expression for the measure of the other angle.`,
            poly([[tot, ''], [-1, X]]), [], `E|angles|${m}`);
        }
        const tot = m === 'supp' ? 180 : 90;
        const a = ris(5, 20, 5);
        return mk(`Two angles are ${m === 'supp' ? 'supplementary' : 'complementary'}. One angle is ${a}° more than ${X}.`, `Write and simplify an expression for the measure of the other angle.`,
          poly([[tot - a, ''], [-1, X]]), [`${tot} ${MINUS} (${X} + ${a})`], `E|angles|${m}${a}`);
      },
      function isoPerim() {
        const a = ri(1, 6), k = pick([1, 2]);
        const S = v('s');
        const base = poly([[k, S], [-a, '']]);
        return mk(`An isosceles triangle has two equal sides that are each ${S} cm long. The base is ${num(a)} cm shorter than ${k === 1 ? 'one of the equal sides' : 'twice one of the equal sides'}.`,
          `Write and simplify an expression for the perimeter.`,
          poly([[2 + k, S], [-a, '']]), [`2${S} + (${base})`], `E|iso|${a},${k}`);
      },
      function squarePerim() {
        const a = ri(2, 9);
        const X = v('x');
        const inc = chance(0.6);
        return mk(`The side length of a square is ${num(a)} ${inc ? 'more' : 'less'} than ${X}.`, `Write and simplify an expression for the perimeter of the square.`,
          poly([[4, X], [4 * (inc ? a : -a), '']]), [`4(${poly([[1, X], [inc ? a : -a, '']])})`], `E|sq|${a},${inc}`);
      },
    ],
  };

  // ---------------------------------------------------------------------------
  // Public: generate one problem at a level. mode: 'mix' | 'context' | 'abstract'
  // ---------------------------------------------------------------------------
  function generate(level, mode) {
    const forms = FORMS.filter((f) => f.L === level);
    let useAbstract;
    if (level === 4) useAbstract = false;
    else if (mode === 'abstract') useAbstract = true;
    else if (mode === 'context') useAbstract = false;
    else useAbstract = chance(0.35);

    let p;
    if (useAbstract) {
      p = fromForm(pick(forms), null);
    } else {
      const ctxForms = forms.filter((f) => !f.abs);
      const sa = STANDALONE[level];
      // relation-with-context vs stand-alone templates
      const relWeight = ctxForms.length ? 0.55 : 0;
      if (Math.random() < relWeight) {
        const form = pick(ctxForms);
        let ci;
        do { ci = ri(0, CONTEXTS.length - 1); } while (form.shrink && CONTEXTS[ci]().bigger);
        p = fromForm(form, ci);
      }
      else p = pick(sa)();
    }
    p.topic = 'expr';
    p.level = level;
    p.label = 'Writing Expressions · Level ' + level;
    return p;
  }

  WU.Expressions = {
    generate,
    LEVELS: [
      { id: 1, name: 'Level 1 · One step', desc: '“five more than a number,” “twice its width,” unit rates & conversions' },
      { id: 2, name: 'Level 2 · Two steps', desc: '“three more than twice its width,” starting amount + rate' },
      { id: 3, name: 'Level 3 · Grouping & tricky wording', desc: '“twice the sum of…,” “subtracted from,” percents, sharing' },
      { id: 4, name: 'Level 4 · Multi-step contexts', desc: 'perimeter & area, consecutive integers, coins, ages, totals' },
    ],
    _CONTEXTS: CONTEXTS, _FORMS: FORMS, _STANDALONE: STANDALONE,
  };
})(window.WU);
