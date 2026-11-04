import { describe, expect, test } from 'bun:test'
import { grade, type GradeSpec } from './grade'
import { normalizeMatrix } from './latex'

const col = (A: number[][], i: number) => A.map((r) => r[i])
const base: GradeSpec = { reference: '', vars: { lambda: [0.1, 2] }, matVars: { A: { rows: 3, cols: 3 }, B: { rows: 3, cols: 3, posdef: true }, x: { rows: 3 }, y: { rows: 3 }, d: { rows: 3 } },
  derived: { Ai: (s) => col(s.A as number[][], 1), Bi: (s) => col(s.B as number[][], 1), Bii: (s) => (s.B as number[][])[1][1], xi: (s) => (s.x as number[])[1], I: () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]] } }

describe('matrix-mode normalizer', () => {
  const names = ['A', 'B', 'x', 'y', 'd', 'lambda', 'Ai', 'Bi', 'Bii', 'xi', 'I', 'xp']
  test('transposes, implicit products, subscripts, norms, inverse', () => {
    expect(normalizeMatrix('A^t(y - Ax) - \\lambda x', names)).toBe("A'*(y-A*x)-lambda*x")
    expect(normalizeMatrix('-A^T (y-Ax) + Bx', names)).toBe("-A'*(y-A*x)+B*x")
    expect(normalizeMatrix('(A^tA + \\lambda I)^{-1} A^t y', names)).toBe("inv((A'*A+lambda*I))*A'*y")
    expect(normalizeMatrix('\\frac{(y-Ax)^t A_{*,i} - \\lambda x_i}{\\|A_{*,i}\\|^2 + \\lambda}', names)).toBe("(((y-A*x)'*Ai-lambda*xi)/(norm(Ai)^2+lambda))")
    expect(normalizeMatrix('\\frac{d^t[A^t(y-Ax)-Bx]}{d^t[A^tA+B]d}', names)).toBe("((d'*(A'*(y-A*x)-B*x))/(d'*(A'*A+B)*d))")
    expect(normalizeMatrix('x^\\prime', names)).toBe('xp')
    expect(normalizeMatrix('A^t(Ax′ − y)', names)).toBe("A'*(A*xp-y)")
    expect(normalizeMatrix('B_{i,i}', names)).toBe('Bii')
    expect(normalizeMatrix('||A_{*,i}||^2 + B_{ii}', names)).toBe('norm(Ai)^2+Bii')
  })
})

describe('matrix-mode grading', () => {
  test('2023 P2b gradient (scaled by sw2) in several forms', () => {
    const spec: GradeSpec = { ...base, reference: "-A'*(y-A*x) + lambda*x" }
    expect(grade('-A^t(y-Ax)+\\lambda x', spec).ok).toBe(true)
    expect(grade('A^tAx - A^ty + \\lambda x', spec).ok).toBe(true)
    expect(grade('(A^tA + \\lambda I)x - A^t y', spec).ok).toBe(true)
    expect(grade('A^t(y-Ax)+\\lambda x', spec).ok).toBe(false)
    expect(grade('-A(y-Ax)+\\lambda x', spec).ok).toBe(false)
  })
  test('2023 P2c closed form', () => {
    const spec: GradeSpec = { ...base, reference: "inv(A'*A + lambda*I)*A'*y" }
    expect(grade('(A^tA+\\lambda I)^{-1}A^ty', spec).ok).toBe(true)
    expect(grade('(A^tA+\\lambda I)^{-1}A y', spec).ok).toBe(false)
  })
  test('2023 P2e ICD step and 2024 P1d', () => {
    const spec: GradeSpec = { ...base, reference: "((y-A*x)'*Ai - lambda*xi)/(norm(Ai)^2 + lambda)" }
    expect(grade('\\frac{(y-Ax)^tA_{*,i}-\\lambda x_i}{\\|A_{*,i}\\|^2+\\lambda}', spec).ok).toBe(true)
    expect(grade('((y-Ax)^t A_{*,i} - lambda x_i)/(A_{*,i}^t A_{*,i} + lambda)', spec).ok).toBe(true)
    expect(grade('\\frac{(y-Ax)^tA_{*,i}+\\lambda x_i}{\\|A_{*,i}\\|^2+\\lambda}', spec).ok).toBe(false)
    const spec2: GradeSpec = { ...base, reference: "((y-A*x)'*Ai - x'*Bi)/(norm(Ai)^2 + Bii)" }
    expect(grade('\\frac{(y-Ax)^tA_{*,i} - x^tB_{*,i}}{\\|A_{*,i}\\|^2 + B_{i,i}}', spec2).ok).toBe(true)
  })
  test('2024 P1b line search, general direction and gradient direction', () => {
    const spec: GradeSpec = { ...base, reference: "(d'*(A'*(y-A*x) - B*x))/(d'*(A'*A+B)*d)" }
    expect(grade('\\frac{d^t[A^t(y-Ax)-Bx]}{d^t[A^tA+B]d}', spec).ok).toBe(true)
    expect(grade('\\frac{d^td}{d^t[A^tA+B]d}', spec).ok).toBe(false) // only valid when d = −∇f
    const gd: GradeSpec = { ...spec, derived: { ...base.derived, d: (s) => { const A = s.A as number[][], B = s.B as number[][], x = s.x as number[], y = s.y as number[]; const r = y.map((yi, i) => yi - A[i].reduce((a, v, j) => a + v * x[j], 0)); return x.map((_, j) => A.reduce((a, row, i) => a + row[j] * r[i], 0) - B[j].reduce((a, v, k) => a + v * x[k], 0)) } }, matVars: { ...base.matVars, d: undefined as unknown as never } }
    delete (gd.matVars as Record<string, unknown>).d
    expect(grade('\\frac{d^td}{d^t[A^tA+B]d}', gd).ok).toBe(true)
    expect(grade('\\frac{\\|d\\|^2}{d^t(A^tA+B)d}', gd).ok).toBe(true)
  })
  test('shape mismatch is reported', () => {
    const spec: GradeSpec = { ...base, reference: "-A'*(y-A*x) + lambda*x" }
    expect(grade('\\|y-Ax\\|^2', spec).reason).toMatch(/Shape mismatch/)
  })
})
