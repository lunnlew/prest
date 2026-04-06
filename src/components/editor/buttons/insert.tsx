import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'insert'

export interface ButtonConfig {
  id: ToolbarButtonId
  icon: React.ReactNode
  getDisplayName: (t: { editor: Record<string, string> }) => string
  getTitle: (t: { editor: Record<string, string> }) => string
  format?: FormatType
  group?: ToolbarGroupId
}

export const buttons: ButtonConfig[] = [
  {
    id: 'link',
    icon: <span>🔗</span>,
    getDisplayName: (t) => t.editor.link,
    getTitle: (t) => t.editor.link,
    format: 'link',
    group: groupId,
  },
  {
    id: 'image',
    icon: <span>🖼</span>,
    getDisplayName: (t) => t.editor.image,
    getTitle: (t) => t.editor.image,
    format: 'image',
    group: groupId,
  },
  {
    id: 'code',
    icon: <span className="font-mono text-xs">{'</>'}</span>,
    getDisplayName: (t) => t.editor.code,
    getTitle: (t) => t.editor.code,
    format: 'code',
    group: groupId,
  },
  {
    id: 'codeBlock',
    icon: <span className="font-mono text-xs">{"```"}</span>,
    getDisplayName: (t) => t.editor.codeBlock || 'Code Block',
    getTitle: (t) => t.editor.codeBlock || 'Code Block',
    format: 'codeBlock',
    group: groupId,
  },
  {
    id: 'math',
    icon: <span className="font-mono text-xs">∑</span>,
    getDisplayName: (t) => t.editor.math || 'Math',
    getTitle: (t) => t.editor.math || 'Math Block',
    format: 'math',
    group: groupId,
  },
  {
    id: 'table',
    icon: <span className="text-base">⊞</span>,
    getDisplayName: (t) => t.editor.table,
    getTitle: (t) => t.editor.table,
    format: 'table',
    group: groupId,
  },
  {
    id: 'hr',
    icon: <span className="text-base">―</span>,
    getDisplayName: (t) => t.editor.horizontalRule,
    getTitle: (t) => t.editor.horizontalRule,
    format: 'hr',
    group: groupId,
  },
  {
    id: 'emoji',
    icon: <span>😀</span>,
    getDisplayName: (t) => t.editor.emoji || 'Emoji',
    getTitle: (t) => t.editor.emoji || 'Insert Emoji',
    format: 'emoji',
    group: groupId,
  },
]
