"use client";

import { useState, useMemo } from "react";
import type { ConditionalRule } from "@/lib/validations";
import { CheckCircle2, Star, AlertCircle, Send, FileText } from "lucide-react";

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
          background: "radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), var(--bg-main)",
        }}
      >
        <div className="human-card animate-fade-in" style={{ padding: "48px 36px", textAlign: "center", maxWidth: 440, width: "100%" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--status-success-bg)",
              color: "var(--status-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Thank You!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}>
            Your response has been submitted successfully.
          </p>
          <div className="badge badge-success" style={{ fontSize: 13, padding: "6px 14px" }}>
            Response recorded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), var(--bg-main)",
        padding: "40px 20px 80px",
      }}
    >
      {/* Top Fixed Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 3,
          background: "var(--bg-muted)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--accent-primary)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Survey Header */}
        <div className="human-card animate-fade-in" style={{ padding: 32, marginBottom: 24 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: "var(--accent-subtle)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-light)",
              marginBottom: 16,
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            <FileText size={20} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{survey.title}</h1>
          {survey.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
              {survey.description}
            </p>
          )}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              {progress}% completed
            </span>
          </div>
        </div>

        {/* Questions Form */}
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
                padding: "12px 14px",
                background: "var(--status-error-bg)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 8,
                color: "var(--status-error)",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              {submitError}
            </div>
          )}

          <button
            id="submit-survey-btn"
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ marginTop: 28, fontSize: 15, padding: "12px 24px", width: "100%", justifyContent: "center" }}
          >
            <Send size={16} />
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
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  return (
    <div
      className="human-card animate-fade-in"
      style={{ padding: "22px 24px" }}
    >
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
          {index + 1}.
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, marginLeft: 8, color: "var(--text-main)" }}>
          {question.label}
        </span>
        {question.required && (
          <span style={{ color: "var(--status-error)", marginLeft: 4 }}>*</span>
        )}
      </div>

      {question.type === "TEXT" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your response here…"
          className="input"
          rows={3}
        />
      )}

      {question.type === "MULTIPLE_CHOICE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(question.options ?? []).map((opt) => {
            const isSelected = value === opt;
            return (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1px solid ${isSelected ? "var(--border-focus)" : "var(--border-subtle)"}`,
                  cursor: "pointer",
                  background: isSelected ? "var(--accent-subtle)" : "var(--bg-surface)",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  style={{ accentColor: "var(--accent-primary)" }}
                />
                <span style={{ fontSize: 14, color: "var(--text-main)" }}>{opt}</span>
              </label>
            );
          })}
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
                  borderRadius: 8,
                  border: `1px solid ${checked ? "var(--border-focus)" : "var(--border-subtle)"}`,
                  cursor: "pointer",
                  background: checked ? "var(--accent-subtle)" : "var(--bg-surface)",
                  transition: "all 0.15s ease",
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
                  style={{ accentColor: "var(--accent-primary)" }}
                />
                <span style={{ fontSize: 14, color: "var(--text-main)" }}>{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "RATING" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const activeStar = (hoverRating ?? Number(value ?? 0)) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: activeStar ? "#f59e0b" : "var(--border-medium)",
                  transition: "transform 0.1s ease, color 0.15s ease",
                }}
              >
                <Star size={28} fill={activeStar ? "#f59e0b" : "none"} />
              </button>
            );
          })}
          {value !== undefined && (
            <span style={{ marginLeft: 12, color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>
              {value} / 5
            </span>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, color: "var(--status-error)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
