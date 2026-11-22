"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { BrandText } from "@/components/BrandText";
import { SiteRichText } from "@/lib/site-ui";

/*
 * The "Showcase" style: the visual language of the home page tiles carried down the page.
 * A section is a rounded block in the site container, light (#f5f5f7) or dark (black), with the
 * same gap between blocks as between the tiles, and a centered header in the tiles' type sizes.
 * Slices offer it as Style: "Showcase" (home page); "Standard" keeps their usual look.
 */

export const isShowcase = (p: any) => p?.style === "Showcase";

export function ShowcaseBlock({
  tone,
  className,
  children,
}: {
  tone: "light" | "dark";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // Same rhythm as the tiles: 12 px between blocks (16 px from sm), inside the site container.
    <section className="bg-page py-1.5 sm:py-2">
      <Container>
        <FadeIn
          // The colour tokens (ink, muted, buttons) follow the block, not the page.
          data-tone={tone === "dark" ? "inverse" : undefined}
          className={clsx(
            "overflow-hidden rounded-3xl px-6 py-20 text-ink sm:px-12 sm:py-24 lg:py-28",
            tone === "dark" ? "bg-black" : "bg-[#f5f5f7]",
            className,
          )}
        >
          {children}
        </FadeIn>
      </Container>
    </section>
  );
}

/** Centered header in the tiles' sizes: eyebrow, big title, one short intro. */
export function ShowcaseHeader({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  intro?: any;
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto max-w-3xl text-center", className)}>
      {eyebrow && (
        <p className="text-base font-semibold text-ink-muted sm:text-lg">
          <BrandText>{eyebrow}</BrandText>
        </p>
      )}
      {title && (
        <h2
          className={clsx(
            "site-heading text-4xl leading-tight text-ink [text-wrap:balance] sm:text-5xl lg:text-6xl",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h2>
      )}
      {intro && (
        <SiteRichText
          field={intro}
          className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl"
        />
      )}
    </div>
  );
}
