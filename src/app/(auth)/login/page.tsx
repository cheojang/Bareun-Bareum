import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { BubbleCard } from "@/components/ui/BubbleCard";

export default function LoginPage() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-4 animate-float inline-block">🐣</div>
        <h1 className="text-3xl font-black text-[#3D3530]">바름또박</h1>
        <p className="text-[#8B7E74] mt-2">발음 연습, 놀이처럼 즐겁게!</p>
      </div>

      {/* Login card */}
      <BubbleCard className="w-full max-w-sm">
        <h2 className="text-xl font-bold text-[#3D3530] text-center mb-6">
          시작하기
        </h2>

        <div className="flex flex-col gap-3">
          <SocialLoginButton provider="kakao" />
          <SocialLoginButton provider="google" />
        </div>

        <p className="text-xs text-[#C4B5A8] text-center mt-6 leading-relaxed">
          계속 진행하면 <span className="underline">이용약관</span>과{" "}
          <span className="underline">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
        </p>
      </BubbleCard>
    </main>
  );
}
