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
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [note, setNote] = useState("");
  const [memo, setMemo] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editModalMember, setEditModalMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);
  const [detailMode, setDetailMode] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [ptLogList, setPtLogList] = useState([]);

  const [showAllPtModal, setShowAllPtModal] = useState(false);
  const [showAllAttendanceModal, setShowAllAttendanceModal] = useState(false);

  const [workoutMember, setWorkoutMember] = useState(null);
  const [workoutSessions, setWorkoutSessions] = useState([]);
  const [workoutMode, setWorkoutMode] = useState("list");
  const [workoutMemo, setWorkoutMemo] = useState("");
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
  const [lastAction, setLastAction] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [actionModalSchedule, setActionModalSchedule] = useState(null);
  const [scheduleMemberId, setScheduleMemberId] = useState("");
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString());
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [scheduleType, setScheduleType] = useState("pt");
  const [scheduleMemo, setScheduleMemo] = useState("");

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    loadMembers();
    loadSchedules();
  }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select(
        "*, attendance_logs(visited_at,is_cancelled,cancelled_at), pt_logs(type,amount,is_cancelled,created_at)"
      )
      .order("created_at", { ascending: false });

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

      return {
        ...m,
        latest_visit: latest || null,
        latest_pt: latestPt || null,
        pt_used: used,
        pt_total: (m.pt_remaining || 0) + used,
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

  function resetScheduleForm() {
    setScheduleMemberId("");
    setScheduleDate(getTodayDateString());
    setScheduleStartTime("");
    setScheduleEndTime("");
    setScheduleType("pt");
    setScheduleMemo("");
  }

  function openScheduleModal() {
    resetScheduleForm();
    setShowScheduleModal(true);
  }

  function closeScheduleModal() {
    setShowScheduleModal(false);
    resetScheduleForm();
  }

  function openActionModal(schedule) {
    setActionModalSchedule(schedule);
  }

  function closeActionModal() {
    setActionModalSchedule(null);
  }

  async function addSchedule() {
    if (!scheduleMemberId) return alert("회원을 선택하세요.");
    if (!scheduleDate) return alert("날짜를 선택하세요.");
    if (!scheduleStartTime) return alert("시작 시간을 입력하세요.");

    const { error } = await supabase.from("schedules").insert({
      member_id: scheduleMemberId,
      schedule_date: scheduleDate,
      start_time: scheduleStartTime,
      end_time: scheduleEndTime || null,
      type: scheduleType,
      memo: scheduleMemo.trim(),
    });

    if (error) {
      alert("스케줄 저장 실패: " + error.message);
      return;
    }

    closeScheduleModal();
    await loadSchedules(getTodayDateString());
    alert("스케줄이 저장되었습니다.");
  }

  async function deleteSchedule(schedule) {
    if (!confirm("이 스케줄을 삭제할까요?")) return;

    const { error } = await supabase.from("schedules").delete().eq("id", schedule.id);

    if (error) {
      alert("스케줄 삭제 실패: " + error.message);
      return;
    }

    await loadSchedules(getTodayDateString());
  }

  function getScheduleTypeText(type) {
    if (type === "ot") return "OT";
    if (type === "consult") return "상담";
    return "PT";
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

    if (schedule.attendance_checked && schedule.pt_used) {
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
      alert("이미 출석과 PT 차감이 완료되어 완료 처리만 했습니다.");
      return;
    }

    if (
      !confirm(
        `${member.name} 수업을 완료 처리할까요?\n출석 체크와 PT 1회 차감이 함께 진행됩니다.`
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
        status: "completed",
        attendance_checked: true,
        pt_used: true,
      })
      .eq("id", schedule.id);

    if (error) {
      alert("스케줄 완료 처리 실패: " + error.message);
      return;
    }

    closeActionModal();
    await loadMembers();
    await loadSchedules(getTodayDateString());
  }

  async function markScheduleNoShow(schedule) {
    const member = getScheduleMember(schedule);
    if (!member) return alert("연결된 회원 정보를 찾을 수 없습니다.");

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
  }

  const filteredMembers = members
    .filter((member) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;

      return (
        member.name?.toLowerCase().includes(q) ||
        member.phone?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
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
      const contactedToday = m.last_contacted_at && isToday(m.last_contacted_at);
      return (d === null || d >= 14) && !contactedToday;
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
      height: height ? Number(height) : null,
      goal: goal.trim(),
      note: note.trim(),
      memo: memo.trim(),
      pt_remaining: 0,
    });

    setName("");
    setPhone("");
    setAge("");
    setHeight("");
    setGoal("");
    setNote("");
    setMemo("");
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
    setEditGoal(member.goal || "");
    setEditNote(member.note || "");
    setEditMemo(member.memo || "");
  }

  function closeEditModal() {
    setEditModalMember(null);
    setEditingId(null);
    setEditName("");
    setEditPhone("");
    setEditAge("");
    setEditHeight("");
    setEditGoal("");
    setEditNote("");
    setEditMemo("");
  }

  async function saveEdit(id) {
    if (!editName.trim()) return alert("이름을 입력하세요.");

    await supabase
      .from("members")
      .update({
        name: editName.trim(),
        phone: editPhone.trim(),
        age: editAge ? Number(editAge) : null,
        height: editHeight ? Number(editHeight) : null,
        goal: editGoal.trim(),
        note: editNote.trim(),
        memo: editMemo.trim(),
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
        goal: editGoal.trim(),
        note: editNote.trim(),
        memo: editMemo.trim(),
      });
    }

    closeEditModal();
    loadMembers();
  }

  async function deleteMember(member) {
    if (!confirm(`${member.name} 회원을 삭제할까요?`)) return;

    await supabase.from("members").delete().eq("id", member.id);

    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
      setDetailMode(null);
    }

    loadMembers();
  }

  async function minusPt(member) {
    if (member.pt_remaining <= 0) return alert("남은 PT가 없습니다.");

    const before = member.pt_remaining;
    const after = before - 1;

    const { error } = await supabase
      .from("members")
      .update({ pt_remaining: after })
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
  }

  function closePtModal() {
    setPtModalMember(null);
    setSelectedPtAmount("");
    setPtTotalPrice("");
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

    const { error } = await supabase
      .from("members")
      .update({ pt_remaining: after })
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
  }

  async function submitPtAdd() {
    if (!ptModalMember) return;

    const amount = Number(selectedPtAmount);
    const totalPrice = Number(onlyNumber(ptTotalPrice));

    if (!amount) {
      alert("추가할 PT 회차를 선택하세요.");
      return;
    }

    if (!totalPrice) {
      alert("결제금액을 입력하세요.");
      return;
    }

    await addPt(ptModalMember, amount, ptTotalPrice);
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

  async function markContacted(member) {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("members")
      .update({ last_contacted_at: now })
      .eq("id", member.id);

    if (error) {
      alert("연락 완료 저장 실패: " + error.message);
      return;
    }

    alert(`${member.name} 연락 완료 처리되었습니다.`);
    loadMembers();
  }

  function normalizePhone(phone) {
    return String(phone || "").replace(/[^0-9+]/g, "");
  }

  async function openDetail(member, mode = "menu") {
    setSelectedMember(member);
    setDetailMode(mode);
    setShowAllPtModal(false);
    setShowAllAttendanceModal(false);

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

  function closeDetail() {
    setSelectedMember(null);
    setDetailMode(null);
    setShowAllPtModal(false);
    setShowAllAttendanceModal(false);
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

  async function openWorkout(member) {
    setWorkoutMember(member);
    setWorkoutMode("list");
    setWorkoutMemo("");
    setWorkoutExercises([{ name: "", sets: [{ weight: "", reps: "" }] }]);
    setShowAllWorkoutModal(false);
    clearWorkoutEdit();

    await loadWorkoutSessions(member.id);
  }

  function closeWorkout() {
    setWorkoutMember(null);
    setWorkoutSessions([]);
    setWorkoutMode("list");
    setWorkoutMemo("");
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
        memo: workoutMemo.trim(),
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
    setWorkoutExercises([{ name: "", sets: [{ weight: "", reps: "" }] }]);
    setWorkoutMode("list");

    await loadWorkoutSessions(workoutMember.id);
    alert(`${workoutMember.name} 운동기록이 저장되었습니다.`);
  }

  function getVisibleWorkouts() {
    return workoutSessions.filter((session) => isToday(session.workout_date));
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

          <button onClick={() => markContacted(member)} style={styles.summaryContactButton}>
            완료
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

          {session.memo && <p style={styles.summaryMemberInfo}>메모: {session.memo}</p>}
        </div>
      </div>
    );
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

      {incompleteSchedules.length > 0 && (
        <section style={styles.incompleteBox}>
          <div style={styles.incompleteTop}>
            <div>
              <h2 style={styles.incompleteTitle}>처리 안된 수업</h2>
              <p style={styles.incompleteDesc}>
                출석 또는 PT 차감이 아직 완료되지 않은 오늘 스케줄입니다.
              </p>
            </div>

            <div style={styles.incompleteCount}>{incompleteSchedules.length}건</div>
          </div>

          <div style={styles.incompleteList}>
            {incompleteSchedules.map((schedule) => {
              const member = getScheduleMember(schedule);
              const attended = !!schedule.attendance_checked;
              const ptUsed = !!schedule.pt_used;

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
                      </div>
                    </div>
                  </div>

                  <div style={styles.incompleteButtonGroup}>
                    <button
                      onClick={() => openActionModal(schedule)}
                      style={styles.incompleteCompleteButton}
                    >
                      처리하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section style={styles.scheduleBox}>
        <div style={styles.scheduleTop}>
          <div>
            <h2 style={styles.scheduleTitle}>오늘 스케줄</h2>
            <p style={styles.scheduleDateText}>{formatDate(getTodayDateString())}</p>
          </div>

          <button onClick={openScheduleModal} style={styles.scheduleAddButton}>
            + 스케줄 추가
          </button>
        </div>

        {schedules.length === 0 ? (
          <p style={styles.muted}>오늘 등록된 스케줄이 없습니다.</p>
        ) : (
          <div style={styles.scheduleList}>
            {schedules.map((schedule) => {
              const member = getScheduleMember(schedule);
              const attended = !!schedule.attendance_checked;
              const ptUsed = !!schedule.pt_used;
              const isNoShow = schedule.status === "noshow";
              const isCancelled = schedule.status === "cancelled";
              const isCompleted = schedule.status === "completed" || (attended && ptUsed);

              return (
                <div
                  key={schedule.id}
                  style={{
                    ...styles.scheduleItem,
                    ...(isNoShow ? styles.scheduleItemNoShow : {}),
                    ...(isCancelled ? styles.scheduleItemCancelled : {}),
                  }}
                >
                  <div onClick={() => openScheduleMember(schedule)} style={styles.scheduleMain}>
                    <div style={styles.scheduleTime}>{formatTime(schedule.start_time)}</div>
                    <div>
                      <strong style={styles.scheduleMemberName}>
                        {getScheduleTypeText(schedule.type)} · {member?.name || "회원 정보 없음"}
                        {member ? ` (${member.pt_remaining || 0}회)` : ""}
                      </strong>
                      <p style={styles.scheduleMemo}>
                        {schedule.memo ? schedule.memo : "메모 없음"}
                      </p>

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

                  <div style={styles.scheduleActionRow}>
                    {isNoShow || isCancelled || isCompleted ? (
                      <button style={styles.scheduleDisabledButton} disabled>
                        {isCancelled ? "취소됨" : isNoShow ? "노쇼" : "완료됨"}
                      </button>
                    ) : (
                      <button
                        onClick={() => openActionModal(schedule)}
                        style={styles.scheduleCompleteButton}
                      >
                        처리하기
                      </button>
                    )}

                    <button onClick={() => deleteSchedule(schedule)} style={styles.scheduleDeleteButton}>
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      {showScheduleModal && (
        <div style={styles.modalOverlay}>
          <section style={styles.modalBox}>
            <div style={styles.detailTop}>
              <h2 style={styles.modalTitle}>스케줄 추가</h2>
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
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · PT {member.pt_remaining || 0}회
                </option>
              ))}
            </select>

            <label style={styles.label}>날짜</label>
            <input
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              type="date"
              style={styles.input}
            />

            <label style={styles.label}>시작 시간</label>
            <input
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              type="time"
              style={styles.input}
            />

            <label style={styles.label}>종료 시간</label>
            <input
              value={scheduleEndTime}
              onChange={(e) => setScheduleEndTime(e.target.value)}
              type="time"
              style={styles.input}
            />

            <label style={styles.label}>구분</label>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              style={styles.input}
            >
              <option value="pt">PT</option>
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
                저장
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
        <div style={styles.whiteModalOverlay}>
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
                      closeDetail();
                      openWorkout(selectedMember);
                    }}
                    style={styles.menuButton}
                  >
                    운동 기록
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
          <section style={styles.modalBox}>
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
                  <button onClick={() => setWorkoutMode("add")} style={styles.menuButton}>
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

            {workoutMode === "add" && (
              <>
                <h3 style={styles.subTitle}>오늘 운동 입력</h3>

                {workoutExercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} style={styles.infoBlock}>
                    <div style={styles.recordHeader}>
                      <h3 style={{ ...styles.subTitle, marginTop: 0, marginBottom: 0 }}>
                        {exerciseIndex + 1}번 운동
                      </h3>

                      {workoutExercises.length > 1 && (
                        <button
                          onClick={() => removeExercise(exerciseIndex)}
                          style={styles.smallDanger}
                        >
                          운동 삭제
                        </button>
                      )}
                    </div>

                    <label style={styles.label}>운동명</label>
                    <input
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                      placeholder="예: 랫풀다운"
                      style={styles.input}
                    />

                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} style={styles.setRow}>
                        <div style={styles.setNumber}>{setIndex + 1}세트</div>

                        <input
                          value={set.weight}
                          onChange={(e) =>
                            updateSetValue(exerciseIndex, setIndex, "weight", e.target.value)
                          }
                          placeholder="중량"
                          type="number"
                          style={{ ...styles.input, marginBottom: 0 }}
                        />

                        <input
                          value={set.reps}
                          onChange={(e) =>
                            updateSetValue(exerciseIndex, setIndex, "reps", e.target.value)
                          }
                          placeholder="횟수"
                          type="number"
                          style={{ ...styles.input, marginBottom: 0 }}
                        />

                        {exercise.sets.length > 1 && (
                          <button
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            style={styles.smallDanger}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ))}

                    <button onClick={() => addSet(exerciseIndex)} style={styles.smallDark}>
                      + 세트 추가
                    </button>
                  </div>
                ))}

                <button onClick={addExercise} style={styles.menuButton}>
                  + 운동 추가
                </button>

                <label style={styles.label}>메모</label>
                <textarea
                  value={workoutMemo}
                  onChange={(e) => setWorkoutMemo(e.target.value)}
                  placeholder="컨디션, 자세 피드백, 다음 운동 참고사항"
                  style={styles.textarea}
                />

                <div style={styles.editActions}>
                  <button onClick={saveWorkout} style={styles.primaryButton}>저장</button>
                  <button onClick={() => setWorkoutMode("list")} style={styles.cancelButton}>
                    취소
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {showAllWorkoutModal && workoutMember && (
        <div style={styles.whiteModalOverlay}>
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

                    {session.memo && <p style={styles.whiteMemo}>메모: {session.memo}</p>}
                  </div>
                );
              })
            )}
          </section>
        </div>
      )}

      {ptModalMember && (
        <div style={styles.whiteModalOverlay}>
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

            <div style={styles.whiteActionRowFull}>
              <button
                type="button"
                onClick={() => submitPtAdd()}
                style={styles.whiteSaveLargeButton}
              >
                저장
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
            <button onClick={() => setSearch("")} style={styles.resetButton}>
              초기화
            </button>
          )}
        </div>

        {isSearching && <p style={styles.searchInfo}>“{search}” 검색 중</p>}
      </section>

      <section>
        <h2 style={styles.sectionTitle}>회원 목록</h2>

        {filteredMembers.length === 0 ? (
          <p style={styles.muted}>
            {isSearching ? "검색 결과가 없습니다." : "회원이 없습니다."}
          </p>
        ) : (
          <div style={styles.membersGrid}>
            {filteredMembers.map((member) => {
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
                  <div onClick={() => openDetail(member, "menu")} style={styles.memberMain}>
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPtModal(member);
                        }}
                        style={styles.cardPtAddButton}
                      >
                        + 이용권
                      </button>
                    </div>

                    <p style={styles.phoneSmall}>
                      {member.age ? `${member.age}세 · ` : ""}
                      {member.height ? `${member.height}cm · ` : ""}
                      {member.phone || "전화번호 없음"}
                    </p>

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
            })}
          </div>
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
    padding: 20,
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
    fontSize: 26,
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
    gap: 10,
  },
  incompleteItem: {
    background: "#241f17",
    border: "1px solid #4a3a1f",
    borderRadius: 18,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  incompleteMain: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  incompleteCompleteButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  incompleteButtonGroup: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
    minWidth: 92,
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
    borderRadius: 28,
    padding: 24,
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  memberNameSmall: {
    fontSize: 24,
    margin: 0,
    marginBottom: 8,
    fontWeight: 900,
  },
  ptCountSmall: {
    fontSize: 24,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  phoneSmall: {
    color: "#b3b3b3",
    fontSize: 16,
    margin: 0,
    marginBottom: 8,
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
  cardPtAddButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 900,
    marginBottom: 10,
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
    fontSize: 24,
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
  whiteModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5000,
    padding: 20,
  },
  whiteModalBox: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "84vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
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
};
