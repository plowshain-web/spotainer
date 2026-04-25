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
  const [lastAction, setLastAction] = useState(null);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    loadMembers();
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

  function daysSince(date) {
    if (!date) return null;
    return Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
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

  function isTodayOrYesterday(date) {
    if (!date) return false;

    const target = new Date(date);
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );

    return target >= yesterdayStart && target <= now;
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
      return d === null || d >= 14;
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
    setEditingId(member.id);
    setEditName(member.name);
    setEditPhone(member.phone || "");
    setEditAge(member.age || "");
    setEditHeight(member.height || "");
    setEditGoal(member.goal || "");
    setEditNote(member.note || "");
    setEditMemo(member.memo || "");
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

    const { error } = await supabase
      .from("members")
      .update({ pt_remaining: before - 1 })
      .eq("id", member.id);

    if (error) return alert("PT 차감 실패: " + error.message);

    await supabase.from("pt_logs").insert({
      member_id: member.id,
      type: "use",
      amount: 1,
    });

    setLastAction({
      type: "pt",
      memberId: member.id,
      previousPt: before,
      memberName: member.name,
    });

    loadMembers();
  }

  async function addPt(member, amount) {
    const { error } = await supabase
      .from("members")
      .update({ pt_remaining: member.pt_remaining + amount })
      .eq("id", member.id);

    if (error) return alert("이용권 추가 실패: " + error.message);

    await supabase.from("pt_logs").insert({
      member_id: member.id,
      type: "add",
      amount,
    });

    setPtModalMember(null);
    loadMembers();
  }

  async function cancelPtUse(log) {
    if (!confirm("이 PT 차감 기록을 취소할까요?")) return;

    const { data: member } = await supabase
      .from("members")
      .select("pt_remaining")
      .eq("id", log.member_id)
      .single();

    await supabase
      .from("members")
      .update({ pt_remaining: (member?.pt_remaining || 0) + log.amount })
      .eq("id", log.member_id);

    await supabase
      .from("pt_logs")
      .update({
        is_cancelled: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", log.id);

    if (selectedMember) await openDetail(selectedMember, "pt");
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

  async function checkAttendance(member) {
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

    loadMembers();
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
            {member.latest_visit
              ? `${formatDate(member.latest_visit)} (${d}일 전)`
              : "없음"}
          </p>
          <p style={styles.summaryMemberInfo}>{member.phone || "전화번호 없음"}</p>
        </div>

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
      </section>

      <section>
        <h2 style={styles.sectionTitle}>회원 목록</h2>

        {filteredMembers.map((member) => {
          const ptStatus = getPtStatus(member);
          const visitStatus = getVisitStatus(member);

          return (
            <article key={member.id} style={styles.card}>
              <div onClick={() => openDetail(member, "menu")} style={styles.memberMain}>
                <h3 style={styles.memberName}>{member.name}</h3>

                <p style={styles.phone}>
                  {member.age ? `${member.age}세 · ` : ""}
                  {member.height ? `${member.height}cm · ` : ""}
                  {member.phone || "전화번호 없음"}
                </p>

                <p style={styles.visit}>
                  최근 출석: {formatDate(member.latest_visit)}
                </p>

                <p style={styles.visit}>
                  최근 PT: {formatDate(member.latest_pt)}
                </p>

                <div style={styles.warningRow}>
                  {ptStatus && <span style={ptStatus.style}>{ptStatus.text}</span>}
                  {visitStatus && <span style={visitStatus.style}>{visitStatus.text}</span>}
                </div>
              </div>

              <div style={styles.memberSide}>
                <div style={styles.ptCount}>
                  PT {member.pt_remaining}회
                </div>

                <div style={styles.buttonGrid}>
                  <button onClick={() => minusPt(member)} style={styles.redButton}>
                    1회 차감
                  </button>

                  <button onClick={() => setPtModalMember(member)} style={styles.whiteButton}>
                    이용권 추가
                  </button>

                  <button onClick={() => checkAttendance(member)} style={styles.blueButton}>
                    출석 체크
                  </button>

                  <button onClick={() => openWorkout(member)} style={styles.greenButton}>
                    운동 기록
                  </button>

                  <button onClick={() => startEdit(member)} style={styles.darkButton}>
                    수정
                  </button>

                  <button onClick={() => deleteMember(member)} style={styles.deleteButton}>
                    삭제
                  </button>
                </div>
              </div>
            </article>
          );
        })}
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 900,
  },
  subtitle: {
    color: "#aaa",
  },
  adminBadge: {
    background: "#222",
    padding: 10,
    borderRadius: 10,
  },
  summaryBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    marginBottom: 20,
  },
  summaryCard: {
    padding: 10,
    textAlign: "center",
  },
  addMemberButton: {
    width: "100%",
    padding: 15,
    fontSize: 18,
  },
  searchBox: {
    marginBottom: 20,
  },
  searchRow: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  resetButton: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 10,
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 15,
    background: "#222",
  },
  memberMain: {
    flex: 1,
  },
  memberName: {
    fontSize: 24,
  },
  phone: {
    color: "#aaa",
  },
  visit: {
    color: "#60a5fa",
  },
  warningRow: {
    display: "flex",
    gap: 5,
  },
  ptCount: {
    fontSize: 24,
    fontWeight: 900,
  },
  buttonGrid: {
    display: "grid",
    gap: 5,
  },
  redButton: {
    background: "red",
    color: "#fff",
  },
  whiteButton: {
    background: "#fff",
    color: "#000",
  },
  blueButton: {
    background: "blue",
    color: "#fff",
  },
  greenButton: {
    background: "green",
    color: "#fff",
  },
  darkButton: {
    background: "#333",
    color: "#fff",
  },
  deleteButton: {
    background: "#900",
    color: "#fff",
  },
};
