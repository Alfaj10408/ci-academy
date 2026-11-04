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
  { key: 'prereq', label: 'Prerequisites', ids: ['prox/pre/convex', 'prox/pre/case', 'prox/pre/lagrange', 'prox/pre/fixed'], view: () => <PrereqStep /> },
  { key: 'intuition', label: 'Intuition', ids: ['prox/intuition/check'], view: () => <Intuition /> },
  { key: 'lab', label: 'Visual lab', ids: ['prox/lab/check1', 'prox/lab/check2'], view: () => <Lab /> },
  { key: 'derivation', label: 'Derivation', ids: [], view: () => <Derivation /> },
  { key: 'worked', label: 'Worked examples', ids: ['prox/worked/p3c', 'prox/worked/p3d'], view: () => <Worked /> },
  { key: 'guided', label: 'Guided practice', ids: ['prox/guided/s-pos', 'prox/guided/s-neg', 'prox/guided/s-mid', 'prox/guided/s-compact', 'prox/guided/s-words', 'prox/guided/p4ab', 'prox/guided/p4c', 'prox/guided/p4d', 'prox/guided/p4e'], view: () => <Guided /> },
  { key: 'independent', label: 'Independent problem', ids: ['prox/indep/F', 'prox/indep/x1', 'prox/indep/u1', 'prox/indep/ulim', 'prox/indep/p3c', 'prox/indep/mann1', 'prox/indep/mannlim', 'prox/indep/icd', 'prox/indep/tv', 'prox/indep/pnp'], view: () => <Independent /> },
  { key: 'exam', label: 'Exam: 2022 Q3 / 2024 P3 / 2025 P4', ids: ['prox/exam/2022-Q3'], view: () => <Exam /> },
  { key: 'feedback', label: 'Feedback', ids: [], view: () => <Feedback /> },
]

export default function ProxModule() {
  const [i, setI] = useState(0)
  const s = useProgress()
  const done = (ids: string[]) => ids.length > 0 && ids.every((id) => s.completedSteps[id])
  return (
    <div>
      <h1>Module 4 · Proximal maps, ADMM and Plug-and-Play</h1>
      <p className="muted">Lectures 21–25 (book 9.1–9.5, 10.1–10.2). Exam targets: 2022 Q3, 2023 P1, 2024 P3, 2025 P2, 2025 P4. Pathway: prerequisites → intuition → visualization → derivation → worked examples → guided practice → independent problem → original exam question → feedback.</p>
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
