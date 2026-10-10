import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { runDesigner } from '../designer/index';

async function runEval() {
  const topicsPath = path.resolve(process.cwd(), 'shared/src/fixtures/eval-topics.json');
  if (!fs.existsSync(topicsPath)) {
    console.error(`Eval topics not found at ${topicsPath}`);
    process.exit(1);
  }

  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  const results = [];

  const outDir = path.resolve(process.cwd(), 'outputs/decks');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Clear previous outputs to test duplicates properly from scratch
  const files = fs.readdirSync(outDir).filter(f => f.startsWith('eval-design-'));
  for (const f of files) fs.unlinkSync(path.join(outDir, f));

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n========================================`);
    console.log(`Evaluating Designer Topic ${i+1}/${topics.length}: ${topic.topic}`);
    
    try {
      const isMock = process.env.MOCK === '1';
      
      const design = await runDesigner({
        topic: topic.topic,
        audience: topic.audience || 'General',
        tone: 'professional',
        mockMode: isMock
      });

      results.push({
        topic: topic.topic,
        hue: design.hue,
        fontHeading: design.fontHeading
      });

      // Write mock deck file just so the duplicate guard sees it for the next iterations
      fs.writeFileSync(path.join(outDir, `eval-design-${i+1}.json`), JSON.stringify({ design }, null, 2));

    } catch (err: any) {
      console.error(`Failed to process topic: ${err.message}`);
    }
  }

  console.log(`\n================= SUMMARY =================`);
  results.forEach((r, i) => {
    console.log(`[Topic ${i+1}] Hue: ${r.hue}, Font: ${r.fontHeading}`);
  });
}

runEval().catch(err => {
  console.error("Eval failed:", err);
  process.exit(1);
});
