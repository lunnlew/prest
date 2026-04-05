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
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Set
          state.expandedFolders = new Set(state.expandedFolders as unknown as string[])

          // Ensure settings has complete structure (migration for old stored data)
          if (state.settings && !state.settings.toolbar) {
            state.settings.toolbar = {
              groups: defaultToolbarGroups,
              items: defaultToolbarItems,
            }
          }
          if (state.settings && state.settings.toolbar && !state.settings.toolbar.items) {
            // Migrate from old pinnedButtons to items
            state.settings.toolbar.items = defaultToolbarItems
          }
          if (state.settings && !state.settings.locale) {
            state.settings.locale = 'zh-CN'
          }
          if (state.settings && !state.settings.xhsExport) {
            state.settings.xhsExport = { ...defaultXHSExport }
          }
        }
      },
    }
  )
)