import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { resolveUrlLang } from "@/i18n";
import { getSessionUser } from "@/modules/shop/auth/session";
import { describeInvite } from "@/modules/shop/services/staff";
import { formatDate } from "@/modules/shop/ui/format";
import { AcceptInviteForm } from "@/modules/shop/ui/store/AcceptInviteForm";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Staff invitation", robots: { index: false }, referrer: "no-referrer" };

/**
 * Staff invitation landing page. The token is only ever checked server-side; what the
 * invitee sees (email + role) comes from describeInvite, and acceptance re-validates it.
 */
export default async function StaffInvitePage({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const here = shopPath(urlLang, `/staff-invite/${encodeURIComponent(token)}`);
  const user = await getSessionUser();
  const validShape = /^[A-Za-z0-9_-]{20,100}$/.test(token);
  const invite = user && validShape ? await describeInvite(token) : null;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">{t.inviteTitle}</h1>

          {!user ? (
            <div className="mt-8">
              <p className="text-neutral-600">{t.inviteSignInBody}</p>
              {/* Full page load: Auth0 routes are handled by the proxy, not the client router. */}
              <a
                href={`/auth/login?returnTo=${encodeURIComponent(here)}`}
                className="mt-8 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800"
              >
                {t.inviteSignIn}
              </a>
            </div>
          ) : !invite ? (
            <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 px-6 py-12 text-center">
              <p className="font-display text-xl font-bold text-neutral-950">{t.inviteInvalid}</p>
              <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.inviteInvalidBody}</p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl">
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-neutral-500">{t.inviteEmail}</dt>
                  <dd className="mt-0.5 break-all font-medium text-neutral-950">{invite.email}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">{t.inviteRole}</dt>
                  <dd className="mt-0.5 font-medium text-neutral-950">{t.roleLabels[invite.role] ?? invite.role}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">{t.inviteSignedInAs}</dt>
                  <dd className="mt-0.5 break-all text-neutral-950">{user.email ?? ""}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">{t.inviteExpires}</dt>
                  <dd className="mt-0.5 text-neutral-950">{formatDate(invite.expiresAt, urlLang)}</dd>
                </div>
              </dl>
              <div className="mt-8 border-t border-neutral-200 pt-6">
                <AcceptInviteForm lang={urlLang} token={token} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
