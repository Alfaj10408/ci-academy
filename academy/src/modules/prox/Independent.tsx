import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText, fmt } from '../../components/Tex'
import { proxGrid, proxDenoise, clipPos, admmRun, proxLS, mannStep, swap, diagProjection, icdShrinkStep, shrinkVec } from '../../math/prox'
import { MODULE } from './constants'

/** Independent practice: generated numerical variations (not exam questions). Every value is computed by the module's math core. */
const F = proxGrid((x) => 0.5 * (x - 2) ** 2 + Math.abs(x), 1, 4, -2, 6, 80001)
const adm = admmRun((z) => proxDenoise([-1], 1, z), clipPos, 1, 80)
const p3c = proxLS([[2]], [[1]], 1, [1], [5])[0]
const mann1 = mannStep(swap, 0.25, [5, -1])
const mlim = diagProjection([5, -1])
const icd = icdShrinkStep(-2, 4, 1, 0)
const tvv = shrinkVec(0.5, [0.3, -2, 1.5])

export function Independent() {
  return (
    <div>
      <h2>Independent problem: compute every quantity by hand</h2>
      <Callout title="Generated practice (not an exam question)"><p>Seven short computations in the style of 2022 Q3, 2024 P3, 2025 P2 and 2025 P4, with concrete numbers so every answer is checkable. No hints: this is the test of transfer.</p></Callout>

      <h3>A · A proximal map by cases</h3>
      <AnswerBox id="prox/indep/F" module={MODULE} tags={['case-analysis']} mode="independent" prompt={<MathText>{'$f(x) = \\tfrac12(x - 2)^2 + |x|$, $\\sigma^2 = 1$, $z = 4$. $F(z) = \\arg\\min_x\\{f(x) + \\tfrac{1}{2\\sigma^2}(x - z)^2\\} = $'}</MathText>} expected={F} placeholder="number" solution="Try $x > 0$: $(x - 2) + 1 + (x - 4) = 0 \\Rightarrow x = 2.5 > 0$, consistent. $F(4) = 2.5$: the stake at $4$ pulls the Module 2 minimiser $1$ up to $2.5$." />

      <h3>B · Two ADMM iterations by hand (2022 Q3.4 with a clip)</h3>
      <MathText>{'Scalar denoising with positivity: $f(x) = \\tfrac12(y - x)^2$ with $y = -1$, $h$ the positivity indicator, $a = 1$. Then $F(z) = (y + az)/(1 + a) = (z - 1)/2$ and $H(z) = \\max(z, 0)$. Start with $u = 0$, $v = 0$.'}</MathText>
      <AnswerBox id="prox/indep/x1" module={MODULE} tags={['lagrangian']} mode="independent" prompt={<MathText>{'After the first iteration, $x = $'}</MathText>} expected={adm[1].x[0]} placeholder="number" solution="$x = F(v - u) = F(0) = -\\tfrac12$." />
      <AnswerBox id="prox/indep/u1" module={MODULE} tags={['lagrangian']} mode="independent" prompt={<MathText>{'After the first iteration, $u = $'}</MathText>} expected={adm[1].u[0]} placeholder="number" solution="$v = H(x + u) = \\max(-\\tfrac12, 0) = 0$, then $u = u + (x - v) = -\\tfrac12$." />
      <AnswerBox id="prox/indep/ulim" module={MODULE} tags={['lagrangian']} mode="independent" prompt={<MathText>{'The limit of $u$ as the iterations continue: $u^{(\\infty)} = $'}</MathText>} expected={adm[80].u[0]} placeholder="number" solution="At the fixed point $x = v = 0$ (the solution $\\max(y, 0)$), $x = F(-u) = 0$ requires $-u - 1 = 0$: $u^{(\\infty)} = -1$. The scaled multiplier is the price that holds $x$ at the constraint; $\\lambda^* = au = -1$." />

      <h3>C · 2024 P3c with numbers</h3>
      <AnswerBox id="prox/indep/p3c" module={MODULE} tags={['matrix-calculus']} mode="independent" prompt={<MathText>{'Scalars: $A = 2$, $\\Lambda = 1$, $\\sigma^2 = 1$, $v = 1$, $y = 5$. $F(v; y) = v + (\\tfrac{1}{\\sigma^2} + A^2\\Lambda)^{-1}A\\Lambda(y - Av) = $'}</MathText>} expected={p3c} placeholder="number" solution={`$F = 1 + (1 + 4)^{-1}\\cdot 2\\cdot(5 - 2) = 1 + 6/5 = ${fmt(p3c)}$.`} />

      <h3>D · One Mann step and its limit (2025 P4)</h3>
      <AnswerBox id="prox/indep/mann1" module={MODULE} tags={['fixed-point']} mode="independent" prompt={<MathText>{'$x^{(0)} = (5, -1)$, $\\alpha = 0.25$. First component after one step of $x \\leftarrow (1 - \\alpha)x + \\alpha H(x)$: '}</MathText>} expected={mann1[0]} placeholder="number" solution="$0.75\\cdot5 + 0.25\\cdot(-1) = 3.5$ (and the second component is $0.5$)." />
      <AnswerBox id="prox/indep/mannlim" module={MODULE} tags={['fixed-point']} mode="independent" prompt={<MathText>{'First component of the limit: '}</MathText>} expected={mlim[0]} placeholder="number" solution="The sum $x_1 + x_2 = 4$ is preserved; the limit is $(2, 2)$." />

      <h3>E · A Laplacian-prior ICD step is a shrinkage (lecture 23)</h3>
      <AnswerBox id="prox/indep/icd" module={MODULE} tags={['case-analysis']} mode="independent" prompt={<MathText>{'$\\theta_1 = -2$, $\\theta_2 = 4$, $\\lambda = 1$, $x_{old} = 0$. $x_s \\leftarrow S_{\\lambda/\\theta_2}(x_{old} - \\theta_1/\\theta_2) = $'}</MathText>} expected={icd} placeholder="number" solution="$x_{old} - \\theta_1/\\theta_2 = 0.5$, threshold $\\lambda/\\theta_2 = 0.25$: $S_{0.25}(0.5) = 0.25$." />

      <h3>F · The TV v update</h3>
      <AnswerBox id="prox/indep/tv" module={MODULE} tags={['case-analysis']} mode="independent" prompt={<MathText>{'$Bx + u = (0.3, -2, 1.5)$, $\\lambda = 1$, $a = 2$. The second component of $v \\leftarrow S_{\\lambda/a}(Bx + u)$ is '}</MathText>} expected={tvv[1]} placeholder="number" solution={`Threshold $\\lambda/a = 0.5$: $S_{0.5}(0.3, -2, 1.5) = (${tvv.map((v) => fmt(v)).join(', ')})$.`} />

      <h3>G · Reasoning</h3>
      <Choice id="prox/indep/pnp" module={MODULE} tags={['fixed-point']} mode="independent"
        question="A denoiser $H_\\theta$ trained with the MSE loss replaces the prior’s proximal map in PnP-ADMM. Which statement follows from lecture 25?"
        options={['PnP-ADMM then minimises no cost function in general, because most trained denoisers are not conservative and hence not proximal maps (Moreau)', 'PnP-ADMM minimises $f(x) + h(x)$ with $h = -\\log p(x)$ learned from data', 'The iteration cannot converge because $H_\\theta$ is not a contraction', 'The denoiser must be retrained for every $a$']}
        answer={0}
        explain="Lecture 25 slides 12 and 19–22: with a general action in place of $H$, PnP-ADMM is no longer solving an optimisation problem; a differentiable map is a proximal map only if its Jacobian is symmetric, which trained denoisers rarely satisfy. Convergence is a separate question (nonexpansive maps, Mann iteration)." />
    </div>
  )
}
