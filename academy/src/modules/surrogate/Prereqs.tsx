import { useState } from 'react'
import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText } from '../../components/Tex'
import { prereqById } from '../../data/prereqs'
import { MODULE } from './constants'

function Lesson({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const p = prereqById[id]
  return (
    <div>
      <button className="btn btn-ghost" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} targeted lesson: {p.name}</button>
      {open && <Callout title={p.name}><MathText>{p.lesson}</MathText><span className="ref">Lectures {p.lectures.join(', ')}</span></Callout>}
    </div>
  )
}

export function PrereqStep() {
  return (
    <div>
      <h2>Diagnose the four prerequisites this module needs</h2>
      <p>Surrogate questions are calculus questions in disguise: match a value, match a slope, bound a second derivative. Each item is tagged with a skill; a wrong answer opens a targeted lesson. Expressions are graded by numerical equivalence, never by string matching.</p>

      <h3>1 · Derivative of a piecewise function</h3>
      <AnswerBox id="surrogate/pre/deriv" module={MODULE} tags={['calculus-1d']} mode="prereq"
        prompt={<MathText>{'Let $g(x) = \\tfrac12(x-2)^2 + |x|$. For $x>0$, write $g^\\prime(x)$.'}</MathText>}
        spec={{ reference: 'x - 2 + 1', vars: { x: [0.1, 5] } }}
        placeholder="e.g. x - 1"
        hints={['Differentiate term by term; $|x| = x$ when $x>0$.', '$\\frac{d}{dx}\\tfrac12(x-2)^2 = x-2$ by the chain rule.', '$\\frac{d}{dx}|x| = \\mathrm{sign}(x) = 1$ for $x>0$.', 'Add: $x - 2 + 1$.', '$g^\\prime(x) = x-1$ for $x>0$, so the minimum over $x>0$ is at $x=1$ (that is 2021 Q4.6’s answer in disguise).']}
        solution="$g^\\prime(x) = x - 1$ for $x>0$. At $x<0$ it is $x-3<0$, so $g$ decreases up to $0$ and the minimiser is where $x - 1 = 0$: $x^* = 1$." />
      <Lesson id="calculus-1d" />

      <h3>2 · Tangency: what matching value and slope means</h3>
      <Choice id="surrogate/pre/tangent" module={MODULE} tags={['calculus-1d']} mode="prereq"
        question="$q(x) = ax^2 + b$ must satisfy $q(x^\\prime) = |x^\\prime|$ and $q^\\prime(x^\\prime) = \\mathrm{sign}(x^\\prime)$ at $x^\\prime = 2$. Which $(a, b)$ works?"
        options={['$a = 1/4,\; b = 1$', '$a = 1/2,\; b = 0$', '$a = 1,\; b = -2$', '$a = 1/4,\; b = 2$']}
        answer={0}
        explain="Slope: $2a\\cdot2 = 1 \\Rightarrow a = 1/4$. Value: $\\tfrac14\\cdot4 + b = 2 \\Rightarrow b = 1$. This is the computation behind $a = 1/(2|x^\\prime|)$, $b = |x^\\prime|/2$." />

      <h3>3 · Convexity and the second derivative</h3>
      <Choice id="surrogate/pre/convex" module={MODULE} tags={['calculus-1d', 'convexity']} mode="prereq"
        question="$f(\\theta) = \\theta - y\\log\\theta$ with $y>0$. Which statement is true for $\\theta>0$?"
        options={['$f^{\\prime\\prime} = y/\\theta^2 > 0$, so $f$ is strictly convex with a unique minimiser $\\theta = y$', '$f^{\\prime\\prime} = -y/\\theta^2 < 0$, so $f$ is concave', '$f$ is linear in $\\theta$', '$f$ is convex only for $\\theta > y$']}
        answer={0}
        explain="$f^\\prime = 1 - y/\\theta$, $f^{\\prime\\prime} = y/\\theta^2 > 0$. Strict convexity gives a unique minimiser, found where $f^\\prime = 0$: $\\theta = y$ (2023 P3d–e)." />
      <Lesson id="convexity" />

      <h3>4 · Bounding a quadratic form by its largest eigenvalue</h3>
      <AnswerBox id="surrogate/pre/eig" module={MODULE} tags={['eigenvalues', 'matrix-calculus']} mode="prereq"
        prompt={<MathText>{'For $A = \\begin{bmatrix}2 & 0\\\\ 0 & 1\\end{bmatrix}$, the smallest scalar $a$ with $aI \\succeq A^tA$ is $a = $'}</MathText>}
        expected={4}
        placeholder="a number"
        hints={['$A^tA$ is diagonal here: $\\mathrm{diag}(4, 1)$.', 'For symmetric $M$, $x^tMx \\le \\lambda_{\\max}\\|x\\|^2$ with equality along the top eigenvector.', 'So $aI \\succeq A^tA$ exactly when $a \\ge \\lambda_{\\max}(A^tA)$.', '$\\lambda_{\\max} = 4$.', '$a = 4$. This is the curvature of the surrogate in 2022 Q4.4.']}
        solution="$a = \\lambda_{\\max}(A^tA) = 4$." />
      <Lesson id="eigenvalues" />
      <Lesson id="matrix-calculus" />
    </div>
  )
}
