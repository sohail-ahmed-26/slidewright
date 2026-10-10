# Architecture

Pipeline:
Orchestrator (code, no LLM)
  -> Writer (LLM)  ||  Designer (LLM)      [parallel]
  -> Visuals (LLM + image tool)
  -> Critic (code checks + vision LLM, loop max 3)
  -> Export (code, no LLM)  -> outputs/pptx

Why only 4 LLM agents: fixed workflow beats autonomous agents for a predictable task.
Preview and PPTX come from the same React renderer (export mode, Playwright -> pptxgenjs).
