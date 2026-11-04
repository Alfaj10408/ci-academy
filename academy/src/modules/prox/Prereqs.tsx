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
      <p>Proximal maps and ADMM questions rest on four moves: knowing when a minimiser exists and is unique, minimising a function with an absolute value by cases, reading a Lagrange multiplier as a price on a constraint, and telling a contraction from a nonexpansive map. Each item is tagged; a wrong answer opens a targeted lesson.</p>

      <h3>1 · Existence and uniqueness of a minimiser</h3>
      <Choice id="prox/pre/convex" module={MODULE} tags={['convexity']} mode="prereq"
        question="$u$ is a proper closed convex function and $q(x) = \\tfrac{1}{2\\sigma^2}\\|x - z\\|^2$. What can you say about $\\arg\\min_x\\{u(x) + q(x)\\}$?"
        options={['It exists and is unique: $q$ is strictly convex, so the sum is strictly convex and has exactly one minimiser', 'It exists but may not be unique', 'It is unique only if $u$ is differentiable', 'It may fail to exist because $u$ can be $+\\infty$']}
        answer={0}
        explain="A proper closed convex function plus a strictly convex quadratic has exactly one minimiser (lecture 23 slide 9; 2024 P3a–b). Differentiability is not needed: $|x|$ works." />
      <Lesson id="convexity" />

      <h3>2 · Minimise with an absolute value by cases</h3>
      <AnswerBox id="prox/pre/case" module={MODULE} tags={['case-analysis']} mode="prereq"
        prompt={<MathText>{'Find $\\arg\\min_x\\{|x| + \\tfrac12(x - 3)^2\\}$.'}</MathText>}
        expected={2}
        placeholder="a number"
        hints={['Split into $x > 0$, $x < 0$ and $x = 0$.', 'For $x > 0$: derivative $1 + (x - 3) = 0$ gives $x = 2$, which is indeed positive.', 'For $x < 0$: $-1 + (x - 3) = 0$ gives $x = 4$, not negative: no stationary point there.', 'Compare with $x = 0$: cost $4.5$ versus $2 + 0.5 = 2.5$ at $x = 2$.', '$x^* = 2 = 3 - 1$: the shrinkage of $3$ by $1$ (lecture 23 slide 11).']}
        solution="$x^* = 2$: for $x > 0$ the stationary point is $x = 3 - 1$; the other cases give nothing better. This is $S_1(3)$." />
      <Lesson id="case-analysis" />

      <h3>3 · A multiplier is a price on the constraint</h3>
      <AnswerBox id="prox/pre/lagrange" module={MODULE} tags={['lagrangian']} mode="prereq"
        prompt={<MathText>{'Minimise $\\tfrac12\\|x - y\\|^2$ subject to $x_2 = x_1 + 1$ with $y = (3, 1)$. The Lagrangian $L(x;\\lambda) = \\tfrac12\\|x - y\\|^2 + \\lambda(x_1 - x_2 + 1)$ has minimiser $x(\\lambda) = (y_1 - \\lambda, y_2 + \\lambda)$. Which $\\lambda$ puts $x(\\lambda)$ on the line?'}</MathText>}
        expected={1.5}
        placeholder="a number"
        hints={['Insert $x(\\lambda)$ into the constraint $x_2 = x_1 + 1$.', '$y_2 + \\lambda = y_1 - \\lambda + 1$.', '$2\\lambda = y_1 - y_2 + 1$.', '$\\lambda^* = (3 - 1 + 1)/2$.', '$\\lambda^* = 1.5$, and $x^* = (1.5, 2.5)$ (lecture 22 slide 7).']}
        solution="$\\lambda^* = (y_1 - y_2 + 1)/2 = 1.5$, $x^* = (1.5, 2.5)$. Raising $\\lambda$ slides $x(\\lambda)$ toward the line; too large and it crosses." />
      <Lesson id="lagrangian" />

      <h3>4 · Contraction versus nonexpansive</h3>
      <Choice id="prox/pre/fixed" module={MODULE} tags={['fixed-point']} mode="prereq"
        question="$H(x) = -x$ on $\\mathbb R$. Which statement is right?"
        options={['Nonexpansive but not a contraction: $|H(x) - H(y)| = |x - y|$ exactly', 'A contraction with constant $1$', 'Neither: it flips sign', 'A contraction because it has the fixed point $0$']}
        answer={0}
        explain="A contraction needs $\\|H(x) - H(y)\\| \\le c\\|x - y\\|$ with $c < 1$; here the ratio is exactly $1$, so it is nonexpansive only. Iterating $x \\leftarrow -x$ oscillates; the averaged iteration $x \\leftarrow (1 - \\alpha)x - \\alpha x$ converges to the fixed point $0$. This is 2025 P4 in one dimension." />
      <Lesson id="fixed-point" />
    </div>
  )
}
