import 'dotenv/config';
import { callLLM } from '../llm/openrouter';
import { getDesignerSystemPrompt } from './prompt';
import { DesignerLLMOutputSchema, DesignerOutput, generatePalette } from '@slidewright/shared';
import fs from 'fs';
import path from 'path';

export interface DesignerOptions {
  topic: string;
  audience: string;
  tone: string;
  themeHint?: string;
  customPrompt?: string;
  mockMode?: boolean;
}

// Read up to 10 last designs to prevent duplicates
function getPreviousDesigns() {
  const outDir = path.resolve(process.cwd(), '../../outputs/decks');
  if (!fs.existsSync(outDir)) return [];
  
  const files = fs.readdirSync(outDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const fullPath = path.join(outDir, f);
      return { path: fullPath, stat: fs.statSync(fullPath) };
    })
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)
    .slice(0, 10);

  const previous = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(file.path, 'utf8'));
      if (data.design && data.design.hue !== undefined) {
        previous.push({
          moodName: data.design.moodName,
          hue: data.design.hue,
          fonts: [data.design.fontHeading, data.design.fontBody]
        });
      }
    } catch(e) {}
  }
  return previous;
}

// Distance on color wheel
function hueDistance(h1: number, h2: number) {
  const d = Math.abs(h1 - h2);
  return Math.min(d, 360 - d);
}

export async function runDesigner(options: DesignerOptions): Promise<DesignerOutput> {
  const systemPrompt = getDesignerSystemPrompt(options.customPrompt);
  const previousDesigns = getPreviousDesigns();
  const previousStr = JSON.stringify(previousDesigns);

  let attempt = 0;
  let finalRawOutput = null;

  while (attempt < 3) {
    attempt++;
    const userPrompt = `Topic: ${options.topic}\nAudience: ${options.audience}\nTone: ${options.tone}\nTheme Hint: ${options.themeHint || 'None'}\nPrevious Designs (last 10): ${previousStr}\nSeed: ${Math.random()}`;

    console.log(`[Designer] Generating design... (Attempt ${attempt}/3)`);
    let jsonStr = '';
    
    if (options.mockMode) {
      jsonStr = JSON.stringify({
        hue: Math.floor(Math.random() * 360),
        accentHue: null,
        fontHeading: "Arial, sans-serif",
        fontBody: "Arial, sans-serif",
        radius: "16",
        shadow: "soft",
        cardStyle: "tinted",
        iconShape: "circle",
        motif: "dots",
        imageStyle: "minimalist flat illustration",
        moodName: "Mock Clean Design",
        rationale: "Testing mock generator."
      });
    } else {
      jsonStr = await callLLM({
        model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
        systemPrompt,
        userPrompt,
        mockMode: false,
        temperature: 0.9 // High temp for creative variety
      });
    }

    try {
      const raw = JSON.parse(jsonStr);
      finalRawOutput = DesignerLLMOutputSchema.parse(raw);

      // Duplicate guard check
      let duplicate = false;
      if (previousDesigns.length > 0) {
        // Hue distance >= 40 across all? Or just recent? 
        // User said: "duplicate guard comparing hue distance (>= 40 degrees) and font pair against the last 10 designs"
        for (const pd of previousDesigns) {
          if (hueDistance(finalRawOutput.hue, pd.hue) < 40) {
            console.log(`[Designer] Violation: Hue ${finalRawOutput.hue} too close to previous hue ${pd.hue}`);
            duplicate = true;
            break;
          }
        }
        
        // Font pair check against immediately previous deck? Or all 10? User: "font pair against the last 10 designs".
        // "different from the previous deck" in prompt. Let's just check immediately previous (index 0).
        if (!duplicate && previousDesigns[0].fonts[0] === finalRawOutput.fontHeading && previousDesigns[0].fonts[1] === finalRawOutput.fontBody) {
            console.log(`[Designer] Violation: Font pair is identical to immediately previous deck.`);
            duplicate = true;
        }
      }

      if (!duplicate || attempt === 3) {
        break; // Passed checks or max retries
      }
    } catch (err: any) {
      console.error(`[Designer] Parse Error:`, err.message);
      if (attempt === 3) throw err;
    }
  }

  if (!finalRawOutput) {
    throw new Error('Designer failed to generate valid output after 3 attempts.');
  }

  // Code derives the palette
  const theme = generatePalette(finalRawOutput.hue, finalRawOutput.accentHue);

  const output: DesignerOutput = {
    ...finalRawOutput,
    theme
  };

  return output;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: any = { topic: '', audience: 'General', tone: 'professional', mockMode: false };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic') options.topic = args[++i];
    if (args[i] === '--audience') options.audience = args[++i];
    if (args[i] === '--tone') options.tone = args[++i];
    if (args[i] === '--mock') options.mockMode = true;
  }

  if (!options.topic) {
    console.error("Usage: npm run agent:designer -- --topic <topic> [--mock]");
    process.exit(1);
  }

  runDesigner(options).then(design => {
    const outDir = path.resolve(process.cwd(), '../../outputs/designs'); // Temporary place just for CLI test
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, `designer-output-${Date.now()}.json`);
    fs.writeFileSync(outFile, JSON.stringify(design, null, 2));
    console.log(`[Designer] Done! Saved to ${outFile}`);
    console.log(`[Summary] Mood: ${design.moodName}, Hue: ${design.hue}`);
  }).catch(err => {
    console.error('[Designer] Fatal Error:', err);
    process.exit(1);
  });
}
