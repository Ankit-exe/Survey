"use client";

import { useState, useMemo } from "react";
import type { ConditionalRule } from "@/lib/validations";

interface Question {
  id: string;
  type: "TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "RATING";
  label: string;
  required: boolean;
  options?: string[] | null;
  conditions?: ConditionalRule[] | null;
  order: number;
}

interface Survey {
  id: string;
  title: string;
  description?: string | null;
  questions: Question[];
}

interface SurveyFormClientProps {
  survey: Survey;
}

type AnswerValue = string | string[] | number;

function evaluateConditions(
  conditions: ConditionalRule[] | null | undefined,
  answers: Record<string, AnswerValue>,
  allQuestions: Question[]
): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((cond) => {
    // Find the question this condition depends on (by id or _key)
    const depQ = allQuestions.find((q) => q.id === cond.dependsOnId);
    if (!depQ) return true;
    const answer = answers[depQ.id];
    const answerStr = Array.isArray(answer) ? answer.join(",") : String(answer ?? "");

    switch (cond.operator) {
      case "equals": return answerStr === cond.value;
      case "not_equals": return answerStr !== cond.value;
      case "contains": return answerStr.includes(cond.value);
      default: return true;
    }
  });
}

export default function SurveyFormClient({ survey }: SurveyFormClientProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Compute visible questions based on conditional logic
  const visibleQuestions = useMemo(() => {
    return survey.questions.filter((q) =>
      evaluateConditions(q.conditions, answers, survey.questions)
    );
  }, [survey.questions, answers]);

  const progress = useMemo(() => {
    const answered = visibleQuestions.filter((q) => {
      const a = answers[q.id];
      if (a === undefined || a === null || a === "") return false;
      if (Array.isArray(a)) return a.length > 0;
      return true;
    }).length;
    return visibleQuestions.length > 0 ? Math.round((answered / visibleQuestions.length) * 100) : 0;
  }, [visibleQuestions, answers]);

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => { const e = { ...prev }; delete e[questionId]; return e; });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    for (const q of visibleQuestions) {
      if (!q.required) continue;
      const a = answers[q.id];
      if (a === undefined || a === null || a === "") {
        newErrors[q.id] = "This field is required";
      } else if (Array.isArray(a) && a.length === 0) {
        newErrors[q.id] = "Please select at least one option";
      } else if (q.type === "RATING" && (Number(a) < 1 || Number(a) > 5)) {
        newErrors[q.id] = "Please select a rating between 1 and 5";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    // Only include visible questions' answers
    const filteredAnswers: Record<string, AnswerValue> = {};
    for (const q of visibleQuestions) {
      if (answers[q.id] !== undefined) {
        filteredAnswers[q.id] = answers[q.id];
      }
    }

    const res = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyId: survey.id, answers: filteredAnswers }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setSubmitError(data.error ?? "Submission failed. Please try again.");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 60%), var(--bg-primary)",
        }}
      >
        <div className="glass-card animate-fade-in-up" style={{ padding: 48, textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Thank you!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Your response has been submitted successfully.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "8px 16px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 8,
              color: "var(--success)",
              fontSize: 14,
              display: "inline-block",
            }}
          >
            ✓ Response recorded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, rgba(139,92,246,0.1) 0%, transparent 50%), var(--bg-primary)",
        padding: "40px 24px 80px",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 3,
          background: "var(--bg-secondary)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--gradient-primary)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Survey header */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 32, marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "var(--gradient-primary)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{survey.title}</h1>
          {survey.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
              {survey.description}
            </p>
          )}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              {progress}% complete
            </span>
          </div>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {visibleQuestions.map((question, idx) => (
              <QuestionField
                key={question.id}
                question={question}
                index={idx}
                value={answers[question.id]}
                error={errors[question.id]}
                onChange={(val) => setAnswer(question.id, val)}
              />
            ))}
          </div>

          {submitError && (
            <div
              style={{
                marginTop: 20,
                padding: "12px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                color: "var(--error)",
                fontSize: 14,
              }}
            >
              {submitError}
            </div>
          )}

          <button
            id="submit-survey-btn"
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ marginTop: 28, fontSize: 16, padding: "14px 32px", width: "100%", justifyContent: "center" }}
          >
            {submitting ? "Submitting…" : "Submit Response"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Individual Question Field ────────────────────────────────────────────────

interface QuestionFieldProps {
  question: Question;
  index: number;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (val: AnswerValue) => void;
}

function QuestionField({ question, index, value, error, onChange }: QuestionFieldProps) {
  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{ padding: "22px 24px", animationDelay: `${index * 50}ms` }}
    >
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          {index + 1}.
        </span>
        <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 6 }}>
          {question.label}
        </span>
        {question.required && (
          <span style={{ color: "var(--error)", marginLeft: 4 }}>*</span>
        )}
      </div>

      {question.type === "TEXT" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
          className="input"
          rows={3}
        />
      )}

      {question.type === "MULTIPLE_CHOICE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(question.options ?? []).map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                border: `1.5px solid ${value === opt ? "var(--accent)" : "var(--border)"}`,
                cursor: "pointer",
                background: value === opt ? "rgba(139,92,246,0.08)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                style={{ accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: 14 }}>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === "CHECKBOX" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(question.options ?? []).map((opt) => {
            const checked = Array.isArray(value) && value.includes(opt);
            return (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                  cursor: "pointer",
                  background: checked ? "rgba(139,92,246,0.08)" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  value={opt}
                  checked={checked}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...current, opt]);
                    } else {
                      onChange(current.filter((v) => v !== opt));
                    }
                  }}
                  style={{ accentColor: "var(--accent)" }}
                />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "RATING" && (
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-btn"
              onClick={() => onChange(star)}
              style={{ fontSize: 32 }}
            >
              {Number(value) >= star ? "⭐" : "☆"}
            </button>
          ))}
          {value && (
            <span style={{ marginLeft: 8, alignSelf: "center", color: "var(--text-secondary)", fontSize: 14 }}>
              {value} / 5
            </span>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 8, color: "var(--error)", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
