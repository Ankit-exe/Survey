"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Question, ConditionalRule } from "@/lib/validations";
import SortableQuestionCard from "./SortableQuestionCard";

type QuestionType = "TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "RATING";

interface SurveyData {
  id?: string;
  title?: string;
  description?: string | null;
  isPublished?: boolean;
  slug?: string;
  version?: number;
  questions?: Array<{
    id?: string;
    order: number;
    type: QuestionType;
    label: string;
    required: boolean;
    options?: unknown;
    conditions?: unknown;
  }>;
}

interface SurveyBuilderClientProps {
  initialSurvey?: SurveyData;
}

function newQuestion(order: number): Question & { _key: string } {
  return {
    _key: Math.random().toString(36).slice(2),
    order,
    type: "TEXT",
    label: "",
    required: false,
    options: null,
    conditions: null,
  };
}

export default function SurveyBuilderClient({ initialSurvey }: SurveyBuilderClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialSurvey?.title ?? "");
  const [description, setDescription] = useState(initialSurvey?.description ?? "");
  const [isPublished, setIsPublished] = useState(initialSurvey?.isPublished ?? false);
  const [questions, setQuestions] = useState<Array<Question & { _key: string }>>(
    initialSurvey?.questions?.map((q) => ({
      _key: q.id ?? Math.random().toString(36).slice(2),
      id: q.id,
      order: q.order,
      type: q.type as QuestionType,
      label: q.label,
      required: q.required,
      options: (q.options as string[]) ?? null,
      conditions: (q.conditions as ConditionalRule[]) ?? null,
    })) ?? [newQuestion(0)]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setQuestions((prev) => {
      const oldIdx = prev.findIndex((q) => q._key === active.id);
      const newIdx = prev.findIndex((q) => q._key === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      return reordered.map((q, i) => ({ ...q, order: i }));
    });
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, newQuestion(prev.length)]);
  }, []);

  const removeQuestion = useCallback((key: string) => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q._key !== key);
      return filtered.map((q, i) => ({ ...q, order: i }));
    });
  }, []);

  const updateQuestion = useCallback((key: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q._key === key ? { ...q, ...updates } : q))
    );
  }, []);

  async function handleSave() {
    if (!title.trim()) { setError("Survey title is required"); return; }
    if (questions.length === 0) { setError("Add at least one question"); return; }
    if (questions.some((q) => !q.label.trim())) { setError("All questions must have a label"); return; }

    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      isPublished,
      questions: questions.map((q) => ({
        id: q.id,
        order: q.order,
        type: q.type,
        label: q.label,
        required: q.required,
        options: q.options ?? null,
        conditions: q.conditions ?? null,
      })),
    };

    const url = initialSurvey?.id ? `/api/surveys/${initialSurvey.id}` : "/api/surveys";
    const method = initialSurvey?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? "Failed to save survey");
      return;
    }

    const data = await res.json();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    if (!initialSurvey?.id) {
      router.push(`/admin/surveys/${data.id}/edit`);
    }
  }

  const surveySlug = initialSurvey?.slug;

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>
            {initialSurvey ? "Edit Survey" : "New Survey"}
          </h1>
          {initialSurvey && (
            <span className="badge badge-purple" style={{ marginTop: 4 }}>v{initialSurvey.version}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {surveySlug && isPublished && (
            <a href={`/s/${surveySlug}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 13 }}>
              Preview ↗
            </a>
          )}
          <label className="toggle" title={isPublished ? "Published" : "Draft"}>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {isPublished ? "Published" : "Draft"}
          </span>
          <button id="save-survey-btn" onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Survey"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "var(--error)", fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Survey Meta */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>Survey Details</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
              Title <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              id="survey-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title…"
              className="input"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              id="survey-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for respondents…"
              className="input"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Questions ({questions.length})</h2>
        <button id="add-question-btn" onClick={addQuestion} className="btn-secondary" style={{ fontSize: 13 }}>
          + Add Question
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={questions.map((q) => q._key)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {questions.map((q) => (
              <SortableQuestionCard
                key={q._key}
                question={q}
                allQuestions={questions}
                onUpdate={(updates) => updateQuestion(q._key, updates)}
                onRemove={() => removeQuestion(q._key)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {questions.length === 0 && (
        <div
          className="glass-card"
          style={{ padding: 40, textAlign: "center", cursor: "pointer" }}
          onClick={addQuestion}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>➕</div>
          <p style={{ color: "var(--text-secondary)" }}>Click to add your first question</p>
        </div>
      )}

      <button
        onClick={addQuestion}
        style={{
          width: "100%",
          marginTop: 12,
          padding: 14,
          border: "2px dashed var(--border)",
          borderRadius: 12,
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: 14,
          transition: "border-color 0.2s, color 0.2s",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-light)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
        }}
      >
        + Add Question
      </button>

      <div style={{ height: 60 }} />
    </div>
  );
}
