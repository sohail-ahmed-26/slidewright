import 'dotenv/config';
import { runWriter } from '../writer/index';
import { runDesigner } from '../designer/index';
import { runVisuals } from '../visuals/index';
import { runCritic } from '../critic/index';
import { callLLM } from '../llm/openrouter';
import { getWriterSystemPrompt } from '../writer/prompt';
import { WriterOutputSchema } from '@slidewright/shared';
import fs from 'fs';
import path from 'path';

async function reviseDeck(deck: any, feedback: any): Promise<any> {
  const issues = feedback.issues.filter((i: any) => i.type === 'content' || i.type === 'layout');
  if (issues.length === 0) return deck; // Nothing for the writer to fix

  console.log(`[Pipeline] Critic found ${issues.length} content/layout issues. Requesting rewrite...`);
  
  const rewritePrompt = `The Critic Agent reviewed your deck and found the following issues:
${issues.map((i: any) => `- [${i.severity.toUpperCase()}] Slide ${i.slideId || 'Global'}: ${i.message} (Suggested Fix: ${i.suggestedFix || 'None'})`).join('\n')}

Please fix ONLY these issues and return the complete valid JSON deck again. DO NOT change unaffected slides.

Original Deck:
${JSON.stringify(deck, null, 2)}`;

  const systemPrompt = getWriterSystemPrompt();
  const jsonStr = await callLLM({
    model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
    systemPrompt,
    userPrompt: rewritePrompt,
    mockMode: false
  });

  try {
    const raw = JSON.parse(jsonStr);
    const revised = WriterOutputSchema.parse(raw);
    return { ...deck, slides: revised.slides };
  } catch (e: any) {
    console.error(`[Pipeline] Failed to parse revised deck:`, e.message);
    return deck; // Fallback to original
  }
}

async function runPipeline() {
  const topic = process.argv[2] || "The Future of Artificial Intelligence";
  const deckId = `deck-${Date.now()}`;
  
  console.log(`==========================================`);
  console.log(`🚀 STARTING PIPELINE FOR: ${topic}`);
  console.log(`==========================================\n`);

  // 1. Writer
  console.log(`[1/4] Starting Writer Agent...`);
  let deck = await runWriter({
    topic,
    audience: "General Professionals",
    language: "en",
    tone: "professional",
    slides: 8,
    mockMode: false
  });

  // Save intermediate deck so Designer/Visuals can find it
  // Inject metadata for Critic
  (deck as any).title = topic;
  (deck as any).audience = "General Professionals";
  (deck as any).tone = "professional";

  const outDir = path.resolve(process.cwd(), 'outputs/decks');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const deckPath = path.join(outDir, `${deckId}.json`);
  
  // 2. Designer
  console.log(`\n[2/4] Starting Designer Agent...`);
  const design = await runDesigner({
    topic,
    audience: "General Professionals",
    tone: "professional",
    mockMode: false
  });
  
  // Assign design to deck and save
  (deck as any).design = design;
  fs.writeFileSync(deckPath, JSON.stringify(deck, null, 2));

  // 3. Visuals
  console.log(`\n[3/4] Starting Visuals Agent...`);
  deck = await runVisuals({ deckId, mockMode: false });
  fs.writeFileSync(deckPath, JSON.stringify(deck, null, 2));

  // 4. Critic Loop
  let loopCount = 0;
  const maxLoops = 2;
  
  while (loopCount < maxLoops) {
    loopCount++;
    console.log(`\n[4/4] Starting Critic Agent (Pass ${loopCount}/${maxLoops})...`);
    
    const criticResult = await runCritic({ deckId, mockMode: false });
    console.log(`[Critic] Score: ${criticResult.score}/10 | Approved: ${criticResult.approved}`);
    
    if (criticResult.approved) {
      console.log(`[Pipeline] Deck approved by Critic!`);
      break;
    }
    
    console.log(`[Critic] Feedback: ${criticResult.feedback}`);
    
    // Revise deck
    if (loopCount < maxLoops) {
      console.log(`[Pipeline] Applying Critic feedback...`);
      deck = await reviseDeck(deck, criticResult);
      fs.writeFileSync(deckPath, JSON.stringify(deck, null, 2));
      
      // Need to re-run visuals since slides might have changed
      console.log(`[Pipeline] Re-running Visuals Agent...`);
      deck = await runVisuals({ deckId, mockMode: false });
      fs.writeFileSync(deckPath, JSON.stringify(deck, null, 2));
    }
  }

  console.log(`\n==========================================`);
  console.log(`✅ PIPELINE COMPLETE!`);
  console.log(`Deck saved to: outputs/decks/${deckId}.json`);
  console.log(`==========================================`);
}

if (process.argv[1] && process.argv[1].endsWith('run-pipeline.ts')) {
  runPipeline().catch(e => {
    console.error("Pipeline failed:", e);
    process.exit(1);
  });
}
