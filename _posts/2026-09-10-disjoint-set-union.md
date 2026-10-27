---
title: "Disjoint Set Union: Path Compression and Union by Rank"
summary: "The union–find data structure in a dozen lines of code, why union by rank bounds tree height by log n, and how path compression brings operations to nearly constant amortized time."
categories: [Algorithms]
tags: [data-structures, union-find, amortized-analysis, graphs]
---

Disjoint Set Union (DSU), also called union–find, maintains a partition of
elements into disjoint sets under two operations: *merge two sets* and *which
set is this element in?* It is tiny to implement, appears everywhere from
Kruskal's algorithm to image segmentation, and has one of the most surprising
complexity results in algorithms.

<!--more-->

## The interface

Starting from $n$ singleton sets $\lbrace 0 \rbrace, \lbrace 1 \rbrace, \dots, \lbrace n-1 \rbrace$:

- `find(x)` returns a **representative** of the set containing $x$. Two
  elements are in the same set exactly when they have the same representative.
- `union(x, y)` merges the sets containing $x$ and $y$.

## Representation: a forest

Each set is a rooted tree, stored as a parent array; the root is the
representative and is its own parent.

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n          # upper bound on tree height

    def find(self, x):
        # Path compression: point every node on the path directly at the root.
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False             # already in the same set
        # Union by rank: attach the shorter tree under the taller one.
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True
```

Without either optimization, a sequence of unions can build a path of length
$n - 1$, and `find` costs $\Theta(n)$.

## Union by rank: height is logarithmic

Consider union by rank on its own (no path compression), so rank equals tree
height.

<div class="callout" markdown="1">
<span class="callout__title">Lemma</span>
A root of rank $r$ has at least $2^r$ nodes in its tree.
</div>

**Proof by induction on $r$.** A rank-$0$ root has at least $2^0 = 1$ node.
A root's rank only increases, from $r - 1$ to $r$, when two roots of rank
$r - 1$ are linked. By the induction hypothesis each tree has at least
$2^{r-1}$ nodes, so the merged tree has at least $2^{r-1} + 2^{r-1} = 2^r$.
Linking a lower-rank tree under a root adds nodes without changing its rank,
which preserves the bound. $\blacksquare$

Since a tree contains at most $n$ nodes, $2^r \le n$, so every rank — and
therefore every tree height — is at most $\lfloor \log_2 n \rfloor$. Each
`find` and `union` costs $O(\log n)$.

## Path compression: nearly constant time

Path compression makes every node visited by `find` point directly to the
root, flattening the tree for future queries. Combined with union by rank, the
celebrated result of Tarjan (1975) is:

<div class="callout" markdown="1">
<span class="callout__title">Theorem</span>
A sequence of $m$ operations on $n$ elements takes $O(m \, \alpha(n))$ time,
where $\alpha$ is the inverse Ackermann function.
</div>

The function $\alpha(n)$ grows so slowly that $\alpha(n) \le 4$ for any $n$
that could fit in physical memory, so in practice each operation is
amortized constant time. The bound is also tight: Tarjan showed that a broad
class of pointer-based union–find structures requires $\Omega(\alpha(n))$
amortized time per operation.

With path compression, ranks are no longer exact heights — they become upper
bounds — but the lemma above still holds for ranks, which is what the
analysis needs.

## An application: Kruskal's minimum spanning tree

Kruskal's algorithm sorts edges by weight and adds an edge whenever it joins
two different components. DSU answers "different components?" efficiently:

```python
def kruskal(n, edges):
    """edges: list of (weight, u, v). Returns (total weight, chosen edges)."""
    dsu = DSU(n)
    total, chosen = 0, []
    for w, u, v in sorted(edges):
        if dsu.union(u, v):
            total += w
            chosen.append((u, v, w))
    return total, chosen
```

Sorting dominates: $O(E \log E)$ time, with the DSU work contributing only
$O(E \, \alpha(V))$.

## Other uses

- Counting connected components of a graph as edges arrive online.
- Detecting cycles in an undirected graph (an edge whose endpoints already
  share a representative closes a cycle).
- Grouping equivalent items: pixels in image segmentation, variables in type
  unification, accounts sharing an email.

## Summary

| Variant | Time per operation |
|---|---|
| Naive linking | $O(n)$ worst case |
| Union by rank (or size) | $O(\log n)$ worst case |
| Path compression alone | $O(\log n)$ amortized |
| Both | $O(\alpha(n))$ amortized |

For background on amortized analysis and asymptotic notation, see
[Time and Space Complexity]({% link _posts/2026-10-08-time-and-space-complexity.md %}).

*References:* R. E. Tarjan, "Efficiency of a Good But Not Linear Set Union
Algorithm," *Journal of the ACM*, 1975; Cormen et al., *Introduction to
Algorithms*, Chapter 19 (4th ed.).
