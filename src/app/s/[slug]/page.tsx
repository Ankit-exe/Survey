import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SurveyFormClient from "@/components/survey-form/SurveyFormClient";
import { prisma } from "@/lib/prisma";
import type { ConditionalRule } from "@/lib/validations";

type Props = { params: Promise<{ slug: string }> };

async function getPublicSurvey(slug: string) {
  try {
    const survey = await prisma.survey.findUnique({
      where: { slug },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });

    if (!survey || !survey.isPublished) return null;

    return {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions.map((q) => ({
        id: q.id,
        order: q.order,
        type: q.type as "TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "RATING",
        label: q.label,
        required: q.required,
        options: (q.options as string[]) ?? null,
        conditions: (q.conditions as ConditionalRule[]) ?? null,
      })),
    };
  } catch (error) {
    console.error("Error fetching public survey:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const survey = await getPublicSurvey(slug);
  if (!survey) return { title: "Survey Not Found" };

  return {
    title: survey.title,
    description: survey.description ?? "Complete this survey",
  };
}

export default async function PublicSurveyPage({ params }: Props) {
  const { slug } = await params;
  const survey = await getPublicSurvey(slug);

  if (!survey) notFound();

  return <SurveyFormClient survey={survey} />;
}

