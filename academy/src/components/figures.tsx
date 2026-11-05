/**
 * Small inline SVG concept diagrams for the refreshers. Pure drawings, theme-aware through CSS variables,
 * Unicode labels only (no LaTeX inside SVG text).
 */
import type { ReactNode } from 'react'

const C = { text: 'var(--text)', muted: 'var(--muted)', line: 'var(--line-strong)', p: 'var(--primary)', ps: 'var(--primary-soft)', c: 'var(--causal)', nc: 'var(--noncausal)', ok: 'var(--ok)', bad: 'var(--bad)', card: 'var(--card-bg)', card2: 'var(--card-bg-2)' }

function Svg({ w = 560, h = 160, children, label }: { w?: number; h?: number; children: ReactNode; label: string }) {
  return <svg className="figure" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={C.muted} /></marker></defs>{children}</svg>
}
const Box = ({ x, y, w = 92, h = 40, t, sub, fill = C.card2 }: { x: number; y: number; w?: number; h?: number; t: string; sub?: string; fill?: string }) => (
  <g><rect x={x} y={y} width={w} height={h} rx={9} fill={fill} stroke={C.line} /><text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 4)} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.text}>{t}</text>{sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize={11} fill={C.muted}>{sub}</text>}</g>
)
const Arrow = ({ x1, y1, x2, y2, t, dy = -6 }: { x1: number; y1: number; x2: number; y2: number; t?: string; dy?: number }) => (
  <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={1.6} markerEnd="url(#arr)" />{t && <text x={(x1 + x2) / 2} y={Math.min(y1, y2) + dy} textAnchor="middle" fontSize={11} fill={C.muted}>{t}</text>}</g>
)
const Stems = ({ x, y, vals, dx = 14, scale = 28, color = C.p }: { x: number; y: number; vals: number[]; dx?: number; scale?: number; color?: string }) => (
  <g><line x1={x - 6} y1={y} x2={x + dx * vals.length} y2={y} stroke={C.line} />{vals.map((v, i) => <g key={i}><line x1={x + i * dx} y1={y} x2={x + i * dx} y2={y - v * scale} stroke={color} strokeWidth={2} /><circle cx={x + i * dx} cy={y - v * scale} r={2.6} fill={color} /></g>)}</g>
)
const T = ({ x, y, t, size = 11, color = C.muted, anchor = 'middle' as 'middle' | 'start' | 'end', bold = false }: { x: number; y: number; t: string; size?: number; color?: string; anchor?: 'middle' | 'start' | 'end'; bold?: boolean }) => <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={color} fontWeight={bold ? 600 : 400}>{t}</text>

const ring = [1, 0.7, 0.49, 0.34, 0.24, 0.17, 0.12]

export const figures: Record<string, () => ReactNode> = {
  'impulse-response': () => (
    <Svg label="a single spike enters a filter and the impulse response comes out">
      <Stems x={40} y={95} vals={[0, 0, 1, 0, 0, 0, 0]} color={C.c} /><T x={82} y={122} t="input: one spike δₙ" />
      <Arrow x1={150} y1={80} x2={200} y2={80} />
      <Box x={205} y={58} w={120} h={44} t="filter" sub="taps h₀, h₁, h₂, …" />
      <Arrow x1={330} y1={80} x2={380} y2={80} />
      <Stems x={400} y={95} vals={ring} /><T x={445} y={122} t="output: the impulse response hₙ" />
      <T x={280} y={140} t="‘Poke it once and watch the ring-out.’ The ring-out is the whole recipe." size={12} color={C.text} />
    </Svg>
  ),
  'fir-iir': () => (
    <Svg label="feed-forward FIR filter versus feedback IIR filter">
      <T x={130} y={18} t="FIR: feed-forward" bold color={C.text} size={13} />
      <Box x={20} y={40} w={54} h={32} t="xₙ" /><Arrow x1={74} y1={56} x2={110} y2={56} />
      <Box x={110} y={40} w={60} h={32} t="delay" /><Arrow x1={170} y1={56} x2={206} y2={56} />
      <Box x={206} y={40} w={60} h={32} t="delay" />
      <T x={47} y={95} t="× b₀" /><T x={140} y={95} t="× b₁" /><T x={236} y={95} t="× b₂" />
      <line x1={47} y1={72} x2={47} y2={110} stroke={C.muted} /><line x1={140} y1={72} x2={140} y2={110} stroke={C.muted} /><line x1={236} y1={72} x2={236} y2={110} stroke={C.muted} />
      <line x1={47} y1={110} x2={236} y2={110} stroke={C.muted} /><circle cx={140} cy={128} r={12} fill={C.card2} stroke={C.line} /><T x={140} y={132} t="Σ" size={13} color={C.text} />
      <line x1={140} y1={110} x2={140} y2={116} stroke={C.muted} /><Arrow x1={152} y1={128} x2={200} y2={128} /><T x={214} y={132} t="yₙ" color={C.text} size={13} />
      <T x={140} y={152} t="output forgets the input after P steps" />
      <T x={430} y={18} t="IIR: feedback" bold color={C.text} size={13} />
      <Box x={320} y={40} w={54} h={32} t="eₙ" fill={C.card} /><Arrow x1={374} y1={56} x2={404} y2={56} />
      <circle cx={418} cy={56} r={12} fill={C.card2} stroke={C.line} /><T x={418} y={60} t="+" size={14} color={C.text} />
      <Arrow x1={430} y1={56} x2={490} y2={56} /><T x={505} y={60} t="xₙ" color={C.text} size={13} />
      <line x1={470} y1={56} x2={470} y2={100} stroke={C.muted} />
      <Box x={420} y={92} w={100} h={30} t="delay, × ρ" />
      <line x1={420} y1={107} x2={418} y2={107} stroke={C.muted} /><Arrow x1={418} y1={107} x2={418} y2={70} />
      <T x={420} y={140} t="xₙ = ρ·xₙ₋₁ + eₙ" color={C.text} /><T x={420} y={154} t="one kick echoes forever, fading if |ρ| < 1" size={10.5} />
    </Svg>
  ),
  lti: () => (
    <Svg label="shifting the input shifts the output by the same amount">
      <Stems x={40} y={60} vals={[0, 1, 0, 0, 0, 0]} color={C.c} /><Arrow x1={130} y1={48} x2={170} y2={48} /><Box x={172} y={30} w={60} h={34} t="h" /><Arrow x1={232} y1={48} x2={272} y2={48} /><Stems x={290} y={60} vals={[0, 1, 0.7, 0.49, 0.34, 0.24]} />
      <Stems x={40} y={130} vals={[0, 0, 0, 1, 0, 0]} color={C.c} /><Arrow x1={130} y1={118} x2={170} y2={118} /><Box x={172} y={100} w={60} h={34} t="h" /><Arrow x1={232} y1={118} x2={272} y2={118} /><Stems x={290} y={130} vals={[0, 0, 0, 1, 0.7, 0.49]} />
      <T x={470} y={52} t="same shape," color={C.text} size={12} /><T x={470} y={122} t="just shifted" color={C.text} size={12} />
      <T x={280} y={152} t="Linear + shift-invariant ⇒ the output is x convolved with h, nothing else is possible." size={11.5} />
    </Svg>
  ),
  'freq-response': () => {
    const pts = (f: number, amp: number, x0: number) => Array.from({ length: 60 }, (_, i) => `${x0 + i * 1.6},${50 - amp * 18 * Math.sin(f * i * 0.35)}`).join(' ')
    const curve = Array.from({ length: 80 }, (_, i) => { const w = (i / 79) * Math.PI; return `${330 + i * 2.6},${130 - 55 * Math.abs(Math.cos(w / 2))}` }).join(' ')
    return (
      <Svg label="a pure tone goes through a filter and comes out scaled; the gain versus frequency is the frequency response">
        <polyline points={pts(1, 1, 20)} fill="none" stroke={C.c} strokeWidth={1.8} /><T x={68} y={85} t="slow tone in" />
        <polyline points={pts(1, 0.9, 20).replace(/,[0-9.]+/g, (m) => `,${parseFloat(m.slice(1)) + 70}`)} fill="none" stroke={C.c} strokeWidth={1.8} opacity={0.0} />
        <Arrow x1={120} y1={50} x2={150} y2={50} /><Box x={152} y={32} w={62} h={36} t="filter" /><Arrow x1={214} y1={50} x2={244} y2={50} />
        <polyline points={pts(1, 0.85, 248)} fill="none" stroke={C.p} strokeWidth={1.8} /><T x={296} y={85} t="almost unchanged" />
        <polyline points={pts(4, 1, 20).replace(/,([0-9.]+)/g, (_m, v) => `,${parseFloat(v) + 70}`)} fill="none" stroke={C.c} strokeWidth={1.8} /><T x={68} y={152} t="fast zigzag in" />
        <Arrow x1={120} y1={120} x2={150} y2={120} /><Box x={152} y={102} w={62} h={36} t="filter" /><Arrow x1={214} y1={120} x2={244} y2={120} />
        <polyline points={pts(4, 0.15, 248).replace(/,([0-9.]+)/g, (_m, v) => `,${parseFloat(v) + 70}`)} fill="none" stroke={C.p} strokeWidth={1.8} /><T x={296} y={152} t="squashed" />
        <line x1={330} y1={130} x2={540} y2={130} stroke={C.line} /><line x1={330} y1={130} x2={330} y2={60} stroke={C.line} />
        <polyline points={curve} fill="none" stroke={C.nc} strokeWidth={2.2} />
        <T x={330} y={145} t="ω = 0" /><T x={536} y={145} t="π" /><T x={440} y={56} t="|H(ω)|: the equalizer curve" color={C.text} size={12} />
      </Svg>
    )
  },
  'whiten-synth': () => (
    <Svg label="whitening filter turns the correlated process into white noise and the synthesis filter turns white noise back into the process">
      <T x={60} y={20} t="analysis / whitening" bold color={C.text} size={12} anchor="start" />
      <Box x={20} y={34} w={70} h={36} t="Xₙ" sub="coloured" fill={C.card} /><Arrow x1={90} y1={52} x2={130} y2={52} />
      <Box x={132} y={30} w={124} h={44} t="δₙ − hₙ  (FIR)" sub="subtract the prediction" /><Arrow x1={256} y1={52} x2={296} y2={52} />
      <Box x={298} y={34} w={70} h={36} t="Eₙ" sub="white" fill={C.card} />
      <Stems x={400} y={62} vals={[0.3, -0.5, 0.8, -0.2, 0.4, -0.9, 0.5]} scale={16} color={C.muted} /><T x={445} y={92} t="flat spectrum σ²" />
      <T x={60} y={104} t="synthesis / generation" bold color={C.text} size={12} anchor="start" />
      <Box x={20} y={118} w={70} h={36} t="Eₙ" sub="white" fill={C.card} /><Arrow x1={90} y1={136} x2={130} y2={136} />
      <Box x={132} y={114} w={124} h={44} t="1 / (1 − H)  (IIR)" sub="feed back the past" /><Arrow x1={256} y1={136} x2={296} y2={136} />
      <Box x={298} y={118} w={70} h={36} t="Xₙ" sub="coloured" fill={C.card} />
      <T x={445} y={132} t="the two filters are inverses:" color={C.text} size={12} /><T x={445} y={148} t="(1 − H)·1/(1 − H) = 1" color={C.text} size={12} />
    </Svg>
  ),
  'blur-inverse': () => (
    <Svg label="blur removes fine detail; dividing by the blur response amplifies the noise at high frequencies">
      <Box x={16} y={40} w={70} h={40} t="sharp x" fill={C.card} /><Arrow x1={86} y1={60} x2={120} y2={60} />
      <Box x={122} y={38} w={88} h={44} t="blur a" sub="low-pass" /><Arrow x1={210} y1={60} x2={244} y2={60} />
      <circle cx={258} cy={60} r={12} fill={C.card2} stroke={C.line} /><T x={258} y={64} t="+" size={14} color={C.text} /><T x={258} y={34} t="noise w" color={C.bad} />
      <Arrow x1={270} y1={60} x2={304} y2={60} /><Box x={306} y={40} w={70} h={40} t="y" sub="blurry+noisy" fill={C.card} />
      <Arrow x1={376} y1={60} x2={410} y2={60} /><Box x={412} y={38} w={88} h={44} t="1 / a(ω)" sub="inverse" fill={C.card2} /><Arrow x1={500} y1={60} x2={534} y2={60} /><T x={547} y={64} t="x̂" size={13} color={C.text} />
      <line x1={120} y1={140} x2={300} y2={140} stroke={C.line} /><polyline points={Array.from({ length: 50 }, (_, i) => `${120 + i * 3.6},${140 - 36 * Math.exp(-i / 14)}`).join(' ')} fill="none" stroke={C.p} strokeWidth={2} /><T x={210} y={154} t="|a(ω)| small at high ω" />
      <line x1={340} y1={140} x2={520} y2={140} stroke={C.line} /><polyline points={Array.from({ length: 50 }, (_, i) => `${340 + i * 3.6},${140 - 4 * Math.exp(i / 14)}`).join(' ')} fill="none" stroke={C.bad} strokeWidth={2} /><T x={430} y={154} t="1/|a(ω)| huge there: noise × gain" />
    </Svg>
  ),
  toeplitz: () => {
    const N = 7
    const cell = 18
    const col = (d: number) => (d === 0 ? C.p : Math.abs(d) === 1 ? C.ps : 'transparent')
    return (
      <Svg label="a Toeplitz matrix has constant diagonals; a circulant matrix also wraps around" h={170}>
        {Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => <rect key={`${i}${j}`} x={40 + j * cell} y={20 + i * cell} width={cell - 1} height={cell - 1} fill={col(i - j)} stroke={C.line} />))}
        <T x={40 + (N * cell) / 2} y={158} t="Toeplitz: each row is the same stencil, slid one step" />
        {Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => { const d = ((i - j) % N + N) % N; const f = d === 0 ? C.p : d === 1 || d === N - 1 ? C.ps : 'transparent'; return <rect key={`${i}${j}`} x={330 + j * cell} y={20 + i * cell} width={cell - 1} height={cell - 1} fill={f} stroke={C.line} /> }))}
        <T x={330 + (N * cell) / 2} y={158} t="Circulant: the stencil wraps around (DFT diagonalizes it)" />
        <Arrow x1={200} y1={80} x2={300} y2={80} t="wrap edges" />
      </Svg>
    )
  },
  'graph-mrf': () => {
    const pts: [number, number][] = []
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) pts.push([60 + j * 60, 30 + i * 36])
    const idx = (i: number, j: number) => i * 6 + j
    const edges: [number, number][] = []
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { if (j < 5) edges.push([idx(i, j), idx(i, j + 1)]); if (i < 3) edges.push([idx(i, j), idx(i + 1, j)]) }
    const s = idx(1, 2)
    const nb = new Set([idx(0, 2), idx(2, 2), idx(1, 1), idx(1, 3)])
    return (
      <Svg label="pixels as vertices of a graph, neighbours joined by edges, one pixel highlighted with its four neighbours">
        {edges.map(([a, b], k) => <line key={k} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={(a === s && nb.has(b)) || (b === s && nb.has(a)) ? C.p : C.line} strokeWidth={(a === s && nb.has(b)) || (b === s && nb.has(a)) ? 3 : 1.4} />)}
        {pts.map(([x, y], k) => <circle key={k} cx={x} cy={y} r={k === s ? 9 : nb.has(k) ? 7 : 5} fill={k === s ? C.p : nb.has(k) ? C.ps : C.card2} stroke={C.line} />)}
        <T x={430} y={60} t="vertex = pixel s" color={C.text} size={12} anchor="start" /><T x={430} y={80} t="edge = pairwise clique {s, r}" color={C.text} size={12} anchor="start" /><T x={430} y={100} t="∂s = the 4 blue neighbours" color={C.text} size={12} anchor="start" />
        <T x={200} y={157} t="Markov: given the blue neighbours, the grey pixels tell X_s nothing new." />
      </Svg>
    )
  },
  bowl: () => (
    <Svg label="a convex function is a single valley; a nonconvex one has several dips">
      <polyline points={Array.from({ length: 60 }, (_, i) => { const x = -2 + (4 * i) / 59; return `${40 + i * 3.6},${125 - 22 * (x * x)}` }).join(' ')} fill="none" stroke={C.p} strokeWidth={2.4} />
      <circle cx={148} cy={118} r={6} fill={C.c} /><T x={148} y={150} t="convex: wherever you drop the ball it ends here" />
      <polyline points={Array.from({ length: 60 }, (_, i) => { const x = -2 + (4 * i) / 59; return `${320 + i * 3.6},${110 - 18 * Math.cos(2.2 * x) - 8 * x * x + 14}` }).join(' ')} fill="none" stroke={C.nc} strokeWidth={2.4} />
      <circle cx={356} cy={100} r={6} fill={C.c} /><circle cx={428} cy={113} r={6} fill={C.c} opacity={0.5} />
      <T x={428} y={150} t="nonconvex: the ball can get stuck in a side dip" />
    </Svg>
  ),
  springs: () => (
    <Svg label="one pixel connected to three neighbours by springs; the most probable value balances the forces">
      {[[80, 40], [80, 130], [330, 85]].map(([x, y], k) => <g key={k}><line x1={x} y1={y} x2={200} y2={85} stroke={C.nc} strokeWidth={2} strokeDasharray="6 4" /><circle cx={x} cy={y} r={9} fill={C.card2} stroke={C.line} /><T x={x} y={y - 14} t={`xᵣ${k + 1}`} color={C.text} /></g>)}
      <circle cx={200} cy={85} r={12} fill={C.p} /><T x={200} y={112} t="x̂ₛ: springs balance" color={C.text} size={12} />
      <T x={430} y={60} t="energy ρ(xₛ − xᵣ) per spring" color={C.text} size={12} anchor="start" /><T x={430} y={82} t="force ρ′ = influence function" color={C.text} size={12} anchor="start" /><T x={430} y={104} t="quadratic: stiff springs, edges smoothed" anchor="start" /><T x={430} y={122} t="|Δ| / Huber: force saturates, edges survive" anchor="start" />
    </Svg>
  ),
  contraction: () => (
    <Svg label="a contraction shrinks every distance toward one fixed point; a reflection keeps the distance and oscillates">
      {[[60, 40], [120, 130], [40, 110], [150, 50]].map(([x, y], k) => <g key={k}><circle cx={x} cy={y} r={5} fill={C.c} /><Arrow x1={x} y1={y} x2={100 + (x - 100) * 0.4} y2={85 + (y - 85) * 0.4} /></g>)}
      <circle cx={100} cy={85} r={7} fill={C.p} /><T x={100} y={155} t="contraction: everything piles up on x*" />
      <line x1={330} y1={30} x2={330} y2={140} stroke={C.line} strokeDasharray="4 4" />
      <circle cx={280} cy={70} r={6} fill={C.c} /><circle cx={380} cy={70} r={6} fill={C.c} /><Arrow x1={288} y1={66} x2={372} y2={66} /><Arrow x1={372} y1={76} x2={288} y2={76} />
      <T x={330} y={155} t="reflection: nonexpansive, swaps forever (Mann averaging stops it)" />
    </Svg>
  ),
  kink: () => (
    <Svg label="the absolute value is three functions glued at a kink">
      <polyline points="60,30 200,120 340,30" fill="none" stroke={C.nc} strokeWidth={2.6} />
      <T x={110} y={95} t="x < 0: slope −1" color={C.text} /><T x={290} y={95} t="x > 0: slope +1" color={C.text} /><circle cx={200} cy={120} r={6} fill={C.c} /><T x={200} y={145} t="x = 0: the kink, no single slope" color={C.text} />
      <T x={450} y={60} t="solve each piece," anchor="start" color={C.text} size={12} /><T x={450} y={80} t="keep the consistent one," anchor="start" color={C.text} size={12} /><T x={450} y={100} t="else the answer is the kink" anchor="start" color={C.text} size={12} />
    </Svg>
  ),
}

export function Figure({ id }: { id: string }) {
  const F = figures[id]
  return F ? <div className="figure-wrap">{F()}</div> : null
}
