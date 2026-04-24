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
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [lastAction, setLastAction] = useState(null);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    setMembers(data || []);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function addMember() {
    if (!name.trim()) return alert("이름 입력");

    await supabase.from("members").insert({
      name,
      phone,
      pt_remaining: 0,
    });

    setName("");
    setPhone("");
    loadMembers();
  }

  async function addPt(member) {
    await supabase
      .from("members")
      .update({ pt_remaining: member.pt_remaining + 10 })
      .eq("id", member.id);

    loadMembers();
  }

  async function usePt(member) {
    if (member.pt_remaining <= 0) return alert("PT 없음");

    const before = member.pt_remaining;

    await supabase
      .from("members")
      .update({
        pt_remaining: before - 1,
      })
      .eq("id", member.id);

    setLastAction({
      memberId: member.id,
      previousPt: before,
      memberName: member.name,
    });

    loadMembers();
  }

  async function undo() {
    if (!lastAction) return;

    await supabase
      .from("members")
      .update({ pt_remaining: lastAction.previousPt })
      .eq("id", lastAction.memberId);

    setLastAction(null);
    loadMembers();
  }

  function startEdit(m) {
    setEditingId(m.id);
    setEditName(m.name);
    setEditPhone(m.phone || "");
  }

  async function saveEdit(id) {
    await supabase
      .from("members")
      .update({
        name: editName,
        phone: editPhone,
      })
      .eq("id", id);

    setEditingId(null);
    loadMembers();
  }

  async function deleteMember(m) {
    if (!confirm("삭제?")) return;

    await supabase.from("members").delete().eq("id", m.id);
    loadMembers();
  }

  return (
    <main style={{ padding: 20, background: "#111", minHeight: "100vh", color: "white" }}>
      <h1>Spotainer</h1>

      {lastAction && (
        <div style={{ marginBottom: 20 }}>
          {lastAction.memberName} 차감됨
          <button onClick={undo}>취소</button>
        </div>
      )}

      <input
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="전화번호"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={addMember}>추가</button>

      <h2>회원 목록</h2>

      {members.map((m) => (
        <div key={m.id} style={{ marginBottom: 20 }}>
          {editingId === m.id ? (
            <>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />
              <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              <button onClick={() => saveEdit(m.id)}>저장</button>
            </>
          ) : (
            <>
              <div>{m.name}</div>
              <div>{m.phone}</div>
              <div>PT {m.pt_remaining}</div>

              <button onClick={() => usePt(m)}>차감</button>
              <button onClick={() => addPt(m)}>+10</button>
              <button onClick={() => startEdit(m)}>수정</button>
              <button onClick={() => deleteMember(m)}>삭제</button>
            </>
          )}
        </div>
      ))}
    </main>
  );
}
