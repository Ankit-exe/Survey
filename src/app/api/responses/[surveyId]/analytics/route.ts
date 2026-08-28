import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { average } from "@/lib/utils";

type Params = { params: Promise<{ surveyId: string }> };

// GET /api/responses/[surveyId]/analytics
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { surveyId } = await params;

  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, createdById: session.user.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const responses = await prisma.response.findMany({
    where: { surveyId, partial: false },
    orderBy: { submittedAt: "desc" },
  });

  const totalResponses = responses.length;

  // Per-question analytics
  const questionAnalytics = survey.questions.map((question) => {
    const answers = responses
      .map((r) => (r.answers as Record<string, unknown>)[question.id])
      .filter((a) => a !== undefined && a !== null && a !== "");

    if (question.type === "TEXT") {
      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        data: answers.map((a) => String(a)),
      };
    }

    if (question.type === "RATING") {
      const nums = answers.map((a) => Number(a)).filter((n) => !isNaN(n));
      const avg = average(nums);
      const distribution = [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: nums.filter((n) => n === rating).length,
      }));
      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        average: Math.round(avg * 10) / 10,
        distribution,
        total: nums.length,
      };
    }

    if (question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOX") {
      const options = (question.options as string[]) ?? [];
      const counts: Record<string, number> = {};
      options.forEach((opt) => (counts[opt] = 0));

      for (const answer of answers) {
        const vals = Array.isArray(answer) ? answer : [String(answer)];
        for (const val of vals) {
          counts[val] = (counts[val] ?? 0) + 1;
        }
      }

      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        options: options.map((opt) => ({ option: opt, count: counts[opt] ?? 0 })),
        total: answers.length,
      };
    }

    return { questionId: question.id, label: question.label, type: question.type, data: [] };
  });

  // Responses over time (by day, last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentResponses = responses.filter((r) => r.submittedAt >= thirtyDaysAgo);
  const responsesByDay: Record<string, number> = {};
  for (const r of recentResponses) {
    const day = r.submittedAt.toISOString().split("T")[0];
    responsesByDay[day] = (responsesByDay[day] ?? 0) + 1;
  }

  return NextResponse.json({
    totalResponses,
    survey: { title: survey.title, slug: survey.slug, version: survey.version },
    questionAnalytics,
    responsesByDay: Object.entries(responsesByDay).map(([date, count]) => ({ date, count })),
  });
}
