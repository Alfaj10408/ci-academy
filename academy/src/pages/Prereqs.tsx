import type { ReactNode } from 'react'
import { prereqs, prereqGroups } from '../data/prereqs'
import { MathText } from '../components/Tex'
import { Choice } from '../components/ui'
import { useProgress, tagStats } from '../store/progress'

export function Prereqs({ id }: { id?: string }) {
  const stats = tagStats(useProgress())
  const list = id ? prereqs.filter((p) => p.id === id) : prereqs
  const groups = prereqGroups.filter((g) => list.some((p) => p.group === g))
  return (
    <div>
      <h1>Mathematical prerequisite map</h1>
      <p className="muted">Each prerequisite is a short targeted lesson grounded in the lecture slides and the book. “Needs” links show what depends on what; counts show your right/wrong attempts tagged with it. Lessons with a self-check question record an attempt under the lesson’s tag, so weak spots show up on the progress page.</p>
      {id && <a href="#/prereqs">← all prerequisites</a>}
      {groups.map((g) => (
        <section key={g}>
          <h2 style={{ marginTop: 18 }}>{g}</h2>
          <div className="cards">
            {list.filter((p) => p.group === g).map((p) => {
              const st = stats[p.id]
              return (
                <div className="card" key={p.id} id={p.id}>
                  <h3>{p.name}</h3>
                  <div className="small muted">Lectures {p.lectures.join(', ')}{p.dependsOn && <> · needs {p.dependsOn.map((d) => <a key={d} href={`#/prereqs/${d}`}>{prereqs.find((x) => x.id === d)?.name}</a>).reduce<ReactNode[]>((acc, el, i) => (i ? [...acc, ', ', el] : [el]), [])}</>}</div>
                  <MathText>{p.lesson}</MathText>
                  {p.check && <Choice id={`prereqs/${p.id}`} module="prereqs" tags={[p.id]} mode="prereq" question={p.check.question} options={p.check.options} answer={p.check.answer} explain={p.check.explain} />}
                  {st && <span className={`pill ${st.wrong > st.right ? 'pill-warn' : 'pill-ok'}`}>{st.right} right · {st.wrong} wrong</span>}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
