import { useState } from 'react'
import { useProgress } from '../../store/progress'
import { PrereqStep } from './Prereqs'
import { Intuition } from './Intuition'
import { Lab } from './Lab'
import { Derivation } from './Derivation'
import { Worked } from './Worked'
import { Guided } from './Guided'
import { Independent } from './Independent'
import { Exam } from './Exam'
import { Feedback } from './Feedback'

export { MODULE } from './constants'

const steps: { key: string; label: string; ids: string[]; view: () => JSX.Element }[] = [
  { key: 'prereq', label: 'Prerequisites', ids: ['surrogate/pre/deriv', 'surrogate/pre/tangent', 'surrogate/pre/convex', 'surrogate/pre/eig'], view: () => <PrereqStep /> },
  { key: 'intuition', label: 'Intuition', ids: ['surrogate/intuition/check'], view: () => <Intuition /> },
  { key: 'lab', label: 'Visual lab', ids: ['surrogate/lab/check1', 'surrogate/lab/check2'], view: () => <Lab /> },
  { key: 'derivation', label: 'Derivation', ids: [], view: () => <Derivation /> },
  { key: 'worked', label: 'Worked example', ids: ['surrogate/worked/fz-general', 'surrogate/worked/fz-curv', 'surrogate/worked/fz-min'], view: () => <Worked /> },
  { key: 'guided', label: 'Guided practice', ids: ['surrogate/guided/concept', 'surrogate/guided/f', 'surrogate/guided/g', 'surrogate/guided/h', 'surrogate/guided/ml', 'surrogate/guided/b', 'surrogate/guided/a', 'surrogate/guided/step'], view: () => <Guided /> },
  { key: 'independent', label: 'Independent problem', ids: ['surrogate/indep/gq', 'surrogate/indep/x1', 'surrogate/indep/limit', 'surrogate/indep/huber', 'surrogate/indep/lmax', 'surrogate/indep/update'], view: () => <Independent /> },
  { key: 'exam', label: 'Exam: 2021 Q4', ids: ['surrogate/exam/2021-Q4'], view: () => <Exam /> },
  { key: 'feedback', label: 'Feedback', ids: [], view: () => <Feedback /> },
]

export default function SurrogateModule() {
  const [i, setI] = useState(0)
  const s = useProgress()
  const done = (ids: string[]) => ids.length > 0 && ids.every((id) => s.completedSteps[id])
  return (
    <div>
      <h1>Module 2 · Surrogate functions and majorization–minimization</h1>
      <p className="muted">Lectures 18, 19, 20 (book 8.1–8.4). Exam targets: 2021 Q4, 2024 P2, 2023 P3, 2022 Q4. Pathway: prerequisites → intuition → visualization → derivation → worked example → guided practice → independent problem → original exam question → feedback.</p>
      <div className="tabs">
        {steps.map((st, k) => <button key={st.key} className={`${k === i ? 'active' : ''} ${done(st.ids) ? 'done' : ''}`} onClick={() => setI(k)}>{k + 1}. {st.label}</button>)}
      </div>
      {steps[i].view()}
      <div className="row" style={{ marginTop: 24 }}>
        {i > 0 && <button className="btn btn-ghost" onClick={() => setI(i - 1)}>← {steps[i - 1].label}</button>}
        {i < steps.length - 1 && <button className="btn" onClick={() => setI(i + 1)}>{steps[i + 1].label} →</button>}
      </div>
    </div>
  )
}
