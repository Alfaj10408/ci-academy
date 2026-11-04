import { useEffect, useState } from 'react'
import { examById } from '../../data/exams'
import { MathText } from '../../components/Tex'
import { Callout } from '../../components/ui'
import { grade, type GradeSpec } from '../../math/grade'
import { progress } from '../../store/progress'
import { MODULE } from './constants'

type ExamId = '2022-Q3' | '2024-P3' | '2025-P4'
const I3 = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
const auto: Record<ExamId, Record<string, { spec: GradeSpec; tags: string[]; label: string }>> = {
  '2022-Q3': { '3.5': { spec: { reference: 'max(z, 0)', vars: { z: [-3, 3] } }, tags: ['case-analysis'], label: '[H(z)]_i = (type z for z_i)' } },
  '2024-P3': { c: { spec: { reference: "v + inv(I/sigma2 + A'*Lambda*A)*A'*Lambda*(y - A*v)", vars: { sigma2: [0.5, 2] }, matVars: { A: { rows: 3, cols: 3 }, Lambda: { rows: 3, cols: 3, posdef: true }, v: { rows: 3 }, y: { rows: 3 } }, derived: { I: I3 } }, tags: ['matrix-calculus'], label: 'F(v; y) = (I identity, Lambda, sigma^2, ^t, (…)^(-1))' } },
  '2025-P4': { e: { spec: { reference: '(x1 + x2)/2', vars: { x1: [-3, 3], x2: [-3, 3] } }, tags: ['fixed-point'], label: 'first component of the limit, in x1, x2' } },
}
const minutesFor: Record<ExamId, number> = { '2022-Q3': 42, '2024-P3': 29, '2025-P4': 42 }

export function Exam() {
  const [examId, setExamId] = useState<ExamId>('2022-Q3')
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
      progress.record({ id: `prox/exam/${q.id}/${k}`, module: MODULE, correct: g.ok, hintsUsed: 0, tags: p.tags, mode: 'exam' })
    }
    setResults(r)
    setPhase('graded')
  }
  const score = () => q.parts.reduce((s, p) => s + (auto[examId][p.id] ? (results[p.id]?.ok ? PTS : 0) : self[p.id] ? PTS : 0), 0)
  const finalize = () => { progress.finishExam(q.id, score(), q.points); progress.complete(`prox/exam/${q.id}`) }
  const mm = Math.floor(left / 60), ss = left % 60

  if (phase === 'idle') return (
    <div>
      <h2>Exam mode</h2>
      <div className="row">
        {(['2022-Q3', '2024-P3', '2025-P4'] as ExamId[]).map((id) => <button key={id} className={`btn ${examId === id ? '' : 'btn-ghost'}`} onClick={() => setExamId(id)}>{examById[id].title} · Midterm {examById[id].year} {examById[id].number} ({examById[id].points} pt)</button>)}
      </div>
      <p>Original question, timed, no hints, no solutions until you submit. The time limit is proportional to the question’s share of a 120-minute, 100-point exam.</p>
      <label className="row">Time limit (minutes): <input type="number" value={minutes} min={5} max={120} onChange={(e) => setMinutes(+e.target.value)} style={{ width: 70 }} /></label>
      <p><button className="btn" onClick={start}>Start timed attempt</button></p>
      <Callout title="What is graded automatically">
        <p>{examId === '2022-Q3' ? 'Part 3.5 (the explicit H(z)) is graded numerically; 3.1 to 3.4 are free text, compared with the key and self-graded after submission.' : examId === '2024-P3' ? 'Part (c) is a matrix expression graded at random matrices; (a), (b) and (d) are proofs, self-graded against the key.' : 'Part (e) is graded as an expression in x1, x2; (a) to (d) are yes/no with justification, self-graded against the key.'}</p>
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
            <div className="answer-prompt"><strong>{p.id}.</strong> <MathText>{p.prompt}</MathText></div>
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
          <p>Mistake analysis: wrong items are logged against the skills they need (case analysis, Lagrange multipliers, fixed points, matrix calculus). See the Feedback tab.</p>
          <div className="row"><button className="btn" onClick={finalize}>Record this session</button><button className="btn btn-ghost" onClick={() => setPhase('idle')}>Try again</button></div>
        </div>
      )}
    </div>
  )
}
