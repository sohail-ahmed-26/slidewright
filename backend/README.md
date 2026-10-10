# backend/  (server, database, orchestration)
Node.js + Express + Prisma + PostgreSQL.

- `prisma/schema.prisma`   database tables
- `src/api/`               HTTP routes (decks, jobs, export) + SSE live events
- `src/orchestrator/`      PURE CODE state machine: kaun sa agent kab chale, retry, resume, cancel (LLM nahi)
- `src/db/`                Prisma client + queries
- `src/export/`            PPTX export (Playwright -> pptxgenjs), LLM nahi
- `src/services/`          files save karna (outputs/), screenshots, helpers

Backend agents ko `@slidewright/agents` se import karta hai. Generated files sirf `outputs/` mein.
