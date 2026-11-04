import { useEffect, useState } from 'react'
import { examById } from '../../data/exams'
import { MathText } from '../../components/Tex'
import { Callout } from '../../components/ui'
import { grade, type GradeSpec } from '../../math/grade'
import { progress } from '../../store/progress'
import { MODULE } from './constants'

const q = examById['2021-Q3']
const PTS = 5 // 30 points over 6 parts

type AutoPart = { id: string; spec: GradeSpec; tags: string[] }
const auto: Record<string, AutoPart> = {
  '3.1': { id: '3.1', spec: { reference: 'sc2/(1 - 2*rho*cos(w) + rho^2)', vars: { w: [-3.1, 3.1], rho: [-0.9, 0.9], sc2: [0.2, 3] } }, tags: ['complex-euler', 'dtft', 'psd'] },
  '3.2': { id: '3.2', spec: { reference: 'rho/(1+rho^2)*(delta(n-1)+delta(n+1))', vars: { n: [-3, 3], rho: [-0.9, 0.9] }, integerVars: ['n'] }, tags: ['convolution', 'time-reversal'] },
  '3.3': { id: '3.3', spec: { reference: 'sc2/(1+rho^2)', vars: { rho: [-0.9, 0.9], sc2: [0.2, 3] } }, tags: ['psd'] },
  '3.6a': { id: '3.6a', spec: { reference: '(1+rho^2)/sc2', vars: { rho: [-0.9, 0.9], sc2: [0.2, 3] } }, tags: ['precision-matrix'] },
  '3.6b': { id: '3.6b', spec: { reference: '-rho/sc2', vars: { rho: [-0.9, 0.9], sc2: [0.2, 3] } }, tags: ['precision-matrix'] },
  '3.6c': { id: '3.6c', spec: { reference: '1/sc2', vars: { rho: [-0.9, 0.9], sc2: [0.2, 3] } }, tags: ['precision-matrix', 'gaussian-density'] },
}

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
      const g = grade(ans[k] ?? '', p.spec)
      r[k] = { ok: g.ok, reason: g.reason }
      progress.record({ id: `ar-gmrf/exam/${q.id}/${k}`, module: MODULE, correct: g.ok, hintsUsed: 0, tags: p.tags, mode: 'exam' })
    }
    setResults(r)
    setPhase('graded')
  }
  const score = () => {
    let s = 0
    if (results['3.1']?.ok) s += PTS
    if (results['3.2']?.ok) s += PTS
    if (results['3.3']?.ok) s += PTS
    if (self['3.4']) s += PTS
    if (self['3.5']) s += PTS
    const b = ['3.6a', '3.6b', '3.6c'].filter((k) => results[k]?.ok).length
    s += Math.round((PTS * b) / 3) // partial credit on the matrix entries
    return s
  }
  const finalize = () => { progress.finishExam(q.id, score(), q.points); progress.complete('ar-gmrf/exam/2021-Q3') }
  const mm = Math.floor(left / 60), ss = left % 60

  if (phase === 'idle') return (
    <div>
      <h2>Exam mode: Midterm 2021, Q3 (30 pt)</h2>
      <p>Original question, timed, no hints, no solutions until you submit. The 2021 exam allowed 120 minutes for 100 points, so 36 minutes is proportional for this question.</p>
      <label className="row">Time limit (minutes): <input type="number" value={minutes} min={5} max={120} onChange={(e) => setMinutes(+e.target.value)} style={{ width: 70 }} /></label>
      <p><button className="btn" onClick={start}>Start timed attempt</button></p>
      <Callout title="What is graded automatically">
        3.1, 3.2, 3.3 and the three entry types of 3.6 are graded by numerical equivalence against the key. 3.4 and 3.5 are free text; after submission you compare your reasoning with the key and self-grade honestly. Partial credit on 3.6 is proportional to correct entry types.
      </Callout>
    </div>
  )

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Midterm 2021 · Q3 · Non-causal Models (30 pt)</h2>
        {phase === 'running' ? <span className="timer" style={{ color: left < 120 ? 'var(--bad)' : undefined }}>{mm}:{String(ss).padStart(2, '0')}</span> : <span className="pill pill-ok">submitted</span>}
      </div>
      <Callout title="Original wording"><MathText>{q.wording}</MathText></Callout>
      {q.parts.map((p) => {
        const keys = p.id === '3.6' ? ['3.6a', '3.6b', '3.6c'] : [p.id]
        const labels: Record<string, string> = { '3.6a': 'interior diagonal Bᵢ,ᵢ (in rho, sc2)', '3.6b': 'off-diagonal Bᵢ,ᵢ₊₁', '3.6c': 'first/last diagonal B₀,₀ = Bₚ₋₁,ₚ₋₁' }
        return (
          <div className="answer" key={p.id}>
            <div className="answer-prompt"><strong>Q{p.id}.</strong> <MathText>{p.prompt}</MathText></div>
            {keys.map((k) => (
              <div key={k} className="answer-row">
                {labels[k] && <span className="small muted" style={{ minWidth: 220 }}>{labels[k]}</span>}
                <input value={ans[k] ?? ''} disabled={phase !== 'running'} onChange={(e) => setAns({ ...ans, [k]: e.target.value })} placeholder={auto[k] ? 'math expression' : 'your justification in words'} />
              </div>
            ))}
            {phase === 'graded' && keys.map((k) => auto[k] ? (
              <div key={k} className={`answer-result ${results[k]?.ok ? 'ok' : 'bad'}`}>{results[k]?.ok ? '✓' : '✗'} {labels[k] ?? ''} {results[k]?.reason}</div>
            ) : (
              <div key={k}>
                <div className="solution"><strong>Key.</strong> <MathText>{q.key[p.id]}</MathText></div>
                <label className="row small"><input type="checkbox" checked={!!self[k]} onChange={(e) => setSelf({ ...self, [k]: e.target.checked })} /> My answer matches the key in substance (self-graded, {PTS} pt)</label>
              </div>
            ))}
            {phase === 'graded' && auto[p.id === '3.6' ? '3.6a' : p.id] && <div className="solution"><strong>Key.</strong> <MathText>{q.key[p.id]}</MathText></div>}
          </div>
        )
      })}
      {phase === 'running' && <button className="btn" onClick={submit}>Submit for grading</button>}
      {phase === 'graded' && (
        <div className="card">
          <h3>Score: {score()} / {q.points}</h3>
          <p>Conceptual mistake analysis: wrong items are logged against their prerequisite skills (Euler/modulus, DTFT, convolution and time reversal, PSD, precision matrix). See the Feedback tab for what to study next.</p>
          <div className="row"><button className="btn" onClick={finalize}>Record this session</button><button className="btn btn-ghost" onClick={() => setPhase('idle')}>Try again</button></div>
        </div>
      )}
    </div>
  )
}
