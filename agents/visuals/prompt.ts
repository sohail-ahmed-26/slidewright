import { DEFAULT_VISUAL_PROMPT } from '@slidewright/shared';

export function getVisualsSystemPrompt(overriddenPrompt?: string): string {
  const promptToUse = (overriddenPrompt && overriddenPrompt.trim() && overriddenPrompt.trim() !== 'Default prompt')
    ? overriddenPrompt.trim()
    : DEFAULT_VISUAL_PROMPT;

  const technicalSchemaAppendix = `

[TECHNICAL SCHEMA SPECIFICATION]
Output ONLY valid JSON matching this exact schema:
{
  "slides": [
    {
      "slideId": "string",
      "diagram": {
        "type": "flow" | "cycle" | "timeline" | "hierarchy" | "matrix_2x2" | "venn" | "layers" | "funnel",
        "nodes": [
          { "id": "1", "label": "Short Label", "icon": "LucideIconName" }
        ],
        "caption": "Optional Caption",
        "altText": "Descriptive Alt Text"
      },
      "image": {
        "useImage": true,
        "prompt": "Detailed photorealistic / illustrative prompt",
        "fallback": "icon_composition" | "none",
        "alt": "Image description",
        "placement": "left" | "right" | "background" | "center"
      }
    }
  ]
}
Note: If a slide uses a diagram, set image to null. If it uses an image, set diagram to null. If neither is needed, set both to null.
`;

  return promptToUse + technicalSchemaAppendix;
}

