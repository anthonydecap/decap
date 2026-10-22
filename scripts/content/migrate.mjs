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
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as prismic from "@prismicio/client";
import { buildDocument, sanitizeExisting } from "./build-document.mjs";
import { loadContent } from "./check.mjs";
import { SETTINGS_LANGS, localizedSettingsData, siteUpdates } from "./site-updates.mjs";
import imageMap from "../../content/images.mjs";

const repo = process.env.PRISMIC_REPOSITORY ?? "decap";
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const updatesOnly = args.includes("--updates-only");
/** Skip the translated menus/footers (e.g. when a translated settings draft already exists in Prismic). */
const noSettings = args.includes("--no-settings");
const only = args.filter((a) => !a.startsWith("--"));
if (!writeToken && !dry) throw new Error("PRISMIC_WRITE_TOKEN is missing (put it in .env.local)");

/**
 * IDs of documents this script created. Drafts in the Migration release are invisible to the
 * Content API, so without these a second run would create them again; with them it updates.
 */
const ID_FILE = join(import.meta.dirname, "..", "..", "content", "prismic-ids.json");
const ids = existsSync(ID_FILE) ? JSON.parse(readFileSync(ID_FILE, "utf8")) : {};
const key = (type, uid, lang) => `${type}/${uid}/${lang}`;

const read = prismic.createClient(repo);
/** Languages enabled in the Prismic repository (Settings → Translations & locales). */
const repoLangs = new Set((await read.getRepository()).languages.map((l) => l.id));
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
/** Languages that have translated content files: only those get translated settings. */
const translationLangs = new Set();

/** Resolves `copyItemsFrom`: existing items (e.g. artist portraits) go first. */
function resolveCopiedItems(doc) {
  for (const slice of doc.data.slices) {
    const from = slice.__copyItemsFrom;
    delete slice.__copyItemsFrom;
    if (!from) continue;
    // Artist portraits are the same in every language: copy from the English page by default.
    const source = find(from.type, from.uid, from.lang ?? "en-us");
    const existingSlice = source?.data.slices?.find((s) => s.slice_type === slice.slice_type);
    if (!existingSlice) {
      console.log(`  ⚠ ${doc.uid}: no ${slice.slice_type} on ${from.type}/${from.uid} to copy items from`);
      continue;
    }
    const names = new Set(existingSlice.items.map((i) => JSON.stringify(Object.values(i).filter((v) => typeof v === "string"))));
    const own = slice.items.filter((i) => !names.has(JSON.stringify(Object.values(i).filter((v) => typeof v === "string"))));
    slice.items = [...structuredClone(existingSlice.items), ...own];
  }
}

/**
 * Fills image slots from content/images.mjs: `{ url, alt }` uploads the file to Prismic (each URL
 * once), `{ artist, alt }` reuses that artist's portrait from the home page's artist slider.
 */
/** Existing media library assets by filename, so an image is uploaded only once across runs. */
async function loadExistingAssets() {
  const byName = new Map();
  if (!writeToken) return byName;
  let cursor = "";
  do {
    const res = await fetch(`https://asset-api.prismic.io/assets?limit=100${cursor ? `&cursor=${cursor}` : ""}`, {
      headers: { authorization: `Bearer ${writeToken}`, repository: repo },
    });
    if (!res.ok) break;
    const page = await res.json();
    // Duplicates (same filename): always use the oldest copy, so every run picks the same one.
    for (const a of page.items ?? []) {
      const known = byName.get(a.filename);
      if (!known || a.created_at < known.created_at) byName.set(a.filename, a);
    }
    cursor = page.items?.length ? page.cursor : "";
  } while (cursor);
  return byName;
}
const existingAssets = await loadExistingAssets();
const assetField = (a, alt) => ({
  id: a.id,
  url: a.url,
  alt: alt ?? a.alt ?? null,
  copyright: a.credits ?? null,
  dimensions: { width: a.width, height: a.height },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
});

const localUploads = new Map();

const homeArtists = find("page", "home", "en-us")?.data.slices?.find((s) => s.slice_type === "home_artists")?.items ?? [];
function applyImages(doc) {
  for (const [slot, img] of Object.entries(imageMap[doc.uid] ?? {})) {
    const [si, ii] = slot.split(".").map(Number);
    const slice = doc.data.slices[si];
    const target = ii === undefined ? slice?.primary : slice?.items?.[ii];
    if (!target) {
      // A translation that is not yet in step with the English structure: skip, don't fail.
      if (doc.lang !== "en-us") continue;
      throw new Error(`content/images.mjs: ${doc.uid} slot ${slot} does not exist`);
    }
    if (img.artist) {
      const portrait = homeArtists.find((a) => a.artist_name === img.artist)?.artist_portrait;
      if (portrait?.url) target.image = { ...portrait, alt: img.alt };
      else console.log(`  ⚠ ${doc.uid} ${slot}: no portrait for ${img.artist}`);
    } else if (img.file) {
      // A local photo (content/media, not committed): uploaded once, then reused by filename.
      const filename = img.file.split("/").pop();
      const existing = existingAssets.get(filename);
      if (existing) target.image = assetField(existing, img.alt);
      else if (existsSync(join(import.meta.dirname, "..", "..", img.file))) {
        // One upload per file per run, however often the photo is used.
        if (!localUploads.has(filename)) {
          const blob = new Blob([readFileSync(join(import.meta.dirname, "..", "..", img.file))], { type: "image/jpeg" });
          localUploads.set(filename, migration.createAsset(blob, filename, { alt: img.alt }));
        }
        target.image = localUploads.get(filename);
      }
      else console.log(`  ⚠ ${doc.uid} ${slot}: ${img.file} not found and not in Prismic yet`);
    } else {
      const filename = decodeURIComponent(img.url.split("/").pop());
      const existing = existingAssets.get(filename);
      target.image = existing ? assetField(existing, img.alt) : migration.createAsset(img.url, filename, { alt: img.alt });
    }
  }
}

for (const { content } of await loadContent()) {
  if (only.length && !only.includes(content.uid)) continue;
  const doc = buildDocument(content);
  if (!repoLangs.has(doc.lang)) {
    plan.push(`skip   ${doc.type}/${doc.uid} [${doc.lang}]: add this language in Prismic first`);
    continue;
  }
  if (doc.lang !== "en-us") translationLangs.add(doc.lang);
  resolveCopiedItems(doc);
  applyImages(doc);
  const current = find(doc.type, doc.uid, doc.lang);
  if (current) {
    current.data = doc.data;
    dropForeignImages(current.data);
    migration.updateDocument(current, doc.title);
    plan.push(`update ${doc.type}/${doc.uid}${doc.lang !== "en-us" ? ` [${doc.lang}]` : ""}`);
  } else if (ids[key(doc.type, doc.uid, doc.lang)]) {
    // Created by an earlier run and still a draft: update that draft.
    migration.updateDocument({ id: ids[key(doc.type, doc.uid, doc.lang)], type: doc.type, uid: doc.uid, lang: doc.lang, data: doc.data }, doc.title);
    plan.push(`update ${doc.type}/${doc.uid} (draft)`);
  } else if (updatesOnly) {
    plan.push(`skip   ${doc.type}/${doc.uid}: new page (--updates-only)`);
  } else if (doc.lang !== "en-us" && !find(doc.type, doc.uid, "en-us")) {
    plan.push(`skip   ${doc.type}/${doc.uid} [${doc.lang}]: publish the English page first`);
  } else {
    // A translation is linked to its English page, so the language switcher and hreflang find it.
    const master = doc.lang !== "en-us" ? find(doc.type, doc.uid, "en-us") : undefined;
    migration.createDocument({ type: doc.type, uid: doc.uid, lang: doc.lang, data: doc.data }, doc.title, master ? { masterLanguageDocument: master } : undefined);
    plan.push(`create ${doc.type}/${doc.uid}${master ? ` [${doc.lang}]` : ""}`);
  }
}

if (!only.length) {
  for (const update of siteUpdates) {
    const current = find(update.type, update.uid, update.lang ?? "en-us");
    if (!current) {
      plan.push(`skip   ${update.type}/${update.uid ?? "(single)"}: not found`);
      continue;
    }
    const before = JSON.stringify(current.data) + current.uid;
    update.apply(current);
    if (JSON.stringify(current.data) + current.uid === before) {
      plan.push(`skip   ${update.type}/${current.uid ?? "(single)"}: no change`);
      continue;
    }
    sanitizeExisting(current);
    dropForeignImages(current.data);
    migration.updateDocument(current, update.title);
    plan.push(`update ${update.type}/${current.uid ?? "(single)"}: ${update.description}`);
  }
}

// Menu and footer per language: update the translated settings, or create them linked to English.
if (!only.length && !noSettings) {
  const enSettings = existing.find((d) => d.type === "settings" && d.lang === "en-us");
  for (const lang of SETTINGS_LANGS) {
    if (!translationLangs.has(lang)) continue;
    const current = existing.find((d) => d.type === "settings" && d.lang === lang);
    if (current) {
      current.data = localizedSettingsData(lang);
      migration.updateDocument(current, `Settings (${lang})`);
      plan.push(`update settings [${lang}]`);
    } else if (enSettings && !updatesOnly) {
      migration.createDocument({ type: "settings", lang, data: localizedSettingsData(lang) }, `Settings (${lang})`, { masterLanguageDocument: enSettings });
      plan.push(`create settings [${lang}]`);
    }
  }
}

console.log(plan.join("\n"));
if (dry) {
  console.log("\nDry run: nothing sent.");
} else {
  const write = prismic.createWriteClient(repo, { writeToken });
  // Save IDs of created drafts even when a later step fails, so a re-run updates them.
  const saveIds = () => {
    for (const { document } of migration._documents) {
      if (document.id && document.uid) ids[key(document.type, document.uid, document.lang)] = document.id;
    }
    writeFileSync(ID_FILE, JSON.stringify(ids, null, 2) + "\n");
  };
  process.on("exit", saveIds);
  await write.migrate(migration, {
    reporter: (event) => {
      if (event.type === "documents:created" || event.type === "documents:updated" || event.type === "end") {
        console.log(event.type, JSON.stringify(event.data?.migration ?? event.data ?? {}).slice(0, 200));
      }
    },
  });
  console.log("\nDone. Review the drafts in Prismic → Releases → Migration release, then publish.");
}
