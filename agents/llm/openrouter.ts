// ONE client for everything (text, JSON, vision, image) via OpenRouter.
// TODO (Prompt 0/1):
//  - callLLM({ agent, system, user, images?, schema }) -> POST {baseUrl}/chat/completions
//    use response_format { type: "json_schema" } and provider.require_parameters = true
//    validate with zod, 1 retry with the error appended, log tokens + ms
//  - generateImage({ prompt, aspectRatio }) -> same endpoint with modalities ["image","text"]
//    save PNG into outputs/images (hash cache in outputs/cache)
//  - mock mode (USE_MOCK_LLM=true): return fixtures / placeholder PNG, no network
export async function callLLM(_args: unknown): Promise<never> { throw new Error("TODO"); }
export async function generateImage(_args: unknown): Promise<never> { throw new Error("TODO"); }
