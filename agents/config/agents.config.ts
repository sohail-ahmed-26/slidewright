// Har agent ki settings ek hi jagah. Model badalna ho to sirf yahan/.env mein.
export type AgentName = "writer" | "designer" | "visuals" | "critic";

export const agentsConfig: Record<AgentName, {
  model: "text" | "vision";
  temperature: number;
  maxTokens: number;
  retries: number;
  timeoutMs: number;
}> = {
  writer:   { model: "text",   temperature: 0.7, maxTokens: 6000, retries: 1, timeoutMs: 90_000 },
  designer: { model: "text",   temperature: 0.9, maxTokens: 1500, retries: 1, timeoutMs: 45_000 },
  visuals:  { model: "text",   temperature: 0.6, maxTokens: 3000, retries: 1, timeoutMs: 60_000 },
  critic:   { model: "vision", temperature: 0.2, maxTokens: 3000, retries: 1, timeoutMs: 90_000 },
};
