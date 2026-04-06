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
    id: 'copyWechat',
    icon: <span className="text-xs">公众号</span>,
    getDisplayName: (t) => t.editor.copyWechat || 'Copy Wechat',
    getTitle: (t) => t.editor.copyWechat || 'Copy for Wechat Public Account',
    format: 'copyWechat',
    group: groupId,
  },
  {
    id: 'copyWeibo',
    icon: <span className="text-xs">微博</span>,
    getDisplayName: (t) => t.editor.copyWeibo || 'Copy Weibo',
    getTitle: (t) => t.editor.copyWeibo || 'Copy for Weibo',
    format: 'copyWeibo',
    group: groupId,
  },
]
