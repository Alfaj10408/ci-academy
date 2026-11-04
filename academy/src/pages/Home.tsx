import { useProgress, recommend } from '../store/progress'
import { prereqById } from '../data/prereqs'
import { exams } from '../data/exams'

export function Home() {
  const s = useProgress()
  const rec = recommend(s)
  const done = Object.keys(s.completedSteps).length
  return (
    <div>
      <h1>Computational Imaging Mathematics Academy</h1>
      <p className="muted">Built from lectures 5–25, the 2021–2025 midterm keys, and Bouman’s <em>Foundations of Computational Imaging</em>. Teach backward from the exam, forward from first principles.</p>
      <div className="cards" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Start here: Module 1</h3>
          <p>Causal AR(1) → noncausal GMRF: power spectrum, noncausal filter, precision matrix. Targets 2021 Q3, 2025 P1 and 2022 Q2.</p>
          <a className="btn" href="#/module/ar-gmrf" style={{ display: 'inline-block', textDecoration: 'none' }}>Open module</a>
        </div>
        <div className="card">
          <h3>Module 2</h3>
          <p>Surrogate functions and majorization–minimization: slope matching, maximum curvature vs symmetric bound, λ_max for the data term. Targets 2021 Q4, 2024 P2, 2023 P3 and 2022 Q4 (4 of 5 exam years).</p>
          <a className="btn" href="#/module/surrogate" style={{ display: 'inline-block', textDecoration: 'none' }}>Open module</a>
        </div>
        <div className="card">
          <h3>Module 3</h3>
          <p>MAP estimation, gradient descent and ICD: forward model and prior, the step-size dilemma through h(ω), line search, the ICD step. Targets 2021 Q2, 2023 P2, 2024 P1 and completes 2022 Q4.</p>
          <a className="btn" href="#/module/mapopt" style={{ display: 'inline-block', textDecoration: 'none' }}>Open module</a>
        </div>
        <div className="card">
          <h3>Module 4</h3>
          <p>Proximal maps, shrinkage, ADMM and Plug-and-Play: split the variable, price the constraint with u, clip or shrink in the v update, nonexpansive maps and the Mann iteration. Targets 2022 Q3, 2023 P1, 2024 P3, 2025 P2 and 2025 P4.</p>
          <a className="btn" href="#/module/prox" style={{ display: 'inline-block', textDecoration: 'none' }}>Open module</a>
        </div>
        <div className="card">
          <h3>Your progress</h3>
          <p>{done} steps completed · {s.attempts.length} attempts · {s.examSessions.filter((e) => e.finishedAt).length} exam sessions</p>
          {rec ? <p>Recommended next: <a href={`#/prereqs/${rec.id}`}>{prereqById[rec.id]?.name ?? rec.id}</a>. <span className="muted small">{rec.reason}</span></p> : <p className="muted">Recommendations appear once you have attempted a few problems.</p>}
        </div>
        <div className="card">
          <h3>Exam patterns</h3>
          <p>{exams.length} questions across 5 midterms. Surrogate functions, MAP ↔ forward model, and proximal maps each appear in 4 of 5 years; AR ↔ GMRF in 3 of 5.</p>
          <a href="#/exams">Exam trainer →</a>
        </div>
      </div>
      <h2>Learning roadmap</h2>
      <ol>
        <li><strong>Signals foundation → AR / GMRF</strong> (lectures 5, 7, 9, 10, 11). Module 1, available now.</li>
        <li><strong>Surrogate functions and MM</strong> (18–20). Highest exam frequency. Module 2, available now.</li>
        <li><strong>MAP, gradient descent, ICD</strong> (12–14). Module 3, available now.</li>
        <li><strong>Proximal maps, ADMM, Plug-and-Play</strong> (21–25). Module 4, available now.</li>
      </ol>
    </div>
  )
}
