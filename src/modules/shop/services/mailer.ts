import "server-only";

/**
 * Transactional email port. Stripe sends payment receipts (`receipt_email` on the
 * PaymentIntent) once live; this port covers anything else. The default implementation logs
 * a redacted line — plug a provider in via `setMailer` when one is chosen.
 */
export type ReceiptEmail = {
  to: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  items: { title: string; chargedCents: number }[];
  libraryUrl: string;
};

export interface Mailer {
  sendOrderReceipt(email: ReceiptEmail): Promise<void>;
}

class LogMailer implements Mailer {
  async sendOrderReceipt(email: ReceiptEmail) {
    if (process.env.NODE_ENV !== "test") {
      console.info(`[shop] receipt queued for order ${email.orderNumber} (${email.items.length} item(s))`);
    }
  }
}

let mailer: Mailer = new LogMailer();
export const getMailer = () => mailer;
export function setMailer(m: Mailer) {
  mailer = m;
}
