import { SuccessClient } from "@/components/SuccessClient";

export default async function SuccessPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ 
    payment_intent?: string;
    session_id?: string;
  }>;
}) {
  const { lang } = await params;
  const { payment_intent, session_id } = await searchParams;

  return (
    <SuccessClient 
      lang={lang}
      paymentIntent={payment_intent}
      sessionId={session_id}
    />
  );
} 