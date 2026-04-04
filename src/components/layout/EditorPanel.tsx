import { MonacoEditor } from '../editor/MonacoEditor'
import { EditorToolbar } from '../editor/EditorToolbar'
import { EditorStatusBar } from '../editor/EditorStatusBar'

export function EditorPanel() {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor />
      </div>

      {/* Status Bar */}
      <EditorStatusBar />
    </div>
  )
}