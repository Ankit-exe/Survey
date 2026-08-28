"use client";

import { Plus, X } from "lucide-react";

interface OptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export default function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const addOption = () => onChange([...options, `Option ${options.length + 1}`]);
  const removeOption = (idx: number) => onChange(options.filter((_, i) => i !== idx));
  const updateOption = (idx: number, value: string) =>
    onChange(options.map((opt, i) => (i === idx ? value : opt)));

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>
        OPTIONS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((opt, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--border-medium)", flexShrink: 0 }} />
            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="input"
              style={{ fontSize: 13, padding: "5px 10px" }}
            />
            {options.length > 1 && (
              <button
                onClick={() => removeOption(idx)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  borderRadius: 4,
                }}
                title="Remove option"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addOption}
          className="btn-ghost"
          style={{
            marginTop: 2,
            padding: "5px 8px",
            fontSize: 12,
            color: "var(--accent-light)",
            alignSelf: "flex-start",
          }}
        >
          <Plus size={14} />
          Add Option
        </button>
      </div>
    </div>
  );
}
