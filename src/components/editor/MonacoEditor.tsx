import Editor, { OnMount } from '@monaco-editor/react'
import { useTranslation } from '../../hooks/useTranslation'
import { useBoundStore } from '../../stores'
import type * as Monaco from 'monaco-editor'

export function MonacoEditor() {
  const {
    content,
    setContent,
    setCursorPosition,
    setEditorInstance,
    settings,
  } = useBoundStore()
  const { t } = useTranslation()

  if (!t) return null

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

          // Links
          [/\[[^\]]+\]\([^)]+\)/, 'link'],

          // Images
          [/!\[[^\]]*\]\([^)]+\)/, 'constant'],

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

    // Set theme colors
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
      },
    })

    // Apply theme
    monaco.editor.setTheme(settings.theme === 'dark' ? 'prest-dark' : 'prest-light')

    // Set language
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, 'markdown-prest')
    }

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      })
    })

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
  }

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
    }
  }

  return (
    <Editor
      height="100%"
      language="markdown-prest"
      value={content}
      theme={settings.theme === 'dark' ? 'prest-dark' : 'prest-light'}
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
        automaticLayout: true,
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
          {t.editor.loadingEditor}
        </div>
      }
    />
  )
}