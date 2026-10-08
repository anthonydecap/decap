import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { publishedBundles } from "@/modules/shop/services/catalog";
import { BundleCard } from "@/modules/shop/ui/store/BundleCard";
import { shopCopy } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const bundles = await publishedBundles({ take: 60 });

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.collections}</h1>
          <p className="mt-4 text-lg text-neutral-600">{t.saveWithCollectionsBody}</p>
        </FadeIn>
        {bundles.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
            <p className="font-display text-xl font-bold text-neutral-950">{t.emptyCatalog}</p>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.emptyCatalogBody}</p>
          </div>
        ) : (
          <FadeInStagger faster className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {bundles.map((b) => <FadeIn key={b.id}><BundleCard bundle={b} lang={urlLang} /></FadeIn>)}
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
}
