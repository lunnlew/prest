import { StateCreator } from 'zustand'
import { AIConfig, AIMessage, AIConversation } from '../types'
import { sendChatMessage } from '../services/AIService'

export interface AISlice {
  // State
  config: AIConfig
  conversations: AIConversation[]
  currentConversationId: string | null
  isChatOpen: boolean
  isAILoading: boolean
  lastError: string | null

  // Actions
  setAIConfig: (config: Partial<AIConfig>) => void
  sendAIMessage: (content: string) => Promise<string | null>
  clearConversation: () => void
  toggleChat: () => void
  setChatOpen: (open: boolean) => void
  clearError: () => void
}

export const defaultAIConfig: AIConfig = {
  provider: 'custom',
  apiEndpoint: '',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
}

export const createAISlice: StateCreator<AISlice, [], [], AISlice> = (set, get) => ({
  config: defaultAIConfig,
  conversations: [],
  currentConversationId: null,
  isChatOpen: false,
  isAILoading: false,
  lastError: null,

  setAIConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  sendAIMessage: async (content) => {
    const { config, conversations, currentConversationId } = get()

    if (!config.apiEndpoint || !config.apiKey) {
      set({ lastError: 'AI API not configured' })
      return null
    }

    set({ isAILoading: true, lastError: null })

    try {
      // Find or create conversation
      let convId = currentConversationId
      let convs = [...conversations]

      if (!convId) {
        convId = Date.now().toString()
        convs.unshift({
          id: convId,
          messages: [],
          createdAt: Date.now(),
        })
      }

      // Add user message
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: Date.now(),
      }

      // Update conversation with user message
      convs = convs.map((c) =>
        c.id === convId ? { ...c, messages: [...c.messages, userMessage] } : c
      )
      set({ conversations: convs, currentConversationId: convId })

      // Get conversation messages for API
      const currentConv = convs.find((c) => c.id === convId)
      const apiMessages = currentConv?.messages || []

      // Call AI API via AIService
      const result = await sendChatMessage(config, apiMessages)

      if (result.error) {
        set({ lastError: result.error, isAILoading: false })
        return null
      }

      // Add assistant message
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
      }

      // Update conversation with assistant message
      convs = convs.map((c) =>
        c.id === convId ? { ...c, messages: [...c.messages, assistantMessage] } : c
      )
      set({ conversations: convs, isAILoading: false })

      return result.text
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI request failed'
      set({ lastError: errorMessage, isAILoading: false })
      return null
    }
  },

  clearConversation: () =>
    set((state) => {
      if (!state.currentConversationId) return state
      return {
        conversations: state.conversations.filter(
          (c) => c.id !== state.currentConversationId
        ),
        currentConversationId: null,
      }
    }),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  setChatOpen: (open) => set({ isChatOpen: open }),

  clearError: () => set({ lastError: null }),
})
