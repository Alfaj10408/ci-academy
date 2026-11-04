import { AnswerBox, Choice, Callout } from '../../components/ui'
import { MathText } from '../../components/Tex'
import { MODULE } from './constants'

/** Guided problems: 2025 P2 (shrinkage operator) and 2025 P4 (contraction mappings), original wording, official keys. */
export function Guided() {
  return (
    <div>
      <h2>Guided problem solving: shrinkage (2025 P2) and the swap map (2025 P4)</h2>
      <Callout title="Problem A (original wording, 21 pt)">
        <MathText>{'Consider the proximal map $S_\\lambda(y) = \\arg\\min_{x\\in\\mathbb R^N}\\{\\lambda\\|x\\|_1 + \\tfrac12\\|x - y\\|^2\\}$. (a) Calculate an explicit form for $S_\\lambda(y)$ when $N = 1$. (b) Calculate an explicit form when $N > 1$. (c) Explain in words (i.e., emotionally) what $S_\\lambda(y)$ does.'}</MathText>
        <p className="small muted">Official key. Expression answers are graded numerically; use y and lambda. Hints go from concept (1) to full solution (5); hint use is recorded.</p>
      </Callout>

      <h3>Step 1 · (a) The case y &gt; λ</h3>
      <AnswerBox id="prox/guided/s-pos" module={MODULE} tags={['case-analysis']} mode="guided"
        prompt={<MathText>{'For $N = 1$ and $y > \\lambda$: $S_\\lambda(y) = $'}</MathText>}
        spec={{ reference: 'y - lambda', vars: { y: [2, 5], lambda: [0.1, 1.5] } }}
        placeholder="e.g. y - lambda"
        hints={['Try $x > 0$, where $|x| = x$ and the cost is differentiable.', 'Derivative: $\\lambda + (x - y) = 0$.', '$x = y - \\lambda$, which is positive exactly when $y > \\lambda$: the case is self-consistent.', 'Check the other cases give nothing better (next steps).', 'Key: $S_\\lambda(y) = y - \\lambda$ for $y \\ge \\lambda$.']}
        solution="For $x > 0$: $\\lambda + (x - y) = 0 \\Rightarrow x = y - \\lambda > 0$." />
      <h3>Step 2 · (a) The case y &lt; −λ</h3>
      <AnswerBox id="prox/guided/s-neg" module={MODULE} tags={['case-analysis']} mode="guided"
        prompt={<MathText>{'For $N = 1$ and $y < -\\lambda$: $S_\\lambda(y) = $'}</MathText>}
        spec={{ reference: 'y + lambda', vars: { y: [-5, -2], lambda: [0.1, 1.5] } }}
        placeholder="e.g. y + lambda"
        hints={['Now $x < 0$ and $|x| = -x$.', 'Derivative: $-\\lambda + (x - y) = 0$.', '$x = y + \\lambda$, negative exactly when $y < -\\lambda$.', 'By symmetry of the cost under $(x, y) \\to (-x, -y)$.', 'Key: $S_\\lambda(y) = y + \\lambda$ for $y \\le -\\lambda$.']}
        solution="For $x < 0$: $-\\lambda + (x - y) = 0 \\Rightarrow x = y + \\lambda < 0$." />
      <h3>Step 3 · (a) The middle case</h3>
      <Choice id="prox/guided/s-mid" module={MODULE} tags={['case-analysis']} mode="guided"
        question="For $|y| \\le \\lambda$ neither stationary point is admissible ($y - \\lambda \\le 0$ and $y + \\lambda \\ge 0$). The minimiser is"
        options={['$x = 0$: the kink of $|x|$, where the cost $\\tfrac12y^2$ beats both one-sided candidates', '$x = y$', '$x = \\lambda$', 'undefined: the cost has no minimum there']}
        answer={0}
        explain="On $x > 0$ the cost is increasing (its stationary point would be at $y - \\lambda \\le 0$), on $x < 0$ it is decreasing, so the minimum sits at $x = 0$ (lecture 23 slide 11; 2025 P2a key)." />
      <h3>Step 4 · (a) and (b) in one formula</h3>
      <AnswerBox id="prox/guided/s-compact" module={MODULE} tags={['case-analysis']} mode="guided"
        prompt={<MathText>{'Compact form valid for every $y$ (use sign, abs, max): $S_\\lambda(y) = $'}</MathText>}
        spec={{ reference: 'sign(y)*max(abs(y) - lambda, 0)', vars: { y: [-4, 4], lambda: [0.1, 1.5] } }}
        placeholder="e.g. sign(y) max(|y| - lambda, 0)"
        hints={['All three cases move $y$ toward $0$ by $\\lambda$, stopping at $0$.', 'The magnitude becomes $\\max\\{|y| - \\lambda, 0\\}$.', 'The sign is the sign of $y$.', '$S_\\lambda(y) = \\mathrm{sign}(y)\\max\\{|y| - \\lambda, 0\\}$ (lecture 23 slide 12).', 'Key (b): for $N > 1$ apply this to each component, $S_\\lambda(y) = (S_\\lambda(y_1), \\dots, S_\\lambda(y_N))^t$, because the cost is separable.']}
        solution="$S_\\lambda(y) = \\mathrm{sign}(y)\\max\\{|y| - \\lambda, 0\\}$, applied componentwise for $N > 1$ since $\\lambda\\|x\\|_1 + \\tfrac12\\|x - y\\|^2 = \\sum_i[\\lambda|x_i| + \\tfrac12(x_i - y_i)^2]$." />
      <h3>Step 5 · (c) In words</h3>
      <Choice id="prox/guided/s-words" module={MODULE} tags={['case-analysis']} mode="guided"
        question="What does $S_\\lambda$ do, emotionally?"
        options={['It sets every entry with magnitude below $\\lambda$ to zero and keeps the larger ones, pulled toward zero by $\\lambda$', 'It clips every entry to the interval $[-\\lambda, \\lambda]$', 'It scales $y$ by $1/(1 + \\lambda)$', 'It rounds $y$ to the nearest multiple of $\\lambda$']}
        answer={0}
        explain="2025 P2c key: values of magnitude less than $\\lambda$ go to zero; larger values are maintained but shifted toward $0$. Small entries are treated as noise, large ones as signal (lecture 23 slide 13)." />

      <Callout title="Problem B (original wording, 35 pt)">
        <MathText>{'Consider $H: \\mathbb R^2 \\to \\mathbb R^2$ given by $y = H(x)$ where $H(x) = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0\\end{bmatrix}x$. (a) Is $H$ a contraction map? (b) Is $H$ nonexpansive? (c) Does the iteration Repeat$\\{x \\leftarrow H(x)\\}$ converge? Justify. (d) Does the iteration Repeat$\\{x \\leftarrow (1 - \\alpha)x + \\alpha H(x)\\}$ for $\\alpha \\in (0, 1)$ converge? Justify. (e) What does the iteration of (d) converge to?'}</MathText>
      </Callout>
      <h3>Step 6 · (a) and (b)</h3>
      <Choice id="prox/guided/p4ab" module={MODULE} tags={['fixed-point']} mode="guided"
        question="Compute $\\|H(x) - H(y)\\|$ for the swap map. Which is right?"
        options={['$\\|H(x) - H(y)\\| = \\|x - y\\|$ exactly: nonexpansive (b: yes) but not a contraction (a: no)', 'A contraction with constant $\\tfrac12$', 'Expansive, since it has eigenvalue $-1$', 'A contraction because it is linear']}
        answer={0}
        explain="Swapping coordinates preserves the Euclidean norm, so the Lipschitz ratio is exactly $1$: nonexpansive, and no $c < 1$ works (2025 P4a–b key: No; Yes)." />
      <h3>Step 7 · (c)</h3>
      <Choice id="prox/guided/p4c" module={MODULE} tags={['fixed-point']} mode="guided"
        question="Does Repeat$\\{x \\leftarrow H(x)\\}$ converge?"
        options={['No: each iteration reflects $x$ about the diagonal, so $x^{(2)} = x^{(0)}$ and the sequence oscillates unless $x^{(0)}$ is already on the diagonal', 'Yes, to $0$, because $H$ is nonexpansive', 'Yes, to the diagonal projection', 'Only for $\\|x^{(0)}\\| < 1$']}
        answer={0}
        explain="2025 P4c key: no, it just reflects about the diagonal with each iteration. Nonexpansive alone does not give convergence; a contraction would." />
      <h3>Step 8 · (d)</h3>
      <Choice id="prox/guided/p4d" module={MODULE} tags={['fixed-point']} mode="guided"
        question="Does Repeat$\\{x \\leftarrow (1 - \\alpha)x + \\alpha H(x)\\}$, $\\alpha \\in (0, 1)$, converge?"
        options={['Yes: it is a Mann iteration of a nonexpansive map that has fixed points ($x = (t, t)$ for any $t$), so it converges to one of them', 'No: averaging a non-convergent iteration cannot converge', 'Only for $\\alpha = \\tfrac12$', 'Yes, because the averaged map is a contraction']}
        answer={0}
        explain="2025 P4d key: a Mann iteration with a nonexpansive $H$ that has a fixed point converges to a fixed point. The averaged map $(1 - \\alpha)I + \\alpha H$ has eigenvalues $1$ and $1 - 2\\alpha$: still not a contraction (eigenvalue $1$ on the diagonal), but the reflecting mode is damped by $|1 - 2\\alpha| < 1$." />
      <h3>Step 9 · (e) The limit</h3>
      <AnswerBox id="prox/guided/p4e" module={MODULE} tags={['fixed-point']} mode="guided"
        prompt={<MathText>{'First component of the limit, in terms of $x^{(0)} = (x_1, x_2)$ (type x1, x2): $x^{(\\infty)}_1 = $'}</MathText>}
        spec={{ reference: '(x1 + x2)/2', vars: { x1: [-3, 3], x2: [-3, 3] } }}
        placeholder="e.g. (x1 + x2)/2"
        hints={['The fixed points are the diagonal $x_1 = x_2$.', 'Each averaged step moves along the direction $H(x) - x = (x_2 - x_1, x_1 - x_2)$, perpendicular to the diagonal.', 'So the sum $x_1 + x_2$ never changes.', 'The limit is on the diagonal with the same sum: $(s/2, s/2)$ with $s = x_1 + x_2$.', 'Key (e): the projection of $x^{(0)}$ onto the diagonal, $\\big(\\tfrac{x_1 + x_2}{2}, \\tfrac{x_1 + x_2}{2}\\big)$.']}
        solution="$x^{(\\infty)} = \\tfrac{\\langle \\mathbf 1, x^{(0)}\\rangle}{2}\\mathbf 1 = \\big(\\tfrac{x_1 + x_2}{2}, \\tfrac{x_1 + x_2}{2}\\big)$: the projection of $x^{(0)}$ onto the diagonal." />
    </div>
  )
}
