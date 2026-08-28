"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question, ConditionalRule } from "@/lib/validations";
import ConditionalLogicEditor from "./ConditionalLogicEditor";
import OptionsEditor from "./OptionsEditor";
import { GripVertical, Trash2 } from "lucide-react";

const QUESTION_TYPES = [
  { value: "TEXT", label: "Text Input" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "CHECKBOX", label: "Checkbox (Multi-select)" },
  { value: "RATING", label: "Rating (1–5)" },
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const typeNeedsOptions = question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOX";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="human-card"
    >
      <div style={{ padding: "18px 20px" }}>
        {/* Question Control Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              color: "var(--text-muted)",
              flexShrink: 0,
              padding: "4px 2px",
              display: "flex",
              alignItems: "center",
              touchAction: "none",
            }}
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </div>

          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, minWidth: 24, flexShrink: 0 }}>
            Q{question.order + 1}
          </span>

          {/* Question Type Selector */}
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
            style={{ maxWidth: 200, padding: "6px 10px", fontSize: 13 }}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {/* Required Toggle */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <label className="toggle">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Required</span>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="btn-danger"
            style={{ padding: "6px 8px", flexShrink: 0 }}
            title="Delete question"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Question Title Input */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={question.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Type your question here…"
            className="input"
            style={{ fontSize: 14, fontWeight: 500 }}
          />
        </div>

        {/* Options Editor */}
        {typeNeedsOptions && (
          <OptionsEditor
            options={(question.options as string[]) ?? []}
            onChange={(opts) => onUpdate({ options: opts })}
          />
        )}

        {/* Conditional Logic Editor */}
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
