/**
 * Module 4 math core: proximal maps, shrinkage, clips, the split-variable / ADMM iteration of
 * lectures 21–24 (2022 Q3.4 and the PnP-ADMM loop of lecture 25), total variation ADMM on a
 * 1-D signal, the line-constraint Lagrangian example of lecture 22, and the swap map of 2025 P4.
 */
import { type Vec, type Mat, dot, sub, add, scale, norm2, matVec, matT, matMul, matAdd, matScale, eye, solve, linspace } from './mapopt'
export { linspace }

/* ------------------------------- scalar proximal maps ------------------------------- */
/** shrinkage / soft threshold (lecture 23 slide 12, 2025 P2): sign(y) max(|y| − λ, 0) */
export const shrink = (lam: number, y: number) => Math.sign(y) * Math.max(Math.abs(y) - lam, 0)
export const shrinkVec = (lam: number, y: Vec): Vec => y.map((v) => shrink(lam, v))
/** clip onto [0, ∞) componentwise (lecture 21 slide 14, 2022 Q3.5) */
export const clipPos = (v: Vec): Vec => v.map((x) => Math.max(x, 0))
/** proximal map of a scalar f by grid search: argmin f(x) + (x − z)²/(2σ²) on [lo, hi] */
export function proxGrid(f: (x: number) => number, sigma2: number, z: number, lo: number, hi: number, n = 4001): number {
  let best = lo, bv = Infinity
  for (let k = 0; k < n; k++) {
    const x = lo + ((hi - lo) * k) / (n - 1)
    const v = f(x) + ((x - z) ** 2) / (2 * sigma2)
    if (v < bv) { bv = v; best = x }
  }
  return best
}
/** prox of f/a for f(x) = ½‖y − x‖² (denoising data term): argmin ½‖y−x‖² + (a/2)‖x−z‖² = (y + a z)/(1 + a) */
export const proxDenoise = (y: Vec, a: number, z: Vec): Vec => y.map((yi, i) => (yi + a * z[i]) / (1 + a))
/** lecture 23 slide 16: ICD step with a Laplacian prior is a shrinkage step */
export const icdShrinkStep = (theta1: number, theta2: number, lam: number, xold: number) => shrink(lam / theta2, xold - theta1 / theta2)

/* ------------------------------- 2024 P3c: prox of ½‖y − Ax‖²_Λ ------------------------------- */
/** F(v; y) = v + (I/σ² + AᵗΛA)⁻¹AᵗΛ(y − Av) */
export function proxLS(A: Mat, Lam: Mat, sigma2: number, v: Vec, y: Vec): Vec {
  const AtL = matMul(matT(A), Lam)
  const M = matAdd(matScale(1 / sigma2, eye(v.length)), matMul(AtL, A))
  const rhs = matVec(AtL, sub(y, matVec(A, v)))
  return add(v, solve(M, rhs))
}
export const lsProxCost = (A: Mat, Lam: Mat, sigma2: number, v: Vec, y: Vec, x: Vec) => {
  const r = sub(y, matVec(A, x))
  return 0.5 * dot(r, matVec(Lam, r)) + dot(sub(x, v), sub(x, v)) / (2 * sigma2)
}

/* ------------------------------- ADMM with the split x = v (2022 Q3.4, lecture 25 slide 11) ------------------------------- */
export interface AdmmState { x: Vec; v: Vec; u: Vec }
/** x ← F(v − u); v ← H(x + u); u ← u + (x − v) */
export function admmStep(F: (z: Vec) => Vec, H: (z: Vec) => Vec, s: AdmmState): AdmmState {
  const x = F(sub(s.v, s.u))
  const v = H(add(x, s.u))
  const u = add(s.u, sub(x, v))
  return { x, v, u }
}
export function admmRun(F: (z: Vec) => Vec, H: (z: Vec) => Vec, N: number, K: number): AdmmState[] {
  const out: AdmmState[] = [{ x: Array(N).fill(0), v: Array(N).fill(0), u: Array(N).fill(0) }]
  for (let k = 0; k < K; k++) out.push(admmStep(F, H, out[out.length - 1]))
  return out
}
export const gap = (s: AdmmState) => norm2(sub(s.x, s.v))

/* ------------------------------- total variation ADMM on a 1-D signal (lecture 24 slides 12–16) ------------------------------- */
/** first-difference matrix B (K = N − 1 rows) */
export const diffMatrix = (N: number): Mat => Array.from({ length: N - 1 }, (_, k) => Array.from({ length: N }, (_, j) => (j === k ? -1 : j === k + 1 ? 1 : 0)))
export const tvCost = (y: Vec, lam: number, x: Vec, B: Mat) => 0.5 * dot(sub(y, x), sub(y, x)) + lam * matVec(B, x).reduce((s, v) => s + Math.abs(v), 0)
export interface TvState { x: Vec; v: Vec; u: Vec }
/** one ADMM iteration for ½‖y − x‖² + λ‖Bx‖₁: quadratic x update, shrinkage v update, multiplier update */
export function tvAdmmStep(y: Vec, lam: number, a: number, B: Mat, s: TvState): TvState {
  const N = y.length
  const BtB = matMul(matT(B), B)
  const M = matAdd(eye(N), matScale(a, BtB))
  const rhs = add(y, scale(a, matVec(matT(B), sub(s.v, s.u))))
  const x = solve(M, rhs)
  const Bx = matVec(B, x)
  const v = shrinkVec(lam / a, add(Bx, s.u))
  const u = add(s.u, sub(Bx, v))
  return { x, v, u }
}
export function tvAdmmRun(y: Vec, lam: number, a: number, K: number): TvState[] {
  const B = diffMatrix(y.length)
  const out: TvState[] = [{ x: [...y], v: matVec(B, y), u: Array(y.length - 1).fill(0) }]
  for (let k = 0; k < K; k++) out.push(tvAdmmStep(y, lam, a, B, out[out.length - 1]))
  return out
}

/* ------------------------------- lecture 22 slide 7: line constraint x₂ = x₁ + 1 ------------------------------- */
/** minimiser of ½‖x − y‖² + λ(x₁ − x₂ + 1): x(λ) = (y₁ − λ, y₂ + λ) */
export const lineX = (y: Vec, lam: number): Vec => [y[0] - lam, y[1] + lam]
/** the multiplier that puts x(λ) on the line: λ* = (y₁ − y₂ + 1)/2 */
export const lineLamStar = (y: Vec) => (y[0] - y[1] + 1) / 2
/** one augmented-Lagrangian iteration (lecture 22 slide 14) for the line constraint: returns the new x and λ */
export function lineAugLagStep(y: Vec, a: number, lam: number): { x: Vec; lam: number } {
  // minimise ½‖x−y‖² + (a/2)(Cx−b)² + λ(Cx−b) with C = [1, −1], b = −1: s = Cx − b solves s = (Cy − b) − 2(a s + λ)
  const cyb = y[0] - y[1] + 1
  const s = (cyb - 2 * lam) / (1 + 2 * a)
  const x: Vec = [y[0] - (a * s + lam), y[1] + (a * s + lam)]
  return { x, lam: lam + a * s }
}

/* ------------------------------- 2025 P4: the swap map and the Mann iteration ------------------------------- */
export const swap = (x: Vec): Vec => [x[1], x[0]]
export const mannStep = (H: (x: Vec) => Vec, alpha: number, x: Vec): Vec => add(scale(1 - alpha, x), scale(alpha, H(x)))
export function iterate(step: (x: Vec) => Vec, x0: Vec, K: number): Vec[] {
  const xs = [x0]
  for (let k = 0; k < K; k++) xs.push(step(xs[xs.length - 1]))
  return xs
}
/** Lipschitz ratio ‖H(x) − H(y)‖ / ‖x − y‖ sampled on random pairs: < 1 everywhere for a contraction, ≤ 1 for nonexpansive */
export function lipschitzSample(H: (x: Vec) => Vec, n = 200, seed = 3): { max: number; min: number } {
  let s = seed
  const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s / 0x7fffffff) * 4 - 2 }
  let max = 0, min = Infinity
  for (let k = 0; k < n; k++) {
    const x = [r(), r()], y = [r(), r()]
    const d = norm2(sub(x, y))
    if (d < 1e-9) continue
    const q = norm2(sub(H(x), H(y))) / d
    max = Math.max(max, q); min = Math.min(min, q)
  }
  return { max, min }
}
export const diagProjection = (x0: Vec): Vec => [(x0[0] + x0[1]) / 2, (x0[0] + x0[1]) / 2]

/** a sparse test signal for the shrinkage demo and a step signal for TV */
export function sparseSignal(N: number, seed = 11): Vec {
  let s = seed
  const u = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: N }, () => (u() < 0.25 ? (u() - 0.5) * 8 : 0))
}
export const stepSignal = (N: number): Vec => Array.from({ length: N }, (_, n) => (n < N / 3 ? 0 : n < (2 * N) / 3 ? 2 : 0.5))
