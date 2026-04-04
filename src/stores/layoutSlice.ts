import { StateCreator } from 'zustand'

export interface LayoutSlice {
  // State
  sidebarVisible: boolean
  previewVisible: boolean
  panelLayout: number[] // [sidebar%, editor%, preview%]
  activeSidebarTab: 'files' | 'search' | 'outline' | 'settings'

  // Actions
  toggleSidebar: () => void
  togglePreview: () => void
  setSidebarVisible: (visible: boolean) => void
  setPreviewVisible: (visible: boolean) => void
  setPanelLayout: (layout: number[]) => void
  setActiveSidebarTab: (tab: 'files' | 'search' | 'outline' | 'settings') => void
}

export const createLayoutSlice: StateCreator<LayoutSlice, [], [], LayoutSlice> = (set) => ({
  sidebarVisible: true,
  previewVisible: true,
  panelLayout: [20, 40, 40],
  activeSidebarTab: 'files',

  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
  togglePreview: () => set((state) => ({ previewVisible: !state.previewVisible })),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setPreviewVisible: (visible) => set({ previewVisible: visible }),
  setPanelLayout: (layout) => set({ panelLayout: layout }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
})