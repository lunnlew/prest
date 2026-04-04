import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'codeLinks'

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
    id: 'code',
    icon: <span className="font-mono text-xs">{'</>'}</span>,
    getDisplayName: (t) => t.editor.code,
    getTitle: (t) => t.editor.code,
    format: 'code',
    group: groupId,
  },
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
]