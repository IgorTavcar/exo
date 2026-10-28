#!/usr/bin/env node
// Regenerates assets/search-index.js from the HTML pages. Run: node wiki/build-search.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const strip = (s) =>
  s.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();

const entries = [];
for (const file of readdirSync(root).filter((f) => f.endsWith(".html") && !f.startsWith("_")).sort()) {
  const html = readFileSync(join(root, file), "utf8");
  const page = strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, file])[1]);
  const body = (html.match(/<main>([\s\S]*)<\/main>/) || [, html])[1];
  // split on h2/h3 so a hit lands on the right section
  const parts = body.split(/(?=<h[23][ >])/);
  for (const part of parts) {
    const m = part.match(/^<h[23][^>]*?(?:id="([^"]+)")?[^>]*>([\s\S]*?)<\/h[23]>/);
    const title = m ? strip(m[2]) : page;
    let id = m && m[1];
    if (m && !id) id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const text = strip(part).slice(0, 4000);
    if (text.length < 20) continue;
    entries.push({ t: title === page ? page : `${title}`, p: page, u: file + (id ? "#" + id : ""), x: text });
  }
}
writeFileSync(join(root, "assets", "search-index.js"), "window.WIKI_INDEX = " + JSON.stringify(entries) + ";\n");
console.log(`indexed ${entries.length} sections from ${new Set(entries.map((e) => e.p)).size} pages`);
