/**
 * Exam question inventory. `wording` is transcribed from the original midterm PDFs with
 * notation preserved; `solutionStatus` records provenance. Nothing here is invented.
 */
export type SolutionStatus = 'official-key' | 'official-key-partially-garbled' | 'independently-derived'

export interface ExamPart {
  id: string
  prompt: string
}

export interface ExamQuestion {
  id: string
  year: number
  number: string
  title: string
  points: number
  lectures: number[]
  prereqs: string[]
  pattern: string
  wording: string
  parts: ExamPart[]
  solutionStatus: SolutionStatus
  /** transcribed key, by part id */
  key: Record<string, string>
  module?: string
  notes?: string
}

export const exams: ExamQuestion[] = [
  {
    id: '2021-Q2', year: 2021, number: 'Q2', title: 'MAP Estimation', points: 35, lectures: [12, 15, 16], prereqs: ['gaussian-density'], pattern: 'map-forward-prior', module: 'mapopt',
    wording: 'Consider an inverse problem in which the MAP estimate is given by $\\hat x = \\arg\\min_x\\{\\tfrac{1}{2\\sigma^2}\\|y-Ax\\|^2 + \\beta u(x)\\}$ where $y\\in\\mathbb R^M$, $x\\in\\mathbb R^N$, $A\\in\\mathbb R^{M\\times N}$, $\\beta\\ge0$, and $u:\\mathbb R^N\\to\\mathbb R^+$ takes on a unique global minimum.',
    parts: [
      { id: '2.1', prompt: 'Write down a specification of the forward model for this problem, i.e., a specification of the random observations $Y$ given the random unknown $X$.' },
      { id: '2.2', prompt: 'Specify the conditional probability of $Y$ given $X$.' },
      { id: '2.3', prompt: 'When $\\beta=0$, the estimate $\\hat x$ has special characteristics. a) What name do you use to describe this estimate? b) What is good and bad about this estimate?' },
      { id: '2.4', prompt: 'Specify the prior probability density for $X$.' },
      { id: '2.5', prompt: 'What happens to the prior distribution as $\\beta\\to0$?' },
      { id: '2.6', prompt: 'What happens to the prior distribution as $\\beta\\to\\infty$?' },
      { id: '2.7', prompt: 'What happens to the MAP estimate $\\hat x$ as $\\beta\\to\\infty$?' },
    ],
    solutionStatus: 'official-key',
    key: {
      '2.1': '$Y = AX + W$ with $W\\sim N(0,\\sigma^2 I)$, $X\\sim \\tfrac1z\\exp\\{-\\beta u(x)\\}$. (The printed key reads $Y = X + W$ and $\\exp\\{-u(x)\\}$; the $A$ and $\\beta$ of the question are restored here, an editorial reading.)',
      '2.2': '$p(y|x) = (2\\pi\\sigma^2)^{-M/2}\\exp\\{-\\tfrac{1}{2\\sigma^2}\\|y-Ax\\|^2\\}$.',
      '2.3': 'a) Maximum likelihood estimate. b) Low bias but typically high variance.',
      '2.4': '$p(x) = \\tfrac{1}{z_\\beta}\\exp\\{-\\beta u(x)\\}$, $z_\\beta = \\int_{\\mathbb R^N}\\exp\\{-\\beta u(x)\\}dx$.',
      '2.5': 'The prior becomes constant: uniform over the space of solutions.',
      '2.6': 'The prior becomes $\\delta(x-x^*)$ with $x^* = \\arg\\min u(x)$: concentrated at the most probable value.',
      '2.7': '$\\hat x = x^*$: the most probable prior value, independent of the data.',
    },
  },
  {
    id: '2021-Q3', year: 2021, number: 'Q3', title: 'Non-causal Models', points: 30, lectures: [7, 9, 10, 11], prereqs: ['complex-euler', 'dtft', 'convolution', 'time-reversal', 'psd', 'precision-matrix'], pattern: 'ar-gmrf', module: 'ar-gmrf',
    wording: 'Consider a 1D zero-mean stationary Gaussian AR process $X_n$ with prediction filter given by $h(n) = \\rho\\,\\delta(n-1)$ and causal prediction variance $\\sigma_c^2>0$ where $|\\rho|<1$.',
    parts: [
      { id: '3.1', prompt: 'Calculate an expression for $S_X(e^{j\\omega})$, the power spectral density of $X_n$.' },
      { id: '3.2', prompt: 'Calculate an expression for the non-causal prediction filter $g(n)$.' },
      { id: '3.3', prompt: 'Calculate an expression for the non-causal prediction variance $\\sigma_{nc}^2$.' },
      { id: '3.4', prompt: 'Is $X_n$ an MRF? Justify your answer.' },
      { id: '3.5', prompt: 'Define the column vector $Z = [X_n, X_{n+1}, \\ldots, X_{n+p-1}]^t$ and let $B$ be the precision matrix for $Z$ so that $Z\\sim N(0,B^{-1})$. Which entries in $B$ are zero and which are not zero?' },
      { id: '3.6', prompt: 'Specify the values of the entries in $B$. Hint: most of the entries are easy to specify. However, the entries in the first and last row are trickier to calculate.' },
    ],
    solutionStatus: 'official-key-partially-garbled',
    key: {
      '3.1': '$S_X(e^{j\\omega}) = \\dfrac{\\sigma_c^2}{|1-\\rho e^{-j\\omega}|^2}$',
      '3.2': '$g(n) = \\dfrac{\\rho}{1+\\rho^2}[\\delta(n-1)+\\delta(n+1)]$',
      '3.3': '$\\sigma_{nc}^2 = \\dfrac{\\sigma_c^2}{1+\\rho^2}$',
      '3.4': 'Yes: any 1D AR process of order $P$ is a 1D MRF of order $P$.',
      '3.5': '$B_{i,j}\\ne0$ if $|i-j|\\le1$; $B_{i,j}=0$ if $|i-j|>1$ (tridiagonal).',
      '3.6': 'Interior: $B_{i,i} = (1+\\rho^2)/\\sigma_c^2$, $B_{i,i\\pm1} = -\\rho/\\sigma_c^2$. Boundary rows $B_{0,0} = B_{p-1,p-1} = 1/\\sigma_c^2$. (The matrix in the PDF key is garbled by text extraction; this app recomputes $B = R^{-1}$ numerically from the stationary covariance and verifies these entries.)',
    },
    notes: 'Boundary entries recomputed numerically; see argmrf.test.ts.',
  },
  {
    id: '2021-Q4', year: 2021, number: 'Q4', title: 'Surrogate Functions', points: 30, lectures: [18, 19], prereqs: ['calculus-1d'], pattern: 'surrogate', module: 'surrogate',
    wording: 'Let $f(x)$ be a non-negative function and $q(x;x^\\prime)$ a surrogate for minimizing $f$: $f(x^\\prime) = q(x^\\prime;x^\\prime)$ and $f(x)\\le q(x;x^\\prime)$. The MM algorithm sets $C_k\\leftarrow f(x_k)$, $x_{k+1}\\leftarrow\\arg\\min_x q(x;x_k)$.',
    parts: [
      { id: '4.1', prompt: 'Sketch a figure illustrating the intuition behind the surrogate function; label $x^\\prime$, $f(x^\\prime)$, $q(x^\\prime;x^\\prime)$.' },
      { id: '4.2', prompt: 'Prove that $\\forall k$, $C_k\\le C_{k-1}$.' },
      { id: '4.3', prompt: 'Prove that $C_\\infty = \\lim_{k\\to\\infty}C_k$ exists.' },
      { id: '4.4', prompt: 'Assume $f(x) = |x|$. Find a surrogate $q(x;x^\\prime) = ax^2+b$; determine $a$ and $b$ as functions of $x^\\prime$.' },
      { id: '4.5', prompt: 'Use 4.4 to calculate a surrogate $g(x;x^\\prime)$ for $g(x) = \\tfrac12(x-2)^2+|x|$.' },
      { id: '4.6', prompt: 'Using the surrogate of 4.5, calculate $x_1\\leftarrow\\arg\\min_x g(x;1)$.' },
    ],
    solutionStatus: 'official-key',
    key: {
      '4.2': '$C_k = f(x_k)\\le q(x_k;x_{k-1})\\le q(x_{k-1};x_{k-1}) = f(x_{k-1}) = C_{k-1}$.',
      '4.3': 'Monotone non-increasing and bounded below by 0 ⇒ converges.',
      '4.4': 'Match slopes at $x^\\prime$: $2ax^\\prime = \\mathrm{sign}(x^\\prime)$ ⇒ $a = 1/(2|x^\\prime|)$, $b = |x^\\prime|/2$.',
      '4.5': '$g(x;x^\\prime) = \\tfrac12(x-2)^2 + \\tfrac{1}{2|x^\\prime|}x^2$ (+ const).',
      '4.6': '$g(x;1) = \\tfrac12(x-2)^2+\\tfrac12x^2$, minimized at $x_1 = 1$.',
    },
  },
  {
    id: '2022-Q2', year: 2022, number: 'Q2', title: 'GMRF precision matrix', points: 35, lectures: [9, 10, 11], prereqs: ['gaussian-density', 'precision-matrix'], pattern: 'ar-gmrf',
    wording: 'Consider a zero mean $N$-dimensional GMRF $X$ with density $p(x) = \\tfrac1z\\exp\\{-\\tfrac12x^tBx\\}$ where $B_{i,j} = a_{(i-j)\\bmod N}$ and $i,j\\in\\{0,\\ldots,N-1\\}$.',
    parts: [
      { id: '2.1', prompt: 'What is the name given to the matrix $B$?' },
      { id: '2.2', prompt: 'Give an explicit expression for the value of $z$.' },
      { id: '2.3', prompt: 'If for $i\\ne j$ we have $B_{i,j}\\ne0$, what do you know about the relationship between $X_i$ and $X_j$?' },
      { id: '2.4', prompt: 'Write an expression for $E[X_i|X_j, j\\ne i]$ in terms of $a_i$.' },
      { id: '2.5', prompt: 'Write an expression for $p(x_i|x_j, j\\ne i)$ in terms of $a_i$.' },
    ],
    solutionStatus: 'official-key',
    key: {
      '2.1': 'The precision matrix.',
      '2.2': '$z = (2\\pi)^{N/2}|B|^{-1/2}$.',
      '2.3': '$X_i$ and $X_j$ are neighbors; $p(x_i|x_k,k\\ne i)$ depends on $x_j$.',
      '2.4': '$E[X_i|X_j,j\\ne i] = -\\sum_{j\\ne i}\\dfrac{a_{(i-j)\\bmod N}}{a_0}X_j$.',
      '2.5': 'Gaussian with mean $\\mu_i = -\\sum_{j\\ne i}\\frac{a_{(i-j)\\bmod N}}{a_0}X_j$ and variance $\\sigma^2 = 1/a_0$.',
    },
  },
  {
    id: '2022-Q3', year: 2022, number: 'Q3', title: 'Augmented Lagrangian and ADMM', points: 35, lectures: [21, 22, 24], prereqs: ['lagrangian', 'convexity'], pattern: 'prox-admm', module: 'prox',
    wording: 'Consider an inverse problem in which the MAP estimate is given by $\\hat x = \\arg\\min_x\\{f(x) + h(x)\\}$ where $x \\in \\mathbb R^N$, and the two functions $f: \\mathbb R^N \\to \\mathbb R \\cup \\{\\infty\\}$ and $h: \\mathbb R^N \\to \\mathbb R \\cup \\{\\infty\\}$ are proper closed convex functions.',
    parts: [
      { id: '3.1', prompt: 'Write an equivalent expression for $\\hat x$ based on the constrained optimization of two variables, $(x, v)$.' },
      { id: '3.2', prompt: 'Write out an expression for the augmented Lagrangian $L(x, v; u)$ which solves the problem for the proper value of $u$.' },
      { id: '3.3', prompt: 'Let $(\\hat x, \\hat v) = \\arg\\min_{(x,v)}L(x, v; u)$. As $u$ is increased, what will happen to the values of $\\hat x$ and $\\hat v$?' },
      { id: '3.4', prompt: 'Give an algorithm for solving the problem that uses the following two functions: $F(z) = \\arg\\min_x\\{f(x) + \\tfrac a2\\|x - z\\|^2\\}$ and $H(z) = \\arg\\min_x\\{h(x) + \\tfrac a2\\|x - z\\|^2\\}$.' },
      { id: '3.5', prompt: 'If we choose $h(x) = \\infty$ if $\\exists i$ s.t. $x_i < 0$, and $0$ otherwise, then calculate an explicit expression for $H(z)$.' },
    ],
    solutionStatus: 'official-key',
    key: {
      '3.1': '$(\\hat x, \\hat v) = \\arg\\min_{(x,v):\\ x = v}\\{f(x) + h(v)\\}$.',
      '3.2': '$L(x, v; u) = f(x) + h(v) + \\tfrac a2\\|x - v + u\\|^2$.',
      '3.3': 'As $u$ is increased, it will decrease the value of $\\hat x - \\hat v$: it will tend to decrease $\\hat x$ and increase $\\hat v$.',
      '3.4': '$u \\leftarrow 0$, $v \\leftarrow 0$; Repeat until converged { $x \\leftarrow F(v - u)$; $v \\leftarrow H(x + u)$; $u \\leftarrow u + (x - v)$ }; Return($x$).',
      '3.5': '$[H(z)]_i = 0$ for $z_i < 0$, $z_i$ otherwise: $[H(z)]_i = \\max(z_i, 0)$.',
    },
  },
  {
    id: '2022-Q4', year: 2022, number: 'Q4', title: 'Surrogate for ½‖y−Ax‖²', points: 30, lectures: [18, 19, 13], prereqs: ['matrix-calculus', 'eigenvalues'], pattern: 'surrogate', module: 'surrogate',
    wording: '$f(x) = \\tfrac12\\|y-Ax\\|^2$ with quadratic surrogate $f(x;x^\\prime) = \\tfrac a2\\|x-x^\\prime\\|^2 + b^t(x-x^\\prime)+c$.',
    parts: [
      { id: '4.1', prompt: 'Calculate $\\nabla f(x)$ and the Hessian.' },
      { id: '4.2', prompt: 'Calculate $c$ and $b$.' },
      { id: '4.3', prompt: 'Calculate $B$ so that $\\tfrac12(x-x^\\prime)^tB(x-x^\\prime)+b^t(x-x^\\prime)+c$ is the Taylor expansion about $x^\\prime$.' },
      { id: '4.4', prompt: 'Find $a$ so that $f(x;x^\\prime)$ is a surrogate.' },
      { id: '4.5', prompt: 'Give an iterative algorithm for $\\hat x$ using the surrogate.' },
    ],
    solutionStatus: 'official-key',
    key: {
      '4.1': '$\\nabla f = A^t(Ax-y)$, Hessian $A^tA$.',
      '4.2': '$c = \\tfrac12\\|y-Ax^\\prime\\|^2$, $b = A^t(Ax^\\prime-y)$.',
      '4.3': '$B = A^tA$.',
      '4.4': '$a = \\lambda_{\\max}(A^tA)$.',
      '4.5': '$x\\leftarrow x - \\tfrac1a A^t(Ax-y)$: gradient descent.',
    },
  },
  {
    id: '2023-P1', year: 2023, number: 'P1', title: 'Emotional Equations', points: 22, lectures: [23], prereqs: ['convexity'], pattern: 'prox-admm', module: 'prox',
    wording: 'Write 50 words or less that describe your feelings and interpretation of the following equation: $F(z) = \\arg\\min_x\\{f(x) + \\tfrac{1}{2\\sigma^2}\\|x - z\\|^2\\}$.',
    parts: [{ id: '1', prompt: 'Interpret the equation.' }],
    solutionStatus: 'official-key',
    key: { '1': 'Instructor’s answer: this is the typical form for a proximal map. $F$ takes inputs from $\\mathbb R^N$ and maps them back to $\\mathbb R^N$. Intuitively, $F$ returns a vector which moves towards the minimum of $f(x)$, but remains in the proximity of $z$; hence its name. (The key also prints two ChatGPT answers, prose and poem.)' },
  },
  {
    id: '2023-P2', year: 2023, number: 'P2', title: 'MAP Estimation', points: 36, lectures: [12, 13, 14], prereqs: ['matrix-calculus', 'gaussian-density'], pattern: 'map-forward-prior', module: 'mapopt',
    wording: 'Consider the following MAP estimator $\\hat x = \\arg\\min_x f(x)$, $f(x) = \\tfrac{1}{2\\sigma_w^2}\\|y - Ax\\|^2 + \\tfrac{1}{2\\sigma_x^2}\\|x\\|^2$, where $\\lambda = \\sigma_w^2/\\sigma_x^2$.',
    parts: [
      { id: 'a', prompt: 'Write the forward model corresponding to this MAP estimator.' },
      { id: 'b', prompt: 'Calculate the gradient, $\\nabla f(x)$.' },
      { id: 'c', prompt: 'Calculate a closed form expression for the MAP estimate, $\\hat x$.' },
      { id: 'd', prompt: 'Give the pseudo-code for the gradient descent algorithm.' },
      { id: 'e', prompt: 'Calculate the ICD update for the $i^{th}$ pixel, $x_i$.' },
      { id: 'f', prompt: 'Give the pseudo-code for the ICD algorithm.' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: '$Y = AX + W$ with $X \\perp W$, $X \\sim N(0, \\sigma_x^2 I)$, $W \\sim N(0, \\sigma_w^2 I)$.',
      b: '$\\nabla f(x) = -\\tfrac{1}{\\sigma_w^2}A^t(y - Ax) + \\tfrac{1}{\\sigma_x^2}x$.',
      c: 'Set $\\nabla f(\\hat x) = 0$: $0 = -A^t(y - A\\hat x) + \\lambda\\hat x = -A^ty + (A^tA + \\lambda I)\\hat x$, so $\\hat x = (A^tA + \\lambda I)^{-1}A^ty$.',
      d: 'Initialize $x$; Repeat { $x \\leftarrow x + \\beta[A^t(y - Ax) - \\lambda x]$ } where $\\beta = \\alpha\\sigma_w^2$ (the update $x \\leftarrow x - \\alpha\\nabla f(x)$).',
      e: 'With $[\\epsilon_j]_i = \\delta(j - i)$ and $x_i \\leftarrow x_i + \\alpha$: $0 = [\\nabla f(x + \\alpha\\epsilon_i)]_i = -(y - Ax - \\alpha A_{*,i})^tA_{*,i} + \\lambda(x_i + \\alpha)$, so $\\alpha = \\dfrac{(y - Ax)^tA_{*,i} - \\lambda x_i}{\\|A_{*,i}\\|^2 + \\lambda}$.',
      f: 'Initialize $x$; Repeat { For each pixel $i$ { $\\alpha \\leftarrow \\dfrac{(y - Ax)^tA_{*,i} - \\lambda x_i}{\\|A_{*,i}\\|^2 + \\lambda}$; $x_i \\leftarrow x_i + \\alpha$ } }. Not required, the fast version: Initialize $e \\leftarrow y - Ax$; in the loop $\\alpha \\leftarrow \\dfrac{e^tA_{*,i} - \\lambda x_i}{\\|A_{*,i}\\|^2 + \\lambda}$, $x_i \\leftarrow x_i + \\alpha$, $e \\leftarrow e - \\alpha A_{*,i}$.',
    },
  },
  {
    id: '2023-P3', year: 2023, number: 'P3', title: 'Surrogate for the Poisson NLL', points: 42, lectures: [18, 19], prereqs: ['calculus-1d'], pattern: 'surrogate', module: 'surrogate',
    wording: 'Poisson $p_\\theta(y) = \\theta^ye^{-\\theta}/y!$, $\\theta\\ge0$.',
    parts: [
      { id: 'a', prompt: 'Negative log likelihood.' }, { id: 'b', prompt: 'Simplest $f(\\theta) = -\\log p_\\theta(y)+C(y)$.' }, { id: 'c', prompt: 'Sketch for $y=1$.' },
      { id: 'd', prompt: 'Prove convexity for $\\theta>0$.' }, { id: 'e', prompt: 'ML estimate $\\hat\\theta = T(Y)$.' }, { id: 'f', prompt: 'First and second derivatives.' },
      { id: 'g', prompt: 'Find $a(\\theta^\\prime), b(\\theta^\\prime)$ so that $\\tfrac{a}{2}(\\theta-\\theta^\\prime)^2+b(\\theta-\\theta^\\prime)$ is a surrogate for $\\theta\\ge1$.' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: '$-\\log p = -y\\log\\theta+\\theta+\\log y!$', b: '$f(\\theta) = \\theta - y\\log\\theta$', d: '$f^{\\prime\\prime} = y/\\theta^2>0$', e: '$\\hat\\theta = y$',
      f: '$g = 1-y/\\theta$, $h = y/\\theta^2$', g: '$b = 1-y/\\theta^\\prime$, $a = \\max_{\\theta\\ge1}y/\\theta^2 = y$ (maximum curvature).',
    },
  },
  {
    id: '2024-P1', year: 2024, number: 'P1', title: 'ICD update', points: 30, lectures: [13, 14], prereqs: ['matrix-calculus', 'calculus-1d'], pattern: 'optimization', module: 'mapopt',
    wording: 'Our goal is to minimize the MAP cost function $f(x) = \\tfrac12\\|y - Ax\\|^2 + \\tfrac12 x^tBx$, by performing the line search given by $\\alpha^* = \\arg\\min_\\alpha\\{f(x + \\alpha d)\\}$, where $d$ is the direction.',
    parts: [
      { id: 'a', prompt: 'For gradient descent optimization, give an expression for $d$.' },
      { id: 'b', prompt: 'For gradient descent optimization, derive an expression for $\\alpha^*$.' },
      { id: 'c', prompt: 'For coordinate descent optimization, give an expression for $d$.' },
      { id: 'd', prompt: 'For coordinate descent optimization, derive an expression for $\\alpha^*$.' },
      { id: 'e', prompt: 'Give a condition on $d$ that ensures that $\\alpha^* \\ge 0$.' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: '$d = -\\nabla f(x) = A^t(y - Ax) - Bx$.',
      b: '$0 = \\frac{d}{d\\alpha}f(x + \\alpha d) = d^t\\nabla f(x + \\alpha d) = \\alpha\\,d^t[A^tA + B]d - d^t[A^t(y - Ax) - Bx]$, so $\\alpha^* = \\dfrac{d^t[A^t(y - Ax) - Bx]}{d^t[A^tA + B]d}$. For gradient descent $d = A^t(y - Ax) - Bx$, hence $\\alpha^* = \\dfrac{d^td}{d^t[A^tA + B]d}$.',
      c: '$d = e_i$ where $e_i \\in \\mathbb R^N$ with $[e_i]_k = \\delta(i - k)$.',
      d: 'Taking $d = e_i$ in (b): $\\alpha^* = \\dfrac{(y - Ax)^tA_{*,i} - x^tB_{*,i}}{\\|A_{*,i}\\|^2 + B_{i,i}}$.',
      e: '$d^t\\nabla f(x) \\le 0$, i.e. $d^t[A^t(y - Ax) - Bx] \\ge 0$, which makes the numerator of $\\alpha^*$ nonnegative.',
    },
  },
  {
    id: '2024-P2', year: 2024, number: 'P2', title: 'Surrogates of |x|, |x−z|, Σ|x−x_k|', points: 48, lectures: [18, 19], prereqs: ['calculus-1d'], pattern: 'surrogate', module: 'surrogate',
    wording: '$\\rho(x) = |x|$, $f_z(x) = |x-z|$, $g(x) = \\sum_{k=0}^{K-1}|x-x_k|$.',
    parts: [
      { id: 'a', prompt: 'Sketch a plot of $\\rho(x)$.' },
      { id: 'b', prompt: 'Sketch the best quadratic surrogate function $\\rho(x;x^\\prime)$ together with $\\rho(x)$ for $x^\\prime = 1$.' },
      { id: 'c', prompt: 'Determine a general expression for the best quadratic surrogate function $\\rho(x;x^\\prime)$ for general choices of $x$ and $x^\\prime$.' },
      { id: 'd', prompt: 'Sketch a plot of $f_z(x)$ when $z = 1$.' },
      { id: 'e', prompt: 'Sketch the best quadratic surrogate function $f_z(x;x^\\prime)$ together with $f_z(x)$ for $z = 1$ and $x^\\prime = 2$.' },
      { id: 'f', prompt: 'Determine a general expression for the best quadratic surrogate function $f_z(x;x^\\prime)$ for general choices of $x$, $x^\\prime$ and $z$.' },
      { id: 'g', prompt: 'Determine a general expression for the best quadratic surrogate function $g(x;x^\\prime)$ for general choices of $x$, $x^\\prime$ and $x_k$.' },
      { id: 'h', prompt: 'Specify an iterative algorithm in terms of the surrogate function $g(x;x^\\prime)$ that will converge to the global minimum of the function.' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: 'Figure in the key: the V-shaped graph of $|x|$.', b: 'Figure in the key: $|x|$ with the parabola $x^2/2$ (+ const) touching it at $x = \\pm1$.',
      d: 'Figure in the key: $|x-1|$.', e: 'Figure in the key: $|x-1|$ with the parabola $(x-1)^2/2$ (+ const) touching at $x = 2$ and $x = 0$.',
      c: '$\\rho(x;x^\\prime) = \\dfrac{x^2}{2|x^\\prime|}$ (does not exist at $x^\\prime=0$).',
      f: '$f_z(x;x^\\prime) = \\dfrac{(x-z)^2}{2|x^\\prime-z|}$.',
      g: '$g(x;x^\\prime) = \\sum_k\\dfrac{(x-x_k)^2}{2|x^\\prime-x_k|}$.',
      h: 'Repeat $x^\\prime\\leftarrow\\arg\\min_x g(x;x^\\prime)$ (a weighted mean of the $x_k$).',
    },
  },
  {
    id: '2024-P3', year: 2024, number: 'P3', title: 'Proximal Maps', points: 24, lectures: [23, 12], prereqs: ['convexity', 'matrix-calculus'], pattern: 'prox-admm', module: 'prox',
    wording: 'Define the cost function $f_v(x) = u(x) + \\tfrac{1}{2\\sigma^2}\\|x - v\\|^2$ and the associated proximal map $F(v) = \\arg\\min_{x\\in\\mathbb R^N}f_v(x)$, where $u: \\mathbb R^N \\to \\mathbb R \\cup \\{\\infty\\}$ is a continuously differentiable proper closed convex function.',
    parts: [
      { id: 'a', prompt: 'Provide the outline of a proof that the function $f_v: \\mathbb R^N \\to \\mathbb R \\cup \\{\\infty\\}$ takes on a minimum value. (Hint: you can use the theorem that any continuous function on a compact set, i.e. closed and bounded, takes on its minimum value.)' },
      { id: 'b', prompt: 'Using the result of 3a above, prove that the function $f_v$ takes on a unique minimum.' },
      { id: 'c', prompt: 'Let $u(x; y) = \\tfrac12\\|y - Ax\\|_\\Lambda^2$ so that $F(v; y) = \\arg\\min_x\\{\\tfrac12\\|y - Ax\\|_\\Lambda^2 + \\tfrac{1}{2\\sigma^2}\\|x - v\\|^2\\}$. Then show that the proximal map has the explicit form $F(v; y) = v + (\\tfrac{1}{\\sigma^2}I + A^t\\Lambda A)^{-1}A^t\\Lambda(y - Av)$.' },
      { id: 'd', prompt: 'Let $F(v; y)$ be a proximal map with the form above. Then show that $F(v; Y)$ has an interpretation as the MAP estimate of $X$ given $Y$ under the assumption that $Y = AX + W$ where $X$ and $W$ are independent Gaussian random vectors with $X \\sim N(v, \\sigma^2 I)$ and $W \\sim N(0, \\Lambda^{-1})$.' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: '1. Since $u$ is proper, there exists $x$ with $f_v(x) < \\infty$. 2. There exists $\\alpha$ such that $\\mathcal A = \\{x: f_v(x) \\le \\alpha\\}$ is closed and bounded. 3. By the stated theorem there is $x^*$ that is the global minimum of $f_v$ on $\\mathcal A$. 4. Then $x^*$ must be the minimum of $f_v$ on $\\mathbb R^N$.',
      b: 'Since $f_v$ is strictly convex, $x^*$ must be the unique minimum of $f_v$ on $\\mathbb R^N$.',
      c: 'Let $z = x - v$ and minimise $\\tilde f(z) = \\tfrac12\\|\\epsilon - Az\\|_\\Lambda^2 + \\tfrac{1}{2\\sigma^2}\\|z\\|^2$ with $\\epsilon = y - Av$: $z^* = (\\tfrac{1}{\\sigma^2}I + A^t\\Lambda A)^{-1}A^t\\Lambda(y - Av)$, and $x^* = z^* + v$.',
      d: 'In $f(x) = \\tfrac12\\|y - Ax\\|_\\Lambda^2 + \\tfrac{1}{2\\sigma^2}\\|x - v\\|^2$ the left term is $-\\log p(y|x)$ for $Y = AX + W$ with $W \\sim N(0, \\Lambda^{-1})$, and the right term is $-\\log p(x)$ for $X \\sim N(v, \\sigma^2 I)$.',
    },
  },
  {
    id: '2025-P1', year: 2025, number: 'P1', title: 'Causal and Non-Causal MRFs', points: 35, lectures: [7, 10, 11], prereqs: ['dtft', 'convolution', 'time-reversal', 'psd'], pattern: 'ar-gmrf', module: 'ar-gmrf',
    wording: 'Let $X_n$ be a zero-mean 1-D Gaussian AR process, $h_n$ the MMSE causal prediction filter with causal prediction variance $\\sigma_C^2$, and $g_n$ the MMSE non-causal prediction filter with non-causal prediction variance $\\sigma_{NC}^2$.',
    parts: [
      { id: 'a', prompt: 'Write $S_X(\\omega)$ in terms of the causal parameters $(\\sigma_C^2, h_n)$.' },
      { id: 'b', prompt: 'Write $S_X(\\omega)$ in terms of the noncausal parameters $(\\sigma_{NC}^2, g_n)$.' },
      { id: 'c', prompt: 'Derive an equation relating $(\\sigma_C^2,h_n)$ to $(\\sigma_{NC}^2,g_n)$ by equating a) and b).' },
      { id: 'd', prompt: 'Determine $g_n$ in terms of $h_n$, $\\sigma_C^2$, $\\sigma_{NC}^2$.' },
      { id: 'e', prompt: 'Determine $\\sigma_{NC}^2$ in terms of $(\\sigma_C^2, h_n)$.' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: '$S_X(\\omega) = \\dfrac{\\sigma_C^2}{|1-H(\\omega)|^2}$, $H(\\omega) = \\sum_n h_ne^{-j\\omega n}$.',
      b: '$S_X(\\omega) = \\dfrac{\\sigma_{NC}^2}{1-G(\\omega)}$, $G(\\omega) = \\sum_n g_ne^{-j\\omega n}$.',
      c: '$\\sigma_C^2(\\delta_n-g_n) = \\sigma_{NC}^2(\\delta_n-h_n)*(\\delta_n-h_{-n})$.',
      d: '$g_n = \\delta_n-\\dfrac{\\sigma_{NC}^2}{\\sigma_C^2}(\\delta_n-h_n)*(\\delta_n-h_{-n})$.',
      e: 'Evaluate at $n=0$ with $g_0=0$: $\\sigma_{NC}^2 = \\dfrac{\\sigma_C^2}{1+\\sum_{n=1}^\\infty h_n^2}$.',
    },
  },
  {
    id: '2025-P2', year: 2025, number: 'P2', title: 'Shrinkage Operator', points: 21, lectures: [23], prereqs: ['case-analysis'], pattern: 'prox-admm', module: 'prox',
    wording: 'Consider the proximal map given by $S_\\lambda(y) = \\arg\\min_{x\\in\\mathbb R^N}\\{\\lambda\\|x\\|_1 + \\tfrac12\\|x - y\\|^2\\}$.',
    parts: [
      { id: 'a', prompt: 'Calculate an explicit form for the function $S_\\lambda(y)$ when $N = 1$.' },
      { id: 'b', prompt: 'Calculate an explicit form for the function $S_\\lambda(y)$ when $N > 1$.' },
      { id: 'c', prompt: 'Explain in words (i.e., emotionally) what $S_\\lambda(y)$ does.' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: '$S_\\lambda(y) = y - \\lambda$ for $y \\ge \\lambda$; $0$ for $|y| < \\lambda$; $y + \\lambda$ for $y \\le -\\lambda$.',
      b: 'When $N > 1$, $S_\\lambda(y)$ applies the scalar function to each component: $S_\\lambda(y) = (S_\\lambda(y_0), S_\\lambda(y_1), \\dots, S_\\lambda(y_{N-1}))^t$.',
      c: '$S_\\lambda(y)$ sets any value of $y$ with magnitude less than $\\lambda$ to zero, but allows values with magnitude larger than $\\lambda$ to be maintained, with a shift toward $0$.',
    },
  },
  {
    id: '2025-P3', year: 2025, number: 'P3', title: 'Proximal Maps as MAP', points: 21, lectures: [23, 25], prereqs: ['gaussian-density'], pattern: 'map-forward-prior',
    wording: '$H(y) = \\arg\\min_x\\{\\tfrac{1}{2\\sigma^2}\\|y-x\\|^2+h(x)\\}$ interpreted as a MAP estimate.',
    parts: [{ id: 'a', prompt: 'Forward model: $Y$ given $X$.' }, { id: 'b', prompt: 'Prior $p(x)$.' }, { id: 'c', prompt: 'What happens if you iterate $x\\leftarrow H(x)$?' }, { id: 'd', prompt: 'How would you generate training data and estimate $\\theta$ for a learned $H_\\theta$?' }],
    solutionStatus: 'official-key',
    key: { a: '$Y = X+\\sigma W$, $W\\sim N(0,I)$.', b: '$p(x) = \\tfrac1Z\\exp\\{-h(x)\\}$.', c: 'Converges to $x^* = \\arg\\min h(x)$.', d: 'Sample $X_k$ from the prior, form $Y_k = X_k+\\sigma W_k$, minimize $\\tfrac1K\\sum\\|X_k-H_\\theta(Y_k)\\|^2$.' },
  },
  {
    id: '2025-P4', year: 2025, number: 'P4', title: 'Contraction Mappings', points: 35, lectures: [25], prereqs: ['fixed-point'], pattern: 'fixed-point', module: 'prox',
    wording: 'Consider a function $H: \\mathbb R^2 \\to \\mathbb R^2$ given by $y = H(x)$ where $H(x) = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}x$.',
    parts: [
      { id: 'a', prompt: 'Is $H(x)$ a contraction map?' },
      { id: 'b', prompt: 'Is $H(x)$ non-expansive?' },
      { id: 'c', prompt: 'Does the following iteration converge? Repeat$\\{x \\leftarrow H(x)\\}$. Justify your answer.' },
      { id: 'd', prompt: 'Does the following iteration converge? Repeat$\\{x \\leftarrow (1 - \\alpha)x + \\alpha H(x)\\}$ for $\\alpha \\in (0, 1)$. Justify your answer.' },
      { id: 'e', prompt: 'What does the iteration of 4d converge to?' },
    ],
    solutionStatus: 'official-key',
    key: {
      a: 'No.',
      b: 'Yes.',
      c: 'No, because it will just reflect about the diagonal with each iteration.',
      d: 'Yes, because this is a Mann iteration and $H(x)$ has a fixed point for $x = [t, t]$ for any $t$. So the Mann iteration must converge to one of these fixed points.',
      e: 'If $x^0$ is the initial value and $x^\\infty$ the asymptotic value, the iterations converge to the projection of $x^0$ onto the diagonal: $x^\\infty = \\tfrac{\\langle \\mathbf 1, x^0\\rangle}{2}\\mathbf 1 = \\big(\\tfrac{x^0_0 + x^0_1}{2}, \\tfrac{x^0_0 + x^0_1}{2}\\big)$.',
    },
  },
]

export const examById = Object.fromEntries(exams.map((q) => [q.id, q]))
export const patterns: Record<string, string> = {
  'ar-gmrf': 'Causal AR ↔ noncausal GMRF, precision matrix',
  surrogate: 'Surrogate functions / majorization-minimization',
  'map-forward-prior': 'MAP estimate ↔ forward model ↔ prior',
  'prox-admm': 'Proximal maps, shrinkage, ADMM',
  optimization: 'Gradient descent, ICD, line search',
  'fixed-point': 'Nonexpansive maps and fixed points',
}
