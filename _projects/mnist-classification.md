---
title: "MNIST Handwritten Digit Classification"
description: "Training a from-scratch neural network to classify handwritten digits, with a careful record of setup, metrics, and errors."
category: "Deep Learning"
technologies:
  - Python
  - NumPy
github_url: ""
status: "Draft"
featured: true
order: 3
---

<div class="notice notice--todo" markdown="1">
**Template — results not yet recorded.** Fill in the dataset details,
architecture, hyperparameters, and measured accuracy from your own runs. Every
"TODO" below is a placeholder, not a result.
</div>

## Overview

This project applies the
[from-scratch neural network]({% link _projects/neural-network-from-scratch.md %})
to the MNIST dataset of handwritten digits. The aim is to go beyond "it
trains" and document the full experimental setup so the results are
reproducible.

## Problem statement

MNIST contains grayscale images of handwritten digits $0$–$9$, each
$28 \times 28$ pixels, with a standard split of 60,000 training images and
10,000 test images. Each image is flattened into a vector
$x \in \mathbb{R}^{784}$ and the task is $10$-way classification.

## Method

### Preprocessing

- Scale pixel intensities from $[0, 255]$ to $[0, 1]$ (or standardize using
  the training-set mean and standard deviation).
- Hold out part of the training set as a validation set for choosing
  hyperparameters — the test set is used **once**, at the end.

### Model

| Component | Setting |
|---|---|
| Architecture | TODO — e.g. 784 → hidden → 10 |
| Activation | TODO |
| Loss | Softmax cross-entropy |
| Optimizer | TODO — e.g. mini-batch SGD |
| Learning rate / batch size / epochs | TODO |
| Initialization | TODO |
| Random seed(s) | TODO |

## Experiments and results

<div class="notice notice--todo" markdown="1">
**Replace with measured values.** Report the mean and spread over several
seeds if you can.
</div>

| Metric | Value |
|---|---|
| Training accuracy | TODO |
| Validation accuracy | TODO |
| Test accuracy | TODO |
| Training time / hardware | TODO |

Suggested additions once you have results:

- A training and validation loss curve (save the figure in
  `assets/images/projects/` and embed it with a caption).
- A confusion matrix, and a few misclassified examples with commentary.

## Limitations and future improvements

- A fully connected network ignores the spatial structure of images; a
  convolutional network is the natural next step.
- MNIST is close to solved; Fashion-MNIST is a harder drop-in replacement.

## Source code and resources

- Source code: *add your repository link in the front matter.*
- Dataset: Y. LeCun, C. Cortes, and C. J. C. Burges, *The MNIST database of handwritten digits.*
- Related: [Neural Network from Scratch]({% link _projects/neural-network-from-scratch.md %}),
  [Backpropagation]({% link _posts/2026-08-14-backpropagation-chain-rule.md %})
