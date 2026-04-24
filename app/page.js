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
  const [summaryModal, setSummaryModal] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [ptLogList, setPtLogList] = useState([]);
  const [ptModalMember, setPtModalMember] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*, attendance_logs(visited_at,is_cancelled,cancelled_at), pt_logs(type,amount,is_cancelled)")
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((m) => {
      const validLogs = (m.attendance_logs || []).filter((l) => !l.is_cancelled);
      const latest = validLogs.map((l) => l.visited_at).sort().reverse()[0];

      const validPtLogs = (m.pt_logs || []).filter((l) => !l.is_cancelled);
      const used = validPtLogs
        .filter((l) => l.type === "use")
        .reduce((sum, l) => sum + l.amount, 0);

      return {
        ...m,
        latest_visit: latest || null,
        pt_used: used,
        pt_total: (m.pt_remaining || 0) + used,
      };
    });

    setMembers(formatted);
  }

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
    return Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function getPtStatus(member) {
    const pt = member.pt_remaining || 0;
    if (pt <= 2) return { text: "강한 경고", style: styles.dangerBadge };
    if (pt >= 3 && pt <= 5) return { text: "재등록 상담", style: styles.ptBadge };
    return null;
  }

  function getVisitStatus(member) {
    const days = daysSince(member.latest_visit);
    if (days === null) return { text: "출석 기록 없음", style: styles.visitBadge };
    if (days >= 30) return { text: "휴면 위험", style: styles.dangerBadge };
    if (days >= 14) return { text: "연락 필요", style: styles.visitBadge };
    if (days >= 7) return { text: "미출석 주의", style: styles.visitBadge };
    return null;
  }

  const summaryGroups = {
    rejoin: members.filter((m) => {
      const pt = m.pt_remaining || 0;
      return pt >= 3 && pt <= 5;
    }),
    urgent: members.filter((m) => {
      const pt = m.pt_remaining || 0;
      return pt <= 2;
    }),
    dormant: members.filter((m) => {
      const d = daysSince(m.latest_visit);
      return d === null || d >= 14;
    }),
  };

  const summaryConfig = {
    rejoin: {
      title: "재등록 상담",
      desc: "PT 3~5회 남은 회원",
      list: summaryGroups.rejoin,
    },
    urgent: {
      title: "강한 경고",
      desc: "PT 0~2회 남은 회원",
      list: summaryGroups.urgent,
    },
    dormant: {
      title: "연락 필요",
      desc: "출석 기록 없음 또는 14일 이상 미출석 회원",
      list: summaryGroups.dormant,
    },
  };

  async function addMember() {
    if (!name.trim()) return alert("이름을 입력하세요.");

    await supabase.from("members").insert({
      name: name.trim(),
      phone: phone.trim(),
      age: age ? Number(age) : null,
      pt_remaining: 0,
    });

    setName("");
    setPhone("");
    setAge("");
    setSearch("");
    setShowAddModal(false);
    loadMembers();
  }

  function startEdit(member) {
    setEditingId(member.id);
    setEditName(member.name);
    setEditPhone(member.phone || "");
    setEditAge(member.age || "");
  }

  async function saveEdit(id) {
    if (!editName.trim()) return alert("이름을 입력하세요.");

    await supabase
      .from("members")
      .update({
        name: editName.trim(),
        phone: editPhone.trim(),
        age: editAge ? Number(editAge) : null,
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

    const { error } = await supabase
      .from("members")
      .update({ pt_remaining: before - 1 })
      .eq("id", member.id);

    if (error) return alert("PT 차감 실패: " + error.message);

    await supabase.from("pt_logs").insert({
      member_id: member.id,
      type: "use",
      amount: 1,
    });

    setLastAction({
      type: "pt",
      memberId: member.id,
      previousPt: before,
      memberName: member.name,
    });

    loadMembers();
  }

  async function addPt(member, amount) {
    const { error } = await supabase
      .from("members")
      .update({ pt_remaining: member.pt_remaining + amount })
      .eq("id", member.id);

    if (error) return alert("이용권 추가 실패: " + error.message);

    await supabase.from("pt_logs").insert({
      member_id: member.id,
      type: "add",
      amount,
    });

    setPtModalMember(null);
    loadMembers();
  }

  async function cancelPtUse(log) {
    if (!confirm("이 PT 차감 기록을 취소할까요?")) return;

    const { data: member } = await supabase
      .from("members")
      .select("pt_remaining")
      .eq("id", log.member_id)
      .single();

    await supabase
      .from("members")
      .update({ pt_remaining: (member?.pt_remaining || 0) + log.amount })
      .eq("id", log.member_id);

    await supabase
      .from("pt_logs")
      .update({
        is_cancelled: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", log.id);

    openDetail(selectedMember);
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

    const { data: attendanceData } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("member_id", member.id)
      .order("visited_at", { ascending: false });

    const { data: ptData } = await supabase
      .from("pt_logs")
      .select("*")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false });

    setAttendanceList(attendanceData || []);
    setPtLogList(ptData || []);
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

  function getPtSummary(member, logs) {
    const validLogs = (logs || []).filter((l) => !l.is_cancelled);

    const used = validLogs
      .filter((l) => l.type === "use")
      .reduce((sum, l) => sum + l.amount, 0);

    const remain = member?.pt_remaining || 0;
    const total = remain + used;

    return { total, used, remain };
  }

  function renderSummaryMember(member) {
    const d = daysSince(member.latest_visit);

    return (
      <div key={member.id} style={styles.summaryMemberRow}>
        <div>
          <strong>{member.name}</strong>
          <p style={styles.summaryMemberInfo}>
            PT {member.pt_remaining || 0}회 남음 · 최근 출석:{" "}
            {member.latest_visit ? `${formatDate(member.latest_visit)} (${d}일 전)` : "없음"}
          </p>
          <p style={styles.summaryMemberInfo}>{member.phone || "전화번호 없음"}</p>
        </div>

        <button
          onClick={() => {
            setSummaryModal(null);
            openDetail(member);
          }}
          style={styles.smallDark}
        >
          상세
        </button>
      </div>
    );
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

      <section style={styles.summaryBox}>
        <button onClick={() => setSummaryModal("rejoin")} style={styles.summaryCard}>
          <strong>재등록 상담</strong>
          <p>{summaryGroups.rejoin.length}명</p>
        </button>
        <button onClick={() => setSummaryModal("urgent")} style={styles.summaryCard}>
          <strong>강한 경고</strong>
          <p>{summaryGroups.urgent.length}명</p>
        </button>
        <button onClick={() => setSummaryModal("dormant")} style={styles.summaryCard}>
          <strong>연락 필요</strong>
          <p>{summaryGroups.dormant.length}명</p>
        </button>
      </section>

      {summaryModal && (
        <div style={styles.modalOverlay}>
          <section style={styles.modalBox}>
            <div style={styles.detailTop}>
              <div>
                <h2 style={styles.modalTitle}>{summaryConfig[summaryModal].title}</h2>
                <p style={styles.muted}>{summaryConfig[summaryModal].desc}</p>
              </div>
              <button onClick={() => setSummaryModal(null)} style={styles.closeButton}>
                닫기
              </button>
            </div>

            {summaryConfig[summaryModal].list.length === 0 ? (
              <p style={styles.muted}>해당 회원이 없습니다.</p>
            ) : (
              summaryConfig[summaryModal].list.map(renderSummaryMember)
            )}
          </section>
        </div>
      )}

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <section style={styles.modalBox}>
            <div style={styles.detailTop}>
              <h2 style={styles.modalTitle}>회원 추가</h2>
              <button onClick={() => setShowAddModal(false)} style={styles.closeButton}>
                닫기
              </button>
            </div>

            <label style={styles.label}>이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 홍길동" style={styles.input} />

            <label style={styles.label}>전화번호</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="예: 01012345678" style={styles.input} />

            <label style={styles.label}>나이</label>
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="예: 32" type="number" style={styles.input} />

            <div style={styles.editActions}>
              <button onClick={addMember} style={styles.primaryButton}>저장</button>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelButton}>취소</button>
            </div>
          </section>
        </div>
      )}

      {selectedMember && (
        <div style={styles.modalOverlay}>
          <section style={styles.modalBox}>
            <div style={styles.detailTop}>
              <div>
                <h2 style={styles.detailName}>{selectedMember.name}</h2>
                <p style={styles.muted}>
                  {selectedMember.age ? `${selectedMember.age}세 · ` : ""}
                  {selectedMember.phone || "전화번호 없음"}
                </p>

                {(() => {
                  const pt = getPtSummary(selectedMember, ptLogList);
                  return (
                    <p style={styles.detailPt}>
                      총 {pt.total}회 중 {pt.used}회 사용 / {pt.remain}회 남음
                    </p>
                  );
                })()}
              </div>

              <button onClick={() => setSelectedMember(null)} style={styles.closeButton}>닫기</button>
            </div>

            <h3 style={styles.subTitle}>PT 사용 기록</h3>

            {ptLogList.filter((log) => log.type === "use").length === 0 ? (
              <p style={styles.muted}>PT 사용 기록이 없습니다.</p>
            ) : (
              ptLogList.filter((log) => log.type === "use").map((log) => (
                <div key={log.id} style={{ ...styles.logItem, opacity: log.is_cancelled ? 0.45 : 1 }}>
                  <div>
                    <div style={styles.logDate}>{formatDateTime(log.created_at)} · {log.amount}회 사용</div>
                    {log.is_cancelled && <div style={styles.cancelText}>취소됨</div>}
                  </div>

                  {!log.is_cancelled && (
                    <button onClick={() => cancelPtUse(log)} style={styles.smallDanger}>차감 취소</button>
                  )}
                </div>
              ))
            )}

            <h3 style={styles.subTitle}>출석 기록</h3>

            {attendanceList.length === 0 ? (
              <p style={styles.muted}>출석 기록이 없습니다.</p>
            ) : (
              attendanceList.map((log) => (
                <div key={log.id} style={{ ...styles.logItem, opacity: log.is_cancelled ? 0.45 : 1 }}>
                  <div>
                    <div style={styles.logDate}>{formatDateTime(log.visited_at)}</div>
                    {log.is_cancelled && <div style={styles.cancelText}>취소됨</div>}
                  </div>

                  {!log.is_cancelled && (
                    <button onClick={() => cancelAttendance(log)} style={styles.smallDanger}>출석 취소</button>
                  )}
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {ptModalMember && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2 style={styles.modalTitle}>{ptModalMember.name} 이용권 추가</h2>
            <p style={styles.muted}>추가할 PT 회차를 선택하세요.</p>

            <div style={styles.ptOptionGrid}>
              {ptOptions.map((amount) => (
                <button key={amount} onClick={() => addPt(ptModalMember, amount)} style={styles.ptOptionButton}>
                  {amount}회
                </button>
              ))}
            </div>

            <button onClick={() => setPtModalMember(null)} style={styles.cancelButton}>취소</button>
          </div>
        </div>
      )}

      {lastAction && (
        <div style={styles.notice}>
          <span>
            <strong>{lastAction.memberName}</strong>
            {lastAction.type === "pt" ? " PT 1회 차감됨" : " 출석 체크됨"}
          </span>

          {lastAction.type === "pt" && (
            <button onClick={undo} style={styles.noticeButton}>실행 취소</button>
          )}
        </div>
      )}

      <section style={styles.topActionBox}>
        <button onClick={() => setShowAddModal(true)} style={styles.addMemberButton}>
          + 회원 추가
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
            <button onClick={() => setSearch("")} style={styles.resetButton}>초기화</button>
          )}
        </div>

        {isSearching && <p style={styles.searchInfo}>“{search}” 검색 중</p>}
      </section>

      <section>
        <h2 style={styles.sectionTitle}>회원 목록</h2>

        {filteredMembers.length === 0 ? (
          <p style={styles.muted}>{isSearching ? "검색 결과가 없습니다." : "회원이 없습니다."}</p>
        ) : (
          filteredMembers.map((member) => {
            const ptStatus = getPtStatus(member);
            const visitStatus = getVisitStatus(member);

            return (
              <article key={member.id} style={styles.card}>
                {editingId === member.id ? (
                  <div style={styles.editBox}>
                    <h3 style={styles.editTitle}>회원 정보 수정</h3>

                    <label style={styles.label}>이름</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} style={styles.input} />

                    <label style={styles.label}>전화번호</label>
                    <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={styles.input} />

                    <label style={styles.label}>나이</label>
                    <input value={editAge} onChange={(e) => setEditAge(e.target.value)} type="number" style={styles.input} />

                    <div style={styles.editActions}>
                      <button onClick={() => saveEdit(member.id)} style={styles.primaryButton}>저장</button>
                      <button onClick={() => setEditingId(null)} style={styles.cancelButton}>취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div onClick={() => openDetail(member)} style={styles.memberMain}>
                      <h3 style={styles.memberName}>{member.name}</h3>
                      <p style={styles.phone}>
                        {member.age ? `${member.age}세 · ` : ""}
                        {member.phone || "전화번호 없음"}
                      </p>
                      <p style={styles.visit}>최근 출석: {formatDate(member.latest_visit)}</p>

                      <div style={styles.warningRow}>
                        {ptStatus && <span style={ptStatus.style}>{ptStatus.text}</span>}
                        {visitStatus && <span style={visitStatus.style}>{visitStatus.text}</span>}
                      </div>

                      <p style={styles.hint}>눌러서 상세 출석기록 보기</p>
                    </div>

                    <div style={styles.memberSide}>
                      <div
                        style={{
                          ...styles.ptCount,
                          color: (member.pt_remaining || 0) <= 2 ? "#f87171" : "#ffffff",
                        }}
                      >
                        PT {member.pt_remaining}회
                      </div>

                      <div style={styles.buttonGrid}>
                        <button onClick={() => minusPt(member)} style={styles.redButton}>1회 차감</button>
                        <button onClick={() => setPtModalMember(member)} style={styles.whiteButton}>이용권 추가</button>
                        <button onClick={() => checkAttendance(member)} style={styles.blueButton}>출석 체크</button>
                        <button onClick={() => startEdit(member)} style={styles.darkButton}>수정</button>
                        <button onClick={() => deleteMember(member)} style={styles.deleteButton}>삭제</button>
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
  summaryBox: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    textAlign: "center",
  },
  summaryCard: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 16,
    fontWeight: 900,
    padding: 8,
  },
  summaryMemberRow: {
    background: "#222",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  summaryMemberInfo: {
    color: "#aaa",
    margin: "6px 0 0",
    fontSize: 14,
  },
  smallDark: {
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 800,
  },
  topActionBox: {
    marginBottom: 22,
  },
  addMemberButton: {
    width: "100%",
    padding: 18,
    borderRadius: 20,
    border: "none",
    background: "#ffffff",
    color: "#111",
    fontSize: 20,
    fontWeight: 900,
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
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82vh",
    overflowY: "auto",
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  modalTitle: {
    fontSize: 28,
    marginTop: 0,
    marginBottom: 10,
    fontWeight: 900,
  },
  ptOptionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 18,
    marginBottom: 16,
  },
  ptOptionButton: {
    background: "#fff",
    color: "#111",
    border: "none",
    borderRadius: 16,
    padding: "16px 10px",
    fontSize: 18,
    fontWeight: 900,
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
  dangerBadge: {
    background: "#450a0a",
    color: "#fecaca",
    border: "1px solid #991b1b",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 900,
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
