import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText, fmt } from '../../components/Tex'
import { poissonStep } from '../../math/surrogate'
import { MODULE } from './constants'

/** Guided problem: 2023 P3 (Poisson NLL surrogate) with the concrete value y = 3 so that every answer is checkable. */
export function Guided() {
  const y = 3
  const th1 = poissonStep(y, 1)
  return (
    <div>
      <h2>Guided problem solving: the Poisson surrogate (2023 P3)</h2>
      <Callout title="Problem">
        <MathText>{'$Y$ is Poisson with $p_\\theta(y) = \\theta^ye^{-\\theta}/y!$, $\\theta \\ge 0$. (a) Write the negative log-likelihood. (b) Find $f(\\theta) = -\\log p_\\theta(y) + C(y)$ in simplest form. (d) Prove $f$ is convex for $\\theta>0$. (e) Find the ML estimate. (f) Compute $g(\\theta) = f^\\prime(\\theta)$ and $h(\\theta) = f^{\\prime\\prime}(\\theta)$. (g) Find $a(\\theta^\\prime), b(\\theta^\\prime)$ so that $f(\\theta;\\theta^\\prime) = \\tfrac{a}{2}(\\theta-\\theta^\\prime)^2 + b(\\theta-\\theta^\\prime)$ is a surrogate for $f$ on $\\theta \\ge 1$.'}</MathText>
        <p className="small muted">Original wording from Midterm 2023 (official key). Answers may be symbolic in y and theta′ (type theta' or thetap); the final step uses y = 3 as a generated variation. Hints go from concept (1) to full solution (5); hint use is recorded.</p>
      </Callout>

      <h3>Step 1 · Identify the structure</h3>
      <Choice id="surrogate/guided/concept" module={MODULE} tags={['calculus-1d']} mode="guided"
        question="A surrogate of the form $\\tfrac a2(\\theta-\\theta^\\prime)^2 + b(\\theta-\\theta^\\prime)$ (plus $f(\\theta^\\prime)$) is which construction from lecture 19?"
        options={['Maximum curvature: $b = f^\\prime(\\theta^\\prime)$, $a = \\max f^{\\prime\\prime}$ over the domain', 'Symmetric bound: $a = f^\\prime(\\theta^\\prime)/\\theta^\\prime$', 'A Taylor expansion with the exact Hessian', 'Additivity of two surrogates']}
        answer={0}
        explain="The surrogate is centred at $\\theta^\\prime$ with a linear term: that is the maximum-curvature form of slide 7. The gradient property fixes $b$; the upper bound is guaranteed by taking $a$ at least as large as $f^{\\prime\\prime}$ anywhere on the domain." />

      <h3>Step 2 · Negative log-likelihood and its simplest form (a, b)</h3>
      <AnswerBox id="surrogate/guided/f" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'$f(\\theta) = $ (drop every term that does not depend on $\\theta$; use y and theta)'}</MathText>}
        spec={{ reference: 'theta - y*log(theta)', vars: { theta: [0.5, 6], y: [1, 5] } }}
        placeholder="e.g. theta - y log(theta)"
        hints={['$-\\log p_\\theta(y) = -\\log(\\theta^y) - \\log(e^{-\\theta}) + \\log(y!)$.', '$= -y\\log\\theta + \\theta + \\log y!$.', '$\\log y!$ does not depend on $\\theta$: absorb it into $C(y)$.', '$f(\\theta) = \\theta - y\\log\\theta$.', 'Key (b): $f(\\theta) = \\theta - y\\log\\theta$.']}
        solution="$-\\log p_\\theta(y) = -y\\log\\theta + \\theta + \\log y!$, so $f(\\theta) = \\theta - y\\log\\theta$." />

      <h3>Step 3 · Derivatives and convexity (d, f)</h3>
      <AnswerBox id="surrogate/guided/g" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'$g(\\theta) = f^\\prime(\\theta) = $'}</MathText>}
        spec={{ reference: '1 - y/theta', vars: { theta: [0.5, 6], y: [1, 5] } }}
        hints={['Differentiate $\\theta$ and $-y\\log\\theta$ separately.', '$\\frac{d}{d\\theta}\\log\\theta = 1/\\theta$.', '$g(\\theta) = 1 - y/\\theta$.', 'It is negative for $\\theta<y$ and positive for $\\theta>y$.', 'Key (f): $g = 1 - y/\\theta$.']}
        solution="$g(\\theta) = 1 - y/\\theta$." />
      <AnswerBox id="surrogate/guided/h" module={MODULE} tags={['calculus-1d', 'convexity']} mode="guided"
        prompt={<MathText>{'$h(\\theta) = f^{\\prime\\prime}(\\theta) = $'}</MathText>}
        spec={{ reference: 'y/theta^2', vars: { theta: [0.5, 6], y: [1, 5] } }}
        hints={['Differentiate $-y/\\theta = -y\\theta^{-1}$.', '$\\frac{d}{d\\theta}\\theta^{-1} = -\\theta^{-2}$.', '$h(\\theta) = y/\\theta^2$.', 'Positive for every $\\theta>0$ and $y>0$: this is the convexity proof for (d).', 'Key (d, f): $h = y/\\theta^2 > 0$ ⇒ strictly convex.']}
        solution="$h(\\theta) = y/\\theta^2 > 0$ for $\\theta>0$, so $f$ is strictly convex (part d)." />

      <h3>Step 4 · ML estimate (e)</h3>
      <AnswerBox id="surrogate/guided/ml" module={MODULE} tags={['calculus-1d', 'convexity']} mode="guided"
        prompt={<MathText>{'$\\hat\\theta = T(Y) = $ (in terms of y)'}</MathText>}
        spec={{ reference: 'y', vars: { y: [1, 5] } }}
        hints={['Strictly convex ⇒ the unique minimiser is where $g = 0$.', '$1 - y/\\theta = 0$.', '$\\theta = y$.', 'The ML estimate of a Poisson mean is the observed count.', 'Key (e): $\\hat\\theta = y$.']}
        solution="$\\hat\\theta = y$." />

      <h3>Step 5 · The surrogate coefficients (g)</h3>
      <AnswerBox id="surrogate/guided/b" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'$b(\\theta^\\prime) = $ (use y and theta′)'}</MathText>}
        spec={{ reference: '1 - y/thetap', vars: { thetap: [1, 6], y: [1, 5] } }}
        placeholder="e.g. 1 - y/theta'"
        hints={['Gradient property: the surrogate must have the same slope as $f$ at $\\theta^\\prime$.', 'Slope of $\\tfrac a2(\\theta-\\theta^\\prime)^2 + b(\\theta-\\theta^\\prime)$ at $\\theta = \\theta^\\prime$ is $b$.', 'So $b = g(\\theta^\\prime)$.', '$b = 1 - y/\\theta^\\prime$.', 'Key (g): $b(\\theta^\\prime) = 1 - y/\\theta^\\prime$.']}
        solution="$b(\\theta^\\prime) = g(\\theta^\\prime) = 1 - y/\\theta^\\prime$." />
      <AnswerBox id="surrogate/guided/a" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'$a(\\theta^\\prime) = $ (the smallest constant that works for all $\\theta \\ge 1$)'}</MathText>}
        spec={{ reference: 'y', vars: { thetap: [1, 6], y: [1, 5] } }}
        placeholder="may depend on y and theta'"
        hints={['Maximum curvature: $a \\ge h(\\theta)$ for every $\\theta$ in the domain.', '$h(\\theta) = y/\\theta^2$ is decreasing in $\\theta$.', 'Its maximum over $\\theta \\ge 1$ is at $\\theta = 1$.', '$a = \\max_{\\theta\\ge1} y/\\theta^2 = y$.', 'Key (g): $a(\\theta^\\prime) = y$, independent of $\\theta^\\prime$. Common mistake: $a = y/\\theta^{\\prime2}$, which only matches the curvature at $\\theta^\\prime$ and is not an upper bound for $\\theta < \\theta^\\prime$.']}
        solution="$a = \\max_{\\theta\\ge1} h(\\theta) = y$. The surrogate is $f(\\theta;\\theta^\\prime) = \\tfrac y2(\\theta-\\theta^\\prime)^2 + (1 - y/\\theta^\\prime)(\\theta-\\theta^\\prime)$ (+ $f(\\theta^\\prime)$)." />

      <h3>Step 6 · Use it (generated variation, y = 3)</h3>
      <AnswerBox id="surrogate/guided/step" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'With $y = 3$ and $\\theta^\\prime = 1$, the MM update $\\theta_1 = \\arg\\min_{\\theta\\ge1} f(\\theta;1) = $'}</MathText>}
        expected={th1}
        hints={['Minimise a quadratic: set its derivative $a(\\theta-\\theta^\\prime) + b$ to zero.', '$\\theta = \\theta^\\prime - b/a$.', '$b = 1 - 3/1 = -2$, $a = 3$.', '$\\theta_1 = 1 + 2/3$.', `$\\theta_1 = 5/3 = ${fmt(th1, 4)}$, which is inside $\\theta\\ge1$ so no clipping is needed. Repeating converges to $\\hat\\theta = 3$ (lab tab).`]}
        solution={`$\\theta_1 = \\theta^\\prime - b/a = 1 - (-2)/3 = 5/3 = ${fmt(th1, 4)}$.`} />
    </div>
  )
}
