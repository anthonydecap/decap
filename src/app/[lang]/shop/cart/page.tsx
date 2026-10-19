import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { resolveUrlLang } from "@/i18n";
import { getSessionUser } from "@/modules/shop/auth/session";
import { CartView } from "@/modules/shop/ui/store/CartView";
import { shopCopy } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const user = await getSessionUser();
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h1 className="mb-10 font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.cartTitle}</h1>
        <CartView lang={urlLang} signedIn={Boolean(user)} />
      </Container>
    </section>
  );
}
