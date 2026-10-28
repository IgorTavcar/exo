# Exo internals wiki

A static implementation wiki for this repo. Open `index.html` in a browser, or serve the folder (`python3 -m http.server -d wiki`).

- Pages are hand-written HTML; shared nav, TOC, theme, GitHub source links and syntax highlighting come from `assets/wiki.js` and `assets/style.css`.
- Source references (`<span class="src">path:line</span>`) link to a pinned commit; the SHA is the `SHA` constant in `assets/wiki.js`. When updating pages against a newer commit, re-verify line numbers and bump it.
- Search index: `node wiki/build-search.mjs` regenerates `assets/search-index.js` after any page edit.
- Authoring conventions and available components: `AUTHORING.md`; skeleton: `template.html`.
- `wiki/**` is excluded from oxfmt and oxlint (see `.oxfmtrc.json`, `.oxlintrc.json`).
