import 'dotenv/config';
import { runCritic } from '../critic/index';
import path from 'path';
import fs from 'fs';

async function runEval() {
  console.log("Evaluating Critic Agent on mock deck...");
  
  // Create a mock deck
  const mockDeck = {
    id: "eval-critic-1",
    title: "Quarterly Sales Review",
    audience: "Executives",
    tone: "Professional",
    design: {
      hue: 210,
      fontHeading: "Arial",
      fontBody: "Arial",
      radius: "16",
      shadow: "soft"
    },
    slides: [
      {
        id: "s1-1",
        layout: "cover",
        title: "Q3 Sales Review",
        body: "A comprehensive overview of our performance this quarter."
      },
      {
        id: "s1-2",
        layout: "bullets",
        title: "Key Highlights",
        body: "We exceeded expectations.\\nRevenue is up.\\nCosts are down.\\nCustomer satisfaction is high.\\nNew products launched.\\nMarket share increased.\\nEmployee retention improved.\\nStock price hit record high.\\nToo many bullets here."
      }
    ]
  };

  const outDir = path.resolve(process.cwd(), 'outputs/decks');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const deckPath = path.join(outDir, 'eval-critic-1.json');
  fs.writeFileSync(deckPath, JSON.stringify(mockDeck, null, 2));

  try {
    const result = await runCritic({ deckId: 'eval-critic-1', mockMode: false });
    console.log("\n================= CRITIC RESULT =================");
    console.log(`Score: ${result.score}/10`);
    console.log(`Approved: ${result.approved}`);
    console.log(`Feedback: ${result.feedback}`);
    console.log("\nIssues Found:");
    result.issues.forEach(issue => {
      console.log(`- [${issue.severity.toUpperCase()}] ${issue.type} on ${issue.slideId || 'global'}: ${issue.message}`);
      if (issue.suggestedFix) console.log(`  Fix: ${issue.suggestedFix}`);
    });
    console.log("=================================================");
  } catch(e) {
    console.error("Critic Eval Failed:", e);
    process.exit(1);
  }
}

runEval();
