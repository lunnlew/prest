import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'lists'

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
    id: 'bulletList',
    icon: <span className="text-base">•</span>,
    getDisplayName: (t) => t.editor.bulletList,
    getTitle: (t) => t.editor.bulletList,
    format: 'list',
    group: groupId,
  },
  {
    id: 'orderedList',
    icon: <span className="text-sm">1.</span>,
    getDisplayName: (t) => t.editor.orderedList,
    getTitle: (t) => t.editor.orderedList,
    format: 'orderedList',
    group: groupId,
  },
  {
    id: 'taskList',
    icon: <span>☑</span>,
    getDisplayName: (t) => t.editor.taskList,
    getTitle: (t) => t.editor.taskList,
    format: 'taskList',
    group: groupId,
  },
]
