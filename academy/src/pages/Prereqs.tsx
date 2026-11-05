import { useState, type ReactNode } from 'react'
import { prereqs, prereqGroups, type PrereqGroup } from '../data/prereqs'
import { MathText } from '../components/Tex'
import { Choice } from '../components/ui'
import { widgets } from '../components/prereq-widgets'
import { Thumb } from '../components/Art'
import { useProgress, tagStats } from '../store/progress'

const groupArt: Record<PrereqGroup, string> = { 'Signals and systems': 'topic-signals', 'Probability and Gaussian models': 'topic-probability', 'Linear algebra and calculus': 'topic-convolution', 'Graphs and Markov random fields': 'dashboard-feature', 'Optimization': 'topic-optimization' }

const blurb: Record<PrereqGroup, string> = {
  'Signals and systems': 'Deltas, filters, spectra, and why a convolution is secretly a matrix. Lectures 5, 7, 8, 10, 13.',
  'Probability and Gaussian models': 'The bowl-shaped density and how to read a predictor off the precision matrix. Lectures 6, 9–11.',
  'Linear algebra and calculus': 'Gradients of quadratics, eigenvalues as stiffness, parabolas that kiss a curve, and the five shapes you sketch. Lectures 12–19, 23.',
  'Graphs and Markov random fields': 'Pixels as people, neighbours as friends, springs on every edge. Lectures 9, 10, 15, 16.',
  'Optimization': 'Valleys, kinks, prices and contractions. Lectures 15–17, 21–25.',
}

export function Prereqs({ id }: { id?: string }) {
  const prog = useProgress()
  const stats = tagStats(prog)
  const single = id ? prereqs.find((p) => p.id === id) : undefined
  const [tab, setTab] = useState<PrereqGroup>(single?.group ?? prereqGroups[0])
  const isDone = (pid: string) => !!prog.completedSteps[`prereqs/${pid}`]
  const withCheck = prereqs.filter((p) => p.check)
  const doneCount = withCheck.filter((p) => isDone(p.id)).length
  const list = single ? [single] : prereqs.filter((p) => p.group === tab)
  return (
    <div>
      <h1>Refreshers</h1>
      <p className="muted">Each card is a two-minute refresher: one picture in words, something to play with, the few lines of math you must be able to write, and a quick check. The long version is folded away. Right/wrong counts on your checks feed the weakness page.</p>
      <div className="progress-strip" aria-label="self-checks done"><div style={{ width: `${(100 * doneCount) / Math.max(1, withCheck.length)}%` }} /></div>
      <div className="small muted">{doneCount} of {withCheck.length} self-checks passed</div>
      {single
        ? <p><a href="#/prereqs">← all refreshers</a></p>
        : (
          <div className="tabs">
            {prereqGroups.map((g) => {
              const items = prereqs.filter((p) => p.group === g && p.check)
              const done = items.length > 0 && items.every((p) => isDone(p.id))
              return <button key={g} className={`${g === tab ? 'active' : ''} ${done ? 'done' : ''}`} onClick={() => setTab(g)}>{g}</button>
            })}
          </div>
        )}
      {!single && <div className="intro-row"><Thumb src={groupArt[tab]} className="intro-thumb" /><p className="muted">{blurb[tab]}</p></div>}
      <div className="lesson-list">
        {list.map((p) => {
          const st = stats[p.id]
          const W = p.widget ? widgets[p.widget] : undefined
          return (
            <article className={`lesson ${isDone(p.id) ? 'done' : ''}`} key={p.id} id={p.id}>
              <h3>{p.name}</h3>
              <div className="small muted">Lectures {p.lectures.join(', ')}{p.dependsOn && <> · builds on {p.dependsOn.map((d) => <a key={d} href={`#/prereqs/${d}`}>{prereqs.find((x) => x.id === d)?.name}</a>).reduce<ReactNode[]>((acc, el, i) => (i ? [...acc, ', ', el] : [el]), [])}</>}</div>
              <div className="hook"><MathText>{p.hook}</MathText></div>
              {W && W()}
              <ul className="mathlist">{p.bullets.map((b, i) => <li key={i}><MathText>{b}</MathText></li>)}</ul>
              {p.why && <MathText className="why">{`Why it matters: ${p.why}`}</MathText>}
              {p.check && <Choice id={`prereqs/${p.id}`} module="prereqs" tags={[p.id]} mode="prereq" question={p.check.question} options={p.check.options} answer={p.check.answer} explain={p.check.explain} />}
              <details><summary>Full lesson</summary><MathText>{p.lesson}</MathText></details>
              {st && <span className={`pill ${st.wrong > st.right ? 'pill-warn' : 'pill-ok'}`}>{st.right} right · {st.wrong} wrong</span>}
            </article>
          )
        })}
      </div>
    </div>
  )
}
