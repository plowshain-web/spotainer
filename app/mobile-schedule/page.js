"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const typeOptions = [
  { value: "pt", label: "PT" },
  { value: "group", label: "그룹PT" },
  { value: "ot", label: "OT" },
  { value: "consult", label: "상담" },
];

function makeTimeOptions() {
  const result = [];
  for (let h = 6; h <= 22; h++) {
    result.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 22) result.push(`${String(h).padStart(2, "0")}:30`);
  }
  return result;
}

const timeOptions = makeTimeOptions();

function formatDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateText) {
  const [y, m, d] = dateText.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatKoreanDate(date) {
  const yoil = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${yoil}`;
}

function formatKoreanDateText(dateText) {
  return formatKoreanDate(parseLocalDate(dateText));
}

function formatTime(time) {
  if (!time) return "";
  return String(time).slice(0, 5);
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

function getTypeLabel(type, memo) {
  if (type === "group" || type === "group_pt" || memo?.includes("그룹PT")) {
    return "그룹PT";
  }
  if (type === "pt") return "PT";
  if (type === "ot") return "OT";
  if (type === "consult") return "상담";
  return type || "-";
}

function sendSms(phone, message) {
  if (!phone) {
    alert("전화번호가 없어요.");
    return;
  }

  const cleanPhone = String(phone).replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  window.location.href = `sms:${cleanPhone}?body=${encodedMessage}`;
}

export default function MobileSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateText = useMemo(() => formatDate(selectedDate), [selectedDate]);

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [daySchedules, setDaySchedules] = useState([]);
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
    loadSelectedMemberSchedules();
  }, [selectedMembers]);

  const groupedDaySchedules = useMemo(() => {
    const map = {};

    daySchedules.forEach((schedule) => {
      const isGroup =
        schedule.type === "group" ||
        schedule.type === "group_pt" ||
        schedule.memo?.includes("그룹PT");

      const key = isGroup
        ? `${schedule.schedule_date}-${formatTime(schedule.start_time)}-group`
        : `${schedule.id}`;

      if (!map[key]) {
        map[key] = {
          start_time: schedule.start_time,
          type: isGroup ? "group" : schedule.type,
          memo: schedule.memo,
          names: [],
          phones: [],
        };
      }

      map[key].names.push(schedule.member?.name || "회원 정보 없음");
      if (schedule.member?.phone) map[key].phones.push(schedule.member.phone);
    });

    return Object.values(map).sort((a, b) =>
      String(a.start_time).localeCompare(String(b.start_time))
    );
  }, [daySchedules]);

  const bookedTimeMap = useMemo(() => {
    const map = {};
    daySchedules.forEach((schedule) => {
      const key = formatTime(schedule.start_time);
      if (!map[key]) map[key] = [];
      map[key].push(schedule.member?.name || "예약 있음");
    });
    return map;
  }, [daySchedules]);

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
      setDaySchedules([]);
      setLoading(false);
      return;
    }

    const activeSchedules = (data || []).filter((item) => item.status !== "cancelled");
    const memberIds = [...new Set(activeSchedules.map((s) => s.member_id).filter(Boolean))];

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

    setDaySchedules(
      activeSchedules.map((s) => ({
        ...s,
        member: memberMap[s.member_id] || null,
      }))
    );

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

  function toggleMember(member) {
    const exists = selectedMembers.some((m) => m.id === member.id);

    if (exists) {
      setSelectedMembers((prev) => prev.filter((m) => m.id !== member.id));
      return;
    }

    if (selectedType !== "group" && selectedMembers.length >= 1) {
      setSelectedMembers([member]);
      return;
    }

    if (selectedType === "group" && selectedMembers.length >= 3) {
      alert("그룹PT는 최대 3명까지만 선택할 수 있어요.");
      return;
    }

    setSelectedMembers((prev) => [...prev, member]);
  }

  async function loadSelectedMemberSchedules() {
    if (selectedMembers.length === 0) {
      setMemberSchedules([]);
      return;
    }

    const today = formatDate(new Date());
    const ids = selectedMembers.map((m) => m.id);

    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .in("member_id", ids)
      .gte("schedule_date", today)
      .order("schedule_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(20);

    if (error) {
      console.error(error);
      setMemberSchedules([]);
      return;
    }

    const activeSchedules = (data || []).filter((item) => item.status !== "cancelled");

    setMemberSchedules(
      activeSchedules.map((schedule) => ({
        ...schedule,
        member: selectedMembers.find((m) => m.id === schedule.member_id),
      }))
    );
  }

  async function saveSchedule() {
    if (selectedMembers.length === 0) {
      alert("회원을 먼저 선택해주세요.");
      return;
    }

    if (!selectedTime) {
      alert("시간을 선택해주세요.");
      return;
    }

    if (selectedType !== "group" && selectedMembers.length > 1) {
      alert("일반 PT/OT/상담은 회원 1명만 선택해주세요.");
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

    const isGroup = selectedType === "group";
    const groupMemo = isGroup
      ? `[그룹PT] ${memo.trim()}`.trim()
      : memo.trim() || null;

    const payload = selectedMembers.map((member) => ({
      member_id: member.id,
      schedule_date: selectedDateText,
      start_time: selectedTime,
      end_time: addOneHour(selectedTime),
      type: isGroup ? "group" : selectedType,
      memo: groupMemo || null,
    }));

    const { error } = await supabase.from("schedules").insert(payload);

    if (error) {
      console.error(error);
      alert("일정 저장에 실패했어요.");
      setSaving(false);
      return;
    }

    alert("일정이 등록되었어요.");

    const message = `${formatKoreanDate(selectedDate)} ${selectedTime} 수업으로 예약해드렸어요.`;

    selectedMembers.forEach((member) => {
      console.log(`${member.name} 문자 내용: ${message}`);
    });

    setSelectedTime("");
    setMemo("");
    await loadDaySchedules();
    await loadSelectedMemberSchedules();

    setSaving(false);
  }

  function handleTypeChange(value) {
    setSelectedType(value);

    if (value !== "group" && selectedMembers.length > 1) {
      setSelectedMembers(selectedMembers.slice(0, 1));
    }
  }

  function handleDateInputChange(value) {
    if (!value) return;
    setSelectedDate(parseLocalDate(value));
    setSelectedTime("");
  }

  function handleSwipeEnd(e) {
    if (touchStartX === null) return;

    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStartX;

    if (Math.abs(diff) > 60) {
      if (diff < 0) setSelectedDate((prev) => addDays(prev, 1));
      else setSelectedDate((prev) => addDays(prev, -1));

      setSelectedTime("");
    }

    setTouchStartX(null);
  }

  function sendSelectedScheduleSms(member) {
    if (!selectedTime) {
      alert("시간을 먼저 선택해주세요.");
      return;
    }

    const typeLabel = getTypeLabel(selectedType, selectedType === "group" ? "그룹PT" : "");
    const message = `${member.name}님 ${formatKoreanDate(selectedDate)} ${selectedTime} ${typeLabel} 수업으로 예약해드렸어요.`;
    sendSms(member.phone, message);
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

        <div style={styles.headerCenter}>
          <div style={styles.title}>모바일 일정등록</div>
          <div style={styles.dateText}>{formatKoreanDate(selectedDate)}</div>
          <input
            style={styles.dateInput}
            type="date"
            value={selectedDateText}
            onChange={(e) => handleDateInputChange(e.target.value)}
          />
          <div style={styles.quickRow}>
            <button style={styles.quickButton} onClick={() => setSelectedDate(new Date())}>
              오늘
            </button>
            <button style={styles.quickButton} onClick={() => setSelectedDate(addDays(new Date(), 1))}>
              내일
            </button>
          </div>
        </div>

        <button style={styles.arrowButton} onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          ›
        </button>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>선택 날짜 일정</div>

        {loading ? (
          <div style={styles.emptyText}>불러오는 중...</div>
        ) : groupedDaySchedules.length === 0 ? (
          <div style={styles.emptyText}>등록된 일정이 없어요.</div>
        ) : (
          <div style={styles.scheduleList}>
            {groupedDaySchedules.map((schedule, index) => (
              <div key={`${schedule.start_time}-${index}`} style={styles.scheduleItem}>
                <div style={styles.scheduleTime}>{formatTime(schedule.start_time)}</div>
                <div style={styles.scheduleInfo}>
                  <div style={styles.scheduleName}>{schedule.names.join(", ")}</div>
                  <div style={styles.scheduleMeta}>
                    {getTypeLabel(schedule.type, schedule.memo)}
                    {schedule.memo ? ` · ${schedule.memo.replace("[그룹PT]", "").trim()}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>수업 종류</div>

        <div style={styles.typeGrid}>
          {typeOptions.map((item) => (
            <button
              key={item.value}
              style={{
                ...styles.typeButton,
                background: selectedType === item.value ? "#111827" : "#ffffff",
                color: selectedType === item.value ? "#ffffff" : "#111827",
              }}
              onClick={() => handleTypeChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>
          회원 검색 {selectedType === "group" ? `(${selectedMembers.length}/3명 선택)` : ""}
        </div>

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

        {selectedMembers.length > 0 && (
          <div style={styles.selectedChipWrap}>
            {selectedMembers.map((member) => (
              <button
                key={member.id}
                style={styles.selectedChip}
                onClick={() => toggleMember(member)}
              >
                {member.name} ✕
              </button>
            ))}
          </div>
        )}

        {members.length > 0 && (
          <div style={styles.memberList}>
            {members.map((member) => {
              const checked = selectedMembers.some((m) => m.id === member.id);

              return (
                <button
                  key={member.id}
                  style={{
                    ...styles.memberItem,
                    borderColor: checked ? "#111827" : "#e5e7eb",
                    background: checked ? "#f3f4f6" : "#ffffff",
                  }}
                  onClick={() => toggleMember(member)}
                >
                  <div style={styles.memberTopRow}>
                    <div>
                      <div style={styles.memberName}>{member.name}</div>
                      <div style={styles.memberPhone}>{member.phone || "전화번호 없음"}</div>
                    </div>
                    <div style={styles.memberPt}>PT {getMemberPt(member)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedMembers.length > 0 && (
        <section style={styles.card}>
          <div style={styles.cardTitle}>선택 회원 예정 수업</div>

          {memberSchedules.length === 0 ? (
            <div style={styles.emptyText}>예정된 수업이 없어요.</div>
          ) : (
            <div style={styles.scheduleList}>
              {memberSchedules.map((schedule) => (
                <div key={schedule.id} style={styles.memberScheduleItem}>
                  <div>
                    <div style={styles.memberScheduleName}>
                      {schedule.member?.name || "회원"}
                    </div>
                    <div style={styles.memberScheduleDate}>
                      {formatKoreanDateText(schedule.schedule_date)}
                    </div>
                  </div>
                  <div style={styles.memberScheduleDetail}>
                    {formatTime(schedule.start_time)} · {getTypeLabel(schedule.type, schedule.memo)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedMembers.length > 0 && (
        <section style={styles.card}>
          <div style={styles.cardTitle}>수업 등록</div>

          <div style={styles.timeGrid}>
            {timeOptions.map((time) => {
              const bookedNames = bookedTimeMap[time] || [];
              const disabled = bookedNames.length > 0;

              return (
                <button
                  key={time}
                  disabled={disabled}
                  style={{
                    ...styles.timeButton,
                    background: disabled
                      ? "#e5e7eb"
                      : selectedTime === time
                      ? "#111827"
                      : "#ffffff",
                    color: disabled
                      ? "#9ca3af"
                      : selectedTime === time
                      ? "#ffffff"
                      : "#111827",
                    borderColor: disabled ? "#e5e7eb" : "#d1d5db",
                  }}
                  onClick={() => {
                    if (!disabled) setSelectedTime(time);
                  }}
                >
                  <div>{time}</div>
                  {disabled && (
                    <div style={styles.bookedName}>
                      {bookedNames.slice(0, 2).join(", ")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <textarea
            style={styles.textarea}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 선택사항"
          />

          {selectedTime && (
            <div style={styles.smsBox}>
              <div style={styles.smsTitle}>문자 보내기</div>
              {selectedMembers.map((member) => (
                <button
                  key={member.id}
                  style={styles.smsButton}
                  onClick={() => sendSelectedScheduleSms(member)}
                >
                  {member.name}님에게 예약 문자
                </button>
              ))}
            </div>
          )}

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
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#111827",
    color: "#ffffff",
    borderRadius: "18px",
    padding: "14px",
    marginBottom: "14px",
  },
  headerCenter: {
    flex: 1,
    padding: "0 10px",
    textAlign: "center",
  },
  title: {
    fontSize: "18px",
    fontWeight: "900",
  },
  dateText: {
    fontSize: "18px",
    fontWeight: "900",
    marginTop: "6px",
  },
  dateInput: {
    marginTop: "10px",
    width: "100%",
    height: "40px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: "15px",
    padding: "0 10px",
    boxSizing: "border-box",
  },
  quickRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "8px",
  },
  quickButton: {
    height: "34px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "800",
  },
  arrowButton: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: "30px",
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
    fontWeight: "900",
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
    fontWeight: "900",
  },
  scheduleMeta: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "3px",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  },
  typeButton: {
    height: "44px",
    borderRadius: "14px",
    border: "1px solid #111827",
    fontSize: "14px",
    fontWeight: "900",
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
    fontWeight: "900",
  },
  selectedChipWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  selectedChip: {
    border: "none",
    borderRadius: "999px",
    background: "#111827",
    color: "#ffffff",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "900",
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
  memberTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
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
    background: "#f3f4f6",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "13px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },
  memberScheduleItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    padding: "10px",
    borderRadius: "14px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  memberScheduleName: {
    fontSize: "14px",
    fontWeight: "900",
  },
  memberScheduleDate: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "3px",
  },
  memberScheduleDetail: {
    fontSize: "13px",
    color: "#374151",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "12px",
  },
  timeButton: {
    minHeight: "48px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontWeight: "900",
  },
  bookedName: {
    fontSize: "10px",
    fontWeight: "700",
    marginTop: "2px",
    lineHeight: "1.1",
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
  smsBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "10px",
    marginBottom: "12px",
  },
  smsTitle: {
    fontSize: "14px",
    fontWeight: "900",
    marginBottom: "8px",
  },
  smsButton: {
    width: "100%",
    height: "42px",
    border: "none",
    borderRadius: "12px",
    background: "#374151",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "900",
    marginBottom: "6px",
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
