---
title: "String Matching: The Knuth–Morris–Pratt (KMP) Algorithm"
summary: "KMP finds a pattern inside a text in linear time by never re-reading the text. A short note on the LPS array, a step-through simulation, and a Python implementation."
categories: [Data Structures and Algorithms]
tags: [strings, pattern-matching, kmp, prefix-function]
---

Is a short string present inside a longer one, and where? The
Knuth–Morris–Pratt (KMP) algorithm answers this in a single left-to-right
pass over the text, using a small table computed from the pattern.

<!--more-->

## The problem

We are given a **text** $T$ of length $n$ and a **pattern** $P$ of length
$m$, and want the first index $s$ with $T[s..s+m-1] = P$.

The naive method tries every start index and compares character by
character. When a comparison fails it moves the pattern one step and starts
over, re-reading text it has already seen — $O(nm)$ comparisons in the worst
case.

KMP's observation: after matching $j$ characters and then failing, we
already *know* the last $j$ characters of the text — they are $P[0..j-1]$.
So the next useful position of the pattern can be worked out from the
pattern alone, in advance.

## The LPS array

For each index $i$ of the pattern, $\text{lps}[i]$ is the length of the
**l**ongest proper **p**refix of $P[0..i]$ that is also a **s**uffix of it.
(It is also called the prefix function, $\pi$.)

{% include string-diagram.html text="ababd" text_label="P" values="0,0,1,2,0" values_label="lps"
   caption="The LPS array of <code>ababd</code>." %}

Reading it off: `aba` starts and ends with `a`, so $\text{lps}[2] = 1$;
`abab` starts and ends with `ab`, so $\text{lps}[3] = 2$; `ababd` ends in
`d`, which appears nowhere else, so $\text{lps}[4] = 0$.

The entry $\text{lps}[3] = 2$ is the one that saves work. Slide `abab` two
places to the right and its prefix `ab` lands exactly under its own suffix
`ab`:

{% include string-diagram.html text="abab" text_label="P" pattern="abab" offset=2 kept=2
   caption="If <code>abab</code> has just matched the text, then after a shift of two the first <code>ab</code> is guaranteed to match as well — no comparison needed." %}

That gives the whole rule. On a mismatch with $j$ characters matched, set

$$
j \leftarrow \text{lps}[j-1]
$$

and compare the *same* text character again. The pattern moves right by
$j - \text{lps}[j-1]$, and the text pointer never moves back.

## Worked example

Search for `ababd` in `ababcabcabababd`. Step through with **Next**, or
press **Play**.

{% include kmp-simulation.html text="ababcabcabababd" pattern="ababd"
   caption="KMP on <code>ababcabcabababd</code>. The underlined index is $i$; the boxed LPS entry is the one being looked up." %}

Three things to notice:

- **Steps 3–4 and 15–16.** Four characters match, the fifth does not.
  $\text{lps}[3] = 2$ slides the pattern two places and keeps `ab` (hatched)
  without comparing it again. The second time, this is what completes the
  match.
- **$i$ only moves forward.** Every text character is read, and the pattern
  is repositioned around it.
- **The result.** The match completes at $i = 14$, so it starts at
  $i - m + 1 = 14 - 5 + 1 = 10$. KMP used 19 comparisons; the naive method
  needs 27.

If the pattern is absent, the scan simply reaches the end of the text with
$j < m$, and the answer is $-1$.

## Python implementation

```python
def build_lps(pattern):
    lps = [0] * len(pattern)
    j = 0                                  # length of the current border
    for i in range(1, len(pattern)):
        while j > 0 and pattern[i] != pattern[j]:
            j = lps[j - 1]                 # fall back to a shorter border
        if pattern[i] == pattern[j]:
            j += 1
        lps[i] = j
    return lps


def kmp_search(text, pattern):
    """Index of the first occurrence of pattern in text, or -1."""
    m = len(pattern)
    if m == 0:
        return 0
    lps = build_lps(pattern)
    j = 0                                  # pattern characters matched
    for i, c in enumerate(text):
        while j > 0 and c != pattern[j]:
            j = lps[j - 1]                 # mismatch: reuse the matched prefix
        if c == pattern[j]:
            j += 1
        if j == m:
            return i - m + 1               # match ends at i
    return -1
```

```python
>>> kmp_search("ababcabcabababd", "ababd")
10
>>> kmp_search("ababcabcababab", "ababd")
-1
```

The two functions have the same shape on purpose: building the table is the
pattern being matched against itself. In both, the `while` loop is the
fallback and `j > 0` stops it when there is nothing left to reuse.

A compact way to remember the algorithm: compute the same table for the
single string `pattern + "#" + text`. Wherever its value equals $m$, an
occurrence of the pattern ends, and it starts at index $i - 2m$ of the text.

## Complexity

| | Naive | KMP |
|:---|:---:|:---:|
| Build the table | — | $O(m)$ |
| Search | $O(nm)$ | $O(n)$ |
| Extra space | $O(1)$ | $O(m)$ |

Why linear: $j$ increases by at most one per text character, so at most $n$
times in total, and every fallback decreases it. It cannot fall more often
than it rises, so the search makes at most $2n$ comparisons — here
$2 \times 15 = 30$, of which it used 19. The same argument gives $O(m)$ for
the table.

## Summary

- $\text{lps}[i]$ is the longest proper prefix of $P[0..i]$ that is also its
  suffix.
- On a mismatch after $j$ matches, set $j = \text{lps}[j-1]$ and retry the
  same text character.
- The text is read once, giving $O(n + m)$ time and $O(m)$ space.

**Reference.** D. E. Knuth, J. H. Morris, and V. R. Pratt, "Fast pattern
matching in strings," *SIAM Journal on Computing* 6(2), 1977.
