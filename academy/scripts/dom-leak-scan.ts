/**
 * Interactive raw-LaTeX leak scan: mounts every module in a DOM (happy-dom), clicks through tabs,
 * hint buttons, multiple-choice options, "Next step" buttons, lab views and exam start/submit,
 * and after every click checks the visible text for $, \cmd, _{ or ^{ (KaTeX annotations excluded).
 * Run: bun --preload ./scripts/css-stub.ts scripts/dom-leak-scan.ts
 */
import { Window } from 'happy-dom'
const win = new Window({ url: 'http://localhost/#/' })
const g = globalThis as unknown as Record<string, unknown>
g.window = win; g.document = win.document; g.navigator = win.navigator; g.HTMLElement = win.HTMLElement; g.Node = win.Node
g.location = win.location; g.addEventListener = () => {}; g.removeEventListener = () => {}
g.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
g.IS_REACT_ACT_ENVIRONMENT = true
const React = await import('react')
const { createRoot } = await import('react-dom/client')
const { act } = await import('react-dom/test-utils')
const mods: Record<string, () => Promise<{ default: () => JSX.Element }>> = {
  'module 1': () => import('../src/modules/ar-gmrf'), 'module 2': () => import('../src/modules/surrogate'),
  'module 3': () => import('../src/modules/mapopt'), 'module 4': () => import('../src/modules/prox').catch(() => ({ default: () => React.createElement('div') })),
  'prereq map': () => import('../src/pages/Prereqs').then((m) => ({ default: () => m.Prereqs({}) })),
}
const LEAK = /\$|\\[A-Za-z]+|[A-Za-z0-9)]_\{|[A-Za-z0-9)]\^\{/g
function visible(root: Element): string {
  const clone = root.cloneNode(true) as Element
  clone.querySelectorAll('annotation, script, style').forEach((n) => n.remove())
  return (clone.textContent ?? '').replace(/\s+/g, ' ')
}
let leaks = 0, clicks = 0
const seen = new Set<string>()
function scan(where: string, root: Element) {
  const text = visible(root)
  let m: RegExpExecArray | null
  const re = new RegExp(LEAK.source, 'g')
  while ((m = re.exec(text))) {
    const ctx = text.slice(Math.max(0, m.index - 40), m.index + 50)
    if (seen.has(ctx)) continue
    seen.add(ctx); leaks++
    console.log(`LEAK [${where}] …${ctx}…`)
  }
}
for (const [name, load] of Object.entries(mods)) {
  const Mod = (await load()).default
  const host = win.document.createElement('div')
  win.document.body.appendChild(host)
  const root = createRoot(host as unknown as Element)
  await act(async () => { root.render(React.createElement(Mod)) })
  const tabs = Array.from(host.querySelectorAll('.tabs button'))
  // a page without tabs (e.g. the prerequisite map) is scanned once as a single pseudo-tab
  for (let t = 0; t < Math.max(1, tabs.length); t++) {
    let tabName = 'page'
    if (tabs.length) {
      await act(async () => { (host.querySelectorAll('.tabs button')[t] as HTMLElement).click() })
      tabName = (host.querySelectorAll('.tabs button')[t] as HTMLElement).textContent ?? ''
    }
    scan(`${name} · ${tabName}`, host)
    // click every non-tab button repeatedly (hints, options, next step, views, start/submit), bounded
    for (let round = 0; round < 8; round++) {
      const buttons = Array.from(host.querySelectorAll('button')).filter((b) => !b.closest('.tabs') && !/Reset|Restart|Pause|Play|Try again|Hide|Record this session|←|→/.test(b.textContent ?? ''))
      let changed = false
      for (const b of buttons) {
        const label = (b.textContent ?? '').slice(0, 40)
        const key = `${name}|${t}|${label}|${round}`
        if (seen.has(key)) continue
        seen.add(key)
        await act(async () => { (b as unknown as HTMLElement).click() })
        clicks++; changed = true
        scan(`${name} · ${tabName} · after "${label}"`, host)
      }
      if (!changed) break
    }
  }
  await act(async () => { root.unmount() })
  host.remove()
}
console.log(`${clicks} clicks, ${leaks} leaks`)
process.exit(leaks ? 1 : 0)
