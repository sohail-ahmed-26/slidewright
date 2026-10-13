import { exportDeckToPptx } from './export/index';
import path from 'path';
import fs from 'fs';

async function verifyWidescreenExport() {
  const testDeck = {
    title: 'AI in Healthcare: Diagnostics & Precision Medicine',
    theme: { primary: '#2F6BFF', secondary: '#0EA5E9', fontFamily: 'Calibri' },
    slides: [
      {
        layout: 'cover',
        data: {
          title: 'AI in Healthcare: Diagnostics & Precision Medicine',
          subtitle: 'Accelerating Clinical Insights through Deep Learning and Transformer Models',
          orgName: 'HealthTech Intelligence Lab',
          date: 'October 2026'
        }
      },
      {
        layout: 'process_steps',
        data: {
          title: 'The AI Clinical Development Process',
          steps: [
            { title: 'Define the Problem', body: 'Clearly outline clinical problem to be solved and establish diagnostic objectives.' },
            { title: 'Collect & Prepare Data', body: 'Aggregate multi-modal radiological scans, annotate ground truth, and normalize data.' },
            { title: 'Train the Neural Model', body: 'Fine-tune vision transformer backbones using federated learning across clinical cohorts.' },
            { title: 'Evaluate & Deploy', body: 'Validate sensitivity, false-positive thresholds, and deploy to hospital PACS endpoints.' }
          ]
        }
      },
      {
        layout: 'big_number_dark',
        data: {
          title: 'Clinical Diagnostic Accuracy Breakthrough',
          number: '94.8%',
          label: 'Area Under Curve (ROC-AUC)',
          baseline: 'Validated across 12,000 multi-center radiological imaging cohorts',
          takeaways: [
            'Reduces time-to-diagnosis for critical oncology referrals by 62%.',
            'Eliminates missed incidental findings through automated secondary review.',
            'Ensures HIPAA-compliant on-premise execution with sub-second latency.'
          ]
        }
      },
      {
        layout: 'two_cards',
        data: {
          title: 'Architectural Frameworks',
          cards: [
            { title: 'Vision Transformers', body: 'Self-attention across radiological patches captures long-range spatial anomalies.' },
            { title: 'Federated Governance', body: 'Decentralized parameter updates safeguard patient privacy across hospital networks.' }
          ]
        }
      },
      {
        layout: 'closing',
        data: {
          message: 'Transforming Patient Care Through Intelligent Systems',
          contact: 'contact@healthtech-ai.org',
          orgName: 'HealthTech Intelligence Lab'
        }
      }
    ]
  };

  const outDir = path.resolve(process.cwd(), 'outputs/decks');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outputPath = path.join(outDir, 'widescreen_verification_test.pptx');

  console.log('[Verification] Starting native widescreen PPTX export test...');
  await exportDeckToPptx(testDeck, outputPath);

  const exists = fs.existsSync(outputPath);
  const stat = exists ? fs.statSync(outputPath) : null;
  console.log(`[Verification] Export complete! Exists: ${exists}, Size: ${stat?.size} bytes`);
  console.log(`[Verification] File written to: ${outputPath}`);
}

verifyWidescreenExport().catch(console.error);
