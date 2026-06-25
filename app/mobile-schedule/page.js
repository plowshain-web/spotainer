"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PATCH_VERSION = "mobile-schedule-real-db-v1-2026-05-25";

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTitle(dateText) {
  if (!dateText) return "";
  const [year, month, day] = String(dateText).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const week = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${week}`;
}

function formatDateDot(dateText) {
  if (!dateText) return "";
  const [year, month, day] = String(dateText).split("-");
  return `${year}.${month}.${day}.`;
}

function formatTime(timeText) {
  if (!timeText) return "";
  const [hh, mm] = String(timeText).split(":");
  const hour = Number(hh);
  const minute = String(mm || "00").padStart(2, "0");
  const period = hour >= 12 ? "오후" : "오전";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${minute}`;
}

function formatScheduleRange(schedule) {
  const start = formatTime(schedule?.start_time);
  const end = formatTime(schedule?.end_time);
  if (start && end) return `${start} ~ ${end}`;
  return start || end || "시간 미정";
}

function getScheduleTypeText(type) {
  if (type === "ot") return "OT";
  if (type === "consult") return "상담";
  if (type === "group") return "그룹PT";
  return "PT";
}

function getScheduleMembers(schedule) {
  const relationMembers = Array.isArray(schedule?.schedule_members)
    ? schedule.schedule_members
        .map((row) => row?.members)
        .filter(Boolean)
    : [];

  if (relationMembers.length > 0) return relationMembers;
  if (schedule?.members) return [schedule.members];
  return [];
}

function getScheduleMemberNames(schedule) {
  const names = getScheduleMembers(schedule)
    .map((member) => member?.name)
    .filter(Boolean);
  return names.length > 0 ? names.join(", ") : "회원 미지정";
}

function getScheduleMemberPtText(schedule) {
  const members = getScheduleMembers(schedule);
  if (members.length === 0) return "";

  if (members.length === 1) {
    const remain = Number(members[0]?.pt_remaining ?? 0);
    return `PT ${remain}회`;
  }

  return members
    .map((member) => `${member?.name || "회원"} ${Number(member?.pt_remaining ?? 0)}회`)
    .join(" · ");
}

function getSMSPhone(member) {
  return String(member?.phone || "").replace(/[^0-9]/g, "");
}

function buildScheduleSMS(schedule, member) {
  const name = member?.name || "회원";
  const date = formatDateTitle(schedule?.schedule_date);
  const time = formatScheduleRange(schedule);
  const memo = String(schedule?.memo || "").trim();

  const memoLine = memo ? `\n오늘은 ${memo} 쪽으로 컨디션 보면서 진행할게요.` : "";

  return `${name}님 안녕하세요.\n${date} ${time} 수업 일정 확인차 연락드려요.${memoLine}\n수업 때 뵐게요.`;
}

export default function MobileSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [smsSentMap, setSmsSentMap] = useState({});

  const selectedDateTitle = useMemo(() => formatDateTitle(selectedDate), [selectedDate]);

  useEffect(() => {
    console.log("Spotainer mobile schedule patch:", PATCH_VERSION);
  }, []);

  useEffect(() => {
    loadSchedules(selectedDate);
    loadScheduleSMSLogs(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const channel = supabase
      .channel("mobile-schedule-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedules" },
        () => loadSchedules(selectedDate)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedule_members" },
        () => loadSchedules(selectedDate)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedule_sms_logs" },
        () => loadScheduleSMSLogs(selectedDate)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  async function loadSchedules(date) {
    if (!date) return;

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(id,name,phone,pt_remaining), schedule_members(*, members(id,name,phone,pt_remaining))")
      .eq("schedule_date", date)
      .order("start_time", { ascending: true });

    setLoading(false);

    if (error) {
      setSchedules([]);
      setErrorMessage("일정 불러오기 실패: " + error.message);
      return;
    }

    setSchedules(data || []);
  }

  async function loadScheduleSMSLogs(date) {
    if (!date) {
      setSmsSentMap({});
      return;
    }

    const { data, error } = await supabase
      .from("schedule_sms_logs")
      .select("*")
      .eq("sent_date", date)
      .eq("message_type", "schedule_condition");

    if (error) {
      console.error("문자 기록 불러오기 실패:", error.message);
      setSmsSentMap({});
      return;
    }

    const nextMap = {};
    (data || []).forEach((log) => {
      if (!log.schedule_id || !log.member_id) return;
      nextMap[`${log.schedule_id}:${log.member_id}`] = true;
    });
    setSmsSentMap(nextMap);
  }

  function isMemberSmsSent(schedule, member) {
    if (!schedule?.id || !member?.id) return false;
    return Boolean(smsSentMap[`${schedule.id}:${member.id}`]);
  }

  async function saveScheduleSMSLog(schedule, member, memoText = "") {
    if (!schedule?.id || !member?.id) return false;

    const sentDate = schedule.schedule_date || selectedDate || getTodayDateString();

    const row = {
      schedule_id: schedule.id,
      member_id: member.id,
      sent_date: sentDate,
      sent_at: new Date().toISOString(),
      message_type: "schedule_condition",
      memo: memoText || null,
    };

    const { data: existingLog, error: lookupError } = await supabase
      .from("schedule_sms_logs")
      .select("id")
      .eq("schedule_id", schedule.id)
      .eq("member_id", member.id)
      .eq("sent_date", sentDate)
      .eq("message_type", "schedule_condition")
      .maybeSingle();

    if (lookupError) {
      alert("문자 기록 확인 실패: " + lookupError.message);
      return false;
    }

    const result = existingLog?.id
      ? await supabase
          .from("schedule_sms_logs")
          .update({ sent_at: row.sent_at, memo: row.memo })
          .eq("id", existingLog.id)
      : await supabase.from("schedule_sms_logs").insert(row);

    if (result.error) {
      alert("문자 기록 저장 실패: " + result.error.message);
      return false;
    }

    setSmsSentMap((prev) => ({
      ...prev,
      [`${schedule.id}:${member.id}`]: true,
    }));

    return true;
  }

  async function sendScheduleSMS(schedule, member) {
    const phone = getSMSPhone(member);

    if (!phone) {
      alert("회원 전화번호가 없습니다.");
      return;
    }

    const body = buildScheduleSMS(schedule, member);
    await saveScheduleSMSLog(schedule, member, body);

    const smsUrl = `sms:${phone}?body=${encodeURIComponent(body)}`;
    window.location.href = smsUrl;
  }

  function addToDeviceCalendar(schedule) {
    const members = getScheduleMemberNames(schedule);
    const title = `${getScheduleTypeText(schedule.type)} ${members}`;
    const memo = schedule?.memo ? `메모: ${schedule.memo}` : "";
    const start = String(schedule?.start_time || "09:00").replace(":", "").slice(0, 4);
    const end = String(schedule?.end_time || schedule?.start_time || "10:00").replace(":", "").slice(0, 4);
    const date = String(schedule?.schedule_date || selectedDate).replace(/-/g, "");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Spotainer//Mobile Schedule//KR",
      "BEGIN:VEVENT",
      `UID:${schedule.id || Date.now()}@spotainer`,
      `DTSTAMP:${date}T000000`,
      `DTSTART:${date}T${start}00`,
      `DTEND:${date}T${end}00`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${memo}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spotainer-${date}-${start}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerBox}>
        <div style={styles.title}>모바일 일정확인</div>
        <div style={styles.dateTitle}>{selectedDateTitle}</div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.dateInput}
        />
      </div>

      <div style={styles.contentBox}>
        <div style={styles.sectionTitle}>선택 날짜 일정</div>

        {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}
        {loading && <div style={styles.emptyBox}>일정 불러오는 중...</div>}

        {!loading && schedules.length === 0 && (
          <div style={styles.emptyBox}>선택한 날짜에 등록된 일정이 없습니다.</div>
        )}

        {!loading && schedules.map((schedule) => {
          const members = getScheduleMembers(schedule);
          const firstMember = members[0];
          const allSent = members.length > 0 && members.every((member) => isMemberSmsSent(schedule, member));

          return (
            <div key={schedule.id} style={styles.card}>
              <div style={styles.cardTopRow}>
                <div style={styles.time}>{formatScheduleRange(schedule)}</div>
                {allSent && <div style={styles.smsDoneBadge}>문자 완료</div>}
              </div>

              <div style={styles.memberLine}>
                {getScheduleTypeText(schedule.type)} · {getScheduleMemberNames(schedule)}
              </div>

              <div style={styles.ptLine}>{getScheduleMemberPtText(schedule)}</div>

              {schedule.memo && (
                <div style={styles.memoBox}>{String(schedule.memo).replace(/\s*\[문자완료\]\s*/g, "").trim()}</div>
              )}

              <div style={styles.buttonRow}>
                {members.length <= 1 ? (
                  <button
                    type="button"
                    onClick={() => sendScheduleSMS(schedule, firstMember)}
                    style={styles.blackButton}
                    disabled={!firstMember}
                  >
                    문자
                  </button>
                ) : (
                  members.map((member) => (
                    <button
                      key={`${schedule.id}-${member.id}`}
                      type="button"
                      onClick={() => sendScheduleSMS(schedule, member)}
                      style={styles.blackButton}
                    >
                      {member.name} 문자
                    </button>
                  ))
                )}

                <button
                  type="button"
                  onClick={() => addToDeviceCalendar(schedule)}
                  style={styles.brownButton}
                >
                  캘린더 저장
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f5f5f5",
    minHeight: "100vh",
    padding: "16px",
    boxSizing: "border-box",
    color: "#000",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  headerBox: {
    background: "#091226",
    borderRadius: "24px",
    padding: "24px",
    color: "white",
    marginBottom: "20px",
  },
  title: {
    textAlign: "center",
    fontSize: "32px",
    fontWeight: 800,
    marginBottom: "12px",
  },
  dateTitle: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 800,
    marginBottom: "20px",
  },
  dateInput: {
    width: "100%",
    height: "70px",
    borderRadius: "18px",
    border: "none",
    padding: "0 20px",
    fontSize: "28px",
    boxSizing: "border-box",
    background: "#f1f1f1",
    color: "#000",
  },
  contentBox: {
    background: "white",
    borderRadius: "24px",
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: 800,
    marginBottom: "24px",
  },
  card: {
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "24px",
    padding: "20px",
    marginBottom: "20px",
  },
  cardTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "20px",
  },
  time: {
    fontSize: "32px",
    fontWeight: 800,
    lineHeight: 1.35,
  },
  smsDoneBadge: {
    flexShrink: 0,
    background: "#3b2608",
    color: "#fff",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "16px",
    fontWeight: 800,
  },
  memberLine: {
    fontSize: "28px",
    fontWeight: 800,
    marginBottom: "12px",
  },
  ptLine: {
    fontSize: "22px",
    color: "#777",
    marginBottom: "20px",
  },
  memoBox: {
    border: "1px solid #ddd",
    borderRadius: "18px",
    padding: "18px",
    fontSize: "24px",
    marginBottom: "20px",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  blackButton: {
    background: "black",
    color: "white",
    border: "none",
    borderRadius: "18px",
    padding: "16px 24px",
    fontSize: "22px",
    fontWeight: 800,
  },
  brownButton: {
    background: "#8b5e3c",
    color: "white",
    border: "none",
    borderRadius: "18px",
    padding: "16px 24px",
    fontSize: "22px",
    fontWeight: 800,
  },
  emptyBox: {
    border: "1px solid #e5e5e5",
    borderRadius: "18px",
    padding: "24px",
    fontSize: "20px",
    color: "#666",
    textAlign: "center",
  },
  errorBox: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: "18px",
    padding: "18px",
    fontSize: "18px",
    marginBottom: "16px",
  },
};
