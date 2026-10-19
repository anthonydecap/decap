import { describe, expect, it } from "vitest";
import { guessKindFromFilename, sniffFileType, hexToBytes } from "@/modules/shop/domain/asset-policy";
import { MidiParseError, parseMidi } from "@/modules/shop/domain/midi";
import { generateObjectKey, isGeneratedKey } from "@/modules/shop/storage/keys";
import { signTicket, verifyTicket } from "@/modules/shop/storage/tickets";
import { sanitizeAuditMetadata } from "@/modules/shop/services/audit";
import { runBoundedQueue } from "@/modules/shop/ui/bounded-queue";
import { buildMidi } from "../helpers/midi";

describe("MIDI parser", () => {
  it("extracts technical metadata", () => {
    const m = parseMidi(buildMidi({ bpm: 100, withSysEx: true }));
    expect(m.format).toBe(1);
    expect(m.trackCount).toBe(2);
    expect(m.ppq).toBe(480);
    expect(m.tempos[0]!.bpm).toBe(100);
    expect(m.timeSignatures[0]).toMatchObject({ numerator: 3, denominator: 4 });
    expect(m.keySignatures[0]!.key).toBe("D minor");
    expect(m.hasSysEx).toBe(true);
    expect(m.channelsUsed).toEqual([1, 2]);
    expect(m.programsByChannel).toEqual({ "1": [0] });
    expect(m.noteCount).toBe(2);
    expect(m.markers).toEqual(["Intro"]);
    expect(m.trackNames).toEqual(["Song"]);
    expect(m.durationSeconds).toBe(1); // 960 ticks at 480 PPQ and 100 BPM = 1.2s
  });

  it("rejects truncated or hostile files without throwing anything else", () => {
    const good = buildMidi();
    expect(() => parseMidi(good.subarray(0, 20))).toThrow(MidiParseError);
    const lying = new Uint8Array(good);
    lying[18] = 0x7f; // absurd track length
    expect(() => parseMidi(lying)).toThrow(MidiParseError);
    expect(() => parseMidi(new Uint8Array([1, 2, 3, 4]))).toThrow(MidiParseError);
  });
});

describe("file signature sniffing", () => {
  const b = (...xs: number[]) => new Uint8Array(xs);
  const a = (s: string) => [...s].map((c) => c.charCodeAt(0));
  it("recognises real formats from bytes, not names", () => {
    expect(sniffFileType(b(...a("MThd"), 0, 0, 0, 6))?.family).toBe("midi");
    expect(sniffFileType(b(...a("RIFF"), 0, 0, 0, 0, ...a("WAVE")))?.mime).toBe("audio/wav");
    expect(sniffFileType(b(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe("image/jpeg");
    expect(sniffFileType(b(...a("%PDF-1.7")))?.family).toBe("pdf");
    expect(sniffFileType(b(0x4d, 0x5a, 0x90, 0x00))).toBeNull(); // an .exe renamed to .mid
  });
  it("only recognises DMI with a configured signature", () => {
    const magic = hexToBytes("44 4d 49 01")!;
    expect(sniffFileType(b(0x44, 0x4d, 0x49, 0x01, 9), magic)?.family).toBe("dmi");
    expect(sniffFileType(b(0x44, 0x4d, 0x49, 0x01, 9), null)).toBeNull();
  });
  it("guesses import kinds from names", () => {
    expect(guessKindFromFilename("DMI-0001.mid")).toBe("SOURCE_MIDI");
    expect(guessKindFromFilename("DMI-0001_preview.mp3")).toBe("PREVIEW_AUDIO");
    expect(guessKindFromFilename("DMI-0001.mp3")).toBe("SOURCE_AUDIO");
    expect(guessKindFromFilename("cover.jpg")).toBe("COVER_IMAGE");
    expect(guessKindFromFilename("notes.txt")).toBeNull();
  });
});

describe("storage keys and upload tickets", () => {
  it("generates random keys without user data", () => {
    const k = generateObjectKey("MASTERS", "source-midi", "mid");
    expect(isGeneratedKey(k)).toBe(true);
    expect(k).toMatch(/^masters\/source-midi\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.mid$/);
    expect(isGeneratedKey("masters/../../etc/passwd")).toBe(false);
  });

  it("tickets are signed, scoped and expire", () => {
    const t = { v: 1 as const, store: "MASTERS" as const, key: "masters/x/2026/10/abc", contentType: "audio/midi", maxBytes: 10, exp: Date.now() + 60_000, staffId: "s", purpose: "p" };
    const token = signTicket(t, "secret");
    expect(verifyTicket(token, "secret")).toMatchObject({ key: t.key, store: "MASTERS" });
    expect(verifyTicket(token, "other-secret")).toBeNull();
    const [body, sig] = token.split(".");
    const tampered = Buffer.from(JSON.stringify({ ...t, key: "masters/other" })).toString("base64url");
    expect(verifyTicket(`${tampered}.${sig}`, "secret")).toBeNull();
    expect(body).toBeTruthy();
    expect(verifyTicket(signTicket({ ...t, exp: Date.now() - 1 }, "secret"), "secret")).toBeNull();
  });

  it("audit metadata never stores secrets or URLs", () => {
    const out = sanitizeAuditMetadata({ token: "t", presignedUrl: "https://x", nested: { clientSecret: "cs" }, ok: 1 }) as Record<string, unknown>;
    expect(out).toEqual({ token: "[redacted]", presignedUrl: "[redacted]", nested: { clientSecret: "[redacted]" }, ok: 1 });
  });
});

describe("bounded upload queue", () => {
  it("never exceeds the concurrency limit and isolates failures", async () => {
    let running = 0;
    let peak = 0;
    const items = Array.from({ length: 40 }, (_, i) => i);
    const results = await runBoundedQueue(items, 5, async (i) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 2));
      running--;
      if (i % 7 === 0) throw new Error(`fail ${i}`);
    });
    expect(peak).toBeLessThanOrEqual(5);
    expect(results).toHaveLength(40);
    expect(results.filter((r) => !r.ok).map((r) => r.item)).toEqual([0, 7, 14, 21, 28, 35]);
    expect(results.filter((r) => r.ok)).toHaveLength(34);
  });
});
