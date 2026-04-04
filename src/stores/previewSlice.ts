import { StateCreator } from 'zustand'
import { LayoutResult } from '../types'

export interface PreviewSlice {
  // State
  scrollPosition: number
  syncScroll: boolean
  layoutResults: Map<string, LayoutResult>
  previewWidth: number

  // Actions
  setScrollPosition: (position: number) => void
  toggleSyncScroll: () => void
  setSyncScroll: (enabled: boolean) => void
  updateLayoutResult: (key: string, result: LayoutResult) => void
  setPreviewWidth: (width: number) => void
  clearLayoutResults: () => void
}

export const createPreviewSlice: StateCreator<PreviewSlice, [], [], PreviewSlice> = (set, get) => ({
  scrollPosition: 0,
  syncScroll: true,
  layoutResults: new Map(),
  previewWidth: 400,

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
})