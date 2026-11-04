import { useState } from 'react'
import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText } from '../../components/Tex'
import { prereqById } from '../../data/prereqs'
import { MODULE } from './constants'

function Lesson({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const p = prereqById[id]
  return (
    <div>
      <button className="btn btn-ghost" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} targeted lesson: {p.name}</button>
      {open && <Callout title={p.name}><MathText>{p.lesson}</MathText><span className="ref">Lectures {p.lectures.join(', ')}</span></Callout>}
    </div>
  )
}

export function PrereqStep() {
  return (
    <div>
      <h2>Diagnose the four prerequisites this module needs</h2>
      <p>Each item is tagged with a skill. A wrong answer opens a short targeted lesson, then you can retry below. Nothing here is graded by string matching: expressions are compared numerically at random test points.</p>

      <h3>1 · Complex modulus (Euler)</h3>
      <AnswerBox id="ar-gmrf/pre/euler" module={MODULE} tags={['complex-euler']} mode="prereq"
        prompt={<MathText>{'Expand $|1-\\rho e^{-j\\omega}|^2$ into a real expression with no complex numbers (use rho and w).'}</MathText>}
        spec={{ reference: '1 - 2*rho*cos(w) + rho^2', vars: { w: [-3.1, 3.1], rho: [-0.9, 0.9] } }}
        placeholder="e.g. 1 - 2 rho cos(w) + rho^2"
        hints={['$|z|^2 = z\\bar z$. Write $z = 1-\\rho e^{-j\\omega}$ and $\\bar z = 1-\\rho e^{j\\omega}$.', 'Multiply out: $1 - \\rho e^{j\\omega} - \\rho e^{-j\\omega} + \\rho^2$.', 'Use $e^{j\\omega}+e^{-j\\omega} = 2\\cos\\omega$.', 'So $|1-\\rho e^{-j\\omega}|^2 = 1 - 2\\rho\\cos\\omega + \\rho^2$.', 'Full solution: $(1-\\rho\\cos\\omega)^2 + (\\rho\\sin\\omega)^2 = 1 - 2\\rho\\cos\\omega + \\rho^2(\\cos^2\\omega+\\sin^2\\omega) = 1-2\\rho\\cos\\omega+\\rho^2$.']}
        solution="$1 - 2\\rho\\cos\\omega + \\rho^2$. Note it is positive for $|\\rho|<1$ and smallest at $\\omega = 0$ when $\\rho>0$ (low-pass) or at $\\omega=\\pi$ when $\\rho<0$ (high-pass)." />
      <Lesson id="complex-euler" />

      <h3>2 · DTFT of a shifted delta</h3>
      <Choice id="ar-gmrf/pre/dtft" module={MODULE} tags={['dtft']} mode="prereq"
        question="The prediction filter is $h_n = \\rho\\,\\delta(n-1)$. Its DTFT $H(\\omega) = \\sum_n h_n e^{-j\\omega n}$ equals:"
        options={['$\\rho e^{-j\\omega}$', '$\\rho e^{j\\omega}$', '$\\rho\\cos\\omega$', '$\\rho$']}
        answer={0}
        explain="Only the term $n=1$ survives the sum, giving $\\rho e^{-j\\omega\\cdot1}$. A delay of one sample is a phase of $-\\omega$." />
      <Lesson id="dtft" />

      <h3>3 · Convolution of shifted deltas</h3>
      <Choice id="ar-gmrf/pre/conv" module={MODULE} tags={['convolution', 'time-reversal']} mode="prereq"
        question="Compute $(\\delta_n - \\rho\\delta_{n-1}) * (\\delta_n - \\rho\\delta_{n+1})$, the causal filter convolved with its time reverse."
        options={['$(1+\\rho^2)\\delta_n - \\rho\\delta_{n-1} - \\rho\\delta_{n+1}$', '$\\delta_n - \\rho^2\\delta_n$', '$(1-\\rho)^2\\delta_n$', '$\\delta_n - 2\\rho\\delta_{n-1} + \\rho^2\\delta_{n-2}$']}
        answer={0}
        explain="Expand term by term: $\\delta*\\delta = \\delta_n$; $\\delta_n*(-\\rho\\delta_{n+1}) = -\\rho\\delta_{n+1}$; $(-\\rho\\delta_{n-1})*\\delta_n = -\\rho\\delta_{n-1}$; $(-\\rho\\delta_{n-1})*(-\\rho\\delta_{n+1}) = \\rho^2\\delta_n$. The result is symmetric: that is what autocorrelation does." />
      <Lesson id="convolution" />

      <h3>4 · Power spectral density through a filter</h3>
      <Choice id="ar-gmrf/pre/psd" module={MODULE} tags={['psd']} mode="prereq"
        question="White noise $E_n$ with variance $\\sigma_C^2$ drives an LTI filter with frequency response $1/(1-H(\\omega))$. The PSD of the output is:"
        options={['$\\dfrac{\\sigma_C^2}{|1-H(\\omega)|^2}$', '$\\dfrac{\\sigma_C^2}{1-H(\\omega)}$', '$\\sigma_C^2|1-H(\\omega)|^2$', '$\\sigma_C^2$']}
        answer={0}
        explain="Filtering multiplies the PSD by the squared magnitude of the frequency response. White noise has flat PSD $\\sigma_C^2$, so the output has $\\sigma_C^2/|1-H(\\omega)|^2$ (lecture 7, slide 12)." />
      <Lesson id="psd" />
    </div>
  )
}
