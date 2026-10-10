# Slidewright

Prompt likho -> AI professional presentation banaye -> preview dekho -> editable PPTX download karo.
Sab kuch localhost par chalta hai. Ek hi AI API: OpenRouter.

## Folder map (5 folders, har ek ka ek kaam)

| Folder      | Kaam (Roman Urdu)                                              |
|-------------|----------------------------------------------------------------|
| `frontend/` | Jo user ko dikhta hai: React app, slides ka design, preview    |
| `backend/`  | Server + database + Orchestrator (kaun sa step kab chalega)    |
| `agents/`   | AI ka dimagh: prompts, OpenRouter client, 4 agents, config     |
| `shared/`   | Common rules: data ki shakal (schemas), layouts, design tokens |
| `outputs/`  | Sab generated files: images, pptx, screenshots, logs           |

Extra: `references/` (reference deck), `docs/` (notes aur faislay).

## Flow
user prompt -> backend/orchestrator -> [agents/writer || agents/designer] -> agents/visuals -> agents/critic -> frontend preview -> backend/export -> outputs/pptx

## Quick start (Prompt 0 mein poora hoga)
1. `copy .env.example .env` aur OPENROUTER_API_KEY daalein (ya USE_MOCK_LLM=true rakhein)
2. `npm install`
3. `npm run db:push` (backend folder se, SQLite `dev.db` banane ke liye)
4. `npm run dev`
