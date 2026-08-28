import Link from "next/link";
import {
  FormInput,
  GitMerge,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.07) 0%, transparent 50%), var(--bg-main)",
        textAlign: "center",
      }}
    >
      {/* Top Tagline */}
      <div
        className="badge badge-indigo"
        style={{ marginBottom: 20, padding: "6px 14px", fontSize: 13, gap: 6 }}
      >
        <CheckCircle2 size={14} /> Modern Survey & Feedback Platform
      </div>

      {/* Main Hero Header */}
      <div style={{ maxWidth: 640, marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 16,
            color: "var(--text-main)",
          }}
        >
          Dynamic surveys built for real insights
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.6 }}>
          Create dynamic questionnaires with conditional branching logic, validate user responses in real time, and analyze detailed feedback seamlessly.
        </p>
      </div>

      {/* CTA Buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/admin" className="btn-primary" style={{ fontSize: 15, padding: "12px 24px" }}>
          <LayoutDashboard size={18} />
          Go to Admin Panel
        </Link>
        <Link href="/admin/register" className="btn-secondary" style={{ fontSize: 15, padding: "12px 24px" }}>
          Create Account
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Feature Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 64,
          maxWidth: 960,
          width: "100%",
        }}
      >
        {[
          {
            icon: <FormInput size={22} color="var(--accent-light)" />,
            title: "4 Question Types",
            desc: "Collect responses with Text fields, Single Choice, Multi-select Checkboxes, and 1–5 Ratings.",
          },
          {
            icon: <GitMerge size={22} color="var(--accent-light)" />,
            title: "Conditional Logic",
            desc: "Dynamically display or hide subsequent questions based on previous answers.",
          },
          {
            icon: <BarChart3 size={22} color="var(--accent-light)" />,
            title: "Real-time Analytics",
            desc: "Visualize response distribution with interactive bar charts, average scores, and raw entries.",
          },
          {
            icon: <ShieldCheck size={22} color="var(--accent-light)" />,
            title: "Built-in Security",
            desc: "JWT-based admin session authentication, server-side Zod validation, and rate limiting.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="human-card"
            style={{ padding: 24, textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "var(--bg-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {feature.icon}
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{feature.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
