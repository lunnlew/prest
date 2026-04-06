import { StateCreator } from 'zustand'

export interface LayoutSlice {
  // State
  sidebarVisible: boolean
  previewVisible: boolean
  editorOnLeft: boolean  // true: editor left, preview right; false: preview left, editor right
  panelLayout: number[] // [sidebar%, editor%, preview%]
  editorPanelSize: number  // Editor panel size in percent
  previewPanelSize: number  // Preview panel size in percent
  activeSidebarTab: 'files' | 'search' | 'outline' | 'settings'

  // Actions
  toggleSidebar: () => void
  togglePreview: () => void
  toggleEditorPosition: () => void
  setSidebarVisible: (visible: boolean) => void
  setPreviewVisible: (visible: boolean) => void
  setPanelLayout: (layout: number[]) => void
  setEditorPanelSize: (size: number) => void
  setPreviewPanelSize: (size: number) => void
  setActiveSidebarTab: (tab: 'files' | 'search' | 'outline' | 'settings') => void
}

export const createLayoutSlice: StateCreator<LayoutSlice, [], [], LayoutSlice> = (set) => ({
  sidebarVisible: true,
  previewVisible: true,
  editorOnLeft: true,
  panelLayout: [20, 40, 40],
  editorPanelSize: 50,
  previewPanelSize: 50,
  activeSidebarTab: 'files',

  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
  togglePreview: () => set((state) => ({ previewVisible: !state.previewVisible })),
  toggleEditorPosition: () => set((state) => ({ editorOnLeft: !state.editorOnLeft })),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setPreviewVisible: (visible) => set({ previewVisible: visible }),
  setPanelLayout: (layout) => set({ panelLayout: layout }),
  setEditorPanelSize: (size) => set({ editorPanelSize: size }),
  setPreviewPanelSize: (size) => set({ previewPanelSize: size }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
})