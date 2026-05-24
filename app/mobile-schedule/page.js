"use client";

import { useEffect, useState } from "react";

export default function MobileSchedulePage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    setSelectedDate(`${yyyy}.${mm}.${dd}.`);

    // 기존 모바일 일정 샘플
    setSchedules([
      {
        id: 1,
        time: "오후 2:30 ~ 오후 3:30",
        member: "김주현",
        pt: "PT 66회",
        memo: "전신",
      },
      {
        id: 2,
        time: "오후 4:00 ~ 오후 5:00",
        member: "이다희",
        pt: "PT 8회",
        memo: "전신",
      },
    ]);
  }, []);

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#091226",
          borderRadius: "24px",
          padding: "24px",
          color: "white",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          모바일 일정등록
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "20px",
          }}
        >
          2026년 5월 25일 월
        </div>

        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            width: "100%",
            height: "70px",
            borderRadius: "18px",
            border: "none",
            padding: "0 20px",
            fontSize: "28px",
          }}
        >
          <option>{selectedDate}</option>
        </select>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "20px",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "24px",
          }}
        >
          선택 날짜 일정
        </div>

        {schedules.map((item) => (
          <div
            key={item.id}
            style={{
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "24px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              {item.time}
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              PT · {item.member}
            </div>

            <div
              style={{
                fontSize: "22px",
                color: "#777",
                marginBottom: "20px",
              }}
            >
              {item.pt}
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "18px",
                padding: "18px",
                fontSize: "24px",
                marginBottom: "20px",
              }}
            >
              {item.memo}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <button
                style={{
                  background: "black",
                  color: "white",
                  border: "none",
                  borderRadius: "18px",
                  padding: "16px 28px",
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                문자
              </button>

              <button
                style={{
                  background: "#8b5e3c",
                  color: "white",
                  border: "none",
                  borderRadius: "18px",
                  padding: "16px 28px",
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                캘린더 저장
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
