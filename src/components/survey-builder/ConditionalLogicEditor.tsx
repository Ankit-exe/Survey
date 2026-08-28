"use client";

import { useState } from "react";
import type { ConditionalRule, Question } from "@/lib/validations";

interface ConditionalLogicEditorProps {
  conditions: ConditionalRule[];
  currentQuestionOrder: number;
  allQuestions: Array<Question & { _key: string }>;
  onChange: (conditions: ConditionalRule[]) => void;
}

export default function ConditionalLogicEditor({
  conditions,
  currentQuestionOrder,
  allQuestions,
  onChange,
}: ConditionalLogicEditorProps) {
  const [isOpen, setIsOpen] = useState(conditions.length > 0);

  // Only questions that come BEFORE this one
  const precedingQuestions = allQuestions.filter(
    (q) => q.order < currentQuestionOrder && (q.type === "MULTIPLE_CHOICE" || q.type === "CHECKBOX" || q.type === "TEXT")
  );

  const addCondition = () => {
    if (precedingQuestions.length === 0) return;
    const first = precedingQuestions[0];
    onChange([
      ...conditions,
      {
        dependsOnId: first._key,
        operator: "equals",
        value: "",
      },
    ]);
  };

  const removeCondition = (idx: number) => {
    onChange(conditions.filter((_, i) => i !== idx));
  };

  const updateCondition = (idx: number, updates: Partial<ConditionalRule>) => {
    onChange(conditions.map((c, i) => (i === idx ? { ...c, ...updates } : c)));
  };

  if (precedingQuestions.length === 0) return null;

  return (
    <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          color: conditions.length > 0 ? "var(--accent-light)" : "var(--text-muted)",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: 0,
        }}
      >
        <svg
          width="12"
          height="12"
          fill="none"
          viewBox="0 0 24 24"
          style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
        >
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Conditional Logic
        {conditions.length > 0 && (
          <span className="badge badge-purple" style={{ fontSize: 10, padding: "1px 6px" }}>
            {conditions.length} rule{conditions.length > 1 ? "s" : ""}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            Show this question only if:
          </p>

          {conditions.map((condition, idx) => {
            const depQuestion = precedingQuestions.find((q) => q._key === condition.dependsOnId);
            const depOptions =
              depQuestion?.type === "MULTIPLE_CHOICE" || depQuestion?.type === "CHECKBOX"
                ? ((depQuestion.options as string[]) ?? [])
                : null;

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <select
                  value={condition.dependsOnId}
                  onChange={(e) => updateCondition(idx, { dependsOnId: e.target.value, value: "" })}
                  className="input select"
                  style={{ fontSize: 12, padding: "4px 8px", maxWidth: 180 }}
                >
                  {precedingQuestions.map((q) => (
                    <option key={q._key} value={q._key}>
                      Q{q.order + 1}: {q.label.slice(0, 30) || "Untitled"}
                    </option>
                  ))}
                </select>

                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(idx, { operator: e.target.value as ConditionalRule["operator"] })}
                  className="input select"
                  style={{ fontSize: 12, padding: "4px 8px", maxWidth: 130 }}
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">not equals</option>
                  <option value="contains">contains</option>
                </select>

                {depOptions ? (
                  <select
                    value={condition.value}
                    onChange={(e) => updateCondition(idx, { value: e.target.value })}
                    className="input select"
                    style={{ fontSize: 12, padding: "4px 8px", maxWidth: 160 }}
                  >
                    <option value="">-- select --</option>
                    {depOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateCondition(idx, { value: e.target.value })}
                    placeholder="value"
                    className="input"
                    style={{ fontSize: 12, padding: "4px 8px", maxWidth: 150 }}
                  />
                )}

                <button onClick={() => removeCondition(idx)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", padding: 2 }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            );
          })}

          <button
            onClick={addCondition}
            style={{
              background: "none",
              border: "1px dashed rgba(139,92,246,0.3)",
              color: "var(--accent-light)",
              cursor: "pointer",
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 12,
              textAlign: "left",
            }}
          >
            + Add Condition
          </button>
        </div>
      )}
    </div>
  );
}
