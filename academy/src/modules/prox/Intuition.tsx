import { useState } from 'react'
import { Plot } from '../../components/Plot'
import { Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import { proxGrid, shrink, linspace } from '../../math/prox'
import { MODULE } from './constants'

type Fn = 'abs' | 'q4g'
/** Lecture 23 slide 5: the stake and the spring. Drag the stake z and the spring stiffness 1/σ². */
export function Intuition() {
  const [fn, setFn] = useState<Fn>('abs')
  const [z, setZ] = useState(2.5)
  const [s2, setS2] = useState(1)
  const f = fn === 'abs' ? Math.abs : (x: number) => 0.5 * (x - 2) ** 2 + Math.abs(x)
  const xs = linspace(-4, 5, 361)
  const fv = xs.map(f)
  const spring = xs.map((x) => ((x - z) ** 2) / (2 * s2))
  const total = xs.map((x, i) => fv[i] + spring[i])
  const F = fn === 'abs' ? shrink(s2, z) : proxGrid(f, s2, z, -4, 5)
  const zs = linspace(-4, 5, 181)
  const Fz = zs.map((zz) => (fn === 'abs' ? shrink(s2, zz) : proxGrid(f, s2, zz, -4, 5, 901)))
  const clip = (ys: number[], top: number) => ys.map((v) => (v > top ? NaN : v))
  return (
    <div>
      <h2>Intuition before equations: the stake and the spring</h2>
      <Callout title="Real-world analogy">
        <p>Plant a stake at z and tie a spring from it to a cart sitting on a hillside f. Gravity pulls the cart downhill; the spring pulls it back toward the stake. Where the two forces balance, the cart stops. That resting point is the proximal map F(z): it moves toward the minimum of f but stays in the proximity of z (lecture 23 slide 5; the whole of 2023 P1).</p>
      </Callout>
      <div className="row">
        <button className={`btn ${fn === 'abs' ? '' : 'btn-ghost'}`} onClick={() => setFn('abs')}>f(x) = |x|  (the shrinkage case)</button>
        <button className={`btn ${fn === 'q4g' ? '' : 'btn-ghost'}`} onClick={() => setFn('q4g')}>f(x) = ½(x−2)² + |x|  (Module 2's cost)</button>
      </div>
      <div className="grid4">
        <div>
          <Plot title="hill f (solid), spring energy (dashed), their sum (bold)" height={280} xLabel="x" xDomain={[-4, 5]} yDomain={[0, 8]}
            series={[{ x: xs, y: clip(fv, 8), color: 'var(--causal)', label: 'f' }, { x: xs, y: clip(spring, 8), color: 'var(--noncausal)', dashed: true, label: '(x−z)²/2σ²' }, { x: xs, y: clip(total, 8), color: 'var(--bad)', width: 3, label: 'f + spring' }]}
            overlay={(sx, sy) => (
              <g>
                <line x1={sx(z)} x2={sx(z)} y1={sy(0)} y2={sy(7.5)} stroke="var(--noncausal)" strokeDasharray="3 3" />
                <text x={sx(z) + 4} y={sy(7.5) + 12} className="marker-label">stake z</text>
                <circle cx={sx(F)} cy={sy(f(F) + ((F - z) ** 2) / (2 * s2))} r={5} fill="var(--bad)" />
                <text x={sx(F) + 6} y={sy(f(F) + ((F - z) ** 2) / (2 * s2)) - 8} className="marker-label">F(z)</text>
              </g>
            )} />
        </div>
        <div>
          <Slider label={<Tex>{'z'}</Tex>} value={z} min={-3.5} max={4.5} step={0.05} onChange={setZ} format={(v) => v.toFixed(2)} />
          <Slider label={<Tex>{'\\sigma^2 \\ (\\text{spring: } 1/\\sigma^2)'}</Tex>} value={s2} min={0.1} max={4} step={0.05} onChange={setS2} format={(v) => v.toFixed(2)} />
          <div className="eq">
            <Tex block>{'F(z) = \\arg\\min_x\\Big\\{f(x) + \\frac{1}{2\\sigma^2}\\|x - z\\|^2\\Big\\}'}</Tex>
            <Tex block>{`z = ${fmt(z)}, \\quad \\sigma^2 = ${fmt(s2)} \\quad\\Rightarrow\\quad F(z) = ${fmt(F)}${fn === 'abs' ? ` = \\mathrm{sign}(z)\\max(|z| - \\sigma^2, 0)` : ''}`}</Tex>
          </div>
          <MathText>{'What to notice. (1) A stiff spring (small $\\sigma^2$) keeps the cart near the stake: $F(z) \\approx z$. (2) A loose spring (large $\\sigma^2$) lets gravity win: $F(z) \\to \\arg\\min f$. (3) With $f = |x|$ the kink at $0$ is a flat spot where the cart can rest even when the stake is off-centre: $F(z) = 0$ for $|z| \\le \\sigma^2$. That is shrinkage (lecture 23 slides 11–13).'}</MathText>
        </div>
        <div>
          <Plot title="the action F: output F(z) against input z" height={240} xLabel="z" yLabel="F(z)" xDomain={[-4, 5]} yDomain={[-4, 5]}
            series={[{ x: zs, y: zs, color: 'var(--muted)', dashed: true, label: 'identity' }, { x: zs, y: Fz, color: 'var(--bad)', width: 3, label: 'F(z)' }]}
            marker={{ x: z, y: F, color: 'var(--bad)' }} />
        </div>
        <div>
          <MathText>{'Lecture 25 calls this the step from an objective to an action: $f$ is something to decrease, $F$ is something to apply. ADMM uses only the actions $F$ and $H$ (2022 Q3.4), which is why a trained denoiser can be plugged in for $H$ even when no cost function stands behind it.'}</MathText>
        </div>
      </div>
      <h3>Concept check</h3>
      <Choice id="prox/intuition/check" module={MODULE} tags={['convexity']} mode="check"
        question="For a proper closed convex $f$, what happens to $F(z) = \\arg\\min_x\\{f(x) + \\tfrac{1}{2\\sigma^2}\\|x - z\\|^2\\}$ as $\\sigma^2 \\to 0$ and as $\\sigma^2 \\to \\infty$?"
        options={['$F(z) \\to z$ as $\\sigma^2 \\to 0$; $F(z) \\to \\arg\\min f$ as $\\sigma^2 \\to \\infty$', '$F(z) \\to \\arg\\min f$ as $\\sigma^2 \\to 0$; $F(z) \\to z$ as $\\sigma^2 \\to \\infty$', '$F(z) = z$ for every $\\sigma^2$', '$F(z)$ is undefined for large $\\sigma^2$']}
        answer={0}
        explain="The quadratic term is the spring with stiffness $1/\\sigma^2$: stiff means stay at $z$, loose means roll to the bottom of $f$. In ADMM, $\\sigma^2$ plays the role of $1/a$ (lecture 25 slide 8)." />
    </div>
  )
}
