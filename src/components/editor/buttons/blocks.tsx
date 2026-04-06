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
    id: 'footnote',
    icon: <span className="text-xs">fn</span>,
    getDisplayName: (t) => t.editor.footnote || 'Footnote',
    getTitle: (t) => t.editor.footnote || 'Insert Footnote',
    format: 'footnote',
    group: groupId,
  },
  {
    id: 'definitionList',
    icon: <span className="text-xs">DL</span>,
    getDisplayName: (t) => t.editor.definitionList || 'Definition List',
    getTitle: (t) => t.editor.definitionList || 'Insert Definition List',
    format: 'definitionList',
    group: groupId,
  },
]
