"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const commonExercises = [
  "랫풀다운",
  "레그프레스",
  "스쿼트",
  "벤치프레스",
  "데드리프트",
  "힙쓰러스트",
  "숄더프레스",
  "시티드로우",
  "런지",
  "플랭크",
];

const SCHEDULE_BODY_PART_OPTIONS = ["가슴", "어깨", "등", "하체", "팔", "코어", "전신", "유산소"];


/*
====================================================
[ 트레이너 일지 입력 구조 변경 ]
====================================================

최종 입력 구조:
- 오늘운동: 운동 기록에서 선택한 부위/운동 종류 사용
- 컨디션: 좋음 / 보통 / 나쁨
- 체크사항: 집중력 좋음, 좌우 차이 적음, 좌우 흔들림 등
- 총평: 폼 좋음, 폼 무너짐, 컨디션 좋음 등
- 다음운동: 어깨, 하체, 스트레칭 먼저 어깨 등

목표:
트레이너는 짧게 기록하고,
앱은 회원이 거부감 느끼지 않는 자연스러운 현장 톤 피드백으로 변환합니다.
====================================================
*/

function FullScreenModal({ children, onClose }) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white overflow-hidden"
      style={{
        touchAction: "none",
      }}
    >
      <div
        className="h-full overflow-y-auto overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/*
====================================================
[ Spotainer 공통 FullScreenModal 적용 기준 ]
====================================================

적용 대상:
- 상담기록
- 운동기록
- 회원상세
- 스케줄확인
- 오늘할일
- 매출관리
- 개인기록

사용 예시:

{showModal && (
  <FullScreenModal onClose={() => setShowModal(false)}>
    내용
  </FullScreenModal>
)}

핵심 목적:
- Android 태블릿 / PWA 환경 안정화
- 입력창 클릭 시 화면 밀림 방지
- 배경 스크롤 완전 잠금
- 팝업 내부만 스크롤 허용
- 기존 UI 디자인 최대 유지

====================================================
*/



const exerciseCatalog = [
  { name: "스미스 스쿼트", bodyPart: "하체", type: "weight" },
  { name: "바벨 스쿼트", bodyPart: "하체", type: "weight" },
  { name: "덤벨 스쿼트", bodyPart: "하체", type: "weight" },
  { name: "불가리안 스플릿 스쿼트", bodyPart: "하체", type: "weight" },
  { name: "런지", bodyPart: "하체", type: "weight" },
  { name: "워킹 런지", bodyPart: "하체", type: "weight" },
  { name: "레그 프레스", bodyPart: "하체", type: "weight" },
  { name: "레그 익스텐션", bodyPart: "하체", type: "weight" },
  { name: "레그 컬", bodyPart: "하체", type: "weight" },
  { name: "힙 어브덕션", bodyPart: "하체", type: "weight" },
  { name: "힙 어덕션", bodyPart: "하체", type: "weight" },
  { name: "힙 쓰러스트", bodyPart: "하체", type: "weight" },
  { name: "글루트 브리지", bodyPart: "하체", type: "weight" },
  { name: "케이블 킥백", bodyPart: "하체", type: "weight" },
  { name: "스텝업", bodyPart: "하체", type: "weight" },
  { name: "V스쿼트", bodyPart: "하체", type: "weight" },
  { name: "핵스쿼트", bodyPart: "하체", type: "weight" },

  { name: "랫풀다운", bodyPart: "등", type: "weight" },
  { name: "시티드 로우", bodyPart: "등", type: "weight" },
  { name: "바벨 로우", bodyPart: "등", type: "weight" },
  { name: "덤벨 로우", bodyPart: "등", type: "weight" },
  { name: "케이블 로우", bodyPart: "등", type: "weight" },
  { name: "풀업", bodyPart: "등", type: "weight" },
  { name: "페이스풀", bodyPart: "등", type: "weight" },
  { name: "리버스 플라이(등)", bodyPart: "등", type: "weight" },
  { name: "롱 풀", bodyPart: "등", type: "weight" },
  { name: "어시스트 풀업", bodyPart: "등", type: "weight" },
  { name: "백익스텐션", bodyPart: "등", type: "weight" },

  { name: "체스트 프레스", bodyPart: "가슴", type: "weight" },
  { name: "인클라인 프레스", bodyPart: "가슴", type: "weight" },
  { name: "딥클라인 프레스", bodyPart: "가슴", type: "weight" },
  { name: "덤벨 벤치프레스", bodyPart: "가슴", type: "weight" },
  { name: "푸쉬업", bodyPart: "가슴", type: "weight" },
  { name: "펙덱 플라이", bodyPart: "가슴", type: "weight" },
  { name: "케이블 플라이", bodyPart: "가슴", type: "weight" },
  { name: "딥스", bodyPart: "가슴", type: "weight" },

  { name: "덤벨 숄더프레스", bodyPart: "어깨", type: "weight" },
  { name: "머신 숄더프레스", bodyPart: "어깨", type: "weight" },
  { name: "사이드 레터럴 레이즈", bodyPart: "어깨", type: "weight" },
  { name: "프론트 레이즈", bodyPart: "어깨", type: "weight" },
  { name: "리어 델트 레이즈", bodyPart: "어깨", type: "weight" },
  { name: "업라이트 로우", bodyPart: "어깨", type: "weight" },
  { name: "리버스 플라이(어깨)", bodyPart: "어깨", type: "weight" },

  { name: "플랭크", bodyPart: "복부", type: "weight" },
  { name: "사이드 플랭크", bodyPart: "복부", type: "weight" },
  { name: "크런치", bodyPart: "복부", type: "weight" },
  { name: "레그레이즈", bodyPart: "복부", type: "weight" },
  { name: "데드버그", bodyPart: "복부", type: "weight" },
  { name: "버드독", bodyPart: "복부", type: "weight" },
  { name: "러시안 트위스트", bodyPart: "복부", type: "weight" },
  { name: "케이블 크런치", bodyPart: "복부", type: "weight" },

  { name: "점핑잭", bodyPart: "전신", type: "circuit" },
  { name: "케틀벨 스윙", bodyPart: "전신", type: "circuit" },
  { name: "덤벨 런지 프레스", bodyPart: "전신", type: "circuit" },
  { name: "스쿼트", bodyPart: "전신", type: "circuit" },
  { name: "하이 니 크런치", bodyPart: "전신", type: "circuit" },
  { name: "스탠딩 사이드 크런치", bodyPart: "전신", type: "circuit" },
  { name: "스탠딩 트위스트 크런치", bodyPart: "전신", type: "circuit" },
  { name: "스텝업 니업", bodyPart: "전신", type: "circuit" },
  { name: "스텝업 니 드라이브 킥", bodyPart: "전신", type: "circuit" },
  { name: "스텝업 니킥", bodyPart: "전신", type: "circuit" },
  { name: "스텝업 덤벨 터치", bodyPart: "전신", type: "circuit" },
  { name: "점핑 런지", bodyPart: "전신", type: "circuit" },
  { name: "업다운", bodyPart: "전신", type: "circuit" },
  { name: "크로스 업다운", bodyPart: "전신", type: "circuit" },
];

const exerciseList = exerciseCatalog.map((exercise) => exercise.name);

const CIRCUIT_FIXED_SET_COUNT = 3;
const WEIGHT_DEFAULT_SET_COUNT = 4;

const circuitPrograms = [
  {
    name: "서킷 1단계",
    memo: "전신 서킷 1단계 · 3세트 고정 · 케틀벨/덤벨 중량은 현장에서 입력",
    exercises: [
      { name: "점핑잭", weight: "", reps: "20" },
      { name: "케틀벨 스윙", weight: "", reps: "20" },
      { name: "덤벨 런지 프레스", weight: "", reps: "20" },
      { name: "스쿼트", weight: "", reps: "20" },
    ],
  },
  {
    name: "서킷 2단계",
    memo: "전신 서킷 2단계 · 3세트 고정",
    exercises: [
      { name: "하이 니 크런치", weight: "", reps: "20" },
      { name: "스탠딩 사이드 크런치", weight: "", reps: "20" },
      { name: "스탠딩 트위스트 크런치", weight: "", reps: "20" },
    ],
  },
  {
    name: "서킷 3단계",
    memo: "전신 서킷 3단계 · 3세트 고정 · 스텝업 니업/니킥은 좌우 각각 15회",
    exercises: [
      { name: "스텝업 니업", weight: "", reps: "15" },
      { name: "스텝업 니킥", weight: "", reps: "15" },
      { name: "스텝업 덤벨 터치", weight: "", reps: "20" },
      { name: "점핑 런지", weight: "", reps: "15" },
    ],
  },
  {
    name: "서킷 4단계",
    memo: "전신 서킷 4단계 · 3세트 고정",
    exercises: [
      { name: "스텝업", weight: "", reps: "20" },
      { name: "업다운", weight: "", reps: "20" },
      { name: "크로스 업다운", weight: "", reps: "20" },
    ],
  },
];

const SPOTAINER_PATCH_VERSION = "2026-05-25-v11-pwa-tablet-install-rescue";
const ptOptions = [1, 10, 12, 24, 36, 48, 60, 72];

const memberStageOptions = [
  { value: "ot", label: "OT회원" },
  { value: "pt", label: "PT회원" },
  { value: "inactive", label: "비활성" },
];

const conditionLevelOptions = ["좋음", "보통", "안좋음"];
const sleepStatusOptions = ["충분", "보통", "부족", "매우부족"];
const painAreaOptions = ["없음", "목/승모", "어깨", "허리", "무릎", "손목", "골반/고관절", "기타"];
const muscleSorenessOptions = ["없음", "약간", "심함"];
const workoutBurdenOptions = ["괜찮음", "조금 부담", "많이 부담"];


const weightBodyPartOptions = ["가슴", "어깨", "등", "하체", "팔", "복부"];
const workoutPatternOptions = [...weightBodyPartOptions, "전신"];

function createExerciseSets(count, weight = "", reps = "") {
  return Array.from({ length: count }, () => ({ weight, reps }));
}

function createEmptyWorkoutExercise(trainingType = "weight") {
  const defaultSetCount = trainingType === "circuit" ? CIRCUIT_FIXED_SET_COUNT : WEIGHT_DEFAULT_SET_COUNT;

  return {
    name: "",
    sets: createExerciseSets(defaultSetCount),
  };
}




function TodayScheduleSectionV2({
  schedules,
  smsMode,
  getCurrentSMSSchedule,
  smsIndex,
  smsQueue,
  getCurrentSMSTargetMember,
  formatScheduleRange,
  sendCurrentScheduleSMS,
  markCurrentSMSSentAndNext,
  skipCurrentSMS,
  stopTodaySMSQueue,
  startTodaySMSQueue,
  getScheduleMember,
  getLatestConditionForMember,
  getConditionPreviewText,
  renderScheduleQuickButtons,
  getSchedulePreferenceTags,
  getScheduleMemberPtText,
  lastWorkoutMap,
  getLastWorkoutSummary,
  lastAction,
  undo
}) {
  const formatTime=(time)=>{
    if(!time) return "--:--";
    return String(time).slice(0,5);
  };

  const normalizeWorkoutParts=(value)=>{
    if (Array.isArray(value)) {
      return value.map((item)=>String(item || "").trim()).filter(Boolean);
    }

    const raw=String(value || "").trim();
    if(!raw) return [];
    return raw
      .replace(/[+\/]/g,"·")
      .replace(/,/g,"·")
      .split("·")
      .map((item)=>item.trim())
      .filter(Boolean);
  };

  const formatWorkoutParts=(value)=>{
    const parts=normalizeWorkoutParts(value);
    if(parts.length===0) return "미정";
    if(parts.length<=2) return parts.join(" · ");
    return `${parts.slice(0,2).join(" · ")} 외 ${parts.length-2}`;
  };

  const currentSMSSchedule = smsMode && getCurrentSMSSchedule ? getCurrentSMSSchedule() : null;
  const currentSMSMember = smsMode && getCurrentSMSTargetMember ? getCurrentSMSTargetMember(currentSMSSchedule) : null;

  return (
    <section style={{
      border:"1px solid rgba(212,161,74,.7)",
      borderRadius:28,
      padding:16,
      background:"#050505",
      boxShadow:"0 0 30px rgba(212,161,74,.12)",
      flex:"0 0 auto",
      display:"flex",
      flexDirection:"column",
      overflow:"hidden"
    }}>
      <div style={{display:"grid",gridTemplateColumns:"minmax(220px,0.75fr) minmax(420px,1.5fr) auto",alignItems:"center",gap:12,marginBottom:12,flex:"0 0 auto"}}>
        <div>
          <h2 style={{fontSize:32,color:"#e0ae49",margin:0,lineHeight:1}}>오늘 스케줄</h2>
          <div style={{color:"#ddd",fontSize:14,marginTop:6}}>오늘 수업 흐름만 빠르게 확인하세요.</div>
        </div>

        <div style={{minWidth:0}}>
          {smsMode && currentSMSSchedule && currentSMSMember ? (
            <div style={{
              display:"grid",
              gridTemplateColumns:"minmax(0,1fr) auto auto auto auto",
              alignItems:"center",
              gap:8,
              padding:"9px 10px",
              borderRadius:16,
              border:"1px solid rgba(212,161,74,.55)",
              background:"rgba(212,161,74,.10)"
            }}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,color:"#e0ae49",fontWeight:1000}}>
                  문자 진행 {smsIndex + 1} / {smsQueue.length}
                </div>
                <div style={{fontSize:12,color:"#eee",fontWeight:900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:3}}>
                  {String(currentSMSSchedule.start_time || "").slice(0,5)} · {currentSMSMember.name || "회원"} · {formatScheduleRange ? formatScheduleRange(currentSMSSchedule) : ""}
                </div>
              </div>
              <button type="button" onClick={sendCurrentScheduleSMS} style={{border:"0",borderRadius:12,padding:"9px 12px",fontWeight:1000,background:"#fff",color:"#111",whiteSpace:"nowrap"}}>문자 보내기</button>
              <button type="button" onClick={markCurrentSMSSentAndNext} style={{border:"0",borderRadius:12,padding:"9px 12px",fontWeight:1000,background:"#1f3f36",color:"#fff",whiteSpace:"nowrap"}}>보낸 처리</button>
              <button type="button" onClick={skipCurrentSMS} style={{border:"1px solid rgba(255,255,255,.16)",borderRadius:12,padding:"9px 12px",fontWeight:1000,background:"#111",color:"#fff",whiteSpace:"nowrap"}}>건너뛰기</button>
              <button type="button" onClick={stopTodaySMSQueue} style={{border:"1px solid rgba(255,255,255,.16)",borderRadius:12,padding:"9px 12px",fontWeight:1000,background:"#111",color:"#fff",whiteSpace:"nowrap"}}>닫기</button>
            </div>
          ) : null}
        </div>

        <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end"}}>
          <button onClick={startTodaySMSQueue} style={{padding:"13px 20px",borderRadius:14,background:"#111",color:"#fff",border:"1px solid #d4a14a",fontWeight:900}}>오늘 문자 시작</button>
          <div style={{padding:"13px 18px",borderRadius:14,background:"#d4a14a",fontWeight:900,color:"#111"}}>{schedules.length}건</div>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8,overflowY:"auto",paddingRight:6,overscrollBehavior:"contain",WebkitOverflowScrolling:"touch",maxHeight:408,minHeight:0}}>
        {schedules.map((schedule)=>{
          const member=getScheduleMember(schedule)||{};
          const condition=getLatestConditionForMember(member);
          const scheduleBodyParts=normalizeWorkoutParts(schedule?.body_parts || schedule?.bodyParts || schedule?.workout_parts || schedule?.workoutParts);
          const lastWorkoutSummary = getLastWorkoutSummary && lastWorkoutMap ? getLastWorkoutSummary(lastWorkoutMap[schedule.id]) : null;
          const lastWorkoutBodyParts=normalizeWorkoutParts(lastWorkoutSummary?.bodyPartText || "");
          const fallbackBody=condition?.todayWorkout || condition?.nextWorkout || "";
          const body=scheduleBodyParts.length > 0 ? scheduleBodyParts : (lastWorkoutBodyParts.length > 0 ? lastWorkoutBodyParts : fallbackBody);
          const workoutText=formatWorkoutParts(body);
          const hasWorkoutParts=normalizeWorkoutParts(body).length > 0;
          const preview=getConditionPreviewText(condition);
          const tags=(getSchedulePreferenceTags ? getSchedulePreferenceTags(schedule) : []).slice(0,2);
          const ptText=getScheduleMemberPtText ? getScheduleMemberPtText(schedule) : `PT ${member.pt_remaining || member.remaining_pt || member.pt_count || 0}회`;
          const statusText=preview || condition?.condition_level || "보통";
          const issueText=condition?.memo || "없음";
          const isDone = schedule.status === "completed" || schedule.status === "noshow" || schedule.status === "cancelled";
          const scheduleStatusText =
            schedule.status === "completed"
              ? "완료"
              : schedule.status === "noshow"
                ? "노쇼"
                : schedule.status === "cancelled"
                  ? "취소"
                  : "";
          const showInlineDeductNotice = lastAction?.type === "pt" && lastAction?.scheduleId === schedule.id;
          const inlineDeductText = showInlineDeductNotice
            ? `${lastAction.memberName || member.name || "회원"} PT 1회 차감 완료`
            : "";

          return (
            <div key={schedule.id} style={{
              display:"grid",
              gridTemplateColumns:"76px 150px minmax(0,1fr) 240px",
              alignItems:"center",
              gap:12,
              padding:"8px 14px",
              borderRadius:16,
              border:isDone ? "1px solid rgba(212,161,74,.45)" : "1px solid rgba(255,255,255,.08)",
              background:isDone ? "rgba(212,161,74,.08)" : "rgba(255,255,255,.025)",
              opacity:schedule.status === "cancelled" ? .55 : 1,
              minHeight:72
            }}>
              <div style={{display:"flex",alignItems:"center"}}>
                <div style={{fontSize:21,color:"#e0ae49",fontWeight:1000,letterSpacing:-.5,lineHeight:1}}>{formatTime(schedule.start_time)}</div>
              </div>

              <div style={{minWidth:0}}>
                <div style={{fontSize:18,color:hasWorkoutParts ? "#f4f4f4" : "#aaa",fontWeight:1000,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.15}}>
                  {hasWorkoutParts ? workoutText : "운동 미정"}
                </div>
                {scheduleStatusText && (
                  <div style={{fontSize:11,color:isDone ? "#e0ae49" : "#aaa",fontWeight:900,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {scheduleStatusText}
                  </div>
                )}
              </div>

              <div style={{minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,whiteSpace:"nowrap",overflow:"hidden"}}>
                  <span style={{fontSize:20,fontWeight:1000,color:"#fff",lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis"}}>
                    {member.name || "회원"}
                  </span>
                  <span style={{fontSize:14,color:"#d8d8d8",fontWeight:900,flex:"0 0 auto"}}>{ptText}</span>
                  {tags.map((tag)=>(
                    <span key={tag} style={{fontSize:11,color:"#f2f2f2",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.08)",borderRadius:999,padding:"2px 7px",fontWeight:900,flex:"0 0 auto"}}>{tag}</span>
                  ))}
                </div>

                <div style={{fontSize:13,color:"#cfcfcf",marginTop:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  컨디션 : {statusText}
                  <span style={{color:"#777",margin:"0 8px"}}>|</span>
                  지난 이슈 : {issueText}
                </div>
                {showInlineDeductNotice && (
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,whiteSpace:"nowrap",overflow:"hidden"}}>
                    <span style={{fontSize:12,color:"#e0ae49",fontWeight:1000,overflow:"hidden",textOverflow:"ellipsis"}}>✓ {inlineDeductText}</span>
                    <button
                      type="button"
                      onClick={undo}
                      style={{border:"1px solid rgba(212,161,74,.55)",background:"rgba(212,161,74,.12)",color:"#f3d18a",borderRadius:999,padding:"4px 9px",fontSize:11,fontWeight:1000,flex:"0 0 auto"}}
                    >
                      실행 취소
                    </button>
                  </div>
                )}
              </div>

              <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",whiteSpace:"nowrap"}}>
                {renderScheduleQuickButtons(schedule,isDone)}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [summaryModal, setSummaryModal] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);


  const [memberActionMenuMember, setMemberActionMenuMember] = useState(null);
  const [showContactListModal, setShowContactListModal] = useState(false);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [centerInfoId, setCenterInfoId] = useState(null);
  const [centerName, setCenterName] = useState("");
  const [centerPhone, setCenterPhone] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerMemo, setCenterMemo] = useState("");

  const [showTrainerLogModal, setShowTrainerLogModal] = useState(false);
  const [showTrainerWorkoutHistoryModal, setShowTrainerWorkoutHistoryModal] = useState(false);
  const [trainerLogTab, setTrainerLogTab] = useState("workout");
  const [trainerInbodyList, setTrainerInbodyList] = useState([]);
  const [trainerWorkoutList, setTrainerWorkoutList] = useState([]);
  const [trainerInbodyDate, setTrainerInbodyDate] = useState(getTodayDateString());
  const [trainerWeight, setTrainerWeight] = useState("");
  const [trainerSkeletalMuscle, setTrainerSkeletalMuscle] = useState("");
  const [trainerBodyFatMass, setTrainerBodyFatMass] = useState("");
  const [trainerBodyFatPercent, setTrainerBodyFatPercent] = useState("");
  const [trainerInbodyMemo, setTrainerInbodyMemo] = useState("");
  const [trainerWorkoutDate, setTrainerWorkoutDate] = useState(getTodayDateString());
  const [trainerWorkoutType, setTrainerWorkoutType] = useState("weight");
  const [trainerWorkoutBodyParts, setTrainerWorkoutBodyParts] = useState([]);
  const [trainerExerciseSummary, setTrainerExerciseSummary] = useState("");
  const [trainerWorkoutExercises, setTrainerWorkoutExercises] = useState([
    createEmptyWorkoutExercise("weight"),
  ]);
  const [trainerCondition, setTrainerCondition] = useState("normal");
  const [trainerIssue, setTrainerIssue] = useState("");
  const [trainerNextPlan, setTrainerNextPlan] = useState("");
  const [trainerWorkoutMemo, setTrainerWorkoutMemo] = useState("");
  const [editingTrainerWorkoutLog, setEditingTrainerWorkoutLog] = useState(null);
  const [contactModalMember, setContactModalMember] = useState(null);
  const [contactResult, setContactResult] = useState("pending");
  const [contactNote, setContactNote] = useState("");
  const [conditionModalMember, setConditionModalMember] = useState(null);
  const [conditionLevel, setConditionLevel] = useState("보통");
  const [conditionSleepStatus, setConditionSleepStatus] = useState("보통");
  const [conditionPainArea, setConditionPainArea] = useState("없음");
  const [conditionMuscleSoreness, setConditionMuscleSoreness] = useState("없음");
  const [conditionWorkoutBurden, setConditionWorkoutBurden] = useState("괜찮음");
  const [conditionMemo, setConditionMemo] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [note, setNote] = useState("");
  const [memo, setMemo] = useState("");
  const [memberType, setMemberType] = useState("general");
  const [memberStage, setMemberStage] = useState("pt");

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
  const [editMemberStage, setEditMemberStage] = useState("pt");

  const [selectedMember, setSelectedMember] = useState(null);
  const [detailMode, setDetailMode] = useState(null);

  const [prefIntensity, setPrefIntensity] = useState([]);
const [prefManagementStyle, setPrefManagementStyle] = useState([]);
const [prefTouchStyle, setPrefTouchStyle] = useState([]);
const [prefCommunicationStyle, setPrefCommunicationStyle] = useState([]);
const [prefClassMood, setPrefClassMood] = useState([]);
  const [prefRequestNote, setPrefRequestNote] = useState("");

  const [otExperience, setOtExperience] = useState([]);
  const [otConcerns, setOtConcerns] = useState([]);
  const [otPainParts, setOtPainParts] = useState([]);
  const [otCondition, setOtCondition] = useState([]);
  const [otWorkoutStyle, setOtWorkoutStyle] = useState([]);
  const [otTouchStyle, setOtTouchStyle] = useState([]);
  const [otGoals, setOtGoals] = useState([]);
  const [otPtExpectations, setOtPtExpectations] = useState([]);
  const [otTrainerStyle, setOtTrainerStyle] = useState([]);

  const [publicOtCheckMemberId, setPublicOtCheckMemberId] = useState(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search || "");
    const queryMemberId = params.get("otCheck") || params.get("ot_check") || params.get("otCheckMemberId");
    return queryMemberId ? decodeURIComponent(queryMemberId) : null;
  });
  const [publicOtCheckMember, setPublicOtCheckMember] = useState(null);
  const [publicOtCheckLoading, setPublicOtCheckLoading] = useState(false);
  const [publicOtCheckSaving, setPublicOtCheckSaving] = useState(false);
  const [publicOtCheckSaved, setPublicOtCheckSaved] = useState(false);
  const [publicOtCheckError, setPublicOtCheckError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search || "");
    const queryMemberId = params.get("otCheck") || params.get("ot_check") || params.get("otCheckMemberId");

    if (!queryMemberId) {
      setPublicOtCheckMemberId(null);
      return;
    }

    setPublicOtCheckMemberId(decodeURIComponent(queryMemberId));
  }, []);

  useEffect(() => {
    if (!publicOtCheckMemberId) return;

    async function loadPublicOtCheckMember() {
      setPublicOtCheckLoading(true);
      setPublicOtCheckError("");

      const { data, error } = await supabase
        .from("members")
        .select("id,name,ot_experience,ot_concerns,ot_pain_parts,ot_condition,ot_workout_style,ot_touch_style,ot_goals,ot_pt_expectations,ot_trainer_style,ot_check_updated_at")
        .eq("id", publicOtCheckMemberId)
        .single();

      if (error) {
        setPublicOtCheckError("성향체크 정보를 불러오지 못했어요. 링크를 다시 확인해주세요.");
        setPublicOtCheckLoading(false);
        return;
      }

      setPublicOtCheckMember(data);
      fillOtCheckForm(data);
      setPublicOtCheckLoading(false);
    }

    loadPublicOtCheckMember();
  }, [publicOtCheckMemberId]);

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
  const [groupWorkoutQueue, setGroupWorkoutQueue] = useState([]);
  const [groupWorkoutIndex, setGroupWorkoutIndex] = useState(0);
  const groupWorkoutQueueRef = useRef([]);
  const groupWorkoutIndexRef = useRef(0);
  const workoutReturnSourceRef = useRef(null);
  const pendingAfterFeedbackRef = useRef(null);
  const [workoutSessions, setWorkoutSessions] = useState([]);
  const [detailWorkoutSessions, setDetailWorkoutSessions] = useState([]);
  const [lastWorkoutMap, setLastWorkoutMap] = useState({});
  const [latestConditionMap, setLatestConditionMap] = useState({});

  useEffect(() => {
    if (!Array.isArray(members) || members.length === 0) {
      setLatestConditionMap({});
      return;
    }

    loadLatestConditionChecksForMembers(members);
  }, [members.length]);
  const [workoutMode, setWorkoutMode] = useState("list");
  const [workoutTrainingType, setWorkoutTrainingType] = useState("weight");
  const [workoutBodyParts, setWorkoutBodyParts] = useState([]);
  const [workoutMemo, setWorkoutMemo] = useState("");
  const [workoutCondition, setWorkoutCondition] = useState("normal");
  const [workoutIssue, setWorkoutIssue] = useState("");
  const [workoutNextPlan, setWorkoutNextPlan] = useState("");
  const [workoutTrainerNote, setWorkoutTrainerNote] = useState("");
  const [feedbackModalMember, setFeedbackModalMember] = useState(null);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [feedbackCandidateSections, setFeedbackCandidateSections] = useState([]);
  const [selectedFeedbackCandidateMap, setSelectedFeedbackCandidateMap] = useState({});
  const [freeSmsModalMember, setFreeSmsModalMember] = useState(null);
  const [freeSmsDraft, setFreeSmsDraft] = useState("");
  const [completedTodayTodoKeys, setCompletedTodayTodoKeys] = useState({});
  const [activeTodayTodoKey, setActiveTodayTodoKey] = useState(null);
  const [showTodayTodoModal, setShowTodayTodoModal] = useState(false);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
const [workoutExercises, setWorkoutExercises] = useState([
    createEmptyWorkoutExercise("weight"),
  ]);
  const [showAllWorkoutModal, setShowAllWorkoutModal] = useState(false);
  const [expandedWorkoutSessionId, setExpandedWorkoutSessionId] = useState(null);

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
  const [scheduleThirdMemberId, setScheduleThirdMemberId] = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString());
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [scheduleType, setScheduleType] = useState("pt");
  const [scheduleMemo, setScheduleMemo] = useState("");
  const [scheduleBodyParts, setScheduleBodyParts] = useState([]);
  const [scheduleRepeatEnabled, setScheduleRepeatEnabled] = useState(false);
  const [scheduleRepeatCount, setScheduleRepeatCount] = useState(1);
  const [scheduleRepeatIntervalDays, setScheduleRepeatIntervalDays] = useState(7);
  const [scheduleRepeatItems, setScheduleRepeatItems] = useState([]);
  const [schedulePreviousWorkoutList, setSchedulePreviousWorkoutList] = useState([]);
  const [schedulePreviousWorkoutLoading, setSchedulePreviousWorkoutLoading] = useState(false);
  const [exitToast, setExitToast] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [scheduleActionMenuId, setScheduleActionMenuId] = useState(null);
  const [showScheduleMonthPicker, setShowScheduleMonthPicker] = useState(false);
  const [smsQueue, setSmsQueue] = useState([]);
  const [smsIndex, setSmsIndex] = useState(0);
  const [smsMode, setSmsMode] = useState(false);
  const [smsSentMap, setSmsSentMap] = useState({});
  const [smsSentLogList, setSmsSentLogList] = useState([]);
  const [isMobileEmergencyMode, setIsMobileEmergencyMode] = useState(false);
  const scheduleCalendarTouchStartXRef = useRef(null);
  const hasOpenModalRef = useRef(false);
  const modalBackGuardArmedRef = useRef(false);
  const modalScrollYRef = useRef(0);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    console.log("Spotainer patch version:", SPOTAINER_PATCH_VERSION);
    loadMembers();
    loadSchedules(getTodayDateString());
    loadScheduleSMSLogs(getTodayDateString());
    loadSales();
    loadCenterInfo();

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshScheduleScreens = async (changedDate = getTodayDateString()) => {
      const today = getTodayDateString();

      await loadSchedules(today);

      if (showScheduleModal) {
        await loadSelectedDateSchedules(scheduleDate);
      }

      if (showScheduleCheckModal || isMobileEmergencyMode) {
        const targetDate = scheduleCheckDate || changedDate || today;
        await loadScheduleCheckList(targetDate);
        await loadScheduleCheckMonthList(targetDate);
        await loadScheduleSMSLogs(targetDate);
      } else {
        await loadScheduleSMSLogs(today);
      }
    };

    const channel = supabase
      .channel("spotainer-live-schedule-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedules" },
        (payload) => {
          const changedDate =
            payload?.new?.schedule_date ||
            payload?.old?.schedule_date ||
            scheduleCheckDate ||
            getTodayDateString();

          refreshScheduleScreens(changedDate);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedule_sms_logs" },
        (payload) => {
          const changedDate =
            payload?.new?.sent_date ||
            payload?.old?.sent_date ||
            scheduleCheckDate ||
            getTodayDateString();

          if (showScheduleCheckModal || isMobileEmergencyMode) {
            loadScheduleSMSLogs(scheduleCheckDate || changedDate);
          } else {
            loadScheduleSMSLogs(getTodayDateString());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    scheduleCheckDate,
    scheduleDate,
    showScheduleModal,
    showScheduleCheckModal,
    isMobileEmergencyMode,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function syncRouteSeparatedViewMode() {
      const pathname = window.location.pathname || "/";
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      const otCheckParam = params.get("otCheck") || params.get("ot_check") || params.get("otCheckMemberId");

      if (otCheckParam) {
        setIsMobileEmergencyMode(false);
        try {
          window.localStorage?.setItem("spotainerViewMode", "tablet");
        } catch (error) {
          console.warn("Spotainer view mode 저장 실패", error);
        }
        return;
      }

      // v11 핵심 수정:
      // PWA 설치앱은 manifest/start_url 또는 오래된 캐시 때문에
      // 태블릿에서 /mobile-schedule로 실행되는 경우가 있습니다.
      // 그래서 최종 판정은 아래처럼 고정합니다.
      // 1) ?view=tablet  -> 무조건 태블릿
      // 2) ?view=phone   -> 무조건 휴대폰
      // 3) /mobile-schedule + 실제 화면이 휴대폰 크기 -> 휴대폰
      // 4) 그 외, 특히 태블릿 크기/PWA 실행 -> 무조건 태블릿
      const innerWidth = window.innerWidth || 0;
      const innerHeight = window.innerHeight || 0;
      const visualWidth = window.visualViewport?.width || innerWidth || 0;
      const visualHeight = window.visualViewport?.height || innerHeight || 0;
      const screenWidth = window.screen?.width || 0;
      const screenHeight = window.screen?.height || 0;

      const longSide = Math.max(innerWidth, innerHeight, visualWidth, visualHeight, screenWidth, screenHeight);
      const shortSide = Math.min(
        ...[innerWidth, innerHeight, visualWidth, visualHeight, screenWidth, screenHeight].filter((value) => value > 0)
      );

      const tabletLike = longSide >= 900 && shortSide >= 500;
      const phoneLike = longSide <= 930 && shortSide <= 499;
      const pathWantsMobile = pathname.includes("/mobile-schedule");

      let nextMobileMode = false;

      if (viewParam === "tablet") {
        nextMobileMode = false;
      } else if (viewParam === "phone") {
        nextMobileMode = true;
      } else if (pathWantsMobile && phoneLike && !tabletLike) {
        nextMobileMode = true;
      } else {
        nextMobileMode = false;
      }

      if (!nextMobileMode && pathWantsMobile && viewParam !== "phone") {
        try {
          window.history.replaceState(null, "", "/?view=tablet");
        } catch (error) {
          console.warn("태블릿 주소 정리 실패", error);
        }
      }

      try {
        window.localStorage?.setItem("spotainerViewMode", nextMobileMode ? "phone" : "tablet");
      } catch (error) {
        console.warn("Spotainer view mode 저장 실패", error);
      }

      console.log("Spotainer v11 route separated view", {
        pathname,
        viewParam,
        innerWidth,
        innerHeight,
        visualWidth,
        visualHeight,
        screenWidth,
        screenHeight,
        longSide,
        shortSide,
        tabletLike,
        phoneLike,
        pathWantsMobile,
        nextMobileMode,
        reason: nextMobileMode ? "phone-route-and-phone-size" : "tablet-forced-root-or-tablet-size",
      });

      setIsMobileEmergencyMode(Boolean(nextMobileMode));
    }

    syncRouteSeparatedViewMode();
    window.addEventListener("popstate", syncRouteSeparatedViewMode);
    window.addEventListener("hashchange", syncRouteSeparatedViewMode);

    return () => {
      window.removeEventListener("popstate", syncRouteSeparatedViewMode);
      window.removeEventListener("hashchange", syncRouteSeparatedViewMode);
    };
  }, []);

  useEffect(() => {
    if (!isMobileEmergencyMode || !scheduleCheckDate) return;

    loadScheduleCheckList(scheduleCheckDate);
    loadScheduleSMSLogs(scheduleCheckDate);
  }, [isMobileEmergencyMode, scheduleCheckDate]);

  useEffect(() => {
    if (!exitToast) return;

    const timer = window.setTimeout(() => {
      setExitToast("");
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [exitToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleBackButton() {
      if (hasOpenModalRef.current) {
        goToMain();
      }
      // 메인화면에서는 아무것도 막지 않습니다.
      // 태블릿/PWA 기본 동작대로 뒤로가면 앱이 종료됩니다.
    }

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);


  useEffect(() => {
    if (!showScheduleCheckModal || !scheduleCheckDate) return;

    loadScheduleCheckList(scheduleCheckDate);
    loadScheduleCheckMonthList(scheduleCheckDate);
  }, [showScheduleCheckModal, scheduleCheckDate]);


  useEffect(() => {
    if (!showScheduleModal) return;

    const timer = setTimeout(() => {
      loadPreviousWorkoutsForScheduleForm(getScheduleFormMemberIds(), scheduleDate);
    }, 150);

    return () => clearTimeout(timer);
  }, [showScheduleModal, scheduleMemberId, scheduleSecondMemberId, scheduleThirdMemberId, scheduleDate]);

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
        member_stage: m.member_stage || (m.is_active === false ? "inactive" : "pt"),
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
      .select("*, members(*), schedule_members(*, members(*))")
      .eq("schedule_date", date)
      .order("start_time", { ascending: true });

    if (error) {
      alert("스케줄 불러오기 실패: " + error.message);
      return;
    }

    setSchedules(data || []);
    await loadLastWorkoutsForSchedules(data || []);
    await loadLatestConditionChecksForSchedules(data || []);
  }

  async function loadLastWorkoutsForSchedules(scheduleList = []) {
    const targets = (scheduleList || [])
      .map((schedule) => ({
        scheduleId: schedule.id,
        memberId: schedule.member_id,
        scheduleDate: schedule.schedule_date || getTodayDateString(),
      }))
      .filter((target) => target.scheduleId && target.memberId);

    if (targets.length === 0) return;

    const nextMap = {};
    const seenKeys = new Set();

    for (const target of targets) {
      const key = `${target.memberId}-${target.scheduleDate}`;

      if (seenKeys.has(key)) {
        const reused = Object.values(nextMap).find(
          (item) => item?.member_id === target.memberId && item?.__baseDate === target.scheduleDate
        );
        if (reused) nextMap[target.scheduleId] = reused;
        continue;
      }

      seenKeys.add(key);

      const { data, error } = await supabase
        .from("workout_sessions")
        .select("*, workout_sets(*)")
        .eq("member_id", target.memberId)
        .lte("workout_date", target.scheduleDate)
        .order("workout_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("지난 운동 기록 불러오기 실패:", error.message);
        continue;
      }

      if (data?.[0]) {
        nextMap[target.scheduleId] = {
          ...data[0],
          __baseDate: target.scheduleDate,
        };
      }
    }

    setLastWorkoutMap((prev) => ({
      ...prev,
      ...nextMap,
    }));
  }


  async function loadLatestConditionChecksForSchedules(scheduleList = []) {
    const memberIds = Array.from(
      new Set(
        (scheduleList || [])
          .flatMap((schedule) => getScheduleMembers(schedule).map((member) => member?.id))
          .filter(Boolean)
      )
    );

    if (memberIds.length === 0) return;

    const { data, error } = await supabase
      .from("member_condition_checks")
      .select("*")
      .in("member_id", memberIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("최근 컨디션 체크 불러오기 실패:", error.message);
      return;
    }

    const nextMap = {};
    (data || []).forEach((row) => {
      if (!row.member_id || nextMap[row.member_id]) return;
      nextMap[row.member_id] = row;
    });

    setLatestConditionMap((prev) => ({
      ...prev,
      ...nextMap,
    }));
  }


  async function loadLatestConditionChecksForMembers(memberList = []) {
    try {
      const memberIds = Array.from(
        new Set(
          (memberList || [])
            .map((member) => member?.id)
            .filter(Boolean)
        )
      );

      if (memberIds.length === 0) {
        setLatestConditionMap({});
        return;
      }

      const { data, error } = await supabase
        .from("member_condition_checks")
        .select("*")
        .in("member_id", memberIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("회원 최근 컨디션 체크 불러오기 실패:", error.message);
        return;
      }

      const nextMap = {};
      (data || []).forEach((row) => {
        if (!row.member_id || nextMap[row.member_id]) return;
        nextMap[row.member_id] = row;
      });

      setLatestConditionMap(nextMap);
    } catch (error) {
      console.error("회원 최근 컨디션 체크 처리 실패:", error);
    }
  }

  function getLatestConditionForMember(member) {
    if (!member?.id) return null;
    return latestConditionMap[member.id] || null;
  }

  function getMemberStageText(stage) {
    if (stage === "ot") return "OT회원";
    if (stage === "inactive") return "비활성";
    return "PT회원";
  }

  function getMemberStageBadgeStyle(stage) {
    if (stage === "ot") {
      return { ...styles.compactStatusBadge, background: "#fef3c7", color: "#92400e" };
    }
    if (stage === "inactive") {
      return { ...styles.compactStatusBadge, background: "#e5e7eb", color: "#374151" };
    }
    return { ...styles.compactStatusBadge, background: "#dcfce7", color: "#166534" };
  }

  function getConditionPreviewText(condition) {
    if (!condition) return "";
    const parts = [
      condition.condition_level ? `컨디션 ${condition.condition_level}` : "",
      condition.pain_area && condition.pain_area !== "없음" ? `불편 ${condition.pain_area}` : "",
      condition.sleep_status ? `수면 ${condition.sleep_status}` : "",
      condition.muscle_soreness && condition.muscle_soreness !== "없음" ? `근육통 ${condition.muscle_soreness}` : "",
      condition.workout_burden && condition.workout_burden !== "괜찮음" ? `부담 ${condition.workout_burden}` : "",
    ].filter(Boolean);

    return parts.join(" · ");
  }

  function resetConditionForm() {
    setConditionLevel("보통");
    setConditionSleepStatus("보통");
    setConditionPainArea("없음");
    setConditionMuscleSoreness("없음");
    setConditionWorkoutBurden("괜찮음");
    setConditionMemo("");
  }

  function openConditionCheckModal(member) {
    if (!member) return;
    const latest = getLatestConditionForMember(member);
    setConditionModalMember(member);
    setConditionLevel(latest?.condition_level || "보통");
    setConditionSleepStatus(latest?.sleep_status || "보통");
    setConditionPainArea(latest?.pain_area || "없음");
    setConditionMuscleSoreness(latest?.muscle_soreness || "없음");
    setConditionWorkoutBurden(latest?.workout_burden || "괜찮음");
    setConditionMemo(latest?.memo || "");
  }

  function closeConditionCheckModal() {
    setConditionModalMember(null);
    resetConditionForm();
  }

  async function saveConditionCheck() {
    if (!conditionModalMember?.id) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    const row = {
      member_id: conditionModalMember.id,
      check_stage: conditionModalMember.member_stage === "ot" ? "ot" : "pt",
      condition_level: conditionLevel,
      sleep_status: conditionSleepStatus,
      pain_area: conditionPainArea,
      muscle_soreness: conditionMuscleSoreness,
      workout_burden: conditionWorkoutBurden,
      memo: conditionMemo.trim(),
    };

    const { data, error } = await supabase
      .from("member_condition_checks")
      .insert(row)
      .select()
      .single();

    if (error) {
      alert("컨디션 체크 저장 실패: " + error.message);
      return;
    }

    setLatestConditionMap((prev) => ({
      ...prev,
      [conditionModalMember.id]: data || row,
    }));

    closeConditionCheckModal();
    alert("컨디션 체크가 저장되었습니다.");
  }

  async function convertOtMemberToPt(member) {
    if (!member?.id) return;

    if (!confirm(`${member.name || "회원"} 회원을 PT회원으로 전환할까요?\n기존 성향체크 문항과 결과는 그대로 유지됩니다.`)) {
      return;
    }

    const { error } = await supabase
      .from("members")
      .update({
        member_stage: "pt",
        member_type:
          member.member_type === "vip" || member.member_type === "group"
            ? member.member_type
            : "pt",
        is_active: true,
      })
      .eq("id", member.id);

    if (error) {
      alert("PT 전환 실패: " + error.message);
      return;
    }

    const { data: latestOtRecord, error: lookupError } = await supabase
      .from("ot_records")
      .select("id")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lookupError && latestOtRecord?.id) {
      await supabase
        .from("ot_records")
        .update({
          converted_to_pt: true,
          converted_at: new Date().toISOString(),
        })
        .eq("id", latestOtRecord.id);
    } else {
      await supabase.from("ot_records").insert({
        member_id: member.id,
        converted_to_pt: true,
        converted_at: new Date().toISOString(),
        trainer_memo: "OT 회원 PT 전환",
      });
    }

    if (selectedMember?.id === member.id) {
      setSelectedMember({
        ...selectedMember,
        member_stage: "pt",
        member_type:
          member.member_type === "vip" || member.member_type === "group"
            ? member.member_type
            : "pt",
        is_active: true,
      });
    }

    closeMemberActionMenu();
    await loadMembers();
    alert(`${member.name || "회원"} 회원이 PT회원으로 전환되었습니다.`);
  }

  async function loadSelectedDateSchedules(date = scheduleDate) {
    if (!date) {
      setSelectedDateSchedules([]);
      return;
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(*), schedule_members(*, members(*))")
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
      .select("*, members(*), schedule_members(*, members(*))")
      .eq("schedule_date", date)
      .order("start_time", { ascending: true });

    if (error) {
      alert("스케줄 확인 불러오기 실패: " + error.message);
      return;
    }

    setScheduleCheckList(data || []);
    await loadLastWorkoutsForSchedules(data || []);
    await loadLatestConditionChecksForSchedules(data || []);
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

  async function loadScheduleSMSLogs(date = getTodayDateString()) {
    const targetDate = date || getTodayDateString();

    const { data, error } = await supabase
      .from("schedule_sms_logs")
      .select("*")
      .eq("sent_date", targetDate)
      .eq("message_type", "schedule_condition");

    if (error) {
      console.error("문자 발송 기록 불러오기 실패:", error.message);
      setSmsSentLogList([]);
      setSmsSentMap({});
      return;
    }

    const nextMap = {};
    (data || []).forEach((log) => {
      if (!log.schedule_id) return;
      nextMap[getScheduleSMSLogKey(log.schedule_id, log.member_id)] = true;
    });

    setSmsSentLogList(data || []);
    setSmsSentMap(nextMap);
  }

  function getScheduleSMSLogKey(scheduleId, memberId) {
    return `${scheduleId}:${memberId || "unknown"}`;
  }

  function isScheduleMemberSMSSent(schedule, member) {
    if (!schedule?.id || !member?.id) return false;
    return Boolean(smsSentMap[getScheduleSMSLogKey(schedule.id, member.id)]);
  }

  function getScheduleSMSMembers(schedule) {
    const list = getScheduleMembers(schedule);
    return list.length > 0 ? list : [];
  }

  function getUnsentScheduleSMSMembers(schedule) {
    return getScheduleSMSMembers(schedule).filter((member) => !isScheduleMemberSMSSent(schedule, member));
  }

  async function saveScheduleSMSLog(schedule, memoText = "", targetMember = null) {
    if (!schedule?.id) return false;

    const member = targetMember || getScheduleMember(schedule) || schedule.members;
    const sentDate = schedule.schedule_date || getTodayDateString();

    if (!member?.id) {
      alert("문자 발송 기록을 저장할 회원 정보를 찾을 수 없습니다.");
      return false;
    }

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
      alert("문자 발송 기록 확인 실패: " + lookupError.message);
      return false;
    }

    let saveError = null;

    if (existingLog?.id) {
      const result = await supabase
        .from("schedule_sms_logs")
        .update({
          sent_at: row.sent_at,
          memo: row.memo,
          sent_date: row.sent_date,
          message_type: row.message_type,
        })
        .eq("id", existingLog.id);
      saveError = result.error;
    } else {
      const result = await supabase
        .from("schedule_sms_logs")
        .insert(row);
      saveError = result.error;
    }

    if (saveError) {
      const retry = await supabase
        .from("schedule_sms_logs")
        .update({ sent_at: row.sent_at, memo: row.memo })
        .eq("schedule_id", schedule.id)
        .eq("member_id", member.id)
        .eq("sent_date", sentDate)
        .eq("message_type", "schedule_condition");

      if (retry.error) {
        alert("문자 발송 기록 저장 실패: " + retry.error.message);
        return false;
      }
    }

    const key = getScheduleSMSLogKey(schedule.id, member.id);
    setSmsSentMap((prev) => ({
      ...prev,
      [key]: true,
    }));

    setSmsSentLogList((prev) => {
      const filtered = (prev || []).filter(
        (log) => !(log.schedule_id === schedule.id && log.member_id === member.id)
      );
      return [...filtered, row];
    });

    return true;
  }

  function isScheduleSMSSent(schedule) {
    const membersForSMS = getScheduleSMSMembers(schedule);
    if (membersForSMS.length === 0) return false;
    return membersForSMS.every((member) => isScheduleMemberSMSSent(schedule, member));
  }


  function cleanScheduleMemoText(value = "") {
    return String(value || "")
      .replace(/\s*\[?\s*문자\s*완료\s*\]?\s*/g, " ")
      .replace(/\s*\[?\s*문자완료\s*\]?\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function getScheduleDisplayMemo(schedule) {
    return cleanScheduleMemoText(schedule?.memo || "");
  }

  function filterScheduleList(list = [], keyword = "") {
    const q = String(keyword || "").trim().toLowerCase();

    if (!q) return list || [];

    return (list || []).filter((schedule) => {
      const scheduleMembers = getScheduleMembers(schedule);
      const cleanKeyword = q.replace(/[^0-9]/g, "");
      const memberMatched = scheduleMembers.some((member) => {
        const memberName = String(member?.name || "").toLowerCase();
        const memberPhone = String(member?.phone || "").toLowerCase();
        const cleanPhone = memberPhone.replace(/[^0-9]/g, "");

        return (
          memberName.includes(q) ||
          memberPhone.includes(q) ||
          (cleanKeyword && cleanPhone.includes(cleanKeyword))
        );
      });

      return (
        memberMatched ||
        getScheduleTypeText(schedule.type).toLowerCase().includes(q) ||
        getScheduleDisplayMemo(schedule).toLowerCase().includes(q)
      );
    });
  }

  function getFilteredScheduleCheckList(list = scheduleCheckList, keyword = scheduleSearch) {
    return filterScheduleList(list, keyword);
  }

  async function searchScheduleByKeyword() {
    const keyword = scheduleSearch.trim();

    if (!keyword) {
      alert("검색할 회원 이름이나 전화번호를 입력하세요.");
      return;
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(*), schedule_members(*, members(*))")
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

  function closeScheduleActionMenu() {
    setScheduleActionMenuId(null);
  }

  function renderScheduleMoreMenu(schedule) {
    return (
      <>
        <div
          style={styles.scheduleMoreMenuBackdrop}
          onClick={closeScheduleActionMenu}
        />
        <div style={styles.scheduleMoreMenu}>
          <button
            type="button"
            onClick={() => {
              closeScheduleActionMenu();
              addToDeviceCalendar(schedule);
            }}
            style={styles.scheduleMoreMenuButton}
          >
            캘린더
          </button>
          <button
            type="button"
            onClick={() => {
              closeScheduleActionMenu();
              markScheduleNoShow(schedule);
            }}
            style={styles.scheduleMoreMenuButtonDanger}
          >
            노쇼
          </button>
          <button
            type="button"
            onClick={() => {
              closeScheduleActionMenu();
              markScheduleCancelled(schedule);
            }}
            style={styles.scheduleMoreMenuButtonWarning}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              closeScheduleActionMenu();
              startEditSchedule(schedule);
            }}
            style={styles.scheduleMoreMenuButton}
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => {
              closeScheduleActionMenu();
              deleteSchedule(schedule);
            }}
            style={styles.scheduleMoreMenuButtonDanger}
          >
            삭제
          </button>
          <button
            type="button"
            onClick={closeScheduleActionMenu}
            style={styles.scheduleMoreMenuCloseButton}
          >
            닫기
          </button>
        </div>
      </>
    );
  }

  function renderScheduleQuickButtons(schedule, isDone = false) {
    return (
      <div style={styles.scheduleQuickButtonWrap}>
        {scheduleActionMenuId === schedule.id && renderScheduleMoreMenu(schedule)}

        {isDone ? (
          <button style={styles.scheduleDisabledButton} disabled>
            {schedule.status === "cancelled"
              ? "취소됨"
              : schedule.status === "noshow"
                ? "노쇼"
                : "완료됨"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => completeScheduleClass(schedule)}
            style={styles.incompleteCompleteButton}
          >
            완료
          </button>
        )}

        <button
          type="button"
          onClick={() => sendScheduleSMS(schedule)}
          style={styles.scheduleSmsButton}
        >
          문자
        </button>

        <button
          type="button"
          onClick={() =>
            setScheduleActionMenuId((current) =>
              current === schedule.id ? null : schedule.id
            )
          }
          style={styles.scheduleMoreButton}
        >
          ⋯
        </button>
      </div>
    );
  }

  function getWorkoutConditionText(condition) {
    if (condition === "good") return "좋음";
    if (condition === "bad") return "나쁨";
    if (condition === "normal") return "보통";
    return condition || "";
  }

  function getLastWorkoutSummary(workout) {
    if (!workout) return null;

    const exerciseNames = Array.from(
      new Set(
        (workout.workout_sets || [])
          .map((set) => String(set.exercise_name || "").trim())
          .filter(Boolean)
      )
    );

    const exerciseText = exerciseNames.length > 0
      ? `${exerciseNames.slice(0, 3).join(", ")}${exerciseNames.length > 3 ? ` 외 ${exerciseNames.length - 3}개` : ""}`
      : "기록 있음";

    const bodyParts = Array.isArray(workout.body_parts)
      ? workout.body_parts.filter(Boolean)
      : [];
    const bodyPartText = bodyParts.length > 0 ? bodyParts.join(", ") : "";

    const conditionText = getWorkoutConditionText(workout.condition);
    const issueText = String(workout.issue || "").trim();
    const memoText = String(workout.memo || "").trim();
    const trainerNoteText = String(workout.trainer_note || "").trim();
    const conditionLine = [conditionText ? `컨디션 ${conditionText}` : "", issueText].filter(Boolean).join(" · ");
    const noteLine = memoText || trainerNoteText;

    return {
      exerciseText,
      bodyPartText,
      conditionLine,
      noteLine,
      workoutDate: workout.workout_date,
    };
  }

  function renderScheduleCheckItem(schedule, showDate = false) {
    const member = getScheduleMember(schedule) || schedule.members;
    const memberNames = getScheduleMemberNames(schedule);
    const memberPtText = getScheduleMemberPtText(schedule);
    const status = getSchedulePreviewStatus(schedule);
    const isDone =
      schedule.status === "cancelled" ||
      schedule.status === "noshow" ||
      schedule.status === "completed" ||
      (schedule.attendance_checked && schedule.pt_used);

    return (
      <div key={schedule.id} style={styles.scheduleCheckItem}>
        <div style={styles.scheduleCheckMainCompact}>
          <div style={styles.scheduleCheckTitleRow}>
            <strong style={styles.scheduleCheckTime}>
              {showDate ? `${formatDate(schedule.schedule_date)} · ` : ""}
              {formatScheduleRange(schedule)}
            </strong>

            <span style={status.style}>{status.text}</span>
          </div>

          <div style={styles.scheduleCheckSubRow}>
            <span style={styles.scheduleCheckMemberCompact}>
              {getScheduleTypeText(schedule.type)} · {memberNames}
              {memberPtText ? ` · ${memberPtText}` : ""}
            </span>

            {showDate && (
              <span style={styles.scheduleTimelineMetaCompact}>
                {getScheduleRelationText(schedule.schedule_date)}
              </span>
            )}
          </div>

          {getScheduleDisplayMemo(schedule) && (
            <p style={styles.scheduleCheckMemoCompact}>{getScheduleDisplayMemo(schedule)}</p>
          )}

          {getReRegisterAlert(member) && (
            <div style={styles.reRegisterInlineAlert}>
              <strong>{getReRegisterAlert(member).title}</strong>
              <span>{getReRegisterAlert(member).text}</span>
            </div>
          )}

          {getLastWorkoutSummary(lastWorkoutMap[schedule.id]) && (
            <div style={styles.lastWorkoutPreviewCompact}>
              {getLastWorkoutSummary(lastWorkoutMap[schedule.id]).bodyPartText && (
                <span style={styles.lastWorkoutPreviewStrong}>
                  지난부위: {getLastWorkoutSummary(lastWorkoutMap[schedule.id]).bodyPartText}
                </span>
              )}
              <span style={styles.lastWorkoutPreviewStrong}>
                지난운동: {getLastWorkoutSummary(lastWorkoutMap[schedule.id]).exerciseText}
              </span>
              {getLastWorkoutSummary(lastWorkoutMap[schedule.id]).conditionLine && (
                <span style={styles.lastWorkoutPreviewText}>
                  {getLastWorkoutSummary(lastWorkoutMap[schedule.id]).conditionLine}
                </span>
              )}
              {getLastWorkoutSummary(lastWorkoutMap[schedule.id]).noteLine && (
                <span style={styles.lastWorkoutPreviewText}>
                  {getLastWorkoutSummary(lastWorkoutMap[schedule.id]).noteLine}
                </span>
              )}
            </div>
          )}

          {member && getLatestConditionForMember(member) && (
            <div style={styles.lastWorkoutPreviewCompact}>
              <span style={styles.lastWorkoutPreviewStrong}>
                최근컨디션: {getConditionPreviewText(getLatestConditionForMember(member))}
              </span>
              {getLatestConditionForMember(member)?.memo && (
                <span style={styles.lastWorkoutPreviewText}>
                  {getLatestConditionForMember(member).memo}
                </span>
              )}
            </div>
          )}

          <div style={styles.scheduleStatusRowCompact}>
            {isScheduleSMSSent(schedule) && (
              <span style={styles.scheduleSmsDoneText}>문자 완료</span>
            )}
            {schedule.attendance_checked ? (
              <span style={styles.scheduleDoneText}>출석</span>
            ) : (
              <span style={styles.scheduleWarningText}>출석 전</span>
            )}
            {schedule.pt_used ? (
              <span style={styles.scheduleDoneText}>차감</span>
            ) : (
              <span style={styles.scheduleWarningText}>차감 전</span>
            )}
          </div>
        </div>

        <div style={styles.scheduleCheckButtonGroup}>
          {renderScheduleQuickButtons(schedule, isDone)}
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

  function openTrainerLogModal() {
    setShowCenterModal(false);
    setShowTrainerLogModal(true);
    loadTrainerLogs();
  }

  function closeTrainerLogModal() {
    setShowTrainerLogModal(false);
    setShowTrainerWorkoutHistoryModal(false);
  }

  function openTrainerWorkoutHistoryModal() {
    setShowTrainerWorkoutHistoryModal(true);
    loadTrainerLogs();
  }

  function closeTrainerWorkoutHistoryModal() {
    setShowTrainerWorkoutHistoryModal(false);
  }

  function closeMemberActionMenu() {
    setMemberActionMenuMember(null);
  }

  async function openMemberScheduleSearch(member) {
    if (!member) return;

    const { data, error } = await supabase
      .from("schedules")
      .select("*, members(*), schedule_members(*, members(*))")
      .order("schedule_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      alert("회원 스케줄 불러오기 실패: " + error.message);
      return;
    }

    const filtered = (data || []).filter((schedule) =>
      getScheduleMembers(schedule).some((scheduleMember) => scheduleMember?.id === member.id)
    );

    setScheduleSearch(member.name || "");
    setScheduleSearchResultList(filtered);
    setShowScheduleSearchResultModal(true);
    setShowMemberListModal(false);
    closeMemberActionMenu();
  }

  function getTrainerWorkoutTypeText(type) {
    if (type === "circuit") return "서킷";
    if (type === "cardio") return "유산소";
    if (type === "stretch") return "스트레칭";
    return "웨이트";
  }

  function getLatestTrainerWorkoutLog() {
    return (trainerWorkoutList || []).find((log) => log?.workout_date || log?.created_at) || null;
  }

  function getTrainerSelectedPartReferenceLog() {
    const selectedParts = trainerWorkoutBodyParts || [];
    if (selectedParts.length === 0) return null;

    return (trainerWorkoutList || []).find((log) => {
      const parts = Array.isArray(log.body_parts) ? log.body_parts : [];
      return parts.some((part) => selectedParts.includes(part));
    }) || null;
  }

  function getTrainerWorkoutExerciseNames(log) {
    const items = Array.isArray(log?.exercise_items) ? log.exercise_items : [];
    const names = items.map((exercise) => exercise?.name).filter(Boolean);
    if (names.length > 0) return names;

    return String(log?.exercise_summary || "")
      .split(/[,·\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  function summarizeTrainerWorkoutLogShort(log) {
    if (!log) return "최근 개인 운동 기록이 없습니다.";
    const parts = Array.isArray(log.body_parts) && log.body_parts.length > 0 ? log.body_parts.join(", ") : getTrainerWorkoutTypeText(log.workout_type);
    const names = getTrainerWorkoutExerciseNames(log);
    const exerciseText = names.length > 0 ? `${names.slice(0, 3).join(", ")}${names.length > 3 ? ` 외 ${names.length - 3}개` : ""}` : (log.exercise_summary || "운동 내용 미입력");
    return `${formatDate(log.workout_date)} · ${parts} · ${exerciseText}`;
  }

  function renderTrainerWorkoutHistoryCard(log) {
    return (
      <div key={log.id} style={styles.personalLogCard}>
        <div style={styles.personalLogCardTop}>
          <div>
            <strong>{formatDate(log.workout_date)}</strong>
            <p style={styles.personalLogMain}>
              {getTrainerWorkoutTypeText(log.workout_type)}
              {Array.isArray(log.body_parts) && log.body_parts.length > 0 ? ` · ${log.body_parts.join(", ")}` : ""}
            </p>
          </div>
          <div style={styles.personalHistoryActionRow}>
            <button type="button" onClick={() => startEditTrainerWorkoutLog(log)} style={styles.whiteSmallButton}>
              수정
            </button>
            <button type="button" onClick={() => deleteTrainerWorkoutLog(log.id)} style={styles.whiteSmallDangerButton}>
              삭제
            </button>
          </div>
        </div>

        {Array.isArray(log.exercise_items) && log.exercise_items.length > 0 ? (
          <div style={styles.personalWorkoutDetailTable}>
            {log.exercise_items.map((exercise, exerciseIndex) => (
              <div key={`${log.id}-exercise-${exerciseIndex}`} style={styles.personalWorkoutDetailRow}>
                <strong>{exercise.name || "운동명 미입력"}</strong>
                <span>
                  {(exercise.sets || []).map((set, setIndex) => (
                    `${setIndex + 1}세트 ${set.weight || "-"}kg ${set.reps || "-"}회`
                  )).join(" · ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.personalLogText}>{log.exercise_summary}</p>
        )}

        {(log.issue || log.next_plan || log.memo) && (
          <p style={styles.personalLogSub}>
            {[log.issue ? `이슈: ${log.issue}` : "", log.next_plan ? `다음: ${log.next_plan}` : "", log.memo ? `메모: ${log.memo}` : ""].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    );
  }

  function toggleTrainerWorkoutBodyPart(part) {
    setTrainerWorkoutBodyParts((prev) =>
      prev.includes(part) ? prev.filter((item) => item !== part) : [...prev, part]
    );
  }


  function changeTrainerWorkoutType(type) {
    setTrainerWorkoutType(type);
    setTrainerWorkoutExercises([createEmptyWorkoutExercise(type)]);
    if (type === "circuit") {
      setTrainerWorkoutBodyParts(["전신"]);
    }
  }

  function startEditTrainerWorkoutLog(log) {
    if (!log) return;

    setEditingTrainerWorkoutLog(log);
    setTrainerLogTab("workout");
    setTrainerWorkoutDate(log.workout_date || getTodayDateString());
    setTrainerWorkoutType(log.workout_type || "weight");
    setTrainerWorkoutBodyParts(Array.isArray(log.body_parts) ? log.body_parts : []);
    setTrainerExerciseSummary(log.exercise_summary || "");
    setTrainerWorkoutExercises(
      Array.isArray(log.exercise_items) && log.exercise_items.length > 0
        ? log.exercise_items.map((exercise) => ({
            name: exercise.name || "",
            sets: Array.isArray(exercise.sets) && exercise.sets.length > 0
              ? exercise.sets.map((set) => ({
                  weight: String(set.weight || ""),
                  reps: String(set.reps || ""),
                }))
              : [{ weight: "", reps: "" }],
          }))
        : [createEmptyWorkoutExercise(log.workout_type || "weight")]
    );
    setTrainerCondition(log.condition || "normal");
    setTrainerIssue(log.issue || "");
    setTrainerNextPlan(log.next_plan || "");
    setTrainerWorkoutMemo(log.memo || "");
    setShowTrainerWorkoutHistoryModal(false);
    setShowTrainerLogModal(true);
  }

  function getCleanTrainerWorkoutExercises() {
    return trainerWorkoutExercises
      .map((exercise) => ({
        name: String(exercise.name || "").trim(),
        sets: (exercise.sets || [])
          .map((set) => ({
            weight: String(set.weight || "").trim(),
            reps: String(set.reps || "").trim(),
          }))
          .filter((set) => set.weight || set.reps),
      }))
      .filter((exercise) => exercise.name || exercise.sets.length > 0);
  }

  function summarizeTrainerExercises(exercises = []) {
    return exercises
      .map((exercise) => {
        const setCount = exercise.sets?.length || 0;
        return `${exercise.name || "운동명 미입력"}${setCount ? ` ${setCount}세트` : ""}`;
      })
      .join(", ");
  }

  function addTrainerExercise() {
    setTrainerWorkoutExercises((prev) => [
      ...prev,
      createEmptyWorkoutExercise(trainerWorkoutType),
    ]);
  }

  function removeTrainerExercise(exerciseIndex) {
    if (trainerWorkoutExercises.length <= 1) return alert("운동은 최소 1개가 필요합니다.");
    setTrainerWorkoutExercises((prev) => prev.filter((_, index) => index !== exerciseIndex));
  }

  function updateTrainerExerciseName(exerciseIndex, value) {
    setTrainerWorkoutExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, name: value } : exercise
      )
    );
  }

  function addTrainerSet(exerciseIndex) {
    setTrainerWorkoutExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, { weight: "", reps: "" }] }
          : exercise
      )
    );
  }

  function removeTrainerSet(exerciseIndex, setIndex) {
    setTrainerWorkoutExercises((prev) =>
      prev.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;
        if (exercise.sets.length <= 1) return exercise;
        return { ...exercise, sets: exercise.sets.filter((_, i) => i !== setIndex) };
      })
    );
  }

  function updateTrainerSetValue(exerciseIndex, setIndex, key, value) {
    setTrainerWorkoutExercises((prev) =>
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

  function resetTrainerInbodyForm() {
    setTrainerInbodyDate(getTodayDateString());
    setTrainerWeight("");
    setTrainerSkeletalMuscle("");
    setTrainerBodyFatMass("");
    setTrainerBodyFatPercent("");
    setTrainerInbodyMemo("");
  }

  function resetTrainerWorkoutForm() {
    setTrainerWorkoutDate(getTodayDateString());
    setTrainerWorkoutType("weight");
    setTrainerWorkoutBodyParts([]);
    setTrainerExerciseSummary("");
    setTrainerWorkoutExercises([createEmptyWorkoutExercise("weight")]);
    setTrainerCondition("normal");
    setTrainerIssue("");
    setTrainerNextPlan("");
    setTrainerWorkoutMemo("");
    setEditingTrainerWorkoutLog(null);
  }

  async function loadTrainerLogs() {
    const [inbodyResult, workoutResult] = await Promise.all([
      supabase
        .from("trainer_inbody_logs")
        .select("*")
        .order("measured_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("trainer_workout_logs")
        .select("*")
        .order("workout_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (inbodyResult.error) {
      console.error("대표 인바디 기록 불러오기 실패:", inbodyResult.error.message);
    } else {
      setTrainerInbodyList(inbodyResult.data || []);
    }

    if (workoutResult.error) {
      console.error("대표 운동 기록 불러오기 실패:", workoutResult.error.message);
    } else {
      setTrainerWorkoutList(workoutResult.data || []);
    }
  }

  async function saveTrainerInbodyLog() {
    const row = {
      measured_at: trainerInbodyDate || getTodayDateString(),
      weight: trainerWeight ? Number(trainerWeight) : null,
      skeletal_muscle: trainerSkeletalMuscle ? Number(trainerSkeletalMuscle) : null,
      body_fat_mass: trainerBodyFatMass ? Number(trainerBodyFatMass) : null,
      body_fat_percent: trainerBodyFatPercent ? Number(trainerBodyFatPercent) : null,
      memo: trainerInbodyMemo.trim(),
    };

    const { error } = await supabase.from("trainer_inbody_logs").insert(row);

    if (error) {
      alert("대표 인바디 저장 실패: " + error.message);
      return;
    }

    resetTrainerInbodyForm();
    await loadTrainerLogs();
    alert("대표 인바디 기록이 저장되었습니다.");
  }

  async function saveTrainerWorkoutLog() {
    const cleanExercises = getCleanTrainerWorkoutExercises();
    const summaryText = trainerExerciseSummary.trim() || summarizeTrainerExercises(cleanExercises);

    if (!summaryText && cleanExercises.length === 0) {
      alert("운동명이나 운동 내용을 입력하세요.");
      return;
    }

    const row = {
      workout_date: trainerWorkoutDate || getTodayDateString(),
      workout_type: trainerWorkoutType,
      body_parts: trainerWorkoutType === "circuit" && trainerWorkoutBodyParts.length === 0 ? ["전신"] : trainerWorkoutBodyParts,
      exercise_summary: summaryText,
      exercise_items: cleanExercises,
      condition: trainerCondition,
      issue: trainerIssue.trim(),
      next_plan: trainerNextPlan.trim(),
      memo: trainerWorkoutMemo.trim(),
    };

    const query = editingTrainerWorkoutLog?.id
      ? supabase.from("trainer_workout_logs").update(row).eq("id", editingTrainerWorkoutLog.id)
      : supabase.from("trainer_workout_logs").insert(row);

    const { error } = await query;

    if (error) {
      alert(`대표 운동 기록 ${editingTrainerWorkoutLog?.id ? "수정" : "저장"} 실패: ${error.message}`);
      return;
    }

    const wasEditing = Boolean(editingTrainerWorkoutLog?.id);
    resetTrainerWorkoutForm();
    await loadTrainerLogs();
    alert(wasEditing ? "대표 운동 기록이 수정되었습니다." : "대표 운동 기록이 저장되었습니다.");
  }

  async function deleteTrainerInbodyLog(id) {
    if (!confirm("이 인바디 기록을 삭제할까요?")) return;
    const { error } = await supabase.from("trainer_inbody_logs").delete().eq("id", id);
    if (error) return alert("대표 인바디 삭제 실패: " + error.message);
    await loadTrainerLogs();
  }

  async function deleteTrainerWorkoutLog(id) {
    if (!confirm("이 운동 기록을 삭제할까요?")) return;
    const { error } = await supabase.from("trainer_workout_logs").delete().eq("id", id);
    if (error) return alert("대표 운동 기록 삭제 실패: " + error.message);
    await loadTrainerLogs();
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
    setScheduleThirdMemberId("");
    setEditingSchedule(null);
    setScheduleDate(getTodayDateString());
    setScheduleStartTime("");
    setScheduleEndTime("");
    setScheduleType("pt");
    setScheduleMemo("");
    setScheduleBodyParts([]);
    setScheduleRepeatEnabled(false);
    setScheduleRepeatCount(1);
    setScheduleRepeatIntervalDays(7);
    setScheduleRepeatItems([]);
    setSchedulePreviousWorkoutList([]);
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
    const participantIds = getScheduleMembers(schedule).map((member) => member.id).filter(Boolean);

    setEditingSchedule(schedule);
    setScheduleMemberId(participantIds[0] || schedule.member_id || "");
    setScheduleSecondMemberId(participantIds[1] || "");
    setScheduleThirdMemberId(participantIds[2] || "");
    setScheduleDate(schedule.schedule_date || getTodayDateString());
    setScheduleStartTime(normalizeTimeValue(schedule.start_time || ""));
    setScheduleEndTime(
      schedule.end_time
        ? normalizeTimeValue(schedule.end_time)
        : addMinutesToTime(schedule.start_time, 60)
    );
    setScheduleType(schedule.type || "pt");
    setScheduleMemo(getScheduleDisplayMemo(schedule));
    setScheduleBodyParts(Array.isArray(schedule?.body_parts) ? schedule.body_parts : []);
    setScheduleRepeatEnabled(false);
    setScheduleRepeatCount(1);
    setScheduleRepeatIntervalDays(7);
    setScheduleRepeatItems([]);
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

  function setScheduleCheckMonth(monthNumber) {
    const base = scheduleCheckDate ? new Date(scheduleCheckDate) : new Date();
    base.setDate(1);
    base.setMonth(monthNumber - 1);
    setScheduleCheckDate(getDateOnlyString(base));
    setShowScheduleMonthPicker(false);
  }

  function handleScheduleCalendarTouchStart(e) {
    scheduleCalendarTouchStartXRef.current = e.touches?.[0]?.clientX ?? null;
  }

  function handleScheduleCalendarTouchEnd(e) {
    const startX = scheduleCalendarTouchStartXRef.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;

    if (startX === null || endX === null) return;

    const diff = endX - startX;
    scheduleCalendarTouchStartXRef.current = null;

    if (Math.abs(diff) < 55) return;
    moveScheduleCheckMonth(diff > 0 ? -1 : 1);
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

    if (confirm("이 스케줄을 기본 캘린더에 추가할까요?")) {
      addToDeviceCalendar({
        ...row,
        id: row.id || `schedule-${Date.now()}`,
        members: getFreshMember(row.member_id),
      });
    }

    return true;
  }

  async function finishScheduleSave(date, message = "스케줄이 저장되었습니다.", calendarRows = []) {
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

    if (calendarRows.length > 0 && confirm("저장한 스케줄을 기본 캘린더에 추가할까요?")) {
      calendarRows.forEach((calendarRow, index) => {
        addToDeviceCalendar({
          ...calendarRow,
          id: calendarRow.id || `schedule-${Date.now()}-${index}`,
          members: getFreshMember(calendarRow.member_id),
        });
      });
    }
  }

  function getScheduleFormMemberIds() {
    const ids = [scheduleMemberId, scheduleSecondMemberId, scheduleThirdMemberId]
      .map((id) => String(id || "").trim())
      .filter(Boolean);

    return Array.from(new Set(ids));
  }

  function addDaysToDateString(dateText, days) {
    const base = dateText ? new Date(dateText) : new Date();
    base.setDate(base.getDate() + Number(days || 0));
    return getDateOnlyString(base);
  }

  function getScheduleRepeatDates() {
    return getScheduleRepeatItems().map((item) => item.date);
  }

  function getScheduleRepeatCountValue() {
    return Math.max(scheduleRepeatEnabled ? 2 : 1, Math.min(12, Number(scheduleRepeatCount || 1)));
  }

  function createScheduleRepeatItem(index = 0) {
    return {
      date: addDaysToDateString(scheduleDate || getTodayDateString(), index * 7),
      startTime: scheduleStartTime || "",
      bodyParts: index === 0 && Array.isArray(scheduleBodyParts) ? scheduleBodyParts : [],
    };
  }

  function getScheduleRepeatItems() {
    if (!scheduleRepeatEnabled) {
      return [{ date: scheduleDate, startTime: scheduleStartTime, bodyParts: Array.isArray(scheduleBodyParts) ? scheduleBodyParts : [] }];
    }

    const count = getScheduleRepeatCountValue();
    return Array.from({ length: count }, (_, index) => {
      const saved = scheduleRepeatItems[index] || {};
      return {
        date: saved.date || addDaysToDateString(scheduleDate || getTodayDateString(), index * 7),
        startTime: saved.startTime || scheduleStartTime || "",
        bodyParts: Array.isArray(saved.bodyParts) ? saved.bodyParts : [],
      };
    });
  }

  function resetScheduleRepeatItems(nextCount = scheduleRepeatCount) {
    const count = Math.max(2, Math.min(12, Number(nextCount || 4)));
    setScheduleRepeatCount(count);
    setScheduleRepeatItems(
      Array.from({ length: count }, (_, index) => ({
        date: addDaysToDateString(scheduleDate || getTodayDateString(), index * 7),
        startTime: scheduleStartTime || "",
        bodyParts: index === 0 && Array.isArray(scheduleBodyParts) ? scheduleBodyParts : [],
      }))
    );
  }

  function updateScheduleRepeatItem(index, patch) {
    setScheduleRepeatItems((prev) => {
      const count = getScheduleRepeatCountValue();
      const next = Array.from({ length: count }, (_, itemIndex) => prev[itemIndex] || createScheduleRepeatItem(itemIndex));
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function toggleScheduleRepeatItemBodyPart(index, part) {
    setScheduleRepeatItems((prev) => {
      const count = getScheduleRepeatCountValue();
      const next = Array.from({ length: count }, (_, itemIndex) => prev[itemIndex] || createScheduleRepeatItem(itemIndex));
      const current = Array.isArray(next[index]?.bodyParts) ? next[index].bodyParts : [];
      next[index] = {
        ...next[index],
        bodyParts: current.includes(part) ? current.filter((item) => item !== part) : [...current, part],
      };
      return next;
    });
  }

  async function loadPreviousWorkoutsForScheduleForm(memberIds = getScheduleFormMemberIds(), baseDate = scheduleDate) {
    const ids = Array.from(new Set((memberIds || []).filter(Boolean)));

    if (ids.length === 0) {
      setSchedulePreviousWorkoutList([]);
      return;
    }

    setSchedulePreviousWorkoutLoading(true);

    const results = [];

    for (const memberId of ids) {
      const member = getFreshMember(memberId) || activeMembers.find((item) => item.id === memberId);

      const { data, error } = await supabase
        .from("workout_sessions")
        .select("*, workout_sets(*)")
        .eq("member_id", memberId)
        .lte("workout_date", baseDate || getTodayDateString())
        .order("workout_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("스케줄 등록용 이전 운동 불러오기 실패:", error.message);
        results.push({ memberId, member, workout: null, error: error.message });
      } else {
        results.push({ memberId, member, workout: data?.[0] || null });
      }
    }

    setSchedulePreviousWorkoutList(results);
    setSchedulePreviousWorkoutLoading(false);
  }

  function toggleScheduleBodyPart(part) {
    setScheduleBodyParts((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      if (current.includes(part)) {
        return current.filter((item) => item !== part);
      }
      return [...current, part];
    });
  }

  async function syncScheduleMembers(scheduleId, memberIds = []) {
    if (!scheduleId) return false;

    const { error: deleteError } = await supabase
      .from("schedule_members")
      .delete()
      .eq("schedule_id", scheduleId);

    if (deleteError) {
      alert("그룹PT 참여자 정리 실패: " + deleteError.message + "\nSupabase SQL을 먼저 실행했는지 확인하세요.");
      return false;
    }

    const rows = (memberIds || []).slice(0, 3).map((memberId, index) => ({
      schedule_id: scheduleId,
      member_id: memberId,
      position: index + 1,
    }));

    if (rows.length === 0) return true;

    const { error: insertError } = await supabase.from("schedule_members").insert(rows);

    if (insertError) {
      alert("그룹PT 참여자 저장 실패: " + insertError.message + "\nSupabase SQL을 먼저 실행했는지 확인하세요.");
      return false;
    }

    return true;
  }

  async function addSchedule() {
    const memberIds = getScheduleFormMemberIds();

    const isRepeatMode = scheduleRepeatEnabled && !editingSchedule;

    if (memberIds.length === 0) return alert("회원을 선택하세요.");
    if (!isRepeatMode && !scheduleDate) return alert("날짜를 선택하세요.");
    if (!isRepeatMode && !scheduleStartTime) return alert("시작 시간을 입력하세요.");

    if (scheduleType === "group" && memberIds.length < 2) {
      alert("그룹PT는 최소 2명 이상 선택하세요. 최대 3명까지 등록할 수 있습니다.");
      return;
    }

    if (scheduleType !== "group" && memberIds.length > 1) {
      alert("PT/OT/상담은 회원 1명만 선택하세요. 여러 명 수업은 그룹PT로 등록하세요.");
      return;
    }

    if (memberIds.length > 3) {
      alert("그룹PT는 최대 3명까지만 등록할 수 있습니다.");
      return;
    }

    const scheduleItems = editingSchedule
      ? [{ date: scheduleDate, startTime: scheduleStartTime, bodyParts: Array.isArray(scheduleBodyParts) ? scheduleBodyParts : [] }]
      : getScheduleRepeatItems();

    for (const item of scheduleItems) {
      if (!item.date) return alert("등록할 날짜를 모두 선택하세요.");
      if (!item.startTime) return alert("등록할 시간을 모두 선택하세요.");

      const startMinutes = timeToMinutes(item.startTime);
      const endTime = getAutoScheduleEndTime(item.startTime);
      const endMinutes = timeToMinutes(endTime);

      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        alert("종료 시간은 시작 시간보다 뒤여야 합니다.");
        return;
      }
    }

    const allConflicts = [];

    for (const item of scheduleItems) {
      const startMinutes = timeToMinutes(item.startTime);
      const endTime = getAutoScheduleEndTime(item.startTime);
      const endMinutes = timeToMinutes(endTime);

      const { data: sameDateSchedules, error: checkError } = await supabase
        .from("schedules")
        .select("*, members(*), schedule_members(*, members(*))")
        .eq("schedule_date", item.date)
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

      conflicts.forEach((schedule) => allConflicts.push({ ...schedule, __conflictDate: item.date }));
    }

    if (allConflicts.length > 0) {
      const conflictText = allConflicts
        .map((schedule) => `${formatDate(schedule.__conflictDate || schedule.schedule_date)} · ${formatScheduleRange(schedule)} · ${getScheduleTypeText(schedule.type)} · ${getScheduleMemberNames(schedule)}`)
        .join("\n");

      alert(`이미 해당 시간대에 수업이 있습니다.\n\n${conflictText}\n\n운영 규칙상 1시간에는 수업 1개만 등록할 수 있습니다.`);
      await loadSelectedDateSchedules(scheduleDate);
      return;
    }

    const baseRow = {
      member_id: memberIds[0],
      type: scheduleType,
      memo: cleanScheduleMemoText(scheduleMemo),
      allow_over_capacity: false,
    };

    if (editingSchedule) {
      const item = scheduleItems[0];
      const row = {
        ...baseRow,
        schedule_date: item.date,
        start_time: item.startTime,
        end_time: getAutoScheduleEndTime(item.startTime),
        body_parts: Array.isArray(item.bodyParts) ? item.bodyParts : [],
      };

      const { error } = await supabase
        .from("schedules")
        .update(row)
        .eq("id", editingSchedule.id);

      if (error) {
        alert("스케줄 수정 실패: " + error.message);
        return;
      }

      const ok = await syncScheduleMembers(editingSchedule.id, memberIds);
      if (!ok) return;

      closeScheduleModal();
      await loadSchedules(getTodayDateString());
      await loadSelectedDateSchedules(row.schedule_date);

      if (returnToScheduleCheckAfterAdd) {
        setShowScheduleCheckModal(true);
        await loadScheduleCheckList(row.schedule_date);
      }

      alert("스케줄이 수정되었습니다.");
      return;
    }

    const rows = scheduleItems.map((item) => ({
      ...baseRow,
      schedule_date: item.date,
      start_time: item.startTime,
      end_time: getAutoScheduleEndTime(item.startTime),
      body_parts: Array.isArray(item.bodyParts) ? item.bodyParts : [],
    }));

    const { data: insertedRows, error } = await supabase
      .from("schedules")
      .insert(rows)
      .select();

    if (error) {
      alert("스케줄 저장 실패: " + error.message);
      return;
    }

    for (const inserted of insertedRows || []) {
      const ok = await syncScheduleMembers(inserted.id, memberIds);
      if (!ok) return;
    }

    const shouldReturnToScheduleCheck = returnToScheduleCheckAfterAdd;
    closeScheduleModal();
    await loadSchedules(getTodayDateString());
    await loadScheduleCheckList(rows[0]?.schedule_date || scheduleDate);
    setScheduleCheckDate(rows[0]?.schedule_date || scheduleDate);

    if (shouldReturnToScheduleCheck) {
      setShowScheduleCheckModal(true);
    }

    const savedCount = insertedRows?.length || rows.length;
    alert(savedCount > 1 ? `${savedCount}개 스케줄이 한 번에 저장되었습니다.` : (scheduleType === "group" ? "그룹PT 스케줄이 1개 수업으로 저장되었습니다." : "스케줄이 저장되었습니다."));

    if (insertedRows?.length > 0 && confirm("저장한 스케줄을 기본 캘린더에 추가할까요?")) {
      insertedRows.forEach((inserted) => {
        addToDeviceCalendar({
          ...inserted,
          schedule_members: memberIds.map((memberId, memberIndex) => ({
            member_id: memberId,
            position: memberIndex + 1,
            members: getFreshMember(memberId),
          })),
          members: getFreshMember(memberIds[0]),
        });
      });
    }
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

      await finishScheduleSave(date, "그룹PT 스케줄이 저장되었습니다.", pendingSchedule.rows);
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
    if (showScheduleCheckModal || isMobileEmergencyMode) {
      await loadScheduleCheckList(scheduleCheckDate || schedule.schedule_date || getTodayDateString());
      await loadScheduleCheckMonthList(scheduleCheckDate || schedule.schedule_date || getTodayDateString());
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
      [0, 30].forEach((minute) => {
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
    const memberNames = getScheduleMemberNames(schedule);
    const memberPtText = getScheduleMemberPtText(schedule);

    const start = formatGoogleCalendarDateTime(schedule.schedule_date, schedule.start_time);
    const end = formatGoogleCalendarDateTime(schedule.schedule_date, endTime);

    const title = `${getScheduleTypeText(schedule.type)} · ${memberNames || "회원"}`;
    const details = [
      `Spotainer 스케줄`,
      memberNames ? `회원: ${memberNames}` : "",
      memberPtText ? `PT 잔여: ${memberPtText}` : "",
      getScheduleDisplayMemo(schedule) ? `메모: ${getScheduleDisplayMemo(schedule)}` : "",
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
    const memberNames = getScheduleMemberNames(schedule);
    const memberPtText = getScheduleMemberPtText(schedule);

    const start = formatIcsUtcDateTime(schedule.schedule_date, schedule.start_time);
    const end = formatIcsUtcDateTime(schedule.schedule_date, endTime);
    const nowStamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");

    const title = `${getScheduleTypeText(schedule.type)} · ${memberNames || "회원"}`;
    const details = [
      "Spotainer 스케줄",
      memberNames ? `회원: ${memberNames}` : "",
      memberPtText ? `PT 잔여: ${memberPtText}` : "",
      getScheduleDisplayMemo(schedule) ? `메모: ${getScheduleDisplayMemo(schedule)}` : "",
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

    const fileName = `${getScheduleTypeText(schedule.type)}_${memberNames || "회원"}_${schedule.schedule_date}.ics`
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
    const member = getScheduleMember(schedule);
    if (!member) return alert("연결된 회원 정보를 찾을 수 없습니다.");
    openDetail(member, "menu");
  }

  function getFreshMember(memberId) {
    return members.find((member) => member.id === memberId);
  }

  function getScheduleMembers(schedule) {
    const linked = (schedule?.schedule_members || [])
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((row) => getFreshMember(row.member_id) || row.members)
      .filter(Boolean);

    if (linked.length > 0) return linked;

    const fallback = getFreshMember(schedule?.member_id) || schedule?.members;
    return fallback ? [fallback] : [];
  }

  function getScheduleMember(schedule) {
    return getScheduleMembers(schedule)[0] || null;
  }

  function getScheduleMemberNames(schedule) {
    const names = getScheduleMembers(schedule).map((member) => member.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "회원 정보 없음";
  }

  function getScheduleMemberPtText(schedule) {
    const scheduleMembers = getScheduleMembers(schedule);
    if (scheduleMembers.length === 0) return "";
    if (scheduleMembers.length === 1) return `PT ${scheduleMembers[0].pt_remaining || 0}회`;
    return scheduleMembers.map((member) => `${member.name} PT ${member.pt_remaining || 0}회`).join(" · ");
  }


  function getSchedulePreferenceTags(schedule) {
    const tagSet = new Set();

    getScheduleMembers(schedule).forEach((member) => {
      getOtSummaryTags(member).forEach((tag) => tagSet.add(`OT ${tag}`));
      getPreferenceTags(member).forEach((tag) => tagSet.add(tag));
    });

    return [...tagSet];
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
    const scheduleMembers = getScheduleMembers(schedule);
    const primaryMember = scheduleMembers[0];

    if (!primaryMember) return alert("연결된 회원 정보를 찾을 수 없습니다.");

    const shouldUsePt = schedule.type === "pt" || schedule.type === "group";
    const memberNames = getScheduleMemberNames(schedule);

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
      alert("이미 출석과 PT 차감이 완료되어 완료 처리만 했습니다.");
      return;
    }

    if (shouldUsePt) {
      const noPtMembers = scheduleMembers.filter((member) => (member.pt_remaining || 0) <= 0);
      if (noPtMembers.length > 0) {
        alert(`남은 PT가 없는 회원이 있습니다.\n${noPtMembers.map((member) => member.name).join(", ")}`);
        return;
      }
    }

    if (
      !confirm(
        shouldUsePt
          ? `${memberNames} 수업을 완료 처리할까요?\n참여자 전원 출석 체크와 PT 1회 차감이 함께 진행됩니다.`
          : `${memberNames} ${getScheduleTypeText(schedule.type)} 일정을 완료 처리할까요?\n참여자 전원 출석 체크만 진행되고 PT는 차감하지 않습니다.`
      )
    ) {
      return;
    }

    let insertedAttendanceLogs = [];

    if (!schedule.attendance_checked) {
      const attendanceRows = scheduleMembers.map((member) => ({ member_id: member.id }));
      const { data: attendanceInsertRows, error: attendanceError } = await supabase
        .from("attendance_logs")
        .insert(attendanceRows)
        .select("id");

      if (attendanceError) {
        alert("출석 체크 실패: " + attendanceError.message);
        return;
      }

      insertedAttendanceLogs = attendanceInsertRows || [];
    }

    let insertedPtLogIds = [];

    if (shouldUsePt && !schedule.pt_used) {
      for (const member of scheduleMembers) {
        const { error: memberError } = await supabase
          .from("members")
          .update({ pt_remaining: (member.pt_remaining || 0) - 1 })
          .eq("id", member.id);

        if (memberError) {
          alert(`${member.name} PT 차감 실패: ${memberError.message}`);
          return;
        }

        const { data: insertedPtLog, error: logError } = await supabase
          .from("pt_logs")
          .insert({
            member_id: member.id,
            type: "use",
            amount: 1,
          })
          .select("id")
          .single();

        if (insertedPtLog?.id) insertedPtLogIds.push(insertedPtLog.id);

        if (logError) {
          alert(`${member.name} PT 사용 기록 저장 실패: ${logError.message}`);
          return;
        }
      }

      setLastAction({
        type: "pt",
        scheduleId: schedule.id,
        previousScheduleStatus: schedule.status || "scheduled",
        previousAttendanceChecked: !!schedule.attendance_checked,
        previousPtUsed: !!schedule.pt_used,
        attendanceLogIds: insertedAttendanceLogs?.map((row) => row.id).filter(Boolean) || [],
        ptLogIds: insertedPtLogIds,
        affectedMembers: scheduleMembers.map((member) => ({
          id: member.id,
          previousPt: member.pt_remaining || 0,
        })),
        memberId: primaryMember.id,
        previousPt: primaryMember.pt_remaining || 0,
        memberName: scheduleMembers.length > 1 ? memberNames : primaryMember.name,
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

    setShowScheduleCheckModal(false);

    if (schedule.type === "group" && scheduleMembers.length > 1) {
      setGroupWorkoutFlow(scheduleMembers, 0);
      await moveToGroupWorkoutMember(primaryMember, 0);
      return;
    }

    clearGroupWorkoutFlow();
    await openWorkout(primaryMember, "scheduleCheck");
    setWorkoutMode("add");
  }

  async function markScheduleNoShow(schedule) {
    const scheduleMembers = getScheduleMembers(schedule);
    const shouldUsePt = schedule.type === "pt" || schedule.type === "group";
    const memberNames = getScheduleMemberNames(schedule);

    if (scheduleMembers.length === 0) return alert("연결된 회원 정보를 찾을 수 없습니다.");

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

    const noPtMembers = scheduleMembers.filter((member) => (member.pt_remaining || 0) <= 0);
    if (noPtMembers.length > 0) {
      alert(`남은 PT가 없는 회원이 있습니다.\n${noPtMembers.map((member) => member.name).join(", ")}`);
      return;
    }

    if (
      !confirm(
        `${memberNames} 노쇼 처리할까요?\n그룹PT는 참여자 중 한 명이라도 불참하면 수업 자체가 진행되지 않는 기준으로 처리합니다.\n출석은 기록하지 않고 참여자 전원 PT 1회만 차감됩니다.`
      )
    ) {
      return;
    }

    let insertedPtLogIds = [];

    if (!schedule.pt_used) {
      for (const member of scheduleMembers) {
        const { error: memberError } = await supabase
          .from("members")
          .update({ pt_remaining: (member.pt_remaining || 0) - 1 })
          .eq("id", member.id);

        if (memberError) {
          alert(`${member.name} PT 차감 실패: ${memberError.message}`);
          return;
        }

        const { data: insertedPtLog, error: logError } = await supabase
          .from("pt_logs")
          .insert({
            member_id: member.id,
            type: "use",
            amount: 1,
          })
          .select("id")
          .single();

        if (insertedPtLog?.id) insertedPtLogIds.push(insertedPtLog.id);

        if (logError) {
          alert(`${member.name} PT 사용 기록 저장 실패: ${logError.message}`);
          return;
        }
      }

      setLastAction({
        type: "pt",
        scheduleId: schedule.id,
        previousScheduleStatus: schedule.status || "scheduled",
        previousAttendanceChecked: !!schedule.attendance_checked,
        previousPtUsed: !!schedule.pt_used,
        attendanceLogIds: [],
        ptLogIds: insertedPtLogIds,
        affectedMembers: scheduleMembers.map((member) => ({
          id: member.id,
          previousPt: member.pt_remaining || 0,
        })),
        memberId: scheduleMembers[0].id,
        previousPt: scheduleMembers[0].pt_remaining || 0,
        memberName: scheduleMembers.length > 1 ? memberNames : scheduleMembers[0].name,
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
  }

  async function markScheduleCancelled(schedule) {
    const memberName = getScheduleMemberNames(schedule) || "해당 회원";

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


  function getScheduleSelectableMembers(excludedIds = []) {
    const excludedSet = new Set(excludedIds.filter(Boolean));

    return activeMembers.filter((member) => {
      if (excludedSet.has(member.id)) return false;

      if (scheduleType === "group") {
        return member.member_type === "group";
      }

      return true;
    });
  }

  function getScheduleMemberSelectHint() {
    if (scheduleType === "group") {
      return "그룹PT는 그룹PT회원만 최대 3명까지 선택할 수 있습니다.";
    }

    return "PT/OT/상담은 전체 활성 회원 중에서 선택할 수 있습니다.";
  }

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

  function getDetailPtPillStyle(pt) {
    if (pt <= 2) return styles.detailPtPillDanger;
    if (pt <= 5) return styles.detailPtPillWarning;
    return styles.detailPtPillGood;
  }

  function getPtStatus(member) {
    const pt = member.pt_remaining || 0;
    if (pt <= 2) return { text: "강한 경고", style: styles.dangerBadge };
    if (pt >= 3 && pt <= 5) return { text: "재등록 상담", style: styles.ptBadge };
    return null;
  }

  function getReRegisterAlert(member) {
    if (!member) return null;

    const pt = Number(member.pt_remaining || 0);

    if (pt <= 1) {
      return {
        level: "urgent",
        title: "재등록 최우선",
        text: `PT ${pt}회 남음 · 오늘 상담 권장`,
      };
    }

    if (pt <= 3) {
      return {
        level: "strong",
        title: "재등록 권유",
        text: `PT ${pt}회 남음 · 다음 이용권 안내 필요`,
      };
    }

    if (pt <= 5) {
      return {
        level: "soft",
        title: "재등록 상담",
        text: `PT ${pt}회 남음 · 자연스럽게 상담 시작`,
      };
    }

    return null;
  }

  function isReRegisterTarget(member) {
    return !!getReRegisterAlert(member);
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


  const todaySmsPendingSchedules = getTodaySMSTargets().sort((a, b) => {
    const aTime = normalizeTimeValue(a.start_time || "");
    const bTime = normalizeTimeValue(b.start_time || "");
    return aTime.localeCompare(bTime);
  });

  const urgentReRegisterMembers = activeMembers
    .filter((member) => shouldShowForContact(member) && (member.pt_remaining || 0) <= 2)
    .sort((a, b) => (a.pt_remaining || 0) - (b.pt_remaining || 0));

  const softReRegisterMembers = activeMembers
    .filter((member) => {
      const pt = member.pt_remaining || 0;
      return shouldShowForContact(member) && pt >= 3 && pt <= 5;
    })
    .sort((a, b) => (a.pt_remaining || 0) - (b.pt_remaining || 0));

  const dormantTodoMembers = attentionList
    .filter((member) => member.attendanceStatus || member.followUpStatus)
    .filter((member) => !urgentReRegisterMembers.some((m) => m.id === member.id))
    .filter((member) => !softReRegisterMembers.some((m) => m.id === member.id))
    .slice(0, 8);

  const todayTodoItems = [
    ...urgentReRegisterMembers.map((member) => ({
      key: `urgent-${member.id}`,
      type: "member",
      member,
      badge: "강한 권유",
      title: member.name,
      desc: `PT ${member.pt_remaining || 0}회 남음 · 수업 후 바로 상담`,
      tone: "danger",
      actionText: "회원 보기",
    })),
    ...todaySmsPendingSchedules.map((schedule) => {
      const member = getScheduleMember(schedule) || schedule.members;
      return {
        key: `sms-${schedule.id}`,
        type: "sms",
        schedule,
        member,
        badge: "문자 미발송",
        title: member?.name || "회원 정보 없음",
        desc: `${formatScheduleRange(schedule)} · 수업 안내/컨디션 확인`,
        tone: "sms",
        actionText: "문자 큐",
      };
    }),
    ...softReRegisterMembers.map((member) => ({
      key: `rejoin-${member.id}`,
      type: "member",
      member,
      badge: "재등록 상담",
      title: member.name,
      desc: `PT ${member.pt_remaining || 0}회 남음 · 자연스럽게 상담`,
      tone: "warn",
      actionText: "회원 보기",
    })),
    ...dormantTodoMembers.map((member) => ({
      key: `dormant-${member.id}`,
      type: "member",
      member,
      badge: member.followUpStatus || member.attendanceStatus || "연락 필요",
      title: member.name,
      desc: member.phone || "전화번호 없음",
      tone: "neutral",
      actionText: "회원 보기",
    })),
  ].slice(0, 12).map((item) => ({
    ...item,
    done: Boolean(completedTodayTodoKeys[item.key]),
  }));

  const pendingTodayTodoItems = todayTodoItems.filter((item) => !item.done);
  const doneTodayTodoItems = todayTodoItems.filter((item) => item.done);

  function markTodayTodoDone(item) {
    if (!item?.key) return;

    setCompletedTodayTodoKeys((prev) => ({
      ...prev,
      [item.key]: true,
    }));
  }

  function openTodayTodoContact(item, defaultResult = "pending") {
    if (!item?.member) return;

    setActiveTodayTodoKey(item.key);
    openContactModal(item.member, defaultResult);
  }

  function openTodayTodoFreeSms(item) {
    if (!item?.member) return;

    setActiveTodayTodoKey(item.key);
    sendFreeMemberSMS(item.member);
  }

  async function sendTodayTodoScheduleSMS(item) {
    if (!item?.schedule) return;

    await sendScheduleSMS(item.schedule);
    markTodayTodoDone(item);
  }

  function openTodayTodoItem(item) {
    if (!item) return;

    if (item.type === "sms" && item.schedule) {
      setSmsQueue([item.schedule]);
      setSmsIndex(0);
      setSmsMode(true);
      return;
    }

    if (item.member) {
      openDetail(item.member, "menu");
    }
  }

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
      member_stage: memberStage,
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
    setMemberStage("pt");
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
    setEditMemberStage(member.member_stage || (member.is_active === false ? "inactive" : "pt"));
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
    setEditMemberStage("pt");
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
        member_stage: editMemberStage,
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
        member_stage: editMemberStage,
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
      .update({ is_active: false, member_stage: "inactive" })
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
      .update({ is_active: true, member_stage: member.member_stage === "inactive" ? "pt" : (member.member_stage || "pt") })
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

    const affectedMembers = lastAction.affectedMembers?.length
      ? lastAction.affectedMembers
      : [{ id: lastAction.memberId, previousPt: lastAction.previousPt }];

    for (const item of affectedMembers) {
      if (!item?.id && !item?.memberId) continue;
      await supabase
        .from("members")
        .update({ pt_remaining: item.previousPt })
        .eq("id", item.id || item.memberId);
    }

    if (lastAction.ptLogIds?.length) {
      await supabase
        .from("pt_logs")
        .update({ is_cancelled: true, cancelled_at: new Date().toISOString() })
        .in("id", lastAction.ptLogIds);
    }

    if (lastAction.attendanceLogIds?.length) {
      await supabase
        .from("attendance_logs")
        .update({ is_cancelled: true, cancelled_at: new Date().toISOString() })
        .in("id", lastAction.attendanceLogIds);
    }

    if (lastAction.scheduleId) {
      await supabase
        .from("schedules")
        .update({
          status: lastAction.previousScheduleStatus || "scheduled",
          attendance_checked: !!lastAction.previousAttendanceChecked,
          pt_used: !!lastAction.previousPtUsed,
        })
        .eq("id", lastAction.scheduleId);
    }

    setLastAction(null);
    await loadMembers();
    await loadSchedules(getTodayDateString());
    if (showScheduleCheckModal) {
      await loadScheduleCheckList(scheduleCheckDate);
    }
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
    setActiveTodayTodoKey(null);
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

    if (activeTodayTodoKey) {
      setCompletedTodayTodoKeys((prev) => ({
        ...prev,
        [activeTodayTodoKey]: true,
      }));
      setActiveTodayTodoKey(null);
    }

    closeContactModal();
    await loadMembers();
  }

  function normalizePhone(phone) {
    return String(phone || "").replace(/[^0-9+]/g, "");
  }

  function buildScheduleSMSMessage(schedule) {
    const dateText = schedule?.schedule_date ? formatDate(schedule.schedule_date) : "오늘";
    const timeText = formatScheduleRange(schedule || {});
    const typeText = getScheduleTypeText(schedule?.type);

    return `[스포테이너]
${dateText} ${timeText} ${typeText} 수업 예약되어 있습니다.

오늘 몸상태나 컨디션 어떠세요?
불편한 부위 있으면 미리 알려주세요.

늦지 않게 방문해주세요 😊`;
  }

  function makeSMSQueueItemsFromSchedule(schedule, onlyUnsent = true) {
    const membersForSMS = getScheduleSMSMembers(schedule).filter((member) => normalizePhone(member?.phone));
    const targets = onlyUnsent
      ? membersForSMS.filter((member) => !isScheduleMemberSMSSent(schedule, member))
      : membersForSMS;

    return targets.map((member) => ({
      schedule,
      member,
      key: `${schedule?.id || "schedule"}:${member?.id || member?.phone || "member"}`,
    }));
  }

  function startScheduleSMSQueue(schedule) {
    if (!schedule?.id) {
      alert("스케줄 정보를 찾을 수 없습니다.");
      return;
    }

    let queueItems = makeSMSQueueItemsFromSchedule(schedule, true);

    if (queueItems.length === 0) {
      const allItems = makeSMSQueueItemsFromSchedule(schedule, false);

      if (allItems.length === 0) {
        alert("문자 보낼 회원 정보나 전화번호를 찾을 수 없습니다.");
        return;
      }

      const resend = confirm(`이 스케줄 참여자 ${allItems.length}명은 오늘 문자 완료 기록이 있습니다.
그래도 다시 문자 큐를 열까요?`);
      if (!resend) return;
      queueItems = allItems;
    }

    setSmsQueue(queueItems);
    setSmsIndex(0);
    setSmsMode(true);

    if (queueItems.length > 1) {
      alert(`그룹PT 문자는 자동 연속 발송하지 않습니다.

1) 문자 보내기
2) 문자앱에서 직접 전송
3) Spotainer로 돌아오기
4) 보낸 처리

이 순서로 ${queueItems.length}명에게 한 명씩 진행하세요.`);
    }
  }

  async function sendScheduleSMS(schedule) {
    startScheduleSMSQueue(schedule);
  }

  async function sendMobileScheduleSMS(schedule, member) {
    const membersForSMS = getScheduleSMSMembers(schedule);
    const targetMember = member || membersForSMS[0] || getScheduleMember(schedule) || schedule.members;
    const phone = normalizePhone(targetMember?.phone);

    if (!targetMember) {
      alert("연결된 회원 정보를 찾을 수 없습니다.");
      return;
    }

    if (!phone) {
      alert(`${targetMember.name || "회원"} 회원의 전화번호가 없습니다.`);
      return;
    }

    if (isScheduleMemberSMSSent(schedule, targetMember)) {
      const resend = confirm(`${targetMember.name || "회원"} 회원에게 오늘 이미 문자를 보낸 기록이 있습니다.
그래도 다시 문자앱을 열까요?`);
      if (!resend) return;
    }

    await saveScheduleSMSLog(schedule, `모바일 긴급모드 문자 - ${targetMember.name || "회원"}`, targetMember);

    const message = buildScheduleSMSMessage(schedule);
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  }

  function getTodaySMSTargets() {
    const today = getTodayDateString();

    return (schedules || []).filter((schedule) => {
      if (schedule.schedule_date !== today) return false;
      if (schedule.status === "cancelled") return false;
      if (schedule.status === "completed") return false;
      if (schedule.status === "noshow") return false;

      const membersForSMS = getScheduleSMSMembers(schedule);
      const hasUnsentMemberWithPhone = membersForSMS.some((member) => {
        const phone = normalizePhone(member?.phone);
        return member && phone && !isScheduleMemberSMSSent(schedule, member);
      });

      return hasUnsentMemberWithPhone;
    });
  }

  function startTodaySMSQueue() {
    const targets = getTodaySMSTargets().sort((a, b) => {
      const aTime = normalizeTimeValue(a.start_time || "");
      const bTime = normalizeTimeValue(b.start_time || "");
      return aTime.localeCompare(bTime);
    });

    const queueItems = targets.flatMap((schedule) => makeSMSQueueItemsFromSchedule(schedule, true));

    if (queueItems.length === 0) {
      alert("문자 보낼 오늘 스케줄이 없습니다.\n이미 보낸 대상, 취소/완료/노쇼, 전화번호 없는 회원은 제외됩니다.");
      return;
    }

    setSmsQueue(queueItems);
    setSmsIndex(0);
    setSmsMode(true);
  }

  function stopTodaySMSQueue() {
    setSmsMode(false);
    setSmsQueue([]);
    setSmsIndex(0);
  }

  function getCurrentSMSItem() {
    return smsQueue[smsIndex] || null;
  }

  function getCurrentSMSSchedule() {
    const item = getCurrentSMSItem();
    return item?.schedule || item || null;
  }

  function getCurrentSMSTargetMember(schedule) {
    const item = getCurrentSMSItem();
    if (item?.member) return item.member;

    if (!schedule) return null;
    const unsentMembers = getUnsentScheduleSMSMembers(schedule).filter((member) => normalizePhone(member?.phone));
    if (unsentMembers.length > 0) return unsentMembers[0];
    return getScheduleSMSMembers(schedule).find((member) => normalizePhone(member?.phone)) || null;
  }

  function sendCurrentScheduleSMS() {
    const schedule = getCurrentSMSSchedule();
    const member = getCurrentSMSTargetMember(schedule);
    const phone = normalizePhone(member?.phone);

    if (!schedule || !member || !phone) {
      alert("현재 문자 보낼 대상을 찾을 수 없습니다.");
      return;
    }

    if (isScheduleMemberSMSSent(schedule, member)) {
      const resend = confirm(`${member.name || "회원"} 회원에게 오늘 이미 문자를 보낸 기록이 있습니다.
그래도 다시 문자앱을 열까요?`);
      if (!resend) return;
    }

    const message = buildScheduleSMSMessage(schedule);
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  }

  async function markCurrentSMSSentAndNext() {
    const schedule = getCurrentSMSSchedule();
    const member = getCurrentSMSTargetMember(schedule);

    if (schedule?.id && member?.id) {
      const ok = await saveScheduleSMSLog(schedule, `문자 큐 보낸 처리 - ${member.name || "회원"}`, member);
      if (!ok) return;
    }

    if (smsIndex + 1 >= smsQueue.length) {
      alert("문자 큐가 끝났습니다.");
      stopTodaySMSQueue();
      return;
    }

    setSmsIndex((prev) => prev + 1);
  }

  function skipCurrentSMS() {
    if (smsIndex + 1 >= smsQueue.length) {
      stopTodaySMSQueue();
      return;
    }

    setSmsIndex((prev) => prev + 1);
  }

  function isWithinDays(dateText, dayCount) {
    if (!dateText) return false;

    const target = new Date(dateText);
    if (Number.isNaN(target.getTime())) return false;

    const now = new Date();
    const diffDays = (now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= dayCount;
  }

  function hasRecentClassForFeedback(member) {
    return isWithinDays(member?.latest_pt, 7) || isWithinDays(member?.latest_visit, 7);
  }

  function hasRecentMemberContact(member) {
    return isWithinDays(member?.last_contacted_at, 3);
  }

  function shouldRecommendFeedback(member) {
    return hasRecentClassForFeedback(member) && !hasRecentMemberContact(member);
  }

  async function markMemberContacted(member, noteText = "문자 발송") {
    if (!member?.id) return;

    const now = new Date().toISOString();
    const nextDate = addDaysDateString(3);

    await supabase
      .from("members")
      .update({
        last_contacted_at: now,
        last_contact_result: "pending",
        next_contact_date: nextDate,
        contact_note: noteText,
      })
      .eq("id", member.id);

    setMembers((prev) =>
      (prev || []).map((m) =>
        m.id === member.id
          ? {
              ...m,
              last_contacted_at: now,
              last_contact_result: "pending",
              next_contact_date: nextDate,
              contact_note: noteText,
            }
          : m
      )
    );
  }

  function getExerciseSummaryFromSession(session) {
    const names = Array.from(
      new Set(
        (session?.workout_sets || [])
          .map((set) => String(set.exercise_name || "").trim())
          .filter(Boolean)
      )
    );

    if (names.length === 0) return "운동";
    return `${names.slice(0, 3).join(", ")}${names.length > 3 ? ` 외 ${names.length - 3}개` : ""}`;
  }

  async function getLatestWorkoutSessionForMember(memberId) {
    if (!memberId) return null;

    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*, workout_sets(*)")
      .eq("member_id", memberId)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("최근 운동기록 불러오기 실패:", error.message);
      return null;
    }

    return data?.[0] || null;
  }

  
/*
[빠른기능 피드백 버튼 수정]
회원카드 빠른기능의 피드백 버튼도 운동기록 저장 후 피드백과 동일한 generateWorkoutFeedbackMessage() 로직을 사용합니다.
기존 구버전 문구인 "수업 받으시느라", "체크하면서 진행했고", "방향으로 이어가볼게요" 계열 문장은 더 이상 빠른기능 피드백에서 사용하지 않습니다.
*/

function generateMemberCardFeedbackMessage(member, session) {
    if (!session) return "";

    return generateWorkoutFeedbackMessage({
      member,
      trainingType: session.workout_type || session.training_type || "weight",
      bodyParts: Array.isArray(session.body_parts) ? session.body_parts : [],
      condition: session.condition || "normal",
      issue: session.issue || "",
      nextPlan: session.next_plan || "",
      trainerNote: session.trainer_note || "",
      memo: session.memo || "",
      exercises: Array.from(
        new Set(
          (session.workout_sets || [])
            .map((set) => String(set.exercise_name || "").trim())
            .filter(Boolean)
        )
      ).map((name) => ({ name })),
    });
  }

  async function openMemberCardFeedback(member) {
    if (!member) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      const latestWorkout = await getLatestWorkoutSessionForMember(member.id);

      if (!latestWorkout) {
        alert(`${member.name || "회원"} 회원의 최근 운동기록이 없어 피드백 초안을 만들 수 없습니다.\n운동기록 저장 후 사용하세요.`);
        return;
      }

      const draft = generateMemberCardFeedbackMessage(member, latestWorkout);
      openFeedbackModal(member, draft, {
        member,
        trainingType: latestWorkout.workout_type || latestWorkout.training_type || "weight",
        bodyParts: Array.isArray(latestWorkout.body_parts) ? latestWorkout.body_parts : [],
        condition: latestWorkout.condition || "normal",
        issue: latestWorkout.issue || "",
        nextPlan: latestWorkout.next_plan || "",
        trainerNote: latestWorkout.trainer_note || "",
        memo: latestWorkout.memo || "",
        exercises: Array.from(
          new Set(
            (latestWorkout.workout_sets || [])
              .map((set) => String(set.exercise_name || "").trim())
              .filter(Boolean)
          )
        ).map((name) => ({ name })),
      });
    } catch (error) {
      console.error("빠른기능 피드백 열기 실패:", error);
      alert("피드백 초안을 여는 중 오류가 발생했습니다. 최근 운동기록을 확인해주세요.");
    }
  }

  async function sendConditionCheckSMS(member) {
    const phone = normalizePhone(member?.phone);

    if (!member) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    if (!phone) {
      alert(`${member.name || "회원"} 회원의 전화번호가 없습니다.`);
      return;
    }

    const message = `${member.name || "회원"}님 오늘 몸상태나 컨디션 어떠세요? 😊\n불편한 부위나 컨디션 있으면 미리 알려주세요!`;

    if (!confirm(`${member.name || "회원"} 회원에게 컨디션 확인 문자를 보낼까요?\n\n확인을 누르면 문자앱이 열리고, 직접 전송 버튼을 눌러야 발송됩니다.`)) {
      return;
    }

    await markMemberContacted(member, "컨디션 확인 문자");
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  }


  function sendFreeMemberSMS(member) {
    if (!member) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    const phone = normalizePhone(member?.phone);
    if (!phone) {
      alert(`${member.name || "회원"} 회원의 전화번호가 없습니다.`);
      return;
    }

    closeMemberActionMenu();
    setFreeSmsModalMember(member);
    setFreeSmsDraft("");
  }

  function closeFreeSmsModal() {
    setFreeSmsModalMember(null);
    setFreeSmsDraft("");
    setActiveTodayTodoKey(null);
  }

  async function sendFreeSmsDraft() {
    const phone = normalizePhone(freeSmsModalMember?.phone);

    if (!freeSmsModalMember) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    if (!phone) {
      alert(`${freeSmsModalMember.name || "회원"} 회원의 전화번호가 없습니다.`);
      return;
    }

    const message = String(freeSmsDraft || "").trim();
    if (!message) {
      alert("보낼 문자를 입력하세요.");
      return;
    }

    const targetPhone = phone;
    const targetMessage = message;

    await markMemberContacted(freeSmsModalMember, "일반 문자");
    closeFreeSmsModal();
    closeMemberActionMenu();
    window.location.href = `sms:${targetPhone}?body=${encodeURIComponent(targetMessage)}`;
  }

  function sendReRegisterSMS(member) {
    const phone = normalizePhone(member?.phone);

    if (!member) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    if (!phone) {
      alert(`${member.name || "회원"} 회원의 전화번호가 없습니다.`);
      return;
    }

    const message = `[스포테이너]
${member.name || "회원"}님, 수업 잘 따라오고 계세요 😊

현재 프로그램 흐름이 좋아서
남은 횟수 안에 다음 목표까지 이어가면 더 좋은 결과를 기대할 수 있습니다.

편하실 때 다음 이용권 상담 도와드릴게요!`;

    if (!confirm(`${member.name || "회원"} 회원에게 재등록 권유 문자를 보낼까요?

확인을 누르면 문자앱이 열리고, 직접 전송 버튼을 눌러야 발송됩니다.`)) {
      return;
    }

    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
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


  function parsePreferenceValue(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  return String(value)
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyPreferenceValue(value) {
  if (!Array.isArray(value)) return value || null;
  return value.length > 0 ? value.join("||") : null;
}
function getPreferenceTags(member) {
  const tags = [];

  const intensity = String(member?.preference_intensity || "");
  const communication = String(member?.preference_communication_style || "");
  const touch = String(member?.preference_touch_style || "");
  const management = String(member?.preference_management_style || "");
  const mood = String(member?.preference_class_mood || "");

  const allText = [intensity, communication, touch, management, mood].join(" ");

  // 운동 강도/리드 방식
  if (allText.includes("강하게") || allText.includes("확실하게")) {
    tags.push("강도선호");
  }

  // 전체 분위기/대화 성향
  if (
    allText.includes("밝고 편") ||
    allText.includes("편한 분위기") ||
    allText.includes("가볍게 대화")
  ) {
    tags.push("활발형");
  }

  if (
    allText.includes("차분하게") ||
    allText.includes("운동에 집중") ||
    allText.includes("필요한 설명")
  ) {
    tags.push("차분형");
  }

  if (allText.includes("먼저 물어")) {
    tags.push("먼저체크");
  }

  // 터치는 괜찮은 경우는 표시하지 않고 주의가 필요한 경우만 표시
  if (touch.includes("최소한") || touch.includes("미리 설명")) {
    tags.push("터치최소");
  }

  if (touch.includes("불편") || touch.includes("터치 없이")) {
    tags.push("터치금지");
  }

  // 관리 스타일
  if (management.includes("꼼꼼") || management.includes("식단") || management.includes("생활습관")) {
    tags.push("꼼꼼관리");
  }

  if (management.includes("적당히") || management.includes("필요한 부분")) {
    tags.push("적당관리");
  }

  if (management.includes("운동에만 집중") || management.includes("간섭")) {
    tags.push("운동집중");
  }

  // 컨디션 기반 수업 조절
  if (mood.includes("컨디션") || mood.includes("조절")) {
    tags.push("컨디션체크");
  }

  return [...new Set(tags)];
}

function getAllowedPreferenceValues(key) {
  const map = {
    preference_intensity: [
      "강하게 밀어주세요 (운동할 땐 확실하게 하는 게 좋아요)",
      "부드럽고 편하게 해주세요 (칭찬과 격려가 편해요)",
      "천천히 맞춰주세요 (부담 없이 운동하고 싶어요)",
    ],
    preference_management_style: [
      "꼼꼼하게 관리해주세요 (식단, 생활습관도 같이 체크받고 싶어요)",
      "적당히 체크만 해주세요 (필요한 부분만 편하게 관리받고 싶어요)",
      "운동에만 집중하고 싶어요 (간섭은 최소한이 좋아요)",
    ],
    preference_touch_style: [
      "괜찮아요 (자세 잡을 때 필요한 터치는 괜찮아요)",
      "가능하지만 최소한으로 해주세요 (미리 설명해주면 좋아요)",
      "조금 불편해요 (터치 없이 설명해주세요)",
    ],
    preference_communication_style: [
      "편한 분위기로 운동하고 싶어요 (가볍게 대화하는 건 괜찮아요)",
      "운동에 집중하는 분위기가 좋아요 (필요한 설명 위주가 편해요)",
      "먼저 물어봐주시면 편해요 (제가 먼저 말하는 건 조금 어려워요)",
    ],
    preference_class_mood: [
      "밝고 편한 분위기가 좋아요",
      "차분하게 운동하는 분위기가 좋아요",
      "컨디션에 맞춰 조절해주세요",
    ],
  };

  return map[key] || [];
}
function togglePreferenceValue(currentValues, nextValue) {
  if (!Array.isArray(currentValues)) currentValues = parsePreferenceValue(currentValues);

  if (currentValues.includes(nextValue)) {
    return currentValues.filter((item) => item !== nextValue);
  }

  return [...currentValues, nextValue];
}

const otCheckSections = [
  {
    key: "ot_experience",
    title: "1️⃣ 운동 경험이 있으신가요?",
    options: [
      "운동이 거의 처음이에요",
      "헬스장은 다녀봤어요",
      "PT 받아본 적 있어요",
      "꾸준히 운동했던 적 있어요",
    ],
  },
  {
    key: "ot_concerns",
    title: "2️⃣ 운동 시작하면서 가장 걱정되는 부분은 어떤건가요?",
    options: [
      "체력이 너무 없어요",
      "자세를 잘 모르겠어요",
      "운동기구가 어렵고 낯설어요",
      "혼자하면 꾸준히 못할 것 같아요",
      "통증이나 불편한 부위가 있어요",
      "운동 강도가 걱정돼요",
      "딱히 걱정은 없어요",
    ],
  },
  {
    key: "ot_pain_parts",
    title: "3️⃣ 현재 가장 불편하거나 신경쓰이는 부위가 있으신가요?",
    options: [
      "목/승모",
      "어깨",
      "허리",
      "무릎",
      "손목",
      "발목",
      "골반/고관절",
      "딱히 없어요",
    ],
  },
  {
    key: "ot_condition",
    title: "4️⃣ 평소 몸 상태는 어떤 편인가요?",
    options: [
      "자주 피곤한 편이에요",
      "몸이 잘 붓는 편이에요",
      "어깨나 목이 자주 뭉쳐요",
      "체력이 빨리 떨어지는 편이에요",
      "잠을 푹 못자는 편이에요",
      "해당사항 없어요",
    ],
  },
  {
    key: "ot_workout_style",
    title: "5️⃣ 운동할 때 어떤 스타일이 편하세요?",
    options: [
      "천천히 자세 위주로 하고 싶어요",
      "분위기 편하게 재밌게 하고 싶어요",
      "어느정도 힘든 느낌이 좋아요",
      "설명을 자세히 들으면서 하고 싶어요",
      "일단 몸부터 움직이는 스타일이 좋아요",
    ],
  },
  {
    key: "ot_touch_style",
    title: "6️⃣ 운동 중 자세를 잡아드릴 때 어떤 스타일이 편하세요?",
    options: [
      "직접 자세를 잡아주는게 편해요",
      "필요한 경우만 가볍게 터치해주는게 좋아요",
      "터치는 최소한으로 해주셨으면 좋겠어요",
      "말로 설명해주는 방식이 더 편해요",
    ],
  },
  {
    key: "ot_goals",
    title: "7️⃣ 운동을 통해 가장 바꾸고 싶은 부분은 무엇인가요?",
    options: [
      "체력 증가",
      "다이어트",
      "자세/체형 교정",
      "근력 증가",
      "통증 완화",
      "라인 관리",
      "생활습관 개선",
    ],
  },
  {
    key: "ot_pt_expectations",
    title: "8️⃣ PT를 받게 된다면 어떤 부분을 가장 기대하시나요?",
    options: [
      "혼자보다 꾸준히 운동하는 것",
      "자세를 정확히 배우는 것",
      "체형이나 몸 변화",
      "운동 습관 만들기",
      "체력/컨디션 관리",
      "식단이나 생활관리 도움",
    ],
  },
  {
    key: "ot_trainer_style",
    title: "9️⃣ 트레이너가 어떤 스타일이면 좋으세요?",
    options: [
      "차분하게 설명 잘해주는 스타일",
      "편하게 대화 가능한 스타일",
      "동기부여 많이 해주는 스타일",
      "꼼꼼하게 체크해주는 스타일",
      "운동 분위기를 잘 만들어주는 스타일",
    ],
  },
];

function getOtCheckState(key) {
  const map = {
    ot_experience: otExperience,
    ot_concerns: otConcerns,
    ot_pain_parts: otPainParts,
    ot_condition: otCondition,
    ot_workout_style: otWorkoutStyle,
    ot_touch_style: otTouchStyle,
    ot_goals: otGoals,
    ot_pt_expectations: otPtExpectations,
    ot_trainer_style: otTrainerStyle,
  };

  return map[key] || [];
}

function setOtCheckState(key, updater) {
  const map = {
    ot_experience: setOtExperience,
    ot_concerns: setOtConcerns,
    ot_pain_parts: setOtPainParts,
    ot_condition: setOtCondition,
    ot_workout_style: setOtWorkoutStyle,
    ot_touch_style: setOtTouchStyle,
    ot_goals: setOtGoals,
    ot_pt_expectations: setOtPtExpectations,
    ot_trainer_style: setOtTrainerStyle,
  };

  const setter = map[key];
  if (setter) setter(updater);
}

function fillOtCheckForm(member) {
  setOtExperience(parsePreferenceValue(member?.ot_experience));
  setOtConcerns(parsePreferenceValue(member?.ot_concerns));
  setOtPainParts(parsePreferenceValue(member?.ot_pain_parts));
  setOtCondition(parsePreferenceValue(member?.ot_condition));
  setOtWorkoutStyle(parsePreferenceValue(member?.ot_workout_style));
  setOtTouchStyle(parsePreferenceValue(member?.ot_touch_style));
  setOtGoals(parsePreferenceValue(member?.ot_goals));
  setOtPtExpectations(parsePreferenceValue(member?.ot_pt_expectations));
  setOtTrainerStyle(parsePreferenceValue(member?.ot_trainer_style));
}

function getOtCheckPayload() {
  return {
    ot_experience: stringifyPreferenceValue(otExperience),
    ot_concerns: stringifyPreferenceValue(otConcerns),
    ot_pain_parts: stringifyPreferenceValue(otPainParts),
    ot_condition: stringifyPreferenceValue(otCondition),
    ot_workout_style: stringifyPreferenceValue(otWorkoutStyle),
    ot_touch_style: stringifyPreferenceValue(otTouchStyle),
    ot_goals: stringifyPreferenceValue(otGoals),
    ot_pt_expectations: stringifyPreferenceValue(otPtExpectations),
    ot_trainer_style: stringifyPreferenceValue(otTrainerStyle),
    ot_check_updated_at: new Date().toISOString(),
  };
}

function getOtSummaryTags(member) {
  const tags = [];
  const painParts = parsePreferenceValue(member?.ot_pain_parts).filter((item) => item !== "딱히 없어요");
  const concerns = parsePreferenceValue(member?.ot_concerns).filter((item) => item !== "딱히 걱정은 없어요");
  const workoutStyle = parsePreferenceValue(member?.ot_workout_style);
  const touchStyle = parsePreferenceValue(member?.ot_touch_style);
  const condition = parsePreferenceValue(member?.ot_condition).filter((item) => item !== "해당사항 없어요");

  painParts.slice(0, 2).forEach((item) => tags.push(`${item} 주의`));
  if (concerns.some((item) => item.includes("체력"))) tags.push("체력걱정");
  if (concerns.some((item) => item.includes("자세"))) tags.push("자세걱정");
  if (workoutStyle.some((item) => item.includes("자세 위주"))) tags.push("자세위주");
  if (workoutStyle.some((item) => item.includes("설명"))) tags.push("설명선호");
  if (touchStyle.some((item) => item.includes("최소한") || item.includes("말로 설명"))) tags.push("터치주의");
  if (condition.some((item) => item.includes("피곤") || item.includes("붓") || item.includes("잠"))) tags.push("컨디션체크");

  return [...new Set(tags)].slice(0, 6);
}

function buildOtCheckSmsMessage(member) {
  const memberId = member?.id ? encodeURIComponent(member.id) : "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const link = memberId ? `${baseUrl}/?otCheck=${memberId}` : `${baseUrl}/`;

  return `안녕하세요! 스포테이너 피트니스 팀장 김선수 입니다 😌

OT수업 전에 회원님의 운동 스타일과 운동 목적을 확인하고 컨디션에 맞춰 수업을 진행하고자 합니다.
보다 편안하고 만족도 높은 수업 진행을 위해 체크 부탁드릴게요 :)

부담없이 편하게 작성해주세요~!

${link}`;
}

function sendOtCheckSms(member) {
  if (!member?.phone) {
    alert("회원 전화번호가 없어요.");
    return;
  }

  const phone = String(member.phone).replace(/[^0-9]/g, "");
  const message = buildOtCheckSmsMessage(member);
  window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
}

async function saveOtCheck() {
  if (!selectedMember) return;

  const payload = getOtCheckPayload();

  const { data, error } = await supabase
    .from("members")
    .update(payload)
    .eq("id", selectedMember.id)
    .select("*")
    .single();

  if (error) {
    alert("OT 성향체크 저장 실패: " + error.message + "\n\n처음 적용하는 경우 Supabase members 테이블에 OT 성향체크 컬럼을 먼저 추가해야 해요.");
    return;
  }

  setSelectedMember(data || { ...selectedMember, ...payload });
  setMembers((prev) =>
    prev.map((member) =>
      member.id === selectedMember.id ? { ...member, ...(data || payload) } : member
    )
  );

  alert("OT 성향체크가 저장되었어요.");
  setDetailMode("menu");
}

async function savePublicOtCheck() {
  if (!publicOtCheckMemberId) return;

  setPublicOtCheckSaving(true);
  setPublicOtCheckError("");

  const payload = getOtCheckPayload();

  const { data, error } = await supabase
    .from("members")
    .update(payload)
    .eq("id", publicOtCheckMemberId)
    .select("id,name,ot_experience,ot_concerns,ot_pain_parts,ot_condition,ot_workout_style,ot_touch_style,ot_goals,ot_pt_expectations,ot_trainer_style,ot_check_updated_at")
    .single();

  setPublicOtCheckSaving(false);

  if (error) {
    setPublicOtCheckError("저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    return;
  }

  setPublicOtCheckMember(data || { ...publicOtCheckMember, ...payload });
  setPublicOtCheckSaved(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderOtCheckSection(section) {
  const currentValues = getOtCheckState(section.key);

  return (
    <div key={section.key} style={preferenceStyles.section}>
      <div style={preferenceStyles.label}>{section.title}</div>
      <div style={preferenceStyles.helper}>중복 선택 가능해요.</div>
      <div style={preferenceStyles.grid3}>
        {section.options.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setOtCheckState(section.key, (prev) => togglePreferenceValue(prev, label))}
            style={{
              ...preferenceStyles.optionButton,
              ...(currentValues.includes(label) ? preferenceStyles.activeButton : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function fillPreferenceForm(member) {
  const onlyCurrentOptions = (key, value) => {
    const allowed = getAllowedPreferenceValues(key);
    return parsePreferenceValue(value).filter((item) => allowed.includes(item));
  };

  setPrefIntensity(onlyCurrentOptions("preference_intensity", member?.preference_intensity));
  setPrefManagementStyle(onlyCurrentOptions("preference_management_style", member?.preference_management_style));
  setPrefTouchStyle(onlyCurrentOptions("preference_touch_style", member?.preference_touch_style));
  setPrefCommunicationStyle(onlyCurrentOptions("preference_communication_style", member?.preference_communication_style));
  setPrefClassMood(onlyCurrentOptions("preference_class_mood", member?.preference_class_mood));
  setPrefRequestNote(member?.preference_request_note || "");
}

async function saveMemberPreference() {
  if (!selectedMember) return;

  const payload = {
    preference_intensity: stringifyPreferenceValue(prefIntensity),
    preference_management_style: stringifyPreferenceValue(prefManagementStyle),
    preference_motivation_style: null,
    preference_touch_style: stringifyPreferenceValue(prefTouchStyle),
    preference_communication_style: stringifyPreferenceValue(prefCommunicationStyle),
    preference_class_mood: stringifyPreferenceValue(prefClassMood),
    preference_request_note: prefRequestNote.trim() || null,
    preference_updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("members")
    .update(payload)
    .eq("id", selectedMember.id)
    .select("*")
    .single();

  if (error) {
    alert("성향체크 저장 실패: " + error.message);
    return;
  }

  setSelectedMember(data || { ...selectedMember, ...payload });
  setMembers((prev) =>
    prev.map((member) =>
      member.id === selectedMember.id ? { ...member, ...(data || payload) } : member
    )
  );

  alert("성향 메모가 저장되었어요.");
  setDetailMode("menu");
}
  async function openDetail(member, mode = "menu") {
    setSelectedMember(member);
    fillPreferenceForm(member);
    fillOtCheckForm(member);
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

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const { data: detailWorkoutData, error: detailWorkoutError } = await supabase
      .from("workout_sessions")
      .select("*, workout_sets(*)")
      .eq("member_id", member.id)
      .gte("workout_date", getDateOnlyString(fourWeeksAgo))
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (detailWorkoutError) {
      console.error("운동 패턴 불러오기 실패:", detailWorkoutError.message);
      setDetailWorkoutSessions([]);
    } else {
      setDetailWorkoutSessions(detailWorkoutData || []);
    }

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
    setDetailWorkoutSessions([]);

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
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 0);
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

    const wasEditing = Boolean(editingInbodyLog?.id);
    const request = wasEditing
      ? supabase.from("inbody_logs").update(row).eq("id", editingInbodyLog.id)
      : supabase.from("inbody_logs").insert(row);

    const { error } = await request;

    if (error) {
      alert("인바디 기록 저장 실패: " + error.message);
      return;
    }

    closeInbodyModal();
    await loadInbodyLogs(selectedMember.id);
    alert(`${selectedMember.name} 인바디 기록이 ${wasEditing ? "수정" : "저장"}되었습니다.`);
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

    const linePoints = validPoints.map((point) => `${point.x},${point.y}`).join("\n");

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


  function setGroupWorkoutFlow(queue = [], index = 0) {
    const safeQueue = Array.isArray(queue) ? queue.filter(Boolean) : [];
    const safeIndex = Math.max(0, Number(index) || 0);
    groupWorkoutQueueRef.current = safeQueue;
    groupWorkoutIndexRef.current = safeIndex;
    setGroupWorkoutQueue(safeQueue);
    setGroupWorkoutIndex(safeIndex);
  }

  function clearGroupWorkoutFlow() {
    groupWorkoutQueueRef.current = [];
    groupWorkoutIndexRef.current = 0;
    setGroupWorkoutQueue([]);
    setGroupWorkoutIndex(0);
  }

  function resetWorkoutInputForm(trainingType = "weight") {
    setWorkoutTrainingType(trainingType);
    setWorkoutBodyParts([]);
    setWorkoutMemo("");
    setWorkoutCondition("normal");
    setWorkoutIssue("");
    setWorkoutNextPlan("");
    setWorkoutTrainerNote("");
    setWorkoutExercises([createEmptyWorkoutExercise(trainingType)]);
    setExerciseSuggestions([]);
    setActiveExerciseIndex(null);
    clearWorkoutEdit();
  }

  async function moveToGroupWorkoutMember(member, index) {
    if (!member?.id) return false;
    setGroupWorkoutFlow(groupWorkoutQueueRef.current, index);
    setWorkoutMember(member);
    setWorkoutReturnSource("scheduleCheckGroup");
    workoutReturnSourceRef.current = "scheduleCheckGroup";
    setWorkoutMode("add");
    resetWorkoutInputForm("weight");
    setShowAllWorkoutModal(false);
    await loadWorkoutSessions(member.id);
    return true;
  }


  async function openWorkout(member, source = null) {
    if (!member?.id) return;
    setWorkoutMember(member);
    setWorkoutReturnSource(source);
    workoutReturnSourceRef.current = source;
    setWorkoutMode("list");
    resetWorkoutInputForm("weight");
    setShowAllWorkoutModal(false);

    await loadWorkoutSessions(member.id);
  }

  function closeWorkout() {
    setWorkoutMember(null);
    setWorkoutReturnSource(null);
    workoutReturnSourceRef.current = null;
    clearGroupWorkoutFlow();
    setWorkoutSessions([]);
    setWorkoutMode("list");
    resetWorkoutInputForm("weight");
    setShowAllWorkoutModal(false);
  }


  function goBackFromWorkout() {
    if (workoutMode === "add") {
      setWorkoutMode("select");
      return;
    }

    if (workoutMode === "select") {
      setWorkoutMode("list");
      return;
    }

    closeWorkout();
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
      createEmptyWorkoutExercise(workoutTrainingType),
    ]);
  }

  function toggleWorkoutBodyPart(part) {
    setWorkoutBodyParts((prev) =>
      prev.includes(part)
        ? prev.filter((item) => item !== part)
        : [...prev, part]
    );
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

  function getSelectedBodyPartLabel() {
    if (workoutBodyParts.length === 0) return "선택한 부위";
    return workoutBodyParts.join(" + ");
  }

  function getWorkoutSessionBodyParts(session) {
    const savedParts = Array.isArray(session?.body_parts)
      ? session.body_parts.filter((part) => workoutPatternOptions.includes(part))
      : [];

    const inferredParts = inferBodyPartsFromExerciseNames(getSessionExerciseNames(session));

    // 예전 기록이나 오터치로 저장 부위와 운동명이 충돌하면 운동명 기준으로 화면 표시를 보정합니다.
    // 예: 랫풀다운/로우만 있는데 body_parts가 가슴으로 저장된 경우 → 등으로 표시
    if (inferredParts.length > 0 && savedParts.length > 0) {
      const overlap = savedParts.filter((part) => inferredParts.includes(part));
      return overlap.length > 0 ? overlap : inferredParts;
    }

    if (savedParts.length > 0) return savedParts;
    if (isCircuitWorkoutSession(session)) return ["전신"];
    return inferredParts;
  }

  function getSessionExerciseNames(session) {
    return groupWorkoutSets(session?.workout_sets || [])
      .map((group) => String(group.exerciseName || "").trim())
      .filter(Boolean);
  }

  function isCircuitWorkoutSession(session) {
    const memoText = String(session?.memo || "").toLowerCase();
    const namesText = getSessionExerciseNames(session).join(" ").toLowerCase();

    return (
      memoText.includes("서킷") ||
      memoText.includes("circuit") ||
      namesText.includes("서킷") ||
      namesText.includes("점핑잭") ||
      namesText.includes("케틀벨") ||
      namesText.includes("하이 니") ||
      namesText.includes("스텝업") ||
      namesText.includes("점핑 런지")
    );
  }

  const exerciseBodyPartKeywordMap = {
    가슴: ["체스트", "벤치", "인클라인", "디클라인", "펙덱", "플라이", "푸쉬업", "덤벨프레스", "케이블플라이", "케이블 플라이", "가슴"],
    어깨: ["숄더", "레터럴", "프론트", "리어", "델트", "업라이트", "오버헤드", "어깨"],
    등: ["랫풀", "랫 풀", "풀다운", "로우", "풀업", "페이스풀", "리버스", "데드리프트", "등"],
    하체: ["스쿼트", "런지", "레그", "힙", "글루트", "스텝업", "어브덕션", "어덕션", "카프"],
    팔: ["컬", "바이셉스", "트라이셉스", "푸쉬다운", "암", "킥백", "익스텐션"],
    복부: ["플랭크", "크런치", "레그레이즈", "데드버그", "버드독", "트위스트", "싯업", "복부"],
  };

  function inferBodyPartsFromExerciseNames(names = []) {
    const exactParts = (names || [])
      .map((name) => String(name || "").trim())
      .map((name) => exerciseCatalog.find((exercise) => exercise.name === name)?.bodyPart)
      .filter((part) => weightBodyPartOptions.includes(part));

    if (exactParts.length > 0) {
      return Array.from(new Set(exactParts));
    }

    const combined = names.join(" ").toLowerCase();

    return weightBodyPartOptions.filter((part) =>
      (exerciseBodyPartKeywordMap[part] || []).some((keyword) =>
        combined.includes(String(keyword).toLowerCase())
      )
    );
  }

  function getSafeWorkoutBodyParts(trainingType, selectedParts = [], exercises = []) {
    if (trainingType === "circuit") return ["전신"];
    if (trainingType !== "weight") return [];

    const selected = Array.from(new Set((selectedParts || []).filter((part) => weightBodyPartOptions.includes(part))));
    const exerciseNames = (exercises || []).map((exercise) => String(exercise?.name || "").trim()).filter(Boolean);
    const inferred = inferBodyPartsFromExerciseNames(exerciseNames);

    if (inferred.length === 0) return selected;
    if (selected.length === 0) return inferred;

    const overlap = selected.filter((part) => inferred.includes(part));
    if (overlap.length > 0) return overlap;

    // 선택 부위와 운동명이 충돌하면 운동명 기준으로 저장합니다.
    // 등 운동을 했는데 가슴으로 올라가는 문제를 막기 위한 안전장치입니다.
    return inferred;
  }

  function getWorkoutPatternSummary(sessions = detailWorkoutSessions) {
    const counts = workoutPatternOptions.reduce((acc, part) => {
      acc[part] = 0;
      return acc;
    }, {});

    (sessions || []).forEach((session) => {
      const taggedParts = getWorkoutSessionBodyParts(session);
      const inferredParts = taggedParts.length > 0
        ? taggedParts
        : isCircuitWorkoutSession(session)
          ? ["전신"]
          : inferBodyPartsFromExerciseNames(getSessionExerciseNames(session));

      Array.from(new Set(inferredParts)).forEach((part) => {
        if (Object.prototype.hasOwnProperty.call(counts, part)) {
          counts[part] += 1;
        }
      });
    });

    const entries = workoutPatternOptions.map((part) => ({
      part,
      label: part === "전신" ? "전신(서킷)" : part,
      count: counts[part] || 0,
    }));

    const maxCount = Math.max(...entries.map((item) => item.count), 0);
    const trainedEntries = entries.filter((item) => item.count > 0);
    const weakEntries = entries.filter((item) => item.count === 0);

    let suggestion = "최근 4주 운동기록이 부족합니다.";
    if (trainedEntries.length > 0 && weakEntries.length > 0) {
      suggestion = `${weakEntries[0].part} 운동 부족 · 다음 수업에서 ${weakEntries[0].part} 추천`;
    } else if (trainedEntries.length > 0) {
      const minCount = Math.min(...trainedEntries.map((item) => item.count));
      const minItem = trainedEntries.find((item) => item.count === minCount);
      suggestion = `${minItem.part} 비중 낮음 · 다음 수업에서 ${minItem.part} 보강 추천`;
    }

    return { entries, maxCount, total: trainedEntries.reduce((sum, item) => sum + item.count, 0), suggestion };
  }

  function renderWorkoutPatternBox() {
    const pattern = getWorkoutPatternSummary(detailWorkoutSessions);

    return (
      <div style={styles.workoutPatternBox}>
        <div style={styles.workoutPatternHeader}>
          <div>
            <strong style={styles.workoutPatternTitle}>최근 4주 운동 패턴</strong>
            <p style={styles.workoutPatternSub}>부위별 운동 빈도 자동 분석</p>
          </div>
          <span style={styles.workoutPatternBadge}>28일</span>
        </div>

        {pattern.total === 0 ? (
          <p style={styles.workoutPatternEmpty}>최근 4주 운동기록이 없습니다. 기록이 쌓이면 부위별 패턴이 자동으로 보입니다.</p>
        ) : (
          <>
            <div style={styles.workoutPatternList}>
              {pattern.entries.map((item) => {
                const width = pattern.maxCount > 0 ? Math.max(8, Math.round((item.count / pattern.maxCount) * 100)) : 0;

                return (
                  <div key={item.part} style={styles.workoutPatternRow}>
                    <span style={styles.workoutPatternPart}>{item.label || item.part}</span>
                    <div style={styles.workoutPatternBarTrack}>
                      <div style={{ ...styles.workoutPatternBar, width: `${width}%` }} />
                    </div>
                    <span style={styles.workoutPatternCount}>{item.count}</span>
                  </div>
                );
              })}
            </div>
            <p style={styles.workoutPatternSuggestion}>{pattern.suggestion}</p>
          </>
        )}
      </div>
    );
  }

  function getRecentBodyPartSessions() {
    if (workoutTrainingType !== "weight") return [];
    if (workoutBodyParts.length === 0) return [];

    const selectedParts = new Set(workoutBodyParts);
    const taggedMatches = [];
    const inferredMatches = [];
    const untaggedFallback = [];

    workoutSessions.forEach((session) => {
      const names = getSessionExerciseNames(session);
      if (names.length === 0) return;

      const parts = getWorkoutSessionBodyParts(session);

      if (parts.length > 0) {
        const matchedParts = parts.filter((part) => selectedParts.has(part));
        if (matchedParts.length > 0) {
          taggedMatches.push({
            ...session,
            __referenceLabel: matchedParts.join(", "),
            __referenceKind: "tagged",
          });
        }
        return;
      }

      // 예전 기록에는 body_parts가 없어서, 운동명으로 한 번 추정합니다.
      const inferredParts = inferBodyPartsFromExerciseNames(names).filter((part) =>
        selectedParts.has(part)
      );

      if (inferredParts.length > 0) {
        inferredMatches.push({
          ...session,
          __referenceLabel: `추정: ${inferredParts.join(", ")}`,
          __referenceKind: "inferred",
        });
        return;
      }

      // 그래도 못 맞추면 최근 과거 기록으로 보여줍니다.
      // 지금까지 쌓인 운동명은 참고할 수 있고, 오늘 부위 판단은 대표가 직접 합니다.
      untaggedFallback.push({
        ...session,
        __referenceLabel: "부위 미지정 과거기록",
        __referenceKind: "unknown",
      });
    });

    const prioritized = [...taggedMatches, ...inferredMatches];

    return [...prioritized, ...untaggedFallback]
      .filter((session, index, list) =>
        list.findIndex((item) => item.id === session.id) === index
      )
      .slice(0, 3);
  }

  function isExerciseAlreadyAdded(name) {
    const target = String(name || "").trim().toLowerCase();
    if (!target) return false;

    return workoutExercises.some(
      (exercise) => String(exercise.name || "").trim().toLowerCase() === target
    );
  }

  function addReferenceExercise(name) {
    const exerciseName = String(name || "").trim();
    if (!exerciseName) return;

    if (isExerciseAlreadyAdded(exerciseName)) {
      alert("이미 오늘 운동에 추가된 운동입니다.");
      return;
    }

    const newExercise = {
      ...createEmptyWorkoutExercise("weight"),
      name: exerciseName,
    };

    setWorkoutExercises((prev) => {
      const emptyIndex = prev.findIndex((exercise) => {
        const hasName = String(exercise.name || "").trim();
        const hasValue = (exercise.sets || []).some(
          (set) => String(set.weight || "").trim() || String(set.reps || "").trim()
        );
        return !hasName && !hasValue;
      });

      if (emptyIndex >= 0) {
        return prev.map((exercise, index) =>
          index === emptyIndex ? newExercise : exercise
        );
      }

      return [...prev, newExercise];
    });

    setExerciseSuggestions([]);
    setActiveExerciseIndex(null);
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
      sets: createExerciseSets(CIRCUIT_FIXED_SET_COUNT, exercise.weight || "", exercise.reps || ""),
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


  function getWorkoutFeedbackPartText(trainingType = workoutTrainingType, bodyParts = workoutBodyParts) {
    if (trainingType === "circuit") return "서킷";

    const parts = Array.isArray(bodyParts) ? bodyParts.filter(Boolean) : [];
    if (parts.length === 0) return "운동";
    return parts.join("·");
  }

  function getMainWorkoutPart(trainingType = workoutTrainingType, bodyParts = workoutBodyParts) {
    if (trainingType === "circuit") return "서킷";
    const parts = Array.isArray(bodyParts) ? bodyParts.filter(Boolean) : [];
    return parts[0] || "운동";
  }

  function getBodyPartParticle(part) {
    const text = String(part || "");
    if (!text) return "은";
    const lastChar = text.charCodeAt(text.length - 1);
    if (lastChar < 0xac00 || lastChar > 0xd7a3) return "은";
    return (lastChar - 0xac00) % 28 === 0 ? "는" : "은";
  }

  function getFeedbackWorkoutPartText(trainingType = workoutTrainingType, bodyParts = workoutBodyParts) {
    const partText = getWorkoutFeedbackPartText(trainingType, bodyParts);
    if (trainingType === "circuit") return "서킷트레이닝";
    return partText || "운동";
  }

  function cleanFeedbackText(value) {
    return String(value || "")
      .replace(/[.!?。？！]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeJournalText(value) {
    return cleanFeedbackText(value)
      .replace(/컨디션\s*좋음/g, "컨디션 좋음")
      .replace(/컨디션\s*안좋음|컨디션\s*안 좋음/g, "컨디션 안좋음")
      .replace(/폼\s*좋음/g, "폼 좋음")
      .replace(/폼\s*무너짐/g, "폼 무너짐")
      .replace(/집중력\s*좋음/g, "집중력 좋음")
      .replace(/밸런스\s*좋음/g, "좌우 좋음")
      .replace(/밸런스\s*무너짐/g, "좌우 흔들림")
      .replace(/전완\s*힘\s*빠짐/g, "전완 힘 빠짐")
      .trim();
  }

  function splitJournalKeywords(value) {
    return String(value || "")
      .split(/[\n,\/·]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getNextWorkoutPartText(nextPlan = "") {
    const text = cleanFeedbackText(nextPlan);
    if (!text) return "";

    const parts = weightBodyPartOptions.filter((part) => text.includes(part));
    if (parts.length > 0) return parts.join("/");

    if (/서킷|서킷트레이닝/.test(text)) return "서킷트레이닝";
    if (/전신/.test(text)) return "전신";
    return text;
  }

  function addFeedbackSection(sections, key, title, options = []) {
    const cleanOptions = Array.from(
      new Set(
        (options || [])
          .map((option) => cleanFeedbackText(option))
          .filter(Boolean)
      )
    );

    if (cleanOptions.length === 0) return;
    sections.push({ key, title, options: cleanOptions });
  }

  function getExerciseNamesFromFeedbackSource(exercises = [], fallbackText = "") {
    const directNames = (exercises || [])
      .map((exercise) => String(exercise?.name || exercise?.exercise_name || exercise?.exerciseName || "").trim())
      .filter(Boolean);

    const fallbackNames = String(fallbackText || "")
      .split(/[,\n/·]+/)
      .map((item) => item.replace(/\d+(\.\d+)?\s*kg/gi, "").replace(/\d+\s*회/g, "").trim())
      .filter((item) => item && item.length <= 20 && !/(없음|특이사항|메모|수면|공복|컨디션|통증|어색|좋음|나쁨)/.test(item));

    return Array.from(new Set([...directNames, ...fallbackNames])).slice(0, 6);
  }

  function getExerciseListText(exerciseNames = []) {
    const names = (exerciseNames || []).filter(Boolean);
    if (names.length === 0) return "";
    if (names.length <= 4) return names.join(", ");
    return `${names.slice(0, 4).join(", ")} 외 ${names.length - 4}개`;
  }

  function guessExerciseFromKeyword(keyword = "", exerciseNames = []) {
    const text = String(keyword || "");
    return (exerciseNames || []).find((name) => text.includes(name)) || exerciseNames?.[0] || "운동";
  }

  function getWorkoutSpecificCandidateOptions(workoutText, rawText = "", exerciseNames = [], memberName = "회원") {
    const text = normalizeJournalText(rawText);
    const options = [];
    const exerciseName = guessExerciseFromKeyword(text, exerciseNames);

    if (/무게|중량|올림|증가|늘었|증량/.test(text)) {
      if (exerciseName && exerciseName !== "운동") {
        options.push(`${exerciseName} 무게 많이 늘었어요👍`);
      }
      options.push("무게 올려서 했는데 힘들었을텐데 정말 잘 해주셨어요👍");
    }

    if (/어색|낯설|잘 안됨|안익|안 익/.test(text)) {
      if (exerciseName && exerciseName !== "운동") {
        options.push(`${exerciseName}는 아직 조금 어색한데 몇번만 더하면 금방 익숙해질거에요`);
      } else {
        options.push("아직 조금 어색한 동작은 몇번만 더하면 금방 익숙해질거에요");
      }
    }

    if (/리드|따라/.test(text)) {
      options.push("오늘 제 리드에 맞춰 잘 따라오셨어요👍");
    }

    if (/수축|통증|아픔|아파|찌릿|뻐근|불편/.test(text)) {
      if (exerciseName && exerciseName !== "운동") {
        const detail = text.replace(exerciseName, "").trim();
        options.push(`${exerciseName} 할 때 ${detail || "아픈 부분"}이 있어서 무리하지 않고 맞춰서 했어요.`);
      } else {
        options.push("아픈 부분은 무리하지 않고 맞춰서 했어요.");
      }
    }

    if (/자세\s*좋|폼\s*좋|동작\s*좋|많이\s*좋/.test(text)) {
      if (/등/.test(workoutText)) options.push(`${memberName}님 이제 등운동 자세는 정말 좋아요👍`);
      else options.push("오늘 자세 정말 좋았어요👍");
    }

    return options;
  }

  function getKeywordCandidateOptions(keyword, workoutText = "", exerciseNames = [], memberName = "회원") {
    const text = normalizeJournalText(keyword);
    const options = [];
    const exerciseName = guessExerciseFromKeyword(text, exerciseNames);

    if (/없음|특이사항\s*없|이슈\s*없/.test(text)) {
      options.push("오늘 특별히 걸리는 부분 없이 잘 했어요👍");
      options.push("오늘은 큰 문제 없이 잘 마무리했어요");
    }

    if (/수면|잠|피곤|컨디션 안좋음|컨디션 안 좋음|몸 무거움/.test(text)) {
      options.push(`${memberName}님 제발 잠좀 주무세요😂`);
      options.push("오늘은 꿀잠 하시길~💤");
      options.push("오늘 컨디션이 좋진 않았는데도 끝까지 잘 해주셨어요👍");
    }

    if (/공복|밥\s*안|식사\s*안|안먹|안 먹/.test(text)) {
      options.push("운동할 땐 잘 먹어야합니다~~!!!!😡");
      options.push("공복인데도 잘 해주셨어요👍 다음엔 뭐라도 조금 드시고 오기!");
    }

    if (/컨디션 좋음|컨디션 괜찮|힘 좋|운동 잘됨|운동 잘 됨/.test(text)) {
      options.push("오늘 힘 좋았어요👍");
      options.push("오늘 리드에 맞춰 잘 따라오셨어요👍");
    }

    if (/집중력 좋음|집중 좋음|집중도 좋음|집중력/.test(text)) {
      options.push(`${memberName}님 오늘 집중력 완전 최고~~!👍👍`);
    }

    if (/밸런스 좋음|좌우 좋음|균형 좋음/.test(text)) {
      options.push("오늘 좌우 차이도 크게 안 보이고 좋았어요👍");
    }

    if (/밸런스 무너짐|밸런스 안맞|좌우 차이|좌우 흔들/.test(text)) {
      options.push("좌우 차이는 제가 옆에서 계속 맞춰드릴게요");
    }

    if (/폼 좋음|자세 좋음|자세 괜찮|자세 안정|동작 좋/.test(text)) {
      if (/등/.test(workoutText)) options.push(`${memberName}님 이제 등운동 자세는 정말 좋아요👍`);
      else options.push("오늘 자세 정말 좋았어요👍");
    }

    if (/폼 무너짐|자세 무너짐|자세 흔들|자세 불안/.test(text)) {
      options.push("자세는 제가 옆에서 계속 잡아드릴게요");
    }

    if (/전완 힘 빠짐|전완|그립|손 힘|팔 힘/.test(text)) {
      options.push("손이랑 팔에 힘 많이 들어가는 부분은 제가 계속 봐드릴게요");
    }

    if (/무게|중량|올림|증가|늘었|증량/.test(text)) {
      if (exerciseName && exerciseName !== "운동") {
        options.push(`${exerciseName} 무게 많이 늘었어요👍`);
      }
      options.push("무게 올려서 했는데 힘들었을텐데 정말 잘 해주셨어요👍");
    }

    if (/어색|낯설|잘 안됨|안익|안 익/.test(text)) {
      if (exerciseName && exerciseName !== "운동") {
        options.push(`${exerciseName}는 아직 조금 어색한데 몇번만 더하면 금방 익숙해질거에요`);
      } else {
        options.push("아직 조금 어색한 동작은 몇번만 더하면 금방 익숙해질거에요");
      }
    }

    if (/왼쪽 어깨|오른쪽 어깨|어깨|허리|무릎|손목|발목|통증|아픔|아파|찌릿|뻐근|불편/.test(text)) {
      if (exerciseName && exerciseName !== "운동") {
        const detail = text.replace(exerciseName, "").trim();
        options.push(`${exerciseName} 할 때 ${detail || "아픈 부분"}이 있어서 무리하지 않고 맞춰서 했어요.`);
      } else {
        options.push("아픈 부분은 무리하지 않고 맞춰서 했어요.");
      }
    }

    options.push(...getWorkoutSpecificCandidateOptions(workoutText, text, exerciseNames, memberName));

    return options;
  }

  function createFeedbackCandidateSections({ member, trainingType, bodyParts, condition, issue, nextPlan, trainerNote, memo, exercises }) {
    const memberName = member?.name || "회원";
    const workoutText = getFeedbackWorkoutPartText(trainingType, bodyParts);
    const exerciseNames = getExerciseNamesFromFeedbackSource(exercises, `${memo || ""}\n${trainerNote || ""}\n${issue || ""}`);
    const exerciseListText = getExerciseListText(exerciseNames);
    const sections = [];

    if (trainingType === "circuit") {
      addFeedbackSection(sections, "today-circuit", "오늘 서킷트레이닝", [
        "오늘 서킷트레이닝 했어요",
        "오늘 서킷 돌리느라 진짜 고생하셨어요👍",
        "오늘 운동량 꽤 있었는데 끝까지 잘 해주셨어요👍",
      ]);
    } else if (exerciseListText) {
      addFeedbackSection(sections, "today-workout", "오늘 운동", [
        `오늘 ${exerciseListText} 했어요`,
        `오늘은 ${exerciseListText} 순서로 운동했어요`,
        `오늘 ${exerciseListText} 들어갔어요`,
      ]);
    } else {
      addFeedbackSection(sections, "today-workout", "오늘 운동", [
        `오늘 ${workoutText} 운동 했어요`,
        `오늘 ${workoutText} 했어요`,
      ]);
    }

    const journalItems = [
      ...splitJournalKeywords(issue).map((value, index) => ({ group: "체크사항", value, index })),
      ...splitJournalKeywords(trainerNote).map((value, index) => ({ group: "총평", value, index })),
      ...splitJournalKeywords(memo).map((value, index) => ({ group: "메모", value, index })),
    ];

    journalItems.forEach((item) => {
      const options = getKeywordCandidateOptions(item.value, workoutText, exerciseNames, memberName);
      addFeedbackSection(
        sections,
        `${item.group}-${item.index}-${item.value}`,
        `${item.group}: ${item.value}`,
        options
      );
    });

    if (condition === "good") {
      addFeedbackSection(sections, "condition-good", "컨디션 좋음", [
        "오늘 힘 좋았어요👍",
        "오늘 리드에 맞춰 너무 잘 따라오셨어요👍",
      ]);
    }

    if (condition === "bad") {
      addFeedbackSection(sections, "condition-bad", "컨디션 조절", [
        "오늘 컨디션 안 좋았는데도 끝까지 잘 해주셨어요👍",
        "오늘은 무리하지 않는 선에서 맞춰서 했어요",
      ]);
    }

    const nextPart = getNextWorkoutPartText(nextPlan);
    if (nextPart) {
      addFeedbackSection(sections, "next-plan", "다음 수업", [
        `다음엔 ${nextPart} 해봐요`,
        `다음시간엔 ${nextPart} 해봐요`,
      ]);
    }

    return sections;
  }

  function buildFeedbackDraftFromCandidateMap(member, sections, candidateMap) {
    const memberName = member?.name || "회원";
    const chosenLines = (sections || [])
      .map((section) => {
        const selectedIndex = candidateMap?.[section.key];
        if (selectedIndex === null || selectedIndex === undefined) return "";
        return section.options?.[selectedIndex] || "";
      })
      .filter(Boolean);

    return [
      `${memberName}님 오늘 운동 하느라 고생하셨어요`,
      ...chosenLines,
      "컨디션 조절 잘하시고 다음시간에 뵈요^^",
    ]
      .filter((line) => String(line || "").trim())
      .join("\n\n");
  }

  function getDefaultCandidateMap(sections = []) {
    const map = {};
    (sections || []).forEach((section) => {
      if (section?.options?.length > 0) {
        map[section.key] = 0;
      }
    });
    return map;
  }

  function generateWorkoutFeedbackMessage({ member, trainingType, bodyParts, condition, issue, nextPlan, trainerNote, memo, exercises }) {
    const sections = createFeedbackCandidateSections({
      member,
      trainingType,
      bodyParts,
      condition,
      issue,
      nextPlan,
      trainerNote,
      memo,
      exercises,
    });
    const defaultMap = getDefaultCandidateMap(sections);
    return buildFeedbackDraftFromCandidateMap(member, sections, defaultMap);
  }

  function selectFeedbackCandidate(sectionKey, optionIndex) {
    setSelectedFeedbackCandidateMap((prev) => {
      const nextMap = { ...prev, [sectionKey]: optionIndex };
      setFeedbackDraft(buildFeedbackDraftFromCandidateMap(feedbackModalMember, feedbackCandidateSections, nextMap));
      return nextMap;
    });
  }

  function removeFeedbackCandidateSection(sectionKey) {
    setSelectedFeedbackCandidateMap((prev) => {
      const nextMap = { ...prev, [sectionKey]: null };
      setFeedbackDraft(buildFeedbackDraftFromCandidateMap(feedbackModalMember, feedbackCandidateSections, nextMap));
      return nextMap;
    });
  }

  function openFeedbackModal(member, draft, sourceData = null) {
    if (!member) return;

    const feedbackSource = sourceData || {
      member,
      trainingType: workoutTrainingType,
      bodyParts: workoutBodyParts,
      condition: workoutCondition,
      issue: workoutIssue,
      nextPlan: workoutNextPlan,
      trainerNote: workoutTrainerNote,
      memo: workoutMemo,
      exercises: workoutExercises,
    };

    const sections = createFeedbackCandidateSections(feedbackSource);
    const defaultMap = getDefaultCandidateMap(sections);
    const nextDraft = draft || buildFeedbackDraftFromCandidateMap(member, sections, defaultMap);

    setFeedbackModalMember(member);
    setFeedbackCandidateSections(sections);
    setSelectedFeedbackCandidateMap(defaultMap);
    setFeedbackDraft(nextDraft);
  }

  async function runPendingAfterFeedbackAction() {
    const pending = pendingAfterFeedbackRef.current;
    pendingAfterFeedbackRef.current = null;

    if (!pending) return;

    if (pending.type === "groupNext" && pending.member?.id) {
      await moveToGroupWorkoutMember(pending.member, pending.index || 0);
      return;
    }

    if (pending.type === "groupComplete") {
      clearGroupWorkoutFlow();
      setWorkoutMember(null);
      setWorkoutReturnSource(null);
      workoutReturnSourceRef.current = null;
      setWorkoutSessions([]);
      setWorkoutMode("list");
      resetWorkoutInputForm("weight");
      setShowAllWorkoutModal(false);
      setShowScheduleCheckModal(true);
      await loadScheduleCheckList(pending.scheduleDate || scheduleCheckDate || getTodayDateString());
      alert("그룹PT 참여자 전원의 운동 기록이 저장되었습니다.");
    }
  }

  async function closeFeedbackModal(options = {}) {
    const shouldContinue = options?.continueAfterClose !== false;
    setFeedbackModalMember(null);
    setFeedbackDraft("");
    setFeedbackCandidateSections([]);
    setSelectedFeedbackCandidateMap({});
    setActiveTodayTodoKey(null);

    if (shouldContinue) {
      await runPendingAfterFeedbackAction();
    }
  }

  async function sendFeedbackSMS() {
    const phone = normalizePhone(feedbackModalMember?.phone);

    if (!feedbackModalMember) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    if (!phone) {
      alert(`${feedbackModalMember.name || "회원"} 회원의 전화번호가 없습니다.`);
      return;
    }

    const message = String(feedbackDraft || "").trim();
    if (!message) {
      alert("보낼 피드백 문구가 없습니다.");
      return;
    }

    const targetPhone = phone;
    await markMemberContacted(feedbackModalMember, "피드백 문자");
    await closeFeedbackModal();
    window.location.href = `sms:${targetPhone}?body=${encodeURIComponent(message)}`;
  }

  async function saveWorkout(options = {}) {
    const shouldOpenFeedback = options?.openFeedback === true;
    if (!workoutMember) return;

    const savedWorkoutMember = workoutMember;

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
        body_parts: getSafeWorkoutBodyParts(workoutTrainingType, workoutBodyParts, validExercises),
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

    const feedbackMessage = generateWorkoutFeedbackMessage({
      member: workoutMember,
      trainingType: workoutTrainingType,
      bodyParts: getSafeWorkoutBodyParts(workoutTrainingType, workoutBodyParts, validExercises),
      condition: workoutCondition,
      issue: workoutIssue,
      nextPlan: workoutNextPlan,
      trainerNote: workoutTrainerNote,
      memo: workoutMemo,
      exercises: validExercises,
    });

    setWorkoutBodyParts([]);
    setWorkoutMemo("");
    setWorkoutCondition("normal");
    setWorkoutIssue("");
    setWorkoutNextPlan("");
    setWorkoutTrainerNote("");
    setWorkoutExercises([createEmptyWorkoutExercise("weight")]);
    setWorkoutMode("list");

    await loadWorkoutSessions(savedWorkoutMember.id);

    const activeReturnSource = workoutReturnSourceRef.current || workoutReturnSource;
    const activeGroupQueue = groupWorkoutQueueRef.current.length > 0 ? groupWorkoutQueueRef.current : groupWorkoutQueue;
    const activeGroupIndex = groupWorkoutIndexRef.current ?? groupWorkoutIndex;

    if (activeReturnSource === "scheduleCheckGroup" && activeGroupQueue.length > 1) {
      const nextIndex = activeGroupIndex + 1;
      const nextMember = activeGroupQueue[nextIndex];

      if (nextMember?.id) {
        if (shouldOpenFeedback) {
          pendingAfterFeedbackRef.current = {
            type: "groupNext",
            member: nextMember,
            index: nextIndex,
          };
          openFeedbackModal(savedWorkoutMember, feedbackMessage, {
            member: savedWorkoutMember,
            trainingType: workoutTrainingType,
            bodyParts: getSafeWorkoutBodyParts(workoutTrainingType, workoutBodyParts, validExercises),
            condition: workoutCondition,
            issue: workoutIssue,
            nextPlan: workoutNextPlan,
            trainerNote: workoutTrainerNote,
            memo: workoutMemo,
            exercises: validExercises,
          });
          return;
        }

        await moveToGroupWorkoutMember(nextMember, nextIndex);
        return;
      }

      if (shouldOpenFeedback) {
        pendingAfterFeedbackRef.current = {
          type: "groupComplete",
          scheduleDate: scheduleCheckDate || getTodayDateString(),
        };
        openFeedbackModal(savedWorkoutMember, feedbackMessage, {
          member: savedWorkoutMember,
          trainingType: workoutTrainingType,
          bodyParts: getSafeWorkoutBodyParts(workoutTrainingType, workoutBodyParts, validExercises),
          condition: workoutCondition,
          issue: workoutIssue,
          nextPlan: workoutNextPlan,
          trainerNote: workoutTrainerNote,
          memo: workoutMemo,
          exercises: validExercises,
        });
        return;
      }

      clearGroupWorkoutFlow();
      setWorkoutMember(null);
      setWorkoutReturnSource(null);
      workoutReturnSourceRef.current = null;
      setWorkoutSessions([]);
      setWorkoutMode("list");
      resetWorkoutInputForm("weight");
      setShowAllWorkoutModal(false);
      setShowScheduleCheckModal(true);
      await loadScheduleCheckList(scheduleCheckDate || getTodayDateString());
      alert("그룹PT 참여자 전원의 운동 기록이 저장되었습니다.");
      return;
    }

    if (shouldOpenFeedback) {
      openFeedbackModal(savedWorkoutMember, feedbackMessage, {
        member: savedWorkoutMember,
        trainingType: workoutTrainingType,
        bodyParts: getSafeWorkoutBodyParts(workoutTrainingType, workoutBodyParts, validExercises),
        condition: workoutCondition,
        issue: workoutIssue,
        nextPlan: workoutNextPlan,
        trainerNote: workoutTrainerNote,
        memo: workoutMemo,
        exercises: validExercises,
      });
    }
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
        {session.issue && <p style={textStyle}>체크사항: {session.issue}</p>}
        {session.next_plan && <p style={textStyle}>다음운동: {session.next_plan}</p>}
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
        <div style={styles.todayWorkoutContent}>
          <div style={styles.logDate}>{formatDate(session.workout_date)}</div>

          {groups.length === 0 ? (
            <p style={styles.todayWorkoutEmptyText}>운동 상세 없음</p>
          ) : (
            <div style={styles.todayWorkoutExerciseList}>
              {groups.map((group, groupIndex) => (
                <div key={group.key} style={styles.todayWorkoutExerciseCard}>
                  <div style={styles.todayWorkoutExerciseTitle}>
                    {groupIndex + 1}번 운동 · {group.exerciseName}
                  </div>
                  <div style={styles.todayWorkoutSetLine}>
                    {group.sets
                      .map((set) => {
                        const weightText = set.weight || set.weight === 0 ? `${set.weight}kg` : "무게 -";
                        const repsText = set.reps || set.reps === 0 ? `${set.reps}회` : "횟수 -";
                        return `${set.set_number || ""}세트 ${weightText} ${repsText}`;
                      })
                      .join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          )}

          {renderTrainerJournal(session, false)}
        </div>
      </div>
    );
  }

  function renderMemberCard(member) {
    const ptStatus = getPtStatus(member);
    const visitStatus = getVisitStatus(member);
    const mainBadges = [ptStatus, visitStatus].filter(Boolean).slice(0, 2);

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

            <label style={styles.label}>회원 단계</label>
            <select
              value={editMemberStage}
              onChange={(e) => setEditMemberStage(e.target.value)}
              style={styles.input}
            >
              {memberStageOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

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
          <div onClick={() => openDetailFromMemberList(member)} style={styles.memberMainCompact}>
            <div style={styles.memberCardHeaderCompact}>
              <div style={styles.memberTitleLineCompact}>
                <h3 style={styles.memberNameSmall}>{member.name}</h3>
                <span
                  style={{
                    ...styles.ptCountPill,
                    ...(member.pt_remaining || 0) <= 2
                      ? styles.ptCountPillDanger
                      : (member.pt_remaining || 0) <= 5
                        ? styles.ptCountPillWarning
                        : styles.ptCountPillNormal,
                  }}
                >
                  PT {member.pt_remaining || 0}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeMemberListModal();
                  openPtModal(member);
                }}
                style={styles.cardPtAddButtonMini}
              >
                + 이용권
              </button>
            </div>

            <div style={styles.memberMetaLineCompact}>
              <span style={getMemberTypeStyle(member.member_type)}>
                {getMemberTypeText(member.member_type)}
              </span>
              <span style={getMemberStageBadgeStyle(member.member_stage)}>{getMemberStageText(member.member_stage)}</span>
              {member.is_vip && member.member_type !== "vip" && <span style={styles.vipBadge}>VIP</span>}
              <span>{member.age ? `${member.age}세` : "나이 없음"}</span>
              {member.height && <span>{member.height}cm</span>}
              <span>{member.phone || "전화번호 없음"}</span>
            </div>

            {getPreferenceTags(member).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {getPreferenceTags(member).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "#f3f4f6",
                      color: "#111",
                      padding: "5px 9px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {getLatestConditionForMember(member) && (
              <div style={styles.lastWorkoutPreviewCompact}>
                <span style={styles.lastWorkoutPreviewStrong}>
                  최근컨디션: {getConditionPreviewText(getLatestConditionForMember(member))}
                </span>
                {getLatestConditionForMember(member)?.memo && (
                  <span style={styles.lastWorkoutPreviewText}>
                    {getLatestConditionForMember(member).memo}
                  </span>
                )}
              </div>
            )}

            <div style={styles.compactInfoRow}>
              <span>출석 {formatDate(member.latest_visit)}</span>
              <span>PT {formatDate(member.latest_pt)}</span>
            </div>

            <div style={styles.memberActionLineCompact}>
              <div style={styles.memberLeftActionsCompact}>
                {/* member-card-v2: 컨디션 / 문자 / 피드백 / 더보기 버튼을 카드에 직접 노출 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openConditionCheckModal(member);
                  }}
                  style={styles.conditionSmsButton}
                  title="컨디션 기록"
                >
                  컨디션
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendFreeMemberSMS(member);
                  }}
                  style={styles.freeSmsButtonMini}
                  title="일반 문자 직접 작성"
                >
                  문자
                </button>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await openMemberCardFeedback(member);
                  }}
                  style={shouldRecommendFeedback(member) ? styles.feedbackRecommendButtonMini : styles.feedbackButtonMini}
                  title="피드백 추천"
                >
                  {shouldRecommendFeedback(member) ? "추천" : "피드백"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMemberActionMenuMember(member);
                  }}
                  style={styles.memberMoreButtonMini}
                  title="추가 기능"
                >
                  ⋯
                </button>

                {mainBadges.map((badge, index) => (
                  <span key={index} style={styles.compactStatusBadge}>{badge.text}</span>
                ))}
              </div>

              {member.is_active === false && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reactivateMember(member);
                  }}
                  style={styles.cardRestoreButtonMini}
                >
                  복구
                </button>
              )}
            </div>
          </div>
        )}
      </article>
    );
  }

  const hasOpenModal =
    memberActionMenuMember ||
    showTodayTodoModal ||
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
    showSalesModal ||
    showTrainerLogModal ||
    showTrainerWorkoutHistoryModal ||
    freeSmsModalMember ||
    feedbackModalMember ||
    contactModalMember ||
    conditionModalMember ||
    summaryModal;

  useEffect(() => {
    hasOpenModalRef.current = Boolean(hasOpenModal);
  }, [hasOpenModal]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    if (hasOpenModal) {
      modalScrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;

      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${modalScrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.height = "100dvh";
      document.body.style.touchAction = "none";
    } else {
      const restoreY = modalScrollYRef.current || 0;

      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";

      if (restoreY > 0) {
        window.scrollTo(0, restoreY);
      }
    }

    return () => {
      const restoreY = modalScrollYRef.current || 0;

      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";

      if (restoreY > 0) {
        window.scrollTo(0, restoreY);
      }
    };
  }, [hasOpenModal]);


  useEffect(() => {
    if (typeof window === "undefined") return;

    if (hasOpenModal && !modalBackGuardArmedRef.current) {
      try {
        window.history.pushState({ spotainerModalGuard: true }, "", window.location.href);
        modalBackGuardArmedRef.current = true;
      } catch (error) {
        console.error("팝업 뒤로가기 방어 설정 실패", error);
      }
    }

    if (!hasOpenModal) {
      modalBackGuardArmedRef.current = false;
    }
  }, [hasOpenModal]);

  function goToMain() {
    setShowExitConfirm(false);
    setShowTodayTodoModal(false);
    setShowSalesModal(false);
    setShowTrainerLogModal(false);
    setShowTrainerWorkoutHistoryModal(false);
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
    setFreeSmsModalMember(null);
    setFreeSmsDraft("");
    setFeedbackModalMember(null);
    setFeedbackDraft("");
    setShowMemberListModal(false);
    setReturnToMemberListAfterDetail(false);
    setReturnToScheduleCheckAfterAdd(false);
  }

  function openExitConfirm() {
    setShowExitConfirm(true);
  }

  function closeExitConfirm() {
    setShowExitConfirm(false);
  }

  function exitSpotainerApp() {
    setExitToast("Spotainer 앱 종료를 시도합니다");

    try {
      window.close();
    } catch (error) {
      console.error("window.close 실패", error);
    }

    setTimeout(() => {
      try {
        window.history.back();
      } catch (error) {
        console.error("앱 종료 시도 실패", error);
      }
    }, 80);
  }

  if (publicOtCheckMemberId) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          background: "#fff7f3",
          color: "#111827",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 760,
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: 24,
            padding: "22px 18px 26px",
            boxShadow: "0 18px 50px rgba(17, 24, 39, 0.12)",
            border: "1px solid #f1e5de",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#8a6f63", marginBottom: 6 }}>
              SPOTAINER FITNESS
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 1000, letterSpacing: "-0.04em" }}>
              OT 회원 성향체크
            </h1>
            <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6, fontWeight: 750, color: "#6b4f45" }}>
              중복선택 가능해요. 회원님의 컨디션과 스타일에 맞춰 수업을 진행하기 위한 체크입니다.
            </p>
          </div>

          {publicOtCheckLoading ? (
            <div style={preferenceStyles.noticeBox}>불러오는 중이에요...</div>
          ) : publicOtCheckError ? (
            <div style={{ ...preferenceStyles.noticeBox, background: "#fff1f2", borderColor: "#fecdd3" }}>
              <div style={preferenceStyles.noticeTitle}>확인이 필요해요</div>
              <div style={preferenceStyles.noticeText}>{publicOtCheckError}</div>
            </div>
          ) : publicOtCheckSaved ? (
            <div style={preferenceStyles.noticeBox}>
              <div style={preferenceStyles.noticeTitle}>작성 완료됐어요 :)</div>
              <div style={preferenceStyles.noticeText}>
                체크해주신 내용 참고해서 컨디션과 스타일에 맞춰 OT 진행 도와드릴게요.
              </div>
            </div>
          ) : (
            <>
              {publicOtCheckMember?.name && (
                <div style={preferenceStyles.noticeBox}>
                  <div style={preferenceStyles.noticeTitle}>{publicOtCheckMember.name}님</div>
                  <div style={preferenceStyles.noticeText}>
                    부담없이 편하게 선택해주세요.
                  </div>
                </div>
              )}

              {otCheckSections.map(renderOtCheckSection)}

              <button
                type="button"
                onClick={savePublicOtCheck}
                disabled={publicOtCheckSaving}
                style={{
                  ...preferenceStyles.saveButton,
                  opacity: publicOtCheckSaving ? 0.65 : 1,
                }}
              >
                {publicOtCheckSaving ? "저장 중..." : "작성 완료"}
              </button>
            </>
          )}
        </section>
      </main>
    );
  }

  const shouldRenderMobileEmergencyMode = isMobileEmergencyMode;

  const incompleteSchedules = schedules.filter((schedule) => {
    if (
      schedule.status === "noshow" ||
      schedule.status === "completed" ||
      schedule.status === "cancelled"
    ) return false;

    return !schedule.attendance_checked || !schedule.pt_used;
  });

  if (shouldRenderMobileEmergencyMode) {
    const mobileSchedules = (scheduleCheckList || []).slice().sort((a, b) => {
      const aTime = normalizeTimeValue(a.start_time || "");
      const bTime = normalizeTimeValue(b.start_time || "");
      return aTime.localeCompare(bTime);
    });

    return (
      <main style={styles.mobileEmergencyPage}>
        <section style={styles.mobileEmergencyHeader}>
          <div>
            <h1 style={styles.mobileEmergencyTitle}>Spotainer</h1>
            <p style={styles.mobileEmergencySubtitle}>휴대폰 긴급 확인 모드</p>
          </div>
          <button
            type="button"
            onClick={() => {
              loadScheduleCheckList(scheduleCheckDate);
              loadScheduleSMSLogs(scheduleCheckDate);
            }}
            style={styles.mobileEmergencyRefreshButton}
          >
            새로고침
          </button>
          <button
            type="button"
            onClick={() => {
              window.localStorage?.setItem("spotainerViewMode", "tablet");
              setIsMobileEmergencyMode(false);
              if (window.location.pathname.includes("/mobile-schedule")) {
                window.location.href = "/?view=tablet";
              }
            }}
            style={styles.mobileEmergencyRefreshButton}
          >
            태블릿 화면
          </button>
        </section>

        <section style={styles.mobileEmergencyDateBox}>
          <button type="button" onClick={() => moveScheduleCheckDate(-1)} style={styles.mobileEmergencyDateButton}>
            ◀
          </button>
          <button type="button" onClick={() => setScheduleCheckDate(getTodayDateString())} style={styles.mobileEmergencyTodayButton}>
            {formatDate(scheduleCheckDate)}
          </button>
          <button type="button" onClick={() => moveScheduleCheckDate(1)} style={styles.mobileEmergencyDateButton}>
            ▶
          </button>
        </section>

        <section style={styles.mobileEmergencyList}>
          <h2 style={styles.mobileEmergencySectionTitle}>스케줄 {mobileSchedules.length}건</h2>

          {mobileSchedules.length === 0 ? (
            <div style={styles.mobileEmergencyEmpty}>해당 날짜에 등록된 스케줄이 없습니다.</div>
          ) : (
            mobileSchedules.map((schedule) => {
              const scheduleMembers = getScheduleMembers(schedule);
              const status = getSchedulePreviewStatus(schedule);
              const sent = isScheduleSMSSent(schedule);

              return (
                <article key={schedule.id} style={styles.mobileEmergencyCard}>
                  <div style={styles.mobileEmergencyCardTop}>
                    <strong style={styles.mobileEmergencyTime}>{formatScheduleRange(schedule)}</strong>
                    <span style={status.style}>{status.text}</span>
                  </div>

                  <div style={styles.mobileEmergencyMemberLine}>
                    {getScheduleTypeText(schedule.type)} · {getScheduleMemberNames(schedule)}
                  </div>

                  <div style={styles.mobileEmergencySubLine}>
                    {getScheduleMemberPtText(schedule) || "PT 정보 없음"}
                    {sent ? " · 문자 완료" : ""}
                  </div>

                  {getScheduleDisplayMemo(schedule) && <p style={styles.mobileEmergencyMemo}>{getScheduleDisplayMemo(schedule)}</p>}

                  <div style={styles.mobileEmergencyButtonRow}>
                    {scheduleMembers.length <= 1 ? (
                      <button
                        type="button"
                        onClick={() => sendMobileScheduleSMS(schedule, scheduleMembers[0])}
                        style={styles.mobileEmergencySmsButton}
                      >
                        문자
                      </button>
                    ) : (
                      scheduleMembers.map((member) => (
                        <button
                          key={`${schedule.id}-${member.id}`}
                          type="button"
                          onClick={() => sendMobileScheduleSMS(schedule, member)}
                          style={styles.mobileEmergencySmsButton}
                        >
                          {member.name} 문자
                        </button>
                      ))
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    );
  }

  if (!mounted) return null;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brandLine}>
          <h1 style={styles.title}>Spotainer</h1>
          <span style={styles.brandDivider} />
          <p style={styles.subtitleInline}>{centerName || "여성전용 PT 회원관리"}</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={openTrainerLogModal} style={styles.trainerQuickButton}>
            개인 기록
          </button>
          <button onClick={openCenterModal} style={styles.adminBadge}>
            관리자
          </button>
        </div>
      </header>


      {showTodayTodoModal && (
        <div style={styles.todayTodoPopupOverlay} onClick={() => setShowTodayTodoModal(false)}>
          <div style={styles.todayTodoPopupModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.todayTodoModalHeader}>
              <div>
                <h2 style={styles.todayTodoModalTitle}>오늘 할 일</h2>
                <p style={styles.todayTodoModalDesc}>문자, 상담기록, 완료 처리를 여기서 바로 끝냅니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTodayTodoModal(false)}
                style={styles.whiteCloseButton}
              >
                닫기
              </button>
            </div>

            <div style={styles.todayTodoModalSummaryRow}>
              <div style={styles.todayTodoModalSummaryCard}>
                <span>처리할 일</span>
                <strong>{pendingTodayTodoItems.length}건</strong>
              </div>
              <div style={styles.todayTodoModalSummaryCard}>
                <span>완료 표시</span>
                <strong>{doneTodayTodoItems.length}건</strong>
              </div>
              <div style={styles.todayTodoModalSummaryCard}>
                <span>오늘 수업</span>
                <strong>{schedules.length}건</strong>
              </div>
            </div>

            {todayTodoItems.length === 0 ? (
              <div style={styles.todayTodoModalEmpty}>
                오늘 즉시 처리할 항목이 없습니다.
              </div>
            ) : (
              <div style={styles.todayTodoModalList}>
                {todayTodoItems.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      ...styles.todayTodoModalItem,
                      ...(item.done ? styles.todayTodoModalItemDone : {}),
                    }}
                  >
                    <div style={styles.todayTodoModalLeft}>
                      <span style={{
                        ...styles.todayTodoBadge,
                        ...(item.tone === "danger" ? styles.todayTodoBadgeDanger : {}),
                        ...(item.tone === "warn" ? styles.todayTodoBadgeWarn : {}),
                        ...(item.tone === "sms" ? styles.todayTodoBadgeSms : {}),
                        ...(item.done ? styles.todayTodoBadgeDone : {}),
                      }}>
                        {item.done ? "오늘 처리 완료" : item.badge}
                      </span>
                      <div style={styles.todayTodoTextWrap}>
                        <strong style={styles.todayTodoModalName}>{item.title}</strong>
                        <span style={styles.todayTodoModalDescText}>{item.desc}</span>
                      </div>
                    </div>

                    {item.done ? (
                      <span style={styles.todayTodoDoneText}>완료 표시 유지</span>
                    ) : (
                      <div style={styles.todayTodoActionRow}>
                        {item.type === "sms" ? (
                          <button
                            type="button"
                            onClick={() => sendTodayTodoScheduleSMS(item)}
                            style={styles.todayTodoActionButtonPrimary}
                          >
                            문자
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openTodayTodoFreeSms(item)}
                              style={styles.todayTodoActionButton}
                            >
                              문자
                            </button>
                            <button
                              type="button"
                              onClick={() => openTodayTodoContact(item, "pending")}
                              style={styles.todayTodoActionButtonPrimary}
                            >
                              상담기록
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => markTodayTodoDone(item)}
                          style={styles.todayTodoActionButtonSoft}
                        >
                          완료
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <TodayScheduleSectionV2
schedules={schedules}
smsMode={smsMode}
getCurrentSMSSchedule={getCurrentSMSSchedule}
smsIndex={smsIndex}
smsQueue={smsQueue}
getCurrentSMSTargetMember={getCurrentSMSTargetMember}
formatScheduleRange={formatScheduleRange}
sendCurrentScheduleSMS={sendCurrentScheduleSMS}
markCurrentSMSSentAndNext={markCurrentSMSSentAndNext}
skipCurrentSMS={skipCurrentSMS}
stopTodaySMSQueue={stopTodaySMSQueue}
startTodaySMSQueue={startTodaySMSQueue}
getScheduleMember={getScheduleMember}
getLatestConditionForMember={getLatestConditionForMember}
getConditionPreviewText={getConditionPreviewText}
renderScheduleQuickButtons={renderScheduleQuickButtons}
getSchedulePreferenceTags={getSchedulePreferenceTags}
getScheduleMemberPtText={getScheduleMemberPtText}
lastWorkoutMap={lastWorkoutMap}
getLastWorkoutSummary={getLastWorkoutSummary}
lastAction={lastAction}
undo={undo}
/>

      <section style={styles.mainLauncherGrid}>
        <button onClick={openScheduleCheckModal} style={styles.mainLauncherButton}>
          <span style={styles.mainLauncherIcon}>▦</span>
          <strong>스케줄</strong>
          <small>확인 / 추가</small>
        </button>
        <button onClick={() => setShowAddModal(true)} style={styles.mainLauncherButton}>
          <span style={styles.mainLauncherIcon}>＋</span>
          <strong>회원 추가</strong>
          <small>신규 등록</small>
        </button>
        <button onClick={() => openMemberListModal("회원 목록", true, false)} style={styles.mainLauncherButton}>
          <span style={styles.mainLauncherIcon}>☰</span>
          <strong>회원 목록</strong>
          <small>검색 / 관리</small>
        </button>
        <button onClick={() => setShowTodayTodoModal(true)} style={styles.mainLauncherButton}>
          <span style={styles.mainLauncherIcon}>✓</span>
          <strong>오늘 할 일</strong>
          <small>필요할 때 확인</small>
        </button>
        <button onClick={() => setShowSalesModal(true)} style={styles.mainLauncherButton}>
          <span style={styles.mainLauncherIcon}>▥</span>
          <strong>매출 관리</strong>
          <small>현황 확인</small>
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

      {showSalesModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>매출 관리</h2>
                <p style={styles.whiteMuted}>회원 앞에 바로 노출되지 않도록 필요한 때만 확인합니다.</p>
              </div>
              <button onClick={() => setShowSalesModal(false)} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.salesModalGrid}>
              <div style={styles.whiteSalesCard}>
                <p style={styles.whiteSalesLabel}>이번달 매출</p>
                <strong style={styles.whiteSalesValue}>{salesData.total.toLocaleString("ko-KR")}원</strong>
              </div>
              <div style={styles.whiteSalesCard}>
                <p style={styles.whiteSalesLabel}>결제 회원</p>
                <strong style={styles.whiteSalesValue}>{salesData.count}명</strong>
              </div>
              <div style={styles.whiteSalesCard}>
                <p style={styles.whiteSalesLabel}>객단가</p>
                <strong style={styles.whiteSalesValue}>{salesData.average.toLocaleString("ko-KR")}원</strong>
              </div>
              <div style={styles.whiteSalesCard}>
                <p style={styles.whiteSalesLabel}>재등록 전환율</p>
                <strong style={styles.whiteSalesValue}>{reRegisterStats.rate}%</strong>
                <p style={styles.whiteSalesMiniText}>{reRegisterStats.converted}/{reRegisterStats.success}명</p>
              </div>
            </div>
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

      {showTrainerLogModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>대표 개인 기록</h2>
                <p style={styles.whiteMuted}>대표님의 인바디와 개인 운동일지를 따로 기록합니다. 회원 기록과 섞이지 않습니다.</p>
              </div>

              <button onClick={closeTrainerLogModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.whiteTabRow}>
              <button
                type="button"
                onClick={() => setTrainerLogTab("workout")}
                style={trainerLogTab === "workout" ? styles.whiteTabActive : styles.whiteTab}
              >
                개인 운동일지
              </button>
              <button
                type="button"
                onClick={() => setTrainerLogTab("inbody")}
                style={trainerLogTab === "inbody" ? styles.whiteTabActive : styles.whiteTab}
              >
                개인 인바디
              </button>
            </div>

            {trainerLogTab === "workout" ? (
              <div style={styles.personalLogGrid}>
                <section style={styles.personalFormBox}>
                  <div style={styles.personalSectionHeader}>
                    <div>
                      <h3 style={styles.personalSectionTitle}>오늘 운동 기록</h3>
                      <p style={styles.personalMiniInfo}>
                        전시간 부위: {(() => {
                          const latest = getLatestTrainerWorkoutLog();
                          return latest && Array.isArray(latest.body_parts) && latest.body_parts.length > 0
                            ? latest.body_parts.join(", ")
                            : "최근 기록 없음";
                        })()}
                      </p>
                    </div>
                    <button type="button" onClick={openTrainerWorkoutHistoryModal} style={styles.whiteSmallButton}>
                      최근 운동기록 보기
                    </button>
                  </div>

                  {getLatestTrainerWorkoutLog() && (
                    <div style={styles.personalReferenceBox}>
                      <strong>전시간 기록</strong>
                      <p>{summarizeTrainerWorkoutLogShort(getLatestTrainerWorkoutLog())}</p>
                    </div>
                  )}

                  {getTrainerSelectedPartReferenceLog() && (
                    <div style={styles.personalReferenceBox}>
                      <strong>선택한 부위 최근 기록</strong>
                      <p>{summarizeTrainerWorkoutLogShort(getTrainerSelectedPartReferenceLog())}</p>
                    </div>
                  )}

                  <label style={styles.whiteLabel}>날짜</label>
                  <input
                    type="date"
                    value={trainerWorkoutDate}
                    onChange={(e) => setTrainerWorkoutDate(e.target.value)}
                    style={styles.whiteInput}
                  />

                  <label style={styles.whiteLabel}>운동 유형</label>
                  <div style={styles.whitePillRow}>
                    {["weight", "circuit", "cardio", "stretch"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => changeTrainerWorkoutType(type)}
                        style={trainerWorkoutType === type ? styles.whitePillActive : styles.whitePill}
                      >
                        {type === "weight" ? "웨이트" : type === "circuit" ? "서킷" : type === "cardio" ? "유산소" : "스트레칭"}
                      </button>
                    ))}
                  </div>

                  <label style={styles.whiteLabel}>운동 부위</label>
                  <div style={styles.whitePillRow}>
                    {weightBodyPartOptions.map((part) => (
                      <button
                        key={part}
                        type="button"
                        onClick={() => toggleTrainerWorkoutBodyPart(part)}
                        style={trainerWorkoutBodyParts.includes(part) ? styles.whitePillActive : styles.whitePill}
                      >
                        {trainerWorkoutBodyParts.includes(part) ? `✓ ${part}` : part}
                      </button>
                    ))}
                  </div>

                  <div style={styles.personalExerciseTopRow}>
                    <label style={styles.whiteLabel}>운동명 / 세트</label>
                    <button type="button" onClick={addTrainerExercise} style={styles.whiteSmallButton}>
                      + 운동 추가
                    </button>
                  </div>

                  <div style={styles.personalExerciseList}>
                    {trainerWorkoutExercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} style={styles.personalExerciseCard}>
                        <div style={styles.personalExerciseHeader}>
                          <input
                            value={exercise.name}
                            onChange={(e) => updateTrainerExerciseName(exerciseIndex, e.target.value)}
                            placeholder="운동명"
                            style={styles.whiteInput}
                          />
                          {trainerWorkoutExercises.length > 1 && (
                            <button type="button" onClick={() => removeTrainerExercise(exerciseIndex)} style={styles.whiteSmallDangerButton}>
                              삭제
                            </button>
                          )}
                        </div>

                        <div style={styles.personalSetHeader}>
                          <span>세트</span>
                          <span>중량</span>
                          <span>횟수</span>
                          <span />
                        </div>

                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} style={styles.personalSetRow}>
                            <strong>{setIndex + 1}</strong>
                            <input
                              value={set.weight}
                              onChange={(e) => updateTrainerSetValue(exerciseIndex, setIndex, "weight", e.target.value)}
                              placeholder="kg"
                              type="number"
                              style={styles.whiteInput}
                            />
                            <input
                              value={set.reps}
                              onChange={(e) => updateTrainerSetValue(exerciseIndex, setIndex, "reps", e.target.value)}
                              placeholder="회"
                              type="number"
                              style={styles.whiteInput}
                            />
                            {exercise.sets.length > 1 ? (
                              <button type="button" onClick={() => removeTrainerSet(exerciseIndex, setIndex)} style={styles.whiteSmallDangerButton}>
                                ×
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        ))}

                        <button type="button" onClick={() => addTrainerSet(exerciseIndex)} style={styles.whiteSmallButton}>
                          + 세트
                        </button>
                      </div>
                    ))}
                  </div>

                  <label style={styles.whiteLabel}>운동 요약 메모</label>
                  <textarea
                    value={trainerExerciseSummary}
                    onChange={(e) => setTrainerExerciseSummary(e.target.value)}
                    placeholder="비워두면 운동명/세트 기준으로 자동 요약됩니다."
                    style={styles.whiteTextarea}
                  />

                  <label style={styles.whiteLabel}>컨디션</label>
                  <div style={styles.whitePillRow}>
                    {[
                      ["good", "좋음"],
                      ["normal", "보통"],
                      ["bad", "나쁨"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTrainerCondition(value)}
                        style={trainerCondition === value ? styles.whitePillActive : styles.whitePill}
                      >
                        {trainerCondition === value ? `✓ ${label}` : label}
                      </button>
                    ))}
                  </div>

                  <label style={styles.whiteLabel}>오늘 이슈</label>
                  <input
                    value={trainerIssue}
                    onChange={(e) => setTrainerIssue(e.target.value)}
                    placeholder="예: 허리 불편, 수면 부족, 집중력 좋음"
                    style={styles.whiteInput}
                  />

                  <label style={styles.whiteLabel}>다음 운동 포인트</label>
                  <input
                    value={trainerNextPlan}
                    onChange={(e) => setTrainerNextPlan(e.target.value)}
                    placeholder="예: 하체 보강, 중량 유지, 어깨 상태 확인"
                    style={styles.whiteInput}
                  />

                  <label style={styles.whiteLabel}>메모</label>
                  <textarea
                    value={trainerWorkoutMemo}
                    onChange={(e) => setTrainerWorkoutMemo(e.target.value)}
                    placeholder="개인적으로 남길 메모"
                    style={styles.whiteTextarea}
                  />

                  <button type="button" onClick={saveTrainerWorkoutLog} style={styles.whiteSaveLargeButton}>
                    개인 운동 저장
                  </button>
                </section>

              </div>
            ) : (
              <div style={styles.personalLogGrid}>
                <section style={styles.personalFormBox}>
                  <h3 style={styles.personalSectionTitle}>개인 인바디 추가</h3>

                  <label style={styles.whiteLabel}>측정일</label>
                  <input
                    type="date"
                    value={trainerInbodyDate}
                    onChange={(e) => setTrainerInbodyDate(e.target.value)}
                    style={styles.whiteInput}
                  />

                  <div style={styles.personalTwoCol}>
                    <div>
                      <label style={styles.whiteLabel}>체중</label>
                      <input value={trainerWeight} onChange={(e) => setTrainerWeight(e.target.value)} placeholder="kg" style={styles.whiteInput} />
                    </div>
                    <div>
                      <label style={styles.whiteLabel}>골격근량</label>
                      <input value={trainerSkeletalMuscle} onChange={(e) => setTrainerSkeletalMuscle(e.target.value)} placeholder="kg" style={styles.whiteInput} />
                    </div>
                    <div>
                      <label style={styles.whiteLabel}>체지방량</label>
                      <input value={trainerBodyFatMass} onChange={(e) => setTrainerBodyFatMass(e.target.value)} placeholder="kg" style={styles.whiteInput} />
                    </div>
                    <div>
                      <label style={styles.whiteLabel}>체지방률</label>
                      <input value={trainerBodyFatPercent} onChange={(e) => setTrainerBodyFatPercent(e.target.value)} placeholder="%" style={styles.whiteInput} />
                    </div>
                  </div>

                  <label style={styles.whiteLabel}>메모</label>
                  <textarea
                    value={trainerInbodyMemo}
                    onChange={(e) => setTrainerInbodyMemo(e.target.value)}
                    placeholder="예: 감량기 시작, 유지기, 컨디션 좋음"
                    style={styles.whiteTextarea}
                  />

                  <button type="button" onClick={saveTrainerInbodyLog} style={styles.whiteSaveLargeButton}>
                    개인 인바디 저장
                  </button>
                </section>

                <section style={styles.personalListBox}>
                  <h3 style={styles.personalSectionTitle}>최근 개인 인바디</h3>
                  {trainerInbodyList.length === 0 ? (
                    <p style={styles.whiteMuted}>아직 개인 인바디 기록이 없습니다.</p>
                  ) : (
                    trainerInbodyList.map((log) => (
                      <div key={log.id} style={styles.personalLogCard}>
                        <div style={styles.personalLogCardTop}>
                          <strong>{formatDate(log.measured_at)}</strong>
                          <button type="button" onClick={() => deleteTrainerInbodyLog(log.id)} style={styles.whiteSmallDangerButton}>
                            삭제
                          </button>
                        </div>
                        <p style={styles.personalLogMain}>
                          체중 {log.weight ?? "-"}kg · 골격근 {log.skeletal_muscle ?? "-"}kg · 체지방률 {log.body_fat_percent ?? "-"}%
                        </p>
                        <p style={styles.personalLogSub}>체지방량 {log.body_fat_mass ?? "-"}kg</p>
                        {log.memo && <p style={styles.personalLogText}>{log.memo}</p>}
                      </div>
                    ))
                  )}
                </section>
              </div>
            )}
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
        <div style={styles.contactRecordOverlay}>
          <section style={styles.contactRecordBox}>
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
        <div style={styles.scheduleFullOverlay}>
          <section style={styles.scheduleFullModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>스케줄 확인</h2>
                <p style={styles.whiteMuted}>왼쪽에서 날짜를 고르고, 오른쪽에서 해당 날짜의 스케줄만 확인합니다.</p>
              </div>

              <button onClick={closeScheduleCheckModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.scheduleFullContent}>
              <div
                style={styles.scheduleFullCalendarPanel}
                onTouchStart={handleScheduleCalendarTouchStart}
                onTouchEnd={handleScheduleCalendarTouchEnd}
              >
                <div style={styles.scheduleMiniCalendarBoxCompact}>
                  <div style={styles.scheduleMiniCalendarHeader}>
                    <button
                      type="button"
                      onClick={() => moveScheduleCheckMonth(-1)}
                      style={styles.scheduleMiniMonthButton}
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowScheduleMonthPicker((current) => !current)}
                      style={styles.scheduleMonthTitleButton}
                    >
                      {getScheduleCheckMonthTitle()}
                    </button>

                    <button
                      type="button"
                      onClick={() => moveScheduleCheckMonth(1)}
                      style={styles.scheduleMiniMonthButton}
                    >
                      ›
                    </button>
                  </div>

                  {showScheduleMonthPicker && (
                    <div style={styles.scheduleMonthPicker}>
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((monthNumber) => (
                        <button
                          key={monthNumber}
                          type="button"
                          onClick={() => setScheduleCheckMonth(monthNumber)}
                          style={
                            new Date(scheduleCheckDate || getTodayDateString()).getMonth() + 1 === monthNumber
                              ? styles.scheduleMonthPickerButtonActive
                              : styles.scheduleMonthPickerButton
                          }
                        >
                          {new Date(scheduleCheckDate || getTodayDateString()).getFullYear()}년 {monthNumber}월
                        </button>
                      ))}
                    </div>
                  )}

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

                <div style={styles.scheduleCheckTopActionsCompact}>
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

                <p style={styles.scheduleSwipeHint}>캘린더 영역에서 좌우로 밀면 월이 이동합니다.</p>
              </div>

              <div style={styles.scheduleFullListPanel}>
                <div style={styles.scheduleSearchBoxSticky}>
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

                <div style={styles.scheduleSelectedDateHeader}>
                  <strong>{formatDate(scheduleCheckDate)}</strong>
                  <span>{scheduleCheckList.length}건</span>
                </div>

                {scheduleCheckList.length === 0 ? (
                  <div style={styles.scheduleCheckEmpty}>
                    이 날짜에 등록된 스케줄이 없습니다.
                  </div>
                ) : (
                  <div style={styles.scheduleCheckListScrollable}>
                    {scheduleCheckList.map((schedule) => renderScheduleCheckItem(schedule, false))}
                  </div>
                )}
              </div>
            </div>
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
                      {getScheduleTypeText(schedule.type)} · {getScheduleMemberNames(schedule)}
                      {getScheduleMemberPtText(schedule) ? ` · ${getScheduleMemberPtText(schedule)}` : ""}
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
            <p style={styles.scheduleFormHint}>{getScheduleMemberSelectHint()}</p>
            <select
              value={scheduleMemberId}
              onChange={(e) => setScheduleMemberId(e.target.value)}
              style={styles.input}
            >
              <option value="">회원을 선택하세요</option>
              {getScheduleSelectableMembers().map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {getMemberTypeText(member.member_type)} · PT {member.pt_remaining || 0}회
                </option>
              ))}
            </select>

            {scheduleType === "group" && (
              <>
                <label style={styles.label}>두 번째 회원 선택</label>
                <select
                  value={scheduleSecondMemberId}
                  onChange={(e) => setScheduleSecondMemberId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">두 번째 회원을 선택하세요</option>
                  {getScheduleSelectableMembers([scheduleMemberId, scheduleThirdMemberId])
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} · {getMemberTypeText(member.member_type)} · PT {member.pt_remaining || 0}회
                      </option>
                    ))}
                </select>

                <label style={styles.label}>세 번째 회원 선택</label>
                <select
                  value={scheduleThirdMemberId}
                  onChange={(e) => setScheduleThirdMemberId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">선택사항 · 최대 3명까지</option>
                  {getScheduleSelectableMembers([scheduleMemberId, scheduleSecondMemberId])
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

            <div style={{marginTop:12,marginBottom:12,padding:16,borderRadius:18,background:"#f7f7f7",border:"1px solid #e2e2e2"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:10}}>
                <div>
                  <strong style={{fontSize:16,color:"#111"}}>이전 운동 확인</strong>
                  <p style={{margin:"4px 0 0",fontSize:13,color:"#777",fontWeight:800}}>선택한 회원의 최근 운동 기록을 보고 오늘 부위를 정하세요.</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadPreviousWorkoutsForScheduleForm(getScheduleFormMemberIds(), scheduleDate)}
                  style={{border:"1px solid #ddd",background:"#fff",borderRadius:12,padding:"9px 12px",fontWeight:900,color:"#111"}}
                >
                  새로고침
                </button>
              </div>

              {schedulePreviousWorkoutLoading ? (
                <p style={{margin:0,color:"#777",fontWeight:800}}>이전 운동을 불러오는 중입니다.</p>
              ) : schedulePreviousWorkoutList.length === 0 ? (
                <p style={{margin:0,color:"#777",fontWeight:800}}>회원을 선택하면 이전 운동이 표시됩니다.</p>
              ) : (
                <div style={{display:"grid",gap:8}}>
                  {schedulePreviousWorkoutList.map((item) => {
                    const summary = getLastWorkoutSummary(item.workout);
                    return (
                      <div key={item.memberId} style={{padding:12,borderRadius:14,background:"#fff",border:"1px solid #e5e5e5"}}>
                        <strong style={{display:"block",fontSize:15,color:"#111",marginBottom:5}}>
                          {item.member?.name || "회원"}
                        </strong>
                        {summary ? (
                          <div style={{fontSize:13,color:"#444",fontWeight:800,lineHeight:1.55}}>
                            <div>{summary.workoutDate ? `${formatDate(summary.workoutDate)} · ` : ""}{summary.bodyPartText ? `지난부위: ${summary.bodyPartText}` : "지난부위 기록 없음"}</div>
                            <div>지난운동: {summary.exerciseText}</div>
                            {summary.conditionLine ? <div>{summary.conditionLine}</div> : null}
                          </div>
                        ) : (
                          <p style={{margin:0,fontSize:13,color:"#777",fontWeight:800}}>저장된 운동 기록이 없습니다.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            {(!scheduleRepeatEnabled || editingSchedule) && (
              <>
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
                            {getScheduleTypeText(schedule.type)} · {getScheduleMemberNames(schedule)}
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
                  같은 시간대에는 수업 1개만 등록할 수 있습니다.
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

              </>
            )}

            {!editingSchedule && (
              <div style={{marginTop:12,marginBottom:12,padding:16,borderRadius:18,background:scheduleRepeatEnabled ? "#f7f7f7" : "#fff",border:"1px solid #e2e2e2"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                  <div>
                    <strong style={{display:"block",fontSize:16,color:"#111",marginBottom:5}}>여러 수업 한 번에 등록</strong>
                    <p style={{margin:0,fontSize:13,color:"#777",fontWeight:800}}>켜면 아래 일반 날짜·시간 선택은 숨기고, 회차별 날짜·시간·운동부위만 저장합니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !scheduleRepeatEnabled;
                      setScheduleRepeatEnabled(next);
                      if (next) resetScheduleRepeatItems(Number(scheduleRepeatCount || 4) < 2 ? 4 : scheduleRepeatCount);
                      if (!next) {
                        setScheduleRepeatCount(1);
                        setScheduleRepeatItems([]);
                      }
                    }}
                    style={{
                      border:"1px solid #ddd",
                      borderRadius:14,
                      padding:"11px 16px",
                      background:scheduleRepeatEnabled ? "#222" : "#fff",
                      color:scheduleRepeatEnabled ? "#fff" : "#111",
                      fontWeight:900,
                      whiteSpace:"nowrap"
                    }}
                  >
                    {scheduleRepeatEnabled ? "일반 등록으로 돌아가기" : "여러 개 등록하기"}
                  </button>
                </div>

                {scheduleRepeatEnabled && (
                  <>
                    <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:10,marginTop:12,alignItems:"end"}}>
                      <div>
                        <label style={{...styles.label,marginTop:0}}>등록 개수</label>
                        <select
                          value={scheduleRepeatCount}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setScheduleRepeatCount(value);
                            resetScheduleRepeatItems(value);
                          }}
                          style={styles.input}
                        >
                          {[2,3,4,5,6,7,8].map((count) => (
                            <option key={count} value={count}>{count}개</option>
                          ))}
                        </select>
                      </div>
                      <p style={{margin:"0 0 12px",fontSize:13,color:"#666",fontWeight:900,lineHeight:1.55}}>
                        처음에는 1주일 간격으로 자동 배치됩니다. 각 회차의 날짜·시간·운동부위를 직접 바꾼 뒤 맨 아래 저장을 누르세요.
                      </p>
                    </div>

                    <div style={{display:"grid",gap:10,marginTop:12}}>
                      {getScheduleRepeatItems().map((item, index) => (
                        <div key={`repeat-${index}`} style={{padding:12,borderRadius:16,background:"#fff",border:"1px solid #e5e5e5"}}>
                          <div style={{display:"grid",gridTemplateColumns:"70px 1fr 1fr",gap:10,alignItems:"center"}}>
                            <strong style={{fontSize:14,color:"#111"}}>{index + 1}회차</strong>
                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) => updateScheduleRepeatItem(index, { date: e.target.value })}
                              style={styles.input}
                            />
                            <select
                              value={item.startTime}
                              onChange={(e) => updateScheduleRepeatItem(index, { startTime: e.target.value })}
                              style={styles.input}
                            >
                              <option value="">시간 선택</option>
                              {getTimeOptions().map((time) => (
                                <option key={time} value={time}>
                                  {formatTime(time)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(0, 1fr))",gap:8,marginTop:10}}>
                            {SCHEDULE_BODY_PART_OPTIONS.map((part) => {
                              const selected = Array.isArray(item.bodyParts) && item.bodyParts.includes(part);
                              return (
                                <button
                                  key={`${index}-${part}`}
                                  type="button"
                                  onClick={() => toggleScheduleRepeatItemBodyPart(index, part)}
                                  style={{
                                    border:selected ? "1px solid #222" : "1px solid #ddd",
                                    borderRadius:12,
                                    background:selected ? "#222" : "#fff",
                                    color:selected ? "#fff" : "#111",
                                    padding:"10px 8px",
                                    fontWeight:900,
                                  }}
                                >
                                  {part}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

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
                  선택한 시간이 기존 스케줄과 겹칩니다. 1시간에는 수업 1개만 등록할 수 있습니다.
                </div>
              )}

            <label style={styles.label}>구분</label>
            <p style={styles.scheduleFormHint}>OT/상담은 PT가 0회인 일반 회원도 등록할 수 있고, 완료해도 PT가 차감되지 않습니다.</p>
            <select
              value={scheduleType}
              onChange={(e) => {
                const nextType = e.target.value;
                setScheduleType(nextType);

                if (nextType === "group") {
                  const selectedMember = activeMembers.find((member) => member.id === scheduleMemberId);
                  if (selectedMember && selectedMember.member_type !== "group") {
                    setScheduleMemberId("");
                  }
                } else {
                  setScheduleSecondMemberId("");
                  setScheduleThirdMemberId("");
                }
              }}
              style={styles.input}
            >
              <option value="pt">PT</option>
              <option value="group">그룹PT</option>
              <option value="ot">OT</option>
              <option value="consult">상담</option>
            </select>


            {(!scheduleRepeatEnabled || editingSchedule) && (
              <>
            <div style={styles.scheduleBodyPartBox}>
              <div style={styles.scheduleBodyPartHeader}>
                <div>
                  <label style={styles.scheduleBodyPartTitle}>운동부위 <span style={styles.scheduleBodyPartSubTitle}>(복수 선택)</span></label>
                  <p style={styles.scheduleBodyPartHint}>수업 전에 오늘 진행할 부위를 선택하세요.</p>
                </div>
              </div>

              <div style={styles.scheduleBodyPartGrid}>
                {SCHEDULE_BODY_PART_OPTIONS.map((part) => {
                  const selected = scheduleBodyParts.includes(part);
                  return (
                    <button
                      key={part}
                      type="button"
                      onClick={() => toggleScheduleBodyPart(part)}
                      style={{
                        ...styles.scheduleBodyPartChip,
                        ...(selected ? styles.scheduleBodyPartChipActive : {}),
                      }}
                    >
                      {part}
                    </button>
                  );
                })}
              </div>

              <div style={styles.scheduleBodyPartSelectedLine}>
                <span style={styles.scheduleBodyPartSelectedLabel}>선택됨</span>
                <span style={styles.scheduleBodyPartSelectedText}>
                  {scheduleBodyParts.length > 0 ? scheduleBodyParts.join(" · ") : "없음"}
                </span>
              </div>
            </div>

              </>
            )}

            <label style={styles.label}>메모</label>
            <textarea
              value={scheduleMemo}
              onChange={(e) => setScheduleMemo(e.target.value)}
              placeholder="예: 하체, 체형상담, 보강수업"
              style={styles.textarea}
            />

            <div style={styles.editActions}>
              <button onClick={addSchedule} style={styles.primaryButton}>
                {editingSchedule ? "수정 저장" : scheduleRepeatEnabled ? "여러 수업 저장" : scheduleType === "group" ? "그룹PT 저장" : "저장"}
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

            <label style={styles.label}>회원 단계</label>
            <select
              value={memberStage}
              onChange={(e) => setMemberStage(e.target.value)}
              style={styles.input}
            >
              {memberStageOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
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

            <label style={styles.whiteLabel}>회원 단계</label>
            <select
              value={editMemberStage}
              onChange={(e) => setEditMemberStage(e.target.value)}
              style={styles.whiteInput}
            >
              {memberStageOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
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
              <div style={styles.detailHeaderLeft}>
                <div style={styles.detailNameLine}>
                  <h2 style={styles.detailName}>{selectedMember.name}</h2>
                  <span style={getDetailPtPillStyle(selectedMember.pt_remaining || 0)}>
                    PT {selectedMember.pt_remaining || 0}회 남음
                  </span>
                  <span style={getMemberStageBadgeStyle(selectedMember.member_stage)}>{getMemberStageText(selectedMember.member_stage)}</span>
                  <button
                    type="button"
                    onClick={() => openPtModal(selectedMember)}
                    style={styles.detailHeaderPassButton}
                  >
                    + 이용권
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedMember?.phone) {
                        alert("회원 전화번호가 없어요.");
                        return;
                      }
                      const phone = String(selectedMember.phone).replace(/[^0-9]/g, "");
                      window.location.href = `sms:${phone}`;
                    }}
                    style={styles.detailHeaderPassButton}
                  >
                    문자
                  </button>
                </div>
                      {(getPreferenceTags(selectedMember).length > 0 || getOtSummaryTags(selectedMember).length > 0) && (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
      marginBottom: 8,
    }}
  >
    {getOtSummaryTags(selectedMember).map((tag) => (
      <div
        key={`ot-${tag}`}
        style={{
          background: "#fff7ed",
          color: "#111",
          padding: "6px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
          border: "1px solid #fed7aa",
        }}
      >
        OT {tag}
      </div>
    ))}
    {getPreferenceTags(selectedMember).map((tag) => (
      <div
        key={`pref-${tag}`}
        style={{
          background: "#f3f4f6",
          color: "#111",
          padding: "6px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {tag}
      </div>
    ))}
  </div>
)}
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

                {renderWorkoutPatternBox()}

                <div style={styles.menuGrid}>
                  <button onClick={() => setDetailMode("info")} style={styles.menuButton}>
                    회원 정보
                  </button>
                  <button onClick={() => openContactModal(selectedMember, "pending")} style={styles.menuButton}>
                    상담기록
                  </button>
                  <button onClick={() => setDetailMode("preference")} style={styles.menuButton}>
                    성향 메모
                  </button>
                  <button onClick={() => setDetailMode("otCheck")} style={styles.menuButton}>
                    OT 성향체크
                  </button>
                  <button
                    type="button"
                    style={styles.menuButton}
                    onClick={() => sendOtCheckSms(selectedMember)}
                  >
                    OT 성향체크 문자
                  </button>
                  <button
                    type="button"
                    style={styles.menuButton}
                    onClick={() => {
                      if (!selectedMember?.phone) {
                        alert("회원 전화번호가 없어요.");
                        return;
                      }

                      const link = `${window.location.origin}/preference/${selectedMember.id}`;
                      const message = `안녕하세요 스포테이너 피트니스 팀장 김선수입니다😊

회원님의 운동 스타일과 목표를 이해하고 보다 효율적인 수업 방향을 설계하기 위해 간단한 체크리스트 작성 부탁드려요🙂‍↕️

작성해주신 내용은 회원님 운동 스타일과 성향을 파악하고 앞으로 수업 방향을 잡는 데 도움이 됩니다 :)

${link}`;
                      const phone = String(selectedMember.phone).replace(/[^0-9]/g, "");
                      window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
                    }}
                  >
                    성향체크 문자
                  </button>
                  <button onClick={() => setDetailMode("pt")} style={styles.menuButton}>
                    PT 사용 기록
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
                  <button onClick={() => openMemberScheduleSearch(selectedMember)} style={styles.menuButton}>
                    스케줄 확인
                  </button>
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

                <div style={styles.infoTitleRow}>
                  <h3 style={styles.subTitle}>회원 관리 정보</h3>
                  <button
                    type="button"
                    onClick={() => startEdit(selectedMember)}
                    style={styles.infoEditButton}
                  >
                    회원정보 수정
                  </button>
                </div>
                {renderInfoBlock("키", selectedMember.height ? `${selectedMember.height}cm` : "")}
                {renderInfoBlock("목표", selectedMember.goal)}
                {renderInfoBlock("특이사항", selectedMember.note)}
                {renderInfoBlock("트레이너 메모", selectedMember.memo)}
              </>
            )}

            {detailMode === "otCheck" && (
  <>
    <div style={styles.recordHeader}>
      <h3 style={styles.subTitle}>OT 회원 성향체크 (중복선택 가능)</h3>
      <button type="button" onClick={saveOtCheck} style={styles.smallDark}>
        저장
      </button>
    </div>

    <div style={preferenceStyles.noticeBox}>
      <div style={preferenceStyles.noticeTitle}>
        OT수업 전에 회원님의 운동 스타일과 운동 목적을 확인하는 기본 체크예요.
      </div>
      <div style={preferenceStyles.noticeText}>
        통증 부위, 터치 민감도, 운동 스타일을 미리 저장해두면 수업 전에 바로 확인할 수 있어요.
      </div>
    </div>

    {getOtSummaryTags({
      ot_pain_parts: stringifyPreferenceValue(otPainParts),
      ot_concerns: stringifyPreferenceValue(otConcerns),
      ot_workout_style: stringifyPreferenceValue(otWorkoutStyle),
      ot_touch_style: stringifyPreferenceValue(otTouchStyle),
      ot_condition: stringifyPreferenceValue(otCondition),
    }).length > 0 && (
      <div style={preferenceStyles.summaryTagBox}>
        {getOtSummaryTags({
          ot_pain_parts: stringifyPreferenceValue(otPainParts),
          ot_concerns: stringifyPreferenceValue(otConcerns),
          ot_workout_style: stringifyPreferenceValue(otWorkoutStyle),
          ot_touch_style: stringifyPreferenceValue(otTouchStyle),
          ot_condition: stringifyPreferenceValue(otCondition),
        }).map((tag) => (
          <span key={tag} style={preferenceStyles.summaryTag}>{tag}</span>
        ))}
      </div>
    )}

    {otCheckSections.map(renderOtCheckSection)}

    <button type="button" onClick={saveOtCheck} style={preferenceStyles.saveButton}>
      OT 성향체크 저장
    </button>
  </>
)}

            {detailMode === "preference" && (
  <>
    <div style={styles.recordHeader}>
      <h3 style={styles.subTitle}>회원 성향 메모</h3>
      <button type="button" onClick={saveMemberPreference} style={styles.smallDark}>
        저장
      </button>
    </div>

    <div style={preferenceStyles.noticeBox}>
      <div style={preferenceStyles.noticeTitle}>
        회원님이 편하게 운동할 수 있게 기억해두는 메모예요.
      </div>
      <div style={preferenceStyles.noticeText}>
        수업 강도, 말투, 터치 범위, 대화 스타일을 기록해두면 피드백 문자도 회원 성향에 맞춰 더 자연스럽게 보낼 수 있어요.
      </div>
    </div>

    <div style={preferenceStyles.section}>
      <div style={preferenceStyles.label}>트레이닝 스타일</div>
      <div style={preferenceStyles.helper}>회원님이 운동할 때 어떤 방식이 편한지 체크해요. 중복 선택 가능해요.</div>
      <div style={preferenceStyles.grid3}>
        {[
          "강하게 밀어주세요 (운동할 땐 확실하게 하는 게 좋아요)",
          "부드럽고 편하게 해주세요 (칭찬과 격려가 편해요)",
          "천천히 맞춰주세요 (부담 없이 운동하고 싶어요)",
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setPrefIntensity((prev) => togglePreferenceValue(prev, label))}
            style={{
              ...preferenceStyles.optionButton,
              ...(prefIntensity.includes(label) ? preferenceStyles.activeButton : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div style={preferenceStyles.section}>
      <div style={preferenceStyles.label}>관리 스타일</div>
      <div style={preferenceStyles.helper}>운동 외에 식단, 생활습관, 컨디션을 어느 정도 챙기면 좋을지 기록해요.</div>
      <div style={preferenceStyles.grid3}>
        {[
          "꼼꼼하게 관리해주세요 (식단, 생활습관도 같이 체크받고 싶어요)",
          "적당히 체크만 해주세요 (필요한 부분만 편하게 관리받고 싶어요)",
          "운동에만 집중하고 싶어요 (간섭은 최소한이 좋아요)",
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setPrefManagementStyle((prev) => togglePreferenceValue(prev, label))}
            style={{
              ...preferenceStyles.optionButton,
              ...(prefManagementStyle.includes(label) ? preferenceStyles.activeButton : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div style={preferenceStyles.section}>
      <div style={preferenceStyles.label}>자세 잡을 때 터치</div>
      <div style={preferenceStyles.helper}>여성전용 수업에서 꼭 확인해두면 좋은 부분이에요.</div>
      <div style={preferenceStyles.grid3}>
        {[
          "괜찮아요 (자세 잡을 때 필요한 터치는 괜찮아요)",
          "가능하지만 최소한으로 해주세요 (미리 설명해주면 좋아요)",
          "조금 불편해요 (터치 없이 설명해주세요)",
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setPrefTouchStyle((prev) => togglePreferenceValue(prev, label))}
            style={{
              ...preferenceStyles.optionButton,
              ...(prefTouchStyle.includes(label) ? preferenceStyles.activeButton : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div style={preferenceStyles.section}>
      <div style={preferenceStyles.label}>대화 스타일</div>
      <div style={preferenceStyles.helper}>수업 중 대화 방식에 대해 편한 쪽을 체크해요.</div>
      <div style={preferenceStyles.grid3}>
        {[
          "편한 분위기로 운동하고 싶어요 (가볍게 대화하는 건 괜찮아요)",
          "운동에 집중하는 분위기가 좋아요 (필요한 설명 위주가 편해요)",
          "먼저 물어봐주시면 편해요 (제가 먼저 말하는 건 조금 어려워요)",
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setPrefCommunicationStyle((prev) => togglePreferenceValue(prev, label))}
            style={{
              ...preferenceStyles.optionButton,
              ...(prefCommunicationStyle.includes(label) ? preferenceStyles.activeButton : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div style={preferenceStyles.section}>
      <div style={preferenceStyles.label}>수업 분위기</div>
      <div style={preferenceStyles.helper}>원하시는 수업 분위기에 가까운 항목을 체크해요.</div>
      <div style={preferenceStyles.grid3}>
        {[
          "밝고 편한 분위기가 좋아요",
          "차분하게 운동하는 분위기가 좋아요",
          "컨디션에 맞춰 조절해주세요",
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setPrefClassMood((prev) => togglePreferenceValue(prev, label))}
            style={{
              ...preferenceStyles.optionButton,
              ...(prefClassMood.includes(label) ? preferenceStyles.activeButton : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div style={preferenceStyles.section}>
      <div style={preferenceStyles.label}>선생님께 바라는 점</div>
      <div style={preferenceStyles.helper}>회원님이 편하게 운동하기 위해 따로 남겨두고 싶은 내용이에요.</div>
      <textarea
        value={prefRequestNote}
        onChange={(e) => setPrefRequestNote(e.target.value)}
        placeholder="예: 설명을 조금 더 자세히 듣고 싶어요 / 조용히 운동하고 싶어요 / 힘들 때는 조금 끌어주셔도 괜찮아요"
        style={preferenceStyles.textarea}
      />
    </div>

    <button type="button" onClick={saveMemberPreference} style={preferenceStyles.saveButton}>
      성향 메모 저장
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
              </>
            )}
          </section>
          <button
            type="button"
            onClick={() => {
              if (detailMode === "menu") closeDetail();
              else setDetailMode("menu");
            }}
            style={styles.detailFloatingBackButton}
          >
            뒤로
          </button>
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
                {workoutReturnSource === "scheduleCheckGroup" && groupWorkoutQueue.length > 1 && (
                  <p style={styles.muted}>그룹PT 운동기록 {groupWorkoutIndex + 1}/{groupWorkoutQueue.length}</p>
                )}
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
                      setWorkoutBodyParts([]);
                      setWorkoutExercises([createEmptyWorkoutExercise("weight")]);
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
                      setWorkoutBodyParts([]);
                      setWorkoutExercises([createEmptyWorkoutExercise("circuit")]);
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
                        ? "서킷 모드 · 단계 선택 시 3세트가 한 번에 자동 생성됩니다."
                        : "웨이트 모드 · 운동 추가 시 기본 4세트가 자동 생성되고, 필요 없는 세트는 삭제하세요."}
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

                {workoutTrainingType === "weight" && (
                  <div style={styles.weightBodyPartBox}>
                    <div style={styles.weightBodyPartHeader}>
                      <strong>오늘 운동부위</strong>
                      <span>중복 선택 가능</span>
                    </div>

                    <div style={styles.weightBodyPartGrid}>
                      {weightBodyPartOptions.map((part) => {
                        const selected = workoutBodyParts.includes(part);

                        return (
                          <button
                            key={part}
                            type="button"
                            onClick={() => toggleWorkoutBodyPart(part)}
                            style={selected ? styles.weightBodyPartButtonActive : styles.weightBodyPartButton}
                          >
                            {selected ? `✓ ${part}` : part}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {workoutTrainingType === "weight" && workoutBodyParts.length > 0 && (
                  <div style={styles.recentBodyReferenceBox}>
                    <div style={styles.recentBodyReferenceHeader}>
                      <div>
                        <strong>최근 {getSelectedBodyPartLabel()} 운동 참고</strong>
                        <p>지난 기록은 참고만 하고, 오늘 할 운동명만 눌러 추가하세요.</p>
                      </div>
                      <span>{getRecentBodyPartSessions().length}개 기록</span>
                    </div>

                    {getRecentBodyPartSessions().length === 0 ? (
                      <p style={styles.recentBodyReferenceEmpty}>
                        참고할 수 있는 이전 운동기록이 없습니다. 오늘 기록부터 쌓이면 다음 수업부터 더 정확하게 보여집니다.
                      </p>
                    ) : (
                      <div style={styles.recentBodyReferenceList}>
                        {getRecentBodyPartSessions().map((session) => {
                          const names = getSessionExerciseNames(session);

                          return (
                            <div key={session.id} style={styles.recentBodyReferenceCard}>
                              <div style={styles.recentBodyReferenceDate}>
                                <strong>{formatDate(session.workout_date || session.created_at)}</strong>
                                <span>{session.__referenceLabel || getWorkoutSessionBodyParts(session).join(", ")}</span>
                              </div>

                              <div style={styles.recentBodyExerciseWrap}>
                                {names.map((name) => {
                                  const added = isExerciseAlreadyAdded(name);

                                  return (
                                    <button
                                      key={`${session.id}-${name}`}
                                      type="button"
                                      onClick={() => addReferenceExercise(name)}
                                      disabled={added}
                                      style={added ? styles.recentBodyExerciseButtonAdded : styles.recentBodyExerciseButton}
                                    >
                                      {added ? `✓ ${name}` : `+ ${name}`}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {workoutTrainingType === "circuit" && (
                <div style={styles.circuitProgramBox}>
                  <strong>전신 서킷 자동 입력</strong>
                  <p>단계 버튼을 누르면 해당 서킷 운동이 3세트 고정으로 한 번에 생성됩니다.</p>

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
                    웨이트는 기본 4세트, 서킷은 기본 3세트로 자동 생성됩니다. 필요 없는 세트만 삭제하세요.
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

                  <label style={styles.label}>체크사항</label>
                  <textarea
                    value={workoutIssue}
                    onChange={(e) => setWorkoutIssue(e.target.value)}
                    placeholder="예: 집중력 좋음, 좌우 차이 적음, 좌우 흔들림"
                    style={styles.textarea}
                  />

                  <label style={styles.label}>다음운동</label>
                  <textarea
                    value={workoutNextPlan}
                    onChange={(e) => setWorkoutNextPlan(e.target.value)}
                    placeholder="예: 어깨 / 스트레칭 먼저, 어깨 / 하체"
                    style={styles.textarea}
                  />

                  <label style={styles.label}>총평</label>
                  <input
                    value={workoutTrainerNote}
                    onChange={(e) => setWorkoutTrainerNote(e.target.value)}
                    placeholder="예: 폼 좋음 / 폼 무너짐 / 컨디션 좋음"
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

                {isReRegisterTarget(workoutMember) && (
                  <div style={styles.reRegisterWorkoutBox}>
                    <div style={styles.reRegisterWorkoutText}>
                      <strong>{getReRegisterAlert(workoutMember).title}</strong>
                      <span>{getReRegisterAlert(workoutMember).text}</span>
                    </div>

                    <div style={styles.reRegisterWorkoutActions}>
                      <button
                        type="button"
                        onClick={() => openContactModal(workoutMember, "pending")}
                        style={styles.reRegisterSubButton}
                      >
                        상담 기록
                      </button>
                      <button
                        type="button"
                        onClick={() => sendReRegisterSMS(workoutMember)}
                        style={styles.reRegisterMainButton}
                      >
                        권유 문자
                      </button>
                    </div>
                  </div>
                )}

                <div style={styles.workoutSaveActions}>
                  <button
                    type="button"
                    onClick={() => saveWorkout({ openFeedback: false })}
                    style={styles.workoutSaveButton}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => saveWorkout({ openFeedback: true })}
                    style={styles.workoutFeedbackButton}
                  >
                    저장 후 피드백
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkoutMode("select")}
                    style={styles.workoutCancelButton}
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </section>
          <button
            type="button"
            onClick={goBackFromWorkout}
            style={styles.detailFloatingBackButton}
          >
            뒤로
          </button>
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
                const isOpen = expandedWorkoutSessionId === session.id;
                const totalSets = groups.reduce((sum, group) => sum + group.sets.length, 0);
                const firstName = groups[0]?.exerciseName || "운동 상세 없음";
                const summaryText = groups.length > 1 ? `${firstName} 외 ${groups.length - 1}개` : firstName;

                return (
                  <div key={session.id} style={styles.whiteWorkoutCard}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWorkoutSessionId((current) =>
                          current === session.id ? null : session.id
                        )
                      }
                      style={styles.whiteRecordSummaryButton}
                    >
                      <div>
                        <h3 style={styles.whiteWorkoutDate}>{formatDate(session.workout_date)}</h3>
                        {Array.isArray(session.body_parts) && session.body_parts.length > 0 && (
                          <p style={styles.whiteRecordBodyParts}>부위: {session.body_parts.join(", ")}</p>
                        )}
                        <p style={styles.whiteRecordSummaryTitle}>{summaryText}</p>
                        <p style={styles.whiteMuted}>총 {totalSets}세트 · 클릭해서 상세 확인</p>
                      </div>
                      <strong style={styles.whiteRecordChevron}>{isOpen ? "접기" : "보기"}</strong>
                    </button>

                    {isOpen && (
                      <div style={styles.whiteExpandedArea}>
                        {groups.length === 0 ? (
                          <p style={styles.whiteMuted}>운동 상세 없음</p>
                        ) : (
                          <div style={styles.whiteWorkoutTable}>
                            <div style={styles.whiteWorkoutTableHeader}>
                              <span>운동명</span>
                              <span>세트 내용</span>
                              <span>관리</span>
                            </div>

                            {groups.map((group, groupIndex) => (
                              <div key={group.key} style={styles.whiteWorkoutTableRow}>
                                <div style={styles.whiteWorkoutTableName}>
                                  {groupIndex + 1}. {group.exerciseName}
                                </div>

                                <div style={styles.whiteWorkoutSetChips}>
                                  {group.sets.map((set, setIndex) =>
                                    editingWorkoutSetId === set.id ? (
                                      <div key={set.id || `${group.key}-${setIndex}`} style={styles.whiteInlineEditBox}>
                                        <input
                                          value={editWorkoutName}
                                          onChange={(e) => setEditWorkoutName(e.target.value)}
                                          placeholder="운동명"
                                          style={styles.whiteInlineInput}
                                        />
                                        <input
                                          value={editWorkoutWeight}
                                          onChange={(e) => setEditWorkoutWeight(e.target.value)}
                                          placeholder="중량"
                                          type="number"
                                          style={styles.whiteInlineInput}
                                        />
                                        <input
                                          value={editWorkoutReps}
                                          onChange={(e) => setEditWorkoutReps(e.target.value)}
                                          placeholder="횟수"
                                          type="number"
                                          style={styles.whiteInlineInput}
                                        />
                                        <button onClick={() => saveWorkoutSetEdit(set)} style={styles.whiteSaveButton}>저장</button>
                                        <button onClick={clearWorkoutEdit} style={styles.whiteCancelButton}>취소</button>
                                      </div>
                                    ) : (
                                      <button
                                        key={set.id || `${group.key}-${setIndex}`}
                                        type="button"
                                        onClick={() => startWorkoutSetEdit(set)}
                                        style={styles.whiteSetChipButton}
                                        title="누르면 수정"
                                      >
                                        {set.set_number || setIndex + 1}세트 · {set.weight ? `${set.weight}kg` : "-kg"} · {set.reps ? `${set.reps}회` : "-회"}
                                      </button>
                                    )
                                  )}
                                </div>

                                <div style={styles.whiteWorkoutManageCell}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`${group.exerciseName} 운동 세트를 모두 삭제할까요?`)) {
                                        group.sets.forEach((set) => deleteWorkoutSet(set));
                                      }
                                    }}
                                    style={styles.whiteDeleteButtonSmall}
                                  >
                                    운동삭제
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {renderTrainerJournal(session, true)}

                        <div style={styles.whiteActionRowFull}>
                          <button
                            onClick={() => deleteWorkoutSession(session)}
                            style={styles.whiteDeleteButton}
                          >
                            날짜 전체 삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      )}



      {showTrainerWorkoutHistoryModal && (
        <div style={styles.whiteModalOverlay}>
          <section style={styles.whiteModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>최근 개인 운동기록</h2>
                <p style={styles.whiteMuted}>최근 운동을 날짜별로 확인하고, 오늘 운동 참고용으로만 사용합니다.</p>
              </div>
              <button onClick={closeTrainerWorkoutHistoryModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            {trainerWorkoutList.length === 0 ? (
              <p style={styles.whiteMuted}>아직 개인 운동 기록이 없습니다.</p>
            ) : (
              <div style={styles.trainerHistoryList}>
                {trainerWorkoutList.map(renderTrainerWorkoutHistoryCard)}
              </div>
            )}
          </section>
        </div>
      )}


      {memberActionMenuMember && (
        <div style={styles.messageModalOverlay} onClick={closeMemberActionMenu}>
          <section style={styles.memberActionMenuBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{memberActionMenuMember.name} 빠른 기능</h2>
                <p style={styles.whiteMuted}>카드에는 자주 쓰는 기능만 두고, 나머지는 여기에서 처리합니다.</p>
              </div>
              <button type="button" onClick={closeMemberActionMenu} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.memberActionMenuGrid}>
              <button
                type="button"
                onClick={() => {
                  sendConditionCheckSMS(memberActionMenuMember);
                  closeMemberActionMenu();
                }}
                style={styles.memberActionMenuButton}
              >
                컨디션 문자
              </button>

              {memberActionMenuMember.member_stage === "ot" && (
                <button
                  type="button"
                  onClick={() => convertOtMemberToPt(memberActionMenuMember)}
                  style={styles.memberActionMenuButtonHot}
                >
                  PT 전환
                </button>
              )}

              <button
                type="button"
                onClick={() => openMemberScheduleSearch(memberActionMenuMember)}
                style={styles.memberActionMenuButton}
              >
                스케줄 확인
              </button>

              <button
                type="button"
                onClick={() => {
                  openContactModal(memberActionMenuMember, "pending");
                  closeMemberActionMenu();
                }}
                style={styles.memberActionMenuButton}
              >
                상담기록
              </button>

              {memberActionMenuMember.is_active === false ? (
                <button
                  type="button"
                  onClick={() => {
                    reactivateMember(memberActionMenuMember);
                    closeMemberActionMenu();
                  }}
                  style={styles.memberActionMenuButton}
                >
                  복구
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    deactivateMember(memberActionMenuMember);
                    closeMemberActionMenu();
                  }}
                  style={styles.memberActionMenuButtonDanger}
                >
                  비활성
                </button>
              )}
            </div>
          </section>
        </div>
      )}


      {conditionModalMember && (
        <div style={styles.messageModalOverlay}>
          <section style={styles.messageModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{conditionModalMember.name} 컨디션 체크</h2>
                <p style={styles.whiteMuted}>
                  기존 성향체크 문장은 건드리지 않고, 오늘 몸상태만 별도로 저장합니다.
                </p>
              </div>

              <button type="button" onClick={closeConditionCheckModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.whiteTwoColumn}>
              <div>
                <label style={styles.whiteLabel}>오늘 컨디션</label>
                <select value={conditionLevel} onChange={(e) => setConditionLevel(e.target.value)} style={styles.whiteInput}>
                  {conditionLevelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.whiteLabel}>수면 상태</label>
                <select value={conditionSleepStatus} onChange={(e) => setConditionSleepStatus(e.target.value)} style={styles.whiteInput}>
                  {sleepStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.whiteTwoColumn}>
              <div>
                <label style={styles.whiteLabel}>불편 부위</label>
                <select value={conditionPainArea} onChange={(e) => setConditionPainArea(e.target.value)} style={styles.whiteInput}>
                  {painAreaOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.whiteLabel}>근육통</label>
                <select value={conditionMuscleSoreness} onChange={(e) => setConditionMuscleSoreness(e.target.value)} style={styles.whiteInput}>
                  {muscleSorenessOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <label style={styles.whiteLabel}>운동 부담감</label>
            <select value={conditionWorkoutBurden} onChange={(e) => setConditionWorkoutBurden(e.target.value)} style={styles.whiteInput}>
              {workoutBurdenOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>

            <label style={styles.whiteLabel}>메모</label>
            <textarea
              value={conditionMemo}
              onChange={(e) => setConditionMemo(e.target.value)}
              placeholder="예: 왼쪽 어깨 뻐근함, 잠 부족, 하체 근육통"
              style={styles.whiteTextarea}
            />

            <div style={styles.whiteActionRowFull}>
              <button type="button" onClick={saveConditionCheck} style={styles.whiteSaveLargeButton}>
                저장
              </button>
              <button type="button" onClick={closeConditionCheckModal} style={styles.whiteCancelLargeButton}>
                취소
              </button>
            </div>
          </section>
        </div>
      )}

      {freeSmsModalMember && (
        <div style={styles.messageModalOverlay}>
          <section style={styles.messageModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{freeSmsModalMember.name} 문자 보내기</h2>
                <p style={styles.whiteMuted}>
                  일정 변경, 안내, 개인 연락 등 자유롭게 작성해서 보내세요.
                </p>
              </div>

              <button type="button" onClick={closeFreeSmsModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            <div style={styles.whiteInfoBox}>
              <strong style={styles.whiteSectionTitle}>문자 내용</strong>
              <textarea
                value={freeSmsDraft}
                onChange={(e) => setFreeSmsDraft(e.target.value)}
                placeholder="보낼 문자를 입력하세요."
                style={{ ...styles.textarea, minHeight: 220, background: "#fff", color: "#111", border: "1px solid #111" }}
              />
            </div>

            <div style={styles.whiteActionRowFull}>
              <button type="button" onClick={sendFreeSmsDraft} style={styles.primaryButton}>
                문자 보내기
              </button>
              <button type="button" onClick={closeFreeSmsModal} style={styles.cancelButton}>
                취소
              </button>
            </div>
          </section>
        </div>
      )}

      {feedbackModalMember && (
        <div style={styles.messageModalOverlay}>
          <section style={styles.messageModalBox}>
            <div style={styles.whiteModalTop}>
              <div>
                <h2 style={styles.whiteModalTitle}>{feedbackModalMember.name} 피드백 문자</h2>
                <p style={styles.whiteMuted}>
                  최근 운동기록을 바탕으로 만든 수업 후 피드백입니다. 실제로 보낼 말투로 가볍게 수정해서 보내세요.
                </p>
              </div>

              <button type="button" onClick={closeFeedbackModal} style={styles.whiteCloseButton}>
                닫기
              </button>
            </div>

            {feedbackCandidateSections.length > 0 && (
              <div style={styles.feedbackCandidateBox}>
                <strong style={styles.whiteSectionTitle}>추천 문장 선택</strong>
                <p style={styles.feedbackCandidateHelp}>
                  일지 내용별로 마음에 드는 문장을 선택하면 아래 문자 초안이 자동으로 정리됩니다.
                </p>

                <div style={styles.feedbackCandidateList}>
                  {feedbackCandidateSections.map((section) => (
                    <div key={section.key} style={styles.feedbackCandidateSection}>
                      <div style={styles.feedbackCandidateSectionTop}>
                        <strong style={styles.feedbackCandidateTitle}>{section.title}</strong>
                        <button
                          type="button"
                          onClick={() => removeFeedbackCandidateSection(section.key)}
                          style={styles.feedbackCandidateSkipButton}
                        >
                          제외
                        </button>
                      </div>

                      <div style={styles.feedbackCandidateOptionGrid}>
                        {section.options.map((option, optionIndex) => {
                          const isSelected = selectedFeedbackCandidateMap[section.key] === optionIndex;
                          return (
                            <button
                              key={`${section.key}-${optionIndex}`}
                              type="button"
                              onClick={() => selectFeedbackCandidate(section.key, optionIndex)}
                              style={isSelected ? styles.feedbackCandidateOptionSelected : styles.feedbackCandidateOption}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.whiteInfoBox}>
              <strong style={styles.whiteSectionTitle}>문자 초안</strong>
              <textarea
                value={feedbackDraft}
                onChange={(e) => setFeedbackDraft(e.target.value)}
                style={{ ...styles.textarea, minHeight: 200, background: "#fff", color: "#111", border: "1px solid #111" }}
              />
            </div>

            <div style={styles.whiteActionRowFull}>
              <button type="button" onClick={sendFeedbackSMS} style={styles.primaryButton}>
                문자 보내기
              </button>
              <button type="button" onClick={closeFeedbackModal} style={styles.cancelButton}>
                나중에
              </button>
            </div>
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

      {false && lastAction && null}




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

const preferenceStyles = {
  noticeBox: {
    marginTop: "10px",
    marginBottom: "18px",
    padding: "16px",
    borderRadius: "20px",
    background: "#fff7f3",
    border: "1px solid #fed7c3",
  },
  noticeTitle: {
    fontSize: "16px",
    fontWeight: 900,
    color: "#111827",
    marginBottom: "6px",
  },
  noticeText: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#6b4f45",
    lineHeight: 1.55,
  },
  section: {
    marginTop: "16px",
    padding: "16px",
    border: "1px solid #f1e5de",
    borderRadius: "20px",
    background: "#fffdfb",
    boxShadow: "0 8px 18px rgba(17, 24, 39, 0.04)",
  },
  label: {
    fontSize: "17px",
    fontWeight: 900,
    marginBottom: "4px",
    color: "#111827",
  },
  helper: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#8a6f63",
    lineHeight: 1.45,
    marginBottom: "12px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },
  optionButton: {
    minHeight: "62px",
    borderRadius: "16px",
    border: "1px solid #eadbd2",
    background: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    fontWeight: 850,
    padding: "10px",
    whiteSpace: "pre-line",
    lineHeight: 1.35,
  },
  activeButton: {
    background: "#111827",
    color: "#ffffff",
    borderColor: "#111827",
    boxShadow: "0 10px 18px rgba(17, 24, 39, 0.16)",
  },
  textarea: {
    width: "100%",
    minHeight: "96px",
    border: "1px solid #eadbd2",
    borderRadius: "16px",
    padding: "13px",
    fontSize: "15px",
    lineHeight: 1.55,
    boxSizing: "border-box",
    resize: "vertical",
    background: "#ffffff",
  },
  saveButton: {
    width: "100%",
    height: "56px",
    marginTop: "18px",
    border: "none",
    borderRadius: "18px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: 900,
    boxShadow: "0 10px 20px rgba(17, 24, 39, 0.16)",
  },
  summaryTagBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "14px",
  },
  summaryTag: {
    background: "#fff7ed",
    color: "#111827",
    border: "1px solid #fed7aa",
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: "13px",
    fontWeight: 900,
  },
};

const styles = {
  mainReturnButton: {
    position: "fixed",
    top: 14,
    left: 14,
    zIndex: 99999,
    background: "#111",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 900,
    boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
  },
  appToast: {
    position: "fixed",
    right: 24,
    bottom: 88,
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
  safeExitButton: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 99999,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(20,20,20,0.94)",
    color: "#fff",
    borderRadius: 999,
    padding: "13px 18px",
    fontSize: 15,
    fontWeight: 1000,
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },
  exitConfirmOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100001,
    background: "rgba(0,0,0,0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  exitConfirmBox: {
    width: "min(360px, 92vw)",
    background: "#fff",
    color: "#111",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 22px 55px rgba(0,0,0,0.42)",
    border: "1px solid rgba(0,0,0,0.08)",
  },
  exitConfirmTitle: {
    display: "block",
    fontSize: 20,
    fontWeight: 1000,
    marginBottom: 8,
  },
  exitConfirmText: {
    margin: "0 0 18px",
    color: "#555",
    fontSize: 14,
    lineHeight: 1.45,
    fontWeight: 800,
  },
  exitConfirmButtonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  exitCancelButton: {
    border: "1px solid #ddd",
    background: "#f4f4f4",
    color: "#222",
    borderRadius: 14,
    padding: "13px 12px",
    fontSize: 15,
    fontWeight: 1000,
  },
  exitConfirmButton: {
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    borderRadius: 14,
    padding: "13px 12px",
    fontSize: 15,
    fontWeight: 1000,
  },
  page: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #090909 0%, #111 100%)",
    color: "#fff",
    padding: 20,
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  todayDashboardBox: {
    background: "linear-gradient(135deg, #111827, #1f2937)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
  },

  todayDashboardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },

  todayDashboardTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },

  todayDashboardDesc: {
    margin: "4px 0 0",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.35,
  },

  todayDashboardBadge: {
    flexShrink: 0,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 800,
  },

  todayTodoOpenButton: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "#ffffff",
    color: "#111827",
    borderRadius: 16,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(15,23,42,0.16)",
  },

  todayTodoOpenTextWrap: {
    display: "grid",
    gap: 4,
    textAlign: "left",
  },

  todayTodoOpenTitle: {
    fontSize: 18,
    fontWeight: 1000,
    color: "#111827",
  },

  todayTodoOpenDesc: {
    fontSize: 13,
    fontWeight: 800,
    color: "#64748b",
  },

  todayTodoOpenCount: {
    flexShrink: 0,
    borderRadius: 999,
    background: "#111827",
    color: "#ffffff",
    padding: "9px 14px",
    fontSize: 14,
    fontWeight: 1000,
  },

  todayTodoPopupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 40000,
    padding: 18,
    overflow: "hidden",
  },

  todayTodoPopupModal: {
    width: "calc(100vw - 56px)",
    maxWidth: 1480,
    height: "calc(100dvh - 88px)",
    maxHeight: "calc(100dvh - 88px)",
    background: "#ffffff",
    color: "#111827",
    borderRadius: 24,
    padding: 26,
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  todayTodoModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 12,
    flexShrink: 0,
  },

  todayTodoModalTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.1,
    fontWeight: 1000,
    color: "#111827",
  },

  todayTodoModalDesc: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: 15,
    fontWeight: 800,
  },

  todayTodoModalSummaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 12,
    flexShrink: 0,
  },

  todayTodoModalSummaryCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "12px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    color: "#111827",
    fontWeight: 900,
  },

  todayTodoModalEmpty: {
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: 18,
    padding: 28,
    color: "#6b7280",
    fontSize: 18,
    fontWeight: 900,
    textAlign: "center",
  },

  todayTodoModalList: {
    display: "grid",
    gap: 10,
    overflowY: "auto",
    paddingRight: 4,
    flex: 1,
    minHeight: 0,
    maxHeight: "none",
    alignContent: "start",
    WebkitOverflowScrolling: "touch",
  },

  todayTodoModalItem: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    borderRadius: 16,
    padding: "12px 14px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
  },

  todayTodoModalItemDone: {
    background: "#f8fafc",
    opacity: 0.72,
  },

  todayTodoModalLeft: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  todayTodoModalName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: 1000,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  todayTodoModalDescText: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  todayTodoBadgeDone: {
    background: "#e0f2fe",
    color: "#075985",
    border: "1px solid #bae6fd",
  },

  todayDashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },

  todayTaskCard: {
    appearance: "none",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 16,
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 6,
    minHeight: 92,
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
  },

  todayTaskLabel: {
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
  },

  todayTaskValue: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },

  todayTaskHint: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 700,
  },

  todayTodoPanel: {
    marginTop: 12,
    background: "rgba(255, 255, 255, 0.98)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: 18,
    padding: 12,
    color: "#111827",
  },

  todayTodoHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  todayTodoHeaderTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: 1000,
  },

  todayTodoHeaderCount: {
    color: "#4b5563",
    fontSize: 12,
    fontWeight: 900,
  },

  todayTodoEmpty: {
    margin: 0,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 700,
  },

  todayTodoList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 8,
  },

  todayTodoItem: {
    appearance: "none",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    borderRadius: 14,
    padding: "9px 10px",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
    cursor: "pointer",
  },

  todayTodoActionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    flexShrink: 0,
  },
  todayTodoActionButton: {
    border: "1px solid #111",
    borderRadius: 999,
    background: "#fff",
    color: "#111",
    fontSize: 13,
    fontWeight: 900,
    padding: "8px 13px",
  },
  todayTodoActionButtonPrimary: {
    border: "1px solid #111",
    borderRadius: 999,
    background: "#111",
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    padding: "8px 13px",
  },
  todayTodoActionButtonSoft: {
    border: "1px solid #cbd5e1",
    borderRadius: 999,
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    fontWeight: 900,
    padding: "8px 13px",
  },
  todayTodoDoneText: {
    flexShrink: 0,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 900,
  },
  todayTodoBadge: {
    borderRadius: 999,
    padding: "5px 8px",
    background: "#f3f4f6",
    color: "#111827",
    border: "1px solid #d1d5db",
    fontSize: 11,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },

  todayTodoBadgeDanger: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  todayTodoBadgeWarn: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a",
  },

  todayTodoBadgeSms: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },

  todayTodoTextWrap: {
    minWidth: 0,
    display: "grid",
    gap: 2,
  },

  todayTodoName: {
    color: "#111827",
    fontSize: 13,
    fontWeight: 1000,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  todayTodoDesc: {
    color: "#4b5563",
    fontSize: 11,
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  todayTodoAction: {
    color: "#111827",
    fontSize: 11,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },

  header: {
    display: "flex",
    flexShrink: 0,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  brandLine: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
  },
  brandDivider: {
    width: 1,
    height: 34,
    background: "rgba(212,161,74,.75)",
    display: "inline-block",
    flexShrink: 0,
  },
  subtitleInline: {
    color: "#ffffff",
    margin: 0,
    fontSize: 17,
    opacity: 0.94,
    textShadow: "0 1px 8px rgba(0,0,0,0.45)",
    whiteSpace: "nowrap",
  },
  headerSalesButton: {
    background: "#ffffff",
    border: "1px solid rgba(255,255,255,0.85)",
    color: "#111827",
    borderRadius: 999,
    padding: "9px 15px",
    fontSize: 13,
    fontWeight: 1000,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
  },
  title: {
    fontSize: 38,
    margin: 0,
    fontWeight: 900,
    letterSpacing: -1,
    color: "#ffffff",
    textShadow: "0 2px 12px rgba(0,0,0,0.55)",
  },
  subtitle: {
    color: "#ffffff",
    marginTop: 4,
    fontSize: 15,
    opacity: 0.92,
    textShadow: "0 1px 8px rgba(0,0,0,0.45)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  trainerQuickButton: {
    background: "#ffffff",
    border: "1px solid rgba(255,255,255,0.75)",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#111",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
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
  mainLauncherGrid: {
    position: "fixed",
    left: 20,
    right: 20,
    bottom: "max(6px, env(safe-area-inset-bottom))",
    zIndex: 60,
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10,
    marginTop: 0,
    paddingBottom: 0,
  },
  mainLauncherButton: {
    minHeight: 64,
    borderRadius: 18,
    border: "1px solid rgba(212,161,74,.45)",
    background: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025))",
    color: "#fff",
    display: "grid",
    gridTemplateRows: "auto auto",
    alignItems: "center",
    justifyItems: "center",
    gap: 2,
    padding: "7px 8px",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(0,0,0,.22)",
  },
  mainLauncherIcon: {
    color: "#e0ae49",
    fontSize: 20,
    fontWeight: 1000,
    lineHeight: 1,
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
  salesModalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginTop: 18,
  },
  whiteSalesCard: {
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 18,
    padding: 20,
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  whiteSalesLabel: {
    color: "#4b5563",
    margin: "0 0 10px",
    fontSize: 14,
    fontWeight: 900,
  },
  whiteSalesValue: {
    color: "#111827",
    fontSize: 28,
    fontWeight: 1000,
  },
  whiteSalesMiniText: {
    color: "#6b7280",
    margin: "8px 0 0",
    fontSize: 13,
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
  scheduleSmsDoneText: {
    fontSize: 11,
    fontWeight: 900,
    color: "#2563eb",
    background: "#dbeafe",
    borderRadius: 999,
    padding: "3px 7px",
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
  smsQueueBox: {
    background: "#151f1d",
    border: "1px solid #31524b",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    alignItems: "center",
  },
  smsQueueInfo: {
    display: "grid",
    gap: 4,
    minWidth: 0,
  },
  smsQueueTitle: {
    color: "#d7fff3",
    fontSize: 16,
    fontWeight: 900,
  },
  smsQueueTarget: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
  },
  smsQueueHint: {
    color: "#9ac6bd",
    fontSize: 12,
    lineHeight: 1.35,
  },
  smsQueueActions: {
    display: "grid",
    gridTemplateColumns: "repeat(4, auto)",
    gap: 8,
    alignItems: "center",
  },
  smsQueuePrimaryButton: {
    background: "#d7fff3",
    color: "#10201d",
    border: "none",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  smsQueueDoneButton: {
    background: "#facc15",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  smsQueueSkipButton: {
    background: "#334155",
    color: "#e5e7eb",
    border: "1px solid #475569",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  smsQueueCloseButton: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    whiteSpace: "nowrap",
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
  incompleteTopActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  todaySmsStartButton: {
    background: "#d7fff3",
    color: "#10201d",
    border: "1px solid #9eead8",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
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
    position: "relative",
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
  scheduleSmsButton: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
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
    width: "100%",
  },
  scheduleQuickButtonWrap: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr 44px",
    gap: 8,
    width: "100%",
  },
  scheduleMoreButton: {
    background: "#111",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 12,
    padding: "9px 10px",
    fontWeight: 900,
    fontSize: 18,
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  scheduleMoreMenuBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.18)",
    zIndex: 19998,
  },
  scheduleMoreMenu: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 220,
    maxWidth: "calc(100vw - 48px)",
    background: "#111",
    border: "1px solid #333",
    borderRadius: 18,
    padding: 10,
    display: "grid",
    gap: 8,
    zIndex: 19999,
    boxShadow: "0 22px 60px rgba(0,0,0,.42)",
  },
  scheduleMoreMenuButton: {
    background: "#1f2937",
    color: "#fff",
    border: "1px solid #374151",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 900,
    textAlign: "left",
  },
  scheduleMoreMenuButtonDanger: {
    background: "#3f1111",
    color: "#fecaca",
    border: "1px solid #7f1d1d",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 900,
    textAlign: "left",
  },
  scheduleMoreMenuButtonWarning: {
    background: "#422006",
    color: "#fde68a",
    border: "1px solid #92400e",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 900,
    textAlign: "left",
  },
  scheduleMoreMenuCloseButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #fff",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 900,
    textAlign: "center",
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
    flexShrink: 0,
    marginTop: 12,
    marginBottom: 0,
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
    padding: "16px 22px",
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
    position: "fixed",
    top: 118,
    right: 32,
    zIndex: 100000,
    minWidth: 320,
    maxWidth: "calc(100vw - 64px)",
    background: "rgba(39, 33, 17, 0.98)",
    border: "1px solid #facc15",
    color: "#fde68a",
    padding: "14px 16px",
    borderRadius: 18,
    marginBottom: 0,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
    pointerEvents: "auto",
  },
  noticeButton: {
    background: "#facc15",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: 12,
  },
  modalBox: {
    width: "calc(100vw - 32px)",
    maxWidth: "none",
    height: "calc(100vh - 88px)",
    maxHeight: "none",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    border: "1px solid #e5e5e5",
    borderRadius: 24,
    padding: 22,
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
  scheduleBodyPartBox: {
    background: "#f8f8f8",
    border: "1px solid #dedede",
    borderRadius: 18,
    padding: 16,
    margin: "8px 0 18px",
  },
  scheduleBodyPartHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  scheduleBodyPartTitle: {
    display: "block",
    color: "#111",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 5,
  },
  scheduleBodyPartSubTitle: {
    color: "#666",
    fontSize: 15,
    fontWeight: 800,
  },
  scheduleBodyPartHint: {
    margin: 0,
    color: "#888",
    fontSize: 13,
    fontWeight: 800,
  },
  scheduleBodyPartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  scheduleBodyPartChip: {
    minHeight: 44,
    background: "#fff",
    color: "#111",
    border: "1px solid #d5d5d5",
    borderRadius: 12,
    padding: "9px 10px",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 5px 12px rgba(0,0,0,0.035)",
  },
  scheduleBodyPartChipActive: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
  },
  scheduleBodyPartSelectedLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #e1e1e1",
  },
  scheduleBodyPartSelectedLabel: {
    color: "#777",
    fontSize: 13,
    fontWeight: 900,
  },
  scheduleBodyPartSelectedText: {
    color: "#111",
    fontSize: 15,
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  menuButton: {
    background: "#f7f7f7",
    color: "#111",
    border: "1px solid #dddddd",
    borderRadius: 18,
    padding: 18,
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 0,
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
    background: "#ffffff",
    border: "1px solid #d4d4d4",
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
    color: "#111",
    fontSize: 15,
    marginBottom: 8,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: 17,
    borderRadius: 17,
    border: "1px solid #d9d9d9",
    background: "#fff",
    color: "#111",
    fontSize: 18,
    boxSizing: "border-box",
    marginBottom: 16,
  },
  circuitProgramBox: {
    background: "#fff",
    border: "1px solid #d9d9d9",
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
    background: "#fff",
    color: "#111",
    border: "1px solid #d9d9d9",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  suggestionBox: {
  background: "#fff",
  border: "1px solid #d9d9d9",
  borderRadius: 10,
  marginTop: 6,
},
suggestionItem: {
  padding: 10,
  borderBottom: "1px solid #eee",
  color: "#111",
  cursor: "pointer",
},
textarea: {
    width: "100%",
    minHeight: 90,
    padding: 17,
    borderRadius: 17,
    border: "1px solid #d9d9d9",
    background: "#fff",
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
    background: "#ffffff",
    border: "1px solid #d4d4d4",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    boxShadow: "0 8px 22px rgba(0,0,0,.14)",
    color: "#111",
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
    fontWeight: 1000,
    color: "#111",
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
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #cfcfcf",
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
    color: "#111",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 800,
  },
  detailActionBox: {
    background: "#ffffff",
    border: "1px solid #d4d4d4",
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
    marginBottom: 20,
  },
  detailHeaderLeft: {
    minWidth: 0,
    flex: 1,
  },
  detailNameLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  detailPtPillGood: {
    border: "1px solid #16a34a",
    background: "#ecfdf3",
    color: "#166534",
    borderRadius: 999,
    padding: "8px 13px",
    fontSize: 14,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  detailPtPillWarning: {
    border: "1px solid #f59e0b",
    background: "#fffbeb",
    color: "#92400e",
    borderRadius: 999,
    padding: "8px 13px",
    fontSize: 14,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  detailPtPillDanger: {
    border: "1px solid #dc2626",
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: 999,
    padding: "8px 13px",
    fontSize: 14,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  detailHeaderPassButton: {
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    borderRadius: 999,
    padding: "9px 15px",
    fontSize: 14,
    fontWeight: 1000,
  },
  detailFloatingBackButton: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 100002,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    borderRadius: 999,
    padding: "14px 20px",
    fontSize: 16,
    fontWeight: 1000,
    boxShadow: "0 14px 34px rgba(0,0,0,0.26)",
  },
  detailName: {
    fontSize: 34,
    margin: 0,
  },
  muted: {
    color: "#555",
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
    background: "#ffffff",
    border: "1px solid #111",
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
    borderTop: "1px solid #d4d4d4",
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
    color: "#111",
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
    color: "#111",
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
    background: "#ffffff",
    border: "1px solid #111",
    borderRadius: 16,
    padding: 14,
  },
  inbodyMetricLabel: {
    color: "#333",
    fontSize: 13,
    fontWeight: 900,
    margin: "0 0 8px",
  },
  inbodyMetricValue: {
    display: "block",
    color: "#111",
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
    color: "#444",
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
    position: "relative",
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
    width: "100%",
  },
  contactRecordOverlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    maxHeight: "100dvh",
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 65000,
    padding: "12px 12px 12px",
    boxSizing: "border-box",
    overflow: "hidden",
    overscrollBehavior: "none",
    touchAction: "none",
  },
  contactRecordBox: {
    width: "calc(100vw - 24px)",
    maxWidth: "none",
    height: "calc(100dvh - 24px)",
    maxHeight: "calc(100dvh - 24px)",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    boxSizing: "border-box",
    position: "relative",
    margin: 0,
    WebkitOverflowScrolling: "touch",
    overscrollBehavior: "contain",
    touchAction: "pan-y",
  },
  whiteModalOverlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    maxHeight: "100dvh",
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 16000,
    padding: 12,
    boxSizing: "border-box",
    overflow: "hidden",
    overscrollBehavior: "none",
  },
  feedbackCandidateBox: {
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  feedbackCandidateHelp: {
    margin: "6px 0 14px",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 700,
  },

  feedbackCandidateList: {
    display: "grid",
    gap: 12,
  },

  feedbackCandidateSection: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    borderRadius: 16,
    padding: 12,
  },

  feedbackCandidateSectionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  feedbackCandidateTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: 1000,
  },

  feedbackCandidateSkipButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#6b7280",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  feedbackCandidateOptionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 8,
  },

  feedbackCandidateOption: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    borderRadius: 12,
    padding: "10px 12px",
    textAlign: "left",
    fontSize: 14,
    fontWeight: 800,
    lineHeight: 1.45,
    cursor: "pointer",
  },

  feedbackCandidateOptionSelected: {
    border: "2px solid #111827",
    background: "#111827",
    color: "#ffffff",
    borderRadius: 12,
    padding: "10px 12px",
    textAlign: "left",
    fontSize: 14,
    fontWeight: 900,
    lineHeight: 1.45,
    cursor: "pointer",
  },

  messageModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30000,
    padding: 16,
    overflow: "hidden",
  },
  messageModalBox: {
    width: "calc(100vw - 56px)",
    maxWidth: "none",
    height: "auto",
    maxHeight: "calc(100vh - 96px)",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    position: "relative",
  },
  workoutHistoryOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 13000,
    padding: 12,
  },
  editModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 12000,
    padding: 12,
  },
  inbodyModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50000,
    padding: 12,
    overflowY: "auto",
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
    width: "calc(100vw - 32px)",
    maxWidth: "none",
    height: "calc(100vh - 88px)",
    maxHeight: "none",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },

  whiteRecordSummaryButton: {
    width: "100%",
    border: "1px solid #e5e5e5",
    background: "#fafafa",
    color: "#111",
    borderRadius: 18,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  whiteRecordSummaryTitle: {
    margin: "6px 0 4px",
    color: "#111",
    fontSize: 18,
    fontWeight: 900,
  },
  whiteRecordChevron: {
    color: "#111",
    background: "#eeeeee",
    borderRadius: 999,
    padding: "8px 12px",
    whiteSpace: "nowrap",
  },
  whiteExpandedArea: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #eeeeee",
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
  scheduleFullOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.72)",
    padding: 10,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
  },
  scheduleFullModalBox: {
    width: "100%",
    maxWidth: "100%",
    height: "calc(100vh - 20px)",
    background: "#ffffff",
    color: "#111",
    borderRadius: 22,
    padding: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
  },
  scheduleFullContent: {
    flex: 1,
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "minmax(280px, 38%) minmax(0, 1fr)",
    gap: 14,
    overflow: "visible",
  },
  scheduleFullCalendarPanel: {
    minHeight: 0,
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  scheduleFullListPanel: {
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    border: "1px solid #e5e5e5",
    borderRadius: 18,
    padding: 12,
    background: "#fafafa",
    maxHeight: "none",
  },
  scheduleMiniCalendarBoxCompact: {
    background: "#f7f7f7",
    border: "1px solid #e4e4e4",
    borderRadius: 16,
    padding: 10,
    marginBottom: 0,
    touchAction: "pan-y",
  },
  scheduleMonthTitleButton: {
    background: "transparent",
    border: "none",
    color: "#111",
    fontSize: 18,
    fontWeight: 1000,
    textAlign: "center",
    padding: "8px 4px",
  },
  scheduleMonthPicker: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 6,
    maxHeight: 210,
    overflowY: "auto",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 14,
    padding: 8,
    marginBottom: 10,
  },
  scheduleMonthPickerButton: {
    border: "1px solid #e5e5e5",
    background: "#fff",
    color: "#111",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 900,
    textAlign: "left",
  },
  scheduleMonthPickerButtonActive: {
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 900,
    textAlign: "left",
  },
  scheduleCheckTopActionsCompact: {
    display: "grid",
    gridTemplateColumns: "0.8fr 1.4fr",
    gap: 8,
  },
  scheduleSearchBoxSticky: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  scheduleSelectedDateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111",
    color: "#fff",
    borderRadius: 14,
    padding: "10px 12px",
    fontSize: 15,
    fontWeight: 900,
    flexShrink: 0,
  },
  scheduleCheckListScrollable: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: 4,
  },
  scheduleSwipeHint: {
    margin: 0,
    color: "#777",
    fontSize: 12,
    fontWeight: 800,
    textAlign: "center",
  },
  memberMainCompact: {
    flex: 1,
    cursor: "pointer",
    position: "relative",
  },
  memberCardTopLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  ptCountPill: {
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  ptCountPillNormal: {
    background: "#052e16",
    color: "#bbf7d0",
    border: "1px solid #16a34a",
  },
  ptCountPillWarning: {
    background: "#33270a",
    color: "#fde68a",
    border: "1px solid #ca8a04",
  },
  ptCountPillDanger: {
    background: "#450a0a",
    color: "#fecaca",
    border: "1px solid #991b1b",
  },
  cardPtAddButtonMini: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  memberTypeRowCompact: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  phoneSmallCompact: {
    color: "#333",
    fontSize: 13,
    margin: 0,
    marginBottom: 7,
    fontWeight: 800,
  },
  memberCardBottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  memberMoreButtonMini: {
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    borderRadius: 999,
    padding: "5px 11px",
    fontSize: 12,
    fontWeight: 900,
    minWidth: 42,
  },

  memberActionMenuBox: {
    width: "min(760px, 92vw)",
    background: "#fff",
    color: "#111",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #ddd",
    boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
  },

  memberActionMenuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginTop: 18,
  },

  memberActionMenuButton: {
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    borderRadius: 18,
    padding: "18px 14px",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
  },

  memberActionMenuButtonHot: {
    border: "1px solid #d97706",
    background: "#fff7ed",
    color: "#92400e",
    borderRadius: 18,
    padding: "18px 14px",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
  },

  memberActionMenuButtonDanger: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    borderRadius: 18,
    padding: "18px 14px",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
  },

  personalHistoryActionRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  conditionSmsButton: {
    background: "#172554",
    color: "#bfdbfe",
    border: "1px solid #1d4ed8",
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 1000,
  },
  freeSmsButtonMini: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  feedbackButtonMini: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #111827",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  feedbackRecommendButtonMini: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  cardDeactivateButtonMini: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 1000,
  },
  cardRestoreButtonMini: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 1000,
  },
  warningRowCompact: {
    display: "flex",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  detailButtonGridCleanSingle: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
  },
  infoTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoEditButton: {
    background: "#111",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 1000,
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

  whiteWorkoutTable: {
    display: "grid",
    gap: 8,
    marginTop: 10,
  },
  whiteWorkoutTableHeader: {
    display: "grid",
    gridTemplateColumns: "170px 1fr 90px",
    gap: 10,
    background: "#111",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 1000,
  },
  whiteWorkoutTableRow: {
    display: "grid",
    gridTemplateColumns: "170px 1fr 90px",
    gap: 10,
    alignItems: "start",
    background: "#fff",
    border: "1px solid #d4d4d4",
    borderRadius: 12,
    padding: 10,
  },
  whiteWorkoutTableName: {
    color: "#111",
    fontSize: 15,
    fontWeight: 1000,
    lineHeight: 1.35,
  },
  whiteWorkoutSetChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  whiteSetChipButton: {
    background: "#f7f7f7",
    color: "#111",
    border: "1px solid #d4d4d4",
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 13,
    fontWeight: 900,
  },
  whiteInlineEditBox: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.7fr 0.7fr auto auto",
    gap: 6,
    width: "100%",
    alignItems: "center",
  },
  whiteInlineInput: {
    width: "100%",
    background: "#fff",
    color: "#111",
    border: "1px solid #cfcfcf",
    borderRadius: 10,
    padding: "8px 9px",
    fontSize: 13,
    fontWeight: 800,
    boxSizing: "border-box",
  },
  whiteWorkoutManageCell: {
    display: "flex",
    justifyContent: "flex-end",
  },
  whiteDeleteButtonSmall: {
    background: "#fff1f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 999,
    padding: "7px 9px",
    fontSize: 12,
    fontWeight: 1000,
  },
  whiteWorkoutCard: {
    background: "#ffffff",
    border: "1px solid #d4d4d4",
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
    background: "#ffffff",
    border: "1px solid #d4d4d4",
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
    width: "calc(100vw - 32px)",
    maxWidth: "none",
    height: "calc(100vh - 88px)",
    maxHeight: "none",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    border: "1px solid #e5e5e5",
    borderRadius: 24,
    padding: 22,
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
    color: "#555",
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
    color: "#555",
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
    background: "#fff",
    border: "1px solid #d9d9d9",
    borderRadius: 16,
    padding: 12,
    color: "#111",
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
    color: "#111",
    fontSize: 15,
    fontWeight: 900,
  },
  compactDeleteButton: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
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
    background: "#fffbeb",
    border: "1px solid #facc15",
    borderRadius: 12,
    padding: 9,
    marginBottom: 8,
  },
  compactLastExerciseText: {
    color: "#92400e",
    margin: 0,
    fontSize: 12,
    fontWeight: 900,
  },
  compactLastExerciseSummary: {
    color: "#111",
    margin: "5px 0 8px",
    fontSize: 12,
    lineHeight: 1.35,
    fontWeight: 800,
  },
  compactLastExerciseButton: {
    width: "100%",
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 10,
    padding: "7px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  compactSetHeader: {
    display: "grid",
    gridTemplateColumns: "34px 1fr 1fr 28px",
    gap: 6,
    color: "#555",
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
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ddd",
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
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 900,
    lineHeight: 1,
  },
  compactAddSetButton: {
    width: "100%",
    background: "#fff",
    color: "#111",
    border: "1px solid #d9d9d9",
    borderRadius: 12,
    padding: "8px 10px",
    marginTop: 8,
    fontSize: 13,
    fontWeight: 900,
  },
  trainerJournalInputBox: {
    background: "#fff",
    border: "1px solid #d9d9d9",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    color: "#111",
  },
  conditionButtonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
    marginBottom: 16,
  },
  conditionButton: {
    background: "#fff",
    color: "#111",
    border: "1px solid #d9d9d9",
    borderRadius: 12,
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  conditionButtonActive: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
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
  cardCompact: {
    background: "#1c1c1c",
    border: "1px solid #292929",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    boxShadow: "0 6px 18px rgba(0,0,0,.18)",
  },
  memberNameSmall: {
    fontSize: 18,
    margin: 0,
    fontWeight: 900,
    color: "#ffffff",
    wordBreak: "keep-all",
  },
  compactInfoRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    color: "#93c5fd",
    fontSize: 12,
    marginBottom: 4,
  },
  memberModalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 8,
  },

  scheduleFullContent: {
    flex: 1,
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "minmax(250px, 32%) minmax(0, 1fr)",
    gap: 12,
    overflow: "visible",
  },
  scheduleFullCalendarPanel: {
    minHeight: 0,
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  scheduleFullListPanel: {
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    border: "1px solid #e5e5e5",
    borderRadius: 18,
    padding: 10,
    background: "#fafafa",
  },
  scheduleMiniCalendarBoxCompact: {
    background: "#f7f7f7",
    border: "1px solid #e4e4e4",
    borderRadius: 16,
    padding: 9,
    marginBottom: 0,
    touchAction: "pan-y",
  },
  scheduleMiniDay: {
    minHeight: 30,
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 9,
    padding: "3px 2px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    color: "#111",
  },
  scheduleMiniDayToday: {
    minHeight: 30,
    background: "#fff7d6",
    border: "1px solid #facc15",
    borderRadius: 9,
    padding: "3px 2px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    color: "#111",
  },
  scheduleMiniDaySelected: {
    minHeight: 30,
    background: "#111",
    border: "1px solid #111",
    borderRadius: 9,
    padding: "3px 2px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    color: "#fff",
  },
  scheduleCheckItem: {
    position: "relative",
    background: "#f3f3f3",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 10,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 300px",
    gap: 10,
    alignItems: "center",
    minWidth: 0,
  },
  scheduleCheckMainCompact: {
    minWidth: 0,
  },
  scheduleCheckTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minWidth: 0,
  },
  scheduleCheckSubRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
    minWidth: 0,
  },
  scheduleCheckTime: {
    color: "#111",
    fontSize: 15,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  scheduleCheckMemberCompact: {
    color: "#333",
    fontSize: 14,
    fontWeight: 900,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  scheduleCheckMemoCompact: {
    color: "#666",
    margin: "4px 0 0",
    fontSize: 13,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  reRegisterInlineAlert: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    width: "fit-content",
    marginTop: 5,
    padding: "5px 8px",
    borderRadius: 999,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#c2410c",
    fontSize: 11,
    fontWeight: 800,
  },
  reRegisterInlineAlertDark: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    width: "fit-content",
    marginTop: 5,
    padding: "5px 8px",
    borderRadius: 999,
    background: "rgba(255, 247, 237, 0.95)",
    border: "1px solid #fed7aa",
    color: "#c2410c",
    fontSize: 11,
    fontWeight: 800,
  },
  reRegisterWorkoutBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  reRegisterWorkoutText: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "#9a3412",
    fontSize: 13,
    fontWeight: 800,
  },
  reRegisterWorkoutActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  reRegisterSubButton: {
    border: "1px solid #fdba74",
    background: "#fff",
    color: "#9a3412",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  reRegisterMainButton: {
    border: "none",
    background: "#f97316",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  lastWorkoutPreviewCompact: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginTop: 6,
    padding: "7px 8px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    minWidth: 0,
  },
  lastWorkoutPreviewStrong: {
    color: "#111",
    fontSize: 12,
    fontWeight: 1000,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  lastWorkoutPreviewText: {
    color: "#555",
    fontSize: 11,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  lastWorkoutPreviewDark: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginTop: 7,
    padding: "7px 8px",
    background: "#1b1711",
    border: "1px solid #3d321f",
    borderRadius: 10,
    color: "#f5e9d0",
    fontSize: 12,
    fontWeight: 900,
    lineHeight: 1.35,
  },
  scheduleStatusRowCompact: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
  },
  scheduleTimelineMetaCompact: {
    color: "#666",
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 11,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  scheduleCheckButtonGroup: {
    width: "100%",
    minWidth: 0,
  },
  scheduleQuickButtonWrap: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 40px",
    gap: 6,
    width: "100%",
  },
  incompleteCompleteButton: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 12,
    padding: "8px 8px",
    fontWeight: 1000,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  scheduleDisabledButton: {
    background: "#2a2a2a",
    color: "#777",
    border: "1px solid #3a3a3a",
    borderRadius: 12,
    padding: "8px 8px",
    fontWeight: 1000,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  scheduleSmsButton: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 12,
    padding: "8px 8px",
    fontWeight: 1000,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  scheduleMoreButton: {
    background: "#111",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 12,
    padding: "7px 8px",
    fontWeight: 1000,
    fontSize: 16,
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  scheduleDoneText: {
    color: "#d7fff3",
    background: "#263a36",
    border: "1px solid #3f5f58",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 11,
    fontWeight: 1000,
  },
  scheduleWarningText: {
    color: "#fde68a",
    background: "#33270a",
    border: "1px solid #854d0e",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 11,
    fontWeight: 1000,
  },
  scheduleNoShowText: {
    color: "#fca5a5",
    background: "#351414",
    border: "1px solid #6b2424",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 11,
    fontWeight: 1000,
  },
  scheduleCancelText: {
    color: "#bdbdbd",
    background: "#242424",
    border: "1px solid #444",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 11,
    fontWeight: 1000,
  },
  scheduleCheckListScrollable: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: 4,
    display: "grid",
    gap: 8,
    alignContent: "start",
  },
  scheduleCheckList: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    alignItems: "stretch",
  },
  scheduleSearchResultOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15000,
    padding: 16,
  },
  scheduleCheckModalBox: {
    width: "100%",
    maxWidth: 1180,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  scheduleTimelineGroup: {
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
  },
  scheduleTimelineHeader: {
    background: "#111",
    color: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  scheduleTimelineList: {
    display: "grid",
    gap: 8,
  },
  memberModalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 8,
  },
  cardCompact: {
    background: "#1c1c1c",
    border: "1px solid #292929",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    boxShadow: "0 6px 18px rgba(0,0,0,.18)",
  },
  memberCardTopLine: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  memberNameSmall: {
    fontSize: 18,
    margin: 0,
    fontWeight: 1000,
    color: "#ffffff",
    wordBreak: "keep-all",
  },
  ptCountPill: {
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  cardPtAddButtonMini: {
    background: "#f5f5f5",
    color: "#111",
    border: "1px solid #ffffff",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 11,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  memberTypeRowCompact: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    marginBottom: 5,
    flexWrap: "wrap",
  },
  phoneSmallCompact: {
    color: "#b3b3b3",
    fontSize: 12,
    margin: 0,
    marginBottom: 5,
  },
  compactInfoRow: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
    color: "#93c5fd",
    fontSize: 12,
    marginBottom: 3,
  },
  memberCardBottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },
  conditionSmsButton: {
    background: "#172554",
    color: "#bfdbfe",
    border: "1px solid #1d4ed8",
    borderRadius: 999,
    padding: "6px 9px",
    fontSize: 11,
    fontWeight: 1000,
  },
  cardDeactivateButtonMini: {
    background: "#3f1111",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 999,
    padding: "4px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  cardRestoreButtonMini: {
    background: "#263a36",
    color: "#d7fff3",
    border: "1px solid #3f5f58",
    borderRadius: 999,
    padding: "4px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  warningRowCompact: {
    display: "flex",
    gap: 5,
    flexWrap: "wrap",
    marginTop: 6,
  },


  /* =========================
     White UI consistency overrides
     ========================= */
  page: {
    height: "100dvh",
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #0b0b0b 0%, #111 100%)",
    color: "#fff",
    padding: "12px 20px calc(env(safe-area-inset-bottom, 0px) + 58px)",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  memberListModalBox: {
    width: "100%",
    maxWidth: 1220,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  memberModalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: 10,
  },
  cardCompact: {
    background: "#ffffff",
    border: "1px solid #d8d8d8",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    boxShadow: "0 8px 18px rgba(0,0,0,.08)",
    color: "#111",
  },
  memberNameSmall: {
    fontSize: 19,
    margin: 0,
    fontWeight: 1000,
    color: "#111",
    wordBreak: "keep-all",
  },
  phoneSmallCompact: {
    color: "#333",
    fontSize: 12,
    margin: 0,
    marginBottom: 5,
    fontWeight: 800,
  },
  compactInfoRow: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
    color: "#1d4ed8",
    fontSize: 12,
    marginBottom: 3,
    fontWeight: 900,
  },
  generalMemberBadge: {
    background: "#ffffff",
    color: "#111",
    border: "1px solid #cfcfcf",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  ptMemberBadge: {
    background: "#eff6ff",
    color: "#1e3a8a",
    border: "1px solid #93c5fd",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  groupMemberBadge: {
    background: "#faf5ff",
    color: "#6b21a8",
    border: "1px solid #d8b4fe",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  ptCountPillNormal: {
    background: "#ecfdf3",
    color: "#166534",
    border: "1px solid #16a34a",
  },
  ptCountPillWarning: {
    background: "#fffbeb",
    color: "#92400e",
    border: "1px solid #f59e0b",
  },
  ptCountPillDanger: {
    background: "#fff1f2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  },
  cardPtAddButtonMini: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 11,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  conditionSmsButton: {
    background: "#eff6ff",
    color: "#1e3a8a",
    border: "1px solid #93c5fd",
    borderRadius: 999,
    padding: "6px 9px",
    fontSize: 11,
    fontWeight: 1000,
  },
  cardDeactivateButtonMini: {
    background: "#fff1f2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: 999,
    padding: "4px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  cardRestoreButtonMini: {
    background: "#ecfdf3",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: 999,
    padding: "4px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  dangerBadge: {
    background: "#fff1f2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 900,
  },
  ptBadge: {
    background: "#fffbeb",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 900,
  },
  visitBadge: {
    background: "#fffbeb",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 900,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: 12,
  },
  modalBox: {
    width: "calc(100vw - 32px)",
    maxWidth: "none",
    height: "calc(100vh - 88px)",
    maxHeight: "none",
    overflowY: "auto",
    background: "#ffffff",
    color: "#111",
    border: "1px solid #e5e5e5",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
  },
  detailTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: "1px solid #e5e5e5",
  },
  detailName: {
    fontSize: 34,
    margin: 0,
    fontWeight: 1000,
    color: "#111",
  },
  muted: {
    color: "#555",
    margin: 0,
    marginBottom: 8,
    fontWeight: 800,
  },
  detailPt: {
    fontSize: 22,
    fontWeight: 1000,
    color: "#111",
  },
  menuButton: {
    background: "#ffffff",
    color: "#111",
    border: "1px solid #d4d4d4",
    borderRadius: 18,
    padding: 18,
    fontSize: 18,
    fontWeight: 1000,
    marginBottom: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,.04)",
  },
  infoBlock: {
    background: "#ffffff",
    border: "1px solid #d4d4d4",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    color: "#111",
  },
  logItem: {
    background: "#ffffff",
    border: "1px solid #d4d4d4",
    color: "#111",
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
    color: "#111",
    fontWeight: 900,
  },
  todayWorkoutContent: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  todayWorkoutExerciseList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    width: "100%",
  },
  todayWorkoutExerciseCard: {
    background: "#ffffff",
    border: "1px solid #d4d4d4",
    borderRadius: 14,
    padding: 12,
    color: "#111",
  },
  todayWorkoutExerciseTitle: {
    color: "#111",
    fontSize: 16,
    fontWeight: 1000,
    marginBottom: 6,
  },
  todayWorkoutSetLine: {
    color: "#444",
    fontSize: 14,
    fontWeight: 800,
    lineHeight: 1.5,
    wordBreak: "keep-all",
  },
  todayWorkoutEmptyText: {
    color: "#111",
    fontSize: 15,
    fontWeight: 900,
  },
  workoutSaveActions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    alignItems: "stretch",
    marginTop: 16,
  },
  workoutSaveButton: {
    width: "100%",
    minHeight: 58,
    padding: "14px 12px",
    borderRadius: 18,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontSize: 18,
    fontWeight: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,.12)",
  },
  workoutFeedbackButton: {
    width: "100%",
    minHeight: 58,
    padding: "14px 12px",
    borderRadius: 18,
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    fontSize: 18,
    fontWeight: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  },
  workoutCancelButton: {
    width: "100%",
    minHeight: 58,
    padding: "14px 12px",
    borderRadius: 18,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontSize: 18,
    fontWeight: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,.12)",
  },
  inbodyMetricCard: {
    background: "#ffffff",
    border: "1px solid #111",
    borderRadius: 16,
    padding: 14,
    color: "#111",
  },
  inbodyTrendBox: {
    background: "#ffffff",
    border: "1px solid #111",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    color: "#111",
  },
  inbodyTrendHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    color: "#111",
  },
  inbodyTrendLineRow: {
    display: "grid",
    gridTemplateColumns: "90px 1fr",
    gap: 12,
    alignItems: "center",
    borderTop: "1px solid #e5e5e5",
    padding: "10px 0",
  },
  inbodyTrendLabel: {
    color: "#111",
    fontSize: 14,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  inbodyTrendDate: {
    color: "#111",
    fontSize: 13,
    fontWeight: 900,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  inbodyTrendDot: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: "999px",
    background: "#ffffff",
    border: "3px solid #111",
    boxShadow: "0 0 0 2px #ffffff",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
  },
  inbodyDeltaGood: {
    color: "#166534",
    background: "#ecfdf3",
    border: "1px solid #86efac",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  inbodyDeltaBad: {
    color: "#991b1b",
    background: "#fff1f2",
    border: "1px solid #fecaca",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  inbodyDeltaNeutral: {
    color: "#111",
    background: "#f3f3f3",
    border: "1px solid #d4d4d4",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  whiteWorkoutCard: {
    background: "#ffffff",
    border: "1px solid #d4d4d4",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },
  whiteRecordSummaryButton: {
    width: "100%",
    border: "1px solid #e5e5e5",
    background: "#fafafa",
    color: "#111",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  whiteWorkoutTable: {
    display: "grid",
    gap: 6,
    marginTop: 8,
  },
  whiteWorkoutTableHeader: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 78px",
    gap: 8,
    background: "#111",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 1000,
  },
  whiteWorkoutTableRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 78px",
    gap: 8,
    alignItems: "center",
    background: "#fff",
    border: "1px solid #d4d4d4",
    borderRadius: 10,
    padding: 8,
  },
  whiteWorkoutTableName: {
    color: "#111",
    fontSize: 14,
    fontWeight: 1000,
    lineHeight: 1.25,
  },
  whiteSetChipButton: {
    background: "#f7f7f7",
    color: "#111",
    border: "1px solid #d4d4d4",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 12,
    fontWeight: 900,
  },
  whiteDeleteButtonSmall: {
    background: "#fff1f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 999,
    padding: "6px 8px",
    fontSize: 11,
    fontWeight: 1000,
  },
  whiteExpandedArea: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #eeeeee",
  },
  detailFloatingBackButton: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 10001,
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 999,
    padding: "14px 20px",
    fontSize: 17,
    fontWeight: 1000,
    boxShadow: "0 12px 28px rgba(0,0,0,.28)",
  },
  safeExitButton: {
    display: "none",
  },


  /* =========================
     Member card density optimization overrides
     ========================= */
  memberModalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
    gap: 8,
  },
  cardCompact: {
    background: "#ffffff",
    border: "1px solid #d6d6d6",
    borderRadius: 16,
    padding: 10,
    marginBottom: 6,
    boxShadow: "0 6px 14px rgba(0,0,0,.07)",
    color: "#111",
    minHeight: 132,
  },
  memberMainCompact: {
    flex: 1,
    cursor: "pointer",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    height: "100%",
  },
  memberCardHeaderCompact: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  memberTitleLineCompact: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
    flex: 1,
  },
  memberNameSmall: {
    fontSize: 18,
    margin: 0,
    fontWeight: 1000,
    color: "#111",
    wordBreak: "keep-all",
    lineHeight: 1.1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 120,
  },
  ptCountPill: {
    borderRadius: 999,
    padding: "4px 7px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
    lineHeight: 1,
  },
  cardPtAddButtonMini: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  memberMetaLineCompact: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    color: "#333",
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.25,
  },
  generalMemberBadge: {
    background: "#fff",
    color: "#111",
    border: "1px solid #cfcfcf",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  ptMemberBadge: {
    background: "#eff6ff",
    color: "#1e3a8a",
    border: "1px solid #93c5fd",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  groupMemberBadge: {
    background: "#faf5ff",
    color: "#6b21a8",
    border: "1px solid #d8b4fe",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  vipBadge: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 10,
    fontWeight: 1000,
  },
  compactInfoRow: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
    color: "#1d4ed8",
    fontSize: 11,
    marginBottom: 0,
    fontWeight: 900,
    lineHeight: 1.2,
  },
  memberActionLineCompact: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
  },
  memberLeftActionsCompact: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    minWidth: 0,
  },
  conditionSmsButton: {
    background: "#eff6ff",
    color: "#1e3a8a",
    border: "1px solid #93c5fd",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  compactStatusBadge: {
    background: "#fffbeb",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
  },
  cardDeactivateButtonMini: {
    background: "#fff1f2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: 999,
    padding: "5px 7px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  cardRestoreButtonMini: {
    background: "#ecfdf3",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: 999,
    padding: "5px 7px",
    fontSize: 10,
    fontWeight: 1000,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  weightBodyPartBox: {
    background: "#fff",
    border: "1px solid #d9d9d9",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    color: "#111",
  },
  weightBodyPartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    color: "#111",
    fontSize: 15,
  },
  weightBodyPartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: 8,
  },
  weightBodyPartButton: {
    background: "#fff",
    color: "#111",
    border: "1px solid #d9d9d9",
    borderRadius: 12,
    padding: "11px 10px",
    fontSize: 15,
    fontWeight: 900,
  },
  weightBodyPartButtonActive: {
    background: "#111",
    color: "#fff",
    border: "1px solid #111",
    borderRadius: 12,
    padding: "11px 10px",
    fontSize: 15,
    fontWeight: 900,
  },

  whiteTabRow: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
  },
  whiteTab: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #d8d8d8",
    background: "#fff",
    color: "#111",
    fontWeight: 900,
    fontSize: 16,
  },
  whiteTabActive: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    fontSize: 16,
  },

  personalSectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  personalMiniInfo: {
    margin: "4px 0 0",
    color: "#4b5563",
    fontSize: 13,
    fontWeight: 800,
  },
  personalReferenceBox: {
    border: "1px solid #d8d8d8",
    borderRadius: 14,
    padding: "10px 12px",
    background: "#f8fafc",
    color: "#111",
    marginBottom: 10,
  },
  trainerHistoryList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    maxHeight: "70vh",
    overflowY: "auto",
    paddingRight: 4,
  },

  personalLogGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
    alignItems: "start",
  },
  personalFormBox: {
    border: "1px solid #d8d8d8",
    borderRadius: 20,
    background: "#fff",
    padding: 16,
  },
  personalListBox: {
    border: "1px solid #d8d8d8",
    borderRadius: 20,
    background: "#fff",
    padding: 16,
    maxHeight: 260,
    overflowY: "auto",
  },
  personalSectionTitle: {
    margin: "0 0 14px",
    fontSize: 22,
    fontWeight: 1000,
    color: "#111",
  },
  personalTwoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  whitePillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  whitePill: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid #d8d8d8",
    background: "#fff",
    color: "#111",
    fontWeight: 900,
  },
  whitePillActive: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontWeight: 1000,
  },

  personalExerciseTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  personalExerciseList: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
    gap: 10,
    marginBottom: 12,
  },
  personalExerciseCard: {
    border: "1px solid #d8d8d8",
    borderRadius: 16,
    padding: 10,
    background: "#fff",
    color: "#111",
  },
  personalExerciseHeader: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  personalSetHeader: {
    display: "grid",
    gridTemplateColumns: "34px 1fr 1fr 32px",
    gap: 5,
    fontSize: 11,
    color: "#374151",
    fontWeight: 800,
    marginBottom: 5,
    alignItems: "center",
  },
  personalSetRow: {
    display: "grid",
    gridTemplateColumns: "34px 1fr 1fr 32px",
    gap: 5,
    alignItems: "center",
    marginBottom: 6,
  },
  personalWorkoutDetailTable: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 8,
  },
  personalWorkoutDetailRow: {
    display: "grid",
    gridTemplateColumns: "130px 1fr",
    gap: 8,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "7px 8px",
    background: "#fff",
    color: "#111827",
    fontSize: 12,
  },
  personalLogCard: {
    border: "1px solid #d8d8d8",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    background: "#fff",
    color: "#111",
  },
  personalLogCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  personalLogMain: {
    margin: "4px 0",
    fontWeight: 900,
    color: "#111",
  },
  personalLogText: {
    margin: "6px 0",
    color: "#222",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  personalLogSub: {
    margin: "6px 0 0",
    color: "#666",
    fontSize: 13,
    lineHeight: 1.5,
  },
  whiteSmallButton: {
    border: "1px solid #d8d8d8",
    background: "#fff",
    color: "#111",
    borderRadius: 12,
    padding: "8px 12px",
    fontWeight: 900,
  },
  whiteSmallDangerButton: {
    border: "1px solid #f0b6b6",
    background: "#fff1f1",
    color: "#9a1c1c",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 900,
  },
  workoutPatternBox: {
    border: "1px solid #111",
    borderRadius: 18,
    padding: 14,
    margin: "12px 0 16px",
    background: "#fff",
    color: "#111",
  },
  workoutPatternHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  workoutPatternTitle: {
    display: "block",
    fontSize: 16,
    fontWeight: 1000,
    color: "#111",
  },
  workoutPatternSub: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#666",
  },
  workoutPatternBadge: {
    border: "1px solid #111",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
    color: "#111",
    background: "#fff",
  },
  workoutPatternEmpty: {
    margin: 0,
    padding: 12,
    border: "1px dashed #bdbdbd",
    borderRadius: 14,
    background: "#fafafa",
    color: "#555",
    lineHeight: 1.5,
  },
  workoutPatternList: {
    display: "grid",
    gap: 8,
  },
  workoutPatternRow: {
    display: "grid",
    gridTemplateColumns: "42px 1fr 30px",
    alignItems: "center",
    gap: 10,
  },
  workoutPatternPart: {
    fontSize: 13,
    fontWeight: 900,
    color: "#111",
  },
  workoutPatternBarTrack: {
    height: 10,
    border: "1px solid #111",
    borderRadius: 999,
    background: "#fff",
    overflow: "hidden",
  },
  workoutPatternBar: {
    height: "100%",
    borderRadius: 999,
    background: "#111",
  },
  workoutPatternCount: {
    textAlign: "right",
    fontSize: 13,
    fontWeight: 900,
    color: "#111",
  },
  workoutPatternSuggestion: {
    margin: "12px 0 0",
    padding: "10px 12px",
    borderRadius: 14,
    background: "#fff8dd",
    border: "1px solid #e2c96b",
    color: "#111",
    fontWeight: 900,
    fontSize: 13,
  },
  recentBodyReferenceBox: {
    background: "#fff",
    border: "1px solid #111",
    borderRadius: 18,
    padding: 14,
    margin: "12px 0",
    color: "#111",
  },
  recentBodyReferenceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  recentBodyReferenceEmpty: {
    margin: 0,
    padding: 12,
    border: "1px dashed #bdbdbd",
    borderRadius: 14,
    color: "#555",
    background: "#fafafa",
    lineHeight: 1.5,
  },
  recentBodyReferenceList: {
    display: "grid",
    gap: 10,
  },
  recentBodyReferenceCard: {
    border: "1px solid #d8d8d8",
    borderRadius: 14,
    padding: 12,
    background: "#fff",
  },
  recentBodyReferenceDate: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    color: "#111",
  },
  recentBodyExerciseWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  recentBodyExerciseButton: {
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    borderRadius: 999,
    padding: "8px 11px",
    fontWeight: 900,
    fontSize: 13,
  },
  recentBodyExerciseButtonAdded: {
    border: "1px solid #bdbdbd",
    background: "#efefef",
    color: "#777",
    borderRadius: 999,
    padding: "8px 11px",
    fontWeight: 900,
    fontSize: 13,
  },

  mobileEmergencyPage: {
    minHeight: "100vh",
    background: "#f6f7fb",
    color: "#111",
    padding: "14px",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  },
  mobileEmergencyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  mobileEmergencyTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 1000,
    color: "#111",
    letterSpacing: "-0.4px",
  },
  mobileEmergencySubtitle: {
    margin: "3px 0 0",
    fontSize: 12,
    fontWeight: 800,
    color: "#555",
  },
  mobileEmergencyRefreshButton: {
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 900,
    fontSize: 13,
  },
  mobileEmergencyDateBox: {
    display: "grid",
    gridTemplateColumns: "44px 1fr 44px",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  mobileEmergencyDateButton: {
    height: 42,
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 1000,
  },
  mobileEmergencyTodayButton: {
    height: 42,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 1000,
  },
  mobileEmergencyList: {
    display: "grid",
    gap: 10,
    paddingBottom: 28,
  },
  mobileEmergencySectionTitle: {
    margin: "2px 0 0",
    fontSize: 15,
    fontWeight: 1000,
    color: "#111",
  },
  mobileEmergencyEmpty: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 16,
    padding: 18,
    color: "#555",
    fontWeight: 800,
    textAlign: "center",
  },
  mobileEmergencyCard: {
    background: "#fff",
    border: "1px solid #dcdcdc",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
  },
  mobileEmergencyCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  mobileEmergencyTime: {
    fontSize: 15,
    fontWeight: 1000,
    color: "#111",
  },
  mobileEmergencyMemberLine: {
    fontSize: 14,
    fontWeight: 1000,
    color: "#111",
    lineHeight: 1.35,
    marginBottom: 3,
  },
  mobileEmergencySubLine: {
    fontSize: 12,
    fontWeight: 800,
    color: "#666",
    lineHeight: 1.35,
  },
  mobileEmergencyMemo: {
    margin: "8px 0 0",
    padding: "8px 10px",
    borderRadius: 12,
    background: "#f7f7f7",
    border: "1px solid #eee",
    color: "#333",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.45,
  },
  mobileEmergencyButtonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },
  mobileEmergencySmsButton: {
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 1000,
  },

};
