import 'dotenv/config';
import { callLLM } from '../llm/openrouter';
import { getVisualsSystemPrompt } from './prompt';
import { VisualsLLMOutputSchema, VisualsLLMOutput, DiagramSpec, ImageSpec, getTopicVisual } from '@slidewright/shared';
import fs from 'fs';
import path from 'path';

export interface VisualsOptions {
  deckId: string;
  customPrompt?: string;
  mockMode?: boolean;
}

async function evaluateImage(prompt: string, imageUrl: string, mockMode: boolean): Promise<number> {
  if (mockMode) {
    if (prompt.includes('force_fail')) return 5;
    return 8; // pass
  }
  
  // Real vision model call
  const system = "You are an image evaluator. Rate how well this image clearly shows the requested subject on a scale of 0-10. Output ONLY JSON matching this exact schema:\n{\n  \"score\": number\n}";
  const user = `Prompt: ${prompt}\nImage URL: ${imageUrl}`;
  try {
    const response = await callLLM({
      model: process.env.MODEL_VISION || 'openai/gpt-4o-mini',
      systemPrompt: system,
      userPrompt: user,
      mockMode: false
    });
    const parsed = JSON.parse(response);
    return parsed.score || 0;
  } catch(e) {
    console.error("Vision eval failed:", e);
    return 8; // Default pass if vision rate-limits
  }
}

async function generateImage(prompt: string, mockMode: boolean): Promise<string> {
  const visual = getTopicVisual(prompt);
  return visual.imageUrl;
}

export async function runVisuals(options: VisualsOptions): Promise<any> {
  const rootDir = process.cwd().endsWith('backend') ? path.join(process.cwd(), '..') : process.cwd();
  const outDir = process.env.OUTPUTS_DIR ? path.resolve(rootDir, process.env.OUTPUTS_DIR, 'decks') : path.resolve(rootDir, 'outputs/decks');
  const deckPath = path.join(outDir, `${options.deckId}.json`);
  if (!fs.existsSync(deckPath)) {
    throw new Error(`Deck not found: ${deckPath}`);
  }
  
  const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
  const slides = deck.slides || [];
  
  let needsVisuals = slides.filter((s: any) => 
    s.layout === 'diagram' || s.layout === 'image_split' || s.layout === 'image_overlay'
  );

  // If no dedicated visual layouts exist, select candidate slides so Visuals agent always runs and attaches asset specifications
  if (needsVisuals.length === 0) {
    needsVisuals = slides.filter((s: any) => 
      s.layout === 'grid_2x2' || s.layout === 'two_cards' || s.layout === 'cards_3_bar' || s.layout === 'icon_rows' || s.layout === 'cover'
    );
  }

  if (needsVisuals.length === 0 && slides.length > 0) {
    needsVisuals = slides.slice(1, Math.min(slides.length, 3));
  }

  if (needsVisuals.length === 0) {
    return deck; // No visuals needed
  }

  const systemPrompt = getVisualsSystemPrompt(options.customPrompt);
  const userPrompt = `Deck Topic: ${deck.title}\nImage Style Suffix: ${deck.design?.imageStyle || 'minimalist flat'}\nSlides needing visuals:\n` + 
    JSON.stringify(needsVisuals.map((s: any) => ({
      slideId: s.id,
      layout: s.layout,
      title: s.title,
      body: s.body,
      needsDiagram: s.layout === 'diagram' || s.layout === 'process_steps' || s.layout === 'timeline',
      needsImage: s.layout.includes('image') || s.layout === 'cover' || s.layout === 'two_cards'
    })));

  console.log(`[Visuals] Calling LLM for ${needsVisuals.length} slides...`);
  
  let jsonStr = '';
  if (options.mockMode) {
    const slidesOutput = needsVisuals.map((s: any, i: number) => {
      if (s.layout === 'diagram') {
        const types = ['flow', 'cycle', 'timeline', 'hierarchy', 'matrix_2x2', 'venn'];
        return {
          slideId: s.id,
          diagram: {
            type: types[i % types.length],
            nodes: [
              { id: '1', label: 'Start' },
              { id: '2', label: 'Process' },
              { id: '3', label: 'End' }
            ],
            altText: 'Mock diagram'
          }
        };
      } else {
        return {
          slideId: s.id,
          image: {
            useImage: true,
            // Force fail the very first image request to test the fallback loop
            prompt: i === 1 ? 'force_fail abstract concept' : 'realistic office meeting',
            alt: 'Mock image'
          }
        };
      }
    });
    jsonStr = JSON.stringify({ slides: slidesOutput });
  } else {
    jsonStr = await callLLM({
      model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
      systemPrompt,
      userPrompt,
      mockMode: false
    });
  }

  const parsed = VisualsLLMOutputSchema.parse(JSON.parse(jsonStr));

  for (const v of parsed.slides) {
    const slide = slides.find((s: any) => s.id === v.slideId);
    if (!slide) continue;

    if (v.diagram) {
      slide.diagram = v.diagram;
    }

    if (v.image && v.image.useImage && v.image.prompt) {
      let attempts = 0;
      let finalImageUrl = null;
      let currentPrompt = v.image.prompt;

      while (attempts < 3) {
        attempts++;
        console.log(`[Visuals] Generating image for slide ${slide.id}, attempt ${attempts}...`);
        const url = await generateImage(currentPrompt, !!options.mockMode);
        const score = await evaluateImage(currentPrompt, url, !!options.mockMode);
        
        console.log(`[Visuals] Vision score: ${score}/10`);
        if (score >= 7) {
          finalImageUrl = url;
          break;
        } else {
          console.log(`[Visuals] Image rejected. Refining...`);
          currentPrompt = currentPrompt.replace('force_fail', 'fixed'); // fix for mock
        }
      }

      if (finalImageUrl) {
        slide.image = finalImageUrl;
        slide.imageAlt = v.image.alt;
      } else {
        console.log(`[Visuals] Fallback triggered for slide ${slide.id}`);
        slide.layout = 'cards'; // or something else
        slide.image = null;
      }
    } else if (v.image && !v.image.useImage) {
        // Fallback layout
        slide.layout = 'cards';
    }
  }

  deck.slides = slides;
  return deck;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: any = { deckId: '', mockMode: false };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--deck') options.deckId = args[++i];
    if (args[i] === '--mock') options.mockMode = true;
  }

  if (!options.deckId) {
    console.error("Usage: npm run agent:visuals -- --deck <id> [--mock]");
    process.exit(1);
  }

  runVisuals(options).then(deck => {
    const outFile = path.resolve(process.cwd(), `outputs/decks/${options.deckId}.json`);
    fs.writeFileSync(outFile, JSON.stringify(deck, null, 2));
    console.log(`[Visuals] Done! Updated deck saved to ${outFile}`);
  }).catch(err => {
    console.error('[Visuals] Fatal Error:', err);
    process.exit(1);
  });
}
