import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import AnalyticsDashboardClient from "@/components/analytics/AnalyticsDashboardClient";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const { prisma } = await import("@/lib/prisma");
  const { average } = await import("@/lib/utils");

  const survey = await prisma.survey.findFirst({
    where: { id, createdById: session!.user!.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey) notFound();

  const responses = await prisma.response.findMany({
    where: { surveyId: id, partial: false },
    orderBy: { submittedAt: "desc" },
  });

  const totalResponses = responses.length;

  const questionAnalytics = survey.questions.map((question) => {
    const answers = responses
      .map((r) => (r.answers as Record<string, unknown>)[question.id])
      .filter((a) => a !== undefined && a !== null && a !== "");

    if (question.type === "TEXT") {
      return { questionId: question.id, label: question.label, type: question.type, data: answers.map((a) => String(a)) };
    }
    if (question.type === "RATING") {
      const nums = answers.map((a) => Number(a)).filter((n) => !isNaN(n));
      const avg = average(nums);
      const distribution = [1, 2, 3, 4, 5].map((r) => ({ rating: r, count: nums.filter((n) => n === r).length }));
      return { questionId: question.id, label: question.label, type: question.type, average: Math.round(avg * 10) / 10, distribution, total: nums.length };
    }
    const options = (question.options as string[]) ?? [];
    const counts: Record<string, number> = {};
    options.forEach((opt) => (counts[opt] = 0));
    for (const answer of answers) {
      const vals = Array.isArray(answer) ? answer : [String(answer)];
      for (const val of vals) { counts[val] = (counts[val] ?? 0) + 1; }
    }
    return { questionId: question.id, label: question.label, type: question.type, options: options.map((opt) => ({ option: opt, count: counts[opt] ?? 0 })), total: answers.length };
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const responsesByDay: Record<string, number> = {};
  for (const r of responses.filter((r) => r.submittedAt >= thirtyDaysAgo)) {
    const day = r.submittedAt.toISOString().split("T")[0];
    responsesByDay[day] = (responsesByDay[day] ?? 0) + 1;
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Link href="/admin" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{survey.title}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <span className={`badge ${survey.isPublished ? "badge-success" : "badge-muted"}`}>{survey.isPublished ? "Published" : "Draft"}</span>
            <span className="badge badge-purple">v{survey.version}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/admin/surveys/${id}/edit`} className="btn-secondary" style={{ fontSize: 13 }}>Edit Survey</Link>
          {survey.isPublished && (
            <a href={`/s/${survey.slug}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: 13 }}>
              View Survey ↗
            </a>
          )}
        </div>
      </div>

      <AnalyticsDashboardClient
        totalResponses={totalResponses}
        questionAnalytics={questionAnalytics}
        responsesByDay={Object.entries(responsesByDay).map(([date, count]) => ({ date, count }))}
      />
    </div>
  );
}
