# agents/  (AI ka dimagh: sab kuch AI se related yahin)
Sirf 4 LLM agents. Orchestrator aur Export code hain (backend mein), LLM nahi.

- `config/agents.config.ts`  har agent ki settings (model, temperature, tokens, retries, timeout)
- `config/models.config.ts`  OpenRouter model ids (.env se)
- `llm/openrouter.ts`        ONE client: text, structured JSON, vision, image generation. Mock mode bhi yahin.
- `writer/`    story + har slide ka copy + layout intikhab
- `designer/`  topic ke mutabiq hue, fonts, mood (palette code banata hai)
- `visuals/`   diagram spec + image prompt + image generate + relevance check
- `critic/`    quality check loop (code checks + vision critic)

Har agent folder mein: `prompt.ts` (system prompt), `run.ts` (chalane ka function), `validate.ts` (output checks), `*.test.ts`.
Rule: har output zod se validate, ek retry, phir saaf error.
