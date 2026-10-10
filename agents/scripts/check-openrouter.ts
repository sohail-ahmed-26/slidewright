import 'dotenv/config';
import fs from 'fs';
import path from 'path';

async function main() {
  const url = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY in .env file.");
    process.exit(1);
  }

  const textModel = process.env.MODEL_TEXT || 'google/gemini-pro';
  const visionModel = process.env.MODEL_VISION || 'google/gemini-pro-vision';
  const imageModel = process.env.MODEL_IMAGE || 'openai/dall-e-3';

  console.log(`Using models: TEXT=${textModel}, VISION=${visionModel}, IMAGE=${imageModel}`);
  
  const logsDir = path.resolve(__dirname, '../../../outputs/logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logFile = path.join(logsDir, 'openrouter_check.log');
  fs.writeFileSync(logFile, `Running check at ${new Date().toISOString()}\n\n`);

  const doCall = async (body: any, label: string) => {
    console.log(`Running ${label}...`);
    try {
      const res = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.text();
        fs.appendFileSync(logFile, `${label} ERROR: ${err}\n\n`);
        console.error(`${label} failed.`);
      } else {
        const data = await res.json();
        fs.appendFileSync(logFile, `${label} SUCCESS: ${JSON.stringify(data)}\n\n`);
        console.log(`${label} succeeded.`);
      }
    } catch (e: any) {
      fs.appendFileSync(logFile, `${label} FETCH ERROR: ${e.message}\n\n`);
      console.error(`${label} threw an error.`);
    }
  };

  await doCall({
    model: textModel,
    messages: [{ role: 'user', content: 'Say "hello world" in JSON format { "greeting": "..." }' }],
    response_format: { type: 'json_object' }
  }, 'Text JSON Call');

  await doCall({
    model: visionModel,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this placeholder image' },
          { type: 'image_url', image_url: { url: 'https://via.placeholder.com/150' } }
        ]
      }
    ]
  }, 'Vision Call');

  await doCall({
    model: imageModel,
    prompt: 'A cute baby dragon',
  }, 'Image Generation Call');
}

main().catch(console.error);
