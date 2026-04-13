import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { BubbleButton } from "@/components/ui/BubbleButton";

interface Props {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}

async function SuccessContent({ searchParams }: Props) {
  const { paymentKey, orderId, amount } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (paymentKey && orderId && amount) {
    // Confirm payment server-side
    await fetch(`${process.env.NEXTAUTH_URL}/api/billing/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount) }),
    });
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="text-8xl mb-6 animate-bounce-in">🎉</div>
      <h2 className="text-3xl font-black text-[#3D3530] mb-3">구독 완료!</h2>
      <p className="text-[#8B7E74] mb-8 max-w-xs leading-relaxed">
        바른발음 프리미엄을 시작했어요. 아이와 함께 신나게 연습해보세요!
      </p>
      <Link href="/dashboard">
        <BubbleButton variant="peach" size="lg">연습 시작하기 🚀</BubbleButton>
      </Link>
    </main>
  );
}

export default function SuccessPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center">처리 중...</div>}>
      <SuccessContent {...props} />
    </Suspense>
  );
}
