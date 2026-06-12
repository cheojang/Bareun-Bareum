import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import AdminNav from "./_components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // isAdmin 단일 게이트 — API 라우트들과 동일 기준 (개발 계정 포함)
  if (!isAdmin(session?.user?.email)) {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      {/* 관리자 상단 바 */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(253,250,245,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid #F0E8E0",
        }}
      >
        <div className="px-6 py-3 flex items-center gap-3">
          <span className="text-lg">🛡️</span>
          <p className="font-black text-[#3D3530]">관리자 패널</p>
          <span className="text-xs text-[#C4B5A8] ml-auto">{session?.user?.email}</span>
        </div>
        <AdminNav />
      </header>
      {children}
    </div>
  );
}
