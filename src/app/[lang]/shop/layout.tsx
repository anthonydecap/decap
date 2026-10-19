import type { Metadata } from "next";
import { resolveUrlLang } from "@/i18n";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { playerJourney } from "@/modules/shop/services/player-products";
import { storefrontPlayerContext } from "@/modules/shop/services/storefront-player";
import { softwarePath } from "@/modules/shop/ui/store/copy";
import { accountSoftwarePath } from "@/modules/shop/ui/store/software/links";
import { CartProvider } from "@/modules/shop/ui/store/CartProvider";
import { PreviewProvider } from "@/modules/shop/ui/store/PreviewPlayer";
import { ShopNav } from "@/modules/shop/ui/store/ShopNav";
import { ShoppingPlayerProvider } from "@/modules/shop/ui/store/ShoppingPlayer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Music Shop", template: "%s | Music Shop" },
  description: "Arrangements for self-playing pianos and instruments.",
};

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const customer = await getCurrentCustomer();
  // "Buying music for": the remembered player; pages re-resolve it with `?player=` too.
  const ctx = customer ? await storefrontPlayerContext(customer.id) : null;
  // No player yet: what to get (or finish activating) before music can be bought.
  const journey = ctx && ctx.players.length === 0 ? await playerJourney(ctx.customerId) : null;
  const getPlayer = journey
    ? {
        name: journey.product.name,
        href: softwarePath(urlLang, `/${journey.product.slug}`),
        accountHref: accountSoftwarePath(urlLang, journey.product.slug),
        stage: journey.stage,
      }
    : null;
  return (
    <CartProvider>
      <ShoppingPlayerProvider
        signedIn={Boolean(customer)}
        players={ctx?.players ?? []}
        rememberedPlayerId={ctx?.selectedPlayerId ?? null}
        assignLaterAllowed={ctx?.assignLaterAllowed ?? false}
        getPlayer={getPlayer}
      >
        <PreviewProvider>
          <div>
            <ShopNav lang={urlLang} signedIn={Boolean(customer)} />
            {children}
          </div>
        </PreviewProvider>
      </ShoppingPlayerProvider>
    </CartProvider>
  );
}
