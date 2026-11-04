/**
 * Mathematical core for the AR(1) ↔ GMRF module.
 * Notation follows Bouman lectures 7, 9, 10, 11:
 *   causal predictor h_n, causal prediction variance σ_C² (sc2)
 *   noncausal predictor g_n, noncausal prediction variance σ_NC² (snc2)
 *   S_X(ω) = σ_C² / |1 − H(ω)|²  = σ_NC² / (1 − G(ω))
 *   B_{i,j} = (δ_{i−j} − g_{i−j}) / σ_NC²   (homogeneous GMRF, interior rows)
 */

export interface AR1 {
  rho: number // h(n) = ρ δ(n−1), |ρ| < 1
  sc2: number // σ_C² > 0
}

/** |1 − ρ e^{−jω}|² = 1 − 2ρ cos ω + ρ² */
export function absOneMinusH2(rho: number, w: number): number {
  return 1 - 2 * rho * Math.cos(w) + rho * rho
}

/** S_X(ω) from the causal (AR) parameterization, lecture 7 p.12 */
export function psdAR(m: AR1, w: number): number {
  return m.sc2 / absOneMinusH2(m.rho, w)
}

/** σ_NC² = σ_C² / (1 + Σ_{n=1}^{P} h_n²) = σ_C² / (1 + ρ²), lecture 11 p.7 */
export function snc2(m: AR1): number {
  return m.sc2 / (1 + m.rho * m.rho)
}

/** g_1 = g_{−1} = ρ / (1 + ρ²); g_0 = 0 */
export function g1(rho: number): number {
  return rho / (1 + rho * rho)
}

/** G(ω) = Σ g_n e^{−jωn} = 2 g_1 cos ω (symmetric filter ⇒ real) */
export function G(rho: number, w: number): number {
  return 2 * g1(rho) * Math.cos(w)
}

/** S_X(ω) from the noncausal (GMRF) parameterization, lecture 10 p.15 */
export function psdGMRF(m: AR1, w: number): number {
  return snc2(m) / (1 - G(m.rho, w))
}

/** Autocovariance of a stationary AR(1): R_X(k) = σ_C² ρ^{|k|} / (1 − ρ²) */
export function autocov(m: AR1, k: number): number {
  return (m.sc2 * Math.pow(m.rho, Math.abs(k))) / (1 - m.rho * m.rho)
}

/** N×N covariance of the block Z = [X_n … X_{n+N−1}]ᵗ */
export function covarianceMatrix(m: AR1, N: number): number[][] {
  return Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => autocov(m, i - j)))
}

/**
 * Precision matrix B = R⁻¹ of the finite stationary block (2021 Q3.6).
 * Interior: B_ii = (1+ρ²)/σ_C², B_{i,i±1} = −ρ/σ_C². Boundary rows: B_00 = B_{N−1,N−1} = 1/σ_C².
 * Equivalently B = (1/σ_C²) Aᵗ A with A = I − H when X_0 is drawn from the stationary distribution.
 * Verified numerically in argmrf.test.ts by inverting covarianceMatrix.
 */
export function precisionMatrix(m: AR1, N: number): number[][] {
  const { rho, sc2 } = m
  const B = Array.from({ length: N }, () => new Array<number>(N).fill(0))
  for (let i = 0; i < N; i++) {
    const boundary = i === 0 || i === N - 1
    B[i][i] = (boundary ? 1 : 1 + rho * rho) / sc2
    if (i + 1 < N) {
      B[i][i + 1] = -rho / sc2
      B[i + 1][i] = -rho / sc2
    }
  }
  return B
}

/** Deterministic PRNG (mulberry32) so experiments replay exactly. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function gaussian(next: () => number): number {
  const u = 1 - next()
  const v = next()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * Generate an AR(1) sample path X_n = ρ X_{n−1} + E_n with E_n ~ N(0, σ_C²), lecture 7 p.10.
 * X_0 is drawn from the stationary distribution N(0, σ_C²/(1−ρ²)) so the whole path is stationary.
 * Returns both the path and the white driving noise so the lab can show whitening.
 */
export function generateAR1(m: AR1, N: number, seed = 1): { x: number[]; e: number[] } {
  const next = rng(seed)
  const sd = Math.sqrt(m.sc2)
  const x: number[] = new Array(N)
  const e: number[] = new Array(N)
  x[0] = gaussian(next) * Math.sqrt(m.sc2 / (1 - m.rho * m.rho))
  e[0] = NaN
  for (let n = 1; n < N; n++) {
    e[n] = sd * gaussian(next)
    x[n] = m.rho * x[n - 1] + e[n]
  }
  return { x, e }
}

/** Causal MMSE prediction X̂_n = ρ X_{n−1} */
export function causalPredict(x: number[], rho: number, n: number): number {
  return n >= 1 ? rho * x[n - 1] : NaN
}

/** Noncausal MMSE prediction X̂_n = g_1 (X_{n−1} + X_{n+1}) */
export function noncausalPredict(x: number[], rho: number, n: number): number {
  return n >= 1 && n + 1 < x.length ? g1(rho) * (x[n - 1] + x[n + 1]) : NaN
}

/** Sample mean square of a finite array, ignoring NaN */
export function meanSquare(a: number[]): number {
  let s = 0
  let c = 0
  for (const v of a) if (!Number.isNaN(v)) { s += v * v; c++ }
  return c ? s / c : NaN
}

/**
 * General AR(P) → GMRF conversion (lecture 11 p.7, 2025 P1):
 *   σ_NC² = σ_C² / (1 + Σ h_n²),   g_n = δ_n − (δ_n − h_n) ∗ (δ_n − h_{−n}) / (1 + Σ h_n²)
 * h = [h_1, …, h_P]. Returns g as a map from offset n ∈ [−P, P] to coefficient.
 */
export function arToGmrf(h: number[], sc2: number): { snc2: number; g: Map<number, number>; r: Map<number, number> } {
  const P = h.length
  const a = [1, ...h.map((v) => -v)] // a_n = δ_n − h_n on support [0, P]
  const r = new Map<number, number>() // r_m = Σ_k a_k a_{k+m}
  for (let mm = -P; mm <= P; mm++) {
    let s = 0
    for (let k = 0; k <= P; k++) {
      const k2 = k + mm
      if (k2 >= 0 && k2 <= P) s += a[k] * a[k2]
    }
    r.set(mm, s)
  }
  const r0 = r.get(0)!
  const g = new Map<number, number>()
  for (let mm = -P; mm <= P; mm++) g.set(mm, mm === 0 ? 0 : -r.get(mm)! / r0)
  return { snc2: sc2 / r0, g, r }
}

/** Dense sampled frequency axis on [−π, π] */
export function omegaAxis(n = 257): number[] {
  return Array.from({ length: n }, (_, i) => -Math.PI + (2 * Math.PI * i) / (n - 1))
}
