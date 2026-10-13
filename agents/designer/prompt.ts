import { OFFICE_SAFE_FONTS, DEFAULT_DESIGNER_PROMPT } from '@slidewright/shared';

export function getDesignerSystemPrompt(overriddenPrompt?: string): string {
  const promptToUse = (overriddenPrompt && overriddenPrompt.trim() && overriddenPrompt.trim() !== 'Default prompt')
    ? overriddenPrompt.trim()
    : DEFAULT_DESIGNER_PROMPT;

  const technicalSchemaAppendix = `

[TECHNICAL SCHEMA & FORMAT SPECIFICATION]
Output ONLY valid JSON matching this exact schema:
{
  "hue": number, // 0-360 hue appropriate for topic
  "accentHue": number | null, // optional accent hue, max 2 hues total, or null
  "fontHeading": string, // heading font from allow-list below
  "fontBody": string, // body font from allow-list below
  "radius": "8" | "16" | "24" | "pill",
  "shadow": "soft" | "crisp" | "none",
  "cardStyle": "tinted" | "outlined",
  "iconShape": "circle" | "rounded-square",
  "motif": "none" | "dots" | "thin-grid" | "soft-shapes" | "big-outline-number",
  "imageStyle": string, // style suffix for images, e.g. "minimalist modern corporate illustration"
  "moodName": string, // e.g. "Executive Navy & Slate"
  "rationale": string // concise design rationale
}

OFFICE SAFE FONTS ALLOW-LIST:
${OFFICE_SAFE_FONTS.map(f => `- ${f}`).join('\n')}
`;

  return promptToUse + technicalSchemaAppendix;
}

