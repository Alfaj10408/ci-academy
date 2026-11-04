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
  const exams = s.examSessions.filter((e) => (e.examId === '2023-P2' || e.examId === '2021-Q2') && e.finishedAt)
  return (
    <div>
      <h2>Feedback and what to study next</h2>
      <div className="cards">
        <div className="card"><h3>Independent problem</h3><p>{indep.filter((a) => a.correct).length} of {new Set(indep.map((a) => a.id)).size} parts correct · {indep.length} attempts</p></div>
        <div className="card"><h3>Exam attempts</h3>{exams.length ? exams.map((e, i) => <p key={i}>{e.examId} · {new Date(e.finishedAt!).toLocaleDateString()}: {e.score}/{e.max}</p>) : <p className="muted">none recorded</p>}</div>
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
      <MathText>{'You have mastered this module when you can, without notes: write the forward model and prior behind any MAP cost and say what $\\beta \\to 0$ and $\\beta \\to \\infty$ do; differentiate $\\tfrac12\\|y - Ax\\|^2 + \\tfrac12x^tBx$ and solve $\\nabla f = 0$; write gradient descent, explain the step-size dilemma through the eigenvalues of $H = A^tA + B$ and $h(\\omega)$ for a blur; derive the line-search step $\\alpha^* = -d^t\\nabla f/d^tHd$ and specialise it to $d = e_i$ for ICD; and write the fast ICD loop with the error state. Exam variants covered: 2021 Q2, 2023 P2, 2024 P1, and the full 2022 Q4 in the worked example. Next: proximal maps, ADMM and Plug-and-Play (Module 4).'}</MathText>
    </div>
  )
}
