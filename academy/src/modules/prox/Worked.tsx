import { AnswerBox, Choice, Callout, Steps } from '../../components/ui'
import { Tex, MathText } from '../../components/Tex'
import { MODULE } from './constants'

const mats = { A: { rows: 3, cols: 3 }, Lambda: { rows: 3, cols: 3, posdef: true }, v: { rows: 3 }, y: { rows: 3 } }
const I3 = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

/** Worked examples from the official keys: 2022 Q3 (fully worked), 2024 P3 (with a graded blank), 2023 P1 (the emotional equation). */
export function Worked() {
  return (
    <div>
      <h2>Worked examples from the official keys</h2>
      <Callout title="Provenance"><p>All three are original midterm questions with instructor solutions. The step order follows each key; commentary in italics is mine.</p></Callout>

      <h3>A · Midterm 2022, Q3: augmented Lagrangian and ADMM (35 pt), fully worked</h3>
      <Callout title="Original wording"><MathText>{'Consider an inverse problem in which the MAP estimate is given by $\\hat x = \\arg\\min_x\\{f(x) + h(x)\\}$ where $x \\in \\mathbb R^N$ and $f, h: \\mathbb R^N \\to \\mathbb R \\cup \\{\\infty\\}$ are proper closed convex functions. (3.1) Write an equivalent expression for $\\hat x$ based on the constrained optimization of two variables $(x, v)$. (3.2) Write out an expression for the augmented Lagrangian $L(x, v; u)$ which solves the problem for the proper value of $u$. (3.3) Let $(\\hat x, \\hat v) = \\arg\\min_{(x,v)}L(x, v; u)$. As $u$ is increased, what will happen to the values of $\\hat x$ and $\\hat v$? (3.4) Give an algorithm for solving the problem that uses $F(z) = \\arg\\min_x\\{f(x) + \\tfrac a2\\|x - z\\|^2\\}$ and $H(z) = \\arg\\min_x\\{h(x) + \\tfrac a2\\|x - z\\|^2\\}$. (3.5) If $h(x) = \\infty$ when some $x_i < 0$ and $0$ otherwise, calculate an explicit expression for $H(z)$.'}</MathText></Callout>
      <Steps steps={[
        { title: '(3.1) Split the variable', body: <><Tex block>{'(\\hat x, \\hat v) = \\arg\\min_{(x,v):\\ x = v}\\{f(x) + h(v)\\}'}</Tex><MathText>{'Two copies, one constraint. The key writes exactly this; say “subject to $x = v$” explicitly.'}</MathText></> },
        { title: '(3.2) The augmented Lagrangian in scaled form', body: <><Tex block>{'L(x, v; u) = f(x) + h(v) + \\frac a2\\|x - v + u\\|^2'}</Tex><MathText>{'Penalty on the constraint error plus the correction $u = \\lambda/a$ inside the square (lecture 22 slide 15). “For the proper value of $u$” means $u = \\lambda^*/a$, at which the minimiser satisfies $\\hat x = \\hat v$.'}</MathText></> },
        { title: '(3.3) Raising u lowers x̂ − v̂', body: <><MathText>{'The penalty is smallest when $x - v = -u$. Increasing $u$ decreases $\\hat x - \\hat v$: it tends to decrease $\\hat x$ and increase $\\hat v$ (lecture 21 slide 8). The key’s sentence is that short.'}</MathText></> },
        { title: '(3.4) ADMM written with the two proximal maps', body: <><Tex block>{'u \\leftarrow 0,\\ v \\leftarrow 0; \\quad \\text{Repeat until converged } \\{\\ x \\leftarrow F(v - u);\\ \\ v \\leftarrow H(x + u);\\ \\ u \\leftarrow u + (x - v)\\ \\}; \\quad \\text{Return}(x)'}</Tex><MathText>{'The $x$ update is $\\arg\\min_x\\{f(x) + \\tfrac a2\\|x - (v - u)\\|^2\\} = F(v - u)$; the $v$ update is $\\arg\\min_v\\{h(v) + \\tfrac a2\\|v - (x + u)\\|^2\\} = H(x + u)$. Write the initialisation and the return: the key does.'}</MathText></> },
        { title: '(3.5) The positivity indicator gives a clip', body: <><Tex block>{'[H(z)]_i = \\begin{cases} 0 & z_i < 0 \\\\ z_i & \\text{otherwise} \\end{cases} \\ = \\max(z_i, 0)'}</Tex><MathText>{'$h$ is $0$ on the nonnegative orthant and $\\infty$ off it, so $H(z)$ is the nearest nonnegative point: each negative component is set to zero.'}</MathText></> },
      ]} />

      <h3>B · Midterm 2024, P3: proximal maps (24 pt), with a graded blank</h3>
      <Callout title="Original wording"><MathText>{'Define $f_v(x) = u(x) + \\tfrac{1}{2\\sigma^2}\\|x - v\\|^2$ and the associated proximal map $F(v) = \\arg\\min_{x\\in\\mathbb R^N}f_v(x)$, where $u: \\mathbb R^N \\to \\mathbb R \\cup \\{\\infty\\}$ is a continuously differentiable proper closed convex function. (a) Provide the outline of a proof that $f_v$ takes on a minimum value (you may use the theorem that a continuous function on a compact set takes on its minimum). (b) Using (a), prove that $f_v$ takes on a unique minimum. (c) Let $u(x; y) = \\tfrac12\\|y - Ax\\|_\\Lambda^2$; show that $F(v; y) = v + (\\tfrac{1}{\\sigma^2}I + A^t\\Lambda A)^{-1}A^t\\Lambda(y - Av)$. (d) Show that $F(v; Y)$ is the MAP estimate of $X$ given $Y$ under $Y = AX + W$ with independent $X \\sim N(v, \\sigma^2 I)$ and $W \\sim N(0, \\Lambda^{-1})$.'}</MathText></Callout>
      <Steps steps={[
        { title: '(a) Existence, in four moves', body: <><MathText>{'1. $u$ proper, so some $x$ has $f_v(x) < \\infty$. 2. There is an $\\alpha$ such that the sublevel set $\\mathcal A = \\{x: f_v(x) \\le \\alpha\\}$ is closed (u closed) and bounded (the quadratic grows without bound). 3. A continuous function on a compact set attains its minimum: some $x^* \\in \\mathcal A$ minimises $f_v$ on $\\mathcal A$. 4. Outside $\\mathcal A$ the cost exceeds $\\alpha \\ge f_v(x^*)$, so $x^*$ minimises $f_v$ on $\\mathbb R^N$.'}</MathText></> },
        { title: '(b) Uniqueness', body: <><MathText>{'$u$ is convex and $\\tfrac{1}{2\\sigma^2}\\|x - v\\|^2$ is strictly convex, so $f_v$ is strictly convex and $x^*$ is its unique minimiser.'}</MathText></> },
        { title: '(c) Substitute z = x − v and solve a least-squares problem', body: <><Tex block>{'\\tilde f(z) = \\tfrac12\\|\\epsilon - Az\\|_\\Lambda^2 + \\tfrac{1}{2\\sigma^2}\\|z\\|^2, \\ \\epsilon = y - Av \\quad\\Rightarrow\\quad z^* = \\Big(\\tfrac{1}{\\sigma^2}I + A^t\\Lambda A\\Big)^{-1}A^t\\Lambda\\,\\epsilon, \\qquad x^* = v + z^*'}</Tex><MathText>{'Set the gradient to zero: $-A^t\\Lambda(\\epsilon - Az) + z/\\sigma^2 = 0$. This is Module 3’s closed form with $B = I/\\sigma^2$ and weighted data term.'}</MathText></> },
        { title: '(d) Read the two terms as a forward model and a prior', body: <><MathText>{'$\\tfrac12\\|y - Ax\\|_\\Lambda^2 = -\\log p(y|x) + c$ for $Y = AX + W$, $W \\sim N(0, \\Lambda^{-1})$; $\\tfrac{1}{2\\sigma^2}\\|x - v\\|^2 = -\\log p(x) + c$ for $X \\sim N(v, \\sigma^2 I)$. So $F(v; Y)$ is the MAP estimate: the proximal map of the data term is a Gaussian MAP estimator centred at $v$. Lecture 25 slide 15 makes the same point for the prior term: the proximal map of $h$ is a MAP denoiser.'}</MathText></> },
      ]} />
      <p className="small muted">Graded blank for (c). Matrix mode: type transposes as ^t, the identity as I, Λ as Lambda, σ² as sigma^2, inverses as (…)^(-1).</p>
      <AnswerBox id="prox/worked/p3c" module={MODULE} tags={['matrix-calculus']} mode="guided"
        prompt={<MathText>{'(c) · $F(v; y) = $'}</MathText>}
        spec={{ reference: "v + inv(I/sigma2 + A'*Lambda*A)*A'*Lambda*(y - A*v)", vars: { sigma2: [0.5, 2] }, matVars: mats, derived: { I: I3 } }}
        placeholder="e.g. v + (I/sigma^2 + A^t Lambda A)^(-1) A^t Lambda (y - A v)"
        hints={['Let $z = x - v$ so the quadratic is centred at $0$.', 'Then $\\tilde f(z) = \\tfrac12\\|(y - Av) - Az\\|_\\Lambda^2 + \\tfrac{1}{2\\sigma^2}\\|z\\|^2$.', 'Gradient zero: $(\\tfrac{1}{\\sigma^2}I + A^t\\Lambda A)z = A^t\\Lambda(y - Av)$.', '$x^* = v + z^*$.', 'Key: $F(v;y) = v + (\\tfrac{1}{\\sigma^2}I + A^t\\Lambda A)^{-1}A^t\\Lambda(y - Av)$.']}
        solution="$F(v; y) = v + (\\tfrac{1}{\\sigma^2}I + A^t\\Lambda A)^{-1}A^t\\Lambda(y - Av)$." />
      <Choice id="prox/worked/p3d" module={MODULE} tags={['gaussian-density']} mode="guided"
        question="(d) · In $F(v; Y)$ as a MAP estimate, the term $\\tfrac{1}{2\\sigma^2}\\|x - v\\|^2$ is"
        options={['$-\\log p(x)$ for the prior $X \\sim N(v, \\sigma^2 I)$', '$-\\log p(y|x)$ for the noise $W \\sim N(0, \\sigma^2 I)$', 'the Lagrange multiplier term', 'a surrogate of the data term']}
        answer={0}
        explain="The data term with weight $\\Lambda$ is the likelihood under $W \\sim N(0, \\Lambda^{-1})$; the quadratic centred at $v$ is a Gaussian prior with mean $v$ and covariance $\\sigma^2 I$ (2024 P3d key)." />

      <h3>C · Midterm 2023, P1: the emotional equation (22 pt)</h3>
      <Callout title="Original wording"><MathText>{'Write 50 words or less that describe your feelings and interpretation of $F(z) = \\arg\\min_x\\{f(x) + \\tfrac{1}{2\\sigma^2}\\|x - z\\|^2\\}$.'}</MathText></Callout>
      <MathText>{'The instructor’s own answer: this is the typical form of a proximal map. $F$ takes inputs in $\\mathbb R^N$ and maps them back to $\\mathbb R^N$. Intuitively it returns a vector that moves toward the minimum of $f$ but remains in the proximity of $z$, hence the name. (The key also prints two ChatGPT answers, prose and poem, as a contrast; they say the same thing less precisely.) The intuition step of this module is this answer drawn as a picture.'}</MathText>
    </div>
  )
}
