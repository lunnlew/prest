import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createEditorSlice, EditorSlice } from './editorSlice'
import { createPreviewSlice, PreviewSlice } from './previewSlice'
import { createLayoutSlice, LayoutSlice } from './layoutSlice'
import { createSidebarSlice, SidebarSlice } from './sidebarSlice'
import { createSettingsSlice, SettingsSlice, defaultToolbarGroups, defaultToolbarItems, defaultXHSExport } from './settingsSlice'

export type AppStore = EditorSlice & PreviewSlice & LayoutSlice & SidebarSlice & SettingsSlice

export const useBoundStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createEditorSlice(...args),
      ...createPreviewSlice(...args),
      ...createLayoutSlice(...args),
      ...createSidebarSlice(...args),
      ...createSettingsSlice(...args),
    }),
    {
      name: 'prest-storage',
      partialize: (state) => ({
        content: state.content,
        currentFile: state.currentFile,
        panelLayout: state.panelLayout,
        settings: state.settings,
        sidebarVisible: state.sidebarVisible,
        previewVisible: state.previewVisible,
        expandedFolders: Array.from(state.expandedFolders),
        platformPreview: state.platformPreview,
        activeSidebarTab: state.activeSidebarTab,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Set
          state.expandedFolders = new Set(state.expandedFolders as unknown as string[])

          // Ensure settings has complete structure (migration for old stored data)
          if (!state.settings) {
            state.settings = {
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
          } else {
            // Ensure editor settings
            if (!state.settings.editor) {
              state.settings.editor = {
                fontSize: 14,
                lineHeight: 22,
                fontFamily: 'JetBrains Mono, Consolas, monospace',
                wordWrap: true,
                minimap: false,
              }
            }
            // Migrate toolbar separately to ensure proper structure
            if (!state.settings.toolbar) {
              state.settings.toolbar = {
                groups: defaultToolbarGroups,
                items: defaultToolbarItems,
              }
            }
            if (!state.settings.toolbar.groups || state.settings.toolbar.groups.length === 0) {
              state.settings.toolbar.groups = defaultToolbarGroups
            }
            if (!state.settings.toolbar.items || state.settings.toolbar.items.length === 0) {
              state.settings.toolbar.items = defaultToolbarItems
            }
            if (!state.settings.locale) {
              state.settings.locale = 'zh-CN'
            }
            if (!state.settings.xhsExport) {
              state.settings.xhsExport = { ...defaultXHSExport }
            }
          }
        }
      },
    }
  )
)