import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText } from '../../components/Tex'
import { MODULE } from './constants'

const col = (A: number[][], i: number) => A.map((r) => r[i])
const mats = { A: { rows: 3, cols: 3 }, B: { rows: 3, cols: 3, posdef: true }, x: { rows: 3 }, y: { rows: 3 } }
const gradDir = (s: Record<string, unknown>) => {
  const A = s.A as number[][], B = s.B as number[][], x = s.x as number[], y = s.y as number[]
  const r = y.map((yi, i) => yi - A[i].reduce((a, v, j) => a + v * x[j], 0))
  return x.map((_, j) => A.reduce((a, row, i) => a + row[j] * r[i], 0) - B[j].reduce((a, v, k) => a + v * x[k], 0))
}

/** Guided problem: Midterm 2024, Problem 1 (ICD update / line search), original wording, official key. */
export function Guided() {
  return (
    <div>
      <h2>Guided problem solving: line search and ICD (2024 P1)</h2>
      <Callout title="Problem (original wording, 30 pt)">
        <MathText>{'Our goal is to minimize the MAP cost function $f(x) = \\tfrac12\\|y - Ax\\|^2 + \\tfrac12 x^tBx$, by performing the line search given by $\\alpha^* = \\arg\\min_\\alpha\\{f(x + \\alpha d)\\}$, where $d$ is the direction. (a) For gradient descent optimization, give an expression for $d$. (b) For gradient descent optimization, derive an expression for $\\alpha^*$. (c) For coordinate descent optimization, give an expression for $d$. (d) For coordinate descent optimization, derive an expression for $\\alpha^*$. (e) Give a condition on $d$ that ensures that $\\alpha^* \\ge 0$.'}</MathText>
        <MathText className="small muted">{'Official key. Vector answers are graded by evaluation at random 3×3 matrices ($B$ symmetric positive definite) and random vectors. Type transposes as ^t, columns as A_(*,i), entries as x_i and B_(i,i), norms as ||v||. Hints go from concept (1) to full solution (5); hint use is recorded.'}</MathText>
      </Callout>

      <h3>Step 1 · (a) The gradient direction</h3>
      <AnswerBox id="mapopt/guided/a" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'$d = $'}</MathText>}
        spec={{ reference: "A'*(y - A*x) - B*x", vars: {}, matVars: mats }}
        placeholder="e.g. A^t(y - Ax) - Bx"
        hints={['Gradient descent moves opposite the gradient.', '$\\nabla f(x) = -A^t(y - Ax) + Bx$ (data term by the chain rule, prior term since $B$ is symmetric).', 'So $d = -\\nabla f(x)$.', '$d = A^t(y - Ax) - Bx$.', 'Key (a): $d = -\\nabla f(x) = A^t(y - Ax) - Bx$.']}
        solution="$d = -\\nabla f(x) = A^t(y - Ax) - Bx$." />

      <h3>Step 2 · (b) Derive α* along any direction, then specialise</h3>
      <AnswerBox id="mapopt/guided/b" module={MODULE} tags={['calculus-1d', 'matrix-calculus']} mode="guided"
        prompt={<MathText>{'$\\alpha^* = $ for a general direction $d$ (in terms of $d, A, B, x, y$)'}</MathText>}
        spec={{ reference: "(d'*(A'*(y - A*x) - B*x))/(d'*(A'*A + B)*d)", vars: {}, matVars: { ...mats, d: { rows: 3 } } }}
        placeholder="e.g. (d^t[A^t(y-Ax) - Bx]) / (d^t[A^tA + B]d)"
        hints={['$g(\\alpha) = f(x + \\alpha d)$ is a parabola in $\\alpha$; minimise it by $g^\\prime(\\alpha) = 0$.', 'Chain rule: $g^\\prime(\\alpha) = d^t\\nabla f(x + \\alpha d)$.', '$\\nabla f(x + \\alpha d) = -A^t(y - Ax - \\alpha Ad) + B(x + \\alpha d) = \\nabla f(x) + \\alpha(A^tA + B)d$.', '$0 = d^t\\nabla f(x) + \\alpha\\,d^t(A^tA + B)d \\Rightarrow \\alpha^* = -d^t\\nabla f(x)/d^t(A^tA + B)d$.', 'Key (b): $\\alpha^* = \\dfrac{d^t[A^t(y - Ax) - Bx]}{d^t[A^tA + B]d}$.']}
        solution="$0 = \\frac{d}{d\\alpha}f(x + \\alpha d) = d^t[\\nabla f(x) + \\alpha(A^tA + B)d]$, so $\\alpha^* = \\dfrac{d^t[A^t(y - Ax) - Bx]}{d^t[A^tA + B]d}$." />
      <AnswerBox id="mapopt/guided/b2" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'$\\alpha^* = $ for the gradient direction of (a), simplified (you may use $d$ for that direction)'}</MathText>}
        spec={{ reference: "(d'*d)/(d'*(A'*A + B)*d)", vars: {}, matVars: mats, derived: { d: gradDir } }}
        placeholder="e.g. d^t d / (d^t[A^tA+B] d)"
        hints={['Substitute $d = A^t(y - Ax) - Bx$ into the numerator of (b).', 'The numerator becomes $d^td$.', 'So $\\alpha^* = \\|d\\|^2 / d^t(A^tA + B)d$.', 'This is steepest descent: lecture 13 slide 19, $\\alpha = \\|d\\|^2/\\|d\\|_H^2$.', 'Key (b), second line: $\\alpha^* = \\dfrac{d^td}{d^t[A^tA + B]d}$.']}
        solution="For $d = A^t(y - Ax) - Bx$ the numerator is $d^td$: $\\alpha^* = \\dfrac{d^td}{d^t[A^tA + B]d}$." />

      <h3>Step 3 · (c) The coordinate direction</h3>
      <Choice id="mapopt/guided/c" module={MODULE} tags={['matrix-calculus']} mode="guided"
        question="For coordinate descent on pixel $i$, the direction is"
        options={['$d = e_i$, the unit vector with $[e_i]_k = \\delta(i - k)$', '$d = A_{*,i}$, the $i$-th column of $A$', '$d = -\\nabla f(x)$ restricted to its $i$-th entry times $A$', '$d = B_{*,i}$']}
        answer={0}
        explain="Coordinate descent changes one pixel: $x + \\alpha e_i$ (key (c); lecture 14 slide 6 writes $\\varepsilon_s$)." />

      <h3>Step 4 · (d) Specialise the line search to d = e_i</h3>
      <AnswerBox id="mapopt/guided/d" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'$\\alpha^* = $ (in terms of $A_{*,i}$, $B_{*,i}$, $B_{i,i}$, $x$, $y$)'}</MathText>}
        spec={{ reference: "((y - A*x)'*Ai - x'*Bi)/(norm(Ai)^2 + Bii)", vars: {}, matVars: mats, derived: { Ai: (s) => col(s.A as number[][], 1), Bi: (s) => col(s.B as number[][], 1), Bii: (s) => (s.B as number[][])[1][1], xi: (s) => (s.x as number[])[1] } }}
        placeholder="e.g. ((y-Ax)^t A_(*,i) - x^t B_(*,i)) / (||A_(*,i)||^2 + B_(i,i))"
        hints={['Put $d = e_i$ into the general formula of (b).', '$Ae_i = A_{*,i}$ (the $i$-th column), $Be_i = B_{*,i}$, $e_i^tBe_i = B_{i,i}$.', 'Numerator: $e_i^t[A^t(y - Ax) - Bx] = (y - Ax)^tA_{*,i} - x^tB_{*,i}$.', 'Denominator: $e_i^t(A^tA + B)e_i = \\|A_{*,i}\\|^2 + B_{i,i}$.', 'Key (d): $\\alpha^* = \\dfrac{(y - Ax)^tA_{*,i} - x^tB_{*,i}}{\\|A_{*,i}\\|^2 + B_{i,i}}$. With $B = \\lambda I$ this is 2023 P2e.']}
        solution="$\\alpha^* = \\dfrac{(y - Ax)^tA_{*,i} - x^tB_{*,i}}{\\|A_{*,i}\\|^2 + B_{i,i}}$ (lecture 14, slide 6)." />

      <h3>Step 5 · (e) When is the step nonnegative?</h3>
      <Choice id="mapopt/guided/e" module={MODULE} tags={['calculus-1d']} mode="guided"
        question="$\\alpha^* \\ge 0$ is guaranteed when"
        options={['$d^t\\nabla f(x) \\le 0$: $d$ is a descent direction, so the numerator $d^t[A^t(y - Ax) - Bx] \\ge 0$', '$\\|d\\| = 1$', '$d^t(A^tA + B)d \\le 0$', '$d = A^ty$']}
        answer={0}
        explain="The denominator $d^t(A^tA + B)d$ is positive for $B \\succ 0$, so the sign of $\\alpha^*$ is the sign of the numerator $-d^t\\nabla f(x)$. Key (e): $d^t\\nabla f(x) \\le 0$, equivalently $(y - Ax)^tAd - x^tBd \\ge 0$." />
    </div>
  )
}
