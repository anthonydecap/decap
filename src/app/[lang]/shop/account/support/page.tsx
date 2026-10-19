import type { Metadata } from "next";
import Link from "next/link";
import { CaretRight, Plus } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { listCustomerTickets, ticketNumber } from "@/modules/shop/services/support";
import { formatDate } from "@/modules/shop/ui/format";
import { requireAccountCustomer, ticketCategoryLabel, ticketStatusLabel } from "@/modules/shop/ui/store/account-server";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Support", robots: { index: false } };

export default async function SupportListPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, shopPath(urlLang, "/account/support"));
  const tickets = await listCustomerTickets(customer.id);
  const newHref = shopPath(urlLang, "/account/support/new");

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.supportTitle}</h1>
            <p className="mt-4 text-lg text-neutral-600">{t.supportBody}</p>
          </div>
          {tickets.length > 0 && (
            <Link href={newHref} className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-neutral-950 px-6 py-3 font-semibold text-white transition hover:bg-neutral-800 sm:self-auto">
              <Plus size={16} weight="bold" aria-hidden />
              {t.newRequest}
            </Link>
          )}
        </FadeIn>

        {tickets.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
            <p className="font-display text-xl font-bold text-neutral-950">{t.supportEmpty}</p>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.supportEmptyBody}</p>
            <Link href={newHref} className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800">
              <Plus size={16} weight="bold" aria-hidden />
              {t.newRequest}
            </Link>
          </div>
        ) : (
          <ul className="mt-12 divide-y divide-neutral-200 border-y border-neutral-200">
            {tickets.map((tk) => (
              <li key={tk.id}>
                <Link
                  href={shopPath(urlLang, `/account/support/${tk.id}`)}
                  className="flex items-center justify-between gap-4 py-5 transition hover:bg-neutral-50"
                >
                  <span className="min-w-0">
                    <span className="block text-sm tabular-nums text-neutral-500">
                      {ticketNumber(tk.number)}, {ticketCategoryLabel(urlLang, tk.category)}
                    </span>
                    <span className="mt-0.5 block truncate font-display text-lg font-bold text-neutral-950">{tk.subject}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-right">
                      <span className="block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                        {ticketStatusLabel(urlLang, tk.status)}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">{t.updated} {formatDate(tk.updatedAt, urlLang)}</span>
                    </span>
                    <CaretRight size={16} className="hidden text-neutral-400 sm:block" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
