import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText, fmt } from '../../components/Tex'
import { mapGrad, mapSolve, mapHessian, symEig, icdAlpha, lineSearchAlpha, scale, eye, matScale, ex51B } from '../../math/mapopt'
import { MODULE } from './constants'

/** Independent practice: a generated numerical variation (not an exam question) so every answer is a checkable number. */
const A = [[1, 0.5], [0, 1]]
const y = [2, 1]
const lam = 0.5
const B = matScale(lam, eye(2))
const g0 = mapGrad(A, y, B, [0, 0])
const xhat = mapSolve(A, y, B)
const { values: ev } = symEig(mapHessian(A, B))
const alphaMax = 2 / ev[1]
const icd1 = icdAlpha(A, y, B, [0, 0], 0)
const d0 = scale(-1, g0)
const ls = lineSearchAlpha(A, y, B, [0, 0], d0)
const noBlur = 0 + icdAlpha(eye(3), [4, 0, 0], ex51B(3, lam), [0, 2, 2], 0)

export function Independent() {
  return (
    <div>
      <h2>Independent problem: compute every quantity on a concrete model</h2>
      <Callout title="Generated practice (not an exam question)">
        <MathText>{'$f(x) = \\tfrac12\\|y - Ax\\|^2 + \\tfrac{\\lambda}{2}\\|x\\|^2$ with $A = \\begin{bmatrix}1 & 0.5\\\\ 0 & 1\\end{bmatrix}$, $y = (2, 1)^t$, $\\lambda = 0.5$ (so $B = \\lambda I$). Start from $x^{(0)} = 0$. Work on paper, then enter numbers (fractions like 8/17 are fine). No hints: this is the test of transfer from 2023 P2 and 2024 P1.'}</MathText>
      </Callout>

      <h3>A · Gradient at the start</h3>
      <AnswerBox id="mapopt/indep/grad1" module={MODULE} tags={['matrix-calculus']} mode="independent" prompt={<MathText>{'$[\\nabla f(0)]_1 = $'}</MathText>} expected={g0[0]} placeholder="number" solution="$\\nabla f(0) = -A^ty = -(2, 0.5\\cdot2 + 1) = (-2, -2)$." />
      <AnswerBox id="mapopt/indep/grad2" module={MODULE} tags={['matrix-calculus']} mode="independent" prompt={<MathText>{'$[\\nabla f(0)]_2 = $'}</MathText>} expected={g0[1]} placeholder="number" solution="$[\\nabla f(0)]_2 = -(A^ty)_2 = -2$." />

      <h3>B · The closed-form MAP estimate (2023 P2c)</h3>
      <AnswerBox id="mapopt/indep/xhat1" module={MODULE} tags={['matrix-calculus']} mode="independent" prompt={<MathText>{'$\\hat x_1 = $'}</MathText>} expected={xhat[0]} placeholder="number, 3 decimals or a fraction" solution={`$H = A^tA + \\lambda I = \\begin{bmatrix}1.5 & 0.5\\\\ 0.5 & 1.75\\end{bmatrix}$, $A^ty = (2, 2)$, $\\det H = 2.375$: $\\hat x = H^{-1}A^ty = (${fmt(xhat[0], 4)}, ${fmt(xhat[1], 4)}) = (20/19, 16/19)$.`} />
      <AnswerBox id="mapopt/indep/xhat2" module={MODULE} tags={['matrix-calculus']} mode="independent" prompt={<MathText>{'$\\hat x_2 = $'}</MathText>} expected={xhat[1]} placeholder="number" solution="$\\hat x_2 = (-0.5\\cdot2 + 1.5\\cdot2)/2.375 = 16/19$." />

      <h3>C · Stability of gradient descent</h3>
      <AnswerBox id="mapopt/indep/alphamax" module={MODULE} tags={['eigenvalues']} mode="independent" prompt={<MathText>{'Largest stable step (supremum) $\\alpha_{\\max} = 2/h_{\\max}$ for $H = A^tA + \\lambda I$:'}</MathText>} expected={alphaMax} placeholder="number, 3 decimals" solution={`Eigenvalues of $H$: $1.625 \\pm \\sqrt{0.125^2 + 0.25}$, so $h_{\\max} = ${fmt(ev[1], 4)}$ and $\\alpha_{\\max} = ${fmt(alphaMax, 4)}$.`} />

      <h3>D · One ICD update (2023 P2e, 2024 P1d)</h3>
      <AnswerBox id="mapopt/indep/icd" module={MODULE} tags={['matrix-calculus']} mode="independent" prompt={<MathText>{'From $x = 0$, update pixel 1: $x_1 \\leftarrow 0 + \\alpha$ with $\\alpha = $'}</MathText>} expected={icd1} placeholder="number or fraction" solution="$\\alpha = \\dfrac{(y - Ax)^tA_{*,1} - \\lambda x_1}{\\|A_{*,1}\\|^2 + \\lambda} = \\dfrac{(2, 1)\\cdot(1, 0) - 0}{1 + 0.5} = \\dfrac{4}{3}$." />

      <h3>E · One line-search step (2024 P1b)</h3>
      <AnswerBox id="mapopt/indep/ls" module={MODULE} tags={['calculus-1d', 'matrix-calculus']} mode="independent" prompt={<MathText>{'From $x = 0$ along $d = -\\nabla f(0)$: $\\alpha^* = $'}</MathText>} expected={ls} placeholder="number or fraction" solution="$d = (2, 2)$, $d^td = 8$, $d^tHd = 4(1.5 + 0.5 + 0.5 + 1.75) = 17$: $\\alpha^* = 8/17$." />

      <h3>F · ICD without blur (lecture 14, slide 10)</h3>
      <AnswerBox id="mapopt/indep/noblur" module={MODULE} tags={['matrix-calculus']} mode="independent" prompt={<MathText>{'$A = I$, GMRF prior with $g_{\\pm1} = \\tfrac12$, $\\lambda = 0.5$. Pixel $s$ has $y_s = 4$ and both neighbours equal to $2$. The ICD update sets $x_s = $'}</MathText>} expected={noBlur} placeholder="number or fraction" solution="$x_s \\leftarrow \\dfrac{y_s + \\lambda\\sum_r g_{s-r}x_r}{1 + \\lambda} = \\dfrac{4 + 0.5\\cdot2}{1.5} = \\dfrac{10}{3}$: a weighted average of the measurement (weight 1) and the neighbours’ prediction (weight $\\lambda$)." />

      <h3>G · Reasoning (2021 Q2 pattern)</h3>
      <Choice id="mapopt/indep/beta" module={MODULE} tags={['gaussian-density']} mode="independent"
        question="With prior $p(x) = \\tfrac{1}{z_\\beta}\\exp\\{-\\beta u(x)\\}$ and $u(x) = \\|x - x^*\\|^2$, what is wrong with the estimate obtained at $\\beta = 0$, and what is wrong at $\\beta \\to \\infty$?"
        options={['$\\beta = 0$: ML, low bias but high variance (noise amplified by $A^{-1}$); $\\beta \\to \\infty$: $\\hat x = x^*$, zero variance but it ignores the data', '$\\beta = 0$: the prior is undefined so no estimate exists; $\\beta \\to \\infty$: the ML estimate', 'Both limits give the same estimate', '$\\beta = 0$: high bias; $\\beta \\to \\infty$: high variance']}
        answer={0}
        explain="2021 Q2.3 and Q2.7: at $\\beta = 0$ the estimate is maximum likelihood, unbiased but with high variance; as $\\beta \\to \\infty$ the prior becomes $\\delta(x - x^*)$ and $\\hat x = x^*$ regardless of $y$." />
    </div>
  )
}
