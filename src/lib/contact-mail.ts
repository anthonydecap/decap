import "server-only";

/**
 * Website enquiries (contact, organ consultation, Atelier Frank Decap). Recipients are fixed on
 * the server by form key, never taken from the request, so the form cannot be used to send mail
 * anywhere else.
 *
 * Env: RESEND_API_KEY, CONTACT_EMAIL_FROM (a verified Resend sender), CONTACT_TO_DECAP,
 * CONTACT_TO_FRANK. Without a key or recipient, enquiries are logged (development).
 */
export const CONTACT_RECIPIENTS = ["decap", "frank"] as const;
export type ContactRecipient = (typeof CONTACT_RECIPIENTS)[number];

function recipientAddress(to: ContactRecipient): string | undefined {
  return to === "frank" ? process.env.CONTACT_TO_FRANK : process.env.CONTACT_TO_DECAP;
}

export type Enquiry = {
  to: ContactRecipient;
  subject: string;
  replyTo: string;
  text: string;
};

export async function sendEnquiry(e: Enquiry): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_EMAIL_FROM ?? process.env.SHOP_EMAIL_FROM;
  const address = recipientAddress(e.to);

  if (!key || !from || !address) {
    if (process.env.NODE_ENV === "production") throw new Error(`Contact mail is not configured for "${e.to}"`);
    console.info(`[contact] "${e.subject}" for ${e.to} (not sent: mail not configured)`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: [address], reply_to: e.replyTo, subject: e.subject, text: e.text }),
  });
  if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
}
