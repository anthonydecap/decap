import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, CheckCircle, Paperclip } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { maskRegistration } from "@/modules/shop/services/music-licenses";
import { getCustomerTicket, ticketNumber } from "@/modules/shop/services/support";
import { formatOrderNumber } from "@/modules/shop/services/checkout";
import { formatBytes, formatDate } from "@/modules/shop/ui/format";
import {
  formatDateTimeLang,
  requireAccountCustomer,
  ticketCategoryLabel,
  ticketStatusLabel,
} from "@/modules/shop/ui/store/account-server";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";
import { SupportReplyForm } from "@/modules/shop/ui/store/SupportReplyForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Support request", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Matches the service's reopen window; the API stays the authority and refuses late replies. */
const REOPEN_WINDOW_MS = 14 * 86400000;

export default async function SupportTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { lang, id } = await params;
  const { created } = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, shopPath(urlLang, `/account/support/${id}`));
  if (!UUID.test(id)) notFound();
  // Own ticket only, PUBLIC messages only (filtered in the query, not here).
  const ticket = await getCustomerTicket(customer.id, id);
  if (!ticket) notFound();

  const number = ticketNumber(ticket.number);
  const status = ticketStatusLabel(urlLang, ticket.status);
  // eslint-disable-next-line react-hooks/purity -- request-time render, force-dynamic
  const now = Date.now();
  const canReply =
    ticket.status !== "CLOSED" &&
    !(ticket.status === "RESOLVED" && ticket.resolvedAt && now - ticket.resolvedAt.getTime() > REOPEN_WINDOW_MS);
  const related = [
    ticket.player && {
      key: "player",
      label: t.relatedPlayer,
      value: `${ticket.player.friendlyName?.trim() || ticket.player.playerType.name} ${accountCopy(urlLang).registrationParen(maskRegistration(ticket.player.registrationCode))}`,
      href: shopPath(urlLang, `/account/players/${ticket.player.id}`),
    },
    ticket.order && {
      key: "order",
      label: t.relatedOrder,
      value: formatOrderNumber(ticket.order.number),
      href: shopPath(urlLang, `/account/orders/${ticket.order.id}`),
    },
    ticket.arrangement && { key: "arrangement", label: t.relatedArrangement, value: ticket.arrangement.displayTitle, href: null },
  ].filter(Boolean) as { key: string; label: string; value: string; href: string | null }[];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Link href={shopPath(urlLang, "/account/support")} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950">
            <ArrowLeft size={14} weight="bold" aria-hidden />
            {t.backToSupport}
          </Link>

          {created === "1" && (
            <div role="status" className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 lg:rounded-3xl">
              <div className="flex items-start gap-3">
                <CheckCircle size={28} weight="fill" className="mt-0.5 shrink-0 text-neutral-950" aria-hidden />
                <div>
                  <h2 className="font-display text-xl font-bold text-neutral-950">{t.requestCreatedTitle}</h2>
                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-neutral-500">{t.requestStatus}</dt>
                      <dd className="mt-0.5 font-medium text-neutral-950">{status}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">{t.requestNumber}</dt>
                      <dd className="mt-0.5 font-medium tabular-nums text-neutral-950">{number}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-neutral-500">{t.subject}</dt>
                      <dd className="mt-0.5 break-words font-medium text-neutral-950">{ticket.subject}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-neutral-700">{t.requestCreatedBody}</p>
                </div>
              </div>
            </div>
          )}

          <FadeIn className="mt-8">
            <p className="text-sm tabular-nums text-neutral-500">
              {number}, {ticketCategoryLabel(urlLang, ticket.category)}
            </p>
            <h1 className="mt-2 break-words font-display text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">{ticket.subject}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{status}</span>
              <span>{t.opened} {formatDate(ticket.createdAt, urlLang)}</span>
            </div>
            {related.length > 0 && (
              <dl className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 p-5 text-sm sm:flex-row sm:flex-wrap sm:gap-8">
                {related.map((r) => (
                  <div key={r.key}>
                    <dt className="text-neutral-500">{r.label}</dt>
                    <dd className="mt-0.5 font-medium text-neutral-950">
                      {r.href ? <Link href={r.href} className="hover:underline">{r.value}</Link> : r.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </FadeIn>

          <h2 className="sr-only">{t.conversation}</h2>
          <ol className="mt-10 flex flex-col gap-6">
            {ticket.messages.map((m) => {
              const mine = m.authorType === "CUSTOMER";
              return (
                <li key={m.id} className={clsx("flex flex-col", mine ? "items-end" : "items-start")}>
                  <p className="mb-1 px-1 text-xs text-neutral-500">
                    <span className="font-medium text-neutral-700">{mine ? t.you : m.staffName}</span>
                    <span className="ml-2">{formatDateTimeLang(m.createdAt, urlLang)}</span>
                  </p>
                  <div
                    className={clsx(
                      "max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]",
                      mine ? "rounded-br-md bg-neutral-950 text-white" : "rounded-bl-md bg-neutral-100 text-neutral-950",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-base">{m.body}</p>
                    {m.attachments.length > 0 && (
                      <ul className={clsx("mt-3 flex flex-col gap-1 border-t pt-3 text-sm", mine ? "border-white/20" : "border-neutral-200")}>
                        {m.attachments.map((a) => (
                          <li key={a.id}>
                            <a
                              href={`/api/shop/support/attachments/${a.id}`}
                              className={clsx("inline-flex max-w-full items-center gap-2 underline-offset-4 hover:underline", mine ? "text-white" : "text-neutral-950")}
                            >
                              <Paperclip size={14} className="shrink-0" aria-hidden />
                              <span className="truncate">{a.fileName}</span>
                              <span className={clsx("shrink-0 text-xs", mine ? "text-neutral-300" : "text-neutral-500")}>{formatBytes(a.sizeBytes)}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-12 border-t border-neutral-200 pt-8">
            {canReply ? (
              <SupportReplyForm lang={urlLang} ticketId={ticket.id} />
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
                <p className="text-neutral-700">{t.requestClosed}</p>
                <Link
                  href={shopPath(urlLang, "/account/support/new")}
                  className="mt-6 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800"
                >
                  {t.openNewRequest}
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
