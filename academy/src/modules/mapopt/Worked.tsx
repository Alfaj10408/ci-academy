import { AnswerBox, Choice, Callout, Steps } from '../../components/ui'
import { Tex, MathText } from '../../components/Tex'
import { MODULE } from './constants'

const mat2 = { A: { rows: 2, cols: 2 }, xp: { rows: 2 }, y: { rows: 2 } }

/** Worked examples: 2023 P2 (official key, fully worked) and 2022 Q4 (official key, with graded blanks). */
export function Worked() {
  return (
    <div>
      <h2>Worked examples from the official keys</h2>
      <Callout title="Provenance">
        <p>Both problems below are original midterm questions with instructor solutions. The step order follows the key; commentary in italics is mine.</p>
      </Callout>

      <h3>A · Midterm 2023, Problem 2: MAP estimation (36 pt), fully worked</h3>
      <Callout title="Original wording"><MathText>{'Consider the following MAP estimator $\\hat x = \\arg\\min_x f(x)$, $f(x) = \\tfrac{1}{2\\sigma_w^2}\\|y - Ax\\|^2 + \\tfrac{1}{2\\sigma_x^2}\\|x\\|^2$, where $\\lambda = \\sigma_w^2/\\sigma_x^2$. (a) Write the forward model. (b) Calculate $\\nabla f(x)$. (c) Closed form for $\\hat x$. (d) Pseudo-code for gradient descent. (e) ICD update for pixel $x_i$. (f) Pseudo-code for ICD.'}</MathText></Callout>
      <Steps steps={[
        { title: '(a) Forward model: read it off the two quadratic terms', body: <><Tex block>{'Y = AX + W, \\qquad X \\perp W, \\qquad X \\sim N(0, \\sigma_x^2 I), \\qquad W \\sim N(0, \\sigma_w^2 I)'}</Tex><MathText>{'The data term is $-\\log p(y|x)$ for Gaussian noise of variance $\\sigma_w^2$; the prior term is $-\\log p(x)$ for a white Gaussian prior of variance $\\sigma_x^2$. Say that $X$ and $W$ are independent: the key does.'}</MathText></> },
        { title: '(b) Gradient', body: <><Tex block>{'\\nabla f(x) = -\\frac{1}{\\sigma_w^2}A^t(y - Ax) + \\frac{1}{\\sigma_x^2}x'}</Tex><MathText>{'Chain rule on $\\tfrac12\\|y - Ax\\|^2$ gives $-A^t(y - Ax)$; the prior term gives $x/\\sigma_x^2$.'}</MathText></> },
        { title: '(c) Closed form: set the gradient to zero', body: <><Tex block>{'0 = -A^t(y - A\\hat x) + \\lambda\\hat x = -A^ty + (A^tA + \\lambda I)\\hat x \\quad\\Rightarrow\\quad \\hat x = (A^tA + \\lambda I)^{-1}A^ty'}</Tex><MathText>{'Multiply the gradient by $\\sigma_w^2$ first so that only $\\lambda = \\sigma_w^2/\\sigma_x^2$ appears. $A^tA + \\lambda I$ is positive definite for $\\lambda > 0$, so the inverse exists.'}</MathText></> },
        { title: '(d) Gradient descent pseudo-code', body: <><Tex block>{'\\text{Initialize } x; \\quad \\text{Repeat } \\{\\ x \\leftarrow x + \\beta\\,[A^t(y - Ax) - \\lambda x]\\ \\}, \\qquad \\beta = \\alpha\\sigma_w^2'}</Tex><MathText>{'This is $x \\leftarrow x - \\alpha\\nabla f(x)$ with the $1/\\sigma_w^2$ absorbed into the step. Write the initialisation and the loop; both earn credit.'}</MathText></> },
        { title: '(e) ICD update for pixel i', body: <><Tex block>{'0 = [\\nabla f(x + \\alpha\\epsilon_i)]_i = -(y - Ax - \\alpha A_{*,i})^tA_{*,i} + \\lambda(x_i + \\alpha) \\quad\\Rightarrow\\quad \\alpha = \\frac{(y - Ax)^tA_{*,i} - \\lambda x_i}{\\|A_{*,i}\\|^2 + \\lambda}, \\quad x_i \\leftarrow x_i + \\alpha'}</Tex><MathText>{'Here $[\\epsilon_j]_i = \\delta(j - i)$. Perturbing only pixel $i$ changes $Ax$ by $\\alpha A_{*,i}$, so the $i$-th component of the gradient is linear in $\\alpha$ and the root is a ratio of two inner products.'}</MathText></> },
        { title: '(f) ICD pseudo-code, and the fast version', body: <><Tex block>{'\\text{Initialize } x; \\ \\text{Repeat } \\{ \\text{ For each pixel } i \\{\\ \\alpha \\leftarrow \\tfrac{(y - Ax)^tA_{*,i} - \\lambda x_i}{\\|A_{*,i}\\|^2 + \\lambda};\\ x_i \\leftarrow x_i + \\alpha \\ \\} \\}'}</Tex><MathText>{'Not required by the key but worth knowing: initialise $e \\leftarrow y - Ax$, use $e^tA_{*,i}$ in the numerator and update $e \\leftarrow e - \\alpha A_{*,i}$ after each pixel (lecture 14, slide 8).'}</MathText></> },
      ]} />

      <h3>B · Midterm 2022, Q4: surrogate for ½‖y − Ax‖² (30 pt), with graded blanks</h3>
      <Callout title="Original wording"><MathText>{'$f(x) = \\tfrac12\\|y - Ax\\|^2$ with quadratic surrogate $f(x; x^\\prime) = \\tfrac a2\\|x - x^\\prime\\|^2 + b^t(x - x^\\prime) + c$. (4.1) Calculate $\\nabla f(x)$ and the Hessian. (4.2) Calculate $c$ and $b$. (4.3) Calculate $B$ so that $\\tfrac12(x - x^\\prime)^tB(x - x^\\prime) + b^t(x - x^\\prime) + c$ is the Taylor expansion about $x^\\prime$. (4.4) Find $a$ so that $f(x; x^\\prime)$ is a surrogate. (4.5) Give an iterative algorithm for $\\hat x$ using the surrogate.'}</MathText></Callout>
      <p className="small muted">Vector answers are graded at random 2×2 matrices and vectors. Type the transpose as ^t and the current point x′ as xp; ‖v‖ as ||v||.</p>
      <AnswerBox id="mapopt/worked/q4-grad" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'4.1 · $\\nabla f(x) = $'}</MathText>}
        spec={{ reference: "A'*(A*x - y)", vars: {}, matVars: { A: { rows: 2, cols: 2 }, x: { rows: 2 }, y: { rows: 2 } } }}
        placeholder="e.g. A^t(Ax - y)"
        hints={['$f = \\tfrac12(y - Ax)^t(y - Ax)$.', 'Chain rule: the inner derivative is $-A$.', '$\\nabla f = -A^t(y - Ax)$.', 'Equivalently $A^t(Ax - y) = A^tAx - A^ty$.', 'Key 4.1: $\\nabla f = A^t(Ax - y)$; Hessian $A^tA$.']}
        solution="$\\nabla f(x) = A^t(Ax - y)$, Hessian $\\nabla^2 f = A^tA$ (constant: $f$ is quadratic)." />
      <AnswerBox id="mapopt/worked/q4-b" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'4.2 · $b = $ (the gradient property: $\\nabla_x f(x;x^\\prime)|_{x = x^\\prime} = \\nabla f(x^\\prime)$)'}</MathText>}
        spec={{ reference: "A'*(A*xp - y)", vars: {}, matVars: mat2 }}
        placeholder="e.g. A^t(A xp - y)"
        hints={['A surrogate matches the value and the slope at $x^\\prime$ (Module 2).', 'The gradient of $\\tfrac a2\\|x - x^\\prime\\|^2 + b^t(x - x^\\prime) + c$ at $x = x^\\prime$ is $b$.', 'So $b = \\nabla f(x^\\prime)$.', '$b = A^t(Ax^\\prime - y)$.', 'Key 4.2: $c = \\tfrac12\\|y - Ax^\\prime\\|^2$, $b = A^t(Ax^\\prime - y)$.']}
        solution="$b = \\nabla f(x^\\prime) = A^t(Ax^\\prime - y)$." />
      <AnswerBox id="mapopt/worked/q4-c" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'4.2 · $c = $ (the value property)'}</MathText>}
        spec={{ reference: "0.5*norm(y - A*xp)^2", vars: {}, matVars: mat2 }}
        placeholder="e.g. (1/2)||y - A xp||^2"
        hints={['At $x = x^\\prime$ the surrogate must equal $f(x^\\prime)$.', 'Both the quadratic and linear terms vanish at $x = x^\\prime$.', 'So $c = f(x^\\prime)$.', '$c = \\tfrac12\\|y - Ax^\\prime\\|^2$.', 'Key 4.2.']}
        solution="$c = f(x^\\prime) = \\tfrac12\\|y - Ax^\\prime\\|^2$." />
      <Choice id="mapopt/worked/q4-B" module={MODULE} tags={['matrix-calculus']} mode="guided"
        question="4.3 · The matrix $B$ in the Taylor expansion of $f$ about $x^\\prime$ is"
        options={['$B = A^tA$ (the Hessian; the expansion is exact because $f$ is quadratic)', '$B = A$', '$B = \\lambda_{\\max}(A^tA)\\,I$', '$B = AA^t$']}
        answer={0}
        explain="A second-order Taylor expansion uses the Hessian, $\\nabla^2 f = A^tA$, and for a quadratic $f$ it is exact (key 4.3)." />
      <Choice id="mapopt/worked/q4-a" module={MODULE} tags={['eigenvalues']} mode="guided"
        question="4.4 · $f(x; x^\\prime)$ is a surrogate (touches at $x^\\prime$, lies above $f$) when"
        options={['$a \\ge \\lambda_{\\max}(A^tA)$, since then $aI - A^tA \\succeq 0$', '$a \\le \\lambda_{\\min}(A^tA)$', '$a = \\operatorname{trace}(A^tA)/N$', 'any $a > 0$']}
        answer={0}
        explain="$f(x;x^\\prime) - f(x) = \\tfrac12(x - x^\\prime)^t(aI - A^tA)(x - x^\\prime) \\ge 0$ for all $x$ iff $aI - A^tA$ is positive semidefinite, i.e. $a \\ge \\lambda_{\\max}(A^tA)$ (key 4.4; Module 2, eigenvalue bound)." />
      <AnswerBox id="mapopt/worked/q4-update" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'4.5 · Minimise the surrogate: the update $x \\leftarrow$ (in terms of $x^\\prime$, $a$, $A$, $y$)'}</MathText>}
        spec={{ reference: "xp - (1/a)*A'*(A*xp - y)", vars: { a: [1, 5] }, matVars: mat2 }}
        placeholder="e.g. xp - (1/a) A^t(A xp - y)"
        hints={['Set the gradient of the surrogate to zero: $a(x - x^\\prime) + b = 0$.', '$x = x^\\prime - b/a$.', 'Insert $b = A^t(Ax^\\prime - y)$.', '$x \\leftarrow x^\\prime - \\tfrac1a A^t(Ax^\\prime - y)$: gradient descent with step $1/a$.', 'Key 4.5: $x \\leftarrow x - \\tfrac1a A^t(Ax - y)$, i.e. gradient descent with $\\alpha = 1/\\lambda_{\\max}$, the stable-and-fastest step of lecture 13 slide 10 with $B = 0$.']}
        solution="$x \\leftarrow x^\\prime - \\tfrac1a A^t(Ax^\\prime - y)$ with $a = \\lambda_{\\max}(A^tA)$: gradient descent, step $1/h_{\\max}$." />
    </div>
  )
}
