import "server-only";
import { shopConfig } from "../config";

/**
 * EmailService: notification-only email. The shop (tickets, orders) is the source of
 * truth; every message links back into the account and never carries the conversation.
 *
 * Providers: when RESEND_API_KEY + SHOP_EMAIL_FROM are set, mail goes out through Resend's
 * HTTP API. Otherwise messages are logged (subject + recipient domain only), which keeps
 * development and tests side-effect free. Swap the provider with `setEmailProvider`.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain text body. Keep it short; the link is the point. */
  text: string;
  actionUrl?: string;
  actionLabel?: string;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

class LogProvider implements EmailProvider {
  readonly sent: EmailMessage[] = [];
  async send(m: EmailMessage) {
    this.sent.push(m);
    if (process.env.NODE_ENV !== "test") {
      console.info(`[shop] email "${m.subject}" to *@${m.to.split("@")[1] ?? "?"}`);
    }
  }
}

class ResendProvider implements EmailProvider {
  constructor(private readonly apiKey: string, private readonly from: string) {}
  async send(m: EmailMessage) {
    const body = m.actionUrl ? `${m.text}\n\n${m.actionLabel ?? "Open"}: ${m.actionUrl}\n` : m.text;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: this.from, to: [m.to], subject: m.subject, text: body }),
    });
    if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
  }
}

let provider: EmailProvider | null = null;

export function emailProvider(): EmailProvider {
  if (!provider) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.SHOP_EMAIL_FROM;
    provider = key && from ? new ResendProvider(key, from) : new LogProvider();
  }
  return provider;
}

export function setEmailProvider(p: EmailProvider | null) {
  provider = p;
}

/** Sends without ever failing the business action that triggered it. */
export async function notify(message: EmailMessage): Promise<boolean> {
  if (!message.to) return false;
  try {
    await emailProvider().send(message);
    return true;
  } catch (e) {
    console.error("[shop] email failed", e instanceof Error ? e.message.slice(0, 120) : "unknown");
    return false;
  }
}

export const appUrl = (path: string) => `${shopConfig.appBaseUrl}${path}`;
