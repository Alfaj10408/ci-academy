import { describe, expect, test } from 'bun:test'
import {
  absOneMinusH2, psdAR, psdGMRF, snc2, g1, precisionMatrix, covarianceMatrix, arToGmrf, generateAR1,
  causalPredict, noncausalPredict, meanSquare, omegaAxis,
} from './argmrf'
import { grade, gradeNumber } from './grade'
import { normalize } from './latex'

function matmul(A: number[][], B: number[][]) {
  return A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)))
}

describe('AR(1) ↔ GMRF identities (lectures 7, 10, 11; 2021 Q3; 2025 P1)', () => {
  const m = { rho: 0.5, sc2: 1 }
  test('|1 − ρe^{−jω}|² expands to 1 − 2ρcosω + ρ²', () => {
    for (const w of omegaAxis(17)) {
      const re = 1 - m.rho * Math.cos(w)
      const im = m.rho * Math.sin(w)
      expect(absOneMinusH2(m.rho, w)).toBeCloseTo(re * re + im * im, 12)
    }
  })
  test('AR and GMRF power spectra agree (Example 4.1)', () => {
    for (const rho of [-0.9, -0.3, 0.2, 0.5, 0.95])
      for (const w of omegaAxis(33)) expect(psdAR({ rho, sc2: 2 }, w)).toBeCloseTo(psdGMRF({ rho, sc2: 2 }, w), 10)
  })
  test('σ_NC² = σ_C²/(1+ρ²), g_1 = ρ/(1+ρ²)', () => {
    expect(snc2(m)).toBeCloseTo(0.8, 12)
    expect(g1(0.5)).toBeCloseTo(0.4, 12)
  })
  test('general AR(P)→GMRF reduces to the AR(1) formula', () => {
    const { snc2: s, g } = arToGmrf([0.5], 1)
    expect(s).toBeCloseTo(0.8, 12)
    expect(g.get(1)).toBeCloseTo(0.4, 12)
    expect(g.get(-1)).toBeCloseTo(0.4, 12)
    expect(g.get(0)).toBe(0)
  })
  test('AR(2) conversion matches hand computation', () => {
    // h = [a, b]: a_n = [1, −a, −b]; r0 = 1+a²+b², r1 = −a + ab, r2 = −b
    const a = 0.6, b = -0.3
    const { snc2: s, g } = arToGmrf([a, b], 2)
    const r0 = 1 + a * a + b * b
    expect(s).toBeCloseTo(2 / r0, 12)
    expect(g.get(1)).toBeCloseTo(-(-a + a * b) / r0, 12)
    expect(g.get(2)).toBeCloseTo(-(-b) / r0, 12)
  })
  test('precision matrix is the inverse of the stationary covariance (2021 Q3.6, boundary rows = 1/σ_C²)', () => {
    for (const rho of [0.5, -0.7, 0.9]) {
      const mm = { rho, sc2: 1.7 }
      const N = 6
      const R = covarianceMatrix(mm, N)
      const B = precisionMatrix(mm, N)
      const I = matmul(B, R)
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) expect(I[i][j]).toBeCloseTo(i === j ? 1 : 0, 9)
      expect(B[0][0]).toBeCloseTo(1 / mm.sc2, 12)
      expect(B[N - 1][N - 1]).toBeCloseTo(1 / mm.sc2, 12)
      expect(B[2][2]).toBeCloseTo((1 + rho * rho) / mm.sc2, 12)
      expect(B[2][3]).toBeCloseTo(-rho / mm.sc2, 12)
      expect(B[0][3]).toBe(0)
    }
  })
  test('sample path: causal errors have mean square ≈ σ_C², noncausal ≈ σ_NC²', () => {
    const mm = { rho: 0.7, sc2: 1 }
    const { x } = generateAR1(mm, 20000, 7)
    const ec = x.map((_, n) => x[n] - causalPredict(x, mm.rho, n))
    const en = x.map((_, n) => x[n] - noncausalPredict(x, mm.rho, n))
    expect(meanSquare(ec)).toBeCloseTo(1, 1)
    expect(meanSquare(en)).toBeCloseTo(snc2(mm), 1)
  })
})

describe('grading by numerical equivalence', () => {
  const psdSpec = { reference: 'sc2 / (1 - 2*rho*cos(w) + rho^2)', vars: { w: [-3.1, 3.1] as [number, number], rho: [-0.9, 0.9] as [number, number], sc2: [0.2, 3] as [number, number] } }
  test('accepts the complex-modulus form', () => {
    expect(grade('\\frac{\\sigma_c^2}{|1-\\rho e^{-j\\omega}|^2}', psdSpec).ok).toBe(true)
    expect(grade('sc2/abs(1-rho*exp(-i*w))^2', psdSpec).ok).toBe(true)
    expect(grade('σ_c² / (1 + ρ² - 2ρ cos(ω))', psdSpec).ok).toBe(true)
  })
  test('rejects a wrong exponent', () => {
    expect(grade('sc2/abs(1-rho*exp(-i*w))', psdSpec).ok).toBe(false)
  })
  test('sequence answers with delta', () => {
    const spec = { reference: 'rho/(1+rho^2)*(delta(n-1)+delta(n+1))', vars: { n: [-3, 3] as [number, number], rho: [-0.9, 0.9] as [number, number] }, integerVars: ['n'] }
    expect(grade('\\frac{\\rho}{1+\\rho^2}[\\delta(n-1)+\\delta(n+1)]'.replace(/\[/g, '(').replace(/\]/g, ')'), spec).ok).toBe(true)
    expect(grade('rho*(delta(n-1)+delta(n+1))', spec).ok).toBe(false)
  })
  test('numbers', () => {
    expect(gradeNumber('1/1.25', 0.8).ok).toBe(true)
    expect(gradeNumber('0.5', 0.8).ok).toBe(false)
  })
  test('normalizer', () => {
    expect(normalize('S_X(ω) = 2 rho cos(w)')).toBe('2*rho*cos(w)')
  })
})
