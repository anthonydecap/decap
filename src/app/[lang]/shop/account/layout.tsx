import { Container } from "@/components/Container";
import { resolveUrlLang } from "@/i18n";
import { AccountNav } from "@/modules/shop/ui/store/AccountNav";

/** Account section shell: the section sub-navigation above every account page. */
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  return (
    <>
      <Container className="pt-4">
        <AccountNav lang={urlLang} />
      </Container>
      {children}
    </>
  );
}
