---
title: "Linear Regression from Scratch"
description: "Deriving least squares from first principles and solving it two ways — the normal equations and gradient descent — in NumPy."
category: "Mathematics and Optimization"
technologies:
  - Python
  - NumPy
github_url: ""
status: "In progress"
featured: true
order: 2
---

<div class="notice notice--todo" markdown="1">
**Starter content — please review.** The derivation is standard; the code is an
illustrative implementation written for this page. Replace it with your own
work and add only experiments you have actually run.
</div>

## Overview

Linear regression is the simplest model where every piece of the machine
learning pipeline — model, loss, optimization, evaluation — can be written
down exactly. This project derives ordinary least squares, implements a
closed-form solver and a gradient descent solver, and compares the two.

## Problem statement

Given $n$ examples $(x_i, y_i)$ with $x_i \in \mathbb{R}^d$ and
$y_i \in \mathbb{R}$, find a linear function that predicts $y$ from $x$.
Stacking examples into a design matrix $X \in \mathbb{R}^{n \times (d+1)}$
whose first column is all ones (for the intercept), the model is

$$
\hat{y} = X w, \qquad w \in \mathbb{R}^{d+1}.
$$

The **residual** of example $i$ is $r_i = y_i - \hat{y}_i$, the gap between
truth and prediction.

## Mathematical foundations

### Objective

We minimize the mean squared error

$$
L(w) = \frac{1}{n} \lVert y - Xw \rVert_2^2 = \frac{1}{n}\sum_{i=1}^n \bigl(y_i - x_i^\top w\bigr)^2 .
$$

$L$ is a convex quadratic in $w$, so any stationary point is a global minimum.

### Gradient and the normal equations

Expanding $L(w) = \frac{1}{n}\left(y^\top y - 2 w^\top X^\top y + w^\top X^\top X w\right)$ and differentiating,

$$
\nabla_w L(w) = \frac{2}{n} X^\top (Xw - y).
$$

Setting the gradient to zero gives the **normal equations**

$$
X^\top X \, w^\star = X^\top y .
$$

When $X$ has full column rank, $X^\top X$ is invertible and
$w^\star = (X^\top X)^{-1} X^\top y$. Geometrically, $Xw^\star$ is the
orthogonal projection of $y$ onto the column space of $X$: the residual
vector is orthogonal to every column, $X^\top (y - Xw^\star) = 0$.

### Gradient descent

The iteration $w_{t+1} = w_t - \eta \nabla_w L(w_t)$ converges for any
starting point if and only if the step size satisfies

$$
0 < \eta < \frac{2}{\lambda_{\max}(H)}, \qquad H = \nabla^2 L = \frac{2}{n} X^\top X,
$$

assuming $H$ is positive definite. The convergence rate is governed by the
condition number $\kappa = \lambda_{\max}(H) / \lambda_{\min}(H)$, which is
why standardizing features speeds up gradient descent noticeably.

## Implementation

```python
import numpy as np


def add_intercept(X):
    return np.hstack([np.ones((X.shape[0], 1)), X])


def fit_closed_form(X, y):
    """Least squares via a numerically stable solver (not an explicit inverse)."""
    w, *_ = np.linalg.lstsq(X, y, rcond=None)
    return w


def fit_gradient_descent(X, y, lr=0.1, steps=1000):
    n, d = X.shape
    w = np.zeros(d)
    history = []
    for _ in range(steps):
        residual = X @ w - y
        history.append(residual @ residual / n)      # MSE before the update
        w -= lr * (2.0 / n) * (X.T @ residual)
    return w, history
```

`np.linalg.lstsq` uses an SVD-based solver, which is more stable than forming
$(X^\top X)^{-1}$ explicitly — inverting $X^\top X$ squares the condition
number of the problem.

## Experiments and results

<div class="notice notice--todo" markdown="1">
**No results recorded yet.** Suggested experiments:

1. **Synthetic recovery.** Generate $y = Xw_{\text{true}} + \varepsilon$ with
   Gaussian noise; check that both solvers recover $w_{\text{true}}$ as $n$ grows.
2. **Step size.** Plot loss curves for several $\eta$ values on either side of
   $2/\lambda_{\max}(H)$ to see convergence and divergence.
3. **Feature scaling.** Compare iterations to convergence with and without
   standardization, alongside the condition number $\kappa$.
4. **Agreement.** Report $\lVert w_{\text{GD}} - w_{\text{closed}} \rVert$.
</div>

## Limitations and future improvements

- Assumes a linear relationship; polynomial or basis-function features would
  extend it.
- No regularization yet: ridge regression adds $\lambda \lVert w \rVert^2$ and
  makes $X^\top X + \lambda I$ invertible even when $X$ is rank-deficient.
- Squared error is sensitive to outliers; a Huber loss is a robust alternative.

## Source code and resources

- Source code: *add your repository link in the front matter.*
- Related writing: [Linear Regression: Derivation and Implementation from Scratch]({% link _posts/2026-07-22-linear-regression-derivation.md %})
- Reference: Hastie, Tibshirani, and Friedman, *The Elements of Statistical Learning*, Chapter 3.
