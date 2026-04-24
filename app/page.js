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

  const [selectedMember, setSelectedMember] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);

  // 회원 불러오기
  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*, attendance_logs(visited_at,is_cancelled)")
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((m) => {
      const logs = (m.attendance_logs || []).filter(l => !l.is_cancelled);
      const latest = logs.map(l => l.visited_at).sort().reverse()[0];

      return { ...m, latest_visit: latest || null };
    });

    setMembers(formatted);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  // 회원 추가
  async function addMember() {
    if (!name) return;

    await supabase.from("members").insert({ name, phone });
    setName("");
    setPhone("");
    loadMembers();
  }

  // 수정 시작
  function startEdit(m) {
    setEditingId(m.id);
    setEditName(m.name);
    setEditPhone(m.phone || "");
  }

  // 수정 저장
  async function saveEdit(id) {
    await supabase.from("members").update({
      name: editName,
      phone: editPhone,
    }).eq("id", id);

    setEditingId(null);
    loadMembers();
  }

  // 삭제
  async function deleteMember(id) {
    if (!confirm("삭제할까요?")) return;
    await supabase.from("members").delete().eq("id", id);
    loadMembers();
  }

  // PT 차감
  async function minusPt(m) {
    await supabase.from("members")
      .update({ pt_remaining: m.pt_remaining - 1 })
      .eq("id", m.id);
    loadMembers();
  }

  // PT 추가
  async function plusPt(m) {
    await supabase.from("members")
      .update({ pt_remaining: m.pt_remaining + 10 })
      .eq("id", m.id);
    loadMembers();
  }

  // 출석
  async function checkAttendance(m) {
    await supabase.from("attendance_logs").insert({
      member_id: m.id,
    });
    loadMembers();
    openDetail(m);
  }

  // 상세
  async function openDetail(m) {
    setSelectedMember(m);

    const { data } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("member_id", m.id)
      .order("visited_at", { ascending: false });

    setAttendanceList(data || []);
  }

  // 출석 취소
  async function cancelAttendance(log) {
    await supabase.from("attendance_logs").update({
      is_cancelled: true,
      cancelled_at: new Date().toISOString(),
    }).eq("id", log.id);

    openDetail(selectedMember);
    loadMembers();
  }

  const format = (d) => new Date(d).toLocaleString("ko-KR");

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Spotainer</h1>

      {/* 회원 추가 */}
      <div style={styles.addBox}>
        <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} style={styles.input}/>
        <input placeholder="전화번호" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input}/>
        <button onClick={addMember} style={styles.primaryBtn}>추가</button>
      </div>

      {/* 상세 */}
      {selectedMember && (
        <div style={styles.detailBox}>
          <h2>{selectedMember.name} 출석 기록</h2>
          <button onClick={() => setSelectedMember(null)}>닫기</button>

          {attendanceList.map(log => (
            <div key={log.id} style={{
              ...styles.logItem,
              opacity: log.is_cancelled ? 0.4 : 1
            }}>
              <span>
                {format(log.visited_at)}
                {log.is_cancelled && " (취소됨)"}
              </span>

              {!log.is_cancelled && (
                <button onClick={() => cancelAttendance(log)} style={styles.cancelBtn}>
                  취소
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <h2>회원 목록</h2>

      {members.map(m => (
        <div key={m.id} style={styles.card}>
          {editingId === m.id ? (
            <>
              <input value={editName} onChange={e => setEditName(e.target.value)} style={styles.input}/>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={styles.input}/>
              <button onClick={() => saveEdit(m.id)} style={styles.primaryBtn}>저장</button>
            </>
          ) : (
            <>
              <div onClick={() => openDetail(m)}>
                <h3>{m.name}</h3>
                <div>{m.phone}</div>
                <div>최근 출석: {m.latest_visit ? format(m.latest_visit) : "없음"}</div>
              </div>

              <div style={styles.pt}>PT {m.pt_remaining}</div>

              <div style={styles.buttonRow}>
                <button onClick={() => minusPt(m)} style={styles.dangerBtn}>차감</button>
                <button onClick={() => plusPt(m)} style={styles.grayBtn}>+10</button>
                <button onClick={() => checkAttendance(m)} style={styles.blueBtn}>출석</button>
              </div>

              <div style={styles.buttonRow}>
                <button onClick={() => startEdit(m)} style={styles.editBtn}>수정</button>
                <button onClick={() => deleteMember(m.id)} style={styles.deleteBtn}>삭제</button>
              </div>
            </>
          )}
        </div>
      ))}
    </main>
  );
}

const styles = {
  container: {
    background: "#111",
    color: "white",
    minHeight: "100vh",
    padding: 20
  },
  title: { fontSize: 28, marginBottom: 20 },
  addBox: { display: "flex", gap: 10, marginBottom: 20 },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "none"
  },
  card: {
    background: "#1f1f1f",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15
  },
  pt: { marginTop: 10, fontWeight: "bold" },
  buttonRow: { display: "flex", gap: 8, marginTop: 10 },
  primaryBtn: { background: "#2563eb", color: "white", padding: 10, borderRadius: 8 },
  dangerBtn: { background: "#ef4444", color: "white", padding: 8, borderRadius: 8 },
  grayBtn: { background: "#555", color: "white", padding: 8, borderRadius: 8 },
  blueBtn: { background: "#3b82f6", color: "white", padding: 8, borderRadius: 8 },
  editBtn: { background: "#333", color: "white", padding: 8, borderRadius: 8 },
  deleteBtn: { background: "#7f1d1d", color: "white", padding: 8, borderRadius: 8 },
  cancelBtn: { background: "#444", color: "white", padding: 6, borderRadius: 6 },
  detailBox: { marginBottom: 20 },
  logItem: {
    background: "#222",
    padding: 10,
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between"
  }
};
