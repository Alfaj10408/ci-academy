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
import { useProgress, recommend } from './store/progress'
import { useTheme, theme, huePresets } from './store/theme'
import { prereqById } from './data/prereqs'
import { modules } from './data/modules'
import { art } from './components/Art'

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
  ['home', 'Home'], ['lectures', 'Lectures'], ['prereqs', 'Refreshers'], ['exams', 'Exam trainer'], ['progress', 'Progress'],
]


const SIDEBAR_KEY = 'ci-academy-sidebar'

function ThemeControls() {
  const t = useTheme()
  const [open, setOpen] = useState(false)
  const modeIcon = t.mode === 'light' ? '☀' : t.mode === 'dark' ? '☾' : '◐'
  const modeLabel = t.mode === 'light' ? 'Light theme (click for dark)' : t.mode === 'dark' ? 'Dark theme (click for system)' : 'System theme (click for light)'
  return (
    <div className="theme-controls">
      <button className="icon-btn topbar-btn" title="Accent colour" aria-label="Accent colour" onClick={() => setOpen(!open)}>
        <span className="hue-dot" />
      </button>
      <button className="icon-btn topbar-btn" title={modeLabel} aria-label={modeLabel} onClick={() => theme.cycleMode()}>{modeIcon}</button>
      {open && (
        <div className="float-panel hue-panel">
          <div className="small muted">Accent hue · {t.hue}°</div>
          <input className="hue-range" type="range" min={0} max={359} value={t.hue} onChange={(e) => theme.setHue(parseInt(e.target.value, 10))} aria-label="accent hue" />
          <div className="row">
            {huePresets.map((p) => <button key={p.name} className={`hue-preset ${p.hue === t.hue ? 'active' : ''}`} style={{ ['--preset-hue' as string]: p.hue }} title={p.name} onClick={() => theme.setHue(p.hue)} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export function App() {
  const r = useRoute()
  const s = useProgress()
  const [collapsed, setCollapsed] = useState<boolean>(() => { try { return localStorage.getItem(SIDEBAR_KEY) === '1' } catch { return false } })
  const [drawer, setDrawer] = useState(false)
  useEffect(() => { theme.init() }, [])
  useEffect(() => { try { localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0') } catch { /* ignore */ } }, [collapsed])
  useEffect(() => { setDrawer(false) }, [r.page, r.arg])

  let body
  switch (r.page) {
    case 'lectures': body = <Lectures />; break
    case 'prereqs': body = <Prereqs id={r.arg} />; break
    case 'exams': body = <Exams id={r.arg} />; break
    case 'progress': body = <Progress />; break
    case 'module': body = r.arg === 'ar-gmrf' ? <ArGmrfModule /> : r.arg === 'surrogate' ? <SurrogateModule /> : r.arg === 'mapopt' ? <MapOptModule /> : r.arg === 'prox' ? <ProxModule /> : <p>Module not built yet.</p>; break
    default: body = <Home />
  }
  const doneIn = (id: string) => Object.keys(s.completedSteps).filter((k) => k.startsWith(`${id}/`)).length
  const rec = recommend(s)
  const totalDone = Object.keys(s.completedSteps).length

  return (
    <div className={`app ${collapsed ? 'sidebar-collapsed' : ''} ${drawer ? 'drawer-open' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <button className="icon-btn topbar-btn menu-btn" aria-label="Toggle navigation" title="Toggle navigation" onClick={() => { if (matchMedia('(max-width: 900px)').matches) setDrawer(!drawer); else setCollapsed(!collapsed) }}>☰</button>
          <a className="brand" href="#/home"><span className="brand-mark">CI</span><span className="brand-text">Academy<small>ECE 60141 · Computational Imaging</small></span></a>
          <nav className="topnav">
            {nav.map(([p, l]) => <a key={p} className={r.page === p ? 'active' : ''} href={`#/${p}`}>{l}</a>)}
          </nav>
          <ThemeControls />
        </div>
      </header>
      <div className="shell">
        <aside className="sidebar card-base">
          <div className="side-section">
            <div className="nav-group">Learning modules</div>
            {modules.map((m) => {
              const active = r.page === 'module' && r.arg === m.id
              const n = doneIn(m.id)
              return (
                <a key={m.id} className={`side-link ${active ? 'active' : ''}`} href={`#/module/${m.id}`}>
                  <span className="side-num">{m.n}</span>
                  <span className="side-text">{m.title}<small>Lectures {m.lectures}{n > 0 ? ` · ${n} steps done` : ''}</small></span>
                </a>
              )
            })}
          </div>
          <div className="side-section">
            <div className="nav-group">Pages</div>
            {nav.map(([p, l]) => <a key={p} className={`side-link ${r.page === p ? 'active' : ''}`} href={`#/${p}`}><span className="side-text">{l}</span></a>)}
          </div>
          <div className="side-section side-progress">
            <div className="nav-group">Your progress</div>
            <img className="avatar" src={art('profile-avatar')} alt="" loading="lazy" decoding="async" aria-hidden="true" />
            <div className="small">{totalDone} steps · {s.attempts.length} attempts · {s.examSessions.filter((e) => e.finishedAt).length} exams</div>
            {rec && <div className="small muted">Next: <a href={`#/prereqs/${rec.id}`}>{prereqById[rec.id]?.name ?? rec.id}</a></div>}
          </div>
        </aside>
        {drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)} />}
        <main className="content card-base onload" key={`${r.page}/${r.arg ?? ''}`}>{body}</main>
      </div>
      <footer className="footer small muted" style={{ backgroundImage: `url(${art('subtle-waves-background')})` }}>CI Academy · built from the ECE 60141 lectures, midterm keys and <em>Foundations of Computational Imaging</em>. Theme tokens adapted from <a href="https://github.com/saicaca/fuwari" target="_blank" rel="noreferrer">Fuwari</a> (MIT).</footer>
    </div>
  )
}
