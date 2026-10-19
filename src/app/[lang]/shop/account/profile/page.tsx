import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { profileDefaults, requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { ProfileForm } from "@/modules/shop/ui/store/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, shopPath(urlLang, "/account/profile"));
  const defaults = await profileDefaults(customer.id);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-xl">
          <FadeIn>
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.profileTitle}</h1>
            <p className="mt-4 text-lg text-neutral-600">{t.profileBody}</p>
          </FadeIn>

          <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-medium text-neutral-800">{t.emailLabel}</p>
            <p className="mt-1 break-all text-neutral-950">{customer.email}</p>
            <p className="mt-2 text-sm text-neutral-600">{t.emailManaged}</p>
          </div>

          <div className="mt-10">
            <ProfileForm lang={urlLang} defaults={defaults} submitLabel={t.saveChanges} />
          </div>
        </div>
      </Container>
    </section>
  );
}
