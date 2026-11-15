/* Step-through simulations for the palindrome post.
   Markup comes from _includes/palindrome-simulation.html. Two modes, chosen by
   data-palindrome-sim: "expand" (expand around center) and "manacher".
   The steps are computed by running the real algorithm on data-text. */
(function () {
  "use strict";
  if (window.__palindromeSimLoaded) return;
  window.__palindromeSimLoaded = true;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function code(s) { return "<code>" + esc(s) + "</code>"; }
  function row(label, n, cls, name) {
    var h = '<div class="strfig__row' + (cls ? " " + cls : "") + '" data-row="' + name + '"><span class="strfig__label">' + label + "</span>";
    for (var k = 0; k < n; k++) h += '<span class="strfig__cell"></span>';
    return h + "</div>";
  }

  /* Shared Previous / Next / Play / Restart wiring. */
  function stepper(root, steps, render) {
    var q = function (sel) { return root.querySelector(sel); };
    var prev = q("[data-sim-prev]"), next = q("[data-sim-next]"), play = q("[data-sim-play]"), reset = q("[data-sim-reset]");
    var counter = q("[data-sim-counter]"), msg = q("[data-sim-msg]"), readout = q("[data-sim-readout]"), result = q("[data-sim-result]");
    var at = 0, timer = null;

    function draw() {
      var s = steps[at];
      render(s);
      msg.innerHTML = s.msg;
      readout.textContent = s.readout || "";
      result.hidden = !s.result;
      if (s.result) result.textContent = s.result;
      counter.textContent = "Step " + (at + 1) + " of " + steps.length;
      prev.disabled = at === 0;
      next.disabled = at === steps.length - 1;
      play.textContent = timer ? "Pause" : (at === steps.length - 1 ? "Replay" : "Play");
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function go(k) { at = Math.max(0, Math.min(steps.length - 1, k)); if (at === steps.length - 1) stop(); draw(); }

    prev.addEventListener("click", function () { stop(); go(at - 1); });
    next.addEventListener("click", function () { stop(); go(at + 1); });
    reset.addEventListener("click", function () { stop(); go(0); });
    play.addEventListener("click", function () {
      if (timer) { stop(); draw(); return; }
      if (at === steps.length - 1) at = 0;
      timer = setInterval(function () { go(at + 1); }, 2200);
      draw();
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); go(at + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(at - 1); e.preventDefault(); }
    });
    root.classList.add("is-ready");
    draw();
  }

  /* ---- Expand around center ------------------------------------------------ */
  function expandSteps(s) {
    var n = s.length, steps = [], best = { start: 0, len: 0 };
    function bestText() { return best.len ? '"' + s.substr(best.start, best.len) + '"' : "none yet"; }
    function push(o) {
      o.readout = (o.l !== undefined ? "l = " + o.l + "   r = " + o.r + "   " : "") + "longest so far = " + bestText();
      steps.push(o);
    }

    push({ msg: "A string of length " + n + " has " + (2 * n - 1) + " possible centers: " + n + " characters and " + (n - 1) +
                " gaps between them. Try each one, expanding outward while the two ends match." });

    for (var i = 0; i < n; i++) {
      for (var even = 0; even < 2; even++) {
        var l = i, r = i + even;
        if (r >= n) continue;
        var where = even ? "Center between " + code("s[" + i + "]") + " and " + code("s[" + r + "]")
                         : "Center on " + code("s[" + i + "] = " + s[i]);
        var span = null, first = true, last;
        for (;;) {
          if (l < 0 || r >= n) {
            last = { l: l, r: r, span: span, msg: (l < 0 ? code("l") + " has moved past the left edge" : code("r") + " has moved past the right edge") + " of the string. Stop." };
            break;
          }
          if (s[l] === s[r]) {
            span = [l, r];
            push({ l: l, r: r, span: span,
                   msg: first ? where + (even ? ": " + code("s[" + l + "] = s[" + r + "] = " + s[l]) + ", a palindrome of length 2."
                                              : ". A single character is always a palindrome.")
                              : "Move both pointers outward: " + code("s[" + l + "] = s[" + r + "] = " + s[l]) +
                                ". The palindrome grows to " + code(s.slice(l, r + 1)) + "." });
            l--; r++; first = false;
          } else {
            last = { l: l, r: r, span: span, miss: [l, r],
                     msg: (first ? where + ": " : "Move both pointers outward: ") +
                          code("s[" + l + "] = " + s[l]) + " ≠ " + code("s[" + r + "] = " + s[r]) + ". Stop." };
            break;
          }
        }
        var len = r - l - 1;
        last.msg += len > 0
          ? " Palindrome " + code(s.substr(l + 1, len)) + ", length " + code("r − l − 1 = " + len) + "."
          : " No palindrome at this center.";
        if (len > best.len) { best = { start: l + 1, len: len }; last.msg += " <strong>New longest.</strong>"; }
        push(last);
      }
    }
    var b = s.substr(best.start, best.len);
    push({ span: [best.start, best.start + best.len - 1], final: true,
           msg: "All " + (2 * n - 1) + " centers tried. The longest palindrome is " +
                code("s[" + best.start + ".." + (best.start + best.len - 1) + "] = " + b) + ".",
           result: "Longest palindrome: " + b + " (length " + best.len + ")" });
    return steps;
  }

  function initExpand(root, s) {
    var n = s.length, cols = n + 2; // one spare column at each end for a pointer that steps off the string
    root.querySelector("[data-sim-stage]").innerHTML =
      '<div class="strfig__grid" aria-hidden="true">' +
      row("", cols, "strfig__row--index", "index") + row("s", cols, "", "text") +
      row("", cols, "strfig__row--values stepsim__marks", "marks") + "</div>";
    var get = function (name) { return root.querySelectorAll('[data-row="' + name + '"] > .strfig__cell'); };
    var index = get("index"), text = get("text"), marks = get("marks");

    stepper(root, expandSteps(s), function (st) {
      for (var c = 0; c < cols; c++) {
        var k = c - 1, inside = k >= 0 && k < n, cls = "strfig__cell";
        index[c].textContent = inside ? k : "";
        text[c].textContent = inside ? s[k] : "";
        if (!inside) cls += " strfig__cell--blank";
        else if (st.miss && (k === st.miss[0] || k === st.miss[1])) cls += " is-miss";
        else if (st.span && k >= st.span[0] && k <= st.span[1]) cls += " is-match";
        text[c].className = cls;
        var m = "";
        if (st.l !== undefined && !st.final) {
          if (k === st.l && k === st.r) m = "l,r"; else if (k === st.l) m = "l"; else if (k === st.r) m = "r";
        }
        marks[c].textContent = m;
      }
    });
  }

  /* ---- Manacher ---------------------------------------------------------------- */
  function manacherSteps(s) {
    var t = "^#" + s.split("").join("#") + "#$", N = t.length;
    var dp = [], steps = [], c = 0, right = 0, i;
    for (i = 0; i < N; i++) dp.push(null);
    dp[0] = 0; dp[N - 1] = 0;

    function push(o) {
      o.dp = dp.slice(); o.c = c; o.right = right;
      if (o.i !== undefined) {
        o.readout = "i = " + o.i + "   c = " + c + "   right = " + right + (o.mirror >= 0 ? "   mirror = " + o.mirror : "");
      }
      steps.push(o);
    }

    push({ mirror: -1, msg: "Put " + code("#") + " between the characters, and " + code("^") + " and " + code("$") +
           " at the ends. Every palindrome now has a single cell as its center. " + code("dp[i]") +
           " is how far the palindrome centered at " + code("i") + " reaches on each side — which is also its length in the original string." });

    for (i = 1; i < N - 1; i++) {
      var inside = i < right, m = -1, v = 0;
      if (inside) {
        m = 2 * c - i;
        v = Math.min(right - i, dp[m]);
        push({ i: i, mirror: m, span: [i - v, i + v], ref: m,
               msg: code("i = " + i) + " is inside the known palindrome (hatched, ending at " + code("right = " + right) + "). Its mirror image about " +
                    code("c = " + c) + " is " + code("2·" + c + " − " + i + " = " + m) + ", and " + code("dp[" + m + "] = " + dp[m]) +
                    ". So start with " + code("dp[" + i + "] = min(right − i, dp[" + m + "]) = min(" + (right - i) + ", " + dp[m] + ") = " + v) +
                    " — <strong>no comparisons needed</strong>." });
      }
      var d = v;
      while (t[i - d - 1] === t[i + d + 1]) d++;
      dp[i] = d;
      var a = i - d - 1, b = i + d + 1, grew = i + d > right;
      if (grew) { c = i; right = i + d; }
      push({ i: i, mirror: inside ? m : -1, span: [i - d, i + d], miss: [a, b], ref: i,
             msg: (inside ? "Try to expand beyond " + v + ": "
                          : code("i = " + i) + " is not inside a known palindrome, so expand from 0: ") +
                  (d > v ? (d - v) + (d - v === 1 ? " more match, then " : " more matches, then ") : "") +
                  code("t[" + a + "] = " + t[a]) + " ≠ " + code("t[" + b + "] = " + t[b]) + " stops it. " + code("dp[" + i + "] = " + d) + "." +
                  (grew && d > 0 ? " It reaches past the old boundary, so now " + code("c = " + i) + " and " + code("right = " + right) + "." : "") });
    }

    var cm = 0, total = 0;
    for (i = 0; i < N; i++) { if (dp[i] > dp[cm]) cm = i; total += Math.floor((dp[i] + 1) / 2); }
    var left = Math.floor((cm - dp[cm]) / 2), ans = s.substr(left, dp[cm]);
    c = cm; right = cm + dp[cm];
    push({ final: true, mirror: -1, span: [cm - dp[cm], cm + dp[cm]], ref: cm,
           msg: "The largest entry is " + code("dp[" + cm + "] = " + dp[cm]) + ". It starts at " +
                code("(c − dp[c]) // 2 = (" + cm + " − " + dp[cm] + ") // 2 = " + left) + " in the original string, giving " +
                code("s[" + left + ":" + (left + dp[cm]) + "] = " + ans) + ". Adding up " + code("(dp[i] + 1) // 2") +
                " counts all " + total + " palindromic substrings.",
           result: "Longest palindrome: " + ans + " (length " + dp[cm] + ")" });
    return { steps: steps, t: t };
  }

  function initManacher(root, s) {
    var built = manacherSteps(s), t = built.t, N = t.length;
    root.querySelector("[data-sim-stage]").innerHTML =
      '<div class="strfig__grid" aria-hidden="true">' +
      row("", N, "strfig__row--index", "index") + row("t", N, "", "text") +
      row("dp", N, "strfig__row--values", "dp") + row("", N, "strfig__row--values stepsim__marks", "marks") + "</div>";
    var get = function (name) { return root.querySelectorAll('[data-row="' + name + '"] > .strfig__cell'); };
    var index = get("index"), text = get("text"), dpc = get("dp"), marks = get("marks");
    for (var k = 0; k < N; k++) { index[k].textContent = k; text[k].textContent = t[k]; }

    stepper(root, built.steps, function (st) {
      var lo = 2 * st.c - st.right;
      for (var k = 0; k < N; k++) {
        var cls = "strfig__cell";
        if (st.miss && !st.final && (k === st.miss[0] || k === st.miss[1])) cls += " is-miss";
        else if (st.span && k >= st.span[0] && k <= st.span[1]) cls += " is-match";
        else if (st.right > 0 && k >= lo && k <= st.right) cls += " is-kept";
        if (!st.final && k === st.i) cls += " is-cur";
        if (k === st.mirror) cls += " is-mirror";
        text[k].className = cls;
        dpc[k].textContent = st.dp[k] === null ? "" : st.dp[k];
        dpc[k].className = "strfig__cell" + (k === st.ref ? " is-ref" : "");
        var tags = [];
        if (k === st.mirror) tags.push("i′");
        if (k === st.i && !st.final) tags.push("i");
        if (k === st.c && st.right > 0) tags.push("c");
        marks[k].textContent = tags.join("=");
      }
    });
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-palindrome-sim]"), function (root) {
      var s = root.getAttribute("data-text") || "";
      if (!s) return;
      if (root.getAttribute("data-palindrome-sim") === "manacher") initManacher(root, s); else initExpand(root, s);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
