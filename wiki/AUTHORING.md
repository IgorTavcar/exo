# Wiki authoring guide

Static HTML, no build step, no external deps. Start from `wiki/template.html`.
Shell (nav, TOC, pager, theme, GitHub-linking of source refs, syntax highlight) comes from `assets/wiki.js` + `assets/style.css`. Do NOT edit those; do NOT put a nav in your page. Do not edit other agents' pages.

## Components
- Sections: `<h2>` / `<h3>` only (ids + TOC auto-generated). One `<h1>` in the header.
- Source refs (REQUIRED, everywhere): `<span class="src">crates/exoharness/src/types.rs:120-140</span>` — repo-relative path, optional `:line` or `:start-end`. JS turns them into permalinks. Every ref must be verified (open the file / `grep -n`) — wrong line numbers are worse than none. A ref to a whole file is fine: `<span class="src">crates/mcp/src/auth.rs</span>`.
- Inline identifiers: `<code>EventData</code>`.
- Code segment (the valuable bits — real code copied from the repo, trimmed with `// ...` where needed, NEVER invented):
  ```html
  <figure class="code">
    <figcaption><strong>Why this matters in one phrase</strong> <span class="src">path:lines</span></figcaption>
    <pre><code class="language-rust">escaped code here (&lt; &gt; &amp;)</code></pre>
  </figure>
  ```
  languages highlighted: rust, ts, py, sh. Others (json, yaml, toml, md) render plain — use `language-text`.
- Prompts (verbatim text from the repo, escaped):
  ```html
  <figure class="prompt"><figcaption><strong>name / role</strong> <span class="src">path:lines</span></figcaption><pre>verbatim text</pre></figure>
  ```
- Callouts: `<div class="callout idea|surprise|warn|(none = note)"><p class="callout-title">Idea worth stealing</p><p>…</p></div>`
  - `idea` = a design idea / technique worth copying; `surprise` = non-obvious, counter-intuitive, or gotcha; `warn` = sharp edge / known limitation; plain = note.
- Tables: plain `<table>` with `<thead>`.
- Diagrams: either `<pre class="diagram">` ASCII (monospace, keep < 90 cols), or inline `<svg class="diagram" viewBox="0 0 W H">` using classes `box box-accent box-teal box-blue box-warn`, `arrow`, `arrow-dash`, `muted`, `b` (include `<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>` once per svg). Prefer 1–3 good diagrams per page over many.
- Step lists: `<ol class="steps">`. Collapsible: `<details><summary>…</summary>…</details>`. Cross-links to other wiki pages: `<a href="sandboxes.html#snapshots">…</a>` (page files: index, architecture, data-model, harnesses, native-harnesses, tools-and-mcp, sandboxes, egress-and-vaults, managed-agents, cli-and-server, prompts, examples, ideas, surprises, reference).

## Quality bar
- Audience: a strong engineer who has not seen this repo and wants to understand *how it actually works*, fast. Explain the concept, then point at the code that implements it, then show the one or two code segments that are the heart of it.
- Be concrete: name the real types/functions/files/constants/env vars/error variants. Quote real code. Give the flow (who calls whom) with refs. Prefer "what the code does and why it is shaped that way" over restating docs; the existing docs under `website/docs-src`, `docs/`, `exoharness/docs/` are good inputs but READ THE CODE and check docs against it — call out where code and docs disagree or where docs describe not-yet-implemented things.
- Include, per page, 2–6 `idea` or `surprise` callouts that are genuinely non-obvious. No filler, no marketing, no "robust/powerful/seamless". No invented behavior: if you did not read it, don't claim it.
- Length: substantial but dense — typically 400–900 lines of HTML. Use tables for enumerations (variants, providers, env vars, endpoints).
- Valid HTML: escape `<`, `>`, `&` inside code/pre. Close tags. No external resources.
