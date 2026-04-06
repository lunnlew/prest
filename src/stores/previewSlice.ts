import { StateCreator } from 'zustand'
import { LayoutResult, PlatformPreviewId } from '../types'

export interface PreviewSlice {
  // State
  scrollPosition: number
  editorScrollRatio: number  // Editor scroll position ratio (0-1)
  editorVisibleTopLine: number  // Editor visible top line for outline sync
  layoutResults: Map<string, LayoutResult>
  previewWidth: number
  platformPreview: PlatformPreviewId

  // Actions
  setScrollPosition: (position: number) => void
  setEditorScrollRatio: (ratio: number) => void
  setEditorVisibleTopLine: (line: number) => void
  updateLayoutResult: (key: string, result: LayoutResult) => void
  setPreviewWidth: (width: number) => void
  clearLayoutResults: () => void
  setPlatformPreview: (mode: PlatformPreviewId) => void
  togglePlatformPreview: () => void
}

export const createPreviewSlice: StateCreator<PreviewSlice, [], [], PreviewSlice> = (set, get) => ({
  scrollPosition: 0,
  editorScrollRatio: 0,
  editorVisibleTopLine: 1,
  layoutResults: new Map(),
  previewWidth: 400,
  platformPreview: 'default',

  setScrollPosition: (position) => set({ scrollPosition: position }),

  setEditorScrollRatio: (ratio) => set({ editorScrollRatio: ratio }),

  setEditorVisibleTopLine: (line) => set({ editorVisibleTopLine: line }),

  updateLayoutResult: (key, result) => {
    const results = new Map(get().layoutResults)
    results.set(key, result)
    set({ layoutResults: results })
  },

  setPreviewWidth: (width) => set({ previewWidth: width }),

  clearLayoutResults: () => set({ layoutResults: new Map() }),

  setPlatformPreview: (mode) => set({ platformPreview: mode }),
  togglePlatformPreview: () => set((state) => ({
    platformPreview: state.platformPreview === 'default' ? 'xiaohongshu' : 'default',
  })),
})