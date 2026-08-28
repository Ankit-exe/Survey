import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreateSurveySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";

// GET /api/surveys — list all surveys (admin only)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const surveys = await prisma.survey.findMany({
    where: { createdById: session.user.id },
    include: {
      _count: { select: { responses: true, questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(surveys);
}

// POST /api/surveys — create a new survey
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateSurveySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, questions } = parsed.data;
  const slug = generateSlug();

  const survey = await prisma.survey.create({
    data: {
      title,
      description,
      slug,
      createdById: session.user.id,
      questions: {
        create: questions.map((q, i) => ({
          order: q.order ?? i,
          type: q.type,
          label: q.label,
          required: q.required ?? false,
          options: q.options ?? null,
          conditions: q.conditions ?? null,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(survey, { status: 201 });
}
