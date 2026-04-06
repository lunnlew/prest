import { useEffect, useRef, useCallback } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { useBoundStore } from './stores/useBoundStore'

function App() {
  const theme = useBoundStore((state) => state.settings.theme)
  const save = useBoundStore((state) => state.save)
  const autoSave = useBoundStore((state) => state.settings.autoSave)
  const content = useBoundStore((state) => state.content)
  const currentFile = useBoundStore((state) => state.currentFile)
  const saveFileContent = useBoundStore((state) => state.saveFileContent)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load files from IndexedDB on mount
  const loadFilesFromDB = useBoundStore((state) => state.loadFilesFromDB)
  useEffect(() => {
    loadFilesFromDB()
  }, [loadFilesFromDB])

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('light', 'dark', 'blue', 'purple', 'green')
    html.classList.add(theme)
  }, [theme])

  // Auto-save: debounce and clear isDirty marker
  useEffect(() => {
    if (!autoSave) return

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      if (currentFile) {
        saveFileContent(currentFile, content)
      }
      save()
      saveTimerRef.current = null
    }, 1000)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [content, autoSave, save, currentFile, saveFileContent])

  // Ctrl+S / Cmd+S — save current file content
  const handleSave = useCallback(() => {
    if (currentFile) {
      saveFileContent(currentFile, content)
    }
    save()
  }, [currentFile, content, saveFileContent, save])

  // Save before leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSave && currentFile) {
        saveFileContent(currentFile, content)
        save()
      }
      // For dirty state without autoSave, show warning
      const isDirty = useBoundStore.getState().isDirty
      if (isDirty && !autoSave) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [autoSave, currentFile, content, saveFileContent, save])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleSave])

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AppLayout />
    </div>
  )
}

export default App
