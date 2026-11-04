/**
 * Surrogate functions and majorization–minimization (lectures 18–20, book 8.1–8.4).
 * Pure functions; every closed form here is checked numerically in surrogate.test.ts.
 *
 * Notation follows the lectures: f(x) is the cost, q(x;x′) the surrogate built at x′,
 * with q(x′;x′) = f(x′) and f(x) ≤ q(x;x′) for all x (8.1, 8.2). The MM update is
 * x ← argmin_x q(x;x′) (8.3), which gives the chain f(x_{k+1}) ≤ q(x_{k+1};x_k) ≤ q(x_k;x_k) = f(x_k) (8.4).
 */

export interface Quad1D {
  /** q(x) = a/2 (x − c)² + d  (vertex form), so argmin is c and the curvature is a */
  a: number
  c: number
  d: number
}

export const evalQuad = (q: Quad1D, x: number) => (q.a / 2) * (x - q.c) ** 2 + q.d

// ---------- |x| and its shifts (2021 Q4.4, 2024 P2) ----------

/**
 * Best quadratic surrogate of ρ(x) = |x| at x′ ≠ 0 with the form a x² + b:
 * slope matching 2a x′ = sign(x′) gives a = 1/(2|x′|), and q(x′;x′) = |x′| gives b = |x′|/2.
 * Does not exist at x′ = 0 (infinite curvature).
 */
export function absSurrogate(xp: number): { a: number; b: number } {
  return { a: 1 / (2 * Math.abs(xp)), b: Math.abs(xp) / 2 }
}
export const absQ = (xp: number, x: number) => absSurrogate(xp).a * x * x + absSurrogate(xp).b

/** Surrogate of f_z(x) = |x − z| at x′: (x−z)²/(2|x′−z|) + |x′−z|/2 (composition property, lecture 19 slide 5). */
export const shiftedAbsQ = (z: number, xp: number, x: number) => (x - z) ** 2 / (2 * Math.abs(xp - z)) + Math.abs(xp - z) / 2

/** g(x) = Σ_k |x − x_k| and its surrogate Σ_k (x−x_k)²/(2|x′−x_k|) + const (additivity). */
export const sumAbs = (xs: number[], x: number) => xs.reduce((s, xk) => s + Math.abs(x - xk), 0)
export const sumAbsQ = (xs: number[], xp: number, x: number) => xs.reduce((s, xk) => s + shiftedAbsQ(xk, xp, x), 0)
/** argmin of the surrogate: weighted mean with weights w_k = 1/|x′ − x_k| (2024 P2h). */
export function sumAbsStep(xs: number[], xp: number): number {
  let num = 0, den = 0
  for (const xk of xs) {
    const w = 1 / Math.max(Math.abs(xp - xk), 1e-12)
    num += w * xk
    den += w
  }
  return num / den
}
/** the global minimiser of Σ|x − x_k| is any median of the x_k */
export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// ---------- 2021 Q4.5–4.6: g(x) = ½(x−2)² + |x| ----------

export const q4g = (x: number) => 0.5 * (x - 2) ** 2 + Math.abs(x)
/** surrogate g(x;x′) = ½(x−2)² + x²/(2|x′|) + |x′|/2 */
export const q4gQ = (xp: number, x: number) => 0.5 * (x - 2) ** 2 + absQ(xp, x)
/** argmin: (x−2) + x/|x′| = 0 ⇒ x = 2|x′|/(1+|x′|) */
export const q4gStep = (xp: number) => (2 * Math.abs(xp)) / (1 + Math.abs(xp))
/** exact minimiser of g: x − 2 + sign(x) = 0 ⇒ x = 1 */
export const q4gMin = 1

// ---------- Poisson negative log-likelihood (2023 P3) ----------

/** f(θ) = θ − y log θ  (NLL up to a constant) */
export const poissonF = (y: number, th: number) => th - y * Math.log(th)
export const poissonG = (y: number, th: number) => 1 - y / th // first derivative
export const poissonH = (y: number, th: number) => y / (th * th) // second derivative
/**
 * Surrogate on θ ≥ 1 with the form a/2 (θ−θ′)² + b(θ−θ′) (+ f(θ′)):
 * b = f′(θ′) = 1 − y/θ′ (gradient matching), a = max_{θ≥1} f″(θ) = y (maximum curvature, lecture 19 slide 7).
 */
export function poissonSurrogate(y: number, thp: number): { a: number; b: number } {
  return { a: y, b: poissonG(y, thp) }
}
export const poissonQ = (y: number, thp: number, th: number) => {
  const { a, b } = poissonSurrogate(y, thp)
  return (a / 2) * (th - thp) ** 2 + b * (th - thp) + poissonF(y, thp)
}
/** MM update restricted to θ ≥ 1: the quadratic's vertex θ′ − b/a, clipped to the domain. */
export const poissonStep = (y: number, thp: number) => Math.max(1, thp - poissonSurrogate(y, thp).b / poissonSurrogate(y, thp).a)

// ---------- Huber potential: maximum curvature vs symmetric bound (lectures 16, 19) ----------

/** ρ(Δ) = Δ²/2 for |Δ| < T, T|Δ| − T²/2 otherwise (lecture 16 slide 8) */
export const huber = (T: number, d: number) => (Math.abs(d) < T ? (d * d) / 2 : T * Math.abs(d) - (T * T) / 2)
export const huberD = (T: number, d: number) => Math.max(-T, Math.min(T, d)) // influence function clip{Δ,[−T,T]}
export const huberDD = (T: number, d: number) => (Math.abs(d) < T ? 1 : 0)
/** maximum curvature: ρ(Δ;Δ′) = ρ(Δ′) + ρ′(Δ′)(Δ−Δ′) + (c_max/2)(Δ−Δ′)², c_max = max ρ″ = 1 */
export const huberMaxCurvQ = (T: number, dp: number, d: number) => huber(T, dp) + huberD(T, dp) * (d - dp) + 0.5 * (d - dp) ** 2
/** symmetric bound curvature a₂ = ρ′(Δ′)/Δ′ = min(1, T/|Δ′|); at Δ′ = 0 use the limit ρ″(0) = 1 */
export const huberSymA = (T: number, dp: number) => (dp === 0 ? 1 : huberD(T, dp) / dp)
/** symmetric bound: ρ(Δ;Δ′) = (a₂/2)Δ² + const with the constant fixed by ρ(Δ′;Δ′) = ρ(Δ′) */
export const huberSymQ = (T: number, dp: number, d: number) => {
  const a = huberSymA(T, dp)
  return (a / 2) * d * d + huber(T, dp) - (a / 2) * dp * dp
}

// ---------- ½‖y − Ax‖² with scalar-curvature surrogate (2022 Q4) ----------

export type Mat2 = [[number, number], [number, number]]
export type Vec2 = [number, number]
export const matVec = (A: Mat2, x: Vec2): Vec2 => [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]]
export const transpose = (A: Mat2): Mat2 => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]]
export const matMul = (A: Mat2, B: Mat2): Mat2 => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
]
export const sub2 = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]]
export const norm2sq = (v: Vec2) => v[0] * v[0] + v[1] * v[1]
/** eigenvalues of a symmetric 2×2 matrix, ascending */
export function eigSym2(M: Mat2): [number, number] {
  const tr = M[0][0] + M[1][1], det = M[0][0] * M[1][1] - M[0][1] * M[1][0]
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det))
  return [tr / 2 - disc, tr / 2 + disc]
}
export const lsCost = (A: Mat2, y: Vec2, x: Vec2) => 0.5 * norm2sq(sub2(y, matVec(A, x)))
/** ∇f = Aᵗ(Ax − y) */
export const lsGrad = (A: Mat2, y: Vec2, x: Vec2): Vec2 => matVec(transpose(A), sub2(matVec(A, x), y))
export const lsHessian = (A: Mat2): Mat2 => matMul(transpose(A), A)
/** surrogate f(x;x′) = a/2‖x−x′‖² + bᵗ(x−x′) + c with b = ∇f(x′), c = f(x′), a = λ_max(AᵗA) */
export function lsSurrogate(A: Mat2, y: Vec2, xp: Vec2): { a: number; b: Vec2; c: number } {
  return { a: eigSym2(lsHessian(A))[1], b: lsGrad(A, y, xp), c: lsCost(A, y, xp) }
}
export const lsQ = (A: Mat2, y: Vec2, xp: Vec2, x: Vec2) => {
  const { a, b, c } = lsSurrogate(A, y, xp)
  const d = sub2(x, xp)
  return (a / 2) * norm2sq(d) + b[0] * d[0] + b[1] * d[1] + c
}
/** MM update = gradient descent with step 1/a: x ← x′ − (1/a)Aᵗ(Ax′ − y) */
export function lsStep(A: Mat2, y: Vec2, xp: Vec2): Vec2 {
  const { a, b } = lsSurrogate(A, y, xp)
  return [xp[0] - b[0] / a, xp[1] - b[1] / a]
}
/** exact least-squares solution (AᵗA)⁻¹Aᵗy when AᵗA is invertible */
export function lsSolve(A: Mat2, y: Vec2): Vec2 | null {
  const H = lsHessian(A), r = matVec(transpose(A), y)
  const det = H[0][0] * H[1][1] - H[0][1] * H[1][0]
  if (Math.abs(det) < 1e-12) return null
  return [(H[1][1] * r[0] - H[0][1] * r[1]) / det, (-H[1][0] * r[0] + H[0][0] * r[1]) / det]
}

// ---------- generic MM driver ----------

/** Run K steps of x ← argmin q(x; x′); returns iterates x_0..x_K and costs C_k = f(x_k). */
export function mm<T>(f: (x: T) => number, step: (xp: T) => T, x0: T, K: number): { xs: T[]; C: number[] } {
  const xs = [x0], C = [f(x0)]
  for (let k = 0; k < K; k++) {
    const x = step(xs[xs.length - 1])
    xs.push(x)
    C.push(f(x))
  }
  return { xs, C }
}

/** Check (8.1) and (8.2) on a grid: returns the worst violation (should be ≤ tol) and the touch error. */
export function checkSurrogate(f: (x: number) => number, q: (x: number) => number, xp: number, lo: number, hi: number, n = 401): { touch: number; worst: number } {
  let worst = -Infinity
  for (let i = 0; i < n; i++) {
    const x = lo + ((hi - lo) * i) / (n - 1)
    worst = Math.max(worst, f(x) - q(x))
  }
  return { touch: Math.abs(f(xp) - q(xp)), worst }
}

export const linspace = (lo: number, hi: number, n: number) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1))

// ---------- one-pixel MAP cost with a Huber prior: f(x) = ½(x − c)² + ρ_T(x) (lab experiment) ----------

export const huberMapCost = (T: number, c: number, x: number) => 0.5 * (x - c) ** 2 + huber(T, x)
/** symmetric-bound surrogate ½(x−c)² + (a₂/2)x² + const ⇒ x = c/(1 + a₂) */
export const huberMapStepSym = (T: number, c: number, xp: number) => c / (1 + huberSymA(T, xp))
/** maximum-curvature surrogate ½(x−c)² + ρ′(x′)(x−x′) + ½(x−x′)² + const ⇒ x = (c − ρ′(x′) + x′)/2 */
export const huberMapStepMax = (T: number, c: number, xp: number) => (c - huberD(T, xp) + xp) / 2
