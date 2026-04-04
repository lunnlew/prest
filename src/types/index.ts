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
  // Text formatting
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'highlight'
  | 'underline'
  | 'subscript'
  | 'superscript'
  | 'code'
  | 'link'
  | 'image'
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
  // Blocks
  | 'quote'
  | 'table'
  | 'hr'
  // Alignment
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  // Tools
  | 'clearFormat'

export type ToolbarGroupId = 'headings' | 'textFormatting' | 'codeLinks' | 'lists' | 'blocks' | 'alignment' | 'tools' | (string & {})

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
}

// File types
export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  content?: string
}