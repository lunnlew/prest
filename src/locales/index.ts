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
    underline: string
    strikethrough: string
    highlight: string
    subscript: string
    superscript: string
    code: string
    codeBlock: string
    link: string
    image: string
    heading1: string
    heading2: string
    heading3: string
    heading4: string
    heading5: string
    heading6: string
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
    collapseSidebar: string
    expandSidebar: string
    togglePreview: string
    swapToRight: string
    swapToLeft: string
    lineNumber: string
    columnNumber: string
    words: string
    characters: string
    lines: string
    unsaved: string
    loadingEditor: string
    math: string
    emoji: string
    footnote: string
    definitionList: string
    fontColor: string
    fontBackground: string
    importFile: string
    exportHtml: string
    exportPdf: string
    copyWechat: string
    copyWeibo: string
    focusMode: string
    typewriterMode: string
    fullscreen: string
    enableFocusMode: string
    disableFocusMode: string
    enableTypewriterMode: string
    disableTypewriterMode: string
  }
  // Toolbar
  toolbar: {
    basic: string
    headings: string
    lists: string
    insert: string
    blocks: string
    alignment: string
    advanced: string
    file: string
    tools: string
    view: string
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
    document: string
    xiaohongshu: string
    togglePreviewStyle: string
  }
  // XHS Export
  xhsExport: {
    title: string
    size: string
    width: string
    template: string
    watermarkSettings: string
    watermarkText: string
    watermarkTextPlaceholder: string
    position: string
    show: string
    opacity: string
    pageNumber: string
    showPageNumber: string
    calculating: string
    pages: string
    preparing: string
    processing: string
    downloading: string
    generatingPdf: string
    addingPage: string
    noPagesToExport: string
    exportComplete: string
    exportFailed: string
    exporting: string
    export: string
    aspectPortrait35: string
    aspectPortrait34: string
    aspectSquare: string
    aspectLandscape: string
    watermarkTopLeft: string
    watermarkTopCenter: string
    watermarkTopRight: string
    watermarkBottomLeft: string
    watermarkBottomCenter: string
    watermarkBottomRight: string
    watermarkDiagonal: string
    watermarkAll: string
    watermarkFirst: string
    watermarkLast: string
    watermarkNone: string
    watermarkSmall: string
    watermarkMedium: string
    watermarkLarge: string
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
