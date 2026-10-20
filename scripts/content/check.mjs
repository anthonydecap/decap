/**
 * Validates every content file and lists the open [TO CHECK: …] items.
 *
 *   node scripts/content/check.mjs           # validate
 *   node scripts/content/check.mjs --write   # also write .content-build/*.json for the local
 *                                            # preview at /en/content-preview/<uid> (dev only)
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildDocument } from "./build-document.mjs";

const ROOT = join(import.meta.dirname, "..", "..", "content");

export async function loadContent() {
  const docs = [];
  for (const dir of ["pages", "projects"]) {
    for (const file of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(".mjs")).sort()) {
      const mod = await import(pathToFileURL(join(ROOT, dir, file)).href);
      docs.push({ file: `${dir}/${file}`, content: mod.default });
    }
  }
  return docs;
}

if (process.argv[1] === import.meta.filename) {
  let failed = 0;
  const todos = [];
  const write = process.argv.includes("--write");
  const out = join(ROOT, "..", ".content-build");
  if (write) mkdirSync(out, { recursive: true });
  for (const { file, content } of await loadContent()) {
    try {
      const doc = buildDocument(content);
      if (write) writeFileSync(join(out, `${doc.uid}.json`), JSON.stringify(doc));
      const json = JSON.stringify(content);
      for (const m of json.matchAll(/\[TO CHECK:([^\]]*)\]/g)) todos.push(`${file}: ${m[1].trim()}`);
      const meta = content.meta_title?.length ?? 0;
      const desc = content.meta_description?.length ?? 0;
      const warn = [meta > 60 && `meta_title ${meta} chars`, (desc < 120 || desc > 165) && `meta_description ${desc} chars`].filter(Boolean);
      console.log(`ok   ${file} (${doc.data.slices.length} slices)${warn.length ? "  ⚠ " + warn.join(", ") : ""}`);
    } catch (e) {
      failed++;
      console.log(`FAIL ${file}: ${e.message}`);
    }
  }
  console.log(`\n${todos.length} open [TO CHECK] items:`);
  for (const t of todos) console.log(`  - ${t}`);
  if (failed) process.exit(1);
}
