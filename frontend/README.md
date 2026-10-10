# frontend/  (jo user dekhta hai)
React + Vite + TypeScript + Tailwind.

- `src/app/`                 app shell, routes
- `src/lib/`                 api client (backend se baat), helpers
- `src/components/slide/`    SLIDE RENDERER: layouts, cards, icons, FooterBar (preview aur PPTX export dono yahin se)
- `src/components/ui/`       buttons, inputs, modal (general UI)
- `src/features/generate/`   prompt form (topic, audience, language, slides)
- `src/features/orchestration/` live pipeline screen (Orchestrator -> Writer -> Designer -> Visuals -> Critic -> Export)
- `src/features/deck/`       deck viewer, thumbnails, quality panel, restyle, download PPTX
- `src/features/present/`    fullscreen present mode + animations

Rule: slides ke rang/size sirf design tokens (CSS variables) se aayen.
