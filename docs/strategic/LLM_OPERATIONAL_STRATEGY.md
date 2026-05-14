# LLM OPERATIONAL STRATEGY

## 1. Cost & Performance
- **Caching**: Cache identical prompt outputs for 1 hour to reduce API costs.
- **Routing**: Fast models (GPT-4o-mini / Gemini-flash) for status updates; Smart models (GPT-4o / Gemini-pro) for complex planning.

## 2. Safety & Integrity
- **JSON Enforcement**: Force structured output using instructor or model constraints.
- **Injection Protection**: System prompts stored in secure vaults, not dynamically concatenated with user input.
- **Validation**: Post-generation check of AI plans against the Policy Engine.

## 3. Fallbacks
- If Primary model fails: Switch to Secondary provider (e.g., OpenAI → Anthropic fallback).
- If all AI fails: Revert to rule-based deterministic dispatch (Legacy mode).
