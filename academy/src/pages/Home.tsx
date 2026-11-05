import { useProgress, recommend } from '../store/progress'
import { prereqById, prereqs } from '../data/prereqs'
import { exams } from '../data/exams'
import { modules } from '../data/modules'
import { Banner, Thumb } from '../components/Art'

const thumbs: Record<string, string> = { 'ar-gmrf': 'topic-probability', surrogate: 'topic-optimization', mapopt: 'topic-imaging', prox: 'restoration-feature' }

const blurbs: Record<string, string> = {
  'ar-gmrf': 'Causal AR(1) → noncausal GMRF: power spectrum, noncausal filter, precision matrix. Targets 2021 Q3, 2025 P1 and 2022 Q2.',
  surrogate: 'Surrogate functions and majorization–minimization: slope matching, maximum curvature vs symmetric bound, λ_max for the data term. Targets 2021 Q4, 2024 P2, 2023 P3 and 2022 Q4 (4 of 5 exam years).',
  mapopt: 'MAP estimation, gradient descent and ICD: forward model and prior, the step-size dilemma through h(ω), line search, the ICD step. Targets 2021 Q2, 2023 P2, 2024 P1 and completes 2022 Q4.',
  prox: 'Proximal maps, shrinkage, ADMM and Plug-and-Play: split the variable, price the constraint with u, clip or shrink in the v update, nonexpansive maps and the Mann iteration. Targets 2022 Q3, 2023 P1, 2024 P3, 2025 P2 and 2025 P4.',
}

export function Home() {
  const s = useProgress()
  const rec = recommend(s)
  const done = Object.keys(s.completedSteps).length
  const examsDone = s.examSessions.filter((e) => e.finishedAt).length
  const checks = prereqs.filter((p) => p.check)
  const checksDone = checks.filter((p) => s.completedSteps[`prereqs/${p.id}`]).length
  const correct = s.attempts.filter((a) => a.correct).length
  const doneIn = (id: string) => Object.keys(s.completedSteps).filter((k) => k.startsWith(`${id}/`)).length
  return (
    <div>
      <Banner src="hero-home" height={250} position="center 35%" eager className="hero-banner" />
      <section className="hero">
        <div className="hero-kicker">ECE 60141 · Purdue · Bouman</div>
        <h1>Computational Imaging Mathematics Academy</h1>
        <p className="hero-sub">Built from lectures 5–25, the 2021–2025 midterm keys, and Bouman’s <em>Foundations of Computational Imaging</em>. Teach backward from the exam, forward from first principles.</p>
        <div className="row">
          <a className="btn" href="#/module/ar-gmrf">Start with Module 1</a>
          <a className="btn btn-ghost" href="#/exams">Exam trainer</a>
          <a className="btn btn-ghost" href="#/prereqs">Refreshers</a>
        </div>
      </section>

      <div className="stats">
        <div className="stat"><div className="stat-v">{done}</div><div className="stat-l">steps completed</div></div>
        <div className="stat"><div className="stat-v">{s.attempts.length ? Math.round((100 * correct) / s.attempts.length) : 0}%</div><div className="stat-l">of {s.attempts.length} attempts correct</div></div>
        <div className="stat"><div className="stat-v">{examsDone}</div><div className="stat-l">timed exam sessions</div></div>
        <div className="stat"><div className="stat-v">{checksDone}/{checks.length}</div><div className="stat-l">refresher checks passed</div></div>
      </div>

      <h2>Learning modules</h2>
      <div className="cards module-grid">
        {modules.map((m) => {
          const n = doneIn(m.id)
          return (
            <article className="card module-card" key={m.id}>
              <Thumb src={thumbs[m.id]} className="module-thumb" eager />
              <div className="module-head"><span className="module-num">{m.n}</span><h3>{m.title}</h3></div>
              <p>{blurbs[m.id]}</p>
              <div className="row">{m.targets.map((t) => <span className="pill" key={t}>{t}</span>)}</div>
              <div className="module-foot">
                <span className="small muted">{n > 0 ? `${n} steps done` : 'Not started'} · lectures {m.lectures}</span>
                <a className="btn" href={`#/module/${m.id}`}>{n > 0 ? 'Continue' : 'Open module'}</a>
              </div>
            </article>
          )
        })}
      </div>

      <div className="cards" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>Your progress</h3>
          <p>{done} steps completed · {s.attempts.length} attempts · {examsDone} exam sessions</p>
          {rec ? <p>Recommended next: <a href={`#/prereqs/${rec.id}`}>{prereqById[rec.id]?.name ?? rec.id}</a>. <span className="muted small">{rec.reason}</span></p> : <p className="muted">Recommendations appear once you have attempted a few problems.</p>}
          <a href="#/progress">Progress &amp; weaknesses →</a>
        </div>
        <div className="card card-with-thumb">
          <Thumb src="topic-exam-solving" className="card-thumb" />
          <h3>Exam patterns</h3>
          <p>{exams.length} questions across 5 midterms. Surrogate functions, MAP ↔ forward model, and proximal maps each appear in 4 of 5 years; AR ↔ GMRF in 3 of 5.</p>
          <a href="#/exams">Exam trainer →</a>
        </div>
      </div>

      <Banner src="landscape-divider" height={90} className="divider-banner" />
      <h2>Learning roadmap</h2>
      <ol className="roadmap">
        <li><strong>Signals foundation → AR / GMRF</strong> (lectures 5, 7, 9, 10, 11). Module 1, available now.</li>
        <li><strong>Surrogate functions and MM</strong> (18–20). Highest exam frequency. Module 2, available now.</li>
        <li><strong>MAP, gradient descent, ICD</strong> (12–14). Module 3, available now.</li>
        <li><strong>Proximal maps, ADMM, Plug-and-Play</strong> (21–25). Module 4, available now.</li>
      </ol>
    </div>
  )
}
