import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { useBoundStore } from './stores/useBoundStore'

function App() {
  const theme = useBoundStore((state) => state.settings.theme)

  useEffect(() => {
    // Apply theme class to html element
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(theme)
  }, [theme])

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AppLayout />
    </div>
  )
}

export default App