/**
 * Sends the content files to Prismic as a Migration Release: drafts you review and publish in
 * Prismic (Releases → Migration release). Nothing is published by this script.
 *
 *   node --env-file=.env.local scripts/content/migrate.mjs            # all content files
 *   node --env-file=.env.local scripts/content/migrate.mjs home about # only these uids
 *   node --env-file=.env.local scripts/content/migrate.mjs --dry      # validate and show the plan
 *   node --env-file=.env.local scripts/content/migrate.mjs --updates-only
 *       # only update published documents. Use this while earlier new pages are still unpublished
 *       # drafts in the Migration release: the script cannot see drafts and would create them twice.
 *
 * Existing documents (same type, uid, language) are updated; their images in slices that are
 * replaced are not kept, so images added in Prismic after a migration must be re-added if you
 * re-run it for that page. Also applies the site-wide changes in ./site-updates.mjs.
 */
import * as prismic from "@prismicio/client";
import { buildDocument, sanitizeExisting } from "./build-document.mjs";
import { loadContent } from "./check.mjs";
import { siteUpdates } from "./site-updates.mjs";

const repo = process.env.PRISMIC_REPOSITORY ?? "decap";
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const updatesOnly = args.includes("--updates-only");
const only = args.filter((a) => !a.startsWith("--"));
if (!writeToken && !dry) throw new Error("PRISMIC_WRITE_TOKEN is missing (put it in .env.local)");

const read = prismic.createClient(repo);
const existing = await read.dangerouslyGetAll({ lang: "*" });
const find = (type, uid, lang) => existing.find((d) => d.type === type && d.uid === uid && d.lang === lang);

/**
 * Existing documents can still reference Slice Machine demo images from another repository
 * (images.prismic.io/slicemachine-blank/…); the Migration API rejects those. Empty them.
 */
function dropForeignImages(node) {
  if (Array.isArray(node)) return node.forEach(dropForeignImages);
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object" && typeof value.url === "string" && value.dimensions) {
      const owner = value.url.match(/images\.prismic\.io\/([^/]+)\//)?.[1];
      if (owner && owner !== repo) {
        console.log(`  removing foreign demo image (${owner}) at ${key}`);
        node[key] = {};
      }
    } else dropForeignImages(value);
  }
}

const migration = prismic.createMigration();
const plan = [];

for (const { content } of await loadContent()) {
  if (only.length && !only.includes(content.uid)) continue;
  const doc = buildDocument(content);
  const current = find(doc.type, doc.uid, doc.lang);
  if (current) {
    current.data = doc.data;
    dropForeignImages(current.data);
    migration.updateDocument(current, doc.title);
    plan.push(`update ${doc.type}/${doc.uid}`);
  } else if (updatesOnly) {
    plan.push(`skip   ${doc.type}/${doc.uid}: new page (--updates-only)`);
  } else {
    migration.createDocument({ type: doc.type, uid: doc.uid, lang: doc.lang, data: doc.data }, doc.title);
    plan.push(`create ${doc.type}/${doc.uid}`);
  }
}

if (!only.length) {
  for (const update of siteUpdates) {
    const current = find(update.type, update.uid, update.lang ?? "en-us");
    if (!current) {
      plan.push(`skip   ${update.type}/${update.uid ?? "(single)"}: not found`);
      continue;
    }
    update.apply(current);
    sanitizeExisting(current);
    dropForeignImages(current.data);
    migration.updateDocument(current, update.title);
    plan.push(`update ${update.type}/${current.uid ?? "(single)"}: ${update.description}`);
  }
}

console.log(plan.join("\n"));
if (dry) {
  console.log("\nDry run: nothing sent.");
} else {
  const write = prismic.createWriteClient(repo, { writeToken });
  await write.migrate(migration, {
    reporter: (event) => {
      if (event.type === "documents:created" || event.type === "documents:updated" || event.type === "end") {
        console.log(event.type, JSON.stringify(event.data?.migration ?? event.data ?? {}).slice(0, 200));
      }
    },
  });
  console.log("\nDone. Review the drafts in Prismic → Releases → Migration release, then publish.");
}
