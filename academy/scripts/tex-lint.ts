/**
 * Static KaTeX lint: every $…$ segment inside a string literal of the source tree (hints, solutions,
 * exam keys, lecture ideas: including text only shown after interaction) is rendered with
 * throwOnError so parse errors surface without clicking through the app.
 * Run: bun --preload ./scripts/css-stub.ts scripts/tex-lint.ts
 */
import katex from 'katex'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { unescape } from '../src/components/Tex'

function walk(d: string, out: string[] = []) {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p) && !/math\/latex\.ts$/.test(p)) out.push(p)
  }
  return out
}
let bad = 0, total = 0
for (const f of walk('src')) {
  const src = readFileSync(f, 'utf8')
  const lit = /'((?:\\.|[^'\\\n])*)'|"((?:\\.|[^"\\\n])*)"/g
  let m: RegExpExecArray | null
  while ((m = lit.exec(src))) {
    const line = src.slice(0, m.index).split('\n').length
    const isAttr = m[2] !== undefined && /[A-Za-z]=$/.test(src.slice(Math.max(0, m.index - 12), m.index))
    let s = m[1] ?? m[2]
    if (!isAttr) s = s.replace(/\\(.)/g, (_, c) => (c === 'n' ? '\n' : c))
    for (const seg of s.match(/\$[^$]+\$/g) ?? []) {
      if (/\$\d/.test(seg)) continue // regex replacement templates
      total++
      try {
        katex.renderToString(unescape(seg.slice(1, -1)), { throwOnError: true, strict: 'ignore' })
      } catch (e) {
        bad++
        console.log(`KATEX ${f}:${line}: ${seg.slice(0, 120)} :: ${(e as Error).message.slice(0, 100)}`)
      }
    }
  }
}
console.log(`${total} math segments checked, ${bad} KaTeX failures`)
process.exit(bad ? 1 : 0)
