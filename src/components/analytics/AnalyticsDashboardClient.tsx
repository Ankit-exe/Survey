"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface QuestionAnalytic {
  questionId: string;
  label: string;
  type: string;
  // Text
  data?: string[];
  // Rating
  average?: number;
  distribution?: { rating: number; count: number }[];
  total?: number;
  // MC/Checkbox
  options?: { option: string; count: number }[];
}

interface Props {
  totalResponses: number;
  questionAnalytics: QuestionAnalytic[];
  responsesByDay: { date: string; count: number }[];
}

const CHART_COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#a78bfa", "#818cf8"];

export default function AnalyticsDashboardClient({ totalResponses, questionAnalytics, responsesByDay }: Props) {
  return (
    <div>
      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Responses", value: totalResponses, icon: "📊" },
          { label: "Questions", value: questionAnalytics.length, icon: "❓" },
          { label: "Avg Rating Qs", value: questionAnalytics.filter((q) => q.type === "RATING" && (q.average ?? 0) > 0).length > 0
              ? (questionAnalytics.filter((q) => q.type === "RATING").reduce((s, q) => s + (q.average ?? 0), 0) / Math.max(questionAnalytics.filter((q) => q.type === "RATING").length, 1)).toFixed(1)
              : "–",
            icon: "⭐" },
          { label: "Last 30 Days", value: responsesByDay.reduce((s, d) => s + d.count, 0), icon: "📅" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: "18px 22px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "var(--accent-light)" }}>
              {stat.value}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Responses Over Time */}
      {responsesByDay.length > 0 && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Responses Over Time (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={responsesByDay.sort((a, b) => a.date.localeCompare(b.date))}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }}
              />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorCount)" name="Responses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {totalResponses === 0 && (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ color: "var(--text-secondary)" }}>No responses yet. Share the survey link to collect data.</p>
        </div>
      )}

      {/* Per-Question Analytics */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Question Insights</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {questionAnalytics.map((qa, idx) => (
          <div key={qa.questionId} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Q{idx + 1}</span>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{qa.label}</h4>
              </div>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>
                {qa.type.replace("_", " ")}
              </span>
            </div>

            {qa.type === "TEXT" && (
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 10 }}>
                  {qa.data?.length ?? 0} responses
                </p>
                <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {(qa.data ?? []).slice(0, 20).map((text, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {text}
                    </div>
                  ))}
                  {(qa.data?.length ?? 0) > 20 && (
                    <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
                      + {(qa.data?.length ?? 0) - 20} more responses
                    </p>
                  )}
                </div>
              </div>
            )}

            {qa.type === "RATING" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "var(--accent-light)" }}>{qa.average ?? 0}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>avg / 5</div>
                  </div>
                  <div>
                    {"⭐".repeat(Math.round(qa.average ?? 0))}
                    {"☆".repeat(5 - Math.round(qa.average ?? 0))}
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{qa.total} ratings</div>
                  </div>
                </div>
                {qa.distribution && (
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={qa.distribution} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="rating" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} tickFormatter={(v) => `★${v}`} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Responses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {(qa.type === "MULTIPLE_CHOICE" || qa.type === "CHECKBOX") && qa.options && (
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 12 }}>
                  {qa.total} responses
                </p>
                <ResponsiveContainer width="100%" height={Math.max(120, (qa.options.length * 40))}>
                  <BarChart data={qa.options} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="option" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} width={120} />
                    <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
                    <Bar dataKey="count" name="Responses" radius={[0, 4, 4, 0]}>
                      {qa.options.map((_, i) => (
                        <rect key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
