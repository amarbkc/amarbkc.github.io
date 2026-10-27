/* Progressive enhancements. Every page works without this file. */
(function () {
  "use strict";

  /* Theme toggle ------------------------------------------------------------ */
  var root = document.documentElement;
  var themeButton = document.querySelector(".theme-toggle");

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeButton() {
    if (!themeButton) return;
    var dark = currentTheme() === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeButton.title = themeButton.getAttribute("aria-label");
  }
  if (themeButton) {
    syncThemeButton();
    themeButton.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeButton();
    });
  }

  /* Mobile navigation --------------------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        navToggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        navToggle.focus();
      }
    });
  }

  /* Code blocks: language label + copy button ---------------------------------- */
  document.querySelectorAll(".prose div.highlighter-rouge").forEach(function (block) {
    var match = block.className.match(/language-([\w+-]+)/);
    if (match && match[1] !== "plaintext") block.setAttribute("data-lang", match[1]);

    var code = block.querySelector("pre code");
    if (!code || !navigator.clipboard) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "copy-button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(code.innerText.replace(/\n$/, "")).then(function () {
        button.textContent = "Copied";
        setTimeout(function () { button.textContent = "Copy"; }, 1500);
      });
    });
    block.appendChild(button);
  });

  /* Project category filter ------------------------------------------------------ */
  var filters = document.querySelector("[data-project-filters]");
  if (filters) {
    var cards = document.querySelectorAll("[data-project-grid] [data-category]");
    var buttons = filters.querySelectorAll("button[data-filter]");
    var empty = document.querySelector("[data-filter-empty]");
    var applyFilter = function (slug) {
      var shown = 0;
      buttons.forEach(function (b) {
        var active = b.getAttribute("data-filter") === slug;
        b.setAttribute("aria-pressed", String(active));
        if (active && empty) {
          empty.querySelector("[data-filter-empty-name]").textContent = b.getAttribute("data-name") || "this category";
        }
      });
      cards.forEach(function (c) {
        var match = slug === "all" || c.getAttribute("data-category") === slug;
        c.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0 || slug === "all";
    };
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var slug = b.getAttribute("data-filter");
        applyFilter(slug);
        if (history.replaceState) history.replaceState(null, "", slug === "all" ? location.pathname : "#" + slug);
      });
    });
    var initial = location.hash.slice(1);
    var valid = Array.prototype.some.call(buttons, function (b) { return b.getAttribute("data-filter") === initial; });
    applyFilter(valid ? initial : "all");
  }

  /* Blog search (client-side, over /search.json) ---------------------------------- */
  var search = document.querySelector("[data-search]");
  if (search && window.fetch) {
    var input = search.querySelector("input");
    var status = search.querySelector(".search__status");
    var listing = document.querySelector("[data-post-listing]");
    var results = document.querySelector("[data-search-results]");
    var index = null;

    search.hidden = false;

    var escapeHtml = function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    };

    var render = function (query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        listing.hidden = false;
        results.hidden = true;
        status.textContent = "";
        return;
      }
      var terms = q.split(/\s+/);
      var hits = index.filter(function (p) {
        var hay = (p.title + " " + p.summary + " " + p.categories.join(" ") + " " + p.tags.join(" ") + " " + p.content).toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) !== -1; });
      });
      listing.hidden = true;
      results.hidden = false;
      status.textContent = hits.length + (hits.length === 1 ? " post" : " posts") + " found";
      results.innerHTML = hits.length
        ? hits.map(function (p) {
            return '<article class="post-item"><div class="post-item__meta"><time>' + escapeHtml(p.date) +
              "</time></div><h3 class=\"post-item__title\"><a href=\"" + escapeHtml(p.url) + "\">" +
              escapeHtml(p.title) + '</a></h3><p class="post-item__excerpt">' + escapeHtml(p.summary) + "</p></article>";
          }).join("")
        : '<div class="empty-state"><p>No posts match “' + escapeHtml(query.trim()) + "”.</p></div>";
    };

    var load = function () {
      if (index) return Promise.resolve(index);
      return fetch(search.getAttribute("data-search"))
        .then(function (r) { return r.json(); })
        .then(function (data) { index = data; return data; });
    };

    input.addEventListener("focus", load, { once: true });
    input.addEventListener("input", function () {
      load().then(function () { render(input.value); }).catch(function () {
        status.textContent = "Search is unavailable right now.";
      });
    });
  }
})();
