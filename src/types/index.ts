// Editor types
export interface CursorPosition {
  line: number
  column: number
}

export interface Selection {
  start: number
  end: number
}

// Preview types
export interface TextBlock {
  id: string
  content: string
  type: 'paragraph' | 'heading' | 'code' | 'list' | 'blockquote' | 'hr'
  level?: number // for headings
  language?: string // for code blocks
}

export interface LayoutResult {
  height: number
  lineCount: number
  lines: Array<{
    text: string
    width: number
    height: number
  }>
}

// Layout types
export type SidebarTab = 'files' | 'search' | 'outline' | 'settings'

// Settings types
export type Theme = 'light' | 'dark'

export interface EditorSettings {
  fontSize: number
  lineHeight: number
  fontFamily: string
  wordWrap: boolean
  minimap: boolean
}

// Toolbar configuration types
export type ToolbarButtonId =
  // Basic formatting
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'highlight'
  | 'underline'
  // Headings
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  // Lists
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  // Insert
  | 'link'
  | 'image'
  | 'code'
  | 'codeBlock'
  | 'math'
  | 'table'
  | 'hr'
  | 'emoji'
  // Blocks
  | 'quote'
  | 'footnote'
  | 'definitionList'
  // Alignment
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  // Advanced
  | 'subscript'
  | 'superscript'
  | 'fontColor'
  | 'fontBackground'
  // File
  | 'downloadMd'
  | 'importFile'
  | 'exportHtml'
  | 'exportPdf'
  // Tools
  | 'clearFormat'
  | 'copyWechat'
  | 'copyWeibo'
  // View
  | 'focusMode'
  | 'typewriterMode'
  | 'fullscreen'

export type ToolbarGroupId = 'basic' | 'headings' | 'lists' | 'insert' | 'blocks' | 'alignment' | 'advanced' | 'file' | 'tools' | 'view' | (string & {})

export interface ToolbarGroupConfig {
  id: ToolbarGroupId
  label: string
  buttons: ToolbarButtonId[]
  visible: boolean
  expanded: boolean
}

// Unified toolbar item - can be a button or a group
export type ToolbarItemType = 'button' | 'group'

export interface ToolbarButtonItem {
  type: 'button'
  id: ToolbarButtonId
}

export interface ToolbarGroupItem {
  type: 'group'
  id: ToolbarGroupId
}

export type ToolbarItem = ToolbarButtonItem | ToolbarGroupItem

export interface ToolbarSettings {
  groups: ToolbarGroupConfig[]
  items: ToolbarItem[] // Unified order of buttons and groups
}

export type Locale = 'en' | 'zh-CN'

export interface Settings {
  theme: Theme
  editor: EditorSettings
  syncScroll: boolean
  autoSave: boolean
  toolbar: ToolbarSettings
  locale: Locale
  xhsExport: XHSExportSettings
}

// File types
export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  content?: string
}

// Platform preview types — extensible style system
export type PlatformPreviewId = 'default' | 'xiaohongshu'

export interface PlatformPreviewMeta {
  id: PlatformPreviewId
  name: string            // display name, e.g. "小红书", "默认文档"
  description: string     // short description for tooltip
  icon: string            // emoji icon
}

export interface PlatformPreviewDef {
  meta: PlatformPreviewMeta
  component: React.ComponentType<{ content: string }>
}

// XHS-specific export settings (stored in Settings)
export type XHSAspectRatio = '3:4' | '3:5' | '1:1' | '16:9'
export type XHSTemplate = 'cream' | 'minimal' | 'gradient' | 'pink' | 'mint' | 'lavender' | 'peach' | 'ink' | 'flame' | 'sakura' | 'nordic' | 'forest' | 'magazine' | 'scrapbook' | 'gallery' | 'wechat' | 'notebook' | 'retro' | 'tape' | 'postcard' | 'sunset' | 'ocean' | 'aurora' | 'honey' | 'wine' | 'lemon' | 'matcha' | 'berry' | 'caramel' | 'coral' | 'sky' | 'autumn' | 'night'

// 水印位置
export type XHSWatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'diagonal'

// 水印显示范围
export type XHSWatermarkScope = 'all' | 'first' | 'last' | 'none'

// 水印大小
export type XHSWatermarkSize = 'small' | 'medium' | 'large'

export interface XHSExportSettings {
  aspectRatio: XHSAspectRatio
  template: XHSTemplate
  /** 水印文字 */
  watermark: string
  /** 水印位置 */
  watermarkPosition: XHSWatermarkPosition
  /** 水印显示范围 */
  watermarkScope: XHSWatermarkScope
  /** 水印透明度 0.1-1.0 */
  watermarkOpacity: number
  /** 水印大小 */
  watermarkSize: XHSWatermarkSize
  showPageNumber: boolean
  /** Export frame width in CSS pixels (default 440, range 320-1920) */
  exportWidth: number
}