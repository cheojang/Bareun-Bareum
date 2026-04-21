"use client";

import { useEffect, useState } from "react";

type Center = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  plan: string;
  inviteCode: string;
  createdAt: string;
  _count: { therapists: number; children: number };
};

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);

  // 생성 폼
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("basic");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/centers");
    if (res.ok) setCenters((await res.json()).centers);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createCenter() {
    if (!name.trim()) { setMsg("센터명을 입력해주세요"); return; }
    setCreating(true); setMsg("");
    const res = await fetch("/api/admin/centers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address, plan }),
    });
    if (res.ok) {
      setMsg("센터 생성 완료!");
      setName(""); setPhone(""); setAddress("");
      load();
    } else {
      setMsg((await res.json()).error ?? "오류 발생");
    }
    setCreating(false);
  }

  async function regenerateCode(centerId: string) {
    if (!confirm("초대코드를 재발급하면 기존 코드는 무효가 됩니다. 계속할까요?")) return;
    await fetch("/api/admin/centers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ centerId, regenerateCode: true }),
    });
    load();
  }

  async function deleteCenter(centerId: string, centerName: string) {
    if (!confirm(`"${centerName}" 센터를 삭제하시겠습니까? 모든 데이터가 삭제됩니다.`)) return;
    await fetch("/api/admin/centers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ centerId }),
    });
    load();
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#3D3530]">센터 관리</h1>
        <p className="text-sm text-[#8B7E74] mt-1">언어치료센터 등록 및 초대코드 관리</p>
      </div>

      {/* 센터 생성 */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "#FFF5EE", border: "1.5px solid #FFE4D8" }}>
        <p className="font-bold text-[#3D3530]">새 센터 등록</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#8B7E74] block mb-1">센터명 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="강남 언어치료센터"
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8B7E74] block mb-1">전화번호</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="02-1234-5678"
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#8B7E74] block mb-1">주소</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="서울시 강남구..."
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8B7E74] block mb-1">플랜</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)}
              className="w-full rounded-xl border border-[#F0E8E0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB38A]/40">
              <option value="basic">Basic (₩49,000/월)</option>
              <option value="pro">Pro (₩99,000/월)</option>
            </select>
          </div>
        </div>
        <button onClick={createCenter} disabled={creating}
          className="rounded-xl bg-[#FFB38A] text-white font-bold px-6 py-2.5 text-sm disabled:opacity-50">
          {creating ? "생성 중..." : "센터 등록하기"}
        </button>
        {msg && <p className={`text-xs font-semibold ${msg.includes("완료") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
      </div>

      {/* 센터 목록 */}
      <div>
        <h2 className="font-bold text-[#3D3530] mb-4">등록된 센터 ({centers.length})</h2>
        {loading ? (
          <p className="text-sm text-[#8B7E74]">불러오는 중...</p>
        ) : centers.length === 0 ? (
          <p className="text-sm text-[#8B7E74] text-center py-8">등록된 센터가 없습니다</p>
        ) : (
          <div className="space-y-4">
            {centers.map((c) => (
              <div key={c.id} className="rounded-2xl p-5 space-y-3" style={{ background: "white", border: "1.5px solid #F0E8E0" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-[#3D3530]">{c.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.plan === "pro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {c.plan.toUpperCase()}
                      </span>
                    </div>
                    {c.phone && <p className="text-xs text-[#8B7E74] mt-0.5">{c.phone}</p>}
                    {c.address && <p className="text-xs text-[#8B7E74]">{c.address}</p>}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-[#F0E8E0] text-[#8B7E74] px-2 py-1 rounded-lg font-semibold">치료사 {c._count.therapists}명</span>
                    <span className="bg-[#F0E8E0] text-[#8B7E74] px-2 py-1 rounded-lg font-semibold">아이 {c._count.children}명</span>
                  </div>
                </div>

                {/* 초대코드 */}
                <div className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ background: "#FAFAF8" }}>
                  <div>
                    <p className="text-[10px] font-bold text-[#C4B5A8] mb-0.5">초대코드 (치료사/부모 공유용)</p>
                    <p className="font-mono font-black text-[#3D3530] tracking-widest">{c.inviteCode}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(c.inviteCode); }}
                      className="text-xs bg-[#FFB38A] text-white font-bold px-3 py-1.5 rounded-lg">
                      복사
                    </button>
                    <button
                      onClick={() => regenerateCode(c.id)}
                      className="text-xs bg-[#F0E8E0] text-[#8B7E74] font-bold px-3 py-1.5 rounded-lg">
                      재발급
                    </button>
                  </div>
                </div>

                {/* 치료사 가입 링크 */}
                <div className="rounded-xl p-3" style={{ background: "#F0FAF8" }}>
                  <p className="text-[10px] font-bold text-[#0D9488] mb-0.5">치료사 가입 링크</p>
                  <p className="text-xs text-[#3D3530] font-mono break-all">
                    {typeof window !== "undefined" ? window.location.origin : ""}/therapist/join?code={c.inviteCode}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => deleteCenter(c.id, c.name)}
                    className="text-xs text-[#C4B5A8] hover:text-red-400 font-semibold">
                    센터 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
