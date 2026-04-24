"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("last_visit_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!error) setMembers(data || []);
  }

  async function addMember() {
    if (!name.trim()) return alert("회원 이름을 입력하세요.");

    setLoading(true);

    const { error } = await supabase.from("members").insert({
      name: name.trim(),
      phone: phone.trim(),
      pt_remaining: 0,
    });

    setLoading(false);

    if (error) {
      alert("회원 추가 실패: " + error.message);
      return;
    }

    setName("");
    setPhone("");
    loadMembers();
  }

  async function addPt(id, current) {
    await supabase
      .from("members")
      .update({ pt_remaining: current + 10 })
      .eq("id", id);

    loadMembers();
  }

  async function usePt(id, current) {
    if (current <= 0) return alert("남은 PT가 없습니다.");

    await supabase
      .from("members")
      .update({
        pt_remaining: current - 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq("id", id);

    loadMembers();
  }

  useEffect(() => {
    loadMembers();
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#111",
      color: "white",
      padding: 24,
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>Spotainer</h1>

      <section style={{
        background: "#1f1f1f",
        padding: 20,
        borderRadius: 20,
        marginBottom: 24
      }}>
        <h2 style={{ marginTop: 0 }}>회원 추가</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="실명"
          style={inputStyle}
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호"
          style={inputStyle}
        />

        <button onClick={addMember} disabled={loading} style={primaryButton}>
          {loading ? "추가 중..." : "회원 추가"}
        </button>
      </section>

      <section>
        <h2>회원 목록</h2>

        {members.length === 0 && (
          <p style={{ color: "#aaa" }}>아직 등록된 회원이 없습니다.</p>
        )}

        {members.map((member) => (
          <div key={member.id} style={cardStyle}>
            <div>
              <strong style={{ fontSize: 22 }}>{member.name}</strong>
              <div style={{ color: "#aaa", marginTop: 6 }}>
                {member.phone || "전화번호 없음"}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{
                color: member.pt_remaining <= 3 ? "#f87171" : "white",
                fontSize: 20,
                marginBottom: 10
              }}>
                PT {member.pt_remaining}회
              </div>

              <button
                onClick={() => usePt(member.id, member.pt_remaining)}
                style={smallButton}
              >
                1회 차감
              </button>

              <button
                onClick={() => addPt(member.id, member.pt_remaining)}
                style={smallButtonLight}
              >
                10회 추가
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  borderRadius: 12,
  border: "none",
  fontSize: 16,
};

const primaryButton = {
  width: "100%",
  padding: 15,
  borderRadius: 14,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: "bold",
  fontSize: 16,
};

const cardStyle = {
  background: "#1f1f1f",
  padding: 18,
  borderRadius: 18,
  marginBottom: 14,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
};

const smallButton = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "#ef4444",
  color: "white",
  marginRight: 6,
};

const smallButtonLight = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "white",
  color: "black",
};
