import { WriterOutput, WriterOutputSchema, LAYOUT_CATALOG } from '@slidewright/shared';
import { callLLM } from '../llm/openrouter';
import { validateDeck } from './validator';

export interface WriterInput {
  topic: string;
  audience: string;
  language: string;
  tone: string;
  slides: number;
  mockMode: boolean;
}

const SYSTEM_PROMPT = `You are an expert presentation writer.
You must output a strictly valid JSON object matching the requested schema.
Your goal is to write a highly structured, professional slide deck about a given topic.
Rules:
1. Output MUST be an object with a "slides" array.
2. The "slides" array MUST have exactly the requested number of slides.
3. The first slide MUST have layout "cover" and the last slide MUST have layout "closing".
4. There MUST be exactly one dark slide in the middle of the deck (e.g. layout "big_number_dark" or "key_answer").
5. Do NOT use the same layout twice in a row.
6. Make sure to use at least 6 distinct layouts to keep the presentation engaging.
7. Fill all "data" properties with high quality, audience-appropriate content in the requested language.
8. Only use standard lucide-react icon names like "CheckCircle", "ArrowRight", "Zap", "Globe", "Lightbulb", "Rocket".
9. Never exceed the maximum allowed items in arrays (e.g. cards, rows, events) for the specific layout chosen.
`;

const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function extractJSON(text: string): string {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match) return match[1];
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end >= start) {
    return text.substring(start, end + 1);
  }
  return text;
}

export async function runWriter(input: WriterInput): Promise<WriterOutput> {
  const userPrompt = `Topic: ${input.topic}
Audience: ${input.audience}
Language: ${input.language}
Tone: ${input.tone}
Slide Count: ${input.slides}

Available Layouts and Rules:
${Object.entries(LAYOUT_CATALOG).map(([name, cat]) => `- ${name}: theme=${cat.theme}, slots=${JSON.stringify(cat.maxSlots)}`).join('\n')}

Generate the presentation in JSON format matching this schema:
{
  "slides": [
    {
      "layout": "layout_name",
      "data": { ... }
    }
  ]
}
`;

  const model = process.env.MODEL_TEXT || 'openai/gpt-4o-mini';
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Writer] Attempt ${attempt}/${MAX_RETRIES} to generate slides...`);
      const responseText = await callLLM({
        model,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: attempt > 1 ? `${userPrompt}\n\nWARNING: Previous attempt failed validation. Pay strict attention to the rhythm and layout variety rules.` : userPrompt,
        mockMode: input.mockMode,
        temperature: 0.7
      });

      const jsonString = extractJSON(responseText);
      const parsed = JSON.parse(jsonString);
      const validated = WriterOutputSchema.parse(parsed);
      
      const violations = validateDeck(validated);
      if (violations.length > 0) {
        throw new Error(`Validation Violations: ${violations.map(v => v.message).join(' | ')}`);
      }

      return validated;

    } catch (err: any) {
      console.error(`[Writer] Attempt ${attempt} failed: ${err.message}`);
      lastError = err;
      
      if (err.message.includes('429')) {
        console.log('[Writer] Rate limited! Backing off for 5 seconds...');
        await sleep(5000 * attempt);
      } else {
        await sleep(1000 * attempt);
      }
    }
  }

  throw new Error(`Writer failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
}
