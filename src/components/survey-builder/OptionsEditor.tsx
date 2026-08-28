"use client";

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
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
        OPTIONS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((opt, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, border: "1.5px solid var(--border)", flexShrink: 0 }} />
            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="input"
              style={{ fontSize: 13, padding: "6px 10px" }}
            />
            <button
              onClick={() => removeOption(idx)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 4,
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          style={{
            background: "none",
            border: "1px dashed var(--border)",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            textAlign: "left",
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
          + Add Option
        </button>
      </div>
    </div>
  );
}
