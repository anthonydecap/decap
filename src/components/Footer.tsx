/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { prismicLinkHref, urlLangFromPathname, type LinkLike } from "@/lib/prismic-link";
import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { Logo } from "./Logo";
import { openCookieSettings } from "./Analytics";
import { useUiCopy } from "@/lib/ui-copy";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { isFilled } from "@prismicio/client";

type FooterSection = {
  section_title: string;
  section_links: Array<{
    link_text: string;
    link_url: LinkLike;
  }>;
};

interface FooterSettings {
  data?: {
    footer_sections?: FooterSection[];
    company_name?: string;
    company_address?: any;
    company_phone?: string;
    company_email?: string;
    company_vat?: string;
    copyright_text?: string;
    logo?: any;
    site_name?: string;
  };
}

const defaultFooterSections: FooterSection[] = [
  {
    section_title: "Organs",
    section_links: [
      { link_text: "New organs", link_url: { url: "/organs" } },
      { link_text: "Organ Composer", link_url: { url: "/organ-composer" } },
      { link_text: "MIDI conversion", link_url: { url: "/midi-conversion" } },
      { link_text: "Organ pipes", link_url: { url: "/organ-pipes" } },
      { link_text: "Restoration", link_url: { url: "/frank-decap" } },
    ],
  },
  {
    section_title: "Instruments",
    section_links: [
      { link_text: "Accordion Pedestal & Cube", link_url: { url: "/accordion" } },
      { link_text: "Pipe Cube", link_url: { url: "/pipes" } },
      { link_text: "Percussion Unit", link_url: { url: "/percussion-unit" } },
      { link_text: "Mallet Percussion", link_url: { url: "/mallet-percussion" } },
      { link_text: "Bellow Organ", link_url: { url: "/bellow-organ" } },
      { link_text: "Brass Core", link_url: { url: "/brass-core" } },
    ],
  },
  {
    section_title: "Decap",
    section_links: [
      { link_text: "SmartValve", link_url: { url: "/smartvalve" } },
      { link_text: "Software", link_url: { url: "/software" } },
      { link_text: "Work", link_url: { url: "/work" } },
      { link_text: "About", link_url: { url: "/about" } },
      { link_text: "Journal", link_url: { url: "/blog" } },
      { link_text: "Contact", link_url: { url: "/contact" } },
    ],
  },
];

function Navigation({ sections }: { sections: FooterSection[] }) {
  const pathname = usePathname();
  const urlLang = urlLangFromPathname(pathname);

  return (
    <nav>
      <ul role="list" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {sections.map((section, sectionIndex) => (
          <li key={sectionIndex}>
            <div className="font-display text-sm font-semibold tracking-wider text-neutral-950">
              {section.section_title}
            </div>
            <ul role="list" className="mt-4 text-sm text-neutral-700">
              {section.section_links.map((link, linkIndex) => (
                <li key={linkIndex} className="mt-4">
                  <Link
                    href={prismicLinkHref(link.link_url, "#", urlLang)}
                    className="transition hover:text-neutral-950"
                  >
                    {link.link_text}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({
  settings,
  className,
}: {
  settings?: FooterSettings;
  /** e.g. mt-0 when wrapped in a surface that already provides spacing */
  className?: string;
}) {
  const pathname = usePathname();
  const ui = useUiCopy().cookie;
  const footerSections =
    settings?.data?.footer_sections || defaultFooterSections;
  const d = settings?.data;
  const companyName = d?.company_name || "Decap Herentals";
  const companyPhone = d?.company_phone || "+32 14 22 44 94";
  const companyEmail = d?.company_email || "info@decap.be";
  const companyVat = d?.company_vat || "BE 0450.352.984";
  const copyrightText = d?.copyright_text || "© Decap Herentals";
  const logo = settings?.data?.logo;
  // const siteName = settings?.data?.site_name || 'Studio'

  return (
    <footer
      className={clsx("mt-24 w-full sm:mt-32 lg:mt-40", className)}
    >
      <Container>
        <FadeIn>
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          <Navigation sections={footerSections} />
          <div className="flex lg:justify-end">
            <address className="max-w-sm text-sm not-italic text-neutral-700">
              <h2 className="font-display text-sm font-semibold tracking-wider text-neutral-950">
                {companyName}
              </h2>
              <div className="mt-4 space-y-1">
                {d?.company_address && isFilled.richText(d.company_address) ? (
                  <PrismicRichText field={d.company_address} />
                ) : (
                  <p>
                    Langepad 51C
                    <br />
                    2200 Herentals, Belgium
                  </p>
                )}
              </div>
              <p className="mt-4">
                <a href={`tel:${companyPhone.replace(/[^+\d]/g, "")}`} className="transition hover:text-neutral-950">
                  {companyPhone}
                </a>
                <br />
                <a href={`mailto:${companyEmail}`} className="transition hover:text-neutral-950">
                  {companyEmail}
                </a>
              </p>
              <p className="mt-4 text-neutral-500">{companyVat}</p>
            </address>
          </div>
        </div>
        <div className="mt-24 mb-20 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-neutral-950/10 pt-12">
          <Link href="/" aria-label="Home">
            {logo ? (
              <PrismicNextImage field={logo} className="h-8 w-auto" alt="" />
            ) : (
              <Logo className="h-8" fillOnHover />
            )}
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-700">
            <Link href={prismicLinkHref({ url: "/privacy-policy" }, "#", urlLangFromPathname(pathname))} className="transition hover:text-neutral-950">
              {ui.privacy}
            </Link>
            <button type="button" onClick={openCookieSettings} className="transition hover:text-neutral-950">
              {ui.settings}
            </button>
            <p>
              {copyrightText} {new Date().getFullYear()}
            </p>
          </div>
        </div>
        </FadeIn>
      </Container>
    </footer>
  );
}
