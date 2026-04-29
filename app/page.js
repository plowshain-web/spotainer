"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);



const exerciseList = [
  "스미스 스쿼트","바벨 스쿼트","덤벨 스쿼트","불가리안 스플릿 스쿼트","런지","워킹 런지",
  "레그 프레스","레그 익스텐션","레그 컬","힙 어브덕션","힙 어덕션","힙 쓰러스트",
  "글루트 브리지","케이블 킥백","스텝업",
  "랫풀다운","시티드 로우","바벨 로우","덤벨 로우","케이블 로우","풀업","페이스풀","리버스 펙덱",
  "체스트 프레스","인클라인 체스트 프레스","덤벨 벤치프레스","푸쉬업","펙덱 플라이","케이블 플라이",
  "덤벨 숄더프레스","머신 숄더프레스","사이드 레터럴 레이즈","프론트 레이즈","리어 델트 레이즈","업라이트 로우",
  "플랭크","사이드 플랭크","크런치","레그레이즈","데드버그","버드독","러시안 트위스트","케이블 크런치",
  "케틀벨 스윙", "덤벨 런지 프레스", "점핑잭", "스쿼트", "하이 니 크런치", "스탠딩 사이드 크런치", "스탠딩 트위스트 크런치", "스텝업 니업", "스텝업 니 드라이브 킥", "스텝업 니킥", "스텝업 덤벨 터치", "점핑 런지"
];


const circuitPrograms = [
  {
    name: "서킷 1단계",
    memo: "전신 서킷 1단계",
    exercises: [
      { name: "점핑잭", weight: "", reps: "20" },
      { name: "케틀벨 스윙", weight: "8", reps: "20" },
      { name: "덤벨 런지 프레스", weight: "2", reps: "20" },
      { name: "스쿼트", weight: "", reps: "20" },
    ],
  },
  {
    name: "서킷 2단계",
    memo: "전신 서킷 2단계",
    exercises: [
      { name: "하이 니 크런치", weight: "", reps: "20" },
      { name: "스탠딩 사이드 크런치", weight: "", reps: "20" },
      { name: "스탠딩 트위스트 크런치", weight: "", reps: "20" },
    ],
  },
  {
    name: "서킷 3단계",
    memo: "전신 서킷 3단계",
    exercises: [
      { name: "스텝업 니업", weight: "", reps: "20" },
      { name: "스텝업 니킥", weight: "", reps: "20" },
      { name: "스텝업 덤벨 터치", weight: "", reps: "20" },
      { name: "점핑 런지", weight: "", reps: "20" },
    ],
  },
];const ptOptions = [1, 10, 12, 24, 36, 48, 60, 72];

const commonExercises = [
  "스쿼트",
  "런지",
  "레그프레스",
  "레그익스텐션",
  "레그컬",
  "힙쓰러스트",
  "힙어브덕션",
  "랫풀다운",
  "시티드로우",
  "체스트프레스",
  "숄더프레스",
  "사이드레터럴레이즈",
  "케이블푸쉬다운",
  "바이셉스컬",
  "플랭크",
  "크런치",
  "데드버그",
  "버드독",
  "힙브릿지",
  "스트레칭",
];

export default function Page() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [summaryModal, setSummaryModal] = useState(null);
  const [showContactListModal, setShowContactListModal] = useState(false);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [centerInfoId, setCenterInfoId] = useState(null);
  const [centerName, setCenterName] = useState("");
  const [centerPhone, setCenterPhone] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerMemo, setCenterMemo] = useState("");
  const [contactModalMember, setContactModalMember] = useState(null);
  const [contactResult, setContactResult] = useState("pending");
  const [contactNote, setContactNote] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [note, setNote] = useState("");
  const [memo, setMemo] = useState("");
  const [memberType, setMemberType] = useState("general");

  const [editingId, setEditingId] = useState(null);
  const [editModalMember, setEditModalMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editPtRemaining, setEditPtRemaining] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editMemberType, setEditMemberType] = useState("general");

  const [selectedMember, setSelectedMember] = useState(null);
  const [detailMode, setDetailMode] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [ptLogList, setPtLogList] = useState([]);

  const [showAllPtModal, setShowAllPtModal] = useState(false);
  const [showAllAttendanceModal, setShowAllAttendanceModal] = useState(false);

  const [inbodyList, setInbodyList] = useState([]);
  const [showInbodyModal, setShowInbodyModal] = useState(false);
  const [showAllInbodyModal, setShowAllInbodyModal] = useState(false);
  const [editingInbodyLog, setEditingInbodyLog] = useState(null);
  const [inbodyMeasuredAt, setInbodyMeasuredAt] = useState(getTodayDateString());
  const [inbodyWeight, setInbodyWeight] = useState("");
  const [inbodySkeletalMuscle, setInbodySkeletalMuscle] = useState("");
  const [inbodyBodyFatMass, setInbodyBodyFatMass] = useState("");
  const [inbodyBodyFatPercent, setInbodyBodyFatPercent] = useState("");
  const [inbodyBmi, setInbodyBmi] = useState("");
  const [inbodyBasalMetabolicRate, setInbodyBasalMetabolicRate] = useState("");
  const [inbodyVisceralFatLevel, setInbodyVisceralFatLevel] = useState("");
  const [inbodyMemo, setInbodyMemo] = useState("");

  const [workoutMember, setWorkoutMember] = useState(null);
  const [workoutReturnSource, setWorkoutReturnSource] = useState(null);
  const [workoutSessions, setWorkoutSessions] = useState([]);
  const [workoutMode, setWorkoutMode] = useState("list");
  const [workoutTrainingType, setWorkoutTrainingType] = useState("weight");
  const [workoutMemo, setWorkoutMemo] = useState("");
  const [workoutCondition, setWorkoutCondition] = useState("normal");
  const [workoutIssue, setWorkoutIssue] = useState("");
  const [workoutNextPlan, setWorkoutNextPlan] = useState("");
  const [workoutTrainerNote, setWorkoutTrainerNote] = useState("");
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
const [workoutExercises, setWorkoutExercises] = useState([
    { name: "", sets: [{ weight: "", reps: "" }] },
  ]);
  const [showAllWorkoutModal, setShowAllWorkoutModal] = useState(false);

  const [editingWorkoutSetId, setEditingWorkoutSetId] = useState(null);
  const [editWorkoutName, setEditWorkoutName] = useState("");
  const [editWorkoutWeight, setEditWorkoutWeight] = useState("");
  const [editWorkoutReps, setEditWorkoutReps] = useState("");

  const [ptModalMember, setPtModalMember] = useState(null);
  const [selectedPtAmount, setSelectedPtAmount] = useState("");
  const [ptTotalPrice, setPtTotalPrice] = useState("");
  const [ptAddType, setPtAddType] = useState("paid");
  const [lastAction, setLastAction] = useState(null);
  const [salesData, setSalesData] = useState({
    total: 0,
    count: 0,
    average: 0,
    todayTotal: 0,
  });

  const [schedules, setSchedules] = useState([]);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleCheckModal, setShowScheduleCheckModal] = useState(false);
  const [scheduleCheckDate, setScheduleCheckDate] = useState(getTodayDateString());
  const [scheduleCheckList, setScheduleCheckList] = useState([]);
  const [scheduleCheckMonthList, setScheduleCheckMonthList] = useState([]);
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleSearchResultList, setScheduleSearchResultList] = useState([]);
  const [showScheduleSearchResultModal, setShowScheduleSearchResultModal] = useState(false);
  const [showScheduleConflictModal, setShowScheduleConflictModal] = useState(false);
  const [conflictSchedules, setConflictSchedules] = useState([]);
  const [pendingSchedule, setPendingSchedule] = useState(null);
  const [returnToScheduleCheckAfterAdd, setReturnToScheduleCheckAfterAdd] = useState(false);
  const [actionModalSchedule, setActionModalSchedule] = useState(null);
  const [showMemberListModal, setShowMemberListModal] = useState(false);
  const [returnToMemberListAfterDetail, setReturnToMemberListAfterDetail] = useState(false);
  const [memberListTitle, setMemberListTitle] = useState("회원 목록");
  const [memberSortMode, setMemberSortMode] = useState("default");
  const [showInactiveMembers, setShowInactiveMembers] = useState(false);
  const [scheduleMemberId, setScheduleMemberId] = useState("");
  const [scheduleSecondMemberId, setScheduleSecondMemberId] = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString());
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [scheduleType, setScheduleType] = useState("pt");
  const [scheduleMemo, setScheduleMemo] = useState("");
  const [lastBackPressedAt, setLastBackPressedAt] = useState(0);
  const [exitToast, setExitToast] = useState("");
  const allowBackExitRef = useRef(false);
  const hasOpenModalRef = useRef(false);
  const lastBackPressedAtRef = useRef(0);
  const closeTopModalByBackButtonRef = useRef(null);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    loadMembers();
    loadSchedules(getTodayDateString());
    loadSales();
    loadCenterInfo();
  }, []);

  useEffect(() => {
    if (!exitToast) return;

    const timer = window.setTimeout(() => {
      setExitToast("");
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [exitToast]);


  useEffect(() => {
    if (!showScheduleCheckModal || !scheduleCheckDate) return;

    loadScheduleCheckList(scheduleCheckDate);
    loadScheduleCheckMonthList(scheduleCheckDate);
  }, [showScheduleCheckModal, scheduleCheckDate]);

  async function loadMembers() {
    let { data, error } = await supabase
      .from("members")
      .select(
        "*, attendance_logs(visited_at,is_cancelled,cancelled_at), pt_logs(type,amount,total_price,is_cancelled,created_at), inbody_logs(measured_at)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("회원 상세 불러오기 실패, 기본 회원 목록으로 재시도:", error.message);

      const fallback = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallback.error) {
        alert("회원 목록 불러오기 실패: " + fallback.error.message);
        setMembers([]);
        return;
      }

      data = fallback.data || [];
    }

    const formatted = (data || []).map((m) => {
      const validLogs = (m.attendance_logs || []).filter((l) => !l.is_cancelled);
      const latest = validLogs.map((l) => l.visited_at).sort().reverse()[0];

      const validPtLogs = (m.pt_logs || []).filter((l) => !l.is_cancelled);

      const used = validPtLogs
        .filter((l) => l.type === "use")
        .reduce((sum, l) => sum + l.amount, 0);

      const latestPt = validPtLogs
        .filter((l) => l.type === "use")
        .map((l) => l.created_at)
        .sort()
        .reverse()[0];

      const paymentLogs = validPtLogs.filter((l) => l.type === "add");
      const totalPaid = paymentLogs.reduce(
        (sum, l) => sum + (Number(l.total_price) || 0),
        0
      );
      const paymentCount = paymentLogs.filter((l) => Number(l.total_price) > 0).length;

      return {
        ...m,
        latest_visit: latest || null,
        latest_pt: latestPt || null,
        pt_used: used,
        pt_total: (m.pt_remaining || 0) + used,
        is_active: m.is_active !== false,
        member_type: m.member_type || ((m.pt_remaining || 0) > 0 ? "pt" : "general"),
        total_paid: totalPaid,
        payment_count: paymentCount,
        is_vip: totalPaid >= 1000000,
      };
    });

    setMembers(formatted);
  }

  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function loadSchedules(date = getTodayDateString()) {
    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(*)")
      .eq("schedule_date", date)
      .order("start_time", { ascending: true });

    if (error) {
      alert("스케줄 불러오기 실패: " + error.message);
      return;
    }

    setSchedules(data || []);
  }

  async function loadSelectedDateSchedules(date = scheduleDate) {
    if (!date) {
      setSelectedDateSchedules([]);
      return;
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(*)")
      .eq("schedule_date", date)
      .order("start_time", { ascending: true });

    if (error) {
      alert("선택 날짜 스케줄 불러오기 실패: " + error.message);
      return;
    }

    setSelectedDateSchedules(data || []);
  }

  async function loadScheduleCheckList(date = scheduleCheckDate) {
    if (!date) {
      setScheduleCheckList([]);
      return;
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(*)")
      .eq("schedule_date", date)
      .order("start_time", { ascending: true });

    if (error) {
      alert("스케줄 확인 불러오기 실패: " + error.message);
      return;
    }

    setScheduleCheckList(data || []);
  }

  function getMonthRange(dateText = getTodayDateString()) {
    const [year, month] = String(dateText || getTodayDateString()).split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    return {
      startText: getDateOnlyString(start),
      endText: getDateOnlyString(end),
    };
  }

  async function loadScheduleCheckMonthList(date = scheduleCheckDate) {
    if (!date) {
      setScheduleCheckMonthList([]);
      return;
    }

    const range = getMonthRange(date);

    const { data, error } = await supabase
      .from("schedules")
      .select("id,schedule_date,status,type")
      .gte("schedule_date", range.startText)
      .lt("schedule_date", range.endText);

    if (error) {
      console.error("월간 스케줄 불러오기 실패:", error.message);
      setScheduleCheckMonthList([]);
      return;
    }

    setScheduleCheckMonthList(data || []);
  }

  
function getFilteredScheduleCheckList(list = scheduleCheckList, keyword = scheduleSearch) {
    const q = String(keyword || "").trim().toLowerCase();

    if (!q) return list;

    return list.filter((schedule) => {
      const member = getScheduleMember(schedule) || schedule.members;

      return (
        member?.name?.toLowerCase().includes(q) ||
        member?.phone?.toLowerCase().includes(q) ||
        getScheduleTypeText(schedule.type).toLowerCase().includes(q) ||
        String(schedule.memo || "").toLowerCase().includes(q)
      );
    });
  }

  async function searchScheduleByKeyword() {
    const keyword = scheduleSearch.trim();

    if (!keyword) {
      alert("검색할 회원 이름이나 전화번호를 입력하세요.");
      return;
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(*)")
      .order("schedule_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      alert("스케줄 검색 실패: " + error.message);
      return;
    }

    const filtered = getFilteredScheduleCheckList(data || [], keyword);
    setScheduleSearchResultList(filtered);
    setShowScheduleSearchResultModal(true);
  }

  function getScheduleTimelineGroups(list = scheduleSearchResultList, keyword = scheduleSearch) {
    const groups = {};

    getFilteredScheduleCheckList(list, keyword).forEach((schedule) => {
      const member = getScheduleMember(schedule) || schedule.members;
      const key = member?.id || schedule.member_id || "unknown";

      if (!groups[key]) {
        groups[key] = {
          key,
          member,
          schedules: [],
        };
      }

      groups[key].schedules.push(schedule);
    });

    return Object.values(groups).map((group) => ({
      ...group,
      schedules: group.schedules.sort((a, b) => {
        const aDate = `${a.schedule_date || ""} ${a.start_time || ""}`;
        const bDate = `${b.schedule_date || ""} ${b.start_time || ""}`;
        return aDate.localeCompare(bDate);
      }),
    }));
  }

  function getScheduleRelationText(dateText) {
    const today = getTodayDateString();

    if (!dateText) return "";
    if (dateText === today) return "오늘";
    if (dateText > today) return "예정";
    return "지난 수업";
  }

  function renderScheduleCheckItem(schedule, showDate = false) {
    const member = getScheduleMember(schedule) || schedule.members;
    const status = getSchedulePreviewStatus(schedule);
    const isDone =
      schedule.status === "cancelled" ||
      schedule.status === "noshow" ||
      schedule.status === "completed" ||
      (schedule.attendance_checked && schedule.pt_used);

    return (
      <div key={schedule.id} style={styles.scheduleCheckItem}>
        <div style={styles.scheduleCheckMain}>
          <strong style={styles.scheduleCheckTime}>
            {showDate ? `${formatDate(schedule.schedule_date)} · ` : ""}
            {formatScheduleRange(schedule)}
          </strong>

          <p style={styles.scheduleCheckMember}>
            {getScheduleTypeText(schedule.type)} · {member?.name || "회원 정보 없음"}
            {member ? ` · PT ${member.pt_remaining || 0}회` : ""}
          </p>

          {showDate && (
            <p style={styles.scheduleTimelineMeta}>
              {getScheduleRelationText(schedule.schedule_date)}
            </p>
          )}

          {schedule.memo && (
            <p style={styles.scheduleCheckMemo}>{schedule.memo}</p>
          )}

          <div style={styles.scheduleStatusRow}>
            <span style={status.style}>{status.text}</span>
            {schedule.attendance_checked ? (
              <span style={styles.scheduleDoneText}>출석 완료</span>
            ) : (
              <span style={styles.scheduleWarningText}>출석 전</span>
            )}
            {schedule.pt_used ? (
              <span style={styles.scheduleDoneText}>차감 완료</span>
            ) : (
              <span style={styles.scheduleWarningText}>차감 전</span>
            )}
          </div>
        </div>

        <div style={styles.scheduleCheckButtonGroup}>
          <button
            type="button"
            onClick={() => addToDeviceCalendar(schedule)}
            style={styles.calendarButton}
          >
            캘린더
          </button>

          {isDone ? (
            <button style={styles.scheduleDisabledButton} disabled>
              {schedule.status === "cancelled"
                ? "취소됨"
                : schedule.status === "noshow"
                  ? "노쇼"
                  : "완료됨"}
            </button>
          ) : (
            <>
              <button
                onClick={() => openActionModal(schedule)}
                style={styles.incompleteCompleteButton}
              >
                처리
              </button>
              <button
                type="button"
                onClick={() => startEditSchedule(schedule)}
                style={styles.scheduleEditButton}
              >
                수정
              </button>
            </>
          )}

          <button
            onClick={() => deleteSchedule(schedule)}
            style={styles.whiteDeleteButton}
          >
            삭제
          </button>
        </div>
      </div>
    );
  }

    async function loadSales() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { data, error } = await supabase
      .from("pt_logs")
      .select("member_id,total_price,is_cancelled,created_at")
      .eq("type", "add")
      .gte("created_at", monthStart.toISOString())
      .lt("created_at", monthEnd.toISOString());

    if (error) {
      console.error("매출 불러오기 실패", error);
      return;
    }

    const validSales = (data || []).filter((log) => !log.is_cancelled);
    const total = validSales.reduce((sum, log) => sum + (Number(log.total_price) || 0), 0);
    const count = new Set(validSales.map((log) => log.member_id).filter(Boolean)).size;
    const average = count ? Math.round(total / count) : 0;
    const todayTotal = validSales
      .filter((log) => {
        const createdAt = new Date(log.created_at);
        return createdAt >= todayStart && createdAt < tomorrowStart;
      })
      .reduce((sum, log) => sum + (Number(log.total_price) || 0), 0);

    setSalesData({ total, count, average, todayTotal });
  }


  async function loadCenterInfo() {
    const { data, error } = await supabase
      .from("center_info")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("센터 정보 불러오기 실패", error);
      return;
    }

    if (!data) return;

    setCenterInfoId(data.id);
    setCenterName(data.name || "");
    setCenterPhone(data.phone || "");
    setCenterAddress(data.address || "");
    setCenterMemo(data.memo || "");
  }

  function openCenterModal() {
    setShowCenterModal(true);
    loadCenterInfo();
  }

  function closeCenterModal() {
    setShowCenterModal(false);
  }

  function openInactiveMembersFromAdmin() {
    setShowCenterModal(false);

    setTimeout(() => {
      openMemberListModal("비활성 회원", true, true);
    }, 0);
  }

  async function saveCenterInfo() {
    const row = {
      name: centerName.trim(),
      phone: centerPhone.trim(),
      address: centerAddress.trim(),
      memo: centerMemo.trim(),
      updated_at: new Date().toISOString(),
    };

    if (centerInfoId) {
      const { error } = await supabase
        .from("center_info")
        .update(row)
        .eq("id", centerInfoId);

      if (error) {
        alert("센터 정보 저장 실패: " + error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("center_info")
        .insert(row)
        .select()
        .single();

      if (error) {
        alert("센터 정보 저장 실패: " + error.message);
        return;
      }

      setCenterInfoId(data.id);
    }

    alert("센터 정보가 저장되었습니다.");
    setShowCenterModal(false);
    await loadCenterInfo();
  }

  function resetScheduleForm() {
    setScheduleMemberId("");
    setScheduleSecondMemberId("");
    setEditingSchedule(null);
    setScheduleDate(getTodayDateString());
    setScheduleStartTime("");
    setScheduleEndTime("");
    setScheduleType("pt");
    setScheduleMemo("");
    setSelectedDateSchedules([]);
  }

  function openScheduleModal() {
    resetScheduleForm();
    setShowScheduleModal(true);
    loadSelectedDateSchedules(getTodayDateString());
  }

  function closeScheduleModal() {
    setShowScheduleModal(false);
    setReturnToScheduleCheckAfterAdd(false);
    resetScheduleForm();
  }

  function startEditSchedule(schedule) {
    setEditingSchedule(schedule);
    setScheduleMemberId(schedule.member_id || "");
    setScheduleSecondMemberId("");
    setScheduleDate(schedule.schedule_date || getTodayDateString());
    setScheduleStartTime(normalizeTimeValue(schedule.start_time || ""));
    setScheduleEndTime(
      schedule.end_time
        ? normalizeTimeValue(schedule.end_time)
        : addMinutesToTime(schedule.start_time, 60)
    );
    setScheduleType(schedule.type || "pt");
    setScheduleMemo(schedule.memo || "");
    setReturnToScheduleCheckAfterAdd(showScheduleCheckModal);
    setShowScheduleCheckModal(false);
    setShowScheduleModal(true);
    loadSelectedDateSchedules(schedule.schedule_date || getTodayDateString());
  }

  function openScheduleCheckModal() {
    setScheduleCheckDate(getTodayDateString());
    setScheduleSearch("");
    setScheduleSearchResultList([]);
    setShowScheduleSearchResultModal(false);
    setShowScheduleCheckModal(true);
    loadScheduleCheckList(getTodayDateString());
  }

  function closeScheduleCheckModal() {
    setShowScheduleCheckModal(false);
    setScheduleCheckList([]);
  }

  function closeScheduleConflictModal() {
    setShowScheduleConflictModal(false);
    setConflictSchedules([]);
    setPendingSchedule(null);
  }

  function openScheduleAddFromCheck() {
    resetScheduleForm();
    setScheduleDate(scheduleCheckDate || getTodayDateString());
    setReturnToScheduleCheckAfterAdd(true);
    setShowScheduleCheckModal(false);
    setShowScheduleModal(true);
    loadSelectedDateSchedules(scheduleCheckDate || getTodayDateString());
  }

  function moveScheduleCheckDate(dayAmount) {
    const base = scheduleCheckDate ? new Date(scheduleCheckDate) : new Date();
    base.setDate(base.getDate() + dayAmount);
    setScheduleCheckDate(getDateOnlyString(base));
  }

  function moveScheduleCheckMonth(monthAmount) {
    const base = scheduleCheckDate ? new Date(scheduleCheckDate) : new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + monthAmount);
    setScheduleCheckDate(getDateOnlyString(base));
  }

  function getScheduleCheckMonthTitle() {
    const base = scheduleCheckDate ? new Date(scheduleCheckDate) : new Date();
    return `${base.getFullYear()}년 ${String(base.getMonth() + 1).padStart(2, "0")}월`;
  }

  function getScheduleCheckCalendarDays() {
    const base = scheduleCheckDate ? new Date(scheduleCheckDate) : new Date();
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const cells = [];

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      cells.push({ key: `empty-start-${i}`, empty: true });
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(year, month, day);
      const dateText = getDateOnlyString(date);
      const count = scheduleCheckMonthList.filter(
        (schedule) => schedule.schedule_date === dateText && schedule.status !== "cancelled"
      ).length;

      cells.push({
        key: dateText,
        dateText,
        day,
        count,
        selected: dateText === scheduleCheckDate,
        today: dateText === getTodayDateString(),
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ key: `empty-end-${cells.length}`, empty: true });
    }

    return cells;
  }

  function openActionModal(schedule) {
    setActionModalSchedule(schedule);
  }

  function closeActionModal() {
    setActionModalSchedule(null);
  }

  function openMemberListModal(title = "회원 목록", resetSearch = false, inactiveMode = false) {
    if (resetSearch) setSearch("");
    setMemberSortMode("default");
    setShowInactiveMembers(inactiveMode);
    setMemberListTitle(inactiveMode ? "비활성 회원" : title);
    setShowMemberListModal(true);
  }

  function closeMemberListModal() {
    setShowMemberListModal(false);
  }

  function openDetailFromMemberList(member) {
    setReturnToMemberListAfterDetail(true);
    setShowMemberListModal(false);
    openDetail(member, "menu");
  }

  async function saveScheduleRow(row, options = {}) {
    const { error } = await supabase.from("schedules").insert(row);

    if (error) {
      const message = String(error.message || "");

      if (message.includes("SCHEDULE_CAPACITY_EXCEEDED")) {
        alert("이미 해당 시간대 예약 인원이 2명입니다.\n그래도 추가가 필요한 경우 중복 경고창에서 '그래도 추가'를 눌러주세요.");
        return false;
      }

      alert("스케줄 저장 실패: " + error.message);
      return false;
    }

    if (options.skipAfterSave) {
      return true;
    }

    const shouldReturnToScheduleCheck = returnToScheduleCheckAfterAdd;

    closeScheduleModal();
    closeScheduleConflictModal();

    await loadSchedules(getTodayDateString());
    await loadScheduleCheckList(row.schedule_date);
    setScheduleCheckDate(row.schedule_date);

    if (shouldReturnToScheduleCheck) {
      setShowScheduleCheckModal(true);
    }

    alert("스케줄이 저장되었습니다.");
    return true;
  }

  async function finishScheduleSave(date, message = "스케줄이 저장되었습니다.") {
    const shouldReturnToScheduleCheck = returnToScheduleCheckAfterAdd;

    closeScheduleModal();
    closeScheduleConflictModal();

    await loadSchedules(getTodayDateString());
    await loadScheduleCheckList(date);
    setScheduleCheckDate(date);

    if (shouldReturnToScheduleCheck) {
      setShowScheduleCheckModal(true);
    }

    alert(message);
  }

  async function addSchedule(forceSave = false) {
    if (!scheduleMemberId) return alert("회원을 선택하세요.");
    if (!scheduleDate) return alert("날짜를 선택하세요.");
    if (!scheduleStartTime) return alert("시작 시간을 입력하세요.");

    if (scheduleType === "group" && scheduleSecondMemberId && scheduleSecondMemberId === scheduleMemberId) {
      alert("그룹PT 두 번째 회원은 첫 번째 회원과 달라야 합니다.");
      return;
    }

    if (editingSchedule && scheduleSecondMemberId) {
      alert("스케줄 수정 시에는 두 번째 회원을 추가할 수 없습니다. 그룹PT 추가는 새 스케줄 등록에서 해주세요.");
      return;
    }

    const startMinutes = timeToMinutes(scheduleStartTime);
    const endTime = getAutoScheduleEndTime(scheduleStartTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      alert("종료 시간은 시작 시간보다 뒤여야 합니다.");
      return;
    }

    const memberIds = scheduleType === "group" && scheduleSecondMemberId
      ? [scheduleMemberId, scheduleSecondMemberId]
      : [scheduleMemberId];

    const rows = memberIds.map((memberId) => ({
      member_id: memberId,
      schedule_date: scheduleDate,
      start_time: scheduleStartTime,
      end_time: endTime,
      type: scheduleType,
      memo: scheduleMemo.trim(),
      allow_over_capacity: false,
    }));

    const { data: sameDateSchedules, error: checkError } = await supabase
      .from("schedules")
      .select("*, members(*)")
      .eq("schedule_date", scheduleDate)
      .order("start_time", { ascending: true });

    if (checkError) {
      alert("중복 확인 실패: " + checkError.message);
      return;
    }

    const conflicts = (sameDateSchedules || []).filter((schedule) => {
      if (schedule.status === "cancelled") return false;
      if (editingSchedule && schedule.id === editingSchedule.id) return false;

      const existingStart = timeToMinutes(schedule.start_time);
      const existingEnd = timeToMinutes(schedule.end_time || addMinutesToTime(schedule.start_time, 60));

      if (existingStart === null || existingEnd === null) return false;

      return existingStart < endMinutes && existingEnd > startMinutes;
    });

    if (conflicts.length > 0 && !forceSave) {
      if (editingSchedule) {
        setPendingSchedule({
          ...rows[0],
          id: editingSchedule.id,
          __mode: "edit",
        });
      } else {
        setPendingSchedule(
          rows.length === 1
            ? rows[0]
            : {
                __mode: "group",
                rows,
              }
        );
      }

      setConflictSchedules(conflicts);
      setShowScheduleConflictModal(true);
      await loadSelectedDateSchedules(scheduleDate);
      return;
    }

    if (editingSchedule) {
      const { error } = await supabase
        .from("schedules")
        .update(rows[0])
        .eq("id", editingSchedule.id);

      if (error) {
        alert("스케줄 수정 실패: " + error.message);
        return;
      }

      closeScheduleModal();
      await loadSchedules(getTodayDateString());
      await loadSelectedDateSchedules(scheduleDate);

      if (returnToScheduleCheckAfterAdd) {
        setShowScheduleCheckModal(true);
        await loadScheduleCheckList(scheduleDate);
      }

      alert("스케줄이 수정되었습니다.");
      return;
    }

    for (const row of rows) {
      const ok = await saveScheduleRow(row, { skipAfterSave: true });
      if (!ok) return;
    }

    await finishScheduleSave(
      scheduleDate,
      rows.length > 1 ? "그룹PT 스케줄이 저장되었습니다." : "스케줄이 저장되었습니다."
    );
  }

  async function forceAddSchedule() {
    if (!pendingSchedule) return;

    if (pendingSchedule.__mode === "edit") {
      const { __mode, id, ...row } = pendingSchedule;

      const { error } = await supabase
        .from("schedules")
        .update({
          ...row,
          allow_over_capacity: true,
        })
        .eq("id", id);

      if (error) {
        alert("스케줄 수정 실패: " + error.message);
        return;
      }

      setShowScheduleConflictModal(false);
      setPendingSchedule(null);
      closeScheduleModal();
      await loadSchedules(getTodayDateString());
      await loadScheduleCheckList(row.schedule_date);
      alert("스케줄이 수정되었습니다.");
      return;
    }

    if (pendingSchedule.__mode === "group") {
      const date = pendingSchedule.rows[0]?.schedule_date || getTodayDateString();

      for (const row of pendingSchedule.rows) {
        const ok = await saveScheduleRow({
          ...row,
          allow_over_capacity: true,
        }, { skipAfterSave: true });
        if (!ok) return;
      }

      await finishScheduleSave(date, "그룹PT 스케줄이 저장되었습니다.");
      return;
    }

    await saveScheduleRow({
      ...pendingSchedule,
      allow_over_capacity: true,
    });
  }

  async function deleteSchedule(schedule) {
    if (!confirm("이 스케줄을 삭제할까요?")) return;

    const { error } = await supabase.from("schedules").delete().eq("id", schedule.id);

    if (error) {
      alert("스케줄 삭제 실패: " + error.message);
      return;
    }

    await loadSchedules(getTodayDateString());
    if (showScheduleModal) {
      await loadSelectedDateSchedules(scheduleDate);
    }
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
  }

  function getScheduleTypeText(type) {
    if (type === "ot") return "OT";
    if (type === "consult") return "상담";
    if (type === "group") return "그룹PT";
    return "PT";
  }

  function getMemberTypeText(type) {
    if (type === "pt") return "PT회원";
    if (type === "group") return "그룹PT회원";
    if (type === "vip") return "VIP";
    return "일반회원";
  }

  function getMemberTypeStyle(type) {
    if (type === "vip") return styles.vipBadge;
    if (type === "group") return styles.groupMemberBadge;
    if (type === "pt") return styles.ptMemberBadge;
    return styles.generalMemberBadge;
  }

  function formatTime(time) {
    if (!time) return "";
    const [hourText, minuteText] = String(time).split(":");
    const hour = Number(hourText);
    const minute = minuteText || "00";
    const period = hour >= 12 ? "오후" : "오전";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${period} ${displayHour}:${minute}`;
  }

  function getTimeOptions() {
    const options = [];

    for (let hour = 11; hour <= 22; hour += 1) {
      [0, 10, 20, 30, 40, 50].forEach((minute) => {
        if (hour === 22 && minute > 0) return;

        const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        options.push(value);
      });
    }

    return options;
  }

  function normalizeTimeValue(time) {
    if (!time) return "";
    const [hourText, minuteText] = String(time).split(":");
    return `${String(hourText).padStart(2, "0")}:${String(minuteText || "00").padStart(2, "0")}`;
  }

  function timeToMinutes(time) {
    if (!time) return null;

    const [hourText, minuteText] = normalizeTimeValue(time).split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText || 0);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

    return hour * 60 + minute;
  }

  function formatScheduleRange(schedule) {
    const endTime = schedule.end_time || addMinutesToTime(schedule.start_time, 60);
    return `${formatTime(schedule.start_time)} ~ ${formatTime(endTime)}`;
  }

  function formatGoogleCalendarDateTime(dateText, timeText) {
    const [year, month, day] = String(dateText || getTodayDateString()).split("-");
    const [hour, minute] = normalizeTimeValue(timeText || "00:00").split(":");

    return `${year}${month}${day}T${hour}${minute}00`;
  }

  function formatIcsUtcDateTime(dateText, timeText) {
    const [year, month, day] = String(dateText || getTodayDateString()).split("-").map(Number);
    const [hour, minute] = normalizeTimeValue(timeText || "00:00").split(":").map(Number);

    const date = new Date(year, month - 1, day, hour, minute, 0);

    return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
  }

  function addToGoogleCalendar(schedule) {
    const member = getScheduleMember(schedule) || schedule.members;
    const endTime = schedule.end_time || addMinutesToTime(schedule.start_time, 60);

    const start = formatGoogleCalendarDateTime(schedule.schedule_date, schedule.start_time);
    const end = formatGoogleCalendarDateTime(schedule.schedule_date, endTime);

    const title = `${getScheduleTypeText(schedule.type)} · ${member?.name || "회원"}`;
    const details = [
      `Spotainer 스케줄`,
      member ? `회원: ${member.name}` : "",
      member ? `PT 잔여: ${member.pt_remaining || 0}회` : "",
      schedule.memo ? `메모: ${schedule.memo}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const location = centerAddress || centerName || "";

    const url =
      "https://www.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${start}/${end}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(location)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function escapeIcsText(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function addToDeviceCalendar(schedule) {
    const member = getScheduleMember(schedule) || schedule.members;
    const endTime = schedule.end_time || addMinutesToTime(schedule.start_time, 60);

    const start = formatIcsUtcDateTime(schedule.schedule_date, schedule.start_time);
    const end = formatIcsUtcDateTime(schedule.schedule_date, endTime);
    const nowStamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");

    const title = `${getScheduleTypeText(schedule.type)} · ${member?.name || "회원"}`;
    const details = [
      "Spotainer 스케줄",
      member ? `회원: ${member.name}` : "",
      member ? `PT 잔여: ${member.pt_remaining || 0}회` : "",
      schedule.memo ? `메모: ${schedule.memo}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const location = centerAddress || centerName || "";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "PRODID:-//Spotainer//Schedule//KO",
      "BEGIN:VEVENT",
      `UID:${schedule.id || Date.now()}@spotainer`,
      `DTSTAMP:${nowStamp}`,
      `SUMMARY:${escapeIcsText(title)}`,
      `DESCRIPTION:${escapeIcsText(details)}`,
      `LOCATION:${escapeIcsText(location)}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT10M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(title)} 10분 전`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const fileName = `${getScheduleTypeText(schedule.type)}_${member?.name || "회원"}_${schedule.schedule_date}.ics`
      .replace(/[\\/:*?"<>|]/g, "_");

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }


  function getSelectedDateActiveSchedules() {
    return selectedDateSchedules.filter((schedule) => schedule.status !== "cancelled");
  }

  function getSchedulePreviewStatus(schedule) {
    if (schedule.status === "cancelled") return { text: "취소", style: styles.scheduleCancelText };
    if (schedule.status === "noshow") return { text: "노쇼", style: styles.scheduleNoShowText };
    if (schedule.status === "completed" || (schedule.attendance_checked && schedule.pt_used)) {
      return { text: "완료", style: styles.scheduleDoneText };
    }

    return { text: "예약", style: styles.scheduleWarningText };
  }

  function getActiveSchedulesForDate(list = []) {
    return (list || []).filter((schedule) => schedule.status !== "cancelled");
  }

  function getSchedulesAtStartTime(list = [], startTime) {
    const target = normalizeTimeValue(startTime);

    return getActiveSchedulesForDate(list).filter(
      (schedule) => normalizeTimeValue(schedule.start_time) === target
    );
  }

  function getSlotLevel(count) {
    if (count >= 3) return "over";
    if (count >= 2) return "full";
    if (count === 1) return "one";
    return "empty";
  }

  function getSlotStyle(count) {
    const level = getSlotLevel(count);

    if (level === "over") return styles.scheduleSlotOver;
    if (level === "full") return styles.scheduleSlotFull;
    if (level === "one") return styles.scheduleSlotOne;

    return styles.scheduleSlotEmpty;
  }

  function getSlotLabel(count) {
    if (count >= 3) return `${count}/2 초과`;
    return `${count}/2`;
  }

  function addMinutesToTime(time, minutesToAdd) {
    if (!time) return "";

    const [hourText, minuteText] = String(time).split(":");
    const date = new Date();
    date.setHours(Number(hourText), Number(minuteText || 0), 0, 0);
    date.setMinutes(date.getMinutes() + minutesToAdd);

    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function getAutoScheduleEndTime(startTime) {
    return startTime ? addMinutesToTime(startTime, 60) : "";
  }

  function openScheduleMember(schedule) {
    const member = getFreshMember(schedule.member_id) || schedule.members;
    if (!member) return alert("연결된 회원 정보를 찾을 수 없습니다.");
    openDetail(member, "menu");
  }

  function getFreshMember(memberId) {
    return members.find((member) => member.id === memberId);
  }

  function getScheduleMember(schedule) {
    return getFreshMember(schedule.member_id) || schedule.members;
  }

  async function scheduleCheckAttendance(schedule) {
    const member = getScheduleMember(schedule);
    if (!member) return alert("연결된 회원 정보를 찾을 수 없습니다.");

    await checkAttendance(member, true);
    await loadSchedules(getTodayDateString());
  }

  async function scheduleMinusPt(schedule) {
    const member = getScheduleMember(schedule);
    if (!member) return alert("연결된 회원 정보를 찾을 수 없습니다.");

    await minusPt(member);
    await loadSchedules(getTodayDateString());
  }

  async function completeScheduleClass(schedule) {
    const member = getScheduleMember(schedule);
    if (!member) return alert("연결된 회원 정보를 찾을 수 없습니다.");

    const shouldUsePt = schedule.type === "pt" || schedule.type === "group";

    if (schedule.status === "completed") {
      alert("이미 완료 처리된 스케줄입니다.");
      return;
    }

    if (schedule.status === "noshow") {
      alert("노쇼 처리된 스케줄입니다. 스케줄을 새로 등록하세요.");
      return;
    }

    if (schedule.status === "cancelled") {
      alert("취소 처리된 스케줄입니다. 스케줄을 새로 등록하세요.");
      return;
    }

    if (schedule.attendance_checked && (schedule.pt_used || !shouldUsePt)) {
      const { error } = await supabase
        .from("schedules")
        .update({ status: "completed" })
        .eq("id", schedule.id);

      if (error) {
        alert("스케줄 완료 처리 실패: " + error.message);
        return;
      }

      closeActionModal();
      await loadSchedules(getTodayDateString());
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
      alert("이미 출석과 PT 차감이 완료되어 완료 처리만 했습니다.");
      return;
    }

    if (
      !confirm(
        shouldUsePt
          ? `${member.name} 수업을 완료 처리할까요?\n출석 체크와 PT 1회 차감이 함께 진행됩니다.`
          : `${member.name} ${getScheduleTypeText(schedule.type)} 일정을 완료 처리할까요?\n출석 체크만 진행되고 PT는 차감하지 않습니다.`
      )
    ) {
      return;
    }

    if (!schedule.attendance_checked) {
      const { error: attendanceError } = await supabase.from("attendance_logs").insert({
        member_id: member.id,
      });

      if (attendanceError) {
        alert("출석 체크 실패: " + attendanceError.message);
        return;
      }
    }

    if (shouldUsePt && !schedule.pt_used) {
      if ((member.pt_remaining || 0) <= 0) {
        alert("남은 PT가 없습니다.");
        return;
      }

      const { error: memberError } = await supabase
        .from("members")
        .update({ pt_remaining: (member.pt_remaining || 0) - 1 })
        .eq("id", member.id);

      if (memberError) {
        alert("PT 차감 실패: " + memberError.message);
        return;
      }

      const { error: logError } = await supabase.from("pt_logs").insert({
        member_id: member.id,
        type: "use",
        amount: 1,
      });

      if (logError) {
        alert("PT 사용 기록 저장 실패: " + logError.message);
        return;
      }

      setLastAction({
        type: "pt",
        memberId: member.id,
        previousPt: member.pt_remaining || 0,
        memberName: member.name,
      });
    }

    const { error } = await supabase
      .from("schedules")
      .update({
        status: "completed",
        attendance_checked: true,
        pt_used: shouldUsePt ? true : false,
      })
      .eq("id", schedule.id);

    if (error) {
      alert("스케줄 완료 처리 실패: " + error.message);
      return;
    }

    closeActionModal();
    await loadMembers();
    await loadSchedules(getTodayDateString());

    const returnDate = schedule.schedule_date || scheduleCheckDate || getTodayDateString();
    setScheduleCheckDate(returnDate);
    await loadScheduleCheckList(returnDate);

    // 수업 완료 후에는 운동 기록 화면이 바로 보여야 하므로,
    // 스케줄 확인 팝업이 운동 기록 화면 위에 다시 뜨지 않게 닫아둡니다.
    setShowScheduleCheckModal(false);

    await openWorkout(member, "scheduleCheck");
    setWorkoutMode("add");
  }

  async function markScheduleNoShow(schedule) {
    const member = getScheduleMember(schedule);
    if (!member) return alert("연결된 회원 정보를 찾을 수 없습니다.");

    const shouldUsePt = schedule.type === "pt" || schedule.type === "group";

    if (!shouldUsePt) {
      alert(`${getScheduleTypeText(schedule.type)} 일정은 PT 차감이 없어서 노쇼 처리하지 않습니다. 취소 또는 완료로 처리하세요.`);
      return;
    }

    if (schedule.status === "completed") {
      alert("이미 수업 완료 처리된 스케줄입니다.");
      return;
    }

    if (schedule.status === "cancelled") {
      alert("취소 처리된 스케줄입니다. 스케줄을 새로 등록하세요.");
      return;
    }

    if (schedule.status === "noshow") {
      alert("이미 노쇼 처리된 스케줄입니다.");
      return;
    }

    if (
      !confirm(
        `${member.name} 노쇼 처리할까요?\n출석은 기록하지 않고 PT 1회만 차감됩니다.`
      )
    ) {
      return;
    }

    if (!schedule.pt_used) {
      if ((member.pt_remaining || 0) <= 0) {
        alert("남은 PT가 없습니다.");
        return;
      }

      const { error: memberError } = await supabase
        .from("members")
        .update({ pt_remaining: (member.pt_remaining || 0) - 1 })
        .eq("id", member.id);

      if (memberError) {
        alert("PT 차감 실패: " + memberError.message);
        return;
      }

      const { error: logError } = await supabase.from("pt_logs").insert({
        member_id: member.id,
        type: "use",
        amount: 1,
      });

      if (logError) {
        alert("PT 사용 기록 저장 실패: " + logError.message);
        return;
      }

      setLastAction({
        type: "pt",
        memberId: member.id,
        previousPt: member.pt_remaining || 0,
        memberName: member.name,
      });
    }

    const { error } = await supabase
      .from("schedules")
      .update({
        status: "noshow",
        attendance_checked: false,
        pt_used: true,
      })
      .eq("id", schedule.id);

    if (error) {
      alert("노쇼 처리 실패: " + error.message);
      return;
    }

    closeActionModal();
    await loadMembers();
    await loadSchedules(getTodayDateString());
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
  }

  async function markScheduleCancelled(schedule) {
    const member = getScheduleMember(schedule);
    const memberName = member?.name || "해당 회원";

    if (schedule.status === "completed") {
      alert("이미 수업 완료 처리된 스케줄입니다.");
      return;
    }

    if (schedule.status === "noshow") {
      alert("이미 노쇼 처리된 스케줄입니다.");
      return;
    }

    if (schedule.status === "cancelled") {
      alert("이미 취소 처리된 스케줄입니다.");
      return;
    }

    if (
      !confirm(
        `${memberName} 스케줄을 취소 처리할까요?\n출석 기록과 PT 차감은 하지 않습니다.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("schedules")
      .update({
        status: "cancelled",
        attendance_checked: false,
        pt_used: false,
      })
      .eq("id", schedule.id);

    if (error) {
      alert("취소 처리 실패: " + error.message);
      return;
    }

    closeActionModal();
    await loadSchedules(getTodayDateString());
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
  }

  const activeMembers = members.filter((member) => member.is_active !== false);

  const visibleMembers = members.filter((member) =>
    showInactiveMembers ? member.is_active === false : member.is_active !== false
  );

  const filteredMembers = visibleMembers
    .filter((member) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;

      return (
        member.name?.toLowerCase().includes(q) ||
        member.phone?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (memberSortMode === "sales") {
        const paidA = Number(a.total_paid || 0);
        const paidB = Number(b.total_paid || 0);

        if (paidA !== paidB) return paidB - paidA;

        return new Date(b.created_at) - new Date(a.created_at);
      }

      const ptA = a.pt_remaining || 0;
      const ptB = b.pt_remaining || 0;

      if (ptA !== ptB) return ptA - ptB;

      const daysA = daysSince(a.latest_visit) ?? 999;
      const daysB = daysSince(b.latest_visit) ?? 999;

      if (daysA !== daysB) return daysB - daysA;

      return new Date(b.created_at) - new Date(a.created_at);
    });

  function daysSince(date) {
    if (!date) return null;
    return Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function isToday(date) {
    if (!date) return false;

    const target = new Date(date);
    const now = new Date();

    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    );
  }

  function getDateOnlyString(date = new Date()) {
    const target = new Date(date);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDaysDateString(days) {
    const target = new Date();
    target.setDate(target.getDate() + days);
    return getDateOnlyString(target);
  }

  function isContactSuccess(member) {
    return member?.last_contact_result === "success" || member?.last_contact_result === "re_register";
  }

  function isContactFuture(member) {
    if (!member?.next_contact_date) return false;
    return String(member.next_contact_date) > getDateOnlyString();
  }

  function isContactDue(member) {
    if (!member?.next_contact_date) return false;
    return String(member.next_contact_date) <= getDateOnlyString();
  }

  function shouldShowForContact(member) {
    if (isContactSuccess(member)) return false;
    if (isContactFuture(member)) return false;
    return true;
  }

  function getContactResultText(result) {
    if (result === "re_register") return "재등록 성공";
    if (result === "success") return "성공";
    if (result === "fail") return "실패";
    if (result === "pending") return "보류";
    return "미기록";
  }

  function getNextContactDateByResult(result) {
    if (result === "pending") return addDaysDateString(3);
    if (result === "fail") return addDaysDateString(7);
    return null;
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
    rejoin: activeMembers.filter((m) => {
      const pt = m.pt_remaining || 0;
      return pt >= 3 && pt <= 5 && shouldShowForContact(m);
    }),
    urgent: activeMembers.filter((m) => {
      const pt = m.pt_remaining || 0;
      return pt <= 2 && shouldShowForContact(m);
    }),
    dormant: activeMembers.filter((m) => {
      const d = daysSince(m.latest_visit);
      return (d === null || d >= 14) && shouldShowForContact(m);
    }),
  };

  summaryGroups.vipDormant = summaryGroups.dormant.filter((m) => m.is_vip);


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
    vipDormant: {
      title: "VIP 연락",
      desc: "누적 결제가 높은 연락 필요 회원",
      list: summaryGroups.vipDormant,
    },
  };

  const autoCareMembers = activeMembers.map((m) => {
    const d = daysSince(m.latest_visit);
    const canShow = shouldShowForContact(m);
    const dueFollowUp = isContactDue(m);

    const attendanceStatus =
      canShow && d === null ? "출석 없음" :
      canShow && d >= 14 ? "14일 미출석" :
      canShow && d >= 7 ? "7일 미출석" :
      null;

    const ptStatus =
      canShow && (m.pt_remaining || 0) <= 2 ? "강한 경고" :
      canShow && (m.pt_remaining || 0) <= 5 ? "재등록 상담" :
      null;

    const latestInbody = (m.inbody_logs || [])
      .map((log) => log.measured_at)
      .filter(Boolean)
      .sort()
      .reverse()[0];

    const inbodyDays = latestInbody ? daysSince(latestInbody) : null;
    const inbodyStatus =
      canShow && latestInbody ? (inbodyDays >= 30 ? "인바디 필요" : null) :
      canShow && !latestInbody ? "인바디 없음" :
      null;

    const followUpStatus =
      dueFollowUp && !isContactSuccess(m)
        ? `재연락 · ${getContactResultText(m.last_contact_result)}`
        : null;

    return {
      ...m,
      attendanceStatus,
      ptStatus,
      inbodyStatus,
      followUpStatus,
    };
  });

  const attentionList = autoCareMembers
    .filter((m) => m.attendanceStatus || m.ptStatus || m.inbodyStatus || m.followUpStatus)
    .sort((a, b) => {
      const score = (m) => {
        if (m.ptStatus === "강한 경고") return 0;
        if (m.followUpStatus) return 1;
        if (m.ptStatus === "재등록 상담") return 2;
        if (m.attendanceStatus) return 3;
        return 4;
      };

      return score(a) - score(b);
    });

  const attentionCounts = {
    rejoin: attentionList.filter((m) => m.ptStatus === "재등록 상담").length,
    urgent: attentionList.filter((m) => m.ptStatus === "강한 경고").length,
    dormant: attentionList.filter((m) => m.attendanceStatus || m.inbodyStatus).length,
    vip: attentionList.filter((m) => m.is_vip || m.member_type === "vip").length,
  };

  const monthStartText = getDateOnlyString(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const reRegisterStats = {
    success: activeMembers.filter(
      (m) => m.re_register_success_at && String(m.re_register_success_at).slice(0, 10) >= monthStartText
    ).length,
    converted: activeMembers.filter(
      (m) => m.re_register_converted_at && String(m.re_register_converted_at).slice(0, 10) >= monthStartText
    ).length,
  };

  reRegisterStats.rate = reRegisterStats.success
    ? Math.round((reRegisterStats.converted / reRegisterStats.success) * 100)
    : 0;

  function getContactCardBorderStyle() {
    if (attentionCounts.urgent > 0) return styles.contactCardRed;
    if (attentionCounts.rejoin > 0) return styles.contactCardBlue;
    if (attentionCounts.dormant > 0) return styles.contactCardGreen;
    if (attentionCounts.vip > 0) return styles.contactCardGold;
    return styles.contactCardDefault;
  }

  async function addMember() {
    if (!name.trim()) return alert("이름을 입력하세요.");

    await supabase.from("members").insert({
      name: name.trim(),
      phone: phone.trim(),
      age: age ? Number(age) : null,
      height: height ? Number(height) : null,
      goal: goal.trim(),
      note: note.trim(),
      memo: memo.trim(),
      member_type: memberType,
      pt_remaining: 0,
      is_active: true,
    });

    setName("");
    setPhone("");
    setAge("");
    setHeight("");
    setGoal("");
    setNote("");
    setMemo("");
    setMemberType("general");
    setSearch("");
    setShowAddModal(false);
    loadMembers();
  }

  function startEdit(member) {
    setEditModalMember(member);
    setEditingId(null);
    setEditName(member.name);
    setEditPhone(member.phone || "");
    setEditAge(member.age || "");
    setEditHeight(member.height || "");
    setEditPtRemaining(member.pt_remaining ?? 0);
    setEditGoal(member.goal || "");
    setEditNote(member.note || "");
    setEditMemo(member.memo || "");
    setEditMemberType(member.member_type || ((member.pt_remaining || 0) > 0 ? "pt" : "general"));
  }

  function closeEditModal() {
    setEditModalMember(null);
    setEditingId(null);
    setEditName("");
    setEditPhone("");
    setEditAge("");
    setEditHeight("");
    setEditPtRemaining("");
    setEditGoal("");
    setEditNote("");
    setEditMemo("");
    setEditMemberType("general");
  }

  async function saveEdit(id) {
    if (!editName.trim()) return alert("이름을 입력하세요.");
    if (editPtRemaining !== "" && Number(editPtRemaining) < 0) {
      return alert("PT 잔여 횟수는 0 이상으로 입력하세요.");
    }

    await supabase
      .from("members")
      .update({
        name: editName.trim(),
        phone: editPhone.trim(),
        age: editAge ? Number(editAge) : null,
        height: editHeight ? Number(editHeight) : null,
        pt_remaining: editPtRemaining === "" ? 0 : Number(editPtRemaining),
        goal: editGoal.trim(),
        note: editNote.trim(),
        memo: editMemo.trim(),
        member_type: editMemberType,
      })
      .eq("id", id);

    setEditingId(null);

    if (selectedMember?.id === id) {
      setSelectedMember({
        ...selectedMember,
        name: editName.trim(),
        phone: editPhone.trim(),
        age: editAge ? Number(editAge) : null,
        height: editHeight ? Number(editHeight) : null,
        pt_remaining: editPtRemaining === "" ? 0 : Number(editPtRemaining),
        goal: editGoal.trim(),
        note: editNote.trim(),
        memo: editMemo.trim(),
        member_type: editMemberType,
      });
    }

    closeEditModal();
    loadMembers();
  }

  async function deactivateMember(member) {
    if (
      !confirm(
        `${member.name} 회원을 비활성화할까요?\n회원 기록, PT 기록, 매출 기록은 삭제되지 않고 보존됩니다.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("members")
      .update({ is_active: false })
      .eq("id", member.id);

    if (error) {
      alert("회원 비활성화 실패: " + error.message);
      return;
    }

    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
      setDetailMode(null);
    }

    await loadMembers();
    await loadSales();
    alert(`${member.name} 회원이 비활성화되었습니다.`);
  }

  async function reactivateMember(member) {
    if (!confirm(`${member.name} 회원을 다시 활성화할까요?`)) return;

    const { error } = await supabase
      .from("members")
      .update({ is_active: true })
      .eq("id", member.id);

    if (error) {
      alert("회원 복구 실패: " + error.message);
      return;
    }

    await loadMembers();
    await loadSales();
    alert(`${member.name} 회원이 다시 활성화되었습니다.`);
  }

  async function minusPt(member) {
    if (member.pt_remaining <= 0) return alert("남은 PT가 없습니다.");

    const before = member.pt_remaining;
    const after = before - 1;

    const { error } = await supabase
      .from("members")
      .update({
        pt_remaining: after,
        member_type:
          member.member_type === "vip" || member.member_type === "group"
            ? member.member_type
            : "pt",
      })
      .eq("id", member.id);

    if (error) return alert("PT 차감 실패: " + error.message);

    const { error: logError } = await supabase.from("pt_logs").insert({
      member_id: member.id,
      type: "use",
      amount: 1,
    });

    if (logError) return alert("PT 사용 기록 저장 실패: " + logError.message);

    const updatedMember = {
      ...member,
      pt_remaining: after,
      latest_pt: new Date().toISOString(),
    };

    if (selectedMember?.id === member.id) {
      await openDetail(updatedMember, detailMode || "menu");
    }

    if (workoutMember?.id === member.id) {
      setWorkoutMember(updatedMember);
    }

    setLastAction({
      type: "pt",
      memberId: member.id,
      previousPt: before,
      memberName: member.name,
    });

    await loadMembers();
    await loadSchedules(getTodayDateString());
  }

  function openPtModal(member) {
    setPtModalMember(member);
    setSelectedPtAmount("");
    setPtTotalPrice("");
    setPtAddType("paid");
  }

  function closePtModal() {
    setPtModalMember(null);
    setSelectedPtAmount("");
    setPtTotalPrice("");
    setPtAddType("paid");
  }

  function onlyNumber(value) {
    return String(value || "").replace(/[^0-9]/g, "");
  }

  function formatWon(value) {
    const number = Number(onlyNumber(value));
    if (!number) return "";
    return number.toLocaleString("ko-KR");
  }

  function getPricePerSession() {
    const amount = Number(selectedPtAmount || 0);
    const total = Number(onlyNumber(ptTotalPrice));

    if (!amount || !total) return 0;

    return Math.round(total / amount);
  }

  async function addPt(member, amount, totalPriceValue = "") {
    const after = (member.pt_remaining || 0) + amount;
    const totalPrice = Number(onlyNumber(totalPriceValue));
    const pricePerSession = amount && totalPrice ? Math.round(totalPrice / amount) : null;
    const canConnectReRegister = !!member.re_register_flag && totalPrice > 0;
    const connectReRegister = canConnectReRegister
      ? confirm(`${member.name} 회원은 최근 재등록 성공 상태입니다.\n이번 결제와 연결할까요?`)
      : false;

    const memberUpdate = {
      pt_remaining: after,
      member_type:
        member.member_type === "vip" || member.member_type === "group"
          ? member.member_type
          : "pt",
    };

    if (connectReRegister) {
      memberUpdate.re_register_flag = false;
      memberUpdate.re_register_converted_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("members")
      .update(memberUpdate)
      .eq("id", member.id);

    if (error) return alert("이용권 추가 실패: " + error.message);

    const { error: logError } = await supabase.from("pt_logs").insert({
      member_id: member.id,
      type: "add",
      amount,
      total_price: totalPrice || null,
      price_per_session: pricePerSession,
    });

    if (logError) return alert("이용권 추가 기록 저장 실패: " + logError.message);

    const updatedMember = {
      ...member,
      ...memberUpdate,
      pt_remaining: after,
    };

    setPtModalMember(null);
    setSelectedPtAmount("");
    setPtTotalPrice("");

    if (selectedMember?.id === member.id) {
      await openDetail(updatedMember, detailMode || "menu");
    }

    if (workoutMember?.id === member.id) {
      setWorkoutMember(updatedMember);
    }

    await loadMembers();
    await loadSchedules(getTodayDateString());
    await loadSales();
  }

  async function submitPtAdd() {
    if (!ptModalMember) return;

    const amount = Number(selectedPtAmount);
    const totalPrice = Number(onlyNumber(ptTotalPrice));

    if (!amount) {
      alert("추가할 PT 회차를 선택하세요.");
      return;
    }

    if (ptAddType === "paid" && !totalPrice) {
      alert("결제금액을 입력하세요.");
      return;
    }

    await addPt(ptModalMember, amount, ptAddType === "event" ? "0" : ptTotalPrice);
  }

  async function cancelPtUse(log) {
    if (!confirm("이 PT 차감 기록을 취소할까요?")) return;

    const { data: member } = await supabase
      .from("members")
      .select("pt_remaining")
      .eq("id", log.member_id)
      .single();

    const after = (member?.pt_remaining || 0) + log.amount;

    const { error: memberError } = await supabase
      .from("members")
      .update({ pt_remaining: after })
      .eq("id", log.member_id);

    if (memberError) return alert("PT 복구 실패: " + memberError.message);

    const { error: logError } = await supabase
      .from("pt_logs")
      .update({
        is_cancelled: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", log.id);

    if (logError) return alert("PT 차감 취소 실패: " + logError.message);

    if (selectedMember) {
      await openDetail(
        {
          ...selectedMember,
          pt_remaining: after,
        },
        "pt"
      );
    }

    await loadMembers();
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

  async function checkAttendance(member, askPtAfter = false) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

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

    alert(`${member.name} 출석 체크되었습니다.`);

    await loadMembers();
    await loadSchedules(getTodayDateString());

    if (askPtAfter && confirm(`${member.name} PT도 1회 차감할까요?`)) {
      await minusPt({
        ...member,
        pt_remaining: member.pt_remaining || 0,
      });
    }
  }

  function openContactModal(member, defaultResult = "pending") {
    setContactModalMember(member);
    setContactResult(defaultResult);
    setContactNote("");
  }

  function closeContactModal() {
    setContactModalMember(null);
    setContactResult("pending");
    setContactNote("");
  }

  async function saveContactResult() {
    if (!contactModalMember) return;

    const now = new Date().toISOString();
    const nextDate = getNextContactDateByResult(contactResult);
    const isReRegisterSuccess = contactResult === "re_register";

    const { error } = await supabase
      .from("members")
      .update({
        last_contacted_at: now,
        last_contact_result: contactResult,
        next_contact_date: nextDate,
        contact_note: contactNote.trim() || null,
        re_register_flag: isReRegisterSuccess ? true : contactModalMember.re_register_flag || false,
        re_register_success_at: isReRegisterSuccess ? now : contactModalMember.re_register_success_at || null,
      })
      .eq("id", contactModalMember.id);

    if (error) {
      alert("연락 결과 저장 실패: " + error.message);
      return;
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.id === contactModalMember.id
          ? {
              ...m,
              last_contacted_at: now,
              last_contact_result: contactResult,
              next_contact_date: nextDate,
              contact_note: contactNote.trim() || null,
              re_register_flag: isReRegisterSuccess ? true : m.re_register_flag || false,
              re_register_success_at: isReRegisterSuccess ? now : m.re_register_success_at || null,
            }
          : m
      )
    );

    const resultText = getContactResultText(contactResult);
    const nextText = nextDate ? `\n다음 연락일: ${nextDate}` : "";
    alert(`${contactModalMember.name} 연락 결과가 저장되었습니다.\n결과: ${resultText}${nextText}`);

    closeContactModal();
    await loadMembers();
  }

  function normalizePhone(phone) {
    return String(phone || "").replace(/[^0-9+]/g, "");
  }

  async function sendGroupSMS(type, targetMembers) {
    const validMembers = (targetMembers || []).filter((member) => normalizePhone(member.phone));

    if (validMembers.length === 0) {
      alert("문자를 보낼 전화번호가 있는 회원이 없습니다.");
      return;
    }

    let message = "";

    if (type === "rejoin") {
      message = "회원님, PT 잔여 횟수가 얼마 남지 않아 안내드립니다. 재등록 상담 도와드릴게요 🙂";
    } else if (type === "urgent") {
      message = "회원님, PT 잔여 횟수가 거의 소진되었습니다. 일정 확인 부탁드립니다.";
    } else {
      message = "회원님, 최근 방문이 없어 연락드립니다 🙂 편한 시간에 예약 부탁드립니다.";
    }

    const confirmSend = confirm(
      `${validMembers.length}명에게 문자를 보낼까요?\n\n확인을 누르면 문자앱이 열리고, 연락완료 처리됩니다.`
    );

    if (!confirmSend) return;

    const phones = validMembers.map((member) => normalizePhone(member.phone)).join(",");
    const now = new Date().toISOString();
    const nextDate = addDaysDateString(3);

    for (const member of validMembers) {
      await supabase
        .from("members")
        .update({
          last_contacted_at: now,
          last_contact_result: "pending",
          next_contact_date: nextDate,
          contact_note: "단체 문자 발송",
        })
        .eq("id", member.id);
    }

    window.location.href = `sms:${phones}?body=${encodeURIComponent(message)}`;

    await loadMembers();
    alert(`문자 발송 대상은 보류 처리되었고 ${nextDate}에 다시 연락 리스트에 뜹니다.`);
  }


  async function openDetail(member, mode = "menu") {
    setSelectedMember(member);
    setDetailMode(mode);
    setShowAllPtModal(false);
    setShowAllAttendanceModal(false);
    setShowAllInbodyModal(false);

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
    await loadInbodyLogs(member.id);
  }

  function closeDetail(shouldReturnToMemberList = true) {
    setSelectedMember(null);
    setDetailMode(null);
    setShowAllPtModal(false);
    setShowAllAttendanceModal(false);
    setShowAllInbodyModal(false);

    if (shouldReturnToMemberList && returnToMemberListAfterDetail) {
      setShowMemberListModal(true);
      setReturnToMemberListAfterDetail(false);
    }

    if (!shouldReturnToMemberList) {
      setReturnToMemberListAfterDetail(false);
    }
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

    if (selectedMember) await openDetail(selectedMember, "attendance");
    loadMembers();
  }


  function resetInbodyForm() {
    setInbodyMeasuredAt(getTodayDateString());
    setInbodyWeight("");
    setInbodySkeletalMuscle("");
    setInbodyBodyFatMass("");
    setInbodyBodyFatPercent("");
    setInbodyBmi("");
    setInbodyBasalMetabolicRate("");
    setInbodyVisceralFatLevel("");
    setInbodyMemo("");
    setEditingInbodyLog(null);
  }

  async function loadInbodyLogs(memberId) {
    if (!memberId) return;

    const { data, error } = await supabase
      .from("inbody_logs")
      .select("*")
      .eq("member_id", memberId)
      .order("measured_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      alert("인바디 기록 불러오기 실패: " + error.message);
      return;
    }

    setInbodyList(data || []);
  }

  function openInbodyAddModal() {
    resetInbodyForm();
    setShowInbodyModal(true);
  }

  function openInbodyEditModal(log) {
    setEditingInbodyLog(log);
    setInbodyMeasuredAt(log.measured_at || getTodayDateString());
    setInbodyWeight(log.weight ?? "");
    setInbodySkeletalMuscle(log.skeletal_muscle ?? "");
    setInbodyBodyFatMass(log.body_fat_mass ?? "");
    setInbodyBodyFatPercent(log.body_fat_percent ?? "");
    setInbodyBmi(log.bmi ?? "");
    setInbodyBasalMetabolicRate(log.basal_metabolic_rate ?? "");
    setInbodyVisceralFatLevel(log.visceral_fat_level ?? "");
    setInbodyMemo(log.memo || "");
    setShowInbodyModal(true);
  }

  function closeInbodyModal() {
    setShowInbodyModal(false);
    resetInbodyForm();
  }

  function toNumberOrNull(value) {
    const text = String(value ?? "").trim();
    if (!text) return null;

    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function getCalculatedBmi() {
    const weight = toNumberOrNull(inbodyWeight);
    const heightCm = toNumberOrNull(selectedMember?.height);

    if (!weight || !heightCm) return null;

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);

    return Math.round(bmi * 10) / 10;
  }

  function getRecommendedCaloriesFromBmr(bmrValue) {
    const bmr = toNumberOrNull(bmrValue);

    if (!bmr) {
      return {
        diet: null,
        maintain: null,
        gain: null,
      };
    }

    const maintain = Math.round(bmr * 1.35);
    const diet = Math.round(maintain * 0.8);
    const gain = Math.round(maintain * 1.1);

    return { diet, maintain, gain };
  }

  function renderRecommendedCalories(bmrValue, lightMode = false) {
    const calories = getRecommendedCaloriesFromBmr(bmrValue);
    const textStyle = lightMode ? styles.recommendCalorieTextLight : styles.recommendCalorieText;

    if (!calories.maintain) {
      return (
        <div style={lightMode ? styles.recommendCalorieBoxLight : styles.recommendCalorieBox}>
          <strong>권장섭취열량</strong>
          <p style={textStyle}>기초대사량을 입력하면 자동 계산됩니다.</p>
        </div>
      );
    }

    return (
      <div style={lightMode ? styles.recommendCalorieBoxLight : styles.recommendCalorieBox}>
        <strong>권장섭취열량</strong>
        <p style={textStyle}>감량 목표 {calories.diet.toLocaleString("ko-KR")}kcal</p>
        <p style={textStyle}>유지 목표 {calories.maintain.toLocaleString("ko-KR")}kcal</p>
        <p style={textStyle}>근육 증가 {calories.gain.toLocaleString("ko-KR")}kcal</p>
      </div>
    );
  }

  async function saveInbodyLog() {
    if (!selectedMember) return;
    if (!inbodyMeasuredAt) return alert("측정일을 선택하세요.");

    const row = {
      member_id: selectedMember.id,
      measured_at: inbodyMeasuredAt,
      weight: toNumberOrNull(inbodyWeight),
      skeletal_muscle: toNumberOrNull(inbodySkeletalMuscle),
      body_fat_mass: toNumberOrNull(inbodyBodyFatMass),
      body_fat_percent: toNumberOrNull(inbodyBodyFatPercent),
      bmi: getCalculatedBmi() ?? toNumberOrNull(inbodyBmi),
      basal_metabolic_rate: toNumberOrNull(inbodyBasalMetabolicRate),
      visceral_fat_level: toNumberOrNull(inbodyVisceralFatLevel),
      memo: inbodyMemo.trim(),
    };

    const request = editingInbodyLog
      ? supabase.from("inbody_logs").update(row).eq("id", editingInbodyLog.id)
      : supabase.from("inbody_logs").insert(row);

    const { error } = await request;

    if (error) {
      alert("인바디 기록 저장 실패: " + error.message);
      return;
    }

    closeInbodyModal();
    await loadInbodyLogs(selectedMember.id);
    alert(`${selectedMember.name} 인바디 기록이 ${editingInbodyLog ? "수정" : "저장"}되었습니다.`);
  }

  async function deleteInbodyLog(log) {
    if (!confirm("이 인바디 기록을 삭제할까요?")) return;

    const { error } = await supabase.from("inbody_logs").delete().eq("id", log.id);

    if (error) {
      alert("인바디 기록 삭제 실패: " + error.message);
      return;
    }

    if (selectedMember) await loadInbodyLogs(selectedMember.id);
  }

  function formatMetric(value, unit = "", decimals = 1) {
    if (value === null || value === undefined || value === "") return "미입력";

    const number = Number(value);
    if (!Number.isFinite(number)) return "미입력";

    const fixed =
      Number.isInteger(number) || decimals === 0
        ? String(Math.round(number))
        : number.toFixed(decimals).replace(/\.0$/, "");

    return `${fixed}${unit}`;
  }

  function formatDelta(current, previous, unit = "", decimals = 1, lowerIsBetter = false) {
    const currentNumber = Number(current);
    const previousNumber = Number(previous);

    if (!Number.isFinite(currentNumber) || !Number.isFinite(previousNumber)) {
      return { text: "비교 불가", style: styles.inbodyDeltaNeutral };
    }

    const diff = currentNumber - previousNumber;
    const absText =
      Math.abs(diff) % 1 === 0 || decimals === 0
        ? String(Math.round(Math.abs(diff)))
        : Math.abs(diff).toFixed(decimals).replace(/\.0$/, "");

    if (diff === 0) return { text: `변화 없음`, style: styles.inbodyDeltaNeutral };

    const isGood = lowerIsBetter ? diff < 0 : diff > 0;

    return {
      text: `${diff > 0 ? "+" : "-"}${absText}${unit}`,
      style: isGood ? styles.inbodyDeltaGood : styles.inbodyDeltaBad,
    };
  }

  function getRecentInbodyLogs() {
    return inbodyList.slice(0, 3);
  }

  function getLatestInbody() {
    return inbodyList[0] || null;
  }

  function getPreviousInbody() {
    return inbodyList[1] || null;
  }

  function getFirstInbody() {
    if (!inbodyList.length) return null;
    return inbodyList[inbodyList.length - 1];
  }

  function renderInbodyMetric(label, value, unit, previousValue, firstValue, decimals = 1, lowerIsBetter = false) {
    const recentDelta = formatDelta(value, previousValue, unit, decimals, lowerIsBetter);
    const firstDelta = formatDelta(value, firstValue, unit, decimals, lowerIsBetter);

    return (
      <div style={styles.inbodyMetricCard}>
        <p style={styles.inbodyMetricLabel}>{label}</p>
        <strong style={styles.inbodyMetricValue}>{formatMetric(value, unit, decimals)}</strong>

        <div style={styles.inbodyDeltaRow}>
          <span style={styles.inbodyDeltaCaption}>직전 대비</span>
          <span style={recentDelta.style}>{recentDelta.text}</span>
        </div>

        <div style={styles.inbodyDeltaRow}>
          <span style={styles.inbodyDeltaCaption}>첫 기록 대비</span>
          <span style={firstDelta.style}>{firstDelta.text}</span>
        </div>
      </div>
    );
  }


  function getInbodyTrendLogs() {
    return inbodyList
      .slice(0, 4)
      .slice()
      .reverse();
  }

  function getShortDateText(dateText) {
    if (!dateText) return "-";
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) return String(dateText).slice(5);
    return `${date.getMonth() + 1}.${date.getDate()}`;
  }

  function getTrendValue(log, key) {
    const value = Number(log?.[key]);
    return Number.isFinite(value) ? value : null;
  }

  function getTrendPercent(value, values) {
    const validValues = values.filter((item) => Number.isFinite(item));
    if (!Number.isFinite(value) || validValues.length === 0) return 0;

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (max === min) return 55;
    return 28 + ((value - min) / (max - min)) * 60;
  }

  function renderInbodyTrendRow(label, key, unit = "", decimals = 1) {
    const logs = getInbodyTrendLogs();
    const values = logs.map((log) => getTrendValue(log, key));
    const getColumnX = (index) => (logs.length <= 1 ? 50 : ((index + 0.5) / logs.length) * 100);

    const validPoints = values
      .map((value, index) => {
        if (!Number.isFinite(value)) return null;

        const x = getColumnX(index);
        const y = 100 - getTrendPercent(value, values);

        return { x, y, value, index };
      })
      .filter(Boolean);

    const linePoints = validPoints.map((point) => `${point.x},${point.y}`).join(" ");

    return (
      <div style={styles.inbodyTrendLineRow}>
        <div style={styles.inbodyTrendLabel}>{label}</div>

        <div style={styles.inbodyTrendLineArea}>
          <div style={styles.inbodyTrendPlotArea}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.inbodyTrendSvg}>
              {validPoints.length >= 2 && (
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            {validPoints.map((point) => (
              <span
                key={`${key}-dot-${point.index}`}
                style={{
                  ...styles.inbodyTrendDot,
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                }}
              />
            ))}
          </div>

          <div style={styles.inbodyTrendValueLayer}>
            {logs.map((log, index) => {
              const value = getTrendValue(log, key);
              const x = getColumnX(index);

              return (
                <strong
                  key={`${key}-${log.id || index}`}
                  style={{
                    ...styles.inbodyTrendValue,
                    left: `${x}%`,
                  }}
                >
                  {value === null ? "-" : formatMetric(value, unit, decimals)}
                </strong>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderInbodyTrendChart() {
    const logs = getInbodyTrendLogs();

    if (logs.length === 0) return null;

    const hasBodyFatPercent = logs.some((log) => Number.isFinite(Number(log.body_fat_percent)));

    return (
      <div style={styles.inbodyTrendBox}>
        <div style={styles.inbodyTrendHeader}>
          <h3 style={styles.subTitle}>최근 인바디 변화</h3>
          <button onClick={() => setShowAllInbodyModal(true)} style={styles.smallDark}>
            전체 인바디 보기
          </button>
        </div>

        <div style={styles.inbodyTrendDateLineRow}>
          <span />
          <div
            style={{
              ...styles.inbodyTrendDateGrid,
              gridTemplateColumns: `repeat(${logs.length}, minmax(0, 1fr))`,
            }}
          >
            {logs.map((log, index) => (
              <strong key={log.id || index} style={styles.inbodyTrendDate}>
                {getShortDateText(log.measured_at)}
              </strong>
            ))}
          </div>
        </div>

        {renderInbodyTrendRow("체중", "weight", "kg", 1)}
        {renderInbodyTrendRow("골격근량", "skeletal_muscle", "kg", 1)}
        {hasBodyFatPercent
          ? renderInbodyTrendRow("체지방률", "body_fat_percent", "%", 1)
          : renderInbodyTrendRow("체지방량", "body_fat_mass", "kg", 1)}
      </div>
    );
  }

  function renderInbodyRecord(log, showDelete = false) {
    return (
      <div key={log.id} style={styles.whiteWorkoutCard}>
        <div style={styles.whiteSessionTop}>
          <div>
            <h3 style={styles.whiteWorkoutDate}>{formatDate(log.measured_at)}</h3>
            <p style={styles.whiteMuted}>인바디 측정 기록</p>
          </div>

          {showDelete && (
            <div style={styles.whiteActionRow}>
              <button onClick={() => openInbodyEditModal(log)} style={styles.whiteEditButton}>
                수정
              </button>
              <button onClick={() => deleteInbodyLog(log)} style={styles.whiteDeleteButton}>
                삭제
              </button>
            </div>
          )}
        </div>

        <div style={styles.inbodyRecordGrid}>
          <p style={styles.whiteSetText}>체중 {formatMetric(log.weight, "kg")}</p>
          <p style={styles.whiteSetText}>골격근량 {formatMetric(log.skeletal_muscle, "kg")}</p>
          <p style={styles.whiteSetText}>체지방량 {formatMetric(log.body_fat_mass, "kg")}</p>
          <p style={styles.whiteSetText}>체지방률 {formatMetric(log.body_fat_percent, "%")}</p>
          <p style={styles.whiteSetText}>BMI {formatMetric(log.bmi, "", 1)}</p>
          <p style={styles.whiteSetText}>기초대사량 {formatMetric(log.basal_metabolic_rate, "kcal", 0)}</p>
          <p style={styles.whiteSetText}>내장지방레벨 {formatMetric(log.visceral_fat_level, "레벨", 0)}</p>
        </div>

        {renderRecommendedCalories(log.basal_metabolic_rate, true)}

        {log.memo && <p style={styles.whiteMemo}>메모: {log.memo}</p>}
      </div>
    );
  }


  async function openWorkout(member, source = null) {
    setWorkoutMember(member);
    setWorkoutReturnSource(source);
    setWorkoutMode("list");
    setWorkoutTrainingType("weight");
    setWorkoutMemo("");
    setWorkoutCondition("normal");
    setWorkoutIssue("");
    setWorkoutNextPlan("");
    setWorkoutTrainerNote("");
    setWorkoutExercises([{ name: "", sets: [{ weight: "", reps: "" }] }]);
    setShowAllWorkoutModal(false);
    clearWorkoutEdit();

    await loadWorkoutSessions(member.id);
  }

  function closeWorkout() {
    setWorkoutMember(null);
    setWorkoutReturnSource(null);
    setWorkoutSessions([]);
    setWorkoutMode("list");
    setWorkoutTrainingType("weight");
    setWorkoutMemo("");
    setWorkoutCondition("normal");
    setWorkoutIssue("");
    setWorkoutNextPlan("");
    setWorkoutTrainerNote("");
    setWorkoutExercises([{ name: "", sets: [{ weight: "", reps: "" }] }]);
    setShowAllWorkoutModal(false);
    clearWorkoutEdit();
  }

  async function loadWorkoutSessions(memberId) {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*, workout_sets(*)")
      .eq("member_id", memberId)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      alert("운동기록 불러오기 실패: " + error.message);
      return;
    }

    setWorkoutSessions(data || []);
  }

  function addExercise() {
    setWorkoutExercises((prev) => [
      ...prev,
      { name: "", sets: [{ weight: "", reps: "" }] },
    ]);
  }

  function removeExercise(exerciseIndex) {
    if (workoutExercises.length <= 1) return alert("운동은 최소 1개가 필요합니다.");
    setWorkoutExercises((prev) => prev.filter((_, index) => index !== exerciseIndex));
  }

  function updateExerciseName(exerciseIndex, value) {
    setWorkoutExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, name: value } : exercise
      )
    );
  }

  function getWorkoutHistoryNames() {
    const names = [];

    workoutSessions.forEach((session) => {
      (session.workout_sets || []).forEach((set) => {
        const name = String(set.exercise_name || "").trim();
        if (name) names.push(name);
      });
    });

    return [...new Set([...names, ...commonExercises])];
  }

  function getExerciseSuggestions(value) {
    const q = String(value || "").trim().toLowerCase();
    if (!q) return [];

    const baseNames = [...exerciseList, ...getWorkoutHistoryNames()];
    const uniqueNames = [...new Set(baseNames)];

    return uniqueNames
      .filter((name) => String(name || "").toLowerCase().includes(q))
      .slice(0, 8);
  }

  function getLastExerciseGroup(exerciseName) {
    const target = String(exerciseName || "").trim().toLowerCase();
    if (!target) return null;

    for (const session of workoutSessions) {
      const groups = groupWorkoutSets(session.workout_sets || []);
      const found = groups.find(
        (group) => String(group.exerciseName || "").trim().toLowerCase() === target
      );

      if (found) {
        return {
          ...found,
          workoutDate: session.workout_date,
          memo: session.memo || "",
        };
      }
    }

    return null;
  }

  function getLastExerciseSummary(group) {
    if (!group || !group.sets?.length) return "";

    return group.sets
      .map((set, index) => {
        const weightText = set.weight ? `${set.weight}kg` : "맨몸";
        const repsText = set.reps ? `${set.reps}회` : "횟수 없음";
        return `${index + 1}세트 ${weightText} ${repsText}`;
      })
      .join(" / ");
  }

  function applyLastExercise(exerciseIndex, group) {
    if (!group) return;

    setWorkoutExercises((prev) =>
      prev.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        return {
          ...exercise,
          name: group.exerciseName,
          sets: group.sets.map((set) => ({
            weight: set.weight ?? "",
            reps: set.reps ?? "",
          })),
        };
      })
    );
  }

  function selectExerciseSuggestion(exerciseIndex, name) {
    updateExerciseName(exerciseIndex, name);
  }

  function applyCircuitProgram(program) {
    const newExercises = program.exercises.map((exercise) => ({
      name: exercise.name,
      sets: [{ weight: exercise.weight || "", reps: exercise.reps || "" }],
    }));

    setWorkoutExercises((prev) => {
      const cleaned = prev.filter((exercise) => {
        const hasName = String(exercise.name || "").trim();
        const hasSet = (exercise.sets || []).some(
          (set) => String(set.weight || "").trim() || String(set.reps || "").trim()
        );

        return hasName || hasSet;
      });

      return [...cleaned, ...newExercises];
    });

    setWorkoutMemo((prev) => {
      const current = String(prev || "").trim();
      if (!current) return program.memo;
      if (current.includes(program.memo)) return current;
      return `${current}\n${program.memo}`;
    });

    setExerciseSuggestions([]);
    setActiveExerciseIndex(null);
  }


  function addSet(exerciseIndex) {
    setWorkoutExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, { weight: "", reps: "" }] }
          : exercise
      )
    );
  }

  function removeSet(exerciseIndex, setIndex) {
    setWorkoutExercises((prev) =>
      prev.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;
        if (exercise.sets.length <= 1) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.filter((_, i) => i !== setIndex),
        };
      })
    );
  }

  function updateSetValue(exerciseIndex, setIndex, key, value) {
    setWorkoutExercises((prev) =>
      prev.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, i) =>
            i === setIndex ? { ...set, [key]: value } : set
          ),
        };
      })
    );
  }

  async function saveWorkout() {
    if (!workoutMember) return;

    const validExercises = workoutExercises
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        sets: exercise.sets.filter(
          (set) => String(set.weight).trim() || String(set.reps).trim()
        ),
      }))
      .filter((exercise) => exercise.name && exercise.sets.length > 0);

    if (validExercises.length === 0) {
      alert("운동명과 세트 내용을 하나 이상 입력하세요.");
      return;
    }

    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        member_id: workoutMember.id,
        workout_date: getTodayDateString(),
        memo: workoutMemo.trim(),
        condition: workoutCondition,
        issue: workoutIssue.trim(),
        next_plan: workoutNextPlan.trim(),
        trainer_note: workoutTrainerNote.trim(),
      })
      .select()
      .single();

    if (sessionError) {
      alert("운동 세션 저장 실패: " + sessionError.message);
      return;
    }

    const rows = [];

    validExercises.forEach((exercise, exerciseIndex) => {
      exercise.sets.forEach((set, setIndex) => {
        rows.push({
          session_id: session.id,
          exercise_name: exercise.name,
          exercise_order: exerciseIndex + 1,
          set_number: setIndex + 1,
          weight: set.weight ? Number(set.weight) : null,
          reps: set.reps ? Number(set.reps) : null,
          sets: null,
        });
      });
    });

    const { error: setError } = await supabase.from("workout_sets").insert(rows);

    if (setError) {
      alert("운동 상세 저장 실패: " + setError.message);
      return;
    }

    setWorkoutMemo("");
    setWorkoutCondition("normal");
    setWorkoutIssue("");
    setWorkoutNextPlan("");
    setWorkoutTrainerNote("");
    setWorkoutExercises([{ name: "", sets: [{ weight: "", reps: "" }] }]);
    setWorkoutMode("list");

    await loadWorkoutSessions(workoutMember.id);
    alert(`${workoutMember.name} 운동기록이 저장되었습니다.`);
  }

  function getConditionText(condition) {
    if (condition === "good") return "좋음";
    if (condition === "bad") return "나쁨";
    return "보통";
  }

  function renderTrainerJournal(session, light = false) {
    const hasJournal = session.condition || session.issue || session.next_plan || session.trainer_note || session.memo;

    if (!hasJournal) return null;

    const textStyle = light ? styles.whiteSetText : styles.summaryMemberInfo;

    return (
      <div style={light ? styles.trainerJournalBoxLight : styles.trainerJournalBox}>
        <strong style={light ? styles.trainerJournalTitleLight : styles.trainerJournalTitle}>
          트레이너 일지
        </strong>

        <p style={textStyle}>컨디션: {getConditionText(session.condition)}</p>
        {session.issue && <p style={textStyle}>이슈: {session.issue}</p>}
        {session.next_plan && <p style={textStyle}>다음 수업: {session.next_plan}</p>}
        {session.trainer_note && <p style={textStyle}>총평: {session.trainer_note}</p>}
        {session.memo && <p style={textStyle}>메모: {session.memo}</p>}
      </div>
    );
  }

  function getVisibleWorkouts() {
    return workoutSessions.filter(
      (session) => isToday(session.workout_date) || (!session.workout_date && isToday(session.created_at))
    );
  }

  function groupWorkoutSets(sets = []) {
    const sorted = [...sets].sort((a, b) => {
      const orderA = a.exercise_order ?? 0;
      const orderB = b.exercise_order ?? 0;

      if (orderA !== orderB) return orderA - orderB;

      return (a.set_number ?? 0) - (b.set_number ?? 0);
    });

    const groups = [];

    sorted.forEach((set) => {
      const key = `${set.exercise_order ?? 0}-${set.exercise_name || "운동명 없음"}`;

      let group = groups.find((g) => g.key === key);

      if (!group) {
        group = {
          key,
          exerciseName: set.exercise_name || "운동명 없음",
          exerciseOrder: set.exercise_order ?? groups.length + 1,
          sets: [],
        };
        groups.push(group);
      }

      group.sets.push(set);
    });

    return groups;
  }

  function clearWorkoutEdit() {
    setEditingWorkoutSetId(null);
    setEditWorkoutName("");
    setEditWorkoutWeight("");
    setEditWorkoutReps("");
  }

  function startWorkoutSetEdit(set) {
    setEditingWorkoutSetId(set.id);
    setEditWorkoutName(set.exercise_name || "");
    setEditWorkoutWeight(set.weight ?? "");
    setEditWorkoutReps(set.reps ?? "");
  }

  async function saveWorkoutSetEdit(set) {
    if (!editWorkoutName.trim()) {
      alert("운동명을 입력하세요.");
      return;
    }

    const { error } = await supabase
      .from("workout_sets")
      .update({
        exercise_name: editWorkoutName.trim(),
        weight: editWorkoutWeight ? Number(editWorkoutWeight) : null,
        reps: editWorkoutReps ? Number(editWorkoutReps) : null,
      })
      .eq("id", set.id);

    if (error) {
      alert("운동기록 수정 실패: " + error.message);
      return;
    }

    clearWorkoutEdit();
    await loadWorkoutSessions(workoutMember.id);
  }

  async function deleteWorkoutSet(set) {
    if (!confirm("이 세트를 삭제할까요?")) return;

    const { error } = await supabase.from("workout_sets").delete().eq("id", set.id);

    if (error) {
      alert("세트 삭제 실패: " + error.message);
      return;
    }

    clearWorkoutEdit();
    await loadWorkoutSessions(workoutMember.id);
  }

  async function deleteWorkoutSession(session) {
    if (!confirm("이 날짜의 운동기록 전체를 삭제할까요?")) return;

    const { error: setError } = await supabase
      .from("workout_sets")
      .delete()
      .eq("session_id", session.id);

    if (setError) {
      alert("운동 상세 삭제 실패: " + setError.message);
      return;
    }

    const { error: sessionError } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", session.id);

    if (sessionError) {
      alert("운동기록 삭제 실패: " + sessionError.message);
      return;
    }

    clearWorkoutEdit();
    await loadWorkoutSessions(workoutMember.id);
  }

  function getRecentPtLogs() {
    return ptLogList
      .filter((log) => log.type === "use" && !log.is_cancelled)
      .slice(0, 3);
  }

  function getAllPtLogs() {
    return ptLogList.filter((log) => log.type === "use" && !log.is_cancelled);
  }

  function getRecentAttendanceLogs() {
    return attendanceList.filter((log) => !log.is_cancelled).slice(0, 3);
  }

  function getAllAttendanceLogs() {
    return attendanceList.filter((log) => !log.is_cancelled);
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

  function renderInfoBlock(title, content) {
    return (
      <div style={styles.infoBlock}>
        <strong>{title}</strong>
        <p>{content && String(content).trim() ? content : "미입력"}</p>
      </div>
    );
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

        <div style={styles.summaryActionGroup}>
          {normalizePhone(member.phone) ? (
            <a href={`tel:${normalizePhone(member.phone)}`} style={styles.summaryPhoneButton}>
              전화
            </a>
          ) : (
            <button onClick={() => alert("전화번호가 없습니다.")} style={styles.summaryPhoneButton}>
              전화
            </button>
          )}

          <button onClick={() => openContactModal(member)} style={styles.summaryContactButton}>
            기록
          </button>

          <button
            onClick={() => {
              setSummaryModal(null);
              openDetail(member, "menu");
            }}
            style={styles.smallDark}
          >
            상세
          </button>
        </div>
      </div>
    );
  }

  function renderTodayWorkoutSession(session) {
    const groups = groupWorkoutSets(session.workout_sets || []);

    return (
      <div key={session.id} style={styles.logItem}>
        <div>
          <div style={styles.logDate}>{formatDate(session.workout_date)}</div>

          {groups.length === 0 ? (
            <p style={styles.summaryMemberInfo}>운동 상세 없음</p>
          ) : (
            groups.map((group, groupIndex) => (
              <p
                key={group.key}
                style={{
                  ...styles.summaryMemberInfo,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                {groupIndex + 1}번 운동 · {group.exerciseName}
              </p>
            ))
          )}

          {renderTrainerJournal(session, false)}
        </div>
      </div>
    );
  }

  function renderMemberCard(member) {
    const ptStatus = getPtStatus(member);
    const visitStatus = getVisitStatus(member);

    return (
      <article
        key={member.id}
        style={editingId === member.id ? styles.card : styles.cardCompact}
      >
        {editingId === member.id ? (
          <div style={styles.editBox}>
            <h3 style={styles.editTitle}>회원 정보 수정</h3>

            <label style={styles.label}>이름</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} style={styles.input} />

            <label style={styles.label}>전화번호</label>
            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={styles.input} />

            <label style={styles.label}>나이</label>
            <input value={editAge} onChange={(e) => setEditAge(e.target.value)} type="number" style={styles.input} />

            <label style={styles.label}>키(cm)</label>
            <input value={editHeight} onChange={(e) => setEditHeight(e.target.value)} type="number" style={styles.input} />

            <label style={styles.label}>남은 PT 횟수</label>
            <input value={editPtRemaining} onChange={(e) => setEditPtRemaining(e.target.value)} type="number" min="0" style={styles.input} />

            <label style={styles.label}>목표</label>
            <input value={editGoal} onChange={(e) => setEditGoal(e.target.value)} style={styles.input} />

            <label style={styles.label}>특이사항</label>
            <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} style={styles.textarea} />

            <label style={styles.label}>트레이너 메모</label>
            <textarea value={editMemo} onChange={(e) => setEditMemo(e.target.value)} style={styles.textarea} />

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
          <div onClick={() => openDetailFromMemberList(member)} style={styles.memberMain}>
            <div style={styles.compactTop}>
              <h3 style={styles.memberNameSmall}>{member.name}</h3>
              <div
                style={{
                  ...styles.ptCountSmall,
                  color: (member.pt_remaining || 0) <= 2 ? "#f87171" : "#ffffff",
                }}
              >
                PT {member.pt_remaining}회
              </div>
            </div>

            <div style={styles.memberCardActionRow}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeMemberListModal();
                  openPtModal(member);
                }}
                style={styles.cardPtAddButton}
              >
                + 이용권
              </button>

              {member.is_active === false ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reactivateMember(member);
                  }}
                  style={styles.cardRestoreButton}
                >
                  복구
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deactivateMember(member);
                  }}
                  style={styles.cardDeactivateButton}
                >
                  비활성
                </button>
              )}
            </div>

            <div style={styles.memberTypeRow}>
              <span style={getMemberTypeStyle(member.member_type)}>
                {getMemberTypeText(member.member_type)}
              </span>
            </div>

            <p style={styles.phoneSmall}>
              {member.age ? `${member.age}세 · ` : ""}
              {member.height ? `${member.height}cm · ` : ""}
              {member.phone || "전화번호 없음"}
            </p>

            <div style={styles.memberSalesRow}>
              <span style={styles.memberSalesText}>
                누적 결제 {Number(member.total_paid || 0).toLocaleString("ko-KR")}원
              </span>
              {member.is_vip && <span style={styles.vipBadge}>VIP</span>}
            </div>

            <div style={styles.compactInfoRow}>
              <span>출석 {formatDate(member.latest_visit)}</span>
              <span>PT {formatDate(member.latest_pt)}</span>
            </div>

            <div style={styles.warningRow}>
              {ptStatus && <span style={ptStatus.style}>{ptStatus.text}</span>}
              {visitStatus && <span style={visitStatus.style}>{visitStatus.text}</span>}
            </div>
          </div>
        )}
      </article>
    );
  }

  const hasOpenModal =
    showInbodyModal ||
    showAllInbodyModal ||
    showAllWorkoutModal ||
    workoutMember ||
    showScheduleSearchResultModal ||
    showScheduleConflictModal ||
    actionModalSchedule ||
    ptModalMember ||
    editModalMember ||
    selectedMember ||
    showScheduleModal ||
    showScheduleCheckModal ||
    showMemberListModal ||
    showAddModal ||
    showAllPtModal ||
    showAllAttendanceModal ||
    showContactListModal ||
    showCenterModal ||
    contactModalMember ||
    summaryModal;

  useEffect(() => {
    hasOpenModalRef.current = Boolean(hasOpenModal);
  }, [hasOpenModal]);

  useEffect(() => {
    lastBackPressedAtRef.current = lastBackPressedAt;
  }, [lastBackPressedAt]);

  function closeTopModalByBackButton() {
    if (showInbodyModal) {
      closeInbodyModal();
      return true;
    }

    if (showAllInbodyModal) {
      setShowAllInbodyModal(false);
      return true;
    }

    if (showAllWorkoutModal) {
      setShowAllWorkoutModal(false);
      return true;
    }

    if (workoutMember) {
      closeWorkout();
      return true;
    }

    if (showScheduleSearchResultModal) {
      setShowScheduleSearchResultModal(false);
      return true;
    }

    if (showScheduleConflictModal) {
      closeScheduleConflictModal();
      return true;
    }

    if (actionModalSchedule) {
      closeActionModal();
      return true;
    }

    if (ptModalMember) {
      closePtModal();
      return true;
    }

    if (editModalMember) {
      closeEditModal();
      return true;
    }

    if (selectedMember) {
      if (detailMode && detailMode !== "menu") {
        setDetailMode("menu");
        return true;
      }

      closeDetail();
      return true;
    }

    if (showScheduleModal) {
      closeScheduleModal();
      return true;
    }

    if (showScheduleCheckModal) {
      closeScheduleCheckModal();
      return true;
    }

    if (showMemberListModal) {
      closeMemberListModal();
      return true;
    }

    if (showAddModal) {
      setShowAddModal(false);
      return true;
    }

    if (showAllPtModal) {
      setShowAllPtModal(false);
      return true;
    }

    if (showAllAttendanceModal) {
      setShowAllAttendanceModal(false);
      return true;
    }

    if (contactModalMember) {
      closeContactModal();
      return true;
    }

    if (showContactListModal) {
      setShowContactListModal(false);
      return true;
    }

    if (showCenterModal) {
      closeCenterModal();
      return true;
    }

    if (summaryModal) {
      setSummaryModal(null);
      return true;
    }

    return false;
  }

  closeTopModalByBackButtonRef.current = closeTopModalByBackButton;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const guardState = { spotainerBackGuard: true };
    window.history.replaceState({ spotainerBase: true }, "", window.location.href);
    window.history.pushState(guardState, "", window.location.href);

    function handlePwaBackButton() {
      if (allowBackExitRef.current) return;

      if (hasOpenModalRef.current) {
        const didClose = closeTopModalByBackButtonRef.current?.();
        setExitToast(didClose ? "이전 화면으로 이동했습니다" : "닫기 버튼을 사용하세요");
        window.history.pushState(guardState, "", window.location.href);
        return;
      }

      const now = Date.now();
      const previous = lastBackPressedAtRef.current;

      if (now - previous < 2500) {
        allowBackExitRef.current = true;
        setExitToast("");

        setTimeout(() => {
          window.history.go(-2);
        }, 0);
        return;
      }

      lastBackPressedAtRef.current = now;
      setLastBackPressedAt(now);
      setExitToast("한 번 더 누르면 종료됩니다");
      window.history.pushState(guardState, "", window.location.href);
    }

    window.addEventListener("popstate", handlePwaBackButton);

    return () => {
      window.removeEventListener("popstate", handlePwaBackButton);
    };
  }, []);

  function goToMain() {
    setSummaryModal(null);
    setShowContactListModal(false);
    setShowCenterModal(false);
    setContactModalMember(null);
    setShowAddModal(false);
    setEditModalMember(null);
    setEditingId(null);
    setSelectedMember(null);
    setDetailMode(null);
    setShowAllPtModal(false);
    setShowAllAttendanceModal(false);
    setShowInbodyModal(false);
    setShowAllInbodyModal(false);
    setEditingInbodyLog(null);
    setWorkoutMember(null);
    setWorkoutReturnSource(null);
    setWorkoutMode("list");
    setShowAllWorkoutModal(false);
    setEditingWorkoutSetId(null);
    setPtModalMember(null);
    setShowScheduleModal(false);
    setShowScheduleCheckModal(false);
    setShowScheduleSearchResultModal(false);
    setShowScheduleConflictModal(false);
    setConflictSchedules([]);
    setPendingSchedule(null);
    setActionModalSchedule(null);
    setShowMemberListModal(false);
    setReturnToMemberListAfterDetail(false);
    setReturnToScheduleCheckAfterAdd(false);
  }

  const incompleteSchedules = schedules.filter((schedule) => {
    if (
      schedule.status === "noshow" ||
      schedule.status === "completed" ||
      schedule.status === "cancelled"
    ) return false;

    return !schedule.attendance_checked || !schedule.pt_used;
  });

  return (
    <main style={styles.page}>
      {exitToast && (
        <div style={styles.appToast}>
          {exitToast}
        </div>
      )}

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Spotainer</h1>
          <p style={styles.subtitle}>여성전용 PT 회원관리</p>
        </div>
        <button onClick={openCenterModal} style={styles.adminBadge}>
          관리자
        </button>
      </header>

      <section style={styles.salesBox}>
        <div style={styles.salesCard}>
          <p style={styles.salesLabel}>이번달 매출</p>
          <strong style={styles.salesValue}>{salesData.total.toLocaleString("ko-KR")}원</strong>
        </div>

        <div style={styles.salesCard}>
          <p style={styles.salesLabel}>결제 회원</p>
          <strong style={styles.salesValue}>{salesData.count}명</strong>
        </div>

        <div style={styles.salesCard}>
          <p style={styles.salesLabel}>객단가</p>
          <strong style={styles.salesValue}>{salesData.average.toLocaleString("ko-KR")}원</strong>
        </div>

        <div style={styles.salesCard}>
          <p style={styles.salesLabel}>재등록 전환율</p>
          <strong style={styles.salesValue}>{reRegisterStats.rate}%</strong>
          <p style={styles.salesMiniText}>
            {reRegisterStats.converted}/{reRegisterStats.success}명
          </p>
        </div>
      </section>

      <section style={{ ...styles.autoCareBox, ...getContactCardBorderStyle() }}>
        <button
          type="button"
          onClick={() => setShowContactListModal(true)}
          style={styles.contactListOpenButton}
        >
          <span style={styles.contactIconCircle}>☎</span>

          <span style={styles.contactCardText}>
            <strong>오늘 연락 필요 회원</strong>
            <p>연락 대상 회원을 확인하고 바로 처리하세요.</p>
          </span>

          <span style={styles.contactListCount}>{attentionList.length}명</span>
          <span style={styles.actionCardArrow}>›</span>
        </button>
      </section>

      <section style={styles.contactLegendBox}>
        <strong>테두리 색상 안내</strong>
        <span style={styles.legendItem}><i style={styles.legendBlue}></i>재등록 상담</span>
        <span style={styles.legendItem}><i style={styles.legendRed}></i>강한 경고</span>
        <span style={styles.legendItem}><i style={styles.legendGreen}></i>연락 필요</span>
        <span style={styles.legendItem}><i style={styles.legendGold}></i>VIP 연락</span>
      </section>

      <section style={styles.incompleteBox}>
        <div style={styles.incompleteTop}>
          <div>
            <h2 style={styles.incompleteTitle}>오늘 스케줄</h2>
            <p style={styles.incompleteDesc}>
              출석과 PT 차감 상태를 한 번에 확인하세요.
            </p>
          </div>

          <div style={styles.incompleteCount}>{schedules.length}건</div>
        </div>

        {schedules.length === 0 ? (
          <p style={styles.muted}>오늘 등록된 스케줄이 없습니다.</p>
        ) : (
          <div style={styles.incompleteList}>
            {schedules.map((schedule) => {
              const member = getScheduleMember(schedule);
              const attended = !!schedule.attendance_checked;
              const ptUsed = !!schedule.pt_used;
              const isNoShow = schedule.status === "noshow";
              const isCancelled = schedule.status === "cancelled";
              const isCompleted = schedule.status === "completed" || (attended && ptUsed);

              return (
                <div key={schedule.id} style={styles.incompleteItem}>
                  <div style={styles.incompleteMain}>
                    <div style={styles.scheduleTime}>{formatTime(schedule.start_time)}</div>

                    <div>
                      <strong style={styles.scheduleMemberName}>
                        {getScheduleTypeText(schedule.type)} · {member?.name || "회원 정보 없음"}
                        {member ? ` (${member.pt_remaining || 0}회)` : ""}
                      </strong>

                      <div style={styles.scheduleStatusRow}>
                        {isCancelled ? (
                          <>
                            <span style={styles.scheduleCancelText}>취소</span>
                            <span style={styles.scheduleWarningText}>출석 없음</span>
                            <span style={styles.scheduleWarningText}>차감 없음</span>
                          </>
                        ) : isNoShow ? (
                          <>
                            <span style={styles.scheduleNoShowText}>노쇼</span>
                            <span style={styles.scheduleWarningText}>출석 없음</span>
                            <span style={styles.scheduleDoneText}>차감 완료</span>
                          </>
                        ) : (
                          <>
                            {attended ? (
                              <span style={styles.scheduleDoneText}>출석 완료</span>
                            ) : (
                              <span style={styles.scheduleWarningText}>출석 전</span>
                            )}

                            {ptUsed ? (
                              <span style={styles.scheduleDoneText}>차감 완료</span>
                            ) : (
                              <span style={styles.scheduleWarningText}>차감 전</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.incompleteButtonGroup}>
                    <button
                      type="button"
                      onClick={() => addToDeviceCalendar(schedule)}
                      style={styles.calendarButton}
                    >
                      캘린더
                    </button>

                    {isNoShow || isCancelled || isCompleted ? (
                      <button style={styles.scheduleDisabledButton} disabled>
                        {isCancelled ? "취소됨" : isNoShow ? "노쇼" : "완료됨"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => openActionModal(schedule)}
                          style={styles.incompleteCompleteButton}
                        >
                          처리하기
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditSchedule(schedule)}
                          style={styles.scheduleEditButton}
                        >
                          수정
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={styles.scheduleAddWideBox}>
        <button onClick={openScheduleCheckModal} style={styles.scheduleAddWideButton}>
          <span style={styles.actionCardIcon}>☰</span>
          <span>스케줄 확인 / 추가</span>
          <span style={styles.actionCardArrow}>›</span>
        </button>
      </section>

      {actionModalSchedule && (
        <div style={styles.modalOverlay}>
          <section style={styles.modalBox}>
            <div style={styles.detailTop}>
              <div>
                <h2 style={styles.modalTitle}>스케줄 처리</h2>
                <p style={styles.muted}>
                  {getScheduleMember(actionModalSchedule)?.name || "회원"} 수업 결과를 선택하세요.
                </p>
              </div>

              <button onClick={closeActionModal} style={styles.closeButton}>
                닫기
              </button>
            </div>

            <div style={styles.menuGrid}>
              <button
                onClick={() => completeScheduleClass(actionModalSchedule)}
                style={styles.whiteButton}
              >
                수업 완료
              </button>

              <button
                onClick={() => markScheduleNoShow(actionModalSchedule)}
                style={styles.deleteButton}
              >
                노쇼
              </button>

              <button
                onClick={() => markScheduleCancelled(actionModalSchedule)}
                style={styles.darkButton}
              >
                취소
              </button>
            </div>

            <button onClick={closeActionModal} style={styles.cancelButton}>
              닫기
            </button>
          </section>
        </div>
      )}

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

      {showCenterModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>센터 정보</h2>
                <p style={styles.whiteMuted}>센터명, 전화번호, 주소를 저장해두는 관리자 정보입니다.</p>
              </div>

              <button onClick={closeCenterModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.adminMenuBox}>
              <button
                type="button"
                onClick={openInactiveMembersFromAdmin}
                style={styles.adminMenuButton}
              >
                비활성 회원 관리
              </button>
            </div>

            <label style={styles.whiteLabel}>센터명</label>
            <input
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              placeholder="예: 스포테이너"
              style={styles.whiteInput}
            />

            <label style={styles.whiteLabel}>전화번호</label>
            <input
              value={centerPhone}
              onChange={(e) => setCenterPhone(e.target.value)}
              placeholder="예: 010-0000-0000"
              style={styles.whiteInput}
            />

            <label style={styles.whiteLabel}>주소</label>
            <input
              value={centerAddress}
              onChange={(e) => setCenterAddress(e.target.value)}
              placeholder="예: 전북 익산시 ..."
              style={styles.whiteInput}
            />

            <label style={styles.whiteLabel}>메모</label>
            <input
              value={centerMemo}
              onChange={(e) => setCenterMemo(e.target.value)}
              placeholder="예: 운영시간, 주차 안내"
              style={styles.whiteInput}
            />

            <div style={styles.centerPreviewBox}>
              <strong>저장 미리보기</strong>
              <p>{centerName || "센터명 미입력"}</p>
              <p>{centerPhone || "전화번호 미입력"}</p>
              <p>{centerAddress || "주소 미입력"}</p>
              {centerMemo && <p>{centerMemo}</p>}
            </div>

            <div style={styles.whiteActionRowFull}>
              <button onClick={saveCenterInfo} style={styles.whiteSaveLargeButton}>
                저장
              </button>

              <button onClick={closeCenterModal} style={styles.whiteCancelLargeButton}>
                취소
              </button>
            </div>
          </section>
        </div>
      )}

      {showContactListModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.contactListModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>오늘 연락 필요 회원</h2>
                <p style={styles.whiteMuted}>
                  연락해야 할 회원만 모아둔 작업 화면입니다. 기록하면 자동으로 목록이 정리됩니다.
                </p>
              </div>

              <button onClick={() => setShowContactListModal(false)} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.contactListSummaryRow}>
              <div style={styles.contactListSummaryCard}>
                <strong>{attentionList.length}명</strong>
                <span>전체</span>
              </div>

              <div style={styles.contactListSummaryCard}>
                <strong>{attentionList.filter((m) => m.ptStatus === "강한 경고").length}명</strong>
                <span>강한경고</span>
              </div>

              <div style={styles.contactListSummaryCard}>
                <strong>{attentionList.filter((m) => m.followUpStatus).length}명</strong>
                <span>재연락</span>
              </div>
            </div>

            {attentionList.length === 0 ? (
              <div style={styles.scheduleCheckEmpty}>
                오늘 연락할 회원이 없습니다.
              </div>
            ) : (
              <div style={styles.contactListRows}>
                {attentionList.map((m) => (
                  <div key={m.id} style={styles.contactListRow}>
                    <div style={styles.contactListMain}>
                      <strong style={styles.contactListName}>{m.name}</strong>

                      <div style={styles.autoCareTags}>
                        {m.followUpStatus && <span style={styles.scheduleDoneText}>{m.followUpStatus}</span>}
                        {m.attendanceStatus && <span style={styles.scheduleWarningText}>{m.attendanceStatus}</span>}
                        {m.ptStatus && <span style={styles.dangerBadge}>{m.ptStatus}</span>}
                        {m.inbodyStatus && <span style={styles.visitBadge}>{m.inbodyStatus}</span>}
                      </div>

                      <p style={styles.contactListMeta}>
                        최근 결과: {getContactResultText(m.last_contact_result)}
                        {m.re_register_flag ? " · 결제 대기" : ""}
                        {m.next_contact_date ? ` · 다음 연락일: ${m.next_contact_date}` : ""}
                      </p>

                      {m.contact_note && (
                        <p style={styles.contactListNote}>메모: {m.contact_note}</p>
                      )}
                    </div>

                    <div style={styles.contactListActions}>
                      {normalizePhone(m.phone) ? (
                        <>
                          <a href={`tel:${normalizePhone(m.phone)}`} style={styles.summaryPhoneButton}>
                            전화
                          </a>
                          <a href={`sms:${normalizePhone(m.phone)}`} style={styles.contactSmsButton}>
                            문자
                          </a>
                        </>
                      ) : (
                        <>
                          <button onClick={() => alert("전화번호가 없습니다.")} style={styles.summaryPhoneButton}>
                            전화
                          </button>
                          <button onClick={() => alert("전화번호가 없습니다.")} style={styles.contactSmsButton}>
                            문자
                          </button>
                        </>
                      )}

                      <button onClick={() => openContactModal(m)} style={styles.autoCareDoneButton}>
                        기록
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {contactModalMember && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>연락 결과 기록</h2>
                <p style={styles.whiteMuted}>
                  {contactModalMember.name} 회원의 연락 결과를 남기면 다음 연락일이 자동 설정됩니다.
                </p>
              </div>

              <button onClick={closeContactModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <label style={styles.whiteLabel}>연락 결과</label>
            <div style={styles.contactResultGrid}>
              <button
                type="button"
                onClick={() => setContactResult("success")}
                style={contactResult === "success" ? styles.contactResultButtonActive : styles.contactResultButton}
              >
                성공
              </button>
              <button
                type="button"
                onClick={() => setContactResult("re_register")}
                style={contactResult === "re_register" ? styles.contactResultButtonActive : styles.contactResultButton}
              >
                재등록 성공
              </button>
              <button
                type="button"
                onClick={() => setContactResult("pending")}
                style={contactResult === "pending" ? styles.contactResultButtonActive : styles.contactResultButton}
              >
                보류
              </button>
              <button
                type="button"
                onClick={() => setContactResult("fail")}
                style={contactResult === "fail" ? styles.contactResultButtonActive : styles.contactResultButton}
              >
                실패
              </button>
            </div>

            <div style={styles.contactNextBox}>
              {contactResult === "re_register"
                ? "재등록 성공으로 저장하면 결제 대기 상태가 되고, 이용권 추가 시 실제 결제와 연결할 수 있습니다."
                : contactResult === "success"
                  ? "성공으로 저장하면 연락 리스트에서 제외됩니다."
                  : contactResult === "pending"
                    ? `보류로 저장하면 ${addDaysDateString(3)}에 다시 연락 리스트에 뜹니다.`
                    : `실패로 저장하면 ${addDaysDateString(7)}에 다시 연락 리스트에 뜹니다.`}
            </div>

            <label style={styles.whiteLabel}>한줄 메모</label>
            <input
              value={contactNote}
              onChange={(e) => setContactNote(e.target.value)}
              placeholder="예: 다음주 생각해본다고 함"
              style={styles.whiteInput}
            />

            <div style={styles.whiteActionRowFull}>
              <button onClick={saveContactResult} style={styles.whiteSaveLargeButton}>
                저장
              </button>

              <button onClick={closeContactModal} style={styles.whiteCancelLargeButton}>
                취소
              </button>
            </div>
          </section>
        </div>
      )}

      {showScheduleCheckModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.scheduleCheckModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>스케줄 확인</h2>
                <p style={styles.whiteMuted}>날짜별 예약을 확인하고 바로 추가할 수 있습니다.</p>
              </div>

              <button onClick={closeScheduleCheckModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.scheduleMiniCalendarBox}>
              <div style={styles.scheduleMiniCalendarHeader}>
                <button
                  type="button"
                  onClick={() => moveScheduleCheckMonth(-1)}
                  style={styles.scheduleMiniMonthButton}
                >
                  ‹
                </button>

                <strong style={styles.scheduleMiniMonthTitle}>{getScheduleCheckMonthTitle()}</strong>

                <button
                  type="button"
                  onClick={() => moveScheduleCheckMonth(1)}
                  style={styles.scheduleMiniMonthButton}
                >
                  ›
                </button>
              </div>

              <div style={styles.scheduleMiniWeekRow}>
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} style={styles.scheduleMiniWeekCell}>{day}</div>
                ))}
              </div>

              <div style={styles.scheduleMiniCalendarGrid}>
                {getScheduleCheckCalendarDays().map((day) => (
                  day.empty ? (
                    <div key={day.key} style={styles.scheduleMiniEmptyDay} />
                  ) : (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setScheduleCheckDate(day.dateText)}
                      style={day.selected ? styles.scheduleMiniDaySelected : day.today ? styles.scheduleMiniDayToday : styles.scheduleMiniDay}
                    >
                      <span style={styles.scheduleMiniDayNumber}>{day.day}</span>
                      {day.count > 0 && (
                        <span style={day.selected ? styles.scheduleMiniDayCountSelected : styles.scheduleMiniDayCount}>{day.count}건</span>
                      )}
                    </button>
                  )
                ))}
              </div>
            </div>

            <div style={styles.scheduleCheckTopActions}>
              <button
                type="button"
                onClick={() => setScheduleCheckDate(getTodayDateString())}
                style={styles.memberSortButton}
              >
                오늘
              </button>

              <button
                type="button"
                onClick={openScheduleAddFromCheck}
                style={styles.whiteSaveLargeButton}
              >
                + 이 날짜에 스케줄 추가
              </button>
            </div>

            <div style={styles.scheduleSearchBox}>
              <input
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchScheduleByKeyword();
                }}
                placeholder="회원 이름 또는 전화번호 검색"
                style={{ ...styles.whiteInput, marginBottom: 0 }}
              />

              <button
                type="button"
                onClick={searchScheduleByKeyword}
                style={styles.whiteSaveButton}
              >
                검색
              </button>

              {scheduleSearch.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setScheduleSearch("");
                    setScheduleSearchResultList([]);
                  }}
                  style={styles.whiteCancelButton}
                >
                  초기화
                </button>
              )}
            </div>

            {scheduleCheckList.length === 0 ? (
              <div style={styles.scheduleCheckEmpty}>
                이 날짜에 등록된 스케줄이 없습니다.
              </div>
            ) : (
              <div style={styles.scheduleCheckList}>
                {scheduleCheckList.map((schedule) => renderScheduleCheckItem(schedule, false))}              </div>
            )}
          </section>
        </div>
      )}

      {showScheduleSearchResultModal && (
        <div style={styles.scheduleSearchResultOverlay}>
          <section style={styles.scheduleCheckModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>회원 스케줄 검색 결과</h2>
                <p style={styles.whiteMuted}>
                  “{scheduleSearch}” 검색 결과 {scheduleSearchResultList.length}건입니다.
                </p>
              </div>

              <button
                onClick={() => setShowScheduleSearchResultModal(false)}
                style={styles.whiteCloseButton}
              >
                닫기
              </button>
            </div>

            {scheduleSearchResultList.length === 0 ? (
              <div style={styles.scheduleCheckEmpty}>
                검색 결과가 없습니다.
              </div>
            ) : (
              <div style={styles.scheduleCheckList}>
                {getScheduleTimelineGroups(scheduleSearchResultList, scheduleSearch).map((group) => (
                  <div key={group.key} style={styles.scheduleTimelineGroup}>
                    <div style={styles.scheduleTimelineHeader}>
                      <div>
                        <strong>{group.member?.name || "회원 정보 없음"}</strong>
                        <p>
                          {group.member?.phone || "전화번호 없음"} · 총 {group.schedules.length}건
                        </p>
                      </div>
                    </div>

                    <div style={styles.scheduleTimelineList}>
                      {group.schedules.map((schedule) => renderScheduleCheckItem(schedule, true))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {showScheduleConflictModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>스케줄 중복 경고</h2>
                <p style={styles.whiteMuted}>
                  같은 시간대에 이미 등록된 예약이 있습니다. 그룹PT나 예외 상황이면 그래도 추가할 수 있습니다.
                </p>
              </div>

              <button onClick={closeScheduleConflictModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={conflictSchedules.length >= 2 ? styles.conflictStrongBox : styles.conflictWarningBox}>
              <strong>
                {conflictSchedules.length >= 2
                  ? "권장 인원 초과 가능성"
                  : "시간 겹침 확인"}
              </strong>
              <p>
                현재 겹치는 예약 {conflictSchedules.length}건이 있습니다.
                {conflictSchedules.length >= 2
                  ? " 2:1 기준을 넘을 수 있으니 꼭 확인하세요."
                  : " 그룹PT라면 추가해도 됩니다."}
              </p>
            </div>

            <div style={styles.conflictList}>
              {conflictSchedules.map((schedule) => {
                const member = schedule.members || getScheduleMember(schedule);

                return (
                  <div key={schedule.id} style={styles.conflictItem}>
                    <strong>{formatScheduleRange(schedule)}</strong>
                    <p>
                      {getScheduleTypeText(schedule.type)} · {member?.name || "회원 정보 없음"}
                      {member ? ` · PT ${member.pt_remaining || 0}회` : ""}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={styles.whiteActionRowFull}>
              <button onClick={closeScheduleConflictModal} style={styles.whiteCancelLargeButton}>
                취소
              </button>

              <button onClick={forceAddSchedule} style={styles.whiteSaveLargeButton}>
                그래도 추가
              </button>
            </div>
          </section>
        </div>
      )}

      {showScheduleModal && (
        <div style={styles.modalOverlay}>
          <section style={styles.modalBox}>
            <div style={styles.detailTop}>
              <h2 style={styles.modalTitle}>{editingSchedule ? "스케줄 수정" : "스케줄 추가"}</h2>
              <button onClick={closeScheduleModal} style={styles.closeButton}>
                닫기
              </button>
            </div>

            <label style={styles.label}>회원 선택</label>
            <select
              value={scheduleMemberId}
              onChange={(e) => setScheduleMemberId(e.target.value)}
              style={styles.input}
            >
              <option value="">회원을 선택하세요</option>
              {activeMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {getMemberTypeText(member.member_type)} · PT {member.pt_remaining || 0}회
                </option>
              ))}
            </select>

            {scheduleType === "group" && !editingSchedule && (
              <>
                <label style={styles.label}>두 번째 회원 선택</label>
                <select
                  value={scheduleSecondMemberId}
                  onChange={(e) => setScheduleSecondMemberId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">2:1 그룹PT면 두 번째 회원을 선택하세요</option>
                  {activeMembers
                    .filter((member) => member.id !== scheduleMemberId)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} · {getMemberTypeText(member.member_type)} · PT {member.pt_remaining || 0}회
                      </option>
                    ))}
                </select>
              </>
            )}

            <label style={styles.label}>날짜</label>
            <input
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              type="date"
              style={styles.input}
            />

            <div style={styles.schedulePreviewBox}>
              <div style={styles.schedulePreviewTop}>
                <strong>선택 날짜 예약 현황</strong>
                <span>{selectedDateSchedules.length}건</span>
              </div>

              {selectedDateSchedules.length === 0 ? (
                <p style={styles.schedulePreviewEmpty}>이 날짜에 등록된 스케줄이 없습니다.</p>
              ) : (
                <div style={styles.schedulePreviewList}>
                  {selectedDateSchedules.map((schedule) => {
                    const status = getSchedulePreviewStatus(schedule);

                    return (
                      <div key={schedule.id} style={styles.schedulePreviewItem}>
                        <div>
                          <strong style={styles.schedulePreviewTime}>{formatScheduleRange(schedule)}</strong>
                          <p style={styles.schedulePreviewMember}>
                            {getScheduleTypeText(schedule.type)} · {schedule.members?.name || "회원 정보 없음"}
                          </p>
                        </div>

                        <span style={status.style}>{status.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {getSelectedDateActiveSchedules().length > 0 && (
                <p style={styles.schedulePreviewHint}>
                  겹치는 시간으로 저장하면 자동으로 차단됩니다.
                </p>
              )}
            </div>

            <label style={styles.label}>시작 시간</label>
            <select
              value={scheduleStartTime}
              onChange={(e) => {
                const value = e.target.value;
                setScheduleStartTime(value);
                setScheduleEndTime(getAutoScheduleEndTime(value));
              }}
              style={styles.input}
            >
              <option value="">시작 시간을 선택하세요</option>
              {getTimeOptions().map((time) => (
                <option key={time} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>

            <div style={styles.autoEndTimeBox}>
              <strong>종료 시간</strong>
              <p>
                {scheduleStartTime
                  ? `${formatTime(scheduleStartTime)} 시작 → ${formatTime(getAutoScheduleEndTime(scheduleStartTime))} 종료`
                  : "시작 시간을 선택하면 종료 시간이 자동으로 1시간 뒤로 설정됩니다."}
              </p>
            </div>

            {scheduleStartTime &&
              getSelectedDateActiveSchedules().some((schedule) => {
                const newStart = timeToMinutes(scheduleStartTime);
                const newEnd = timeToMinutes(scheduleEndTime || getAutoScheduleEndTime(scheduleStartTime));
                const oldStart = timeToMinutes(schedule.start_time);
                const oldEnd = timeToMinutes(schedule.end_time || addMinutesToTime(schedule.start_time, 60));

                if (newStart === null || newEnd === null || oldStart === null || oldEnd === null) return false;

                return oldStart < newEnd && oldEnd > newStart;
              }) && (
                <div style={styles.scheduleConflictBox}>
                  선택한 시간이 기존 스케줄과 겹칩니다. 저장 시 기존 예약자를 확인한 뒤 추가 여부를 선택할 수 있습니다.
                </div>
              )}

            <label style={styles.label}>구분</label>
            <p style={styles.scheduleFormHint}>OT/상담은 PT가 0회인 일반 회원도 등록할 수 있고, 완료해도 PT가 차감되지 않습니다.</p>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              style={styles.input}
            >
              <option value="pt">PT</option>
              <option value="group">그룹PT</option>
              <option value="ot">OT</option>
              <option value="consult">상담</option>
            </select>

            <label style={styles.label}>메모</label>
            <textarea
              value={scheduleMemo}
              onChange={(e) => setScheduleMemo(e.target.value)}
              placeholder="예: 하체, 체형상담, 보강수업"
              style={styles.textarea}
            />

            <div style={styles.editActions}>
              <button onClick={addSchedule} style={styles.primaryButton}>
                {editingSchedule ? "수정 저장" : scheduleType === "group" && scheduleSecondMemberId ? "그룹PT 저장" : "저장"}
              </button>
              <button onClick={closeScheduleModal} style={styles.cancelButton}>
                취소
              </button>
            </div>
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

            <label style={styles.label}>회원 구분</label>
            <select
              value={memberType}
              onChange={(e) => setMemberType(e.target.value)}
              style={styles.input}
            >
              <option value="general">일반회원</option>
              <option value="pt">PT회원</option>
              <option value="group">그룹PT회원</option>
              <option value="vip">VIP</option>
            </select>

            <label style={styles.label}>나이</label>
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="예: 32" type="number" style={styles.input} />

            <label style={styles.label}>키(cm)</label>
            <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="예: 165" type="number" style={styles.input} />

            <label style={styles.label}>목표</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="예: 체지방 감량, 근력 증가" style={styles.input} />

            <label style={styles.label}>특이사항</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 허리 통증, 무릎 주의, 식단 어려움" style={styles.textarea} />

            <label style={styles.label}>트레이너 메모</label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="상담 내용, 성향, 관리 포인트" style={styles.textarea} />

            <div style={styles.editActions}>
              <button onClick={addMember} style={styles.primaryButton}>저장</button>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelButton}>취소</button>
            </div>
          </section>
        </div>
      )}

      {editModalMember && (
        <div style={styles.editModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>회원 정보 수정</h2>
                <p style={styles.whiteMuted}>
                  {editModalMember.name} 회원의 기본 정보를 수정합니다.
                </p>
              </div>

              <button onClick={closeEditModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <label style={styles.whiteLabel}>이름</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={styles.whiteInput}
            />

            <label style={styles.whiteLabel}>전화번호</label>
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              style={styles.whiteInput}
            />

            <label style={styles.whiteLabel}>회원 구분</label>
            <select
              value={editMemberType}
              onChange={(e) => setEditMemberType(e.target.value)}
              style={styles.whiteInput}
            >
              <option value="general">일반회원</option>
              <option value="pt">PT회원</option>
              <option value="group">그룹PT회원</option>
              <option value="vip">VIP</option>
            </select>

            <div style={styles.whiteTwoColumn}>
              <div>
                <label style={styles.whiteLabel}>나이</label>
                <input
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  type="number"
                  style={styles.whiteInput}
                />
              </div>

              <div>
                <label style={styles.whiteLabel}>키(cm)</label>
                <input
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  type="number"
                  style={styles.whiteInput}
                />
              </div>
            </div>

            <label style={styles.whiteLabel}>남은 PT 횟수</label>
            <input
              value={editPtRemaining}
              onChange={(e) => setEditPtRemaining(e.target.value)}
              type="number"
              min="0"
              style={styles.whiteInput}
            />

            <p style={styles.whiteMuted}>
              기존 회원의 잔여 PT가 실제와 다를 때만 직접 수정하세요.
            </p>

            <label style={styles.whiteLabel}>목표</label>
            <input
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              style={styles.whiteInput}
            />

            <label style={styles.whiteLabel}>특이사항</label>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              style={styles.whiteTextarea}
            />

            <label style={styles.whiteLabel}>트레이너 메모</label>
            <textarea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              style={styles.whiteTextarea}
            />

            <div style={styles.whiteActionRowFull}>
              <button
                onClick={() => saveEdit(editModalMember.id)}
                style={styles.whiteSaveLargeButton}
              >
                저장
              </button>

              <button onClick={closeEditModal} style={styles.whiteCancelLargeButton}>
                취소
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedMember && detailMode && (
        <div style={styles.modalOverlay}>
          <section style={styles.modalBox}>
            <div style={styles.detailTop}>
              <div>
                <h2 style={styles.detailName}>{selectedMember.name}</h2>
                <p style={styles.muted}>
                  {selectedMember.age ? `${selectedMember.age}세 · ` : ""}
                  {selectedMember.height ? `${selectedMember.height}cm · ` : ""}
                  {selectedMember.phone || "전화번호 없음"}
                </p>
                <span style={getMemberTypeStyle(selectedMember.member_type)}>
                  {getMemberTypeText(selectedMember.member_type)}
                </span>
              </div>

              <button onClick={closeDetail} style={styles.closeButton}>닫기</button>
            </div>

            {detailMode === "menu" && (
              <>
                <h3 style={styles.subTitle}>상세 보기</h3>

                <div style={styles.menuGrid}>
                  <button onClick={() => setDetailMode("info")} style={styles.menuButton}>
                    회원 정보
                  </button>
                  <button onClick={() => setDetailMode("pt")} style={styles.menuButton}>
                    PT 사용 기록
                  </button>
                  <button onClick={() => setDetailMode("attendance")} style={styles.menuButton}>
                    출석 기록
                  </button>
                  <button
                    onClick={() => {
                      openWorkout(selectedMember, "memberDetail");
                    }}
                    style={styles.menuButton}
                  >
                    운동 기록
                  </button>
                  <button onClick={() => setDetailMode("inbody")} style={styles.menuButton}>
                    인바디 기록
                  </button>
                </div>

                <div style={styles.detailActionBox}>
                  <p style={styles.detailPtMini}>PT {selectedMember.pt_remaining || 0}회 남음</p>

                  <div style={styles.detailButtonGridClean}>
                    <button
                      onClick={() => openPtModal(selectedMember)}
                      style={styles.whiteButton}
                    >
                      이용권 추가
                    </button>

                    <button
                      onClick={() => startEdit(selectedMember)}
                      style={styles.darkButton}
                    >
                      수정
                    </button>
                  </div>
                </div>
              </>
            )}

            {detailMode === "info" && (
              <>
                {(() => {
                  const pt = getPtSummary(selectedMember, ptLogList);
                  return (
                    <p style={styles.detailPt}>
                      총 {pt.total}회 중 {pt.used}회 사용 / {pt.remain}회 남음
                    </p>
                  );
                })()}

                <h3 style={styles.subTitle}>회원 관리 정보</h3>
                {renderInfoBlock("키", selectedMember.height ? `${selectedMember.height}cm` : "")}
                {renderInfoBlock("목표", selectedMember.goal)}
                {renderInfoBlock("특이사항", selectedMember.note)}
                {renderInfoBlock("트레이너 메모", selectedMember.memo)}

                <button onClick={() => setDetailMode("menu")} style={styles.cancelButton}>
                  뒤로
                </button>
              </>
            )}

            {detailMode === "inbody" && (
              <>
                <div style={styles.recordHeader}>
                  <h3 style={styles.subTitle}>인바디 기록</h3>

                  <button onClick={openInbodyAddModal} style={styles.whiteButton}>
                    + 인바디 추가
                  </button>
                </div>

                {inbodyList.length === 0 ? (
                  <p style={styles.muted}>아직 인바디 기록이 없습니다.</p>
                ) : (
                  <>
                    {(() => {
                      const latest = getLatestInbody();
                      const previous = getPreviousInbody();
                      const first = getFirstInbody();

                      return (
                        <>
                          <p style={styles.inbodyRecentDate}>
                            최근 측정일 {formatDate(latest.measured_at)}
                          </p>

                          <div style={styles.inbodyMetricGrid}>
                            {renderInbodyMetric("체중", latest.weight, "kg", previous?.weight, first?.weight, 1, true)}
                            {renderInbodyMetric("골격근량", latest.skeletal_muscle, "kg", previous?.skeletal_muscle, first?.skeletal_muscle, 1, false)}
                            {renderInbodyMetric("체지방량", latest.body_fat_mass, "kg", previous?.body_fat_mass, first?.body_fat_mass, 1, true)}
                            {renderInbodyMetric("체지방률", latest.body_fat_percent, "%", previous?.body_fat_percent, first?.body_fat_percent, 1, true)}
                            {renderInbodyMetric("BMI", latest.bmi, "", previous?.bmi, first?.bmi, 1, true)}
                            {renderInbodyMetric("기초대사량", latest.basal_metabolic_rate, "kcal", previous?.basal_metabolic_rate, first?.basal_metabolic_rate, 0, false)}
                            {renderInbodyMetric("내장지방", latest.visceral_fat_level, "레벨", previous?.visceral_fat_level, first?.visceral_fat_level, 0, true)}
                          </div>

                          {renderRecommendedCalories(latest.basal_metabolic_rate)}
                        </>
                      );
                    })()}

                    {renderInbodyTrendChart()}
                  </>
                )}

                <button onClick={() => setDetailMode("menu")} style={styles.cancelButton}>
                  뒤로
                </button>
              </>
            )}

            {detailMode === "pt" && (
              <>
                {(() => {
                  const pt = getPtSummary(selectedMember, ptLogList);
                  return (
                    <p style={styles.detailPt}>
                      총 {pt.total}회 중 {pt.used}회 사용 / {pt.remain}회 남음
                    </p>
                  );
                })()}

                <div style={styles.recordHeader}>
                  <h3 style={styles.subTitle}>최근 PT 사용기록</h3>

                  <button onClick={() => setShowAllPtModal(true)} style={styles.smallDark}>
                    전체 사용내역 보기
                  </button>
                </div>

                {getRecentPtLogs().length === 0 ? (
                  <p style={styles.muted}>최근 PT 사용기록이 없습니다.</p>
                ) : (
                  getRecentPtLogs().map((log) => (
                    <div key={log.id} style={styles.logItem}>
                      <div>
                        <div style={styles.logDate}>
                          {formatDateTime(log.created_at)} · {log.amount}회 사용
                        </div>
                      </div>

                      <button onClick={() => cancelPtUse(log)} style={styles.smallDanger}>
                        차감 취소
                      </button>
                    </div>
                  ))
                )}

                <button onClick={() => setDetailMode("menu")} style={styles.cancelButton}>
                  뒤로
                </button>
              </>
            )}

            {detailMode === "attendance" && (
              <>
                <div style={styles.recordHeader}>
                  <h3 style={styles.subTitle}>최근 출석기록</h3>

                  <button
                    onClick={() => setShowAllAttendanceModal(true)}
                    style={styles.smallDark}
                  >
                    전체 출석기록 보기
                  </button>
                </div>

                {getRecentAttendanceLogs().length === 0 ? (
                  <p style={styles.muted}>최근 출석기록이 없습니다.</p>
                ) : (
                  getRecentAttendanceLogs().map((log) => (
                    <div key={log.id} style={styles.logItem}>
                      <div>
                        <div style={styles.logDate}>{formatDateTime(log.visited_at)}</div>
                      </div>

                      <button
                        onClick={() => cancelAttendance(log)}
                        style={styles.smallDanger}
                      >
                        출석 취소
                      </button>
                    </div>
                  ))
                )}

                <button onClick={() => setDetailMode("menu")} style={styles.cancelButton}>
                  뒤로
                </button>
              </>
            )}
          </section>
        </div>
      )}

      {showInbodyModal && selectedMember && (
        <div style={styles.inbodyModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{selectedMember.name} {editingInbodyLog ? "인바디 수정" : "인바디 추가"}</h2>
                <p style={styles.whiteMuted}>BMI는 회원 키와 체중으로 자동 계산됩니다.</p>
              </div>

              <button onClick={closeInbodyModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <label style={styles.whiteLabel}>측정일</label>
            <input
              value={inbodyMeasuredAt}
              onChange={(e) => setInbodyMeasuredAt(e.target.value)}
              type="date"
              style={styles.whiteInput}
            />

            <div style={styles.whiteTwoColumn}>
              <div>
                <label style={styles.whiteLabel}>체중(kg)</label>
                <input
                  value={inbodyWeight}
                  onChange={(e) => setInbodyWeight(e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="예: 58.4"
                  style={styles.whiteInput}
                />
              </div>

              <div>
                <label style={styles.whiteLabel}>골격근량(kg)</label>
                <input
                  value={inbodySkeletalMuscle}
                  onChange={(e) => setInbodySkeletalMuscle(e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="예: 22.5"
                  style={styles.whiteInput}
                />
              </div>
            </div>

            <div style={styles.whiteTwoColumn}>
              <div>
                <label style={styles.whiteLabel}>체지방량(kg)</label>
                <input
                  value={inbodyBodyFatMass}
                  onChange={(e) => setInbodyBodyFatMass(e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="예: 18.2"
                  style={styles.whiteInput}
                />
              </div>

              <div>
                <label style={styles.whiteLabel}>체지방률(%)</label>
                <input
                  value={inbodyBodyFatPercent}
                  onChange={(e) => setInbodyBodyFatPercent(e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="예: 28.5"
                  style={styles.whiteInput}
                />
              </div>
            </div>

            <div style={styles.whiteTwoColumn}>
              <div>
                <label style={styles.whiteLabel}>BMI 자동 계산</label>
                <input
                  value={getCalculatedBmi() ?? ""}
                  readOnly
                  placeholder="체중과 회원 키로 자동 계산"
                  style={{ ...styles.whiteInput, background: "#f3f3f3", color: "#111" }}
                />
              </div>

              <div>
                <label style={styles.whiteLabel}>기초대사량(kcal)</label>
                <input
                  value={inbodyBasalMetabolicRate}
                  onChange={(e) => setInbodyBasalMetabolicRate(e.target.value)}
                  type="number"
                  placeholder="예: 1280"
                  style={styles.whiteInput}
                />
              </div>
            </div>

            {renderRecommendedCalories(inbodyBasalMetabolicRate, true)}

            <label style={styles.whiteLabel}>내장지방레벨</label>
            <input
              value={inbodyVisceralFatLevel}
              onChange={(e) => setInbodyVisceralFatLevel(e.target.value)}
              type="number"
              placeholder="예: 5"
              style={styles.whiteInput}
            />

            <label style={styles.whiteLabel}>메모</label>
            <textarea
              value={inbodyMemo}
              onChange={(e) => setInbodyMemo(e.target.value)}
              placeholder="상담 내용, 식단 상태, 컨디션 등"
              style={styles.whiteTextarea}
            />

            <div style={styles.whiteActionRowFull}>
              <button onClick={saveInbodyLog} style={styles.whiteSaveLargeButton}>
                {editingInbodyLog ? "수정 저장" : "저장"}
              </button>
              <button onClick={closeInbodyModal} style={styles.whiteCancelLargeButton}>
                취소
              </button>
            </div>
          </section>
        </div>
      )}

      {showAllInbodyModal && selectedMember && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{selectedMember.name} 전체 인바디 기록</h2>
                <p style={styles.whiteMuted}>측정 기록을 최신순으로 확인합니다.</p>
              </div>

              <button onClick={() => setShowAllInbodyModal(false)} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            {inbodyList.length === 0 ? (
              <p style={styles.whiteMuted}>인바디 기록이 없습니다.</p>
            ) : (
              inbodyList.map((log) => renderInbodyRecord(log, true))
            )}
          </section>
        </div>
      )}

      {showAllPtModal && selectedMember && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{selectedMember.name} 전체 PT 사용내역</h2>
                <p style={styles.whiteMuted}>저장된 모든 PT 사용기록입니다.</p>
              </div>

              <button onClick={() => setShowAllPtModal(false)} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            {getAllPtLogs().length === 0 ? (
              <p style={styles.whiteMuted}>PT 사용내역이 없습니다.</p>
            ) : (
              getAllPtLogs().map((log) => (
                <div key={log.id} style={styles.whiteWorkoutCard}>
                  <div style={styles.whiteSessionTop}>
                    <p style={styles.whiteSetText}>
                      {formatDateTime(log.created_at)} · {log.amount}회 사용
                    </p>

                    <button onClick={() => cancelPtUse(log)} style={styles.whiteDeleteButton}>
                      차감 취소
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {showAllAttendanceModal && selectedMember && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{selectedMember.name} 전체 출석기록</h2>
                <p style={styles.whiteMuted}>저장된 모든 출석기록입니다.</p>
              </div>

              <button
                onClick={() => setShowAllAttendanceModal(false)}
                style={styles.whiteCloseButton}
              >
                닫기
              </button>
            </div>

            {getAllAttendanceLogs().length === 0 ? (
              <p style={styles.whiteMuted}>출석기록이 없습니다.</p>
            ) : (
              getAllAttendanceLogs().map((log) => (
                <div key={log.id} style={styles.whiteWorkoutCard}>
                  <div style={styles.whiteSessionTop}>
                    <p style={styles.whiteSetText}>{formatDateTime(log.visited_at)}</p>

                    <button
                      onClick={() => cancelAttendance(log)}
                      style={styles.whiteDeleteButton}
                    >
                      출석 취소
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {workoutMember && (
        <div style={styles.modalOverlay}>
          <section style={workoutMode === "add" ? styles.workoutModalBox : styles.modalBox}>
            <div style={styles.detailTop}>
              <div>
                <h2 style={styles.detailName}>{workoutMember.name} 운동 기록</h2>
                <p style={styles.muted}>운동별로 세트를 나눠 기록하세요.</p>
              </div>
              <button onClick={closeWorkout} style={styles.closeButton}>닫기</button>
            </div>

            {workoutMode === "list" && (
              <>
                <div style={styles.menuGrid}>
                  <button onClick={() => setWorkoutMode("select")} style={styles.menuButton}>
                    + 오늘 운동 기록하기
                  </button>
                </div>

                <div style={styles.recordHeader}>
                  <h3 style={styles.subTitle}>오늘 운동기록</h3>

                  <button
                    onClick={() => setShowAllWorkoutModal(true)}
                    style={styles.smallDark}
                  >
                    전체 운동기록 보기
                  </button>
                </div>

                {getVisibleWorkouts().length === 0 ? (
                  <p style={styles.muted}>오늘 운동기록이 없습니다.</p>
                ) : (
                  getVisibleWorkouts().map(renderTodayWorkoutSession)
                )}
              </>
            )}

            {workoutMode === "select" && (
              <>
                <h3 style={styles.subTitle}>운동 기록 방식 선택</h3>
                <p style={styles.muted}>오늘 수업이 웨이트인지 서킷트레이닝인지 먼저 선택하세요.</p>

                <div style={styles.workoutTypeGrid}>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkoutTrainingType("weight");
                      setWorkoutExercises([{ name: "", sets: [{ weight: "", reps: "" }] }]);
                      setWorkoutMode("add");
                    }}
                    style={styles.workoutTypeButton}
                  >
                    <strong>웨이트</strong>
                    <span>운동별로 세트마다 중량/횟수 입력</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWorkoutTrainingType("circuit");
                      setWorkoutExercises([{ name: "", sets: [{ weight: "", reps: "" }] }]);
                      setWorkoutMode("add");
                    }}
                    style={styles.workoutTypeButton}
                  >
                    <strong>서킷트레이닝</strong>
                    <span>단계 버튼으로 운동 목록 자동 입력</span>
                  </button>
                </div>

                <div style={styles.editActions}>
                  <button onClick={() => setWorkoutMode("list")} style={styles.cancelButton}>
                    뒤로
                  </button>
                </div>
              </>
            )}

            {workoutMode === "add" && (
              <>
                <div style={styles.workoutAddTitleRow}>
                  <div>
                    <h3 style={styles.subTitle}>
                      {workoutTrainingType === "circuit" ? "서킷트레이닝 입력" : "웨이트 입력"}
                    </h3>
                    <p style={styles.workoutTypeLabel}>
                      {workoutTrainingType === "circuit"
                        ? "서킷 모드 · 단계 버튼으로 불러온 뒤 필요한 운동만 수정하세요."
                        : "웨이트 모드 · 세트마다 중량을 다르게 입력하세요."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWorkoutMode("select")}
                    style={styles.smallDark}
                  >
                    방식 변경
                  </button>
                </div>

                {workoutTrainingType === "circuit" && (
                <div style={styles.circuitProgramBox}>
                  <strong>전신 서킷 자동 입력</strong>
                  <p>다이어트/체력증가 회원은 단계 버튼을 눌러 운동 목록을 한 번에 불러오세요.</p>

                  <div style={styles.circuitProgramGrid}>
                    {circuitPrograms.map((program) => (
                      <button
                        key={program.name}
                        type="button"
                        onClick={() => applyCircuitProgram(program)}
                        style={styles.circuitProgramButton}
                      >
                        {program.name}
                      </button>
                    ))}
                  </div>
                </div>
                )}

                <div style={styles.workoutAddTopRow}>
                  <p style={styles.workoutAddGuide}>
                    운동 카드를 작게 나눠 한 화면에 여러 개가 보이게 했습니다. 웨이트는 세트마다 중량을 다르게 입력하세요.
                  </p>

                  <button onClick={addExercise} style={styles.compactAddExerciseButton}>
                    + 운동 추가
                  </button>
                </div>

                <div style={styles.workoutExerciseGrid}>
                  {workoutExercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} style={styles.workoutExerciseCard}>
                      <div style={styles.workoutExerciseCardTop}>
                        <strong style={styles.workoutExerciseTitle}>
                          {exerciseIndex + 1}번 운동
                        </strong>

                        {workoutExercises.length > 1 && (
                          <button
                            onClick={() => removeExercise(exerciseIndex)}
                            style={styles.compactDeleteButton}
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <input
                        value={exercise.name}
                        onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                        placeholder="운동명"
                        style={styles.compactExerciseNameInput}
                      />

                      {getExerciseSuggestions(exercise.name).length > 0 && (
                        <div style={styles.compactExerciseSuggestBox}>
                          {getExerciseSuggestions(exercise.name).map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => selectExerciseSuggestion(exerciseIndex, suggestion)}
                              style={styles.compactExerciseSuggestButton}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {(() => {
                        const lastGroup = getLastExerciseGroup(exercise.name);

                        if (!lastGroup) return null;

                        return (
                          <div style={styles.compactLastExerciseBox}>
                            <p style={styles.compactLastExerciseText}>
                              <strong>지난 기록</strong> · {formatDate(lastGroup.workoutDate)}
                            </p>
                            <p style={styles.compactLastExerciseSummary}>
                              {getLastExerciseSummary(lastGroup)}
                            </p>

                            <button
                              type="button"
                              onClick={() => applyLastExercise(exerciseIndex, lastGroup)}
                              style={styles.compactLastExerciseButton}
                            >
                              불러오기
                            </button>
                          </div>
                        );
                      })()}

                      <div style={styles.compactSetHeader}>
                        <span>세트</span>
                        <span>중량</span>
                        <span>횟수</span>
                        <span />
                      </div>

                      <div style={styles.compactSetList}>
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} style={styles.compactSetRow}>
                            <div style={styles.compactSetNumber}>{setIndex + 1}</div>

                            <input
                              value={set.weight}
                              onChange={(e) =>
                                updateSetValue(exerciseIndex, setIndex, "weight", e.target.value)
                              }
                              placeholder="kg"
                              type="number"
                              style={styles.compactSetInput}
                            />

                            <input
                              value={set.reps}
                              onChange={(e) =>
                                updateSetValue(exerciseIndex, setIndex, "reps", e.target.value)
                              }
                              placeholder="회"
                              type="number"
                              style={styles.compactSetInput}
                            />

                            {exercise.sets.length > 1 ? (
                              <button
                                onClick={() => removeSet(exerciseIndex, setIndex)}
                                style={styles.compactSetDeleteButton}
                              >
                                ×
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        ))}
                      </div>

                      <button onClick={() => addSet(exerciseIndex)} style={styles.compactAddSetButton}>
                        + 세트
                      </button>
                    </div>
                  ))}
                </div>

                <div style={styles.trainerJournalInputBox}>
                  <h3 style={{ ...styles.subTitle, marginTop: 0 }}>트레이너 일지</h3>

                  <label style={styles.label}>오늘 컨디션</label>
                  <div style={styles.conditionButtonGrid}>
                    <button
                      type="button"
                      onClick={() => setWorkoutCondition("good")}
                      style={workoutCondition === "good" ? styles.conditionButtonActive : styles.conditionButton}
                    >
                      좋음
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkoutCondition("normal")}
                      style={workoutCondition === "normal" ? styles.conditionButtonActive : styles.conditionButton}
                    >
                      보통
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkoutCondition("bad")}
                      style={workoutCondition === "bad" ? styles.conditionButtonActive : styles.conditionButton}
                    >
                      나쁨
                    </button>
                  </div>

                  <label style={styles.label}>오늘 핵심 이슈</label>
                  <textarea
                    value={workoutIssue}
                    onChange={(e) => setWorkoutIssue(e.target.value)}
                    placeholder="예: 허리 통증, 어깨 가동성 부족, 집중력 낮음"
                    style={styles.textarea}
                  />

                  <label style={styles.label}>다음 수업 포인트</label>
                  <textarea
                    value={workoutNextPlan}
                    onChange={(e) => setWorkoutNextPlan(e.target.value)}
                    placeholder="예: 하체 위주, 스트레칭 먼저, 중량 줄이고 자세 교정"
                    style={styles.textarea}
                  />

                  <label style={styles.label}>한줄 총평</label>
                  <input
                    value={workoutTrainerNote}
                    onChange={(e) => setWorkoutTrainerNote(e.target.value)}
                    placeholder="예: 폼 무너짐 심함 / 컨디션 안 좋음"
                    style={styles.input}
                  />

                  <label style={styles.label}>추가 메모</label>
                  <textarea
                    value={workoutMemo}
                    onChange={(e) => setWorkoutMemo(e.target.value)}
                    placeholder="그 외 기억할 내용"
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.editActions}>
                  <button onClick={saveWorkout} style={styles.primaryButton}>저장</button>
                  <button onClick={() => setWorkoutMode("select")} style={styles.cancelButton}>
                    취소
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {showAllWorkoutModal && workoutMember && (
        <div style={styles.workoutHistoryOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{workoutMember.name} 전체 운동기록</h2>
                <p style={styles.whiteMuted}>
                  중량이나 횟수를 잘못 입력했을 때 여기서 수정할 수 있습니다.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAllWorkoutModal(false);
                  clearWorkoutEdit();
                }}
                style={styles.whiteCloseButton}
              >
                닫기
              </button>
            </div>

            {workoutSessions.length === 0 ? (
              <p style={styles.whiteMuted}>운동기록이 없습니다.</p>
            ) : (
              workoutSessions.map((session) => {
                const groups = groupWorkoutSets(session.workout_sets || []);

                return (
                  <div key={session.id} style={styles.whiteWorkoutCard}>
                    <div style={styles.whiteSessionTop}>
                      <h3 style={styles.whiteWorkoutDate}>{formatDate(session.workout_date)}</h3>

                      <button
                        onClick={() => deleteWorkoutSession(session)}
                        style={styles.whiteDeleteButton}
                      >
                        날짜 전체 삭제
                      </button>
                    </div>

                    {groups.length === 0 ? (
                      <p style={styles.whiteMuted}>운동 상세 없음</p>
                    ) : (
                      groups.map((group, groupIndex) => (
                        <div key={group.key} style={styles.whiteExerciseGroup}>
                          <p style={styles.whiteExerciseTitle}>
                            {groupIndex + 1}번 운동 · {group.exerciseName}
                          </p>

                          {group.sets.map((set, setIndex) => (
                            <div
                              key={set.id || `${group.key}-${setIndex}`}
                              style={styles.whiteSetRow}
                            >
                              {editingWorkoutSetId === set.id ? (
                                <>
                                  <input
                                    value={editWorkoutName}
                                    onChange={(e) => setEditWorkoutName(e.target.value)}
                                    placeholder="운동명"
                                    style={styles.whiteInput}
                                  />
                                  <input
                                    value={editWorkoutWeight}
                                    onChange={(e) => setEditWorkoutWeight(e.target.value)}
                                    placeholder="중량"
                                    type="number"
                                    style={styles.whiteInput}
                                  />
                                  <input
                                    value={editWorkoutReps}
                                    onChange={(e) => setEditWorkoutReps(e.target.value)}
                                    placeholder="횟수"
                                    type="number"
                                    style={styles.whiteInput}
                                  />

                                  <div style={styles.whiteActionRow}>
                                    <button
                                      onClick={() => saveWorkoutSetEdit(set)}
                                      style={styles.whiteSaveButton}
                                    >
                                      저장
                                    </button>
                                    <button
                                      onClick={clearWorkoutEdit}
                                      style={styles.whiteCancelButton}
                                    >
                                      취소
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p style={styles.whiteSetText}>
                                    {set.set_number || setIndex + 1}세트 ·{" "}
                                    {set.weight ? `${set.weight}kg` : "중량 미입력"} ·{" "}
                                    {set.reps ? `${set.reps}회` : "횟수 미입력"}
                                  </p>

                                  <div style={styles.whiteActionRow}>
                                    <button
                                      onClick={() => startWorkoutSetEdit(set)}
                                      style={styles.whiteEditButton}
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => deleteWorkoutSet(set)}
                                      style={styles.whiteDeleteButton}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ))
                    )}

                    {renderTrainerJournal(session, true)}
                  </div>
                );
              })
            )}
          </section>
        </div>
      )}

      {ptModalMember && (
        <div style={styles.ptModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>
                  {ptModalMember.name} 이용권 추가
                </h2>
                <p style={styles.whiteMuted}>
                  회차와 결제금액을 입력하면 1회당 금액이 자동 계산됩니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => closePtModal()}
                style={styles.whiteCloseButton}
              >
                닫기
              </button>
            </div>

            <label style={styles.whiteLabel}>추가 방식</label>
            <div style={styles.ptAddTypeGrid}>
              <button
                type="button"
                onClick={() => setPtAddType("paid")}
                style={ptAddType === "paid" ? styles.ptAddTypeButtonActive : styles.ptAddTypeButton}
              >
                유료 결제
              </button>

              <button
                type="button"
                onClick={() => {
                  setPtAddType("event");
                  setPtTotalPrice("");
                  if (!selectedPtAmount) setSelectedPtAmount(1);
                }}
                style={ptAddType === "event" ? styles.ptAddTypeButtonActive : styles.ptAddTypeButton}
              >
                이벤트 / 서비스
              </button>
            </div>

            <label style={styles.whiteLabel}>추가 회차</label>
            <div style={styles.ptOptionGridWhite}>
              {ptOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedPtAmount(amount)}
                  style={
                    Number(selectedPtAmount) === amount
                      ? styles.ptOptionButtonSelected
                      : styles.ptOptionButtonWhite
                  }
                >
                  {amount}회
                </button>
              ))}
            </div>

            {ptAddType === "paid" ? (
              <>
                <label style={styles.whiteLabel}>결제금액</label>
                <div style={styles.priceInputWrap}>
                  <input
                    value={ptTotalPrice ? formatWon(ptTotalPrice) : ""}
                    onChange={(e) => setPtTotalPrice(onlyNumber(e.target.value))}
                    placeholder="예: 500000"
                    inputMode="numeric"
                    style={styles.whiteInput}
                  />
                  <span style={styles.priceUnit}>원</span>
                </div>

                <div style={styles.priceSummaryBox}>
                  <p style={styles.priceSummaryTitle}>자동 계산</p>
                  <p style={styles.priceSummaryText}>
                    {selectedPtAmount && Number(onlyNumber(ptTotalPrice)) ? (
                      <>
                        총 {Number(selectedPtAmount).toLocaleString("ko-KR")}회 ·{" "}
                        {Number(onlyNumber(ptTotalPrice)).toLocaleString("ko-KR")}원
                        <br />
                        1회당 {getPricePerSession().toLocaleString("ko-KR")}원
                      </>
                    ) : (
                      "회차와 금액을 입력하면 1회당 금액이 표시됩니다."
                    )}
                  </p>
                </div>
              </>
            ) : (
              <div style={styles.eventPtBox}>
                <p style={styles.priceSummaryTitle}>이벤트 / 서비스 추가</p>
                <p style={styles.priceSummaryText}>
                  결제금액 0원으로 PT 회차만 추가됩니다. 매출에는 잡히지 않습니다.
                </p>
              </div>
            )}

            <div style={styles.whiteActionRowFull}>
              <button
                type="button"
                onClick={() => submitPtAdd()}
                style={styles.whiteSaveLargeButton}
              >
                {ptAddType === "event" ? "서비스 추가" : "저장"}
              </button>

              <button
                type="button"
                onClick={() => closePtModal()}
                style={styles.whiteCancelLargeButton}
              >
                취소
              </button>
            </div>
          </section>
        </div>
      )}

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

      <section style={styles.actionSearchGridThree}>
        <button onClick={() => setShowAddModal(true)} style={styles.actionBigCard}>
          <span style={{ ...styles.actionBigIcon, color: "#facc15" }}>👤</span>
          <span>
            <strong>회원 추가</strong>
            <p>새로운 회원을 등록합니다</p>
          </span>
          <span style={styles.actionCardArrow}>›</span>
        </button>

        <button onClick={() => openMemberListModal("회원 목록", true, false)} style={styles.actionBigCard}>
          <span style={{ ...styles.actionBigIcon, color: "#38bdf8" }}>☰</span>
          <span>
            <strong>회원 목록 / 검색</strong>
            <p>활성 회원을 보고 바로 검색합니다</p>
          </span>
          <span style={styles.actionCardArrow}>›</span>
        </button>

      </section>

      {showMemberListModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.memberListModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{memberListTitle}</h2>
                <p style={styles.whiteMuted}>{showInactiveMembers ? "비활성 회원은 복구 후 다시 운영 목록에 표시됩니다." : "회원을 검색하고 카드를 누르면 상세보기로 바로 이동합니다."}</p>
              </div>

              <button onClick={closeMemberListModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.memberListSearchBox}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름 또는 전화번호 검색"
                style={{ ...styles.whiteInput, marginBottom: 0 }}
              />

              {isSearching && (
                <button onClick={() => setSearch("")} style={styles.whiteCancelButton}>
                  초기화
                </button>
              )}
            </div>

            <div style={styles.memberSortRow}>
              <button
                type="button"
                onClick={() => setMemberSortMode("default")}
                style={memberSortMode === "default" ? styles.memberSortButtonActive : styles.memberSortButton}
              >
                기본순
              </button>
              <button
                type="button"
                onClick={() => setMemberSortMode("sales")}
                style={memberSortMode === "sales" ? styles.memberSortButtonActive : styles.memberSortButton}
              >
                매출순
              </button>
            </div>

            {isSearching && <p style={styles.whiteMuted}>“{search}” 검색 중</p>}

            {filteredMembers.length === 0 ? (
              <p style={styles.whiteMuted}>
                {isSearching ? "검색 결과가 없습니다." : showInactiveMembers ? "비활성 회원이 없습니다." : "회원이 없습니다."}
              </p>
            ) : (
              <div style={styles.memberModalGrid}>
                {filteredMembers.map(renderMemberCard)}
              </div>
            )}
          </section>
        </div>
      )}

    </main>
  );
}

const styles = {
  appToast: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 100000,
    background: "rgba(20,20,20,0.96)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 999,
    padding: "12px 18px",
    fontSize: 15,
    fontWeight: 900,
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
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
    cursor: "pointer",
  },
  summaryBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginBottom: 14,
  },
  salesBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 22,
  },
  salesCard: {
    background: "#111",
    border: "1px solid #333",
    borderRadius: 20,
    padding: 18,
    textAlign: "center",
  },
  salesLabel: {
    color: "#aaa",
    margin: "0 0 8px",
    fontSize: 14,
    fontWeight: 800,
  },
  salesValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 900,
  },
  salesMiniText: {
    color: "#aaa",
    margin: "6px 0 0",
    fontSize: 12,
    fontWeight: 800,
  },
  autoCareBox: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 24,
    padding: 0,
    marginBottom: 14,
    boxShadow: "0 12px 32px rgba(0,0,0,.22)",
  },
  contactCardDefault: {
    border: "1px solid #272727",
  },
  contactCardBlue: {
    border: "2px solid #3b82f6",
  },
  contactCardRed: {
    border: "2px solid #ef4444",
  },
  contactCardGreen: {
    border: "2px solid #22c55e",
  },
  contactCardGold: {
    border: "2px solid #facc15",
  },
  contactListOpenButton: {
    width: "100%",
    background: "transparent",
    color: "#fff",
    border: "none",
    padding: 22,
    display: "flex",
    alignItems: "center",
    gap: 18,
    textAlign: "left",
  },
  contactIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    background: "#163a24",
    color: "#4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    fontWeight: 900,
    flexShrink: 0,
  },
  contactCardText: {
    display: "grid",
    gap: 6,
  },
  contactLegendBox: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    fontSize: 14,
    fontWeight: 900,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#bbb",
    fontSize: 14,
    fontWeight: 900,
  },
  legendBlue: {
    width: 34,
    height: 7,
    borderRadius: 999,
    background: "#3b82f6",
    display: "inline-block",
  },
  legendRed: {
    width: 34,
    height: 7,
    borderRadius: 999,
    background: "#ef4444",
    display: "inline-block",
  },
  legendGreen: {
    width: 34,
    height: 7,
    borderRadius: 999,
    background: "#22c55e",
    display: "inline-block",
  },
  legendGold: {
    width: 34,
    height: 7,
    borderRadius: 999,
    background: "#facc15",
    display: "inline-block",
  },
  contactListCount: {
    background: "#facc15",
    color: "#111",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 15,
    fontWeight: 900,
    whiteSpace: "nowrap",
    marginLeft: "auto",
  },
  contactListModalBox: {
    width: "100%",
    maxWidth: 860,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  contactListSummaryRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },
  contactListSummaryCard: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gap: 4,
    textAlign: "center",
  },
  contactListRows: {
    display: "grid",
    gap: 10,
  },
  contactListRow: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 18,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    alignItems: "center",
  },
  contactListMain: {
    minWidth: 0,
  },
  contactListName: {
    color: "#111",
    fontSize: 18,
    fontWeight: 900,
  },
  contactListMeta: {
    color: "#555",
    margin: "8px 0 0",
    fontSize: 13,
    fontWeight: 800,
  },
  contactListNote: {
    color: "#333",
    background: "#fff",
    borderRadius: 10,
    padding: "8px 10px",
    margin: "8px 0 0",
    fontSize: 13,
    fontWeight: 800,
  },
  contactListActions: {
    display: "grid",
    gap: 8,
    minWidth: 76,
  },
  autoCareList: {
    display: "grid",
    gap: 10,
  },
  autoCareItem: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  autoCareName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: 900,
  },
  autoCareTags: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  autoCareDoneButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 900,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  todoBox: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
  },
  todoTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  todoTitle: {
    fontSize: 26,
    margin: 0,
    fontWeight: 900,
  },
  todoDesc: {
    color: "#aaa",
    margin: "6px 0 0",
    fontSize: 14,
  },
  todaySalesGood: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 999,
    padding: "9px 13px",
    fontSize: 14,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  todaySalesWarning: {
    background: "#33270a",
    color: "#fde68a",
    border: "1px solid #854d0e",
    borderRadius: 999,
    padding: "9px 13px",
    fontSize: 14,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  todoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  todoCard: {
    background: "#202020",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 14,
    textAlign: "left",
  },
  todoCardLabel: {
    display: "block",
    color: "#aaa",
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 8,
  },
  todoCardCount: {
    display: "block",
    color: "#fff",
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 6,
  },
  todoCardDesc: {
    display: "block",
    color: "#777",
    fontSize: 12,
    fontWeight: 800,
  },
  summaryCardWithIcon: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 22,
    padding: "16px 18px",
    color: "#fff",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
  },
  summaryMainButton: {
    background: "transparent",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 18,
    textAlign: "left",
    padding: 0,
    cursor: "pointer",
  },
  summarySmsButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    fontWeight: 900,
  },
  summaryIconYellow: {
    color: "#facc15",
  },
  summaryIconRed: {
    color: "#ef4444",
  },
  summaryIconGreen: {
    color: "#22c55e",
  },
  summaryTextWrap: {
    display: "grid",
    gap: 4,
    fontSize: 16,
    fontWeight: 900,
  },
  scheduleBox: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
  },
  scheduleTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 26,
    margin: 0,
    fontWeight: 900,
  },
  scheduleDateText: {
    color: "#aaa",
    margin: "6px 0 0",
    fontSize: 14,
  },
  scheduleAddButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "none",
    borderRadius: 16,
    padding: "13px 16px",
    fontSize: 16,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  scheduleList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
  },
  scheduleItem: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
  },
  scheduleItemNoShow: {
    background: "linear-gradient(180deg, #211b1b 0%, #1c1414 100%)",
    border: "1px solid #5a1f1f",
  },
  scheduleItemCancelled: {
    background: "#1a1a1a",
    border: "1px solid #2f2f2f",
    opacity: 0.62,
  },
  scheduleMain: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
    cursor: "pointer",
  },
  scheduleTime: {
    minWidth: 72,
    color: "#93c5fd",
    fontSize: 16,
    fontWeight: 900,
  },
  scheduleMemberName: {
    color: "#fff",
    fontSize: 17,
  },
  scheduleMemo: {
    color: "#aaa",
    fontSize: 13,
    margin: "5px 0 0",
  },
  scheduleStatusRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  scheduleDoneText: {
    color: "#d7fff3",
    background: "#263a36",
    border: "1px solid #3f5f58",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 900,
  },
  scheduleWarningText: {
    color: "#fde68a",
    background: "#33270a",
    border: "1px solid #854d0e",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 900,
  },
  scheduleNoShowText: {
    color: "#fca5a5",
    background: "#351414",
    border: "1px solid #6b2424",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 900,
  },
  scheduleCancelText: {
    color: "#bdbdbd",
    background: "#242424",
    border: "1px solid #444",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 900,
  },
  scheduleActionRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
  },
  scheduleCompleteButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "12px 12px",
    fontWeight: 900,
    fontSize: 15,
    whiteSpace: "nowrap",
  },
  scheduleSubActionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
  },
  scheduleMiniButton: {
    background: "#1d4ed8",
    color: "#fff",
    border: "1px solid #2563eb",
    borderRadius: 10,
    padding: "7px 8px",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  scheduleMiniDanger: {
    background: "#7f1d1d",
    color: "#fee2e2",
    border: "1px solid #991b1b",
    borderRadius: 10,
    padding: "7px 8px",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  scheduleNoShowButton: {
    background: "#2a1818",
    color: "#fca5a5",
    border: "1px solid #5a1f1f",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  scheduleCancelButton: {
    background: "#181818",
    color: "#ddd",
    border: "1px solid #555",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  scheduleDisabledButton: {
    background: "#2a2a2a",
    color: "#777",
    border: "1px solid #3a3a3a",
    borderRadius: 12,
    padding: "12px 12px",
    fontWeight: 900,
    fontSize: 15,
    whiteSpace: "nowrap",
  },
  scheduleDisabledSmallButton: {
    background: "#2a2a2a",
    color: "#777",
    border: "1px solid #3a3a3a",
    borderRadius: 10,
    padding: "7px 8px",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  scheduleDeleteButton: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 900,
  },
  incompleteBox: {
    background: "#1f1a12",
    border: "1px solid #5b4320",
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
  },
  incompleteTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  incompleteTitle: {
    fontSize: 22,
    margin: 0,
    fontWeight: 900,
    color: "#fde68a",
  },
  incompleteDesc: {
    color: "#c9b27a",
    margin: "6px 0 0",
    fontSize: 14,
  },
  incompleteCount: {
    background: "#facc15",
    color: "#111",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 15,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  incompleteList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 10,
    alignItems: "stretch",
  },
  incompleteItem: {
    background: "#241f17",
    border: "1px solid #4a3a1f",
    borderRadius: 18,
    padding: "12px 14px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    alignItems: "stretch",
    minWidth: 0,
  },
  incompleteMain: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  incompleteCompleteButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  calendarButton: {
    background: "#172554",
    color: "#bfdbfe",
    border: "1px solid #1d4ed8",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  googleCalendarButton: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  incompleteButtonGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    width: "100%",
  },
  incompleteNoShowButton: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  incompleteCancelScheduleButton: {
    background: "#181818",
    color: "#ddd",
    border: "1px solid #555",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    fontSize: 14,
    whiteSpace: "nowrap",
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
  summaryActionGroup: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
    minWidth: 72,
  },
  summaryPhoneButton: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 900,
    textAlign: "center",
    textDecoration: "none",
    fontSize: 14,
  },
  contactSmsButton: {
    background: "#172554",
    color: "#bfdbfe",
    border: "1px solid #1d4ed8",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 900,
    textAlign: "center",
    textDecoration: "none",
    fontSize: 14,
  },
  summaryContactButton: {
    background: "#181818",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 900,
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
  scheduleAddWideBox: {
    marginBottom: 22,
  },
  scheduleActionWideGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 22,
  },
  scheduleAddWideButton: {
    width: "100%",
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 22,
    color: "#fff",
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    fontSize: 22,
    fontWeight: 900,
    textAlign: "left",
  },
  actionSearchGridThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 34,
  },
  actionSearchGridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 34,
  },
  actionBigCard: {
    background: "#151515",
    border: "1px solid #272727",
    borderRadius: 24,
    padding: 22,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 16,
    minHeight: 116,
    textAlign: "left",
  },
  actionBigIcon: {
    fontSize: 42,
    fontWeight: 900,
    lineHeight: 1,
  },
  actionCardIcon: {
    fontSize: 28,
    color: "#fff",
  },
  actionCardArrow: {
    marginLeft: "auto",
    fontSize: 34,
    color: "#ddd",
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
    zIndex: 10000,
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82vh",
    overflowY: "auto",
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 24,
    padding: 18,
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
  ptAddTypeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 16,
  },
  ptAddTypeButton: {
    background: "#f3f3f3",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  ptAddTypeButtonActive: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  eventPtBox: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  ptOptionGridWhite: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginBottom: 16,
  },
  ptOptionButtonWhite: {
    background: "#f3f3f3",
    color: "#111",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "12px 8px",
    fontSize: 15,
    fontWeight: 900,
  },
  ptOptionButtonSelected: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 12,
    padding: "12px 8px",
    fontSize: 15,
    fontWeight: 900,
  },
  priceInputWrap: {
    position: "relative",
  },
  priceUnit: {
    position: "absolute",
    right: 14,
    top: 13,
    color: "#555",
    fontWeight: 900,
  },
  priceSummaryBox: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  priceSummaryTitle: {
    margin: 0,
    marginBottom: 6,
    color: "#111",
    fontSize: 14,
    fontWeight: 900,
  },
  priceSummaryText: {
    margin: 0,
    color: "#333",
    fontSize: 15,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  scheduleSlotBox: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  scheduleSlotTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
    color: "#111",
    fontWeight: 900,
  },
  scheduleSlotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 8,
  },
  scheduleSlotButton: {
    borderRadius: 14,
    padding: "12px 10px",
    textAlign: "left",
    display: "grid",
    gap: 5,
    fontSize: 14,
    fontWeight: 900,
  },
  scheduleSlotEmpty: {
    background: "#ffffff",
    color: "#111",
    border: "1px solid #e5e5e5",
  },
  scheduleSlotOne: {
    background: "#ecfeff",
    color: "#155e75",
    border: "1px solid #67e8f9",
  },
  scheduleSlotFull: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #facc15",
  },
  scheduleSlotOver: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
  conflictWarningBox: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #facc15",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  conflictStrongBox: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  conflictList: {
    display: "grid",
    gap: 10,
    marginBottom: 14,
  },
  conflictItem: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 14,
    color: "#111",
  },
  schedulePreviewBox: {
    background: "#222",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 14,
    marginTop: -6,
    marginBottom: 16,
  },
  schedulePreviewTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
    color: "#fff",
    fontWeight: 900,
  },
  schedulePreviewEmpty: {
    color: "#aaa",
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
  },
  schedulePreviewList: {
    display: "grid",
    gap: 8,
  },
  schedulePreviewItem: {
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  schedulePreviewTime: {
    color: "#93c5fd",
    fontSize: 15,
    fontWeight: 900,
  },
  schedulePreviewMember: {
    color: "#ddd",
    margin: "5px 0 0",
    fontSize: 14,
    fontWeight: 800,
  },
  schedulePreviewHint: {
    color: "#fde68a",
    margin: "10px 0 0",
    fontSize: 13,
    fontWeight: 800,
  },
  scheduleFormHint: {
    color: "#aaa",
    margin: "-4px 0 10px",
    fontSize: 13,
    fontWeight: 800,
  },
  scheduleConflictBox: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 14,
    padding: 12,
    marginTop: -6,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 900,
  },
  autoEndTimeBox: {
    background: "#222",
    border: "1px solid #444",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    color: "#fff",
  },
  scheduleEditButton: {
    background: "#181818",
    color: "#f5f5f5",
    border: "1px solid #444",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  timeQuickRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: -6,
    marginBottom: 16,
  },
  timeQuickButton: {
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 14,
    padding: "12px 10px",
    fontSize: 14,
    fontWeight: 900,
  },
  exerciseSuggestBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: -8,
    marginBottom: 14,
  },
  exerciseSuggestButton: {
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 900,
  },
  lastExerciseBox: {
    background: "#2a2415",
    border: "1px solid #6b4d12",
    borderRadius: 16,
    padding: 12,
    marginTop: -4,
    marginBottom: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  lastExerciseButton: {
    background: "#facc15",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "9px 12px",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  menuGrid: {
    display: "grid",
    gap: 12,
  },
  menuButton: {
    background: "#222",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 18,
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 12,
  },
  recordHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
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
  membersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
    alignItems: "stretch",
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
  circuitProgramBox: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  circuitProgramGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
    marginTop: 12,
  },
  circuitProgramButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  suggestionBox: {
  background: "#222",
  border: "1px solid #444",
  borderRadius: 10,
  marginTop: 6,
},
suggestionItem: {
  padding: 10,
  borderBottom: "1px solid #333",
  color: "#fff",
  cursor: "pointer",
},
textarea: {
    width: "100%",
    minHeight: 90,
    padding: 17,
    borderRadius: 17,
    border: "1px solid #333",
    background: "#f7f7f7",
    color: "#111",
    fontSize: 17,
    boxSizing: "border-box",
    marginBottom: 16,
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
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
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    boxShadow: "0 10px 28px rgba(0,0,0,.25)",
  },
  cardCompact: {
    background: "#1c1c1c",
    border: "1px solid #292929",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    boxShadow: "0 8px 22px rgba(0,0,0,.2)",
  },
  compactTop: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 10,
  },
  memberNameSmall: {
    fontSize: 22,
    margin: 0,
    marginBottom: 8,
    fontWeight: 900,
    color: "#ffffff",
    wordBreak: "keep-all",
  },
  ptCountSmall: {
    fontSize: 22,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  phoneSmall: {
    color: "#b3b3b3",
    fontSize: 16,
    margin: 0,
    marginBottom: 8,
  },
  memberTypeRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  generalMemberBadge: {
    background: "#262626",
    color: "#ddd",
    border: "1px solid #444",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  ptMemberBadge: {
    background: "#172554",
    color: "#bfdbfe",
    border: "1px solid #1d4ed8",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  groupMemberBadge: {
    background: "#2a1f3d",
    color: "#e9d5ff",
    border: "1px solid #7e22ce",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  memberSalesRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  memberSalesText: {
    color: "#facc15",
    fontSize: 14,
    fontWeight: 900,
  },
  vipBadge: {
    background: "#facc15",
    color: "#111",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 900,
  },
  compactInfoRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    color: "#93c5fd",
    fontSize: 14,
    marginBottom: 8,
  },
  detailActionBox: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 22,
    padding: 16,
    marginTop: 18,
  },
  detailPtMini: {
    fontSize: 22,
    fontWeight: 900,
    margin: "0 0 14px",
  },
  detailButtonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  detailButtonGridClean: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
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
  memberCardActionRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 14,
    marginTop: 8,
    marginBottom: 14,
  },
  cardPtAddButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "9px 12px",
    fontSize: 14,
    fontWeight: 900,
    width: "100%",
  },
  cardDeactivateButton: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 12,
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 900,
    width: "100%",
  },
  cardRestoreButton: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 12,
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 900,
    width: "100%",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  redButton: {
    background: "#7f1d1d",
    color: "#fee2e2",
    border: "1px solid #991b1b",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
  },
  whiteButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
  },
  blueButton: {
    gridColumn: "1 / 3",
    background: "#1d4ed8",
    color: "#fff",
    border: "1px solid #2563eb",
    borderRadius: 14,
    padding: "14px",
    fontSize: 16,
    fontWeight: 900,
  },
  greenButton: {
    gridColumn: "1 / 3",
    background: "#202020",
    color: "#f5f5f5",
    border: "1px solid #3a3a3a",
    borderRadius: 14,
    padding: "14px",
    fontSize: 16,
    fontWeight: 900,
  },
  phoneButton: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
    textAlign: "center",
    textDecoration: "none",
    boxSizing: "border-box",
  },
  contactButton: {
    background: "#181818",
    color: "#f5f5f5",
    border: "1px solid #4a4a4a",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 16,
    fontWeight: 900,
  },
  darkButton: {
    background: "#181818",
    color: "#f5f5f5",
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
    marginTop: 12,
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
    fontSize: 22,
    marginTop: 22,
    marginBottom: 14,
  },
  infoBlock: {
    background: "#222",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    color: "#eee",
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
  smallDanger: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 800,
  },
  setRow: {
    display: "grid",
    gridTemplateColumns: "70px 1fr 1fr auto",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  setNumber: {
    color: "#ddd",
    fontWeight: 900,
    fontSize: 14,
  },
  inbodyTrendBox: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 14,
    margin: "14px 0 18px",
  },
  inbodyTrendHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  inbodyTrendDateLineRow: {
    display: "grid",
    gridTemplateColumns: "86px 1fr",
    gap: 8,
    alignItems: "center",
    marginBottom: 4,
  },
  inbodyTrendDateGrid: {
    display: "grid",
    gap: 8,
    alignItems: "center",
  },
  inbodyTrendLineRow: {
    display: "grid",
    gridTemplateColumns: "86px 1fr",
    gap: 8,
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid #303030",
  },
  inbodyTrendLineArea: {
    position: "relative",
  },
  inbodyTrendPlotArea: {
    position: "relative",
    height: 38,
    marginBottom: 6,
  },
  inbodyTrendSvg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    width: "100%",
    height: "100%",
    overflow: "visible",
    pointerEvents: "none",
  },
  inbodyTrendDot: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: "999px",
    background: "#ffffff",
    border: "3px solid #22c55e",
    boxShadow: "0 0 0 2px #111, 0 0 8px rgba(34, 197, 94, 0.5)",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
  },
  inbodyTrendValueGrid: {
    display: "grid",
    gap: 8,
    alignItems: "center",
  },
  inbodyTrendValueLayer: {
    position: "relative",
    height: 24,
    marginTop: 2,
  },
  inbodyTrendDateRow: {
    display: "grid",
    gridTemplateColumns: "86px repeat(4, minmax(58px, 1fr))",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  inbodyTrendDate: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: 900,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  inbodyTrendRow: {
    display: "grid",
    gridTemplateColumns: "86px repeat(4, minmax(58px, 1fr))",
    gap: 8,
    alignItems: "end",
    padding: "9px 0",
    borderTop: "1px solid #303030",
  },
  inbodyTrendLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 900,
    paddingBottom: 10,
    whiteSpace: "nowrap",
  },
  inbodyTrendCell: {
    minHeight: 82,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
  },
  inbodyTrendBarTrack: {
    width: "100%",
    maxWidth: 46,
    height: 48,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 999,
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
  },
  inbodyTrendBar: {
    width: "100%",
    background: "#facc15",
    borderRadius: 999,
  },
  inbodyTrendValue: {
    position: "absolute",
    top: 0,
    transform: "translateX(-50%)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 900,
    lineHeight: "20px",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  inbodyRecentDate: {
    display: "inline-block",
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #facc15",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 15,
    fontWeight: 900,
    margin: "0 0 14px",
  },
  inbodyMetricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
    gap: 10,
    marginBottom: 18,
  },
  inbodyMetricCard: {
    background: "#222",
    border: "1px solid #333",
    borderRadius: 16,
    padding: 14,
  },
  inbodyMetricLabel: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: 900,
    margin: "0 0 8px",
  },
  inbodyMetricValue: {
    display: "block",
    color: "#fff",
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 10,
  },
  inbodyDeltaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
    marginTop: 6,
  },
  inbodyDeltaCaption: {
    color: "#888",
    fontSize: 12,
    fontWeight: 800,
  },
  inbodyDeltaGood: {
    color: "#d7fff3",
    background: "#263a36",
    border: "1px solid #3f5f58",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  inbodyDeltaBad: {
    color: "#fecaca",
    background: "#3f1111",
    border: "1px solid #7f1d1d",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  inbodyDeltaNeutral: {
    color: "#ddd",
    background: "#333",
    border: "1px solid #444",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  inbodyRecordGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4px 10px",
  },
  adminMenuBox: {
    background: "#f7f7f7",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  adminMenuButton: {
    width: "100%",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "16px 12px",
    fontWeight: 900,
    fontSize: 17,
  },
  centerPreviewBox: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    color: "#111",
  },
  contactResultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginBottom: 14,
  },
  contactResultButton: {
    background: "#f3f3f3",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  contactResultButtonActive: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  contactNextBox: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #facc15",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    fontSize: 14,
    fontWeight: 900,
  },
  scheduleCheckModalBox: {
    width: "100%",
    maxWidth: 860,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  scheduleCheckDateRow: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleCheckMoveButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 900,
  },
  scheduleMiniCalendarBox: {
    background: "#f7f7f7",
    border: "1px solid #e4e4e4",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  scheduleMiniCalendarHeader: {
    display: "grid",
    gridTemplateColumns: "36px 1fr 36px",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  scheduleMiniMonthButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    height: 34,
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1,
  },
  scheduleMiniMonthTitle: {
    color: "#111",
    fontSize: 18,
    fontWeight: 900,
    textAlign: "center",
  },
  scheduleMiniWeekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    marginBottom: 4,
  },
  scheduleMiniWeekCell: {
    textAlign: "center",
    color: "#777",
    fontSize: 12,
    fontWeight: 900,
  },
  scheduleMiniCalendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
  },
  scheduleMiniEmptyDay: {
    minHeight: 34,
  },
  scheduleMiniDay: {
    minHeight: 34,
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    padding: "4px 3px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    color: "#111",
  },
  scheduleMiniDayToday: {
    minHeight: 34,
    background: "#fff7d6",
    border: "1px solid #facc15",
    borderRadius: 10,
    padding: "4px 3px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    color: "#111",
  },
  scheduleMiniDaySelected: {
    minHeight: 34,
    background: "#111",
    border: "1px solid #111",
    borderRadius: 10,
    padding: "4px 3px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    color: "#fff",
  },
  scheduleMiniDayNumber: {
    fontSize: 14,
    fontWeight: 900,
    lineHeight: 1,
  },
  scheduleMiniDayCount: {
    color: "#1d4ed8",
    background: "#dbeafe",
    border: "1px solid #bfdbfe",
    borderRadius: 999,
    padding: "1px 6px",
    fontSize: 10,
    fontWeight: 900,
    lineHeight: 1.15,
  },
  scheduleMiniDayCountSelected: {
    color: "#111",
    background: "#facc15",
    border: "1px solid #fef08a",
    borderRadius: 999,
    padding: "1px 6px",
    fontSize: 10,
    fontWeight: 900,
    lineHeight: 1.15,
  },
  scheduleSearchBox: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 10,
    alignItems: "center",
    marginBottom: 14,
  },
  scheduleCheckTopActions: {
    display: "grid",
    gridTemplateColumns: "100px 1fr",
    gap: 10,
    marginBottom: 16,
  },
  scheduleCheckEmpty: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 18,
    padding: 18,
    color: "#555",
    fontSize: 15,
    fontWeight: 900,
    textAlign: "center",
  },
  scheduleCheckList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 10,
    alignItems: "stretch",
  },
  scheduleCheckItem: {
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 18,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    alignItems: "stretch",
    minWidth: 0,
  },
  scheduleCheckMain: {
    minWidth: 0,
  },
  scheduleCheckTime: {
    color: "#111",
    fontSize: 16,
    fontWeight: 900,
  },
  scheduleCheckMember: {
    color: "#333",
    margin: "4px 0 0",
    fontSize: 14,
    fontWeight: 900,
  },
  scheduleCheckMemo: {
    color: "#666",
    margin: "5px 0 0",
    fontSize: 14,
    fontWeight: 700,
  },
  scheduleSearchResultOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15000,
    padding: 20,
  },
  scheduleTimelineGroup: {
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  scheduleTimelineHeader: {
    background: "#111",
    color: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  scheduleTimelineList: {
    display: "grid",
    gap: 10,
  },
  scheduleTimelineMeta: {
    color: "#666",
    margin: "4px 0 0",
    fontSize: 13,
    fontWeight: 900,
  },
  scheduleCheckButtonGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  },
  whiteModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 16000,
    padding: 20,
  },
  workoutHistoryOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 13000,
    padding: 20,
  },
  editModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 12000,
    padding: 20,
  },
  inbodyModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15000,
    padding: 20,
  },
  ptModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 14000,
    padding: 20,
  },
  whiteModalBox: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "84vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  memberListModalBox: {
    width: "100%",
    maxWidth: 1180,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  memberListSearchBox: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  memberSortRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 14,
  },
  memberSortButton: {
    background: "#f3f3f3",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: "11px 12px",
    fontSize: 14,
    fontWeight: 900,
  },
  memberSortButtonActive: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 12,
    padding: "11px 12px",
    fontSize: 14,
    fontWeight: 900,
  },
  memberModalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
  },
  whiteModalTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  whiteModalTitle: {
    fontSize: 28,
    margin: 0,
    marginBottom: 8,
    fontWeight: 900,
  },
  whiteMuted: {
    color: "#666",
    margin: 0,
    marginBottom: 8,
  },
  whiteCloseButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 900,
  },
  whiteWorkoutCard: {
    background: "#f3f3f3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  whiteSessionTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  whiteWorkoutDate: {
    fontSize: 20,
    margin: 0,
    fontWeight: 900,
    color: "#111",
  },
  whiteExerciseGroup: {
    background: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  whiteExerciseTitle: {
    fontSize: 16,
    fontWeight: 900,
    margin: 0,
    marginBottom: 8,
  },
  whiteSetRow: {
    borderTop: "1px solid #eee",
    paddingTop: 8,
    marginTop: 8,
  },
  whiteSetText: {
    fontSize: 15,
    color: "#333",
    margin: "5px 0",
  },
  whiteInput: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontSize: 15,
    boxSizing: "border-box",
    marginBottom: 8,
  },
  whiteLabel: {
    display: "block",
    color: "#333",
    fontSize: 14,
    marginBottom: 7,
    fontWeight: 900,
  },
  whiteTextarea: {
    width: "100%",
    minHeight: 86,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontSize: 15,
    boxSizing: "border-box",
    marginBottom: 12,
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
  },
  whiteTwoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  whiteActionRowFull: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 8,
  },
  whiteSaveLargeButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "14px 12px",
    fontWeight: 900,
    fontSize: 16,
  },
  whiteCancelLargeButton: {
    background: "#e5e5e5",
    color: "#111",
    border: "none",
    borderRadius: 14,
    padding: "14px 12px",
    fontWeight: 900,
    fontSize: 16,
  },
  whiteActionRow: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },
  whiteEditButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 900,
  },
  whiteSaveButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 900,
  },
  whiteCancelButton: {
    background: "#e5e5e5",
    color: "#111",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 900,
  },
  whiteDeleteButton: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 900,
  },
  whiteMemo: {
    color: "#555",
    marginTop: 10,
    marginBottom: 0,
    fontSize: 15,
  },
  workoutModalBox: {
    width: "100%",
    maxWidth: "min(1180px, calc(100vw - 32px))",
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  workoutTypeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 18,
    marginBottom: 18,
  },
  workoutTypeButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 18,
    padding: "18px 16px",
    fontSize: 16,
    fontWeight: 900,
    display: "grid",
    gap: 8,
    textAlign: "left",
  },
  workoutAddTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  workoutTypeLabel: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: 800,
    margin: "4px 0 0",
    lineHeight: 1.4,
  },
  workoutAddTopRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  workoutAddGuide: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1.45,
    margin: 0,
  },
  compactAddExerciseButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  workoutExerciseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 10,
    alignItems: "start",
  },
  workoutExerciseCard: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 16,
    padding: 12,
    color: "#eee",
    minWidth: 0,
    position: "relative",
  },
  workoutExerciseCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  workoutExerciseTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: 900,
  },
  compactDeleteButton: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 10,
    padding: "6px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  compactExerciseNameInput: {
    width: "100%",
    background: "#f7f7f7",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "10px 11px",
    fontSize: 15,
    fontWeight: 900,
    boxSizing: "border-box",
    marginBottom: 8,
  },
  compactExerciseSuggestBox: {
    display: "flex",
    flexWrap: "nowrap",
    gap: 6,
    overflowX: "auto",
    overflowY: "hidden",
    background: "transparent",
    border: "none",
    borderRadius: 0,
    padding: "0 0 6px 0",
    marginTop: -2,
    marginBottom: 4,
    maxHeight: 34,
  },
  compactExerciseSuggestButton: {
    flex: "0 0 auto",
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 11,
    lineHeight: 1,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  compactLastExerciseBox: {
    background: "#2a2415",
    border: "1px solid #6b4d12",
    borderRadius: 12,
    padding: 9,
    marginBottom: 8,
  },
  compactLastExerciseText: {
    color: "#facc15",
    margin: 0,
    fontSize: 12,
    fontWeight: 900,
  },
  compactLastExerciseSummary: {
    color: "#ddd",
    margin: "5px 0 8px",
    fontSize: 12,
    lineHeight: 1.35,
    fontWeight: 800,
  },
  compactLastExerciseButton: {
    width: "100%",
    background: "#facc15",
    color: "#111",
    border: "none",
    borderRadius: 10,
    padding: "7px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  compactSetHeader: {
    display: "grid",
    gridTemplateColumns: "34px 1fr 1fr 28px",
    gap: 6,
    color: "#aaa",
    fontSize: 11,
    fontWeight: 900,
    marginBottom: 5,
    padding: "0 2px",
  },
  compactSetList: {
    display: "grid",
    gap: 6,
  },
  compactSetRow: {
    display: "grid",
    gridTemplateColumns: "34px 1fr 1fr 28px",
    gap: 6,
    alignItems: "center",
  },
  compactSetNumber: {
    height: 34,
    borderRadius: 10,
    background: "#151515",
    color: "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 900,
  },
  compactSetInput: {
    width: "100%",
    height: 34,
    background: "#f7f7f7",
    color: "#111",
    border: "none",
    borderRadius: 10,
    padding: "7px 8px",
    fontSize: 14,
    fontWeight: 900,
    boxSizing: "border-box",
  },
  compactSetDeleteButton: {
    width: 28,
    height: 34,
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 900,
    lineHeight: 1,
  },
  compactAddSetButton: {
    width: "100%",
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 12,
    padding: "8px 10px",
    marginTop: 8,
    fontSize: 13,
    fontWeight: 900,
  },
  trainerJournalInputBox: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  conditionButtonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
    marginBottom: 16,
  },
  conditionButton: {
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  conditionButtonActive: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  trainerJournalBox: {
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  trainerJournalBoxLight: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  trainerJournalTitle: {
    display: "block",
    color: "#fff",
    marginBottom: 6,
    fontSize: 15,
  },
  trainerJournalTitleLight: {
    display: "block",
    color: "#111",
    marginBottom: 6,
    fontSize: 15,
  },
  recommendCalorieBox: {
    background: "#202020",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    marginBottom: 14,
    color: "#fff",
  },
  recommendCalorieBoxLight: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    marginBottom: 14,
    color: "#111",
  },
  recommendCalorieText: {
    color: "#ddd",
    margin: "7px 0 0",
    fontSize: 15,
    fontWeight: 800,
  },
  recommendCalorieTextLight: {
    color: "#333",
    margin: "7px 0 0",
    fontSize: 15,
    fontWeight: 800,
  },
};
