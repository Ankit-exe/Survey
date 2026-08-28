"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { Users, HelpCircle, Star, Calendar, Inbox, BarChart3 } from "lucide-react";

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

const BAR_COLORS = ["#6366f1", "#4f46e5", "#3b82f6", "#0284c7", "#0d9488"];

export default function AnalyticsDashboardClient({ totalResponses, questionAnalytics, responsesByDay }: Props) {
  return (
    <div>
      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Responses", value: totalResponses, icon: <Users size={18} color="var(--accent-light)" /> },
          { label: "Total Questions", value: questionAnalytics.length, icon: <HelpCircle size={18} color="var(--accent-light)" /> },
          {
            label: "Avg Rating Score",
            value: questionAnalytics.filter((q) => q.type === "RATING" && (q.average ?? 0) > 0).length > 0
              ? (questionAnalytics.filter((q) => q.type === "RATING").reduce((s, q) => s + (q.average ?? 0), 0) / Math.max(questionAnalytics.filter((q) => q.type === "RATING").length, 1)).toFixed(1)
              : "–",
            icon: <Star size={18} color="var(--status-warning)" />,
          },
          { label: "30-Day Activity", value: responsesByDay.reduce((s, d) => s + d.count, 0), icon: <Calendar size={18} color="var(--accent-light)" /> },
        ].map((stat) => (
          <div key={stat.label} className="human-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{stat.label}</span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: "var(--bg-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {stat.icon}
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Response Trend Chart */}
      {responsesByDay.length > 0 && (
        <div className="human-card" style={{ padding: 24, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <BarChart3 size={18} color="var(--accent-light)" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Response Activity (Last 30 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={responsesByDay.sort((a, b) => a.date.localeCompare(b.date))}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#f4f4f5", fontSize: 13 }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorCount)" name="Responses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {totalResponses === 0 && (
        <div className="human-card" style={{ padding: "40px 24px", textAlign: "center", marginBottom: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "var(--bg-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Inbox size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No responses recorded</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Share the public survey link to collect participant feedback.</p>
          </div>
        </div>
      )}

      {/* Per-Question Analytics */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Question Insights</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {questionAnalytics.map((qa, idx) => (
          <div key={qa.questionId} className="human-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Question {idx + 1}</span>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: "var(--text-main)" }}>{qa.label}</h4>
              </div>
              <span className="badge badge-indigo" style={{ fontSize: 11 }}>
                {qa.type.replace("_", " ")}
              </span>
            </div>

            {/* Text Question Responses */}
            {qa.type === "TEXT" && (
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 12 }}>
                  {qa.data?.length ?? 0} total answers
                </p>
                <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {(qa.data ?? []).slice(0, 20).map((text, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 14px",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "var(--text-main)",
                        lineHeight: 1.4,
                      }}
                    >
                      {text}
                    </div>
                  ))}
                  {(qa.data?.length ?? 0) > 20 && (
                    <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
                      + {(qa.data?.length ?? 0) - 20} additional responses
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rating Question Responses */}
            {qa.type === "RATING" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
                  <div style={{ textAlign: "center", padding: "12px 20px", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 10 }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-main)" }}>{qa.average ?? 0}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Average / 5</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4, color: "#f59e0b" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={20} fill={star <= Math.round(qa.average ?? 0) ? "#f59e0b" : "none"} />
                      ))}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{qa.total} ratings collected</div>
                  </div>
                </div>
                {qa.distribution && (
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={qa.distribution} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="rating" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} tickFormatter={(v) => `${v} Star`} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#f4f4f5", fontSize: 13 }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Responses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* Multiple Choice / Checkbox Responses */}
            {(qa.type === "MULTIPLE_CHOICE" || qa.type === "CHECKBOX") && qa.options && (
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 12 }}>
                  {qa.total} participant answers
                </p>
                <ResponsiveContainer width="100%" height={Math.max(130, (qa.options.length * 38))}>
                  <BarChart data={qa.options} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="option" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} width={130} />
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#f4f4f5", fontSize: 13 }} />
                    <Bar dataKey="count" name="Responses" radius={[0, 4, 4, 0]}>
                      {qa.options.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
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
