import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'tools'

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
    id: 'clearFormat',
    icon: <span className="text-sm">✕</span>,
    getDisplayName: (t) => t.editor.clearFormat || 'Clear Format',
    getTitle: (t) => t.editor.clearFormat || 'Clear Format',
    format: 'clearFormat',
    group: groupId,
  },
  {
    id: 'downloadMd',
    icon: <span className="text-sm">↓</span>,
    getDisplayName: (t) => t.editor.downloadMd || 'Download MD',
    getTitle: (t) => t.editor.downloadMd || 'Download Markdown File',
    group: groupId,
  },
]
