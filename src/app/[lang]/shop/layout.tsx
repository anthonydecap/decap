import type { Metadata } from "next";
import { resolveUrlLang } from "@/i18n";
import { getSessionUser } from "@/modules/shop/auth/session";
import { CartProvider } from "@/modules/shop/ui/store/CartProvider";
import { PreviewProvider } from "@/modules/shop/ui/store/PreviewPlayer";
import { ShopNav } from "@/modules/shop/ui/store/ShopNav";

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
  const user = await getSessionUser();
  return (
    <CartProvider>
      <PreviewProvider>
        <div>
          <ShopNav lang={urlLang} signedIn={Boolean(user)} />
          {children}
        </div>
      </PreviewProvider>
    </CartProvider>
  );
}
