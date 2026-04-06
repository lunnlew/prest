import { StateCreator } from 'zustand'
import { Settings, Theme, EditorSettings, ToolbarGroupConfig, ToolbarItem, ToolbarButtonId, Locale, XHSExportSettings } from '../types'

export interface SettingsSlice {
  // State
  settings: Settings

  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  updateEditorSettings: (settings: Partial<EditorSettings>) => void
  setSyncScroll: (enabled: boolean) => void
  setAutoSave: (enabled: boolean) => void
  setLocale: (locale: Locale) => void
  toggleToolbarGroup: (groupId: string) => void
  toggleToolbarGroupExpand: (groupId: string) => void
  setToolbarGroups: (groups: ToolbarGroupConfig[]) => void
  setPinnedButtons: (buttons: ToolbarButtonId[]) => void
  setToolbarItems: (items: ToolbarItem[]) => void
  setXHSExportSettings: (settings: Partial<XHSExportSettings>) => void
  resetSettings: () => void
}

// Default toolbar configuration
export const defaultToolbarGroups: ToolbarGroupConfig[] = [
  {
    id: 'headings',
    label: 'Headings',
    buttons: ['heading1', 'heading2', 'heading3'],
    visible: true,
    expanded: false,
  },
  {
    id: 'textFormatting',
    label: 'Text',
    buttons: ['bold', 'italic', 'strikethrough', 'highlight'],
    visible: true,
    expanded: false,
  },
  {
    id: 'codeLinks',
    label: 'Code & Links',
    buttons: ['code', 'link', 'image'],
    visible: true,
    expanded: false,
  },
  {
    id: 'lists',
    label: 'Lists',
    buttons: ['bulletList', 'orderedList', 'taskList'],
    visible: true,
    expanded: false,
  },
  {
    id: 'blocks',
    label: 'Blocks',
    buttons: ['quote', 'table', 'hr'],
    visible: true,
    expanded: false,
  },
  {
    id: 'alignment',
    label: 'Align',
    buttons: ['alignLeft', 'alignCenter', 'alignRight'],
    visible: true,
    expanded: false,
  },
  {
    id: 'tools',
    label: 'Tools',
    buttons: ['clearFormat', 'downloadMd'],
    visible: true,
    expanded: false,
  }
]

// Default pinned buttons (most commonly used)
export const defaultPinnedButtons: ToolbarButtonId[] = ['bold', 'italic', 'bulletList', 'orderedList', 'link']

// Default toolbar items order
export const defaultToolbarItems: ToolbarItem[] = [
  // Text formatting
  { type: 'button', id: 'bold' },
  { type: 'button', id: 'italic' },
  { type: 'button', id: 'underline' },
  { type: 'button', id: 'strikethrough' },
  { type: 'button', id: 'highlight' },
  { type: 'button', id: 'subscript' },
  { type: 'button', id: 'superscript' },
  // Headings
  { type: 'button', id: 'heading1' },
  { type: 'button', id: 'heading2' },
  { type: 'button', id: 'heading3' },
  { type: 'button', id: 'heading4' },
  { type: 'button', id: 'heading5' },
  { type: 'button', id: 'heading6' },
  // Code & Links
  { type: 'button', id: 'code' },
  { type: 'button', id: 'link' },
  { type: 'button', id: 'image' },
  // Lists
  { type: 'button', id: 'bulletList' },
  { type: 'button', id: 'orderedList' },
  { type: 'button', id: 'taskList' },
  // Blocks
  { type: 'button', id: 'quote' },
  { type: 'button', id: 'table' },
  { type: 'button', id: 'hr' },
  // Alignment
  { type: 'button', id: 'alignLeft' },
  { type: 'button', id: 'alignCenter' },
  { type: 'button', id: 'alignRight' },
  // Tools
  { type: 'button', id: 'clearFormat' },
  { type: 'button', id: 'downloadMd' },
  // Groups
  { type: 'group', id: 'headings' },
  { type: 'group', id: 'textFormatting' },
  { type: 'group', id: 'codeLinks' },
  { type: 'group', id: 'lists' },
  { type: 'group', id: 'blocks' },
  { type: 'group', id: 'alignment' },
  { type: 'group', id: 'tools' },
]

export const defaultXHSExport: XHSExportSettings = {
  aspectRatio: '3:4',
  template: 'cream',
  watermark: '',
  watermarkPosition: 'bottom-right',
  watermarkScope: 'last',
  watermarkOpacity: 0.5,
  watermarkSize: 'medium',
  showPageNumber: false,
  exportWidth: 440,
}

const defaultSettings: Settings = {
  theme: 'dark',
  editor: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'JetBrains Mono, Consolas, monospace',
    wordWrap: true,
    minimap: false,
  },
  syncScroll: true,
  autoSave: false,
  toolbar: {
    groups: defaultToolbarGroups,
    items: defaultToolbarItems,
  },
  locale: 'zh-CN',
  xhsExport: defaultXHSExport,
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  settings: defaultSettings,

  setTheme: (theme) =>
    set((state) => ({
      settings: { ...state.settings, theme },
    })),

  toggleTheme: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        theme: state.settings.theme === 'dark' ? 'light' : 'dark',
      },
    })),

  updateEditorSettings: (editorSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        editor: { ...state.settings.editor, ...editorSettings },
      },
    })),

  setSyncScroll: (enabled) =>
    set((state) => ({
      settings: { ...state.settings, syncScroll: enabled },
    })),

  setAutoSave: (enabled) =>
    set((state) => ({
      settings: { ...state.settings, autoSave: enabled },
    })),

  setLocale: (locale) =>
    set((state) => ({
      settings: { ...state.settings, locale },
    })),

  setXHSExportSettings: (xhsSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        xhsExport: { ...state.settings.xhsExport, ...xhsSettings },
      },
    })),

  toggleToolbarGroup: (groupId) =>
    set((state) => {
      const currentGroups = state.settings.toolbar?.groups ?? defaultToolbarGroups
      const currentItems = state.settings.toolbar?.items ?? defaultToolbarItems
      return {
        settings: {
          ...state.settings,
          toolbar: {
            groups: currentGroups.map((group) =>
              group.id === groupId ? { ...group, visible: !group.visible } : group
            ),
            items: currentItems,
          },
        },
      }
    }),

  toggleToolbarGroupExpand: (groupId) =>
    set((state) => {
      const currentGroups = state.settings.toolbar?.groups ?? defaultToolbarGroups
      const currentItems = state.settings.toolbar?.items ?? defaultToolbarItems
      return {
        settings: {
          ...state.settings,
          toolbar: {
            groups: currentGroups.map((group) =>
              group.id === groupId ? { ...group, expanded: !group.expanded } : group
            ),
            items: currentItems,
          },
        },
      }
    }),

  setPinnedButtons: (buttons) =>
    set((state) => {
      // Update items: remove existing buttons and add new ones at the beginning
      const currentItems = state.settings.toolbar?.items ?? defaultToolbarItems
      const nonButtonItems = currentItems.filter(item => item.type !== 'button')
      const newButtonItems: ToolbarItem[] = buttons.map(id => ({ type: 'button' as const, id }))
      return {
        settings: {
          ...state.settings,
          toolbar: {
            groups: state.settings.toolbar?.groups ?? defaultToolbarGroups,
            items: [...newButtonItems, ...nonButtonItems],
          },
        },
      }
    }),

  setToolbarGroups: (groups) =>
    set((state) => ({
      settings: {
        ...state.settings,
        toolbar: {
          groups,
          items: state.settings.toolbar?.items ?? defaultToolbarItems,
        },
      },
    })),

  setToolbarItems: (items) =>
    set((state) => ({
      settings: {
        ...state.settings,
        toolbar: {
          groups: state.settings.toolbar?.groups ?? defaultToolbarGroups,
          items,
        },
      },
    })),

  resetSettings: () => set({ settings: defaultSettings }),
})