/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { Logo } from "./Logo";
import { PrismicNextImage } from "@prismicio/next";

interface FooterSettings {
  data?: {
    footer_sections?: Array<{
      section_title: string;
      section_links: Array<{
        link_text: string;
        link_url: { url: string };
      }>;
    }>;
    newsletter_title?: string;
    newsletter_description?: string;
    copyright_text?: string;
    logo?: any;
    site_name?: string;
  };
}

const defaultFooterSections = [
  {
    section_title: "Work",
    section_links: [
      { link_text: "Our Work", link_url: { url: "/work" } },
      { link_text: "Case Studies", link_url: { url: "/case-studies" } },
      { link_text: "Process", link_url: { url: "/process" } },
    ],
  },
  {
    section_title: "Company",
    section_links: [
      { link_text: "About", link_url: { url: "/about" } },
      { link_text: "Blog", link_url: { url: "/blog" } },
      { link_text: "Contact us", link_url: { url: "/contact" } },
    ],
  },
  {
    section_title: "Connect",
    section_links: [
      { link_text: "Facebook", link_url: { url: "#" } },
      { link_text: "Instagram", link_url: { url: "#" } },
      { link_text: "Twitter", link_url: { url: "#" } },
    ],
  },
];

function Navigation({ sections }: { sections: typeof defaultFooterSections }) {
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
                    href={link.link_url.url}
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

export function Footer({ settings }: { settings?: FooterSettings }) {
  const footerSections =
    settings?.data?.footer_sections || defaultFooterSections;
  const newsletterTitle = settings?.data?.newsletter_title || "Newsletter";
  const newsletterDescription =
    settings?.data?.newsletter_description ||
    "Subscribe to get the latest design news, articles, resources and inspiration.";
  const copyrightText =
    settings?.data?.copyright_text || "© Studio Agency Inc.";
  const logo = settings?.data?.logo;
  // const siteName = settings?.data?.site_name || 'Studio'

  return (
    <footer className="mt-24 w-full sm:mt-32 lg:mt-40">
      <Container>
        <FadeIn>
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          <Navigation sections={footerSections} />
          <div className="flex lg:justify-end">
            <div className="max-w-sm">
              <h2 className="font-display text-sm font-semibold tracking-wider text-neutral-950">
                {newsletterTitle}
              </h2>
              <p className="mt-4 text-sm text-neutral-700">
                {newsletterDescription}
              </p>
              <form className="mt-6 flex">
                <input
                  type="email"
                  placeholder="Email address"
                  className="min-w-0 flex-auto appearance-none border-b border-neutral-300 bg-transparent px-0 py-2 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
                />
                <button
                  type="submit"
                  className="ml-4 inline-flex items-center font-medium text-neutral-950 hover:text-neutral-700"
                >
                  Subscribe
                </button>
              </form>
            </div>
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
          <p className="text-sm text-neutral-700">
            {copyrightText} {new Date().getFullYear()}
          </p>
        </div>
        </FadeIn>
      </Container>
    </footer>
  );
}
