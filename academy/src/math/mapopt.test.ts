import { describe, expect, test } from 'bun:test'
import {
  mapCost, mapGrad, mapHessian, mapSolve, gdStep, lineSearchAlpha, steepestStep, icdAlpha, icdSweep, icdFastSweep, cgRun, runMethod,
  ex51A, ex51B, hOmega, gdIters99, icdIters99, symEig, scalarMap, levelCurve, matVec, sub, dot, norm2, eye, matScale, unit, column, zeros,
} from './mapopt'

const A = [[1, 0.5], [0, 1]]
const y = [2, 1]
const lam = 0.5
const B = matScale(lam, eye(2))

const fd = (x: number[], i: number, h = 1e-6) => {
  const xp = [...x], xm = [...x]
  xp[i] += h; xm[i] -= h
  return (mapCost(A, y, B, xp) - mapCost(A, y, B, xm)) / (2 * h)
}

describe('MAP cost, gradient, closed form', () => {
  test('gradient matches finite differences; Hessian is AᵗA + B', () => {
    const x = [0.3, -0.7]
    const g = mapGrad(A, y, B, x)
    expect(g[0]).toBeCloseTo(fd(x, 0), 5)
    expect(g[1]).toBeCloseTo(fd(x, 1), 5)
    expect(mapHessian(A, B)).toEqual([[1.5, 0.5], [0.5, 1.75]])
  })
  test('x̂ = (AᵗA + λI)⁻¹Aᵗy has zero gradient and is the minimum', () => {
    const xh = mapSolve(A, y, B)
    expect(norm2(mapGrad(A, y, B, xh))).toBeLessThan(1e-12)
    for (const dx of [[0.1, 0], [0, 0.1], [-0.05, 0.07]]) expect(mapCost(A, y, B, [xh[0] + dx[0], xh[1] + dx[1]])).toBeGreaterThan(mapCost(A, y, B, xh))
    // hand values for the independent problem: H = [[1.5,.5],[.5,1.75]], Aᵗy = [2, 2] → x̂ = [2.5/2.375·… ] check by direct solve
    const det = 1.5 * 1.75 - 0.25
    expect(xh[0]).toBeCloseTo((1.75 * 2 - 0.5 * 2) / det, 12)
    expect(xh[1]).toBeCloseTo((-0.5 * 2 + 1.5 * 2) / det, 12)
  })
})

describe('gradient descent', () => {
  const H = mapHessian(A, B)
  const { values } = symEig(H)
  const hmax = values[1]
  test('stable below 2/h_max, converges to x̂ with α = 1/h_max; unstable above', () => {
    const xh = mapSolve(A, y, B)
    const ok = runMethod(A, y, B, [0, 0], 200, (x) => gdStep(A, y, B, x, 1 / hmax))
    expect(norm2(sub(ok.xs[ok.xs.length - 1], xh))).toBeLessThan(1e-6)
    for (let k = 1; k < ok.C.length; k++) expect(ok.C[k]).toBeLessThanOrEqual(ok.C[k - 1] + 1e-12)
    const bad = runMethod(A, y, B, [0, 0], 60, (x) => gdStep(A, y, B, x, 2.2 / hmax))
    expect(bad.C[bad.C.length - 1]).toBeGreaterThan(bad.C[0])
  })
  test('error modes decay as (1 − αh_i)^k', () => {
    const xh = mapSolve(A, y, B)
    const { values: hs, vectors: E } = symEig(H)
    const alpha = 0.3
    const e0 = sub([1, -1], xh)
    const e1 = sub(gdStep(A, y, B, [1, -1], alpha), xh)
    for (let i = 0; i < 2; i++) {
      const ei = column(E, i)
      expect(dot(e1, ei)).toBeCloseTo((1 - alpha * hs[i]) * dot(e0, ei), 10)
    }
  })
})

describe('line search and steepest descent (2024 P1)', () => {
  test('α* minimises the cost along d and equals ‖d‖²/dᵗHd for d = −∇f', () => {
    const x = [0, 0]
    const d = sub([0, 0], mapGrad(A, y, B, x))
    const a = lineSearchAlpha(A, y, B, x, d)
    expect(a).toBeCloseTo(dot(d, d) / dot(d, matVec(mapHessian(A, B), d)), 12)
    expect(a).toBeCloseTo(8 / 17, 12) // hand value for the independent problem: d = [2,2], dᵗHd = 17
    const f = (t: number) => mapCost(A, y, B, [x[0] + t * d[0], x[1] + t * d[1]])
    expect(f(a)).toBeLessThan(f(a * 0.9))
    expect(f(a)).toBeLessThan(f(a * 1.1))
    const s = steepestStep(A, y, B, x)
    expect(s.alpha).toBeCloseTo(a, 12)
  })
  test('α* ≥ 0 exactly when dᵗ∇f ≤ 0 (2024 P1e)', () => {
    const x = [1, 1]
    const g = mapGrad(A, y, B, x)
    for (const d of [[1, 0], [0, 1], [-1, 0.5], [0.3, -2]]) expect(lineSearchAlpha(A, y, B, x, d) >= 0).toBe(dot(d, g) <= 0)
  })
})

describe('ICD (lecture 14, 2023 P2e)', () => {
  test('the step zeroes the partial derivative; slow and fast sweeps agree; cost is monotone', () => {
    const x = [0.2, -0.4]
    for (let i = 0; i < 2; i++) {
      const xn = [...x]
      xn[i] += icdAlpha(A, y, B, x, i)
      expect(mapGrad(A, y, B, xn)[i]).toBeCloseTo(0, 12)
    }
    expect(icdAlpha(A, y, B, [0, 0], 0)).toBeCloseTo(4 / 3, 12) // hand value: (yᵗA_{*,1} − 0)/(‖A_{*,1}‖² + λ) = 2/1.5
    const slow = icdSweep(A, y, B, x)
    const fast = icdFastSweep(A, y, B, x)
    expect(norm2(sub(slow, fast.x))).toBeLessThan(1e-12)
    expect(norm2(sub(fast.e, sub(y, matVec(A, fast.x))))).toBeLessThan(1e-12)
    const r = runMethod(A, y, B, [0, 0], 40, (xx) => icdSweep(A, y, B, xx))
    for (let k = 1; k < r.C.length; k++) expect(r.C[k]).toBeLessThanOrEqual(r.C[k - 1] + 1e-12)
    expect(norm2(sub(r.xs[r.xs.length - 1], mapSolve(A, y, B)))).toBeLessThan(1e-8)
  })
  test('no-blur update is the weighted average (y_s + λ·prediction)/(1 + λ)', () => {
    // A = I, B = λ(I − G) on 3 pixels with g = ½(δ_{±1}) circular: pixel 0 with neighbours 1, 2
    const N = 3
    const A3 = eye(N)
    const B3 = ex51B(N, lam)
    const yv = [4, 0, 0]
    const xv = [0, 2, 2]
    const xs = xv[0] + icdAlpha(A3, yv, B3, xv, 0)
    expect(xs).toBeCloseTo((4 + lam * 2) / (1 + lam), 12)
    expect(xs).toBeCloseTo(10 / 3, 12)
  })
})

describe('conjugate gradient', () => {
  test('reaches the exact minimum in N = 2 steps', () => {
    const xs = cgRun(A, y, B, [0, 0], 2)
    expect(norm2(sub(xs[xs.length - 1], mapSolve(A, y, B)))).toBeLessThan(1e-10)
  })
})

describe('Example 5.1 (lecture 13 slides 14–16, lecture 14 slide 11)', () => {
  const N = 32, lam = 0.1
  test('eigenvalues of H are h(ω_k); h_max = 4, h_min = 1/5, κ = 20', () => {
    const H = mapHessian(ex51A(N), ex51B(N, lam))
    const { values } = symEig(H)
    const hs = Array.from({ length: N }, (_, k) => hOmega((2 * Math.PI * k) / N, lam)).sort((a, b) => a - b)
    for (let i = 0; i < N; i++) expect(values[i]).toBeCloseTo(hs[i], 9)
    expect(values[N - 1]).toBeCloseTo(4, 12)
    // the lecture quotes h_min = h(π) = 1/5; the true minimum of h is slightly lower, 0.1975 at cos ω = −0.95
    expect(values[0]).toBeGreaterThan(0.197)
    expect(values[0]).toBeLessThan(0.2)
    expect(Math.abs(values[N - 1] / values[0] - 20)).toBeLessThan(0.3)
  })
  test('with α = 1/4: 1 iteration at ω = 0, about 90 at ω = π; unstable for α ≥ 1/2', () => {
    expect(gdIters99(0, 0.25, lam)).toBe(1)
    expect(gdIters99(Math.PI, 0.25, lam)).toBe(90)
    expect(gdIters99(0, 0.5, lam)).toBe(Infinity) // α = 2/h_max: the ω = 0 mode has |1 − αh| = 1
  })
  test('ICD is far faster than gradient descent at ω = π and slower at low frequency', () => {
    const icdHi = icdIters99(N, lam, N / 2)
    expect(icdHi).toBeLessThan(20)
    expect(icdHi).toBeLessThan(gdIters99(Math.PI, 0.25, lam))
    const icdLo = icdIters99(N, lam, 0)
    expect(icdLo).toBeGreaterThan(gdIters99(0, 0.25, lam))
    const rr = runMethod(ex51A(N), zeros(N), ex51B(N, lam), unit(N, 3), 30, (x) => icdSweep(ex51A(N), zeros(N), ex51B(N, lam), x))
    for (let k = 1; k < rr.C.length; k++) expect(rr.C[k]).toBeLessThanOrEqual(rr.C[k - 1] + 1e-12)
  })
})

describe('scalar MAP picture (lecture 12, 2021 Q2)', () => {
  test('β → 0 gives the ML estimate y; β → ∞ gives x*; in between it is a convex combination', () => {
    expect(scalarMap(3, 1, 0, 1)).toBeCloseTo(3, 12)
    expect(scalarMap(3, 1, 1e9, 1)).toBeCloseTo(1, 6)
    const m = scalarMap(3, 1, 0.5, 1)
    expect(m).toBeGreaterThan(1)
    expect(m).toBeLessThan(3)
  })
  test('level curve points all have the same cost', () => {
    const xh = mapSolve(A, y, B)
    const L = levelCurve(mapHessian(A, B), xh, 0.3, 40)
    const c0 = mapCost(A, y, B, xh)
    for (let k = 0; k < L.x.length; k++) expect(mapCost(A, y, B, [L.x[k], L.y[k]]) - c0).toBeCloseTo(0.3, 9)
  })
})
