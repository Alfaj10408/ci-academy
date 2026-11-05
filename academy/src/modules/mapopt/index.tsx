import { useState } from 'react'
import { useProgress } from '../../store/progress'
import { Banner } from '../../components/Art'
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
  { key: 'prereq', label: 'Prerequisites', ids: ['mapopt/pre/grad', 'mapopt/pre/bayes', 'mapopt/pre/eig', 'mapopt/pre/linesearch'], view: () => <PrereqStep /> },
  { key: 'intuition', label: 'Intuition', ids: ['mapopt/intuition/check'], view: () => <Intuition /> },
  { key: 'lab', label: 'Visual lab', ids: ['mapopt/lab/check1', 'mapopt/lab/check2'], view: () => <Lab /> },
  { key: 'derivation', label: 'Derivation', ids: [], view: () => <Derivation /> },
  { key: 'worked', label: 'Worked examples', ids: ['mapopt/worked/q4-grad', 'mapopt/worked/q4-b', 'mapopt/worked/q4-c', 'mapopt/worked/q4-B', 'mapopt/worked/q4-a', 'mapopt/worked/q4-update'], view: () => <Worked /> },
  { key: 'guided', label: 'Guided practice', ids: ['mapopt/guided/a', 'mapopt/guided/b', 'mapopt/guided/b2', 'mapopt/guided/c', 'mapopt/guided/d', 'mapopt/guided/e'], view: () => <Guided /> },
  { key: 'independent', label: 'Independent problem', ids: ['mapopt/indep/grad1', 'mapopt/indep/grad2', 'mapopt/indep/xhat1', 'mapopt/indep/xhat2', 'mapopt/indep/alphamax', 'mapopt/indep/icd', 'mapopt/indep/ls', 'mapopt/indep/noblur', 'mapopt/indep/beta'], view: () => <Independent /> },
  { key: 'exam', label: 'Exam: 2023 P2 / 2021 Q2', ids: ['mapopt/exam/2023-P2'], view: () => <Exam /> },
  { key: 'feedback', label: 'Feedback', ids: [], view: () => <Feedback /> },
]

export default function MapOptModule() {
  const [i, setI] = useState(0)
  const s = useProgress()
  const done = (ids: string[]) => ids.length > 0 && ids.every((id) => s.completedSteps[id])
  return (
    <div>
      <h1>Module 3 · MAP estimation, gradient descent and ICD</h1>
      <p className="muted">Lectures 12, 13, 14 (book 5.1–5.5). Exam targets: 2021 Q2, 2023 P2, 2024 P1, and 2022 Q4 in full. Pathway: prerequisites → intuition → visualization → derivation → worked examples → guided practice → independent problem → original exam question → feedback.</p>
      <div className="tabs">
        {steps.map((st, k) => <button key={st.key} className={`${k === i ? 'active' : ''} ${done(st.ids) ? 'done' : ''}`} onClick={() => setI(k)}>{k + 1}. {st.label}</button>)}
      </div>
      {steps[i].key === 'lab' && <Banner src="visual-lab-strip" height={110} position="center 55%" className="lab-banner" />}
      {steps[i].view()}
      <div className="row" style={{ marginTop: 24 }}>
        {i > 0 && <button className="btn btn-ghost" onClick={() => setI(i - 1)}>← {steps[i - 1].label}</button>}
        {i < steps.length - 1 && <button className="btn" onClick={() => setI(i + 1)}>{steps[i + 1].label} →</button>}
      </div>
    </div>
  )
}
