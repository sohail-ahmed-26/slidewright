import { DEFAULT_WRITER_PROMPT } from '@slidewright/shared';

export function getWriterSystemPrompt(overriddenPrompt?: string): string {
  const promptToUse = (overriddenPrompt && overriddenPrompt.trim() && overriddenPrompt.trim() !== 'Default prompt')
    ? overriddenPrompt.trim()
    : DEFAULT_WRITER_PROMPT;

  const technicalSchemaAppendix = `

[TECHNICAL SCHEMA & OUTPUT SPECIFICATION]
Output strictly valid JSON matching this exact structure:
{
  "slides": [
    { "layout": "layout_name", "data": { ... } }
  ]
}

AVAILABLE LAYOUTS AND DATA SCHEMAS:
- cover: { "title": "string", "subtitle": "string", "orgName": "string", "date": "string" }
- agenda: { "title": "string", "subtitle": "string", "items": [{"title": "string", "body": "string"}] } // 3-4 agenda pillars/topics
- title_body: { "title": "string", "body": "string", "points": ["string"] }
- two_cards: { "title": "string", "cards": [{"title": "string", "body": "string"}] } // exactly 2 cards
- cards_3_bar: { "title": "string", "cards": [{"title": "string", "body": "string"}] } // exactly 3 cards
- grid_2x2: { "title": "string", "cards": [{"icon": "LucideIconName", "title": "string", "body": "string"}] } // exactly 4 cards
- process_steps: { "title": "string", "steps": [{"title": "string", "body": "string"}] } // 3-4 steps
- timeline: { "title": "string", "events": [{"date": "string", "title": "string", "body": "string"}] } // 3-4 chronological events
- comparison: { "title": "string", "left": {"title": "string", "points": ["string"]}, "right": {"title": "string", "points": ["string"]} }
- stats: { "title": "string", "stats": [{"number": "string", "label": "string", "subtext": "string"}] } // 3 metrics
- diagram: { "title": "string", "description": "string" }
- image_split: { "title": "string", "text": "string" }
- icon_rows: { "title": "string", "rows": [{"icon": "LucideIconName", "title": "string", "body": "string"}] } // 3-4 rows
- dark_panel_points: { "darkPanel": {"title": "string", "subtitle": "string"}, "points": [{"title": "string", "body": "string"}] }
- closing: { "message": "string", "contact": "string" }

MANDATORY PRESENTATION NARRATIVE FLOW:
1. Slide 1 (First Slide): MUST be layout "cover". Topic title, executive subtitle, orgName, date.
2. Slide 2 (Second Slide): MUST be layout "agenda". Titled "Executive Agenda & Roadmap" or topic-specific equivalent. List 3 to 4 pillars explaining what will be covered in this presentation.
3. Slides 3 to N-2 (Deep Dives): Structured content with full-page layouts (comparison, process_steps, grid_2x2, two_cards, cards_3_bar, image_split, diagram). Write rich, substantive, multi-sentence explanations with clear structure and visualizations.
4. Slide N-1 (Impact / Metrics): Use layout "stats" or "big_number_dark" to present quantitative metrics, ROI, or impact data.
5. Slide N (Final Slide): MUST be layout "closing". Key takeaways and next steps.
`;

  return promptToUse + technicalSchemaAppendix;
}

