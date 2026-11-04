import { AnswerBox, Callout, Choice } from '../../components/ui'
import { MathText, fmt } from '../../components/Tex'
import { sumAbsStep, huberSymA, eigSym2, lsHessian } from '../../math/surrogate'
import { MODULE } from './constants'

/**
 * Independent problem: transfer of method. Generated variation (not an exam question):
 * g(x) = |x| + |x−1| + |x−5| (the 2024 P2g structure with concrete x_k), one MM step from x′ = 3,
 * then the Huber symmetric-bound coefficient (lecture 19) and the λ_max surrogate (2022 Q4 structure).
 */
export function Independent() {
  const xs = [0, 1, 5]
  const x1 = sumAbsStep(xs, 3)
  const A: [[number, number], [number, number]] = [[1, 2], [0, 1]]
  const lmax = eigSym2(lsHessian(A))[1]
  return (
    <div>
      <h2>Independent problem: transfer the method</h2>
      <Callout kind="warn" title="Generated practice (not an exam question)">
        <MathText>{'Part A. $g(x) = |x| + |x-1| + |x-5|$. Part B. Huber potential with $T = 1$ at $\\Delta^\\prime = 4$. Part C. $f(x) = \\tfrac12\\|y - Ax\\|^2$ with $A = \\begin{bmatrix}1 & 2\\\\ 0 & 1\\end{bmatrix}$. No hints; the solution appears only after a correct answer. Each part is logged as an independent attempt.'}</MathText>
      </Callout>

      <h3>Part A · Sum of absolute values (structure of 2024 P2g–h)</h3>
      <AnswerBox id="surrogate/indep/gq" module={MODULE} tags={['calculus-1d']} mode="independent"
        prompt={<MathText>{'General surrogate $g(x;x^\\prime) = $ (use x, xp; constants may be included or dropped, both are accepted below)'}</MathText>}
        spec={{ reference: 'x^2/(2*abs(xp)) + (x-1)^2/(2*abs(xp-1)) + (x-5)^2/(2*abs(xp-5))', vars: { x: [-3, 7], xp: [-2, 7] }, upToConstant: 'x' }}
        placeholder="sum of three quadratics"
        solution="$g(x;x^\\prime) = \\dfrac{x^2}{2|x^\\prime|} + \\dfrac{(x-1)^2}{2|x^\\prime-1|} + \\dfrac{(x-5)^2}{2|x^\\prime-5|}$ (+ const). Additivity of surrogates. Graded up to an additive constant, so including or dropping $|x^\\prime - x_k|/2$ is accepted." />
      <AnswerBox id="surrogate/indep/x1" module={MODULE} tags={['calculus-1d']} mode="independent"
        prompt={<MathText>{'One MM step from $x^\\prime = 3$: $x_1 = $'}</MathText>}
        expected={x1}
        solution={`Weights $w_k = 1/|3 - x_k| = (1/3, 1/2, 1/2)$; $x_1 = \\dfrac{\\tfrac13\\cdot0 + \\tfrac12\\cdot1 + \\tfrac12\\cdot5}{\\tfrac13+\\tfrac12+\\tfrac12} = \\dfrac{3}{4/3} = ${fmt(x1, 4)}$.`} />
      <Choice id="surrogate/indep/limit" module={MODULE} tags={['convexity']} mode="independent"
        question="Repeating $x^\\prime \\leftarrow \\arg\\min_x g(x;x^\\prime)$ converges to which value, and why is it the global minimum?"
        options={['$x = 1$, the median of $\\{0, 1, 5\\}$; $g$ is convex so the fixed point of MM is its global minimiser', '$x = 2$, the mean of $\\{0, 1, 5\\}$', '$x = 5$, the largest data point', 'It depends on the starting point']}
        answer={0}
        explain="$g$ is a sum of convex functions, hence convex; the fixed-point property (lecture 19, slide 4) says a fixed point of the MM iteration is a stationary point, and for convex $g$ that is the global minimum. The minimiser of $\\sum|x-x_k|$ is the median: $g^\\prime(x) = \\#\\{x_k<x\\} - \\#\\{x_k>x\\}$ changes sign at $1$." />

      <h3>Part B · Symmetric bound coefficient for Huber (lecture 19)</h3>
      <AnswerBox id="surrogate/indep/huber" module={MODULE} tags={['calculus-1d']} mode="independent"
        prompt={<MathText>{'Huber $\\rho(\\Delta) = \\Delta^2/2$ for $|\\Delta|<T$, $T|\\Delta| - T^2/2$ otherwise, with $T = 1$. The symmetric-bound curvature $a_2 = \\rho^\\prime(\\Delta^\\prime)/\\Delta^\\prime$ at $\\Delta^\\prime = 4$ is'}</MathText>}
        expected={huberSymA(1, 4)}
        solution="$\\rho^\\prime(\\Delta) = \\mathrm{clip}\\{\\Delta, [-T, T]\\}$, so $\\rho^\\prime(4) = 1$ and $a_2 = 1/4 = 0.25$. The maximum-curvature method would use $c_{\\max} = 1$: four times stiffer." />

      <h3>Part C · Scalar-curvature surrogate for ½‖y − Ax‖² (structure of 2022 Q4)</h3>
      <AnswerBox id="surrogate/indep/lmax" module={MODULE} tags={['eigenvalues', 'matrix-calculus']} mode="independent"
        prompt={<MathText>{'The smallest $a$ such that $\\tfrac a2\\|x-x^\\prime\\|^2 + \\nabla f(x^\\prime)^t(x-x^\\prime) + f(x^\\prime)$ is a surrogate for $f$: $a = $'}</MathText>}
        expected={lmax}
        solution={`$A^tA = \\begin{bmatrix}1 & 2\\\\ 2 & 5\\end{bmatrix}$, trace 6, determinant 1, eigenvalues $3 \\pm 2\\sqrt2$; $a = \\lambda_{\\max} = 3 + 2\\sqrt2 = ${fmt(lmax, 4)}$.`} />
      <AnswerBox id="surrogate/indep/update" module={MODULE} tags={['matrix-calculus']} mode="independent"
        prompt={<MathText>{'First component of the MM update from $x^\\prime = (0, 0)$ with $y = (1, 1)$: $x_1[0] = $ (number)'}</MathText>}
        expected={1 / lmax}
        solution={`$\\nabla f(x^\\prime) = A^t(Ax^\\prime - y) = -A^ty = -(1, 3)$; $x_1 = x^\\prime - \\nabla f/a = (1, 3)/${fmt(lmax, 4)}$, so $x_1[0] = ${fmt(1 / lmax, 4)}$.`} />
    </div>
  )
}
