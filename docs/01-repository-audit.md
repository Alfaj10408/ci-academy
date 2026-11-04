# Repository audit — ECE 60141 Foundations of Computational Imaging (Bouman)

Audited 2026-11-04. Source of truth: `lecture05.pdf` … `lecture25.pdf`, the five midterm keys (2021–2025), and the textbook *Foundations of Computational Imaging* (335 pp.). Original course materials are never modified; extracted text lives in `text/` and is indexed in context-mode for retrieval.

## 1. Course topic inventory (lectures 5–25)

| Lec | Title | Book | Core objects |
|----|----|----|----|
| 05 | Discrete-Time Random Processes | 2.4 | WSS, autocovariance R(n), PSD via Wiener–Khinchin, reversibility, 2-D extension |
| 06 | Causal Prediction in Gaussian Models | 3.1–3.2 | causal predictor, prediction error independence, lower-triangular H, density via change of variables |
| 07 | 1-D Gaussian AR Models | 3.3 | time-invariant predictor h_n, white-noise-driven IIR model, R_X∗(δ−h)∗(δ−h_{−n}) = σ_C²δ, S_X = σ_C²/\|1−H\|², ML fit |
| 08 | 2-D Gaussian AR Models | 3.4 | raster order, causal window W_P, Toeplitz-block-Toeplitz, ML in 2-D |
| 09 | Noncausal Prediction in Gaussian Models | 4.1–4.2 | g_{n,n}=0, errors not white, precision matrix B = Γ⁻¹(I−G), sparsity ⇔ conditional independence |
| 10 | 1-D and 2-D GMRFs | 4.3–4.4 | neighborhood ∂n, homogeneous GMRF, B_{ij} = (δ_{i−j}−g_{i−j})/σ_NC², R_E = σ_NC²(δ−g), S_X = σ_NC²/(1−G) |
| 11 | GMRF vs. AR Models | 4.5–4.6 | σ_C²(δ−g) = σ_NC²(δ−h)∗(δ−h_{−n}), AR→GMRF by autocorrelation, Example 4.1 AR(1), pairwise cliques |
| 12 | MAP Image Restoration | 5.1–5.2 | Y = AX + W, ML inverts A and amplifies noise, Gaussian MAP = (AᵗA + σ_w²/σ_x² B)⁻¹Aᵗy, MMSE = MAP |
| 13 | Gradient Descent | 5.3 | step size, eigenmode convergence, frequency analysis h(ω), line search closed form |
| 14 | ICD, Preconditioning, CG | 5.4–5.5 | ICD step α = ((y−Ax)ᵗA_{*,i} − xᵗB_{*,i})/(‖A_{*,i}‖²+B_{ii}), fast ICD error state, preconditioning, CG |
| 15 | Non-Gaussian MRFs | 6.1–6.2 | pairwise Gibbs, potential ρ, influence ρ', Gaussian vs weak-spring, edges |
| 16 | Convex Potentials, Scale | 6.3–6.4 | L1/TV, GGMRF, Huber, QGGMRF, scale σ_x and its ML estimate |
| 17 | MAP with Non-Gaussian Priors | 7 | three steps, convexity ⇒ uniqueness, ICD line search, half-interval search |
| 18 | Surrogate Functions, MM | 8.1–8.2 | q(x;x') ≥ f(x), q(x';x') = f(x'), monotone decrease, convergence |
| 19 | Building the Quadratic Surrogate | 8.2–8.3 | maximum curvature, symmetric bound, a₂ coefficient |
| 20 | Reweighting, One-Step Line Search | 8.3–8.4 | surrogate weights, exact step along a direction |
| 21 | Constrained Optimization: Intuition | — | variable splitting, penalty, correction u, positivity clip |
| 22 | Lagrangian Duality, Augmented Lagrangian | — | Lagrangian, dual function concave, strong duality, scaled form u = λ/a |
| 23 | Proximal Maps and Shrinkage | — | prox definition, stake-and-spring, L1 three cases, shrinkage, ICD as shrinkage |
| 24 | Variable Splitting and ADMM | — | ADMM x/v/u updates, TV via splitting, convex constraints as a clip |
| 25 | Plug-and-Play | — | F and H prox maps, PnP-ADMM, denoiser training, nonexpansive, Moreau |

## 2. Exam question inventory (all five papers come with the instructor's key)

| Year | Q | Pts | Title | Tested skills |
|----|----|----|----|----|
| 2021 | Q2 | 35 | MAP Estimation | forward model, p(y\|x), ML as β→0, prior as β→∞ |
| 2021 | Q3 | 30 | Non-causal Models | AR(1) PSD, g(n), σ_NC², is it an MRF, precision matrix B incl. boundary rows |
| 2021 | Q4 | 30 | Surrogate Functions | sketch, monotonicity proof, convergence, quadratic surrogate of \|x\|, one MM update |
| 2022 | Q2 | 35 | GMRF precision matrix | name, partition z, neighbor meaning, conditional mean/variance from a_k |
| 2022 | Q3 | 35 | Augmented Lagrangian & ADMM | splitting, L(x,v;u), effect of u, algorithm with F,H, positivity clip |
| 2022 | Q4 | 30 | Surrogate for ½‖y−Ax‖² | gradient, Hessian, Taylor, a = λ_max(AᵗA), MM = gradient descent |
| 2023 | P1 | 22 | Emotional Equations | interpret the proximal map |
| 2023 | P2 | 36 | MAP Estimation (Gaussian prior) | forward model, gradient, closed form, GD pseudocode, ICD update, ICD pseudocode |
| 2023 | P3 | 42 | Surrogate for Poisson NLL | NLL, convexity, ML, derivatives, max-curvature surrogate on θ ≥ 1 |
| 2024 | P1 | 30 | ICD update / line search | d and α* for GD and CD, descent condition |
| 2024 | P2 | 48 | Surrogates of \|x\|, \|x−z\|, Σ\|x−x_k\| | sketches, general surrogates, MM algorithm |
| 2024 | P3 | 24 | Proximal Maps | existence outline, uniqueness, closed form for quadratic, MAP interpretation |
| 2025 | P1 | 35 | Causal and Non-Causal MRFs | S_X in (σ_C²,h) and (σ_NC²,g), relate, derive g_n and σ_NC² |
| 2025 | P2 | 21 | Shrinkage Operator | soft threshold N=1, N>1, meaning |
| 2025 | P3 | 21 | Proximal Maps as MAP | forward model, prior, iterating H, training a denoiser |
| 2025 | P4 | 35 | Contraction Mappings | swap matrix: contraction? nonexpansive? Mann iteration, limit = projection |

## 3. Topic-to-question mapping and repeated patterns

| Pattern | Years | Lectures |
|----|----|----|
| Surrogate / majorization-minimization | 2021 Q4, 2022 Q4, 2023 P3, 2024 P2 (**4/5**) | 18, 19, 20 |
| MAP estimate ↔ forward model ↔ prior | 2021 Q2, 2023 P2, 2024 P3d, 2025 P3 (**4/5**) | 12, 15, 16 |
| Proximal map / shrinkage / ADMM | 2022 Q3, 2023 P1, 2024 P3, 2025 P2, P3 (**4/5**) | 21–24 |
| Causal AR ↔ noncausal GMRF, precision matrix | 2021 Q3, 2022 Q2, 2025 P1 (**3/5**) | 7, 9, 10, 11 |
| Gradient descent / ICD / line search | 2023 P2, 2024 P1 (2/5) | 13, 14, 17 |
| Nonexpansive maps, fixed points | 2025 P4 (1/5, new) | 25 |

Quadratic surrogate of \|x\| recurs verbatim (2021 Q4.4, 2024 P2c). The AR(1) → GMRF conversion recurs (2021 Q3, 2025 P1, lecture 11 Example 4.1).

## 4. Prerequisite dependency graph

```
complex numbers & Euler ──► |1−ρe^{−jω}|² = 1−2ρcosω+ρ² ──► AR power spectrum
DTFT of shifted deltas ───► H(ω), G(ω) ───────────────────► PSD matching
convolution & time reversal ► (δ−h)∗(δ−h_{−n}) autocorrelation ► AR→GMRF
Gaussian vector density ──► precision matrix B = R⁻¹ ────► GMRF conditionals (2022 Q2)
matrix calculus (∇ of quadratic form) ► gradient, Hessian ► GD, ICD, line search, surrogates
eigenvalues / PSD matrices ► a = λ_max(AᵗA), convexity ──► surrogate validity
1-D calculus (derivative, convexity) ► ρ'(Δ), max curvature ► surrogates of |x|, Poisson NLL
case analysis of |x| ──────► shrinkage, L1 prox ───────────► ADMM / PnP
Lagrange multipliers ─────► augmented Lagrangian ─────────► ADMM
fixed-point / contraction ► nonexpansive, Mann iteration ──► PnP convergence
```

## 5. Prioritized learning roadmap

1. **Signals foundation → AR/GMRF** (lectures 5, 7, 9, 10, 11). First module. Builds DTFT, complex modulus, convolution, autocorrelation, precision matrices. Exam targets: 2021 Q3, 2025 P1, 2022 Q2.
2. **Surrogates / MM** (18–20). Highest exam frequency. Targets: 2021 Q4, 2024 P2, 2022 Q4, 2023 P3.
3. **MAP & optimization** (12–14, 17). Targets: 2023 P2, 2024 P1, 2021 Q2.
4. **Proximal maps, ADMM, PnP** (21–25). Targets: 2022 Q3, 2024 P3, 2025 P2–P4.

## 6. Gaps and provenance

- All five midterms include the instructor's key, so no exam solution is independently derived. Where the PDF-to-text extraction garbles a matrix (2021 Q3.6), the app recomputes it numerically and labels the recomputation.
- 2025 P4e key is present but partly garbled in extraction; the app states the result (projection onto the diagonal) and verifies it numerically.
- No homework, no code and no git history exist in the repository. The app is a fresh Vite + React + TypeScript project under `academy/`.
- Lectures 0–4 (probability, estimation basics) were excluded at the student's request; prerequisite lessons inside the app cover what is needed.
