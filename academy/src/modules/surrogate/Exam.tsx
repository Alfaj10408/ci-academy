import { useEffect, useState } from 'react'
import { examById } from '../../data/exams'
import { MathText } from '../../components/Tex'
import { Callout } from '../../components/ui'
import { grade, gradeNumber, type GradeSpec } from '../../math/grade'
import { progress } from '../../store/progress'
import { MODULE } from './constants'

const q = examById['2021-Q4']
const PTS = 5 // 30 points over 6 parts

type AutoPart = { spec?: GradeSpec; expected?: number; tags: string[] }
const auto: Record<string, AutoPart> = {
  '4.4a': { spec: { reference: '1/(2*abs(xp))', vars: { xp: [-3, 3] } }, tags: ['calculus-1d'] },
  '4.4b': { spec: { reference: 'abs(xp)/2', vars: { xp: [-3, 3] } }, tags: ['calculus-1d'] },
  '4.5': { spec: { reference: '(x-2)^2/2 + x^2/(2*abs(xp))', vars: { x: [-4, 4], xp: [-3, 3] }, upToConstant: 'x' }, tags: ['calculus-1d'] },
  '4.6': { expected: 1, tags: ['calculus-1d'] },
}
const labels: Record<string, string> = { '4.4a': 'a(x′) =', '4.4b': 'b(x′) =', '4.5': 'g(x; x′) = (constants optional)', '4.6': 'x₁ =' }
const selfParts = ['4.1', '4.2', '4.3']

export function Exam() {
  const [minutes, setMinutes] = useState(36)
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

  const start = () => { setAns({}); setSelf({}); setResults({}); setLeft(minutes * 60); setPhase('running'); progress.startExam(q.id) }
  const submit = () => {
    const r: Record<string, { ok: boolean; reason: string }> = {}
    for (const [k, p] of Object.entries(auto)) {
      const g = p.spec ? grade(ans[k] ?? '', p.spec) : gradeNumber(ans[k] ?? '', p.expected!)
      r[k] = { ok: g.ok, reason: g.reason }
      progress.record({ id: `surrogate/exam/${q.id}/${k}`, module: MODULE, correct: g.ok, hintsUsed: 0, tags: p.tags, mode: 'exam' })
    }
    setResults(r)
    setPhase('graded')
  }
  const score = () => {
    let s = 0
    for (const k of selfParts) if (self[k]) s += PTS
    const ab = ['4.4a', '4.4b'].filter((k) => results[k]?.ok).length
    s += Math.round((PTS * ab) / 2) // partial credit: a and b separately
    if (results['4.5']?.ok) s += PTS
    if (results['4.6']?.ok) s += PTS
    return s
  }
  const finalize = () => { progress.finishExam(q.id, score(), q.points); progress.complete('surrogate/exam/2021-Q4') }
  const mm = Math.floor(left / 60), ss = left % 60

  if (phase === 'idle') return (
    <div>
      <h2>Exam mode: Midterm 2021, Q4 (30 pt)</h2>
      <p>Original question, timed, no hints, no solutions until you submit. The 2021 exam allowed 120 minutes for 100 points, so 36 minutes is proportional for this question.</p>
      <label className="row">Time limit (minutes): <input type="number" value={minutes} min={5} max={120} onChange={(e) => setMinutes(+e.target.value)} style={{ width: 70 }} /></label>
      <p><button className="btn" onClick={start}>Start timed attempt</button></p>
      <Callout title="What is graded automatically">
        4.4 (a and b), 4.5 and 4.6 are graded by numerical equivalence against the key; 4.5 is compared up to an additive constant, as the key itself drops the constant. 4.1 (sketch) and the proofs 4.2–4.3 are free text: after submission you compare with the key and self-grade honestly. Type x′ as x' or xp.
      </Callout>
    </div>
  )

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Midterm 2021 · Q4 · Surrogate Functions (30 pt)</h2>
        {phase === 'running' ? <span className="timer" style={{ color: left < 120 ? 'var(--bad)' : undefined }}>{mm}:{String(ss).padStart(2, '0')}</span> : <span className="pill pill-ok">submitted</span>}
      </div>
      <Callout title="Original wording"><MathText>{q.wording}</MathText></Callout>
      {q.parts.map((p) => {
        const keys = p.id === '4.4' ? ['4.4a', '4.4b'] : [p.id]
        return (
          <div className="answer" key={p.id}>
            <div className="answer-prompt"><strong>Q{p.id}.</strong> <MathText>{p.prompt}</MathText></div>
            {keys.map((k) => (
              <div key={k} className="answer-row">
                {labels[k] && <span className="small muted" style={{ minWidth: 200 }}>{labels[k]}</span>}
                {auto[k] ? <input value={ans[k] ?? ''} disabled={phase !== 'running'} onChange={(e) => setAns({ ...ans, [k]: e.target.value })} placeholder="math expression" />
                  : <textarea value={ans[k] ?? ''} disabled={phase !== 'running'} onChange={(e) => setAns({ ...ans, [k]: e.target.value })} placeholder={p.id === '4.1' ? 'describe your sketch: what touches where, what is labelled' : 'your proof, in words and symbols'} rows={3} style={{ width: '100%' }} />}
              </div>
            ))}
            {phase === 'graded' && keys.map((k) => auto[k] ? (
              <div key={k} className={`answer-result ${results[k]?.ok ? 'ok' : 'bad'}`}>{results[k]?.ok ? '✓' : '✗'} {labels[k] ?? ''} {results[k]?.reason}</div>
            ) : (
              <div key={k}>
                <div className="solution"><strong>Key.</strong> <MathText>{q.key[p.id] ?? 'The key shows a figure: f, the surrogate touching it from above at x′, with x′, f(x′) = q(x′;x′), and the two minimisers labelled (lecture 18 slide 6).'}</MathText></div>
                <label className="row small"><input type="checkbox" checked={!!self[k]} onChange={(e) => setSelf({ ...self, [k]: e.target.checked })} /> My answer matches the key in substance (self-graded, {PTS} pt)</label>
              </div>
            ))}
            {phase === 'graded' && auto[keys[0]] && <div className="solution"><strong>Key.</strong> <MathText>{q.key[p.id]}</MathText></div>}
          </div>
        )
      })}
      {phase === 'running' && <button className="btn" onClick={submit}>Submit for grading</button>}
      {phase === 'graded' && (
        <div className="card">
          <h3>Score: {score()} / {q.points}</h3>
          <p>Mistake analysis: wrong items are logged against the calculus skills they need (slope matching, convexity, bounding curvature). See the Feedback tab for what to study next.</p>
          <div className="row"><button className="btn" onClick={finalize}>Record this session</button><button className="btn btn-ghost" onClick={() => setPhase('idle')}>Try again</button></div>
        </div>
      )}
    </div>
  )
}
