import { useEffect, useMemo, useState } from 'react'
import { Plot } from '../../components/Plot'
import { Panel, Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import {
  ex51A, ex51B, aOmega, hOmega, gdIters99, icdIters99, symEig, mapHessian, mapSolve, mapCost, gdStep, steepestStep, icdSweep, cgRun, runMethod,
  testSignal, noise, matVec, add, norm2, sub, levelCurve, linspace, eye, matScale, type Mat, type Vec,
} from '../../math/mapopt'
import { MODULE } from './constants'

type View = 'freq' | 'signal' | 'geom'
type Method = 'gd' | 'sd' | 'icd' | 'cg'
const N = 32
const wTicks = [{ v: 0, label: '0' }, { v: Math.PI / 2, label: 'π/2' }, { v: Math.PI, label: 'π' }]
const clip = (ys: number[], top: number) => ys.map((v) => (Number.isFinite(v) && v <= top ? v : NaN))
const methodName: Record<Method, string> = { gd: 'gradient descent, fixed α', sd: 'steepest descent (line search)', icd: 'ICD', cg: 'conjugate gradient' }

export function Lab() {
  const [view, setView] = useState<View>('freq')
  const [lam, setLam] = useState(0.1)
  const [alpha, setAlpha] = useState(0.25)
  const [method, setMethod] = useState<Method>('gd')
  const [k, setK] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [A2, setA2] = useState<Mat>([[2, 1], [0, 1]])
  const [lam2, setLam2] = useState(0.5)
  const [alpha2, setAlpha2] = useState(0.2)
  const [K2, setK2] = useState(6)

  /* ---- Example 5.1 frequency view ---- */
  const ws = useMemo(() => linspace(0, Math.PI, 181), [])
  const hs = ws.map((w) => hOmega(w, lam))
  const hmax = Math.max(...hs), hmin = Math.min(...hs)
  const gdIt = ws.map((w) => gdIters99(w, alpha, lam))
  const icdIt = useMemo(() => Array.from({ length: N / 2 + 1 }, (_, kk) => icdIters99(N, lam, kk)), [lam])
  const icdW = icdIt.map((_, kk) => (2 * Math.PI * kk) / N)

  /* ---- 1-D deconvolution ---- */
  const A = useMemo(() => ex51A(N), [])
  const xt = useMemo(() => testSignal(N), [])
  const y = useMemo(() => add(matVec(A, xt), noise(N, 0.15)), [A, xt])
  const B = useMemo(() => ex51B(N, lam), [lam])
  const xhat = useMemo(() => mapSolve(A, y, B), [A, y, B])
  const run = useMemo(() => {
    const x0 = [...y]
    const step = method === 'gd' ? (x: Vec) => gdStep(A, y, B, x, alpha) : method === 'sd' ? (x: Vec) => steepestStep(A, y, B, x).x : method === 'icd' ? (x: Vec) => icdSweep(A, y, B, x) : null
    if (step) return runMethod(A, y, B, x0, 60, step)
    const xs = cgRun(A, y, B, x0, 60)
    return { xs, C: xs.map((x) => mapCost(A, y, B, x)) }
  }, [A, y, B, method, alpha])
  const kMax = run.xs.length - 1
  const xk = run.xs[Math.min(k, kMax)]
  const fhat = mapCost(A, y, B, xhat)
  const ns = Array.from({ length: N }, (_, i) => i)
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setK((v) => { if (v >= kMax) { setPlaying(false); return v } return v + 1 }), 350)
    return () => clearInterval(t)
  }, [playing, kMax])
  useEffect(() => { setK(0); setPlaying(false) }, [method, alpha, lam])

  /* ---- 2-D geometry ---- */
  const y2: Vec = [1, 2]
  const B2 = matScale(lam2, eye(2))
  const H2 = mapHessian(A2, B2)
  const { values: ev } = symEig(H2)
  const xh2 = mapSolve(A2, y2, B2)
  const x0: Vec = [-1.5, 2.5]
  const paths = useMemo(() => {
    const mk = (step: (x: Vec) => Vec) => runMethod(A2, y2, B2, x0, K2, step).xs
    return {
      gd: mk((x) => gdStep(A2, y2, B2, x, alpha2)),
      sd: mk((x) => steepestStep(A2, y2, B2, x).x),
      icd: mk((x) => icdSweep(A2, y2, B2, x)),
      cg: cgRun(A2, y2, B2, x0, Math.min(K2, 2)),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [A2, lam2, alpha2, K2])
  const f0 = mapCost(A2, y2, B2, x0) - mapCost(A2, y2, B2, xh2)
  const levels = [0.05, 0.2, 0.5, 1].map((c) => levelCurve(H2, xh2, c * f0))
  const pathSeries = (Object.keys(paths) as Method[]).map((m) => ({ x: paths[m].map((p) => p[0]), y: paths[m].map((p) => p[1]), color: m === 'gd' ? 'var(--causal)' : m === 'sd' ? 'var(--noncausal)' : m === 'icd' ? 'var(--bad)' : 'var(--ok, #2a9d8f)', label: methodName[m], width: m === 'cg' ? 3 : 2 }))
  const setA = (i: number, j: number, v: number) => setA2(A2.map((r, ri) => r.map((c, ci) => (ri === i && ci === j ? v : c))) as Mat)

  return (
    <div>
      <h2>Visual laboratory: MAP estimation and its optimisers</h2>
      <div className="row">
        {(['freq', 'signal', 'geom'] as View[]).map((v) => <button key={v} className={`btn ${view === v ? '' : 'btn-ghost'}`} onClick={() => setView(v)}>{v === 'freq' ? 'Frequency view (Example 5.1)' : v === 'signal' ? '1-D deconvolution, iterate by iterate' : '2-D geometry of the four methods'}</button>)}
      </div>

      {view === 'freq' && (
        <div className="grid4">
          <Panel title="Blur response, its inverse, and the eigenvalues h(ω)">
            <Plot height={240} xLabel="ω" xDomain={[0, Math.PI]} xTicks={wTicks} yDomain={[0, 8]}
              series={[{ x: ws, y: ws.map(aOmega), color: 'var(--causal)', label: 'a(ω) = 1 + cos ω' }, { x: ws, y: clip(ws.map((w) => 1 / aOmega(w)), 8), color: 'var(--bad)', dashed: true, label: '1/a(ω): ML amplification' }, { x: ws, y: hs, color: 'var(--noncausal)', width: 3, label: 'h(ω) = |a|² + λ(1 − g)' }]} />
            <MathText>{'Inverting the blur divides by $a(\\omega)$, which vanishes at $\\omega = \\pi$: the ML estimate amplifies high-frequency noise without bound (lecture 12, slide 9). The prior adds $\\lambda(1 - \\cos\\omega)$, so $h(\\omega)$ stays positive and the MAP filter $a(\\omega)/h(\\omega)$ is bounded.'}</MathText>
          </Panel>
          <Panel title="Iterations until the error at frequency ω is below 1%">
            <Plot height={240} xLabel="ω" yLabel="iterations" xDomain={[0, Math.PI]} xTicks={wTicks} yDomain={[0, 120]}
              series={[{ x: ws, y: clip(gdIt, 120), color: 'var(--causal)', label: `gradient descent, α = ${fmt(alpha, 2)}` }, { x: icdW, y: clip(icdIt, 120), color: 'var(--bad)', stems: true, label: 'ICD (simulated, N = 32)' }]} />
            <MathText>{'Gradient descent: $(1 - \\alpha h(\\omega))^k = 0.01$ solved for $k$ (lecture 13, slide 16). ICD: a cosine error mode is injected and sweeps are counted until its norm drops below 1% (lecture 14, slide 11). Gradient descent is slowest where $h$ is smallest, at the edges; ICD is fastest there and slowest at low frequency.'}</MathText>
          </Panel>
          <div>
            <Slider label={<Tex>{'\\lambda = \\sigma^2/\\sigma_x^2'}</Tex>} value={lam} min={0.02} max={2} step={0.02} onChange={setLam} format={(v) => v.toFixed(2)} />
            <Slider label={<Tex>{'\\alpha'}</Tex>} value={alpha} min={0.05} max={0.6} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />
            <div className="eq">
              <Tex block>{`h(\\omega) = |1 + \\cos\\omega|^2 + ${fmt(lam, 2)}(1 - \\cos\\omega), \\qquad h_{\\max} = ${fmt(hmax)}, \\ h_{\\min} = ${fmt(hmin)}, \\ \\kappa = ${fmt(hmax / hmin, 1)}`}</Tex>
              <Tex block>{`\\text{stable iff } \\alpha < 2/h_{\\max} = ${fmt(2 / hmax)}; \\qquad \\alpha = 1/h_{\\max} = ${fmt(1 / hmax)} \\Rightarrow (1 - 1/\\kappa)^k \\text{ for the slowest mode}`}</Tex>
            </div>
            {alpha >= 2 / hmax && <Callout kind="warn" title="Unstable">The step exceeds 2/h_max: the ω = 0 mode has |1 − αh| ≥ 1 and gradient descent diverges (the curve leaves the plot).</Callout>}
          </div>
          <div>
            <Callout title="Experiments">
              <ol>
                <li>Set λ = 0.1 and α = 0.25 (the slide): read 1 iteration at ω = 0 and about 90 at ω = π.</li>
                <li>Raise α toward 0.5: the fast end gets faster until the ω = 0 mode flips sign and diverges.</li>
                <li>Raise λ: h_min grows, κ shrinks, and gradient descent needs fewer iterations at the edges. The price is a smoother estimate.</li>
                <li>Compare the ICD stems with the curve: under 20 iterations at high frequency, more than gradient descent at ω ≈ 0.</li>
              </ol>
            </Callout>
          </div>
        </div>
      )}

      {view === 'signal' && (
        <div className="grid4">
          <Panel title="Signal, blurred noisy data, and the current iterate">
            <Plot height={260} xLabel="n" xDomain={[0, N - 1]} yDomain={[-0.5, 1.8]}
              series={[{ x: ns, y: xt, color: 'var(--muted)', dashed: true, label: 'x (true)' }, { x: ns, y: y, color: 'var(--causal)', stems: true, label: 'y = Ax + w' }, { x: ns, y: xhat, color: 'var(--noncausal)', dashed: true, label: 'x̂ (closed form)' }, { x: ns, y: xk, color: 'var(--bad)', width: 3, label: `x after ${Math.min(k, kMax)} iterations` }]} />
          </Panel>
          <Panel title="Cost f(x⁽ᵏ⁾) and the minimum f(x̂)">
            <Plot height={260} xLabel="k" yLabel="f" xDomain={[0, 60]} yDomain={[Math.max(0, fhat * 0.9), Math.min(run.C[0] * 1.05, fhat * 6)]}
              series={[{ x: run.C.map((_, i) => i), y: clip(run.C, fhat * 6), color: 'var(--causal)', stems: true, label: 'f(x⁽ᵏ⁾)' }, { x: [0, 60], y: [fhat, fhat], color: 'var(--noncausal)', dashed: true, label: 'f(x̂)' }]} />
          </Panel>
          <div>
            <div className="row">{(['gd', 'sd', 'icd', 'cg'] as Method[]).map((m) => <button key={m} className={`btn ${method === m ? '' : 'btn-ghost'}`} onClick={() => setMethod(m)}>{methodName[m]}</button>)}</div>
            <Slider label={<Tex>{'\\lambda'}</Tex>} value={lam} min={0.02} max={2} step={0.02} onChange={setLam} format={(v) => v.toFixed(2)} />
            {method === 'gd' && <Slider label={<Tex>{'\\alpha'}</Tex>} value={alpha} min={0.05} max={0.6} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />}
            <div className="row">
              <button className="btn" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
              <button className="btn btn-ghost" onClick={() => setK(Math.min(k + 1, kMax))}>Step</button>
              <button className="btn btn-ghost" onClick={() => { setK(0); setPlaying(false) }}>Reset</button>
              <span className="pill">k = {Math.min(k, kMax)} · ‖x − x̂‖ = {fmt(norm2(sub(xk, xhat)))}</span>
            </div>
            <div className="eq">
              {method === 'gd' && <Tex block>{`x \\leftarrow x + ${fmt(alpha, 2)}\\,[A^t(y - Ax) - \\lambda(I - G)x]`}</Tex>}
              {method === 'sd' && <Tex block>{'d = A^t(y - Ax) - Bx, \\quad \\alpha^* = \\frac{\\|d\\|^2}{d^tHd}, \\quad x \\leftarrow x + \\alpha^* d'}</Tex>}
              {method === 'icd' && <Tex block>{'x_s \\leftarrow x_s + \\frac{e^tA_{*,s} - \\lambda(x_s - \\tfrac12(x_{s-1} + x_{s+1}))}{\\|A_{*,s}\\|^2 + \\lambda}, \\quad e \\leftarrow e - A_{*,s}(x_s - v)'}</Tex>}
              {method === 'cg' && <Tex block>{'h^{(k)} = d^{(k)} + \\gamma_k h^{(k-1)}, \\quad x \\leftarrow x + \\alpha^{(k)}h^{(k)}'}</Tex>}
              <Tex block>{`f(x^{(k)}) = ${fmt(run.C[Math.min(k, kMax)])} \\ \\ge\\ f(\\hat x) = ${fmt(fhat)}`}</Tex>
            </div>
          </div>
          <div>
            <Callout title="Experiments">
              <ol>
                <li>Gradient descent with α = 0.25, λ = 0.1: the bump (low frequency) is recovered in a few iterations, the edge (high frequency) takes dozens. Watch the ringing beside the edge fade slowly.</li>
                <li>Switch to ICD: the edge sharpens in the first sweeps; the slow part is now the broad bump.</li>
                <li>Steepest descent never increases the cost but still needs many iterations; conjugate gradient is essentially done in a handful.</li>
                <li>Push α above 2/h_max ≈ 0.5: the cost explodes. Line search and ICD have no such parameter.</li>
              </ol>
            </Callout>
            <MathText>{'$x^{(0)} = y$, $N = 32$, periodic boundary, blur $a_n = \\delta_n + \\tfrac12(\\delta_{n\\pm1})$, noise $\\sigma = 0.15$. The dashed $\\hat x$ is $(A^tA + \\lambda(I - G))^{-1}A^ty$ computed by direct solve; every method converges to it.'}</MathText>
          </div>
        </div>
      )}

      {view === 'geom' && (
        <div className="grid4">
          <Panel title="Level curves of f and the path of each method from x⁽⁰⁾">
            <Plot height={320} width={420} xLabel="x₁" yLabel="x₂" xDomain={[-2.5, 3]} yDomain={[-1.5, 3.5]}
              series={[...levels.map((L, i) => ({ x: L.x, y: L.y, color: 'var(--muted)', width: i === 3 ? 1.5 : 1 })), ...pathSeries]}
              marker={{ x: xh2[0], y: xh2[1], color: 'var(--noncausal)', label: 'x̂' }} />
          </Panel>
          <div>
            <p className="small muted">A (2×2) and λ; B = λI, y = (1, 2), x⁽⁰⁾ = (−1.5, 2.5)</p>
            <div className="row">{[0, 1].map((i) => [0, 1].map((j) => <input key={`${i}${j}`} type="number" step={0.5} value={A2[i][j]} onChange={(e) => setA(i, j, +e.target.value)} style={{ width: 60 }} />))}</div>
            <Slider label={<Tex>{'\\lambda'}</Tex>} value={lam2} min={0} max={3} step={0.1} onChange={setLam2} format={(v) => v.toFixed(1)} />
            <Slider label={<Tex>{'\\alpha \\text{ (fixed-step GD)}'}</Tex>} value={alpha2} min={0.02} max={1} step={0.01} onChange={setAlpha2} format={(v) => v.toFixed(2)} />
            <Slider label="iterations K" value={K2} min={1} max={12} step={1} onChange={setK2} format={(v) => String(v)} />
            <div className="eq">
              <Tex block>{`H = A^tA + \\lambda I = \\begin{bmatrix} ${fmt(H2[0][0])} & ${fmt(H2[0][1])} \\\\ ${fmt(H2[1][0])} & ${fmt(H2[1][1])} \\end{bmatrix}, \\quad h_{\\min} = ${fmt(ev[0])}, \\ h_{\\max} = ${fmt(ev[1])}, \\ \\kappa = ${fmt(ev[1] / ev[0], 1)}`}</Tex>
              <Tex block>{`\\hat x = H^{-1}A^ty = (${fmt(xh2[0])}, ${fmt(xh2[1])}), \\qquad 2/h_{\\max} = ${fmt(2 / ev[1])}`}</Tex>
            </div>
          </div>
          <div>
            <Callout title="What to look for">
              <ol>
                <li>Fixed-step gradient descent moves perpendicular to the level curves; with α near 2/h_max it bounces across the valley, above it the path leaves the picture.</li>
                <li>Steepest descent (line search) stops exactly where the line is tangent to a level curve, so consecutive directions are orthogonal: the zig-zag of lecture 13 slide 20.</li>
                <li>ICD moves along the axes, one coordinate to its exact minimiser (horizontal then vertical). With λ large the contours are round and it is nearly done in one sweep.</li>
                <li>Conjugate gradient takes the steepest-descent step, then one H-conjugate direction, and lands on x̂ in exactly two steps (lecture 14 slide 15).</li>
              </ol>
            </Callout>
          </div>
          <div>
            <MathText>{'Elongated contours mean a large condition number: $\\kappa = h_{\\max}/h_{\\min}$. Try $A = [[2, 1],[0, 1]]$ with $\\lambda = 0$ (pure least squares, $\\kappa \\approx 14$) against $\\lambda = 3$ (round contours). This is also 2022 Q4.5: with $a = \\lambda_{\\max}(A^tA)$ and $B = 0$, the surrogate step is fixed-step gradient descent with $\\alpha = 1/h_{\\max}$.'}</MathText>
          </div>
        </div>
      )}

      <h3>Checks</h3>
      <Choice id="mapopt/lab/check1" module={MODULE} tags={['eigenvalues']} mode="check"
        question="For deblurring with gradient descent and a fixed step, which part of the image converges last, and why?"
        options={['Edges (high spatial frequencies): $h(\\omega)$ is smallest there, so $1 - \\alpha h(\\omega)$ is closest to 1', 'Smooth regions (low frequencies): the prior slows them', 'All frequencies converge at the same rate because $\\alpha$ is fixed', 'Edges, because the blur $a(\\omega)$ is largest at high frequency']}
        answer={0}
        explain="The error at frequency $\\omega$ decays as $(1 - \\alpha h(\\omega))^k$ with $h(\\omega) = |a(\\omega)|^2 + \\lambda(1 - g(\\omega))$. A blur has small $|a(\\omega)|$ at high frequency, so $h$ is small there and convergence is slow (lecture 13, slides 13–16)." />
      <Choice id="mapopt/lab/check2" module={MODULE} tags={['calculus-1d']} mode="check"
        question="Why does ICD have no step-size parameter?"
        options={['Each pixel update solves a one-variable quadratic minimisation exactly, so $\\alpha$ is computed, not chosen', 'Because it uses the error state $e = y - Ax$', 'Because the prior is Gaussian', 'It does: $\\alpha$ must be tuned like in gradient descent']}
        answer={0}
        explain="$x_s \\leftarrow \\arg\\min_{x_s} f(x)$ with the other pixels fixed is a parabola in one variable; its minimiser is the ratio $[(y - Ax)^tA_{*,s} - \\sigma^2x^tB_{*,s}]/[\\|A_{*,s}\\|^2 + \\sigma^2B_{s,s}]$ (lecture 14, slide 6). The error state only makes it cheap." />
    </div>
  )
}
