"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [lastAction, setLastAction] = useState(null);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*, attendance_logs(visited_at,is_cancelled)")
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((m) => {
      const logs = (m.attendance_logs || []).filter(l => !l.is_cancelled);

      const latest = logs
        .map((l) => l.visited_at)
        .sort()
        .reverse()[0];

      return {
        ...m,
        latest_visit: latest || null,
      };
    });

    setMembers(formatted);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function openDetail(member) {
    setSelectedMember(member);

    const { data } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("member_id", member.id)
      .order("visited_at", { ascending: false });

    setAttendanceList(data || []);
  }

  async function checkAttendance(member) {
    await supabase.from("attendance_logs").insert({
      member_id: member.id,
    });

    loadMembers();
    openDetail(member);
  }

  async function cancelAttendance(log) {
    if (!confirm("출석을 취소할까요?")) return;

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

  function formatDateTime(date) {
    return new Date(date).toLocaleString("ko-KR");
  }

  return (
    <main style={{ padding: 20, background: "#111", minHeight: "100vh", color: "white" }}>
      <h1>Spotainer</h1>

      {selectedMember && (
        <div style={{ marginBottom: 30 }}>
          <h2>{selectedMember.name}</h2>

          <button onClick={() => setSelectedMember(null)}>닫기</button>

          <h3>출석 기록</h3>

          {attendanceList.map((log) => (
            <div key={log.id} style={{
              padding: 12,
              marginBottom: 8,
              background: log.is_cancelled ? "#333" : "#222",
              display: "flex",
              justifyContent: "space-between",
              opacity: log.is_cancelled ? 0.5 : 1
            }}>
              <span>
                {formatDateTime(log.visited_at)}
                {log.is_cancelled && " (취소됨)"}
              </span>

              {!log.is_cancelled && (
                <button onClick={() => cancelAttendance(log)}>
                  취소
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <h2>회원 목록</h2>

      {members.map((m) => (
        <div key={m.id} style={{ marginBottom: 20 }}>
          <div onClick={() => openDetail(m)} style={{ cursor: "pointer" }}>
            <strong>{m.name}</strong>
            <div>최근 출석: {m.latest_visit ? formatDateTime(m.latest_visit) : "없음"}</div>
          </div>

          <button onClick={() => checkAttendance(m)}>
            오늘 운동 체크
          </button>
        </div>
      ))}
    </main>
  );
}
