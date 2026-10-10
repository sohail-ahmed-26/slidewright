# Decisions log
(Antigravity yahan har technical faisla likhega: tareekh, faisla, wajah.)

## 2026-10-10
**Faisla**: Setup npm workspaces for `frontend`, `backend`, `shared`, and `agents`.
**Wajah**: To allow sharing of types and logic across all layers without publishing packages or using complex monorepo tools.

**Faisla**: Use Vite for the frontend React app and `tsx watch` for the Express backend. Use `concurrently` to run both in the `npm run dev` script.
**Wajah**: Simplifies the developer experience, allowing the entire stack to run locally with a single command without Docker (except for Postgres).

**Faisla**: Only rely on OpenRouter API for all LLM calls. Implemented a central OpenRouter wrapper in `agents/llm/openrouter.ts` capable of calling Text, Vision, and Image models.
**Wajah**: Avoids vendor lock-in and allows easy swapping of models based on user configuration, fulfilling the strict rules of the project.

**Faisla**: Implemented Mock Mode in `callLLM` and `generateImage` that defaults to returning fixtures.
**Wajah**: Required by project rules to ensure the app functions without any network requests or API keys when `USE_MOCK_LLM=true`.

**Faisla**: Use `pages/` and `components/` instead of a domain-driven `features/` structure in the frontend.
**Wajah**: For a straightforward application size, flattening components and pages is simpler and adheres to standard Vite/React scaffolding patterns without over-engineering.

**Faisla**: Fall back to layout-specific `pptxgenjs` mapping fed by the same tokens for PPTX export instead of `html2pptx` or DOM Extractor.
**Wajah**: `html2pptx` is outdated and cannot handle complex layouts accurately. The DOM Extractor via Playwright is prone to environmental dependency issues (e.g., 404 driver downloads on Windows). The custom `pptxgenjs` approach natively guarantees high fidelity for our specific layout templates without external browser dependencies.
