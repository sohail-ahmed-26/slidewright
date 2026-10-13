import { callLLM } from '../llm/openrouter';
import { getCriticSystemPrompt } from './prompt';
import { CriticLLMOutputSchema, CriticLLMOutput } from '@slidewright/shared';
import fs from 'fs';
import path from 'path';

export interface CriticOptions {
  deckId: string;
  customPrompt?: string;
  mockMode?: boolean;
}

export async function runCritic(options: CriticOptions): Promise<CriticLLMOutput> {
  const rootDir = process.cwd().endsWith('backend') ? path.join(process.cwd(), '..') : process.cwd();
  const deckPath = path.resolve(rootDir, `outputs/decks/${options.deckId}.json`);
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

  const systemPrompt = getCriticSystemPrompt(options.customPrompt);
  let jsonStr = '';
  
  if (options.mockMode) {
    jsonStr = JSON.stringify({
      score: 85,
      feedback: "The layout and structure are solid with good pacing and professional themes.",
      criterionScores: {
        contentQuality: 18,
        layoutComposition: 17,
        visualAssets: 13,
        typographyReadability: 13,
        colorDesignConsistency: 8,
        structureStorytelling: 8,
        professionalPolish: 8
      },
      issues: [],
      approved: true
    });
  } else {
    jsonStr = await callLLM({
      model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
      systemPrompt,
      userPrompt,
      mockMode: false
    });
  }

  try {
    const raw = JSON.parse(jsonStr);
    if (raw.approved === undefined && typeof raw.score === 'number') {
      const score = raw.score <= 10 ? raw.score * 10 : raw.score;
      raw.approved = score >= 80 && !(raw.issues || []).some((i: any) => i.severity === 'high');
    }
    const parsed = CriticLLMOutputSchema.parse(raw);
    return parsed;
  } catch (err: any) {
    console.error(`[Critic] Validation failed:`, err);
    throw new Error(`Critic output validation failed: ${err.message}`);
  }
}

