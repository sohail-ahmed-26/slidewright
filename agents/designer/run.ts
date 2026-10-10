import { DesignerOutput, DesignerLLMOutputSchema } from '@slidewright/shared';
import { callLLM } from '../llm/openrouter';

export interface DesignerInput {
  topic: string;
  audience: string;
  tone: string;
  mockMode: boolean;
}

const SYSTEM_PROMPT = `You are an expert presentation designer.
Output a valid JSON object matching the requested schema.
Your goal is to pick a color palette, font pairing, and visual style that perfectly matches the presentation topic.
Rules:
1. hue must be a number between 0 and 360 representing the primary color hue.
2. fontHeading and fontBody should be standard Google Fonts (e.g., 'Inter', 'Playfair Display', 'Roboto', 'Outfit').
3. imageStyle should be a descriptive prompt for the DALL-E image generator (e.g., 'minimalist vector illustration', 'photorealistic corporate photography').
4. Always provide a rationale for your choices.`;

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

export async function runDesigner(input: DesignerInput): Promise<DesignerOutput> {
  const userPrompt = `Topic: ${input.topic}\nAudience: ${input.audience}\nTone: ${input.tone}

Generate the design settings in JSON format matching this schema:
{
  "hue": number (0-360),
  "accentHue": number | null,
  "fontHeading": string,
  "fontBody": string,
  "radius": "8" | "16" | "24" | "pill",
  "shadow": "soft" | "crisp" | "none",
  "cardStyle": "tinted" | "outlined",
  "iconShape": "circle" | "rounded-square",
  "motif": "none" | "dots" | "thin-grid" | "soft-shapes" | "big-outline-number",
  "imageStyle": string,
  "moodName": string,
  "rationale": string
}
`;

  const model = process.env.MODEL_TEXT || 'openai/gpt-4o-mini';
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Designer] Attempt ${attempt}/${MAX_RETRIES} to generate design...`);
      const responseText = await callLLM({
        model,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: userPrompt,
        mockMode: input.mockMode,
        temperature: 0.8
      });

      const jsonString = extractJSON(responseText);
      const parsed = JSON.parse(jsonString);
      const validated = DesignerLLMOutputSchema.parse(parsed);

      // Generate CSS variables for the chosen hue (basic HSL math)
      const h = validated.hue;
      const theme = {
        primary: `${h} 100% 45%`,
        primaryForeground: `${h} 100% 95%`,
        muted: `${h} 20% 96%`,
        mutedForeground: `${h} 20% 40%`,
        accent: validated.accentHue !== null ? `${validated.accentHue} 100% 50%` : undefined,
        accentForeground: validated.accentHue !== null ? `${validated.accentHue} 100% 10%` : undefined
      };

      return {
        ...validated,
        theme
      };

    } catch (err: any) {
      console.error(`[Designer] Attempt ${attempt} failed: ${err.message}`);
      lastError = err;
      
      if (err.message.includes('429')) {
        console.log('[Designer] Rate limited! Backing off for 5 seconds...');
        await sleep(5000 * attempt);
      } else {
        await sleep(1000 * attempt);
      }
    }
  }

  throw new Error(`Designer failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
}
