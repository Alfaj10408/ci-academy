import type { ReactNode } from 'react'
import { prereqs } from '../data/prereqs'
import { MathText } from '../components/Tex'
import { useProgress, tagStats } from '../store/progress'

export function Prereqs({ id }: { id?: string }) {
  const stats = tagStats(useProgress())
  const list = id ? prereqs.filter((p) => p.id === id) : prereqs
  return (
    <div>
      <h1>Mathematical prerequisite map</h1>
      <p className="muted">Each prerequisite is a short targeted lesson. Arrows show what depends on what; counts show your right/wrong attempts tagged with it.</p>
      {id && <a href="#/prereqs">← all prerequisites</a>}
      <div className="cards" style={{ marginTop: 12 }}>
        {list.map((p) => {
          const st = stats[p.id]
          return (
            <div className="card" key={p.id} id={p.id}>
              <h3>{p.name}</h3>
              <div className="small muted">Lectures {p.lectures.join(', ')}{p.dependsOn && <> · needs {p.dependsOn.map((d) => <a key={d} href={`#/prereqs/${d}`}>{prereqs.find((x) => x.id === d)?.name}</a>).reduce<ReactNode[]>((acc, el, i) => (i ? [...acc, ', ', el] : [el]), [])}</>}</div>
              <MathText>{p.lesson}</MathText>
              {st && <span className={`pill ${st.wrong > st.right ? 'pill-warn' : 'pill-ok'}`}>{st.right} right · {st.wrong} wrong</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
