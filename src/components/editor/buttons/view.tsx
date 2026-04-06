import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'view'

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
    id: 'focusMode',
    icon: <span className="text-sm">◎</span>,
    getDisplayName: (t) => t.editor.focusMode || 'Focus',
    getTitle: (t) => t.editor.focusMode || 'Focus Mode',
    format: 'focusMode',
    group: groupId,
  },
  {
    id: 'typewriterMode',
    icon: <span className="text-sm">✎</span>,
    getDisplayName: (t) => t.editor.typewriterMode || 'Typewriter',
    getTitle: (t) => t.editor.typewriterMode || 'Typewriter Mode',
    format: 'typewriterMode',
    group: groupId,
  },
  {
    id: 'fullscreen',
    icon: <span className="text-sm">⛶</span>,
    getDisplayName: (t) => t.editor.fullscreen || 'Fullscreen',
    getTitle: (t) => t.editor.fullscreen || 'Toggle Fullscreen',
    format: 'fullscreen',
    group: groupId,
  },
]
