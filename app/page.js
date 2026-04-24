"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ptOptions = [1, 10, 12, 24, 36, 48, 60, 72];

export default function Page() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");

  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const [ptModalMember, setPtModalMember] = useState(null);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*, attendance_logs(visited_at,is_cancelled)")
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((m) => {
      const logs = (m.attendance_logs || []).filter((l) => !l.is_cancelled);
      const latest = logs.map((l) => l.visited_at).sort().reverse()[0];
      return { ...m, latest_visit: latest || null };
    });

    setMembers(formatted);
  }

  // 회원 추가
  async function addMember() {
    if (!name.trim()) return alert("이름 입력");

    await supabase.from("members").insert({
      name,
      phone,
      age: age ? Number(age) : null,
      pt_remaining: 0,
    });

    setName("");
    setPhone("");
    setAge("");
    setSearch("");

    loadMembers();
  }

  // 수정 시작
  function startEdit(m) {
    setEditingId(m.id);
    setEditName(m.name);
    setEditPhone(m.phone || "");
    setEditAge(m.age || "");
  }

  // 수정 저장
  async function saveEdit(id) {
    await supabase
      .from("members")
      .update({
        name: editName,
        phone: editPhone,
        age: editAge ? Number(editAge) : null,
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

  async function minusPt(m) {
    if (m.pt_remaining <= 0) return alert("없음");

    await supabase
      .from("members")
      .update({ pt_remaining: m.pt_remaining - 1 })
      .eq("id", m.id);

    loadMembers();
  }

  async function addPt(m, amount) {
    await supabase
      .from("members")
      .update({ pt_remaining: m.pt_remaining + amount })
      .eq("id", m.id);

    setPtModalMember(null);
    loadMembers();
  }

  async function checkAttendance(m) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { data } = await supabase
      .from("attendance_logs")
      .select("id")
      .eq("member_id", m.id)
      .eq("is_cancelled", false)
      .gte("visited_at", start.toISOString())
      .lt("visited_at", end.toISOString());

    if (data.length > 0) return alert("오늘 이미 출석");

    await supabase.from("attendance_logs").insert({
      member_id: m.id,
    });

    openDetail(m);
    loadMembers();
  }

  async function openDetail(m) {
    setSelectedMember(m);

    const { data } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("member_id", m.id)
      .order("visited_at", { ascending: false });

    setAttendanceList(data || []);
  }

  async function cancelAttendance(log) {
    await supabase
      .from("attendance_logs")
      .update({
        is_cancelled: true,
      })
      .eq("id", log.id);

    openDetail(selectedMember);
    loadMembers();
  }

  function format(date) {
    return new Date(date).toLocaleString("ko-KR");
  }

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <main style={{ background: "#111", color: "#fff", padding: 20 }}>

      {/* 출석 모달 */}
      {selectedMember && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h2>{selectedMember.name} 출석기록</h2>
            <button onClick={() => setSelectedMember(null)}>닫기</button>

            {attendanceList.map((log) => (
              <div key={log.id} style={{
                opacity: log.is_cancelled ? 0.4 : 1,
                marginBottom: 10
              }}>
                {format(log.visited_at)}

                {!log.is_cancelled && (
                  <button onClick={() => cancelAttendance(log)}>
                    취소
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이용권 모달 */}
      {ptModalMember && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h2>{ptModalMember.name} 이용권 추가</h2>

            {ptOptions.map((n) => (
              <button key={n} onClick={() => addPt(ptModalMember, n)}>
                {n}회
              </button>
            ))}

            <button onClick={() => setPtModalMember(null)}>닫기</button>
          </div>
        </div>
      )}

      <h1>Spotainer</h1>

      {/* 회원 추가 */}
      <div>
        <input placeholder="이름" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="전화" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <input placeholder="나이" value={age} onChange={(e)=>setAge(e.target.value)} />
        <button onClick={addMember}>추가</button>
      </div>

      {/* 검색 */}
      <input
        placeholder="검색"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

      {/* 리스트 */}
      {filtered.map((m) => (
        <div key={m.id} style={{ marginBottom: 20 }}>

          {editingId === m.id ? (
            <>
              <input value={editName} onChange={(e)=>setEditName(e.target.value)} />
              <input value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} />
              <input value={editAge} onChange={(e)=>setEditAge(e.target.value)} />

              <button onClick={()=>saveEdit(m.id)}>저장</button>
              <button onClick={()=>setEditingId(null)}>취소</button>
            </>
          ) : (
            <>
              <div onClick={()=>openDetail(m)}>
                <h3>{m.name}</h3>
                <div>{m.age ? `${m.age}세` : ""}</div>
                <div>{m.phone}</div>
              </div>

              <div>PT {m.pt_remaining}</div>

              <button onClick={()=>minusPt(m)}>차감</button>
              <button onClick={()=>setPtModalMember(m)}>이용권</button>
              <button onClick={()=>checkAttendance(m)}>출석</button>

              <button onClick={()=>startEdit(m)}>수정</button>
              <button onClick={()=>deleteMember(m)}>삭제</button>
            </>
          )}
        </div>
      ))}
    </main>
  );
}

const styles = {
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    background: "#222",
    padding: 20,
    borderRadius: 12,
  },
};
