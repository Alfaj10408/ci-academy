import { useState } from 'react'
import { Plot } from '../../components/Plot'
import { Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import { q4g, q4gQ, q4gStep, q4gMin, linspace } from '../../math/surrogate'
import { MODULE } from './constants'

/** The picture of lecture 18 slide 6, drawn for g(x) = ½(x−2)² + |x| with the surrogate from 2021 Q4.5. */
export function Intuition() {
  const [xp, setXp] = useState(3)
  const xs = linspace(-2.5, 5, 301)
  const f = xs.map(q4g)
  const q = xs.map((x) => q4gQ(xp, x))
  const xt = q4gStep(xp)
  return (
    <div>
      <h2>Intuition before equations</h2>
      <Callout title="Real-world analogy">
        <p>You are descending a mountain in fog. You cannot see the whole landscape (the cost <em>f</em> is complicated), but at your current position you can feel the ground: its height and its slope. A surrogate is a simple bowl you build in your head that touches the ground where you stand and lies <em>above</em> the ground everywhere else. Walk to the bottom of the bowl. Because the ground is below the bowl, you are guaranteed to be lower than where you started. Build a new bowl there and repeat. That is majorization–minimization (MM).</p>
      </Callout>
      <p>Lecture 18, slide 6 draws exactly this picture. Below, <Tex>{'f(x) = \\tfrac12(x-2)^2 + |x|'}</Tex> (2021 Q4.5) and its quadratic surrogate <Tex>{'q(x;x^\\prime)'}</Tex> built at the draggable point <Tex>{'x^\\prime'}</Tex>.</p>
      <div className="grid4">
        <div>
          <Plot title="f(x) solid, surrogate q(x;x′) dashed" height={280} xLabel="x" xDomain={[-2.5, 5]} yDomain={[0, 10]}
            series={[{ x: xs, y: f, color: 'var(--causal)', label: 'f' }, { x: xs, y: q, color: 'var(--noncausal)', dashed: true, label: 'q(x;x′)' }]}
            overlay={(sx, sy) => (
              <g>
                <line x1={sx(xp)} x2={sx(xp)} y1={sy(0)} y2={sy(q4g(xp))} stroke="var(--muted)" strokeDasharray="3 3" />
                <circle cx={sx(xp)} cy={sy(q4g(xp))} r={5} fill="var(--bad)" />
                <text x={sx(xp) + 6} y={sy(q4g(xp)) - 8} className="marker-label">x′ : f(x′) = q(x′;x′)</text>
                <circle cx={sx(xt)} cy={sy(q4gQ(xp, xt))} r={4} fill="var(--noncausal)" />
                <text x={sx(xt) + 6} y={sy(q4gQ(xp, xt)) + 14} className="marker-label">x̃* = argmin q</text>
                <circle cx={sx(q4gMin)} cy={sy(q4g(q4gMin))} r={4} fill="var(--causal)" />
                <text x={sx(q4gMin) - 70} y={sy(q4g(q4gMin)) + 18} className="marker-label">x* = argmin f</text>
              </g>
            )} />
        </div>
        <div>
          <Slider label={<Tex>{'x^\\prime'}</Tex>} value={xp} min={-2} max={4.5} step={0.05} onChange={(v) => setXp(Math.abs(v) < 0.05 ? 0.05 : v)} format={(v) => v.toFixed(2)} />
          <div className="eq">
            <Tex block>{`q(x;x^\\prime) = \\tfrac12(x-2)^2 + \\frac{x^2}{2|x^\\prime|} + \\frac{|x^\\prime|}{2}`}</Tex>
            <Tex block>{`f(x^\\prime) = ${fmt(q4g(xp))} = q(x^\\prime;x^\\prime), \\qquad \\tilde x^* = \\frac{2|x^\\prime|}{1+|x^\\prime|} = ${fmt(xt)}`}</Tex>
            <Tex block>{`f(\\tilde x^*) = ${fmt(q4g(xt))} \;\\le\; q(\\tilde x^*;x^\\prime) = ${fmt(q4gQ(xp, xt))} \;\\le\; q(x^\\prime;x^\\prime) = ${fmt(q4g(xp))}`}</Tex>
          </div>
          <MathText>{'What to notice. (1) The dashed bowl touches the solid curve only at $x^\\prime$ and is above it everywhere else. (2) The bottom of the bowl $\\tilde x^*$ is always between $x^\\prime$ and the true minimiser $x^* = 1$: a step that never overshoots. (3) Dragging $x^\\prime$ toward 0 makes the bowl steeper ($1/(2|x^\\prime|)$ blows up): the surrogate of $|x|$ does not exist at $x^\\prime = 0$. (4) If you put $x^\\prime$ at $1$, the bowl’s bottom is $1$: a fixed point of the iteration is a minimiser of $f$ (lecture 19, slide 4).'}</MathText>
        </div>
      </div>
      <h3>Concept check</h3>
      <Choice id="surrogate/intuition/check" module={MODULE} tags={['calculus-1d']} mode="check"
        question="Why must $f(\\tilde x^*) \\le f(x^\\prime)$ for the minimiser $\\tilde x^*$ of the surrogate?"
        options={['Because $f \\le q$ everywhere and $q(\\tilde x^*) \\le q(x^\\prime) = f(x^\\prime)$', 'Because the surrogate is quadratic', 'Because $f$ is convex', 'Because $\\tilde x^*$ is the global minimiser of $f$']}
        answer={0}
        explain="Chain (8.4): $f(\\tilde x^*) \\le q(\\tilde x^*;x^\\prime) \\le q(x^\\prime;x^\\prime) = f(x^\\prime)$. Neither convexity of $f$ nor the quadratic form is needed; only the two surrogate conditions and the minimisation." />
    </div>
  )
}
