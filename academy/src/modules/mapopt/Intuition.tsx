import { useState } from 'react'
import { Plot } from '../../components/Plot'
import { Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import { scalarMap, scalarLik, scalarPrior, linspace } from '../../math/mapopt'
import { MODULE } from './constants'

/** Lecture 12 slide 6 and 10 in one dimension: likelihood × prior = posterior, and how β moves the MAP estimate (2021 Q2). */
export function Intuition() {
  const [y, setY] = useState(3)
  const [s2, setS2] = useState(1)
  const [beta, setBeta] = useState(0.5)
  const xstar = 1
  const xs = linspace(-2, 6, 321)
  const lik = xs.map((x) => scalarLik(y, s2, x))
  const pri = xs.map((x) => scalarPrior(beta, xstar, x))
  const post = xs.map((x, i) => lik[i] * pri[i])
  const pmax = Math.max(...post)
  const xhat = scalarMap(y, s2, beta, xstar)
  return (
    <div>
      <h2>Intuition before equations</h2>
      <Callout title="Real-world analogy">
        <p>A friend tells you the temperature outside (the measurement, noisy), and you also know it is November in Indiana (the prior). Your best guess combines both: when the friend is reliable you trust the reading; when the thermometer is broken you fall back on the season. MAP estimation is this trade-off, with the strength of the prior set by one number, β.</p>
      </Callout>
      <MathText>{'The scalar version of lecture 12: $Y = X + W$ with $W \\sim N(0, \\sigma^2)$, and a prior $p(x) \\propto \\exp\\{-\\beta u(x)\\}$ with $u(x) = (x - x^*)^2$, $x^* = 1$. The posterior is the product of the likelihood and the prior (slide 6), and the MAP estimate is its peak.'}</MathText>
      <div className="grid4">
        <div>
          <Plot title="likelihood (solid), prior (dashed), posterior (bold), each scaled to peak 1" height={280} xLabel="x" xDomain={[-2, 6]} yDomain={[0, 1.1]}
            series={[{ x: xs, y: lik, color: 'var(--causal)', label: 'p(y|x)' }, { x: xs, y: pri, color: 'var(--noncausal)', dashed: true, label: 'p(x)' }, { x: xs, y: post.map((v) => v / pmax), color: 'var(--bad)', width: 3, label: 'p(x|y)' }]}
            overlay={(sx, sy) => (
              <g>
                <line x1={sx(y)} x2={sx(y)} y1={sy(0)} y2={sy(1)} stroke="var(--causal)" strokeDasharray="3 3" />
                <text x={sx(y) + 4} y={sy(1) + 12} className="marker-label">ML = y</text>
                <line x1={sx(xstar)} x2={sx(xstar)} y1={sy(0)} y2={sy(1)} stroke="var(--noncausal)" strokeDasharray="3 3" />
                <text x={sx(xstar) + 4} y={sy(0.9) + 12} className="marker-label">x* = argmin u</text>
                <circle cx={sx(xhat)} cy={sy(1)} r={5} fill="var(--bad)" />
                <text x={sx(xhat) + 6} y={sy(1) - 6} className="marker-label">MAP</text>
              </g>
            )} />
        </div>
        <div>
          <Slider label={<Tex>{'y'}</Tex>} value={y} min={-1} max={5} step={0.1} onChange={setY} format={(v) => v.toFixed(1)} />
          <Slider label={<Tex>{'\\sigma^2'}</Tex>} value={s2} min={0.1} max={4} step={0.1} onChange={setS2} format={(v) => v.toFixed(1)} />
          <Slider label={<Tex>{'\\beta'}</Tex>} value={beta} min={0} max={5} step={0.05} onChange={setBeta} format={(v) => v.toFixed(2)} />
          <div className="eq">
            <Tex block>{'\\hat x = \\arg\\min_x\\Big\\{\\tfrac{1}{2\\sigma^2}(y - x)^2 + \\beta(x - x^*)^2\\Big\\} = \\frac{y/\\sigma^2 + 2\\beta x^*}{1/\\sigma^2 + 2\\beta}'}</Tex>
            <Tex block>{`\\hat x = \\frac{${fmt(y / s2)} + ${fmt(2 * beta * xstar)}}{${fmt(1 / s2)} + ${fmt(2 * beta)}} = ${fmt(xhat)}`}</Tex>
          </div>
          <MathText>{'What to notice. (1) $\\beta = 0$: the prior is flat, the posterior is the likelihood, and the MAP estimate is the ML estimate $y$: unbiased but it swallows all the noise (2021 Q2.3). (2) $\\beta \\to \\infty$: the prior collapses to a spike at $x^*$ and $\\hat x \\to x^*$ whatever $y$ is (2021 Q2.6, 2.7). (3) In between, $\\hat x$ is a weighted average: the weight on the data is the precision $1/\\sigma^2$, the weight on the prior is $2\\beta$. Increase $\\sigma^2$ and the estimate slides toward $x^*$.'}</MathText>
        </div>
      </div>
      <MathText>{'In $N$ dimensions nothing changes except that the weights become matrices: $\\hat x = (A^tA + \\sigma^2B)^{-1}A^ty$ (lecture 12, slide 12). The rest of this module is about computing that without forming the inverse.'}</MathText>
      <h3>Concept check</h3>
      <Choice id="mapopt/intuition/check" module={MODULE} tags={['gaussian-density']} mode="check"
        question="As $\\beta \\to \\infty$ in $\\hat x = \\arg\\min_x\\{\\tfrac{1}{2\\sigma^2}\\|y - Ax\\|^2 + \\beta u(x)\\}$, the MAP estimate"
        options={['tends to $x^* = \\arg\\min u(x)$, independent of the data $y$', 'tends to the ML estimate', 'tends to $0$', 'is undefined because the prior has no density']}
        answer={0}
        explain="The prior $\\tfrac{1}{z_\\beta}\\exp\\{-\\beta u(x)\\}$ concentrates at the unique minimiser $x^*$ of $u$ (a delta function in the limit), so the posterior does too: $\\hat x = x^*$, the most probable prior value, independent of the data (2021 Q2.6–2.7 key)." />
    </div>
  )
}
