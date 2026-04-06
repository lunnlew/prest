import OpenAI from 'openai'
import { AIConfig } from '../types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIStreamResult {
  text: string
  error?: string
}

// Create OpenAI client with custom endpoint
function createOpenAIClient(config: AIConfig): OpenAI {
  // Strip /chat/completions suffix if user already included it in the endpoint
  let baseURL = config.apiEndpoint
  if (baseURL.endsWith('/chat/completions')) {
    baseURL = baseURL.slice(0, -'/chat/completions'.length)
  }

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL,
    dangerouslyAllowBrowser: true, // Required for browser usage with custom endpoints
  })
}

/**
 * Send a streaming chat request using OpenAI SDK
 */
export async function* streamChat(
  config: AIConfig,
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  if (!config.apiEndpoint || !config.apiKey) {
    throw new Error('AI API not configured')
  }

  const client = createOpenAIClient(config)

  const stream = await client.chat.completions.create({
    model: config.model || 'gpt-3.5-turbo',
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

/**
 * Send a chat request and get full response (non-streaming)
 */
export async function sendChatMessage(
  config: AIConfig,
  messages: ChatMessage[]
): Promise<AIStreamResult> {
  if (!config.apiEndpoint || !config.apiKey) {
    return { text: '', error: 'AI API not configured' }
  }

  try {
    const client = createOpenAIClient(config)

    const response = await client.chat.completions.create({
      model: config.model || 'gpt-3.5-turbo',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    })

    const text = response.choices[0]?.message?.content || ''
    return { text }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Network error'
    return { text: '', error: errorMessage }
  }
}
