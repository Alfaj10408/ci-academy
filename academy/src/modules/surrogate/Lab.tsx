import { useEffect, useMemo, useState } from 'react'
import { Plot } from '../../components/Plot'
import { Panel, Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import {
  q4g, q4gQ, q4gStep, q4gMin, absQ, absSurrogate, poissonF, poissonG, poissonH, poissonQ, poissonStep,
  huber, huberD, huberSymA, huberMaxCurvQ, huberSymQ, huberMapCost, huberMapStepSym, huberMapStepMax,
  sumAbs, sumAbsQ, sumAbsStep, median, linspace, eigSym2, lsHessian, lsCost, lsStep, lsSolve, lsGrad, mm, type Mat2, type Vec2,
} from '../../math/surrogate'
import { MODULE } from './constants'

type Fn = 'q4g' | 'abs' | 'poisson' | 'huber' | 'sumabs'
type View = 'cost' | 'bounds' | 'quad'
const XS = [0, 1, 5]

/** hide samples above the plot window so the quadratic does not shoot through the title */
const clip = (ys: number[], top: number) => ys.map((v) => (v > top ? NaN : v))

export function Lab() {
  const [fn, setFn] = useState<Fn>('q4g')
  const [x0, setX0] = useState(3.5)
  const [T, setT] = useState(1)
  const [y, setY] = useState(3)
  const [bound, setBound] = useState<'sym' | 'max'>('sym')
  const [k, setK] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [view, setView] = useState<View>('cost')
  const [A, setA] = useState<Mat2>([[2, 1], [0, 1]])
  const [yv, setYv] = useState<Vec2>([1, 2])
  const [Kq, setKq] = useState(8)

  const def = useMemo(() => {
    switch (fn) {
      case 'q4g': return { f: q4g, q: q4gQ, step: q4gStep, dom: [-2.5, 5] as [number, number], top: 10, min: q4gMin, name: 'f(x) = ½(x−2)² + |x|  (2021 Q4.5)', x: 'x' }
      case 'abs': return { f: Math.abs, q: absQ, step: () => 0, dom: [-4, 4] as [number, number], top: 5, min: 0, name: 'ρ(x) = |x|  (2021 Q4.4, 2024 P2)', x: 'x' }
      case 'poisson': return { f: (t: number) => poissonF(y, t), q: (tp: number, t: number) => poissonQ(y, tp, t), step: (tp: number) => poissonStep(y, tp), dom: [1, 9] as [number, number], top: Math.max(6, poissonF(y, 9) + 1), min: Math.max(1, y), name: `f(θ) = θ − ${y} log θ  (2023 P3, y = ${y})`, x: 'θ' }
      case 'huber': return { f: (x: number) => huberMapCost(T, 3, x), q: (xp: number, x: number) => 0.5 * (x - 3) ** 2 + (bound === 'sym' ? huberSymQ(T, xp, x) : huberMaxCurvQ(T, xp, x)), step: (xp: number) => (bound === 'sym' ? huberMapStepSym(T, 3, xp) : huberMapStepMax(T, 3, xp)), dom: [-4, 6] as [number, number], top: 14, min: NaN, name: `f(x) = ½(x−3)² + ρ_T(x), Huber T = ${T}  (lecture 19)`, x: 'x' }
      case 'sumabs': return { f: (x: number) => sumAbs(XS, x), q: (xp: number, x: number) => sumAbsQ(XS, xp, x), step: (xp: number) => sumAbsStep(XS, xp), dom: [-2, 7] as [number, number], top: 16, min: median(XS), name: 'g(x) = |x| + |x−1| + |x−5|  (2024 P2g–h)', x: 'x' }
    }
  }, [fn, T, y, bound])

  const run = useMemo(() => mm(def.f, def.step, x0, 40), [def, x0])
  const kMax = run.xs.length - 1
  const xp = run.xs[Math.min(k, kMax)]
  const xt = def.step(xp)
  const xs = useMemo(() => linspace(def.dom[0], def.dom[1], 401), [def])
  const fv = xs.map(def.f)
  const qv = clip(xs.map((x) => def.q(xp, x)), def.top)
  const stuck = fn === 'abs' && xp === 0

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setK((v) => { if (v >= kMax) { setPlaying(false); return v } return v + 1 }), 700)
    return () => clearInterval(t)
  }, [playing, kMax])
  useEffect(() => { setK(0); setPlaying(false) }, [fn, x0, T, y, bound])

  // quadratic 2×2 view
  const Hq = lsHessian(A)
  const [lmin, lmax] = eigSym2(Hq)
  const quad = useMemo(() => mm((x: Vec2) => lsCost(A, yv, x), (p: Vec2) => lsStep(A, yv, p), [0, 0] as Vec2, 30), [A, yv])
  const sol = lsSolve(A, yv)
  const setAij = (i: number, j: number, v: number) => { const B = A.map((r) => [...r]) as Mat2; B[i][j] = v; setA(B) }

  const eqs = (): string[] => {
    const chain = `f(x_{k+1}) = ${fmt(def.f(xt))} \\le q(x_{k+1};x_k) = ${fmt(def.q(xp, xt))} \\le q(x_k;x_k) = ${fmt(def.f(xp))}`
    switch (fn) {
      case 'q4g': return [`q(x;x^\\prime) = \\tfrac12(x-2)^2 + \\frac{x^2}{2|x^\\prime|} + \\frac{|x^\\prime|}{2}, \\quad x^\\prime = ${fmt(xp)}`, `x_{k+1} = \\frac{2|x^\\prime|}{1+|x^\\prime|} = \\frac{${fmt(2 * Math.abs(xp))}}{${fmt(1 + Math.abs(xp))}} = ${fmt(xt)}`, chain]
      case 'abs': return [`a = \\frac{1}{2|x^\\prime|} = ${stuck ? '\\infty' : fmt(absSurrogate(xp).a)}, \\quad b = \\frac{|x^\\prime|}{2} = ${fmt(absSurrogate(xp).b)}`, `q(x;x^\\prime) = ax^2 + b, \\qquad \\arg\\min_x q = 0 \\text{ in one step}`, stuck ? '\\text{at } x^\\prime = 0 \\text{ the surrogate does not exist (infinite curvature)}' : chain]
      case 'poisson': return [`g(\\theta^\\prime) = 1 - \\frac{y}{\\theta^\\prime} = ${fmt(poissonG(y, xp))}, \\quad h(\\theta^\\prime) = \\frac{y}{\\theta^{\\prime2}} = ${fmt(poissonH(y, xp))}`, `a = \\max_{\\theta\\ge1} \\frac{y}{\\theta^2} = y = ${y}, \\quad b = g(\\theta^\\prime) = ${fmt(poissonG(y, xp))}`, `\\theta_{k+1} = \\max\\Big(1, \\theta^\\prime - \\frac{b}{a}\\Big) = ${fmt(xt)}, \\qquad \\hat\\theta_{ML} = y = ${y}`, chain]
      case 'huber': return [`\\rho^\\prime(\\Delta^\\prime) = \\mathrm{clip}\\{\\Delta^\\prime,[-T,T]\\} = ${fmt(huberD(T, xp))}`, bound === 'sym' ? `a_2 = \\frac{\\rho^\\prime(\\Delta^\\prime)}{\\Delta^\\prime} = ${fmt(huberSymA(T, xp))}, \\quad x_{k+1} = \\frac{3}{1+a_2} = ${fmt(xt)}` : `c_{\\max} = \\max\\rho^{\\prime\\prime} = 1, \\quad x_{k+1} = \\frac{3 - \\rho^\\prime(x^\\prime) + x^\\prime}{2} = ${fmt(xt)}`, chain]
      case 'sumabs': return [`g(x;x^\\prime) = \\sum_k \\frac{(x-x_k)^2}{2|x^\\prime - x_k|} + \\text{const}, \\quad x_k \\in \\{0, 1, 5\\}`, `x_{k+1} = \\frac{\\sum_k w_k x_k}{\\sum_k w_k}, \; w_k = \\frac{1}{|x^\\prime - x_k|}: \; w = (${XS.map((v) => fmt(1 / Math.abs(xp - v), 2)).join(', ')}) \\Rightarrow ${fmt(xt)}`, `\\text{global minimiser: median} = ${median(XS)}`, chain]
    }
  }

  return (
    <div>
      <h2>Visual laboratory: surrogate functions and the MM iteration</h2>
      <p className="muted">Every curve is computed from the formulas in the equations panel; nothing is drawn by hand. Top-left: the cost and the surrogate built at the current iterate. Top-right: the live mathematics. Bottom-left: experiments. Bottom-right: the equations with current values.</p>
      <div className="grid4">
        <Panel title={def.name}>
          <Plot height={260} xLabel={def.x} xDomain={def.dom} yDomain={[Math.min(0, ...fv), def.top]}
            series={[{ x: xs, y: fv, color: 'var(--causal)', label: 'f' }, { x: xs, y: qv, color: 'var(--noncausal)', dashed: true, label: `q(·;x${k})` }]}
            overlay={(sx, sy) => (
              <g>
                {run.xs.slice(0, Math.min(k, kMax) + 1).map((v, i) => <circle key={i} cx={sx(v)} cy={sy(def.f(v))} r={3} fill="var(--muted)" opacity={0.3 + (0.7 * i) / (k + 1)} />)}
                <circle cx={sx(xp)} cy={sy(def.f(xp))} r={5} fill="var(--bad)" />
                <text x={sx(xp) + 6} y={sy(def.f(xp)) - 8} className="marker-label">x{k} (touch)</text>
                {!stuck && <>
                  <line x1={sx(xt)} x2={sx(xt)} y1={sy(def.q(xp, xt))} y2={sy(def.f(xt))} stroke="var(--noncausal)" strokeDasharray="3 3" />
                  <circle cx={sx(xt)} cy={sy(def.q(xp, xt))} r={4} fill="var(--noncausal)" />
                  <text x={sx(xt) + 6} y={sy(def.q(xp, xt)) + 14} className="marker-label">argmin q</text>
                </>}
                {Number.isFinite(def.min) && <line x1={sx(def.min)} x2={sx(def.min)} y1={sy(0)} y2={sy(def.top)} stroke="var(--causal)" strokeDasharray="2 4" opacity={0.5} />}
              </g>
            )} />
          <div className="signal-controls">
            <button className="btn btn-ghost" onClick={() => setPlaying(!playing)} disabled={stuck}>{playing ? '⏸ Pause' : '▶ Play'}</button>
            <button className="btn btn-ghost" onClick={() => setK(Math.min(kMax, k + 1))} disabled={stuck}>Step</button>
            <button className="btn btn-ghost" onClick={() => { setK(0); setPlaying(false) }}>Reset</button>
            <span className="small">k = {k} · x{k} = {fmt(xp, 4)} · C{k} = f(x{k}) = {fmt(def.f(xp), 4)}</span>
          </div>
          {stuck && <Callout kind="warn" title="Surrogate undefined"><MathText>{'At $x^\\prime = 0$ the curvature $1/(2|x^\\prime|)$ is infinite: no quadratic surrogate exists there (2024 P2c key). The iteration stops.'}</MathText></Callout>}
        </Panel>

        <Panel title="Live mathematics" actions={<div className="toggle">{(['cost', 'bounds', 'quad'] as const).map((v) => <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v === 'cost' ? 'C_k sequence' : v === 'bounds' ? 'max curvature vs symmetric' : '½‖y−Ax‖², a = λ_max'}</button>)}</div>}>
          {view === 'cost' && <>
            <Plot height={220} xLabel="k" yLabel="Cₖ = f(xₖ)" title="Monotone decrease (8.4): Cₖ ≤ Cₖ₋₁" xDomain={[0, 20]}
              series={[{ x: run.C.slice(0, 21).map((_, i) => i), y: run.C.slice(0, 21), color: 'var(--causal)', stems: true }, ...(Number.isFinite(def.min) ? [{ x: [0, 20], y: [def.f(def.min), def.f(def.min)], color: 'var(--muted)', dashed: true, label: 'f(x*)' }] : [])]}
              marker={{ x: Math.min(k, 20), y: run.C[Math.min(k, 20)], color: 'var(--bad)' }} />
            <p className="small muted">The stems never go up: that is 2021 Q4.2. They are bounded below by f(x*), so they converge: 2021 Q4.3. Convergence can be slow when the surrogate curvature is much larger than the true curvature (compare Poisson with large y, or the Huber maximum-curvature bound).</p>
          </>}
          {view === 'bounds' && <BoundsView T={T} />}
          {view === 'quad' && <>
            <div className="row small" style={{ flexWrap: 'wrap', gap: 6 }}>
              <span>A =</span>
              {[0, 1].map((i) => [0, 1].map((j) => <input key={`${i}${j}`} type="number" step={0.5} value={A[i][j]} onChange={(e) => setAij(i, j, +e.target.value)} style={{ width: 56 }} />))}
              <span>y =</span>
              {[0, 1].map((i) => <input key={i} type="number" step={0.5} value={yv[i]} onChange={(e) => { const v: Vec2 = [...yv] as Vec2; v[i] = +e.target.value; setYv(v) }} style={{ width: 56 }} />)}
            </div>
            <Plot height={200} xLabel="k" yLabel="f(x_k)" title={`MM with a = λ_max(AᵗA) = ${fmt(lmax)} is gradient descent with step 1/a`} xDomain={[0, 30]}
              series={[{ x: quad.C.map((_, i) => i), y: quad.C, color: 'var(--causal)', stems: true }, ...(sol ? [{ x: [0, 30], y: [lsCost(A, yv, sol), lsCost(A, yv, sol)], color: 'var(--muted)', dashed: true, label: 'f(x̂)' }] : [])]}
              marker={{ x: Math.min(Kq, 30), y: quad.C[Math.min(Kq, 30)], color: 'var(--bad)' }} />
            <Slider label="K (iterations shown)" value={Kq} min={0} max={30} step={1} onChange={setKq} />
            <div className="eq">
              <Tex block>{`A^tA = \\begin{bmatrix}${fmt(Hq[0][0])} & ${fmt(Hq[0][1])}\\\\ ${fmt(Hq[1][0])} & ${fmt(Hq[1][1])}\\end{bmatrix}, \\quad \\lambda = (${fmt(lmin)}, ${fmt(lmax)}), \\quad x_K = (${fmt(quad.xs[Kq][0])}, ${fmt(quad.xs[Kq][1])})${sol ? `, \\quad \\hat x = (${fmt(sol[0])}, ${fmt(sol[1])})` : ''}`}</Tex>
              <Tex block>{`x \\leftarrow x - \\frac{1}{${fmt(lmax)}}A^t(Ax - y), \\qquad \\nabla f(x_K) = (${fmt(lsGrad(A, yv, quad.xs[Kq])[0])}, ${fmt(lsGrad(A, yv, quad.xs[Kq])[1])})`}</Tex>
            </div>
            <p className="small muted">2022 Q4: the Taylor expansion of f is exact with B = AᵗA; replacing B by λ_max I keeps the touch and makes an upper bound. Convergence rate per step is 1 − λ_min/λ_max along the slowest mode, so an ill-conditioned A (try A = [[3, 0],[0, 0.3]]) crawls.</p>
          </>}
        </Panel>

        <Panel title="Experiments">
          <div className="toggle" style={{ flexWrap: 'wrap' }}>
            {([['q4g', '½(x−2)²+|x|'], ['abs', '|x|'], ['poisson', 'Poisson NLL'], ['huber', 'Huber MAP'], ['sumabs', 'Σ|x−x_k|']] as [Fn, string][]).map(([v, l]) => <button key={v} className={fn === v ? 'active' : ''} onClick={() => setFn(v)}>{l}</button>)}
          </div>
          <Slider label={<Tex>{fn === 'poisson' ? '\\theta_0' : 'x_0'}</Tex>} value={x0} min={def.dom[0]} max={def.dom[1]} step={0.05} onChange={(v) => setX0(fn === 'poisson' ? Math.max(1, v) : v)} format={(v) => v.toFixed(2)} />
          {fn === 'poisson' && <Slider label="y (observed count)" value={y} min={1} max={8} step={1} onChange={setY} />}
          {fn === 'huber' && <>
            <Slider label="T (Huber threshold)" value={T} min={0.25} max={3} step={0.25} onChange={setT} />
            <div className="toggle"><button className={bound === 'sym' ? 'active' : ''} onClick={() => setBound('sym')}>symmetric bound</button><button className={bound === 'max' ? 'active' : ''} onClick={() => setBound('max')}>maximum curvature</button></div>
          </>}
          <div className="row" style={{ marginTop: 8 }}>
            <span className="small muted">Presets:</span>
            <button className="btn btn-ghost" onClick={() => { setFn('q4g'); setX0(1) }}>2021 Q4.6: x′ = 1</button>
            <button className="btn btn-ghost" onClick={() => { setFn('abs'); setX0(1) }}>2024 P2b: x′ = 1</button>
            <button className="btn btn-ghost" onClick={() => { setFn('poisson'); setY(1); setX0(4) }}>2023 P3: y = 1</button>
          </div>
          <p className="small">Experiments: (1) For ½(x−2)²+|x| start at x₀ = 1 and confirm the iteration does not move: a fixed point is a minimiser. (2) Start at x₀ = 4 and count how many steps halve the distance to 1. (3) Poisson with y = 8: the maximum-curvature surrogate (a = y) is very stiff, so convergence is slow; compare y = 1. (4) Huber with T = 1 from x₀ = −4: switch between the two bounds and compare the number of steps to reach the minimum. (5) Σ|x−x_k|: start anywhere and watch the weighted mean walk to the median 1.</p>
        </Panel>

        <Panel title="Equations with current values">
          {eqs().map((e, i) => <div className="eq eq-row" key={i}><Tex block>{e}</Tex><span className="live" key={`${fn}${k}${x0}${T}${y}${bound}`} /></div>)}
          <p className="ref">References: lecture 18 slides 6–10, 12–13 (conditions, chain, pseudocode); lecture 19 slides 4–10, 13 (properties, maximum curvature, symmetric bound); lecture 13 (gradient descent step 1/λ_max); midterm keys 2021 Q4, 2022 Q4, 2023 P3, 2024 P2.</p>
        </Panel>
      </div>

      <h3>Concept checks</h3>
      <Choice id="surrogate/lab/check1" module={MODULE} tags={['calculus-1d']} mode="check"
        question="Set the Poisson lab to $y = 8$. The surrogate uses $a = y = 8$ although $f^{\\prime\\prime}(\\theta) = 8/\\theta^2$ is much smaller for $\\theta$ near 8. What is the consequence?"
        options={['Each step is valid but short: the bound is conservative, so convergence is slow', 'The upper bound (8.2) fails for large $\\theta$', 'The iteration diverges', 'The ML estimate changes']}
        answer={0}
        explain="Maximum curvature over $\\theta\\ge1$ is attained at $\\theta=1$ and is far above the local curvature near the minimiser. The surrogate is still an upper bound, so every step decreases $f$, but the steps are tiny: lecture 19, slide 7’s “too conservative”." />
      <Choice id="surrogate/lab/check2" module={MODULE} tags={['calculus-1d', 'convexity']} mode="check"
        question="For the Huber MAP cost, why does the symmetric-bound surrogate reach the minimum in fewer steps than maximum curvature when $|x^\\prime| > T$?"
        options={['Its curvature $a_2 = T/|x^\\prime| < 1 = c_{\\max}$, so the bowl is wider and its minimiser is further from $x^\\prime$', 'It is not an upper bound, so it cheats', 'It uses the exact Hessian', 'Both take the same steps; only the constants differ']}
        answer={0}
        explain="Both are valid surrogates (the lab checks $f\\le q$ on a grid in the test suite). A smaller curvature that still bounds $f$ gives a longer step, which is why lecture 19 prefers the symmetric bound." />
    </div>
  )
}

function BoundsView({ T }: { T: number }) {
  const [dp, setDp] = useState(2)
  const xs = linspace(-5, 5, 401)
  const top = 8
  return (
    <>
      <Plot height={220} xLabel="Δ" title={`Huber ρ_T (T = ${T}) and two surrogates at Δ′ = ${fmt(dp)}`} xDomain={[-5, 5]} yDomain={[0, top]}
        series={[
          { x: xs, y: xs.map((d) => huber(T, d)), color: 'var(--causal)', label: 'ρ' },
          { x: xs, y: clip(xs.map((d) => huberMaxCurvQ(T, dp, d)), top), color: 'var(--bad)', dashed: true, label: 'max curvature' },
          { x: xs, y: clip(xs.map((d) => huberSymQ(T, dp, d)), top), color: 'var(--noncausal)', dashed: true, label: 'symmetric bound' },
        ]}
        overlay={(sx, sy) => <g><circle cx={sx(dp)} cy={sy(huber(T, dp))} r={5} fill="var(--bad)" /><circle cx={sx(-dp)} cy={sy(huber(T, -dp))} r={4} fill="var(--noncausal)" /></g>} />
      <Slider label={<Tex>{'\\Delta^\\prime'}</Tex>} value={dp} min={-4} max={4} step={0.1} onChange={setDp} format={(v) => v.toFixed(1)} />
      <div className="eq">
        <Tex block>{`c_{\\max} = \\max\\rho^{\\prime\\prime} = 1, \\qquad a_2 = \\frac{\\rho^\\prime(\\Delta^\\prime)}{\\Delta^\\prime} = \\frac{${fmt(huberD(T, dp))}}{${fmt(dp)}} = ${fmt(huberSymA(T, dp))}`}</Tex>
      </div>
      <p className="small muted">Maximum curvature (red) is centred at Δ′ and touches once. The symmetric bound (blue) is centred at 0 and touches at ±Δ′; for |Δ′| &gt; T its curvature T/|Δ′| is smaller, so it hugs ρ more closely on the far side. Inside |Δ′| &lt; T both coincide with ρ itself. Lecture 19, slides 7–8.</p>
    </>
  )
}
