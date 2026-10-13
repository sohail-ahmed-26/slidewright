import 'dotenv/config';
import { callLLM } from '../llm/openrouter';
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
  customPrompt?: string;
  mockMode?: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ur: 'Urdu (اردو)',
  es: 'Spanish (Español)',
  ar: 'Arabic (العربية)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  zh: 'Chinese',
  ja: 'Japanese'
};

const TONE_DIRECTIVES: Record<string, string> = {
  professional: 'Authoritative, executive-ready, crisp, structured with concrete business value and ROI.',
  friendly: 'Engaging, accessible, conversational, highly relatable while maintaining substance.',
  academic: 'Scholarly, analytical, rigorous, evidence-backed with precise methodology and terminology.',
  persuasive: 'High-conviction, compelling, visionary, action-oriented, emphasizing urgency and competitive advantage.'
};

export async function runWriter(options: WriterOptions): Promise<WriterOutput> {
  const systemPrompt = getWriterSystemPrompt(options.customPrompt);

  const langCode = (options.language || 'en').toLowerCase();
  const langName = LANGUAGE_NAMES[langCode] || options.language || 'English';
  const isNonEnglish = langCode !== 'en' && langCode !== 'english';

  const toneInstruction = TONE_DIRECTIVES[options.tone?.toLowerCase()] || options.tone || 'Professional';

  const languageDirective = isNonEnglish 
    ? `\n\n🚨 MANDATORY LANGUAGE DIRECTIVE: 
The user has requested the presentation in ${langName}. 
You MUST generate ALL slide content (titles, subtitles, headings, card titles, card body sentences, bullets, labels, takeaways, speaker notes) ENTIRELY IN ${langName}. 
Do NOT generate in English. Keep only the JSON keys (e.g. "title", "body", "cards") in English for schema validity, but ALL string values must be written natively in ${langName}.`
    : '';

  const userPrompt = `Topic: ${options.topic}
Audience: ${options.audience}
Language: ${langName}
Tone: ${toneInstruction}
Slide count: ${options.slides || 8}${languageDirective}

CRITICAL QUALITY REQUIREMENTS:
- Provide executive-level depth, actionable strategic insights, and multi-sentence explanations.
- Avoid elementary 1-sentence dictionary definitions.
- Structure every slide with rich, domain-specific substance.`;

  console.log(`[Writer] Generating initial draft...`);
  const initialJsonStr = await callLLM({
    model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
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

  const rewriteJsonStr = await callLLM({
    model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
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
