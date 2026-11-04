import { AnswerBox, Callout, Steps } from '../../components/ui'
import { Tex, MathText } from '../../components/Tex'
import { MODULE } from './constants'

/** Fully worked: 2021 Q4 (instructor key). Then a partially worked variation on 2024 P2d–f (z = 1, x′ = 2). */
export function Worked() {
  return (
    <div>
      <h2>Worked example: Midterm 2021 Q4, solved in the examiner’s steps</h2>
      <Callout title="Provenance">This solution follows the instructor’s key line by line (solution status: official key). The sketch for Q4.1 is described in words; the lab tab draws it live.</Callout>
      <Steps steps={[
        { title: 'Q4.1 · The sketch', body: <MathText>{'Draw a wiggly non-negative $f(x)$, a point $x^\\prime$ on the axis, and a parabola $q(x;x^\\prime)$ that touches $f$ from above exactly at $x^\\prime$. Label $x^\\prime$; $f(x^\\prime) = q(x^\\prime;x^\\prime)$ at the touching point; $\\tilde x^*$ at the bottom of the parabola; $x^*$ at the bottom of $f$. The Intuition tab is this figure with the sliders live (lecture 18, slide 6).'}</MathText> },
        { title: 'Q4.2 · Prove Cₖ ≤ Cₖ₋₁', body: <><Tex block>{'C_k = f(x_k) \\le q(x_k;x_{k-1}) \\le q(x_{k-1};x_{k-1}) = f(x_{k-1}) = C_{k-1}'}</Tex><MathText>{'Justify each link: $f \\le q$ (upper bound); $x_k$ minimises $q(\\cdot;x_{k-1})$; $q(x^\\prime;x^\\prime) = f(x^\\prime)$. Three facts, three symbols.'}</MathText></> },
        { title: 'Q4.3 · Prove the limit exists', body: <MathText>{'$C_k$ is monotone non-increasing (Q4.2) and bounded below by $0$ because $f \\ge 0$. A monotone bounded real sequence converges, so $C_\\infty = \\lim_{k\\to\\infty}C_k$ exists. Do not claim $x_k$ converges; that was not asked and is not implied.'}</MathText> },
        { title: 'Q4.4 · Surrogate for |x| of the form ax² + b', body: <><MathText>{'Match slopes at $x^\\prime$: $q^\\prime(x^\\prime) = 2ax^\\prime$ must equal $\\frac{d}{dx}|x| = \\mathrm{sign}(x^\\prime)$, so'}</MathText><Tex block>{'a = \\frac{\\mathrm{sign}(x^\\prime)}{2x^\\prime} = \\frac{1}{2|x^\\prime|}'}</Tex><MathText>{'Match values: $ax^{\\prime2} + b = |x^\\prime|$ gives $b = |x^\\prime| - \\frac{|x^\\prime|}{2} = \\frac{|x^\\prime|}{2}$. (Upper bound check: $q - |x| = (|x|-|x^\\prime|)^2/(2|x^\\prime|) \\ge 0$.)'}</MathText></> },
        { title: 'Q4.5 · Surrogate for g(x) = ½(x−2)² + |x|', body: <><MathText>{'The quadratic term is its own surrogate; by additivity add the surrogate of $|x|$:'}</MathText><Tex block>{'g(x;x^\\prime) = \\tfrac12(x-2)^2 + \\frac{x^2}{2|x^\\prime|} + \\frac{|x^\\prime|}{2}'}</Tex><MathText>{'The key omits the constant $|x^\\prime|/2$ (“+ const”): it does not affect the minimiser (lecture 18, slide 12).'}</MathText></> },
        { title: 'Q4.6 · x₁ = argmin g(x; 1)', body: <><Tex block>{'g(x;1) = \\tfrac12(x-2)^2 + \\tfrac12x^2 \;\\Rightarrow\; (x-2) + x = 0 \;\\Rightarrow\; x_1 = 1'}</Tex><MathText>{'In general $x_1 = \\dfrac{2|x^\\prime|}{1+|x^\\prime|}$. Sanity check: $g^\\prime(1) = (1-2) + \\mathrm{sign}(1) = 0$, so $x_1 = 1$ is also the global minimiser of $g$ (strictly convex). The MM iteration has converged in one step because we started at a fixed point.'}</MathText></> },
      ]} />

      <h2 style={{ marginTop: 32 }}>Partially worked: 2024 P2d–f with z = 1, x′ = 2</h2>
      <Callout title="Problem (original wording, 2024 P2)"><MathText>{'$f_z(x) = |x-z|$. (d) Sketch $f_z$ for $z = 1$. (e) Sketch the best quadratic surrogate $f_z(x;x^\\prime)$ together with $f_z$ for $z = 1$, $x^\\prime = 2$. (f) Determine a general expression for $f_z(x;x^\\prime)$.'}</MathText><p className="small muted">The numbers z = 1, x′ = 2 are from the original exam. Fill in the blanks; each is graded numerically.</p></Callout>
      <MathText>{'Step 1 (done for you). Composition property (lecture 19, slide 5): $f_z(x) = \\rho(x - z)$ with $\\rho = |\\cdot|$, so substitute $x - z$ for $x$ and $x^\\prime - z$ for $x^\\prime$ in the surrogate of $|x|$.'}</MathText>
      <AnswerBox id="surrogate/worked/fz-general" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'Step 2. General expression: $f_z(x;x^\\prime) = $ (use x, xp, z; include the constant)'}</MathText>}
        spec={{ reference: '(x-z)^2/(2*abs(xp-z)) + abs(xp-z)/2', vars: { x: [-4, 4], xp: [-3, 3], z: [-2, 2] } }}
        placeholder="e.g. (x-z)^2/(2|x'-z|) + |x'-z|/2"
        hints={['Start from $\\rho(u;u^\\prime) = \\frac{u^2}{2|u^\\prime|} + \\frac{|u^\\prime|}{2}$.', 'Set $u = x - z$ and $u^\\prime = x^\\prime - z$.', 'So the curvature is $1/(2|x^\\prime - z|)$ and the quadratic is centred at $z$.', '$f_z(x;x^\\prime) = \\frac{(x-z)^2}{2|x^\\prime-z|} + \\frac{|x^\\prime - z|}{2}$.', 'The 2024 key writes $\\frac{(x-z)^2}{2|x^\\prime-z|}$ and drops the constant.']}
        solution="$f_z(x;x^\\prime) = \\dfrac{(x-z)^2}{2|x^\\prime - z|} + \\dfrac{|x^\\prime - z|}{2}$ (2024 key, part f)." />
      <AnswerBox id="surrogate/worked/fz-curv" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'Step 3. With $z = 1$, $x^\\prime = 2$ the curvature coefficient (the number multiplying $(x-1)^2$) is'}</MathText>}
        expected={0.5}
        hints={['The coefficient is $1/(2|x^\\prime - z|)$.', '$|x^\\prime - z| = |2 - 1| = 1$.', '$1/(2\\cdot1)$.', '$= 0.5$.', 'So $f_1(x;2) = \\tfrac12(x-1)^2 + \\tfrac12$: a parabola with vertex at $z = 1$ passing through $(2, 1)$ and $(0, 1)$.']}
        solution="$1/(2|2-1|) = 1/2$. The parabola $\\tfrac12(x-1)^2 + \\tfrac12$ touches $|x-1|$ at $x = 2$ and at $x = 0$ (symmetric bound: two touching points)." />
      <AnswerBox id="surrogate/worked/fz-min" module={MODULE} tags={['calculus-1d']} mode="guided"
        prompt={<MathText>{'Step 4. The MM update from $x^\\prime = 2$ is $x_1 = \\arg\\min_x f_1(x;2) = $'}</MathText>}
        expected={1}
        hints={['The surrogate is a parabola; where is its vertex?', 'Vertex of $\\frac{(x-z)^2}{2|x^\\prime-z|}$ is at $x = z$ regardless of $x^\\prime$.', '$z = 1$.', 'So $x_1 = 1$, the minimiser of $|x - 1|$, in one step.', 'For a single absolute value the MM iteration always jumps straight to $z$; the interesting dynamics appear for sums (2024 P2g–h, next tab).']}
        solution="$x_1 = z = 1$." />
    </div>
  )
}
