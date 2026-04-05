import { StateCreator } from 'zustand'
import { LayoutResult, PlatformPreviewId } from '../types'

export interface PreviewSlice {
  // State
  scrollPosition: number
  syncScroll: boolean
  layoutResults: Map<string, LayoutResult>
  previewWidth: number
  platformPreview: PlatformPreviewId

  // Actions
  setScrollPosition: (position: number) => void
  toggleSyncScroll: () => void
  setSyncScroll: (enabled: boolean) => void
  updateLayoutResult: (key: string, result: LayoutResult) => void
  setPreviewWidth: (width: number) => void
  clearLayoutResults: () => void
  setPlatformPreview: (mode: PlatformPreviewId) => void
  togglePlatformPreview: () => void
}

export const createPreviewSlice: StateCreator<PreviewSlice, [], [], PreviewSlice> = (set, get) => ({
  scrollPosition: 0,
  syncScroll: true,
  layoutResults: new Map(),
  previewWidth: 400,
  platformPreview: 'default',

  setScrollPosition: (position) => set({ scrollPosition: position }),

  toggleSyncScroll: () => set((state) => ({ syncScroll: !state.syncScroll })),

  setSyncScroll: (enabled) => set({ syncScroll: enabled }),

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