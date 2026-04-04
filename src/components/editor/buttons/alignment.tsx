import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'alignment'

export interface ButtonConfig {
  id: ToolbarButtonId
  icon: React.ReactNode
  getDisplayName: (t: { editor: Record<string, string> }) => string
  getTitle: (t: { editor: Record<string, string> }) => string
  format?: FormatType
  group?: ToolbarGroupId
}

const alignLeftIcon = (
  <span className="flex flex-col gap-0.5 items-start">
    <span className="w-3 h-0.5 bg-current rounded" />
    <span className="w-4 h-0.5 bg-current rounded" />
    <span className="w-3 h-0.5 bg-current rounded" />
  </span>
)

const alignCenterIcon = (
  <span className="flex flex-col gap-0.5 items-center">
    <span className="w-3 h-0.5 bg-current rounded" />
    <span className="w-4 h-0.5 bg-current rounded" />
    <span className="w-3 h-0.5 bg-current rounded" />
  </span>
)

const alignRightIcon = (
  <span className="flex flex-col gap-0.5 items-end">
    <span className="w-3 h-0.5 bg-current rounded" />
    <span className="w-4 h-0.5 bg-current rounded" />
    <span className="w-3 h-0.5 bg-current rounded" />
  </span>
)

export const buttons: ButtonConfig[] = [
  {
    id: 'alignLeft',
    icon: alignLeftIcon,
    getDisplayName: (t) => t.editor.alignLeft,
    getTitle: (t) => t.editor.alignLeft,
    format: 'alignLeft',
    group: groupId,
  },
  {
    id: 'alignCenter',
    icon: alignCenterIcon,
    getDisplayName: (t) => t.editor.alignCenter,
    getTitle: (t) => t.editor.alignCenter,
    format: 'alignCenter',
    group: groupId,
  },
  {
    id: 'alignRight',
    icon: alignRightIcon,
    getDisplayName: (t) => t.editor.alignRight,
    getTitle: (t) => t.editor.alignRight,
    format: 'alignRight',
    group: groupId,
  },
]