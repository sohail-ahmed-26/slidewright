import { z } from 'zod';

export const CriticIssueSchema = z.object({
  slideId: z.string().optional(),
  type: z.enum(['content', 'design', 'visual', 'layout', 'global']),
  severity: z.enum(['high', 'medium', 'low']),
  message: z.string(),
  suggestedFix: z.string().optional(),
});

export const CriticLLMOutputSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  criterionScores: z.record(z.string(), z.number()).optional(),
  issues: z.array(CriticIssueSchema).default([]),
  approved: z.boolean().optional(),
});

export type CriticLLMOutput = z.infer<typeof CriticLLMOutputSchema>;
