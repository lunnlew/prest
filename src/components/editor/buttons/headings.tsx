import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'headings'

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
    id: 'heading1',
    icon: <span className="font-bold">H1</span>,
    getDisplayName: (t) => t.editor.heading1,
    getTitle: (t) => t.editor.heading1,
    format: 'heading1',
    group: groupId,
  },
  {
    id: 'heading2',
    icon: <span className="font-bold text-xs">H2</span>,
    getDisplayName: (t) => t.editor.heading2,
    getTitle: (t) => t.editor.heading2,
    format: 'heading2',
    group: groupId,
  },
  {
    id: 'heading3',
    icon: <span className="font-bold text-xs">H3</span>,
    getDisplayName: (t) => t.editor.heading3,
    getTitle: (t) => t.editor.heading3,
    format: 'heading3',
    group: groupId,
  },
  {
    id: 'heading4',
    icon: <span className="font-bold text-xs">H4</span>,
    getDisplayName: (t) => t.editor.heading4 || 'Heading 4',
    getTitle: (t) => t.editor.heading4 || 'Heading 4',
    format: 'heading4',
    group: groupId,
  },
  {
    id: 'heading5',
    icon: <span className="font-bold text-xs">H5</span>,
    getDisplayName: (t) => t.editor.heading5 || 'Heading 5',
    getTitle: (t) => t.editor.heading5 || 'Heading 5',
    format: 'heading5',
    group: groupId,
  },
  {
    id: 'heading6',
    icon: <span className="font-bold text-xs">H6</span>,
    getDisplayName: (t) => t.editor.heading6 || 'Heading 6',
    getTitle: (t) => t.editor.heading6 || 'Heading 6',
    format: 'heading6',
    group: groupId,
  },
]