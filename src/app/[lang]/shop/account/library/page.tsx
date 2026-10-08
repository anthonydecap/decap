import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { loginUrl } from "@/modules/shop/auth/auth0";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { customerLibrary } from "@/modules/shop/services/entitlements";
import { formatDate, formatDuration } from "@/modules/shop/ui/format";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Library", robots: { index: false } };

/** ACTIVE entitlements only. No file downloads here: delivery goes to the registered player. */
export default async function LibraryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await getCurrentCustomer();
  if (!customer) redirect(loginUrl(shopPath(urlLang, "/account/library")));
  const library = await customerLibrary(customer.id);
  const sourceLabel = (types: string[]) =>
    types.includes("PURCHASE") ? t.viaPurchase : types.includes("BUNDLE") ? t.viaBundle : t.viaGrant;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.libraryTitle}</h1>
          <p className="mt-4 text-lg text-neutral-600">{t.libraryBody}</p>
        </FadeIn>

        {library.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
            <p className="font-display text-xl font-bold text-neutral-950">{t.libraryEmpty}</p>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.libraryEmptyBody}</p>
            <Link href={shopPath(urlLang, "/browse")} className="mt-8 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800">
              {t.browseCatalog}
            </Link>
          </div>
        ) : (
          <ul className="mt-12 divide-y divide-neutral-200 border-y border-neutral-200">
            {library.map((e) => {
              const a = e.arrangement;
              const visible = a.status === "PUBLISHED";
              return (
                <li key={e.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    {visible ? (
                      <Link href={shopPath(urlLang, `/arrangements/${a.slug}`)} className="font-display text-lg font-bold text-neutral-950 hover:underline">
                        {a.displayTitle}
                      </Link>
                    ) : (
                      <p className="font-display text-lg font-bold text-neutral-950">{a.displayTitle}</p>
                    )}
                    <p className="text-sm text-neutral-600">
                      {[a.work.originalArtist ?? a.work.title, a.arranger.name].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm text-neutral-500">
                    {formatDuration(a.durationSeconds) && <span className="tabular-nums">{formatDuration(a.durationSeconds)}</span>}
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                      {sourceLabel(e.sources.map((s) => s.sourceType))}
                    </span>
                    <span>{t.acquired} {formatDate(e.firstGrantedAt, urlLang)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
