import { moduleNames } from '../data/course'
import { useState } from 'react'
import { exams, examById, patterns } from '../data/exams'
import { prereqById } from '../data/prereqs'
import { MathText } from '../components/Tex'
import { Callout } from '../components/ui'

export function Exams({ id }: { id?: string }) {
  if (id && examById[id]) return <Question q={examById[id]} />
  const years = [...new Set(exams.map((q) => q.year))].sort()
  return (
    <div>
      <h1>Past midterm exam trainer</h1>
      <p className="muted">Original wording preserved from the midterm PDFs. All five papers come with the instructor’s key; where text extraction garbled a matrix, the app recomputes it numerically and says so.</p>
      <h2>Repeated patterns</h2>
      <table>
        <thead><tr><th>Pattern</th><th>Questions</th><th>Years</th></tr></thead>
        <tbody>
          {Object.entries(patterns).map(([k, name]) => {
            const qs = exams.filter((q) => q.pattern === k)
            return <tr key={k}><td>{name}</td><td>{qs.map((q) => <a key={q.id} className="pill" href={`#/exams/${q.id}`}>{q.id}</a>)}</td><td>{new Set(qs.map((q) => q.year)).size}/5</td></tr>
          })}
        </tbody>
      </table>
      {years.map((y) => (
        <div key={y}>
          <h2>Midterm {y}</h2>
          <table>
            <thead><tr><th>Q</th><th>Title</th><th>Pts</th><th>Lectures</th><th>Prerequisites</th><th>Pathway</th></tr></thead>
            <tbody>
              {exams.filter((q) => q.year === y).map((q) => (
                <tr key={q.id}>
                  <td><a href={`#/exams/${q.id}`}>{q.number}</a></td><td>{q.title}</td><td>{q.points}</td>
                  <td>{q.lectures.join(', ')}</td>
                  <td>{q.prereqs.map((p) => <a key={p} className="pill" href={`#/prereqs/${p}`}>{prereqById[p]?.name}</a>)}</td>
                  <td>{q.module ? <a href={`#/module/${q.module}`}>{moduleNames[q.module]}</a> : <span className="muted small">key only</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function Question({ q }: { q: (typeof exams)[number] }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <a href="#/exams">← all questions</a>
      <h1>Midterm {q.year} · {q.number} · {q.title} <span className="pill">{q.points} pt</span></h1>
      <p className="small muted">Lectures {q.lectures.join(', ')} · pattern: {patterns[q.pattern]} · solution: {q.solutionStatus.replace(/-/g, ' ')}</p>
      <Callout title="Original wording"><MathText>{q.wording}</MathText></Callout>
      <ol>
        {q.parts.map((p) => <li key={p.id}><strong>{p.id}.</strong> <MathText>{p.prompt}</MathText></li>)}
      </ol>
      <div className="row">
        {q.module && <a className="btn" style={{ textDecoration: 'none' }} href={`#/module/${q.module}`}>Guided pathway ({moduleNames[q.module]})</a>}
        {q.module && <a className="btn btn-ghost" style={{ textDecoration: 'none' }} href={`#/module/${q.module}`}>Timed exam mode is inside the module</a>}
        <button className="btn btn-ghost" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'} instructor key</button>
      </div>
      {show && (
        <div className="card" style={{ marginTop: 12 }}>
          {q.notes && <Callout kind="warn" title="Provenance note">{q.notes}</Callout>}
          {q.parts.map((p) => q.key[p.id] && <div key={p.id}><strong>{p.id}.</strong> <MathText>{q.key[p.id]}</MathText></div>)}
        </div>
      )}
    </div>
  )
}
