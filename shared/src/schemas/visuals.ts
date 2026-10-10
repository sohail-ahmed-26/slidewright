import { z } from 'zod';

export const DiagramNodeSchema = z.object({
  id: z.string(),
  label: z.string().max(30), // Max 3 words constraint enforced loosely by length or by LLM instructions
  icon: z.string().optional(),
  highlight: z.boolean().optional(),
  // For hierarchy parent
  parentId: z.string().optional(),
  // For matrix
  quadrant: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional()
});

export const DiagramSpecSchema = z.object({
  type: z.enum(['flow', 'cycle', 'timeline', 'hierarchy', 'matrix_2x2', 'venn', 'layers', 'funnel']),
  nodes: z.array(DiagramNodeSchema).max(7),
  caption: z.string().optional(),
  altText: z.string()
});

export type DiagramSpec = z.infer<typeof DiagramSpecSchema>;

export const ImageSpecSchema = z.object({
  useImage: z.boolean(),
  prompt: z.string().optional(),
  fallback: z.enum(['icon_composition', 'none']).optional(),
  alt: z.string().optional(),
  placement: z.string().optional(),
  focalPoint: z.string().optional()
});

export type ImageSpec = z.infer<typeof ImageSpecSchema>;

export const VisualsLLMOutputSchema = z.object({
  slides: z.array(z.object({
    slideId: z.string(), // ID of the slide
    diagram: DiagramSpecSchema.nullish(),
    image: ImageSpecSchema.nullish()
  }))
});

export type VisualsLLMOutput = z.infer<typeof VisualsLLMOutputSchema>;
