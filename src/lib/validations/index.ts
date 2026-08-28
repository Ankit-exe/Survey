import { z } from "zod";

// ─── Question Types ──────────────────────────────────────────────────────────

export const QuestionTypeSchema = z.enum([
  "TEXT",
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "RATING",
]);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// ─── Conditional Logic ───────────────────────────────────────────────────────

export const ConditionalRuleSchema = z.object({
  dependsOnId: z.string().min(1),
  operator: z.enum(["equals", "not_equals", "contains"]),
  value: z.string(),
});

export type ConditionalRule = z.infer<typeof ConditionalRuleSchema>;

// ─── Question Schema ─────────────────────────────────────────────────────────

export const QuestionSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().min(0),
  type: QuestionTypeSchema,
  label: z.string().min(1, "Question label is required"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional().nullable(),
  conditions: z.array(ConditionalRuleSchema).optional().nullable(),
});

export type Question = z.infer<typeof QuestionSchema>;

// ─── Survey Schema ───────────────────────────────────────────────────────────

export const CreateSurveySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  questions: z.array(QuestionSchema).min(1, "At least one question required"),
});

export const UpdateSurveySchema = CreateSurveySchema.extend({
  isPublished: z.boolean().optional(),
});

export type CreateSurveyInput = z.infer<typeof CreateSurveySchema>;
export type UpdateSurveyInput = z.infer<typeof UpdateSurveySchema>;

// ─── Response Schema ─────────────────────────────────────────────────────────

export const SubmitResponseSchema = z.object({
  surveyId: z.string().min(1),
  answers: z.record(
    z.string(),
    z.union([z.string(), z.array(z.string()), z.number()])
  ),
  partial: z.boolean().optional().default(false),
  sessionId: z.string().optional(),
});

export type SubmitResponseInput = z.infer<typeof SubmitResponseSchema>;

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(1, "Name is required").max(100),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
