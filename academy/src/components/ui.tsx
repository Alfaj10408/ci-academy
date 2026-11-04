import { useState, type ReactNode } from 'react'
import { Tex, MathText } from './Tex'
import { grade, gradeNumber, type GradeSpec, type GradeResult } from '../math/grade'
import { progress } from '../store/progress'

export function Slider({ label, value, min, max, step, onChange, format }: { label: ReactNode; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="slider">
      <span className="slider-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <span className="slider-value">{format ? format(value) : value}</span>
    </label>
  )
}

export function Panel({ title, children, className, actions }: { title: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  const [big, setBig] = useState(false)
  return (
    <section className={`panel ${className ?? ''} ${big ? 'panel-expanded' : ''}`}>
      <header className="panel-head">
        <h3>{title}</h3>
        <div className="panel-actions">{actions}<button className="icon-btn" title={big ? 'Collapse' : 'Expand to workspace'} onClick={() => setBig(!big)}>{big ? '⤡' : '⤢'}</button></div>
      </header>
      <div className="panel-body">{children}</div>
      {big && <div className="panel-backdrop" onClick={() => setBig(false)} />}
    </section>
  )
}

export function Callout({ kind = 'info', title, children }: { kind?: 'info' | 'warn' | 'ok' | 'simplification'; title?: string; children: ReactNode }) {
  return (
    <div className={`callout callout-${kind}`}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  )
}

export interface AnswerProps {
  id: string
  module: string
  tags: string[]
  mode: 'guided' | 'independent' | 'exam' | 'prereq' | 'check'
  prompt: ReactNode
  /** expression grading spec, or expected number */
  spec?: GradeSpec
  expected?: number
  placeholder?: string
  hints?: string[]
  /** shown after a correct answer or after hint 5 */
  solution?: string
  onResult?: (ok: boolean) => void
  /** in exam mode, grading is deferred: we only store the answer */
  deferred?: boolean
  onAnswer?: (text: string) => void
}

/** Free-response math answer box with grading, progressive hints, and mistake logging. */
export function AnswerBox(p: AnswerProps) {
  const [text, setText] = useState('')
  const [res, setRes] = useState<GradeResult | null>(null)
  const [hint, setHint] = useState(0)
  const [done, setDone] = useState(false)
  const [tries, setTries] = useState(0)
  const check = () => {
    if (p.deferred) { p.onAnswer?.(text); setDone(true); return }
    const r = p.spec ? grade(text, p.spec) : gradeNumber(text, p.expected ?? NaN)
    setRes(r)
    setTries(tries + 1)
    progress.record({ id: p.id, module: p.module, correct: r.ok, hintsUsed: hint, tags: p.tags, mode: p.mode })
    if (r.ok) { setDone(true); progress.complete(p.id) }
    p.onResult?.(r.ok)
  }
  const reveal = p.solution && (done || hint >= 5)
  return (
    <div className={`answer ${done ? 'answer-done' : ''}`}>
      <div className="answer-prompt">{p.prompt}</div>
      <div className="answer-row">
        <input value={text} placeholder={p.placeholder ?? 'type math, e.g. sc2/|1 - rho e^{-j w}|^2'} onChange={(e) => { setText(e.target.value); setRes(null) }} onKeyDown={(e) => e.key === 'Enter' && check()} disabled={done && !p.deferred} />
        <button className="btn" onClick={check} disabled={done && !p.deferred}>{p.deferred ? (done ? 'Saved' : 'Save') : 'Check'}</button>
        {!p.deferred && p.hints && !done && hint < p.hints.length && <button className="btn btn-ghost" onClick={() => setHint(hint + 1)}>Hint {hint + 1}/{p.hints.length}</button>}
      </div>
      {text && <div className="answer-preview"><Tex>{previewTex(text)}</Tex></div>}
      {res && (
        <div className={`answer-result ${res.ok ? 'ok' : 'bad'}`}>
          {res.ok ? '✓ ' : '✗ '}{res.reason}
          {res.counterexample && (
            <div className="counter">At {Object.entries(res.counterexample.point).map(([k, v]) => `${k}=${+v.toFixed(3)}`).join(', ')}: yours = {fmtNum(res.counterexample.student)}, correct = {fmtNum(res.counterexample.reference)}.</div>
          )}
          {!res.ok && tries >= 2 && hint === 0 && p.hints && <div className="nudge">Stuck? Hints are available, from concept (1) to full solution (5).</div>}
        </div>
      )}
      {p.hints && hint > 0 && (
        <ol className="hints">
          {p.hints.slice(0, hint).map((h, i) => <li key={i}><MathText>{h}</MathText></li>)}
        </ol>
      )}
      {reveal && <div className="solution"><strong>Solution.</strong> <MathText>{p.solution!}</MathText></div>}
    </div>
  )
}

const fmtNum = (v: number) => (Number.isFinite(v) ? String(+v.toPrecision(5)) : String(v))

/** Best-effort LaTeX preview of plain-text input. */
function previewTex(s: string): string {
  if (s.includes('\\')) return s
  return s
    .replace(/sc2/g, '\\sigma_C^2').replace(/snc2/g, '\\sigma_{NC}^2').replace(/sigma2/g, '\\sigma^2')
    .replace(/rho/g, '\\rho').replace(/\bw\b/g, '\\omega').replace(/\*/g, '\\cdot ').replace(/abs\(([^()]*)\)/g, '|$1|')
    .replace(/exp\(([^()]*)\)/g, 'e^{$1}').replace(/delta/g, '\\delta').replace(/cos/g, '\\cos').replace(/sin/g, '\\sin')
}

export function Choice({ id, module, tags, question, options, answer, explain, mode = 'check' }: { id: string; module: string; tags: string[]; question: string; options: string[]; answer: number; explain: string; mode?: 'check' | 'prereq' | 'guided' | 'independent' }) {
  const [pick, setPick] = useState<number | null>(null)
  const choose = (i: number) => {
    if (pick !== null) return
    setPick(i)
    progress.record({ id, module, correct: i === answer, hintsUsed: 0, tags, mode })
    if (i === answer) progress.complete(id)
  }
  return (
    <div className="choice">
      <MathText className="choice-q">{question}</MathText>
      <div className="choice-opts">
        {options.map((o, i) => (
          <button key={i} className={`btn btn-opt ${pick === null ? '' : i === answer ? 'ok' : i === pick ? 'bad' : 'dim'}`} onClick={() => choose(i)}><MathText>{o}</MathText></button>
        ))}
      </div>
      {pick !== null && <div className={`answer-result ${pick === answer ? 'ok' : 'bad'}`}><MathText>{(pick === answer ? '✓ ' : '✗ ') + explain}</MathText></div>}
    </div>
  )
}

export function Steps({ steps, title }: { steps: { title: string; body: ReactNode }[]; title?: string }) {
  const [n, setN] = useState(1)
  return (
    <div className="steps">
      {title && <h4>{title}</h4>}
      {steps.slice(0, n).map((s, i) => (
        <div key={i} className="step">
          <div className="step-n">{i + 1}</div>
          <div className="step-body"><strong>{s.title}</strong>{s.body}</div>
        </div>
      ))}
      <div className="step-controls">
        {n < steps.length ? <button className="btn" onClick={() => setN(n + 1)}>Next step ({n}/{steps.length})</button> : <span className="muted">All {steps.length} steps shown.</span>}
        {n > 1 && <button className="btn btn-ghost" onClick={() => setN(1)}>Restart</button>}
      </div>
    </div>
  )
}
