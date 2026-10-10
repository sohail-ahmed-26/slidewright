import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'outputs/decks');
const publicDir = path.resolve(process.cwd(), 'frontend/public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const evalDesigns = [];
for (let i = 1; i <= 8; i++) {
  const deckFile = path.join(outDir, `eval-design-${i}.json`);
  if (fs.existsSync(deckFile)) {
    const raw = JSON.parse(fs.readFileSync(deckFile, 'utf8'));
    evalDesigns.push({
      id: i,
      topic: `Topic ${i}`, // We can pull the real topic if we need to, but this is fine for eval UI
      design: raw.design
    });
  }
}

fs.writeFileSync(path.join(publicDir, 'palettes.json'), JSON.stringify(evalDesigns, null, 2));
console.log(`Exported ${evalDesigns.length} palettes to frontend/public/palettes.json`);
