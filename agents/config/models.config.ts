// Sirf OpenRouter. Model ids .env se aate hain. Exact ids: https://openrouter.ai/models
export const models = {
  baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  text: process.env.MODEL_TEXT ?? "",     // must support structured outputs (json_schema)
  vision: process.env.MODEL_VISION ?? "", // must accept image input (Critic, relevance check)
  image: process.env.MODEL_IMAGE ?? "",   // must have "image" in output_modalities
  useMock: (process.env.USE_MOCK_LLM ?? "true") === "true",
};
