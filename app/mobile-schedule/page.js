"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const timeOptions = [
  "06:00", "07:00", "08:00", "09:00", "10:00",
  "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00",
  "21:00", "22:00",
];

const typeOptions = [
  { value: "pt", label: "PT" },
  { value: "ot", label: "OT" },
  { value: "consult", label: "상담" },
];

function formatDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatKoreanDate(date) {
  const yoil = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${yoil}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addOneHour(time) {
  const [h, m] = time.split(":").map(Number);
  const endHour = String((h + 1) % 24).padStart(2, "0");
  return `${endHour}:${String(m).padStart(2, "0")}`;
}

function getMemberPt(member) {
  return (
    member?.pt_remaining ??
    member?.remaining_pt ??
    member?.pt_count ??
    member?.pt_total ??
    "-"
  );
}

export default function MobileSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateText = useMemo(() => formatDate(selectedDate), [selectedDate]);

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const [todaySchedules, setTodaySchedules] = useState([]);
  const [memberSchedules, setMemberSchedules] = useState([]);

  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("pt");
  const [memo, setMemo] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    loadDaySchedules();
  }, [selectedDateText]);

  useEffect(() => {
    if (!selectedMember) return;
    loadMemberSchedules(selectedMember.id);
  }, [selectedMember]);

  async function loadDaySchedules() {
    setLoading(true);

    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("schedule_date", selectedDateText)
      .order("start_time", { ascending: true });

    if (error) {
      console.error(error);
      alert("일정을 불러오지 못했어요.");
      setTodaySchedules([]);
      setLoading(false);
      return;
    }

    const validSchedules = (data || []).filter((item) => item.status !== "cancelled");

    const memberIds = [...new Set(validSchedules.map((s) => s.member_id).filter(Boolean))];

    let memberMap = {};
    if (memberIds.length > 0) {
      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .in("id", memberIds);

      memberMap = (memberData || []).reduce((acc, member) => {
        acc[member.id] = member;
        return acc;
      }, {});
    }

    const merged = validSchedules.map((s) => ({
      ...s,
      member: memberMap[s.member_id] || null,
    }));

    setTodaySchedules(merged);
    setLoading(false);
  }

  async function searchMembers() {
    const keyword = search.trim();

    if (!keyword) {
      setMembers([]);
      return;
    }

    const safeKeyword = keyword.replaceAll(",", " ");

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .or(`name.ilike.%${safeKeyword}%,phone.ilike.%${safeKeyword}%`)
      .limit(20);

    if (error) {
      console.error(error);
      alert("회원 검색 중 오류가 났어요.");
      return;
    }

    setMembers(data || []);
  }

  async function loadMemberSchedules(memberId) {
    const today = formatDate(new Date());

    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("member_id", memberId)
      .gte("schedule_date", today)
      .order("schedule_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(10);

    if (error) {
      console.error(error);
      setMemberSchedules([]);
      return;
    }

    setMemberSchedules((data || []).filter((item) => item.status !== "cancelled"));
  }

  async function saveSchedule() {
    if (!selectedMember) {
      alert("회원을 먼저 선택해주세요.");
      return;
    }

    if (!selectedTime) {
      alert("시간을 선택해주세요.");
      return;
    }

    setSaving(true);

    const { data: sameTimeData, error: checkError } = await supabase
      .from("schedules")
      .select("*")
      .eq("schedule_date", selectedDateText)
      .eq("start_time", selectedTime);

    if (checkError) {
      console.error(checkError);
      alert("중복 일정 확인 중 오류가 났어요.");
      setSaving(false);
      return;
    }

    const activeSameTime = (sameTimeData || []).filter(
      (item) => item.status !== "cancelled"
    );

    if (activeSameTime.length > 0) {
      alert("이미 같은 시간에 등록된 수업이 있어요.");
      setSaving(false);
      return;
    }

    const payload = {
      member_id: selectedMember.id,
      schedule_date: selectedDateText,
      start_time: selectedTime,
      end_time: addOneHour(selectedTime),
      type: selectedType,
      memo: memo.trim() || null,
    };

    const { error } = await supabase.from("schedules").insert(payload);

    if (error) {
      console.error(error);
      alert("일정 저장에 실패했어요.");
      setSaving(false);
      return;
    }

    alert("일정이 등록되었어요.");

    setSelectedTime("");
    setMemo("");
    await loadDaySchedules();
    await loadMemberSchedules(selectedMember.id);

    setSaving(false);
  }

  function handleSwipeEnd(e) {
    if (touchStartX === null) return;

    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStartX;

    if (Math.abs(diff) > 60) {
      if (diff < 0) {
        setSelectedDate((prev) => addDays(prev, 1));
      } else {
        setSelectedDate((prev) => addDays(prev, -1));
      }
    }

    setTouchStartX(null);
  }

  return (
    <main
      style={styles.page}
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={handleSwipeEnd}
    >
      <section style={styles.header}>
        <button style={styles.arrowButton} onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
          ‹
        </button>

        <div>
          <div style={styles.title}>모바일 일정등록</div>
          <div style={styles.dateText}>{formatKoreanDate(selectedDate)}</div>
          <div style={styles.subText}>좌우 스와이프로 날짜 변경</div>
        </div>

        <button style={styles.arrowButton} onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          ›
        </button>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>오늘 선택 날짜 일정</div>

        {loading ? (
          <div style={styles.emptyText}>불러오는 중...</div>
        ) : todaySchedules.length === 0 ? (
          <div style={styles.emptyText}>등록된 일정이 없어요.</div>
        ) : (
          <div style={styles.scheduleList}>
            {todaySchedules.map((schedule) => (
              <div key={schedule.id} style={styles.scheduleItem}>
                <div style={styles.scheduleTime}>{schedule.start_time}</div>
                <div style={styles.scheduleInfo}>
                  <div style={styles.scheduleName}>
                    {schedule.member?.name || "회원 정보 없음"}
                  </div>
                  <div style={styles.scheduleMeta}>
                    {(schedule.type || "").toUpperCase()} {schedule.memo ? `· ${schedule.memo}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>회원 검색</div>

        <div style={styles.searchRow}>
          <input
            style={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호"
            onKeyDown={(e) => {
              if (e.key === "Enter") searchMembers();
            }}
          />
          <button style={styles.searchButton} onClick={searchMembers}>
            검색
          </button>
        </div>

        {members.length > 0 && (
          <div style={styles.memberList}>
            {members.map((member) => (
              <button
                key={member.id}
                style={{
                  ...styles.memberItem,
                  borderColor: selectedMember?.id === member.id ? "#111827" : "#e5e7eb",
                  background: selectedMember?.id === member.id ? "#f3f4f6" : "#ffffff",
                }}
                onClick={() => setSelectedMember(member)}
              >
                <div style={styles.memberName}>{member.name}</div>
                <div style={styles.memberPhone}>{member.phone || "전화번호 없음"}</div>
                <div style={styles.memberPt}>잔여 PT: {getMemberPt(member)}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedMember && (
        <section style={styles.card}>
          <div style={styles.selectedBox}>
            <div>
              <div style={styles.selectedName}>{selectedMember.name}</div>
              <div style={styles.memberPhone}>{selectedMember.phone || "전화번호 없음"}</div>
            </div>
            <div style={styles.ptBadge}>PT {getMemberPt(selectedMember)}</div>
          </div>

          <div style={styles.cardTitle}>예정 수업</div>

          {memberSchedules.length === 0 ? (
            <div style={styles.emptyText}>예정된 수업이 없어요.</div>
          ) : (
            <div style={styles.scheduleList}>
              {memberSchedules.map((schedule) => (
                <div key={schedule.id} style={styles.memberScheduleItem}>
                  <div style={styles.memberScheduleDate}>{schedule.schedule_date}</div>
                  <div style={styles.memberScheduleDetail}>
                    {schedule.start_time} · {(schedule.type || "").toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.cardTitle}>수업 등록</div>

          <div style={styles.typeGrid}>
            {typeOptions.map((item) => (
              <button
                key={item.value}
                style={{
                  ...styles.typeButton,
                  background: selectedType === item.value ? "#111827" : "#ffffff",
                  color: selectedType === item.value ? "#ffffff" : "#111827",
                }}
                onClick={() => setSelectedType(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={styles.timeGrid}>
            {timeOptions.map((time) => (
              <button
                key={time}
                style={{
                  ...styles.timeButton,
                  background: selectedTime === time ? "#111827" : "#ffffff",
                  color: selectedTime === time ? "#ffffff" : "#111827",
                }}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>

          <textarea
            style={styles.textarea}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 선택사항"
          />

          <button style={styles.saveButton} onClick={saveSchedule} disabled={saving}>
            {saving ? "저장 중..." : "일정 등록하기"}
          </button>
        </section>
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    color: "#111827",
    padding: "14px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#111827",
    color: "#ffffff",
    borderRadius: "18px",
    padding: "16px",
    marginBottom: "14px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "800",
    textAlign: "center",
  },
  dateText: {
    fontSize: "15px",
    fontWeight: "700",
    textAlign: "center",
    marginTop: "6px",
  },
  subText: {
    fontSize: "12px",
    opacity: 0.75,
    textAlign: "center",
    marginTop: "4px",
  },
  arrowButton: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: "32px",
    lineHeight: "32px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "14px",
    marginBottom: "14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "800",
    marginBottom: "10px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#6b7280",
    padding: "8px 0",
  },
  scheduleList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  scheduleItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "14px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  scheduleTime: {
    fontSize: "16px",
    fontWeight: "900",
    minWidth: "58px",
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: "15px",
    fontWeight: "800",
  },
  scheduleMeta: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "3px",
  },
  searchRow: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    height: "46px",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    padding: "0 12px",
    fontSize: "16px",
    outline: "none",
  },
  searchButton: {
    width: "72px",
    border: "none",
    borderRadius: "14px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
  },
  memberList: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  memberItem: {
    textAlign: "left",
    border: "2px solid #e5e7eb",
    borderRadius: "16px",
    padding: "12px",
  },
  memberName: {
    fontSize: "16px",
    fontWeight: "900",
  },
  memberPhone: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
  },
  memberPt: {
    fontSize: "13px",
    fontWeight: "700",
    marginTop: "4px",
  },
  selectedBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "12px",
    marginBottom: "14px",
  },
  selectedName: {
    fontSize: "18px",
    fontWeight: "900",
  },
  ptBadge: {
    background: "#111827",
    color: "#ffffff",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "900",
  },
  memberScheduleItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    borderRadius: "14px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  memberScheduleDate: {
    fontSize: "13px",
    fontWeight: "800",
  },
  memberScheduleDetail: {
    fontSize: "13px",
    color: "#374151",
    fontWeight: "700",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginBottom: "12px",
  },
  typeButton: {
    height: "44px",
    borderRadius: "14px",
    border: "1px solid #111827",
    fontSize: "15px",
    fontWeight: "900",
  },
  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "12px",
  },
  timeButton: {
    height: "42px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontWeight: "800",
  },
  textarea: {
    width: "100%",
    minHeight: "72px",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    padding: "12px",
    fontSize: "15px",
    resize: "none",
    boxSizing: "border-box",
    outline: "none",
    marginBottom: "12px",
  },
  saveButton: {
    width: "100%",
    height: "52px",
    border: "none",
    borderRadius: "16px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "900",
  },
};
