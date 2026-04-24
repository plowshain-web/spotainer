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
  const [selectedMember, setSelectedMember] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [lastAction, setLastAction] = useState(null);

  // 🔄 회원 불러오기
  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*, attendance_logs(visited_at,is_cancelled)")
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((m) => {
      const validLogs = (m.attendance_logs || []).filter(
        (l) => !l.is_cancelled
      );

      const latest = validLogs
        .map((l) => l.visited_at)
        .sort()
        .reverse()[0];

      return { ...m, latest_visit: latest || null };
    });

    setMembers(formatted);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  // ➕ 회원 추가
  async function addMember() {
    if (!name) return;

    await supabase.from("members").insert({
      name,
      phone,
    });

    setName("");
    setPhone("");
    loadMembers();
  }

  // ❌ 회원 삭제
  async function deleteMember(id) {
    if (!confirm("삭제할까요?")) return;
    await supabase.from("members").delete().eq("id", id);
    loadMembers();
  }

  // ✏️ 수정
  async function editMember(m) {
    const newName = prompt("이름", m.name);
    if (!newName) return;

    await supabase.from("members").update({
      name: newName,
    }).eq("id", m.id);

    loadMembers();
  }

  // ➖ PT 차감
  async function minusPt(m) {
    await supabase
      .from("members")
      .update({ pt_remaining: m.pt_remaining - 1 })
      .eq("id", m.id);

    setLastAction({ type: "minus", member: m });
    loadMembers();
  }

  // ➕ PT 추가
  async function plusPt(m) {
    await supabase
      .from("members")
      .update({ pt_remaining: m.pt_remaining + 10 })
      .eq("id", m.id);

    setLastAction({ type: "plus", member: m });
    loadMembers();
  }

  // ↩️ 실행 취소
  async function undo() {
    if (!lastAction) return;

    if (lastAction.type === "minus") {
      await supabase
        .from("members")
        .update({ pt_remaining: lastAction.member.pt_remaining })
        .eq("id", lastAction.member.id);
    }

    if (lastAction.type === "plus") {
      await supabase
        .from("members")
        .update({ pt_remaining: lastAction.member.pt_remaining })
        .eq("id", lastAction.member.id);
    }

    setLastAction(null);
    loadMembers();
  }

  // 📅 출석 체크
  async function checkAttendance(m) {
    await supabase.from("attendance_logs").insert({
      member_id: m.id,
    });

    loadMembers();
    openDetail(m);
  }

  // 📂 상세보기
  async function openDetail(m) {
    setSelectedMember(m);

    const { data } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("member_id", m.id)
      .order("visited_at", { ascending: false });

    setAttendanceList(data || []);
  }

  // ❗ 출석 취소
  async function cancelAttendance(log) {
    if (!confirm("출석 취소할까요?")) return;

    await supabase
      .from("attendance_logs")
      .update({
        is_cancelled: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", log.id);

    openDetail(selectedMember);
    loadMembers();
  }

  function format(date) {
    return new Date(date).toLocaleString("ko-KR");
  }

  return (
    <main style={{ background: "#111", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1>Spotainer</h1>

      {lastAction && (
        <div style={{ marginBottom: 10 }}>
          실행됨 <button onClick={undo}>취소</button>
        </div>
      )}

      {/* 회원 추가 */}
      <div style={{ marginBottom: 20 }}>
        <input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="전화번호" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={addMember}>추가</button>
      </div>

      {/* 상세보기 */}
      {selectedMember && (
        <div>
          <h2>{selectedMember.name} 출석기록</h2>
          <button onClick={() => setSelectedMember(null)}>닫기</button>

          {attendanceList.map((log) => (
            <div key={log.id} style={{
              background: log.is_cancelled ? "#333" : "#222",
              marginBottom: 8,
              padding: 10,
              opacity: log.is_cancelled ? 0.5 : 1,
              display: "flex",
              justifyContent: "space-between"
            }}>
              <span>
                {format(log.visited_at)}
                {log.is_cancelled && " (취소됨)"}
              </span>

              {!log.is_cancelled && (
                <button onClick={() => cancelAttendance(log)}>취소</button>
              )}
            </div>
          ))}
        </div>
      )}

      <h2>회원 목록</h2>

      {members.map((m) => (
        <div key={m.id} style={{
          background: "#1f1f1f",
          marginBottom: 20,
          padding: 20,
          borderRadius: 15
        }}>
          <div onClick={() => openDetail(m)}>
            <h3>{m.name}</h3>
            <div>{m.phone}</div>
            <div>최근 출석: {m.latest_visit ? format(m.latest_visit) : "없음"}</div>
          </div>

          <div style={{ marginTop: 10 }}>
            PT {m.pt_remaining}
          </div>

          <button onClick={() => minusPt(m)}>1회 차감</button>
          <button onClick={() => plusPt(m)}>10회 추가</button>
          <button onClick={() => checkAttendance(m)}>오늘 운동 체크</button>

          <div>
            <button onClick={() => editMember(m)}>수정</button>
            <button onClick={() => deleteMember(m.id)}>삭제</button>
          </div>
        </div>
      ))}
    </main>
  );
}
