# Warm-Up Builder

A small website that builds "Do Now" / "Warm Up" problem sets for the start of class.
Choose how many problems you want from each topic, present them as a full-screen slideshow, or print a handout.
It's plain HTML, CSS, and JavaScript with no build step and no server.

## Using it

- **Open locally:** double-click `index.html`. It works straight from the file.
- **Host it for free:** turn on GitHub Pages for this repository
  (Settings → Pages → Deploy from a branch → pick the branch, `/ (root)`).

1. Pick a title (Do Now, Warm Up, Bell Ringer, or your own) and a date.
2. Set the number of problems for each topic, and check the difficulty levels or problem types you want.
   - Click a topic's arrow (▾) or its name to collapse the card to a one-line summary, such as "3 problems · 2 of 4 levels checked". The site remembers which cards are collapsed.
   - A topic set to 0 also shrinks out of the way.
   - Use the ▲▼ buttons to change the order the topics appear in.
3. Click **Build warm-up**. The preview shows every problem with its answer.
   - **↻ Swap** replaces one problem with a new one of the same type.
   - **✕ Remove** takes one problem out. The rest stay the same and renumber, and **Undo** puts it back.
   - Changes show up on the slides and the printout.
4. Click **▶ Present** for the slideshow, or **🖨 Print** for a handout.

### Presentation mode
- Layouts: all problems on one slide, or one problem per slide.
- Text automatically resizes to fill the screen.
- Keys: `←` / `→` move between slides, `A` shows or hides answers, `D` reveals hidden diagrams as a hint, `T` starts or pauses the timer, `F` toggles full screen, `Esc` exits.

### Printing
- Work space under each problem: none, small, medium, or large.
- **Half sheets:** prints two copies per page with a cut line, so one page makes two handouts.
- An optional answer key prints on its own page.

## Topics

### Writing Expressions
| Level | What it targets | Examples |
|---|---|---|
| 1 · One step | single operation | "five more than a number", "twice its width", unit rates, unit conversions, sharing equally |
| 2 · Two steps | multiply then add/subtract | "the length is three more than twice its width", sign-up fee + monthly rate, a candle that burns down |
| 3 · Grouping & tricky wording | parentheses, order-sensitive phrases | "twice the sum of…", "7 subtracted from…", percent discount/tax, averages, splitting a bill plus a fee |
| 4 · Multi-step contexts | build and simplify | rectangle perimeter/area, consecutive integers, coin values, ages in *n* years, total cost, triangle angle sums |

**Wording** applies to levels 1–3:
- *Real-world situations:* about 35 contexts, including lengths, ages, money, time, points, weights, tickets, and angles.
- *"A number" phrases:* classic verbal phrases with no story.
- *Mix:* both kinds.

Answers list accepted equivalent forms, for example `2w + 3` or `3 + 2w`.

### Pythagorean Theorem
| Type | Example |
|---|---|
| Whole-number answers | Pythagorean triples: find a leg or the hypotenuse |
| Answers in simplest radical form | legs 4 and 6 → 2√13 |
| Radicals in the given information | legs √5 and 2√3; isosceles right triangle with legs 3√2 |
| Sides as expressions: linear | one leg is 5, hypotenuse is 1 more than the other leg (the x² terms cancel) |
| Sides as expressions: quadratic | legs x and x + 7 with hypotenuse 13; "2 more than twice the shorter leg"; rectangle and TV diagonals |
| Real-world word problems | ladders, TVs, ramps, kites, ball diamonds; some rounded to the nearest tenth |

**Triangle diagrams** (to help students move toward drawing their own):
- Choose **Show on every problem**, **Show on every other problem**, or **None — students draw & label their own**.
  You can switch after building and the problems stay the same. Only how each one is shown changes.
- Each Pythagorean problem in the preview has a **△ Diagram on/off** button to control it one at a time.
- Without a diagram, a problem is written out in words and tells students to *draw and label a diagram*.
  With one, it shows a labeled triangle (or rectangle). Word problems can have diagrams too.
- During a slideshow, press **D** (or click **Diagrams**) to briefly show the hidden diagrams as a hint, then press it again to hide them.

The answer key shows the equation and the solution steps.

### Factoring
All problems say **Factor completely**, and the answer key gives the fully factored form.
Some answers also show an intermediate step, such as the grouping step or the GCF pulled out first.

| Type | Example |
|---|---|
| Greatest common factor | 6x³ − 9x² + 12x → 3x(2x² − 3x + 4), including two-variable terms |
| Trinomials with a = 1 | x² + 7x + 12 → (x + 3)(x + 4), including perfect squares |
| Difference of two squares | 9x² − 25 → (3x + 5)(3x − 5); x⁴ − 16 → (x² + 4)(x + 2)(x − 2) |
| Trinomials with a ≠ 1 | 6x² + 7x − 3 → (2x + 3)(3x − 1) |
| Sum & difference of cubes | 8x³ − 27 → (2x − 3)(4x² + 6x + 9) |
| Grouping (degree 3 or higher) | x³ + 3x² − 4x − 12 → (x + 3)(x + 2)(x − 2), and degree 4–5 polynomials |
| Quadratic form | x⁴ − 13x² + 36 → (x + 2)(x − 2)(x + 3)(x − 3), and some x⁶ + bx³ + c |

The **Sometimes include a GCF to factor out first** option puts a common factor in front of some trinomial, square, cube, and grouping problems, for example 2x² − 50 or 3x³ + 24.
Every problem is built by multiplying its factors together, so the answer always matches.

### Simplifying Radicals
| Type | Example |
|---|---|
| Square roots of numbers | √72 → 6√2 |
| With a coefficient | 3√48 → 12√3; (4√18) ÷ 6 → 2√2 |
| Monomials with variables | √(50x³y⁴) → 5xy²√(2x) (variables assumed positive) |
| Cube roots | ∛54 → 3∛2; ∛(16x⁵) → 2x∛(2x²) |
| Rationalize the denominator | 6/√3 → 2√3; √(5/8) → √10/4; 3/∛2 → 3∛4/2 |
| Rationalize with a conjugate | 4/(3 − √5) → 3 + √5; (5 + √3)/(5 − √3); 4/(√2 + √7) |
| Imaginary numbers | √−48 → 4i√3; √−6 · √−10 → −2√15; 3/√−10; i²³ → −i |
| Add, subtract & multiply | √50 + √18 → 8√2; 2√3 · 5√6 → 30√2; (2 + √3)² |

## Avoiding repeats
Problems are generated from templates, contexts, and numbers chosen at random, which gives thousands of distinct problems per level.
Each warm-up you present or print is saved in **Saved warm-ups**, so you can reload it later (for absent students, say).
Its problems are also added to a no-repeat history, and the builder skips anything used in the last year.
Within one warm-up, it also tries to avoid using the same template twice.
History is stored in your browser on that computer. **Clear history** resets it.

### Order
- **Grouped by topic:** topics appear in the order of the cards on the setup page, and within a topic, problems run from the first checked type to the last.
- **Shuffle everything together:** mixes all the problems in random order.

When you ask for fewer problems than the number of types you checked, the types used are picked at random.

## Files
```
index.html           page layout
css/style.css        styles for the screen, the slideshow, and printing
js/util.js           random helpers, number words, fraction and radical rendering
js/expressions.js    Writing Expressions problem bank (levels 1–4)
js/pythagorean.js    Pythagorean Theorem problem bank (6 types)
js/factoring.js      Factoring problem bank (7 types)
js/radicals.js       Simplifying Radicals problem bank (8 types)
js/diagram.js        right-triangle and rectangle diagrams
js/app.js            settings, preview, slideshow, printing, history
```

To add a new context or template, add an entry to `CONTEXTS`, `FORMS`, or `STANDALONE` in `js/expressions.js`, or to `WORD` in `js/pythagorean.js`.
