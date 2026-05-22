"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const preferenceGroups = [
  {
    key: "preference_intensity",
    title: "트레이닝 스타일",
    desc: "운동할 때 어떤 방식이 편한지 체크해주세요.",
    options: [
      "강하게 밀어주세요 (운동할 땐 확실하게 하는 게 좋아요)",
      "부드럽고 편하게 해주세요 (칭찬과 격려가 편해요)",
      "천천히 맞춰주세요 (부담 없이 운동하고 싶어요)",
    ],
  },
  {
    key: "preference_management_style",
    title: "관리 스타일",
    desc: "운동 외에 식단, 생활습관, 컨디션 관리를 어느 정도 원하시는지 체크해주세요.",
    options: [
      "꼼꼼하게 관리해주세요 (식단, 생활습관도 같이 체크받고 싶어요)",
      "적당히 체크만 해주세요 (필요한 부분만 편하게 관리받고 싶어요)",
      "운동에만 집중하고 싶어요 (간섭은 최소한이 좋아요)",
    ],
  },
  {
    key: "preference_motivation_style",
    title: "관리 스타일",
    desc: "운동 중 어떤 말투와 분위기가 편한지 체크해주세요.",
    options: [
      "편한 분위기가 좋아요 (너무 딱딱한 분위기는 싫어요)",
      "담백하게 알려주세요 (과한 리액션은 부담스러워요)",
      "운동할 땐 조금 밀어줘도 괜찮아요 (힘들어도 끌어주는 스타일 좋아요)",
    ],
  },
  {
    key: "preference_touch_style",
    title: "자세 잡을 때 터치",
    desc: "자세를 봐드릴 때 터치에 대한 생각을 체크해주세요.",
    options: [
      "괜찮아요 (자세 잡을 때 필요한 터치는 괜찮아요)",
      "가능하지만 최소한으로 해주세요 (미리 설명해주면 좋아요)",
      "조금 불편해요 (터치 없이 설명해주세요)",
    ],
  },
  {
    key: "preference_communication_style",
    title: "대화 스타일",
    desc: "수업 중 대화 방식에 대해 편한 쪽을 체크해주세요.",
    options: [
      "재미있게 대화 나누면서 운동하고 싶어요. (수업 분위기가 편한 게 좋아요)",
      "필요한 말만 해주세요. (운동에 집중하는 편이 좋아요)",
      "개인적인 이야기는 나누고 싶지 않아요. (프라이버시를 존중해주세요)",

    ],
  },
  {
    key: "preference_class_mood",
    title: "수업 분위기",
    desc: "원하시는 수업 분위기에 가까운 항목을 체크해주세요.",
    options: [
      "밝고 재밌는 분위기가 좋아요",
      "차분하게 운동하는 분위기가 좋아요",
      "상황(컨디션)에 따라 바뀌어도 괜찮아요",
    ],
  },
];

function parseValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyValue(value) {
  if (!Array.isArray(value)) return null;
  return value.length > 0 ? value.join("||") : null;
}

function toggleValue(values, option) {
  if (values.includes(option)) {
    return values.filter((item) => item !== option);
  }
  return [...values, option];
}

function emptyForm() {
  return preferenceGroups.reduce((acc, group) => {
    acc[group.key] = [];
    return acc;
  }, {});
}

export default function PreferenceCheckPage() {
  const params = useParams();
  const memberId = params?.memberId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [member, setMember] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [requestNote, setRequestNote] = useState("");

  const selectedCount = useMemo(() => {
    return Object.values(form).reduce((sum, values) => sum + values.length, 0);
  }, [form]);

  useEffect(() => {
    if (!memberId) return;
    loadMember();
  }, [memberId]);

  async function loadMember() {
    setLoading(true);

    const { data, error } = await supabase
      .from("members")
      .select(
        "id,name,preference_intensity,preference_management_style,preference_motivation_style,preference_touch_style,preference_communication_style,preference_class_mood,preference_request_note"
      )
      .eq("id", memberId)
      .single();

    if (error || !data) {
      console.error(error);
      setMember(null);
      setLoading(false);
      return;
    }

    const nextForm = emptyForm();
    preferenceGroups.forEach((group) => {
      const currentValues = parseValue(data[group.key]);
      nextForm[group.key] = currentValues.filter((value) =>
        group.options.includes(value)
      );
    });

    setMember(data);
    setForm(nextForm);
    setRequestNote(data.preference_request_note || "");
    setLoading(false);
  }

  function handleToggle(groupKey, option) {
    setForm((prev) => ({
      ...prev,
      [groupKey]: toggleValue(prev[groupKey] || [], option),
    }));
  }

  async function savePreference() {
    if (!memberId) return;

    setSaving(true);

    const payload = {
      preference_intensity: stringifyValue(form.preference_intensity),
      preference_management_style: stringifyValue(form.preference_management_style),
      preference_motivation_style: stringifyValue(form.preference_motivation_style),
      preference_touch_style: stringifyValue(form.preference_touch_style),
      preference_communication_style: stringifyValue(form.preference_communication_style),
      preference_class_mood: stringifyValue(form.preference_class_mood),
      preference_request_note: requestNote.trim() || null,
      preference_updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("members")
      .update(payload)
      .eq("id", memberId);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("저장 중 오류가 났어요. 다시 한번 시도해주세요.");
      return;
    }

    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>불러오는 중입니다...</div>
      </main>
    );
  }

  if (!member) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>
          <h1 style={styles.errorTitle}>페이지를 찾을 수 없어요.</h1>
          <p style={styles.errorText}>링크가 정확한지 다시 확인해주세요.</p>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main style={styles.page}>
        <section style={styles.completeCard}>
          <div style={styles.completeIcon}>😊</div>
          <h1 style={styles.completeTitle}>체크 완료</h1>
          <p style={styles.completeText}>
            체크해주신 내용 확인했습니다🙂‍↕️
            <br />
            참고하여 수업 진행하겠습니다 :)
          </p>
          <p style={styles.completeThanks}>작성 감사합니다😊</p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.headerCard}>
        <div style={styles.brand}>SPOTAINER</div>
        <h1 style={styles.title}>성향 체크리스트</h1>
        <p style={styles.description}>
          안녕하세요 스포테이너 피트니스 팀장 김선수입니다😊
          <br />
          <br />
          회원님의 운동 스타일과 목표를 이해하고 보다 효율적인 수업 방향을 설계하기 위해 간단한 체크리스트 작성 부탁드려요🙂‍↕️
          <br />
          <br />
          작성해주신 내용은 회원님 운동 스타일과 성향을 파악하고 앞으로 수업 방향을 잡는 데 도움이 됩니다 :)
        </p>
        <div style={styles.memberBox}>{member.name}님</div>
      </section>

      {preferenceGroups.map((group) => (
        <section key={group.key} style={styles.card}>
          <div style={styles.groupHeader}>
            <h2 style={styles.groupTitle}>{group.title}</h2>
            <p style={styles.groupDesc}>{group.desc}</p>
          </div>

          <div style={styles.optionList}>
            {group.options.map((option) => {
              const selected = (form[group.key] || []).includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleToggle(group.key, option)}
                  style={{
                    ...styles.optionButton,
                    ...(selected ? styles.optionActive : {}),
                  }}
                >
                  <span style={styles.checkMark}>{selected ? "✓" : ""}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <section style={styles.card}>
        <h2 style={styles.groupTitle}>선생님께 바라는 점</h2>
        <p style={styles.groupDesc}>
          수업 때 조심했으면 하는 부분이나 따로 남기고 싶은 내용이 있다면 편하게 작성해주세요.
        </p>
        <textarea
          value={requestNote}
          onChange={(e) => setRequestNote(e.target.value)}
          placeholder="예: 설명을 조금 더 자세히 듣고 싶어요 / 운동할 때 말은 적은 편이 좋아요 / 터치는 조금 조심스러워요"
          style={styles.textarea}
        />
      </section>

      <section style={styles.bottomBar}>
        <div style={styles.selectedText}>선택 {selectedCount}개</div>
        <button
          type="button"
          onClick={savePreference}
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? "저장 중..." : "제출하기"}
        </button>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f1ec",
    color: "#1f2937",
    padding: "18px",
    paddingBottom: "120px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  centerCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "28px",
    margin: "40px auto",
    maxWidth: "520px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  headerCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "22px",
    marginBottom: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  brand: {
    fontSize: "12px",
    fontWeight: "900",
    color: "#9a6b4f",
    letterSpacing: "0.12em",
    marginBottom: "10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "900",
    margin: "0 0 14px",
    color: "#111827",
  },
  description: {
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#374151",
    margin: 0,
    whiteSpace: "pre-line",
  },
  memberBox: {
    marginTop: "18px",
    display: "inline-flex",
    background: "#f5f1ec",
    border: "1px solid #eadfd5",
    borderRadius: "999px",
    padding: "9px 14px",
    fontSize: "14px",
    fontWeight: "900",
    color: "#7a4f38",
  },
  card: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "18px",
    marginBottom: "14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.045)",
  },
  groupHeader: {
    marginBottom: "12px",
  },
  groupTitle: {
    fontSize: "18px",
    fontWeight: "900",
    margin: "0 0 6px",
    color: "#111827",
  },
  groupDesc: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#6b7280",
    margin: 0,
  },
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  optionButton: {
    width: "100%",
    minHeight: "52px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textAlign: "left",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "12px",
    fontSize: "14px",
    lineHeight: 1.45,
    color: "#111827",
    fontWeight: "700",
  },
  optionActive: {
    border: "2px solid #9a6b4f",
    background: "#fbf7f3",
  },
  checkMark: {
    width: "22px",
    height: "22px",
    minWidth: "22px",
    borderRadius: "999px",
    background: "#9a6b4f",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "14px",
    fontSize: "15px",
    lineHeight: 1.5,
    marginTop: "12px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  bottomBar: {
    position: "fixed",
    left: "0",
    right: "0",
    bottom: "0",
    background: "rgba(255,255,255,0.95)",
    borderTop: "1px solid #e5e7eb",
    padding: "12px 16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    boxShadow: "0 -8px 20px rgba(0,0,0,0.06)",
  },
  selectedText: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  saveButton: {
    flex: 1,
    height: "52px",
    border: "none",
    borderRadius: "16px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "900",
  },
  completeCard: {
    background: "#ffffff",
    borderRadius: "26px",
    padding: "34px 22px",
    margin: "60px auto",
    maxWidth: "520px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  completeIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },
  completeTitle: {
    fontSize: "24px",
    fontWeight: "900",
    margin: "0 0 14px",
  },
  completeText: {
    fontSize: "16px",
    lineHeight: 1.65,
    color: "#374151",
    margin: 0,
  },
  completeThanks: {
    fontSize: "16px",
    fontWeight: "800",
    marginTop: "18px",
    color: "#7a4f38",
  },
  errorTitle: {
    fontSize: "22px",
    fontWeight: "900",
    margin: "0 0 10px",
  },
  errorText: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0,
  },
};
