import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'advanced'

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
    id: 'subscript',
    icon: <span>X<sub>2</sub></span>,
    getDisplayName: (t) => t.editor.subscript || 'Subscript',
    getTitle: (t) => t.editor.subscript || 'Subscript',
    format: 'subscript',
    group: groupId,
  },
  {
    id: 'superscript',
    icon: <span>X<sup>2</sup></span>,
    getDisplayName: (t) => t.editor.superscript || 'Superscript',
    getTitle: (t) => t.editor.superscript || 'Superscript',
    format: 'superscript',
    group: groupId,
  },
  {
    id: 'fontColor',
    icon: <span className="text-red-500">A</span>,
    getDisplayName: (t) => t.editor.fontColor || 'Font Color',
    getTitle: (t) => t.editor.fontColor || 'Font Color',
    format: 'fontColor',
    group: groupId,
  },
  {
    id: 'fontBackground',
    icon: <span className="bg-yellow-200 dark:bg-yellow-600/50 px-0.5 rounded">A</span>,
    getDisplayName: (t) => t.editor.fontBackground || 'Font Background',
    getTitle: (t) => t.editor.fontBackground || 'Font Background',
    format: 'fontBackground',
    group: groupId,
  },
]
