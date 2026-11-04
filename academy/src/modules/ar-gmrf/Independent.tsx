import { useMemo, useState } from 'react'
import { AnswerBox, Callout } from '../../components/ui'
import { MathText, Tex, fmt } from '../../components/Tex'
import { Plot, piTicks } from '../../components/Plot'
import { arToGmrf, omegaAxis } from '../../math/argmrf'
import { MODULE } from './constants'

/** Unfamiliar variation: an AR(2) process. Tests whether the method, not the memorized AR(1) answer, was learned. */
export function Independent() {
  const h = [0.5, -0.2]
  const sc2 = 1
  const { snc2, g } = useMemo(() => arToGmrf(h, sc2), [])
  const [reveal, setReveal] = useState(false)
  const om = useMemo(() => omegaAxis(257), [])
  const psd = om.map((w) => {
    const re = 1 - h[0] * Math.cos(w) - h[1] * Math.cos(2 * w)
    const im = h[0] * Math.sin(w) + h[1] * Math.sin(2 * w)
    return sc2 / (re * re + im * im)
  })
  const Gw = om.map((w) => 2 * g.get(1)! * Math.cos(w) + 2 * g.get(2)! * Math.cos(2 * w))
  return (
    <div>
      <h2>Independent problem: an unfamiliar variation (AR(2))</h2>
      <Callout title="Problem (no hints; this is scored as independent work)">
        <MathText>{'$X_n$ is a zero-mean stationary Gaussian AR(2) process with causal predictor $h(n) = 0.5\\,\\delta(n-1) - 0.2\\,\\delta(n-2)$ and $\\sigma_C^2 = 1$. Find $\\sigma_{NC}^2$, the noncausal coefficients $g_1$ and $g_2$ (recall $g_{-n} = g_n$), and $S_X(\\omega)$.'}</MathText>
        <MathText className="small muted">{'The method is the general one from 2025 P1: autocorrelate $\\delta_n - h_n$, normalize by the lag-0 value. Do not reuse the AR(1) numbers.'}</MathText>
      </Callout>
      <AnswerBox id="ar-gmrf/indep/snc2" module={MODULE} tags={['convolution', 'time-reversal']} mode="independent" prompt={<MathText>{'$\\sigma_{NC}^2 = $'}</MathText>} expected={snc2} />
      <AnswerBox id="ar-gmrf/indep/g1" module={MODULE} tags={['convolution', 'time-reversal']} mode="independent" prompt={<MathText>{'$g_1 = $'}</MathText>} expected={g.get(1)!} />
      <AnswerBox id="ar-gmrf/indep/g2" module={MODULE} tags={['convolution', 'time-reversal']} mode="independent" prompt={<MathText>{'$g_2 = $'}</MathText>} expected={g.get(2)!} placeholder="mind the sign" />
      <AnswerBox id="ar-gmrf/indep/psd" module={MODULE} tags={['complex-euler', 'dtft', 'psd']} mode="independent"
        prompt={<MathText>{'$S_X(\\omega) = $ (complex forms are accepted, typed like 1/|1 - 0.5 e^(-jw) + 0.2 e^(-2jw)|^2)'}</MathText>}
        spec={{ reference: '1/abs(1 - 0.5*exp(-i*w) + 0.2*exp(-2*i*w))^2', vars: { w: [-3.1, 3.1] } }} placeholder="expression in w" />
      <p><button className="btn btn-ghost" onClick={() => setReveal(!reveal)}>{reveal ? 'Hide' : 'Show'} worked solution (after you have tried)</button></p>
      {reveal && (
        <div className="card">
          <MathText>{'Let $a_n = \\delta_n - h_n = [1, -0.5, 0.2]$ on $n = 0,1,2$. Autocorrelation $r_m = \\sum_k a_ka_{k+m}$:'}</MathText>
          <Tex block>{'r_0 = 1 + 0.25 + 0.04 = 1.29,\\quad r_1 = (1)(-0.5) + (-0.5)(0.2) = -0.6,\\quad r_2 = (1)(0.2) = 0.2'}</Tex>
          <Tex block>{`\\sigma_{NC}^2 = \\frac{\\sigma_C^2}{r_0} = ${fmt(snc2, 4)},\\qquad g_1 = -\\frac{r_1}{r_0} = ${fmt(g.get(1)!, 4)},\\qquad g_2 = -\\frac{r_2}{r_0} = ${fmt(g.get(2)!, 4)}`}</Tex>
          <Tex block>{'S_X(\\omega) = \\frac{1}{|1 - 0.5e^{-j\\omega} + 0.2e^{-2j\\omega}|^2} = \\frac{1}{1.29 - 1.2\\cos\\omega + 0.4\\cos2\\omega}'}</Tex>
          <MathText>{'Check: the GMRF form $\\sigma_{NC}^2/(1-G(\\omega))$ with $G(\\omega) = 2g_1\\cos\\omega + 2g_2\\cos2\\omega$ must coincide; the plot shows both. Note $g_2 < 0$ although $h_2 < 0$ too: the sign of $g_2$ comes from $-r_2/r_0$ and $r_2 = a_0a_2 = -h_2$, so $g_2 = h_2/r_0$. Common mistake: forgetting the cross term $a_1a_2$ in $r_1$.'}</MathText>
          <Plot series={[{ x: om, y: psd, color: 'var(--causal)', label: 'AR form', width: 3 }, { x: om, y: om.map((_, i) => snc2 / (1 - Gw[i])), color: 'var(--noncausal)', label: 'GMRF form', dashed: true }]} xTicks={piTicks} xLabel="ω" yLabel="S_X(ω)" height={220} />
        </div>
      )}
    </div>
  )
}
