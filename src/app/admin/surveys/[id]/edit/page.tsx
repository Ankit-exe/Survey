import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import SurveyBuilderClient from "@/components/survey-builder/SurveyBuilderClient";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit Survey" };

export default async function EditSurveyPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const survey = await prisma.survey.findFirst({
    where: { id, createdById: session!.user!.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey) notFound();

  return <SurveyBuilderClient initialSurvey={survey} />;
}
