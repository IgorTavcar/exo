/* Exo wiki shell: nav, TOC, theme, source links, light syntax highlighting, search. No dependencies. */
(function () {
  var REPO = "https://github.com/IgorTavcar/exo/blob/";
  var SHA = "58fa2ff5fd6f411c2629dfe6b4c1a63c95e62e5b"; // commit the wiki was written against
  var PAGES = [
    ["Start", [
      ["index.html", "Overview"],
      ["architecture.html", "Architecture & crate map"],
      ["data-model.html", "Data model & event log"],
    ]],
    ["Runtime internals", [
      ["harnesses.html", "Harnesses & executors"],
      ["native-harnesses.html", "Codex, Claude Code, Pi & Cursor"],
      ["tools-and-mcp.html", "Tools, MCP & skills"],
      ["sandboxes.html", "Sandboxes"],
      ["egress-and-vaults.html", "Egress, secrets & vaults"],
      ["managed-agents.html", "Managed agents & adapters"],
      ["cli-and-server.html", "CLI, server & tooling"],
    ]],
    ["Applied", [
      ["prompts.html", "Prompts, verbatim"],
      ["examples.html", "Examples & custom harnesses"],
    ]],
    ["Distilled", [
      ["ideas.html", "Ideas worth stealing"],
      ["surprises.html", "Surprises & gotchas"],
      ["reference.html", "Glossary & file map"],
    ]],
  ];
  var flat = [];
  PAGES.forEach(function (g) { g[1].forEach(function (p) { flat.push(p); }); });
  var here = location.pathname.split("/").pop() || "index.html";

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  // theme
  var saved = null;
  try { saved = localStorage.getItem("exo-wiki-theme"); } catch (e) {}
  var dark = saved ? saved === "dark" : window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  function applyTheme() { document.documentElement.setAttribute("data-theme", dark ? "dark" : "light"); }
  applyTheme();

  // nav
  var nav = document.getElementById("nav");
  if (nav) {
    var h = '<a class="brand" href="index.html">Exo internals<small>An implementation wiki</small></a>';
    h += '<input id="search" type="search" placeholder="Search the wiki…" autocomplete="off"><div id="results"></div>';
    PAGES.forEach(function (g) {
      h += "<h4>" + g[0] + "</h4><ul>";
      g[1].forEach(function (p) {
        h += '<li><a href="' + p[0] + '"' + (p[0] === here ? ' class="active"' : "") + ">" + p[1] + "</a></li>";
      });
      h += "</ul>";
    });
    h += '<button class="theme" id="themebtn">Toggle light / dark</button>';
    h += '<div class="meta">Written against commit <code>' + SHA.slice(0, 7) + '</code>. Source references link to that commit on GitHub.</div>';
    nav.innerHTML = h;
    document.getElementById("themebtn").onclick = function () {
      dark = !dark; applyTheme();
      try { localStorage.setItem("exo-wiki-theme", dark ? "dark" : "light"); } catch (e) {}
    };
  }

  // headings: anchors + TOC
  var main = document.querySelector("main");
  var tocItems = [];
  if (main) {
    main.querySelectorAll("h2, h3").forEach(function (hd, i) {
      if (!hd.id) hd.id = hd.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "s" + i;
      hd.appendChild(el("a", { class: "anchor", href: "#" + hd.id }, "#"));
      tocItems.push(hd);
    });
    var tocEl = document.getElementById("toc");
    if (tocEl && tocItems.length) {
      var t = "<h5>On this page</h5>";
      tocItems.forEach(function (hd) {
        t += '<a class="' + (hd.tagName === "H3" ? "l3" : "l2") + '" href="#' + hd.id + '">' + hd.firstChild.textContent + "</a>";
      });
      tocEl.innerHTML = t;
      var links = tocEl.querySelectorAll("a");
      var onScroll = function () {
        var cur = 0;
        tocItems.forEach(function (hd, i) { if (hd.getBoundingClientRect().top < 120) cur = i; });
        links.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
      };
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    // pager
    var idx = flat.findIndex(function (p) { return p[0] === here; });
    if (idx >= 0) {
      var pg = el("div", { class: "pager" });
      pg.innerHTML =
        (idx > 0 ? '<a href="' + flat[idx - 1][0] + '"><small>Previous</small>' + flat[idx - 1][1] + "</a>" : "<span></span>") +
        (idx < flat.length - 1 ? '<a href="' + flat[idx + 1][0] + '" style="text-align:right"><small>Next</small>' + flat[idx + 1][1] + "</a>" : "<span></span>");
      main.appendChild(pg);
    }
  }

  // source references: <span class="src">path/to/file.rs:120-140</span> -> GitHub permalink
  var lastPath = "";
  document.querySelectorAll(".src").forEach(function (s) {
    if (s.tagName === "A") return;
    var txt = s.textContent.trim();
    if (txt.charAt(0) === ":" && lastPath) txt = lastPath + txt; // ":120-140" reuses the previous ref's file
    var m = txt.match(/^(.+?)(?::(\d+)(?:-(\d+))?)?$/);
    if (!m) return;
    lastPath = m[1];
    var url = REPO + SHA + "/" + m[1] + (m[2] ? "#L" + m[2] + (m[3] ? "-L" + m[3] : "") : "");
    var a = el("a", { class: "src", href: url, target: "_blank", rel: "noopener" });
    a.textContent = s.textContent.trim();
    s.replaceWith(a);
  });

  // light syntax highlighting
  var KW = {
    rust: "fn let mut pub struct enum impl trait use mod match if else for while loop return async await move self Self crate super where const static type as in ref dyn unsafe true false Some None Ok Err",
    ts: "const let var function return if else for while of in async await import export from class interface type extends implements new this typeof true false null undefined throw try catch finally switch case default yield readonly as satisfies",
    py: "def class return if elif else for while in import from as with try except finally raise lambda yield None True False async await pass",
    sh: "if then else fi for do done while case esac function export in",
  };
  KW.typescript = KW.javascript = KW.js = KW.tsx = KW.ts; KW.python = KW.py; KW.bash = KW.shell = KW.sh;
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function hl(code, lang) {
    var kws = KW[lang]; if (!kws) return null;
    var kwset = {}; kws.split(" ").forEach(function (k) { kwset[k] = 1; });
    var hash = lang === "py" || lang === "python" || lang === "sh" || lang === "bash" || lang === "shell";
    var re = new RegExp(
      (hash ? "(#[^\\n]*)" : "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)") +
      "|(\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)|\\b(\\d[\\d_.]*)\\b|\\b([A-Za-z_][A-Za-z0-9_]*)\\b(\\s*[(!])?", "g");
    var out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index)); last = re.lastIndex;
      if (m[1]) out += '<span class="tc">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="ts">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tn">' + m[3] + "</span>";
      else if (kwset[m[4]]) out += '<span class="tk">' + m[4] + "</span>" + esc(m[5] || "");
      else if (m[5]) out += '<span class="tf">' + m[4] + "</span>" + esc(m[5]);
      else out += esc(m[0]);
    }
    return out + esc(code.slice(last));
  }
  document.querySelectorAll("pre > code[class*=language-]").forEach(function (c) {
    var lang = (c.className.match(/language-(\w+)/) || [])[1];
    var r = hl(c.textContent, lang);
    if (r != null) c.innerHTML = r;
  });

  // search (index is generated by wiki/build-search.mjs into assets/search-index.js)
  var box = document.getElementById("search");
  if (box) {
    var s = document.createElement("script");
    s.src = "assets/search-index.js";
    document.head.appendChild(s);
    box.addEventListener("input", function () {
      var q = box.value.trim().toLowerCase(), res = document.getElementById("results");
      if (q.length < 2 || !window.WIKI_INDEX) { res.innerHTML = ""; return; }
      var terms = q.split(/\s+/), hits = [];
      window.WIKI_INDEX.forEach(function (e) {
        var hay = (e.t + " " + e.x).toLowerCase(), score = 0;
        for (var i = 0; i < terms.length; i++) {
          var at = hay.indexOf(terms[i]);
          if (at < 0) return;
          score += e.t.toLowerCase().indexOf(terms[i]) >= 0 ? 10 : 1;
        }
        hits.push([score, e]);
      });
      hits.sort(function (a, b) { return b[0] - a[0]; });
      res.innerHTML = hits.slice(0, 8).map(function (h) {
        var e = h[1];
        return '<a href="' + e.u + '">' + esc(e.t) + "<small>" + esc(e.p) + "</small></a>";
      }).join("") || "<small>No matches</small>";
    });
  }
})();
