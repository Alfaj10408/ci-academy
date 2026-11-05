import { moduleNames } from '../data/course'
import { lectures } from '../data/course'
import { exams } from '../data/exams'
import { MathText } from '../components/Tex'
import { Thumb } from '../components/Art'

export function Lectures() {
  return (
    <div>
      <div className="intro-row"><Thumb src="topic-fourier-spectrum" className="intro-thumb" /><div><h1>Lecture navigator</h1>
      <p className="muted">Lectures 5–25 with chapter references, core ideas, and the midterm questions that depend on each lecture.</p></div></div>
      <table>
        <thead><tr><th>Lec</th><th>Title</th><th>Book</th><th>Core ideas</th><th>Exam questions</th><th>Module</th></tr></thead>
        <tbody>
          {lectures.map((l) => {
            const qs = exams.filter((q) => q.lectures.includes(l.n))
            return (
              <tr key={l.n}>
                <td>{l.n}</td>
                <td><strong>{l.title}</strong></td>
                <td>{l.chapter}</td>
                <td>{l.ideas.map((i, k) => <MathText key={k} className="small">{i}</MathText>)}</td>
                <td>{qs.map((q) => <a key={q.id} href={`#/exams/${q.id}`} className="pill">{q.id}</a>)}</td>
                <td>{l.module ? <a href={`#/module/${l.module}`}>{moduleNames[l.module]}</a> : <span className="muted small">planned</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
