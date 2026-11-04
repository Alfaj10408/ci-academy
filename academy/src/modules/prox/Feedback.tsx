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
  const exams = s.examSessions.filter((e) => ['2022-Q3', '2024-P3', '2025-P4'].includes(e.examId) && e.finishedAt)
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
      <MathText>{'You have mastered this module when you can, without notes: split a two-term problem, write its augmented Lagrangian with the scaled multiplier and say what raising $u$ does; write ADMM with $F$ and $H$ and know that $u \\to \\lambda^*/a$; derive the shrinkage function by cases and apply it componentwise; recognise the clip as the proximal map of a convex-set indicator and the shrinkage as that of $\\lambda\\|\\cdot\\|_1$; prove a proximal map exists and is unique and compute it for a quadratic; and separate contraction from nonexpansive, plain iteration from the Mann iteration. Exam variants covered: 2022 Q3, 2023 P1, 2024 P3, 2025 P2, 2025 P4. With Modules 1–4 every midterm question from 2021 to 2025 has a home.'}</MathText>
    </div>
  )
}
