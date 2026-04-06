import { MonacoEditor } from '../editor/MonacoEditor'
import { EditorToolbar } from '../editor/EditorToolbar'
import { EditorStatusBar } from '../editor/EditorStatusBar'
import { AIChatPanel } from '../editor/AIChatPanel'

export function EditorPanel() {
  return (
    <div className="flex flex-col h-full relative">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor />
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel />

      {/* Status Bar */}
      <EditorStatusBar />
    </div>
  )
}