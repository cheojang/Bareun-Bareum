import { redirect } from "next/navigation";
import { getTherapistSession } from "@/lib/therapist-auth";
import CenterDashboardClient from "./CenterDashboardClient";

export default async function CenterPage() {
  const s = await getTherapistSession();
  if (!s) redirect("/dashboard");
  // 상담소 현황 대시보드는 owner(상담소장)만 접근 가능
  if (s.role !== "owner") redirect("/center/children");
  return <CenterDashboardClient />;
}
