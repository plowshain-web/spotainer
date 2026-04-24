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
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("last_visit_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!error) setMembers(data || []);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function addMember() {
    if (!name.trim()) return alert("회원 이름을 입력하세요.");

    const { error } = await supabase.from("members").insert({
      name: name.trim(),
      phone: phone.trim(),
      pt_remaining: 0,
    });

    if (error) return alert("회원 추가 실패: " + error.message);

    setName("");
    setPhone("");
    loadMembers();
  }

  async function addPt(member) {
    const { error } = await supabase
      .from("members")
      .update({ pt_remaining: member.pt_remaining + 10 })
      .eq("id", member.id);

    if (error) return alert("PT 추가 실패: " + error.message);
    loadMembers();
  }

  async function usePt(member) {
    if (member.pt_remaining <= 0) return alert("남은 PT가 없습니다.");

    const before = member.pt_remaining;

    const { error } = await supabase
      .from("members")
      .update({
        pt_remaining: before - 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (error) return alert("PT 차감 실패: " + error.message);

    setLastAction({
      type: "pt_deduct",
      memberId: member.id,
      previousPt: before,
      memberName: member.name,
    });

    loadMembers();
  }

  async function undoLastAction() {
    if (!lastAction) return;

    if (lastAction.type === "pt_deduct") {
      const { error } = await supabase
        .from("members")
        .update({ pt_remaining: lastAction.previousPt })
        .eq("id", lastAction.memberId);

      if (error) return alert("실행 취소 실패: " + error.message);

      setLastAction(null);
      loadMembers();
    }
  }

  function startEdit(member) {
    setEditingId(member.id);
    setEditName(member.name);
    setEditPhone(member.phone || "");
  }

  async function saveEdit(memberId) {
    if (!editName.trim()) return alert("회원 이름을 입력하세요.");

    const { error } = await supabase
      .from("members")
      .update({
        name: editName.trim(),
        phone: editPhone.trim(),
      })
      .eq("id", memberId);

    if (error) return alert("수정 실패: " + error.message);

    setEditingId(null);
    setEditName("");
    setEditPhone("");
    loadMembers();
  }

  async function deleteMember(member) {
    const ok = confirm(`${member.name} 회원을 삭제할까요?`);
    if (!ok) return;

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", member.id);

    if (error) return alert("삭제 실패: " + error.message);

    loadMembers();
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Spotainer</h1>

      {lastAction && (
        <div style={styles.undoBox}>
          <span>{lastAction.memberName} PT 1회 차감됨</span>
          <button onClick={undoLastAction} style={styles.undoButton}>
            실행 취소
          </button>
        </div>
      )}

      <section style={styles.panel}>
        <h2 style={styles.sectionTitle}>회원 추가</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="실명"
          style={styles.input}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호"
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
              <div style={{ width: "100%" }}>
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
                <div style={styles.buttonRow}>
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
                <div>
                  <strong style={styles.memberName}>{member.name}</strong>
                  <div style={styles.phone}>{member.phone || "전화번호 없음"}</div>
                </div>

                <div style={styles.rightArea}>
                  <div
                    style={{
                      ...styles.ptText,
                      color: member.pt_remaining <= 3 ? "#f87171" : "white",
                    }}
                  >
                    PT {member.pt_remaining}회
                  </div>

                  <div style={styles.buttonRow}>
                    <button onClick={() => usePt(member)} style={styles.redButton}>
                      1회 차감
                    </button>
                    <button onClick={() => addPt(member)} style={styles.whiteButton}>
                      10회 추가
                    </button>
                  </div>

                  <div style={styles.buttonRow}>
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
    background: "#111",
    color: "white",
    padding: 24,
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: 38,
    marginBottom: 24,
  },
  panel: {
    background: "#1f1f1f",
    padding: 20,
    borderRadius: 22,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 28,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    border: "none",
    fontSize: 18,
  },
  primaryButton: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    border: "none",
    background: "white",
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  card: {
    background: "#1f1f1f",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },
  memberName: {
    fontSize: 26,
  },
  phone: {
    color: "#aaa",
    marginTop: 8,
    fontSize: 18,
  },
  rightArea: {
    textAlign: "right",
    minWidth: 150,
  },
  ptText: {
    fontSize: 24,
    marginBottom: 12,
  },
  buttonRow: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  redButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: "bold",
  },
  whiteButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "white",
    color: "black",
    fontWeight: "bold",
  },
  darkButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #444",
    background: "#111",
    color: "white",
    fontWeight: "bold",
  },
  deleteButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #7f1d1d",
    background: "#3f1111",
    color: "#fca5a5",
    fontWeight: "bold",
  },
  undoBox: {
    background: "#222",
    border: "1px solid #444",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  undoButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#facc15",
    color: "black",
    fontWeight: "bold",
  },
};
