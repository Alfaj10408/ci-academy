import { useEffect, useMemo, useState } from 'react'
import { Plot } from '../../components/Plot'
import { Panel, Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import { shrink, shrinkVec, clipPos, proxDenoise, admmRun, gap, tvAdmmRun, tvCost, diffMatrix, lineX, lineLamStar, lineAugLagStep, swap, mannStep, iterate, diagProjection, sparseSignal, stepSignal, linspace } from '../../math/prox'
import { noise, add, norm2, sub, type Vec } from '../../math/mapopt'
import { MODULE } from './constants'

type View = 'shrink' | 'admm' | 'tv' | 'lagrange' | 'mann'
const N = 16
const clipTop = (ys: number[], top: number) => ys.map((v) => (Math.abs(v) > top ? NaN : v))

export function Lab() {
  const [view, setView] = useState<View>('shrink')
  const [lam, setLam] = useState(1)
  const [a, setA] = useState(1)
  const [k, setK] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [alpha, setAlpha] = useState(0.3)
  const [x0, setX0] = useState<Vec>([3, -1])
  const [lagLam, setLagLam] = useState(0)

  /* shrinkage */
  const ys = useMemo(() => linspace(-4, 4, 161), [])
  const sig = useMemo(() => sparseSignal(N), [])
  const noisy = useMemo(() => add(sig, noise(N, 0.6, 9)), [sig])
  const ns = Array.from({ length: N }, (_, i) => i)

  /* positivity ADMM */
  const yPos = useMemo(() => add(stepSignal(N).map((v) => v - 0.8), noise(N, 0.3, 4)), [])
  const admm = useMemo(() => admmRun((z) => proxDenoise(yPos, a, z), clipPos, N, 40), [yPos, a])

  /* TV ADMM */
  const yTv = useMemo(() => add(stepSignal(N), noise(N, 0.25, 6)), [])
  const tv = useMemo(() => tvAdmmRun(yTv, lam, a, 60), [yTv, lam, a])
  const B = useMemo(() => diffMatrix(N), [])

  const kMax = view === 'admm' ? admm.length - 1 : view === 'tv' ? tv.length - 1 : 0
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setK((v) => { if (v >= kMax) { setPlaying(false); return v } return v + 1 }), 400)
    return () => clearInterval(t)
  }, [playing, kMax])
  useEffect(() => { setK(0); setPlaying(false) }, [view, lam, a])

  /* Lagrange line example */
  const yL: Vec = [3, 1]
  const xL = lineX(yL, lagLam)
  const lamStar = lineLamStar(yL)
  const augPath = useMemo(() => { const out: { x: Vec; lam: number }[] = [{ x: yL, lam: 0 }]; let s = { x: yL, lam: 0 }; for (let i = 0; i < 12; i++) { s = lineAugLagStep(yL, a, s.lam); out.push(s) } return out }, [a])

  /* Mann */
  const plain = iterate(swap, x0, 6)
  const mann = iterate((x) => mannStep(swap, alpha, x), x0, 30)
  const proj = diagProjection(x0)

  const ak = Math.min(k, kMax)
  return (
    <div>
      <h2>Visual laboratory: proximal maps, ADMM and fixed points</h2>
      <div className="row">
        {([['shrink', 'Shrinkage (2025 P2)'], ['admm', 'ADMM with a clip (2022 Q3)'], ['tv', 'Total variation ADMM'], ['lagrange', 'Lagrange multiplier (lecture 22)'], ['mann', 'Swap map and Mann iteration (2025 P4)']] as [View, string][]).map(([v, l]) => <button key={v} className={`btn ${view === v ? '' : 'btn-ghost'}`} onClick={() => setView(v)}>{l}</button>)}
      </div>

      {view === 'shrink' && (
        <div className="grid4">
          <Panel title="The shrinkage function S_λ(y) = sign(y) max(|y| − λ, 0)">
            <Plot height={260} xLabel="y" yLabel="S(y)" xDomain={[-4, 4]} yDomain={[-4, 4]}
              series={[{ x: ys, y: ys, color: 'var(--muted)', dashed: true, label: 'identity' }, { x: ys, y: ys.map((v) => shrink(lam, v)), color: 'var(--bad)', width: 3, label: 'S_λ' }]} />
          </Panel>
          <Panel title="Componentwise on a vector: noisy sparse y (stems) → S_λ(y) (dots)">
            <Plot height={260} xLabel="i" xDomain={[0, N - 1]} yDomain={[-5, 5]}
              series={[{ x: ns, y: noisy, color: 'var(--causal)', stems: true, label: 'y' }, { x: ns, y: shrinkVec(lam, noisy), color: 'var(--bad)', stems: true, width: 3, label: 'S_λ(y)' }, { x: ns, y: sig, color: 'var(--muted)', dashed: true, label: 'true x' }]} />
          </Panel>
          <div>
            <Slider label={<Tex>{'\\lambda'}</Tex>} value={lam} min={0} max={3} step={0.05} onChange={setLam} format={(v) => v.toFixed(2)} />
            <div className="eq">
              <Tex block>{'S_\\lambda(y) = \\arg\\min_x\\Big\\{\\lambda|x| + \\tfrac12(x - y)^2\\Big\\} = \\begin{cases} y - \\lambda & y > \\lambda \\\\ 0 & |y| \\le \\lambda \\\\ y + \\lambda & y < -\\lambda \\end{cases}'}</Tex>
              <Tex block>{`\\lambda = ${fmt(lam)}: \\quad ${noisy.filter((v) => Math.abs(v) <= lam).length} \\text{ of } ${N} \\text{ entries set to zero}`}</Tex>
            </div>
          </div>
          <div>
            <Callout title="Experiments">
              <ol>
                <li>λ = 0: the identity. Raise λ: a dead zone of width 2λ opens around zero and every surviving value moves toward zero by exactly λ (a continuous soft threshold, lecture 23 slide 13).</li>
                <li>On the vector: small entries (likely noise) vanish, large ones (likely signal) are kept but reduced. Around λ ≈ 1 the recovered support matches the true sparse signal.</li>
                <li>Too large λ: real entries die too. This is the σ² trade-off of the intuition step in disguise.</li>
              </ol>
            </Callout>
          </div>
        </div>
      )}

      {view === 'admm' && (
        <div className="grid4">
          <Panel title="Positivity-constrained denoising: y (stems), x (bold), v (dots) after k iterations">
            <Plot height={260} xLabel="i" xDomain={[0, N - 1]} yDomain={[-2, 3]}
              series={[{ x: ns, y: yPos, color: 'var(--causal)', stems: true, label: 'y' }, { x: ns, y: admm[ak].x, color: 'var(--bad)', width: 3, label: 'x' }, { x: ns, y: admm[ak].v, color: 'var(--noncausal)', stems: true, label: 'v = clip(x + u)' }, { x: ns, y: clipPos(yPos), color: 'var(--muted)', dashed: true, label: 'solution max(y, 0)' }]} />
          </Panel>
          <Panel title="Constraint gap ‖x − v‖ and the multiplier u on a negative pixel">
            <Plot height={260} xLabel="k" xDomain={[0, 40]} yDomain={[-2, 2]}
              series={[{ x: admm.map((_, i) => i), y: admm.map(gap), color: 'var(--bad)', label: '‖x − v‖' }, { x: admm.map((_, i) => i), y: admm.map((s) => s.u[0]), color: 'var(--noncausal)', label: 'u₀ (pixel 0, y₀ < 0)' }, { x: [0, 40], y: [yPos[0] / a, yPos[0] / a], color: 'var(--muted)', dashed: true, label: 'limit u₀ = y₀/a' }]} />
          </Panel>
          <div>
            <Slider label={<Tex>{'a'}</Tex>} value={a} min={0.1} max={10} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
            <div className="row">
              <button className="btn" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
              <button className="btn btn-ghost" onClick={() => setK(Math.min(k + 1, kMax))}>Step</button>
              <button className="btn btn-ghost" onClick={() => { setK(0); setPlaying(false) }}>Reset</button>
              <span className="pill">k = {ak} · gap = {fmt(gap(admm[ak]))}</span>
            </div>
            <div className="eq">
              <Tex block>{'x \\leftarrow F(v - u) = \\frac{y + a(v - u)}{1 + a}, \\qquad v \\leftarrow H(x + u) = \\max(x + u, 0), \\qquad u \\leftarrow u + (x - v)'}</Tex>
              <Tex block>{`k = ${ak}: \\quad x_0 = ${fmt(admm[ak].x[0])}, \\ v_0 = ${fmt(admm[ak].v[0])}, \\ u_0 = ${fmt(admm[ak].u[0])}`}</Tex>
            </div>
          </div>
          <div>
            <Callout title="What to look for">
              <ol>
                <li>Step once: x is the free denoiser's answer (negative where y is negative), v clips it, and u records the difference. u is the scaled multiplier λ/a (lecture 22 slide 15).</li>
                <li>Play: on negative pixels u drifts to y₀/a: the multiplier λ* = y₀ is the force needed to hold x at 0, and u = λ*/a is its scaled version. On positive pixels u stays 0. The gap ‖x − v‖ goes to zero (2022 Q3.3: raising u lowers x̂ − v̂).</li>
                <li>Larger a: fewer iterations (lecture 22 slide 16). The limit x does not depend on a; the scaled multiplier u does, as λ*/a.</li>
              </ol>
            </Callout>
            <MathText>{'$f(x) = \\tfrac12\\|y - x\\|^2$ here, so $F$ has the closed form shown; any solver for $f$ could replace it. $H$ is the clip, the proximal map of the extended function $\\tilde g$ (lecture 21 slide 14; 2022 Q3.5).'}</MathText>
          </div>
        </div>
      )}

      {view === 'tv' && (
        <div className="grid4">
          <Panel title="Total variation: y (stems), x after k iterations (bold), true signal (dashed)">
            <Plot height={260} xLabel="i" xDomain={[0, N - 1]} yDomain={[-0.5, 3]}
              series={[{ x: ns, y: yTv, color: 'var(--causal)', stems: true, label: 'y' }, { x: ns, y: tv[ak].x, color: 'var(--bad)', width: 3, label: 'x' }, { x: ns, y: stepSignal(N), color: 'var(--muted)', dashed: true, label: 'true' }]} />
          </Panel>
          <Panel title="Cost ½‖y − x‖² + λ‖Bx‖₁ and the gap ‖Bx − v‖">
            <Plot height={260} xLabel="k" xDomain={[0, 60]} yDomain={[0, Math.max(1, tvCost(yTv, lam, yTv, B) * 1.1)]}
              series={[{ x: tv.map((_, i) => i), y: tv.map((s) => tvCost(yTv, lam, s.x, B)), color: 'var(--causal)', label: 'cost' }, { x: tv.map((_, i) => i), y: tv.map((s) => norm2(sub(B.map((r) => r.reduce((acc, c, j) => acc + c * s.x[j], 0)), s.v))), color: 'var(--bad)', label: '‖Bx − v‖' }]} />
          </Panel>
          <div>
            <Slider label={<Tex>{'\\lambda'}</Tex>} value={lam} min={0} max={3} step={0.05} onChange={setLam} format={(v) => v.toFixed(2)} />
            <Slider label={<Tex>{'a'}</Tex>} value={a} min={0.1} max={10} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
            <div className="row">
              <button className="btn" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
              <button className="btn btn-ghost" onClick={() => setK(Math.min(k + 1, kMax))}>Step</button>
              <button className="btn btn-ghost" onClick={() => { setK(0); setPlaying(false) }}>Reset</button>
              <span className="pill">k = {ak}</span>
            </div>
            <div className="eq">
              <Tex block>{'x \\leftarrow (I + aB^tB)^{-1}\\big(y + aB^t(v - u)\\big), \\qquad v \\leftarrow S_{\\lambda/a}(Bx + u), \\qquad u \\leftarrow u + Bx - v'}</Tex>
              <Tex block>{`\\text{cost}(x^{(k)}) = ${fmt(tvCost(yTv, lam, tv[ak].x, B))}, \\qquad \\text{cost}(y) = ${fmt(tvCost(yTv, lam, yTv, B))}`}</Tex>
            </div>
          </div>
          <div>
            <Callout title="What to look for">
              <ol>
                <li>The x update is a quadratic solve; the v update is one shrinkage on the differences Bx + u with threshold λ/a (lecture 24 slide 14: the L1 proximal map with λ = 1/a applied to λ‖·‖₁).</li>
                <li>The estimate becomes piecewise constant: TV keeps the edges and flattens the noise, which a quadratic prior cannot do (Module 3).</li>
                <li>The cost is not monotone in k (ADMM relaxes the constraint and enforces it at convergence, lecture 24 slide 11), but the gap goes to zero and the cost settles at the global minimum.</li>
              </ol>
            </Callout>
          </div>
        </div>
      )}

      {view === 'lagrange' && (
        <div className="grid4">
          <Panel title="Minimise ½‖x − y‖² on the line x₂ = x₁ + 1: x(λ) slides as λ grows">
            <Plot height={300} width={420} xLabel="x₁" yLabel="x₂" xDomain={[-1, 4]} yDomain={[0, 5]}
              series={[{ x: [-1, 4], y: [0, 5], color: 'var(--muted)', label: 'constraint x₂ = x₁ + 1' }, { x: linspace(-1, 3, 41).map((l) => yL[0] - l), y: linspace(-1, 3, 41).map((l) => yL[1] + l), color: 'var(--noncausal)', dashed: true, label: 'x(λ), λ from −1 to 3' }, { x: augPath.map((p) => p.x[0]), y: augPath.map((p) => p.x[1]), color: 'var(--bad)', label: 'augmented Lagrangian iterates' }]}
              marker={{ x: xL[0], y: xL[1], color: 'var(--causal)', label: `x(λ), λ = ${fmt(lagLam, 2)}` }} />
          </Panel>
          <div>
            <Slider label={<Tex>{'\\lambda'}</Tex>} value={lagLam} min={-1} max={3} step={0.05} onChange={setLagLam} format={(v) => v.toFixed(2)} />
            <Slider label={<Tex>{'a \\ (\\text{augmented Lagrangian})'}</Tex>} value={a} min={0.1} max={10} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
            <div className="eq">
              <Tex block>{'L(x;\\lambda) = \\tfrac12\\|x - y\\|^2 + \\lambda(x_1 - x_2 + 1), \\qquad x(\\lambda) = (y_1 - \\lambda,\\ y_2 + \\lambda)'}</Tex>
              <Tex block>{`y = (3, 1): \\quad \\lambda^* = \\tfrac12(y_1 - y_2 + 1) = ${fmt(lamStar)}, \\qquad x^* = (${fmt(lineX(yL, lamStar)[0])}, ${fmt(lineX(yL, lamStar)[1])})`}</Tex>
              <Tex block>{`\\lambda^{(k+1)} = \\lambda^{(k)} + a(Cx^{(k+1)} - b): \\quad \\lambda^{(12)} = ${fmt(augPath[12].lam, 4)}`}</Tex>
            </div>
          </div>
          <div>
            <Callout title="What to look for">
              <ol>
                <li>λ = 0 is the unconstrained minimiser y, off the line. Raising λ slides x(λ) perpendicular to the line; at λ* it lands on it; beyond, it crosses (lecture 22 slide 7).</li>
                <li>The multiplier is a price per unit of constraint error (slide 6). In practice λ* is unknown, so the augmented Lagrangian adds (a/2)(Cx − b)² and updates λ ← λ + a(Cx − b): the red iterates converge to x* for any a, faster for larger a (slides 14–16).</li>
              </ol>
            </Callout>
          </div>
          <div>
            <MathText>{'The split $x = v$ of ADMM is this picture with $C = [I\\ \\ {-I}]$, $b = 0$ and the scaled multiplier $u = \\lambda/a$: the update $u \\leftarrow u + (x - v)$ is exactly $\\lambda \\leftarrow \\lambda + a(Cx - b)$ divided by $a$ (slide 15).'}</MathText>
          </div>
        </div>
      )}

      {view === 'mann' && (
        <div className="grid4">
          <Panel title="H(x) = (x₂, x₁): plain iteration (dashed) versus the averaged iteration (solid)">
            <Plot height={300} width={420} xLabel="x₁" yLabel="x₂" xDomain={[-4, 5]} yDomain={[-4, 5]}
              series={[{ x: [-4, 5], y: [-4, 5], color: 'var(--muted)', label: 'fixed points x₁ = x₂' }, { x: plain.map((p) => p[0]), y: plain.map((p) => p[1]), color: 'var(--causal)', dashed: true, label: 'x ← H(x)' }, { x: mann.map((p) => p[0]), y: mann.map((p) => p[1]), color: 'var(--bad)', width: 2, label: 'x ← (1−α)x + αH(x)' }]}
              marker={{ x: proj[0], y: proj[1], color: 'var(--bad)', label: 'limit: projection onto the diagonal' }} />
          </Panel>
          <div>
            <Slider label={<Tex>{'\\alpha'}</Tex>} value={alpha} min={0.05} max={0.95} step={0.05} onChange={setAlpha} format={(v) => v.toFixed(2)} />
            <Slider label={<Tex>{'x_1^{(0)}'}</Tex>} value={x0[0]} min={-3} max={4} step={0.1} onChange={(v) => setX0([v, x0[1]])} format={(v) => v.toFixed(1)} />
            <Slider label={<Tex>{'x_2^{(0)}'}</Tex>} value={x0[1]} min={-3} max={4} step={0.1} onChange={(v) => setX0([x0[0], v])} format={(v) => v.toFixed(1)} />
            <div className="eq">
              <Tex block>{'H(x) = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}x, \\qquad \\|H(x) - H(y)\\| = \\|x - y\\| \\ \\text{(nonexpansive, not a contraction)}'}</Tex>
              <Tex block>{`x^{(0)} = (${fmt(x0[0])}, ${fmt(x0[1])}) \\ \\Rightarrow\\ x^{(\\infty)} = \\Big(\\tfrac{x_1^{(0)} + x_2^{(0)}}{2}, \\tfrac{x_1^{(0)} + x_2^{(0)}}{2}\\Big) = (${fmt(proj[0])}, ${fmt(proj[1])})`}</Tex>
              <Tex block>{`\\text{after 30 averaged steps: } (${fmt(mann[30][0], 4)}, ${fmt(mann[30][1], 4)})`}</Tex>
            </div>
          </div>
          <div>
            <Callout title="What to look for">
              <ol>
                <li>Plain iteration reflects the point across the diagonal forever: no convergence unless x⁽⁰⁾ is already on it (2025 P4c).</li>
                <li>Averaging with any α in (0, 1) damps the reflection: the iterate slides along the perpendicular to the diagonal and stops at the projection (2025 P4d–e). α = ½ gets there in one step; α near 0 or 1 is slow (rate |1 − 2α|).</li>
                <li>The map is nonexpansive but not a contraction, so the contraction theorem does not apply; the Mann iteration theorem does. This is the convergence argument behind PnP-ADMM with a nonexpansive denoiser (lecture 24 slide 21, lecture 25 slide 19).</li>
              </ol>
            </Callout>
          </div>
        </div>
      )}

      <h3>Checks</h3>
      <Choice id="prox/lab/check1" module={MODULE} tags={['case-analysis']} mode="check"
        question="In the total variation ADMM, why is the $v$ update a shrinkage and not a clip?"
        options={['Because $g(v) = \\lambda\\|v\\|_1$: the $L_1$ proximal map is the soft threshold $S_{\\lambda/a}$', 'Because the constraint $Bx = v$ is linear', 'Because $x$ must be positive', 'Because the data term is quadratic']}
        answer={0}
        explain="The $v$ update is the proximal map of $g/a$ at $Bx + u$ (lecture 24 slide 10). For $g = \\lambda\\|\\cdot\\|_1$ that is componentwise shrinkage with threshold $\\lambda/a$; for the positivity indicator $\\tilde g$ it is the clip." />
      <Choice id="prox/lab/check2" module={MODULE} tags={['lagrangian']} mode="check"
        question="In the split-variable algorithm, what does $u$ converge to?"
        options={['$\\lambda^*/a$: the optimal Lagrange multiplier of the constraint $x = v$, scaled by $1/a$', '$0$, because the constraint is eventually met', '$\\hat x - \\hat v$', 'It does not converge; only $x$ and $v$ do']}
        answer={0}
        explain="Lecture 22 slide 15 and lecture 24 slide 21: $u^{(k)} \\to \\lambda^*/a$ while $\\hat x^{(k)} - \\hat v^{(k)} \\to 0$. The increments $x - v$ vanish, not $u$ itself: on an active positivity constraint $u$ settles at a nonzero price." />
    </div>
  )
}
