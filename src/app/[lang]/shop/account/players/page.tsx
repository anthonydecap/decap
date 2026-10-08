import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { loginUrl } from "@/modules/shop/auth/auth0";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { listCustomerPlayers } from "@/modules/shop/services/players";
import { formatDate } from "@/modules/shop/ui/format";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Players", robots: { index: false } };

/**
 * Read-only on purpose.
 *
 * A customer may not add, edit, move or retire a player, and never sees an activation key.
 * Registration is what links a machine to an account, so letting customers attach players
 * themselves would let anyone claim any machine. The registration code is shown partly
 * masked: enough to recognise which player this is, not enough to read out a full code.
 */
export default async function AccountPlayersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await getCurrentCustomer();
  if (!customer) redirect(loginUrl(shopPath(urlLang, "/account/players")));

  const players = await listCustomerPlayers(customer.id);
  const statusLabel: Record<string, string> = {
    PENDING: t.playerStatusPending,
    ACTIVE: t.playerStatusActive,
    SUSPENDED: t.playerStatusSuspended,
    RETIRED: t.playerStatusRetired,
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.playersTitle}</h1>
          <p className="mt-4 text-lg text-neutral-600">{t.playersBody}</p>
        </FadeIn>

        {players.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
            <p className="font-display text-xl font-bold text-neutral-950">{t.playersEmpty}</p>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.playersEmptyBody}</p>
          </div>
        ) : (
          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {players.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md sm:p-8 lg:rounded-3xl"
              >
                <h2 className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{p.playerType.name}</h2>
                <dl className="mt-6 flex flex-col gap-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.playerRegistration}</dt>
                    <dd className="mt-1 font-mono text-neutral-900">{maskRegistration(p.registrationCode)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.playerStatus}</dt>
                    <dd className="mt-1 text-neutral-900">{statusLabel[p.status] ?? p.status}</dd>
                  </div>
                  {p.serialNumber && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.playerSerial}</dt>
                      <dd className="mt-1 text-neutral-900">{p.serialNumber}</dd>
                    </div>
                  )}
                  {p.registeredAt && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.playerRegistered}</dt>
                      <dd className="mt-1 text-neutral-900">{formatDate(p.registeredAt)}</dd>
                    </div>
                  )}
                  {p.warrantyUntil && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.playerWarranty}</dt>
                      <dd className="mt-1 text-neutral-900">{formatDate(p.warrantyUntil)}</dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}

/** Last four characters only: enough to tell two players apart, not enough to repeat. */
function maskRegistration(code: string): string {
  const tail = code.slice(-4);
  return `••••-••••-${tail}`;
}
