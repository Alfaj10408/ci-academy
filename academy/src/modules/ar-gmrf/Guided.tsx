import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText, fmt } from '../../components/Tex'
import { snc2, g1 } from '../../math/argmrf'
import { MODULE } from './constants'

/** Guided problem with a negative ρ to expose sign errors. ρ = −0.6, σ_C² = 3. */
export function Guided() {
  const m = { rho: -0.6, sc2: 3 }
  const fixed = { rho: m.rho, sc2: m.sc2 }
  return (
    <div>
      <h2>Guided problem solving</h2>
      <Callout title="Problem">
        <MathText>{'$X_n$ is a zero-mean stationary Gaussian AR process with $h(n) = -0.6\\,\\delta(n-1)$ and $\\sigma_C^2 = 3$. Find $S_X(\\omega)$, $\\sigma_{NC}^2$, $g(n)$, and the entries of the precision matrix of $Z = [X_n,\\ldots,X_{n+p-1}]^t$.'}</MathText>
        <p className="small muted">Symbolic answers may use rho and sc2 (they are set to −0.6 and 3), or you may substitute numbers. Hints go from concept (1) to full solution (5). Using a hint is recorded.</p>
      </Callout>

      <h3>Step 1 · Identify the concept</h3>
      <Choice id="ar-gmrf/guided/concept" module={MODULE} tags={['psd']} mode="guided"
        question="Which relationship produces $S_X(\\omega)$ from the causal parameters?"
        options={['Whitening: $R_X*(\\delta-h)*(\\delta-h_{-n}) = \\sigma_C^2\\delta$, then DTFT', 'Bayes’ rule on $p(x|y)$', 'The MAP cost function', 'Eigen-decomposition of the covariance']}
        answer={0}
        explain="The causal errors are white; their autocovariance equation transforms to $S_X|1-H|^2 = \\sigma_C^2$." />

      <h3>Step 2 · Write the power spectrum</h3>
      <AnswerBox id="ar-gmrf/guided/psd" module={MODULE} tags={['complex-euler', 'dtft', 'psd']} mode="guided"
        prompt={<MathText>{'$S_X(\\omega) = $ (a real expression in $\\omega$; you may keep $\\rho$ and $\\sigma_C^2$ symbolic)'}</MathText>}
        spec={{ reference: 'sc2/(1 - 2*rho*cos(w) + rho^2)', vars: { w: [-3.1, 3.1] }, fixed }}
        placeholder="e.g. sc2/|1 - rho e^{-j w}|^2 or 3/(1.36 + 1.2 cos(w))"
        hints={['Which equation relates $S_X$ to $H(\\omega)$ and $\\sigma_C^2$?', '$S_X(\\omega) = \\sigma_C^2/|1-H(\\omega)|^2$ with $H(\\omega) = \\rho e^{-j\\omega}$.', 'Expand the modulus: $|1-\\rho e^{-j\\omega}|^2 = 1-2\\rho\\cos\\omega+\\rho^2$.', 'With $\\rho = -0.6$: $1 + 1.2\\cos\\omega + 0.36$. The sign of the cosine term flips.', '$S_X(\\omega) = 3/(1.36 + 1.2\\cos\\omega)$: largest at $\\omega = \\pi$ (an alternating process).']}
        solution="$S_X(\\omega) = \\dfrac{3}{1.36 + 1.2\\cos\\omega}$. A common mistake is to write $1 - 1.2\\cos\\omega$: the formula has $-2\\rho\\cos\\omega$ and $\\rho$ is negative." />

      <h3>Step 3 · Noncausal prediction variance</h3>
      <AnswerBox id="ar-gmrf/guided/snc2" module={MODULE} tags={['psd', 'convolution']} mode="guided"
        prompt={<MathText>{'$\\sigma_{NC}^2 = $'}</MathText>} expected={snc2(m)} placeholder="number or expression"
        hints={['Evaluate the matching equation $\\sigma_C^2(\\delta_n-g_n) = \\sigma_{NC}^2(\\delta_n-h_n)*(\\delta_n-h_{-n})$ at $n=0$.', 'At $n=0$ the left side is $\\sigma_C^2$ (since $g_0=0$) and the autocorrelation is $1+\\rho^2$.', '$\\sigma_{NC}^2 = \\sigma_C^2/(1+\\rho^2) = 3/1.36$.', 'The sign of $\\rho$ does not matter here because it enters squared.', `$\\sigma_{NC}^2 = 3/1.36 = ${fmt(snc2(m), 4)}$.`]}
        solution={`$\\sigma_{NC}^2 = 3/1.36 = ${fmt(snc2(m), 4)}$`} />

      <h3>Step 4 · Noncausal prediction filter</h3>
      <AnswerBox id="ar-gmrf/guided/g" module={MODULE} tags={['convolution', 'time-reversal']} mode="guided"
        prompt={<MathText>{'$g(n) = $ (use delta(n-1), delta(n+1))'}</MathText>}
        spec={{ reference: 'rho/(1+rho^2)*(delta(n-1)+delta(n+1))', vars: { n: [-3, 3] }, integerVars: ['n'], fixed }}
        placeholder="e.g. rho/(1+rho^2) (delta(n-1)+delta(n+1))"
        hints={['$g_n = \\delta_n - (\\delta_n-h_n)*(\\delta_n-h_{-n})/(1+\\rho^2)$.', 'The autocorrelation is $(1+\\rho^2)\\delta_n - \\rho\\delta_{n-1} - \\rho\\delta_{n+1}$.', 'The $\\delta_n$ terms cancel exactly (that is why $g_0 = 0$).', '$g_n = \\frac{\\rho}{1+\\rho^2}[\\delta(n-1)+\\delta(n+1)]$ with $\\rho = -0.6$.', `$g_n = ${fmt(g1(m.rho), 4)}[\\delta(n-1)+\\delta(n+1)]$: negative, so each neighbour predicts the opposite sign.`]}
        solution={`$g(n) = \\dfrac{-0.6}{1.36}[\\delta(n-1)+\\delta(n+1)] = ${fmt(g1(m.rho), 4)}[\\delta(n-1)+\\delta(n+1)]$`} />

      <h3>Step 5 · Precision matrix entries</h3>
      <AnswerBox id="ar-gmrf/guided/bdiag" module={MODULE} tags={['precision-matrix']} mode="guided" prompt={<MathText>{'Interior diagonal $B_{i,i} = $'}</MathText>} expected={(1 + m.rho ** 2) / m.sc2}
        hints={['$B_{i,j} = (\\delta_{i-j}-g_{i-j})/\\sigma_{NC}^2$ (lecture 10, slide 9).', 'On the diagonal $g_0 = 0$ so $B_{i,i} = 1/\\sigma_{NC}^2$.', '$= (1+\\rho^2)/\\sigma_C^2 = 1.36/3$.', '$\\approx 0.4533$.', '$B_{i,i} = 1.36/3 = 0.4533$.']} solution="$1.36/3 = 0.4533$" />
      <AnswerBox id="ar-gmrf/guided/boff" module={MODULE} tags={['precision-matrix']} mode="guided" prompt={<MathText>{'Off-diagonal $B_{i,i\\pm1} = $'}</MathText>} expected={-m.rho / m.sc2} placeholder="mind the sign"
        hints={['$B_{i,i\\pm1} = -g_1/\\sigma_{NC}^2$.', '$-g_1/\\sigma_{NC}^2 = -\\rho/\\sigma_C^2$.', '$-(-0.6)/3$.', '$= +0.2$: positive because $\\rho<0$.', '$B_{i,i\\pm1} = 0.2$.']} solution="$-\\rho/\\sigma_C^2 = 0.6/3 = 0.2$" />
      <AnswerBox id="ar-gmrf/guided/bbound" module={MODULE} tags={['precision-matrix', 'gaussian-density']} mode="guided" prompt={<MathText>{'Boundary diagonal $B_{0,0} = $'}</MathText>} expected={1 / m.sc2}
        hints={['End samples have one neighbour inside the block.', 'Write $B = A^t\\Lambda^{-1}A$ with $A = I-H$ and $\\Lambda_{00} = \\sigma_C^2/(1-\\rho^2)$.', 'The $(0,0)$ entry collects $\\frac{1-\\rho^2}{\\sigma_C^2} + \\frac{\\rho^2}{\\sigma_C^2}$.', '$= 1/\\sigma_C^2 = 1/3$.', '$B_{0,0} = B_{p-1,p-1} = 1/3$.']} solution="$1/\\sigma_C^2 = 1/3$" />

      <h3>Step 6 · Interpret</h3>
      <Choice id="ar-gmrf/guided/mrf" module={MODULE} tags={['precision-matrix']} mode="guided"
        question="Is $X_n$ an MRF, and of what order?"
        options={['Yes, order 1: $B_{i,j} = 0$ for $|i-j|>1$', 'No: it is causal', 'Yes, order 2', 'Only if $\\rho>0$']}
        answer={0}
        explain="Any AR(P) process is a 1-D MRF of order $P$ (2021 Q3.4). Here $P=1$ and the precision matrix is tridiagonal regardless of the sign of $\\rho$." />
    </div>
  )
}
