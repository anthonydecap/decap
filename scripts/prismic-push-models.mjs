/**
 * Pushes local slice models and custom types to the Prismic repository (Custom Types API).
 * Additive and idempotent: inserts what is missing, updates what exists. Nothing is deleted.
 *
 *   node --env-file=.env.local scripts/prismic-push-models.mjs [slice folders or type ids…]
 *
 * Without arguments it pushes the Site slices, the page/project/settings types.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const token = process.env.PRISMIC_WRITE_TOKEN;
const repo = process.env.PRISMIC_REPOSITORY ?? "decap";
if (!token) throw new Error("PRISMIC_WRITE_TOKEN is missing (put it in .env.local)");

const api = (path, init = {}) =>
  fetch(`https://customtypes.prismic.io${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, repository: repo, "content-type": "application/json", ...init.headers },
  });

const DEFAULT_SLICES = [
  "siteHero", "siteTextMedia", "siteCardGrid", "siteSteps", "siteTimeline", "siteFacts", "siteQuote",
  "siteFaq", "siteCta", "siteDownloads", "siteSound", "siteVideo", "siteTiles", "contactForm", "organComposer",
];
const DEFAULT_TYPES = ["page", "project", "settings"];

const args = process.argv.slice(2);
const slices = args.length ? args.filter((a) => existsSync(join("src/slices", a, "model.json"))) : DEFAULT_SLICES;
const types = args.length ? args.filter((a) => existsSync(join("customtypes", a, "index.json"))) : DEFAULT_TYPES;

async function upsert(kind, body) {
  const exists = (await api(`/${kind}/${body.id}`)).ok;
  const res = await api(`/${kind}/${exists ? "update" : "insert"}`, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${kind} ${body.id}: ${res.status} ${await res.text()}`);
  console.log(`${exists ? "updated" : "inserted"} ${kind.slice(0, -1)} ${body.id}`);
}

// Slices first: custom types reference them.
for (const s of slices) await upsert("slices", JSON.parse(readFileSync(join("src/slices", s, "model.json"), "utf8")));
for (const t of types) await upsert("customtypes", JSON.parse(readFileSync(join("customtypes", t, "index.json"), "utf8")));
