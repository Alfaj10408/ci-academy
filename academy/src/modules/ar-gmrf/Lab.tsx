import { useEffect, useMemo, useState } from 'react'
import { Plot, Heatmap, piTicks } from '../../components/Plot'
import { Panel, Slider, Choice, Callout } from '../../components/ui'
import { Tex, MathText, fmt } from '../../components/Tex'
import {
  generateAR1, causalPredict, noncausalPredict, psdAR, psdGMRF, absOneMinusH2, G, g1, snc2, precisionMatrix, omegaAxis, meanSquare,
} from '../../math/argmrf'
import { MODULE } from './constants'

type Mode = 'causal' | 'noncausal'

export function Lab() {
  const [rho, setRho] = useState(0.5)
  const [sc2, setSc2] = useState(1)
  const [seed, setSeed] = useState(1)
  const [N, setN] = useState(48)
  const [mode, setMode] = useState<Mode>('causal')
  const [n, setNn] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [view, setView] = useState<'psd' | 'filters' | 'B'>('psd')
  const [w, setW] = useState(0.8)
  const m = { rho, sc2 }

  const { x } = useMemo(() => generateAR1(m, N, seed), [rho, sc2, seed, N])
  const idx = useMemo(() => Array.from({ length: N }, (_, i) => i), [N])
  const predC = useMemo(() => idx.map((k) => causalPredict(x, rho, k)), [x, rho, idx])
  const predNC = useMemo(() => idx.map((k) => noncausalPredict(x, rho, k)), [x, rho, idx])
  const pred = mode === 'causal' ? predC : predNC
  const err = idx.map((k) => x[k] - pred[k])
  const nMax = mode === 'causal' ? N - 1 : N - 2
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setNn((k) => (k >= nMax ? (setPlaying(false), k) : k + 1)), 350)
    return () => clearInterval(t)
  }, [playing, nMax])
  useEffect(() => { setNn(1) }, [rho, sc2, seed, N, mode])

  const msSoFar = meanSquare(err.slice(0, n + 1))
  const theory = mode === 'causal' ? sc2 : snc2(m)
  const om = useMemo(() => omegaAxis(257), [])
  const sAR = om.map((v) => psdAR(m, v))
  const sG = om.map((v) => psdGMRF(m, v))
  const B = useMemo(() => precisionMatrix(m, 6), [rho, sc2])
  const gg = g1(rho)
  const cur = pred[n]
  const col = mode === 'causal' ? 'var(--causal)' : 'var(--noncausal)'

  return (
    <div>
      <h2>Visual laboratory: one process, two predictors, one spectrum</h2>
      <p className="muted">Every number on this page is computed from the model; nothing is decorative. Top-left: the process and the prediction window. Top-right: the live mathematics. Bottom-left: experiments. Bottom-right: the equations with current values; terms that change are highlighted.</p>
      <div className="grid4">
        <Panel title="Concept: predicting X_n from the past vs. from both sides" actions={
          <div className="toggle"><button className={mode === 'causal' ? 'active' : ''} onClick={() => setMode('causal')}>causal h</button><button className={mode === 'noncausal' ? 'active' : ''} onClick={() => setMode('noncausal')}>noncausal g</button></div>}>
          <Plot series={[{ x: idx, y: x, color: 'var(--muted)', width: 1.5 }, { x: idx, y: x, color: 'var(--muted)', stems: true, width: 1 }]} xLabel="n" height={230} xDomain={[0, N - 1]}
            overlay={(sx, sy) => (
              <g>
                <rect x={sx(n - 1) - 6} y={20} width={sx(mode === 'causal' ? n : n + 1) - sx(n - 1) + 12} height={sy(0) * 2 - 40 > 0 ? 190 : 190} fill={col} opacity={0.12} rx={6} />
                {[n - 1, ...(mode === 'noncausal' ? [n + 1] : [])].map((k) => <circle key={k} cx={sx(k)} cy={sy(x[k])} r={5} fill={col} />)}
                {Number.isFinite(cur) && <>
                  <circle cx={sx(n)} cy={sy(cur)} r={5} fill="none" stroke={col} strokeWidth={2.5} />
                  <line x1={sx(n)} x2={sx(n)} y1={sy(cur)} y2={sy(x[n])} stroke="var(--bad)" strokeWidth={2.5} />
                  <text x={sx(n) + 8} y={sy((cur + x[n]) / 2) + 4} className="marker-label" fill="var(--bad)">e = {fmt(err[n], 2)}</text>
                </>}
              </g>
            )} />
          <div className="signal-controls">
            <button className="btn btn-ghost" onClick={() => setPlaying(!playing)}>{playing ? '⏸ Pause' : '▶ Play'}</button>
            <button className="btn btn-ghost" onClick={() => setNn(Math.min(nMax, n + 1))}>Step</button>
            <button className="btn btn-ghost" onClick={() => { setNn(1); setPlaying(false) }}>Reset</button>
            <span className="small">n = {n} · <span className="legend-dot" style={{ background: col }} />predictors · <span className="legend-dot" style={{ background: 'var(--bad)' }} />error</span>
          </div>
          <Plot title={`prediction error e_n so far (${mode})`} series={[{ x: idx.slice(0, n + 1), y: err.slice(0, n + 1), color: 'var(--bad)', stems: true }]} xLabel="n" height={150} xDomain={[0, N - 1]} />
          <MathText>{`Mean square of the errors so far: $${fmt(msSoFar)}$ · theory $${mode === 'causal' ? '\\sigma_C^2' : '\\sigma_{NC}^2'} = ${fmt(theory)}$. Noncausal errors are smaller, but consecutive ones are correlated (lecture 10, slide 13).`}</MathText>
        </Panel>

        <Panel title="Live mathematics" actions={
          <div className="toggle">{(['psd', 'filters', 'B'] as const).map((v) => <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v === 'psd' ? 'spectrum' : v === 'filters' ? 'filters h, g' : 'precision B'}</button>)}</div>}>
          {view === 'psd' && <>
            <Plot series={[{ x: om, y: sAR, color: 'var(--causal)', label: 'σ_C²/|1−H|²', width: 3 }, { x: om, y: sG, color: 'var(--noncausal)', label: 'σ_NC²/(1−G)', dashed: true, width: 2 }]}
              xTicks={piTicks} xLabel="ω" yLabel="S_X(ω)" height={230} marker={{ x: w, y: psdAR(m, w), label: `S_X(${fmt(w, 2)}) = ${fmt(psdAR(m, w))}` }} />
            <Plot series={[{ x: om, y: om.map((v) => absOneMinusH2(rho, v)), color: 'var(--causal)', label: '|1−H(ω)|²' }, { x: om, y: om.map((v) => 1 - G(rho, v)), color: 'var(--noncausal)', label: '1−G(ω)', dashed: true }]} xTicks={piTicks} xLabel="ω" height={170} marker={{ x: w, y: absOneMinusH2(rho, w) }} />
            <p className="small muted">The two spectra coincide for every ρ: the dashed curve lies exactly on the solid one. The denominators differ (second power vs first power) because the two error processes differ (white vs correlated), but they are proportional: 1−G(ω) = |1−H(ω)|²/(1+ρ²).</p>
          </>}
          {view === 'filters' && <>
            <Plot title="causal predictor h_n = ρ δ(n−1)" series={[{ x: [-3, -2, -1, 0, 1, 2, 3], y: [0, 0, 0, 0, rho, 0, 0], color: 'var(--causal)', stems: true }]} xDomain={[-3.5, 3.5]} yDomain={[-1, 1]} xLabel="n" height={170} />
            <Plot title="noncausal predictor g_n = g₁[δ(n−1)+δ(n+1)]" series={[{ x: [-3, -2, -1, 0, 1, 2, 3], y: [0, 0, gg, 0, gg, 0, 0], color: 'var(--noncausal)', stems: true }]} xDomain={[-3.5, 3.5]} yDomain={[-1, 1]} xLabel="n" height={170} />
            <Plot title="(δ−h)∗(δ−h₋ₙ): autocorrelation of the causal filter" series={[{ x: [-3, -2, -1, 0, 1, 2, 3], y: [0, 0, -rho, 1 + rho * rho, -rho, 0, 0], color: 'var(--accent)', stems: true }]} xDomain={[-3.5, 3.5]} xLabel="n" height={170} />
            <p className="small muted">g is symmetric and uses both neighbours; g₀ = 0 always (a value cannot predict itself). Normalizing the autocorrelation by its centre value 1+ρ² and flipping the sign of the off-centre taps gives g.</p>
          </>}
          {view === 'B' && <>
            <Heatmap M={B} title="Precision matrix B = R⁻¹ of Z = [Xₙ … Xₙ₊₅]ᵗ" highlight={[2, 2]} />
            <p className="small muted">Tridiagonal: B_ij = 0 whenever |i−j| &gt; 1, which is the Markov property. Interior diagonal (1+ρ²)/σ_C², off-diagonal −ρ/σ_C², and the two boundary diagonals are 1/σ_C² because the first and last samples have only one neighbour inside the block. Computed by the closed form and verified against a numerical inverse in the test suite.</p>
          </>}
        </Panel>

        <Panel title="Experiment controls">
          <Slider label={<Tex>{'\\rho'}</Tex>} value={rho} min={-0.95} max={0.95} step={0.01} onChange={setRho} format={(v) => v.toFixed(2)} />
          <Slider label={<Tex>{'\\sigma_C^2'}</Tex>} value={sc2} min={0.1} max={4} step={0.1} onChange={setSc2} format={(v) => v.toFixed(1)} />
          <Slider label={<Tex>{'\\omega'}</Tex>} value={w} min={-Math.PI} max={Math.PI} step={0.01} onChange={setW} format={(v) => v.toFixed(2)} />
          <Slider label="samples N" value={N} min={16} max={120} step={1} onChange={setN} />
          <Slider label="seed" value={seed} min={1} max={30} step={1} onChange={setSeed} />
          <div className="row" style={{ marginTop: 8 }}>
            <span className="small muted">Presets:</span>
            {[['smooth ρ=0.9', 0.9], ['ρ=0.5', 0.5], ['white ρ=0', 0], ['alternating ρ=−0.8', -0.8]].map(([l, v]) => <button key={String(l)} className="btn btn-ghost" onClick={() => setRho(v as number)}>{l}</button>)}
          </div>
          <Callout kind="simplification" title="Labelled simplifications">
            The block for B uses 6 samples so you can read every entry. The sample path is finite and starts from the stationary distribution, so causal prediction is undefined at n = 0 and noncausal at both ends. Empirical mean squares converge to the theory only as N grows; try N = 120.
          </Callout>
          <p className="small">Experiments to run: (1) set ρ = 0 and confirm g = 0, σ_NC² = σ_C², B diagonal. (2) flip the sign of ρ and watch the spectrum move from ω = 0 to ω = π while B’s off-diagonals change sign. (3) raise σ_C² and confirm the spectrum scales but g does not.</p>
        </Panel>

        <Panel title="Equations with current values">
          <div className="eq eq-row"><Tex block>{`h_n = ${fmt(rho, 2)}\\,\\delta(n-1), \\quad |1-H(\\omega)|^2 = 1 - 2(${fmt(rho, 2)})\\cos\\omega + ${fmt(rho * rho, 3)}`}</Tex><span className="live" key={`a${rho}${w}`}>= {fmt(absOneMinusH2(rho, w))} at ω={fmt(w, 2)}</span></div>
          <div className="eq eq-row"><Tex block>{`S_X(\\omega) = \\frac{\\sigma_C^2}{|1-H(\\omega)|^2} = \\frac{${fmt(sc2, 2)}}{${fmt(absOneMinusH2(rho, w))}}`}</Tex><span className="live" key={`b${rho}${sc2}${w}`}>= {fmt(psdAR(m, w))}</span></div>
          <div className="eq eq-row"><Tex block>{`\\sigma_{NC}^2 = \\frac{\\sigma_C^2}{1+\\rho^2} = \\frac{${fmt(sc2, 2)}}{${fmt(1 + rho * rho, 3)}}`}</Tex><span className="live" key={`c${rho}${sc2}`}>= {fmt(snc2(m))}</span></div>
          <div className="eq eq-row"><Tex block>{`g_1 = \\frac{\\rho}{1+\\rho^2} = \\frac{${fmt(rho, 2)}}{${fmt(1 + rho * rho, 3)}}`}</Tex><span className="live" key={`d${rho}`}>= {fmt(gg)}</span></div>
          <div className="eq eq-row"><Tex block>{`G(\\omega) = 2g_1\\cos\\omega, \\quad S_X(\\omega) = \\frac{\\sigma_{NC}^2}{1-G(\\omega)} = \\frac{${fmt(snc2(m))}}{${fmt(1 - G(rho, w))}}`}</Tex><span className="live" key={`e${rho}${sc2}${w}`}>= {fmt(psdGMRF(m, w))} ✓ same</span></div>
          <div className="eq eq-row"><Tex block>{`B_{i,i} = \\frac{1+\\rho^2}{\\sigma_C^2}, \\; B_{i,i\\pm1} = \\frac{-\\rho}{\\sigma_C^2}, \\; B_{0,0} = \\frac{1}{\\sigma_C^2}`}</Tex><span className="live" key={`f${rho}${sc2}`}>{fmt(B[2][2])}, {fmt(B[2][3])}, {fmt(B[0][0])}</span></div>
          <p className="ref">References: lecture 7 slides 11–12 (AR spectrum), lecture 10 slides 9, 13, 15 (GMRF density, error covariance, spectrum), lecture 11 slides 6–9 (matching, Example 4.1).</p>
        </Panel>
      </div>

      <h3>Concept checks</h3>
      <Choice id="ar-gmrf/lab/check1" module={MODULE} tags={['precision-matrix']} mode="check"
        question="You set $\\rho = -0.8$. What happens to the off-diagonal entries of $B$?"
        options={['They become positive, $+0.8/\\sigma_C^2$', 'They stay negative', 'They become zero', 'They become $-0.64/\\sigma_C^2$']}
        answer={0}
        explain="$B_{i,i\\pm1} = -\\rho/\\sigma_C^2$, so a negative $\\rho$ gives positive off-diagonals. Equivalently $g_1 = \\rho/(1+\\rho^2)$ is negative, so each neighbour pushes the prediction the opposite way." />
      <Choice id="ar-gmrf/lab/check2" module={MODULE} tags={['psd']} mode="check"
        question="Why is the GMRF spectrum $\\sigma_{NC}^2/(1-G(\\omega))$ a first power in the denominator while the AR spectrum $\\sigma_C^2/|1-H(\\omega)|^2$ is a second power?"
        options={['Noncausal errors are correlated with PSD $\\sigma_{NC}^2(1-G(\\omega))$, which cancels one factor of $1-G$', 'Because $G$ is real', 'Because $g_0 = 0$', 'They are different processes']}
        answer={0}
        explain="Lecture 10, slide 15: $S_E(\\omega) = \\sigma_{NC}^2(1-G(\\omega))$ for the noncausal errors, and $S_X = S_E/|1-G|^2 = \\sigma_{NC}^2/(1-G)$ since $1-G$ is real and positive. AR errors are white, so no cancellation occurs." />
    </div>
  )
}
