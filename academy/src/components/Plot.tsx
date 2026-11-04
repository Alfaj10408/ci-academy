import { type ReactNode } from 'react'

export interface Series {
  x: number[]
  y: number[]
  color: string
  label?: string
  dashed?: boolean
  stems?: boolean
  width?: number
}

export interface PlotProps {
  series: Series[]
  width?: number
  height?: number
  xLabel?: string
  yLabel?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  xTicks?: { v: number; label: string }[]
  marker?: { x: number; y: number; color?: string; label?: string }
  overlay?: (sx: (x: number) => number, sy: (y: number) => number) => ReactNode
  title?: string
}

const M = { l: 44, r: 12, t: 24, b: 34 }

export function Plot({ series, width = 420, height = 240, xLabel, yLabel, xDomain, yDomain, xTicks, marker, overlay, title }: PlotProps) {
  const xs = series.flatMap((s) => s.x)
  const ys = series.flatMap((s) => s.y).filter((v) => Number.isFinite(v))
  const [x0, x1] = xDomain ?? [Math.min(...xs), Math.max(...xs)]
  let [y0, y1] = yDomain ?? [Math.min(0, ...ys), Math.max(...ys)]
  if (y1 - y0 < 1e-9) y1 = y0 + 1
  const pad = (y1 - y0) * 0.08
  y0 -= yDomain ? 0 : pad
  y1 += yDomain ? 0 : pad
  const W = width - M.l - M.r
  const H = height - M.t - M.b
  const sx = (x: number) => M.l + ((x - x0) / (x1 - x0)) * W
  const sy = (y: number) => M.t + H - ((y - y0) / (y1 - y0)) * H
  const yTicks = niceTicks(y0, y1, 4)
  const xt = xTicks ?? niceTicks(x0, x1, 5).map((v) => ({ v, label: trim(v) }))
  return (
    <svg className="plot" viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title ?? yLabel}>
      {title && <text x={M.l} y={14} className="plot-title">{title}</text>}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={M.l} x2={width - M.r} y1={sy(v)} y2={sy(v)} className="grid" />
          <text x={M.l - 6} y={sy(v) + 3} textAnchor="end" className="tick">{trim(v)}</text>
        </g>
      ))}
      {xt.map((t) => (
        <g key={t.label + t.v}>
          <line x1={sx(t.v)} x2={sx(t.v)} y1={M.t} y2={M.t + H} className="grid" />
          <text x={sx(t.v)} y={M.t + H + 14} textAnchor="middle" className="tick">{t.label}</text>
        </g>
      ))}
      {y0 < 0 && y1 > 0 && <line x1={M.l} x2={width - M.r} y1={sy(0)} y2={sy(0)} className="axis" />}
      {series.map((s, i) =>
        s.stems ? (
          <g key={i}>
            {s.x.map((x, k) => Number.isFinite(s.y[k]) && (
              <g key={k}>
                <line x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(s.y[k])} stroke={s.color} strokeWidth={s.width ?? 2} />
                <circle cx={sx(x)} cy={sy(s.y[k])} r={3.2} fill={s.color} />
              </g>
            ))}
          </g>
        ) : (
          <path key={i} d={pathOf(s.x, s.y, sx, sy)} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} strokeDasharray={s.dashed ? '6 4' : undefined} />
        ),
      )}
      {overlay?.(sx, sy)}
      {marker && Number.isFinite(marker.y) && (
        <g>
          <circle cx={sx(marker.x)} cy={sy(marker.y)} r={5} fill={marker.color ?? 'var(--accent)'} stroke="var(--bg)" strokeWidth={1.5} />
          {marker.label && <text x={sx(marker.x) + 8} y={sy(marker.y) - 8} className="marker-label">{marker.label}</text>}
        </g>
      )}
      {xLabel && <text x={M.l + W / 2} y={height - 4} textAnchor="middle" className="axis-label">{xLabel}</text>}
      {yLabel && <text x={12} y={M.t + H / 2} transform={`rotate(-90 12 ${M.t + H / 2})`} textAnchor="middle" className="axis-label">{yLabel}</text>}
      <g transform={`translate(${width - M.r - 4}, ${M.t + 4})`}>
        {series.filter((s) => s.label).map((s, i) => (
          <g key={i} transform={`translate(0, ${i * 14})`}>
            <text textAnchor="end" x={-16} y={8} className="legend">{s.label}</text>
            <line x1={-12} x2={0} y1={4} y2={4} stroke={s.color} strokeWidth={2.5} strokeDasharray={s.dashed ? '4 3' : undefined} />
          </g>
        ))}
      </g>
    </svg>
  )
}

function pathOf(x: number[], y: number[], sx: (x: number) => number, sy: (y: number) => number) {
  let d = ''
  let pen = false
  for (let i = 0; i < x.length; i++) {
    if (!Number.isFinite(y[i])) { pen = false; continue }
    d += `${pen ? 'L' : 'M'}${sx(x[i]).toFixed(1)} ${sy(y[i]).toFixed(1)} `
    pen = true
  }
  return d
}

export function niceTicks(a: number, b: number, n: number): number[] {
  const span = b - a
  if (!(span > 0)) return [a]
  const raw = span / n
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n + 1) ?? mag
  const out: number[] = []
  for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10))
  return out
}

export const trim = (v: number) => (Math.abs(v) < 1e-9 ? '0' : String(+v.toPrecision(3)))

export const piTicks = [
  { v: -Math.PI, label: '−π' }, { v: -Math.PI / 2, label: '−π/2' }, { v: 0, label: '0' }, { v: Math.PI / 2, label: 'π/2' }, { v: Math.PI, label: 'π' },
]

/** Heatmap for small matrices, with numeric labels. */
export function Heatmap({ M: mat, size = 300, title, highlight }: { M: number[][]; size?: number; title?: string; highlight?: [number, number] }) {
  const N = mat.length
  const cell = size / N
  const vmax = Math.max(...mat.flat().map(Math.abs), 1e-9)
  return (
    <svg viewBox={`0 0 ${size} ${size + 20}`} width="100%" className="heat" role="img" aria-label={title}>
      {title && <text x={0} y={12} className="plot-title">{title}</text>}
      <g transform="translate(0,20)">
        {mat.map((row, i) => row.map((v, j) => {
          const t = v / vmax
          const fill = t >= 0 ? `rgba(37, 99, 235, ${0.08 + 0.85 * t})` : `rgba(220, 38, 38, ${0.08 + 0.85 * -t})`
          const hl = highlight && highlight[0] === i && highlight[1] === j
          return (
            <g key={`${i}-${j}`}>
              <rect x={j * cell} y={i * cell} width={cell} height={cell} fill={Math.abs(v) < 1e-12 ? 'var(--panel-2)' : fill} stroke={hl ? 'var(--accent)' : 'var(--bg)'} strokeWidth={hl ? 2.5 : 1} />
              <text x={j * cell + cell / 2} y={i * cell + cell / 2 + 4} textAnchor="middle" className="cell" style={{ fontSize: Math.min(12, cell / 3.4) }}>{Math.abs(v) < 1e-12 ? '0' : trim(v)}</text>
            </g>
          )
        }))}
      </g>
    </svg>
  )
}
