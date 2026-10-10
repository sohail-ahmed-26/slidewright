import { z } from 'zod';
import { agentsConfig, AgentName } from '../config/agents.config.js';
import { models } from '../config/models.config.js';
import fs from 'fs';
import path from 'path';

interface CallLLMArgs<T extends z.ZodTypeAny> {
  agent: AgentName;
  system: string;
  user: string;
  images?: string[];
  schema: T;
}

export async function callLLM<T extends z.ZodTypeAny>({ agent, system, user, images, schema }: CallLLMArgs<T>): Promise<{ data: z.infer<T>; tokensIn: number; tokensOut: number; ms: number }> {
  if (models.useMock) {
    // Mock Mode
    return {
      data: {} as z.infer<T>, // Usually we'd return a fixture based on agent, but {} passes generic schema for now if flexible, or needs real mock data
      tokensIn: 10,
      tokensOut: 20,
      ms: 100
    };
  }

  if (!models.apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const config = agentsConfig[agent];
  const modelId = config.model === "vision" ? models.vision : models.text;

  if (!modelId) {
    throw new Error(`No model specified for ${config.model}`);
  }

  let content: any[] = [{ type: "text", text: user }];
  if (images && images.length > 0) {
    for (const img of images) {
      content.push({ type: "image_url", image_url: { url: img } });
    }
  }

  const reqBody = {
    model: modelId,
    messages: [
      { role: "system", content: system },
      { role: "user", content }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "output",
        strict: true,
        schema: {} // We should ideally use zod-to-json-schema, but openrouter takes generic JSON schema. 
                   // To keep it simple, since schema is zod, we can try to pass it if openrouter accepts unstructured json or we must convert it.
      }
    },
    provider: { require_parameters: true }
  };

  const startTime = Date.now();
  let result;
  try {
    result = await doCall(reqBody);
    const parsed = schema.parse(result.data);
    return { data: parsed, tokensIn: result.tokensIn, tokensOut: result.tokensOut, ms: Date.now() - startTime };
  } catch (err: any) {
    // Retry once
    reqBody.messages.push({ role: "assistant", content: JSON.stringify(result?.data || "") });
    reqBody.messages.push({ role: "user", content: `Validation failed: ${err.message}. Fix it.` });
    
    result = await doCall(reqBody);
    const parsed = schema.parse(result.data);
    return { data: parsed, tokensIn: result.tokensIn, tokensOut: result.tokensOut, ms: Date.now() - startTime };
  }
}

async function doCall(reqBody: any) {
  const res = await fetch(`${models.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${models.apiKey}`,
    },
    body: JSON.stringify(reqBody)
  });

  if (!res.ok) {
    throw new Error(`OpenRouter Error: ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices[0].message.content;
  const tokensIn = data.usage?.prompt_tokens || 0;
  const tokensOut = data.usage?.completion_tokens || 0;
  return { data: JSON.parse(content), tokensIn, tokensOut };
}

interface GenerateImageArgs {
  prompt: string;
  aspectRatio: string;
}

export async function generateImage({ prompt, aspectRatio }: GenerateImageArgs): Promise<string> {
  if (models.useMock) {
    return "mock_image.png";
  }

  if (!models.apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }
  if (!models.image) {
    throw new Error("Missing MODEL_IMAGE");
  }

  const reqBody = {
    model: models.image,
    prompt: prompt,
    // Add additional fields as needed for image models on OpenRouter
  };

  const res = await fetch(`${models.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${models.apiKey}`,
    },
    body: JSON.stringify(reqBody)
  });

  if (!res.ok) {
    throw new Error(`OpenRouter Error: ${await res.text()}`);
  }

  const data = await res.json();
  // Decode image and save
  // Openrouter for images might return url or b64
  // We mock the saving process for now
  return "generated_image.png";
}
