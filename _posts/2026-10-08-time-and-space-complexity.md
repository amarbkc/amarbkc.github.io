---
title: "Time and Space Complexity: Analyzing Algorithms Mathematically"
summary: "Precise definitions of O, Ω, and Θ, how to analyze loops and recurrences, the master theorem, amortized analysis, and what space complexity really counts."
categories: [Algorithms, Mathematics]
tags: [complexity, asymptotics, recurrences, amortized-analysis]
---

"This runs in $O(n \log n)$" is one of the most common sentences in computer
science, and one of the most frequently misused. This post builds the tools
for analyzing algorithms from definitions: asymptotic notation, sums,
recurrences, amortization, and space.

<!--more-->

## What are we measuring?

We model an algorithm's cost as a function $T(n)$ of the input size $n$,
counting elementary operations (comparisons, arithmetic, memory accesses)
that each take constant time. Usually we care about the **worst case** over
all inputs of size $n$; sometimes the **average case** under a stated input
distribution, or the **amortized** cost over a sequence of operations.

## Asymptotic notation

For functions $f, g : \mathbb{N} \to \mathbb{R}_{\ge 0}$:

$$
\begin{aligned}
f(n) = O(g(n)) &\iff \exists\, c > 0,\, n_0 \text{ such that } f(n) \le c \, g(n) \text{ for all } n \ge n_0, \\
f(n) = \Omega(g(n)) &\iff \exists\, c > 0,\, n_0 \text{ such that } f(n) \ge c \, g(n) \text{ for all } n \ge n_0, \\
f(n) = \Theta(g(n)) &\iff f(n) = O(g(n)) \text{ and } f(n) = \Omega(g(n)).
\end{aligned}
$$

$O$ is an upper bound, $\Omega$ a lower bound, and $\Theta$ a tight bound.
Two common mistakes:

- **$O$ is not "worst case."** Worst case is *which inputs* we analyze; $O$ is
  *what kind of bound* we state. "Insertion sort's best case is $\Theta(n)$"
  and "its worst case is $\Theta(n^2)$" are both precise statements.
- **$O$ is not tight.** Merge sort is $O(n^3)$ — true but uninformative. Use
  $\Theta$ when you know the bound is tight.

*Example.* $3n^2 + 10n = \Theta(n^2)$: for $n \ge 10$ we have
$3n^2 \le 3n^2 + 10n \le 4n^2$, so $c = 3$ and $c = 4$ witness the two bounds.

## Loops and sums

Nested loops become sums. For

```python
for i in range(n):
    for j in range(i):
        work()          # O(1)
```

the inner body runs $\sum_{i=0}^{n-1} i = \frac{n(n-1)}{2} = \Theta(n^2)$
times. Two sums to know by heart:

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2} = \Theta(n^2),
\qquad
\sum_{i=0}^{k} 2^i = 2^{k+1} - 1 = \Theta(2^k).
$$

The geometric sum says a doubling series is dominated by its last term — the
key fact behind amortized analysis below. A harmonic sum
$\sum_{i=1}^{n} 1/i = \ln n + O(1)$ also appears often, for example in the
analysis of randomized quicksort.

## Recurrences

Recursive algorithms give recurrences. **Binary search** halves the problem
with constant extra work:

$$
T(n) = T(n/2) + \Theta(1) \implies T(n) = \Theta(\log n).
$$

**Merge sort** splits into two halves and merges in linear time:

$$
T(n) = 2T(n/2) + \Theta(n).
$$

Unrolling the recursion tree: level $k$ has $2^k$ subproblems of size
$n/2^k$, each costing $\Theta(n/2^k)$, so every level costs $\Theta(n)$. There
are $\log_2 n + 1$ levels, so $T(n) = \Theta(n \log n)$.

### The master theorem

For $T(n) = a\,T(n/b) + f(n)$ with constants $a \ge 1$, $b > 1$, compare
$f(n)$ with $n^{\log_b a}$, the total cost of the leaves:

1. If $f(n) = O(n^{\log_b a - \epsilon})$ for some $\epsilon > 0$, the leaves
   dominate: $T(n) = \Theta(n^{\log_b a})$.
2. If $f(n) = \Theta(n^{\log_b a} \log^k n)$ for some $k \ge 0$, every level
   contributes equally: $T(n) = \Theta(n^{\log_b a} \log^{k+1} n)$.
3. If $f(n) = \Omega(n^{\log_b a + \epsilon})$ for some $\epsilon > 0$ and
   $a f(n/b) \le c f(n)$ for some $c < 1$ and large $n$, the root dominates:
   $T(n) = \Theta(f(n))$.

Merge sort is case 2 with $a = b = 2$, $k = 0$. Karatsuba multiplication,
$T(n) = 3T(n/2) + \Theta(n)$, is case 1:
$T(n) = \Theta(n^{\log_2 3}) \approx \Theta(n^{1.585})$.

## Amortized analysis

Some operations are occasionally expensive but cheap on average over any
sequence. A **dynamic array** (Python's `list`) doubles its capacity when
full, copying all elements.

*Claim.* Any sequence of $n$ appends costs $O(n)$ in total, so each append is
$O(1)$ amortized.

*Proof (aggregate method).* Each append writes one element: $n$ writes total.
Copies happen when the size reaches capacities $1, 2, 4, \dots, 2^k$ with
$2^k < n$, and copying at capacity $2^i$ moves $2^i$ elements. By the
geometric sum, the total copying is
$\sum_{i=0}^{k} 2^i = 2^{k+1} - 1 < 2n$. So the total cost is less than
$3n = O(n)$. $\blacksquare$

Amortized bounds are worst-case guarantees about *sequences*, not averages
over random inputs. The near-constant bound for
[union–find]({% link _posts/2026-09-10-disjoint-set-union.md %}) is another
example.

## Space complexity

Space complexity counts the memory an algorithm uses as a function of $n$,
usually excluding the input itself (*auxiliary* space). Remember that:

- **Recursion uses stack space.** Recursive binary search uses $\Theta(\log n)$
  stack frames; the iterative version uses $\Theta(1)$.
- **Merge sort** needs $\Theta(n)$ auxiliary space for merging; heapsort sorts
  in place with $\Theta(1)$.
- **Time bounds space from above**: an algorithm cannot touch more than
  $O(T(n))$ memory cells in $T(n)$ steps.

## Beyond the asymptotics

Asymptotic analysis hides constants and lower-order terms on purpose. In
practice those still matter: an $O(n^2)$ insertion sort beats merge sort on
small arrays, which is why production sorts (such as Timsort) switch to it for
short runs. Use asymptotics to understand scaling, and measurements to choose
between algorithms of the same order.

## Summary

| Tool | Use it for |
|---|---|
| $O, \Omega, \Theta$ | Stating upper, lower, and tight bounds precisely |
| Sums | Loops |
| Recursion trees, master theorem | Divide-and-conquer recurrences |
| Aggregate / potential method | Amortized cost over sequences |
| Stack depth + allocations | Space |

See these tools in action in
[Dijkstra's algorithm]({% link _posts/2026-06-18-dijkstras-algorithm.md %}),
where the choice of priority queue changes the running time from
$O(V^2 + E)$ to $O((V + E) \log V)$.

*Reference:* Cormen et al., *Introduction to Algorithms*, Chapters 3, 4, and 16 (4th ed.).
