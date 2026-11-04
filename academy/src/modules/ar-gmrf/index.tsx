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
  { key: 'prereq', label: 'Prerequisites', ids: ['ar-gmrf/pre/euler', 'ar-gmrf/pre/dtft', 'ar-gmrf/pre/conv', 'ar-gmrf/pre/psd'], view: () => <PrereqStep /> },
  { key: 'intuition', label: 'Intuition', ids: ['ar-gmrf/intuition/check'], view: () => <Intuition /> },
  { key: 'lab', label: 'Visual lab', ids: ['ar-gmrf/lab/check1', 'ar-gmrf/lab/check2'], view: () => <Lab /> },
  { key: 'derivation', label: 'Derivation', ids: [], view: () => <Derivation /> },
  { key: 'worked', label: 'Worked example', ids: ['ar-gmrf/worked/snc2', 'ar-gmrf/worked/g1', 'ar-gmrf/worked/bdiag', 'ar-gmrf/worked/boff', 'ar-gmrf/worked/bbound'], view: () => <Worked /> },
  { key: 'guided', label: 'Guided practice', ids: ['ar-gmrf/guided/psd', 'ar-gmrf/guided/snc2', 'ar-gmrf/guided/g', 'ar-gmrf/guided/bdiag', 'ar-gmrf/guided/boff', 'ar-gmrf/guided/bbound'], view: () => <Guided /> },
  { key: 'independent', label: 'Independent problem', ids: ['ar-gmrf/indep/snc2', 'ar-gmrf/indep/g1', 'ar-gmrf/indep/g2', 'ar-gmrf/indep/psd'], view: () => <Independent /> },
  { key: 'exam', label: 'Exam: 2021 Q3', ids: ['ar-gmrf/exam/2021-Q3'], view: () => <Exam /> },
  { key: 'feedback', label: 'Feedback', ids: [], view: () => <Feedback /> },
]

export default function ArGmrfModule() {
  const [i, setI] = useState(0)
  const s = useProgress()
  const done = (ids: string[]) => ids.length > 0 && ids.every((id) => s.completedSteps[id])
  return (
    <div>
      <h1>Module 1 · Causal AR(1) → noncausal GMRF</h1>
      <p className="muted">Lectures 7, 9, 10, 11 (book 3.3, 4.1–4.6). Exam targets: 2021 Q3, 2025 P1, 2022 Q2. Pathway: prerequisites → intuition → visualization → derivation → worked example → guided practice → independent problem → original exam question → feedback.</p>
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
