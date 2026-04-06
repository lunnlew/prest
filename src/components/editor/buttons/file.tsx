import type { ToolbarButtonId, ToolbarGroupId } from '../../../types'
import type { FormatType } from '../../../stores/editorSlice'

export const groupId: ToolbarGroupId = 'file'

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
    id: 'downloadMd',
    icon: <span>↓</span>,
    getDisplayName: (t) => t.editor.downloadMd,
    getTitle: (t) => t.editor.downloadMd,
    format: 'downloadMd',
    group: groupId,
  },
  {
    id: 'importFile',
    icon: <span>↑</span>,
    getDisplayName: (t) => t.editor.importFile || 'Import',
    getTitle: (t) => t.editor.importFile || 'Import File',
    format: 'importFile',
    group: groupId,
  },
  {
    id: 'exportHtml',
    icon: <span className="text-xs">HTML</span>,
    getDisplayName: (t) => t.editor.exportHtml || 'Export HTML',
    getTitle: (t) => t.editor.exportHtml || 'Export as HTML',
    format: 'exportHtml',
    group: groupId,
  },
  {
    id: 'exportPdf',
    icon: <span className="text-xs">PDF</span>,
    getDisplayName: (t) => t.editor.exportPdf || 'Export PDF',
    getTitle: (t) => t.editor.exportPdf || 'Export as PDF',
    format: 'exportPdf',
    group: groupId,
  },
]
