import { redirect } from "next/navigation";
import { resolveUrlLang } from "@/i18n";
import { shopPath } from "@/modules/shop/ui/store/copy";

/** The old account-wide library is now "My Music" (music is listed per player there). */
export default async function LibraryRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(shopPath(resolveUrlLang(lang), "/account/music"));
}
