# Placeholders

This document tracks deliberately unimplemented behaviors that require backend integration.

## UI Features
- **Job Status Stream**: The `RunJob` progress relies on a mock interval. It will need to subscribe to SSE/WebSockets for real task status.
- **Export to PPTX**: Returns a mock file path. Will need to actually call `backend/export` to generate the `.pptx` file.
- **Settings Persistence**: User settings (theme, configurations) are mocked. They need a backend schema if they are meant to roam, otherwise `localStorage` is fine.
- **Agent Testing**: `runAgentTest` returns fixed JSON. Will need the actual LLM orchestrator loop to run.
- **Save/Reset Agent Prompts**: Mock API ignores changes. Will need DB writes to update `schema.prisma` -> `AgentConfig`.

## Data Models
- None yet. Models exist in `schema.prisma` but the frontend mocks are entirely detached from them.
