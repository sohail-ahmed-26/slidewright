import { z } from 'zod';

export const WriterSlideSchema = z.object({
  layout: z.string(),
  data: z.any()
});

export const WriterOutputSchema = z.object({
  slides: z.array(WriterSlideSchema)
});

export type WriterOutput = z.infer<typeof WriterOutputSchema>;
