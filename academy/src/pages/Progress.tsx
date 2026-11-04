import { useProgress, tagStats, recommend, progress } from '../store/progress'
import { prereqById } from '../data/prereqs'

export function Progress() {
  const s = useProgress()
  const stats = tagStats(s)
  const rec = recommend(s)
  const byMode = (m: string) => s.attempts.filter((a) => a.mode === m)
  const solvedIndependently = byMode('independent').filter((a) => a.correct && a.hintsUsed === 0).length
  const solvedWithHints = s.attempts.filter((a) => a.correct && a.hintsUsed > 0).length
  return (
    <div>
      <h1>Progress and weakness repair</h1>
      <div className="cards">
        <div className="card"><h3>Problems solved independently</h3><p style={{ fontSize: 28, margin: 0 }}>{solvedIndependently}</p></div>
        <div className="card"><h3>Solved with hints</h3><p style={{ fontSize: 28, margin: 0 }}>{solvedWithHints}</p></div>
        <div className="card"><h3>Exam sessions</h3>{s.examSessions.filter((e) => e.finishedAt).map((e, i) => <p key={i}>{e.examId}: {e.score}/{e.max}</p>)}{!s.examSessions.length && <p className="muted">none yet</p>}</div>
      </div>
      <h2>Next best step</h2>
      {rec ? <p>Repair <a href={`#/prereqs/${rec.id}`}>{prereqById[rec.id]?.name}</a>. {rec.reason}</p> : <p className="muted">No weakness pattern detected yet. Keep working through the module.</p>}
      <h2>Prerequisite skills</h2>
      <table>
        <thead><tr><th>Skill</th><th>Right</th><th>Wrong</th><th>Needed hints</th><th>Status</th></tr></thead>
        <tbody>
          {Object.entries(stats).map(([t, v]) => {
            const n = v.right + v.wrong
            const status = v.wrong / n >= 0.4 ? 'needs revision' : v.right >= 3 ? 'understood' : 'in progress'
            return <tr key={t}><td><a href={`#/prereqs/${t}`}>{prereqById[t]?.name ?? t}</a></td><td>{v.right}</td><td>{v.wrong}</td><td>{v.hinted}</td><td><span className={`pill ${status === 'needs revision' ? 'pill-warn' : status === 'understood' ? 'pill-ok' : ''}`}>{status}</span></td></tr>
          })}
          {!Object.keys(stats).length && <tr><td colSpan={5} className="muted">No attempts recorded yet.</td></tr>}
        </tbody>
      </table>
      <h2>Recent attempts</h2>
      <table>
        <thead><tr><th>When</th><th>Item</th><th>Mode</th><th>Result</th><th>Hints</th></tr></thead>
        <tbody>
          {[...s.attempts].reverse().slice(0, 30).map((a, i) => <tr key={i}><td className="small">{new Date(a.at).toLocaleString()}</td><td>{a.id}</td><td>{a.mode}</td><td>{a.correct ? <span className="pill pill-ok">correct</span> : <span className="pill pill-warn">wrong</span>}</td><td>{a.hintsUsed}</td></tr>)}
        </tbody>
      </table>
      <p><button className="btn btn-ghost" onClick={() => confirm('Erase all local progress?') && progress.reset()}>Reset progress</button></p>
    </div>
  )
}
