import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { runVisuals } from '../visuals/index';
import { Validator } from '../writer/validator';

async function runEval() {
  const outDir = path.resolve(process.cwd(), 'outputs/decks');
  
  // Create 6 dummy decks that need visuals for the eval
  const types = ['flow', 'cycle', 'timeline', 'hierarchy', 'matrix_2x2', 'venn'];
  const testDecks = [];
  
  for (let i = 1; i <= 6; i++) {
    const deck = {
      id: `eval-visuals-${i}`,
      title: `Topic ${i}`,
      design: { imageStyle: 'photorealistic' },
      slides: [
        { id: `s${i}-1`, layout: 'diagram', title: 'Diagram test', body: '' },
        { id: `s${i}-2`, layout: 'image_split', title: 'Image test', body: '' }
      ]
    };
    fs.writeFileSync(path.join(outDir, `${deck.id}.json`), JSON.stringify(deck, null, 2));
    testDecks.push(deck.id);
  }

  console.log(`Evaluating Visuals Agent on 6 topics...`);
  
  for (let i = 0; i < testDecks.length; i++) {
    console.log(`\n========================================`);
    console.log(`Topic ${i+1}/6`);
    
    try {
      const isMock = process.env.MOCK === '1';
      
      const updatedDeck = await runVisuals({
        deckId: testDecks[i],
        mockMode: isMock
      });

      fs.writeFileSync(path.join(outDir, `${testDecks[i]}.json`), JSON.stringify(updatedDeck, null, 2));

      // Quick sanity lint for data-pptx
      const hasDiagramSpec = updatedDeck.slides[0]?.diagram;
      console.log(`[Eval] Diagram Generated: ${!!hasDiagramSpec}`);
      
    } catch (err: any) {
      console.error(`Failed to process topic: ${err.message}`);
    }
  }

  console.log(`\nDone.`);
}

runEval().catch(err => {
  console.error("Eval failed:", err);
  process.exit(1);
});
