import { prisma } from './db';
import {
  DEFAULT_WRITER_PROMPT,
  DEFAULT_DESIGNER_PROMPT,
  DEFAULT_VISUAL_PROMPT,
  DEFAULT_CRITIC_PROMPT,
} from '@slidewright/shared';

const AGENT_DEFAULTS = [
  { name: 'writer', model: 'openai/gpt-4o-mini', prompt: DEFAULT_WRITER_PROMPT },
  { name: 'designer', model: 'openai/gpt-4o-mini', prompt: DEFAULT_DESIGNER_PROMPT },
  { name: 'visuals', model: 'openai/gpt-4o-mini', prompt: DEFAULT_VISUAL_PROMPT },
  { name: 'critic', model: 'openai/gpt-4o-mini', prompt: DEFAULT_CRITIC_PROMPT },
];

export async function initAgentPrompts() {
  console.log('[Init] Checking and initializing agent system prompts in database...');
  for (const agentDef of AGENT_DEFAULTS) {
    try {
      const existing = await prisma.agentConfig.findUnique({
        where: { name: agentDef.name },
        include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });

      if (!existing) {
        await prisma.agentConfig.create({
          data: {
            name: agentDef.name,
            model: agentDef.model,
            enabled: true,
            customPrompt: null,
            versions: {
              create: [{ prompt: agentDef.prompt }]
            }
          }
        });
        console.log(`[Init] Created agent config with default prompt: ${agentDef.name}`);
      } else {
        const isLegacyOldPrompt = existing.customPrompt && 
          existing.customPrompt.includes('Principal Presentation Architect');

        const hasCustom = existing.customPrompt && 
          existing.customPrompt.trim().length > 0 && 
          existing.customPrompt !== 'Default prompt' && 
          existing.customPrompt !== 'Check code for prompt' &&
          !isLegacyOldPrompt;

        const latestVersion = existing.versions[0]?.prompt;
        const isPlaceholderOrOld = !latestVersion || 
          latestVersion === 'Default prompt' || 
          latestVersion === 'Check code for prompt' ||
          latestVersion.includes('Principal Presentation Architect') ||
          isLegacyOldPrompt;

        if (!hasCustom && isPlaceholderOrOld) {
          await prisma.promptVersion.create({
            data: {
              agentId: existing.id,
              prompt: agentDef.prompt
            }
          });
          await prisma.agentConfig.update({
            where: { id: existing.id },
            data: { customPrompt: null }
          });
          console.log(`[Init] Seeded official master default prompt for ${agentDef.name}`);
        } else {
          console.log(`[Init] Preserved prompt for ${agentDef.name} (hasCustomPrompt: ${Boolean(hasCustom)})`);
        }
      }
    } catch (err: any) {
      console.error(`[Init] Error initializing agent prompt for ${agentDef.name}:`, err.message);
    }
  }
}
