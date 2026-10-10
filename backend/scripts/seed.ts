import { PrismaClient } from '@prisma/client';
import { agentsConfig } from '../../agents/config/agents.config';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding agents...');
  for (const [id, agent] of Object.entries(agentsConfig)) {
    const existing = await prisma.agentConfig.findUnique({
      where: { name: id }
    });
    
    if (!existing) {
      // Find default prompt from agents config
      let prompt = 'Default prompt';
      const promptFile = path.resolve(process.cwd(), `../agents/${agent.id}/prompt.ts`);
      if (fs.existsSync(promptFile)) {
        // Just dummy seed or real seed? The prompt is in the code.
        prompt = 'Check code for prompt';
      }

      const created = await prisma.agentConfig.create({
        data: {
          name: id,
          model: agent.model,
          enabled: true,
          customPrompt: null,
          params: JSON.stringify(agent || {}),
          versions: {
            create: [
              { prompt: prompt }
            ]
          }
        }
      });
      console.log(`Created agent config: ${created.name}`);
    } else {
      console.log(`Agent config ${id} already exists`);
    }
  }

  // Pre-seed some OptionPresets if empty
  const presetsCount = await prisma.optionPreset.count();
  if (presetsCount === 0) {
    await prisma.optionPreset.create({
      data: {
        name: 'Default',
        options: JSON.stringify({
          images: true,
          diagrams: true,
          criticRounds: 2
        })
      }
    });
    console.log('Created Default preset');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
