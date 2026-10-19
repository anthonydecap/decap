import { describe, expect, it } from "vitest";
import { buildDryRun, csvTemplate, parseImportCsv, type CatalogSnapshot } from "@/modules/shop/domain/import-plan";

const catalog = (over: Partial<CatalogSnapshot> = {}): CatalogSnapshot => ({
  existingSkus: new Map([["dmi-0100", "arr-existing"]]),
  arrangers: new Map([["ines varela", "arranger-1"]]),
  works: new Map(),
  genres: new Set(["classical"]),
  profileCodes: new Set(["GENERIC"]),
  knownChecksums: new Map([["b".repeat(64), "DMI-0100 SOURCE_MIDI v1"]]),
  ...over,
});

const CSV = `sku,title,workTitle,originalArtist,arranger,price,currency,genre,compatibility,sourceMidiFilename,previewAudioFilename,coverFilename
DMI-0001,Gymnopédie No. 1,Gymnopédie No. 1,Erik Satie,Ines Varela,12.90,EUR,Classical;Impressionist,GENERIC,DMI-0001.mid,DMI-0001_preview.mp3,DMI-0001.jpg
DMI-0100,,,,,,,,,DMI-0100-v2.mid,,
DMI-0002,Missing price,Work,Artist,New Person,,EUR,,,,,
DMI-0001,Duplicate,W,A,Ines Varela,1,EUR,,,,,
`;

describe("CSV parsing", () => {
  it("parses the template", () => {
    const { rows, errors } = parseImportCsv(csvTemplate());
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ sku: "DMI-0001", priceCents: 1490, genres: ["Classical", "Romantic"], compatibility: ["GENERIC"] });
  });

  it("normalises headers and flags duplicates / bad values", () => {
    const { rows } = parseImportCsv(CSV);
    expect(rows).toHaveLength(4);
    expect(rows[0]!.files).toEqual({ SOURCE_MIDI: "DMI-0001.mid", PREVIEW_AUDIO: "DMI-0001_preview.mp3", COVER_IMAGE: "DMI-0001.jpg" });
    expect(rows[3]!.errors.map((e) => e.code)).toContain("SKU_DUPLICATE_IN_CSV");
  });

  it("rejects a CSV without a sku column", () => {
    expect(parseImportCsv("title\nX\n").errors.map((e) => e.code)).toContain("CSV_MISSING_SKU_COLUMN");
  });
});

describe("dry run", () => {
  const files = [
    { clientId: "1", filename: "DMI-0001.mid", bytes: 2000, sha256: "a".repeat(64) },
    { clientId: "2", filename: "DMI-0001_preview.mp3", bytes: 300_000 },
    { clientId: "3", filename: "DMI-0100-v2.mid", bytes: 1500, sha256: "b".repeat(64) },
    { clientId: "4", filename: "DMI-0100_cover.png", bytes: 50_000 },
    { clientId: "5", filename: "random-notes.txt", bytes: 10 },
    { clientId: "6", filename: "copy-of-0001.mid", bytes: 2000, sha256: "a".repeat(64) },
    { clientId: "7", filename: "DMI-0001.exe.mid", bytes: 0 },
  ];

  it("maps files by CSV reference and by SKU prefix, and builds a reviewable summary", () => {
    const { rows } = parseImportCsv(CSV);
    const plan = buildDryRun({ rows, files, catalog: catalog() });
    const byId = new Map(plan.items.map((i) => [i.clientId, i]));

    expect(byId.get("1")).toMatchObject({ sku: "DMI-0001", kind: "SOURCE_MIDI", status: "QUEUED" });
    expect(byId.get("2")).toMatchObject({ sku: "DMI-0001", kind: "PREVIEW_AUDIO", status: "QUEUED" });
    expect(byId.get("3")).toMatchObject({ sku: "DMI-0100", kind: "SOURCE_MIDI" });
    expect(byId.get("3")!.warnings.map((w) => w.code)).toContain("DUPLICATE_OF_EXISTING");
    expect(byId.get("4")).toMatchObject({ sku: "DMI-0100", kind: "COVER_IMAGE" }); // prefix match, case-insensitive
    expect(byId.get("5")).toMatchObject({ sku: null, kind: null, status: "NEEDS_REVIEW" });
    expect(byId.get("6")!.warnings.map((w) => w.code)).toContain("DUPLICATE_CHECKSUM");
    expect(byId.get("7")).toMatchObject({ status: "FAILED" });

    const actions = plan.rows.map((r) => r.action);
    expect(actions).toEqual(["CREATE_DRAFT", "ATTACH_TO_EXISTING", "INVALID", "INVALID"]);
    expect(plan.rows[0]!.newGenres).toEqual(["Impressionist"]);
    expect(plan.rows[0]!.missingFiles).toEqual(["DMI-0001.jpg"]);

    expect(plan.summary).toMatchObject({
      rows: 4, newDrafts: 1, matchedExisting: 1, invalidRows: 2, files: 7, filesRejected: 1, missingReferencedFiles: 1,
    });
  });

  it("flags ambiguous references when two selected files share a referenced name", () => {
    const { rows } = parseImportCsv(CSV);
    const plan = buildDryRun({
      rows,
      files: [
        { clientId: "a", filename: "DMI-0001.mid", relativePath: "x/DMI-0001.mid", bytes: 10 },
        { clientId: "b", filename: "DMI-0001.mid", relativePath: "y/DMI-0001.mid", bytes: 10 },
      ],
      catalog: catalog(),
    });
    expect(plan.items.every((i) => i.status === "NEEDS_REVIEW")).toBe(true);
    expect(plan.items[0]!.errors.map((e) => e.code)).toContain("AMBIGUOUS_FILE");
  });
});
