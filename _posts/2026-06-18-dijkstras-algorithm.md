---
title: "Understanding Dijkstra's Algorithm: Shortest Paths, Correctness, and Complexity"
summary: "How Dijkstra's algorithm finds shortest paths in graphs with non-negative weights, why the greedy choice is correct, and what it costs with different priority queues."
categories: [Algorithms]
tags: [graphs, shortest-paths, greedy, priority-queue]
---

Dijkstra's algorithm answers a basic question: given a graph with
non-negative edge weights and a source vertex $s$, what is the cheapest way to
reach every other vertex? It is a greedy algorithm, and the interesting part is
not *what* it does but *why* the greedy choice is safe.

<!--more-->

## The problem

Let $G = (V, E)$ be a directed graph with weight function
$w : E \to \mathbb{R}_{\ge 0}$. The weight of a path is the sum of its edge
weights, and the **shortest-path distance** $\delta(s, v)$ is the minimum
weight over all paths from $s$ to $v$ (or $\infty$ if none exists).

The algorithm maintains a tentative distance $d[v]$ for every vertex — an
upper bound on $\delta(s, v)$ — and repeatedly tightens these bounds.

## The algorithm

1. Set $d[s] = 0$ and $d[v] = \infty$ for every other $v$.
2. Put every vertex in a priority queue keyed by $d$.
3. Repeatedly extract the vertex $u$ with the smallest $d[u]$ and **relax**
   each outgoing edge $(u, v)$:

$$
d[v] \leftarrow \min\bigl(d[v],\; d[u] + w(u, v)\bigr).
$$

Once a vertex is extracted it is *finalized*: its distance never changes again.

### Implementation in Python

Python's `heapq` has no decrease-key operation, so the usual approach is
*lazy deletion*: push a new entry whenever a distance improves and skip stale
entries when they are popped.

```python
import heapq
from math import inf


def dijkstra(graph, source):
    """Shortest-path distances from `source`.

    graph: dict mapping each vertex to a list of (neighbor, weight) pairs,
           with all weights >= 0.
    Returns (dist, parent) dictionaries; follow `parent` to rebuild paths.
    """
    dist = {v: inf for v in graph}
    parent = {v: None for v in graph}
    dist[source] = 0
    heap = [(0, source)]

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:          # stale entry: u was already finalized
            continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                parent[v] = u
                heapq.heappush(heap, (nd, v))
    return dist, parent
```

### A small example

*Illustrative example.* Consider this graph:

```python
graph = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": [],
}
```

| Step | Extract | $d[A]$ | $d[B]$ | $d[C]$ | $d[D]$ |
|---|---|---|---|---|---|
| 0 | — | 0 | ∞ | ∞ | ∞ |
| 1 | A | **0** | 4 | 1 | ∞ |
| 2 | C | 0 | 3 | **1** | 6 |
| 3 | B | 0 | **3** | 1 | 4 |
| 4 | D | 0 | 3 | 1 | **4** |

The direct edge $A \to B$ costs 4, but the path $A \to C \to B$ costs 3, and
the algorithm discovers this before finalizing $B$.

## Why it is correct

<div class="callout" markdown="1">
<span class="callout__title">Invariant</span>
When a vertex $u$ is extracted from the queue, $d[u] = \delta(s, u)$.
</div>

**Proof.** Suppose not, and let $u$ be the *first* extracted vertex with
$d[u] > \delta(s, u)$. Clearly $u \ne s$, and $u$ is reachable (otherwise
$d[u] = \delta(s, u) = \infty$). Take a shortest path $P$ from $s$ to $u$. Let
$S$ be the set of vertices extracted before $u$. The path starts in $S$ and
ends outside it, so it has a first edge $(x, y)$ with $x \in S$ and
$y \notin S$.

- Because $x$ was extracted before $u$, it was extracted correctly:
  $d[x] = \delta(s, x)$. When $x$ was extracted, edge $(x, y)$ was relaxed, so
  $d[y] \le \delta(s, x) + w(x, y) = \delta(s, y)$, since the prefix of a
  shortest path is itself a shortest path. Hence $d[y] = \delta(s, y)$.
- Because edge weights are non-negative, $y$ lies on $P$ before $u$, so
  $\delta(s, y) \le \delta(s, u)$.
- Because the algorithm extracted $u$ while $y$ was still in the queue,
  $d[u] \le d[y]$.

Chaining these: $d[u] \le d[y] = \delta(s, y) \le \delta(s, u) < d[u]$, a
contradiction. $\blacksquare$

The second bullet is exactly where non-negativity is used.

### Negative edges break it

With vertices $A, B, C$ and edges $A \to B$ (weight $2$), $A \to C$ (weight
$3$), $C \to B$ (weight $-2$), Dijkstra finalizes $B$ with $d[B] = 2$ before
it ever looks at $C$, missing the path $A \to C \to B$ of weight $1$. For
graphs with negative weights (but no negative cycles), use Bellman–Ford.

## Complexity

Each vertex is extracted once and each edge is relaxed once. The cost depends
on the priority queue:

| Priority queue | Extract-min | Decrease-key | Total |
|---|---|---|---|
| Unsorted array | $O(V)$ | $O(1)$ | $O(V^2 + E)$ |
| Binary heap | $O(\log V)$ | $O(\log V)$ | $O((V + E) \log V)$ |
| Fibonacci heap | $O(\log V)$ amortized | $O(1)$ amortized | $O(E + V \log V)$ |

The lazy-deletion version above pushes at most $E + 1$ entries, so it runs in
$O(E \log E) = O(E \log V)$ time (because $E \le V^2$ implies
$\log E \le 2 \log V$) and uses $O(V + E)$ space.

For dense graphs where $E = \Theta(V^2)$, the simple array version is
asymptotically optimal; for sparse graphs a binary heap is the practical
choice.

## Takeaways

- Dijkstra is a greedy algorithm whose correctness rests on one inequality:
  extending a path never makes it cheaper.
- The proof is an exchange-style argument on the *first* vertex where the
  algorithm would go wrong — a pattern worth recognizing.
- The data structure determines the running time; the algorithm is the same.

For a more careful treatment of asymptotic notation used above, see
[Time and Space Complexity]({% link _posts/2026-10-08-time-and-space-complexity.md %}).

*Reference:* Cormen, Leiserson, Rivest, and Stein, *Introduction to Algorithms*, Chapter 22 (4th ed.).
