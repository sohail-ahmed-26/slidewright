import 'dotenv/config';

async function main() {
  const url = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  console.log(`Fetching models from ${url}/models...`);
  const res = await fetch(`${url}/models`);
  if (!res.ok) {
    console.error(`Failed to fetch models: ${res.statusText}`);
    return;
  }
  const data = await res.json();
  const models = data.data;

  console.log(`\n=== Models that support structured outputs (JSON schema) ===`);
  const structuredModels = models.filter((m: any) => m.architecture?.structured_outputs === true || m.architecture?.instruct_type === "structured");
  structuredModels.slice(0, 5).forEach((m: any) => console.log(`- ${m.id}`));

  console.log(`\n=== Models that accept image input (Vision) ===`);
  const visionModels = models.filter((m: any) => m.architecture?.modality?.includes("image") || m.architecture?.vision === true || (m.architecture?.modalities && m.architecture?.modalities.includes("image-in")));
  visionModels.slice(0, 5).forEach((m: any) => console.log(`- ${m.id}`));

  console.log(`\n=== Models with image output ===`);
  const imageOutputModels = models.filter((m: any) => m.architecture?.modality?.includes("image-output") || (m.architecture?.modalities && m.architecture?.modalities.includes("image-out")));
  imageOutputModels.slice(0, 5).forEach((m: any) => console.log(`- ${m.id}`));

  // Write some logic to inspect actual fields
  if (models.length > 0) {
    console.log(`\nSample architecture object for ${models[0].id}:`, JSON.stringify(models[0].architecture, null, 2));
  }
}

main().catch(console.error);
