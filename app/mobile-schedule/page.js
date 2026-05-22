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

function formatTime(time) {
  if (!time) return "";
  return String(time).slice(0, 5);
}

function formatAmPm(time) {
  const [h, m] = formatTime(time).split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour}:${String(m).padStart(2, "0")}`;
}

function addOneHour(time) {
  const [h, m] = formatTime(time).split(":").map(Number);
  const endHour = String((h + 1) % 24).padStart(2, "0");
  return `${endHour}:${String(m).padStart(2, "0")}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
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
  if (type === "group" || type === "group_pt" || memo?.includes("그룹PT")) return "그룹PT";
  if (type === "pt") return "PT";
  if (type === "ot") return "OT";
  if (type === "consult") return "상담";
  return type || "-";
}

function isGroupSchedule(schedule) {
  return schedule?.type === "group" || schedule?.type === "group_pt" || schedule?.memo?.includes("그룹PT");
}

function hasSmsDone(memo) {
  return String(memo || "").includes("문자완료");
}

function cleanMemo(memo) {
  return String(memo || "").replace("[그룹PT]", "").replace("[문자완료]", "").trim();
}

function getStatusLabel(status) {
  if (status === "completed") return "완료";
  if (status === "cancelled") return "취소";
  if (status === "noshow") return "노쇼";
  return "예약";
}

function sendSms(phone, message) {
  if (!phone) {
    alert("전화번호가 없어요.");
    return;
  }
  const cleanPhone = String(phone).replace(/[^0-9]/g, "");
  window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
}

function escapeIcsText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toIcsDateTime(dateText, timeText) {
  const [year, month, day] = dateText.split("-").map(Number);
  const [hour, minute] = formatTime(timeText).split(":").map(Number);
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}00`;
}

function downloadCalendarFile(schedule, selectedDateText) {
  const startTime = formatTime(schedule.start_time);
  const endTime = formatTime(schedule.end_time || addOneHour(startTime));
  const typeLabel = getTypeLabel(schedule.type, schedule.memo);
  const names = schedule.names?.join(", ") || "회원";
  const title = `스포테이너 ${typeLabel} - ${names}`;
  const description = `${typeLabel} 수업 10분 전 알림`;
  const uid = `${schedule.ids?.[0] || Date.now()}@spotainer`;
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SPOTAINER//Schedule//KR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsDateTime(selectedDateText, startTime)}`,
    `DTEND:${toIcsDateTime(selectedDateText, endTime)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT10M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(title)} 10분 전`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `spotainer-${selectedDateText}-${startTime.replace(":", "")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function MobileSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateText = useMemo(() => formatDate(selectedDate), [selectedDate]);

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [daySchedules, setDaySchedules] = useState([]);
  const [memberSchedules, setMemberSchedules] = useState([]);

  const [selectedType, setSelectedType] = useState("pt");
  const [selectedTime, setSelectedTime] = useState("");
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
      const group = isGroupSchedule(schedule);
      const key = group
        ? `${schedule.schedule_date}-${formatTime(schedule.start_time)}-group-${schedule.id}`
        : `${schedule.id}`;

      const participants =
        schedule.participantMembers && schedule.participantMembers.length > 0
          ? schedule.participantMembers
          : schedule.member
          ? [schedule.member]
          : [];

      if (!map[key]) {
        map[key] = {
          ids: [schedule.id],
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          type: group ? "group" : schedule.type,
          memo: schedule.memo,
          status: schedule.status || "scheduled",
          names: [],
          phones: [],
          members: [],
          smsDone: hasSmsDone(schedule.memo),
        };
      }

      participants.forEach((member) => {
        if (!member) return;
        const already = map[key].members.some((m) => m?.id === member.id);
        if (already) return;
        map[key].names.push(member.name || "회원 정보 없음");
        map[key].phones.push(member.phone || "");
        map[key].members.push(member);
      });
    });

    return Object.values(map).sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
  }, [daySchedules]);

  const bookedTimeMap = useMemo(() => {
    const map = {};
    daySchedules.forEach((schedule) => {
      if (schedule.status === "cancelled") return;
      const key = formatTime(schedule.start_time);
      if (!map[key]) map[key] = [];
      const names =
        schedule.participantMembers && schedule.participantMembers.length > 0
          ? schedule.participantMembers.map((m) => m.name)
          : schedule.member?.name
          ? [schedule.member.name]
          : ["예약 있음"];
      names.forEach((name) => {
        if (!map[key].includes(name)) map[key].push(name);
      });
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
    const scheduleIds = activeSchedules.map((s) => s.id).filter(Boolean);

    let scheduleMembers = [];
    if (scheduleIds.length > 0) {
      const { data: smData } = await supabase.from("schedule_members").select("*").in("schedule_id", scheduleIds);
      scheduleMembers = smData || [];
    }

    const memberIds = [
      ...new Set([
        ...activeSchedules.map((s) => s.member_id).filter(Boolean),
        ...scheduleMembers.map((sm) => sm.member_id).filter(Boolean),
      ]),
    ];

    let memberMap = {};
    if (memberIds.length > 0) {
      const { data: memberData } = await supabase.from("members").select("*").in("id", memberIds);
      memberMap = (memberData || []).reduce((acc, member) => {
        acc[member.id] = member;
        return acc;
      }, {});
    }

    const scheduleMemberMap = scheduleMembers.reduce((acc, row) => {
      if (!acc[row.schedule_id]) acc[row.schedule_id] = [];
      const member = memberMap[row.member_id];
      if (member) acc[row.schedule_id].push(member);
      return acc;
    }, {});

    setDaySchedules(
      activeSchedules.map((s) => ({
        ...s,
        member: memberMap[s.member_id] || null,
        participantMembers: scheduleMemberMap[s.id] || [],
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
      alert("그룹PT는 최대 3명까지 가능해요.");
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

    setMemberSchedules(
      (data || [])
        .filter((item) => item.status !== "cancelled")
        .map((schedule) => ({ ...schedule, member: selectedMembers.find((m) => m.id === schedule.member_id) }))
    );
  }

  async function saveSchedule() {
    if (selectedMembers.length === 0) return alert("회원을 선택해주세요.");
    if (!selectedTime) return alert("시간을 선택해주세요.");

    setSaving(true);

    const { data: sameTimeData, error: sameTimeError } = await supabase
      .from("schedules")
      .select("*")
      .eq("schedule_date", selectedDateText)
      .eq("start_time", selectedTime);

    if (sameTimeError) {
      console.error(sameTimeError);
      alert("중복 일정 확인 중 오류가 났어요.");
      setSaving(false);
      return;
    }

    const activeSameTime = (sameTimeData || []).filter((item) => item.status !== "cancelled");
    if (activeSameTime.length > 0) {
      alert("이미 예약된 시간이에요.");
      setSaving(false);
      return;
    }

    const isGroup = selectedType === "group";

    if (!isGroup) {
      const payload = {
        member_id: selectedMembers[0].id,
        schedule_date: selectedDateText,
        start_time: selectedTime,
        end_time: addOneHour(selectedTime),
        type: selectedType,
        status: "scheduled",
        memo: memo.trim() || null,
      };
      const { error } = await supabase.from("schedules").insert(payload);
      if (error) {
        console.error(error);
        alert("일정 저장 실패");
        setSaving(false);
        return;
      }
    } else {
      const schedulePayload = {
        member_id: selectedMembers[0].id,
        schedule_date: selectedDateText,
        start_time: selectedTime,
        end_time: addOneHour(selectedTime),
        type: "group",
        status: "scheduled",
        memo: `[그룹PT] ${memo.trim()}`.trim(),
      };
      const { data: createdSchedule, error: scheduleError } = await supabase
        .from("schedules")
        .insert(schedulePayload)
        .select("*")
        .single();
      if (scheduleError || !createdSchedule) {
        console.error(scheduleError);
        alert("그룹PT 일정 저장 실패");
        setSaving(false);
        return;
      }
      const memberRows = selectedMembers.map((member) => ({ schedule_id: createdSchedule.id, member_id: member.id }));
      const { error: memberError } = await supabase.from("schedule_members").insert(memberRows);
      if (memberError) {
        console.error(memberError);
        await supabase.from("schedules").delete().eq("id", createdSchedule.id);
        alert("그룹PT 회원 저장 실패. 일정은 취소했어요.");
        setSaving(false);
        return;
      }
    }

    alert("일정 등록 완료");
    setSelectedTime("");
    setMemo("");
    await loadDaySchedules();
    await loadSelectedMemberSchedules();
    setSaving(false);
  }

  async function markSmsDone(scheduleId, oldMemo) {
    const currentMemo = String(oldMemo || "");
    const nextMemo = hasSmsDone(currentMemo) ? currentMemo : `${currentMemo ? `${currentMemo} ` : ""}[문자완료]`;
    await supabase.from("schedules").update({ memo: nextMemo }).eq("id", scheduleId);
    await loadDaySchedules();
    await loadSelectedMemberSchedules();
  }

  function makeReservationMessage(schedule) {
    return `[스포테이너]\n\n${formatKoreanDate(selectedDate)} ${formatAmPm(schedule.start_time)} ~ ${formatAmPm(
      schedule.end_time || addOneHour(formatTime(schedule.start_time))
    )} ${getTypeLabel(schedule.type, schedule.memo)} 수업 예약되어 있어요 :)\n\n오늘 컨디션이나 불편한 부위 있으면 미리 말씀해주세요.\n늦지 않게 방문 부탁드릴게요 :)`;
  }

  async function handleScheduleSms(schedule, phone) {
    sendSms(phone, makeReservationMessage(schedule));
    const scheduleId = schedule.ids[0];
    if (scheduleId) await markSmsDone(scheduleId, schedule.memo);
  }

  function handleTypeChange(value) {
    setSelectedType(value);
    if (value !== "group" && selectedMembers.length > 1) setSelectedMembers(selectedMembers.slice(0, 1));
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

  return (
    <main style={styles.page} onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)} onTouchEnd={handleSwipeEnd}>
      <section style={styles.header}>
        <button style={styles.arrowButton} onClick={() => setSelectedDate(addDays(selectedDate, -1))}>‹</button>
        <div style={styles.headerCenter}>
          <div style={styles.title}>모바일 일정등록</div>
          <div style={styles.dateText}>{formatKoreanDate(selectedDate)}</div>
          <input style={styles.dateInput} type="date" value={selectedDateText} onChange={(e) => handleDateInputChange(e.target.value)} />
        </div>
        <button style={styles.arrowButton} onClick={() => setSelectedDate(addDays(selectedDate, 1))}>›</button>
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
              <div key={`${schedule.start_time}-${index}`} style={styles.scheduleCard}>
                <div style={styles.scheduleTop}>
                  <div style={styles.scheduleTimeBig}>{formatAmPm(schedule.start_time)} ~ {formatAmPm(schedule.end_time || addOneHour(formatTime(schedule.start_time)))}</div>
                  <div style={{ ...styles.statusBadge, background: getStatusLabel(schedule.status) === "완료" ? "#2f5d50" : "#6b4500" }}>{getStatusLabel(schedule.status)}</div>
                </div>
                <div style={styles.scheduleNameBig}>{getTypeLabel(schedule.type, schedule.memo)} · {schedule.names.join(", ")}</div>
                <div style={styles.scheduleSub}>
                  {schedule.members.filter(Boolean).map((m) => `PT ${getMemberPt(m)}회`).join(" / ")}
                  {schedule.smsDone ? " · 문자 완료" : ""}
                </div>
                {cleanMemo(schedule.memo) && <div style={styles.memoBox}>{cleanMemo(schedule.memo)}</div>}
                <div style={styles.scheduleButtonRow}>
                  {schedule.phones.map((phone, phoneIndex) => (
                    <button key={`${phone}-${phoneIndex}`} style={styles.smsButton} onClick={() => handleScheduleSms(schedule, phone)}>문자</button>
                  ))}
                  <button type="button" style={styles.calendarButton} onClick={() => downloadCalendarFile(schedule, selectedDateText)}>
                    캘린더 저장
                  </button>
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
            <button key={item.value} style={{ ...styles.typeButton, background: selectedType === item.value ? "#111827" : "#ffffff", color: selectedType === item.value ? "#ffffff" : "#111827" }} onClick={() => handleTypeChange(item.value)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>회원 검색{selectedType === "group" ? ` (${selectedMembers.length}/3명)` : ""}</div>
        <div style={styles.searchRow}>
          <input style={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 또는 전화번호" onKeyDown={(e) => { if (e.key === "Enter") searchMembers(); }} />
          <button style={styles.searchButton} onClick={searchMembers}>검색</button>
        </div>
        {selectedMembers.length > 0 && (
          <div style={styles.selectedChipWrap}>
            {selectedMembers.map((member) => <button key={member.id} style={styles.selectedChip} onClick={() => toggleMember(member)}>{member.name} ✕</button>)}
          </div>
        )}
        {members.length > 0 && (
          <div style={styles.memberList}>
            {members.map((member) => {
              const checked = selectedMembers.some((m) => m.id === member.id);
              return (
                <button key={member.id} style={{ ...styles.memberItem, borderColor: checked ? "#111827" : "#e5e7eb", background: checked ? "#f3f4f6" : "#ffffff" }} onClick={() => toggleMember(member)}>
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
          <div style={styles.cardTitle}>수업 등록</div>
          <div style={styles.timeGrid}>
            {timeOptions.map((time) => {
              const bookedNames = bookedTimeMap[time] || [];
              const disabled = bookedNames.length > 0;
              return (
                <button key={time} disabled={disabled} style={{ ...styles.timeButton, background: disabled ? "#e5e7eb" : selectedTime === time ? "#111827" : "#ffffff", color: disabled ? "#9ca3af" : selectedTime === time ? "#ffffff" : "#111827" }} onClick={() => { if (!disabled) setSelectedTime(time); }}>
                  <div>{time}</div>
                  {disabled && <div style={styles.bookedName}>{bookedNames.slice(0, 2).join(", ")}</div>}
                </button>
              );
            })}
          </div>
          <textarea style={styles.textarea} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모" />
          <button style={styles.saveButton} onClick={saveSchedule} disabled={saving}>{saving ? "저장 중..." : `선택 ${selectedMembers.length}명 일정 등록`}</button>
        </section>
      )}
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f3f4f6", padding: "14px", color: "#111827", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111827", color: "#ffffff", borderRadius: "18px", padding: "14px", marginBottom: "14px" },
  headerCenter: { flex: 1, padding: "0 10px", textAlign: "center" },
  title: { fontSize: "18px", fontWeight: "900" },
  dateText: { fontSize: "18px", fontWeight: "900", marginTop: "6px" },
  dateInput: { marginTop: "10px", width: "100%", height: "40px", borderRadius: "12px", border: "none", padding: "0 10px", fontSize: "15px" },
  arrowButton: { width: "42px", height: "42px", borderRadius: "14px", border: "none", background: "rgba(255,255,255,0.12)", color: "#ffffff", fontSize: "30px" },
  card: { background: "#ffffff", borderRadius: "18px", padding: "14px", marginBottom: "14px" },
  cardTitle: { fontSize: "17px", fontWeight: "900", marginBottom: "12px" },
  emptyText: { fontSize: "14px", color: "#6b7280" },
  scheduleList: { display: "flex", flexDirection: "column", gap: "12px" },
  scheduleCard: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "18px", padding: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  scheduleTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" },
  scheduleTimeBig: { fontSize: "17px", fontWeight: "900" },
  statusBadge: { color: "#ffffff", borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: "900", whiteSpace: "nowrap" },
  scheduleNameBig: { fontSize: "17px", fontWeight: "900", marginTop: "14px" },
  scheduleSub: { fontSize: "14px", color: "#6b7280", fontWeight: "800", marginTop: "6px" },
  memoBox: { marginTop: "12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "10px 12px", fontSize: "14px", fontWeight: "800" },
  scheduleButtonRow: { display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" },
  smsButton: { height: "42px", padding: "0 18px", borderRadius: "999px", border: "none", background: "#111111", color: "#ffffff", fontSize: "14px", fontWeight: "900" },
  calendarButton: { height: "42px", padding: "0 18px", borderRadius: "999px", border: "none", background: "#7a4f38", color: "#ffffff", fontSize: "14px", fontWeight: "900" },
  typeGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" },
  typeButton: { height: "44px", borderRadius: "14px", border: "1px solid #111827", fontSize: "14px", fontWeight: "900" },
  searchRow: { display: "flex", gap: "8px" },
  input: { flex: 1, height: "46px", border: "1px solid #d1d5db", borderRadius: "14px", padding: "0 12px", fontSize: "15px" },
  searchButton: { width: "72px", border: "none", borderRadius: "14px", background: "#111827", color: "#ffffff", fontWeight: "900" },
  selectedChipWrap: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" },
  selectedChip: { border: "none", borderRadius: "999px", background: "#111827", color: "#ffffff", padding: "8px 12px", fontSize: "13px", fontWeight: "900" },
  memberList: { marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" },
  memberItem: { border: "2px solid #e5e7eb", borderRadius: "16px", padding: "12px", textAlign: "left" },
  memberTopRow: { display: "flex", justifyContent: "space-between", gap: "10px" },
  memberName: { fontSize: "16px", fontWeight: "900" },
  memberPhone: { fontSize: "13px", color: "#6b7280", marginTop: "4px" },
  memberPt: { background: "#f3f4f6", borderRadius: "999px", padding: "7px 10px", fontSize: "13px", fontWeight: "900", whiteSpace: "nowrap" },
  timeGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" },
  timeButton: { minHeight: "48px", borderRadius: "14px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: "900" },
  bookedName: { fontSize: "10px", marginTop: "2px" },
  textarea: { width: "100%", minHeight: "72px", border: "1px solid #d1d5db", borderRadius: "14px", padding: "12px", marginBottom: "12px", boxSizing: "border-box" },
  saveButton: { width: "100%", height: "52px", border: "none", borderRadius: "16px", background: "#111827", color: "#ffffff", fontSize: "17px", fontWeight: "900" },
};
