/**
 * Writes content/TO-CHECK.md: every open [TO CHECK: …] in the content files, by page.
 *
 *   node scripts/content/todo.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadContent } from "./check.mjs";

let out =
  "# Open items before launch\n\nEvery `[TO CHECK: …]` in the content files, by page. Answer them in Prismic (or tell Claude and the content files are updated), then remove the marker.\nRegenerate this list: `node scripts/content/todo.mjs`.\n";
let count = 0;
for (const { content } of await loadContent()) {
  const items = [...new Set([...JSON.stringify(content).matchAll(/\[TO CHECK:([^\]]*)\]/g)].map((m) => m[1].trim()))];
  if (!items.length) continue;
  count += items.length;
  const url = content.type === "project" ? `/work/${content.uid}` : content.uid === "home" ? "/" : `/${content.uid}`;
  out += `\n## ${content.title} (${url})\n\n${items.map((i) => `- [ ] ${i}`).join("\n")}\n`;
}
writeFileSync(join(import.meta.dirname, "..", "..", "content", "TO-CHECK.md"), out);
console.log(`${count} open items → content/TO-CHECK.md`);
