/**
 * Turns a content file (content/pages/*.mjs) into Prismic document data, validated against the
 * local slice models and custom types. Throws on unknown fields, unknown slices and invalid
 * select values, so mistakes surface before anything reaches Prismic.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { markdownToRichText } from "./markdown-to-rich-text.mjs";

const ROOT = join(import.meta.dirname, "..", "..");

function loadSliceModels() {
  const dir = join(ROOT, "src", "slices");
  const models = {};
  for (const folder of readdirSync(dir)) {
    const file = join(dir, folder, "model.json");
    if (!existsSync(file)) continue;
    const m = JSON.parse(readFileSync(file, "utf8"));
    models[m.id] = m;
  }
  return models;
}

const SLICES = loadSliceModels();
const TYPES = Object.fromEntries(
  ["page", "project"].map((t) => [t, JSON.parse(readFileSync(join(ROOT, "customtypes", t, "index.json"), "utf8"))]),
);

/** Blocks a rich text field does not allow (e.g. a list in a card text) become paragraphs. */
function fitToAllowedBlocks(blocks, multi, where) {
  if (!multi) return blocks;
  const allowed = new Set(multi.split(","));
  return blocks.map((b) => {
    if (allowed.has(b.type)) return b;
    console.warn(`  ⚠ ${where}: ${b.type} not allowed here, written as a paragraph`);
    if (b.type === "list-item" || b.type === "o-list-item") {
      const shift = 2;
      return { type: "paragraph", text: `– ${b.text}`, spans: b.spans.map((s) => ({ ...s, start: s.start + shift, end: s.end + shift })) };
    }
    return { ...b, type: "paragraph" };
  });
}

function convertField(def, value, where) {
  if (value === undefined || value === null) return undefined;
  switch (def.type) {
    case "StructuredText":
      if (Array.isArray(value)) return value;
      if (def.config.single) {
        // Single-block fields (e.g. the page title, heading1): one block of the first allowed type.
        return [{ type: def.config.single.split(",")[0], text: String(value), spans: [] }];
      }
      return fitToAllowedBlocks(markdownToRichText(value), def.config.multi, where);
    case "Link":
      if (typeof value !== "string") return value;
      return { link_type: "Web", url: value };
    case "Embed":
      return typeof value === "string" ? { embed_url: value } : value;
    case "Select":
      if (!def.config.options.includes(value)) throw new Error(`${where}: "${value}" is not one of ${def.config.options.join(", ")}`);
      return value;
    case "Image":
      // Images are added in Prismic by the editor; content files leave them empty.
      return undefined;
    case "Text":
    case "Boolean":
    case "Number":
    case "Color":
      return value;
    default:
      throw new Error(`${where}: unsupported field type ${def.type}`);
  }
}

function convertGroup(defs, values = {}, where) {
  const out = {};
  for (const [key, value] of Object.entries(values)) {
    const def = defs[key];
    if (!def) throw new Error(`${where}: unknown field "${key}" (known: ${Object.keys(defs).join(", ")})`);
    const v = convertField(def, value, `${where}.${key}`);
    if (v !== undefined) out[key] = v;
  }
  return out;
}

export function buildSlice(slice, where) {
  const model = SLICES[slice.type];
  if (!model) throw new Error(`${where}: unknown slice "${slice.type}"`);
  const variation = model.variations.find((v) => v.id === (slice.variation ?? "default"));
  return {
    // `copyItemsFrom: { type, uid }` keeps the items (with their images) of the same slice on an
    // existing published document; migrate.mjs puts them before this slice's own items.
    ...(slice.copyItemsFrom ? { __copyItemsFrom: slice.copyItemsFrom } : {}),
    slice_type: slice.type,
    slice_label: null,
    variation: variation.id,
    version: "initial",
    primary: convertGroup(variation.primary ?? {}, slice.primary, `${where}.${slice.type}.primary`),
    items: (slice.items ?? []).map((item, i) => convertGroup(variation.items ?? {}, item, `${where}.${slice.type}.items[${i}]`)),
  };
}

/** Content file → { type, uid, lang, title, data }. */
export function buildDocument(content) {
  const type = TYPES[content.type ?? "page"];
  if (!type) throw new Error(`${content.uid}: unknown type ${content.type}`);
  const fields = Object.assign({}, ...Object.values(type.json));
  const where = `${content.type ?? "page"}/${content.uid}`;

  const data = convertGroup(
    fields,
    {
      title: content.title,
      theme: content.theme ?? "decap",
      meta_title: content.meta_title,
      meta_description: content.meta_description,
      ...content.fields,
    },
    where,
  );
  data.slices = (content.slices ?? []).map((s, i) => buildSlice(s, `${where}.slices[${i}]`));

  for (const s of data.slices) {
    if (!(s.slice_type in fields.slices.config.choices)) throw new Error(`${where}: slice ${s.slice_type} is not allowed on ${content.type}`);
  }
  return { type: content.type ?? "page", uid: content.uid, lang: content.lang ?? "en-us", title: content.title, data };
}

/**
 * Cleans an existing Prismic document before it is sent back through the Migration API: drops
 * fields that no longer exist in the models and select values that are empty or not an option
 * (older documents can contain both; the API rejects them).
 */
export function sanitizeExisting(doc) {
  const type = TYPES[doc.type];
  const clean = (defs, values, where) => {
    for (const [key, value] of Object.entries(values ?? {})) {
      const def = defs[key];
      if (!def) {
        delete values[key];
        continue;
      }
      if (def.type === "Select" && value !== null && !def.config.options.includes(value)) {
        console.log(`  clearing invalid select ${where}.${key} (${JSON.stringify(value)})`);
        delete values[key];
      }
    }
  };
  if (type) {
    const fields = Object.assign({}, ...Object.values(type.json));
    clean(fields, doc.data, doc.uid);
  }
  for (const slice of doc.data.slices ?? []) {
    const model = SLICES[slice.slice_type];
    const variation = model?.variations.find((v) => v.id === slice.variation);
    if (!variation) continue;
    clean(variation.primary ?? {}, slice.primary, `${doc.uid}.${slice.slice_type}`);
    for (const item of slice.items ?? []) clean(variation.items ?? {}, item, `${doc.uid}.${slice.slice_type}[]`);
  }
}
