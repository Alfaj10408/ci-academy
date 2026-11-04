import { useMemo, useState } from 'react'
import { Plot } from '../../components/Plot'
import { Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText } from '../../components/Tex'
import { generateAR1 } from '../../math/argmrf'
import { MODULE } from './constants'

export function Intuition() {
  const [rho, setRho] = useState(0.8)
  const [seed, setSeed] = useState(3)
  const N = 60
  const { x, e } = useMemo(() => generateAR1({ rho, sc2: 1 }, N, seed), [rho, seed])
  const n = Array.from({ length: N }, (_, i) => i)
  return (
    <div>
      <h2>Intuition before equations</h2>
      <Callout title="Real-world analogy">
        <p><strong>Causal prediction</strong> is forecasting: guess today’s temperature from yesterday’s. You only look backward. <strong>Noncausal prediction</strong> is interpolation: a day is missing from the log, and you fill it in from both the day before and the day after. Looking both ways gives a better guess, so the noncausal error is smaller. The price: the interpolation errors on consecutive days are no longer independent, because neighbouring guesses share the same data.</p>
      </Callout>
      <p>The simplest random process with memory is the <strong>AR(1)</strong>: white noise <Tex>{'E_n \\sim N(0,\\sigma_C^2)'}</Tex> is pushed through a feedback loop, <Tex>{'X_n = \\rho X_{n-1} + E_n'}</Tex> (lecture 7, slide 10). The feedback creates correlation. Drag <Tex>ρ</Tex> and watch how much of the past survives.</p>
      <div className="grid4">
        <div>
          <Plot title="E_n : white noise (what the filter eats)" series={[{ x: n, y: e, color: 'var(--muted)', stems: true }]} xLabel="n" height={200} />
          <Plot title={`Xₙ = ρ Xₙ₋₁ + Eₙ  (ρ = ${rho.toFixed(2)})`} series={[{ x: n, y: x, color: 'var(--causal)', stems: true }]} xLabel="n" height={200} />
        </div>
        <div>
          <Slider label={<Tex>\rho</Tex>} value={rho} min={-0.95} max={0.95} step={0.01} onChange={setRho} format={(v) => v.toFixed(2)} />
          <Slider label="seed" value={seed} min={1} max={20} step={1} onChange={setSeed} />
          <div className="eq">
            <Tex block>{`X_n = ${rho.toFixed(2)}\\,X_{n-1} + E_n`}</Tex>
            <Tex block>{`h_n = ${rho.toFixed(2)}\\,\\delta(n-1),\\qquad H(\\omega) = ${rho.toFixed(2)}\\,e^{-j\\omega}`}</Tex>
          </div>
          <MathText>{'What to notice: with $\\rho$ near $1$ the path drifts slowly (low frequencies dominate); with $\\rho$ near $-1$ it alternates sign every sample (high frequencies dominate); with $\\rho = 0$ it is just the noise. The same $E_n$ is used for every $\\rho$, so only the memory changes.'}</MathText>
          <MathText>{'Two descriptions of the same process will appear in this module. The causal one, $(h_n, \\sigma_C^2)$, says how to predict $X_n$ from the past. The noncausal one, $(g_n, \\sigma_{NC}^2)$, says how to predict $X_n$ from both sides. Both determine the same power spectrum, and the exam questions ask you to move between them.'}</MathText>
        </div>
      </div>
      <h3>Concept check</h3>
      <Choice id="ar-gmrf/intuition/check" module={MODULE} tags={['psd']} mode="check"
        question="For $\\rho = 0.9$ the sample path drifts slowly. Where is the power spectrum $S_X(\\omega)$ largest?"
        options={['Near $\\omega = 0$', 'Near $\\omega = \\pm\\pi$', 'Flat: all frequencies equal', 'Near $\\omega = \\pm\\pi/2$']}
        answer={0}
        explain="Slow drift means low-frequency content. Indeed $|1-\\rho e^{-j\\omega}|^2 = 1 - 2\\rho\\cos\\omega + \\rho^2$ is smallest at $\\omega=0$ when $\\rho>0$, which makes $S_X = \\sigma_C^2/|1-H|^2$ largest there." />
    </div>
  )
}
