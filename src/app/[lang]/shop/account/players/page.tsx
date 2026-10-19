import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { customerMusicPlayers, licenseCountsByPlayer } from "@/modules/shop/services/music-licenses";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { BackLink, helpLicensingPath, NoPlayersState, PlayerCard, textLink } from "@/modules/shop/ui/store/account-ui";
import { shopPath } from "@/modules/shop/ui/store/copy";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Players", robots: { index: false } };

/**
 * Every player registered to the customer, retired ones last. Customers can open a player
 * and rename it; registering, moving or retiring a player is done by DMI. Registration codes
 * are masked and activation keys are never shown.
 */
export default async function AccountPlayersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = accountCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, shopPath(urlLang, "/account/players"));
  const [players, counts] = await Promise.all([customerMusicPlayers(customer.id), licenseCountsByPlayer(customer.id)]);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <BackLink href={shopPath(urlLang, "/account")} label={t.backToMyDmi} />
        <FadeIn className="mt-6 max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.playersTitle}</h1>
          <p className="mt-4 text-lg text-neutral-600">{t.playersBody}</p>
        </FadeIn>

        {players.length === 0 ? (
          <NoPlayersState lang={urlLang} className="mt-12" />
        ) : (
          <FadeInStagger faster className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {players.map((p) => (
              <FadeIn key={p.id}>
                <PlayerCard lang={urlLang} player={p} musicCount={counts.get(p.id) ?? 0} />
              </FadeIn>
            ))}
          </FadeInStagger>
        )}

        <p className="mt-12">
          <Link href={helpLicensingPath(urlLang)} className={textLink}>{t.learnHowItWorks}</Link>
        </p>
      </Container>
    </section>
  );
}
