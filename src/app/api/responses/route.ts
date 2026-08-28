import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubmitResponseSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/utils";
import { headers } from "next/headers";

// POST /api/responses — submit a survey response
export async function POST(request: Request) {
  // Rate limiting
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const ipHash = hashIp(ip);
  const body = await request.json();
  const rateLimitKey = `${ipHash}:${body.surveyId}`;
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  const parsed = SubmitResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { surveyId, answers, partial, sessionId } = parsed.data;

  // Verify survey exists and is published (unless partial save)
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true },
  });

  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  if (!survey.isPublished && !partial) {
    return NextResponse.json({ error: "Survey is not accepting responses" }, { status: 403 });
  }

  // Validate required questions
  if (!partial) {
    const requiredQuestions = survey.questions.filter((q) => q.required);
    for (const q of requiredQuestions) {
      const answer = answers[q.id];
      if (answer === undefined || answer === null || answer === "" ||
        (Array.isArray(answer) && answer.length === 0)) {
        return NextResponse.json(
          { error: `Question "${q.label}" is required` },
          { status: 400 }
        );
      }
    }
  }

  const response = await prisma.response.create({
    data: {
      surveyId,
      answers,
      partial: partial ?? false,
      sessionId,
      ipHash,
    },
  });

  return NextResponse.json(
    { id: response.id, success: true },
    { headers: { "X-RateLimit-Remaining": String(remaining) } }
  );
}
