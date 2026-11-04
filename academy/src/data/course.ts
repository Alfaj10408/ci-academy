export interface Lecture {
  n: number
  title: string
  chapter: string
  ideas: string[]
  tags: string[]
  module?: string
}

export const lectures: Lecture[] = [
  { n: 5, title: 'Discrete-Time Random Processes', chapter: '2.4', ideas: ['Stationary (WSS) processes and the autocovariance $R(n)$', 'Power spectral density $S_X(e^{j\\omega}) = \\sum_n R(n)e^{-j\\omega n}$ (Wiener–Khinchin)', 'Stationary Gaussian processes are reversible'], tags: ['psd', 'dtft'], module: 'ar-gmrf' },
  { n: 6, title: 'Causal Prediction in Gaussian Models', chapter: '3.1–3.2', ideas: ['The causal predictor is linear in the past', 'Prediction errors are independent of the past and of each other', 'Lower-triangular $H$; density by change of variables'], tags: ['gaussian-density'] },
  { n: 7, title: '1-D Gaussian Autoregressive Models', chapter: '3.3', ideas: ['Time invariance: prediction is convolution with $h_n$', 'White-noise-driven IIR model $X_n = E_n + \\sum_i h_iX_{n-i}$', '$R_X(n) * (\\delta_n - h_n) * (\\delta_n - h_{-n}) = \\sigma_C^2\\delta_n$ and $S_X = \\sigma_C^2/|1 - H(\\omega)|^2$', 'ML estimate of $(h, \\sigma_C^2)$'], tags: ['dtft', 'convolution', 'psd'], module: 'ar-gmrf' },
  { n: 8, title: '2-D Gaussian AR Models', chapter: '3.4', ideas: ['Raster order and the causal 2-D window', 'Toeplitz-block-Toeplitz structure', 'Formally identical ML results'], tags: ['convolution'] },
  { n: 9, title: 'Noncausal Prediction in Gaussian Models', chapter: '4.1–4.2', ideas: ['Predict each value from all others; $g_{n,n} = 0$', 'Errors are not white', 'Precision matrix $B = \\Gamma^{-1}(I - G)$; zeros of $B$ ⇔ conditional independence'], tags: ['precision-matrix', 'gaussian-density'], module: 'ar-gmrf' },
  { n: 10, title: '1-D and 2-D Gaussian Markov Random Fields', chapter: '4.3–4.4', ideas: ['Neighborhood $\\partial n$ and locality of prediction', 'Homogeneous GMRF: $B_{ij} = (\\delta_{i-j} - g_{i-j})/\\sigma_{NC}^2$', '$R_E(n) = \\sigma_{NC}^2(\\delta_n - g_n)$, $S_X = \\sigma_{NC}^2/(1 - G(\\omega))$'], tags: ['precision-matrix', 'psd'], module: 'ar-gmrf' },
  { n: 11, title: 'GMRF vs. AR Models', chapter: '4.5–4.6', ideas: ['$\\sigma_C^2(\\delta_n - g_n) = \\sigma_{NC}^2(\\delta_n - h_n) * (\\delta_n - h_{-n})$', 'AR→GMRF by autocorrelation; GMRF→AR needs factorization', 'Example 4.1: AR(1) as a GMRF'], tags: ['convolution', 'time-reversal'], module: 'ar-gmrf' },
  { n: 12, title: 'MAP Image Restoration', chapter: '5.1–5.2', ideas: ['$Y = AX + W$; ML inverts $A$ and amplifies noise', 'MAP = data fit + quadratic image penalty', 'Gaussian case: MAP = MMSE, $\\hat x = (A^tA + \\sigma^2B)^{-1}A^ty$'], tags: ['matrix-calculus', 'gaussian-density'], module: 'mapopt' },
  { n: 13, title: 'Gradient Descent Optimization', chapter: '5.3', ideas: ['Step-size dilemma; convergence of eigenmodes $(1 - \\alpha h_i)^k$', 'Frequency analysis when $A$ is LSI: $h(\\omega) = |a(\\omega)|^2 + \\lambda(1 - g(\\omega))$', 'Line search closed form $\\alpha = \\|d\\|^2/\\|d\\|_H^2$'], tags: ['eigenvalues', 'matrix-calculus'], module: 'mapopt' },
  { n: 14, title: 'ICD, Preconditioning, Conjugate Gradient', chapter: '5.4–5.5', ideas: ['ICD: one pixel at a time; the step $\\alpha$', 'Fast ICD keeps the error $e = y - Ax$ as state', 'Preconditioning and CG'], tags: ['matrix-calculus'], module: 'mapopt' },
  { n: 15, title: 'Non-Gaussian MRFs, Potential and Influence Functions', chapter: '6.1–6.2', ideas: ['Pairwise Gibbs distribution is an MRF', 'Potential $\\rho(\\Delta)$ and influence $\\rho^\\prime(\\Delta)$', 'Nonconvex potentials define edges but destabilize MAP'], tags: ['convexity'] },
  { n: 16, title: 'Convex Potentials and the Scale Parameter', chapter: '6.3–6.4', ideas: ['L1 / total variation, GGMRF, Huber, QGGMRF', 'Scale $\\sigma_x$ and its ML estimate'], tags: ['convexity'] },
  { n: 17, title: 'MAP Estimation with Non-Gaussian Priors', chapter: '7', ideas: ['Convexity ⇒ unique, stable MAP', 'ICD with non-quadratic prior; half-interval search'], tags: ['convexity', 'calculus-1d'] },
  { n: 18, title: 'Surrogate Functions and the MM Algorithm', chapter: '8.1–8.2', ideas: ['$q(x;x^\\prime) \\ge f(x)$, $q(x^\\prime;x^\\prime) = f(x^\\prime)$', 'Monotone decrease and convergence'], tags: ['calculus-1d', 'convexity'], module: 'surrogate' },
  { n: 19, title: 'Building the Quadratic Surrogate', chapter: '8.2–8.3', ideas: ['Maximum curvature method', 'Symmetric bound method and the coefficient $a_2$'], tags: ['calculus-1d'], module: 'surrogate' },
  { n: 20, title: 'Reweighting and the One-Step Optimal Line Search', chapter: '8.3–8.4', ideas: ['Reweighting recasts the prior', 'One exact step along a direction'], tags: ['matrix-calculus'], module: 'surrogate' },
  { n: 21, title: 'Constrained Optimization: Motivation and Intuition', chapter: '—', ideas: ['Split the variable; penalty and correction $u$', 'Positivity: the $v$ update is a clip'], tags: ['lagrangian'], module: 'prox' },
  { n: 22, title: 'Lagrangian Duality and the Augmented Lagrangian', chapter: '—', ideas: ['Dual function is concave; strong duality', 'Scaled form $u = \\lambda/a$'], tags: ['lagrangian'], module: 'prox' },
  { n: 23, title: 'Proximal Maps and Shrinkage', chapter: '—', ideas: ['prox is a MAP denoiser', 'L1 prior: three cases, the shrinkage function', 'ICD update as a shrinkage step'], tags: ['case-analysis', 'convexity'], module: 'prox' },
  { n: 24, title: 'Variable Splitting and the ADMM Algorithm', chapter: '—', ideas: ['ADMM $x$, $v$, $u$ updates', 'TV and convex constraints via splitting'], tags: ['lagrangian'], module: 'prox' },
  { n: 25, title: 'Plug-and-Play: Motivation; Plug-In Denoisers', chapter: '—', ideas: ['Proximal maps $F$ and $H$ as agents', 'Training a denoiser as a prox', 'Nonexpansive maps, Moreau’s theorem'], tags: ['fixed-point'], module: 'prox' },
]

export const moduleNames: Record<string, string> = { 'ar-gmrf': 'Module 1', surrogate: 'Module 2', mapopt: 'Module 3', prox: 'Module 4' }
