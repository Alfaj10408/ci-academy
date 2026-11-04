/**
 * Module 3 math core: MAP cost for Y = AX + W with a quadratic prior, gradient descent,
 * line search, ICD (slow and fast), conjugate gradient, the 1-D deconvolution Example 5.1
 * of lecture 13, and the scalar MAP picture of lecture 12. Pure functions on number arrays.
 *
 * Scaling convention (2024 P1 form): f(x) = ½‖y − Ax‖² + ½ xᵗBx. Lecture 13 writes
 * (1/2σ²)‖y − Ax‖² + ½xᵗB₀x with a GMRF precision B₀; multiplying by σ² gives this form with
 * B = σ²B₀ = λ(I − G), λ = σ²/σ_x² (lecture 13 slide 11). 2023 P2 is the case B = λI.
 */
export type Vec = number[]
export type Mat = number[][]

export const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0)
export const add = (a: Vec, b: Vec): Vec => a.map((v, i) => v + b[i])
export const sub = (a: Vec, b: Vec): Vec => a.map((v, i) => v - b[i])
export const scale = (c: number, a: Vec): Vec => a.map((v) => c * v)
export const norm2 = (a: Vec) => Math.sqrt(dot(a, a))
export const matVec = (A: Mat, x: Vec): Vec => A.map((row) => dot(row, x))
export const matT = (A: Mat): Mat => A[0].map((_, j) => A.map((row) => row[j]))
export const matMul = (A: Mat, B: Mat): Mat => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)))
export const matAdd = (A: Mat, B: Mat): Mat => A.map((row, i) => row.map((v, j) => v + B[i][j]))
export const matScale = (c: number, A: Mat): Mat => A.map((row) => row.map((v) => c * v))
export const eye = (n: number): Mat => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
export const zeros = (n: number): Vec => Array(n).fill(0)
export const column = (A: Mat, i: number): Vec => A.map((row) => row[i])
export const unit = (n: number, i: number): Vec => zeros(n).map((_, k) => (k === i ? 1 : 0))

/** Solve Hx = b by Gaussian elimination with partial pivoting (small N). */
export function solve(H: Mat, b: Vec): Vec {
  const n = b.length
  const M = H.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    ;[M[c], M[p]] = [M[p], M[c]]
    const piv = M[c][c]
    if (Math.abs(piv) < 1e-14) throw new Error('singular system')
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / piv
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

/** Eigen-decomposition of a symmetric matrix by cyclic Jacobi rotations: values ascending, vectors as columns. */
export function symEig(S: Mat): { values: number[]; vectors: Mat } {
  const n = S.length
  const A = S.map((r) => [...r])
  let V = eye(n)
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j]
    if (off < 1e-22) break
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1), s = t * c
        for (let k = 0; k < n; k++) {
          const akp = A[k][p], akq = A[k][q]
          A[k][p] = c * akp - s * akq
          A[k][q] = s * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k], aqk = A[q][k]
          A[p][k] = c * apk - s * aqk
          A[q][k] = s * apk + c * aqk
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p], vkq = V[k][q]
          V[k][p] = c * vkp - s * vkq
          V[k][q] = s * vkp + c * vkq
        }
      }
    }
  }
  const order = A.map((_, i) => i).sort((a, b) => A[a][a] - A[b][b])
  V = V.map((row) => order.map((j) => row[j]))
  return { values: order.map((i) => A[i][i]), vectors: V }
}

/* ------------------------------- MAP cost, gradient, Hessian ------------------------------- */
export const mapCost = (A: Mat, y: Vec, B: Mat, x: Vec) => 0.5 * dot(sub(y, matVec(A, x)), sub(y, matVec(A, x))) + 0.5 * dot(x, matVec(B, x))
/** ∇f(x) = −Aᵗ(y − Ax) + Bx (lecture 13 slide 5 with σ² absorbed; 2024 P1a gives d = −∇f) */
export const mapGrad = (A: Mat, y: Vec, B: Mat, x: Vec): Vec => add(scale(-1, matVec(matT(A), sub(y, matVec(A, x)))), matVec(B, x))
export const mapHessian = (A: Mat, B: Mat): Mat => matAdd(matMul(matT(A), A), B)
/** x̂ = (AᵗA + B)⁻¹Aᵗy (lecture 12 slide 12; 2023 P2c with B = λI) */
export const mapSolve = (A: Mat, y: Vec, B: Mat): Vec => solve(mapHessian(A, B), matVec(matT(A), y))

/* ------------------------------------ gradient descent ------------------------------------ */
/** x ← x + α[Aᵗ(y − Ax) − Bx] (lecture 13 slide 5) */
export const gdStep = (A: Mat, y: Vec, B: Mat, x: Vec, alpha: number): Vec => sub(x, scale(alpha, mapGrad(A, y, B, x)))
/** exact line search along d for the quadratic cost (lecture 13 slide 18, 2024 P1b): α* = dᵗ[Aᵗ(y−Ax) − Bx] / dᵗHd */
export function lineSearchAlpha(A: Mat, y: Vec, B: Mat, x: Vec, d: Vec): number {
  const num = dot(d, scale(-1, mapGrad(A, y, B, x)))
  const den = dot(d, matVec(mapHessian(A, B), d))
  return den > 0 ? num / den : 0
}
/** steepest descent: gradient direction with exact line search (lecture 13 slide 19): α = ‖d‖²/‖d‖²_H */
export function steepestStep(A: Mat, y: Vec, B: Mat, x: Vec): { x: Vec; alpha: number } {
  const d = scale(-1, mapGrad(A, y, B, x))
  const alpha = lineSearchAlpha(A, y, B, x, d)
  return { x: add(x, scale(alpha, d)), alpha }
}

/* ------------------------------------------ ICD ------------------------------------------- */
/** ICD step for pixel i (lecture 14 slide 6, 2024 P1d, 2023 P2e with B = λI): α = [(y−Ax)ᵗA_{*,i} − xᵗB_{*,i}] / [‖A_{*,i}‖² + B_ii] */
export function icdAlpha(A: Mat, y: Vec, B: Mat, x: Vec, i: number): number {
  const Ai = column(A, i)
  const e = sub(y, matVec(A, x))
  return (dot(e, Ai) - dot(x, column(B, i))) / (dot(Ai, Ai) + B[i][i])
}
/** one full ICD iteration, each pixel once in order (slow form: recomputes y − Ax each time) */
export function icdSweep(A: Mat, y: Vec, B: Mat, x0: Vec): Vec {
  const x = [...x0]
  for (let i = 0; i < x.length; i++) x[i] += icdAlpha(A, y, B, x, i)
  return x
}
/** fast ICD (lecture 14 slide 8): keep e = y − Ax as state, update e ← e − A_{*,i}(x_i − v) */
export function icdFastSweep(A: Mat, y: Vec, B: Mat, x0: Vec, e0?: Vec): { x: Vec; e: Vec } {
  const x = [...x0]
  const e = e0 ? [...e0] : sub(y, matVec(A, x))
  for (let i = 0; i < x.length; i++) {
    const Ai = column(A, i)
    const v = x[i]
    const alpha = (dot(e, Ai) - dot(x, column(B, i))) / (dot(Ai, Ai) + B[i][i])
    x[i] = v + alpha
    for (let k = 0; k < e.length; k++) e[k] -= Ai[k] * (x[i] - v)
  }
  return { x, e }
}

/* ------------------------------------ conjugate gradient ---------------------------------- */
/** lecture 14 slide 16; exact minimiser of the quadratic in at most N steps */
export function cgRun(A: Mat, y: Vec, B: Mat, x0: Vec, K: number): Vec[] {
  const xs = [x0]
  let x = x0
  let dPrev: Vec | null = null, h: Vec | null = null
  for (let k = 0; k < K; k++) {
    const d = scale(-1, mapGrad(A, y, B, x))
    if (norm2(d) < 1e-12) break
    const gamma = dPrev ? dot(sub(d, dPrev), d) / dot(dPrev, dPrev) : 0
    h = h ? add(d, scale(gamma, h)) : d
    const alpha = lineSearchAlpha(A, y, B, x, h)
    x = add(x, scale(alpha, h))
    xs.push(x)
    dPrev = d
  }
  return xs
}

/** generic driver: iterate `step` K times, recording iterates and costs */
export function runMethod(A: Mat, y: Vec, B: Mat, x0: Vec, K: number, step: (x: Vec) => Vec): { xs: Vec[]; C: number[] } {
  const xs = [x0]
  const C = [mapCost(A, y, B, x0)]
  let x = x0
  for (let k = 0; k < K; k++) {
    x = step(x)
    if (!x.every(Number.isFinite)) break
    xs.push(x)
    C.push(mapCost(A, y, B, x))
  }
  return { xs, C }
}

/* ------------------------- Example 5.1: 1-D deconvolution, circulant ---------------------- */
/** circulant matrix with taps {offset: value}: M[i][j] = taps[(i − j) mod N] */
export function circulant(N: number, taps: Record<number, number>): Mat {
  return Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => { const d = (((i - j) % N) + N) % N; return taps[d] ?? taps[d - N] ?? 0 }))
}
/** blur a_n = δ_n + ½(δ_{n−1} + δ_{n+1}) (lecture 13 slide 14) */
export const ex51A = (N: number): Mat => circulant(N, { 0: 1, 1: 0.5, [-1]: 0.5 })
/** prior B = λ(I − G) with g_n = ½(δ_{n−1} + δ_{n+1}) */
export const ex51B = (N: number, lam: number): Mat => circulant(N, { 0: lam, 1: -lam / 2, [-1]: -lam / 2 })
export const aOmega = (w: number) => 1 + Math.cos(w)
export const gOmega = (w: number) => Math.cos(w)
/** h(ω) = |a(ω)|² + λ(1 − g(ω)): the eigenvalues of H (lecture 13 slide 13, 15) */
export const hOmega = (w: number, lam: number) => aOmega(w) ** 2 + lam * (1 - gOmega(w))
/** gradient-descent iterations until the error at frequency ω is below 1%: (1 − αh)^k ≤ 0.01 (slide 16) */
export function gdIters99(w: number, alpha: number, lam: number): number {
  const r = Math.abs(1 - alpha * hOmega(w, lam))
  if (r >= 1) return Infinity
  if (r === 0) return 1
  return Math.ceil(Math.log(0.01) / Math.log(r))
}
/** ICD iterations until a cosine error mode at ω_k = 2πk/N decays below 1% (lecture 14 slide 11, measured by simulation) */
export function icdIters99(N: number, lam: number, k: number, maxIter = 400): number {
  const A = ex51A(N), B = ex51B(N, lam)
  const y = zeros(N)
  let x = Array.from({ length: N }, (_, n) => Math.cos((2 * Math.PI * k * n) / N))
  const n0 = norm2(x)
  let e = sub(y, matVec(A, x))
  for (let it = 1; it <= maxIter; it++) {
    const r = icdFastSweep(A, y, B, x, e)
    x = r.x
    e = r.e
    if (norm2(x) <= 0.01 * n0) return it
  }
  return Infinity
}
/** a test signal: a soft bump and a sharp edge, so both low and high frequencies matter */
export function testSignal(N: number): Vec {
  return Array.from({ length: N }, (_, n) => (n >= N / 2 ? 1 : 0) + 0.8 * Math.exp(-((n - N / 4) ** 2) / 8))
}
/** deterministic pseudo-Gaussian noise (sum of uniforms), seeded */
export function noise(N: number, sigma: number, seed = 7): Vec {
  let s = seed
  const u = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: N }, () => sigma * (u() + u() + u() + u() + u() + u() - 3) * Math.sqrt(2))
}

/* ------------------------------ scalar MAP picture (lecture 12) --------------------------- */
/** y = x + w, w ~ N(0, σ²), prior ∝ exp{−β(x − x*)²}: x̂ = (y/σ² + 2βx*) / (1/σ² + 2β); β→0 gives ML y, β→∞ gives x* (2021 Q2.3, 2.7) */
export const scalarMap = (y: number, sigma2: number, beta: number, xstar: number) => (y / sigma2 + 2 * beta * xstar) / (1 / sigma2 + 2 * beta)
export const scalarLik = (y: number, sigma2: number, x: number) => Math.exp(-((y - x) ** 2) / (2 * sigma2))
export const scalarPrior = (beta: number, xstar: number, x: number) => Math.exp(-beta * (x - xstar) ** 2)

/* ------------------------------------- 2-D geometry --------------------------------------- */
/** points on the level curve f(x) − f(x̂) = c for the quadratic with Hessian H: x = x̂ + E Λ^{-1/2} √(2c) (cos t, sin t) */
export function levelCurve(H: Mat, xhat: Vec, c: number, n = 90): { x: number[]; y: number[] } {
  const { values, vectors } = symEig(H)
  const x: number[] = [], y: number[] = []
  for (let k = 0; k <= n; k++) {
    const t = (2 * Math.PI * k) / n
    const u = [Math.sqrt(2 * c / values[0]) * Math.cos(t), Math.sqrt(2 * c / values[1]) * Math.sin(t)]
    x.push(xhat[0] + vectors[0][0] * u[0] + vectors[0][1] * u[1])
    y.push(xhat[1] + vectors[1][0] * u[0] + vectors[1][1] * u[1])
  }
  return { x, y }
}

export const linspace = (lo: number, hi: number, n: number) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1))
