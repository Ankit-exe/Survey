import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { formatDate, truncate } from "@/lib/utils";
import {
  Plus,
  FileText,
  CheckCircle2,
  BarChart3,
  Edit3,
  ExternalLink,
  HelpCircle,
  Users,
  FolderOpen,
} from "lucide-react";

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
    <div className="animate-fade-in" style={{ maxWidth: 1040, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
            Dashboard Overview
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Manage your active surveys and monitor response metrics</p>
        </div>
        <Link href="/admin/surveys/new" className="btn-primary">
          <Plus size={16} />
          Create Survey
        </Link>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
        {[
          { label: "Total Surveys", value: surveys.length, icon: <FileText size={18} color="var(--accent-light)" /> },
          { label: "Published", value: publishedCount, icon: <CheckCircle2 size={18} color="var(--status-success)" /> },
          { label: "Total Responses", value: totalResponses, icon: <Users size={18} color="var(--status-warning)" /> },
          { label: "Drafts", value: surveys.length - publishedCount, icon: <HelpCircle size={18} color="var(--text-muted)" /> },
        ].map((stat) => (
          <div key={stat.label} className="human-card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
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
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.03em" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Surveys List */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Your Surveys</h2>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{surveys.length} total</span>
        </div>

        {surveys.length === 0 ? (
          <div
            className="human-card"
            style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
          >
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
              <FolderOpen size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No surveys found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>Get started by creating your first survey.</p>
            </div>
            <Link href="/admin/surveys/new" className="btn-primary">
              <Plus size={16} />
              Create Survey
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="human-card human-card-interactive"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text-main)" }}>{survey.title}</span>
                    <span className={`badge ${survey.isPublished ? "badge-success" : "badge-neutral"}`}>
                      {survey.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="badge badge-indigo">v{survey.version}</span>
                  </div>
                  {survey.description && (
                    <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>
                      {truncate(survey.description, 110)}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {survey._count.questions} questions
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {survey._count.responses} responses
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      Created {formatDate(survey.createdAt)}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Link href={`/admin/surveys/${survey.id}/edit`} className="btn-secondary" style={{ fontSize: 13, padding: "7px 12px" }}>
                    <Edit3 size={14} />
                    Edit
                  </Link>
                  <Link href={`/admin/surveys/${survey.id}/analytics`} className="btn-secondary" style={{ fontSize: 13, padding: "7px 12px" }}>
                    <BarChart3 size={14} />
                    Analytics
                  </Link>
                  {survey.isPublished && (
                    <a href={`/s/${survey.slug}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 13, padding: "7px 10px" }} title="View Public Form">
                      <ExternalLink size={15} />
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
