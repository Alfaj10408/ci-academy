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
      <p>MAP and optimisation questions reduce to four moves: differentiate a quadratic form, split a posterior with Bayes’ rule, bound a step size by the largest eigenvalue, and minimise a parabola along a line. Each item is tagged with a skill; a wrong answer opens a targeted lesson.</p>

      <h3>1 · Gradient of the data term</h3>
      <Choice id="mapopt/pre/grad" module={MODULE} tags={['matrix-calculus']} mode="prereq"
        question="For $f(x) = \\tfrac12\\|y - Ax\\|^2$, the gradient $\\nabla_x f(x)$ is"
        options={['$-A^t(y - Ax)$', '$-(y - Ax)$', '$A(y - Ax)$', '$-A^tA\\,x$']}
        answer={0}
        explain="Write $f = \\tfrac12(y-Ax)^t(y-Ax)$ and differentiate the inner function: the chain rule brings out $-A^t$. Equivalently $\\nabla f = A^tAx - A^ty$. The transposed $A^t$ is what 2022 Q4.1, 2023 P2b and 2024 P1a all test." />
      <Lesson id="matrix-calculus" />

      <h3>2 · Bayes’ rule behind the MAP estimate</h3>
      <Choice id="mapopt/pre/bayes" module={MODULE} tags={['gaussian-density']} mode="prereq"
        question="The MAP estimate $\\hat x = \\arg\\max_x p_{x|y}(x|y)$ equals"
        options={['$\\arg\\min_x\\{-\\log p_{y|x}(y|x) - \\log p_x(x)\\}$', '$\\arg\\min_x\\{-\\log p_{y|x}(y|x)\\}$', '$\\arg\\max_x p_y(y)$', '$E[X\\,|\\,Y = y]$ in every model']}
        answer={0}
        explain="Bayes: $\\log p_{x|y} = \\log p_{y|x} + \\log p_x - \\log p_y$, and $\\log p_y(y)$ does not depend on $x$ (lecture 12, slide 6). Option 2 is the ML estimate (no prior); option 4 is the MMSE estimate, which coincides with MAP only when everything is jointly Gaussian (slide 12)." />
      <Lesson id="gaussian-density" />

      <h3>3 · Eigenvalues bound the step size</h3>
      <AnswerBox id="mapopt/pre/eig" module={MODULE} tags={['eigenvalues']} mode="prereq"
        prompt={<MathText>{'$H$ is symmetric with eigenvalues between $h_{\\min} = 0.2$ and $h_{\\max} = 4$. The iteration $\\epsilon \\leftarrow (I - \\alpha H)\\epsilon$ is stable iff $|1 - \\alpha h_i| < 1$ for every eigenvalue. What is the largest stable $\\alpha$ (supremum)?'}</MathText>}
        expected={0.5}
        placeholder="a number"
        hints={['Stability must hold for the worst mode.', '$|1 - \\alpha h| < 1 \\iff 0 < \\alpha h < 2$.', 'The binding constraint is the largest eigenvalue.', '$\\alpha < 2/h_{\\max}$.', '$2/4 = 0.5$. (Lecture 13, slide 10.)']}
        solution="$\\alpha < 2/h_{\\max} = 0.5$. With $\\alpha = 1/h_{\\max} = 0.25$ the largest mode converges in one step while the smallest decays as $(1 - 1/\\kappa)^k$ with $\\kappa = 20$." />
      <Lesson id="eigenvalues" />

      <h3>4 · Minimise a parabola along a line</h3>
      <AnswerBox id="mapopt/pre/linesearch" module={MODULE} tags={['calculus-1d']} mode="prereq"
        prompt={<MathText>{'Along a search direction the cost is $g(\\alpha) = f(x + \\alpha d) = 5 - 4\\alpha + 2\\alpha^2$. Find $\\alpha^* = \\arg\\min_\\alpha g(\\alpha)$.'}</MathText>}
        expected={1}
        placeholder="a number"
        hints={['A parabola with positive curvature has one minimum.', 'Set $g^\\prime(\\alpha) = 0$.', '$g^\\prime(\\alpha) = -4 + 4\\alpha$.', '$\\alpha^* = 1$.', 'In general $\\alpha^* = -g^\\prime(0)/g^{\\prime\\prime}(0)$: the ratio of a slope to a curvature, exactly the form of lecture 13 slide 18.']}
        solution="$g^\\prime(\\alpha) = -4 + 4\\alpha = 0 \\Rightarrow \\alpha^* = 1$. The MAP line search is this computation with $g^\\prime(0) = d^t\\nabla f(x)$ and $g^{\\prime\\prime}(0) = d^tHd$." />
      <Lesson id="calculus-1d" />
    </div>
  )
}
