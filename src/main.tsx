import React from 'react'
import ReactDOM from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import App from './App'
import './styles/globals.css'
import { loadLocale, availableLocales } from './locales'

loader.config({ monaco })

self.MonacoEnvironment = {
  getWorker: () => {
    return new Worker(
      new URL('./workers/monaco-editor-worker?worker', import.meta.url),
      { type: 'module', name: 'monaco-editor-worker' }
    )
  },
}

// 预加载所有语言包，确保切换时不需要异步加载
// 默认语言优先加载，确保首次渲染时即有对应语言文案
Promise.all(availableLocales.map(({ code }) => loadLocale(code))).catch(() => {})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
