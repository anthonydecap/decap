import { createClient } from '@/prismicio';
import { CheckoutClient } from '@/components/CheckoutClient';
import { reverseLocaleLookup } from '@/i18n';

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Fetch Prismic content
  let checkoutContent = null;
  try {
    const client = createClient();
    checkoutContent = await client.getByUID("page", "checkout", { lang: reverseLocaleLookup(lang) });
    console.log(checkoutContent);
  } catch {
    // If no content found, we'll use the default checkout
    checkoutContent = null;
  }

  return (
    <CheckoutClient 
      checkoutContent={checkoutContent}
      lang={lang}
    />
  );
} 