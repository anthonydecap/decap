import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT_RECIPIENTS, sendEnquiry } from "@/lib/contact-mail";

/**
 * POST /api/contact: website enquiry forms (ContactForm slice, Organ Composer).
 * Honeypot field `website` must stay empty; a small per-IP window limits bursts.
 */

const Body = z.object({
  to: z.enum(CONTACT_RECIPIENTS),
  topic: z.string().trim().max(80).default("General question"),
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  location: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(1).max(5000),
  /** Structured extras (e.g. the Organ Composer choices), label → value. */
  details: z.record(z.string().max(80), z.string().max(500)).optional().default({}),
  page: z.string().max(300).optional().default(""),
  website: z.string().max(0).optional(),
});

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form fields." }, { status: 400 });
  const b = parsed.data;

  const lines = [
    `Name: ${b.name}`,
    `Email: ${b.email}`,
    b.phone ? `Phone: ${b.phone}` : null,
    b.location ? `Location: ${b.location}` : null,
    `Topic: ${b.topic}`,
    ...Object.entries(b.details).map(([k, v]) => `${k}: ${v}`),
    "",
    b.message,
    "",
    b.page ? `Sent from: ${b.page}` : null,
  ].filter((l): l is string => l !== null);

  try {
    await sendEnquiry({
      to: b.to,
      subject: `Website: ${b.topic} from ${b.name}`,
      replyTo: b.email,
      text: lines.join("\n"),
    });
  } catch (e) {
    console.error("[contact] send failed", e instanceof Error ? e.message.slice(0, 120) : "unknown");
    return NextResponse.json({ error: "Your message could not be sent. Please email us directly." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
