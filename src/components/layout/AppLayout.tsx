import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useBoundStore } from '../../stores'
import { SidebarPanel } from './SidebarPanel'
import { EditorPanel } from './EditorPanel'
import { PreviewPanel } from './PreviewPanel'
import { ResizeHandle } from './ResizeHandle'

export function AppLayout() {
  const { panelLayout, sidebarVisible, previewVisible, setPanelLayout } = useBoundStore()

  const handleLayoutChange = (sizes: number[]) => {
    setPanelLayout(sizes)
  }

  return (
    <div className="h-full w-full bg-[var(--bg-primary)]">
      <PanelGroup
        direction="horizontal"
        autoSaveId="main-layout"
        onLayout={handleLayoutChange}
        className="h-full"
      >
        {/* Left Sidebar */}
        {sidebarVisible && (
          <Panel
            id="sidebar"
            defaultSize={panelLayout[0]}
            minSize={15}
            maxSize={35}
            className="bg-[var(--bg-secondary)]"
          >
            <SidebarPanel />
          </Panel>
        )}

        {/* Resize Handle between Sidebar and Editor */}
        {sidebarVisible && (
          <PanelResizeHandle id="sidebar-resize" className="w-1 hover:w-2 transition-all group">
            <ResizeHandle direction="vertical" />
          </PanelResizeHandle>
        )}

        {/* Center Editor + Right Preview */}
        <Panel id="main" defaultSize={sidebarVisible ? panelLayout[1] : 100} minSize={30}>
          <PanelGroup direction="horizontal" autoSaveId="editor-preview-layout" className="h-full">
            {/* Editor Panel */}
            <Panel
              id="editor"
              defaultSize={previewVisible ? 50 : 100}
              minSize={25}
              className="bg-[var(--bg-primary)]"
            >
              <EditorPanel />
            </Panel>

            {/* Resize Handle between Editor and Preview */}
            {previewVisible && (
              <PanelResizeHandle id="preview-resize" className="w-1 hover:w-2 transition-all group">
                <ResizeHandle direction="vertical" />
              </PanelResizeHandle>
            )}

            {/* Preview Panel */}
            {previewVisible && (
              <Panel
                id="preview"
                defaultSize={50}
                minSize={20}
                maxSize={60}
                className="bg-[var(--bg-secondary)]"
              >
                <PreviewPanel />
              </Panel>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}