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
import {
  Save,
  Check,
  ExternalLink,
  Plus,
  AlertCircle,
  FileEdit,
} from "lucide-react";

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
    <div className="animate-fade-in" style={{ maxWidth: 840, margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>
            {initialSurvey ? "Edit Survey" : "Create New Survey"}
          </h1>
          {initialSurvey && (
            <span className="badge badge-indigo">v{initialSurvey.version}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {surveySlug && isPublished && (
            <a href={`/s/${surveySlug}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 13, padding: "8px 12px" }}>
              <ExternalLink size={15} />
              Preview Public Form
            </a>
          )}
          
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <label className="toggle">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: 13, fontWeight: 500, color: isPublished ? "var(--status-success)" : "var(--text-muted)" }}>
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <button id="save-survey-btn" onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? (
              "Saving…"
            ) : saved ? (
              <>
                <Check size={16} />
                Saved
              </>
            ) : (
              <>
                <Save size={16} />
                Save Survey
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 14px", background: "var(--status-error-bg)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, color: "var(--status-error)", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Survey Meta Details */}
      <div className="human-card" style={{ padding: 24, marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          General Information
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
              Survey Title <span style={{ color: "var(--status-error)" }}>*</span>
            </label>
            <input
              id="survey-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Customer Feedback Survey 2026"
              className="input"
              style={{ fontSize: 15, fontWeight: 500 }}
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
              placeholder="Provide context or instructions for participants…"
              className="input"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Questions Section Header */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Questions</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Drag and drop to reorder questions</p>
        </div>
        <button id="add-question-btn" onClick={addQuestion} className="btn-secondary" style={{ fontSize: 13, padding: "7px 12px" }}>
          <Plus size={15} />
          Add Question
        </button>
      </div>

      {/* Drag & Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={questions.map((q) => q._key)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

      {/* Add Question Button Strip */}
      <button
        onClick={addQuestion}
        style={{
          width: "100%",
          marginTop: 16,
          padding: "14px",
          border: "1px dashed var(--border-medium)",
          borderRadius: 10,
          background: "var(--bg-card)",
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.15s ease",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-medium)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
        }}
      >
        <Plus size={16} />
        Add Question
      </button>

      <div style={{ height: 60 }} />
    </div>
  );
}
