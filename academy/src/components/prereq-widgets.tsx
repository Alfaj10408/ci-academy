/**
 * Small interactive pictures for the prerequisite refreshers. Every widget is self-contained,
 * uses plain Unicode in SVG labels (no LaTeX outside MathText) and recomputes on every change.
 */
import { useState, type ReactNode } from 'react'
import { Plot, Heatmap, piTicks } from './Plot'
import { Slider } from './ui'
import { MathText, fmt } from './Tex'
import { generateAR1, autocov, psdAR, omegaAxis } from '../math/argmrf'
import { circulant, symEig } from '../math/mapopt'
import { huber, huberD } from '../math/surrogate'

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const lin = (lo: number, hi: number, n: number) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1))

function Seg({ options, value, onChange }: { options: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <div className="seg">
      {options.map((o, i) => <button key={o} className={i === value ? 'active' : ''} onClick={() => onChange(i)}>{o}</button>)}
    </div>
  )
}

function Widget({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="widget">
      {children}
      {note && <MathText className="small muted">{note}</MathText>}
    </div>
  )
}

/** sequences-deltas: a filter is a few bricks at chosen lags; the whitening filter is δ minus those bricks. */
export function DeltaStack() {
  const [h1, setH1] = useState(0.8)
  const [h2, setH2] = useState(-0.3)
  const [sym, setSym] = useState(0)
  const n = range(-4, 4)
  const filt = n.map((k) => (sym ? (Math.abs(k) === 1 ? h1 : Math.abs(k) === 2 ? h2 : 0) : k === 1 ? h1 : k === 2 ? h2 : 0))
  const white = n.map((k, i) => (k === 0 ? 1 : 0) - filt[i])
  return (
    <Widget note={sym ? 'Symmetric bricks on both sides, nothing at lag 0: that is the shape of a GMRF predictor $g_n$. Then $\\delta_n - g_n$ has a 1 in the middle and $-g_k$ on both sides.' : 'Bricks only at positive lags: a causal AR filter $h_n$ looks at the past. The whitening filter $\\delta_n - h_n$ keeps the sample and subtracts the prediction.'}>
      <Seg options={['Causal AR filter hₙ', 'Symmetric GMRF predictor gₙ']} value={sym} onChange={setSym} />
      <Slider label="tap at lag 1" value={h1} min={-1} max={1} step={0.05} onChange={setH1} />
      <Slider label="tap at lag 2" value={h2} min={-1} max={1} step={0.05} onChange={setH2} />
      <div className="row2">
        <Plot series={[{ x: n, y: filt, color: 'var(--causal)', stems: true }]} height={150} xDomain={[-4.5, 4.5]} yDomain={[-1.2, 1.2]} xLabel="lag n" title={sym ? 'predictor gₙ' : 'prediction filter hₙ'} />
        <Plot series={[{ x: n, y: white, color: 'var(--accent)', stems: true }]} height={150} xDomain={[-4.5, 4.5]} yDomain={[-1.2, 1.2]} xLabel="lag n" title={sym ? 'δₙ − gₙ' : 'whitening filter δₙ − hₙ'} />
      </div>
    </Widget>
  )
}

/** convolution-lsi: slide a three-tap stencil over a bump; optionally reverse it (the transpose). */
export function ConvolveStencil() {
  const x = [0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0]
  const n = range(0, x.length - 1)
  const [am, setAm] = useState(0.5)
  const [a0, setA0] = useState(1)
  const [ap, setAp] = useState(-0.5)
  const [pos, setPos] = useState(5)
  const [rev, setRev] = useState(0)
  const taps: Record<number, number> = rev ? { [-1]: ap, 0: a0, 1: am } : { [-1]: am, 0: a0, 1: ap }
  const y = n.map((i) => [-1, 0, 1].reduce((s, k) => s + taps[k] * (x[i - k] ?? 0), 0))
  const terms = [-1, 0, 1].map((k) => `${fmt(taps[k], 2)}\\cdot x_{${pos - k}}`).join(' + ')
  return (
    <Widget note={rev ? 'Transpose = the same stencil read backwards: $A^t y = a_{-s} * y_s$. For a symmetric stencil nothing changes, which is why symmetric blurs are easy.' : 'At each output position the stencil multiplies what it sees by its weights and adds: $y_n = \\sum_k a_k x_{n-k}$. Shift the input and the output shifts the same way: shift invariance.'}>
      <Seg options={['Apply A (stencil a)', 'Apply Aᵗ (reversed stencil)']} value={rev} onChange={setRev} />
      <Slider label="a₋₁" value={am} min={-1} max={1} step={0.1} onChange={setAm} />
      <Slider label="a₀" value={a0} min={-1} max={2} step={0.1} onChange={setA0} />
      <Slider label="a₊₁" value={ap} min={-1} max={1} step={0.1} onChange={setAp} />
      <Slider label="output position n" value={pos} min={1} max={x.length - 2} step={1} onChange={setPos} />
      <div className="row2">
        <Plot series={[{ x: n, y: x, color: 'var(--muted)', stems: true }]} height={150} xDomain={[-0.5, x.length - 0.5]} yDomain={[-1.5, 3.5]} xLabel="n" title="input xₙ" marker={{ x: pos, y: x[pos], color: 'var(--accent)' }} />
        <Plot series={[{ x: n, y, color: 'var(--accent)', stems: true }]} height={150} xDomain={[-0.5, x.length - 0.5]} yDomain={[-1.5, 3.5]} xLabel="n" title={rev ? 'output (Aᵗx)ₙ' : 'output yₙ = (a ∗ x)ₙ'} marker={{ x: pos, y: y[pos], color: 'var(--causal)', label: fmt(y[pos], 2) }} />
      </div>
      <MathText>{`$y_{${pos}} = ${terms} = ${fmt(y[pos], 2)}$`}</MathText>
    </Widget>
  )
}

/** stationarity / spectrum-reading: one ρ slider, a sample path, and either R(n) or S(ω). */
export function ArPicture({ mode }: { mode: 'autocov' | 'spectrum' }) {
  const [rho, setRho] = useState(0.8)
  const m = { rho, sc2: 1 }
  const N = 48
  const { x } = generateAR1(m, N, 3)
  const lags = range(-8, 8)
  const R = lags.map((k) => autocov(m, k))
  const w = omegaAxis(201)
  const S = w.map((v) => psdAR(m, v))
  const s0 = psdAR(m, 0)
  const spi = psdAR(m, Math.PI)
  return (
    <Widget note={mode === 'autocov' ? `Variance $R(0) = \\sigma_C^2/(1-\\rho^2) = ${fmt(R[8], 2)}$. Positive $\\rho$: neighbours agree, $R$ decays slowly, the path is smooth. Negative $\\rho$: $R$ alternates in sign and so does the path. Either way the curve depends only on the lag, which is what stationary means.` : `$S_X(0) = ${fmt(s0, 2)}$ and $S_X(\\pi) = ${fmt(spi, 2)}$: the spectrum is ${s0 >= spi ? 'largest at $\\omega = 0$, a low-pass process whose path drifts smoothly' : 'largest at $\\omega = \\pi$, a high-pass process whose path zigzags'}. The average height of the curve is the variance.`}>
      <Slider label="ρ" value={rho} min={-0.95} max={0.95} step={0.05} onChange={setRho} />
      <div className="row2">
        <Plot series={[{ x: range(0, N - 1), y: x, color: 'var(--accent)' }]} height={150} xLabel="n" title="one sample path of AR(1)" />
        {mode === 'autocov'
          ? <Plot series={[{ x: lags, y: R, color: 'var(--noncausal)', stems: true }]} height={150} xDomain={[-8.5, 8.5]} xLabel="lag n" title="autocovariance R(n)" />
          : <Plot series={[{ x: w, y: S, color: 'var(--noncausal)' }]} height={150} xDomain={[-Math.PI, Math.PI]} xTicks={piTicks} xLabel="ω" title="power spectral density S(ω)" marker={{ x: s0 >= spi ? 0 : Math.PI, y: Math.max(s0, spi), color: 'var(--causal)', label: 'peak' }} />}
      </div>
    </Widget>
  )
}

/** toeplitz-circulant: a symmetric 3-tap circulant matrix, its numeric eigenvalues and the DFT of its first column. */
export function CirculantDft() {
  const [a0, setA0] = useState(1)
  const [a1, setA1] = useState(0.5)
  const N = 8
  const M = circulant(N, { 0: a0, 1: a1, [-1]: a1 })
  const numeric = [...symEig(M).values].sort((p, q) => p - q)
  const wk = range(0, N - 1).map((k) => { const v = (2 * Math.PI * k) / N; return v > Math.PI ? v - 2 * Math.PI : v })
  const dft = wk.map((v) => a0 + 2 * a1 * Math.cos(v))
  const w = omegaAxis(201)
  const curve = w.map((v) => a0 + 2 * a1 * Math.cos(v))
  const sortedDft = [...dft].sort((p, q) => p - q)
  return (
    <Widget note={`Numeric eigenvalues (Jacobi): ${numeric.map((v) => fmt(v, 2)).join(', ')}. DFT of the first column at $\\omega_k = 2\\pi k/8$: ${sortedDft.map((v) => fmt(v, 2)).join(', ')}. Same numbers. The largest and smallest eigenvalue are the top and bottom of the curve $a(\\omega) = a_0 + 2a_1\\cos\\omega$; with more pixels the dots fill the whole curve.`}>
      <Slider label="a₀ (centre tap)" value={a0} min={0} max={2} step={0.1} onChange={setA0} />
      <Slider label="a₁ (side taps)" value={a1} min={-1} max={1} step={0.1} onChange={setA1} />
      <div className="row2">
        <Heatmap M={M} size={220} title="8×8 circulant matrix: each row is the stencil, shifted and wrapped" />
        <Plot series={[{ x: w, y: curve, color: 'var(--accent)' }, { x: wk, y: dft, color: 'var(--causal)', stems: true }]} height={200} xDomain={[-Math.PI, Math.PI]} xTicks={piTicks} xLabel="ω" title="frequency response a(ω) and the 8 eigenvalues" />
      </div>
    </Widget>
  )
}

/** neighborhood-cliques / dsft-2d / mrf-markov: a 6×6 grid, click a pixel, see its neighbours, the AR half, and the zero pattern of B. */
export function NeighborGrid({ view }: { view: 'graph' | 'window' | 'precision' }) {
  const N = 6
  const [P, setP] = useState(0) // index: 0 → P=1, 1 → P=2
  const [sel, setSel] = useState(2 * N + 2)
  const [causal, setCausal] = useState(0)
  const p = P + 1
  const rc = (s: number) => [Math.floor(s / N), s % N] as const
  const isNb = (s: number, r: number) => { if (s === r) return false; const [a, b] = rc(s); const [c, d] = rc(r); return Math.abs(a - c) <= p && Math.abs(b - d) <= p }
  const isPast = (s: number, r: number) => isNb(s, r) && r < s
  const cells = range(0, N * N - 1)
  const nbs = cells.filter((r) => isNb(sel, r))
  const past = cells.filter((r) => isPast(sel, r))
  const edges = cells.reduce((acc, s) => acc + cells.filter((r) => r > s && isNb(s, r)).length, 0)
  const cell = 30
  const [sr, sc] = rc(sel)
  const showCausal = view === 'window' && causal === 1
  const grid = (
    <svg viewBox={`0 0 ${N * cell} ${N * cell}`} width={N * cell} className="pixgrid" role="img" aria-label="pixel grid">
      {cells.map((s) => {
        const [i, j] = rc(s)
        const nb = isNb(sel, s)
        const pa = isPast(sel, s)
        const fill = s === sel ? 'var(--accent)' : showCausal ? (pa ? 'var(--causal)' : nb ? 'var(--panel-2)' : 'var(--panel)') : nb ? 'var(--accent-2)' : 'var(--panel)'
        return (
          <g key={s} onClick={() => setSel(s)} style={{ cursor: 'pointer' }}>
            <rect x={j * cell} y={i * cell} width={cell} height={cell} fill={fill} stroke="var(--line)" opacity={nb && !showCausal ? 0.5 : 1} />
            {view !== 'precision' && <text x={j * cell + cell / 2} y={i * cell + cell / 2 + 4} textAnchor="middle" fontSize={10} fill="var(--text)">{s}</text>}
          </g>
        )
      })}
      {view === 'graph' && nbs.map((r) => { const [i, j] = rc(r); return <line key={r} x1={sc * cell + cell / 2} y1={sr * cell + cell / 2} x2={j * cell + cell / 2} y2={i * cell + cell / 2} stroke="var(--accent)" strokeWidth={2} /> })}
    </svg>
  )
  const Bpattern = (
    <svg viewBox={`0 0 ${N * N * 6} ${N * N * 6}`} width={216} className="pixgrid" role="img" aria-label="zero pattern of the precision matrix">
      {cells.map((s) => cells.map((r) => {
        const nz = s === r || isNb(s, r)
        const inRow = s === sel
        return <rect key={`${s}-${r}`} x={r * 6} y={s * 6} width={6} height={6} fill={nz ? (inRow ? 'var(--accent)' : 'var(--noncausal)') : inRow ? 'var(--panel-2)' : 'var(--panel)'} stroke="var(--panel)" strokeWidth={0.4} />
      }))}
    </svg>
  )
  const note = view === 'graph'
    ? `Pixel ${sel} has ${nbs.length} neighbours (interior pixels have $(2P+1)^2-1 = ${(2 * p + 1) ** 2 - 1}$). Every line is one pairwise clique, counted once; the whole grid has ${edges} cliques. Click another pixel: if it was a neighbour of ${sel}, then ${sel} is now one of its neighbours. That is the symmetry rule.`
    : view === 'window'
      ? `The GMRF window around pixel ${sel} holds ${nbs.length} pixels. In raster order (row by row, left to right) only ${past.length} of them come before it, so a causal 2-D AR model of the same order may use only those.`
      : `Rows and columns are pixels in raster order. A coloured entry means $B_{s,r} \\ne 0$: the diagonal plus the neighbours. Row ${sel} (highlighted) has $1 + ${nbs.length}$ nonzeros, and the whole matrix is banded with the bands set by the neighbourhood. The covariance $R = B^{-1}$ would be completely filled in.`
  return (
    <Widget note={note}>
      <Seg options={['order P = 1', 'order P = 2']} value={P} onChange={setP} />
      {view === 'window' && <Seg options={['GMRF: whole window', 'AR: causal half (raster past)']} value={causal} onChange={setCausal} />}
      <div className="row2">
        {grid}
        {view === 'precision' ? Bpattern : <div className="small muted">Click any pixel to select it.</div>}
      </div>
    </Widget>
  )
}

/** gibbs-energy: three neighbours pull on one pixel through springs with a chosen potential. */
export function ForceBalance() {
  const [pot, setPot] = useState(0)
  const [T, setT] = useState(0.5)
  const [x1, setX1] = useState(-1)
  const [x2, setX2] = useState(0.5)
  const [x3, setX3] = useState(2)
  const nb = [x1, x2, x3]
  const rho = (d: number) => (pot === 0 ? (d * d) / 2 : pot === 1 ? Math.abs(d) : huber(T, d))
  const force = (d: number) => (pot === 0 ? d : pot === 1 ? Math.sign(d) : huberD(T, d))
  const xs = lin(-4, 4, 321)
  const u = xs.map((x) => nb.reduce((s, r) => s + rho(x - r), 0))
  let best = 0
  u.forEach((v, i) => { if (v < u[best]) best = i })
  const xhat = xs[best]
  const mean = (x1 + x2 + x3) / 3
  const median = [...nb].sort((a, b) => a - b)[1]
  const net = nb.reduce((s, r) => s + force(xhat - r), 0)
  return (
    <Widget note={pot === 0 ? `Quadratic springs: force grows with stretch, so the balance point is the mean ${fmt(mean, 2)}. A far-away neighbour pulls hard, which is how a GMRF smooths an edge.` : pot === 1 ? `Absolute-value springs: every neighbour pulls with force exactly 1, whatever the distance, so the balance point is the median ${fmt(median, 2)} and the far neighbour cannot drag the pixel across an edge.` : `Huber springs: quadratic for stretch below T = ${fmt(T, 2)}, then constant force T. Minimiser ${fmt(xhat, 2)} sits between the mean ${fmt(mean, 2)} and the median ${fmt(median, 2)}.`}>
      <Seg options={['quadratic Δ²/2', 'absolute |Δ|', 'Huber']} value={pot} onChange={setPot} />
      {pot === 2 && <Slider label="T" value={T} min={0.1} max={2} step={0.1} onChange={setT} />}
      <Slider label="neighbour x₁" value={x1} min={-3} max={3} step={0.1} onChange={setX1} />
      <Slider label="neighbour x₂" value={x2} min={-3} max={3} step={0.1} onChange={setX2} />
      <Slider label="neighbour x₃" value={x3} min={-3} max={3} step={0.1} onChange={setX3} />
      <Plot series={[{ x: xs, y: u, color: 'var(--accent)' }]} height={190} xDomain={[-4, 4]} yDomain={[0, Math.max(...u)]} xLabel="candidate value xₛ" title="energy of the three springs, u(xₛ) = Σ ρ(xₛ − xᵣ)"
        marker={{ x: xhat, y: u[best], color: 'var(--causal)', label: `min at ${fmt(xhat, 2)}` }}
        overlay={(sx, sy) => nb.map((r, i) => <line key={i} x1={sx(r)} x2={sx(r)} y1={sy(0)} y2={sy(Math.max(...u))} stroke="var(--noncausal)" strokeDasharray="4 3" />)} />
      <MathText>{`Net force at the minimiser: $\\sum_r \\rho'(\\hat x_s - x_r) = ${fmt(net, 2)}$ (zero up to the grid).`}</MathText>
    </Widget>
  )
}

/** sketching: the five shapes that come up in exam sketches. */
export function SketchGallery() {
  const [tab, setTab] = useState(0)
  const [T, setT] = useState(1)
  const [xp, setXp] = useState(1)
  const [lam, setLam] = useState(0.8)
  const xs = lin(-3, 3, 241)
  const xq = xp === 0 ? 0.1 : xp
  let body: ReactNode
  if (tab === 0) body = (
    <Plot series={[{ x: xs, y: xs.map((v) => (v * v) / 2), color: 'var(--muted)', dashed: true }, { x: xs, y: xs.map(Math.abs), color: 'var(--noncausal)' }, { x: xs, y: xs.map((v) => huber(T, v)), color: 'var(--accent)', width: 2.5 }]} height={200} xDomain={[-3, 3]} yDomain={[0, 4]} xLabel="Δ" title="potentials: Δ²/2 (dashed), |Δ| (purple), Huber ρ_T (blue)" marker={{ x: T, y: huber(T, T), color: 'var(--causal)', label: 'T' }} />
  )
  else if (tab === 1) body = (
    <Plot series={[{ x: xs, y: xs, color: 'var(--muted)', dashed: true }, { x: xs, y: xs.map(Math.sign), color: 'var(--noncausal)' }, { x: xs, y: xs.map((v) => huberD(T, v)), color: 'var(--accent)', width: 2.5 }]} height={200} xDomain={[-3, 3]} yDomain={[-2.2, 2.2]} xLabel="Δ" title="influence functions ρ′: line (dashed), sign (purple), clip to ±T (blue)" marker={{ x: T, y: T, color: 'var(--causal)', label: 'T' }} />
  )
  else if (tab === 2) body = (
    <Plot series={[{ x: xs, y: xs.map(Math.abs), color: 'var(--noncausal)' }, { x: xs, y: xs.map((v) => (v * v) / (2 * Math.abs(xq)) + Math.abs(xq) / 2), color: 'var(--accent)', width: 2.5 }]} height={200} xDomain={[-3, 3]} yDomain={[0, 4]} xLabel="x" title="|x| and its quadratic surrogate at x′: touches at ±x′, above elsewhere" marker={{ x: xq, y: Math.abs(xq), color: 'var(--causal)', label: 'x′' }} />
  )
  else body = (
    <Plot series={[{ x: xs, y: xs, color: 'var(--muted)', dashed: true }, { x: xs, y: xs.map((v) => Math.sign(v) * Math.max(Math.abs(v) - lam, 0)), color: 'var(--accent)', width: 2.5 }]} height={200} xDomain={[-3, 3]} yDomain={[-3, 3]} xLabel="y" title="shrinkage S_λ(y): flat on [−λ, λ], slope 1 outside" marker={{ x: lam, y: 0, color: 'var(--causal)', label: 'λ' }} />
  )
  return (
    <Widget note={['Label the kink of $|\\Delta|$ at 0 and the join points $\\pm T$ of the Huber function, where the parabola turns into a line with the same slope.', 'The influence function is the derivative: a bounded influence (sign, clip) is what lets edges survive. Mark $\\pm T$ on both axes.', 'The surrogate $x^2/(2|x\'|) + |x\'|/2$ touches $|x|$ at $\\pm x\'$ and lies above it everywhere else; its minimiser is at 0, so one MM step from $x\'$ lands at 0 for the plain $|x|$ problem.', 'The dead zone $[-\\lambda,\\lambda]$ is where the answer is exactly zero; outside it the identity line is pushed toward zero by $\\lambda$.'][tab]}>
      <Seg options={['potentials', 'influence functions', 'surrogate of |x|', 'shrinkage']} value={tab} onChange={setTab} />
      {(tab === 0 || tab === 1) && <Slider label="T" value={T} min={0.2} max={2.5} step={0.1} onChange={setT} />}
      {tab === 2 && <Slider label="x′" value={xp} min={-2} max={2} step={0.1} onChange={setXp} />}
      {tab === 3 && <Slider label="λ" value={lam} min={0} max={2} step={0.1} onChange={setLam} />}
      {body}
    </Widget>
  )
}

export const widgets: Record<string, () => ReactNode> = {
  'delta-stack': () => <DeltaStack />,
  'convolve-stencil': () => <ConvolveStencil />,
  'ar-autocov': () => <ArPicture mode="autocov" />,
  'ar-spectrum': () => <ArPicture mode="spectrum" />,
  'circulant-dft': () => <CirculantDft />,
  'neighbor-graph': () => <NeighborGrid view="graph" />,
  'neighbor-window': () => <NeighborGrid view="window" />,
  'neighbor-precision': () => <NeighborGrid view="precision" />,
  'force-balance': () => <ForceBalance />,
  'sketch-gallery': () => <SketchGallery />,
}
