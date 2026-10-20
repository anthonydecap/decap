"use client";

import { useId, useState } from "react";
import clsx from "clsx";

/**
 * The website enquiry form, posting to /api/contact. Used by the ContactForm slice and the Organ
 * Composer. `to` selects a recipient that the server maps to an address; `details` carries
 * structured extras (e.g. composer choices) into the email.
 */
export type EnquiryFormProps = {
  to: "decap" | "frank";
  topics?: string[];
  defaultTopic?: string;
  showPhone?: boolean;
  showLocation?: boolean;
  messagePlaceholder?: string;
  submitLabel?: string;
  details?: Record<string, string>;
  /** Shown instead of the form after a successful send. */
  success: React.ReactNode;
};

export const fieldClass =
  "block w-full rounded-xl border border-line bg-page px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function EnquiryForm({
  to,
  topics = [],
  defaultTopic,
  showPhone = true,
  showLocation = false,
  messagePlaceholder,
  submitLabel = "Send message",
  details,
  success,
}: EnquiryFormProps) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to,
          topic: String(form.get("topic") || defaultTopic || topics[0] || "General question"),
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || "",
          location: form.get("location") || "",
          message: form.get("message"),
          website: form.get("website") || "",
          details,
          page: window.location.pathname,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Your message could not be sent.");
      }
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your message could not be sent.");
      setState("error");
    }
  }

  if (state === "sent") return <div role="status">{success}</div>;

  const label = "block text-sm font-semibold text-ink";

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate={false}>
      {topics.length > 1 && (
        <fieldset>
          <legend className={label}>What is it about?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((t, i) => (
              <label key={t} className="cursor-pointer">
                <input
                  type="radio"
                  name="topic"
                  value={t}
                  defaultChecked={defaultTopic ? t === defaultTopic : i === 0}
                  className="peer sr-only"
                />
                <span className="inline-flex rounded-full border border-line px-4 py-2 text-sm text-ink transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-contrast peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={label}>Name</label>
          <input id={`${id}-name`} name="name" required autoComplete="name" className={clsx(fieldClass, "mt-2")} />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={label}>Email</label>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className={clsx(fieldClass, "mt-2")} />
        </div>
        {showPhone && (
          <div>
            <label htmlFor={`${id}-phone`} className={label}>
              Phone <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" className={clsx(fieldClass, "mt-2")} />
          </div>
        )}
        {showLocation && (
          <div>
            <label htmlFor={`${id}-location`} className={label}>
              Where is the organ? <span className="font-normal text-ink-muted">(city, country)</span>
            </label>
            <input id={`${id}-location`} name="location" autoComplete="address-level2" className={clsx(fieldClass, "mt-2")} />
          </div>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-message`} className={label}>Message</label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={6}
          placeholder={messagePlaceholder}
          className={clsx(fieldClass, "mt-2 resize-y")}
        />
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state === "error" && (
        <p role="alert" className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-contrast transition hover:opacity-90 disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
