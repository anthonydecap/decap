"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isFilled, type LinkField } from "@prismicio/client";
import { PrismicRichText, type JSXMapSerializer } from "@prismicio/react";
import { prismicLinkHref, urlLangFromPathname } from "@/lib/prismic-link";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { BrandText } from "@/components/BrandText";

/*
 * Shared building blocks for the theme-aware "site" slices (hero, text_media, card_grid, …).
 * They use the semantic utilities from globals.css (bg-page, text-ink, text-ink-muted,
 * bg-surface, border-line, text-accent, bg-accent) and `.site-heading`, so one slice renders
 * correctly in every page style: decap, smartvalve, orchestrionix and atelier.
 */

export type SectionTone = "page" | "surface" | "inverse";

/** Prismic select value → tone. Editors pick "Default", "Tinted" or "Dark band". */
export function toneFromSelect(value: unknown): SectionTone {
  if (value === "Tinted" || value === "surface") return "surface";
  if (value === "Dark band" || value === "inverse") return "inverse";
  return "page";
}

export function Section({
  tone = "page",
  spacing = "default",
  id,
  className,
  children,
}: {
  tone?: SectionTone;
  spacing?: "default" | "compact" | "none";
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-tone={tone === "page" ? undefined : tone}
      className={clsx(
        "bg-page text-ink",
        spacing === "default" && "py-16 sm:py-24 lg:py-32",
        spacing === "compact" && "py-12 sm:py-16 lg:py-20",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={clsx("text-sm font-semibold uppercase tracking-[0.2em] text-accent", className)}>
      {typeof children === "string" ? <BrandText>{children}</BrandText> : children}
    </p>
  );
}

/** Eyebrow, title and intro, centered or left-aligned. Renders nothing when all are empty. */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "center",
  as: Heading = "h2",
  size = "section",
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  intro?: any;
  align?: "center" | "left";
  as?: "h1" | "h2";
  size?: "hero" | "section";
  className?: string;
}) {
  const hasIntro = typeof intro === "string" ? !!intro : isFilled.richText(intro);
  if (!eyebrow && !title && !hasIntro) return null;
  return (
    <FadeIn
      className={clsx(
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && (
        <Heading
          className={clsx(
            "site-heading text-ink",
            eyebrow && "mt-4",
            size === "hero"
              ? "text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
              : "text-3xl leading-tight sm:text-4xl lg:text-5xl",
          )}
        >
          {title}
        </Heading>
      )}
      {hasIntro && (
        <div className={clsx("text-lg leading-relaxed text-ink-muted sm:text-xl", title ? "mt-6" : "mt-4")}>
          {typeof intro === "string" ? <p>{intro}</p> : <SiteRichText field={intro} />}
        </div>
      )}
    </FadeIn>
  );
}

/**
 * A Prismic link that keeps visitors in their language: document links resolve through the
 * routes, internal web links ("/organs") get the locale prefix ("/en/organs"). External links
 * and files open as plain anchors.
 */
export function SiteLink({
  field,
  className,
  children,
  ...rest
}: { field: LinkField | any; className?: string; children: React.ReactNode } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  const urlLang = urlLangFromPathname(usePathname() ?? "/");
  const href = prismicLinkHref(field, "#", urlLang);
  const external = /^[a-z][a-z0-9+.-]*:/i.test(href);
  if (external) {
    const newTab = field?.target === "_blank" || field?.link_type === "Media";
    return (
      <a href={href} className={className} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

export const siteRichText: JSXMapSerializer = {
  paragraph: ({ children }) => <p className="[&+p]:mt-4">{children}</p>,
  heading3: ({ children }) => <h3 className="site-heading mt-8 text-xl text-ink first:mt-0 sm:text-2xl">{children}</h3>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  list: ({ children }) => <ul className="mt-4 space-y-2">{children}</ul>,
  listItem: ({ children }) => (
    <li className="flex gap-3">
      <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-accent-soft" aria-hidden="true" />
      <span>{children}</span>
    </li>
  ),
  oList: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5">{children}</ol>,
  hyperlink: ({ node, children }) => (
    <SiteLink
      field={node.data}
      className="font-medium text-ink underline decoration-accent-soft underline-offset-4 transition hover:decoration-accent"
    >
      {children}
    </SiteLink>
  ),
};

export function SiteRichText({ field, className }: { field: any; className?: string }) {
  if (!isFilled.richText(field)) return null;
  return (
    <div className={className}>
      <PrismicRichText field={field} components={siteRichText} />
    </div>
  );
}

/** Rounded-full CTA in the page style. Renders nothing without a label or link. */
export function SiteButton({
  field,
  label,
  variant = "primary",
  className,
}: {
  field?: LinkField | null;
  label?: string | null;
  variant?: "primary" | "secondary" | "text";
  className?: string;
}) {
  if (!label || !field || !isFilled.link(field)) return null;
  return (
    <SiteLink
      field={field}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full text-base font-semibold transition-all duration-300",
        variant === "primary" && "bg-accent px-7 py-3 text-accent-contrast hover:opacity-90",
        variant === "secondary" && "border-2 border-ink px-7 py-2.5 text-ink hover:bg-ink hover:text-page",
        variant === "text" && "text-ink underline decoration-accent-soft underline-offset-4 hover:decoration-accent",
        className,
      )}
    >
      <span>
        <BrandText>{label}</BrandText>
      </span>
      {variant === "text" && <span aria-hidden="true">→</span>}
    </SiteLink>
  );
}

/** Card surface shared by grids (a tinted band swaps page and surface, so cards stay distinct). */
export const cardClass = "rounded-2xl border border-line bg-surface transition-all duration-300 lg:rounded-3xl";
