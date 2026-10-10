import { z } from 'zod';

export const DesignerLLMOutputSchema = z.object({
  hue: z.number().min(0).max(360),
  accentHue: z.number().min(0).max(360).nullable().optional(),
  fontHeading: z.string(),
  fontBody: z.string(),
  radius: z.enum(['8', '16', '24', 'pill']),
  shadow: z.enum(['soft', 'crisp', 'none']),
  cardStyle: z.enum(['tinted', 'outlined']),
  iconShape: z.enum(['circle', 'rounded-square']),
  motif: z.enum(['none', 'dots', 'thin-grid', 'soft-shapes', 'big-outline-number']),
  imageStyle: z.string(),
  moodName: z.string(),
  rationale: z.string()
});

export type DesignerLLMOutput = z.infer<typeof DesignerLLMOutputSchema>;

export const DesignerOutputSchema = DesignerLLMOutputSchema.extend({
  theme: z.object({
    primary: z.string(),
    primaryForeground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    accent: z.string().optional(),
    accentForeground: z.string().optional()
  })
});

export type DesignerOutput = z.infer<typeof DesignerOutputSchema>;
