---
title: "Palindrome Algorithms: Expand Around Center and Manacher's Algorithm"
summary: "Two ways to find the longest palindromic substring: expanding around each center in quadratic time, and Manacher's algorithm, which reuses earlier work to do it in linear time. With step-through simulations and Python code."
categories: [Data Structures and Algorithms]
tags: [strings, palindromes, manacher, two-pointers]
date: 2026-11-14 12:00:00 -0500
---

Finding the longest palindrome inside a string is a classic problem with two
standard solutions. The first is short and uses no extra memory; the second
is the same idea with one piece of bookkeeping that makes it linear.

<!--more-->

## What Is a Palindrome?

A string is a **palindrome** if it reads the same forwards and backwards:
`aba`, `abba`, `racecar`. For a string $s$ of length $n$ that means
$s[k] = s[n-1-k]$ for every $k$.

The problem: given $s$, find its longest palindromic substring. Checking
every substring directly costs $O(n^3)$ — there are $O(n^2)$ substrings and
each check is $O(n)$. Both algorithms below do better by using the
structure of a palindrome.

## Expand Around Center Technique

The central observation: **a palindrome is symmetric about its center, and
removing its first and last characters leaves a smaller palindrome with the
same center.** So every palindrome can be *grown* from its center, one
matching pair at a time.

There are two kinds of center:

<figure class="strfig">
<div class="strfig__scroll" role="img" aria-label="aba is centered on the character b; abba is centered on the gap between the two b characters.">
<div class="strfig__grid" aria-hidden="true">
<div class="strfig__row"><span class="strfig__label"></span><span class="strfig__cell">a</span><span class="strfig__cell is-match">b</span><span class="strfig__cell">a</span><span class="strfig__cell strfig__cell--blank"></span><span class="strfig__cell strfig__cell--blank"></span><span class="strfig__cell">a</span><span class="strfig__cell is-match">b</span><span class="strfig__cell is-match">b</span><span class="strfig__cell">a</span></div>
</div>
</div>
<figcaption>Odd length: the center is a character. Even length: the center is the gap between two characters.</figcaption>
</figure>

A string of length $n$ therefore has $2n - 1$ centers: $n$ characters and
$n - 1$ gaps. For each one, place two pointers and move them apart while
the characters under them are equal:

- odd length — start with $l = r = i$;
- even length — start with $l = i$, $r = i + 1$.

The loop stops at the first mismatch or at the edge of the string. At that
moment $l$ and $r$ are one step *outside* the palindrome, so its length is
$r - l - 1$.

## Step-by-Step Visual Example

Take `babad`. Step through with **Next**, or press **Play**.

{% include palindrome-simulation.html mode="expand" text="babad"
   caption="Expand around center on <code>babad</code>. The letters under the cells are the pointers $l$ and $r$." %}

Things to notice:

- **Steps 5–7.** Centered on `a` at index 1, the pointers find `b = b` and
  then $l$ runs off the left edge. The palindrome is `bab`, of length
  $r - l - 1 = 3 - (-1) - 1 = 3$.
- **Steps 9–11.** Centered on index 2, `aba` is found and the next pair
  `b`, `d` differs. It also has length 3, so the earlier answer is kept.
- **Even centers** all fail immediately here, because no two neighbours are
  equal. In `cbbd` the gap between the two `b`s would give `bb`.

## Manacher's Algorithm

Expanding around a center can take $O(n)$ steps, and there are $O(n)$
centers. On a string like `aaaa…a` every expansion runs all the way to an
edge, for $O(n^2)$ comparisons in total. The waste is that each center
starts from nothing, even when it lies inside a palindrome we have already
found. Manacher's algorithm removes that waste.

**One kind of center.** First insert `#` between all characters, with `^`
and `$` as distinct end markers:

$$
s = a_1 a_2 \dots a_n \quad\longmapsto\quad t = \texttt{^}\,\mathtt{\#}\,a_1\,\mathtt{\#}\,a_2\,\mathtt{\#} \cdots \mathtt{\#}\,a_n\,\mathtt{\#}\,\mathtt{\$}
$$

Now every palindrome of $s$, odd or even, is centered on a single cell of
$t$. Let $\text{dp}[i]$ be the number of cells the palindrome centered at
$i$ extends on each side. Conveniently, that is exactly the length of the
corresponding palindrome in $s$.

**Reuse by symmetry.** Keep the palindrome found so far that reaches
furthest to the right: its center $c$ and right end $\text{right}$. When
the scan reaches an index $i < \text{right}$, it lies inside that
palindrome, so it has a mirror image on the other side of $c$. The mirror is
as far left of $c$ as $i$ is right of it:

$$
\text{mirror} = c - (i - c) = 2c - i .
$$

Everything inside the big palindrome is symmetric, so the palindrome around
$i$ looks like the one around its mirror — at least up to the boundary:

$$
\text{dp}[i] \;\ge\; \min\bigl(\text{right} - i,\ \text{dp}[\text{mirror}]\bigr).
$$

Start from that value instead of zero, then expand as before. If the result
reaches past $\text{right}$, it becomes the new reference palindrome.

## Visual Explanation of Manacher's Algorithm

Here is the algorithm on `ababa`, which becomes `^#a#b#a#b#a#$`.

{% include palindrome-simulation.html mode="manacher" text="ababa"
   caption="Manacher's algorithm on <code>ababa</code>. $i$ is the current index, $c$ the center of the reference palindrome, and $i'$ the mirror of $i$." %}

Things to notice:

- **Steps 12–13.** At $i = 8$ the mirror is $2 \cdot 6 - 8 = 4$ with
  $\text{dp}[4] = 3$, so $\text{dp}[8]$ starts at $3$. A single failed
  comparison confirms it. Expanding from scratch would have needed four.
- **The boundary only moves right.** Expansion past the starting value
  always pushes $\text{right}$ forward. That is why the total work is
  linear.
- **Reading the answer.** With $c$ the index of the largest entry, the
  palindrome starts at index $(c - \text{dp}[c]) \mathbin{//} 2$ of $s$ and
  has length $\text{dp}[c]$.

The same table answers other questions. A palindrome of length $L$ contains
$\lceil L/2 \rceil$ palindromes with the same center, so the number of
palindromic substrings of $s$ is

$$
\sum_{i} \left\lfloor \frac{\text{dp}[i] + 1}{2} \right\rfloor .
$$

## Python Implementations

Expand around center:

```python
def longest_palindrome_expand(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return r - l - 1                   # length of the palindrome

    start, best = 0, 0
    for i in range(len(s)):
        for length in (expand(i, i), expand(i, i + 1)):   # odd, even
            if length > best:
                best = length
                start = i - (length - 1) // 2
    return s[start:start + best]
```

Manacher's algorithm:

```python
def manacher(s):
    """dp[i] = length of the palindrome centered at cell i of t."""
    t = "^#" + "#".join(s) + "#$"          # ^ and $ must not occur in s
    dp = [0] * len(t)
    center = right = 0
    for i in range(1, len(t) - 1):
        if i < right:                      # inside the reference palindrome
            dp[i] = min(right - i, dp[2 * center - i])
        while t[i - dp[i] - 1] == t[i + dp[i] + 1]:
            dp[i] += 1                     # ^ and $ stop this at the ends
        if i + dp[i] > right:
            center, right = i, i + dp[i]
    return dp


def longest_palindrome(s):
    dp = manacher(s)
    c = max(range(len(dp)), key=lambda i: dp[i])
    left = (c - dp[c]) // 2
    return s[left:left + dp[c]]


def count_palindromes(s):
    return sum((d + 1) // 2 for d in manacher(s))
```

```python
>>> longest_palindrome_expand("babad"), longest_palindrome("babad")
('bab', 'bab')
>>> longest_palindrome("cbbd"), longest_palindrome("ababa")
('bb', 'ababa')
>>> count_palindromes("ababa")
9
```

The `while` loop in `manacher` needs no bounds checks: `^` and `$` differ
from each other and from every other cell, so a comparison involving either
one always fails.

## Time and Space Complexity

| | Time | Extra space |
|:---|:---:|:---:|
| Check every substring | $O(n^3)$ | $O(1)$ |
| Expand around center | $O(n^2)$ | $O(1)$ |
| Manacher's algorithm | $O(n)$ | $O(n)$ |

**Expand around center** tries $2n - 1$ centers and each expansion takes at
most $n/2$ steps. It stores only a few indices.

**Manacher** is linear because of the boundary. Each index does at most one
failed comparison. A *successful* comparison happens only beyond
$\text{right}$, and each one moves $\text{right}$ one cell further. Since
$\text{right}$ never decreases and $t$ has $2n + 3$ cells, there are $O(n)$
comparisons in all. The price is the $O(n)$ table.

In practice expand-around-center is the one to write first: it is a dozen
lines and fast on ordinary text. Manacher earns its place when the input is
long or highly repetitive, or when you need the palindrome at *every*
center rather than only the longest.
