import { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { Lectures } from './pages/Lectures'
import { Exams } from './pages/Exams'
import { Prereqs } from './pages/Prereqs'
import { Progress } from './pages/Progress'
import ArGmrfModule from './modules/ar-gmrf'
import SurrogateModule from './modules/surrogate'
import MapOptModule from './modules/mapopt'
import ProxModule from './modules/prox'

export type Route = { page: string; arg?: string }

export function useRoute(): Route {
  const parse = () => {
    const h = location.hash.replace(/^#\/?/, '')
    const [page, arg] = h.split('/')
    return { page: page || 'home', arg }
  }
  const [r, setR] = useState<Route>(parse)
  useEffect(() => {
    const f = () => setR(parse())
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return r
}

export const go = (page: string, arg?: string) => { location.hash = `#/${page}${arg ? '/' + arg : ''}` }

const nav = [
  ['home', 'Home'], ['lectures', 'Lecture navigator'], ['prereqs', 'Prerequisite map'], ['exams', 'Exam trainer'], ['progress', 'Progress & weaknesses'],
]

export function App() {
  const r = useRoute()
  let body
  switch (r.page) {
    case 'lectures': body = <Lectures />; break
    case 'prereqs': body = <Prereqs id={r.arg} />; break
    case 'exams': body = <Exams id={r.arg} />; break
    case 'progress': body = <Progress />; break
    case 'module': body = r.arg === 'ar-gmrf' ? <ArGmrfModule /> : r.arg === 'surrogate' ? <SurrogateModule /> : r.arg === 'mapopt' ? <MapOptModule /> : r.arg === 'prox' ? <ProxModule /> : <p>Module not built yet.</p>; break
    default: body = <Home />
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand" onClick={() => go('home')}>CI Academy<small>ECE 60141 · Bouman</small></div>
        <nav>
          {nav.map(([p, l]) => <a key={p} className={r.page === p ? 'active' : ''} href={`#/${p}`}>{l}</a>)}
          <div className="nav-group">Modules</div>
          <a className={r.page === 'module' && r.arg === 'ar-gmrf' ? 'active' : ''} href="#/module/ar-gmrf">1 · Causal AR → noncausal GMRF</a>
          <a className={r.page === 'module' && r.arg === 'surrogate' ? 'active' : ''} href="#/module/surrogate">2 · Surrogate functions & MM</a>
          <a className={r.page === 'module' && r.arg === 'mapopt' ? 'active' : ''} href="#/module/mapopt">3 · MAP, gradient descent, ICD</a>
          <a className={r.page === 'module' && r.arg === 'prox' ? 'active' : ''} href="#/module/prox">4 · Proximal maps, ADMM, PnP</a>
          <a className="disabled">3 · MAP & ICD (planned)</a>
          <a className="disabled">4 · Proximal maps & ADMM (planned)</a>
        </nav>
      </aside>
      <main className="content">{body}</main>
    </div>
  )
}
