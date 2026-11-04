/**
 * Expression grading by numerical equivalence.
 * A student expression and the reference expression are both compiled with mathjs
 * and compared at pseudo-random sample points of the free variables. This catches
 * algebraically equivalent forms (e.g. |1−ρe^{−jω}|² vs 1−2ρcosω+ρ²) without string
 * matching. Limitation (labelled in the UI): it is a numerical test, not a symbolic proof;
 * agreement at 24 random points with relative error < 1e−7 is treated as equivalence.
 */
import { create, all, type MathJsInstance } from 'mathjs'
import { normalize, normalizeMatrix } from './latex'

const math: MathJsInstance = create(all, {})
// Kronecker delta for sequence answers like g(n) = ρ/(1+ρ²) (δ(n−1) + δ(n+1))
math.import({ delta: (x: number) => (Math.abs(x) < 1e-9 ? 1 : 0) }, { override: true })

export type Range = [number, number]
export interface GradeSpec {
  /** reference expression in mathjs syntax */
  reference: string
  /** free variables and the sampling range for each */
  vars: Record<string, Range>
  /** variables that must be sampled on integers (e.g. n for sequences) */
  integerVars?: string[]
  /** constants fixed for this problem (e.g. rho: 0.5) */
  fixed?: Record<string, number>
  samples?: number
  tolerance?: number
  /** name of the argument variable: student and reference need only agree up to a term constant in it (a surrogate's shift c(x′) may depend on the other variables) */
  upToConstant?: string
  /** matrix mode (Module 3): vector/matrix variables sampled at random; cols omitted → vector of length rows */
  matVars?: Record<string, MatSpec>
  /** scope entries computed from the sampled variables (e.g. the i-th column of A) */
  derived?: Record<string, (scope: Record<string, unknown>) => unknown>
}
export interface MatSpec { rows: number; cols?: number; symmetric?: boolean; posdef?: boolean }

export interface GradeResult {
  ok: boolean
  reason: string
  normalized: string
  /** first point where the two disagree, for feedback */
  counterexample?: { point: Record<string, number>; student: number; reference: number }
}

function toReal(v: unknown): number {
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 're' in (v as object)) {
    const c = v as { re: number; im: number }
    return Math.abs(c.im) < 1e-9 ? c.re : NaN
  }
  if (typeof v === 'boolean') return v ? 1 : 0
  return NaN
}

/** flatten a mathjs result (number, complex, array, Matrix) to a list of reals; NaN marks non-real entries */
export function toFlat(v: unknown): number[] {
  if (v && typeof v === 'object' && 'toArray' in (v as object)) v = (v as { toArray: () => unknown }).toArray()
  if (Array.isArray(v)) return (v as unknown[]).flatMap(toFlat)
  return [toReal(v)]
}

function sampleMatrix(m: MatSpec, rand: () => number): number[] | number[][] {
  const r = () => -2 + 4 * rand()
  if (!m.cols) return Array.from({ length: m.rows }, r)
  let M = Array.from({ length: m.rows }, () => Array.from({ length: m.cols! }, r))
  if (m.symmetric || m.posdef) {
    const n = m.rows
    const S = Array.from({ length: n }, () => Array(n).fill(0))
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) S[i][j] += m.posdef ? M[k][i] * M[k][j] : 0
    if (!m.posdef) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) S[i][j] = (M[i][j] + M[j][i]) / 2
    else for (let i = 0; i < n; i++) S[i][i] += 0.5
    M = S
  }
  return M
}

export function grade(studentInput: string, spec: GradeSpec): GradeResult {
  if (spec.matVars || spec.derived) return gradeMatrix(studentInput, spec)
  const normalized = normalize(studentInput)
  if (!normalized.trim()) return { ok: false, reason: 'Empty answer.', normalized }
  let student, reference
  try {
    student = math.compile(normalized)
  } catch (e) {
    return { ok: false, reason: `Could not parse your expression: ${(e as Error).message}`, normalized }
  }
  try {
    reference = math.compile(spec.reference)
  } catch (e) {
    return { ok: false, reason: `Internal reference error: ${(e as Error).message}`, normalized }
  }
  const names = Object.keys(spec.vars)
  const samples = spec.samples ?? 24
  const tol = spec.tolerance ?? 1e-7
  let seed = 12345
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let s = 0; s < samples; s++) {
    const point: Record<string, number> = { ...(spec.fixed ?? {}) }
    for (const v of names) {
      const [lo, hi] = spec.vars[v]
      let val = lo + (hi - lo) * rand()
      if (spec.integerVars?.includes(v)) val = Math.round(val)
      point[v] = val
    }
    let sv: number, rv: number
    try {
      sv = toReal(student.evaluate({ ...point }))
    } catch (e) {
      return { ok: false, reason: `Your expression failed to evaluate: ${(e as Error).message}`, normalized }
    }
    rv = toReal(reference.evaluate({ ...point }))
    if (spec.upToConstant) {
      // compare differences in the argument variable: f(p) − f(p₂) with p₂ differing only in that variable
      const v = spec.upToConstant
      const [lo, hi] = spec.vars[v]
      const p2 = { ...point, [v]: lo + (hi - lo) * rand() }
      try {
        sv -= toReal(student.evaluate({ ...p2 }))
      } catch (e) {
        return { ok: false, reason: `Your expression failed to evaluate: ${(e as Error).message}`, normalized }
      }
      rv -= toReal(reference.evaluate({ ...p2 }))
    }
    if (Number.isNaN(sv)) return { ok: false, reason: 'Your expression is complex-valued or undefined at a test point; the answer should be real.', normalized, counterexample: { point, student: sv, reference: rv } }
    const scale = Math.max(1, Math.abs(rv))
    if (!(Math.abs(sv - rv) <= tol * scale)) {
      return { ok: false, reason: 'Not equivalent to the correct expression.', normalized, counterexample: { point, student: sv, reference: rv } }
    }
  }
  return { ok: true, reason: 'Equivalent to the reference at all sampled points.', normalized }
}

/** Grade a numeric answer with relative/absolute tolerance. Accepts expressions like 1/1.25. */
export function gradeNumber(studentInput: string, expected: number, relTol = 1e-3): GradeResult {
  const normalized = normalize(studentInput)
  try {
    const v = toReal(math.evaluate(normalized))
    if (Number.isNaN(v)) return { ok: false, reason: 'Not a real number.', normalized }
    const ok = Math.abs(v - expected) <= relTol * Math.max(1, Math.abs(expected))
    return { ok, reason: ok ? 'Correct.' : `Got ${v}, expected ${expected}.`, normalized }
  } catch (e) {
    return { ok: false, reason: `Could not parse: ${(e as Error).message}`, normalized }
  }
}

export function evaluateNumber(input: string, scope: Record<string, number> = {}): number {
  return toReal(math.evaluate(normalize(input), scope))
}

/** Matrix mode: compare flattened results (scalar, vector or matrix) at random samples. */
function gradeMatrix(studentInput: string, spec: GradeSpec): GradeResult {
  const known = [...Object.keys(spec.vars), ...Object.keys(spec.matVars ?? {}), ...Object.keys(spec.derived ?? {}), ...Object.keys(spec.fixed ?? {})]
  const normalized = normalizeMatrix(studentInput, known)
  if (!normalized.trim()) return { ok: false, reason: 'Empty answer.', normalized }
  let student, reference
  try {
    student = math.compile(normalized)
  } catch (e) {
    return { ok: false, reason: `Could not parse your expression: ${(e as Error).message}`, normalized }
  }
  try {
    reference = math.compile(spec.reference)
  } catch (e) {
    return { ok: false, reason: `Internal reference error: ${(e as Error).message}`, normalized }
  }
  const samples = spec.samples ?? 12
  const tol = spec.tolerance ?? 1e-7
  let seed = 4242
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let s = 0; s < samples; s++) {
    const scope: Record<string, unknown> = { ...(spec.fixed ?? {}) }
    for (const [v, [lo, hi]] of Object.entries(spec.vars)) {
      let val = lo + (hi - lo) * rand()
      if (spec.integerVars?.includes(v)) val = Math.round(val)
      scope[v] = val
    }
    for (const [v, m] of Object.entries(spec.matVars ?? {})) scope[v] = sampleMatrix(m, rand)
    for (const [v, fn] of Object.entries(spec.derived ?? {})) scope[v] = fn(scope)
    let sv: number[], rv: number[]
    try {
      sv = toFlat(student.evaluate({ ...scope }))
    } catch (e) {
      return { ok: false, reason: `Your expression failed to evaluate: ${(e as Error).message}`, normalized }
    }
    rv = toFlat(reference.evaluate({ ...scope }))
    if (sv.length !== rv.length) return { ok: false, reason: `Shape mismatch: your answer has ${sv.length} entr${sv.length === 1 ? 'y' : 'ies'}, the correct one has ${rv.length}.`, normalized }
    for (let k = 0; k < rv.length; k++) {
      if (Number.isNaN(sv[k])) return { ok: false, reason: 'Your expression is undefined or complex at a test point.', normalized }
      if (!(Math.abs(sv[k] - rv[k]) <= tol * Math.max(1, Math.abs(rv[k])))) return { ok: false, reason: 'Not equivalent to the correct expression (checked at random matrices and vectors).', normalized }
    }
  }
  return { ok: true, reason: 'Equivalent to the reference at all sampled matrices and vectors.', normalized }
}
