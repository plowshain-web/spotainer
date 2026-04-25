"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [members, setMembers] = useState([]);

  // 운동 관련
  const [workoutMember, setWorkoutMember] = useState(null);
  const [workoutMode, setWorkoutMode] = useState("list");
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [workoutSessions, setWorkoutSessions] = useState([]);
  const [showAllWorkoutModal, setShowAllWorkoutModal] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const { data } = await supabase.from("members").select("*");
    setMembers(data || []);
  }

  // =========================
  // 운동 추가
  // =========================
  function addExercise() {
    setWorkoutExercises((prev) => [
      ...prev,
      { name: "", sets: [{ weight: "", reps: "" }] },
    ]);
  }

  function addSet(i) {
    const copy = [...workoutExercises];
    copy[i].sets.push({ weight: "", reps: "" });
    setWorkoutExercises(copy);
  }

  function updateExerciseName(i, value) {
    const copy = [...workoutExercises];
    copy[i].name = value;
    setWorkoutExercises(copy);
  }

  function updateSet(i, j, key, value) {
    const copy = [...workoutExercises];
    copy[i].sets[j][key] = value;
    setWorkoutExercises(copy);
  }

  // =========================
  // 저장
  // =========================
  async function saveWorkout() {
    if (!workoutMember) return;

    const { data: session } = await supabase
      .from("workout_sessions")
      .insert({ member_id: workoutMember.id })
      .select()
      .single();

    for (let i = 0; i < workoutExercises.length; i++) {
      const ex = workoutExercises[i];

      for (let j = 0; j < ex.sets.length; j++) {
        const s = ex.sets[j];

        await supabase.from("workout_sets").insert({
          session_id: session.id,
          exercise_name: ex.name,
          exercise_order: i,
          set_number: j + 1,
          weight: s.weight ? Number(s.weight) : null,
          reps: s.reps ? Number(s.reps) : null,
        });
      }
    }

    alert("운동 저장 완료 👍");

    setWorkoutExercises([]);
    setWorkoutMode("list");
    loadWorkoutSessions(workoutMember.id);
  }

  async function loadWorkoutSessions(id) {
    const { data } = await supabase
      .from("workout_sessions")
      .select("*, workout_sets(*)")
      .eq("member_id", id)
      .order("created_at", { ascending: false });

    setWorkoutSessions(data || []);
  }

  async function openWorkout(member) {
    setWorkoutMember(member);
    setWorkoutMode("list");
    setWorkoutExercises([]);
    await loadWorkoutSessions(member.id);
  }

  function closeWorkout() {
    setWorkoutMember(null);
  }

  // =========================
  // UI
  // =========================
  return (
    <main style={{ padding: 20, color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h1>회원 목록</h1>

      {members.map((m) => (
        <div key={m.id} style={{ marginBottom: 20 }}>
          <strong>{m.name}</strong>
          <button onClick={() => openWorkout(m)}>운동 기록</button>
        </div>
      ))}

      {/* 운동 모달 */}
      {workoutMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#181818", padding: 20 }}>
            <h2>{workoutMember.name} 운동기록</h2>

            {workoutMode === "list" && (
              <>
                <button onClick={() => setWorkoutMode("add")}>
                  + 오늘 운동 기록하기
                </button>

                <button onClick={() => setShowAllWorkoutModal(true)}>
                  전체 운동기록 보기
                </button>

                {workoutSessions.map((s) => (
                  <div key={s.id}>
                    {s.workout_sets.map((set) => (
                      <p key={set.id}>
                        {set.exercise_name} / {set.weight}kg / {set.reps}회
                      </p>
                    ))}
                  </div>
                ))}
              </>
            )}

            {workoutMode === "add" && (
              <>
                {workoutExercises.map((ex, i) => (
                  <div key={i}>
                    <input
                      placeholder="운동명"
                      value={ex.name}
                      onChange={(e) => updateExerciseName(i, e.target.value)}
                    />

                    {ex.sets.map((s, j) => (
                      <div key={j}>
                        <input
                          placeholder="kg"
                          value={s.weight}
                          onChange={(e) =>
                            updateSet(i, j, "weight", e.target.value)
                          }
                        />
                        <input
                          placeholder="횟수"
                          value={s.reps}
                          onChange={(e) =>
                            updateSet(i, j, "reps", e.target.value)
                          }
                        />
                      </div>
                    ))}

                    <button onClick={() => addSet(i)}>+ 세트</button>
                  </div>
                ))}

                <button onClick={addExercise}>+ 운동 추가</button>

                <button onClick={saveWorkout}>저장</button>
              </>
            )}

            <button onClick={closeWorkout}>닫기</button>
          </div>
        </div>
      )}

      {/* 흰색 팝업 */}
      {showAllWorkoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "#fff", color: "#000" }}>
          <h2>전체 운동기록</h2>

          {workoutSessions.map((s) => (
            <div key={s.id}>
              {s.workout_sets.map((set) => (
                <p key={set.id}>
                  {set.exercise_name} / {set.weight}kg / {set.reps}회
                </p>
              ))}
            </div>
          ))}

          <button onClick={() => setShowAllWorkoutModal(false)}>닫기</button>
        </div>
      )}
    </main>
  );
}
