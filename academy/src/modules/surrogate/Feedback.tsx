import { useProgress, tagStats, recommend } from '../../store/progress'
import { prereqById } from '../../data/prereqs'
import { MathText } from '../../components/Tex'
import { MODULE } from './constants'

export function Feedback() {
  const s = useProgress()
  const mine = { ...s, attempts: s.attempts.filter((a) => a.module === MODULE) }
  const stats = tagStats(mine)
  const rec = recommend(mine)
  const indep = mine.attempts.filter((a) => a.mode === 'independent')
  const exam = s.examSessions.filter((e) => e.examId === '2021-Q4' && e.finishedAt)
  return (
    <div>
      <h2>Feedback and what to study next</h2>
      <div className="cards">
        <div className="card"><h3>Independent problem</h3><p>{indep.filter((a) => a.correct).length} of {new Set(indep.map((a) => a.id)).size} parts correct · {indep.length} attempts</p></div>
        <div className="card"><h3>Exam attempts (2021 Q4)</h3>{exam.length ? exam.map((e, i) => <p key={i}>{new Date(e.finishedAt!).toLocaleDateString()}: {e.score}/{e.max}</p>) : <p className="muted">none recorded</p>}</div>
        <div className="card"><h3>Recommendation</h3>{rec ? <p>Repair <a href={`#/prereqs/${rec.id}`}>{prereqById[rec.id]?.name}</a>. <span className="small muted">{rec.reason}</span></p> : <p className="muted">No systematic weakness detected in this module.</p>}</div>
      </div>
      <h3>Skill breakdown for this module</h3>
      <table>
        <thead><tr><th>Skill</th><th>Right</th><th>Wrong</th><th>With hints</th><th>Targeted lesson</th></tr></thead>
        <tbody>
          {Object.entries(stats).map(([t, v]) => <tr key={t}><td>{prereqById[t]?.name ?? t}</td><td>{v.right}</td><td>{v.wrong}</td><td>{v.hinted}</td><td><a href={`#/prereqs/${t}`}>open</a></td></tr>)}
          {!Object.keys(stats).length && <tr><td colSpan={5} className="muted">Nothing attempted yet.</td></tr>}
        </tbody>
      </table>
      <h3>Transfer check</h3>
      <MathText>{'You have mastered this module when you can, without notes: state the two surrogate conditions and write the three-link inequality chain with its justifications; build the surrogate of $|x|$ (or any $|x - z|$) by slope matching and verify the upper bound; add surrogates term by term and minimise the result; choose between maximum curvature and the symmetric bound and compute $a_2$ for Huber; and justify $a = \\lambda_{\\max}(A^tA)$ for the quadratic data term. Remaining exam variants not yet covered by a module: 2022 Q4 in full (vector Taylor expansion), which Module 3 (MAP, gradient descent, ICD) will complete.'}</MathText>
    </div>
  )
}
