# CI Academy — Computational Imaging Mathematics (ECE 60141, Bouman)

Interactive learning application built from the course PDFs in the parent folder. Original course materials are never modified; extracted text lives in `../text/`, the audit in `../docs/`.

## Run

```bash
cd academy
npm install
npm run dev        # http://localhost:5173
```

```bash
npm test           # math core + grading tests (bun)
npm run build      # type-check and production build
bun --preload ./scripts/css-stub.ts scripts/ssr-smoke.tsx   # render every page/step without a browser; flags KaTeX errors, NaN and raw-LaTeX leaks
npm run lint:tex   # render every $…$ segment in the source (hints, keys, solutions) with KaTeX throwOnError
npm run lint:dom   # mount every module and the prerequisite map in happy-dom, click through tabs, hints, options, steps and exams; fail on any visible raw LaTeX
```

## Layout

- `src/math/argmrf.ts` — AR(1)/AR(P) ↔ GMRF formulas, sample-path generation, precision matrix. Pure functions, unit-tested against a numerical matrix inverse.
- `src/math/surrogate.ts` — surrogates of |x|, |x−z|, Σ|x−x_k|, the Poisson NLL, Huber (maximum curvature and symmetric bound), ½‖y−Ax‖² with a = λ_max; generic MM driver; every surrogate is checked on a grid for touch and domination in the tests.
- `src/math/mapopt.ts` — MAP cost/gradient/Hessian, closed form, gradient descent, exact line search, ICD (slow and fast), conjugate gradient, Example 5.1 circulant model with h(ω), scalar MAP picture, 2-D level curves.
- `src/math/prox.ts` — shrinkage, clips, proximal maps (grid and closed form for ½‖y−Ax‖²_Λ), ADMM with x = v, total-variation ADMM on a 1-D signal, the lecture-22 line-constraint example, the swap map and Mann iteration.
- `src/math/grade.ts`, `src/math/latex.ts` — answer grading by numerical equivalence at random sample points; LaTeX-ish input normalizer. Matrix mode (`matVars`, `derived`) grades vector/matrix answers at random matrices with its own normalizer (`^t` transpose, `A_{*,i}`, `‖v‖`, `(…)^{-1}`, implicit products).
- `src/data/` — lecture inventory (5–25), exam question inventory (2021–2025, original wording and instructor keys), prerequisite refreshers (`prereqs.ts`: 24 lessons in five groups — signals and systems, probability, linear algebra and calculus, graphs and MRFs, optimization. Each has a one-line analogy (`hook`), three to five math lines (`bullets`), an exam pointer (`why`), the folded full lesson, and for ten of them a self-check tagged with the lesson id and an interactive picture from `components/prereq-widgets.tsx`: delta stacks, a sliding stencil, AR autocovariance/spectrum, circulant eigenvalues vs DFT, a clickable neighbourhood grid with the zero pattern of B, spring force balance, and a sketch gallery).
- `src/modules/ar-gmrf/` — Module 1 pathway: prerequisites → intuition → four-panel lab → derivation → worked example → guided practice → independent AR(2) problem → timed 2021 Q3 → feedback.
- `src/modules/surrogate/` — Module 2 (surrogate functions / MM): same nine steps; worked 2021 Q4 + 2024 P2d–f, guided 2023 P3 (y = 3), independent Σ|x−x_k| / Huber a₂ / λ_max, timed 2021 Q4.
- `src/modules/mapopt/` — Module 3 (MAP, gradient descent, ICD): worked 2023 P2 + 2022 Q4 (graded), guided 2024 P1, independent numeric 2×2 model, timed 2023 P2 or 2021 Q2.
- `src/modules/prox/` — Module 4 (proximal maps, ADMM, PnP): worked 2022 Q3 + 2024 P3 (graded) + 2023 P1, guided 2025 P2 + 2025 P4, independent numeric problems, timed 2022 Q3 / 2024 P3 / 2025 P4.
- `src/pages/` — lecture navigator, prerequisite map, exam trainer, progress/weakness dashboard.
- `src/store/progress.ts` — localStorage-backed attempts, completions, exam sessions; weakness analysis per prerequisite tag.

## Adding a module

1. Put pure math in `src/math/<name>.ts` with a `bun:test` file.
2. Create `src/modules/<name>/` with a `constants.ts` (module id), step components, and an `index.tsx` listing steps with the completion ids they own.
3. Register the route in `src/App.tsx` and set `module: '<name>'` on the relevant `exams.ts` and `course.ts` entries.
4. Add the module's cases to `scripts/ssr-smoke.tsx`.

## Grading honesty

Expression answers are compared numerically to the reference at 24 pseudo-random points (relative tolerance 1e-7). This accepts any algebraically equivalent form but is not a symbolic proof; the UI says so. Surrogate answers may be graded up to an additive term that is constant in the argument variable (`upToConstant: 'x'`), because a surrogate is defined up to a shift c(x′). Primes are accepted as `x'`, `x′`, `x^\prime` or `xp`. Free-text exam parts are self-graded against the instructor key.

## Visual design

`src/styles.css` is a token-based design system: every colour derives from one accent hue (`--hue`) in OKLCH, with light and dark palettes selected by `data-theme` on `<html>` (or the system preference when unset). The token set and card/button language are adapted from [Fuwari](https://github.com/saicaca/fuwari) (MIT, © 2024 saicaca); the app itself is not a blog template. `src/store/theme.ts` persists hue and mode under its own localStorage key (`ci-academy-theme-v1`), separate from learning progress, and `index.html` applies the saved theme before first paint. Legacy variable names (`--bg`, `--panel`, `--accent`, …) are aliases of the new tokens so components and SVG plots keep working. Animations are light and disabled under `prefers-reduced-motion`.

## Rendering math without leaks

All math goes through `Tex` (KaTeX) or `MathText` (`$…$` segments inside prose). Plain JSX text and SVG plot labels cannot render LaTeX, so they use words or Unicode subscripts (Cₖ, Xₙ₋₁). Three checks keep this honest: the SSR smoke test strips KaTeX output and fails on any visible `$`, `\cmd`, `_{` or `^{`; `npm run lint:tex` renders every `$…$` segment in the source with `throwOnError`; and `npm run lint:dom` mounts each module in happy-dom and clicks through every tab, hint, option, step and exam flow, scanning the visible text after each click (this is what catches text that only appears after interaction). JSX attribute strings keep doubled backslashes, which `Tex` folds before rendering.
