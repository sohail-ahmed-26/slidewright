import 'dotenv/config';
import { callOpenRouter } from '../llm/openrouter';
import { getWriterSystemPrompt } from './prompt';
import { validateDeck } from './validator';
import { WriterOutputSchema, WriterOutput } from '@slidewright/shared';
import fs from 'fs';
import path from 'path';

export interface WriterOptions {
  topic: string;
  audience: string;
  language: string;
  tone: string;
  slides: number;
  mockMode?: boolean;
}

export async function runWriter(options: WriterOptions): Promise<WriterOutput> {
  const systemPrompt = getWriterSystemPrompt();
  const userPrompt = `Topic: ${options.topic}\nAudience: ${options.audience}\nLanguage: ${options.language}\nTone: ${options.tone}\nSlide count: ${options.slides}`;

  console.log(`[Writer] Generating initial draft...`);
  const initialJsonStr = await callOpenRouter({
    model: 'google/gemini-2.5-flash', // Default
    systemPrompt,
    userPrompt,
    mockMode: options.mockMode
  });

  let deck: WriterOutput;
  try {
    const raw = JSON.parse(initialJsonStr);
    deck = WriterOutputSchema.parse(raw);
  } catch (err: any) {
    if (options.mockMode) throw err; // Mock mode should always produce valid JSON
    console.error(`[Writer] Failed to parse initial JSON:`, err.message);
    throw new Error('Initial LLM output was not valid JSON matching WriterOutputSchema.');
  }

  const violations = validateDeck(deck);
  if (violations.length === 0) {
    console.log(`[Writer] Initial draft valid!`);
    return deck;
  }

  console.log(`[Writer] Violations found: ${violations.length}`);
  violations.forEach(v => console.log(`  - Slide ${v.index}: ${v.message}`));
  
  if (options.mockMode) {
    // In mock mode, we assume the mock generator generates perfect decks for testing.
    return deck; 
  }

  console.log(`[Writer] Requesting ONE automatic rewrite for violations...`);
  const rewriteUserPrompt = `Your previous output had the following violations:\n${violations.map(v => `- Slide ${v.index}: ${v.message}`).join('\n')}
Please fix ONLY these issues and return the complete valid JSON deck again. Ensure slot limits and layout sequence rules are perfectly respected.`;

  const rewriteJsonStr = await callOpenRouter({
    model: 'google/gemini-2.5-flash',
    systemPrompt,
    userPrompt: `${userPrompt}\n\n[SYSTEM: REWRITE REQUEST]\n${rewriteUserPrompt}`,
    mockMode: false
  });

  try {
    const rawRewrite = JSON.parse(rewriteJsonStr);
    const rewrittenDeck = WriterOutputSchema.parse(rawRewrite);
    const postViolations = validateDeck(rewrittenDeck);
    
    if (postViolations.length > 0) {
      console.warn(`[Writer] Rewrite still had ${postViolations.length} violations.`);
    } else {
      console.log(`[Writer] Rewrite successful!`);
    }
    return rewrittenDeck;
  } catch (err: any) {
    console.error(`[Writer] Failed to parse rewritten JSON, falling back to initial draft:`, err.message);
    return deck;
  }
}

// CLI Execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: any = { topic: '', audience: 'General', language: 'en', tone: 'professional', slides: 10, mockMode: false };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic') options.topic = args[++i];
    if (args[i] === '--audience') options.audience = args[++i];
    if (args[i] === '--language') options.language = args[++i];
    if (args[i] === '--tone') options.tone = args[++i];
    if (args[i] === '--slides') options.slides = parseInt(args[++i], 10);
    if (args[i] === '--mock') options.mockMode = true;
  }

  if (!options.topic) {
    console.error("Usage: npm run agent:writer -- --topic <topic> [--audience <a>] [--mock]");
    process.exit(1);
  }

  runWriter(options).then(deck => {
    const outDir = path.resolve(process.cwd(), '../../outputs/decks');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, `writer-output-${Date.now()}.json`);
    fs.writeFileSync(outFile, JSON.stringify(deck, null, 2));
    console.log(`[Writer] Done! Saved to ${outFile}`);
    console.log(`[Summary] Total slides: ${deck.slides.length}`);
  }).catch(err => {
    console.error('[Writer] Fatal Error:', err);
    process.exit(1);
  });
}
