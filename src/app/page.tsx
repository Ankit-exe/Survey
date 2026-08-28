import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, transparent 60%), var(--bg-primary)",
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: "var(--gradient-primary)",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 40px var(--accent-glow)",
          }}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="white" strokeWidth="2"/>
            <path d="M9 12h6M9 16h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="gradient-text" style={{ fontSize: 48, fontWeight: 800, marginBottom: 8 }}>
          SurveyFlow
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 480 }}>
          Build beautiful surveys with conditional logic, multiple question types, and real-time analytics.
        </p>
      </div>

      {/* CTA Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/admin" className="btn-primary" style={{ fontSize: 16, padding: "12px 28px" }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Admin Panel
        </Link>
        <Link href="/admin/register" className="btn-secondary" style={{ fontSize: 16, padding: "12px 28px" }}>
          Get Started
        </Link>
      </div>

      {/* Features */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 64,
          maxWidth: 900,
          width: "100%",
        }}
      >
        {[
          { icon: "🎯", title: "4 Question Types", desc: "Text, Multiple Choice, Checkbox, Rating" },
          { icon: "⚡", title: "Conditional Logic", desc: "Show questions based on previous answers" },
          { icon: "📊", title: "Analytics Dashboard", desc: "Charts, averages, and response trends" },
          { icon: "🔒", title: "Secure by Default", desc: "JWT auth, rate limiting, IP hashing" },
        ].map((feature) => (
          <div key={feature.title} className="glass-card" style={{ padding: 24, textAlign: "left" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{feature.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{feature.title}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
