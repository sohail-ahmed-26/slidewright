# Project Rules (pichli ghaltiyan dobara nahi honi chahiye)

1. Kisi bhi kaam ko "done" tab kahein jab screenshot ya test output saath ho.
2. Preview aur PPTX ek hi HTML/CSS renderer se bante hain. Doosra layout engine nahi.
3. Components mein hardcoded rang ya size nahi: sirf design tokens (CSS variables).
4. Text overflow asli browser (Playwright) se napa jaye, character count ke andaze se nahi.
5. Minimum text size: body 16pt, card text 14pt, caption 12pt.
6. Koi working file git commit ke baghair overwrite na ho. Har step ke baad commit.
7. Har agent ka output zod se validate: ek retry (error ke saath), phir saaf error. Har agent run DB mein log ho.
8. Mock mode (USE_MOCK_LLM=true) hamesha kaam kare, API key ke baghair bhi.
9. Sirf OpenRouter ek API. Provider ka code sirf agents/llm/ mein.
10. Playwright screenshots installed Chrome/Edge se (channel), browser download nahi.
11. Design benchmark: references/devsil_reference.pptx (clean, ek rang ka family, rounded tinted cards, soft shadows, dark bookend slides).
12. Faislay docs/DECISIONS.md mein likhein. User se sirf tab poochhein jab sach mein atak jayein.
13. Generated files sirf outputs/ mein jayen, kahin aur nahi.
