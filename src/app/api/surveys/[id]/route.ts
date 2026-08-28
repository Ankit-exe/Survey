import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { UpdateSurveySchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/surveys/[id]
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const survey = await prisma.survey.findFirst({
    where: { id, createdById: session.user.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(survey);
}

// PUT /api/surveys/[id]
export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSurveySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.survey.findFirst({ where: { id, createdById: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, description, questions, isPublished } = parsed.data;

  // Delete existing questions and re-create (clean approach)
  await prisma.question.deleteMany({ where: { surveyId: id } });

  const survey = await prisma.survey.update({
    where: { id },
    data: {
      title,
      description,
      isPublished: isPublished ?? existing.isPublished,
      version: { increment: 1 },
      questions: {
        create: questions.map((q, i) => ({
          order: q.order ?? i,
          type: q.type,
          label: q.label,
          required: q.required ?? false,
          options: q.options ?? Prisma.JsonNull,
          conditions: (q.conditions ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(survey);
}

// DELETE /api/surveys/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.survey.findFirst({ where: { id, createdById: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.survey.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
