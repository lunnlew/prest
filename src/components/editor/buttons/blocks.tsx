import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'blocks'

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
    id: 'quote',
    icon: <span className="text-base">❝</span>,
    getDisplayName: (t) => t.editor.quote,
    getTitle: (t) => t.editor.quote,
    format: 'quote',
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
]