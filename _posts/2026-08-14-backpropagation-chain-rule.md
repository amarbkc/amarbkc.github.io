---
title: "Backpropagation: Understanding the Chain Rule in Neural Networks"
summary: "Backpropagation is the multivariable chain rule applied in the right order. A step-by-step derivation for a two-layer network, with shapes, vectorized formulas, and a gradient check."
categories: [Machine Learning]
tags: [neural-networks, calculus, backpropagation, deep-learning]
related_projects: [neural-network-from-scratch]
---

Backpropagation has a reputation for being mysterious. It isn't: it is the
chain rule from multivariable calculus, applied to a composition of functions
in a particular order so that no work is repeated. This post derives it for a
two-layer network and then explains why the "backward" order matters.

<!--more-->

## The chain rule, in one line

If $y = f(u)$ and $u = g(x)$ for scalars, then
$\frac{dy}{dx} = \frac{dy}{du} \frac{du}{dx}$. For vectors, if
$u = g(x) \in \mathbb{R}^m$ and $L = f(u) \in \mathbb{R}$, then

$$
\frac{\partial L}{\partial x_j} = \sum_{k=1}^{m} \frac{\partial L}{\partial u_k} \frac{\partial u_k}{\partial x_j},
$$

i.e. $\nabla_x L = J_g(x)^\top \nabla_u L$, where $J_g$ is the Jacobian of $g$.
Backpropagation is repeated application of this identity.

## A computational graph

Consider a single example $x \in \mathbb{R}^d$ with one-hot label
$y \in \mathbb{R}^K$, and a network

$$
\begin{aligned}
z_1 &= W_1 x + b_1, & a_1 &= \sigma(z_1), \\
z_2 &= W_2 a_1 + b_2, & \hat{y} &= \operatorname{softmax}(z_2), \\
L &= -\sum_{k=1}^{K} y_k \log \hat{y}_k ,
\end{aligned}
$$

with $W_1 \in \mathbb{R}^{h \times d}$, $W_2 \in \mathbb{R}^{K \times h}$, and
an elementwise activation $\sigma$. Each line is a node in a computational
graph; the loss is a composition of all of them.

## The backward pass

We want $\partial L / \partial W_1$, $\partial L / \partial b_1$,
$\partial L / \partial W_2$, and $\partial L / \partial b_2$. Write
$\delta_2 = \partial L / \partial z_2$ and $\delta_1 = \partial L / \partial z_1$.

### Step 1: softmax and cross-entropy together

With $$\hat{y}_k = e^{z_{2,k}} / \sum_j e^{z_{2,j}}$$ we have
$$\log \hat{y}_k = z_{2,k} - \log \sum_j e^{z_{2,j}}$$. Substituting into $L$ and
using $\sum_k y_k = 1$:

$$
L = -\sum_k y_k z_{2,k} + \log \sum_j e^{z_{2,j}} .
$$

Differentiating with respect to $z_{2,i}$:

$$
\delta_{2,i} = -y_i + \frac{e^{z_{2,i}}}{\sum_j e^{z_{2,j}}} = \hat{y}_i - y_i,
\qquad\text{so}\qquad \delta_2 = \hat{y} - y .
$$

This clean result is why softmax and cross-entropy are almost always
implemented as a single fused operation.

### Step 2: the output layer

Since $z_2 = W_2 a_1 + b_2$, each entry satisfies
$\partial z_{2,i} / \partial W_{2,ij} = a_{1,j}$. Therefore

$$
\frac{\partial L}{\partial W_2} = \delta_2 \, a_1^\top, \qquad
\frac{\partial L}{\partial b_2} = \delta_2, \qquad
\frac{\partial L}{\partial a_1} = W_2^\top \delta_2 .
$$

The last expression is the chain rule's $J^\top \nabla$ with Jacobian
$\partial z_2 / \partial a_1 = W_2$.

### Step 3: through the activation

An elementwise activation has a diagonal Jacobian, so the chain rule reduces
to an elementwise product:

$$
\delta_1 = \frac{\partial L}{\partial a_1} \odot \sigma'(z_1) = \bigl(W_2^\top \delta_2\bigr) \odot \sigma'(z_1).
$$

For ReLU, $\sigma'(z) = 1$ if $z > 0$ and $0$ otherwise (the value at exactly
$0$ is a convention).

### Step 4: the first layer

Exactly as in Step 2:

$$
\frac{\partial L}{\partial W_1} = \delta_1 \, x^\top, \qquad
\frac{\partial L}{\partial b_1} = \delta_1 .
$$

### Shapes as a sanity check

| Quantity | Shape | Gradient formula |
|---|---|---|
| $W_2$ | $K \times h$ | $\delta_2 a_1^\top$: $(K \times 1)(1 \times h)$ |
| $W_1$ | $h \times d$ | $\delta_1 x^\top$: $(h \times 1)(1 \times d)$ |
| $a_1$ | $h$ | $W_2^\top \delta_2$: $(h \times K)(K \times 1)$ |

If the shapes do not match, the derivation is wrong.

## Mini-batches

With a batch of $n$ examples stored as **rows** of $X \in \mathbb{R}^{n \times d}$
(the convention in most code), layers compute $Z = XW + \mathbf{1}b^\top$
with $W \in \mathbb{R}^{d \times h}$, and the averaged loss gives

$$
\Delta_2 = \frac{1}{n}(\hat{Y} - Y), \quad
\frac{\partial L}{\partial W_2} = A_1^\top \Delta_2, \quad
\frac{\partial L}{\partial b_2} = \mathbf{1}^\top \Delta_2, \quad
\Delta_1 = \bigl(\Delta_2 W_2^\top\bigr) \odot \sigma'(Z_1).
$$

These are the same formulas, transposed to match the row-major layout. The
[Neural Network from Scratch]({% link _projects/neural-network-from-scratch.md %})
project implements them directly.

## Why backwards?

The chain rule can be applied in either direction. For a network computing a
scalar loss from $P$ parameters:

- **Forward mode** propagates derivatives with respect to *one input* at a
  time, so computing the full gradient needs on the order of $P$ passes.
- **Reverse mode** (backpropagation) propagates derivatives of *one output*
  — the loss — with respect to everything, so a single backward pass gives the
  entire gradient, at a cost within a small constant factor of the forward
  pass.

Because neural networks have millions of parameters and one scalar loss,
reverse mode is overwhelmingly cheaper. The price is memory: the forward pass
must store intermediate values ($z_1$, $a_1$, …) for use in the backward pass.

## Checking your gradients

Hand-derived gradients are easy to get subtly wrong. Compare them against
centered finite differences:

```python
import numpy as np


def numerical_gradient(f, theta, h=1e-5):
    """Centered-difference gradient of scalar function f at array theta."""
    grad = np.zeros_like(theta)
    it = np.nditer(theta, flags=["multi_index"])
    for _ in it:
        i = it.multi_index
        old = theta[i]
        theta[i] = old + h
        f_plus = f(theta)
        theta[i] = old - h
        f_minus = f(theta)
        theta[i] = old
        grad[i] = (f_plus - f_minus) / (2 * h)
    return grad


def relative_error(a, b):
    return np.max(np.abs(a - b) / np.maximum(1e-12, np.abs(a) + np.abs(b)))
```

In double precision a correct implementation typically shows relative errors
around $10^{-7}$ or smaller. Check on a tiny network with a handful of
examples, and avoid inputs exactly at ReLU's kink, where the derivative is
undefined.

## Summary

- Backpropagation = chain rule + caching + reverse order.
- Each layer only needs a local rule: given $\partial L / \partial(\text{output})$,
  produce $\partial L / \partial(\text{input})$ and $\partial L / \partial(\text{parameters})$.
- Softmax with cross-entropy yields the remarkably simple gradient
  $\hat{y} - y$.
- Always verify with a gradient check before trusting a training curve.

The simplest special case — one linear layer with squared error — is worked
out in [Linear Regression: Derivation and Implementation]({% link _posts/2026-07-22-linear-regression-derivation.md %}).
