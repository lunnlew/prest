import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'basic'

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
    id: 'bold',
    icon: <strong className="font-bold">B</strong>,
    getDisplayName: (t) => t.editor.bold,
    getTitle: (t) => t.editor.bold,
    format: 'bold',
    group: groupId,
  },
  {
    id: 'italic',
    icon: <em className="italic">I</em>,
    getDisplayName: (t) => t.editor.italic,
    getTitle: (t) => t.editor.italic,
    format: 'italic',
    group: groupId,
  },
  {
    id: 'strikethrough',
    icon: <s className="line-through">S</s>,
    getDisplayName: (t) => t.editor.strikethrough,
    getTitle: (t) => t.editor.strikethrough,
    format: 'strikethrough',
    group: groupId,
  },
  {
    id: 'highlight',
    icon: <span className="bg-yellow-200 dark:bg-yellow-600/50 px-0.5 rounded">H</span>,
    getDisplayName: (t) => t.editor.highlight,
    getTitle: (t) => t.editor.highlight,
    format: 'highlight',
    group: groupId,
  },
  {
    id: 'underline',
    icon: <span className="underline">U</span>,
    getDisplayName: (t) => t.editor.underline || 'Underline',
    getTitle: (t) => t.editor.underline || 'Underline',
    format: 'underline',
    group: groupId,
  },
]
