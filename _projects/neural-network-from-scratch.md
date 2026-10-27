---
title: "Neural Network from Scratch"
description: "A fully connected neural network in pure NumPy — linear layers, activations, backpropagation, and gradient descent derived and implemented by hand."
category: "Machine Learning"
technologies:
  - Python
  - NumPy
github_url: ""          # e.g. "https://github.com/USERNAME/neural-network-from-scratch"
demo_url: ""
status: "In progress"   # In progress | Completed | Draft
featured: true
order: 1                # lower numbers appear first
---

<div class="notice notice--todo" markdown="1">
**Starter content — please review.** The explanation and code below are an
illustrative reference implementation written for this page. Replace them with
your own implementation, add your repository link in the front matter, and
record only results you have actually measured.
</div>

## Overview

This project implements a multilayer perceptron (MLP) using nothing but NumPy:
no automatic differentiation, no deep learning framework. Every gradient is
derived on paper first and then written as code. The result is a small library
with linear layers, ReLU activations, a softmax cross-entropy loss, and a
mini-batch gradient descent training loop.

## Motivation

Frameworks such as PyTorch compute gradients automatically, which is exactly
what you want in practice — and exactly what hides the mechanics when you are
learning. Writing backpropagation by hand forces you to answer questions that
are easy to skip:

- What shape is each gradient, and why?
- Why does the softmax + cross-entropy gradient simplify to $\hat{y} - y$?
- Why does initialization scale matter for deep ReLU networks?
- How can you *check* that a hand-written gradient is correct?

The educational purpose is the point: the implementation should be small
enough to read in one sitting and correct enough to train a real classifier.

## Mathematical foundations

Let a mini-batch be $X \in \mathbb{R}^{n \times d}$ ($n$ examples, $d$
features). A linear layer with weights $W \in \mathbb{R}^{d \times m}$ and bias
$b \in \mathbb{R}^{m}$ computes

$$
Z = XW + \mathbf{1} b^\top .
$$

A two-layer network for $K$ classes is

$$
\begin{aligned}
Z_1 &= X W_1 + \mathbf{1} b_1^\top, & A_1 &= \operatorname{ReLU}(Z_1), \\
Z_2 &= A_1 W_2 + \mathbf{1} b_2^\top, & \hat{Y} &= \operatorname{softmax}(Z_2),
\end{aligned}
$$

trained with the mean cross-entropy loss over one-hot labels $Y$:

$$
L = -\frac{1}{n} \sum_{i=1}^{n} \sum_{k=1}^{K} Y_{ik} \log \hat{Y}_{ik}.
$$

### Backpropagation

Applying the chain rule from the loss backwards gives the following
gradients (derived in detail in the post on
[backpropagation]({% link _posts/2026-08-14-backpropagation-chain-rule.md %})):

$$
\begin{aligned}
\frac{\partial L}{\partial Z_2} &= \frac{1}{n}\bigl(\hat{Y} - Y\bigr), \\
\frac{\partial L}{\partial W_2} &= A_1^\top \frac{\partial L}{\partial Z_2}, \qquad
\frac{\partial L}{\partial b_2} = \mathbf{1}^\top \frac{\partial L}{\partial Z_2}, \\
\frac{\partial L}{\partial A_1} &= \frac{\partial L}{\partial Z_2} W_2^\top, \\
\frac{\partial L}{\partial Z_1} &= \frac{\partial L}{\partial A_1} \odot \mathbb{I}[Z_1 > 0], \\
\frac{\partial L}{\partial W_1} &= X^\top \frac{\partial L}{\partial Z_1}, \qquad
\frac{\partial L}{\partial b_1} = \mathbf{1}^\top \frac{\partial L}{\partial Z_1}.
\end{aligned}
$$

A useful sanity check: every gradient has the same shape as the quantity it
differentiates with respect to.

### Gradient descent

Parameters are updated with mini-batch gradient descent at learning rate
$\eta$:

$$
\theta \leftarrow \theta - \eta \, \nabla_\theta L(\theta).
$$

## Implementation

Each layer stores what it needs from the forward pass and returns the
gradient with respect to its input in the backward pass.

```python
import numpy as np


class Linear:
    def __init__(self, n_in, n_out, rng):
        # He initialization keeps activation variance stable under ReLU.
        self.W = rng.normal(0.0, np.sqrt(2.0 / n_in), size=(n_in, n_out))
        self.b = np.zeros(n_out)

    def forward(self, X):
        self.X = X                       # cache input for backward
        return X @ self.W + self.b

    def backward(self, dZ):
        self.dW = self.X.T @ dZ
        self.db = dZ.sum(axis=0)
        return dZ @ self.W.T             # gradient w.r.t. the input X

    def step(self, lr):
        self.W -= lr * self.dW
        self.b -= lr * self.db


class ReLU:
    def forward(self, Z):
        self.mask = Z > 0
        return Z * self.mask

    def backward(self, dA):
        return dA * self.mask


def softmax_cross_entropy(logits, y):
    """Mean cross-entropy and its gradient w.r.t. the logits.

    logits: (n, K) array; y: (n,) integer class labels.
    """
    shifted = logits - logits.max(axis=1, keepdims=True)   # numerical stability
    log_probs = shifted - np.log(np.exp(shifted).sum(axis=1, keepdims=True))
    n = logits.shape[0]
    loss = -log_probs[np.arange(n), y].mean()
    grad = np.exp(log_probs)                               # softmax probabilities
    grad[np.arange(n), y] -= 1.0
    return loss, grad / n
```

The training loop composes the layers:

```python
def train(X, y, hidden=128, classes=10, lr=0.1, epochs=10, batch=64, seed=0):
    rng = np.random.default_rng(seed)
    layers = [Linear(X.shape[1], hidden, rng), ReLU(), Linear(hidden, classes, rng)]

    for epoch in range(epochs):
        order = rng.permutation(len(X))
        for start in range(0, len(X), batch):
            idx = order[start:start + batch]
            out = X[idx]
            for layer in layers:
                out = layer.forward(out)
            loss, grad = softmax_cross_entropy(out, y[idx])
            for layer in reversed(layers):
                grad = layer.backward(grad)
            for layer in layers:
                if isinstance(layer, Linear):
                    layer.step(lr)
        print(f"epoch {epoch + 1}: last batch loss {loss:.4f}")
    return layers
```

### Verifying gradients

Hand-written gradients should be checked against a centered finite
difference, which has error $O(h^2)$:

$$
\frac{\partial L}{\partial \theta_j} \approx
\frac{L(\theta + h e_j) - L(\theta - h e_j)}{2h}.
$$

A relative error around $10^{-7}$ or smaller (in float64) indicates a correct
gradient; errors near $10^{-2}$ almost always indicate a bug.

## Experiments and results

<div class="notice notice--todo" markdown="1">
**No results recorded yet.** Suggested experiments — fill in only what you run:

- Gradient check for every layer (report max relative error).
- Training/test accuracy on a toy dataset (e.g. two spirals) and on
  [MNIST]({% link _projects/mnist-classification.md %}).
- Effect of learning rate and initialization scale on training loss curves.
</div>

## Limitations and future improvements

- Only plain SGD; momentum and Adam would be natural extensions.
- No regularization (weight decay, dropout) yet.
- Fully connected layers only — convolutional layers are a later step.
- Float64 NumPy on CPU; fine for learning, slow for large models.

## Source code and resources

- Source code: *add your repository link in the front matter (`github_url`).*
- Related writing: [Backpropagation: Understanding the Chain Rule in Neural Networks]({% link _posts/2026-08-14-backpropagation-chain-rule.md %})
- Reference: Goodfellow, Bengio, and Courville, *Deep Learning*, Chapter 6.
