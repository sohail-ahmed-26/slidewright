# Architecture

Pipeline:
Orchestrator (code, no LLM)
  -> Writer (LLM)  ||  Designer (LLM)      [parallel]
  -> Visuals (LLM + image tool)
  -> Critic (code checks + vision LLM, loop max 3)
  -> Export (code, no LLM)  -> outputs/pptx

Why only 4 LLM agents: fixed workflow beats autonomous agents for a predictable task.
Preview and PPTX come from the same React renderer (export mode, Playwright -> pptxgenjs).

## Layers

- **Frontend**: React + Vite + TypeScript + Tailwind. Serves as the UI and handles the single renderer for both web preview and final export.
- **Backend**: Node.js + Express + TypeScript + Prisma. Exposes the DB, orchestrates the AI pipeline, and serves static files from `outputs/`.
- **Agents**: Contains the logic and prompts for OpenRouter-powered LLM interactions. Unified client in `agents/llm/openrouter.ts`.
- **Shared**: Houses the common types (Zod schemas), interfaces, and design tokens to ensure consistency.

## Data

- Local Postgres via Docker container (`docker-compose up -d`).
- ORM: Prisma.
- Outputs (images, decks) are persisted strictly in the `/outputs` directory.
