import { FIXTURES } from '../../shared/src/fixtures';
import { prisma } from '../src/db';
import { exportDeckToPptx } from '../src/export/pptx';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Testing PPTX export on fixtures...');
  for (const deck of FIXTURES.decks) {
    console.log(`Exporting ${deck.id} - ${deck.title}`);
    
    // Upsert the deck
    await prisma.deck.upsert({
      where: { id: deck.id },
      create: {
        id: deck.id,
        title: deck.title,
        prompt: 'test',
        status: 'ready',
        design: JSON.stringify({ theme: deck.theme }),
        data: JSON.stringify(deck)
      },
      update: {
        design: JSON.stringify({ theme: deck.theme }),
        data: JSON.stringify(deck)
      }
    });

    try {
      const url = await exportDeckToPptx(deck.id);
      console.log(`Success: ${url}`);
    } catch (e) {
      console.error(`Failed to export ${deck.id}`, e);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
