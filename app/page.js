"use client";

import { useState } from "react";

export default function Page() {
  const [members, setMembers] = useState([
    { name: "김민수", pt: 8 },
    { name: "박지훈", pt: 2 },
  ]);

  const addMember = () => {
    setMembers([...members, { name: "신규회원", pt: 10 }]);
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", background: "#111", minHeight: "100vh", color: "white" }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 20 }}>Spotainer</h1>

      <div style={{ display: "grid", gap: 12 }}>
        {members.map((member, index) => (
          <div
            key={index}
            style={{
              background: "#1f1f1f",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{member.name}</span>
            <span style={{ color: member.pt <= 3 ? "#f87171" : "white" }}>PT {member.pt}회</span>
          </div>
        ))}
      </div>

      <button
        onClick={addMember}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "none",
          background: "white",
          color: "black",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        회원 추가
      </button>
    </main>
  );
}
