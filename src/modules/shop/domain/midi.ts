/**
 * Defensive Standard MIDI File (SMF) parser for metadata extraction.
 *
 * It never trusts lengths in the file: every read is bounds-checked, running status is
 * handled, and hard limits on tracks / events protect against crafted files. It only extracts
 * descriptive metadata — no playback.
 */

export type MidiMetadata = {
  format: 0 | 1 | 2;
  trackCount: number;
  ppq: number | null;
  smpteTiming: { framesPerSecond: number; ticksPerFrame: number } | null;
  tempos: Array<{ tick: number; bpm: number }>;
  timeSignatures: Array<{ tick: number; numerator: number; denominator: number }>;
  keySignatures: Array<{ tick: number; key: string }>;
  hasSysEx: boolean;
  channelsUsed: number[];
  programsByChannel: Record<string, number[]>;
  noteCount: number;
  durationTicks: number;
  durationSeconds: number | null;
  markers: string[];
  lyricsCount: number;
  trackNames: string[];
  copyrightNotices: string[];
};

export class MidiParseError extends Error {}

const MAX_TRACKS = 1024;
const MAX_EVENTS = 5_000_000;
const MAX_TEXT_ITEMS = 500;
const MAJOR_KEYS = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
const MINOR_KEYS = ["Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#"];

class Reader {
  pos = 0;
  constructor(private readonly buf: Uint8Array, private readonly end = buf.length) {}
  remaining() { return this.end - this.pos; }
  need(n: number) { if (n < 0 || this.pos + n > this.end) throw new MidiParseError("Unexpected end of data"); }
  u8() { this.need(1); return this.buf[this.pos++]!; }
  u16() { this.need(2); const v = (this.buf[this.pos]! << 8) | this.buf[this.pos + 1]!; this.pos += 2; return v; }
  u32() { this.need(4); const b = this.buf; const v = ((b[this.pos]! << 24) >>> 0) + (b[this.pos + 1]! << 16) + (b[this.pos + 2]! << 8) + b[this.pos + 3]!; this.pos += 4; return v; }
  ascii(n: number) { this.need(n); let s = ""; for (let i = 0; i < n; i++) s += String.fromCharCode(this.buf[this.pos + i]!); this.pos += n; return s; }
  bytes(n: number) { this.need(n); const out = this.buf.subarray(this.pos, this.pos + n); this.pos += n; return out; }
  skip(n: number) { this.need(n); this.pos += n; }
  vlq() {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      const b = this.u8();
      value = (value << 7) | (b & 0x7f);
      if ((b & 0x80) === 0) return value;
    }
    throw new MidiParseError("Variable-length quantity too long");
  }
}

function decodeText(bytes: Uint8Array): string {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  // Strip control characters; cap length so metadata stays small.
  return text.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 200);
}

export function isStandardMidi(head: Uint8Array): boolean {
  return head.length >= 4 && head[0] === 0x4d && head[1] === 0x54 && head[2] === 0x68 && head[3] === 0x64; // "MThd"
}

export function parseMidi(data: Uint8Array): MidiMetadata {
  const r = new Reader(data);
  if (r.ascii(4) !== "MThd") throw new MidiParseError("Missing MThd header");
  const headerLength = r.u32();
  if (headerLength < 6) throw new MidiParseError("Header chunk too short");
  const format = r.u16();
  if (format > 2) throw new MidiParseError(`Unsupported MIDI format ${format}`);
  const declaredTracks = r.u16();
  if (declaredTracks > MAX_TRACKS) throw new MidiParseError("Too many tracks");
  const division = r.u16();
  r.skip(headerLength - 6);

  let ppq: number | null = null;
  let smpteTiming: MidiMetadata["smpteTiming"] = null;
  if (division & 0x8000) {
    const fps = 256 - ((division >> 8) & 0xff);
    smpteTiming = { framesPerSecond: fps, ticksPerFrame: division & 0xff };
  } else {
    ppq = division;
    if (ppq === 0) throw new MidiParseError("Division (PPQ) is zero");
  }

  const meta: MidiMetadata = {
    format: format as 0 | 1 | 2,
    trackCount: 0,
    ppq,
    smpteTiming,
    tempos: [],
    timeSignatures: [],
    keySignatures: [],
    hasSysEx: false,
    channelsUsed: [],
    programsByChannel: {},
    noteCount: 0,
    durationTicks: 0,
    durationSeconds: null,
    markers: [],
    lyricsCount: 0,
    trackNames: [],
    copyrightNotices: [],
  };
  const channels = new Set<number>();
  const programs = new Map<number, Set<number>>();
  let events = 0;

  while (r.remaining() >= 8 && meta.trackCount < declaredTracks) {
    const id = r.ascii(4);
    const length = r.u32();
    if (length > r.remaining()) throw new MidiParseError("Chunk length exceeds file size");
    if (id !== "MTrk") { r.skip(length); continue; } // alien chunks are allowed by the spec
    meta.trackCount++;
    const t = new Reader(data.subarray(r.pos, r.pos + length));
    r.skip(length);

    let tick = 0;
    let runningStatus: number | null = null;
    while (t.remaining() > 0) {
      if (++events > MAX_EVENTS) throw new MidiParseError("Too many events");
      tick += t.vlq();
      let status = t.u8();
      if (status < 0x80) {
        if (runningStatus === null) throw new MidiParseError("Running status without prior status");
        t.pos -= 1;
        status = runningStatus;
      }

      if (status === 0xff) {
        runningStatus = null;
        const type = t.u8();
        const len = t.vlq();
        const body = t.bytes(len);
        if (type === 0x2f) break; // end of track
        switch (type) {
          case 0x51:
            if (len === 3) {
              const usPerQuarter = (body[0]! << 16) | (body[1]! << 8) | body[2]!;
              if (usPerQuarter > 0 && meta.tempos.length < MAX_TEXT_ITEMS) {
                meta.tempos.push({ tick, bpm: Math.round((60_000_000 / usPerQuarter) * 100) / 100 });
              }
            }
            break;
          case 0x58:
            if (len >= 2 && meta.timeSignatures.length < MAX_TEXT_ITEMS) {
              meta.timeSignatures.push({ tick, numerator: body[0]!, denominator: 2 ** Math.min(body[1]!, 6) });
            }
            break;
          case 0x59:
            if (len === 2 && meta.keySignatures.length < MAX_TEXT_ITEMS) {
              const sf = (body[0]! << 24) >> 24; // signed
              const minor = body[1] === 1;
              const name = (minor ? MINOR_KEYS : MAJOR_KEYS)[sf + 7];
              if (name) meta.keySignatures.push({ tick, key: `${name} ${minor ? "minor" : "major"}` });
            }
            break;
          case 0x06:
            if (meta.markers.length < MAX_TEXT_ITEMS) meta.markers.push(decodeText(body));
            break;
          case 0x05:
            meta.lyricsCount++;
            break;
          case 0x03:
            if (meta.trackNames.length < MAX_TEXT_ITEMS) {
              const name = decodeText(body);
              if (name) meta.trackNames.push(name);
            }
            break;
          case 0x02:
            if (meta.copyrightNotices.length < 10) meta.copyrightNotices.push(decodeText(body));
            break;
        }
        continue;
      }

      if (status === 0xf0 || status === 0xf7) {
        runningStatus = null;
        meta.hasSysEx = true;
        t.skip(t.vlq());
        continue;
      }

      if (status >= 0xf1) throw new MidiParseError(`Unexpected system message 0x${status.toString(16)} in track`);

      runningStatus = status;
      const kind = status & 0xf0;
      const channel = status & 0x0f;
      const dataLen = kind === 0xc0 || kind === 0xd0 ? 1 : 2;
      const d = t.bytes(dataLen);
      if (d[0]! > 0x7f || (dataLen === 2 && d[1]! > 0x7f)) throw new MidiParseError("Invalid data byte");
      channels.add(channel);
      if (kind === 0x90 && d[1]! > 0) meta.noteCount++;
      if (kind === 0xc0) {
        if (!programs.has(channel)) programs.set(channel, new Set());
        programs.get(channel)!.add(d[0]!);
      }
    }
    meta.durationTicks = Math.max(meta.durationTicks, tick);
  }

  if (meta.trackCount === 0) throw new MidiParseError("No MTrk chunks found");
  meta.channelsUsed = [...channels].sort((a, b) => a - b).map((c) => c + 1);
  meta.programsByChannel = Object.fromEntries(
    [...programs.entries()].sort(([a], [b]) => a - b).map(([c, p]) => [String(c + 1), [...p].sort((a, b) => a - b)]),
  );
  meta.durationSeconds = computeDurationSeconds(meta);
  return meta;
}

/** Integrates the tempo map (format 0/1). Returns null for SMPTE or format 2. */
function computeDurationSeconds(meta: MidiMetadata): number | null {
  if (meta.ppq == null) {
    if (!meta.smpteTiming) return null;
    const ticksPerSecond = meta.smpteTiming.framesPerSecond * meta.smpteTiming.ticksPerFrame;
    return ticksPerSecond > 0 ? Math.round(meta.durationTicks / ticksPerSecond) : null;
  }
  if (meta.format === 2) return null;
  const tempos = [...meta.tempos].sort((a, b) => a.tick - b.tick);
  let seconds = 0;
  let lastTick = 0;
  let bpm = 120;
  for (const t of tempos) {
    if (t.tick > meta.durationTicks) break;
    seconds += ((t.tick - lastTick) / meta.ppq) * (60 / bpm);
    lastTick = t.tick;
    bpm = t.bpm;
  }
  seconds += ((meta.durationTicks - lastTick) / meta.ppq) * (60 / bpm);
  return Math.round(seconds);
}
