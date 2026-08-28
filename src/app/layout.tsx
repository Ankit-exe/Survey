import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SurveyFlow — Dynamic Survey Platform",
    template: "%s | SurveyFlow",
  },
  description:
    "Create beautiful, dynamic surveys with conditional logic, multiple question types, and powerful analytics. Built for teams who need real insights.",
  keywords: ["survey", "forms", "analytics", "feedback", "questionnaire"],
  authors: [{ name: "SurveyFlow" }],
  openGraph: {
    title: "SurveyFlow — Dynamic Survey Platform",
    description: "Create beautiful surveys with real-time analytics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
