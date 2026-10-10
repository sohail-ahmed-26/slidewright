import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'outputs/decks');
const publicDir = path.resolve(process.cwd(), 'frontend/public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const evalDecks = [];
for (let i = 1; i <= 6; i++) {
  const deckFile = path.join(outDir, `eval-visuals-${i}.json`);
  if (fs.existsSync(deckFile)) {
    const raw = JSON.parse(fs.readFileSync(deckFile, 'utf8'));
    evalDecks.push(raw);
  }
}

fs.writeFileSync(path.join(publicDir, 'visuals.json'), JSON.stringify(evalDecks, null, 2));
console.log(`Exported ${evalDecks.length} visual evals to frontend/public/visuals.json`);
