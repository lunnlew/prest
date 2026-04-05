export type Locale = 'en' | 'zh-CN'

export interface LocaleMessages {
  // Common
  common: {
    save: string
    cancel: string
    reset: string
    search: string
    loading: string
  }
  // Editor
  editor: {
    title: string
    bold: string
    italic: string
    strikethrough: string
    highlight: string
    code: string
    link: string
    image: string
    heading1: string
    heading2: string
    heading3: string
    bulletList: string
    orderedList: string
    taskList: string
    quote: string
    table: string
    horizontalRule: string
    alignLeft: string
    alignCenter: string
    alignRight: string
    undo: string
    redo: string
    toggleSidebar: string
    togglePreview: string
    lineNumber: string
    columnNumber: string
    words: string
    characters: string
    lines: string
    unsaved: string
    loadingEditor: string
  }
  // Toolbar
  toolbar: {
    headings: string
    textFormatting: string
    codeLinks: string
    lists: string
    blocks: string
    alignment: string
    tools: string
    expand: string
    collapse: string
    customize: string
    configTitle: string
    groupConfig: string
    addButton: string
    clickToToggle: string
    orderReorder: string
    resetDefault: string
    close: string
    show: string
    hide: string
    addGroup: string
    groupName: string
    deleteGroup: string
    moveUp: string
    moveDown: string
    noGroups: string
    buttonOrder: string
    xhsExport: string
  }
  // Sidebar
  sidebar: {
    files: string
    search: string
    outline: string
    settings: string
    noHeadings: string
    noResults: string
    resultsFound: string
  }
  // File Explorer
  fileExplorer: {
    newFile: string
    newFolder: string
    rename: string
    delete: string
    title: string
    newFileFolderHint: string
    untitledFile: string
    newFolderDefault: string
  }
  // Preview
  preview: {
    title: string
    toggleSyncScroll: string
  }
  // Settings
  settings: {
    title: string
    theme: string
    darkTheme: string
    lightTheme: string
    fontSize: string
    lineHeight: string
    fontFamily: string
    wordWrap: string
    syncScroll: string
    autoSave: string
    minimap: string
    on: string
    off: string
    saved: string
    unsaved: string
    language: string
    toolbarSettings: string
    pinnedButtons: string
    toolbarGroups: string
    toolbarOrder: string
    visible: string
  }
}

export const defaultLocale: Locale = 'zh-CN'

// 已加载的语言包缓存
const loadedLocales: Partial<Record<Locale, LocaleMessages>> = {}

// 动态加载语言包（Vite code-splitting：每个 JSON 是独立 chunk）
export async function loadLocale(locale: Locale): Promise<LocaleMessages> {
  // 如果已缓存，直接返回
  if (loadedLocales[locale]) {
    return loadedLocales[locale]
  }

  // 动态导入 JSON 文件
  const localeData = await import(`./data/${locale}.json`)
  loadedLocales[locale] = localeData.default as LocaleMessages
  return loadedLocales[locale]
}

// 同步获取已加载的语言包（用于已加载后的快速访问）
export function getLoadedLocale(locale: Locale): LocaleMessages | undefined {
  return loadedLocales[locale]
}

// 可用的语言列表
export const availableLocales: { code: Locale; name: string }[] = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en', name: 'English' },
]
