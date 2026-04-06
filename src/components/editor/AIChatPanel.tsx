import { useState, useRef, useEffect, useCallback } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { streamChat, ChatMessage } from '../../services/AIService'

interface UIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// AI action types
type AIAction = 'summarize' | 'translate' | 'polish' | 'explain' | 'continue' | 'custom'

// Quick command presets
const QUICK_COMMANDS: { id: AIAction; labelKey: string; prompt: string }[] = [
  { id: 'summarize', labelKey: 'ai.summarize', prompt: '请总结以下内容，简洁明了：\n\n' },
  { id: 'translate', labelKey: 'ai.translate', prompt: '请翻译成中文，保持原意：\n\n' },
  { id: 'polish', labelKey: 'ai.polish', prompt: '请润色以下文字，使其更加流畅优美：\n\n' },
  { id: 'explain', labelKey: 'ai.explain', prompt: '请解释以下代码或文本：\n\n' },
  { id: 'continue', labelKey: 'ai.continue', prompt: '请续写以下内容，保持风格一致：\n\n' },
]

// Typing indicator dots animation
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// Format timestamp
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Markdown-like formatting for messages
function MessageContent({ content }: { content: string }) {
  // Simple formatting: bold, italic, code
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-[var(--bg-primary)] rounded text-xs">$1</code>')

  return (
    <div
      className="whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}

// Local storage key for chat messages persistence
const CHAT_MESSAGES_KEY = 'prest-ai-chat-messages'
const CHAT_HEIGHT_KEY = 'prest-ai-chat-height'

// Load persisted messages from localStorage
function loadPersistedMessages(): UIChatMessage[] {
  try {
    const stored = localStorage.getItem(CHAT_MESSAGES_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return []
}

// Load persisted height from localStorage
function loadPersistedHeight(): number {
  try {
    const stored = localStorage.getItem(CHAT_HEIGHT_KEY)
    if (stored) {
      const height = parseInt(stored, 10)
      if (!isNaN(height) && height >= 200 && height <= 600) {
        return height
      }
    }
  } catch {
    // Ignore parse errors
  }
  return 384
}

export function AIChatPanel() {
  const { config, isChatOpen, setChatOpen, insertText, replaceSelection, editorInstance, settings } = useBoundStore()
  const { t } = useTranslation()
  const [messages, setMessages] = useState<UIChatMessage[]>(loadPersistedMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [chatHeight, setChatHeight] = useState(loadPersistedHeight) // Default 384px (96 * 4)
  const [isResizing, setIsResizing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastAssistantRef = useRef<string>('')
  const handleSubmitRef = useRef<((e?: React.FormEvent, promptOverride?: string) => Promise<void>) | null>(null)
  const isSubmittingRef = useRef(false) // Guard against double submission
  const requestIdRef = useRef<number>(0) // Unique request ID to prevent stale closures
  const resizeStartYRef = useRef(0)
  const resizeStartHeightRef = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)

  // Persist messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages))
    } catch {
      // Ignore storage errors
    }
  }, [messages])

  // Persist height to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HEIGHT_KEY, chatHeight.toString())
    } catch {
      // Ignore storage errors
    }
  }, [chatHeight])

  // Handle resize drag
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    resizeStartYRef.current = e.clientY
    resizeStartHeightRef.current = chatHeight
  }, [chatHeight])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizeStartYRef.current - e.clientY
      const newHeight = Math.min(Math.max(200, resizeStartHeightRef.current + delta), 600) // Min 200px, Max 600px
      setChatHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isChatOpen])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Track editor selection for replace button
  useEffect(() => {
    const checkSelection = () => {
      if (editorInstance) {
        const selection = editorInstance.getSelection()
        setHasSelection(!!selection && !selection.isEmpty())
      }
    }

    checkSelection()
    editorInstance?.onDidChangeCursorSelection(checkSelection)

    return () => {
      editorInstance?.onDidChangeCursorSelection(() => {})
    }
  }, [editorInstance])

  // Listen for AI action events from editor context menu
  useEffect(() => {
    const handleAIAction = (e: CustomEvent<{ action: AIAction; text: string }>) => {
      const { action, text } = e.detail

      // Prevent multiple concurrent submissions
      if (isSubmittingRef.current) return

      if (!isChatOpen) {
        setChatOpen(true)
      }

      // Build prompt based on action
      let prompt = ''
      switch (action) {
        case 'summarize':
          prompt = `请总结以下内容，简洁明了：\n\n${text}`
          break
        case 'translate':
          prompt = `请翻译成中文（或其他指定语言），保持原意：\n\n${text}`
          break
        case 'polish':
          prompt = `请润色以下文字，使其更加流畅优美：\n\n${text}`
          break
        case 'explain':
          prompt = `请解释以下内容：\n\n${text}`
          break
        case 'continue':
          prompt = `请续写以下内容，保持风格一致：\n\n${text}`
          break
        default:
          prompt = text
      }

      // Directly call handleSubmit with the prompt
      // Use setTimeout to ensure chat panel is open first
      setTimeout(() => {
        if (handleSubmitRef.current) {
          handleSubmitRef.current(undefined, prompt)
        }
      }, 100)
    }

    window.addEventListener('ai-action', handleAIAction as EventListener)
    return () => window.removeEventListener('ai-action', handleAIAction as EventListener)
  }, [isChatOpen, setChatOpen])

  const handleSubmit = useCallback(async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault()

    // Guard against double submission - check both flag and increment request ID
    if (isSubmittingRef.current) return

    // Generate unique request ID for this submission
    const currentRequestId = ++requestIdRef.current
    isSubmittingRef.current = true

    const currentInput = promptOverride || input
    if (!currentInput.trim() || isLoading) {
      isSubmittingRef.current = false
      return
    }

    if (!config.apiEndpoint || !config.apiKey) {
      setError(t?.ai?.notConfigured || 'AI API not configured')
      isSubmittingRef.current = false
      return
    }

    const userMessageId = Date.now().toString()
    const userMessage: UIChatMessage = {
      id: userMessageId,
      role: 'user',
      content: currentInput.trim(),
      timestamp: Date.now(),
    }

    // Clear input immediately to prevent double submission
    setInput('')
    setIsLoading(true)
    setError(null)

    // Add user message and placeholder for assistant
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantTimestamp = Date.now()

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: assistantTimestamp,
      },
    ])

    try {
      // Convert messages for API (use functional update to get latest messages)
      // Note: We only pass the NEW user message here; the streamChat handles history
      const apiMessages: ChatMessage[] = [
        {
          id: userMessage.id,
          role: 'user' as const,
          content: userMessage.content,
        },
      ]

      // Stream the response
      let assistantContent = ''
      for await (const chunk of streamChat(config, apiMessages)) {
        // Check if this is still the current request (not a stale one)
        if (currentRequestId !== requestIdRef.current) break
        assistantContent += chunk
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantContent }
              : msg
          )
        )
      }

      // Only store if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        lastAssistantRef.current = assistantContent
      }
    } catch (err) {
      // Only process error if this is still the current request
      if (currentRequestId !== requestIdRef.current) return
      const errorMessage = err instanceof Error ? err.message : 'AI request failed'
      setError(errorMessage)
      // Remove both user message and assistant placeholder if the request failed
      setMessages((prev) => prev.filter((m) => m.id !== userMessageId && m.id !== assistantMessageId))
    } finally {
      // Only reset if this is the current request
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false)
        isSubmittingRef.current = false
      }
    }
  }, [input, isLoading, config, t])

  // Store handleSubmit in ref for use in useEffect
  handleSubmitRef.current = handleSubmit

  // Insert content into editor
  const handleInsertToEditor = useCallback(() => {
    if (lastAssistantRef.current) {
      insertText(lastAssistantRef.current)
      lastAssistantRef.current = ''
    }
  }, [insertText])

  // Replace selected content in editor
  const handleReplaceToEditor = useCallback(() => {
    if (lastAssistantRef.current) {
      const success = replaceSelection(lastAssistantRef.current)
      if (success) {
        lastAssistantRef.current = ''
      }
    }
  }, [replaceSelection])

  // Copy message to clipboard
  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
  }, [])

  // Don't render if AI is not enabled
  if (!settings.aiEnabled) {
    return null
  }

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="absolute bottom-16 right-4 px-4 py-2 bg-[var(--accent-color)] text-white rounded-full shadow-lg hover:bg-[var(--accent-hover)] transition-colors z-50 flex items-center gap-2"
        title={t?.ai?.openChat || 'Open AI Chat'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>AI</span>
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col z-50 rounded-t-lg overflow-hidden"
      style={{ height: chatHeight }}
    >
      {/* Resize Handle */}
      <div
        className="h-6 flex items-center justify-center cursor-ns-resize hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
        onMouseDown={handleResizeStart}
      >
        <div className="w-12 h-1 bg-[var(--border-color)] rounded-full" />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-medium text-[var(--text-primary)]">{t?.ai?.chat || 'AI Assistant'}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-[var(--text-muted)]">{t?.ai?.online || 'Online'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastAssistantRef.current && (
            <>
              <button
                onClick={handleInsertToEditor}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
                title={t?.ai?.insertToEditor || 'Insert to editor'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t?.ai?.insert || 'Insert'}
              </button>
              {hasSelection && (
                <button
                  onClick={handleReplaceToEditor}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
                  title={t?.ai?.replace || 'Replace selection'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t?.ai?.replace || 'Replace'}
                </button>
              )}
            </>
          )}
          {!config.apiEndpoint && (
            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded animate-pulse">
              {t?.ai?.notConfigured || 'Not configured'}
            </span>
          )}
          <button
            onClick={() => {
              setMessages([])
              setError(null)
              lastAssistantRef.current = ''
            }}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded transition-colors"
            title={t?.ai?.clear || 'Clear chat'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded transition-colors"
            title={t?.ai?.close || 'Close'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-x-auto">
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd.id}
            onClick={() => {
              const prompt = cmd.prompt
              setInput(prompt)
              inputRef.current?.focus()
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full hover:bg-[var(--accent-color)] hover:text-white transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {cmd.id === 'summarize' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {cmd.id === 'translate' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            )}
            {cmd.id === 'polish' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
            {cmd.id === 'explain' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {cmd.id === 'continue' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
            {(t as unknown as Record<string, string>)?.[cmd.labelKey] || cmd.id}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-500/20 text-red-500 text-sm border-b border-red-500/30 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)] text-sm mb-1">{t?.ai?.welcome || 'Welcome to AI Assistant'}</p>
            <p className="text-[var(--text-muted)] text-xs">{t?.ai?.welcomeHint || 'I can help you write, summarize, translate and more'}</p>
          </div>
        )}
        {messages.filter((msg) => !(isLoading && msg.role === 'assistant' && msg.content === '')).map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user'
                ? 'bg-[var(--accent-color)]'
                : 'bg-[var(--bg-tertiary)]'
            }`}>
              {msg.role === 'user' ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
            </div>

            {/* Message bubble */}
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent-color)] text-white rounded-tr-md'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-tl-md'
                }`}
              >
                <MessageContent content={msg.content} />
              </div>
              <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-xs text-[var(--text-muted)]">{formatTime(msg.timestamp)}</span>
                {msg.content && (
                  <button
                    onClick={() => copyMessage(msg.content)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    title={t?.ai?.copy || 'Copy'}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-2xl rounded-tl-md px-4 py-3">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="ai-chat-form flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={t?.ai?.placeholder || 'Type your message...'}
            disabled={isLoading || !config.apiEndpoint}
            className="flex-1 px-4 py-2.5 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] disabled:opacity-50 transition-all"
          />
          <button
            type="button"
            onClick={() => {
              if (!isSubmittingRef.current) {
                handleSubmit()
              }
            }}
            disabled={isLoading || !input.trim() || !config.apiEndpoint}
            className="p-2.5 bg-[var(--accent-color)] text-white rounded-full hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
