import { getTopicTheme } from '@slidewright/shared';
import { exportDeckToPptx } from './export';
import path from 'path';
import fs from 'fs';

async function testFlowAndThemes() {
  console.log('=== TEST 1: Topic Theme Engine Verification ===');
  const topics = [
    'Cardiovascular Health & Clinical AI Diagnostics',
    'Quarterly Financial Growth & Venture Investment Banking',
    'Deep Reinforcement Learning & Autonomous AI Agents',
    'University Higher Education Curriculum & Career Readiness',
    'Renewable Solar Energy & Climate Sustainability Infrastructure',
    'Global Brand Marketing Strategy & Omnichannel Creative'
  ];

  topics.forEach(t => {
    const theme = getTopicTheme(t);
    console.log(`[Theme] Topic: "${t}" -> Mood: "${theme.moodName}", Primary: ${theme.primary}, Secondary: ${theme.secondary}, DarkBg: ${theme.darkBg}`);
  });

  console.log('\n=== TEST 2: Executive Slide Flow & Agenda PPTX Export ===');
  const techTheme = getTopicTheme('Deep Reinforcement Learning & Autonomous AI Agents');
  const testDeck = {
    title: 'Autonomous AI Agents: Technical Architecture & Business Impact',
    theme: techTheme,
    slides: [
      {
        layout: 'cover',
        data: {
          title: 'Autonomous AI Agents',
          subtitle: 'Architectures, Enterprise Deployment, and Strategic Impact',
          orgName: 'Slidewright AI Research',
          date: 'October 2026'
        }
      },
      {
        layout: 'agenda',
        data: {
          title: 'Executive Agenda & Roadmap',
          subtitle: 'A structured blueprint for autonomous agent adoption across the enterprise',
          items: [
            { title: 'Foundations & Agentic Reasoning', body: 'Decomposing autonomous task execution and multi-agent coordination loops.' },
            { title: 'Enterprise Tool Integration', body: 'Connecting agents securely to APIs, databases, and enterprise systems.' },
            { title: 'Evaluation & Guardrails', body: 'Benchmarking hallucination rates, safety thresholds, and determinism.' },
            { title: 'Production Scalability', body: 'Cost optimization, latency management, and distributed execution architectures.' }
          ]
        }
      },
      {
        layout: 'comparison',
        data: {
          title: 'Narrow AI vs. Autonomous Agentic Systems',
          left: {
            title: 'Narrow Traditional AI',
            points: [
              'Requires deterministic, single-turn prompts with fixed input schemas',
              'Lacks persistent state management and multi-step recovery loops',
              'Limited to isolated classification or summarization tasks'
            ]
          },
          right: {
            title: 'Autonomous Agentic Systems',
            points: [
              'Executes multi-step reasoning with proactive dynamic self-correction',
              'Maintains contextual memory across extended enterprise workflows',
              'Orchestrates external APIs and autonomous tool invocations end-to-end'
            ]
          }
        }
      },
      {
        layout: 'process_steps',
        data: {
          title: 'Implementing AI Agents in Business',
          steps: [
            { title: 'Identify High-Value Workflows', body: 'Pinpoint repetitive multi-step knowledge workflows where agentic reasoning provides 10x leverage.' },
            { title: 'Architect Tool Interfaces', body: 'Expose strictly validated API schemas and sandboxed execution environments for agent action.' },
            { title: 'Deploy with Human-in-the-Loop', body: 'Begin with supervisor approval workflows before expanding autonomous execution boundaries.' }
          ]
        }
      },
      {
        layout: 'big_number_dark',
        data: {
          title: 'Quantified Enterprise Operational Velocity',
          number: '84%',
          label: 'Cycle Time Reduction in Complex Workflows',
          baseline: 'Measured across 1,200 enterprise production workflows',
          takeaways: [
            'Dramatically accelerates document reconciliation and analytics loops.',
            'Eliminates manual triage overhead across distributed engineering teams.',
            'Maintains 99.4% precision with automated critic verification steps.'
          ]
        }
      },
      {
        layout: 'closing',
        data: {
          title: 'Strategic Roadmap & Next Steps',
          message: 'The Agentic Enterprise Starts Here',
          subtitle: 'Deploy scalable, deterministic AI architectures today.',
          contact: 'contact@slidewright.ai'
        }
      }
    ]
  };

  const outDir = path.resolve('outputs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const pptxFile = path.join(outDir, 'agentic_flow_verification.pptx');

  const generatedPath = await exportDeckToPptx(testDeck, pptxFile);
  const stat = fs.statSync(generatedPath);
  console.log(`[Export Success] PPTX created: ${generatedPath} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log('Verification finished cleanly!');
}

testFlowAndThemes().catch(err => {
  console.error('[Error]', err);
  process.exit(1);
});
