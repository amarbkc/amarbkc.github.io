---
title: "String Matching: The Knuth–Morris–Pratt (KMP) Algorithm"
summary: "How KMP finds a pattern inside a text in linear time: the prefix function (LPS array), why a mismatch never forces the text pointer backwards, a fully traced example, and a Python implementation."
categories: [Data Structures and Algorithms]
tags: [strings, pattern-matching, kmp, prefix-function]
---

Given a long string and a shorter one, is the shorter string present inside
the longer one — and if so, where? The Knuth–Morris–Pratt (KMP) algorithm
answers this in time proportional to the combined length of the two strings.
Its central tool is the **prefix function**, a small table computed from the
pattern alone that tells the search how far it can safely jump after a
mismatch.

<!--more-->

## Introduction to String Matching

Throughout, the long string is the **text** $T$ of length $n$ and the short
string is the **pattern** $P$ of length $m$, with $m \le n$. Indices start at
$0$, and $s[a..b]$ denotes the substring from index $a$ to index $b$
inclusive.

We say that $P$ **occurs in $T$ at index $s$** when

$$
T[s + k] = P[k] \qquad \text{for every } k = 0, 1, \dots, m - 1,
$$

that is, when $T[s..s+m-1] = P$. The string matching problem asks for the
smallest such $s$, or a report that none exists.

The problem is everywhere: the "find" command of a text editor, `grep`,
searching a genome for a gene, detecting a known signature in a stream of
bytes. In most of these the text is long, so the cost per text character
matters.

## The Naive String Matching Approach and Its Limitations

The direct method tries every possible starting index $s = 0, 1, \dots, n - m$
and compares the pattern with the text character by character:

```python
def naive_search(text, pattern):
    n, m = len(text), len(pattern)
    for s in range(n - m + 1):
        k = 0
        while k < m and text[s + k] == pattern[k]:
            k += 1
        if k == m:
            return s
    return -1
```

It is correct, and on typical inputs it is fast because most alignments fail
on the first character. Its weakness is the worst case. Take

$$
T = \underbrace{\texttt{aaa} \cdots \texttt{a}}_{n}, \qquad
P = \underbrace{\texttt{aa} \cdots \texttt{a}}_{m - 1}\texttt{b}.
$$

Every alignment matches $m - 1$ characters before failing on the last one, so
the algorithm performs $(n - m + 1)\,m$ comparisons — $\Theta(nm)$ in general.

The waste has a precise source. Suppose the alignment at index $s$ matched
$j$ characters and then failed. At that moment we *know* the last $j$
characters of the text we have read: they are exactly $P[0..j-1]$. The naive
method throws this knowledge away, moves the pattern one step to the right,
and re-reads characters it has already seen.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=0 matched=4 miss=true
   caption="Four characters match and the fifth does not. The naive method now restarts at text index 1 and re-compares characters it has already read." %}

<ul class="strfig__legend" aria-label="Legend for the diagrams in this article">
  <li><span class="strfig__cell is-match">a</span> compared, equal</li>
  <li><span class="strfig__cell is-kept">a</span> known equal, not re-compared</li>
  <li><span class="strfig__cell is-miss">a</span> mismatch</li>
</ul>

KMP keeps that knowledge. Its text pointer never moves backwards; only the
pattern is repositioned, and the amount by which it moves is read from a
precomputed table.

## Understanding the Prefix Function (LPS Array)

### Definition

<div class="callout" markdown="1">
<span class="callout__title">Definition</span>
For a string $s$, the **prefix function** $\pi$ assigns to each index $i$ the
length of the longest substring ending at $i$ that is equal to a prefix of
$s$, excluding the trivial case where the substring is all of $s[0..i]$.
</div>

In symbols,

$$
\pi[i] \;=\; \max \bigl\lbrace\, k \;:\; 0 \le k \le i \ \text{ and } \ s[0..k-1] = s[i-k+1..i] \,\bigr\rbrace .
$$

Equivalently, $\pi[i]$ is the length of the **l**ongest proper **p**refix of
$s[0..i]$ that is also a **s**uffix of $s[0..i]$, which is why the same table
is often called the **LPS array**. A string that is both a proper prefix and a
suffix of another string is called a **border** of it, so $\pi[i]$ is the
length of the longest border of $s[0..i]$. Note that $\pi[0] = 0$ always: a
single character has no proper prefix other than the empty string.

Here is the prefix function of a thirteen-character string:

{% include string-diagram.html text="abcfdaxabfabc" text_label="s" values="0,0,0,0,0,1,0,1,2,0,1,2,3"
   caption="The prefix function of <code>abcfdaxabfabc</code>. For instance $\pi[8] = 2$ because the substring <code>ab</code> ending at index 8 equals the prefix <code>ab</code>." %}

The prefix–suffix relationship is easiest to see by sliding a copy of the
string under itself. At the last index, $\pi[12] = 3$: the three characters
ending there are `abc`, the same as the first three characters of the string.

{% include string-diagram.html text="abcfdaxabfabc" text_label="s" pattern="abc" pattern_label="s" offset=10 matched=3
   caption="$\pi[12] = 3$: the suffix $s[10..12]$ of $s[0..12]$ coincides with the prefix $s[0..2]$. No longer prefix has this property." %}

### Two facts that make it computable

Computing each $\pi[i]$ from the definition would take cubic time. Two
observations reduce this to linear time.

**Fact 1: the value grows by at most one.** If $s[0..i]$ has a border of
length $k \ge 1$, deleting its last character leaves a border of length
$k - 1$ of $s[0..i-1]$. Hence

$$
\pi[i] \;\le\; \pi[i-1] + 1,
$$

with equality exactly when $s[i] = s[\pi[i-1]]$: the character after the
longest border of $s[0..i-1]$ matches the new character, so the border
extends.

**Fact 2: the shorter borders are found by iterating $\pi$.** If the longest
border cannot be extended, we need the *next longest* border of $s[0..i-1]$.
Let $j$ be the length of a border of $s[0..i-1]$. Any shorter border is a
suffix of the last $j$ characters, which are equal to the first $j$
characters $s[0..j-1]$; so it is a border of $s[0..j-1]$, and the longest one
has length $\pi[j-1]$. The borders of $s[0..i-1]$, from longest to shortest,
therefore have lengths

$$
\pi[i-1], \quad \pi[\pi[i-1] - 1], \quad \pi[\pi[\pi[i-1] - 1] - 1], \quad \dots, \quad 0 .
$$

The algorithm for $\pi[i]$ follows directly: start with $j = \pi[i-1]$; while
$j > 0$ and $s[i] \ne s[j]$, replace $j$ by $\pi[j-1]$; finally, if
$s[i] = s[j]$, increase $j$ by one. The result is $\pi[i] = j$.

### Building the LPS array of `ababd`

We will search for the pattern $P = \texttt{ababd}$ below, so we construct
its table now.

| $i$ | $P[0..i]$ | Start with $j = \pi[i-1]$ | Comparisons | $\pi[i]$ |
|:---:|:---|:---:|:---|:---:|
| 0 | `a` | — | none (by definition) | 0 |
| 1 | `ab` | 0 | `b` vs $P[0]$ = `a`: differ | 0 |
| 2 | `aba` | 0 | `a` vs $P[0]$ = `a`: equal, so $j = 1$ | 1 |
| 3 | `abab` | 1 | `b` vs $P[1]$ = `b`: equal, so $j = 2$ | 2 |
| 4 | `ababd` | 2 | `d` vs $P[2]$ = `a`: differ, fall back to $j = \pi[1] = 0$; `d` vs $P[0]$ = `a`: differ | 0 |

{% include string-diagram.html text="ababd" text_label="P" values="0,0,1,2,0" values_label="lps"
   caption="The LPS array of the pattern <code>ababd</code>." %}

The entry that will matter most is $\pi[3] = 2$. It says that `abab` ends
with the same two characters it begins with:

{% include string-diagram.html text="abab" text_label="P" pattern="abab" offset=2 matched=2
   caption="$\pi[3] = 2$: slid two places to the right, the pattern's prefix <code>ab</code> lies exactly under the suffix <code>ab</code> of <code>abab</code>. This is the shift KMP will make." %}

## How the KMP Algorithm Works

### The matching loop

KMP scans the text once from left to right with two indices:

- $i$, the position of the text character currently being read;
- $j$, the number of pattern characters currently matched. Equivalently, the
  pattern is aligned so that it starts at text index $i - j$, and the next
  comparison is $T[i]$ against $P[j]$.

The loop maintains one invariant: **before reading $T[i]$, $j$ is the length
of the longest prefix of $P$ that is a suffix of $T[0..i-1]$.** Each step
restores it for the next position:

1. If $T[i] = P[j]$, the match grows: increase both $i$ and $j$.
2. If $T[i] \ne P[j]$ and $j > 0$, set $j = \pi[j-1]$ and compare again with
   the *same* $T[i]$.
3. If $T[i] \ne P[j]$ and $j = 0$, no prefix of $P$ ends here: increase $i$.

When $j$ reaches $m$, the whole pattern has been matched and it ends at the
text character just read.

### Why the fallback is safe

Suppose $j$ characters have matched and $T[i] \ne P[j]$. We know that
$T[i-j..i-1] = P[0..j-1]$. Consider any later alignment that overlaps this
region, say one that would place $k < j$ pattern characters under the text
already read. For it to have a chance, $P[0..k-1]$ must equal the last $k$
characters read, which are the last $k$ characters of $P[0..j-1]$. In other
words, $P[0..k-1]$ must be a border of $P[0..j-1]$.

The longest border has length $\pi[j-1]$. So:

- every alignment with $\pi[j-1] < k < j$ is impossible and can be skipped
  without looking at the text — if one of them matched, it would give a
  border longer than the longest border;
- the alignment with $k = \pi[j-1]$ is the first that can succeed, and its
  first $k$ characters are *already known* to match. The comparison resumes
  at $P[k]$ against the same $T[i]$.

Setting $j = \pi[j-1]$ therefore shifts the pattern right by $j - \pi[j-1]$
positions, skips nothing that could be a match, and re-reads nothing.

### The same idea as a single prefix function

There is a second way to see the algorithm, which makes its correctness
almost immediate. Build a new string by placing the pattern in front of the
text, with a separator character that occurs in neither:

$$
N \;=\; P \;+\; \mathtt{\#} \;+\; T .
$$

Now compute the prefix function of $N$. Because `#` appears nowhere else, no
border of a prefix of $N$ can extend across it, so $\pi[i] \le m$ for every
$i$. And $\pi[i] = m$ means precisely that the $m$ characters ending at
position $i$ are equal to the first $m$ characters of $N$ — that is, **an
occurrence of $P$ ends at position $i$**.

To convert $i$ into a starting index in $T$: the text begins at position
$m + 1$ of $N$, so position $i$ of $N$ is index $i - (m + 1)$ of $T$. The
occurrence ends there and is $m$ characters long, so it starts at

$$
\bigl(i - (m + 1)\bigr) - (m - 1) \;=\; i - 2m .
$$

The two-pointer loop above is this computation with one economy. While the
prefix function of $N$ is being computed over the text part, $j$ never
exceeds $m$, so every fallback $j = \pi[j-1]$ reads an entry with index less
than $m$ — an entry belonging to the pattern. The values of $\pi$ over the
text part are never consulted again and need not be stored. Keeping only the
pattern's table gives the standard KMP algorithm with $O(m)$ extra memory.

## A Step-by-Step Worked Example

We check whether the pattern occurs in the text for

```
text    = "ababcabcabababd"      (n = 15)
pattern = "ababd"                (m = 5)
```

using the table $\text{lps} = [0, 0, 1, 2, 0]$ built above. The pattern
passes through seven alignments.

**Alignment 1 — pattern starts at index 0.** The first four characters
match, so $j = 4$. Then $T[4] = \texttt{c}$ is compared with
$P[4] = \texttt{d}$: a mismatch.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=0 matched=4 miss=true
   caption="$i = 4$, $j = 4$: mismatch after four matches." %}

**Alignment 2 — fall back to $j = \text{lps}[3] = 2$.** The matched part
`abab` has the border `ab`, so the pattern moves right by $4 - 2 = 2$ and its
first two characters are already known to agree with $T[2..3]$. Alignment at
index 1 is skipped entirely. The text pointer stays at $i = 4$, and
$T[4] = \texttt{c}$ is compared with $P[2] = \texttt{a}$: a mismatch again.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=2 kept=2 miss=true
   caption="$i = 4$, $j = 2$: the hatched cells were not re-compared; the LPS array guarantees them." %}

**Alignment 3 — fall back to $j = \text{lps}[1] = 0$.** The prefix `ab` has
no border, so nothing carries over. $T[4] = \texttt{c}$ against
$P[0] = \texttt{a}$ fails, and since $j = 0$ the text pointer finally
advances to $i = 5$.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=4 miss=true
   caption="$i = 4$, $j = 0$: no prefix of the pattern ends at <code>c</code>, so $i$ moves on." %}

**Alignment 4 — pattern starts at index 5.** `ab` matches ($j = 2$); then
$T[7] = \texttt{c}$ differs from $P[2] = \texttt{a}$.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=5 matched=2 miss=true
   caption="$i = 7$, $j = 2$: mismatch after two matches." %}

**Alignment 5 — fall back to $j = \text{lps}[1] = 0$.** $T[7] = \texttt{c}$
against $P[0] = \texttt{a}$ fails; $i$ advances to $8$.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=7 miss=true
   caption="$i = 7$, $j = 0$." %}

**Alignment 6 — pattern starts at index 8.** Four characters match
($j = 4$), and then $T[12] = \texttt{a}$ differs from $P[4] = \texttt{d}$.
This is the same situation as in alignment 1.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=8 matched=4 miss=true
   caption="$i = 12$, $j = 4$: mismatch after four matches." %}

**Alignment 7 — fall back to $j = \text{lps}[3] = 2$.** Again the pattern
moves two places and keeps `ab`. This time the retried comparison succeeds:
$T[12] = \texttt{a} = P[2]$, then $T[13] = \texttt{b} = P[3]$ and
$T[14] = \texttt{d} = P[4]$. Now $j = 5 = m$.

{% include string-diagram.html text="ababcabcabababd" pattern="ababd" offset=10 kept=2 matched=3
   caption="$i = 14$, $j = 5 = m$: the pattern is found. Two characters came from the LPS array and three from new comparisons." %}

### Where the match starts

The match was completed on reading $T[i]$ with $i = 14$, and it is $m = 5$
characters long, so it starts at

$$
i - m + 1 \;=\; 14 - 5 + 1 \;=\; 10 .
$$

Indeed $T[10..14] = \texttt{ababd}$. The single-string view gives the same
answer. In $$N = \texttt{ababd}\mathtt{\#}\texttt{ababcabcabababd}$$ the prefix function first
reaches $m = 5$ at position $i = 20$, and $i - 2m = 20 - 10 = 10$.

{% include string-diagram.html size="sm" text="ababd#ababcabcabababd" text_label="N" pattern="ababd" pattern_label="P" offset=16 matched=5
   values="0,0,1,2,0,0,1,2,3,4,0,1,2,0,1,2,3,4,3,4,5"
   caption="The prefix function of $N = P + \mathtt{\#} + T$. The first value equal to $m = 5$ is at position 20, where an occurrence of the pattern ends." %}

### The complete trace

Every comparison the algorithm makes, in order:

| # | $i$ | $j$ | $T[i]$ vs $P[j]$ | Result | Next |
|:---:|:---:|:---:|:---:|:---|:---|
| 1 | 0 | 0 | `a` vs `a` | equal | $j = 1$ |
| 2 | 1 | 1 | `b` vs `b` | equal | $j = 2$ |
| 3 | 2 | 2 | `a` vs `a` | equal | $j = 3$ |
| 4 | 3 | 3 | `b` vs `b` | equal | $j = 4$ |
| 5 | 4 | 4 | `c` vs `d` | **differ** | $j = \text{lps}[3] = 2$ |
| 6 | 4 | 2 | `c` vs `a` | **differ** | $j = \text{lps}[1] = 0$ |
| 7 | 4 | 0 | `c` vs `a` | **differ** | $j = 0$, advance $i$ |
| 8 | 5 | 0 | `a` vs `a` | equal | $j = 1$ |
| 9 | 6 | 1 | `b` vs `b` | equal | $j = 2$ |
| 10 | 7 | 2 | `c` vs `a` | **differ** | $j = \text{lps}[1] = 0$ |
| 11 | 7 | 0 | `c` vs `a` | **differ** | $j = 0$, advance $i$ |
| 12 | 8 | 0 | `a` vs `a` | equal | $j = 1$ |
| 13 | 9 | 1 | `b` vs `b` | equal | $j = 2$ |
| 14 | 10 | 2 | `a` vs `a` | equal | $j = 3$ |
| 15 | 11 | 3 | `b` vs `b` | equal | $j = 4$ |
| 16 | 12 | 4 | `a` vs `d` | **differ** | $j = \text{lps}[3] = 2$ |
| 17 | 12 | 2 | `a` vs `a` | equal | $j = 3$ |
| 18 | 13 | 3 | `b` vs `b` | equal | $j = 4$ |
| 19 | 14 | 4 | `d` vs `d` | equal | $j = 5 = m$: found at $14 - 5 + 1 = 10$ |

The column $i$ never decreases. KMP uses 19 comparisons here; the naive
method needs 27 to reach the same answer.

### When the pattern is not present

If the pattern does not occur, nothing special happens: the loop simply
reaches the end of the text without $j$ ever becoming $m$, and the function
reports failure by returning $-1$.

For example, remove the final `d` and search for `ababd` in
`ababcabcababab`. The trace is identical up to comparison 18, after which
the text is exhausted with $j = 4$. Four characters of the pattern were
matched at the very end, but four is not five. In the single-string view,
the largest value of the prefix function of $$P + \mathtt{\#} + T$$ is $4$, so
the condition $\pi[i] = m$ is never met.

There is no need to backtrack or to check anything further, because the
invariant guarantees that $j$ always records the *longest* prefix of the
pattern ending at the current position. If the full pattern ended anywhere,
$j$ would have reached $m$ there.

## Python Implementation

```python
def prefix_function(s):
    """pi[i] = length of the longest proper prefix of s[0..i]
    that is also a suffix of s[0..i]."""
    pi = [0] * len(s)
    for i in range(1, len(s)):
        j = pi[i - 1]                    # longest border of s[0..i-1]
        while j > 0 and s[i] != s[j]:    # try the next shorter border
            j = pi[j - 1]
        if s[i] == s[j]:                 # extend the border
            j += 1
        pi[i] = j
    return pi


def kmp_search(text, pattern):
    """Return the index of the first occurrence of pattern in text, or -1."""
    m = len(pattern)
    if m == 0:
        return 0                         # empty pattern

    lps = prefix_function(pattern)
    j = 0                                # pattern characters matched
    for i, c in enumerate(text):
        while j > 0 and c != pattern[j]: # mismatch: fall back
            j = lps[j - 1]
        if c == pattern[j]:
            j += 1
        if j == m:                       # full match ending at text[i]
            return i - m + 1
    return -1
```

```python
>>> kmp_search("ababcabcabababd", "ababd")
10
>>> kmp_search("ababcabcababab", "ababd")
-1
```

The parts that deserve attention:

- **LPS construction.** `prefix_function` is a line-by-line transcription of
  the two facts above. The loop starts at $i = 1$ because $\pi[0] = 0$ by
  definition. `j = pi[i - 1]` takes the longest border of the previous
  prefix (Fact 1); the `while` loop walks down the chain of shorter borders
  (Fact 2); the `if` extends whichever border survived.
- **Mismatch handling.** The `while` loop in `kmp_search` is the fallback
  $j = \text{lps}[j-1]$. It has the same shape as the loop in
  `prefix_function` because it is the same computation — matching the
  pattern against the text instead of against itself. The condition `j > 0`
  matters: when no characters are matched there is nothing to fall back to,
  and the `for` loop moves on to the next text character.
- **The text pointer.** `i` is driven by a plain `for` loop and is never
  modified inside it. The text is read once, left to right, which also means
  it could be a stream that is not held in memory.
- **Reporting the match.** `j == m` is tested immediately after the
  increment, and the start index is `i - m + 1`. To find *all* occurrences
  instead of the first, record the index and continue with `j = lps[j - 1]`.
- **The empty pattern.** Returning `0` follows the convention of Python's
  own `str.find`.

For completeness, here is the single-string formulation. It is the shortest
correct statement of the algorithm, at the price of storing a table for the
whole text:

```python
def kmp_search_concat(text, pattern, sep="#"):
    """Same search via the prefix function of pattern + sep + text.

    sep must be a character that occurs in neither string.
    """
    m = len(pattern)
    if m == 0:
        return 0
    pi = prefix_function(pattern + sep + text)
    for i in range(2 * m, len(pi)):
        if pi[i] == m:                   # an occurrence ends at index i
            return i - 2 * m
    return -1
```

## Time and Space Complexity

**Building the table: $O(m)$.** Consider the variable $j$ over the whole run
of `prefix_function`. It increases by at most one per iteration of the `for`
loop, so by at most $m - 1$ in total. Each iteration of the inner `while`
loop strictly decreases it, since $\pi[j-1] < j$, and $j$ is never negative.
A quantity that rises by at most $m - 1$ overall cannot fall more than
$m - 1$ times, so the `while` loop runs at most $m - 1$ times *in total*,
across all values of $i$.

**Searching: $O(n)$.** The same argument applies to `kmp_search`: $j$
increases at most once per text character, so at most $n$ times, and
therefore the fallback executes at most $n$ times in total. Each comparison
either advances $i$ or triggers a fallback, giving at most $2n$ character
comparisons. In the worked example that bound is $30$, and the algorithm used
$19$.

Altogether:

| | Naive | KMP |
|:---|:---:|:---:|
| Preprocessing | none | $O(m)$ |
| Search, worst case | $O(nm)$ | $O(n)$ |
| Total, worst case | $O(nm)$ | $O(n + m)$ |
| Extra space | $O(1)$ | $O(m)$ |

The bound $O(n + m)$ is optimal up to a constant factor in the worst case,
since in general an algorithm must read every character of both strings. An
individual fallback can be long — a single text character may trigger
several — but the *amortized* cost per character is constant. The single-string formulation has the same running
time and uses $O(n + m)$ space.

## Conclusion

KMP rests on one observation: after a partial match, the text just read is a
prefix of the pattern, so everything about the next viable alignment can be
worked out from the pattern alone, in advance. The prefix function stores
exactly that information — for each prefix, the length of its longest
border — and the search loop consults it at each mismatch instead of moving
backwards in the text.

The ideas to keep:

- $\pi[i]$ is the length of the longest proper prefix of $s[0..i]$ that is
  also its suffix; it satisfies $\pi[i] \le \pi[i-1] + 1$, and the shorter
  candidates are $\pi[\pi[i-1]-1]$, and so on.
- On a mismatch with $j$ characters matched, set $j = \pi[j-1]$ and retry the
  same text character.
- Searching is the prefix function of $$P + \mathtt{\#} + T$$; an occurrence
  ends wherever the value equals $m$, and it starts $2m$ positions earlier
  in that string's indexing.
- Total time is $O(n + m)$ by an amortized argument on $j$.

The prefix function is useful well beyond searching: it yields the shortest
period of a string, counts occurrences of every prefix, and is the basis of
the Aho–Corasick automaton for matching many patterns at once.

### References

- D. E. Knuth, J. H. Morris, and V. R. Pratt, "Fast pattern matching in
  strings," *SIAM Journal on Computing* 6(2), 1977, pp. 323–350.
- T. H. Cormen, C. E. Leiserson, R. L. Rivest, and C. Stein, *Introduction to
  Algorithms*, the chapter on string matching.
