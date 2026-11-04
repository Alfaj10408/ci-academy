import { useEffect, useState } from 'react'
import { examById } from '../../data/exams'
import { MathText } from '../../components/Tex'
import { Callout } from '../../components/ui'
import { grade, type GradeSpec } from '../../math/grade'
import { progress } from '../../store/progress'
import { MODULE } from './constants'

type ExamId = '2023-P2' | '2021-Q2'
const col = (A: number[][], i: number) => A.map((r) => r[i])
const m23 = { A: { rows: 3, cols: 3 }, x: { rows: 3 }, y: { rows: 3 } }
const derived23 = { lambda: (s: Record<string, unknown>) => (s.sw2 as number) / (s.sx2 as number), I: () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]], Ai: (s: Record<string, unknown>) => col(s.A as number[][], 1), xi: (s: Record<string, unknown>) => (s.x as number[])[1] }

/** auto-graded parts per exam (matrix mode); everything else is self-graded against the key */
const auto: Record<ExamId, Record<string, { spec: GradeSpec; tags: string[]; label: string }>> = {
  '2023-P2': {
    b: { spec: { reference: "-(1/sw2)*A'*(y - A*x) + (1/sx2)*x", vars: { sw2: [0.5, 2], sx2: [0.5, 2] }, matVars: m23, derived: derived23 }, tags: ['matrix-calculus'], label: '∇f(x) = (use sigma_w^2, sigma_x^2 or lambda)' },
    c: { spec: { reference: "inv(A'*A + lambda*I)*A'*y", vars: { sw2: [0.5, 2], sx2: [0.5, 2] }, matVars: m23, derived: derived23 }, tags: ['matrix-calculus'], label: 'x̂ = (I is the identity)' },
    e: { spec: { reference: "((y - A*x)'*Ai - lambda*xi)/(norm(Ai)^2 + lambda)", vars: { sw2: [0.5, 2], sx2: [0.5, 2] }, matVars: m23, derived: derived23 }, tags: ['matrix-calculus'], label: 'α = (then x_i ← x_i + α)' },
  },
  '2021-Q2': {},
}
const minutesFor: Record<ExamId, number> = { '2023-P2': 43, '2021-Q2': 42 }

export function Exam() {
  const [examId, setExamId] = useState<ExamId>('2023-P2')
  const q = examById[examId]
  const PTS = Math.round(q.points / q.parts.length)
  const [minutes, setMinutes] = useState(minutesFor[examId])
  const [phase, setPhase] = useState<'idle' | 'running' | 'graded'>('idle')
  const [left, setLeft] = useState(0)
  const [ans, setAns] = useState<Record<string, string>>({})
  const [self, setSelf] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Record<string, { ok: boolean; reason: string }>>({})

  useEffect(() => {
    if (phase !== 'running') return
    const t = setInterval(() => setLeft((s) => { if (s <= 1) { clearInterval(t); submit(); return 0 } return s - 1 }), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])
  useEffect(() => setMinutes(minutesFor[examId]), [examId])

  const start = () => { setAns({}); setSelf({}); setResults({}); setLeft(minutes * 60); setPhase('running'); progress.startExam(q.id) }
  const submit = () => {
    const r: Record<string, { ok: boolean; reason: string }> = {}
    for (const [k, p] of Object.entries(auto[examId])) {
      const g = grade(ans[k] ?? '', p.spec)
      r[k] = { ok: g.ok, reason: g.reason }
      progress.record({ id: `mapopt/exam/${q.id}/${k}`, module: MODULE, correct: g.ok, hintsUsed: 0, tags: p.tags, mode: 'exam' })
    }
    setResults(r)
    setPhase('graded')
  }
  const score = () => q.parts.reduce((s, p) => s + (auto[examId][p.id] ? (results[p.id]?.ok ? PTS : 0) : self[p.id] ? PTS : 0), 0)
  const finalize = () => { progress.finishExam(q.id, score(), q.points); progress.complete(`mapopt/exam/${q.id}`) }
  const mm = Math.floor(left / 60), ss = left % 60

  if (phase === 'idle') return (
    <div>
      <h2>Exam mode</h2>
      <div className="row">
        {(['2023-P2', '2021-Q2'] as ExamId[]).map((id) => <button key={id} className={`btn ${examId === id ? '' : 'btn-ghost'}`} onClick={() => setExamId(id)}>{examById[id].title} · Midterm {examById[id].year} {examById[id].number} ({examById[id].points} pt)</button>)}
      </div>
      <p>Original question, timed, no hints, no solutions until you submit. The time limit is proportional to the question’s share of a 120-minute, 100-point exam.</p>
      <label className="row">Time limit (minutes): <input type="number" value={minutes} min={5} max={120} onChange={(e) => setMinutes(+e.target.value)} style={{ width: 70 }} /></label>
      <p><button className="btn" onClick={start}>Start timed attempt</button></p>
      <Callout title="What is graded automatically">
        {examId === '2023-P2'
          ? <p>Parts b, c and e are vector/matrix expressions graded by evaluation at random matrices (type transposes as ^t, the i-th column as A_(*,i), entries as x_i, the identity as I). Parts a, d and f are free text: after submission you compare with the key and self-grade honestly.</p>
          : <p>This question is conceptual: every part is free text and self-graded against the official key after submission. The key’s printed answer to 2.1 omits A and β; the app flags that.</p>}
      </Callout>
    </div>
  )

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Midterm {q.year} · {q.number} · {q.title} ({q.points} pt)</h2>
        {phase === 'running' ? <span className="timer" style={{ color: left < 120 ? 'var(--bad)' : undefined }}>{mm}:{String(ss).padStart(2, '0')}</span> : <span className="pill pill-ok">submitted</span>}
      </div>
      <Callout title="Original wording"><MathText>{q.wording}</MathText></Callout>
      {q.parts.map((p) => {
        const a = auto[examId][p.id]
        return (
          <div className="answer" key={p.id}>
            <div className="answer-prompt"><strong>{q.number === 'Q2' ? 'Q' : ''}{p.id}.</strong> <MathText>{p.prompt}</MathText></div>
            <div className="answer-row">
              {a && <span className="small muted" style={{ minWidth: 200 }}>{a.label}</span>}
              {a ? <input value={ans[p.id] ?? ''} disabled={phase !== 'running'} onChange={(e) => setAns({ ...ans, [p.id]: e.target.value })} placeholder="math expression" style={{ width: '60%' }} />
                : <textarea value={ans[p.id] ?? ''} disabled={phase !== 'running'} onChange={(e) => setAns({ ...ans, [p.id]: e.target.value })} placeholder="your answer, in words and symbols" rows={3} style={{ width: '100%' }} />}
            </div>
            {phase === 'graded' && a && <div className={`answer-result ${results[p.id]?.ok ? 'ok' : 'bad'}`}>{results[p.id]?.ok ? '✓' : '✗'} {results[p.id]?.reason}</div>}
            {phase === 'graded' && (
              <div>
                <div className="solution"><strong>Key.</strong> <MathText>{q.key[p.id]}</MathText></div>
                {!a && <label className="row small"><input type="checkbox" checked={!!self[p.id]} onChange={(e) => setSelf({ ...self, [p.id]: e.target.checked })} /> My answer matches the key in substance (self-graded, {PTS} pt)</label>}
              </div>
            )}
          </div>
        )
      })}
      {phase === 'running' && <button className="btn" onClick={submit}>Submit for grading</button>}
      {phase === 'graded' && (
        <div className="card">
          <h3>Score: {score()} / {q.points}</h3>
          <p>Mistake analysis: wrong items are logged against the skills they need (matrix calculus, Gaussian densities, eigenvalue bounds). See the Feedback tab.</p>
          <div className="row"><button className="btn" onClick={finalize}>Record this session</button><button className="btn btn-ghost" onClick={() => setPhase('idle')}>Try again</button></div>
        </div>
      )}
    </div>
  )
}
