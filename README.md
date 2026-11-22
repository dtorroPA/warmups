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
3. Click **Build warm-up**. The preview shows every problem with its answer. Click **↻ Swap** on any problem to replace it.
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

## Avoiding repeats
Problems are generated from templates, contexts, and numbers chosen at random, which gives thousands of distinct problems per level.
Each warm-up you present or print is saved in **Saved warm-ups**, so you can reload it later (for absent students, say).
Its problems are also added to a no-repeat history, and the builder skips anything used in the last year.
Within one warm-up, it also tries to avoid using the same template twice.
History is stored in your browser on that computer. **Clear history** resets it.

## Files
```
index.html           page layout
css/style.css        styles for the screen, the slideshow, and printing
js/util.js           random helpers, number words, fraction and radical rendering
js/expressions.js    Writing Expressions problem bank (levels 1–4)
js/pythagorean.js    Pythagorean Theorem problem bank (6 types)
js/diagram.js        right-triangle and rectangle diagrams
js/app.js            settings, preview, slideshow, printing, history
```

To add a new context or template, add an entry to `CONTEXTS`, `FORMS`, or `STANDALONE` in `js/expressions.js`, or to `WORD` in `js/pythagorean.js`.
