import { useBoundStore } from '../stores'

export function useImportFile() {
  const { setContent } = useBoundStore()

  const importFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        setContent(text)
      } catch (error) {
        console.error('Failed to import file:', error)
      }
    }

    input.click()
  }

  return { importFile }
}

export function importFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.markdown,.txt'

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const store = useBoundStore.getState()
      store.setContent(text)
    } catch (error) {
      console.error('Failed to import file:', error)
    }
  }

  input.click()
}
