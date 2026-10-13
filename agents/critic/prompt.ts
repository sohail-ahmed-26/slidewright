import { DEFAULT_CRITIC_PROMPT } from '@slidewright/shared';

export function getCriticSystemPrompt(overriddenPrompt?: string): string {
  const promptToUse = (overriddenPrompt && overriddenPrompt.trim() && overriddenPrompt.trim() !== 'Default prompt')
    ? overriddenPrompt.trim()
    : DEFAULT_CRITIC_PROMPT;

  const technicalSchemaAppendix = `

[TECHNICAL SCHEMA SPECIFICATION]
Output a strictly valid JSON object matching this schema:
{
  "score": number, // 0 to 100 based on the scoring rubric
  "feedback": "Overall summary of your critique",
  "criterionScores": {
    "contentQuality": number, // 0-20
    "layoutComposition": number, // 0-20
    "visualAssets": number, // 0-15
    "typographyReadability": number, // 0-15
    "colorDesignConsistency": number, // 0-10
    "structureStorytelling": number, // 0-10
    "professionalPolish": number // 0-10
  },
  "issues": [
    {
      "slideId": "slide_id", // optional, omit if global
      "type": "content" | "design" | "visual" | "layout" | "global",
      "severity": "high" | "medium" | "low",
      "message": "Specific actionable feedback",
      "suggestedFix": "Concrete suggestion for the next agent iteration"
    }
  ],
  "approved": boolean // true if score >= 80 and no critical issues
}
`;

  return promptToUse + technicalSchemaAppendix;
}

export const criticSystemPrompt = getCriticSystemPrompt();

