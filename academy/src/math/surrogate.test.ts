import { describe, expect, test } from 'bun:test'
import {
  absSurrogate, absQ, shiftedAbsQ, sumAbs, sumAbsQ, sumAbsStep, median, q4g, q4gQ, q4gStep, q4gMin,
  poissonF, poissonG, poissonH, poissonSurrogate, poissonQ, poissonStep, huber, huberMaxCurvQ, huberSymQ, huberSymA,
  eigSym2, lsCost, lsGrad, lsHessian, lsSurrogate, lsQ, lsStep, lsSolve, mm, checkSurrogate, linspace, huberMapCost, huberMapStepSym, huberMapStepMax,
} from './surrogate'
import { grade, gradeNumber } from './grade'
import { normalize } from './latex'

const T = 1e-9

describe('quadratic surrogate of |x| (2021 Q4.4, 2024 P2c)', () => {
  test('a = 1/(2|x′|), b = |x′|/2 and the two surrogate conditions hold', () => {
    for (const xp of [0.3, 1, -2, 4.5]) {
      const { a, b } = absSurrogate(xp)
      expect(a).toBeCloseTo(1 / (2 * Math.abs(xp)), 12)
      expect(b).toBeCloseTo(Math.abs(xp) / 2, 12)
      const r = checkSurrogate(Math.abs, (x) => absQ(xp, x), xp, -10, 10)
      expect(r.touch).toBeLessThan(T)
      expect(r.worst).toBeLessThan(T) // f ≤ q everywhere
      // slope matching
      const h = 1e-6
      expect((absQ(xp, xp + h) - absQ(xp, xp - h)) / (2 * h)).toBeCloseTo(Math.sign(xp), 5)
    }
  })
  test('shifted |x − z| and Σ|x − x_k| surrogates (2024 P2f, g)', () => {
    const z = 1, xp = 2
    const r = checkSurrogate((x) => Math.abs(x - z), (x) => shiftedAbsQ(z, xp, x), xp, -10, 10)
    expect(r.touch).toBeLessThan(T); expect(r.worst).toBeLessThan(T)
    const xs = [0, 1, 5, 2.5]
    const r2 = checkSurrogate((x) => sumAbs(xs, x), (x) => sumAbsQ(xs, xp, x), xp, -10, 10)
    expect(r2.touch).toBeLessThan(T); expect(r2.worst).toBeLessThan(T)
  })
  test('MM on Σ|x − x_k| is a weighted mean and converges to the median (2024 P2h)', () => {
    const xs = [0, 1, 5]
    const w = xs.map((xk) => 1 / Math.abs(3 - xk))
    expect(sumAbsStep(xs, 3)).toBeCloseTo(w.reduce((s, wi, k) => s + wi * xs[k], 0) / w.reduce((s, v) => s + v, 0), 12)
    const { xs: it, C } = mm((x) => sumAbs(xs, x), (xp) => sumAbsStep(xs, xp), 3, 60)
    for (let k = 1; k < C.length; k++) expect(C[k]).toBeLessThanOrEqual(C[k - 1] + T)
    expect(it[it.length - 1]).toBeCloseTo(median(xs), 3)
  })
})

describe('2021 Q4.5–4.6: g(x) = ½(x−2)² + |x|', () => {
  test('surrogate dominates and touches; x₁ = argmin g(x;1) = 1', () => {
    const r = checkSurrogate(q4g, (x) => q4gQ(1, x), 1, -6, 6)
    expect(r.touch).toBeLessThan(T); expect(r.worst).toBeLessThan(T)
    expect(q4gStep(1)).toBeCloseTo(1, 12)
    // closed-form step equals the numerical argmin of the surrogate
    const xp = 0.4
    const grid = linspace(-3, 3, 60001)
    let best = grid[0]
    for (const x of grid) if (q4gQ(xp, x) < q4gQ(xp, best)) best = x
    expect(best).toBeCloseTo(q4gStep(xp), 3)
  })
  test('MM from x₀ = 3 decreases monotonically and converges to the true minimiser 1', () => {
    const { xs, C } = mm(q4g, q4gStep, 3, 40)
    for (let k = 1; k < C.length; k++) expect(C[k]).toBeLessThanOrEqual(C[k - 1] + T)
    expect(xs[xs.length - 1]).toBeCloseTo(q4gMin, 6)
    expect(C[C.length - 1]).toBeCloseTo(q4g(q4gMin), 10)
  })
})

describe('Poisson NLL surrogate on θ ≥ 1 (2023 P3)', () => {
  test('derivatives, ML estimate, a = y, b = 1 − y/θ′', () => {
    const y = 3, thp = 2
    const h = 1e-5
    expect((poissonF(y, thp + h) - poissonF(y, thp - h)) / (2 * h)).toBeCloseTo(poissonG(y, thp), 6)
    expect((poissonG(y, thp + h) - poissonG(y, thp - h)) / (2 * h)).toBeCloseTo(poissonH(y, thp), 5)
    expect(poissonG(y, y)).toBeCloseTo(0, 12) // θ̂ = y
    const { a, b } = poissonSurrogate(y, thp)
    expect(a).toBe(y); expect(b).toBeCloseTo(1 - y / thp, 12)
    const r = checkSurrogate((t) => poissonF(y, t), (t) => poissonQ(y, thp, t), thp, 1, 12)
    expect(r.touch).toBeLessThan(T); expect(r.worst).toBeLessThan(1e-9)
  })
  test('MM converges to θ̂ = y with monotone cost', () => {
    const y = 3
    const { xs, C } = mm((t) => poissonF(y, t), (tp) => poissonStep(y, tp), 1, 200)
    for (let k = 1; k < C.length; k++) expect(C[k]).toBeLessThanOrEqual(C[k - 1] + T)
    expect(xs[xs.length - 1]).toBeCloseTo(3, 4)
    expect(poissonStep(y, 1)).toBeCloseTo(1 - (1 - 3) / 3, 12) // 5/3
  })
})

describe('Huber: maximum curvature vs symmetric bound (lecture 19)', () => {
  test('both are valid surrogates; the symmetric bound is tighter for |Δ′| > T', () => {
    const Tt = 1
    for (const dp of [0.5, 1.5, 3, -2]) {
      const a = checkSurrogate((d) => huber(Tt, d), (d) => huberMaxCurvQ(Tt, dp, d), dp, -8, 8)
      const b = checkSurrogate((d) => huber(Tt, d), (d) => huberSymQ(Tt, dp, d), dp, -8, 8)
      expect(a.touch).toBeLessThan(T); expect(a.worst).toBeLessThan(T)
      expect(b.touch).toBeLessThan(T); expect(b.worst).toBeLessThan(T)
      expect(huberSymA(Tt, dp)).toBeCloseTo(Math.min(1, Tt / Math.abs(dp)), 12)
    }
    // tighter: the symmetric-bound minimiser of ρ(Δ;Δ′) + ½(Δ−2)² moves further towards the minimum
    expect(huberSymA(1, 3)).toBeLessThan(1)
  })
})

describe('½‖y − Ax‖² with a = λ_max(AᵗA) (2022 Q4)', () => {
  const A: [[number, number], [number, number]] = [[2, 1], [0, 1]]
  const y: [number, number] = [1, 2]
  test('gradient, Hessian, eigenvalues', () => {
    const x: [number, number] = [0.3, -0.7]
    const g = lsGrad(A, y, x)
    const h = 1e-6
    expect((lsCost(A, y, [x[0] + h, x[1]]) - lsCost(A, y, [x[0] - h, x[1]])) / (2 * h)).toBeCloseTo(g[0], 5)
    expect((lsCost(A, y, [x[0], x[1] + h]) - lsCost(A, y, [x[0], x[1] - h])) / (2 * h)).toBeCloseTo(g[1], 5)
    const H = lsHessian(A)
    expect(H).toEqual([[4, 2], [2, 2]])
    const [l1, l2] = eigSym2(H)
    expect(l1 + l2).toBeCloseTo(6, 12); expect(l1 * l2).toBeCloseTo(4, 12)
  })
  test('surrogate touches, dominates, and MM = gradient descent converging to the LS solution', () => {
    const xp: [number, number] = [1, 1]
    const { a, b, c } = lsSurrogate(A, y, xp)
    expect(c).toBeCloseTo(lsCost(A, y, xp), 12)
    expect(b).toEqual(lsGrad(A, y, xp))
    let seed = 7
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 8 - 4 }
    for (let i = 0; i < 500; i++) {
      const x: [number, number] = [rnd(), rnd()]
      expect(lsCost(A, y, x)).toBeLessThanOrEqual(lsQ(A, y, xp, x) + 1e-9)
    }
    // with a slightly smaller curvature the bound fails somewhere
    let fails = 0
    for (let i = 0; i < 500; i++) {
      const x: [number, number] = [rnd(), rnd()]
      const d: [number, number] = [x[0] - xp[0], x[1] - xp[1]]
      const qSmall = (0.9 * a / 2) * (d[0] ** 2 + d[1] ** 2) + b[0] * d[0] + b[1] * d[1] + c
      if (lsCost(A, y, x) > qSmall + 1e-9) fails++
    }
    expect(fails).toBeGreaterThan(0)
    const { xs, C } = mm((x) => lsCost(A, y, x), (p) => lsStep(A, y, p), xp, 200)
    for (let k = 1; k < C.length; k++) expect(C[k]).toBeLessThanOrEqual(C[k - 1] + T)
    const sol = lsSolve(A, y)!
    expect(xs[xs.length - 1][0]).toBeCloseTo(sol[0], 5)
    expect(xs[xs.length - 1][1]).toBeCloseTo(sol[1], 5)
  })
})

describe('grading forms students will type in Module 2', () => {
  const abs = { reference: 'x^2/(2*abs(xp)) + abs(xp)/2', vars: { x: [-4, 4] as [number, number], xp: [-3, 3] as [number, number] } }
  test('|x| surrogate in LaTeX and plain forms', () => {
    expect(grade("x^2/(2|x'|) + |x'|/2", abs).ok).toBe(true)
    expect(grade('\\frac{x^2}{2|x^\\prime|} + \\frac{|x^{\\prime}|}{2}', abs).ok).toBe(true)
    expect(grade('x^2/(2|xp|) + |xp|/2', abs).ok).toBe(true)
    expect(grade('x^2/(2 xp) + xp/2', abs).ok).toBe(false) // forgets the absolute value
    expect(grade('x^2/|x′|', abs).ok).toBe(false)
  })
  test('a(x′) alone, with sign and max', () => {
    const a = { reference: '1/(2*abs(xp))', vars: { xp: [-3, 3] as [number, number] } }
    expect(grade("sign(x')/(2x')", a).ok).toBe(true)
    expect(grade('\\frac{1}{2|x\'|}', a).ok).toBe(true)
    const pa = { reference: 'y', vars: { y: [1, 6] as [number, number], thetap: [1, 5] as [number, number] } }
    expect(grade('max(y/theta^2, theta>=1)', pa).ok).toBe(false)
    expect(grade('y', pa).ok).toBe(true)
    const pb = { reference: '1 - y/thetap', vars: { y: [1, 6] as [number, number], thetap: [1, 5] as [number, number] } }
    expect(grade("1 - y/\\theta'", pb).ok).toBe(true)
    expect(grade('1 - y/θ′', pb).ok).toBe(true)
  })
  test('gradient of ½‖y−Ax‖² is graded as a symbolic 1-D check and numbers as numbers', () => {
    expect(gradeNumber('2/(1+1)', 1).ok).toBe(true)
    expect(gradeNumber('5/3', poissonStep(3, 1)).ok).toBe(true)
    expect(normalize("x^\\prime")).toBe('xp')
    expect(normalize('\\theta^{\\prime}')).toBe('thetap')
  })
})

describe('one-pixel Huber MAP cost: both surrogate updates decrease the cost and reach the minimiser', () => {
  test('symmetric bound converges faster than maximum curvature from the same start', () => {
    const T = 1, c = 3
    const grid = linspace(-5, 8, 130001)
    let best = grid[0]
    for (const x of grid) if (huberMapCost(T, c, x) < huberMapCost(T, c, best)) best = x
    const sym = mm((x) => huberMapCost(T, c, x), (xp) => huberMapStepSym(T, c, xp), -4, 60)
    const max = mm((x) => huberMapCost(T, c, x), (xp) => huberMapStepMax(T, c, xp), -4, 60)
    for (const r of [sym, max]) {
      for (let k = 1; k < r.C.length; k++) expect(r.C[k]).toBeLessThanOrEqual(r.C[k - 1] + 1e-9)
      expect(r.xs[r.xs.length - 1]).toBeCloseTo(best, 3)
    }
    // after 5 steps the symmetric bound is closer to the minimiser (lecture 19 slide 8: tighter bound, faster convergence)
    expect(Math.abs(sym.xs[5] - best)).toBeLessThan(Math.abs(max.xs[5] - best))
  })
})

describe('grading up to an additive constant (surrogates are defined up to a shift)', () => {
  const spec = { reference: '(x-2)^2/2 + x^2/(2*abs(xp))', vars: { x: [-4, 4] as [number, number], xp: [-3, 3] as [number, number] }, upToConstant: 'x' }
  test('2021 Q4.5 with or without |x′|/2 passes; a wrong x-dependence fails', () => {
    expect(grade("(x-2)^2/2 + x^2/(2|x'|)", spec).ok).toBe(true)
    expect(grade("1/2 (x-2)^2 + x^2/(2|x'|) + |x'|/2", spec).ok).toBe(true)
    expect(grade("(x-2)^2/2 + x^2/|x'|", spec).ok).toBe(false)
    expect(grade("(x-2)^2/2 + x^2/(2 x')", spec).ok).toBe(false)
  })
})
