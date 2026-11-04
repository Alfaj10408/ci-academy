/**
 * Server-side render smoke test: renders every page and every module step with react-dom/server
 * so runtime errors (bad KaTeX strings, undefined data, hook misuse at mount) surface without a browser.
 * Run: bun --preload ./scripts/css-stub.ts scripts/ssr-smoke.tsx
 */
import { renderToString } from 'react-dom/server'
import { createElement as h } from 'react'

const g = globalThis as unknown as Record<string, unknown>
g.location = { hash: '' }
g.addEventListener = () => {}
g.removeEventListener = () => {}

const { App } = await import('../src/App')
const { PrereqStep } = await import('../src/modules/ar-gmrf/Prereqs')
const { Intuition } = await import('../src/modules/ar-gmrf/Intuition')
const { Lab } = await import('../src/modules/ar-gmrf/Lab')
const { Derivation } = await import('../src/modules/ar-gmrf/Derivation')
const { Worked } = await import('../src/modules/ar-gmrf/Worked')
const { Guided } = await import('../src/modules/ar-gmrf/Guided')
const { Independent } = await import('../src/modules/ar-gmrf/Independent')
const { Exam } = await import('../src/modules/ar-gmrf/Exam')
const { Feedback } = await import('../src/modules/ar-gmrf/Feedback')
const S = {
  PrereqStep: (await import('../src/modules/surrogate/Prereqs')).PrereqStep, Intuition: (await import('../src/modules/surrogate/Intuition')).Intuition,
  Lab: (await import('../src/modules/surrogate/Lab')).Lab, Derivation: (await import('../src/modules/surrogate/Derivation')).Derivation,
  Worked: (await import('../src/modules/surrogate/Worked')).Worked, Guided: (await import('../src/modules/surrogate/Guided')).Guided,
  Independent: (await import('../src/modules/surrogate/Independent')).Independent, Exam: (await import('../src/modules/surrogate/Exam')).Exam,
  Feedback: (await import('../src/modules/surrogate/Feedback')).Feedback,
}
const M3 = {
  PrereqStep: (await import('../src/modules/mapopt/Prereqs')).PrereqStep, Intuition: (await import('../src/modules/mapopt/Intuition')).Intuition,
  Lab: (await import('../src/modules/mapopt/Lab')).Lab, Derivation: (await import('../src/modules/mapopt/Derivation')).Derivation,
  Worked: (await import('../src/modules/mapopt/Worked')).Worked, Guided: (await import('../src/modules/mapopt/Guided')).Guided,
  Independent: (await import('../src/modules/mapopt/Independent')).Independent, Exam: (await import('../src/modules/mapopt/Exam')).Exam,
  Feedback: (await import('../src/modules/mapopt/Feedback')).Feedback,
}
const M4 = {
  PrereqStep: (await import('../src/modules/prox/Prereqs')).PrereqStep, Intuition: (await import('../src/modules/prox/Intuition')).Intuition,
  Lab: (await import('../src/modules/prox/Lab')).Lab, Derivation: (await import('../src/modules/prox/Derivation')).Derivation,
  Worked: (await import('../src/modules/prox/Worked')).Worked, Guided: (await import('../src/modules/prox/Guided')).Guided,
  Independent: (await import('../src/modules/prox/Independent')).Independent, Exam: (await import('../src/modules/prox/Exam')).Exam,
  Feedback: (await import('../src/modules/prox/Feedback')).Feedback,
}
const { Exams } = await import('../src/pages/Exams')
const { Prereqs } = await import('../src/pages/Prereqs')

const cases: [string, () => string][] = [
  ['home', () => renderToString(h(App))],
  ['lectures', () => { g.location = { hash: '#/lectures' }; return renderToString(h(App)) }],
  ['prereqs', () => renderToString(h(Prereqs, {}))],
  ['exams list', () => renderToString(h(Exams, {}))],
  ...['2021-Q2', '2021-Q3', '2021-Q4', '2022-Q2', '2022-Q3', '2022-Q4', '2023-P1', '2023-P2', '2023-P3', '2024-P1', '2024-P2', '2024-P3', '2025-P1', '2025-P2', '2025-P3', '2025-P4'].map((id): [string, () => string] => [`exam ${id}`, () => renderToString(h(Exams, { id }))]),
  ['progress', () => { g.location = { hash: '#/progress' }; return renderToString(h(App)) }],
  ['module shell', () => { g.location = { hash: '#/module/ar-gmrf' }; return renderToString(h(App)) }],
  ['step prereq', () => renderToString(h(PrereqStep))],
  ['step intuition', () => renderToString(h(Intuition))],
  ['step lab', () => renderToString(h(Lab))],
  ['step derivation', () => renderToString(h(Derivation))],
  ['step worked', () => renderToString(h(Worked))],
  ['step guided', () => renderToString(h(Guided))],
  ['step independent', () => renderToString(h(Independent))],
  ['step exam', () => renderToString(h(Exam))],
  ['step feedback', () => renderToString(h(Feedback))],
  ['module 2 shell', () => { g.location = { hash: '#/module/surrogate' }; return renderToString(h(App)) }],
  ...Object.entries(S).map(([n, C]): [string, () => string] => [`m2 ${n}`, () => renderToString(h(C))]),
  ['module 3 shell', () => { g.location = { hash: '#/module/mapopt' }; return renderToString(h(App)) }],
  ...Object.entries(M3).map(([n, C]): [string, () => string] => [`m3 ${n}`, () => renderToString(h(C))]),
  ['module 4 shell', () => { g.location = { hash: '#/module/prox' }; return renderToString(h(App)) }],
  ...Object.entries(M4).map(([n, C]): [string, () => string] => [`m4 ${n}`, () => renderToString(h(C))]),
]
let fails = 0
for (const [name, fn] of cases) {
  try {
    const html = fn()
    const katexErrors = (html.match(/katex-error/g) ?? []).length
    const nan = (html.match(/\bNaN\b/g) ?? []).length
    // raw-LaTeX leak detector: visible text (KaTeX MathML annotations and tags removed) must not contain $, \cmd, _{ or ^{
    const visible = html.replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ')
    const leaks = visible.match(/\$|\\[A-Za-z]+|[A-Za-z0-9)]_\{|[A-Za-z0-9)]\^\{/g) ?? []
    console.log(`${katexErrors || nan || leaks.length ? 'WARN' : 'ok  '} ${name}: ${html.length} chars${katexErrors ? `, ${katexErrors} katex errors` : ''}${nan ? `, ${nan} NaN` : ''}${leaks.length ? `, ${leaks.length} raw-LaTeX leaks` : ''}`)
    if (leaks.length) {
      const re = /\$|\\[A-Za-z]+|[A-Za-z0-9)]_\{|[A-Za-z0-9)]\^\{/g
      let m: RegExpExecArray | null, n = 0
      while ((m = re.exec(visible)) && n++ < 4) console.log('      leak:', visible.slice(Math.max(0, m.index - 30), m.index + 40).replace(/\s+/g, ' '))
    }
    if (katexErrors) {
      const m = html.match(/katex-error[^>]*title="([^"]{0,160})/g)
      m?.slice(0, 3).forEach((x) => console.log('     ', x.replace(/&quot;/g, '"')))
    }
  } catch (e) {
    fails++
    console.log(`FAIL ${name}: ${(e as Error).message}`)
  }
}
console.log(fails ? `${fails} FAILED` : 'ALL RENDERED')
