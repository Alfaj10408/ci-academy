import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useMemo } from 'react'

/**
 * JSX attribute strings (question="…\\omega…") keep their backslashes doubled, unlike JS string literals.
 * A doubled backslash before a letter is never intended LaTeX in this app (it would be a line break), so fold it.
 */
export const unescape = (s: string) => s.replace(/\\\\(?=[A-Za-z#{}|])/g, '\\')

export function Tex({ children, block = false, className }: { children: string; block?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(unescape(children), { displayMode: block, throwOnError: false, strict: 'ignore' })
    } catch {
      return children
    }
  }, [children, block])
  return block ? <div className={className} dangerouslySetInnerHTML={{ __html: html }} /> : <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Render a paragraph with $…$ inline math segments. */
export function MathText({ children, className }: { children: string; className?: string }) {
  const parts = children.split(/(\$[^$]+\$)/g)
  return (
    <p className={className}>
      {parts.map((p, i) => (p.startsWith('$') && p.endsWith('$') ? <Tex key={i}>{p.slice(1, -1)}</Tex> : <span key={i}>{p}</span>))}
    </p>
  )
}

export const fmt = (v: number, d = 3) => (Number.isFinite(v) ? v.toFixed(d).replace(/\.?0+$/, '') : '—')
