# Slidewright Repository Audit

## Overview
This audit is conducted as part of Phase 0 of the FINAL BUILD initiative. The goal is to identify what is stubbed, mocked, or broken to safely strip them out and transition the application to full live mode.

| Item | Status | Evidence |
|------|--------|----------|
| **Frontend API Layer** | MOCK | `frontend/src/lib/api.ts` contains `MockApi` with seeded fixture data and fake setTimeouts for run subscriptions. `HttpApi` exists but is toggled by `VITE_API_MODE`. |
| **Frontend State Store** | MOCK | `frontend/src/store/useDeckStore.ts` and `useJobStore.ts` use `zustand/middleware` `persist` with initial states pulled from `FIXTURES`. |
| **Fake Decks & Data** | MOCK | `shared/src/fixtures.ts` contains hardcoded deck definitions ("Q3 Marketing Strategy", "Product Launch: Slidewright"). |
| **Simulate Pipeline Failure UI** | MOCK | `frontend/src/pages/NewDeck.tsx` and Settings contain buttons/flags intended to force failures for testing UI states. |
| **Unused Pages (/dev)** | STUB/DEV | `frontend/src/pages/DevDiagrams.tsx`, `DevKit.tsx`, `DevPalettes.tsx`, `DevSlides.tsx`. |
| **LLM Calls (OpenRouter)** | LIVE/MOCK | `agents/llm/openrouter.ts` defaults to `USE_MOCK_LLM=true` via environment or fallback, bypassing real OpenRouter calls. |
| **Generated Data in Source** | MOCK | `frontend/public/visuals.json` and possibly test outputs mixed into `src`. |
| **Orchestrator Backend** | PARTIAL LIVE | `backend/src/orchestrator/index.ts` is implemented and updates Prisma, but was built parallel to the frontend's mock store, meaning end-to-end integration is disconnected. |
| **PPTX Export** | LIVE | Implemented in `backend/src/export/pptx.ts` using `pptxgenjs` with correct shape properties. Fully functional. |
| **Database State** | LIVE | Prisma SQLite is functioning, agent configurations were seeded. |

## Actions
- Strip all frontend mock classes and toggle flags. The frontend must only use `HttpApi`.
- Remove default `FIXTURES` from global store initial states.
- Clean up unused dev tools from the frontend if not behind a specific dev route, or remove them from the production navigation structure.
- Ensure `USE_MOCK_LLM` is structurally prohibited from being enabled in standard application runtime outside of `NODE_ENV=test`.
