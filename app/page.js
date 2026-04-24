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
    loadMembers();
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
            <span style={styles.undoText}> PT 1회 차감됨</span>
          </div>
          <button onClick={undo} style={styles.undoButton}>실행 취소</button>
        </div>
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
                <div>
                  <div style={styles.memberName}>{member.name}</div>
                  <div style={styles.phone}>{member.phone || "전화번호 없음"}</div>
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
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
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
    boxShadow: "0 8px 24px rgba(0,0,0,.25)",
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
  actions: {
    textAlign: "right",
    minWidth: 170,
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
};
