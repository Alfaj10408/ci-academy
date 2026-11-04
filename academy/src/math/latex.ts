/**
 * Light normalizer: accepts plain math, LaTeX-flavoured math, or Unicode symbols and
 * returns mathjs syntax. Not a full LaTeX parser; covers what this course's answers need.
 * Symbols: ω→w, ρ→rho, σ_C²→sc2, σ_NC²→snc2, j→i (imaginary), |x|→abs(x), \frac{a}{b}→((a)/(b)).
 */

/** Read one {...} group starting at index i (s[i] must be '{'); returns [content, indexAfter]. */
function group(s: string, i: number): [string, number] | null {
  if (s[i] !== '{') return null
  let depth = 0
  for (let k = i; k < s.length; k++) {
    if (s[k] === '{') depth++
    else if (s[k] === '}') {
      depth--
      if (depth === 0) return [s.slice(i + 1, k), k + 1]
    }
  }
  return null
}

function replaceFrac(s: string): string {
  for (let guard = 0; guard < 50; guard++) {
    const at = s.indexOf('\\frac')
    if (at < 0) return s
    let i = at + 5
    while (s[i] === ' ') i++
    const g1 = group(s, i)
    if (!g1) return s.replace('\\frac', '')
    let j = g1[1]
    while (s[j] === ' ') j++
    const g2 = group(s, j)
    if (!g2) return s.replace('\\frac', '')
    s = s.slice(0, at) + `((${g1[0]})/(${g2[0]}))` + s.slice(g2[1])
  }
  return s
}

function replaceSqrt(s: string): string {
  for (let guard = 0; guard < 50; guard++) {
    const at = s.indexOf('\\sqrt')
    if (at < 0) return s
    const g = group(s, at + 5)
    if (!g) return s.replace('\\sqrt', 'sqrt')
    s = s.slice(0, at) + `sqrt(${g[0]})` + s.slice(g[1])
  }
  return s
}

export function normalize(input: string): string {
  let s = input.trim()
  s = s.replace(/\$/g, '')
  s = s.replace(/\\(operatorname|mathrm|text)\s*\{\s*sign\s*\}/g, 'sign')
  s = s.replace(/\\left|\\right|\\,|\\;|\\!|\\quad|\\mathrm|\\text/g, '')
  s = s.replace(/\\cdot|\\times/g, '*')
  s = s.replace(/²/g, '^2')
  s = replaceFrac(s)
  s = replaceSqrt(s)
  // Greek / symbols
  s = s.replace(/\\omega|ω/g, 'w')
  s = s.replace(/\\rho|ρ/g, 'rho')
  s = s.replace(/\\pi|π/g, 'pi')
  s = s.replace(/\\theta|θ/g, 'theta')
  s = s.replace(/\\Lambda|Λ/g, 'Lambda')
  s = s.replace(/\\lambda|λ/g, 'lambda')
  s = s.replace(/\\delta|δ/g, 'delta')
  // primes: x', x′, x^\prime, x^{\prime}, theta' → xp, thetap (point of approximation)
  s = s.replace(/([A-Za-z]+)\s*(?:\^\s*\{?\\prime\}?|'|′)/g, '$1p')
  s = s.replace(/\\prime/g, '')
  s = s.replace(/\bsgn\b/g, 'sign')
  // sigma variants → sc2 / snc2 / sigma2  (σ_c^2, \sigma_{NC}^2, sigma_c^2, σ_C² …)
  s = s.replace(/(\\sigma|σ|\bsigma)_\{?\s*(NC|nc)\s*\}?\s*\^\s*\{?2\}?/g, 'snc2')
  s = s.replace(/(\\sigma|σ|\bsigma)_\{?\s*(C|c)\s*\}?\s*\^\s*\{?2\}?/g, 'sc2')
  s = s.replace(/(\\sigma|σ|\bsigma)\s*\^\s*\{?2\}?/g, 'sigma2')
  // e^{...} / e^(...) → exp(...)
  s = s.replace(/\be\s*\^\s*\{([^{}]*)\}/g, 'exp($1)')
  s = s.replace(/\be\s*\^\s*\(([^()]*)\)/g, 'exp($1)')
  s = s.replace(/\\exp/g, 'exp')
  s = s.replace(/\\(cos|sin|tan|log|ln|abs|max|min|sign)/g, '$1')
  // imaginary unit: "jw" → i*w, standalone j → i
  s = s.replace(/(?<![A-Za-z_])j\s*(?=w\b)/g, 'i*')
  s = s.replace(/(?<![A-Za-z_])j(?![A-Za-z_])/g, 'i')
  // |x| → abs(x), non-nested
  s = s.replace(/\|([^|]+)\|/g, 'abs($1)')
  // remaining braces → parentheses; square brackets → parentheses
  s = s.replace(/[{[]/g, '(').replace(/[}\]]/g, ')')
  // strip a leading "g(n) =" / "S_X(w) =" label
  s = s.replace(/^[^=]*=\s*(?=[^=])/, '')
  // implicit multiplication: ")(", "2x", "rho exp(", "x y", "2(…)"
  s = s.replace(/\)\s*\(/g, ')*(')
  s = s.replace(/(\d)\s*([A-Za-z(])/g, '$1*$2')
  s = s.replace(/([A-Za-z0-9_)])\s+([A-Za-z0-9(])/g, '$1*$2')
  s = s.replace(/\)\s*([A-Za-z0-9])/g, ')*$1')
  return s.trim()
}

/* ---------------------------------------------------------------------------------------------
 * Matrix mode (Module 3): vector/matrix answers such as ∇f = −Aᵗ(y−Ax)+Bx or the ICD step.
 * Conventions: transpose is ^t, ^T or ' (mathjs postfix); the current point x′ is typed xp;
 * ‖v‖ or ||v|| is norm(v); A_{*,i} → Ai, B_{i,i} → Bii, x_i → xi; (…)^{-1} → inv(…).
 * Implicit products are resolved with the list of names known to the grading spec, so "Ax"
 * becomes A*x and "lambda x" becomes lambda*x.
 * ------------------------------------------------------------------------------------------- */

const FUNCS = new Set(['norm', 'transpose', 'inv', 'identity', 'abs', 'sqrt', 'exp', 'log', 'sign', 'max', 'min', 'dot', 'trace', 'det', 'flatten', 'cos', 'sin', 'sum', 'size', 'squeeze'])

/** (…)^{-1}, (…)^(-1), (…)^-1 and A^{-1} → inv(…) */
function replaceInverse(s: string): string {
  for (let guard = 0; guard < 50; guard++) {
    const m = /\^\s*(?:\{\s*-\s*1\s*\}|\(\s*-\s*1\s*\)|-\s*1)/.exec(s)
    if (!m) return s
    const at = m.index
    let start = at - 1
    while (start >= 0 && s[start] === ' ') start--
    if (s[start] === ')') {
      let depth = 0
      for (let k = start; k >= 0; k--) {
        if (s[k] === ')') depth++
        else if (s[k] === '(') { depth--; if (depth === 0) { start = k; break } }
      }
    } else {
      while (start > 0 && /[A-Za-z0-9]/.test(s[start - 1])) start--
    }
    s = s.slice(0, start) + `inv(${s.slice(start, at).trim()})` + s.slice(at + m[0].length)
  }
  return s
}

export function normalizeMatrix(input: string, knownNames: string[]): string {
  let s = input.trim().replace(/\$/g, '').replace(/−/g, '-').replace(/′/g, '′')
  s = s.replace(/\\(d|t)frac/g, '\\frac')
  s = s.replace(/\\frac\s*(\d)\s*(\d)/g, '\\frac{$1}{$2}')
  s = s.replace(/\\left|\\right|\\,|\;|\\!|\\quad|\\qquad|\\displaystyle|\\big|\\Big/g, '')
  s = s.replace(/\\(operatorname|mathrm|text|mathbf|boldsymbol|mathsf|hat|bar|tilde)\s*\{([^{}]*)\}/g, '$2')
  s = s.replace(/\\(hat|bar|tilde|mathbf|boldsymbol)\s*/g, '')
  s = s.replace(/\\cdot|\\times/g, '*')
  s = s.replace(/²/g, '^2')
  s = replaceFrac(s)
  s = replaceSqrt(s)
  s = s.replace(/(\\sigma|σ|\bsigma)\s*_\s*\{?\s*w\s*\}?\s*\^\s*\{?2\}?/g, 'sw2')
  s = s.replace(/(\\sigma|σ|\bsigma)\s*_\s*\{?\s*x\s*\}?\s*\^\s*\{?2\}?/g, 'sx2')
  s = s.replace(/(\\sigma|σ|\bsigma)\s*\^\s*\{?2\}?/g, 'sigma2')
  s = s.replace(/\\lambda|λ/g, 'lambda').replace(/\\beta|β/g, 'beta').replace(/\\alpha|α/g, 'alpha').replace(/\\pi|π/g, 'pi')
  s = s.replace(/\\varepsilon|\\epsilon|ε|ϵ/g, 'e')
  // current point: x′, x^\prime, x^{\prime} → xp
  s = s.replace(/([A-Za-z]+)\s*(?:\^\s*\{?\\prime\}?|′)/g, '$1p')
  // transposes → mathjs postfix '
  s = s.replace(/\^\s*\{?\s*(?:t|T|\\top|\\intercal)\s*\}?/g, "'")
  s = replaceInverse(s)
  // norms ‖v‖, \|v\|, ||v||, \lVert v \rVert → norm(v)
  s = s.replace(/\\lVert|\\rVert|\\\||‖|\|\|/g, '§')
  s = s.replace(/§([^§]+)§/g, 'norm($1)')
  s = s.replace(/\|([^|]+)\|/g, 'abs($1)')
  // subscripts: A_{*,i} → Ai, B_{i,i} / B_{ii} → Bii, x_i → xi, e_i → ei
  s = s.replace(/([A-Za-z])\s*_\s*\{?\s*(?:\*|\\ast|∗|\\cdot|:)\s*,?\s*([a-z])\s*\}?/g, '$1$2')
  s = s.replace(/([A-Za-z])\s*_\s*\{\s*([a-z])\s*,?\s*\2\s*\}/g, '$1$2$2')
  s = s.replace(/([A-Za-z]+)\s*_\s*\{?\s*([a-z0-9])\s*\}?/g, '$1$2')
  s = s.replace(/\\(cos|sin|exp|log|ln|max|min|sqrt)/g, '$1')
  s = s.replace(/[{[]/g, '(').replace(/[}\]]/g, ')')
  // strip a leading "∇f(x) =" / "α* =" label
  s = s.replace(/^[^=]*=\s*(?=[^=])/, '')
  s = s.replace(/\\nabla|∇/g, '')
  // tokenize and resolve implicit products with the known names
  const names = [...new Set([...knownNames, ...FUNCS])].sort((a, b) => b.length - a.length)
  type T = { t: 'num' | 'name' | 'func' | 'open' | 'close' | 'op' | 'tr'; v: string }
  const toks: T[] = []
  const re = /\s+|\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*|'|./g
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) {
    const w = m[0]
    if (/^\s+$/.test(w)) continue
    if (/^\d/.test(w)) toks.push({ t: 'num', v: w })
    else if (/^[A-Za-z]/.test(w)) {
      let p = 0
      while (p < w.length) {
        const hit = names.find((n) => w.startsWith(n, p))
        if (hit) { toks.push({ t: FUNCS.has(hit) ? 'func' : 'name', v: hit }); p += hit.length }
        else if (/\d/.test(w[p])) { const d = /\d+(?:\.\d+)?/.exec(w.slice(p))![0]; toks.push({ t: 'num', v: d }); p += d.length }
        else { toks.push({ t: 'name', v: w[p] }); p++ }
      }
    } else if (w === "'") toks.push({ t: 'tr', v: w })
    else if (w === '(') toks.push({ t: 'open', v: w })
    else if (w === ')') toks.push({ t: 'close', v: w })
    else toks.push({ t: 'op', v: w })
  }
  let out = ''
  let prev: T | null = null
  for (const tk of toks) {
    const needStar = prev && (prev.t === 'num' || prev.t === 'name' || prev.t === 'close' || prev.t === 'tr') && (tk.t === 'num' || tk.t === 'name' || tk.t === 'func' || tk.t === 'open')
    out += (needStar ? '*' : '') + tk.v
    prev = tk
  }
  return out.trim()
}
