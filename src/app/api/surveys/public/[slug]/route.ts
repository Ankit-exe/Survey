import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET /api/surveys/public/[slug] — public survey form data (no auth)
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  if (!survey.isPublished) return NextResponse.json({ error: "Survey not available" }, { status: 403 });

  // Strip internal fields
  return NextResponse.json({
    id: survey.id,
    title: survey.title,
    description: survey.description,
    questions: survey.questions,
  });
}
