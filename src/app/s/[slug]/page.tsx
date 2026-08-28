import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SurveyFormClient from "@/components/survey-form/SurveyFormClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surveys/public/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return { title: "Survey Not Found" };
    const survey = await res.json();
    return {
      title: survey.title,
      description: survey.description ?? "Complete this survey",
    };
  } catch {
    return { title: "Survey" };
  }
}

export default async function PublicSurveyPage({ params }: Props) {
  const { slug } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/surveys/public/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404 || res.status === 403) notFound();
  if (!res.ok) notFound();

  const survey = await res.json();
  return <SurveyFormClient survey={survey} />;
}
