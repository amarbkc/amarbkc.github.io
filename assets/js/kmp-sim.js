/* Step-through simulation of KMP string matching.
   Markup comes from _includes/kmp-simulation.html; the steps are computed here
   by running the real algorithm on the element's data-text / data-pattern. */
(function () {
  "use strict";

  function prefixFunction(s) {
    var pi = [0], i, j;
    for (i = 1; i < s.length; i++) {
      j = pi[i - 1];
      while (j > 0 && s[i] !== s[j]) j = pi[j - 1];
      if (s[i] === s[j]) j++;
      pi[i] = j;
    }
    return pi;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function code(s) { return "<code>" + esc(s) + "</code>"; }
  function plural(n, word) { return n + " " + word + (n === 1 ? "" : (/ch$/.test(word) ? "es" : "s")); }

  /* Each step is a snapshot: where the pattern sits (off), how many of its
     leading characters are known equal (j), how many of those were carried over
     by the LPS array rather than compared (kept), and what to say about it. */
  function buildSteps(T, P) {
    var lps = prefixFunction(P), n = T.length, m = P.length;
    var steps = [], i = 0, j = 0, kept = 0, cmp = 0;

    function push(o) {
      if (o.off === undefined) o.off = i - j;
      o.i = i; o.j = j; o.kept = kept; o.cmp = cmp;
      if (o.ref === undefined) o.ref = -1;
      steps.push(o);
    }

    push({ msg: "Place the pattern under the start of the text. " + code("i") + " is the text position being read; " +
                code("j") + " counts the pattern characters matched so far." });

    while (i < n) {
      if (T[i] === P[j]) {
        var from = i, pfrom = j;
        while (i < n && j < m && T[i] === P[j]) { i++; j++; cmp++; }
        var run = i - from;
        var what = run === 1
          ? code("T[" + from + "]") + " = " + code("P[" + pfrom + "]") + " = " + code(T[from])
          : code("T[" + from + ".." + (i - 1) + "]") + " = " + code("P[" + pfrom + ".." + (j - 1) + "]") + " = " + code(T.slice(from, i));
        if (j === m) {
          var at = i - m;
          i = i - 1; // show the pointer on the last character read
          push({ found: at, off: at, msg: what + ". Now " + code("j = " + m) + ", the full pattern length, so the pattern ends at " +
                 code("i = " + i) + " and starts at " + code("i − m + 1 = " + i + " − " + m + " + 1 = " + at) + "." });
          return { steps: steps, lps: lps };
        }
        push({ msg: what + ": " + plural(run, "match") + " in a row, so " + code("j = " + j) + "." });
        continue;
      }

      cmp++;
      if (j > 0) {
        var nj = lps[j - 1], was = j;
        push({ miss: true, ref: j - 1,
               msg: "Mismatch: " + code("T[" + i + "] = " + T[i]) + " but " + code("P[" + j + "] = " + P[j]) + ". " +
                    plural(j, "character") + " had matched, so look up " + code("lps[" + (j - 1) + "] = " + nj) + "." });
        j = nj; kept = nj;
        push({ ref: was - 1, slid: true,
               msg: nj > 0
                 ? "Slide the pattern right by " + code(was + " − " + nj + " = " + (was - nj)) + ". Its first " + plural(nj, "character") +
                   " (" + code(P.slice(0, nj)) + ") already sit under a matching " + code(T.slice(i - nj, i)) +
                   " — they are <strong>not compared again</strong>. " + code("i") + " stays at " + i + "."
                 : code("lps[" + (was - 1) + "] = 0") + ": no part of the match can be reused. The pattern slides so that " +
                   code("P[0]") + " is under " + code("T[" + i + "]") + "; " + code("i") + " stays at " + i + "." });
      } else {
        push({ miss: true,
               msg: "Mismatch: " + code("T[" + i + "] = " + T[i]) + " but " + code("P[0] = " + P[0]) + ". With " + code("j = 0") +
                    " there is nothing to fall back to." });
        i++; kept = 0;
        push({ slid: true, msg: "Move on to the next text character: " + code("i = " + i) + "." });
      }
    }
    push({ notFound: true, msg: "The text is exhausted and " + code("j") + " never reached " + m + ": the pattern does not occur." });
    return { steps: steps, lps: lps };
  }

  function cells(chars, cls) {
    return chars.map(function (c) { return '<span class="strfig__cell' + (cls ? " " + cls : "") + '">' + esc(c) + "</span>"; }).join("");
  }

  function init(root) {
    var T = root.getAttribute("data-text") || "", P = root.getAttribute("data-pattern") || "";
    if (!T || !P) return;
    var built = buildSteps(T, P), steps = built.steps, lps = built.lps;
    var idx = T.split("").map(function (_, k) { return k; });

    root.querySelector("[data-sim-stage]").innerHTML =
      '<div class="strfig__grid" aria-hidden="true">' +
        '<div class="strfig__row strfig__row--index" data-row="index"><span class="strfig__label"></span>' + cells(idx) + "</div>" +
        '<div class="strfig__row" data-row="text"><span class="strfig__label">T</span>' + cells(T.split("")) + "</div>" +
        '<div class="strfig__row"><span class="strfig__label">P</span><span class="kmpsim__slide" data-row="pattern">' + cells(P.split("")) + "</span></div>" +
        '<div class="strfig__row strfig__row--values"><span class="strfig__label">lps</span><span class="kmpsim__slide" data-row="lps">' + cells(lps) + "</span></div>" +
      "</div>";

    var q = function (sel) { return root.querySelector(sel); };
    var rowCells = function (name) { return root.querySelectorAll('[data-row="' + name + '"] > .strfig__cell'); };
    var indexCells = rowCells("index"), textCells = rowCells("text"), patCells = rowCells("pattern"), lpsCells = rowCells("lps");
    var slides = root.querySelectorAll(".kmpsim__slide");
    var msg = q("[data-sim-msg]"), counter = q("[data-sim-counter]"), readout = q("[data-sim-readout]"), result = q("[data-sim-result]");
    var prev = q("[data-sim-prev]"), next = q("[data-sim-next]"), play = q("[data-sim-play]"), reset = q("[data-sim-reset]");
    var at = 0, timer = null;

    function state(pj, s) {
      if (pj < 0 || pj >= P.length) return "";
      if (pj < s.kept) return "is-kept";
      if (pj < s.j) return "is-match";
      if (pj === s.j && s.miss) return "is-miss";
      return "";
    }

    function render() {
      var s = steps[at], k;
      for (k = 0; k < slides.length; k++) slides[k].style.setProperty("--off", s.off);
      for (k = 0; k < textCells.length; k++) {
        textCells[k].className = "strfig__cell " + state(k - s.off, s);
        indexCells[k].className = "strfig__cell" + (k === s.i && !s.notFound ? " is-cur" : "");
      }
      for (k = 0; k < patCells.length; k++) {
        patCells[k].className = "strfig__cell " + state(k, s);
        lpsCells[k].className = "strfig__cell" + (k === s.ref ? " is-ref" : "");
      }
      msg.innerHTML = s.msg;
      counter.textContent = "Step " + (at + 1) + " of " + steps.length;
      readout.textContent = "i = " + Math.min(s.i, T.length - 1) + "   j = " + s.j + "   comparisons = " + s.cmp;
      if (s.found !== undefined) { result.hidden = false; result.textContent = "Pattern found at index " + s.found; }
      else if (s.notFound) { result.hidden = false; result.textContent = "Pattern not found (−1)"; }
      else { result.hidden = true; }
      prev.disabled = at === 0;
      next.disabled = at === steps.length - 1;
      play.textContent = timer ? "Pause" : (at === steps.length - 1 ? "Replay" : "Play");
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function go(k) { at = Math.max(0, Math.min(steps.length - 1, k)); if (at === steps.length - 1) stop(); render(); }

    prev.addEventListener("click", function () { stop(); go(at - 1); });
    next.addEventListener("click", function () { stop(); go(at + 1); });
    reset.addEventListener("click", function () { stop(); go(0); });
    play.addEventListener("click", function () {
      if (timer) { stop(); render(); return; }
      if (at === steps.length - 1) at = 0;
      timer = setInterval(function () { go(at + 1); }, 1800);
      render();
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); go(at + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(at - 1); e.preventDefault(); }
    });

    root.classList.add("is-ready");
    render();
  }

  function start() { Array.prototype.forEach.call(document.querySelectorAll("[data-kmp-sim]"), init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
