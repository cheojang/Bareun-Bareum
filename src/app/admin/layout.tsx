import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      {/* 관리자 상단 바 */}
      <header
        className="sticky top-0 z-40 px-6 py-3 flex items-center gap-3"
        style={{
          background: "rgba(253,250,245,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid #F0E8E0",
        }}
      >
        <span className="text-lg">🛡️</span>
        <p className="font-black text-[#3D3530]">관리자 패널</p>
        <span className="text-xs text-[#C4B5A8] ml-auto">{session.user.email}</span>
      </header>
      {children}
    </div>
  );
}
