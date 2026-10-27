---
title: "Linear Regression: Derivation and Implementation from Scratch"
summary: "Least squares from three angles — calculus, geometry, and probability — followed by a NumPy implementation using both the normal equations and gradient descent."
categories: [Machine Learning]
tags: [regression, optimization, linear-algebra, numpy]
related_projects: [linear-regression-from-scratch]
---

Linear regression is usually the first model in a machine learning course and
the first one people skip past. It deserves more attention: it is one of the
few models where the optimal parameters have a closed form, and the same
problem can be understood through calculus, geometry, and probability.

<!--more-->

## Setup

We observe $n$ pairs $(x_i, y_i)$ with features $x_i \in \mathbb{R}^d$ and
targets $y_i \in \mathbb{R}$. Prepending a constant $1$ to each $x_i$ to absorb
the intercept, we stack the data into a design matrix
$X \in \mathbb{R}^{n \times p}$ with $p = d + 1$ and a target vector
$y \in \mathbb{R}^n$. The model predicts

$$
\hat{y} = Xw .
$$

The **residuals** $r = y - Xw$ measure how far each prediction is from its
target.

## View 1: calculus

Choose $w$ to minimize the sum of squared residuals,

$$
J(w) = \lVert y - Xw \rVert_2^2 = (y - Xw)^\top (y - Xw).
$$

Expanding, $J(w) = y^\top y - 2 y^\top X w + w^\top X^\top X w$. Using
$\nabla_w (a^\top w) = a$ and $\nabla_w (w^\top A w) = 2Aw$ for symmetric
$A$:

$$
\nabla_w J(w) = -2X^\top y + 2X^\top X w = 2X^\top (Xw - y).
$$

The Hessian $\nabla^2 J = 2X^\top X$ is positive semidefinite, so $J$ is convex
and every stationary point is a global minimum. Setting the gradient to zero
yields the **normal equations**:

$$
X^\top X \, w^\star = X^\top y .
$$

If the columns of $X$ are linearly independent, $X^\top X$ is positive
definite (hence invertible) and the minimizer is unique:

$$
w^\star = (X^\top X)^{-1} X^\top y .
$$

## View 2: geometry

The set $\lbrace Xw : w \in \mathbb{R}^p \rbrace$ is the column space of $X$, a
subspace of $\mathbb{R}^n$. Minimizing $\lVert y - Xw \rVert$ means finding the
point in that subspace closest to $y$ — the **orthogonal projection** of $y$.

The normal equations say exactly this. Rewriting them as
$X^\top (y - Xw^\star) = 0$ shows that the residual is orthogonal to every
column of $X$. The fitted values are $\hat{y} = Py$ with the projection
("hat") matrix

$$
P = X (X^\top X)^{-1} X^\top ,
$$

which satisfies $P^2 = P$ and $P^\top = P$, as a projection should.

## View 3: probability

Assume the data were generated as $y_i = x_i^\top w + \varepsilon_i$ with
independent noise $\varepsilon_i \sim \mathcal{N}(0, \sigma^2)$. The
log-likelihood of $w$ is

$$
\log p(y \mid X, w) = -\frac{n}{2}\log(2\pi\sigma^2) - \frac{1}{2\sigma^2} \sum_{i=1}^n (y_i - x_i^\top w)^2 .
$$

Only the last term depends on $w$, so **maximizing the likelihood is the same
as minimizing squared error**. Least squares is the maximum likelihood
estimator under Gaussian noise — which also tells us when it is a poor choice
(heavy-tailed noise, outliers).

## Solving it numerically

### Closed form

Never compute $(X^\top X)^{-1}$ explicitly. Forming $X^\top X$ squares the
condition number of the problem, amplifying rounding error. Use a QR- or
SVD-based least squares solver instead:

```python
import numpy as np

w_star, *_ = np.linalg.lstsq(X, y, rcond=None)
```

### Gradient descent

For large $n$ or $p$, or as a stepping stone to models with no closed form,
use gradient descent on the mean squared error
$L(w) = \frac{1}{n} J(w)$:

$$
w_{t+1} = w_t - \eta \cdot \frac{2}{n} X^\top (X w_t - y).
$$

```python
def gradient_descent(X, y, lr=0.05, steps=2000):
    n, p = X.shape
    w = np.zeros(p)
    for _ in range(steps):
        grad = (2.0 / n) * X.T @ (X @ w - y)
        w -= lr * grad
    return w
```

On a quadratic objective the behavior is fully predictable. With Hessian
$H = \frac{2}{n} X^\top X$, the error $e_t = w_t - w^\star$ evolves as
$e_{t+1} = (I - \eta H) e_t$, so the iteration converges exactly when every
eigenvalue of $I - \eta H$ has magnitude less than one:

$$
0 < \eta < \frac{2}{\lambda_{\max}(H)} .
$$

The slowest direction contracts by a factor of $1 - \eta \lambda_{\min}(H)$ per
step, which is why poorly scaled features (large condition number
$\lambda_{\max}/\lambda_{\min}$) make gradient descent crawl. Standardizing
features is often the single most effective fix.

### A quick check

*Illustrative experiment — run it yourself to confirm.* Generate data with a
known $w$ and verify that both solvers agree:

```python
rng = np.random.default_rng(0)
n, d = 500, 3
X = np.hstack([np.ones((n, 1)), rng.normal(size=(n, d))])
w_true = np.array([2.0, -1.0, 0.5, 3.0])
y = X @ w_true + rng.normal(scale=0.1, size=n)

w_closed, *_ = np.linalg.lstsq(X, y, rcond=None)
w_gd = gradient_descent(X, y)
print(np.round(w_closed, 3), np.round(w_gd, 3))
```

With small noise both estimates should be close to `w_true` and to each
other.

## Where to go next

- **Ridge regression** adds $\lambda \lVert w \rVert^2$, giving
  $(X^\top X + \lambda I) w = X^\top y$, which is always solvable for
  $\lambda > 0$.
- **Logistic regression** keeps the linear model but changes the loss; it has
  no closed form, so the gradient descent machinery above becomes essential.
- The [neural network post]({% link _posts/2026-08-14-backpropagation-chain-rule.md %})
  generalizes the same gradient computation to many layers.

The full implementation and experiments live in the
[Linear Regression from Scratch]({% link _projects/linear-regression-from-scratch.md %}) project.
