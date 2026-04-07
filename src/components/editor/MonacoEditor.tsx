import { useRef, useEffect, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Editor, { OnMount } from '@monaco-editor/react'
import { useTranslation } from '../../hooks/useTranslation'
import { useBoundStore } from '../../stores'
import type * as Monaco from 'monaco-editor'

// Map app theme to Monaco editor theme
const themeMap: Record<string, string> = {
  dark: 'prest-dark',
  light: 'prest-light',
  blue: 'prest-blue',
  purple: 'prest-purple',
  green: 'prest-green',
}

export function MonacoEditor() {
  const {
    content,
    settings,
    cursorPosition,
  } = useBoundStore(
    useShallow((state) => ({
      content: state.content,
      settings: state.settings,
      cursorPosition: state.cursorPosition,
    }))
  )
  const setContent = useBoundStore(state => state.setContent)
  const setCursorPosition = useBoundStore(state => state.setCursorPosition)
  const setEditorInstance = useBoundStore(state => state.setEditorInstance)
  const insertText = useBoundStore(state => state.insertText)
  const { t } = useTranslation()

  // Ref for drag state tracking
  const isDraggingRef = useRef(false)
  const isInternalChange = useRef(false)
  const monacoRef = useRef<typeof Monaco | null>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)

  // Sync external cursor position changes (e.g. outline click) to Monaco editor
  useEffect(() => {
    if (!t) return // Guard against null t during initial load

    const editor = useBoundStore.getState().editorInstance
    if (!editor) return

    // Skip if no cursor position to sync
    if (!cursorPosition.line || !cursorPosition.column) return

    const current = editor.getPosition()
    // Only update if the target position is different from current
    if (!current) return
    if (
      cursorPosition.line === current.lineNumber &&
      cursorPosition.column === current.column
    ) return

    // Skip if we're already in the middle of an internal change
    if (isInternalChange.current) return

    isInternalChange.current = true
    editor.setPosition({
      lineNumber: cursorPosition.line,
      column: cursorPosition.column,
    })
    editor.revealLineInCenter(cursorPosition.line)
    editor.focus()

    // Use setTimeout instead of requestAnimationFrame for more reliable reset
    setTimeout(() => {
      isInternalChange.current = false
    }, 0)
  }, [cursorPosition])

  // Update Monaco editor theme when app theme changes
  useEffect(() => {
    const editor = useBoundStore.getState().editorInstance
    if (!editor || !monacoRef.current) return
    monacoRef.current.editor.setTheme(themeMap[settings.theme] || 'prest-dark')
  }, [settings.theme])

  // Register Markdown completion provider
  const registerCompletionProvider = (monaco: typeof Monaco) => {
    monaco.languages.registerCompletionItemProvider('markdown-prest', {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        const suggestions: Monaco.languages.CompletionItem[] = []

        // Heading completions
        if (textUntilPosition.startsWith('#')) {
          const headingLevel = (textUntilPosition.match(/^#+/) || [''])[0].length
          if (headingLevel <= 6) {
            suggestions.push({
              label: `Heading ${headingLevel}`,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ` ${textUntilPosition.replace(/^#+/, '')}$0`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: `Insert heading level ${headingLevel}`,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            })
          }
        }

        // Trigger completions with specific prefixes
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        // Common Markdown snippets
        const snippets: Monaco.languages.CompletionItem[] = [
          {
            label: 'bold',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '**${1:text}**',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Bold text',
            range,
          },
          {
            label: 'italic',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '*${1:text}*',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Italic text',
            range,
          },
          {
            label: 'strikethrough',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '~~${1:text}~~',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Strikethrough text',
            range,
          },
          {
            label: 'highlight',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '==${1:text}==',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Highlighted text (Obsidian syntax)',
            range,
          },
          {
            label: 'code',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '`${1:code}`',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Inline code',
            range,
          },
          {
            label: 'codeblock',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '```${1:language}\n${2:code}\n```',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Code block',
            range,
          },
          {
            label: 'link',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[${1:text}](url)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Link',
            range,
          },
          {
            label: 'image',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '![${1:alt}](url)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Image',
            range,
          },
          {
            label: 'quote',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '> ${1:quote}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Blockquote',
            range,
          },
          {
            label: 'list',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '- ${1:item}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Bullet list item',
            range,
          },
          {
            label: 'orderedlist',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '1. ${1:item}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Ordered list item',
            range,
          },
          {
            label: 'task',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '- [ ] ${1:task}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Task list item (unchecked)',
            range,
          },
          {
            label: 'taskdone',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '- [x] ${1:task}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Task list item (checked)',
            range,
          },
          {
            label: 'hr',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\n---\n',
            documentation: 'Horizontal rule',
            range,
          },
          {
            label: 'table',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '| ${1:Header 1} | ${2:Header 2} |\n|----------|----------|\n| ${3:Cell 1} | ${4:Cell 2} |',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Markdown table',
            range,
          },
          {
            label: 'alignleft',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div align="left">\n\n${1:text}\n\n</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Left aligned text',
            range,
          },
          {
            label: 'aligncenter',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div align="center">\n\n${1:text}\n\n</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Center aligned text',
            range,
          },
          {
            label: 'alignright',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div align="right">\n\n${1:text}\n\n</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Right aligned text',
            range,
          },
        ]

        return { suggestions: [...suggestions, ...snippets] }
      },
    })
  }

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Store editor instance for toolbar access
    setEditorInstance(editor)
    // Store monaco instance for theme changes
    monacoRef.current = monaco
    // Register custom Markdown language
    monaco.languages.register({ id: 'markdown-prest' })

    // Register completion provider for Markdown
    registerCompletionProvider(monaco)

    // Set syntax highlighting rules
    monaco.languages.setMonarchTokensProvider('markdown-prest', {
      tokenizer: {
        root: [
          // Headings
          [/^#{1,6}\s+.*$/, 'keyword'],

          // Bold
          [/\*\*[^*]+\*\*/, 'strong'],
          [/__[^_]+__/, 'strong'],

          // Italic
          [/\*[^*]+\*/, 'emphasis'],
          [/_[^_]+_/, 'emphasis'],

          // Strikethrough
          [/~~[^~]+~~/, 'strikethrough'],

          // Code blocks
          [/```[\s\S]*?```/, 'string'],

          // Inline code
          [/`[^`]+`/, 'constant'],

          // Links - simplified to be more permissive
          [/\[.+?\]\(.+?\)/, 'link'],

          // Images - simplified to be more permissive
          [/!\[[^\]]*\]\(.+?\)/, 'constant'],

          // Blockquotes
          [/^>\s+.*$/, 'comment'],

          // Lists
          [/^[-*+]\s+/, 'variable'],
          [/^\d+\.\s+/, 'variable'],

          // Horizontal rule
          [/^[-*_]{3,}$/, 'comment'],

          // HTML tags
          [/<\/?[^>]+>/, 'tag'],
        ],
      },
    })

    // Set theme colors - prest-dark
    monaco.editor.defineTheme('prest-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'strong', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'emphasis', foreground: 'CE9178', fontStyle: 'italic' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'constant', foreground: 'DCDCAA' },
        { token: 'link', foreground: '6A9955' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'strikethrough', foreground: '808080' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#2a2d2e',
      },
    })

    // prest-light
    monaco.editor.defineTheme('prest-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'strong', foreground: '098658', fontStyle: 'bold' },
        { token: 'emphasis', foreground: 'A31515', fontStyle: 'italic' },
        { token: 'string', foreground: 'A31515' },
        { token: 'constant', foreground: '795E26' },
        { token: 'link', foreground: '795E26' },
        { token: 'comment', foreground: '008000' },
        { token: 'variable', foreground: '001080' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editorLineNumber.foreground': '#999999',
        'editorLineNumber.activeForeground': '#333333',
        'editor.selectionBackground': '#add6ff',
      },
    })

    // prest-blue (GitHub dark)
    monaco.editor.defineTheme('prest-blue', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'FF7B72', fontStyle: 'bold' },
        { token: 'strong', foreground: '7EE787', fontStyle: 'bold' },
        { token: 'emphasis', foreground: 'FFA657', fontStyle: 'italic' },
        { token: 'string', foreground: 'A5D6FF' },
        { token: 'constant', foreground: '79C0FF' },
        { token: 'link', foreground: '7EE787' },
        { token: 'comment', foreground: '8B949E' },
        { token: 'variable', foreground: 'FFA657' },
        { token: 'tag', foreground: '7EE787' },
        { token: 'strikethrough', foreground: '6E7681' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#c9d1d9',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#161b22',
      },
    })

    // prest-purple (Catppuccin Mocha)
    monaco.editor.defineTheme('prest-purple', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'CBA6F7', fontStyle: 'bold' },
        { token: 'strong', foreground: 'A6E3A1', fontStyle: 'bold' },
        { token: 'emphasis', foreground: 'FAB387', fontStyle: 'italic' },
        { token: 'string', foreground: 'A6E3A1' },
        { token: 'constant', foreground: '89DCEB' },
        { token: 'link', foreground: 'A6E3A1' },
        { token: 'comment', foreground: '6C7086' },
        { token: 'variable', foreground: 'F9E2AF' },
        { token: 'tag', foreground: 'CBA6F7' },
        { token: 'strikethrough', foreground: '6C7086' },
      ],
      colors: {
        'editor.background': '#1e1e2e',
        'editor.foreground': '#cdd6f4',
        'editorLineNumber.foreground': '#6c7086',
        'editorLineNumber.activeForeground': '#cdd6f4',
        'editor.selectionBackground': '#45475a',
        'editor.lineHighlightBackground': '#313244',
      },
    })

    // prest-green
    monaco.editor.defineTheme('prest-green', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '4ade80', fontStyle: 'bold' },
        { token: 'strong', foreground: '86efac', fontStyle: 'bold' },
        { token: 'emphasis', foreground: 'fbbf24', fontStyle: 'italic' },
        { token: 'string', foreground: '86efac' },
        { token: 'constant', foreground: '67e8f9' },
        { token: 'link', foreground: '86efac' },
        { token: 'comment', foreground: '737373' },
        { token: 'variable', foreground: 'fde047' },
        { token: 'tag', foreground: '4ade80' },
        { token: 'strikethrough', foreground: '737373' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.foreground': '#e4e4e4',
        'editorLineNumber.foreground': '#737373',
        'editorLineNumber.activeForeground': '#e4e4e4',
        'editor.selectionBackground': '#14532d',
        'editor.lineHighlightBackground': '#2d2d2d',
      },
    })

    // Apply theme based on current app theme
    const themeMap: Record<string, string> = {
      dark: 'prest-dark',
      light: 'prest-light',
      blue: 'prest-blue',
      purple: 'prest-purple',
      green: 'prest-green',
    }
    monaco.editor.setTheme(themeMap[settings.theme] || 'prest-dark')

    // Set language
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, 'markdown-prest')
    }

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      // Ignore internal changes (when we programmatically set position)
      if (isInternalChange.current) return
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      })

      // Typewriter mode: keep cursor line centered in viewport
      if (useBoundStore.getState().typewriterMode) {
        editor.revealLineInCenter(e.position.lineNumber)
      }
    })

    // Track editor scroll for sync scroll feature
    // Completely skip updates during drag to avoid any performance issues
    editor.onDidScrollChange((e) => {
      // Skip all scroll ratio updates during drag
      if (isDraggingRef.current) return

      const layoutInfo = editor.getLayoutInfo()
      const scrollTop = e.scrollTop
      const scrollHeight = editor.getScrollHeight()
      const clientHeight = layoutInfo.height
      const maxScroll = scrollHeight - clientHeight

      if (maxScroll > 0) {
        const ratio = Math.min(1, Math.max(0, scrollTop / maxScroll))
        useBoundStore.getState().setEditorScrollRatio(ratio)

        // Calculate visible top line for outline sync
        const totalLines = editor.getModel()?.getLineCount() || 1
        const visibleTopLine = Math.max(1, Math.min(totalLines, Math.ceil(ratio * totalLines)))
        useBoundStore.getState().setEditorVisibleTopLine(visibleTopLine)
      }
    })

    // Track global drag state to skip scroll updates during panel resize
    const handleDragStart = () => {
      isDraggingRef.current = true
    }
    const handleDragEnd = () => {
      isDraggingRef.current = false
    }
    document.addEventListener('panelresizestart', handleDragStart)
    document.addEventListener('panelresizeend', handleDragEnd)

    // Register keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      // Toggle bold
      const selection = editor.getSelection()
      if (selection) {
        const text = editor.getModel()?.getValueInRange(selection)
        if (text) {
          editor.executeEdits('', [{
            range: selection,
            text: `**${text}**`,
          }])
        }
      }
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      // Toggle italic
      const selection = editor.getSelection()
      if (selection) {
        const text = editor.getModel()?.getValueInRange(selection)
        if (text) {
          editor.executeEdits('', [{
            range: selection,
            text: `*${text}*`,
          }])
        }
      }
    })

    // Ctrl+K for link
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      const selection = editor.getSelection()
      if (selection) {
        const text = editor.getModel()?.getValueInRange(selection)
        if (text) {
          editor.executeEdits('', [{
            range: selection,
            text: `[${text}](url)`,
          }])
        } else {
          const position = editor.getPosition()
          if (position) {
            editor.executeEdits('', [{
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
              text: '[link text](url)',
            }])
          }
        }
      }
    })

    // Ctrl+Shift+C for code
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC,
      () => {
        const selection = editor.getSelection()
        if (selection) {
          const text = editor.getModel()?.getValueInRange(selection)
          if (text) {
            editor.executeEdits('', [{
              range: selection,
              text: `\`${text}\``,
            }])
          }
        }
      }
    )

    // Ctrl+/ for toggle comment (quote)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      const position = editor.getPosition()
      if (position) {
        const model = editor.getModel()
        if (model) {
          const lineContent = model.getLineContent(position.lineNumber)
          const trimmed = lineContent.trimStart()
          if (trimmed.startsWith('> ')) {
            // Remove quote
            const newContent = lineContent.replace(/^(\s*)>\s/, '$1')
            editor.executeEdits('', [{
              range: {
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: lineContent.length + 1,
              },
              text: newContent,
            }])
          } else {
            // Add quote
            editor.executeEdits('', [{
              range: {
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: 1,
              },
              text: '> ',
            }])
          }
        }
      }
    })

    // Ctrl+Shift+1-6 for headings
    const headingKeyCodes = [
      monaco.KeyCode.Digit1,
      monaco.KeyCode.Digit2,
      monaco.KeyCode.Digit3,
      monaco.KeyCode.Digit4,
      monaco.KeyCode.Digit5,
      monaco.KeyCode.Digit6,
    ]

    headingKeyCodes.forEach((keyCode, i) => {
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | keyCode,
        () => {
          const position = editor.getPosition()
          if (position) {
            editor.executeEdits('', [{
              range: {
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: 1,
              },
              text: '#'.repeat(i + 1) + ' ',
            }])
          }
        }
      )
    })

    // Helper function to get selected text including full lines (with newline)
    const getFullSelectionText = (ed: Monaco.editor.ICodeEditor): string | null => {
      const selection = ed.getSelection()
      if (!selection) return null
      const model = ed.getModel()
      if (!model) return null

      // If selection is empty, return null
      if (selection.isEmpty()) return null

      // Get the selected text normally
      let text = model.getValueInRange(selection)

      // If selection spans multiple lines or ends at start of a line,
      // it might not include the newline - check and add if needed
      const endLine = selection.endLineNumber
      const endCol = selection.endColumn
      const endLineContent = model.getLineContent(endLine)
      const lineLength = endLineContent.length

      // If the selection ends at the end of a line (but not the very end of the line + 1 which is newline)
      // and the text doesn't end with newline, add it
      if (endCol > lineLength && !text.endsWith('\n')) {
        text = text + '\n'
      }

      return text
    }

    // AI Context Menu Actions
    editor.addAction({
      id: 'ai-summarize',
      label: 'AI: 总结',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS],
      contextMenuGroupId: 'ai',
      contextMenuOrder: 1,
      run: (ed) => {
        const selectedText = getFullSelectionText(ed)
        if (selectedText) {
          window.dispatchEvent(new CustomEvent('ai-action', { detail: { action: 'summarize', text: selectedText } }))
        }
      },
    })

    editor.addAction({
      id: 'ai-translate',
      label: 'AI: 翻译',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 2,
      run: (ed) => {
        const selectedText = getFullSelectionText(ed)
        if (selectedText) {
          window.dispatchEvent(new CustomEvent('ai-action', { detail: { action: 'translate', text: selectedText } }))
        }
      },
    })

    editor.addAction({
      id: 'ai-polish',
      label: 'AI: 润色',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 3,
      run: (ed) => {
        const selectedText = getFullSelectionText(ed)
        if (selectedText) {
          window.dispatchEvent(new CustomEvent('ai-action', { detail: { action: 'polish', text: selectedText } }))
        }
      },
    })

    editor.addAction({
      id: 'ai-explain',
      label: 'AI: 解释代码',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 4,
      run: (ed) => {
        const selectedText = getFullSelectionText(ed)
        if (selectedText) {
          window.dispatchEvent(new CustomEvent('ai-action', { detail: { action: 'explain', text: selectedText } }))
        }
      },
    })

    editor.addAction({
      id: 'ai-continue',
      label: 'AI: 续写',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 5,
      run: (ed) => {
        const position = ed.getPosition()
        const model = ed.getModel()
        if (position && model) {
          // Get text from current position to end of document for continuation
          const fullText = model.getValue()
          const offset = model.getOffsetAt(position)
          const textAfterCursor = fullText.slice(offset)
          window.dispatchEvent(new CustomEvent('ai-action', { detail: { action: 'continue', text: textAfterCursor || '' } }))
        }
      },
    })

    // No ResizeObserver needed - Monaco handles its own layout
    // CSS flexbox will naturally resize the container, and Monaco will
    // use CSS to determine its size. The editor will be slightly blurry
    // during drag but will be smooth.
  }

  // Handle image drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer?.types.includes('Files')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    // Collect all image files
    const imageFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        imageFiles.push(files[i])
      }
    }

    // Insert all images
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.readAsDataURL(file)
      })

      const imageIndex = imageFiles.length > 1 ? `-${i + 1}` : ''
      const markdown = `![dropped-image${imageIndex}](${base64})\n`
      insertText(markdown)
    }
  }, [insertText])

  // Handle paste event for images and HTML
  useEffect(() => {
    // Listen on the editor container to catch paste before Monaco intercepts it
    const editorElement = editorWrapperRef.current
    if (!editorElement) return

    const handlePaste = async (e: Event) => {
      // Give Monaco a chance to handle text paste, but intercept image paste
      const clipboardEvent = e as ClipboardEvent
      const items = clipboardEvent.clipboardData?.items
      if (!items) return

      // Check if there are any images in the clipboard
      let hasImages = false
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          hasImages = true
          break
        }
      }

      // If no images, let Monaco handle the paste normally
      if (!hasImages) return

      // For image paste, prevent Monaco and handle ourselves
      e.preventDefault()
      e.stopPropagation()

      // Collect all image files
      const imageFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            imageFiles.push(file)
          }
        }
      }

      // Insert all images
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (event) => resolve(event.target?.result as string)
          reader.readAsDataURL(file)
        })

        // Generate a simple filename without special characters
        const imageIndex = imageFiles.length > 1 ? `-${i + 1}` : ''
        const markdown = `![pasted-image${imageIndex}](${base64})\n`
        insertText(markdown)
      }
    }

    editorElement.addEventListener('paste', handlePaste, true) // Use capture phase
    return () => editorElement.removeEventListener('paste', handlePaste, true)
  }, [insertText])

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
    }
  }

  return (
    <div
      ref={editorWrapperRef}
      className="h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Editor
        height="100%"
        language="markdown-prest"
        value={content}
        theme={themeMap[settings.theme] || 'prest-dark'}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.editor.fontSize,
          fontFamily: settings.editor.fontFamily,
          lineHeight: settings.editor.lineHeight,
          wordWrap: settings.editor.wordWrap ? 'on' : 'off',
          minimap: { enabled: settings.editor.minimap },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          folding: true,
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            {t?.editor.loadingEditor ?? 'Loading editor...'}
          </div>
        }
      />
    </div>
  )
}