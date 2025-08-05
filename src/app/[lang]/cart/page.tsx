import { ShoppingCart } from '@/components/ShoppingCart'

export default async function CartPage({ 
  params 
}: { 
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <ShoppingCart lang={lang} />
} 