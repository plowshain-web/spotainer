"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [lastAction, setLastAction] = useState(null);

  const isSearching = search.trim().length > 0;

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*, attendance_logs(visited_at,is_cancelled,cancelled_at)")
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((m) => {
      const validLogs = (m.attendance_logs || []).filter((l) => !l.is_cancelled);
      const latest = validLogs.map((l) => l.visited_at).sort().reverse()[0];
      return { ...m, latest_visit: latest || null };
    });

    setMembers(formatted);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      member.name?.toLowerCase().includes(q) ||
      member.phone?.toLowerCase().includes(q)
    );
  });

  function daysSince(date) {
    if (!date) return null;
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function needsVisitWarning(member) {
    const days = daysSince(member.latest_visit);
    return days === null || days >= 7;
  }

  async function addMember() {
    if (!name.trim()) return alert("이름을 입력하세요.");

    await supabase.from("members").insert({
      name: name.trim(),
      phone: phone.trim(),
      pt_remaining: 0,
    });

    setName("");
    setPhone("");
    setSearch("");
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

    if (selectedMember?.id === member.id) setSelectedMember(null);
    loadMembers();
  }

  async function minusPt(member) {
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

  async function plusPt(member) {
    await supabase
      .from("members")
      .update({ pt_remaining: member.pt_remaining + 10 })
      .eq("id", member.id);

    loadMembers();
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

  async function checkAttendance(member) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { data: todayLogs } = await supabase
      .from("attendance_logs")
      .select("id")
      .eq("member_id", member.id)
      .eq("is_cancelled", false)
      .gte("visited_at", todayStart.toISOString())
      .lt("visited_at", tomorrowStart.toISOString());

    if (todayLogs && todayLogs.length > 0) {
      alert("오늘 이미 출석 체크되었습니다.");
      return;
    }

    const { error } = await supabase.from("attendance_logs").insert({
      member_id: member.id,
    });

    if (error) return alert("출석 체크 실패: " + error.message);

    setLastAction({
      type: "attendance",
      memberName: member.name,
    });

    loadMembers();
    openDetail(member);
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

  async function cancelAttendance(log) {
    if (!confirm("이 출석 기록을 취소할까요?")) return;

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

  function formatDate(date) {
    if (!date) return "없음";
    return new Date(date).toLocaleDateString("ko-KR");
  }

  function formatDateTime(date) {
    return new Date(date).toLocaleString("ko-KR");
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Spotainer</h1>
          <p style={styles.subtitle}>여성전용 PT 회원관리</p>
        </div>
        <div style={styles.adminBadge}>관리자</div>
      </header>

      {lastAction && (
        <div style={styles.notice}>
          <span>
            <strong>{lastAction.memberName}</strong>
            {lastAction.type === "pt" ? " PT 1회 차감됨" : " 출석 체크됨"}
          </span>

          {lastAction.type === "pt" && (
            <button onClick={undo} style={styles.noticeButton}>
              실행 취소
            </button>
          )}
        </div>
      )}

      {selectedMember && (
        <section style={styles.detailBox}>
          <div style={styles.detailTop}>
            <div>
              <h2 style={styles.detailName}>{selectedMember.name}</h2>
              <p style={styles.muted}>{selectedMember.phone || "전화번호 없음"}</p>
              <p style={styles.detailPt}>PT {selectedMember.pt_remaining}회</p>
            </div>

            <button onClick={() => setSelectedMember(null)} style={styles.closeButton}>
              닫기
            </button>
          </div>

          <h3 style={styles.subTitle}>출석 기록</h3>

          {attendanceList.length === 0 ? (
            <p style={styles.muted}>출석 기록이 없습니다.</p>
          ) : (
            attendanceList.map((log) => (
              <div
                key={log.id}
                style={{
                  ...styles.logItem,
                  opacity: log.is_cancelled ? 0.45 : 1,
                }}
              >
                <div>
                  <div style={styles.logDate}>{formatDateTime(log.visited_at)}</div>
                  {log.is_cancelled && <div style={styles.cancelText}>취소됨</div>}
                </div>

                {!log.is_cancelled && (
                  <button onClick={() => cancelAttendance(log)} style={styles.smallDanger}>
                    출석 취소
                  </button>
                )}
              </div>
            ))
          )}
        </section>
      )}

      <section style={styles.addBox}>
        <h2 style={styles.sectionTitle}>회원 추가</h2>

        <label style={styles.label}>이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 홍길동"
          style={styles.input}
        />

        <label style={styles.label}>전화번호</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="예: 01012345678"
          style={styles.input}
        />

        <button onClick={addMember} style={styles.primaryButton}>
          회원 추가
        </button>
      </section>

      <section style={styles.searchBox}>
        <label style={styles.label}>회원 검색</label>

        <div style={styles.searchRow}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호 검색"
            style={{ ...styles.input, marginBottom: 0 }}
          />

          {isSearching && (
            <button onClick={() => setSearch("")} style={styles.resetButton}>
              초기화
            </button>
          )}
        </div>

        {isSearching && (
          <p style={styles.searchInfo}>“{search}” 검색 중</p>
        )}
      </section>

      <section>
        <h2 style={styles.sectionTitle}>회원 목록</h2>

        {filteredMembers.length === 0 ? (
          <p style={styles.muted}>
            {isSearching ? "검색 결과가 없습니다." : "회원이 없습니다."}
          </p>
        ) : (
          filteredMembers.map((member) => {
            const visitWarning = needsVisitWarning(member);
            const ptWarning = member.pt_remaining <= 3;

            return (
              <article key={member.id} style={styles.card}>
                {editingId === member.id ? (
                  <div style={styles.editBox}>
                    <h3 style={styles.editTitle}>회원 정보 수정</h3>

                    <label style={styles.label}>이름</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={styles.input}
                    />

                    <label style={styles.label}>전화번호</label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      style={styles.input}
                    />

                    <div style={styles.editActions}>
                      <button onClick={() => saveEdit(member.id)} style={styles.primaryButton}>
                        저장
                      </button>
                      <button onClick={() => setEditingId(null)} style={styles.cancelButton}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div onClick={() => openDetail(member)} style={styles.memberMain}>
                      <h3 style={styles.memberName}>{member.name}</h3>
                      <p style={styles.phone}>{member.phone || "전화번호 없음"}</p>
                      <p style={styles.visit}>최근 출석: {formatDate(member.latest_visit)}</p>

                      <div style={styles.warningRow}>
                        {ptWarning && <span style={styles.ptBadge}>재등록 필요</span>}
                        {visitWarning && <span style={styles.visitBadge}>미출석 주의</span>}
                      </div>

                      <p style={styles.hint}>눌러서 상세 출석기록 보기</p>
                    </div>

                    <div style={styles.memberSide}>
                      <div
                        style={{
                          ...styles.ptCount,
                          color: ptWarning ? "#f87171" : "#ffffff",
                        }}
                      >
                        PT {member.pt_remaining}회
                      </div>

                      <div style={styles.buttonGrid}>
                        <button onClick={() => minusPt(member)} style={styles.redButton}>
                          1회 차감
                        </button>
                        <button onClick={() => plusPt(member)} style={styles.whiteButton}>
                          10회 추가
                        </button>
                        <button onClick={() => checkAttendance(member)} style={styles.blueButton}>
                          오늘 운동 체크
                        </button>
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
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #090909 0%, #111 100%)",
    color: "#fff",
    padding: 24,
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 44,
    margin: 0,
    fontWeight: 900,
    letterSpacing: -1,
  },
  subtitle: {
    color: "#a3a3a3",
    marginTop: 8,
    fontSize: 16,
  },
  adminBadge: {
    background: "#1f1f1f",
    border: "1px solid #333",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 700,
    color: "#ddd",
  },
  notice: {
    background: "#272111",
    border: "1px solid #facc15",
    color: "#fde68a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 22,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  noticeButton: {
    background: "#facc15",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 800,
  },
  addBox: {
    background: "#1a1a1a",
    border: "1px solid #272727",
    borderRadius: 28,
    padding: 24,
    marginBottom: 22,
    boxShadow: "0 12px 34px rgba(0,0,0,.28)",
  },
  searchBox: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 24,
    padding: 20,
    marginBottom: 34,
  },
  searchRow: {
    display: "flex",
    gap: 10,
    alignItems: "stretch",
  },
  resetButton: {
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: 14,
    padding: "0 16px",
    fontWeight: 900,
    fontSize: 15,
    whiteSpace: "nowrap",
  },
  searchInfo: {
    marginTop: 10,
    marginBottom: 0,
    fontSize: 14,
    color: "#888",
  },
  sectionTitle: {
    fontSize: 30,
    marginBottom: 18,
    fontWeight: 900,
  },
  label: {
    display: "block",
    color: "#cfcfcf",
    fontSize: 15,
    marginBottom: 8,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: 17,
    borderRadius: 17,
    border: "1px solid #333",
    background: "#f7f7f7",
    color: "#111",
    fontSize: 18,
    boxSizing: "border-box",
    marginBottom: 16,
  },
  primaryButton: {
    width: "100%",
    padding: 17,
    borderRadius: 17,
    border: "none",
    background: "#ffffff",
    color: "#111",
    fontSize: 18,
    fontWeight: 900,
  },
  card: {
    background: "#1c1c1c",
    border: "1px solid #292929",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    boxShadow: "0 10px 28px rgba(0,0,0,.25)",
  },
  memberMain: {
    flex: 1,
    cursor: "pointer",
  },
  memberName: {
    fontSize: 32,
    margin: 0,
    marginBottom: 10,
    fontWeight: 900,
  },
  phone: {
    color: "#b3b3b3",
    fontSize: 19,
    margin: 0,
    marginBottom: 8,
  },
  visit: {
    color: "#93c5fd",
    fontSize: 16,
    margin: 0,
  },
  warningRow: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  ptBadge: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 800,
  },
  visitBadge: {
    background: "#33270a",
    color: "#fde68a",
    border: "1px solid #854d0e",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 800,
  },
  hint: {
    color: "#666",
    fontSize: 13,
    marginTop: 8,
  },
  memberSide: {
    minWidth: 210,
    textAlign: "right",
  },
  ptCount: {
    fontSize: 34,
    fontWeight: 900,
    marginBottom: 16,
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  redButton: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
  },
  whiteButton: {
    background: "#fff",
    color: "#111",
    border: "none",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
  },
  blueButton: {
    gridColumn: "1 / 3",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "14px",
    fontSize: 16,
    fontWeight: 900,
  },
  darkButton: {
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
  },
  deleteButton: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
  },
  editBox: {
    width: "100%",
  },
  editTitle: {
    fontSize: 26,
    marginTop: 0,
    marginBottom: 18,
  },
  editActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  cancelButton: {
    padding: 17,
    borderRadius: 17,
    border: "1px solid #444",
    background: "#111",
    color: "#fff",
    fontSize: 18,
    fontWeight: 900,
  },
  detailBox: {
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 28,
    padding: 24,
    marginBottom: 30,
  },
  detailTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  detailName: {
    fontSize: 34,
    margin: 0,
    marginBottom: 8,
  },
  muted: {
    color: "#aaa",
    margin: 0,
    marginBottom: 8,
  },
  detailPt: {
    fontSize: 22,
    fontWeight: 900,
  },
  closeButton: {
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 900,
  },
  subTitle: {
    fontSize: 24,
    marginTop: 22,
    marginBottom: 14,
  },
  logItem: {
    background: "#222",
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  logDate: {
    fontSize: 16,
    color: "#eee",
  },
  cancelText: {
    color: "#fca5a5",
    fontSize: 13,
    marginTop: 4,
  },
  smallDanger: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 800,
  },
};
