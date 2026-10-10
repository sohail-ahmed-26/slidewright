import { z } from 'zod';

export const CriticIssueSchema = z.object({
  slideId: z.string().optional(),
  type: z.enum(['content', 'design', 'visual', 'layout', 'global']),
  severity: z.enum(['high', 'medium', 'low']),
  message: z.string(),
  suggestedFix: z.string().optional(),
});

export const CriticLLMOutputSchema = z.object({
  score: z.number().min(0).max(10),
  feedback: z.string(),
  issues: z.array(CriticIssueSchema),
  approved: z.boolean(),
});

export type CriticLLMOutput = z.infer<typeof CriticLLMOutputSchema>;
