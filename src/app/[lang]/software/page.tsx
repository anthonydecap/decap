import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { listPublicSoftware } from "@/modules/shop/services/software";
import { formatMoney } from "@/modules/shop/ui/format";
import { shopCopy, softwarePath } from "@/modules/shop/ui/store/copy";
import { SoftwareIcon } from "@/modules/shop/ui/store/software/SoftwareIcon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Software" };

export default async function SoftwareCatalogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang).sw;
  const products = await listPublicSoftware();

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.catalogTitle}</h1>
          <p className="mt-4 text-lg text-neutral-600">{t.catalogBody}</p>
        </FadeIn>

        {products.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
            <p className="font-display text-xl font-bold text-neutral-950">{t.catalogEmpty}</p>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.catalogEmptyBody}</p>
          </div>
        ) : (
          <FadeInStagger faster className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {products.map((p) => (
              <FadeIn key={p.id}>
                <Link
                  href={softwarePath(urlLang, `/${p.slug}`)}
                  className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md sm:p-8 lg:rounded-3xl"
                >
                  <div className="flex items-start gap-4">
                    <SoftwareIcon src={p.iconUrl} />
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{p.name}</h2>
                      {p.currentVersion && (
                        <p className="mt-1 text-sm text-neutral-500">{t.currentVersion} {p.currentVersion}</p>
                      )}
                    </div>
                  </div>
                  {p.shortDescription && <p className="mt-5 text-neutral-600">{p.shortDescription}</p>}
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-700">
                    <li className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" aria-hidden />{t.freeDownload}</li>
                    {p.trialAvailable && <li className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" aria-hidden />{t.trialIncluded}</li>}
                    {p.status === "ACTIVE" && p.licensePriceCents != null && p.licensePriceCents > 0 && (
                      <li className="inline-flex items-center gap-1.5">
                        <Check size={14} weight="bold" aria-hidden />
                        {t.licensePrice(formatMoney(p.licensePriceCents, p.currency, urlLang))}
                      </li>
                    )}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-neutral-950">
                    {t.viewDetails}
                    <ArrowRight size={14} weight="bold" className="transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
}
