"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question, ConditionalRule } from "@/lib/validations";
import ConditionalLogicEditor from "./ConditionalLogicEditor";
import OptionsEditor from "./OptionsEditor";

const QUESTION_TYPES = [
  { value: "TEXT", label: "📝 Text Input" },
  { value: "MULTIPLE_CHOICE", label: "🔘 Multiple Choice" },
  { value: "CHECKBOX", label: "☑️ Checkbox" },
  { value: "RATING", label: "⭐ Rating (1–5)" },
];

interface Props {
  question: Question & { _key: string };
  allQuestions: Array<Question & { _key: string }>;
  onUpdate: (updates: Partial<Question>) => void;
  onRemove: () => void;
}

export default function SortableQuestionCard({ question, allQuestions, onUpdate, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question._key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const typeNeedsOptions = question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOX";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card"
    >
      <div style={{ padding: "18px 20px" }}>
        {/* Question Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              color: "var(--text-muted)",
              flexShrink: 0,
              padding: 4,
              touchAction: "none",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, flexShrink: 0 }}>
            Q{question.order + 1}
          </span>

          {/* Type selector */}
          <select
            value={question.type}
            onChange={(e) => {
              const type = e.target.value as Question["type"];
              onUpdate({
                type,
                options: type === "MULTIPLE_CHOICE" || type === "CHECKBOX" ? (question.options ?? ["Option 1"]) : null,
              });
            }}
            className="input select"
            style={{ maxWidth: 200, padding: "6px 12px", fontSize: 13 }}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {/* Required toggle */}
          <label className="toggle tooltip" data-tip="Required" style={{ marginLeft: "auto", flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
          <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>Required</span>

          {/* Remove */}
          <button
            onClick={onRemove}
            className="btn-danger"
            style={{ padding: "6px 10px", flexShrink: 0 }}
            title="Remove question"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Label */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={question.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter question text…"
            className="input"
          />
        </div>

        {/* Options editor for MC/Checkbox */}
        {typeNeedsOptions && (
          <OptionsEditor
            options={(question.options as string[]) ?? []}
            onChange={(opts) => onUpdate({ options: opts })}
          />
        )}

        {/* Conditional logic */}
        {allQuestions.length > 1 && (
          <ConditionalLogicEditor
            conditions={(question.conditions as ConditionalRule[]) ?? []}
            currentQuestionOrder={question.order}
            allQuestions={allQuestions}
            onChange={(conditions) => onUpdate({ conditions })}
          />
        )}
      </div>
    </div>
  );
}
