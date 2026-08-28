import type { Metadata } from "next";
import SurveyBuilderClient from "@/components/survey-builder/SurveyBuilderClient";

export const metadata: Metadata = { title: "New Survey" };

export default function NewSurveyPage() {
  return <SurveyBuilderClient />;
}
