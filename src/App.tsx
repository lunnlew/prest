import { useEffect, useRef, useCallback, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { useBoundStore } from './stores/useBoundStore'
import { KeyboardShortcutsDialog } from './components/editor/KeyboardShortcutsDialog'

function App() {
  const theme = useBoundStore((state) => state.settings.theme)
  const save = useBoundStore((state) => state.save)
  const autoSave = useBoundStore((state) => state.settings.autoSave)
  const content = useBoundStore((state) => state.content)
  const currentFile = useBoundStore((state) => state.currentFile)
  const saveFileContent = useBoundStore((state) => state.saveFileContent)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

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
      // F1 - Open keyboard shortcuts dialog
      if (e.key === 'F1') {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }
    // Use capture phase to intercept before Monaco editor
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [handleSave])

  // Listen for custom event to open shortcuts dialog (from SettingsPanel)
  useEffect(() => {
    const handleOpenShortcuts = () => setShowShortcuts(true)
    window.addEventListener('open-shortcuts-dialog', handleOpenShortcuts)
    return () => window.removeEventListener('open-shortcuts-dialog', handleOpenShortcuts)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AppLayout />
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}

export default App
