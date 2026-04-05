import { useEffect, useRef } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { useBoundStore } from './stores/useBoundStore'

function App() {
  const theme = useBoundStore((state) => state.settings.theme)
  const save = useBoundStore((state) => state.save)
  const autoSave = useBoundStore((state) => state.settings.autoSave)
  const content = useBoundStore((state) => state.content)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load files from IndexedDB on mount
  const loadFilesIntoDB = useBoundStore((state) => state.loadFilesIntoDB)
  useEffect(() => {
    loadFilesIntoDB()
  }, [loadFilesIntoDB])

  useEffect(() => {
    // Apply theme class to html element
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(theme)
  }, [theme])

  // Auto-save: debounce and clear isDirty marker
  useEffect(() => {
    if (!autoSave) return

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // Debounce 1s before marking as saved
    saveTimerRef.current = setTimeout(() => {
      save()
      saveTimerRef.current = null
    }, 1000)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [content, autoSave, save])

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AppLayout />
    </div>
  )
}

export default App
