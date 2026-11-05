# Concept-to-visualization plan

Scope: lectures 5–25. Each row says what the learner manipulates, what is computed live, and which exam question the visualization serves. Status: **built** = in `academy/`, **planned** = next.

## Module 1 — Causal AR → noncausal GMRF (built)

| Concept | Lecture | Interaction | Live computation | Exam |
|---|---|---|---|---|
| AR(1) as white noise through feedback | 7 p.8–10 | ρ slider, seed | sample path from the same E_n for every ρ | 2021 Q3, 2025 P1 |
| Causal vs noncausal prediction window | 6, 9 p.7 | play/step over n, mode toggle | prediction, error, running mean-square vs σ_C², σ_NC² | 2025 P1 |
| Power spectrum, both parameterizations | 7 p.12, 10 p.15, 11 p.9 | ρ, σ_C², ω marker | S_X from (h, σ_C²) and (g, σ_NC²) overlaid; |1−H|² and 1−G | 2021 Q3.1, 2025 P1a–c |
| Filters h, g and the autocorrelation bridge | 11 p.6–7 | ρ | stems of h_n, g_n, (δ−h)∗(δ−h_{−n}) | 2021 Q3.2, 2025 P1d |
| Precision matrix of a finite block | 9 p.17–18, 10 p.9 | ρ, σ_C² | 6×6 heatmap, interior and boundary entries | 2021 Q3.5–3.6, 2022 Q2 |
| Equations with current values | — | all sliders | every quantity recomputed and flashed on change | — |

Grading: numerical equivalence at 24 random points (mathjs), LaTeX-ish input accepted; Kronecker delta supported for sequence answers. Limitation labelled in the UI.

## Module 2 — Surrogate functions and MM (built; 4/5 exam years)

| Concept | Lecture | Interaction | Live computation | Exam |
|---|---|---|---|---|
| Surrogate touches at x′, lies above f | 18 p.5–7 | drag x′ | q(x;x′) for ½(x−2)²+|x|, |x|, Poisson NLL, Huber MAP, Σ|x−x_k| | 2021 Q4.1, 2024 P2b/e |
| MM iteration, monotone decrease | 18 p.9–10, 13 | play/step/reset | iterates on the curve, C_k stems vs f(x*), the chain (8.4) with numbers | 2021 Q4.2–4.3 |
| Quadratic surrogate of |x|: a = 1/(2|x′|) | 19 p.8 | x′ slider, presets | a, b, x̃* = 2|x′|/(1+|x′|); undefined at x′ = 0 | 2021 Q4.4–4.6, 2024 P2c–h |
| Maximum curvature vs symmetric bound | 19 p.7–10 | Δ′ slider, bound toggle | both Huber surrogates overlaid; a₂ = ρ′(Δ′)/Δ′; steps-to-converge comparison | 2023 P3g, lecture 19 |
| Surrogate for ½‖y−Ax‖² with a = λ_max | 19, 13 | 2×2 A and y editor, K slider | eigenvalues, GD trajectory = MM, ∇f(x_K), LS solution | 2022 Q4 |

Grading additions: `upToConstant: 'x'` compares differences in x so a dropped shift c(x′) is accepted; primes map to `xp`/`thetap`. Verified independently with NumPy (touch/domination grids, 2021 Q4.6 = 1, 2024 P2h step from 3 = 2.25 → median 1, 2023 P3 a = y vs a = y/θ′² counterexample, λ_max = 3+2√2 for A = [[1,2],[0,1]]).

## Module 3 — MAP, gradient descent, ICD (built; 2021 Q2, 2023 P2, 2024 P1, 2022 Q4)

| Concept | Lecture | Interaction | Live computation | Exam |
|---|---|---|---|---|
| Likelihood × prior = posterior; β from ML to x* | 12 p.6, 10 | y, σ², β sliders | scalar MAP (y/σ² + 2βx*)/(1/σ² + 2β), ML and x* marked | 2021 Q2.3, 2.5–2.7 |
| Inverting the blur amplifies noise; h(ω) stays positive | 12 p.8–9, 13 p.13 | λ slider | a(ω), 1/a(ω), h(ω) = |a|² + λ(1−g), h_max, h_min, κ, 2/h_max | 2021 Q2.3 |
| Iterations for 99% vs frequency: GD closed form vs ICD simulated | 13 p.16, 14 p.11 | α, λ | (1−αh)^k = 0.01; ICD sweeps on an injected cosine mode (N = 32) | 2023 P2d, 2024 P1 |
| 1-D deconvolution iterate by iterate | 13 p.5, 14 p.8 | method, α, play/step | GD / steepest / ICD / CG on Example 5.1, cost vs f(x̂) | 2023 P2d–f |
| 2-D geometry of the four methods | 13 p.20, 14 p.13–15 | 2×2 A, λ, α, K | level curves from the eigen-decomposition of H; paths; CG in two steps | 2024 P1, 2022 Q4.5 |

Grading additions: matrix mode (`matVars`, `derived`) evaluates vector/matrix answers at random matrices; normalizer handles ^t, A_{*,i}, B_{i,i}, x_i, ‖·‖, (·)^{−1}, implicit products. Verified independently with NumPy: ∇f(0) = (−2,−2), x̂ = (20/19, 16/19), ICD step 4/3, line search 8/17 (= brute-force argmin), no-blur update 10/3, 2024 P1b general formula = numeric argmin at random 3×3, P1d = P1b with d = e_i, P1e sign condition, circulant eigenvalues = h(ω_k) with h_max = 4 and 90 GD iterations at ω = π, ICD 19 sweeps at ω = π, CG exact in 2 steps. Note: the slide's h_min = 1/5 is h(π); the true minimum is 0.1975 at cos ω = −0.95.

## Module 4 — Proximal maps, ADMM, Plug-and-Play (built; 2022 Q3, 2023 P1, 2024 P3, 2025 P2, 2025 P4)

| Concept | Lecture | Interaction | Live computation | Exam |
|---|---|---|---|---|
| Proximal map as stake-and-spring; F as an action | 23 p.5, 25 p.9–10 | z, σ² sliders, f = |x| or ½(x−2)²+|x| | f, spring energy, sum, F(z); the curve F(z) vs z | 2023 P1, 2024 P3 |
| Shrinkage: three cases, componentwise | 23 p.11–13 | λ | S_λ(y) plot; noisy sparse vector → S_λ(y) | 2025 P2 |
| ADMM with x = v and a clip | 21 p.9–15, 24 p.17–20 | a, play/step | x, v, u iterates, gap ‖x−v‖, u → λ*/a = y₀/a on active pixels | 2022 Q3.3–3.5 |
| Total variation ADMM | 24 p.12–16 | λ, a, play/step | quadratic x update, shrinkage v update, cost and gap | lecture 24 |
| Lagrange multiplier as a price; augmented Lagrangian | 22 p.6–7, 14–16 | λ, a | x(λ) sliding to the line, λ* = ½(y₁−y₂+1), iterates for any a | lecture 22 |
| Swap map: plain vs Mann iteration | 25 p.19, 2025 P4 key | α, x⁽⁰⁾ | reflection orbit vs convergence to the diagonal projection | 2025 P4 |

Grading: scalar mode for shrinkage forms (sign/abs/max accepted), matrix mode for 2024 P3c (Λ → Lambda). Verified independently with NumPy: shrinkage = grid argmin at five points, prox of ½(x−2)²+|x| at z = 4 is 2.5, scalar positivity ADMM x₁ = u₁ = −½ and u → −1 (a = 1), vector ADMM → max(y, 0) with u → y/a for a = ½, 1, 10, 2024 P3c closed form has zero gradient at random 3×3, λ* = 1.5 and the augmented Lagrangian reaches it for a = ½, 2, 10, TV ADMM satisfies the subgradient optimality condition (free subgradients within [−1, 1]) and gives the same limit for a = 1 and 5, swap map ratio exactly 1, period-2 orbit, Mann → (2, 2) for α = ¼, ½, 0.9. A NumPy run caught one error before release: the lab had labelled the multiplier limit y₀ instead of y₀/a.

## Prerequisite refreshers (built)

Twenty-four short lessons on `#/prereqs`, grouped: signals and systems (sequences and deltas, Euler, DTFT, convolution of deltas, convolution and LSI filters, time reversal, stationarity and white noise, PSD, reading a spectrum, Toeplitz/circulant and the DFT, 2-D random fields and the DSFT), probability (Gaussian density, precision matrix), linear algebra and calculus (gradients, eigenvalues, 1-D convexity, sketching functions), graphs and MRFs (neighborhood systems and cliques, Markov property and the zero pattern of B, Gibbs energy and influence functions), optimization (convexity, case analysis, Lagrangian, fixed points). Each lesson names its lectures (5, 7, 8, 10, 13, 15, 16 for the new ones) and ten carry a one-question self-check whose attempts are tagged with the lesson id so the weakness analysis can recommend it. Each card opens with a one-line analogy, then an interactive picture where one helps (seven SVG widgets in `components/prereq-widgets.tsx`), three to five math lines, an exam pointer, the self-check, and the full lesson folded away; the page is tabbed by group with a progress strip. The DOM leak scan now mounts the page as well.
