import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { runWriter } from '../writer/index';
import { validateDeck } from '../writer/validator';

async function runEval() {
  const topicsPath = path.resolve(process.cwd(), 'shared/src/fixtures/eval-topics.json');
  if (!fs.existsSync(topicsPath)) {
    console.error(`Eval topics not found at ${topicsPath}`);
    process.exit(1);
  }

  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  const results = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n========================================`);
    console.log(`Evaluating Topic ${i+1}/${topics.length}: ${topic.topic}`);
    
    let schemaValid = false;
    let preViolations = 0;
    let postViolations = 0;
    let layoutVariety = 0;
    let finalDeck = null;

    try {
      // In eval, we do NOT use mock mode. We hit the real API.
      // But for testing the script logic, we can pass mockMode: process.env.MOCK === '1'
      const isMock = process.env.MOCK === '1';
      
      const deck = await runWriter({
        topic: topic.topic,
        audience: topic.audience || 'General',
        language: 'en',
        tone: 'professional',
        slides: 10,
        mockMode: isMock
      });

      schemaValid = true;
      const v = validateDeck(deck);
      postViolations = v.length;
      
      const uniqueLayouts = new Set(deck.slides.map(s => s.layout));
      layoutVariety = uniqueLayouts.size;
      finalDeck = deck;

    } catch (err: any) {
      console.error(`Failed to process topic: ${err.message}`);
    }

    results.push({
      topic: topic.topic,
      schemaValid,
      postViolations,
      layoutVariety
    });

    if (finalDeck) {
      const outDir = path.resolve(process.cwd(), '../outputs/decks');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, `eval-deck-${i+1}.json`), JSON.stringify(finalDeck, null, 2));
    }
  }

  console.log(`\n================= SUMMARY =================`);
  let totalValid = 0;
  let totalZeroViolations = 0;

  results.forEach((r, i) => {
    console.log(`[Topic ${i+1}] Schema Valid: ${r.schemaValid ? 'YES' : 'NO'}, Post Violations: ${r.postViolations}, Layout Variety: ${r.layoutVariety}`);
    if (r.schemaValid) totalValid++;
    if (r.postViolations === 0) totalZeroViolations++;
  });

  console.log(`\nTarget: 100% valid, 0 violations after repair.`);
  console.log(`Result: ${(totalValid / topics.length) * 100}% valid, ${(totalZeroViolations / topics.length) * 100}% zero violations.`);
}

runEval().catch(err => {
  console.error("Eval failed:", err);
  process.exit(1);
});
