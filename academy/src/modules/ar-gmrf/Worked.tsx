import { AnswerBox, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import { Heatmap } from '../../components/Plot'
import { precisionMatrix, snc2, g1 } from '../../math/argmrf'
import { MODULE } from './constants'

export function Worked() {
  const a = { rho: 0.5, sc2: 1 }
  const b = { rho: 0.8, sc2: 2 }
  return (
    <div>
      <h2>Fully worked numerical example: ρ = 0.5, σ_C² = 1</h2>
      <div className="grid4">
        <div>
          <div className="eq"><Tex block>{'|1-H(\\omega)|^2 = 1 - 2(0.5)\\cos\\omega + 0.25 = 1.25 - \\cos\\omega'}</Tex></div>
          <div className="eq"><Tex block>{'S_X(\\omega) = \\frac{1}{1.25-\\cos\\omega}; \\quad S_X(0) = 4, \\; S_X(\\pi) = 0.444'}</Tex></div>
          <div className="eq"><Tex block>{'\\sigma_{NC}^2 = \\frac{1}{1+0.25} = 0.8 \\;<\\; \\sigma_C^2 = 1'}</Tex></div>
          <div className="eq"><Tex block>{'g_1 = \\frac{0.5}{1.25} = 0.4, \\quad g_n = 0.4[\\delta(n-1)+\\delta(n+1)]'}</Tex></div>
          <div className="eq"><Tex block>{'G(\\omega) = 0.8\\cos\\omega; \\quad \\frac{0.8}{1-0.8\\cos\\omega} = \\frac{1}{1.25-\\cos\\omega} \\;\\checkmark'}</Tex></div>
          <div className="eq"><Tex block>{'B_{i,i} = \\frac{1.25}{1} = 1.25, \\quad B_{i,i\\pm1} = -0.5, \\quad B_{0,0} = B_{p-1,p-1} = 1'}</Tex></div>
          <MathText>{'Sanity checks you should always run: $\\sigma_{NC}^2 \\le \\sigma_C^2$ (more data, smaller error); $g_1$ has the sign of $\\rho$ and $|g_1| \\le 1/2$; the GMRF form reproduces the AR spectrum at $\\omega = 0$: $0.8/(1-0.8) = 4$.'}</MathText>
        </div>
        <div>
          <Heatmap M={precisionMatrix(a, 5)} title="B for p = 5, ρ = 0.5, σ_C² = 1" />
          <MathText className="small muted">{'Row 2 reads: $-0.5\\,X_1 + 1.25\\,X_2 - 0.5\\,X_3$. Dividing by $B_{2,2}$ recovers the predictor: $E[X_2|\\text{rest}] = 0.4(X_1+X_3)$ and variance $1/1.25 = 0.8$.'}</MathText>
        </div>
      </div>

      <h2>Partially completed problem: ρ = 0.8, σ_C² = 2</h2>
      <Callout title="Your turn to finish">
        <MathText>{'$|1-H(\\omega)|^2 = 1 - 1.6\\cos\\omega + 0.64 = 1.64 - 1.6\\cos\\omega$ and $S_X(\\omega) = 2/(1.64-1.6\\cos\\omega)$ are done for you. Fill in the rest (3 significant figures are enough; expressions like 2/1.64 are accepted).'}</MathText>
      </Callout>
      <AnswerBox id="ar-gmrf/worked/snc2" module={MODULE} tags={['psd']} mode="guided" prompt={<MathText>{'$\\sigma_{NC}^2 = $'}</MathText>} expected={snc2(b)} placeholder="number"
        hints={['$\\sigma_{NC}^2 = \\sigma_C^2/(1+\\rho^2)$.', '$1+\\rho^2 = 1.64$.', '$2/1.64$.', `$= ${fmt(snc2(b), 4)}$.`, `$\\sigma_{NC}^2 = 2/1.64 = ${fmt(snc2(b), 4)}$.`]} solution={`$2/1.64 = ${fmt(snc2(b), 4)}$`} />
      <AnswerBox id="ar-gmrf/worked/g1" module={MODULE} tags={['convolution']} mode="guided" prompt={<MathText>{'$g_1 = $'}</MathText>} expected={g1(b.rho)} placeholder="number"
        hints={['$g_1 = \\rho/(1+\\rho^2)$.', '$0.8/1.64$.', `$= ${fmt(g1(b.rho), 4)}$.`, 'Check: positive like $\\rho$, and below $1/2$.', `$g_1 = ${fmt(g1(b.rho), 4)}$.`]} solution={`$0.8/1.64 = ${fmt(g1(b.rho), 4)}$`} />
      <AnswerBox id="ar-gmrf/worked/bdiag" module={MODULE} tags={['precision-matrix']} mode="guided" prompt={<MathText>{'Interior diagonal $B_{i,i} = $'}</MathText>} expected={(1 + b.rho ** 2) / b.sc2} placeholder="number"
        hints={['$B_{i,i} = 1/\\sigma_{NC}^2 = (1+\\rho^2)/\\sigma_C^2$.', '$1.64/2$.', '$= 0.82$.', 'Equivalently $1/1.2195 = 0.82$.', '$B_{i,i} = 0.82$.']} solution="$1.64/2 = 0.82$" />
      <AnswerBox id="ar-gmrf/worked/boff" module={MODULE} tags={['precision-matrix']} mode="guided" prompt={<MathText>{'Off-diagonal $B_{i,i\\pm1} = $'}</MathText>} expected={-b.rho / b.sc2} placeholder="number (mind the sign)"
        hints={['$B_{i,i\\pm1} = -g_1/\\sigma_{NC}^2 = -\\rho/\\sigma_C^2$.', '$-0.8/2$.', '$= -0.4$.', 'Negative because $\\rho>0$: neighbours pull the prediction up, which appears with a minus sign in the quadratic form.', '$B_{i,i\\pm1} = -0.4$.']} solution="$-0.8/2 = -0.4$" />
      <AnswerBox id="ar-gmrf/worked/bbound" module={MODULE} tags={['precision-matrix', 'gaussian-density']} mode="guided" prompt={<MathText>{'Boundary diagonal $B_{0,0} = B_{p-1,p-1} = $'}</MathText>} expected={1 / b.sc2} placeholder="number"
        hints={['The end samples have one neighbour in the block, so the $\\rho^2$ term is missing.', '$B_{0,0} = 1/\\sigma_C^2$.', '$1/2$.', 'Check by inverting the $2\\times2$ covariance $\\frac{\\sigma_C^2}{1-\\rho^2}\\begin{bmatrix}1&\\rho\\\\\\rho&1\\end{bmatrix}$: its inverse has diagonal $1/\\sigma_C^2$.', '$B_{0,0} = 0.5$.']} solution="$1/2 = 0.5$" />
    </div>
  )
}
