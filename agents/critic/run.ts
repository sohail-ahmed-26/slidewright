import { callLLM } from '../llm/openrouter';
import { criticSystemPrompt } from './prompt';
import { CriticLLMOutputSchema, CriticLLMOutput } from '@slidewright/shared';
import fs from 'fs';
import path from 'path';

export interface CriticOptions {
  deckId: string;
  mockMode?: boolean;
}

export async function runCritic(options: CriticOptions): Promise<CriticLLMOutput> {
  const deckPath = path.resolve(process.cwd(), `outputs/decks/${options.deckId}.json`);
  if (!fs.existsSync(deckPath)) {
    throw new Error(`Deck not found: ${deckPath}`);
  }
  
  const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));

  const userPrompt = `Please critique the following presentation draft:
  
Deck Title: ${deck.title}
Deck Audience: ${deck.audience || 'General'}
Tone: ${deck.tone || 'Professional'}

Design Settings:
${JSON.stringify(deck.design, null, 2)}

Slides:
${JSON.stringify(deck.slides.map((s: any) => ({
  id: s.id,
  layout: s.layout,
  title: s.title,
  body: s.body,
  visuals: s.diagram ? s.diagram : (s.image ? s.image : 'None')
})), null, 2)}`;

  let jsonStr = '';
  
  if (options.mockMode) {
    jsonStr = JSON.stringify({
      score: 6,
      feedback: "The layout is generally good, but some text is too dense.",
      issues: [
        {
          slideId: deck.slides[0]?.id || "s1",
          type: "content",
          severity: "medium",
          message: "Too much text on the first slide.",
          suggestedFix: "Shorten the body text to bullet points."
        }
      ],
      approved: false
    });
  } else {
    jsonStr = await callLLM({
      model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
      systemPrompt: criticSystemPrompt,
      userPrompt,
      mockMode: false
    });
  }

  try {
    const raw = JSON.parse(jsonStr);
    const parsed = CriticLLMOutputSchema.parse(raw);
    return parsed;
  } catch (err: any) {
    console.error(`[Critic] Validation failed:`, err);
    throw new Error(`Critic output validation failed: ${err.message}`);
  }
}
