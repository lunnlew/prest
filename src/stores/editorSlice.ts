import { StateCreator } from 'zustand'
import { CursorPosition, Selection } from '../types'
import type { editor } from 'monaco-editor'

// Use Monaco's actual editor type
export type EditorInstance = editor.IStandaloneCodeEditor | null

// Selection range type from Monaco
export type EditorRange = {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}

export type FormatType =
  // Basic
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'highlight'
  | 'underline'
  // Headings
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  // Lists
  | 'list'
  | 'orderedList'
  | 'taskList'
  // Insert
  | 'link'
  | 'image'
  | 'code'
  | 'codeBlock'
  | 'math'
  | 'table'
  | 'hr'
  | 'emoji'
  // Blocks
  | 'quote'
  | 'footnote'
  | 'definitionList'
  // Alignment
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  // Advanced
  | 'subscript'
  | 'superscript'
  | 'fontColor'
  | 'fontBackground'
  // File
  | 'downloadMd'
  | 'importFile'
  | 'exportHtml'
  | 'exportPdf'
  // Tools
  | 'clearFormat'
  | 'copyWechat'
  | 'copyWeibo'
  // View
  | 'focusMode'
  | 'typewriterMode'
  | 'fullscreen'

export interface EditorSlice {
  // State
  content: string
  cursorPosition: CursorPosition
  selection: Selection | null
  undoStack: string[]
  redoStack: string[]
  isDirty: boolean
  currentFile: string | null
  editorInstance: EditorInstance

  // Actions
  setContent: (content: string, markDirty?: boolean) => void
  loadContent: (content: string) => void  // Load content without marking dirty
  setCursorPosition: (position: CursorPosition) => void
  setSelection: (selection: Selection | null) => void
  setEditorInstance: (editor: EditorInstance) => void
  undo: () => void
  redo: () => void
  save: () => void
  setCurrentFile: (fileId: string | null) => void
  insertText: (text: string) => void
  replaceSelection: (text: string) => boolean
  formatMarkdown: (type: FormatType, lang?: string) => void
  downloadMd: (filename?: string) => void
}

export const createEditorSlice: StateCreator<EditorSlice, [], [], EditorSlice> = (set, get) => ({
  content: `# Welcome to Prest Editor

This is a **Markdown** editor with *live preview*.

## Features

- VSCode-like interface
- Resizable panels
- Syntax highlighting
- Live preview

### Code Block

\`\`\`typescript
const greeting: string = "Hello, World!"
console.log(greeting)
\`\`\`

### List

- Item 1
- Item 2
- Item 3

> This is a blockquote

[Visit GitHub](https://github.com)
`,
  cursorPosition: { line: 1, column: 1 },
  selection: null,
  undoStack: [],
  redoStack: [],
  isDirty: false,
  currentFile: null,
  editorInstance: null,

  setContent: (content, markDirty = true) =>
    set((state) => ({
      content,
      undoStack: markDirty ? [...state.undoStack.slice(-50), state.content] : state.undoStack,
      redoStack: [],
      isDirty: markDirty,
    })),

  loadContent: (content) =>
    set(() => ({
      content,
      undoStack: [],
      redoStack: [],
      isDirty: false,
    })),

  setCursorPosition: (position) => set({ cursorPosition: position }),

  setSelection: (selection) => set({ selection }),

  setEditorInstance: (editor) => set({ editorInstance: editor }),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state
      const previous = state.undoStack[state.undoStack.length - 1]
      return {
        content: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.content],
      }
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        content: next,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.content],
      }
    }),

  save: () => set({ isDirty: false }),

  setCurrentFile: (fileId) => set({ currentFile: fileId }),

  insertText: (text) => {
    const state = get()
    const editor = state.editorInstance
    if (editor) {
      const position = editor.getPosition()
      if (position) {
        // Execute edit - it's synchronous
        editor.executeEdits('', [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text,
        }])

        // Update store content after edit is applied
        const newContent = editor.getValue()
        set({ content: newContent, isDirty: true })
        editor.focus()
      }
    } else {
      set({ content: state.content + text, isDirty: true })
    }
  },

  replaceSelection: (text) => {
    const state = get()
    const editor = state.editorInstance
    if (editor) {
      const selection = editor.getSelection()
      if (selection && !selection.isEmpty()) {
        editor.executeEdits('', [{
          range: selection,
          text,
        }])
        editor.focus()
        return true
      }
      return false
    }
    return false
  },

  formatMarkdown: (type, lang) => {
    const state = get()
    const editor = state.editorInstance
    if (!editor) return

    const selection = editor.getSelection()
    const model = editor.getModel()
    if (!model) return

    const selectedText = selection ? model.getValueInRange(selection) : ''
    const isEmpty = !selectedText || selectedText.length === 0

    // Get current position for insert
    const position = editor.getPosition()
    if (!position) return

    // Handle downloadMd separately - not a text format
    if (type === 'downloadMd') {
      get().downloadMd()
      return
    }

    // Handle codeBlock with language
    if (type === 'codeBlock' && lang) {
      const codeLang = lang || 'plaintext'
      if (isEmpty || !selection) {
        editor.executeEdits('', [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: `\`\`\`${codeLang}\ncode\n\`\`\``
        }])
        // Position cursor inside the code block
        editor.setPosition({
          lineNumber: position.lineNumber + 1,
          column: 1
        })
      } else {
        editor.executeEdits('', [{
          range: selection,
          text: `\`\`\`${codeLang}\n${selectedText}\n\`\`\``
        }])
      }
      editor.focus()
      return
    }

    // Define format actions (all types except downloadMd and codeBlock)
    const formatEntry: Exclude<FormatType, 'downloadMd' | 'codeBlock'> = type as Exclude<FormatType, 'downloadMd' | 'codeBlock'>
    const formats: Record<Exclude<FormatType, 'downloadMd' | 'codeBlock'>, { prefix: string; suffix: string; placeholder?: string }> = {
      bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
      italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
      strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' },
      highlight: { prefix: '==', suffix: '==', placeholder: 'highlighted text' },
      underline: { prefix: '<u>', suffix: '</u>', placeholder: 'underlined text' },
      subscript: { prefix: '<sub>', suffix: '</sub>', placeholder: 'subscript' },
      superscript: { prefix: '<sup>', suffix: '</sup>', placeholder: 'superscript' },
      code: { prefix: '`', suffix: '`', placeholder: 'code' },
      math: { prefix: '$$\n', suffix: '\n$$', placeholder: 'math equation' },
      emoji: { prefix: ':', suffix: ':', placeholder: 'emoji' },
      link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
      image: { prefix: '![', suffix: '](image-url)', placeholder: 'alt text' },
      heading1: { prefix: '# ', suffix: '', placeholder: 'Heading 1' },
      heading2: { prefix: '## ', suffix: '', placeholder: 'Heading 2' },
      heading3: { prefix: '### ', suffix: '', placeholder: 'Heading 3' },
      heading4: { prefix: '#### ', suffix: '', placeholder: 'Heading 4' },
      heading5: { prefix: '##### ', suffix: '', placeholder: 'Heading 5' },
      heading6: { prefix: '###### ', suffix: '', placeholder: 'Heading 6' },
      quote: { prefix: '> ', suffix: '', placeholder: 'quote' },
      footnote: { prefix: '[^', suffix: ']', placeholder: 'footnote' },
      definitionList: { prefix: '\n<dl>\n<dt>Term</dt>\n<dd>Definition</dd>\n</dl>\n', suffix: '', placeholder: '' },
      list: { prefix: '- ', suffix: '', placeholder: 'list item' },
      orderedList: { prefix: '1. ', suffix: '', placeholder: 'list item' },
      taskList: { prefix: '- [ ] ', suffix: '', placeholder: 'task' },
      hr: { prefix: '\n---\n', suffix: '', placeholder: '' },
      table: { prefix: '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', suffix: '', placeholder: '' },
      alignLeft: { prefix: '<div align="left">\n\n', suffix: '\n\n</div>', placeholder: 'left aligned text' },
      alignCenter: { prefix: '<div align="center">\n\n', suffix: '\n\n</div>', placeholder: 'centered text' },
      alignRight: { prefix: '<div align="right">\n\n', suffix: '\n\n</div>', placeholder: 'right aligned text' },
      fontColor: { prefix: '<span style="color: #fff">', suffix: '</span>', placeholder: 'colored text' },
      fontBackground: { prefix: '<span style="background: yellow">', suffix: '</span>', placeholder: 'background text' },
      clearFormat: { prefix: '', suffix: '', placeholder: '' },
      importFile: { prefix: '', suffix: '', placeholder: '' },
      exportHtml: { prefix: '', suffix: '', placeholder: '' },
      exportPdf: { prefix: '', suffix: '', placeholder: '' },
      copyWechat: { prefix: '', suffix: '', placeholder: '' },
      copyWeibo: { prefix: '', suffix: '', placeholder: '' },
      focusMode: { prefix: '', suffix: '', placeholder: '' },
      typewriterMode: { prefix: '', suffix: '', placeholder: '' },
      fullscreen: { prefix: '', suffix: '', placeholder: '' },
    }

    const format = formats[formatEntry]

    // Handle clearFormat separately
    if (type === 'clearFormat') {
      if (selection && selectedText) {
        // Remove common markdown formatting
        let cleaned = selectedText
          .replace(/\*\*(.+?)\*\*/g, '$1') // bold
          .replace(/\*(.+?)\*/g, '$1') // italic
          .replace(/~~(.+?)~~/g, '$1') // strikethrough
          .replace(/==(.+?)==/g, '$1') // highlight
          .replace(/`(.+?)`/g, '$1') // inline code
          .replace(/<u>(.+?)<\/u>/g, '$1') // underline
          .replace(/<sub>(.+?)<\/sub>/g, '$1') // subscript
          .replace(/<sup>(.+?)<\/sup>/g, '$1') // superscript
          .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
          .replace(/^#+\s*/gm, '') // headings
          .replace(/^>\s*/gm, '') // quotes
          .replace(/^[-*+]\s*/gm, '') // bullet lists
          .replace(/^\d+\.\s*/gm, '') // ordered lists
          .replace(/^- \[ \]\s*/gm, '') // task lists

        editor.executeEdits('', [{
          range: selection,
          text: cleaned,
        }])
      }
      editor.focus()
      return
    }

    if (isEmpty || !selection) {
      // Insert with placeholder
      const insertText = format.placeholder
        ? `${format.prefix}${format.placeholder}${format.suffix}`
        : format.prefix

      editor.executeEdits('', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: insertText,
      }])
    } else {
      // Wrap selected text
      editor.executeEdits('', [{
        range: selection,
        text: `${format.prefix}${selectedText}${format.suffix}`,
      }])
    }

    editor.focus()
  },

  downloadMd: (filename?: string) => {
    const state = get()
    const content = state.content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
})
