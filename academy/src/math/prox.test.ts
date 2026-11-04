import { describe, expect, test } from 'bun:test'
import {
  shrink, shrinkVec, clipPos, proxGrid, proxDenoise, icdShrinkStep, proxLS, lsProxCost, admmRun, gap, diffMatrix, tvCost, tvAdmmRun,
  lineX, lineLamStar, lineAugLagStep, swap, mannStep, iterate, lipschitzSample, diagProjection,
} from './prox'
import { noise, norm2, sub, matVec, dot } from './mapopt'

describe('shrinkage and clips (lecture 23, 2025 P2, 2022 Q3.5)', () => {
  test('three cases and the compact form agree with brute force', () => {
    const lam = 1
    for (const y of [-3, -1.2, -0.5, 0, 0.7, 1, 2.5]) {
      const bf = proxGrid((x) => lam * Math.abs(x), 1, y, -5, 5, 20001)
      expect(shrink(lam, y)).toBeCloseTo(bf, 3)
      const expected = y > lam ? y - lam : y < -lam ? y + lam : 0
      expect(shrink(lam, y)).toBeCloseTo(expected, 12)
    }
    expect(shrinkVec(0.5, [0.3, -2, 1.5])).toEqual([0, -1.5, 1])
    expect(clipPos([-1, 0, 2])).toEqual([0, 0, 2])
  })
  test('repeated proximal map converges to the minimiser of u (lecture 23 slide 9)', () => {
    let y = 7
    for (let k = 0; k < 20; k++) y = shrink(0.5, y)
    expect(y).toBe(0)
  })
  test('Laplacian-prior ICD step is a shrinkage step (slide 16)', () => {
    const th1 = -2, th2 = 4, lam = 1, xold = 0
    const bf = proxGrid((x) => th1 * (x - xold) + (th2 / 2) * (x - xold) ** 2 + lam * Math.abs(x), Infinity, 0, -3, 3, 60001)
    expect(icdShrinkStep(th1, th2, lam, xold)).toBeCloseTo(0.25, 12)
    expect(icdShrinkStep(th1, th2, lam, xold)).toBeCloseTo(bf, 3)
  })
  test('independent-problem prox: f = ½(x−2)² + |x|, z = 4, σ² = 1 → 2.5', () => {
    expect(proxGrid((x) => 0.5 * (x - 2) ** 2 + Math.abs(x), 1, 4, -2, 6, 80001)).toBeCloseTo(2.5, 3)
  })
})

describe('2024 P3c proximal map of the weighted least-squares term', () => {
  test('closed form has zero gradient and beats nearby points', () => {
    const A = [[1, 0.5, 0], [0, 1, 0.3], [0.2, 0, 1]]
    const Lam = [[2, 0, 0], [0, 1, 0], [0, 0, 0.5]]
    const v = [1, -1, 0.5], y = [2, 0, 1], s2 = 0.8
    const x = proxLS(A, Lam, s2, v, y)
    const c0 = lsProxCost(A, Lam, s2, v, y, x)
    for (const d of [[1e-3, 0, 0], [0, 1e-3, 0], [0, 0, 1e-3], [-1e-3, 1e-3, 0]]) expect(lsProxCost(A, Lam, s2, v, y, x.map((xi, i) => xi + d[i]))).toBeGreaterThan(c0)
    // scalar check used by the independent problem: A = 2, Λ = 1, σ² = 1, v = 1, y = 5 → 2.2
    expect(proxLS([[2]], [[1]], 1, [1], [5])[0]).toBeCloseTo(2.2, 12)
  })
})

describe('ADMM with the split x = v (2022 Q3.4, lectures 21 and 24)', () => {
  test('positivity-constrained denoising converges to max(y, 0); u → λ*/a', () => {
    const y = [-1, 2, -0.3, 0.5]
    const a = 1
    const hist = admmRun((z) => proxDenoise(y, a, z), clipPos, y.length, 60)
    const last = hist[hist.length - 1]
    expect(norm2(sub(last.x, clipPos(y)))).toBeLessThan(1e-6)
    expect(gap(last)).toBeLessThan(1e-6)
    // hand values for the scalar independent problem: y = −1, a = 1: x₁ = −0.5, u₁ = −0.5, u → −1
    const h1 = admmRun((z) => proxDenoise([-1], 1, z), clipPos, 1, 80)
    expect(h1[1].x[0]).toBeCloseTo(-0.5, 12)
    expect(h1[1].u[0]).toBeCloseTo(-0.5, 12)
    expect(h1[80].u[0]).toBeCloseTo(-1, 6)
    // for general a the scaled multiplier is λ*/a with λ* = y on an active constraint
    const h10 = admmRun((z) => proxDenoise([-1], 10, z), clipPos, 1, 200)
    expect(h10[200].u[0]).toBeCloseTo(-0.1, 6)
    // larger a: fewer iterations to the same point (lecture 22 slide 16)
    const fast = admmRun((z) => proxDenoise(y, 10, z), clipPos, y.length, 60)
    const it = (h: typeof hist) => h.findIndex((s) => gap(s) < 1e-4 && s.x.every((xi, i) => Math.abs(xi - Math.max(y[i], 0)) < 1e-4))
    expect(it(fast)).toBeLessThan(it(hist))
  })
  test('total variation ADMM: constraint gap → 0, cost ≤ cost of y, same limit for two values of a', () => {
    const N = 24
    const yv = stepish(N)
    const B = diffMatrix(N)
    const lam = 0.6
    const r1 = tvAdmmRun(yv, lam, 1, 400), r2 = tvAdmmRun(yv, lam, 5, 400)
    const x1 = r1[r1.length - 1].x, x2 = r2[r2.length - 1].x
    expect(norm2(sub(matVec(B, x1), r1[r1.length - 1].v))).toBeLessThan(1e-5)
    expect(tvCost(yv, lam, x1, B)).toBeLessThan(tvCost(yv, lam, yv, B))
    expect(norm2(sub(x1, x2))).toBeLessThan(1e-3)
    // piecewise-constant: the TV of the estimate is far below the TV of the data
    const tv = (x: number[]) => matVec(B, x).reduce((s, v) => s + Math.abs(v), 0)
    expect(tv(x1)).toBeLessThan(0.5 * tv(yv))
  })
})

function stepish(N: number) {
  const base = Array.from({ length: N }, (_, n) => (n < N / 3 ? 0 : n < (2 * N) / 3 ? 2 : 0.5))
  const w = noise(N, 0.2, 5)
  return base.map((b, i) => b + w[i])
}

describe('lecture 22 slide 7: line constraint', () => {
  test('x(λ) slides to the line at λ* = (y₁ − y₂ + 1)/2; augmented Lagrangian iteration finds it for any a', () => {
    const y = [3, 1]
    expect(lineLamStar(y)).toBeCloseTo(1.5, 12)
    const xs = lineX(y, 1.5)
    expect(xs[1]).toBeCloseTo(xs[0] + 1, 12)
    for (const a of [0.5, 2, 10]) {
      let lam = 0, x = y
      for (let k = 0; k < 200; k++) ({ x, lam } = lineAugLagStep(y, a, lam))
      expect(lam).toBeCloseTo(1.5, 6)
      expect(x[1]).toBeCloseTo(x[0] + 1, 6)
      expect(norm2(sub(x, lineX(y, 1.5)))).toBeLessThan(1e-6)
    }
  })
})

describe('2025 P4: the swap map', () => {
  test('nonexpansive (ratio exactly 1) but not a contraction; plain iteration oscillates; Mann converges to the diagonal projection', () => {
    const L = lipschitzSample(swap)
    expect(L.max).toBeCloseTo(1, 9)
    expect(L.min).toBeCloseTo(1, 9)
    const x0 = [3, 1]
    const plain = iterate(swap, x0, 6)
    expect(plain[2]).toEqual(x0)
    expect(norm2(sub(plain[1], plain[0]))).toBeGreaterThan(1)
    for (const alpha of [0.25, 0.5, 0.9]) {
      const m = iterate((x) => mannStep(swap, alpha, x), x0, 80)
      expect(norm2(sub(m[m.length - 1], diagProjection(x0)))).toBeLessThan(1e-6) // rate |1 − 2α| per step
    }
    expect(mannStep(swap, 0.25, [5, -1])).toEqual([3.5, 0.5])
    expect(diagProjection([5, -1])).toEqual([2, 2])
    // every point of the diagonal is a fixed point
    for (const t of [-2, 0, 1.7]) expect(dot(sub(swap([t, t]), [t, t]), [1, 1])).toBe(0)
  })
})
