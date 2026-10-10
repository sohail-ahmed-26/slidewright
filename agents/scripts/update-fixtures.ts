import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'outputs/decks');
const fixturesPath = path.resolve(process.cwd(), 'shared/src/fixtures.ts');
let fixturesContent = fs.readFileSync(fixturesPath, 'utf8');

const evalDecks = [];
for (let i = 1; i <= 8; i++) {
  const deckFile = path.join(outDir, `eval-deck-${i}.json`);
  if (fs.existsSync(deckFile)) {
    const raw = JSON.parse(fs.readFileSync(deckFile, 'utf8'));
    evalDecks.push({
      id: `eval-deck-${i}`,
      title: `Eval Topic ${i}`,
      createdAt: new Date().toISOString(),
      status: "ready",
      theme: { primary: "220 80% 50%", fontFamily: "Inter, sans-serif" },
      slides: raw.slides.map((s, idx) => ({ id: `ed${i}_${idx}`, ...s }))
    });
  }
}

// Very basic string replacement to add the decks to FIXTURES.decks array
// Find the closing bracket of `decks: [` and insert them there. Not robust but works for this.
const insertionIndex = fixturesContent.indexOf('],');
if (insertionIndex !== -1) {
  const newDecksString = evalDecks.map(d => JSON.stringify(d)).join(',\n    ') + (evalDecks.length > 0 ? ',' : '');
  const modifiedContent = fixturesContent.slice(0, insertionIndex) + (fixturesContent[insertionIndex - 1] === '[' ? '' : ',\n    ') + newDecksString + '\n  ' + fixturesContent.slice(insertionIndex);
  fs.writeFileSync(fixturesPath, modifiedContent);
  console.log("Updated fixtures.ts with 8 eval decks!");
} else {
  console.log("Could not find insertion point in fixtures.ts");
}
