import fs from 'fs';
import path from 'path';
import { VisualsLLMOutputSchema } from '@slidewright/shared';
import { callLLM, generateImage } from '../llm/openrouter';

export interface VisualsInput {
  deckId: string;
  mockMode: boolean;
}

const SYSTEM_PROMPT = `You are an expert presentation visuals strategist.
Output a valid JSON object matching the requested schema.
Your goal is to propose diagrams and images for slides that need them.
Rules:
1. Only propose visuals for slides that are "diagram" or "image_split" layouts.
2. For diagrams, pick a type (flow, cycle, timeline, hierarchy, matrix_2x2, venn, layers, funnel) and define up to 7 nodes. Nodes should have a concise label (max 3 words) and an optional lucide-react icon.
3. For images, provide a detailed DALL-E style prompt combining the slide context and the deck's overall image style.`;

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

export async function runVisuals(input: VisualsInput): Promise<any> {
  const deckPath = path.resolve(process.cwd(), `../outputs/decks/${input.deckId}.json`);
  let deck: any;
  
  if (fs.existsSync(deckPath)) {
    deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
  } else {
    // For evals the path might be different based on where the script runs
    const altDeckPath = path.resolve(process.cwd(), `outputs/decks/${input.deckId}.json`);
    if (fs.existsSync(altDeckPath)) {
      deck = JSON.parse(fs.readFileSync(altDeckPath, 'utf8'));
    } else {
      throw new Error(`Deck not found: ${input.deckId}`);
    }
  }

  const slidesNeedingVisuals = deck.slides.filter((s: any) => s.layout === 'diagram' || s.layout === 'image_split');
  if (slidesNeedingVisuals.length === 0) {
    return deck; // No visuals needed
  }

  const userPrompt = `Deck Topic: ${deck.title}
Global Image Style: ${deck.design?.imageStyle || 'professional'}

Slides needing visuals:
${JSON.stringify(slidesNeedingVisuals.map((s: any) => ({ slideId: s.id, layout: s.layout, title: s.title, body: s.body })), null, 2)}

Generate the visuals spec in JSON format matching this schema:
{
  "slides": [
    {
      "slideId": string,
      "diagram": { "type": string, "nodes": [...], "caption": string, "altText": string }, // Only for layout: diagram
      "image": { "useImage": true, "prompt": string, "alt": string } // Only for layout: image_split
    }
  ]
}
`;

  const model = process.env.MODEL_TEXT || 'openai/gpt-4o-mini';
  const imageModel = process.env.MODEL_IMAGE || 'openai/dall-e-3';
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Visuals] Attempt ${attempt}/${MAX_RETRIES} to generate visuals...`);
      const responseText = await callLLM({
        model,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: userPrompt,
        mockMode: input.mockMode,
        temperature: 0.7
      });

      const jsonString = extractJSON(responseText);
      const parsed = JSON.parse(jsonString);
      const validated = VisualsLLMOutputSchema.parse(parsed);

      // Apply the generated visuals to the deck and generate images
      for (const spec of validated.slides) {
        const slide = deck.slides.find((s: any) => s.id === spec.slideId);
        if (slide) {
          if (spec.diagram && slide.layout === 'diagram') {
            slide.diagram = spec.diagram;
          }
          if (spec.image && slide.layout === 'image_split') {
            slide.imageSpec = spec.image;
            // Generate actual image URL
            if (spec.image.prompt) {
               const imageUrl = await generateImage(spec.image.prompt, imageModel, input.mockMode);
               slide.data = slide.data || {};
               slide.data.imageUrl = imageUrl;
            }
          }
        }
      }

      return deck;

    } catch (err: any) {
      console.error(`[Visuals] Attempt ${attempt} failed: ${err.message}`);
      lastError = err;
      
      if (err.message.includes('429')) {
        console.log('[Visuals] Rate limited! Backing off for 5 seconds...');
        await sleep(5000 * attempt);
      } else {
        await sleep(1000 * attempt);
      }
    }
  }

  throw new Error(`Visuals failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
}
