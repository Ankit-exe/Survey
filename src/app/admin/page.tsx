import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { formatDate, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  const surveys = await prisma.survey.findMany({
    where: { createdById: session!.user!.id },
    include: { _count: { select: { responses: true, questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalResponses = surveys.reduce((sum, s) => sum + s._count.responses, 0);
  const publishedCount = surveys.filter((s) => s.isPublished).length;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
            Welcome back 👋
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Here&apos;s an overview of your surveys</p>
        </div>
        <Link href="/admin/surveys/new" className="btn-primary">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Survey
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Surveys", value: surveys.length, icon: "📋", color: "var(--accent)" },
          { label: "Published", value: publishedCount, icon: "🟢", color: "var(--success)" },
          { label: "Total Responses", value: totalResponses, icon: "📊", color: "var(--warning)" },
          { label: "Draft", value: surveys.length - publishedCount, icon: "📝", color: "var(--text-muted)" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: "'Outfit', sans-serif" }}>
              {stat.value}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Surveys List */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Surveys</h2>
        {surveys.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: 48, textAlign: "center" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗒️</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>No surveys yet. Create your first one!</p>
            <Link href="/admin/surveys/new" className="btn-primary">
              Create Survey
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="glass-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{survey.title}</span>
                    <span className={`badge ${survey.isPublished ? "badge-success" : "badge-muted"}`}>
                      {survey.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="badge badge-purple">v{survey.version}</span>
                  </div>
                  {survey.description && (
                    <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                      {truncate(survey.description, 100)}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {survey._count.questions} questions
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {survey._count.responses} responses
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {formatDate(survey.createdAt)}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/admin/surveys/${survey.id}/edit`} className="btn-secondary" style={{ fontSize: 13, padding: "8px 14px" }}>
                    Edit
                  </Link>
                  <Link href={`/admin/surveys/${survey.id}/analytics`} className="btn-secondary" style={{ fontSize: 13, padding: "8px 14px" }}>
                    Analytics
                  </Link>
                  {survey.isPublished && (
                    <a href={`/s/${survey.slug}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
