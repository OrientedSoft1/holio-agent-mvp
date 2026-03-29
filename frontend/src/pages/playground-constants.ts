import {
  Sparkles,
  Code,
  PenLine,
  BarChart3,
  Headphones,
  Languages,
  type LucideIcon,
} from 'lucide-react'

export interface ModelMeta {
  maxTokens: number
  tier: 'fast' | 'balanced' | 'powerful'
  provider: string
}

export const MODEL_METADATA: Record<string, ModelMeta> = {
  'us.anthropic.claude-opus-4-6-v1': { maxTokens: 128000, tier: 'powerful', provider: 'Anthropic' },
  'us.anthropic.claude-opus-4-5-20251101-v1:0': { maxTokens: 128000, tier: 'powerful', provider: 'Anthropic' },
  'us.anthropic.claude-opus-4-1-20250805-v1:0': { maxTokens: 128000, tier: 'powerful', provider: 'Anthropic' },
  'us.anthropic.claude-sonnet-4-6': { maxTokens: 64000, tier: 'balanced', provider: 'Anthropic' },
  'us.anthropic.claude-sonnet-4-5-20250929-v1:0': { maxTokens: 64000, tier: 'balanced', provider: 'Anthropic' },
  'us.anthropic.claude-sonnet-4-20250514-v1:0': { maxTokens: 64000, tier: 'balanced', provider: 'Anthropic' },
  'us.anthropic.claude-haiku-4-5-20251001-v1:0': { maxTokens: 64000, tier: 'fast', provider: 'Anthropic' },
  'us.anthropic.claude-3-5-sonnet-20241022-v2:0': { maxTokens: 8192, tier: 'balanced', provider: 'Anthropic' },
  'us.anthropic.claude-3-5-haiku-20241022-v1:0': { maxTokens: 8192, tier: 'fast', provider: 'Anthropic' },
  'us.anthropic.claude-3-haiku-20240307-v1:0': { maxTokens: 4096, tier: 'fast', provider: 'Anthropic' },
  'us.amazon.nova-premier-v1:0': { maxTokens: 25000, tier: 'powerful', provider: 'Amazon' },
  'us.amazon.nova-pro-v1:0': { maxTokens: 5120, tier: 'balanced', provider: 'Amazon' },
  'us.amazon.nova-2-lite-v1:0': { maxTokens: 5120, tier: 'fast', provider: 'Amazon' },
  'us.amazon.nova-lite-v1:0': { maxTokens: 5120, tier: 'fast', provider: 'Amazon' },
  'us.amazon.nova-micro-v1:0': { maxTokens: 5120, tier: 'fast', provider: 'Amazon' },
  'us.meta.llama4-maverick-17b-instruct-v1:0': { maxTokens: 16384, tier: 'balanced', provider: 'Meta' },
  'us.meta.llama4-scout-17b-instruct-v1:0': { maxTokens: 16384, tier: 'balanced', provider: 'Meta' },
  'us.meta.llama3-3-70b-instruct-v1:0': { maxTokens: 8192, tier: 'balanced', provider: 'Meta' },
  'us.meta.llama3-1-70b-instruct-v1:0': { maxTokens: 8192, tier: 'balanced', provider: 'Meta' },
  'us.meta.llama3-1-8b-instruct-v1:0': { maxTokens: 8192, tier: 'fast', provider: 'Meta' },
  'mistral.mistral-large-2407-v1:0': { maxTokens: 8192, tier: 'balanced', provider: 'Mistral' },
  'mistral.mistral-small-2402-v1:0': { maxTokens: 8192, tier: 'fast', provider: 'Mistral' },
  'cohere.command-r-plus-v1:0': { maxTokens: 4096, tier: 'balanced', provider: 'Cohere' },
  'cohere.command-r-v1:0': { maxTokens: 4096, tier: 'fast', provider: 'Cohere' },
  'ai21.jamba-1-5-large-v1:0': { maxTokens: 4096, tier: 'balanced', provider: 'AI21' },
  'ai21.jamba-1-5-mini-v1:0': { maxTokens: 4096, tier: 'fast', provider: 'AI21' },
  'gpt-4.1': { maxTokens: 32768, tier: 'powerful', provider: 'OpenAI' },
  'gpt-4.1-mini': { maxTokens: 16384, tier: 'balanced', provider: 'OpenAI' },
  'gpt-4.1-nano': { maxTokens: 16384, tier: 'fast', provider: 'OpenAI' },
  'gpt-4o': { maxTokens: 16384, tier: 'powerful', provider: 'OpenAI' },
  'gpt-4o-mini': { maxTokens: 16384, tier: 'fast', provider: 'OpenAI' },
  'o3-mini': { maxTokens: 16384, tier: 'balanced', provider: 'OpenAI' },
  'gemini-2.5-pro': { maxTokens: 65536, tier: 'powerful', provider: 'Google' },
  'gemini-2.5-flash': { maxTokens: 65536, tier: 'fast', provider: 'Google' },
  'gemini-2.0-flash-lite': { maxTokens: 8192, tier: 'fast', provider: 'Google' },
}

export function getModelMeta(modelId: string): ModelMeta {
  return MODEL_METADATA[modelId] ?? { maxTokens: 4096, tier: 'balanced', provider: 'Other' }
}

export const TIER_CONFIG = {
  fast: { label: 'Fast', color: 'bg-emerald-100 text-emerald-700' },
  balanced: { label: 'Balanced', color: 'bg-blue-100 text-blue-700' },
  powerful: { label: 'Powerful', color: 'bg-purple-100 text-purple-700' },
} as const

export const CURATED_MODELS = [
  { id: 'us.anthropic.claude-opus-4-6-v1', label: 'Claude Opus 4.6' },
  { id: 'us.anthropic.claude-opus-4-5-20251101-v1:0', label: 'Claude Opus 4.5' },
  { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0', label: 'Claude Opus 4.1' },
  { id: 'us.anthropic.claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { id: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0', label: 'Claude Sonnet 4.5' },
  { id: 'us.anthropic.claude-sonnet-4-20250514-v1:0', label: 'Claude Sonnet 4' },
  { id: 'us.anthropic.claude-haiku-4-5-20251001-v1:0', label: 'Claude Haiku 4.5' },
  { id: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0', label: 'Claude 3.5 Sonnet v2' },
  { id: 'us.anthropic.claude-3-5-haiku-20241022-v1:0', label: 'Claude 3.5 Haiku' },
  { id: 'us.anthropic.claude-3-haiku-20240307-v1:0', label: 'Claude 3 Haiku' },
  { id: 'us.amazon.nova-premier-v1:0', label: 'Amazon Nova Premier' },
  { id: 'us.amazon.nova-pro-v1:0', label: 'Amazon Nova Pro' },
  { id: 'us.amazon.nova-2-lite-v1:0', label: 'Amazon Nova 2 Lite' },
  { id: 'us.amazon.nova-lite-v1:0', label: 'Amazon Nova Lite' },
  { id: 'us.amazon.nova-micro-v1:0', label: 'Amazon Nova Micro' },
  { id: 'us.meta.llama4-maverick-17b-instruct-v1:0', label: 'Llama 4 Maverick' },
  { id: 'us.meta.llama4-scout-17b-instruct-v1:0', label: 'Llama 4 Scout' },
  { id: 'us.meta.llama3-3-70b-instruct-v1:0', label: 'Llama 3.3 70B Instruct' },
  { id: 'us.meta.llama3-1-70b-instruct-v1:0', label: 'Llama 3.1 70B Instruct' },
  { id: 'us.meta.llama3-1-8b-instruct-v1:0', label: 'Llama 3.1 8B Instruct' },
  { id: 'mistral.mistral-large-2407-v1:0', label: 'Mistral Large (24.07)' },
  { id: 'mistral.mistral-small-2402-v1:0', label: 'Mistral Small' },
  { id: 'cohere.command-r-plus-v1:0', label: 'Cohere Command R+' },
  { id: 'cohere.command-r-v1:0', label: 'Cohere Command R' },
  { id: 'ai21.jamba-1-5-large-v1:0', label: 'AI21 Jamba 1.5 Large' },
  { id: 'ai21.jamba-1-5-mini-v1:0', label: 'AI21 Jamba 1.5 Mini' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'o3-mini', label: 'o3-mini' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
]

export interface PromptTemplate {
  label: string
  icon: LucideIcon
  prompt: string
}

export const SYSTEM_PROMPT_TEMPLATES: PromptTemplate[] = [
  { label: 'Helpful Assistant', icon: Sparkles, prompt: 'You are a helpful assistant. Answer questions clearly and concisely.' },
  { label: 'Code Assistant', icon: Code, prompt: 'You are an expert software engineer. Help with code questions, debugging, and writing clean, efficient code. Always explain your reasoning and suggest best practices.' },
  { label: 'Creative Writer', icon: PenLine, prompt: 'You are a creative writing assistant. Help with storytelling, copywriting, and creative content. Use vivid language and engaging narratives.' },
  { label: 'Data Analyst', icon: BarChart3, prompt: 'You are a data analysis expert. Help interpret data, suggest visualizations, write queries, and explain statistical concepts in plain language.' },
  { label: 'Customer Support', icon: Headphones, prompt: 'You are a professional customer support agent. Be empathetic, solution-oriented, and always maintain a friendly, helpful tone. Escalate complex issues appropriately.' },
  { label: 'Translator', icon: Languages, prompt: 'You are a professional translator. Translate text accurately while preserving tone, idioms, and cultural context. Ask for the target language if not specified.' },
]

export const QUICK_START_SUGGESTIONS = [
  'Explain how AI agents work in simple terms',
  'Write a professional email template for client outreach',
  'Help me brainstorm marketing ideas for a new product',
  "Summarize the key points of a document I'll paste",
]

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(tokens >= 10000 ? 0 : 1)}k`
  return tokens.toString()
}

export function tokenToWordEstimate(tokens: number): string {
  const words = Math.round(tokens * 0.75)
  if (words >= 1000) return `~${(words / 1000).toFixed(1)}k words`
  return `~${words} words`
}

export function groupModelsByProvider(
  models: { id: string; label: string }[],
): Record<string, { id: string; label: string }[]> {
  const groups: Record<string, { id: string; label: string }[]> = {}
  for (const m of models) {
    const provider = getModelMeta(m.id).provider
    if (!groups[provider]) groups[provider] = []
    groups[provider].push(m)
  }
  return groups
}
