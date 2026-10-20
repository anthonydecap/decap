"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { EnquiryForm } from "@/components/EnquiryForm";
import { useUiCopy } from "@/lib/ui-copy";
import { Section, SectionHeader, SiteRichText, cardClass, toneFromSelect } from "@/lib/site-ui";

/** Enquiry form with an optional side panel (address, hours). Recipient is fixed per slice. */
const ContactForm: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const t = useUiCopy().form;
  const topics = String(p.topics || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const hasAside = !!p.aside_title || isFilled.richText(p.aside_body);

  const success = (
    <div className={`${cardClass} p-8 sm:p-10`}>
      <h3 className="site-heading text-2xl text-ink sm:text-3xl">{p.success_title || t.thanksTitle}</h3>
      {isFilled.richText(p.success_body) ? (
        <SiteRichText field={p.success_body} className="mt-4 text-lg text-ink-muted" />
      ) : (
        <p className="mt-4 text-lg text-ink-muted">{t.thanksBody}</p>
      )}
    </div>
  );

  return (
    <Section tone={toneFromSelect(p.tone)} id="contact-form">
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} align={hasAside ? "left" : "center"} />
      <FadeInStagger faster className={hasAside ? "mt-12 grid gap-12 lg:grid-cols-3 lg:gap-16" : "mx-auto mt-12 max-w-2xl"}>
        <FadeIn className={hasAside ? "lg:col-span-2" : undefined}>
          <EnquiryForm
            to={p.recipient === "frank" ? "frank" : "decap"}
            topics={topics}
            defaultTopic={p.default_topic || undefined}
            showPhone={p.show_phone !== false}
            showLocation={!!p.show_location}
            messagePlaceholder={p.message_placeholder || undefined}
            submitLabel={p.submit_label || undefined}
            success={success}
          />
        </FadeIn>
        {hasAside && (
          <FadeIn>
            <aside className={`${cardClass} p-6 sm:p-8`}>
              {p.aside_title && <h3 className="site-heading text-xl text-ink">{p.aside_title}</h3>}
              <SiteRichText field={p.aside_body} className="mt-4 text-base leading-relaxed text-ink-muted" />
            </aside>
          </FadeIn>
        )}
      </FadeInStagger>
    </Section>
  );
};

export default ContactForm;
