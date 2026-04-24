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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [lastAction, setLastAction] = useState(null);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*, attendance_logs(visited_at)")
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((m) => {
      const logs = m.attendance_logs || [];
      const latest = logs.map((l) => l.visited_at).sort().reverse()[0];

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

  async function addMember() {
    if (!name.trim()) return alert("이름을 입력하세요.");

    await supabase.from("members").insert({
      name: name.trim(),
      phone: phone.trim(),
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
    if (member.pt_remaining <= 0) return alert("남은 PT가 없습니다.");

    const before = member.pt_remaining;

    await supabase
      .from("members")
      .update({ pt_remaining: before - 1 })
      .eq("id", member.id);

    setLastAction({
      type: "pt",
      memberId: member.id,
      previousPt: before,
      memberName: member.name,
    });

    loadMembers();
  }

  async function checkAttendance(member) {
    const { error } = await supabase.from("attendance_logs").insert({
      member_id: member.id,
    });

    if (error) return alert("출석 체크 실패: " + error.message);

    setLastAction({
      type: "attendance",
      memberName: member.name,
    });

    loadMembers();

    if (selectedMember?.id === member.id) {
      openDetail(member);
    }
  }

  async function openDetail(member) {
    setSelectedMember(member);

    const { data } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("member_id", member.id)
      .order("visited_at", { ascending: false });

    setAttendanceList(data || []);
  }

  async function undo() {
    if (!lastAction) return;

    if (lastAction.type === "pt") {
      await supabase
        .from("members")
        .update({ pt_remaining: lastAction.previousPt })
        .eq("id", lastAction.memberId);
    }

    setLastAction(null);
    loadMembers();
  }

  function startEdit(member) {
    setEditingId(member.id);
    setEditName(member.name);
    setEditPhone(member.phone || "");
  }

  async function saveEdit(id) {
    if (!editName.trim()) return alert("이름을 입력하세요.");

    await supabase
      .from("members")
      .update({
        name: editName.trim(),
        phone: editPhone.trim(),
      })
      .eq("id", id);

    setEditingId(null);
    loadMembers();
  }

  async function deleteMember(member) {
    if (!confirm(`${member.name} 회원을 삭제할까요?`)) return;

    await supabase.from("members").delete().eq("id", member.id);
    setSelectedMember(null);
    loadMembers();
  }

  function formatDate(date) {
    if (!date) return "출석 기록 없음";
    return new Date(date).toLocaleDateString("ko-KR");
  }

  function formatDateTime(date) {
    return new Date(date).toLocaleString("ko-KR");
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Spotainer</h1>
          <p style={styles.subtitle}>PT 회원관리</p>
        </div>
        <div style={styles.badge}>관리자</div>
      </div>

      {lastAction && (
        <div style={styles.undoBox}>
          <div>
            <strong>{lastAction.memberName}</strong>
            <span style={styles.undoText}>
              {lastAction.type === "pt" ? " PT 1회 차감됨" : " 출석 체크됨"}
            </span>
          </div>

          {lastAction.type === "pt" && (
            <button onClick={undo} style={styles.undoButton}>
              실행 취소
            </button>
          )}
        </div>
      )}

      {selectedMember && (
        <section style={styles.detailBox}>
          <div style={styles.detailHeader}>
            <div>
              <h2 style={styles.detailName}>{selectedMember.name}</h2>
              <p style={styles.phone}>{selectedMember.phone || "전화번호 없음"}</p>
              <p style={styles.pt}>PT {selectedMember.pt_remaining}회</p>
            </div>
            <button onClick={() => setSelectedMember(null)} style={styles.darkButton}>
              닫기
            </button>
          </div>

          <h3 style={styles.detailTitle}>출석 기록</h3>

          {attendanceList.length === 0 ? (
            <p style={styles.emptyText}>출석 기록이 없습니다.</p>
          ) : (
            attendanceList.map((log) => (
              <div key={log.id} style={styles.logItem}>
                {formatDateTime(log.visited_at)}
              </div>
            ))
          )}
        </section>
      )}

      <section style={styles.panel}>
        <h2 style={styles.sectionTitle}>회원 추가</h2>
        <input
          placeholder="실명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />
        <button onClick={addMember} style={styles.primaryButton}>
          회원 추가
        </button>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>회원 목록</h2>

        {members.map((member) => (
          <div key={member.id} style={styles.card}>
            {editingId === member.id ? (
              <div style={styles.editBox}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={styles.input}
                />
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={styles.input}
                />
                <div style={styles.row}>
                  <button onClick={() => saveEdit(member.id)} style={styles.whiteButton}>
                    저장
                  </button>
                  <button onClick={() => setEditingId(null)} style={styles.darkButton}>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div onClick={() => openDetail(member)} style={styles.memberInfo}>
                  <div style={styles.memberName}>{member.name}</div>
                  <div style={styles.phone}>{member.phone || "전화번호 없음"}</div>
                  <div style={styles.visitText}>
                    최근 출석: {formatDate(member.latest_visit)}
                  </div>
                  <div style={styles.tapHint}>상세보기</div>
                </div>

                <div style={styles.actions}>
                  <div
                    style={{
                      ...styles.pt,
                      color: member.pt_remaining <= 3 ? "#f87171" : "#fff",
                    }}
                  >
                    PT {member.pt_remaining}회
                  </div>

                  <div style={styles.row}>
                    <button onClick={() => usePt(member)} style={styles.redButton}>
                      1회 차감
                    </button>
                    <button onClick={() => addPt(member)} style={styles.whiteButton}>
                      10회 추가
                    </button>
                  </div>

                  <div style={styles.row}>
                    <button onClick={() => checkAttendance(member)} style={styles.blueButton}>
                      오늘 운동 체크
                    </button>
                  </div>

                  <div style={styles.row}>
                    <button onClick={() => startEdit(member)} style={styles.darkButton}>
                      수정
                    </button>
                    <button onClick={() => deleteMember(member)} style={styles.deleteButton}>
                      삭제
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0d0d0d",
    color: "#fff",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    margin: 0,
    fontWeight: 800,
  },
  subtitle: {
    color: "#aaa",
    marginTop: 6,
  },
  badge: {
    background: "#1f1f1f",
    border: "1px solid #333",
    padding: "10px 14px",
    borderRadius: 999,
    color: "#ddd",
  },
  panel: {
    background: "#1a1a1a",
    padding: 22,
    borderRadius: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 30,
    marginBottom: 18,
  },
  input: {
    width: "100%",
    padding: 18,
    marginBottom: 14,
    borderRadius: 18,
    border: "1px solid #333",
    background: "#fff",
    color: "#111",
    fontSize: 18,
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    padding: 18,
    borderRadius: 18,
    border: "none",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    fontSize: 20,
  },
  card: {
    background: "#1c1c1c",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
  },
  memberInfo: {
    flex: 1,
    cursor: "pointer",
  },
  memberName: {
    fontSize: 30,
    fontWeight: 800,
    marginBottom: 10,
  },
  phone: {
    color: "#aaa",
    fontSize: 19,
  },
  visitText: {
    color: "#93c5fd",
    fontSize: 16,
    marginTop: 8,
  },
  tapHint: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
  actions: {
    textAlign: "right",
    minWidth: 190,
  },
  pt: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 14,
  },
  row: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  redButton: {
    padding: "12px 15px",
    borderRadius: 14,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
  },
  whiteButton: {
    padding: "12px 15px",
    borderRadius: 14,
    border: "none",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    fontSize: 16,
  },
  blueButton: {
    padding: "12px 15px",
    borderRadius: 14,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
  },
  darkButton: {
    padding: "12px 15px",
    borderRadius: 14,
    border: "1px solid #444",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
  },
  deleteButton: {
    padding: "12px 15px",
    borderRadius: 14,
    border: "1px solid #7f1d1d",
    background: "#3f1111",
    color: "#fca5a5",
    fontWeight: 800,
    fontSize: 16,
  },
  undoBox: {
    background: "#222",
    border: "1px solid #444",
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  undoText: {
    color: "#ccc",
  },
  undoButton: {
    padding: "12px 15px",
    borderRadius: 14,
    border: "none",
    background: "#facc15",
    color: "#111",
    fontWeight: 800,
  },
  editBox: {
    width: "100%",
  },
  detailBox: {
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  detailName: {
    fontSize: 34,
    margin: 0,
  },
  detailTitle: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  logItem: {
    background: "#222",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    color: "#ddd",
  },
  emptyText: {
    color: "#aaa",
  },
};
